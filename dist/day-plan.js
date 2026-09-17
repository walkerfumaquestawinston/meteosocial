import {esc,valueText,weatherName} from './weather-tools.js';
import {decisione} from './decisione.js';
const KEY='meteosocial-day-plan-v1';
export const validTime=t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
export function localNow(timezone,now=new Date()){
 try{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`}catch{return null}
}
function tomorrow(date){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
export function planForecast(w,out,back,now=new Date()){
 const current=localNow(w?.timezone,now);if(!w?.timezone||!current||!validTime(out)||!validTime(back))return null;
 let date=current.slice(0,10);if(date+'T'+out<current)date=tomorrow(date);
 const end=back<=out?tomorrow(date):date;
 return [{label:'Uscita',time:date+'T'+out},{label:'Rientro',time:end+'T'+back}].map(point=>{
  const hour=point.time.slice(0,13)+':00',i=w.hourly?.time?.indexOf(hour)??-1;
  return {...point,hour,available:i>=0,temp:i>=0?w.hourly.temperature_2m?.[i]:null,rain:i>=0?w.hourly.precipitation_probability?.[i]:null,wind:i>=0?w.hourly.wind_speed_10m?.[i]:null,code:i>=0?w.hourly.weather_code?.[i]:null};
 });
}
export function decisioniHTML(w,points,now=new Date()){
 const adesso=localNow(w?.timezone,now),base={inizio:points[0].time,fine:points[1].time,adesso};
 const labels={ombrello:'Ombrello',vestiti:'Come mi vesto',bucato:'Il bucato',weekend:'Domenica',temporale:'Nella prossima ora'};
 const rows=Object.entries(labels).map(([tipo,titolo])=>({titolo,...decisione(w,{...base,tipo})})).filter(r=>r.frase);
 return `<div class="day-decisions" aria-label="Le decisioni per i tuoi orari" aria-live="polite">${rows.map(r=>`<div class="day-decision" data-certezza="${esc(r.certezza)}"><p class="day-decision-label">${r.titolo}</p><p class="day-decision-phrase">${esc(r.frase)}</p><p class="day-decision-detail">${esc(r.dettaglio)}</p></div>`).join('')}</div>`;
}
export function createDayPlan(ctx){
 let out='08:00',back='18:00',configured=false;
 try{const p=JSON.parse(localStorage.getItem(KEY));if(validTime(p?.out)&&validTime(p?.back)){out=p.out;back=p.back;configured=true}}catch{}
 function setHours(nextOut,nextBack){
  if(!validTime(nextOut)||!validTime(nextBack))return false;
  out=nextOut;back=nextBack;configured=true;let saved=true;
  try{localStorage.setItem(KEY,JSON.stringify({out,back}))}catch{saved=false}
  refresh();if(!saved)ctx.toast?.('Orari validi per questa visita: il browser non permette di salvarli.');return saved;
 }
 function compactContent(){
  if(!configured)return `<h2>A che ora esci di casa?</h2><p>Ti diciamo che tempo trovi a quell’ora, non la media della giornata.</p><div class="day-quick"><button type="button" data-day-quick="08:00">8:00</button><button type="button" data-day-quick="09:00">9:00</button><button type="button" data-day-edit>Altro</button></div><p class="day-compact-note">Rientro proposto: 18:00, puoi cambiarlo.</p>`;
  const w=ctx.get().weather,points=planForecast(w,out,back);
  const base=points?{inizio:points[0].time,fine:points[1].time,adesso:localNow(w.timezone)}:null;
  const decisions=base?['ombrello','vestiti'].map(tipo=>decisione(w,{...base,tipo})):[];
  return `<div class="day-compact-heading"><h2>La mia giornata</h2><button type="button" data-day-edit>Cambia orari</button></div><div class="day-compact-hours">${[{label:'Esci',time:out},{label:'Rientri',time:back}].map((row,i)=>{const p=points?.[i];return `<div><span>${row.label} alle ${row.time}${p?`<small>${p.time.slice(8,10)}/${p.time.slice(5,7)}</small>`:''}</span><strong>${p?.available?valueText(p.temp,'°'):'—°'}<small>${p?.available?esc(weatherName(p.code)):'In attesa dei dati'}</small></strong></div>`}).join('')}</div>${decisions.length?`<div class="day-compact-verdict">${decisions.map(r=>`<p>${esc(r.frase)}</p>`).join('')}</div><details><summary>Su quali dati si basa?</summary>${decisions.map(r=>`<p class="day-compact-note">${esc(r.dettaglio)}</p>`).join('')}<a href="#home">Tutta la mia giornata</a></details>`:`<p role="status">${ctx.get().weatherError?'Le previsioni non rispondono. I tuoi orari restano salvati.':'Preparo il meteo per i tuoi orari…'}</p>`}`;
 }
 function compactHTML(){return `<section id="day-plan-compact" class="day-compact" aria-label="La mia giornata" aria-live="polite">${compactContent()}</section>`}
 function edit(){ctx.modal('I tuoi orari',`<div class="day-time-selectors">${timeSelectors(out,back)}</div>`,()=>{setHours(document.querySelector('#day-out-select').value,document.querySelector('#day-back-select').value)});}
 function bindCompact(){const host=document.querySelector('#day-plan-compact');if(!host)return;host.querySelectorAll('[data-day-quick]').forEach(b=>b.onclick=()=>setHours(b.dataset.dayQuick,back));host.querySelector('[data-day-edit]')?.addEventListener('click',edit)}
 function result(){const w=ctx.get().weather,points=planForecast(w,out,back);if(!points)return '<p>Le previsioni per i tuoi orari appariranno quando il meteo sarà disponibile.</p>';
 return `${decisioniHTML(w,points)}<div class="day-plan-results">${points.map(p=>`<article><h3>${p.label} · ${p.time.slice(11)}</h3><p>${p.time.slice(8,10)}/${p.time.slice(5,7)} · ${esc(ctx.get().place.name)}</p>${p.available?`<strong>${valueText(p.temp,'°')}</strong><p>${weatherName(p.code)}</p><p>Probabilità pioggia <b>${valueText(p.rain,'%')}</b><br>Vento ${valueText(p.wind,' km/h')}</p>`:'<p>Questo orario è oltre le previsioni disponibili.</p>'}</article>`).join('')}</div><p class="small">Fonte: Open-Meteo · dato ${esc(w.current?.time?.replace('T',' ')||'non disponibile')}. Fascia oraria contenente l’orario scelto, senza precisione al minuto. Orari di ${esc(w.timezone)}. Consulta anche i bollettini ufficiali.</p>`;
 }
 function html(){return `<section class="atmo-panel day-plan" aria-labelledby="day-plan-title"><span class="atmo-kicker">LA MIA GIORNATA</span><h2 id="day-plan-title">Che tempo trovo quando esco?</h2><p>Imposta i tuoi orari: se l’uscita è già passata, mostriamo la prossima giornata.</p><form id="day-plan-form"><label>Esco alle<input name="out" type="time" required value="${out}"></label><label>Rientro alle<input name="back" type="time" required value="${back}"></label><button class="button">Aggiorna i miei orari</button></form><p id="day-plan-status" class="small" role="status">Orari conservati solo su questo dispositivo. Nessuna notifica automatica.</p><div id="day-plan-results">${result()}</div></section>`}
 function refresh(){const el=document.querySelector('#day-plan-results');if(el)el.innerHTML=result();const compact=document.querySelector('#day-plan-compact');if(compact){const expanded=!!compact.querySelector('details[open]');compact.innerHTML=compactContent();if(expanded)compact.querySelector('details')?.setAttribute('open','');bindCompact()}}
 function bind(){const form=document.querySelector('#day-plan-form');if(!form)return;form.onsubmit=e=>{e.preventDefault();const data=new FormData(form);if(!validTime(data.get('out'))||!validTime(data.get('back')))return;const saved=setHours(data.get('out'),data.get('back'));document.querySelector('#day-plan-status').textContent=saved?'Orari aggiornati e salvati su questo dispositivo.':'Orari aggiornati per questa visita. Il browser non permette di salvarli.'}}
 setInterval(()=>{if(!document.hidden)refresh()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 return {html,bind,refresh,compactHTML,bindCompact,setHours,preferences:()=>({out,back,configured})};
}

export function timeSelectors(out='08:00',back='18:00'){
 const times=Array.from({length:48},(_,i)=>String(Math.floor(i/2)).padStart(2,'0')+':'+(i%2?'30':'00'));
 for(const t of [out,back])if(validTime(t)&&!times.includes(t))times.push(t);times.sort();
 return [['out','A che ora esci?',out],['back','A che ora rientri?',back]].map(([id,label,selected])=>`<label for="day-${id}-select">${label}<select id="day-${id}-select">${times.map(t=>`<option value="${t}" ${t===selected?'selected':''}>${t}</option>`).join('')}</select></label>`).join('');
}
