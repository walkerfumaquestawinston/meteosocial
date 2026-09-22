import fs from 'node:fs';
import {workspaceBundle} from './tools/workspace-bundle.mjs';
import {build,transform,stop} from './tools/compiler.mjs';
import {execFileSync} from 'node:child_process';
import {RETIRED as retired,isRetired} from './tools/retired-modules.mjs';
// Le 200 citta del mondo vivono in dist/citta-mondo.js perche' servono a due
// padroni: il Worker le incorpora qui sotto rinominate WORLD_CITIES, e la mappa
// le legge nel browser quando il nostro server non risponde. Stesso trucco gia'
// usato per CITIES di places.js: una sola verita', non due copie che divergono.
// I comuni entrano nel Worker come letterale compatto, non come asset in base64:
// in forma di array pesano 481 KB invece di 1.044, e il base64 li gonfierebbe di
// un terzo. L'ordine per abitanti decrescente del file va preservato: l'API ci
// conta per tagliare in testa all'array invece di filtrare tutto.
function comuniLetterale(){
  const comuni=JSON.parse(fs.readFileSync('dati/comuni.json','utf8'));
  if(!comuni.length)throw Error('dati/comuni.json e vuoto: rigenera con tools/genera-comuni.mjs');
  const righe=comuni.map(c=>[c.istat,c.nome,c.prov,c.regione,c.lat,c.lng,c.abitanti]);
  return 'const MAPPA_COMUNI='+JSON.stringify(righe)+';\n';
}
let files=["local-map.js","local-map-weather.js","sky-postcard.js","local-map.css","assets/maplibre-gl.js","assets/maplibre-gl.css","assets/MAPLIBRE-LICENSE.txt","live-discovery.js","growth.js","arrival-estimate.js","public-zone.js","public-zone.css","local-weather.js","local-weather-rules.js","notifications.js","offline-store.js","offline.js","world-weather.js","schools.js","moderation.js","solar-position.js","photo-tools.js","community-features.js","onboarding.js","decisione.js","ui-feedback.js","assets/land-mesh.bin","assets/bricolage-latin.woff2","assets/BRICOLAGE-LICENSE.txt","sky-theme.js","sky-community.js","living-world.js","living-renderer.js","living-world.css","design-system.css","globe-conditions.js","hail-tools.js","hail-watch.js","google-3d.js","google-3d.css","google-3d-frame.html","google-3d-frame.js","climate-view.js","climate-view.css","hail-map.js","hail.js","hail.css","day-plan.js","atmosphere.js","atmosphere-core.js","atmosphere.css","lente.js","lente.css","fitcheck.js","fitcheck.css","climate-engine.js","studio-canvas.js","creator-studio.js","editorial-world.js","editorial.css","nearby.js","nearby-tools.js","city-challenges.js","community-pulse.js","pulse.css","atlas.js","atlas.css","atlas-map.js","planet.js","places.js","weather-art.js","weather-tools.js","assets/leaflet.js","assets/leaflet.css","assets/LEAFLET-LICENSE.txt"].concat(['community-context.js','community-hub.css','network.js','network.css','index.html','main.js','quick-report.js','refinements.css','assets/land-mesh.js','assets/NATURAL-EARTH.txt','sensory.js','sensory.css','sw.js','controller.js','experience.js','experience.css','global.js','global.css','social.js','avatar.js','social.css','globe.js','design.css','assets/THREE-LICENSE.txt','assets/earth.jpg','assets/three.module.js','assets/three.core.js']);
// Legacy sources remain in Git, never in the delivered module graph or shell cache.
// L'elenco vive in tools/retired-modules.mjs: lo condividono build e test.
files=files.filter(f=>!isRetired(f));
files.push('map-local-brief.js','map-cockpit.css','map-live-status.js','map-live.css','next-change.js','next-change.css','weather-scene.js','weather-scene.css','season-design.css','calendar-theme.js','season-dates.js','cielo-design.css','assets/cielo-atmosphere.webp','map-field-core.js','map-field-desk.js','map-weather-source.js','map-visuals.js','map-city-labels.js','map-land.js','map-radar.js','map-weather-core.js','mappa-eventi-controller.js','mappa-eventi.js','mappa-eventi.css','map-field.css','profession.js','daily-question.js','forecast-receipt.js','weather-page.js','weather-labels.js','app-updates.js','map-outline.js','map-radar-check.js');
fs.rmSync('dist/app',{recursive:true,force:true});
const bundle=await build({absWorkingDir:process.cwd(),entryPoints:['dist/main.js'],plugins:[workspaceBundle(process.cwd())],tsconfigRaw:{},outdir:'dist/app',bundle:true,splitting:true,format:'esm',minify:true,target:'es2022',metafile:true,entryNames:'main',chunkNames:'[name]-[hash]'});
// Keep dependency audit paths consistent across operating systems.
bundle.metafile.inputs=Object.fromEntries(Object.entries(bundle.metafile.inputs).map(([k,v])=>[k.replace(/^workspace:/,''),v]));
for(const input of Object.keys(bundle.metafile.inputs))if(retired.test(input.replace(/^dist\//,'')))throw Error('Retired module in bundle: '+input);
const styles=['design.css','social.css','global.css','experience.css','sensory.css','refinements.css','network.css','assets/leaflet.css','atlas.css','pulse.css','editorial.css','fitcheck.css','lente.css','atmosphere.css','living-world.css','design-system.css','local-map.css','mappa-eventi.css','map-field.css','community-hub.css','cielo-design.css','season-design.css','weather-scene.css','next-change.css','map-live.css','map-cockpit.css'];
// Preserve the former HTML cascade: app styles first, MapLibre styles last.
const css=await transform([...styles.map(f=>fs.readFileSync('dist/'+f,'utf8')),fs.readFileSync('node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')].join('\n'),{loader:'css',minify:true});
fs.writeFileSync('dist/app/style.css',css.code);
const appFiles=fs.readdirSync('dist/app').map(f=>'app/'+f);files.push(...appFiles);
const sw=fs.readFileSync('dist/sw.js','utf8').replace(/const APP_FILES=.*?;/,'const APP_FILES='+JSON.stringify(appFiles.map(f=>'/'+f))+';');fs.writeFileSync('dist/sw.js',sw);
fs.writeFileSync('tools/map-bundle-report.json',JSON.stringify({inputs:Object.keys(bundle.metafile.inputs),outputs:Object.fromEntries(Object.entries(bundle.metafile.outputs).map(([k,v])=>[k,v.bytes]))},null,2)+'\n');
for(const [from,to] of [['dist/maplibre-gl.js','maplibre-gl.js'],['dist/maplibre-gl.css','maplibre-gl.css'],['LICENSE.txt','MAPLIBRE-LICENSE.txt']])fs.copyFileSync('node_modules/maplibre-gl/'+from,'dist/assets/'+to);
const assets={};
const pwaFiles=['manifest.json','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-192.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','icons/favicon.ico','icons/og-preview.png'];
for(const file of pwaFiles)assets['/'+file]={data:fs.readFileSync(file).toString('base64'),type:file.endsWith('.json')?'application/manifest+json; charset=utf-8':file.endsWith('.ico')?'image/x-icon':'image/png'};
// Stop before packaging if a UI module contains invalid JavaScript.
for(const f of files.filter(f=>f.endsWith('.js')&&!f.startsWith('assets/')))execFileSync(process.execPath,['--check','dist/'+f],{stdio:'inherit'});
for(const f of files)assets['/'+f]={data:fs.readFileSync('dist/'+f).toString('base64'),type:f.endsWith('.woff2')?'font/woff2':f.endsWith('.webp')?'image/webp':f.endsWith('.bin')?'application/octet-stream':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript; charset=utf-8':f.endsWith('.css')?'text/css; charset=utf-8':f.endsWith('.txt')?'text/plain; charset=utf-8':'image/jpeg'};
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const assets='+JSON.stringify(assets)+';\n'+fs.readFileSync('dist/places.js','utf8').split('export const normalizeCity')[0].replace('export const CITIES','const ATLAS_CITIES')+'\n'+fs.readFileSync('dist/atmosphere-core.js','utf8').replace(/export /g,'')+'\n'+fs.readFileSync('server/hail-service.js','utf8')+'\n'+fs.readFileSync('server/google3d.js','utf8')+'\n'+fs.readFileSync('server/atmosphere.js','utf8')+'\n'+fs.readFileSync('server/assistant.js','utf8')+'\n'+fs.readFileSync('server/fitcheck.js','utf8')+'\n'+fs.readFileSync('server/studio.js','utf8')+'\n'+fs.readFileSync('server/pulse.js','utf8')+'\n'+fs.readFileSync('dist/citta-mondo.js','utf8').replace('export const CITTA_MONDO','const WORLD_CITIES')+'\n'+fs.readFileSync('server/world-weather.js','utf8')+'\n'+fs.readFileSync('server/globe-events.js','utf8')+'\n'+fs.readFileSync('server/atlas.js','utf8')+'\n'+fs.readFileSync('server/global.js','utf8')+'\n'+fs.readFileSync('server/social.js','utf8')+'\n'+fs.readFileSync('server/network.js','utf8')+'\n'+fs.readFileSync('server/profession.js','utf8')+'\n'+fs.readFileSync('server/sky.js','utf8')+'\n'+fs.readFileSync('server/questions.js','utf8')+'\n'+fs.readFileSync('server/answer-push.js','utf8')+'\n'+fs.readFileSync('server/moderation.js','utf8')+'\n'+fs.readFileSync('server/local-coast.js','utf8')+'\n'+fs.readFileSync('server/local-weather.js','utf8')+'\n'+fs.readFileSync('server/forecast-history.js','utf8')+'\n'+comuniLetterale()+fs.readFileSync('server/grandine-avviso.js','utf8').replace(/export /g,'')+'\n'+fs.readFileSync('server/mappa.js','utf8')+'\n'+fs.readFileSync('server/daily-question.js','utf8')+'\n'+fs.readFileSync('server/growth.js','utf8')+'\n'+fs.readFileSync('server/worker.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built MeteoSocial Worker and assets');

stop();
