# D6 — prossimità progressiva

## File modificati
- dist/sky-community.js: selezione entro 5, 15, 50, 150 km, stop al primo raggio con osservazioni; ordine per distanza e poi recenza; esclusione scadute, future, coordinate invalide. Distanza ed età su ogni card, riepilogo del più vicino quando si allarga, CTA resta sulla città dell’utente. Stato vuoto veritiero oltre 150 km, nessun contenuto finto. Con dati globali troncati, ricerca regionale dedicata e dicitura risultati parziali se anche questa è troncata o indisponibile. Prima voce delle ultime due ore confermata dal server nel messaggio successivo all’invio rapido.
- server/sky.js: GET sky/nearby per il recupero regionale quando il limite globale potrebbe escludere voci locali, stessa moderazione/privacy/scadenza. Confini geografici comprendono meridiano 180 e poli. firstInCity restituito solo se l’osservazione è l’unica pubblica attiva con quel nome città/paese.
- dist/sw.js e dist/server/index.js: cache v29 e distribuzione aggiornata.
- test-nearby-feed.mjs: quattro raggi, distanze, ordine, scadenza, date future, coordinate invalide, attraversamento del meridiano 180.
- test-sky.mjs: query regionale, moderazione, validazione e prima osservazione.
- PROJECT_STATUS.md, PROJECT_VISION.md e questo documento: continuità.

## Verifiche
Build riuscita; 58 verifiche server superate; test selezione progressiva e regressione invio/retry superati. Nessuna nuova migrazione, nessuna segnalazione di prova pubblicata online. Nessuna nuova verifica visuale su dispositivo fisico.

## Limiti e onestà
Le coordinate delle persone sono già arrotondate per privacy: la distanza è calcolata su queste, esposta come circa, mai come posizione esatta. Il raggio è dalla località scelta e non coincide con il confine comunale. La scadenza è due ore: non si afferma più che nessuno abbia segnalato oggi basandosi solo sui dati rimasti. In assenza totale di dati si mostra un invito, non un post inventato. Risultati parziali non vengono descritti come censimento completo. La prima voce è riferita alle osservazioni pubbliche ancora disponibili nelle due ore per quel nome città/paese; non è una classifica o un primato giornaliero. Rendering, geometria e contatori del globo restano invariati.
