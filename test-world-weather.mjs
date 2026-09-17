import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
import {sampleExtremes,interestingPoint,precipitationSamples,precipitationTexture} from './dist/world-weather.js';
const dir=mkdtempSync(path.join(tmpdir(),'world-weather-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
const original=globalThis.fetch,nativeNow=Date.now;let now=Date.parse('2026-09-16T12:00Z'),calls=0,offline=false;Date.now=()=>now;
globalThis.fetch=async input=>{calls++;if(offline)throw Error('offline');const url=new URL(input);if(url.hostname==='api.open-meteo.com'){const lat=url.searchParams.get('latitude').split(',');return Response.json(lat.map((n,i)=>({current:{time:new Date(now).toISOString(),temperature_2m:i===0?0:i,weather_code:61,precipitation:i%2?2:0,snowfall:i%7===0?1:0}})))}if(url.hostname==='eonet.gsfc.nasa.gov')return Response.json({events:[{id:'EONET_test',title:'Test source only',closed:null,categories:[{id:'severeStorms'}],geometry:[null,{type:'Point',date:new Date(now-12*86400000).toISOString(),coordinates:[20,40]},{type:'Point',date:new Date(now-3600000).toISOString(),coordinates:[21,41]}]}]});throw Error('unexpected endpoint')};
const get=async p=>{const r=await worker.fetch(new Request('https://preview.invalid/api/atlas/'+p),env);return {status:r.status,data:await r.json()}};
try{
 const a=await get('world');assert.equal(a.status,200);assert.equal(a.data.cities.length,200);assert.equal(new Set(a.data.cities.map(c=>c.id)).size,200);assert.equal(a.data.stale,false);assert.equal(calls,4);
 const b=await get('world');assert.equal(b.data.updated,a.data.updated);assert.equal(calls,4,'persistent fresh snapshot prevents new calls');
 now+=16*60000;offline=true;const stale=await get('world');assert.equal(stale.status,200);assert.equal(stale.data.stale,true);assert.equal(stale.data.updated,a.data.updated,'failed refresh never resets source time');assert.equal(calls,8);await get('world');assert.equal(calls,8,'failed source retries are bounded');
 now+=61000;offline=false;const fresh=await get('world');assert.equal(fresh.data.stale,false);assert.equal(fresh.data.updated,now);
 const e=await get('events');assert.equal(e.data.events.length,1);assert.equal(e.data.events[0].started,now-12*86400000);assert.equal(e.data.events[0].latitude,41);assert.equal(e.data.events[0].catalogAt,now);
 now+=16*60000;offline=true;const savedEvents=await get('events');assert.equal(savedEvents.data.stale,true);assert.equal(savedEvents.data.events[0].at,e.data.events[0].at);
 const rows=[{id:'a',category:'weather',latitude:0,longitude:179.9,at:now,current:{temperature_2m:0,precipitation:2,snowfall:0}},{id:'b',category:'weather',latitude:20,longitude:-100,at:now,current:{temperature_2m:-4,precipitation:0,snowfall:1}},{id:'missing',category:'weather',at:now,current:{temperature_2m:null}}];
 assert.equal(sampleExtremes(rows).hot.id,'a');assert.equal(sampleExtremes(rows).cold.id,'b');assert.equal(sampleExtremes(rows).count,2);assert.equal(sampleExtremes([]),null);
 assert.equal(precipitationSamples(rows).length,2);assert.equal(precipitationSamples(rows)[1].snow,true);
 assert.equal(interestingPoint(rows,now).id,'a');assert.equal(interestingPoint([{id:'event',category:'event',at:now-1000},...rows],now).id,'event');assert.equal(interestingPoint([{id:'stale',category:'event',at:now-1000,stale:true}],now),null);assert.equal(interestingPoint([{id:'old',category:'event',at:now-8*86400000}],now),null);
 const translations=[],context=new Proxy({translate:(...v)=>translations.push(v),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});precipitationTexture({width:1024,height:512,getContext:()=>context},rows);assert.equal(translations.length,6);assert.ok(translations.some(([x])=>x<0)&&translations.some(([x])=>x>1024),'texture wraps the antimeridian');
 console.log('World: 200 named locations, zero/missing temperatures, persistent 15-minute cache, bounded outage retries, stale timestamps, NASA first/latest dates, selection freshness, snow/rain texture and antimeridian passed.');
}finally{globalThis.fetch=original;Date.now=nativeNow;local.close();rmSync(dir,{recursive:true,force:true})}
