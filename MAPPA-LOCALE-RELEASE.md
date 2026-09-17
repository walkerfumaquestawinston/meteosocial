# Mappa locale — 16 settembre 2026

Richiesta: sostituire la schermata del globo e gli eventi NASA con una mappa cittadina e foto della community.

## Interventi
- `dist/local-map.js`, `dist/local-map.css`: MapLibre a tutta superficie, tema scuro, centro sulla città selezionata, pulsante posizione esplicito, breve volo con proiezione planetaria e skip. Nessun volo con movimento ridotto. Una sola voce Mappa; URL Globo/Google 3D precedenti rimandano alla mappa.
- `dist/local-map-weather.js`: sette frame RainViewer dalla più recente immagine fino a 60 minuti prima (quando disponibili), orario e play/pausa/scrubber; 25 campioni Open-Meteo nella vista locale, particelle interpolate dalla velocità/direzione del modello e temperature. Zoom lontano richiede di avvicinarsi; cache temporanea e aggiornamenti, errori espliciti. Nessuna particella con movimento ridotto/eco; rendering fermo in background. Pioggia trasparente non significa automaticamente assenza di precipitazioni: copertura dichiarata in i.
- Segnalazioni: clustering GeoJSON nativo MapLibre, emoji/foto circolari ed età; storia a schermo intero, testo facoltativo, distanza dichiarata dalla città selezionata o GPS, conferma tramite endpoint esistente con controllo server entro5km. Conservati blocco/segnalazione abuso e scadenza2h.
- `dist/sky-postcard.js`: input fotocamera environment, ritaglio centrale 1080×1920, città/meteo/ora/logo, anteprima, download JPEG e Web Share quando supportato; selezione esplicita del fenomeno osservato prima della pubblicazione. Foto ricodificata senza EXIF, sotto il limite effettivo sky1.1MB; invio tramite coda/sessione esistente. Prima pubblicazione guest consentita; invii ulteriori continuano a richiedere accesso, senza indebolire la sicurezza.
- `dist/main.js`: nuova integrazione, ricerca città dal pulsante in alto, rimossa apertura automatica onboarding che copriva la mappa. Orari e città restano modificabili. Rimossa prelettura Three.js.
- `dist/live-discovery.js`: rimossi chiamate e riquadri EONET, restano segnalazioni vere e meteo locale.
- `dist/sky-community.js`, `dist/atmosphere.js`, `dist/atlas.js`: collegamenti/testi verso la mappa, feed condiviso. `dist/index.html`, `dist/design-system.css`, `manifest.json`: un solo tab Mappa, CSS/shortcut aggiornati.
- `package.json`, lockfile, `build.mjs`, `dist/sw.js`, asset MapLibre/licenza: distribuzione locale della libreria5.6.2, caricamento su richiesta, shellv44. Nessuna migrazione database.

## Verifica
- Build e sintassi completati; test-local-map.mjs: finestra radar60min, allowlist, direzione vento, scadenza segnalazioni, distanza, ritaglio9:16 e vero invio JPEG/lettura foto in database isolato con prima sessione.
- Regressioni test-sky-confirm.mjs e test-photo-tools.mjs superate.
- Fonti esterne: stile OpenFreeMap200, endpoint RainViewer200 con7frame nella finestra; risposta Open-Meteo multi-posizione verificata.
- Anteprima browser: navigazione Mappa, nessun Three.js caricato, ricerca città, generazione cartolina e stato autenticazione verificati. Nessuna segnalazione di prova pubblicata in produzione.
- Limite: browser cloud senza WebGL, quindi non è stato possibile verificare visivamente cartografia, volo e cluster né misurare fluidità sul telefono. Mostrato fallback esplicito; foto e consultazione Meteo/Community utilizzabili. Permessi fotocamera e condivisione nativa dipendono dal dispositivo. Intro ~2s dopo caricamento cartografia, non promessa di primo caricamento completo in2s su ogni rete.

## Fonti tecniche
MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
OpenFreeMap: https://openfreemap.org/
Radar: https://www.rainviewer.com/api/weather-maps-api.html
Open-Meteo: https://open-meteo.com/en/docs
