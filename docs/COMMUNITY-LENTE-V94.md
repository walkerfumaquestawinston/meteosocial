# Community e Lente — revisione 94

Controllo pubblico di Meteo e Community: riprodotta attribuzione Open-Meteo errata nella scheda Community con previsione WeatherAPI. Corrette attribuzioni secondarie Community e Lente. Stesso cielo usa current.time_epoch quando disponibile: l'ora locale WeatherAPI senza offset non viene più scambiata per UTC. Dati vecchi, futuri e offline esclusi dal suggerimento.

Community: pulsante Ultime 2 ore riutilizza il filtro server con paginazione; mantiene il comune, il fenomeno e la ricerca correnti. Nessun risultato filtrato non implica assenza di post nella città. Confronto previsioni/racconti prepara una domanda modificabile a Lente; non invia automaticamente né pubblica post.

Lente: scheda iniziale con fonte, orario locale e indicazione dati salvati; contesto dei post esplicito. Il campione server resta al massimo 12 testi pubblici della località nelle ultime 24 ore (due ore per grandine), distinto dai filtri del feed. Nuove domande di seguito In tre punti e Cosa va verificato?, sempre con invio manuale. Focus dei suggerimenti corretto quando il pannello è aperto sopra la pagina assistente.

Corretti colori del dialogo IA che ereditavano combinazioni poco leggibili dal tema sottostante e larghezza dei filtri Community su mobile. Nessuna nuova sottoscrizione o migrazione dati.

Validazione: build, 70 suite attive; regressioni fonte e UTC in test-community-context. Verifica browser locale del filtro, messaggio vuoto, domanda preparata senza invio e pannello desktop/390 px. IA locale non configurata: nessuna nuova generazione reale OpenAI eseguita, contratti di autenticazione, fonti, errori e privacy verificati nei test isolati. Nessuna pubblicazione di contenuti di prova in produzione; nessuna certificazione completa di tutte le pagine o dispositivi fisici.
