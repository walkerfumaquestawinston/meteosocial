// Password verifier is a runtime secret. Sessions and moderation actions are server-side.
function moderationCookie(req){return (req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('ms_moderator='))?.slice(13)||''}
async function moderationSession(req,env){const token=moderationCookie(req);if(!/^[a-f0-9]{64}$/.test(token)||!env.MODERATION_PASSWORD_HASH)return null;return q(env,'SELECT token FROM moderation_sessions WHERE token=? AND credential=? AND expires>?',await skyHash(token),env.MODERATION_PASSWORD_HASH,Date.now()).first()}
async function moderationCheckWrite(req,env){const actor=await skyActor(req,env),device=await skyDevice(req);if(!actor&&!device)return;const banned=await q(env,'SELECT key FROM moderation_bans WHERE key IN (?,?) LIMIT 1',actor?'actor:'+actor.id:'','device:'+device).first();if(banned)fail(403,'Le pubblicazioni da questo account o browser sono state bloccate dal gestore.');if(actor&&device&&req.headers.get('origin')===new URL(req.url).origin)await q(env,'INSERT OR IGNORE INTO actor_devices(actor,device) VALUES(?,?)',actor.id,device).run()}
function moderatorSource(source){if(!['sky','posts','schools'].includes(source))fail(400,'Fonte non valida.');return source==='sky'?'sky_reports':source==='schools'?'zone_answers':'posts'}
async function moderationApi(req,env,url){const path=url.pathname.slice('/api/moderation/'.length),now=Date.now();
 if(!['GET','POST'].includes(req.method))fail(405,'Metodo non disponibile.');
 if(req.method==='POST'&&(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json')))fail(403,'Richiesta non autorizzata.');
 if(path==='login'&&req.method==='POST'){
  if(!/^[a-f0-9]{64}$/.test(env.MODERATION_PASSWORD_HASH||''))fail(503,'Accesso del moderatore non configurato.');
  await quota(env,await skyHash(req.headers.get('cf-connecting-ip')||'unknown'),'moderation-login',30);
  const raw=await req.text();if(raw.length>1024)fail(400,'Richiesta non valida.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Richiesta non valida.')}
  const hash=await skyHash(typeof b?.password==='string'?b.password:''),expected=env.MODERATION_PASSWORD_HASH;let difference=0;for(let i=0;i<64;i++)difference|=hash.charCodeAt(i)^expected.charCodeAt(i);if(difference)fail(401,'Password non corretta.');
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
  await db(env).batch([q(env,'DELETE FROM moderation_sessions WHERE expires<=? OR credential<>?',now,expected),q(env,'INSERT INTO moderation_sessions VALUES(?,?,?)',await skyHash(token),expected,now+28800000)]);
  const response=json({ok:true});response.headers.set('Set-Cookie','ms_moderator='+token+'; Path=/api/moderation; HttpOnly; SameSite=Strict; Max-Age=28800'+(url.protocol==='https:'?'; Secure':''));return response;
 }
 const session=await moderationSession(req,env);if(!session)fail(401,'Accedi al pannello con la password del gestore.');
 if(path==='session'&&req.method==='GET')return json({ok:true});
 if(path==='reports'&&req.method==='GET'){
  const offset=Number(url.searchParams.get('offset')||0),until=Number(url.searchParams.get('until')||now);if(!Number.isInteger(offset)||offset<0||offset>100000||!Number.isFinite(until)||until>now||until<now-86400000)fail(400,'Pagina non valida.');
  const sky=(await q(env,`SELECT r.id,r.name,r.city,r.note text,r.phenomenon,r.kind,r.created,r.expires,r.hidden,r.deleted,r.photo,(SELECT GROUP_CONCAT(f.reason,' · ') FROM sky_flags f WHERE f.report=r.id) reasons FROM sky_reports r WHERE r.created>? AND r.created<=? ORDER BY r.created DESC,r.id LIMIT 101 OFFSET ?`,until-86400000,until,offset).all()).results;
  const posts=(await q(env,`SELECT p.id,COALESCE(u.name,'Una persona') name,p.city,p.text,p.kind,p.created,p.expires,0 hidden,p.deleted,p.photo,(SELECT GROUP_CONCAT(f.reason,' · ') FROM flags f WHERE f.post=p.id) reasons FROM posts p LEFT JOIN profiles u ON u.id=p.author WHERE p.created>? AND p.created<=? ORDER BY p.created DESC,p.id LIMIT 101 OFFSET ?`,until-86400000,until,offset).all()).results;
  const schools=(await q(env,`SELECT a.id,'Una persona della zona' name,z.city,a.answer||CASE WHEN a.url<>'' THEN ' · '||a.url ELSE '' END text,'Risposta sulle scuole' kind,a.created,z.expires,a.hidden,a.deleted,0 photo,CASE WHEN a.hidden=1 THEN 'Risposta segnalata come non attendibile' ELSE '' END reasons FROM zone_answers a JOIN zone_questions z ON z.id=a.question WHERE a.created>? AND a.created<=? ORDER BY a.created DESC,a.id LIMIT 101 OFFSET ?`,until-86400000,until,offset).all()).results;
  return json({reports:[...schools.slice(0,100).map(r=>({...r,source:'schools',photo:false})),...sky.slice(0,100).map(r=>({...r,source:'sky',photo:!!r.photo})),...posts.slice(0,100).map(r=>({...r,source:'posts',photo:!!r.photo}))].sort((a,b)=>b.created-a.created),until,next:sky.length>100||posts.length>100||schools.length>100?offset+100:null});
 }
 if(path.startsWith('media/')&&req.method==='GET'){const [,source,id]=path.split('/'),table=moderatorSource(source);if(source==='schools')fail(404,'Foto non disponibile.');const row=await q(env,'SELECT photo FROM '+table+' WHERE id=? AND created>? AND deleted=0',id,now-86400000).first();if(!row?.photo)fail(404,'Foto non disponibile.');const object=await env.BUCKET?.get(row.photo);if(!object)fail(404,'Foto non disponibile.');return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
 if(req.method!=='POST')fail(404,'Pagina non trovata.');
 if(path==='logout'){await q(env,'DELETE FROM moderation_sessions WHERE token=?',session.token).run();const response=json({ok:true});response.headers.set('Set-Cookie','ms_moderator=; Path=/api/moderation; HttpOnly; SameSite=Strict; Max-Age=0');return response}
 if(!['remove','ban'].includes(path))fail(404,'Azione non disponibile.');
 const raw=await req.text();if(raw.length>1024)fail(400,'Richiesta non valida.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Richiesta non valida.')}const table=moderatorSource(b?.source),id=clean(b?.id,36);
 const row=await q(env,'SELECT author,'+(table==='zone_answers'?'NULL':'photo')+' photo FROM '+table+' WHERE id=? AND created>?',id,now-86400000).first();if(!row)fail(404,'Contenuto non disponibile nelle ultime 24 ore.');
 if(path==='remove'){await q(env,'UPDATE '+table+' SET deleted=1 WHERE id=?',id).run();if(row.photo)await env.BUCKET?.delete(row.photo);return json({ok:true})}
 const devices=(await q(env,'SELECT device FROM actor_devices WHERE actor=?',row.author).all()).results;
 await db(env).batch([q(env,'INSERT OR IGNORE INTO moderation_bans VALUES(?,?)','actor:'+row.author,now),...devices.map(d=>q(env,'INSERT OR IGNORE INTO moderation_bans VALUES(?,?)','device:'+d.device,now)),q(env,'UPDATE sky_reports SET deleted=1 WHERE author=?',row.author),q(env,'UPDATE posts SET deleted=1 WHERE author=?',row.author),q(env,'UPDATE zone_answers SET deleted=1 WHERE author=?',row.author),q(env,'UPDATE zone_questions SET deleted=1 WHERE author=?',row.author)]);
 return json({ok:true,devices:devices.length,message:'Account bloccato. Browser riconosciuti bloccati: '+devices.length+'.'});
}
