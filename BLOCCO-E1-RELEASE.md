# E1 — bollettini DPC persistenti

Variante approvata: mantenere il collegamento al repository ufficiale e la selezione geografica esistenti, aggiungere persistenza e verifiche delle revisioni. Nessun dato della community può diventare allerta ufficiale.

## File
- server/atmosphere.js: database come fonte dei bollettini acquisiti; geometrie JSON separate per zona e metadati con emissione, data valida, fonte immutabile e ultima lettura. Ricerca su 12 revisioni recenti, esclusione file eliminati e rifiuto emissioni più vecchie di quella salvata. Acquisizione coerente della revisione specifica. Inserimenti a gruppi di 30 zone, pubblicazione del puntatore in batch; conservazione di una settimana e rimozione geometrie non referenziate.
- db/schema.ts; drizzle/0013_clammy_banshee.sql e relativi snapshot/journal: due tabelle additive, nessuna modifica alle migrazioni precedenti.
- server/assistant.js e server/social.js: passaggio del database alla stessa verifica allerte già usata dai consigli IA.
- dist/atmosphere.js: ora dell’ultimo controllo, provenienza geografica, ultimo bollettino conservato separato dallo stato attuale quando la fonte non risponde.
- dist/sw.js, dist/server/index.js, dist/.openai/drizzle/**: distribuzione/cache v28 e migrazioni.
- test-atmosphere.mjs: persistenza, riavvio Worker, revisione, interruzione, recupero e cambio giorno.
- PROJECT_STATUS.md, PROJECT_VISION.md, questo documento: stato e limiti.

## Comportamento
La fonte è ricontrollata dopo almeno 10 minuti quando viene consultata l’API. Le viste con bollettino già esistenti interrogano ogni 5 minuti mentre visibili. Dopo un errore con dati conservati, un minuto di intervallo minimo prima di ritentare. Nessuna sostituzione del dato mancante con livello zero. Il vecchio bollettino viene mostrato solo per la stessa data di validità, chiaramente storico/non aggiornato. Il giorno precedente non diventa il bollettino odierno.

## Verifiche
55 test atmosfera e 9 scenari cache superati, build completata. Migrazione composta esclusivamente da due CREATE TABLE additive. Test con fonte simulata separata da produzione: normale, rossa, indisponibilità, dato durabile dopo riavvio e cambio giorno. Il repository ufficiale conferma pubblicazione giornaliera e possibili rettifiche successive. La lettura del file corrente reale non è stata confermata da questo ambiente: non dichiarare verificata l’allerta di oggi.

## Limiti
Non è disponibile una funzione Sites per configurare un cron del Worker: non sono installati servizi esterni né automazioni private. Senza visitatori non parte un aggiornamento autonomo. La consegna aggiunge persistenza e controllo durante l’uso; il cron richiesto nella formulazione originaria di E1 resta da collegare tramite capacità hosting adatta. L’associazione resta punto selezionato → poligono ufficiale, non una tabella immutabile comune → zona: è la variante approvata. Nessuna certezza introdotta sui confini comunali o sulla stabilità delle zone. Nessuna nuova sezione scuole o altre funzioni dei blocchi successivi.
