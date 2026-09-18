// Genera dati/comuni.json: la tabella dei comuni italiani con le coordinate.
//
// È la fondazione della densità della Mappa (PROMPT-MAPPA, parte 1.2). Il file
// si genera una volta e poi si serve statico: l'elenco dei comuni non cambia
// se non per accorpamenti, rari e annunciati.
//
// PROVENIENZA DEI DATI. La specifica chiede di scaricare l'elenco da ISTAT, ma
// da questo ambiente istat.it non è raggiungibile: la politica di rete della
// sessione consente solo GitHub e i registri dei pacchetti. I dati vengono
// quindi da due pacchetti npm, entrambi MIT ed entrambi derivati da ISTAT:
//
//   italian-cap-comuni-province@1.1.1  → codice ISTAT, nome, provincia,
//                                        regione, latitudine, longitudine
//   comuni-json@1.0.0                  → popolazione, per codice ISTAT
//
// Non è la stessa cosa che scaricare da ISTAT: sono copie di terzi, con una
// data di aggiornamento propria. Vanno riverificate contro la fonte ufficiale
// quando l'accesso alla rete lo consente. L'attribuzione a ISTAT resta
// obbligatoria nell'interfaccia.
//
// USO (i pacchetti non entrano nelle dipendenze del progetto):
//   mkdir -p /tmp/comuni && cd /tmp/comuni && npm init -y
//   npm install italian-cap-comuni-province@1.1.1 comuni-json@1.0.0
//   node <percorso>/tools/genera-comuni.mjs /tmp/comuni/node_modules

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduli = process.argv[2];
if (!moduli || !fs.existsSync(moduli)) {
  console.error('Uso: node tools/genera-comuni.mjs <percorso di node_modules con i due pacchetti>');
  process.exit(1);
}

const radice = fileURLToPath(new URL('../', import.meta.url));

function trovaFileCap(base) {
  const dir = path.join(base, 'italian-cap-comuni-province');
  const trovati = [];
  (function cerca(d) {
    for (const v of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, v.name);
      if (v.isDirectory()) cerca(p);
      else if (/^gi_comuni_cap.*\.json$/.test(v.name)) trovati.push(p);
    }
  })(dir);
  if (!trovati.length) throw Error('file gi_comuni_cap non trovato in ' + dir);
  return trovati[0];
}

// Una riga per CAP: i comuni con più CAP compaiono più volte. Si tiene la prima.
const righe = JSON.parse(fs.readFileSync(trovaFileCap(moduli), 'utf8'));
const perIstat = new Map();
for (const r of righe) if (!perIstat.has(r.codice_istat)) perIstat.set(r.codice_istat, r);

// Popolazione dal secondo pacchetto, abbinata sul codice ISTAT.
const dirPop = path.join(moduli, 'comuni-json', 'data');
const popolazione = new Map();
for (const f of fs.readdirSync(dirPop)) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dirPop, f), 'utf8'));
    if (d.codice) popolazione.set(d.codice, d.popolazione);
  } catch { /* un file illeggibile non deve fermare la generazione */ }
}

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

const comuni = [];
for (const r of perIstat.values()) {
  const lat = num(r.lat), lng = num(r.lon);
  // Senza coordinate un comune non può stare sulla mappa: si scarta e si conta.
  if (lat === null || lng === null) continue;
  comuni.push({
    istat: r.codice_istat,
    nome: r.denominazione_ita,
    prov: r.sigla_provincia,
    regione: r.denominazione_regione,
    // 4 decimali: circa 11 metri, ben oltre il necessario per il punto di un
    // comune, e dimezza il peso del file su ottomila righe.
    lat: Math.round(lat * 1e4) / 1e4,
    lng: Math.round(lng * 1e4) / 1e4,
    // null, non 0: «non lo sappiamo» non è «nessun abitante».
    abitanti: popolazione.has(r.codice_istat) ? popolazione.get(r.codice_istat) : null,
    // Nessuna delle due fonti la riporta. Resta null finché non arriva una
    // fonte vera: inventarla sarebbe peggio che non averla.
    altitudine: null,
  });
}

// Ordinato per abitanti decrescente: i livelli di zoom diventano un taglio in
// testa all'array. I comuni senza popolazione vanno in fondo, non a zero.
comuni.sort((a, b) => (b.abitanti ?? -1) - (a.abitanti ?? -1) || a.nome.localeCompare(b.nome, 'it'));

fs.mkdirSync(path.join(radice, 'dati'), { recursive: true });
const dest = path.join(radice, 'dati', 'comuni.json');
fs.writeFileSync(dest, JSON.stringify(comuni) + '\n');

const senzaAbitanti = comuni.filter(c => c.abitanti === null).length;
const peso = fs.statSync(dest).size;
console.log(`dati/comuni.json: ${comuni.length} comuni, ${(peso / 1024).toFixed(0)} KB`);
console.log(`  righe grezze lette (una per CAP): ${righe.length}`);
console.log(`  scartati perché senza coordinate: ${perIstat.size - comuni.length}`);
console.log(`  senza popolazione (abitanti: null): ${senzaAbitanti}`);
console.log(`  senza altitudine (nessuna fonte): ${comuni.length}`);
