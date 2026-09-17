// Development preview only; production remains the existing Worker build.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {defineConfig} from 'vite';
import {createLocalEnvironment} from './tools/local-preview.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root:path.join(root,'dist'),
  publicDir:false,
  server:{host:'0.0.0.0',allowedHosts:['terminal.local'],port:4173,strictPort:true},
  plugins:[{
    name:'meteosocial-local-worker',
    configureServer(server){
      const preview=createLocalEnvironment(root);
      let stamp,worker;
      server.httpServer?.once('close',()=>preview.close());
      server.middlewares.use(async(req,res,next)=>{
        if(req.url==='/__qa/map-fixture'){
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
          return res.end(fs.readFileSync(path.join(root,'tests/map-fixture.html')));
        }
        if(req.url==='/__qa/axe.js'){
          res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});
          return res.end(fs.readFileSync(path.join(root,'node_modules/axe-core/axe.min.js')));
        }
        if(req.url==='/__qa/mobile'){
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
          return res.end('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>MeteoSocial · prova a 375 px</title><style>body{margin:0;background:#e8edf3;font:16px system-ui}iframe{border:0;width:375px;height:812px;display:block;background:white}</style><iframe title="MeteoSocial a 375 pixel" src="/?previewFrame=1#home"></iframe></html>');
        }
        if(!req.url?.startsWith('/api/'))return next();
        try{
          const filename=path.join(root,'dist/server/index.js'),modified=fs.statSync(filename).mtimeMs;
          if(stamp!==modified){worker=(await import(pathToFileURL(filename).href+'?preview='+modified)).default;stamp=modified}
          const chunks=[];let size=0;
          for await(const chunk of req){size+=chunk.length;if(size>10000000)throw Error('Preview request too large');chunks.push(chunk)}
          const method=req.method||'GET',headers=new Headers();
          for(const name of ['content-type','accept','cookie','origin'])if(req.headers[name])headers.set(name,req.headers[name]);
          const response=await worker.fetch(new Request(new URL(req.url,'http://terminal.local:4173'),{method,headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(chunks)}),preview.env);
          res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
        }catch(error){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Anteprima locale non disponibile'}));console.error('Preview:',error.message)}
      });
    },
    transformIndexHtml(html){
      const bootstrap=`<script src="/__qa/axe.js"></script><script>
      // HTTP preview has no randomUUID; getRandomValues retains secure randomness.
      if(!crypto.randomUUID)crypto.randomUUID=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)};
      addEventListener('DOMContentLoaded',()=>{const stats=document.getElementById('preview-network');setInterval(()=>{const scripts=performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname.endsWith('.js')&&!r.name.includes('/__qa/'));const three=scripts.filter(r=>/three\\.(module|core)\\.js|land-mesh\\.js/.test(r.name));stats.textContent='JS richiesti: '+scripts.length+' · File 3D: '+three.length+' · '+three.map(r=>new URL(r.name).pathname).join(', ')},500);document.getElementById('preview-sky').onchange=e=>{const sky=e.target.value;document.documentElement.dataset.sky=sky;document.documentElement.classList.toggle('sky-light',sky.startsWith('giorno'));};document.getElementById('preview-audit').onclick=async()=>{document.getElementById('preview-a11y').textContent='Verifica in corso…';const r=await axe.run({include:[['main'],['body>header'],['.shell>nav'],['dialog']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});document.getElementById('preview-a11y').textContent=JSON.stringify(r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2)}});
      </script>`;
      return html.replace('</head>',bootstrap+'</head>').replace('<body>','<body><div id="preview-tools" style="padding:8px;background:#fff1c4;color:#312200;font:14px system-ui;text-align:center">ANTEPRIMA · dati di prova separati dal sito online<br><output id="preview-network">Controllo caricamento…</output><details><summary>Verifiche</summary><button type="button" onclick="this.parentElement.parentElement.hidden=true">Nascondi strumenti</button><label>Cielo di prova <select id="preview-sky"><option value="giorno-sereno">Giorno sereno</option><option value="giorno-nuvoloso">Giorno nuvoloso</option><option value="pioggia">Pioggia</option><option value="tramonto">Tramonto</option><option value="notte">Notte</option></select></label><button id="preview-audit" type="button">Verifica accessibilità</button><pre id="preview-a11y" style="text-align:left;white-space:pre-wrap">Non eseguita</pre></details></div>');
    }
  }]
});
