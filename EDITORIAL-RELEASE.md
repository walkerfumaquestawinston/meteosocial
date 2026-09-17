# Redazione, Creator Studio e meteo adattivo

12 settembre 2026. Le nuove direttive sono conservate in `PROJECT_VISION.md`, richiamato da `AGENTS.md` per la continuità del progetto. Il sito resta una web app con Worker/D1/R2, non un editor nativo CapCut o una nuova app Flutter.

## Consegna operativa

| Area | Comportamento implementato |
| --- | --- |
| Meteo adattivo | A partire da 38 °C, accenti caldi e titoli arcade; con codici di precipitazione, aspetto blu scuro e titoli più morbidi. Modalità neutra selezionabile. Il meteo è quello della località scelta; non c'è tracciamento automatico. Dati client vecchi di oltre 90 minuti non attivano il tema. Aggiornamento meteo ogni 15 minuti con app visibile. |
| Feed pioggia | Nella vista Scopri, la modalità pioggia seleziona post dichiarati Pioggia delle ultime due ore, da tutto il mondo. Non certifica il meteo dell'autore. “Tutti i cieli” rimuove il filtro; profili, link a singoli post, seguiti e salvati mantengono il proprio scopo. |
| Redazione | Profili pubblici con firma editoriale, monogrammi di testata e nome della redazione. Gli accessi agli avatar 3D vengono sostituiti dalla redazione; i dati precedenti non sono cancellati. |
| Patch Notes | Bollettino creativo deterministico da temperatura, vento e variazione della massima di domani. Fonte e orario visibili; non è generato dall'IA né un'allerta. |
| Studio | Importazione fino a sette foto/video, tre stili (news, arcade, cinema pioggia), titolo, sottotitolo, zoom, firma e HUD. Formati quadrato e verticale. Testo/stile conservati localmente; i file restano nella memoria della sessione e non sopravvivono a un ricaricamento. |
| Fotocamera HUD | Apertura su gesto e consenso, senza microfono. Sovrapposizione creativa con temperatura e barra/stelle; nessuna stima di salute o pericolosità. Fotocamera fermata su uscita o background; richieste tardive non riaprono lo stream dopo l'uscita. |
| Esportazione | PNG della slide corrente; video di nove secondi; trailer in sequenza, tre secondi per file, con l'app aperta. MP4 se il browser lo offre, altrimenti WebM. I video sono senza audio, indicato prima dell'esportazione. Anteprima e download; pubblicazione della slide con consenso separato. |
| Asset | Firma Orbitale, guadagnabile dopo apprezzamenti di dieci persone distinte sui post attivi. Auto-reazioni e utenti bloccati esclusi. Inventario persistente e assegnazione idempotente. La soglia non è una certificazione di viralità. |
| Sky-Drop | Finestra creativa di cinque minuti, trenta minuti prima del tramonto previsto, mostrata nell'app aperta con conto alla rovescia aggiornato. Conversione del fuso del dato; luce non garantita. |
| Storm Rooms | Accesso autenticato con posizione dichiarata del browser e consenso. Coordinate arrotondate prima dell'interrogazione meteo; nessun GPS preciso salvato o pubblicato. Disponibili entro 20 km dalle 35 città del catalogo, con temporale stimato e dato recente. Stanza su intervalli di massimo 30 minuti, accesso massimo 10 minuti; rinnovo esplicito. Non certificano la presenza fisica. |
| Chat delle stanze | Messaggi condivisi, aggiornamento ogni 15 secondi con app visibile, eliminazione propria, blocchi esistenti e segnalazione al gestore. Quote, CSRF, proprietà e scadenza controllati sul server. Messaggi scaduti diventano inaccessibili; pulizia delle conversazioni scadute al successivo ingresso in una stanza. Moderazione non immediata. |

## Requisiti conservati ma non consegnati come servizi

- Live Reporter e Weather Co-Op: servono provider WebRTC/SFU/TURN, chat in tempo reale dimensionata, politiche operative di moderazione e gestione dei costi. Non viene mostrata una diretta simulata.
- Sky-Drop push a app chiusa: servono registrazione dei dispositivi, consenso e coda di invio. Questa versione offre una finestra nell'app.
- Trailer domenicale automatico con musica: servono archivio media autorizzato, scheduling e rendering lato server, licenze musicali. Il montaggio locale attuale è avviato dall'utente e senza audio.
- Street Survival Map/Fit Check per quartiere: occorrono consenso e coordinate approssimate riferite al contenuto, schema di zona e flusso di moderazione. I post attuali riportano una città e non devono essere trasformati in punti di strada inventati.
- Loot atmosferici eccezionali e Boss Fight da allerte ufficiali: servono un ingestore di allerte con identificativi e scadenze, criteri di evento e distribuzione idempotente degli asset. Il modulo della Firma Orbitale è il primo inventario grafico, distinto da questi eventi.
- Pacchetti di font originali e asset irripetibili: da commissionare/produrre con diritti chiari; questa consegna usa font di sistema e tre template. Non si promette irriproducibilità di una grafica scaricabile.
- L'assistente IA reale resta subordinato a un servizio configurato. Le scorciatoie contestuali non ne simulano la presenza.

Le allerte non diventano un pretesto per invitare utenti in strada: attività e futuri obiettivi collettivi devono essere realizzabili da luoghi sicuri. La pubblicazione mondiale richiede anche infrastruttura, localizzazione e operazioni adeguate; non viene dichiarata scalabilità illimitata.

## Architettura e verifica

`climate-engine.js` contiene regole e bollettini puri. `studio-canvas.js` disegna gli elaborati; `creator-studio.js` gestisce input, media, esportazione e ciclo di vita. `editorial-world.js` collega UI, ricompense e stanze. `server/studio.js` applica i controlli autorevoli. Migrazione additiva `0006_slimy_newton_destine.sql` per stanze, membri, messaggi e segnalazioni, con indici temporali.

200 controlli automatici superati: editorial 37, network 41, social 38, atlas 49, worker 21, sensory 14. Inclusi dati mancanti/vecchi, fusi e scadenze Sky-Drop, accesso/CSRF, posizione imprecisa, meteo non temporalesco, riuso della stanza, messaggi idempotenti, proprietà, blocchi, scadenza di presenza, auto-reazioni e inventario.

QA nel browser desktop e viewport 390×844: importazione di immagini locali di test, modifica di titolo/template/formato, esportazione riproducibile 1080×1920 di circa 9 secondi, impaginazione mobile e redazione. La fotocamera reale e il GPS non sono stati attivati per conto dell'utente; non sono stati pubblicati post di test nel sito pubblico. Le proprietà video e le condizioni di errore restano dipendenti dal browser. Non è una certificazione su dispositivi fisici.

Riferimenti tecnici: [registrazione di uno stream Canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream), [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), [dati e codici Open-Meteo](https://open-meteo.com/en/docs).
