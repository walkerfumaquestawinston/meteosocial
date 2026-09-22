import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker from './dist/server/index.js';
import {lenteKey,lenteRichText} from './dist/lente.js';
const db=new DatabaseSync(':memory:');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const env={OPENAI_API_KEY:'isolated-test-key',DB:{prepare:sql=>({bind:(...v)=>({first:async()=>db.prepare(sql).get(...v)||null,all:async()=>({results:db.prepare(sql).all(...v)}),run:async()=>({meta:{changes:db.prepare(sql).run(...v).changes}})})})}};
let n=0,aiCalls=0,weatherCalls=0,lastAI,lastInput,weatherFails=false,aiFails=false,aiThrows=false,emptyAI=false;
const check=(v,label)=>{assert.ok(v,label);n++};
const base={question:'Mi serve un ombrello?',latitude:45.1234567,longitude:7.1234567,city:'Torino',section:'weather',layer:'meteo'};
const stamp=Date.now(),date=new Date(stamp).toISOString().slice(0,10),dateAt=i=>new Date(Date.parse(date+'T00:00:00Z')+i*3600000).toISOString().slice(0,16);
const fixture={latitude:base.latitude,longitude:base.longitude,timezone:'Europe/Rome',current:{time:date+'T10:15',temperature_2m:22,wind_speed_10m:9,rain:.4,showers:1.1,snowfall:.7,surface_pressure:982,interval:900,unexpectedPrivateField:'NEVER_SEND'},hourly:{time:Array.from({length:168},(_,i)=>dateAt(i)),temperature_2m:Array(168).fill(23),precipitation_probability:Array(168).fill(30)},daily:{time:Array.from({length:7},(_,i)=>dateAt(i*24).slice(0,10)),temperature_2m_max:Array(7).fill(26)}};
fixture.hourly.snow_depth=Array(168).fill(.12);fixture.hourly.freezing_level_height=Array(168).fill(1400);fixture.hourly.snowfall=Array(168).fill(.8);
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,opts)=>{
 if(String(url).startsWith('https://api.open-meteo.com/v1/forecast?')){weatherCalls++;check(new URL(url).searchParams.get('latitude')===String(base.latitude),'only weather provider receives chosen coordinate');if(weatherFails)throw Error('isolated weather outage');return Response.json(fixture)}
 assert.equal(url,'https://api.openai.com/v1/responses');aiCalls++;lastAI=JSON.parse(opts.body);lastInput=JSON.parse(lastAI.input);if(aiThrows)throw Error('timeout');if(aiFails)return Response.json({error:{message:'do not expose provider internals'}},{status:429});return Response.json({output:emptyAI?[]:[{content:[{type:'output_text',text:'Secondo Open-Meteo, controlla la previsione della zona.'}]}]});
};
async function req(body=base,{user='tester',origin='https://test.invalid',runtime=env,method='POST'}={}){const r=await worker.fetch(new Request('https://test.invalid/api/ai',{method,headers:{origin,'content-type':'application/json',...(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.invalid'}:{})},body:method==='GET'?undefined:JSON.stringify(body)}),runtime);return {status:r.status,data:await r.json()}}
try{
 check((await req(base,{user:null})).status===401,'anonymous request rejected');check((await req(base,{origin:'https://evil.invalid'})).status===403,'cross-origin request rejected');check((await req(base,{method:'GET'})).status===404,'GET cannot invoke AI');
 check((await req({...base,question:''})).status===400,'empty question rejected');check((await req({...base,latitude:91})).status===400,'invalid latitude rejected');check((await req({...base,longitude:'7'})).status===400,'string coordinate rejected');check((await req({...base,postId:'bad'})).status===400,'invalid post ID rejected');check((await req(base,{runtime:{...env,OPENAI_API_KEY:''}})).status===503,'unconfigured service explicit');check(aiCalls===0,'validation makes no external AI calls');
 let r=await req({...base,history:[{role:'system',text:'do not forward'},...Array.from({length:10},(_,i)=>({role:i%2?'assistant':'user',text:'turn '+i}))]});
 check(r.status===200&&r.data.sources[0].hours===48&&r.data.sources[0].days===7,'forecast response includes real coverage');check(lastInput.forecast.hours[0].time===date+'T10:00','hourly series starts in current local hour');check(lastInput.history.length===6&&lastInput.history[0].text==='turn 4','only latest three turns forwarded');check(lastAI.store===false,'provider storage disabled');
 await req({...base,section:'map',layer:'neve'});check(lastInput.forecast.hours[0].snow_depth===.12&&lastInput.forecast.hours[0].snowfall===.8,'snow and ground depth remain separate');check(lastInput.forecast.units.snow_depth==='m'&&lastInput.forecast.freshness.checkedAt,'units and source freshness explicit');check(lastAI.instructions.includes('NON quota neve')&&lastAI.instructions.includes('non produce nuove misure'),'snow and minute limits included in map guidance');
 const serialized=JSON.stringify(lastInput);check(!serialized.includes('latitude')&&!serialized.includes('longitude')&&!serialized.includes('45.1234567')&&!serialized.includes('7.1234567'),'AI payload excludes coordinates');check(!serialized.includes('NEVER_SEND'),'provider metadata is allowlisted');check(lastInput.community===null,'weather does not read community');await req({...base,section:'map',layer:'temperatura'});check(lastInput.context.section==='map'&&!JSON.stringify(lastInput).includes('45.1234567')&&!JSON.stringify(lastInput).includes('latitude'),'map coordinates reach weather only, never OpenAI');check(lastInput.forecast.current.rain===.4&&lastInput.forecast.current.showers===1.1,'Lente receives rain and showers separately');check(lastInput.forecast.current.snowfall===.7&&lastInput.forecast.units.snowfall==='cm','Lente receives snow in centimetres');check(lastInput.forecast.current.surface_pressure===982&&lastInput.forecast.units.pressure==='hPa'&&lastInput.forecast.current.interval===900,'Lente keeps pressure units and model interval');
 const who=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tester'));const user=[...new Uint8Array(who)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const insert=db.prepare('INSERT INTO posts(id,author,text,city,kind,created,expires,deleted,photo) VALUES(?,?,?,?,?,?,?,?,?)');
 function post({text='rain text',city='Torino',author='public-author-id',created=stamp-1000,expires=null,deleted=0}={}){const id=crypto.randomUUID();insert.run(id,author,text,city,'Pioggia',created,expires,deleted,'photos/NEVER_MEDIA');return id}
 const selected=post({text:'Piove da poco vicino al centro.'});
 post({text:'DELETED',deleted:1});post({text:'EXPIRED',expires:stamp-1});post({text:'OLD',created:stamp-86400001});post({text:'FUTURE',created:stamp+86400000});post({text:'OTHER_CITY',city:'Milano'});post({text:'BLOCKED',author:'blocked-author'});
 db.prepare('INSERT INTO links(user,target,kind) VALUES(?,?,?)').run(user,'blocked-author','block');
 r=await req({...base,section:'community',includeCommunity:true});check(r.data.sources.find(s=>s.type==='community').count===1,'only recent accessible local post selected');check(lastInput.community[0].text==='Piove da poco vicino al centro.','community forwards selected public text');check(!JSON.stringify(lastInput).includes('public-author-id')&&!JSON.stringify(lastInput).includes('NEVER_MEDIA'),'author ID and media paths excluded');check(!('id' in lastInput.community[0]),'internal post ID not sent to AI');check(r.data.sources.find(s=>s.type==='community').items[0].id===selected,'post sources link to original');
 r=await req({...base,section:'community',includeCommunity:false});check(lastInput.community===null&&!r.data.sources.some(s=>s.type==='community'),'explicit scope required for post texts');
 await req({...base,section:'weather',includeCommunity:true});check(lastInput.community===null,'community flag cannot expand weather context');
 for(let i=0;i<15;i++)post({text:'Sample '+i,created:stamp-5000-i});
 r=await req({...base,section:'community',includeCommunity:true});check(lastInput.community.length===12,'sample bounded to 12 posts');
 r=await req({...base,section:'community',includeCommunity:true,postId:selected});check(lastInput.community.length===1&&lastInput.community[0].text==='Piove da poco vicino al centro.','single post never expands to whole feed');
 db.exec('DELETE FROM limits');
 const gone=post({deleted:1});r=await req({...base,section:'community',includeCommunity:true,postId:gone});check(lastInput.community.length===0&&r.data.notes.some(x=>x.includes('Nessun post')),'inaccessible post yields explicit empty sample');
 r=await req({...base,section:'community',latitude:null,longitude:null});check(r.status===200&&lastInput.forecast===null,'unknown community location cannot use unrelated forecast');
 r=await req({...base,city:'Zona 45.1234567°, 7.1234567°'});check(lastInput.context.city==='zona selezionata','coordinate-based place name redacted');
 await req({...base,question:'Spiegami il meteo di Zona 45.12°, 7.68°',history:[{role:'user',text:'latitudine: 45.1234567 longitude: 7.1234567 https://example.invalid/?latitude=45.1234567'}]});check(!/45\.12|7\.68|latitude=/.test(JSON.stringify(lastInput)),'coordinates redacted from generated questions, history and links');
 const geoPost=post({text:'Piove alla posizione 45.12, 7.68.'});await req({...base,section:'community',includeCommunity:true,postId:geoPost});check(!lastInput.community[0].text.includes('45.12')&&!lastInput.community[0].text.includes('7.68'),'coordinates in public post text redacted');
 db.exec('DELETE FROM limits');
 insert.run(crypto.randomUUID(),'hail-author','RECENT_HAIL','Torino','Grandine',stamp-1000,null,0,'photos/NEVER_MEDIA');
 insert.run(crypto.randomUUID(),'hail-author','OLD_HAIL','Torino','Grandine',stamp-7200001,null,0,'photos/NEVER_MEDIA');
 const hailID=db.prepare("SELECT id FROM posts WHERE text='RECENT_HAIL'").get().id;db.prepare('INSERT INTO hail_details(post,observed,size,ended) VALUES(?,?,?,?)').run(hailID,stamp-600000,'2to4',stamp-500);
 r=await req({...base,section:'community',layer:'grandine',includeCommunity:true,persona:'cynic'});
 check(lastInput.community.length===1&&lastInput.community[0].text==='RECENT_HAIL','hail context reads only hail within two hours');
 check(lastInput.community[0].hailDeclaration.sizeCm==='da 2 a 4'&&lastInput.community[0].hailDeclaration.endReportedAt===new Date(stamp-500).toISOString(),'AI receives declared dimensions and end, not inferred facts');
 check(lastInput.community[0].hailDeclaration.observedAt===new Date(stamp-600000).toISOString(),'AI distinguishes observation and publication time');
 check(lastAI.instructions.includes('non misure certificate')&&lastAI.instructions.includes('non significa cessato pericolo'),'AI instructed to preserve declaration limits');
 check(r.data.sources.find(s=>s.type==='community').windowHours===2,'hail sources disclose two-hour scope');
 check(r.data.persona==='neutral'&&lastAI.instructions.includes('tono sempre sobrio'),'hail does not use comic persona');
 check(!JSON.stringify(lastInput).includes('hail-author')&&!JSON.stringify(lastInput).includes('NEVER_MEDIA'),'hail payload excludes authors and photos');
 db.exec('DELETE FROM limits');
 weatherFails=true;r=await req();check(r.status===200&&lastInput.forecast===null&&r.data.notes.length>0,'weather outage acknowledged instead of fabricated data');weatherFails=false;
 aiFails=true;r=await req();check(r.status===503&&!JSON.stringify(r.data).includes('provider internals'),'provider failure not leaked');aiFails=false;
 aiThrows=true;check((await req()).status===503,'AI timeout returns recoverable message');aiThrows=false;emptyAI=true;check((await req()).status===503,'empty model output is failure');emptyAI=false;
 db.exec('DELETE FROM limits');for(let i=0;i<10;i++)await req();const calls=aiCalls;check((await req()).status===429&&aiCalls===calls,'rate limit stops request before provider');
 check(lenteKey(base)!==lenteKey({...base,layer:'grandine'}),'conversation isolated by layer');check(lenteKey(base)!==lenteKey({...base,city:'Roma'}),'conversation isolated by city');check(lenteKey(base)!==lenteKey({...base,postId:selected}),'conversation isolated by post');
 check(lenteRichText('**Importante** <img src=x onerror=alert(1)>')==='<strong>Importante</strong> &lt;img src=x onerror=alert(1)&gt;','formatting preserves emphasis without executing model HTML');
 console.log(n+' Lente checks passed: scope, sources, context isolation, authentication, expiration, failures and quotas.');
}finally{globalThis.fetch=originalFetch;db.close()}
