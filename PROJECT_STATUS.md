# Sincronizzazione GitHub — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

Le note precedenti qui sotto restano cronologia; le affermazioni sul mancato trasferimento GitHub sono superate da questa sincronizzazione.

## Mappa mondiale: temperature, eventi NASA, grandine e Lente — 18 settembre 2026

Richiesta del proprietario: una mappa come argosatlas.com/map, con temperatura, grandine ed eventi in tempo reale in tutto il mondo e con l'IA integrata.

**Premessa dichiarata:** argosatlas.com non e raggiungibile da questo ambiente, quindi il riferimento visivo resta la descrizione che ne fa la specifica, non il sito osservato.

**Scoperta che ha cambiato il lavoro.** I servizi mondiali esistevano gia nel Worker, inutilizzati dopo il ritiro del globo: /api/atlas/world (200 citta in 159 paesi, Open-Meteo), /api/atlas/events (NASA EONET, eventi aperti in tempo reale) e /api/atlas/hail (grandine dalla community). Non serviva costruirli ne serviva uno scheduler: globeSnapshot in server/world-weather.js e gia la pipeline che la specifica chiedeva, con blocchi da 50 citta, cache di 15 minuti nel database e dato precedente conservato quando la fonte non risponde.

**Quattro livelli collegati**, ognuno con la propria fonte dichiarata:
COMUNI 7.894 italiani, elenco statico; TEMPERATURE 200 citta mondiali con misura vera e colore dalla scala termica; EVENTI incendi, tempeste, alluvioni e vulcani da NASA EONET; GRANDINE segnalazioni delle persone, con il raggio che cresce con la dimensione dei chicchi e non con le conferme.

Ogni livello carica per conto proprio: se una fonte cade le altre restano in piedi. La barra di stato barra in rosso le fonti che non rispondono e segna con un asterisco quelle che servono il dato precedente. Verificato dal vivo: in questo ambiente Open-Meteo e NASA risultano barrate perche la rete della sessione le blocca, mentre ISTAT e le persone funzionano. In produzione rispondono, perche quegli endpoint sono gia in uso.

**IA integrata:** da ogni scheda si puo chiedere a Lente. Alla Lente vanno solo il nome della localita e la domanda, mai coordinate precise, autori o media, come prescrivono le regole scritte in server/assistant.js. La risposta compare dichiarata come generata, mai confusa con una previsione ufficiale.

**Limite sulla densita.** ARGOS mostra 177.700 nodi. Qui il massimo raggiungibile con i dati disponibili e 7.894 comuni italiani piu 200 citta mondiali piu fino a 300 eventi: densita di classe ARGOS sull'Italia, non sul mondo. Per arrivarci davvero servirebbe un elenco mondiale di localita con coordinate, che al momento non c'e.

Verifiche: suite completa 45 superati, 0 falliti; browser reale a 375 px senza errori JavaScript, con le quattro pillole, i conteggi veri e le fonti barrate corrette. Lo sfondo cartografico non e stato visto, perche anche le mattonelle sono bloccate da qui.

## Mappa eventi atmosferici — API dei comuni e prima vista — 18 settembre 2026

Secondo blocco della specifica PROMPT-MAPPA. Il proprietario ha confermato due volte di procedere pur senza risposta ai bloccanti, quindi le decisioni aperte sono state prese qui e sono dichiarate.

**Tre decisioni prese, tutte reversibili.**

1. **Leaflet come chiede la specifica, ma in un modulo nuovo su una rotta nuova, `#mappa-eventi`.** La Mappa MapLibre pubblicata nella versione 64 non è stata toccata. Così si confrontano le due sull'anteprima e si decide quale diventa `#mappa`: cambiarla è una riga. Sostituire subito avrebbe buttato funzionalità già pubblicate senza averle viste a confronto.
2. **Lo scheduler non serve per questo blocco.** L'elenco dei comuni è statico e viaggia dentro il Worker, quindi l'endpoint non chiama nulla all'esterno e non ha limiti di frequenza da rispettare. I livelli che dipendono da fonti esterne restano fuori.
3. **Sette pillole su otto non vengono mostrate.** Pioggia, temporali, grandine, neve, vento, allerte e persone richiedono fonti non ancora collegate: una pillola che non accende niente è un numero inventato travestito. Si mostreranno quando avranno dati veri.

**Scostamento dichiarato** dalla specifica 5.2: ai livelli 6 e 7 chiede i capoluoghi di regione e di provincia, ma le fonti disponibili non hanno un campo «capoluogo» e ricavarlo dalla popolazione sbaglierebbe, perché L'Aquila è capoluogo d'Abruzzo mentre Pescara è più popolosa. Si usano i più popolosi, criterio vero e dichiarato nella risposta, con gli stessi ordini di grandezza.

**Server:** `server/mappa.js` con `GET /api/mappa/comuni`, filtro per riquadro e per zoom, formato compatto, tetto di 1200 righe con troncamento dichiarato, `Cache-Control: public, max-age=300`. I comuni entrano nel Worker come letterale compatto (481 KB invece di 1.044 in forma di oggetti); il Worker passa da 4,5 a 5,0 MB, da 1,60 a 1,77 MB compresso.

**Vista:** `dist/mappa-eventi.js` e `dist/mappa-eventi.css`. Leaflet con `preferCanvas` e renderer canvas, `circleMarker` per i dati di massa, import dinamico che carica Leaflet solo entrando nella sezione, debounce di 400 ms su `moveend` e `zoomend`, stop con `document.hidden`, `map.remove()` all'uscita. Barra di stato monospaziata con orologio al secondo, fonte barrata in rosso quando non risponde, conteggi veri. Pillole con stato in `localStorage`, invito a riaccendere quando si spegne tutto, pulsante ELENCO per l'uso con screen reader, attribuzioni sempre visibili.

**Verifiche nel browser reale a 375 px:** Leaflet **non** viene scaricato prima di aprire la Mappa, che era il rischio più concreto; canvas presente; l'API viene chiamata con riquadro e zoom; uscendo dalla sezione il contenitore sparisce e nessun timer resta acceso; dodici etichette disegnate e nessuna che esce dal riquadro; controlli galleggianti dentro la mappa.

Tre difetti trovati e corretti durante la verifica: le etichette uscivano dal riquadro perché il `transform` di Leaflet vince su quello del foglio di stile; i controlli finivano sotto la barra di navigazione; i nomi lunghi al centro sparivano invece di centrarsi sotto il punto.

**Test:** `test-mappa.mjs`, 36 controlli superati su livelli di zoom, soglie reali, riquadro, troncamento dichiarato, abitanti null, fonte, cache e metodi. Suite completa 45 superati, 6 non pertinenti, 0 falliti. Due difetti dell'API trovati dal test prima della consegna: il percorso di successo usava l'helper condiviso `json()`, che impone `no-store` e ignora le intestazioni; e senza parametro `zoom` si finiva al livello più basso, perché `Number(null)` vale zero ed è finito.

**Limiti.** Da questo ambiente non si raggiungono né le mattonelle della mappa né le fonti meteo, quindi lo sfondo cartografico non è stato visto: i punti e la geografia sono verificati, la resa con le mattonelle no. Nessuna verifica su dispositivo reale. Sull'anteprima Netlify la nuova API risponderà solo quando il Worker sarà pubblicato su Sites, perché il proxy punta al backend della versione 64: fino ad allora la barra di stato mostrerà la fonte barrata, che è il comportamento previsto dalla specifica e non un guasto.

Restano bloccati i livelli che richiedono uno scheduler e l'accesso alle fonti: temperature per comune, pioggia, temporali, neve, vento, allerte. Grandine e persone dipendono invece dalle API della community, già esistenti, e sono il blocco successivo più abbordabile.

## Mappa eventi atmosferici — blocco 1.2: tabella dei comuni — 18 settembre 2026

Primo blocco della specifica PROMPT-MAPPA fornita dal proprietario. La specifica dice di partire da 1.2 e poi fermarsi: fatto questo, ci si ferma.

Generato dati/comuni.json: 7.894 comuni, 1.045 KB, ordinato per abitanti decrescente come richiesto, cosi i livelli di zoom diventano un taglio in testa all'array. Campi: istat, nome, prov, regione, lat, lng, abitanti, altitudine. Codici ISTAT unici, 20 regioni, 110 province, nessuna coordinata fuori dai confini italiani. Sei capoluoghi confrontati con coordinate note: tutti entro 0,15 gradi.

Aggiunto tools/genera-comuni.mjs, che rigenera il file in modo verificabile invece di lasciarlo come blocco opaco.

PROVENIENZA, diversa da quella chiesta. La specifica dice di scaricare da ISTAT, ma da questo ambiente istat.it non e raggiungibile: la politica di rete consente solo GitHub e i registri dei pacchetti. I dati vengono da due pacchetti npm, entrambi MIT e derivati da ISTAT: italian-cap-comuni-province 1.1.1 per codice, nome, provincia, regione e coordinate; comuni-json 1.0.0 per la popolazione. Sono copie di terzi con una data propria, non la fonte ufficiale: vanno riverificate contro ISTAT quando l'accesso lo consente. I due pacchetti non sono entrati nelle dipendenze del progetto e il lockfile non e stato toccato.

Dati mancanti, dichiarati e non inventati. 387 comuni su 7.894 senza popolazione, per disallineamento fra le annate dei due dataset: abitanti resta null, non zero, e quei comuni finiscono in fondo all'ordinamento. Altitudine assente per tutti e 7.894: nessuna delle due fonti la riporta, quindi resta null. Conseguenza pratica: i 387 senza popolazione non compaiono ai livelli di zoom che filtrano per abitanti, e diventano visibili solo da zoom 11.

Il file non e ancora servito: collegarlo alle API e il blocco 1.3-1.4, e la specifica dice di fermarsi prima.

BLOCCANTI per i blocchi successivi, da risolvere prima di proseguire.
1. Lo scheduler non esiste. Tutta la pipeline della parte 1.1 si regge su processi cron sul server, ogni 2, 10 e 15 minuti. Su Sites non risulta alcun cron applicativo configurabile, ed e la stessa ragione per cui B2 e bloccato da giorni. Senza scheduler i punti 1.3, 1.5 e 1.6 non possono funzionare.
2. Da questo ambiente non sono raggiungibili istat.it, api.open-meteo.com e le altre fonti: i recuperi dati non si possono ne costruire ne provare qui.
3. Conflitto di tecnologia. La specifica vieta MapLibre e impone Leaflet, ma la Mappa attuale e costruita con MapLibre ed e la direzione dichiarata in CLAUDE.md. Rifarla in Leaflet significherebbe buttare funzionalita gia pubblicate nella versione 64. Serve una decisione esplicita del proprietario.
4. Fulmini: la specifica chiede di verificare prima la licenza della fonte e di dirlo. Da qui non si raggiunge nessuna fonte, quindi non e verificabile.

Prossimo passo: la decisione su MapLibre contro Leaflet e sullo scheduler. Senza quelle due risposte il blocco successivo non ha basi.

## Regola di consegna e Netlify confermato — 18 settembre 2026

Regola del proprietario: ogni aggiornamento dev'essere ricostruibile da ChatGPT in tempo reale. Niente resta in chat o in locale; commit e push appena il lavoro e verificato, con PROJECT_STATUS.md e docs/CLAUDE_HANDOFF.md aggiornati nello stesso push, e i limiti dichiarati. Il testo completo e in CLAUDE.md, sezione Collaborazione.

PR #2 integrata su richiesta esplicita del proprietario: main da 00c851f a 615e3e3. Porta build riproducibile, suite eseguibile, le quattro correzioni di leggibilita e la configurazione Netlify. CI verde su Node 24. Build riproducibile verificata anche su main: dopo node build.mjs l'albero resta pulito. Il sito su Sites resta invariato alla versione 64.

Sito Netlify confermato funzionante dal proprietario: progetto friendly-pothos-c169ad, costruito da main. Da questo ambiente non e raggiungibile, perche la politica di rete della sessione consente solo GitHub e i registri dei pacchetti: la conferma e del proprietario, non una misura mia. Resta valido il limite gia documentato, cioe che attraverso il proxy l'app e in sola lettura.

Anteprime per pull request attive: ogni PR riceve un proprio indirizzo deploy-preview-<numero>--friendly-pothos-c169ad.netlify.app costruito dal suo ramo. Un aggiornamento su un ramo quindi si vede subito, senza doverlo prima integrare in main: la regola di consegna in tempo reale e soddisfatta lavorando sul ramo, come prescrive CLAUDE.md. Netlify aggiunge tre controlli propri su ogni PR: sulla PR #3 Redirect rules e Header rules risultano success, conferma indipendente che il proxy /api/* e le intestazioni di netlify.toml sono validi e accettati. Non dice nulla sulle scritture, che restano bloccate per i motivi documentati e non per la configurazione.

Prossimo passo invariato: restano da decidere i due conflitti con le regole invariabili (i commenti verso altre persone esistono e sono raggiungibili; i post normali non scadono dopo 2 ore), la revisione della regola html body #main a, e la sorte dei sei test non pertinenti.

## Anteprima Netlify con API in proxy — 18 settembre 2026

Su richiesta esplicita del proprietario. Aggiunti netlify.toml, tools/netlify-publish.mjs e docs/NETLIFY.md. La pubblicazione ufficiale resta su Sites allo stesso indirizzo: Netlify non la sostituisce, non la modifica e non tocca il database di produzione. Versione pubblicata invariata: 64.

Il proxy richiesto e dichiarato: /api/* verso https://scudo-meteo-community.walkerthehate.chatgpt.site/api/:splat con status 200, cioe riscrittura e non redirect.

Limite misurato, non supposto, interrogando il Worker ricostruito: attraverso il proxy le letture funzionano (GET /api/posts, /api/atlas/hail, /api/me tutti 200) ma le scritture no (POST /api/posts risponde 401 senza intestazioni di identita, e 403 anche fornendole, per il controllo sull'origine). L'identita arriva dalle intestazioni che ChatGPT Sites aggiunge alle sessioni autenticate sul proprio dominio e un proxy non puo fabbricarle; il controllo sull'origine e una protezione che funziona come deve. Su Netlify l'app e quindi in sola lettura, ed e documentato in modo esplicito nei tre file.

tools/netlify-publish.mjs assembla netlify-dist/ perche il sito su Sites non e una cartella statica ma un Worker che incorpora gli asset: manifest.json e icons/ stanno fuori da dist/ e pubblicando solo dist/ darebbero 404. Restano esclusi dist/server e dist/.openai. Verificato servendo la cartella: index.html, /app/main.js, /app/style.css, /sw.js, /manifest.json, /icons/icon-192.png e /assets/maplibre-gl.js rispondono 200, /server/index.js risponde 404, e nella cartella pubblicata non finisce nessuna chiave. netlify-dist/ e in .gitignore.

Nessuna regola di cache lunga su /app/*: li solo i chunk hanno l'impronta nel nome, mentre main.js e style.css no, e marcarli immutable avrebbe consegnato per un anno la versione vecchia. Solo /sw.js ha no-cache.

Verifiche: netlify.toml validato con un parser TOML e struttura riletta; cartella pubblicata servita e controllata percorso per percorso; suite completa 44 superati, 6 non pertinenti, 0 falliti; build riproducibile, albero pulito.

Limiti: il sito Netlify non e stato creato ne collegato, servono le credenziali del proprietario. La build su Netlify non e mai stata eseguita davvero, quindi i tempi e l'esito del primo deploy non sono verificati. Nessun segreto inserito da nessuna parte.

Prossimo passo: il collegamento a Netlify lo fa il proprietario seguendo docs/NETLIFY.md.

## Leggibilità: quattro difetti visibili corretti — 17 settembre 2026

Verifica del documento di contesto fornito dal proprietario, poi correzione di quello che non andava. Dettagli completi, misure e metodo in docs/CONTESTO-PRODOTTO-VERIFICATO.md. Versione pubblicata invariata: 64; un push su GitHub non aggiorna il sito online.

Il documento di contesto non era applicabile così com'era: descriveva uno stato anteriore alla sincronizzazione. Sei degli otto problemi che elenca sono già risolti, e il suo blocco dei token conteneva valori peggiori di quelli in repository (`--ink-3-l` a 2,33:1 contro 5,77:1 attuale). Non è stato applicato.

Misurando nel browser sono emersi invece quattro difetti che il documento non conosceva, tutti corretti e rimisurati. **Sono modifiche visibili agli utenti**, non infrastruttura: ognuna è una riga o due di CSS e si annulla rimuovendo il blocco corrispondente.

1. Vista Lente illeggibile: titolo a 1,35:1 e testi di servizio a 1,27:1. `.lente-page` usa colori da superficie chiara ma nessuna regola le dava uno sfondo chiaro. Corretto dandole la superficie per cui era disegnata; la direzione opposta è stata scartata dopo averla misurata, perché dentro quella pagina 12 superfici chiare ereditano il colore e si sarebbero rotte. Ora 12,67:1 e 13,47:1.
2. Barra di navigazione: «Community» chiedeva 81 px in 72 e si sovrapponeva alle voci vicine. Corretto con `--t-label` e `--w-medium`, entrambi token già esistenti: nessun valore nuovo introdotto. Bersaglio 67 px, sopra i 44 richiesti.
3. Pulsante «Apri la mappa» in home: testo dello stesso colore del proprio sfondo, invisibile. Causa: `html body #main a{color:var(--dato)}` batte per specificità dell'ID il colore scelto dal componente.
4. Collegamento «Guida» su `#tendenze`: 2,25:1 su bianco, stessa radice. Portato a 6,61:1.

Le correzioni 3 e 4 hanno la stessa causa: una regola generale con un ID che scavalca i colori dei componenti. Sono stati corretti i due casi dimostrati dalla misura; la regola generale non è stata toccata e andrebbe rivista.

Esito sulle nove rotte a 375 px: testi che escono dal proprio riquadro da 13 a 0; testi sotto soglia di contrasto a 0 reali. I due ancora segnalati dalla misura non sono difetti: il link di salto è fuori schermo finché non riceve il fuoco e con il fuoco misura 6,61:1, e «Collegamento IA non disponibile» è esattamente in soglia.

File: `dist/lente.css`, `dist/design-system.css`, `docs/CONTESTO-PRODOTTO-VERIFICATO.md` (nuovo); artefatti rigenerati.

Verifiche: browser reale Chromium a 375×812, nove rotte, prima e dopo; suite completa 44 superati, 6 non pertinenti, 0 falliti; build riproducibile, albero pulito dopo `node build.mjs`. Playwright installato fuori dal repository: il lockfile non è stato toccato.

Limiti. L'anteprima non raggiunge il servizio di cartografia da questo ambiente, quindi la mappa non si disegna e le misure riguardano le schermate, non la resa della mappa. Nessuna verifica su dispositivo reale. Restano aperti e non toccati: i due conflitti fra le regole invariabili e il codice consegnato (i commenti esistono e sono raggiungibili; i post normali non scadono dopo 2 ore), e la regola generale con l'ID.

Prossimo passo: decidere sui due conflitti con le regole invariabili e se rivedere `html body #main a`.

## Build riproducibile e suite di test leggibile — 17 settembre 2026

Partenza dal commit 00c851f916720f199484d04291c82971a9da297d, ramo claude/admiring-brown-065b6t. Nessuna modifica al comportamento dell'applicazione, alle funzioni, ai testi visibili, allo schema o alle migrazioni. Versione pubblicata invariata: 64. Un push su GitHub non aggiorna il sito online; la pubblicazione resta su Sites.

**Build riproducibile.** Mancava `.gitattributes`: il checkout convertiva i fine riga in modo diverso su Windows e su Linux. Gli artefatti vengono scritti sempre con LF da esbuild e da build.mjs, ma erano salvati con CRLF, quindi ogni `node build.mjs` su Linux riscriveva dieci file, 278 righe di diff e alcuni MB, con zero differenze di contenuto. Verificato decodificando i 95 asset incorporati nel Worker: 78 differivano solo per i fine riga, 17 erano identici, nessuno per contenuto. Aggiunto `.gitattributes` con `* -text`, che disattiva ogni conversione e rende il checkout identico byte per byte su ogni sistema; artefatti rigenerati e salvati con LF. I sorgenti già salvati con CRLF restano CRLF: nessuna rinormalizzazione di massa, nessun file sorgente toccato, nessun conflitto con lavoro in corso.

**Suite di test.** Lanciando i test come documentato, 10 su 50 fallivano, nessuno per una regressione del prodotto. Tre cause distinte: tre test usano `vm.SourceTextModule` e richiedono `--experimental-vm-modules`, flag non documentato; `test-portable` confrontava le migrazioni con un numero scritto a mano (9) mentre sono 24; `test-card-export` non forniva `reportLabel` al proprio banco di prova, così `saveCard` finiva nel suo catch e il test attribuiva all'esportazione un errore della propria impalcatura. I due test sono corretti: il numero di migrazioni viene ora dal giornale Drizzle e `reportLabel` dal modulo, con due asserzioni sul testo disegnato nella card. Gli altri sei interrogano moduli ritirati dal bundle.

Aggiunti `tools/retired-modules.mjs`, che rende l'elenco dei moduli ritirati fonte unica condivisa da build e test invece di vivere solo dentro build.mjs, e `tools/run-tests.mjs` (`npm test`), che esegue tutto con i flag corretti e separa superati, non pertinenti e falliti. Un test che cita un modulo ritirato entra fra i non pertinenti solo se fallisce: se passa resta fra i superati, così la classificazione non può nascondere una regressione su codice ancora consegnato.

File: `.gitattributes` (nuovo), `tools/retired-modules.mjs` (nuovo), `tools/run-tests.mjs` (nuovo), `build.mjs` (usa l'elenco condiviso), `package.json` (script `test`), `test-portable.mjs`, `test-card-export.mjs`; artefatti rigenerati `dist/app/`, `dist/assets/maplibre-gl.js`, `dist/assets/MAPLIBRE-LICENSE.txt`, `dist/server/index.js`, `tools/map-bundle-report.json`.

Verifiche: due build consecutive con hash identico; dopo `node build.mjs` l'albero di lavoro resta pulito; il refactor di build.mjs produce output identico byte per byte; `node tools/resume.mjs --check` superato; suite completa 44 superati, 6 non pertinenti dichiarati, 0 falliti.

Limiti e problemi aperti. L'ambiente di questa sessione ha Node 22.22.2, non Node 24: `node:sqlite` funziona ma è segnalato sperimentale, quindi la suite non è stata provata su Node 24. Non è stata aperta l'anteprima nel browser e non è stata verificata alcuna resa grafica. I sei test non pertinenti restano rossi e vanno riletti: la classificazione dell'esecutore è euristica, un test può citare un modulo ritirato e fallire per un altro motivo, come `test-startup`, che cita il globo anche per verificare che non venga importato. Vanno aggiornati o ritirati, non lasciati rossi per sempre: decisione del coordinatore. Nota separata, non corretta qui perché è testo visibile agli utenti: `saveCard` in `dist/sky-community.js` dice ancora «Il globo sta ancora caricando» e «Riprova dal globo», mentre `ctx.world` è la mappa locale MapLibre; il comportamento è corretto, solo le due frasi sono rimaste al globo ritirato. B2 resta bloccato dalla fonte osservativa locale e dalla pianificazione: qui non è stato toccato e nessun voto è mostrato.

Prossimo passo: decidere con Codex il destino dei sei test non pertinenti e se correggere le due frasi sul globo. La 24.6 non è stata avviata e resta da assegnare esplicitamente.

## Preparazione collaborazione Claude

Aggiunti CLAUDE.md e docs/COLLABORAZIONE-CLAUDE.md. Sito invariato alla versione 64. Trasferimento GitHub ancora da fare: plugin installato ma comandi non esposti nella sessione. Nessun repository GitHub creato o sincronizzato, nessun collegamento Claude effettuato. Proseguire dalla verifica dell’account GitHub e dell’eventuale repository esistente; non chiedere di reinstallare il plugin già confermato.

## Fase 24.2 — Chi ci lavora

Pubblicazione confermata: versione 64; sorgente 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381; ambiente 7 preservato. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site

Implementata e verificata: attività facoltativa nel Profilo, etichetta discreta nelle segnalazioni, peso pertinente 1,5× solo lato server, rimozione immediata alla prossima lettura, conteggi reali. Migrazione additiva 0023 e shell v53. Dettagli e limiti in FASE-24-2-RELEASE.md. Test API, conferme e domanda del giorno superati; salvataggio/rimozione provati in anteprima locale. Fermarsi qui; prossimo blocco 24.6 solo su richiesta.

## Fase 24.1 — domanda del giorno

Pubblicazione confermata: versione 63, sorgente b2764a14eba1519503102b519c32b5de381c048b, ambiente 7 preservato. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site


Implementata solo la domanda quotidiana, prima sezione del tab Oggi; route iniziale Mappa conservata. API, conteggi riservati a chi risponde, voto ospite per browser/giorno modificabile, orari locali 07–24 e rotazione senza ripetizioni. Migrazione additiva 0022, shell v52. Test API e UI locale con fixture dichiarata superati; fonte reale in anteprima ha mostrato lo stato recuperabile di indisponibilità. Dettagli, file e limiti in FASE-24-1-RELEASE.md. Fermarsi dopo 24.1 come richiesto; non attivare 24.2–24.6. B2 resta separato e bloccato dai suoi accessi.

## B2 — accesso regionale: prossimo passaggio esterno

Verificata la pagina ufficiale della rete MIR: SOL e il portale in tempo reale richiedono registrazione. Il Centro Funzionale espone il contatto spc.centrofunzionale@regione.marche.it. Preparata docs/RICHIESTA-DATI-MARCHE.md, non inviata: chiede copertura di San Benedetto, modalità automatiche, metadati, qualità, ritardi, licenza e costi. Non assumere che un account di consultazione autorizzi API o riuso. I portali diretti hanno restituito 502/timeout da questo ambiente; non dichiararli indisponibili globalmente.

Nessun connettore disponibile espone un cron applicativo Sites configurabile: le automazioni dell’assistente sono task a prompt e non sono state usate come sostituto. Fonte locale e pianificazione rimangono bloccanti. Ulteriori messaggi generici “vai avanti” non forniscono questi accessi. Codice pronto e sito versione 62 invariati; nessun nuovo servizio attivato.

## B2 — motore di confronto pronto, integrazione ancora disattivata

Aggiunto server/observed-verdict.js, funzione pura non inclusa nel Worker/build di produzione. Confronta cinque fasce UTC di una copia identificata, acquisita prima delle finestre previste, con misure normalizzate della stessa stazione. Provenienza osservativa e fonte ammessa richieste per ogni variabile; accumulo pioggia esattamente orario; soglia pioggia esplicita da validare con il futuro fornitore; temperatura errore oltre 3°C. Dati mancanti, ore future, fonti modello/non ammesse, duplicati ambigui e intervalli non coincidenti non danno un voto. Denominatori separati temperatura/pioggia e fasce complete; nessuna percentuale 0/0. Nessuna mutazione degli input.

Test test-observed-verdict.mjs superato con fixture esclusivamente locali: soglie limite, null/stringhe/non finiti, stazione diversa, provenienza, tempi di arrivo, accumuli, duplicati e forecast tardivo. Non sono test di disponibilità di una fonte reale. Da collegare: adapter osservativo locale validato, cattura immutabile pianificata, gestione revisioni salvate, endpoint e UI. Nessuna integrazione o processo automatico attivato, nessun voto mostrato agli utenti. Versione pubblicata invariata: 62.

## B2 — copertura locale verificata (17 settembre 2026)

Controllato il catalogo Meteostat completo e il CSV orario reale di Pescara. Stazione più vicina nel catalogo a 57,5 km (Gran Sasso, 2.138 m); Pescara a 63,1 km. Il CSV mescola etichette di fonti osservazionali e modello, contiene anche ore future, ed è più aggiornato dell’inventario. Non sufficiente per attribuire accuratezza locale a San Benedetto. Dettagli in B2-VERIFICA-FONTI.md, audit ripetibile tools/audit-b2-stations.py, risultato con hash tools/b2-coverage-audit.json. Fonte locale autorizzata e scheduler ancora da collegare. Nessuna modifica al sito: versione pubblicata 62.

## B2 — ricerca fonti e automazione (17 settembre 2026)

Vedi B2-VERIFICA-FONTI.md: documentazione ufficiale Meteostat e Regione Marche verificata. Osservazioni JSON tipicamente in ritardo 2–3 ore; archivi senza chiave fino a 24 ore e possibili valori da modello da escludere. La completezza alle 21 non è garantibile. Stazione pilota ancora da validare; scheduler applicativo non collegato. Nessuna modifica al codice o al sito pubblicato (62). Ricerca e proposta di confronto parziale con revisioni salvate online; non presentarle come integrazione completata.

## Fase 20 — A6, un solo CSS iniziale (17 settembre 2026)

La baseline 61 aveva già due link CSS, non 19: /app/style.css e /assets/maplibre-gl.css. Unito il foglio MapLibre in coda al bundle minificato preservando l'ordine precedente della cascata. I sorgenti separati e la licenza restano conservati. MapLibre usa soltanto URL CSS incorporati, quindi nessun percorso relativo da riscrivere. Il file separato non è più richiesto dall'HTML né elencato nella cache del service worker; shell v51.

File: build.mjs (concatenazione MapLibre in coda), dist/index.html (un solo link stylesheet), dist/sw.js (lista cache e versione), output dist/app/style.css e dist/server/index.js rigenerati; PROJECT_STATUS.md e RIPRENDI-QUI.md aggiornati. Nessuna modifica ai moduli della mappa o alle funzioni.

Verifica: build e diff check, browser con un unico link stylesheet e regole .maplibregl-map presenti nel CSS caricato, test-map-refinement.mjs superato (incluso aggiornamento cache). Nessun tempo di caricamento o rendering WebGL mobile certificato; il browser di verifica non supporta WebGL. A5 non pertinente al globo rimosso. B2 resta aperto per fonte osservativa e scheduler: nessun voto fittizio introdotto. Lavoro salvato sul progetto online esistente.

## Fase 20 — B3/B4, patto e limiti visibili (17 settembre 2026)

Partenza dalla versione 60, sorgenti verificate. Il limite server era già presente: due tentativi di invio al giorno condivisi per actor, solo 07–22 Europe/Rome, preferenze separate risposte/conferme/eventi. Non modificato il server né attivato alcun permesso o nuova notifica. Testo riusabile visibile durante caricamento, errore, prima degli interruttori e nell’offerta dopo segnalazione. Distinzione fra ora di invio e consegna del browser.

Aggiunta route #patto raggiungibile dal Profilo e dagli avvisi, quattro impegni e dettagli espandibili sulle funzioni attuali. Il testo non promette il voto osservativo di B2 (bloccato), emissioni originali del modello o allerte push ufficiali non implementate. La bozza store cita il patto; nessuna pubblicazione sugli store. Shell v50.

File: dist/notifications.js (patto e testo condiviso limiti), dist/main.js (route e link Profilo), dist/sw.js (versione shell), store/STORE-COPY.md (citazione e limiti), PROJECT_STATUS.md e RIPRENDI-QUI.md; output bundle/server e report rigenerati. Build e diff check riusciti. Browser anteprima 375 px: testo sopra checkbox, link, dettagli e assenza di overflow della pagina (336/336 px). Non inviate notifiche reali. Il blocco B2 richiede ancora una fonte osservativa e uno scheduler, non implementati qui.

## Fase 20 — A3, testi nella mappa locale (17 settembre 2026)

Verificata la baseline online 59 prima delle modifiche. Il pannello Altro e i controlli Google/globo citati nel vecchio audit non sono più nella mappa attiva, quindi non modificati né ripristinati. Tolta la città duplicata dal riepilogo della mappa: resta nel selettore in alto. Il selettore usa ellissi per nomi lunghi; la riga meteo e l'ora di acquisizione vanno a capo e riservano 8 px fra riepilogo e pulsante posizione. Shell v49.

File: dist/local-map.js (riepilogo senza città ripetuta), dist/local-map.css (larghezza e ritorno a capo), dist/design-system.css (ellissi selettore), dist/sw.js (distribuzione aggiornamento); output build e report bundle rigenerati. Nessuna modifica a dati, API o credenziali.

Verifica browser in iframe 375×812: selettore città clientWidth=scrollWidth=341; riepilogo clientWidth=scrollWidth=262 e clientHeight=scrollHeight=66; i tre chip hanno larghezza utile uguale al contenuto e nessun taglio verticale. Build e diff check riusciti. Non è un audit completo di tutte le schermate; WebGL del browser di verifica rimane indisponibile. A5 non applicabile al globo rimosso; B2 e successivi non eseguiti in questo blocco. Sorgenti e note conservate nello stesso progetto online.

## Fase 20 — B1, acquisizioni e cronologia online (17 settembre 2026)

Ora di acquisizione Open-Meteo visibile in Meteo, Oggi e Mappa; non è presentata come emissione del modello. Il gateway /api/forecast conserva copie append-only in forecast_copies, con cache condivisa di 15 minuti e coordinate approssimate a due decimali. Nuova migrazione additiva 0021. Il confronto riguarda le stesse ore ancora future; tempi duplicati del cambio ora e valori mancanti sono esclusi. Avviso sintetico più dialogo cronologia paginata e link alle copie originali. Sorgente indisponibile: ultimo dato con orario originale; salvataggio non riuscito: cronologia dichiarata indisponibile. Shell v48.

Test test-forecast-history.mjs superato: copie immutate, cache, confronti, fallback, concorrenza, paginazione, DST, errori archivio, escaping. Browser anteprima: vecchio meteo in cache correttamente senza ora acquisizione, dialogo e stato vuoto leggibili. In anteprima non è stata verificata una nuova acquisizione reale dal provider; test backend con dati controllati solo nel database temporaneo. Build riuscita. Non è un audit completo mobile/Lighthouse.

Limiti: lo storico parte dall'attivazione e raccoglie durante la consultazione, non a orari programmati. Non è la cronologia integrale delle emissioni di Open-Meteo. Riguarda la previsione principale della città, non radar, griglie, mare o confronti città. Nessuna prova crittografica indipendente contro modifiche amministrative. B2/B3/B4 e A3–A6 non eseguiti: globo e NASA restano rimossi. Dati e sorgente online condivisi; preferenze browser non sincronizzate.

## Fase 20 — A1/A2, tema scuro mantenuto

Scelta autorizzata dall’utente: mantenere il tema scuro unico, senza riattivare il cielo dinamico. In design-system.css aggiunti token per superfici chiare e schiarito --ink-3 a #91a5bc; rapporto 5,34:1 su #183049 e 6,13:1 su #132441. Token chiari verificati sui due estremi dei cieli sereno/nuvoloso: minimo 4,54:1. In atlas.css rimosso #53647c dalla vecchia regola chiara, sostituito dal token scuro per superfici chiare; sulle superfici esplicitamente scure testo secondario con --ink-3. SW v47 per distribuire la correzione. Nessun intervento su A3–A6 o B. Verifica matematica delle coppie colore, non un audit Lighthouse completo. File generati app/style.css e server/index.js aggiornati dalla build.

## Verifica e correzioni finali — 17 settembre 2026

Ricontrollati i nove requisiti sulla versione online 56 e corrette le condizioni di gara rimaste: cambiare livello annulla la richiesta precedente e ne invalida i messaggi; gli errori radar non sovrascrivono il livello vento/temperatura. La verifica di copertura usa ora tutti i limiti visibili, senza ritagliare artificialmente le zone polari. Caricamento MapLibre e cartografia hanno timeout di 15 s ciascuno e rilasciano listener/risorse quando si cambia sezione; in errore resta Riprova. Banner aggiornamenti robusto anche quando l’installazione è già iniziata o un’altra scheda ha attivato la versione. Icona corretta per Allagamento. Shell v46.

Test: test-map-lifecycle.mjs (caricamento, annullamento, timeout, selezione e risposte fuori ordine), test-map-refinement.mjs e test-local-map.mjs. Build completata. Restano validi i limiti già dichiarati: WebGL del browser di verifica non disponibile; tempo <2 s e fluidità su telefono non certificati. Nessuna modifica a dati, credenziali o schema. Questo stato e le sorgenti vengono salvati sullo stesso progetto online per proseguire da un altro PC.

## Ultimo aggiornamento — rifinitura mappa locale, 16 settembre 2026

Applicata la richiesta corrente in nove punti: caricamento prioritario, bundle senza moduli 3D ritirati, SW v45 con banner, temperatura interpolata coerente con la card, scie vento, controllo radar asciutto con copertura, selettore esclusivo, fonti compatte, storie e volo di sessione 1,5 s. Dettagli e limiti in `MAPPA-RIFINITURA-RELEASE.md`. Test logici/backend e UI su fixture isolata completati; WebGL non disponibile nel browser di verifica, quindi niente promessa di <2 s o fluidità certificata. Sorgenti e note da recuperare dalla versione online dello stesso progetto prima di lavorare su un altro PC. Non confondere sincronizzazione del progetto con preferenze/bozze locali del browser.

## Nuova direzione: mappa locale e cartolina del cielo

La richiesta corrente sostituisce il globo come schermata e rimuove la scoperta NASA EONET. Unico tab Mappa, MapLibre GL scuro, volo iniziale saltabile verso la città (circa 2 s, disattivato con movimento ridotto). Radar RainViewer ultima ora, vento animato e temperature campionate Open-Meteo. Segnalazioni raggruppate, storie a schermo intero e cartoline fotografiche 9:16. Dettagli e limiti in MAPPA-LOCALE-RELEASE.md. Le richieste storiche di non toccare il globo sono superate esplicitamente. Nessun nuovo servizio a pagamento, chiave o scheduler; dati e credenziali esistenti preservati.

## Aggiornamento prioritario: sei correzioni visive e avvisi eventi

Tema scuro unico; dettagli dietro i; Chiedi a chi è lì in primo piano e strumenti nel menu Altro; scoperta di eventi NASA e voci reali; globo fermo sulla città iniziale. Avvisi eventi opt-in su cambiamento rilevato alla consultazione e recupero dei propri eventi. Migrazione additiva 0020, shell v43. Dettagli in RIFINITURA-SCURA-EVENTI-RELEASE.md. Nessuno scheduler configurato; le precedenti note di avvisi evento assenti sono superate soltanto per il controllo durante consultazione.

## Completamento master — aggiornamento corrente

L’utente autorizza a procedere su tutti i punti rimanenti senza pause. Implementati H1, H2 meteo, H3 inviti, H4 confronto tra aggiornamenti del modello, H5 percepito locale; H6 progettato ma disattivato per densità/validazione. Rifiniti F6 e flag delle funzioni accessorie; verificato C7; materiali G4 in store/. Migrazione additiva 0019, shell v41. Dettagli, test e limiti in COMPLETAMENTO-MASTER-RELEASE.md. Non dichiarare completati scheduler/notifiche eventi automatiche o accuratezza verificata su osservazioni. Le vecchie indicazioni di fermarsi nei paragrafi sotto sono cronologia superata dall’ultima autorizzazione.

## E3/E4/E5 — ultimo intervento

Adattamento approvato: pollini opt-in, mare entro 15 km dalla costa cartografica in Italia/dintorni, quota neve originale DWD novembre–marzo. Fonti, soglie, file e limiti in BLOCCO-E3-E4-E5-RELEASE.md. Nessuna modifica al globo protetto. Prossimo blocco H1/H4, fermarsi in attesa del via.

## G2/G3 — ultimo intervento

Adattamento approvato. Offline persistente e coda con ora originale; avvisi risposte/conferme opt-in e limite condiviso. G2 parziale: nessun avviso automatico uscita/allerta senza scheduler. Vedere BLOCCO-G2-G3-RELEASE.md per file, verifiche e limiti. Fermarsi prima del prossimo blocco.

## Documento unico — C3/C4/C6 completati

Adattamento approvato: 200 località reali campionate, aloni pioggia/neve sul livello Meteo, estremi del campione, eventi NASA aperti con date reali e icone, Portami dove succede qualcosa. Cache D1 15 minuti e copie pubbliche IndexedDB con età visibile. Migrazione additiva 0017. Prova live: 200/200 meteo validi, NASA 300 record (catalogo limitato dichiarato). Vedere BLOCCO-C3-C4-C6-RELEASE.md. Fermarsi prima del prossimo blocco master G2/G3; G2 è già parziale per E2.

## Documento unico — E2 e prerequisiti H2/G2 completati nel perimetro scuole

Adattamento autorizzato: domande sulle scuole con allerta attiva, risposte fisse da posizione recente entro 5 km, scadenza 2 ore, fonte e comune espliciti. Prima risposta con avviso in-app e Web Push opt-in dopo una segnalazione, massimo 2/giorno e silenzio 22–7. Solo questo tipo di push è implementato. Migrazione additiva 0016. Vedere BLOCCO-E2-RELEASE.md per limiti e prove. Fermarsi prima di C3/C4/C6.

## Documento unico — D9/D10 completati

Moderazione protetta da password runtime, sessioni server di 8 ore, elenco privato ultime 24 ore, rimozione e blocco account/browser riconosciuti. Tre regole pubbliche. Verificati 401 senza sessione, CSRF, revoca e regressioni sky. G1 già verificato senza modifiche. Vedere BLOCCO-D9-D10-RELEASE.md. Fermarsi prima di E2.

## Documento unico — E6 completato

Sezioni grandine, mappa dedicata, luoghi coperti/offline dietro flag con collegamenti nascosti e fallback dei vecchi URL. Grandine preservata nei sei fenomeni rapidi e nel globo. Vedere BLOCCO-E6-RELEASE.md. Fermarsi prima di G1.

## Documento unico — D7/D8/F5 completati

Adattamento approvato su sky: conferme entro5km con sessione/cookie e coordinate del dispositivo controllate dal server; confronto con modello senza dichiarare correzioni Open-Meteo; card con barraTTL/opacità. Vedere BLOCCO-D7-D8-F5-RELEASE.md. Fermarsi prima di E6. Migrazione additiva0014.

## Documento unico — C5 completato

Adattamento confermato: inerzia, doppio tocco800ms sulla città corrente, rotazione dal5° al10° secondo. Comandi manuali preservati con movimento ridotto, nessuna inerzia/rotazione in eco. Vedere BLOCCO-C5-RELEASE.md. Fermarsi prima di D7/D8/F5.

## Documento unico — C1/C2 completati

Globo mobile a larghezza piena, minimo55svh, superficie senza card; terminatore solare UTC e città geografiche sul lato notte. Vedere BLOCCO-C1-C2-RELEASE.md. Fermarsi prima di C5.

## Documento unico — D2, D4, D5 completati

Adattamento alla Community attiva approvato dall’utente. Compositore lungo dietro link, filtri legacy e funzioni aggiuntive dietro flag, Adesso e sei controlli prima del feed. Foto ridimensionate e ricodificate senza EXIF nei due percorsi. Vedere BLOCCO-D2-D4-D5-RELEASE.md. Fermarsi prima di C1/C2; nessuna modifica a globo o E1.

## Documento unico — D6 completato

Ricerca progressiva 5/15/50/150 km con distanza sulle zone pubbliche, segnalazione più vicina e primo contributo disponibile verificato dal server. Vedere BLOCCO-D6-RELEASE.md. Fermarsi prima di D2/D4/D5. Resta il limite E1 sul cron.

## Documento unico — E1, bollettini persistenti

Persistenza D1, controllo revisioni durante la consultazione, distinzione ultimo dato/aggiornamento fallito. Vedere BLOCCO-E1-RELEASE.md per il limite: nessun cron dell’hosting configurabile esposto; aggiornamento non eseguito ad app chiusa senza visitatori. Fermarsi prima di D6.

## Documento unico — F1 completato

Integrazione delle parti mancanti approvata dopo verifica: ingresso/movimento card, dissolvenza alla scadenza e spazio di caricamento/foto. Vedere BLOCCO-F1-RELEASE.md. Fermarsi prima di F2–F4.

## Documento unico — D1 e D3

Integrazione approvata nel sistema sky del globo, sei fenomeni senza testo obbligatorio, firma automatica e tentativi idempotenti. Vedere BLOCCO-D1-D3-RELEASE.md. Fermarsi prima del prossimo punto master F1.

## Documento unico — Blocco B

Completata la prima schermata con giornata compatta e onboarding in tre passaggi. Vedere BLOCCO-B-RELEASE.md. Fermarsi qui: il prossimo punto master (D1, D3) richiede il via dell’utente.

## Documento unico — Blocco A1–A3

Vedere BLOCCO-A-RELEASE.md. Implementato il Decisore con le precisazioni approvate dall’utente; si ferma prima del bloccoB. Le precedenti autorizzazioni a completare tutte le fasi senza pause sono sostituite dal Documento unico e non si applicano.

## Meteo globale: quota confermata — 16 settembre

Open-Meteo429 confermato nei log del sito dopo v34. Aggiunti cache nominata, accorpamento richieste e rispetto Retry-After; il globo non ritenta automaticamente ogni30secondi il batch fallito. Quota e chiavi non modificate. Dettagli e limiti in QA-FONTI-CARD.md.

## Anteprima card verificata — 16 settembre

La card ora resta visibile in un dialogo con Scarica PNG. Generazione immagine confermata nel browser locale; evento download non confermato. Persistono risposte503 per il meteo globale città dopo v32: non affermare che tutte le fonti siano operative. Dettagli in QA-FONTI-CARD.md.

## Correzioni fonti e card — 16 settembre 2026

Vedere `QA-FONTI-CARD.md`. Risolto il blocco delle richieste pubbliche quando la cache predefinita del runtime non è accessibile. Export card con gestione errori e stato occupato. Nessun cambiamento a globo, credenziali o database.

## Verifica percorsi del 16 settembre

Vedere `QA-PERCORSI.md`: cambio città, livelli, invio anonimo, scheda e Community verificati; corretta la dicitura singolare del feed. Download card non confermato dal browser automatico.

## Fase 12 completata — 12.2, 12.3 e 12.4

Correzioni contrasto, fondo opaco e grassetti: vedere la seconda parte di `FASE-12-RELEASE.md`.

## 16 settembre — Fase 12 limitata a 12.5 e 12.1

Vedere `FASE-12-RELEASE.md`. Riga meteo iniziale e feedback di interazione; non avviate 12.2–12.4.

## Globo Vivo — nuova consegna

Leggere `GLOBO-VIVO-RELEASE.md`: tutte le fasi dell’ultima specifica sono state implementate. I dettagli storici sotto descrivono versioni precedenti. La conferma finale della distribuzione è nel record Sites associato al commit; non cambiare le chiavi esistenti.

# MeteoSocial — stato per riprendere da qualsiasi PC

## Lavoro corrente: nuova specifica Globo Vivo (15 settembre 2026)

Leggere `GLOBO-VIVO-SPECIFICA.md`. Il proprietario ha autorizzato tutte le modifiche e verifiche e chiesto di proseguire fino all'ultima fase, con consegna finale. Baseline pubblicata all'avvio: versione27, commit f5651e3df5e708074e8962167483765fd08a4571. Il lavoro successivo non è pubblicato finché Sites non ne conferma la distribuzione.

Fase1: rimosso anche l'import statico social→avatar→Three; prefetch solo su intenzione, nessun timer4G; cache3D solo dopo richiesta, con migrazione delle copie offline precedenti. `test-startup.mjs`:18 controlli superati. Grafo statico Home 1096048→373561byte (sorgenti non compresse, non tempo rete). Icona meteo 3D decorativa conservata dietro flag, con icona leggera predefinita. Browser reale in anteprima:31 richieste JS, zero fileThree/land-mesh sulla Home dopo caricamento meteo; dopo interazione Globo i moduli vengono richiesti. Anteprima Vite separata aggiunta per verifica browser; produzione rimane Worker. Procedere con8.1,2,8.2–8.3,3,8.4,4,5,8.5–8.8,6,7.

Aggiornato il 15 settembre 2026. Documento di continuità, non attestazione che un'eventuale copia ZIP sia ancora la più recente.

## Identità unica del progetto

- Nome: MeteoSocial.
- Sito: https://scudo-meteo-community.walkerthehate.chatgpt.site
- Gestione con lo stesso account: https://chatgpt.com/sites
- ID Sites: `appgprj_6aa1e8ab06f88191ab364344053e48d9`.
- Manifest autoritativo: `.openai/hosting.json`, D1 `DB`, R2 `BUCKET`.
- Codice: moduli JavaScript, Three.js/Leaflet, Cloudflare Worker, D1/R2; non Flutter o Expo.
- Fonte di lavoro online: repository Git associato a questo progetto Sites. Recuperare URL, ramo e credenziale temporanea dal connettore. Il vecchio repository GitHub citato nelle conversazioni non è stato riallineato da questo flusso.

## Ultima baseline funzionale verificata

Aggiornamento più recente del 15 settembre: `GLOBO-FENOMENI-RELEASE.md`. Partenza dalla versione 23 pubblicata con commit `2f2f9683dd9664b003eef328c6e5aaeefd3b73dc`, deployment `appgdep_6aa8e3d08f8481919dd7923f8a04aeb6` succeeded. Aggiunti al Google 3D simboli puntuali per meteo, vento, nuvole, grandine community, catalogo NASA e allerta locale. Filtri, dettagli con fonte/orario, elenco accessibile e aggiornamento periodico. Non sono texture radar globali né dati istantanei ovunque. 179 controlli automatici e build riuscita; nessuna verifica nel browser reale della nuova grafica. Consultare Sites per versione ed esito della pubblicazione di questa estensione.

Ultima pubblicazione confermata all'inizio di questo intervento: versione 21 del 13/09/2026, sorgente `786a2a76863cb623014605273fefca340194fe93`.
Versione salvata `appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_16d6366fe2f48191b28bc15d78e390af`.
Deployment `appgdep_6aa6b2ce03888191b5312f5c7f9b0d1e`, succeeded. Comprende Google 3D predisposto ma disattivato.

La baseline comprende globo a qualità regolabile, navigazione comune per località, 14 livelli, precipitazioni distinte, radar animato e aggiornamenti periodici. `CONNECTED-CLIMATE-RELEASE.md` descrive comportamento, fonti e verifiche. Per numero ed esito della pubblicazione corrente consultare Sites: non usare la baseline precedente come indicazione della versione più recente.

Funzioni conservate: Home Oggi, La mia giornata, Open-Meteo, globo NASA, timeline di modello ±24 ore, radar, community e Stories, Fit Check, Studio, città seguite, bollettini DPC italiani, Meteo Clash, testimonianze da fotocamera, Grandine chiara e mappa grandine con aggiornamento ogni 30 secondi. Lente IA resta collegata nel sito online. La consegna successiva estende la grandine con migrazione additiva `0010_new_madripoor.sql`; vedere `GRANDINE-COMMUNITY-RELEASE.md`.

Richiesta persistente del proprietario: questo non è il suo PC principale. Ogni intervento deve aggiornare lo stesso progetto online, con istruzioni e stato recuperabili dall'altro PC. Aprire il progetto con lo stesso account recupera la sorgente condivisa; non risulta configurato un collegamento remoto al PC principale né una sincronizzazione automatica delle sue cartelle. Non affermare il contrario. Profilo e contributi pubblicati sono sul servizio; preferenze locali, bozze non pubblicate e qualità del globo restano nel singolo browser.

## Google collegato e nuovo globo satellite

Il 15 settembre il proprietario ha confermato che la vista Google funziona. La chiave Maps esatta è stata importata da un file fornito dal proprietario e configurata come segreto runtime Sites; non è nel repository. `GOOGLE_3D_ENABLED=true`, ambiente revision 5, già pubblicato sulla versione 22 con deployment `appgdep_6aa8e164f8f88191a945b50ab847d9a2`, succeeded. Nessuna modifica di `OPENAI_API_KEY`. Le due precedenti trascrizioni dallo screenshot erano errate: non recuperarle né riutilizzarle.

La consegna successiva, descritta in `GLOBO-SATELLITE-RELEASE.md`, rende Google il percorso principale `#mondo` quando disponibile. `#google3d` resta compatibile; `#globo-meteo` apre il pianeta NASA con i livelli. Nuovi comandi: Terra, città, dall’alto, rilievo, nomi, nord, zoom, schermo intero, selezione del punto. La località e il meteo si aggiornano nella stessa vista senza ricreare il renderer. L’apertura rimane manuale. Consultare Sites per il numero e l’esito della pubblicazione corrente.

Il proprietario ha dichiarato il pagamento Google e confermato via screenshot le restrizioni Maps JavaScript API / sito autorizzato. Quote e consumi non sono stati verificati nella Console da Codex. Non dichiarare un tetto ai costi. Le immagini satellite Google mostrano geografia. L'estensione Fenomeni sovrappone simboli puntuali di fonti separate; il radar animato rimane nella propria mappa. Il renderer già collegato è stato provato dal proprietario; i nuovi comandi e simboli hanno controlli simulati, non una verifica su tutti i dispositivi.

## IA e dati: autorizzazione già esistente

Riusare `OPENAI_API_KEY` già configurata come segreto nel servizio Sites. Non ricreare chiavi né chiederle in chat. La copia portatile non include segreti, database o media degli utenti. L'IA del sito online continua a usare il segreto ospitato; l'anteprima locale resta senza IA finché non è configurata separatamente una chiave locale con il flusso autorizzato.

Payload Lente autorizzato: località scelta, previsioni e bollettino; su richiesta testi dei post pubblici e ultime tre coppie domanda/risposta. Escludere GPS, autori e media dal payload OpenAI. Nessuna pubblicazione, acquisizione o scansione automatica di materiale personale.

## Prima di lavorare

Leggere `AGENTS.md`, `RIPRENDI-QUI.md`, `PROJECT_VISION.md` e le note di rilascio. Recuperare l'ultima sorgente online; non ricostruire l'app dalla pagina pubblica. Riusare il progetto e il link esistenti. Conservare le modifiche locali prima di aggiornare; niente reset distruttivi, force push o sovrascritture silenziose.

## File e verifiche

- `dist/*.js` e `dist/*.css` sono sorgenti tracciate: non cancellare dist considerandola interamente generata.
- `server/` contiene i servizi; `build.mjs` li riunisce nel Worker e incorpora gli asset.
- `db/schema.ts` e `drizzle/` conservano schema e migrazioni. Non azzerare database di produzione.
- `node tools/resume.mjs --check`: controlla ambiente e file.
- `node tools/resume.mjs --prepare`: ricostruisce il Worker, senza pubblicare.
- `node tools/resume.mjs`: build e anteprima su 127.0.0.1, database/media locali separati.
- I test `test-atmosphere.mjs`, `test-lente.mjs`, `test-atlas.mjs`, `test-editorial.mjs`, `test-network.mjs`, `test-fitcheck.mjs` usano dati isolati. Non pubblicare prove nel feed reale.

## Requisiti ancora da integrare

Dirette/SFU e Co-Op, push simultanee, AR/dual camera/widget nativi, copertura ufficiale globale, nowcasting al minuto e ricostruzione volumetrica futura delle nubi richiedono altri servizi o applicazioni native. La fotocamera non garantisce autenticità. Non dichiarare grandine verificata, percorsi sicuri, disponibilità certa dei ripari, latenza zero o tutte le funzioni del PRD completate.

`CONNECTED-CLIMATE-RELEASE.md`, `HAIL-MAP-RELEASE.md`, `GRANDINE-CHIARA-RELEASE.md`, `ATMOSPHERE-RELEASE.md`, `LENTE-RELEASE.md`, `FITCHECK-RELEASE.md`, `EDITORIAL-RELEASE.md`, `PULSE-RELEASE.md`, `ATLAS-RELEASE.md` descrivono le consegne effettive.
# Ripresa: La mia giornata

Continuazione dalla sorgente online 16. Aggiunta alla Home la scheda con uscita/rientro e previsioni orarie, preferenze locali al browser. Vedi `DAY-PLAN-RELEASE.md` per comportamento e controlli. Per lo stato di pubblicazione corrente consultare Sites; la baseline funzionale precedente descritta sotto resta il riferimento delle altre funzioni.
# Ripresa 13 settembre 2026: Grandine chiara

Estensione della sorgente online 17 con vista `#grandine`, conteggi distinti di post/account, cronologia locale di due ore, segnalazione rapida, tre fonti separate, Lente contestuale e riepilogo condivisibile. Vedi `GRANDINE-CHIARA-RELEASE.md` per ricerca sul concorrente, comportamento, limiti e verifiche. Confronto da sito/store, non test hardware di Grandinometro. Nessuna promessa di esclusività mondiale o grandine verificata. Per l’esito di pubblicazione consultare Sites.
# Ripresa 13 settembre 2026: mappa grandine

Estensione della sorgente online 18: route `#grandine-mappa`, lettura dedicata delle segnalazioni, aggiornamento ogni 30 secondi con app visibile, filtri comuni a pin/elenco e zone approssimate facoltative nei post rapidi. Migrazione additiva `0009_needy_sersi.sql`. Vedi `HAIL-MAP-RELEASE.md` per comportamento, confronto, copertura e verifiche. La grandine mostrata è dichiarata dagli utenti; nessun nuovo rilevamento radar certificato o push. Per l’esito di pubblicazione consultare Sites.

## Grandine community dopo la baseline 21

Estensione richiesta dal proprietario dopo il nuovo confronto con Grandinometro: dimensioni dichiarate, ora osservata, fine riferita, riscontri visibili, radar sovrapposto facoltativo, 5 zone private per account, avvisi solo nella vista e link di zona. Lente include metadati dichiarati con informativa aggiornata, sempre senza nuove coordinate, autori o media. Dettagli, analisi, migrazione e limiti in `GRANDINE-COMMUNITY-RELEASE.md`. Parità completa, push e verifica radar automatica non sono consegnati. Consultare Sites per esito e numero della pubblicazione corrente.
