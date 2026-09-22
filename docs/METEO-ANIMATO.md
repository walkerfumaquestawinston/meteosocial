# Meteo animato — 22 settembre 2026

La scheda principale della categoria Meteo (#tendenze) ora contiene un paesaggio costiero originale animato in CSS/SVG. Ispirato alla richiesta visiva dell'utente, senza incorporare la foto o riprodurne persone e interfaccia.

Sole di giorno, luna stilizzata e stelle di notte, luce calda per alba/tramonto. Le fasi seguono il fuso e gli orari solari della località con la logica esistente. Il codice meteo corrente del provider determina sereno, nuvole, coperto, pioggia, neve, foschia o temporale. Le nuvole accelerano da 25 km/h di vento. Temporali scuri senza flash. La luna è decorativa, non indica la fase lunare astronomica; il paesaggio non è una webcam o una ricostruzione geografica. I dati restano previsioni da modello con fonte e orario visibili.

Scene aggiornate al caricamento dei dati e al cambio località; fase solare aggiornata ogni 30 secondi e al ritorno alla scheda. Dati mancanti/invalidi usano una scena neutra. Dati salvati offline mantengono l'avviso esistente e l'orario della previsione. Nessuna nuova richiesta a servizi esterni per lo sfondo.

Massimo 20 particelle, animazioni su trasformazione/opacità, decorazioni senza eventi puntatore e nascoste agli screen reader. Animazioni sospese quando la pagina è nascosta e nelle modalità economica/movimento ridotto. Con prefers-reduced-motion il movimento è disabilitato e le particelle nascoste. Testi bianchi su velatura scura e pulsanti con sfondo proprio. Titolo mobile compatto.

Verifiche: build completa; test-weather-scene, test-solar-live-map, test-atmosphere, test-feature-routes e test-startup superati. Coperti tutti i gruppi WMO, valori non validi, soglia vento e limite particelle. Verifica browser di notte con dati correnti, mobile 390 px senza overflow, e pioggia diurna con dati dimostrativi separati. Nessun dato di prova pubblicato. Sorgenti: dist/weather-scene.js e dist/weather-scene.css; integrazione dist/weather-page.js.

Il rilascio aggiorna il Site esistente e l'anteprima locale 4595. La conferma di pubblicazione e il ramo GitHub sono riportati in PROJECT_STATUS.md.

## Revisione Costa di luce — movimento più visibile

La versione precedente muoveva le nuvole di 68 px in 38 secondi: tecnicamente attiva ma poco percepibile. La revisione usa una traversata di 150 px in 12–19 secondi, acqua in 4 secondi e riflessi in 3,8 secondi. Piccolo faro costiero originale con fascio lento senza flash; spazio scenico dedicato su mobile. Nessun video, immagine scaricata, libreria o richiesta di rete aggiunta. Il paesaggio resta illustrativo.

Verifica browser: trasformazioni delle nuvole, acqua e riflessi diverse fra campioni; nessun overflow a 390 px. Build e test-weather-scene, test-solar-live-map, test-startup superati. Rispettate le modalità movimento ridotto e pagina nascosta. Il costo grafico non è zero: non è stato eseguito un benchmark batteria/FPS su telefoni reali.

## Scena d’ingresso anche in Oggi

Costa di luce ora compare nella scheda principale di Oggi, con firma MeteoSocial, usando lo stesso modulo animato di Meteo. Il rinnovo dei dati e il cambio città rigenerano la scena con il codice meteo corretto; i temi solari, stagionali e festivi restano attivi. Rimosso dalla Home il vecchio elemento immagine decorativo (già nascosto) e il backdrop blur che rendeva il nuovo paesaggio indistinto. Nessun asset multimediale o nuova richiesta di rete. Stato di caricamento ed errore restano espliciti senza inventare condizioni meteo.

Il disegno è originale del progetto, ma non si afferma un’esclusività legale o che non esistano interfacce simili. Controllo visivo della Home mobile e desktop, build e suite atmosfera/scena/avvio/fasi solari.
