# Controllo dati — 22 settembre 2026

Durante il controllo delle 11:23 CEST, endpoint pubblici forecast/current e forecast concordano sui valori WeatherAPI: San Benedetto 15 °C, Roma 26,7 °C, Milano 21,6 °C, Tokyo 25,7 °C. Orario della fonte 11:15 Italia / 18:15 Tokyo; forecast San Benedetto conserva copia 11:00 per cache quindici minuti. HTTP 200, current available e forecast offline=false.

Confronti internet: 3B Meteo San Benedetto indica 22 °C alle 11 del 22 settembre; iLMeteo Roma 26,8 °C alle 11. Sono previsioni di servizi diversi, non una misura certificata in contemporanea. La pagina Milano recuperata risultava ancora relativa al giorno precedente: non usata per una conclusione comparativa.

- https://www.3bmeteo.com/meteo/san%2Bbenedetto%2Bdel%2Btronto
- https://www.ilmeteo.it/meteo/roma
- https://www.weatherapi.com/docs/

Errore applicativo accertato: il codice WeatherAPI 1063 (piogge sparse nelle vicinanze) diventava genericamente Pioggia. Conservati testo originale e indicazione di fenomeno nelle vicinanze; Oggi, intestazione Meteo, Community e riepilogo locale mostrano il testo preciso. La scena decorativa non simula pioggia sul punto per questo caso; Stesso cielo non lo usa per dedurre pioggia locale. Categorie iconografiche e altri riepiloghi restano semplificazioni: non sono rilevazioni.

La risposta normalizzata ora conserva anche providerLocation (località abbinata dal fornitore), separata dalle coordinate richieste. Cache provider revisionata per ottenere questi metadati; temperature non corrette, mediate o sostituite arbitrariamente. La differenza di San Benedetto richiede il controllo di questo abbinamento; non dichiarare tutti i dati certificati o il problema di accuratezza risolto solo perché API e test rispondono.

Verifica dopo v96: il fornitore identifica San Benedetto Del Tronto, Marche, Italy, 42.95/13.883; quindi non è emerso un abbinamento alla città sbagliata. Il valore ricevuto resta 15 °C. Roma identifica Rome 41.9/12.483 (26,7 °C), Milano Milan 45.467/9.2 (21,6 °C). La causa meteorologica dello scarto non è accertata: serve una misura contemporanea attendibile o un chiarimento del fornitore. Pagina MeteoNetwork individuata, ma senza timestamp leggibile nel risultato recuperato: non usata come prova attuale.

Le versioni 94 e 95 hanno pubblicato le novità Community/Lente (docs/COMMUNITY-LENTE-V94.md); questa revisione prosegue l'indagine chiesta dall'utente durante il rilascio.
