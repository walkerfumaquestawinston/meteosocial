const PROFESSION_TOPICS={pesca:['wind','sea','visibility','storm'],mare:['wind','sea','visibility','storm'],campi:['rain','hail','frost','drought'],cantiere:['wind','rain','temperature'],consegne:['rain','ice','fog'],sport:['wind','rain','apparent_temperature']};
function professionFactor(mestiere,phenomenon,coastal=false){
 if(!Object.hasOwn(PROFESSION_TOPICS,mestiere)||!PROFESSION_TOPICS[mestiere].includes(phenomenon))return 1;
 if(['pesca','mare'].includes(mestiere)&&phenomenon==='storm'&&!coastal)return 1;
 return 1.5;
}
const skyProfessionColumn="(SELECT mestiere FROM actor_professions p WHERE p.actor=r.author) mestiere";
async function professionApi(req,env,url){
 const actor=await skyActor(req,env);if(!actor)fail(401,'Avvia una sessione per modificare il Profilo.');
 if(req.method==='GET')return json({mestiere:(await q(env,'SELECT mestiere FROM actor_professions WHERE actor=?',actor.id).first())?.mestiere||null});
 if(req.method!=='PATCH')fail(405,'Metodo non disponibile.');
 const body=await growthBody(req,actor);if(!Object.hasOwn(body,'mestiere')||(body.mestiere!==null&&(typeof body.mestiere!=='string'||!Object.hasOwn(PROFESSION_TOPICS,body.mestiere))))fail(400,'Scegli una delle attività indicate.');
 await quota(env,actor.id,'profession-update',30);
 if(body.mestiere===null)await q(env,'DELETE FROM actor_professions WHERE actor=?',actor.id).run();
 else await q(env,'INSERT INTO actor_professions(actor,mestiere,updated) VALUES(?,?,?) ON CONFLICT(actor) DO UPDATE SET mestiere=excluded.mestiere,updated=excluded.updated',actor.id,body.mestiere,Date.now()).run();
 return json({mestiere:body.mestiere});
}
// No public scores. Only the prevalent description leaves the server; people
// and confirmation counts remain literal counts. One latest report per author.
function professionSummary(rows,trusts){
 const totals=new Map(),levels=[0,0,0,0,0],names=['Asciutto','Qualche goccia','Pioviggina','Piove','Diluvio'];
 rows.forEach((r,i)=>{
  if(r.hidden||trusts[i]?.hidden)return;
  const label=r.phenomenon||names[r.level]||r.kind;
  const coast=r.kind==='storm'?localCoastDistance(r.lat/100,r.lon/100):null;
  const topic=r.phenomenon?r.kind:'rain';
  const weight=(trusts[i]?.weight||0)*professionFactor(r.mestiere,topic,coast!==null&&coast<=15);
  if(weight<=0)return;
  totals.set(label,(totals.get(label)||0)+weight);
  // Preserve the existing rain-intensity contract for detailed rain reports.
  if(!r.phenomenon&&Number.isInteger(r.level)&&r.level>=0&&r.level<=4)levels[r.level]+=weight;
 });
 const max=Math.max(0,...totals.values());
 return {summary:[...totals].filter(([,w])=>Math.abs(w-max)<1e-9).map(([label])=>label),level:levels.some(n=>n>0)?levels.indexOf(Math.max(...levels)):null};
}
