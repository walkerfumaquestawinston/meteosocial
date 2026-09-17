// Funzioni conservate, riattivabili singolarmente.
export const FEATURES={schools:false,postType:false,legacyFeed:false,stories:false,extraCommunity:false,hailSection:false,hailMap:false,coveredPlaces:false,offlinePlaces:false,editorial:false,clans:false,challenges:false,voices:false,fitCheck:false};

const routeFeatures={scuole:'schools',grandine:'hailSection','grandine-mappa':'hailMap',ripari:'coveredPlaces',offline:'offlinePlaces',redazione:'editorial',studio:'editorial',stanza:'editorial',avatar:'editorial',roast:'editorial','meteo-play':'editorial','meteo-cinema':'editorial',clan:'clans',sfide:'challenges',voci:'voices',fitcheck:'fitCheck',stories:'stories',archivio:'legacyFeed',persona:'legacyFeed',post:'legacyFeed'};
export function featureRouteEnabled(route){const key=routeFeatures[String(route).split(/[?:]/)[0]];return !key||FEATURES[key]}
export function resolveFeatureRoute(route){if(featureRouteEnabled(route))return route;return route.startsWith('grandine-mappa')?'mappa':route.startsWith('grandine')?'community':'home'}
// Handles legacy and asynchronously rendered links without deleting their code.
export function installFeatureVisibility(){
 const apply=root=>{const links=[...(root.matches?.('a[href^="#"]')?[root]:[]),...root.querySelectorAll('a[href^="#"]')];for(const link of links){if(!featureRouteEnabled(link.getAttribute('href').slice(1)))link.setAttribute('data-feature-disabled','');else link.removeAttribute('data-feature-disabled')}};
 apply(document.body);const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)apply(node)});observer.observe(document.body,{childList:true,subtree:true});return ()=>observer.disconnect();
}
