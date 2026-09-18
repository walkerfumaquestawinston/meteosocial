# Contesto di prodotto — verificato sulla versione 64

Verifica del 17 settembre 2026 sul commit `00c851f916720f199484d04291c82971a9da297d`.

Nasce dal documento di contesto fornito dal proprietario, che descriveva lo stato dell'app misurato dall'esterno sul sito pubblicato, prima della sincronizzazione su GitHub. Quel documento chiede di verificare prima di applicare. Questa è la verifica: ogni riga qui sotto è stata controllata sul codice, e dove serviva nel browser.

**Il documento originale non va applicato così com'è.** Sei degli otto problemi che elenca sono già risolti, e il suo blocco dei token conterrebbe valori peggiori di quelli attualmente in repository.

## Metodo

- Lettura del codice consegnato, non dei sorgenti scartati: l'elenco autorevole di cosa entra nel bundle è `tools/map-bundle-report.json`, prodotto dalla build.
- Richieste reali al Worker ricostruito, per le risposte delle API.
- Browser reale (Chromium, 375×812, DPR 2) sull'anteprima locale, per contrasto e testi tagliati. Playwright installato fuori dal repository: il lockfile del progetto non è stato toccato.
- Rapporti di contrasto calcolati secondo WCAG 2.1, componendo i livelli di sfondo trasparenti fino al primo opaco.

Limite dichiarato: l'anteprima locale non raggiunge il servizio di cartografia da questo ambiente, quindi la mappa non si disegna. Le misure riguardano le schermate, non la resa della mappa.

## Il blocco dei token del documento è peggiorativo

Applicarlo riaprirebbe il problema di contrasto che il documento stesso mette al primo posto. Misurato su cielo sereno alto (`#3fa9e8`), soglia 4,5:1 per testo normale:

| token | valore nel documento | rapporto | valore in repository | rapporto |
|---|---|---|---|---|
| `--ink-2-l` | `#33475b` | 3,67 ✗ | `#122537` | 5,98 ✓ |
| `--ink-3-l` | `#4e6579` | 2,33 ✗ | `#14283a` | 5,77 ✓ |
| `--dato-l` | `#0b5c99` | 2,68 ✗ | `#08283f` | 5,81 ✓ |

I valori in repository passano su tutti e quattro i cieli chiari, con minimo 4,54.

## Problemi del documento già risolti

| # | come lo descrive il documento | stato verificato |
|---|---|---|
| 1 | `--ink-l`, `--ink-2-l`, `--ink-3-l` non definiti | definiti in `dist/design-system.css`, tutti sopra soglia |
| 2 | `rgb(83,100,124)` ripetuto 210 volte | non presente in nessun CSS |
| 4 | 19 file CSS da unire in uno | un solo `<link>`: `/app/style.css`. I 22 CSS sorgente restano tracciati ma sono concatenati dalla build (fase 20, A6) |
| 5 | `POST /api/posts` senza autenticazione risponde 400 invece di 401 | risponde **401**. Verificato con richiesta reale: 401 senza utente, 403 se l'origine non combacia, 415 se il formato non è JSON. Il 400 arriva solo a utente autenticato senza profilo, ed è corretto |
| 6 | `post-text required` impedisce di pubblicare con un tocco | il percorso rapido non usa quel campo: `quick-report.js` compone il testo da sé. Il `required` resta sul modulo lungo, dove serve |
| 8 | mancano notifiche, IndexedDB, background sync, manifest PWA, meta Open Graph | tutti presenti e consegnati: `notifications.js`, `offline-store.js`, manifest collegato, 10 meta `og:`, 5 gestori `sync` nel service worker |

Anche le priorità del documento sono in parte già consegnate: il Decisore è `decisione.js`; la domanda del giorno è la fase 24.1, e il file si chiama `daily-question.js`, non `domanda-del-giorno.js`; la moderazione delle foto è attiva lato server.

## Quello che il documento dice ed è ancora vero

- `assets/land-mesh.js` pesa 2,6 KB.
- Nessun modulo 3D entra nel bundle consegnato. La garanzia non è una convenzione: `build.mjs` si interrompe se un modulo ritirato rientra nel grafo.
- I token legacy `--cyan`, `--blue`, `--atmo-cyan` non esistono più.
- Una sola navigazione in basso.
- `body` ha sia `background-color:#0e1620` sia `background-image`.
- Lo stato vuoto «Sei la prima persona…» è al suo posto.
- **JS iniziale: 364 KB non compressi, 125 KB gzip.** Sotto l'obiettivo dei 500 KB. Leaflet (146 KB) è un import dinamico e non entra all'avvio.

## Difetti trovati e corretti, non presenti nel documento

Verificati nel browser, visibili nelle schermate, corretti e rimisurati. Sono modifiche visibili agli utenti: cambiano l'aspetto dell'app, non solo l'infrastruttura. Ognuna è una riga o due di CSS e si annulla rimuovendo il blocco corrispondente.

Esito complessivo sulle nove rotte, a 375 px: i testi che uscivano dal proprio riquadro sono passati da 13 a **0**; i testi sotto la soglia di contrasto sono scesi a **0** reali. Ne restano due segnalati dalla misura, entrambi non difetti: il link di salto «Vai al contenuto», che è fuori schermo finché non riceve il fuoco da tastiera e con il fuoco misura 6,61:1, e «Collegamento IA non disponibile», che è esattamente in soglia a 4,50:1.

### 1. Testo illeggibile nella vista Lente (tema chiaro sulla radice, sfondo scuro sul body)

`main.js` applica la classe `atlas-light` alla radice su quasi tutte le rotte. Quella classe porta con sé colori di testo pensati per superfici chiare. Il `body`, però, rende il gradiente scuro del cielo: `rgb(14,22,32)` con `linear-gradient(#070e1c, #132441)`. Il CSS unito contiene **68 regole** che assegnano uno sfondo a `body`, e la regola chiara `.atlas-light body{background:#f6f8fb}` non vince.

Nella maggior parte delle schermate il testo resta comunque chiaro e leggibile. Dove non lo è, diventa quasi invisibile.

Il caso peggiore è la vista Lente (`#assistente`). `.lente-page` imposta `color:#182b43` e `.lente-wordmark` imposta `color:#142f52`, colori da superficie chiara, ma nessuna regola dà mai uno sfondo chiaro a quella pagina:

| testo | colore | sfondo | rapporto | soglia |
|---|---|---|---|---|
| «Lente» (titolo) | `#142f52` | `#0e1620` | **1,35** | 3,0 |
| «La voce di Lente · sempre seria in caso di pericolo» | `#182b43` | `#0e1620` | **1,27** | 4,5 |
| «Alla richiesta vengono inviati a OpenAI…» | `#182b43` | `#0e1620` | **1,27** | 4,5 |

Le variabili `--lente-ink` e `--lente-muted` dichiarate in `.lente-page` non sono usate da nessuna regola.

**Corretto dando alla pagina Lente la superficie chiara per cui era disegnata**, in `dist/lente.css`. La direzione opposta — portare quei testi ai token del tema scuro — è stata scartata dopo averla misurata: dentro `.lente-page` ci sono **12 superfici chiare** che non dichiarano un colore proprio e lo ereditano dalla pagina (`.lente-composer` ha sfondo bianco, `.lente-modebar` sfondo `#eaf0f7`, `.lente-message.answer` sfondo bianco, e altre nove). Portare la pagina al tema scuro ne avrebbe rotte 12 per ripararne 3.

Esito misurato dopo la correzione: 1,35 → **12,67**; 1,27 → **13,47** su entrambi i testi di servizio. Il terzo testo della pagina, il più tenue, sta a 4,72.

Nella stessa schermata la barra delle modalità (`.lente-modebar`) tagliava la quarta voce, «Community». Corretta con `flex-wrap`: le voci vanno a capo invece di uscire dal riquadro, e restano tutte visibili senza scorrimento nascosto.

### 2. Etichette della barra di navigazione sovrapposte a 375 px

Cinque voci da 72 px ciascuna, affiancate senza spazio. «Community» ha bisogno di 81 px e ne ha 72, con `overflow:visible`: il testo esce e tocca le voci vicine. Sullo schermo si legge «Meteo Community Profilo» come una parola sola.

| voce | larghezza disponibile | larghezza richiesta |
|---|---|---|
| Oggi, Mappa, Meteo, Profilo | 72 px | 72 px |
| **Community** | 72 px | **81 px** |

**Corretto restando dentro il sistema di token**, in `dist/design-system.css`. Larghezza reale della parola «Community» misurata nel browser con il carattere dell'app:

| dimensione e peso | larghezza | spazio disponibile |
|---|---|---|
| 14 px / 700 (com'era) | 89,6 px | 72 px ✗ |
| 12 px / 700 | 76,8 px | 74 px ✗ |
| **12 px / 500** | **69,5 px** | **74 px ✓** |

`--t-label` (12 px) e `--w-medium` (500) sono entrambi token già esistenti: nessun valore nuovo introdotto, come chiede la riga 78 del documento originale. La voce attiva resta riconoscibile dal proprio riquadro e dal colore. L'altezza del bersaglio resta 67 px, sopra i 44 richiesti.

### 3. Testo invisibile sul pulsante principale della home

`<a href="#mappa">⌖ Apri la mappa</a>`, primo pulsante di `.atmo-actions`, aveva **testo dello stesso identico colore del proprio sfondo** (`#4fb6f5` su `#4fb6f5`): un rettangolo azzurro pieno, senza parole leggibili.

Causa: la regola `html body #main a{color:var(--dato)}` usa un ID e per specificità batte il colore scelto dal componente (`body .atmo-home .atmo-actions a:first-child{background:var(--dato);color:#102239}`), riportando il testo al colore dello sfondo. Corretto ripristinando il colore previsto dal componente con specificità maggiore, senza toccare la regola generale.

### 4. Collegamento «Guida» a 2,25:1 su bianco

`.guide-link` (85×44 px, visibile su `#tendenze`) dichiara sfondo bianco ma nessun colore, quindi ereditava `var(--dato)` dalla stessa regola con ID: azzurro su bianco, **2,25:1**. Portato a `#145ab7`, il colore che l'app usa già per i collegamenti su superficie chiara: **6,61:1**.

Le correzioni 3 e 4 hanno la stessa radice: una regola generale con un ID che scavalca i colori scelti dai singoli componenti. Qui sono stati corretti i due casi dimostrati dalla misura; la regola generale non è stata toccata, perché altrove è probabilmente voluta. Vale la pena rivederla con calma.

## Conflitti fra le regole invariabili e il codice consegnato

Non sono errori di misura: è il codice che contraddice le regole del documento.

1. **«Nessun campo di testo rivolto a un'altra persona. Niente commenti.»** `dist/network.js`, che è nel bundle consegnato, mostra un pulsante commenti con conteggio e un campo per scriverli; `POST /api/comments` accetta fino a 500 caratteri. I commenti esistono e sono raggiungibili.
2. **«Tutto scade dopo 2 ore.»** Nel Worker la scadenza si imposta solo quando la segnalazione è rapida (`rapid===true`). I post normali non scadono.

Entrambi sono interventi sul prodotto pubblicato, non infrastruttura, e restano da decidere.

## Cosa non è verificabile da qui

- **«`/api/posts` restituisce `{"posts":[]}` da sei giorni.»** Riguarda il database di produzione, che non va interrogato da qui.
- Le misure di prestazione del documento originale (DOMContentLoaded, tempo dell'ultimo script) vengono dal sito pubblicato e non dal repository.
- La resa della mappa, per la mancanza di rete verso il servizio di cartografia da questo ambiente.

## Origine del documento

Il documento originale indica come autore «Luca» e afferma «nessun Git, nessuna cronologia», mentre questo repository esiste, contiene la sorgente Sites della versione 64 ed è intestato a `walkerfumaquestawinston`. Sembra fotografare uno stato precedente alla sincronizzazione del 17 settembre. Da confermare con il proprietario prima di usarlo come riferimento.
