// Reproducible geometry build from the preserved baseline commit. Coast tolerance: 0.5 degrees.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
const original=execFileSync('git',['show','f5651e3df5e708074e8962167483765fd08a4571:dist/assets/land-mesh.js']);
const {landPositions,coastPositions}=await import('data:text/javascript;base64,'+original.toString('base64'));

const out='dist/assets';
fs.mkdirSync(out,{recursive:true});
const same=(a,b)=>a.every((v,i)=>v===b[i]);
const unit=p=>p.map(x=>x/Math.hypot(...p));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function segmentDistance(p,a,b){
  const ab=b.map((v,i)=>v-a[i]),ap=p.map((v,i)=>v-a[i]);
  const denominator=ab.reduce((s,v)=>s+v*v,0);
  const t=denominator?Math.max(0,Math.min(1,ap.reduce((s,v,i)=>s+v*ab[i],0)/denominator)):0;
  return distance(p,a.map((v,i)=>v+t*ab[i]));
}
// Unit-sphere chord distance handles the date line and poles without a map seam.
const tolerance=2*Math.sin(.5*Math.PI/360),maxChord=2*Math.sin(8*Math.PI/360);
function simplifyOpen(points){
  const norm=points.map(unit),keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
  while(stack.length){
    const [first,last]=stack.pop();if(last-first<2)continue;
    let farthest=first+1,error=-1;
    for(let i=first+1;i<last;i++){const d=segmentDistance(norm[i],norm[first],norm[last]);if(d>error){error=d;farthest=i}}
    if(error>tolerance||distance(norm[first],norm[last])>maxChord){
      if(error<=tolerance)farthest=Math.floor((first+last)/2);
      keep.add(farthest);stack.push([first,farthest],[farthest,last]);
    }
  }
  const retained=[...keep].sort((a,b)=>a-b);
  // Verify each removed point against its replacement segment.
  let error=0;
  for(let k=1;k<retained.length;k++)for(let i=retained[k-1];i<=retained[k];i++){
    error=Math.max(error,segmentDistance(norm[i],norm[retained[k-1]],norm[retained[k]]));
  }
  assert(error<=tolerance+1e-12);
  return {points:retained.map(i=>points[i]),error};
}
const rings=[];let ring=[];
for(let i=0;i<coastPositions.length;i+=6){
  const a=coastPositions.slice(i,i+3),b=coastPositions.slice(i+3,i+6);
  if(ring.length&&!same(ring.at(-1),a)){rings.push(ring);ring=[]}
  if(!ring.length)ring.push(a);ring.push(b);
}
if(ring.length)rings.push(ring);
const simplified=[];let maxError=0,retained=0;
for(const points of rings){
  assert(same(points[0],points.at(-1)),'Coast contour must be closed');
  const norms=points.map(unit);let split=1;
  for(let i=2;i<points.length-1;i++)if(distance(norms[0],norms[i])>distance(norms[0],norms[split]))split=i;
  const first=simplifyOpen(points.slice(0,split+1)),second=simplifyOpen(points.slice(split));
  let reduced=[...first.points,...second.points.slice(1)];
  // Retain tiny islands if tolerance would collapse the entire ring.
  if(new Set(reduced.map(p=>p.join(','))).size<3)reduced=points;
  assert(same(reduced[0],reduced.at(-1)));
  assert(new Set(reduced.map(p=>p.join(','))).size>=3);
  retained+=reduced.length-1;maxError=Math.max(maxError,first.error,second.error);
  for(let i=1;i<reduced.length;i++)simplified.push(...reduced[i-1],...reduced[i]);
}
function index(values){
  const positions=[],indices=[],seen=new Map();
  for(let i=0;i<values.length;i+=3){const xyz=values.slice(i,i+3),key=xyz.join(',');if(!seen.has(key)){seen.set(key,positions.length/3);positions.push(...xyz)}indices.push(seen.get(key))}
  assert(positions.length/3<65536);
  return {positions,indices};
}
const land=index(landPositions),coast=index(simplified);
const headerBytes=24,vertexBytes=(land.positions.length+coast.positions.length)*4;
const binary=Buffer.alloc(headerBytes+vertexBytes+(land.indices.length+coast.indices.length)*2);
binary.write('MSLM',0);binary.writeUInt32LE(1,4);
binary.writeUInt32LE(land.positions.length/3,8);binary.writeUInt32LE(land.indices.length,12);
binary.writeUInt32LE(coast.positions.length/3,16);binary.writeUInt32LE(coast.indices.length,20);
let offset=headerBytes;
for(const x of [...land.positions,...coast.positions]){assert(Number.isFinite(x));binary.writeFloatLE(x,offset);offset+=4}
for(const x of [...land.indices,...coast.indices]){binary.writeUInt16LE(x,offset);offset+=2}
assert.equal(offset,binary.length);
// Confirm all land triangles remain byte-identical to Three.js's old Float32 conversion.
let indexOffset=headerBytes+vertexBytes;
for(let i=0;i<landPositions.length;i++){
  const vertex=binary.readUInt16LE(indexOffset+Math.floor(i/3)*2);
  assert.equal(binary.readFloatLE(headerBytes+vertex*12+(i%3)*4),Math.fround(landPositions[i]));
}
const compressed=gzipSync(binary,{level:9});assert(compressed.length<120000);fs.writeFileSync(out+'/land-mesh.bin',compressed);

const report={status:'MSLM v1 gzip container; Float32 vertices and Uint16 indices',fileBytes:compressed.length,sourceBytes:original.length,sourceGzipBytes:gzipSync(original).length,binaryBytes:binary.length,binaryGzipBytes:gzipSync(binary).length,landTriangles:landPositions.length/9,landTrianglesUnchanged:true,coastRings:rings.length,coastSegmentsBefore:coastPositions.length/6,coastSegmentsAfter:retained,maxChordErrorDegrees:2*Math.asin(maxError/2)*180/Math.PI,coastVerticesPercent:100*retained/(coastPositions.length/6)};
fs.writeFileSync('tools/land-mesh-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
