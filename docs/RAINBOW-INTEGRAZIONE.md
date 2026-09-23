# Rainbow Weather

23 settembre 2026. L’utente ha salvato RAINBOW_API_KEY come segreto Sites (revisione 12), superando il precedente blocco del trasferimento automatico. Il segreto non è stato letto né copiato nei sorgenti.

## Implementazione

Rainbow ha priorità su WeatherAPI nei percorsi forecast/current, forecast e forecast/provider. Mappa, confronto città, Meteo, Oggi e Lente seguono il nuovo payload; i radar e i servizi specialistici restano separati. WeatherAPI resta configurata, ma non viene chiamata da questi percorsi quando Rainbow è configurato. Un fallimento mantiene eventualmente copie precedenti con fonte originale e marcatura offline.

Client server con chiave solo in header, redirect rifiutati, controllo unità/coordinate e timestamp. m/s convertiti in km/h; pressione al livello del mare separata dalla pressione al suolo. Cache D1 condivisa 15 minuti per luogo tra previsioni e mappa. Massimo 100 tentativi/ora e 5.000/mese da questa app; altri client possono consumare la quota dell’account. Nessun nuovo piano attivato.

Fusi geografici tz-lookup 6.1.25 e conversione Intl, verificati Roma/Tokyo. La temperatura per l’ora corrente è una previsione, non un’osservazione. Validità a intervallo ed emissione conservate. Nessun aggiornamento al secondo promesso.

I riepiloghi giornalieri sono aggregati delle ore disponibili: la giornata iniziale e finale possono essere parziali, dichiarato nella schermata Meteo e nel contesto Lente. Nubi, alba/tramonto, neve in cm, neve al suolo e zero termico rimangono null. Grandine senza temporale non viene convertita in codice temporalesco.

## Verifica

Build e 71 suite attive superate. Suite Rainbow ampliata: normalizzazione, fusi, quota, header, priorità provider, cache condivisa, errori senza segreti e validità delle stime sulla mappa. Pubblicazione e chiamate reali ancora in verifica; questa nota non certifica una risposta autenticata funzionante.

Nowcast minuto per minuto e Tiles Rainbow non ancora integrati. Radar esistenti invariati.

Documentazione: https://doc.rainbow.ai/api-ref/weather/
