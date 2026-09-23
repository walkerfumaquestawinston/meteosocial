## 23 settembre 2026 — v103 pubblicata: Nowcast e Tiles Rainbow

Nowcast globale integrato in Meteo e nel pannello Pioggia: fino a 240 minuti, intensità mm/h, tipo e cursore accessibile. Mappa Rainbow: 37 quadri da -2 ore a +4 ore, passo 10 minuti, analisi e previsione esplicite. Adesso torna al quadro di base; RainViewer resta fallback dichiarato. Radar grandine DPC separato. Fonte non aggiornata al secondo; controllo e validità distinti, nessuna emissione nowcast inventata.

Chiave solo server nei segreti esistenti. Nowcast 100 tentativi/ora e 5.000/mese, Tiles (catalogo incluso) 1.500/ora e 30.000/mese della sola app. Cache JSON 5 minuti, tile 30 minuti ove supportata. Nessun nuovo abbonamento o modifica della fatturazione. Non limite complessivo account. Local preview 4597 aggiornata senza chiave reale.

Build e 72 suite attive superate, 5 storiche ritirate; test pertinenti ripetuti dopo rifiniture. CI 35837766567 riuscita. Produzione: Roma e Tokyo restituiscono 240 intervalli reali HTTP 200; PNG base e futuro HTTP 200. Browser verificato su San Benedetto: cursore minuto finale, mappa +240 minuti con immagini visibili; 390 px DOM senza overflow orizzontale. Non certificazione meteo, carico o telefoni fisici. Dettagli docs/RAINBOW-INTEGRAZIONE.md.

v102 introduce integrazione; v103 corregge attribuzione WeatherAPI residua, orario futuro e contrasto legenda/pulsante Adesso. Pubblicazione v103 riuscita 2026-09-23T08:34:21.621770+00:00, ambiente 12, pubblico preservato. Runtime Sites 59357d59f593c8664508363ee73a3351711af725; GitHub 47f72519e5637661796b6f3cc8659b626cac413e; tree 7ea8b9ae42aab12ab96055ff76ce64ba5152e22d. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_2112a5149db88191a09a77aa09098ccb; deployment appgdep_6ab38ed0373c8191b45220246e577389. Build remota per packaging locale non disponibile. PR draft #21 e ramo codex/weather-scenery-20260922; aggiornamenti seguenti solo note, senza deploy aggiuntivo. Le sezioni sotto sono cronologia.

## 23 settembre 2026 — v101 pubblicata: Rainbow attivo e verificato

Rainbow Weather attivo nei percorsi forecast/current e forecast: 24 ore dettagliate e 7 riepiloghi giornalieri del fornitore, con intervalli conservati. Segreto inserito dall’utente, ambiente Sites 12. Cache 15 minuti; protezione app 100 tentativi/ora e 5.000/mese, non limite complessivo account. Temperatura per l’ora corrente esplicitamente previsionale, non osservazione al secondo. Nowcast e Tiles Rainbow non ancora integrati; radar esistenti invariati.

Pubblicazione riuscita 2026-09-23T08:13:29.090649+00:00, pubblico preservato. Runtime Sites 5d44e517fabf77ea662df88817d96b1e05a9d9cc; GitHub c7f7d59a120ff0aa0644ad281782350d69f169c6; tree f41a98a3727379ad4735582e3804e8ddb7006ca8. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_05c814c89fc08191ad3b591bd2eac519; deployment appgdep_6ab389e0635081918f2b9ef6c2d56102. Build remota per packaging locale non disponibile. CI 35835762024 riuscita; 71 suite attive superate.

Prove reali: Roma 21,32 °C (10:00 locale), Tokyo 22,37 °C (17:00 locale), entrambe Rainbow, 24 ore/7 giorni, offline=false; current available. San Benedetto 19,02 °C, schermata Meteo verificata nel browser con fonte Rainbow e dicitura previsione oraria dopo Aggiorna/ricarica. Valori di verifica, non certificazione dell’accuratezza. Anteprima locale 4597 senza segreto reale. Risolti durante v97–100: redirect error non supportato nel runtime e richiesta 168 ore respinta; ora redirect manuale rifiutato e richiesta 24 ore/7 giorni. Diagnostica errori limitata e redatta. Dettagli docs/RAINBOW-INTEGRAZIONE.md. PR draft #21, ramo codex/weather-scenery-20260922. Le sezioni precedenti sotto sono cronologia.

## 23 settembre 2026 — Rainbow collegato, pubblicazione in verifica

RAINBOW_API_KEY salvata personalmente dall’utente nei segreti Sites, revisione 12. Il percorso server dà priorità a Rainbow per previsioni e punti mappa, cache condivisa 15 minuti, protezione 100 richieste/ora e 5.000/mese della sola app. Nessuna promessa di limite complessivo account. Fusi da tz-lookup 6.1.25; stime orarie esplicitamente previsionali, emissione e validità separate, dati assenti null. Giorni aggregati dalle ore disponibili: iniziale/finale parziali dichiarati. Radar RainViewer/DPC e dati specialistici separati. Build e 71 suite superate; test Worker Rainbow ampliato superato. Pubblicazione e prova autenticata ancora da confermare.

## 23 settembre 2026 — Rainbow attivo nell'account, migrazione del sito incompleta

Utente chiede Rainbow al posto del fornitore meteo esistente e autorizza il trasferimento della chiave nei segreti MeteoSocial. Account Rainbow verificato attivo. Trasferimento del segreto bloccato dal controllo automatico: non salvato in Sites, nessuna richiesta meteo autenticata verificata. Client server isolato e test con fixture preparati, ancora esclusi dal Worker. Dettagli e passi mancanti: docs/RAINBOW-INTEGRAZIONE.md. Produzione resta v96 WeatherAPI; non dichiarare Rainbow integrato, né la temperatura prevista una misura dal vivo.

## 23 settembre 2026 — Valutazione Google Weather e Rainbow

Utente conferma fatturazione Google in Italia e account Rainbow non ancora creato. Prezzi ufficiali e vincoli SEE verificati in docs/GOOGLE-RAINBOW-VALUTAZIONE.md. Nessuna API nuova attivata: produzione ancora v96 WeatherAPI. Non promettere temperature perfette o lavoro locale a PC spento; attività cloud non configurata. Prossimo requisito esterno: account/credenziali Rainbow e Google, da configurare nei segreti del sito, mai in chat.

## 22 settembre 2026 — Versioni 94–96 pubblicate: Community e Lente

Community: filtro Ultime 2 ore e confronto guidato previsioni/racconti. Lente: fonte e orario nel contesto iniziale, domande di seguito In tre punti e Cosa va verificato?, sempre invio manuale. Corrette etichette WeatherAPI, uso UTC in Stesso cielo, focus del pannello, contrasto dialogo e filtri mobile. Dettagli: docs/COMMUNITY-LENTE-V94.md.

Build e 70 suite attive superate; verifica locale desktop/390 px, filtro e domanda preparata senza invio. Nessuna nuova generazione OpenAI reale, nessun post di prova in produzione. Nessun nuovo abbonamento. Anteprima 4597 aggiornata. Non è una certificazione completa del sito o dei telefoni fisici.

Durante il rilascio l’utente ha chiesto di confrontare i dati con altri meteo. v96 conserva testo condizioni WeatherAPI e località abbinata; pioggia nelle vicinanze non diventa più pioggia certa nella descrizione principale/scena. Verificato online: San Benedetto correttamente abbinata (42.95, 13.883), WeatherAPI 15 °C alle 11:15, 3B Meteo previsione 22 °C alle 11. Scarto tra fonti non risolto/certificato; Roma 26,7 °C WeatherAPI contro 26,8 °C iLMeteo. Non sostituire arbitrariamente temperature. Dettagli docs/VERIFICA-DATI-METEO.md.

Pubblicazione v96 riuscita 2026-09-22T09:30:52.229717+00:00: https://scudo-meteo-community.walkerthehate.chatgpt.site . Sites runtime 58a01c708828a3306582dfc56d5a621c5494df13 e GitHub 5d36b331ab4d529cd494f8e6f91ec8dd9f669b9b condividono tree 474f0c4558fd2dd6499403e5ada57aaecc7253f3. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_8b9cac7cb6c88191b50934aa5993d470; deployment appgdep_6ab24a610de8819185ce83478245ef1b; ambiente 10, pubblico preservato. CI 35710571751 riuscita, 70 suite. Packaging Windows non avviabile: build remota. Anteprima 4597 attiva. Ramo codex/weather-scenery-20260922, PR draft #21. Successivi commit solo documentazione.

## 22 settembre 2026 — Versione 93 pubblicata: previsioni WeatherAPI e consumi

WeatherAPI attivo per /api/forecast: Oggi, Meteo, prossime ore della mappa e Lente. Cache persistente attuale cinque minuti, previsioni quindici; budget condiviso 3.000 richieste/ora e protezione a 2,4M/mese di chiamate dell’app. Non legge il consumo totale dell’account. Mappa limitata a otto luoghi visibili, sequenza interrotta al cambio vista, richieste sospese in background; confronto città caricato solo aprendolo. Nessun abbonamento aggiunto.

Dati specialistici mancanti restano null; orari locali e UTC conservati. Le funzioni secondarie storiche e specialistiche mantengono le proprie fonti Open-Meteo: non dichiarare indipendenza totale. Radar separati e invariati. Dettagli in docs/WEATHERAPI-PREVISIONI.md. Perimetro e stima V1 in docs/PRONTEZZA-V1.md: 3–5 giornate di rifiniture/collaudo più 5–7 giorni di prova, stima condizionata e non esecuzione automatica.

Pubblicazione riuscita 2026-09-22T08:57:36.739352+00:00: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Sites runtime f45a8b24fb8ee35e2abe110fc0e293f4f76916a3 e GitHub d5f179f8eed2ca3cdbd5fced5f5932b2ca698449 condividono tree df04a4ab88d936a94eeea12ef2191cd625826d91. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_3aac1b4105dc8191ae83bf36c65d03e9; deployment appgdep_6ab242b539508191b9e446869e45b237; ambiente 10, pubblico preservato. Workflow Sites apertura/push riusciti, packaging Windows non avviabile: build remota.

70 suite superate; CI 35707431725 riuscita. Verifica funzionale API reali post-attivazione: Roma HTTP 200 WeatherAPI, Europe/Rome, 7 giorni/168 ore, 24,5 °C alle 10:45; Tokyo HTTP 200 WeatherAPI, Asia/Tokyo, 7 giorni/168 ore, 25,7 °C alle 17:45; entrambe offline=false e current available/mapCurrent presente. Sono esempi di verifica, non valori da fissare nell’app. Nessuna chiave esposta. Anteprima 4597 aggiornata nel codice, senza chiave WeatherAPI reale: usa Open-Meteo; percorso pagato verificato da test e API produzione. Nessuna certificazione su telefoni fisici o carico reale.

Ramo codex/weather-scenery-20260922, PR draft #21. Successivi commit di sole note, nessun nuovo deploy richiesto.


## 22 settembre 2026 — Versione 92 pubblicata: mappa e orari più chiari

Barra del livello compatta con fonte e orario reale; etichette aggiuntive solo per località selezionata e valori recenti pertinenti; pannello Adesso, previsioni, territorio e fonte apribile. Stati vuoti compatti, un solo anello del raggio grandine. Dettagli: docs/MAPPA-LETTURA.md.

Open-Meteo ha risposto HTTP 429 (limite giornaliero) nella richiesta diagnostica diretta. Aggiunto backoff alle acquisizioni previsioni per singolo Worker, almeno 15 minuti: non ripristina la quota e non copre ogni percorso meteo. WeatherAPI e radar restano separati. Nessuna promessa al secondo.

Pubblicazione riuscita 2026-09-22T08:32:35.190924+00:00: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Sites runtime 15e4dbc4fd6b3d0cc68a65599addbcea59c6b61c e GitHub 0cacb352731c556addac62668a40fa6c2a6d4b09 condividono tree c7593d427d103279cb02900705c74993bd9c24df. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_9099012d67108191956a10a9e1c51739; deployment appgdep_6ab23cde98a4819180f872a3192cd7cc; ambiente 10, pubblico preservato. Workflow Sites: apertura e push riusciti, packaging Windows non avviabile; build remota usata.

Build e 69 suite superate; test aggiuntivo 429 nella suite cronologia riuscito. CI 35705061317 riuscita. Anteprima 4597 verificata desktop e 390 px, radar e ricerca Tokyo, cartografia caricata. Nessuna nuova verifica browser produzione per completare il rilascio. Ramo codex/weather-scenery-20260922 e PR draft #21. Commit successivi di sole note, nessun nuovo deploy necessario.


## 22 settembre 2026 — Versione 91 pubblicata: interfaccia più leggibile

Restyling senza nuovi abbonamenti: Oggi a due colonne sul desktop, navigazione superiore sulle pagine principali e dock mobile, tipografia e controlli uniformi, dettagli della variazione meteo apribili, Community a due colonne di pulsanti sul telefono. Fonti e orari restano visibili. Home senza hash evita il pre-caricamento MapLibre (937395 byte non compressi); nessun benchmark di velocità dichiarato. Dettagli in docs/DESIGN-FINITURE.md.

Pubblicazione riuscita 2026-09-22T08:07:40.245148Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#home . Sites runtime 9d591516076e48096f1bc035e4c86e1a95332756 e GitHub e9f371ab22719476c5604c62c2d6d8cb35a2e558 condividono tree a99980a3a8cbec83d4867ece3ffbf897fbeae8ef. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_38f81f52c45c819189880d560d362ab3; deployment appgdep_6ab236f556d88191ae080a243682d8fb; ambiente 10, audience pubblica preservata. Apertura e push con workflow Sites riusciti; packaging locale non avviabile su Windows, usata build remota.

Build e 69 suite superate, CI 35702914439 riuscita. Ritocchi finali CSS ricompilati; anteprima 4597 verificata desktop, 390 e 320 px, dettaglio cronologia apribile, navigazione e radar con quadro 09:55. Nessuna certificazione WCAG, di prestazioni o su dispositivo fisico. Open-Meteo rimane indisponibile nel controllo locale: il restyling non risolve il problema dei dati, che restano marcati come precedenti. Conferma pubblicazione tramite stato Sites; nessuna nuova verifica browser del sito pubblico richiesta per questo rilascio.

Ramo codex/weather-scenery-20260922, PR draft #21. I successivi commit registrano solo queste note e non richiedono nuovo deploy.

## 22 settembre 2026 — Versione 90 pubblicata: radar grandine gratuito e tema automatico

Radar-DPC POH Italia integrato gratuitamente, con probabilità, fonte, licenza e orario reale del quadro; aggiornamento nominale 5 minuti, copertura non uniforme e ritardo possibile. Non è conferma a terra né radar mondiale. Tema automatico giorno/notte per cartografia e pannelli, opzioni manuali in Strumenti, indice dei sei livelli e più spazio radar sul telefono.

Sites runtime 4ad7ed3100104ed8ddde48c7b9547a5551aabf0b e GitHub f1c0e1a320cc220ef6825df9c7902d0714d404dc condividono tree a85eb03d441f58ba18182e3b80b7d2b017d98cc7. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_53b0d1a594b081918f531d064fd5a259; deployment appgdep_6ab2316aede08191abc10fc7a3771a09 riuscito 2026-09-22T07:43:42.483704Z, ambiente revisione 10. Build remota: il nuovo workflow Sites locale è stato tentato, ma non avvia il comando di preparazione su questo host Windows.

Build e 69 suite passate nella revisione completa; test radar e build ripetuti dopo la correzione, CI finale 35700696862 riuscita. v89 pubblicata ma endpoint radar rispondeva 503: v90 cambia redirect da error a manual, rifiutando comunque tutte le risposte non 2xx, e aggiunge diagnostica senza URL firmati. Endpoint pubblico verificato 200 image/tiff, 322324 byte, quadro 09:35 CEST. Anteprima 4597 e verifiche desktop, 390 e 320 px; tema chiaro/scuro e ripristino Automatico. Nessuna certificazione meteorologica o su dispositivi fisici. Limite Open-Meteo precedente ancora presente, indipendente dal radar.

Continuare ramo codex/weather-scenery-20260922 e PR draft #21. Dettagli in docs/RADAR-GRANDINE-TEMA.md. Successivi commit di note non richiedono un nuovo deploy. Nessun abbonamento aggiunto.

## 22 settembre 2026 — Radar grandine gratuito e mappa giorno/notte, revisione pronta

Richiesta più recente: radar grandine gratuito (supera la breve preferenza a pagamento). Collegato Radar-DPC POH Italia, senza nuovo abbonamento, separato dalle osservazioni della community. Tema automatico cartografia e pannelli, con opzioni manuali negli Strumenti e indice dei livelli. Ultima pubblicazione confermata 88; attendere nota di esito. Dettagli e limiti in docs/RADAR-GRANDINE-TEMA.md.

## 22 settembre 2026 — Versione 88 pubblicata, MapTiler Flex attivo

Cartografia personalizzata MeteoSocial · Atlante chiaro attiva, con pannello meteo affiancato e ripiego automatico alla base alternativa. Piano Flex e fattura Paid verificati; limite extra 0 USD autorizzato e salvato. Dettagli in docs/MAPPA-MAPTILER.md.

Sites runtime db97019a0eeb776b902b09f8aa84eadef25dcedb e GitHub f3762a960817cfb4830acb85433540f63950c991 condividono tree bef5842797860f0e6370c2e82a682915dde235af. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_7dffeaf1dd348191a4400e346b436969; deployment appgdep_6ab22556bac88191907c173112f78e41 riuscito 2026-09-22T06:52:10.525530Z, ambiente revisione 10. Build remota per assenza degli script di packaging Sites.

Build e 68 suite passate; CI 35696626602 riuscita. Controlli visivi desktop, 390px e 320px; logo mobile corretto. Mappa personalizzata verificata sul sito pubblico, WeatherAPI locale 13,6 °C con dato 08:45. Resta il limite noto Open-Meteo: aggiornamento indisponibile e città precedenti marcate Da aggiornare. Nessuna promessa di dati meteo ogni secondo. Anteprima cartografica locale 4596 senza segreto WeatherAPI. Successivi commit documentano la pubblicazione e non richiedono nuovo deploy.

## 22 settembre 2026 — Versione 87 pubblicata, WeatherAPI in primo piano

WeatherAPI Starter è attivo tramite segreto server. Il meteo della località selezionata usa coordinate, senza lista limitata di città: Roma e Tokyo sono solo test di verifica. La testata locale mostra WeatherAPI; previsioni, colori e radar conservano fonti separate.

Pubblicazione riuscita 2026-09-22T06:23:51.303629Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Sites runtime d56acb31f704c213954f2c00e6e63791e7ec1603 e GitHub 86e667a13144549c22d0493e089afd2cf2cb7f37 condividono tree a7ee5b6dfb555aa5103cd5a568dac84b150be083. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_909fac6362f88191b445da1d8430f13a; deployment appgdep_6ab21ebf30288191b627c88e2cba476f; ambiente revisione 8.

Build riuscita e 4 suite mirate dopo la priorità della testata; CI completa 35694460877 riuscita. Prima della modifica finale erano passate tutte le 67 suite. Il segreto è solo in produzione; anteprima locale allineata nel codice, non contiene la chiave pagata. Limite noto Open-Meteo server e ripiego browser descritti sotto. Non dichiarare dati nuovi ogni secondo. Successivi commit aggiornano solo queste note e non richiedono nuovo deploy.

## 22 settembre 2026 — WeatherAPI Starter attivo, versione 86 pubblicata

Account WeatherAPI verificato: Starter, 7 USD fatturati. WEATHERAPI_KEY salvata come segreto runtime Sites (revisione 8); nessun valore in Git o nel browser dell’app. Endpoint pubblico provato per Roma e Tokyo: status available, timestamp e metriche reali. Pannello WeatherAPI verificato nel browser pubblico.

Sites runtime 9a3a1cf9b3033c8e2161e0ac1c31688a08e9137b e GitHub 3cccb047173e2555bdc66f03261f5861a873f3c1 condividono tree c2b9a2566c96d2c9c3b2e7ec5b30e08e48c8756b. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_69a51dbb7bd48191adbbf0d7794763f3; attivazione riuscita 2026-09-22T06:17:55.628135Z, deployment appgdep_6ab21d7c22f48191b458df177cb89d56. Build e 67 suite superate; CI 35693930681 riuscita. Build remota Sites perché gli script di packaging del plugin non sono disponibili.

Limite ancora osservato: il recupero server dei comuni Open-Meteo restituisce 503; il ripiego nel browser mostra campioni recenti (08:15 verificato), ma non tutti i punti ricevono dati. Il pannello previsionale conserva una copia precedente esplicita se la fonte non risponde. Non dichiarare risolti i problemi upstream o tutta la mappa alimentata da WeatherAPI. Revisione successiva pronta per dare priorità al meteo WeatherAPI nella testata locale. Vedi docs/MAPPA-DATI-RECENTI.md.

## 22 settembre 2026 — Mappa affiancata e freschezza, revisione pronta

Corretto il caso riprodotto del catalogo italiano vecchio che prevaleva sul campione recente. La vista chiede al massimo 24 comuni visibili, con cache condivisa, invece del catalogo completo da 500. Orari mancanti/futuri o più vecchi di 30 minuti non alimentano colori/riepiloghi correnti. Mappa e pannello affiancati sul desktop, due aree visibili sul telefono. Orologio, validità del modello ed età sono separati. Build e 66 suite superate. Dettagli: docs/MAPPA-DATI-RECENTI.md. Ultima pubblicazione confermata v85; attendere nota di esito.

## 22 settembre 2026 — Versione 85 pubblicata: Atlante locale

Sites conferma pubblicazione riuscita il 2026-09-22T05:41:41.288303Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Nuova composizione inchiostro/lime, meteo locale sempre visibile, dettagli progressivi con prossimo cambio e ore, menu Strumenti e selettore fenomeni mobile. Vedi docs/MAPPA-ATLANTE-LOCALE.md.

Runtime Sites 1537c33d918bea43c975347eb43f6316193ef2df e GitHub d6ed5aa42e42d928a1c07b911192b2788de343ff condividono albero ec8ddc4704297611e7a93c68987e42c862991b9a. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_927c5247657881919721c9db37ad7657; deployment appgdep_6ab214b6cf648191b677e1e71939aca0. Build e 65 suite attive superate; GitHub Actions 35691503317 riuscita. Browser locale desktop, 390 e 320 px; dettagli, orari e strumenti verificati. Anteprima 4595 allineata. Nessun test su dispositivo fisico.

Continuare ramo codex/weather-scenery-20260922, PR draft #21. Le note successive sono solo documentazione, sincronizzate in entrambi i repository senza nuovo deploy. Il contatore al secondo resta distinto dalla frequenza effettiva dei dati meteo. Pubblicazione con build remota: gli script locali del plugin Sites non sono disponibili in questa sessione.

## 22 settembre 2026 — Atlante locale, revisione pronta

Meteo della località sempre visibile, prossimo cambio e dettaglio orario nella scheda apribile, menu Strumenti e nuova composizione inchiostro/lime. Sei fenomeni in un selettore leggibile sul telefono. Fonte, fuso e stati dei dati restano espliciti. Build e 65 suite attive superate. Dettagli: docs/MAPPA-ATLANTE-LOCALE.md. Ultima pubblicazione confermata: v84; attendere la nota di esito del rilascio.

## 22 settembre 2026 — Versione 84 pubblicata: mappa chiara

Sites conferma pubblicazione riuscita il 2026-09-22T05:16:10.940140Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Sei fenomeni leggibili, Fonti e orari, contatore del controllo al secondo e ritorno Ultimo nel radar. Nessuna misura meteo al secondo dichiarata.

Runtime Sites 2751529c47eced84691f14becbd21f0a6693ed84 e GitHub 432dbf8d5423bbf59651e320149cd48f8c0153fd condividono albero 83b7b90dc811ee85ada2c1974f21d19d12c4d25a. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_c8bd8a537c30819188e1804ed763bbf3; deployment appgdep_6ab20ebc75888191a27aeedf369907ef. Build e 64 suite superate; GitHub Actions 35689787051 riuscita. Browser desktop, 390 e 320 px, selezione fenomeni, pannello fonti e radar storico verso ultimo quadro. Anteprima locale 4595 allineata; nessun test su telefono fisico.

Continuare sul ramo codex/weather-scenery-20260922, PR draft #21. Dettagli e idee successive: docs/MAPPA-CHIARA.md. Queste note sono solo documentazione e vengono sincronizzate senza ulteriore deploy.

## 22 settembre 2026 — Mappa chiara, rilascio in preparazione

Contatore del controllo al secondo, Fonti e orari, sei fenomeni leggibili e comando Ultimo per il radar. Frequenze reali delle fonti preservate: nessuna misura meteo al secondo. Build e 64 suite superate. Dettagli: docs/MAPPA-CHIARA.md. Ultima versione pubblicata confermata: 83; attendere la nota di esito per il nuovo rilascio.

## 22 settembre 2026 — Versione 83 pubblicata: mappa e neve

Pubblicazione riuscita il 2026-09-22T03:25:20Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi . Controllo fonti ogni minuto, orari reali distinti, nuovo livello Neve, radar più leggero e contesto IA ampliato. Dettagli: docs/MAPPA-NEVE-MINUTO.md.

Runtime Sites 64df9eb7918a59bb6f82fb810351afaf110e8020 e GitHub 68fc41a44998da1baaffc822fce550ed764b3ba4 condividono albero 01b22a6316f096a0521cfee00fa5ee3183042a63. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_068ac753231c81918c4a43dbbf4d07ae; deployment appgdep_6ab1f50cfe5081918c6788694dfd7aa3. Build, 63 suite e GitHub Actions 35683047168 superati. Verifica pubblica: Neve selezionabile, orari controllo 05:25 / modello 05:15, radar iniziale ultimo quadro 05:20. Anteprima locale 4595 allineata.

Continuare PR draft #21 sul ramo codex/weather-scenery-20260922, non main. Questa nota successiva viene sincronizzata senza un ulteriore deploy del runtime.

## 22 settembre 2026 — Mappa e neve pronte per la pubblicazione

Controllo fonti ogni minuto, orari distinti, radar senza ricreare immagini invariate, livello Neve e contesto Lente IA ampliato. Build e 63 suite superate. Dettagli e limiti: docs/MAPPA-NEVE-MINUTO.md. Pubblicazione in corso; la sezione precedente descrive la v82.

# MeteoSocial — riprendi da qui

## 22 settembre 2026 — Versione 82 pubblicata: Il prossimo cambio

Sites riuscito il 2026-09-22T02:59:36.833804Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#home . Riepilogo delle prossime sei fasce, fonte e motivazione; meteo vecchio/offline non usato per annunci di arrivo. Scena mobile più compatta, moduli secondari fuori dal download iniziale offline, tutte le suite attive abilitate in GitHub Actions.

Runtime Sites 32ce2360de36cd1f7550a2cdc5dcc1ad9413c803; albero b8b798d979d896b2223683022cf56b3ac841cd3c identico al commit GitHub 405d9bd7b2542e81e054d1d2166538d4f1c94ce5. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_76cee195503081919e3635727b6453e5; deployment appgdep_6ab1ef0629748191bd56a2e61bc44bea.

Build e 61 suite attive superate, zero errori; cinque contratti storici ritirati. Controllo mobile 390 px senza overflow, apertura mappa dalla nuova scheda e verifica sito pubblico con riepilogo del vento. Nessun errore console nel controllo finale. Anteprima 4595 allineata. Il browser può inizialmente mostrare l’ultima copia offline, sostituita al ritorno dei dati.

Continuare dal ramo GitHub codex/weather-scenery-20260922, PR draft #21 sopra #20, non da main. Nessuna nuova PR sovrapposta. Queste note successive sono solo documentazione e vengono salvate in entrambi i repository senza un altro deploy. Criteri, limiti e novità future non implementate: docs/PROSSIMO-CAMBIO.md. La pulizia completa degli stili/moduli e la semplificazione della mappa restano da fare.


## 22 settembre 2026 — Il prossimo cambio: rilascio pronto

Oggi presenta sei fasce orarie e un riepilogo del primo cambiamento previsto, con fonte, motivazione e limiti espliciti. Nessuna nuova richiesta dati o dipendenza. La scena mobile è più compatta; la cache iniziale rinvia i moduli secondari; GitHub Actions esegue tutte le suite attive. Dettagli, criteri e prossime tappe in docs/PROSSIMO-CAMBIO.md.

Sorgente sul ramo locale codex/sites-release-20260922; GitHub continua sul ramo codex/weather-scenery-20260922 e PR #21, senza ulteriori PR sovrapposte. Pubblicazione Sites e SHA da confermare nelle note successive. Usare il ramo aggiornato, non main GitHub. Anteprima locale: http://127.0.0.1:4595/#home .



## 22 settembre 2026 — Versione 81 pubblicata: stelle e nuvole naturali

Sites riuscito il 2026-09-22T02:39:46.201214Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#home . Stelle irregolari con tre punti scintillanti, nuvole vettoriali con sfumature e ombre. Entrambe le sezioni Oggi/Meteo seguono orario locale e codici meteo; verificati notte, pioggia diurna senza stelle e nuvole calde al tramonto. Sole/luna nascosti nel maltempo, riflessi attenuati. Nessun video o nuovo asset scaricato, circa 6 KB gzip per i sorgenti scena.

Runtime afccbbfe41faa95028f2543479714893bfe90a45; albero e8d70d303ca910c5adcf52255508caeef78f73a0 identico al commit GitHub 06342b72dbc46ca764f372eeca12c75baa5e6ffe. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_de57ec53382481919e5332427b1083c7; deployment appgdep_6ab1ea31a94881918adfabdc273ab9c3.

Ramo aggiornato codex/weather-scenery-20260922, PR draft https://github.com/walkerfumaquestawinston/meteosocial/pull/21 sopra PR #20. Anteprima 4595 allineata. Build e quattro suite mirate superate. Fase solare ogni 30 secondi, meteo ogni 15 minuti mentre visibile e al ritorno/cambio città. Le note successive sono solo documentazione e vengono salvate su entrambi i repository senza ulteriore deploy. Dettagli in docs/METEO-ANIMATO.md.


## 22 settembre 2026 — Versione 80 pubblicata: Costa di luce anche in Oggi

Pubblicazione riuscita il 2026-09-22T02:30:41.772715Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#home . L’ingresso Oggi mostra lo stesso paesaggio animato di Meteo con firma visiva MeteoSocial. Tolti l’immagine decorativa nascosta e il vecchio backdrop blur. La scena si rinnova con i dati/città; gli stati di caricamento ed errore restano espliciti.

Runtime 96d6b75b5ccd068a77be0812b28fc80556d05bb2; albero d575ef68ff0ca6c07f1208075c2b4be87b8cfa56 identico al commit GitHub 94eb8ad56e897d3630629e69cad1d70783804150. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_c9b136dc509c81919422a7603d04630d; deployment appgdep_6ab1e8133e74819186e7cbaada721d0c.

Continuare dal ramo codex/weather-scenery-20260922 e PR draft https://github.com/walkerfumaquestawinston/meteosocial/pull/21, sopra PR #20. Anteprima 4595 allineata. Build e quattro suite mirate superate; Home controllata su desktop e a 390px, una sola scena, animazione attiva e nessun overflow. Note solo documentali salvate su entrambi i repository senza ulteriore deploy. Dettagli: docs/METEO-ANIMATO.md.


## 22 settembre 2026 — Versione 79 pubblicata: Costa di luce

Sites pubblicato con successo il 2026-09-22T02:23:20.274151Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#tendenze . Ora il movimento è più visibile: nuvole, acqua e riflessi misurati in movimento nel browser; costa e faro originali con spazio dedicato su mobile. Nessun nuovo download multimediale o dipendenza, circa 4082 byte gzip per i due sorgenti della scena. Non è una misura FPS/batteria.

Runtime eb0b9d59581d5fcbb6f809ed8ff0d1df6c508455, albero 9736c59683803a4057c8e62e8d0cde654c7148a5 identico al commit GitHub da9a5f84d2c3a34e1bd563f82022997494b0b4b6. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_fb8f1ccd6bdc8191b358e6ada0317e3e; deployment appgdep_6ab1e64b60188191812e129d49629d4e.

Continuare da codex/weather-scenery-20260922, PR https://github.com/walkerfumaquestawinston/meteosocial/pull/21 aggiornata (draft sopra PR #20). Anteprima locale 4595 allineata. Build riuscita, tre suite mirate superate, nessun overflow a 390 px o errore console nel controllo finale. Dettagli in docs/METEO-ANIMATO.md. Queste note solo documentali sono salvate su Sites e GitHub senza ulteriore deploy.


## 22 settembre 2026 — Versione 78 pubblicata: Meteo animato

Pubblicazione Sites riuscita il 2026-09-22T02:14:02.111366Z: https://scudo-meteo-community.walkerthehate.chatgpt.site/#tendenze

La categoria Meteo ha un paesaggio animato che segue orario locale e condizioni del provider: sole, luna/stelle, nuvole, pioggia, neve, foschia e cielo temporalesco. Movimento ridotto rispettato; nessun flash. Fonte/orario e avvisi offline restano visibili. Dettagli: docs/METEO-ANIMATO.md.

Runtime Sites: faed6f740a6c7b7e1adf977311b121cf00cf7e08; stesso albero 1d6bdacb67453c0b4634a66681ac3b8846c6268d del commit GitHub e088dcd29af32a998e0002af3b6f7bc3b0c902d1. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_23dee68984748191ab53e319f665a2c6; deployment appgdep_6ab1e41e56f48191bc155935ba94948b.

Continuare dal ramo codex/weather-scenery-20260922, PR draft https://github.com/walkerfumaquestawinston/meteosocial/pull/21 sopra PR #20, non da main. Anteprima locale allineata su http://127.0.0.1:4595/#tendenze. Build e cinque suite mirate superate, nessun errore console nel controllo finale. Queste note successive sono solo documentazione, salvate nei due repository senza nuovo deploy. Pubblico e segreti invariati.


## 22 settembre 2026 — Versione 77 pubblicata: Cielo vivo

Sites conferma pubblicazione riuscita il 2026-09-22T02:01:43.998650Z: https://scudo-meteo-community.walkerthehate.chatgpt.site

Versione: appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_5fd56b3219008191a9e518d83516afb5. Deployment: appgdep_6ab1e14060b48191a6eda8f56161a131. Runtime Sites: 20c53b8357e4485eb8edb24c30fd080e816c029c. Albero 70895d94fb16d177de6a67a8d433d0a1e67073c1 identico al commit GitHub 1c07535b88b4d29e014b7c85919eab74841cf2de.

GitHub: https://github.com/walkerfumaquestawinston/meteosocial/pull/20, draft sul ramo codex/calendar-design-20260922, sopra PR #19. Per continuare usare questo ramo, non main. Anteprima locale allineata: http://127.0.0.1:4595/#home. Calendario automatico, nuovo layout e controlli documentati in docs/DESIGN-CIELO-VIVO.md. Le note successive al runtime sono solo documentazione e vengono salvate su entrambi i repository senza ulteriore pubblicazione.

Esito verificato: 58 suite attive superate; 5 contratti storici ritirati e identificati. Compilazione completa riuscita; controllo finale calendario/palette/avvio superato dopo correzione della transizione. Nessuna modifica a pubblico, segreti o dati utente Sites. Questa conferma supera le note precedenti di pubblicazione in corso.


## 22 settembre 2026 — Cielo vivo e calendario automatico

Nuova revisione pronta: Oggi più compatto, meteo in primo piano, navigazione uniforme e osservatorio mappa apribile. Stagioni astronomiche automatiche con effemeridi USNO 2026–2040, festività italiane secondo la data locale, Pasqua/Pasquetta calcolate. Il calendario aggiorna accenti e dettagli entro 30 secondi, insieme ai temi alba/giorno/tramonto/notte. Corretta anche la transizione sfondo/testo. Dettagli e limiti: docs/DESIGN-CIELO-VIVO.md.

Compilazione completa riuscita. 58 suite attive superate, zero fallimenti; 5 contratti storici esplicitamente ritirati. 240 coppie di colori testo/sfondo superano 4,5:1 (minimo 5,44). Verificati Oggi mobile, ricerca e comandi mappa, anteprime dimostrative Natale e autunno/alba. Non è una certificazione di assenza di ogni bug.

Ramo GitHub previsto: codex/calendar-design-20260922, sopra codex/readability-20260922. Per riprendere usare il ramo più recente, non main. Pubblicazione da confermare nelle note di esito che verranno aggiunte a rilascio riuscito. Anteprima: http://127.0.0.1:4595/#home. Le note precedenti sono storiche.


## 22 settembre 2026 — Versione 76 pubblicata: leggibilità e chiarezza

Pubblicazione Sites confermata riuscita: 2026-09-22T00:47:06.483951+00:00. URL: https://scudo-meteo-community.walkerthehate.chatgpt.site

Versione 76: appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_1d60aff828f88191abcde021e1fbfd48. Deployment: appgdep_6ab1cf9c73f881919a646ed4b65b33ac. Runtime Sites: 2ed938fea7e23e75d0c214a7c8ca131d079081c6. Albero: 49714f6f6ca429d99ebc602c28ba9384a9f38d67, identico al commit GitHub 4c3529645f45c47d8188fadc373a869b21fc6dd9.

GitHub: https://github.com/walkerfumaquestawinston/meteosocial/pull/19, ramo codex/readability-20260922, draft sopra PR #18. Le PR precedenti non sono state unite a main; per proseguire il lavoro usare questo ramo aggiornato. Anteprima live locale allineata: http://127.0.0.1:4595/#home. Il collegamento PWA ?view=giornata mantiene aperto il piano anche dopo il caricamento del profilo; verificato nel browser. Queste note successive sono solo documentazione e non richiedono una nuova versione runtime.

La versione 75 aveva pubblicato le correzioni di contrasto e ingresso; la 76 include anche il collegamento diretto alla giornata. Tutte le modifiche sono salvate online. Nessun servizio di sincronizzazione in background installato. Pubblico e segreti Sites invariati. Le note precedenti "in corso" sono superate da questo esito.


## 22 settembre 2026 — Leggibilità e ingresso semplificato

Revisione successiva alla versione 74, su richiesta dell'utente dopo riscontro di testi illeggibili e sovraccarico visivo. L'ingresso senza hash apre Oggi. Tre azioni esplicite: Previsioni, Mappa e radar, Segnala il meteo. Ricerca città diretta; barra inferiore con Segnala. Funzioni aggiuntive e pianificazione restano in sezioni apribili. Lente nella mappa è apribile su richiesta. Dati, fonti e bollettini ufficiali restano disponibili.

Corrette coppie testo/sfondo in Oggi, Meteo, community e controlli mappa nelle fasi solari. I pannelli specialistici storici conservano superfici scure con testo chiaro. Testi e superfici semantiche delle quattro palette superano 4,5:1 (minimi: giorno 4,90; notte 8,18; alba 4,83; tramonto 4,57). Controllo DOM e visivo di giorno/notte su anteprima integrata, desktop e 390 px; corrette anche etichette tagliate. Il controllo DOM è un audit mirato, non una certificazione completa: gradienti e illustrazioni sono verificati visivamente. Nessuna segnalazione di prova pubblicata.

Compilazione completa riuscita con fallback WASM. Superati test-atmosphere, test-feature-routes, test-solar-live-map, test-mappa, test-day-plan e test-community-context. Anteprima live: http://127.0.0.1:4595/. Pubblicazione di questa revisione da confermare tramite stato Sites; numero versione e link GitHub saranno registrati dopo il rilascio.

Preferenza permanente: per ogni aggiornamento completato allineare anteprima locale, sorgente GitHub e pubblicazione Sites. Non è una sincronizzazione automatica in background e non include preferenze del browser o bozze private. Prima di nuovi interventi recuperare sempre la sorgente più recente dello stesso Site. Le note delle precedenti revisioni restano storiche.


## 22 settembre 2026 — Versione 74 pubblicata su Sites

Pubblicazione confermata riuscita il 22 settembre 2026 alle 00:23:28 UTC (02:23 in Italia): https://scudo-meteo-community.walkerthehate.chatgpt.site

Include Segnale, osservatorio grandine, tema automatico alba/giorno/tramonto/notte, precaricamento e aggiornamento progressivo della mappa. Compilazione remota Sites riuscita; nessun cambiamento al pubblico del sito o ai segreti. La versione online è utilizzabile dagli altri PC senza avviare il server locale.

Runtime: commit cbf46a5412ed49cd587d2406d0d191fccf7e2907, albero 6c56a5b5064733f032e10da330e72544fe2c28df. Versione appgprj_6aa1e8ab06f88191ab364344053e48d9~appgver_45332c1ce25881918e56a6df9ad17e8e, deployment appgdep_6ab1ca0f7c948191b9b30dad9c2a36a8. Sorgente riconciliata con e74cf310242672f59677a37a3a31ad0a739339f8, verificata identica alla base GitHub precedente alle modifiche; nessuna sovrascrittura forzata. Queste note successive non cambiano il runtime pubblicato.

Il workflow locale Sites resta incompatibile con le pipe di questa sessione Windows. Il rilascio ha usato il salvataggio sorgente verificato e il fallback di compilazione remota supportato dai tool Sites. Credenziali temporanee solo in memoria/stdin e ambiente del comando, mai salvate. Per gli aggiornamenti successivi recuperare la sorgente Sites attuale prima di modificare. I precedenti avvisi “non pubblicato” sono storici e superati da questa nota.


## 22 settembre 2026 — Ciclo solare e mappa più pronta

Tema automatico attivo per la località scelta: notte, alba (30 minuti prima/dopo), giorno e tramonto (45 minuti prima/dopo). Orari solari e fuso del provider; in assenza di orari validi, flag giorno/notte soltanto se recente, poi fascia oraria approssimata 07–19. Controllo ogni 30 secondi e al ritorno alla scheda. La nuova palette si applica a Oggi, Meteo, intestazione e superfici della mappa; colori dei fenomeni separati.

Componenti cartografici precaricati dopo l'avvio; meteo selezionato caricato in parallelo alle altre fonti e dati della località disponibili subito quando già presenti. Evitata la ricostruzione della mappa alla risposta tardiva del profilo. Aggiornamento visibile ogni minuto, cache meteo 2 minuti e osservazioni generali 1 minuto; pannello locale entro 2 minuti. Richieste duplicate condivise e risposte vecchie dopo svuotamento cache non ripristinate. Radar con tempi propri del provider. Nessuna garanzia di latenza zero o dati in tempo reale oltre la frequenza delle fonti.

Build Windows riuscita. Superati test-solar-live-map, test-mappa (58 controlli), test-atlas-radar, test-map-weather-source, test-map-field e test-hail-desk (18 controlli). Browser: Home notturna leggibile, navigazione Mappa, cartografia e radar visibili. Alba/tramonto e altri fusi verificati nei test deterministici, non su dispositivi fisici. Anteprima live: http://127.0.0.1:4595/#home. Sites ancora non pubblicato.


## 22 settembre 2026 — Compilazione Windows e anteprima live risolte

Il compilatore nativo restituisce EPERM avviando il processo con pipe in questa sessione. `build.mjs` usa ora esbuild-wasm 0.28.2 nello stesso processo soltanto in caso di EPERM (oppure METEOSOCIAL_COMPILER=wasm). Non vengono modificati permessi Windows o protezioni. La verifica sintattica dei moduli usa output ereditato. Dipendenza bloccata nel lockfile.

Build completa riuscita e 16 suite CI eseguite localmente con uscita 0. I mock di test-lente stampano messaggi di errore del recupero DPC pur completando tutti i 76 controlli. Anteprima dell'app completa avviata con backend locale, dati e profilo separati; Home con previsioni recuperate, navigazione disponibile. Non è una verifica completa dei flussi su dispositivo fisico; IA locale non configurata.

Avvio: `node tools/live-preview.mjs`, poi http://127.0.0.1:4595/#home. Le modifiche ai moduli frontend, CSS/HTML e server ricompilano l'app e ricaricano il browser dopo una build riuscita. Verificata una ricompilazione da modifica CSS. L'anteprima funziona finché il processo resta aperto. I cambi a dipendenze, strumenti di avvio o risorse grafiche richiedono riavvio.

Sites NON aggiornato: il workflow ufficiale di preparazione sorgenti resta da sbloccare/verificare; l'ultima versione verificata online è 73. Il precedente blocco della compilazione dell'app è risolto, non confonderlo con pubblicazione riuscita.


## 22 settembre 2026 — Segnale: nuova direzione visiva, non pubblicata

Su richiesta dell'utente, nuova identità avorio/inchiostro/arancio per Oggi e Meteo, titoli editoriali e barra inferiore a cinque voci con Mappa centrale. Profilo resta accessibile in alto. Ramo `codex/design-segnale-20260922`, derivato dal lavoro grandine della PR #15. Questa scelta aggiorna la precedente preferenza per il tema scuro uniforme.

Dettagli e limiti in `docs/DESIGN-SEGNALE.md`. Anteprima dei moduli sorgente con dati di esempio verificata a desktop, 390 e 320 px. Compilazione completa ancora bloccata da `spawn EPERM` di esbuild su Windows; nessuna pubblicazione. Sites verificato alla versione 73. Completare build, CI e verifica integrata prima del rilascio.


## 22 settembre 2026 — Osservatorio grandine, sorgente in preparazione

Revisione locale del pannello grandine: finestre 15/30/60/120 minuti, esclusione opzionale dei fenomeni cessati, ordinamento per distanza o recenza, selezione condivisa tra mappa/conteggio/elenco, stato di aggiornamento e apertura del radar pioggia. Le richieste per coordinate appartenenti alla stessa cella di 0,01 gradi vengono riutilizzate; il centro esatto dei filtri viene comunque aggiornato.

Controlli: 18 verifiche pure in test-hail-desk.mjs e sintassi dei moduli modificati; prova browser su harness isolato con tre osservazioni fittizie: finestra 15 minuti, esclusione cessate, corrispondenza marker/elenco, callback radar. Harness fuori dal prodotto. Non verificato il layout completo dell'app o dispositivi fisici.

NON PUBBLICATA: compilazione completa impedita da spawn EPERM di esbuild nell'ambiente Windows corrente. Ultima versione pubblica resta 73. Prima di pubblicare completare installazione, build, test-map-field, test-hail-desk, suite CI e verifica della mappa completa. Non sostituire il sito con la pagina di prova. Nessuna nuova fonte radar grandine, probabilità o previsione d'impatto implementata. Dettagli in docs/HAIL-OBSERVATORY.md.


## 21 settembre 2026 — Cielo, revisione del design

Pubblicata su Sites versione 73 il 21 settembre 2026 alle 14:31 UTC: https://scudo-meteo-community.walkerthehate.chatgpt.site/. Runtime Sites 57be5b203b1cc088d4f28a36ba4c249bdec5bd83, albero c4909fc8be2bfce939bae8241dd25f9d4e64bad9. GitHub PR #14 integrata in main (d718ba54443c4e4f4b469e52eea73a58eabfbc87), Check MeteoSocial 35612426493 e anteprima Netlify superati. Nuova identità inchiostro/lime, community con feed in primo piano, Home e Lente con illustrazione originale, previsioni e navigazione coordinate. Build e 15 suite superate; browser desktop/390 px, commenti, navigazione e testo grande. Nessuna prova su telefoni fisici. Queste note successive non modificano il runtime. Vedere docs/CIELO-DESIGN.md per riferimenti, scelte e limiti.


Versione 72 pubblicata e PR #13 integrata — Ripari e fulmini: leggere il primo blocco di PROJECT_STATUS.md e docs/HAIL-SHELTERS-LIGHTNING.md per stato, verifica e limiti. Le note versione 71 sotto sono storiche.

Versione 71 pubblicata e PR #12 integrata: **La piazza del cielo**. La revisione corrente comprende community con post condivisi con la mappa, conversazioni e Stesso cielo. Leggere il primo blocco di PROJECT_STATUS.md per lo stato effettivo della pubblicazione; la nota versione 70 sotto è storica.

Versione 70 pubblicata e PR #11 integrata: **Ora per ora** nella mappa, con finestra di pioggia e schede IA contestuali. Il primo blocco PROJECT_STATUS.md riporta commit, pubblicazione e controlli. Le 15 suite pertinenti alla revisione passano; i dati sulla suite completa qui sotto si riferiscono al rilascio precedente.

## Base attuale

Il ramo main di GitHub contiene il lavoro condiviso. Sites ospita il sito ufficiale: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi.

Leggere PROJECT_STATUS.md per lo stato della pubblicazione e docs/CLAUDE_HANDOFF.md per i file modificati. Questa sintesi sostituisce il vecchio riepilogo che indicava ancora la versione 64: lo storico completo resta consultabile nella cronologia Git.

## Riprendere su un altro computer

1. Leggere AGENTS.md e PROJECT_VISION.md; le nuove richieste del proprietario hanno precedenza sulla visione storica.
2. Recuperare main aggiornato e la sorgente Sites corrente con il connettore dello stesso account. Confrontare prima le eventuali modifiche locali, senza force push né cancellazioni.
3. Usare Node 24 con node:sqlite e pnpm 11.19.0. Eseguire pnpm install --frozen-lockfile, poi node tools/resume.mjs --check e node build.mjs.
4. Eseguire node tools/run-tests.mjs. Sono passate 52 suite; il runner classifica separatamente 6 suite che citano moduli ritirati. La classificazione è euristica, non equivale a test superati.
5. node tools/resume.mjs avvia l'anteprima con profilo di prova e database separato. Le chiavi reali restano nei segreti Sites.

## Vincoli da conservare

- dist contiene anche sorgenti: non cancellare questa cartella. Solo dist/app e dist/server sono output ignorati da Git.
- build.mjs incorpora dist/citta-mondo.js nel Worker come WORLD_CITIES. Non rimuovere questa trasformazione.
- La mappa principale è #mappa-eventi. #mappa-classica e il vecchio alias restano disponibili.
- Il radar è osservato, a copertura variabile; il modello temporali non è un rilevatore di fulmini. Grandine community non significa allerta ufficiale.
- Lente usa coordinate solo nel backend meteo: non le invia a OpenAI. Nessun autore o media nella richiesta della mappa; massimo tre scambi della stessa località.
- Nessun nuovo servizio push, nessuna previsione affidabile di arrivo grandine o riattivazione automatica di H6: le dipendenze delle fonti osservate restano aperte.
- Non esiste sincronizzazione automatica delle cartelle locali o dei database di produzione. Salvare codice e note su GitHub e sorgente Sites al termine del lavoro autorizzato.
