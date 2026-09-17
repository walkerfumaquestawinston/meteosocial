# MeteoSocial · Globo, vicinanza e sfide

Aggiornamento del 12 settembre 2026. Prosegue il sito esistente e conserva account, post, segnalazioni e dati condivisi.

## Funzioni consegnate

- Globo più grande, texture terrestre NASA a maggiore risoluzione, transizione verso la città, zoom ampliato, percorso Terra → città → strade e controllo a schermo intero. Rimangono i livelli meteo e il rispetto delle animazioni ridotte. Non comprende edifici o terreno fotogrammetrico di Google Earth.
- Scheda vicinanza collegata ai livelli Pioggia e Grandine, e pagina Luoghi coperti. La posizione è quella selezionata; il pulsante GPS richiede una singola rilevazione esplicita. Le richieste cartografiche esterne arrotondano le coordinate a due decimali. La posizione GPS precisa non viene salvata nelle preferenze.
- Pioggia: distanza approssimata dall'eco radar colorato più vicino entro 50 km, a partire da 15 dBZ, con fonte, orario, risoluzione e copertura. Include precipitazioni nevose; non indica direzione o tempo d'arrivo. La successiva ora di pioggia prevista deriva separatamente da Open-Meteo (almeno 40% e 0,1 mm nelle successive 12 ore).
- Grandine: distanza approssimata dal centro della città indicata in un post recente, entro 100 km, con esclusione di post futuri o scaduti. Non è una localizzazione della grandine. Il tempo d'arrivo resta esplicitamente non disponibile.
- Luoghi cartografati e luoghi pubblici condivisi dalla community, ordinati per distanza in linea d'aria entro 5 km; selezione sulla mappa e indicazioni Google Maps a piedi/in auto. Ricerca parcheggi coperti e, nel filtro pedonale, biblioteche. Nessuna disponibilità, apertura o sicurezza viene dichiarata verificata.
- Community più leggera: tendenze apribili, argomenti selezionabili, città attive, spiegazione dell'ordine del feed e nascondi/ripristina post sul dispositivo. Tendenze calcolate sui contributi delle ultime 24 ore, rispettando i blocchi e contando anche persone distinte.
- Sfida settimanale “Atlante dei cieli”: una città, foto/video di osservazione o cielo sereno, massimo un contributo per giorno UTC e sette per settimana. Nessun punto per like o segnalazioni di pericolo. Classifiche effettive, pareggi, protezione dai duplicati e dai cambi squadra dopo il primo contributo. La cancellazione del post toglie il punto ma conserva la quota giornaliera consumata.
- Guida aggiornata e accessi contestuali all'assistente. Il servizio IA resta non configurato: queste scorciatoie non ne simulano l'attivazione.

## Scelte rispetto ai prodotti esistenti

Non è dimostrato che una funzione sia assente da tutte le altre app, né che il prodotto diventerà virale. La proposta da misurare è la continuità tra osservazione meteo, distanza documentata, luogo coperto e contributo sociale.

- [Windy](https://www.windy.com/articles/23730) offre già globo e numerosi livelli meteo; [Rain Alarm](https://www.rain-alarm.com/) offre avvisi di precipitazioni vicine. Non presentiamo queste funzioni come invenzioni esclusive.
- [Grandinometro](https://apps.apple.com/it/app/grandinometro/id6796001485) opera già sulle segnalazioni di grandine. Distinguiamo le segnalazioni degli utenti dalle misure certificate.
- Riprendiamo il controllo degli argomenti da [TikTok](https://support.tiktok.com/en/account-and-privacy/account-privacy-settings/manage-topics) e la chiarezza dei feed seguiti/cronologici descritta da [Instagram](https://about.fb.com/news/2022/03/two-new-ways-to-control-your-instagram-feed/), senza ripubblicare video esterni o creare conteggi artificiali.

## Dati e limiti operativi

- [RainViewer API](https://www.rainviewer.com/api/weather-maps-api.html), [colori](https://www.rainviewer.com/api/color-schemes.html): immagini storiche recenti, zoom 7, maschera di copertura, analisi circoscritta per limitare il lavoro del browser. Le immagini con oltre un'ora di ritardo vengono rifiutate; il risultato in memoria viene riesaminato dopo cinque minuti quando la vista si riattiva.
- OpenStreetMap tramite [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API), istanza Private.coffee: cache di sei ore per area arrotondata e categoria, limite applicativo di 80 nuove interrogazioni al giorno. È una capacità iniziale limitata: per maggiore traffico serve un servizio dimensionato o un indice OSM gestito. La ricerca esclude gli accessi privati noti, ma la cartografia può essere incompleta. Il provider ha dato risposte discontinue durante la prova; timeout e indisponibilità mantengono i luoghi della community e un collegamento di ricerca su Google Maps.
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/guide): percorsi verso la destinazione, senza includere l'origine GPS precisa nel collegamento. Non integriamo disponibilità in tempo reale dei parcheggi.
- Classifiche inizialmente sulle 35 città del catalogo. Le foto sono dichiarate dagli autori, non certificate tramite visione artificiale. Nessun premio economico o Storm Coin è assegnato da questo modulo.
- Non introdotti: ETA affidabili di grandine, radar proprietario, satelliti SOS, accesso a sensori auto, chiusura tapparelle, streaming multimodale o raccolta automatica di contenuti social. Richiedono dati, servizi e integrazioni specifiche.

## Struttura e verifiche

Moduli client: `nearby.js` e `nearby-tools.js`, `community-pulse.js`, `city-challenges.js`, `pulse.css`. Endpoint in `server/pulse.js`. Migrazione additiva `0005_round_drax.sql`, con unicità persona/settimana/giorno e indici per classifica. Le scritture richiedono identità, origine valida e quote; proprietà dei post e città sono controllate sul server. L'inserimento finale verifica nuovamente l'appartenenza alla squadra.

233 controlli automatici superati: atlas 49, network 41, pulse 44, stato ripari 8, worker 21, experience 7, sensory 14, refinements 11, social 38. Coprono distanze e antimeridiano, maschere radar, dati mancanti, autenticazione/CSRF/proprietà, classifiche, duplicati, scadenze, blocchi e risposte tardive durante cambi di città/filtro. La build verifica anche la sintassi dei moduli client prima di incorporare gli asset.

Prova nel browser su desktop e viewport 390×844: globo, livelli, ricerca ripari, cambio pioggia/grandine, filtri community, sfide e contrasto. Distanza da echi radar verificata con dati reali; errore del provider dei luoghi riprodotto e presentato correttamente. Il video di prova locale conservato nel database non aveva più il relativo oggetto nell'archivio temporaneo dopo il riavvio; nessun post di test è stato creato sul sito pubblico. Non sono test su telefoni fisici, né una certificazione completa di accessibilità o di affidabilità in emergenza.
