// Public forecast copies: source data are fetched here, never accepted from clients.
const FORECAST_INTERVAL=900000;
const forecastPending=new Map();
let forecastRetryAt=0;
function forecastLocation(url){
 const lat=url.searchParams.get('lat'),lon=url.searchParams.get('lon');
 if(lat===null||lon===null||!lat.trim()||!lon.trim()||!Number.isFinite(+lat)||!Number.isFinite(+lon)||Math.abs(+lat)>85||Math.abs(+lon)>180)fail(400,'Scegli una località valida.');
 const latitude=Math.round(+lat*100)/100,longitude=Math.round(+lon*100)/100;
 return {latitude,longitude,key:latitude.toFixed(2)+','+longitude.toFixed(2)};
}
function forecastLocalTime(at,zone){try{return new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at)).replace(' ','T')}catch{return null}}
function forecastChanges(before,after,at){
 const a=before?.hourly,b=after?.hourly,cut=forecastLocalTime(at,after.timezone);if(!cut||!a?.time||!b?.time||before.timezone!==after.timezone)return [];
 const unique=times=>{const counts=new Map();times.forEach(t=>counts.set(t,(counts.get(t)||0)+1));return counts};
 const ca=unique(a.time),cb=unique(b.time),indices=new Map(a.time.map((t,i)=>[t,i])),fields=['temperature_2m','precipitation_probability','precipitation','weather_code'],changes=[];
 b.time.forEach((time,i)=>{const j=indices.get(time);if(time<cut||j===undefined||ca.get(time)!==1||cb.get(time)!==1)return;
 const previous=Object.fromEntries(fields.map(k=>[k,a[k]?.[j]??null])),current=Object.fromEntries(fields.map(k=>[k,b[k]?.[i]??null]));
 const changed=fields.filter(k=>Number.isFinite(previous[k])&&Number.isFinite(current[k])&&previous[k]!==current[k]);if(changed.length)changes.push({time,before:previous,after:current,fields:changed});
 });return changes;
}
function forecastSummary(row){return {id:row.id,capturedAt:row.captured,timezone:row.timezone,previousId:row.previous_id||null,changes:JSON.parse(row.changes),hash:row.hash}}
async function forecastResponse(env,row,stale=false){
 const last=await q(env,'SELECT * FROM forecast_copies WHERE location=? AND changed=1 AND captured<=? AND captured>=? ORDER BY captured DESC LIMIT 1',row.location,row.captured,row.captured-86400000).first();
 const lastChange=last?forecastSummary(last):null;if(lastChange?.previousId){const before=await q(env,'SELECT captured FROM forecast_copies WHERE id=?',lastChange.previousId).first();lastChange.previousCapturedAt=before?.captured||null;}
 return {...JSON.parse(row.payload),_loadedAt:row.captured,_offline:stale,_provenance:{...forecastSummary(row),status:'saved',stale,lastChange,modelIssuedAt:null}};
}
function forecastSourceURL(place){return 'https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,rain,showers,snowfall,surface_pressure,cloud_cover,is_day',hourly:'temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,freezing_level_height,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,relative_humidity_2m,surface_pressure,weather_code,is_day',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,uv_index_max,sunrise,sunset,precipitation_sum',forecast_days:'7',timezone:'auto'})}
async function acquireForecast(env,place){
 let previous=null,storage=true;try{previous=await q(env,'SELECT * FROM forecast_copies WHERE location=? ORDER BY captured DESC LIMIT 1',place.key).first();if(previous&&Date.now()>=previous.captured&&Date.now()-previous.captured<FORECAST_INTERVAL)return await forecastResponse(env,previous)}catch{storage=false}
 let data;try{
  if(Date.now()<forecastRetryAt)throw Error('rate-limit');
  const response=await fetch(forecastSourceURL(place),{signal:AbortSignal.timeout(12000)});
  if(response.status===429){
   const retry=response.headers.get('Retry-After');
   const delay=retry&&/^\d+$/.test(retry)?Number(retry)*1000:Date.parse(retry)-Date.now();
   forecastRetryAt=Date.now()+Math.max(900000,Math.min(86400000,Number.isFinite(delay)?delay:900000));
   throw Error('rate-limit');
  }
  if(!response.ok)throw Error();data=await response.json();if(!Number.isFinite(data.current?.temperature_2m)||!Number.isFinite(data.current?.weather_code)||!Array.isArray(data.hourly?.time)||!data.timezone)throw Error();
 }catch{if(previous)return forecastResponse(env,previous,true);fail(503,Date.now()<forecastRetryAt?'Open-Meteo ha raggiunto il limite di richieste. Le previsioni sono temporaneamente indisponibili.':'La fonte meteo non risponde. Riprova tra poco.')}
 const at=Date.now(),unrecorded=()=>({...data,_loadedAt:at,_provenance:{status:'unavailable',capturedAt:at,timezone:data.timezone,modelIssuedAt:null}});
 if(!storage)return unrecorded();
 try{
 const payload=JSON.stringify(data),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload))),b=>b.toString(16).padStart(2,'0')).join(''),changes=forecastChanges(previous?JSON.parse(previous.payload):null,data,at),slot=Math.floor(at/FORECAST_INTERVAL);
 await q(env,'INSERT OR IGNORE INTO forecast_copies(id,location,slot,captured,timezone,previous_id,changed,changes,payload,hash) VALUES(?,?,?,?,?,?,?,?,?,?)',crypto.randomUUID(),place.key,slot,at,data.timezone,previous?.id||null,Number(changes.length>0),JSON.stringify(changes),payload,hash).run();
 const saved=await q(env,'SELECT * FROM forecast_copies WHERE location=? AND slot=?',place.key,slot).first();return await forecastResponse(env,saved);
 }catch{return unrecorded()}
}
async function forecastApi(req,env,url){
 if(req.method!=='GET')fail(405,'Le copie meteo sono di sola lettura.');
 if(url.pathname==='/api/forecast/snapshot'){
 const id=url.searchParams.get('id');if(!/^[a-f0-9-]{36}$/.test(id||''))fail(400,'Copia non valida.');const row=await q(env,'SELECT * FROM forecast_copies WHERE id=?',id).first();if(!row)fail(404,'Copia non trovata.');return json({...forecastSummary(row),location:row.location,source:'Open-Meteo',modelIssuedAt:null,data:JSON.parse(row.payload)});
 }
 const place=forecastLocation(url);
 if(url.pathname==='/api/forecast/current')return json(await weatherProviderCurrent(env,place));
 if(url.pathname==='/api/forecast/history'){
 const before=url.searchParams.has('before')?Number(url.searchParams.get('before')):Date.now()+1;if(!Number.isFinite(before)||before<0)fail(400,'Data non valida.');
 const rows=(await q(env,'SELECT id,captured,timezone,previous_id,changes,hash FROM forecast_copies WHERE location=? AND captured<? ORDER BY captured DESC LIMIT 21',place.key,before).all()).results;
 return json({copies:rows.slice(0,20).map(forecastSummary),next:rows.length>20?rows[19].captured:null,source:'Open-Meteo',modelIssuedAt:null});
 }
 if(url.pathname!=='/api/forecast')fail(404,'Pagina non trovata.');
 let pending=forecastPending.get(place.key);if(!pending){pending=acquireForecast(env,place).finally(()=>forecastPending.delete(place.key));forecastPending.set(place.key,pending)}return json(await pending);
}
