# MeteoSocial — istruzioni per Claude

Leggi prima README.md e AI_BRIEF.md. Questo repository contiene un prototipo web vanilla HTML/CSS/JavaScript, single-file per Claude Artifacts. Non è ancora un'app nativa o un servizio social con backend.

## Punto di partenza
- Modifica i sorgenti in src/; genera index.html con `npm run build` e includilo nel commit quando cambia.
- Node.js 22 o successivo; nessuna dipendenza npm da installare. `npm run check` (anche `npm test`) verifica sintassi e coerenza.
- src/document-start.html contiene doctype, lingua e meta; styles-and-head.html il titolo e i CSS; markup.html include viste e stato iniziale.
- Ordine effettivo: textures, data, app, app-social-3d-ai, app-v3, app-v4, app-v5, app-v6. Sono script classici con globali e override progressivi: v3–v6 NON sono copie obsolete.
- src/data-extra.js dichiara WX2 ma non è incluso nell'app. Non inserirlo senza progettare integrazione, deduplicazione e test degli indici città.
- index.html deve restare utilizzabile come singolo file. Mantieni three.js r128 e lo stile esistente; non migrare framework senza richiesta.

## Vincoli
- Conserva le sei viste, show(v), i token chiaro/scuro, IT/EN e lo stato JSON con id="state".
- Ogni nuovo testo UI deve avere una chiave in I18N.it e I18N.en e usare t().
- Mantieni le capability window.claude.use opzionali (artifact, sample, room, downloads). Il browser ordinario può non fornirle.
- Non confondere snapshot WX/WX_TIME con meteo aggiornato in tempo reale; radar stimato e segnalazioni community non sono allerte ufficiali.
- Il profilo locale non equivale ad autenticazione e i video locali non equivalgono a storage condiviso.
- Non inserire chiavi API o credenziali nel frontend, nei prompt o nei commit. Un futuro collegamento API richiede un endpoint server.
- Evita riscritture massive dei dataset/base64: leggi solo ciò che serve e preserva provenienza e struttura.

## Procedura per ogni modifica
1. Controlla branch e modifiche esistenti; usa un branch dedicato per nuove funzionalità.
2. Spiega brevemente obiettivo e file interessati, poi realizza la modifica richiesta.
3. Esegui npm run build e npm run check.
4. Per modifiche UI verifica manualmente le sei viste, ricerca, tema chiaro/scuro, IT/EN e dimensioni telefono/desktop. Prova assenza delle capability; verifica quelle disponibili dentro Claude.
5. Riferisci file cambiati, controlli eseguiti e limiti. I controlli statici non sono un test browser o una prova di funzionamento del runtime Claude.

## Prossimi sviluppi
Il backlog in AI_BRIEF.md è proposto, non già completato né un'autorizzazione a implementarlo tutto. Prima di estendere funzionalità verifica gli override esistenti: foto/video, traduzione e funzioni social sono già parzialmente presenti.
