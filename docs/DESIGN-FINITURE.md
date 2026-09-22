# Interfaccia più leggibile — 22 settembre 2026

Richiesta: migliorare direttamente il design di MeteoSocial senza nuovi abbonamenti. Estensione dell'identità esistente, con superfici e colori collegati alle fasi solari.

- Oggi: condizioni e prossimo cambiamento affiancati sul desktop, impilati su telefono. Tre azioni principali distinte. Se i dati sono vecchi, il riepilogo conserva il messaggio esplicito di indisponibilità.
- Navigazione: barra delle cinque sezioni in alto sul desktop delle pagine normali; dock inferiore su telefono e mappa. Nessuna funzione o account rimosso.
- Tipografia: Bricolage nei titoli, carattere di sistema per testi e controlli; corpo 16 px, metadati 13 px, pulsanti leggibili e focus visibile. Il selettore della città resta in testata; su telefono è eliminato il pulsante duplicato di Oggi.
- La cronologia rimane accessibile; il lungo testo dell'ultima variazione è raccolto in un dettaglio apribile. Ora di acquisizione e indicazione di copia salvata restano visibili.
- Community: comandi Foto/Video/Scrivi/Domanda in due colonne sul telefono, superfici e angoli uniformi. Previsioni: selettore del periodo con stato selezionato evidente. Dialoghi e campi più leggibili.
- Collegamenti da Oggi e Meteo portano alla mappa attuale. La home senza hash non anticipa più il download di MapLibre (937395 byte non compressi); la vecchia mappa continua a caricarlo quando serve. Nessuna libreria, immagine o richiesta esterna aggiunta. Non è una misura di miglioramento del tempo di caricamento reale.
- Transizioni brevi per i controlli, rispetto del movimento ridotto esteso alla pagina. Niente blur sul dock. Le animazioni meteo esistenti conservano le proprie condizioni e opzioni di comfort.

Build e 69 suite esistenti superate; ulteriori ritocchi soltanto CSS verificati in anteprima. Browser locale desktop, 390 e 320 px su Oggi/Community, navigazione Meteo e dettagli controllati. Le previsioni locali conservate sono esplicitamente vecchie: il restyling non corregge l'indisponibilità Open-Meteo. Nessuna certificazione completa WCAG, meteorologica o di prestazioni.

Pubblicazione e riferimenti definitivi sono in PROJECT_STATUS.md e RIPRENDI-QUI.md.
