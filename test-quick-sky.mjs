import assert from 'node:assert/strict';
import {createSkyCommunity} from './dist/sky-community.js';
globalThis.document={querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
globalThis.localStorage={getItem:()=>null,setItem(){}};
Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
globalThis.window={addEventListener(){},dispatchEvent(){}};
let calls=[],snapshots=[],release;
const gate=new Promise(r=>release=r);
let transport;globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);return new Response(JSON.stringify(await transport(url.slice(5),body)))};
const sky=createSkyCommunity({get:()=>({route:'profilo',place:{name:'Roma',latitude:41.9,longitude:12.5}}),toast(){},world:{refreshWeather(){},setData:d=>snapshots.push(d)},api:transport=async(path,body)=>{
 if(path==='sky/session')return {};
 calls.push(body);await gate;if(calls.length===1)throw Error('Lost acknowledgement');
 return {report:{...body,author:'test',created:Date.now(),expires:Date.now()+7200000,kind:'rain'},stats:{people:1,countries:1}};
}});
const sending=sky.quick('Pioggia');
assert.match(sky.page(),/Invio in corso/);
assert.equal(snapshots.length,0,'pending report must not light a fake point');
release();await sending;
assert.equal(calls.length,2);assert.equal(calls[0].id,calls[1].id);
assert.equal(calls[0].text,undefined);assert.match(calls[0].name,/Voce del cielo/);
assert.equal(sky.data().reports.length,1);assert.equal(sky.data().stats.people,1);
assert.doesNotMatch(sky.page(),/Invio in corso/);
console.log('Quick report: immediate pending state, honest counters and idempotent retry passed.');

assert.match(sky.page(),/Adesso · ultime 2 ore/);
assert.match(sky.page(),/Scrivi un post più lungo/);
assert.doesNotMatch(sky.page(),/Altre funzioni della community/);
assert.equal((sky.page().split('id="sky-feed"')[0].match(/<button/g)||[]).length,6);
