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
