import {weatherDescription} from './weather-tools.js';
import {weatherName,forecastSource} from './weather-tools.js';

// posts.map_lat/map_lon are integer centidegrees, never raw degrees.
export function postPlace(post) {
  if (!Number.isInteger(post?.map_lat)||!Number.isInteger(post?.map_lon)||Math.abs(post.map_lat)>9000||Math.abs(post.map_lon)>18000) return null;
  return {name:post.city,latitude:post.map_lat/100,longitude:post.map_lon/100};
}

// No inferred danger or precise location is sent to an AI model here.
export function sameSkyTopic(weather) {
  if (!weather?.current || weather._offline || weather.current.condition_nearby) return null;
  const observed = Number.isFinite(weather.current.time_epoch)?weather.current.time_epoch*1000:Date.parse(weather.current.time+'Z')-Number(weather.utc_offset_seconds||0)*1000;
  if (!Number.isFinite(observed) || Date.now()-observed>7200000 || observed>Date.now()+300000) return null;
  const code = weather.current.weather_code;
  if (!Number.isFinite(code)) return null;
  if ([0,1].includes(code)) return 'Cielo sereno';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'Pioggia';
  if ([71,73,75,77,85,86].includes(code)) return 'Neve';
  // Forecast thunderstorm codes are not observations of hail/lightning strikes.
  return null;
}

export function communityForecast(weather) {
  const current=weather?.current;
  if (!Number.isFinite(current?.temperature_2m)) return {temperature:'—',description:'Previsioni in attesa. Puoi già esplorare i racconti.',source:'Dato meteo non disponibile'};
  return {
    temperature:Math.round(current.temperature_2m)+'°',
    description:weatherDescription(current),
    source:`${weather._offline?'Dati salvati · ':''}${forecastSource(weather)} · ${current.time?.replace('T',' ')||'orario non disponibile'}${weather.timezone?' · '+weather.timezone:''}`
  };
}
