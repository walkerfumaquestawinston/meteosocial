// La mappa quando il nostro server non risponde: chiede alle fonti da se'.
// Qui si prova la parte che decide cosa tenere e cosa buttare, senza rete:
// le funzioni sono pure e l'orologio entra dai parametri.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizzaEventiNasa, abbinaMeteoCitta, MAPPA_GENERI } from './dist/mappa-eventi.js';
import { CITTA_MONDO } from './dist/citta-mondo.js';

let n = 0;
const check = (v, label) => { assert.ok(v, label); n++; };
const eq = (a, b, label) => { assert.deepEqual(a, b, label); n++; };

const ADESSO = 1789000000000;
const QUANDO = new Date(ADESSO - 3600000).toISOString();

const evento = (extra = {}) => ({
  id: 'EONET_1', title: 'Incendio in California', closed: null,
  categories: [{ id: 'wildfires' }],
  geometry: [{ type: 'Point', coordinates: [-119.5, 37.2], date: QUANDO }],
  ...extra,
});

// --- il caso che deve funzionare ------------------------------------------
const uno = normalizzaEventiNasa({ events: [evento()] }, ADESSO);
eq(uno.length, 1, 'un evento aperto e completo viene tenuto');
eq(uno[0].value, 'Incendio', 'la categoria NASA diventa la parola italiana');
eq(uno[0].latitude, 37.2, 'la latitudine e la seconda coordinata, non la prima');
eq(uno[0].longitude, -119.5, 'la longitudine e la prima coordinata');
check(/non una rilevazione istantanea/.test(uno[0].detail), 'la scheda dichiara che non e una rilevazione istantanea');
check(uno[0].link.startsWith('https://eonet.gsfc.nasa.gov/'), 'il collegamento punta alla fonte');

// --- cosa va scartato, e non disegnato a caso -----------------------------
for (const [etichetta, e] of [
  ['evento chiuso', evento({ closed: '2026-09-01T00:00:00Z' })],
  ['senza geometria', evento({ geometry: [] })],
  ['geometria non puntuale', evento({ geometry: [{ type: 'Polygon', coordinates: [[0, 0]], date: QUANDO }] })],
  ['coordinate illeggibili', evento({ geometry: [{ type: 'Point', coordinates: ['x', 'y'], date: QUANDO }] })],
  ['longitudine fuori scala', evento({ geometry: [{ type: 'Point', coordinates: [200, 37], date: QUANDO }] })],
  ['latitudine fuori scala', evento({ geometry: [{ type: 'Point', coordinates: [12, 95], date: QUANDO }] })],
  ['data illeggibile', evento({ geometry: [{ type: 'Point', coordinates: [12, 42], date: 'ieri' }] })],
  ['data dal futuro', evento({ geometry: [{ type: 'Point', coordinates: [12, 42], date: new Date(ADESSO + 86400000).toISOString() }] })],
  ['identificativo mancante', evento({ id: undefined })],
]) eq(normalizzaEventiNasa({ events: [e] }, ADESSO), [], etichetta + ': scartato, non disegnato');

eq(normalizzaEventiNasa(null, ADESSO), [], 'risposta nulla: nessun evento, nessun errore');
eq(normalizzaEventiNasa({ events: 'niente' }, ADESSO), [], 'risposta malformata: nessun evento');

// Fra piu posizioni dello stesso evento vince la piu recente: un incendio che
// si sposta ha piu punti, e il primo sarebbe quello vecchio.
const mobile = normalizzaEventiNasa({
  events: [evento({
    geometry: [
      { type: 'Point', coordinates: [10, 40], date: new Date(ADESSO - 86400000).toISOString() },
      { type: 'Point', coordinates: [11, 41], date: QUANDO },
    ],
  })],
}, ADESSO);
eq(mobile[0].longitude, 11, 'di un evento in movimento si tiene la posizione piu recente');

// Una categoria che non conosciamo non fa sparire l'evento e non si inventa
// un nome: resta "Evento naturale".
const ignota = normalizzaEventiNasa({ events: [evento({ categories: [{ id: 'qualcosa-di-nuovo' }] })] }, ADESSO);
eq(ignota[0].value, 'Evento naturale', 'una categoria sconosciuta non viene tradotta a caso');
eq(ignota[0].categoryId, undefined, 'e non si finge di averla riconosciuta');

// Il titolo non cresce a dismisura dentro una scheda.
const lungo = normalizzaEventiNasa({ events: [evento({ title: 'x'.repeat(400) })] }, ADESSO);
eq(lungo[0].name.length, 100, 'il titolo viene tagliato a 100 caratteri');

check(Object.values(MAPPA_GENERI).every(v => typeof v === 'string' && v.length), 'ogni categoria ha una parola italiana');

// --- abbinamento meteo: mai la temperatura alla citta sbagliata -----------
const blocco = [{ name: 'Roma', latitude: 41.9, longitude: 12.5 }, { name: 'Milano', latitude: 45.5, longitude: 9.2 }];
const righe = [{ current: { temperature_2m: 24 } }, { current: { temperature_2m: 19 } }];

const abbinate = abbinaMeteoCitta(blocco, righe);
eq(abbinate.map(c => c.name), ['Roma', 'Milano'], 'le citta restano nel loro ordine');
eq(abbinate[0].current.temperature_2m, 24, 'la prima riga va alla prima citta');
eq(abbinate[1].current.temperature_2m, 19, 'la seconda riga va alla seconda citta');

eq(abbinaMeteoCitta(blocco, [righe[0]]), null, 'se mancano righe si butta il blocco invece di indovinare');
eq(abbinaMeteoCitta(blocco, [...righe, righe[0]]), null, 'se avanzano righe si butta il blocco');
eq(abbinaMeteoCitta(blocco, null), null, 'risposta non leggibile: nessun abbinamento');

// Una citta senza misura resta nell'elenco ma con current nullo: sara' la
// mappa a non disegnarla, e non si mette uno zero al posto del dato mancante.
const parziale = abbinaMeteoCitta(blocco, [{ current: null }, righe[1]]);
eq(parziale[0].current, null, 'senza misura resta null, non zero');
eq(parziale[1].current.temperature_2m, 19, 'la citta accanto conserva la sua misura');
eq(abbinaMeteoCitta(blocco, [{ current: { temperature_2m: 'caldo' } }, righe[1]])[0].current, null,
  'una temperatura non numerica vale come misura assente');

// --- l'elenco delle citta e una sola verita, non due copie ----------------
eq(CITTA_MONDO.length, 200, 'le citta del mondo sono 200');
check(CITTA_MONDO.every(c => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)), 'ogni citta ha coordinate leggibili');
check(CITTA_MONDO.every(c => Math.abs(c.latitude) <= 90 && Math.abs(c.longitude) <= 180), 'nessuna coordinata fuori dal mondo');
eq(new Set(CITTA_MONDO.map(c => c.id)).size, 200, 'nessuna citta ripetuta');

// Il Worker deve vederle con il nome che si aspetta: se il build smettesse di
// rinominarle, il meteo mondiale sparirebbe in silenzio.
const worker = readFileSync('dist/server/index.js', 'utf8');
const incorporate = worker.match(/const WORLD_CITIES=(\[.*?\]);/s);
check(incorporate, 'il Worker incorpora le citta come WORLD_CITIES');
eq(JSON.parse(incorporate[1]).length, CITTA_MONDO.length, 'il Worker ne ha esattamente quante ne ha il browser');
check(!/CITTA_MONDO/.test(worker), 'nel Worker non resta il nome del browser');

// L'elenco non deve pesare sull avvio di chi non apre mai la mappa.
check(!readFileSync('dist/app/main.js', 'utf8').includes(CITTA_MONDO[0].id),
  'le citta non sono nel bundle di avvio: si caricano solo se servono');

console.log(n + ' controlli mappa diretta superati: eventi NASA scartati e tenuti, abbinamento meteo, elenco citta unico.');
