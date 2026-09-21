// Shared rules for rendering, accessible lists and the AI's visible-area summary.
export const isStorm = code => [95, 96, 99].includes(code);
export const hailLabel = size => ({under1:'Meno di 1 cm','1to2':'Da 1 a 2 cm','2to4':'Da 2 a 4 cm',over4:'Oltre 4 cm'})[size] || 'Dimensione non dichiarata';
export const precipitationLabel = interval => Number.isFinite(interval) && interval > 0 ? `mm / ${Math.round(interval / 60)} min` : 'mm · intervallo non disponibile';
export const validPlace = p => !!p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
export function insideViewport(p, bounds) {
  if (!validPlace(p) || !bounds) return false;
  if (p.latitude < bounds.south || p.latitude > bounds.north) return false;
  if (Math.abs(bounds.east - bounds.west) >= 360) return true;
  const wrap = n => ((n + 180) % 360 + 360) % 360 - 180;
  const w = wrap(bounds.west), e = wrap(bounds.east), lng = wrap(p.longitude);
  return w <= e ? lng >= w && lng <= e : lng >= w || lng <= e;
}
export function weatherPoints(world, towns, readings, selected) {
  const points = towns.map(c => ({name:c[1],country_code:'IT',province:c[2],latitude:c[3],longitude:c[4],
    current:readings.has(c[0]) ? (()=>{const r=readings.get(c[0]);return {temperature_2m:r[1],precipitation:r[2],weather_code:r[3],wind_speed_10m:r[4],wind_direction_10m:r[5],interval:r[6],time:r[7]};})() : null}));
  const result = [];
  // Prefer the chosen location and then the more detailed Italian catalog.
  for (const p of [selected, ...points, ...world]) {
    if (!validPlace(p) || !Number.isFinite(p.current?.temperature_2m)) continue;
    if (result.some(q => q.name.toLocaleLowerCase() === p.name.toLocaleLowerCase() && Math.abs(q.latitude-p.latitude)<.2 && Math.abs(q.longitude-p.longitude)<.2)) continue;
    result.push(p);
  }
  return result;
}
export function visibleSummary(points, bounds) {
  const visible = points.filter(p => insideViewport(p,bounds));
  const sorted = [...visible].sort((a,b)=>a.current.temperature_2m-b.current.temperature_2m);
  return {points:visible,cold:sorted[0]||null,hot:sorted.at(-1)||null,
    rain:visible.filter(p=>Number.isFinite(p.current.precipitation)&&p.current.precipitation>0),
    storms:visible.filter(p=>isStorm(p.current.weather_code))};
}
export function mapAIRequest(place, question, summary, layer='temperatura', history=[]) {
  if (!validPlace(place)) throw Error('Scegli una località sulla mappa.');
  // Coordinates go only to our weather backend; assistant.js strips them from
  // the OpenAI payload. No authors, posts or media are added here. History is
  // limited to the last three explicit exchanges for the selected location.
  return {city:place.name,latitude:place.latitude,longitude:place.longitude,section:'map',layer,
    question:`Vista della mappa: ${summary.slice(0,600)}. Domanda: ${question.slice(0,700)}`,includeCommunity:false,
    history:history.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-6).map(m=>({role:m.role,text:m.text.slice(0,2000)}))};
}

export function windReading(current) {
  const speed=current?.wind_speed_10m,from=current?.wind_direction_10m;
  if(!Number.isFinite(speed)||speed<0)return null;
  const direction=Number.isFinite(from)?((from%360)+360)%360:null;
  return {speed,from:direction,toward:direction===null?null:(direction+180)%360,
    compass:direction===null?'Direzione non disponibile':['N','NE','E','SE','S','SO','O','NO'][Math.round(direction/45)%8],
    color:speed<20?'#74ded1':speed<40?'#ffc36c':'#ff8275'};
}
