// Public, finite city batch. Shared edge caching avoids a request per marker/visitor.
async function atlasApi(req,env,url){
 if(url.pathname==='/api/atlas/field-reports'&&req.method==='GET')return fieldReports(req,env,url);
 if(url.pathname==='/api/atlas/world'&&req.method==='GET')return worldWeather(env);
 if(url.pathname==='/api/atlas/events'&&req.method==='GET')return globeEvents(url,env);
 if(url.pathname==='/api/atlas/hail-map'&&req.method==='GET'){
  const now=Date.now(),user=await identity(req),args=[now-7200000,now,now];
  let clause="p.deleted=0 AND p.kind='Grandine' AND p.created>? AND p.created<=? AND (p.expires IS NULL OR p.expires>?)";
  if(user){clause+=" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')";args.push(user)}
  const fields=hailFields(user);clause+=' AND COALESCE(h.observed,p.created)>'+String(now-7200000)+' AND COALESCE(h.observed,p.created)<='+String(now);const rows=(await q(env,'SELECT '+fields.sql+' FROM posts p LEFT JOIN hail_details h ON h.post=p.id WHERE '+clause+' ORDER BY COALESCE(h.observed,p.created) DESC,p.id DESC LIMIT 501',...fields.args,...args).all()).results;
  return json({posts:rows.slice(0,500),truncated:rows.length>500,updated:now,windowMinutes:120});
 }
 if(url.pathname==='/api/atlas/hail'&&req.method==='GET'){
  const city=clean(url.searchParams.get('city'),80);if(!city)fail(400,'Scegli una città.');
  const now=Date.now(),user=await identity(req),args=[city,now-7200000,now,now];
  let clause="p.deleted=0 AND p.city=? COLLATE NOCASE AND p.kind='Grandine' AND p.created>? AND p.created<=? AND (p.expires IS NULL OR p.expires>?)";
  if(user){clause+=" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')";args.push(user)}
  clause+=' AND COALESCE(h.observed,p.created)>'+String(now-7200000)+' AND COALESCE(h.observed,p.created)<='+String(now);const join=' FROM posts p LEFT JOIN hail_details h ON h.post=p.id WHERE ';
  const counts=await q(env,'SELECT COUNT(*) AS reports,COUNT(DISTINCT p.author) AS contributors'+join+clause,...args).first();
  const fields=hailFields(user);const posts=(await q(env,'SELECT '+fields.sql.replace('substr(p.text,1,300) AS text','p.text')+',p.kind'+join+clause+' ORDER BY COALESCE(h.observed,p.created) DESC,p.id DESC LIMIT 12',...fields.args,...args).all()).results;
  return json({city,posts,reports:counts.reports,contributors:counts.contributors,windowHours:2,truncated:counts.reports>posts.length,updated:now});
 }
 if(url.pathname==='/api/atlas/reports'&&req.method==='GET'){
 const now=Date.now(),user=await identity(req),args=[now-86400000,now+60000,now];let clause='p.deleted=0 AND p.created>? AND p.created<=? AND (p.expires IS NULL OR p.expires>?)';
 if(user){clause+=" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')";args.push(user)}
 const rows=(await q(env,'SELECT p.city,p.kind,p.created,p.expires FROM posts p WHERE '+clause+' ORDER BY p.created DESC LIMIT 201',...args).all()).results;
 return json({posts:rows.slice(0,200),truncated:rows.length>200,updated:now});
 }
 if(url.pathname!=='/api/atlas/cities'||req.method!=='GET')fail(404,'Funzione non disponibile.');
 return atlasCities(url);
}
// Bounded community observations, separated from model values and radar pixels.
async function fieldReports(req,env,url){
 const latText=url.searchParams.get('lat'),lonText=url.searchParams.get('lon'),lat=Number(latText),lon=Number(lonText),radius=Number(url.searchParams.get('radius')||150),layer=url.searchParams.get('layer');
 const kinds={temperature:'Temperatura',pioggia:'Pioggia',neve:'Neve',grandine:'Grandine',vento:'Vento',fulmini:'Fulmini'};
 if(!latText?.trim()||!lonText?.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180||![25,50,100,150].includes(radius)||!Object.hasOwn(kinds,layer))fail(400,'Scegli un livello, una zona valida e un raggio fino a 150 km.');
 const user=await identity(req),now=Date.now(),center={lat:Math.round(lat*100)/100,lon:Math.round(lon*100)/100},span=(radius+2)/110.574,lonSpan=Math.min(180,(radius+2)/(111.32*Math.max(.01,Math.cos((Math.abs(center.lat)+span)*Math.PI/180))));
 const args=[kinds[layer],now-7200000,now,now,(center.lat-span)*100,(center.lat+span)*100,center.lon*100,lonSpan*100,center.lon*100,(360-lonSpan)*100];
 let where='p.kind=? AND p.deleted=0 AND p.created>? AND p.created<=? AND (p.expires IS NULL OR p.expires>?) AND p.map_lat BETWEEN ? AND ? AND (ABS(p.map_lon-?)<=? OR ABS(p.map_lon-?)>=?)';
 if(user){where+=" AND NOT EXISTS(SELECT 1 FROM links b WHERE b.user=? AND b.target=p.author AND b.kind='block')";args.push(user)}
 const rows=(await q(env,'SELECT p.id,p.city,substr(p.text,1,500) text,p.created,p.expires,p.map_lat,p.map_lon,COALESCE(h.observed,p.created) observed,h.ended FROM posts p LEFT JOIN hail_details h ON h.post=p.id WHERE '+where+' ORDER BY p.created DESC,p.id DESC LIMIT 501',...args).all()).results;
 const posts=rows.slice(0,500).filter(p=>p.observed>now-7200000&&p.observed<=now&&pulseDistance(center,{lat:p.map_lat/100,lon:p.map_lon/100})<=radius+1).map(({map_lat,map_lon,...p})=>({...p,latitude:map_lat/100,longitude:map_lon/100}));
 return json({posts,truncated:rows.length>500,updated:now,radiusKm:radius,windowMinutes:120,precision:'rounded_0.01_degrees'});
}
let atlasCitiesFlight=null,atlasCitiesRetryAt=0;
async function atlasCities(url){
 if(Date.now()<atlasCitiesRetryAt)return new Response(JSON.stringify({error:'La fonte meteo ha raggiunto il limite di richieste. Riprova più tardi.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':String(Math.ceil((atlasCitiesRetryAt-Date.now())/1000))}});
 if(atlasCitiesFlight)return (await atlasCitiesFlight).clone();
 atlasCitiesFlight=loadAtlasCities(url);
 try{return (await atlasCitiesFlight).clone()}finally{atlasCitiesFlight=null}
}
async function loadAtlasCities(url){
 const cache=optionalPublicCache(),key=new Request(url.origin+'/api/atlas/cities?schema=climate-3');const hit=await cache?.match(key);if(hit)return hit;
 const params=new URLSearchParams({latitude:ATLAS_CITIES.map(c=>c.latitude).join(','),longitude:ATLAS_CITIES.map(c=>c.longitude).join(','),current:'temperature_2m,weather_code,is_day,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,relative_humidity_2m,surface_pressure',timezone:'GMT',forecast_days:'1'});
 let r;try{r=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:AbortSignal.timeout(15000)})}catch{fail(503,'Il meteo delle città non è raggiungibile. Riprova tra poco.')}if(!r.ok){if(r.status===429){const retry=r.headers.get('Retry-After'),seconds=retry&&/^\d+$/.test(retry)?Number(retry):Math.ceil((Date.parse(retry)-Date.now())/1000);atlasCitiesRetryAt=Date.now()+Math.max(60,Number.isFinite(seconds)?seconds:60)*1000}console.warn('weather_source_unavailable',JSON.stringify({source:'Open-Meteo',route:'atlas/cities',status:r.status}));if(r.status===429)return atlasCities(url);fail(503,r.status===429?'La fonte meteo ha raggiunto il limite di richieste. Riprova più tardi.':'Le condizioni delle città non sono disponibili. Riprova tra poco.');}let rows;try{rows=await r.json()}catch{fail(503,'Dati delle città non leggibili. Riprova tra poco.')}if(!Array.isArray(rows)||rows.length!==ATLAS_CITIES.length)fail(503,'Dati delle città incompleti.');
 const cities=ATLAS_CITIES.map((c,i)=>({...c,current:rows[i].current&&Number.isFinite(rows[i].current.temperature_2m)?rows[i].current:null}));const response=new Response(JSON.stringify({cities,source:'Open-Meteo',updated:Date.now(),timezone:'UTC'}),{headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=600','X-Content-Type-Options':'nosniff'}});if(cache)await cache.put(key,response.clone());return response;
}
