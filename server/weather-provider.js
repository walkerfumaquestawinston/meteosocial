// Paid current conditions are separate from forecast models and radar.
// The key lives only in Sites runtime secrets, never in browser assets or logs.
async function weatherProviderCurrent(env,place){
 if(env.RAINBOW_API_KEY)return rainbowProviderCurrent(env,place);
 if(!env.WEATHERAPI_KEY)return {status:'not-configured'};
 try{
  const data=await globeSnapshot(env,'weatherapi-current-v2:'+place.key,async()=>{
   // Below Starter's 3M/month even in a 31-day month; shared across visitors.
   await weatherProviderBudget(env);
   let raw;try{raw=await atmoFetch('https://api.weatherapi.com/v1/current.json?'+new URLSearchParams({key:env.WEATHERAPI_KEY,q:place.key,aqi:'yes',lang:'it'}),100000)}catch{throw Error('Fonte meteo non disponibile')}
   const c=raw?.current,loc=raw?.location;
   if(!Number.isFinite(c?.last_updated_epoch)||!Number.isFinite(c?.temp_c)||!loc?.tz_id)throw Error('Risposta meteo incompleta');
   try{new Intl.DateTimeFormat('it-IT',{timeZone:loc.tz_id})}catch{throw Error('Fuso meteo non valido')}
   const number=n=>Number.isFinite(n)?n:null;
   return {source:'WeatherAPI',sourceURL:'https://www.weatherapi.com/',providerLocation:{name:String(loc.name||'').slice(0,100),region:String(loc.region||'').slice(0,100),country:String(loc.country||'').slice(0,100),latitude:number(loc.lat),longitude:number(loc.lon)},checkedAt:Date.now(),observedAt:c.last_updated_epoch*1000,timezone:loc.tz_id,
    mapCurrent:{...weatherApiValues(c,true),time:new Date(c.last_updated_epoch*1000).toISOString(),source:'WeatherAPI'},condition:String(c.condition?.text||'Condizione non disponibile').slice(0,100),temperature:number(c.temp_c),feelsLike:number(c.feelslike_c),wind:number(c.wind_kph),gust:number(c.gust_kph),humidity:number(c.humidity),pressure:number(c.pressure_mb),visibility:number(c.vis_km),uv:number(c.uv),pm25:number(c.air_quality?.pm2_5),aqi:number(c.air_quality?.['us-epa-index'])};
  },300000);
  const age=Date.now()-data.observedAt;
  return {...data,status:data.stale||age>1800000||age< -300000?'stale':'available'};
 }catch{return {status:'unavailable',source:'WeatherAPI'}}
}
