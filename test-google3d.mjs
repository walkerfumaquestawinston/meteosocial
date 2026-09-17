import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
import {createGoogle3D,googleFrameURL,google3dEntry,validGooglePoint,resolveGlobeRoute} from './dist/google-3d.js';
let checks=0;const check=(v,label)=>{assert.ok(v,label);checks++};
const dummyKey='AIza'+'x'.repeat(35); // Format fixture, not a Google credential.
const environment={GOOGLE_MAPS_BROWSER_KEY:dummyKey,GOOGLE_3D_ENABLED:'true',OPENAI_API_KEY:'unrelated-server-secret'};
const request=(env,path='/api/maps/google3d',method='GET')=>worker.fetch(new Request('https://test.invalid'+path,{method}),env);
for(const env of [{},{GOOGLE_MAPS_BROWSER_KEY:dummyKey},{...environment,GOOGLE_3D_ENABLED:'false'},{...environment,GOOGLE_MAPS_BROWSER_KEY:'sk-not-a-browser-maps-key'}]){
 const r=await request(env),body=await r.text();check(r.status===503&&!body.includes(dummyKey)&&!body.includes('sk-not'),'missing, disabled or wrong key fails closed');
}
let r=await request(environment),config=await r.json();check(r.status===200&&config.key===dummyKey&&config.enabled===true,'enabled renderer receives exactly the browser Maps key');
check(!JSON.stringify(config).includes('unrelated-server-secret')&&Object.keys(config).length===3,'unrelated runtime values never exposed');
check(r.headers.get('cache-control')==='no-store','configuration is not cached');
check((await request(environment,'/api/maps/google3d','POST')).status===405,'configuration cannot be mutated by visitors');
const me=await(await request(environment,'/api/me')).json();check(me.google3d===true&&!JSON.stringify(me).includes(dummyKey),'startup advertises availability without sharing the key');
check((await(await request({},'/api/me')).json()).google3d===false,'public navigation stays off while unconfigured');
check(resolveGlobeRoute('mondo',true)==='google3d'&&resolveGlobeRoute('globo-meteo',true)==='mondo','satellite replaces main globe while models remain reachable');
check(resolveGlobeRoute('mondo',false)==='mondo'&&resolveGlobeRoute('radar',true)==='radar','disabled satellite and radar retain existing routes');
const p={name:'Roma',latitude:41.9,longitude:12.5};
check(googleFrameURL(p)==='/google-3d-frame.html#lat=41.9&lng=12.5','location is in fragment and no key appears in the iframe URL');
assert.throws(()=>googleFrameURL({latitude:95,longitude:0}));checks++;
check(google3dEntry(false)===''&&google3dEntry(true).includes('#mondo'),'only configured feature gets a public entry');
check(!validGooglePoint({latitude:'41',longitude:12})&&!validGooglePoint({latitude:41,longitude:181}),'incoming coordinates are strictly validated');
for(const asset of ['/google-3d.js','/google-3d.css','/google-3d-frame.html','/google-3d-frame.js'])check((await worker.fetch(new Request('https://test.invalid'+asset),{})).status===200,'renderer assets included in Worker');

// Exercise the actual view controller without a browser, a Google credential,
// third-party requests, or billable map loads.
const saved=Object.fromEntries(['document','window','location'].map(k=>[k,globalThis[k]]));
class Element{constructor(){this.disabled=false;this.hidden=false;this.textContent='';this.innerHTML='';this.dataset={};this.children=[];this.removed=false}setAttribute(k,v){this[k]=v}replaceChildren(...nodes){this.children=nodes}remove(){this.removed=true}}
const doc=new EventTarget(),win=new EventTarget(),open=new Element(),close=new Element(),host=new Element(),status=new Element(),heading=new Element();
const commands=['center','in','out','point','world','flat','relief','labels','select'].map(action=>{const b=new Element();b.dataset.googleCommand=action;return b});
const frames=[],messages=[];
Object.assign(doc,{hidden:false,querySelector:s=>({'#google-view-host':host,'#google-view-status':status,'#google-view-host h2':heading,'[data-google-close]':close}[s]||commands.find(b=>s==='[data-google-command=\"'+b.dataset.googleCommand+'\"]')||null),querySelectorAll:s=>s==='[data-google-command]'?commands:s==='[data-google-open]'?[open]:[],createElement:tag=>{assert.equal(tag,'iframe');const frame=new Element();frame.contentWindow={postMessage:(...args)=>messages.push(args)};frames.push(frame);return frame}});
globalThis.document=doc;globalThis.window=win;globalThis.location={origin:'https://test.invalid',hash:'#google3d'};
let enabled=false,route='google3d',chosen=null,chooseOptions=null;
const view=createGoogle3D({get:()=>({place:p,enabled,route}),searchForm:()=>'',community:()=>{},askAI:()=>{},choose:(point,options)=>{chosen=point;chooseOptions=options}});
const send=(source,origin,data)=>{const e=new Event('message');Object.assign(e,{source,origin,data});win.dispatchEvent(e)};
try{
 check(view.page().includes('NON ANCORA ATTIVO')&&!view.page().includes('<iframe'),'unconfigured page does not create a renderer');
 view.bind();open.onclick();check(frames.length===0,'disabled feature cannot load even if button callback is invoked');
 enabled=true;check(view.page().includes('Apri il globo satellite')&&frames.length===0,'visiting available page alone does not load Google');
 open.onclick();open.onclick();check(frames.length===1&&host.children[0]===frames[0],'double click creates only one renderer');
 check(frames[0].src.endsWith('&world=1'),'primary satellite starts at world scale');
 check(commands.every(b=>b.disabled),'map controls wait for a ready renderer');
 const payload={type:'meteosocial-google-view',state:'ready'};
 send({},location.origin,payload);send(frames[0].contentWindow,'https://other.invalid',payload);check(commands.every(b=>b.disabled),'untrusted window and origin cannot announce readiness');
 send(frames[0].contentWindow,location.origin,payload);check(commands.every(b=>!b.disabled),'renderer ready event enables controls');
 commands[1].onclick();check(messages.at(-1)[0].action==='in'&&messages.at(-1)[1]===location.origin,'commands are sent only to our own frame origin');
 commands.find(b=>b.dataset.googleCommand==='select').onclick();check(messages.at(-1)[0].enabled===true,'selection mode needs explicit visitor action');
 commands.find(b=>b.dataset.googleCommand==='labels').onclick();check(messages.at(-1)[0].enabled===false,'labels toggle shares the existing map');
 send(frames[0].contentWindow,location.origin,{...payload,state:'point',point:{latitude:91,longitude:0}});check(chosen===null,'invalid point never changes local weather');
 doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));check(frames[0].removed&&close.hidden,'backgrounding removes Google runtime instead of leaving it running');
 send(frames[0].contentWindow,location.origin,payload);check(commands.every(b=>b.disabled),'late message from removed renderer cannot revive view');
 open.onclick();check(frames.length===1,'hidden page cannot reopen Google');
 doc.hidden=false;open.onclick();check(frames.length===2,'returning needs another explicit open');
 send(frames[1].contentWindow,location.origin,{...payload,state:'error'});check(frames[1].removed&&status.textContent.includes('non disponibile'),'renderer errors remove frame and offer useful fallback');
 open.onclick();send(frames[2].contentWindow,location.origin,payload);send(frames[2].contentWindow,location.origin,{...payload,state:'point',point:{latitude:40,longitude:10}});check(chosen?.latitude===40&&chooseOptions.keepCamera&&location.hash==='#google3d','explicit point selection requests weather without leaving the satellite');
 const before=frames.length;view.updatePlace({center:false});check(frames.length===before&&messages.findLast(m=>m[0].action==='place')?.[0].center===false,'weather selection preserves renderer and camera');
 view.updatePlace();check(messages.findLast(m=>m[0].action==='place')?.[0].center===true,'city search can center the existing renderer');
 view.dispose();check(frames[2].removed,'navigation cleanup stops renderer');
 console.log(checks+' Google 3D checks passed');
}finally{view.dispose();for(const [key,value] of Object.entries(saved))if(value===undefined)delete globalThis[key];else globalThis[key]=value}
