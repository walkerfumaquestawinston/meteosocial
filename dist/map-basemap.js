// Only a restricted browser map key is accepted here, never a server credential.
export function mapTilerURL(config,phase='giorno'){
 if(!config?.enabled||!/^[A-Za-z0-9_-]{8,100}$/.test(config.key||'')||!/^[a-zA-Z0-9_-]{1,100}$/.test(config.style||''))return null;
 const style=phase==='notte'?'dataviz-v4-dark':config.style;
 return 'https://api.maptiler.com/maps/'+style+'/{z}/{x}/{y}.png?key='+encodeURIComponent(config.key);
}
export function createMapTilerBase({L,map,config,phase='giorno',onReady,onFailure}){
 let url=mapTilerURL(config,phase);if(!url)return null;
 let disposed=false,ready=false,errors=0;
 const layer=L.tileLayer(url,{tileSize:512,zoomOffset:-1,minZoom:1,maxZoom:19,crossOrigin:true,keepBuffer:2,updateWhenIdle:true,zIndex:210});
 const fail=()=>{if(disposed)return;dispose();onFailure();};
 const loaded=()=>{errors=0;if(!ready&&!disposed){ready=true;clearTimeout(timer);onReady();}};
 const error=()=>{if(++errors>=3)fail();};
 let timer=setTimeout(fail,15000);
 function dispose(){if(disposed)return;disposed=true;clearTimeout(timer);layer.off('tileload',loaded);layer.off('tileerror',error);if(map.hasLayer(layer))map.removeLayer(layer);}
 layer.on('tileload',loaded).on('tileerror',error).addTo(map);
 function setPhase(next){const nextURL=mapTilerURL(config,next);if(disposed||nextURL===url)return;url=nextURL;ready=false;errors=0;clearTimeout(timer);timer=setTimeout(fail,15000);layer.setUrl(url);}
 return {dispose,layer,setPhase};
}
