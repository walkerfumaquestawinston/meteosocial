# Rainbow Weather

23 settembre 2026. L’utente ha salvato RAINBOW_API_KEY come segreto Sites (revisione 12), superando il precedente blocco del trasferimento automatico. Il segreto non è stato letto né copiato nei sorgenti.

## Implementazione

Rainbow ha priorità su WeatherAPI nei percorsi forecast/current, forecast e forecast/provider. Mappa, confronto città, Meteo, Oggi e Lente seguono il nuovo payload; i radar e i servizi specialistici restano separati. WeatherAPI resta configurata, ma non viene chiamata da questi percorsi quando Rainbow è configurato. Un fallimento mantiene eventualmente copie precedenti con fonte originale e marcatura offline.

Client server con chiave solo in header, redirect rifiutati, controllo unità/coordinate e timestamp. m/s convertiti in km/h; pressione al livello del mare separata dalla pressione al suolo. Cache D1 condivisa 15 minuti per luogo tra previsioni e mappa. Massimo 100 tentativi/ora e 5.000/mese da questa app; altri client possono consumare la quota dell’account. Nessun nuovo piano attivato.

Fusi geografici tz-lookup 6.1.25 e conversione Intl, verificati Roma/Tokyo. La temperatura per l’ora corrente è una previsione, non un’osservazione. Validità a intervallo ed emissione conservate. Nessun aggiornamento al secondo promesso.

Richiesta supportata: forecast_hours=24, forecast_days=7, day_start_hour=0. I riepiloghi giornalieri usano minime, massime e totali del fornitore con intervalli espliciti; solo in assenza di daily si aggregano le ore disponibili dichiarando giornate parziali. Nubi, alba/tramonto, neve in cm, neve al suolo e zero termico rimangono null. Grandine senza temporale non viene convertita in codice temporalesco.

## Verifica

Build e 71 suite attive superate. Suite Rainbow ampliata: normalizzazione, fusi, quota, header, priorità provider, cache condivisa, errori senza segreti e validità delle stime sulla mappa. v101 pubblicata e chiamate autenticate verificate: Roma, Tokyo e San Benedetto restituiscono Rainbow con offline=false. UI Meteo verificata con fonte Rainbow e previsione oraria; build e CI 35835762024 riuscite. Non certifica accuratezza meteorologica o carico reale.

## Nowcast e mappe precipitazioni — attivi dalla v102

Nowcast globale: /nowcast/v1/precip-global, intensità mm/h e tipo pioggia/neve/mista/nessuna precipitazione. Intervalli originali da 60 secondi, fino a 4 ore. Grafico e cursore minuto per minuto in Meteo e nel pannello Pioggia della mappa. Non è probabilità, non è grandine, non è osservazione al secondo. La risposta non espone un’emissione: mostriamo ora del controllo e validità senza inventarla.

Tiles globali: /tiles/v1/snapshot?layer=precip-global e /tiles/v1/precip-global. Proxy stesso sito con chiave solo in header server; URL pubblici senza chiave. 37 quadri da -2 ore a +4 ore, intervalli di 10 minuti, apertura sul quadro di base. Analisi e previsione etichettate separatamente. RainViewer se il catalogo Rainbow fallisce; pulsante alternativo se mancano immagini. POH Italia resta indipendente.

Protezione app: cache persistente JSON 5 minuti; tile cache pubblica 30 minuti ove disponibile; richieste concomitanti condivise. Nowcast 100 tentativi/ora e 5.000/mese; Tiles incluse richieste catalogo 1.500/ora e 30.000/mese. Questi contatori coprono questa app, non ogni client dell’account. Nessun piano nuovo. Nessun traffico di animazione in background.

Validazione: 72 suite attive passate (5 storiche ritirate), nuovo test-rainbow-rain.mjs su intervalli, lacune, dati vecchi, proxy, limiti e assenza di credenziali nelle risposte. Build e anteprima locale aggiornate; il percorso locale usa fixture nei test e non contiene la chiave reale. v102 pubblicata con risposte reali HTTP 200: Roma e Tokyo 240 intervalli da 60 secondi; Tokyo include pioggia (circa 3,70 mm/h al primo campione di prova). Snapshot 1790151600 e PNG quadro base / +10 minuti ricevuti correttamente (28.703 e 28.631 byte). Browser: San Benedetto 240 minuti, cursore fino alle 14:29; mappa +240 minuti con immagini visibili. Valori di verifica del 23 settembre, non da fissare nel prodotto. v103 corregge attribuzione fonte e distingue il tempo futuro dall’errore di timestamp, migliora contrasto legenda e pulsante Adesso. CI 35837766567 riuscita. Controllo DOM a 390 px senza overflow orizzontale; non certificazione su dispositivi fisici.

Fonti ufficiali consultate: https://doc.rainbow.ai/api-ref/nowcast/ , https://doc.rainbow.ai/api-ref/tiles/ , https://doc.rainbow.ai/tile_colors/ , https://developer.rainbow.ai/ .

Documentazione: https://doc.rainbow.ai/api-ref/weather/
