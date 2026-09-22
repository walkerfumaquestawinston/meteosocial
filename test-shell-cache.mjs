import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const listeners={},requested=[],stored=[];
const context={importScripts(){},self:{addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)},location:{origin:'https://example.test'},clients:{claim:async()=>{}}},caches:{open:async()=>({put:async(url)=>stored.push(url)})},fetch:async(url)=>{requested.push(url);return {ok:true,redirected:false}}};
vm.runInNewContext(fs.readFileSync('dist/sw.js','utf8'),context);
let install;listeners.install[0]({waitUntil:p=>install=p});await install;
assert.ok(requested.includes('/app/main.js'));assert.ok(requested.includes('/app/style.css'));assert.ok(requested.includes('/offline-store.js'));
assert.ok(!requested.some(x=>/map-land|leaflet|local-map-weather|sky-postcard|maplibre/.test(x)),'Secondary routes should not download at installation');
// Every static import needed by the initial bundle must still work offline.
const imports=[...fs.readFileSync('dist/app/main.js','utf8').matchAll(/from\s*["']\.\/([^"']+)["']/g)].map(x=>'/app/'+x[1]);
assert.ok(imports.length>0);for(const file of imports)assert.ok(stored.includes(file),'Missing eager dependency: '+file);
assert.equal(new Set(requested).size,requested.length);
console.log('Shell installation: entrypoint, styles and static dependencies cached; secondary modules deferred.');
