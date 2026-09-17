// Shared by the page and classic service worker; no credentials stored here.
(()=>{
 const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('meteosocial-offline',1);r.onupgradeneeded=()=>{for(const name of ['weather','outbox','meta'])r.result.createObjectStore(name,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 async function access(name,mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(name,mode);let result;const request=fn(tx.objectStore(name));request.onsuccess=()=>result=request.result;tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||Error('Salvataggio non disponibile'))}})}
 const get=(s,id)=>access(s,'readonly',x=>x.get(id)),put=(s,value)=>access(s,'readwrite',x=>x.put(value)),remove=(s,id)=>access(s,'readwrite',x=>x.delete(id)),all=s=>access(s,'readonly',x=>x.getAll());
 let running;
 async function request(path,body){const r=await fetch('/api/sky/'+path,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(35000)});const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'Invio non disponibile'),{status:r.status});return d}
 async function flush(){if(running)return running;running=(async()=>{let retry=false;for(const entry of await all('outbox')){
  if(entry.payload.observedAt+7200000<=Date.now()){await remove('outbox',entry.id);await put('meta',{id:'result',text:'Una segnalazione in attesa è scaduta: dopo 2 ore non viene pubblicata.'});continue}
  if(entry.blocked)continue;
  if(!entry.owner){await put('outbox',{...entry,blocked:true,message:'Apri l’app e conferma l’invio per iniziare la sessione.'});continue}
  try{await request('reports',{...entry.payload,expectedActor:entry.owner});await remove('outbox',entry.id);await put('meta',{id:'result',text:'La segnalazione in attesa è stata inviata con l’ora originale.'})}
  catch(e){if(e.status&&e.status<500&&e.status!==429)await put('outbox',{...entry,blocked:true,message:e.message});else retry=true}
 }if(retry)throw Error('Connessione non disponibile: invio da riprovare')})().finally(()=>running=null);return running}
 globalThis.MeteoOffline={get,put,remove,all,flush,request};
})();
