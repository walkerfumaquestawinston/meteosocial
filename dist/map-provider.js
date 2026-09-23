import {esc} from './weather-tools.js';
export function providerBrief(place,data){
 if(data?.source==='Rainbow Weather')return rainbowMarkup(data,place);
 if(!data||!['available','stale'].includes(data.status))return '';
 const fmt=(v,u='')=>Number.isFinite(v)?v.toLocaleString('it-IT',{maximumFractionDigits:1})+u:'—';
 const stamp=new Date(data.observedAt).toLocaleTimeString('it-IT',{timeZone:data.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit'});
 return `<div class="map-brief" data-state="${data.status==='available'?'ready':'stale'}"><div class="map-brief-location"><span class="map-brief-kicker">ADESSO · WEATHERAPI</span><h2>${esc(place.name)}</h2><span class="map-brief-condition">${esc(data.condition)}</span></div><strong class="map-brief-temperature">${fmt(data.temperature,'°')}</strong><div class="map-brief-metrics"><span><small>Percepita</small><b>${fmt(data.feelsLike,'°')}</b></span><span><small>Vento medio</small><b>${fmt(data.wind,' km/h')}</b></span><span><small>${esc(data.timezone)}</small><b class="map-brief-time">${data.status==='stale'?'Dato precedente':'Dato'} · ${esc(stamp)}</b></span></div></div>`;
}
export function providerMarkup(data){
 if(data?.source==='Rainbow Weather')return rainbowMarkup(data);
 if(!data||data.status==='not-configured')return '';
 if(data.status==='unavailable')return '<p class="field-note">WeatherAPI non disponibile. Le previsioni restano separate qui sotto.</p>';
 const fmt=(v,u='')=>Number.isFinite(v)?v.toLocaleString('it-IT',{maximumFractionDigits:1})+u:'—';
 const time=at=>new Date(at).toLocaleString('it-IT',{timeZone:data.timezone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const metric=(label,value,unit)=>'<div><dt>'+label+'</dt><dd>'+fmt(value,unit)+'</dd></div>';
 return `<section class="provider-current" aria-label="Meteo attuale WeatherAPI"><div class="field-eyebrow">${data.status==='stale'?'DATO PRECEDENTE':'METEO ATTUALE'} · WEATHERAPI</div><div class="provider-hero"><strong>${fmt(data.temperature,'°')}</strong><span>${esc(data.condition)}</span></div><p>Dato del ${esc(time(data.observedAt))}<br><small>${esc(data.timezone)} · controllo ${esc(time(data.checkedAt))}</small></p><details><summary>Percepita, vento, umidità e aria</summary><dl>${metric('Percepita',data.feelsLike,' °C')+metric('Vento',data.wind,' km/h')+metric('Raffiche',data.gust,' km/h')+metric('Umidità',data.humidity,'%')+metric('Pressione',data.pressure,' hPa')+metric('Visibilità',data.visibility,' km')+metric('Indice UV',data.uv,'')+metric('PM2,5',data.pm25,' µg/m³')}</dl></details><p class="field-source"><a href="https://www.weatherapi.com/" target="_blank" rel="noopener">WeatherAPI</a> · aggiornamenti della fonte ogni 10–15 minuti. Le previsioni indicano la propria fonte; radar pioggia: RainViewer, grandine: Radar-DPC.</p></section>`;
}
function rainbowMarkup(data,place){
 if(data.status==='unavailable')return '<p class="field-note">Rainbow Weather non disponibile. Consulta la fonte e l’orario delle eventuali previsioni salvate.</p>';
 const fmt=(v,u='')=>Number.isFinite(v)?v.toLocaleString('it-IT',{maximumFractionDigits:1})+u:'—';
 const time=at=>new Date(at).toLocaleString('it-IT',{timeZone:data.timezone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 const stamp=`Previsione ${time(data.validAt)}–${time(data.validUntil)} · ${data.timezone}`;
 if(place)return `<div class="map-brief" data-state="ready"><div class="map-brief-location"><span class="map-brief-kicker">PREVISIONE ORARIA · RAINBOW</span><h2>${esc(place.name)}</h2><span class="map-brief-condition">${esc(data.condition)}</span></div><strong class="map-brief-temperature">${fmt(data.temperature,'°')}</strong><div class="map-brief-metrics"><span><small>Percepita</small><b>${fmt(data.feelsLike,'°')}</b></span><span><small>Vento</small><b>${fmt(data.wind,' km/h')}</b></span><span><small>${esc(data.timezone)}</small><b>${esc(time(data.validAt))}</b></span></div></div>`;
 return `<section class="provider-current" aria-label="Previsione Rainbow"><div class="field-eyebrow">PREVISIONE PER QUESTA ORA · RAINBOW WEATHER</div><div class="provider-hero"><strong>${fmt(data.temperature,'°')}</strong><span>${esc(data.condition)}</span></div><p>${esc(stamp)}<br>Emessa ${esc(time(data.issuedAt))}. Non è una misura osservata.</p><p>Percepita ${fmt(data.feelsLike,'°')} · vento ${fmt(data.wind,' km/h')} · raffiche ${fmt(data.gust,' km/h')} · umidità ${fmt(data.humidity,'%')} · pressione al livello del mare ${fmt(data.pressure,' hPa')}</p><p class="field-source"><a href="https://developer.rainbow.ai/" target="_blank" rel="noopener">Rainbow Weather</a> · previsioni orarie. Radar e grandine mantengono fonti separate.</p></section>`;
}
