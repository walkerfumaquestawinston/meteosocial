// The sky is derived from the selected place's current model and local solar times.
export function skyTheme(weather){
 const c=weather?.current;if(!c||!Number.isFinite(c.weather_code)||!weather.timezone)return 'notte';
 let local;try{local=new Intl.DateTimeFormat('sv-SE',{timeZone:weather.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T')}catch{return 'notte'}
 const now=Date.parse(local+'Z'),day=weather.daily?.time?.indexOf(local.slice(0,10)),rise=Date.parse((weather.daily?.sunrise?.[day]||'')+'Z'),set=Date.parse((weather.daily?.sunset?.[day]||'')+'Z');
 if(Number.isFinite(set)&&Math.abs(now-set)<2700000||Number.isFinite(rise)&&Math.abs(now-rise)<1800000)return 'tramonto';
 if(Number.isFinite(rise)&&Number.isFinite(set)?now<rise||now>set:c.is_day===0)return 'notte';
 if(c.weather_code>=51||c.precipitation>0)return 'pioggia';return c.weather_code>=2?'giorno-nuvoloso':'giorno-sereno';
}
export const SKY_FEATURES={dynamicBackground:false};
export function applySkyTheme(weather){const sky=SKY_FEATURES.dynamicBackground?skyTheme(weather):'notte';document.documentElement.dataset.sky=sky;document.documentElement.classList.toggle('sky-light',['giorno-sereno','giorno-nuvoloso'].includes(sky));}
