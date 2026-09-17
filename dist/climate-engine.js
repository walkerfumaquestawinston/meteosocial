export const RAIN_CODES=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99];
export function climateState(weather){
 if(weather?._loadedAt&&Date.now()-weather._loadedAt>5400000)return {mode:'quiet',label:'Aggiorna il meteo',known:false};const c=weather?.current;if(!c||!Number.isFinite(c.weather_code)||!Number.isFinite(c.temperature_2m))return {mode:'quiet',label:'In attesa del meteo',known:false};
 if(c.temperature_2m>=38)return {mode:'heat',label:'Modalità caldo',known:true};
 if(RAIN_CODES.includes(c.weather_code))return {mode:'rain',label:'Sotto la pioggia',known:true};
 return {mode:'quiet',label:'Cielo aperto',known:true};
}
export function weatherPatch(weather,city){
 const c=weather?.current;if(!c)return {title:'In attesa dei dati',lines:['Il bollettino sarà disponibile quando arriva il meteo.'],source:''};
 const state=climateState(weather),lines=[state.mode==='heat'?'Debuff caldo: '+Math.round(c.temperature_2m)+' °C nel server locale.':state.mode==='rain'?'Pioggia attivata. Il divano guadagna priorità.':'Nuova sessione del cielo: '+Math.round(c.temperature_2m)+' °C.'];
 if(Number.isFinite(c.wind_speed_10m))lines.push('Vento impostato a '+Math.round(c.wind_speed_10m)+' km/h.');
 const d=weather.daily,delta=d?.temperature_2m_max?.length>1?d.temperature_2m_max[1]-d.temperature_2m_max[0]:null;
 if(Number.isFinite(delta))lines.push('Domani: massima '+(delta>=0?'+':'')+delta.toFixed(1)+' °C rispetto a oggi.');
 return {title:'Server '+city+' · patch meteo',lines,source:'Open-Meteo · '+String(c.time||'').replace('T',' ')+' · testo editoriale, non allerta'};
}
export function skyWindow(weather,now=Date.now()){
 const offset=weather?.utc_offset_seconds;if(!Number.isFinite(offset))return null;
 const times=weather?.daily?.sunset||[];
 const windows=times.map(s=>{const sunset=Date.parse(s+'Z')-offset*1000;return {start:sunset-1800000,end:sunset-1500000}}).filter(w=>Number.isFinite(w.start)&&w.end>now);
 const w=windows[0];return w?{...w,active:now>=w.start,remaining:Math.max(0,Math.ceil((w.end-now)/1000))}:null;
}
export function wrapCanvasText(ctx,text,width,maxLines=4){const words=String(text).trim().split(/\s+/),lines=[];let line='';for(const word of words){const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>width&&line){lines.push(line);line=word}else line=candidate}if(line)lines.push(line);const out=lines.slice(0,maxLines);if(lines.length>maxLines)out[maxLines-1]+='…';return out}
