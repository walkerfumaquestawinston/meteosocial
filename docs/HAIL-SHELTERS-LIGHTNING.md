# Grandine, ripari e fulmini — 21 settembre 2026

## Diagnosi e confronto

Riproduzione sul sito: GET /api/pulse/nearby per il centro pubblico di San Benedetto del Tronto, risposta 200 dopo circa 29,4 secondi, zero luoghi e sourceError per timeout. Il pulsante raggiungeva il backend; il singolo servizio Overpass non rispondeva. Il percorso di errore generale eliminava anche ricerca alternativa e possibilità di riprovare. Non era soltanto un difetto grafico.

Il confronto con [Grandinometro su App Store](https://apps.apple.com/it/app/grandinometro/id6796001485) conferma l'utilità di filtri coerenti tra mappa ed elenco, raggio esplicito, orari, radar e tutorial. La [pagina Business](https://grandinometro.it/business/) descrive parcheggi coperti vicini e integrazioni commerciali; l'accesso ai dati/API richiede accordi. Queste informazioni non dimostrano parità di copertura, precisione o prestazioni. Non sono stati copiati grafica, dati riservati o endpoint privati.

## Implementazione

- server/pulse.js: due istanze pubbliche OSM fisse, sequenziali; timeout 8,5 secondi ciascuna, query limitata a 7 secondi e 100 risultati. Quote globali conservate: massimo 80 ricerche nuove al giorno, fino a due tentativi per ricerca. Coordinate arrotondate prima dell'invio, nessun nuovo destinatario per dati personali oltre le istanze OSM pubbliche. Fonte degli endpoint: [OSM Wiki](https://wiki.openstreetmap.org/wiki/Overpass_API).
- Cache pubblica della sola cartografia: fresca per 6 ore, copia precedente utilizzabile fino a 7 giorni durante un guasto, con messaggio esplicito. Errori della cache non eliminano risultati validi. Nessuna cache condivisa di dati personali o filtri di blocco.
- Ripari: Auto al coperto / Edifici al chiuso, raggi 1/3/5 km filtrati nello stesso campione, ordinamento per distanza, marker, inquadratura, dettagli, ritorno all'elenco, orari dichiarati, accesso/costo e indicazioni Google Maps senza trasmettere l'origine precisa dell'utente.
- Ricerca alternativa disponibile già durante il caricamento e dopo errori; Riprova invalida la risposta di errore in memoria. Risposte tardive non sovrascrivono pannelli chiusi o una categoria/località differente.
- Grandine: restano le osservazioni community delle ultime 2 ore entro 25/50/100/150 km. Queste distanze non sono tempi di arrivo del fronte.
- Fulmini: simboli vettoriali in rilievo con tre facce illuminate, senza contesto WebGL o ciclo continuo. Viola / M identifica temporali da modello; ambra / C osservazioni community non verificate. Marker cliccabili con località, orario e dettaglio. Nessuna scarica artificiale aggiunta alla mappa.
- La sezione Fulmini apre gli edifici al chiuso per impostazione predefinita; guida contestuale e collegamento al [radar ufficiale italiano](https://mappe.protezionecivile.it/it/mappe-e-dashboard-rischi/piattaforma-radar/). Rilevamenti delle singole scariche non integrati.
- Lente IA e i suoi limiti di consenso restano invariati. Nessuna chiamata IA nei test, nuova dipendenza o migrazione. Cache shell v64.

## Sicurezza e limiti

Edificio cartografato non significa rifugio certificato, aperto o accessibile. Posti liberi non disponibili. Parcheggi interrati e sottopassi possono essere pericolosi con allagamenti; non si invita a uscire durante la grandine per salvare un'auto. In presenza di tuoni si suggerisce un edificio al chiuso, mai alberi o semplici tettoie. Riferimenti: [Protezione Civile — preparazione](https://rischi.protezionecivile.gov.it/it/meteo-idro/sei-preparato/), [rovesci e grandine](https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-rovesci-di-pioggia-e-grandine/).

Durante questa revisione entrambe le istanze pubbliche OSM hanno avuto timeout. Il recupero è verificato con fixture isolate; la disponibilità reale non può essere garantita. Per un servizio operativo su larga scala servono un catalogo di ripari mantenuto e una fonte cartografica con capacità/SLA adeguati, oltre a dati autorizzati per radar grandine e scariche. La quota globale attuale è un limite deliberato della configurazione esistente, non adatta a un lancio di massa.

## Verifica

Build e 15 suite della CI passano. test-pulse copre errore primario, riuscita secondaria, cache fresca senza rete, copia precedente dichiarata, scadenza a 7 giorni e guasti lettura/scrittura cache. Restano controlli privacy, blocchi, coordinate, categorie e disponibilità non inventata.

Browser desktop e 390 × 844: stato di errore reale; con provider di prova solo locale, elenco e marker coerenti, filtro 1 km, dettagli, ritorno, URL indicazioni e categoria edifici predefinita nei Fulmini. Nessuno scorrimento orizzontale o errore console nel controllo mobile. Non provato su telefoni fisici. Fixture fuori dal repository e mai incluse nella pubblicazione.
