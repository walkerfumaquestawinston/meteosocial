# C1/C2 — Globo e giorno/notte

- dist/living-world.css: stage trasparente senza card, canvas almeno55svh, larghezza mobile estesa ai margini viewport. Controlli, pillole e pulsante restano.
- dist/design-system.css: rimossa la superficie opaca/blur/ombra del solo contenitore living-world.
- dist/solar-position.js: direzione del Sole da data/ora UTC, equazione del tempo e declinazione secondo l’approssimazione NOAA https://gml.noaa.gov/grad/solcalc/solareqns.PDF. Nessuna rete. Anni bisestili gestiti.
- dist/living-renderer.js: shading applicato a mare, terra e texture satellite. Notte al35% della luminosità diurna (scurimento65%), transizione di4gradi. Aggiornamento60secondi, pausa nascosta, riallineamento al ritorno e cleanup timer. Stessa semantica nel renderer compatibile. Piccoli punti fissi delle città dal catalogo geografico esistente, visibili di notte; non sono segnalazioni o luci satellitari osservate, non entrano nei conteggi o nel picking delle persone. Un solo Points aggiuntivo, nessuna mesh per città. Geometria, controlli e dati delle persone non modificati.
- dist/living-world.js: descrizione distingue luci grandi delle persone e minuscoli punti geografici; fonte e cadenza del giorno/notte in Altro.
- build.mjs, dist/sw.js, dist/server/index.js: modulo incluso e cachev31, Worker rigenerato.
- test-solar-position.mjs: solstizi, equinozio, segni est/ovest, anno bisestile, normalizzazione e ampiezza del terminatore verificati. Verificati hook shader, cleanup, pausa nascosta e regole CSS; build riuscita.

Limiti: nessuna verifica visuale/WebGL su telefono reale e nessuna misura60fps eseguita in questo blocco. Il calcolo è un’approssimazione per visualizzazione, non effemeridi di precisione. Le città sono riferimenti geografici statici, non osservazioni di illuminazione. Il rendering Google opzionale mantiene l’illuminazione propria del servizio; il terminatore è sul globo principale del renderer MeteoSocial. Il dettaglio delle ulteriori interazioni è C5, non eseguito qui.
