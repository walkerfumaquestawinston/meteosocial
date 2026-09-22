// Intentionally public browser key; restrict it to the site and preview origins
// in MapTiler. Never use the WeatherAPI or a MapTiler service/admin credential.
function mapBasemapConfig(req,env){
 if(req.method!=='GET')return json({error:'Solo lettura.'},405);
 const key=env.MAPTILER_BROWSER_KEY||'',style=env.MAPTILER_STYLE_ID||'dataviz-v4';
 const enabled=env.MAPTILER_ENABLED==='true'&&/^[A-Za-z0-9_-]{8,100}$/.test(key)&&/^[a-zA-Z0-9_-]{1,100}$/.test(style);
 return json(enabled?{enabled:true,provider:'maptiler',key,style}:{enabled:false});
}
