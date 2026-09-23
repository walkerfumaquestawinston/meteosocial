// RainViewer composites and Rainbow analysis/forecasts keep separate provenance.
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

export function createAtlasRadar({L,map,onChange,fetcher=fetch,rainbow=false}) {
  let alive=true,enabled=false,frames=[],index=0,layer=null,timer=0,playing=false,status='idle',loadedAt=0,busy=null,tileErrors=0;
  let source='RainViewer',issuedAt=null,fallback=false;
  const abort=new AbortController();
  const snapshot=()=>({enabled,frames,index,playing,status,source,issuedAt,fallback,nowIndex:source==='Rainbow Weather'?frames.findIndex(f=>f.time===issuedAt):frames.length-1,time:frames[index]?.time||null,age:frames.length?Math.max(0,Math.round((Date.now()/1000-(issuedAt||frames.at(-1).time))/60)):null});
  const emit=()=>{if(alive)onChange(snapshot());};
  function pause(){playing=false;clearTimeout(timer);emit();}
  function remove(){if(layer){layer.off();map.removeLayer(layer);layer=null;}}
  function show(){
    remove();if(!alive||!enabled||!frames.length){emit();return;}
    tileErrors=0;status='tiles';
    const current=L.tileLayer(frames[index].url,{pane:'atlas-radar',opacity:.72,maxNativeZoom:source==='Rainbow Weather'?10:7,maxZoom:16,tileSize:256,crossOrigin:true,keepBuffer:1,updateWhenIdle:true});
    layer=current;
    current.on('tileerror',()=>{if(alive&&enabled&&layer===current){tileErrors++;status='partial';emit();}});
    current.on('load',()=>{if(alive&&enabled&&layer===current){status=tileErrors?'partial':'ready';emit();}});
    current.addTo(map);emit();
  }
  async function refresh(force=false){
    if(!alive||!enabled)return;if(busy)return busy;
    if(!force&&frames.length&&Date.now()-loadedAt<60000){if(!layer)show();else emit();return;}
    const previousStatus=status,previousTime=frames[index]?.time,followLatest=!frames.length||index===(source==='Rainbow Weather'?frames.findIndex(f=>f.time===issuedAt):frames.length-1);status='loading';emit();
    busy=(async()=>{
      try{
        let next=null;
        if(rainbow)try{
          const r=await fetcher('/api/rainbow/snapshot',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])});
          if(!r.ok)throw Error();const d=await r.json();next=rainbowRadarFrames(d);source='Rainbow Weather';issuedAt=d.snapshot;fallback=false;
        }catch{if(abort.signal.aborted)throw Error();fallback=true;}
        if(!next){const r=await fetcher('https://api.rainviewer.com/public/weather-maps.json',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])});
          if(!r.ok)throw Error();next=atlasRadarFrames(await r.json());source='RainViewer';issuedAt=null;}
        if(!next.length)throw Error();
        if(!alive)return;const unchanged=frames.length===next.length&&frames.every((f,i)=>f.time===next[i].time&&f.url===next[i].url);loadedAt=Date.now();
        if(unchanged&&layer){status=previousStatus==='error'?'ready':previousStatus;emit();return;}
        frames=next;index=followLatest?(source==='Rainbow Weather'?frames.findIndex(f=>f.time===issuedAt):frames.length-1):Math.max(0,frames.findIndex(f=>f.time===previousTime));if(enabled)show();
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
  return {setEnabled,seek,play,pause,refresh,snapshot,useFallback(){rainbow=false;fallback=true;pause();frames=[];loadedAt=0;remove();refresh(true);},dispose(){alive=false;abort.abort();clearTimeout(timer);remove();document.removeEventListener('visibilitychange',visibility);}};
}

export function rainbowRadarFrames(data,now=Date.now()){
 const stamp=data?.snapshot;
 if(!Number.isInteger(stamp)||stamp%600||stamp*1000>now+60000||now-stamp*1000>1800000)throw Error('Quadro Rainbow non recente');
 return Array.from({length:37},(_,i)=>{const offset=(i-12)*600,snapshot=offset<0?stamp+offset:stamp,forecast=Math.max(0,offset);return {time:stamp+offset,kind:offset>0?'forecast':'analysis',url:'/api/rainbow/tile/'+snapshot+'/'+forecast+'/{z}/{x}/{y}.png'};});
}
