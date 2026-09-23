# Community rinnovata — 23 settembre 2026

Primo pacchetto approvato: feed, scheda del post e pubblicazione guidata.

Tre filtri principali: Vicino a te (corrispondenza al comune selezionato, non raggio GPS), Seguiti ed Esplora. Salvati resta nel pannello Ricerca e salvati. Sei pulsanti fenomeno combinabili con Ultime 2 ore; il numero mostrato conta solo i post caricati e non nascosti, non tutta la community.

Le schede mostrano fenomeno, stato non verificato e data di pubblicazione con ora del dispositivo. L’orario di osservazione non viene inventato: per i racconti ordinari va indicato nel testo. Le reazioni secondarie sono in Altre azioni e attendibilità. Commenti, salvataggi, condivisione, Lente e mappa restano disponibili.

Il modulo ordinario propone tre passaggi visivi: testo, luogo, controllo. Il primo invio apre un’anteprima escapata; soltanto Conferma e pubblica invia lo snapshot al server. Chiudere conserva la bozza. In caso di errore l’anteprima resta disponibile e viene riusato l’identificativo, conservando l’idempotenza server. Dopo il successo il feed viene invalidato e aperto sul comune del post.

I percorsi foto/video e segnalazione rapida restano quelli esistenti: la nuova anteprima riguarda il modulo ordinario. Nessuna modifica schema, nessuna migrazione, nessun contenuto artificiale in produzione, nessuna generazione IA aggiuntiva. Il database locale contiene un racconto esplicitamente PROVA LOCALE per il collaudo.

Verifica: build, 73 suite attive passate (5 ritirate), nuovi test per escaping, foto, data mancante e distinzione degli orari. Browser desktop/390 px per flusso annulla/conferma, feed e filtro; colori corretti dove le regole storiche interferivano. Non collaudo completo su telefoni fisici o certificazione WCAG.
