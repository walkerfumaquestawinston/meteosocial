# MeteoSocial — note pubbliche per proseguire

## Atlante meteo, 21 settembre 2026

Partenza dal lavoro Claude già integrato nel ramo principale. Nuova interfaccia della mappa a tutto schermo, con livelli Temperatura, Pioggia, Grandine e Fulmini e confronto delle temperature nella sola area visibile.

- dist/mappa-eventi-controller.js: interazioni, caricamento, ricerca e Lente.
- dist/map-weather-core.js: regole dei dati e confronto geografico, testate senza rete.
- dist/mappa-eventi.js: normalizzatori NASA e Open-Meteo.
- dist/mappa-eventi.css: impaginazione adattiva.
- server/mappa.js: controlli sulle coordinate, associazione corretta dei dati e intervalli di precipitazione.

La mappa principale è raggiungibile dalla navigazione. La vista radar di dettaglio è conservata. Il modello dei temporali non va presentato come rilevamento delle singole scariche; le osservazioni di grandine non sono allerte ufficiali.

Lente riceve il contesto della località selezionata. Il backend usa le coordinate per ottenere il meteo, ma le esclude dai dati inviati al servizio IA. Nessun autore o media viene allegato da questa vista. test-lente.mjs verifica questo limite.

Verifiche: build e 48 suite superate; 6 suite legacy segnalate separatamente dal runner. Test aggiunto: test-map-weather-core.mjs. Browser verificato su ricerca, unità, login IA, guida, elenco e layout mobile. Il servizio IA reale non è stato invocato durante il test locale.

Pubblicazione in corso: attendere la nota finale prima di considerare il sito aggiornato. Lo storico precedente è disponibile nella cronologia del repository.

Gli artefatti generati dist/app e dist/server non sono versionati. Dopo il clone: pnpm install --frozen-lockfile, poi pnpm build e pnpm test. I sorgenti dentro dist restano versionati: non eliminare quella cartella. Netlify compila già prima della pubblicazione.
