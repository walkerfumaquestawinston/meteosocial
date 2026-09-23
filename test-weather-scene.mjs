import assert from 'node:assert/strict';
import {sceneCondition,weatherScene} from './dist/weather-scene.js';
for(const [kind,codes] of Object.entries({clear:[0],clouds:[1,2],overcast:[3],fog:[45,48],rain:[51,53,55,56,57,61,63,65,66,67,80,81,82],snow:[71,73,75,77,85,86],storm:[95,96,99]}))for(const code of codes)assert.equal(sceneCondition(code),kind);
for(const code of [null,undefined,NaN,'0',-1,4,100])assert.equal(sceneCondition(code),'unknown');
for(const code of [0,2,3,45,63,75,95]){
 const html=weatherScene({current:{weather_code:code,wind_speed_10m:30}});
 assert.match(html,/aria-hidden="true"/);assert.match(html,/data-windy="true"/);
 assert.equal((html.match(/<i style=/g)||[]).length,[63,75,95].includes(code)?20:0);
 assert.ok(!html.includes('undefined'));assert.ok(!/<(?:img|video|iframe|script)/.test(html));
}
assert.match(weatherScene(null),/data-condition="unknown"/);
assert.match(weatherScene({current:{weather_code:61,condition_nearby:true}}),/data-condition="clouds"/,'nearby rain does not paint rain at the selected place');
assert.match(weatherScene({current:{weather_code:0,wind_speed_10m:24}}),/data-windy="false"/);
console.log('All WMO scene groups, missing/invalid data, wind threshold, decorative semantics and particle budget passed.');
