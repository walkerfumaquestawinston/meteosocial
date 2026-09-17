const HAIL_SIZES=['unknown','under1','1to2','2to4','over4'];
function hailInput(value,kind,now=Date.now()){
 if(value===undefined)return null;
 if(kind!=='Grandine'||!value||!HAIL_SIZES.includes(value.size)||!Number.isSafeInteger(value.observed)||value.observed>now||value.observed<=now-7200000)fail(400,'Indica una dimensione valida e un’osservazione nelle ultime due ore.');
 return {size:value.size,observed:value.observed};
}
function hailFields(user){
 return {sql:`p.id,p.city,p.created,p.expires,p.map_lat,p.map_lon,substr(p.text,1,300) AS text,CASE WHEN p.photo IS NULL THEN 0 ELSE 1 END AS has_photo,COALESCE(h.observed,p.created) AS observed,COALESCE(h.size,'unknown') AS size,h.ended,
 (SELECT COUNT(*) FROM links l WHERE l.target=p.id AND l.kind='confirm' AND l.user!=p.author) AS confirms,
 (SELECT COUNT(*) FROM links l WHERE l.target=p.id AND l.kind='dispute' AND l.user!=p.author) AS disputes,
 CASE WHEN p.author=? THEN 1 ELSE 0 END AS mine,
 (SELECT l.kind FROM links l WHERE l.target=p.id AND l.user=? AND l.kind IN ('confirm','dispute') LIMIT 1) AS my_vote`,args:[user||'',user||'']};
}
async function hailWatches(req,env,user){
 if(!user)fail(401,'Accedi per ritrovare le tue zone anche sugli altri dispositivi.');
 const rows=(await q(env,'SELECT slot,name,lat,lon,radius FROM hail_watches WHERE user=? ORDER BY slot',user).all()).results;
 return json({places:rows.map(p=>({slot:p.slot,name:p.name,latitude:p.lat/100,longitude:p.lon/100,radius:p.radius})),updated:Date.now()});
}
async function hailWrite(env,user,path,b){
 if(path==='/api/hail/watch'){
  if(!Number.isInteger(b.slot)||b.slot<0||b.slot>4)fail(400,'Scegli una delle cinque zone.');
  if(b.remove===true){await q(env,'DELETE FROM hail_watches WHERE user=? AND slot=?',user,b.slot).run();return json({ok:true})}
  const name=clean(b.name,80);
  if(!name||!Number.isFinite(b.latitude)||!Number.isFinite(b.longitude)||Math.abs(b.latitude)>85||Math.abs(b.longitude)>180||![2,5,10,25,50].includes(b.radius)||b.consent!==true)fail(400,'Conferma nome, zona e raggio da salvare nel tuo account.');
  await q(env,'INSERT INTO hail_watches(user,slot,name,lat,lon,radius,created) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user,slot) DO UPDATE SET name=excluded.name,lat=excluded.lat,lon=excluded.lon,radius=excluded.radius',user,b.slot,name,Math.round(b.latitude*100),Math.round(b.longitude*100),b.radius,Date.now()).run();return json({ok:true});
 }
 if(path==='/api/hail/end'){
  const now=Date.now(),post=await q(env,"SELECT id,author,created FROM posts WHERE id=? AND kind='Grandine' AND deleted=0 AND created>? AND created<=? AND (expires IS NULL OR expires>?)",clean(b.id,50),now-7200000,now,now).first();
  if(!post)fail(404,'La segnalazione non è più disponibile.');
  if(post.author!==user)fail(403,'Puoi aggiornare soltanto la tua osservazione.');
  if(b.confirm!==true)fail(400,'Conferma che, dal tuo punto di osservazione, ha smesso.');
  await q(env,"INSERT INTO hail_details(post,observed,size,ended) VALUES(?,?,'unknown',?) ON CONFLICT(post) DO UPDATE SET ended=COALESCE(hail_details.ended,excluded.ended)",post.id,post.created,now).run();return json({ok:true});
 }
 fail(404,'Azione grandine non disponibile.');
}
