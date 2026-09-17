import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const scriptFiles = [
  'textures.js', 'data.js', 'app.js', 'app-social-3d-ai.js',
  'app-v3.js', 'app-v4.js', 'app-v5.js', 'app-v6.js'
];
export const read = path => readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n');
export function build() {
  return read('src/document-start.html').trimEnd() + '\n' +
    read('src/styles-and-head.html').trimEnd() + '\n</head>\n<body>\n' +
    read('src/markup.html').trimEnd() + '\n' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n' +
    scriptFiles.map(file => '<script>\n' + read('src/' + file).trimEnd() + '\n</script>\n').join('') +
    '</body>\n</html>\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(resolve(root, 'index.html'), build());
  console.log('index.html ricostruito dai sorgenti.');
}
