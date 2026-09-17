# Sincronizzazione GitHub — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

## Riprendere il lavoro
Leggi CLAUDE.md, AGENTS.md, PROJECT_STATUS.md, RIPRENDI-QUI.md e PROJECT_VISION.md. Il frontend sorgente è in dist/, il backend in server/. Non eliminare dist/ come semplice output.

Sito: https://scudo-meteo-community.walkerthehate.chatgpt.site

Node 24 con node:sqlite. Per ricostruire installa le dipendenze del lockfile con pnpm install --frozen-lockfile, poi node build.mjs. Per anteprima e controlli dell’ambiente usa node tools/resume.mjs --check e node tools/resume.mjs.

## Collaborare
Claude lavora su un branch e propone una pull request; il coordinatore verifica, integra e pubblica sul progetto Sites esistente. Aggiornare le note di stato e indicare sempre il commit di base. Una modifica nella chat non è sincronizzata finché non è salvata nel repository.

## Verifiche della sincronizzazione
Test test-daily-question.mjs, test-profession.mjs e test-sky-confirm.mjs superati sul codice recuperato. Nessuna modifica al comportamento, nessuna nuova build o pubblicazione Sites effettuata in questa sincronizzazione.
