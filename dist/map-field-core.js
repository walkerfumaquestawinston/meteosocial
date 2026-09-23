import {distanceKm} from './nearby-tools.js';
export const FIELD_MODES={
 temperature:{name:'Temperatura',kind:'Temperatura',title:'Come si sentirà fuori?',unit:'°',field:'temperature_2m',extra:'apparent_temperature',extraLabel:'Percepita',question:'Confronta temperatura e percepita nelle prossime 6 ore. Quali ore sono più confortevoli per uscire? Indica dati, orari e incertezza.'},
 neve:{name:'Neve',kind:'Neve',title:'Quanta neve, a quale ora?',unit:' cm',field:'snowfall',extra:'snow_depth',extraLabel:'Neve al suolo',question:'Leggi la neve prevista nelle prossime 6 ore: centimetri per intervallo, neve al suolo e quota dello zero termico se disponibili. Distingui quota zero termico da quota neve e previsione da osservazione; niente certezza sulla percorribilità.'},
 pioggia:{name:'Pioggia',kind:'Pioggia',title:'La tua finestra per uscire',unit:' mm',field:'precipitation',extra:'precipitation_probability',extraLabel:'Probabilità',question:'Individua la finestra con meno pioggia nelle prossime 6 ore. Riporta probabilità, quantità oraria e incertezza: non inventare minuti di arrivo.'},
 grandine:{name:'Grandine',kind:'Grandine',title:'Osserva. Orientati. Riparati.',question:'Spiega cosa possiamo sapere della grandine dalle previsioni disponibili. Distingui condizioni favorevoli da grandine osservata e indica i limiti: non stimare traiettorie, impatto o disponibilità dei ripari.'},
 vento:{name:'Vento',kind:'Vento',title:'Conta anche la raffica',unit:' km/h',field:'wind_speed_10m',extra:'wind_gusts_10m',extraLabel:'Raffiche',question:'Leggi vento medio e raffiche delle prossime 6 ore. Individua il picco previsto e quando diminuiscono, senza garantire che un percorso sia sicuro.'},
 fulmini:{name:'Temporali',kind:'Fulmini',title:'Un cielo da tenere d’occhio',unit:'',field:'weather_code',question:'Quali ore mostrano temporali nel modello delle prossime 6 ore? Distingui probabilità di pioggia, codice temporale e fulmini realmente rilevati. Non hai un sensore di scariche.'}
};
export function fieldHours(data,now=Date.now()){
 const h=data?.hourly;if(!Array.isArray(h?.time))return [];
 let formatter;try{formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:data.timezone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}catch{return []}
 const local=t=>formatter.format(new Date(t)).replace(' ','T'),counts=new Map();h.time.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
 const epoch=value=>{if(typeof value==='number')return value*1000;if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value)||counts.get(value)>1)return NaN;const wall=Date.parse(value+'Z');if(!Number.isFinite(wall))return NaN;let guess=wall;for(let i=0;i<3;i++)guess=wall-(Date.parse(local(guess)+'Z')-guess);return local(guess)===value?guess:NaN;};
 return h.time.map((time,i)=>({time:Number.isFinite(h.time_epoch?.[i])?h.time_epoch[i]*1000:epoch(time),...Object.fromEntries(['temperature_2m','apparent_temperature','precipitation','precipitation_probability','snowfall','snow_depth','freezing_level_height','visibility','wind_speed_10m','wind_gusts_10m','weather_code','is_day'].map(k=>[k,Number.isFinite(h[k]?.[i])?h[k][i]:null]))})).filter(p=>Number.isFinite(p.time)&&p.time>=now&&p.time<now+7*3600000).slice(0,6);
}
export function withinField(reports,center,radius=150,now=Date.now()){
 return reports.filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Number.isFinite(p.observed??p.created)&&(p.observed??p.created)>now-7200000&&(p.observed??p.created)<=now&&(p.expires==null||p.expires>now)).map(p=>({...p,distance:distanceKm(center,p)})).filter(p=>Number.isFinite(p.distance)&&p.distance<=radius).sort((a,b)=>a.distance-b.distance);
}

// One selection drives hail pins, counts and the list; elapsed time is UTC.
export function hailSelection(reports,center,{radius=150,minutes=120,includeEnded=true,sort='distance',now=Date.now()}={}){
 if(!center||!Number.isFinite(center.latitude)||Math.abs(center.latitude)>85||!Number.isFinite(center.longitude)||Math.abs(center.longitude)>180||!Number.isFinite(radius)||radius<=0||radius>150||![15,30,60,120].includes(minutes))return [];
 const seen=new Set();
 const list=withinField(Array.isArray(reports)?reports:[],center,radius,now).filter(p=>{
  if(Math.abs(p.latitude)>85||Math.abs(p.longitude)>180||(p.observed??p.created)<=now-minutes*60000||(!includeEnded&&p.ended))return false;
  if(p.id!=null){if(seen.has(p.id))return false;seen.add(p.id);}return true;
 });
 return list.sort((a,b)=>sort==='recent'?(b.observed??b.created)-(a.observed??a.created)||a.distance-b.distance:a.distance-b.distance||(b.observed??b.created)-(a.observed??a.created));
}

export function hailEvidence(reports,{state='loading',updatedAt=0,now=Date.now()}={}){
 const old=updatedAt>0&&now-updatedAt>=300000;
 if(state==='loading')return {tone:'pending',title:'Aggiornamento in corso',detail:'Attendi le osservazioni della zona.'};
 if(state!=='ok'||!updatedAt||old)return {tone:'unknown',title:updatedAt?'Osservazioni da aggiornare':'Osservazioni non disponibili',detail:'Non possiamo descrivere la situazione attuale. Riprova ad aggiornare.'};
 const active=reports.filter(p=>!p.ended),latest=reports.reduce((n,p)=>Math.max(n,p.observed??p.created),0);
 return {tone:active.length?'reported':'empty',title:active.length?active.length+(active.length===1?' osservazione non cessata':' osservazioni non cessate'):reports.length?'Solo osservazioni cessate':'Nessuna osservazione nei filtri',detail:'Segnalazioni della community, non verificate. Il silenzio non esclude grandine.',active:active.length,ended:reports.length-active.length,latest};
}
export function rangeBounds(p,km){
 const lat=km/110.574,lon=km/(111.32*Math.max(.01,Math.cos(p.latitude*Math.PI/180)));
 return [[Math.max(-85,p.latitude-lat),p.longitude-lon],[Math.min(85,p.latitude+lat),p.longitude+lon]];
}

// Only complete future intervals; precipitation and gusts refer to the preceding hour.
// A low-rain window is an observation about model data, never a safety score.
export function rainWindow(hours,now=Date.now()){
 const eligible=h=>Number.isFinite(h.precipitation)&&h.precipitation>=0&&h.precipitation<=.2&&Number.isFinite(h.precipitation_probability)&&h.precipitation_probability>=0&&h.precipitation_probability<=30&&Number.isFinite(h.weather_code)&&![95,96,99].includes(h.weather_code);
 const ordered=hours.filter(h=>Number.isFinite(h.time)).slice().sort((a,b)=>a.time-b.time);
 for(let i=0;i<ordered.length-1;i++){
  const a=ordered[i],b=ordered[i+1];
  if(a.time-3600000>=now&&b.time-a.time===3600000&&eligible(a)&&eligible(b))return {start:a.time-3600000,end:b.time,probability:Math.max(a.precipitation_probability,b.precipitation_probability),amount:a.precipitation+b.precipitation};
 }
 return null;
}

export function hourQuestion(h,timezone='UTC'){
 const number=n=>Number.isFinite(n)?String(n):'non disponibile';
 const at=new Intl.DateTimeFormat('it-IT',{timeZone:timezone,dateStyle:'short',timeStyle:'short'}).format(new Date(h.time));
 return `Spiega questa previsione Open-Meteo del ${at} (${timezone}): temperatura ${number(h.temperature_2m)} °C, percepita ${number(h.apparent_temperature)} °C, vento ${number(h.wind_speed_10m)} km/h, neve al suolo ${number(h.snow_depth)} m, zero termico ${number(h.freezing_level_height)} m sul mare, codice meteo ${number(h.weather_code)}. Nell’ora precedente: precipitazioni ${number(h.precipitation)} mm, neve fresca ${number(h.snowfall)} cm, probabilità ${number(h.precipitation_probability)}%, raffiche massime ${number(h.wind_gusts_10m)} km/h. Distingui previsione e osservazione; niente minuti di arrivo, certezze di sicurezza o scariche rilevate.`;
}
