export const HAIL_SIZE_LABELS={unknown:'Non so stimarla',under1:'Meno di 1 cm', '1to2':'Da 1 a 2 cm','2to4':'Da 2 a 4 cm',over4:'Oltre 4 cm'};
export const hailObserved=p=>Number.isFinite(p.observed)?p.observed:p.created;
export function hailReportState(p){return p.ended?'L’autore riferisce: ha smesso':p.disputes>0?'Osservazione contestata':'Osservazione da verificare'}
export function sharedHailURL(origin,place){
 if(!place||typeof place.name!=='string'||!place.name.trim()||!Number.isFinite(place.latitude)||!Number.isFinite(place.longitude)||Math.abs(place.latitude)>85||Math.abs(place.longitude)>180)return null;
 const u=new URL('/',origin);u.search=new URLSearchParams({hailCity:place.name.slice(0,80),hailLat:(Math.round(place.latitude*100)/100).toFixed(2),hailLon:(Math.round(place.longitude*100)/100).toFixed(2)}).toString();u.hash='grandine-mappa';return u.href;
}
export function sharedHailPlace(href){
 try{const u=new URL(href),p=u.searchParams;if(u.hash!=='#grandine-mappa'||!p.get('hailCity')||!p.get('hailLat')||!p.get('hailLon'))return null;const place={name:p.get('hailCity').trim().slice(0,80),latitude:Number(p.get('hailLat')),longitude:Number(p.get('hailLon')),source:'shared-area'};return sharedHailURL(u.origin,place)?place:null}catch{return null}
}
