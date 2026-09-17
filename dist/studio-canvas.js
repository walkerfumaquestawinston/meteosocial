import {climateState,wrapCanvasText} from './climate-engine.js';
export function paintEdition(canvas,draft,context,media,progress=0){
 const x=canvas.getContext('2d'),W=canvas.width,H=canvas.height,S=W/1080,mode=draft.template,w=context.weather,c=w?.current;
 x.save();x.scale(S,S);const h=H/S;
 const palette=mode==='arcade'?['#201635','#ffe95c','#ff7454']:mode==='rain'?['#0e2337','#f0f6ff','#9db8d5']:['#f3f5f8','#132840','#1662de'];
 x.fillStyle=palette[0];x.fillRect(0,0,1080,h);
 if(media){const mw=media.videoWidth||media.naturalWidth||media.width,mh=media.videoHeight||media.naturalHeight||media.height;if(mw&&mh){const top=150,bottom=500,area=h-top-bottom,scale=Math.max(1080/mw,area/mh)*(draft.zoom||1);x.save();x.beginPath();x.rect(0,top,1080,area);x.clip();x.drawImage(media,(1080-mw*scale)/2,top+(area-mh*scale)/2,mw*scale,mh*scale);x.restore()}}
 x.fillStyle=palette[1];x.font='800 37px system-ui';x.fillText((context.brand||'LA MIA REDAZIONE').toUpperCase(),54,74,870);
 x.fillStyle=palette[2];x.fillRect(54,103,86,5);x.font='600 24px system-ui';x.fillStyle=palette[1];x.fillText(context.place.name.toUpperCase(),158,115,810);
 const titleTop=media?h-335:Math.round(h*.36),dark=mode!=='news';
 if(media){x.fillStyle=palette[0];x.fillRect(0,h-465,1080,465)}
 x.fillStyle=palette[2];x.font='bold 24px ui-monospace,monospace';x.fillText(draft.label||'EDIZIONE DEL CIELO',54,titleTop-75,960);
 x.fillStyle=palette[1];x.font=(mode==='arcade'?'900 62px ui-monospace,monospace':'800 66px system-ui');
 const lines=wrapCanvasText(x,draft.title||'Il cielo fa notizia.',970,media?2:4);lines.forEach((line,i)=>x.fillText(line,54,titleTop+i*75,972));
 x.font='400 30px system-ui';wrapCanvasText(x,draft.caption||'',970,2).forEach((line,i)=>x.fillText(line,54,titleTop+lines.length*75+35+i*40,972));
 if(draft.hud&&media){const state=climateState(w);x.fillStyle='rgba(5,12,26,.82)';x.fillRect(36,175,1008,165);x.fillStyle='#fff';x.font='800 32px ui-monospace,monospace';x.fillText(state.mode==='heat'?'STAMINA DEL CIELO':'SKY STATUS',64,222);x.fillText(Number.isFinite(c?.temperature_2m)?Math.round(c.temperature_2m)+' °C':'METEO —',790,222);x.fillStyle='#69788d';x.fillRect(64,242,580,20);x.fillStyle=state.mode==='heat'?'#ffcf4f':'#54d9e6';x.fillRect(64,242,580*(state.mode==='heat'?.25:.8),20);x.font='22px system-ui';x.fillStyle='#fff';x.fillText('Overlay creativo · non misura salute o pericolo',64,307,920);if(c?.weather_code>=95)x.fillText('✦ ✦ ✦',790,266)}
 x.fillStyle=palette[2];x.fillRect(0,h-100,1080,100);x.fillStyle=dark?'#091222':'#fff';x.font='700 30px system-ui';x.fillText('MeteoSocial'+(draft.signature?' · '+context.brand:''),36,h-61,1010);x.font='500 24px system-ui';x.fillText(c?'Meteo al montaggio · Open-Meteo · '+String(c.time).slice(5).replace('T',' '):'Meteo non disponibile',36,h-22,1010);
 if(draft.orbit&&context.hasOrbit){x.save();x.translate(980,80);x.strokeStyle=palette[2];x.lineWidth=4;x.beginPath();x.arc(0,0,42,0,Math.PI*2);x.stroke();x.fillStyle=palette[1];x.font='bold 19px ui-monospace,monospace';x.textAlign='center';x.fillText('ORBIT',0,7);x.restore()}if(progress>0){x.fillStyle=palette[1];x.fillRect(0,h-5,1080*Math.min(1,progress),5)}x.restore();
}
