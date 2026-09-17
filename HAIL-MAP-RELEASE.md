# Grandine sulla mappa — 13 settembre 2026

Ripresa dalla sorgente online 18. Richiesta: grandine aggiornata direttamente sulla mappa e comprensibile a tutte le età.

## Consegnato

- Accesso dalla Home e dal quadro Grandine chiara alla route `#grandine-mappa`. Il livello Grandine è disponibile anche nella mappa e nel globo esistenti.
- Pin con simbolo ◇, nome della zona, numero di segnalazioni e tempo trascorso dall’ultima. Il simbolo indica il fenomeno dichiarato, non una severità meteorologica.
- Aggiornamento ogni 30 secondi con livello aperto e scheda visibile, ritorno dal background e comando manuale. Nessuna promessa di latenza zero o notifica a app chiusa. Snapshot oltre 90 secondi o errore di rete: stato esplicito e rimozione dei pin correnti.
- Filtri condivisi da pin ed elenco: ultimi 15, 60 o 120 minuti; 25/50 km dal punto selezionato oppure tutte le zone disponibili. Le distanze sono approssimate e non calcolano direzione o arrivo del temporale.
- Pin ed elenco aprono gli stessi post originali per leggere e rispondere. Collegamenti a Lente, quadro completo, bollettini e radar mantenuti accessibili.
- Segnalazione rapida: possibilità facoltativa e non preselezionata di aggiungere la zona scelta alla mappa. La conferma viene verificata dal server, che arrotonda le coordinate prima di conservarle. Il cambio del comune nel form disattiva la zona precedente.
- I nuovi post con zona possono essere rappresentati anche fuori dal catalogo di città. Per i vecchi post con un nome nel catalogo si mostra esplicitamente il centro della città dichiarata. Gli altri restano in elenco senza posizione: non vengono collocati arbitrariamente.
- Lettura dedicata solo alla grandine: post di altri fenomeni non occupano il campione. Massimo 500 segnalazioni recenti con indicazione del limite. Esclusi post futuri, scaduti, eliminati e autori bloccati; nessun identificativo autore nel nuovo endpoint della mappa.

## Confronto utilizzato

Le recensioni pubbliche di Grandinometro chiedono maggiore chiarezza grafica e migliore monitoraggio delle zone preferite. Le note dello sviluppatore dichiarano già risolti problemi di filtri sincronizzati, accesso al radar e rappresentazione della card di rischio. Questi difetti non vengono presentati come ancora presenti nel concorrente. Sono spunti per rendere coerenti filtri, orari e stati della nostra mappa. Fonte consultata il 13 settembre 2026: [App Store](https://apps.apple.com/it/app/grandinometro/id6796001485). Nessuna prova hardware dell’app concorrente o verifica delle sue notifiche.

Difetto concreto individuato in MeteoSocial: il vecchio livello associava i post soltanto al piccolo catalogo di città e alla città scelta, usando un campione misto di 200 post. La nuova lettura dedicata, le zone facoltative e l’elenco senza posizione rendono visibile questo limite e ampliano la copertura senza geocodifiche arbitrarie.

## Dati e migrazione

Due colonne intere nullable `posts.map_lat` e `posts.map_lon`, centesimi di grado. Migrazione additiva Drizzle `0009_needy_sersi.sql`; nessun backfill, cancellazione o modifica delle migrazioni applicate. Pubblicazione post e zona in un singolo INSERT. Coordinate fuori intervallo, stringhe numeriche e consenso assente sono rifiutati; una ripetizione dello stesso post non ne modifica la zona.

La zona è dichiarata, non rilevamento verificato dell’impatto o prova della presenza fisica. Lente mantiene il perimetro precedente: niente nuove coordinate o media inviati a OpenAI. Il radar resta osservazione delle precipitazioni, non un rilevatore certificato di grandine. Le omonimie dei vecchi nomi città non sono risolte automaticamente.

## Verifiche

146 controlli superati: Hail map 36, Atlas 49, Grandine chiara 20, Network 41. Database isolati, inserimento reale nelle tabelle di prova, consenso e arrotondamento, lettura anonima, filtri geografici/temporali, dati mancanti, scadenze, blocchi, cancellazioni e limite del campione. Controller di aggiornamento verificato con API simulate: avvio, nuovo dato ogni ciclo, sospensione in background, ripresa, errore e recupero.

Build di produzione con controllo sintattico dei moduli e migrazione ispezionata. Nessun post di prova pubblico. Non effettuati nuovi test browser, su dispositivi fisici o con lettori di schermo; non è una certificazione di accessibilità.
