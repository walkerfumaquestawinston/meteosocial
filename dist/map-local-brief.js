import {weatherDescription} from './weather-tools.js';
import {forecastSource,forecastSourceURL} from './weather-tools.js';
import {esc,weatherName} from './weather-tools.js';
import {localNow} from './day-plan.js';
import {nextChange} from './next-change.js';

const validCodes=new Set([0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);
const value=(n,unit)=>Number.isFinite(n)?n.toLocaleString('it-IT',{maximumFractionDigits:1})+unit:'—';
export function localBrief(weather,state='ok',now=new Date()){
 const c=weather?.current;
 if(!c)return {status:state==='loading'?'loading':'missing',condition:state==='loading'?'Cerco il meteo locale…':'Meteo non disponibile',temperature:'—',rain:'—',wind:'—',time:'In attesa della fonte',interval:'Precipitazioni'};
 const local=weather.timezone&&localNow(weather.timezone,now);
 const age=local?(Date.parse(local+'Z')-Date.parse(c.time+'Z'))/60000:NaN;
 const acquired=weather._provenance?.capturedAt??weather._loadedAt;
 const stale=weather._offline||!Number.isFinite(age)||age>30||age < -5||(Number.isFinite(acquired)&&now.getTime()-acquired>90*60000);
 const validStamp=typeof c.time==='string'&&/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(c.time)&&Number.isFinite(Date.parse(c.time+'Z'));
 const stamp=validStamp?c.time.slice(11,16)+(local&&c.time.slice(0,10)!==local.slice(0,10)?' · '+c.time.slice(8,10)+'/'+c.time.slice(5,7):''):'—';
 return {status:state==='error'?'error':stale?'stale':'ready',temperature:value(c.temperature_2m,'°'),rain:Number.isFinite(c.precipitation)&&c.precipitation>=0?value(c.precipitation,' mm'):'—',wind:Number.isFinite(c.wind_speed_10m)&&c.wind_speed_10m>=0?value(c.wind_speed_10m,' km/h'):'—',condition:validCodes.has(c.weather_code)||c.condition_text?weatherDescription(c):'Condizione non disponibile',time:(state==='error'?'Recupero fallito · ':stale?'Dato precedente · ':'Stima · ')+stamp,interval:Number.isFinite(c.interval)&&c.interval>0?'Precip. / '+Math.round(c.interval/60)+' min':'Precipitazioni'};
}
export function briefMarkup(place,weather,state){
 const b=localBrief(weather,state);
 return `<div class="map-brief" data-state="${b.status}"><div class="map-brief-location"><span class="map-brief-kicker">ADESSO · STIMA</span><h2>${esc(place.name)}</h2><span class="map-brief-condition">${esc(b.condition)}</span></div><strong class="map-brief-temperature">${esc(b.temperature)}</strong><div class="map-brief-metrics"><span><small>${esc(b.interval)}</small><b>${esc(b.rain)}</b></span><span><small>Vento medio</small><b>${esc(b.wind)}</b></span><span><small>${forecastSource(weather)} · ${esc(weather?.timezone||'fuso non disponibile')}</small><b class="map-brief-time">${esc(b.time)}</b></span></div></div>`;
}
export function changeMarkup(weather,state){
 if(state==='loading'||state==='error')return '';
 const change=nextChange(weather);
 if(change.status!=='ready')return `<p class="field-note">${esc(change.title)}. ${esc(change.detail)}</p>`;
 return `<section class="map-change"><span>IL PROSSIMO CAMBIO</span><strong>${esc(change.title)}</strong>${change.event?`<time>Fascia delle ${esc(change.event.row.time.slice(11,16))}</time>`:''}<p>${esc(change.detail)}</p><small>Previsione ${forecastSource(weather)} · orari di ${esc(weather.timezone)}</small></section>`;
}
