# Fase 12 — solo 12.5 e 12.1

16 settembre 2026. Baseline pubblicata 28. Le richieste 12.2, 12.3 e 12.4 restano da fare, su istruzione successiva.

## Modifiche

- `dist/living-world.js`: riga temperatura/condizione/città prima del titolo, link al meteo completo, caricamento ed errore senza valori inventati. Il contatore mantiene dati e testo; la sua animazione passa al gestore comune (400 ms).
- `dist/main.js`: avvio del gestore feedback; recupero e rinnovo di un dato meteo recente nella stessa sessione, per la stessa località. Nessuna cache di dati di altre città.
- `dist/ui-feedback.js` (nuovo): ingresso sezione 180 ms/8 px, numeri aggiornati 400 ms (nessuna animazione se invariati), caricamento dopo 300 ms cancellabile; vibrazioni di conferma 18 ms ed errore 30/40/30 solo dal gesto di invio dell'utente. Rispetto di movimento ridotto, modalità eco, pagina nascosta e disattivazione esplicita delle vibrazioni. Il dato meteo in sessione scade dopo cinque minuti; storage assente/corrotto non blocca l'app.
- `dist/design-system.css`: riga di 44 px con token esistenti, risposta al tocco e transizioni, onda degli skeleton senza aggiungere elementi al flusso; disattivazione CSS degli effetti con movimento ridotto.
- `dist/atmosphere.js`: attesa del meteo Oggi con la stessa struttura di temperatura e metriche del contenuto caricato, invece della piccola riga che le precedeva.
- `dist/sky-community.js`: invio segnalazione con feedback aptico, protetto da try/catch. Nessuna vibrazione sugli aggiornamenti automatici.
- `build.mjs`, `dist/server/index.js`, `dist/sw.js`: inclusione del nuovo modulo e aggiornamento shell offline v18.
- `test-ui-feedback.mjs`: 23 verifiche di feedback/cache, inclusi tempi, annullamento caricamenti rapidi, città errata, dati scaduti, riduzione movimento e nessuna vibrazione automatica.
- `PROJECT_STATUS.md`, `RIPRENDI-QUI.md`: continuità; `qa/fase12-mobile.jpg`: schermata verificata.

## Verifiche e limiti

- Browser a 375×812: riga visibile senza scroll, 20 px, colore rgb(79,182,245), altezza 44 px, link apre `tendenze`; transizioni calcolate 120/120/200/200 ms. Nessuna violazione axe sulla vista Globo verificata.
- Movimento ridotto nelle impostazioni: transition 0s e animation none. I controlli automatici verificano anche la preferenza di sistema e l'annullamento degli effetti già avviati.
- 18 controlli avvio/import: nessun Three nella Home. I file di geometria, il renderer WebGL, l'import dinamico in experience, i token, i tre livelli e la navigazione non sono stati modificati.
- Lo skeleton della riga resta alto 44 px. Gli altri indicatori coprono il contenitore di attesa senza aggiungere altezza; non viene promesso che contenuti remoti di lunghezza sconosciuta (liste/foto) abbiano tutti la medesima altezza finale.
- Il primo valore reale dipende dalla rete e dalla risposta Open-Meteo: non si garantisce un secondo su ogni connessione. Con dato recente della stessa sessione, la riga è compilata al primo rendering, prima dell'import del globo.
- A 375 px il nome lungo della città è abbreviato visivamente per mantenere una sola riga; il nome completo resta nel selettore e nell'etichetta accessibile del link.
- Vibrazioni dipendenti da browser/dispositivo; sequenze verificate con API simulata, non su hardware mobile.

## Continuazione autorizzata: 12.2–12.4

- `dist/design-system.css`: testo dei titoli direttamente sul cielo distinto dalle superfici chiare; La tua redazione leggibile di giorno e notte. Foreground esplicito delle schede chiare in Studio, Redazione e viste correlate; etichetta Sky Drop scura sulla superficie chiara. Fondo body #0e1620 mantenendo i gradienti dinamici; fallback notte quando data-sky manca. Grassetti b/strong esplicitamente a --w-bold (700), evitando il bolder implicito del browser. Nessun font-weight:900 esplicito trovato nei fogli CSS analizzati.
- `dist/sw.js`: aggiornamento shell v19. `dist/server/index.js`: build degli stessi asset.
- `PROJECT_STATUS.md`, `RIPRENDI-QUI.md`, questo documento: continuità. `qa/fase12-profilo.jpg`: verifica visiva.
- Browser 375×812: axe senza violazioni nelle viste Profilo (giorno/notte), Fit Check, Studio e Redazione. Body misurato rgb(14,22,32) con gradiente presente; nessun elemento a peso 900 nel Profilo.
- Non sono modificati geometria, renderer, import dinamici, pillole, token, navigazione o conteggi. Nessuna nuova libreria.
