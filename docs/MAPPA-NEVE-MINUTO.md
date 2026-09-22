# Mappa, neve e controllo delle fonti — 22 settembre 2026

La mappa controlla le fonti ogni 60 secondi quando è visibile. Il controllo non trasforma previsioni e radar in misure al minuto: l'interfaccia distingue ultimo controllo, orario del modello per il luogo selezionato e fotogramma radar. I dati mancanti o vecchi vengono indicati. Le copie delle previsioni sul server mantengono la propria cache di 15 minuti.

Il livello Neve mostra neve fresca prevista, distinguendo quantità mancanti da zero. Esplora presenta le fasce orarie, la neve fresca in cm, lo spessore al suolo convertito da metri a cm, lo zero termico in metri e la visibilità in km. Lo zero termico non viene presentato come quota neve. Le segnalazioni Neve sono accettate anche dal percorso rapido della mappa, con le regole di autenticazione e scadenza esistenti.

Il radar parte dal quadro più recente. A ogni controllo riusa le immagini se il manifest è invariato; conserva una selezione storica e segue i nuovi quadri quando si sta guardando l'ultimo. Richieste sovrapposte sono riunite. Le etichette meteo hanno limiti inferiori sui telefoni; gli zeri non affollano la mappa. A 320 px i sei livelli occupano due righe.

Lente IA riceve anche neve, spessore, zero termico, visibilità e anzianità del modello calcolata sul server. Le istruzioni chiedono risposte locali, brevi e verificabili, con limiti e intervalli espliciti. Modello, connessione e credenziali esistenti restano invariati. Non è una nuova rete di sensori né una verifica statistica dell'accuratezza dell'IA.

Validazione: build riuscita; 63 suite attive superate, zero errori, cinque contratti storici esplicitamente ritirati. Test dedicati a dati neve mancanti, unità, dati vecchi, invio del contesto IA, primo fotogramma radar, riuso delle immagini e conservazione della selezione. Verifica browser locale a 390 e 320 px, dettagli neve e zero termico; nessun benchmark fisico di batteria o FPS. Nessuna segnalazione di prova pubblicata.

Riferimenti: [variabili e intervalli Open-Meteo](https://open-meteo.com/en/docs), [istruzioni e contesto OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering).

Continuare sulla PR draft #21, ramo GitHub codex/weather-scenery-20260922. Pubblicazione e identificativi definitivi in PROJECT_STATUS.md.
