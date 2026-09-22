import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const selected=process.argv.slice(2).filter(x=>!x.startsWith('-'));
const verbose=process.argv.includes('--verbose');
// Reviewed obsolete contracts. Never infer retirement merely from a failing test's imports.
// Selecting a retired test explicitly, or --include-retired, runs it and reports real failures.
const retired={
 'test-climate.mjs':'richiede il vecchio modulo climate-view nel Worker',
 'test-globe-gestures.mjs':'controller del globo sostituito dalla mappa locale',
 'test-google3d.mjs':'richiede asset del renderer Google 3D ritirato',
 'test-hail-map.mjs':'metadati del vecchio percorso dedicato hail-map',
 'test-hail.mjs':'richiede il modulo e il CSS hail ritirati dal Worker'
};
const files=(selected.length?selected.map(x=>path.basename(x)):fs.readdirSync(root).filter(x=>/^test-.+\.mjs$/.test(x))).sort();
if(!files.length)throw Error('Nessun test trovato');
const passed=[],failed=[],skipped=[];
for(const file of files){
 if(retired[file]&&!selected.length&&!process.argv.includes('--include-retired')){skipped.push(file);console.log('  '+file+' · ritirato: '+retired[file]);continue;}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'meteosocial-test-')),log=path.join(dir,'output.txt');
 let fd,run,output='';
 try{
  fd=fs.openSync(log,'w');
  run=spawnSync(process.execPath,['--experimental-vm-modules',file],{cwd:root,stdio:['ignore',fd,fd],timeout:180000});
  fs.closeSync(fd);fd=undefined;output=fs.readFileSync(log,'utf8').trimEnd();
 }finally{if(fd!==undefined)fs.closeSync(fd);fs.rmSync(log,{force:true});fs.rmdirSync(dir);}
 if(run.error||run.status!==0){failed.push({file,output:run.error?run.error.message+'\n'+output:output});console.log('  '+file+' · FALLITO');}
 else{passed.push(file);console.log('  '+file+' · superato');}
 if(verbose&&output)console.log(output);
}
console.log(`\nSuperati: ${passed.length} · Falliti: ${failed.length} · Contratti ritirati: ${skipped.length}`);
for(const failure of failed)console.error('\n'+failure.file+'\n'+failure.output.split('\n').slice(-16).join('\n'));
if(failed.length)process.exitCode=1;
