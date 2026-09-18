// Prepara la cartella statica che Netlify pubblica.
//
// Perché serve: su Sites il sito non è una cartella statica, è un Worker che
// incorpora gli asset (dist/server/index.js). Alcuni file che il Worker serve
// dalla radice della richiesta stanno sul disco fuori da dist/: manifest.json e
// icons/. Pubblicando dist/ e basta, /manifest.json e /icons/* darebbero 404,
// quindi niente installazione della PWA e niente anteprima nei social.
//
// Questo script mette insieme la stessa gerarchia che il Worker espone:
//   dist/*            → /*            (index.html, sw.js, moduli e fogli di stile)
//   dist/app/*        → /app/*        (bundle e CSS generati)
//   dist/assets/*     → /assets/*     (MapLibre, Leaflet, font, licenze)
//   manifest.json     → /manifest.json
//   icons/*           → /icons/*
//
// Restano fuori dist/server (il Worker, che su Netlify non gira) e dist/.openai
// (manifesto di hosting e migrazioni, che non vanno esposti).
//
// Le API non sono qui: le serve il proxy dichiarato in netlify.toml.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'netlify-dist');
const ESCLUSI = new Set(['server', '.openai']);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let copiati = 0;
function copia(da, a) {
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.copyFileSync(da, a);
  copiati++;
}
function copiaCartella(da, a) {
  for (const voce of fs.readdirSync(da, { withFileTypes: true })) {
    const sorgente = path.join(da, voce.name), destinazione = path.join(a, voce.name);
    if (voce.isDirectory()) copiaCartella(sorgente, destinazione);
    else copia(sorgente, destinazione);
  }
}

for (const voce of fs.readdirSync(path.join(root, 'dist'), { withFileTypes: true })) {
  if (ESCLUSI.has(voce.name)) continue;
  const sorgente = path.join(root, 'dist', voce.name), destinazione = path.join(out, voce.name);
  if (voce.isDirectory()) copiaCartella(sorgente, destinazione);
  else copia(sorgente, destinazione);
}

copia(path.join(root, 'manifest.json'), path.join(out, 'manifest.json'));
copiaCartella(path.join(root, 'icons'), path.join(out, 'icons'));

// Se uno di questi manca, la pagina si apre lo stesso ma si rompe qualcosa di
// preciso: meglio fermare la pubblicazione che accorgersene dal telefono.
const attesi = ['index.html', 'app/main.js', 'app/style.css', 'sw.js', 'manifest.json', 'icons/icon-192.png'];
const mancanti = attesi.filter(f => !fs.existsSync(path.join(out, f)));
if (mancanti.length) {
  console.error('netlify-publish: mancano file attesi: ' + mancanti.join(', '));
  console.error('Esegui prima `node build.mjs`.');
  process.exit(1);
}

console.log(`netlify-publish: ${copiati} file in netlify-dist/`);
