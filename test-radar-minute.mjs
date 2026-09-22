import assert from 'node:assert/strict';
import {createAtlasRadar} from './dist/map-radar.js';
const originalNow=Date.now,originalDocument=globalThis.document;let now=1800000000000;Date.now=()=>now;
globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
let added=0,calls=0;const handlers=[];
const L={tileLayer:()=>{const events={};handlers.push(events);return {on(n,f){events[n]=f;return this},off(){},addTo(){added++;return this}}}};
const map={createPane:()=>({style:{}}),removeLayer(){}};
const frame=t=>({time:t,path:'/v2/radar/'+t});let manifest={host:'https://tilecache.rainviewer.com',radar:{past:[frame(now/1000-1200),frame(now/1000-600)]}};
const radar=createAtlasRadar({L,map,onChange(){},fetcher:async()=>{calls++;return {ok:true,json:async()=>manifest}}});
try{
 radar.setEnabled(true);await radar.refresh();assert.equal(calls,1);assert.equal(added,1);assert.equal(radar.snapshot().time,manifest.radar.past.at(-1).time,'first load opens latest frame');handlers.at(-1).load();
 await radar.refresh();assert.equal(calls,1);assert.equal(added,1);
 radar.seek(0);handlers.at(-1).load();const historical=radar.snapshot().time,tiles=added;
 now+=60000;await radar.refresh();assert.equal(calls,2);assert.equal(added,tiles);assert.equal(radar.snapshot().time,historical);
 manifest={...manifest,radar:{past:[...manifest.radar.past,frame(now/1000-300)]}};now+=60000;await radar.refresh();assert.equal(radar.snapshot().time,historical,'do not jump away from selected history');
 radar.seek(2);manifest={...manifest,radar:{past:[...manifest.radar.past,frame(now/1000-120)]}};now+=60000;await radar.refresh();assert.equal(radar.snapshot().time,manifest.radar.past.at(-1).time,'follow latest when latest was selected');
 console.log('Minute radar checks reuse unchanged tiles, keep historical selection and follow the newest frame.');
}finally{radar.dispose();Date.now=originalNow;globalThis.document=originalDocument;}
