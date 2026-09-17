# Grandine chiara — analisi e consegna

13 settembre 2026. Continuazione della sorgente online MeteoSocial 17.

## Confronto con Grandinometro

Analisi del sito, delle schede ufficiali e delle recensioni pubblicamente visibili; nessuna installazione su un telefono, prova delle notifiche o accesso alle metriche interne. Le recensioni sono esperienze individuali, non diagnosi riprodotte. Non è dimostrata l’esclusività mondiale della nostra proposta.

La forza del prodotto è la domanda immediata: cosa viene segnalato qui? Mappa centrale, invio rapido e gratuità favoriscono una comprensione veloce. La nostra lettura è che utilità concreta e contributi locali possano favorire la diffusione; non abbiamo dati di fidelizzazione per attribuirle una causa certa. Il sito spiega la conferma/smentita tra utenti e la visibilità delle segnalazioni recenti. Questo meccanismo non prova da solo l’autenticità. [Sito ufficiale](https://grandinometro.it/)

La scheda Android dichiara confronto automatico con radar DPC, raggio notifiche da 2 a 50 km, fascia notturna, tre luoghi salvati e link da condividere. Sono capacità già presenti: non vanno proposte come nostre invenzioni. [Google Play](https://play.google.com/store/apps/details?id=it.grandinometro.app)

La scheda iOS consultata mostrava 4,6/5 su 248 valutazioni e il primo posto in Meteorologia: segnali di interesse, non prova di accuratezza o utenti attivi. Le note 1.2.7 dichiarano filtri sincronizzati, radar sempre accessibile e una correzione alla rappresentazione della card del rischio. Non consideriamo il difetto corretto ancora presente. Le recensioni chiedono, tra l’altro, migliore monitoraggio delle zone e maggiore chiarezza grafica; lo sviluppatore risponde sul miglioramento del design. L’assenza di funzioni di accessibilità dichiarate nello store non dimostra che l’app sia inaccessibile. [App Store](https://apps.apple.com/it/app/grandinometro/id6796001485)

## Differenziazione realizzata

Una vista dedicata `#grandine`, raggiungibile dalla Home e dal livello Grandine della mappa. Tre fonti mantenute distinte: bollettino ufficiale con emissione/validità, modello Open-Meteo con ora/fuso, dichiarazioni della community nelle ultime due ore. Nessun semaforo ricavato dai voti e nessuna probabilità di grandine inventata.

- Conteggio post e conteggio account distinti: ripetizioni dello stesso autore non si trasformano in più account. Più account non sono una prova di indipendenza.
- Selezione della città prima del limite di 12 post, così l’attività di altre città non cancella il campione locale. Totale e campione sono distinti; eliminati, scaduti, futuri e autori bloccati vengono esclusi.
- Cronologia dei testi con apertura dell’originale per leggere e rispondere. Pulsante Segnala grandine riusa il flusso esistente con conferma, foto facoltativa e scadenza di due ore.
- Lente IA contestuale per Auto, Casa e Attività fuori: domanda modificabile e invio manuale. Il server legge solo testi Grandine delle ultime due ore, più previsioni e bollettino. Nessun nuovo invio di GPS, identità degli autori o media. Tono sobrio obbligatorio; resta l’override deterministico delle allerte rosse.
- Condivisione testuale manuale, copia negli appunti e alternativa selezionabile. Include città, momento di consultazione, fonte e limiti; specifica che la fotografia può diventare vecchia. Il link apre la vista e invita a selezionare la città riportata.
- Stato assente/scaduto esplicito; aggiornamento community ogni minuto con pagina visibile, al ritorno dal background, alla modifica di località/identità e dopo creazione o cancellazione di post. Il bollettino conserva cache e validità del proprio servizio.

## Confini

Le località dei post sono dichiarate per nome: non coordinate d’impatto, non risoluzione garantita delle omonimie. Le segnalazioni non sono rilevamenti verificati. Lente non analizza pixel radar o foto in questo percorso, non predice minuti all’impatto, percorsi sicuri, disponibilità dei ripari o diametro dei chicchi. Nessuna notifica a app chiusa aggiunta.

Nessuna migrazione, cancellazione di dati o cambio delle credenziali. Riutilizzati Worker, D1, Lente e sistema di segnalazione esistenti. La nuova route di lettura non usa cache pubblica e rispetta gli autori bloccati.

## Verifica

20 controlli dedicati Grandine chiara, 68 Lente, 49 Atmosphere e 49 Atlas superati su database isolati e API simulate. Copertura: query per città, duplicati per account, scadenze, dati mancanti, post esclusi, perimetro IA, tono, asset serviti e limiti di campionamento. Build di produzione riuscita. Nessun post di prova pubblico e nessuna verifica su telefoni fisici. Le risposte effettive del modello restano non deterministiche; i test verificano richieste, perimetro e gestione del risultato.
