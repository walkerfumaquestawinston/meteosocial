// Mappa eventi atmosferici (specifica PROMPT-MAPPA, parti 2, 4, 5, 6, 7).
//
// Quattro livelli, tutti collegati a fonti che esistono davvero:
//   COMUNI       7.894 comuni italiani, elenco statico dentro il Worker
//   TEMPERATURE  200 citta in 159 paesi, Open-Meteo via /api/atlas/world
//   EVENTI       incendi, tempeste, alluvioni, vulcani: NASA EONET, mondiali
//   GRANDINE     segnalazioni delle persone, database nostro
//
// Nessuna fonte viene interrogata dal client: il Worker le raccoglie, le mette
// in cache quindici minuti e conserva il dato precedente quando non
// rispondono. Ogni livello carica per conto suo: se una fonte cade, le altre
// restano in piedi e la barra di stato dice quale manca.
//
// Leaflet si carica solo entrando qui, con import() dinamico (specifica 5.5):
// un solo import statico da qualunque punto dell'app annullerebbe il
// caricamento pigro. E' gia' successo in questo progetto con Three.js.

const MAPPA_CENTRO = [42.9434, 13.8832]; // San Benedetto del Tronto
const MAPPA_ZOOM = 6;
const MAPPA_ATTESA = 400;   // specifica 5.4: mai ridisegnare durante il trascinamento
const MAPPA_CHIAVE = 'meteosocial:mappa-eventi:livelli';

// Scala termica della specifica 5.3. Unica eccezione ai token del progetto,
// perche' e' una scala di dati e non un accento dell'interfaccia.
const MAPPA_SCALA = [[-10, '#4A6FA5'], [0, '#6BA3D6'], [10, '#8FD3C1'], [20, '#F2C14E'], [30, '#E8853F'], [40, '#C4453C']];

function mappaColore(valore) {
  if (!Number.isFinite(valore)) return '#6f8296';
  const s = MAPPA_SCALA;
  if (valore <= s[0][0]) return s[0][1];
  if (valore >= s[s.length - 1][0]) return s[s.length - 1][1];
  for (let i = 1; i < s.length; i++) {
    if (valore > s[i][0]) continue;
    const [a, ca] = s[i - 1], [b, cb] = s[i], q = (valore - a) / (b - a);
    const mix = (x, y) => Math.round(parseInt(x, 16) + (parseInt(y, 16) - parseInt(x, 16)) * q).toString(16).padStart(2, '0');
    return '#' + mix(ca.slice(1, 3), cb.slice(1, 3)) + mix(ca.slice(3, 5), cb.slice(3, 5)) + mix(ca.slice(5, 7), cb.slice(5, 7));
  }
  return s[s.length - 1][1];
}

const mappaNumero = (n) => Number.isFinite(n) ? n.toLocaleString('it-IT') : '—';
const mappaOra = (t) => Number.isFinite(t) ? new Date(t).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '—';

export function createMappaEventi(ctx) {
  const esc = ctx.esc;
  let L = null, map = null, orologio = null, attesa = null;
  let sequenza = 0, vivo = false;
  const strati = {};

  // Ogni livello sa da dove viene e come sta. "stato" e' uno di:
  // ok, giu (la fonte non risponde), vecchio (dato precedente conservato).
  const livelli = [
    { id: 'temperature', icona: '🌡', nome: 'TEMPERATURE', fonte: 'OPEN-METEO', attivo: true, dati: [], stato: '', conteggio: 0 },
    { id: 'pioggia', icona: '☔', nome: 'PIOGGIA', fonte: 'OPEN-METEO', attivo: true, dati: [], stato: '', conteggio: 0 },
    { id: 'eventi', icona: '⚡', nome: 'EVENTI', fonte: 'NASA EONET', attivo: true, dati: [], stato: '', conteggio: 0 },
    { id: 'grandine', icona: '◇', nome: 'GRANDINE', fonte: 'PERSONE', attivo: true, dati: [], stato: '', conteggio: 0 },
    { id: 'comuni', icona: '⌖', nome: 'COMUNI', fonte: 'ISTAT', attivo: true, dati: [], stato: '', conteggio: 0 },
  ];
  const trova = (id) => livelli.find(l => l.id === id);
  let totaleComuni = null, aggiornamenti = {};
  // Meteo per comune, indicizzato per codice ISTAT: t = gradi, mm =
  // precipitazione, vento = km/h. Vuoto finche' la fonte non risponde.
  let meteoComuni = new Map(), meteoStato = '';

  try {
    const salvato = JSON.parse(localStorage.getItem(MAPPA_CHIAVE) || 'null');
    if (Array.isArray(salvato)) for (const l of livelli) l.attivo = salvato.includes(l.id);
  } catch { /* preferenza illeggibile: si resta sui predefiniti */ }

  function salvaLivelli() {
    try { localStorage.setItem(MAPPA_CHIAVE, JSON.stringify(livelli.filter(l => l.attivo).map(l => l.id))); } catch { /* spazio pieno o negato */ }
  }

  const $ = (s) => document.querySelector(s);

  function page() {
    return `<section class="mappa" aria-label="Mappa eventi atmosferici">
      <div class="mappa-stato" id="mappa-stato" role="status">
        <p class="mappa-riga"><span id="mappa-sistema">SISTEMA ATTIVO</span> · <span id="mappa-ora">--:--:--</span> UTC</p>
        <p class="mappa-riga">FONTI <span id="mappa-fonti">—</span></p>
        <p class="mappa-riga">NODI <span id="mappa-nodi">—</span> · EVENTI ATTIVI <span id="mappa-eventi-attivi">—</span></p>
      </div>
      <div class="mappa-quadro">
        <div class="mappa-tela" id="mappa-tela" role="application" aria-label="Mappa degli eventi atmosferici"></div>
        <div class="mappa-controlli">
          <div class="mappa-livelli" role="group" aria-label="Livelli della mappa">
            ${livelli.map(l => `<button type="button" class="mappa-pillola" data-livello="${l.id}" aria-pressed="${l.attivo}">${l.icona} ${l.nome} <span data-conteggio="${l.id}">—</span></button>`).join('')}
          </div>
          <div class="mappa-azioni">
            <button type="button" class="mappa-elenco" id="mappa-elenco" aria-expanded="false">ELENCO</button>
            <button type="button" class="mappa-chiedi mappa-chiedi-vista" id="mappa-lente">CHIEDI A LENTE</button>
          </div>
        </div>
      </div>
      <div class="mappa-lista" id="mappa-lista" hidden></div>
      <p class="mappa-attribuzioni">Mappa © OpenStreetMap · Comuni ISTAT · Meteo Open-Meteo · Eventi NASA EONET · Grandine: segnalazioni delle persone, non allerte ufficiali</p>
    </section>`;
  }

  function scriviStato() {
    const ora = $('#mappa-ora'); if (ora) ora.textContent = new Date().toISOString().slice(11, 19);

    // Fonte che non risponde: barrata e in colore d'allerta. Dato vecchio:
    // segnato. L'utente deve sapere cosa manca, non indovinarlo (4.3).
    // Una fonte per riga, non una per livello: TEMPERATURE e PIOGGIA vengono
    // dallo stesso Open-Meteo e ripeterlo due volte confonde. Se piu livelli
    // la condividono vale lo stato peggiore, perche' e' quello che l'utente
    // deve sapere.
    const fonti = $('#mappa-fonti');
    if (fonti) {
      const peso = { '': 0, vecchio: 1, giu: 2 };
      const per = new Map();
      for (const l of livelli) {
        const attuale = per.get(l.fonte) ?? '';
        if (peso[l.stato] > peso[attuale]) per.set(l.fonte, l.stato); else if (!per.has(l.fonte)) per.set(l.fonte, attuale);
      }
      fonti.innerHTML = [...per].map(([nome, stato]) =>
        stato === 'giu' ? `<s class="mappa-giu">${esc(nome)}</s>`
          : stato === 'vecchio' ? `<span class="mappa-vecchio">${esc(nome)}*</span>`
            : esc(nome)).join(' · ');
    }

    // NODI: elementi realmente caricati. Mai numeri inventati.
    const nodi = $('#mappa-nodi');
    if (nodi) nodi.textContent = mappaNumero(livelli.filter(l => l.attivo).reduce((t, l) => t + l.conteggio, 0));
    const attivi = $('#mappa-eventi-attivi');
    if (attivi) attivi.textContent = mappaNumero(trova('eventi').conteggio + trova('grandine').conteggio);

    // Si contano le fonti giu, non i livelli: due livelli sulla stessa fonte
    // caduta sono un guasto solo, e dirne due sarebbe un numero gonfiato.
    const sistema = $('#mappa-sistema');
    const giu = new Set(livelli.filter(l => l.attivo && l.stato === 'giu').map(l => l.fonte));
    if (sistema) {
      sistema.textContent = giu.size ? (giu.size === 1 ? '1 FONTE NON DISPONIBILE' : `${giu.size} FONTI NON DISPONIBILI`) : 'SISTEMA ATTIVO';
      sistema.classList.toggle('mappa-giu', giu.size > 0);
    }
    for (const l of livelli) {
      const c = document.querySelector(`[data-conteggio="${l.id}"]`);
      if (c) c.textContent = l.stato === 'giu' ? '—' : mappaNumero(l.conteggio);
    }
  }

  // ---- caricamento: ogni livello per conto suo ------------------------------

  async function caricaComuni(token) {
    const l = trova('comuni'); if (!l.attivo || !map) return;
    const b = map.getBounds(), z = Math.round(map.getZoom());
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map(n => n.toFixed(4)).join(',');
    try {
      const d = await ctx.api(`mappa/comuni?bbox=${encodeURIComponent(bbox)}&zoom=${z}`);
      if (token !== sequenza) return;
      l.dati = d.dati || []; l.conteggio = d.mostrati || 0; l.stato = ''; totaleComuni = d.totale ?? null;
    } catch { if (token === sequenza) { l.dati = []; l.conteggio = 0; l.stato = 'giu'; } }
  }

  // Meteo dei comuni: una sola chiamata per tutti, il Worker lo tiene in cache
  // quindici minuti. Serve sia a TEMPERATURE sia a PIOGGIA, quindi si carica
  // se almeno uno dei due e acceso.
  async function caricaMeteoComuni(token) {
    if (!trova('temperature').attivo && !trova('pioggia').attivo) return;
    try {
      const d = await ctx.api('mappa/meteo');
      if (token !== sequenza) return;
      const m = new Map();
      for (const r of d.dati || []) m.set(r[0], { t: r[1], mm: r[2], codice: r[3], vento: r[4] });
      meteoComuni = m; meteoStato = d.stale ? 'vecchio' : '';
      aggiornamenti.meteoComuni = d.updated;
    } catch { if (token === sequenza) { meteoComuni = new Map(); meteoStato = 'giu'; } }
  }

  async function caricaTemperature(token) {
    const l = trova('temperature'); if (!l.attivo) return;
    try {
      const d = await ctx.api('atlas/world');
      if (token !== sequenza) return;
      // Solo le citta con una misura vera: current null significa che per
      // quella citta il dato non e arrivato, e non si disegna un punto muto.
      l.dati = (d.cities || []).filter(c => c.current && Number.isFinite(c.current.temperature_2m));
      l.conteggio = l.dati.length;
      l.stato = d.stale ? 'vecchio' : '';
      aggiornamenti.temperature = d.updated;
    } catch { if (token === sequenza) { l.dati = []; l.conteggio = 0; l.stato = 'giu'; } }
  }

  async function caricaEventi(token) {
    const l = trova('eventi'); if (!l.attivo) return;
    try {
      const d = await ctx.api('atlas/events');
      if (token !== sequenza) return;
      l.dati = d.events || []; l.conteggio = l.dati.length;
      l.stato = d.stale ? 'vecchio' : '';
      aggiornamenti.eventi = d.updated;
    } catch { if (token === sequenza) { l.dati = []; l.conteggio = 0; l.stato = 'giu'; } }
  }

  async function caricaGrandine(token) {
    const l = trova('grandine'); if (!l.attivo) return;
    const citta = ctx.get()?.place?.name;
    if (!citta) { l.dati = []; l.conteggio = 0; l.stato = ''; return; }
    try {
      const d = await ctx.api('atlas/hail?city=' + encodeURIComponent(citta));
      if (token !== sequenza) return;
      // Le segnalazioni senza coordinate restano nei conteggi ma non sulla
      // mappa: non si inventa una posizione per disegnarle.
      l.dati = (d.posts || []).filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
      l.conteggio = Number.isFinite(d.reports) ? d.reports : l.dati.length;
      l.stato = '';
      aggiornamenti.grandine = d.updated;
    } catch { if (token === sequenza) { l.dati = []; l.conteggio = 0; l.stato = 'giu'; } }
  }

  async function carica() {
    if (!map || !vivo) return;
    const token = ++sequenza;
    // In parallelo ma indipendenti: una fonte che cade non ferma le altre.
    await Promise.allSettled([caricaComuni(token), caricaMeteoComuni(token), caricaTemperature(token), caricaEventi(token), caricaGrandine(token)]);
    if (token !== sequenza) return;

    // TEMPERATURE e PIOGGIA vivono sugli stessi punti: citta del mondo piu
    // comuni italiani con misura. I conteggi si calcolano dopo il caricamento,
    // sui dati veri, invece di essere dichiarati a priori.
    const citta = trova('temperature').dati;
    const conMisura = trova('comuni').dati.filter(c => meteoComuni.has(c[0]));
    const temp = trova('temperature');
    temp.conteggio = citta.length + conMisura.length;
    if (temp.stato !== 'giu' && meteoStato === 'giu' && !citta.length) temp.stato = 'giu';

    const pioggia = trova('pioggia');
    if (pioggia.attivo) {
      const bagnate = citta.filter(c => Number(c.current.precipitation) > 0).length
        + conMisura.filter(c => Number(meteoComuni.get(c[0]).mm) > 0).length;
      pioggia.conteggio = bagnate;
      pioggia.stato = (temp.stato === 'giu' && meteoStato === 'giu') ? 'giu' : (meteoStato === 'vecchio' ? 'vecchio' : '');
    }

    disegna(); scriviStato(); scriviLista(); mostraVuoto();
  }

  // ---- disegno -------------------------------------------------------------

  function strato(id) {
    if (!strati[id]) strati[id] = L.layerGroup().addTo(map);
    return strati[id];
  }

  function etichetta(testo, lat, lng, gruppo) {
    const larghezza = map.getSize().x, x = map.latLngToContainerPoint([lat, lng]).x;
    const serve = testo.length * 7.5 + 16;
    const destra = x + serve <= larghezza - 4, sinistra = x - serve >= 4;
    const centrato = !destra && !sinistra;
    if (centrato && (x - serve / 2 < 4 || x + serve / 2 > larghezza - 4)) return;
    const posizione = centrato ? ' mappa-etichetta-centro' : (!destra ? ' mappa-etichetta-sinistra' : '');
    // Il testo sta in uno span interno: Leaflet posiziona il contenitore con un
    // transform in linea, che vincerebbe su qualunque transform del foglio.
    gruppo.addLayer(L.marker([lat, lng], {
      interactive: false, keyboard: false,
      icon: L.divIcon({ className: 'mappa-etichetta' + posizione, html: `<span>${esc(testo)}</span>`, iconSize: null }),
    }));
  }

  function disegna() {
    if (!L || !map) return;
    for (const id of Object.keys(strati)) strati[id].clearLayers();
    const z = map.getZoom();

    const comuni = trova('comuni'), temp = trova('temperature'), pioggia = trova('pioggia');

    // Comuni: il punto prende il colore dalla scala termica quando il meteo
    // c'e', grigio quando non c'e'. Il grigio non e' un valore: e' l'assenza
    // di valore, e si vede che e' diversa dagli altri.
    if (comuni.attivo) {
      const g = strato('comuni');
      for (const c of comuni.dati) {
        const m = meteoComuni.get(c[0]);
        const punto = L.circleMarker([c[3], c[4]], {
          radius: m ? 5 : 3, weight: 1, color: '#07121f', opacity: m ? .7 : .5,
          fillColor: m ? mappaColore(m.t) : '#6f8296', fillOpacity: m ? .95 : .75,
        });
        punto.on('click', () => schedaComune(c));
        g.addLayer(punto);
      }
      // Da zoom 9 il nome; se c'e' la misura, nome e gradi insieme.
      if (z >= 9) for (const c of comuni.dati.slice(0, 120)) {
        const m = meteoComuni.get(c[0]);
        etichetta(m ? `${c[1]} ${m.t}°` : c[1], c[3], c[4], g);
      }
    }

    // Temperature: le citta del mondo. Il raggio non cambia, il colore si'.
    if (temp.attivo) {
      const g = strato('temperature');
      for (const c of temp.dati) {
        const t = c.current.temperature_2m;
        const punto = L.circleMarker([c.latitude, c.longitude], { radius: 6, weight: 1, color: '#07121f', opacity: .7, fillColor: mappaColore(t), fillOpacity: .95 });
        punto.on('click', () => schedaCitta(c));
        g.addLayer(punto);
      }
      if (z >= 4) for (const c of temp.dati) etichetta(`${Math.round(c.current.temperature_2m)}°`, c.latitude, c.longitude, g);
    }

    // Pioggia: solo dove sta piovendo davvero. Un anello azzurro che cresce
    // con i millimetri, sopra il punto della temperatura. Zero millimetri non
    // disegna niente: "non piove" non e' un dato da mostrare.
    if (pioggia.attivo) {
      const g = strato('pioggia');
      const goccia = (lat, lng, mm, apri) => {
        const raggio = Math.max(7, Math.min(22, 7 + mm * 3));
        const anello = L.circleMarker([lat, lng], {
          radius: raggio, weight: 2, color: '#4fb6f5', opacity: .9,
          fillColor: '#4fb6f5', fillOpacity: Math.min(.4, .12 + mm * .05),
        });
        if (apri) anello.on('click', apri);
        g.addLayer(anello);
      };
      for (const c of temp.dati) {
        const mm = Number(c.current.precipitation);
        if (Number.isFinite(mm) && mm > 0) goccia(c.latitude, c.longitude, mm, () => schedaCitta(c));
      }
      for (const c of comuni.dati) {
        const m = meteoComuni.get(c[0]);
        if (m && Number.isFinite(m.mm) && m.mm > 0) goccia(c[3], c[4], m.mm, () => schedaComune(c));
      }
    }

    // Eventi naturali: cerchio piu grande in colore d'allerta.
    const eventi = trova('eventi');
    if (eventi.attivo) {
      const g = strato('eventi');
      for (const e of eventi.dati) {
        const punto = L.circleMarker([e.latitude, e.longitude], { radius: 8, weight: 2, color: '#ff5a47', opacity: .9, fillColor: '#ff5a47', fillOpacity: .35 });
        punto.on('click', () => schedaEvento(e));
        g.addLayer(punto);
      }
    }

    // Grandine: il raggio cresce con la dimensione dei chicchi, non con le
    // conferme (specifica 3.4). Senza dimensione dichiarata resta il minimo.
    const grandine = trova('grandine');
    if (grandine.attivo) {
      const g = strato('grandine');
      for (const p of grandine.dati) {
        const mm = Number(p.hail?.size) || 0;
        const raggio = Math.max(10, Math.min(26, 10 + mm * 0.25));
        g.addLayer(L.circleMarker([p.latitude, p.longitude], { radius: 3, weight: 0, fillColor: '#ff9a4d', fillOpacity: 1 }));
        const anello = L.circleMarker([p.latitude, p.longitude], { radius: raggio, weight: 1, color: '#ff9a4d', opacity: .85, fillColor: '#ff9a4d', fillOpacity: .18, dashArray: '3 3' });
        anello.on('click', () => schedaGrandine(p));
        g.addLayer(anello);
      }
    }
  }

  // ---- schede: prima le persone, poi il modello, sempre con la fonte -------

  function bloccoLente(citta, domanda) {
    return `<p class="mappa-lente"><button type="button" class="mappa-chiedi" data-citta="${esc(citta)}" data-domanda="${esc(domanda)}">CHIEDI A LENTE</button></p>
      <div id="mappa-risposta" role="status"></div>`;
  }

  function collegaLente() {
    const b = document.querySelector('.mappa-chiedi'); if (!b) return;
    b.onclick = async () => {
      const slot = document.querySelector('#mappa-risposta'); if (!slot) return;
      b.disabled = true; slot.innerHTML = '<p>Lente sta leggendo…</p>';
      try {
        // Alla Lente vanno solo il nome della localita e la domanda: mai
        // coordinate precise, autori o media. E' la regola del progetto.
        const r = await ctx.api('ai', { city: b.dataset.citta, question: b.dataset.domanda, includeCommunity: false });
        const testo = r?.answer || r?.text || '';
        slot.innerHTML = testo
          ? `<p>${esc(testo)}</p><p class="mappa-fonte">RISPOSTA GENERATA · non e una previsione ufficiale</p>`
          : '<p>Lente non ha risposto. Riprova tra poco.</p>';
      } catch (e) {
        slot.innerHTML = `<p>${esc(e?.message || 'Lente non e disponibile adesso.')}</p>`;
      } finally { b.disabled = false; }
    };
  }

  function schedaComune(c) {
    const ab = Number.isFinite(c[5]) ? `${mappaNumero(c[5])} AB.` : 'ABITANTI NON DISPONIBILI';
    const m = meteoComuni.get(c[0]);
    const meteo = m ? `
      <dt>TEMPERATURA</dt><dd class="mappa-mono">${m.t}°</dd>
      ${Number.isFinite(m.mm) ? `<dt>PIOGGIA</dt><dd class="mappa-mono">${m.mm} mm</dd>` : ''}
      ${Number.isFinite(m.vento) ? `<dt>VENTO</dt><dd class="mappa-mono">${m.vento} km/h</dd>` : ''}` : '';
    const nota = m
      ? '<p>Dato di modello, non una misura presa da una stazione qui.</p>'
      : `<p>Per questo comune il meteo non è disponibile: la raccolta copre i 500 comuni più popolosi. Non mettiamo un numero stimato al suo posto.</p>`;
    ctx.modal(c[1], `<div class="mappa-scheda">
      <p class="mappa-riga">${esc(c[2])} · ${ab}</p>
      <dl>${meteo}
      <dt>CODICE ISTAT</dt><dd class="mappa-mono">${esc(c[0])}</dd>
      <dt>COORDINATE</dt><dd class="mappa-mono">${c[3].toFixed(4)}, ${c[4].toFixed(4)}</dd></dl>
      ${nota}
      ${bloccoLente(c[1], `Che tempo fa a ${c[1]}?`)}
      <p class="mappa-fonte">FONTE  Comuni ISTAT${m ? ` · meteo Open-Meteo${aggiornamenti.meteoComuni ? ', aggiornato alle ' + mappaOra(aggiornamenti.meteoComuni) : ''}` : ''}</p>
    </div>`, null);
    collegaLente();
  }

  // L'IA sulla mappa, non solo dentro le schede: si chiede a Lente cosa sta
  // succedendo in quello che si sta guardando. Il riassunto e' costruito dai
  // conteggi veri gia' caricati, mai da numeri stimati, e alla Lente arriva
  // solo il nome della localita: niente coordinate, autori o media.
  function riassuntoVista() {
    const pezzi = [];
    const temp = trova('temperature'), pioggia = trova('pioggia'), eventi = trova('eventi'), grandine = trova('grandine');
    const gradi = [...trova('comuni').dati.map(c => meteoComuni.get(c[0])?.t), ...temp.dati.map(c => Math.round(c.current.temperature_2m))].filter(Number.isFinite);
    if (gradi.length) pezzi.push(`${gradi.length} località con temperature fra ${Math.min(...gradi)} e ${Math.max(...gradi)} gradi`);
    if (pioggia.attivo && pioggia.conteggio) pezzi.push(`${pioggia.conteggio} dove sta piovendo`);
    if (eventi.attivo && eventi.conteggio) pezzi.push(`${eventi.conteggio} eventi naturali aperti nel catalogo NASA`);
    if (grandine.attivo && grandine.conteggio) pezzi.push(`${grandine.conteggio} segnalazioni di grandine dalle persone`);
    const giu = livelli.filter(l => l.attivo && l.stato === 'giu').map(l => l.fonte);
    if (giu.length) pezzi.push(`fonti che non rispondono adesso: ${giu.join(', ')}`);
    return pezzi;
  }

  async function chiediSullaVista() {
    const citta = ctx.get()?.place?.name || 'la zona che sto guardando';
    const pezzi = riassuntoVista();
    const riassunto = pezzi.length ? pezzi.join('; ') : 'nessun dato caricato in questo momento';
    ctx.modal('Chiedi a Lente', `<div class="mappa-scheda">
      <p class="mappa-riga">COSA C'È SULLA MAPPA ORA</p>
      <p>${esc(riassunto)}.</p>
      <p class="mappa-fonte">Alla Lente arriva solo il nome della località e questa domanda. Mai coordinate precise, autori o foto.</p>
      ${bloccoLente(citta, `Sulla mappa vedo: ${riassunto}. Cosa sta succedendo dalle parti di ${citta}, e cosa conviene aspettarsi nelle prossime ore?`)}
    </div>`, null);
    collegaLente();
  }

  function schedaCitta(c) {
    const k = c.current;
    ctx.modal(c.name, `<div class="mappa-scheda">
      <p class="mappa-riga">${esc(c.country_code || '')}</p>
      <dl>
        <dt>TEMPERATURA</dt><dd class="mappa-mono">${Math.round(k.temperature_2m)}°</dd>
        ${Number.isFinite(k.precipitation) ? `<dt>PRECIPITAZIONI</dt><dd class="mappa-mono">${k.precipitation} mm</dd>` : ''}
        ${Number.isFinite(k.wind_speed_10m) ? `<dt>VENTO</dt><dd class="mappa-mono">${Math.round(k.wind_speed_10m)} km/h</dd>` : ''}
      </dl>
      <p>Nessuno ha ancora raccontato il cielo qui.</p>
      ${bloccoLente(c.name, `Com'è il tempo a ${c.name}?`)}
      <p class="mappa-fonte">FONTE  Open-Meteo${aggiornamenti.temperature ? ' · aggiornato alle ' + mappaOra(aggiornamenti.temperature) : ''}. Dato di modello, non una misura osservata.</p>
    </div>`, null);
    collegaLente();
  }

  function schedaEvento(e) {
    ctx.modal(e.name || e.value, `<div class="mappa-scheda">
      <p class="mappa-riga">${esc(e.value || 'EVENTO NATURALE')}</p>
      <dl>
        <dt>POSIZIONE</dt><dd class="mappa-mono">${Number(e.latitude).toFixed(3)}, ${Number(e.longitude).toFixed(3)}</dd>
        ${Number.isFinite(e.at) ? `<dt>ULTIMO DATO</dt><dd class="mappa-mono">${mappaOra(e.at)}</dd>` : ''}
      </dl>
      <p>${esc(e.detail || 'Ultima posizione nel catalogo; non una rilevazione istantanea.')}</p>
      <p class="mappa-fonte">FONTE  NASA EONET${e.link ? ` · <a href="${esc(e.link)}" target="_blank" rel="noopener">catalogo ↗</a>` : ''}</p>
    </div>`, null);
  }

  function schedaGrandine(p) {
    const mm = Number(p.hail?.size);
    ctx.modal('Grandine', `<div class="mappa-scheda">
      <p class="mappa-riga">${esc(p.city || 'Zona segnalata')}${Number.isFinite(p.created) ? ' · ' + mappaOra(p.created) : ''}</p>
      <dl>
        <dt>CHICCHI</dt><dd>${Number.isFinite(mm) ? `circa ${mm} mm` : 'dimensione non dichiarata'}</dd>
        ${Number.isFinite(p.confirms) ? `<dt>CONFERME</dt><dd class="mappa-mono">${mappaNumero(p.confirms)}</dd>` : ''}
      </dl>
      <p class="mappa-fonte">FONTE  Segnalazioni della community. <strong>Non è un'allerta ufficiale.</strong></p>
    </div>`, null);
  }

  // ---- elenco accessibile --------------------------------------------------

  function scriviLista() {
    const lista = $('#mappa-lista'); if (!lista || lista.hidden) return;
    const pezzi = [];
    for (const l of livelli.filter(x => x.attivo)) {
      if (l.stato === 'giu') { pezzi.push(`<p class="mappa-riga">${esc(l.nome)} · fonte non disponibile</p>`); continue; }
      if (!l.conteggio) { pezzi.push(`<p class="mappa-riga">${esc(l.nome)} · nessun elemento</p>`); continue; }
      pezzi.push(`<p class="mappa-riga">${esc(l.nome)} · ${mappaNumero(l.conteggio)}</p>`);
      if (l.id === 'temperature') pezzi.push(`<ol>${l.dati.slice(0, 30).map(c => `<li><strong>${esc(c.name)}</strong> <span class="mappa-mono">${Math.round(c.current.temperature_2m)}°</span></li>`).join('')}</ol>`);
      if (l.id === 'eventi') pezzi.push(`<ol>${l.dati.slice(0, 30).map(e => `<li><strong>${esc(e.name || e.value)}</strong> <span class="mappa-mono">${esc(e.value || '')}</span></li>`).join('')}</ol>`);
      if (l.id === 'comuni') pezzi.push(`<ol>${l.dati.slice(0, 30).map(c => `<li><strong>${esc(c[1])}</strong> <span class="mappa-mono">${esc(c[2])}</span></li>`).join('')}</ol>`);
    }
    lista.innerHTML = pezzi.join('') || '<p role="status">Nessun livello acceso.</p>';
  }

  // ---- ciclo di vita -------------------------------------------------------

  function programma() { clearTimeout(attesa); attesa = setTimeout(carica, MAPPA_ATTESA); }

  async function bind() {
    const host = $('#mappa-tela'); if (!host || map) return;
    vivo = true;
    const token = ++sequenza;
    L = await import('./assets/leaflet.js');
    if (token !== sequenza || !host.isConnected) return;
    map = L.map(host, {
      preferCanvas: true,                    // specifica 5.1
      renderer: L.canvas({ padding: .5 }),
      zoomControl: false, attributionControl: false, worldCopyJump: true,
    }).setView(MAPPA_CENTRO, MAPPA_ZOOM);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, crossOrigin: true }).addTo(map);
    map.on('moveend', programma);
    map.on('zoomend', programma);
    orologio = setInterval(() => { if (!document.hidden) scriviStato(); }, 1000);
    document.addEventListener('visibilitychange', suVisibilita);

    for (const b of document.querySelectorAll('[data-livello]')) b.onclick = () => {
      const l = trova(b.dataset.livello); if (!l) return;
      l.attivo = !l.attivo; b.setAttribute('aria-pressed', String(l.attivo));
      salvaLivelli();
      if (l.attivo) carica(); else { l.dati = []; l.conteggio = 0; disegna(); scriviStato(); scriviLista(); mostraVuoto(); }
    };
    const lente = $('#mappa-lente');
    if (lente) lente.onclick = () => chiediSullaVista();
    const elenco = $('#mappa-elenco');
    if (elenco) elenco.onclick = () => {
      const lista = $('#mappa-lista'); if (!lista) return;
      lista.hidden = !lista.hidden;
      elenco.setAttribute('aria-expanded', String(!lista.hidden));
      scriviLista();
    };
    scriviStato();
    await carica();
  }

  // Regola d'oro della specifica: la mappa non deve mai restare vuota senza
  // spiegare perche', e senza un modo per tornare indietro.
  function mostraVuoto() {
    const sezione = document.querySelector('.mappa'); if (!sezione) return;
    let avviso = document.querySelector('#mappa-vuoto');
    const spento = livelli.every(l => !l.attivo);
    if (!spento) { avviso?.remove(); return; }
    if (avviso) return;
    avviso = document.createElement('p');
    avviso.id = 'mappa-vuoto';
    avviso.className = 'mappa-vuoto';
    avviso.setAttribute('role', 'status');
    avviso.innerHTML = 'Accendi altri livelli per vedere cosa sta succedendo. <button type="button" id="mappa-riaccendi">RIACCENDI</button>';
    sezione.append(avviso);
    avviso.querySelector('#mappa-riaccendi').onclick = () => {
      for (const l of livelli) l.attivo = true;
      for (const b of document.querySelectorAll('[data-livello]')) b.setAttribute('aria-pressed', 'true');
      salvaLivelli(); carica();
    };
  }

  function suVisibilita() { if (document.hidden) clearTimeout(attesa); else programma(); }

  // Uscendo dalla sezione si smonta tutto: senza map.remove() resta un timer
  // acceso a consumare batteria (specifica 5.4).
  function dispose() {
    vivo = false; sequenza++;
    clearTimeout(attesa); attesa = null;
    clearInterval(orologio); orologio = null;
    document.removeEventListener('visibilitychange', suVisibilita);
    for (const id of Object.keys(strati)) delete strati[id];
    if (map) { map.remove(); map = null; }
  }

  return { page, bind, dispose, active: () => ctx.get().route === 'mappa-eventi' };
}
