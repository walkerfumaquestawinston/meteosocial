// This is a browser Maps key, restricted to our website and Maps JavaScript API.
// It is intentionally delivered to the renderer, never an OpenAI/server key.
function google3dEnabled(env){return env.GOOGLE_3D_ENABLED==='true'&&/^AIza[\w-]{35}$/.test(env.GOOGLE_MAPS_BROWSER_KEY||'')}
function google3dConfig(req,env){
 if(req.method!=='GET')return json({error:'Metodo non disponibile.'},405);
 if(!google3dEnabled(env))return json({error:'La vista Google 3D non è ancora disponibile.'},503);
 return json({key:env.GOOGLE_MAPS_BROWSER_KEY,provider:'google-maps-javascript',enabled:true});
}
