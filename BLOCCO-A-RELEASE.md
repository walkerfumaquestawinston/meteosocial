# Blocco A1–A3 — Il Decisore

Il Documento unico di sviluppo dell’utente sostituisce le direzioni precedenti. Questa consegna riguarda soltanto A1–A3; fermarsi prima del bloccoB. L’utente ha approvato le precisazioni: incertezza40–60% prioritaria con consiglio prudente; aggiunta percepita oraria; nessuna stima temporali al minuto; domenica descritta con dati, senza verdetto sulla balneazione; nessuna affermazione che il modello cambia idea senza serie di aggiornamenti.

## Funzione e dati
`decisione(previsione, finestraOraria)` in dist/decisione.js restituisce `{frase,dettaglio,certezza}`. La previsione usa la struttura oraria Open-Meteo già presente. Il nuovo argomento finestraOraria contiene tipo (ombrello/vestiti/bucato/weekend/temporale), inizio, fine e adesso, con date ISO locali della previsione. Le indicazioni opzionali restituiscono null quando non applicabili. Certezza indica indicativa/incerta/dati-insufficienti: non è una percentuale scientifica di affidabilità.

- Ombrello: usa massima probabilità e massima precipitazione della finestra.40–60% dà precedenza all’incertezza; oltre0,5mm o probabilità elevata suggerisce di portarlo. Dati mancanti non diventano zero. Nessuna promessa che non pioverà.
- Vestiti: valore percepito più basso della finestra arrotondato al grado per le soglie intere; gli estremi nel dettaglio mantengono un decimale. Differenza uscita/rientro maggiore di8°C aggiunge strati. Nessuna sostituzione con temperatura reale.
- Bucato: otto fasce intere dalla prima ora non precedente all’orario scelto; compare solo con precipitazione0, umidità<70% e vento>5km/h in tutte. Non garantisce asciugatura.
- Domenica: da giovedì a domenica mattina, dati10–19 completi; pioggia e vento con nomi italiani solo se direzione disponibile e velocità>5km/h. Nessun criterio marino inventato.
- Temporale: soltanto codici95/96/99 e precipitazioni previste nella prossima ora; mai dedotto dalla sola pioggia, nessun minuto di arrivo.

## Interfaccia e file
- dist/day-plan.js: frasi sopra i valori di uscita/rientro nella scheda esistente; stato dati insufficienti e aggiornamento aria-live. Non spostata la prima schermata.
- dist/main.js: aggiunto apparent_temperature alla richiesta oraria esistente, nessuna chiamata o chiave aggiuntiva.
- dist/design-system.css: un pannello decisioni con token già presenti; titoli20px, dettagli14px ink-3 su sky-notte. Contrasto dettagli verificato≥4,5:1 anche sul punto più chiaro del gradiente.
- build.mjs: nuovo modulo incluso negli asset pubblicati.
- dist/sw.js: modulo aggiunto alla shell, versione24.
- dist/server/index.js: output generato dal build.
- test-decisione.mjs:42 controlli soglie, dati mancanti, finestre, condizioni, integrazioneHTML e contrasto.
- PROJECT_STATUS.md e PROJECT_VISION.md: continuità aggiornata al documento unico. Nessun altro blocco avviato.

## Verifiche e limiti
42 nuovi controlli e15 controlli orari esistenti superati; build e diff validi. Nessuna nuova verifica browser o su telefono in questo blocco. Non abbiamo più modelli indipendenti per rilevare disaccordo fra modelli; non lo inventiamo. Il Decisore dipende dal meteo locale disponibile, non dalla presenza di utenti. Il429 del batch globale è un problema separato e non viene dichiarato risolto da questa consegna. Se la cache contiene una previsione precedente senza percepita oraria, il consiglio vestiti resta indisponibile fino al prossimo aggiornamento valido.
