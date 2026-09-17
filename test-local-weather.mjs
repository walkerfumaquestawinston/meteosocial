import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
import {highPollen,localSea,localSnow,LOCAL_POLLEN} from './dist/local-weather-rules.js';
const dir=mkdtempSync(path.join(tmpdir(),'local-weather-')),local=createLocalEnvironment(process.cwd(),dir),originalFetch=fetch,originalNow=Date.now;let now=Date.parse('2026-11-16T12:10:00Z'),calls=0;Date.now=()=>now;
const time=Math.floor(now/3600000)*3600;
const data={elevation:1000,hourly:{time:[time,time+3600],wave_height:[.2,2.6],wave_period:[4,5],wave_direction:[90,95],sea_surface_temperature:[18,null],snowfall_height:[900,1000],precipitation:[1,0],...Object.fromEntries(LOCAL_POLLEN.map(([key,,limit])=>[key,[limit,limit+1]]))}};
globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(data))};
const call=async url=>{const r=await worker.fetch(new Request('https://preview.invalid/api/local-weather/'+url),local.env);return {status:r.status,body:await r.json()}};
try{
 assert.equal(highPollen(data,now).length,0,'boundary excluded');assert.equal(highPollen(data,now+3600000).length,6);
 assert.equal(localSea(data,now).height,.2);assert.equal(localSea(data,now).rough.height,2.6);
 assert.equal(localSea({...data,hourly:{...data.hourly,wave_height:[null,null]}},now),null);
 assert.equal(localSnow(data,now).height,900);assert.equal(localSnow({...data,hourly:{...data.hourly,snowfall_height:[null,null]}},now),null);
 assert.equal(localSnow(data,Date.parse('2026-09-16T12:10:00Z')),null);
 const sea=await call('sea?lat=42.95&lon=13.88');assert.equal(sea.status,200);assert.equal(sea.body.status,'available');assert.ok(sea.body.distanceKm<15);
 const before=calls;await call('sea?lat=42.95&lon=13.88');assert.equal(calls,before,'shared cache');
 assert.equal((await call('sea?lat=45.46&lon=9.19')).body.status,'inland');assert.equal(calls,before,'inland does not request marine model');
 assert.equal((await call('sea?lat=40.71&lon=-74')).body.status,'outside-coverage');
 assert.equal((await call('snow?lat=42.95&lon=13.88')).body.data.hourly.snowfall_height[0],900);
 now=Date.parse('2026-09-16T12:10:00Z');assert.equal((await call('snow?lat=42.95&lon=13.88')).body.status,'out-of-season');
 assert.equal((await call('pollen?lat=NaN&lon=13')).status,400);assert.equal((await call('pollen?lon=13')).status,400);
 console.log('Local weather passed: source thresholds, nulls, coastal distance/cache, inland suppression, season, true snow altitude and invalid coordinates.');
}finally{Date.now=originalNow;globalThis.fetch=originalFetch;local.close();rmSync(dir,{recursive:true,force:true})}
