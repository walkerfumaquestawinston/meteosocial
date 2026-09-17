// A bounded, attributed catalogue. "Open" is the provider's status, not a live sensor.
async function globeEvents(url,env){
 const cache=optionalPublicCache(),key=new Request(url.origin+'/api/atlas/events?schema=2');const hit=await cache?.match(key);if(hit)return hit;
 const load=async()=>{let data;try{data=await atmoFetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300',6000000)}catch{fail(503,'Il catalogo NASA degli eventi non è disponibile.');}
 if(!Array.isArray(data?.events))fail(503,'Il catalogo degli eventi non è leggibile.');
 const kinds={wildfires:['Incendio','♨','#ffbd87'],severeStorms:['Tempesta','ϟ','#dac0ff'],floods:['Alluvione','≈','#8dd8ff'],volcanoes:['Vulcano','▲','#ffb18f'],seaLakeIce:['Ghiaccio','❄','#bceeff'],dustHaze:['Polvere e foschia','≋','#e6d6a8'],drought:['Siccità','☀','#ffe0a1'],landslides:['Frana','▲','#d8c4ab'],snow:['Neve','❄','#bceeff'],tempExtremes:['Temperature estreme','°','#ffbec1'],earthquakes:['Terremoto','≋','#d6baf5'],waterColor:['Colore delle acque','≈','#a9e4ed'],manmade:['Evento segnalato','!','#dddddd']};
 const now=Date.now(),events=[];
 for(const e of data.events.slice(0,300)){
  if(!e||e.closed!==null||typeof e.id!=='string'||!/^EONET_[\w-]+$/.test(e.id))continue;
  const g=(Array.isArray(e.geometry)?e.geometry:[]).filter(g=>g&&g.type==='Point'&&Array.isArray(g.coordinates)&&g.coordinates.length>=2&&g.coordinates.slice(0,2).every(Number.isFinite)&&Math.abs(g.coordinates[0])<=180&&Math.abs(g.coordinates[1])<=90&&Number.isFinite(Date.parse(g.date))&&Date.parse(g.date)<=now+600000).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0];if(!g)continue;
  const category=(Array.isArray(e.categories)?e.categories:[]).map(c=>c?.id).find(id=>kinds[id]),[value,icon,color]=kinds[category]||['Evento naturale','!','#c5d6e2'];
  const dates=e.geometry.map(g=>Date.parse(g?.date)).filter(t=>Number.isFinite(t)&&t<=now+600000),started=dates.length?Math.min(...dates):Date.parse(g.date);
  events.push({started,categoryId:category,catalogAt:now,id:e.id,name:clean(e.title,100)||value,latitude:g.coordinates[1],longitude:g.coordinates[0],at:Date.parse(g.date),value,icon,color:'#ff5a47',detail:'Ultima posizione nel catalogo; non una rilevazione istantanea.',link:'https://eonet.gsfc.nasa.gov/api/v3/events/'+encodeURIComponent(e.id)});
 }
 return {events,updated:now,source:'NASA EONET',truncated:data.events.length>=300};};
 const data=env?.DB?await globeSnapshot(env,'events-v2',load):await load();
 const result=new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','Cache-Control':data.stale?'no-store':'public,max-age=900'}});if(cache&&!data.stale)await cache.put(key,result.clone());return result;
}
