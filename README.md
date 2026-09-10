# MeteoSocial — Dev Kit

Il meteo del mondo, raccontato da chi lo vive. App web single-file (HTML+CSS+JS), pubblicata come Artifact su claude.ai.

## Struttura
- `index.html` — l'app completa, pronta da aprire in un browser (serve internet per three.js e i font).
- `src/styles-and-head.html` — titolo, font, CSS (token chiaro/scuro).
- `src/markup.html` — struttura HTML (viste: Globo, Mappa, Meteo, Community, IA, Profilo; sheet composer, story viewer, card modal).
- `src/data.js` — `WX` (78 città con meteo reale Open-Meteo, snapshot), `WX_TIME`, `LAND` (poligoni terre emerse Natural Earth 110m, semplificati).
- `src/app.js` — core: i18n IT/EN, preferenze, ricerca, globo 3D (three.js r128), mappa 2D Mercator (canvas), vista meteo, community base, chat IA, profilo, presenza.
- `src/app-social-3d-ai.js` — v2: feed a card stile TikTok/IG con effetti particellari, storie per città, reazioni emoji, composer con IA, Meteo Score, classifica, sfida città, card story condivisibile, scena meteo 3D, globo giorno/notte + nuvole, personalità IA e tool `openCity`.

Per ricostruire `index.html`: concatenare `styles-and-head.html` + `markup.html` + `<script src=three.js r128>` + `<script>data.js</script>` + `<script>app.js</script>` + `<script>app-social-3d-ai.js</script>`.

## Runtime Claude (window.claude.use)
Funziona anche senza: ogni capability è opzionale (`null` → funzione nascosta).
- `artifact` → pubblica una nuova versione della pagina con i post nel blocco `<script id="state">` (solo chi ha permessi di scrittura).
- `sample` → assistente IA (chat, riassunti, caption).
- `room` → contatore persone online.
- `downloads` → salva la card PNG.

## Portarla su un backend vero (per gli store)
1. Meteo live: chiamare `https://api.open-meteo.com/v1/forecast?...` (gratis, senza chiave) al posto dello snapshot `WX`.
2. Community: Supabase/Firebase (tabelle `posts`, `reactions`, `comments`), login social, moderazione.
3. IA: endpoint server che chiama l'API Claude con lo stesso prompt di `aiContext()`.
4. App nativa: incapsulare con Capacitor (Android/iOS) + notifiche push per allerte.
