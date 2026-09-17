## Verifica e correzioni finali — 17 settembre 2026

Ricontrollati i nove requisiti sulla versione online 56 e corrette le condizioni di gara rimaste: cambiare livello annulla la richiesta precedente e ne invalida i messaggi; gli errori radar non sovrascrivono il livello vento/temperatura. La verifica di copertura usa ora tutti i limiti visibili, senza ritagliare artificialmente le zone polari. Caricamento MapLibre e cartografia hanno timeout di 15 s ciascuno e rilasciano listener/risorse quando si cambia sezione; in errore resta Riprova. Banner aggiornamenti robusto anche quando l’installazione è già iniziata o un’altra scheda ha attivato la versione. Icona corretta per Allagamento. Shell v46.

Test: test-map-lifecycle.mjs (caricamento, annullamento, timeout, selezione e risposte fuori ordine), test-map-refinement.mjs e test-local-map.mjs. Build completata. Restano validi i limiti già dichiarati: WebGL del browser di verifica non disponibile; tempo <2 s e fluidità su telefono non certificati. Nessuna modifica a dati, credenziali o schema. Questo stato e le sorgenti vengono salvati sullo stesso progetto online per proseguire da un altro PC.

# Mappa locale — rifinitura e continuità, 16 settembre 2026

## Completato

- Caricamento cartografia prioritario: MapLibre avviato in parallelo, livelli meteo importati dopo il primo caricamento della mappa, fotocartolina su richiesta. Eliminato il rimontaggio della mappa alla risposta di identità. Skeleton scuro con contorni costieri reali generalizzati (Natural Earth, Italia e mari adiacenti); nelle zone interne/senza costa resta il reticolo di caricamento. Nessuna sagoma geografica inventata.
- Bundle ES modules minificato e suddiviso, CSS consolidato mantenendo l’ordine. Il grafo consegnato e il service worker escludono globe, Three, land-mesh, google-3d, hail, schools, climate-view e world-weather. Le sorgenti ritirate restano in Git, le API e i dati storici restano sul server. I piccoli helper condivisi della segnalazione grandine restano necessari alla community.
- Pagina Meteo separata dall’ex Atlas 3D senza perdere le previsioni e il confronto città. Nessun cambiamento a segreti, account o schema del database.
- SW v45: installazione differita per non competere con le tiles, cache essenziale del bundle, eliminazione delle cache vecchie e dei vecchi asset 3D. Banner «Nuova versione disponibile · Aggiorna» e attivazione/ricaricamento soltanto al clic. Conservati notifiche e invio offline.
- Temperatura interpolata continuamente, opacità 50%, scala blu–giallo–rosso e legenda. Un solo valore centrale o nel punto toccato, nessuna griglia numerica. Il dato della città viene ancorato allo stesso oggetto meteo della card superiore.
- Vento: scie persistenti più lunghe e spesse, colore e velocità proporzionali all’intensità, legenda km/h, frecce statiche con movimento ridotto/eco.
- Pioggia: analisi dei pixel nell’area visibile, su tutte le immagini disponibili nell’ultima ora, con verifica della maschera di copertura RainViewer. Il chip asciutto e play disabilitato compaiono solo se tutta l’area coperta risulta senza echi; dati vecchi, immagini mancanti o copertura incompleta restano «Copertura radar non verificata». Su estensioni troppo grandi la verifica non viene dichiarata completata. Il controllo riparte dopo lo spostamento.
- Selettore esclusivo, Pioggia iniziale. Fonte unica espandibile in basso a sinistra, comandi zoom scuri senza angoli bianchi.
- Marker: età aggiornata ogni minuto. Storie: livello originale incluso Diluvio, distanza dalla posizione GPS se disponibile (altrimenti dalla città selezionata, dichiarata), sfondi meteorologici animati in assenza di foto, testi senza bande blu, eliminazione delle sole segnalazioni proprie con conferma.
- Introduzione al primo accesso della sessione: zoom 4→11, 1.500 ms, tocco per saltare; nessuna animazione con movimento ridotto.

## Verificato

- Build e controllo sintattico moduli.
- `node test-map-refinement.mjs`: interpolazione/ancoraggio, palette, direzioni vento, ritaglio tiles/maschera radar, stato sconosciuto sicuro, tipo Diluvio, esclusione moduli dal grafo e cache, attivazione SW e banner con ricaricamento esplicito.
- `node test-local-map.mjs`: finestra radar, origine consentita, scadenza report, distanza, crop 9:16, invio effettivo JPEG e recupero protetto su database temporaneo separato.
- `node test-photo-tools.mjs`: compressione e gestione immagini grandi.
- `node test-sky-confirm.mjs`: identità, distanza, accuratezza, unicità, moderazione e scadenza.
- Browser sull’anteprima: pagina Meteo funzionante dopo la separazione da Atlas. Fixture locale isolata: selettore esclusivo, valore centrale 22° identico alla card pur con campioni diversi, legenda vento, storia Diluvio, «vicino a te», testi bianchi senza fondo e flusso Elimina. La fixture non è nel Worker di produzione e non scrive dati reali.

## Limiti dichiarati

Il browser di verifica non dispone di WebGL: il fallback è verificato, ma la visualizzazione delle tiles, la fluidità delle scie e il traguardo sotto 2 secondi non sono certificati su un telefono reale. La fixture prova logica e DOM, non le prestazioni reali di MapLibre. Radar e Open-Meteo dipendono dalla copertura e dalla disponibilità dei fornitori; non sono osservazioni certificate a terra.

## Riprendere da un altro PC

Usare lo stesso account/workspace Sites e il progetto già indicato in `.openai/hosting.json`. Recuperare la versione online più recente prima di modificare. Codice, test e queste note sono salvati insieme; sito e dati server sono condivisi. Preferenze browser, sessionStorage, bozze offline e accessi ospiti non vengono trasferiti automaticamente. Nessuna sincronizzazione di cartelle o accesso remoto al PC è stata configurata.
