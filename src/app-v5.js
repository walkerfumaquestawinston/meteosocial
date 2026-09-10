/* ===== MeteoSocial v5: sharper Earth with city labels, world tour, hail map layer, real social (profiles, bookmarks, mentions, comment likes, edit/hide/report, post links, notifications), AI with voice & translation, cinematic visuals ===== */
Object.assign(I18N.it, {
  layer_hail: 'Grandine', tour: 'Giro del mondo', tour_stop: 'Ferma il giro', labels: 'Nomi città', saved: 'Salvati', save: 'Salva', unsave: 'Salvato', more: 'Altro', edit: 'Modifica', hide: 'Nascondi', report: 'Segnala abuso', copy_link: 'Copia link del post', link_copied: 'Link del post copiato',
  reported: 'Grazie, segnalazione ricevuta: il post è stato nascosto.', notif: 'Notifiche', no_notif: 'Nessuna novità', n_new: 'nuova segnalazione da', n_comment: 'ha commentato il tuo post', translate: 'Traduci', speak: 'Leggi ad alta voce', mic: 'Parla', listening: 'Ti ascolto…', voice_unsup: 'Dettatura non supportata da questo browser',
  user_posts: 'Post', user_likes: 'Cuori', close: 'Chiudi', edited: 'modificato', save_edit: 'Salva modifiche', hail_prob: 'grandine possibile', hail_none: 'Nessuna grandine prevista nelle prossime ore', legend_hail: 'Città con temporali e grandine nelle prossime 12 ore',
  tips_globe: 'Colori = temperatura · rosso pulsante = temporale · lato scuro = notte reale', mention_hint: 'Usa @nome per menzionare, #tag per gli argomenti',
});
Object.assign(I18N.en, {
  layer_hail: 'Hail', tour: 'World tour', tour_stop: 'Stop tour', labels: 'City names', saved: 'Saved', save: 'Save', unsave: 'Saved', more: 'More', edit: 'Edit', hide: 'Hide', report: 'Report abuse', copy_link: 'Copy post link', link_copied: 'Post link copied',
  reported: 'Thanks, report received: the post has been hidden.', notif: 'Notifications', no_notif: 'Nothing new', n_new: 'new report from', n_comment: 'commented on your post', translate: 'Translate', speak: 'Read aloud', mic: 'Speak', listening: 'Listening…', voice_unsup: 'Dictation not supported by this browser',
  user_posts: 'Posts', user_likes: 'Hearts', close: 'Close', edited: 'edited', save_edit: 'Save changes', hail_prob: 'hail possible', hail_none: 'No hail expected in the next hours', legend_hail: 'Cities with thunderstorms and hail in the next 12 hours',
  tips_globe: 'Colors = temperature · pulsing red = storm · dark side = real night', mention_hint: 'Use @name to mention, #tag for topics',
});
prefs.saved = prefs.saved || []; prefs.hidden = prefs.hidden || []; prefs.voice = !!prefs.voice;

/* ---------- styles v5 ---------- */
(function () {
  const css = `
  #v-globe .stage{background:radial-gradient(ellipse at 50% 70%,#0b1a33 0%,#050a16 60%,#02050c 100%)}
  #v-globe .stage::before{content:"";position:absolute;inset:-20%;background:radial-gradient(40% 30% at 20% 30%,rgba(56,189,248,.18),transparent 70%),radial-gradient(35% 30% at 80% 20%,rgba(108,140,255,.16),transparent 70%),radial-gradient(30% 25% at 60% 85%,rgba(74,222,128,.10),transparent 70%);animation:aurora 22s ease-in-out infinite alternate;pointer-events:none}
  @keyframes aurora{0%{transform:translate(0,0) rotate(0deg)}100%{transform:translate(4%,-3%) rotate(6deg)}}
  :root[data-theme="light"] #v-globe .stage{background:radial-gradient(ellipse at 50% 70%,#dbe8f7 0%,#eef3f9 60%,#e3eaf3 100%)}
  @media (prefers-color-scheme: light){:root:not([data-theme="dark"]) #v-globe .stage{background:radial-gradient(ellipse at 50% 70%,#dbe8f7 0%,#eef3f9 60%,#e3eaf3 100%)}}
  .glass{background:color-mix(in srgb,var(--surface) 72%,transparent)!important;backdrop-filter:blur(14px) saturate(1.3);border:1px solid color-mix(in srgb,var(--line) 70%,transparent)!important}
  .card-float{animation:cardIn .35s cubic-bezier(.2,.9,.3,1.2)}@keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
  .bell{position:relative}.bell .n{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:999px;background:var(--storm);color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center;padding:0 4px}
  .notifs{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}
  .notifs button{display:flex;gap:10px;align-items:center;text-align:left;padding:10px;border-radius:12px;background:var(--surface2)}
  .notifs .when{font-size:11px;color:var(--ink3);margin-left:auto;white-space:nowrap}
  .mention{color:var(--accent);font-weight:700;cursor:pointer}.reel .mention{color:#FDE68A}
  .menu{position:absolute;right:12px;top:56px;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:6px;z-index:8;display:flex;flex-direction:column;min-width:190px}
  .menu button{text-align:left;padding:8px 10px;border-radius:8px;color:var(--ink);font-size:13px}.menu button:hover{background:var(--surface2)}
  .reel .menu{color:var(--ink)}
  .cbox .c .cl,.comments .c .cl{margin-left:8px;font-size:11px;cursor:pointer;opacity:.85}.cl.on{color:#F87171;font-weight:700}
  .uprof{display:flex;gap:14px;align-items:center}.uprof .av{width:72px;height:72px;font-size:26px}
  .ugrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px}.ugrid button{aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--surface2);position:relative;font-size:12px;padding:6px;text-align:left;color:var(--ink2)}
  .ugrid img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .flash{animation:flash 1.6s ease}@keyframes flash{0%,60%{box-shadow:0 0 0 3px var(--accent)}100%{box-shadow:none}}
  .editbox{margin-top:8px;display:flex;gap:6px}.editbox input{flex:1;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.9);color:#0F1B2E}
  .voicebar{display:flex;gap:6px;align-items:center;margin-top:8px}
  .voicebar .ib.on{background:var(--storm);color:#fff;border-color:transparent}
  .globe-tips{position:absolute;left:16px;bottom:56px;font-size:11px;color:var(--ink2);background:color-mix(in srgb,var(--surface) 80%,transparent);padding:5px 10px;border-radius:999px;backdrop-filter:blur(8px);pointer-events:none}
  @media (max-width:640px){.globe-tips{display:none}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  $$('.card-float').forEach(e => e.classList.add('glass'));
})();

/* ---------- sharper Earth: mipmaps + city labels + tour + cinematic intro ---------- */
(function () {
  const G = window.__globe; if (!G) return; const { group, markers, R, THREE, camera, renderer } = G;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5));
  // upgrade textures once v4 has replaced the material
  setTimeout(() => { const m = G.earth.material; if (m && m.uniforms) Object.values(m.uniforms).forEach(u => { if (u.value && u.value.isTexture) { u.value.generateMipmaps = true; u.value.minFilter = THREE.LinearMipmapLinearFilter; u.value.magFilter = THREE.LinearFilter; u.value.anisotropy = renderer.capabilities.getMaxAnisotropy(); u.value.needsUpdate = true; } }); }, 1500);
  // labels
  const labels = []; let showLabels = true;
  const mkLabel = (text, big) => { const cv = document.createElement('canvas'); const s = big ? 2 : 1.6; cv.width = 512; cv.height = 128; const c = cv.getContext('2d'); c.font = `700 ${big ? 52 : 44}px Sora, Manrope, sans-serif`; c.textAlign = 'center'; c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,.75)'; c.strokeText(text, 256, 84); c.fillStyle = '#fff'; c.fillText(text, 256, 84); const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); sp.scale.set(0.5 * s / 2, 0.125 * s / 2, 1); return sp; };
  const major = new Set(['San Benedetto del Tronto', 'Roma', 'Milano', 'Londra', 'Parigi', 'Berlino', 'Madrid', 'New York', 'Los Angeles', 'Tokyo', 'Sydney', 'Dubai', 'Il Cairo', 'Mosca', 'Pechino', 'Mumbai', 'San Paolo', 'Città del Messico', 'Nairobi', 'Singapore', 'Istanbul', 'Toronto', 'Buenos Aires', 'Johannesburg']);
  markers.forEach(m => { const c = WX[m.userData.i]; const sp = mkLabel(c.n, major.has(c.n)); sp.position.copy(m.position).multiplyScalar(1.045); sp.position.y += 0.03; sp.userData.major = major.has(c.n); sp.userData.i = m.userData.i; group.add(sp); labels.push(sp); });
  (function tick() { const z = camera.position.z; labels.forEach(l => { l.visible = showLabels && (l.userData.i === selected || (l.userData.major && z < 4.2) || z < 2.3); const f = Math.max(0.5, Math.min(1.4, z / 3)); l.scale.set(0.5 * f * (l.userData.major ? 1 : 0.8), 0.125 * f * (l.userData.major ? 1 : 0.8), 1); }); requestAnimationFrame(tick); })();
  const ov = $('#v-globe .overlay').firstElementChild;
  ov.insertAdjacentHTML('beforeend', `<button class="chip on" id="lblBtn">🏷️ <span data-i18n="labels">${t('labels')}</span></button><button class="chip" id="tourBtn">🌍 <span data-i18n="tour">${t('tour')}</span></button>`);
  $('#lblBtn').onclick = () => { showLabels = !showLabels; $('#lblBtn').classList.toggle('on', showLabels); };
  $('#v-globe').insertAdjacentHTML('beforeend', `<div class="globe-tips" data-i18n="tips_globe">${t('tips_globe')}</div>`);
  // world tour
  let tour = null;
  $('#tourBtn').onclick = () => { if (tour) { clearInterval(tour); tour = null; $('#tourBtn').classList.remove('on'); $('#tourBtn').querySelector('span').textContent = t('tour'); G.setZoom(3.7); return; } const posts = allPosts(); const list = [...new Set([...posts.map(p => cityByName(p.city)).filter(i => i >= 0), ...WX.map((c, i) => ({ i, s: score(c).s })).sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.i), ...WX.map((c, i) => ({ i, t: c.t })).sort((a, b) => b.t - a.t).slice(0, 3).map(x => x.i)])]; let k = 0; const step = () => { const i = list[k % list.length]; k++; selectCity(i); cityCard(i, $('#globeCard')); G.setZoom(2.6); }; step(); tour = setInterval(step, 4500); $('#tourBtn').classList.add('on'); $('#tourBtn').querySelector('span').textContent = t('tour_stop'); };
  // cinematic intro zoom
  const go = $('#introGo'); const baseGo = go.onclick; go.onclick = () => { baseGo(); G.jump(6.5); G.setZoom(3.7); };
  if (prefs.intro) { G.jump(5.5); G.setZoom(3.7); }
})();

/* ---------- hail map layer ---------- */
(function () {
  const M = window.__map; if (!M) return;
  $('#v-map .overlay').firstElementChild.insertAdjacentHTML('beforeend', `<button class="chip" data-layer="hail" id="hailBtn">🧊 <span data-i18n="layer_hail">${t('layer_hail')}</span></button>`);
  $('#hailBtn').onclick = () => { $$('#v-map [data-layer]').forEach(x => x.classList.toggle('on', x === $('#hailBtn'))); M.setLayer('hail'); toast(t('legend_hail')); };
  const baseOverlay = window.__mapOverlay;
  window.__mapOverlay = (ctx, toScreen, W, H) => {
    if (baseOverlay) baseOverlay(ctx, toScreen, W, H);
    if (M.state().layer !== 'hail') return;
    ctx.save(); ctx.font = '600 12px Manrope, sans-serif'; ctx.textAlign = 'center';
    WX.forEach(c => { const hs = c.hours.slice(0, 12).filter(h => h[3] === 96 || h[3] === 99); const storm = c.hours.slice(0, 12).some(h => h[3] >= 95); if (!hs.length && !storm) return; const [x, y] = toScreen(c.lat, c.lon); if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return; const p = Math.max(...c.hours.slice(0, 12).map(h => h[2])); const r = 14 + p * 0.25; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hs.length ? 'rgba(191,219,254,.75)' : 'rgba(248,113,113,.45)'); g.addColorStop(1, 'rgba(191,219,254,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.font = '20px serif'; ctx.fillText(hs.length ? '🧊' : '⛈️', x, y + 7); ctx.font = '700 12px Manrope, sans-serif'; ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; const lbl = hs.length ? `${hs[0][0]} · ${p}%` : `${p}%`; ctx.strokeText(lbl, x, y + 26); ctx.fillText(lbl, x, y + 26); });
    ctx.restore();
  };
})();

/* ---------- social: bookmarks, profiles, mentions, comment likes, edit/hide/report, links, notifications ---------- */
let myComLikes = LS.get('comlikes', {});
const userPosts = u => allPosts().filter(p => p.u === u);
function openUser(u) {
  const ps = userPosts(u); const any = ps[0] || {}; const on = prefs.follows.includes(u); const likes = ps.reduce((a, p) => a + (p.likes || 0), 0);
  let sh = $('#userSheet'); if (!sh) { sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'userSheet'; document.body.appendChild(sh); sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('[data-close]')) sh.classList.remove('show'); }); }
  sh.innerHTML = `<div class="box"><div style="display:flex;justify-content:flex-end"><button class="ib" data-close>✕</button></div><div class="uprof"><div class="av" style="background:${avColor(u)}">${any.av ? `<img class="avimg" src="${any.av}" alt="">` : esc(initials(u))}</div><div><h3>${esc(u)}</h3>${any.bio ? `<div class="note" style="margin:2px 0">${esc(any.bio)}</div>` : ''}${any.ig ? `<a class="igl" style="color:var(--accent);margin:0" href="https://instagram.com/${encodeURIComponent(any.ig)}" target="_blank" rel="noopener">📷 @${esc(any.ig)}</a>` : ''}<div class="stats"><span><b>${ps.length}</b> ${t('user_posts')}</span><span><b>${likes}</b> ${t('user_likes')}</span></div></div>${u !== prefs.nick ? `<button class="ib ${on ? 'primary' : ''}" id="uFollow" style="margin-left:auto">${on ? '✓ ' + t('following') : '+ ' + t('follow')}</button>` : ''}</div>
    <div class="ugrid">${ps.slice(0, 9).map(p => `<button data-id="${esc(p.id)}">${p.img || p.poster ? `<img src="${p.img || p.poster}" alt="">` : `<span>${(p.e || TAGS[p.tag] || '👀')} ${esc(ptext(p)).slice(0, 60)}</span>`}</button>`).join('')}</div></div>`;
  sh.classList.add('show');
  const fb = sh.querySelector('#uFollow'); if (fb) fb.onclick = () => { const i = prefs.follows.indexOf(u); if (i >= 0) prefs.follows.splice(i, 1); else prefs.follows.push(u); savePrefs(); openUser(u); renderAll(); };
  sh.querySelectorAll('.ugrid button').forEach(b => b.onclick = () => { sh.classList.remove('show'); gotoPost(b.dataset.id); });
}
function gotoPost(id) { window.__hashFilter = null; feedFilter = 'all'; show('community'); setTimeout(() => { const el = $(`#feed [data-id="${id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1700); } }, 150); }
const mentionify = html => html.replace(/(^|\s)@([\p{L}\d_]{2,24})/gu, '$1<span class="mention">@$2</span>');
const baseBind5 = bindPostActions;
bindPostActions = function (root) {
  baseBind5(root);
  root.querySelectorAll('.reel, .post').forEach(art => {
    const id = art.dataset.id; const p = allPosts().find(x => x.id === id); if (!p) return;
    // avatar / name -> profile
    art.querySelectorAll('.rtop .av, .who .av, .rtop b, .who b').forEach(el => { el.style.cursor = 'pointer'; el.addEventListener('click', e => { if (e.target.closest('button, a')) return; e.stopPropagation(); openUser(p.u); }); });
    // mentions
    const txt = art.querySelector('.txt, .body'); if (txt && !txt.dataset.mentioned) { txt.dataset.mentioned = 1; txt.innerHTML = mentionify(txt.innerHTML); txt.querySelectorAll('.mention').forEach(m => m.onclick = e => { e.stopPropagation(); const u = m.textContent.slice(1); const found = allPosts().find(x => x.u.toLowerCase() === u.toLowerCase()); if (found) openUser(found.u); }); }
    // bookmark + more menu on rail / acts
    const rail = art.querySelector('.rail, .acts'); if (rail && !rail.querySelector('[data-save]')) {
      const saved = prefs.saved.includes(id); const isReel = art.classList.contains('reel');
      rail.insertAdjacentHTML('beforeend', isReel ? `<button data-save class="${saved ? 'on' : ''}"><span class="i">${saved ? '🔖' : '📑'}</span><span>${t(saved ? 'unsave' : 'save')}</span></button><button data-more><span class="i">⋯</span><span>${t('more')}</span></button>` : `<button class="ib" data-save>${saved ? '🔖' : '📑'} ${t(saved ? 'unsave' : 'save')}</button><button class="ib" data-more>⋯</button>`);
      rail.querySelector('[data-save]').onclick = e => { e.stopPropagation(); const i = prefs.saved.indexOf(id); if (i >= 0) prefs.saved.splice(i, 1); else prefs.saved.push(id); savePrefs(); renderAll(); };
      rail.querySelector('[data-more]').onclick = e => { e.stopPropagation(); art.querySelectorAll('.menu').forEach(m => m.remove()); const mine = p.mine || p.u === prefs.nick; const menu = document.createElement('div'); menu.className = 'menu'; menu.innerHTML = `<button data-m="link">🔗 ${t('copy_link')}</button><button data-m="tr">🌐 ${t('translate')}</button>${mine && !p.seed ? `<button data-m="edit">✏️ ${t('edit')}</button>` : ''}<button data-m="hide">🙈 ${t('hide')}</button>${!mine ? `<button data-m="report">🚩 ${t('report')}</button>` : ''}`; art.appendChild(menu); setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 0);
        menu.onclick = async ev => { const m = ev.target.closest('[data-m]'); if (!m) return; ev.stopPropagation(); menu.remove(); const k = m.dataset.m;
          if (k === 'link') { const url = location.href.split('#')[0] + '#post=' + id; try { await navigator.clipboard.writeText(url); toast(t('link_copied')); } catch { prompt('Link', url); } }
          if (k === 'hide' || k === 'report') { prefs.hidden.push(id); savePrefs(); toast(k === 'report' ? t('reported') : t('hide')); renderAll(); }
          if (k === 'tr') { let box = art.querySelector('[data-aibox]'); if (!box) { box = document.createElement('div'); box.className = 'aiinline'; box.setAttribute('data-aibox', ''); (art.querySelector('.cbox, .comments') || art).before(box); } const cb = art.querySelector('.cbox'); if (cb) cb.classList.add('show'); aiInto(box, `Traduci in ${langWord()} questo post della community meteo, mantenendo emoji e hashtag, senza commenti aggiuntivi: "${ptext(p)}"`); }
          if (k === 'edit') { const cur = ptext(p); const host = art.querySelector('.txt, .body'); host.insertAdjacentHTML('afterend', `<div class="editbox"><input value="${esc(cur)}" maxlength="280"><button class="ib primary">${t('save_edit')}</button></div>`); const eb = art.querySelector('.editbox'); eb.querySelector('button').onclick = async () => { const v = eb.querySelector('input').value.trim(); if (v.length < 1) return; await persistPostChange(id, x => { x.t = v; x.edited = Date.now(); }); toast(t('edited')); renderAll(); }; }
        }; };
    }
    if (p.edited) { const meta = art.querySelector('.rtop small, .meta'); if (meta && !meta.textContent.includes(t('edited'))) meta.insertAdjacentText('beforeend', ' · ' + t('edited')); }
    // comment likes
    art.querySelectorAll('.cbox .c, .comments .c').forEach((c, k) => { if (c.querySelector('.cl')) return; const key = id + ':' + k; const n = (myComLikes[key] || 0); c.insertAdjacentHTML('beforeend', `<span class="cl ${n ? 'on' : ''}">♥ ${n || ''}</span>`); c.querySelector('.cl').onclick = e => { e.stopPropagation(); myComLikes[key] = myComLikes[key] ? 0 : 1; LS.set('comlikes', myComLikes); renderAll(); }; });
  });
};
// hidden posts + saved filter
(function () {
  const origAll = allPosts; allPosts = function () { return origAll().filter(p => !prefs.hidden.includes(p.id)); };
  $('#feedFilters').insertAdjacentHTML('beforeend', `<button class="chip" data-f="saved">🔖 <span data-i18n="saved">${t('saved')}</span></button>`);
  const base = renderFeed; renderFeed = function () { const orig = allPosts; if (feedFilter === 'saved') { allPosts = () => orig().filter(p => prefs.saved.includes(p.id)); const f = feedFilter; feedFilter = 'all'; try { base(); } finally { feedFilter = f; allPosts = orig; } $$('#feedFilters .chip').forEach(x => x.classList.toggle('on', x.dataset.f === 'saved')); } else base(); };
  const note = $('#composer .note'); if (note) note.insertAdjacentHTML('beforebegin', `<div class="note" data-i18n="mention_hint">${t('mention_hint')}</div>`);
})();
// deep link #post=
(function () { const m = location.hash.match(/#post=([\w-]+)/); if (m) setTimeout(() => gotoPost(m[1]), 600); })();
// notifications center
(function () {
  const tools = $('.tools'); const bell = document.createElement('button'); bell.className = 'ib bell'; bell.id = 'bell'; bell.title = t('notif'); bell.innerHTML = '🔔'; tools.insertBefore(bell, $('#langBtn'));
  const seen = LS.get('lastSeenNotif', 0);
  const items = () => { const out = []; for (const p of allPosts()) { if (p.ts > seen && p.u !== prefs.nick && !p.seed) out.push({ ts: p.ts, id: p.id, txt: `${p.u} · ${t('n_new')} ${p.city}`, av: p.u }); for (const c of (p.com || [])) if ((p.u === prefs.nick || p.mine) && c.u !== prefs.nick && c.ts > seen) out.push({ ts: c.ts, id: p.id, txt: `${c.u} ${t('n_comment')}: “${c.t.slice(0, 60)}”`, av: c.u }); } return out.sort((a, b) => b.ts - a.ts).slice(0, 30); };
  const refresh = () => { const n = items().length; bell.innerHTML = '🔔' + (n ? `<span class="n">${n}</span>` : ''); };
  refresh();
  bell.onclick = () => { let sh = $('#notifSheet'); if (!sh) { sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'notifSheet'; document.body.appendChild(sh); sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('[data-close]')) sh.classList.remove('show'); }); } const it = items(); sh.innerHTML = `<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h3>🔔 ${t('notif')}</h3><button class="ib" data-close>✕</button></div><div class="notifs" style="margin-top:10px">${it.length ? it.map(x => `<button data-id="${esc(x.id)}"><span class="av" style="width:30px;height:30px;font-size:12px;background:${avColor(x.av)}">${esc(initials(x.av))}</span><span>${esc(x.txt)}</span><span class="when">${ago(x.ts)}</span></button>`).join('') : `<div class="empty">${t('no_notif')}</div>`}</div></div>`; sh.classList.add('show'); sh.querySelectorAll('[data-id]').forEach(b => b.onclick = () => { sh.classList.remove('show'); gotoPost(b.dataset.id); }); LS.set('lastSeenNotif', Date.now()); setTimeout(() => { bell.innerHTML = '🔔'; }, 500); };
})();

/* ---------- AI: voice in & out, on the floating assistant and the chat ---------- */
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const addVoice = (formSel, inputSel) => { const form = $(formSel); if (!form) return; const bar = document.createElement('div'); bar.className = 'voicebar'; bar.innerHTML = `<button type="button" class="ib" data-mic>🎤 <span data-i18n="mic">${t('mic')}</span></button><button type="button" class="ib ${prefs.voice ? 'on' : ''}" data-spk>🔊 <span data-i18n="speak">${t('speak')}</span></button>`; form.insertAdjacentElement('afterend', bar);
    bar.querySelector('[data-mic]').onclick = () => { if (!SR) return toast(t('voice_unsup')); const r = new SR(); r.lang = prefs.lang === 'en' ? 'en-US' : 'it-IT'; r.interimResults = false; const b = bar.querySelector('[data-mic]'); b.classList.add('on'); toast(t('listening')); r.onresult = e => { $(inputSel).value = e.results[0][0].transcript; form.requestSubmit(); }; r.onend = () => b.classList.remove('on'); r.onerror = () => b.classList.remove('on'); r.start(); };
    bar.querySelector('[data-spk]').onclick = () => { prefs.voice = !prefs.voice; savePrefs(); bar.querySelector('[data-spk]').classList.toggle('on', prefs.voice); if (!prefs.voice) speechSynthesis.cancel(); }; };
  addVoice('#chatForm', '#chatIn'); addVoice('#aiSheetForm', '#aiSheetIn');
  const speak = txt => { try { if (!prefs.voice || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt.replace(/[✦*#_]/g, '')); u.lang = prefs.lang === 'en' ? 'en-US' : 'it-IT'; u.rate = 1.02; speechSynthesis.speak(u); } catch {} };
  const baseAiInto = aiInto; aiInto = async function (el, prompt, opts) { const r = await baseAiInto(el, prompt, opts); if (r) speak(r); return r; };
  let spkT = null; const obs = new MutationObserver(() => { clearTimeout(spkT); spkT = setTimeout(() => { const last = $('#chatLog .msg.ai:last-child'); if (last && last.dataset.spoken !== '1' && last.textContent && last.textContent !== t('ai_thinking') && last !== $('#chatLog .msg.ai:first-child')) { last.dataset.spoken = '1'; speak(last.textContent); } }, 1500); }); obs.observe($('#chatLog'), { childList: true, characterData: true, subtree: true });
})();
applyLang();
