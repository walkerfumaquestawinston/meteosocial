import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';import worker from './dist/server/index.js';import {arrivalEstimate} from './dist/arrival-estimate.js';
const dir=mkdtempSync(path.join(tmpdir(),'growth-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env,originalNow=Date.now,originalFetch=fetch;let now=Date.parse('2026-09-16T10:00:00Z');Date.now=()=>now;
globalThis.fetch=async()=>new Response(JSON.stringify({hourly:{time:['2026-09-16T09:00','2026-09-16T12:00','2026-09-16T15:00','2026-09-16T18:00','2026-09-16T21:00'],temperature_2m:[20,21,22,23,20],precipitation:[0,0,0,0,0],wind_speed_10m:[8,8,8,8,8]}}));
async function call(path,body,who='one'){const h={origin:'https://preview.invalid'};if(who){h['oai-authenticated-user-id']=who;h['oai-authenticated-user-email']='test@example.invalid'}if(body!==undefined)h['content-type']='application/json';const r=await worker.fetch(new Request('https://preview.invalid'+path,{method:body===undefined?'GET':'POST',headers:h,body:body===undefined?undefined:JSON.stringify(body)}),env);const type=r.headers.get('content-type');return {status:r.status,data:type?.includes('json')?await r.json():type?.includes('image')?new Uint8Array(await r.arrayBuffer()):await r.text()}}
const point=()=>({latitude:42.96,longitude:13.88,city:'San Benedetto del Tronto',locatedAt:now,consent:true,accuracy:20});
try{
 assert.equal((await call('/api/growth/zone',point(),'')).status,401);
 const zone=await call('/api/growth/zone',point());assert.equal(zone.status,200);const slug=zone.data.zone.slug;
 const page=await call('/z/'+slug,undefined,'');assert.equal(page.status,200);assert.match(page.data,/0 persone/);assert.match(page.data,/og:image/);
 const png=await call('/z/'+slug+'/preview.png',undefined,'');assert.equal(png.status,200);assert.deepEqual([...png.data.slice(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal((await call('/api/growth/verdict?slug='+slug)).data.status,'missing');
 now=Date.parse('2026-09-16T05:00:00Z');assert.equal((await call('/api/growth/verdict?slug='+slug)).data.status,'waiting');now=Date.parse('2026-09-16T19:00:00Z');const verdict=await call('/api/growth/verdict?slug='+slug);assert.equal(verdict.data.status,'ready');assert.equal(verdict.data.total,5);assert.equal(verdict.data.count,0);assert.match(verdict.data.message,/non una misura/);
 const q=await call('/api/questions',{...point(),id:crypto.randomUUID(),topic:'rain'});assert.equal(q.status,201);assert.equal(q.data.question.topic,'rain');assert.equal(q.data.people,0);
 assert.equal((await call('/api/questions',{...point(),id:crypto.randomUUID(),topic:'rain'})).status,429);
 const url='/api/questions/'+q.data.question.id+'/answers';assert.equal((await call(url,{...point(),id:crypto.randomUUID(),answer:'Sì'},'two')).status,200);assert.equal((await call(url,{...point(),latitude:40,id:crypto.randomUUID(),answer:'Sì'},'far')).status,403);assert.equal((await call(url,{...point(),id:crypto.randomUUID(),answer:'free text'},'three')).status,400);
 const nearby=await call('/api/questions/mine');assert.equal(nearby.data.questions[0].answers.length,1);assert.equal(nearby.data.questions[0].answers[0].author,undefined);
 assert.equal((await call('/api/growth/human',{...point(),cold:true})).data.total,1);assert.equal((await call('/api/growth/human',{...point(),cold:false})).data.total,1);assert.equal((await call('/api/growth/human?lat=42.96&lon=13.88')).data.cold,0);
 const group=await call('/api/groups',{...point(),name:'Gita test',day:'2026-09-16'});assert.equal(group.status,201);const {id,token}=group.data;
 assert.equal((await call('/api/groups/'+id+'?token=wrong',undefined,'')).status,404);
 for(let i=0;i<29;i++)assert.equal((await call('/api/groups/'+id+'/join',{token},'member'+i)).status,200);
 assert.equal((await call('/api/groups/'+id+'/join',{token},'overflow')).status,409);assert.equal((await call('/api/groups/'+id+'/join',{token},'member0')).status,200);
 const g=await call('/api/groups/'+id+'?token='+token,undefined,'');assert.equal(g.status,200);assert.equal(g.data.members,30);assert.equal(g.data.token,undefined);assert.equal(g.data.creator,undefined);
 now+=3*86400000;assert.equal((await call('/api/groups/'+id+'?token='+token)).status,404);assert.equal((await call('/api/growth/human?lat=42.96&lon=13.88')).data.total,0);
 assert.equal(arrivalEstimate({activePeople:100,concordantReports:2,distanceKm:5,windKmh:25,angleRadians:0}),null);
 console.log('PASS growth: public zero/PNG, snapshots, fixed anonymous questions/distance/rate, votes, private group/cap/expiry, H6 disabled');
}finally{Date.now=originalNow;globalThis.fetch=originalFetch;local.close();rmSync(dir,{recursive:true,force:true})}
