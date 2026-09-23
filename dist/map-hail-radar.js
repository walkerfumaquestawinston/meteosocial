// POH data and this derived rendering: Radar-DPC, CC BY-SA 4.0.
// GeoTIFF 2.1.3 (MIT), Proj4js 2.22.0 (MIT) are loaded only on demand.
let libraries;
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('Libreria radar non disponibile'));};document.head.append(script);});}
async function readers(){if(!libraries)libraries=Promise.all([window.GeoTIFF?null:loadScript('/assets/geotiff.js'),window.proj4?null:loadScript('/assets/proj4.js')]).catch(e=>{libraries=null;throw e});await libraries;return {GeoTIFF:window.GeoTIFF,proj4:window.proj4};}
export function hailColor(value){
 if(!Number.isFinite(value)||value<0||value>1)return [0,0,0,0];
 if(value<.1)return [0,0,0,0];
 return value<.3?[255,205,80,155]:value<.5?[249,139,61,180]:value<.8?[222,61,91,205]:[160,44,185,225];
}
export function validateHailImage(image){
 const k=image.getGeoKeys(),box=image.getBoundingBox(),w=image.getWidth(),h=image.getHeight();
 if(k.GTModelTypeGeoKey!==1||k.GTRasterTypeGeoKey!==1||k.GeographicTypeGeoKey!==4326||k.ProjCoordTransGeoKey!==1||k.ProjLinearUnitsGeoKey!==9001||k.ProjNatOriginLongGeoKey!==12.5||k.ProjNatOriginLatGeoKey!==42||w!==1200||h!==1400||box.some((v,i)=>Math.abs(v-[-600000,-750000,600000,650000][i])>1))throw Error('Griglia POH non riconosciuta');
 return {box,w,h};
}
export async function renderHailImage(buffer){
 const {GeoTIFF,proj4}=await readers(),tiff=await GeoTIFF.fromArrayBuffer(buffer),image=await tiff.getImage(),grid=validateHailImage(image);
 const values=(await image.readRasters({samples:[0]}))[0];
 if(values.some(v=>Number.isFinite(v)&&v>1))throw Error('Scala POH non riconosciuta');
 const transform=proj4('EPSG:3857','+proj=tmerc +lat_0=42 +lon_0=12.5 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
 // Exact inverse projection for every output pixel; never stretch the native grid.
 const bounds=[[34.5,3.5],[48.5,22]],sw=proj4('EPSG:4326','EPSG:3857',[3.5,34.5]),ne=proj4('EPSG:4326','EPSG:3857',[22,48.5]);
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=Math.round(1000*(ne[1]-sw[1])/(ne[0]-sw[0]));
 const context=canvas.getContext('2d'),pixels=context.createImageData(canvas.width,canvas.height);
 for(let y=0;y<canvas.height;y++){
  for(let x=0;x<canvas.width;x++){
   const p=transform.forward([sw[0]+(x+.5)/canvas.width*(ne[0]-sw[0]),ne[1]-(y+.5)/canvas.height*(ne[1]-sw[1])]);
   const col=Math.floor((p[0]-grid.box[0])/1000),row=Math.floor((grid.box[3]-p[1])/1000);
   if(col>=0&&col<grid.w&&row>=0&&row<grid.h)pixels.data.set(hailColor(values[row*grid.w+col]),(y*canvas.width+x)*4);
  }
  if(y%80===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 context.putImageData(pixels,0,0);
 return {url:canvas.toDataURL('image/png'),bounds};
}
export function createHailRadar({L,map,onChange,fetcher=fetch,renderer=renderHailImage}){
 let alive=true,enabled=false,status='idle',time=null,layer=null,busy=null,checkedAt=0;
 const abort=new AbortController(),snapshot=()=>({enabled,status,time:time?time/1000:null,frames:time?[{time:time/1000}]:[],index:0,playing:false,age:time?Math.max(0,Math.floor((Date.now()-time)/60000)):null,source:'dpc'});
 const emit=()=>{if(alive)onChange(snapshot());};
 const remove=()=>{if(layer){map.removeLayer(layer);layer=null;}};
 async function refresh(force=false){
  if(!alive||!enabled)return;if(busy)return busy;if(!force&&layer&&Date.now()-checkedAt<60000){emit();return;}
  status='loading';emit();
  busy=(async()=>{try{
   const r=await fetcher('/api/maps/hail-radar',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(45000)])});
   if(!r.ok)throw Error();const next=Number(r.headers.get('X-Radar-Time'));
   if(!next||next>Date.now()+60000||Date.now()-next>1800000)throw Error();
   if(next===time&&layer){checkedAt=Date.now();status='ready';emit();return;}
   const size=Number(r.headers.get('Content-Length'));if(size>4000000)throw Error();
   const bytes=await r.arrayBuffer();if(bytes.byteLength>4000000)throw Error();
   const rendered=await renderer(bytes);if(!alive||!enabled)return;
   remove();time=next;checkedAt=Date.now();layer=L.imageOverlay(rendered.url,rendered.bounds,{pane:'atlas-hail-radar',interactive:false,opacity:1}).addTo(map);status='ready';emit();
  }catch{if(alive){remove();time=null;status='error';emit();}}finally{busy=null;}})();return busy;
 }
 function setEnabled(value){enabled=!!value;if(!enabled){remove();emit();}else refresh();}
 map.createPane('atlas-hail-radar').style.zIndex=350;
 return {setEnabled,refresh,snapshot,seek(){},play(){},pause(){},dispose(){alive=false;enabled=false;abort.abort();remove();}};
}
