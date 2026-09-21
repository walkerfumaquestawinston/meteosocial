# MeteoSocial — continuità del design Atmosfera

## 21 settembre 2026

Richiesta: ridisegnare sostanzialmente la mappa, avvicinandosi all'organizzazione di ARGOS senza copiarne asset o dati. Conservare la leggibilità e le funzioni meteo.

- dist/mappa-eventi.css: nuova cartografia navy, comandi in barra unica, indicatori termici, scheda locale e Lente. Grafica atmosferica con CSS; niente animazioni continue o nuove dipendenze GPU.
- dist/map-visuals.js: icone SVG originali e simboli meteo volumetrici da codice meteo. Il dato mancante usa un simbolo neutro.
- dist/map-land.js: geometria Natural Earth 50m e confini; country labels 110m. Due geometrie aggregate per evitare migliaia di layer. Import dinamico nella mappa.
- tools/generate-map-geography.mjs: rigenerazione riproducibile dal commit pubblico Natural Earth indicato. Dati in pubblico dominio, attribuzione in dist/assets/NATURAL-EARTH.txt.
- dist/mappa-eventi-controller.js: nuovi indicatori, etichette paesi subordinate alle città, lettura iniziale del luogo e gestione della posizione del riepilogo rispetto alla scheda.
- dist/map-weather-source.js + test-map-weather-source.mjs: recupero diretto se il server restituisce una copia vecchia anche con HTTP 200; fallback dichiarato se il provider non risponde. Verifica anche che non si raddoppino le richieste quando i dati sono freschi.
- dist/map-city-labels.js: rimangono disposizione anti-collisione, fallback geografico e priorità della selezione. Non sono garantite etichette per tutte le città: cercare o aumentare lo zoom.
- test-mappa.mjs: il vecchio controllo su un colore CSS preciso verifica ora la disponibilità della cartografia vettoriale.

51 suite attuali passate, sei legacy escluse dalla classificazione del runner. Browser desktop e mobile 390×844 verificati; nessun test fisico. Check GitHub include il nuovo test di recupero dei dati.

Non ampliare i permessi IA. Lente è su richiesta, senza autori o media, massimo tre scambi della stessa località; coordinate usate solo dal backend meteo, escluse dall'invio a OpenAI. Radar osservato e temporali da modello restano distinti.

Esito di GitHub e Sites: PROJECT_STATUS.md. Non cancellare dist e non sincronizzare il database locale con produzione. Node 24, pnpm 11.19.0, pnpm install --frozen-lockfile e pnpm build.
