// Rainbow values are forecasts, including the estimate for the current hour.
function rainbowCondition(condition){
 const pairs={Clear:[0,'Sereno'],MostlyClear:[1,'Prevalentemente sereno'],PartlyCloudy:[2,'Parzialmente nuvoloso'],MostlyCloudy:[3,'Molto nuvoloso'],Cloudy:[3,'Nuvoloso'],Foggy:[45,'Nebbia'],Haze:[45,'Foschia'],Drizzle:[51,'Pioviggine'],Rain:[63,'Pioggia'],HeavyRain:[65,'Pioggia intensa'],SunShowers:[80,'Rovesci e schiarite'],IsolatedThunderstorms:[95,'Temporali isolati'],ScatteredThunderstorms:[95,'Temporali sparsi'],Thunderstorms:[95,'Temporali'],StrongStorms:[95,'Temporali forti'],Flurries:[71,'Neve debole'],Snow:[73,'Neve'],HeavySnow:[75,'Neve intensa'],SunFlurries:[85,'Rovesci di neve'],Blizzard:[75,'Bufera di neve'],BlowingSnow:[71,'Neve sollevata dal vento'],FreezingDrizzle:[56,'Pioviggine gelata'],FreezingRain:[66,'Pioggia gelata'],Sleet:[null,'Nevischio'],WintryMix:[null,'Precipitazioni miste'],Hail:[null,'Grandine prevista'],Breezy:[null,'Ventilato'],Windy:[null,'Ventoso'],Hot:[null,'Caldo'],Frigid:[null,'Freddo intenso'],Hurricane:[null,'Uragano'],TropicalStorm:[null,'Tempesta tropicale'],Smoky:[null,'Fumo'],BlowingDust:[null,'Polvere sollevata dal vento']};
 return pairs[condition]||[null,'Condizioni non disponibili'];
}
function rainbowForecast(data,place){
 const zone=rainbowTimezone(place.latitude,place.longitude),local=t=>forecastLocalTime(t,zone);
 const values=h=>({temperature_2m:h.temperature,apparent_temperature:h.feelsLike,relative_humidity_2m:h.humidity,wind_speed_10m:h.windKmh,wind_direction_10m:h.windDirection,wind_gusts_10m:h.gustKmh,weather_code:rainbowCondition(h.condition)[0],condition_text:rainbowCondition(h.condition)[1],precipitation:h.precipitationMm,precipitation_probability:h.precipitationProbability,visibility:h.visibilityMeters,pressure_msl:h.pressureHpa,uv_index:h.uv,cloud_cover:null,surface_pressure:null,snowfall:null,snow_depth:null,freezing_level_height:null,rain:null,showers:null,is_day:null});
 const rows=data.hourly.map(values),hourly={time:data.hourly.map(h=>local(h.validAt)),time_epoch:data.hourly.map(h=>h.validAt/1000)};
 for(const key of Object.keys(rows[0]))hourly[key]=rows.map(h=>h[key]);
 const groups=new Map();data.hourly.forEach((h,i)=>{const day=hourly.time[i].slice(0,10);if(!groups.has(day))groups.set(day,[]);groups.get(day).push(h)});
 const days=[...groups].slice(0,7),aggregate=(hs,key,fn)=>{const nums=hs.map(h=>h[key]);return nums.every(Number.isFinite)&&nums.length?fn(nums):null};
 const daily={time:days.map(([d])=>d),temperature_2m_max:days.map(([,h])=>aggregate(h,'temperature',a=>Math.max(...a))),temperature_2m_min:days.map(([,h])=>aggregate(h,'temperature',a=>Math.min(...a))),precipitation_sum:days.map(([,h])=>aggregate(h,'precipitationMm',a=>a.reduce((x,y)=>x+y,0))),precipitation_probability_max:days.map(([,h])=>aggregate(h,'precipitationProbability',a=>Math.max(...a))),uv_index_max:days.map(([,h])=>aggregate(h,'uv',a=>Math.max(...a))),weather_code:days.map(([,hs])=>rainbowCondition([...hs].sort((a,b)=>(b.precipitationMm??0)-(a.precipitationMm??0))[0].condition)[0]),sunrise:days.map(()=>null),sunset:days.map(()=>null),available_hours:days.map(([,hs])=>hs.length)};
 const h=data.forThisHour;if(!h||!Number.isFinite(h.temperature)||data.stale)throw Error('Previsione Rainbow per questa ora non disponibile');
 return {latitude:place.latitude,longitude:place.longitude,timezone:zone,source:'Rainbow Weather',sourceURL:data.sourceURL,kind:'forecast',issuedAt:data.issuedAt,current:{...values(h),time:local(h.validAt),time_epoch:h.validAt/1000,interval:3600,kind:'forecast',issuedAt:data.issuedAt,validUntil:h.validUntil},hourly,daily,_limitations:['La temperatura per questa ora è una previsione, non una misura osservata.','Estremi e totali giornalieri calcolati sulle ore disponibili: oggi e l’ultimo giorno possono essere parziali.','Nubi, alba/tramonto, neve in cm, neve al suolo e zero termico non disponibili da questa fonte.']};
}
async function rainbowBudget(env){
 await quota(env,'rainbow','weather-calls',100);
 const key='rainbow-weather-month:'+new Date().toISOString().slice(0,7);
 const row=await q(env,'INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',key).first();
 // Conservative initial ceiling: stay within the advertised free Weather quota.
 // Counts this application only, not calls from other clients of the account.
 if(row.count>5000)fail(429,'Quota Rainbow di protezione raggiunta.');
}
async function rainbowProviderForecast(env,place){
 const data=await globeSnapshot(env,'rainbow-weather-v1:'+place.key,()=>fetchRainbowWeather({key:env.RAINBOW_API_KEY,latitude:place.latitude,longitude:place.longitude,beforeRequest:()=>rainbowBudget(env)}),900000);
 if(data.stale)throw Error('Previsione Rainbow precedente');
 // Re-select the current interval even when the source response comes from cache.
 data.forThisHour=data.hourly.find(h=>h.validAt<=Date.now()&&Date.now()<h.validUntil)||null;
 if(Date.now()-data.issuedAt>7200000)throw Error('Emissione Rainbow precedente');
 return rainbowForecast(data,place);
}
async function rainbowProviderCurrent(env,place){
 try{const d=await rainbowProviderForecast(env,place),c=d.current;
 return {status:'available',source:d.source,sourceURL:d.sourceURL,kind:'forecast',issuedAt:d.issuedAt,checkedAt:Date.now(),observedAt:null,validAt:c.time_epoch*1000,validUntil:c.validUntil,timezone:d.timezone,temperature:c.temperature_2m,feelsLike:c.apparent_temperature,wind:c.wind_speed_10m,gust:c.wind_gusts_10m,humidity:c.relative_humidity_2m,pressure:c.pressure_msl,visibility:c.visibility===null?null:c.visibility/1000,uv:c.uv_index,pm25:null,aqi:null,condition:c.condition_text,mapCurrent:{...c,time:new Date(c.time_epoch*1000).toISOString(),source:d.source}};
 }catch{return {status:'unavailable',source:'Rainbow Weather',kind:'forecast'}}
}
