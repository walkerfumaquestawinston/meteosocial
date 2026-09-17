# B2 — verifica delle integrazioni, 17 settembre 2026

Stato: ricerca completata; integrazione NON attiva. Il sito pubblicato resta alla versione 62. Nessun endpoint, dato, servizio a pagamento o automatismo modificato.

## Quanto esiste già

server/growth.js e dist/growth.js conservano una previsione durante consultazioni tra le 06 e le 08, poi confrontano due aggiornamenti Open-Meteo dalle 21. Non misurano accuratezza osservata. Il gateway B1 conserva copie online con l'ora di acquisizione, durante le consultazioni. Non è stato trovato un handler scheduled nel progetto. Il dettaglio Sites consultato non espone automazioni: questo non prova che la piattaforma non le supporti, ma non consente di confermarne o configurarne una qui. Le automazioni ChatGPT esposte sono attività dell'assistente, non un trigger HTTP garantito per questa applicazione; non sono state create come sostituto.

## Fonti primarie verificate

- Meteostat hourly JSON: https://dev.meteostat.net/api/stations/hourly.html — osservazioni di stazioni, ritardo tipico 2–3 ore; alcuni dati possono arrivare molto dopo. model=true è il default: usare model=false per non riempire i vuoti con stime. Temperatura e precipitazione oraria possono mancare separatamente.
- Accesso JSON: https://dev.meteostat.net/api — chiave RapidAPI e piano richiesti. Nessuna chiave creata, nessun piano sottoscritto. Non assumere che una chiave meteo/OpenAI già esistente valga per questo servizio.
- Dati gratuiti: https://dev.meteostat.net/data/timeseries — accesso senza chiave, pubblicazione dei dati orari recenti indicata entro 24 ore. Non adatto a promettere completezza alle 21.
- CSV hourly: https://dev.meteostat.net/data/timeseries/hourly — archivi includono sostituzioni del modello e colonne *_source. Prima di importarli occorre verificare e filtrare la provenienza per ogni variabile, non solo per riga. Mai considerarli tutti osservati.
- Inventario: https://dev.meteostat.net/data/weather-stations — metadati e disponibilità per stazione. Inventario e archivio Pescara verificati nel seguito: nessuna stazione rappresentativa della città validata.
- Regione Marche: https://www.regione.marche.it/Regione-Utile/Protezione-Civile/Progetti-e-Pubblicazioni/Annali-Idrologici — il portale SIRMIP/SOL richiede registrazione. Gli annali PDF non sono un flusso orario in tempo reale. Nessun endpoint privato ipotizzato né accesso automatizzato configurato.

## Proposta concreta per l'attivazione, ancora da implementare

1. Validare almeno una stazione pilota: coordinate, quota, provenienza, copertura effettiva di temperatura/pioggia, ritardi, unità e intervalli temporali. Non attribuire alla città una misura remota senza dichiararne posizione e distanza. Confrontare la previsione emessa per il punto di misura, oppure dichiarare e valutare esplicitamente la differenza spaziale.
2. Alle 08 Europe/Rome acquisire e congelare la previsione per le cinque fasce. Conservare timestamp effettivo e ora prevista del job; se il job salta, non ricreare dopo una previsione del mattino. Conversione UTC/DST verificata.
3. Alle 21 produrre solo un riepilogo delle fasce osservate disponibili. La fascia delle 21 non può essere obbligatoriamente pronta alle 21 con una fonte in ritardo; aggiornare lo stato quando arrivano misure valide, conservando tutte le revisioni e il loro orario. Nessun dato mancante contato come zero o successo.
4. Allineare le finestre di accumulo pioggia e le ore della temperatura prima di applicare le soglie. Soglia temperatura >3°C prevista dalla specifica; la definizione binaria di pioggia va resa esplicita e verificata rispetto alla sensibilità dello strumento. Separare esito pioggia/esito temperatura e denominatori.
5. Mostrare fonte, stazione, fascia, previsione congelata, osservazione, orario di verifica e numero di fasce confrontabili. Chiamare il risultato parziale finché mancano fasce. Nessun punteggio 0/0 presentato come accuratezza.
6. Collegare uno scheduler infrastrutturale al progetto con autenticazione server, idempotenza e registro esecuzioni. Due orari in Europe/Rome e un recupero dati ritardati; nessuna chiave negli URL pubblici. Non dichiarare questo servizio attivo prima di un'esecuzione verificata.

## Blocco effettivo

Mancano una fonte osservativa validata per il pilota e un collegamento eseguibile allo scheduler dell'app. Cercato Cloudflare nel catalogo plugin disponibile: nessun risultato restituito; non è prova dell'assenza del prodotto o di ogni possibile integrazione. Non richiesto di acquistare servizi o consegnare chiavi prima di validare copertura e accesso. Non pubblicate modifiche cosmetiche per simulare un avanzamento funzionale.

## Verifica concreta del catalogo e dell’archivio — 17 settembre 2026

Scaricato il database ufficiale completo (32.497.664 byte), interrogato in sola lettura, senza filtro per paese. Coordinate città arrotondate: 42,95 / 13,88; distanze geodetiche in linea d’aria. Questi risultati descrivono il catalogo Meteostat, non tutte le stazioni meteorologiche esistenti.

| Stazione | Distanza | Quota | Limite per il pilota |
| --- | --- | --- | --- |
| 16229 Gran Sasso | 57,5 km | 2.138 m | Quota e distanza incompatibili con una verifica locale sulla costa |
| 16192 Loreto / Montarice | 57,9 km | 196 m | Inventario temperatura osservata storico; dati recenti anche da modello |
| 16230 Pescara | 63,1 km | 10 m | Archivio disponibile, ma pioggia non rappresentativa di San Benedetto |

Scaricato anche https://data.meteostat.net/hourly/2026/16230.csv.gz e letto per nome di colonna. Contiene 6.449 righe, comprese ore future con fonte dwd_mosmix: non può essere trattato integralmente come osservazioni. Prima del 17 settembre UTC, temperatura e precipitazione con etichetta dwd_poi arrivano al 16 settembre ore 14 UTC; quelle con dwd_mosmix alle 23 UTC. Il catalogo riportava per dwd_poi il 12 settembre: l’inventario è quindi meno aggiornato dell’archivio e non basta per certificare la disponibilità. Le etichette sono riportate, non trasformate in una certificazione della misura o del suo intervallo di accumulo.

Esito: non usare questi dati per assegnare un voto alla previsione di San Benedetto. Un eventuale pilota a Pescara richiederebbe previsione sulle coordinate della stazione, verifica della provenienza e dell’accumulo orario, gestione dei ritardi; non è stato attivato automaticamente.

Controllo ripetibile: tools/audit-b2-stations.py. Risultato ridotto con hash degli input: tools/b2-coverage-audit.json. Gli archivi completi non sono nel repository. Nessuna chiave acquistata o richiesta, nessun endpoint pubblico aggiunto, nessuna modifica alla produzione. Per proseguire a San Benedetto serve una fonte locale autorizzata (es. rete regionale) e resta necessario lo scheduler applicativo descritto sopra.

## Implementazione preparatoria del confronto

Il motore server/observed-verdict.js è pronto e verificato con test-observed-verdict.mjs, ma NON importato dal Worker: non aggiunge endpoint, job, accessi a fonti o schermate. Il suo contratto usa timestamp UTC in millisecondi, temperature in °C, precipitazione in mm sull’ora che termina al timestamp. L’adapter dovrà convertire e validare le misure del fornitore e generare le cinque fasce italiane (compresa l’ora legale). La lista di fonti ammesse è vuota implicitamente: senza configurazione non produce confronti.

La funzione richiede una copia forecast identificata e antecedente a tutte le finestre confrontate. Questo controllo non sostituisce lo storage immutabile né l’autenticazione dell’ingestione: gli input devono essere esclusivamente server-side. Il confronto non decide quale revisione osservativa sia autorevole: in caso di duplicati rifiuta la variabile, invece di scegliere silenziosamente. Restituisce dettagli e stato parziale/completo/indisponibile; la persistenza delle revisioni è ancora da integrare. Il numero di fasce sbagliate considera solo quelle con entrambe le variabili, accompagnate da contatori separati per temperatura e pioggia.

Esecuzione locale: `node test-observed-verdict.mjs`. I dati sintetici dei test non entrano nella produzione. Nessun valore osservativo fittizio e nessuna soglia pioggia predefinita sono stati aggiunti al prodotto.

## Percorso regionale verificato e richiesta pronta

La pagina ufficiale https://www.regione.marche.it/Regione-Utile/Protezione-Civile/Progetti-e-Pubblicazioni/Meteo collega Rete MIR Tempo Reale a https://retemir.regione.marche.it/login e richiede registrazione. Non documenta in quella pagina un’API pubblica. La pagina del Centro Funzionale Multirischi conferma il recapito istituzionale riportato nella bozza docs/RICHIESTA-DATI-MARCHE.md. La bozza chiede anche la distinzione fra accesso di consultazione e integrazione automatica. Non è stata inviata. I tentativi di lettura di MIR/SOL/AMAP/Allerta hanno dato errori di rete da questo ambiente: nessuna conclusione sulla loro disponibilità generale. Nessuna fonte locale validata o autorizzazione di riutilizzo ottenuta.
