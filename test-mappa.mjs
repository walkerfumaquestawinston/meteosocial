// Mappa eventi atmosferici — API dei comuni.
// Nessuna rete: l'elenco e' statico dentro il Worker, quindi il test e'
// deterministico e non dipende da fonti esterne.
import assert from 'node:assert/strict';
import worker from './dist/server/index.js';

let n = 0;
const check = (v, label) => { assert.ok(v, label); n++; };
const eq = (a, b, label) => { assert.deepEqual(a, b, label); n++; };
const base = 'https://test.invalid';
const chiedi = async (qs = '', init) => {
  const r = await worker.fetch(new Request(base + '/api/mappa/comuni' + qs, init), {});
  return { stato: r.status, cache: r.headers.get('cache-control'), corpo: await r.json() };
};

// I livelli di zoom decidono quanti nodi: e' cio' che tiene la mappa piena
// senza disegnare ottomila punti insieme.
const perZoom = {};
for (const z of [5, 6, 7, 8, 9, 10, 11]) perZoom[z] = (await chiedi('?zoom=' + z)).corpo;
eq(perZoom[6].mostrati, 20, 'zoom 6: i 20 piu popolosi');
eq(perZoom[7].mostrati, 107, 'zoom 7: i 107 piu popolosi');
check(perZoom[5].mostrati === 20, 'sotto il 6 non si scende oltre i 20');
check(perZoom[8].disponibili > perZoom[7].mostrati, 'salendo di zoom i nodi crescono');
check(perZoom[9].disponibili > perZoom[8].disponibili, 'zoom 9 piu denso di zoom 8');
check(perZoom[10].disponibili > perZoom[9].disponibili, 'zoom 10 piu denso di zoom 9');
eq(perZoom[11].disponibili, perZoom[11].totale, 'a zoom 11 senza riquadro ci sono tutti i comuni');

// Le soglie dichiarate devono essere quelle vere, non un'etichetta di comodo.
const ab = (d) => d.dati.map(r => r[5]);
check(ab(perZoom[8]).every(v => v >= 50000), 'zoom 8: tutti sopra 50.000 abitanti');
check(ab(perZoom[9]).every(v => v >= 20000), 'zoom 9: tutti sopra 20.000 abitanti');
check(ab(perZoom[10]).every(v => v >= 5000), 'zoom 10: tutti sopra 5.000 abitanti');
check(perZoom[8].dati.every((r, i, a) => i === 0 || a[i - 1][5] >= r[5]), 'ordine per abitanti decrescente conservato');

// Il riquadro filtra sul server: al telefono non si manda mai l'Italia intera.
const marche = await chiedi('?zoom=11&bbox=12.8,42.6,13.9,43.6');
check(marche.corpo.mostrati > 0, 'il riquadro delle Marche non e vuoto');
check(marche.corpo.mostrati < perZoom[11].totale / 4, 'il riquadro riduce davvero il numero di nodi');
check(marche.corpo.dati.every(r => r[3] >= 42.6 && r[3] <= 43.6 && r[4] >= 12.8 && r[4] <= 13.9), 'nessun comune fuori dal riquadro richiesto');
eq(marche.corpo.riquadro, [12.8, 42.6, 13.9, 43.6], 'il riquadro applicato viene dichiarato nella risposta');

// Un riquadro illeggibile non deve essere applicato a meta: meglio nessun
// filtro dichiarato che un filtro sbagliato applicato in silenzio.
for (const [etichetta, qs] of [['illeggibile', '?bbox=pippo&zoom=11'], ['invertito', '?bbox=14,44,12,42&zoom=11'], ['incompleto', '?bbox=12,42&zoom=11'], ['fuori scala', '?bbox=-400,-99,400,99&zoom=11']]) {
  const r = await chiedi(qs);
  eq(r.stato, 200, 'riquadro ' + etichetta + ': risponde comunque');
  eq(r.corpo.riquadro, null, 'riquadro ' + etichetta + ': nessun filtro dichiarato');
}

// Onesta dei conteggi: mostrati e disponibili sono numeri veri, e il
// troncamento si dichiara invece di far sembrare che non ci sia altro.
check(perZoom[11].troncato === true, 'senza riquadro a zoom 11 la risposta e troncata');
check(perZoom[11].mostrati < perZoom[11].disponibili, 'troncata significa mostrati minore di disponibili');
eq(perZoom[11].dati.length, perZoom[11].mostrati, 'il conteggio dichiarato coincide con le righe consegnate');
check(!marche.corpo.troncato && marche.corpo.mostrati === marche.corpo.disponibili, 'un riquadro piccolo non viene troncato');

// Gli abitanti mancanti restano null: non lo sappiamo non e nessun abitante.
const tutti = (await chiedi('?zoom=11&bbox=6,35,19,48')).corpo;
check(tutti.dati.some(r => r[5] === null) || tutti.troncato, 'i comuni senza abitanti esistono e restano null');
check(!tutti.dati.some(r => r[5] === 0), 'nessun comune viene presentato con zero abitanti');
check(perZoom[11].senzaAbitanti > 0 && Number.isFinite(perZoom[11].senzaAbitanti), 'quanti comuni sono senza abitanti viene dichiarato');

// Ogni risposta porta la propria fonte: nessun elemento entra sulla mappa senza.
check(typeof perZoom[11].fonte === 'string' && /ISTAT/.test(perZoom[11].fonte), 'la fonte e dichiarata');
check(/statico|non una misura/i.test(perZoom[11].fonte), 'la fonte dichiara che e un elenco statico, non una misura');

// I dati sono pubblici e uguali per tutti: 5 minuti di cache, non no-store.
eq(perZoom[11].cache ?? (await chiedi('?zoom=11')).cache, 'public, max-age=300', 'cache pubblica di 5 minuti');

// Percorsi e metodi non previsti non devono passare.
const fuoriRotta = await worker.fetch(new Request(base + '/api/mappa/inesistente'), {});
eq(fuoriRotta.status, 404, 'un percorso non previsto risponde 404');
const scrittura = await worker.fetch(new Request(base + '/api/mappa/comuni', { method: 'POST' }), {});
eq(scrittura.status, 405, 'la scrittura non e consentita');

// Senza zoom si usa il predefinito, non il livello piu basso: Number(null) vale
// zero ed e finito, ed e proprio l'errore che questo controllo impedisce.
const senzaZoom = await chiedi('');
eq(senzaZoom.corpo.zoom, 11, 'senza zoom si applica il predefinito 11');

console.log(n + ' controlli mappa superati: livelli di zoom, soglie reali, riquadro, troncamento dichiarato, abitanti null, fonte, cache, metodi.');
