import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalEnvironment} from './tools/local-preview.mjs';
import worker from './dist/server/index.js';
const dir=mkdtempSync(path.join(tmpdir(),'sky-test-')),local=createLocalEnvironment(process.cwd(),dir),env=local.env;
let checks=0;const check=(condition,message)=>{assert.ok(condition,message);checks++;console.log('✓ '+message)};
const call=async(path,body,who='',cookie='',origin='https://preview.invalid')=>{const headers=new Headers({origin});if(who){headers.set('oai-authenticated-user-id',who);headers.set('oai-authenticated-user-email','test@example.invalid')}if(cookie)headers.set('cookie',cookie);if(body!==undefined)headers.set('content-type','application/json');const r=await worker.fetch(new Request('https://preview.invalid/api/sky/'+path,{method:body!==undefined?'POST':'GET',headers,body:body===undefined?undefined:JSON.stringify(body)}),env);return {status:r.status,body:await r.json(),cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}};
const report=(extra={})=>({id:crypto.randomUUID(),latitude:42.9568,longitude:13.8768,city:'San Benedetto del Tronto',level:0,consent:true,options:[],...extra});
try{
 let r=await call('reports');check(r.body.stats.people===0&&r.body.reports.length===0,'zero real people in an empty database');
 r=await call('session',{});const guest=r.cookie;check(r.status===200&&guest&&r.body.canReport,'first anonymous report session');
 const first=report();r=await call('reports',first,'',guest);check(r.body.firstInCity===true,'first available city observation is server verified');check(r.status===201&&r.body.stats.people===1&&r.body.report.country==='IT'&&r.body.report.latitude===42.96,'anonymous report, verified country and approximate location');
 r=await call('reports',first,'',guest);check(r.status===200&&r.body.stats.people===1,'retry is idempotent');
 r=await call('reports',report(),'',guest);check(r.status===401,'second anonymous report requires login');
 r=await call('reports',report({latitude:null}),'alice');check(r.status===400,'invalid coordinates rejected');
 r=await call('reports',report({consent:false}),'alice');check(r.status===400,'explicit location consent required');
 r=await call('reports',report(),'alice','','https://attacker.invalid');check(r.status===403,'cross-origin writes rejected');
 const a=report({level:3});r=await call('reports',a,'alice');check(r.status===201,'authenticated observation saved');check(r.body.firstInCity===false,'second city observation is not labelled first');
 r=await call('delete',{id:a.id},'',guest);check(r.status===403,'another person cannot delete a report');
 await call('session',{},'bob');r=await call('block',{target:(await call('reports',a,'alice')).body.report.author},'bob');check(r.status===200,'block stored');
 r=await call('reports',undefined,'bob');check(!r.body.reports.some(p=>p.id===a.id),'block enforced by server reads');
 r=await call('zone?lat=42.96&lon=13.88');check(r.body.people>=2&&typeof r.body.level==='number','zone combines actual nearby participants');
 r=await call('flag',{id:a.id,reason:'Spam'},'',guest);check(r.status===200,'abuse immediately hides public report');
 r=await call('reports');check(!r.body.reports.some(p=>p.id===a.id),'quarantined report absent publicly');
 r=await call('reports',undefined,'alice');check(r.body.reports.find(p=>p.id===a.id)?.visibility==='only-you','author can still see private quarantined report');
 await env.DB.prepare('UPDATE sky_reports SET expires=? WHERE id=?').bind(Date.now()-1,first.id).run();r=await call('reports');check(!r.body.reports.some(p=>p.id===first.id),'two-hour expiry enforced on server');
 const session2=await call('session',{}),responses=await Promise.all([call('reports',report(),'',session2.cookie),call('reports',report(),'',session2.cookie)]);check(responses.filter(r=>r.status===201).length===1,'concurrent anonymous first reports: exactly one succeeds');
 const trusted=await call('reports',report(),'trust-subject'),author=trusted.body.report.author;
 for(let i=0;i<12;i++)await env.DB.prepare('INSERT INTO sky_evidence VALUES(?,?,?,?,?)').bind('sample-'+i,'independent-'+(i%4),author,0,Date.now()).run();
 r=await call('reports',report(),'trust-subject');check(r.body.report.visibility==='only-you','persistent independent disagreement lowers private visibility');
 const rows=(await call('reports')).body.reports;check(rows.every(r=>!('weight'in r)&&!('trust'in r)),'private reliability never returned as a public score');
 for(const [phenomenon,kind] of Object.entries({'Pioggia':'rain','Neve':'snow','Grandine':'hail','Vento':'wind','Allagamento':'alert','Cielo sereno':'sun'})){
 const draft=report({phenomenon,name:'Voce del cielo 14'});const saved=await call('reports',draft,'quick-'+kind);
 check(saved.status===201&&saved.body.report.phenomenon===phenomenon&&saved.body.report.kind===kind&&saved.body.report.level===null&&saved.body.report.name==='Voce del cielo 14','quick '+phenomenon+' without text or invented intensity');
 const duplicate=await call('reports',draft,'quick-'+kind);check(duplicate.status===200&&duplicate.body.report.id===draft.id,'quick retry retains ID');
 check((await call('note',{id:draft.id,note:'Dal balcone'},'quick-'+kind)).status===200,'optional note saved by owner');
 check((await call('note',{id:draft.id,note:'Other'},'other')).status===403,'note ownership enforced');
 check((await call('reports',undefined,'quick-'+kind)).body.reports.find(r=>r.id===draft.id)?.note==='Dal balcone','note survives fresh read');
 }
 check((await call('reports',report({phenomenon:'Pioggia'}))).status===401,'quick report requires valid session');
 check((await call('reports',report({phenomenon:'Inventato'}),'alice')).status===400,'unknown phenomenon rejected');
 r=await call('nearby?lat=42.96&lon=13.88');check(r.status===200&&r.body.reports.length>0,'local query finds regional observations');check(!r.body.reports.some(p=>p.id===a.id),'local query preserves moderation');check((await call('nearby?lat=0&lon=0')).body.reports.length===0,'local query excludes distant data');check((await call('nearby?lat=91&lon=0')).status===400,'local query validates coordinates');
 console.log(checks+' checks passed');
}finally{local.close();rmSync(dir,{recursive:true,force:true})}
