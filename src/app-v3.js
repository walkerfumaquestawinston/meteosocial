/* ===== MeteoSocial v3: photo & video posts, AI everywhere, 3D city cards, visual polish ===== */
Object.assign(I18N.it, {
  add_photo: 'Foto', add_video: 'Video', remove_media: 'Rimuovi', media_big: 'Video troppo grande (max 25 MB)', video_local: 'Video sul dispositivo dell\'autore', ai_btn: 'IA', ai_city_q: 'Cosa dice l\'IA su questa città',
  ai_comm_sum: 'Riassunto community', ai_reply: 'Suggerisci risposta', ai_tip: 'Consiglio del giorno', ai_tip_btn: 'Chiedi all\'IA', photo_hint: 'Una foto vale più di mille parole: mostra il tuo cielo 📸', tap_photo: 'Tocca per ingrandire',
  ai_globe_hint: 'Tocca una città, poi chiedi all\'IA', photos_h: 'Foto dal mondo', no_photos: 'Ancora nessuna foto: sii il primo a mostrare il tuo cielo.', lang_menu: 'Lingua', see_more: 'Vedi', media_saved: 'Media aggiunto',
});
Object.assign(I18N.en, {
  add_photo: 'Photo', add_video: 'Video', remove_media: 'Remove', media_big: 'Video too large (max 25 MB)', video_local: 'Video on the author\'s device', ai_btn: 'AI', ai_city_q: 'What the AI says about this city',
  ai_comm_sum: 'Community summary', ai_reply: 'Suggest a reply', ai_tip: 'Tip of the day', ai_tip_btn: 'Ask the AI', photo_hint: 'A photo is worth a thousand words: show your sky 📸', tap_photo: 'Tap to enlarge',
  ai_globe_hint: 'Tap a city, then ask the AI', photos_h: 'Photos from the world', no_photos: 'No photos yet: be the first to show your sky.', lang_menu: 'Language', see_more: 'See', media_saved: 'Media added',
});

/* ---------- styles v3 ---------- */
(function () {
  const css = `
  .top{background:linear-gradient(180deg,color-mix(in srgb,var(--bg2) 92%,var(--accent)),var(--bg2));box-shadow:0 1px 0 var(--line),0 8px 30px rgba(0,0,0,.08)}
  .nav button.active{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent),0 6px 18px color-mix(in srgb,var(--accent) 22%,transparent)}
  .nav button{transition:transform .15s,background .2s}.nav button:active{transform:scale(.95)}
  .ib,.chip,.tag{transition:transform .12s,border-color .15s,background .2s}.ib:active,.chip:active{transform:scale(.96)}
  .ib.primary{box-shadow:0 6px 16px color-mix(in srgb,var(--accent) 30%,transparent)}
  .stage::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 50% 0%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%)}
  .panel,.post,.card-float,.composer{box-shadow:0 10px 30px rgba(3,10,25,.10)}
  .hero{background-size:200% 200%;animation:heroShift 18s ease-in-out infinite alternate}
  @keyframes heroShift{from{background-position:0% 0%}to{background-position:100% 100%}}
  .reel{animation:reelIn .5s ease both}@keyframes reelIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .reel .media{position:absolute;inset:0;z-index:0}
  .reel .media img,.reel .media video{width:100%;height:100%;object-fit:cover;display:block}
  .reel .media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.65) 100%)}
  .reel.hasmedia{min-height:560px}.reel.hasmedia .bgsym{display:none}.reel.hasmedia canvas.fx{opacity:.7;z-index:1}
  .reel .vlocal{position:absolute;left:16px;top:62px;z-index:2;font-size:11px;background:rgba(0,0,0,.4);padding:4px 8px;border-radius:999px}
  .post .pimg{width:100%;max-height:360px;object-fit:cover;border-radius:12px;margin-top:10px;cursor:zoom-in}
  .mediarow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}
  .mediarow .prev{position:relative;width:96px;height:96px;border-radius:12px;overflow:hidden;background:var(--surface2)}
  .mediarow .prev img,.mediarow .prev video{width:100%;height:100%;object-fit:cover}
  .mediarow .prev button{position:absolute;right:4px;top:4px;background:rgba(0,0,0,.6);color:#fff;border-radius:999px;width:24px;height:24px;font-size:12px}
  .aiinline{margin-top:10px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 14%,var(--surface2)),var(--surface2));border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);border-radius:12px;padding:10px 12px;font-size:13px;white-space:pre-wrap;display:none}
  .aiinline.show{display:block}
  .aiinline b.t{display:block;font-family:Sora;font-size:12px;color:var(--accent);margin-bottom:4px}
  .minis{height:120px;border-radius:12px;overflow:hidden;margin-top:10px;position:relative}
  .minis canvas{width:100%;height:100%;display:block}
  .lightbox{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:70;display:none;place-items:center;padding:16px}
  .lightbox.show{display:grid}.lightbox img,.lightbox video{max-width:100%;max-height:90vh;border-radius:12px}
  .lightbox button{position:absolute;right:16px;top:16px}
  .photowall{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin-top:8px}
  .photowall button{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:var(--surface2)}
  .photowall img{width:100%;height:100%;object-fit:cover}
  .photowall span{position:absolute;left:6px;bottom:6px;font-size:11px;color:#fff;text-shadow:0 1px 4px #000;font-weight:700}
  .globe-ai{position:absolute;left:16px;bottom:16px;right:16px;pointer-events:none;display:flex;justify-content:center}
  .intro .box{background:linear-gradient(160deg,var(--surface),color-mix(in srgb,var(--surface) 85%,var(--accent)))}
  .intro .logo .mark{width:44px;height:44px;animation:spin 14s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

/* ---------- AI helper ---------- */
async function aiInto(el, prompt, opts) {
  el.classList.add('show'); el.innerHTML = `<b class="t">✦ MeteoSocial AI</b><span>${t('ai_thinking')}</span>`;
  const s = await getSample(); if (!s) { el.querySelector('span').textContent = t('ai_off'); return null; }
  const span = el.querySelector('span');
  try { const r = await s(prompt, Object.assign({ modelTier: 'quick', onText: ({ text }) => { span.textContent = text; } }, opts || {})); span.textContent = r.text; return r.text; }
  catch (e) { span.textContent = e && e.code === 'not_granted' ? t('ai_consent') : t('ai_error'); return null; }
}
const langWord = () => prefs.lang === 'en' ? 'inglese' : 'italiano';
const cityBrief = c => `${c.n} (${c.c}): ora ${c.t}°C (percepiti ${c.ta}), ${wLabel(c.w)}, umidità ${c.h}%, vento ${c.ws} km/h, UV ${c.uv}; prossime ore ${c.hours.slice(0, 6).map(h => `${h[0]} ${h[1]}° ${h[2]}%`).join(', ')}; oggi ${c.days[0][3]}-${c.days[0][2]}° pioggia ${c.days[0][4]}%, domani ${wLabel(c.days[1][1])} ${c.days[1][3]}-${c.days[1][2]}° pioggia ${c.days[1][4]}%; Meteo Score ${score(c).s}/100`;

/* ---------- media store (video local via IndexedDB, photos as data URLs) ---------- */
const MDB = {
  db: null,
  open() { if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { const r = indexedDB.open('meteosocial', 1); r.onupgradeneeded = () => r.result.createObjectStore('media'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async put(k, blob) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('media', 'readwrite'); tx.objectStore('media').put(blob, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
  async get(k) { try { const db = await this.open(); return await new Promise((res, rej) => { const tx = db.transaction('media'); const q = tx.objectStore('media').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); } catch { return null; } },
  async del(k) { try { const db = await this.open(); db.transaction('media', 'readwrite').objectStore('media').delete(k); } catch {} }
};
const vidURL = new Map();
async function videoSrc(id) { if (vidURL.has(id)) return vidURL.get(id); const b = await MDB.get('v_' + id); const u = b ? URL.createObjectURL(b) : null; vidURL.set(id, u); return u; }
function shrinkImage(file, max, q) { return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(img.src); res(cv.toDataURL('image/jpeg', q)); }; img.onerror = rej; img.src = URL.createObjectURL(file); }); }
function videoPoster(file) { return new Promise(res => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = URL.createObjectURL(file); v.onloadeddata = () => { v.currentTime = Math.min(0.5, v.duration / 3 || 0); }; v.onseeked = () => { const s = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight)); const cv = document.createElement('canvas'); cv.width = Math.round(v.videoWidth * s); cv.height = Math.round(v.videoHeight * s); cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height); URL.revokeObjectURL(v.src); res(cv.toDataURL('image/jpeg', 0.7)); }; v.onerror = () => res(null); }); }
let compMedia = null; // {img} | {vid: File, poster}

/* ---------- composer: photo/video ---------- */
(function () {
  const row = $('#composer .row'); const media = document.createElement('div'); media.className = 'mediarow'; media.id = 'mediaRow';
  media.innerHTML = `<input type="file" id="fPhoto" accept="image/*" hidden><input type="file" id="fVideo" accept="video/*" hidden>
    <button class="ib" id="btnPhoto">📷 <span data-i18n="add_photo">${t('add_photo')}</span></button><button class="ib" id="btnVideo">🎥 <span data-i18n="add_video">${t('add_video')}</span></button><span class="note" style="margin:0" id="mediaHint" data-i18n="photo_hint">${t('photo_hint')}</span><div id="mediaPrev"></div>`;
  row.insertAdjacentElement('beforebegin', media);
  $('#btnPhoto').onclick = () => $('#fPhoto').click(); $('#btnVideo').onclick = () => $('#fVideo').click();
  function preview() { const p = $('#mediaPrev'); if (!compMedia) { p.innerHTML = ''; return; } p.innerHTML = `<div class="prev">${compMedia.img ? `<img src="${compMedia.img}" alt="">` : `<img src="${compMedia.poster || ''}" alt=""><span style="position:absolute;left:6px;bottom:4px;color:#fff;font-size:11px;font-weight:700;text-shadow:0 1px 3px #000">🎥</span>`}<button data-rm aria-label="${t('remove_media')}">✕</button></div>`; p.querySelector('[data-rm]').onclick = () => { compMedia = null; preview(); }; }
  $('#fPhoto').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { compMedia = { img: await shrinkImage(f, 760, 0.68) }; toast(t('media_saved')); } catch { compMedia = null; } e.target.value = ''; preview(); };
  $('#fVideo').onchange = async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 25e6) { toast(t('media_big')); e.target.value = ''; return; } const poster = await videoPoster(f); compMedia = { vid: f, poster }; e.target.value = ''; preview(); toast(t('media_saved')); };
  window.__previewMedia = preview;
})();
// wrap post button to attach media
(function () {
  const btn = $('#postBtn'); const base = btn.onclick;
  btn.onclick = async () => {
    const txt = $('#postText').value.trim(); if (txt.length < 3 && !compMedia) return toast(t('post_short'));
    if (txt.length < 3) $('#postText').value = compMedia.img ? '📸' : '🎥';
    const m = compMedia; compMedia = null; window.__previewMedia();
    // temporarily hook publishState/localPosts by pre-building the post ourselves
    const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), u: prefs.nick || t('you'), city: WX[+$('#postCity').value].n, t: $('#postText').value.trim(), tag: compMood.t, e: compMood.e, ts: Date.now(), likes: 0, re: {}, com: [] };
    if (m && m.img) p.img = m.img;
    if (m && m.vid) { p.vid = 1; p.poster = m.poster; await MDB.put('v_' + p.id, m.vid); }
    $('#postText').value = ''; $('#composer').classList.remove('show');
    const ok = await publishState(p);
    if (!ok) { localPosts.unshift({ ...p, local: true, mine: true }); LS.set('localPosts', localPosts); toast(t('saved_local')); } else toast(t('published'));
    postTag = compMood.t; renderAll(); if (currentView !== 'community') show('community');
  };
})();
// keep published HTML under size limits: drop images from oldest posts beyond ~5.5MB
const baseBuildHTML = buildHTML;
buildHTML = function () {
  let budget = 5.5e6; const posts = stateDoc.posts.slice(0, 300).map(p => ({ ...p }));
  for (const p of posts) { const sz = (p.img || '').length + (p.poster || '').length; if (sz > budget) { delete p.img; delete p.poster; } else budget -= sz; }
  const json = JSON.stringify({ posts }).replace(/<\//g, '<\\/');
  return TEMPLATE.replace(/<script type="application\/json" id="state">[\s\S]*?<\/script>/, `<script type="application/json" id="state">${json}<\/script>`);
};

/* ---------- reels/list with media + AI reply ---------- */
const baseReelHTML = reelHTML;
reelHTML = function (p) {
  let h = baseReelHTML(p);
  const media = p.img ? `<div class="media"><img src="${p.img}" alt="" loading="lazy" data-zoom></div>` : p.vid ? `<div class="media" data-vid="${esc(p.id)}"><img src="${p.poster || ''}" alt=""></div>` : '';
  if (media) h = h.replace('<canvas class="fx"', media + '<canvas class="fx"').replace('class="reel ', 'class="reel hasmedia ');
  h = h.replace('<button data-share>', `<button data-ai title="${t('ai_reply')}"><span class="i">✦</span><span>${t('ai_btn')}</span></button><button data-share>`);
  h = h.replace('<form>', `<div class="aiinline" data-aibox></div><form>`);
  return h;
};
const basePostHTML = postHTML;
postHTML = function (p) { let h = basePostHTML(p); if (p.img) h = h.replace('<div class="acts">', `<img class="pimg" src="${p.img}" alt="" loading="lazy" data-zoom><div class="acts">`); else if (p.vid) h = h.replace('<div class="acts">', `<img class="pimg" src="${p.poster || ''}" alt="" data-vid="${esc(p.id)}"><div class="acts">`); return h; };
const baseBind = bindPostActions;
bindPostActions = function (root) {
  baseBind(root);
  root.querySelectorAll('[data-zoom]').forEach(img => img.onclick = () => openLightbox(img.src));
  root.querySelectorAll('.media[data-vid], .pimg[data-vid]').forEach(async el => { const id = el.dataset.vid; const u = await videoSrc(id); if (u) { if (el.classList.contains('media')) { el.innerHTML = `<video src="${u}" autoplay muted loop playsinline></video>`; el.onclick = () => openLightbox(u, true); } else { el.onclick = () => openLightbox(u, true); } } else { const art = el.closest('.reel'); if (art && !art.querySelector('.vlocal')) art.insertAdjacentHTML('beforeend', `<span class="vlocal">🎥 ${t('video_local')}</span>`); } });
  root.querySelectorAll('[data-ai]').forEach(b => b.onclick = async () => { const art = b.closest('.reel, .post'); const id = art.dataset.id; const p = allPosts().find(x => x.id === id); if (!p) return; const c = WX[cityByName(p.city)]; const box = art.querySelector('[data-aibox]'); const cb = art.querySelector('.cbox'); if (cb) cb.classList.add('show'); const txt = await aiInto(box, `Sei l'assistente di MeteoSocial. Un utente (${p.u}) ha scritto da ${p.city}: "${ptext(p)}" (tag ${p.tag}${p.img ? ', con foto' : ''}). Dati reali: ${c ? cityBrief(c) : 'n/d'}. Scrivi in ${langWord()} una risposta amichevole di 1-2 frasi da lasciare come commento, utile e naturale, con al massimo 1 emoji. Rispondi solo con il commento.`); if (txt && cb) { const inp = cb.querySelector('input'); if (inp && !inp.value) inp.value = txt.trim().replace(/^["“]|["”]$/g, ''); } });
};
function openLightbox(src, isVideo) { let lb = $('#lightbox'); if (!lb) { lb = document.createElement('div'); lb.className = 'lightbox'; lb.id = 'lightbox'; document.body.appendChild(lb); lb.onclick = e => { if (e.target === lb || e.target.closest('[data-close]')) { lb.classList.remove('show'); lb.innerHTML = ''; } }; } lb.innerHTML = (isVideo ? `<video src="${src}" controls autoplay playsinline></video>` : `<img src="${src}" alt="">`) + `<button class="ib" data-close>✕</button>`; lb.classList.add('show'); }

/* ---------- community: AI summary + photo wall ---------- */
(function () {
  const head = $('#v-community .feedhead');
  const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px';
  bar.innerHTML = `<button class="chip" id="aiComm">✦ <span data-i18n="ai_comm_sum">${t('ai_comm_sum')}</span></button><button class="chip" id="wallBtn">🖼️ <span data-i18n="photos_h">${t('photos_h')}</span></button>`;
  head.insertAdjacentElement('afterend', bar);
  const box = document.createElement('div'); box.className = 'aiinline'; box.id = 'aiCommBox'; box.style.marginBottom = '10px'; bar.insertAdjacentElement('afterend', box);
  const wall = document.createElement('div'); wall.className = 'panel hidden'; wall.id = 'wall'; wall.style.marginBottom = '12px'; box.insertAdjacentElement('afterend', wall);
  $('#aiComm').onclick = () => { const posts = allPosts().slice(0, 15).map(p => `[${p.u} @${p.city} ${t('t_' + p.tag)}${p.img ? ' 📸' : ''}] ${ptext(p)}`).join('\n'); aiInto(box, `Sei l'assistente di MeteoSocial. Riassumi in ${langWord()} in massimo 4 frasi cosa sta succedendo nella community (dove piove, dove fa caldo, cosa segnalano le persone), citando 2-3 città. Poi una frase che inviti a pubblicare. Segnalazioni:\n${posts}\nDati reali città principali: ${[WX[prefs.home], WX[selected]].map(cityBrief).join(' | ')}`); };
  $('#wallBtn').onclick = () => { const ps = allPosts().filter(p => p.img || p.poster); wall.classList.toggle('hidden'); if (wall.classList.contains('hidden')) return; wall.innerHTML = `<h3>${t('photos_h')} <small>${ps.length}</small></h3>` + (ps.length ? `<div class="photowall">${ps.map(p => `<button data-id="${esc(p.id)}"><img src="${p.img || p.poster}" alt=""><span>📍 ${esc(p.city)}</span></button>`).join('')}</div>` : `<div class="empty">${t('no_photos')}</div>`); wall.querySelectorAll('button[data-id]').forEach(b => b.onclick = () => { const p = allPosts().find(x => x.id === b.dataset.id); if (p) openLightbox(p.img || p.poster); }); };
})();

/* ---------- city card: mini 3D + AI ---------- */
let cardScene = null;
const baseCityCard2 = cityCard;
cityCard = function (i, el) {
  baseCityCard2(i, el); const c = WX[i];
  el.insertAdjacentHTML('beforeend', `<div class="minis" id="minis-${el.id}"></div><button class="ib" data-ai style="margin-top:8px">✦ ${t('ai_city_q')}</button><div class="aiinline" data-aibox></div>`);
  const mini = el.querySelector('.minis');
  try { if (cardScene) { cardScene.stop(); cardScene = null; } const prev = scene3d; scene3d = null; mountScene(mini, c); cardScene = scene3d; scene3d = prev; } catch {}
  el.querySelector('[data-ai]').onclick = () => aiInto(el.querySelector('[data-aibox]'), `Sei l'assistente di MeteoSocial. In ${langWord()}, 3 frasi massimo, tono amichevole: com'è il meteo adesso e nelle prossime ore a ${c.n}, un consiglio pratico (vestiti/ombrello/attività) e una curiosità sulla città legata al clima. Dati reali: ${cityBrief(c)}.`);
  const closeBtn = el.querySelector('[data-close]'); if (closeBtn) closeBtn.addEventListener('click', () => { if (cardScene) { cardScene.stop(); cardScene = null; } });
};

/* ---------- profile: AI tip ---------- */
(function () {
  const panel = $('#v-profile .panel'); const div = document.createElement('div'); div.className = 'field';
  div.innerHTML = `<label>✦ ${t('ai_tip')}</label><button class="ib primary" id="aiTip" style="align-self:flex-start">${t('ai_tip_btn')}</button><div class="aiinline" id="aiTipBox"></div>`;
  panel.appendChild(div);
  $('#aiTip').onclick = () => { const c = WX[prefs.home]; const mine = allPosts().filter(p => p.u === prefs.nick && !p.seed).length; aiInto($('#aiTipBox'), `Sei l'assistente di MeteoSocial. L'utente ${prefs.nick || 'amico'} vive a ${c.n} e ha pubblicato ${mine} segnalazioni. In ${langWord()}, scrivi 3 frasi: un consiglio per oggi basato sul meteo, un'idea di contenuto (foto/video) da pubblicare nella community, e un incoraggiamento breve. Dati reali: ${cityBrief(c)}.`); };
})();

/* ---------- globe hint ---------- */
(function () { const s = $('#v-globe'); const d = document.createElement('div'); d.className = 'globe-ai'; d.innerHTML = `<span class="chip">✦ ${t('ai_globe_hint')}</span>`; s.appendChild(d); setTimeout(() => d.remove(), 12000); })();

/* ---------- weather view: photos of this city ---------- */
const baseRenderWeather3 = renderWeather;
renderWeather = function () {
  baseRenderWeather3(); const c = WX[selected]; const ps = allPosts().filter(p => p.city === c.n && (p.img || p.poster)).slice(0, 8); if (!ps.length) return;
  const wrap = $('#weatherWrap'); const panel = document.createElement('div'); panel.className = 'panel'; panel.style.marginTop = '14px';
  panel.innerHTML = `<h3>📸 ${t('photos_h')} · ${esc(c.n)}</h3><div class="photowall">${ps.map(p => `<button data-id="${esc(p.id)}"><img src="${p.img || p.poster}" alt=""><span>${esc(p.u)}</span></button>`).join('')}</div>`;
  wrap.querySelector('.hero').insertAdjacentElement('afterend', panel);
  panel.querySelectorAll('button[data-id]').forEach(b => b.onclick = () => { const p = allPosts().find(x => x.id === b.dataset.id); if (p) openLightbox(p.img || p.poster); });
};

/* ---------- global error guard ---------- */
window.addEventListener('error', e => { console.warn('MeteoSocial error:', e.message); });
applyLang();
