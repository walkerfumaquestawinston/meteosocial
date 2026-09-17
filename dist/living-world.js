import {sampleExtremes,interestingPoint} from './world-weather.js';
import {createGlobeConditions} from './globe-conditions.js';
import {esc,weatherName,valueText} from './weather-tools.js';
import {googleFrameURL} from './google-3d.js';

export const LIVING_FEATURES={enabled:true,video:false,vocali:false,meteoClans:false,legacyCommunity:true};
const $=selector=>document.querySelector(selector);
const phenomena=[['rain','Pioggia'],['wind','Vento'],['cloud','Nuvole'],['hail','Grandine'],['snow','Neve'],['temperature','Temperatura'],['alert','Allerte']];

export function createLivingWorld(ctx){
  let pendingFocus=null,worldMeta={},highlightId='';
  let scene=null,revision=0,layer='people',frame=null,frameTimer=0,events=null,labels=true,selectedPhenomena=new Set(phenomena.map(([id])=>id));
  let reports=[],modelPoints=[],stats=null,loadState='idle',loadError='',lastPlace=null,focused=null;
  const conditions=createGlobeConditions({world:true,get:ctx.get,api:ctx.api,send:payload=>{if(frame)command('conditions',{markers:payload})},onRecords:(rows,meta)=>{worldMeta=meta||{};modelPoints=rows.map(r=>({...r,kind:r.category==='weather'?r.kind:r.category==='event'?'alert':r.category,created:r.category==='event'?r.catalogAt:r.at,expires:r.category==='event'?r.catalogAt+86400000:r.at+10800000,sourceRecord:true}));paintPoints();paintWorld()},focus:r=>ctx.showCondition(r)});
  const active=()=>ctx.get().route==='mondo';
  const requestReport=()=>ctx.report?.();
  function weatherLine(){
    const {place,weather,weatherError}=ctx.get(),c=weather?.current;
    return `<a id="living-weather-now" class="living-weather-now" href="#tendenze" aria-label="${esc(c?`${valueText(c.temperature_2m,'°')} · ${weatherName(c.weather_code)} · ${place.name}. Apri il meteo completo`:'Apri il meteo di '+place.name)}" ${!c&&!weatherError?'data-ui-loading="true" aria-busy="true"':''}><span data-ui-number>${c?valueText(c.temperature_2m,'°'):'—°'}</span><span aria-hidden="true"> · </span><span class="living-weather-condition">${esc(c?weatherName(c.weather_code):weatherError?'Meteo non disponibile':'Carico il meteo…')}</span><span aria-hidden="true"> · </span><span class="living-weather-city">${esc(place.name)}</span></a>`;
  }
  function page(){
    return `<section class="living-world" aria-labelledby="living-title">${weatherLine()}${ctx.dayPlan.compactHTML()}<h1 id="living-title">Il globo vivo</h1><p id="living-count" class="living-count" role="status">${counter()}</p>
      <div class="living-layers" role="group" aria-label="Cosa vedere sul globo">${[['people','🌍','Persone'],['weather','🌧','Meteo'],['satellite','🛰','Satellite']].map(([id,icon,label])=>`<button type="button" data-living-layer="${id}" aria-pressed="${layer===id}"><span aria-hidden="true">${icon}</span> ${label}</button>`).join('')}</div>
      <div class="living-world-tools"><button data-living-interest disabled>Portami dove succede qualcosa</button><details class="info-disclosure"><summary aria-label="Fonti e aggiornamento del globo">i</summary><p id="living-world-freshness" role="status">Carico meteo mondiale ed eventi NASA…</p></details></div>
      <div class="living-stage" aria-label="Globo interattivo"><div id="living-canvas" class="living-canvas"><div class="living-loading" role="status"><span class="living-loading-sphere" aria-hidden="true"></span><p>Accendo il mondo…</p></div></div><span class="living-center-label">${esc(ctx.get().place.name)}</span><div id="living-google" hidden></div>
      <details class="living-more"><summary>Altro</summary><div class="living-more-content"><h2>Esplora</h2><div class="living-command-grid"><button data-living-command="center">La mia città</button><button data-living-command="north">Nord ↑</button><button data-living-command="in" aria-label="Ingrandisci il globo">＋ Zoom</button><button data-living-command="out" aria-label="Riduci il globo">− Zoom</button><button data-living-command="fullscreen">Schermo intero</button><button data-living-command="relief" aria-pressed="false">Rilievi Google 3D</button><button data-living-command="labels" aria-pressed="true">Nomi e strade</button><button data-living-command="flat">Vista dall’alto</button></div><fieldset><legend>Fenomeni visibili</legend>${phenomena.map(([id,label])=>`<label><input type="checkbox" data-living-phenomenon="${id}" ${selectedPhenomena.has(id)?'checked':''}>${label}</label>`).join('')}</fieldset><p id="living-source">Geografia Natural Earth · giorno/notte calcolati dall’ora UTC, aggiornamento ogni minuto. I puntini delle città sono riferimenti geografici, non luci osservate dal satellite.</p><div class="living-more-links"><a href="#radar">Radar animato</a><a href="#grandine-mappa">Mappa grandine</a><a href="#tendenze">Tutti i livelli meteo</a><a href="#impostazioni">Comfort e animazioni</a><a href="#guida">Come si legge</a><a href="#assistente">Lente IA</a><a href="#studio">Studio creativo</a><a href="#mappa">Mappa 2D</a></div><details><summary>Fonti, eventi e dati dettagliati</summary>${conditions.panel()}</details><p id="living-status" role="status">Accendo il mondo…</p></div></details>
      <button type="button" class="living-report-button" data-living-report aria-label="Racconta il tuo cielo"><span aria-hidden="true">＋</span><span>Racconta il tuo cielo</span></button></div>
      <div class="living-caption"><span id="living-layer-description">${layerDescription()}</span><button data-living-nearby>Le persone nella zona</button></div><div id="living-world-extremes" aria-live="polite"></div><div id="living-highlight" aria-live="polite"></div><div id="living-empty">${empty()}</div><div id="living-feedback" aria-live="polite"></div></section>`;
  }
  function counter(){return stats?`${stats.people.toLocaleString('it-IT')} ${stats.people===1?'persona sta':'persone stanno'} raccontando il cielo in ${stats.countries} ${stats.countries===1?'paese':'paesi'}`:loadState==='error'?'Il contatore del mondo non è disponibile.':'Controllo chi sta raccontando il cielo…'}
  function layerDescription(){return layer==='people'?'Luci delle persone e città di notte. Tocca per esplorare.':layer==='weather'?'Open-Meteo · aloni azzurri: pioggia; bianchi: neve. Sono campioni locali del modello, non radar né confini delle precipitazioni.':'NASA Blue Marble · immagine geografica, non satellite live. Icone rosse: catalogo eventi NASA.'}
  function empty(){
    if(loadState==='error')return `<p class="living-error" role="alert">${esc(loadError||'Segnalazioni non disponibili. Riprova tra poco.')}</p><button data-living-retry>Riprova</button>`;
    if(!stats||reports.some(r=>Math.hypot((r.latitude-ctx.get().place.latitude)*111,(r.longitude-ctx.get().place.longitude)*111*Math.cos(r.latitude*Math.PI/180))<30))return '';
    const {place,weather}=ctx.get(),c=weather?.current;
    return `<div class="living-invitation"><p>${c?`${valueText(c.temperature_2m,'°')} · ${esc(weatherName(c.weather_code))}`:'Il meteo della zona è in caricamento.'}</p><h2>Com’è il cielo a ${esc(place.name)}?</h2><p>Condividi quello che vedi, in due tocchi.</p><button class="button living-primary" data-living-report>Racconta il tuo cielo</button></div><div data-live-discovery></div>`;
  }
  function stopGoogle(){clearTimeout(frameTimer);frame?.remove();frame=null;const host=$('#living-google');if(host)host.hidden=true;const globe=$('#living-canvas');if(globe)globe.hidden=false;document.querySelector('[data-living-command="relief"]')?.setAttribute('aria-pressed','false')}
  function command(action,extra={}){frame?.contentWindow?.postMessage({type:'meteosocial-google-command',action,...extra},location.origin)}
  function setLayer(value){layer=value;stopGoogle();scene?.setLayer(value);paintPoints();document.querySelectorAll('[data-living-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.livingLayer===value)));if($('#living-layer-description'))$('#living-layer-description').textContent=layerDescription();if($('#living-source'))$('#living-source').textContent=layerDescription();paintWorld()}
  function paintPoints(){scene?.setWeatherSamples(modelPoints.filter(r=>(r.current?.snowfall>0?selectedPhenomena.has('snow'):selectedPhenomena.has('rain'))));const rows=layer==='weather'?modelPoints:[...reports,...modelPoints.filter(r=>r.category==='event')];scene?.setReports(rows.filter(r=>selectedPhenomena.has(r.kind)||['dry','sun','model','moon','partly'].includes(r.kind)||r.sourceRecord&&r.category==='weather'&&['wind','cloud','temperature'].some(k=>selectedPhenomena.has(k))))}
  function paintWorld(){
    const node=$('#living-world-freshness'),weather=modelPoints.filter(r=>r.category==='weather'),catalog=modelPoints.filter(r=>r.category==='event'),age=t=>Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/60000))+' min fa':'non disponibile';
    if(node){const nasa=!Number.isFinite(worldMeta.eventUpdated)?'NASA EONET: catalogo non disponibile':Date.now()-worldMeta.eventUpdated>86400000?'NASA EONET: catalogo troppo vecchio, eventi non visualizzati':`NASA EONET: ${catalog.length} eventi disponibili · aggiornamento ${age(worldMeta.eventUpdated)}${worldMeta.eventsStale?' · catalogo conservato':''}`;node.textContent=`Open-Meteo: ${weather.length} campioni disponibili · aggiornamento ${age(worldMeta.updated)}${worldMeta.stale?' · ultimo dato conservato':''}. ${nasa}. Le icone rosse sono eventi NASA, non segnalazioni delle persone.`;}
    const button=$('[data-living-interest]');if(button)button.disabled=!interestingPoint(modelPoints);
    const extremes=$('#living-world-extremes'),values=sampleExtremes(modelPoints);
    if(extremes){extremes.hidden=layer!=='weather';extremes.innerHTML=values?`<p>Estremi fra i ${values.count} campioni disponibili, non record mondiali.</p><div class="actions"><button data-world-extreme="hot">Più caldo: ${esc(values.hot.name)} · ${valueText(values.hot.current.temperature_2m,'°')}</button><button data-world-extreme="cold">Più freddo: ${esc(values.cold.name)} · ${valueText(values.cold.current.temperature_2m,'°')}</button></div>`:'<p>Temperature del campione non disponibili.</p>';extremes.querySelectorAll('[data-world-extreme]').forEach(b=>b.onclick=()=>visit(values[b.dataset.worldExtreme]))}
    const target=modelPoints.find(r=>r.id===highlightId),highlight=$('#living-highlight');if(highlight){highlight.innerHTML=target?`<h2>${esc(target.icon)} ${esc(target.name)}</h2><p>${esc(target.value)} · ${esc(target.source)} · ultima posizione/dato: ${new Date(target.at).toLocaleString('it-IT')}</p>${target.category==='event'?`<p>Prima data nel catalogo: ${Number.isFinite(target.started)?new Date(target.started).toLocaleDateString('it-IT'):'non disponibile'}. Stato aperto nel catalogo, non una conferma in diretta.</p>`:''}<button data-world-detail>Leggi dettagli e fonte</button>`:'';highlight.querySelector('[data-world-detail]')?.addEventListener('click',()=>ctx.showCondition?.(target))}
  }
  function visit(target){if(!target)return;selectedPhenomena.add(target.kind);const filter=$('[data-living-phenomenon="'+target.kind+'"]');if(filter)filter.checked=true;highlightId=target.id;setLayer('weather');if(scene)scene.focus(target);else pendingFocus=target;paintWorld()}
  function status(text){if($('#living-status'))$('#living-status').textContent=text}
  function showPoint(point){focused=point;ctx.showZone?.(point,reports)}
  function showReport(report){focused=report;if(report.sourceRecord)ctx.showCondition?.(report);else ctx.showZone?.(report,reports)}
  async function startGoogle(){
    if(!ctx.get().google3dReady){status('I rilievi Google non sono disponibili qui. La vista satellite NASA resta attiva.');setLayer('satellite');return}
    setLayer('satellite');const host=$('#living-google');if(!host)return;
    host.hidden=false;host.innerHTML='<p role="status">Accendo il satellite Google…</p>';frame=document.createElement('iframe');frame.title='Rilievi Google nella stessa vista del globo';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='fullscreen';frame.src=googleFrameURL(ctx.get().place,{world:true})+'&compact=1';host.append(frame);$('#living-canvas').hidden=true;
    document.querySelector('[data-living-command="relief"]')?.setAttribute('aria-pressed','true');
    frameTimer=setTimeout(()=>{stopGoogle();status('Google non risponde. La vista satellite NASA resta disponibile.')},45000);
  }
  function bindButtons(){
    $('[data-living-interest]')?.addEventListener('click',()=>visit(interestingPoint(modelPoints)));paintWorld();
    document.querySelectorAll('[data-living-report]').forEach(b=>b.onclick=requestReport);
    document.querySelectorAll('[data-living-layer]').forEach(b=>b.onclick=()=>setLayer(b.dataset.livingLayer));
    document.querySelectorAll('[data-living-phenomenon]').forEach(b=>b.onchange=()=>{if(b.checked)selectedPhenomena.add(b.dataset.livingPhenomenon);else selectedPhenomena.delete(b.dataset.livingPhenomenon);paintPoints()});
    $('[data-living-nearby]')?.addEventListener('click',()=>showPoint(ctx.get().place));
    document.querySelectorAll('[data-living-command]').forEach(b=>b.onclick=async()=>{
      const action=b.dataset.livingCommand;
      if(action==='relief')return startGoogle();
      if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.living-stage')?.requestFullscreen()}catch{status('Schermo intero non disponibile. Puoi usare lo zoom.')}return}
      if(frame){if(action==='labels'){labels=!labels;b.setAttribute('aria-pressed',String(labels));command(action,{enabled:labels})}else command(action);return}
      if(action==='center')scene?.focus(ctx.get().place);
      if(action==='north'||action==='flat')scene?.north();
      if(action==='in')scene?.zoom(1.18);if(action==='out')scene?.zoom(.85);
      if(action==='labels')status('Nomi e strade sono disponibili nei rilievi Google. Tocca un punto per leggere la località.');
    });
  }
  async function bind(){
    if(!active())return;ctx.dayPlan.bindCompact();bindButtons();conditions.start();conditions.bind();events?.abort();events=new AbortController();
    window.addEventListener('message',e=>{if(!frame||e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.type!=='meteosocial-google-view')return;if(e.data.state==='ready'){clearTimeout(frameTimer);frame.previousElementSibling?.remove();command('relief');status('Google Maps · immagini geografiche, non in diretta.')}if(e.data.state==='error'){stopGoogle();status('Google non disponibile. Il globo resta utilizzabile.')}if(e.data.state==='point'&&Number.isFinite(e.data.point?.latitude)&&Number.isFinite(e.data.point?.longitude))showPoint(e.data.point)},{signal:events.signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)stopGoogle()},{signal:events.signal});
    const host=$('#living-canvas'),token=++revision;if(!host)return;
    try{const {mountLivingGlobe}=await import('./globe.js');if(token!==revision||!host.isConnected)return;scene=mountLivingGlobe(host,{center:ctx.get().place,getCenter:()=>ctx.get().place,onPoint:showPoint,onReport:showReport,onStatus:status});scene.setLayer(layer);paintPoints();if(pendingFocus){scene.focus(pendingFocus,{flash:true});pendingFocus=null}lastPlace=ctx.get().place}catch{if(host.isConnected)host.innerHTML='<div class="living-invitation"><h2>Il globo non è disponibile su questo dispositivo.</h2><p>Le segnalazioni restano nella vista a elenco.</p><a class="button" href="#community">Apri le persone nella zona</a></div>'}
  }
  return {
    page,bind,active,scene:()=>scene,
    setData(data){reports=data.reports||[];stats=data.stats||null;loadState='ready';loadError='';paintPoints();if($('#living-count')){const node=$('#living-count');node.textContent=counter()}if($('#living-empty')){$('#living-empty').innerHTML=empty();document.querySelectorAll('[data-living-report]').forEach(b=>b.onclick=requestReport)}},
    setError(error){loadState='error';loadError=error;if($('#living-count')){const node=$('#living-count');node.textContent=counter()}if($('#living-empty'))$('#living-empty').innerHTML=empty()},
    setModelPoints(points){modelPoints=points;paintPoints()},
    refreshWeather(){const line=$('#living-weather-now');if(line)line.outerHTML=weatherLine();conditions.refresh();if($('#living-empty')){$('#living-empty').innerHTML=empty();document.querySelectorAll('[data-living-report]').forEach(b=>b.onclick=requestReport)}},
    updatePlace(){const p=ctx.get().place;const label=$('.living-center-label');if(label)label.textContent=p.name;if(lastPlace?.latitude!==p.latitude||lastPlace?.longitude!==p.longitude){scene?.focus(p);lastPlace=p}this.refreshWeather()},
    celebrate(report){setLayer('people');if(scene)scene.focus(report,{flash:true});else pendingFocus=report},
    dispose(){conditions.stop();revision++;stopGoogle();scene?.dispose();scene=null;events?.abort();events=null}
  };
}
