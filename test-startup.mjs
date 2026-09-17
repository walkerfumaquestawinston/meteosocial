// Run: node --experimental-vm-modules test-startup.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let checks=0;
function check(value,message){assert.ok(value,message);checks++}
const read=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8');
const visited=new Set();
function walk(filename){
  if(visited.has(filename))return;visited.add(filename);
  const module=new vm.SourceTextModule(fs.readFileSync(filename,'utf8'));
  for(const dependency of module.dependencySpecifiers)if(dependency.startsWith('.'))walk(path.resolve(path.dirname(filename),dependency));
}
walk(fileURL('dist/main.js'));
function fileURL(file){return new URL(file,import.meta.url).pathname}
check(![...visited].some(file=>/\/(?:globe|avatar|land-mesh|three\.module|three\.core)\.js$/.test(file)),'Home must not statically import 3D');
const initialBytes=[...visited].reduce((total,file)=>total+fs.statSync(file).size,0);

// Intent listener: no startup timer, new links work after a render, unrelated focus does not preload.
const prefetch=read('dist/main.js').split('// Precarica il 3D solo all\'intenzione dell\'utente, mai all\'avvio.')[1];
check(!!prefetch,'Intent prefetch exists');
const listeners=new Map();let imports=0,rejectImport=false;
class Element{constructor(link=false){this.link=link}closest(){return this.link?this:null}}
const scope=vm.createContext({Element,document:{addEventListener:(type,fn)=>listeners.set(type,fn)},load:()=>{imports++;return rejectImport?Promise.reject(Error()):Promise.resolve()}});
vm.runInContext(prefetch.replace("import('./globe.js')",'load()'),scope);
check(imports===0,'No import at initialization');
listeners.get('focusin')({target:new Element(false)});check(imports===0,'Unrelated focus ignored');
listeners.get('pointerenter')({target:new Element(true)});check(imports===1,'Hover starts one import');
listeners.get('touchstart')({target:new Element(true)});check(imports===1,'Touch does not duplicate in-flight import');

// Exercise the actual social module with a deferred dynamic import.
let host=null,mounted=0,disposed=0,resolveAvatar;
const deferred=new Promise(resolve=>resolveAvatar=resolve),avatarModule=new vm.SyntheticModule(['mountAvatar'],function(){this.setExport('mountAvatar',()=>{mounted++;return {dispose(){disposed++}}})});
await avatarModule.link(()=>{});await avatarModule.evaluate();
const socialScope=vm.createContext({document:{querySelector:s=>s==='#avatar-stage'?host:s==='#dialog'?{addEventListener(){}}:null,querySelectorAll:()=>[]},setInterval(){}});
const socialModule=new vm.SourceTextModule(read('dist/social.js'),{context:socialScope,importModuleDynamically:()=>deferred});
await socialModule.link(()=>{});await socialModule.evaluate();
const social=socialModule.namespace.createSocial({get:()=>({route:'home',me:null})});social.bind();
check(mounted===0,'Home does not mount an avatar');
host={isConnected:true,innerHTML:''};social.bind();host.isConnected=false;social.dispose();resolveAvatar(avatarModule);
await new Promise(resolve=>setImmediate(resolve));check(mounted===0,'Detached avatar is not mounted after load');
host={isConnected:true,innerHTML:''};social.bind();await new Promise(resolve=>setImmediate(resolve));check(mounted===1,'Avatar still mounts on demand');
social.dispose();check(disposed===1,'Avatar resources are disposed');

// Service worker: lazy cache, offline replay and safe cache upgrades.
const events=new Map(),stores=new Map(),requests=[];let offline=false,failPut=false;
const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {async put(key,value){if(failPut)throw Error('Quota');data.set(key,await value.clone())},async match(key){return data.get(key)?.clone()}}},async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)}};
vm.runInNewContext(read('dist/sw.js'),{URL,Response,caches,self:{location:{origin:'https://site.invalid'},clients:{async claim(){}},addEventListener(type,fn){events.set(type,[...(events.get(type)||[]),fn])}},fetch:async(request,options)=>{const pathname=typeof request==='string'?request:new URL(request.url).pathname;requests.push({pathname,options});if(offline)throw Error('Offline');return new Response(pathname,{status:200})}});
let install;events.get('install')[0]({waitUntil:p=>install=p});await install;
const lazy=['/globe.js','/avatar.js','/assets/land-mesh.js','/assets/three.module.js','/assets/three.core.js'];
check(lazy.every(file=>!requests.some(r=>r.pathname===file)),'Install skips every 3D module');
const old=await caches.open('meteosocial-shell-v15');await old.put('/assets/three.core.js',new Response('previous offline copy'));
const beforeActivation=requests.length;let activate;events.get('activate')[0]({waitUntil:p=>activate=p});await activate;
check(requests.length===beforeActivation,'Upgrade reuses 3D without fetching');
check(!stores.has('meteosocial-shell-v15'),'Old shell is removed after copying');
async function request(pathname){let response;for(const handler of events.get('fetch'))handler({request:new Request('https://site.invalid'+pathname),respondWith:p=>{assert.equal(response,undefined);response=p}});return response?await response:null}
offline=true;check(await (await request('/assets/three.core.js')).text()==='previous offline copy','Cached 3D survives upgrade offline');
offline=false;await request('/globe.js');offline=true;check(await (await request('/globe.js')).text()==='/globe.js','Opened 3D remains available offline');
offline=false;failPut=true;check((await request('/avatar.js')).status===200,'Cache failure does not discard successful download');failPut=false;
await request('/manifest.json');check(requests.at(-1).options?.cache==='no-store','Manifest stays network-only');
check(await request('/api/me')===null,'Identity and APIs are not cached');
console.log(JSON.stringify({checks,initialStaticBytes:initialBytes,moduleCount:visited.size,threeAtStartup:false}));
