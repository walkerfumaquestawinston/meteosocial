// Radar is an observed composite, never a forecast or a hail detector.
export function atlasRadarFrames(data, now = Date.now()) {
  const host = new URL(data?.host);
  if (host.protocol !== 'https:' || host.username || host.password || host.port || !/(^|\.)rainviewer\.com$/.test(host.hostname)) throw Error('Fonte radar non valida');
  const frames = (Array.isArray(data.radar?.past) ? data.radar.past : [])
    .filter(f => Number.isFinite(f.time) && f.time > 0 && f.time <= now / 1000 && /^\/v2\/radar\/[\w/-]+$/.test(f.path))
    .sort((a,b) => a.time-b.time);
  const last = frames.at(-1)?.time;
  return frames.filter((f,i) => f.time >= last-7200 && (!i || frames[i-1].time !== f.time))
    .map(f => ({time:f.time,url:host.origin+f.path+'/256/{z}/{x}/{y}/2/1_1.png'}));
}

export function createAtlasRadar({L,map,onChange,fetcher=fetch}) {
  let alive=true,enabled=false,frames=[],index=0,layer=null,timer=0,playing=false,status='idle',loadedAt=0,busy=null,tileErrors=0;
  const abort=new AbortController();
  const snapshot=()=>({enabled,frames,index,playing,status,time:frames[index]?.time||null,age:frames.length?Math.max(0,Math.round((Date.now()/1000-frames.at(-1).time)/60)):null});
  const emit=()=>{if(alive)onChange(snapshot());};
  function pause(){playing=false;clearTimeout(timer);emit();}
  function remove(){if(layer){layer.off();map.removeLayer(layer);layer=null;}}
  function show(){
    remove();if(!alive||!enabled||!frames.length){emit();return;}
    tileErrors=0;status='tiles';
    const current=L.tileLayer(frames[index].url,{pane:'atlas-radar',opacity:.72,maxNativeZoom:7,maxZoom:16,tileSize:256,crossOrigin:true,keepBuffer:1,updateWhenIdle:true});
    layer=current;
    current.on('tileerror',()=>{if(alive&&enabled&&layer===current){tileErrors++;status='partial';emit();}});
    current.on('load',()=>{if(alive&&enabled&&layer===current){status=tileErrors?'partial':'ready';emit();}});
    current.addTo(map);emit();
  }
  async function refresh(force=false){
    if(!alive||!enabled)return;if(busy)return busy;
    if(!force&&frames.length&&Date.now()-loadedAt<300000){show();return;}
    status='loading';emit();
    busy=(async()=>{
      try{
        const r=await fetcher('https://api.rainviewer.com/public/weather-maps.json',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])});
        if(!r.ok)throw Error();const next=atlasRadarFrames(await r.json());if(!next.length)throw Error();
        if(!alive)return;frames=next;index=frames.length-1;loadedAt=Date.now();pause();if(enabled)show();
      }catch{if(alive){status='error';pause();if(!frames.length)remove();emit();}}
      finally{busy=null;}
    })();return busy;
  }
  function setEnabled(value){enabled=!!value;pause();if(!enabled){remove();emit();}else refresh();}
  function seek(value){if(!frames.length)return;pause();index=Math.max(0,Math.min(frames.length-1,Math.round(value)));show();}
  function tick(){if(!alive||!playing||!enabled||document.hidden)return pause();index=(index+1)%frames.length;show();timer=setTimeout(tick,1300);}
  function play(){if(playing)return pause();if(!enabled||frames.length<2)return;playing=true;tick();}
  const visibility=()=>{if(document.hidden)pause();else if(enabled)refresh();};
  document.addEventListener('visibilitychange',visibility);
  map.createPane('atlas-radar').style.zIndex=350;
  return {setEnabled,seek,play,pause,refresh,snapshot,dispose(){alive=false;abort.abort();clearTimeout(timer);remove();document.removeEventListener('visibilitychange',visibility);}};
}
