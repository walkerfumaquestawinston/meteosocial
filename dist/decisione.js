// Only hourly model data. No observations, inferred model disagreement or minute nowcasting.
const HOUR=3600000;
const stamp=t=>typeof t==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t)?Date.parse(t+'Z'):NaN;
const hour=t=>Math.floor(stamp(t)/HOUR)*HOUR;
const label=t=>t.slice(11,16);
const num=n=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:1}).format(n);
const result=(frase,dettaglio,certezza='indicativa')=>({frase,dettaglio,certezza});
const unknown=detail=>result('Difficile da dire con questi dati.',detail,'dati-insufficienti');
function rowsIn(w,start,end){
 const a=hour(start),b=hour(end),times=w?.hourly?.time;
 if(!Number.isFinite(a)||!Number.isFinite(b)||b<a||b-a>48*HOUR||!Array.isArray(times))return null;
 const rows=times.map((time,i)=>({time,i,at:stamp(time)})).filter(r=>r.at>=a&&r.at<=b);
 if(rows.length!==(b-a)/HOUR+1||rows.some((r,i)=>r.at!==a+i*HOUR))return null;
 return rows;
}
const values=(w,rows,key,min=-Infinity,max=Infinity)=>{
 const v=rows?.map(r=>w.hourly[key]?.[r.i]);
 return v?.length&&v.every(n=>Number.isFinite(n)&&n>=min&&n<=max)?v:null;
};
const span=rows=>`${label(rows[0].time)}–${label(rows.at(-1).time)}`;
export function nomeVento(gradi,velocita){
 if(!Number.isFinite(gradi)||gradi<0||gradi>360||!Number.isFinite(velocita)||velocita<=5)return null;
 return ['tramontana','grecale','levante','scirocco','ostro','libeccio','ponente','maestrale'][Math.round(gradi/45)%8];
}
/** finestraOraria: {tipo, inizio, fine, adesso}; ISO wall-clock times in previsione.timezone.
 * tipi: ombrello, vestiti, bucato, weekend, temporale. Optional rows return null.
 * certezza describes the advice, never a calibrated model confidence score.
 */
export function decisione(previsione,finestraOraria={}){
 const w=previsione,f=finestraOraria,tipo=f.tipo||'ombrello';
 if(tipo==='weekend')return weekend(w,f.adesso);
 if(tipo==='temporale')return temporale(w,f.adesso);
 let start=f.inizio,end=f.fine;
 if(tipo==='bucato'&&Number.isFinite(stamp(start))){start=new Date(Math.ceil(stamp(start)/HOUR)*HOUR).toISOString().slice(0,16);end=new Date(hour(start)+7*HOUR).toISOString().slice(0,16)}
 const rows=rowsIn(w,start,end);
 if(!rows)return tipo==='bucato'?null:unknown('Mancano ore della previsione per la fascia scelta.');
 if(tipo==='vestiti'){
  const temps=values(w,rows,'apparent_temperature');
  if(!temps)return unknown('Temperatura percepita oraria non disponibile: non la sostituiamo con quella reale.');
  const cold=Math.round(Math.min(...temps)),first=temps[0],last=temps.at(-1);
  let phrase=cold<8?'Giacca pesante.':cold<=15?'Giacca leggera.':cold<=21?'Felpa, basta.':'Maniche corte.';
  if(Math.abs(last-first)>8)phrase=phrase.slice(0,-1)+`: copriti a strati, alle ${label(f.inizio)} sono percepiti ${Math.round(first)}°, alle ${label(end)} ${Math.round(last)}°.`;
  return result(phrase,`Percepiti previsti: da ${num(Math.min(...temps))}° a ${num(Math.max(...temps))}° · ore ${span(rows)}. Scelta basata sul valore più basso, arrotondato al grado.`);
 }
 const rain=values(w,rows,'precipitation',0),prob=values(w,rows,'precipitation_probability',0,100);
 if(tipo==='bucato'){
  const humidity=values(w,rows,'relative_humidity_2m',0,100),wind=values(w,rows,'wind_speed_10m',0);
  if(!rain||!humidity||!wind||rain.some(n=>n>0)||humidity.some(n=>n>=70)||wind.some(n=>n<=5))return null;
  const until=new Date(hour(start)+8*HOUR).toISOString().slice(0,16),today=f.adesso?.slice(0,10)===start.slice(0,10);
  return result(`${today?'Oggi':'Nella fascia scelta'} si stende: il modello prevede otto ore senza pioggia.`,`Dalle ${label(start)} alle ${label(until)} · pioggia prevista 0 mm, umidità massima ${num(Math.max(...humidity))}%, vento da ${num(Math.min(...wind))} a ${num(Math.max(...wind))} km/h. Fasce orarie, non una garanzia di asciugatura.`);
 }
 if(tipo!=='ombrello')return unknown('Tipo di decisione non disponibile.');
 if(!prob||!rain)return unknown('Mancano probabilità o quantità di precipitazione nella fascia scelta.');
 const peak=Math.max(...prob),wet=rows.filter((r,i)=>prob[i]>=50||rain[i]>.5);
 const detail=`Ore ${span(rows)} · probabilità massima ${num(peak)}%, precipitazione massima ${num(Math.max(...rain))} mm in un’ora. Previsione del modello, non una certezza.`;
 if(peak>=40&&peak<=60)return result('Difficile da dire in questa fascia: per prudenza, porta l’ombrello.',detail,'incerta');
 if(wet.length)return result(`Sì, prendilo: pioggia prevista ${wet.length===1?'intorno alle '+label(wet[0].time):'tra le '+label(wet[0].time)+' e le '+label(wet.at(-1).time)}.`,detail);
 if(peak>=25)return result('Forse: porta l’ombrello se resti fuori a lungo.',detail,'incerta');
 return result('Puoi lasciare l’ombrello: pioggia poco probabile nella fascia scelta.',detail);
}
function temporale(w,now){
 if(!Number.isFinite(stamp(now)))return null;
 const until=new Date(stamp(now)+HOUR).toISOString().slice(0,16),rows=rowsIn(w,now,until);
 const codes=values(w,rows,'weather_code',0,99),rain=values(w,rows,'precipitation',0);
 if(!codes||!rain||!codes.some((c,i)=>[95,96,99].includes(c)&&rain[i]>0))return null;
 return result('Possibile temporale nella prossima ora: controlla il radar e i bollettini.',`Open-Meteo indica temporale nelle fasce orarie ${span(rows)}. Non possiamo stimare il minuto di arrivo.`,'incerta');
}
function weekend(w,now){
 if(!Number.isFinite(stamp(now)))return null;
 const date=new Date(stamp(now)),day=date.getUTCDay();if(day>0&&day<4)return null;
 const sunday=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()+(7-day)%7)).toISOString().slice(0,10);
 if(day===0&&label(now)>'10:00')return null;
 const rows=rowsIn(w,sunday+'T10:00',sunday+'T19:00'),rain=values(w,rows,'precipitation',0),prob=values(w,rows,'precipitation_probability',0,100),wind=values(w,rows,'wind_speed_10m',0);
 if(!rain||!prob||!wind)return unknown('Le previsioni di domenica dalle 10 alle 19 non sono ancora complete.');
 const wet=rain.some(n=>n>0)||Math.max(...prob)>=25;
 const afternoon=rows.map((r,i)=>({r,i})).filter(({r})=>label(r.time)>='15:00');
 const strongest=afternoon.reduce((a,b)=>wind[b.i]>wind[a.i]?b:a),speed=wind[strongest.i],direction=w.hourly.wind_direction_10m?.[strongest.r.i],name=nomeVento(direction,speed);
 return result(`Domenica ${wet?'può piovere':'la pioggia è poco probabile'}${name?': '+name+' nel pomeriggio':', controlla di nuovo prima di uscire'}.`,`Domenica ${sunday.slice(8)}/${sunday.slice(5,7)}, ore 10:00–19:00 · probabilità massima ${num(Math.max(...prob))}%, pioggia massima ${num(Math.max(...rain))} mm/ora; vento pomeridiano massimo ${num(speed)} km/h alle ${label(strongest.r.time)}. Non è una valutazione delle condizioni del mare.`,'indicativa');
}
