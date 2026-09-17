// Server-owned room lifetimes and editorial rewards. Client coordinates are
// declared browser location, not attested proof of presence or weather.
async function studioAssets(env,user){
 const row=await q(env,"SELECT COUNT(DISTINCT l.user) people FROM links l JOIN posts p ON p.id=l.target WHERE p.author=? AND p.deleted=0 AND (p.expires IS NULL OR p.expires>?) AND l.kind='like' AND l.user<>p.author AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=p.author AND b.target=l.user AND b.kind='block')",user,Date.now()).first();
 const earned=(await q(env,"SELECT item FROM inventory WHERE user=? AND item LIKE 'graphic_%'",user).all()).results.map(r=>r.item);
 return {people:row.people,earned,threshold:10,meaning:'Persone distinte che hanno apprezzato contenuti attivi. Non è una misura di viralità.'};
}
async function studioApi(req,env,url){
 const user=await identity(req),now=Date.now(),path=url.pathname;
 if(!user)fail(401,'Accedi con il tuo profilo per entrare.');
 if(req.method==='GET'&&path==='/api/studio/assets')return json(await studioAssets(env,user));
 if(req.method==='GET'&&path==='/api/studio/room'){
  const id=clean(url.searchParams.get('id'),70);const room=await q(env,'SELECT r.* FROM weather_rooms r JOIN weather_room_members m ON m.room=r.id WHERE r.id=? AND r.expires>? AND m.user=? AND m.expires>?',id,now,user,now).first();if(!room)fail(410,'Stanza o accesso scaduti. Verifica di nuovo la tua zona.');
  const messages=(await q(env,"SELECT m.id,m.user,m.text,m.created,COALESCE(p.name,'Redazione') name FROM weather_room_messages m LEFT JOIN profiles p ON p.id=m.user WHERE m.room=? AND m.deleted=0 AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=m.user AND b.kind='block') ORDER BY m.created DESC,m.id DESC LIMIT 60",id,user).all()).results.reverse();return json({room,messages});
 }
 if(req.method!=='POST')fail(404,'Funzione non disponibile.');if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json'))fail(403,'Richiesta non autorizzata.');const raw=await req.text();if(raw.length>5000)fail(413,'Richiesta troppo estesa.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Dati non validi.')}if(!await q(env,'SELECT id FROM profiles WHERE id=?',user).first())fail(400,'Scegli prima il nome della tua redazione nel Profilo.');
 if(path==='/api/studio/unlock'){
  await quota(env,user,'studio-unlock',10);const assets=await studioAssets(env,user);if(assets.people<assets.threshold)fail(409,'Servono apprezzamenti da 10 persone distinte sui tuoi contenuti.');await q(env,'INSERT OR IGNORE INTO inventory(user,item,created) VALUES(?,?,?)',user,'graphic_orbit',now).run();return json({ok:true,item:'graphic_orbit'});
 }
 if(path==='/api/studio/enter'){
  await quota(env,user,'storm-room-enter',6);
  if(!Number.isFinite(b.latitude)||!Number.isFinite(b.longitude)||Math.abs(b.latitude)>85||Math.abs(b.longitude)>180||!Number.isFinite(b.accuracy)||b.accuracy<0||b.accuracy>5000)fail(400,'Serve una posizione del dispositivo sufficientemente precisa.');
  const rounded={lat:Math.round(b.latitude*100)/100,lon:Math.round(b.longitude*100)/100};const city=ATLAS_CITIES.map(c=>({...c,km:pulseDistance(rounded,{lat:c.latitude,lon:c.longitude})})).sort((a,b)=>a.km-b.km)[0];if(!city||city.km>20)fail(400,'Le stanze sono inizialmente disponibili entro 20 km dalle città del catalogo.');
  const meteo=await socialWeather(rounded.lat,rounded.lon);const measured=Date.parse(String(meteo.time)+'Z')-Number(meteo.utc_offset_seconds)*1000;if(!Number.isFinite(measured)||Math.abs(now-measured)>5400000)fail(503,'Dati meteo non abbastanza recenti per aprire una stanza.');if(![95,96,99].includes(meteo.weather_code))return json({active:false,city:city.name,reason:'Il modello meteo non indica un temporale adesso. Nessuna stanza viene creata.',sourceTime:meteo.time});
  // Purge expired conversations when a room is entered. No precise GPS saved.
  await q(env,'DELETE FROM weather_room_messages WHERE room IN(SELECT id FROM weather_rooms WHERE expires<=?)',now).run();await q(env,'DELETE FROM weather_room_members WHERE expires<=? OR room IN(SELECT id FROM weather_rooms WHERE expires<=?)',now,now).run();await q(env,'DELETE FROM weather_rooms WHERE expires<=?',now).run();
  const id='storm-'+city.id+'-'+Math.floor(now/1800000),expires=(Math.floor(now/1800000)+1)*1800000;
  await q(env,'INSERT OR IGNORE INTO weather_rooms(id,city,created,expires,source_time) VALUES(?,?,?,?,?)',id,city.name,now,expires,String(meteo.time)).run();await q(env,'INSERT INTO weather_room_members(user,room,expires) VALUES(?,?,?) ON CONFLICT(user,room) DO UPDATE SET expires=excluded.expires',user,id,Math.min(expires,now+600000)).run();return json({active:true,id,city:city.name,expires,accessExpires:Math.min(expires,now+600000),sourceTime:meteo.time,source:'Open-Meteo · stima di modello, non allerta',presence:'Posizione dichiarata dal browser, non certificata'});
 }
 if(['/api/studio/message','/api/studio/delete-message','/api/studio/flag-message'].includes(path)){
  await quota(env,user,'storm-room-write',40);const id=clean(b.room,70);const member=await q(env,'SELECT m.user FROM weather_room_members m JOIN weather_rooms r ON r.id=m.room WHERE m.user=? AND m.room=? AND m.expires>? AND r.expires>?',user,id,now,now).first();if(!member)fail(410,'L’accesso alla stanza è scaduto. Verifica di nuovo la posizione.');
  if(path.endsWith('/message')){const text=clean(b.text,500),message=clean(b.id,50);if(!text||!/^[-a-f0-9]{36}$/.test(message))fail(400,'Scrivi un messaggio fino a 500 caratteri.');const exists=await q(env,'SELECT user,room FROM weather_room_messages WHERE id=?',message).first();if(exists&&(exists.user!==user||exists.room!==id))fail(409,'Identificativo già usato.');await q(env,'INSERT OR IGNORE INTO weather_room_messages(id,room,user,text,created,deleted) VALUES(?,?,?,?,?,0)',message,id,user,text,now).run();return json({ok:true})}
  const msg=await q(env,'SELECT id,user FROM weather_room_messages WHERE id=? AND room=? AND deleted=0',clean(b.id,50),id).first();if(!msg)fail(404,'Messaggio non disponibile.');
  if(path.endsWith('/delete-message')){if(msg.user!==user)fail(403,'Puoi eliminare solo i tuoi messaggi.');await q(env,'UPDATE weather_room_messages SET deleted=1,text=? WHERE id=?','',msg.id).run();return json({ok:true})}
  const reason=clean(b.reason,200);if(!reason)fail(400,'Indica il motivo.');await q(env,'INSERT OR REPLACE INTO weather_room_flags(user,message,reason,created) VALUES(?,?,?,?)',user,msg.id,reason,now).run();return json({ok:true});
 }
 fail(404,'Funzione non disponibile.');
}
