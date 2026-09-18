// Avviso grandine: le tre condizioni della specifica 3.3, provate una per una.
// Nessuna rete, nessun database: la funzione e' pura e l'orologio entra dai
// parametri, quindi il risultato non dipende da quando si esegue il test.
import assert from 'node:assert/strict';
import { valutaAvvisoGrandine, AVVISO_GRANDINE_REGOLE as R } from './server/grandine-avviso.js';

let n = 0;
const check = (v, label) => { assert.ok(v, label); n++; };
const eq = (a, b, label) => { assert.deepEqual(a, b, label); n++; };

const ADESSO = 1789000000000;
// San Benedetto del Tronto. Un grado di latitudine ~111 km; 0,054° ~ 6 km.
const ME = { lat: 42.9434, lon: 13.8832 };
const A_NORD = (km) => ({ lat: ME.lat + km / 111, lon: ME.lon });

// Vento da nord: direzione meteorologica 0 significa "viene da nord", quindi
// la nube si muove verso sud, cioe' verso di me se sta a nord.
const VENTO_VERSO_DI_ME = { velocitaKmh: 30, direzioneGradi: 0 };
const VENTO_CONTRARIO = { velocitaKmh: 30, direzioneGradi: 180 };

const segn = (km, extra = {}) => ({ ...A_NORD(km), quando: ADESSO - 60000, dimensione: '2to4', luogo: 'Grottammare', ...extra });
const due = (km) => [segn(km), segn(km + 1, { luogo: 'Cupra' })];

const valuta = (o) => valutaAvvisoGrandine({ me: ME, vento: VENTO_VERSO_DI_ME, adesso: ADESSO, ...o });

// --- il caso che deve funzionare ------------------------------------------
const buono = valuta({ segnalazioni: due(6) });
check(buono, 'due segnalazioni concordi a 6 km sopravvento danno un avviso');
check(buono.minuti >= R.minutiMin && buono.minuti <= R.minutiMax, 'la stima sta fra 3 e 40 minuti');
eq(buono.concordi, 2, 'le segnalazioni concordi vengono contate');
check(buono.distanzaKm > 5 && buono.distanzaKm < 8, 'la distanza e quella vera, non arrotondata a caso');
eq(buono.dimensione, '2to4', 'la dimensione dichiarata viene riportata');
check(/km/.test(buono.titolo) && /minuti/.test(buono.testo), 'il messaggio dice distanza e minuti');
// Attenzione all'accento: il testo dice «Non è un'allerta ufficiale», e una
// regola scritta senza accento non lo troverebbe mai.
check(/allerta ufficiale/i.test(buono.avvertenza) && /non\s/i.test(buono.avvertenza), 'il messaggio dichiara che non e un allerta ufficiale');

// --- prima condizione: almeno due segnalazioni concordi --------------------
eq(valuta({ segnalazioni: [segn(6)] }), null, 'una sola segnalazione non basta');
// Due segnalazioni lontane fra loro non confermano lo stesso fenomeno.
eq(valuta({ segnalazioni: [segn(6), { ...segn(6), lon: ME.lon + 0.5 }] }), null,
  'due segnalazioni a oltre 3 km l una dall altra non sono concordi');

// --- seconda condizione: la stima fra 3 e 40 minuti ------------------------
// Troppo vicina: entrambe le segnalazioni devono stare sotto i 3 minuti, cioe
// entro circa 1,5 km con vento a 30 km/h. Basterebbe che una sola fosse piu
// lontana perche l avviso parta legittimamente.
eq(valutaAvvisoGrandine({ me: ME, vento: VENTO_VERSO_DI_ME, adesso: ADESSO, segnalazioni: [segn(0.4), segn(0.6, { luogo: 'Cupra' })] }), null,
  'troppo vicina: sotto i 3 minuti non si avvisa');
// Troppo lontana per il raggio predefinito.
eq(valuta({ segnalazioni: due(40) }), null, 'oltre il raggio di avviso non si avvisa');
// Vento lentissimo: la stima sfora i 40 minuti.
eq(valutaAvvisoGrandine({ me: ME, segnalazioni: due(12), vento: { velocitaKmh: 5, direzioneGradi: 0 }, adesso: ADESSO }), null,
  'con vento debole la stima supera i 40 minuti e non si avvisa');

// --- terza condizione: un avviso all ora ----------------------------------
eq(valuta({ segnalazioni: due(6), ultimoAvviso: ADESSO - 60000 }), null, 'un avviso mandato un minuto fa blocca il successivo');
check(valuta({ segnalazioni: due(6), ultimoAvviso: ADESSO - R.pausaMs - 1000 }), 'passata l ora si puo avvisare di nuovo');

// --- deve venire VERSO di me, non basta che sia vicina ---------------------
eq(valutaAvvisoGrandine({ me: ME, segnalazioni: due(6), vento: VENTO_CONTRARIO, adesso: ADESSO }), null,
  'con il vento che la porta via non si avvisa');
eq(valutaAvvisoGrandine({ me: ME, segnalazioni: due(6), vento: { velocitaKmh: 30, direzioneGradi: 90 }, adesso: ADESSO }), null,
  'con il vento di traverso la componente resta sotto soglia e non si avvisa');

// --- la distanza preferita cambia il risultato ----------------------------
eq(valuta({ segnalazioni: due(12), raggioKm: 5 }), null, 'con raggio 5 km una segnalazione a 12 km non avvisa');
check(valuta({ segnalazioni: due(12), raggioKm: 30 }), 'con raggio 30 km la stessa segnalazione avvisa');

// --- dati sporchi non devono produrre stime -------------------------------
for (const [etichetta, arg] of [
  ['senza posizione', { me: null, segnalazioni: due(6) }],
  ['posizione non finita', { me: { lat: NaN, lon: 13 }, segnalazioni: due(6) }],
  ['senza vento', { segnalazioni: due(6), vento: null }],
  ['vento fermo', { segnalazioni: due(6), vento: { velocitaKmh: 0, direzioneGradi: 0 } }],
  ['vento illeggibile', { segnalazioni: due(6), vento: { velocitaKmh: 'forte', direzioneGradi: 0 } }],
  ['senza segnalazioni', { segnalazioni: [] }],
  ['segnalazioni non valide', { segnalazioni: [{ lat: 'x', lon: 'y', quando: ADESSO }, { lat: null, lon: null, quando: ADESSO }] }],
]) eq(valutaAvvisoGrandine({ me: ME, vento: VENTO_VERSO_DI_ME, adesso: ADESSO, ...arg }), null, etichetta + ': nessuna stima');

// Segnalazioni vecchie o dal futuro non contano.
eq(valuta({ segnalazioni: due(6).map(s => ({ ...s, quando: ADESSO - 7200001 })) }), null, 'le segnalazioni piu vecchie di due ore non contano');
eq(valuta({ segnalazioni: due(6).map(s => ({ ...s, quando: ADESSO + 60000 })) }), null, 'le segnalazioni dal futuro non contano');

// --- la dimensione non si inventa -----------------------------------------
const senzaDim = valuta({ segnalazioni: due(6).map(s => ({ ...s, dimensione: 'unknown' })) });
check(senzaDim, 'senza dimensione dichiarata si avvisa lo stesso');
eq(senzaDim.dimensione, null, 'la dimensione non dichiarata resta null, non viene dedotta');

// --- fra piu candidati vince quello che arriva prima ----------------------
const multiplo = valuta({ segnalazioni: [...due(6), ...due(14).map(s => ({ ...s, luogo: 'Pedaso' }))] });
check(multiplo && multiplo.distanzaKm < 10, 'fra piu gruppi vince quello che arriva prima');

console.log(n + ' controlli avviso grandine superati: concordanza, finestra 3-40 minuti, un avviso all ora, direzione del vento, raggio preferito, dati sporchi.');
