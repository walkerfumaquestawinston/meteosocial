import {normalizzaEventiNasa,abbinaMeteoCitta,mappaColore} from './mappa-eventi.js';
import {isStorm,hailLabel,precipitationLabel,validPlace,insideViewport,weatherPoints,visibleSummary,mapAIRequest} from './map-weather-core.js';

const MODES = [
  {id:'temperature',icon:'◉',name:'Temperatura',hint:'Modello · °C',color:'#ffbb70'},
  {id:'pioggia',icon:'☂',name:'Pioggia',hint:'Modello · mm',color:'#6ac5ff'},
  {id:'grandine',icon:'◇',name:'Grandine',hint:'Community · 2 ore',color:'#ff9567'},
  {id:'fulmini',icon:'ϟ',name:'Fulmini',hint:'Temporali da modello',color:'#d8b1ff'},
];
const CURRENT='temperature_2m,weather_code,is_day,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover';
const number=n=>Number.isFinite(n)?Math.round(n).toLocaleString('it-IT'):'—';
const clock=t=>Number.isFinite(t)?new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'—';
const weatherIcon=c=>isStorm(c)?'ϟ':c>=71&&c<=77?'❄':c>=51?'☂':c>1?'☁':'☀';

export function createMappaEventi(ctx) {
  const esc=ctx.esc, $=s=>document.querySelector(s);
  let L,map,markers,selectionMarker,timer,refreshTimer,alive=false,revision=0,panelRevision=0,searchRevision=0;
  let mode='temperature',showEvents=false,selected=null,world=[],towns=[],readings=new Map(),events=[],hail=[];
  let weatherState='loading',townState='loading',hailState='loading',eventState='idle',updated=null,selectedAt=0,townRequest=0;
  const cache=new Map(); let focusedBeforePanel=null;
  try {const saved=localStorage.getItem('meteosocial:weather-map:mode');if(MODES.some(x=>x.id===saved))mode=saved;} catch {}

  function page(){return `<section class="mappa" aria-label="Atlante meteo interattivo">
    <div id="mappa-tela" class="mappa-tela" aria-label="Mappa. Usa anche Elenco luoghi per esplorare con la tastiera."></div>
    <div class="mappa-alto">
      <form id="mappa-cerca" class="mappa-cerca" role="search"><span aria-hidden="true">⌕</span><label class="sr-only" for="mappa-cerca-testo">Cerca città nel mondo</label><input id="mappa-cerca-testo" type="search" placeholder="Cerca una città, esplora il suo cielo…" maxlength="100" autocomplete="off"><button type="submit" aria-label="Cerca città">→</button></form>
      <div class="mappa-contatori" role="group" aria-label="Fenomeno da esplorare">${MODES.map(m=>`<button class="mappa-pillola" data-livello="${m.id}" aria-pressed="${mode===m.id}" style="--layer:${m.color}"><span class="mappa-pillola-icona" aria-hidden="true">${m.icon}</span><span><strong>${m.name}</strong><small>${m.hint}</small></span><b data-conteggio="${m.id}">—</b></button>`).join('')}</div>
      <div class="mappa-stato"><span class="mappa-dot" aria-hidden="true"></span><span id="mappa-stato-testo" role="status">Carico i dati meteo…</span><button id="mappa-guida">Come si legge ↗</button></div>
    </div>
    <div class="mappa-pulse" id="mappa-pulse" aria-label="Confronto nella zona visibile"></div>
    <aside class="mappa-pannello" id="mappa-pannello" hidden aria-labelledby="mappa-pannello-titolo"><div class="mappa-pannello-testa"><h2 id="mappa-pannello-titolo" tabindex="-1"></h2><button id="mappa-pannello-chiudi" aria-label="Chiudi dettagli">×</button></div><div id="mappa-pannello-corpo"></div></aside>
    <div class="mappa-strumenti" role="group" aria-label="Strumenti mappa">
      <button id="mappa-posizione" title="La mia posizione" aria-label="La mia posizione">⌖</button>
      <button id="mappa-mondo" title="Vedi il mondo" aria-label="Vedi il mondo">◎</button>
      <button id="mappa-elenco" title="Elenco luoghi" aria-label="Elenco luoghi">☷</button>
      <button id="mappa-eventi" title="Eventi naturali NASA" aria-label="Eventi naturali NASA" aria-pressed="false">♧</button>
      <button id="mappa-aggiorna" title="Aggiorna dati" aria-label="Aggiorna dati">↻</button>
      <div class="mappa-zoom"><button id="mappa-zoom-in" aria-label="Aumenta zoom">+</button><button id="mappa-zoom-out" aria-label="Riduci zoom">−</button></div>
    </div>
    <div class="mappa-basso">
      <div class="mappa-legenda" id="mappa-legenda"></div>
      <form class="mappa-ia" id="mappa-ia"><span class="mappa-ia-marchio">✦ LENTE IA</span><label class="sr-only" for="mappa-ia-testo">Chiedi all’IA del luogo selezionato</label><input id="mappa-ia-testo" type="text" maxlength="700" placeholder="Perché qui fa più caldo? Chiedi a Lente…" autocomplete="off"><button id="mappa-ia-invia" type="submit" aria-label="Invia domanda all’IA">→</button></form>
      <p class="mappa-attribuzioni"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a> · <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a><span> · Catalogo comuni derivato ISTAT · NASA EONET</span></p>
    </div>
  </section>`;}

  function bounds(){if(!map)return null;const b=map.getBounds();return {west:b.getWest(),east:b.getEast(),south:b.getSouth(),north:b.getNorth()};}
  const allPoints=()=>weatherPoints(world,towns,readings,selected);
  const summary=()=>visibleSummary(allPoints(),bounds());
  const visibleReports=()=>hail.filter(p=>insideViewport(p,bounds()));
  function notify(text){const el=$('#mappa-stato-testo');if(el)el.textContent=text;}
  async function cached(key,load,ttl=300000){
    const previous=cache.get(key);if(previous?.promise)return previous.promise;
    if(previous&&Date.now()-previous.at<ttl)return previous.value;
    const record={};record.promise=load().then(value=>{cache.set(key,{value,at:Date.now()});if(cache.size>60){const old=[...cache].find(([k,v])=>k!==key&&!v.promise);if(old)cache.delete(old[0]);}return value;}).catch(e=>{cache.delete(key);throw e;});cache.set(key,record);return record.promise;
  }
  async function worldData(){
    try {return await ctx.api('atlas/world');} catch {
      const {CITTA_MONDO}=await import('./citta-mondo.js');const groups=[];
      for(let i=0;i<CITTA_MONDO.length;i+=50)groups.push(CITTA_MONDO.slice(i,i+50));
      const batches=await Promise.allSettled(groups.map(async group=>{
        const p=new URLSearchParams({latitude:group.map(c=>c.latitude).join(','),longitude:group.map(c=>c.longitude).join(','),current:CURRENT,timezone:'GMT',forecast_days:'1'});
        const response=await fetch('https://api.open-meteo.com/v1/forecast?'+p,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Meteo non disponibile');
        const rows=abbinaMeteoCitta(group,await response.json());if(!rows)throw Error('Campione incompleto');return rows;
      }));
      const cities=batches.flatMap(r=>r.status==='fulfilled'?r.value:[]);if(!cities.length)throw Error('Meteo non disponibile');
      return {cities,updated:Date.now(),direct:true,partial:batches.some(r=>r.status==='rejected')};
    }
  }
  async function loadWeather(token){
    await Promise.allSettled([
      (async()=>{try{const d=await cached('world',worldData);if(!alive||token!==revision)return;world=d.cities||[];updated=d.updated;weatherState=d.stale?'stale':d.partial?'partial':d.direct?'direct':'ok';}catch{if(token===revision)weatherState=world.length?'stale':'error';}if(token===revision)draw();})(),
      (async()=>{try{const d=await cached('town-weather',()=>ctx.api('mappa/meteo'));if(!alive||token!==revision)return;readings=new Map((d.dati||[]).map(r=>[r[0],r]));townState=d.stale?'stale':'ok';}catch{if(token===revision)townState=readings.size?'stale':'error';}if(token===revision)draw();})()
    ]);
  }
  async function loadTowns(token){
    const request=++townRequest;
    const b=bounds();if(!b)return;
    // Clamp a wrapped view to one world; the UI filters the antimeridian itself.
    const bbox=[Math.max(-180,b.west),Math.max(-90,b.south),Math.min(180,b.east),Math.min(90,b.north)].map(x=>x.toFixed(3)).join(',');
    const key='towns:'+Math.round(map.getZoom())+':'+bbox;
    try{const d=await cached(key,()=>ctx.api(`mappa/comuni?bbox=${bbox}&zoom=${Math.round(map.getZoom())}`));if(!alive||token!==revision||request!==townRequest)return;towns=d.dati||[];}catch{if(token===revision&&request===townRequest)towns=[];}
    if(token===revision)draw();
  }
  async function loadHail(token){
    try{const d=await cached('hail',()=>ctx.api('atlas/hail-map'));if(!alive||token!==revision)return;hail=(d.posts||[]).filter(p=>Number.isFinite(p.map_lat)&&Number.isFinite(p.map_lon)).map(p=>({...p,latitude:p.map_lat/100,longitude:p.map_lon/100})).filter(validPlace);hailState='ok';}catch{if(token===revision)hailState='error';}if(token===revision)draw();
  }
  async function loadEvents(token){
    if(!showEvents)return;
    try{const d=await cached('events',async()=>{try{return await ctx.api('atlas/events');}catch{const r=await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return {events:normalizzaEventiNasa(await r.json()),direct:true};}});if(!alive||token!==revision)return;events=d.events||[];eventState=d.stale?'stale':'ok';}catch{if(token===revision)eventState='error';}if(token===revision)draw();
  }
  async function load(){if(!alive||!map)return;const token=revision;await Promise.allSettled([loadWeather(token),loadTowns(token),loadHail(token),loadEvents(token)]);}

  function draw(){
    if(!alive||!map||!markers)return;markers.clearLayers();
    const s=summary(),zoom=map.getZoom(),labels=[];
    const marker=(p,color,radius,open,fill=.9)=>{const m=L.circleMarker([p.latitude,p.longitude],{bubblingMouseEvents:false,radius,color:'#06171f',weight:1.5,fillColor:color,fillOpacity:fill});m.on('click',open);m.bindTooltip(esc(p.name||p.city||'Segnalazione'),{direction:'top'});markers.addLayer(m);};
    if(mode!=='grandine') for(const p of s.points){
      const k=p.current;let color=mappaColore(k.temperature_2m),radius=7;
      if(mode==='pioggia'){if(!(k.precipitation>0))continue;color='#6ac5ff';radius=Math.min(18,7+k.precipitation*2);}
      if(mode==='fulmini'){if(!isStorm(k.weather_code))continue;color='#d8b1ff';radius=12;}
      marker(p,color,radius,()=>selectPlace(p,false));
      if(mode==='temperature'){
        markers.addLayer(L.circleMarker([p.latitude,p.longitude],{radius:radius+8,weight:0,fillColor:color,fillOpacity:.09,interactive:false}));
        const xy=map.latLngToContainerPoint([p.latitude,p.longitude]);
        const size=zoom>=7?Math.min(180,p.name.length*7+50):60;
        if(!labels.some(q=>Math.abs(q.x-xy.x)<(size+q.size)/2&&Math.abs(q.y-xy.y)<36)){
          labels.push({x:xy.x,y:xy.y,size});
          markers.addLayer(L.marker([p.latitude,p.longitude],{keyboard:false,interactive:false,icon:L.divIcon({className:'mappa-city-label',html:`<span style="--temp:${color}">${zoom>=7?esc(p.name)+' ':''}<b>${number(k.temperature_2m)}°</b></span>`,iconSize:null})}));
        }
      }
      if(mode==='fulmini')markers.addLayer(L.marker([p.latitude,p.longitude],{interactive:false,keyboard:false,icon:L.divIcon({className:'mappa-bolt',html:'ϟ',iconSize:[20,28],iconAnchor:[10,14]})}));
    }
    if(mode==='grandine')for(const p of visibleReports())marker(p,'#ff9567',12,()=>hailPanel(p),.65);
    if(showEvents)for(const e of events.filter(p=>insideViewport(p,bounds())))marker(e,'#ff6577',9,()=>eventPanel(e));
    const counts={temperature:s.points.length,pioggia:s.rain.length,grandine:visibleReports().length,fulmini:s.storms.length};
    for(const m of MODES){const c=$(`[data-conteggio="${m.id}"]`);if(c)c.textContent=(m.id==='grandine'?hailState==='error':!s.points.length&&weatherState==='error')?'—':counts[m.id];}
    const state=weatherState==='loading'?'Carico i dati meteo…':weatherState==='error'?'Meteo mondiale non disponibile':weatherState==='stale'?'Dati precedenti · aggiornamento non riuscito':weatherState==='partial'?'Copertura parziale · Open-Meteo':`Open-Meteo · aggiornato ${clock(updated)}${weatherState==='direct'?' · fonte diretta':''}`;
    notify(mode==='grandine'?(hailState==='error'?'Segnalazioni non disponibili':'Segnalazioni community · ultime 2 ore'):state+(townState==='error'?' · dati comunali assenti':''));
    renderPulse(s);renderLegend();
  }
  function renderPulse(s){
    const slot=$('#mappa-pulse');if(!slot)return;
    if(mode==='temperature'){
      slot.innerHTML=`<div class="mappa-eyebrow">IL TERMOMETRO DEL MONDO <span>● NELLA VISTA</span></div><h2>Ogni città,<br>un altro clima.</h2><p>${s.points.length?s.points.length+' località con dati di modello.':'Esplora il mondo o cerca una città.'}</p><div class="mappa-contrasto">${s.cold?`<button data-extreme="cold"><small>PIÙ FRESCO</small><b>${number(s.cold.current.temperature_2m)}°</b><span>${esc(s.cold.name)}</span></button><button data-extreme="hot"><small>PIÙ CALDO</small><b>${number(s.hot.current.temperature_2m)}°</b><span>${esc(s.hot.name)}</span></button>`:'<p>Le temperature appariranno appena disponibili.</p>'}</div><button class="mappa-compare" id="mappa-confronta">${s.points.length>1?'Confronta questi climi ↗':'Esplora le località ↗'}</button><small>Estremi del campione visibile, non record climatici.</small>`;
      slot.querySelectorAll('[data-extreme]').forEach(b=>b.onclick=()=>selectPlace(s[b.dataset.extreme],true));
      $('#mappa-confronta').onclick=()=>s.points.length>1?comparePanel(s):listPanel();
    } else {
      const m=MODES.find(x=>x.id===mode),count=mode==='grandine'?visibleReports().length:mode==='pioggia'?s.rain.length:s.storms.length;
      slot.innerHTML=`<div class="mappa-eyebrow">ESPLORA · ${m.name.toUpperCase()}</div><h2>${mode==='grandine'?'Il cielo, raccontato<br>da chi c’è.':mode==='pioggia'?'Segui la pioggia.<br>Capisci la zona.':'Dove il modello<br>indica temporali.'}</h2><p>${count} ${mode==='grandine'?'segnalazioni geolocalizzate':'località nel campione visibile'}.</p><p class="mappa-honesty">${mode==='fulmini'?'I simboli indicano temporali previsti, non singoli fulmini rilevati.':mode==='pioggia'?'Precipitazioni da modello sui punti. Per le immagini radar apri Radar e dettaglio.':'Le segnalazioni sono dichiarazioni degli utenti, non allerte ufficiali.'}</p><button class="mappa-compare" id="mappa-apri-elenco">Esplora i dettagli ↗</button>`;
      $('#mappa-apri-elenco').onclick=listPanel;
    }
  }
  function renderLegend(){
    const slot=$('#mappa-legenda');if(!slot)return;
    slot.innerHTML=mode==='temperature'?'<span>Temperatura · °C</span><div class="mappa-scala"></div><div class="mappa-scale-values"><span>−10</span><span>0</span><span>10</span><span>20</span><span>30</span><span>40+</span></div>':mode==='pioggia'?'<span class="mappa-key rain">● Pioggia da modello</span><small>Cerchi più grandi = più precipitazioni · tocca per mm e intervallo</small>':mode==='grandine'?'<span class="mappa-key hail">◇ Grandine segnalata</span><small>Ultime 2 ore · nessun punto non significa assenza di rischio</small>':'<span class="mappa-key storm">ϟ Temporali da modello</span><small>Rete di rilevamento fulmini non collegata</small>';
  }
  function panel(title,html,focus=true){
    const p=$('#mappa-pannello');if(!p)return;panelRevision++;
    if(p.hidden)focusedBeforePanel=document.activeElement;
    $('#mappa-pannello-titolo').textContent=title;$('#mappa-pannello-corpo').innerHTML=html;p.hidden=false;
    $('#mappa-pannello-chiudi').onclick=closePanel;
    if(focus)$('#mappa-pannello-titolo').focus({preventScroll:true});
  }
  function closePanel(){const p=$('#mappa-pannello');if(p)p.hidden=true;panelRevision++;if(focusedBeforePanel?.isConnected)focusedBeforePanel.focus({preventScroll:true});}
  const sourceTime=k=>k?.time?`${String(k.time).replace('T',' ')} UTC`:'orario del modello non disponibile';
  async function selectPlace(p,move=true){
    if(!validPlace(p)||!alive)return;selected={...p};selectedAt++;const token=selectedAt,life=revision;
    if(move)map.setView([p.latitude,p.longitude],Math.max(7,map.getZoom()),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
    if(selectionMarker)map.removeLayer(selectionMarker);
    selectionMarker=L.circleMarker([p.latitude,p.longitude],{radius:17,color:'#fff',weight:2,fillOpacity:0,interactive:false}).addTo(map);
    $('#mappa-ia-testo').placeholder=`Chiedi a Lente di ${p.name}…`;
    locationPanel(selected);draw();const panelToken=panelRevision;
    if(!p.current)try{
      const d=await cached('point:'+p.latitude.toFixed(3)+':'+p.longitude.toFixed(3),async()=>{
        const q=new URLSearchParams({latitude:p.latitude,longitude:p.longitude,current:CURRENT,timezone:'GMT',forecast_days:'1'});
        const r=await fetch('https://api.open-meteo.com/v1/forecast?'+q,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return r.json();
      });
      if(!alive||life!==revision||token!==selectedAt)return;
      selected={...p,current:d.current};if(panelToken===panelRevision)locationPanel(selected,false);draw();
    }catch{if(alive&&life===revision&&token===selectedAt){selected={...p,unavailable:true};if(panelToken===panelRevision)locationPanel(selected,false);}}
  }
  function locationPanel(p,focus=true){
    const k=p.current;
    panel(p.name,`<p class="mappa-eyebrow">${esc([p.province||p.admin1,p.country||p.country_code].filter(Boolean).join(' · ')||'LOCALITÀ SELEZIONATA')}</p><div class="mappa-location-hero"><strong>${k?number(k.temperature_2m)+'°':'—'}</strong><span aria-hidden="true">${k?weatherIcon(k.weather_code):'◎'}</span></div><p>${k?'Temperatura da modello · Open-Meteo':p.unavailable?'Il meteo di questa località non risponde. Riprova più tardi.':'Carico il meteo di questa località…'}</p>${k?`<div class="mappa-metrics"><div><small>PRECIPITAZIONI</small><b>${Number.isFinite(k.precipitation)?esc(String(k.precipitation)):'—'}</b><small>${precipitationLabel(k.interval)}</small></div><div><small>VENTO</small><b>${number(k.wind_speed_10m)}</b><small>km/h</small></div></div><p class="mappa-fonte">Dato valido: ${esc(sourceTime(k))}. ${isStorm(k.weather_code)?'Temporale da modello, non rilevamento di fulmini.':''}</p>`:''}<div class="mappa-actions"><button id="mappa-local-ai" class="mappa-primary">✦ Spiegamelo con Lente</button><button id="mappa-local-weather">Previsioni complete ↗</button><button id="mappa-local-community">Community di ${esc(p.name)} ↗</button><button id="mappa-local-radar">Radar e dettaglio ↗</button></div>`,focus);
    $('#mappa-local-ai').onclick=()=>askAI(`Spiega il meteo di ${p.name} e cosa sappiamo del livello ${MODES.find(m=>m.id===mode).name}.`);
    $('#mappa-local-weather').onclick=()=>ctx.openPlace?.(p,'home');
    $('#mappa-local-community').onclick=()=>ctx.openPlace?.(p,'community');
    $('#mappa-local-radar').onclick=()=>ctx.openPlace?.(p,'mappa-classica');
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
    const s=summary(),rows=mode==='grandine'?visibleReports():mode==='pioggia'?s.rain:mode==='fulmini'?s.storms:s.points;
    panel('Nella zona visibile',`<p class="mappa-fonte">${rows.length} elementi · ${MODES.find(x=>x.id===mode).name}. Mostrati i primi 60; avvicina la mappa per restringere.</p>${mode==='temperature'&&s.points.length>1?'<button class="mappa-primary" id="mappa-list-compare">Confronta caldo e freddo ↗</button>':''}<div class="mappa-result-list">${rows.slice(0,60).map((p,i)=>`<button data-point="${i}"><span>${esc(p.name||p.city||'Zona segnalata')}</span><b>${mode==='grandine'?'◇':mode==='pioggia'?esc(String(p.current.precipitation))+' mm':mode==='fulmini'?'ϟ Modello':number(p.current.temperature_2m)+'°'}</b></button>`).join('')||'<p>Nessun dato per questo livello nella vista. Allarga la mappa o scegli un altro livello: questo non certifica l’assenza del fenomeno.</p>'}</div>`);
    if($('#mappa-list-compare'))$('#mappa-list-compare').onclick=()=>comparePanel(s);
    $('#mappa-pannello-corpo').querySelectorAll('[data-point]').forEach(b=>b.onclick=()=>mode==='grandine'?hailPanel(rows[+b.dataset.point]):selectPlace(rows[+b.dataset.point]));
  }
  function guide(){panel('La mappa, in 20 secondi',`<ol class="mappa-guide"><li><b>Scegli cosa vedere.</b> I quattro pulsanti mostrano temperatura, pioggia, grandine o temporali.</li><li><b>Esplora e tocca una città.</b> I numeri dei livelli e il confronto caldo/freddo riguardano il campione nella vista.</li><li><b>Chiedi a Lente.</b> Seleziona una località, poi scrivi nella barra viola. L’IA riceve dati meteo e nome del luogo; il server esclude coordinate, autori e media dall’invio a OpenAI.</li></ol><h3>Leggere bene le fonti</h3><p>Temperature, pioggia e temporali: modello Open-Meteo. Grandine: osservazioni delle persone, ultime 2 ore. Fulmini: non disponiamo di una rete di rilevamento delle singole scariche. I comuni italiani più piccoli possono non avere dati.</p><p>Le immagini radar recenti sono nella vista di dettaglio. La mappa non certifica aree sicure e non calcola un arrivo affidabile della grandine.</p><button class="mappa-primary" id="mappa-guide-detail">Apri radar e dettaglio ↗</button>`);$('#mappa-guide-detail').onclick=()=>ctx.openPlace?.(selected||ctx.get().place,'mappa-classica');}
  function contextSummary(){
    const s=summary();const info=[];
    if(mode==='temperature'&&s.points.length)info.push(`${s.points.length} località da modello; ${s.cold.name} ${s.cold.current.temperature_2m} °C, ${s.hot.name} ${s.hot.current.temperature_2m} °C`);
    if(mode==='pioggia')info.push(`${s.rain.length} località con precipitazioni da modello, non radar`);
    if(mode==='fulmini')info.push(`${s.storms.length} località con temporali da modello; rilevamenti fulmini non disponibili`);
    if(mode==='grandine')info.push(`${visibleReports().length} osservazioni geolocalizzate di grandine non verificate nelle ultime 2 ore; nessun testo o media incluso`);
    info.push(`stato meteo ${weatherState}; stato segnalazioni ${hailState}; raccolta ${clock(updated)}`);return info.join('; ');
  }
  async function askAI(question){
    if(!selected){panel('Scegli la tua località',`<p>Per una risposta pertinente, cerca una città o tocca un punto sulla mappa. La domanda resta nella barra.</p><button id="mappa-ai-select" class="mappa-primary">Cerca una città</button>`);$('#mappa-ai-select').onclick=()=>{closePanel();$('#mappa-cerca-testo').focus();};return;}
    const place={...selected},context=contextSummary(),input=$('#mappa-ia-testo'),button=$('#mappa-ia-invia');
    if(button.disabled)return;button.disabled=true;
    panel('Lente · '+place.name,`<p class="mappa-eyebrow">IL METEO, SPIEGATO SULLA MAPPA</p><p class="mappa-question">${esc(question)}</p><div id="mappa-risposta" class="mappa-answer" role="status">✦ Lente sta leggendo le fonti…</div><p class="mappa-fonte">Risposta generata dall’IA. Le indicazioni ufficiali hanno sempre precedenza.</p>`);
    const token=panelRevision,life=revision,slot=$('#mappa-risposta');
    try{
      const response=await ctx.api('ai',mapAIRequest(place,question,context,mode==='temperature'?'temperatura':mode==='fulmini'?'meteo':mode));
      if(!alive||life!==revision||token!==panelRevision||!slot.isConnected)return;
      slot.textContent=response.answer||'Non è arrivata una risposta. Riprova.';
      if(input.value.trim()===question)input.value='';
    }catch(e){if(alive&&life===revision&&token===panelRevision&&slot.isConnected){slot.textContent=e.status===401?'Accedi per usare Lente. La tua domanda è conservata.':e.message||'Lente non risponde. La domanda è conservata.';if(e.status===401){const a=document.createElement('a');a.textContent='Accedi con ChatGPT ↗';a.href='/signin-with-chatgpt?return_to='+encodeURIComponent('/#mappa-eventi');slot.append(document.createElement('br'),a);}}}
    finally{if(button.isConnected)button.disabled=false;}
  }
  async function search(event){
    event.preventDefault();const text=$('#mappa-cerca-testo').value.trim();if(!text)return;
    const token=++searchRevision,life=revision;panel('Cerco '+text,'<p role="status">Cerco le località…</p>');
    try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:text,count:'6',language:'it',format:'json'}),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const d=await r.json();if(!alive||life!==revision||token!==searchRevision)return;
      const places=(d.results||[]).filter(validPlace);panel('Scegli la località',`<div class="mappa-result-list">${places.map((p,i)=>`<button data-search-place="${i}"><span><b>${esc(p.name)}</b><small>${esc([p.admin1,p.country].filter(Boolean).join(' · '))}</small></span><span>↗</span></button>`).join('')||'<p>Nessuna città trovata. Prova con un nome più completo.</p>'}</div>`);
      $('#mappa-pannello-corpo').querySelectorAll('[data-search-place]').forEach(b=>b.onclick=()=>selectPlace(places[+b.dataset.searchPlace]));
    }catch{if(alive&&life===revision&&token===searchRevision)panel('Ricerca non disponibile','<p>La ricerca non risponde adesso. Il testo è conservato: riprova fra poco.</p>');}
  }
  function locate(){
    if(!navigator.geolocation){notify('Posizione non supportata. Cerca una città.');return;}
    const life=revision;notify('Attendo il permesso per la posizione…');
    navigator.geolocation.getCurrentPosition(p=>{if(!alive||life!==revision)return;selectPlace({name:'La mia zona',latitude:p.coords.latitude,longitude:p.coords.longitude,source:'gps'});},()=>{if(alive&&life===revision)notify('Posizione non disponibile. Puoi cercare una città.');},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  function keydown(e){if(e.key==='Escape')closePanel();}
  function visibility(){if(!document.hidden)load();}
  async function bind(){
    const host=$('#mappa-tela');if(!host||map)return;alive=true;const life=++revision;
    try{L=await import('./assets/leaflet.js');}catch{notify('Mappa non disponibile. Ricarica la pagina.');return;}
    if(!alive||life!==revision||!host.isConnected)return;
    map=L.map(host,{preferCanvas:true,zoomControl:false,attributionControl:false,worldCopyJump:true,minZoom:2,maxZoom:16}).setView([30,14],3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,crossOrigin:true}).addTo(map);
    markers=L.layerGroup().addTo(map);
    map.on('moveend',()=>{draw();clearTimeout(timer);timer=setTimeout(()=>loadTowns(revision),400);});
    map.on('click',()=>{if($('#mappa-pannello')&&!$('#mappa-pannello').hidden)closePanel();});
    document.querySelectorAll('[data-livello]').forEach(b=>b.onclick=()=>{mode=b.dataset.livello;try{localStorage.setItem('meteosocial:weather-map:mode',mode);}catch{}document.querySelectorAll('[data-livello]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));closePanel();draw();});
    $('#mappa-cerca').onsubmit=search;$('#mappa-ia').onsubmit=e=>{e.preventDefault();const q=$('#mappa-ia-testo').value.trim();askAI(q||'Spiega il meteo della località selezionata e cosa significa questo livello.');};
    $('#mappa-guida').onclick=guide;$('#mappa-posizione').onclick=locate;$('#mappa-mondo').onclick=()=>map.setView([25,10],2);
    $('#mappa-zoom-in').onclick=()=>map.zoomIn();$('#mappa-zoom-out').onclick=()=>map.zoomOut();$('#mappa-elenco').onclick=listPanel;
    $('#mappa-eventi').onclick=()=>{showEvents=!showEvents;$('#mappa-eventi').setAttribute('aria-pressed',String(showEvents));if(showEvents){loadEvents(revision).then(()=>{if(eventState==='error')notify('Catalogo NASA non disponibile.');});}draw();};
    $('#mappa-aggiorna').onclick=async e=>{const button=e.currentTarget;button.disabled=true;cache.clear();notify('Aggiorno le fonti…');try{await load();}finally{if(button.isConnected)button.disabled=false;}};
    document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',visibility);
    refreshTimer=setInterval(()=>{if(!document.hidden)load();},300000);draw();await load();
  }
  function dispose(){alive=false;revision++;panelRevision++;searchRevision++;selectedAt++;clearTimeout(timer);clearInterval(refreshTimer);document.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);if(map)map.remove();map=null;markers=null;selectionMarker=null;}
  return {page,bind,dispose,active:()=>ctx.get().route==='mappa-eventi'};
}
