// Mappa eventi atmosferici (specifica PROMPT-MAPPA, parti 2, 4, 5, 6, 7).
//
// Primo livello consegnato: i comuni. Gli altri sette dipendono da fonti
// esterne che richiedono uno scheduler sul server, oggi non disponibile: le
// loro pillole non vengono mostrate finche' non hanno dati veri, perche' una
// pillola che non accende niente e' un numero inventato travestito.
//
// Leaflet si carica solo entrando qui, con import() dinamico (specifica 5.5):
// un solo import statico da qualunque punto dell'app annullerebbe il
// caricamento pigro. E' gia' successo in questo progetto con Three.js.

const MAPPA_CENTRO = [42.9434, 13.8832]; // San Benedetto del Tronto
const MAPPA_ZOOM = 9;
const MAPPA_ATTESA = 400;   // specifica 5.4: mai ridisegnare durante il trascinamento
const MAPPA_CHIAVE = 'meteosocial:mappa-eventi:livelli';

// Scala termica della specifica 5.3. Unica eccezione ai token del progetto,
// perche' e' una scala di dati e non un accento dell'interfaccia: non usarla
// per altro. Qui serve gia' per i comuni, che ne useranno i gradi quando la
// fonte meteo sara' collegata.
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

export function createMappaEventi(ctx) {
  const esc = ctx.esc;
  let L = null, map = null, strato = null, orologio = null, attesa = null;
  let sequenza = 0, vivo = false;
  // Stato reale, mai stimato: la barra di stato mostra questi numeri e basta.
  let stato = { nodi: 0, disponibili: 0, totale: null, troncato: false, criterio: '', aggiornato: null, errore: '' };
  let ultimi = [];

  const livelli = [
    { id: 'comuni', icona: '🌡', nome: 'COMUNI', attivo: true, pronto: true },
  ];
  // Livelli previsti dalla specifica ma senza fonte collegata. Restano
  // dichiarati qui, non mostrati come pillole: vedere PROJECT_STATUS.md.
  const attesi = ['PIOGGIA', 'TEMPORALI', 'GRANDINE', 'NEVE', 'VENTO', 'ALLERTE', 'PERSONE'];

  try {
    const salvato = JSON.parse(localStorage.getItem(MAPPA_CHIAVE) || 'null');
    if (Array.isArray(salvato)) for (const l of livelli) if (l.pronto) l.attivo = salvato.includes(l.id);
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
        <p class="mappa-riga">NODI <span id="mappa-nodi">—</span> · IN VISTA <span id="mappa-vista">—</span></p>
      </div>
      <div class="mappa-quadro">
        <div class="mappa-tela" id="mappa-tela" role="application" aria-label="Mappa dei comuni italiani"></div>
        <div class="mappa-controlli">
          <div class="mappa-livelli" role="group" aria-label="Livelli della mappa">
            ${livelli.map(l => `<button type="button" class="mappa-pillola" data-livello="${l.id}" aria-pressed="${l.attivo}">${l.icona} ${l.nome} <span data-conteggio="${l.id}">—</span></button>`).join('')}
          </div>
          <button type="button" class="mappa-elenco" id="mappa-elenco" aria-expanded="false">ELENCO</button>
        </div>
      </div>
      <div class="mappa-lista" id="mappa-lista" hidden></div>
      <p class="mappa-attribuzioni">Mappa © OpenStreetMap · Comuni: ISTAT, tramite pacchetti derivati</p>
    </section>`;
  }

  function scriviStato() {
    const ora = $('#mappa-ora'); if (ora) ora.textContent = new Date().toISOString().slice(11, 19);
    const nodi = $('#mappa-nodi'); if (nodi) nodi.textContent = mappaNumero(stato.totale);
    const vista = $('#mappa-vista'); if (vista) vista.textContent = stato.troncato
      ? `${mappaNumero(stato.nodi)} di ${mappaNumero(stato.disponibili)}`
      : mappaNumero(stato.nodi);
    const fonti = $('#mappa-fonti');
    // Se una fonte non risponde il suo nome va barrato e in colore d'allerta:
    // l'utente deve sapere cosa manca, non indovinarlo (specifica 4.3).
    if (fonti) fonti.innerHTML = stato.errore
      ? '<s class="mappa-giu">ISTAT</s>'
      : 'ISTAT';
    const sistema = $('#mappa-sistema');
    if (sistema) { sistema.textContent = stato.errore ? 'FONTE NON DISPONIBILE' : 'SISTEMA ATTIVO'; sistema.classList.toggle('mappa-giu', !!stato.errore); }
    const conteggio = document.querySelector('[data-conteggio="comuni"]');
    if (conteggio) conteggio.textContent = stato.errore ? '—' : mappaNumero(stato.nodi);
  }

  function scriviLista() {
    const lista = $('#mappa-lista'); if (!lista || lista.hidden) return;
    if (stato.errore) { lista.innerHTML = `<p role="status">${esc(stato.errore)}</p>`; return; }
    if (!ultimi.length) { lista.innerHTML = '<p role="status">Nessun comune nel riquadro visibile.</p>'; return; }
    // Ordinata per abitanti, come arriva dal server: e' l'ordine che l'utente
    // si aspetta e non richiede un secondo calcolo sul telefono.
    lista.innerHTML = `<p class="mappa-riga">${mappaNumero(ultimi.length)} COMUNI NEL RIQUADRO</p><ol>${ultimi.slice(0, 60).map(c =>
      `<li><strong>${esc(c[1])}</strong> <span class="mappa-mono">${esc(c[2])}</span>${Number.isFinite(c[5]) ? ` · <span class="mappa-mono">${mappaNumero(c[5])} ab.</span>` : ' · <span class="mappa-mono">abitanti non disponibili</span>'}</li>`).join('')}</ol>${ultimi.length > 60 ? `<p class="mappa-riga">Elenco limitato ai primi 60.</p>` : ''}`;
  }

  async function carica() {
    if (!map || !vivo) return;
    const token = ++sequenza;
    const b = map.getBounds(), z = Math.round(map.getZoom());
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map(n => n.toFixed(4)).join(',');
    try {
      const d = await ctx.api(`mappa/comuni?bbox=${encodeURIComponent(bbox)}&zoom=${z}`);
      if (token !== sequenza || !map) return;
      ultimi = d.dati || [];
      stato = { nodi: d.mostrati || 0, disponibili: d.disponibili || 0, totale: d.totale ?? null, troncato: !!d.troncato, criterio: d.criterio || '', aggiornato: Date.now(), errore: '' };
      disegna();
    } catch (e) {
      if (token !== sequenza) return;
      ultimi = [];
      // Niente dati finti: si svuota lo strato e si dichiara il guasto.
      stato = { ...stato, nodi: 0, disponibili: 0, errore: e?.message || 'La fonte dei comuni non risponde.' };
      if (strato) strato.clearLayers();
    }
    scriviStato(); scriviLista();
  }

  function disegna() {
    if (!L || !map) return;
    if (!strato) strato = L.layerGroup().addTo(map);
    strato.clearLayers();
    if (!livelli[0].attivo) return;
    const z = map.getZoom();
    for (const c of ultimi) {
      // circleMarker su canvas: L.marker con icone HTML muore sopra i 500
      // elementi (specifica 5.1).
      const punto = L.circleMarker([c[3], c[4]], {
        radius: 4, weight: 1, color: '#0b1725', opacity: .6,
        fillColor: mappaColore(NaN), fillOpacity: .85,
      });
      punto.on('click', () => apriScheda(c));
      strato.addLayer(punto);
    }
    // I nomi solo da zoom 9 in su, altrimenti diventa una macchia di testo.
    // L'etichetta sta a destra del punto, ma vicino al bordo destro uscirebbe
    // dal riquadro e verrebbe tagliata a meta' parola: li' si ribalta a
    // sinistra. Meglio un nome spostato che un nome monco.
    if (z >= 9) {
      const larghezza = map.getSize().x;
      // Il carattere e' monospaziato, quindi la larghezza del nome si calcola
      // invece di indovinarla: circa 7,5 px per carattere a 12 px, piu' lo
      // stacco dal punto. Una soglia fissa sbagliava sui nomi lunghi, e
      // "San Benedetto del Tronto" usciva comunque dal riquadro.
      const larghezzaNome = (nome) => nome.length * 7.5 + 16;
      for (const c of ultimi.slice(0, 120)) {
        const x = map.latLngToContainerPoint([c[3], c[4]]).x;
        const serve = larghezzaNome(c[1]);
        const staADestra = x + serve <= larghezza - 4;
        const staASinistra = x - serve >= 4;
        // Se non ci sta ne' a destra ne' a sinistra si centra sotto il punto:
        // e' il caso dei nomi lunghi al centro dello schermo, come
        // "San Benedetto del Tronto". Solo se non ci sta nemmeno centrato si
        // rinuncia, perche' meglio nessun nome che un nome monco.
        const centrato = !staADestra && !staASinistra;
        if (centrato && (x - serve / 2 < 4 || x + serve / 2 > larghezza - 4)) continue;
        const aSinistra = !staADestra && !centrato;
        const posizione = centrato ? ' mappa-etichetta-centro' : (aSinistra ? ' mappa-etichetta-sinistra' : '');
        strato.addLayer(L.marker([c[3], c[4]], {
          interactive: false, keyboard: false,
          // Il testo sta in uno span interno: Leaflet posiziona il contenitore
          // con un transform in linea, che vincerebbe su qualunque transform
          // dichiarato nel foglio di stile. Lo span si ancora invece con
          // left/right, e il ribaltamento funziona davvero.
          icon: L.divIcon({
            className: 'mappa-etichetta' + posizione,
            html: `<span>${esc(c[1])}</span>`, iconSize: null,
          }),
        }));
      }
    }
  }

  function apriScheda(c) {
    const ab = Number.isFinite(c[5]) ? `${mappaNumero(c[5])} AB.` : 'ABITANTI NON DISPONIBILI';
    ctx.modal(c[1], `<div class="mappa-scheda">
      <p class="mappa-riga">${esc(c[2])} · ${ab}</p>
      <dl>
        <dt>CODICE ISTAT</dt><dd class="mappa-mono">${esc(c[0])}</dd>
        <dt>COORDINATE</dt><dd class="mappa-mono">${c[3].toFixed(4)}, ${c[4].toFixed(4)}</dd>
        <dt>TEMPERATURA</dt><dd>Non ancora collegata.</dd>
      </dl>
      <p>Il meteo per comune arriva con il livello Temperature, che richiede una fonte aggiornata da un processo sul server: non è ancora attivo, e finché non lo è non mostriamo un numero al suo posto.</p>
      <p class="mappa-fonte">FONTE  Elenco dei comuni ISTAT, tramite pacchetti derivati. Dato statico, non una misura.</p>
    </div>`, null);
  }

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
      zoomControl: false, attributionControl: false,
    }).setView(MAPPA_CENTRO, MAPPA_ZOOM);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, crossOrigin: true }).addTo(map);
    map.on('moveend', programma);
    map.on('zoomend', programma);
    orologio = setInterval(() => { if (!document.hidden) scriviStato(); }, 1000);
    document.addEventListener('visibilitychange', suVisibilita);

    for (const b of document.querySelectorAll('[data-livello]')) b.onclick = () => {
      const l = livelli.find(x => x.id === b.dataset.livello); if (!l) return;
      l.attivo = !l.attivo; b.setAttribute('aria-pressed', String(l.attivo));
      salvaLivelli(); disegna(); mostraVuoto();
    };
    const elenco = $('#mappa-elenco');
    if (elenco) elenco.onclick = () => {
      const lista = $('#mappa-lista'); if (!lista) return;
      lista.hidden = !lista.hidden;
      elenco.setAttribute('aria-expanded', String(!lista.hidden));
      scriviLista();
    };
    scriviStato();
    await carica();
    mostraVuoto();
  }

  // Regola d'oro della specifica: la mappa non deve mai essere vuota senza
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
      for (const l of livelli) if (l.pronto) l.attivo = true;
      for (const b of document.querySelectorAll('[data-livello]')) b.setAttribute('aria-pressed', 'true');
      salvaLivelli(); disegna(); mostraVuoto();
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
    strato = null;
    if (map) { map.remove(); map = null; }
  }

  return { page, bind, dispose, active: () => ctx.get().route === 'mappa-eventi', livelliAttesi: attesi };
}
