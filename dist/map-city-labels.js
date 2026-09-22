// Geography remains useful when a weather provider is unavailable.
import {validPlace} from './map-weather-core.js';

export function cityCatalog(weather, catalog, towns, selected) {
  const result=[];
  const aliases={rome:'roma',london:'londra',paris:'parigi',berlin:'berlino',athens:'atene',cairo:'il cairo',beijing:'pechino',lisbon:'lisbona',vienna:'vienna'};
  const key=p=>{const name=p.name?.toLocaleLowerCase();return aliases[name]||name;};
  const same=(a,b)=>key(a)===key(b)&&Math.abs(a.latitude-b.latitude)<.08&&Math.abs(a.longitude-b.longitude)<.08;
  for(const p of [...weather,...catalog,...towns.map(c=>({name:c[1],province:c[2],country_code:'IT',latitude:c[3],longitude:c[4],population:c[5]}))]){
    if(!validPlace(p)||typeof p.name!=='string')continue;
    const existing=result.find(q=>same(p,q));
    if(!existing)result.push({...p});else if(p.localized)existing.name=p.name;
  }
  if(validPlace(selected)&&selected.name){const i=result.findIndex(p=>same(p,selected));const previous=i<0?{}:result.splice(i,1)[0];result.unshift({...previous,...selected,current:selected.current||previous.current,selected:true});}
  return result;
}

export function weatherAge(current, now=Date.now()) {
  if(typeof current?.time!=='string')return {stale:false,label:'Orario non disponibile'};
  const raw=current.time;const at=Date.parse(/(Z|[+-]\d\d:\d\d)$/.test(raw)?raw:raw+'Z');
  if(!Number.isFinite(at))return {stale:false,label:'Orario non disponibile'};
  const minutes=Math.max(0,Math.floor((now-at)/60000));
  const hours=Math.floor(minutes/60),days=Math.floor(minutes/1440);
  return {stale:minutes>120,label:minutes<60?`${minutes} min fa`:minutes<1440?`${hours} ${hours===1?'ora':'ore'} fa`:`${days} ${days===1?'giorno':'giorni'} fa`};
}

const overlaps=(a,b,gap=5)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
export function arrangeCityLabels(candidates, viewport, reserved=[],limit=80) {
  const placed=[],occupied=[...reserved];
  const ranked=candidates.filter(c=>Number.isFinite(c.x)&&Number.isFinite(c.y)&&Number.isFinite(c.width)&&c.width>0)
    .map((c,i)=>({...c,order:i})).sort((a,b)=>Number(!!b.selected)-Number(!!a.selected)||(b.priority||0)-(a.priority||0)||a.order-b.order);
  for(const p of ranked){
    if(p.x<0||p.x>viewport.width||p.y<0||p.y>viewport.height)continue;
    const h=Number.isFinite(p.height)?Math.max(44,Math.min(70,p.height)):44,w=Math.min(p.width,210);
    const offsets=[[8,-22],[-w-8,-22],[-w/2,-h-10],[-w/2,10]];
    for(const [dx,dy] of offsets){
      const box={left:p.x+dx,right:p.x+dx+w,top:p.y+dy,bottom:p.y+dy+h};
      if(box.left<6||box.top<6||box.right>viewport.width-6||box.bottom>viewport.height-6||occupied.some(b=>overlaps(box,b)))continue;
      placed.push({...p,dx,dy,width:w,height:h,box});occupied.push(box);break;
    }
    if(placed.length>=limit)break;
  }
  return placed;
}
