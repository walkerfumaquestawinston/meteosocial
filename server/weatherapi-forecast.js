// WeatherAPI adapter. Null means unavailable, never an invented zero.
function weatherApiCode(code){
 const groups={0:[1000],2:[1003],3:[1006,1009],45:[1030,1135],48:[1147],51:[1150,1153],56:[1072,1168],57:[1171],61:[1063,1180,1183],63:[1186,1189],65:[1192,1195],66:[1198],67:[1201],71:[1066,1210,1213],73:[1216,1219],75:[1114,1117,1222,1225],77:[1069,1204,1207,1237,1261,1264],80:[1240],81:[1243],82:[1246],85:[1249,1255],86:[1252,1258],95:[1087,1273,1276,1279,1282]};
 for(const [wmo,values] of Object.entries(groups))if(values.includes(code))return +wmo;
 return null;
}
function weatherApiValues(v,current=false){
 const num=k=>Number.isFinite(v?.[k])?v[k]:null;
 return {condition_text:typeof v?.condition?.text==='string'?v.condition.text.slice(0,100):null,condition_nearby:[1063,1066,1069,1072,1087].includes(v?.condition?.code),temperature_2m:num('temp_c'),apparent_temperature:num('feelslike_c'),relative_humidity_2m:num('humidity'),wind_speed_10m:num('wind_kph'),wind_direction_10m:num('wind_degree'),wind_gusts_10m:num('gust_kph'),cloud_cover:num('cloud'),weather_code:weatherApiCode(v?.condition?.code),is_day:num('is_day'),visibility:num('vis_km')===null?null:num('vis_km')*1000,precipitation:current?null:num('precip_mm'),precipitation_probability:current?null:num('chance_of_rain'),snowfall:current?null:num('snow_cm'),rain:null,showers:null,snow_depth:null,freezing_level_height:null,surface_pressure:null};
}
function weatherApiForecast(raw,place){
 const days=raw?.forecast?.forecastday,zone=raw?.location?.tz_id,c=raw?.current;
 if(!zone||!Array.isArray(days)||!days.length||!Number.isFinite(c?.last_updated_epoch)||!Number.isFinite(c?.temp_c))throw Error('Previsione incompleta');
 new Intl.DateTimeFormat('it-IT',{timeZone:zone});
 const local=t=>forecastLocalTime(t,zone),hours=days.flatMap(d=>d.hour||[]).filter(h=>Number.isFinite(h.time_epoch)).sort((a,b)=>a.time_epoch-b.time_epoch);
 if(!hours.length)throw Error('Ore non disponibili');
 const hourly={time:hours.map(h=>local(h.time_epoch*1000)),time_epoch:hours.map(h=>h.time_epoch)};
 const values=hours.map(h=>weatherApiValues(h));for(const key of Object.keys(values[0]))hourly[key]=values.map(v=>v[key]);
 const solar=(d,k)=>{const t=d.astro?.[k],m=typeof t==='string'&&t.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);if(!m||+m[1]<1||+m[1]>12||+m[2]>59)return null;return d.date+'T'+String(+m[1]%12+(m[3]==='PM'?12:0)).padStart(2,'0')+':'+m[2];};
 const max=(d,k)=>{const n=(d.hour||[]).map(h=>h[k]).filter(Number.isFinite);return n.length?Math.max(...n):null;};
 const daily={time:days.map(d=>d.date),temperature_2m_max:days.map(d=>d.day?.maxtemp_c??null),temperature_2m_min:days.map(d=>d.day?.mintemp_c??null),weather_code:days.map(d=>weatherApiCode(d.day?.condition?.code)),precipitation_probability_max:days.map(d=>max(d,'chance_of_rain')),uv_index_max:days.map(d=>max(d,'uv')),precipitation_sum:days.map(d=>d.day?.totalprecip_mm??null),sunrise:days.map(d=>solar(d,'sunrise')),sunset:days.map(d=>solar(d,'sunset'))};
 return {latitude:place.latitude,longitude:place.longitude,timezone:zone,source:'WeatherAPI',sourceURL:'https://www.weatherapi.com/',providerLocation:{name:String(raw.location.name||'').slice(0,100),region:String(raw.location.region||'').slice(0,100),country:String(raw.location.country||'').slice(0,100),latitude:raw.location.lat??null,longitude:raw.location.lon??null},current:{...weatherApiValues(c,true),time:local(c.last_updated_epoch*1000),time_epoch:c.last_updated_epoch,interval:null},hourly,daily,_limitations:['Neve al suolo, zero termico e pressione al suolo non disponibili.','Le quantità orarie seguono le fasce WeatherAPI; non sono misure radar.']};
}
async function weatherProviderBudget(env){
 // One budget for current conditions, forecasts and map points. These count
 // requests made by this app, not other consumers of the same account key.
 await quota(env,'weatherapi','provider-calls',3000);
 const month=new Date().toISOString().slice(0,7),key='weatherapi-month:'+month;
 const row=await q(env,'INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',key).first();
 if(row.count>2400000)fail(429,'Quota meteo di protezione raggiunta. Conserviamo gli ultimi dati disponibili.');
}
async function weatherProviderForecast(env,place){
 try{
  const value=await globeSnapshot(env,'weatherapi-forecast-v2:'+place.key,async()=>{
   await weatherProviderBudget(env);
   const raw=await atmoFetch('https://api.weatherapi.com/v1/forecast.json?'+new URLSearchParams({key:env.WEATHERAPI_KEY,q:place.key,days:'7',aqi:'no',alerts:'no',lang:'it'}),1000000);
   return weatherApiForecast(raw,place);
  },900000);
  if(value.stale)throw Error('Copia precedente');
  return value;
 }catch{throw Error('Previsioni WeatherAPI temporaneamente non disponibili');}
}
