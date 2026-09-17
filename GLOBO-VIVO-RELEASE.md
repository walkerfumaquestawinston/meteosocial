# MeteoSocial — Globo Vivo

Consegna del 16 settembre 2026. Segue `GLOBO-VIVO-SPECIFICA.md`, con autorizzazione a completare tutte le fasi e pubblicare senza pause.

## Comportamento

- Il percorso iniziale e gli alias `#mondo`, `#globo`, `#google3d`, `#globo-meteo` aprono un solo globo. Persone è il livello iniziale; Meteo e Satellite sono le altre due pillole. Rilievi Google, nomi, zoom, fenomeni, radar e fonti sono in Altro. Google mantiene le chiavi e la fatturazione esistenti.
- `#home` (Oggi) carica 406.220 byte nel grafo statico JS, senza Three o geometria. Il globo si carica entrando o manifestando intenzione. L'apertura direttamente sul Globo carica naturalmente il 3D.
- Nuove osservazioni pubbliche di due ore, coordinate arrotondate a circa un chilometro, cinque intensità in linguaggio comune, foto e fenomeni facoltativi. La prima osservazione funziona con sessione anonima; le successive richiedono accesso. Nessun GPS o invio foto silenzioso.
- Un punto per osservazione, contatori di partecipanti e paesi derivati dai dati disponibili; nessun numero inventato. Lo stesso archivio alimenta il globo e la Community a elenco. I post precedenti restano in `#archivio`.
- Scheda zona: persone entro 3 km, foto/orari, modello Open-Meteo e disaccordo esplicito. Consiglio abbigliamento e obiettivo locale. Il feedback valorizza le osservazioni senza dichiarare di aver modificato Open-Meteo.
- Conferma reale dell'invio, volo verso il proprio punto e onda luminosa; esportazione PNG quadrato. Animazioni disabilitate con preferenza di movimento ridotto.
- Attendibilità privata basata su riscontri di partecipanti autenticati diversi, ponderazione della sintesi, visibilità limitata sotto soglia. Blocco, eliminazione del proprio contenuto e oscuramento pubblico immediato dopo segnalazione di abuso. La scadenza di due ore si applica anche agli URL delle foto. Non è promesso un servizio umano di moderazione 24/7.
- Una sola barra di navigazione, città in alto, scale tipografiche/raggi/pesi e colori dati/persone. Bricolage Grotesque ospitato nel sito. Sfondo derivato da ora locale, alba/tramonto e meteo, con contrasto verificato su cinque cieli.
- Manifest, icone e meta esistenti conservati; scorciatoie aggiornate. Service worker v17, HTML network-first, manifest senza cache vecchie, file 3D su richiesta.

## Geometria e rendering

`assets/land-mesh.bin`: **90.995 byte** nel contenitore gzip; **165.188 byte** dopo decompressione. Vertici Float32, indici Uint16, nessun parsing del grande array JavaScript. Il vecchio JS pesava 1.048.130 byte; il suo gzip era 128.853 byte. Quindi il risparmio di trasferimento rispetto al vecchio gzip è circa il 29%, non il 91% del confronto non compresso.

Douglas–Peucker a 0,5°: 5.014 → 1.499 segmenti, tutte le 128 coste chiuse conservate, 10.770 triangoli delle terre byte-identici in Float32. Ricostruzione riproducibile in `tools/build-land-mesh.mjs`, metriche in `tools/land-mesh-report.json`.

Punti in un solo `THREE.Points`/ShaderMaterial/AdditiveBlending: massimo 5.000, 800 in eco; riduzione adattiva su frame lenti. Pixel ratio massimo 1,8; ciclo sospeso in background e dopo dieci secondi inattivi.

Il browser di verifica ha WebGL disabilitato. Le immagini prima/dopo documentano la vista geografica compatibile Canvas 2D. Il renderer WebGL e i 60 fps richiedono una verifica su dispositivo con GPU; non vengono presentati come prestazioni misurate. La texture NASA è geografica, non un'immagine meteo live. Gli eventi NASA conservano fonte e data: stato aperto non significa evento in corso in questo istante.

## Verifiche

- 18 controlli avvio/import/cache; 20 controlli API osservazioni (incluse concorrenza, privacy, scadenza e moderazione); 9 controlli binario/geometria.
- 22 controlli fonti del globo, 41 controlli integrazione Google e 15 controlli giornata/orari.
- 6 casi logica del cielo; contrasto minimo del testo sullo sfondo: sereno 6,31:1, nuvoloso 4,96:1, pioggia 9,17:1, tramonto 7,23:1, notte 14,37:1.
- Browser a 375 px: controlli axe su Oggi nei cinque cieli e sul Globo, Meteo e Community, senza violazioni rilevate nei controlli eseguiti; percorso anonimo reale verificato esclusivamente nell'ambiente locale, con dati separati dalla produzione.
- Manifest, dimensioni di tutte le icone, OG e scorciatoie controllati. La proposta automatica di installazione e il rinnovo delle anteprime WhatsApp dipendono anche dal browser e dalle cache esterne.

## File principali per fase

1. `dist/main.js`, `experience.js`, `social.js`, `atmosphere.js`, `sw.js`; verifica `test-startup.mjs`.
2 / 3 / 4 / 5. `dist/living-world.js`, `living-renderer.js`, `living-world.css`, `sky-community.js`, `globe.js`, `globe-conditions.js`, `google-3d-frame.js`, `server/sky.js`, `server/worker.js`, `db/schema.ts`, migrazione additiva `0011_foamy_king_cobra.sql`; `test-sky.mjs`.
8. `dist/design-system.css`, `sky-theme.js`, fogli CSS esistenti normalizzati; `assets/bricolage-latin.woff2` e relativa licenza; header e navigazione conservati nelle sorgenti ma visibilità semplificata.
6. `manifest.json`, `dist/index.html`, `dist/sw.js`; icone e meta originali conservati.
7. `dist/assets/land-mesh.js`, `land-mesh.bin`, `living-renderer.js`, `tools/build-land-mesh.mjs`, `tools/land-mesh-report.json`, `test-geometry.mjs`.
Build/anteprima: `build.mjs`, `dist/server/index.js`, `package.json`, lockfile, `vite.preview.config.mjs`, adattatore SQLite locale. Nessuna prova scrive sul database pubblico.
