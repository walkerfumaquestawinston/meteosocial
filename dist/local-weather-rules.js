// Concentration thresholds (not individual clinical risk): Provincia autonoma Bolzano.
// https://ambiente.provincia.bz.it/it/aria/intervalli-concentrazione
export const LOCAL_POLLEN=[['alder_pollen','Ontano',50],['birch_pollen','Betulla',50],['grass_pollen','Graminacee',30],['mugwort_pollen','Artemisia',25],['olive_pollen','Olivo',25],['ragweed_pollen','Ambrosia',25]];
export function localHour(data,now=Date.now()){const t=data?.hourly?.time;return Array.isArray(t)?t.findIndex(x=>Number.isFinite(x)&&x*1000<=now&&x*1000+3600000>now):-1}
export function highPollen(data,now=Date.now()){const i=localHour(data,now);return i<0?[]:LOCAL_POLLEN.filter(([key,,limit])=>Number.isFinite(data.hourly[key]?.[i])&&data.hourly[key][i]>limit).map(([key,name])=>({name,value:data.hourly[key][i],at:data.hourly.time[i]*1000}))}
export function localSnow(data,now=Date.now()){
 const month=Number(new Intl.DateTimeFormat('en',{timeZone:'Europe/Rome',month:'numeric'}).format(now));if(month>3&&month<11)return null;
 const h=data?.hourly;if(!Array.isArray(h?.time))return null;
 const i=h.time.findIndex((t,i)=>t*1000>=now-3600000&&t*1000<now+24*3600000&&Number.isFinite(h.snowfall_height?.[i])&&h.snowfall_height[i]>=0&&Number.isFinite(h.precipitation?.[i])&&h.precipitation[i]>0);
 return i<0?null:{height:Math.round(h.snowfall_height[i]/100)*100,at:h.time[i]*1000,elevation:Number.isFinite(data.elevation)?data.elevation:null};
}
export function localSea(data,now=Date.now()){
 const i=localHour(data,now),h=data?.hourly;if(i<0||!Number.isFinite(h.wave_height?.[i])||h.wave_height[i]<0)return null;
 const next=h.time.findIndex((t,j)=>t*1000>now&&t*1000<now+24*3600000&&Number.isFinite(h.wave_height[j])&&h.wave_height[j]>=2.5);
 return {height:h.wave_height[i],temperature:Number.isFinite(h.sea_surface_temperature?.[i])?h.sea_surface_temperature[i]:null,period:Number.isFinite(h.wave_period?.[i])?h.wave_period[i]:null,direction:Number.isFinite(h.wave_direction?.[i])?h.wave_direction[i]:null,at:h.time[i]*1000,rough:next<0?null:{at:h.time[next]*1000,height:h.wave_height[next]}};
}
