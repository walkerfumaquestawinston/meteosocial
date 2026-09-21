// Development adapter only. Never imported by the production build.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const digest = value => createHash('sha256').update(value).digest('hex');
const localBanner='<div style="padding:10px 16px;background:#fff1c4;color:#312200;font:14px system-ui;text-align:center">ANTEPRIMA LOCALE · dati e profilo di prova separati dal sito online</div>';

export function createLocalEnvironment(root, dataDir=path.join(root,'.local-development'), ai={}) {
  fs.mkdirSync(dataDir,{recursive:true});
  const db=new DatabaseSync(path.join(dataDir,'preview.sqlite'));
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS _local_migrations(name TEXT PRIMARY KEY, digest TEXT NOT NULL)');
  try {
    const journal=JSON.parse(fs.readFileSync(path.join(root,'drizzle/meta/_journal.json'),'utf8'));
    for (const entry of journal.entries) {
      const name=entry.tag+'.sql', sql=fs.readFileSync(path.join(root,'drizzle',name),'utf8'), hash=digest(sql.replace(/\r\n/g,'\n'));
      const applied=db.prepare('SELECT digest FROM _local_migrations WHERE name=?').get(name);
      if(applied){if(applied.digest!==hash)throw Error('Una migrazione locale già applicata è cambiata: '+name+'. Conserva il database e risolvi la differenza.');continue}
      db.exec('BEGIN');
      try{db.exec(sql);db.prepare('INSERT INTO _local_migrations VALUES(?,?)').run(name,hash);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
    }
  }catch(e){db.close();throw e}
  const bucketDir=path.join(dataDir,'media');fs.mkdirSync(bucketDir,{recursive:true});
  const env={
    DB:{prepare:sql=>({bind:(...args)=>({
      first:async()=>db.prepare(sql).get(...args)||null,
      all:async()=>({results:db.prepare(sql).all(...args)}),
      run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}}),
      _execute:()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})
    })}),batch:async statements=>{db.exec('BEGIN');try{const results=statements.map(s=>s._execute());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}},
    BUCKET:{
      async put(key,bytes,options={}){const p=path.join(bucketDir,digest(key));fs.writeFileSync(p,Buffer.from(bytes));fs.writeFileSync(p+'.json',JSON.stringify(options.httpMetadata||{}))},
      async get(key){const p=path.join(bucketDir,digest(key));if(!fs.existsSync(p))return null;const bytes=fs.readFileSync(p);return {body:new Uint8Array(bytes),httpMetadata:JSON.parse(fs.readFileSync(p+'.json','utf8')),arrayBuffer:async()=>Uint8Array.from(bytes).buffer}},
      async delete(key){const p=path.join(bucketDir,digest(key));for(const file of [p,p+'.json'])if(fs.existsSync(file))fs.unlinkSync(file)}
    },
    ...(ai.key?{OPENAI_API_KEY:ai.key}:{}),...(ai.model?{OPENAI_MODEL:ai.model}:{})
  };
  return {env,close:()=>db.close()};
}

export async function startLocalPreview({root,port=4589,dataDir,loadAi=true}) {
  let key='',model='';
  if(loadAi){
    const envFile=path.join(root,'.env.local');if(fs.existsSync(envFile))process.loadEnvFile(envFile);
    key=process.env.OPENAI_API_KEY||'';model=process.env.OPENAI_MODEL||'';
  }
  const local=createLocalEnvironment(root,dataDir,{key,model});
  const session=randomBytes(32).toString('hex');let stamp='',worker,origin='';
  async function loadWorker(){const file=path.join(root,'dist/server/index.js'),next=fs.statSync(file).mtimeMs;if(next!==stamp){worker=(await import(pathToFileURL(file).href+'?preview='+next)).default;stamp=next}return worker}
  const server=http.createServer(async(req,res)=>{
    const plain=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(text)};
    try{
      if(req.headers.host!==new URL(origin).host)return plain(403,'Host non valido per l’anteprima locale.');
      const url=new URL(req.url,origin),method=req.method||'GET';
      if(!['GET','HEAD'].includes(method)&&req.headers.origin!==origin)return plain(403,'Apri l’anteprima sullo stesso indirizzo locale.');
      if(url.pathname==='/__local/status')return plain(200,'MeteoSocial local preview');
      if(url.pathname==='/signin-with-chatgpt'){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>Profilo locale di prova</title><body>'+localBanner+'<h1>Anteprima sul tuo computer</h1><p>Qui non si accede al vero account ChatGPT. I dati di prova restano su questo PC.</p><form method="post" action="/__local/login"><button>Entra con un profilo di prova</button></form><p><a href="/">Torna all’anteprima</a></p></body></html>');
      }
      if(url.pathname==='/__local/login'&&method==='POST'){
        res.writeHead(303,{'Set-Cookie':'ms_preview='+session+'; HttpOnly; SameSite=Strict; Path=/','Location':'/#profilo'});return res.end();
      }
      if(url.pathname==='/signout-with-chatgpt'){
        res.writeHead(303,{'Set-Cookie':'ms_preview=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/','Location':'/'});return res.end();
      }
      const chunks=[];let total=0;
      for await(const chunk of req){total+=chunk.length;if(total>10_000_000)return plain(413,'File troppo grande per l’anteprima.');chunks.push(chunk)}
      const headers=new Headers();
      for(const [k,v] of Object.entries(req.headers)){if(v!==undefined&&!k.startsWith('oai-')&&!['authorization','connection','content-length','transfer-encoding'].includes(k))headers.set(k,Array.isArray(v)?v.join(','):v)}
      if((req.headers.cookie||'').split(';').some(x=>x.trim()==='ms_preview='+session)){
        headers.set('oai-authenticated-user-id','portable-preview-user');headers.set('oai-authenticated-user-email','preview@example.invalid');
      }
      const response=await(await loadWorker()).fetch(new Request(url,{method,headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(chunks)}),local.env);
      const outgoing=new Headers(response.headers);outgoing.delete('content-length');outgoing.set('Cache-Control','no-store');
      let body=Buffer.from(await response.arrayBuffer());
      if(outgoing.get('content-type')?.includes('text/html'))body=Buffer.from(body.toString('utf8').replace(/<body([^>]*)>/,(_,attributes)=>'<body'+attributes+'>'+localBanner));
      res.writeHead(response.status,Object.fromEntries(outgoing));res.end(method==='HEAD'?undefined:body);
    }catch(e){plain(500,'Errore nell’anteprima locale. Controlla i file del progetto.');console.error('Local preview error:',e.name)}
  });
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;resolve()})})}catch(e){local.close();throw e}
  return {origin,aiConfigured:!!key,close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));local.close()}};
}
