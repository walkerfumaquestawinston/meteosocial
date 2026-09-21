import {weatherAge} from './map-city-labels.js';

// A successful HTTP response can still contain an expired server snapshot.
// Keep it only as an explicitly stale fallback if the direct provider also fails.
export async function readWeatherSnapshot(readServer,readDirect) {
  let previous;
  try {
    previous=await readServer();
    if(!previous.stale&&previous.cities?.length&&!previous.cities.some(p=>weatherAge(p.current).stale))return previous;
  } catch {}
  try {return await readDirect();}
  catch(error){if(previous?.cities?.length)return {...previous,stale:true};throw error;}
}
