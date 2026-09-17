// Empty Web Push messages carry no personal data. The SW opens the authenticated answers page.
const pushBase64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
function schoolPushEndpoint(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||value.length>2048)throw Error();if(!['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(u.hostname)&&!u.hostname.endsWith('.notify.windows.com'))throw Error();return u.href}catch{fail(400,'Servizio notifiche del browser non supportato.')}}
function schoolPushHour(now){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',hourCycle:'h23'}).format(now))}
async function sendSchoolPush(env,actor,notice,origin,feedback=false){
 if(!env.WEB_PUSH_PRIVATE_JWK||!env.WEB_PUSH_PUBLIC_KEY)return;
 const now=Date.now(),hour=schoolPushHour(now);if(hour<7||hour>=22)return;
 const event=feedback==='event';
 const pref=await q(env,event?'SELECT enabled FROM event_push_prefs WHERE actor=?':feedback?'SELECT enabled FROM feedback_push_prefs WHERE actor=?':'SELECT enabled FROM answer_push_prefs WHERE actor=?',actor).first();if(!pref?.enabled)return;
 const sub=await q(env,'SELECT * FROM answer_subscriptions WHERE actor=? ORDER BY created DESC LIMIT 1',actor).first();if(!sub)return;
 const table=event?'event_notices':feedback?'feedback_notices':'answer_notices';
 const live=event?await q(env,'SELECT n.id FROM event_notices n JOIN event_groups g ON g.id=n.event JOIN event_members m ON m."group"=g.id AND m.actor=n.actor WHERE n.id=? AND n.actor=? AND n.seen=0 AND g.expires>? AND g.changed=1',notice,actor,now).first():feedback?await q(env,'SELECT n.id FROM feedback_notices n JOIN sky_reports r ON r.id=n.report WHERE n.id=? AND n.actor=? AND r.hidden=0 AND r.deleted=0 AND r.expires>?',notice,actor,now).first():await q(env,'SELECT n.id FROM answer_notices n JOIN zone_questions z ON z.id=n.question WHERE n.id=? AND n.actor=? AND n.seen=0 AND z.deleted=0 AND z.expires>? AND EXISTS(SELECT 1 FROM zone_answers a WHERE a.question=z.id AND a.deleted=0 AND a.hidden=0)',notice,actor,now).first();if(!live)return;
 const reserved=await q(env,`UPDATE ${table} SET pushed=-1 WHERE id=? AND pushed=0 RETURNING id`,notice).first();if(!reserved)return;
 const limit=await q(env,'INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<2 RETURNING count','push-day:'+actor+':'+romeDate(now)).first();if(!limit){await q(env,`UPDATE ${table} SET pushed=-3 WHERE id=?`,notice).run();return}
 try{
  const endpoint=schoolPushEndpoint(sub.endpoint),aud=new URL(endpoint).origin,enc=new TextEncoder();
  const header=pushBase64(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),payload=pushBase64(enc.encode(JSON.stringify({aud,exp:Math.floor(now/1000)+3600,sub:origin}))),input=header+'.'+payload;
  const key=await crypto.subtle.importKey('jwk',JSON.parse(env.WEB_PUSH_PRIVATE_JWK),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(input));
  const ttl=Math.min(7200,Math.max(0,(22-hour)*3600-3600));
  const response=await fetch(endpoint,{method:'POST',redirect:'error',headers:{Authorization:'vapid t='+input+'.'+pushBase64(signature)+', k='+env.WEB_PUSH_PUBLIC_KEY,TTL:String(ttl),Urgency:'normal'},signal:AbortSignal.timeout(8000)});
  if(response.status===404||response.status===410)await q(env,'DELETE FROM answer_subscriptions WHERE device=? AND endpoint=?',sub.device,sub.endpoint).run();
  await q(env,`UPDATE ${table} SET pushed=? WHERE id=?`,response.ok?1:-2,notice).run();
 }catch{await q(env,`UPDATE ${table} SET pushed=-2 WHERE id=?`,notice).run()}
}
async function schoolPushApi(req,env,url){const actor=await skyActor(req,env);if(!actor)fail(401,'Inizia una sessione per gestire gli avvisi.');const path=url.pathname.slice('/api/answer-push/'.length),now=Date.now(),device=await skyDevice(req);
 const eligible=!!await q(env,'SELECT id FROM sky_reports WHERE author=? LIMIT 1',actor.id).first();
 if(req.method==='GET'&&path==='feedback'){const rows=(await q(env,'SELECT n.id,r.city,r.created,(SELECT COUNT(*) FROM sky_confirmations c WHERE c.report=r.id) confirms FROM feedback_notices n JOIN sky_reports r ON r.id=n.report WHERE n.actor=? AND r.deleted=0 AND r.hidden=0 AND r.expires>? ORDER BY n.created DESC LIMIT 10',actor.id,now).all()).results;return json({notices:rows})}
 if(req.method==='GET'&&path==='config'){const pref=await q(env,'SELECT enabled,later FROM answer_push_prefs WHERE actor=?',actor.id).first();const feedback=await q(env,'SELECT enabled FROM feedback_push_prefs WHERE actor=?',actor.id).first();const events=await q(env,'SELECT enabled FROM event_push_prefs WHERE actor=?',actor.id).first();return json({eventsEnabled:!!events?.enabled,feedbackEnabled:!!feedback?.enabled,available:!!(env.WEB_PUSH_PRIVATE_JWK&&env.WEB_PUSH_PUBLIC_KEY),publicKey:env.WEB_PUSH_PUBLIC_KEY||'',eligible,enabled:!!pref?.enabled,later:pref?.later||0})}
 if(req.method!=='POST')fail(405,'Metodo non disponibile.');if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json'))fail(403,'Richiesta non autorizzata.');await quota(env,actor.id,'push-preferences',15);const raw=await req.text();if(raw.length>4000)fail(413,'Richiesta troppo grande.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Dati non validi.')}
 if(path==='events'){if(!eligible)fail(403,'Invia prima una segnalazione.');await q(env,'INSERT INTO event_push_prefs VALUES(?,?) ON CONFLICT(actor) DO UPDATE SET enabled=excluded.enabled',actor.id,Number(b.enabled===true)).run();return json({ok:true})}
 if(path==='feedback'){if(!eligible)fail(403,'Invia prima una segnalazione.');await q(env,'INSERT INTO feedback_push_prefs VALUES(?,?) ON CONFLICT(actor) DO UPDATE SET enabled=excluded.enabled',actor.id,Number(b.enabled===true)).run();return json({ok:true})}
 if(path==='later'||path==='disable'){await q(env,'INSERT INTO answer_push_prefs VALUES(?,0,?) ON CONFLICT(actor) DO UPDATE SET enabled=0,later=excluded.later',actor.id,path==='later'?now+604800000:0).run();const f=await q(env,'SELECT enabled FROM feedback_push_prefs WHERE actor=?',actor.id).first();const ep=await q(env,'SELECT enabled FROM event_push_prefs WHERE actor=?',actor.id).first();if(!f?.enabled&&!ep?.enabled)await q(env,'DELETE FROM answer_subscriptions WHERE actor=?',actor.id).run();return json({ok:true})}
 if(path==='subscribe'){
  if(!eligible)fail(403,'Gli avvisi si possono attivare dopo la prima segnalazione del cielo.');if(!device)fail(401,'Riapri la sessione prima di attivare gli avvisi.');if(!env.WEB_PUSH_PRIVATE_JWK||!env.WEB_PUSH_PUBLIC_KEY)fail(503,'Notifiche non configurate.');
  const endpoint=schoolPushEndpoint(b?.endpoint);await db(env).batch([q(env,'INSERT INTO answer_subscriptions VALUES(?,?,?,?) ON CONFLICT(device) DO UPDATE SET actor=excluded.actor,endpoint=excluded.endpoint,created=excluded.created',device,actor.id,endpoint,now),q(env,'INSERT INTO answer_push_prefs VALUES(?,?,0) ON CONFLICT(actor) DO UPDATE SET enabled=excluded.enabled,later=0',actor.id,Number(b.answers!==false))]);return json({ok:true});
 }
 fail(404,'Azione non disponibile.');
}

async function notifyReportConfirmation(env,row,origin){
 const now=Date.now();await q(env,'DELETE FROM feedback_notices WHERE created<?',now-86400000).run();
 await q(env,'INSERT OR IGNORE INTO feedback_notices(id,actor,report,created) SELECT ?,author,id,? FROM sky_reports WHERE id=? AND deleted=0 AND hidden=0 AND expires>?',crypto.randomUUID(),now,row.id,now).run();
 const notice=await q(env,'SELECT id FROM feedback_notices WHERE report=?',row.id).first();if(notice)await sendSchoolPush(env,row.author,notice.id,origin,true);
}
