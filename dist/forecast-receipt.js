import {esc,weatherName} from './weather-tools.js';
export function acquiredLabel(at,timezone){if(!Number.isFinite(at))return 'ora non disponibile';try{return new Intl.DateTimeFormat('it-IT',{timeZone:timezone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at))}catch{return 'ora non disponibile'}}
export function forecastStamp(weather){const p=weather?._provenance;return p?.capturedAt?'Previsione acquisita '+acquiredLabel(p.capturedAt,p.timezone):'Ora di acquisizione non disponibile'}
function validHour(time){return String(time).replace(/^(\d{4})-(\d{2})-(\d{2})T/,'$3/$2/$1 alle ')}
const labels={temperature_2m:['Temperatura','°C'],precipitation_probability:['Probabilità di pioggia','%'],precipitation:['Precipitazioni',' mm'],weather_code:['Condizione','']};
function changeText(change){return change.fields.map(key=>{const [name,unit]=labels[key]||[key,''],value=x=>key==='weather_code'?weatherName(x):x+unit;return name+': '+value(change.before[key])+' → '+value(change.after[key])}).join(' · ')}
export function forecastReceipt(weather){if(!weather)return '';const p=weather._provenance,last=p?.lastChange,change=last?.changes?.find(c=>c.fields.includes('weather_code'))||last?.changes?.[0];return `<div class="forecast-receipt" aria-live="polite"><p>${esc(forecastStamp(weather))}${weather._offline?' · ultimo dato salvato':''}</p>${change?`<p>Cambiamento rilevato ${esc(acquiredLabel(last.capturedAt,last.timezone))}: per il ${esc(validHour(change.time))}, ${esc(changeText(change))}.</p>`:''}${p?.status==='unavailable'?'<p>Cronologia online non disponibile per questa copia.</p>':''}<button type="button" data-forecast-history>Ora e cronologia</button></div>`}
export function installForecastHistory(ctx){
 document.addEventListener('click',async event=>{
 if(!event.target.closest('[data-forecast-history]'))return;
 const {place}=ctx.get(),params=new URLSearchParams({lat:place.latitude,lon:place.longitude});
 ctx.modal('La cronologia del meteo',`<p>Questa è l’ora in cui MeteoSocial ha acquisito i dati di Open-Meteo, non l’ora di emissione del modello. Gli orari sono quelli della località.</p><p>Salviamo una nuova copia durante la consultazione, al massimo ogni 15 minuti. La cronologia inizia dall’attivazione di questa funzione.</p><div id="forecast-history-list" aria-live="polite"><p>Caricamento…</p></div>`,null);
 const host=document.querySelector('#forecast-history-list');
 let first=true;
 const load=async before=>{if(!host.isConnected)return;const old=host.querySelector('[data-history-more]');if(old)old.disabled=true;
 try{const query=new URLSearchParams(params);if(before)query.set('before',before);const response=await fetch('/api/forecast/history?'+query,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const data=await response.json();if(!host.isConnected)return;
 if(first){host.innerHTML='';first=false}old?.remove();
 host.insertAdjacentHTML('beforeend',data.copies.map(copy=>`<details class="forecast-copy"><summary>Acquisita ${esc(acquiredLabel(copy.capturedAt,copy.timezone))} · ${copy.previousId?(copy.changes.length?'dati cambiati':'nessuna variazione confrontabile'):'prima copia'}</summary>${copy.previousId?'<p>Confronto con la copia precedente, solo per le stesse ore ancora future al momento dell’acquisizione. Dati mancanti esclusi.</p>':'<p>Non abbiamo una copia precedente da confrontare.</p>'}${copy.changes.map(c=>`<p><b>${esc(validHour(c.time))}</b><br>${esc(changeText(c))}</p>`).join('')}<a href="/api/forecast/snapshot?id=${encodeURIComponent(copy.id)}" target="_blank" rel="noopener">Apri i dati originali di questa copia</a>${copy.previousId?`<br><a href="/api/forecast/snapshot?id=${encodeURIComponent(copy.previousId)}" target="_blank" rel="noopener">Apri la copia precedente</a>`:''}</details>`).join(''));
 if(!data.copies.length&&first===false&&!host.children.length)host.innerHTML='<p>Non ci sono ancora copie salvate per questa località.</p>';
 if(data.next){const more=document.createElement('button');more.type='button';more.dataset.historyMore='';more.textContent='Copie precedenti';more.onclick=()=>load(data.next);host.append(more)}
 }catch{if(!host.isConnected)return;old?.remove();if(first)host.innerHTML='';const message=document.createElement('p');message.textContent='La cronologia non è disponibile adesso.';const retry=document.createElement('button');retry.type='button';retry.textContent='Riprova';retry.onclick=()=>{message.remove();retry.remove();load(before)};host.append(message,retry)}};
 await load();
 });
}
