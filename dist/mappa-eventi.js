// Public data normalizers and entry point for the weather atlas.
// The controller owns loading, map lifecycle, accessible panels and AI requests.

// Scala termica della specifica 5.3. Unica eccezione ai token del progetto,
// perche' e' una scala di dati e non un accento dell'interfaccia.
const MAPPA_SCALA = [[-10, '#4A6FA5'], [0, '#6BA3D6'], [10, '#8FD3C1'], [20, '#F2C14E'], [30, '#E8853F'], [40, '#C4453C']];

export function mappaColore(valore) {
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

// Le stesse categorie del Worker, con le stesse parole italiane: cambiare la
// strada da cui arrivano i dati non deve cambiare come si chiamano le cose.
export const MAPPA_GENERI = {
  wildfires: 'Incendio', severeStorms: 'Tempesta', floods: 'Alluvione', volcanoes: 'Vulcano',
  seaLakeIce: 'Ghiaccio', dustHaze: 'Polvere e foschia', drought: 'Siccità', landslides: 'Frana',
  snow: 'Neve', tempExtremes: 'Temperature estreme', earthquakes: 'Terremoto',
  waterColor: 'Colore delle acque', manmade: 'Evento segnalato',
};

// Il catalogo NASA cosi' come arriva, ridotto a quello che la mappa sa
// disegnare. Funzione pura e orologio dai parametri, perche' un catalogo vero
// contiene eventi chiusi, geometrie assenti e date future, e vanno scartati
// senza inventare una posizione al loro posto.
export function normalizzaEventiNasa(dati, adesso = Date.now()) {
  if (!Array.isArray(dati?.events)) return [];
  const eventi = [];
  for (const e of dati.events.slice(0, 300)) {
    if (!e || e.closed !== null || typeof e.id !== 'string') continue;
    // Si tiene la posizione piu recente fra quelle valide, come fa il Worker:
    // un evento che si muove ha piu punti, e il primo sarebbe quello vecchio.
    const g = (Array.isArray(e.geometry) ? e.geometry : [])
      .filter(p => p && p.type === 'Point' && Array.isArray(p.coordinates) && p.coordinates.length >= 2
        && p.coordinates.slice(0, 2).every(Number.isFinite)
        && Math.abs(p.coordinates[0]) <= 180 && Math.abs(p.coordinates[1]) <= 90
        && Number.isFinite(Date.parse(p.date)) && Date.parse(p.date) <= adesso + 600000)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
    if (!g) continue;
    const categoria = (Array.isArray(e.categories) ? e.categories : []).map(c => c?.id).find(id => MAPPA_GENERI[id]);
    const valore = MAPPA_GENERI[categoria] || 'Evento naturale';
    eventi.push({
      id: e.id, categoryId: categoria, name: String(e.title || valore).slice(0, 100), value: valore,
      latitude: g.coordinates[1], longitude: g.coordinates[0], at: Date.parse(g.date), started: Date.parse(g.date),
      color: '#ff5a47', detail: 'Ultima posizione nel catalogo; non una rilevazione istantanea.',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events/' + encodeURIComponent(e.id),
    });
  }
  return eventi;
}

// Open-Meteo risponde con una riga per coordinata, nello stesso ordine. Se il
// conto non torna l'abbinamento sarebbe una lotteria: meglio niente che una
// temperatura attribuita alla citta sbagliata.
export function abbinaMeteoCitta(blocco, righe) {
  if (!Array.isArray(righe) || righe.length !== blocco.length) return null;
  return righe.map((riga, i) => ({
    ...blocco[i],
    current: riga?.current && Number.isFinite(riga.current.temperature_2m) ? riga.current : null,
  }));
}


export {createMappaEventi} from './mappa-eventi-controller.js';
