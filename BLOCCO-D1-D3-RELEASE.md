# D1 e D3 — integrazione approvata

La verifica ha trovato due sistemi: posts legacy e sky attivo. L’utente ha approvato esplicitamente di integrare i sei pulsanti nel sistema sky. Non si modifica il compositore lungo storico, riservato a D2.

- dist/sky-community.js: sei pulsanti con forma esistente, invio senza testo, scheda locale in attesa separata dai conteggi reali, un retry automatico per errore transitorio e retry manuale con stesso ID, nota facoltativa dopo il salvataggio, nome automatico locale modificabile nel Profilo. Nome e nota restituiti nei report. I tentativi in sospeso sono in memoria e non sopravvivono alla chiusura della pagina (coda persistente prevista in G3).
- dist/quick-report.js: i sei pulsanti precedenti delegano al sistema sky. Il codice del vecchio percorso resta preservato.
- dist/main.js: collegamenti Profilo/rapidi e status HTTP negli errori per distinguere accesso, validazione e rete.
- server/sky.js: sei tipi validati, nome e nota salvati, note modificabili solo dall’autore durante le due ore. Intensità null nell’API per segnalazioni senza misura; escluse dal confronto numerico delle intensità. Sessioni, consenso, arrotondamento zona, moderazione e limite prima segnalazione anonima preservati. Retry dopo risposta persa resta idempotente.
- db/schema.ts, drizzle/0012_round_paper_doll.sql, drizzle/meta/0012_snapshot.json, drizzle/meta/_journal.json: tre colonne additive con default costante, nessuna rimozione o modifica di vecchie migrazioni.
- dist/server/index.js, dist/.openai/drizzle/**, dist/sw.js: distribuzione e cache v26.
- test-sky.mjs, test-quick-sky.mjs: 52 controlli server e test client della risposta persa/retry, comparsa immediata e assenza di contatori inventati.
- PROJECT_STATUS.md e PROJECT_VISION.md: continuità e pausa.

## Verifiche e limiti
Build riuscita; 52 controlli server superati con database locale separato: tutti i sei fenomeni senza testo, ID duplicati, nota persistente e accesso esclusivo autore, rifiuto 401 senza sessione. Test client: pending immediato e retry dopo risposta persa, unico report e conteggi solo confermati. Browser mobile: sei pulsanti, nome modificabile e percorso di accesso per ospite che ha già segnalato. Il browser conservava una sessione ospite precedente: il successo del primo invio è stato verificato nei test isolati, non tramite quella sessione del browser. Nessuna segnalazione di prova inviata al sito pubblico.

Prima segnalazione senza account; per le successive permane il limite di accesso già presente. Nome salvato su dispositivo e copiato nei nuovi report; non è una sincronizzazione profilo fra PC. Nessuna previsione corretta o intensità inventata. Gli altri blocchi restano fuori da questa consegna.
