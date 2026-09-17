import {esc} from './weather-tools.js';
import {timeSelectors} from './day-plan.js';
const KEY='meteosocial-onboarding-v1';
export function createOnboarding(ctx){
 let started=false,waitingCity=false,locationRun=0;
 const $=s=>document.querySelector(s);
 function remember(){try{localStorage.setItem(KEY,'done')}catch{}}
 function finish(){locationRun++;remember();$('#dialog').close();ctx.goToGlobe()}
 function screen(step){
  locationRun++;
  const progress=`<p class="onboarding-step">${step} di 3</p>`;
  if(step===1){
   ctx.modal('Il meteo alle ore in cui esci di casa.',`${progress}<p>Imposta uscita e rientro: le previsioni e i consigli seguiranno i tuoi orari.</p><button type="button" id="onboarding-next">Cominciamo</button>`,null);
   $('#onboarding-next').onclick=()=>screen(2);
  }else if(step===2){
   const {out,back}=ctx.dayPlan.preferences();
   ctx.modal('Quando esci e quando rientri?',`${progress}<div class="day-time-selectors">${timeSelectors(out,back)}</div><p>Potrai cambiare gli orari quando vuoi.</p><button type="button" id="onboarding-next">Continua</button>`,null);
   $('#onboarding-next').onclick=()=>{ctx.dayPlan.setHours($('#day-out-select').value,$('#day-back-select').value);screen(3)};
  }else{
   ctx.modal('Il meteo della tua zona.',`${progress}<p>Se vuoi, usa la posizione per scegliere la zona del meteo. La richiesta parte solo quando tocchi il pulsante: non pubblichiamo una segnalazione.</p><p>Puoi anche scegliere una città senza concedere la posizione.</p><div class="onboarding-actions"><button type="button" id="onboarding-location">Usa la mia posizione</button><button type="button" id="onboarding-city">Scegli la città</button><button type="button" id="onboarding-current">Continua con ${esc(ctx.get().place.name)}</button></div><p id="onboarding-status" role="status"></p>`,null);
   $('#onboarding-current').onclick=finish;
   $('#onboarding-city').onclick=()=>{locationRun++;waitingCity=true;remember();$('#dialog').close();ctx.goToCity()};
   $('#onboarding-location').onclick=()=>{
    const token=++locationRun,button=$('#onboarding-location'),status=$('#onboarding-status');
    if(!navigator.geolocation){status.textContent='Posizione non disponibile. Scegli la città o continua con quella indicata.';return}
    button.disabled=true;status.textContent='Cerco la tua zona…';
    navigator.geolocation.getCurrentPosition(position=>{
     if(token!==locationRun||!$('#dialog').open)return;
     const {latitude,longitude}=position.coords;
     if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){button.disabled=false;status.textContent='Non riesco a leggere la posizione. Puoi scegliere la città.';return}
     ctx.choose({name:'La mia zona',latitude:Math.round(latitude*100)/100,longitude:Math.round(longitude*100)/100,source:'saved-area'});finish();
    },()=>{if(token!==locationRun||!$('#dialog').open)return;button.disabled=false;status.textContent='Va bene anche senza posizione: scegli la città o continua con quella indicata.'},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
   };
  }
 }
 return {
  start(){if(started)return;started=true;try{if(localStorage.getItem(KEY)==='done')return}catch{}
   screen(1);$('#dialog').addEventListener('close',()=>{locationRun++;remember()},{once:true});
  },
  cityPicked(){if(waitingCity){waitingCity=false;ctx.goToGlobe()}}
 };
}
