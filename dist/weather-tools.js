export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function weatherKind(code,isDay=true){if(!Number.isFinite(code))return 'unknown';if(code===0||code===1)return isDay?'sun':'moon';if(code===2)return 'partly';if(code===3||code===45||code===48)return 'cloud';if([71,73,75,77,85,86].includes(code))return 'snow';if(code>=95)return 'storm';return 'rain'}
export function weatherName(code){const k=weatherKind(code);return {sun:'Sereno',moon:'Sereno',partly:'Poco nuvoloso',cloud:code===45||code===48?'Nebbia':'Nuvoloso',snow:'Neve',storm:'Temporali',rain:'Pioggia',unknown:'Dato non disponibile'}[k]}
export function miniWeather(code,isDay=true){const k=weatherKind(code,isDay);return `<span class="weather-mini ${k}${isDay?'':' night'}" role="img" aria-label="${weatherName(code)}"><i class="mini-sun"></i><i class="mini-cloud"></i><i class="mini-drops">${k==='snow'?'✦ ✦':k==='storm'?'ϟ':'╱ ╱'}</i></span>`}
export const numeric=value=>typeof value==='number'&&Number.isFinite(value);
export const valueText=(v,suffix='',decimals=0)=>numeric(v)?Number(v.toFixed(decimals)).toFixed(decimals)+suffix:'—';
export function currentHour(weather){const times=weather?.hourly?.time;if(!times?.length||!weather?.current?.time)return -1;const idx=times.findIndex(t=>t>=weather.current.time.slice(0,13)+':00');return idx}
export function bestWindow(weather,activity='walk'){
 const h=weather?.hourly,start=h?.time?.findIndex(t=>t>=weather.current?.time)??-1;if(start<0)return null;
 const limits=activity==='cycle'?{wind:20,rain:25,min:8,max:29}:activity==='outside'?{wind:25,rain:30,min:12,max:30}:{wind:25,rain:30,min:5,max:32};
 const options=[];for(let i=start;i<Math.min(start+24,h.time.length-1);i++){const j=i+1;const values=[h.temperature_2m?.[i],h.temperature_2m?.[j],h.precipitation_probability?.[i],h.precipitation_probability?.[j],h.wind_speed_10m?.[i],h.wind_speed_10m?.[j],h.weather_code?.[i],h.weather_code?.[j],h.is_day?.[i],h.is_day?.[j]];if(!values.every(numeric)||!values[8]||!values[9]||values[6]>=95||values[7]>=95)continue;const rain=Math.max(values[2],values[3]),wind=Math.max(values[4],values[5]),temp=(values[0]+values[1])/2;if(rain>limits.rain||wind>limits.wind||Math.min(values[0],values[1])<limits.min||Math.max(values[0],values[1])>limits.max)continue;options.push({index:i,start:h.time[i],end:h.time[j],rain,wind,temp,score:rain*2+wind+Math.abs(temp-21)*2})}
 options.sort((a,b)=>a.score-b.score||a.index-b.index);return options[0]||null;
}
export function trendSummary(weather){const d=weather?.daily;if(!d?.time?.length)return null;const today=d.temperature_2m_max?.[0],tomorrow=d.temperature_2m_max?.[1];const valid=d.precipitation_probability_max?.map((v,i)=>({v,i})).filter(p=>numeric(p.v))||[];valid.sort((a,b)=>a.v-b.v||a.i-b.i);return {delta:numeric(today)&&numeric(tomorrow)?tomorrow-today:null,driest:valid[0]||null}}
export function parseRadar(data,now=Date.now()){
 if(data?.host!=='https://tilecache.rainviewer.com')throw Error('Fonte radar non riconosciuta.');
 const frames=(data.radar?.past||[]).filter(f=>Number.isInteger(f.time)&&f.time*1000<=now+600000&&typeof f.path==='string'&&/^\/v2\/radar\/[a-zA-Z0-9_-]+$/.test(f.path)).sort((a,b)=>a.time-b.time).slice(-13);
 if(!frames.length||now-frames.at(-1).time*1000>3600000)throw Error('Il radar non ha immagini abbastanza recenti.');return {host:data.host,frames,generated:data.generated};
}
export function mercatorV(latitude){const lat=Math.max(-85.05112878,Math.min(85.05112878,latitude))*Math.PI/180;return .5-Math.log(Math.tan(Math.PI/4+lat/2))/(2*Math.PI)}
export function cityReports(posts,city,kind,now=Date.now()){const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();return posts.filter(p=>normalize(p.city)===normalize(city)&&(!p.expires||p.expires>now)&&p.created<=now+60000&&p.created>now-(kind==='grandine'?7200000:86400000)&&(kind!=='grandine'||p.kind==='Grandine'))}

export const forecastSource=w=>w?.source==='WeatherAPI'?'WeatherAPI':'Open-Meteo';
export const forecastSourceURL=w=>w?.source==='WeatherAPI'?'https://www.weatherapi.com/':'https://open-meteo.com/';

export const weatherDescription=c=>typeof c?.condition_text==='string'&&c.condition_text.trim()?c.condition_text.slice(0,100):weatherName(c?.weather_code);
