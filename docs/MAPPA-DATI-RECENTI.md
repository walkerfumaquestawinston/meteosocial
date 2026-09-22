# Mappa affiancata e dati recenti — 22 settembre 2026

## Richiesta e limite di spesa

Copertura mondiale, massimo 50 euro al mese per i dati. Mappa e pannello dettagliato sempre affiancati; sul telefono verticale entrambi visibili in due aree sovrapposte verticalmente, senza sovrapporre la scheda alla cartografia. L'utente non approva il precedente layout v85. Non è stato attivato alcun abbonamento né sostituito il fornitore.

## Difetto riprodotto

La risposta pubblica `/api/mappa/meteo` restituiva `stale:true`, 500 comuni e valori validi alle 03:15 UTC, mentre erano disponibili valori delle 05:45 UTC per alcune città. `weatherPoints` dava precedenza al catalogo italiano indipendentemente dall'orario. Il problema non era risolvibile cambiando soltanto il colore o scrivendo “live”. Il motivo dell'insuccesso del recupero originario non è stato isolato nei log del fornitore; nessuna attribuzione certa a rate limit o timeout.

Correzione: in caso di duplicati prevale il timestamp più recente; anche l'etichetta della località selezionata conserva questa precedenza. Le stime con più di 30 minuti, orari mancanti o futuri oltre 5 minuti non alimentano colori e riepiloghi del meteo attuale. Il nome resta consultabile e i dettagli conservati sono esplicitamente precedenti. La soglia di 30 minuti è una scelta dell'app, non una garanzia meteorologica.

Il client non carica più i 500 comuni a ogni controllo: dopo il catalogo geografico richiede al massimo 24 comuni visibili. L'endpoint accetta solo codici ISTAT esistenti, rifiuta liste oltre il limite, ordina/deduplica le chiavi e riusa la cache condivisa. Una vista senza comuni non interroga il fornitore. Le nuove copie di cache del riquadro scadute da due giorni vengono ripulite; non si toccano profili, report o archivi delle previsioni. Il vecchio endpoint completo resta compatibile con i suoi altri utilizzatori.

## Interfaccia

Cartografia e pannello hanno spazi separati. Su desktop il pannello destro mostra subito meteo locale e prossime ore, con dettaglio di ogni ora, riepilogo del cambiamento, osservazioni, ripari e Lente. Selezionare una città aggiorna il pannello; la vecchia scheda della località rimane in Strumenti. Nuovi marker chiari, strade con colori originali e accento azzurro.

La barra distingue l'orologio del dispositivo (secondi), l'orario della stima e l'età del dato, e infine l'ultimo controllo. I timestamp dei dettagli sono convertiti dall'UTC al fuso del dispositivo con etichetta; il pannello delle previsioni dichiara il fuso della località. Nessun timestamp viene riscritto all'ora corrente per far sembrare fresca una copia.

## Fonti a pagamento verificate

Ricerca sulle pagine ufficiali il 22 settembre 2026. Prezzi in valuta del fornitore, senza conversione o imposte presunte. Nessuna prova di accuratezza comparativa è stata eseguita.

| Servizio | Evidenza utile | Limite per questa richiesta |
| --- | --- | --- |
| [WeatherAPI](https://www.weatherapi.com/pricing.aspx) | Starter 7 USD/mese, 3 milioni di chiamate; Pro+ 25 USD/mese, 5 milioni. Copertura mondiale; condizioni correnti dichiarate ogni 10–15 minuti. | Non dati nuovi ogni secondo. Il Pro+ non promette una maggiore frequenza rispetto allo Starter. Prima di acquistare, provare freschezza e copertura sulle località effettive. |
| [Open-Meteo](https://open-meteo.com/en/pricing) | Endpoint commerciale dedicato e capacità riservata. [Documentazione](https://open-meteo.com/en/docs): condizioni correnti basate su dati di modello a passi di 15 minuti. | Pagare la capacità non trasforma una stima in misura da stazione. Prezzo finale non verificato nella pagina restituita: nessuna dichiarazione di rientro nei 50 euro. |
| [Tomorrow.io](https://www.tomorrow.io/weather-api/) | Piano Enterprise su preventivo, dati a risoluzione al minuto tra le capacità offerte. | Non verificato entro 50 euro/mese. Risoluzione temporale della previsione diversa dalla frequenza delle nuove osservazioni. |

Il [radar RainViewer](https://www.rainviewer.com/api/weather-maps-api.html) espone due ore di quadri a intervalli di 10 minuti; il timestamp è quello di generazione del composito, non di tutti i singoli radar. Copertura radar non uniforme sul globo. Nessun servizio esaminato documenta osservazioni mondiali nuove ogni secondo entro questo budget.

Passo successivo per un eventuale acquisto: prova controllata di WeatherAPI Starter, verifica timestamp, località e condizioni contrattuali, poi attivazione nell'account del proprietario e chiave conservata nel server. Non chiedere chiavi in chat e non inserirle nel browser o nel repository. Non comprare Pro+ soltanto sperando in aggiornamenti più rapidi.

## Verifica

Build e 66 suite attive superate; cinque contratti storici ritirati. Regressioni provate: confronto dei timestamp, assenza/futuro, precedenza della selezione, endpoint limitato a 24 comuni e nessuna richiesta per lista vuota. Browser locale su desktop e 390/320 px; ricerca Tokyo, fuso Asia/Tokyo, cambio livello, radar, pannello sempre visibile. Nessun test fisico o certificazione completa di accessibilità. Pubblicazione e identificativi sono nelle note di ripresa.

## Collegamento WeatherAPI predisposto, non attivo

Su richiesta dell’utente è aperta la registrazione WeatherAPI. Starter costa 7 USD/mese, Pro+ 25 USD/mese; budget indicato 50 EUR/mese, copertura mondiale. Entrambi aggiornano il meteo attuale ogni 10–15 minuti. Nessun pagamento o account completato dall’agente. La scelta finale del piano resta all’utente, che ha chiesto il confronto.

Il server espone /api/forecast/current?lat=...&lon=... e usa solo il segreto runtime WEATHERAPI_KEY. Senza chiave risponde not-configured e non fa richieste al fornitore. Configurare in Sites come secret e ridistribuire una versione salvata. Non inserire la chiave in Git, bundle, URL del browser o note.

Il pannello della mappa aggiunge condizioni attuali, temperatura percepita, vento/raffiche, umidità, pressione, visibilità, UV e PM2,5 quando disponibili. Timestamp UTC del fornitore convertito nel fuso locale; controllo distinto dall’orario del dato. I dati oltre 30 minuti o futuri sono marcati precedenti. Previsioni/colore della mappa restano Open-Meteo e radar RainViewer, esplicitamente attribuiti: non è stata sostituita ogni fonte con WeatherAPI.

Cache condivisa di un minuto per località e limite server globale di 3.000 chiamate/ora (massimo teorico 2.232.000 in 31 giorni, esclusi usi della stessa chiave fuori da questa app). Mancanza chiave, errori/quota e cache precedente non bloccano le previsioni. Non dichiarare l’integrazione attiva o verificata sul fornitore fino alla configurazione e prova con una vera chiave. Nessuna promessa di stazione vicina o misure al secondo.

Documentazione: https://www.weatherapi.com/docs/ e https://www.weatherapi.com/pricing.aspx . Test dedicato con risposte simulate per chiave assente, quota, zero/mancante, fusi, dati vecchi/futuri, escape e assenza di segreti negli errori.

## Attivazione completata

Il proprietario ha acquistato Starter; confermato nel dashboard del fornitore. Segreto configurato in Sites revisione 8 e applicato alla versione 86. Endpoint reale provato per Roma e Tokyo; pannello pubblico verificato. La nota precedente descrive lo stato prima dell’acquisto. La testata locale dà ora priorità ai dati WeatherAPI disponibili; dettagli/previsioni conservano la propria attribuzione.
