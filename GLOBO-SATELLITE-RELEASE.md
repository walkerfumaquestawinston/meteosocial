# Globo satellite — 15 settembre 2026

Richiesta: dopo la conferma del caricamento Google, sostituire il globo principale e renderlo interattivo con il satellite. Stesso progetto Sites, indirizzo e dati. Nessuna nuova API, quota o variabile runtime.

## Comportamento consegnato

- **Globo / `#mondo`** apre lo spazio del satellite Google quando configurato. `#google3d` continua a funzionare. **Globo meteo · livelli / `#globo-meteo`** conserva il pianeta NASA e i livelli esistenti. Con Google disattivato, Globo torna al NASA.
- Apertura esplicita del satellite: vista iniziale dell’intera Terra; comandi **Tutta la Terra**, **Avvicina alla città**, **Dall’alto**, **Rilievo 3D**, **Nomi e strade**, zoom, nord e schermo intero dove supportato. Comandi e gesti usano il renderer Google reale, senza globi decorativi sostitutivi.
- **Scegli un punto sulla mappa** attiva una selezione singola. Un clic sul territorio aggiorna la zona e le previsioni a fianco, mantenendo la camera. **Meteo del punto al centro** offre un’alternativa da tastiera. La ricerca città ricentra la stessa mappa.
- Le interazioni riusano lo stesso iframe e la stessa istanza Google; nessun nuovo caricamento automatico per aggiornare le previsioni. Cambio pagina, chiusura o app nascosta fermano il renderer; la riapertura resta esplicita.
- Layout con mappa e meteo affiancati sui display larghi, meteo sotto sui piccoli; pulsanti di almeno 48 px, focus visibile, nessun giro animato automatico. Attribuzioni e controlli Google rimangono visibili.
- Link dalla zona a previsioni, radar, grandine, community e Lente IA. Coordinate selezionate esplicitamente, senza recuperare schede Places o inviare immagini Google all’IA.

## Fonti e limiti

Google Maps JavaScript mostra immagini satellitari/fotorealistiche secondo la copertura, non una ripresa in tempo reale. Rilievi e dettaglio variano per località. Meteo Open-Meteo da modello con orario e fonte; radar e grandine conservano le mappe e le qualificazioni già esistenti. Nessun overlay meteorologico sul renderer Google e nessun nuovo sensore satellitare meteorologico.

Il proprietario ha confermato Google funzionante con la chiave esatta caricata tramite file. Ambiente Sites revision 5: chiave Maps protetta e attivazione true; nessuna chiave nel repository. Quote e fatturazione non sono state modificate o verificate da Codex. Il riuso della mappa riduce aperture evitabili e non impone un tetto di spesa.

Riferimento API consultato il 15 settembre: https://developers.google.com/maps/documentation/javascript/reference/3d-map — MapMode, range, tilt, heading, LocationClickEvent.position, SteadyChangeEvent.isSteady. Usato il canale weekly già presente, nessuna funzione alpha.

## Verifiche

41 controlli Google 3D, 18 del renderer satellite con API simulata, 42 Climate e 49 Atlas superati (150 totali). Coprono route e fallback, selezione esplicita e coordinate invalide, origine dei messaggi, riuso del renderer e della camera, comandi, stop e riapertura, oltre ai servizi esistenti. Build riuscita, sintassi e diff verificati.

I test non usano chiavi reali né richieste Google. I nuovi comandi e la nuova disposizione non sono stati provati in un browser o su telefoni reali da Codex; la conferma precedente del proprietario riguarda l’integrazione Google di base. Nessuna promessa di assenza assoluta di errori.

## Continuità

Salvare queste modifiche nel repository dello stesso Site e pubblicarle. Per l’esito e il numero correnti consultare Sites. Aprendo lo stesso sito dal PC principale si vede la pubblicazione; bozze e preferenze del browser restano locali. Nessuna sincronizzazione di cartelle o accesso remoto al PC configurato.
