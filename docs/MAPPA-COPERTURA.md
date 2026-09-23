# Diagnosi della mappa scarna — 23 settembre 2026

## Evidenza

Sito pubblico v112 aperto: livello Neve precedentemente salvato, radar OFF; pannello Rainbow con quantità neve e zero termico non disponibili. Mappa MapTiler caricata regolarmente. Passando a Temperatura compaiono valori aggiornati Rainbow, tra cui San Benedetto del Tronto 21 gradi arrotondati e Roma 26. Non un guasto generale di tutte le API. Non è stata verificata la corrispondenza con misure a terra.

Il codice limita la lettura pagata a 8 località, sceglieva le prime in ordine di catalogo e pubblicava il gruppo solo al termine. Le etichette escludevano qualsiasi città priva di un valore del livello (salvo quella selezionata): con neve assente o senza quantità il risultato sembrava vuoto. Non esiste un campo continuo di temperature o vento in questa implementazione.

## Modifiche

Città senza valore del livello restano esplorabili con nome neutro. I dati ricevuti compaiono progressivamente; campionamento spaziale delle stesse 8 località massime per chiamata, con priorità al luogo selezionato. Nessun aumento del limite o nuovo provider. Il costo totale resta dipendente da uso, spostamenti e cache.

Legenda con copertura effettiva, distinzione tra dato mancante e zero; neve senza quantità non viene presentata come 0 cm. Collegamenti a Temperature e radar. Sul telefono spiegazione espandibile per lasciare spazio alla mappa. Il livello scelto resta conservato. Zoom iniziale 6; invalidateSize con pan:true conserva il centro geografico durante il ridimensionamento, come previsto dal codice Leaflet incluso. Non certificazione della causa storica della mappa bianca.

## Verifiche

Build e 75 suite attive superate, 5 ritirate; due suite mirate ripetute dopo rifiniture. Nuovo test: budget, priorità selezione, distribuzione spaziale, antimeridiano, dati mancanti contro zero. Browser pubblico per diagnosi; anteprima locale desktop e 390 px per città esplorabili, copertura e centraggio. Il profilo locale usa dati salvati e fonti alternative, non le chiavi online. Nessun nuovo abbonamento, post o richiesta IA.
