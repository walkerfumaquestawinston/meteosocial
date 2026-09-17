# Fonti e card — 16 settembre 2026

Baseline: versione 31. I log di produzione consultati hanno confermato errori 503 su /api/atlas/cities e /api/atlas/events con messaggio “This Worker is not permitted to access the default cache.” Il problema precedeva la richiesta alla fonte, non prova un guasto di Open-Meteo o NASA.

## Correzioni
- server/worker.js: accesso alla cache pubblica facoltativo; errori di getter, lettura e scrittura non bloccano la risposta della fonte.
- server/atlas.js, server/atmosphere.js, server/globe-events.js, server/pulse.js: uso dello stesso accesso protetto. La logica delle fonti e i confini delle allerte sono invariati. Le risposte private non vengono messe in cache.
- dist/sky-community.js: stato di preparazione, prevenzione doppio clic, gestione errori di acquisizione/esportazione, link download temporaneamente nel documento e rilascio URL. Il messaggio conferma solo la richiesta di download, non il salvataggio sul dispositivo.
- dist/sw.js: shell v21. dist/server/index.js: build aggiornato.

## Verifiche
- 9 scenari cache: assente, getter negato, lettura/scrittura fallite, successo delle fonti e indisponibilità reale restituita correttamente. API del Worker compilato, fonti simulate.
- 49 controlli Atlas e 49 Atmosphere esistenti superati.
- 4 scenari export: download con link inserito, errore acquisizione, blob nullo, globo in caricamento. Test del flusso con canvas simulato, non prova di un download reale.
- Build e controllo diff riusciti.

## Limiti
Non è stata ripetuta una verifica browser in questa sessione. Il download sul telefono e la disponibilità effettiva delle fonti esterne dopo la pubblicazione non sono attestati dai test. Se la cache è vietata le richieste vanno alla fonte: i suoi limiti e indisponibilità restano possibili. Non vengono inventati dati né modificati i controlli di accesso del runtime.

## Verifica successiva e anteprima card
- Browser reale sull’anteprima locale: report anonimo di prova e creazione della card confermati. Il dialogo visualizza correttamente l’immagine con globo, Roma, condizione e orario; verifica visiva effettuata.
- Aggiunta anteprima persistente con link Scarica PNG e istruzione per salvare l’immagine dal telefono. Il blob resta disponibile finché il dialogo è aperto, poi viene rilasciato con ritardo.
- Anche il clic esplicito non ha prodotto un evento download confermato dall’automazione: non si attesta il salvataggio sul dispositivo.
- Log di produzione dopo versione32: quattro risposte503 per /api/atlas/cities (16 settembre, circa02:24UTC), senza il precedente errore di cache. La causa della risposta negativa della fonte non è determinabile da quei log; il meteo globale non viene dichiarato risolto.
- dist/sky-community.js, dist/sw.js (v22), dist/server/index.js e test-card-export.mjs aggiornati. Quattro scenari export superati, build e diff validi.

## Diagnostica fonte città
La stessa richiesta batch alle35città ha restituito200 nell’ambiente di lavoro, mentre l’endpoint pubblico ha restituito503 con il messaggio relativo a risposta HTTP negativa della fonte. Aggiunto log limitato a fonte, route e status HTTP: nessuna identità, cookie, chiave o coordinata utente. Il429 ha ora un messaggio specifico. La diagnostica serve a distinguere la causa online, non dichiara risolto il servizio. Test Atlas49 superati.

## Causa confermata e riduzione richieste
Alle02:35:24UTC del16settembre, dopo la diagnostica v34, la fonte Open-Meteo ha restituito429 dal servizio ospitato. L’endpoint pubblico ha risposto con il messaggio specifico di quota. Non è un problema di parametri: la stessa richiesta batch aveva risposto200 dall’ambiente di lavoro. Non è determinabile se il limite riguardi traffico del sito o un indirizzo di uscita condiviso.

Correzioni: cache pubblica nominata meteosocial-public-v1 tramite caches.open (con accesso protetto e fallback senza cache); richieste simultanee città accorpate nello stesso processo; pausa dopo429 secondo Retry-After, minimo60secondi; tentativi automatici modello nel globo distanziati10minuti anche in caso d’errore. Il pulsante di aggiornamento resta disponibile, senza aggirare la pausa del server. Nessuna modifica a quote, chiavi o fatturazione.

Riferimento cache: https://developers.cloudflare.com/workers/runtime-apis/cache/ . La disponibilità della cache nominata nell’hosting non è attestata dal solo test simulato; il percorso senza cache resta valido. Accorpamento e pausa in memoria sono locali al processo, non un limite globale distribuito.

Test:49Atlas,22fenomeni,9resilienza cache,3scenari nuovi (concorrenza/cache nominata/Retry-After), tutti superati. Aggiornato il test isolato NASA per caricare l’helper cache introdotto precedentemente. Nessuna nuova richiesta di verifica alla fonte durante la pausa. Nessuna promessa di recupero della quota: il servizio globale resta dipendente dal fornitore.
