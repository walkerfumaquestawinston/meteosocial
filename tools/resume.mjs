import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const required = ['.openai/hosting.json', 'build.mjs', 'dist/index.html', 'server/worker.js', 'drizzle/meta/_journal.json', 'AGENTS.md', 'PROJECT_STATUS.md'];

try {
  if (args.some(a => !['--check', '--prepare'].includes(a) && !/^--port=\d+$/.test(a))) throw Error('Usa --check, --prepare oppure --port=4591.');
  const { DatabaseSync } = await import('node:sqlite');
  const probe = new DatabaseSync(':memory:'); probe.close();
  for (const f of required) if (!fs.existsSync(path.join(root, f))) throw Error('Manca '+f+'. Estrai tutto il pacchetto.');
  const config = JSON.parse(fs.readFileSync(path.join(root, '.openai/hosting.json'), 'utf8'));
  if (config.project_id !== 'appgprj_6aa1e8ab06f88191ab364344053e48d9') throw Error('Questa cartella non identifica MeteoSocial.');
  console.log('MeteoSocial · progetto riconosciuto · Node '+process.versions.node);
  console.log('Sito online: https://scudo-meteo-community.walkerthehate.chatgpt.site');
  console.log('Prima di modificare, chiedi a Codex di recuperare l’ultima sorgente da Sites.');
  if (!args.includes('--check')) {
    const port = Number(args.find(a => a.startsWith('--port='))?.slice(7) || 4589);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Porta non valida.');
    if (!args.includes('--prepare')) await new Promise((resolve,reject) => {
      const server=net.createServer();server.once('error',()=>reject(Error('Porta '+port+' occupata. Chiudi la precedente anteprima o usa --port=4591.')));
      server.listen(port,'127.0.0.1',()=>server.close(resolve));
    });
    execFileSync(process.execPath, ['build.mjs'], {cwd:root,stdio:'inherit'});
    if (!args.includes('--prepare')) {
      const { startLocalPreview } = await import('./local-preview.mjs');
      const preview = await startLocalPreview({root,port});
      console.log('Anteprima locale pronta: '+preview.origin);
      console.log('Dati di prova separati. Premi Ctrl+C per chiudere.');
      if (!preview.aiConfigured) console.log('IA locale non configurata. Il collegamento del sito online resta attivo.');
      let closing=false;
      const stop=async()=>{if(closing)return;closing=true;await preview.close();process.exitCode=0};
      process.once('SIGINT',stop);process.once('SIGTERM',stop);
    }
  } else console.log('Controllo completato. Per avviare: node tools/resume.mjs');
} catch (error) {
  console.error(error.code==='ERR_UNKNOWN_BUILTIN_MODULE'?'Serve Node con node:sqlite. Chiedi a Codex di usare il runtime Node del proprio ambiente.':error.message);
  process.exitCode=1;
}
