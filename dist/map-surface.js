import {makeSurface,surfaceAt,surfaceColor} from './map-surface-core.js';

export function createWeatherSurface({L,map,onStatus}){
 const pane=map.createPane('atlas-weather-surface');pane.style.cssText='z-index:300;pointer-events:none';
 const canvas=document.createElement('canvas');canvas.className='map-weather-surface';canvas.setAttribute('aria-hidden','true');pane.append(canvas);
 const buffer=document.createElement('canvas'),context=canvas.getContext('2d'),small=buffer.getContext('2d');
 let points=[],mode='temperature',enabled=true,radar=false,dead=false,frame=0,model=null,popup=null;
 const schedule=()=>{if(dead)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(paint);};
 function hide(){canvas.hidden=true;popup?.remove();popup=null;}
 function paint(){
  frame=0;hide();if(dead||document.hidden)return;
  if(!enabled||radar||!['temperature','vento'].includes(mode)){model=null;onStatus(radar?'Superficie sospesa: radar in primo piano.':'Vista a punti.');return;}
  model=makeSurface(points,mode);
  if(!model){onStatus('Superficie non disponibile: servono almeno 3 punti recenti, compatibili e non allineati.');return;}
  const size=map.getSize(),step=Math.max(10,Math.ceil(Math.max(size.x,size.y)/150));
  canvas.width=Math.ceil(size.x);canvas.height=Math.ceil(size.y);canvas.style.width=size.x+'px';canvas.style.height=size.y+'px';
  L.DomUtil.setPosition(canvas,map.containerPointToLayerPoint([0,0]));
  buffer.width=Math.ceil(size.x/step);buffer.height=Math.ceil(size.y/step);
  const pixels=small.createImageData(buffer.width,buffer.height);let covered=0;
  for(let y=0;y<buffer.height;y++)for(let x=0;x<buffer.width;x++){
   const ll=map.containerPointToLatLng([(x+.5)*step,(y+.5)*step]),value=surfaceAt(model,ll.lat,ll.lng);if(!value)continue;
   const i=(y*buffer.width+x)*4,color=surfaceColor(value.value,mode);pixels.data.set([...color,104],i);covered++;
  }
  small.putImageData(pixels,0,0);context.clearRect(0,0,canvas.width,canvas.height);context.imageSmoothingEnabled=true;context.drawImage(buffer,0,0,canvas.width,canvas.height);
  if(mode==='vento')for(let y=32;y<size.y;y+=64)for(let x=32;x<size.x;x+=64){
   const ll=map.containerPointToLatLng([x,y]),w=surfaceAt(model,ll.lat,ll.lng);if(!w||w.value<1)continue;
   const ux=w.u/w.value,uy=-w.v/w.value,len=11;
   context.beginPath();context.moveTo(x-ux*len,y-uy*len);context.lineTo(x+ux*len,y+uy*len);
   context.lineTo(x+ux*len-ux*6-uy*4,y+uy*len-uy*6+ux*4);context.moveTo(x+ux*len,y+uy*len);context.lineTo(x+ux*len-ux*6+uy*4,y+uy*len-uy*6-ux*4);
   context.strokeStyle='#ffffffdd';context.lineWidth=4;context.stroke();context.strokeStyle='#17394c';context.lineWidth=1.8;context.stroke();
  }
  canvas.hidden=!covered;
  const time=new Date(model.time).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
  onStatus(covered?`Stima interpolata · ${model.nodes.length} località · ${model.source} · ${time}. Tocca una zona colorata.`:'Punti troppo distanti per colorare questa zona. Avvicinati o usa Punti.');
 }
 function inspect(event){
  if(canvas.hidden||!model)return;const estimate=surfaceAt(model,event.latlng.lat,event.latlng.lng);if(!estimate)return;
  const content=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p');
  title.textContent='Stima interpolata: '+Math.round(estimate.value)+(mode==='vento'?' km/h':' °C');
  const provenance=document.createElement('p');provenance.textContent=model.source+' · '+new Date(model.time).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
  detail.textContent='Calcolo tra '+estimate.count+' località. Non è una misura in questo punto; rilievi e differenze locali non sono risolti.';content.append(title,provenance,detail);
  popup=L.popup({maxWidth:250}).setLatLng(event.latlng).setContent(content).openOn(map);
 }
 map.on('movestart zoomstart',hide);map.on('moveend resize',schedule);map.on('click',inspect);document.addEventListener('visibilitychange',schedule);
 return {update(next){points=next.points;mode=next.mode;enabled=next.enabled;radar=next.radar;schedule();},dispose(){dead=true;cancelAnimationFrame(frame);map.off('movestart zoomstart',hide);map.off('moveend resize',schedule);map.off('click',inspect);document.removeEventListener('visibilitychange',schedule);popup?.remove();canvas.remove();}};
}
