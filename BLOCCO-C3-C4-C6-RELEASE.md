# C3, C4 e C6 — Meteo mondiale ed eventi

## Adattamento approvato
Prima dell'intervento esistevano 35 città con simboli meteo e NASA EONET limitato agli ultimi 7 giorni. Il proprietario ha approvato l'estensione senza duplicare tali funzioni. Gli aloni rappresentano campioni del modello, non aree radar. Gli estremi sono quelli del campione, non record del pianeta.

## Modifiche
- server/world-cities.js: 200 località reali del dataset Natural Earth 1:110m, selezionate per popolazione nel dataset. Nomi e coordinate provengono dalla fonte, non sono osservazioni meteo né una graduatoria aggiornata delle popolazioni.
- server/world-weather.js: quattro richieste da 50 località in parallelo, dati correnti Open-Meteo, tempo limite 25 secondi; cache condivisa persistente D1, aggiornamento su consultazione ogni 15 minuti, lock contro duplicazioni, ultimo dato preservato e dichiarato in caso di errore.
- server/globe-events.js: fino a 300 eventi NASA aperti, nessun taglio automatico a 7 giorni; prima data disponibile e ultima posizione del catalogo, fonte esplicita, cache persistente. Le date non certificano inizio/durata reale dell'evento.
- server/atlas.js: nuova lettura mondiale separata; le 35 città delle altre sezioni restano preservate.
- dist/world-weather.js: estremi, selezione deterministica della destinazione, texture pioggia/neve con continuità al meridiano 180°, salvataggio pubblico in IndexedDB.
- dist/globe-conditions.js: collegamento alla nuova fonte soltanto per Globo Vivo, età/stato conservato, recupero offline senza salvare community o identità.
- dist/living-renderer.js: una texture sulla sfera per le precipitazioni, icone NASA su un unico canvas sovrapposto, colore del modello distinto; fallback compatibile, liberazione texture alla chiusura. Nessuna mesh per evento o città. Solare, geometria binaria, gesti e soglie di movimento invariati.
- dist/living-world.js e CSS: pulsante Portami dove succede qualcosa, fonti/orari visibili, due etichette degli estremi, dettaglio della destinazione. NASA visibile anche su Persone/Satellite come icone distinte; il contatore conta soltanto persone reali.
- db/schema.ts e migrazione additiva 0017, inclusi metadati/copias build: cache delle fonti, nessuna modifica a dati utenti.
- build.mjs, dist/server/index.js, dist/sw.js: inclusione moduli; cache shell v37.
- test-world-weather.mjs; adeguati test-globe-conditions.mjs e test-globe-gestures.mjs al catalogo ampliato e al helper della texture.
- PROJECT_STATUS.md e PROJECT_VISION.md: continuità.

## Destinazione C6
Sceglie l'evento NASA con posizione più recente fra quelli aggiornati negli ultimi 7 giorni, purché il catalogo non sia scaduto/conservato. In assenza, campione recente con precipitazione più alta. Non è una graduatoria di pericolosità. Se non ci sono dati utilizzabili, nessun punto finto e pulsante disabilitato. Il volo usa la funzione esistente e resta istantaneo con movimento ridotto/eco.

## Verifiche
- Prova dal vivo in database locale isolato: endpoint mondiale 200, 200 località e 200 dati validi, circa 9,2 secondi al primo caricamento. Primo tentativo precedente con timeout troppo breve corretto.
- Prova NASA dal vivo: 200, 300 eventi, limite indicato.
- test-world-weather: dati nulli e zero, estremi, cache 15 minuti, guasti e tempi originali preservati, limite retry, date NASA, selezione fresca, pioggia/neve e meridiano 180°.
- test-globe-conditions: 22 controlli; test-globe-gestures: inerzia/zoom/tocco/ritorno, eco, movimento ridotto e cleanup; test-solar-position superato.
- Build e controllo sintattico riusciti. Nessuna alterazione agli import dinamici o a land-mesh.

## Limiti
Non è copertura meteo continua o radar. Sono 200 città più il punto locale quando disponibile; nessun record assoluto di caldo/freddo. Senza fonte o senza una precedente copia locale, il dato è dichiarato indisponibile. Le precipitazioni del modello oltre 3 ore non restano visibili; il catalogo conservato oltre 24 ore non viene disegnato. I dati non si aggiornano autonomamente senza consultazioni.

NASA è un catalogo informativo: aperto non significa osservato ora. Eventi senza posizione puntuale valida non sono disegnati; il limite di 300 è dichiarato nel pannello fonti. L'aggiornamento Open-Meteo dipende dalla disponibilità e dai limiti del servizio: eventuali blocchi preservano l'ultimo dato. L'API gratuita non garantisce continuità; nessun abbonamento attivato.

Non sono stati misurati 60 fps su un telefono reale né eseguita una prova WebGL su quel dispositivo. Verificati flusso dati e renderer compatibile/gesti con test isolati; non promettere prestazioni misurate sul telefono.

Fonti: https://open-meteo.com/en/docs ; https://eonet.gsfc.nasa.gov/docs/v3 ; https://eonet.gsfc.nasa.gov/what-is-eonet ; https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_populated_places_simple.geojson .
