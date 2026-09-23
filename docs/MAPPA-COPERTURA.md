# Diagnosi della mappa scarna — 23 settembre 2026

## Evidenza

Sito pubblico v112 aperto: livello Neve precedentemente salvato, radar OFF; pannello Rainbow con quantità neve e zero termico non disponibili. Mappa MapTiler caricata regolarmente. Passando a Temperatura compaiono valori aggiornati Rainbow, tra cui San Benedetto del Tronto 21 gradi arrotondati e Roma 26. Non un guasto generale di tutte le API. Non è stata verificata la corrispondenza con misure a terra.

Il codice limita la lettura pagata a 8 località, sceglieva le prime in ordine di catalogo e pubblicava il gruppo solo al termine. Le etichette escludevano qualsiasi città priva di un valore del livello (salvo quella selezionata): con neve assente o senza quantità il risultato sembrava vuoto. Non esiste un campo continuo di temperature o vento in questa implementazione.

## Modifiche

Città senza valore del livello restano esplorabili con nome neutro. I dati ricevuti compaiono progressivamente; campionamento spaziale delle stesse 8 località massime per chiamata, con priorità al luogo selezionato. Nessun aumento del limite o nuovo provider. Il costo totale resta dipendente da uso, spostamenti e cache.

Legenda con copertura effettiva, distinzione tra dato mancante e zero; neve senza quantità non viene presentata come 0 cm. Collegamenti a Temperature e radar. Sul telefono spiegazione espandibile per lasciare spazio alla mappa. Il livello scelto resta conservato. Zoom iniziale 6; invalidateSize con pan:true conserva il centro geografico durante il ridimensionamento, come previsto dal codice Leaflet incluso. Non certificazione della causa storica della mappa bianca.

## Verifiche

Build e 75 suite attive superate, 5 ritirate; due suite mirate ripetute dopo rifiniture. Nuovo test: budget, priorità selezione, distribuzione spaziale, antimeridiano, dati mancanti contro zero. Browser pubblico per diagnosi; anteprima locale desktop e 390 px per città esplorabili, copertura e centraggio. Il profilo locale usa dati salvati e fonti alternative, non le chiavi online. Nessun nuovo abbonamento, post o richiesta IA.

## Pubblicazione

## 23 settembre 2026 — v113 pubblicata: copertura della mappa

Pubblicazione riuscita 2026-09-23T11:40:48.801412+00:00; ambiente 12 e pubblico preservati. Sites runtime cbecb8019f728b08388cd5367ed7840f41e601db; GitHub f82dfe3a4299a9c470e55ff8de972200dd21584b; tree identico 81c4e582d308ae29639053ad12ca48e7cc9e8e01. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_d5e3b12317fc8191bb3ce57e567885be; deployment appgdep_6ab3ba781cc88191862441e64d5b778a. CI 35855726137 riuscita. Build e 75 suite attive superate, 5 ritirate; due suite mirate ripetute. Compilazione remota per limite packaging Windows.

Diagnosi pubblica: Neve selezionata, quantità neve Rainbow mancanti e radar spento; Temperature mostrava valori reali. Etichette prima limitate ai dati del livello e campione pagato di 8 città in ordine di catalogo. Ora città esplorabili, valori progressivi, campione distribuito nello stesso limite, copertura e dati mancanti espliciti, accessi a Temperature/radar, zoom 6 e centro preservato al resize. Anteprima locale desktop/390 px verificata e aggiornata. Dettagli docs/MAPPA-COPERTURA.md. Nessun campo continuo di temperatura/vento, nessun nuovo provider o abbonamento. Ramo e PR draft #21 salvati; successivi commit solo note senza altro deploy.

