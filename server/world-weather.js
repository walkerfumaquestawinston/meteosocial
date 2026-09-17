// Shared, persistent source cache. Requests refresh at most every 15 minutes while viewed.
async function globeSnapshot(env,name,loader){const now=Date.now(),old=await q(env,'SELECT * FROM globe_snapshots WHERE name=?',name).first();const cached=()=>old?.payload?{...JSON.parse(old.payload),stale:true}:null;
 if(old?.payload&&now-old.updated<900000)return {...JSON.parse(old.payload),stale:false};
 const lock=await q(env,"INSERT INTO globe_snapshots(name,attempted,lease) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET attempted=excluded.attempted,lease=excluded.lease WHERE globe_snapshots.lease<? AND globe_snapshots.attempted<? RETURNING name",name,now,now+45000,now,now-60000).first();
 if(!lock){const value=cached();if(value)return value;fail(503,'La fonte è in aggiornamento. Riprova tra poco.')}
 try{const value=await loader();await q(env,'UPDATE globe_snapshots SET payload=?,updated=?,lease=0 WHERE name=? AND lease=?',JSON.stringify(value),now,name,now+45000).run();return {...value,stale:false}}
 catch(error){await q(env,'UPDATE globe_snapshots SET lease=0 WHERE name=? AND lease=?',name,now+45000).run();const value=cached();if(value)return value;throw error}
}
async function worldWeather(env){return json(await globeSnapshot(env,'weather-v1',async()=>{
 const batches=[];for(let start=0;start<WORLD_CITIES.length;start+=50)batches.push(WORLD_CITIES.slice(start,start+50));
 const groups=await Promise.all(batches.map(async batch=>{const params=new URLSearchParams({latitude:batch.map(p=>p.latitude).join(','),longitude:batch.map(p=>p.longitude).join(','),current:'temperature_2m,weather_code,is_day,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,cloud_cover',timezone:'GMT',forecast_days:'1'});
  let response;try{response=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:AbortSignal.timeout(25000)})}catch{fail(503,'Il meteo mondiale non risponde in tempo. Riprova tra poco; l’ultimo dato resta disponibile se già scaricato.');}if(!response.ok)fail(503,'La fonte meteo mondiale non risponde. Mostriamo l’ultimo aggiornamento disponibile.');const rows=await response.json();if(!Array.isArray(rows)||rows.length!==batch.length)fail(503,'Campione meteo incompleto.');
  return rows.map((r,i)=>({...batch[i],current:r.current&&Number.isFinite(r.current.temperature_2m)&&Number.isFinite(r.current.weather_code)?r.current:null}));
 }));const cities=groups.flat();
 return {cities,updated:Date.now(),source:'Open-Meteo',timezone:'UTC',sampleCount:WORLD_CITIES.length};
}))}
