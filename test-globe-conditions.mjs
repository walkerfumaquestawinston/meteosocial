import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {weatherRecord,hailRecords,eventRecords,alertRecord,filteredRecords,markerPayload,conditionDetail,windArrow,modelTime,validSource,createGlobeConditions} from './dist/globe-conditions.js';
let checks=0;const check=(value,label)=>{assert.ok(value,label);checks++};
const now=Date.now(),iso=new Date(now).toISOString(),place={name:'Roma',latitude:41.9,longitude:12.5};
const current={time:iso,temperature_2m:18.2,weather_code:61,precipitation:2,snowfall:0,wind_speed_10m:23,wind_direction_10m:270,cloud_cover:90};
const weather=weatherRecord({...place,current},now);
check(weather?.kind==='rain'&&weather.at===now,'fresh modeled precipitation is geolocated');
check(!weatherRecord({...place,current:{...current,time:new Date(now-4*3600000).toISOString()}},now),'old weather cannot look current');
check(!weatherRecord({...place,latitude:999,current},now),'invalid coordinates excluded');
check(modelTime('2026-09-15T10:00',7200)===Date.parse('2026-09-15T08:00Z'),'local model time converted to UTC');
check(windArrow(270)==='→'&&windArrow(0)==='↓','meteorological wind direction points downwind');
check(filteredRecords([weather],'rain').length===1&&filteredRecords([weather],'hail').length===0,'precipitation never becomes confirmed hail');
check(markerPayload([weather],'wind')[0].label.includes('23 km/h'),'wind is visible on the map');
check(markerPayload([weather],'cloud')[0].label.includes('90%'),'cloud amount is visible');
const post={id:'hail-1',map_lat:4190,map_lon:1250,created:now,size:'unknown',confirms:1,disputes:2,city:'Roma'};
const hail=hailRecords({updated:now,posts:[post,{...post,id:'missing',map_lat:null},{...post,id:'ended',ended:now},{...post,id:'old',created:now-3*3600000}]},now);
check(hail.length===1&&hail[0].latitude===41.9,'only recent explicitly located ongoing reports shown');
check(hail[0].detail.includes('discordanti'),'disputed report is labelled');
check(hailRecords({updated:now-100000,posts:[post]},now).length===0,'stale community snapshot is hidden');
check(alertRecord({checkedAt:now,level:0,validDate:'2026-09-15'},place,now)===null,'no all-clear claim from missing hazard marker');
check(alertRecord({checkedAt:now,level:2,validDate:'2026-09-15'},place,now)?.value==='Allerta arancione','forecast warning has distinct category');
check(eventRecords({updated:now,events:[{...place,at:now-8*86400000}]},now).length===1,'open catalogue events retain their real older position date');
check(!conditionDetail({...weather,name:'<script>alert(1)</script>'}).includes('<script>'),'provider text escaped');
check(!validSource('cities',{error:'offline'})&&validSource('events',{updated:now,events:[]}),'empty success differs from unreadable source');

// Exercise source failure and cancellation without a browser or network.
const nodes=new Map();globalThis.document={hidden:false,querySelector:s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',innerHTML:'',querySelectorAll:()=>[]});return nodes.get(s)}};
const sends=[];let resolveHail;
const controller=createGlobeConditions({get:()=>({place,weather:{current}}),send:m=>sends.push(m),api:async path=>path==='atlas/hail-map'?new Promise(r=>resolveHail=r):path==='atlas/cities'?{cities:[{...place,current}]}:path==='atlas/events'?{error:'bad payload'}:{mode:'UNKNOWN',checkedAt:now,title:'Bollettino non disponibile'}});
controller.start();await new Promise(r=>setImmediate(r));controller.stop();resolveHail({updated:now,posts:[post]});await new Promise(r=>setImmediate(r));
check(!sends.some(rows=>rows.some(r=>r.id==='hail:hail-1')),'late viewer data cannot return after globe closes');
const controller2=createGlobeConditions({get:()=>({place,weather:{current}}),send:()=>{},api:async path=>path==='atlas/hail-map'?{updated:now,posts:[]}:path==='atlas/cities'?{cities:[]}:path==='atlas/events'?{error:'bad payload'}:{mode:'UNKNOWN',checkedAt:now,title:'Bollettino non disponibile'}});
controller2.start();await new Promise(r=>setImmediate(r));
check(nodes.get('#globe-source-state').textContent.includes('Catalogo eventi non disponibile'),'malformed source becomes visible error');controller2.stop();delete globalThis.document;

// Fixed NASA endpoint and normalized catalogue; no invented instant status.
let fetched;const point=(date,coordinates)=>({type:'Point',date,coordinates});
const event={id:'EONET_example',title:'Example storm',closed:null,categories:[{id:'severeStorms'}],geometry:[point(new Date(now-86400000).toISOString(),[10,40]),point(iso,[12,42])]};
const sandbox={URL,Request,Response,Date,Number,JSON,encodeURIComponent,clean:(v,n)=>String(v||'').slice(0,n),fail:(status,message)=>{throw Object.assign(new Error(message),{status})},atmoFetch:async url=>{fetched=url;return {events:[event,{...event,id:'EONET_closed',closed:iso},{...event,id:'EONET_bad',geometry:[point(iso,[999,42])]},null]}}};
vm.runInNewContext(readFileSync('server/worker.js','utf8').split('const json=')[0]+readFileSync('server/globe-events.js','utf8'),sandbox);
let result=await sandbox.globeEvents(new URL('https://example.invalid/api/atlas/events?url=https://evil.invalid'));
let data=await result.json();check(data.events.length===1&&data.events[0].latitude===42,'only latest valid geometry from an open event');
check(fetched==='https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300','client cannot choose external fetch target');
check(data.events[0].detail.includes('non una rilevazione istantanea'),'catalogue does not claim real-time observation');
sandbox.atmoFetch=async()=>{throw new Error('offline')};
await assert.rejects(()=>sandbox.globeEvents(new URL('https://example.invalid/api/atlas/events')),e=>e.status===503);checks++;
console.log(checks+' globe conditions checks passed');
