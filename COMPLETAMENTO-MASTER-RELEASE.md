# Completamento autonomo del documento master

L’utente ha autorizzato tutti i punti rimanenti senza ulteriori pause di verifica. Questa release mantiene il sito esistente e non cambia chiavi, pubblico o globo protetto.

## Implementato

- **H1**: pagina pubblica `/z/<slug>` con schema geografico delle segnalazioni entro 5 km, ultime due ore, conteggio di persone distinte, ora di aggiornamento, immagine PNG OG generata dai dati. Nasconde segnalazioni eliminate/oscurate e autori bloccati dalla moderazione. Coordinate approssimate, nessun nome autore o indirizzo. Aggiornamento ogni minuto senza ricaricare tutta la pagina. Il link riapre la città nell’app.
- **H2**: domande predefinite pioggia/vento/freddo, risposte sì/no/non so, sessione valida, massimo una domanda ogni 30 minuti, scadenza 2 ore, risposta con posizione recente entro 5 km, autori non pubblici. Riusa avvisi prima risposta e moderazione delle risposte già realizzati per le scuole. La presenza disponibile scade dopo dieci minuti: non fingiamo che una posizione di ieri significhi essere lì adesso.
- **H3**: gruppi privati tramite invito casuale, token conservato come hash, lettura senza account, massimo 30 membri imposto atomicamente, previsioni nelle cinque fasce del giorno scelto e segnalazioni attuali separate. Confronto con la prima previsione letta, avviso in pagina quando cambia. Scadenza 24 ore dopo il giorno dell’evento; pulizia alla consultazione. Nessuna chat.
- **H4, adattamento onesto**: cattura del modello tra le 6 e le 8 quando si consulta una città; confronto dalle 21 con un aggiornamento successivo, cinque fasce, soglia 3°C/pioggia, card quadrata scaricabile. Nessun dato del mattino ricostruito retroattivamente. Non si chiama questo confronto una misura di accuratezza: Open-Meteo non fornisce qui osservazioni indipendenti certificate.
- **H5**: domanda “Fa freddo da te?”, una risposta aggiornata per sessione, conteggio vero entro 3 km e due ore. Richiede posizione condivisa al tocco, non all’avvio.
- **H6**: funzione sperimentale progettata e disattivata con due flag; richiede densità 100, almeno due report concordi, componente vento >0,5 e risultato 5–45 minuti. Non viene esposta: la velocità del vento al suolo non basta a validare il movimento della pioggia.
- **F6**: focus anche su ruoli/tabindex, preferenza testo grande che cambia effettivamente i token, contrasto alto con fondo sicuro, area superiore sicura. Nuove aree di aggiornamento annunciate. Vecchie funzioni non comprese nel master ora nascoste e raggiungibili soltanto riaccendendo il relativo flag.
- **G4**: testi store e istruzioni screenshot in `store/STORE-COPY.md`.
- **C7**: verificato il renderer esistente: DPR 1,8, stop in background e dopo dieci secondi, budget adattivo, rispetto di riduzione movimento ed eco. Nessuna riscrittura del renderer o della geometria.

## File

- `server/growth.js`: link pubblico/PNG, snapshot confronto, gruppi, voti percepito e limiti.
- `server/questions.js`: topic meteo oltre alle scuole, opzioni fisse, stessi controlli di sessione/distanza/moderazione.
- `server/worker.js`, `build.mjs`: instradamento e inclusione degli asset.
- `db/schema.ts`, migrazione additiva `drizzle/0019_minor_beast.sql` e metadati: cinque tabelle nuove e topic con default school per conservare i dati esistenti.
- `dist/growth.js`: schermate, inviti, condivisione, termometro umano, card scaricabile, collegamenti alla città.
- `dist/arrival-estimate.js`: progetto H6 dietro flag.
- `dist/public-zone.js`, `dist/public-zone.css`: pagina pubblica accessibile e aggiornamento.
- `dist/main.js`: integrazione e percorsi insieme/evento.
- `dist/schools.js`, `dist/notifications.js`: notifiche distinguono scuole e cielo.
- `dist/community-features.js`: funzioni accessorie conservate dietro flag.
- `dist/design-system.css`: accessibilità e superfici delle nuove pagine.
- `dist/sw.js`: shell offline aggiornata con i nuovi moduli, versione v41.
- `dist/server/index.js`, `dist/.openai/drizzle/*`: artefatti rigenerati.
- `test-growth.mjs`: test isolati per autenticazione, conteggi, PNG, snapshot, opzioni, distanza, frequenza, privacy, cap gruppi e scadenza.
- Documenti di ripresa/stato/visione e materiali store: continuità dello stesso progetto online.

## Verifiche

Build riuscita. Passano test-growth, test-schools, test-sky-confirm, test-offline, test-globe-gestures e test-moderation. I dati sintetici sono confinati nel database temporaneo di test, eliminato alla fine. Nessun report di prova pubblicato nel database reale.

## Limiti ancora reali

Non è configurato un processo pianificato: nessuna cattura automatica alle 8, verifica alle 21, avviso prima dell’uscita o push per cambiamenti degli eventi quando nessuno consulta l’app. Gli avvisi ufficiali automatici sono ancora indisponibili; bollettini consultabili nell’app. La rimozione fisica dei record scaduti è pigra; l’invisibilità alla scadenza è immediata nelle query.

I gruppi mostrano l’avviso di cambiamento in pagina, non inviano ancora la notifica evento richiesta. L’app non modifica il modello Open-Meteo, non certifica scuole chiuse né l’esattezza di una segnalazione. La stima H6 resta spenta finché non validata e popolata. Nessuna garanzia 60 fps senza misura su telefono fisico. Nessuna pubblicazione App Store/Play Store eseguita.

Le preferenze locali persistono sul dispositivo: non esiste sincronizzazione automatica delle preferenze tra PC. Sorgente e documentazione restano nello stesso progetto online.

## Verifica nel browser pubblicato

Verificati nuovo percorso “Il meteo insieme”, condivisione del link reale della città, pagina pubblica con zero persone e assenza onesta del confronto senza snapshot del mattino. Il browser di prova non offre WebGL: usa il fallback del globo; non è una prova di prestazioni GPU. Corretto inoltre il contrasto residuo delle righe mare/fonti mondo rilevato nella schermata scura. Le immagini nel materiale store sono catture reali del browser, non composizioni con dati inventati.

Verifica preferenze nel browser: Testo grande porta realmente i paragrafi a 20 px; Contrasto alto applica il fondo notte; entrambi ritornano allo stato iniziale al secondo tocco. Catture di giornata, pianeta e nuova schermata conservate in store/ senza ritoccare dati o punti.
