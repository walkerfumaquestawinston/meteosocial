# D9 e D10 — Moderazione e autorizzazione

## Modifiche
- server/moderation.js: password ad alta entropia verificata tramite hash runtime, sessioni casuali conservate come hash, cookie HttpOnly/SameSite/Secure, scadenza 8 ore e invalidazione alla rotazione del verificatore. Login limitato per IP. POST vincolati a origine e JSON. Elenco paginato delle ultime 24 ore, foto private, rimozione e blocco account/browser riconosciuti.
- server/worker.js: instradamento API riservate e controllo dei blocchi su tutte le scritture API. Autenticazione esistente preservata.
- db/schema.ts e migrazione additiva 0015 con metadati: sessioni moderatore, blocchi, associazioni account/browser. Nessuna cancellazione dei dati esistenti.
- dist/moderation.js: pannello #moderazione e tre regole in #regole.
- dist/main.js e dist/sky-community.js: rotte e collegamento alle regole.
- build.mjs e output dist/server/index.js, dist/.openai/drizzle: inclusione modulo e migrazione.
- dist/sw.js: versione cache v35 e modulo UI pubblico; nessuna cache delle API riservate.
- test-moderation.mjs: controlli negativi e positivi di autorizzazione/moderazione.
- PROJECT_STATUS.md e PROJECT_VISION.md: continuità del blocco.

## Verifica
Build riuscita. test-moderation.mjs, test-sky.mjs (58 controlli), test-sky-confirm.mjs e test-quick-sky.mjs superati. Senza sessione valida, POST /api/posts e /api/sky/reports restituiscono 401 prima della validazione del contenuto. Sessione anonima valida ancora ammessa per la prima osservazione. Nessuna prova distruttiva sui dati di produzione.

## Limiti dichiarati
La revisione/rimozione entro 24 ore richiede presenza operativa del gestore; non è uno SLA automatico. Il blocco usa account e cookie, non identifica fisicamente il dispositivo; cambio account/browser può aggirarlo. Le associazioni browser iniziano da questa versione. La pagina protegge dati e azioni sul server, non nasconde soltanto i pulsanti. Il punteggio privato e l'oscuramento per abuso già presenti sono preservati. La password non è nel repository né nel client: file d'accesso separato per il proprietario, verificatore segreto runtime. Nessun blocco successivo avviato.
