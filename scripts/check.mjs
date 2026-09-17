import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { build, read, root, scriptFiles } from './build.mjs';

for (const file of readdirSync(resolve(root, 'src')).filter(file => file.endsWith('.js'))) {
  new Script(read('src/' + file), { filename: 'src/' + file });
}
const html = build();
assert.ok(read('index.html') === html, 'index.html non allineato: eseguire npm run build.');
for (const file of scriptFiles) {
  assert.ok(!/<\/script\s*>/i.test(read('src/' + file)), file + ': chiusura script non protetta.');
}
const states = [...read('src/markup.html').matchAll(/<script type="application\/json" id="state">([\s\S]*?)<\/script>/g)];
assert.equal(states.length, 1, 'Occorre un solo blocco state.');
assert.ok(Array.isArray(JSON.parse(states[0][1]).posts), 'state.posts deve essere un array.');
for (const view of ['globe', 'map', 'weather', 'community', 'ai', 'profile']) {
  assert.ok(html.includes('id="v-' + view + '"'), 'Vista mancante: ' + view);
}
console.log('OK: sintassi JS, sincronizzazione index.html, stato JSON e sei viste.');
