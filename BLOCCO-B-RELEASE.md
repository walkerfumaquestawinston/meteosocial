# Blocco B — Prima schermata e onboarding

16 settembre 2026. Solo il blocco B autorizzato, dopo verifica dello stato e approvazione della variante che conserva la temperatura già presente.

## Modifiche
- dist/day-plan.js: scheda compatta con uscita, rientro, temperature, condizioni e Decisore esistente; dettagli espandibili; scelte 8:00 / 9:00 / Altro; stessi orari e salvataggio della vista Oggi; selettori senza tastiera obbligatoria.
- dist/onboarding.js: tre passaggi, orari proposti 8/18, geolocalizzazione solo su richiesta esplicita; scelta città e continuazione senza posizione; completamento persistente.
- dist/main.js, dist/atmosphere.js: collegamento della stessa istanza giornata e dei percorsi onboarding/città.
- dist/living-world.js: giornata dopo la temperatura e prima del titolo/globo. Nessuna modifica al renderer, alle pillole o ai contatori.
- dist/design-system.css: stili circoscritti a giornata e onboarding, usando i token esistenti.
- build.mjs, dist/server/index.js, dist/sw.js: nuovo modulo incluso nella distribuzione e cache shell v25.
- test-onboarding.mjs: preferenze, minuti personalizzati, dati assenti, tre passi, permesso esplicito, rifiuto e città manuale.
- PROJECT_STATUS.md, PROJECT_VISION.md: stato aggiornato e pausa prima del prossimo blocco.

## Verifiche
Build riuscita. Test Decisore (42), giornata (15) e nuovo test onboarding superati. Browser locale a 375×812: tre passaggi, selezione 9/18, continua senza posizione, scheda sopra il globo con temperatura e consigli visibili senza scroll; modifica tramite Cambia orari e nessun onboarding riproposto alla riapertura. Home senza i tre moduli 3D, caricati entrando nel globo.

## Limiti
Il meteo mostrato nella QA locale è quello del profilo di prova, non una misurazione della disponibilità delle fonti in produzione. Rifiuto GPS e selezione città verificati con test automatici; non richiesti permessi reali di posizione. Il browser automatico usa il fallback del globo, quindi nessuna nuova attestazione WebGL o FPS. Preferenze nel browser/dispositivo: non sincronizzate fra PC. Nessun dato inventato: senza previsioni la scheda dichiara l’attesa. Restano i limiti quota delle fonti globali già documentati; fuori dal blocco B.
