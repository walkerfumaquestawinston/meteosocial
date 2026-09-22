import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {startLocalPreview} from './local-preview.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const compile=()=>new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,['build.mjs'],{cwd:root,stdio:'inherit'});
 child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Compilazione non riuscita: '+code)));
});
await compile();
const preview=await startLocalPreview({root,port:4595,loadAi:false,liveReload:true});
console.log('Anteprima live: '+preview.origin+'/#home');
let timer,running=false,again=false;
async function rebuild(){if(running){again=true;return}running=true;try{await compile();console.log('Aggiornamento pronto')}catch(e){console.error(e.message)}finally{running=false;if(again){again=false;rebuild()}}}
const watcher=fs.watch(root,{recursive:true},(_,filename)=>{
 const name=String(filename||'').replaceAll('\\','/');
 if(!(/^(dist\/[^/]+\.(js|css|html)|server\/.*\.js|build\.mjs|tools\/compiler\.mjs)$/.test(name))||name==='dist/sw.js')return;
 clearTimeout(timer);timer=setTimeout(rebuild,500);
});
const close=async()=>{watcher.close();clearTimeout(timer);await preview.close();process.exit(0)};
process.once('SIGINT',close);process.once('SIGTERM',close);
