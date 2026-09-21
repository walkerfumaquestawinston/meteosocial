// Fondamenta della mappa: il binario dei comuni deve restituire esattamente
// quello che c'e' nella tabella leggibile. Un errore qui non si vede come un
// guasto: si vede come un comune nel posto sbagliato, ed e' peggio.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scriviComuniBin } from './tools/genera-comuni-bin.mjs';
import { leggiComuniBin, comuniDaBase64, COMUNI_MAGIC } from './server/comuni-bin.js';

let n = 0;
const check = (v, label) => { assert.ok(v, label); n++; };
const eq = (a, b, label) => { assert.deepEqual(a, b, label); n++; };

const sorgente = JSON.parse(readFileSync('dati/comuni.json', 'utf8'));
const bin = readFileSync('dati/comuni.bin');
const letti = leggiComuniBin(bin);

// --- il file consegnato corrisponde alla tabella leggibile ----------------
// Se qualcuno modifica comuni.json e dimentica di rigenerare il binario, il
// Worker servirebbe dati vecchi senza che niente fallisca. Questo lo impedisce.
eq(letti.length, sorgente.length, 'il binario consegnato ha gli stessi comuni della tabella');
check(letti.length > 7000, 'i comuni sono migliaia, non una manciata: le fondamenta ci sono');

// --- andata e ritorno campo per campo -------------------------------------
let differenze = 0, peggiorLat = 0, peggiorLng = 0;
for (let i = 0; i < sorgente.length; i++) {
  const a = sorgente[i], b = letti[i];
  if (Number(a.istat) !== b[0] || a.nome !== b[1] || a.prov !== b[2] || a.regione !== b[3]) differenze++;
  if ((a.abitanti ?? null) !== b[6]) differenze++;
  if ((a.altitudine ?? null) !== b[7]) differenze++;
  peggiorLat = Math.max(peggiorLat, Math.abs(a.lat - b[4]));
  peggiorLng = Math.max(peggiorLng, Math.abs(a.lng - b[5]));
}
eq(differenze, 0, 'codice, nome, provincia, regione, abitanti e altitudine tornano identici');

// Le coordinate passano per Float32 e poi si arrotondano a 4 decimali, cioe'
// la precisione che l'API dichiara: lo scarto deve restare sotto quella soglia.
check(peggiorLat <= 1e-4 && peggiorLng <= 1e-4,
  `lo scarto delle coordinate resta entro i 4 decimali dichiarati (lat ${peggiorLat.toExponential(1)}, lng ${peggiorLng.toExponential(1)})`);

// --- l'ordine per abitanti e un contratto, non una comodita ---------------
// I livelli di zoom tagliano in testa all'array invece di filtrare: se
// l'ordine salta, la mappa mostra i comuni sbagliati senza errori.
let ordinato = true;
for (let i = 1; i < letti.length; i++) {
  const a = letti[i - 1][6], b = letti[i][6];
  if (a === null && b !== null) ordinato = false;
  if (a !== null && b !== null && b > a) ordinato = false;
}
check(ordinato, 'i comuni restano ordinati per abitanti decrescente, con gli ignoti in fondo');
eq(letti[0][1], 'Roma', 'il primo comune e il piu popoloso');

// --- i dati mancanti restano mancanti, non diventano zero -----------------
const senzaAbitanti = letti.filter(c => c[6] === null);
check(senzaAbitanti.length > 0, 'ci sono comuni senza popolazione dichiarata');
check(letti.every(c => c[6] === null || c[6] > 0), 'nessun comune finisce con zero abitanti: null non e zero');
check(letti.every(c => c[7] === null), 'l altitudine non e disponibile in nessuna fonte raggiungibile, e resta null');
check(senzaAbitanti.every((c, i, tutti) => i === 0 || true) && letti.slice(-senzaAbitanti.length).every(c => c[6] === null),
  'i comuni senza popolazione stanno tutti in fondo');

// --- il formato si difende da file non suoi -------------------------------
const rotto = Uint8Array.from(bin);
rotto[0] ^= 0xFF;
assert.throws(() => leggiComuniBin(rotto), /non e un file comuni.bin/, 'un file con la magia sbagliata viene rifiutato');
n++;
const versioneIgnota = Uint8Array.from(bin);
new DataView(versioneIgnota.buffer).setUint32(4, 99, true);
assert.throws(() => leggiComuniBin(versioneIgnota), /versione/, 'una versione non gestita viene rifiutata invece di essere letta a caso');
n++;
check(COMUNI_MAGIC === 0x434d4e31, 'la magia del formato e quella dichiarata');

// --- la strada che usa davvero il Worker ----------------------------------
// Il Worker non legge un file: riceve il binario in base64 dentro il proprio
// sorgente. Va provata quella strada, non solo quella comoda.
const daBase64 = comuniDaBase64(bin.toString('base64'));
eq(daBase64.length, letti.length, 'la lettura da base64 da lo stesso numero di comuni');
eq(daBase64[0], letti[0], 'e la stessa prima riga');
eq(daBase64[daBase64.length - 1], letti[letti.length - 1], 'e la stessa ultima riga');

// Ed e' davvero quello incorporato nel Worker costruito, non una copia.
const worker = readFileSync('dist/server/index.js', 'utf8');
const incorporato = worker.match(/const COMUNI_BIN="([^"]+)"/);
check(incorporato, 'il Worker costruito incorpora il binario dei comuni');
eq(incorporato[1], bin.toString('base64'), 'ed e esattamente il file consegnato, non una versione vecchia');
check(!/const MAPPA_COMUNI=\[\[/.test(worker), 'il vecchio letterale JavaScript non e rimasto nel Worker');

// --- lo scrittore si rifiuta di produrre un file sbagliato ----------------
assert.throws(() => scriviComuniBin([]), /vuoto/, 'non si scrive un file di fondamenta vuoto');
n++;
assert.throws(() => scriviComuniBin([
  { istat: 1, nome: 'A', prov: 'X', regione: 'Y', lat: 42, lng: 12, abitanti: 100, altitudine: null },
  { istat: 2, nome: 'B', prov: 'X', regione: 'Y', lat: 42, lng: 12, abitanti: 900, altitudine: null },
]), /ordinamento rotto/, 'un ordine crescente viene rifiutato invece di rompere la mappa in silenzio');
n++;
assert.throws(() => scriviComuniBin([
  { istat: 1, nome: 'A', prov: 'X', regione: 'Y', lat: 42, lng: 12, abitanti: null, altitudine: null },
  { istat: 2, nome: 'B', prov: 'X', regione: 'Y', lat: 42, lng: 12, abitanti: 900, altitudine: null },
]), /ordinamento rotto/, 'un comune senza abitanti prima di uno con abitanti viene rifiutato');
n++;
assert.throws(() => scriviComuniBin([
  { istat: 1, nome: 'A', prov: 'X', regione: 'Y', lat: NaN, lng: 12, abitanti: 1, altitudine: null },
]), /coordinate non valide/, 'una coordinata illeggibile viene rifiutata, non scritta come zero');
n++;

console.log(n + ' controlli comuni.bin superati: andata e ritorno, ordine per abitanti, dati mancanti, formato difeso, binario incorporato nel Worker.');
