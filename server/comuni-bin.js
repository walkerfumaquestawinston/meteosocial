// Lettore di dati/comuni.bin. Vive qui perche' gira dentro il Worker, dove
// node:fs non esiste: lo scrittore sta in tools/genera-comuni-bin.mjs, che
// importa da questo file. Cambiare il formato da una parte sola rompe l'altra,
// e test-comuni-bin.mjs fa il giro completo per accorgersene.
//
// Formato, tutto little-endian:
//   intestazione  5 × Uint32: magia, versione, numero comuni, byte delle
//                 etichette, byte del blocco dei nomi
//   etichette     JSON { province, regioni }: gli elenchi dei nomi, riferiti
//                 per indice dalle colonne prov e reg
//   colonne       istat Uint32 · lat Float32 · lng Float32 · abitanti Uint32 ·
//                 altitudine Uint16 · prov Uint8 · reg Uint8 · lunghezze Uint8
//   nomi          un blocco UTF-8 unico, tagliato dalle lunghezze
//
// A colonne e non a righe perche' valori simili stanno vicini e si comprimono:
// la colonna dell'altitudine, tutta ignota, costa 15 KB grezzi e zero con gzip.

export const COMUNI_MAGIC = 0x434d4e31;          // "CMN1"
export const COMUNI_ABITANTI_IGNOTI = 0xFFFFFFFF;
export const COMUNI_ALTITUDINE_IGNOTA = 0xFFFF;

export function leggiComuniBin(buffer) {
  const vista = new DataView(buffer.buffer ?? buffer, buffer.byteOffset ?? 0, buffer.byteLength);
  if (vista.getUint32(0, true) !== COMUNI_MAGIC) throw Error('non e un file comuni.bin');
  const versione = vista.getUint32(4, true);
  if (versione !== 1) throw Error('versione di comuni.bin non gestita: ' + versione);
  const n = vista.getUint32(8, true);
  const lunghezzaEtichette = vista.getUint32(12, true);
  const lunghezzaTesto = vista.getUint32(16, true);

  const grezzo = new Uint8Array(buffer.buffer ?? buffer, buffer.byteOffset ?? 0, buffer.byteLength);
  let p = 20;
  const { province, regioni } = JSON.parse(new TextDecoder().decode(grezzo.subarray(p, p + lunghezzaEtichette)));
  p += lunghezzaEtichette;
  // Le viste tipizzate vogliono l'allineamento: si copia la porzione invece di
  // affacciarsi sul buffer, perche' l'intestazione puo' lasciare p spaiato.
  const prendi = (Tipo, quanti) => {
    const byte = quanti * Tipo.BYTES_PER_ELEMENT;
    const v = new Tipo(grezzo.slice(p, p + byte).buffer);
    p += byte;
    return v;
  };
  const istat = prendi(Uint32Array, n), lat = prendi(Float32Array, n), lng = prendi(Float32Array, n);
  const abitanti = prendi(Uint32Array, n), altitudine = prendi(Uint16Array, n);
  const prov = prendi(Uint8Array, n), reg = prendi(Uint8Array, n);
  const lunghezze = prendi(Uint8Array, n);
  const testo = grezzo.subarray(p, p + lunghezzaTesto);
  const decoder = new TextDecoder();

  const fuori = new Array(n);
  // Gli scostamenti si ricostruiscono sommando le lunghezze: e' il motivo per
  // cui nel file ci sono quelle e non gli scostamenti assoluti.
  let inizio = 0;
  for (let i = 0; i < n; i++) {
    const fine = inizio + lunghezze[i];
    fuori[i] = [
      istat[i],
      decoder.decode(testo.subarray(inizio, fine)),
      province[prov[i]],
      regioni[reg[i]],
      // Float32 porta ~7 cifre: si arrotonda a 4 decimali, che sono ~11 metri
      // e la precisione che l'API dichiara.
      Math.round(lat[i] * 1e4) / 1e4,
      Math.round(lng[i] * 1e4) / 1e4,
      abitanti[i] === COMUNI_ABITANTI_IGNOTI ? null : abitanti[i],
      altitudine[i] === COMUNI_ALTITUDINE_IGNOTA ? null : altitudine[i],
    ];
    inizio = fine;
  }
  return fuori;
}

// Il Worker riceve il file in base64 dentro il proprio sorgente: e' l'unico
// modo per avere un binario in un Worker senza un fetch, e un fetch qui
// sarebbe esattamente la dipendenza di rete che questo formato elimina.
export function comuniDaBase64(testo) {
  const grezzo = atob(testo);
  const byte = new Uint8Array(grezzo.length);
  for (let i = 0; i < grezzo.length; i++) byte[i] = grezzo.charCodeAt(i);
  return leggiComuniBin(byte);
}
