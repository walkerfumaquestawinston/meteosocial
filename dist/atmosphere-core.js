// Shared, deterministic time and geometry helpers. No AI decides alert severity.
export function solarPosition(date=new Date()){
 const day=(date-Date.UTC(date.getUTCFullYear(),0,1))/86400000;
 const gamma=2*Math.PI/365*(day-1+(date.getUTCHours()-12)/24);
 const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 return {latitude:decl*180/Math.PI,longitude:((180-(date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60+eq)/4+540)%360)-180};
}
export function nextRain(weather){
 const h=weather?.hourly,c=weather?.current;
 if(!h?.time||!c?.time)return {title:'Orario non disponibile',detail:'Attendi una previsione aggiornata.'};
 const offset=Number(weather.utc_offset_seconds)||0,at=Date.parse(c.time+'Z')-offset*1000;
 if(!Number.isFinite(at)||Date.now()-at>5400000||at-Date.now()>900000)return {title:'Previsioni da aggiornare',detail:'Ricarica il meteo prima di scegliere un orario.'};
 const start=h.time.findIndex(t=>t>=c.time.slice(0,13)+':00');
 if(start<0)return {title:'Orario non disponibile',detail:'La fonte non contiene le prossime ore.'};
 if(Number(c.precipitation)>.1)return {title:'Pioggia nel modello attuale',detail:'Confronta il radar e le testimonianze della zona.'};
 for(let i=start;i<Math.min(start+24,h.time.length);i++)if((Number.isFinite(h.precipitation_probability?.[i])&&h.precipitation_probability[i]>=40)||(Number.isFinite(h.precipitation?.[i])&&h.precipitation[i]>=.2))return {title:'Pioggia possibile dalle '+h.time[i].slice(11,16),detail:h.time[i].slice(0,10)+' · '+(Number.isFinite(h.precipitation_probability?.[i])?h.precipitation_probability[i]+'% · ':'')+'previsione oraria, non countdown al minuto.'};
 const complete=h.time.slice(start,start+24).filter((_,n)=>Number.isFinite(h.precipitation_probability?.[start+n])&&Number.isFinite(h.precipitation?.[start+n])).length;
 if(complete<24)return {title:'Dati pioggia incompleti',detail:'Il modello non copre tutte le prossime 24 ore. Consulta radar e previsioni.'};
 return {title:'Pioggia poco probabile',detail:'Nelle prossime 24 ore, secondo il modello. Non esclude rovesci locali.'};
}
export function pointInRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(!a||!b)continue;const cross=(a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0];if(cross)inside=!inside}return inside}
export function pointInGeometry(lon,lat,geometry){const polygons=geometry?.type==='Polygon'?[geometry.coordinates]:geometry?.type==='MultiPolygon'?geometry.coordinates:[];return polygons.some(rings=>rings.length&&pointInRing(lon,lat,rings[0])&&!rings.slice(1).some(r=>pointInRing(lon,lat,r)))}
export function decodeTopology(topology){
 if(topology?.type!=='Topology'||!Array.isArray(topology.arcs)||topology.arcs.length>50000)throw Error('Geografia non valida');
 const cache=new Map(),tr=topology.transform;
 const arc=id=>{const index=id<0?~id:id;if(!cache.has(index)){let x=0,y=0;const a=topology.arcs[index];if(!a)throw Error('Arco mancante');cache.set(index,a.map(p=>{if(!tr)return p;x+=p[0];y+=p[1];return [x*tr.scale[0]+tr.translate[0],y*tr.scale[1]+tr.translate[1]]}))}const a=cache.get(index);return id<0?[...a].reverse():a};
 const ring=ids=>ids.flatMap((id,i)=>i?arc(id).slice(1):arc(id));
 return Object.values(topology.objects||{}).flatMap(o=>o.geometries||[]).filter(g=>['Polygon','MultiPolygon'].includes(g.type)).map(g=>({type:g.type,coordinates:g.type==='Polygon'?g.arcs.map(ring):g.arcs.map(p=>p.map(ring)),properties:g.properties||{}}));
}
export function alertLevel(properties){const text=Object.entries(properties||{}).filter(([k])=>k==='Rappresentata nella mappa'||k.startsWith('Per rischio')).map(([,v])=>v).join(' ').toLowerCase();return /rossa|elevata/.test(text)?3:/arancione|moderata/.test(text)?2:/gialla|ordinaria/.test(text)?1:/nessuna allerta/.test(text)?0:null}
export function safeTone(alert,current){if(alert?.mode==='EMERGENCY')return 'EMERGENCY';if(alert?.mode==='CAUTION'||Number(current?.weather_code)>=95||Number(current?.wind_gusts_10m)>=80||Number(current?.temperature_2m)>=38)return 'CAUTION';return alert?.mode==='NORMAL'?'NORMAL':'UNKNOWN'}
