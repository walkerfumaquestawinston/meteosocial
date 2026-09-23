# Il prossimo cambio — 22 settembre 2026

Prima tappa dopo l’audit: Oggi ospita un riepilogo originale delle prossime sei fasce orarie. Sostituisce il precedente blocco orario, non si aggiunge ad esso. Usa esclusivamente la previsione Open-Meteo già caricata: nessuna nuova chiamata, dipendenza, immagine o animazione. Non rivendichiamo esclusività mondiale.

Seleziona il primo passaggio previsto di precipitazione, temporale, aumento del vento di almeno 15 km/h fino ad almeno 30 km/h o variazione di almeno 4 °C rispetto alla condizione attuale. Mostra orario locale, sequenza di sei punti, motivo, fonte e accesso a mappa/previsioni. Non stima minuti di arrivo, grandine o conferme dal posto. L’orario di acquisizione non è quello di emissione del modello.

Richiede sei fasce consecutive con temperatura, codice, probabilità e vento validi. Con dati parziali mostra ciò che è disponibile senza sintetizzare un evento; con dati offline/vecchi evita il riepilogo. Limiti: dato attuale non più vecchio di tre ore, acquisizione nota non più vecchia di 90 minuti. Ricalcola ogni minuto mentre visibile; non interrompe dettagli aperti o focus. Cambio città e nuove previsioni aggiornano la scheda.

Home mobile: scena ridotta di 60 px, paesaggio mantenuto. Nuovo componente usa le coppie semantiche delle palette; nessun `!important` aggiunto. Corretto nel controllo visivo un conflitto degli elementi header generici.

La cache v82 prepara solo la struttura principale e le sue dipendenze statiche. Risorse geografiche e moduli secondari sono scaricati all’utilizzo: la prima visita offline a quelle sezioni può richiedere la rete. Il file resta ammesso alla cache dopo il primo uso. GitHub Actions ora esegue tutte le suite attive; i cinque contratti storici rimangono esclusi esplicitamente.

Verifica: build; suite nuove su soglie, dati mancanti, offline, fusi, mezzanotte, rendering sicuro e installazione cache; suite completa; controllo browser a 390 px senza overflow, dati reali dell’anteprima e nessun errore console. Non sono misure batteria/FPS su dispositivi fisici.

## Prossime tappe, non ancora realizzate

- Consolidare gli stili storici e caricare su richiesta i moduli disattivati. Questa tappa non pretende di risolvere tutto il debito tecnico.
- Mappa più selettiva alle scale ampie, con orari distinti per radar/previsioni/osservazioni.
- “Due voci del cielo”: confronto tra previsione e osservazioni recenti della zona, con distanze, età e assenza di testimonianze esplicite. Nessun consenso inventato.
- “La previsione si corregge”: rendere più visibile la cronologia già presente e spiegare cosa è cambiato per la stessa ora.
- Grandine: valutare una fonte specializzata prima di introdurre stime quantitative o avvisi di arrivo. Le segnalazioni restano osservazioni non certificate.

Pubblicazione e riferimenti sorgente finali in PROJECT_STATUS.md e RIPRENDI-QUI.md.
