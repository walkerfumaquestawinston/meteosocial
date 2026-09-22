# Cielo vivo — 22 settembre 2026

## Comportamento implementato

Oggi apre con stagione/festa, città e meteo leggibile. Tre azioni: Previsioni, Mappa e radar, Segnala. La barra inferiore mantiene cinque destinazioni di pari dimensione. L'osservatorio della mappa si espande su richiesta anche su desktop; sul telefono Temperatura è abbreviato in Temp., con nome accessibile completo.

Colori e dettagli seguono due calendari indipendenti: alba/giorno/tramonto/notte già esistenti e stagione/festività introdotti qui. Le feste modificano accenti, badge e bordi della scheda; i colori dei rischi meteorologici restano semantici. Natale usa verde e un bordo rosato, Pasqua e San Valentino rosa, estate/Ferragosto oro, autunno ambra. Nessuna decorazione copre testi o comandi.

Stagioni astronomiche da US Naval Observatory: https://aa.usno.navy.mil/data/Earth_Seasons e https://aa.usno.navy.mil/data/api. Istanti UTC incorporati, copertura completa 2026–2040. L'emisfero sud inverte le stagioni. Fuori copertura l'aspetto stagionale è neutro. Non si usa una data fissa come il 21 di ogni mese. Esempio: autunno 2026 il 23 settembre alle 00:05 UTC, 02:05 Europe/Rome.

Le ricorrenze italiane seguono la data civile della località, dal fuso della previsione: Capodanno, Epifania, San Valentino, Pasqua/Pasquetta (calcolate), Liberazione, Lavoro, Repubblica, Ferragosto, Halloween, Ognissanti, Immacolata, Vigilia, Natale, Santo Stefano, San Silvestro. Per località estere non vengono applicate feste italiane. Non è un calendario mondiale delle festività.

Aggiornamento all'avvio, navigazione, caricamento meteo, ritorno alla scheda e ogni 30 secondi mentre visibile: il cambio avviene entro 30 secondi dall'istante previsto, senza ricaricare. Nessuna modifica all'orologio Windows o servizio in background.

## Verifica

58 suite attive superate, zero fallimenti. Test nuovi su tutti i confini stagionali 2026–2040, mezzanotte e fusi, Pasqua mobile, cambio giorno, rimozione del tema festivo, emisferi e fine copertura. 240 coppie testo/sfondo delle palette calendario/fasi solari sopra 4,5:1 (minimo 5,44:1). Questa misura riguarda i token, non certifica tutta l'accessibilità del sito; gradienti e layout sono controllati visivamente.

Test di avvio riscritto per il contratto attuale: moduli caricati, asset ritirati assenti, cache offline e isolamento delle richieste private. Runner compatibile Windows con output su file temporaneo e timeout; gli errori attivi non vengono più classificati come ritirati per euristica. Cinque contratti storici esplicitamente esclusi: climate, globe-gestures, google3d, hail-map, hail. I file restano disponibili e si possono eseguire con `node tools/run-tests.mjs --include-retired`; riguardano percorsi dismessi e falliscono rispetto al prodotto attuale. Le suite correnti grandine e mappa vengono eseguite.

## Manutenzione e continuità

`dist/calendar-theme.js` contiene la logica; `dist/season-design.css` contiene le palette e il layout. `dist/season-dates.js` è generato da `python tools/update-season-calendar.py` (richiede rete e Python). Estendere gli anni nello script prima del 2041 e aggiornare i test di copertura. `node build.mjs` compila; `node tools/run-tests.mjs` verifica il prodotto corrente.

Allineare ogni rilascio ad anteprima locale, sorgente GitHub e Sites già esistente. Non incorporare la fixture di prova visiva o dati di esempio nella pubblicazione. Le note di rilascio in PROJECT_STATUS.md indicano la versione effettivamente pubblicata.
