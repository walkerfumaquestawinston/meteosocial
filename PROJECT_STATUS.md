# MeteoSocial — stato pubblico del progetto

## 21 settembre 2026 — Ora per ora, revisione della mappa

Pubblicato: Sites versione 70, 21 settembre 2026 alle 12:57 UTC, https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi. Sorgente runtime Sites 4b564171fee1f3991cbb7625b311589baf71faa2; albero f728435fefe8fe44d38768bbe6f74a44a665ca93. GitHub PR #11 integrata in main (d7a6edf03b5ef55d2dca65499e9b0fb82f1eea48). Check MeteoSocial run 35602330633 e anteprima Netlify superati. Queste note successive non modificano il runtime.

- L'osservatorio riunisce città e temperatura attuale in una sola scheda. Sei tessere orarie aprono dettagli di temperatura, percepita, vento medio, raffica, precipitazioni e probabilità. Simboli meteo volumetrici leggeri e IA su richiesta riferita all'ora scelta.
- Pioggia: prima coppia di ore future complete con <=0,2 mm e <=30% per ora, senza codici temporale nel modello. Non è un indice di sicurezza o una garanzia di asciutto; dati null, buchi temporali e copie offline escludono la proposta. Gli intervalli rispettano il significato Open-Meteo di quantità/probabilità/raffiche nell'ora precedente.
- Città con etichette su due righe, spazio riservato alla lettura e priorità sopra le frecce del vento. Azioni in una fascia separata, senza coprire il contenuto che scorre. Pannello mobile richiudibile.
- Correzioni: centro iniziale sulla città scelta, ricerche asincrone chiuse che non riaprono il pannello, conteggi mancanti distinti da zero, selezione oraria per timestamp anziché indice, recupero del focus alla chiusura, aggiornamento del nome a coordinate invariate.

Validazione: build e 15 suite mirate superate, compresi tutti i test del workflow Check MeteoSocial. Aggiunti casi su finestre future, intervalli mancanti/duplicati, dati assenti, temporali, fuso Tokyo, stato giorno/notte e minimizzazione del prompt. Browser 1280×720 e 390×844: cinque livelli, selezione ora, raggio grandine, nuova finestra pioggia, prompt IA e conservazione dopo richiesta di accesso. Nessuna chiamata a pagamento al modello in anteprima; integrazione server esistente verificata con test-lente. Nessun errore console rilevato. Telefono fisico non testato.

Nessuna dipendenza, migrazione o nuovo permesso IA. Il confronto orario locale non sposta l'orario delle osservazioni sulla mappa o del radar. I limiti delle fonti e dei punti coperti restano quelli della versione 69.

## 21 settembre 2026 — Osservatorio locale, cinque fenomeni

Aggiornamento pubblicato: Sites versione 69, 21 settembre 2026, https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi. Sorgente runtime Sites 0cceb6e74896e609783d9ca08dfad468e68a46f8. GitHub PR #10 integrata in main (e723ca7fd59856f01b54348478edbdb33431204c), Check MeteoSocial e Netlify superati. Le note successive non modificano il runtime.

Cinque livelli con strumenti dedicati: temperatura/percepita, pioggia oraria/probabilità, grandine community entro 25/50/100/150 km, vento/raffiche, temporali da modello e osservazioni di fulmini. Le ore sono mostrate nel fuso della località. Ogni livello permette di pubblicare un'osservazione pubblica approssimata e di ritrovarla nella community.

Punti coperti integrati nella mappa: ricerca entro 5 km dalla zona scelta, categorie Auto/A piedi, fonti OSM e community, distanze geografiche e indicazioni Google Maps. Copertura, apertura, accesso e disponibilità non sono garantiti. Nella prova reale il servizio Overpass non ha risposto: verificati messaggio di errore e alternativa Google Maps; normalizzazione e risultati verificati con fixture automatiche. Nessun luogo fittizio nel sito.

Lente usa richieste specifiche per ciascun fenomeno e il contesto del raggio grandine. Nessun ampliamento dei permessi: nessun testo di report, GPS, autore o media inviato automaticamente a OpenAI. Nessun nuovo modello o servizio acquistato.

Verifiche: 52 suite passate e 6 legacy classificate separatamente, non superate. Cinque livelli in browser, andamento orario con dati reali, pubblicazione e bozza con profilo/database di prova, layout desktop 1280×720 e mobile 390×844, nessun errore console rilevato. Nuovi test su autorizzazioni, consenso, blocchi, scadenze, antimeridiano, raggio e fusi orari. Il test hail-community mantiene i controlli backend e allinea il controllo asset al manifesto dei moduli ritirati. Nessuna prova su telefoni fisici.

File e passaggio di consegne: docs/CLAUDE_HANDOFF.md. Nessuna migrazione del database richiesta.

## 21 settembre 2026 — nuovo design Atmosfera

La mappa #mappa-eventi è stata ridisegnata seguendo la direzione richiesta: un atlante scuro ispirato all'organizzazione di ARGOS, con un'identità meteo originale. Coste Natural Earth 50m, confini nazionali e nomi dei paesi; città selezionabili, anelli termici colorati, strumenti SVG e scheda locale con icone volumetriche leggere. Radar, cinque livelli, ricerca e Lente restano collegati alla località selezionata.

Corretto il caso in cui una risposta HTTP valida conteneva un vecchio meteo mondiale: ora viene provata la fonte diretta. Se anche questa fallisce, la copia precedente resta esplicitamente segnalata. La geometria viene caricata separatamente quando si apre la mappa. Nessun nuovo fornitore a pagamento o permesso IA.

Verifiche: 51 suite attuali passate; 6 suite legacy classificate separatamente, non considerate superate. Browser desktop 1280×720 e telefono 390×844: nomi, temperatura, radar, dettagli città. Nessun errore console nelle prove. Non effettuati test su dispositivi fisici.

Pubblicazione confermata: Sites versione 68, 21 settembre 2026, https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi. GitHub PR #9 integrata in main; Check MeteoSocial e anteprima Netlify superati. Sorgente runtime Sites: 75f4dbb3c4903dd940491a8b58b21e06ec7d7e69. Le note successive non modificano il runtime.

Limiti: grandine da community non certificata; fulmini indica temporali da modello, non singole scariche. Radar RainViewer osservato, non previsione. Lente non legge i pixel radar; nessun GPS, autore o media trasmesso a OpenAI.

Per continuare: RIPRENDI-QUI.md e docs/CLAUDE_HANDOFF.md. dist contiene sorgenti: non cancellarla. Solo dist/app e dist/server sono output rigenerabili.
