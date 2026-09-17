# MeteoSocial: implementazione web e architettura globale

## Stato della consegna

Il client attuale è un sito JavaScript con Worker, D1 e R2. L’aggiornamento conserva account e community e aggiunge avatar, vocali, referral, Stories fotografiche, ripari condivisi e gruppi. Non è una build Expo o Flutter. `GlobalDashboard.tsx` è il componente di presentazione proposto per il futuro client React Native; `global-schema.sql` è lo schema PostgreSQL/PostGIS di destinazione, separato dalle migrazioni D1 realmente eseguite.

La nuova UI usa navy, bianco e cyan. Meteo Play e Meteo Cinema mantengono i nomi richiesti. Il 3D usa una scena leggera, animazione iniziale limitata e rendering statico dopo l’ingresso. La condivisione PNG include il fotogramma dell’avatar.

Le chiamate OpenAI sono predisposte per `gpt-6-astra`. Senza `OPENAI_API_KEY`, le funzioni restituiscono uno stato esplicito non disponibile. I roast editoriali sono etichettati come tali. Nessuna richiesta reale al modello è stata verificata con credenziali in questa sessione.

## 1. Validazione delle segnalazioni

Separare quattro cose: dichiarazione dell’utente, contenuto visibile, corroborazione indipendente e validazione professionale. Una foto convincente non prova luogo, data o autenticità.

Pipeline di destinazione:

1. Upload con autorizzazione e limite di dimensione in quarantena.
2. Decodifica reale del file, controllo durata, rimozione metadati, scansione e moderazione.
3. SHA-256 per duplicati esatti; impronta percettiva come indizio, non prova di contraffazione.
4. Per video: estrazione fotogrammi con timestamp; trascrizione audio tramite servizio dedicato.
5. Astra riceve fotogrammi e trascrizione come dati non fidati. Output validato contro uno schema con tag universali.
6. Associazione spazio-temporale con radar e segnalazioni indipendenti. Autori correlati non contano come evidenze indipendenti.
7. Pubblicazione con stato e provenienza; i casi incerti vanno in revisione.

L’API attuale `/api/global/analyze` analizza soltanto una foto propria già pubblicata, dopo un’azione esplicita. Salva tag, riepilogo e incertezze. Restituisce `hailDiameterMm: null` e `confidence: null`: non inventa misure o percentuali calibrate.

Per misurare grandine serve un riferimento metrico valido sullo stesso piano, controllo prospettico, segmentazione e intervallo di errore. Una moneta sconosciuta o una mano non bastano. Non convertire una confidenza linguistica del modello in probabilità meteorologica.

La documentazione di [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) indica testo e immagini; audio e video non sono modalità dirette supportate. La [guida Vision](https://developers.openai.com/api/docs/guides/images-vision) documenta limiti spaziali e possibilità di errori. Non è dimostrata una validazione completa in millisecondi.

## 2. Lingue e traduzioni

Ogni contenuto conserva lingua originale, testo originale e versione/hash. La traduzione è un derivato, mai una sostituzione irreversibile. Chiave cache: contenuto + hash + lingua + versione prompt/modello. I sottotitoli futuri mantengono timestamp separati dal testo tradotto.

L’app web permette di richiedere traduzioni dei post in italiano, inglese, tedesco, francese e spagnolo. Le etichette delle nuove sezioni sono parzialmente localizzate; l’interfaccia precedente rimane prevalentemente italiana. Non è dichiarata una localizzazione completa.

Per allerte ufficiali preferire la versione linguistica fornita dall’autorità. Conservare sempre originale, fonte, severità, validità e incertezze. Traduzioni IA etichettate e sottoposte a valutazioni bilingui prima dell’uso operativo. Nessuna promessa di traduzione infallibile.

## 3. Ripari e collisione con celle

Nell’app attuale i luoghi sono inseriti dagli utenti: nome, punto pubblico, accesso e limitazioni. Posti totali e disponibili sono sconosciuti. Non rappresentano ripari certificati. L’autore può rimuoverli; altri utenti possono segnalarli.

Per il motore futuro usare una sequenza di poligoni probabilistici da un servizio di nowcasting, non una direzione dedotta da un singolo post. Il vento al suolo non equivale al moto della cella. Gestire crescita, dissoluzione, divisione, fusione e mancata copertura radar.

Algoritmo strutturale:

```text
for each fresh forecast run:
  reject expired or unsupported products
  retain calibrated hail polygons at 1-minute horizons up to 15 minutes
  select candidate subscriptions using spatial index
  intersect each subscription uncertainty area with each forecast polygon
  derive first/last intersection times and confidence band
  exclude expired location consent and stale location snapshots
  deduplicate by user + cell + run/severity transition
  enqueue localized message with expiry, source and uncertainty
```

Esempio PostGIS per candidati, da adattare al prodotto calibrato:

```sql
SELECT s.user_id, MIN(f.valid_at) first_intersection,
       MAX(f.valid_at) last_intersection
FROM meteo.location_subscriptions s
JOIN meteo.cell_forecasts f
 ON ST_DWithin(s.position, f.polygon, s.accuracy_m + f.uncertainty_m)
WHERE s.expires_at > now()
  AND s.observed_at > now() - interval '15 minutes'
  AND f.run_at > now() - interval '5 minutes'
  AND f.valid_at BETWEEN now() AND now() + interval '15 minutes'
  AND f.hazard = 'hail'
GROUP BY s.user_id;
```

Questa query individua candidati, non produce da sola una previsione validata. Le soglie temporali dipendono dal provider. Con geografie PostGIS usare distanze metriche e testare antimeridiano, confini e latitudini elevate. Il tempo di arrivo va comunicato come intervallo quando il modello lo giustifica.

La disponibilità parcheggi deve avere una fonte, un timestamp e una scadenza breve; altrimenti è `null`. La distanza in linea d’aria non è un percorso sicuro. Nessun messaggio deve suggerire di mettersi in viaggio durante un evento per raggiungere un riparo non verificato.

## 4. Feed e contenuti esterni

La prima implementazione riusa le foto e i post reali della community, con paginazione, originale visibile e controlli di traduzione/analisi. Il feed non finge utenti attivi. I video verticali, transcodifica adattiva e sottotitoli sincronizzati richiedono la pipeline media ancora da distribuire.

Nel backend di destinazione separare sorgenti `user`, `editorial`, `licensed_external`. Un connettore esterno richiede API/accordi disponibili, identificativo originale, autore, URL, diritti, scadenza e procedura di rimozione. Incorporare un contenuto autorizzato non equivale al diritto di scaricarlo e ripubblicarlo. Gli adapter non devono aggirare login o restrizioni delle piattaforme.

La ricerca di contenuti può produrre candidati, non certificazioni. I controlli di data e luogo producono evidenze e stato incerto quando non risolvibili. Nessuna acquisizione continua o scraping social è attivo nella consegna.

Per ranking iniziale: prossimità approssimata, freschezza, qualità delle evidenze e diversità degli autori; penalizzare duplicati. Conservare un feed cronologico alternativo. La scelta degli emoji non influenza direttamente la verifica dell’evento.

## 5. Rischio storico grandine

Definire prima il target: ad esempio probabilità climatologica di almeno un evento con diametro sopra una soglia, entro una determinata area e finestra stagionale. Non sommare semplicemente il numero di post: popolazione e partecipazione distorcono i risultati.

Servono archivio multiannuale, metadati di copertura, normalizzazione radar, eventi verificati e analisi dei cambiamenti strumentali. Split di validazione per anni e aree geografiche, senza contaminazione tra vicini. Calibrazione probabilistica e verifica per stagione/paese.

Memorizzare probabilità, intervallo, numero di anni, copertura, definizione del target, dataset e modello. Il punteggio 1–100 è una trasformazione esplicitamente definita; non è automaticamente una probabilità percentuale. Se la copertura è insufficiente il risultato è `null`.

La UI attuale mostra “Dati non disponibili”, mai 0 o verde rassicurante. Il modello linguistico può spiegare un risultato statistico già calcolato; non deve inventarlo dalla conoscenza generale.

## 6. Clans e ricompense

La versione web permette di entrare in un gruppo e mostra il numero reale di membri. Non assegna reputazione meteorologica in base alla popolarità. Storm Coins restano a zero finché manca una verifica operativa.

Lo schema globale usa un ledger append-only: premio con chiave idempotente, evidenza e motivo. Revoche tramite movimento compensativo, non cancellazione del passato. Nessun endpoint pubblico accetta un saldo o un incremento arbitrario. Classifica con periodo, regole antiabuso e numero minimo di contributi indipendenti.

I referral dell’avatar contano account distinti con profilo completato. Questo è un controllo iniziale, non una protezione completa contro identità multiple. Prima di campagne incentivanti servono limiti, monitoraggio e revisione degli abusi.

## 7. Provider meteorologici

Contratto proposto:

```ts
type Capability = 'forecast' | 'radar' | 'official_alerts' | 'hail_nowcast';
interface Provider {
  id: string;
  capabilities: Capability[];
  covers: (lat: number, lon: number) => boolean;
  maxAgeSeconds: number;
  attribution: string;
  license: string;
  fetchProduct: (query: GeoQuery) => Promise<NormalizedProduct>;
}
```

Selezione per coordinate e poligono di copertura, non per lingua del telefono. Un italiano in Texas riceve il provider appropriato alla zona, mantenendo italiano e unità preferite. Forecast, radar e allerta hanno adapter distinti. Se un prodotto non è disponibile, non sostituirlo silenziosamente con un altro tipo.

[Radar-DPC](https://mappe.protezionecivile.gov.it/it/mappe-e-dashboard-rischi/piattaforma-radar/) descrive la piattaforma nazionale e licenza CC-BY-SA. [MeteoAlarm](https://api.meteoalarm.org/) espone allerte europee, non un radar. [NWS](https://www.weather.gov/documentation/services-web-api) espone previsioni, osservazioni e allerte; i prodotti radar richiedono il servizio corretto.

La consegna web offre collegamenti ufficiali e selezione dell’area. Non importa ancora mosaici radar né attiva nowcasting. I dati meteo già funzionanti rimangono Open-Meteo; non vengono sostituiti con WeatherAPI senza credenziali.

## 8. Dati e crescita

Vedere `global-schema.sql`. Le localizzazioni per notifiche sono separate dal profilo pubblico, con consenso e scadenza. Gli URL firmati non sono salvati come identificativi permanenti: si conserva la chiave dell’oggetto. I controlli RLS sono attivi per default; le policy applicative e i ruoli vanno completati durante il collegamento al sistema di autenticazione.

Evoluzione: client → API → PostGIS + object storage → outbox → code → worker media/IA/traduzione/notifiche. Scrittura autorevole per regione, cache CDN per media approvati, repliche di lettura dove servono. Partizionare per tempo/regione soltanto quando i volumi lo giustificano.

Ipotesi di capacità, non benchmark: 10.000 utenti giornalieri × 20 letture feed = 200.000 richieste/giorno, circa 2,3 richieste/s medie. Progettare e misurare un picco iniziale di 50 richieste/s; gli upload e i temporali possono concentrare il carico molto oltre la media. L’IA non deve essere nel percorso sincrono di ogni lettura.

Code con retry limitato, backoff, dead-letter queue, idempotenza e limite di spesa per funzione. Monitorare p95/p99, età delle code, errori dei provider, costi per contenuto e percentuale di dati mancanti. Nessun sistema è infinitamente scalabile o senza costi.

## 9. UX e client mobile

Navy `#0A192F`, superfici `#10243B`, bianco, cyan. Usare grigio per sconosciuto; il cyan è accento interattivo, non prova di sicurezza. Arancione/rosso soltanto per uno stato definito da una fonte valida, sempre accompagnato da testo e icona. Nessun lampeggio necessario per capire un’allerta.

`GlobalDashboard.tsx` mostra il contratto del client React Native: radar iniettato, rischio nullable, lista virtualizzata, paginazione e testi esterni localizzabili. La UI web distribuita usa le stesse regole visive. Il rollout nativo richiede build firmate, test su dispositivi, permessi, push e revisione store.

## 10. Creator automatico

Progettare un job per area/lingua/finestra temporale, con dati meteo versionati e cutoff. Generare una sintesi testuale vincolata ai numeri; validare unità, date e località; renderizzare template deterministici; etichettare contenuto editoriale/IA e fonte. Deduplicare con area + intervallo + versione dati.

Con allerte gravi sospendere meme e tono ironico. Non trasformare in meme i media degli utenti senza autorizzazione. Se dati o IA falliscono, non pubblicare; ritentare entro la validità del contenuto. Le card della versione attuale si generano su richiesta, non attraverso un servizio editoriale continuo.

“Zero operazioni umane” non è un criterio affidabile per un social con contenuti di emergenza. Servono gestione abusi, rettifiche, escalation, rimozione contenuti e responsabilità editoriali, anche con automazione estesa.

## Ordine di attivazione e criteri

1. Pubblicare il client web verificato e conservare le funzioni esistenti.
2. Collegare una chiave OpenAI con budget; provare testo, immagine e traduzioni con dataset di valutazione.
3. Distribuire pipeline video/audio e moderazione prima di abilitare upload video pubblici.
4. Ottenere accesso e validare provider radar/nowcast e archivi storici.
5. Testare il motore di collisione in replay, senza inviare notifiche agli utenti.
6. Misurare falsi allarmi, mancate rilevazioni, lead time e copertura; abilitare una beta controllata.
7. Collegare push con consenso, ricevute, deduplicazione e scadenza.
8. Espandere paesi dopo verifica di copertura, lingua, licenze, latenza e procedure operative.

Test richiesti: JSON malformato, prompt injection in testo/immagine, lingua sconosciuta, file corrotti, duplicati, revoche, scadenze, autori bloccati, timezone/DST, antimeridiano, radar assente, parcheggio pieno, luogo chiuso, forecast obsoleto, notifica ripetuta, API senza credito e carico di picco. Un risultato sconosciuto non deve mai diventare un via libera.
