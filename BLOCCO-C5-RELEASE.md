# C5 — interazione del globo

Adattamento approvato dall’utente: zoom, tocco e trascinamento erano già presenti. Rotazione automatica richiesta dopo5secondi e pausa dopo10 conciliati con una finestra5–10secondi. Con movimento ridotto restano i comandi manuali, non l’inerzia o i voli.

- dist/living-renderer.js: velocità del trascinamento e decadimento esponenziale, limite verticale e velocità massima; stop al nuovo gesto. Rotazione3gradi/secondo nella finestra5–10secondi (velocità equivalente a un giro in2minuti, non un giro continuo). Doppio tocco entro300ms/24px torna in800ms alla città corrente. Tocco singolo differito300ms per non aprire la scheda prima del secondo tocco. Pizzico distinto dal tocco, cancellazioni pulite. Zoom e selezione manuale preservati in reduced-motion/eco; animazioni automatiche disabilitate. Frame e tap sospesi in background, timer tap eliminato alla dismissione. Etichetta accessibile aggiornata.
- dist/living-world.js: callback per la città selezionata più recente; ritorno non legato alla città del primo montaggio.
- dist/sw.js: cachev32.
- dist/server/index.js: build rigenerata.
- test-globe-gestures.mjs: test del renderer compatibile in ambiente simulato con clock controllato: inerzia, attesa e stop automatici, ritorno800ms, cambio città, doppio/singolo tocco, pinch, reduced-motion, eco, background e cleanup.
- PROJECT_STATUS.md e PROJECT_VISION.md: stato aggiornato.

Test automatici superati; nessuna verifica multitouch su telefono fisico né misura60fps. Rendering Google opzionale conserva i gesti propri del servizio. Geometria, shader solare, pillole, punti e contenuto delle schede non modificati. Non eseguiti D7/D8/F5.
