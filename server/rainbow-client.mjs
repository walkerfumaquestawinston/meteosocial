// Server-only Rainbow Weather client. Not activated until runtime credentials,
// local-time presentation and production integration have been verified.
const ORIGIN='https://api.rainbow.ai';
const finite=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const units={temperature:'celsius',feelsLikeTemperature:'celsius',humidity:'percent',windSpeed:'meter_per_second',windGust:'meter_per_second',windDirection:'degree',precipitationAmount:'millimeters',precipitationChance:'percent',pressure:'hectopascal',visibility:'meter',uvIndex:'index'};

export function normalizeRainbowWeather(raw,now=Date.now()){
 const generated=finite(raw?.generatedAtTimestamp);
 if(generated===null||generated<=0||generated*1000>now+300000)throw Error('Orario di emissione Rainbow non valido');
 if(!Array.isArray(raw?.timelines?.hourly)||!raw.timelines.hourly.length)throw Error('Previsioni orarie Rainbow mancanti');
 if(finite(raw?.location?.lat)===null||Math.abs(raw.location.lat)>90||finite(raw?.location?.lon)===null||Math.abs(raw.location.lon)>180)throw Error('Coordinate Rainbow non valide');
 // Reject changed/unspecified units rather than silently changing temperatures.
 for(const [name,unit] of Object.entries(units)){
  if(raw.timelines.hourly.some(h=>finite(h?.[name])!==null)&&raw.units?.[name]!==unit)throw Error('Unità Rainbow non supportate');
 }
 const timestamps=new Set();
 const hourly=raw.timelines.hourly.map(h=>{
  const at=finite(h?.startTimestamp);
  if(at===null||at<=0||timestamps.has(at))throw Error('Orario previsionale Rainbow non valido');
  timestamps.add(at);
  const speed=k=>finite(h[k])===null?null:h[k]*3.6;
  const percent=k=>finite(h[k])!==null&&h[k]>=0&&h[k]<=100?h[k]:null;
  return {validAt:at*1000,validUntil:(at+3600)*1000,kind:'forecast',temperature:finite(h.temperature),feelsLike:finite(h.feelsLikeTemperature),humidity:percent('humidity'),windKmh:speed('windSpeed'),gustKmh:speed('windGust'),windDirection:finite(h.windDirection),pressureHpa:finite(h.pressure),visibilityMeters:finite(h.visibility),precipitationMm:finite(h.precipitationAmount),precipitationProbability:percent('precipitationChance'),uv:finite(h.uvIndex),condition:typeof h.condition==='string'?h.condition.slice(0,80):null,precipitationType:typeof h.precipitationType==='string'?h.precipitationType.slice(0,30):null};
 }).sort((a,b)=>a.validAt-b.validAt);
 const forThisHour=hourly.find(h=>h.validAt<=now&&now<h.validUntil)||null;
 const days=(Array.isArray(raw.timelines.daily)?raw.timelines.daily:[]).filter(d=>finite(d.startTimestamp)!==null&&finite(d.endTimestamp)!==null&&d.endTimestamp>d.startTimestamp).map(d=>({validAt:d.startTimestamp*1000,validUntil:d.endTimestamp*1000,temperatureMin:finite(d.temperatureMin),temperatureMax:finite(d.temperatureMax),precipitationMm:finite(d.precipitationAmount),precipitationProbability:finite(d.precipitationChance),uv:finite(d.uvIndexMax),condition:typeof d.condition==='string'?d.condition.slice(0,80):null})).sort((a,b)=>a.validAt-b.validAt);
 return {source:'Rainbow Weather',sourceURL:'https://developer.rainbow.ai/',kind:'forecast',issuedAt:generated*1000,latitude:raw.location.lat,longitude:raw.location.lon,stale:now-generated*1000>7200000,forThisHour,hourly,days};
}

export async function fetchRainbowWeather({key,latitude,longitude,beforeRequest,fetcher=fetch,now=Date.now()}){
 if(typeof key!=='string'||!key.trim())throw Error('Rainbow non configurato');
 if(finite(latitude)===null||Math.abs(latitude)>90||finite(longitude)===null||Math.abs(longitude)>180)throw Error('Coordinate richieste non valide');
 // Caller must reserve quota before a billable request; no unbounded default.
 if(typeof beforeRequest!=='function')throw Error('Protezione consumi Rainbow non configurata');
 await beforeRequest();
 let response,raw,providerDetail=null;
 try{
  response=await fetcher(`${ORIGIN}/weather/v1/forecast/${longitude}/${latitude}?forecast_hours=24&forecast_days=7&day_start_hour=0`,{headers:{'Ocp-Apim-Subscription-Key':key.trim()},signal:AbortSignal.timeout(12000),redirect:'manual'});
  if(!response.ok){
   if([400,422].includes(response.status))providerDetail=(await response.text()).replaceAll(key.trim(),'[segreto omesso]').replace(/[A-Za-z0-9_+-]{24,}/g,'[identificativo omesso]').slice(0,400);
   throw Error('Provider unavailable');
  }
  const body=await response.text();
  if(body.length>1500000)throw Error('Response too large');
  raw=JSON.parse(body);
 }catch{
  // Never expose upstream bodies, URLs with credentials, or request headers.
  const error=Error('Rainbow Weather temporaneamente non disponibile');
  error.providerStatus=response?.status||null;error.providerDetail=providerDetail;throw error;
 }
 const data=normalizeRainbowWeather(raw,now);
 if(Math.abs(data.latitude-latitude)>.1||Math.abs(data.longitude-longitude)>.1)throw Error('Località Rainbow non corrispondente');
 return data;
}
