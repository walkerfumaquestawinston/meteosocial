import assert from 'node:assert/strict';
import {waitForMap} from './dist/local-map.js';
import {createMapWeather} from './dist/local-map-weather.js';
// A failed/abandoned base-map load must release its listener and timeout.
function fakeMap(){const events=new Map();return {events,on:(n,f)=>events.set(n,f),off:(n,f)=>{if(events.get(n)===f)events.delete(n)}}}
let m=fakeMap(),ac=new AbortController(),p=waitForMap(m,ac.signal);m.events.get('load')();await p;assert.equal(m.events.size,0);
m=fakeMap();ac=new AbortController();p=waitForMap(m,ac.signal);ac.abort();await assert.rejects(p,{name:'AbortError'});assert.equal(m.events.size,0);
const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;let expire;
try{globalThis.setTimeout=fn=>{expire=fn;return 1};globalThis.clearTimeout=()=>{};m=fakeMap();p=waitForMap(m,new AbortController().signal);expire();await assert.rejects(p,/cartografia non risponde/);assert.equal(m.events.size,0)}finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear}
// Delayed requests from a previous layer cannot overwrite the current UI.
const original={document:globalThis.document,matchMedia:globalThis.matchMedia,fetch:globalThis.fetch,cancelAnimationFrame:globalThis.cancelAnimationFrame,requestAnimationFrame:globalThis.requestAnimationFrame};
const node=()=>({hidden:false,textContent:'',innerHTML:'',style:{},setAttribute(k,v){this[k]=v},remove(){}}),elements=new Map(),buttons=['rain','wind','temperature'].map(kind=>({...node(),dataset:{mapLayer:kind}}));
const selector=s=>{if(!elements.has(s))elements.set(s,node());return elements.get(s)};
let status='',requests=[];
try{
 globalThis.document={hidden:false,documentElement:{classList:{contains:()=>false}},querySelector:selector,querySelectorAll:()=>buttons,createElement:tag=>({...node(),getContext:()=>({clearRect(){}})})};
 globalThis.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});globalThis.cancelAnimationFrame=()=>{};globalThis.requestAnimationFrame=()=>1;
 globalThis.fetch=(url,options)=>new Promise((resolve,reject)=>requests.push({url:String(url),options,resolve,reject}));
 const map={getContainer:()=>({append(){},getBoundingClientRect:()=>({width:375,height:600})}),on(){},getBounds:()=>({getWest:()=>13.8,getEast:()=>13.9,getSouth:()=>42.9,getNorth:()=>43}),getZoom:()=>11,getLayer:()=>null};
 const w=createMapWeather(map,{get:()=>({place:{latitude:43,longitude:13.8}})},s=>status=s);
 buttons[1].onclick();assert.equal(buttons.filter(b=>b['aria-pressed']==='true').length,1);
 const rain=requests.find(r=>r.url.includes('rainviewer'));rain.reject(Error('offline'));await new Promise(r=>setImmediate(r));assert.equal(status,'');
 const grid=requests.find(r=>r.url.includes('open-meteo'));buttons[0].onclick();assert.equal(grid.options.signal.aborted,true);grid.reject(Error('late response'));await new Promise(r=>setImmediate(r));assert.equal(selector('#local-map-weather-note').textContent,'');
 const last=requests.at(-1);w.dispose();last.reject(Error('disposed'));await new Promise(r=>setImmediate(r));
}finally{for(const [key,value]of Object.entries(original))if(value===undefined)delete globalThis[key];else globalThis[key]=value}
console.log('Map lifecycle: first load, navigation abort, bounded timeout, single selection, cancelled grid request and stale-message isolation passed.');
