# Home e illustrazioni — 23 settembre 2026

La Home sostituisce il paesaggio illustrato con tre immagini originali con resa 3D: sole e nuvola, pioggia e neve. La temperatura mantiene la priorità e il riquadro di fonte e acquisizione è separato dalla scena. Le immagini sono decorative, non riprese reali o dati radar. La pagina Meteo conserva la scena esistente.

Il sole richiede is_day=1; notte, nebbia e cielo coperto usano le icone funzionali esistenti. Dati mancanti o fenomeni segnalati soltanto nelle vicinanze non attivano una scena locale. Nessun nuovo motore 3D: lieve profondità al passaggio del puntatore, disattivata con movimento ridotto e grafica leggera. Nessun ciclo continuo o nuovo contesto WebGL.

La mappa carica metadati della fonte e geometria in parallelo, mantenendo i controlli di abbandono pagina. Il nuovo comando Centra rimette al centro la località selezionata, con zoom almeno 7, senza richiedere un nuovo dettaglio meteo solo per il centraggio. Le normali letture della zona visibile restano attive. Radar e pannelli conservano i flussi esistenti.

## Asset

Generazione built-in imagegen, tre richieste senza rigenerazioni; compressione WebP a 640 px, qualità 82. Asset inclusi nel repository e nel Worker:
- dist/assets/weather-clear-day-3d.webp: 13.040 byte
- dist/assets/weather-rain-3d.webp: 15.890 byte
- dist/assets/weather-snow-3d.webp: 30.242 byte

Prompt comune: premium weather website illustration; premium 3D studio-rendered floating weather sculpture; deep midnight navy seamless background (#10263c); polished minimal elegant high-end 3D product rendering, not childish; square, single centered sculpture with generous negative space, entire subject visible; subtle realistic volumetric studio light, soft shadows, restrained glow; polished frosted glass and soft ceramic with rounded cloud volume; no text, numbers, logos, watermarks, scenery, ground landscape, UI, geography, globe or extra objects.

Soggetti: clear-day amber sun emerging behind one soft white volumetric cloud, cool reflections; sculptural silver-blue cloud with suspended translucent blue raindrops, no sun or lightning; icy white cloud with suspended crystalline snowflakes, cool cyan glass, no sun.

## Verifiche e limiti

Build e 74 suite attive superate, 5 contratti già ritirati. Nuovo test per giorno/notte, codici validi e mancanti, fenomeni nelle vicinanze. Browser locale desktop e 390 px: Home, immagine caricata, assenza di overflow orizzontale e Centra con passaggio della scala da 300 a 50 km. Il profilo locale usa dati salvati e fonti alternative, distinti dalle chiavi online. Nessun cambiamento ai fornitori o nuovo abbonamento. Non certificazione di precisione meteo, prestazioni su dispositivi fisici o risoluzione della precedente mappa bianca intermittente.

## Pubblicazione

## 23 settembre 2026 — v111 pubblicata: Home e illustrazioni

Pubblicazione riuscita 2026-09-23T11:16:42.970784+00:00; ambiente 12 e pubblico preservati. Runtime Sites d72a4092c5d91719fca5eb164a77e003c08cd7c6; GitHub e6cc7afa4aa8fcb61cea2ec0cb7c656679746ac8; tree identico 9f6effa4e1ef25c2d849fce302b0a16316a2e55d. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_ab346388241c81918cdb5c6015d0ce2f; deployment appgdep_6ab3b4cec36c81919ba8ecfc433cdab5. CI 35853363063 riuscita. Build e 74 suite attive superate, 5 ritirate; 4 suite mirate ripetute dopo rifiniture. Compilazione remota dopo limite del packaging Windows.

Home con illustrazioni originali dalla resa 3D, compresse in 59.172 byte totali. Nessun nuovo motore 3D, source/time preservati, sole solo di giorno e niente fenomeni locali inventati da condizioni nearby. Mappa: Centra e caricamenti iniziali paralleli. Browser locale desktop/390 px; immagine caricata, nessun overflow Home, centraggio verificato. Anteprima 4597 aggiornata, ramo e PR draft #21 salvati. Nessun nuovo costo. Dettagli e prompt asset in docs/HOME-SCULTURE.md. Non certificazione dati meteo o risoluzione accertata della mappa bianca storica. Commit successivi solo note, nessun ulteriore deploy.

