// Approximate solar position: NOAA, https://gml.noaa.gov/grad/solcalc/solareqns.PDF
// UTC input; output matches the globe's x/east-negative-z coordinate convention.
export function solarDirection(time=Date.now()){
 const d=new Date(time),year=d.getUTCFullYear(),days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
 const day=Math.floor((time-Date.UTC(year,0,1))/86400000)+1;
 const hour=d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600;
 const g=2*Math.PI/days*(day-1+(hour-12)/24);
 const equation=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const lon=(180-(hour*60+equation)/4)*Math.PI/180;
 return [Math.cos(dec)*Math.cos(lon),Math.sin(dec),-Math.cos(dec)*Math.sin(lon)];
}
export function daylight(dot){const t=Math.min(1,Math.max(0,(dot+Math.sin(Math.PI/90))/(2*Math.sin(Math.PI/90))));return t*t*(3-2*t)}
