# Rainbow: integrazione richiesta, non attiva

23 settembre 2026. L'utente ha attivato Rainbow API Metered e ha richiesto di sostituire il fornitore meteo del sito con Rainbow Weather. Ha autorizzato il trasferimento della Primary key esclusivamente nel segreto Sites `RAINBOW_API_KEY` del progetto MeteoSocial esistente.

La chiave NON è stata salvata in Sites. Il controllo automatico ha rifiutato il passaggio del valore attraverso il risultato dello strumento, anche dopo la conferma. Non riprovare tramite output in chiaro o percorsi indiretti: occorre un canale di configurazione del segreto approvato. Nessuna credenziale è stata scritta in questi file. Produzione invariata, v96, WeatherAPI.

## Preparazione completata

`server/rainbow-client.mjs` è un client server non ancora incluso nel Worker: usa l'endpoint documentato, coordinate longitude/latitude, credenziale solo in header, timeout e rifiuto dei redirect. Richiede una prenotazione di quota esplicita prima di ogni richiesta. Non ha un budget implementato autonomamente e non è ancora collegato a D1/cache.

La normalizzazione verifica unità, coordinate, orario di emissione e duplicati. Converte m/s in km/h e conserva null e zero distinti. Indica sempre `kind: forecast`, mantiene emissione e validità separate e seleziona una previsione per l'ora corrente solo se la fascia comprende l'istante richiesto. Non inventa osservazioni, fusi, alba/tramonto, nubi o dati giornalieri.

Il test `test-rainbow.mjs`, incluso automaticamente dal runner esistente, verifica conversioni, timestamp futuri e duplicati, dati scaduti, unità errate, ordine coordinate, quota obbligatoria, errori senza dettagli sensibili e località non corrispondente. Superato con fixture sintetiche. Nessuna risposta autenticata reale verificata.

## Lavoro ancora necessario

1. Configurare la chiave tramite un percorso sicuro approvato, senza chat/Git/file locali.
2. Provare risposte reali e definire fusi e giornate locali: gli esempi Rainbow mostrano UTC, non basta rietichettare gli orari come locali.
3. Collegare cache e limite di richieste condiviso in D1, contenendo gli addebiti entro un limite concordato.
4. Integrare acquisizione, fonte UI e Lente; chiarire che il valore per l'ora corrente è una previsione e non una misura osservata. Verificare radar e servizi specialistici separatamente.
5. Eseguire build/test/anteprima, sincronizzare GitHub e Sites, poi pubblicare e verificare l'API pubblica.

Documentazione ufficiale verificata: https://doc.rainbow.ai/api-ref/weather/ e https://doc.rainbow.ai/examples/weather/temperature_chart/ . Nessuna promessa di precisione assoluta o aggiornamento al secondo.
