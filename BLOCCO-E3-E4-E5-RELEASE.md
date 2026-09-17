# E3/E4/E5 — polline, mare, quota neve

Adattamento approvato dall’utente dopo verifica: preferenza allergia assente, nessun calcolo distanza costa, quota neve non inclusa nei dati ordinari. Nessuna riscrittura di globo, geometria o navigazione.

## Funzioni
- Profilo: scelta facoltativa «Sono allergico», conservata solo nel browser. Non memorizziamo un profilo sanitario sul server. Solo se attiva viene richiesta la previsione pollini.
- Righe senza card aggiunte a Oggi, Globo e Meteo. Pollini elevati in base alle soglie per famiglia botanica della Provincia autonoma di Bolzano: graminacee >30, betulla/ontano >50, olivo/artemisia/ambrosia >25 granuli/m³. Classificazione indicativa applicata a previsioni orarie CAMS: non è una misura certificata né un rischio clinico individuale. Livelli bassi nascosti; dati mancanti o parziali dichiarati.
- Mare: attivo entro 15 km dalla costa cartografica, con onde, periodo/direzione e temperatura superficiale se disponibili. Eventuale ora futura con onde >=2,5 m mostrata come previsione, non allerta. Nessun «vento da terra» dedotto senza orientamento affidabile della spiaggia.
- Neve: novembre–marzo, usa esclusivamente snowfall_height DWD ICON con precipitazioni previste entro 24 ore. Quota arrotondata a 100 m, quota del punto nel modello e orario. Se manca, dichiarato. Non usa freezing_level_height e non inventa percorsi/obblighi stradali.
- Cache condivisa D1 15 minuti con funzione esistente. Dati vecchi/fonte fallita dichiarati; non trasformati in consigli attuali. Nessuna nuova migrazione né chiave necessaria.

## Copertura e limiti
- Costa Natural Earth 1:10m, dominio pubblico, estratto geografico Italia e mari adiacenti (5645 segmenti). La distanza è cartografica approssimata; non misura catastale/GPS. Fuori dall’area 34,5–48,5 N e 5,5–19,5 E il mare contestuale non viene mostrato.
- Mare: modello marino su cella di mare, non condizioni della singola spiaggia, balneabilità o indicazioni di navigazione.
- Pollini: copertura europea e stagionale di CAMS, valori/soglie non predicono i sintomi. Nessun consiglio medico personalizzato o orario fisso per chiudere le finestre.
- Quota neve dipende dalla copertura della fonte. Settembre: riga volutamente assente. Necessari dati originali e precipitazioni; nessuna stima arbitraria dallo zero termico.
- Non aggiunto cron, push ufficiale o geolocalizzazione automatica. Le API restano soggette a disponibilità, quote e condizioni del fornitore già utilizzato.

## File
- dist/local-weather-rules.js: selezione ore e regole su dati validi, soglie, stagionalità.
- dist/local-weather.js: righe contestuali, preferenza pollini, stati assente/parziale/non aggiornato.
- dist/main.js: inserimento e collegamento delle righe e del controllo Profilo.
- server/local-coast.js: estratto costa con fonte e hash originale, solo lato server; nessun peso aggiunto al globo/browser.
- server/local-weather.js: distanza costa e tre letture indipendenti con cache.
- server/worker.js: instradamento delle sole letture.
- build.mjs: inclusione moduli; dist/server/index.js generato.
- dist/sw.js: shell v39 e nuovi moduli disponibili offline. Le nuove fonti richiedono comunque rete; se mancano viene dichiarato.
- test-local-weather.mjs: soglie, null, distanza costa, cache, stagione, quota neve reale, coordinate errate.
- PROJECT_STATUS.md, PROJECT_VISION.md, RIPRENDI-QUI.md e queste note: continuità.

## Verifiche
- Test locale con database isolato superato, senza scritture di prova in produzione.
- Richieste reali indipendenti per San Benedetto: le tre fonti hanno restituito 24 valori orari per ciascuna variabile richiesta, compresa snowfall_height. Questo controllo non forza l’esposizione della neve fuori stagione.
- Build e diff check superati. Non certificata una prova su telefono fisico.

## Fonti
- https://open-meteo.com/en/docs/air-quality-api
- https://open-meteo.com/en/docs/marine-weather-api
- https://open-meteo.com/en/docs/dwd-api
- https://ambiente.provincia.bz.it/it/aria/intervalli-concentrazione
- https://www.naturalearthdata.com/about/terms-of-use/
- https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_coastline.geojson

Fermarsi prima del prossimo blocco H1/H4. I limiti G2 (avvisi prima dell’uscita e allerte automatiche senza scheduler) restano aperti e non sono modificati qui.
