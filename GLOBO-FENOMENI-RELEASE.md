# Fenomeni sul globo satellite — 15 settembre 2026

Estensione della versione 23, sorgente `2f2f9683dd9664b003eef328c6e5aaeefd3b73dc`. Pubblicare sul medesimo progetto Sites; verificare il numero corrente e il completamento della pubblicazione nel servizio.

## Comportamento implementato

Il Google 3D già configurato riceve simboli geografici cliccabili con valori e una scheda dettagliata. Filtri: tutti, meteo, pioggia/neve, vento, nuvole, grandine segnalata, eventi naturali e allerte della località selezionata. Un elenco accessibile permette di scegliere ogni punto anche quando le etichette si sovrappongono sul pianeta; selezionandolo la camera si avvicina. I comandi satellite, selezione di località e apertura manuale rimangono disponibili.

- Open-Meteo: punti nelle 35 città del catalogo esistente più il punto selezionato quando il suo meteo è disponibile. Temperatura, precipitazioni, neve, vento con freccia verso cui soffia, raffiche e copertura nuvolosa. Dati di modello, non sensori istantanei né copertura continua del pianeta. Valori più vecchi di tre ore esclusi; orario convertito correttamente in UTC.
- Grandine: endpoint esistente, segnalazioni nelle ultime due ore non terminate/scadute, solo quando una posizione approssimata è stata condivisa esplicitamente. Riscontri discordanti visibili. Nessuna deduzione di grandine dalla sola pioggia, nessun punto inventato dal nome di una città. Fino a 500 segnalazioni; limite dichiarato. Nessun autore, foto o testo dei post inviato al renderer Google.
- NASA EONET: nuovo endpoint fisso `/api/atlas/events`, catalogo di massimo 100 eventi aperti con ultima geometria puntuale valida negli ultimi sette giorni. Categorie tra cui tempeste, incendi, alluvioni e vulcani. Stato aperto e data del catalogo non confermano attività in questo istante, copertura globale completa o latenza zero. Poligoni non convertiti arbitrariamente in punti.
- DPC: eventuale allerta gialla, arancione o rossa per la località selezionata, distinta dagli eventi osservati. Bollettino di rischio previsto; nessun simbolo di “zona sicura” in assenza di allerta.

Aggiornamento in primo piano: grandine ogni 30 secondi, catalogo meteo/eventi e bollettino ogni 10 minuti; pulsante manuale Aggiorna dati. Orari e fonti nei dettagli. Dati non leggibili o fonti indisponibili diventano avvisi. Le aree vuote non indicano assenza di fenomeni. Alla chiusura del globo le richieste vengono fermate e le risposte tardive della community ignorate.

## Limiti da non presentare come completati

Si tratta di simboli e valori puntuali, non di texture radar sul terreno, nubi volumetriche o vento continuo animato. Il radar animato delle precipitazioni mantiene la propria mappa dedicata e il collegamento dalla vista. Le immagini satellite Google non sono immagini meteo in diretta. Non c'è una rete mondiale di rilevamento grandine, né un elenco completo di ogni evento in corso. L'IA non genera né certifica questi dati.

Le etichette Google possono essere nascoste dalle collisioni: zoom ed elenco consentono di raggiungere i punti. Errori dei simboli non eliminano il globo satellite e lasciano consultabile l'elenco. La posizione approssimata delle segnalazioni viene mostrata sulla mappa Google richiesta dal proprietario, nel rispetto dei filtri del servizio esistente.

## Verifiche

Build Worker completata. 179 controlli automatici con fixture isolate: 22 trasformazioni/fonti/cancellazione, 25 renderer satellite, 41 controller Google, 42 clima, 49 atlante. Controllate inserzione effettiva dei marker nella mappa simulata, coordinate, filtri, scadenze, direzione vento, UTC, click, fonte non disponibile, separazione degli errori e riuso di una sola mappa. Nessuna prova di questa nuova grafica nel browser Google reale; disponibilità e contenuto dei feed in produzione restano dipendenti dalle fonti.

Riferimenti tecnici: https://developers.google.com/maps/documentation/javascript/reference/3d-map-draw · https://eonet.gsfc.nasa.gov/docs/v3 · https://open-meteo.com/en/docs

Nessuna nuova chiave, modifica di fatturazione, migrazione dati o sincronizzazione delle cartelle del PC. Codice e istruzioni salvati nel progetto online esistente; dal PC principale aprire lo stesso sito/account.
