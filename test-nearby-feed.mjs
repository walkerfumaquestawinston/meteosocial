import assert from 'node:assert/strict';
import {selectNearby} from './dist/sky-community.js';
const now=Date.now(),place={latitude:0,longitude:0};
const report=(km,id='r')=>({id,latitude:km/6371*180/Math.PI,longitude:0,created:now-60000,expires:now+60000});
for(const [km,radius] of [[2,5],[10,15],[33,50],[120,150]]){
 const result=selectNearby([report(160,'outside'),report(km)],place,now);
 assert.equal(result.radius,radius);assert.equal(result.rows.length,1);assert.ok(Math.abs(result.rows[0].distanceKm-km)<.001);
}
assert.deepEqual(selectNearby([report(151)],place,now).rows,[]);
assert.equal(selectNearby([report(40,'far'),report(20,'close')],place,now).rows[0].id,'close');
assert.equal(selectNearby([{...report(2),expires:now}, {...report(2),created:now+1}, {...report(2),created:now-7200000}, {...report(2),latitude:NaN}],place,now).rows.length,0);
assert.equal(selectNearby([],{}).unavailable,true);
assert.equal(selectNearby([{...report(0),latitude:0,longitude:-179.99}],{latitude:0,longitude:179.99},now).radius,5);
console.log('Nearby feed: all four radii, nearest order, true distances, expiry, future dates, invalid coordinates and dateline passed.');
