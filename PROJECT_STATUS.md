# MeteoSocial — stato pubblico del progetto

## 21 settembre 2026 — Atlante, vento e radar

La mappa principale (#mappa-eventi) ora ha cinque livelli: Temperatura, Pioggia, Grandine, Vento e Fulmini. Cartografia vettoriale Natural Earth nella vista ampia, strade OpenStreetMap allo zoom locale, pannelli compatti e tutti i livelli visibili sul telefono.

Radar RainViewer sovrapponibile a qualsiasi livello: sequenza recente di circa due ore, cursore, riproduzione/pausa, orario, aggiornamento ed errori espliciti. Non è una previsione: la copertura varia e una zona vuota non esclude pioggia. Grandine: osservazioni community delle ultime due ore, non certificate. Fulmini: temporali da modello, non singole scariche rilevate.

Vento: frecce della direzione verso cui soffia, velocità in km/h e confronto nel campione visibile. Lente IA: domande contestuali, fonti della risposta e ultimi tre scambi della stessa località; nessuna analisi dei pixel radar. I limiti di invio a OpenAI restano invariati: niente coordinate, autori o media.

Verifiche: build completata, 49 suite superate; 6 suite di moduli ritirati classificate separatamente dal runner. Browser verificato a 390×844 e 1280×800: radar, località, strade, pannelli, gestione accesso IA e assenza di overflow. Nessun errore console rilevato. IA reale non invocata in anteprima locale; segnalato correttamente il meteo in cache quando il fornitore non risponde.

Stato pubblicazione: modifica pronta; il sito pubblico confermato precedente è la versione 65. Aggiornare questa riga solo dopo la conferma di pubblicazione.

Per riprendere: leggere RIPRENDI-QUI.md e docs/CLAUDE_HANDOFF.md. Lo storico precedente è conservato in Git. dist/app e dist/server sono output non versionati; i sorgenti dentro dist restano versionati e non devono essere cancellati.
