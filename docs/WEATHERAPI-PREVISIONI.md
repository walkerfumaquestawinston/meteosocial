# WeatherAPI: previsioni e richieste condivise

22 settembre 2026, revisione dopo la v92. Usa il segreto WeatherAPI esistente; nessun acquisto.

## Percorsi aggiornati

Con WEATHERAPI_KEY presente, /api/forecast acquisisce sette giorni tramite forecast.json. Oggi, Meteo, prossime ore della mappa e Lente usano questa previsione. L'attribuzione segue il payload, incluse le vecchie copie Open-Meteo. Il cambio di fornitore non viene presentato come variazione meteorologica. Senza chiave resta il percorso Open-Meteo usato anche nell'anteprima locale.

Current conditions: cache persistente cinque minuti; previsioni: quindici minuti e blocco condiviso tramite globe_snapshots. Chiave solo sul server. Il limite esistente di 3.000 chiamate/ora è condiviso con le previsioni; contatore mensile con soglia protettiva 2,4 milioni. Sono richieste dell'app, non una lettura dei consumi effettivi del conto WeatherAPI. Le copie già scaricate restano leggibili quando il limite blocca nuove chiamate.

Mappa con WeatherAPI: massimo otto punti della vista, richieste sequenziali e cache client cinque minuti. Un nuovo movimento interrompe i successivi punti della vecchia sequenza; una richiesta già in viaggio può completarsi. Attesa 650 ms dopo lo spostamento; niente caricamento del catalogo mondiale o dei 24 comuni Open-Meteo. Controlli sospesi a pagina nascosta. Il confronto città si carica solo aprendolo.

## Equivalenze e limiti

Campi normalizzati per il contratto esistente. Temperature °C, vento km/h, visibilità km→m, precipitazioni mm e neve cm. Epoche UTC conservate per le ore; visualizzazione nel fuso del luogo. Codici di condizione ricondotti alle categorie supportate; sconosciuti restano null. Temporali non diventano grandine. Quantità attuali senza intervallo noto, neve al suolo, zero termico e pressione al suolo restano null. Il vento orario WeatherAPI è massimo, non medio; nota nel dettaglio. Nessuna previsione sintetica oltre i giorni restituiti.

Radar RainViewer e Radar-DPC invariati. I percorsi secondari storici (confronti del mattino, domanda giornaliera, mare/pollini e altre integrazioni specialistiche) mantengono le rispettive fonti Open-Meteo. Non dichiarare l'app completamente indipendente da Open-Meteo o dati nuovi ogni secondo. Non introdotto monitoraggio in background, dashboard amministrativa dei consumi o nuovo abbonamento.

Verifica: suite adapter/API dedicata, cache e quota mensile, cronologia/fallback, UTC/Tokyo, alba polare mancante, zero/null, conversioni e attribuzione. Test completi e riscontro produzione nelle note di rilascio.

Fonti: https://www.weatherapi.com/docs/ e https://www.weatherapi.com/pricing.aspx (consultate 22 settembre 2026).
