# Mappa: primo intervento dopo il confronto competitivo

22 settembre 2026. Revisione successiva alla v91.

Barra del livello compatta con fonte, ora reale e anzianità. Il vecchio orologio del dispositivo non occupa più il primo piano. WeatherAPI resta separato nel pannello Adesso. Le etichette cartografiche aggiuntive sono limitate al luogo selezionato e ai valori recenti pertinenti; i nomi della cartografia e la ricerca restano disponibili.

Pannello: Adesso, fenomeno/prossime ore, Dal territorio, dettagli della fonte apribili. Eliminata la seconda testata con temperatura duplicata. In grandine un solo anello corrisponde al raggio scelto. I dettagli della fonte aperti sopravvivono agli aggiornamenti. Stati vuoti compatti; nessuna nuova fonte o quota a pagamento.

Diagnosi: la richiesta pubblica Open-Meteo con gli stessi parametri delle previsioni ha risposto 429, Daily API request limit exceeded. Non è dimostrato che tutte le indisponibilità storiche abbiano questa causa. L'acquisizione previsioni sospende nuove chiamate dopo 429 per almeno 15 minuti, rispettando Retry-After fino a 24 ore, nel singolo processo Worker. Le copie salvate restano disponibili. Non è un blocco globale distribuito e non ripristina la quota upstream; gli altri percorsi meteo conservano i propri controlli.

Verifica: compilazione, 69 suite superate; regressione aggiunta alla suite cronologia per 429, cambio località e ripresa dopo attesa. Anteprima desktop e telefono, radar grandine e ricerca. Nessuna promessa di dati al secondo o nuova accuratezza meteorologica.

Pubblicazione e identificativi nella successiva nota di esito in PROJECT_STATUS.md e RIPRENDI-QUI.md.
