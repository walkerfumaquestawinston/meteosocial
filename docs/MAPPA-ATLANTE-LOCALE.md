# Atlante locale — 22 settembre 2026

La mappa deve essere utile e riconoscibile, con una lettura immediata prima degli approfondimenti. Questa revisione aggiunge un riepilogo persistente della località: temperatura, condizione, precipitazioni nell'intervallo dichiarato, vento e orario della stima Open-Meteo. I dettagli mostrano il prossimo cambiamento previsto e le sei ore già disponibili, con accesso ai valori completi di ogni ora.

La nuova composizione usa pannelli inchiostro e accenti lime, separati dalla cartografia che continua a seguire giorno e notte. Sul desktop il riepilogo occupa il margine sinistro. Sul telefono è una scheda inferiore apribile: i sei fenomeni sono in un selettore con nome completo, accanto a Radar e Strumenti. Il menu raccoglie posizione, ritorno alla città, elenco località, nomi geografici, vista mondiale, controllo fonti, guida ed eventi NASA. Segnalazioni, ripari e Lente restano nei dettagli locali; nessuna richiesta GPS o IA parte automaticamente.

Gli orari del riepilogo seguono il fuso della località. Zero è distinto dal dato mancante; copie vecchie, offline, errori e orari futuri sono segnalati. Il riepilogo del prossimo cambio riusa la previsione esistente e non annuncia arrivi quando i dati non sono adeguati. Il contatore al secondo misura il tempo dall'ultimo controllo: non inventa osservazioni meteo al secondo. Le frequenze delle fonti restano quelle documentate in MAPPA-CHIARA.md.

Verifica: build riuscita e 65 suite attive superate, cinque contratti storici ritirati. Nuova suite per fuso della città, valori nulli/zero, dati precedenti/offline, errore, date future e contenuto HTML. Browser locale su desktop, 390 e 320 px: selezione fenomeno, espansione, dettaglio orario, Strumenti, contrasto e assenza di overflow orizzontale. Nessun errore console nel controllo finale. Non effettuati test su telefono fisico o una certificazione completa di accessibilità.

La revisione non aggiunge nuove reti di sensori, allerte ufficiali, previsioni stradali o disponibilità dei ripari. La qualità reale dei dati dipende dai fornitori. Le successive estensioni utili sono un confronto tra località e filtri temporali più semplici per le osservazioni; vanno progettate e verificate separatamente, senza accumulare altri controlli sulla vista iniziale.

Pubblicazione e identificativi finali vengono registrati in RIPRENDI-QUI.md e PROJECT_STATUS.md. Continuare sul ramo codex/weather-scenery-20260922, nella PR draft #21.
