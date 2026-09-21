# Cielo — direzione visiva MeteoSocial

## Decisione, 21 settembre 2026

Una pubblicazione atmosferica: dati leggibili prima, racconti delle persone subito dopo. Fondo inchiostro #07141c, superfici #10232e, testo #f4f8fa, secondario #b2c5cf, azioni lime #d6fa77. I colori dei fenomeni e delle allerte restano semantici e separati dal colore del marchio. Font Bricolage Grotesque già ospitato dal progetto; nessuna nuova libreria o font remoto.

Non si dichiara dimostrata l'unicità assoluta né la viralità. Non è possibile ispezionare ogni design esistente; sono state confrontate direzioni rappresentative e la schermata effettiva di MeteoSocial.

## Riferimenti e interpretazione

- Apple, [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): navigazione distinta dal contenuto, chiarezza e uso misurato delle superfici traslucide. Applicazione: vetro solo sulla navigazione, superfici stabili sotto testo e dati.
- Nothing, [Essential Apps guide](https://essential-apps-beta.nothing.tech/guide): strumenti consultabili a colpo d'occhio. Applicazione: temperatura grande e controlli riconoscibili, non accumulo di decorazioni.
- CARROT, [pagina ufficiale](https://www.meetcarrot.com/weather/): personalità come parte dell'esperienza. Applicazione: voce editoriale e Lente, senza trasformare gli avvisi di sicurezza in intrattenimento.
- [Argos Atlas](https://argosatlas.com/map/), riferimento del proprietario: densità cartografica e strumenti contestuali. Si conserva la mappa a pieno schermo con colori propri per i fenomeni, senza trasferire la sua densità alla community.

Queste scelte sono una sintesi progettuale, non prove di superiorità dei prodotti.

## Problemi risolti

- La community presentava più riquadri introduttivi prima dei post. Compositore e feed passano nella colonna principale; previsione, scoperta per fenomeno e fonti nella colonna laterale, dopo il feed su mobile.
- Temi legacy chiari e scuri prevalevano alternativamente su testi e pulsanti. Il nuovo confine di stile è body.cielo-design, con correzioni esplicite del contrasto. La stratificazione CSS preesistente resta debito tecnico: non è stata riscritta la logica delle sezioni.
- Home con meteo in apertura e domanda del giorno dopo utilità e bollettini. Previsioni prima del bollettino ordinario nella pagina Meteo; CAUTION/EMERGENCY restano in testa.
- Lente con la stessa identità, area di scrittura e fonti leggibili; nessuna modifica a provider, dati trasmessi o consenso.
- Navigazione flottante coerente nelle cinque sezioni, focus visibile, controlli almeno 44 px, preferenze testo grande/contrasto e riduzione del movimento.

## Asset

`dist/assets/cielo-atmosphere.webp`: illustrazione originale generata per questo progetto, 1774 × 887, circa 112 KB. Usata solo su Home e Lente come identità visiva, con didascalia; non è una ripresa, una previsione o un contenuto UGC. Non contiene testo o elementi UI. MIME WebP esplicito nel build. Nessuna animazione continua aggiunta.

## Conservato

Account, post, commenti, salvataggi, filtri, segnalazioni e scadenze, servizi ripari e radar, fonti/orari/stato offline, limiti IA già autorizzati. Nessuna migrazione, nuova raccolta dati, chiamata IA a pagamento o modifica alle credenziali. Test locali con soli contenuti di prova; nessun post di prova pubblicato online.

## Verifica

Build e 15 suite del workflow Check MeteoSocial superate. Revisione browser desktop e viewport 390 px: Home, Community, Meteo, Lente, Mappa e Profilo; apertura e chiusura dei commenti, navigazione, testo ingrandito e assenza di overflow orizzontale verificate. Nessun errore console nella verifica della mappa; i servizi cartografici esterni restano intermittenti. Meteo esterno intermittente: l'anteprima mostra esplicitamente l'ultimo dato salvato. Non eseguite prove su dispositivi fisici né certificazione completa WCAG.
