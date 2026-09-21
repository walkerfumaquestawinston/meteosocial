# MeteoSocial — riprendi da qui

## 21 settembre 2026 — Cielo, revisione del design

Implementazione e verifica locale completate; pubblicazione del nuovo design in preparazione. La versione pubblica verificata precedente è 72. Nuova identità inchiostro/lime, community con feed in primo piano, Home e Lente con illustrazione originale, previsioni e navigazione coordinate. Build e 15 suite superate, revisione desktop/390 px e testo grande. Vedere docs/CIELO-DESIGN.md per riferimenti, scelte e limiti.


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
