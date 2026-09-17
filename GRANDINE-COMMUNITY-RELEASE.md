# Grandine: osservazioni, riscontri e zone personali

13 settembre 2026. Estensione della versione online 21, stesso progetto e stesso indirizzo MeteoSocial. Non è una dichiarazione di assenza assoluta di errori o di superiorità dimostrata su ogni concorrente.

## Analisi di Grandinometro

Fonti primarie consultate: sito, descrizioni ufficiali degli store e recensioni pubbliche. Non è stata installata l'app su un telefono; notifiche, latenza, algoritmi proprietari e affidabilità non sono stati misurati. Le carenze non dimostrate vengono trattate come questioni da affrontare nel nostro prodotto, non come difetti accertati del concorrente.

| Area | Evidenza pubblica | Scelta di MeteoSocial |
| --- | --- | --- |
| Segnalazioni | Grandinometro propone foto facoltativa, dimensioni e mappa comunale. | Stima dei chicchi, ora osservata distinta dalla pubblicazione, zona approssimata facoltativa e foto nel dettaglio. |
| Affidabilità | Il sito descrive conferme, smentite e rimozione dalla mappa delle segnalazioni smentite più volte. | Riscontri numerici e discordanza visibile; un voto non diventa una prova scientifica e non cancella automaticamente una testimonianza. |
| Indicatore locale | Il sito presenta il rischio in relazione alle segnalazioni. | Conteggi espliciti, nessun semaforo o probabilità ricavati dal numero di persone. Assenza di osservatori non equivale a cielo sicuro. |

Fonte: [Grandinometro](https://grandinometro.it/). Questi limiti sono una lettura critica del metodo descritto, non una valutazione sperimentale del suo algoritmo.

La scheda Android dichiara radar DPC e confronto automatico delle segnalazioni, raggio notifiche 2–50 km, fascia notturna, tre luoghi salvati e condivisione. Le note recenti descrivono timeline del radar/rischio, legenda e pulsanti riposizionati: questi problemi dichiarati corretti non sono attribuiti alla versione corrente. MeteoSocial conserva il proprio radar RainViewer e non riproduce un algoritmo proprietario né certifica i post incrociandoli con i pixel. [Google Play](https://play.google.com/store/apps/details?id=it.grandinometro.app).

Le recensioni iOS includono richieste di maggiore cura grafica e dubbi sull'utilità delle osservazioni lontane; sono opinioni di singoli utenti. Lo sviluppatore descrive miglioramenti in corso. Una recensione menziona parcheggi coperti: quindi non rivendichiamo i ripari come un'idea esclusiva. [App Store](https://apps.apple.com/it/app/grandinometro/id6796001485).

## Funzioni consegnate

- Modulo rapido grandine: cinque classi dimensionali, compresa “Non so stimarla”, e osservazione adesso/circa 5/15/30/60 minuti prima. Stima dichiarata; nessun invito a raccogliere chicchi durante il maltempo. Foto e consenso alla zona restano facoltativi.
- Il tempo osservato governa filtri e ordine della mappa. L'ora di pubblicazione rimane separata. I vecchi post senza metadati usano l'ora del post, con dimensione sconosciuta.
- Filtri comuni a pin ed elenco: 15/60/120 minuti; 2/5/10/25/50 km o tutte le zone; dimensione; presenza/assenza della fine riferita. I post fuori catalogo senza coordinate restano separati e non vengono geocodificati arbitrariamente.
- Dettaglio della zona: testi, foto disponibili, dimensioni dichiarate, orari, riscontri, collegamento all'originale. Voto per account, revocabile; conferma e contestazione si sostituiscono in una transazione. Nessuna autoconferma; post bloccati/scaduti/eliminati non ricevono nuovi riscontri.
- “Qui ha smesso” è un aggiornamento pubblico dell'autore. Conserva il primo orario di fine, non rimuove la cronologia disponibile e non dichiara cessato pericolo. Richiede una conferma esplicita separata.
- Radar opzionale insieme ai pin sulla mappa 2D: animazione, pausa, immagine più recente, orari e fonte. La riproduzione cambia solo il radar; le testimonianze mantengono i filtri scelti. Nessuna falsa sincronizzazione degli eventi con un'immagine passata. Guasti del radar non cancellano i pin grandine.
- Cinque zone private nell'account, coordinate arrotondate e raggio modificabile. Si ritrovano con lo stesso account sugli altri dispositivi. Conteggi indipendenti dai filtri della mappa: tutte le dimensioni/stati nelle ultime due ore, entro il raggio della zona.
- Avvisi nella vista, attivati esplicitamente: riconoscono nuovi post nelle zone seguite, deduplicano le aree sovrapposte e non notificano come nuovi eventi i post già conclusi. Non sono notifiche push; pagina chiusa o nascosta non monitora. Le impostazioni di attivazione degli avvisi rimangono nella sessione del browser.
- Link con località arrotondata: apre direttamente la zona condivisa. Il riepilogo riporta consultazione e filtri; il destinatario apre dati aggiornati con filtri standard, che possono differire. Condivisione manuale, copia e alternativa selezionabile.
- Lente grandine riceve, su invio manuale, anche i campi dichiarati: dimensioni, tempo osservato, fine riferita e conteggi dei riscontri. Niente nuove coordinate, identità o media. Informativa aggiornata prima dell'invio. Il modello non analizza il radar né certifica la misura; risposte non deterministiche.

## Migrazione e protezioni

`0010_new_madripoor.sql` è additiva: `hail_details`, relazione 1:1 con il post, e `hail_watches`, chiave composta account/slot. Nessun backfill o cancellazione dei dati esistenti. Post e dettaglio grandine vengono inseriti atomicamente. L'identità arriva dai normali header Sites, mai da un campo del client; origini, tipi, intervalli, proprietà e consenso sono verificati sul server. Le letture personali non hanno cache pubblica. Nuove coordinate arrotondate prima del salvataggio.

Nessun nuovo fornitore, chiave, costo Google o sistema di autenticazione. Google 3D resta predisposto ma disattivato; OpenAI già configurato viene conservato. Conservare le migrazioni applicate e la sorgente `dist/`, che è tracciata.

## Differenze ancora aperte

Non è stata completata la parità totale con Grandinometro: push a app chiusa, fascia silenziosa per push, accesso nativo Apple/Google/email, radar DPC e classificazione automatica del rischio richiedono ulteriori integrazioni o validazione. Il servizio di push attuale continua a dichiararsi non configurato. Le cinque zone e gli avvisi nella vista sono operativi senza simulare queste capacità.

Lettura limitata a 500 post nazionali recenti, indicata nell'interfaccia; le zone private possono quindi avere conteggi incompleti se il limite viene superato. Le coordinate sono approssimate, i nomi storici possono essere ambigui e i riscontri non provano la presenza sul posto. Non è dimostrato che nessun'altra app abbia le funzioni proposte.

## Verifica

Test su database isolati, transazioni reali SQLite e controller con DOM simulato. Coperti: input, consenso, arrotondamento, doppio invio, rollback, riscontri revocabili/esclusivi, scadenze, proprietà della fine, separazione account, cinque zone, link, dati vecchi/malformati, avvisi ripetuti, logout e risposte tardive. Verifiche di regressione per mappa, grandine, radar/Atlas, clima, feed e perimetro IA. Esito: 346 controlli superati (68 Grandine community, 16 zone/avvisi, 36 mappa grandine, 20 dossier grandine, 74 Lente, 49 Atlas, 42 Climate, 41 Network). Build di produzione riuscita e differenze controllate.

Nessun contenuto di prova pubblicato nel feed. Nessun test browser o su telefono fisico in questo intervento; non è una certificazione di accessibilità, accuratezza meteorologica o assenza di bug.
