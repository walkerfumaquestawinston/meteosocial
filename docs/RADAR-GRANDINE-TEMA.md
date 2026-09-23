# Radar grandine gratuito e tema automatico

22 settembre 2026. L’utente richiede radar grandine e una mappa chiara al mattino/scura di notte. Dopo la ricerca sui servizi a pagamento torna esplicitamente alla scelta gratuita. Nessun acquisto o account aggiunto.

## Radar-DPC POH

Fonte nazionale verificata: https://dpc-radar.readthedocs.io/it/latest/ e API https://dpc-radar.readthedocs.io/it/latest/api.html . Prodotto POH (Probability of Hail), aggiornamento nominale 5 minuti; l’orario effettivo può essere precedente. Copertura italiana non uniforme. È probabilità stimata da radar, non conferma di grandine a terra o previsione dell’ora di arrivo. Non estendere la copertura al mondo.

GET /api/maps/hail-radar recupera solo l’ultimo POH da endpoint fissi. Scarica l’URL S3 firmato temporaneo solo dal bucket ufficiale e dal percorso POH atteso. Origin dell’app dichiarata, nessuna impersonificazione del sito DPC. Verificati risposte reali, formato TIFF e orari. Cache 60 secondi per istanza e deduplicazione richieste; limite 4 MB, timeout per richiesta, rifiuto di quadri oltre 30 minuti o futuri. Non necessita credenziali né scheduler. Errori rimuovono l’overlay e sono visibili.

Il browser carica su richiesta GeoTIFF 2.1.3 e Proj4js 2.22.0, distribuzioni ufficiali npm conservate con licenze MIT. Nessuna dipendenza remota eseguita al runtime. La griglia osservata è 1200×1400, 1 km, Transverse Mercator WGS84 origine 12.5 E/42 N. Validazione stretta dei GeoKey e del bounding box; riproiezione inversa per ogni pixel Web Mercator, senza stiramento della griglia originale. Campione reale del 22/09/2026 06:55 UTC decodificato: valori mancanti negativi, valori validi 0–0.385827; rappresentazione POH normalizzata 0–1. Il renderer rifiuta valori positivi oltre 1 invece di cambiare unità silenziosamente. Colori 10–30, 30–50, 50–80, 80–100%; sotto 10% e nodata trasparenti, chiariti nella legenda. Questo non certifica zone sicure. I colori sono scelti dall’app, non sono la palette ufficiale DPC.

Il livello Grandine apre POH; Pioggia usa RainViewer. I due overlay non vengono sommati. POH mostra l’ultimo quadro: non viene inventata una sequenza storica. Restano i filtri community 25/50/100/150 km e 15/30/60/120 minuti, Ripari e Lente. I pixel radar non sono inviati all’IA e non alimentano stime di arrivo.

Dati Radar-DPC e immagine derivata ricolorata/riproiettata: CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/ . Fonte e licenza indicate nell’interfaccia. L’attribuzione non implica approvazione di MeteoSocial da parte del DPC.

## Aspetto e componenti

MapTiler usa Atlante chiaro di giorno e dataviz-v4-dark di notte, con cambio URL solo quando la fase cambia. Cartografia, pannelli, etichette, dettagli e controlli cambiano insieme. Automatico è il valore iniziale; Strumenti offre Sempre chiara/Sempre scura e salva la scelta locale. La fase segue alba/tramonto della località impostata nell’app tramite sky-theme; se mancano effemeridi recenti, usa la fascia 07–19 del fuso disponibile. Cambio controllato ogni 30 secondi dall’app e al ritorno in primo piano. Non si presume il fuso dal solo centro della mappa.

Strumenti include indice dei sei livelli, radar pioggia/neve, localizzazione su consenso, elenco luoghi, nomi città, vista mondiale, aggiornamento, guida ed eventi naturali. Nessuna pretesa di avere ogni componente meteo esistente.

Build e 69 suite passate. Verificati anche i test mirati dopo le rifiniture. Test di fonte fissa, cache e concorrenza, dati vecchi, griglia/proiezione, colori, chiusura durante caricamento e cambio tema senza richieste duplicate. Anteprima reale 4597: POH caricato con orario 09:10 e poi 09:15 CEST, cartografia scura/chiara verificata. Limiti Open-Meteo precedenti restano separati. Esito della pubblicazione nelle note principali.
