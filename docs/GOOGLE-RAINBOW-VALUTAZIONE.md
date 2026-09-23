# Google Weather e Rainbow — 23 settembre 2026

L'utente propone Google Weather API, Rainbow Nowcast e Rainbow Tiles per MeteoSocial. Conferma fatturazione Google Cloud in Italia; account Rainbow non ancora creato. Nessuna nuova API configurata o spesa attivata in questa verifica. WeatherAPI resta il fornitore operativo della versione 96.

Fonti ufficiali verificate:
- https://developers.google.com/maps/billing-and-pricing/pricing?hl=it : Weather Usage 10.000 eventi gratuiti/mese; prima fascia successiva 0,15 USD/1.000.
- https://developer.rainbow.ai/ : Nowcast 5.000 richieste gratuite/mese poi 0,10 USD/1.000; Tiles 30.000 tile gratuite/mese poi 0,20 USD/1.000. Nowcast fino a quattro ore, risoluzione un minuto, aggiornamento dieci minuti; copertura globale dichiarata, dati radar/satellite e modello.
- https://cloud.google.com/terms/maps-platform/eea/maps-service-terms : paragrafo 23 per SEE: valore indipendente oltre al meteo Google; current e forecast orari conservabili un'ora, forecast giornalieri 24 ore. Public Weather Alert non utilizzabile con alcuna mappa. Non applicare genericamente il divieto extra-SEE di app principalmente meteo a un account italiano.
- https://developers.google.com/maps/documentation/weather/policies : attribuzioni da implementare e dati Google visivamente distinti.
- https://doc.rainbow.ai/ : autenticazione mediante Ocp-Apim-Subscription-Key. Configurare lato server; non chiedere chiavi in chat.

Prima dell'attivazione: account e credenziali, verifica capacità e licenze applicabili, attribuzioni, cache separata con scadenze Google (la cronologia permanente attuale non è riutilizzabile invariata), contatori e limiti richieste. Conservare radar osservato separato da previsione nowcast. Google non garantisce da solo temperature esatte: confrontare campioni contemporanei con stazioni attendibili, stessa località/orario, prima di sostituire WeatherAPI.

Esempio mensile, non previsione di traffico: 100.000 richieste Google = 13,50 USD; 100.000 Nowcast = 9,50 USD; 100.000 tile = 14 USD. Totale 37 USD prima di imposte/cambio e degli abbonamenti esistenti. Una vista mappa/animazione carica molte tile: non sono 100.000 aperture del sito.

Lavoro a PC spento: questa sessione e le automazioni di progetto sono locali. Documentazione ufficiale https://learn.chatgpt.com/docs/automations?surface=app richiede macchina accesa e app aperta. https://learn.chatgpt.com/docs/cloud descrive ambienti cloud con repository collegato. Nessuna attività cloud o automazione è stata creata: non promettere lavoro autonomo a PC spento. Il sito pubblicato resta online indipendentemente dal PC.
