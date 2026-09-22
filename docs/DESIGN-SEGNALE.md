# Segnale — revisione del 22 settembre 2026

## 22 settembre 2026 — Leggibilità e ingresso semplificato

Revisione successiva alla versione 74, su richiesta dell'utente dopo riscontro di testi illeggibili e sovraccarico visivo. L'ingresso senza hash apre Oggi. Tre azioni esplicite: Previsioni, Mappa e radar, Segnala il meteo. Ricerca città diretta; barra inferiore con Segnala. Funzioni aggiuntive e pianificazione restano in sezioni apribili. Lente nella mappa è apribile su richiesta. Dati, fonti e bollettini ufficiali restano disponibili.

Corrette coppie testo/sfondo in Oggi, Meteo, community e controlli mappa nelle fasi solari. I pannelli specialistici storici conservano superfici scure con testo chiaro. Testi e superfici semantiche delle quattro palette superano 4,5:1 (minimi: giorno 4,90; notte 8,18; alba 4,83; tramonto 4,57). Controllo DOM e visivo di giorno/notte su anteprima integrata, desktop e 390 px; corrette anche etichette tagliate. Il controllo DOM è un audit mirato, non una certificazione completa: gradienti e illustrazioni sono verificati visivamente. Nessuna segnalazione di prova pubblicata.

Compilazione completa riuscita con fallback WASM. Superati test-atmosphere, test-feature-routes, test-solar-live-map, test-mappa, test-day-plan e test-community-context. Anteprima live: http://127.0.0.1:4595/. Pubblicazione di questa revisione da confermare tramite stato Sites; numero versione e link GitHub saranno registrati dopo il rilascio.

Preferenza permanente: per ogni aggiornamento completato allineare anteprima locale, sorgente GitHub e pubblicazione Sites. Non è una sincronizzazione automatica in background e non include preferenze del browser o bozze private. Prima di nuovi interventi recuperare sempre la sorgente più recente dello stesso Site. Le note delle precedenti revisioni restano storiche.


Richiesta: rendere MeteoSocial riconoscibile al primo impatto e ridisegnare Oggi, Meteo e barra inferiore.

## Scelte

- Avorio caldo, inchiostro e arancio; titoli grandi, gerarchie forti e superfici meno ripetitive.
- Oggi come copertina: temperatura in primo piano e illustrazione atmosferica esistente dichiarata decorativa.
- Meteo come pagina di consultazione: superficie chiara, numeri grandi, righe e periodi leggibili.
- Navigazione Oggi / Meteo / Mappa / Social / Crea. Mappa centrale rialzata, stato attivo distinto, profilo in alto con nome accessibile.
- Adeguamenti cromatici della community; le altre schermate conservano il fondo scuro per evitare contrasto insufficiente con componenti esistenti.

## Implementazione

Modificati dist/index.html, dist/atmosphere.js, dist/weather-page.js e dist/cielo-design.css. Il nuovo stile è attivato dalla classe segnale-design ed estende il foglio esistente. Nessuna dipendenza o risorsa grafica aggiunta. Non cambiano dati, API o calcolo della grandine. Ramo derivato da codex/grandine-claude-20260922: conservare la dipendenza dalla PR #15.

## Verifiche e limiti

Sintassi dei due moduli JavaScript e git diff --check superati. Anteprima locale che importa i moduli reali con contesto e dati fittizi, esplicitamente etichettati: Oggi e Meteo controllati a desktop, 390 e 320 px. A 320 px nessun overflow orizzontale della pagina e destinazioni del menu almeno 44 px. Passaggio Oggi/Meteo e stato attivo controllati. Supportati riduzione movimento e indicatore in colori forzati; queste modalità richiedono ulteriore verifica integrata.

La pagina di prova non è l'app compilata: login, backend, community completa, altri percorsi e dispositivi fisici non verificati. Build bloccata dall'ambiente Windows (spawn EPERM di esbuild); non pubblicata. Ultimo Site verificato: versione 73.

Prima del rilascio eseguire build e suite CI dal lockfile, verificare navigazione completa, Community, Profilo, Mappa/Grandine, tastiera, zoom e sovrapposizioni della barra su pannelli e dialoghi. Pubblicare lo stesso Site solo dopo queste verifiche; non distribuire il contesto fittizio di anteprima.
