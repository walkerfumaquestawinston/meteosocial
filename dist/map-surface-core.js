import {weatherAge} from './map-city-labels.js';
import {modelTime} from './map-live-status.js';
import {validPlace} from './map-weather-core.js';

export const SURFACE_LIMITS={nearestKm:150,thirdKm:350};
const wrap=x=>((x+180)%360+360)%360-180;
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function hull(points){
 const sorted=[...points].sort((a,b)=>a.x-b.x||a.y-b.y),lower=[],upper=[];
 for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for(const p of sorted.reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
export function makeSurface(points,mode,now=Date.now()){
 if(!['temperature','vento'].includes(mode))return null;
 const groups=new Map();
 for(const p of points){
  const c=p.current,t=modelTime(c);
  if(!validPlace(p)||weatherAge(c,now).stale||t===null||Math.abs(p.latitude)>75)continue;
  const value=mode==='temperature'?c.temperature_2m:c.wind_speed_10m;
  if(!Number.isFinite(value)||(mode==='vento'&&(value<0||(value>0&&!Number.isFinite(c.wind_direction_10m)))))continue;
  const source=c.source||'Fonte del modello',key=source+':'+Math.floor(t/3600000);
  if(!groups.has(key))groups.set(key,[]);
  const group=groups.get(key);
  if(group.some(q=>Math.abs(q.latitude-p.latitude)<.001&&Math.abs(wrap(q.longitude-p.longitude))<.001))continue;
  const angle=(c.wind_direction_10m||0)*Math.PI/180;
  group.push({...p,value,time:t,source,u:-Math.sin(angle)*value,v:-Math.cos(angle)*value});
 }
 const samples=[...groups.values()].sort((a,b)=>b.length-a.length||b[0].time-a[0].time)[0];
 if(!samples||samples.length<3)return null;
 const origin=samples[0],cos=Math.cos(origin.latitude*Math.PI/180);
 const project=(lat,lon)=>({x:wrap(lon-origin.longitude)*111.195*cos,y:(lat-origin.latitude)*111.195});
 const nodes=samples.slice(0,64).map(p=>({...p,...project(p.latitude,p.longitude)}));
 const boundary=hull(nodes);if(boundary.length<3)return null;
 return {mode,nodes,boundary,project,source:origin.source,time:origin.time};
}
export function surfaceAt(surface,latitude,longitude){
 if(!surface||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>75)return null;
 const q=surface.project(latitude,longitude),{boundary,nodes}=surface;
 // Only inside the supporting polygon: no coloured extrapolation beyond the samples.
 for(let i=0;i<boundary.length;i++)if(cross(boundary[i],boundary[(i+1)%boundary.length],q)<-1e-7)return null;
 const near=nodes.map(p=>({p,d:Math.hypot(p.x-q.x,p.y-q.y)})).sort((a,b)=>a.d-b.d);
 if(near[0].d>SURFACE_LIMITS.nearestKm||near[2].d>SURFACE_LIMITS.thirdKm)return null;
 let sum=0,value=0,u=0,v=0;
 const support=near.filter(n=>n.d<=SURFACE_LIMITS.thirdKm);
 if(near[0].d<.001){const p=near[0].p;return {value:p.value,u:p.u,v:p.v,count:support.length};}
 for(const {p,d} of support){const w=1/(d*d);sum+=w;value+=p.value*w;u+=p.u*w;v+=p.v*w;}
 u/=sum;v/=sum;
 return {value:surface.mode==='vento'?Math.hypot(u,v):value/sum,u,v,count:support.length};
}
export function surfaceColor(value,mode){
 const stops=mode==='vento'?[[0,[91,194,223]],[20,[57,180,147]],[40,[246,181,61]],[60,[215,68,103]]]:[[-10,[66,99,222]],[0,[57,178,224]],[10,[67,186,151]],[20,[238,210,84]],[30,[245,134,58]],[40,[220,65,82]]];
 if(value<=stops[0][0])return stops[0][1];
 for(let i=1;i<stops.length;i++)if(value<=stops[i][0]){const [a,ca]=stops[i-1],[b,cb]=stops[i],f=(value-a)/(b-a);return ca.map((c,j)=>Math.round(c+(cb[j]-c)*f));}
 return stops.at(-1)[1];
}
