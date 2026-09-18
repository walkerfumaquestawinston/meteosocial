// Grandine: avvisare prima, ma solo quando sta arrivando davvero.
//
// Regole della specifica, parte 3.3. Non basta che la grandine sia vicina:
// deve venire verso di te. Tutte e tre le condizioni devono valere insieme:
//   - almeno DUE segnalazioni concordi entro 3 km l'una dall'altra
//   - tempo stimato fra 3 e 40 minuti
//   - non piu' di un avviso di grandine all'ora per persona
// Fuori da questi limiti non si manda niente. Una stima sbagliata sulla
// grandine distrugge la fiducia piu' di quanto una giusta la costruisca.
//
// Funzione pura: nessuna rete, nessun database, nessun orologio implicito.
// Tutto entra dai parametri, cosi' si puo' provare per davvero.
//
// NOTA su una scelta non presa. Esiste gia' dist/arrival-estimate.js (H6) con
// la stessa formula ma due condizioni in piu': cento persone attive in zona e
// una validazione sul campo. E' una cautela del progetto, piu' stretta di
// questa specifica, ed e' ritirata dal bundle. Non l'ho ne' riattivata ne'
// modificata: qui si implementano le condizioni che la specifica chiede, e se
// si vuole tenere anche quella cautela e' una decisione del coordinatore.

const AVVISO_RAGGIO_CONCORDI_KM = 3;      // quanto vicine devono stare le segnalazioni fra loro
const AVVISO_MINIMO_CONCORDI = 2;
const AVVISO_MINUTI_MIN = 3;
const AVVISO_MINUTI_MAX = 40;
const AVVISO_PAUSA_MS = 3600000;          // un avviso all'ora per persona
const AVVISO_RAGGIO_PREDEFINITO_KM = 15;  // la distanza entro cui si viene avvisati
const AVVISO_COMPONENTE_MINIMA = 0.5;     // quanto deve puntare verso di te

const gradi = (x) => x * Math.PI / 180;

// Distanza in chilometri fra due punti sulla sfera terrestre.
function avvisoDistanzaKm(a, b) {
  const R = 6371;
  const dLat = gradi(b.lat - a.lat), dLon = gradi(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(gradi(a.lat)) * Math.cos(gradi(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Direzione in gradi dal punto A verso il punto B, 0 = nord, in senso orario.
function avvisoRotta(a, b) {
  const y = Math.sin(gradi(b.lon - a.lon)) * Math.cos(gradi(b.lat));
  const x = Math.cos(gradi(a.lat)) * Math.sin(gradi(b.lat)) - Math.sin(gradi(a.lat)) * Math.cos(gradi(b.lat)) * Math.cos(gradi(b.lon - a.lon));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

const avvisoNumero = (v) => Number.isFinite(v) ? v : null;

// Segnalazioni concordi: un gruppo di segnalazioni che stanno entro 3 km l'una
// dall'altra. Due persone che vedono grandine a venti chilometri di distanza
// non stanno confermando lo stesso fenomeno.
function avvisoGruppoConcorde(segnalazioni, centro) {
  return segnalazioni.filter(s => avvisoDistanzaKm(centro, s) <= AVVISO_RAGGIO_CONCORDI_KM);
}

export function valutaAvvisoGrandine({
  me,
  segnalazioni = [],
  vento,
  raggioKm = AVVISO_RAGGIO_PREDEFINITO_KM,
  ultimoAvviso = null,
  adesso = Date.now(),
  finestraMs = 7200000,   // le segnalazioni valgono due ore, come il resto della community
} = {}) {
  // Senza posizione, senza vento o senza segnalazioni non si stima niente.
  if (!me || !Number.isFinite(me.lat) || !Number.isFinite(me.lon)) return null;
  if (!vento || !Number.isFinite(vento.velocitaKmh) || !Number.isFinite(vento.direzioneGradi)) return null;
  if (vento.velocitaKmh <= 0) return null;
  if (!Array.isArray(segnalazioni) || !segnalazioni.length) return null;

  // Un avviso all'ora per persona: sotto quella soglia si tace, anche se tutto
  // il resto tornerebbe.
  if (Number.isFinite(ultimoAvviso) && adesso - ultimoAvviso < AVVISO_PAUSA_MS) return null;

  const valide = segnalazioni.filter(s =>
    s && Number.isFinite(s.lat) && Number.isFinite(s.lon) &&
    Number.isFinite(s.quando) && s.quando <= adesso && adesso - s.quando <= finestraMs);
  if (valide.length < AVVISO_MINIMO_CONCORDI) return null;

  // Il vento meteorologico si dichiara come direzione DA CUI viene: la
  // direzione verso cui si muove la nube e' quella opposta.
  const rottaVento = (vento.direzioneGradi + 180) % 360;

  let migliore = null;
  for (const s of valide) {
    const concordi = avvisoGruppoConcorde(valide, s);
    if (concordi.length < AVVISO_MINIMO_CONCORDI) continue;

    const distanzaKm = avvisoDistanzaKm(s, me);
    if (!(distanzaKm > 0) || distanzaKm > raggioKm) continue;

    // Quanto il vento punta da qui verso di me: 1 = dritto addosso, 0 = di
    // traverso, negativo = se ne sta andando.
    const versoDiMe = avvisoRotta(s, me);
    const scarto = gradi(((versoDiMe - rottaVento + 540) % 360) - 180);
    const componente = Math.cos(scarto);
    if (!(componente > AVVISO_COMPONENTE_MINIMA)) continue;

    const minuti = Math.round(60 * distanzaKm / (vento.velocitaKmh * componente));
    if (minuti < AVVISO_MINUTI_MIN || minuti > AVVISO_MINUTI_MAX) continue;

    // Fra piu' candidati vince quello che arriva prima.
    if (!migliore || minuti < migliore.minuti) {
      migliore = {
        minuti,
        distanzaKm: Math.round(distanzaKm * 10) / 10,
        concordi: concordi.length,
        // La dimensione si riporta solo se dichiarata: non si deduce.
        dimensione: concordi.map(c => c.dimensione).find(d => d && d !== 'unknown') || null,
        luogo: s.luogo || null,
        origine: { lat: s.lat, lon: s.lon },
      };
    }
  }
  if (!migliore) return null;

  // Il testo dice quello che sappiamo e quanto lo sappiamo. Niente certezze.
  const dove = migliore.luogo ? `a ${migliore.luogo}` : 'vicino a te';
  const quanti = migliore.concordi === 1 ? 'Lo dice 1 persona' : `Lo dicono ${migliore.concordi} persone`;
  migliore.titolo = `Grandine ${dove}, ${migliore.distanzaKm} km.`;
  migliore.testo = `Con questo vento può arrivare fra circa ${migliore.minuti} minuti. ${quanti}.`;
  migliore.avvertenza = 'Stima dal vento e dalle segnalazioni delle persone. Non è un’allerta ufficiale.';
  return migliore;
}

export const AVVISO_GRANDINE_REGOLE = {
  raggioConcordiKm: AVVISO_RAGGIO_CONCORDI_KM,
  minimoConcordi: AVVISO_MINIMO_CONCORDI,
  minutiMin: AVVISO_MINUTI_MIN,
  minutiMax: AVVISO_MINUTI_MAX,
  pausaMs: AVVISO_PAUSA_MS,
  raggioPredefinitoKm: AVVISO_RAGGIO_PREDEFINITO_KM,
  componenteMinima: AVVISO_COMPONENTE_MINIMA,
};
