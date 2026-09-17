const DPC_REPO='https://api.github.com/repos/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica';
const DPC_SOURCE='https://github.com/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica';
const dpcPending=new WeakMap();
const romeDate=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
async function atmoFetch(url,max=6000000,deadline=Date.now()+12000){const r=await fetch(url,{headers:{'User-Agent':'MeteoSocial weather attribution','Accept':'application/json'},signal:AbortSignal.timeout(Math.max(1,Math.min(12000,deadline-Date.now())))});if(!r.ok)throw Error('Fonte non disponibile');const text=await r.text();if(text.length>max)throw Error('Fonte troppo estesa');return JSON.parse(text)}
async function dpcRead(env,day){
 const meta=await q(env,'SELECT * FROM dpc_bulletins WHERE day=?',day).first();if(!meta)return null;
 const rows=(await q(env,'SELECT geometry FROM dpc_zones WHERE snapshot=? ORDER BY slot',meta.snapshot).all()).results;
 if(!rows.length)return null;return {...meta,at:meta.checked,zones:rows.map(r=>JSON.parse(r.geometry)),stale:!!meta.failed};
}
async function dpcDataset(env){
 const day=romeDate(Date.now()),stored=await dpcRead(env,day),now=Date.now();
 if(stored&&now>=stored.attempted&&now-stored.attempted<(stored.failed?60000:600000))return stored;
 if(dpcPending.has(env.DB))return dpcPending.get(env.DB);
 const pending=(async()=>{const deadline=Date.now()+20000;try{
  const list=await atmoFetch(DPC_REPO+'/commits?path=files%2Ftopojson&per_page=12',180000,deadline);if(!Array.isArray(list))throw Error('Indice non valido');
  const tag=day.replaceAll('-',''),yesterday=new Date(Date.parse(day+'T12:00:00Z')-86400000).toISOString().slice(0,10).replaceAll('-','');let file=null,revision=null;
  const pattern=new RegExp('^files/topojson/(?:'+tag+'_\\d{4}_today|'+yesterday+'_\\d{4}_tomorrow)\\.json$');
  for(const row of list){if(!/^[a-f0-9]{40}$/.test(row.sha)||!Number.isFinite(Date.parse(row.commit?.committer?.date))||Date.now()-Date.parse(row.commit.committer.date)>172800000)continue;
   const commit=await atmoFetch(DPC_REPO+'/commits/'+row.sha,400000,deadline);
   const files=(commit.files||[]).filter(f=>f.status!=='removed'&&pattern.test(f.filename)).map(f=>f.filename).sort().reverse();
   if(files.length){file=files[0];revision=row.sha;break}
  }
  if(!file)throw Error('Bollettino di oggi non disponibile');
  const issued=file.split('/').at(-1).replace('.json','');if(stored&&issued<stored.issued)throw Error('Indice meno recente del bollettino salvato');
  const source='https://raw.githubusercontent.com/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica/'+revision+'/'+file;
  const topology=await atmoFetch(source,6000000,deadline),zones=decodeTopology(topology).map(g=>({...g,properties:Object.fromEntries(Object.entries(g.properties).filter(([k])=>k==='Nome zona'||k==='Rappresentata nella mappa'||k.startsWith('Per rischio')))}));
  if(!zones.length||zones.some(g=>!g.properties['Nome zona']||!['Polygon','MultiPolygon'].includes(g.type)))throw Error('Zone incomplete o non leggibili');
  const snapshot=day+':'+revision+':'+issued;
  const statements=[];for(let start=0;start<zones.length;start+=30){const slice=zones.slice(start,start+30);statements.push(q(env,'INSERT OR IGNORE INTO dpc_zones(snapshot,slot,geometry) VALUES '+slice.map(()=>'(?,?,?)').join(','),...slice.flatMap((g,i)=>[snapshot,start+i,JSON.stringify(g)])))}
  statements.push(q(env,'INSERT INTO dpc_bulletins(day,snapshot,issued,source,checked,attempted,failed) VALUES(?,?,?,?,?,?,0) ON CONFLICT(day) DO UPDATE SET snapshot=excluded.snapshot,issued=excluded.issued,source=excluded.source,checked=excluded.checked,attempted=excluded.attempted,failed=0 WHERE excluded.checked>=dpc_bulletins.checked AND excluded.issued>=dpc_bulletins.issued',day,snapshot,issued,source,now,now));
  await db(env).batch(statements);
  // Keep one week of metadata and only geometries referenced by those snapshots.
  await q(env,'DELETE FROM dpc_bulletins WHERE day<?',new Date(now-7*86400000).toISOString().slice(0,10)).run();
  await q(env,'DELETE FROM dpc_zones WHERE snapshot NOT IN (SELECT snapshot FROM dpc_bulletins)').run();
  return await dpcRead(env,day);
 }catch(e){console.warn('dpc_refresh_failed',e.message);if(stored){await q(env,'UPDATE dpc_bulletins SET attempted=?,failed=1 WHERE day=? AND checked<=?',now,day,now).run();return {...stored,stale:true}}throw e}
 finally{dpcPending.delete(env.DB)}})();dpcPending.set(env.DB,pending);return pending;
}
async function atmosphereSafety(lat,lon,env){
 const unknown={mode:'UNKNOWN',level:null,title:'Bollettino ufficiale non disponibile',detail:'Consulta la fonte della tua zona. Non possiamo confermare lo stato delle allerte.',source:DPC_SOURCE,checkedAt:Date.now(),zones:[]};
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<35||lat>48||lon<6||lon>19)return {...unknown,title:'Copertura bollettini: Italia',detail:'Per questa località consulta le autorità locali. Le previsioni restano disponibili.'};
 try{const data=await dpcDataset(env);if(!data||data.day!==romeDate(Date.now()))return unknown;const zones=data.zones.filter(g=>pointInGeometry(lon,lat,g)).map(g=>({name:g.properties['Nome zona'],level:alertLevel(g.properties),risks:Object.entries(g.properties).filter(([k])=>k.startsWith('Per rischio')).map(([kind,text])=>({kind,text}))}));if(!zones.length||zones.some(z=>z.level===null))return unknown;
  const level=Math.max(...zones.map(z=>z.level));if(data.stale||Date.now()-data.at>900000)return {...unknown,title:'Aggiornamento del bollettino non verificabile',detail:'Non riusciamo a leggere le revisioni adesso. Il bollettino conservato potrebbe essere stato aggiornato: controlla direttamente la fonte ufficiale.',lastKnown:{level,zones,issued:data.issued,validDate:data.day,checkedAt:data.at,source:data.source}};const mode=level===3?'EMERGENCY':level>0?'CAUTION':'NORMAL';return {mode,level,title:level?'Allerta '+['','gialla','arancione','rossa'][level]+' · bollettino nazionale':'Nessuna allerta nel bollettino consultato',detail:level?'Leggi le indicazioni ufficiali per la zona. Il bollettino descrive il rischio previsto, non certifica un evento in corso.':'Questo bollettino non esclude fenomeni locali. Controlla eventuali aggiornamenti regionali.',source:data.source,issued:data.issued,validDate:data.day,checkedAt:data.at,zones};
 }catch{return unknown}
}
async function atmosphereTimeline(url){
 const cache=optionalPublicCache(),key=new Request(url.origin+'/api/atmosphere/timeline?schema=climate-2');const cached=await cache?.match(key);if(cached)return cached;
 const p=new URLSearchParams({latitude:ATLAS_CITIES.map(c=>c.latitude).join(','),longitude:ATLAS_CITIES.map(c=>c.longitude).join(','),timezone:'GMT',past_days:'1',forecast_days:'2',hourly:'temperature_2m,weather_code,precipitation,rain,showers,snowfall,wind_speed_10m,wind_gusts_10m,cloud_cover,relative_humidity_2m,surface_pressure,is_day'});
 const rows=await atmoFetch('https://api.open-meteo.com/v1/forecast?'+p);if(!Array.isArray(rows)||rows.length!==ATLAS_CITIES.length)fail(503,'Previsioni nel tempo incomplete.');
 const origin=Math.floor(Date.now()/3600000)*3600000,keys=['temperature_2m','weather_code','precipitation','rain','showers','snowfall','wind_speed_10m','wind_gusts_10m','cloud_cover','relative_humidity_2m','surface_pressure','is_day'];
 const cities=ATLAS_CITIES.map((c,j)=>({...c,hours:(rows[j].hourly?.time||[]).map((time,i)=>({time,at:Date.parse(time+'Z'),...Object.fromEntries(keys.map(k=>[k,rows[j].hourly[k]?.[i]??null]))})).filter(h=>h.at>=origin-86400000&&h.at<=origin+86400000)}));
 const response=new Response(JSON.stringify({cities,origin,updated:Date.now(),source:'Open-Meteo',kind:'model',timezone:'UTC'}),{headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=600'}});if(cache)await cache.put(key,response.clone());return response;
}
async function atmosphereApi(req,env,url){
 if(req.method==='GET'&&url.pathname==='/api/atmosphere/safety'){const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));if(!url.searchParams.has('lat')||!url.searchParams.has('lon')||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)fail(400,'Scegli una località valida.');return json(await atmosphereSafety(lat,lon,env))}
 if(req.method==='GET'&&url.pathname==='/api/atmosphere/timeline')return atmosphereTimeline(url);
 const user=await identity(req);if(!user)fail(401,'Accedi per partecipare o seguire una città.');
 if(req.method==='GET'&&url.pathname==='/api/atmosphere/following'){const rows=(await q(env,"SELECT target FROM links WHERE user=? AND kind='city-follow'",user).all()).results;return json({cities:ATLAS_CITIES.filter(c=>rows.some(r=>r.target===c.id)).map(c=>({id:c.id,name:c.name}))})}
 if(req.method!=='POST')fail(404,'Funzione non disponibile.');if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json'))fail(403,'Richiesta non autorizzata.');
 const raw=await req.text();if(raw.length>2100000)fail(413,'La foto supera il limite.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Dati non validi.')}
 if(url.pathname==='/api/atmosphere/follow-city'){await quota(env,user,'city-follow',30);const city=ATLAS_CITIES.find(c=>c.id===b.city);if(!city||typeof b.active!=='boolean')fail(400,'Scegli una città valida.');if(b.active)await q(env,"INSERT OR IGNORE INTO links(user,target,kind) VALUES(?,?,'city-follow')",user,city.id).run();else await q(env,"DELETE FROM links WHERE user=? AND target=? AND kind='city-follow'",user,city.id).run();return json({ok:true})}
 if(url.pathname==='/api/atmosphere/ticket'){
  await quota(env,user,'capture-ticket',12);if(!await q(env,'SELECT id FROM profiles WHERE id=?',user).first())fail(400,'Scegli prima il nome della tua redazione nel Profilo.');const city=clean(b.city,80);if(!city||/°|\d{1,3}\.\d{2,}/.test(city))fail(400,'Scegli una città per la testimonianza.');
  const now=Date.now(),id=crypto.randomUUID();await q(env,'DELETE FROM capture_tickets WHERE expires<? AND used=0',now-86400000).run();await q(env,'INSERT INTO capture_tickets(id,user,city,created,expires,used) VALUES(?,?,?,?,?,0)',id,user,city,now,now+180000).run();return json({id,city,created:now,expires:now+180000,serverNow:now});
 }
 if(url.pathname==='/api/atmosphere/report'){
  await quota(env,user,'capture-report',12);const id=clean(b.id,50);if(!/^[a-f0-9-]{36}$/.test(id))fail(400,'Sessione non valida.');const ticket=await q(env,'SELECT * FROM capture_tickets WHERE id=? AND user=?',id,user).first();if(!ticket)fail(404,'Sessione non disponibile.');
  const exists=await q(env,'SELECT author FROM posts WHERE id=?',id).first();if(exists){if(exists.author!==user)fail(409,'Identificativo già utilizzato.');return json({ok:true,id})}
  if(ticket.used||Date.now()>ticket.expires)fail(410,'Sessione scaduta. La foto resta disponibile per il download; avvia una nuova ripresa per pubblicare.');
  if(b.confirm!==true)fail(400,'Conferma la pubblicazione della foto.');if(typeof b.photo!=='string'||!b.photo.startsWith('data:image/jpeg;base64,'))fail(400,'Serve la foto scattata nella sessione.');
  const lock=await q(env,'UPDATE capture_tickets SET used=1 WHERE id=? AND user=? AND used=0 AND expires>?',id,user,Date.now()).run();if(!lock.meta.changes)fail(409,'La sessione è già in pubblicazione.');
  try{const text=clean(b.text,700)||'Il cielo della mia zona.';const body={id,city:ticket.city,text:text+'\n\nRipresa dichiarata nell’app · sessione '+new Date(ticket.created).toISOString()+' · evento non verificato.',kind:clean(b.kind,30)||'Osservazione',photo:b.photo,rapid:true};const delegated=new Request(url.origin+'/api/posts',{method:'POST',headers:req.headers,body:JSON.stringify(body)});const response=await api(delegated,env,new URL(delegated.url));if(!response.ok)throw Error('Pubblicazione non riuscita');const bytes=Uint8Array.from(atob(b.photo.split(',')[1]),c=>c.charCodeAt(0));const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');await q(env,'UPDATE capture_tickets SET hash=? WHERE id=?',hash,id).run();return json({ok:true,id});}catch(e){if(!await q(env,'SELECT id FROM posts WHERE id=?',id).first())await q(env,'UPDATE capture_tickets SET used=0 WHERE id=?',id).run();throw e}
 }
 fail(404,'Funzione non disponibile.');
}
