import assert from 'node:assert/strict';
import {observedVerdict} from './server/observed-verdict.js';

// Synthetic fixtures, never sent to the site or any external service.
const hour = 3600000, base = Date.UTC(2026, 8, 17, 6);
const snapshot = {id:'fixture', stationId:'test-station', capturedAt:base,
  slots:[1,4,7,10,13].map(n=>({at:base+n*hour,tempC:20,rainMm:0}))};
const observations = snapshot.slots.map(s=>({stationId:snapshot.stationId,
  at:s.at,receivedAt:s.at+hour,
  temp:{value:20,source:'test-observed',kind:'observation'},
  rain:{value:0,source:'test-observed',kind:'observation',start:s.at-hour}}));
const options = {now:base+15*hour,rainThresholdMm:0.1,
  allowedSources:{temp:['test-observed'],rain:['test-observed']}};
const compare = (obs=observations, opts=options, snap=snapshot)=>observedVerdict(snap,obs,opts);
assert.equal(compare().status,'complete');
assert.deepEqual(compare().slots,{expected:5,compared:5,errors:0});
assert.equal(compare([]).status,'unavailable');
assert.equal(compare([]).slots.compared,0);

let changed=structuredClone(observations);
changed[0].temp.value=23; changed[1].temp.value=23.01;
changed[2].rain.value=0.1; changed[3].rain.value=0.11;
assert.equal(compare(changed).temperature.errors,1);
assert.equal(compare(changed).rain.errors,1);
assert.equal(compare(changed).slots.errors,2);

for (const bad of [null,undefined,NaN,'0',Infinity]) {
  changed=structuredClone(observations);changed[0].temp.value=bad;
  assert.equal(compare(changed).temperature.compared,4);
  assert.equal(compare(changed).slots.compared,4);
}
for (const mutate of [
  o=>o.stationId='remote-station',
  o=>o.temp.kind='model',
  o=>o.temp.source='unapproved',
  o=>o.receivedAt=options.now+1,
  o=>o.receivedAt=o.at-1,
  o=>o.at+=1
]) {
  changed=structuredClone(observations);mutate(changed[0]);
  assert.equal(compare(changed).temperature.compared,4);
}
changed=structuredClone(observations);changed[0].rain.start-=hour;
assert.equal(compare(changed).rain.compared,4);
changed=structuredClone(observations);changed[0].rain.value=-1;
assert.equal(compare(changed).rain.compared,4);
assert.equal(compare([...observations,observations[0]]).rows[0].temp.reason,'ambiguous_observation');
assert.equal(compare(observations,{...options,allowedSources:{}}).status,'unavailable');
assert.equal(compare(observations,{...options,now:base+2*hour}).slots.compared,1);
assert.equal(compare(observations,{...options,now:base+2*hour}).rows[1].temp.reason,'future_hour');
const before=JSON.stringify({snapshot,observations});compare();
assert.equal(JSON.stringify({snapshot,observations}),before);
assert.throws(()=>compare(observations,{...options,rainThresholdMm:undefined}),TypeError);
assert.throws(()=>compare(observations,options,{...snapshot,capturedAt:base+1}),TypeError);
assert.throws(()=>compare(observations,options,{...snapshot,slots:Array(5).fill(snapshot.slots[0])}),TypeError);
console.log('Observed verdict: missing data, thresholds, provenance, station/time alignment, revisions and immutability checked.');
