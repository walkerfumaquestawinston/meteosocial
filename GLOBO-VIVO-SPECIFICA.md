# MeteoSocial — Globo Vivo, specifica operativa

Ricevuta il 15 settembre 2026. Sostituisce le precedenti istruzioni di prodotto.
Il proprietario ha successivamente autorizzato tutte le modifiche ai file e tutte le verifiche necessarie, chiedendo di proseguire **fino all'ultima fase**, senza le precedenti soste di approvazione, e mostrare il lavoro alla fine. Conservare funzioni e dati esistenti; preferire modifiche puntuali. Funzioni nascoste dietro flag riattivabili.

## Tesi

Il globo è l'app: un pianeta illuminato dalle osservazioni reali delle persone. La community vive nel globo; l'elenco separato mostra gli stessi dati. Previsioni del modello, osservazioni e allerte ufficiali devono restare distinguibili. Nessun conteggio, utente, fenomeno, presenza o risultato meteo inventato. L'esclusività rispetto ai concorrenti è un'ambizione, non un fatto verificato da pubblicare.

## Ordine autorizzato

1 → 8.1 → 2 → 8.2–8.3 → 3 → 8.4 → 4 → 5 → 8.5–8.8 → 6 → 7. Pubblicazione e consegna finale al completamento, con verifiche e limiti documentati.

### 1 — Caricamento

- `experience.js`: import dinamico di `globe.js` solo se esiste `#mission-globe`; testo “Accendo il mondo…”; evitare mount su host scollegato; preservare parametri, marker e fallback 2D.
- `main.js`: prefetch su hover, touch o focus del collegamento Globo, anche dopo render. Mai timer di avvio, nemmeno su 4G: il frammento proposto con requestIdleCallback contraddice il requisito prevalente.
- Correggere ogni altra catena statica o precache che scarichi Three.js / land-mesh sulla Home Oggi. Preservare offline per il 3D già consultato.
- Atteso originariamente circa 2.130 → 365 KB: misurare i file effettivi; non confondere somma sorgenti, gzip e traffico browser.

### 8.1 — Leggibilità urgente

Body predefinito `#16202B` su `#F6F8FB`; superfici scure con testo esplicito. Contrasto normale almeno 4.5:1, grande almeno 3:1. Nessun testo informativo sotto 13 px. Tutti i bersagli almeno 44×44 px, inclusi link radar, fonte DPC, tendenze, Fit Check, sfide e Open-Meteo.

### 2 — Un globo subito visibile

- Entrando in Globo, avvio automatico, senza “Apri il globo satellite”. Attesa: sfera scura, alone azzurro, “Accendo il mondo…”. Fallback accessibile se WebGL non disponibile.
- Un solo spazio del globo; tre pillole: Persone (default), Meteo, Satellite. Satellite è un livello geografico, non un'immagine live.
- Tutti gli altri comandi dentro Altro: rilievo, nomi/strade, nord, fenomeni, zoom, schermo intero. Conservare codice e funzionalità.
- Obiettivo globo visibile entro 2 s su telefono; misurazione reale necessaria prima di prometterlo per reti/dispositivi generici.

### 8.2–8.3 — Navigazione e scale

Eliminare la griglia di navigazione duplicata sopra il contenuto. Una barra in basso; in alto città toccabile.

Tipografia: `--t-label:12px` (solo etichette decorative, non informazioni), `--t-small:14px`, `--t-body:16px`, `--t-title:20px`, `--t-head:28px`, `--t-temp:64px` (solo temperatura). Pesi 400/500/700. Raggi 8/16/999 px. Spaziature in multipli di 4: 4/8/12/16/24/32.

### 3 — Segnalazioni sul pianeta

- Finestra reale 2 ore, punti alle coordinate, decadimento di luminosità fino alla scadenza. Pulsazione ~3 s sfalsata; addizione degli aloni nelle zone dense.
- Colori: pioggia azzurro, neve bianco, sole giallo, grandine viola, allerta arancione; segnalazione allerta non equivale a bollettino ufficiale.
- Un `THREE.Points` con ShaderMaterial/AdditiveBlending, non una mesh per punto; massimo 5.000 punti selezionati per recenza e prossimità alla vista; 800 e niente pulsazione in eco/lightweight.
- Contatore persone distinte e paesi, aggiornato ogni 30 s; animazione breve se cambia; numeri veri anche zero.
- Scheda al tocco: prima riscontri delle persone con quantità/orario/foto, poi Open-Meteo, poi disaccordo esplicito se confrontabile. Non trasformare assenza di dati in cielo sereno.

### 8.4 — Semantica cromatica

Freddo=dati/modello: `--dato:#4FB6F5`, soft rgba(79,182,245,.14). Caldo=persone: `--persone:#FF9A4D`, soft rgba(255,154,77,.16). Allerta #FF5A47, ok #3FBF8F. Testo scuro: ink #F2F7FC, ink-2 #AFC2D6, ink-3 #8095AC solo >=18px. Sostituire ovunque cyan/blue/atmo-cyan con dato e togliere #00f0ff/#32c9f4/#61e2ee. Verificare contrasto anche dei nuovi accenti.

### 4 — Due tocchi, condivisione e qualità

- Pulsante sempre disponibile “＋ Racconta il tuo cielo”. Foglio con cinque scelte grandi: 0 Asciutto / Niente pioggia; 1 Qualche goccia / Si sente appena; 2 Pioviggina / Senza ombrello si arriva; 3 Piove / Ombrello necessario; 4 Diluvio / Meglio restare. Nessun testo/foto obbligatorio, prima segnalazione senza account.
- Opzioni sole/nuvole/vento e Aggiungi foto. Nessuna posizione o foto acquisita/pubblicata di nascosto; rendere chiara la zona pubblicata, senza indirizzo preciso.
- Dopo successo reale: volo verso il punto, lampo e onda, poi pulsazione. “Sei sul pianeta”, numero reale della presenza. Salva immagine quadrata con globo, punto, città e frase. Rispetta reduced motion.
- Feedback dopo riscontri entro 3 km e pochi minuti: mostra contributo e confronto con modello. Non dichiarare che Open-Meteo è stato corretto se non è cambiato; distinguere sintesi locale e previsione originale.
- Attendibilità privata: sale con riscontri indipendenti, scende con disaccordi sistematici, peso ridotto sotto soglia; segnalazioni sotto soglia visibili solo all'autore. Niente classifiche. Gestione abuso, blocco autore e rimozione/oscuremento con scadenza operativa entro 24 h; non promettere revisione umana se non è organizzata.

### 5 — Un'unica community

Foto nella scheda dei punti; Nella zona = zoom città; Stories = osservazioni attive 2 h; Fit Check nella scheda città; sfida “Illumina la tua città”; Meteo-Clans più avanti. Video/vocali nascosti con flag. Vista Community separata è elenco degli stessi report. Preservare post e codice precedenti accessibili in archivio/flag, senza perdita dati.

Vuoto: temperatura/condizioni reali, “Sei la prima persona a raccontare il cielo di [città] oggi.” e “Racconta il tuo cielo” che apre le cinque scelte. Distinguere caricamento, errore e zero report.

### 8.5–8.8 — Identità

Cielo dinamico da condizioni + ora locale + alba/tramonto: giorno sereno #3FA9E8→#8FD3F4; nuvoloso #7D8FA3→#B4C2CE; pioggia #46545F→#6E8089; tramonto #2E3F63→#E88B5A; notte #070E1C→#132441 (fallback senza dati). Transizione 1,2 s, assente con reduced motion. Vetro scuro rgba(9,20,36,.55), blur20px, variante chiara su cieli chiari; contrasto su ogni cielo.

Inter/sistema 400/500/700 per UI, Bricolage Grotesque o Fraunces con fallback reale per temperatura/titoli. Una card principale per schermata, altre sezioni separate dallo spazio. Primario riempito, uno per schermata (persone o dati secondo azione); secondario solo bordo; testuale trasparente. Preservare contenuti utili.

### 6 — PWA

Preservare manifest/icon/OG già consegnati; nuova specifica aggiorna shortcut: Racconta `/?action=segnala&source=shortcut`; Globo `/#mondo`; Giornata `/?view=giornata&source=shortcut`. Manifest italiano, id/scope `/`, start `/?source=pwa`, standalone, portrait, sfondo/theme #080b12, icone any/maskable192/512. Icone apple180, favicon e preview1200×630. Meta originali e SEO/OG/Twitter conservati senza duplicati. Manifest mai copia vecchia; HTML network-first; versione cache aggiornata. L'invito automatico Android dipende anche dal browser e non è garantito dalla sola configurazione.

### 7 — Prestazioni finali

Douglas–Peucker ~0,5° per le coste, binario Float32 caricato con fetch; obiettivo sotto120KB. Non applicare semplificazione dei contorni indiscriminatamente ai triangoli. Spegnere rendering in background e dopo10s inattivi; pixelRatio max1,8; reduced motion senza pulsare/volo. Obiettivo60fps da verificare su telefono reale, scalare punti quando serve. Screenshot prima/dopo con stessa vista del renderer effettivamente modificato.

## Stato iniziale e vecchio prototipo

Baseline online all'avvio: versione27, commit f5651e3df5e708074e8962167483765fd08a4571. PWA e semplificazione della vecchia community già presenti. Prova geometria del vecchio piano NON applicata: 165188byte binario +2320 loader, 128 coste, 5014→1499 segmenti, triangoli invariati. Era riferita al vecchio `globe.js`, non ai globi NASA/Google. La nuova fase7 deve misurare il renderer finale e raggiungere il proprio obiettivo dichiarato.
