# Sincronizzazione GitHub — 17 settembre 2026

Il repository GitHub walkerfumaquestawinston/meteosocial contiene ora la sorgente Sites bd822c5d88dc0b88a64caf180fb5dfb6a35b71d1. La versione pubblicata è 64, commit applicativo 5b336b97a12e7f8f0f80b713e8ef5154fd6ed381. Il commit sorgente successivo aggiunge le istruzioni per Claude senza cambiare il sito.

GitHub resta pubblico per scelta esplicita del proprietario. La vecchia app single-file del 10 settembre è conservata nella cronologia Git, non è la base da sviluppare. Sites rimane il sistema di pubblicazione, con lo stesso URL. Nessun deploy automatico da GitHub e nessun trasferimento dei dati di produzione.

Le note precedenti qui sotto restano cronologia; le affermazioni sul mancato trasferimento GitHub sono superate da questa sincronizzazione.

# Preparazione GitHub e Claude — 17 settembre 2026

## Stato effettivo

Istruzioni CLAUDE.md preparate nel progetto esistente, basate sulla versione pubblicata 64. Nessuna modifica al comportamento del sito. GitHub risulta installato, ma in questa sessione non sono esposti comandi GitHub e non è disponibile gh: repository GitHub NON creato, codice NON trasferito, Claude NON collegato.

## Passaggi da completare con accesso GitHub operativo

1. Verificare l’account autenticato e cercare un eventuale repository MeteoSocial già esistente. Non sovrascrivere un repository omonimo.
2. Preparare un repository privato nell’account dell’utente. Prima del trasferimento, controllare file e cronologia per segreti: .gitignore non rimuove segreti già tracciati. Non trasferire dati applicativi o credenziali Sites.
3. Caricare il codice dell’ultima sorgente Sites verificata, includendo CLAUDE.md, AGENTS.md e documenti di stato. Conservare provenienza e commit di base; concordare esplicitamente eventuali divergenze esistenti.
4. Il proprietario collega quel repository nella propria sessione Claude Code sul web; non basta che GitHub sia collegato a ChatGPT.
5. Ogni compito usa un ramo separato e una pull request. Il coordinatore verifica, integra e pubblica tramite il progetto Sites esistente. Nessuna pubblicazione automatica aggiunta.

## Primo compito consigliato per Claude

Leggi CLAUDE.md e i documenti di stato. Verifica la struttura del progetto e segnala problemi concreti con file ed evidenze. Non modificare codice e non avviare altre fasi. Indica il commit analizzato e proponi un singolo intervento circoscritto da assegnare.

Questo primo controllo permette di verificare che Claude veda la stessa versione senza aprire modifiche concorrenti.
