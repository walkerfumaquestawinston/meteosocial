// Mappa eventi atmosferici — API dei comuni (specifica, parti 1.1 e 1.4).
//
// Il client non interroga mai una fonte esterna: chiede solo qui. Questo
// endpoint non chiama nulla all'esterno, perché l'elenco dei comuni e' statico
// e viaggia dentro il Worker: nessun limite di frequenza da rispettare e
// nessuna dipendenza che possa non rispondere.
//
// MAPPA_COMUNI viene iniettato da build.mjs a partire da dati/comuni.json, in
// forma compatta per non gonfiare il Worker:
//   [istat, nome, prov, regione, lat, lng, abitanti]
// abitanti puo' essere null: 387 comuni non ce l'hanno, e null non e' zero.

const MAPPA_ISTAT = 0, MAPPA_NOME = 1, MAPPA_PROV = 2, MAPPA_REGIONE = 3, MAPPA_LAT = 4, MAPPA_LNG = 5, MAPPA_AB = 6;

// Quanti nodi mostrare a ogni zoom (specifica 5.2). L'elenco e' gia' ordinato
// per abitanti decrescente, quindi il filtro e' un taglio in testa all'array.
//
// Scostamento dichiarato dalla specifica: ai livelli 6 e 7 chiede i capoluoghi
// di regione e di provincia, ma le fonti disponibili non hanno un campo
// "capoluogo" e ricavarlo dalla popolazione sbaglierebbe (L'Aquila e' capoluogo
// d'Abruzzo, Pescara e' piu' popolosa). Si usano quindi i piu' popolosi, che e'
// un criterio vero e dichiarabile, con gli stessi ordini di grandezza.
const MAPPA_LIVELLI = [
  { zoom: 6, primi: 20, etichetta: 'i 20 comuni piu popolosi' },
  { zoom: 7, primi: 107, etichetta: 'i 107 comuni piu popolosi' },
  { zoom: 8, minAbitanti: 50000, etichetta: 'oltre 50.000 abitanti' },
  { zoom: 9, minAbitanti: 20000, etichetta: 'oltre 20.000 abitanti' },
  { zoom: 10, minAbitanti: 5000, etichetta: 'oltre 5.000 abitanti' },
  { zoom: 11, etichetta: 'tutti i comuni nel riquadro' },
];

// Tetto di sicurezza: a zoom alto su un riquadro enorme il conteggio
// esploderebbe. Meglio troncare e dirlo che spedire meta' Italia.
const MAPPA_MAX = 1200;

function mappaLivello(zoom) {
  const z = Number.isFinite(zoom) ? Math.max(1, Math.min(20, Math.round(zoom))) : 11;
  for (const l of MAPPA_LIVELLI) if (z <= l.zoom) return { ...l, zoom: z };
  return { ...MAPPA_LIVELLI[MAPPA_LIVELLI.length - 1], zoom: z };
}

// bbox = ovest,sud,est,nord. Restituisce null se non e' leggibile: meglio
// nessun filtro dichiarato che un filtro sbagliato applicato in silenzio.
function mappaRiquadro(testo) {
  if (!testo) return null;
  const p = String(testo).split(',').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isFinite(n))) return null;
  const [ovest, sud, est, nord] = p;
  if (sud > nord || ovest > est) return null;
  if (Math.abs(sud) > 90 || Math.abs(nord) > 90 || Math.abs(ovest) > 180 || Math.abs(est) > 180) return null;
  return { ovest, sud, est, nord };
}

function mappaDentro(riga, r) {
  const lat = riga[MAPPA_LAT], lng = riga[MAPPA_LNG];
  return lat >= r.sud && lat <= r.nord && lng >= r.ovest && lng <= r.est;
}

// L'helper json() condiviso impone Cache-Control: no-store, ed e' giusto che lo
// faccia, perche' le altre API restituiscono dati personali. Qui i dati sono
// pubblici e identici per tutti, quindi la specifica chiede 5 minuti di cache:
// si costruisce la risposta a parte invece di allentare l'helper per tutti.
function mappaRisposta(corpo, stato = 200, cache = 'public, max-age=300') {
  return new Response(JSON.stringify(corpo), {
    status: stato,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function mappaApi(req, env, url) {
  if (url.pathname === '/api/mappa/meteo') return mappaMeteoApi(req, env, url);
  if (url.pathname !== '/api/mappa/comuni') return mappaRisposta({ error: 'Percorso non disponibile.' }, 404, 'no-store');
  if (req.method !== 'GET') return mappaRisposta({ error: 'Metodo non consentito.' }, 405, 'no-store');

  const riquadro = mappaRiquadro(url.searchParams.get('bbox'));
  // Attenzione: Number(null) vale 0 ed e' finito, quindi senza questo controllo
  // una richiesta senza zoom finirebbe al livello piu' basso invece che al
  // predefinito. NaN esplicito, cosi' mappaLivello applica davvero il suo 11.
  const zoomGrezzo = url.searchParams.get('zoom');
  const livello = mappaLivello(zoomGrezzo === null || zoomGrezzo === '' ? NaN : Number(zoomGrezzo));

  // Prima il taglio per popolazione, poi il riquadro: l'array e' ordinato, e
  // tagliare in testa costa molto meno che filtrare tutto e poi ordinare.
  let candidati;
  if (livello.primi) candidati = MAPPA_COMUNI.slice(0, livello.primi);
  else if (livello.minAbitanti) {
    candidati = [];
    for (const riga of MAPPA_COMUNI) {
      // null non passa la soglia: non sappiamo quanti sono, non fingiamo.
      if (riga[MAPPA_AB] === null || riga[MAPPA_AB] < livello.minAbitanti) break;
      candidati.push(riga);
    }
  } else candidati = MAPPA_COMUNI;

  const dentro = riquadro ? candidati.filter(r => mappaDentro(r, riquadro)) : candidati;
  const troncato = dentro.length > MAPPA_MAX;
  const scelti = troncato ? dentro.slice(0, MAPPA_MAX) : dentro;

  return mappaRisposta({
    // Le coordinate sono gia' a 4 decimali nella sorgente (circa 11 metri).
    campi: ['istat', 'nome', 'prov', 'lat', 'lng', 'ab'],
    dati: scelti.map(r => [r[MAPPA_ISTAT], r[MAPPA_NOME], r[MAPPA_PROV], r[MAPPA_LAT], r[MAPPA_LNG], r[MAPPA_AB]]),
    zoom: livello.zoom,
    criterio: livello.etichetta,
    riquadro: riquadro ? [riquadro.ovest, riquadro.sud, riquadro.est, riquadro.nord] : null,
    // Conteggi veri, mai stimati: la barra di stato li mostra come sono.
    mostrati: scelti.length,
    disponibili: dentro.length,
    totale: MAPPA_COMUNI.length,
    troncato,
    senzaAbitanti: MAPPA_COMUNI.length - MAPPA_COMUNI.filter(r => r[MAPPA_AB] !== null).length,
    fonte: 'ISTAT, tramite pacchetti derivati. Elenco statico, non una misura in tempo reale.',
  });
}

// ---- meteo per comune ------------------------------------------------------
//
// Il client non interroga mai Open-Meteo: con cento persone che aprono la mappa
// sarebbero centinaia di migliaia di chiamate all'ora e il servizio gratuito ci
// chiuderebbe la porta in un giorno. Qui il Worker chiede una volta sola per
// tutti, in blocchi, e conserva il risultato quindici minuti nella stessa cache
// che l'app usa gia' per il meteo mondiale.
//
// Quanti comuni: i 500 piu popolosi. Non sono tutti e 7.894, ed e' una scelta
// dichiarata, non una svista. Un giro completo sarebbe 79 chiamate e circa
// trenta secondi, troppo dentro la finestra di una richiesta; 500 sono cinque
// chiamate e un paio di secondi, e coprono per intero i livelli di zoom fino
// al 10, che filtrano per popolazione. Piu' in basso, sui centri piccoli, il
// meteo non c'e' e viene dichiarato assente invece di essere stimato.
const MAPPA_METEO_QUANTI = 500;
const MAPPA_METEO_BLOCCO = 100;

async function mappaMeteoDati(env) {
  return globeSnapshot(env, 'mappa-comuni-v1', async () => {
    const scelti = MAPPA_COMUNI.slice(0, MAPPA_METEO_QUANTI);
    const blocchi = [];
    for (let i = 0; i < scelti.length; i += MAPPA_METEO_BLOCCO) blocchi.push(scelti.slice(i, i + MAPPA_METEO_BLOCCO));
    const gruppi = await Promise.all(blocchi.map(async (blocco) => {
      const p = new URLSearchParams({
        latitude: blocco.map(r => r[MAPPA_LAT]).join(','),
        longitude: blocco.map(r => r[MAPPA_LNG]).join(','),
        current: 'temperature_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,cloud_cover',
        timezone: 'GMT',
      });
      let dati;
      try { dati = await atmoFetch('https://api.open-meteo.com/v1/forecast?' + p, 6000000); }
      catch { fail(503, 'Il meteo dei comuni non risponde. Resta disponibile l’ultimo dato già scaricato.'); }
      const righe = Array.isArray(dati) ? dati : [dati];
      return righe.map((r, i) => {
        const c = r?.current;
        // Senza temperatura leggibile non si scrive niente: meglio un comune
        // senza misura che un comune con una misura inventata.
        if (!c || !Number.isFinite(c.temperature_2m)) return null;
        return [
          blocco[i][MAPPA_ISTAT],
          Math.round(c.temperature_2m),
          Number.isFinite(c.precipitation) ? c.precipitation : null,
          Number.isFinite(c.weather_code) ? c.weather_code : null,
          Number.isFinite(c.wind_speed_10m) ? Math.round(c.wind_speed_10m) : null,
        ];
      }).filter(Boolean);
    }));
    const dati = gruppi.flat();
    return {
      campi: ['istat', 't', 'mm', 'codice', 'vento'],
      dati,
      chiesti: scelti.length,
      updated: Date.now(),
      source: 'Open-Meteo',
      fonte: 'Open-Meteo. Dato di modello, non una misura osservata da una stazione.',
    };
  });
}

async function mappaMeteoApi(req, env, url) {
  if (req.method !== 'GET') return mappaRisposta({ error: 'Metodo non consentito.' }, 405, 'no-store');
  if (!env?.DB) return mappaRisposta({ error: 'La cache del meteo non e disponibile.' }, 503, 'no-store');
  const dati = await mappaMeteoDati(env);
  // Un dato conservato non si presenta come fresco: chi legge deve poter
  // distinguere "adesso" da "l'ultimo che siamo riusciti a prendere".
  return mappaRisposta(dati, 200, dati.stale ? 'no-store' : 'public, max-age=300');
}
