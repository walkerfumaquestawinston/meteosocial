# E2 — Scuole, domande alla zona e prima risposta

## Perimetro autorizzato
Dopo verifica delle dipendenze mancanti, il proprietario ha autorizzato l'anticipo delle parti H2/G2 necessarie a E2. Non è il completamento di tutto H2 o G2: nessuna domanda libera, altri tipi di push, gruppi evento o notifiche di arrivo di una persona.

## Esperienza
Nel bollettino con allerta attiva compare il collegamento a #scuole. Anche il server ricontrolla il bollettino prima di accettare la domanda. Nessuna allerta nota o fonte non verificabile non viene interpretata come scuole aperte. La domanda riguarda domani, con data esplicita in ora italiana, e scade dopo due ore. Una domanda ogni 30 minuti, retry con identico ID idempotente.

Le persone condividono volontariamente una posizione recente per vedere le domande entro circa 5 km. Le presenze sono considerate recenti per 10 minuti. Chi risponde condivide nuovamente la posizione e conferma il comune: Chiuse / Aperte / Non si sa ancora, link HTTPS facoltativo. Le risposte con link vengono prima, senza definirle verificate o ufficiali. Nessun nome o coordinate degli autori è restituito nelle risposte. Zero presenze resta zero.

Alla prima risposta, un avviso privato nell'app; Web Push facoltativo dopo la prima segnalazione del cielo. Solo consenso esplicito, Non ora rimanda di 7 giorni, disattivazione disponibile. Massimo 2 tentativi di invio al giorno per identità, fra le 7 e le 22 Europe/Rome, una consegna al browser registrato più recentemente. Messaggi senza payload personale, firmati VAPID tramite Web Crypto. Destinazioni limitate ai servizi push riconosciuti; redirect vietati. La chiave privata vive soltanto nella configurazione runtime.

Le risposte segnalate vengono oscurate e appaiono nel pannello di moderazione già protetto, insieme ai post e alle segnalazioni meteo. Rimozioni e blocchi valgono anche per questo flusso.

## File
- server/questions.js: API domande, presenza, risposte, avvisi privati, scadenza e segnalazione abusi.
- server/answer-push.js: preferenze, registrazioni, invio VAPID, limiti e silenzio notturno.
- server/worker.js: instradamento, contesto di esecuzione delle consegne e stato delle capacità.
- server/moderation.js, dist/moderation.js: revisione/rimozione delle risposte e blocchi.
- db/schema.ts, drizzle/0016_jittery_major_mapleleaf.sql e metadati: nuove tabelle additive e indici.
- dist/schools.js: schermata, risposte, permessi volontari, avvisi, aggiornamento ogni minuto mentre visibile.
- dist/main.js, dist/atmosphere.js: rotta e ingresso solo dall'allerta attiva.
- dist/sw.js: v36, ricezione push e apertura della schermata, nessuna cache delle API.
- build.mjs e output generati dist/server/index.js, dist/.openai/drizzle: modulo e migrazione.
- .env.example: nomi delle due impostazioni Web Push, senza valori segreti.
- test-schools.mjs: prove isolate del flusso e delle protezioni.
- PROJECT_STATUS.md, PROJECT_VISION.md: continuità.

## Prove e limiti
Test isolati con dati sintetici non pubblicati: allerta assente/attiva, autenticazione, limite 30 minuti, retry, distanza/consenso/età posizione, privacy, priorità link, notifica unica, proprietà dell'avviso letto, opt-in, destinazioni push, firma VAPID verificata crittograficamente, tetto giornaliero e fascia notturna, scadenza, moderazione. Regressioni moderazione e sky verificate. Build e controllo sintattico dei moduli effettuati.

Non è stata verificata una consegna su un telefono reale: dipende da browser, installazione PWA ove richiesta e consenso del proprietario del dispositivo. Non sono state inviate notifiche di prova a utenti reali. Non è un servizio di emergenza.

Le notifiche in attesa durante la notte non hanno un cron autonomo: vengono riconsiderate alla consultazione, solo se la domanda è ancora valida. Quelle scadute non partono; gli errori del servizio push restano consultabili come risposte nell'app, senza promessa di recapito. TTL di consegna conservativo; il sistema operativo può influire su visualizzazione e tempistica.

La posizione dichiarata dal browser non è una prova fisica infallibile. Le coordinate persistite sono arrotondate; il raggio non certifica i confini comunali. Si chiede esplicitamente di confermare il comune e controllare l'ordinanza. I link non sono verificati automaticamente. Le domande scompaiono dalle API pubbliche dopo 2 ore; i dati oltre 24 ore vengono eliminati alla successiva scrittura. Le preferenze e i token di registrazione sono dati riservati di servizio.

Riferimenti tecnici: https://datatracker.ietf.org/doc/rfc8292/ e https://developer.mozilla.org/en-US/docs/Web/API/Push_API .
