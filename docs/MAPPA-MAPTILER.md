# MapTiler: cartografia leggibile

22 settembre 2026. Integrazione MapTiler autorizzata; utente ha creato account e autorizzato espressamente la creazione della chiave browser ristretta a sito e localhost. Chiave conservata nella configurazione runtime Sites; è una chiave frontend, intenzionalmente consegnata dal solo endpoint GET /api/maps/basemap. Non è la chiave WeatherAPI e non dà accesso amministrativo. Valori mai in sorgente.

MAPTILER_ENABLED=true, MAPTILER_STYLE_ID=dataviz-v4 per la prova standard. Stile personalizzato creato e pubblicato nel suo account: MeteoSocial · Atlante chiaro, ID 01a0c7d2-5823-7375-bd26-a23aa1ed534f, derivato da Dataviz. I raster degli stili personalizzati richiedono Flex; standard disponibile nella prova. L’utente ha chiesto il pagamento; checkout Flex aperto, prezzo 36,60 USD con IVA 22%, extra traffico separati. Non dichiarare acquistato finché non verificato. Dopo acquisto cambiare MAPTILER_STYLE_ID con l’ID personalizzato e ridistribuire la versione salvata.

La mappa Leaflet carica tessere 512px con zoomOffset -1, come documentazione MapTiler. Mantiene radar, pannello, etichette meteo e interazioni. Passa al nuovo fondo solo dopo un’immagine caricata; dopo tre errori consecutivi o 15 secondi iniziali torna al fondo precedente. Configurazione mancante non richiede MapTiler. Rimuove timer/listener alla chiusura. Logo MapTiler e copyright sempre presenti durante uso del servizio; nessun filtro CSS sui colori delle tessere.

La fatturazione di questa integrazione raster segue le richieste di tessere, non va stimata solo con il numero di sessioni SDK. Limiti e tariffe: https://www.maptiler.com/cloud/pricing/ . Le restrizioni dell’origine limitano l’abuso ma non sono un tetto di spesa. Non sono stati configurati upgrade automatici.

Anteprima con cartografia attiva sul porto 4596; 4595 resta disponibile. startLocalPreview accetta mapConfig con una whitelist di tre variabili MapTiler, senza importare segreti di altri servizi. Test con configurazioni non valide, assenza di segreti server nella risposta, allineamento tessere, caricamento, ripiego ed eliminazione listener. Build e 68 suite passate. Non ancora un benchmark su dispositivo fisico, né certificazione di accessibilità.

## Piano e stile attivati

Il proprietario ha completato l’acquisto: dashboard Flex e fattura Paid verificati, 36,60 USD inclusa IVA. Ha autorizzato 0 USD extra: spending limit abilitato con valore zero, conferma Spending limit changed. Questo blocca le chiavi al superamento della quota; l’app torna alla base alternativa. MAPTILER_STYLE_ID ora punta allo stile personalizzato 01a0c7d2-5823-7375-bd26-a23aa1ed534f, configurato in Sites revisione 10 e nell’anteprima 4596. Le note sopra raccontano lo stato iniziale della prova.
