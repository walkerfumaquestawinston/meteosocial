# Collegare Google 3D a MeteoSocial

Aggiornamento 15 settembre 2026: Google collegato e funzionante secondo la prova del proprietario. Chiave importata esattamente da un file fornito dal proprietario, protetta nel runtime Sites; `GOOGLE_3D_ENABLED=true`, revisione ambiente 5. Non usare le trascrizioni precedenti ricavate dalle immagini. Il proprietario ha gestito la Console e il pagamento; Codex non ha verificato le quote né i consumi.

Il nuovo Globo satellite e i controlli interattivi sono descritti in `GLOBO-SATELLITE-RELEASE.md`. Le istruzioni seguenti restano un riferimento per configurazione e sospensione, non richiedono di ricreare il progetto o la chiave già funzionanti.

## Scelta del servizio

Usare **3D Maps in Maps JavaScript API**, SKU **Immersive Maps**. Non usare Photorealistic 3D Tiles / Map Tiles API: i Tiles fotorealistici non sono disponibili per i nuovi progetti con fatturazione nello Spazio economico europeo. L'Italia è compresa. Questo corregge l'indicazione incompleta nelle note precedenti, secondo cui sarebbero bastate chiave e fatturazione. Nessuna proposta di aggirare i limiti regionali.

- [Google 3D Maps JavaScript](https://developers.google.com/maps/documentation/javascript/3d/overview)
- [Limitazione dei Tiles nello SEE](https://developers.google.com/maps/comms/eea/map-tiles)
- [Configurazione API](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [Listino](https://developers.google.com/maps/billing-and-pricing/pricing)

Listino consultato: Immersive Maps include 5.000 caricamenti mensili a costo zero, poi 7 USD per 1.000 fino a 100.000 eventi mensili; fasce successive scontate. La soglia si aggrega sui progetti dell'account di fatturazione. Esempi senza altri consumi o imposte: 10.000 caricamenti = 35 USD, 50.000 = 315 USD. Non confondere caricamenti con utenti. Ricontrollare il listino prima di attivare.

## Passaggi del proprietario

1. Aprire https://console.cloud.google.com/ con il proprio account Google.
2. Riusare il progetto Google già scelto dal proprietario (`gen-lang-client-0623938371`). Non creare progetti o chiavi aggiuntive per aggiornare il sito.
3. Nel progetto collegare un account di fatturazione. Dati fiscali, metodo di pagamento e accettazione delle condizioni richiedono il proprietario tramite l'interfaccia Google.
4. In **API e servizi → Libreria**, abilitare **Maps JavaScript API**.
5. In **Credenziali**, creare una chiave dedicata per il browser. Restrizione applicazione **Siti web / referrer HTTP** sul solo dominio `https://scudo-meteo-community.walkerthehate.chatgpt.site` (restrizione all'origine, coerente con `auth_referrer_policy=origin`). Restrizione API sulla sola **Maps JavaScript API**. Verificare nella Console il formato accettato del referrer e il dominio effettivo prima del test. Non abilitare Places, Geocoding Google o Map Tiles per questa integrazione.
6. Impostare quote di utilizzo adeguate nella Console, verificando le quote realmente disponibili per il progetto e il servizio. Per la prima prova scegliere un limite molto basso. Aggiungere avvisi di budget; un avviso non è un tetto rigido agli addebiti. Non affermare che il costo sia bloccato senza una quota effettivamente applicata.

La chiave Maps per browser è visibile ai visitatori nel renderer: questo è il modello previsto dall'API. Non usare chiavi server, chiavi OpenAI o una chiave Google senza restrizioni. Non incollare credenziali o dati della carta in chat. [Sicurezza delle chiavi](https://developers.google.com/maps/api-security-best-practices) · [Costi e quote](https://developers.google.com/maps/billing-and-pricing/manage-costs).

## Collegamento da parte di Codex

Riusare il progetto Sites `appgprj_6aa1e8ab06f88191ab364344053e48d9`. Le sole variabili nuove sono:

- `GOOGLE_MAPS_BROWSER_KEY`: chiave browser dedicata, da inserire nella configurazione runtime Sites mediante il flusso sicuro disponibile. Non inserirla nel repository, nei link o in `.openai/hosting.json`.
- `GOOGLE_3D_ENABLED`: `false` per preparazione/sospensione; `true` per il servizio attivato su richiesta del proprietario. Le quote restano da verificare nella Console del proprietario.

Non cambiare `OPENAI_API_KEY`. Le variabili sono condivise fra i PC perché ospitate nello stesso sito; non serve ricopiarle sul PC principale. Pubblicare la versione salvata per applicare una nuova revisione dell'ambiente.

Prima dell'apertura al pubblico serve una verifica reale della vista con chiave configurata: caricamento, copertura della località, messaggi di errore, attribuzione Google, controlli, rientro al radar e consistenza dei consumi rilevati nella Console. Questa conferma non è una prova di compatibilità su tutti i dispositivi; i controlli dei nuovi comandi sono simulati.

## Come è preparata l'app

- Route principale `#mondo` (Google quando disponibile), alias `#google3d`, `#globo-meteo` per il globo NASA. Località, ricerca, previsioni e community condividono il contesto.
- Il collegamento nei percorsi normali compare solo quando il servizio è abilitato. L'accesso diretto senza configurazione mostra lo stato non attivo e i percorsi già funzionanti.
- Nessuna libreria o immagine Google caricata all'apertura della Home, del globo o della pagina 3D in attesa. Il visitatore preme **Apri il globo satellite** dopo l'indicazione che la località viene inviata a Google.
- Renderer in iframe della stessa origine: chiusura, cambio route o app nascosta rimuovono il frame. Ricerca città e punto meteo aggiornano il renderer esistente. Nessuna riapertura o nuovo tentativo automatico. L'aggiornamento delle previsioni modifica solo la scheda, senza ricreare la vista.
- Zoom, Terra intera, centratura sulla città, vista dall’alto/rilievo, nomi e strade, nord, schermo intero e scelta esplicita del meteo tramite clic o punto al centro. Le coordinate del frame sono nel frammento del suo URL, non nella richiesta HTTP o nei log del percorso. Google riceve il centro per rendere il territorio dopo l'apertura.
- Google visualizza la geografia; Open-Meteo resta nella scheda con fonte e orario. Radar e grandine si aprono nelle mappe esistenti. Non è stata realizzata una sovrapposizione radar sul 3D Google né una ripresa climatica live.
- Nessuna lettura di dati Google da parte dell'IA, nessuna Places API extra, nessun trasferimento di post, autori, immagini o conversazioni a Google Maps. Attribuzioni e controlli nativi del renderer non vengono nascosti.

L'apertura manuale riduce i caricamenti evitabili ma non garantisce un costo massimo. Le quote Google restano necessarie: la chiave browser può effettuare richieste al provider senza passare dal nostro server.

## Verifiche della preparazione del 13 settembre

34 controlli dedicati, 42 Climate e 49 Atlas superati. Verificati: funzione disattivata per default, chiave/API separate, assenza di chiave nei dati iniziali e nei link, asset nel Worker, apertura manuale, doppio clic, origine dei messaggi, coordinate invalide, errori, sospensione e chiusura. Test del controller con DOM simulato, nessuna richiesta Google o costo di mappa. Build di produzione riuscita. Non sono test reali del motore Google o del suo conto di fatturazione.
