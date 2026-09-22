## 22 settembre 2026 — Versione 91 pubblicata: interfaccia più leggibile

Restyling senza nuovi abbonamenti: Oggi a due colonne sul desktop, navigazione superiore sulle pagine principali e dock mobile, tipografia e controlli uniformi, dettagli della variazione meteo apribili, Community a due colonne di pulsanti sul telefono. Fonti e orari restano visibili. Home senza hash evita il pre-caricamento MapLibre (937395 byte non compressi); nessun benchmark di velocità dichiarato. Dettagli in docs/DESIGN-FINITURE.md.

Pubblicazione riuscita 2026-09-22T08:07:40.245148Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#home . Sites runtime 9d591516076e48096f1bc035e4c86e1a95332756 e GitHub e9f371ab22719476c5604c62c2d6d8cb35a2e558 condividono tree a99980a3a8cbec83d4867ece3ffbf897fbeae8ef. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_38f81f52c45c819189880d560d362ab3; deployment appgdep_6ab236f556d88191ae080a243682d8fb; ambiente 10, audience pubblica preservata. Apertura e push con workflow Sites riusciti; packaging locale non avviabile su Windows, usata build remota.

Build e 69 suite superate, CI 35702914439 riuscita. Ritocchi finali CSS ricompilati; anteprima 4597 verificata desktop, 390 e 320 px, dettaglio cronologia apribile, navigazione e radar con quadro 09:55. Nessuna certificazione WCAG, di prestazioni o su dispositivo fisico. Open-Meteo rimane indisponibile nel controllo locale: il restyling non risolve il problema dei dati, che restano marcati come precedenti. Conferma pubblicazione tramite stato Sites; nessuna nuova verifica browser del sito pubblico richiesta per questo rilascio.

Ramo codex/weather-scenery-20260922, PR draft #21. I successivi commit registrano solo queste note e non richiedono nuovo deploy.

## 22 settembre 2026 — Versione 90 pubblicata: radar grandine gratuito e tema automatico

Radar-DPC POH Italia integrato gratuitamente, con probabilità, fonte, licenza e orario reale del quadro; aggiornamento nominale 5 minuti, copertura non uniforme e ritardo possibile. Non è conferma a terra né radar mondiale. Tema automatico giorno/notte per cartografia e pannelli, opzioni manuali in Strumenti, indice dei sei livelli e più spazio radar sul telefono.

Sites runtime 4ad7ed3100104ed8ddde48c7b9547a5551aabf0b e GitHub f1c0e1a320cc220ef6825df9c7902d0714d404dc condividono tree a85eb03d441f58ba18182e3b80b7d2b017d98cc7. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_53b0d1a594b081918f531d064fd5a259; deployment appgdep_6ab2316aede08191abc10fc7a3771a09 riuscito 2026-09-22T07:43:42.483704Z, ambiente revisione 10. Build remota: il nuovo workflow Sites locale è stato tentato, ma non avvia il comando di preparazione su questo host Windows.

Build e 69 suite passate nella revisione completa; test radar e build ripetuti dopo la correzione, CI finale 35700696862 riuscita. v89 pubblicata ma endpoint radar rispondeva 503: v90 cambia redirect da error a manual, rifiutando comunque tutte le risposte non 2xx, e aggiunge diagnostica senza URL firmati. Endpoint pubblico verificato 200 image/tiff, 322324 byte, quadro 09:35 CEST. Anteprima 4597 e verifiche desktop, 390 e 320 px; tema chiaro/scuro e ripristino Automatico. Nessuna certificazione meteorologica o su dispositivi fisici. Limite Open-Meteo precedente ancora presente, indipendente dal radar.

Continuare ramo codex/weather-scenery-20260922 e PR draft #21. Dettagli in docs/RADAR-GRANDINE-TEMA.md. Successivi commit di note non richiedono un nuovo deploy. Nessun abbonamento aggiunto.

## 22 settembre 2026 — Radar grandine gratuito e mappa giorno/notte, revisione pronta

Richiesta più recente: radar grandine gratuito (supera la breve preferenza a pagamento). Collegato Radar-DPC POH Italia, senza nuovo abbonamento, separato dalle osservazioni della community. Tema automatico cartografia e pannelli, con opzioni manuali negli Strumenti e indice dei livelli. Ultima pubblicazione confermata 88; attendere nota di esito. Dettagli e limiti in docs/RADAR-GRANDINE-TEMA.md.

## 22 settembre 2026 — Cartografia MapTiler

Utente approva integrazione MapTiler e chiede il link per pagare Flex. Conservare mappa e pannello affiancati, stile leggibile con pochi elementi di fondo, etichette meteo in evidenza. Creato Atlante chiaro nel suo account. Fonte cartografica distinta dal meteo.

## 22 settembre 2026 — Acquisto richiesto

L’utente chiede di attivare un abbonamento e integrarlo, poi domanda la differenza tra Starter e Pro+. Registrazione WeatherAPI aperta, nessun acquisto completato. Collegamento server predisposto; attivazione dipende dalla chiave del suo account. Nessun rinnovo annuale richiesto.

## 22 settembre 2026 — Preferenze aggiornate dopo la v85

L'utente non approva ancora la mappa. Vuole copertura mondiale, dati recenti con orario esatto e pannello dettagliato sempre affiancato alla cartografia. Budget dati massimo 50 euro al mese. Sul telefono verticale preservare leggibilità mantenendo due aree visibili. Non comprare servizi senza un'offerta precisa; nessun abbonamento attivato. Non confondere frequenza delle chiamate, passi delle previsioni e nuove osservazioni al secondo. Ricerca ufficiale e correzione del campione obsoleto: docs/MAPPA-DATI-RECENTI.md. Questa preferenza supera la precedente scheda richiudibile della v85.

## 22 settembre 2026 — Una mappa dettagliata che si capisce subito

L'utente chiede una mappa molto utile, ricca e riconoscibile, comprensibile senza difficoltà. Dare priorità a luogo, tempo attuale, prossimo cambiamento e azioni esplicite; dettagli progressivi e strumenti secondari raccolti. Identità inchiostro/lime per i pannelli della mappa, cartografia sincronizzata alle fasi solari. Nessuna promessa di perfezione, unicità assoluta o osservazioni al secondo senza fonte. Prima applicazione: docs/MAPPA-ATLANTE-LOCALE.md; pubblicazione indicata nelle note di esito.

## Direzione attuale: mappa locale — 16 settembre 2026

## 22 settembre 2026 — Cielo vivo e calendario automatico

Nuova revisione pronta: Oggi più compatto, meteo in primo piano, navigazione uniforme e osservatorio mappa apribile. Stagioni astronomiche automatiche con effemeridi USNO 2026–2040, festività italiane secondo la data locale, Pasqua/Pasquetta calcolate. Il calendario aggiorna accenti e dettagli entro 30 secondi, insieme ai temi alba/giorno/tramonto/notte. Corretta anche la transizione sfondo/testo. Dettagli e limiti: docs/DESIGN-CIELO-VIVO.md.

Compilazione completa riuscita. 58 suite attive superate, zero fallimenti; 5 contratti storici esplicitamente ritirati. 240 coppie di colori testo/sfondo superano 4,5:1 (minimo 5,44). Verificati Oggi mobile, ricerca e comandi mappa, anteprime dimostrative Natale e autunno/alba. Non è una certificazione di assenza di ogni bug.

Ramo GitHub previsto: codex/calendar-design-20260922, sopra codex/readability-20260922. Per riprendere usare il ramo più recente, non main. Pubblicazione da confermare nelle note di esito che verranno aggiunte a rilascio riuscito. Anteprima: http://127.0.0.1:4595/#home. Le note precedenti sono storiche.


## 22 settembre 2026 — Leggibilità e ingresso semplificato

Revisione successiva alla versione 74, su richiesta dell'utente dopo riscontro di testi illeggibili e sovraccarico visivo. L'ingresso senza hash apre Oggi. Tre azioni esplicite: Previsioni, Mappa e radar, Segnala il meteo. Ricerca città diretta; barra inferiore con Segnala. Funzioni aggiuntive e pianificazione restano in sezioni apribili. Lente nella mappa è apribile su richiesta. Dati, fonti e bollettini ufficiali restano disponibili.

Corrette coppie testo/sfondo in Oggi, Meteo, community e controlli mappa nelle fasi solari. I pannelli specialistici storici conservano superfici scure con testo chiaro. Testi e superfici semantiche delle quattro palette superano 4,5:1 (minimi: giorno 4,90; notte 8,18; alba 4,83; tramonto 4,57). Controllo DOM e visivo di giorno/notte su anteprima integrata, desktop e 390 px; corrette anche etichette tagliate. Il controllo DOM è un audit mirato, non una certificazione completa: gradienti e illustrazioni sono verificati visivamente. Nessuna segnalazione di prova pubblicata.

Compilazione completa riuscita con fallback WASM. Superati test-atmosphere, test-feature-routes, test-solar-live-map, test-mappa, test-day-plan e test-community-context. Anteprima live: http://127.0.0.1:4595/. Pubblicazione di questa revisione da confermare tramite stato Sites; numero versione e link GitHub saranno registrati dopo il rilascio.

Preferenza permanente: per ogni aggiornamento completato allineare anteprima locale, sorgente GitHub e pubblicazione Sites. Non è una sincronizzazione automatica in background e non include preferenze del browser o bozze private. Prima di nuovi interventi recuperare sempre la sorgente più recente dello stesso Site. Le note delle precedenti revisioni restano storiche.


## 22 settembre 2026 — Segnale: nuova direzione visiva, non pubblicata

Su richiesta dell'utente, nuova identità avorio/inchiostro/arancio per Oggi e Meteo, titoli editoriali e barra inferiore a cinque voci con Mappa centrale. Profilo resta accessibile in alto. Ramo `codex/design-segnale-20260922`, derivato dal lavoro grandine della PR #15. Questa scelta aggiorna la precedente preferenza per il tema scuro uniforme.

Dettagli e limiti in `docs/DESIGN-SEGNALE.md`. Anteprima dei moduli sorgente con dati di esempio verificata a desktop, 390 e 320 px. Compilazione completa ancora bloccata da `spawn EPERM` di esbuild su Windows; nessuna pubblicazione. Sites verificato alla versione 73. Completare build, CI e verifica integrata prima del rilascio.


La richiesta più recente riguarda MapLibre locale: base rapida, un livello meteo per volta, temperatura continua, vento leggibile, radar onesto, storie essenziali e cartolina 9:16. Il globo e NASA non fanno più parte della navigazione. Il volo introduttivo è soltanto zoom 4→11 sulla mappa, 1,5 secondi, una volta per sessione. Preservare continuità online per lavorare dallo stesso account su un altro PC; non promettere trasferimento delle preferenze browser.

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

# Direzione vigente — Documento unico di sviluppo

Il Documento unico più recente dell’utente sostituisce tutte le specifiche precedenti riportate sotto. Terreno: il meteo agli orari della giornata, decisioni comprensibili con incertezza dichiarata, community utile senza metriche di vanità. Verificare il codice prima di intervenire, segnalare difformità e contraddizioni, eseguire un solo blocco autorizzato per volta e fermarsi. Nessun dato inventato. Gli elementi elencati NON TOCCARE restano protetti.

Consegna corrente: C3/C4/C6, integrazione del meteo mondiale e del catalogo NASA approvata. Vedere BLOCCO-C3-C4-C6-RELEASE.md. E2 e prerequisiti H2/G2 limitati alle scuole preservati. D9/D10 preservati ed estesi alle risposte. G1 già verificato. E6 preservato. D7/D8/F5 preservati. C1/C2 e C5 preservati. D2/D4/D5 e D6 preservati. E1 conserva il limite documentato sull’esecuzione senza visitatori. I blocchi successivi richiedono il via dell’utente. Tutto ciò che segue è storico e non prevale sul Documento unico.

# MeteoSocial — riferimento di prodotto

## Riferimento attuale — 15 settembre 2026

**`GLOBO-VIVO-SPECIFICA.md` sostituisce tutte le direzioni precedenti riportate sotto.** Il proprietario autorizza tutte le modifiche e verifiche necessarie e ha chiesto di proseguire fino all'ultima fase senza pause intermedie. Il globo delle osservazioni reali è il centro dell'app; le precedenti sezioni restano conservate. Le sezioni successive di questo documento sono storia del progetto, non nuove autorizzazioni o requisiti prevalenti.

Direttive dell'utente ricevute il 12 settembre 2026. Questo documento conserva la direzione per le prossime sessioni. Le istruzioni successive dell'utente prevalgono. L'ambizione «prima App Meteo Social al mondo» è un posizionamento da verificare, non un fatto da pubblicare.

## Identità

Un social network governato dal meteo: il cielo modifica interfaccia, contenuti e occasioni di interazione. Profili come media brand, senza avatar personali. Post a slide, foto, video e bollettini editoriali. Gaming, tecnologia e cinema sono rubriche coerenti con il clima; non usare i vecchi nomi PREMI START o popcorn club.

## Requisiti richiesti

1. Algoritmo empatico: caldo intenso → tipografia arcade anni Novanta, HUD retro e colori saturi; pioggia intensa → interfaccia scura, elegante e tono malinconico. Feed sotto la pioggia da utenti di tutto il mondo. Controlli chiari, font grandi, animazioni ridotte e ritorno al feed completo.
2. Fotocamera HUD con barre di stamina e stelle scenografiche legate al meteo. Editor fluido con foto/video, layout Breaking News, slide quadrate, overlay verticali ed esportazione per Instagram/TikTok. Le grafiche devono essere originali, senza usare loghi o asset di GTA, Canva o CapCut.
3. Media brand: firme, watermark, badge circolari e font; bollettini in stile patch notes. Ricompense grafiche quando cresce la diffusione reale dei contenuti, con criteri pubblici e protezioni contro auto-reazioni/duplicati.
4. Storm Rooms temporanee e locali, attivate dalle condizioni atmosferiche; Sky-Drop con finestra di cinque minuti dettata dalla luce/meteo; Live Reporter con chat; Street Survival Map di Fit Check per quartiere; Trailer del Weekend automatico dalle proprie riprese.
5. Weather Co-Op: due dirette da climi opposti in split screen. Loot meteo temporanei con asset esclusivi. Eventi collettivi «Boss Fight» derivati da allerte ufficiali, con tema cittadino per sette giorni al raggiungimento di un obiettivo.

## Confini di qualità

- Le allerte ufficiali sono separate da stime di modello, segnalazioni e grafica ludica. Non ricavare un'allerta rossa da temperatura, colori del feed o post.
- La stamina è una grafica, non una misura di salute; le stelle non misurano la pericolosità. Niente lampeggi rapidi o contenuti che coprono le azioni utili.
- Eventi e dirette non devono invitare a uscire in strada durante un pericolo. Si può contribuire da una finestra o con informazioni utili da un posto sicuro. Nessun punteggio per l'esposizione al rischio.
- Posizione, fotocamera, microfono e notifiche richiedono azioni esplicite. Nessuna registrazione o trasmissione silenziosa. L'app web non può provare da sola la presenza fisica di una persona.
- «Virale», disponibilità dei ripari, autenticità dei media, IA e streaming non possono essere simulati. Un montaggio creativo non è una verifica dell'evento.

## Sequenza tecnica

Il sito esistente usa moduli JavaScript, Worker, D1 e R2. Si estende questa struttura senza fingere una conversione a Flutter/React Native. Nuovi motori separati: stato climatico e patch notes; canvas editor e gestione media; servizi di redazione; stanze temporanee; servizi futuri di consegna push, streaming e montaggio.

Dirette e Co-Op richiedono un servizio WebRTC con relay/SFU, moderazione e costi; Sky-Drop a app chiusa richiede push e pianificazione; trailer automatici richiedono consenso, archivio media, coda di rendering e musica autorizzata; Boss Fight richiede un ingestore affidabile delle allerte ufficiali. Il dettaglio delle capacità realmente consegnate è nelle note di rilascio. Non presentare questa lista come già operativa.

## Ultime consegne

`EDITORIAL-RELEASE.md` descrive Studio, Redazione e stanze temporanee. `FITCHECK-RELEASE.md` descrive la mappa dei consigli con foto/video, zone approssimate, scadenze e collegamenti alla community. Queste note sono il riferimento per lo stato effettivamente implementato.

`LENTE-RELEASE.md` descrive l'assistente OpenAI contestuale nel globo, nella mappa, nelle previsioni e nella community, con fonti e invio manuale dei soli dati autorizzati.

`ATMOSPHERE-RELEASE.md` descrive la doppia entrata Oggi/Globo, il ciclo giorno/notte e la timeline dei modelli, bollettini DPC italiani, personalità Lente con override prudente, Meteo Clash, Studio a cinque strumenti, città seguite e sessione di testimonianza da fotocamera. Conserva il confine tra quanto funziona sul web e le richieste future di streaming, push, AR e widget nativi.

## Direzione confermata il 13 settembre: mondo collegato

Usare la mappa protagonista e i comandi essenziali della foto di riferimento di Grandinometro come spunto di semplicità, con grafica e percorsi propri. Globo, mappa, precipitazioni, meteo locale, grandine, community e IA devono mantenere il contesto della località. Qualità alta con controllo leggero per i dispositivi meno potenti. Distinguere immagine geografica storica, osservazioni radar recenti, modelli e testimonianze. L'ambizione di mostrare ogni fenomeno climatico in tempo reale resta una direzione, non una copertura già disponibile. Google 3D è un'integrazione opzionale da collegare con risorse autorizzate, non una fonte meteo live. Stato realizzato in `CONNECTED-CLIMATE-RELEASE.md`.

Il proprietario ha autorizzato di iniziare la preparazione di Google 3D con apertura manuale. La consegna preparatoria usa Maps JavaScript / Immersive Maps ed è documentata in `GOOGLE-3D-SETUP.md`; fatturazione e quote richiedono ancora l'account Google del proprietario. Non confondere questa preparazione con un servizio attivato.

## Confronto Grandinometro e qualità

Il proprietario richiede un nuovo confronto delle funzioni grandine, integrazioni utili e qualità verificata. La consegna è in `GRANDINE-COMMUNITY-RELEASE.md`: usare prove concrete e fonti pubbliche, non promettere perfezione assoluta, esclusività mondiale o parità completa senza implementazione. Tenere distinti riscontri degli account, stime dimensionali e rilevamenti ufficiali.

## Direzione confermata il 15 settembre: satellite come Globo

Dopo aver verificato Google funzionante, il proprietario chiede di cambiare il globo e renderlo interattivo con il satellite. La vista principale Globo deve quindi usare Google quando abilitato, con esplorazione della Terra, rilievi e selezione della zona meteo nella stessa pagina. Conservare accessibili i livelli meteo esistenti, senza chiamare live le immagini geografiche. La consegna è descritta in `GLOBO-SATELLITE-RELEASE.md`.
