// Only a restricted browser map key is accepted here, never a server credential.
export function mapTilerURL(config){
 if(!config?.enabled||!/^[A-Za-z0-9_-]{8,100}$/.test(config.key||'')||!/^[a-zA-Z0-9_-]{1,100}$/.test(config.style||''))return null;
 return 'https://api.maptiler.com/maps/'+config.style+'/{z}/{x}/{y}.png?key='+encodeURIComponent(config.key);
}
export function createMapTilerBase({L,map,config,onReady,onFailure}){
 const url=mapTilerURL(config);if(!url)return null;
 let disposed=false,ready=false,errors=0;
 const layer=L.tileLayer(url,{tileSize:512,zoomOffset:-1,minZoom:1,maxZoom:19,crossOrigin:true,keepBuffer:2,updateWhenIdle:true,zIndex:210});
 const fail=()=>{if(disposed)return;dispose();onFailure();};
 const loaded=()=>{errors=0;if(!ready&&!disposed){ready=true;clearTimeout(timer);onReady();}};
 const error=()=>{if(++errors>=3)fail();};
 const timer=setTimeout(fail,15000);
 function dispose(){if(disposed)return;disposed=true;clearTimeout(timer);layer.off('tileload',loaded);layer.off('tileerror',error);if(map.hasLayer(layer))map.removeLayer(layer);}
 layer.on('tileload',loaded).on('tileerror',error).addTo(map);
 return {dispose,layer};
}
