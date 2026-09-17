# MeteoSocial — La mia giornata

Ripresa del 12 settembre 2026 dalla sorgente online 16, senza ricreare il prototipo precedente.

- Home Oggi: orari di uscita e rientro modificabili, temperatura, probabilità di pioggia e vento per entrambi, con località, data e fonte.
- Gli orari validati persistono solo nel browser; blocco dello storage gestito con messaggio esplicito. Nessuna nuova API, autorizzazione, notifica o sincronizzazione account.
- Si sceglie la prossima uscita nel fuso della località. Rientro uguale o precedente all’uscita significa giorno seguente. Si usa la fascia oraria contenente l’orario, senza interpolazioni al minuto. Un dato nullo resta mancante, non diventa zero.
- I risultati si aggiornano al cambio dati/località, ogni minuto con app visibile e al ritorno dal background. La provenienza e i bollettini restano separati.
- Layout adattivo, etichette degli input, validazione nativa, messaggi di stato e focus visibile.

Verifica: 15 controlli deterministici nuovi per fusi, ora legale, mezzanotte, orari passati e dati mancanti; 49 controlli Atmosphere esistenti superati. Build di produzione con controllo sintattico di tutti i moduli. Nessuna nuova verifica su dispositivi fisici o lettori di schermo.

Restano futuri push a app chiusa, widget nativi, nowcasting minuto per minuto e streaming. Questa scheda non fornisce allerte o garanzie sulla sicurezza degli spostamenti.
