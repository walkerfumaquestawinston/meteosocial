import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createLocalEnvironment, startLocalPreview } from './tools/local-preview.mjs';

const root=fileURLToPath(new URL('./',import.meta.url));
// Il numero atteso viene dal giornale Drizzle, non da una costante: ogni nuova
// migrazione additiva deve risultare applicata, senza aggiornare il test a mano.
const expectedMigrations=JSON.parse(fs.readFileSync(path.join(root,'drizzle/meta/_journal.json'),'utf8')).entries.length;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'meteosocial-portable-test-'));
let preview,local,checks=0;
const check=(value,expected)=>{assert.deepEqual(value,expected);checks++};
try {
  const dataDir=path.join(temp,'preview');
  local=createLocalEnvironment(root,dataDir);
  check((await local.env.DB.prepare('SELECT COUNT(*) AS n FROM _local_migrations').bind().first()).n,expectedMigrations);
  await local.env.BUCKET.put('../sample',new TextEncoder().encode('local sample'),{httpMetadata:{contentType:'text/plain'}});
  check((await local.env.BUCKET.get('../sample')).httpMetadata.contentType,'text/plain');
  local.close();local=null;
  local=createLocalEnvironment(root,dataDir);
  check(new TextDecoder().decode(await(await local.env.BUCKET.get('../sample')).arrayBuffer()),'local sample');
  check((await local.env.DB.prepare('SELECT COUNT(*) AS n FROM _local_migrations').bind().first()).n,expectedMigrations);
  await local.env.BUCKET.delete('../sample');check(await local.env.BUCKET.get('../sample'),null);
  local.close();local=null;

  preview=await startLocalPreview({root,port:0,dataDir,loadAi:false});
  check(preview.aiConfigured,false);
  const request=(p,opts={})=>fetch(preview.origin+p,opts);
  check((await request('/__local/status')).status,200);
  check((await(await request('/')).text()).includes('ANTEPRIMA LOCALE'),true);
  check((await(await request('/api/me')).json()).id,null);
  check((await(await request('/api/me',{headers:{'oai-authenticated-user-id':'spoofed','oai-authenticated-user-email':'spoof@example.invalid'}})).json()).id,null);
  check((await request('/api/profile',{method:'POST',body:JSON.stringify({name:'Wrong origin'})})).status,403);
  check((await request('/__local/login',{method:'POST',headers:{Origin:'https://example.invalid'},redirect:'manual'})).status,403);
  check((await(await request('/signin-with-chatgpt')).text()).includes('non si accede al vero account'),true);
  const login=await request('/__local/login',{method:'POST',headers:{Origin:preview.origin},redirect:'manual'});
  check(login.status,303);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  check(login.headers.get('set-cookie').includes('HttpOnly; SameSite=Strict'),true);
  check(typeof (await(await request('/api/me',{headers:{Cookie:cookie}})).json()).id,'string');
  check((await request('/api/profile',{method:'POST',headers:{Origin:preview.origin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({name:'Portable test'})})).status,200);
  check((await(await request('/api/me',{headers:{Cookie:cookie}})).json()).profile.name,'Portable test');
  await preview.close();preview=null;
  preview=await startLocalPreview({root,port:0,dataDir,loadAi:false});
  check((await(await request('/api/me',{headers:{Cookie:cookie}})).json()).id,null);
  const login2=await request('/__local/login',{method:'POST',headers:{Origin:preview.origin},redirect:'manual'});
  const cookie2=login2.headers.get('set-cookie').split(';')[0];
  check((await(await request('/api/me',{headers:{Cookie:cookie2}})).json()).profile.name,'Portable test');
  check((await request('/signout-with-chatgpt',{redirect:'manual'})).headers.get('set-cookie').includes('Max-Age=0'),true);
  await preview.close();preview=null;

  // Changed historical migrations must fail without silently erasing local work.
  const fixture=path.join(temp,'fixture');fs.mkdirSync(path.join(fixture,'drizzle/meta'),{recursive:true});
  const fixtureSql=path.join(fixture,'drizzle/0000.sql');
  fs.writeFileSync(path.join(fixture,'drizzle/meta/_journal.json'),JSON.stringify({entries:[{tag:'0000'}]}));
  fs.writeFileSync(fixtureSql,'CREATE TABLE retained (id INTEGER PRIMARY KEY);\r\n');
  local=createLocalEnvironment(fixture);await local.env.DB.prepare('INSERT INTO retained VALUES(?)').bind(42).run();local.close();local=null;
  fs.writeFileSync(fixtureSql,'CREATE TABLE retained (id INTEGER PRIMARY KEY);\n');
  local=createLocalEnvironment(fixture);check((await local.env.DB.prepare('SELECT id FROM retained').bind().first()).id,42);local.close();local=null;
  fs.appendFileSync(fixtureSql,'-- changed migration');
  assert.throws(()=>createLocalEnvironment(fixture),/già applicata è cambiata/);checks++;
  fs.writeFileSync(fixtureSql,'CREATE TABLE retained (id INTEGER PRIMARY KEY);\n');
  local=createLocalEnvironment(fixture);check((await local.env.DB.prepare('SELECT id FROM retained').bind().first()).id,42);local.close();local=null;
  console.log('Portable setup: '+checks+' checks passed; no production data or external AI requests.');
} finally {
  if(preview)await preview.close();if(local)local.close();
  const resolved=path.resolve(temp),parent=path.resolve(os.tmpdir());
  if(path.dirname(resolved)!==parent||!path.basename(resolved).startsWith('meteosocial-portable-test-'))throw Error('Unexpected test cleanup path');
  fs.rmSync(resolved,{recursive:true,force:true});
}
