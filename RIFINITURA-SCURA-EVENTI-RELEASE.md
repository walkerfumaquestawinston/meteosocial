# Tema scuro, pagina essenziale e avvisi eventi

Richiesta prioritaria: correggere i sei problemi visivi indicati dall’utente, continuando il lavoro già autorizzato sugli eventi.

- Tema scuro unico; funzione precedente di cielo dinamico conservata dietro SKY_FEATURES.dynamicBackground=false. Colori espliciti per schede vento/pioggia/umidità/UV, titoli e Profilo; checkbox delle preferenze di dimensione corretta e con etichetta cliccabile.
- Dettagli su fonti, aggiornamento del globo, pollini, mare, notifiche e confronto serale dietro “i”. Le distinzioni fra modello, persone e fonti ufficiali sono conservate.
- “Chiedi a chi è lì” diventa il primo contenuto; eventi, confronto serale e condivisione nel menu Altro, chiuso all’apertura.
- Stati senza contributi locali: invito breve, segnalazioni reali dal mondo se disponibili e due eventi NASA ordinati per distanza dal luogo selezionato. Distanza e fonte sempre visibili; dettagli e limiti dietro “i”. Se entrambe le fonti mancano, viene mostrato il meteo disponibile della città, senza simulare attività.
- Il renderer già inizializzava le coordinate della città selezionata: eliminata la rotazione automatica iniziale che spostava la vista prima dell’interazione. Mantenuti gesti, ritorno alla città, geometria e caricamento dinamico. Etichetta della città all’ingresso, aggiornata al cambio città. Nessuna richiesta automatica di posizione.
- Eventi: elenco privato dei propri eventi; lettura da sessione membro senza dover conservare il token. Token non restituiti nell’elenco. Avviso push facoltativo una sola volta per evento quando una consultazione rileva una variazione significativa; massimo 2 push/giorno complessivi e silenzio 22–7. Niente push sui dati mancanti o vecchi; non si promette un controllo in background senza scheduler.

File: dist/design-system.css, sky-theme.js, living-world.js, living-renderer.js, sky-community.js, growth.js, notifications.js, local-weather.js, main.js, nuovo live-discovery.js, sw.js; server/growth.js, answer-push.js, worker.js; db/schema.ts e migrazione additiva 0020_unique_wild_child.sql; build.mjs e artefatti; test-event-notices.mjs e aggiornamento test-globe-gestures.mjs.

Verifiche isolate superate: avvisi eventi (sessione, recupero privato, preferenze, valori nulli, concorrenza, unicità, lettura, quota condivisa, silenzio e scadenza), crescita, scuole/push esistenti e gesti del globo con vista iniziale ferma. Nessuna segnalazione o notifica di prova inviata a persone reali.

Restano non disponibili: scheduler a orari fissi, avvisi automatici prima dell’uscita/allerte ufficiali, stima H6 finché non validata e popolata, pubblicazione negli store. La consegna dei push dipende dal browser e dai permessi; una quota già consumata può impedire l’avviso evento. La rimozione fisica dei gruppi scaduti avviene alla consultazione, ma l’accesso è negato subito alla scadenza.
