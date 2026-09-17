# MeteoSocial: globo e meteo collegati

13 settembre 2026. Estensione della sorgente online 19, stesso sito, account, Worker, database e servizio IA. Nessuna migrazione o cancellazione. Per l'esito della pubblicazione consultare il progetto Sites.

## Cosa cambia

- Percorso comune Oggi / Globo / Mappa / Meteo / Grandine / Community qui. La località resta quella selezionata nell'app; la community viene filtrata sulla stessa città.
- Tre scelte rapide e un menu con 14 livelli. Precipitazioni totali, pioggia, rovesci e neve hanno campi distinti; aggiunti raffiche, temperatura, umidità e pressione al suolo accanto a vento e nuvole. La stessa definizione alimenta pin del globo, pin della mappa e scheda locale. Un dato mancante mostra un trattino.
- Scheda locale con nove valori cliccabili, orario, fuso e intervallo della fonte. Il popup di una città mostra anche il valore del livello selezionato. Nella timeline si mantengono i valori orari di modello delle città del catalogo, ±24 ore.
- Globo NASA con immagine originale fino a 5400 × 2700, senza ingrandimento artificiale, densità fino a 2,5 e geometria più definita. Il limite della GPU viene rispettato. La scelta Leggera riduce immagine, densità e geometria; le impostazioni Comfort prevalgono. La preferenza resta nel browser.
- Radar con riproduzione, pausa, cursore e ritorno all'immagine recente. Composizione del globo fino a 2048 × 2048; tasselli della mappa a 512 px e colori neve abilitati. Si arresta uscendo dalla vista o nascondendo la pagina; una generazione invalida impedisce a richieste precedenti di riavviare la riproduzione.
- Con l'atlante visibile, controllo periodico ogni due minuti delle fonti radar/community; città e timeline conservano cache di dieci minuti. Le previsioni della località vengono ricontrollate quando superano dieci minuti. La mappa grandine conserva il controllo ogni 30 secondi. Questo è il ritmo di consultazione, non una promessa sulla latenza dei fornitori.
- Lente IA riceve anche i nuovi campi meteo, con unità e intervallo. Restano invio manuale, fonti, esclusione di coordinate/autori/media dal payload e gestione delle allerte già esistente. Non interpreta le immagini radar e non rileva grandine dalle foto.

## Fonti e copertura effettiva

La foto fornita è uno spunto per mappa centrale, comandi semplici e percorso verso la community. Non sono stati copiati codice, loghi o immagini dell'app concorrente. Per il confronto documentato precedente vedere `GRANDINE-CHIARA-RELEASE.md` e `HAIL-MAP-RELEASE.md`; nessuna pretesa di esclusività mondiale.

RainViewer offre le immagini delle due ore recenti a intervalli di dieci minuti nell'API pubblica, con copertura geografica non universale. L'orario visualizzato è quello di composizione. I tasselli hanno zoom nativo massimo 7: ingrandire la mappa non crea nuovo dettaglio meteorologico. La trasparenza non prova assenza di precipitazioni, la neve dipende dalla classificazione della fonte e il radar non identifica da solo la grandine. [Documentazione API](https://www.rainviewer.com/api/weather-maps-api.html).

Open-Meteo fornisce stime di modello, anche nei valori denominati current. Pioggia e rovesci sono in mm; neve in cm; precipitazioni totali in mm di acqua equivalente. L'intervallo current viene conservato; i valori orari coprono l'ora precedente. Il catalogo contiene 35 città più la località selezionata nel presente: non è una griglia climatica globale interpolata. La timeline del catalogo non inventa dati per una località assente. [Documentazione delle variabili](https://open-meteo.com/en/docs).

La superficie NASA è geografia storica. Non sono state aggiunte immagini satellitari live, fulmini osservati, tornado, incendi, cicloni o rilevazioni certificate di grandine. Le segnalazioni grandine restano contributi degli utenti con orario e zona dichiarata. L'app non può mostrare tutto ciò che accade sul pianeta in tempo reale con queste sole fonti.

Google Photorealistic 3D richiede API abilitata, chiave e fatturazione Google Cloud. Non risulta configurato in questo progetto e non è stato aggiunto un nuovo servizio a pagamento. Il servizio riguarda la geografia fotorealistica, non un flusso di precipitazioni. [Requisiti Google](https://developers.google.com/maps/documentation/tile/3d-tiles).

## Continuità fra PC

Sorgente e aggiornamento destinati allo stesso progetto online. Il PC principale può riprendere il progetto accedendo allo stesso account/spazio di lavoro. Il sito usa gli stessi dati pubblicati; bozze, località e preferenze del browser restano locali. Nessun collegamento remoto o sincronizzatore di cartelle è stato configurato. La richiesta persistente è registrata in AGENTS.md, PROJECT_STATUS.md, RIPRENDI-QUI.md e nel messaggio di ripresa.

## Verifiche

247 controlli superati: 42 Climate, 49 Atlas, 49 Atmosphere, 71 Lente, 36 mappa grandine. API simulate e database isolati verificano campi/unità, valori mancanti, limiti GPU, range temporale, cache, sorgenti, perimetro IA, filtri e conservazione dei consensi. Richiesta reale di lettura a Open-Meteo riuscita per tutti i nuovi campi current/hourly; unità e intervallo 900 secondi confermati. Build del Worker e asset riuscita. Nessun post di prova pubblico; nessuna prova su telefoni fisici o misurazione di prestazioni del globo. Il rendering e la riproduzione non sono stati verificati in browser in questa consegna.

## Correzione successiva e preparazione Google

La verifica successiva dei termini regionali mostra che Photorealistic 3D Tiles non è disponibile per nuovi progetti con fatturazione italiana/SEE. Chiave e fatturazione non sono quindi sufficienti per quella API. La preparazione separata del servizio Maps JavaScript / Immersive Maps è descritta in `GOOGLE-3D-SETUP.md`; resta disattivata e senza prova del motore reale finché non vengono configurati account, chiave e quote.
