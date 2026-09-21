# MeteoSocial — continuità del design Atmosfera

## Osservatorio locale — aggiornamento successivo del 21 settembre

- `dist/map-field-desk.js`: pannello per fenomeno, osservazioni, raggi 25/50/100/150 km, anelli Leaflet, ricerca ripari e link di navigazione. Cache limitata, richieste simultanee deduplicate, token per evitare risposte applicate alla località/pannello sbagliati. Distruzione di layer e timer al cambio pagina.
- `dist/map-field-core.js`: configurazioni e domande IA per i cinque fenomeni, ore future nel fuso IANA, valori null distinti da zero, filtri temporali e distanza con antimeridiano.
- `dist/map-field.css`: strumenti con colore/icona/testo distinti, scheda locale compatta, pannello richiudibile su mobile. Niente animazione GPU continua. Il globo non è stato sostituito.
- `server/atlas.js`: GET `/api/atlas/field-reports` con layer, lat/lon e radius fino a 150. Recupera solo osservazioni recenti, non eliminate/non scadute, geolocalizzate volontariamente, rispettando i blocchi. Campione limitato e flag truncated; nessun autore o media restituito.
- `server/worker.js`, `server/network.js`: aggiunti tipi Temperatura/Fulmini e geolocalizzazione volontaria per i cinque fenomeni; riusa posts e coordinate già arrotondate, senza nuova tabella. La pubblicazione rapida dura due ore.
- `server/pulse.js`: la query OSM comprende parcheggi coperti, sotterranei, multipiano e garage; a piedi biblioteche, centri civici, municipi. Mantiene limite upstream di 80 ricerche/giorno, cache 6 ore e coordinate arrotondate prima della richiesta. Nessuno slot disponibile inventato.
- `test-map-field.mjs`: flussi dei cinque report, sicurezza/origin, consenso, community, precisione, scadenze, blocchi, raggio e fusi. `test-hail-community.mjs`: corretto il controllo di consegna asset rispetto al manifesto corrente, senza eliminare i 68 controlli dei contratti hail. CI include anche entrambi e test-pulse.

Il raggio 150 km è una ricerca di osservazioni, non un radar grandine o ETA. I punti coperti sono entro 5 km: non interrogare Overpass su tutti i 150 km. La ricerca reale Overpass ha restituito timeout durante QA; lo stato di errore e il link alternativo sono stati provati. Non dichiarare disponibilità operativa continua.

Le chiamate IA sono esplicite, con i limiti di consenso già presenti. La previsione locale usa `/api/forecast` per riusare copie e richieste condivise del backend. In caso di copia precedente viene indicato. Nessuna chiave in questo repository. Leggere PROJECT_STATUS.md per il rilascio finale.

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
