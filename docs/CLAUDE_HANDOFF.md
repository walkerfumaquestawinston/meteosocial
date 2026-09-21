# MeteoSocial — note per proseguire

## Atlante radar e vento, 21 settembre 2026

Nuova interfaccia ispirata alla gerarchia visiva di ARGOS Atlas: carta protagonista, cinque livelli sopra, dettagli a sinistra e barra Lente in basso. Identità MeteoSocial, nessuna copia di asset ARGOS.

- dist/mappa-eventi-controller.js: cinque livelli, ricerca, dettagli, IA contestuale e coordinamento del radar.
- dist/map-radar.js: manifest RainViewer, controlli fonte/tempo, tile layer, sequenza, pause, errori, abort e cleanup.
- dist/map-land.js: geometria Natural Earth 1:110m, dominio pubblico, 127 feature; attribuzione esistente in dist/assets/NATURAL-EARTH.txt.
- dist/map-weather-core.js: direzione del vento, riepiloghi geografici e richiesta IA con storia limitata.
- dist/mappa-eventi.css: layout desktop/mobile; su telefono il pannello sospende la riproduzione e nasconde temporaneamente la timeline per lasciare leggibile la risposta.
- test-atlas-radar.mjs: fonte, frame futuri/duplicati, dati vento mancanti, cronologia IA, lifecycle e callback tardive del radar.
- .github/workflows/check.yml: installazione, build e suite del radar oltre ai controlli della mappa e dell'IA.

Radar: solo compositi recenti, circa due ore. I timestamp rappresentano i quadri compositi; copertura variabile, assenza di colore non significa assenza di pioggia. Lente riceve stato/orario del radar, non immagini. Grandine da segnalazioni community, Fulmini da modello temporali: nessuna rete di scariche collegata.

Lente riusa il servizio autenticato esistente e mostra le fonti restituite. Le coordinate servono al backend meteo e sono escluse dal payload OpenAI; niente autori o media. Cronologia limitata agli ultimi tre scambi della stessa località e trasmessa solo su richiesta. Nessuna chiamata IA automatica durante pan, zoom o refresh.

Verifiche: 49 suite passate; sei suite legacy classificate separatamente. Test browser desktop 1280×800 e mobile 390×844: radar reale RainViewer, zoom alle strade, località, domanda conservata quando serve login, nessun overflow né errore console. Meteo in cache durante indisponibilità della fonte, chiaramente indicato. Servizio IA reale non invocato dall'anteprima.

Stato del sito e sincronizzazione: PROJECT_STATUS.md. Dopo un clone installare le dipendenze bloccate e ricostruire. dist/app e dist/server non sono versionati; non cancellare gli altri sorgenti in dist. Lo storico delle note precedenti rimane in Git.

Pubblicato su Sites versione 66 il 21 settembre 2026. GitHub PR #7 integrata in main dopo Check MeteoSocial e anteprima Netlify superati. La sorgente applicativa pubblicata e quella GitHub hanno lo stesso albero; le note di consegna successive non richiedono un altro deploy.
