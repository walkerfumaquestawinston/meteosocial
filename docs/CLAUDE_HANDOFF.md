# MeteoSocial — note per proseguire

## Città leggibili, 21 settembre 2026

La richiesta successiva al radar riguarda nomi delle città e utilità della mappa. Non sono stati aggiunti nuovi fornitori né modificate le autorizzazioni IA.

- dist/map-city-labels.js: catalogo geografico con fallback, deduplicazione/alias, età dei dati e disposizione deterministica delle etichette. Rettangoli reali dei pannelli riservati; massimo 80 etichette, priorità alla città selezionata.
- dist/mappa-eventi-controller.js: etichette cliccabili su ogni livello e zoom, interruttore Città, riepilogo richiudibile, località scelta, scala km e zoom locale. I nomi esistono anche senza valori meteo.
- dist/mappa-eventi.css: etichette da 44px, contrasto, pannelli compatti e assenza di sovrapposizione fra dettaglio e legenda sul telefono.
- test-map-city-labels.mjs: dati geografici senza meteo, conservazione letture, alias, date UTC, collisioni, bordi e priorità selezione. Aggiunto anche al controllo GitHub.
- build.mjs e dist/sw.js: nuovo modulo incluso; shell v58.

I cataloghi esistenti CITIES, CITTA_MONDO e comuni server sono riusati. Non affermare copertura di ogni città del mondo: ricerca libera e cartografia stradale completano il catalogo di etichette. Le etichette sono selezionate in base allo spazio; aumentare lo zoom per vederne altre.

Meteo, radar e IA: preservati i limiti della versione precedente. Le coordinate vanno al solo backend meteo e non a OpenAI; nessun autore o media, massimo tre scambi della località su richiesta esplicita. Lente non interpreta i pixel radar. Grandine community e temporali da modello non diventano allerte ufficiali.

Verifiche: 50 suite passate; sei legacy classificate separatamente. Browser su mobile 390×844 e desktop: temperatura, grandine, etichette mondiali, pulsante Città, dettaglio e strade. Nessun errore console rilevato. Le API meteo hanno restituito dati aggiornati durante questa verifica; cache ed errori restano gestiti.

Stato della pubblicazione: PROJECT_STATUS.md. Dopo clone: pnpm install --frozen-lockfile e pnpm build. Conservare i sorgenti in dist; dist/app e dist/server sono rigenerati. Non sincronizzare database locali con produzione.
