# MeteoSocial — istruzioni per Claude

Leggi prima AGENTS.md, PROJECT_STATUS.md, RIPRENDI-QUI.md e PROJECT_VISION.md. In ciascuno i paragrafi più recenti prevalgono sulla cronologia. Le istruzioni esplicite di Walker prevalgono su questi documenti.

## Punto di partenza

Ultima pubblicazione verificata: versione 64, fase 24.2 completata (Chi ci lavora). La 24.1 è completata. Il prossimo blocco previsto è 24.6, ma implementarlo solo se assegnato esplicitamente. Non avviare tutte le fasi in autonomia.

La direzione attuale è la mappa locale MapLibre, non il globo 3D o NASA. Conserva il tema, le funzioni già operative, l’onestà dei dati e la moderazione. Nessun numero inventato. Non presentare dati di modello come misure osservate. Il verdetto B2 resta bloccato dalle fonti osservate e dalla pianificazione documentate.

## Collaborazione

Il repository Sites resta il riferimento per la pubblicazione. Un eventuale repository GitHub sarà lo spazio condiviso per proporre modifiche, non un secondo sito. La sorgente Sites è stata sincronizzata nel repository pubblico walkerfumaquestawinston/meteosocial il 17 settembre 2026 per scelta del proprietario. Leggi docs/CLAUDE_HANDOFF.md per la provenienza.

Prima di lavorare, verifica il commit di partenza e che comprenda l’ultima versione Sites confermata. Se non puoi verificare Sites, chiedi al coordinatore di sincronizzare il commit; non indovinare credenziali o remoti.

Lavora su un ramo separato per il compito assegnato, per esempio claude/nome-compito. Non scrivere direttamente su main, non usare force push, non sovrascrivere il lavoro di Codex. Non modificare contemporaneamente gli stessi file: segnala le dipendenze nel riepilogo della proposta.

Apri una pull request quando GitHub è configurato, oppure consegna un diff con il commit di base se non hai accesso. Scrivi: obiettivo, file modificati, verifiche eseguite, limiti. Il coordinatore integra, risolve eventuali conflitti, verifica e pubblica nello stesso progetto Sites. Non creare un altro sito né cambiare accessi o servizi.

## Struttura e avvio

Attenzione: dist/ contiene anche SORGENTI frontend. Non cancellarla come se fosse solo output.
- dist/main.js e moduli dist/*.js: frontend; dist/design-system.css e altri CSS: stili.
- server/*.js: sorgenti backend; dist/server/index.js: output generato.
- build.mjs: composizione Worker e bundle; dist/app/: bundle generati.
- db/schema.ts, drizzle/: schema e migrazioni; non riscrivere migrazioni già applicate.
- tools/local-preview.mjs: database di prova separato dalla produzione.

Usa Node 24 con node:sqlite e il lockfile pnpm esistente. Se mancano dipendenze: pnpm install --frozen-lockfile. Non sostituire il lockfile o aggiornare pacchetti senza necessità.

Controllo ambiente: node tools/resume.mjs --check
Build: node build.mjs
Anteprima portabile: node tools/resume.mjs

Esegui solo test pertinenti al cambiamento. Esempi già verificati per le ultime fasi:
- node test-daily-question.mjs
- node test-profession.mjs
- node test-sky-confirm.mjs

Non servono credenziali di produzione per questi test. Se una fonte esterna fallisce, dichiaralo; non usare dati inventati nella versione pubblica.

## Sicurezza e pubblicazione

Non copiare segreti, token, cookie, database locali, foto degli utenti o node_modules su GitHub. Le variabili di produzione restano in Sites. Non chiedere di incollare password nella chat. Il progetto pubblico resta https://scudo-meteo-community.walkerthehate.chatgpt.site.

Le modifiche del codice non trasferiscono account, database di produzione, sessioni o preferenze fra dispositivi. Non promettere sincronizzazione automatica o dialogo automatico fra agenti: il coordinamento avviene tramite compiti, rami e revisioni.
