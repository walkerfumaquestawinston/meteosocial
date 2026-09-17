import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const dir=mkdtempSync(path.join(tmpdir(),'offline-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
const originalFetch=fetch;globalThis.fetch=async()=>new Response(JSON.stringify({results:[]}));
const call=async(body,who='owner')=>{const r=await worker.fetch(new Request('https://preview.invalid/api/sky/reports',{method:'POST',headers:{origin:'https://preview.invalid','Content-Type':'application/json','oai-authenticated-user-id':who,'oai-authenticated-user-email':'test@example.invalid'},body:JSON.stringify(body)}),env);return {status:r.status,data:await r.json()}};
const draft=()=>({id:crypto.randomUUID(),city:'Roma',latitude:41.9,longitude:12.5,level:2,consent:true,options:[],observedAt:Date.now()-3600000});
try{
 const body=draft(),r=await call(body);assert.equal(r.status,201);assert.equal(r.data.report.created,body.observedAt);assert.equal(r.data.report.expires,body.observedAt+7200000);
 const retry=await call(body);assert.equal(retry.status,200);assert.equal(retry.data.report.created,body.observedAt);
 assert.equal((await call({...draft(),observedAt:Date.now()-7200001})).status,410);
 assert.equal((await call({...draft(),observedAt:Date.now()+120000})).status,400);
 assert.equal((await call({...draft(),expectedActor:'another-actor'})).status,409);
 assert.equal((await call({...draft(),expectedActor:createHash('sha256').update('owner').digest('hex')})).status,201);
 console.log('Offline server: original observation age, TTL, idempotency, stale/future rejection and actor binding passed.');
}finally{globalThis.fetch=originalFetch;local.close();rmSync(dir,{recursive:true,force:true})}
