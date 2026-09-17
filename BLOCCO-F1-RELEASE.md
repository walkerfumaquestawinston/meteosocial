# F1 — movimento e feedback

L’utente ha approvato il completamento delle sole parti mancanti dopo aver verificato che tocco, route 180ms, numeri 400ms, skeleton dopo 300ms e aptica erano già presenti. Questi comportamenti restano conservati.

## File modificati
- dist/ui-feedback.js: helper per il feed con ID stabili; ingresso dall’alto 200ms, spostamento dalle posizioni misurate, variazione fluida dell’altezza; dissolvenza 400ms solo per righe scadute. Copie in uscita inerti, escluse dall’accessibilità, rimosse alla fine; interruzione in background, preferenze ridotte, eco o cambio vista. Aggiornamenti identici non ripetono né interrompono il movimento.
- dist/sky-community.js: identificatori delle righe in invio/confermate e scadenze; aggiornamento del feed attraverso l’helper; arresto quando si lascia la sezione; placeholder esplicito di caricamento.
- dist/design-system.css: spazio minimo coerente per attesa/feed e rapporto foto 4:3 riservato prima del download, con token esistenti.
- dist/sw.js: cache v27.
- dist/server/index.js: output ricostruito.
- test-feed-motion.mjs: ingresso, spostamento, conferma dello stesso ID, scadenza, polling ripetuto, preferenze ridotte e scheda nascosta.
- PROJECT_STATUS.md, PROJECT_VISION.md e questo documento: stato e confini della consegna.

## Verifiche
Build completata, 23 controlli di feedback precedenti superati, nuovo test feed superato e test invio rapido/retry ancora superato. Nessuna modifica a dati/server/renderer/globo/tokens. Nessuna nuova prova fisica su telefono o attestazione FPS.

## Limiti dichiarati
L’altezza definitiva di un feed non ancora ricevuto non è conoscibile: viene riservato uno spazio minimo, poi la variazione viene accompagnata. Non si garantisce altezza identica per un numero arbitrario di post/foto. Gli skeleton restano ritardati di 300ms. La scadenza viene rilevata con il polling già presente ogni 30 secondi; la dissolvenza dura 400ms quando rilevata. Nessun dato fittizio per riempire le attese. I blocchi successivi restano non autorizzati.
