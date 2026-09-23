import {sceneCondition} from './weather-scene.js';
import {miniWeather} from './weather-tools.js';

// Artwork is decorative. Nearby phenomena must not look like local observations.
export function sculptureAsset(current){
 if(!current||current.condition_nearby)return null;
 const condition=sceneCondition(current.weather_code);
 if(condition==='rain'||condition==='storm')return 'rain';
 if(condition==='snow')return 'snow';
 if(current.is_day===1&&['clear','clouds'].includes(condition))return 'clear-day';
 return null;
}
export function weatherSculpture(current){
 const asset=sculptureAsset(current);
 const icon=current?.condition_nearby||current?.is_day==null||sceneCondition(current?.weather_code)==='unknown'?'':miniWeather(current?.weather_code,current?.is_day===1);
 return `<div class="weather-sculpture ${asset?'has-art':'has-icon'}" aria-hidden="true">${asset?`<img src="/assets/weather-${asset}-3d.webp" alt="" width="640" height="640" decoding="async" fetchpriority="high">`:icon}</div>`;
}
