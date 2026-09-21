// Reproducible, public-domain Natural Earth geography. Run only when updating the atlas.
import fs from 'node:fs';
const revision='ca96624a56bd078437bca8184e78163e5039ad19';
const base='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/'+revision+'/geojson/';
const segmentDistance=(p,a,b)=>{
  let x=a[0],y=a[1],dx=b[0]-x,dy=b[1]-y;
  if(dx||dy){const t=((p[0]-x)*dx+(p[1]-y)*dy)/(dx*dx+dy*dy);if(t>1){x=b[0];y=b[1];}else if(t>0){x+=dx*t;y+=dy*t;}}
  return (p[0]-x)**2+(p[1]-y)**2;
};
function simplify(points,tolerance=.025){
  const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
  while(stack.length){const [a,b]=stack.pop();let max=tolerance*tolerance,index=-1;
    for(let i=a+1;i<b;i++){const d=segmentDistance(points[i],points[a],points[b]);if(d>max){max=d;index=i;}}
    if(index!==-1){keep.add(index);stack.push([a,index],[index,b]);}
  }
  const result=[...keep].sort((a,b)=>a-b).map(i=>points[i].map(n=>+n.toFixed(3)));
  return result.length<4&&points.length>=4?points.map(p=>p.map(n=>+n.toFixed(3))):result;
}
function coordinates(c){return typeof c[0]?.[0]==='number'?simplify(c):c.map(coordinates);}
async function source(name){
  const r=await fetch(base+name+'.geojson');if(!r.ok)throw Error(name+': '+r.status);return r.json();
}
const [land,borders,countries]=await Promise.all([
  source('ne_50m_land'),source('ne_50m_admin_0_boundary_lines_land'),source('ne_110m_admin_0_countries')
]);
const clean=d=>{const polygons=d.features[0].geometry.type.includes('Polygon');return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:polygons?'MultiPolygon':'MultiLineString',coordinates:d.features.flatMap(f=>f.geometry.type.startsWith('Multi')?coordinates(f.geometry.coordinates):[coordinates(f.geometry.coordinates)])}}]};};
const regions=countries.features.map(f=>({name:f.properties.NAME_IT||f.properties.NAME,lat:f.properties.LABEL_Y,lon:f.properties.LABEL_X,rank:f.properties.LABELRANK})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
const output='// Natural Earth 50m land and boundaries; public domain. See tools/generate-map-geography.mjs.\n'+
  'export const atlasLand='+JSON.stringify(clean(land))+';\nexport const atlasBorders='+JSON.stringify(clean(borders))+';\nexport const atlasRegions='+JSON.stringify(regions)+';\n';
fs.writeFileSync('dist/map-land.js',output);
console.log('Geography: '+Buffer.byteLength(output)+' bytes, '+regions.length+' country labels.');
