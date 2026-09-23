import {forecastSource,forecastSourceURL} from './weather-tools.js';
import {esc,numeric,weatherName} from './weather-tools.js';
import {localNow} from './day-plan.js';
import {forecastStamp} from './forecast-receipt.js';

const codes=new Set([0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);
const wet=code=>codes.has(code)&&code>=51;
const group=code=>code>=95?'storm':[71,73,75,77,85,86].includes(code)?'snow':wet(code)?'rain':[45,48].includes(code)?'fog':code===3?'cloud':'clear';
const civil=t=>Date.parse(t+'Z');
// Local civil labels match the provider's hourly axis, not the device timezone.
export function nextChange(w,now=new Date()){
 const local=w?.timezone&&localNow(w.timezone,now),current=w?.current;
 if(!local||!current||!w?.hourly?.time?.length)return {status:'missing',rows:[],title:'Aspettiamo le prossime ore',detail:'Il riepilogo comparirà quando saranno disponibili le previsioni.'};
 const age=(civil(local)-civil(current.time))/60000;
 const acquired=w._provenance?.capturedAt??w._loadedAt;
 if(w._offline||!Number.isFinite(age)||age>180||age < -60||(numeric(acquired)&&now.getTime()-acquired>90*60000))return {status:'stale',rows:[],title:'Serve un meteo aggiornato',detail:'La copia salvata resta consultabile, ma non la usiamo per descrivere cosa sta arrivando.'};
 const h=w.hourly,limit=civil(local)+6*3600000;
 const rows=h.time.map((time,i)=>({time,temp:h.temperature_2m?.[i],rain:h.precipitation_probability?.[i],wind:h.wind_speed_10m?.[i],code:h.weather_code?.[i]})).filter(r=>civil(r.time)>=civil(local)&&civil(r.time)<=limit).slice(0,6);
 const complete=rows.length===6&&rows.every((r,i)=>numeric(r.temp)&&numeric(r.rain)&&r.rain>=0&&r.rain<=100&&numeric(r.wind)&&r.wind>=0&&codes.has(r.code)&&(!i||civil(r.time)-civil(rows[i-1].time)===3600000));
 if(!complete||!codes.has(current.weather_code))return {status:'partial',rows,title:'Le prossime ore, con qualche dato mancante',detail:'Non ci sono sei fasce complete e consecutive per individuare un cambiamento.'};
 let event;
 for(const r of rows){
  if(group(r.code)==='storm'&&group(current.weather_code)!=='storm'){event={row:r,title:'Temporali nelle previsioni',detail:'Il modello indica temporali in questa fascia. Controlla radar e bollettini ufficiali.'};break;}
  if(wet(r.code)&&!wet(current.weather_code)){event={row:r,title:group(r.code)==='snow'?'Neve nelle previsioni':'Possibili precipitazioni',detail:'Il tipo di tempo previsto cambia rispetto al dato attuale.'};break;}
  if(!wet(r.code)&&wet(current.weather_code)){event={row:r,title:'Una possibile pausa dalle precipitazioni',detail:'Il modello passa a una condizione senza precipitazioni. La pausa non è garantita.'};break;}
  if(numeric(current.wind_speed_10m)&&r.wind>=30&&r.wind-current.wind_speed_10m>=15){event={row:r,title:'Il vento potrebbe rinforzare',detail:`Da ${Math.round(current.wind_speed_10m)} a ${Math.round(r.wind)} km/h previsti. Non è una misura delle raffiche.`};break;}
  if(numeric(current.temperature_2m)&&Math.abs(r.temp-current.temperature_2m)>=4){event={row:r,title:r.temp>current.temperature_2m?'Verso un’aria più calda':'Verso un’aria più fresca',detail:`Da ${Math.round(current.temperature_2m)}° a ${Math.round(r.temp)}° previsti rispetto al dato attuale.`};break;}
 }
 return {status:'ready',rows,event,title:event?.title||'Le prossime ore, senza grandi svolte',detail:event?.detail||'Il modello non indica cambiamenti marcati di precipitazioni, vento o temperatura nelle prossime sei fasce orarie.'};
}

export function nextChangeHTML(w,now=new Date()){
 const s=nextChange(w,now),date=w?.timezone&&localNow(w.timezone,now)?.slice(0,10);
 const time=t=>`${t.slice(11,16)}${t.slice(0,10)!==date?' · '+t.slice(8,10)+'/'+t.slice(5,7):''}`;
 return `<section class="next-change" aria-labelledby="next-change-title" data-state="${s.status}"><div class="next-change-head"><span>IL PROSSIMO CAMBIO</span><span>METEOSOCIAL / 06H</span></div><h2 id="next-change-title">${esc(s.title)}</h2>${s.event?`<p class="next-change-event">Fascia delle ${esc(time(s.event.row.time))}</p>`:''}<p>${esc(s.detail)}</p>${s.rows.length?`<ol class="next-change-track" aria-label="Previsioni per le prossime sei fasce orarie">${s.rows.map(r=>`<li ${s.event?.row===r?'data-change="true"':''}><time datetime="${esc(r.time)}">${esc(time(r.time))}</time><span class="next-change-dot" data-sky="${codes.has(r.code)?group(r.code):'unknown'}" aria-hidden="true"></span><strong>${numeric(r.temp)?Math.round(r.temp)+'°':'—'}</strong><span>${esc(codes.has(r.code)?weatherName(r.code):'Dato assente')}</span><small>${numeric(r.rain)&&r.rain>=0&&r.rain<=100?r.rain+'%':'—'} pioggia</small></li>`).join('')}</ol>`:''}<div class="next-change-foot"><a href="#mappa-eventi">Mappa e radar ↗</a><a href="#tendenze">Tutte le ore →</a></div><details><summary>Da dove arriva questo riepilogo?</summary><p>Fonte: ${forecastSource(w)} · previsioni orarie, non osservazioni o un conto alla rovescia. Orari di ${esc(w?.timezone||'località non disponibile')}. La percentuale indica la probabilità di pioggia.</p><p>${esc(forecastStamp(w))}. Mostriamo il primo passaggio di precipitazione, oppure vento in aumento di almeno 15 km/h fino ad almeno 30 km/h, oppure una variazione di almeno 4° rispetto al dato attuale. Altri cambiamenti possono non comparire nel titolo.</p></details></section>`;
}
