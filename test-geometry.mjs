import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {gzipSync,gunzipSync} from 'node:zlib';
const packed=fs.readFileSync('dist/assets/land-mesh.bin'),raw=gunzipSync(packed),source=fs.readFileSync('dist/assets/land-mesh.js','utf8');
async function load(bytes=packed,status=200){const context=vm.createContext({AbortController,setTimeout,clearTimeout,URL,Blob,Response,DecompressionStream,fetch:async()=>new Response(bytes,{status})});const m=new vm.SourceTextModule(source,{context,initializeImportMeta:meta=>meta.url='https://preview.invalid/assets/land-mesh.js'});await m.link(()=>{});await m.evaluate();return m.namespace}
let checks=0;assert(packed.length<120000);checks++;
const geometry=await load();assert.equal(geometry.landPositions.length,96930);assert.equal(geometry.coastPositions.length,1499*6);checks++;
for(const bad of [packed.slice(0,50),gzipSync(Buffer.from('invalid')),gzipSync(raw.subarray(0,raw.length-4))]){await assert.rejects(()=>load(bad));checks++}
await assert.rejects(()=>load(packed,404));checks++;
const nan=Buffer.from(raw);nan.writeFloatLE(NaN,24);await assert.rejects(()=>load(gzipSync(nan)));checks++;
const index=Buffer.from(raw),offset=24+(raw.readUInt32LE(8)+raw.readUInt32LE(16))*12;index.writeUInt16LE(65535,offset);await assert.rejects(()=>load(gzipSync(index)));checks++;
const geometryReport=JSON.parse(fs.readFileSync('tools/land-mesh-report.json'));assert(geometryReport.maxChordErrorDegrees<=.5&&geometryReport.coastRings===128&&geometryReport.landTrianglesUnchanged);checks++;
console.log(JSON.stringify({checks,compressedFileBytes:packed.length,decodedBinaryBytes:raw.length,coastSegments:1499,landTriangles:10770}));
