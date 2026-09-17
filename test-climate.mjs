import assert from 'node:assert/strict';
import {CLIMATE_LAYERS,climateValue,climatePanel,journey,globeQuality} from './dist/climate-view.js';
import {CITIES} from './dist/places.js';
import worker from './dist/server/index.js';

let checks=0;const check=(value,label)=>{assert.ok(value,label);checks++};
check(new Set(CLIMATE_LAYERS.map(l=>l.id)).size===14,'all fourteen choices have unique identifiers');
check(climateValue({snowfall:.7,precipitation:1.2},'neve')==='0.7 cm','snow depth keeps centimetres');
check(climateValue({snowfall:.7,precipitation:1.2},'pioggia')==='1.2 mm','water equivalent remains distinct from snow');
check(climateValue({rain:0},'rain')==='0.0 mm','observed model zero remains visible');
for(const value of [null,undefined,NaN,'2'])check(climateValue({rain:value},'rain')==='—','unknown values never become zero');
check(climateValue({surface_pressure:987},'pressione')==='987 hPa','surface pressure uses explicit units');
check(climateValue({wind_gusts_10m:63},'raffiche')==='63 km/h','gust value is separate from wind speed');
check(climateValue({},'grandine')===null,'no invented numerical hail field');
const high=globeQuality('high',3,8192),light=globeQuality('light',3,8192);
check(high.textureWidth===5400&&high.pixelRatio===2.5,'high quality uses native image resolution within a density limit');
check(globeQuality('high',2,4096).textureWidth===4096,'older GPU texture limit is respected');
check(light.textureWidth===2048&&light.pixelRatio===1&&light.segments<high.segments,'light rendering reduces memory and geometry');
const place={name:'A < B & C'},panel=climatePanel(place,{current:{time:'2026-09-13T10:15',interval:900,rain:0},timezone:'Europe/Rome'});
check(panel.includes('A &lt; B &amp; C')&&!panel.includes('A < B'),'locality names are escaped in the connected card');
check(panel.includes('15 minuti')&&panel.includes('Europe/Rome')&&panel.includes('Adesso'),'interval and timezone travel with the value');
check(climatePanel(place,null).includes('in attesa')&&!climatePanel(place,null).includes('0.0 mm'),'loading forecast does not display fabricated measurements');
const nav=journey(place,'mondo');check(nav.includes('A &lt; B &amp; C')&&nav.includes('href="#mondo" aria-current="page"'),'common navigation preserves location and selected route');

const originalFetch=globalThis.fetch,originalCaches=globalThis.caches;
const origin=Math.floor(Date.now()/3600000)*3600000;
const times=[-25,-24,0,24,25].map(h=>new Date(origin+h*3600000).toISOString().slice(0,16));
const current={time:times[2],interval:900,temperature_2m:20,weather_code:1,rain:.4,showers:1.1,snowfall:0,wind_gusts_10m:34,relative_humidity_2m:81,surface_pressure:982};
let cityRequests=0,timelineRequests=0;
const cache=new Map();globalThis.caches={default:{match:async r=>cache.get(r.url)?.clone(),put:async(r,v)=>cache.set(r.url,v.clone())}};
globalThis.fetch=async raw=>{
 const url=new URL(raw),timeline=url.searchParams.has('hourly');
 check(url.hostname==='api.open-meteo.com','only the expected forecast provider is requested');
 const requested=url.searchParams.get(timeline?'hourly':'current').split(',');
 for(const field of ['rain','showers','snowfall','wind_gusts_10m','relative_humidity_2m','surface_pressure'])check(requested.includes(field),field+' requested from provider');
 if(timeline)timelineRequests++;else cityRequests++;
 return Response.json(CITIES.map((c,i)=>({current:{...current,rain:i===1?null:current.rain},hourly:{time:times,...Object.fromEntries(Object.entries(current).filter(([k,v])=>typeof v==='number').map(([k,v])=>[k,times.map(()=>v)]))}})));
};
const request=path=>worker.fetch(new Request('https://climate-test.invalid/api/'+path),{});
try{
 let response=await request('atlas/cities'),data=await response.json();
 check(response.status===200&&data.cities[0].current.surface_pressure===982,'current pressure reaches city API');
 check(data.cities[0].current.showers===1.1&&data.cities[0].current.rain===.4,'rain and showers stay distinct through API');
 check(data.cities[1].current.rain===null,'upstream missing values remain missing');
 await request('atlas/cities?ignored=1');check(cityRequests===1,'new fields still use shared city cache');
 response=await request('atmosphere/timeline');data=await response.json();
 check(response.status===200&&data.kind==='model'&&data.timezone==='UTC','timeline declares model provenance and timezone');
 check(data.cities[0].hours.length===3,'timeline limits data to the promised 24-hour range');
 check(data.cities[0].hours[1].rain===.4&&data.cities[0].hours[1].showers===1.1&&data.cities[0].hours[1].surface_pressure===982,'new fields survive hourly projection');
 await request('atmosphere/timeline?ignored=1');check(timelineRequests===1,'timeline cache remains shared');
 for(const path of ['/climate-view.js','/climate-view.css']){
  const asset=await worker.fetch(new Request('https://climate-test.invalid'+path),{});
  check(asset.status===200&&(await asset.text()).length>100,'new module and style are present in built Worker');
 }
 console.log(checks+' climate checks passed');
}finally{globalThis.fetch=originalFetch;if(originalCaches===undefined)delete globalThis.caches;else globalThis.caches=originalCaches}
