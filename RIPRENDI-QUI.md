# MeteoSocial — riprendi da qui

## 22 settembre 2026 — Segnale: nuova direzione visiva, non pubblicata

Su richiesta dell'utente, nuova identità avorio/inchiostro/arancio per Oggi e Meteo, titoli editoriali e barra inferiore a cinque voci con Mappa centrale. Profilo resta accessibile in alto. Ramo `codex/design-segnale-20260922`, derivato dal lavoro grandine della PR #15. Questa scelta aggiorna la precedente preferenza per il tema scuro uniforme.

Dettagli e limiti in `docs/DESIGN-SEGNALE.md`. Anteprima dei moduli sorgente con dati di esempio verificata a desktop, 390 e 320 px. Compilazione completa ancora bloccata da `spawn EPERM` di esbuild su Windows; nessuna pubblicazione. Sites verificato alla versione 73. Completare build, CI e verifica integrata prima del rilascio.


## 22 settembre 2026 — Osservatorio grandine, sorgente in preparazione

Revisione locale del pannello grandine: finestre 15/30/60/120 minuti, esclusione opzionale dei fenomeni cessati, ordinamento per distanza o recenza, selezione condivisa tra mappa/conteggio/elenco, stato di aggiornamento e apertura del radar pioggia. Le richieste per coordinate appartenenti alla stessa cella di 0,01 gradi vengono riutilizzate; il centro esatto dei filtri viene comunque aggiornato.

Controlli: 18 verifiche pure in test-hail-desk.mjs e sintassi dei moduli modificati; prova browser su harness isolato con tre osservazioni fittizie: finestra 15 minuti, esclusione cessate, corrispondenza marker/elenco, callback radar. Harness fuori dal prodotto. Non verificato il layout completo dell'app o dispositivi fisici.

NON PUBBLICATA: compilazione completa impedita da spawn EPERM di esbuild nell'ambiente Windows corrente. Ultima versione pubblica resta 73. Prima di pubblicare completare installazione, build, test-map-field, test-hail-desk, suite CI e verifica della mappa completa. Non sostituire il sito con la pagina di prova. Nessuna nuova fonte radar grandine, probabilità o previsione d'impatto implementata. Dettagli in docs/HAIL-OBSERVATORY.md.


## 21 settembre 2026 — Cielo, revisione del design

Pubblicata su Sites versione 73 il 21 settembre 2026 alle 14:31 UTC: https://scudo-meteo-community.walkerthehate.chatgpt.site/. Runtime Sites 57be5b203b1cc088d4f28a36ba4c249bdec5bd83, albero c4909fc8be2bfce939bae8241dd25f9d4e64bad9. GitHub PR #14 integrata in main (d718ba54443c4e4f4b469e52eea73a58eabfbc87), Check MeteoSocial 35612426493 e anteprima Netlify superati. Nuova identità inchiostro/lime, community con feed in primo piano, Home e Lente con illustrazione originale, previsioni e navigazione coordinate. Build e 15 suite superate; browser desktop/390 px, commenti, navigazione e testo grande. Nessuna prova su telefoni fisici. Queste note successive non modificano il runtime. Vedere docs/CIELO-DESIGN.md per riferimenti, scelte e limiti.


Versione 72 pubblicata e PR #13 integrata — Ripari e fulmini: leggere il primo blocco di PROJECT_STATUS.md e docs/HAIL-SHELTERS-LIGHTNING.md per stato, verifica e limiti. Le note versione 71 sotto sono storiche.

Versione 71 pubblicata e PR #12 integrata: **La piazza del cielo**. La revisione corrente comprende community con post condivisi con la mappa, conversazioni e Stesso cielo. Leggere il primo blocco di PROJECT_STATUS.md per lo stato effettivo della pubblicazione; la nota versione 70 sotto è storica.

Versione 70 pubblicata e PR #11 integrata: **Ora per ora** nella mappa, con finestra di pioggia e schede IA contestuali. Il primo blocco PROJECT_STATUS.md riporta commit, pubblicazione e controlli. Le 15 suite pertinenti alla revisione passano; i dati sulla suite completa qui sotto si riferiscono al rilascio precedente.

## Base attuale

Il ramo main di GitHub contiene il lavoro condiviso. Sites ospita il sito ufficiale: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi.

Leggere PROJECT_STATUS.md per lo stato della pubblicazione e docs/CLAUDE_HANDOFF.md per i file modificati. Questa sintesi sostituisce il vecchio riepilogo che indicava ancora la versione 64: lo storico completo resta consultabile nella cronologia Git.

## Riprendere su un altro computer

1. Leggere AGENTS.md e PROJECT_VISION.md; le nuove richieste del proprietario hanno precedenza sulla visione storica.
2. Recuperare main aggiornato e la sorgente Sites corrente con il connettore dello stesso account. Confrontare prima le eventuali modifiche locali, senza force push né cancellazioni.
3. Usare Node 24 con node:sqlite e pnpm 11.19.0. Eseguire pnpm install --frozen-lockfile, poi node tools/resume.mjs --check e node build.mjs.
4. Eseguire node tools/run-tests.mjs. Sono passate 52 suite; il runner classifica separatamente 6 suite che citano moduli ritirati. La classificazione è euristica, non equivale a test superati.
5. node tools/resume.mjs avvia l'anteprima con profilo di prova e database separato. Le chiavi reali restano nei segreti Sites.

## Vincoli da conservare

- dist contiene anche sorgenti: non cancellare questa cartella. Solo dist/app e dist/server sono output ignorati da Git.
- build.mjs incorpora dist/citta-mondo.js nel Worker come WORLD_CITIES. Non rimuovere questa trasformazione.
- La mappa principale è #mappa-eventi. #mappa-classica e il vecchio alias restano disponibili.
- Il radar è osservato, a copertura variabile; il modello temporali non è un rilevatore di fulmini. Grandine community non significa allerta ufficiale.
- Lente usa coordinate solo nel backend meteo: non le invia a OpenAI. Nessun autore o media nella richiesta della mappa; massimo tre scambi della stessa località.
- Nessun nuovo servizio push, nessuna previsione affidabile di arrivo grandine o riattivazione automatica di H6: le dipendenze delle fonti osservate restano aperte.
- Non esiste sincronizzazione automatica delle cartelle locali o dei database di produzione. Salvare codice e note su GitHub e sorgente Sites al termine del lavoro autorizzato.
