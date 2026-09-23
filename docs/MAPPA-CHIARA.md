# Mappa chiara e orari leggibili — 22 settembre 2026

Il controllo delle fonti rimane ogni 60 secondi mentre la mappa è visibile e al ritorno alla pagina. Il contatore del tempo trascorso si aggiorna ogni secondo, senza richieste di rete o ridisegno della mappa. Il timer viene liberato uscendo dalla mappa. Non promette misure meteo al secondo.

Fonti e orari raccoglie controllo, validità del modello della località e quadro radar visualizzato. Distingue caricamento, offline, controllo incompleto e modello precedente. Il contatore principale non viene annunciato ogni secondo dagli screen reader. Il pannello resta apribile e richiudibile con ritorno del focus; Controlla adesso riutilizza l'aggiornamento esistente.

I sei fenomeni hanno nomi più grandi e, sui telefoni fino a 600 px, due righe di tre comandi. I conteggi dei campioni non occupano più i selettori, dove potevano essere confusi con quantità meteo. Le quantità restano nei punti e nei dettagli. Il radar aggiunge Ultimo: torna al quadro più recente e riprende a seguire i nuovi quadri con le regole esistenti.

Fonti: https://open-meteo.com/en/docs e https://www.rainviewer.com/api/weather-maps-api.html . Open-Meteo current usa passi di 15 minuti, non nuove misurazioni ogni secondo. RainViewer pubblico espone quadri ogni 10 minuti; il timestamp è quello del composito e non di ogni misura. Le cache delle previsioni orarie restano di 15 minuti. Nessun nuovo provider, costo, permesso o migrazione.

Verifica: build riuscita; 64 suite attive superate, 5 contratti storici ritirati. Nuova suite su limiti temporali, dati assenti/futuri, offline/errori e immutabilità dell'orario del modello dopo un controllo. Browser desktop, 390 e 320 px; cambio fenomeno, pannello fonti e radar storico → ultimo verificati. Nessun dispositivo fisico o benchmark batteria. Le prove non certificano accuratezza meteorologica.

La cronologia Sites della versione 83 e quella GitHub avevano alberi identici: riconciliate con merge senza sovrascritture. Durante il lavoro gli script del plugin Sites sono divenuti assenti dal percorso installato. Pubblicazione tramite salvataggio sorgente autenticato temporaneo e fallback remoto Sites; esito definitivo registrato in PROJECT_STATUS.md.

Possibili interventi successivi: un riepilogo della località sempre visibile su telefono e una selezione esplicita tra vista essenziale e strumenti approfonditi. Da progettare senza moltiplicare pannelli o fingere dati nuovi.
