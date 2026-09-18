# Sincronizzazione GitHub — 17 settembre 2026

Le sezioni sono in ordine dal più recente al più vecchio, come in PROJECT_STATUS.md.

## Mappa: meteo preciso per comune, pioggia e Lente sulla vista — 18 settembre 2026

Richiesta del proprietario: dati meteo aggiornati e precisi (temperatura, pioggia, meteo) e l'IA molto più presente nella mappa.

**Meteo per comune, endpoint nuovo.** `/api/mappa/meteo` raccoglie temperatura, pioggia, vento e codice meteo per i **500 comuni più popolosi**, in cinque chiamate a blocchi di 100, e li conserva quindici minuti nella stessa cache (`globe_snapshots`) che l'app usa già per il meteo mondiale. Il client non interroga mai Open-Meteo: con cento persone sulla mappa sarebbero centinaia di migliaia di chiamate all'ora.

Perché 500 e non 7.894, scelta dichiarata e non svista: un giro completo sarebbe 79 chiamate e circa trenta secondi, troppo dentro la finestra di una richiesta. 500 sono cinque chiamate e un paio di secondi, e coprono per intero i livelli di zoom fino al 10, che filtrano per popolazione. Sui centri più piccoli il meteo non c'è e viene dichiarato assente, non stimato: il punto resta grigio e più piccolo, e la scheda lo dice.

**Livello PIOGGIA.** Il dato c'era già nelle risposte di Open-Meteo e non veniva mostrato. Ora un anello azzurro che cresce con i millimetri compare solo dove sta piovendo davvero: zero millimetri non disegna niente, perché «non piove» non è un dato da mostrare.

Dettagli completi in PROJECT_STATUS.md.

## Mappa mondiale: temperature, eventi NASA, grandine e Lente — 18 settembre 2026

Quattro livelli su #mappa-eventi, tutti collegati a fonti reali: comuni ISTAT, 200 citta mondiali (Open-Meteo), eventi NASA EONET in tempo reale, grandine dalla community. **I servizi mondiali esistevano gia nel Worker** dal tempo del globo ritirato: non serviva costruirli ne serviva uno scheduler, perche globeSnapshot e gia la pipeline con cache di 15 minuti e dato precedente conservato.

Ogni livello carica separato: una fonte che cade non ferma le altre, e la barra di stato la barra in rosso. Da ogni scheda si puo chiedere a Lente, con il solo nome della localita nel payload.

Limite: ARGOS ha 177.700 nodi, qui il massimo e 7.894 comuni + 200 citta + 300 eventi. Densita di classe ARGOS sull'Italia, non sul mondo.

## Mappa eventi atmosferici — API e prima vista — 18 settembre 2026

Secondo blocco. **Rotta nuova `#mappa-eventi`, in Leaflet come chiede la specifica. La Mappa MapLibre della versione 64 non è stata toccata**: si confrontano sull'anteprima e si decide quale diventa `#mappa`, che è una riga.

`server/mappa.js` serve `GET /api/mappa/comuni` filtrando per riquadro e zoom; i comuni viaggiano dentro il Worker come letterale compatto, quindi nessuna fonte esterna e nessuno scheduler per questo blocco. `dist/mappa-eventi.js` disegna con Leaflet su canvas e **carica Leaflet solo entrando nella sezione**: verificato nel browser che prima non venga scaricato.

Sette pillole su otto non si mostrano: senza fonte collegata sarebbero interruttori che non accendono niente. Restano bloccati i livelli che richiedono scheduler e rete.

`test-mappa.mjs`: 36 controlli. Suite 45 superati, 0 falliti. Sull'anteprima Netlify l'API risponderà solo dopo la pubblicazione del Worker su Sites: fino ad allora la barra di stato mostra la fonte barrata, che è il comportamento previsto.

## Mappa eventi atmosferici — blocco 1.2 — 18 settembre 2026

Primo blocco della specifica PROMPT-MAPPA. Generato `dati/comuni.json`: **7.894 comuni, 1.045 KB**, ordinato per abitanti decrescente. Rigenerabile con `tools/genera-comuni.mjs`.

**Provenienza diversa da quella chiesta:** la specifica dice ISTAT, ma da qui `istat.it` non è raggiungibile. I dati vengono da due pacchetti npm MIT derivati da ISTAT (`italian-cap-comuni-province@1.1.1` per le coordinate, `comuni-json@1.0.0` per la popolazione). Sono copie di terzi: vanno riverificate contro la fonte ufficiale. Il lockfile del progetto non è stato toccato.

**Mancanze dichiarate:** 387 comuni senza popolazione (`abitanti: null`, non zero) e altitudine assente per tutti (nessuna fonte). I 387 restano invisibili ai livelli di zoom che filtrano per abitanti fino a zoom 11.

**Quattro bloccanti prima di proseguire**, dettagliati in PROJECT_STATUS.md: non esiste uno scheduler su Sites e tutta la pipeline della parte 1.1 si regge su cron; da questo ambiente le fonti esterne non sono raggiungibili; la specifica vieta MapLibre e impone Leaflet mentre la Mappa attuale è MapLibre e pubblicata nella versione 64; la licenza della fonte fulmini non è verificabile da qui.

Il file non è ancora servito: collegarlo alle API è il blocco 1.3-1.4, e la specifica dice di fermarsi prima.

## Regola di consegna e Netlify confermato — 18 settembre 2026

**Ogni aggiornamento dev'essere ricostruibile da ChatGPT in tempo reale.** Regola del proprietario: niente resta in chat o in locale, commit e push appena il lavoro è verificato, con PROJECT_STATUS.md e questo file aggiornati nello stesso push. Il testo completo è in CLAUDE.md, sezione «Collaborazione».

La PR #2 è stata integrata su richiesta esplicita del proprietario: `main` è passato da `00c851f` a `615e3e3` e porta la build riproducibile, la suite eseguibile, le quattro correzioni di leggibilità e la configurazione Netlify. CI verde su Node 24. Il sito su Sites resta invariato alla versione 64: un push su GitHub non lo aggiorna.

**Il sito Netlify è confermato funzionante dal proprietario.** Progetto `friendly-pothos-c169ad`, costruito da `main`. Da questo ambiente non è raggiungibile — la politica di rete della sessione consente solo GitHub e i registri dei pacchetti — quindi la conferma è del proprietario, non una mia misura. Resta vero il limite documentato: attraverso il proxy l'app è in sola lettura.

**Le anteprime per pull request sono attive**, e cambiano il modo di lavorare: ogni PR riceve un proprio indirizzo (`https://deploy-preview-<numero>--friendly-pothos-c169ad.netlify.app`) costruito dal suo ramo. Un aggiornamento su un ramo quindi **si vede subito**, senza doverlo prima integrare in `main`: la regola di consegna in tempo reale è soddisfatta lavorando sul ramo, come dice CLAUDE.md.

Netlify aggiunge tre controlli propri su ogni PR. Sulla PR #3 `Redirect rules` e `Header rules` risultano **success**: è una conferma indipendente, non mia, che il proxy `/api/*` e le intestazioni dichiarate in `netlify.toml` sono validi e accettati. Non dice nulla sulle scritture, che restano bloccate per i motivi documentati e non per la configurazione.

## Anteprima Netlify con API in proxy — 18 settembre 2026

Su richiesta esplicita del proprietario. **La pubblicazione ufficiale resta su Sites**, allo stesso indirizzo: Netlify non la sostituisce e non tocca il database di produzione. Versione pubblicata invariata: 64.

`netlify.toml` dichiara il proxy `/api/*` verso `https://scudo-meteo-community.walkerthehate.chatgpt.site/api/:splat` con `status = 200` (riscrittura, non redirect). `tools/netlify-publish.mjs` assembla `netlify-dist/`, perché su Sites il sito non è una cartella statica ma un Worker che incorpora gli asset: `manifest.json` e `icons/` stanno fuori da `dist/` e pubblicando solo `dist/` darebbero 404.

Limite misurato sul Worker, non supposto: attraverso il proxy le **letture funzionano** e le **scritture no** (401 senza le intestazioni di identità che Sites aggiunge alle sessioni autenticate, 403 anche fornendole per il controllo sull'origine). Su Netlify l'app è in sola lettura, ed è scritto in modo esplicito in tutti e tre i file.

Il sito Netlify **non è stato creato né collegato**: servono le credenziali del proprietario. La procedura passo per passo è in `docs/NETLIFY.md`. Nessun segreto inserito da nessuna parte.

## Leggibilità: quattro difetti visibili corretti — 17 settembre 2026

Stesso ramo. **Qui ci sono modifiche visibili agli utenti**, a differenza della sezione sotto che era solo infrastruttura. Versione pubblicata invariata: 64.

Il documento di contesto fornito dal proprietario descriveva uno stato anteriore alla sincronizzazione e non è stato applicato: sei degli otto problemi che elenca sono già risolti, e il suo blocco dei token era peggiorativo. La verifica completa, con metodo e misure, è in `docs/CONTESTO-PRODOTTO-VERIFICATO.md`.

Misurando nel browser sono emersi quattro difetti reali, corretti: la vista Lente era illeggibile (1,27:1, ora 13,47:1), «Community» nella barra si sovrapponeva alle voci vicine, il pulsante «Apri la mappa» aveva testo dello stesso colore del suo sfondo, il collegamento «Guida» stava a 2,25:1 su bianco. Testi fuori dal proprio riquadro: da 13 a 0. Ogni correzione è un blocco CSS commentato in `dist/lente.css` o `dist/design-system.css` e si annulla rimuovendolo.

Due cose restano aperte e non toccate, entrambe da decidere: i conflitti fra le regole invariabili del documento e il codice consegnato (i commenti verso altre persone esistono; i post normali non scadono dopo 2 ore), e la regola `html body #main a{color:var(--dato)}`, che con la specificità dell'ID scavalca i colori scelti dai componenti ed è la causa comune di due dei quattro difetti.

## Build riproducibile e suite di test leggibile — 17 settembre 2026

Ramo `claude/admiring-brown-065b6t`, a partire da 00c851f916720f199484d04291c82971a9da297d. Solo infrastruttura: nessuna modifica al comportamento dell'applicazione, ai testi visibili, allo schema o alle migrazioni. Versione pubblicata invariata: 64.

Prima di questo intervento `node build.mjs` su Linux riscriveva dieci artefatti senza cambiare una riga di codice, perché mancava `.gitattributes` e il checkout convertiva i fine riga in modo diverso a seconda del sistema. Il diff fantasma rendeva impossibile distinguere una modifica reale dal rumore e bloccava lo scambio delle proposte su GitHub. Ora `* -text` disattiva ogni conversione, gli artefatti sono salvati con LF e dopo la build l'albero di lavoro resta pulito. I sorgenti già salvati con CRLF restano CRLF: nessuna rinormalizzazione di massa e nessun file sorgente toccato, quindi niente conflitti con lavoro in corso.

La suite aveva 10 test rossi su 50, nessuno per una regressione. `npm test` (`tools/run-tests.mjs`) esegue tutto con `--experimental-vm-modules` e separa superati, non pertinenti e falliti: 44 superati, 6 non pertinenti dichiarati, 0 falliti. I moduli ritirati hanno ora una fonte unica in `tools/retired-modules.mjs`, condivisa da build e test.

Per riprendere: `pnpm install --frozen-lockfile`, poi `node build.mjs` e `npm test`. Se la build lascia file modificati, è una modifica reale, non più rumore. Dettagli, limiti e problemi aperti nella sezione corrispondente di PROJECT_STATUS.md, compresi i sei test da rileggere e le due frasi sul globo rimaste in `dist/sky-community.js`.

## Sincronizzazione iniziale — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

Leggi CLAUDE.md e docs/COLLABORAZIONE-CLAUDE.md. Le istruzioni precedenti sul vecchio prototipo single-file, globo three.js r128 e src/ sono superate. Il progetto corrente usa mappa locale MapLibre e frontend in dist/. Non avviare 24.6 senza incarico esplicito.
