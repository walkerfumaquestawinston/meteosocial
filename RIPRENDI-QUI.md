# MeteoSocial — riprendi da qui

## 22 settembre 2026 — Versione 76 pubblicata: leggibilità e chiarezza

Pubblicazione Sites confermata riuscita: 2026-09-22T00:47:06.483951+00:00. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site

Versione 76: appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_1d60aff828f88191abcde021e1fbfd48. Deployment: appgdep_6ab1cf9c73f881919a646ed4b65b33ac. Runtime Sites: 2ed938fea7e23e75d0c214a7c8ca131d079081c6. Albero: 49714f6f6ca429d99ebc602c28ba9384a9f38d67, identico al commit GitHub 4c3529645f45c47d8188fadc373a869b21fc6dd9.

GitHub: https://github.com/walkerfumaquestawinston/meteosocial/pull/19, ramo codex/readability-20260922, draft sopra PR #18. Le PR precedenti non sono state unite a main; per proseguire il lavoro usare questo ramo aggiornato. Anteprima live locale allineata: http://127.0.0.1:4595/#home. Il collegamento PWA ?view=giornata mantiene aperto il piano anche dopo il caricamento del profilo; verificato nel browser. Queste note successive sono solo documentazione e non richiedono una nuova versione runtime.

La versione 75 aveva pubblicato le correzioni di contrasto e ingresso; la 76 include anche il collegamento diretto alla giornata. Tutte le modifiche sono salvate online. Nessun servizio di sincronizzazione in background installato. Pubblico e segreti Sites invariati. Le note precedenti "in corso" sono superate da questo esito.


## 22 settembre 2026 — Leggibilità e ingresso semplificato

Revisione successiva alla versione 74, su richiesta dell'utente dopo riscontro di testi illeggibili e sovraccarico visivo. L'ingresso senza hash apre Oggi. Tre azioni esplicite: Previsioni, Mappa e radar, Segnala il meteo. Ricerca città diretta; barra inferiore con Segnala. Funzioni aggiuntive e pianificazione restano in sezioni apribili. Lente nella mappa è apribile su richiesta. Dati, fonti e bollettini ufficiali restano disponibili.

Corrette coppie testo/sfondo in Oggi, Meteo, community e controlli mappa nelle fasi solari. I pannelli specialistici storici conservano superfici scure con testo chiaro. Testi e superfici semantiche delle quattro palette superano 4,5:1 (minimi: giorno 4,90; notte 8,18; alba 4,83; tramonto 4,57). Controllo DOM e visivo di giorno/notte su anteprima integrata, desktop e 390 px; corrette anche etichette tagliate. Il controllo DOM è un audit mirato, non una certificazione completa: gradienti e illustrazioni sono verificati visivamente. Nessuna segnalazione di prova pubblicata.

Compilazione completa riuscita con fallback WASM. Superati test-atmosphere, test-feature-routes, test-solar-live-map, test-mappa, test-day-plan e test-community-context. Anteprima live: http://127.0.0.1:4595/. Pubblicazione di questa revisione da confermare tramite stato Sites; numero versione e link GitHub saranno registrati dopo il rilascio.

Preferenza permanente: per ogni aggiornamento completato allineare anteprima locale, sorgente GitHub e pubblicazione Sites. Non è una sincronizzazione automatica in background e non include preferenze del browser o bozze private. Prima di nuovi interventi recuperare sempre la sorgente più recente dello stesso Site. Le note delle precedenti revisioni restano storiche.


## 22 settembre 2026 — Versione 74 pubblicata su Sites

Pubblicazione confermata riuscita il 22 settembre 2026 alle 00:23:28 UTC (02:23 in Italia): https://scudo-meteo-community.walkerthehate.chatgpt.site

Include Segnale, osservatorio grandine, tema automatico alba/giorno/tramonto/notte, precaricamento e aggiornamento progressivo della mappa. Compilazione remota Sites riuscita; nessun cambiamento al pubblico del sito o ai segreti. La versione online è utilizzabile dagli altri PC senza avviare il server locale.

Runtime: commit cbf46a5412ed49cd587d2406d0d191fccf7e2907, albero 6c56a5b5064733f032e10da330e72544fe2c28df. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_45332c1ce25881918e56a6df9ad17e8e, deployment appgdep_6ab1ca0f7c948191b9b30dad9c2a36a8. Sorgente riconciliata con e74cf310242672f59677a37a3a31ad0a739339f8, verificata identica alla base GitHub precedente alle modifiche; nessuna sovrascrittura forzata. Queste note successive non cambiano il runtime pubblicato.

Il workflow locale Sites resta incompatibile con le pipe di questa sessione Windows. Il rilascio ha usato il salvataggio sorgente verificato e il fallback di compilazione remota supportato dai tool Sites. Credenziali temporanee solo in memoria/stdin e ambiente del comando, mai salvate. Per gli aggiornamenti successivi recuperare la sorgente Sites attuale prima di modificare. I precedenti avvisi “non pubblicato” sono storici e superati da questa nota.


## 22 settembre 2026 — Ciclo solare e mappa più pronta

Tema automatico attivo per la località scelta: notte, alba (30 minuti prima/dopo), giorno e tramonto (45 minuti prima/dopo). Orari solari e fuso del provider; in assenza di orari validi, flag giorno/notte soltanto se recente, poi fascia oraria approssimata 07–19. Controllo ogni 30 secondi e al ritorno alla scheda. La nuova palette si applica a Oggi, Meteo, intestazione e superfici della mappa; colori dei fenomeni separati.

Componenti cartografici precaricati dopo l'avvio; meteo selezionato caricato in parallelo alle altre fonti e dati della località disponibili subito quando già presenti. Evitata la ricostruzione della mappa alla risposta tardiva del profilo. Aggiornamento visibile ogni minuto, cache meteo 2 minuti e osservazioni generali 1 minuto; pannello locale entro 2 minuti. Richieste duplicate condivise e risposte vecchie dopo svuotamento cache non ripristinate. Radar con tempi propri del provider. Nessuna garanzia di latenza zero o dati in tempo reale oltre la frequenza delle fonti.

Build Windows riuscita. Superati test-solar-live-map, test-mappa (58 controlli), test-atlas-radar, test-map-weather-source, test-map-field e test-hail-desk (18 controlli). Browser: Home notturna leggibile, navigazione Mappa, cartografia e radar visibili. Alba/tramonto e altri fusi verificati nei test deterministici, non su dispositivi fisici. Anteprima live: http://127.0.0.1:4595/#home. Sites ancora non pubblicato.


## 22 settembre 2026 — Compilazione Windows e anteprima live risolte

Il compilatore nativo restituisce EPERM avviando il processo con pipe in questa sessione. `build.mjs` usa ora esbuild-wasm 0.28.2 nello stesso processo soltanto in caso di EPERM (oppure METEOSOCIAL_COMPILER=wasm). Non vengono modificati permessi Windows o protezioni. La verifica sintattica dei moduli usa output ereditato. Dipendenza bloccata nel lockfile.

Build completa riuscita e 16 suite CI eseguite localmente con uscita 0. I mock di test-lente stampano messaggi di errore del recupero DPC pur completando tutti i 76 controlli. Anteprima dell'app completa avviata con backend locale, dati e profilo separati; Home con previsioni recuperate, navigazione disponibile. Non è una verifica completa dei flussi su dispositivo fisico; IA locale non configurata.

Avvio: `node tools/live-preview.mjs`, poi http://127.0.0.1:4595/#home. Le modifiche ai moduli frontend, CSS/HTML e server ricompilano l'app e ricaricano il browser dopo una build riuscita. Verificata una ricompilazione da modifica CSS. L'anteprima funziona finché il processo resta aperto. I cambi a dipendenze, strumenti di avvio o risorse grafiche richiedono riavvio.

Sites NON aggiornato: il workflow ufficiale di preparazione sorgenti resta da sbloccare/verificare; l'ultima versione verificata online è 73. Il precedente blocco della compilazione dell'app è risolto, non confonderlo con pubblicazione riuscita.


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
