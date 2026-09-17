import assert from 'node:assert/strict';
import {decisione,nomeVento} from './dist/decisione.js';
import {decisioniHTML,planForecast} from './dist/day-plan.js';
let checks=0;const check=(v,label)=>{assert.ok(v,label);checks++};
const start=Date.parse('2026-09-17T00:00Z');
function forecast(){const time=Array.from({length:96},(_,i)=>new Date(start+i*3600000).toISOString().slice(0,16));return {timezone:'Europe/Rome',hourly:{time,...Object.fromEntries(Object.entries({precipitation_probability:10,precipitation:0,apparent_temperature:18,temperature_2m:30,relative_humidity_2m:60,wind_speed_10m:12,wind_direction_10m:315,weather_code:0}).map(([k,v])=>[k,time.map(()=>v)]))}}}
const window={inizio:'2026-09-17T08:00',fine:'2026-09-17T18:00',adesso:'2026-09-17T07:40'};
const decide=(w,tipo='ombrello',extra={})=>decisione(w,{...window,tipo,...extra});
for(const [p,certainty,part] of [[0,'indicativa','lasciare'],[24,'indicativa','lasciare'],[25,'incerta','Forse'],[39,'incerta','Forse'],[40,'incerta','Difficile'],[50,'incerta','Difficile'],[55,'incerta','Difficile'],[60,'incerta','Difficile'],[61,'indicativa','Sì'],[100,'indicativa','Sì']]){const w=forecast();w.hourly.precipitation_probability.fill(p);const r=decide(w);check(r.certezza===certainty&&r.frase.includes(part),'rain boundary '+p)}
let w=forecast();w.hourly.precipitation[14]=.51;check(decide(w).frase.includes('14:00'),'mm can trigger umbrella with low probability');w.hourly.precipitation[14]=.5;check(decide(w).frase.includes('lasciare'),'strict mm threshold');
w.hourly.precipitation_probability[14]=null;check(decide(w).certezza==='dati-insufficienti','null is not zero');w.hourly.precipitation_probability[14]=101;check(decide(w).certezza==='dati-insufficienti','reject invalid probability');
w=forecast();w.hourly.time.splice(10,1);check(decide(w).certezza==='dati-insufficienti','incomplete time window');
for(const [temp,phrase] of [[7,'pesante'],[8,'leggera'],[15,'leggera'],[16,'Felpa'],[21,'Felpa'],[22,'corte']]){w=forecast();w.hourly.apparent_temperature.fill(temp);check(decide(w,'vestiti').frase.includes(phrase),'perceived threshold '+temp)}
w=forecast();delete w.hourly.apparent_temperature;check(decide(w,'vestiti').certezza==='dati-insufficienti','never substitute real temperature');
w=forecast();w.hourly.apparent_temperature[8]=14;w.hourly.apparent_temperature[18]=26;check(decide(w,'vestiti').frase.includes('a strati')&&decide(w,'vestiti').frase.includes('26°'),'layers at >8 degrees');w.hourly.apparent_temperature[18]=22;check(!decide(w,'vestiti').frase.includes('a strati'),'strict 8 degree threshold');
w=forecast();check(decide(w,'bucato').frase.startsWith('Oggi si stende'),'laundry all eight hours');check(decide(w,'bucato',{inizio:'2026-09-17T08:30'}).dettaglio.includes('09:00 alle 17:00'),'full future eight-hour window');
for(const [field,v] of [['precipitation',.01],['relative_humidity_2m',70],['wind_speed_10m',5],['wind_speed_10m',null]]){w=forecast();w.hourly[field][12]=v;check(decide(w,'bucato')===null,'hide laundry on '+field+' '+v)}
w=forecast();check(decide(w,'weekend',{adesso:'2026-09-16T07:00'})===null,'no weekend before Thursday');const sunday=decide(w,'weekend');check(sunday.frase.includes('maestrale')&&sunday.dettaglio.includes('Non è una valutazione'),'weekend facts not beach verdict');
w.hourly.precipitation_probability[82]=60;check(decide(w,'weekend').frase.includes('può piovere'),'weekend uncertainty');
check(nomeVento(0,12)==='tramontana'&&nomeVento(135,12)==='scirocco'&&nomeVento(225,12)==='libeccio','wind directions');check(nomeVento(315,5)===null&&nomeVento(null,12)===null,'no wind names for calm or missing data');
w=forecast();w.hourly.precipitation[8]=2;check(decide(w,'temporale')===null,'rain alone is not thunder');w.hourly.weather_code[8]=95;const storm=decide(w,'temporale');check(storm.frase.includes('Possibile temporale')&&!storm.frase.includes('minuti'),'hourly storm only');
const overnight={inizio:'2026-09-17T23:00',fine:'2026-09-18T06:00'};check(decide(forecast(),'ombrello',overnight).certezza==='indicativa','cross-midnight');check(decide({},'ombrello').certezza==='dati-insufficienti','missing weather');
w=forecast();const points=planForecast(w,'08:00','18:00',new Date('2026-09-17T05:00Z'));const html=decisioniHTML(w,points,new Date('2026-09-17T05:00Z'));check(html.includes('aria-live="polite"')&&html.includes('Come mi vesto')&&html.includes('Ombrello'),'day-plan integration');check(!html.includes('Temporale tra')&&!html.includes('NaN')&&!html.includes('undefined'),'no invented precision or missing values');
const lum=hex=>{const v=hex.match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};check((lum('8095ac')+.05)/(lum('132441')+.05)>=4.5,'small ink-3 on lightest decision gradient meets AA');
console.log(checks+' Decisore checks passed.');
