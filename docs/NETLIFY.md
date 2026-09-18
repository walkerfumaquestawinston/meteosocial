# Collegare il repository a Netlify

## Stato: collegato e funzionante (18 settembre 2026)

Il collegamento è stato fatto dal proprietario. Progetto Netlify: **`friendly-pothos-c169ad`**. Il proprietario ha confermato che il sito si apre.

**Le anteprime per pull request sono attive.** Ogni PR riceve un proprio indirizzo, per esempio `https://deploy-preview-3--friendly-pothos-c169ad.netlify.app`, costruito dal ramo della PR. Conta molto per il modo di lavorare: un aggiornamento su un ramo **si vede subito**, senza doverlo prima integrare in `main`. Il sito principale continua a essere costruito da `main`.

Netlify aggiunge anche tre controlli propri su ogni PR, che si leggono direttamente su GitHub:

| controllo | cosa verifica | esito sulla PR #3 |
|---|---|---|
| `Redirect rules` | che le regole di redirect siano valide e accettate | **success** |
| `Header rules` | che le intestazioni dichiarate siano valide | **success** |
| `Pages changed` | elenco delle pagine toccate | neutral |

`Redirect rules: success` è una conferma indipendente che il proxy `/api/*` dichiarato qui sotto è sintatticamente valido e accettato da Netlify. Non dice però che le scritture funzionino: quelle restano bloccate per i motivi spiegati più sotto, che non dipendono dalla configurazione.

Le sezioni che seguono restano come riferimento per rifare il collegamento o per capire cosa è stato configurato.

---

Anteprima statica di MeteoSocial su Netlify, con le API in proxy verso il backend Sites.

**La pubblicazione ufficiale resta su Sites**, allo stesso indirizzo di sempre: https://scudo-meteo-community.walkerthehate.chatgpt.site. Netlify non la sostituisce, non la modifica e non tocca il database di produzione. Un deploy su Netlify e un aggiornamento del sito Sites restano due cose separate.

## Prima di iniziare: cosa funziona e cosa no

Verificato interrogando il Worker ricostruito, non supposto:

| richiesta | attraverso il proxy Netlify |
|---|---|
| `GET /api/posts` | 200 ✓ |
| `GET /api/atlas/hail?city=…` | 200 ✓ |
| `GET /api/me` | 200 ✓ |
| `POST /api/posts` senza identità | **401** ✗ |
| `POST /api/posts` con identità, origine Netlify | **403** ✗ |

**Su Netlify l'app è in sola lettura.** Si vedono i contenuti pubblici; non si pubblica, non si conferma una segnalazione, non si accede al proprio profilo.

Due motivi, entrambi nel Worker e nessuno aggirabile dal lato Netlify:

1. L'identità arriva dalle intestazioni `oai-authenticated-user-id` e `oai-authenticated-user-email`, che ChatGPT Sites aggiunge alle sessioni autenticate sul proprio dominio. Un proxy non può fabbricarle, e fabbricarle sarebbe impersonare un utente.
2. Ogni scrittura viene rifiutata se l'intestazione `Origin` non coincide con il dominio del Worker. Da Netlify non coincide mai. È una protezione contro le richieste da altri siti: funziona esattamente come deve.

Quindi Netlify va bene per mostrare il progetto, provare la resa su un dispositivo, condividere un'anteprima. Non è un secondo sito funzionante.

## Passo per passo

### 1. Prepara il repository

Già fatto. Il repository è https://github.com/walkerfumaquestawinston/meteosocial e contiene `netlify.toml` e `tools/netlify-publish.mjs`. Se stai lavorando su un ramo, ricordati che Netlify di norma pubblica il ramo predefinito: vedi il passo 4.

### 2. Accedi a Netlify con GitHub

1. Vai su https://app.netlify.com e scegli **Sign up** (o **Log in** se hai già un account).
2. Scegli **GitHub** come modo di accesso e autorizza Netlify quando GitHub te lo chiede.

Autorizzare l'accesso è una tua decisione: Netlify chiede di leggere i repository che gli indichi. Puoi concedergli **solo** questo repository, senza dargli l'intero account.

### 3. Crea il sito dal repository

1. Nella dashboard: **Add new site** → **Import an existing project**.
2. Scegli **Deploy with GitHub**.
3. Alla richiesta *Install Netlify on your GitHub account*, scegli **Only select repositories** e seleziona `walkerfumaquestawinston/meteosocial`. Poi **Install**.
4. Nell'elenco che compare, seleziona lo stesso repository.

### 4. Controlla le impostazioni di build

Netlify legge `netlify.toml` e compila i campi da solo. Devono risultare:

- **Branch to deploy**: `main` per il sito ufficiale. Se vuoi pubblicare il lavoro in corso, indica qui il ramo, per esempio `claude/admiring-brown-065b6t`.
- **Build command**: `node build.mjs && node tools/netlify-publish.mjs`
- **Publish directory**: `netlify-dist`

Non serve aggiungere variabili d'ambiente. **Non inserire qui nessun segreto**: le chiavi di produzione restano su Sites, e questa anteprima non ne ha bisogno perché non scrive nulla.

Poi **Deploy site**. La prima build richiede qualche minuto: Netlify installa le dipendenze dal lockfile pnpm, esegue la build e pubblica.

### 5. Verifica che sia andata bene

Apri l'indirizzo che Netlify ti assegna (qualcosa come `https://nome-casuale.netlify.app`) e controlla:

- la pagina si apre e mostra la mappa e i contenuti;
- `https://…netlify.app/manifest.json` risponde e non dà 404;
- `https://…netlify.app/api/posts` restituisce JSON: è il proxy che funziona;
- provando a pubblicare una segnalazione compare un errore di accesso. **È il comportamento atteso**, non un guasto: vedi la tabella in cima.

Se la build fallisce, il registro è in **Deploys** → il deploy rosso → **Deploy log**.

### 6. Facoltativo: nome e deploy automatici

- **Site configuration** → **Change site name** per passare da `nome-casuale` a qualcosa di leggibile.
- Da quel momento ogni push sul ramo scelto pubblica da solo. Le pull request ricevono un'anteprima separata con un proprio indirizzo.
- Per fermare tutto: **Site configuration** → **Build & deploy** → **Stop builds**. Per rimuovere il sito: **Site configuration** → **Danger zone** → **Delete this site**. Nessuna delle due tocca Sites o GitHub.

## Cosa viene pubblicato

`tools/netlify-publish.mjs` mette in `netlify-dist/` la stessa gerarchia che il Worker espone:

| sorgente | indirizzo pubblicato |
|---|---|
| `dist/*` | `/*` (index.html, sw.js, moduli, fogli di stile) |
| `dist/app/*` | `/app/*` (bundle e CSS generati) |
| `dist/assets/*` | `/assets/*` (MapLibre, Leaflet, font, licenze) |
| `manifest.json` | `/manifest.json` |
| `icons/*` | `/icons/*` |

`manifest.json` e `icons/` stanno sul disco fuori da `dist/`: pubblicando solo `dist/` darebbero 404, quindi niente installazione della PWA e niente anteprima nei social.

Restano fuori `dist/server` (il Worker, che su Netlify non gira) e `dist/.openai` (manifesto di hosting e migrazioni). Verificato: `/server/index.js` risponde 404 e nella cartella pubblicata non finisce nessuna chiave.

`netlify-dist/` è in `.gitignore`: è un prodotto della build, si rigenera e non va salvato.

## Nota sulla cache

`netlify.toml` imposta `Cache-Control: no-cache` solo su `/sw.js`, perché un service worker rimasto in cache impedisce agli aggiornamenti di arrivare a chi ha già aperto il sito.

Non c'è nessuna regola di cache lunga su `/app/*`, ed è voluto: lì solo i chunk hanno l'impronta nel nome (`chunk-*.js`, `leaflet-*.js`), mentre `main.js` e `style.css` no. Marcarli `immutable` per un anno significherebbe consegnare per un anno la versione vecchia.
