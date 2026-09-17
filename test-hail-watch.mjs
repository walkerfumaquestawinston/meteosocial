import assert from 'node:assert/strict';
import {createHailWatch} from './dist/hail-watch.js';
let checks=0;const check=(v,label)=>{assert.ok(v,label);checks++};
const originalDoc=globalThis.document;
const nodes={};function node(selector){return nodes[selector]??={innerHTML:'',textContent:'',value:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},addEventListener(_,fn){this.onclick=fn}}}
for(const s of ['#hail-watch-places','#hail-watch-notice','[data-hail-watch-add]','[data-hail-watch-live]'])node(s);
globalThis.document={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[]};
let user={id:'A'},places=[{slot:0,name:'Torino',latitude:45.07,longitude:7.68,radius:25}],data={updated:Date.now(),posts:[]},apiCalls=0,toasts=[],pending=null,fail=false,login=0,dialog=null;
const point={name:'Torino',latitude:45.07,longitude:7.68};const flush=()=>new Promise(r=>setImmediate(r));
const ctx={get:()=>({me:user,place:point}),data:()=>data,api:async(path,body)=>{apiCalls++;if(pending)return pending;if(fail)throw Error('Connessione assente');if(body){places=[{...body}];return {ok:true}}return {places:places.map(p=>({...p}))}},toast:t=>toasts.push(t),login:()=>login++,modal:(title,html,fn)=>{dialog={title,html,fn}},select(){}};
try{
 const watch=createHailWatch(ctx);watch.bind();await flush();check(apiCalls===1&&node('#hail-watch-places').innerHTML.includes('Torino'),'signed-in saved zones load');check(node('#hail-watch-places').innerHTML.includes('0 segnalazioni'),'empty count from fresh data');
 node('[data-hail-watch-live]').onclick();check(node('[data-hail-watch-live]').attributes['aria-pressed']==='true','explicit action enables view notices');
 const report={id:'first',city:'Torino',created:Date.now()-1000,observed:Date.now()-1000,map_lat:4507,map_lon:768};data.posts=[report];watch.update();check(toasts.length===1&&toasts[0].includes('1 nuove'),'new nearby report produces one notice');watch.update();check(toasts.length===1,'same report never re-notified');
 data.posts=[report,{...report,id:'far',map_lat:0,map_lon:0}];watch.update();check(toasts.length===1,'distant report does not notify');
 data.posts.push({...report,id:'ended',ended:Date.now()});watch.update();check(toasts.length===1,'ended report does not trigger new-event notice');
 data={updated:Date.now()-90001,posts:[{...report,id:'stale'}]};watch.update();check(toasts.length===1&&node('#hail-watch-places').innerHTML.includes('Dati da aggiornare'),'outdated reports not treated as new');
 node('[data-hail-watch-live]').onclick();node('[data-hail-watch-live]').onclick();check(node('[data-hail-watch-live]').attributes['aria-pressed']==='false','cannot enable monitoring without fresh baseline');
 data={updated:Date.now(),posts:[]};node('[data-hail-watch-add]').onclick();check(dialog.html.includes('private')||dialog.html.includes('solo nel tuo account'),'private save disclosure shown');node('#hail-watch-name').value='Torino';node('#hail-watch-radius').value='10';await dialog.fn();check(places[0].radius===10&&places[0].consent===true,'modal saves explicit radius and consent');
 user=null;watch.paint();check(node('#hail-watch-places').innerHTML.includes('Accedi')&&!node('#hail-watch-places').innerHTML.includes('Torino'),'sign out immediately removes private zones');node('[data-hail-watch-add]').onclick();check(login===1,'anonymous save invokes login');
 let release;pending=new Promise(resolve=>release=resolve);user={id:'A'};watch.bind();user={id:'B'};watch.paint();release({places:[{slot:0,name:'A private area',latitude:45,longitude:7,radius:25}]});await flush();check(!node('#hail-watch-places').innerHTML.includes('A private area'),'late account A response does not leak into account B');pending=null;
 fail=true;watch.bind();await flush();check(node('#hail-watch-places').innerHTML.includes('Connessione assente'),'watch read failure visible, not an empty success');fail=false;watch.invalidate();await flush();check(!node('#hail-watch-places').innerHTML.includes('Connessione assente'),'retry restores saved zones');
 console.log(checks+' hail watch checks passed: consent, foreground notices, deduplication, stale data, identity changes and recovery.');
}finally{globalThis.document=originalDoc}
