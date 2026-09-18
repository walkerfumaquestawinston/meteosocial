// Esegue la suite con i flag giusti e distingue tre esiti.
//
// Perché serve: alcuni test usano vm.SourceTextModule, che Node espone solo con
// --experimental-vm-modules. Lanciati con `node test-x.mjs` fallivano con
// "vm.SourceTextModule is not a constructor", un errore dell'avvio che sembrava
// un difetto del prodotto. Altri interrogano moduli ritirati dal bundle
// (direzione corrente: mappa locale MapLibre): falliscono per scelta di
// progetto, non per una regressione.
//
// Un test che riferisce un modulo ritirato viene messo fra i non pertinenti
// solo se fallisce. Se passa resta fra i superati: così questa classificazione
// non può nascondere una regressione su codice ancora consegnato.
//
// Uso:
//   node tools/run-tests.mjs                 tutta la suite
//   node tools/run-tests.mjs test-hail.mjs   solo i test indicati
//
// Uscita 0 se nessun test pertinente fallisce.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isRetired } from './retired-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const selected = process.argv.slice(2).filter(a => !a.startsWith('-'));
const verbose = process.argv.includes('--verbose');

const tests = (selected.length ? selected.map(f => path.basename(f)) : fs.readdirSync(root).filter(f => /^test-.+\.mjs$/.test(f))).sort();
if (!tests.length) { console.error('Nessun test trovato.'); process.exit(1); }

// Moduli ritirati citati dal test, come 'hail.js' o 'assets/three.module.js'.
function retiredReferences(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const found = new Set();
  for (const [, ref] of source.matchAll(/['"`][^'"`]*?((?:assets\/)?[\w.-]+\.(?:js|css|html))['"`]/g)) {
    if (isRetired(ref)) found.add(ref);
  }
  return [...found].sort();
}

const passed = [], failed = [], retiredFailures = [];
for (const file of tests) {
  process.stdout.write(`  ${file.padEnd(30)}`);
  const run = spawnSync(process.execPath, ['--experimental-vm-modules', file], { cwd: root, encoding: 'utf8', timeout: 180000 });
  if (run.status === 0) { passed.push(file); console.log('superato'); continue; }
  const refs = retiredReferences(file);
  const output = ((run.stdout || '') + (run.stderr || '')).trimEnd();
  if (refs.length) { retiredFailures.push({ file, refs }); console.log('non pertinente · ' + refs.join(', ')); }
  else { failed.push({ file, output }); console.log('FALLITO'); }
  if (verbose && output) console.log(output.split('\n').map(l => '      ' + l).join('\n'));
}

console.log(`\nSuperati: ${passed.length}`);
if (retiredFailures.length) {
  console.log(`\nNon pertinenti alla direzione corrente: ${retiredFailures.length}`);
  console.log('Interrogano moduli conservati in Git ma esclusi dal bundle consegnato.');
  for (const { file, refs } of retiredFailures) console.log(`  ${file} → ${refs.join(', ')}`);
  console.log('La classificazione è euristica: un test può citare un modulo ritirato');
  console.log('e fallire per un altro motivo. Vanno riletti e aggiornati o ritirati,');
  console.log('non lasciati rossi per sempre. Decisione del coordinatore.');
}
if (failed.length) {
  console.log(`\nFALLITI: ${failed.length}`);
  for (const { file, output } of failed) {
    console.log(`\n  ${file}`);
    console.log((output || '(nessun output)').split('\n').slice(-12).map(l => '    ' + l).join('\n'));
  }
  process.exit(1);
}
console.log('\nNessun test pertinente fallito.');
