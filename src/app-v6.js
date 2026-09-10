/* ===== MeteoSocial v6: precise city picking on the globe, clear map layer panel with legends, one-tap weather reports, community pulse, help guide, visual polish ===== */
Object.assign(I18N.it, {
  lp_temp: 'Temperatura', lp_temp_d: 'colore = gradi adesso', lp_rain: 'Pioggia', lp_rain_d: 'radar prossime 12 ore', lp_hail: 'Grandine', lp_hail_d: 'dove e quando', lp_posts: 'Segnalazioni', lp_posts_d: 'dalla community', lp_sat: 'Satellite', lp_gmaps: 'Google Maps', lp_help: 'Guida',
  lg_temp: 'Ogni punto è una città, il colore è la temperatura di adesso. Tocca un punto per aprire la scheda meteo completa.',
  lg_rain: 'Probabilità di pioggia stimata dalle previsioni Open-Meteo. Usa ▶ o il cursore in basso per scorrere le prossime 12 ore.',
  lg_rain_1: 'possibile', lg_rain_2: 'probabile', lg_rain_3: 'forte', lg_rain_4: 'temporale',
  lg_hail: 'Nelle prossime 12 ore: 🧊 = grandine prevista, con ora e probabilità · ⛈️ = temporale senza grandine. Ripara auto e piante quando vedi il ghiaccio.',
  lg_posts: 'Le stelle sono le città con segnalazioni della community: più grande = più post. Tocca la città e poi "Leggi" per vederle.',
  lg_none: 'Nessuna città a rischio grandine nelle prossime 12 ore. Bel segno!',
  pick_h: 'Quale città? Sono vicine, scegli:', qr_h: 'Segnala in un tocco', qr_p: 'Com\'è il cielo adesso a', qr_sun: 'Sole', qr_cloud: 'Nuvole', qr_rain: 'Pioggia', qr_storm: 'Temporale', qr_hail: 'Grandine', qr_snow: 'Neve', qr_fog: 'Nebbia', qr_wind: 'Vento',
  qr_txt: 'Adesso a {city}: {what} {e}', pulse_h: 'Il polso della community', pulse_p: 'segnalazioni nelle ultime 24 ore', pulse_cities: 'città', pulse_people: 'persone', pulse_all: 'Tutte', f_city: 'La mia città',
  help: 'Guida', help_h: 'Come funziona MeteoSocial', help_sub: 'L\'unica app dove il meteo e le persone si incontrano. Tocca una sezione per aprirla.',
  h_globe: 'Globo', h_globe_d: 'La Terra in 3D con giorno e notte reali. I punti colorati sono le città (blu = freddo, rosso = caldo), il rosso che pulsa è un temporale. Trascina per ruotare, rotella per zoomare, tocca una città per la sua scheda. "Giro del mondo" ti porta in volo tra le città più interessanti.',
  h_map: 'Mappa', h_map_d: 'Mappa piatta con 4 livelli: Temperatura, Pioggia (radar animato 12 ore), Grandine (dove e quando) e Segnalazioni della community. Aggiungi il Satellite come sfondo e apri il punto in Google Maps con un tocco.',
  h_weather: 'Meteo', h_weather_d: 'Scheda completa della città scelta: ora per ora, 7 giorni, vento, UV, alba e tramonto, allerte, Meteo Score, scena 3D animata e il commento dell\'IA.',
  h_comm: 'Community', h_comm_d: 'Il social del meteo: feed stile TikTok, storie per città, foto e video, reazioni, commenti, profili, salvati, menzioni. Ogni post porta con sé il meteo reale della città. Con "Segnala in un tocco" dici com\'è il cielo da te in un secondo e finisci sulla mappa.',
  h_ai: 'IA', h_ai_d: 'Assistente meteo con personalità: chiedi cosa mettere, se uscire in bici, dove c\'è il sole. Parla con il microfono e ascolta la risposta. Lo trovi anche nel bottone ✦ in ogni schermata.',
  h_prof: 'Profilo', h_prof_d: 'Il tuo nome, avatar, bio e Instagram, la città di casa, i tuoi post, badge e livello. Da qui condividi l\'app con gli amici.',
  open_sec: 'Apri',
});
Object.assign(I18N.en, {
  lp_temp: 'Temperature', lp_temp_d: 'color = degrees now', lp_rain: 'Rain', lp_rain_d: 'next 12 h radar', lp_hail: 'Hail', lp_hail_d: 'where and when', lp_posts: 'Reports', lp_posts_d: 'from the community', lp_sat: 'Satellite', lp_gmaps: 'Google Maps', lp_help: 'Guide',
  lg_temp: 'Every dot is a city, its color is the temperature right now. Tap a dot to open the full weather card.',
  lg_rain: 'Rain probability estimated from Open-Meteo forecasts. Use ▶ or the slider below to scroll the next 12 hours.',
  lg_rain_1: 'possible', lg_rain_2: 'likely', lg_rain_3: 'heavy', lg_rain_4: 'storm',
  lg_hail: 'Next 12 hours: 🧊 = hail expected, with time and probability · ⛈️ = thunderstorm without hail. Shelter cars and plants when you see the ice.',
  lg_posts: 'Stars are cities with community reports: bigger = more posts. Tap the city, then "Read" to see them.',
  lg_none: 'No city at hail risk in the next 12 hours. Good sign!',
  pick_h: 'Which city? They are close, choose:', qr_h: 'One-tap report', qr_p: 'How is the sky right now in', qr_sun: 'Sun', qr_cloud: 'Clouds', qr_rain: 'Rain', qr_storm: 'Storm', qr_hail: 'Hail', qr_snow: 'Snow', qr_fog: 'Fog', qr_wind: 'Wind',
  qr_txt: 'Right now in {city}: {what} {e}', pulse_h: 'Community pulse', pulse_p: 'reports in the last 24 hours', pulse_cities: 'cities', pulse_people: 'people', pulse_all: 'All', f_city: 'My city',
  help: 'Guide', help_h: 'How MeteoSocial works', help_sub: 'The only app where weather and people meet. Tap a section to open it.',
  h_globe: 'Globe', h_globe_d: 'Earth in 3D with real day and night. Colored dots are cities (blue = cold, red = hot), pulsing red is a storm. Drag to rotate, scroll to zoom, tap a city for its card. "World tour" flies you between the most interesting cities.',
  h_map: 'Map', h_map_d: 'Flat map with 4 layers: Temperature, Rain (animated 12-hour radar), Hail (where and when) and community Reports. Add the Satellite background and open any spot in Google Maps with one tap.',
  h_weather: 'Weather', h_weather_d: 'Full card for the chosen city: hour by hour, 7 days, wind, UV, sunrise and sunset, alerts, Weather Score, animated 3D scene and the AI comment.',
  h_comm: 'Community', h_comm_d: 'The weather social: TikTok-style feed, city stories, photos and videos, reactions, comments, profiles, saved posts, mentions. Every post carries the real weather of its city. With "One-tap report" you say how the sky looks in a second and land on the map.',
  h_ai: 'AI', h_ai_d: 'Weather assistant with personality: ask what to wear, whether to bike, where the sun is. Talk with the mic and listen to the answer. It is also the ✦ button on every screen.',
  h_prof: 'Profile', h_prof_d: 'Your name, avatar, bio and Instagram, home city, your posts, badges and level. Share the app with friends from here.',
  open_sec: 'Open',
});

/* ---------- styles v6 ---------- */
(function () {
  const css = `
  .nav button.active{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 22%,transparent),color-mix(in srgb,var(--accent) 6%,transparent));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent)}
  .nav button.active svg{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 60%,transparent))}
  .chip.on{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,transparent),color-mix(in srgb,var(--accent) 6%,transparent))}
  .view.active{animation:viewIn .28s ease}@keyframes viewIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .lpanel{display:flex;flex-direction:column;gap:6px;pointer-events:auto}
  .lrow{display:flex;gap:6px;flex-wrap:wrap}
  .lbtn{display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:14px;background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--line);backdrop-filter:blur(10px);color:var(--ink);text-align:left;box-shadow:var(--shadow)}
  .lbtn .ic{font-size:20px;line-height:1}.lbtn b{display:block;font-size:13px;line-height:1.1}.lbtn small{display:block;font-size:10px;color:var(--ink3);line-height:1.1;margin-top:2px}
  .lbtn.on{border-color:var(--accent);background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 24%,var(--surface)),var(--surface));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
  .lbtn.tog.on{border-color:var(--sun,#F5B841);box-shadow:0 0 0 3px color-mix(in srgb,#F5B841 25%,transparent)}
  .mlegend{max-width:420px;padding:8px 12px;border-radius:12px;background:color-mix(in srgb,var(--surface) 90%,transparent);border:1px solid var(--line);backdrop-filter:blur(10px);font-size:12px;color:var(--ink2);line-height:1.35;pointer-events:auto;box-shadow:var(--shadow)}
  .mlegend .bar{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}.mlegend .bar span{display:inline-flex;align-items:center;gap:5px;font-size:11px}.mlegend .bar i{width:14px;height:10px;border-radius:3px;display:inline-block}
  .mlegend .grad{height:8px;border-radius:4px;background:linear-gradient(90deg,#5B8DEF,#4ADE80,#F5B841,#F87171);margin-top:6px}.mlegend .ticks{display:flex;justify-content:space-between;font-size:10px;color:var(--ink3)}
  @media (max-width:640px){.lbtn small{display:none}.lbtn{padding:6px 10px}.mlegend{font-size:11px;max-width:100%;max-height:34px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer}.mlegend.open{max-height:none;white-space:normal}.mlegend .bar{display:none}.mlegend.open .bar{display:flex}#helpBtn{display:none}}
  .pickmenu{position:absolute;z-index:6;display:none;flex-direction:column;gap:2px;padding:6px;border-radius:14px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);min-width:200px}.pickmenu.show{display:flex;max-height:60%;overflow:auto}.pickmenu .ph{font-size:11px;color:var(--ink3);padding:2px 8px 4px}.pickmenu button{display:flex;gap:6px;align-items:center;padding:7px 10px;border-radius:9px;color:var(--ink);font-size:13px;text-align:left}.pickmenu button:hover{background:var(--surface2)}.pickmenu .num{margin-left:auto;font-weight:700}
  .qr{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 16%,var(--surface)),var(--surface));border:1px solid var(--line);border-radius:18px;padding:12px 14px;margin-bottom:12px;box-shadow:var(--shadow)}
  .qr h4{font-family:Sora,sans-serif;font-size:14px;margin:0}.qr .sub{font-size:12px;color:var(--ink2);margin:2px 0 8px}
  .qr .btns{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}.qr .btns::-webkit-scrollbar{display:none}
  .qr .btns button{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:2px;width:64px;padding:8px 4px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--ink);font-size:11px;transition:transform .15s}
  .qr .btns button span:first-child{font-size:24px}.qr .btns button:hover{transform:translateY(-2px);border-color:var(--accent)}
  .pulse{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-radius:16px;background:var(--surface);border:1px solid var(--line);margin-bottom:12px}
  .pulse .ph{font-size:12px;color:var(--ink2)}.pulse .ph b{color:var(--ink);font-family:Sora,sans-serif;font-size:13px;display:block}
  .pulse .tags{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}.pulse .tags button{padding:4px 9px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:12px;color:var(--ink)}.pulse .tags button.on{border-color:var(--accent);color:var(--accent)}
  .helpgrid{display:grid;gap:10px;margin-top:12px}.helpgrid button{display:flex;gap:12px;align-items:flex-start;text-align:left;padding:12px;border-radius:16px;background:var(--surface2);border:1px solid var(--line);color:var(--ink)}
  .helpgrid .ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:22px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,transparent),transparent);flex:0 0 auto}
  .helpgrid b{font-family:Sora,sans-serif;font-size:14px}.helpgrid p{font-size:12px;color:var(--ink2);margin:3px 0 0;line-height:1.4}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

/* ---------- globe: pick the nearest visible city on screen (no more wrong city) ---------- */
(function () {
  const G = window.__globe; if (!G) return; const { markers, camera, THREE } = G;
  const canvas = $('#v-globe canvas'), stage = $('#v-globe .stage'), tip = $('#globeTip'); if (!canvas) return;
  const wp = new THREE.Vector3(), cp = new THREE.Vector3();
  const nearList = e => {
    const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
    camera.getWorldPosition(cp); const cd = cp.clone().normalize(); const out = [];
    markers.forEach((m, i) => { m.getWorldPosition(wp); if (wp.clone().normalize().dot(cd) < 0.12) return; const v = wp.clone().project(camera); const x = (v.x + 1) / 2 * r.width, y = (1 - v.y) / 2 * r.height; const d = Math.hypot(x - mx, y - my); if (d < 26) out.push({ i, d }); });
    return out.sort((a, b) => a.d - b.d);
  };
  const pickNear = e => { const l = nearList(e); return l.length ? l[0].i : null; };
  const menu = document.createElement('div'); menu.className = 'pickmenu'; menu.id = 'pickMenu'; stage.appendChild(menu);
  const showMenu = (list, e) => { const r = stage.getBoundingClientRect(); menu.innerHTML = `<div class="ph">${t('pick_h')}</div>` + list.slice(0, 12).map(({ i }) => { const c = WX[i]; return `<button data-i="${i}">${isNightIcon(c.w, c.day)} <b>${esc(c.n)}</b> <span class="num">${T(c.t)}°</span></button>`; }).join(''); menu.style.left = Math.min(e.clientX - r.left, r.width - 230) + 'px'; menu.style.top = Math.min(e.clientY - r.top + 8, r.height - 60 - Math.min(list.length, 12) * 34) + 'px'; menu.classList.add('show'); };
  menu.onclick = ev => { const b = ev.target.closest('[data-i]'); if (!b) return; ev.stopPropagation(); menu.classList.remove('show'); const i = +b.dataset.i; selected = i; cityCard(i, $('#globeCard')); $('#globeCard').classList.add('show'); };
  let down = null, moved = 0, hov = null;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; moved = 0; });
  canvas.addEventListener('pointermove', e => {
    if (down) { moved += Math.abs(e.clientX - down[0]) + Math.abs(e.clientY - down[1]); down = [e.clientX, e.clientY]; return; }
    const i = pickNear(e);
    if (i !== hov) { if (hov != null && markers[hov]) markers[hov].scale.setScalar(1); hov = i; if (i != null) markers[i].scale.setScalar(1.9); }
    canvas.style.cursor = i != null ? 'pointer' : 'grab';
    if (i != null) { const c = WX[i]; tip.innerHTML = `${isNightIcon(c.w, c.day)} <b>${esc(c.n)}</b> · <span class="num">${T(c.t)}°</span> · ${wLabel(c.w)}`; tip.style.display = 'block'; const r = stage.getBoundingClientRect(); tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 220) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; } else tip.style.display = 'none';
  });
  canvas.addEventListener('pointerup', e => {
    const wasDown = !!down; down = null; if (!wasDown || moved > 6) return;
    menu.classList.remove('show');
    const list = nearList(e); if (!list.length) return;
    const close = list.filter(x => x.d < list[0].d + 14);
    if (close.length > 1) { showMenu(close, e); if (camera.position.z > 2.6) { G.setZoom(Math.max(1.9, camera.position.z * 0.62)); if (window.__globeFocus) window.__globeFocus(close[0].i); } return; }
    const i = list[0].i; selected = i; cityCard(i, $('#globeCard')); $('#globeCard').classList.add('show');
  });
  canvas.addEventListener('pointerleave', () => { down = null; });
})();

/* ---------- map: layer panel + legends ---------- */
(function () {
  const M = window.__map; if (!M) return;
  const ov = $('#v-map .overlay'); const oldRow = ov.firstElementChild; oldRow.style.display = 'none'; $('#mapHint').style.display = 'none';
  const panel = document.createElement('div'); panel.className = 'lpanel'; panel.id = 'layerPanel';
  const modes = [['temp', '🌡️'], ['rain', '🌧️'], ['hail', '🧊'], ['posts', '💬']];
  panel.innerHTML = `<div class="lrow">${modes.map(([k, ic]) => `<button class="lbtn ${k === 'temp' ? 'on' : ''}" data-mode="${k}"><span class="ic">${ic}</span><span><b data-i18n="lp_${k}">${t('lp_' + k)}</b><small data-i18n="lp_${k}_d">${t('lp_' + k + '_d')}</small></span></button>`).join('')}</div>
    <div class="lrow"><button class="lbtn tog" data-tog="sat"><span class="ic">🛰️</span><span><b data-i18n="lp_sat">${t('lp_sat')}</b></span></button><button class="lbtn tog" data-tog="gmaps"><span class="ic">📍</span><span><b data-i18n="lp_gmaps">${t('lp_gmaps')}</b></span></button><button class="lbtn tog" data-tog="help"><span class="ic">❔</span><span><b data-i18n="lp_help">${t('lp_help')}</b></span></button></div>
    <div class="mlegend" id="mapLegend"></div>`;
  ov.prepend(panel);
  const legend = () => {
    const mode = M.state().layer; const L = $('#mapLegend');
    if (mode === 'temp') L.innerHTML = `${t('lg_temp')}<div class="grad"></div><div class="ticks"><span>-10°</span><span>10°</span><span>20°</span><span>30°</span><span>40°+</span></div>`;
    else if (mode === 'rain') L.innerHTML = `${t('lg_rain')}<div class="bar"><span><i style="background:#6C8CFF"></i>&lt;40% ${t('lg_rain_1')}</span><span><i style="background:#4ADE80"></i>40–60% ${t('lg_rain_2')}</span><span><i style="background:#F5B841"></i>60–80% ${t('lg_rain_3')}</span><span><i style="background:#F87171"></i>&gt;80% / ⛈️ ${t('lg_rain_4')}</span></div>`;
    else if (mode === 'hail') { const risk = WX.map(c => { const h = c.hours.slice(0, 12).find(h => h[3] === 96 || h[3] === 99); return h ? `<b>${esc(c.n)}</b> ${h[0]}` : null; }).filter(Boolean); L.innerHTML = risk.length ? `${t('lg_hail')}<div class="bar">🧊 ${risk.slice(0, 8).join(' · ')}${risk.length > 8 ? ' · +' + (risk.length - 8) : ''}</div>` : t('lg_none'); }
    else L.innerHTML = t('lg_posts');
  };
  const radarIsOn = () => $('#radarBtn') && $('#radarBtn').classList.contains('on');
  const setMode = mode => {
    if (mode === 'rain' && !radarIsOn()) $('#radarBtn').click(); if (mode !== 'rain' && radarIsOn()) $('#radarBtn').click();
    M.setLayer(mode); $$('#v-map [data-layer]').forEach(x => x.classList.toggle('on', x.dataset.layer === mode));
    $$('#layerPanel [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode)); legend();
  };
  panel.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  panel.querySelector('[data-tog="sat"]').onclick = e => { $('#satBtn').click(); e.currentTarget.classList.toggle('on', $('#satBtn').classList.contains('on')); };
  panel.querySelector('[data-tog="gmaps"]').onclick = () => $('#gmapsBtn').click();
  panel.querySelector('[data-tog="help"]').onclick = () => openHelp('map');
  $('#mapLegend').onclick = () => $('#mapLegend').classList.toggle('open');
  window.__setMapMode = setMode; legend();
  const baseApply = applyLang; applyLang = function () { baseApply(); legend(); };
})();

/* ---------- community: one-tap report + pulse + city filter ---------- */
const QR = [['sun', '☀️', 'obs'], ['cloud', '⛅', 'obs'], ['rain', '🌧️', 'rain'], ['storm', '⛈️', 'storm'], ['hail', '🧊', 'hail'], ['snow', '❄️', 'snow'], ['fog', '🌫️', 'obs'], ['wind', '💨', 'obs']];
(function () {
  const qr = document.createElement('div'); qr.className = 'qr'; qr.id = 'quickReport';
  const render = () => { qr.innerHTML = `<h4>⚡ ${t('qr_h')}</h4><div class="sub">${t('qr_p')} <b>${esc(WX[prefs.home].n)}</b>?</div><div class="btns">${QR.map(([k, e]) => `<button data-k="${k}" data-e="${e}"><span>${e}</span><span>${t('qr_' + k)}</span></button>`).join('')}</div>`; };
  render(); $('#dailyPrompt').before(qr);
  qr.onclick = ev => { const b = ev.target.closest('[data-k]'); if (!b) return; const [k, e, tag] = QR.find(x => x[0] === b.dataset.k); openComposer(prefs.home); const mb = $(`#moods [data-e="${e}"]`); if (mb) mb.click(); $('#postText').value = t('qr_txt').replace('{city}', WX[prefs.home].n).replace('{what}', t('qr_' + k).toLowerCase()).replace('{e}', e) + ' #CieloDiOggi'; };
  // pulse
  const pulse = document.createElement('div'); pulse.className = 'pulse'; pulse.id = 'pulse'; qr.after(pulse);
  window.__tagFilter = null;
  const renderPulse = () => {
    const ps = allPosts().filter(p => Date.now() - p.ts < 864e5 * 3); const counts = {}; ps.forEach(p => { const e = p.e || TAGS[p.tag] || '👀'; counts[e] = (counts[e] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    pulse.innerHTML = `<div class="ph"><b>📡 ${t('pulse_h')}</b>${ps.length} ${t('pulse_p')} · ${new Set(ps.map(p => p.city)).size} ${t('pulse_cities')} · ${new Set(ps.map(p => p.u)).size} ${t('pulse_people')}</div><div class="tags"><button data-e="" class="${window.__tagFilter ? '' : 'on'}">${t('pulse_all')}</button>${top.map(([e, n]) => `<button data-e="${e}" class="${window.__tagFilter === e ? 'on' : ''}">${e} ${n}</button>`).join('')}</div>`;
  };
  pulse.onclick = e => { const b = e.target.closest('[data-e]'); if (!b) return; window.__tagFilter = b.dataset.e || null; renderFeed(); };
  $('#feedFilters').insertAdjacentHTML('beforeend', `<button class="chip" data-f="city">🏠 <span data-i18n="f_city">${t('f_city')}</span></button>`);
  const base = renderFeed;
  renderFeed = function () {
    const orig = allPosts; const tf = window.__tagFilter; const f = feedFilter;
    if (tf || f === 'city') { allPosts = () => orig().filter(p => (!tf || (p.e || TAGS[p.tag] || '👀') === tf) && (f !== 'city' || p.city === WX[prefs.home].n)); const keep = feedFilter; if (f === 'city') feedFilter = 'all'; try { base(); } finally { feedFilter = keep; allPosts = orig; } $$('#feedFilters .chip').forEach(x => x.classList.toggle('on', x.dataset.f === keep)); }
    else base();
    renderPulse(); render();
  };
})();

/* ---------- help guide ---------- */
function openHelp(focus) {
  let sh = $('#helpSheet'); if (!sh) { sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'helpSheet'; document.body.appendChild(sh); sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('[data-close]')) sh.classList.remove('show'); }); }
  const secs = [['globe', '🌍', 'h_globe'], ['map', '🗺️', 'h_map'], ['weather', '🌤️', 'h_weather'], ['community', '💬', 'h_comm'], ['ai', '✦', 'h_ai'], ['profile', '👤', 'h_prof']];
  sh.innerHTML = `<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h3>❔ ${t('help_h')}</h3><button class="ib" data-close>✕</button></div><div class="note" style="margin-top:4px">${t('help_sub')}</div>
    <div class="helpgrid">${secs.map(([v, ic, k]) => `<button data-v="${v}" ${v === focus ? 'style="border-color:var(--accent)"' : ''}><span class="ic">${ic}</span><span><b>${t(k)}</b><p>${t(k + '_d')}</p></span></button>`).join('')}</div></div>`;
  sh.classList.add('show'); sh.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { sh.classList.remove('show'); show(b.dataset.v); });
}
(function () { const tools = $('.tools'); const b = document.createElement('button'); b.className = 'ib'; b.id = 'helpBtn'; b.title = t('help'); b.textContent = '❔'; tools.insertBefore(b, $('#bell') || $('#langBtn')); b.onclick = () => openHelp(currentView); })();
applyLang();
