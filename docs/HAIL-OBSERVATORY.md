# Osservatorio grandine — 22 settembre 2026

## Confronto e direzione

Grandinometro descrive radar, rete civica e filtri condivisi tra mappa e segnalazioni:
- https://grandinometro.it/
- https://apps.apple.com/it/app/grandinometro/id6796001485
- https://grandinometro.it/business/

La direzione originale di MeteoSocial è una lettura del territorio che separa osservazione, recenza, distanza e fonte. Nessuna esclusività di mercato o parità con Grandinometro viene dichiarata. Non sono stati copiati interfaccia o endpoint privati.

## Modifiche

- Finestra delle osservazioni: 15, 30, 60 o 120 minuti, calcolata per timestamp; cessate incluse per impostazione iniziale, escludibili.
- Un solo selettore per marker, conteggio ed elenco; lista ordinabile per distanza o recenza. Duplicati per ID esclusi, coordinate invalide, future e scadenze escluse.
- Pannello distingue caricamento, errore, dati da aggiornare dopo cinque minuti, osservazioni non cessate e filtri senza risultati. Nessun verde che suggerisca assenza di rischio.
- Pulsante radar collegato al radar precipitazioni esistente. I filtri osservazioni non spostano l'orario del radar.
- Richieste riutilizzate nella stessa cella pubblica di 0,01 gradi; aggiornamento del centro dei filtri senza altra richiesta. Aggiornamento manuale mantiene le osservazioni precedenti con stato esplicito, anziché azzerare il campione.
- Test aggiunto alla CI. Nessuna nuova dipendenza, migrazione, chiave, GPS automatico o richiesta IA.

## Verifica e limiti

18 verifiche pure superate e controlli sintattici riusciti. Harness browser isolato con Leaflet e i moduli sorgenti: tre marker iniziali, due con filtro 15 minuti, uno escludendo cessate; elenco corrispondente e callback radar funzionante. Il caricamento di vere tessere radar e l'intera app non sono stati provati in questo harness.

Build completa ancora bloccata da spawn EPERM di esbuild su Windows. Nessuna pubblicazione effettuata. Il sito pubblico resta alla versione 73. Per completare: installazione bloccata, build, suite CI e verifica responsive dell'app completa; poi salvare e pubblicare nello stesso progetto Sites.

## Prossime integrazioni necessarie per funzioni avanzate

Un livello radar grandine richiede un prodotto dati autorizzato, copertura documentata, timestamp e criteri verificabili. Probabilità e traiettorie richiedono algoritmi validati; il radar di pioggia non li sostituisce. Notifiche a app chiusa richiedono il servizio di consegna e la relativa autorizzazione. Il catalogo ripari esistente non fornisce posti liberi o accessibilità garantita.
