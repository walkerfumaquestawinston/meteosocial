# Fase 24.2 — Chi ci lavora

Pubblicazione confermata: versione 64; sorgente 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381; ambiente 7 preservato. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site

Attività facoltativa nel Profilo: pesca, campi, cantiere, consegne, mare, sport. Nessuna rimuove la scelta. Attività esplicitamente dichiarata dall’utente e non verificata; spiegazione nella guida. Etichetta silenziosa accanto al nome nel feed, nelle osservazioni della zona e nelle storie della mappa.

GET/PATCH /api/profilo richiedono una sessione; PATCH valida origine, JSON e valore, applica moderazione e limite di frequenza. Tabella separata actor_professions, migrazione additiva 0023. La scelta appartiene all’identità della sessione: gli ospiti non la trasferiscono automaticamente fra dispositivi.

Peso lato server: moltiplicatore 1,5 soltanto sui fenomeni pertinenti. Nessun punteggio restituito e nessun vantaggio di accesso. La sintesi usa l’ultima osservazione per autore, ignora contributi nascosti e mantiene conteggi reali di persone e conferme. Rimuovere la professione aggiorna etichette e peso delle segnalazioni ancora attive. La sintesi distingue il fenomeno prevalente dal numero effettivo delle persone.

La tabella di pertinenza include tutte le categorie richieste, ma non aggiunge pulsanti per mare, visibilità, gelo, siccità, ghiaccio, nebbia o temperatura. Quelle categorie non sono ancora osservazioni autonome del compositore attuale. La sintesi non modifica Open-Meteo o allerte ufficiali. I livelli dettagliati restano osservazioni di precipitazione; opzioni aggiuntive come vento non trasformano il peso della pioggia.

## File
- server/profession.js: API, validazione, fattori, sintesi.
- server/sky.js: lettura etichette e sintesi pesata, conteggi invariati.
- server/worker.js: route del Profilo.
- db/schema.ts, drizzle/0023_real_rachel_grey.sql e metadati: persistenza additiva.
- dist/profession.js: form Profilo, etichetta e guida.
- dist/sky-community.js: integrazione Profilo/feed/scheda zona.
- dist/local-map.js: etichetta nella storia.
- dist/weather-page.js: guida.
- dist/design-system.css: etichetta neutra e selettore accessibile.
- dist/sw.js: shell v53.
- build.mjs: nuovi moduli; output generati dist/app, dist/server, dist/.openai/drizzle e tools/map-bundle-report.json.
- test-profession.mjs: API e fattori; PROJECT_STATUS.md, RIPRENDI-QUI.md e questo documento: stato del lavoro.

## Verifiche
Build riuscita. test-profession.mjs, test-sky-confirm.mjs, test-daily-question.mjs superati. Verificati identità, origine, campi non validi, isolamento, peso non imposto dal client, rimozione, conferme reali, pertinenza, temporali costieri e contributi nascosti. Browser nell’anteprima locale: selezione Pesca, salvataggio e rimozione Nessuna riusciti. Nessun contenuto di test scritto nel sito pubblico.

Fermarsi dopo 24.2. Prossimo blocco nell’ordine richiesto: 24.6, solo su richiesta. B2 e accessi a dati osservati restano separati.
