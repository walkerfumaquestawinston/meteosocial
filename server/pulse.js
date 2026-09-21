// Nearby information and weekly community challenges. Never produces storm ETAs.
const pulseCityKey=s=>String(s||'').normalize('NFKC').trim().toLocaleLowerCase('it-IT');
function pulseWeek(now=Date.now()){const d=new Date(now);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)}
function pulseDistance(a,b){const r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)))}
function pulseOSM(elements){return elements.flatMap(e=>{const t=e.tags||{},lat=e.lat??e.center?.lat,lon=e.lon??e.center?.lon;if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!['node','way','relation'].includes(e.type)||!Number.isSafeInteger(e.id))return [];if(['private','no','permit','military'].includes(t.access)||['private','no'].includes(t.motor_vehicle)||t.disused==='yes')return [];const parking=t.amenity==='parking'&&(t.covered==='yes'||['underground','multi-storey','garage'].includes(t.parking));const building=['library','community_centre','townhall'].includes(t.amenity);if(!parking&&!building)return [];return [{id:'osm-'+e.type+'-'+e.id,name:clean(t.name,100)||(parking?'Parcheggio coperto':'Edificio pubblico'),lat,lon,type:parking?'car':'people',source:'OpenStreetMap',sourceURL:'https://www.openstreetmap.org/'+e.type+'/'+e.id,details:clean([t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),160),openingHours:clean(t.opening_hours,150)||null,fee:t.fee==='yes'?'A pagamento':t.fee==='no'?'Gratuito indicato':'Costo da verificare',access:clean(t.access,40)||'unknown',availableSlots:null}];})}
async function pulseNearby(env,url,user){
 const latText=url.searchParams.get('lat'),lonText=url.searchParams.get('lon'),lat=Number(latText),lon=Number(lonText);if(!latText||!lonText||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180)fail(400,'Scegli una posizione valida tra 85° sud e 85° nord.');
 // Round before querying a third party. Never store the visitor's exact GPS position.
 const category=url.searchParams.get('category')==='people'?'people':'car';
 const center={lat:Math.round(lat*100)/100,lon:Math.round(lon*100)/100},cache=optionalPublicCache(),key=new Request(url.origin+'/api/pulse/osm-cell?lat='+center.lat+'&lon='+center.lon+'&category='+category);let osm=[],sourceError='',osmAt=null;
 try{const hit=await cache?.match(key);let payload;if(hit)payload=await hit.json();else{
  // Limit the whole application's upstream use; this is not a per-visitor allowance.
  const limit=await q(env,'INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count','nearby-osm:'+new Date().toISOString().slice(0,10)).first();if(limit.count>80)throw Error('Ricerca cartografica temporaneamente al limite. Restano i luoghi della community.');
  const area=`(around:6000,${center.lat},${center.lon})`;
  const filters=category==='people'?['[amenity~"^(library|community_centre|townhall)$"]']:['[amenity=parking][covered=yes]','[amenity=parking][parking~"^(underground|multi-storey|garage)$"]'];
  const query=`[out:json][timeout:15];(${filters.map(filter=>'nwr'+filter+area+';').join('')});out center 100;`;
  const r=await fetch('https://overpass.private.coffee/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'MeteoSocial/1.1 (+https://scudo-meteo-community.walkerthehate.chatgpt.site)'},body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(27000)});if(!r.ok)throw Error('Cartografia dei luoghi temporaneamente non disponibile.');
  const raw=await r.text();if(raw.length>300000)throw Error('Risposta cartografica troppo estesa.');const d=JSON.parse(raw);if(!Array.isArray(d.elements)||d.remark)throw Error('Ricerca cartografica incompleta. Riprova più tardi.');payload={places:pulseOSM(d.elements).slice(0,100),updated:d.osm3s?.timestamp_osm_base||Date.now()};if(cache)await cache.put(key,new Response(JSON.stringify(payload),{headers:{'Cache-Control':'public,max-age=21600','Content-Type':'application/json'}}));
 }osm=payload.places;osmAt=payload.updated}catch(e){sourceError=['TimeoutError','AbortError','TypeError','SyntaxError'].includes(e.name)?'La fonte cartografica non ha risposto in tempo. Puoi riprovare o usare Google Maps.':e.message||'Cartografia non disponibile.'}
 const lonSpan=.07/Math.max(.05,Math.cos(center.lat*Math.PI/180)),args=[center.lat-.07,center.lat+.07,center.lon,lonSpan,center.lon,360-lonSpan];const clause=user?" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=s.author AND b.kind='block')":'';if(user)args.push(user);
 const rows=(await q(env,'SELECT s.* FROM shelters s WHERE s.deleted=0 AND CAST(s.lat AS REAL) BETWEEN ? AND ? AND (ABS(CAST(s.lon AS REAL)-?)<=? OR ABS(CAST(s.lon AS REAL)-?)>=?)'+clause+' ORDER BY s.created DESC LIMIT 201',...args).all()).results;
 const community=rows.slice(0,200).map(s=>({id:s.id,name:s.name,lat:Number(s.lat),lon:Number(s.lon),type:'unknown',source:'Community',sourceURL:null,details:s.details,city:s.city,created:s.created,author:s.author,openingHours:null,fee:'Da verificare',availableSlots:null}));
 const places=[...osm,...community].filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&pulseDistance(center,p)<=6.8);
 return json({places,sourceError,osmAt,updated:Date.now(),radiusKm:5,truncated:rows.length>200,originPrecision:'rounded_0.01_degrees',availability:'unknown'});
}
async function pulseApi(req,env,url){
 const user=await identity(req),now=Date.now(),week=pulseWeek(now),path=url.pathname;
 if(path==='/api/pulse/nearby'&&req.method==='GET')return pulseNearby(env,url,user);
 if(path==='/api/pulse/trends'&&req.method==='GET'){
  const args=[now-86400000,now,now],blocked=user?" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')":'';if(user)args.push(user);
  const where='p.deleted=0 AND p.created>=? AND p.created<=? AND (p.expires IS NULL OR p.expires>?)'+blocked;
  const themes=(await q(env,'SELECT p.kind,COUNT(*) posts,COUNT(DISTINCT p.author) people,MAX(p.created) latest FROM posts p WHERE '+where+' GROUP BY p.kind ORDER BY people DESC,posts DESC,p.kind LIMIT 8',...args).all()).results;
  const cities=(await q(env,'SELECT MIN(p.city) city,COUNT(*) posts,COUNT(DISTINCT p.author) people,MAX(p.created) latest FROM posts p WHERE '+where+' GROUP BY lower(trim(p.city)) ORDER BY people DESC,posts DESC,city LIMIT 8',...args).all()).results;
  return json({themes,cities,windowHours:24,updated:now,meaning:'Attività della community, non intensità meteo o tendenze esterne.'});
 }
 if(path==='/api/pulse/challenges'&&req.method==='GET'){
  const start=Date.parse(week+'T00:00:00Z'),end=start+7*86400000;
  const rows=(await q(env,`SELECT e.city,COUNT(*) points,COUNT(DISTINCT e.user) contributors FROM city_challenge_entries e JOIN posts p ON p.id=e.post WHERE e.week=? AND p.deleted=0 AND p.created>=? AND p.created<? AND (p.expires IS NULL OR p.expires>?) GROUP BY e.city ORDER BY points DESC,e.city`,week,start,end,now).all()).results;
  const members=(await q(env,'SELECT city,COUNT(*) members FROM city_challenge_members WHERE week=? GROUP BY city',week).all()).results;
  const mine=user?await q(env,'SELECT city FROM city_challenge_members WHERE user=? AND week=?',user,week).first():null;
  const entries=user?(await q(env,'SELECT e.post,e.day,e.city FROM city_challenge_entries e JOIN posts p ON p.id=e.post WHERE e.user=? AND e.week=? AND p.deleted=0',user,week).all()).results:[];
  const board=ATLAS_CITIES.map(c=>({id:c.id,name:c.name,points:rows.find(r=>r.city===c.id)?.points||0,contributors:rows.find(r=>r.city===c.id)?.contributors||0,members:members.find(r=>r.city===c.id)?.members||0})).filter(c=>c.points||c.members).sort((a,b)=>b.points-a.points||a.name.localeCompare(b.name));
  return json({week,ends:end,board,mine:mine?.city||null,entries,updated:now});
 }
 if(req.method!=='POST')fail(404,'Funzione non disponibile.');if(!user)fail(401,'Accedi per partecipare alla sfida.');if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.includes('application/json'))fail(403,'Richiesta non autorizzata.');const raw=await req.text();if(raw.length>4000)fail(413,'Richiesta troppo grande.');let b;try{b=JSON.parse(raw)}catch{fail(400,'Dati non validi.')}await quota(env,user,'city-challenge',25);if(!await q(env,'SELECT id FROM profiles WHERE id=?',user).first())fail(400,'Scegli prima il tuo nome nel Profilo.');
 if(path==='/api/pulse/join'){
  const city=ATLAS_CITIES.find(c=>c.id===b.city);if(!city)fail(400,'Scegli una città dall’elenco.');const entry=await q(env,'SELECT city FROM city_challenge_entries WHERE user=? AND week=? LIMIT 1',user,week).first();if(entry&&entry.city!==city.id)fail(409,'Hai già contribuito per un’altra città. Puoi cambiare dalla prossima settimana.');
  const joined=await q(env,'INSERT INTO city_challenge_members(user,week,city) VALUES(?,?,?) ON CONFLICT(user,week) DO UPDATE SET city=excluded.city WHERE NOT EXISTS(SELECT 1 FROM city_challenge_entries e WHERE e.user=excluded.user AND e.week=excluded.week AND e.city<>excluded.city)',user,week,city.id).run();if(!joined.meta.changes)fail(409,'La squadra resta quella del primo contributo della settimana.');return json({ok:true,city:city.id});
 }
 if(path==='/api/pulse/entry'){
  const p=await q(env,'SELECT * FROM posts WHERE id=? AND author=? AND deleted=0',clean(b.post,50),user).first();if(!p)fail(404,'Scegli una tua foto o un tuo video.');const start=Date.parse(week+'T00:00:00Z');if(p.created<start||p.created>now||p.expires||!['Cielo sereno','Osservazione'].includes(p.kind)||(!p.photo&&!p.video))fail(400,'La sfida accetta foto e video del cielo di questa settimana, come Osservazione o Cielo sereno.');
  const member=await q(env,'SELECT city FROM city_challenge_members WHERE user=? AND week=?',user,week).first(),city=ATLAS_CITIES.find(c=>c.id===member?.city);if(!city)fail(400,'Scegli prima una squadra nella pagina Sfide.');if(pulseCityKey(p.city)!==pulseCityKey(city.name))fail(400,'La località del post deve corrispondere alla città scelta.');
  const previous=await q(env,'SELECT post FROM city_challenge_entries WHERE post=?',p.id).first();if(previous)return json({ok:true,already:true});const day=new Date(p.created).toISOString().slice(0,10);
  const added=await q(env,'INSERT OR IGNORE INTO city_challenge_entries(post,user,week,day,city) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM city_challenge_members WHERE user=? AND week=? AND city=?)',p.id,user,week,day,city.id,user,week,city.id).run();if(!added.meta.changes)fail(409,'Hai già un contributo per quel giorno: massimo uno al giorno, sette a settimana.');return json({ok:true});
 }
 fail(404,'Funzione non disponibile.');
}
