# Sincronizzazione GitHub — 17 settembre 2026

Le sezioni sono in ordine dal più recente al più vecchio, come in PROJECT_STATUS.md.

## Build riproducibile e suite di test leggibile — 17 settembre 2026

Ramo `claude/admiring-brown-065b6t`, a partire da 00c851f916720f199484d04291c82971a9da297d. Solo infrastruttura: nessuna modifica al comportamento dell'applicazione, ai testi visibili, allo schema o alle migrazioni. Versione pubblicata invariata: 64.

Prima di questo intervento `node build.mjs` su Linux riscriveva dieci artefatti senza cambiare una riga di codice, perché mancava `.gitattributes` e il checkout convertiva i fine riga in modo diverso a seconda del sistema. Il diff fantasma rendeva impossibile distinguere una modifica reale dal rumore e bloccava lo scambio delle proposte su GitHub. Ora `* -text` disattiva ogni conversione, gli artefatti sono salvati con LF e dopo la build l'albero di lavoro resta pulito. I sorgenti già salvati con CRLF restano CRLF: nessuna rinormalizzazione di massa e nessun file sorgente toccato, quindi niente conflitti con lavoro in corso.

La suite aveva 10 test rossi su 50, nessuno per una regressione. `npm test` (`tools/run-tests.mjs`) esegue tutto con `--experimental-vm-modules` e separa superati, non pertinenti e falliti: 44 superati, 6 non pertinenti dichiarati, 0 falliti. I moduli ritirati hanno ora una fonte unica in `tools/retired-modules.mjs`, condivisa da build e test.

Per riprendere: `pnpm install --frozen-lockfile`, poi `node build.mjs` e `npm test`. Se la build lascia file modificati, è una modifica reale, non più rumore. Dettagli, limiti e problemi aperti nella sezione corrispondente di PROJECT_STATUS.md, compresi i sei test da rileggere e le due frasi sul globo rimaste in `dist/sky-community.js`.

## Sincronizzazione iniziale — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

Leggi CLAUDE.md e docs/COLLABORAZIONE-CLAUDE.md. Le istruzioni precedenti sul vecchio prototipo single-file, globo three.js r128 e src/ sono superate. Il progetto corrente usa mappa locale MapLibre e frontend in dist/. Non avviare 24.6 senza incarico esplicito.
