# Lente IA — integrazione contestuale

12 settembre 2026. Estende l'assistente OpenAI già collegato, senza cambiare sito, account, dati degli utenti o chiave configurata.

## Funzioni consegnate

- Pagina dedicata Lente con identità ottica, orbita decorativa leggera, quattro contesti, domande suggerite, risposte con enfasi leggibile, copia e domanda successiva.
- Globo e mappa: pannello contestuale con località e livello selezionati, senza abbandonare la vista. Pulsante separato dalle attribuzioni cartografiche.
- Meteo: accesso sopra le schede orarie e suggerimenti per ombrello, uscite e tendenze. Il servizio usa fino a 48 ore e 7 giorni da Open-Meteo, con fuso e ora del dato.
- Community: riepilogo della località oppure lettura del singolo post, proposta di risposta e titolo. Fonti consultabili con collegamento al post originale. Massimo 12 post accessibili delle ultime 24 ore; non è una rappresentazione completa del feed.
- Le bozze sopravvivono a chiusura e riapertura. Per completare l'accesso si conserva una sola bozza in sessionStorage per massimo 15 minuti, senza inviarla automaticamente. Conversazioni in memoria separate per sezione, città, coordinate locali, livello e post; nessun archivio chat permanente.
- Errori recuperabili, richieste duplicate bloccate, risposte in ritardo isolate dal contesto attuale, annunci per lettori di schermo e animazioni ridotte. Nessuna nuova dipendenza grafica.

## Dati e limiti

L'utente ha approvato esplicitamente l'invio a OpenAI di previsioni e nome della località e, su richiesta nell'app, testi pubblici selezionati e ultime tre domande/risposte. Coordinate usate solo per consultare Open-Meteo; metadati GPS, nomi/identificativi degli autori, foto e video non vengono aggiunti al payload OpenAI di Lente. I nomi di zona composti da coordinate vengono sostituiti. Invio manuale, credenziale solo lato server e `store: false`.

I post sono osservazioni non verificate. Lente non legge i pixel radar o i media, non verifica dimensioni della grandine, minuti all'impatto, allerte ufficiali o disponibilità di ripari. Altre funzioni immagini/traduzione già presenti conservano i loro percorsi espliciti; questa integrazione non ne amplia silenziosamente il consenso. Nessuna pubblicazione automatica di testi o risposte. Rimane il limite di dieci richieste IA per utente/ora.

## Verifiche

- 63 controlli dedicati: perimetro dei dati inviati (incluse coordinate dentro suggerimenti, cronologia, testi e link), fonti, autenticazione/origine, scadenze e blocchi degli autori, campione limitato, errori/timeout/quota, contesti separati e rendering di testo ostile.
- 41 controlli feed e 49 controlli atlas superati. 21 controlli Worker eseguiti sul bundle reale, correggendo il precedente test che importava un frammento isolato.
- Browser desktop e dimensioni 390×844 e 320×740: pagina IA, globo, livello Grandine, Meteo, singolo post, fonti e ritorno al post; bozza ripresa dopo accesso. Nessuno scorrimento orizzontale della pagina IA nei due viewport.
- Due richieste reali nell'anteprima: previsione ombrello Torino e lettura di un post tecnico locale a Roma. Risposte e fonti visualizzate; nessun post di prova pubblicato sul sito pubblico.
- Non è una certificazione completa di accessibilità o un test su telefoni fisici. Il collegamento reale non dimostra infallibilità delle risposte o unicità commerciale.
