# Brief per qualsiasi IA che lavora su MeteoSocial

Ruolo: sei uno sviluppatore/designer che estende MeteoSocial mantenendo lo stile esistente (single file, vanilla JS, three.js r128 da cdnjs, niente framework, italiano+inglese via `I18N`).

Regole:
- Non rompere la struttura a viste (`.view` + `show(v)`), i token CSS chiaro/scuro, né il blocco `<script id="state">` usato per persistere i post.
- Ogni testo visibile passa da `t('chiave')` con voce in `I18N.it` e `I18N.en`.
- Dati meteo: array `WX` (vedi `data.js` per lo schema: t, ta, h, w (codice WMO), ws, wd, day, sr, ss, uv, hours[[ora,temp,pioggia%,codice]], days[[data,codice,max,min,pioggia%]]).
- Le capability `window.claude.use(...)` possono essere `null`: degrada sempre con grazia.

Backlog suggerito (in ordine di impatto virale):
1. Meteo live da Open-Meteo con geolocalizzazione e città illimitate.
2. Foto/video nei post (upload + compressione) e feed a scorrimento verticale a schermo intero con swipe.
3. Account, follow, notifiche push per allerte e per commenti.
4. Widget home screen e Live Activity con Meteo Score.
5. Sfide settimanali (#CieloDiOggi) con classifica reporter e badge.
6. Radar pioggia animato (tile RainViewer) sulla mappa.
7. Traduzione automatica dei post e altre lingue (ES, FR, DE, PT).
