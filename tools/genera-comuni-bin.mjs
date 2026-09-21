// Genera dati/comuni.bin dalla tabella leggibile dati/comuni.json.
//
// Perche' un binario: il formato a colonne mette vicini valori simili, quindi
// si comprime molto meglio del JSON, e il Worker lo tiene in memoria senza
// analizzare 1 MB di testo a ogni avvio.
//
// L'ORDINE PER ABITANTI DECRESCENTE E' UN CONTRATTO, non una comodita': i
// livelli di zoom tagliano in testa all'array invece di filtrare tutto. Chi
// riordina questo file rompe l'API della mappa senza che nessun test di
// compilazione se ne accorga. C'e' un controllo in test-comuni-bin.mjs.
//
// I dati mancanti hanno un valore riservato, mai zero: "non lo sappiamo" non
// e' "nessun abitante" ne' "livello del mare". Il lettore li riporta a null.
import fs from 'node:fs';
import { COMUNI_ABITANTI_IGNOTI, COMUNI_ALTITUDINE_IGNOTA, COMUNI_MAGIC, leggiComuniBin } from '../server/comuni-bin.js';


// Un comune italiano non supera i 2.900 m di quota; il valore riservato sta
// ben oltre, quindi non puo' mai collidere con una quota vera.
const ALTITUDINE_MASSIMA = 5000;

export function scriviComuniBin(comuni) {
  const n = comuni.length;
  if (!n) throw Error('elenco vuoto: non si scrive un file di fondamenta vuoto');

  for (let i = 1; i < n; i++) {
    const a = comuni[i - 1].abitanti, b = comuni[i].abitanti;
    // I comuni senza popolazione stanno in fondo: non hanno un posto
    // nell'ordinamento e fingere che ne abbiano uno sarebbe un dato inventato.
    if (a == null && b != null) throw Error('ordinamento rotto: un comune con abitanti dopo uno senza, posizione ' + i);
    if (a != null && b != null && b > a) throw Error('ordinamento rotto alla posizione ' + i + ': serve abitanti decrescente');
  }

  // Province e regioni come indici: 110 e 20 valori ripetuti 7.894 volte
  // pesano un byte ciascuno invece di una stringa.
  const province = [], regioni = [];
  const indice = (elenco, valore) => {
    const i = elenco.indexOf(valore);
    return i >= 0 ? i : elenco.push(valore) - 1;
  };

  const nomi = [];
  const istat = new Uint32Array(n), lat = new Float32Array(n), lng = new Float32Array(n);
  const abitanti = new Uint32Array(n), altitudine = new Uint16Array(n);
  const prov = new Uint8Array(n), reg = new Uint8Array(n);

  comuni.forEach((c, i) => {
    const codice = Number(c.istat);
    if (!Number.isInteger(codice) || codice < 0) throw Error('codice ISTAT non valido: ' + c.istat);
    if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) throw Error('coordinate non valide per ' + c.nome);
    istat[i] = codice;
    lat[i] = c.lat; lng[i] = c.lng;
    abitanti[i] = c.abitanti == null ? COMUNI_ABITANTI_IGNOTI : c.abitanti;
    altitudine[i] = c.altitudine == null ? COMUNI_ALTITUDINE_IGNOTA : c.altitudine;
    if (c.altitudine != null && (c.altitudine < 0 || c.altitudine > ALTITUDINE_MASSIMA))
      throw Error('altitudine fuori scala per ' + c.nome + ': ' + c.altitudine);
    prov[i] = indice(province, c.prov);
    reg[i] = indice(regioni, c.regione);
    nomi.push(c.nome);
  });

  if (province.length > 256 || regioni.length > 256)
    throw Error('province o regioni oltre 256: un byte non basta piu, serve Uint16');

  // I nomi in un blocco unico. L'indice non tiene gli scostamenti assoluti ma
  // le lunghezze: crescono sempre, quindi lo scostamento e' la somma di quelle
  // precedenti e si ricostruisce leggendo. Un Uint32 per comune sarebbero
  // 31 KB di numeri quasi identici; un byte per comune ne sono 8, e il nome
  // piu' lungo d'Italia sta comodamente sotto i 255 byte.
  const codifica = new TextEncoder();
  const testo = codifica.encode(nomi.join(''));
  const lunghezze = new Uint8Array(n);
  nomi.forEach((nome, i) => {
    const byte = codifica.encode(nome).length;
    if (byte > 255) throw Error('nome oltre 255 byte, un Uint8 non basta piu: ' + nome);
    lunghezze[i] = byte;
  });

  const etichette = new TextEncoder().encode(JSON.stringify({ province, regioni }));

  const intestazione = new Uint32Array([COMUNI_MAGIC, 1, n, etichette.length, testo.length]);
  const pezzi = [
    new Uint8Array(intestazione.buffer),
    etichette,
    new Uint8Array(istat.buffer), new Uint8Array(lat.buffer), new Uint8Array(lng.buffer),
    new Uint8Array(abitanti.buffer), new Uint8Array(altitudine.buffer),
    prov, reg,
    lunghezze, testo,
  ];
  const totale = pezzi.reduce((t, p) => t + p.length, 0);
  const fuori = new Uint8Array(totale);
  let cursore = 0;
  for (const p of pezzi) { fuori.set(p, cursore); cursore += p.length; }
  return fuori;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const comuni = JSON.parse(fs.readFileSync('dati/comuni.json', 'utf8'));
  const bin = scriviComuniBin(comuni);
  fs.writeFileSync('dati/comuni.bin', bin);
  const { gzipSync } = await import('node:zlib');
  console.log(`dati/comuni.bin scritto: ${comuni.length} comuni, ${bin.length} byte (${(bin.length / 1024).toFixed(1)} KB), ${(gzipSync(bin).length / 1024).toFixed(1)} KB con gzip`);
  const riletti = leggiComuniBin(bin);
  console.log(`riletti: ${riletti.length} comuni, il primo e ${riletti[0][1]} con ${riletti[0][6]} abitanti`);
}
