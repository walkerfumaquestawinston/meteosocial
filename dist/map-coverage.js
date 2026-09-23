import {validPlace,isSnow,isStorm} from './map-weather-core.js';

// Spread the existing request budget over the viewport instead of taking catalog order.
export function samplePlaces(points,center,limit=8){
 const distance=(a,b)=>{const lon=Math.abs(a.longitude-b.longitude)%360;return (a.latitude-b.latitude)**2+(Math.min(lon,360-lon)*Math.cos((a.latitude+b.latitude)*Math.PI/360))**2;};
 const pool=points.filter(validPlace),chosen=[];
 if(!pool.length||limit<1)return chosen;
 const origin=validPlace(center)?center:pool[0];
 pool.sort((a,b)=>Number(!!b.selected)-Number(!!a.selected)||distance(a,origin)-distance(b,origin));
 chosen.push(pool.shift());
 while(pool.length&&chosen.length<limit){
  let best=0,score=-1;
  for(let i=0;i<pool.length;i++){const d=Math.min(...chosen.map(p=>distance(p,pool[i])));if(d>score){score=d;best=i;}}
  chosen.push(pool.splice(best,1)[0]);
 }
 return chosen;
}
export function coverageText(mode,points,state){
 if(!points.length)return state==='loading'?'Caricamento meteo: i nomi delle città restano esplorabili.':'Dati meteo assenti in questa vista. I nomi delle città non indicano misure disponibili.';
 const n=points.length,k=points.map(p=>p.current||{});
 if(mode==='neve'&&!k.some(c=>Number.isFinite(c.snowfall)))return 'Quantità di neve non disponibili. '+(k.some(c=>isSnow(c.weather_code))?'I simboli indicano neve prevista, senza centimetri.':'Nessun simbolo neve nel campione: non esclude neve altrove.');
 if(mode==='pioggia'&&!k.some(c=>Number.isFinite(c.precipitation)))return 'Quantità di pioggia non disponibili nei punti. Apri il radar per vedere la copertura delle precipitazioni.';
 if(mode==='pioggia'&&!k.some(c=>c.precipitation>0))return `Pioggia non indicata nei ${n} punti disponibili. Non esclude pioggia tra le località: consulta il radar.`;
 if(mode==='fulmini'&&!k.some(c=>isStorm(c.weather_code)))return `Temporali non indicati nei ${n} punti disponibili. Non è una rete di rilevamento dei fulmini.`;
 return `${n} località con dati nella vista. Campione di punti, non copertura continua. Tocca un nome per il meteo locale.`;
}
