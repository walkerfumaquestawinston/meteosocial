# D7/D8/F5 — conferme, riscontro e durata delle card

Adattamento approvato: sistema attivo /api/sky anziché /api/posts. Nessuna affermazione di correzione del modello Open-Meteo.

## File
- server/sky.js: POST /api/sky/reports/:id/confirm richiede identità/sessione, cookie dispositivo, stessa origine, coordinate e consenso, accuratezza dichiarata <=2000m, distanza <=5km. Rifiuta proprio report, report nascosti/scaduti/eliminati/bloccati. Vincoli DB impediscono doppi conteggi per account e browser, anche con retry concorrenti. Le liste riportano conteggio e stato personale. Evidenze delle conferme autenticate alimentano il punteggio privato già esistente; le anonime contano nel riscontro ma non aumentano l’attendibilità, preservando la protezione precedente contro account anonimi multipli.
- db/schema.ts, drizzle/0014_light_red_wolf.sql e metadati: nuova tabella sky_confirmations, PK report/device e unique report/actor. Nessuna coordinata salvata nelle conferme. Migrazione generata con Drizzle, non distruttiva.
- dist/sky-community.js: richiesta GPS esplicita, pulsante conferma visibile solo dopo posizione valida recente ed entro5km; controllo posizione ripetuto al gesto. Nessuna acquisizione automatica. Stato Invio e conteggio dopo risposta server, vibrazione12ms nel try/catch solo sul gesto. Il feed conserva i sei pulsanti rapidi e D6. Riscontro dopo3minuti, retry2minuti finché il report resta attivo; persone concordi uniche nelle ultime15minuti entro3km o conferme del proprio report. Modello corrente richiesto solo con riscontro disponibile, ora dichiarata e dato entro30minuti. Nessuna somma fra report e conferme che duplichi le persone. Modello non disponibile dichiarato. Riscontro rimosso quando scade la segnalazione.
- dist/living-world.css: accento persone, foto4:3, barraTTL e contrasto dei metadati. Opacità100→85%, barra ricalcolata nel ciclo esistente30secondi; dissolvenza400ms già esistente conservata e disattivata con movimento ridotto.
- dist/sw.js: cachev33. dist/server/index.js e dist/.openai/drizzle: build/migrazioni distribuite.
- test-sky-confirm.mjs: controlli su identità, distanza, accuratezza, auto-conferma, concorrenza, browser/account, attendibilità, anonimo, conteggi, blocchi, moderazione e scadenza.
- test-report-life.mjs: TTL, scadenza, unicità dei concordi, ultima dichiarazione contraria, distanza/ora/futuro e fenomeni rapidi senza inventare intensità.
- test-sky.mjs: supporto ai due cookie di sessione nei test,58 regressioni superate.
- PROJECT_STATUS.md e PROJECT_VISION.md: continuità aggiornata.

## Verifiche e limiti
Test conferme, report-life, sky58, quick-sky, nearby-feed e feed-motion superati; build e sintassi riuscite. Test in database isolato, nessun post di prova in produzione. GPS/vibrazione non provati su telefono fisico. Cookie cancellabili e coordinate fornite dal browser non certificano presenza né unicità fisica della persona; il controllo server applica distanza ai dati ricevuti. Non presentare il conteggio come misura certificata. I dispositivi senza permesso/precisione possono leggere e segnalare, ma non confermare. Posizione mai salvata nel record di conferma. Il confronto usa dati presenti, non un archivio delle previsioni passate. Non sono push a app chiusa.
