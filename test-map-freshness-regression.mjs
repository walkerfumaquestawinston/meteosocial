import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {weatherPoints} from './dist/map-weather-core.js';
import {weatherAge,cityCatalog} from './dist/map-city-labels.js';
const now=Date.parse('2026-09-22T06:00Z');
const rome={name:'Roma',latitude:41.9,longitude:12.5,current:{temperature_2m:23,time:'2026-09-22T05:45'}};
const towns=[['058091','Roma','RM',41.9,12.5]];
const old=new Map([['058091',['058091',19,0,0,4,17,900,'2026-09-22T03:15',0]]]);
assert.equal(weatherPoints([rome],towns,old,null)[0].current.temperature_2m,23,'fresh world reading wins over two-hour-old Italian cache');
assert.equal(weatherPoints([rome],towns,old,{...rome,current:{temperature_2m:20,time:'2026-09-22T05:30'}})[0].current.temperature_2m,23);
assert.equal(cityCatalog([rome],[],[],{...rome,current:{temperature_2m:20,time:'2026-09-22T05:30'}})[0].current.temperature_2m,23,'selected label cannot reintroduce an older value');
assert.equal(weatherAge({time:'2026-09-22T05:29'},now).stale,true);
assert.equal(weatherAge({time:'2026-09-22T05:45'},now).stale,false);
assert.equal(weatherAge({time:'2026-09-22T06:30'},now).stale,true);
assert.equal(weatherAge(null,now).stale,true);
const catalog=Array.from({length:500},(_,i)=>[String(i+1).padStart(6,'0'),'City '+i,'AA','XX',40+i/1000,12,1000-i]);
const urls=[];const keys=[];
const api=vm.runInNewContext(fs.readFileSync('server/mappa.js','utf8')+';({mappaMeteoApi})',{
 MAPPA_COMUNI:catalog,URLSearchParams,Response,Date,fail:(code,msg)=>{throw Error(msg)},q:()=>({run:async()=>{}}),
 globeSnapshot:async(env,key,fn)=>{keys.push(key);return fn();},
 atmoFetch:async url=>{urls.push(url);return new URL(url).searchParams.get('latitude').split(',').map(()=>({current:{temperature_2m:22,time:'2026-09-22T05:45',interval:900}}));}
});
const get=async query=>api.mappaMeteoApi(new Request('https://example.test/api/mappa/meteo'+query),{DB:{}},new URL('https://example.test/api/mappa/meteo'+query));
let r=await get('?ids=000002,000001,000002');assert.equal(r.status,200);
const data=await r.json();assert.equal(data.dati.length,2);assert.equal(urls.length,1);
assert.equal(new URL(urls[0]).searchParams.get('latitude').split(',').length,2,'load requested points, not 500 places');
assert.equal(new URL(urls[0]).searchParams.get('forecast_days'),'1');
assert.equal(keys[0],'mappa-view-v1:000001,000002');
assert.equal((await get('?ids=')).status,200);assert.equal(urls.length,1,'empty viewport never fetches weather');
assert.equal((await get('?ids=999999')).status,400);
assert.equal((await get('?ids='+catalog.slice(0,25).map(r=>r[0]).join(','))).status,400);
assert.equal((await get('?ids=../../bad')).status,400);
console.log('Freshness regression: newer data wins; old/future/absent times rejected; scoped endpoint limits and no whole-Italy fetch passed.');
