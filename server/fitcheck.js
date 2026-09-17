// Public area cells, never device coordinates. One opt-in placement per post.
const FIT_TAGS=['Leggero','A strati','Impermeabile','Ombrello','Scarpe chiuse'];
function fitCell(lat,lon){return {lat:Math.round(lat*50),lon:((Math.round(lon*50)+9000)%18000+18000)%18000-9000}}
function fitCoordinates(b){return Number.isFinite(b.latitude)&&Number.isFinite(b.longitude)&&Math.abs(b.latitude)<=85&&Math.abs(b.longitude)<=180}
async function fitcheckApi(req,env,url){
 const user=await identity(req),now=Date.now(),path=url.pathname;
 if(req.method==='GET'&&path==='/api/fitcheck/feed'){
  if(!url.searchParams.has('latitude')||!url.searchParams.has('longitude'))fail(400,'Scegli una zona.');
  const input={latitude:Number(url.searchParams.get('latitude')),longitude:Number(url.searchParams.get('longitude'))};
  const radius=Number(url.searchParams.get('radius')||5),tag=clean(url.searchParams.get('tag'),30);
  if(!fitCoordinates(input)||![5,20].includes(radius)||(tag&&!FIT_TAGS.includes(tag)))fail(400,'Zona o filtro non validi.');
  const cell=fitCell(input.latitude,input.longitude),lat=cell.lat/50,lon=cell.lon/50,dy=radius/110.5,dx=Math.min(180,radius/(110.5*Math.cos(lat*Math.PI/180)));
  const args=[now,now,Math.floor((lat-dy)*50),Math.ceil((lat+dy)*50)];
  let longitude='';const west=lon-dx,east=lon+dx;
  if(west<-180){longitude='(f.lon>=? OR f.lon<=?)';args.push(Math.floor((west+360)*50),Math.ceil(east*50))}
  else if(east>180){longitude='(f.lon>=? OR f.lon<=?)';args.push(Math.floor(west*50),Math.ceil((east-360)*50))}
  else{longitude='f.lon BETWEEN ? AND ?';args.push(Math.floor(west*50),Math.ceil(east*50))}
  let extra='';if(tag){extra+=' AND f.tag=?';args.push(tag)}
  if(user){extra+=" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')";args.push(user)}
  const rows=(await q(env,`SELECT p.id,p.author,p.text,p.city,p.photo,p.video,p.created,COALESCE(u.name,'Redazione') name,f.lat,f.lon,f.tag,f.expires FROM fit_checks f JOIN posts p ON p.id=f.post LEFT JOIN profiles u ON u.id=p.author WHERE f.expires>? AND p.deleted=0 AND (p.expires IS NULL OR p.expires>?) AND f.lat BETWEEN ? AND ? AND ${longitude}${extra} ORDER BY p.created DESC,p.id DESC LIMIT 201`,...args).all()).results;
  const posts=rows.slice(0,200).map(p=>({...p,latitude:p.lat/50,longitude:p.lon/50,distance:pulseDistance({lat,lon},{lat:p.lat/50,lon:p.lon/50})})).filter(p=>p.distance<=radius).slice(0,100).map(({lat,lon,...p})=>p);
  return json({posts,limited:rows.length>200||posts.length===100,center:{latitude:lat,longitude:lon},radius,asOf:now,precision:'Zona approssimata scelta dall’autore. Celle di circa 2 km in latitudine, più strette verso i poli.'});
 }
 if(!user)fail(401,'Accedi per aggiungere il tuo Fit Check.');
 if(req.method==='GET'&&path==='/api/fitcheck/mine'){
  const rows=(await q(env,"SELECT p.id,p.text,p.city,p.photo,p.video,p.created,f.tag,f.lat,f.lon,f.expires FROM posts p LEFT JOIN fit_checks f ON f.post=p.id WHERE p.author=? AND p.deleted=0 AND p.created>? AND (p.expires IS NULL OR p.expires>?) AND (p.photo IS NOT NULL OR p.video IS NOT NULL) ORDER BY p.created DESC,p.id DESC LIMIT 30",user,now-86400000,now).all()).results;
  return json({posts:rows.map(({lat,lon,...p})=>({...p,latitude:lat===null?null:lat/50,longitude:lon===null?null:lon/50}))});
 }
 if(req.method!=='POST'||!['/api/fitcheck/place','/api/fitcheck/remove'].includes(path))fail(404,'Funzione non disponibile.');
 if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json'))fail(403,'Richiesta non autorizzata.');
 const raw=await req.text();if(raw.length>2000)fail(413,'Richiesta troppo estesa.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Dati non validi.')}
 const id=clean(b?.post,50);if(!/^[a-f0-9-]{36}$/.test(id))fail(400,'Scegli un post.');
 const post=await q(env,'SELECT * FROM posts WHERE id=? AND author=?',id,user).first();if(!post)fail(404,'Puoi modificare solo un tuo post.');
 await quota(env,user,'fit-check-write',30);
 if(path.endsWith('/remove')){await q(env,'DELETE FROM fit_checks WHERE post=?',id).run();return json({ok:true})}
 if(post.deleted||post.created<=now-86400000||(post.expires&&post.expires<=now)||(!post.photo&&!post.video))fail(409,'Scegli una tua foto o un video pubblicato nelle ultime 24 ore.');
 if(!fitCoordinates(b)||b.consent!==true||!FIT_TAGS.includes(b.tag))fail(400,'Scegli la zona, un consiglio e conferma la pubblicazione.');
 const cell=fitCell(b.latitude,b.longitude),expires=Math.min(post.created+86400000,post.expires||Infinity);
 const known=ATLAS_CITIES.find(c=>c.name.toLocaleLowerCase()===post.city.trim().toLocaleLowerCase());
 if(known&&pulseDistance({lat:cell.lat/50,lon:cell.lon/50},{lat:known.latitude,lon:known.longitude})>35)fail(400,'La zona è lontana dalla città indicata nel post. Scegli un’area entro 35 km da '+known.name+'.');
 await q(env,'INSERT INTO fit_checks(post,lat,lon,tag,expires) VALUES(?,?,?,?,?) ON CONFLICT(post) DO UPDATE SET lat=excluded.lat,lon=excluded.lon,tag=excluded.tag,expires=excluded.expires',id,cell.lat,cell.lon,b.tag,expires).run();
 return json({ok:true,latitude:cell.lat/50,longitude:cell.lon/50,expires});
}
