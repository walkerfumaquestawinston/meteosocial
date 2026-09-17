import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const dir=mkdtempSync(path.join(tmpdir(),'profession-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
async function call(p,method='GET',body,who='',extra={}){const h={origin:'https://preview.invalid',...extra};if(who){h['oai-authenticated-user-id']=who;h['oai-authenticated-user-email']='test@example.invalid'}if(body!==undefined)h['content-type']='application/json';const r=await worker.fetch(new Request('https://preview.invalid/api/'+p,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)}),env);return {status:r.status,data:await r.json()}}
const patch=(m,who='one')=>call('profilo','PATCH',{mestiere:m},who);
try{
 assert.equal((await call('profilo')).status,401);
 assert.equal((await patch('pesca','')).status,401);
 assert.equal((await call('profilo','PATCH',{},'one')).status,400);
 for(const m of ['constructor','inventato',[],['pesca'],{}])assert.equal((await patch(m)).status,400);
 assert.equal((await call('profilo','PATCH',{mestiere:'pesca'},'one',{origin:'https://foreign.invalid'})).status,403);
 assert.equal((await patch('campi')).status,200);
 assert.equal((await call('profilo','GET',undefined,'one')).data.mestiere,'campi');
 assert.equal((await call('profilo','GET',undefined,'two')).data.mestiere,null);
 const post={id:crypto.randomUUID(),latitude:42.96,longitude:13.88,consent:true,city:'San Benedetto del Tronto',level:3,options:[],phenomenon:'Pioggia',mestiere:'pesca',weight:999};
 let r=await call('sky/reports','POST',post,'one');assert.equal(r.status,201);assert.equal(r.data.report.mestiere,'campi');
 r=await call('sky/reports','POST',{...post,id:crypto.randomUUID(),phenomenon:'Vento',level:0,options:['wind']},'two');assert.equal(r.status,201);assert.equal(r.data.report.mestiere,null);
 const zone=()=>call('sky/zone?lat=42.96&lon=13.88');
 r=await zone();assert.equal(r.data.people,2);assert.deepEqual(r.data.summary,['Pioggia']);assert.equal(r.data.reports[0].confirms,0);assert.equal('weight' in r.data.reports[0],false);
 await patch(null);r=await zone();assert.equal(r.data.people,2);assert.deepEqual(new Set(r.data.summary),new Set(['Pioggia','Vento']));assert.ok(r.data.reports.every(r=>r.mestiere===null));
 assert.equal((await call('sky/reports','POST',post,'one')).data.report.mestiere,null);
 const context=vm.createContext({localCoastDistance:()=>5});vm.runInContext(readFileSync('server/profession.js','utf8'),context);
 for(const [role,topic,coast,expected] of [['pesca','wind',false,1.5],['pesca','rain',false,1],['mare','storm',false,1],['mare','storm',true,1.5],['campi','hail',false,1.5],['cantiere','temperature',false,1.5],['consegne','fog',false,1.5],['sport','apparent_temperature',false,1.5],['constructor','rain',false,1]]){
  context.args=[role,topic,coast];assert.equal(vm.runInContext('professionFactor(...args)',context),expected);
 }
 context.rows=[{level:0,kind:'wind',mestiere:'pesca'},{level:3,kind:'rain',mestiere:'campi'}];context.trusts=[{weight:1},{weight:1}];
 assert.equal(vm.runInContext('professionSummary(rows,trusts).level',context),3);
 context.trusts[1].hidden=true;assert.equal(vm.runInContext('professionSummary(rows,trusts).level',context),0);
 console.log('PASS profession: session, origin, validation, persistence, isolation, server-owned labels/weights, removal, literal counts, topic relevance, coastal storms, hidden reports.');
}finally{local.close();rmSync(dir,{recursive:true,force:true})}
