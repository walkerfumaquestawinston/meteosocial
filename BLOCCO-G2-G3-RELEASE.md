# G2/G3 — adattamento autorizzato

## Consegnato
- IndexedDB per ultima previsione di ciascuna città consultata, comprese le città salvate. Recupero alla riapertura, etichetta data/ora di salvataggio se non aggiornata. Non vengono inventate previsioni per città mai consultate; copie oltre 7 giorni non mostrate.
- Coda IndexedDB per entrambi i percorsi di segnalazione (sei fenomeni e cinque livelli), foto già ricodificate, coordinate arrotondate a due decimali. Massimo 10 elementi. Stato locale distinto dalle osservazioni pubblicate, gestione annulla/riprova.
- Background Sync dove disponibile, riprova al ritorno online e alla riapertura. Sessione originale vincolata anche lato server; nessuna creazione automatica di identità dal service worker. Prima sessione non ancora disponibile: conferma esplicita in primo piano.
- Ora originale della segnalazione e scadenza a 2 ore, rifiuto delle osservazioni scadute/future, ID idempotente. Le preferenze precedenti restano nei rispettivi archivi locali.
- Invito agli avvisi dopo una pubblicazione riuscita, Non ora per 7 giorni, richiesta permesso solo su azione esplicita. Profilo con scelte separate per risposte e conferme.
- Conferme reali attivano un avviso opt-in: nessuna falsa dichiarazione che il modello sia stato corretto. Limite server condiviso 2 al giorno e silenzio 22–7 Italia. I push sono generici senza dati personali e aprono il Profilo con dettagli autentici e collegamento alle scuole.
- Badge per nuove segnalazioni lette entro 3 km. Resta il badge delle domande già implementato.
- Shell offline completata con moduli precedentemente assenti; 3D resta su richiesta.

## Non completato / limiti
- G2 rimane parziale: avvisi prima dell’uscita e allerte ufficiali push non attivati. Non esiste un cron dell’hosting configurato/esposto: non promettiamo controlli periodici quando nessuno consulta l’app. Nessun servizio esterno aggiunto.
- Il cerchio chiuso push riguarda una conferma reale, non una correzione del modello. Confronto modello/persone già disponibile nell’app.
- Il browser decide se/quando eseguire Background Sync. Negli altri browser si riprova aprendo l’app online. Errori di sessione richiedono intervento; le osservazioni non vengono trasferite a un nuovo account.
- Preferenze/copie offline non si sincronizzano tra PC; sorgente e pubblicazione rimangono nel progetto online esistente.
- Le nuove conferme notturne non producono push durante il silenzio; i dettagli sono leggibili nel Profilo. Non si garantisce recupero autonomo mattutino.
- Database locale può essere rimosso dal browser/utente. Quota negata: messaggio esplicito, non falsa conferma di salvataggio.

## File
- dist/offline-store.js: IndexedDB e invio condiviso con SW.
- dist/offline.js: cache meteo, accodamento e interfaccia recupero.
- dist/main.js: integrazione meteo/offline/invito avvisi.
- dist/sky-community.js: pubblicazione attraverso coda, integrazione preferenze e badge.
- dist/notifications.js: consenso, preferenze separate e dettagli conferme.
- dist/schools.js: disattivazione scuole preserva altri avvisi.
- dist/sw.js: shell v38, Background Sync e apertura avvisi.
- server/sky.js: ora originale, verifica autore, evento conferma.
- server/answer-push.js: preferenze/conferme, tetto condiviso e protezioni.
- server/worker.js: contesto esecuzione e stato capacità corretto.
- db/schema.ts, drizzle/0018_workable_amazoness.sql e metadata: tabelle additive feedback.
- build.mjs e output dist/server, dist/.openai/drizzle: inclusione asset e migrazione.
- test-offline.mjs, test-schools.mjs, test-quick-sky.mjs: verifiche server/regressione.
- tests/offline-browser.html: prova IndexedDB locale riproducibile, non inclusa nella pubblicazione.
- PROJECT_STATUS.md, PROJECT_VISION.md, RIPRENDI-QUI.md: continuità.

## Verifiche
Build riuscita. Test offline server: timestamp, TTL, scadenza/futuro, identità e reinvio. Test scuole esteso: conferme, deduplica, preferenze indipendenti, limite condiviso; suite conferme e pubblicazione rapida passate. Nessuna notifica di prova inviata a utenti reali. Browser remoto non raggiunge anteprima locale (connessione rifiutata); prova IndexedDB in browser e consegna push/Background Sync su telefono reale non certificate.

Fermarsi qui; prossimo blocco master E3/E4/E5 richiede richiesta dell’utente. G2 automatico resta esplicitamente aperto.
