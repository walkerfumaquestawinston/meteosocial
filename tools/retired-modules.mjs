// Moduli ritirati: restano nella cronologia Git e sul disco, ma non entrano nel
// grafo consegnato né nella cache della shell. Corrispondono alla direzione
// corrente, che è la mappa locale MapLibre e non il globo 3D o NASA.
//
// Questo file è l'unica fonte: build.mjs lo usa per filtrare gli asset e per
// fermare la build se un modulo ritirato rientra nel bundle; tools/run-tests.mjs
// lo usa per riconoscere i test che interrogano quei moduli. Tenere due elenchi
// allineati a mano è quello che ha reso illeggibile l'esito della suite.

export const RETIRED = /^(?:globe|living-world|living-renderer|globe-conditions|planet|atlas|atlas-map|google-3d(?:-frame)?|hail|hail-map|hail-watch|schools|climate-view|world-weather|weather-art|avatar)\.js$|^assets\/(?:three\.|land-mesh)/;

// Fogli di stile e risorse ritirati insieme ai moduli qui sopra.
export const RETIRED_ASSETS = ['hail.css', 'climate-view.css', 'google-3d.css', 'google-3d-frame.html', 'assets/earth.jpg', 'assets/THREE-LICENSE.txt'];

// `file` è il percorso relativo a dist/, per esempio 'hail.js' o 'assets/three.module.js'.
export function isRetired(file) {
  return RETIRED.test(file) || RETIRED_ASSETS.includes(file);
}
