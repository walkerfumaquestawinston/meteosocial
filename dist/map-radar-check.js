// Inspect only the visible parts of low-zoom tiles. Unknown coverage is never dry.
export function visibleRadarTiles(bounds,zoom){
 const z=Math.max(0,Math.min(7,Math.floor(zoom))),n=2**z;
 if(bounds.east<=bounds.west||bounds.east-bounds.west>180||bounds.south< -85||bounds.north>85)return [];
 const px=lon=>(lon+180)/360*n,py=lat=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n;
 const left=px(bounds.west),right=px(bounds.east),top=py(bounds.north),bottom=py(bounds.south),tiles=[];
 for(let y=Math.floor(top);y<Math.ceil(bottom);y++)for(let x=Math.floor(left);x<Math.ceil(right);x++)tiles.push({z,x:((x%n)+n)%n,y,clip:[Math.max(0,Math.floor((left-x)*256)),Math.max(0,Math.floor((top-y)*256)),Math.min(256,Math.ceil((right-x)*256)),Math.min(256,Math.ceil((bottom-y)*256))]});
 return tiles.length<=12?tiles:[];
}
export function hasVisibleAlpha(pixels,clip,threshold=0){for(let y=clip[1];y<clip[3];y++)for(let x=clip[0];x<clip[2];x++)if(pixels[(y*256+x)*4+3]>threshold)return true;return false}
const images=new Map();
async function pixels(url,signal){
 if(images.has(url))return images.get(url);
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Radar unavailable');
 const bitmap=await createImageBitmap(await response.blob()),canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(bitmap,0,0,256,256);bitmap.close();const data=c.getImageData(0,0,256,256).data;images.set(url,data);if(images.size>100)images.delete(images.keys().next().value);return data;
}
export async function radarAreaState(frames,bounds,zoom,signal){
 if(!frames.length||Date.now()/1000-frames.at(-1).time>1500)return 'unknown';
 const tiles=visibleRadarTiles(bounds,zoom);if(!tiles.length)return 'unknown';const host=new URL(frames[0].url).origin;
 try{
 const covered=await Promise.all(tiles.map(async t=>!hasVisibleAlpha(await pixels(`${host}/v2/coverage/0/256/${t.z}/${t.x}/${t.y}/0/0_0.png`,signal),t.clip)));
 if(covered.some(v=>!v))return 'unknown';
 // Check the whole playable window, not just one dry frame of a passing shower.
 for(const f of [...frames].reverse()){
 const wet=await Promise.all(tiles.map(async t=>hasVisibleAlpha(await pixels(f.url.replace('{z}',t.z).replace('{x}',t.x).replace('{y}',t.y),signal),t.clip)));
 if(wet.some(Boolean))return 'wet';
 }
 return 'dry';
 }catch{return 'unknown'}
}
