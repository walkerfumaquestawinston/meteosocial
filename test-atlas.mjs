import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {bestWindow,currentHour,trendSummary,parseRadar,mercatorV,cityReports,weatherKind,valueText,miniWeather} from './dist/weather-tools.js';
import {spherePoint} from './dist/planet.js';
import {CITIES} from './dist/places.js';
import worker from './dist/server/index.js';
let n=0;function check(value,label){assert.ok(value,label);n++}
check(valueText(null)==='—'&&valueText(NaN)==='—','missing data is not zero');
check(valueText(0,' mm',1)==='0.0 mm','real zero is shown');
check(weatherKind(0,false)==='moon','clear night');check(miniWeather(2,false).includes('night'),'partly cloudy night');
check(weatherKind(95)==='storm'&&weatherKind(75)==='snow','weather symbols');
check(weatherKind(undefined)==='unknown','missing condition remains unknown');
check(Math.abs(spherePoint(0,0).x-1)<1e-9,'Greenwich texture alignment');
check(Math.abs(spherePoint(0,90).z+1)<1e-9,'east longitude alignment');
check(Math.abs(spherePoint(90,10).y-1)<1e-9,'north pole');
check(mercatorV(0)===.5,'equator on radar');check(Math.abs(mercatorV(85.05112878))<1e-8,'Mercator north coverage limit');check(Math.abs(mercatorV(-90)-1)<1e-8,'clamp poles');
const now=Date.now(),past=Array.from({length:13},(_,i)=>({time:Math.floor(now/1000)-7200+i*600,path:'/v2/radar/hash_'+i})),radar={host:'https://tilecache.rainviewer.com',radar:{past,nowcast:[{time:now/1000+600,path:'/v2/radar/future'}]}};
check(parseRadar(radar,now).frames.length===13,'past frames only');check(parseRadar(radar,now).frames.at(-1).path.endsWith('_12'),'latest frame selected');
for(const [label,data] of [['untrusted tile host',{...radar,host:'https://evil.invalid'}],['stale radar',{...radar,radar:{past:[past[0]]}}],['unsafe paths',{...radar,radar:{past:[{time:past.at(-1).time,path:'/v2/radar/../../private'}]}}],['future image',{...radar,radar:{past:[{time:Math.floor(now/1000)+7200,path:'/v2/radar/1'}]}}]]){assert.throws(()=>parseRadar(data,now));n++}
const forecast={current:{time:'2026-09-11T08:00'},hourly:{time:['2026-09-11T08:00','2026-09-11T09:00','2026-09-11T10:00'],temperature_2m:[20,21,22],precipitation_probability:[10,10,10],wind_speed_10m:[10,10,10],weather_code:[1,1,1],is_day:[1,1,1]},daily:{time:['2026-09-11','2026-09-12'],temperature_2m_max:[24,28],precipitation_probability_max:[30,10]}};
check(currentHour(forecast)===0,'current day index');check(bestWindow(forecast).start.endsWith('08:00'),'deterministic equal candidates');
const afterHour=structuredClone(forecast);afterHour.current.time='2026-09-11T08:45';check(bestWindow(afterHour).start.endsWith('09:00'),'suggested window must not start in the past');
const exhausted=structuredClone(forecast);exhausted.current.time='2026-09-12T08:00';check(bestWindow(exhausted)===null,'no fallback to yesterday');
check(trendSummary({daily:{time:['x'],precipitation_probability_max:[null]}}).driest===null,'unknown rain probability never becomes driest day');
for(const [field,value] of [['is_day',[0,0,0]],['weather_code',[95,95,95]],['precipitation_probability',[null,null,null]],['temperature_2m',[1,30,40]],['wind_speed_10m',[40,40,40]]]){const f=structuredClone(forecast);f.hourly[field]=value;check(bestWindow(f)===null,'no recommended window for '+field)}
const partial=structuredClone(forecast);partial.hourly.temperature_2m=[0,30,40];check(bestWindow(partial)===null,'both temperature endpoints within criteria');
const wind=structuredClone(forecast);wind.hourly.wind_speed_10m=[23,23,23];check(bestWindow(wind,'cycle')===null&&bestWindow(wind,'walk')!==null,'activity criteria differ');
check(trendSummary(forecast).delta===4&&trendSummary(forecast).driest.i===1,'derived trend is traceable');check(trendSummary({daily:{time:['x']}}).delta===null,'no invented trend on missing values');
const reports=[{city:'ROMA',kind:'Grandine',created:now-3600000},{city:'Roma',kind:'Grandine',created:now-10800000},{city:'Roma',kind:'Neve',created:now-3600000},{city:'Roma',kind:'Grandine',created:now-10000,expires:now-1},{city:'Milano',kind:'Grandine',created:now-10000},{city:'Roma',kind:'Grandine',created:now+120000}];
check(cityReports(reports,'roma','grandine',now).length===1,'hail filters city event expiry and future timestamps');check(cityReports(reports,'Roma','segnalazioni',now).length===3,'reports have 24 hour horizon');
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const env={DB:{prepare:sql=>({bind:(...v)=>({first:async()=>db.prepare(sql).get(...v)||null,all:async()=>({results:db.prepare(sql).all(...v)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...v).changes)}})})})}};
async function request(path,user=null){return worker.fetch(new Request('https://test.invalid/api/atlas/'+path,{headers:user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.invalid'}:{}}),env)}
const originalFetch=globalThis.fetch;let requests=0;globalThis.fetch=async url=>{requests++;const u=new URL(url);check(u.hostname==='api.open-meteo.com','fixed weather upstream');check(u.searchParams.get('current').includes('cloud_cover'),'cloud data requested');check(u.searchParams.get('latitude').split(',').length===CITIES.length,'one finite city batch');return Response.json(CITIES.map(()=>({current:{temperature_2m:20,weather_code:0,cloud_cover:10,time:'2026-09-11T12:00'}})))};
const cached=new Map();globalThis.caches={default:{match:async r=>cached.get(r.url)?.clone(),put:async(r,v)=>cached.set(r.url,v.clone())}};
let r=await request('cities'),data=await r.json();check(r.status===200&&data.cities.length===CITIES.length,'complete weather batch');check(data.cities[0].name===CITIES[0].name&&data.cities.at(-1).longitude===CITIES.at(-1).longitude,'coordinate-order association stable');check(r.headers.get('cache-control').includes('max-age=600'),'public batch cache');await request('cities?unused=ignored');check(requests===1,'query params cannot fragment shared cache');
cached.clear();globalThis.fetch=async()=>Response.json([{}]);check((await request('cities')).status===503,'incomplete upstream rejected');globalThis.fetch=async()=>new Response('',{status:429});check((await request('cities')).status===503,'upstream throttling has honest failure state');globalThis.fetch=originalFetch;delete globalThis.caches;
const insert=db.prepare('INSERT INTO posts(id,author,text,city,kind,created,expires,deleted) VALUES(?,?,?,?,?,?,?,?)');for(const [i,p] of reports.entries())insert.run(crypto.randomUUID(),'author','not exposed',p.city,p.kind,p.created,p.expires||null,0);insert.run(crypto.randomUUID(),'author','deleted','Roma','Grandine',now,null,1);insert.run(crypto.randomUUID(),'author','old','Roma','Grandine',now-90000000,null,0);
r=await request('reports');data=await r.json();check(data.posts.length===4,'server removes deleted expired future and old reports');check(Object.keys(data.posts[0]).sort().join(',')==='city,created,expires,kind','map discloses only minimal public report data');check(r.headers.get('cache-control').includes('no-store'),'personalized reports never public cached');
const identityR=await worker.fetch(new Request('https://test.invalid/api/me',{headers:{'oai-authenticated-user-id':'B','oai-authenticated-user-email':'B@example.invalid'}}),env),uid=(await identityR.json()).id;
db.prepare('INSERT INTO links(user,target,kind) VALUES(?,?,?)').run(uid,'author','block');check((await(await request('reports','B')).json()).posts.length===0,'blocked authors excluded from map');
for(let i=0;i<210;i++)insert.run(crypto.randomUUID(),'another','many','Roma','Grandine',now-1000,null,0);data=await(await request('reports')).json();check(data.posts.length===200&&data.truncated,'bounded reports disclose truncation');
check((await request('missing')).status===404,'unknown atlas route fails closed');
console.log(n+' atlas checks passed');
