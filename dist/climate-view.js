import {FEATURES} from './community-features.js';
import {esc,valueText} from './weather-tools.js';
export const CLIMATE_LAYERS=[
 {id:'meteo',label:'Quadro meteo',kind:'model'},
 {id:'radar',label:'Radar · pioggia e neve',kind:'radar'},
 {id:'grandine',label:'Grandine segnalata',kind:'community'},
 {id:'segnalazioni',label:'Altre segnalazioni',kind:'community'},
 {id:'pioggia',label:'Precipitazioni totali',field:'precipitation',unit:' mm',decimals:1,kind:'model'},
 {id:'rain',label:'Pioggia',field:'rain',unit:' mm',decimals:1,kind:'model'},
 {id:'rovesci',label:'Rovesci',field:'showers',unit:' mm',decimals:1,kind:'model'},
 {id:'neve',label:'Neve',field:'snowfall',unit:' cm',decimals:1,kind:'model'},
 {id:'vento',label:'Vento',field:'wind_speed_10m',unit:' km/h',kind:'model'},
 {id:'raffiche',label:'Raffiche',field:'wind_gusts_10m',unit:' km/h',kind:'model'},
 {id:'nuvole',label:'Nuvole',field:'cloud_cover',unit:'%',kind:'model'},
 {id:'temperatura',label:'Temperatura',field:'temperature_2m',unit:'°',kind:'model'},
 {id:'umidita',label:'Umidità',field:'relative_humidity_2m',unit:'%',kind:'model'},
 {id:'pressione',label:'Pressione al suolo',field:'surface_pressure',unit:' hPa',kind:'model'}
];
export const layerDefinition=id=>CLIMATE_LAYERS.find(l=>l.id===id)||CLIMATE_LAYERS[0];
export const climateValue=(w,id)=>{const l=layerDefinition(id);return l.field?valueText(w?.[l.field],l.unit,l.decimals||0):null};
export function layerControls(id){return `<div class="climate-layer-controls"><div class="atlas-layers">${CLIMATE_LAYERS.slice(0,3).filter(l=>l.id!=='grandine'||FEATURES.hailMap).map(l=>`<button data-atlas-layer="${l.id}" aria-pressed="${l.id===id}">${l.label}</button>`).join('')}</div><label>Esplora tutti i livelli<select id="atlas-layer-select">${['radar','community','model'].map(kind=>`<optgroup label="${{radar:'Osservazioni radar',community:'Racconti delle persone',model:'Previsioni del modello'}[kind]}">${CLIMATE_LAYERS.filter(l=>l.kind===kind&&(l.id!=='grandine'||FEATURES.hailMap)).map(l=>`<option value="${l.id}" ${l.id===id?'selected':''}>${l.label}</option>`).join('')}</optgroup>`).join('')}</select></label></div>`}
export function climatePanel(place,w,active='meteo'){const c=w?.current;return `<section class="climate-panel"><div><span class="climate-eyebrow">LA STESSA LOCALITÀ, TUTTO COLLEGATO</span><h2>${esc(place.name)}</h2><p>${c?'Adesso · modello Open-Meteo · '+esc((c.time||'Orario non disponibile').replace('T',' '))+' · '+esc(w.timezone||'fuso non disponibile'):'Previsioni in attesa di aggiornamento'}</p></div><div class="climate-values">${['rain','rovesci','neve','vento','raffiche','nuvole','temperatura','umidita','pressione'].map(id=>{const l=layerDefinition(id);return `<button data-atlas-layer="${id}" aria-pressed="${active===id}"><span>${l.label}</span><strong>${climateValue(c,id)}</strong></button>`}).join('')}</div><p>Pioggia, rovesci e neve si riferiscono all’intervallo precedente della fonte${c?.interval?' ('+Math.round(c.interval/60)+' minuti)':''}. Le quantità orarie nella timeline coprono l’ora precedente. La neve è in centimetri; le precipitazioni totali sono acqua equivalente in millimetri. Dati sulle città, senza ricostruire zone intermedie.</p><div class="climate-actions"><button data-atlas-community>Vedi la community qui</button><button data-atlas-question>Fai una domanda alla zona</button><a href="#grandine">Grandine chiara e Lente IA →</a></div></section>`}
export function journey(place,route,googleEnabled=false){const links=[['home','Oggi'],['mondo','Globo'],['mappa','Mappa'],['tendenze','Meteo'],['grandine-mappa','Grandine']];if(route==='google3d')route='mondo';else if(route==='mondo'&&googleEnabled)route='globo-meteo';return `<div class="climate-journey" role="navigation" aria-label="Esplora la località"><span>⌖ ${esc(place.name)}</span><div>${links.map(([id,label])=>`<a href="#${id}" ${route===id?'aria-current="page"':''}>${label}</a>`).join('')}<button data-journey-community>Community qui</button></div></div>`}
export function globeQuality(choice='high',dpr=1,maxTexture=8192){const high=choice!=='light';return {pixelRatio:Math.min(Math.max(1,dpr),high?2.5:1),textureWidth:Math.min(maxTexture,high?5400:2048),segments:high?160:48,rings:high?112:32,radarSize:high?2048:1024};}
