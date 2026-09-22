// A successful check is not a new observation. All model map timestamps are UTC.
export const MAP_REFRESH_MS=60000;
export function modelTime(current){
 const t=current?.time;if(typeof t!=='string')return null;
 const n=Date.parse(/(Z|[+-]\d\d:\d\d)$/.test(t)?t:t+'Z');return Number.isFinite(n)?n:null;
}
export function sourceStatus({checkedAt=0,current,radar,now=Date.now()}={}){
 const clock=t=>new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
 const at=modelTime(current),age=at===null?null:Math.floor((now-at)/60000);
 const model=at===null?'Modello: orario non disponibile':`Modello: ${clock(at)}${age>120?' · precedente':age< -5?' · orario futuro da verificare':''}`;
 const frame=Number.isFinite(radar?.time)?radar.time*1000:null;
 return {checked:checkedAt?`Controllo ${clock(checkedAt)}`:'Controllo in corso',model,
 radar:radar?.enabled?(frame?`Radar visualizzato: ${clock(frame)}${now-frame>25*60000?' · quadro precedente':''}`:'Radar: in attesa della fonte'):'Radar: spento',
 stale:age===null||age>120||age< -5};
}
