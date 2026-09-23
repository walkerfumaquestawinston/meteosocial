import assert from 'node:assert/strict';
import {nextChange,nextChangeHTML} from './dist/next-change.js';
const now=new Date('2026-09-22T08:15:00Z');
const fixture=()=>({timezone:'Europe/Rome',current:{time:'2026-09-22T10:15',temperature_2m:20,wind_speed_10m:10,weather_code:1},hourly:{time:Array.from({length:6},(_,i)=>`2026-09-22T${11+i}:00`),temperature_2m:[20,21,22,22,21,20],wind_speed_10m:[10,10,10,10,10,10],weather_code:[1,1,1,1,1,1],precipitation_probability:[0,10,10,0,0,0]}});
let w=fixture();assert.equal(nextChange(w,now).status,'ready');assert.equal(nextChange(w,now).event,undefined);
w.hourly.weather_code[2]=61;assert.equal(nextChange(w,now).event.row.time,'2026-09-22T13:00');assert.match(nextChange(w,now).title,/precipitazioni/);
w=fixture();w.current.weather_code=61;assert.match(nextChange(w,now).title,/pausa/);
w=fixture();w.hourly.weather_code[1]=95;assert.match(nextChange(w,now).title,/Temporali/);
w=fixture();w.hourly.wind_speed_10m[1]=31;assert.match(nextChange(w,now).title,/vento/);
w=fixture();w.hourly.temperature_2m[1]=15;assert.match(nextChange(w,now).title,/fresca/);
for(const patch of [{_offline:true},{_loadedAt:now.getTime()-91*60000},{_provenance:{capturedAt:now.getTime()-91*60000}}]){assert.equal(nextChange({...fixture(),...patch},now).status,'stale');assert.equal(nextChange({...fixture(),...patch},now).rows.length,0)}
w=fixture();w.current.time='2026-09-21T10:00';assert.equal(nextChange(w,now).status,'stale');
for(const field of ['temperature_2m','weather_code','wind_speed_10m','precipitation_probability']){w=fixture();w.hourly[field][1]=null;assert.equal(nextChange(w,now).status,'partial')}
w=fixture();w.hourly.precipitation_probability[1]=101;assert.equal(nextChange(w,now).status,'partial');
w=fixture();w.hourly.time[2]='2026-09-22T18:00';assert.equal(nextChange(w,now).status,'partial');
w=fixture();w.timezone='Invalid';assert.equal(nextChange(w,now).status,'missing');assert.equal(nextChange(null,now).status,'missing');
// Another city uses its own clock even when the device is in Italy.
w=fixture();w.timezone='Asia/Tokyo';w.current.time='2026-09-22T17:15';w.hourly.time=Array.from({length:6},(_,i)=>`2026-09-22T${18+i}:00`);assert.equal(nextChange(w,now).status,'ready');
const midnight=new Date('2026-09-22T21:15:00Z');w=fixture();w.current.time='2026-09-22T23:15';w.hourly.time=Array.from({length:6},(_,i)=>`2026-09-23T0${i}:00`);assert.equal(nextChange(w,midnight).status,'ready');assert.match(nextChangeHTML(w,midnight),/00:00 · 23\/09/);
w=fixture();w.hourly.time[0]='<img onerror=alert(1)>';assert.ok(!nextChangeHTML(w,now).includes('<img'));
assert.match(nextChangeHTML(fixture(),now),/previsioni orarie, non osservazioni/);
assert.equal((nextChangeHTML(fixture(),now).match(/<li /g)||[]).length,6);
console.log('Next change: thresholds, missing/stale data, timezone, midnight and safe rendering OK');
