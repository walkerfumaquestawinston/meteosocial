import {createHailRadar} from './map-hail-radar.js';
import {createMapTilerBase} from './map-basemap.js';
import {MAP_REFRESH_MS,sourceStatus,checkStatus,elapsedLabel,modelTime} from './map-live-status.js';
import {createFreshCache} from './map-fresh-cache.js';
import {createFieldDesk} from './map-field-desk.js';
import {FIELD_MODES} from './map-field-core.js';
import {normalizzaEventiNasa,abbinaMeteoCitta,mappaColore} from './mappa-eventi.js';
import {isStorm,hailLabel,precipitationLabel,validPlace,insideViewport,weatherPoints,visibleSummary,mapAIRequest,windReading,snowReading} from './map-weather-core.js';
import {createAtlasRadar} from './map-radar.js';
import {mapIcon,weatherArt,lightningGlyph} from './map-visuals.js';
import {readWeatherSnapshot} from './map-weather-source.js';
import {cityCatalog,arrangeCityLabels,weatherAge} from './map-city-labels.js';
import {CITTA_MONDO} from './citta-mondo.js';
import {CITIES} from './places.js';

const MODES = [
  {id:'temperature',icon:'◉',name:'Temperatura',hint:'Modello · °C',color:'#ffbb70'},
  {id:'pioggia',icon:'☂',name:'Pioggia',hint:'Modello · mm',color:'#6ac5ff'},
  {id:'neve',icon:'❄',name:'Neve',hint:'Modello · cm',color:'#a9def6'},
  {id:'grandine',icon:'◇',name:'Grandine',hint:'Radar Italia + community',color:'#ff9567'},
  {id:'vento',icon:'≋',name:'Vento',hint:'Modello · km/h',color:'#77dfcf'},
  {id:'fulmini',icon:'ϟ',name:'Temporali',hint:'Temporali da modello',color:'#d8b1ff'},
];
const CURRENT='temperature_2m,weather_code,is_day,precipitation,snowfall,wind_speed_10m,wind_direction_10m,cloud_cover';
const number=n=>Number.isFinite(n)?Math.round(n).toLocaleString('it-IT'):'—';
const clock=t=>Number.isFinite(t)?new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'—';
const weatherIcon=c=>isStorm(c)?'ϟ':c>=71&&c<=77?'❄':c>=51?'☂':c>1?'☁':'☀';

export function createMappaEventi(ctx) {
  const esc=ctx.esc, $=s=>document.querySelector(s);
  let fieldDesk,basemap=null,basemapActive=false,hailRadar=null,radarKind='rain';
  const activeRadar=()=>radarKind==='hail'?hailRadar:radar;
  function chooseRadar(kind,enabled=true){if(kind!==radarKind){const previous=activeRadar();radarKind=kind;previous?.setEnabled(false);}activeRadar()?.setEnabled(enabled);}
  let mapAppearance='auto';
  try{const saved=localStorage.getItem('meteosocial:map-appearance');if(['auto','giorno','notte'].includes(saved))mapAppearance=saved;}catch{}
  const mapPhase=()=>mapAppearance==='auto'?(globalThis.document?.documentElement?.dataset.phase==='notte'?'notte':'giorno'):mapAppearance;
  let L,map,markers,selectionMarker,timer,refreshTimer,clockTimer,alive=false,revision=0,panelRevision=0,searchRevision=0;
  let mode='temperature',showEvents=false,selected=null,world=[],towns=[],readings=new Map(),events=[],hail=[];
  let weatherState='loading',townState='loading',hailState='loading',eventState='idle',updated=null,selectedAt=0,townRequest=0;
  let paletteChanged,loadTask=null,checkedAt=0,sourcesOpen=false;
  let cityLabels,labelsFrame=0,showCityNames=true,overviewOpen=false,townWeatherRequest=0;
  const cache=createFreshCache(); let focusedBeforePanel=null,radar=null,radarState={enabled:false,frames:[],status:'idle'},aiHistory=[],aiPlaceKey='';
  try {const saved=localStorage.getItem('meteosocial:weather-map:mode');if(MODES.some(x=>x.id===saved))mode=saved;} catch {}

  function page(){return `<section class="mappa map-cockpit" data-map-theme="${mapPhase()}" data-mode="${mode}" style="--accent:${MODES.find(m=>m.id===mode).color}" aria-label="Atlante meteo interattivo">
    <div id="mappa-tela" class="mappa-tela" aria-label="Mappa. Usa anche Elenco luoghi per esplorare con la tastiera."></div>
    <div class="mappa-alto">
      <div class="mappa-brand"><span class="mappa-brand-symbol" aria-hidden="true">${mapIcon("radar")}</span><div><strong>MeteoSocial</strong><small>ATLANTE LOCALE</small></div><button id="mappa-zona" title="Torna alla tua città" aria-label="Torna alla tua città">${mapIcon("locate")}</button></div>
      <form id="mappa-cerca" class="mappa-cerca" role="search"><span aria-hidden="true">${mapIcon("search")}</span><label class="sr-only" for="mappa-cerca-testo">Cerca città nel mondo</label><input id="mappa-cerca-testo" type="search" placeholder="Cerca una città nel mondo…" maxlength="100" autocomplete="off"><button type="submit" aria-label="Cerca città">${mapIcon("arrow")}</button></form>
      <div class="mappa-contatori" role="group" aria-label="Fenomeno da esplorare">${MODES.map(m=>`<button class="mappa-pillola" data-livello="${m.id}" aria-label="${m.name}" aria-pressed="${mode===m.id}" style="--layer:${m.color}"><span class="mappa-pillola-icona" aria-hidden="true">${mapIcon(m.id)}</span><span><strong><span class="mode-full">${m.name}</span><span class="mode-short" aria-hidden="true">${m.id==='temperature'?'Temp.':m.name}</span></strong><small>${m.hint}</small></span><b data-conteggio="${m.id}">—</b></button>`).join('')}</div>
      <div class="mappa-stato"><span class="mappa-dot" aria-hidden="true"></span><span id="mappa-stato-testo" role="status">Carico i dati meteo…</span><button id="mappa-guida">Guida ↗</button></div>
      <div class="mappa-live-bar"><time id="mappa-now" aria-live="off"></time><span id="mappa-data-time" aria-live="off"></span><span id="mappa-freshness" class="mappa-freshness" aria-live="off">Controllo le fonti…</span><button id="mappa-fonti" aria-expanded="false" aria-controls="mappa-pannello">Fonti e orari</button></div><div class="mappa-subtools"><label class="map-mobile-layer"><span>Fenomeno</span><select id="mappa-layer-select" aria-label="Fenomeno">${MODES.map(m=>`<option value="${m.id}" ${mode===m.id?'selected':''}>${m.name}</option>`).join('')}</select></label><button id="mappa-radar-toggle" aria-pressed="false"><span aria-hidden="true">${mapIcon("radar")}</span> Radar pioggia <b>OFF</b></button><span id="mappa-radar-badge">Ultime 2 ore</span><button id="mappa-city-names" aria-pressed="true" title="Mostra o nascondi i nomi delle città">Aa <span>Città</span></button><button id="mappa-tools-open">${mapIcon("list")} Strumenti</button></div>
    </div>
    <section id="mappa-field" class="mappa-field" aria-label="Osservatorio meteo locale"></section>
    <div class="mappa-pulse is-compact" id="mappa-pulse" aria-label="Confronto nella zona visibile"></div>
    <aside class="mappa-pannello" id="mappa-pannello" hidden aria-labelledby="mappa-pannello-titolo"><div class="mappa-pannello-testa"><h2 id="mappa-pannello-titolo" tabindex="-1"></h2><button id="mappa-pannello-chiudi" aria-label="Chiudi dettagli">×</button></div><div id="mappa-pannello-corpo"></div></aside>
    <div class="mappa-strumenti" role="group" aria-label="Strumenti mappa">
      <button id="mappa-posizione" title="La mia posizione" aria-label="La mia posizione">${mapIcon("locate")}</button>
      <button id="mappa-mondo" title="Vedi il mondo" aria-label="Vedi il mondo">${mapIcon("world")}</button>
      <button id="mappa-elenco" title="Elenco luoghi" aria-label="Elenco luoghi">${mapIcon("list")}</button>
      <button id="mappa-eventi" title="Eventi naturali NASA" aria-label="Eventi naturali NASA" aria-pressed="false">${mapIcon("nature")}</button>
      <button id="mappa-aggiorna" title="Aggiorna dati" aria-label="Aggiorna dati">${mapIcon("refresh")}</button>
      <div class="mappa-zoom"><button id="mappa-zoom-in" aria-label="Aumenta zoom">${mapIcon("plus")}</button><button id="mappa-zoom-out" aria-label="Riduci zoom">${mapIcon("minus")}</button></div>
    </div>
    <button class="mappa-reading" id="mappa-selected" hidden></button>
    <div class="mappa-basso">
      <div id="mappa-radar-timeline" class="mappa-radar-timeline" hidden><div class="mappa-radar-heading"><strong id="mappa-radar-heading">RADAR PIOGGIA</strong><span id="mappa-radar-note" role="status"></span><a id="mappa-radar-source" href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer ↗</a></div><div class="mappa-radar-track"><button id="mappa-radar-play" aria-label="Riproduci radar">▶</button><time id="mappa-radar-time">—</time><label class="sr-only" for="mappa-radar-range">Orario del radar</label><input id="mappa-radar-range" type="range" min="0" max="0" value="0" disabled><button id="mappa-radar-latest" aria-label="Torna all’ultimo quadro radar">Ultimo</button><button id="mappa-radar-retry" aria-label="Aggiorna radar">↻</button></div><p id="mappa-radar-explanation">Immagini recenti, non previsioni. Copertura variabile: una zona vuota non esclude pioggia.</p><div id="mappa-hail-scale" hidden><span>Probabilità</span><i style="background:#ffcd50"></i>10–30% <i style="background:#f98b3d"></i>30–50% <i style="background:#de3d5b"></i>50–80% <i style="background:#a02cb9"></i>80–100%</div></div>
      <div class="mappa-legenda" id="mappa-legenda"></div>
      <details class="mappa-ai-dock map-help"><summary>Chiedi una spiegazione a Lente IA</summary><div id="mappa-ai-suggestions" class="mappa-ai-suggestions" aria-label="Domande suggerite"></div><form class="mappa-ia" id="mappa-ia"><span class="mappa-ia-marchio">${mapIcon("ai")}<span>LENTE <small>IA</small></span></span><label class="sr-only" for="mappa-ia-testo">Chiedi all’IA del luogo selezionato</label><input id="mappa-ia-testo" type="text" maxlength="700" placeholder="Leggi la zona insieme a Lente…" autocomplete="off"><button id="mappa-ia-invia" type="submit" aria-label="Invia domanda all’IA">${mapIcon("arrow")}</button></form><div id="mappa-ai-context" class="mappa-ai-context"></div></details>
      <p class="mappa-attribuzioni"><a class="mappa-maptiler-attribution" hidden href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">© MapTiler · </a><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a> · <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a><span> · Catalogo comuni derivato ISTAT · NASA EONET</span></p>
    </div>
  </section>`;}

  function bounds(){if(!map)return null;const b=map.getBounds();return {west:b.getWest(),east:b.getEast(),south:b.getSouth(),north:b.getNorth()};}
  const allPoints=()=>weatherPoints(world,towns,readings,selected);
  const summary=()=>visibleSummary(allPoints().filter(p=>!weatherAge(p.current).stale),bounds());
  const visibleReports=()=>hail.filter(p=>insideViewport(p,bounds()));
  function notify(text){const el=$('#mappa-stato-testo');if(el)el.textContent=text;}
  function renderRadar(state){
    const resized=radarState.enabled!==state.enabled;radarState=state;if(!alive)return;
    if(resized)requestAnimationFrame(()=>{if(alive)map?.invalidateSize({pan:false});});
    const isHail=radarKind==='hail';
    $('#mappa-radar-heading').textContent=isHail?'GRANDINE · ITALIA':'RADAR PIOGGIA';
    const source=$('#mappa-radar-source');source.textContent=isHail?'Radar-DPC · CC BY-SA ↗':'RainViewer ↗';source.href=isHail?'https://dpc-radar.readthedocs.io/it/latest/':'https://www.rainviewer.com/';
    $('#mappa-radar-explanation').innerHTML=isHail?'<span class="radar-note-full">POH: probabilità stimata da radar, non grandine confermata. Italia, copertura non uniforme. Trasparente: valore sotto 10% oppure dato assente. Non indica zone sicure.</span><span class="radar-note-mobile">Stima POH · Italia. Trasparente ≠ assenza di grandine.</span>':'Immagini recenti, non previsioni. Copertura variabile: una zona vuota non esclude pioggia.';
    $('#mappa-hail-scale').hidden=!isHail;
    $('#mappa-radar-range').hidden=isHail;$('#mappa-radar-play').hidden=isHail;$('#mappa-radar-latest').hidden=isHail;
    const toggle=$('#mappa-radar-toggle');toggle?.setAttribute('aria-pressed',String(state.enabled));if(toggle)toggle.innerHTML=mapIcon('radar')+' '+(isHail?'Radar grandine':'Radar pioggia')+' <b>'+(state.enabled?'ON':'OFF')+'</b>';
    $('.mappa')?.classList.toggle('has-radar',state.enabled);$('#mappa-radar-timeline').hidden=!state.enabled;
    const note=state.status==='loading'?'Caricamento…':state.status==='error'?'Fonte non disponibile. Riprova.':state.status==='partial'?'Alcune immagini non disponibili':state.status==='tiles'?'Carico la vista…':isHail?`Ultimo quadro · ${state.age??'—'} min fa`:state.age>25?`Ultimo quadro di ${state.age} min fa`:'Sequenza recente';
    $('#mappa-radar-note').textContent=note;$('#mappa-radar-badge').textContent=state.enabled?note:'Ultime 2 ore';
    const range=$('#mappa-radar-range');range.max=Math.max(0,state.frames.length-1);range.value=state.index||0;range.disabled=state.frames.length<2;scheduleLabels();
    const time=state.time?clock(state.time*1000):'—';$('#mappa-radar-time').textContent=time;range.setAttribute('aria-valuetext',time+' · orario del quadro radar');renderFreshness();$('#mappa-radar-latest').disabled=!state.frames.length||state.index===state.frames.length-1;
    $('#mappa-radar-play').textContent=state.playing?'Ⅱ':'▶';$('#mappa-radar-play').setAttribute('aria-label',state.playing?'Pausa radar':'Riproduci radar');$('#mappa-radar-play').disabled=state.frames.length<2;
  }
  function renderSuggestions(){
    const questions=mode==='neve'?[['Quanta neve?',FIELD_MODES.neve.question],['Neve e zero termico','Spiega la differenza tra neve fresca, neve al suolo e zero termico usando i dati della località. Non ricavare la quota neve dalla sola temperatura.']]:mode==='grandine'?[['Leggi la grandine','Cosa sappiamo della grandine qui? Distingui previsioni e osservazioni e indica cosa manca.'],['Prossime ore','Riassumi le prossime 3 ore della località selezionata, con incertezza e orari.']]:mode==='vento'?[['Quanto vento?','Spiega vento e raffiche nelle prossime 3 ore: orari, km/h e limiti della previsione.'],['Quando diminuisce?','Nelle prossime ore il vento diminuisce? Usa gli orari e i dati disponibili.']]:[['Prossime 3 ore','Riassumi le prossime 3 ore della località selezionata: pioggia, temperatura e vento.'],['Quando piove?','Quali ore hanno maggiore probabilità di pioggia nella località selezionata? Non inventare minuti di arrivo.']];
    questions[0]=[mode==='temperature'?'Comfort nelle prossime ore':mode==='pioggia'?'Una pausa dalla pioggia?':mode==='fulmini'?'Quando sono previsti temporali?':questions[0][0],FIELD_MODES[mode].question];
    questions.push(['Leggi il radar','Spiega come leggere il radar della mappa e distinguilo dalla previsione locale. Non hai accesso ai pixel del radar.']);
    const slot=$('#mappa-ai-suggestions');if(!slot)return;slot.innerHTML=questions.map(([label],i)=>`<button data-ai-prompt="${i}">${esc(label)} ↗</button>`).join('');slot.querySelectorAll('[data-ai-prompt]').forEach(b=>b.onclick=()=>askAI(questions[+b.dataset.aiPrompt][1]));
    $('#mappa-ai-context').textContent=selected?`Contesto: ${selected.name} · ${MODES.find(m=>m.id===mode).name} · IA su richiesta`:'Seleziona una città per una risposta locale';
  }
  function selectMode(value){
    if(!MODES.some(m=>m.id===value))return;mode=value;$('#mappa-layer-select').value=mode;$('.mappa').dataset.mode=mode;$('.mappa').style.setProperty('--accent',MODES.find(m=>m.id===mode).color);try{localStorage.setItem('meteosocial:weather-map:mode',mode);}catch{}
    document.querySelectorAll('[data-livello]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.livello===mode)));closePanel();draw();renderSuggestions();
    if(mode==='grandine')chooseRadar('hail');else if(mode==='pioggia')chooseRadar('rain');else if(radarKind==='hail')chooseRadar('rain',false);
  }
  const cached=(key,load,ttl=MAP_REFRESH_MS)=>cache.read(key,load,ttl);
  const mapSource=()=>paidSource?'WeatherAPI':'Open-Meteo';
  let paidSource=false,sourceReady=null,visibleRequest=0;
  let preparation;
  const preload=()=>preparation||(preparation=Promise.all([import('./assets/leaflet.js'),import('./map-land.js')]).catch(error=>{preparation=null;throw error}));
  async function worldData(){
    return readWeatherSnapshot(()=>ctx.api('atlas/world'),async()=>{
      const {CITTA_MONDO}=await import('./citta-mondo.js');const groups=[];
      for(let i=0;i<CITTA_MONDO.length;i+=50)groups.push(CITTA_MONDO.slice(i,i+50));
      const batches=await Promise.allSettled(groups.map(async group=>{
        const p=new URLSearchParams({latitude:group.map(c=>c.latitude).join(','),longitude:group.map(c=>c.longitude).join(','),current:CURRENT,timezone:'GMT',forecast_days:'1'});
        const response=await fetch('https://api.open-meteo.com/v1/forecast?'+p,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Meteo non disponibile');
        const rows=abbinaMeteoCitta(group,await response.json());if(!rows)throw Error('Campione incompleto');return rows;
      }));
      const cities=batches.flatMap(r=>r.status==='fulfilled'?r.value:[]);if(!cities.length)throw Error('Meteo non disponibile');
      return {cities,updated:Date.now(),direct:true,partial:batches.some(r=>r.status==='rejected')};
    });
  }
  async function loadVisibleWeather(token){
    const request=++visibleRequest;
    const candidates=cityCatalog([], [...CITIES,...CITTA_MONDO],towns,selected).filter(p=>insideViewport(p,bounds())).slice(0,8);
    const rows=[];
    // Bounded sequential calls: stop spending requests once the view changes.
    for(const p of candidates){
      if(!alive||token!==revision||request!==visibleRequest||document.hidden)return;
      try{const d=await pointWeather(p);rows.push({...p,current:d.current});}catch{}
    }
    if(alive&&token===revision&&request===visibleRequest){world=rows;weatherState=rows.length===candidates.length?'ok':rows.length?'partial':'error';updated=Date.now();draw();}
  }
  async function loadWeather(token){
    if(paidSource)return loadVisibleWeather(token);
    await Promise.allSettled([
      (async()=>{try{const d=await cached('world',worldData,0);if(!alive||token!==revision)return;world=d.cities||[];updated=d.updated;weatherState=d.stale?'stale':d.partial?'partial':d.direct?'direct':'ok';}catch{if(token===revision)weatherState=world.length?'stale':'error';}if(token===revision)draw();})(),

    ]);
  }
  async function loadTownWeather(token){
    if(paidSource){readings.clear();townState='ok';return loadVisibleWeather(token);}
    const request=++townWeatherRequest,ids=towns.slice(0,24).map(c=>c[0]).sort();
    if(!ids.length){readings.clear();townState='ok';return;}
    try{const d=await cached('town-weather:'+ids.join(','),()=>ctx.api('mappa/meteo?ids='+encodeURIComponent(ids.join(','))),60000);
      if(!alive||token!==revision||request!==townWeatherRequest)return;readings=new Map((d.dati||[]).map(r=>[r[0],r]));townState=d.stale?'stale':'ok';
    }catch{if(token===revision&&request===townWeatherRequest)townState='error';}
    if(alive&&token===revision){draw();renderFreshness();}
  }
  async function loadTowns(token){
    const request=++townRequest;
    const b=bounds();if(!b)return;
    // Clamp a wrapped view to one world; the UI filters the antimeridian itself.
    const bbox=[Math.max(-180,b.west),Math.max(-90,b.south),Math.min(180,b.east),Math.min(90,b.north)].map(x=>x.toFixed(3)).join(',');
    const key='towns:'+Math.round(map.getZoom())+':'+bbox;
    try{const d=await cached(key,()=>ctx.api(`mappa/comuni?bbox=${bbox}&zoom=${Math.round(map.getZoom())}`));if(!alive||token!==revision||request!==townRequest)return;towns=d.dati||[];}catch{if(token===revision&&request===townRequest)towns=[];}
    if(token===revision&&request===townRequest){draw();await loadTownWeather(token);}
  }
  async function loadHail(token){
    try{const d=await cached('hail',()=>ctx.api('atlas/hail-map'),60000);if(!alive||token!==revision)return;hail=(d.posts||[]).filter(p=>Number.isFinite(p.map_lat)&&Number.isFinite(p.map_lon)).map(p=>({...p,latitude:p.map_lat/100,longitude:p.map_lon/100})).filter(validPlace);hailState='ok';}catch{if(token===revision)hailState='error';}if(token===revision)draw();
  }
  async function loadEvents(token){
    if(!showEvents)return;
    try{const d=await cached('events',async()=>{try{return await ctx.api('atlas/events');}catch{const r=await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return {events:normalizzaEventiNasa(await r.json()),direct:true};}});if(!alive||token!==revision)return;events=d.events||[];eventState=d.stale?'stale':'ok';}catch{if(token===revision)eventState='error';}if(token===revision)draw();
  }
  async function loadSelected(token){
    if(!selected)return;const place={...selected},at=selectedAt;
    try{const d=await pointWeather(place,true);if(alive&&token===revision&&at===selectedAt){selected={...place,current:d.current,refreshFailed:false};draw();}}catch{if(alive&&token===revision&&at===selectedAt){selected={...place,refreshFailed:true};renderFreshness();}}
  }
  async function load(){if(!alive||!map||document.hidden)return;if(loadTask)return loadTask;const token=revision;const task=Promise.allSettled([loadSelected(token),...(paidSource?[]:[loadWeather(token)]),loadTowns(token),loadHail(token),loadEvents(token)]).finally(()=>{if(loadTask===task)loadTask=null;if(alive&&token===revision){checkedAt=Date.now();renderFreshness();}});loadTask=task;renderFreshness();return task;}
  function renderFreshness(){
    const slot=$('#mappa-freshness');if(!slot)return;
    const failed=selected?.refreshFailed||['error','stale','partial'].includes(weatherState)||['error','stale'].includes(townState)||hailState==='error'||(radarState.enabled&&['error','partial'].includes(radarState.status));
    const status=checkStatus({checkedAt,checking:!!loadTask,failed,outdated:!!selected?.current&&sourceStatus({current:selected.current}).stale,offline:navigator.onLine===false});
    slot.textContent=status.label;slot.dataset.tone=status.tone;
    const now=new Date(),at=modelTime(selected?.current);
    const radarAt=radarState.enabled&&Number.isFinite(radarState.time)?radarState.time*1000:null;
    $('#mappa-now').textContent=radarState.enabled?(radarKind==='hail'?'RADAR GRANDINE':'RADAR PIOGGIA'):(paidSource?'METEO WEATHERAPI':'MODELLO OPEN-METEO');
    $('#mappa-now').title='Fonte del livello sulla mappa; il meteo locale ha il proprio orario nel pannello';
    const shownAt=radarState.enabled?radarAt:at;
    $('#mappa-data-time').textContent=shownAt===null?'Dato del livello non disponibile':clock(shownAt)+' · '+elapsedLabel(shownAt);
    $('#mappa-data-time').dataset.old=String(shownAt===null||Date.now()-shownAt>30*60000);
    if(sourcesOpen){
      const info=sourceStatus({checkedAt,current:selected?.current,radar:radarState});if(paidSource)info.model=info.model.replace('Modello:','WeatherAPI:');
      const model=$('#mappa-source-model'),check=$('#mappa-source-check'),frame=$('#mappa-source-radar');
      if(check)check.textContent=status.label;
      if(model)model.textContent=info.model+(selected?.current?' · '+elapsedLabel(modelTime(selected.current)):'')+(selected?.refreshFailed?' · recupero fallito':'');
      if(frame)frame.textContent=info.radar+(radarState.status==='error'?' · recupero fallito':'');
    }
  }
  function toolsPanel(){
    const actions=[['local-details','list','Dettagli della località','Fonte, quantità e collegamenti'],['mappa-posizione','locate','La mia posizione','Solo con il tuo permesso'],['mappa-zona','locate','La tua città','Ritorna alla località scelta'],['mappa-elenco','list','Elenco località','Esplora anche senza muovere la mappa'],['mappa-city-names','world',showCityNames?'Nascondi nomi città':'Mostra nomi città','Scegli quanto dettaglio vedere'],['mappa-mondo','world','Vista mondiale','Confronta zone lontane'],['mappa-aggiorna','refresh','Controlla le fonti','Richiedi un nuovo controllo'],['mappa-guida','radar','Come leggere la mappa','Simboli, quantità e limiti'],['mappa-eventi','nature',showEvents?'Nascondi eventi naturali':'Eventi naturali','Catalogo NASA, separato dal meteo']];
    panel('Strumenti della mappa',`<label class="map-appearance">Aspetto della mappa<select id="map-appearance">${[['auto','Automatico · giorno e notte'],['giorno','Sempre chiara'],['notte','Sempre scura']].map(([v,t])=>`<option value="${v}" ${mapAppearance===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="field-note">Automatico segue alba e tramonto della località impostata nell’app. In assenza di orari solari usa 07–19 nel suo fuso.</p><h3>Livelli meteo</h3><div class="map-layer-directory">${MODES.map(m=>`<button data-map-layer="${m.id}"><b>${m.name}</b><small>${m.hint}</small></button>`).join('')}</div><h3>Radar e osservazioni</h3><div class="map-tool-grid"><button id="map-directory-radar">${mapIcon('radar')}<span><b>Radar pioggia e neve</b><small>Sequenza osservata · ultime 2 ore</small></span></button><p class="field-note">Grandine: probabilità radar POH della Protezione Civile in Italia, più osservazioni della community separate.</p>${actions.map(([id,icon,title,detail])=>`<button data-map-action="${id}">${mapIcon(icon)}<span><b>${title}</b><small>${detail}</small></span></button>`).join('')}</div>`);
    $('#map-appearance').onchange=e=>{mapAppearance=e.target.value;try{localStorage.setItem('meteosocial:map-appearance',mapAppearance);}catch{}paletteChanged?.();};
    document.querySelectorAll('[data-map-layer]').forEach(b=>b.onclick=()=>selectMode(b.dataset.mapLayer));
    $('#map-directory-radar').onclick=()=>selectMode('pioggia');
    document.querySelectorAll('[data-map-action]').forEach(button=>button.onclick=()=>{const target=document.getElementById(button.dataset.mapAction);closePanel();if(button.dataset.mapAction==='local-details'&&selected)locationPanel(selected);else target?.click();});
  }
  function sourcePanel(){
    panel('Fonti e orari',`<p>Località: <strong>${esc(selected?.name||'nessuna selezionata')}</strong></p><dl class="mappa-source-list"><dt>Ultimo controllo delle fonti</dt><dd id="mappa-source-check"></dd><dt>Meteo della località · ${paidSource?'WeatherAPI':'Open-Meteo'}</dt><dd id="mappa-source-model"></dd><dt>Quadro radar · ${radarKind==='hail'?'Radar-DPC POH':'RainViewer'}</dt><dd id="mappa-source-radar"></dd></dl><p>L’età del dato cambia ogni secondo; non è una nuova misura. Il pannello Adesso mostra WeatherAPI, quando disponibile, con il suo orario. Cerchiamo nuovi dati ogni minuto mentre la mappa è aperta e al ritorno alla pagina.</p><p>Le condizioni WeatherAPI hanno aggiornamenti della fonte ogni 10–15 minuti; le stime Open-Meteo hanno passi di 15 minuti. Le previsioni orarie hanno una cache fino a 15 minuti. RainViewer espone quadri ogni 10 minuti; Radar-DPC POH ha un passo di 5 minuti: ciascun quadro può combinare misure di orari diversi.</p><p>I controlli non creano nuove misure. Se una fonte non risponde, mostriamo il problema e conserviamo l’orario del dato precedente. Gli orari qui sono nel fuso del dispositivo; le previsioni orarie usano quello della località.</p><p>Grandine e altre osservazioni provengono dalla community, non sono verificate e riportano l’orario dichiarato. Nessuna segnalazione non significa assenza di fenomeni.</p><button id="mappa-source-refresh" class="mappa-primary">Controlla adesso</button>`);
    sourcesOpen=true;$('#mappa-fonti')?.setAttribute('aria-expanded','true');renderFreshness();
    $('#mappa-source-refresh').onclick=()=>$('#mappa-aggiorna')?.click();
  }

  function scheduleLabels(){cancelAnimationFrame(labelsFrame);labelsFrame=requestAnimationFrame(()=>{if(alive){$('.mappa')?.style.setProperty('--local-dock-height',($('#mappa-field')?.offsetHeight||200)+'px');drawCityLabels();}});}
  function labelText(p){
    const k=p.current;if(!k)return '';if(weatherAge(k).stale)return '';
    if(mode==='temperature')return Number.isFinite(k.temperature_2m)?number(k.temperature_2m)+'°':'';
    if(mode==='vento')return windReading(k)?number(k.wind_speed_10m)+' km/h':'';
    if(mode==='neve'){const snow=snowReading(k);return snow?.amount>0?String(snow.amount)+' cm':snow?.indicated?'Neve · modello':p.selected&&snow?.amount===0?'0 cm':'';}
    if(mode==='pioggia')return Number.isFinite(k.precipitation)&&(k.precipitation>0||p.selected)?String(k.precipitation)+' mm':'';
    if(mode==='fulmini')return isStorm(k.weather_code)?'Temporale · modello':'';
    return '';
  }
  function drawCityLabels(){
    if(!alive||!map||!cityLabels)return;cityLabels.clearLayers();if(!showCityNames)return;
    const root=$('#mappa-tela').getBoundingClientRect(),reserved=[];
    for(const selector of ['.mappa-alto','.mappa-field','.mappa-pulse','.mappa-pannello','.mappa-strumenti','.mappa-radar-timeline','.mappa-legenda','.mappa-ai-dock','.mappa-attribuzioni','.mappa-reading','.leaflet-control-scale']){
      const el=$(selector);if(!el||el.hidden||!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')continue;
      const r=el.getBoundingClientRect();reserved.push({left:r.left-root.left,right:r.right-root.left,top:r.top-root.top,bottom:r.bottom-root.top});
    }
    const catalog=cityCatalog(allPoints(),[...CITIES.map(c=>({...c,localized:true})),...CITTA_MONDO],towns,selected);
    const candidates=catalog.filter(p=>insideViewport(p,bounds())&&(p.selected||labelText(p))).map((p,i)=>{
      const lng=p.longitude+360*Math.round((map.getCenter().lng-p.longitude)/360),xy=map.latLngToContainerPoint([p.latitude,lng]),text=labelText(p);
      return {...p,lng,x:xy.x,y:xy.y,text,width:Math.min(210,Math.max(106,p.name.length*7.2+24,text.length*7+28)),height:p.name.length>25&&text?64:48,priority:p.selected?100000:(text?2000:0)+Math.max(0,500-i)};
    });
    const limit=map.getZoom()<6?(root.width<600?4:8):(root.width<600?8:16);
    const placed=arrangeCityLabels(candidates,{width:root.width,height:root.height},reserved,limit);
    for(const p of placed){
      const age=weatherAge(p.current),stale=p.current&&(age.stale);
      const tone=mode==='temperature'&&p.current?mappaColore(p.current.temperature_2m):MODES.find(m=>m.id===mode).color;
      const icon=L.divIcon({className:'mappa-place-label mode-'+mode+(p.selected?' is-selected':'')+(stale?' is-old':''),html:'<span class="mappa-place-name">'+esc(p.name)+'</span><span class="mappa-place-value" style="--reading:'+tone+'">'+esc(p.text)+(stale&&p.text?'<small aria-label="Dato precedente"> ◷</small>':'')+'</span>',iconSize:[p.width,p.height],iconAnchor:[-p.dx,-p.dy]});
      const marker=L.marker([p.latitude,p.lng],{icon,title:p.name+(p.text?' · '+p.text:'')+(p.current?' · '+sourceTime(p.current)+' · '+age.label:''),alt:p.name+(p.text?', '+p.text:'')+', apri dettagli',bubblingMouseEvents:false,riseOnHover:true,zIndexOffset:1000});
      marker.on('click',()=>selectPlace(p,false));cityLabels.addLayer(marker);marker.getElement()?.setAttribute('aria-label',p.name+(p.text?', '+p.text:'')+', apri dettagli');
      cityLabels.addLayer(L.circleMarker([p.latitude,p.lng],{radius:p.selected?4:2,weight:1,color:'#bedbe5',fillColor:'#edfaff',fillOpacity:.85,interactive:false}));
    }
  }
  function draw(){
    if(!alive||!map||!markers)return;markers.clearLayers();
    const s=summary();
    const marker=(p,color,radius,open,fill=.9)=>{const m=L.circleMarker([p.latitude,p.longitude],{bubblingMouseEvents:false,radius,color:'#06171f',weight:1.5,fillColor:color,fillOpacity:fill});m.on('click',open);m.bindTooltip(esc(p.name||p.city||'Segnalazione'),{direction:'top'});markers.addLayer(m);};
    if(mode!=='grandine')for(const p of s.points){
      const k=p.current;if(weatherAge(k).stale)continue;let color=mappaColore(k.temperature_2m),radius=4;
      if(mode==='temperature'){const halo=L.circleMarker([p.latitude,p.longitude],{radius:10,color,weight:1,opacity:.25,fillColor:color,fillOpacity:.08,interactive:false});markers.addLayer(halo);}
      if(mode==='neve'){const snow=snowReading(k);if(!snow?.indicated)continue;color='#a9def6';radius=Math.min(14,6+(snow.amount||0)*3);}
      if(mode==='pioggia'){if(!(k.precipitation>0))continue;color='#6ac5ff';radius=Math.min(16,6+k.precipitation*2);}
      if(mode==='fulmini'){
        if(!isStorm(k.weather_code))continue;
        const label=p.name+', temporale da modello, '+sourceTime(k);
        const pin=L.marker([p.latitude,p.longitude],{bubblingMouseEvents:false,title:label,alt:label,icon:L.divIcon({className:'lightning-pin is-model',html:lightningGlyph(),iconSize:[44,48],iconAnchor:[22,40]})});
        pin.on('click',()=>selectPlace(p,false));pin.bindTooltip(esc(label));markers.addLayer(pin);pin.getElement()?.setAttribute('aria-label',label);continue;
      }
      if(mode==='vento'){
        const w=windReading(k);if(!w)continue;
        const icon=L.divIcon({className:'mappa-wind-vector',html:'<span style="--wind:'+w.color+';--bearing:'+(w.toward??0)+'deg">'+(w.toward===null||w.speed===0?'·':'↑')+'</span>',iconSize:[28,28],iconAnchor:[14,14]});
        const pin=L.marker([p.latitude,p.longitude],{icon,title:p.name,alt:p.name+', vento '+number(w.speed)+' km/h',bubblingMouseEvents:false});pin.on('click',()=>selectPlace(p,false));markers.addLayer(pin);pin.getElement()?.setAttribute('aria-label',p.name+', vento '+number(w.speed)+' km/h');continue;
      }
      marker(p,color,radius,()=>selectPlace(p,false));
    }
    // The field desk renders fresh, scoped community markers in every layer.
    if(showEvents)for(const e of events.filter(p=>insideViewport(p,bounds())))marker(e,'#ff6577',9,()=>eventPanel(e));
    const counts={neve:s.snow.length,temperature:s.points.length,pioggia:s.rain.length,grandine:mode==='grandine'?fieldDesk?.count():visibleReports().length,vento:s.points.filter(p=>windReading(p.current)).length,fulmini:s.storms.length};
    for(const m of MODES){const c=$('[data-conteggio="'+m.id+'"]');if(c)c.textContent=(counts[m.id]==null||(m.id==='grandine'?hailState==='error':!s.points.length&&['error','loading'].includes(weatherState)))?'—':counts[m.id];}
    const date=updated?new Date(updated).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'orario non disponibile';
    const state=weatherState==='loading'?'Carico i dati meteo…':weatherState==='error'?'Meteo non disponibile · città esplorabili':weatherState==='stale'?'Dati precedenti del '+date:weatherState==='partial'?'Copertura parziale · '+mapSource()+' · '+date:'Modello · campione acquisito '+clock(updated)+(weatherState==='direct'?' · fonte diretta':'');
    $('.mappa')?.classList.toggle('has-stale-weather',weatherState==='stale'||weatherState==='error');
    notify(mode==='grandine'?(hailState==='error'?'Segnalazioni non disponibili':'Segnalazioni community · ultime 2 ore'):state+(townState==='error'?' · comuni senza meteo':''));
    renderFreshness();renderPulse(s);renderLegend();renderSuggestions();renderSelected();fieldDesk?.sync(selected,mode);scheduleLabels();
  }
  function renderSelected(){
    const el=$('#mappa-selected');if(!el)return;el.hidden=!selected;if(!selected)return;
    const p=allPoints().find(x=>Math.abs(x.latitude-selected.latitude)<.08&&Math.abs(x.longitude-selected.longitude)<.08)||selected,k=p.current,age=weatherAge(k);
    el.innerHTML='<span class="mappa-reading-heading"><small>IL TUO PUNTO NEL MONDO</small>'+mapIcon('arrow')+'</span><b class="mappa-reading-name">'+esc(selected.name)+'</b><span class="mappa-reading-weather"><strong>'+(k?number(k.temperature_2m)+'<small>°</small>':'—')+'</strong>'+weatherArt(k?.weather_code??-1,k?.is_day)+'</span><span class="mappa-reading-meta">'+(k?(age.stale?'Dato precedente · '+esc(age.label):mapSource()+' · '+esc(sourceTime(k))):'Apri per leggere il meteo')+'</span><span class="mappa-reading-footer"><span>'+mapIcon('pioggia')+(Number.isFinite(k?.precipitation)?esc(String(k.precipitation))+' mm':'—')+'</span><span>'+mapIcon('vento')+(Number.isFinite(k?.wind_speed_10m)?number(k.wind_speed_10m)+' km/h':'—')+'</span></span>';
    el.onclick=()=>selectPlace({...selected,current:k},true);
    if(el.offsetHeight){$('#mappa-pulse').style.top=(el.offsetTop+el.offsetHeight+12)+'px';$('#mappa-field')?.style.setProperty('--field-top',(el.offsetTop+el.offsetHeight+12)+'px');}
  }
  function renderPulse(s){
    const slot=$('#mappa-pulse');if(!slot)return;
    const m=MODES.find(x=>x.id===mode),winds=s.points.filter(p=>windReading(p.current)).sort((a,b)=>b.current.wind_speed_10m-a.current.wind_speed_10m),count=mode==='grandine'?visibleReports().length:mode==='neve'?s.snow.length:mode==='pioggia'?s.rain.length:mode==='fulmini'?s.storms.length:mode==='vento'?winds.length:s.points.length;
    const detail=mode==='temperature'?'Il contrasto tra le città che stai guardando.':mode==='neve'?'Neve fresca da modello: tocca una città per quantità e intervallo.':mode==='pioggia'?'Punti di previsione e immagini radar, nella stessa vista.':mode==='grandine'?'Osservazioni delle persone nelle ultime 2 ore.':mode==='vento'?'Le frecce mostrano dove soffia il vento al suolo.':'Temporali previsti dal modello meteorologico.';
    slot.classList.toggle('is-compact',!overviewOpen);slot.style.top='';
    slot.innerHTML=`<button id="mappa-overview-toggle" class="mappa-overview-toggle" aria-expanded="${overviewOpen}"><span>${mapIcon(m.id)} ${m.name}</span><span>${overviewOpen?'Chiudi −':'Riepilogo +'}</span></button><div class="mappa-overview-body" ${overviewOpen?'':'hidden'}><div class="mappa-eyebrow">NELLA VISTA <span>ESPLORA</span></div><div class="mappa-layer-title"><h2>${m.name}</h2><span style="color:${m.color}" aria-hidden="true">${m.icon}</span></div><p>${detail}</p><div class="mappa-sample"><b>${count}</b><span>${mode==='grandine'?'segnalazioni':'località con dati'}<small>nel campione visibile</small></span></div>${mode==='temperature'&&s.cold?`<div class="mappa-contrasto"><button data-extreme="cold"><small>PIÙ FRESCO</small><b>${number(s.cold.current.temperature_2m)}°</b><span>${esc(s.cold.name)}</span></button><button data-extreme="hot"><small>PIÙ CALDO</small><b>${number(s.hot.current.temperature_2m)}°</b><span>${esc(s.hot.name)}</span></button></div>`:mode==='vento'&&winds.length?`<button class="mappa-wind-maximum" id="mappa-max-wind"><span>VENTO PIÙ FORTE NELLA VISTA</span><b>${number(winds[0].current.wind_speed_10m)} <small>km/h</small></b><span>${esc(winds[0].name)} ↗</span></button>`:''}<div class="mappa-sidebar-actions"><button class="mappa-compare" id="mappa-overview-list">${mode==='temperature'&&s.points.length>1?'Confronta le temperature':'Esplora le località'} ↗</button><button id="mappa-overview-ai">✦ Chiedi a Lente</button></div><div class="mappa-source-note"><span>FONTE</span><p>${mode==='grandine'?'Community · segnalazioni non verificate. Nessun punto non significa assenza di rischio.':mode==='fulmini'?mapSource()+' · codice meteo, non rilevamento delle singole scariche.':mapSource()+' · campioni meteo. Gli estremi riguardano questo campione, non record climatici.'}</p></div></div>`;
    $('#mappa-overview-toggle').onclick=()=>{overviewOpen=!overviewOpen;renderPulse(summary());renderSelected();scheduleLabels();};
    slot.querySelectorAll('[data-extreme]').forEach(b=>b.onclick=()=>selectPlace(s[b.dataset.extreme],true));
    $('#mappa-overview-list').onclick=()=>mode==='temperature'&&s.points.length>1?comparePanel(s):listPanel();
    $('#mappa-overview-ai').onclick=()=>askAI('Riassumi le condizioni della località selezionata e spiega cosa significa il livello '+m.name+'.');
    if($('#mappa-max-wind'))$('#mappa-max-wind').onclick=()=>selectPlace(winds[0]);
  }
  function renderLegend(){
    const slot=$('#mappa-legenda');if(!slot)return;
    slot.innerHTML=mode==='neve'?'<span>❄ Neve fresca · modello</span><small>cm nell’intervallo indicato · tocca un punto. Zero punti non esclude neve.</small>':mode==='temperature'?'<span>Temperatura · °C</span><div class="mappa-scala"></div><div class="mappa-scale-values"><span>−10</span><span>0</span><span>10</span><span>20</span><span>30</span><span>40+</span></div>':mode==='vento'?'<span>Vento al suolo · km/h</span><div class="mappa-scala wind"></div><div class="mappa-scale-values"><span>0</span><span>20</span><span>40</span><span>60+</span></div><small>Frecce = direzione verso cui soffia</small>':mode==='pioggia'?'<span class="mappa-key rain">● Punti: pioggia da modello</span><small>Tocca per quantità e intervallo · radar sovrapposto</small>':mode==='grandine'?'<span class="mappa-key hail">◇ Grandine segnalata</span><small>Community · ultime 2 ore · non verificata</small>':'<span class="mappa-key storm">ϟ M · modello / C · community</span><small>Viola: modello · ambra: osservazioni. Nessun sensore di scariche</small>';
  }
  function panel(title,html,focus=true){
    sourcesOpen=false;$('#mappa-fonti')?.setAttribute('aria-expanded','false');
    const origin=document.activeElement;fieldDesk?.close();
    const p=$('#mappa-pannello');if(!p)return;panelRevision++;
    if(p.hidden)focusedBeforePanel=origin;
    $('#mappa-pannello-titolo').textContent=title;$('#mappa-pannello-corpo').innerHTML=html;p.hidden=false;$('.mappa').classList.add('has-panel');radar?.pause();scheduleLabels();
    $('#mappa-pannello-chiudi').onclick=closePanel;
    if(focus)$('#mappa-pannello-titolo').focus({preventScroll:true});
  }
  function closePanel(){sourcesOpen=false;$('#mappa-fonti')?.setAttribute('aria-expanded','false');const p=$('#mappa-pannello');if(p)p.hidden=true;$('.mappa')?.classList.remove('has-panel');panelRevision++;searchRevision++;scheduleLabels();const target=(focusedBeforePanel?.id&&document.getElementById(focusedBeforePanel.id))||focusedBeforePanel;const visible=target?.isConnected&&target.getClientRects().length&&getComputedStyle(target).visibility!=='hidden';if(visible)target.focus({preventScroll:true});else $('#mappa-tools-open')?.focus({preventScroll:true});}
  const sourceTime=k=>modelTime(k)!==null?new Date(modelTime(k)).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}):'orario del modello non disponibile';
  const pointWeather=(p,force=false)=>cached('point:'+p.latitude.toFixed(3)+':'+p.longitude.toFixed(3),async()=>{
        if(paidSource){const d=await ctx.api('forecast/current?'+new URLSearchParams({lat:p.latitude,lon:p.longitude}));if(!d.mapCurrent||d.status!=='available')throw Error('Meteo non disponibile');return {current:d.mapCurrent};}
        const q=new URLSearchParams({latitude:p.latitude,longitude:p.longitude,current:CURRENT,timezone:'GMT',forecast_days:'1'});
        const r=await fetch('https://api.open-meteo.com/v1/forecast?'+q,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return r.json();
      },paidSource?300000:force?0:MAP_REFRESH_MS);
  async function selectPlace(p,move=true){
    if(!validPlace(p)||!alive)return;selected={...p};selectedAt++;const token=selectedAt,life=revision;
    if(move)map.setView([p.latitude,p.longitude],Math.max(7,map.getZoom()),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
    if(selectionMarker)map.removeLayer(selectionMarker);
    selectionMarker=L.circleMarker([p.latitude,p.longitude],{radius:17,color:'#fff',weight:2,fillOpacity:0,interactive:false}).addTo(map);
    $('#mappa-ia-testo').placeholder=`Chiedi a Lente di ${p.name}…`;
    closePanel();draw();
    if(!p.current||weatherAge(p.current).stale)try{
      const d=await pointWeather(p);
      if(!alive||life!==revision||token!==selectedAt)return;
      selected={...p,current:d.current};draw();
    }catch{if(alive&&life===revision&&token===selectedAt){selected={...p,unavailable:true,refreshFailed:true};renderFreshness();}}
  }
  function locationPanel(p,focus=true){
    const k=p.current,age=weatherAge(k);
    panel(p.name,`<p class="mappa-eyebrow">${esc([p.province||p.admin1,p.country||p.country_code].filter(Boolean).join(' · ')||'LOCALITÀ SELEZIONATA')}</p><div class="mappa-location-hero"><strong>${k?number(k.temperature_2m)+'°':'—'}</strong><span aria-hidden="true">${weatherArt(k?.weather_code??-1,k?.is_day)}</span></div><p>${k?(age.stale?'Dato precedente · '+age.label+' · non attuale':'Meteo locale · '+mapSource()):p.unavailable?'Il meteo di questa località non risponde. Riprova più tardi.':'Carico il meteo di questa località…'}</p>${k?`<div class="mappa-metrics"><div><small>NEVE FRESCA · MODELLO</small><b>${Number.isFinite(k.snowfall)?esc(String(k.snowfall)):'—'}</b><small>cm / ${Number.isFinite(k.interval)?Math.round(k.interval/60)+' min':'intervallo non disponibile'}</small></div><div><small>PRECIPITAZIONI</small><b>${Number.isFinite(k.precipitation)?esc(String(k.precipitation)):'—'}</b><small>${precipitationLabel(k.interval)}</small></div><div><small>VENTO</small><b>${number(k.wind_speed_10m)}</b><small>km/h${windReading(k)?.from!==null&&windReading(k)?' · da '+windReading(k).compass:''}</small></div></div><p class="mappa-fonte">Dato valido: ${esc(sourceTime(k))}. ${isStorm(k.weather_code)?'Temporale da modello, non rilevamento di fulmini.':''}</p>`:''}<div class="mappa-actions"><button id="mappa-local-zoom">Centra e ingrandisci ↗</button><button id="mappa-local-ai" class="mappa-primary">✦ Spiegamelo con Lente</button><button id="mappa-local-weather">Previsioni complete ↗</button><button id="mappa-local-community">Community di ${esc(p.name)} ↗</button><button id="mappa-local-radar">Radar e dettaglio ↗</button></div>`,focus);
    $('#mappa-local-zoom').onclick=()=>{closePanel();map.setView([p.latitude,p.longitude],Math.max(9,map.getZoom()),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});};
    $('#mappa-local-ai').onclick=()=>askAI(`Spiega il meteo di ${p.name} e cosa sappiamo del livello ${MODES.find(m=>m.id===mode).name}.`);
    $('#mappa-local-weather').onclick=()=>ctx.openPlace?.(p,'home');
    $('#mappa-local-community').onclick=()=>ctx.openPlace?.(p,'community');
    $('#mappa-local-radar').textContent='Mostra radar qui';$('#mappa-local-radar').onclick=()=>{closePanel();chooseRadar(mode==='grandine'?'hail':'rain');};
  }
  function comparePanel(s){
    const a=s.cold,b=s.hot;if(!a||!b)return;
    panel('Due città. Due climi.',`<p class="mappa-eyebrow">CONTRASTO TERMICO · NELLA VISTA</p><div class="mappa-compare-cities"><div><span>${esc(a.name)}</span><b>${number(a.current.temperature_2m)}°</b></div><span>↔</span><div><span>${esc(b.name)}</span><b>${number(b.current.temperature_2m)}°</b></div></div><p class="mappa-difference">${number(b.current.temperature_2m-a.current.temperature_2m)}° di differenza</p><p>Stessa mappa, condizioni diverse. Confronto dei dati di modello disponibili, non dei record di temperatura.</p><p class="mappa-fonte">${esc(a.name)}: ${esc(sourceTime(a.current))}<br>${esc(b.name)}: ${esc(sourceTime(b.current))}</p><button class="mappa-primary" id="mappa-compare-ai">✦ Fai leggere il contrasto a Lente</button>`);
    $('#mappa-compare-ai').onclick=()=>{selected=a;askAI(`Confronta ${a.name} (${a.current.temperature_2m} °C, dato ${sourceTime(a.current)}) e ${b.name} (${b.current.temperature_2m} °C, dato ${sourceTime(b.current)}). Se non hai dati sulle cause non inventarle.`);};
  }
  function hailPanel(p){
    panel('Grandine segnalata',`<p class="mappa-eyebrow">${esc(p.city||'Zona segnalata')} · ${clock(p.observed||p.created)}</p><div class="mappa-location-hero"><span>◇</span></div><h3>${hailLabel(p.hail?.size||p.size)}</h3><p>${p.ended?'L’autore riferisce che ha smesso.':'Osservazione da verificare.'}</p><p class="mappa-fonte">Le conferme della community non sono una certificazione. Non ricaviamo minuti all’impatto dal vento al suolo.</p><button id="mappa-hail-community" class="mappa-primary">Apri la community ↗</button>`);
    $('#mappa-hail-community').onclick=()=>ctx.openPlace?.({...p,name:p.city||'Zona segnalata'},'community');
  }
  function eventPanel(e){panel(e.name||'Evento naturale',`<p class="mappa-eyebrow">NASA EONET · ${esc(e.value||'Catalogo eventi')}</p><p>${esc(e.detail||'Ultima posizione nel catalogo; non una rilevazione istantanea.')}</p><p class="mappa-fonte">Ultimo dato: ${Number.isFinite(e.at)?esc(new Date(e.at).toLocaleString('it-IT')):'non disponibile'}. Non è un’allerta ufficiale.</p>`);}
  function listPanel(){
    const s=summary(),rows=mode==='grandine'?visibleReports():mode==='neve'?s.snow:mode==='pioggia'?s.rain:mode==='fulmini'?s.storms:mode==='vento'?s.points.filter(p=>windReading(p.current)).sort((a,b)=>b.current.wind_speed_10m-a.current.wind_speed_10m):s.points;
    panel('Nella zona visibile',`<p class="mappa-fonte">${rows.length} elementi · ${MODES.find(x=>x.id===mode).name}. Mostrati i primi 60; avvicina la mappa per restringere.</p>${mode==='temperature'&&s.points.length>1?'<button class="mappa-primary" id="mappa-list-compare">Confronta caldo e freddo ↗</button>':''}<div class="mappa-result-list">${rows.slice(0,60).map((p,i)=>`<button data-point="${i}"><span>${esc(p.name||p.city||'Zona segnalata')}</span><b>${mode==='grandine'?'◇':mode==='neve'?(snowReading(p.current)?.amount==null?'Neve · modello':esc(String(p.current.snowfall))+' cm'):mode==='pioggia'?esc(String(p.current.precipitation))+' mm':mode==='fulmini'?'ϟ Modello':mode==='vento'?number(p.current.wind_speed_10m)+' km/h':number(p.current.temperature_2m)+'°'}</b></button>`).join('')||'<p>Nessun dato per questo livello nella vista. Allarga la mappa o scegli un altro livello: questo non certifica l’assenza del fenomeno.</p>'}</div>`);
    if($('#mappa-list-compare'))$('#mappa-list-compare').onclick=()=>comparePanel(s);
    $('#mappa-pannello-corpo').querySelectorAll('[data-point]').forEach(b=>b.onclick=()=>mode==='grandine'?hailPanel(rows[+b.dataset.point]):selectPlace(rows[+b.dataset.point]));
  }
  function guide(){panel('La mappa, in 20 secondi',`<ol class="mappa-guide"><li><b>Scegli cosa vedere.</b> Scegli temperatura, pioggia, neve, grandine, vento o temporali. Il pulsante Radar pioggia sovrappone immagini recenti a qualsiasi livello.</li><li><b>Esplora e tocca una città.</b> I nomi restano disponibili anche senza dati meteo; avvicinati per vederne altri. Città attiva o nasconde le etichette. Ogni pulsante mostra un fenomeno. Fonti e orari distingue controllo, modello e radar; Ultimo riporta al quadro radar più recente.</li><li><b>Esplora un’ora.</b> Tocca una tessera nell’osservatorio per confrontare temperatura, percepita, pioggia e raffiche. Lente può spiegare esattamente quell’ora. In Pioggia cerchiamo due ore consecutive con al massimo 0,2 mm e 30% di probabilità per ora; non è una garanzia di asciutto.</li><li><b>Leggi le voci dal posto.</b> Ogni livello ha osservazioni pubbliche con posizione approssimata e scadenza di due ore. In Grandine scegli 25, 50, 100 o 150 km: i cerchi indicano distanza, non traiettorie. Trova punti coperti cerca edifici e parcheggi entro 5 km dalla località selezionata; accesso e disponibilità vanno verificati.</li><li><b>Chiedi a Lente.</b> Seleziona una località, poi scrivi nella barra Lente. L’IA riceve dati meteo e nome del luogo; il server esclude coordinate, autori e media dall’invio a OpenAI.</li></ol><h3>Ogni minuto: cosa significa?</h3><p>Controlliamo le fonti ogni 60 secondi mentre la mappa è visibile. Il controllo non è l’ora della misura: leggi separatamente l’orario del modello e del quadro radar. Le previsioni orarie e i campioni di modello possono restare identici tra due controlli. Le richieste già in corso non vengono duplicate.</p><h3>Neve, senza equivoci</h3><p>Neve fresca: centimetri nell’intervallo indicato. Neve al suolo: spessore stimato dal modello. Zero termico: quota dell’aria a 0 °C, non quota neve. Osservazioni: racconti delle persone non verificati.</p><h3>Leggere bene le fonti</h3><p>Temperature, pioggia, vento e temporali: modello Open-Meteo. Radar pioggia: RainViewer, copertura variabile. Grandine: Radar-DPC POH per l’Italia, probabilità stimata; separatamente osservazioni delle persone delle ultime 2 ore. Fulmini: non disponiamo di una rete di rilevamento delle singole scariche. I comuni italiani più piccoli possono non avere dati.</p><p>Usa Riproduci e il cursore per scorrere i quadri radar delle ultime 2 ore. L’orario si riferisce al quadro composito; le misure al suo interno possono avere orari diversi. La mappa non certifica aree sicure e non calcola un arrivo affidabile della grandine.</p><button class="mappa-primary" id="mappa-guide-detail">Apri radar e dettaglio ↗</button>`);$('#mappa-guide-detail').textContent='Mostra il radar';$('#mappa-guide-detail').onclick=()=>{closePanel();chooseRadar(mode==='grandine'?'hail':'rain');};}
  function contextSummary(){
    const s=summary();const info=[];
    if(mode==='neve')info.push(`${s.snow.length} località con neve indicata dal modello; non misure osservate. Neve fresca in cm nell’intervallo, non spessore al suolo.`);
    if(mode==='vento')info.push('Vento al suolo da modello, non traiettoria di celle temporalesche.');
    if(radarState.enabled)info.push(`Radar ${radarKind==='hail'?'Radar-DPC POH Italia':'RainViewer'}: ${radarState.status}, quadro ${radarState.time?new Date(radarState.time*1000).toISOString():'non disponibile'}. Pixel non forniti all’IA: non dedurre intensità, movimento o arrivi dalle immagini.`);
    if(mode==='temperature'&&s.points.length)info.push(`${s.points.length} località da modello; ${s.cold.name} ${s.cold.current.temperature_2m} °C, ${s.hot.name} ${s.hot.current.temperature_2m} °C`);
    if(mode==='pioggia')info.push(`${s.rain.length} località con precipitazioni da modello, non radar`);
    if(mode==='fulmini')info.push(`${s.storms.length} località con temporali da modello; rilevamenti fulmini non disponibili`);
    if(mode==='grandine')info.push(fieldDesk?.summary()||'Segnalazioni non disponibili.');
    const timing=sourceStatus({checkedAt,current:selected?.current,radar:radarState});info.push(timing.checked+'; '+timing.model);
    info.push(`stato meteo ${weatherState}; stato segnalazioni ${hailState}; raccolta ${clock(updated)}`);return info.join('; ');
  }
  async function askAI(question){
    $('#mappa-ia-testo').value=question;
    if(!selected){panel('Scegli la tua località',`<p>Per una risposta pertinente, cerca una città o tocca un punto sulla mappa. La domanda resta nella barra.</p><button id="mappa-ai-select" class="mappa-primary">Cerca una città</button>`);$('#mappa-ai-select').onclick=()=>{closePanel();$('#mappa-cerca-testo').focus();};return;}
    const place={...selected},context=contextSummary(),input=$('#mappa-ia-testo'),button=$('#mappa-ia-invia');
    const placeKey=place.latitude+','+place.longitude;if(aiPlaceKey!==placeKey){aiHistory=[];aiPlaceKey=placeKey;}
    if(button.disabled)return;button.disabled=true;
    panel('Lente · '+place.name,`<p class="mappa-eyebrow">IL METEO, SPIEGATO SULLA MAPPA</p><p class="mappa-question">${esc(question)}</p><div id="mappa-risposta" class="mappa-answer" role="status">✦ Lente sta leggendo le fonti…</div><p class="mappa-fonte">Risposta generata dall’IA. Le indicazioni ufficiali hanno sempre precedenza.</p>`);
    const token=panelRevision,life=revision,slot=$('#mappa-risposta');
    try{
      const response=await ctx.api('ai',mapAIRequest(place,question,context,mode==='temperature'?'temperatura':mode,aiHistory));
      if(!alive||life!==revision||token!==panelRevision||!slot.isConnected)return;
      slot.textContent=response.answer||'Non è arrivata una risposta. Riprova.';
      if(response.answer){aiHistory=[...aiHistory,{role:'user',text:question},{role:'assistant',text:response.answer}].slice(-6);}
      const provenance=document.createElement('div');provenance.className='mappa-ai-provenance';
      provenance.innerHTML=`<h3>Le fonti della risposta</h3>${(response.sources||[]).map(s=>`<p><b>${esc(s.label||'Fonte')}</b><span>${esc(s.at||'')} ${esc(s.timezone||'')}</span></p>`).join('')||'<p>Nessuna fonte restituita.</p>'}${(response.notes||[]).map(n=>`<p>${esc(n)}</p>`).join('')}<small>Ultimi 3 scambi usati solo per questa località. Coordinate, autori e media esclusi dall’invio al servizio IA.</small>`;
      slot.after(provenance);
      if(input.value.trim()===question)input.value='';
    }catch(e){if(alive&&life===revision&&token===panelRevision&&slot.isConnected){slot.textContent=e.status===401?'Accedi per usare Lente. La tua domanda è conservata.':e.message||'Lente non risponde. La domanda è conservata.';if(e.status===401){const a=document.createElement('a');a.textContent='Accedi con ChatGPT ↗';a.href='/signin-with-chatgpt?return_to='+encodeURIComponent('/#mappa-eventi');slot.append(document.createElement('br'),a);}}}
    finally{if(button.isConnected)button.disabled=false;}
  }
  async function search(event){
    event.preventDefault();const text=$('#mappa-cerca-testo').value.trim();if(!text)return;
    const token=++searchRevision,life=revision;panel('Cerco '+text,'<p role="status">Cerco le località…</p>');const searchPanel=panelRevision;
    try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:text,count:'6',language:'it',format:'json'}),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const d=await r.json();if(!alive||life!==revision||token!==searchRevision||searchPanel!==panelRevision)return;
      const places=(d.results||[]).filter(validPlace);panel('Scegli la località',`<div class="mappa-result-list">${places.map((p,i)=>`<button data-search-place="${i}"><span><b>${esc(p.name)}</b><small>${esc([p.admin1,p.country].filter(Boolean).join(' · '))}</small></span><span>↗</span></button>`).join('')||'<p>Nessuna città trovata. Prova con un nome più completo.</p>'}</div>`);
      $('#mappa-pannello-corpo').querySelectorAll('[data-search-place]').forEach(b=>b.onclick=()=>selectPlace(places[+b.dataset.searchPlace]));
    }catch{if(alive&&life===revision&&token===searchRevision&&searchPanel===panelRevision)panel('Ricerca non disponibile','<p>La ricerca non risponde adesso. Il testo è conservato: riprova fra poco.</p>');}
  }
  function locate(){
    if(!navigator.geolocation){notify('Posizione non supportata. Cerca una città.');return;}
    const life=revision;notify('Attendo il permesso per la posizione…');
    navigator.geolocation.getCurrentPosition(p=>{if(!alive||life!==revision)return;selectPlace({name:'La mia zona',latitude:p.coords.latitude,longitude:p.coords.longitude,source:'gps'});},()=>{if(alive&&life===revision)notify('Posizione non disponibile. Puoi cercare una città.');},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  function keydown(e){if(e.key==='Escape')closePanel();}
  function visibility(){renderFreshness();if(!document.hidden){load();fieldDesk?.refresh();if(radarState.enabled)activeRadar()?.refresh();}}
  async function bind(){
    const host=$('#mappa-tela');if(!host||map)return;alive=true;const life=++revision;
    sourceReady=ctx.api('forecast/provider').then(d=>{paidSource=['WeatherAPI','Rainbow Weather'].includes(d.source);}).catch(()=>{paidSource=true;});
    await sourceReady;
    if(!alive||life!==revision||!host.isConnected)return;
    const sourceLink=document.querySelector('.mappa-attribuzioni a[href="https://open-meteo.com/"]');if(sourceLink&&paidSource){sourceLink.href='https://www.weatherapi.com/';sourceLink.textContent='WeatherAPI';}
    let geographicData;try{[L,geographicData]=await preload();}catch{notify('Mappa non disponibile. Ricarica la pagina.');return;}
    if(!alive||life!==revision||!host.isConnected)return;
    const {atlasLand,atlasBorders,atlasRegions}=geographicData;
    map=L.map(host,{preferCanvas:true,zoomControl:false,attributionControl:false,worldCopyJump:true,minZoom:2,maxZoom:16}).setView([43,13],5);
    map.createPane('atlas-geography').style.zIndex=220;
    const regionPane=map.createPane('atlas-region-labels');regionPane.style.cssText='z-index:240;pointer-events:none';regionPane.setAttribute('aria-hidden','true');
    const streets=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,crossOrigin:true});
    const geography=L.layerGroup();
    L.control.scale({position:'bottomleft',imperial:false,maxWidth:100}).addTo(map);
    for(const offset of [-360,0,360]){
      geography.addLayer(L.geoJSON(atlasLand,{pane:'atlas-geography',coordsToLatLng:c=>L.latLng(c[1],c[0]+offset),interactive:false,style:{color:'#3e626e',weight:1,fillColor:'#101f29',fillOpacity:1,smoothFactor:1}}));
      geography.addLayer(L.geoJSON(atlasBorders,{pane:'atlas-geography',coordsToLatLng:c=>L.latLng(c[1],c[0]+offset),interactive:false,style:{color:'#668088',weight:.8,opacity:.35,dashArray:'3 4',smoothFactor:1}}));
    }
    paletteChanged=()=>{
      const dark=mapPhase()==='notte';
      $('.mappa').dataset.mapTheme=dark?'notte':'giorno';
      geography.eachLayer(layer=>layer.setStyle?.({color:dark?'#668088':'#788a82',fillColor:dark?'#101f29':'#d7ddce'}));
      basemap?.setPhase(dark?'notte':'giorno');
    };
    paletteChanged();document.addEventListener('meteosocial:phase',paletteChanged);
    const regionLabels=L.layerGroup().addTo(map);
    const renderRegions=()=>{
      regionLabels.clearLayers();const zoom=map.getZoom();if(basemapActive||zoom>=7)return;
      for(const p of atlasRegions.filter(p=>p.rank<=(zoom>=5?4:zoom>=4?3:2)&&insideViewport({latitude:p.lat,longitude:p.lon},bounds()))){
        const lng=p.lon+360*Math.round((map.getCenter().lng-p.lon)/360);
        const pin=L.marker([p.lat,lng],{pane:'atlas-region-labels',interactive:false,keyboard:false,icon:L.divIcon({className:'mappa-country-name',html:esc(p.name),iconSize:[180,20],iconAnchor:[90,10]})});
        regionLabels.addLayer(pin);
      }
    };
    map.on('moveend',renderRegions);renderRegions();
    const grid=L.layerGroup();for(let lat=-75;lat<=75;lat+=15)grid.addLayer(L.polyline([[lat,-540],[lat,540]],{pane:'atlas-geography',color:'#5aa6b3',weight:1,opacity:.06,interactive:false}));for(let lon=-540;lon<=540;lon+=15)grid.addLayer(L.polyline([[-85,lon],[85,lon]],{pane:'atlas-geography',color:'#5aa6b3',weight:1,opacity:.06,interactive:false}));
    const cartography=()=>{if(basemapActive){for(const layer of [geography,grid,streets])if(map.hasLayer(layer))map.removeLayer(layer);return;}const detailed=map.getZoom()>=7;if(detailed){if(map.hasLayer(geography))map.removeLayer(geography);if(map.hasLayer(grid))map.removeLayer(grid);if(!map.hasLayer(streets))streets.addTo(map);}else{if(map.hasLayer(streets))map.removeLayer(streets);if(!map.hasLayer(geography))geography.addTo(map);if(!map.hasLayer(grid))grid.addTo(map);}};
    map.on('zoomend',cartography);cartography();
    const showMapTiler=active=>{basemapActive=active;cartography();renderRegions();host.querySelector('.maptiler-credit')?.remove();const credit=document.querySelector('.mappa-maptiler-attribution');if(credit)credit.hidden=!active;if(active){const logo=document.createElement('a');logo.className='maptiler-credit';logo.href='https://www.maptiler.com/';logo.target='_blank';logo.rel='noopener';logo.innerHTML='<img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler" width="88" height="23">';host.append(logo);}};
    ctx.api('maps/basemap').then(config=>{if(!alive||life!==revision)return;basemap=createMapTilerBase({L,map,config,phase:mapPhase(),onReady:()=>showMapTiler(true),onFailure:()=>{if(!alive||life!==revision)return;showMapTiler(false);notify('Cartografia alternativa attiva: MapTiler non disponibile.');}});}).catch(()=>{});

    markers=L.layerGroup().addTo(map);cityLabels=L.layerGroup().addTo(map);
    fieldDesk=createFieldDesk({$,esc,L,map,api:ctx.api,get:ctx.get,login:ctx.login,modal:ctx.modal,toast:ctx.toast,openPlace:ctx.openPlace,panel,panelToken:()=>panelRevision,askAI,openRadar:()=>chooseRadar(mode==='grandine'?'hail':'rain'),labelsChanged:scheduleLabels});
    map.on('resize',()=>{renderSelected();scheduleLabels();});
    $('#mappa-city-names').onclick=()=>{showCityNames=!showCityNames;$('#mappa-city-names').setAttribute('aria-pressed',String(showCityNames));scheduleLabels();};
    radar=createAtlasRadar({L,map,onChange:s=>{if(radarKind==='rain')renderRadar(s)}});
    hailRadar=createHailRadar({L,map,onChange:s=>{if(radarKind==='hail')renderRadar(s)}});
    const place=ctx.get().place;if(validPlace(place)){selected={...place,current:null};map.setView([place.latitude,place.longitude],5,{animate:false});$('#mappa-ia-testo').placeholder=`Chiedi a Lente di ${place.name}…`;}
    $('#mappa-zona').onclick=()=>{const p=ctx.get().place;if(validPlace(p))selectPlace(p);else $('#mappa-cerca-testo').focus();};
    $('#mappa-layer-select').onchange=e=>selectMode(e.target.value);
    $('#mappa-tools-open').onclick=toolsPanel;
    $('#mappa-fonti').onclick=()=>sourcesOpen?closePanel():sourcePanel();
    $('#mappa-radar-latest').onclick=()=>activeRadar()?.seek(radarState.frames.length-1);
    $('#mappa-radar-toggle').onclick=()=>chooseRadar(mode==='grandine'?'hail':'rain',!radarState.enabled);
    $('#mappa-radar-play').onclick=()=>activeRadar()?.play();$('#mappa-radar-range').oninput=e=>activeRadar()?.seek(Number(e.target.value));$('#mappa-radar-retry').onclick=()=>activeRadar()?.refresh(true);
    map.on('movestart',()=>{visibleRequest++;});
    map.on('moveend',()=>{draw();clearTimeout(timer);timer=setTimeout(()=>{if(!document.hidden)loadTowns(revision);},650);});
    map.on('click',()=>{if($('#mappa-pannello')&&!$('#mappa-pannello').hidden)closePanel();});
    document.querySelectorAll('[data-livello]').forEach(b=>b.onclick=()=>selectMode(b.dataset.livello));
    $('#mappa-cerca').onsubmit=search;$('#mappa-ia').onsubmit=e=>{e.preventDefault();const q=$('#mappa-ia-testo').value.trim();askAI(q||'Spiega il meteo della località selezionata e cosa significa questo livello.');};
    $('#mappa-guida').onclick=guide;$('#mappa-posizione').onclick=locate;$('#mappa-mondo').onclick=()=>map.setView([25,10],2);
    $('#mappa-zoom-in').onclick=()=>map.zoomIn();$('#mappa-zoom-out').onclick=()=>map.zoomOut();$('#mappa-elenco').onclick=listPanel;
    $('#mappa-eventi').onclick=()=>{showEvents=!showEvents;$('#mappa-eventi').setAttribute('aria-pressed',String(showEvents));if(showEvents){loadEvents(revision).then(()=>{if(eventState==='error')notify('Catalogo NASA non disponibile.');});}draw();};
    $('#mappa-aggiorna').onclick=async e=>{const button=e.currentTarget;button.disabled=true;cache.clear();fieldDesk?.refresh();if(radarState.enabled)activeRadar()?.refresh(true);notify('Aggiorno le fonti…');try{await load();}finally{if(button.isConnected)button.disabled=false;}};
    document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',visibility);
    clockTimer=setInterval(()=>{if(!document.hidden)renderFreshness();},1000);
    refreshTimer=setInterval(()=>{if(!document.hidden){load();fieldDesk?.sync(selected,mode);if(radarState.enabled)activeRadar()?.refresh(true);}},MAP_REFRESH_MS);draw();if(mode==='grandine')chooseRadar('hail');else if(mode==='pioggia')chooseRadar('rain');void load();

  }
  function dispose(){hailRadar?.dispose();hailRadar=null;radarKind='rain';basemap?.dispose();basemap=null;basemapActive=false;if(paletteChanged)document.removeEventListener('meteosocial:phase',paletteChanged);paletteChanged=null;alive=false;loadTask=null;revision++;panelRevision++;searchRevision++;selectedAt++;clearTimeout(timer);clearInterval(refreshTimer);clearInterval(clockTimer);cancelAnimationFrame(labelsFrame);document.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);fieldDesk?.dispose();fieldDesk=null;radar?.dispose();radar=null;if(map)map.remove();map=null;markers=null;selectionMarker=null;}
  return {page,bind,dispose,preload,active:()=>ctx.get().route==='mappa-eventi'};
}
