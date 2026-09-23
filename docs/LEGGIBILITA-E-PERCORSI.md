# Revisione leggibilità e percorsi — 23 settembre 2026

Il controllo della v109 ha rilevato titoli scuri su sfondo scuro nelle pagine secondarie, aiuti con fonti superate e segnalazioni rapide inviate al primo tocco.

## Modifiche

- Profilo, Impostazioni, guida, servizi e Segnala ereditano i colori della fase solare. Eliminati gli override che bloccavano le pagine secondarie sul vecchio tema scuro. Dialoghi e campi usano coppie testo/sfondo coerenti.
- Guida con i quattro passaggi principali prima degli strumenti avanzati, link alla mappa corrente e spiegazioni Rainbow, alternativa RainViewer, MapTiler e Radar-DPC POH Italia. Lo stato dei servizi espone separatamente previsioni, nowcast pioggia e radar grandine; indica configurazione, non disponibilità garantita.
- Meteo apre le 24 ore; riepilogo illustrato compatto, con fonte e cronologia mantenute. Oggi conserva il riepilogo della giornata e il calendario.
- Nella mappa il pannello si chiama Temporali come il selettore. Legenda senza sigle M/C; «Non previsto» distingue il codice meteo senza temporale da un dato mancante, che resta assente. Le avvertenze sulle singole scariche restano visibili.
- Segnalazioni rapide: scelta apre anteprima con fenomeno, zona, ora del dispositivo e nome pubblico. Solo «Pubblica segnalazione» avvia l'invio. Annullamento senza invio; ID del tentativo conservato nei retry. Nessun cambiamento a dati, geolocalizzazione o consensi esistenti.
- Lente mostra un accesso esplicito e conserva la domanda in sessione durante il login. Nessuna nuova generazione automatica. Community più compatta sul telefono; strumenti e filtri esistenti conservati.

## Verifiche

Build riuscita, 73 suite attive superate e 5 già ritirate. Test della segnalazione aggiornato: nessuna richiesta prima della conferma, anteprima annullabile, un solo ID anche dopo perdita della risposta e nuovo tentativo. Test mirati ripetuti dopo le ultime rifiniture.

Browser locale desktop: Impostazioni, guida, anteprima segnalazione e Meteo; telefono 390 px: Community, Lente e mappa. Nessun overflow orizzontale nella community o nella mappa. Verificato annullamento del dialogo senza invio; pubblicazione/retry verificati con trasporto simulato nel test. Nessun post nuovo in produzione, nessuna richiesta IA reale. La palette automatica conserva i 240 abbinamenti testuali verificati dal test esistente. Non audit completo WCAG, né prova su telefoni fisici.

L'anteprima non usa le chiavi di produzione: dati salvati, Open-Meteo e RainViewer possono apparire al posto dei servizi configurati online. Questa revisione non risolve o certifica l'accuratezza e la disponibilità delle fonti meteo, né la causa storica della mappa occasionalmente bianca. Nessun nuovo costo o abbonamento.
