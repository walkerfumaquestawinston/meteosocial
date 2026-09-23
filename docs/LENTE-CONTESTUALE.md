# Lente contestuale — 23 settembre 2026

L’utente autorizza il riuso della chiave OpenAI esistente per potenziare l’IA del sito. Segreti e fatturazione invariati.

## Funzioni

- Ingresso compatto nelle pagine normali: Oggi, Meteo, Community, Studio, redazione, segnalazione, Fit Check, ripari e pagine secondarie. Le mappe conservano i propri ingressi, senza sovrapporre nuovi pulsanti.
- Quattro attività: comprendere dati/fonti, organizzare orari e abbigliamento, confrontare racconti pubblici, preparare bollettini/didascalie/segnalazioni. Il singolo post resta isolato.
- Ogni attività conserva separatamente bozze e conversazione in memoria. Suggerimenti e cambio modalità non invocano API; l’utente preme Invia.
- Istruzioni server limitate a valori ammessi, distinzione dati/previsioni/racconti, orari locali, incertezze e bozze non pubblicate.
- Correzione: Lente seleziona acquireForecast quando è presente Rainbow o WeatherAPI. Prima la sola chiave Rainbow non bastava. Cita forecast.source, non sempre Open-Meteo.

## Limiti

Non è un nuovo modello, una certificazione dei dati o una lettura dei pixel radar. Lente non riceve nowcast/POH, media, bozze Studio o documenti privati automaticamente. Community: solo testi pubblici consentiti, massimo 12, non necessariamente il filtro visibile. Nessun invio o pubblicazione automatica. Autenticazione, quota 10 richieste nella finestra esistente, redazione coordinate e store:false conservati.

## Verifica

Build, suite esistenti e test estesi Lente/Rainbow. Browser locale desktop e 390 px; suggerimento compila senza inviare. La verifica locale non genera chiamate OpenAI reali e usa un profilo separato senza chiavi di produzione. Non audit completo accessibilità o certificazione meteorologica.
