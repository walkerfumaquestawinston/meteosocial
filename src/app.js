/* ===== MeteoSocial ===== */
const TEMPLATE = '<!doctype html>\n' + document.documentElement.outerHTML;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- i18n ---------- */
const I18N = {
  it: {
    share: 'Condividi', autorotate: 'Rotazione automatica', cold: 'Freddo', hot: 'Caldo', layer_temp: 'Temperature', layer_rain: 'Pioggia', layer_posts: 'Segnalazioni',
    map_hint: 'Trascina per muoverti · rotella per zoom', community_title: 'Community', f_all: 'Tutte', f_near: 'Vicino a me', f_alert: 'Allerte', f_top: 'Più utili',
    t_obs: 'Osservazione', t_rain: 'Pioggia', t_storm: 'Temporale', t_heat: 'Caldo', t_snow: 'Neve', t_alert: 'Allerta', publish: 'Pubblica',
    ai_title: 'Assistente meteo', ai_sub: 'Chiedi qualsiasi cosa sul meteo delle città seguite e su cosa dice la community.', send: 'Invia',
    profile_title: 'Il tuo profilo', nickname: 'Nome visibile', home_city: 'La tua città', units: 'Unità', language: 'Lingua', theme: 'Tema', th_auto: 'Automatico', th_dark: 'Scuro', th_light: 'Chiaro',
    share_title: 'Invita amici', copy: 'Copia link', share_note: 'Chi apre il link vede il globo, le previsioni e la community.', about: 'Come funziona',
    about_text: 'MeteoSocial unisce previsioni reali (fonte Open-Meteo) a una community che racconta il meteo in tempo reale. Le segnalazioni sono osservazioni delle persone: usa sempre le fonti ufficiali per decisioni di sicurezza.',
    n_globe: 'Globo', n_map: 'Mappa', n_weather: 'Meteo', n_community: 'Community', n_ai: 'IA', n_profile: 'Profilo',
    intro_h: 'Il meteo del mondo, raccontato da chi lo vive.', intro_p: 'Previsioni reali, un globo 3D, una mappa e una community dove segnalare pioggia, temporali e caldo nella tua zona.',
    fe1: 'Globo 3D interattivo', fe2: 'Mappa con temperature', fe3: 'Segnalazioni dal vivo', fe4: 'Assistente IA', start: 'Entra',
    search_ph: 'Cerca una città nel mondo…', post_ph: 'Cosa vedi fuori dalla finestra? Racconta il meteo nella tua zona…', ai_ph: "Es. Domani a Roma serve l'ombrello?", nick_ph: 'Es. Luca',
    now: 'Adesso', today: 'Oggi', tomorrow: 'Domani', feels: 'Percepiti', min: 'Min', max: 'Max', wind: 'Vento', humidity: 'Umidità', uv: 'Indice UV', sun: 'Alba / Tramonto',
    next_hours: 'Prossime ore', next_days: 'Prossimi 7 giorni', details: 'Dettagli', alerts: 'Allerte', no_alerts: 'Nessuna allerta rilevante nelle prossime 24 ore.',
    a_storm: 'Temporali previsti', a_storm_d: 'Codice meteo temporalesco nelle prossime ore: evita zone aperte e alberi.', a_heat: 'Caldo intenso', a_heat_d: 'Temperatura percepita oltre 35°: bevi spesso ed evita il sole nelle ore centrali.',
    a_rain: 'Pioggia molto probabile', a_rain_d: 'Probabilità di pioggia oltre il 70% nelle prossime ore.', a_wind: 'Vento forte', a_wind_d: 'Raffiche oltre 35 km/h.', a_cold: 'Freddo intenso', a_cold_d: 'Temperatura vicino o sotto lo zero.',
    ai_summary: 'Riassunto IA', ai_thinking: 'Sto leggendo i dati…', ai_off: "L'assistente IA non è disponibile in questa vista.", ai_ask: 'Chiedi un riassunto in parole semplici',
    world_now: 'Il mondo adesso', hottest: 'Più caldo', coldest: 'Più freddo', rainiest: 'Più piovoso', windiest: 'Più ventoso',
    open_weather: 'Apri previsioni', open_community: 'Community', set_home: 'Imposta come casa', from_home: 'La tua città',
    updated: 'Dati aggiornati', source: 'Fonte: Open-Meteo', posts_here: 'segnalazioni qui', post_here: 'Segnala qui',
    like: 'Utile', comment: 'Commenta', reply_ph: 'Scrivi un commento…', you: 'Tu', example: 'esempio', ago_now: 'adesso', ago_m: 'min fa', ago_h: 'ore fa', ago_d: 'giorni fa',
    empty_feed: 'Nessuna segnalazione qui. Sii il primo a raccontare il meteo!', published: 'Segnalazione pubblicata per tutti', saved_local: 'Salvata sul tuo dispositivo (solo tu la vedi)',
    readonly_note: 'Le tue segnalazioni restano sul tuo dispositivo: chi gestisce la pagina può pubblicarle per tutti.', writer_note: 'Le tue segnalazioni vengono pubblicate per tutti quelli che aprono il link.',
    copied: 'Link copiato!', people_online: 'persone online ora', post_short: 'Scrivi almeno 3 caratteri', post_ok: 'Pubblicata', deleted: 'Eliminata',
    ai_hello: 'Ciao! Sono l\'assistente di MeteoSocial. Posso spiegarti le previsioni in parole semplici, confrontare città e riassumere cosa dice la community.',
    c1: 'Serve l\'ombrello domani?', c2: 'Dove fa più caldo nel mondo adesso?', c3: 'Cosa mi consigli di indossare?', c4: 'Riassumi la community',
    ai_error: 'Non riesco a rispondere adesso. Riprova tra poco.', ai_consent: 'Per usare l\'assistente serve il consenso nella finestra che si apre.',
    delete: 'Elimina', verify: 'Verificato dai dati', unverified: 'Non verificato', legend_posts: 'Pin = segnalazioni', locate_err: 'Posizione non disponibile: scegli la città dal profilo.',
    my_pos: 'La città più vicina a te', rain_prob: 'pioggia', km_h: 'km/h', tap_city: 'Tocca una città per i dettagli',
  },
  en: {
    share: 'Share', autorotate: 'Auto-rotate', cold: 'Cold', hot: 'Hot', layer_temp: 'Temperature', layer_rain: 'Rain', layer_posts: 'Reports',
    map_hint: 'Drag to move · scroll to zoom', community_title: 'Community', f_all: 'All', f_near: 'Near me', f_alert: 'Alerts', f_top: 'Most helpful',
    t_obs: 'Observation', t_rain: 'Rain', t_storm: 'Storm', t_heat: 'Heat', t_snow: 'Snow', t_alert: 'Alert', publish: 'Post',
    ai_title: 'Weather assistant', ai_sub: 'Ask anything about the weather in your cities and what the community is reporting.', send: 'Send',
    profile_title: 'Your profile', nickname: 'Display name', home_city: 'Your city', units: 'Units', language: 'Language', theme: 'Theme', th_auto: 'Auto', th_dark: 'Dark', th_light: 'Light',
    share_title: 'Invite friends', copy: 'Copy link', share_note: 'Anyone with the link sees the globe, forecasts and community.', about: 'How it works',
    about_text: 'MeteoSocial combines real forecasts (source: Open-Meteo) with a community reporting the weather in real time. Reports are people\'s observations: always rely on official sources for safety decisions.',
    n_globe: 'Globe', n_map: 'Map', n_weather: 'Weather', n_community: 'Community', n_ai: 'AI', n_profile: 'Profile',
    intro_h: 'The world\'s weather, told by the people living it.', intro_p: 'Real forecasts, a 3D globe, a map and a community where you report rain, storms and heat in your area.',
    fe1: 'Interactive 3D globe', fe2: 'Temperature map', fe3: 'Live reports', fe4: 'AI assistant', start: 'Enter',
    search_ph: 'Search a city worldwide…', post_ph: 'What do you see outside? Tell the weather in your area…', ai_ph: 'E.g. Do I need an umbrella in Rome tomorrow?', nick_ph: 'E.g. Luca',
    now: 'Now', today: 'Today', tomorrow: 'Tomorrow', feels: 'Feels like', min: 'Min', max: 'Max', wind: 'Wind', humidity: 'Humidity', uv: 'UV index', sun: 'Sunrise / Sunset',
    next_hours: 'Next hours', next_days: 'Next 7 days', details: 'Details', alerts: 'Alerts', no_alerts: 'No relevant alerts in the next 24 hours.',
    a_storm: 'Thunderstorms expected', a_storm_d: 'Thunderstorm codes in the next hours: avoid open areas and trees.', a_heat: 'Intense heat', a_heat_d: 'Feels-like temperature above 35°: drink often and avoid midday sun.',
    a_rain: 'Rain very likely', a_rain_d: 'Rain probability above 70% in the next hours.', a_wind: 'Strong wind', a_wind_d: 'Gusts above 35 km/h.', a_cold: 'Intense cold', a_cold_d: 'Temperature near or below freezing.',
    ai_summary: 'AI summary', ai_thinking: 'Reading the data…', ai_off: 'The AI assistant is not available in this view.', ai_ask: 'Ask for a plain-words summary',
    world_now: 'The world right now', hottest: 'Hottest', coldest: 'Coldest', rainiest: 'Rainiest', windiest: 'Windiest',
    open_weather: 'Open forecast', open_community: 'Community', set_home: 'Set as home', from_home: 'Your city',
    updated: 'Data updated', source: 'Source: Open-Meteo', posts_here: 'reports here', post_here: 'Report here',
    like: 'Helpful', comment: 'Comment', reply_ph: 'Write a comment…', you: 'You', example: 'example', ago_now: 'just now', ago_m: 'min ago', ago_h: 'h ago', ago_d: 'days ago',
    empty_feed: 'No reports here yet. Be the first to tell the weather!', published: 'Report published for everyone', saved_local: 'Saved on your device (only you can see it)',
    readonly_note: 'Your reports stay on your device: the page owner can publish them for everyone.', writer_note: 'Your reports are published for everyone who opens the link.',
    copied: 'Link copied!', people_online: 'people online now', post_short: 'Write at least 3 characters', post_ok: 'Posted', deleted: 'Deleted',
    ai_hello: 'Hi! I\'m the MeteoSocial assistant. I can explain forecasts in plain words, compare cities and summarize what the community says.',
    c1: 'Do I need an umbrella tomorrow?', c2: 'Where is it hottest right now?', c3: 'What should I wear?', c4: 'Summarize the community',
    ai_error: 'I can\'t answer right now. Please try again shortly.', ai_consent: 'To use the assistant, accept the consent dialog that opens.',
    delete: 'Delete', verify: 'Matches the data', unverified: 'Unverified', legend_posts: 'Pins = reports', locate_err: 'Location unavailable: pick your city in the profile.',
    my_pos: 'Closest city to you', rain_prob: 'rain', km_h: 'km/h', tap_city: 'Tap a city for details',
  }
};
const t = k => (I18N[prefs.lang] && I18N[prefs.lang][k]) || I18N.it[k] || k;

/* ---------- prefs ---------- */
const LS = { get(k, d) { try { const v = localStorage.getItem('ms_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem('ms_' + k, JSON.stringify(v)); } catch {} } };
const prefs = Object.assign({ lang: (navigator.language || 'it').startsWith('it') ? 'it' : 'en', unit: 'C', theme: 'auto', nick: '', home: 0, intro: false }, LS.get('prefs', {}));
const savePrefs = () => LS.set('prefs', prefs);

/* ---------- weather helpers ---------- */
const WMO = {
  0: ['☀️', 'Sereno', 'Clear sky'], 1: ['🌤️', 'Poco nuvoloso', 'Mostly clear'], 2: ['⛅', 'Parzialmente nuvoloso', 'Partly cloudy'], 3: ['☁️', 'Nuvoloso', 'Overcast'],
  45: ['🌫️', 'Nebbia', 'Fog'], 48: ['🌫️', 'Nebbia con brina', 'Rime fog'], 51: ['🌦️', 'Pioviggine leggera', 'Light drizzle'], 53: ['🌦️', 'Pioviggine', 'Drizzle'], 55: ['🌧️', 'Pioviggine intensa', 'Dense drizzle'],
  56: ['🌧️', 'Pioviggine gelata', 'Freezing drizzle'], 57: ['🌧️', 'Pioviggine gelata', 'Freezing drizzle'], 61: ['🌧️', 'Pioggia leggera', 'Light rain'], 63: ['🌧️', 'Pioggia', 'Rain'], 65: ['🌧️', 'Pioggia forte', 'Heavy rain'],
  66: ['🌧️', 'Pioggia gelata', 'Freezing rain'], 67: ['🌧️', 'Pioggia gelata', 'Freezing rain'], 71: ['🌨️', 'Neve leggera', 'Light snow'], 73: ['🌨️', 'Neve', 'Snow'], 75: ['❄️', 'Neve forte', 'Heavy snow'], 77: ['🌨️', 'Granelli di neve', 'Snow grains'],
  80: ['🌦️', 'Rovesci leggeri', 'Light showers'], 81: ['🌧️', 'Rovesci', 'Showers'], 82: ['⛈️', 'Rovesci violenti', 'Violent showers'], 85: ['🌨️', 'Rovesci di neve', 'Snow showers'], 86: ['❄️', 'Rovesci di neve forti', 'Heavy snow showers'],
  95: ['⛈️', 'Temporale', 'Thunderstorm'], 96: ['⛈️', 'Temporale con grandine', 'Thunderstorm with hail'], 99: ['⛈️', 'Temporale con grandine forte', 'Severe thunderstorm with hail']
};
const wIcon = c => (WMO[c] || WMO[3])[0];
const wLabel = c => (WMO[c] || WMO[3])[prefs.lang === 'en' ? 2 : 1];
const isNightIcon = (c, day) => (!day && (c === 0 || c === 1 || c === 2)) ? '🌙' : wIcon(c);
const T = v => prefs.unit === 'F' ? Math.round(v * 9 / 5 + 32) : v;
const deg = () => '°';
function tempColor(c) { // -10..40
  const stops = [[-10, [108, 140, 255]], [8, [56, 189, 248]], [18, [74, 222, 128]], [28, [245, 184, 65]], [38, [248, 113, 113]]];
  if (c <= stops[0][0]) return `rgb(${stops[0][1]})`;
  for (let i = 1; i < stops.length; i++) if (c <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], f = (c - a) / (b - a); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * f)).join(',')})`; }
  return `rgb(${stops[stops.length - 1][1]})`;
}
const cityName = i => WX[i].n;
const cityByName = n => WX.findIndex(c => c.n === n);
function alertsFor(c) {
  const out = [];
  const next = c.hours.slice(0, 12);
  if (next.some(h => h[3] >= 95) || c.w >= 95) out.push(['⛈️', 'a_storm', 'a_storm_d', 'storm']);
  if (c.ta >= 35 || c.days[0][2] >= 36) out.push(['🔥', 'a_heat', 'a_heat_d', 'warn']);
  if (next.some(h => h[2] >= 70) && !out.some(a => a[1] === 'a_storm')) out.push(['🌧️', 'a_rain', 'a_rain_d', 'warn']);
  if (c.ws >= 35) out.push(['💨', 'a_wind', 'a_wind_d', 'warn']);
  if (c.t <= 0) out.push(['🥶', 'a_cold', 'a_cold_d', 'warn']);
  return out;
}
function dist(a, b) { const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180; const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
function nearest(lat, lon) { let best = 0, bd = 1e9; WX.forEach((c, i) => { const d = dist({ lat, lon }, c); if (d < bd) { bd = d; best = i; } }); return best; }
const dayName = (iso, i) => { if (i === 0) return t('today'); if (i === 1) return t('tomorrow'); return new Date(iso + 'T12:00').toLocaleDateString(prefs.lang === 'en' ? 'en-GB' : 'it-IT', { weekday: 'short', day: 'numeric' }); };
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return t('ago_now'); if (m < 60) return m + ' ' + t('ago_m'); const h = Math.round(m / 60); if (h < 24) return h + ' ' + t('ago_h'); return Math.round(h / 24) + ' ' + t('ago_d'); };
const ptext = p => typeof p.t === 'object' && p.t ? (p.t[prefs.lang] || p.t.it) : p.t;
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const avColor = n => { let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h} 60% 45%)`; };
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const TAGS = { obs: '👀', rain: '🌧️', storm: '⛈️', heat: '🔥', snow: '❄️', alert: '🚨' };

/* ---------- state ---------- */
let selected = prefs.home || 0;
let stateDoc = { posts: [] };
try { stateDoc = JSON.parse($('#state').textContent) || stateDoc; } catch {}
let localPosts = LS.get('localPosts', []);
let myLikes = LS.get('likes', {});
let canWrite = null; // unknown until first publish attempt
let artifactNs = null, sampleNs = null, roomNs = null;
const seedPosts = [
  { id: 'seed1', u: 'Team MeteoSocial', city: 'San Benedetto del Tronto', t: { it: 'Benvenuti su MeteoSocial! 🌍 Qui la community racconta il meteo dal vivo. Scrivi cosa vedi fuori dalla finestra.', en: 'Welcome to MeteoSocial! 🌍 Here the community tells the weather live. Write what you see outside your window.' }, tag: 'obs', ts: Date.now() - 3600e3 * 5, likes: 12, com: [], seed: true },
  { id: 'seed2', u: 'Team MeteoSocial', city: 'Roma', t: { it: 'Su Roma i dati mostrano temporali con grandine nelle prossime ore ⛈️ Se siete in zona, raccontateci com\'è la situazione reale.', en: 'Data shows thunderstorms with hail over Rome in the next hours ⛈️ If you are there, tell us what it really looks like.' }, tag: 'storm', ts: Date.now() - 3600e3 * 2, likes: 8, com: [], seed: true },
  { id: 'seed3', u: 'Team MeteoSocial', city: 'Dubai', t: { it: 'Percepiti 43° a Dubai in questo momento 🔥 Chi vive lì: come vi organizzate con questo caldo?', en: 'Feels like 43° in Dubai right now 🔥 Locals: how do you cope with this heat?' }, tag: 'heat', ts: Date.now() - 3600e3 * 1, likes: 5, com: [], seed: true },
];
function allPosts() {
  const ids = new Set(stateDoc.posts.map(p => p.id));
  const lids = new Set(localPosts.map(p => p.id));
  const seeds = stateDoc.posts.length ? [] : seedPosts.filter(p => !lids.has(p.id));
  return [...localPosts.filter(p => !ids.has(p.id)), ...stateDoc.posts, ...seeds].sort((a, b) => b.ts - a.ts);
}

/* ---------- UI basics ---------- */
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2200); }
function applyLang() {
  $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  $$('[data-ph]').forEach(el => el.placeholder = t(el.dataset.ph));
  $('#langBtn').textContent = prefs.lang.toUpperCase();
  $$('#langSeg button, #introLang button').forEach(b => b.classList.toggle('on', b.dataset.l === prefs.lang));
  $('#wxStamp').textContent = t('updated') + ' ' + new Date(WX_TIME).toLocaleString(prefs.lang === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · Open-Meteo';
  renderAll();
}
function applyTheme() {
  const root = document.documentElement;
  if (prefs.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', prefs.theme);
  $$('#themeSeg button').forEach(b => b.classList.toggle('on', b.dataset.th === prefs.theme));
  if (window.__globeRetheme) window.__globeRetheme();
  if (window.__mapDraw) window.__mapDraw();
}
const isDark = () => { const th = document.documentElement.getAttribute('data-theme'); if (th) return th === 'dark'; return !window.matchMedia('(prefers-color-scheme: light)').matches; };
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);

/* ---------- router ---------- */
let currentView = 'globe';
function show(v) {
  currentView = v;
  $$('.view').forEach(s => s.classList.toggle('active', s.id === 'v-' + v));
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.v === v));
  if (v === 'map' && window.__mapResize) window.__mapResize();
  if (v === 'globe' && window.__globeResize) window.__globeResize();
  if (v === 'weather') renderWeather();
  if (v === 'community') { renderFeed(); $('#feedBadge').classList.add('hidden'); }
  if (v === 'profile') renderProfile();
  $('#v-' + v).scrollTop = 0;
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); });
function selectCity(i, goto) { selected = i; if (goto) show(goto); else renderAll(); if (window.__globeFocus) window.__globeFocus(i); if (window.__mapFocus) window.__mapFocus(i); }

/* ---------- search ---------- */
const q = $('#q'), drop = $('#drop');
let hl = 0;
function searchRender() {
  const v = q.value.trim().toLowerCase();
  if (!v) { drop.classList.add('hidden'); return; }
  const res = WX.map((c, i) => ({ c, i })).filter(({ c }) => c.n.toLowerCase().includes(v) || c.c.toLowerCase() === v).slice(0, 8);
  if (!res.length) { drop.classList.add('hidden'); return; }
  hl = Math.min(hl, res.length - 1);
  drop.innerHTML = res.map(({ c, i }, k) => `<button class="${k === hl ? 'hl' : ''}" data-i="${i}"><span>${wIcon(c.w)} ${esc(c.n)} <span class="c">${c.c}</span></span><b class="num">${T(c.t)}${deg()}</b></button>`).join('');
  drop.classList.remove('hidden');
}
q.addEventListener('input', () => { hl = 0; searchRender(); });
q.addEventListener('keydown', e => { const n = drop.children.length; if (e.key === 'ArrowDown') { hl = (hl + 1) % n; searchRender(); e.preventDefault(); } else if (e.key === 'ArrowUp') { hl = (hl - 1 + n) % n; searchRender(); e.preventDefault(); } else if (e.key === 'Enter') { const b = drop.children[hl]; if (b) { selectCity(+b.dataset.i, 'weather'); q.value = ''; drop.classList.add('hidden'); } } else if (e.key === 'Escape') drop.classList.add('hidden'); });
drop.addEventListener('mousedown', e => { const b = e.target.closest('button'); if (b) { selectCity(+b.dataset.i, 'weather'); q.value = ''; drop.classList.add('hidden'); } });
q.addEventListener('blur', () => setTimeout(() => drop.classList.add('hidden'), 150));

/* ---------- floating city card ---------- */
function cityCard(i, el) {
  const c = WX[i]; const n = allPosts().filter(p => p.city === c.n).length;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><h3>${esc(c.n)} <small style="color:var(--ink3);font-weight:500">${c.c}</small></h3><div style="color:var(--ink2);font-size:13px">${wLabel(c.w)}</div></div><button class="ib" data-close aria-label="Chiudi">✕</button></div>
  <div class="row"><span class="t num">${T(c.t)}${deg()}</span><span style="font-size:34px">${isNightIcon(c.w, c.day)}</span><div style="font-size:12px;color:var(--ink2)"><div>${t('feels')} <b class="num">${T(c.ta)}°</b></div><div>${t('min')} <b class="num">${T(c.days[0][3])}°</b> · ${t('max')} <b class="num">${T(c.days[0][2])}°</b></div><div>💬 <b>${n}</b> ${t('posts_here')}</div></div></div>
  <div class="acts"><button class="ib primary" data-go="weather">${t('open_weather')}</button><button class="ib" data-go="community">${t('post_here')}</button></div>`;
  el.classList.add('show');
  el.onclick = e => { const g = e.target.closest('[data-go]'); if (g) { selectCity(i, g.dataset.go); } if (e.target.closest('[data-close]')) el.classList.remove('show'); };
}

/* ---------- GLOBE ---------- */
(function initGlobe() {
  if (!window.THREE) { $('#globeStage').innerHTML = '<div class="empty">3D non disponibile</div>'; return; }
  const stage = $('#globeStage'), canvas = $('#globeCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.z = 3.7;
  const group = new THREE.Group(); scene.add(group);
  const R = 1;
  // texture
  const tex = document.createElement('canvas'); tex.width = 2048; tex.height = 1024; const tc = tex.getContext('2d');
  function drawTexture() {
    const dark = isDark(); const W = tex.width, H = tex.height;
    const g = tc.createLinearGradient(0, 0, 0, H);
    if (dark) { g.addColorStop(0, '#0E2A4A'); g.addColorStop(.5, '#0B3B66'); g.addColorStop(1, '#0E2A4A'); } else { g.addColorStop(0, '#9CC7EE'); g.addColorStop(.5, '#6FB1E6'); g.addColorStop(1, '#9CC7EE'); }
    tc.fillStyle = g; tc.fillRect(0, 0, W, H);
    tc.fillStyle = dark ? '#2B4F72' : '#DDE8D2'; tc.strokeStyle = dark ? '#5C8BB8' : '#8FAE85'; tc.lineWidth = 2;
    for (const poly of LAND) { tc.beginPath(); poly.forEach(([lon, lat], k) => { const x = (lon + 180) / 360 * W, y = (90 - lat) / 180 * H; k ? tc.lineTo(x, y) : tc.moveTo(x, y); }); tc.closePath(); tc.fill(); tc.stroke(); }
    tc.strokeStyle = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,40,80,.08)'; tc.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 30) { const x = (lon + 180) / 360 * W; tc.beginPath(); tc.moveTo(x, 0); tc.lineTo(x, H); tc.stroke(); }
    for (let lat = -60; lat <= 60; lat += 30) { const y = (90 - lat) / 180 * H; tc.beginPath(); tc.moveTo(0, y); tc.lineTo(W, y); tc.stroke(); }
    texture.needsUpdate = true;
  }
  const texture = new THREE.CanvasTexture(tex); texture.anisotropy = 4;
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshPhongMaterial({ map: texture, shininess: 12, specular: new THREE.Color(0x223344) }));
  group.add(earth);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(R * 1.13, 64, 48), new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}',
    fragmentShader: 'varying vec3 vN; uniform vec3 col; void main(){ float i = pow(0.62 - dot(vN, vec3(0,0,1.0)), 2.2); gl_FragColor = vec4(col, 1.0) * i; }',
    uniforms: { col: { value: new THREE.Color(0x38bdf8) } }, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  }));
  scene.add(glow);
  const amb = new THREE.AmbientLight(0xffffff, 0.55); scene.add(amb);
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.15); sun.position.set(5, 2, 4); scene.add(sun);
  // stars
  const sg = new THREE.BufferGeometry(); const sp = new Float32Array(1500 * 3); for (let i = 0; i < sp.length; i++) sp[i] = (Math.random() - .5) * 60; sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.7 })); scene.add(stars);
  // markers
  const toVec = (lat, lon, r) => { const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); };
  const markers = [];
  const mGeo = new THREE.SphereGeometry(0.016, 12, 12);
  WX.forEach((c, i) => {
    const m = new THREE.Mesh(mGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(tempColor(c.t)) }));
    m.position.copy(toVec(c.lat, c.lon, R * 1.005)); m.userData.i = i; group.add(m); markers.push(m);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.03, 24), new THREE.MeshBasicMaterial({ color: m.material.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ring.position.copy(m.position); ring.lookAt(new THREE.Vector3(0, 0, 0)); group.add(ring); m.userData.ring = ring;
  });
  // interaction
  let auto = true, drag = false, px = 0, py = 0, vx = 0, moved = 0, targetZ = 3.7;
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const tip = $('#globeTip');
  function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  window.__globeResize = resize; new ResizeObserver(resize).observe(stage); resize();
  function pick(e) { const r = canvas.getBoundingClientRect(); mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1; ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects([earth, ...markers]); if (!hits.length) return null; const first = hits[0]; if (first.object === earth) { const near = hits.filter(h => h.object !== earth && h.distance < first.distance + 0.05)[0]; return near ? near.object.userData.i : null; } return first.object.userData.i; }
  let hover = null;
  canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (drag) { const dx = e.clientX - px, dy = e.clientY - py; moved += Math.abs(dx) + Math.abs(dy); group.rotation.y += dx * 0.005; group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x + dy * 0.004)); vx = dx * 0.005; px = e.clientX; py = e.clientY; return; }
    const i = pick(e); if (i !== hover) { if (hover != null) markers[hover].scale.setScalar(1); hover = i; if (i != null) markers[i].scale.setScalar(1.8); canvas.style.cursor = i != null ? 'pointer' : 'grab'; }
    if (i != null) { const c = WX[i]; tip.innerHTML = `${isNightIcon(c.w, c.day)} <b>${esc(c.n)}</b> · <span class="num">${T(c.t)}°</span> · ${wLabel(c.w)}`; tip.style.display = 'block'; const r = stage.getBoundingClientRect(); tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 220) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; } else tip.style.display = 'none';
  });
  canvas.addEventListener('pointerup', e => { drag = false; if (moved < 6) { const i = pick(e); if (i != null) { selected = i; cityCard(i, $('#globeCard')); } else $('#globeCard').classList.remove('show'); } });
  canvas.addEventListener('pointerleave', () => { drag = false; tip.style.display = 'none'; });
  canvas.addEventListener('wheel', e => { e.preventDefault(); targetZ = Math.max(1.5, Math.min(4.5, targetZ + e.deltaY * 0.002)); }, { passive: false });
  // pinch
  let pinch = null; canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
  canvas.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); targetZ = Math.max(1.5, Math.min(4.5, targetZ * (pinch / d))); pinch = d; drag = false; } }, { passive: true });
  $('#gZoomIn').onclick = () => targetZ = Math.max(1.5, targetZ - 0.5);
  $('#gZoomOut').onclick = () => targetZ = Math.min(4.5, targetZ + 0.5);
  $('#gHome').onclick = () => { selectCity(prefs.home); cityCard(prefs.home, $('#globeCard')); };
  $('#rotBtn').onclick = () => { auto = !auto; $('#rotBtn').classList.toggle('on', auto); };
  let focusTarget = null;
  window.__globeFocus = i => { const c = WX[i]; focusTarget = { y: Math.PI / 2 - (c.lon + 180) * Math.PI / 180, x: c.lat * Math.PI / 180 * 0.9 }; auto = false; $('#rotBtn').classList.remove('on'); };
  window.__globeRetheme = () => { drawTexture(); stars.material.opacity = isDark() ? 0.7 : 0.15; glow.material.uniforms.col.value.set(isDark() ? 0x38bdf8 : 0x7dd3fc); };
  window.__globe = { scene, group, earth, sun, markers, R, THREE };
  drawTexture();
  // initial orientation to home city
  window.__globeFocus(prefs.home); auto = true; $('#rotBtn').classList.add('on');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (focusTarget) { const ty = focusTarget.y, tx = focusTarget.x; let dy = ((ty - group.rotation.y) % (Math.PI * 2)); if (dy > Math.PI) dy -= Math.PI * 2; if (dy < -Math.PI) dy += Math.PI * 2; group.rotation.y += dy * 0.08; group.rotation.x += (tx - group.rotation.x) * 0.08; if (Math.abs(dy) < 0.002 && Math.abs(tx - group.rotation.x) < 0.002) focusTarget = null; }
    else if (!drag) { if (auto && !reduce) group.rotation.y += 0.08 * dt; if (Math.abs(vx) > 0.0005) { group.rotation.y += vx; vx *= 0.94; } }
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    stars.rotation.y += 0.004 * dt;
    markers.forEach(m => { if (!m.userData.storm) m.userData.ring.scale.setScalar(1 + 0.15 * Math.sin(now / 600 + m.userData.i)); });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- MAP (2D, Web Mercator) ---------- */
(function initMap() {
  const stage = $('#mapStage'), canvas = $('#mapCanvas'), ctx = canvas.getContext('2d'), tip = $('#mapTip');
  let zoom = 1.6, cx = 0.5, cy = 0.42, layer = 'temp', W = 0, H = 0, dpr = 1;
  const merc = (lat, lon) => { const la = Math.max(-85, Math.min(85, lat)) * Math.PI / 180; return [(lon + 180) / 360, (1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2]; };
  const S = () => Math.max(W, H) * zoom;
  const toScreen = (lat, lon) => { const [u, v] = merc(lat, lon); return [(u - cx) * S() + W / 2, (v - cy) * S() + H / 2]; };
  function resize() { W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return; dpr = Math.min(devicePixelRatio, 2); canvas.width = W * dpr; canvas.height = H * dpr; draw(); }
  window.__mapResize = resize; new ResizeObserver(resize).observe(stage);
  function draw() {
    if (!W) return; const dark = isDark(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const satOn = !!(window.__mapSat && window.__mapSat(ctx, W, H, S(), cx, cy)); if (!satOn) { ctx.fillStyle = dark ? '#0B2540' : '#BFDDF5'; ctx.fillRect(0, 0, W, H); }
    // land
    ctx.fillStyle = dark ? '#1E3A5C' : '#E8EEDF'; ctx.strokeStyle = dark ? '#4F7DAA' : '#8FAE85'; ctx.lineWidth = 1;
    const s = S(); const offX = -cx * s + W / 2, offY = -cy * s + H / 2;
    for (let wrap = -1; wrap <= 1; wrap++) {
      const ox = offX + wrap * s; if (ox > W || ox + s < 0) continue;
      ctx.beginPath();
      for (const poly of LAND) { poly.forEach(([lon, lat], k) => { const [u, v] = merc(lat, lon); const x = u * s + ox, y = v * s + offY; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
      if (!satOn) ctx.fill(); ctx.stroke();
    }
    // graticule
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,40,80,.09)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let lon = -180; lon <= 180; lon += 30) { const [x] = toScreen(0, lon); ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let lat = -60; lat <= 75; lat += 15) { const [, y] = toScreen(lat, 0); ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    // markers
    ctx.font = '600 12px Manrope, sans-serif'; ctx.textAlign = 'center';
    const posts = allPosts(); const placed = []; const free = (x, y) => { if (placed.some(([a, b]) => Math.abs(a - x) < 34 && Math.abs(b - y) < 16)) return false; placed.push([x, y]); return true; };
    WX.forEach((c, i) => {
      const [x, y] = toScreen(c.lat, c.lon); if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return;
      if (layer === 'rain') { const p = Math.max(c.days[0][4], ...c.hours.slice(0, 6).map(h => h[2])); const r = 6 + p / 8; ctx.fillStyle = `rgba(108,140,255,${0.15 + p / 140})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); if (free(x, y - r - 4)) { ctx.fillStyle = dark ? '#EAF1FB' : '#0F1B2E'; ctx.fillText(p + '%', x, y - r - 4); } }
      else if (layer === 'posts') { const n = posts.filter(p => p.city === c.n).length; if (!n) { ctx.fillStyle = dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); return; } ctx.fillStyle = '#F5B841'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y - 12, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#06121F'; ctx.font = '700 11px Manrope'; ctx.fillText(n, x, y - 8); ctx.font = '600 12px Manrope, sans-serif'; }
      else { ctx.fillStyle = tempColor(c.t); ctx.strokeStyle = dark ? '#0B1526' : '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke(); if ((zoom > 1.2 && free(x, y - 11)) || i === selected) { ctx.fillStyle = dark ? '#EAF1FB' : '#0F1B2E'; ctx.fillText(T(c.t) + '°', x, y - 11); } }
      if (i === selected) { ctx.strokeStyle = dark ? '#fff' : '#0F1B2E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.stroke(); ctx.fillStyle = dark ? '#EAF1FB' : '#0F1B2E'; ctx.font = '700 13px Sora, sans-serif'; ctx.fillText(c.n, x, y + 26); ctx.font = '600 12px Manrope, sans-serif'; }
    });
    if (window.__mapOverlay) window.__mapOverlay(ctx, toScreen, W, H);
  }
  window.__mapDraw = draw;
  function hit(e) { const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; let best = null, bd = 18; WX.forEach((c, i) => { const [x, y] = toScreen(c.lat, c.lon); const d = Math.hypot(x - mx, y - my); if (d < bd) { bd = d; best = i; } }); return best; }
  let drag = false, px = 0, py = 0, moved = 0;
  canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (drag) { const dx = e.clientX - px, dy = e.clientY - py; moved += Math.abs(dx) + Math.abs(dy); cx -= dx / S(); cy = Math.max(0.05, Math.min(0.95, cy - dy / S())); cx = ((cx % 1) + 1) % 1; px = e.clientX; py = e.clientY; draw(); return; }
    const i = hit(e); canvas.style.cursor = i != null ? 'pointer' : 'grab';
    if (i != null) { const c = WX[i]; tip.innerHTML = `${isNightIcon(c.w, c.day)} <b>${esc(c.n)}</b> · <span class="num">${T(c.t)}°</span> · ${wLabel(c.w)}`; tip.style.display = 'block'; const r = stage.getBoundingClientRect(); tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 220) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; } else tip.style.display = 'none';
  });
  canvas.addEventListener('pointerup', e => { drag = false; if (moved < 6) { const i = hit(e); if (i != null) { selected = i; cityCard(i, $('#mapCard')); draw(); } else $('#mapCard').classList.remove('show'); } });
  canvas.addEventListener('pointerleave', () => { drag = false; tip.style.display = 'none'; });
  function zoomAt(f, mx, my) { const s0 = S(); const u = cx + (mx - W / 2) / s0, v = cy + (my - H / 2) / s0; zoom = Math.max(0.8, Math.min(12, zoom * f)); const s1 = S(); cx = u - (mx - W / 2) / s1; cy = v - (my - H / 2) / s1; cx = ((cx % 1) + 1) % 1; draw(); }
  canvas.addEventListener('wheel', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  let pinch = null; canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
  canvas.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); zoomAt(d / pinch, W / 2, H / 2); pinch = d; drag = false; } }, { passive: true });
  $('#mZoomIn').onclick = () => zoomAt(1.4, W / 2, H / 2); $('#mZoomOut').onclick = () => zoomAt(1 / 1.4, W / 2, H / 2);
  $('#mLocate').onclick = () => { if (!navigator.geolocation) return toast(t('locate_err')); navigator.geolocation.getCurrentPosition(p => { const i = nearest(p.coords.latitude, p.coords.longitude); selectCity(i); cityCard(i, $('#mapCard')); toast(t('my_pos') + ': ' + WX[i].n); }, () => toast(t('locate_err')), { timeout: 8000 }); };
  $$('#v-map [data-layer]').forEach(b => b.onclick = () => { layer = b.dataset.layer; $$('#v-map [data-layer]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  window.__mapFocus = i => { const c = WX[i]; const [u, v] = merc(c.lat, c.lon); cx = u; cy = v; if (zoom < 2.5) zoom = 2.5; draw(); };
  window.__map = { state: () => ({ zoom, cx, cy, W, H, layer }), toScreen, merc, S };
  window.__mapFocus(prefs.home); zoom = 1.6;
})();

/* ---------- WEATHER VIEW ---------- */
function renderWeather() {
  const c = WX[selected]; const wrap = $('#weatherWrap');
  const al = alertsFor(c);
  const heroClass = c.w >= 95 ? 'storm' : (c.w >= 51 && c.w <= 82) ? 'rain' : c.day ? 'day' : '';
  const isHome = selected === prefs.home;
  const nowIdx = 0;
  const posts = allPosts().filter(p => p.city === c.n).slice(0, 3);
  const sorted = k => WX.map((x, i) => ({ x, i })).sort(k);
  const rank = [
    ['hottest', sorted((a, b) => b.x.t - a.x.t)[0], x => T(x.t) + '°'],
    ['coldest', sorted((a, b) => a.x.t - b.x.t)[0], x => T(x.t) + '°'],
    ['rainiest', sorted((a, b) => b.x.days[0][4] - a.x.days[0][4])[0], x => x.days[0][4] + '% ' + t('rain_prob')],
    ['windiest', sorted((a, b) => b.x.ws - a.x.ws)[0], x => x.ws + ' ' + t('km_h')],
  ];
  wrap.innerHTML = `
  <div class="hero ${heroClass}">
    <span class="stamp">${t('updated')} ${new Date(WX_TIME).toLocaleString(prefs.lang === 'en' ? 'en-GB' : 'it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
    <div class="place">${isHome ? '⌂ ' + t('from_home') : c.c} · ${c.tz.replace('_', ' ')}</div>
    <h2>${esc(c.n)}</h2>
    <div class="big"><span class="temp num">${T(c.t)}${deg()}</span><span class="sym">${isNightIcon(c.w, c.day)}</span></div>
    <div class="desc">${wLabel(c.w)}</div>
    <div class="mm"><span>${t('feels')} <b class="num">${T(c.ta)}°</b></span><span>${t('min')} <b class="num">${T(c.days[0][3])}°</b></span><span>${t('max')} <b class="num">${T(c.days[0][2])}°</b></span><span>${t('wind')} <b class="num">${c.ws} ${t('km_h')}</b></span></div>
    <div class="acts"><button class="ib primary" id="wxAI">✦ ${t('ai_summary')}</button><button class="ib" data-go="community">💬 ${t('post_here')}</button>${isHome ? '' : `<button class="ib" id="setHome">⌂ ${t('set_home')}</button>`}<button class="ib" data-go="map">🗺️ ${t('n_map')}</button></div>
  </div>
  <div class="grid">
    <div class="panel" style="grid-column:1/-1">
      <h3>${t('alerts')} <small>${t('source')}</small></h3>
      ${al.length ? al.map(a => `<div class="alert ${a[3]}"><span class="s">${a[0]}</span><div><b>${t(a[1])}</b>${t(a[2])}</div></div>`).join('') : `<div class="alert ok"><span class="s">✅</span><div>${t('no_alerts')}</div></div>`}
      <div class="ai-box hidden" id="aiBox"></div>
    </div>
    <div class="panel" style="grid-column:1/-1">
      <h3>${t('next_hours')} <small>${c.tz}</small></h3>
      <div class="hours">${c.hours.map((h, k) => `<div class="h ${k === nowIdx ? 'now' : ''}"><div class="k">${k === 0 ? t('now') : h[0]}</div><div class="s">${wIcon(h[3])}</div><div class="t num">${T(h[1])}°</div><div class="p num">${h[2]}%</div></div>`).join('')}</div>
    </div>
    <div class="panel">
      <h3>${t('next_days')}</h3>
      <div class="days">${c.days.map((d, k) => { const lo = Math.min(...c.days.map(x => x[3])), hi = Math.max(...c.days.map(x => x[2])), span = Math.max(1, hi - lo); return `<div class="d"><span class="name">${dayName(d[0], k)}</span><span style="font-size:20px">${wIcon(d[1])}</span><span class="bar"><i style="left:${(d[3] - lo) / span * 100}%;right:${100 - (d[2] - lo) / span * 100}%"></i></span><span class="num" style="color:var(--ink3);text-align:right">${T(d[3])}°</span><span class="num" style="text-align:right;font-weight:700">${T(d[2])}°</span></div>`; }).join('')}</div>
    </div>
    <div class="panel">
      <h3>${t('details')}</h3>
      <div class="kv">
        <div><div class="l">${t('humidity')}</div><div class="v num">${c.h}%</div></div>
        <div><div class="l">${t('wind')}</div><div class="v num">${c.ws} ${t('km_h')} <span style="display:inline-block;transform:rotate(${c.wd + 180}deg);font-size:14px">↑</span></div></div>
        <div><div class="l">${t('uv')}</div><div class="v num">${c.uv} <small style="font-size:12px;color:var(--ink3)">${c.uv >= 8 ? '🔴' : c.uv >= 6 ? '🟠' : c.uv >= 3 ? '🟡' : '🟢'}</small></div></div>
        <div><div class="l">${t('sun')}</div><div class="v num">${c.sr} / ${c.ss}</div></div>
      </div>
      <h3 style="margin-top:16px">${t('world_now')}</h3>
      <div class="rank">${rank.map(([k, r, f]) => `<button data-i="${r.i}"><span><span class="c">${t(k)}</span><br><span class="t">${wIcon(r.x.w)} ${esc(r.x.n)}</span></span><b class="num">${f(r.x)}</b></button>`).join('')}</div>
    </div>
    <div class="panel" style="grid-column:1/-1">
      <h3>${t('community_title')} · ${esc(c.n)} <small><button class="ib" data-go="community" style="height:28px">${t('open_community')} →</button></small></h3>
      <div id="wxPosts">${posts.length ? posts.map(postHTML).join('') : `<div class="empty">${t('empty_feed')}</div>`}</div>
    </div>
  </div>`;
  wrap.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { selectCity(selected, b.dataset.go); });
  const sh = wrap.querySelector('#setHome'); if (sh) sh.onclick = () => { prefs.home = selected; savePrefs(); toast('⌂ ' + c.n); renderWeather(); };
  wrap.querySelectorAll('.rank button').forEach(b => b.onclick = () => selectCity(+b.dataset.i, 'weather'));
  wrap.querySelector('#wxAI').onclick = () => aiSummary(c);
  bindPostActions(wrap);
}
async function aiSummary(c) {
  const box = $('#aiBox'); box.classList.remove('hidden'); box.textContent = t('ai_thinking');
  const s = await getSample(); if (!s) { box.textContent = t('ai_off'); return; }
  const prompt = `Sei l'assistente di MeteoSocial. Rispondi in ${prefs.lang === 'en' ? 'inglese' : 'italiano'}, in massimo 5 frasi semplici, senza elenchi, tono amichevole. Spiega il meteo di oggi e domani a ${c.n} e dai un consiglio pratico (vestiti, ombrello, orari). Dati reali Open-Meteo (${WX_TIME}): ora ${c.t}°C (percepiti ${c.ta}°), ${wLabel(c.w)}, umidità ${c.h}%, vento ${c.ws} km/h, UV max ${c.uv}. Prossime ore: ${c.hours.map(h => `${h[0]} ${h[1]}° ${h[2]}% pioggia ${wLabel(h[3])}`).join('; ')}. Giorni: ${c.days.map(d => `${d[0]} ${wLabel(d[1])} ${d[3]}-${d[2]}° pioggia ${d[4]}%`).join('; ')}.`;
  try { const r = await s(prompt, { modelTier: 'quick', onText: ({ text }) => { box.textContent = text; } }); box.textContent = r.text; } catch (e) { box.textContent = e && e.code === 'not_granted' ? t('ai_consent') : t('ai_error'); }
}

/* ---------- COMMUNITY ---------- */
let feedFilter = 'all', postTag = 'obs';
function postHTML(p) {
  const c = WX[cityByName(p.city)]; const liked = !!myLikes[p.id]; const likes = (p.likes || 0) + (liked && !p.mine ? 1 : 0);
  const verified = c && ((p.tag === 'rain' && (c.w >= 51 && c.w <= 82)) || (p.tag === 'storm' && c.w >= 95) || (p.tag === 'heat' && c.ta >= 30) || (p.tag === 'snow' && c.w >= 71 && c.w <= 86));
  return `<article class="post" data-id="${esc(p.id)}">
    <div class="who"><div class="av" style="background:${avColor(p.u)}">${esc(initials(p.u))}</div><div><b>${esc(p.u)}</b>${p.seed ? ` <span class="tag" style="padding:2px 7px">${t('example')}</span>` : ''}${p.local ? ` <span class="tag" style="padding:2px 7px">📱</span>` : ''}<div class="meta">${TAGS[p.tag] || '👀'} <b>${t('t_' + (p.tag || 'obs'))}</b> · 📍 ${esc(p.city)} · ${ago(p.ts)}</div></div></div>
    <div class="body">${esc(ptext(p))}</div>
    ${c ? `<span class="wx">${isNightIcon(c.w, c.day)} ${T(c.t)}° · ${wLabel(c.w)} · ${verified ? '✅ ' + t('verify') : '· ' + t('unverified')}</span>` : ''}
    <div class="acts"><button class="ib ${liked ? 'liked' : ''}" data-like>♥ ${t('like')} <span class="num">${likes}</span></button><button class="ib" data-com>💬 ${t('comment')} <span class="num">${(p.com || []).length}</span></button><button class="ib" data-city="${esc(p.city)}">📍 ${t('open_weather')}</button>${(p.local || (canWrite && !p.seed)) ? `<button class="ib" data-del>🗑 ${t('delete')}</button>` : ''}</div>
    <div class="comments hidden">${(p.com || []).map(k => `<div class="c"><b>${esc(k.u)}</b> · <span style="color:var(--ink3);font-size:12px">${ago(k.ts)}</span><br>${esc(k.t)}</div>`).join('')}<form><input maxlength="240" placeholder="${t('reply_ph')}" aria-label="${t('comment')}"><button class="ib primary" type="submit">↩</button></form></div>
  </article>`;
}
function renderFeed() {
  const c = WX[prefs.home];
  let posts = allPosts();
  if (feedFilter === 'near') posts = posts.filter(p => { const x = WX[cityByName(p.city)]; return x && dist(x, c) < 600; });
  if (feedFilter === 'alert') posts = posts.filter(p => ['storm', 'alert', 'snow'].includes(p.tag));
  if (feedFilter === 'photo') posts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  $('#feed').innerHTML = posts.length ? posts.map(postHTML).join('') : `<div class="empty">${t('empty_feed')}</div>`;
  $('#postNote').textContent = canWrite === false ? t('readonly_note') : canWrite ? t('writer_note') : '';
  bindPostActions($('#feed'));
  const sel = $('#postCity'); if (sel.value === '' || !sel.options.length) fillCitySelect(sel, selected);
}
function fillCitySelect(sel, val) { sel.innerHTML = WX.map((c, i) => `<option value="${i}">${esc(c.n)} (${c.c})</option>`).join(''); sel.value = val; }
function bindPostActions(root) {
  root.querySelectorAll('.post').forEach(art => {
    const id = art.dataset.id; const find = () => allPosts().find(p => p.id === id);
    art.querySelector('[data-like]').onclick = () => { myLikes[id] = !myLikes[id]; LS.set('likes', myLikes); const lp = localPosts.find(p => p.id === id); if (lp) { lp.likes = (lp.likes || 0) + (myLikes[id] ? 1 : -1); LS.set('localPosts', localPosts); } renderAll(); };
    art.querySelector('[data-com]').onclick = () => art.querySelector('.comments').classList.toggle('hidden');
    art.querySelector('[data-city]').onclick = e => { const i = cityByName(e.currentTarget.dataset.city); if (i >= 0) selectCity(i, 'weather'); };
    const del = art.querySelector('[data-del]'); if (del) del.onclick = async () => { localPosts = localPosts.filter(p => p.id !== id); LS.set('localPosts', localPosts); if (stateDoc.posts.some(p => p.id === id)) { stateDoc.posts = stateDoc.posts.filter(p => p.id !== id); await publishState(); } toast(t('deleted')); renderAll(); };
    art.querySelector('.comments form').onsubmit = async e => { e.preventDefault(); const inp = e.target.querySelector('input'); const txt = inp.value.trim(); if (!txt) return; const cm = { u: prefs.nick || t('you'), t: txt, ts: Date.now() }; const p = find(); if (!p) return; if (p.seed) { const cp = { ...p, seed: false, mine: true, local: true, com: [cm] }; localPosts.unshift(cp); LS.set('localPosts', localPosts); } else { p.com = [...(p.com || []), cm]; const lp = localPosts.find(x => x.id === id); if (lp) { lp.com = p.com; LS.set('localPosts', localPosts); } if (stateDoc.posts.some(x => x.id === id)) { const sp = stateDoc.posts.find(x => x.id === id); sp.com = p.com; await publishState(); } } inp.value = ''; renderAll(); art.querySelector('.comments').classList.remove('hidden'); };
  });
}
$('#feedFilters').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; feedFilter = b.dataset.f; $$('#feedFilters .chip').forEach(x => x.classList.toggle('on', x === b)); renderFeed(); };
async function getArtifact() { if (artifactNs !== null) return artifactNs; try { artifactNs = window.claude && window.claude.use ? (await window.claude.use('artifact')) || false : false; } catch { artifactNs = false; } return artifactNs; }
async function getSample() { if (sampleNs !== null) return sampleNs; try { sampleNs = window.claude && window.claude.use ? (await window.claude.use('sample')) || false : false; } catch { sampleNs = false; } return sampleNs; }
function buildHTML() {
  const json = JSON.stringify({ posts: stateDoc.posts.slice(0, 300) }).replace(/<\//g, '<\\/');
  return TEMPLATE.replace(/<script type="application\/json" id="state">[\s\S]*?<\/script>/, `<script type="application/json" id="state">${json}<\/script>`);
}
async function publishState(newPost) {
  const a = await getArtifact(); if (!a || !a.publish) { canWrite = false; return false; }
  const prev = stateDoc.posts.slice();
  if (newPost) stateDoc.posts = [newPost, ...stateDoc.posts].slice(0, 300);
  try { sessionStorage.setItem('ms_view', currentView); } catch {}
  try { await a.publish(buildHTML()); canWrite = true; return true; }
  catch (e) { stateDoc.posts = prev; if (e && (e.code === 'not_writer' || e.code === 'not_granted' || e.code === 'not_declared')) canWrite = false; else if (e && e.code === 'conflict') return true; return false; }
}

/* ---------- AI CHAT ---------- */
const chatHist = [];
function chatAdd(role, text) { const d = document.createElement('div'); d.className = 'msg ' + (role === 'user' ? 'me' : 'ai'); d.textContent = text; $('#chatLog').appendChild(d); $('#chatLog').scrollTop = 1e9; return d; }
function renderChips() { $('#chatChips').innerHTML = ['c1', 'c2', 'c3', 'c4'].map(k => `<button class="chip">${t(k)}</button>`).join(''); $$('#chatChips .chip').forEach(b => b.onclick = () => { $('#chatIn').value = b.textContent; $('#chatForm').requestSubmit(); }); }
function aiContext() {
  const h = WX[prefs.home], s = WX[selected];
  const brief = c => `${c.n}: ora ${c.t}°C (perc. ${c.ta}) ${wLabel(c.w)}, vento ${c.ws} km/h, oggi ${c.days[0][3]}-${c.days[0][2]}° pioggia ${c.days[0][4]}%, domani ${wLabel(c.days[1][1])} ${c.days[1][3]}-${c.days[1][2]}° pioggia ${c.days[1][4]}%`;
  const world = WX.map(c => `${c.n} ${c.t}° ${wLabel(c.w)} p${c.days[0][4]}%`).join('; ');
  const posts = allPosts().slice(0, 12).map(p => `[${p.u} @${p.city} ${t('t_' + p.tag)}] ${ptext(p)}`).join('\n');
  return `Sei l'assistente di MeteoSocial, un'app meteo + social. Rispondi in ${prefs.lang === 'en' ? 'inglese' : 'italiano'}, breve (max 6 frasi), chiaro, senza elenchi puntati, amichevole. Unità: °${prefs.unit}. Dati reali Open-Meteo aggiornati ${WX_TIME}.\nCittà dell'utente: ${brief(h)}.\nCittà selezionata: ${brief(s)}.\nPanoramica mondo (temp attuale, cielo, prob. pioggia oggi): ${world}.\nUltime segnalazioni della community:\n${posts}\nSe la domanda riguarda una città non presente nei dati, dillo con onestà. Per la sicurezza rimanda alle fonti ufficiali.`;
}
$('#chatForm').onsubmit = async e => {
  e.preventDefault(); const inp = $('#chatIn'); const txt = inp.value.trim(); if (!txt) return; inp.value = '';
  chatAdd('user', txt); chatHist.push({ role: 'user', content: txt });
  const s = await getSample(); if (!s) { chatAdd('ai', t('ai_off')); return; }
  const bubble = chatAdd('ai', t('ai_thinking'));
  const turns = [{ role: 'user', content: aiContext() + '\n\nDomanda: ' + chatHist[0].content }, ...chatHist.slice(1)];
  if (turns.length > 1 && turns[turns.length - 1].role !== 'user') turns.push({ role: 'user', content: txt });
  try { const r = await s(turns, { cache: false, onText: ({ text }) => { bubble.textContent = text; $('#chatLog').scrollTop = 1e9; } }); bubble.textContent = r.text; chatHist.push({ role: 'assistant', content: r.text }); }
  catch (err) { bubble.textContent = err && err.code === 'not_granted' ? t('ai_consent') : (err && err.text) || t('ai_error'); chatHist.pop(); }
  if (chatHist.length > 12) chatHist.splice(0, chatHist.length - 12);
  while (chatHist.length && chatHist[0].role !== 'user') chatHist.shift();
};

/* ---------- PROFILE / SHARE ---------- */
function renderProfile() {
  $('#nick').value = prefs.nick; $('#profName').textContent = prefs.nick || t('you'); $('#profAv').textContent = initials(prefs.nick || '?'); $('#profAv').style.background = avColor(prefs.nick || '?');
  const mine = allPosts().filter(p => p.u === prefs.nick && !p.seed).length; $('#profStats').textContent = `📍 ${WX[prefs.home].n} · 💬 ${mine}`;
  fillCitySelect($('#homeCity'), prefs.home); $$('#unitSeg button').forEach(b => b.classList.toggle('on', b.dataset.u === prefs.unit)); $('#shareUrl').value = location.href.split('#')[0];
}
$('#nick').oninput = e => { prefs.nick = e.target.value.trim(); savePrefs(); $('#profName').textContent = prefs.nick || t('you'); $('#profAv').textContent = initials(prefs.nick || '?'); $('#profAv').style.background = avColor(prefs.nick || '?'); };
$('#homeCity').onchange = e => { prefs.home = +e.target.value; savePrefs(); selectCity(prefs.home); };
$('#unitSeg').onclick = e => { const b = e.target.closest('[data-u]'); if (!b) return; prefs.unit = b.dataset.u; savePrefs(); renderProfile(); renderAll(); };
$('#langSeg').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; prefs.lang = b.dataset.l; savePrefs(); applyLang(); };
$('#introLang').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; prefs.lang = b.dataset.l; savePrefs(); applyLang(); };
$('#langBtn').onclick = () => { prefs.lang = prefs.lang === 'it' ? 'en' : 'it'; savePrefs(); applyLang(); };
$('#themeSeg').onclick = e => { const b = e.target.closest('[data-th]'); if (!b) return; prefs.theme = b.dataset.th; savePrefs(); applyTheme(); };
$('#themeBtn').onclick = () => { prefs.theme = isDark() ? 'light' : 'dark'; savePrefs(); applyTheme(); };
async function share() {
  const url = location.href.split('#')[0]; const text = prefs.lang === 'en' ? 'Check the world\'s weather with me on MeteoSocial 🌍' : 'Guarda il meteo del mondo con me su MeteoSocial 🌍';
  if (navigator.share) { try { await navigator.share({ title: 'MeteoSocial', text, url }); return; } catch {} }
  try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch { $('#shareUrl').value = url; show('profile'); }
}
$('#shareBtn').onclick = share; $('#copyBtn').onclick = async () => { try { await navigator.clipboard.writeText($('#shareUrl').value); toast(t('copied')); } catch { $('#shareUrl').select(); } };

/* ---------- presence ---------- */
(async () => { try { const room = window.claude && window.claude.use ? await window.claude.use('room') : null; if (!room) return; roomNs = room; room.presence({ city: WX[prefs.home].n }); room.onPeers(ch => { const peers = (ch && ch.peers) || room.peers() || []; const n = Math.max(1, peers.length || 1); $('#onlineN').textContent = n; $('#online').title = n + ' ' + t('people_online'); }); } catch {} })();

/* ---------- intro ---------- */
fillCitySelect($('#introCity'), prefs.home);
$('#introNick').value = prefs.nick;
$('#introGo').onclick = () => { prefs.nick = $('#introNick').value.trim() || prefs.nick; prefs.home = +$('#introCity').value; prefs.intro = true; savePrefs(); $('#intro').classList.add('hidden'); selected = prefs.home; selectCity(prefs.home); };
if (prefs.intro) $('#intro').classList.add('hidden');

/* ---------- boot ---------- */
function renderAll() { if (currentView === 'weather') renderWeather(); if (currentView === 'community') renderFeed(); if (currentView === 'profile') renderProfile(); if (window.__mapDraw) window.__mapDraw(); renderChips(); }
applyTheme(); applyLang(); fillCitySelect($('#postCity'), selected);
chatAdd('ai', t('ai_hello'));
try { const v = sessionStorage.getItem('ms_view'); if (v) { sessionStorage.removeItem('ms_view'); show(v); } } catch {}
getArtifact().then(a => { if (a && a.publish) { /* writer status unknown until first publish; leave note empty */ } else canWrite = false; if (currentView === 'community') renderFeed(); });
