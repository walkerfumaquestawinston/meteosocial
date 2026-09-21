# MeteoSocial — istruzioni per Claude

## 22 settembre 2026 — Passaggio a Claude: osservatorio grandine

Revisione consegnata nel ramo GitHub `codex/grandine-claude-20260922`, da continuare prima dell'integrazione. Base GitHub verificata: `5be5026df25faabcca7cbd2479fb96916520c9fd`, albero identico alla base Sites locale `e74cf310242672f59677a37a3a31ad0a739339f8`.

Leggere `docs/HAIL-OBSERVATORY.md`. Implementati filtri temporali 15/30/60/120 minuti, cessate escludibili, ordinamento distanza/recenza, selezione comune a marker/conteggio/elenco, freschezza e radar pioggia. Riutilizzo delle richieste nella medesima cella pubblica di 0,01 gradi.

Verificati 18 casi in `test-hail-desk.mjs`, sintassi dei moduli e interazioni in un harness browser locale. La build completa non è riuscita: Windows restituisce `spawn EPERM` da esbuild. Nessuna pubblicazione; Sites pubblico resta alla versione 73.

Prossimi passi per Claude: installare dal lockfile con Node 24/pnpm 11.19.0, eseguire build e CI (incluso test-hail-desk), verificare la mappa completa a 390 px e desktop, controllare aggiornamento dei pannelli già aperti e stati di errore, completare eventuali correzioni nello stesso ramo o in un ramo derivato. Non presentare i controlli dell'harness come verifica completa dell'app. Radar grandine dedicato, probabilità, traiettorie e notifiche a app chiusa non sono implementati da questa revisione.


Leggi prima AGENTS.md, PROJECT_STATUS.md, RIPRENDI-QUI.md e PROJECT_VISION.md. In ciascuno i paragrafi più recenti prevalgono sulla cronologia. Le istruzioni esplicite di Walker prevalgono su questi documenti.

## Punto di partenza storico — superato dallo stato del 22 settembre

Ultima pubblicazione verificata su Sites: **versione 64**, fasi 24.1 e 24.2 completate. Il blocco 24.6 non è stato avviato: implementarlo solo se assegnato esplicitamente. Non avviare tutte le fasi in autonomia.

**Dal 18 al 21 settembre 2026 il lavoro è andato oltre le fasi numerate**, su richiesta diretta del proprietario: `main` contiene la **mappa degli eventi atmosferici** (`#mappa-eventi`, aperta dalla voce Mappa), con meteo ed eventi mondiali in tempo reale, avviso grandine e Lente integrata come barra in cui si scrive. Leggi `MAPPA-EVENTI-RELEASE.md` e la sezione del 21 settembre in `RIPRENDI-QUI.md` prima di toccare quella parte. Il sito su Sites resta alla 64: GitHub e Netlify sono avanti, la pubblicazione è un passo separato.

Ci sono ora due mappe e convivono: quella MapLibre della versione 64 su `#mappa-classica`, e quella Leaflet degli eventi su `#mappa-eventi`. Nessuna delle due va rimossa senza che il proprietario lo chieda. Il globo 3D e i moduli NASA restano ritirati dal bundle.

Conserva il tema, le funzioni già operative, l’onestà dei dati e la moderazione. Nessun numero inventato. Non presentare dati di modello come misure osservate. Quando una fonte non risponde, dichiararlo: non riempire il buco. Il verdetto B2 resta bloccato dalle fonti osservate e dalla pianificazione documentate.

## Collaborazione

Il repository Sites resta il riferimento per la pubblicazione. Un eventuale repository GitHub sarà lo spazio condiviso per proporre modifiche, non un secondo sito. La sorgente Sites è stata sincronizzata nel repository pubblico walkerfumaquestawinston/meteosocial il 17 settembre 2026 per scelta del proprietario. Leggi docs/CLAUDE_HANDOFF.md per la provenienza.

Prima di lavorare, verifica il commit di partenza e che comprenda l’ultima versione Sites confermata. Se non puoi verificare Sites, chiedi al coordinatore di sincronizzare il commit; non indovinare credenziali o remoti.

Lavora su un ramo separato per il compito assegnato, per esempio claude/nome-compito. Non scrivere direttamente su main, non usare force push, non sovrascrivere il lavoro di Codex. Non modificare contemporaneamente gli stessi file: segnala le dipendenze nel riepilogo della proposta.

Apri una pull request quando GitHub è configurato, oppure consegna un diff con il commit di base se non hai accesso. Scrivi: obiettivo, file modificati, verifiche eseguite, limiti. Il coordinatore integra, risolve eventuali conflitti, verifica e pubblica nello stesso progetto Sites. Non creare un altro sito né cambiare accessi o servizi.

### Ogni aggiornamento dev'essere ricostruibile da ChatGPT in tempo reale

Regola del proprietario, 18 settembre 2026. Vale per ogni intervento, anche il più piccolo.

Nessun aggiornamento resta solo in chat o solo su questo computer. Appena un lavoro è compiuto e verificato va su GitHub: commit e push subito, non a fine sessione e non accumulando più cose in un colpo solo. Chi riprende da ChatGPT deve trovare su GitHub lo stato reale in quel momento, non una versione di qualche ora prima.

Ogni push porta con sé il proprio contesto, così da bastare da solo:
- il messaggio di commit dice cosa cambia, perché, e cosa è stato verificato;
- PROJECT_STATUS.md e docs/CLAUDE_HANDOFF.md vengono aggiornati **nello stesso push**, non dopo;
- i limiti e le cose non verificate si dichiarano, non si sottintendono.

Se un lavoro non si riesce a salvare su GitHub, dillo chiaramente invece di lasciarlo in sospeso: un aggiornamento che esiste solo qui, per il coordinatore non esiste.

## Struttura e avvio

Attenzione: dist/ contiene anche SORGENTI frontend. Non cancellarla come se fosse solo output.
- dist/main.js e moduli dist/*.js: frontend; dist/design-system.css e altri CSS: stili.
- server/*.js: sorgenti backend; dist/server/index.js: output generato.
- build.mjs: composizione Worker e bundle; dist/app/: bundle generati.
- dati/comuni.json e dist/citta-mondo.js: elenchi che build.mjs incorpora nel Worker. Il secondo viene rinominato WORLD_CITIES, come già accade a CITIES di dist/places.js: servono sia al browser sia al Worker, e duplicarli farebbe divergere le due copie. Chi tocca build.mjs non rimuova quelle sostituzioni.
- db/schema.ts, drizzle/: schema e migrazioni; non riscrivere migrazioni già applicate.
- tools/local-preview.mjs: database di prova separato dalla produzione.

Usa Node 24 con node:sqlite e il lockfile pnpm esistente. Se mancano dipendenze: pnpm install --frozen-lockfile. Non sostituire il lockfile o aggiornare pacchetti senza necessità.

Controllo ambiente: node tools/resume.mjs --check
Build: node build.mjs
Anteprima portabile: node tools/resume.mjs

Suite completa: node tools/run-tests.mjs — oggi 47 superati, 6 non pertinenti, 0 falliti. I non pertinenti interrogano moduli conservati in Git ma esclusi dal bundle consegnato.

Esegui i test pertinenti al cambiamento. Già verificati:
- node test-mappa.mjs — API dei comuni, raggiungibilità della mappa dal menù, modalità a tutto schermo, cosa viene mandato alla Lente
- node test-mappa-diretta.mjs — eventi NASA tenuti e scartati, abbinamento meteo, elenco città unico fra browser e Worker
- node test-grandine-avviso.mjs — le tre condizioni dell'avviso, ognuna violata una per volta
- node test-daily-question.mjs
- node test-profession.mjs
- node test-sky-confirm.mjs

Nessuno di questi usa la rete: le funzioni sono pure e l'orologio entra dai parametri, quindi il risultato non dipende da quando girano.

Non servono credenziali di produzione per questi test. Se una fonte esterna fallisce, dichiaralo; non usare dati inventati nella versione pubblica.

## Sicurezza e pubblicazione

Non copiare segreti, token, cookie, database locali, foto degli utenti o node_modules su GitHub. Le variabili di produzione restano in Sites. Non chiedere di incollare password nella chat. Il progetto pubblico resta https://scudo-meteo-community.walkerthehate.chatgpt.site.

Le modifiche del codice non trasferiscono account, database di produzione, sessioni o preferenze fra dispositivi. Non promettere sincronizzazione automatica o dialogo automatico fra agenti: il coordinamento avviene tramite compiti, rami e revisioni.
