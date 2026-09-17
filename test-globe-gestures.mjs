import {precipitationTexture,precipitationSamples} from './dist/world-weather.js';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {solarDirection,daylight} from './dist/solar-position.js';
const source=fs.readFileSync('dist/living-renderer.js','utf8').replace(/^import .*;\n/gm,'').replace('export function mountLivingGlobe','function mountLivingGlobe')+'\nmountLivingGlobe';
function setup(options={}){
 let now=1,id=0,points=0;const frames=new Map(),timers=new Map(),listeners={};
 const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const makeCanvas=()=>({setAttribute(){},style:{},getContext:()=>context,setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:375,height:450})});
 const doc={hidden:false,documentElement:{classList:{contains:()=>false}},createElement:()=>makeCanvas(),addEventListener:(n,f)=>listeners[n]=f,removeEventListener:n=>delete listeners[n]};
 const host={clientWidth:375,clientHeight:450,dataset:{},replaceChildren(c){if(c)this.canvas=c}};
 const mount=vm.runInNewContext(source,{THREE:{Vector3:class{set(){}},WebGLRenderer:class{constructor(){throw Error('software')}}},precipitationTexture,precipitationSamples,solarDirection,daylight,CITIES:[],landPositions:[],coastPositions:[],document:doc,matchMedia:()=>({matches:false}),performance:{now:()=>now},Image:class{},ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),setInterval:()=>++id,clearInterval(){},setTimeout:(f,delay)=>{timers.set(++id,{f,at:now+delay});return id},clearTimeout:i=>timers.delete(i),Date,Math});
 let city={latitude:20,longitude:30};const globe=mount(host,{center:{latitude:0,longitude:0},getCenter:()=>city,onPoint:()=>points++,...options});
 function step(t){now=t;for(const [i,v] of [...timers])if(v.at<=now){timers.delete(i);v.f()}const batch=[...frames];frames.clear();for(const [,f]of batch)f(now)}
 function event(type,x=180,y=220,pointerId=1){host.canvas['onpointer'+type]({clientX:x,clientY:y,pointerId,button:0})}
 return {globe,event,step,frames,timers,doc,listeners,setTime:t=>now=t,setCity:c=>city=c,get points(){return points}};
}
let a=setup();a.step(4000);assert.equal(a.globe.view().longitude,0);a.step(5100);assert.equal(a.globe.view().longitude,0,'opening stays on the selected city');a.step(10002);assert.equal(a.frames.size,0);a.globe.dispose();
a=setup();a.event('down');a.setTime(21);a.event('move',220);a.event('up',220);const released=a.globe.view().longitude;a.step(37);a.step(53);assert.ok(a.globe.view().longitude<released,'drag continues with inertia');a.globe.dispose();
a=setup();a.event('down');a.event('up');a.setTime(100);a.event('down');a.event('up');a.setCity({latitude:22,longitude:33});a.step(900);assert.equal(a.globe.view().latitude,20);assert.equal(a.globe.view().longitude,30);assert.equal(a.points,0,'double tap does not also select a point');a.event('down');a.event('up');a.setTime(1000);a.event('down');a.event('up');a.step(1800);assert.equal(a.globe.view().latitude,22,'latest city used');a.globe.dispose();
a=setup();a.event('down',100);a.event('down',200,220,2);a.event('move',250,220,2);assert.ok(a.globe.view().zoom>1);a.event('up',250,220,2);a.event('up',100);a.step(500);assert.equal(a.points,0,'pinch cannot select point');a.globe.dispose();
a=setup({reducedMotion:true});a.event('down');a.setTime(20);a.event('move',220);a.event('up',220);const lon=a.globe.view().longitude;a.step(500);assert.equal(a.globe.view().longitude,lon);assert.equal(a.frames.size,0);a.globe.focus({latitude:40,longitude:10});assert.equal(a.globe.view().latitude,40);a.globe.dispose();
a=setup({lightweight:true});a.step(6000);assert.equal(a.globe.view().longitude,0);assert.equal(a.frames.size,0);a.globe.dispose();
a=setup();a.event('down');a.event('up');a.step(302);assert.equal(a.points,1,'single tap still selects');a.event('down');a.event('up');a.doc.hidden=true;a.listeners.visibilitychange();a.step(800);assert.equal(a.points,1);assert.equal(a.frames.size,0);a.globe.dispose();assert.equal(a.timers.size,0);
console.log('Globe gestures: inertia, stationary initial city, 800ms return, current city, tap/pinch separation, reduced motion, eco and cleanup passed.');
