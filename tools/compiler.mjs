import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import * as native from 'esbuild';
const require=createRequire(import.meta.url);
let wasm;
async function portable(){
 if(wasm)return wasm;
 globalThis.self ??= globalThis;
 const api=require('esbuild-wasm/lib/browser.js');
 await api.initialize({wasmModule:await WebAssembly.compile(fs.readFileSync(require.resolve('esbuild-wasm/esbuild.wasm'))),worker:false});
 wasm=api;
 return api;
}
export async function build(options){
 if(process.env.METEOSOCIAL_COMPILER!=='wasm'){
  try{return await native.build(options)}catch(error){if(error.code!=='EPERM')throw error;console.log('Native compiler unavailable; using WebAssembly.');}
 }
 const api=await portable();
 const result=await api.build({...options,absWorkingDir:'/',outdir:'/dist/app',write:false});
 for(const file of result.outputFiles){
  const relative=file.path.replace(/^\//,'');
  if(!relative.startsWith('dist/app/')||relative.includes('..'))throw Error('Unexpected compiler output path');
  const dest=path.resolve(relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,file.contents);
 }
 return result;
}
export async function transform(source,options){return (wasm||native).transform(source,options)}
export function stop(){wasm?.stop();wasm=undefined;native.stop()}
