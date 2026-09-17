const dailyEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createDailyQuestion(ctx){
 let timer=null,version=0;const pending=new Map();
 const slot=()=>'<section class="daily-question" aria-label="La domanda di oggi"><span class="daily-kicker">LA DOMANDA DI OGGI</span><div data-daily-question aria-live="polite" aria-busy="true"><p>Preparo la domanda della zona…</p></div></section>';
 function stop(){clearTimeout(timer);version++}
 function bind(){stop();const host=document.querySelector('[data-daily-question]');if(!host)return;const ticket=version,place={...ctx.get().place};let data=null;
  const alive=()=>ticket===version&&host.isConnected;
  const refreshAt=at=>{clearTimeout(timer);timer=setTimeout(()=>{if(alive())load()},Math.max(1000,Math.min(3600000,at-(data?.serverNow||Date.now())+100)));};
  function error(e){if(!alive())return;host.setAttribute('aria-busy','false');host.innerHTML=`<p>${dailyEscape(e.message||'Domanda non disponibile adesso.')}</p><button data-daily-retry>Riprova</button>`;host.querySelector('button').onclick=load}
  function paint(){if(!alive())return;host.setAttribute('aria-busy','false');if(!data.id){host.innerHTML=`<p>${dailyEscape(data.testo)}</p>`;refreshAt(data.apre);return}
   const counts=data.giaRisposto?data.opzioni.map(o=>{const n=data.risposte[o];return data.totale<3?`${n} ${n===1?'persona ha':'persone hanno'} risposto ${o.toLowerCase()}.`:`${n} persone su ${data.totale} dicono ${o.toLowerCase()}.`}).join(' '):'';
   host.innerHTML=`<h2 id="daily-question-title">${dailyEscape(data.testo)}</h2><p class="daily-city">${dailyEscape(place.name)}</p><div class="daily-choices">${data.opzioni.map(o=>`<button data-daily-answer="${dailyEscape(o)}" aria-pressed="${data.miaRisposta===o}">${dailyEscape(o)}</button>`).join('')}</div>${data.giaRisposto?`<p class="daily-result">${dailyEscape(counts)}</p><p>Tu hai detto: <strong>${dailyEscape(data.miaRisposta)}</strong>. Puoi cambiare fino a mezzanotte.</p>`:'<p class="daily-hint">Un tocco per rispondere, poi scopri cosa dice la zona.</p>'}<p data-daily-status role="status"></p><details><summary>Come funziona</summary><p>Una risposta per browser al giorno, nella zona selezionata (circa 5 km). La domanda è uguale per tutti nella zona e resta fino a mezzanotte locale. La sceglie il meteo del modello Open-Meteo; le risposte sono opinioni delle persone, non misure o allerte. Cancellare i cookie cambia l’identità del browser.</p></details>`;
   host.querySelectorAll('[data-daily-answer]').forEach(button=>button.onclick=async()=>{
    const buttons=[...host.querySelectorAll('[data-daily-answer]')];buttons.forEach(b=>b.disabled=true);host.querySelector('[data-daily-status]').textContent='Salvo la risposta…';
    try{await ctx.api('sky/session',{});const result=await ctx.api('domanda/'+data.id+'/risposta',{risposta:button.dataset.dailyAnswer});if(!alive())return;data=result;paint();try{navigator.vibrate?.(18)}catch{}}
    catch(e){if(!alive())return;if(e.status===410){await load();return}host.querySelector('[data-daily-status]').textContent=e.message;buttons.forEach(b=>b.disabled=false)}
   });refreshAt(data.scade);
  }
  async function load(){if(!alive())return;host.setAttribute('aria-busy','true');const key='domanda?'+new URLSearchParams({lat:place.latitude,lng:place.longitude});try{if(!pending.has(key))pending.set(key,ctx.api(key).finally(()=>pending.delete(key)));data=await pending.get(key);paint()}catch(e){error(e)}}
  load();
 }
 return {slot,bind,stop};
}
