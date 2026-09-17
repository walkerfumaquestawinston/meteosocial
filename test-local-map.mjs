import assert from 'node:assert/strict';
import {radarFrames,windVector} from './dist/local-map-weather.js';
import {activeReports,distanceKm} from './dist/local-map.js';
import {coverCrop} from './dist/sky-postcard.js';
const now=Math.floor(Date.now()/1000);
const frames=radarFrames({host:'https://tilecache.rainviewer.com',radar:{past:Array.from({length:13},(_,i)=>({time:now-(12-i)*600,path:'/v2/radar/'+(now-(12-i)*600)}))}});
assert.equal(frames.length,7);assert.equal(frames.at(-1).time-frames[0].time,3600);
assert.throws(()=>radarFrames({host:'https://evil.example',radar:{past:[]}}));
assert.equal(windVector(10,0).v,-10);assert.ok(Math.abs(windVector(10,90).u+10)<.01);
const r={created:Date.now()-10000,expires:Date.now()+10000,latitude:42,longitude:13};
assert.equal(activeReports([r,{...r,expires:0},{...r,created:Date.now()+10000},{...r,latitude:null}]).length,1);
assert.equal(distanceKm(r,r),0);assert.ok(distanceKm(r,{latitude:43,longitude:13})>110);
for(const [w,h] of [[4000,3000],[1080,1920],[1000,4000]]){const crop=coverCrop(w,h);assert.ok(crop.w>=1080&&crop.h>=1920);assert.ok(crop.x<=0&&crop.y<=0);assert.ok(Math.abs(crop.w/crop.h-w/h)<.00001)}
console.log('Local map: radar window, source allowlist, wind direction, TTL, distance and 9:16 crop passed.');
// A real JPEG is accepted through the existing session and durable photo path.
const {mkdtempSync,rmSync,readFileSync}=await import('node:fs');
const {tmpdir}=await import('node:os');const path=await import('node:path');
const {createLocalEnvironment}=await import('./tools/local-preview.mjs');
const {default:worker}=await import('./dist/server/index.js');
const dir=mkdtempSync(path.join(tmpdir(),'postcard-test-')),local=createLocalEnvironment(process.cwd(),dir);
try{
 const origin='https://preview.invalid';
 const session=await worker.fetch(new Request(origin+'/api/sky/session',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{}'}),local.env);
 const cookie=session.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const id=crypto.randomUUID(),payload={id,name:'Foto di prova',city:'San Benedetto del Tronto',latitude:42.9568,longitude:13.8768,level:0,options:[],consent:true,phenomenon:'Cielo sereno',observedAt:Date.now(),photo:'data:image/jpeg;base64,'+readFileSync('tests/fixtures/postcard-photo.jpg').toString('base64')};
 const response=await worker.fetch(new Request(origin+'/api/sky/reports',{method:'POST',headers:{origin,cookie,'content-type':'application/json'},body:JSON.stringify(payload)}),local.env);
 const result=await response.json();assert.equal(response.status,201,JSON.stringify(result));assert.equal(result.report.photo,true);assert.equal(result.report.latitude,42.96);
 const photo=await worker.fetch(new Request(origin+'/api/sky/photo/'+id,{headers:{cookie}}),local.env);assert.equal(photo.status,200);assert.match(photo.headers.get('content-type'),/image\/jpeg/);
 console.log('Postcard: first-session photo publication, approximate position and protected image retrieval passed.');
}finally{local.close();rmSync(dir,{recursive:true,force:true})}
