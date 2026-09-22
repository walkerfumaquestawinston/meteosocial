// Public Radar-DPC POH. Fixed endpoints, bounded responses, no credentials.
let dpcHailCached=null,dpcHailPending=null;
async function dpcHailFetch(url,options={}){
 const response=await fetch(url,{...options,headers:{Origin:'https://scudo-meteo-community.walkerthehate.chatgpt.site',...options.headers},signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!response.ok)throw Error('Radar-DPC non disponibile');return response;
}
function dpcHailDownloadURL(value){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.hostname!=='s3-prod-dpc-radar.s3.eu-south-1.amazonaws.com'||url.port||url.username||url.password||!/^\/POH\/\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.tif$/.test(url.pathname))throw Error('Prodotto POH non valido');
 return url.href;
}
async function dpcHailProduct(req){
 if(req.method!=='GET')return json({error:'Solo lettura.'},405);
 const now=Date.now();
 if(!dpcHailCached||now-dpcHailCached.checkedAt>60000){
  if(!dpcHailPending)dpcHailPending=(async()=>{
   const metadata=await(await dpcHailFetch('https://radar-api.protezionecivile.it/findLastProductByType?type=POH')).json();
   const product=metadata.lastProducts?.find(p=>p.productType==='POH'),time=product?.time;
   if(!Number.isFinite(time)||time> Date.now()+60000||Date.now()-time>1800000)throw Error('Il quadro POH non è recente');
   if(dpcHailCached?.time===time){dpcHailCached.checkedAt=Date.now();return;}
   const download=await(await dpcHailFetch('https://radar-api.protezionecivile.it/downloadProduct',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productType:'POH',productDate:time})})).json();
   const raw=await dpcHailFetch(dpcHailDownloadURL(download.url));
   if(Number(raw.headers.get('Content-Length'))>4000000)throw Error('Prodotto troppo grande');
   const reader=raw.body.getReader(),chunks=[];let size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4000000)throw Error('Prodotto troppo grande');chunks.push(value);}}finally{await reader.cancel();}
   const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.length;}
   if(size<8||!((bytes[0]===73&&bytes[1]===73)||(bytes[0]===77&&bytes[1]===77)))throw Error('Formato radar non valido');
   dpcHailCached={time,checkedAt:Date.now(),bytes};
  })().finally(()=>{dpcHailPending=null;});
  try{await dpcHailPending;}catch{return json({error:'Radar grandine temporaneamente non disponibile. Riprova.',source:'Radar-DPC'},503);}
 }
 if(Date.now()-dpcHailCached.time>1800000)return json({error:'Il quadro radar grandine non è recente.'},503);
 return new Response(dpcHailCached.bytes,{headers:{'Content-Type':'image/tiff','Cache-Control':'public,max-age=60','X-Radar-Time':String(dpcHailCached.time),'X-Radar-Source':'Radar-DPC POH','X-Content-Type-Options':'nosniff'}});
}
