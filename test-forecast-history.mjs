import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
import {forecastStamp,forecastReceipt} from './dist/forecast-receipt.js';
const dir=mkdtempSync(path.join(tmpdir(),'forecast-history-')),local=createLocalEnvironment(process.cwd(),dir),originalFetch=fetch,originalNow=Date.now;
let now=Date.parse('2026-09-17T08:10:00Z'),calls=0,broken=false;
Date.now=()=>now;
let source={timezone:'Europe/Rome',current:{temperature_2m:18,weather_code:0},hourly:{time:['2026-09-17T09:00','2026-09-17T11:00','2026-09-17T14:00'],temperature_2m:[17,19,23],precipitation_probability:[0,0,20],precipitation:[0,0,0],weather_code:[0,0,0]}};
globalThis.fetch=async()=>{calls++;if(broken)throw Error('offline');return new Response(JSON.stringify(source))};
const call=async (suffix='',env=local.env,method='GET')=>{const r=await worker.fetch(new Request('https://preview.invalid/api/forecast'+suffix,{method}),env);return {status:r.status,body:await r.json()}};
try{
 const first=(await call('?lat=42.95&lon=13.88')).body;assert.equal(first._provenance.status,'saved');assert.equal(first._provenance.modelIssuedAt,null);assert.equal(first._loadedAt,now);
 const id=first._provenance.id;await call('?lat=42.95&lon=13.88');assert.equal(calls,1);
 now+=16*60000;source.current.temperature_2m=19;source.hourly.temperature_2m[0]=99;source.hourly.weather_code[2]=61;
 const second=(await call('?lat=42.95&lon=13.88')).body;assert.equal(second._provenance.changes.length,1,'past valid hour excluded');assert.equal(second._provenance.changes[0].time,'2026-09-17T14:00');assert.equal(second._provenance.previousId,id);assert.equal(second._provenance.lastChange.previousCapturedAt,first._loadedAt);
 assert.equal((await call('/snapshot?id='+id)).body.data.hourly.weather_code[2],0,'saved copy never overwritten');
 now+=16*60000;source.current.temperature_2m=20;const third=(await call('?lat=42.95&lon=13.88')).body;assert.equal(third._provenance.changes.length,0,'changing current weather is not a revised forecast');assert.equal(third._provenance.lastChange.id,second._provenance.id);
 now+=16*60000;broken=true;const stale=(await call('?lat=42.95&lon=13.88')).body;assert.equal(stale._offline,true);assert.equal(stale._loadedAt,third._loadedAt);
 assert.equal((await call('/history?lat=42.95&lon=13.88')).body.copies.length,3);
 assert.equal((await call('?lat=NaN&lon=13')).status,400);assert.equal((await call('?lat=42&lon=13',local.env,'POST')).status,405);
 broken=false;const before=calls;await Promise.all([call('?lat=43&lon=14'),call('?lat=43&lon=14')]);assert.equal(calls,before+1,'concurrent acquisition shared');
 const failedDB={...local.env,DB:{prepare(){throw Error('storage down')}}};const missing=(await call('?lat=44&lon=15',failedDB)).body;assert.equal(missing._provenance.status,'unavailable');assert.match(forecastReceipt(missing),/Cronologia online non disponibile/);
 for(let i=0;i<21;i++){now+=16*60000;await call('?lat=42.95&lon=13.88')}
 const page=(await call('/history?lat=42.95&lon=13.88')).body;assert.equal(page.copies.length,20);assert.ok(page.next);assert.equal((await call('/history?lat=42.95&lon=13.88&before='+page.next)).body.copies.length,4);
 const sandbox={Intl,Date,Map,URLSearchParams};vm.createContext(sandbox);vm.runInContext(readFileSync('server/forecast-history.js','utf8'),sandbox);
 const duplicate={timezone:'Europe/Rome',hourly:{time:['2026-10-25T02:00','2026-10-25T02:00'],temperature_2m:[1,2]}};
 assert.equal(sandbox.forecastChanges(duplicate,{...duplicate,hourly:{...duplicate.hourly,temperature_2m:[3,4]}},Date.parse('2026-10-24T22:00Z')).length,0,'ambiguous DST valid hours excluded');
 assert.match(forecastStamp(first),/acquisita/);assert.doesNotMatch(forecastReceipt(first),/emessa/);assert.match(forecastReceipt({...second,_provenance:{...second._provenance,lastChange:{...second._provenance.lastChange,changes:[{time:'<script>',fields:['temperature_2m'],before:{temperature_2m:1},after:{temperature_2m:2}}]}}}),/&lt;script&gt;/);
 console.log('PASS: immutable copies, timestamp/cache, future-hour comparisons, stale fallback, validation, concurrency, unavailable storage, pagination, DST, honest labels and escaping.');
}finally{globalThis.fetch=originalFetch;Date.now=originalNow;local.close();rmSync(dir,{recursive:true,force:true})}
