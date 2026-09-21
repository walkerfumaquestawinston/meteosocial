# MeteoSocial — stato pubblico del progetto

## 21 settembre 2026 — nuovo design Atmosfera

La mappa #mappa-eventi è stata ridisegnata seguendo la direzione richiesta: un atlante scuro ispirato all'organizzazione di ARGOS, con un'identità meteo originale. Coste Natural Earth 50m, confini nazionali e nomi dei paesi; città selezionabili, anelli termici colorati, strumenti SVG e scheda locale con icone volumetriche leggere. Radar, cinque livelli, ricerca e Lente restano collegati alla località selezionata.

Corretto il caso in cui una risposta HTTP valida conteneva un vecchio meteo mondiale: ora viene provata la fonte diretta. Se anche questa fallisce, la copia precedente resta esplicitamente segnalata. La geometria viene caricata separatamente quando si apre la mappa. Nessun nuovo fornitore a pagamento o permesso IA.

Verifiche: 51 suite attuali passate; 6 suite legacy classificate separatamente, non considerate superate. Browser desktop 1280×720 e telefono 390×844: nomi, temperatura, radar, dettagli città. Nessun errore console nelle prove. Non effettuati test su dispositivi fisici.

Pubblicazione confermata: Sites versione 68, 21 settembre 2026, https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi. GitHub PR #9 integrata in main; Check MeteoSocial e anteprima Netlify superati. Sorgente runtime Sites: 75f4dbb3c4903dd940491a8b58b21e06ec7d7e69. Le note successive non modificano il runtime.

Limiti: grandine da community non certificata; fulmini indica temporali da modello, non singole scariche. Radar RainViewer osservato, non previsione. Lente non legge i pixel radar; nessun GPS, autore o media trasmesso a OpenAI.

Per continuare: RIPRENDI-QUI.md e docs/CLAUDE_HANDOFF.md. dist contiene sorgenti: non cancellarla. Solo dist/app e dist/server sono output rigenerabili.
