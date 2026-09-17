function localCoastDistance(lat,lon){if(lat<34.5||lat>48.5||lon<5.5||lon>19.5)return null;const sx=111.195*Math.cos(lat*Math.PI/180),sy=111.195;let best=Infinity;for(const [ax,ay,bx,by] of LOCAL_COAST){if(Math.abs((ay+by)/2-lat)>1||Math.abs((ax+bx)/2-lon)>1.5)continue;const x=(ax-lon)*sx,y=(ay-lat)*sy,dx=(bx-ax)*sx,dy=(by-ay)*sy,t=Math.max(0,Math.min(1,-(x*dx+y*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(x+t*dx,y+t*dy))}return best}
async function localWeatherApi(req,env,url){if(req.method!=='GET')fail(405,'Solo lettura.');const kind=url.pathname.split('/').at(-1),latitude=Number(url.searchParams.get('lat')),longitude=Number(url.searchParams.get('lon'));if(!url.searchParams.has('lat')||!url.searchParams.has('lon')||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180||!['pollen','sea','snow'].includes(kind))fail(400,'Località non valida.');
 const lat=Math.round(latitude*100)/100,lon=Math.round(longitude*100)/100;
 const distance=kind==='sea'?localCoastDistance(latitude,longitude):null;
 if(kind==='sea'&&(distance===null||distance>15))return json({status:distance===null?'outside-coverage':'inland',distanceKm:Number.isFinite(distance)?distance:null});
 const month=Number(new Intl.DateTimeFormat('en',{timeZone:'Europe/Rome',month:'numeric'}).format(Date.now()));if(kind==='snow'&&month>3&&month<11)return json({status:'out-of-season'});
 const name='local:'+kind+':'+lat+':'+lon;
 const result=await globeSnapshot(env,name,async()=>{
 const hourly=kind==='pollen'?'alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen':kind==='sea'?'wave_height,wave_direction,wave_period,sea_surface_temperature':'snowfall_height,precipitation';
 const base=kind==='pollen'?'https://air-quality-api.open-meteo.com/v1/air-quality':kind==='sea'?'https://marine-api.open-meteo.com/v1/marine':'https://api.open-meteo.com/v1/dwd-icon';
 const params=new URLSearchParams({latitude:lat,longitude:lon,hourly,forecast_days:'2',timezone:'Europe/Rome',timeformat:'unixtime'});if(kind==='sea')params.set('cell_selection','sea');
 const d=await atmoFetch(base+'?'+params,160000);if(!Array.isArray(d.hourly?.time))throw Error('Dati non disponibili');
 const data={hourly:{time:d.hourly.time},elevation:d.elevation??null,timezone:d.timezone,latitude:d.latitude,longitude:d.longitude};for(const key of hourly.split(','))data.hourly[key]=d.hourly[key]||[];
 return {data,at:Date.now(),source:kind==='pollen'?'Open-Meteo / CAMS':kind==='sea'?'Open-Meteo Marine':'Open-Meteo / DWD ICON',status:'available'};
 });return json({...result,distanceKm:Number.isFinite(distance)?Math.round(distance*10)/10:null});
}
