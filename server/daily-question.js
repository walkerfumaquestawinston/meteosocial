const DAILY_TOPICS={
 jacket:['Oggi serve la giacca?',['Sì','No']],wind:['C’è vento forte dove sei?',['Sì','No']],
 rain:['Ha piovuto abbastanza dove stai?',['Sì','No']],dinner:['Si sta bene fuori a cena stasera?',['Sì','No']],
 humid:['Si sente l’afa?',['Sì','No']],sea:['Com’è il mare oggi?',['Calmo','Mosso','Agitato']],
 sky:['Com’è il cielo adesso?',['Sereno','Nuvoloso','Coperto']],change:['Il cielo è cambiato da stamattina?',['Sì','No']]
};
function dailyClock(at,timezone){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(at).map(p=>[p.type,p.value]));return {day:`${p.year}-${p.month}-${p.day}`,hour:+p.hour,local:`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`}}
function dailyInstant(day,hour,timezone){const target=Date.parse(day+'T'+String(hour).padStart(2,'0')+':00:00Z');let t=target;for(let i=0;i<4;i++)t+=target-Date.parse(dailyClock(t,timezone).local+'Z');return t}
function dailyNextDay(day,delta=1){return new Date(Date.parse(day+'T12:00:00Z')+delta*86400000).toISOString().slice(0,10)}
function dailyTopic(data,previous,coastal,now){const c=data.current||{},h=data.hourly||{},candidates=[];
 if(Number.isFinite(c.apparent_temperature)&&c.apparent_temperature>=8&&c.apparent_temperature<=16)candidates.push('jacket');
 if(Number.isFinite(c.wind_speed_10m)&&c.wind_speed_10m>20)candidates.push('wind');
 if(h.time?.some((t,i)=>t*1000<=now&&t*1000>now-86400000&&Number.isFinite(h.precipitation?.[i])&&h.precipitation[i]>0))candidates.push('rain');
 if(c.weather_code===0&&Number.isFinite(c.temperature_2m)&&c.temperature_2m>20)candidates.push('dinner');
 if(Number.isFinite(c.relative_humidity_2m)&&c.relative_humidity_2m>80)candidates.push('humid');
 if(coastal)candidates.push('sea');
 candidates.push('sky','change');return candidates.find(t=>t!==previous);
}
async function dailyQuestionView(env,row,device){
 const own=device?await q(env,'SELECT answer FROM daily_answers WHERE question=? AND device=?',row.id,device).first():null;
 const [testo,opzioni]=DAILY_TOPICS[row.topic];let risposte=null,totale=null;
 if(own){risposte=Object.fromEntries(opzioni.map(o=>[o,0]));const counts=(await q(env,`SELECT answer,COUNT(*) n FROM daily_answers a WHERE question=? AND NOT EXISTS(SELECT 1 FROM moderation_bans b WHERE b.key='device:'||a.device OR b.key='actor:'||a.actor) GROUP BY answer`,row.id).all()).results;for(const r of counts)if(opzioni.includes(r.answer))risposte[r.answer]=r.n;totale=Object.values(risposte).reduce((a,b)=>a+b,0)}
 return {id:row.id,testo,opzioni,giaRisposto:!!own,miaRisposta:own?.answer||null,risposte,totale,scade:row.expires,apre:row.opens,fuso:row.timezone,giorno:row.day,serverNow:Date.now()};
}
async function dailyQuestionApi(req,env,url){
 const now=Date.now(),device=await skyDevice(req);
 if(req.method==='GET'&&url.pathname==='/api/domanda'){
  const lat=url.searchParams.get('lat'),lng=url.searchParams.get('lng');
  if(lat===null||lng===null||!lat.trim()||!lng.trim()||!Number.isFinite(+lat)||!Number.isFinite(+lng)||Math.abs(+lat)>85||Math.abs(+lng)>180)fail(400,'Scegli una località valida.');
  // Shared, approximate cells (~5 km), never a participant's exact location.
  const latitude=Math.round(+lat*20)/20,longitude=Math.round(+lng*20)/20,zone=latitude.toFixed(2)+','+longitude.toFixed(2);
  const existing=await q(env,'SELECT * FROM daily_questions WHERE zone=? AND opens<=? AND expires>? ORDER BY opens DESC LIMIT 1',zone,now,now).first();
  if(existing)return json(await dailyQuestionView(env,existing,device));
  const meteo=await globeSnapshot(env,'daily-question:'+zone,async()=>{
   const data=await atmoFetch('https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude,longitude,current:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',hourly:'precipitation',past_days:'1',forecast_days:'1',timezone:'auto',timeformat:'unixtime'}),150000);
   if(!data.timezone||!data.current)fail(503,'Non riesco a preparare la domanda. Riprova.');dailyClock(now,data.timezone);return {data,at:now};
  });
  if(meteo.stale||now-meteo.at>900000)fail(503,'Il meteo per scegliere la domanda non è aggiornato. Riprova.');
  const timezone=meteo.data.timezone,clock=dailyClock(now,timezone),opens=dailyInstant(clock.day,7,timezone),expires=dailyInstant(dailyNextDay(clock.day),0,timezone);
  if(now<opens)return json({id:null,status:'waiting',testo:'La domanda di oggi arriva alle 7.',apre:opens,scade:expires,serverNow:now,risposte:null,giaRisposto:false});
  const previous=await q(env,'SELECT topic FROM daily_questions WHERE zone=? AND day=?',zone,dailyNextDay(clock.day,-1)).first();
  const coast=localCoastDistance(latitude,longitude);
  const topic=dailyTopic(meteo.data,previous?.topic,coast!==null&&coast<=15,now),id=await skyHash('daily:'+zone+':'+clock.day);
  await q(env,'INSERT OR IGNORE INTO daily_questions(id,zone,day,topic,timezone,opens,expires,created) VALUES(?,?,?,?,?,?,?,?)',id,zone,clock.day,topic,timezone,opens,expires,now).run();
  const row=await q(env,'SELECT * FROM daily_questions WHERE zone=? AND day=?',zone,clock.day).first();
  // Old votes have no public archive. Keep only yesterday's question for rotation.
  await db(env).batch([q(env,'DELETE FROM daily_answers WHERE day<?',dailyNextDay(clock.day,-2)),q(env,'DELETE FROM daily_questions WHERE expires<?',now-3*86400000)]);
  return json(await dailyQuestionView(env,row,device));
 }
 const match=url.pathname.match(/^\/api\/domanda\/([a-f0-9]{64})\/risposta$/);
 if(req.method!=='POST'||!match)fail(405,'Azione non disponibile.');
 const actor=await skyActor(req,env);if(!actor||!device)fail(401,'Avvia la sessione per rispondere.');
 const b=await growthBody(req,actor);await quota(env,device,'daily-answer',60);
 const row=await q(env,'SELECT * FROM daily_questions WHERE id=? AND opens<=? AND expires>?',match[1],now,now).first();if(!row)fail(410,'La domanda è scaduta. Torna a Oggi.');
 if(!DAILY_TOPICS[row.topic][1].includes(b.risposta))fail(400,'Scegli una delle risposte.');
 // Device/day uniqueness also holds for concurrent requests and account changes.
 await q(env,`INSERT INTO daily_answers(device,day,question,actor,answer,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(device,day) DO UPDATE SET answer=excluded.answer,updated=excluded.updated WHERE daily_answers.question=excluded.question`,device,row.day,row.id,actor.id,b.risposta,now).run();
 const own=await q(env,'SELECT question FROM daily_answers WHERE device=? AND day=?',device,row.day).first();if(own?.question!==row.id)fail(409,'Oggi hai già risposto in un’altra zona. Puoi cambiare la risposta tornando lì.');
 return json(await dailyQuestionView(env,row,device));
}
