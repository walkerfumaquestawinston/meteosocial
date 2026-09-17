## Fase 20 — B1, acquisizioni e cronologia online (17 settembre 2026)

Ora di acquisizione Open-Meteo visibile in Meteo, Oggi e Mappa; non è presentata come emissione del modello. Il gateway /api/forecast conserva copie append-only in forecast_copies, con cache condivisa di 15 minuti e coordinate approssimate a due decimali. Nuova migrazione additiva 0021. Il confronto riguarda le stesse ore ancora future; tempi duplicati del cambio ora e valori mancanti sono esclusi. Avviso sintetico più dialogo cronologia paginata e link alle copie originali. Sorgente indisponibile: ultimo dato con orario originale; salvataggio non riuscito: cronologia dichiarata indisponibile. Shell v48.

Test test-forecast-history.mjs superato: copie immutate, cache, confronti, fallback, concorrenza, paginazione, DST, errori archivio, escaping. Browser anteprima: vecchio meteo in cache correttamente senza ora acquisizione, dialogo e stato vuoto leggibili. In anteprima non è stata verificata una nuova acquisizione reale dal provider; test backend con dati controllati solo nel database temporaneo. Build riuscita. Non è un audit completo mobile/Lighthouse.

Limiti: lo storico parte dall'attivazione e raccoglie durante la consultazione, non a orari programmati. Non è la cronologia integrale delle emissioni di Open-Meteo. Riguarda la previsione principale della città, non radar, griglie, mare o confronti città. Nessuna prova crittografica indipendente contro modifiche amministrative. B2/B3/B4 e A3–A6 non eseguiti: globo e NASA restano rimossi. Dati e sorgente online condivisi; preferenze browser non sincronizzate.

### File di implementazione
- server/forecast-history.js: gateway fonte, cache, copie immutabili a livello applicativo, confronti e letture dello storico.
- server/worker.js: collegamento rotte; db/schema.ts e drizzle/0021_sweet_king_cobra.sql con metadati: tabella e indici additivi.
- dist/forecast-receipt.js: etichette, avviso, dialogo con copie originali e paginazione.
- dist/main.js: richiesta al gateway e conservazione dell'orario server.
- dist/weather-page.js, dist/atmosphere.js, dist/local-map.js: ricevuta nelle viste meteo.
- dist/design-system.css: stili della ricevuta e del dialogo; dist/sw.js: shell v48.
- build.mjs: inclusione moduli; output dist/app, dist/server, dist/.openai/drizzle e report bundle rigenerati.
- test-forecast-history.mjs: verifiche isolando database e provider.
- PROJECT_STATUS.md e RIPRENDI-QUI.md: ripresa del lavoro da un altro dispositivo.
