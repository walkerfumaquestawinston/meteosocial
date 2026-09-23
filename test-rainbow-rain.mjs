import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {nowcastSummary,nowcastMarkup} from './dist/rain-nowcast.js';
import {rainbowRadarFrames} from './dist/map-radar.js';
import {sourceStatus} from './dist/map-live-status.js';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const now=Date.now(),start=Math.floor(now/60000)*60,snapshot=Math.floor(now/600000)*600;
const raw={latitude:41.9,longitude:12.5,forecast:Array.from({length:240},(_,i)=>({timestampBegin:start+i*60,timestampEnd:start+(i+1)*60,precipRate:i>=20&&i<40?2:0,precipType:i>=20&&i<40?'rain':'no_precipitation'}))};
const {normalizeRainbowNowcast}=vm.runInNewContext(fs.readFileSync('server/rainbow-rain.js','utf8')+';({normalizeRainbowNowcast})',{Date,Map,rainbowTimezone:()=> 'Europe/Rome'});
const place={latitude:41.9,longitude:12.5},data=normalizeRainbowNowcast(raw,place,now);
assert.equal(data.issuedAt,null);assert.equal(data.unit,'mm/h');assert.equal(data.points.length,240);
assert.match(nowcastSummary(data,now).title,/circa 20 min/);
assert.match(nowcastMarkup(data,'ok'),/type="range"/);
assert.throws(()=>normalizeRainbowNowcast({...raw,latitude:45},place,now),/Località/);
assert.throws(()=>normalizeRainbowNowcast({...raw,forecast:[{...raw.forecast[0],precipRate:-1}]},place,now),/valido/);
assert.throws(()=>normalizeRainbowNowcast({...raw,forecast:[{...raw.forecast[0],timestampEnd:start+120}]},place,now),/valido/);
assert.match(nowcastSummary({...data,points:data.points.filter((_,i)=>i!==10)},now).title,/parziale/);
assert.equal(nowcastSummary(data,now+3600000).points.length,0);
const frames=rainbowRadarFrames({snapshot},now);assert.equal(frames.length,37);assert.equal(frames[12].time,snapshot);assert.equal(frames[36].time,snapshot+14400);assert.equal(frames[36].kind,'forecast');assert.match(frames[0].url,/\/0\/\{z\}/);assert.match(frames[36].url,/\/14400\//);
assert.throws(()=>rainbowRadarFrames({snapshot:snapshot-3600},now),/recente/);
assert.match(sourceStatus({radar:{enabled:true,source:'Rainbow Weather',time:snapshot+600,issuedAt:snapshot}}).radar,/Previsione Rainbow/);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rainbow-rain-test-')),local=createLocalEnvironment(process.cwd(),dir),env={...local.env,RAINBOW_API_KEY:'fixture-rain-key'},original=globalThis.fetch;
let nowCalls=0,tileCalls=0,snapCalls=0,deny=false,broken=false;
const png=Uint8Array.from([137,80,78,71,13,10,26,10,0]);
globalThis.fetch=async(url,init)=>{
 const u=new URL(url);assert.equal(u.hostname,'api.rainbow.ai');assert.equal(u.searchParams.has('token'),false);assert.equal(init.headers['Ocp-Apim-Subscription-Key'],'fixture-rain-key');assert.equal(init.redirect,'manual');
 if(u.pathname.includes('/nowcast/')){nowCalls++;return new Response(JSON.stringify({...raw,latitude:Number(u.pathname.split('/').at(-1)),longitude:Number(u.pathname.split('/').at(-2))}));}
 if(u.pathname.includes('/snapshot')){snapCalls++;return new Response(JSON.stringify({snapshot}));}
 tileCalls++;assert.equal(u.searchParams.get('coverage'),'1');return deny?new Response('fixture-rain-key',{status:403}):new Response(broken?'bad':png,{headers:{'Content-Type':'image/png'}});
};
const call=async(p,method='GET')=>worker.fetch(new Request('https://test.invalid/api/rainbow/'+p,{method}),env);
try{
 let r=await call('nowcast?lat=41.9&lon=12.5');assert.equal(r.status,200);assert.equal((await r.json()).points.length,240);
 await call('nowcast?lat=41.9&lon=12.5');assert.equal(nowCalls,1,'cache shared by weather and map');
 assert.equal((await call('nowcast?lat=bad&lon=12')).status,400);
 assert.equal((await call('snapshot','POST')).status,405);
 const meta=await (await call('snapshot')).json();assert.equal(meta.snapshot,snapshot);
 r=await call('tile/'+snapshot+'/600/0/0/0.png');assert.equal(r.status,200);assert.equal(r.headers.get('Content-Type'),'image/png');assert.equal((await r.arrayBuffer()).byteLength,png.length);
 assert.equal(snapCalls,1,'tile validation shares snapshot cache');
 assert.equal((await call('tile/'+snapshot+'/1/0/0/0.png')).status,400);
 assert.equal((await call('tile/'+snapshot+'/0/0/1/0.png')).status,400);
 assert.equal((await call('tile/'+(snapshot-600)+'/600/0/0/0.png')).status,400);
 deny=true;r=await call('tile/'+snapshot+'/1200/0/0/0.png');assert.equal(r.status,503);assert.equal((await r.text()).includes('fixture-rain-key'),false);deny=false;
 broken=true;assert.equal((await call('tile/'+snapshot+'/1800/0/0/0.png')).status,503);broken=false;
 await env.DB.prepare('UPDATE limits SET count=5000 WHERE key=?').bind('rainbow-nowcast-month:'+new Date().toISOString().slice(0,7)).run();
 assert.equal((await call('nowcast?lat=42&lon=13')).status,429);assert.equal(nowCalls,1);
 await env.DB.prepare('UPDATE limits SET count=30000 WHERE key=?').bind('rainbow-tiles-month:'+new Date().toISOString().slice(0,7)).run();
 const before=tileCalls;assert.equal((await call('tile/'+snapshot+'/2400/0/0/0.png')).status,429);assert.equal(tileCalls,before);
}finally{globalThis.fetch=original;local.close();fs.rmSync(dir,{recursive:true,force:true});}
console.log('Rainbow rain: minute semantics, gaps, stale data, forecast frames, server proxy, validation, cache, secret redaction and quotas passed.');
