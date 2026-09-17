# MeteoSocial — Dev Kit

Il meteo del mondo, raccontato da chi lo vive. App web single-file (HTML+CSS+JS), pubblicata come Artifact su claude.ai.

## Struttura
- `index.html` — l'app completa, pronta da aprire in un browser (serve internet per three.js e i font).
- `src/styles-and-head.html` — titolo, font, CSS (token chiaro/scuro).
- `src/markup.html` — struttura HTML (viste: Globo, Mappa, Meteo, Community, IA, Profilo; sheet composer, story viewer, card modal).
- `src/data.js` — `WX` (78 città con meteo reale Open-Meteo, snapshot), `WX_TIME`, `LAND` (poligoni terre emerse Natural Earth 110m, semplificati).
- `src/app.js` — core: i18n IT/EN, preferenze, ricerca, globo 3D (three.js r128), mappa 2D Mercator (canvas), vista meteo, community base, chat IA, profilo, presenza.
- `src/app-social-3d-ai.js` — v2: feed a card stile TikTok/IG con effetti particellari, storie per città, reazioni emoji, composer con IA, Meteo Score, classifica, sfida città, card story condivisibile, scena meteo 3D, globo giorno/notte + nuvole, personalità IA e tool `openCity`.
- `src/textures.js` — `TEX`: texture della Terra (NASA Blue Marble 2048×1024, luci notturne, specular, nuvole) come data URL JPEG, generate dalle immagini di esempio di three.js (`examples/textures/planets`).
- `src/app-v4.js` — v4: Terra 3D realistica con giorno/notte e luci delle città (shader), mappa satellitare, radar pioggia stimato animato (12 ore), grandine (tag, allerta, effetto), profilo social (avatar, bio, Instagram, segui, hashtag, tendenze, notifiche), condivisione su Instagram, assistente IA flottante in ogni vista, link Google Maps.
- `src/app-v3.js` — v3: foto e video nei post (foto compresse e pubblicate per tutti, video salvati sul dispositivo via IndexedDB con poster condiviso), lightbox, muro delle foto, IA in ogni vista (card città su globo/mappa, riassunto community, risposta suggerita ai post, consiglio del giorno nel profilo), mini scena 3D nelle card città, restyling (CSS iniettato da JS).
- `src/app-v5.js` — v5: globo nitido (mipmap, anisotropia, pixel ratio) con etichette città e Giro del mondo, layer mappa Grandine, social completo (profili utente, salvati, menzioni @, cuori sui commenti, modifica/nascondi/segnala, link al post `#post=id`, centro notifiche), IA con voce (dettatura + lettura) e traduzione dei post, intro cinematica.
- `src/app-v6.js` — v6: selezione precisa delle città sul globo (città vicine → menu di scelta e zoom automatico), pannello livelli mappa con legende (Temperatura, Pioggia radar, Grandine con elenco città/orari, Segnalazioni, Satellite, Google Maps), "Segnala in un tocco", "Polso della community" con filtri per condizione, filtro "La mia città", guida in-app (❔), rifiniture grafiche (nav, chip, transizioni).

Per ricostruire `index.html`: eseguire `npm run build` con Node.js 22 o successivo. Lo script `scripts/build.mjs` mantiene l'ordine originale e include intestazione, stato e chiusure HTML. I moduli successivi sovrascrivono alcune funzioni globali di quelli precedenti; non eliminarli come duplicati.

## Runtime Claude (window.claude.use)
Funziona anche senza: ogni capability è opzionale (`null` → funzione nascosta).
- `artifact` → pubblica una nuova versione della pagina con i post nel blocco `<script id="state">` (solo chi ha permessi di scrittura).
- `sample` → assistente IA (chat, riassunti, caption, risposte suggerite).
- `room` → contatore persone online.
- `downloads` → salva la card PNG.

## Portarla su un backend vero (per gli store)
1. Meteo live: chiamare `https://api.open-meteo.com/v1/forecast?...` (gratis, senza chiave) al posto dello snapshot `WX`.
2. Community: Supabase/Firebase (tabelle `posts`, `reactions`, `comments`, storage per foto/video), login social, moderazione.
3. IA: endpoint server che chiama l'API Claude con gli stessi prompt di `aiContext()` e `aiInto()`.
4. App nativa: incapsulare con Capacitor (Android/iOS) + notifiche push per allerte.

## Lavorare con Claude
Leggi [CLAUDE.md](CLAUDE.md) per le istruzioni e [docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md) per il messaggio iniziale.

```sh
npm run check
# Modifica i file in src/, poi:
npm run build
npm run check
```

Non occorre `npm install`: gli strumenti usano solo moduli integrati di Node.js. `npm test` esegue gli stessi controlli statici. Il workflow GitHub Actions li esegue su push e pull request. Non sostituiscono le prove nel browser e in Claude.

Apri `index.html` nel browser per una prova locale. Le funzioni del runtime Claude dipendono dall'ambiente e dalle autorizzazioni disponibili; il collegamento a GitHub non le abilita automaticamente.

File aggiuntivi:
- `src/document-start.html`: doctype, lingua e meta della pagina.
- `src/data-extra.js`: dataset aggiuntivo `WX2`, non caricato da `index.html` e volutamente escluso dalla ricostruzione.
- `scripts/build.mjs` e `scripts/check.mjs`: ricostruzione e controlli senza dipendenze.

Il repository è un prototipo: i dati meteo incorporati sono uno snapshot, il radar è stimato e le funzioni social possono essere locali o dipendenti da Claude. Le voci sul backend e sugli store sopra sono una roadmap, non funzionalità già implementate.
