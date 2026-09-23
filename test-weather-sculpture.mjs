import assert from 'node:assert/strict';
import {sculptureAsset,weatherSculpture} from './dist/weather-sculpture.js';
for(const code of [0,1,2]){
 assert.equal(sculptureAsset({weather_code:code,is_day:1}),'clear-day');
 for(const is_day of [0,null,undefined])assert.equal(sculptureAsset({weather_code:code,is_day}),null,'sun requires explicit daytime');
}
for(const code of [61,65,80,95,99])assert.equal(sculptureAsset({weather_code:code,is_day:0}),'rain');
for(const code of [71,75,85,86])assert.equal(sculptureAsset({weather_code:code}),'snow');
for(const code of [null,undefined,NaN,'0',3,45,48,100])assert.equal(sculptureAsset({weather_code:code,is_day:1}),null);
for(const code of [0,61,75,95])assert.equal(sculptureAsset({weather_code:code,is_day:1,condition_nearby:true}),null);
assert.equal(sculptureAsset(null),null);
assert.ok(!weatherSculpture(null).includes('<img'));
assert.match(weatherSculpture({weather_code:61,is_day:1}),/aria-hidden="true".*alt=""/);
console.log('Artwork respects WMO groups, daylight, nearby-only conditions and missing data.');
