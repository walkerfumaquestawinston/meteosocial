import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
import {CITIES} from './dist/places.js';
const original=fetch;let calls=0,release;
const request=()=>worker.fetch(new Request('https://test.invalid/api/atlas/cities'),{});
try{
 globalThis.fetch=async()=>{calls++;await new Promise(r=>{release=r});return Response.json(CITIES.map(()=>({current:{temperature_2m:18}})))};
 const a=request(),b=request();await new Promise(r=>setImmediate(r));assert.equal(calls,1);release();assert.equal((await a).status,200);assert.equal((await b).status,200);
 const cache=new Map();globalThis.caches={get default(){throw Error('forbidden')},async open(name){assert.equal(name,'meteosocial-public-v1');return {match:async key=>cache.get(key.url)?.clone(),put:async(key,value)=>cache.set(key.url,value.clone())}}};
 globalThis.fetch=async()=>{calls++;return Response.json(CITIES.map(()=>({current:{temperature_2m:19}})))};
 await request();const count=calls;await request();assert.equal(calls,count);delete globalThis.caches;
 globalThis.fetch=async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'120'}})};
 const limited=await request();assert.equal(limited.status,503);assert.ok(Number(limited.headers.get('Retry-After'))>=119);const after=calls;const retry=await request();assert.equal(retry.status,503);assert.equal(calls,after);assert.ok(Number(retry.headers.get('Retry-After'))>=119);
 console.log('3 city protections passed: concurrent requests, named cache, Retry-After cooldown');
}finally{globalThis.fetch=original;delete globalThis.caches}
