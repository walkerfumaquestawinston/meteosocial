# E6 — grandine come fenomeno, non sezione principale

Adattamento confermato: la navigazione principale non aveva già più Grandine. Nessuna riscrittura dei menu o rimozione di funzioni.

- dist/community-features.js: hailSection, hailMap, coveredPlaces e offlinePlaces false. Risoluzione dei vecchi percorsi verso community, mappa o home. Controllo dei collegamenti iniziali e aggiunti dinamicamente: codice degli anchor conservato, nascosto tramite attributo. Ogni funzione si riattiva cambiando il suo flag a true e ricaricando.
- dist/main.js: resolver dei percorsi e inizializzazione del controllo dei collegamenti. Handler delle sezioni conservati.
- dist/climate-view.js: livello della mappa grandine dedicata nascosto sia nei pulsanti sia nel select, riattivabile tramite flag.
- dist/atlas.js: blocco dell’attivazione del livello dedicato quando spento.
- dist/nearby.js: pannello dei luoghi coperti dietro il suo flag.
- dist/design-system.css: regola di visibilità che prevale sugli stili dei collegamenti.
- dist/sw.js e dist/server/index.js: cachev34 e build aggiornata.
- test-feature-routes.mjs: fallback, riattivazione, livello mappa, collegamenti iniziali/asincroni. test-quick-sky.mjs invariato e superato; sei pulsanti e fenomeno hail del globo preservati.
- PROJECT_STATUS.md, PROJECT_VISION.md e queste note aggiornati.

Grandine resta tra le sei segnalazioni, nei dati e nei fenomeni del globo; non sono eliminati dati, record, servizi o file. API legacy non disabilitate: sono flag di prodotto, non barriere di sicurezza. Screenshot/store e contenuti social già pubblicati fuori dal progetto non sono stati modificati. Nessuna verifica visuale su dispositivo reale in questo blocco.
