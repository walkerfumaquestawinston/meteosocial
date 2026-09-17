import assert from 'node:assert/strict';
import {FEATURES,featureRouteEnabled,resolveFeatureRoute,installFeatureVisibility} from './dist/community-features.js';
import {layerControls} from './dist/climate-view.js';
for(const [route,fallback] of [['grandine','community'],['grandine-mappa','mappa'],['ripari','home'],['offline','home']]){assert.equal(featureRouteEnabled(route),false);assert.equal(resolveFeatureRoute(route),fallback)}
for(const route of ['community','mondo','mappa','tendenze','impostazioni'])assert.equal(resolveFeatureRoute(route),route);
assert.doesNotMatch(layerControls('meteo'),/Grandine segnalata/);
FEATURES.hailMap=true;assert.equal(resolveFeatureRoute('grandine-mappa'),'grandine-mappa');assert.match(layerControls('meteo'),/Grandine segnalata/);FEATURES.hailMap=false;
const link=href=>({attrs:new Set(),getAttribute:()=>href,setAttribute(k){this.attrs.add(k)},removeAttribute(k){this.attrs.delete(k)},matches:()=>true,querySelectorAll:()=>[],nodeType:1});
const covered=link('#ripari'),ordinary=link('#community');let callback;
globalThis.document={body:{querySelectorAll:()=>[covered,ordinary]}};
globalThis.MutationObserver=class{constructor(f){callback=f}observe(){}disconnect(){}};
const stop=installFeatureVisibility();assert.ok(covered.attrs.has('data-feature-disabled'));assert.equal(ordinary.attrs.size,0);
const asyncLink=link('#grandine-mappa');callback([{addedNodes:[asyncLink]}]);assert.ok(asyncLink.attrs.has('data-feature-disabled'));
FEATURES.coveredPlaces=true;callback([{addedNodes:[covered]}]);assert.equal(covered.attrs.size,0);FEATURES.coveredPlaces=false;stop();
console.log('Feature gates: route fallback, reactivation, map layer, initial and asynchronous links passed.');
