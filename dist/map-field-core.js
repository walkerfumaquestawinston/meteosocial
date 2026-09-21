import {distanceKm} from './nearby-tools.js';
export const FIELD_MODES={
 temperature:{name:'Temperatura',kind:'Temperatura',title:'Come si sentirà fuori?',unit:'°',field:'temperature_2m',extra:'apparent_temperature',extraLabel:'Percepita',question:'Confronta temperatura e percepita nelle prossime 6 ore. Quali ore sono più confortevoli per uscire? Indica dati, orari e incertezza.'},
 pioggia:{name:'Pioggia',kind:'Pioggia',title:'La tua finestra per uscire',unit:' mm',field:'precipitation',extra:'precipitation_probability',extraLabel:'Probabilità',question:'Individua la finestra con meno pioggia nelle prossime 6 ore. Riporta probabilità, quantità oraria e incertezza: non inventare minuti di arrivo.'},
 grandine:{name:'Grandine',kind:'Grandine',title:'Osserva. Orientati. Riparati.',question:'Spiega cosa possiamo sapere della grandine dalle previsioni disponibili. Distingui condizioni favorevoli da grandine osservata e indica i limiti: non stimare traiettorie, impatto o disponibilità dei ripari.'},
 vento:{name:'Vento',kind:'Vento',title:'Conta anche la raffica',unit:' km/h',field:'wind_speed_10m',extra:'wind_gusts_10m',extraLabel:'Raffiche',question:'Leggi vento medio e raffiche delle prossime 6 ore. Individua il picco previsto e quando diminuiscono, senza garantire che un percorso sia sicuro.'},
 fulmini:{name:'Fulmini',kind:'Fulmini',title:'Un cielo da tenere d’occhio',unit:'',field:'weather_code',question:'Quali ore mostrano temporali nel modello delle prossime 6 ore? Distingui probabilità di pioggia, codice temporale e fulmini realmente rilevati. Non hai un sensore di scariche.'}
};
export function fieldHours(data,now=Date.now()){
 const h=data?.hourly;if(!Array.isArray(h?.time))return [];
 let formatter;try{formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:data.timezone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}catch{return []}
 const local=t=>formatter.format(new Date(t)).replace(' ','T'),counts=new Map();h.time.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
 const epoch=value=>{if(typeof value==='number')return value*1000;if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value)||counts.get(value)>1)return NaN;const wall=Date.parse(value+'Z');if(!Number.isFinite(wall))return NaN;let guess=wall;for(let i=0;i<3;i++)guess=wall-(Date.parse(local(guess)+'Z')-guess);return local(guess)===value?guess:NaN;};
 return h.time.map((time,i)=>({time:epoch(time),...Object.fromEntries(['temperature_2m','apparent_temperature','precipitation','precipitation_probability','wind_speed_10m','wind_gusts_10m','weather_code'].map(k=>[k,Number.isFinite(h[k]?.[i])?h[k][i]:null]))})).filter(p=>Number.isFinite(p.time)&&p.time>=now&&p.time<now+7*3600000).slice(0,6);
}
export function withinField(reports,center,radius=150,now=Date.now()){
 return reports.filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Number.isFinite(p.observed??p.created)&&(p.observed??p.created)>now-7200000&&(p.observed??p.created)<=now&&(p.expires==null||p.expires>now)).map(p=>({...p,distance:distanceKm(center,p)})).filter(p=>Number.isFinite(p.distance)&&p.distance<=radius).sort((a,b)=>a.distance-b.distance);
}
export function rangeBounds(p,km){
 const lat=km/110.574,lon=km/(111.32*Math.max(.01,Math.cos(p.latitude*Math.PI/180)));
 return [[Math.max(-85,p.latitude-lat),p.longitude-lon],[Math.min(85,p.latitude+lat),p.longitude+lon]];
}
