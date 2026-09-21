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

// --- la mappa dev'essere raggiungibile, non solo esistere ------------------
// Per tre giorni la mappa nuova e' esistita senza che nessun collegamento ci
// portasse: bisognava scrivere l'indirizzo a mano. Questi controlli servono a
// non ripetere quell'errore in silenzio.
const { readFileSync } = await import('node:fs');
const html = readFileSync('dist/index.html', 'utf8');
const nav = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/)[0];
check(nav.includes('href="#mappa-eventi"'), 'la barra di navigazione porta alla mappa degli eventi');
check(!/<a href="#mappa">/.test(nav), 'la voce Mappa non punta piu alla vista precedente');

const app = readFileSync('dist/main.js', 'utf8');
check(app.includes("'mappa-classica':()=>living.page()"), 'la mappa di prima resta raggiungibile su #mappa-classica');
check(app.includes('mappa:()=>living.page()'), 'e il vecchio indirizzo continua a funzionare per chi lo aveva salvato');

const vista = readFileSync('dist/mappa-eventi-controller.js', 'utf8');
check(vista.includes('createAtlasRadar')&&vista.includes('mappa-radar-toggle'), 'radar accessibile direttamente sulla mappa');
check(app.includes("'mappa-eventi-view',r==='mappa-eventi'"), 'rotta a tutto schermo');
const foglio=readFileSync('dist/mappa-eventi.css','utf8');
check(/html\.mappa-eventi-view #main\{[^}]*padding:\s*0/.test(foglio),'la pagina si ritira');
check(/\.mappa\{[^}]*position:\s*fixed/.test(foglio),'viewport fisso');
check(/\.mappa-tela\{[^}]*background:\s*#0b1924/.test(foglio),'mappa scura senza tessere');
check(!/html\.mappa-eventi-view aside\{/.test(foglio),'il pannello dettagli non è nascosto con tutte le sidebar');
const {createMappaEventi}=await import('./dist/mappa-eventi.js');
const markup=createMappaEventi({esc:x=>String(x),get:()=>({})}).page();
for(const id of ['temperature','pioggia','grandine','vento','fulmini'])check(markup.includes('data-livello="'+id+'"'),'livello raggiungibile '+id);
check(markup.includes('id="mappa-ia-testo"')&&markup.includes('<form class="mappa-ia"'),'campo di testo IA');
const {mapAIRequest}=await import('./dist/map-weather-core.js');
const request=mapAIRequest({name:'Roma',latitude:41.9,longitude:12.5,author:'PRIVATE',photo:'PRIVATE'},'Piove?','Due città nella vista');
eq(Object.keys(request).sort(),['city','includeCommunity','latitude','longitude','section','layer','question','history'].sort(),'contratto con il backend meteo');
check(request.section==='map'&&request.includeCommunity===false&&!JSON.stringify(request).includes('PRIVATE'),'nessuna espansione a post/autori/media');
// Coordinate necessarie al nostro backend, escluse dal payload OpenAI: test-lente.mjs.
for(const query of ['', '?lat=&lon=', '?lat=42', '?lat=x&lon=13']){
 const r=await worker.fetch(new Request(base+'/api/mappa/grandine-avviso'+query),{});
 eq(r.status,400,'coordinate assenti/invalide non diventano zero');
}
console.log(n+' controlli mappa superati');
