# Revisione design — 23 settembre 2026

Oggi presenta il meteo prima del calendario illustrato, che resta automatico e viene ridotto. Navigazione con superfici e contrasto coerenti; accessi contestuali Lente nelle intestazioni invece di banner a larghezza piena. Meteo ha un titolo più compatto e un solo accesso IA nella scheda principale.

Community: barra Racconta/Foto/Altro, con Video e Domanda nel menu; filtri secondari raccolti con ricerca e salvati. Segnalazioni rapide spostate nella colonna laterale, dopo il feed su telefono. Etichette dei post, verifica e anteprima di pubblicazione conservate. La vecchia notifica del meteo salvato non copre più la mappa e la Community: queste mostrano già fonte e stato nel proprio pannello meteo.

Lente: domanda prima di contesto e voce, intestazione compatta, immagine nella colonna secondaria. Rimossa l'eccezione che forzava sempre la palette scura nell'assistente. Giorno/notte usano i colori condivisi, comprese le opzioni e il campo domanda. Invio resta manuale, nessuna modifica a modello, segreti o quote.

Mappa: pannelli azzurro/ink e ciano coordinati, contrasto dei comandi e delle etichette corretto. ResizeObserver invalida le dimensioni dopo variazioni effettive del contenitore e viene rimosso all'uscita. MapTiler non nasconde la cartografia alternativa al caricamento del primo singolo tassello: aspetta il completamento della vista e torna al fallback se il lotto contiene errori. Pulsante diretto per riprovare le previsioni nel pannello in caso di errore.

## Verifica e limiti

- Build riuscita; 73 suite attive superate, 5 contratti già ritirati. Ripetuti i controlli pertinenti dopo le rifiniture. Regressione MapTiler: primo tassello, completamento, cambio fase, lotto parziale e pulizia listener.
- Browser locale desktop e 390 px: Oggi, Community e Lente; menu Altro con Video/Domanda, fonti richiudibili, nessun overflow orizzontale rilevato. Il feed della prova mobile inizia a circa 616 px incluso il banner locale da 56 px, senza dati artificiali nuovi.
- Mappa locale: cartografia alternativa e radar visibili, prova scuro/ritorno Automatico. Chiavi di produzione assenti dall'anteprima. I dati precedenti restano dichiarati tali.
- Il difetto della mappa quasi bianca osservato nell'audit non si è riprodotto riaprendo una scheda pubblica: cartografia MapTiler e Rainbow erano visibili prima della modifica. Le protezioni introdotte coprono caricamenti parziali e cambi dimensione; non costituiscono prova della causa né garanzia che ogni episodio sia eliminato.
- Nessuna nuova generazione IA reale, modifica dei dati o pubblicazione di post in produzione. Non è un audit completo WCAG, un test su telefoni fisici o una certificazione dei dati meteo.

Questa revisione interviene sui componenti esistenti senza aggiungere un altro foglio di stile. Le regole storiche delle sezioni secondarie richiedono ancora un consolidamento progressivo. Nessun nuovo servizio a pagamento.
