/* ===== MeteoSocial v2: social reels, stories, 3D scene, score, share cards, smarter AI ===== */
Object.assign(I18N.it, {
  daily_h: '#CieloDiOggi', daily_p: "Com'è il cielo da te adesso? Raccontalo in una frase.", m_reels: 'Per te', m_list: 'Lista', comp_h: "Com'è il cielo da te?", ai_write: "Scrivilo con l'IA",
  card_h: 'La tua card da condividere', card_save: 'Salva immagine', close: 'Chiudi', card_note: 'Su telefono: tieni premuto sull\'immagine per salvarla nelle foto.', p_friend: 'Amico', p_snark: 'Sarcastico', p_pro: 'Meteorologo',
  score_h: 'Meteo Score', s_perfect: 'Giornata perfetta', s_great: 'Giornata ottima', s_ok: 'Così così', s_umbrella: "Meglio l'ombrello", s_sofa: 'Giornata da divano', lead_h: 'Classifica mondiale di oggi', vs_h: 'Sfida città', card_btn: 'Crea card story',
  scene_h: 'Meteo in 3D', level: 'Reporter', story_add: 'La tua', reply_send: 'Invia', ai_caption: 'Caption per Instagram', ai_wear: 'Cosa mi metto oggi?', ai_fun: 'Dimmi una curiosità sul meteo di oggi', ai_plan: 'Weekend: dove andare?',
  post_ph: 'Es. Qui c\'è un cielo pazzesco 🌅', why_temp: 'temperatura', why_rain: 'pioggia', why_wind: 'vento', why_storm: 'temporali', why_perfect: 'tutto ok', vs_win: 'vince oggi', vs_tie: 'Pareggio!', share_post: 'Condividi',
  card_tag: 'Il cielo da me oggi', react_h: 'Reazioni', stories_h: 'Storie meteo', seen_all: 'Hai visto tutto', empty_story: 'Nessuna storia qui',
});
Object.assign(I18N.en, {
  daily_h: '#SkyToday', daily_p: 'How is the sky where you are right now? Tell it in one sentence.', m_reels: 'For you', m_list: 'List', comp_h: 'How is the sky where you are?', ai_write: 'Write it with AI',
  card_h: 'Your card to share', card_save: 'Save image', close: 'Close', card_note: 'On phone: long-press the image to save it to your photos.', p_friend: 'Friend', p_snark: 'Snarky', p_pro: 'Meteorologist',
  score_h: 'Weather Score', s_perfect: 'Perfect day', s_great: 'Great day', s_ok: 'So-so', s_umbrella: 'Bring an umbrella', s_sofa: 'Sofa day', lead_h: 'Today\'s world ranking', vs_h: 'City battle', card_btn: 'Create story card',
  scene_h: 'Weather in 3D', level: 'Reporter', story_add: 'Yours', reply_send: 'Send', ai_caption: 'Instagram caption', ai_wear: 'What should I wear today?', ai_fun: 'Tell me a fun fact about today\'s weather', ai_plan: 'Weekend: where to go?',
  post_ph: 'E.g. Crazy sky here today 🌅', why_temp: 'temperature', why_rain: 'rain', why_wind: 'wind', why_storm: 'storms', why_perfect: 'all good', vs_win: 'wins today', vs_tie: 'Tie!', share_post: 'Share',
  card_tag: 'My sky today', react_h: 'Reactions', stories_h: 'Weather stories', seen_all: 'All caught up', empty_story: 'No stories here',
});

/* ---------- score ---------- */
function score(c) {
  let s = 100; const why = [];
  const dt = Math.abs(c.days[0][2] - 24) + Math.abs(c.t - 22) / 2; if (dt > 3) { s -= Math.min(40, dt * 2.2); why.push(t('why_temp')); }
  const rp = Math.max(c.days[0][4], ...c.hours.slice(0, 8).map(h => h[2])); if (rp > 25) { s -= rp * 0.35; why.push(t('why_rain')); }
  if (c.ws > 20) { s -= Math.min(20, (c.ws - 20) * 1.2); why.push(t('why_wind')); }
  if (c.w >= 95 || c.hours.slice(0, 8).some(h => h[3] >= 95)) { s -= 25; why.push(t('why_storm')); }
  if (c.w === 45 || c.w === 48) s -= 8;
  s = Math.max(0, Math.min(100, Math.round(s)));
  const lbl = s >= 85 ? ['s_perfect', '☀️'] : s >= 70 ? ['s_great', '😎'] : s >= 50 ? ['s_ok', '🙂'] : s >= 30 ? ['s_umbrella', '☂️'] : ['s_sofa', '🛋️'];
  return { s, lbl: t(lbl[0]), e: lbl[1], why: why.length ? why.join(' · ') : t('why_perfect') };
}
const REACTS = ['🔥', '🌧️', '😱', '😍'];
let myReacts = LS.get('reacts', {});
let feedMode = LS.get('feedMode', 'reels');
let seenStories = LS.get('seen', {});
let persona = LS.get('persona', 'friend');
let compMood = { t: 'obs', e: '☀️' };
const reporterLevel = () => { const n = allPosts().filter(p => p.u === prefs.nick && !p.seed).length; return n >= 20 ? ['🏆', 'Pro'] : n >= 5 ? ['⭐', 'Local'] : n >= 1 ? ['🌱', 'Rookie'] : ['👋', 'New']; };

/* ---------- gradients & fx ---------- */
function wxGrad(code, day) {
  if (code >= 95) return 'linear-gradient(160deg,#334155,#1E293B 60%,#0F172A)';
  if (code >= 71 && code <= 86 && code !== 80 && code !== 81 && code !== 82) return 'linear-gradient(160deg,#94A3B8,#475569 60%,#1E293B)';
  if (code >= 51) return 'linear-gradient(160deg,#475569,#1E40AF 65%,#0B1526)';
  if (code >= 45) return 'linear-gradient(160deg,#94A3B8,#64748B 60%,#334155)';
  if (!day) return 'linear-gradient(160deg,#1E1B4B,#312E81 55%,#0B1526)';
  if (code === 0) return 'linear-gradient(160deg,#F59E0B,#F97316 45%,#DB2777)';
  return 'linear-gradient(160deg,#0EA5E9,#2563EB 60%,#1E3A8A)';
}
function fxKind(p, c) { const tag = p && p.tag; if (tag === 'storm' || (c && c.w >= 95)) return 'storm'; if (tag === 'snow' || (c && c.w >= 71 && c.w <= 77)) return 'snow'; if (tag === 'rain' || (c && c.w >= 51 && c.w <= 82)) return 'rain'; if (tag === 'heat' || (c && c.day && c.w <= 1)) return 'sun'; if (c && (c.w === 45 || c.w === 48)) return 'fog'; return 'stars'; }
const FX = new Map();
function fxAttach(canvas, kind) { const parts = []; FX.set(canvas, { kind, parts, flash: 0 }); }
(function fxLoop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function step() {
    for (const [cv, st] of FX) {
      if (!cv.isConnected) { FX.delete(cv); continue; }
      const r = cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
      const W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight; const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, W, H);
      const P = st.parts; const n = st.kind === 'rain' ? 90 : st.kind === 'snow' ? 60 : st.kind === 'storm' ? 110 : 40;
      while (P.length < n) P.push({ x: Math.random() * W, y: Math.random() * H, v: 1 + Math.random() * 2, s: Math.random() });
      if (st.kind === 'rain' || st.kind === 'storm') { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const p of P) { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 3, p.y + 14 + p.s * 10); if (!reduce) { p.y += 9 + p.v * 5; p.x -= 1.5; } if (p.y > H) { p.y = -20; p.x = Math.random() * W + 40; } } ctx.stroke(); if (st.kind === 'storm') { if (Math.random() < 0.012) st.flash = 1; if (st.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${st.flash * 0.5})`; ctx.fillRect(0, 0, W, H); st.flash -= 0.08; } } }
      else if (st.kind === 'snow') { ctx.fillStyle = 'rgba(255,255,255,.85)'; for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 + p.s * 2.5, 0, 7); ctx.fill(); if (!reduce) { p.y += 0.6 + p.v * 0.5; p.x += Math.sin(p.y / 30 + p.s * 9) * 0.6; } if (p.y > H) { p.y = -10; p.x = Math.random() * W; } } }
      else if (st.kind === 'sun') { const tme = performance.now() / 1000; ctx.save(); ctx.translate(W - 60, 60); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = `rgba(255,240,180,${0.08 + 0.05 * Math.sin(tme * 2 + i)})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, 420); ctx.lineTo(18, 420); ctx.closePath(); ctx.fill(); } ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,.5)'; for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 1 + p.s * 1.5, 0, 7); ctx.fill(); if (!reduce) p.y -= 0.3 + p.v * 0.3; if (p.y < 0) { p.y = H; p.x = Math.random() * W; } } }
      else if (st.kind === 'fog') { for (const p of P) { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 80 + p.s * 80); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - 160, p.y - 160, 320, 320); if (!reduce) p.x += 0.2 + p.v * 0.2; if (p.x > W + 100) p.x = -100; } }
      else { ctx.fillStyle = 'rgba(255,255,255,.7)'; for (const p of P) { const a = 0.3 + 0.5 * Math.abs(Math.sin(performance.now() / 700 + p.s * 10)); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 1 + p.s * 1.6, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ---------- reels feed ---------- */
function reelHTML(p) {
  const ci = cityByName(p.city); const c = ci >= 0 ? WX[ci] : null; const liked = !!myLikes[p.id]; const likes = (p.likes || 0) + (liked && !p.mine ? 1 : 0);
  const re = Object.assign({}, p.re || {}); const mine = myReacts[p.id]; if (mine && !p.mine) re[mine] = (re[mine] || 0) + 1;
  const kind = fxKind(p, c); const sym = p.e || (c && (p.tag || 'obs') === 'obs' ? isNightIcon(c.w, c.day) : (TAGS[p.tag] || '👀'));
  return `<article class="reel ${p.mine ? 'mine' : ''}" data-id="${esc(p.id)}" style="background:${c ? wxGrad(p.tag === 'storm' ? 95 : p.tag === 'rain' ? 61 : p.tag === 'snow' ? 71 : c.w, c.day) : wxGrad(2, 1)}">
    <canvas class="fx" data-fx="${kind}"></canvas><div class="bgsym">${sym}</div><div class="heart">❤️</div>
    <div class="rtop"><div class="av" style="background:${avColor(p.u)}">${esc(initials(p.u))}</div><div><b>${esc(p.u)}${p.seed ? ' · ' + t('example') : ''}</b><small>📍 ${esc(p.city)} · ${ago(p.ts)}</small></div></div>
    <div class="txt">${esc(ptext(p))}</div>
    <div class="sub">${c ? `<span class="pill">${isNightIcon(c.w, c.day)} ${T(c.t)}° · ${wLabel(c.w)}</span>` : ''}<span class="pill">${TAGS[p.tag] || '👀'} ${t('t_' + (p.tag || 'obs'))}</span></div>
    <div class="react">${REACTS.map(e => `<button data-re="${e}" class="${mine === e ? 'on' : ''}">${e}${re[e] ? ` <span class="num">${re[e]}</span>` : ''}</button>`).join('')}</div>
    <div class="rail"><button data-like class="${liked ? 'on' : ''}"><span class="i">${liked ? '❤️' : '🤍'}</span><span class="num">${likes}</span></button><button data-com><span class="i">💬</span><span class="num">${(p.com || []).length}</span></button><button data-share><span class="i">↗</span><span>${t('share_post')}</span></button><button data-city="${esc(p.city)}"><span class="i">📍</span><span>${t('n_weather')}</span></button>${(p.local || (canWrite && !p.seed)) ? `<button data-del><span class="i">🗑</span><span></span></button>` : ''}</div>
    <div class="cbox">${(p.com || []).map(k => `<div class="c"><b>${esc(k.u)}</b> ${esc(k.t)} <span style="opacity:.7;font-size:11px">· ${ago(k.ts)}</span></div>`).join('')}<form><input maxlength="240" placeholder="${t('reply_ph')}" aria-label="${t('comment')}"><button class="ib primary" type="submit">${t('reply_send')}</button></form></div>
  </article>`;
}
function renderFeed() {
  const home = WX[prefs.home];
  let posts = allPosts();
  if (feedFilter === 'near') posts = posts.filter(p => { const x = WX[cityByName(p.city)]; return x && dist(x, home) < 600; });
  if (feedFilter === 'alert') posts = posts.filter(p => ['storm', 'alert', 'snow'].includes(p.tag));
  if (feedFilter === 'photo') posts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const feed = $('#feed'); feed.className = feedMode === 'reels' ? 'reels' : '';
  feed.innerHTML = posts.length ? posts.map(feedMode === 'reels' ? reelHTML : postHTML).join('') : `<div class="empty">${t('empty_feed')}</div>`;
  $$('#feedMode button').forEach(b => b.classList.toggle('on', b.dataset.m === feedMode));
  $('#postNote').textContent = canWrite === false ? t('readonly_note') : canWrite ? t('writer_note') : '';
  feed.querySelectorAll('canvas.fx').forEach(cv => fxAttach(cv, cv.dataset.fx));
  bindPostActions(feed);
  renderStories();
  $('#fab').classList.toggle('hidden', currentView !== 'community');
}
function fly(e, emoji) { const d = document.createElement('div'); d.className = 'fly'; d.textContent = emoji; d.style.left = (e.clientX - 14) + 'px'; d.style.top = (e.clientY - 14) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000); }
async function persistPostChange(id, mutate) {
  const lp = localPosts.find(p => p.id === id); if (lp) { mutate(lp); LS.set('localPosts', localPosts); }
  const sp = stateDoc.posts.find(p => p.id === id); if (sp && canWrite !== false) { mutate(sp); await publishState(); }
}
function bindPostActions(root) {
  root.querySelectorAll('.post, .reel').forEach(art => {
    const id = art.dataset.id; const find = () => allPosts().find(p => p.id === id);
    const like = art.querySelector('[data-like]'); if (like) like.onclick = e => { myLikes[id] = !myLikes[id]; LS.set('likes', myLikes); if (myLikes[id]) fly(e, '❤️'); const lp = localPosts.find(p => p.id === id); if (lp) { lp.likes = Math.max(0, (lp.likes || 0) + (myLikes[id] ? 1 : -1)); LS.set('localPosts', localPosts); } renderAll(); };
    art.querySelectorAll('[data-re]').forEach(b => b.onclick = e => { const em = b.dataset.re; myReacts[id] = myReacts[id] === em ? null : em; LS.set('reacts', myReacts); if (myReacts[id]) fly(e, em); renderAll(); });
    const com = art.querySelector('[data-com]'); if (com) com.onclick = () => { const box = art.querySelector('.cbox, .comments'); if (box.classList.contains('comments')) box.classList.toggle('hidden'); else box.classList.toggle('show'); if (!box.classList.contains('hidden') && (box.classList.contains('show') || box.classList.contains('comments'))) box.querySelector('input').focus(); };
    const sh = art.querySelector('[data-share]'); if (sh) sh.onclick = () => { const p = find(); if (p) shareCard(cityByName(p.city), p); };
    art.querySelector('[data-city]').onclick = e => { const i = cityByName(e.currentTarget.dataset.city); if (i >= 0) selectCity(i, 'weather'); };
    const del = art.querySelector('[data-del]'); if (del) del.onclick = async () => { localPosts = localPosts.filter(p => p.id !== id); LS.set('localPosts', localPosts); if (stateDoc.posts.some(p => p.id === id)) { stateDoc.posts = stateDoc.posts.filter(p => p.id !== id); await publishState(); } toast(t('deleted')); renderAll(); };
    // double tap heart
    if (art.classList.contains('reel')) { let lastTap = 0; art.addEventListener('pointerup', e => { if (e.target.closest('button,form,input')) return; const now = Date.now(); if (now - lastTap < 320) { if (!myLikes[id]) { myLikes[id] = true; LS.set('likes', myLikes); const lp = localPosts.find(p => p.id === id); if (lp) { lp.likes = (lp.likes || 0) + 1; LS.set('localPosts', localPosts); } } const h = art.querySelector('.heart'); h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); setTimeout(renderAll, 650); } lastTap = now; }); }
    const form = art.querySelector('form'); if (form) form.onsubmit = async e => { e.preventDefault(); const inp = form.querySelector('input'); const txt = inp.value.trim(); if (!txt) return; const cm = { u: prefs.nick || t('you'), t: txt, ts: Date.now() }; const p = find(); if (!p) return; if (p.seed) { localPosts.unshift({ ...p, seed: false, mine: true, local: true, com: [cm] }); LS.set('localPosts', localPosts); } else { const found = localPosts.some(x => x.id === id) || stateDoc.posts.some(x => x.id === id); if (found) await persistPostChange(id, x => { x.com = [...(x.com || []), cm]; }); } inp.value = ''; renderAll(); const a2 = $(`#feed [data-id="${id}"]`); if (a2) { const box = a2.querySelector('.cbox, .comments'); box.classList.add('show'); box.classList.remove('hidden'); } };
  });
}
$('#feedMode').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; feedMode = b.dataset.m; LS.set('feedMode', feedMode); renderFeed(); };

/* ---------- stories ---------- */
function storyGroups() { const g = {}; for (const p of allPosts()) { (g[p.city] = g[p.city] || []).push(p); } return Object.entries(g).sort((a, b) => b[1][0].ts - a[1][0].ts); }
function renderStories() {
  const groups = storyGroups();
  $('#stories').innerHTML = `<button class="story add" id="storyAdd"><span class="ring"><span class="in">+</span></span><span class="n">${t('story_add')}</span></button>` + groups.map(([city, ps]) => { const c = WX[cityByName(city)]; const seen = seenStories[city] >= ps[0].ts; return `<button class="story" data-city="${esc(city)}"><span class="ring ${seen ? 'seen' : ''}"><span class="in">${c ? isNightIcon(c.w, c.day) : '🌍'}<b>${ps.length}</b></span></span><span class="n">${esc(city)}</span></button>`; }).join('');
  $('#storyAdd').onclick = openComposer;
  $$('#stories [data-city]').forEach(b => b.onclick = () => openStory(b.dataset.city));
}
function openStory(city) {
  const ps = storyGroups().find(g => g[0] === city); if (!ps) return; const list = ps[1]; let i = 0, timer;
  const box = $('#storyBox'); $('#storyView').classList.add('show');
  seenStories[city] = list[0].ts; LS.set('seen', seenStories);
  function draw() {
    const p = list[i];
    box.innerHTML = `<div style="position:relative">
      <div style="position:absolute;left:10px;right:10px;top:8px;display:flex;gap:4px;z-index:5">${list.map((_, k) => `<i style="flex:1;height:3px;border-radius:2px;background:${k < i ? '#fff' : k === i ? 'linear-gradient(90deg,#fff 50%,rgba(255,255,255,.35) 50%)' : 'rgba(255,255,255,.35)'};background-size:200% 100%;${k === i ? 'animation:bar 5s linear forwards' : ''}"></i>`).join('')}</div>
      <button class="ib" data-close style="position:absolute;right:10px;top:18px;z-index:6;background:rgba(0,0,0,.4);color:#fff;border:0">✕</button>
      ${reelHTML(p).replace('class="reel', 'class="reel story-reel').replace('min-height:440px', '')}
      <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;z-index:2"><div data-prev></div><div data-next></div></div>
    </div>`;
    box.querySelector('.reel').style.minHeight = '78vh';
    box.querySelectorAll('canvas.fx').forEach(cv => fxAttach(cv, cv.dataset.fx));
    bindPostActions(box);
    box.querySelector('[data-prev]').onclick = () => { i = Math.max(0, i - 1); draw(); };
    box.querySelector('[data-next]').onclick = () => { if (i < list.length - 1) { i++; draw(); } else close(); };
    box.querySelector('[data-close]').onclick = close;
    clearTimeout(timer); timer = setTimeout(() => { if (i < list.length - 1) { i++; draw(); } else close(); }, 5000);
  }
  function close() { clearTimeout(timer); $('#storyView').classList.remove('show'); box.innerHTML = ''; renderStories(); }
  draw();
}
const barStyle = document.createElement('style'); barStyle.textContent = '@keyframes bar{from{background-position:100% 0}to{background-position:0 0}}'; document.head.appendChild(barStyle);

/* ---------- composer ---------- */
function openComposer(city) { $('#composer').classList.add('show'); fillCitySelect($('#postCity'), typeof city === 'number' ? city : (selected ?? prefs.home)); $('#compNote').textContent = canWrite === false ? t('readonly_note') : canWrite ? t('writer_note') : ''; setTimeout(() => $('#postText').focus(), 50); }
window.openComposer = openComposer;
$('#fab').onclick = () => openComposer();
$('#dailyPrompt').onclick = () => openComposer();
$$('.sheet [data-close], .modal [data-close]').forEach(b => b.onclick = () => b.closest('.sheet, .modal').classList.remove('show'));
$$('.sheet').forEach(sh => sh.addEventListener('click', e => { if (e.target === sh) sh.classList.remove('show'); }));
$('#moods').onclick = e => { const b = e.target.closest('button'); if (!b) return; compMood = { t: b.dataset.t, e: b.dataset.e }; $$('#moods button').forEach(x => x.classList.toggle('on', x === b)); };
$('#postBtn').onclick = async () => {
  const txt = $('#postText').value.trim(); if (txt.length < 3) return toast(t('post_short'));
  const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), u: prefs.nick || t('you'), city: WX[+$('#postCity').value].n, t: txt, tag: compMood.t, e: compMood.e, ts: Date.now(), likes: 0, re: {}, com: [] };
  $('#postText').value = ''; $('#composer').classList.remove('show');
  const ok = await publishState(p);
  if (!ok) { localPosts.unshift({ ...p, local: true, mine: true }); LS.set('localPosts', localPosts); toast(t('saved_local')); } else toast(t('published'));
  postTag = compMood.t; renderAll(); if (currentView !== 'community') show('community');
};
$('#aiWrite').onclick = async () => {
  const s = await getSample(); if (!s) return toast(t('ai_off'));
  const c = WX[+$('#postCity').value]; const ta = $('#postText'); const draft = ta.value.trim(); ta.value = '…';
  const prompt = `Scrivi UNA frase (max 120 caratteri) in ${prefs.lang === 'en' ? 'inglese' : 'italiano'} per un post social sul meteo di adesso a ${c.n}: ${c.t}°C, ${wLabel(c.w)}, vento ${c.ws} km/h, pioggia oggi ${c.days[0][4]}%. Stile Instagram, vivace, 1 emoji, niente hashtag, niente virgolette.${draft ? ' Parti da questa idea dell\'utente: "' + draft + '"' : ''} Umore scelto: ${compMood.e}. Rispondi solo con la frase.`;
  try { const r = await s(prompt, { modelTier: 'quick', cache: false }); ta.value = r.text.trim().replace(/^["“]|["”]$/g, ''); } catch (e) { ta.value = draft; toast(e && e.code === 'not_granted' ? t('ai_consent') : t('ai_error')); }
};

/* ---------- share card ---------- */
function drawCard(i, p) {
  const c = WX[i]; const cv = $('#cardCanvas'); const ctx = cv.getContext('2d'); const W = cv.width, H = cv.height; const sc = score(c);
  const g = ctx.createLinearGradient(0, 0, W, H);
  const cols = c.w >= 95 ? ['#334155', '#0F172A'] : c.w >= 51 ? ['#475569', '#1E40AF'] : !c.day ? ['#312E81', '#0B1526'] : c.w === 0 ? ['#F59E0B', '#DB2777'] : ['#0EA5E9', '#1E3A8A'];
  g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 40; k++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.random() * 0.15) + ')'; ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = '600 22px Sora, Manrope, sans-serif'; ctx.fillText((p ? p.u : (prefs.nick || 'MeteoSocial')).toUpperCase(), W / 2, 90);
  ctx.font = '500 20px Manrope, sans-serif'; ctx.globalAlpha = .85; ctx.fillText(t('card_tag') + ' · ' + new Date().toLocaleDateString(prefs.lang === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'long' }), W / 2, 124); ctx.globalAlpha = 1;
  ctx.font = '200px serif'; ctx.fillText(isNightIcon(c.w, c.day), W / 2, 380);
  ctx.font = '700 150px Sora, Manrope, sans-serif'; ctx.fillText(T(c.t) + '°', W / 2, 560);
  ctx.font = '700 40px Sora, Manrope, sans-serif'; ctx.fillText(c.n, W / 2, 620);
  ctx.font = '500 26px Manrope, sans-serif'; ctx.globalAlpha = .9; ctx.fillText(wLabel(c.w) + ' · ' + t('min') + ' ' + T(c.days[0][3]) + '° / ' + t('max') + ' ' + T(c.days[0][2]) + '°', W / 2, 664); ctx.globalAlpha = 1;
  if (p) { ctx.font = '600 30px Sora, Manrope, sans-serif'; wrapText(ctx, '“' + ptext(p) + '”', W / 2, 740, W - 80, 38); }
  else { ctx.fillStyle = 'rgba(255,255,255,.16)'; roundRect(ctx, 70, 700, W - 140, 90, 24); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 34px Sora, Manrope, sans-serif'; ctx.fillText(sc.e + ' ' + t('score_h') + ' ' + sc.s + '/100', W / 2, 745); ctx.font = '500 22px Manrope, sans-serif'; ctx.fillText(sc.lbl, W / 2, 776); }
  ctx.font = '700 28px Sora, Manrope, sans-serif'; ctx.fillText('🌍 MeteoSocial', W / 2, H - 70);
  ctx.font = '500 18px Manrope, sans-serif'; ctx.globalAlpha = .8; ctx.fillText(prefs.lang === 'en' ? 'The world\'s weather, told by people' : 'Il meteo del mondo, raccontato da chi lo vive', W / 2, H - 40); ctx.globalAlpha = 1;
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrapText(ctx, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const test = line + w + ' '; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), x, y); line = w + ' '; y += lh; } else line = test; } ctx.fillText(line.trim(), x, y); }
function shareCard(i, p) { if (i < 0) i = selected; drawCard(i, p); $('#cardModal').classList.add('show'); }
window.shareCard = shareCard;
$('#cardSave').onclick = async () => {
  const cv = $('#cardCanvas'); const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  try { const d = window.claude && window.claude.use ? await window.claude.use('downloads') : null; if (d && d.save) { await d.save({ filename: 'meteosocial-card.png', data: blob }); return; } } catch {}
  try { if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'meteosocial.png', { type: 'image/png' })] })) { await navigator.share({ files: [new File([blob], 'meteosocial.png', { type: 'image/png' })], title: 'MeteoSocial' }); return; } } catch {}
  toast(t('card_note'));
};
$('#cardShare').onclick = async () => { const cv = $('#cardCanvas'); const blob = await new Promise(r => cv.toBlob(r, 'image/png')); const f = new File([blob], 'meteosocial.png', { type: 'image/png' }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'MeteoSocial', text: location.href.split('#')[0] }); return; } } catch {} share(); };

/* ---------- 3D weather scene ---------- */
let scene3d = null;
function mountScene(el, c) {
  if (!window.THREE) { el.innerHTML = ''; return; }
  if (scene3d) { scene3d.stop(); scene3d = null; }
  const cv = document.createElement('canvas'); el.appendChild(cv);
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(45, 2, 0.1, 100); cam.position.set(0, 0.6, 7);
  const code = c.w, day = !!c.day; const rainy = code >= 51 && code <= 82, snowy = code >= 71 && code <= 77 || code === 85 || code === 86, storm = code >= 95, cloudy = code >= 2 || rainy || storm;
  el.style.background = wxGrad(code, day);
  scene.add(new THREE.AmbientLight(0xffffff, day ? 0.8 : 0.4)); const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(3, 5, 4); scene.add(dl);
  // sun / moon
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), new THREE.MeshBasicMaterial({ color: day ? 0xffd166 : 0xf1f5f9 })); sunM.position.set(cloudy ? 2.6 : 0, 1.6, -2); scene.add(sunM);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), new THREE.MeshBasicMaterial({ color: day ? 0xffb703 : 0xcbd5e1, transparent: true, opacity: 0.18 })); halo.position.copy(sunM.position); scene.add(halo);
  // clouds
  const clouds = new THREE.Group(); if (cloudy) { const cm = new THREE.MeshLambertMaterial({ color: storm ? 0x64748b : 0xf8fafc }); const n = storm || rainy ? 4 : code === 3 ? 4 : 2; for (let k = 0; k < n; k++) { const g = new THREE.Group(); for (let j = 0; j < 5; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.45 + Math.random() * 0.4, 20, 20), cm); s.position.set((j - 2) * 0.55 + (Math.random() - .5) * 0.2, (Math.random() - .5) * 0.3, (Math.random() - .5) * 0.4); g.add(s); } g.position.set(-3 + k * 2.1, 0.6 + (k % 2) * 0.7, -1 + (k % 3) * 0.5); g.userData.v = 0.15 + Math.random() * 0.2; clouds.add(g); } } scene.add(clouds);
  // precipitation
  let pts = null; if (rainy || snowy || storm) { const N = snowy ? 500 : 1200; const arr = new Float32Array(N * 3); for (let k = 0; k < N; k++) { arr[k * 3] = (Math.random() - .5) * 10; arr[k * 3 + 1] = Math.random() * 6 - 2; arr[k * 3 + 2] = (Math.random() - .5) * 4; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3)); pts = new THREE.Points(g, new THREE.PointsMaterial({ color: snowy ? 0xffffff : 0xbfdbfe, size: snowy ? 0.09 : 0.05, transparent: true, opacity: 0.9 })); scene.add(pts); }
  // ground
  const ground = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshLambertMaterial({ color: snowy ? 0xf1f5f9 : day ? 0x4ade80 : 0x14532d, transparent: true, opacity: 0.55 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -2.6; scene.add(ground);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; let raf, flash = 0, t0 = performance.now();
  function resize() { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  function frame(now) {
    const tt = (now - t0) / 1000;
    if (!reduce) { clouds.children.forEach(g => { g.position.x += g.userData.v * 0.016; if (g.position.x > 5) g.position.x = -5; }); sunM.rotation.y += 0.01; halo.scale.setScalar(1 + 0.05 * Math.sin(tt * 2)); }
    if (pts && !reduce) { const a = pts.geometry.attributes.position.array; for (let k = 1; k < a.length; k += 3) { a[k] -= snowy ? 0.02 : 0.12; if (snowy) a[k - 1] += Math.sin(tt + k) * 0.003; if (a[k] < -2.2) a[k] = 4; } pts.geometry.attributes.position.needsUpdate = true; }
    if (storm) { if (Math.random() < 0.01) flash = 1; if (flash > 0) { scene.background = new THREE.Color(0xffffff).multiplyScalar(flash); flash -= 0.1; } else scene.background = null; }
    cam.position.x = Math.sin(tt * 0.2) * 0.4; cam.lookAt(0, 0.2, 0);
    renderer.render(scene, cam); raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  scene3d = { stop() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); cv.remove(); } };
}

/* ---------- weather view extras ---------- */
const baseRenderWeather = renderWeather;
renderWeather = function () {
  baseRenderWeather();
  const c = WX[selected]; const wrap = $('#weatherWrap'); const grid = wrap.querySelector('.grid'); const sc = score(c);
  const lead = WX.map((x, i) => ({ i, s: score(x).s })).sort((a, b) => b.s - a.s).slice(0, 8);
  const extra = document.createElement('div'); extra.className = 'grid'; extra.style.marginTop = '14px';
  extra.innerHTML = `
    <div class="panel" style="grid-column:1/-1"><h3>${t('scene_h')} <small>${wLabel(c.w)}</small></h3><div class="scene3d" id="scene3d" style="margin-top:8px"><span class="cap">${isNightIcon(c.w, c.day)} ${esc(c.n)} · ${T(c.t)}°</span></div></div>
    <div class="panel"><h3>${t('score_h')}</h3><div class="score" style="margin-top:10px"><div class="ringv" style="--p:${sc.s}"><b class="num">${sc.s}</b></div><div><div class="lbl">${sc.e} ${sc.lbl}</div><div class="why">${sc.why}</div><button class="ib primary" id="mkCard" style="margin-top:8px">📸 ${t('card_btn')}</button></div></div>
      <h3 style="margin-top:16px">${t('vs_h')}</h3><div class="vs"><select id="vsA"></select><span class="v">VS</span><select id="vsB"></select><div class="res" id="vsRes"></div></div></div>
    <div class="panel"><h3>${t('lead_h')}</h3><div class="lead">${lead.map((l, k) => `<button data-i="${l.i}"><span class="pos">${k + 1}</span><span>${wIcon(WX[l.i].w)} ${esc(WX[l.i].n)} <small style="color:var(--ink3)">${T(WX[l.i].t)}°</small></span><span class="sc num">${l.s}</span></button>`).join('')}</div></div>`;
  grid.insertAdjacentElement('afterend', extra);
  // move the 3D scene right after the hero for impact
  wrap.querySelector('.hero').insertAdjacentElement('afterend', extra.firstElementChild);
  mountScene($('#scene3d'), c);
  $('#mkCard').onclick = () => shareCard(selected);
  extra.querySelectorAll('.lead button').forEach(b => b.onclick = () => selectCity(+b.dataset.i, 'weather'));
  const A = $('#vsA'), B = $('#vsB'); fillCitySelect(A, selected); fillCitySelect(B, prefs.home === selected ? (selected + 1) % WX.length : prefs.home);
  const vs = () => { const a = WX[+A.value], b = WX[+B.value]; const sa = score(a).s, sb = score(b).s; $('#vsRes').textContent = sa === sb ? t('vs_tie') : `🏆 ${sa > sb ? a.n : b.n} ${t('vs_win')} (${Math.max(sa, sb)} vs ${Math.min(sa, sb)})`; };
  A.onchange = vs; B.onchange = vs; vs();
};
const baseShow = show;
show = function (v) { if (v !== 'weather' && scene3d) { scene3d.stop(); scene3d = null; } baseShow(v); $('#fab').classList.toggle('hidden', v !== 'community'); };

/* ---------- globe: day/night + clouds + storm pulses ---------- */
(function globeExtras() {
  const G = window.__globe; if (!G) return; const { scene, group, sun, markers, R, THREE } = G;
  // sun direction from current UTC time (subsolar point)
  const now = new Date(); const doy = Math.floor((now - new Date(Date.UTC(now.getUTCFullYear(), 0, 0))) / 864e5); const decl = 23.44 * Math.sin(2 * Math.PI * (284 + doy) / 365) * Math.PI / 180; const hours = now.getUTCHours() + now.getUTCMinutes() / 60; const subLon = (12 - hours) * 15;
  const phi = Math.PI / 2 - decl, th = (subLon + 180) * Math.PI / 180; const dir = new THREE.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(10);
  const sunHolder = new THREE.Group(); scene.remove(sun); sunHolder.add(sun); sun.position.copy(dir); group.add(sunHolder); // rotates with earth so night side stays geographic
  // clouds layer
  const cc = document.createElement('canvas'); cc.width = 1024; cc.height = 512; const cx = cc.getContext('2d'); cx.clearRect(0, 0, 1024, 512);
  for (let k = 0; k < 260; k++) { const x = Math.random() * 1024, y = 60 + Math.random() * 392, r = 15 + Math.random() * 45; const g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = g; cx.fillRect(x - r, y - r, r * 2, r * 2); }
  const cloudTex = new THREE.CanvasTexture(cc); const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 64, 48), new THREE.MeshLambertMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false })); group.add(clouds);
  // storm markers
  markers.forEach(m => { const c = WX[m.userData.i]; if (c.w >= 95) { m.material = new THREE.MeshBasicMaterial({ color: 0xf87171 }); m.userData.ring.material.color.set(0xf87171); m.userData.storm = true; } });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function tick() { if (!reduce) clouds.rotation.y += 0.0004; markers.forEach(m => { if (m.userData.storm) { const s = 1 + 0.6 * Math.abs(Math.sin(performance.now() / 350)); m.userData.ring.scale.setScalar(s); m.userData.ring.material.opacity = 0.9 - (s - 1) * 0.7; } }); requestAnimationFrame(tick); })();
})();

/* ---------- AI upgrades ---------- */
const PERSONA = {
  friend: { it: 'Tono: amico simpatico, caldo, diretto, qualche emoji.', en: 'Tone: friendly, warm, direct, a few emojis.' },
  snark: { it: 'Tono: sarcastico e ironico stile CARROT Weather, battute pungenti ma mai offensive, sempre utile alla fine.', en: 'Tone: snarky and witty like CARROT Weather, sharp jokes but never offensive, always useful in the end.' },
  pro: { it: 'Tono: meteorologo professionista, preciso, spiega le cause (fronti, umidità, pressione) in modo semplice.', en: 'Tone: professional meteorologist, precise, explains causes (fronts, humidity, pressure) simply.' },
};
$('#persona').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; persona = b.dataset.p; LS.set('persona', persona); $$('#persona .chip').forEach(x => x.classList.toggle('on', x === b)); };
$$('#persona .chip').forEach(x => x.classList.toggle('on', x.dataset.p === persona));
const baseAiContext = aiContext;
aiContext = function () {
  const h = WX[prefs.home], s = WX[selected];
  const hrs = c => c.hours.slice(0, 8).map(x => `${x[0]} ${x[1]}° ${x[2]}%`).join(', ');
  return baseAiContext() + `\n${PERSONA[persona][prefs.lang === 'en' ? 'en' : 'it']}\nOre dettagliate ${h.n}: ${hrs(h)}. Ore dettagliate ${s.n}: ${hrs(s)}. Meteo Score (0-100, giornata perfetta) ${h.n}: ${score(h).s}, ${s.n}: ${score(s).s}.\nL'utente si chiama ${prefs.nick || 'amico'}. Puoi usare lo strumento openCity per portarlo alla scheda meteo di una città se lo chiede o se è utile (es. "portami a Tokyo").`;
};
renderChips = function () { $('#chatChips').innerHTML = ['c1', 'ai_wear', 'ai_caption', 'c2', 'ai_plan', 'ai_fun', 'c4'].map(k => `<button class="chip">${t(k)}</button>`).join(''); $$('#chatChips .chip').forEach(b => b.onclick = () => { $('#chatIn').value = b.textContent; $('#chatForm').requestSubmit(); }); };
renderChips();
$('#chatForm').onsubmit = async e => {
  e.preventDefault(); const inp = $('#chatIn'); const txt = inp.value.trim(); if (!txt) return; inp.value = '';
  chatAdd('user', txt); chatHist.push({ role: 'user', content: txt });
  const s = await getSample(); if (!s) { chatAdd('ai', t('ai_off')); return; }
  const bubble = chatAdd('ai', t('ai_thinking'));
  const turns = chatHist.map((m, k) => k === 0 ? { role: 'user', content: aiContext() + '\n\nDomanda: ' + m.content } : m);
  let tools; try { const lim = await s.limits(); if (lim && lim.tools) tools = [{ name: 'openCity', description: 'Apre nell\'app la scheda meteo di una città tra quelle disponibili (nome esatto in italiano).', inputSchema: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] }, execute: ({ city }) => { const i = WX.findIndex(c => c.n.toLowerCase() === String(city).toLowerCase()); if (i < 0) return { ok: false, available: WX.map(c => c.n) }; selectCity(i); toast('📍 ' + WX[i].n); return { ok: true, city: WX[i].n, temp: WX[i].t }; } }]; } catch {}
  try { const r = await s(turns, Object.assign({ cache: false, onText: ({ text }) => { bubble.textContent = text; $('#chatLog').scrollTop = 1e9; } }, tools ? { tools, modelTier: 'quick' } : {})); bubble.textContent = r.text; chatHist.push({ role: 'assistant', content: r.text }); }
  catch (err) { bubble.textContent = err && err.code === 'not_granted' ? t('ai_consent') : (err && err.text) || t('ai_error'); chatHist.pop(); }
  if (chatHist.length > 12) chatHist.splice(0, chatHist.length - 12);
  while (chatHist.length && chatHist[0].role !== 'user') chatHist.shift();
};

/* ---------- profile level ---------- */
const baseRenderProfile = renderProfile;
renderProfile = function () { baseRenderProfile(); const [e, n] = reporterLevel(); const st = $('#profStats'); if (!st.querySelector('.level')) st.insertAdjacentHTML('beforeend', ` <span class="level">${e} ${t('level')} ${n}</span>`); };

const baseCityCard = cityCard;
cityCard = function (i, el) { baseCityCard(i, el); const b = el.querySelector('[data-go="community"]'); if (b) b.onclick = e => { e.stopPropagation(); selectCity(i, 'community'); openComposer(i); }; };
/* boot extras */
applyLang();
if (currentView === 'community') renderFeed();
