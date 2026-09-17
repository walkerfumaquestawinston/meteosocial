// Natural Earth 1:110m land, public domain. See NATURAL-EARTH.txt.
// Surface triangles are unchanged. Coastlines use 0.5-degree Douglas-Peucker.
// Gzip-compressed MSLM v1: 24-byte little-endian header, Float32 XYZ vertices, Uint16 indices.
// Keep the existing exports so globe.js and its error fallback need no changes.
async function loadGeometry(){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(new URL('./land-mesh.bin',import.meta.url),{signal:controller.signal});
    if(!response.ok)throw Error('Geografia del globo non disponibile');
    const packed=await response.arrayBuffer();
    if(packed.byteLength>120000)throw Error('Geografia troppo grande');
    const stream=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const buffer=await new Response(stream).arrayBuffer(),view=new DataView(buffer);
    if(buffer.byteLength>2000000)throw Error('Geografia non valida');
    if(buffer.byteLength<24||view.getUint32(0,true)!==0x4d4c534d||view.getUint32(4,true)!==1)throw Error('Formato della geografia non valido');
    const landCount=view.getUint32(8,true),landLength=view.getUint32(12,true);
    const coastCount=view.getUint32(16,true),coastLength=view.getUint32(20,true);
    const vertexCount=landCount+coastCount,indexOffset=24+vertexCount*12;
    if(!landCount||!coastCount||landCount>65535||coastCount>65535||!landLength||!coastLength||landLength%3||coastLength%2||landLength>300000||coastLength>300000||buffer.byteLength!==indexOffset+(landLength+coastLength)*2)throw Error('Geografia incompleta');
    const vertices=new Float32Array(vertexCount*3);
    for(let i=0;i<vertices.length;i++){
      const value=view.getFloat32(24+i*4,true);
      if(!Number.isFinite(value))throw Error('Coordinate della geografia non valide');
      vertices[i]=value;
    }
    function expand(count,length,vertexStart,indexStart){
      const positions=new Float32Array(length*3);
      for(let i=0;i<length;i++){
        const index=view.getUint16(indexOffset+(indexStart+i)*2,true);
        if(index>=count)throw Error('Indice della geografia non valido');
        const source=(vertexStart+index)*3,target=i*3;
        positions[target]=vertices[source];positions[target+1]=vertices[source+1];positions[target+2]=vertices[source+2];
      }
      return positions;
    }
    return {landPositions:expand(landCount,landLength,0,0),coastPositions:expand(coastCount,coastLength,landCount,landLength)};
  }finally{clearTimeout(timeout)}
}
export const {landPositions,coastPositions}=await loadGeometry();
