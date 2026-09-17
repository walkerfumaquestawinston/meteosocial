import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from './dist/server/index.js';
import {hailEvidence,hailQuestion} from './dist/hail.js';
const db=new DatabaseSync(':memory:');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const env={DB:{prepare:sql=>({bind:(...v)=>({first:async()=>db.prepare(sql).get(...v)||null,all:async()=>({results:db.prepare(sql).all(...v)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...v).changes)}})})})}};
let n=0;const check=(v,label)=>{assert.ok(v,label);n++},now=Date.now();
async function req(path,user=''){return worker.fetch(new Request('https://test.invalid/api/'+path,{headers:user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.invalid'}:{}}),env)}
const insert=db.prepare('INSERT INTO posts(id,author,text,city,kind,created,expires,deleted) VALUES(?,?,?,?,?,?,?,?)');
function post({author='same',city='Torino',kind='Grandine',created=now-1000,expires=null,deleted=0,text='Chicchi sul balcone.'}={}){insert.run(crypto.randomUUID(),author,text,city,kind,created,expires,deleted)}
try{
 check((await req('atlas/hail')).status===400,'city required');
 post();post();post({author:'second'});post({city:'Roma'});post({kind:'Pioggia'});post({created:now-7200001});post({created:now+60000});post({expires:now-1});post({deleted:1});
 let r=await req('atlas/hail?city=torino'),d=await r.json();
 check(r.status===200,'public read works');check(d.reports===3,'only current city hail, no future expired or deleted posts');check(d.contributors===2,'repeat posts are not independent accounts');check(d.posts.length===3,'post details available');check(d.windowHours===2,'two-hour window disclosed');check(!JSON.stringify(d).includes('"author"'),'no author identities exposed');check(r.headers.get('cache-control')==='no-store','no shared personal cache');
 const who=await(await req('me','tester')).json();db.prepare('INSERT INTO links(user,target,kind) VALUES(?,?,?)').run(who.id,'same','block');
 d=await(await req('atlas/hail?city=Torino','tester')).json();check(d.reports===1&&d.contributors===1,'blocked accounts excluded from counts and list');
 for(let i=0;i<15;i++)post({author:'repeat',created:now-2000-i});
 d=await(await req('atlas/hail?city=Torino')).json();check(d.posts.length===12&&d.truncated&&d.reports===18,'bounded sample separate from complete local count');check(d.contributors===3,'repeated contributor counted once');
 check((await(await req('atlas/hail?city='+encodeURIComponent("Torino' OR 1=1 --"))).json()).reports===0,'parameter binding resists query injection');
 check(hailEvidence(null).fresh===false,'missing is not safe');check(hailEvidence({...d,updated:now-120001},now).fresh===false,'stale is not current');check(hailEvidence({...d,updated:now+60001},now).fresh===false,'future snapshot rejected');
 const empty=hailEvidence({...d,reports:0,contributors:0},now);check(empty.fresh&&empty.detail.includes('non significa nessun rischio'),'empty community not absence of risk');
 check(hailQuestion('auto').includes('auto')&&hailQuestion('casa').includes('casa'),'context-specific prompts');check(hailQuestion('fuori').includes('Non proporre itinerari sicuri'),'no promised safe route');
 check((await req('../hail.js')).status===200,'module is packaged and served');check((await req('../hail.css')).status===200,'stylesheet is packaged and served');
 console.log(n+' Grandine chiara checks passed: query scope, counts, expiry, blocks, missing data and assets.');
}finally{db.close()}
