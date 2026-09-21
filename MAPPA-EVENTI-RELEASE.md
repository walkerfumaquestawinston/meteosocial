# Mappa eventi atmosferici — 21 settembre 2026

**Il sito pubblicato su Sites resta alla versione 64.** Questo blocco vive su GitHub e sull'anteprima Netlify. Perché le rotte `/api/mappa/*` rispondano davvero serve pubblicare il Worker su Sites: è un passo separato del coordinatore e non è stato fatto.

- Ramo: `claude/admiring-brown-065b6t`, integrato in `main` con `427e5a3`.
- Pull request: walkerfumaquestawinston/meteosocial#3, chiusa perché integrata.
- Netlify: si ricostruisce da `main`. L'URL ufficiale su Sites è invariato.

## Cosa c'è

Una mappa degli eventi atmosferici su rotta `#mappa-eventi`, **aperta dalla voce Mappa della barra di navigazione**. Cinque livelli, ognuno con la fonte dichiarata:

| livello | fonte | cosa mostra |
|---|---|---|
| TEMPERATURE | Open-Meteo | 200 città Natural Earth, scala termica |
| PIOGGIA | Open-Meteo | millimetri nell'ora |
| EVENTI | NASA EONET | incendi, tempeste, vulcani, alluvioni |
| GRANDINE | segnalazioni delle persone | database nostro |
| COMUNI | ISTAT (copie npm) | densità crescente con lo zoom |

Ogni livello carica per conto suo con `Promise.allSettled`: se una fonte cade, le altre restano in piedi e la barra di stato dice quale manca. Le fonti non disponibili sono **barrate**, quelle che rispondono con il dato precedente sono **segnate**, quelle chieste direttamente dal browser dicono **diretto**.

La mappa occupa tutto lo schermo: `html.mappa-eventi-view` ritira l'impaginazione dell'app, con lo stesso schema già usato da `local-map.css` per la mappa della zona. Ricerca di una località in alto, contatori dei livelli che sono anche i loro interruttori, strumenti sul bordo destro, scheda che scorre sopra la mappa invece di coprirla con una finestra.

**L'IA si chiede scrivendo.** La barra in fondo è un campo di testo. Alla Lente arrivano soltanto il nome della località, la domanda e il riassunto dei conteggi: mai coordinate, autori o foto.

**Avviso grandine.** `server/grandine-avviso.js` applica le tre condizioni della specifica 3.3: almeno due segnalazioni concordi entro 3 km, stima fra 3 e 40 minuti, non più di un avviso all'ora. Il vento meteorologico dice da dove viene il fenomeno, quindi la nube si muove nella direzione opposta. Quando non c'è un avviso, la mappa dice **perché**.

## Ricaduta diretta alle fonti

Se `/api/atlas/world` o `/api/atlas/events` non rispondono — per esempio perché su Sites gira ancora la versione 64, che quelle rotte non le ha — il browser interroga Open-Meteo e NASA EONET direttamente. Non è una pratica nuova: `dist/sky-community.js` lo fa già.

Cosa si perde, e va detto invece di nasconderlo: niente cache condivisa, niente conservazione del dato precedente se la fonte cade, e il numero di chiamate cresce con le persone collegate. Per questo resta una ricaduta e non la strada normale.

## File

- `dist/mappa-eventi.js`: la vista, i cinque livelli, le schede, la barra della Lente, le due funzioni di ricaduta. Esporta `normalizzaEventiNasa()` e `abbinaMeteoCitta()`, pure e provabili senza rete.
- `dist/mappa-eventi.css`: modalità a tutto schermo, contatori, strumenti, pannello, barra dell'IA.
- `dist/citta-mondo.js`: le 200 località Natural Earth. **Prima era `server/world-cities.js`**, che il browser non può leggere. `build.mjs` la incorpora nel Worker rinominandola `WORLD_CITIES`, come già fa per `CITIES` di `places.js`.
- `dist/index.html`: la voce Mappa della barra punta a `#mappa-eventi`.
- `dist/main.js`: rotta `#mappa-classica`, tema, voce attiva, classe a tutto schermo.
- `server/mappa.js`: `/api/mappa/comuni`, `/api/mappa/meteo`, `/api/mappa/grandine-avviso`.
- `server/grandine-avviso.js`: la funzione pura dell'avviso.
- `dati/comuni.json`: 7.894 comuni, rigenerabile con `tools/genera-comuni.mjs`.
- `build.mjs`: incorpora comuni e città del mondo nel Worker.

## Verifiche

`node tools/run-tests.mjs` → **47 superati, 6 non pertinenti, 0 falliti**.

- `test-mappa.mjs`, 53 controlli: livelli di zoom, soglie reali, riquadro, troncamento dichiarato, abitanti null, cache, metodi non consentiti, **raggiungibilità dal menù**, modalità a tutto schermo, e la chiamata a Lente letta davvero per verificare che non contenga coordinate.
- `test-mappa-diretta.mjs`, 39 controlli: eventi NASA tenuti e scartati (chiusi, senza geometria, coordinate fuori scala, date dal futuro), abbinamento meteo che rifiuta i campioni incompleti invece di indovinare, elenco città unico fra browser e Worker.
- `test-grandine-avviso.mjs`, 30 controlli: ogni condizione della specifica violata una per volta.

Browser reale a 375 e 1280 px, nessun errore JavaScript. Posizioni degli elementi **misurate**, non stimate a occhio.

## Limiti dichiarati

- Da un ambiente senza rete verso l'esterno, Open-Meteo, NASA e le tessere della mappa **non sono raggiungibili**: le prove nel browser usano risposte finte con il codice vero.
- I comuni vengono da due pacchetti npm MIT derivati da ISTAT, **non dalla fonte ufficiale**: vanno riverificati contro ISTAT quando l'accesso lo consente. Il lockfile non è stato toccato.
- 387 comuni su 7.894 non hanno la popolazione: `abitanti` resta `null`, non zero. Non compaiono ai livelli di zoom che filtrano per abitanti.
- L'altitudine non è disponibile in nessuna delle due fonti.
- Su Netlify l'app è in sola lettura: le scritture rispondono 401 o 403, perché le intestazioni di identità le aggiunge Sites sul proprio dominio.

## Decisioni che restano del proprietario

1. **Notifiche push dell'avviso grandine.** Oggi l'avviso si vede aprendo la mappa. La specifica lo tratta come l'unica eccezione al tetto di due notifiche al giorno e l'unico che può arrivare fra le 22 e le 7.
2. **H6 (`dist/arrival-estimate.js`).** Stessa formula dell'avviso ma con due condizioni in più, fra cui cento persone attive in zona: con gli utenti attuali non partirebbe mai. Non è stato riattivato né modificato.
3. **Se `#mappa-classica` vada ritirata.** La mappa MapLibre della versione 64 è intatta e convive con quella nuova; il vecchio indirizzo `#mappa` continua a funzionare.
4. **Pubblicare il Worker su Sites**, che è ciò che accende comuni e grandine anche fuori dall'anteprima.
