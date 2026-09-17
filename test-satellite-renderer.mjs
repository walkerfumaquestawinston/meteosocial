import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Exercise renderer events with a fake Maps API. No live credentials or requests.
let checks=0;const check=(value,label)=>{assert.ok(value,label);checks++};
let instance,receiver,created=0;
const reports=[];
class FakeMap extends EventTarget{constructor(options){super();Object.assign(this,options);instance=this;this.children=[];created++}append(marker){this.children.push(marker)}}
let pinFailure=false;
class FakeMarker extends EventTarget{constructor(options){super();Object.assign(this,options)}append(pin){this.pin=pin}remove(){instance.children=instance.children.filter(m=>m!==this)}}
class FakePin{constructor(options){if(pinFailure)throw Error('No pin support');Object.assign(this,options)}}
const parent={postMessage:(data,origin)=>reports.push({data,origin})};
const root={replaceChildren:()=>{},textContent:''};
const context={URLSearchParams,Number,Math,Error,Promise,setTimeout,clearTimeout,AbortSignal,
 location:{origin:'https://test.invalid',hash:'#lat=41.9&lng=12.5&world=1'},parent,
 document:{querySelector:()=>root,createElement:()=>({}),head:{append:()=>context.window.meteosocialGoogleReady()}},
 fetch:async()=>({ok:true,json:async()=>({enabled:true,key:'AIza'+'x'.repeat(35)})}),
 google:{maps:{importLibrary:async()=>({Map3DElement:FakeMap,Marker3DInteractiveElement:FakeMarker,PinElement:FakePin,MapMode:{HYBRID:'hybrid',SATELLITE:'satellite'},GestureHandling:{COOPERATIVE:'cooperative'}})}},
 window:{addEventListener:(_,callback)=>receiver=callback}
};
vm.runInNewContext(readFileSync('dist/google-3d-frame.js','utf8'),context);
await new Promise(resolve=>setImmediate(resolve));
check(instance?.range===20000000&&instance.tilt===0,'initial world view uses actual Google map camera');
const send=(action,extra={})=>receiver({source:parent,origin:context.location.origin,data:{type:'meteosocial-google-command',action,...extra}});
const emit=(name,properties={})=>{const e=new Event(name,{cancelable:true});Object.assign(e,properties);instance.dispatchEvent(e);return e};
emit('gmp-steadychange',{isSteady:true});check(reports.at(-1).data.state==='ready','renderer announces completed initial view');
send('center');check(instance.range===12000&&instance.center.lat===41.9&&instance.tilt===55,'city button goes from world to local relief');
send('flat');check(instance.tilt===0,'top down view keeps current position');
send('labels',{enabled:false});check(instance.mode==='satellite','satellite imagery can hide street labels');
send('labels',{enabled:true});check(instance.mode==='hybrid','street labels return without rebuilding the map');
send('world');check(instance.range===20000000&&instance.tilt===0,'world button returns to whole Earth');
send('relief');check(instance.range===40000&&instance.tilt===55,'relief zooms into the viewed area');
const count=reports.length;
emit('gmp-click',{position:{lat:43,lng:13}});check(reports.length===count,'normal exploration does not request point weather');
send('select',{enabled:true});
const click=emit('gmp-click',{position:{lat:43,lng:13}});
check(click.defaultPrevented&&reports.at(-1).data.point.latitude===43,'explicit selection returns coordinates and prevents Places popover');
const selectedCount=reports.length;
emit('gmp-click',{position:{lat:44,lng:14}});check(reports.length===selectedCount,'selection turns off after one valid point');
send('place',{point:{latitude:43,longitude:13},center:false});
check(instance.center.lat===41.9,'weather point update preserves exploration camera');
send('center');check(instance.center.lat===43&&instance.center.lng===13,'center follows latest selected weather zone');
send('place',{point:{latitude:999,longitude:13},center:true});check(instance.center.lat===43,'invalid location cannot move the camera');
send('place',{point:{latitude:45,longitude:9},center:true});check(instance.center.lat===45,'city search recenters without a new map');
const before=instance.range;
receiver({source:{},origin:context.location.origin,data:{type:'meteosocial-google-command',action:'world'}});
check(instance.range===before,'foreign window cannot change camera');
receiver({source:parent,origin:'https://other.invalid',data:{type:'meteosocial-google-command',action:'world'}});
check(instance.range===before,'foreign origin cannot change camera');
check(created===1,'all satellite interactions reuse one renderer');
const record={id:'weather:rome',latitude:41.9,longitude:12.5,label:'☂ 18° · Roma',icon:'☂',color:'#80cfff',priority:1};
send('conditions',{markers:[record,{...record,id:'bad',latitude:999}]});await new Promise(r=>setImmediate(r));
check(instance.children.length===1&&instance.children[0].position.lat===41.9,'valid weather marker is physically appended to Google map');
check(instance.children[0].pin.glyphText==='☂'&&instance.children[0].label.includes('18°'),'weather glyph and values reach supported PinElement');
const first=instance.children[0];first.dispatchEvent(new Event('gmp-click',{cancelable:true}));
check(reports.at(-1).data.state==='condition'&&reports.at(-1).data.id===record.id,'click returns selected condition');
send('world');send('focus-condition',{id:record.id});check(instance.center.lat===41.9&&instance.range===120000,'list selection focuses actual map point');
send('conditions',{markers:[]});await new Promise(r=>setImmediate(r));check(instance.children.length===0,'filtered and expired markers removed');
pinFailure=true;send('conditions',{markers:[record]});await new Promise(r=>setImmediate(r));
check(reports.at(-1).data.state==='conditions-error','marker failure reported separately');
send('world');check(instance.range===20000000&&created===1,'marker failure preserves interactive satellite');
console.log(checks+' satellite renderer checks passed');
