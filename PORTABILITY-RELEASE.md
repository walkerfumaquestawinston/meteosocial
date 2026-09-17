# Ripresa del progetto su un altro PC

12 settembre 2026. Aggiornamento agli strumenti di sviluppo e alla documentazione; nessun cambiamento funzionale al Worker pubblico della baseline v15.

- La sorgente salvata nello stesso progetto Sites contiene ora una procedura di ripresa e stato, vincoli IA, PRD e note delle consegne effettive.
- L'avvio locale controlla i file e il runtime, ricostruisce l'app e avvia il server solo sull'indirizzo locale. Su Windows è disponibile un launcher.
- Il database di prova e i media persistono localmente. Le migrazioni sono registrate e controllate; una migrazione storica modificata viene rifiutata senza azzerare i dati.
- Il profilo locale è esplicitamente di prova. Le intestazioni d'identità esterne vengono rimosse, le scritture richiedono la stessa origine e ogni avvio rinnova la sessione.
- Non vengono trasferiti segreti, dati degli utenti o conversazioni locali. Il sito conserva account, database, media e chiave IA ospitata.

Verifiche eseguite: controllo sintattico, avvio guidato e build da una cartella diversa, 24 controlli d'integrazione con database temporanei e senza richieste IA esterne. Controllato che `dist/` non differisca dall'app pubblicata. Non provato fisicamente su un secondo computer o su macOS/Linux.

Lo stesso account permette di ritrovare il progetto online; non sincronizza automaticamente cartelle locali. Servono il primo accesso sul nuovo dispositivo e gli eventuali permessi richiesti. `AGENTS.md` guida recupero e salvataggio durante il lavoro con Codex; non è un servizio di sincronizzazione continua.
