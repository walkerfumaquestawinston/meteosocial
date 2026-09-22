// Solar times are local to the selected place, never the viewer's timezone.
export function skyPhase(weather,at=Date.now()){
 let local;
 try{local=new Intl.DateTimeFormat('sv-SE',{timeZone:weather?.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at)).replace(' ','T')}catch{local=new Date(at).toISOString().slice(0,16)}
 const now=Date.parse(local+'Z'),day=weather?.daily?.time?.indexOf(local.slice(0,10));
 const rise=Date.parse((weather?.daily?.sunrise?.[day]||'')+'Z'),set=Date.parse((weather?.daily?.sunset?.[day]||'')+'Z');
 if(Number.isFinite(rise)&&Number.isFinite(set)&&rise<set){
  if(Math.abs(now-rise)<=30*60000)return 'alba';
  if(Math.abs(now-set)<=45*60000)return 'tramonto';
  return now>rise&&now<set?'giorno':'notte';
 }
 // Polar conditions use the provider flag only when it is still current.
 const observed=Date.parse((weather?.current?.time||'')+'Z');
 if(Number.isFinite(observed)&&Math.abs(now-observed)<90*60000&&[0,1].includes(weather?.current?.is_day))return weather.current.is_day?'giorno':'notte';
 const hour=Number(local.slice(11,13));return hour>=7&&hour<19?'giorno':'notte';
}
export function skyTheme(weather,at=Date.now()){
 const phase=skyPhase(weather,at);if(phase!=='giorno')return phase;
 const c=weather?.current||{};return c.weather_code>=51||c.precipitation>0?'pioggia':c.weather_code>=2?'giorno-nuvoloso':'giorno-sereno';
}
export const SKY_FEATURES={dynamicBackground:true};
export function applySkyTheme(weather,at=Date.now()){
 const root=document.documentElement,phase=skyPhase(weather,at),previous=root.dataset.phase;
 root.dataset.sky=skyTheme(weather,at);root.dataset.phase=phase;root.style.colorScheme=phase==='notte'?'dark':'light';
 root.classList.toggle('sky-light',phase!=='notte');
 if(previous!==phase)document.dispatchEvent(new Event('meteosocial:phase'));
}
