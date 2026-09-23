import {esc} from './weather-tools.js';
const cache=new Map(),pending=new Map();
export async function loadRainNowcast(place){
 const lat=Math.round(place.latitude*100)/100,lon=Math.round(place.longitude*100)/100,key=lat+':'+lon;
 const old=cache.get(key);if(old&&Date.now()-old.at<300000)return old.data;
 if(pending.has(key))return pending.get(key);
 const task=(async()=>{const r=await fetch('/api/rainbow/nowcast?'+new URLSearchParams({lat,lon}),{signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok)throw Error(data.error||'Pioggia minuto per minuto non disponibile.');cache.set(key,{at:Date.now(),data});if(cache.size>20)cache.delete(cache.keys().next().value);return data;})().finally(()=>pending.delete(key));pending.set(key,task);return task;
}
export function nowcastSummary(data,now=Date.now()){
 const points=(data?.points||[]).filter(p=>p.end>now);
 if(!points.length||now-data.checkedAt>900000)return {points:[],title:'Previsione da aggiornare'};
 const contiguous=points.every((p,i)=>!i||points[i-1].end===p.start),current=points[0].start<=now;
 const first=points.find(p=>p.rate>0&&p.type!=='no_precipitation');
 if(!current||!contiguous)return {points,title:'Copertura temporale parziale'};
 if(!first)return {points,title:'Nessuna precipitazione prevista nel periodo'};
 const minutes=Math.max(0,Math.ceil((first.start-now)/60000)),type={rain:'Pioggia',snow:'Neve',mixed:'Precipitazioni miste'}[first.type]||'Precipitazioni';
 return {points,title:minutes?type+' previste tra circa '+minutes+' min':type+' previste in questi minuti'};
}
export function nowcastMarkup(data,state='loading',error=''){
 if(state==='loading')return '<section class="rain-nowcast" aria-label="Pioggia minuto per minuto"><h3>Pioggia, minuto per minuto</h3><p role="status">Consulto Rainbow…</p></section>';
 if(state==='error')return '<section class="rain-nowcast"><h3>Pioggia, minuto per minuto</h3><p>'+esc(/timed? ?out|timeout|fetch|network|aborted/i.test(error)?'La fonte non ha risposto in tempo. Riproviamo al prossimo controllo.':error||'Rainbow temporaneamente non disponibile.')+'</p><small>Dato assente non significa assenza di pioggia.</small></section>';
 const {points,title}=nowcastSummary(data);if(!points.length)return '<section class="rain-nowcast"><h3>'+title+'</h3><p>Attendi il prossimo controllo.</p></section>';
 const time=t=>new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:data.timezone}),max=Math.max(1,...points.map(p=>p.rate)),from=points[0].start,to=points.at(-1).end;
 return '<section class="rain-nowcast" aria-label="Pioggia minuto per minuto"><div class="rain-kicker">RAINBOW · PROSSIME '+Math.ceil((to-from)/60000)+' MIN</div><h3>'+esc(title)+'</h3><p>Previsione a passi di un minuto · '+time(from)+'–'+time(to)+'</p><svg viewBox="0 0 480 90" role="img" aria-label="Intensità prevista delle precipitazioni in millimetri per ora. Usa il cursore per leggere ogni minuto."><path d="M0 88H480" stroke="currentColor" opacity=".25"/>'+points.map(p=>'<rect x="'+((p.start-from)/(to-from)*480).toFixed(2)+'" y="'+(87-p.rate/max*76).toFixed(2)+'" width="'+Math.max(.5,(p.end-p.start)/(to-from)*480-.3).toFixed(2)+'" height="'+Math.max(1,p.rate/max*76).toFixed(2)+'" fill="'+(p.type==='snow'?'#818cf8':p.type==='mixed'?'#b45bea':'#1685be')+'"/>').join('')+'</svg><div class="rain-axis"><span>'+time(from)+'</span><span>Scala max '+max.toLocaleString('it-IT',{maximumFractionDigits:1})+' mm/h</span><span>'+time(to)+'</span></div><label>Esplora ogni minuto<input class="rain-minute" type="range" min="0" max="'+(points.length-1)+'" value="0" aria-label="Minuto della previsione pioggia"></label><output class="rain-readout" aria-live="polite"></output><small><a href="https://developer.rainbow.ai/" target="_blank" rel="noopener">Rainbow Weather</a> · controllo '+time(data.checkedAt)+' · '+esc(data.timezone)+'. La fonte aggiorna circa ogni 10 minuti, non ogni secondo. Blu: pioggia; viola: neve/mista. Nessuna classificazione della grandine.</small></section>';
}
export function bindNowcast(slot,data){
 const input=slot?.querySelector('.rain-minute'),out=slot?.querySelector('.rain-readout');if(!input||!out)return;
 const {points}=nowcastSummary(data);const show=()=>{const p=points[Number(input.value)];if(!p)return;const text=new Date(p.start).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:data.timezone})+' · '+p.rate.toLocaleString('it-IT',{maximumFractionDigits:2})+' mm/h · '+({rain:'pioggia',snow:'neve',mixed:'mista',no_precipitation:'nessuna precipitazione'}[p.type]);out.textContent=text;input.setAttribute('aria-valuetext',text);};input.oninput=show;show();
}
