// Authenticated upstream calls stay on the server. No token enters a tile URL.
const rainbowRainPending=new Map();
async function rainbowRainBudget(env,product){
 const tiles=product==='tiles';
 await quota(env,'rainbow',product+'-calls',tiles?1500:100);
 const key='rainbow-'+product+'-month:'+new Date().toISOString().slice(0,7);
 const row=await q(env,'INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',key).first();
 if(row.count>(tiles?30000:5000))fail(429,'Limite di protezione Rainbow raggiunto.');
}
async function rainbowRainRequest(env,path,product){
 if(!env.RAINBOW_API_KEY)fail(503,'Rainbow non configurato.');
 await rainbowRainBudget(env,product);
 let r;try{r=await fetch('https://api.rainbow.ai'+path,{headers:{'Ocp-Apim-Subscription-Key':env.RAINBOW_API_KEY.trim()},redirect:'manual',signal:AbortSignal.timeout(12000)});}catch{fail(503,'Rainbow temporaneamente non disponibile.');}
 if(!r.ok)fail(r.status===429?429:503,[401,403].includes(r.status)?'Accesso Rainbow non disponibile per questo prodotto.':r.status===404?'Dati Rainbow non disponibili per questa zona o questo quadro.':r.status===429?'Quota Rainbow temporaneamente esaurita.':'Rainbow temporaneamente non disponibile.');
 return r;
}
function normalizeRainbowNowcast(raw,place,now=Date.now()){
 if(!Number.isFinite(raw?.latitude)||!Number.isFinite(raw?.longitude)||Math.abs(raw.latitude-place.latitude)>.1||Math.abs(raw.longitude-place.longitude)>.1)throw Error('Località nowcast non corrispondente');
 if(!Array.isArray(raw.forecast)||!raw.forecast.length||raw.forecast.length>300)throw Error('Nowcast assente');
 let end=0;
 const points=raw.forecast.map(p=>{
  const start=p.timestampBegin*1000,until=p.timestampEnd*1000;
  if(!Number.isFinite(start)||!Number.isFinite(until)||start<end||until-start!==60000||start<now-3600000||until>now+5*3600000||!Number.isFinite(p.precipRate)||p.precipRate<0||!['no_precipitation','rain','snow','mixed'].includes(p.precipType))throw Error('Nowcast non valido');
  end=until;return {start,end:until,rate:p.precipRate,type:p.precipType};
 });
 if(!points.some(p=>p.start<=now&&now<p.end))throw Error('Nowcast corrente assente');
 return {source:'Rainbow Weather',sourceURL:'https://developer.rainbow.ai/',kind:'nowcast',unit:'mm/h',checkedAt:now,issuedAt:null,timezone:rainbowTimezone(place.latitude,place.longitude),points};
}
async function rainbowRainSingle(key,fn){
 if(rainbowRainPending.has(key))return rainbowRainPending.get(key);
 const task=fn().finally(()=>rainbowRainPending.delete(key));rainbowRainPending.set(key,task);return task;
}
async function rainbowRainSnapshot(env){
 const d=await rainbowRainSingle('snapshot',()=>globeSnapshot(env,'rainbow-rain-snapshot-v1',async()=>{
  const r=await rainbowRainRequest(env,'/tiles/v1/snapshot?layer=precip-global','tiles'),d=await r.json();
  if(!Number.isInteger(d.snapshot)||d.snapshot%600!==0||d.snapshot*1000>Date.now()+60000||Date.now()-d.snapshot*1000>1800000)fail(503,'Quadro Rainbow non recente.');
  return {snapshot:d.snapshot,checkedAt:Date.now()};
 },300000));
 if(d.stale||Date.now()-d.snapshot*1000>1800000)fail(503,'Quadro Rainbow non recente.');
 return d;
}
async function rainbowRainApi(req,env,url){
 if(req.method!=='GET')fail(405,'Servizio di sola lettura.');
 if(!env.RAINBOW_API_KEY)fail(503,'Rainbow non configurato.');
 if(url.pathname==='/api/rainbow/nowcast'){
  const place=forecastLocation(url),key='rainbow-nowcast-v1:'+place.key;
  const d=await rainbowRainSingle(key,()=>globeSnapshot(env,key,async()=>{
   const r=await rainbowRainRequest(env,`/nowcast/v1/precip-global/${place.longitude}/${place.latitude}`,'nowcast');
   const text=await r.text();if(text.length>150000)fail(503,'Nowcast non valido.');
   return normalizeRainbowNowcast(JSON.parse(text),place);
  },300000));
  if(d.stale||Date.now()-d.checkedAt>900000||!d.points.some(p=>p.start<=Date.now()&&Date.now()<p.end))fail(503,'Nowcast precedente: attendi un aggiornamento.');
  return json(d);
 }
 if(url.pathname==='/api/rainbow/snapshot')return json({...await rainbowRainSnapshot(env),source:'Rainbow Weather',layer:'precip-global',step:600,horizon:14400});
 const m=/^\/api\/rainbow\/tile\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)\.png$/.exec(url.pathname);
 if(!m)fail(404,'Quadro non trovato.');
 const [stamp,offset,z,x,y]=m.slice(1).map(Number);
 if(![stamp,offset,z,x,y].every(Number.isSafeInteger)||stamp%600||offset%600||offset>14400||z>10||x>=2**z||y>=2**z||stamp*1000>Date.now()+60000||Date.now()-stamp*1000>3*3600000)fail(400,'Quadro non valido.');
 const latest=await rainbowRainSnapshot(env);
 if(stamp>latest.snapshot||stamp<latest.snapshot-7200||(stamp!==latest.snapshot&&offset!==0))fail(400,'Quadro fuori intervallo.');
 const cache=optionalPublicCache(),cacheKey=new Request(url.origin+url.pathname),hit=await cache.match(cacheKey);if(hit)return hit;
 return rainbowRainSingle(url.pathname,async()=>{
  const r=await rainbowRainRequest(env,`/tiles/v1/precip-global/${stamp}/${offset}/${z}/${x}/${y}?color=0&coverage=1`,'tiles');
  const bytes=new Uint8Array(await r.arrayBuffer());
  if(bytes.length>1000000||bytes.length<8||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))fail(503,'Immagine Rainbow non valida.');
  const response=new Response(bytes,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=1800','X-Content-Type-Options':'nosniff'}});
  await cache.put(cacheKey,response.clone());return response;
 }).then(r=>r.clone());
}
