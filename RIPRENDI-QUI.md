# Riprendi da qui — 21 settembre 2026

**Questo è il punto di partenza attuale. Le sezioni sotto sono cronologia: la fase 24.2 non è più l'ultimo lavoro fatto.**

## Dove siamo

| cosa | stato |
|---|---|
| ramo di riferimento | `main` — leggi lo stato con `git log --oneline -5 origin/main`, non da una sigla scritta qui |
| sito ufficiale su Sites | **versione 64, invariata** |
| anteprima Netlify | ricostruita da `main` a ogni integrazione |
| ultimo blocco | Mappa eventi atmosferici — vedi `MAPPA-EVENTI-RELEASE.md` |

Qui non c'è la sigla di un commit di proposito: un documento che la fissa diventa falso nell'istante in cui viene integrato, e chi lo legge non ha modo di accorgersene. La sigla si chiede a Git, che non mente.

Il lavoro dal 18 al 21 settembre ha aggiunto una **mappa degli eventi atmosferici** su `#mappa-eventi`, aperta dalla voce Mappa della barra di navigazione: temperature e pioggia mondiali da Open-Meteo, eventi naturali da NASA EONET, segnalazioni di grandine delle persone, comuni ISTAT, e la Lente integrata come barra in cui si scrive la domanda. Più l'avviso grandine con distanza scelta dalla persona.

La mappa MapLibre della versione 64 **non è stata toccata**: resta su `#mappa-classica`, e il vecchio indirizzo `#mappa` continua a funzionare.

## Per riprendere il lavoro

1. `node tools/resume.mjs --check` — controllo dell'ambiente (serve Node con `node:sqlite`; se mancano dipendenze, `pnpm install --frozen-lockfile`).
2. `node build.mjs` — ricostruisce Worker e bundle. La build è riproducibile: due esecuzioni danno lo stesso output.
3. `node tools/run-tests.mjs` — la suite. Attualmente **47 superati, 6 non pertinenti, 0 falliti**. I sei non pertinenti interrogano moduli conservati in Git ma esclusi dal bundle: vanno riletti e aggiornati o ritirati, non lasciati rossi per sempre.
4. `node tools/resume.mjs` — anteprima locale, con profilo di prova e database separato dalla produzione.

Attenzione a due trappole di questo repository:
- **`dist/` contiene anche sorgenti frontend**, non solo output. Non cancellarla come se fosse generata.
- **`server/world-cities.js` non esiste più**: il contenuto è in `dist/citta-mondo.js` e `build.mjs` lo incorpora nel Worker rinominandolo `WORLD_CITIES`. Chi tocca `build.mjs` non rimuova quel `.replace()`, o il meteo mondiale sparisce in silenzio. C'è un controllo che lo verifica sul Worker costruito.

## Cosa manca, e chi deve deciderlo

**Pubblicare il Worker su Sites.** Finché non succede, le rotte `/api/mappa/*` non esistono online: sulla mappa i livelli comuni e grandine restano barrati, mentre temperature, pioggia ed eventi funzionano perché il browser interroga le fonti direttamente.

Tre decisioni aperte, del proprietario e non di chi riprende il codice: le notifiche push dell'avviso grandine, la riattivazione di H6 (`dist/arrival-estimate.js`), e se ritirare `#mappa-classica`. Sono spiegate in fondo a `MAPPA-EVENTI-RELEASE.md`.

**B2 resta bloccato** dalle fonti osservate e dalla pianificazione, come da cronologia qui sotto. Nulla in questo blocco lo sblocca.

---

# Sincronizzazione GitHub — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

Le note precedenti qui sotto restano cronologia; le affermazioni sul mancato trasferimento GitHub sono superate da questa sincronizzazione.

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

## Fase 12 completata — 12.2, 12.3 e 12.4

Correzioni contrasto, fondo opaco e grassetti: vedere la seconda parte di `FASE-12-RELEASE.md`.

## Ultimo intervento: Fase 12.5 e 12.1

Vedere `FASE-12-RELEASE.md`. Fermarsi prima di 12.2–12.4, come richiesto.

## Globo Vivo — nuova consegna

Leggere `GLOBO-VIVO-RELEASE.md`: tutte le fasi dell’ultima specifica sono state implementate. I dettagli storici sotto descrivono versioni precedenti. La conferma finale della distribuzione è nel record Sites associato al commit; non cambiare le chiavi esistenti.

# MeteoSocial — apri e continua

**15 settembre 2026, nuovo incarico in corso:** leggere prima `GLOBO-VIVO-SPECIFICA.md` e la sezione iniziale di `PROJECT_STATUS.md`. Il proprietario ha autorizzato il completamento di tutte le fasi e tutte le verifiche, senza pause intermedie. Recuperare la sorgente online corrente; non riprendere il precedente prototipo geometria come se fosse già pubblicato.

Ultima estensione del 15 settembre: leggere `GLOBO-FENOMENI-RELEASE.md`. Il Google 3D riceve simboli selezionabili per dati meteo puntuali, grandine segnalata, eventi NASA e bollettino locale. Il radar animato resta separato. Recuperare da Sites versione ed esito correnti; non cambiare le chiavi già funzionanti.

## La via più semplice: stesso account, senza copiare cartelle

1. Sul nuovo PC accedi a ChatGPT con lo stesso account e lo stesso spazio di lavoro usati per MeteoSocial.
2. Apri https://chatgpt.com/sites, seleziona MeteoSocial e scegli Modifica / Edit.
3. Incolla il testo di `CONTINUA-METEOSOCIAL.txt`. L'assistente potrà recuperare l'ultima sorgente da Sites, leggere le istruzioni e preparare il lavoro.

L'accesso iniziale ed eventuali richieste di autorizzazione sul nuovo dispositivo richiedono te. Dopo l'accesso, le istruzioni in AGENTS.md guidano la ripresa e il salvataggio del codice. Non è un sincronizzatore continuo e non trasferisce da solo questa conversazione locale o file non salvati online.

## Con la copia completa del progetto

Estrai lo ZIP in una cartella del nuovo PC e apri quella cartella come progetto locale in Codex, con lo stesso account. Incolla `CONTINUA-METEOSOCIAL.txt`. Chiedi di verificare prima se esiste una versione online più recente. La copia è un punto di partenza: recuperare sempre gli aggiornamenti prima di modificarla.

Codex legge automaticamente AGENTS.md quando lavora dalla cartella principale. Sono inclusi codice, asset, migrazioni, test, visione e note di rilascio. `.openai/hosting.json` identifica il sito da riusare. Non creare un altro sito e non partire dal vecchio GitHub senza riallineamento.

## Anteprima locale automatizzata

L'assistente può usare il runtime Node già disponibile nel proprio ambiente. L'avvio richiede Node 24 o una versione compatibile dotata di `node:sqlite`.

- Windows con Node disponibile: apri `AVVIA-METEOSOCIAL.cmd`.
- Altri sistemi, o da Codex: `node tools/resume.mjs`.
- Solo controllo: `node tools/resume.mjs --check`.
- Solo preparazione: `node tools/resume.mjs --prepare`.
- Porta diversa: `node tools/resume.mjs --port=4591`.

Il comando controlla i file, ricostruisce l'app e avvia l'anteprima. Apri l'indirizzo mostrato, normalmente http://127.0.0.1:4589. Il controllo della porta evita di avviare una seconda copia sulla stessa porta. Il processo resta attivo finché lo chiudi; non installa servizi all'avvio del computer.

Build e anteprima usano moduli Node e librerie già incluse nel progetto, senza scaricare pacchetti automaticamente. Per cambiare lo schema tramite Drizzle, l'assistente installa le dipendenze bloccate con `npm ci` quando necessario.

L'anteprima mostra sempre che stai usando dati locali di prova. Il profilo di prova non è il tuo account ChatGPT e non scrive sul sito pubblico. Database e media locali restano nella cartella esclusa `.local-development`. Le API meteo pubbliche richiedono internet. Il server locale non è destinato a essere esposto in rete.

## IA già collegata e privacy

Il segreto OpenAI del sito online resta su Sites e non va copiato nello ZIP o in chat. Non occorre ricrearlo per modificare lo stesso sito da un altro PC. Per provare l'IA nel browser locale serve una configurazione locale separata: Codex deve seguire il flusso del plugin OpenAI Developers. Senza quella configurazione l'anteprima segnala IA non disponibile; non è un guasto del sito online.

## Regola per passare da un PC all'altro

Prima di lasciare un PC, chiedi: «Salva su Sites tutto il lavoro corrente e aggiorna PROJECT_STATUS.md». Sul secondo PC chiedi: «Recupera l'ultima versione online prima di iniziare». Evita modifiche contemporanee non coordinate sulla stessa versione. Se serve continuare esattamente la stessa sessione locale, usa il collegamento remoto tra dispositivi, dove disponibile; il PC originale deve rimanere acceso e connesso.

Guide ufficiali consultate: https://learn.chatgpt.com/docs/sites · https://learn.chatgpt.com/docs/projects · https://learn.chatgpt.com/docs/remote-connections

## PC principale e aggiornamento del 13 settembre

Il progetto online è il punto condiviso tra i PC. Dal PC principale apri lo stesso MeteoSocial con lo stesso account per riprendere la sorgente aggiornata. Sul sito pubblico basta ricaricare la pagina per vedere gli aggiornamenti pubblicati; per profilo e contributi accedi con lo stesso account. Le preferenze locali del browser, la località corrente e le bozze non pubblicate non si trasferiscono automaticamente. Non è stato configurato accesso remoto al PC principale o un servizio che sincronizzi le sue cartelle.

La consegna corrente è descritta in `CONNECTED-CLIMATE-RELEASE.md`. Il globo NASA ha qualità Alta/Leggera. La preparazione successiva di Google 3D Maps JavaScript è descritta in `GOOGLE-3D-SETUP.md`; resta disattivata fino alla configurazione di Google Cloud. I Photorealistic 3D Tiles non sono disponibili per nuovi progetti con fatturazione italiana/SEE: la precedente indicazione era incompleta. Non sono state create né addebitate risorse Google.

## Nuova sezione grandine

Leggere `GRANDINE-COMMUNITY-RELEASE.md`. Stesso progetto e indirizzo: le cinque zone grandine si salvano nell'account e sono recuperabili dagli altri dispositivi. Gli avvisi sono nella vista aperta; nessun push a app chiusa. Migrazione additiva 0010; nessuna modifica della configurazione Google o OpenAI. Recuperare la sorgente più recente prima di intervenire.

## 15 settembre: Google funzionante e globo satellite

Il proprietario ha confermato il funzionamento di Google dopo l’importazione esatta della chiave dal file. La configurazione runtime Sites (revision 5) resta condivisa dal sito e non va copiata sui PC. Le note del 13 settembre sulla mancata attivazione sono storiche.

Nuova consegna: `GLOBO-SATELLITE-RELEASE.md`. Il percorso Globo usa Google quando configurato; il NASA con i livelli si apre da “Globo meteo · livelli”. Nessun trasferimento automatico di cartelle o preferenze tra computer. Recuperare la versione online corrente prima di modificare; non cambiare le chiavi già configurate.
