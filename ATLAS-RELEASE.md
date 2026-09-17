# MeteoSocial — globo, mappa e meteo

Aggiornamento del 12 settembre 2026. Il sito mantiene community, account, foto, video, commenti, vocali e funzioni precedenti.

## Esperienza realizzata

- Nuova superficie chiara per globo, mappa, previsioni e guida. Il pianeta resta scuro per dare risalto alla Terra; i comandi hanno etichette, contrasto e dimensioni adatte al tocco.
- Terra 3D con fotografia geografica NASA Blue Marble del febbraio 2004. Non è una foto satellitare attuale. Etichette di 35 città, ricerca mondiale, selezione geografica, rotazione con trascinamento/frecce e zoom con pulsanti o gesto a due dita. Nomi densi vengono separati o raggruppati.
- Sette livelli condivisi: Meteo, Radar, Pioggia, Grandine, Segnalazioni, Vento, Nuvole. Le icone sono simboli delle previsioni, non nuvole osservate dal satellite.
- Radar RainViewer delle ultime due ore con scelta dell'immagine, ora, attribuzione e copertura. Non vengono inventate traiettorie o previsioni della grandine.
- Mappa OpenStreetMap tramite Leaflet; collegamento alla località in Google Maps.
- Meteo attuale con sole, luna, nuvole e precipitazioni 3D; schede 24 ore, sette giorni, variazione della massima, giornata con probabilità di pioggia minore e confronto tra città.
- “Quando uscire?” confronta intervalli diurni futuri secondo criteri dichiarati per passeggiata, bici e tempo all'aperto. Richiede dati completi a entrambi gli estremi, esclude temporali previsti e non certifica sicurezza.
- “Com'è davvero lì?” prepara una domanda per la community della città. Gli accessi IA preparano domande riferite alla vista corrente, senza inviarle automaticamente.
- Guida in quattro passaggi con fonti, unità, differenza tra previsione, radar e post.

## Confronto con altri prodotti

Consultate le fonti ufficiali; non sono state accertate classifiche di viralità o esclusività commerciale.

| Prodotto | Funzioni già documentate | Conseguenza per MeteoSocial |
| --- | --- | --- |
| [Windy](https://community.windy.com/topic/23730/be-one-step-ahead-with-the-advanced-features-of-windy-premium-en/6?page=2) | Globo 3D, radar, pianificazione di percorsi | Il 3D da solo non è una differenza competitiva. Va collegato alla scelta della zona e alle persone. |
| [Ventusky](https://apps.apple.com/us/app/ventusky-weather-maps-radar/id1280984498) | Globo, numerosi livelli e modelli, webcam e avvisi | Pochi livelli chiari, con fonte e significato sempre visibili. |
| [CARROT Weather](https://meetcarrot.com/weather/) | Personalità e umorismo nelle previsioni | Il roast può favorire la condivisione, ma non dimostra unicità. |

La direzione da validare è la continuità **previsione → momento per uscire → domanda alla community della zona**. Questa è una scelta di prodotto, non una promessa che nessun concorrente la offra.

## Dati e limiti operativi

- [Open-Meteo](https://open-meteo.com/en/docs): previsioni da modello e geocodifica. La richiesta delle 35 città è unica e ha cache pubblica di 10 minuti. Il client riusa il risultato per 10 minuti. “Aggiorna” aggiorna il client, ma rispetta la cache del servizio. Gli orari della città selezionata sono nel suo fuso; il confronto tra città riporta UTC.
- [RainViewer API](https://www.rainviewer.com/api/weather-maps-api.html): vengono usati soltanto `radar.past`, non nowcast. Ultima immagine oltre un'ora: errore esplicito. Massimo zoom nativo 7, oltre viene ingrandita la stessa immagine. L'ora è quella di composizione, non la data di ogni pixel. Le aree prive di copertura non sono dichiarate sicure.
- [Condizioni RainViewer](https://www.rainviewer.com/api.html): uso previsto per piccoli progetti/community, con attribuzione; un lancio commerciale o ad alto volume richiede di definire piano e accordo del fornitore. Analogo controllo sul piano Open-Meteo prima di scalare.
- [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/): tasselli caricati solo per la vista consultata, attribuzione visibile, nessun download offline o prefetch di città. Serve un fornitore adeguato per elevati volumi.
- Grandine e segnalazioni: massimo 200 contributi pubblici recenti. La grandine usa due ore, gli altri post 24 ore. Vengono esclusi post cancellati, scaduti, futuri e autori nascosti dall'utente. Vengono restituite solo città, categoria e date, senza testo o identità. Le coordinate rappresentano il centro della città, non un evento localizzato con precisione. Omonimie nei nomi liberi restano un limite del modello sociale esistente.
- IA: i collegamenti contestuali sono implementati. La generazione richiede il servizio IA configurato; non è resa operativa da un pulsante o dal modello usato per sviluppare l'app.
- Offline: la shell pubblica esistente resta disponibile tramite service worker. Previsioni e radar richiedono rete; i tasselli dei fornitori non sono archiviati offline.
- GPU: rendering su richiesta, senza rotazione automatica o loop continuo; risoluzione limitata, qualità ridotta con modalità leggera, risorse rilasciate quando si cambia vista. Nessuna misurazione termica o durata della batteria su telefoni fisici è stata effettuata.

## Architettura e controlli

`atlas.js` coordina stato e viste; `weather-tools.js` contiene regole deterministiche; `planet.js`, `weather-art.js` e `atlas-map.js` si occupano della grafica. `server/atlas.js` gestisce cache delle città e lettura minima delle segnalazioni. Il frontend non contiene chiavi segrete.

49 nuovi controlli automatici coprono coordinate, Mercatore, sorgenti e tempi del radar, condizioni mancanti, finestre diurne future, criteri per attività, filtri social, autori bloccati, cache e risposte errate. Restano i 132 controlli delle funzionalità precedenti. Le verifiche del browser controllano rendering, navigazione, fonti, ricerca geografica e impaginazione ridotta; non equivalgono a prove su dispositivi fisici o a un audit completo di accessibilità.
