import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from './dist/server/index.js';
import {fieldHours,withinField,rangeBounds} from './dist/map-field-core.js';
const now=Date.now(),db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const env={DB:{prepare:sql=>({bind:(...v)=>({first:async()=>db.prepare(sql).get(...v)||null,all:async()=>({results:db.prepare(sql).all(...v)}),run:async()=>({meta:{changes:db.prepare(sql).run(...v).changes}})})})}};
const origin='https://test.invalid';
async function request(path,body,user='A',extra={}){const headers={...extra};if(user){headers['oai-authenticated-user-id']=user;headers['oai-authenticated-user-email']=user+'@example.invalid'}if(body){headers.origin??=origin;headers['content-type']='application/json'}const r=await worker.fetch(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined}),env);return {status:r.status,data:await r.json(),headers:r.headers};}
const url=(layer='grandine',radius=150,lat=41.9,lon=12.5)=>`atlas/field-reports?layer=${layer}&radius=${radius}&lat=${lat}&lon=${lon}`;
await request('profile',{name:'Tester'});await request('profile',{name:'Other'},'B');
for(const [layer,kind] of Object.entries({temperature:'Temperatura',pioggia:'Pioggia',grandine:'Grandine',vento:'Vento',fulmini:'Fulmini'})){
 const id=crypto.randomUUID(),post={id,city:'Roma',text:'Osservazione di prova '+kind,kind,rapid:true,mapPoint:{latitude:41.91234,longitude:12.51234,consent:true}};
 assert.equal((await request('posts',post,null)).status,401,'auth required');
 assert.equal((await request('posts',post,'A',{origin:'https://evil.invalid'})).status,403,'origin enforced');
 assert.equal((await request('posts',{...post,mapPoint:{...post.mapPoint,consent:false}})).status,400,'location consent required');
 assert.equal((await request('posts',post)).status,200,kind+' can be shared');
 const r=await request(url(layer));assert.equal(r.data.posts.length,1);assert.equal(r.data.posts[0].latitude,41.91);assert.equal(r.data.posts[0].longitude,12.51);assert.ok(r.data.posts[0].expires>now);assert.equal('author' in r.data.posts[0],false);assert.equal('photo' in r.data.posts[0],false);assert.equal(r.headers.get('cache-control'),'no-store');
 assert.equal((await request('network/feed?topic='+encodeURIComponent(kind))).status,200,'community topic available');
}
assert.equal((await request(url('oops'))).status,400);assert.equal((await request(url('grandine',151))).status,400);assert.equal((await request(url('grandine',150,'',12))).status,400);assert.equal((await request(url('grandine',150,86,12))).status,400);
const user=(await request('me',null,'B')).data.id;
function seed(lat,lon,created=now,extra={}){const id=crypto.randomUUID();db.prepare('INSERT INTO posts(id,author,text,city,kind,created,map_lat,map_lon,deleted,expires) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,user,'Test','Zona test',extra.kind||'Grandine',created,Math.round(lat*100),Math.round(lon*100),extra.deleted||0,extra.expires??null);return id;}
const inside=seed(43.1,12.5),outside=seed(43.6,12.5);seed(41.9,12.5,now-7200001);seed(41.9,12.5,now+60000);seed(41.9,12.5,now,{deleted:1});seed(41.9,12.5,now,{expires:now-1});
let rows=(await request(url())).data.posts;assert.ok(rows.some(p=>p.id===inside));assert.ok(!rows.some(p=>p.id===outside));assert.equal(rows.length,2,'stale future deleted expired excluded');assert.equal((await request(url('grandine',50))).data.posts.length,1);
await request('link',{kind:'block',target:user,active:true});assert.equal((await request(url())).data.posts.length,1,'blocks honored');
const dateline=seed(0,-179.9);assert.ok((await request(url('grandine',150,0,179.9),null,'B')).data.posts.some(p=>p.id===dateline),'antimeridian bbox and distance');
const center={latitude:0,longitude:179.9},report={latitude:0,longitude:-179.9,observed:now,expires:now+7200000};assert.equal(withinField([report],center,25,now).length,1);assert.equal(withinField([report],center,10,now).length,0);assert.equal(withinField([{...report,expires:now}],center,150,now).length,0);assert.equal(withinField([{...report,observed:now+1}],center,150,now).length,0);
assert.ok(rangeBounds({latitude:85,longitude:0},150).flat().every(Number.isFinite));
const ts=Date.parse('2026-09-21T12:15Z'),h={timezone:'Europe/Rome',hourly:{time:['2026-09-21T13:00','2026-09-21T14:00','2026-09-21T15:00','2026-09-21T16:00'],temperature_2m:[20,21,22,null]}};
const hours=fieldHours(h,ts);assert.equal(hours.length,2);assert.equal(hours[0].time,Date.parse('2026-09-21T13:00Z'));assert.equal(hours[1].temperature_2m,null,'null is not zero');
assert.equal(fieldHours({timezone:'bad',hourly:h.hourly},ts).length,0);assert.equal(fieldHours({hourly:{time:[null,'bad',Infinity]}},ts).length,0);
assert.equal(fieldHours({timezone:'Europe/Rome',hourly:{time:['2026-10-25T02:00','2026-10-25T02:00']}},Date.parse('2026-10-25T00:00Z')).length,0,'ambiguous duplicated DST slots omitted');
console.log('Field desk: all five report flows, consent, auth, expiry, blocks, 150 km boundaries, dateline and timezone checks passed.');
