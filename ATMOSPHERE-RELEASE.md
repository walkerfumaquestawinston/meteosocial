# MeteoSocial — esperienza atmosferica

12 settembre 2026. Estensione della web app esistente (JavaScript/Three.js, Worker, D1, R2). Le funzionalità native e i servizi futuri del PRD non sono dichiarati operativi.

## Consegnato

- **Oggi**: temperatura e simbolo 3D, percepita/vento/minima/massima, prospetto pioggia orario e accessi a globo, meteo, community e creazione. Non inventa un countdown minuto per minuto. Cinque voci nella navigazione mobile, azioni ampie, introduzione facoltativa in tre gesti.
- **Città seguite**: aggiunta/rimozione persistente nel proprio account, riutilizzando i collegamenti D1; nessuna nuova localizzazione in background.
- **Globo**: luce solare geografica e terminatore giorno/notte approssimato; timeline −24/+24 ore su 35 città con serie orarie Open-Meteo, simboli e valori corrispondenti. Anche il passato è modello, non osservazione satellitare. Vista radar e segnalazioni mantengono tempi distinti. Toccando una città si può aprire il suo feed Stories.
- **Bollettini ufficiali Italia**: adattatore al repository pubblico DPC, decodifica TopoJSON e confronto geografico con zone di allertamento, validità giornaliera, attribuzione e fenomeni. Cache 10 minuti, richiesta limitata nel tempo, stato UNKNOWN per fonte assente/scaduta, punto non coperto o severità non interpretabile. Giorno corrente: edizione today oppure tomorrow del giorno precedente se non è ancora presente today.
- **Lente**: voci Essenziale, Arcade, Premuroso e Cinico. Override server: allerta rossa ufficiale → risposta deterministica senza chiamata generativa; gialla/arancione, codice temporalesco, caldo/raffiche sopra soglia → tono prudente; stato ufficiale non verificabile → niente ironia. Le soglie del modello NON creano allerte ufficiali. Fonti leggibili e accessi alle indicazioni ufficiali/stanza in emergenza.
- **Meteo Clash**: due città selezionabili, dati e orari, apertura delle rispettive community, card verticale PNG 1080×1920 con fonti. Condivisione file se supportata, download alternativo. Aggiornamento richiesto prima di esportare dati conservati oltre 10 minuti.
- **Studio**: cinque gruppi Clip/Testo/Meteo/Stile/Firma senza perdita di bozza o media passando tra strumenti. Riutilizza i montaggi e le esportazioni esistenti. Fonte immutabile nell’esportazione con dicitura «Meteo al montaggio».
- **Testimonianza adesso**: fotografia dalla fotocamera, sessione server di tre minuti, anteprima e consenso prima della pubblicazione; nessun selettore galleria, nessun microfono. Stop camera alla navigazione/background, foto e bozza conservate in memoria, download originale. Ticket autenticato, proprietà controllata, uso singolo/idempotenza, impronta SHA-256 e segnalazione con scadenza di due ore.
- **Guida** aggiornata con provenienza, limiti e funzionamento dei nuovi percorsi.

## Dati e riservatezza

Lente mantiene l’ambito autorizzato: previsioni, località, bollettino; solo su richiesta testi pubblici e ultime tre coppie domanda/risposta. Nessun GPS, autore, foto, video o audio nel payload OpenAI. Le coordinate sono usate dal server per la fonte meteo e il confronto geografico locale dei poligoni ufficiali. Nessuna chiave in browser o archivio di pubblicazione.

La sola fotocamera non dimostra autenticità: client/API possono essere alterati, una scena può essere ripresa da uno schermo, la città è dichiarata. La dicitura pubblica è «Ripresa dichiarata nell’app … evento non verificato», non «verificato dall’IA». Non si stima il diametro della grandine e non si premia l’esposizione a pericoli.

## Architettura e migrazione

- `dist/atmosphere-core.js`: funzioni deterministiche per geometria, severità, luce solare e interpretazione oraria.
- `server/atmosphere.js`: DPC, timeline, città seguite e ticket di acquisizione.
- `dist/atmosphere.js` / `dist/atmosphere.css`: Home, Clash, acquisizione, bollettini e collegamenti ai controller esistenti.
- Integrazione in Atlas/Planet, Lente, Studio, router e build Worker esistenti.
- Migrazione additiva `0008_noisy_shotgun.sql`: tabella `capture_tickets` e indici. Nessuna cancellazione di dati precedenti. Rollback applicativo possibile mantenendo la tabella inutilizzata.

## Verifiche

280 controlli automatici superati: Atmosphere 49, Lente 63, Atlas 49, Editorial 37, Network 41, Fit Check 41. Database isolati in memoria, richieste simulate per emergenze/errori, nessun post di prova pubblico. Controlli specifici su: geometrie/fori, precedenza delle allerte, stato sconosciuto, payload IA, proprietà/scadenza ticket, duplicati, hash, feed, preferenze account, file, quote e dati pioggia mancanti.

Verifica con servizi reali: bollettino DPC di Torino del 12/09/2026 correttamente associato alla zona Pianura Torinese e Colline; Open-Meteo restituisce 49 ore per 35 città; una richiesta Lente reale con dati pubblici di Torino ha ricevuto risposta.

Anteprima browser: Home, Globo/timeline con tastiera e apertura città, Stories locali, schede Studio e bozza conservata, Clash, pagina Lente; larghezze 390 e 320 px senza overflow orizzontale nelle viste controllate; nessun errore console nelle interazioni osservate. Non sono prove su telefoni fisici, lettori di schermo, fotocamere hardware o tutti i browser. Esportazione Clash azionata in anteprima, non condivisa su social esterni.

## Parti del PRD ancora da realizzare/collegare

- Countdown pioggia al minuto e movimento volumetrico futuro delle nuvole: richiedono copertura nowcasting e dataset/servizi dedicati. La timeline consegnata cambia dati e simboli, non inventa animazioni di sistemi meteorologici.
- War Room derivata direttamente da allerta con spettatori/live: restano le Storm Rooms temporanee già esistenti; questa release le collega dai bollettini ma non converte i relativi criteri di apertura in una nuova piattaforma live.
- Flash Report simultaneo basato su evento e push a app chiusa: è pronta la sessione manuale di acquisizione, non il servizio di scheduling e consegna push.
- Streaming IRL, ingestione Kick, Co-Op split screen e moderazione video: richiedono servizio streaming, consenso creator e operazioni di moderazione. Clash confronta dati, non due dirette.
- Dual camera nativa, rimozione sfondo/AR, widget iOS/Android, geocaching e nuovi loot evento: non implementati da questo sito web. Gli asset editoriali esistenti restano disponibili secondo i propri criteri.
- Autenticità anti-fake garantita, copertura ufficiale globale, latenza zero, disponibilità certa dei ripari e sicurezza offline completa: non promesse né simulate.

## Fonti

- DPC: https://github.com/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica — CC BY 4.0. Interpretazione dei poligoni e presentazione adattate da MeteoSocial.
- Previsioni e timeline: https://open-meteo.com/
- Radar recente già integrato: https://www.rainviewer.com/
- Geografia fotografica del globo: NASA Blue Marble, attribuzione e documentazione dell’asset già incluse nel progetto.
