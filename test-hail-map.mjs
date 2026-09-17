import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker from './dist/server/index.js';
import {mapHailReports,hailAge,createHailMap} from './dist/hail-map.js';
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const env={DB:{prepare:sql=>({bind:(...v)=>({first:async()=>db.prepare(sql).get(...v)||null,all:async()=>({results:db.prepare(sql).all(...v)}),run:async()=>({meta:{changes:db.prepare(sql).run(...v).changes}})})})}};
let n=0;const check=(v,label)=>{assert.ok(v,label);n++};const now=Date.now(),place={name:'Zona scelta',latitude:43,longitude:13};
async function req(path,body,user='tester'){const r=await worker.fetch(new Request('https://test.invalid'+path,{method:body?'POST':'GET',headers:{origin:'https://test.invalid','content-type':'application/json',...(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.invalid'}:{})},body:body?JSON.stringify(body):undefined}),env);return {status:r.status,data:await r.json(),headers:r.headers}}
try{
 await req('/api/profile',{name:'Tester'});const who=(await req('/api/me')).data.id;
 const base={text:'Grandine osservata dalla finestra.',city:'Comune fuori catalogo',kind:'Grandine',rapid:true};
 let r=await req('/api/posts',{...base,id:crypto.randomUUID(),mapPoint:{latitude:43.123456,longitude:13.123456,consent:true}});check(r.status===200,'consenting report saved');
 const row=db.prepare('SELECT * FROM posts').get();check(row.map_lat===4312&&row.map_lon===1312,'server rounds before storage');check(!JSON.stringify(row).includes('43.123456'),'precise coordinates not persisted');
 const id=row.id;
 r=await req('/api/posts',{...base,id,mapPoint:{latitude:2,longitude:3,consent:true}});check(r.status===200&&db.prepare('SELECT map_lat FROM posts WHERE id=?').get(id).map_lat===4312,'retry cannot change mapped location');
 for(const mapPoint of [{latitude:43,longitude:13},{latitude:90,longitude:13,consent:true},{latitude:'43',longitude:13,consent:true},{latitude:43,longitude:181,consent:true},null])check((await req('/api/posts',{...base,id:crypto.randomUUID(),mapPoint})).status===400,'invalid or unconsented coordinate rejected');
 check((await req('/api/posts',{...base,kind:'Pioggia',id:crypto.randomUUID(),mapPoint:{latitude:43,longitude:13,consent:true}})).status===400,'map metadata limited to hail');
 const legacy=crypto.randomUUID();await req('/api/posts',{...base,id:legacy});check(db.prepare('SELECT map_lat FROM posts WHERE id=?').get(legacy).map_lat===null,'optional zone remains absent');
 check((await req('/api/posts',{...base,id:crypto.randomUUID()},'')).status===401,'anonymous publication forbidden');
 r=await req('/api/atlas/hail-map',null,'');check(r.status===200&&r.data.posts.length===2,'public map shows saved community data');check(r.headers.get('cache-control')==='no-store','no public identity cache');check(!JSON.stringify(r.data).includes(who),'map excludes author identity');
 let s=mapHailReports(r.data,place,{minutes:120,radius:50});check(s.points.length===1&&s.points[0].name===base.city,'non-catalog location maps from consent');check(s.unplaced.length===1,'unlocated report retained in separate list');
 const insert=db.prepare('INSERT INTO posts(id,author,text,city,kind,created,expires,deleted,map_lat,map_lon) VALUES(?,?,?,?,?,?,?,?,?,?)');
 function add({city='Roma',kind='Grandine',created=now-1000,expires=null,deleted=0,lat=null,lon=null}={}){insert.run(crypto.randomUUID(),'other','report',city,kind,created,expires,deleted,lat,lon)}
 add();add({kind:'Pioggia'});add({created:now-7200001});add({created:now+60000});add({expires:now-1});add({deleted:1});
 r=await req('/api/atlas/hail-map',null,'');check(r.data.posts.length===3,'future old expired deleted and other phenomena excluded');
 s=mapHailReports(r.data,place,{minutes:120,radius:0});check(s.points.some(p=>p.name==='Roma'&&p.origin.includes('Centro')),'legacy catalog city clearly marked as city center');
 const fixture={updated:now,posts:[{id:'a',city:'Test',created:now-60000,map_lat:4300,map_lon:1300},{id:'b',city:'Test',created:now-120000,map_lat:4300,map_lon:1300},{id:'c',city:'Lontana',created:now-60000,map_lat:4800,map_lon:1300},{id:'d',city:'Old',created:now-3600000,map_lat:4300,map_lon:1300}]};
 s=mapHailReports(fixture,place,{minutes:15,radius:25},now);check(s.points.length===1&&s.shown===2&&s.points[0].reportCount===2,'same time and distance filter drives grouped pins and list');check(s.points[0].lastReport===now-60000,'pin age is latest report age');
 check(mapHailReports(fixture,place,{minutes:120,radius:0},now).shown===4,'all zones filter includes distant reports');
 check(mapHailReports({...fixture,updated:now-90001},place,{},now).points.length===0,'stale snapshots do not display live pins');check(mapHailReports({...fixture,updated:now+60001},place,{},now).fresh===false,'future snapshots rejected');
 check(hailAge(now-59000,now)==='meno di 1 min fa'&&hailAge(now-61000,now)==='1 min fa','plain time labels');
 db.prepare('INSERT INTO links(user,target,kind) VALUES(?,?,?)').run(who,'other','block');r=await req('/api/atlas/hail-map');check(r.data.posts.length===2,'blocked authors removed from current viewer map');
 await req('/api/delete',{id});r=await req('/api/atlas/hail-map');check(r.data.posts.every(p=>p.id!==id),'deleted report disappears');
 for(let i=0;i<501;i++)add({created:now-2000-i});r=await req('/api/atlas/hail-map',null,'');check(r.data.posts.length===500&&r.data.truncated,'bounded national sample disclosed');
 const realDoc=globalThis.document,realInterval=globalThis.setInterval;let tick,visibility,called=0,fail=false,updates=0;
 globalThis.document={hidden:false,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(event,fn)=>{if(event==='visibilitychange')visibility=fn}};
 globalThis.setInterval=(fn,ms)=>{check(ms===30000,'refresh interval configured to 30 seconds');tick=fn;return 1};
 try{
  const controller=createHailMap({get:()=>({place,me:null}),api:async()=>{called++;if(fail)throw Error('offline');return {...fixture,updated:Date.now()}},onUpdate:()=>updates++,askAI(){},modal(){},select(){},toast(){}});
  controller.setVisible(true);controller.bind();await new Promise(resolve=>setTimeout(resolve,0));check(called===1&&controller.points().length===2,'first load paints persisted reports');
  tick();await new Promise(resolve=>setTimeout(resolve,0));check(called===2,'next tick requests current data even if cache is young');
  document.hidden=true;tick();check(called===2,'hidden tab does not poll');document.hidden=false;visibility();await new Promise(resolve=>setTimeout(resolve,0));check(called===3,'return from background refreshes');
  fail=true;tick();await new Promise(resolve=>setTimeout(resolve,0));check(controller.points().length===0,'network failure removes current pins');
  fail=false;tick();await new Promise(resolve=>setTimeout(resolve,0));check(controller.points().length===2&&updates>0,'successful retry restores pins');
  controller.setVisible(false);const before=called;tick();check(called===before,'other map layers do not poll hail');
 }finally{globalThis.document=realDoc;globalThis.setInterval=realInterval}
 console.log(n+' hail map checks passed: consent, rounding, persistence, geography, filtering, expiration and visibility.');
}finally{db.close()}
