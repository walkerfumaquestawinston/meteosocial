import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const dir=mkdtempSync(path.join(tmpdir(),'sky-confirm-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
const call=async(p,b,who='',cookie='')=>{const h=new Headers({origin:'https://preview.invalid'});if(who){h.set('oai-authenticated-user-id',who);h.set('oai-authenticated-user-email','test@example.invalid')}if(cookie)h.set('cookie',cookie);if(b!==undefined)h.set('content-type','application/json');const r=await worker.fetch(new Request('https://preview.invalid/api/sky/'+p,{method:b===undefined?'GET':'POST',headers:h,body:b===undefined?undefined:JSON.stringify(b)}),env);return {status:r.status,body:await r.json(),cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}};
const position={latitude:42.96,longitude:13.88,accuracy:30,consent:true};
try{
 const post=await call('reports',{...position,id:crypto.randomUUID(),city:'San Benedetto del Tronto',level:2,options:[]},'author');assert.equal(post.status,201);const id=post.body.report.id,url='reports/'+id+'/confirm';
 assert.equal((await call(url,position)).status,401);
 const session=await call('session',{},'witness'),cookie=session.cookie;assert.match(cookie,/ms_sky_device=/);
 assert.equal((await call(url,{...position,latitude:43.3},'witness',cookie)).status,403);
 assert.equal((await call(url,{...position,accuracy:3000},'witness',cookie)).status,400);
 assert.equal((await call(url,{...position,latitude:null},'witness',cookie)).status,400);
 assert.equal((await call(url,position,'author',cookie)).status,403);
 let responses=await Promise.all([call(url,position,'witness',cookie),call(url,position,'witness',cookie)]);for(const r of responses){assert.equal(r.status,200);assert.equal(r.body.confirms,1);assert.equal(r.body.confirmed,true)}
 assert.equal((await call(url,position,'different-account',cookie)).body.confirms,1,'one browser cannot double-confirm');
 const newDevice=(await call('session',{},'witness')).cookie;assert.equal((await call(url,position,'witness',newDevice)).body.confirms,1,'one account cannot double-confirm');
 const evidence=await env.DB.prepare('SELECT COUNT(*) n FROM sky_evidence WHERE report=?').bind(id).first();assert.equal(evidence.n,1,'one trust contribution only');
 const guest=(await call('session',{})).cookie;const gr=await call(url,position,'',guest);assert.equal(gr.body.confirms,2);assert.equal((await env.DB.prepare('SELECT COUNT(*) n FROM sky_evidence WHERE report=?').bind(id).first()).n,1,'anonymous votes do not farm trust');
 for(const p of ['reports','nearby?lat=42.96&lon=13.88','zone?lat=42.96&lon=13.88']){const r=await call(p,undefined,'witness',cookie);assert.equal(r.body.reports.find(r=>r.id===id).confirms,2);assert.equal(r.body.reports.find(r=>r.id===id).confirmed,true)}
 const blocked=(await call('session',{},'blocked')).cookie;await call('block',{target:post.body.report.author},'blocked',blocked);assert.equal((await call(url,position,'blocked',blocked)).status,404);
 await env.DB.prepare('UPDATE sky_reports SET hidden=1 WHERE id=?').bind(id).run();assert.equal((await call(url,position,'witness',cookie)).status,404);
 await env.DB.prepare('UPDATE sky_reports SET hidden=0,expires=? WHERE id=?').bind(Date.now()-1,id).run();assert.equal((await call(url,position,'witness',cookie)).status,404);
 console.log('Confirmations: identity, distance, accuracy, self-vote, concurrent retry, browser/account uniqueness, trust, guest, feed counts, blocks, moderation and expiry passed.');
}finally{local.close();rmSync(dir,{recursive:true,force:true})}
