// A successful check is not a new observation. All model map timestamps are UTC.
export const MAP_REFRESH_MS=60000;
export function elapsedLabel(timestamp,now=Date.now()){
 if(!Number.isFinite(timestamp)||timestamp<=0)return 'orario non disponibile';
 if(timestamp>now+5000)return 'orario futuro da verificare';
 const seconds=Math.max(0,Math.floor((now-timestamp)/1000));
 if(seconds<60)return seconds+' s fa';
 const minutes=Math.floor(seconds/60);
 if(minutes<60)return minutes+' min '+String(seconds%60).padStart(2,'0')+' s fa';
 return Math.floor(minutes/60)+' h '+minutes%60+' min fa';
}
export function checkStatus({checkedAt=0,checking=false,failed=false,offline=false,outdated=false,now=Date.now()}={}){
 if(offline)return {label:'Sei offline · dati precedenti',tone:'warning'};
 if(checking)return {label:'Controllo le fonti…',tone:'checking'};
 if(!checkedAt)return {label:'In attesa del primo controllo',tone:'waiting'};
 if(outdated&&!failed)return {label:'Meteo precedente · controllo '+elapsedLabel(checkedAt,now),tone:'warning'};
 return {label:(failed?'Controllo incompleto · ':'Controllo ')+elapsedLabel(checkedAt,now),tone:failed?'warning':'checked'};
}
export function modelTime(current){
 const t=current?.time;if(typeof t!=='string')return null;
 const n=Date.parse(/(Z|[+-]\d\d:\d\d)$/.test(t)?t:t+'Z');return Number.isFinite(n)?n:null;
}
export function sourceStatus({checkedAt=0,current,radar,now=Date.now()}={}){
 const clock=t=>new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
 const at=modelTime(current),age=at===null?null:Math.floor((now-at)/60000);
 const forecast=current?.kind==='forecast',expired=forecast?(now>=current.validUntil||now-current.issuedAt>7200000||now<at):(age===null||age>30||age< -5);
 const model=forecast?`Previsione: ${clock(at)}–${clock(current.validUntil)}${expired?' · precedente':''}`:at===null?'Modello: orario non disponibile':`Modello: ${clock(at)}${age>30?' · precedente':age< -5?' · orario futuro da verificare':''}`;
 const frame=Number.isFinite(radar?.time)?radar.time*1000:null;
 return {checked:checkedAt?`Controllo ${clock(checkedAt)}`:'Controllo in corso',model,
 radar:radar?.enabled?(frame?`Radar visualizzato: ${clock(frame)}${now-frame>25*60000?' · quadro precedente':''}`:'Radar: in attesa della fonte'):'Radar: spento',
 stale:expired};
}
