// Cache only the public application shell. Never cache API responses, identity,
// private media, authentication redirects or external weather responses.
importScripts('/offline-store.js');
const CACHE='meteosocial-shell-v82';
const APP_FILES=["/app/chunk-G4WKHTNL.js","/app/chunk-UXXUDGCI.js","/app/citta-mondo-DBT2DYAT.js","/app/leaflet-PMPOHTNZ.js","/app/local-map-weather-Q3HDO4XR.js","/app/main.js","/app/map-land-NZXNZGB6.js","/app/sky-postcard-S6FAJZEZ.js","/app/style.css"]; // Filled by build.mjs with exact split-bundle paths.
const FILES=['/','/index.html','/offline-store.js','/assets/maplibre-gl.js',...APP_FILES];
const ESSENTIAL=['/','/index.html','/offline-store.js',...APP_FILES.filter(f=>/^\/app\/(main\.js|style\.css|chunk-[^/]+\.js)$/.test(f))];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(ESSENTIAL.map(async url=>{const r=await fetch(url,{cache:'reload',redirect:'error'});if(!r.ok||r.redirected)throw Error('Shell unavailable');await cache.put(url,r)}))})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('meteosocial-shell-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
// Always revalidate the installation manifest; never retain an old offline copy.
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&url.origin===self.location.origin&&url.pathname==='/manifest.json')event.respondWith(fetch(event.request,{cache:'no-store'}))});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!FILES.includes(url.pathname))return;event.respondWith((async()=>{
  try{
    const response=await fetch(event.request);
    if(response.ok&&!response.redirected){
      // A full cache must not turn a successful network response into an error.
      try{const cache=await caches.open(CACHE);await cache.put(url.pathname,response.clone())}catch{}
    }
    return response;
  }catch{const cache=await caches.open(CACHE);return await cache.match(url.pathname)||new Response('App non disponibile offline',{status:503})}
})())});

// Empty, authenticated server push: never display an unverified closure as a fact.
self.addEventListener('push',event=>event.waitUntil(self.registration.showNotification('Una novità dalla tua zona',{body:'Una risposta, una conferma o un aggiornamento del tuo evento ti aspetta. Apri MeteoSocial per leggere i dettagli.',icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'meteosocial-update',data:{url:'/#profilo'}})));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const existing=windows.find(w=>new URL(w.url).origin===self.location.origin);if(existing){await existing.navigate('/#profilo');await existing.focus()}else await self.clients.openWindow('/#profilo')})())});

self.addEventListener('message',event=>{if(['SKIP_WAITING','ACTIVATE_SCHOOL_PUSH'].includes(event.data?.type))event.waitUntil(self.skipWaiting())});

self.addEventListener('sync',event=>{if(event.tag==='sky-outbox')event.waitUntil((async()=>{try{await MeteoOffline.flush()}finally{for(const client of await self.clients.matchAll({type:'window'}))client.postMessage({type:'SKY_SYNC_DONE'})}})())});
