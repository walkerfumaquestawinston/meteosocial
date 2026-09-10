/* ===== MeteoSocial v4: realistic Earth (NASA textures), satellite map, estimated rain radar, hail, social profile (avatar, bio, Instagram, follow, hashtags), AI assistant everywhere ===== */
Object.assign(I18N.it, {
  t_hail: 'Grandine', a_hail: 'Grandine possibile', a_hail_d: 'Temporali con grandine previsti: metti al riparo auto e piante.', layer_sat: 'Satellite', layer_radar: 'Radar pioggia', radar_note: 'Stima dalle previsioni orarie (non è un radar reale)', play: 'Play', pause: 'Pausa', now_h: 'Adesso', in_h: 'tra',
  gmaps: 'Apri in Google Maps', earth_hint: 'Trascina il pianeta · rotella per zoom · tocca una città', avatar: 'Foto profilo', bio: 'Bio', ig: 'Instagram (senza @)', follow: 'Segui', following: 'Seguito', f_follow: 'Seguiti', trending: 'Tendenze', ig_share: 'Instagram', ig_copied: 'Testo copiato: incollalo su Instagram con la card!',
  ai_fab: 'Chiedi all\'assistente', ai_ctx_globe: 'Sono sul globo 3D', ai_ctx_map: 'Sono sulla mappa', ai_ctx_weather: 'Sto guardando le previsioni', ai_ctx_community: 'Sono nella community', ai_ctx_profile: 'Sono nel profilo', ai_ph2: 'Chiedimi qualsiasi cosa…', new_posts: 'nuove segnalazioni', sat_credit: 'Immagini NASA Blue Marble',
});
Object.assign(I18N.en, {
  t_hail: 'Hail', a_hail: 'Hail possible', a_hail_d: 'Thunderstorms with hail expected: shelter cars and plants.', layer_sat: 'Satellite', layer_radar: 'Rain radar', radar_note: 'Estimated from hourly forecasts (not a real radar)', play: 'Play', pause: 'Pause', now_h: 'Now', in_h: 'in',
  gmaps: 'Open in Google Maps', earth_hint: 'Drag the planet · scroll to zoom · tap a city', avatar: 'Profile photo', bio: 'Bio', ig: 'Instagram (without @)', follow: 'Follow', following: 'Following', f_follow: 'Following', trending: 'Trending', ig_share: 'Instagram', ig_copied: 'Caption copied: paste it on Instagram with the card!',
  ai_fab: 'Ask the assistant', ai_ctx_globe: 'I am on the 3D globe', ai_ctx_map: 'I am on the map', ai_ctx_weather: 'I am looking at the forecast', ai_ctx_community: 'I am in the community', ai_ctx_profile: 'I am in my profile', ai_ph2: 'Ask me anything…', new_posts: 'new reports', sat_credit: 'NASA Blue Marble imagery',
});
TAGS.hail = '🧊';

/* ---------- styles v4 ---------- */
(function () {
  const css = `
  .radarbar{position:absolute;left:16px;right:16px;bottom:72px;display:flex;gap:8px;align-items:center;background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--line);border-radius:14px;padding:8px 12px;backdrop-filter:blur(10px);z-index:4}
  .radarbar input[type=range]{flex:1;accent-color:var(--accent)}
  .radarbar .tl{font-family:Sora;font-weight:700;min-width:64px;font-size:13px}
  .radarbar .lg{display:flex;gap:4px;align-items:center;font-size:11px;color:var(--ink2)}
  .radarbar .lg i{width:14px;height:8px;border-radius:3px;display:inline-block}
  .radarbar small{font-size:10px;color:var(--ink3)}
  @media (max-width:640px){.radarbar{bottom:66px;flex-wrap:wrap}.radarbar .lg{display:none}}
  .hash{color:var(--accent);font-weight:700}
  .reel .hash{color:#7DD3FC}
  .trend{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
  .avimg{width:100%;height:100%;object-fit:cover;border-radius:50%}
  .av{overflow:hidden}
  .igl{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:inherit;opacity:.9;text-decoration:none;margin-left:6px}
  .igl:hover{text-decoration:underline}
  .followb{margin-left:8px;font-size:11px;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.22);color:#fff;font-weight:700;border:1px solid rgba(255,255,255,.5)}
  .post .followb{background:var(--surface2);color:var(--accent);border-color:var(--line)}
  .followb.on{background:var(--accent);color:var(--accent-ink);border-color:transparent}
  .aifab{position:fixed;left:18px;bottom:78px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#38BDF8,#6C8CFF);color:#06121F;font-size:24px;display:grid;place-items:center;box-shadow:0 8px 24px rgba(108,140,255,.45);z-index:30;font-weight:700}
  @media (min-width:900px){.aifab{left:auto;right:72px;bottom:18px}}
  .aifab.hidden{display:none}
  #aiSheet .box{max-width:520px}
  #aiSheet .log{max-height:40vh;overflow:auto;display:flex;flex-direction:column;gap:8px;margin:10px 0}
  #aiSheet form{display:flex;gap:6px}#aiSheet input{flex:1;padding:10px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);color:var(--ink)}
  .sat-credit{position:absolute;left:16px;bottom:16px;font-size:10px;color:#fff;text-shadow:0 1px 3px #000;opacity:.8;pointer-events:none;z-index:3}
  .profile-head{display:flex;align-items:center;gap:14px}
  .profile-head .av{width:72px;height:72px;font-size:26px;cursor:pointer;position:relative}
  .profile-head .av::after{content:"📷";position:absolute;right:-2px;bottom:-2px;font-size:14px;background:var(--surface);border-radius:50%;padding:2px}
  .stats{display:flex;gap:14px;margin-top:4px;font-size:12px;color:var(--ink3)}.stats b{color:var(--ink);font-family:Sora}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

/* ---------- realistic Earth ---------- */
(function realEarth() {
  const G = window.__globe; if (!G || typeof TEX === 'undefined') return; const { group, earth, R, THREE } = G;
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  Promise.all([load(TEX.day), load(TEX.night), load(TEX.spec), load(TEX.clouds)]).then(([day, night, spec, clouds]) => {
    if (!day) return;
    const mk = im => { const t = new THREE.Texture(im); t.needsUpdate = true; t.anisotropy = 8; return t; };
    // sun direction in group-local space (app2 placed the sun light inside the group)
    let sunDir = new THREE.Vector3(1, 0.3, 0.5); group.traverse(o => { if (o.isDirectionalLight) sunDir = o.position.clone(); }); sunDir.normalize();
    const vs = 'varying vec2 vUv; varying vec3 vN; varying vec3 vVN; void main(){ vUv = uv; vN = normalize(normal); vVN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
    const fs = `uniform sampler2D dayTex; uniform sampler2D nightTex; uniform sampler2D specTex; uniform vec3 sunDir; uniform float dark; varying vec2 vUv; varying vec3 vN; varying vec3 vVN;
      void main(){ float d = dot(normalize(vN), normalize(sunDir)); float k = smoothstep(-0.12, 0.28, d);
        vec3 day = texture2D(dayTex, vUv).rgb; float sp = texture2D(specTex, vUv).r; float nl = texture2D(nightTex, vUv).r;
        vec3 lit = day * (0.22 + 0.95 * max(d, 0.0)) + day * sp * pow(max(d, 0.0), 8.0) * 0.5;
        vec3 night = day * 0.06 + vec3(1.0, 0.82, 0.55) * nl * 1.7;
        vec3 col = mix(night, lit, k);
        float rim = pow(1.0 - max(dot(normalize(vVN), vec3(0.0, 0.0, 1.0)), 0.0), 3.0); col += vec3(0.35, 0.65, 1.0) * rim * (0.25 + 0.5 * k);
        if (dark < 0.5) col = col * 0.9 + 0.08; gl_FragColor = vec4(col, 1.0); }`;
    earth.material = new THREE.ShaderMaterial({ uniforms: { dayTex: { value: mk(day) }, nightTex: { value: mk(night) }, specTex: { value: mk(spec) }, sunDir: { value: sunDir }, dark: { value: isDark() ? 1 : 0 } }, vertexShader: vs, fragmentShader: fs });
    // remove procedural cloud sphere from v2, add real cloud layer
    const old = group.children.filter(o => o.geometry && o.geometry.parameters && Math.abs(o.geometry.parameters.radius - R * 1.02) < 1e-6); old.forEach(o => group.remove(o));
    if (clouds) {
      const cm = new THREE.ShaderMaterial({ uniforms: { tex: { value: mk(clouds) }, sunDir: { value: sunDir } }, transparent: true, depthWrite: false,
        vertexShader: vs, fragmentShader: 'uniform sampler2D tex; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN; void main(){ float a = texture2D(tex, vUv).r; float d = dot(normalize(vN), normalize(sunDir)); float k = smoothstep(-0.1, 0.3, d); gl_FragColor = vec4(vec3(0.75 + 0.25 * k), a * 0.95 * (0.35 + 0.65 * k)); }' });
      const cl = new THREE.Mesh(new THREE.SphereGeometry(R * 1.018, 96, 64), cm); group.add(cl);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; (function tick() { if (!reduce) cl.rotation.y += 0.00025; requestAnimationFrame(tick); })();
    }
    const baseRetheme = window.__globeRetheme; window.__globeRetheme = () => { if (baseRetheme) baseRetheme(); if (earth.material.uniforms) earth.material.uniforms.dark.value = isDark() ? 1 : 0; };
    const ov = $('#v-globe .overlay'); if (ov) { const c = document.createElement('span'); c.className = 'chip'; c.textContent = t('earth_hint'); ov.firstElementChild.appendChild(c); }
  });
})();

/* ---------- satellite map + estimated radar ---------- */
(function mapLayers() {
  const M = window.__map; if (!M) return;
  let satOn = false, radarOn = false, tIdx = 0, playing = false, satImg = null; if (typeof TEX !== 'undefined') { satImg = new Image(); satImg.src = TEX.day; }
  window.__mapSat = (ctx, W, H, s, cx, cy) => {
    if (!satOn || !satImg || !satImg.complete) return false;
    const iw = satImg.naturalWidth, ih = satImg.naturalHeight; ctx.fillStyle = '#04101f'; ctx.fillRect(0, 0, W, H);
    for (let wrap = -1; wrap <= 1; wrap++) { const ox = -cx * s + W / 2 + wrap * s; if (ox > W || ox + s < 0) continue;
      for (let y = 0; y < H; y++) { const v = cy + (y - H / 2) / s; if (v < 0 || v > 1) continue; const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * v))) * 180 / Math.PI; const sy = Math.min(ih - 1, Math.max(0, (90 - lat) / 180 * ih)); ctx.drawImage(satImg, 0, sy, iw, 1, ox, y, s, 1); } }
    return true;
  };
  const colorFor = p => p < 40 ? [108, 140, 255] : p < 60 ? [74, 222, 128] : p < 80 ? [245, 184, 65] : [248, 113, 113];
  window.__mapOverlay = (ctx, toScreen, W, H) => {
    if (!radarOn) return; const st = M.state(); const zf = Math.sqrt(st.zoom); const now = performance.now() / 1000;
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    WX.forEach((c, i) => { const k = Math.floor(tIdx), f = tIdx - k; const h0 = c.hours[Math.min(k, c.hours.length - 1)], h1 = c.hours[Math.min(k + 1, c.hours.length - 1)]; const p = h0[2] * (1 - f) + h1[2] * f; const code = h0[3]; if (p < 15) return;
      const [x, y] = toScreen(c.lat, c.lon); if (x < -80 || x > W + 80 || y < -80 || y > H + 80) return;
      const storm = code >= 95; const r = (14 + p * 0.32) * zf * (storm ? 1.25 : 1); const col = storm ? [248, 113, 113] : colorFor(p);
      for (let b = 0; b < 2; b++) { const ang = now * 0.4 + i + b * 2.1; const dx = Math.cos(ang) * r * 0.25, dy = Math.sin(ang * 0.8) * r * 0.2; const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r * (0.8 + b * 0.2)); g.addColorStop(0, `rgba(${col},${0.14 + p / 700})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill(); }
    });
    ctx.restore();
  };
  const ov = $('#v-map .overlay').firstElementChild;
  ov.insertAdjacentHTML('beforeend', `<button class="chip" id="satBtn">🛰️ <span data-i18n="layer_sat">${t('layer_sat')}</span></button><button class="chip" id="radarBtn">🌧️ <span data-i18n="layer_radar">${t('layer_radar')}</span></button><button class="chip" id="gmapsBtn">📍 Google Maps</button>`);
  const bar = document.createElement('div'); bar.className = 'radarbar hidden'; bar.id = 'radarbar';
  bar.innerHTML = `<button class="ib" id="radarPlay">▶</button><span class="tl" id="radarT"></span><input type="range" id="radarRange" min="0" max="11" step="0.25" value="0"><span class="lg"><i style="background:#6C8CFF"></i><i style="background:#4ADE80"></i><i style="background:#F5B841"></i><i style="background:#F87171"></i></span><small data-i18n="radar_note">${t('radar_note')}</small>`;
  $('#v-map').appendChild(bar);
  const credit = document.createElement('span'); credit.className = 'sat-credit hidden'; credit.id = 'satCredit'; credit.textContent = t('sat_credit'); $('#v-map').appendChild(credit);
  const label = () => { const h = WX[selected].hours[Math.min(Math.floor(tIdx), 11)]; $('#radarT').textContent = Math.floor(tIdx) === 0 ? t('now_h') : `${t('in_h')} ${Math.floor(tIdx)}h · ${h[0]}`; };
  $('#satBtn').onclick = () => { satOn = !satOn; $('#satBtn').classList.toggle('on', satOn); credit.classList.toggle('hidden', !satOn); window.__mapDraw(); };
  $('#radarBtn').onclick = () => { radarOn = !radarOn; $('#radarBtn').classList.toggle('on', radarOn); bar.classList.toggle('hidden', !radarOn); playing = radarOn; $('#radarPlay').textContent = playing ? '⏸' : '▶'; label(); window.__mapDraw(); };
  $('#radarPlay').onclick = () => { playing = !playing; $('#radarPlay').textContent = playing ? '⏸' : '▶'; };
  $('#radarRange').oninput = e => { tIdx = +e.target.value; playing = false; $('#radarPlay').textContent = '▶'; label(); window.__mapDraw(); };
  $('#gmapsBtn').onclick = () => { const c = WX[selected]; window.open(`https://www.google.com/maps/@${c.lat},${c.lon},11z`, '_blank', 'noopener'); };
  let last = 0; (function loop(now) { if (radarOn && currentView === 'map') { if (playing && now - last > 110) { last = now; tIdx = (tIdx + 0.12) % 11.99; $('#radarRange').value = tIdx; label(); window.__mapDraw(); } else if (!playing && now - last > 110) { last = now; window.__mapDraw(); } } requestAnimationFrame(loop); })(0);
})();

/* ---------- hail ---------- */
(function hail() {
  const baseAlerts = alertsFor;
  alertsFor = function (c) { const out = baseAlerts(c); if (c.w === 96 || c.w === 99 || c.hours.slice(0, 12).some(h => h[3] === 96 || h[3] === 99)) out.unshift(['🧊', 'a_hail', 'a_hail_d', 'storm']); return out; };
  $('#moods').insertAdjacentHTML('beforeend', '<button data-t="hail" data-e="🧊">🧊</button>');
  const baseKind = fxKind; fxKind = (p, c) => { if ((p && p.tag === 'hail') || (c && (c.w === 96 || c.w === 99))) return 'hail'; return baseKind(p, c); };
  const baseAttach = fxAttach;
  fxAttach = function (cv, kind) {
    if (kind !== 'hail') return baseAttach(cv, kind);
    const P = []; const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; let flash = 0;
    (function step() { if (!cv.isConnected) return; const r = cv.getBoundingClientRect(); if (r.bottom >= 0 && r.top <= innerHeight) { const W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight; const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, W, H); while (P.length < 70) P.push({ x: Math.random() * W, y: Math.random() * H, vy: 6 + Math.random() * 6, s: 2 + Math.random() * 3, b: 0 }); for (const p of P) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(180,220,255,.6)'; ctx.beginPath(); ctx.arc(p.x - p.s * 0.3, p.y - p.s * 0.3, p.s * 0.4, 0, 7); ctx.fill(); if (!reduce) { p.y += p.vy; p.x += 0.6; if (p.y > H - 4) { if (p.b < 1) { p.vy = -p.vy * 0.35; p.b++; p.y = H - 4; } else { p.y = -10; p.x = Math.random() * W; p.vy = 6 + Math.random() * 6; p.b = 0; } } else p.vy += 0.35; } } if (Math.random() < 0.01) flash = 1; if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * 0.4})`; ctx.fillRect(0, 0, W, H); flash -= 0.1; } } requestAnimationFrame(step); })();
  };
})();

/* ---------- social profile: avatar, bio, Instagram, follow, hashtags, trending, notifications ---------- */
prefs.follows = prefs.follows || []; prefs.bio = prefs.bio || ''; prefs.ig = prefs.ig || ''; prefs.avatar = prefs.avatar || '';
(function socialProfile() {
  const panel = $('#v-profile .panel'); const head = panel.firstElementChild; head.className = 'profile-head';
  head.insertAdjacentHTML('beforeend', `<input type="file" id="fAvatar" accept="image/*" hidden>`);
  const stats = document.createElement('div'); stats.className = 'stats'; stats.id = 'profStats2'; head.lastElementChild.previousElementSibling.appendChild(stats);
  $('#profAv').onclick = () => $('#fAvatar').click();
  $('#fAvatar').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { prefs.avatar = await shrinkImage(f, 160, 0.7); savePrefs(); renderProfile(); toast(t('media_saved')); } catch {} e.target.value = ''; };
  const nickField = $('#nick').closest('.field');
  nickField.insertAdjacentHTML('afterend', `<div class="field"><label for="bio" data-i18n="bio">${t('bio')}</label><input id="bio" maxlength="80" value="${esc(prefs.bio)}"></div><div class="field"><label for="igh" data-i18n="ig">${t('ig')}</label><input id="igh" maxlength="30" placeholder="tuo_profilo" value="${esc(prefs.ig)}"></div>`);
  $('#bio').oninput = e => { prefs.bio = e.target.value.trim(); savePrefs(); };
  $('#igh').oninput = e => { prefs.ig = e.target.value.trim().replace(/^@/, ''); savePrefs(); };
  const base = renderProfile;
  renderProfile = function () { base(); const av = $('#profAv'); if (prefs.avatar) { av.innerHTML = `<img class="avimg" src="${prefs.avatar}" alt="">`; av.style.background = 'transparent'; } const mine = allPosts().filter(p => p.u === prefs.nick && !p.seed); const likes = mine.reduce((a, p) => a + (p.likes || 0), 0); $('#profStats2').innerHTML = `<span><b>${mine.length}</b> post</span><span><b>${prefs.follows.length}</b> ${t('f_follow').toLowerCase()}</span><span><b>${likes}</b> ♥</span>${prefs.ig ? `<a class="igl" style="color:var(--accent)" href="https://instagram.com/${encodeURIComponent(prefs.ig)}" target="_blank" rel="noopener">📷 @${esc(prefs.ig)}</a>` : ''}`; };
})();
// attach avatar/ig to new posts
(function () { const btn = $('#postBtn'); const base = btn.onclick; btn.onclick = async () => { const origPublish = publishState; publishState = async p => { if (p) { if (prefs.avatar) p.av = prefs.avatar; if (prefs.ig) p.ig = prefs.ig; if (prefs.bio) p.bio = prefs.bio; } return origPublish(p); }; try { await base(); } finally { publishState = origPublish; } }; })();
// render avatar, ig link, follow button, hashtags
const hashify = html => html.replace(/(^|\s)(#[\p{L}\d_]{2,30})/gu, '$1<span class="hash">$2</span>');
const baseBind4 = bindPostActions;
bindPostActions = function (root) {
  baseBind4(root);
  root.querySelectorAll('.reel, .post').forEach(art => {
    const p = allPosts().find(x => x.id === art.dataset.id); if (!p) return;
    const av = art.querySelector('.av'); if (av && p.av) { av.innerHTML = `<img class="avimg" src="${p.av}" alt="">`; av.style.background = 'transparent'; }
    const nameEl = art.querySelector('.rtop b, .who b'); if (nameEl && !nameEl.querySelector('.followb')) { if (p.ig) nameEl.insertAdjacentHTML('beforeend', ` <a class="igl" href="https://instagram.com/${encodeURIComponent(p.ig)}" target="_blank" rel="noopener">📷 @${esc(p.ig)}</a>`); if (p.u !== prefs.nick && !p.seed) { const on = prefs.follows.includes(p.u); nameEl.insertAdjacentHTML('beforeend', `<button class="followb ${on ? 'on' : ''}">${on ? '✓ ' + t('following') : '+ ' + t('follow')}</button>`); nameEl.querySelector('.followb').onclick = e => { e.stopPropagation(); const i = prefs.follows.indexOf(p.u); if (i >= 0) prefs.follows.splice(i, 1); else prefs.follows.push(p.u); savePrefs(); renderAll(); }; } }
    const txt = art.querySelector('.txt, .body'); if (txt && !txt.dataset.hashed) { txt.dataset.hashed = 1; txt.innerHTML = hashify(txt.innerHTML); txt.querySelectorAll('.hash').forEach(h => h.onclick = e => { e.stopPropagation(); window.__hashFilter = h.textContent.toLowerCase(); feedFilter = 'all'; show('community'); }); }
  });
};
// follow filter + hashtag filter + trending
(function () {
  $('#feedFilters').insertAdjacentHTML('beforeend', `<button class="chip" data-f="follow">👥 <span data-i18n="f_follow">${t('f_follow')}</span></button>`);
  const trend = document.createElement('div'); trend.className = 'trend'; trend.id = 'trend'; $('#feedFilters').closest('.feedhead').insertAdjacentElement('afterend', trend);
  const base = renderFeed;
  renderFeed = function () {
    const orig = allPosts; const hf = window.__hashFilter;
    if (feedFilter === 'follow' || hf) { allPosts = () => orig().filter(p => (feedFilter !== 'follow' || prefs.follows.includes(p.u)) && (!hf || (ptext(p) || '').toLowerCase().includes(hf))); }
    try { const f = feedFilter; if (f === 'follow') feedFilter = 'all'; base(); feedFilter = f; } finally { allPosts = orig; }
    $$('#feedFilters .chip').forEach(x => x.classList.toggle('on', x.dataset.f === feedFilter));
    const counts = {}; for (const p of orig()) { for (const m of (ptext(p) || '').matchAll(/#[\p{L}\d_]{2,30}/gu)) { const k = m[0].toLowerCase(); counts[k] = (counts[k] || 0) + 1; } }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    trend.innerHTML = (top.length ? `<span class="chip" style="pointer-events:none">🔥 ${t('trending')}</span>` : '') + top.map(([k, n]) => `<button class="chip ${hf === k ? 'on' : ''}" data-h="${esc(k)}">${esc(k)} <b>${n}</b></button>`).join('') + (hf ? `<button class="chip on" data-h="">✕ ${esc(hf)}</button>` : '');
    trend.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { window.__hashFilter = b.dataset.h || null; renderFeed(); });
    try { LS.set('lastSeen', Date.now()); } catch {} $('#feedBadge').classList.add('hidden');
  };
  // notifications badge
  const seen = LS.get('lastSeen', 0); const n = allPosts().filter(p => p.ts > seen && p.u !== prefs.nick).length; if (n && currentView !== 'community') { const b = $('#feedBadge'); b.textContent = n; b.classList.remove('hidden'); b.title = n + ' ' + t('new_posts'); }
})();
// Instagram share from card modal
(function () {
  const acts = $('#cardModal .acts'); acts.insertAdjacentHTML('afterbegin', `<button class="ib" id="igShare">📸 <span data-i18n="ig_share">${t('ig_share')}</span></button>`);
  $('#igShare').onclick = async () => { const c = WX[selected]; const caption = (prefs.lang === 'en' ? `My sky today in ${c.n}: ${wLabel(c.w)}, ${T(c.t)}° · Weather Score ${score(c).s}/100 🌍 #MeteoSocial #SkyToday #${c.n.replace(/\s+/g, '')}` : `Il cielo da me oggi a ${c.n}: ${wLabel(c.w)}, ${T(c.t)}° · Meteo Score ${score(c).s}/100 🌍 #MeteoSocial #CieloDiOggi #${c.n.replace(/\s+/g, '')}`); try { await navigator.clipboard.writeText(caption); } catch {} $('#cardShare').click(); toast(t('ig_copied')); setTimeout(() => window.open('https://www.instagram.com/', '_blank', 'noopener'), 900); };
})();

/* ---------- AI assistant everywhere (floating) ---------- */
(function () {
  document.body.insertAdjacentHTML('beforeend', `<button class="aifab" id="aiFab" title="${t('ai_fab')}">✦</button>
  <div class="sheet" id="aiSheet"><div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h3>✦ <span data-i18n="ai_fab">${t('ai_fab')}</span></h3><button class="ib" data-close>✕</button></div><div class="log" id="aiSheetLog"></div><div class="chips" id="aiSheetChips"></div><form id="aiSheetForm"><input id="aiSheetIn" data-ph="ai_ph2" placeholder="${t('ai_ph2')}" autocomplete="off"><button class="ib primary" type="submit" data-i18n="send">${t('send')}</button></form></div></div>`);
  const sheet = $('#aiSheet'); sheet.querySelector('[data-close]').onclick = () => sheet.classList.remove('show'); sheet.addEventListener('click', e => { if (e.target === sheet) sheet.classList.remove('show'); });
  const ctxLine = () => ({ globe: t('ai_ctx_globe'), map: t('ai_ctx_map'), weather: t('ai_ctx_weather'), community: t('ai_ctx_community'), profile: t('ai_ctx_profile'), ai: '' })[currentView] || '';
  const suggestions = () => ({ globe: ['c2', 'ai_plan'], map: ['c1', 'ai_wear'], weather: ['c1', 'ai_wear', 'ai_fun'], community: ['c4', 'ai_caption'], profile: ['ai_wear', 'ai_plan'] })[currentView] || ['c1', 'c2'];
  $('#aiFab').onclick = () => { sheet.classList.add('show'); $('#aiSheetChips').innerHTML = suggestions().map(k => `<button class="chip">${t(k)}</button>`).join(''); $$('#aiSheetChips .chip').forEach(b => b.onclick = () => { $('#aiSheetIn').value = b.textContent; $('#aiSheetForm').requestSubmit(); }); setTimeout(() => $('#aiSheetIn').focus(), 50); };
  $('#aiSheetForm').onsubmit = async e => { e.preventDefault(); const inp = $('#aiSheetIn'); const q = inp.value.trim(); if (!q) return; inp.value = ''; const log = $('#aiSheetLog'); const me = document.createElement('div'); me.className = 'msg me'; me.textContent = q; log.appendChild(me); const box = document.createElement('div'); box.className = 'aiinline'; log.appendChild(box); log.scrollTop = 1e9; const posts = allPosts().slice(0, 6).map(p => `[${p.u} @${p.city}] ${ptext(p)}`).join('\n'); await aiInto(box, `${aiContext()}\nContesto: ${ctxLine()}. Città selezionata: ${cityBrief(WX[selected])}. Ultimi post:\n${posts}\n\nDomanda: ${q}`, { cache: false, modelTier: 'default' }); log.scrollTop = 1e9; };
  const baseShow4 = show; show = function (v) { baseShow4(v); $('#aiFab').classList.toggle('hidden', v === 'ai'); };
})();

/* ---------- city card: Google Maps link ---------- */
(function () { const base = cityCard; cityCard = function (i, el) { base(i, el); const c = WX[i]; const acts = el.querySelector('.acts'); if (acts) acts.insertAdjacentHTML('beforeend', `<a class="ib" href="https://www.google.com/maps/@${c.lat},${c.lon},11z" target="_blank" rel="noopener">🗺️ ${t('gmaps')}</a>`); }; })();
applyLang();
