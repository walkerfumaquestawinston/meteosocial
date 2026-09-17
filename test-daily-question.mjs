import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const dir=mkdtempSync(path.join(tmpdir(),'daily-question-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
const clock=Date.now,network=fetch;let now=Date.parse('2026-09-17T04:59:00Z');Date.now=()=>now;
let condition={apparent_temperature:12,temperature_2m:15,relative_humidity_2m:50,wind_speed_10m:5,weather_code:3};
globalThis.fetch=async()=>new Response(JSON.stringify({timezone:'Europe/Rome',current:condition,hourly:{time:[Math.floor(now/1000)-3600],precipitation:[0]}}));
const cookies=new Map();
async function call(p,body,person='',extra={}){const h={origin:'https://preview.invalid',...extra};if(cookies.has(person))h.cookie=cookies.get(person);if(body!==undefined)h['content-type']='application/json';const r=await worker.fetch(new Request('https://preview.invalid'+p,{method:body===undefined?'GET':'POST',headers:h,body:body===undefined?undefined:JSON.stringify(body)}),env);return {status:r.status,data:await r.json(),cookies:r.headers.getSetCookie()}}
async function session(person){const r=await call('/api/sky/session',{},person);cookies.set(person,r.cookies.map(v=>v.split(';')[0]).join('; '));assert.equal(r.status,200)}
const get=()=>call('/api/domanda?lat=42.95&lng=13.88');
try{
 assert.equal((await call('/api/domanda?lat=&lng=13')).status,400);
 assert.equal((await get()).data.status,'waiting');
 now=Date.parse('2026-09-17T05:00:00Z');let d=(await get()).data;
 assert.equal(d.testo,'Oggi serve la giacca?');assert.equal(d.risposte,null);assert.equal(d.totale,null);
 const id=d.id,answer='/api/domanda/'+id+'/risposta';assert.equal((await call(answer,{risposta:'Sì'})).status,401);
 await session('one');let r=await call(answer,{risposta:'Sì'},'one');assert.equal(r.status,200);assert.deepEqual(r.data.risposte,{'Sì':1,'No':0});
 assert.equal((await get()).data.risposte,null);
 r=await call('/api/domanda?lat=42.95&lng=13.88',undefined,'one');assert.equal(r.data.miaRisposta,'Sì');
 const other=(await call('/api/domanda?lat=43.2&lng=13.5')).data;
 assert.equal((await call('/api/domanda/'+other.id+'/risposta',{risposta:'No'},'one')).status,409);
 assert.equal((await call(answer,{risposta:'inventata'},'one')).status,400);
 assert.equal((await call(answer,{risposta:'No'},'one',{origin:'https://foreign.invalid'})).status,403);
 r=await call(answer,{risposta:'No'},'one');assert.equal(r.data.totale,1);assert.equal(r.data.risposte.No,1);
 await Promise.all(['two','three'].map(session));await Promise.all(['two','three'].map(p=>call(answer,{risposta:'Sì'},p)));
 r=await call(answer,{risposta:'No'},'one');assert.equal(r.data.totale,3);assert.equal(r.data.risposte['Sì'],2);
 assert.equal((await get()).data.id,id);
 now=Date.parse('2026-09-17T22:00:00Z');assert.equal((await call(answer,{risposta:'Sì'},'one')).status,410);assert.equal((await get()).data.status,'waiting');
 now=Date.parse('2026-09-18T05:00:00Z');d=(await get()).data;assert.notEqual(d.testo,'Oggi serve la giacca?');assert.notEqual(d.id,id);
 assert.equal((await call('/api/domanda/'+d.id+'/risposta',{risposta:d.opzioni[0]},'one')).status,200);
 const context=vm.createContext({Intl,Date,Number});vm.runInContext(readFileSync('server/daily-question.js','utf8'),context);
 assert.equal(vm.runInContext("dailyInstant('2026-03-29',7,'Europe/Rome')",context),Date.parse('2026-03-29T05:00:00Z'));
 assert.equal(vm.runInContext("dailyInstant('2026-10-25',7,'Europe/Rome')",context),Date.parse('2026-10-25T06:00:00Z'));
 assert.equal(vm.runInContext("dailyInstant('2026-09-17',7,'Asia/Kolkata')",context),Date.parse('2026-09-17T01:30:00Z'));
 for(const [c,expected] of [[{apparent_temperature:8},'jacket'],[{apparent_temperature:16},'jacket'],[{wind_speed_10m:21},'wind'],[{temperature_2m:21,weather_code:0},'dinner'],[{relative_humidity_2m:81},'humid'],[{},'sky']]){
  context.input={current:c};assert.equal(vm.runInContext('dailyTopic(input,null,false,Date.now())',context),expected);
 }
 assert.equal(vm.runInContext("dailyTopic({current:{}},'sky',false,Date.now())",context),'change');
 assert.equal(vm.runInContext("dailyTopic({current:{}},null,true,Date.now())",context),'sea');
 assert.equal(vm.runInContext("dailyTopic({hourly:{time:[Date.now()/1000-3600],precipitation:[1]}},null,false,Date.now())",context),'rain');
 console.log('PASS daily question: hidden results, guest/device uniqueness, edits, concurrent voters, CSRF, options, expiry, next day, deterministic rules, DST and fractional timezone.');
}finally{Date.now=clock;globalThis.fetch=network;local.close();rmSync(dir,{recursive:true,force:true})}
