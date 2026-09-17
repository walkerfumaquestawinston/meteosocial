// Isolated renderer: removing this iframe stops its runtime and Google requests.
const root=document.querySelector('#google-map-root');
const params=new URLSearchParams(location.hash.slice(1));
const initial={lat:Number(params.get('lat')),lng:Number(params.get('lng')),altitude:0};
let map=null,failed=false,started=false,selecting=false;
let selected={...initial};
let modes=null;
let markerClass=null,pinClass=null,markerLibrary=null,conditionMarkers=[],markerRevision=0;
function clearConditions(){for(const item of conditionMarkers)item.marker.remove();conditionMarkers=[]}
async function drawConditions(records){
 const rev=++markerRevision;
 try{
  if(!markerClass||!pinClass){markerLibrary||=Promise.all([google.maps.importLibrary('maps3d'),google.maps.importLibrary('marker')]);const [lib,pin]=await markerLibrary;markerClass=lib.Marker3DInteractiveElement;pinClass=pin.PinElement}
  if(rev!==markerRevision||failed)return;
  if(!markerClass||!pinClass)throw Error('Simboli non supportati');
  const rows=Array.isArray(records)?records.slice(0,650).filter(r=>r&&typeof r.id==='string'&&r.id.length<=100&&pointOf({lat:r.latitude,lng:r.longitude})&&typeof r.label==='string'&&typeof r.icon==='string'&&/^#[a-f0-9]{6}$/i.test(r.color)):[];
  clearConditions();
  for(const r of rows){
   const marker=new markerClass({position:{lat:r.latitude,lng:r.longitude,altitude:0},altitudeMode:'CLAMP_TO_GROUND',label:r.label.slice(0,160),title:r.label.slice(0,160),sizePreserved:true,drawsWhenOccluded:false,collisionBehavior:'OPTIONAL_AND_HIDES_LOWER_PRIORITY',zIndex:Math.min(5,Math.max(0,r.priority||0))});
   marker.append(new pinClass({background:r.color,borderColor:'#123c55',glyphColor:'#102c45',glyphText:r.icon.slice(0,4),scale:1.35}));
   marker.addEventListener('gmp-click',e=>{e.stopPropagation();e.preventDefault();report('condition',{id:r.id})});
   map.append(marker);conditionMarkers.push({id:r.id,marker,point:r});
  }
 }catch{markerLibrary=null;if(rev===markerRevision){clearConditions();report('conditions-error')}}
}
function pointOf(p){const latitude=typeof p?.lat==='function'?p.lat():p?.lat,longitude=typeof p?.lng==='function'?p.lng():p?.lng;return Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180?{latitude,longitude}:null}
const report=(state,extra={})=>parent.postMessage({type:'meteosocial-google-view',state,...extra},location.origin);
function error(){if(failed)return;failed=true;root.replaceChildren();root.textContent='Google 3D non disponibile.';report('error')}
window.gm_authFailure=error;
function loadLibrary(key){return new Promise((resolve,reject)=>{
 const script=document.createElement('script'),timeout=setTimeout(()=>reject(Error('Timeout')),20000);
 window.meteosocialGoogleReady=()=>{clearTimeout(timeout);resolve()};
 script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
 script.onerror=()=>{clearTimeout(timeout);reject(Error('Google non raggiungibile'))};
 script.src='https://maps.googleapis.com/maps/api/js?'+new URLSearchParams({key,loading:'async',libraries:'maps3d',v:'weekly',language:'it',callback:'meteosocialGoogleReady',auth_referrer_policy:'origin'});
 document.head.append(script);
})}
async function start(){
 if(started||parent===window||!params.has('lat')||!params.has('lng')||!Number.isFinite(initial.lat)||!Number.isFinite(initial.lng)||Math.abs(initial.lat)>90||Math.abs(initial.lng)>180)return error();started=true;
 try{
  const response=await fetch('/api/maps/google3d',{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Vista non attiva');const config=await response.json();
  if(config.enabled!==true||!/^AIza[\w-]{35}$/.test(config.key||''))throw Error('Configurazione incompleta');
  await loadLibrary(config.key);if(failed)return;
  const {Map3DElement,MapMode,GestureHandling}=await google.maps.importLibrary('maps3d');if(failed)return;
  modes=MapMode;const world=params.get('world')==='1';
  map=new Map3DElement({center:initial,range:world?20000000:12000,tilt:world?0:55,heading:0,mode:MapMode.HYBRID,gestureHandling:GestureHandling.COOPERATIVE,defaultUIHidden:params.get('compact')==='1',description:'Globo satellite interattivo. Esplora con i gesti o con i comandi esterni.'});
  map.addEventListener('gmp-error',error);
  map.addEventListener('gmp-steadychange',e=>{if(e.isSteady&&!failed)report('ready')});
  // Prevent opening POI popovers or invoking extra Places services.
  map.addEventListener('gmp-click',e=>{e.preventDefault();if(!selecting||failed)return;const point=pointOf(e.position);if(point){selecting=false;report('point',{point})}});
  root.replaceChildren(map);
 }catch{error()}
}
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='meteosocial-google-command'||!map||failed)return;
 if(e.data.action==='in')map.range=Math.max(100,(map.range||12000)/1.5);
 if(e.data.action==='out')map.range=Math.min(20000000,(map.range||12000)*1.5);
 if(e.data.action==='center'){map.center=selected;map.range=12000;map.tilt=55}
 if(e.data.action==='world'){map.range=20000000;map.tilt=0;map.heading=0}
 if(e.data.action==='flat')map.tilt=0;
 if(e.data.action==='relief'){map.range=Math.min(map.range||12000,40000);map.tilt=55}
 if(e.data.action==='north')map.heading=0;
 if(e.data.action==='labels'&&typeof e.data.enabled==='boolean')map.mode=e.data.enabled?modes.HYBRID:modes.SATELLITE;
 if(e.data.action==='select'&&typeof e.data.enabled==='boolean')selecting=e.data.enabled;
 if(e.data.action==='place'){const p=e.data.point;if(!p||typeof p.latitude!=='number'||typeof p.longitude!=='number')return;const valid=pointOf({lat:p.latitude,lng:p.longitude});if(!valid)return;selected={lat:valid.latitude,lng:valid.longitude,altitude:0};if(e.data.center===true){map.center=selected;map.range=12000;map.tilt=55}}
 if(e.data.action==='point'){const point=pointOf(map.center);if(point)report('point',{point})}
 if(e.data.action==='conditions')drawConditions(e.data.markers);
 if(e.data.action==='focus-condition'){const item=conditionMarkers.find(m=>m.id===e.data.id);if(item){map.center={lat:item.point.latitude,lng:item.point.longitude,altitude:0};map.range=Math.min(map.range||120000,120000);map.tilt=0}}
});
start();
