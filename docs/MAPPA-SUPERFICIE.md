# Superficie meteo stimata — v114

Temperatura e vento possono essere visualizzati come superficie interpolata o punti. Il campo usa esclusivamente le letture già caricate per le località visibili: non aumenta richieste o abbonamenti. Il radar resta separato e sospende il campo stimato.

Interpolazione inversa del quadrato della distanza; vento combinato come vettore. Sono necessari almeno tre punti recenti non allineati della stessa fonte e fascia oraria. Nessuna estrapolazione fuori dal poligono; punto più vicino entro 150 km e terzo entro 350 km, guardia sulle latitudini oltre 75°. Queste soglie limitano la visualizzazione ma non certificano accuratezza: rilievi, coste e microclimi non sono risolti. La copertura resta dipendente dalle località disponibili, incluso il limite esistente di otto richieste del provider pagato.

Legenda compatta, selettore Superficie/Punti, fonte e ora nei dettagli; clic sull'area restituisce stima e limite. Canvas a risoluzione limitata, frecce statiche, nessun ciclo animato continuo. Durante spostamento la superficie viene nascosta e ricalcolata a movimento concluso.

Verifica: build e 76 suite attive superate, 5 contratti ritirati. Test di costanza, bordi, punti insufficienti/collineari, dati vecchi, fonti diverse, direzione e cancellazione dei venti, lacune, antimeridiano e guardia polare. Anteprima desktop e 390 px: colori e frecce osservati con dati disponibili; successivamente esclusione dei dati vecchi verificata, selettore e radar funzionanti. La disponibilità locale non certifica quella dei provider in produzione.
