import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {isRetired} from './tools/retired-modules.mjs';
const root=fileURLToPath(new URL('./',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const visited=new Set();
function walk(filename){
 if(visited.has(filename))return;visited.add(filename);
 const module=new vm.SourceTextModule(fs.readFileSync(filename,'utf8'));
 for(const dependency of module.dependencySpecifiers)if(dependency.startsWith('.'))walk(path.resolve(path.dirname(filename),dependency));
}
walk(path.join(root,'dist/main.js'));
for(const file of visited)assert.equal(isRetired(path.relative(path.join(root,'dist'),file).replaceAll('\\','/')),false,'Retired module enters startup: '+file);
assert.ok(visited.has(path.join(root,'dist/calendar-theme.js')));
const bundle=JSON.parse(read('tools/map-bundle-report.json'));
for(const file of bundle.inputs)assert.equal(isRetired(file.replace(/^dist\//,'')),false);
const events=new Map(),stores=new Map(),requests=[];let offline=false,failPut=false;
const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {async put(key,value){if(failPut)throw Error('Quota');data.set(key,value.clone())},async match(key){return data.get(key)?.clone()}}},async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)}};
vm.runInNewContext(read('dist/sw.js'),{URL,Response,importScripts(){},caches,self:{location:{origin:'https://site.invalid'},clients:{async claim(){}},addEventListener(type,fn){events.set(type,[...(events.get(type)||[]),fn])}},fetch:async(request,options)=>{const pathname=typeof request==='string'?request:new URL(request.url).pathname;requests.push({pathname,options});if(offline)throw Error('Offline');return new Response(pathname,{status:200})}});
let install;events.get('install')[0]({waitUntil:p=>install=p});await install;
assert.ok(requests.some(r=>r.pathname==='/app/main.js'));
assert.ok(requests.some(r=>r.pathname==='/app/style.css'));
assert.ok(requests.every(r=>!isRetired(r.pathname.slice(1))&&!r.pathname.startsWith('/api/')));
await caches.open('meteosocial-shell-old');await caches.open('unrelated-application');
let activate;events.get('activate')[0]({waitUntil:p=>activate=p});await activate;
assert.equal(stores.has('meteosocial-shell-old'),false);
assert.equal(stores.has('unrelated-application'),true);
async function request(pathname){let response;for(const handler of events.get('fetch'))handler({request:new Request('https://site.invalid'+pathname),respondWith:p=>{assert.equal(response,undefined);response=p}});return response?await response:null}
offline=true;assert.equal(await(await request('/app/main.js')).text(),'/app/main.js');
offline=false;failPut=true;assert.equal((await request('/app/main.js')).status,200);failPut=false;
await request('/manifest.json');assert.equal(requests.at(-1).options.cache,'no-store');
assert.equal(await request('/api/me'),null);
assert.equal(await request('/api/posts'),null);
assert.equal(await request('/private-photo.jpg'),null);
assert.equal(await request('/globe.js'),null);
console.log('Startup graph, calendar bundle, offline shell, cache upgrades and private-data exclusions passed.');
