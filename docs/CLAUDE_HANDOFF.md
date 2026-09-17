# Passaggio a Claude

Repository: https://github.com/walkerfumaquestawinston/meteosocial

## Come ripartire
Rendi disponibile questo repository nella sessione Claude che userai, tramite la relativa integrazione GitHub oppure caricando i file necessari. La connessione GitHub di questa sessione non prova che Claude abbia già accesso.

Messaggio pronto da copiare:

> Riprendi MeteoSocial dal repository walkerfumaquestawinston/meteosocial. Leggi CLAUDE.md, README.md, docs/CLAUDE_HANDOFF.md e AI_BRIEF.md. Verifica il codice esistente e i suoi limiti prima di proporre modifiche. Mantieni aspetto, sei viste, IT/EN, compatibilità con Claude Artifacts e file HTML autonomo. Per iniziare esegui npm run check e dimmi quali funzionalità sono già reali, locali, dimostrative o dipendenti da Claude. Prima di sviluppare, concordiamo la prossima funzionalità. Per ogni modifica lavora in src/, ricostruisci index.html e verifica il risultato.

## Sessione del 17 settembre 2026 (analisi, nessuna modifica al codice)

### Cosa è stato fatto
- Letti CLAUDE.md, README.md, AI_BRIEF.md e tutti i sorgenti in `src/`.
- Eseguiti i controlli statici; mappate le funzionalità in tre categorie (reali / locali o dimostrative / dipendenti da Claude).
- Aggiornato solo questo file. Nessuna modifica a `src/` né a `index.html`.

### Controlli eseguiti
- `npm run check` con Node.js v22.22.2, npm 10.9.7: **OK** ("sintassi JS, sincronizzazione index.html, stato JSON e sei viste").
  `index.html` risulta allineato ai sorgenti: `npm run build` non produce differenze.
- Verifica extra delle chiavi di traduzione: **309 chiavi in `I18N.it` e 309 in `I18N.en`, nessuna mancante da nessuna delle due parti** (conteggio su `app.js` più i cinque `Object.assign(I18N.*)` dei moduli v2–v6).
- Verifica extra dei dataset: `WX` = 78 città, 52 paesi, `WX_TIME` = `2026-09-10T17:12Z`, `LAND` = 127 poligoni.
  `src/data-extra.js` dichiara `WX2` con **1560 città**, stesso schema di `WX` più un campo `x`, **senza** un `WX2_TIME`, e con **4 nomi già presenti in `WX`**.
- Non eseguiti: prova nel browser, prova delle capability dentro Claude, prova su dispositivo mobile.

### Stato reale delle funzionalità

Operative senza dipendenze esterne (a parte three.js e i font da CDN):
- Sei viste (`globe`, `map`, `weather`, `community`, `ai`, `profile`) con router `show(v)`.
- Globo 3D three.js r128 con texture NASA incorporate in base64, giorno/notte, nuvole, etichette città, zoom, selezione città (corretta in v6), Giro del mondo, intro cinematica.
- Mappa 2D Mercator su canvas con livelli Temperatura, Pioggia, Grandine, Segnalazioni, Satellite e pannello legende.
- Vista Meteo con ore e giorni, allerte derivate dai codici WMO, Meteo Score, effetti particellari, scena 3D.
- Ricerca città, preferenze (lingua IT/EN, tema chiaro/scuro/auto, °C/°F, città di casa) salvate in `localStorage`.
- Geolocalizzazione: `navigator.geolocation` sceglie la città **più vicina tra le 78 dello snapshot**, non la posizione reale.
- Condivisione: Web Share API o copia negli appunti; card PNG generata su canvas; link `#post=id`; link a Google Maps e a Instagram.

Locali o dimostrative (funzionano, ma non escono dal dispositivo):
- Profilo utente: soprannome, avatar, bio, Instagram. È una preferenza locale, **non un'autenticazione**.
- Segui, salvati, nascondi, segnala, cuori sui commenti, menzioni `@`: tutto in `localStorage`, visibile solo a chi usa quel browser.
- Centro notifiche: calcola le voci dai post già presenti in pagina. Non ci sono notifiche push.
- Foto: ridimensionate a 760 px e compresse in data URL dentro il post. Video: **restano nel solo IndexedDB del dispositivo**; agli altri arriva solo il poster.
- Radar pioggia: **stimato**, disegnato dalle probabilità orarie dello snapshot `WX`, non sono tile radar reali.
- Contatore "persone online": mostra 1 se la capability `room` non c'è.
- Dati meteo: snapshot del **10 settembre 2026**. Con la data odierna le etichette "Oggi"/"Domani" e le ore mostrano dati vecchi di giorni.

Dipendenti dal runtime Claude (`window.claude.use`, degradano con grazia se assente):
- `sample` → tutta l'IA: chat, riassunti community, caption, risposte suggerite, consiglio del giorno, traduzione dei post.
- `artifact` → pubblicazione dei post nel blocco `<script id="state">`; senza permessi di scrittura i post restano locali (`saved_local`).
- `room` → presenza/persone online.
- `downloads` → salvataggio della card PNG.

### Cosa manca per un'app completa
1. Meteo live: nessuna chiamata a Open-Meteo a runtime, solo lo snapshot.
2. Backend: nessun server, nessun database, nessuna autenticazione, nessuna moderazione. La "community" condivisa esiste solo dentro un Artifact scrivibile.
3. IA propria: serve un endpoint server che chiami l'API Claude con gli stessi prompt di `aiContext()`/`aiInto()`.
4. Notifiche push e app nativa (Capacitor, store): non iniziate.
5. Copertura città: 78 nell'app contro 1560 disponibili in `data-extra.js`, non integrate.
6. Offline: `index.html` richiede internet per three.js r128 e i font; non c'è service worker.

### Problemi aperti
- Lo snapshot `WX` invecchia e l'app non lo segnala in modo evidente: il timbro "Aggiornato …" c'è nel globo e nella vista meteo, ma non distingue "dato fresco" da "dato di una settimana fa".
- `src/data-extra.js` pesa 1,2 MB, è escluso dalla build ma comunque nel repository e controllato dalla sintassi; integrarlo richiederebbe deduplicazione (4 collisioni), un `WX2_TIME` e la revisione di tutti gli indici città.
- `index.html` è già a 1,0 MB per via delle texture base64: ogni aggiunta di dati pesanti va valutata contro i limiti dell'Artifact.
- I controlli statici non sostituiscono la prova nel browser né dentro Claude: nessuna delle due è stata fatta in questa sessione.

### Prossimo passo proposto (da concordare, non ancora sviluppato)
Nuovo modulo `src/app-v7-live.js` (ultimo nella catena di override, senza toccare i moduli esistenti):
- al primo avvio e su richiesta, chiama `https://api.open-meteo.com/v1/forecast` (gratuita, senza chiave) per la città selezionata e per quella di casa, aggiornando `WX[i]` sul posto con lo stesso schema;
- se la rete manca o è bloccata (probabile dentro l'Artifact), non fa nulla e resta lo snapshot: nessun errore visibile;
- aggiunge un indicatore chiaro "Live" / "Snapshot del …" con nuove chiavi in `I18N.it` e `I18N.en`;
- nessuna chiave API, nessun dato inviato a terzi oltre alle coordinate della città scelta.

Alternative scartate per ora: integrare `WX2` (peso e deduplicazione), radar RainViewer (tile esterni, stesso problema di rete), backend vero (fuori dal formato single-file).

## Preparazione del 17 settembre 2026
- Aggiunte istruzioni CLAUDE.md e ricostruzione deterministica.
- Verificata corrispondenza esatta tra HTML ricostruito e index.html preesistente.
- Verificata sintassi di tutti i file JavaScript in src/, incluso data-extra.js.
- Aggiunti controlli automatici per sincronizzazione, JSON iniziale, chiusure script e sei viste.
- Aggiunto workflow GitHub Actions per push e pull request.
- Nessuna modifica al comportamento o all'aspetto dell'app.

## Verifiche
I controlli locali sono stati eseguiti direttamente con Node.js; npm non era disponibile nell'ambiente di preparazione. Su GitHub, il workflow Check MeteoSocial esegue npm run check con Node.js 22. Consulta la scheda Actions per l'esito della versione corrente.

## Limiti da conoscere
Non sono stati collaudati il browser, le capability dentro Claude, l'accesso del tuo account Claude, né la pubblicazione negli store. Il meteo incluso è uno snapshot; dati extra non caricati. Backend multiutente, autenticazione, storage condiviso e app nativa restano lavori separati.
