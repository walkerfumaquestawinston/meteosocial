# Fase 24.1 — La domanda del giorno

Pubblicazione confermata: versione 63, sorgente b2764a14eba1519503102b519c32b5de381c048b, ambiente 7 preservato. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site


Implementata esclusivamente 24.1. Le fasi 24.2–24.6 non sono attivate.

## Comportamento

- Nel tab Oggi la domanda è la prima sezione, con superficie scura leggibile e accento persone. La mappa resta la route iniziale esistente.
- GET /api/domanda?lat=&lng= sceglie una zona approssimata su griglia 0,05° e la domanda dalle condizioni Open-Meteo lato server, nell’ordine della tabella richiesta. I dati delle ultime 24 ore sono stime del modello, non misure; non viene fatto alcun nuovo giudizio di accuratezza.
- Domanda unica e congelata per zona/giorno, disponibile dalle 07:00 nel fuso restituito dal fornitore fino alla mezzanotte locale. Creazione pigra al primo accesso: non richiede né dichiara uno scheduler, e non promette una lettura del meteo esattamente alle 7. Gestisce ora legale e fusi frazionari.
- La domanda di ieri è esclusa. Se nessuna condizione alternativa è pertinente, si alternano le due domande neutre sul cielo: “Com’è il cielo adesso?” e “Il cielo è cambiato da stamattina?”. La seconda completa la regola di non ripetizione senza attribuire fenomeni non rilevati.
- Per il mare riusa la distanza costiera del progetto, con copertura Italia/dintorni; altrove la domanda mare non viene scelta senza dati geografici.
- POST /api/domanda/:id/risposta riusa la sessione ospite e il cookie dispositivo esistenti: niente nuovo account. Chiave univoca dispositivo/giorno, aggiornamento della stessa risposta fino alla scadenza e rifiuto di un secondo voto in altra zona. Limite per browser/cookie, non identificazione fisica infallibile del dispositivo: è dichiarato nei dettagli.
- Risultati null sul server fino al voto. Conteggi aggregati senza nomi; nessuna classifica, percentuale, like o notifica. Sotto tre risposte numeri assoluti, da tre rapporto N su totale. Fonti e funzionamento nei dettagli espandibili.
- Errori recuperabili, selezione conservata se il salvataggio fallisce, cambio città/route protetto da risposte tardive, scadenza aggiornata automaticamente mentre la pagina è aperta. Cookie/sessione e risultati non messi nella cache offline.
- Conservazione tecnica breve: nessun archivio pubblico, pulizia pigra di voti vecchi e domande; ieri resta disponibile per evitare ripetizioni. Moderazione esistente riutilizzata sulle scritture e nel conteggio.

## File

server/daily-question.js (API, scelta, orari, conteggi), dist/daily-question.js (componente e interazioni), dist/main.js (integrazione Oggi), dist/design-system.css (stile), server/worker.js (route), db/schema.ts e migrazione additiva drizzle/0022_clear_may_parker.sql con metadati (due tabelle), build.mjs (inclusione), dist/sw.js (shell v52), test-daily-question.mjs e tests/daily-question-fixture.html (test isolati). Output bundle/server/migrazioni rigenerati. Note di continuità aggiornate.

## Verifiche e limiti

Build riuscita. Test API con database locale separato: risultati nascosti, ospiti, una risposta per browser/giorno anche cambiando account, cambio voto, votanti concorrenti, origine estranea respinta, opzioni arbitrarie respinte, scadenza e giorno successivo, soglie/precedenze, ora legale e fuso Asia/Kolkata. UI con dati sintetici dichiarati nella fixture locale: voto Sì poi No, totale rimane uno, nessuna percentuale; larghezza 375px senza overflow, pulsanti alti circa 47px e larghi 166px, sezione entro 475px dalla cima della fixture. Nessuna risposta sintetica nel sito online. La home reale in anteprima ha mostrato correttamente l’errore recuperabile durante indisponibilità della fonte; la verifica completa dei voti usa la fixture e il Worker locale con dati controllati.

Per compilare la domanda è necessaria la fonte meteo al primo accesso della zona/giorno. Se manca, si dichiara indisponibilità e si offre Riprova. Non si inventa il meteo. Questa funzione non sblocca B2 né gli automatismi ancora privi di integrazione.
