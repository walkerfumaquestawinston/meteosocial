import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
import {CITIES} from './dist/places.js';
const originalFetch=globalThis.fetch;
let calls=0;
try{
 for(const cache of [undefined,{get default(){throw Error('This Worker is not permitted to access the default cache.')}},{default:{async match(){throw Error('read failed')},async put(){throw Error('write failed')}}},{default:{async match(){return undefined},async put(){throw Error('write failed')}}}]){
  globalThis.caches=cache;
  globalThis.fetch=async url=>{calls++;return Response.json(String(url).includes('eonet')?{events:[]}:CITIES.map(()=>({current:{temperature_2m:18}})))};
  for(const route of ['cities','events']){const before=calls,r=await worker.fetch(new Request('https://test.invalid/api/atlas/'+route),{});assert.equal(r.status,200);assert.equal(calls,before+1);const data=await r.json();assert.equal(data.source,route==='cities'?'Open-Meteo':'NASA EONET')}
 }
 globalThis.fetch=async()=>new Response('',{status:503});
 assert.equal((await worker.fetch(new Request('https://test.invalid/api/atlas/cities'),{})).status,503);
 console.log('9 cache resilience scenarios passed: denied getter/read/write and unavailable upstream');
}finally{globalThis.fetch=originalFetch;delete globalThis.caches}
