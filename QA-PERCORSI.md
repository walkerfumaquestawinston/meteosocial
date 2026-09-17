# Verifica dei percorsi — 16 settembre 2026

Baseline pubblica 30. Prove nel browser mobile 375×812, con database locale separato. Nessuna segnalazione di prova nel servizio pubblico.

## Esiti
- Ricerca Roma: risultati geocoding, scelta Roma/Lazio/Italia, contesto aggiornato nel selettore, nel globo e nella scheda di invio. Open-Meteo ha risposto con 19° e sereno.
- Persone/Meteo/Satellite: selezione e descrizione della fonte cambiano correttamente. Rendering compatibile Canvas2D; WebGL disabilitato nel browser di prova.
- Prima segnalazione anonima: inviata, conferma reale e conteggio 1 persona/1 paese. Scheda zona con osservazione asciutto e modello separato.
- Community: lo stesso contributo, anche dopo ricaricamento dell'anteprima. Corretto il testo 1 persone in 1 persona.
- Eliminazione del proprio contributo: verificata dal browser; il feed torna vuoto con invito a raccontare il cielo di Roma.
- Secondo invio anonimo: richiesta di accesso senza duplicare il contributo. Nessun tentativo di autenticazione reale.
- 20 controlli API segnalazioni, 22 fonti globo, 41 integrazione Google, 15 giornata/orari: tutti passati.

## Limiti verificati
- In anteprima il servizio meteo globale delle città e il bollettino ufficiale non hanno risposto: mostrati gli stati di indisponibilità, senza dati simulati. La risposta del sito pubblico a queste fonti non è stata verificata.
- Il tentativo di download della card non ha prodotto un evento di download confermato dal browser automatico: esito inconcludente, non segnato come superato. Nessuna eccezione applicativa rilevata per l'azione nei log consultati.
- Google con chiave di produzione, autenticazione reale, vibrazioni fisiche e fluidità WebGL su telefono restano esclusi dalla verifica locale.

## File
- dist/sky-community.js: singolare/plurale corretto nel feed.
- dist/sw.js: shell v20; dist/server/index.js: build aggiornato.
- qa/verifica-community.jpg: schermata del contributo locale.
- Questo documento e PROJECT_STATUS.md: risultati recuperabili.
