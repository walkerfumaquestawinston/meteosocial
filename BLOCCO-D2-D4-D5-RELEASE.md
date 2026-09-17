# D2, D4, D5 — adattamento approvato

- dist/main.js: modulo lungo apribile dal link Community, tipo post e vecchio feed dietro flag; foto preparate prima di pubblicare, protezione da risultati asincroni dopo cambio pagina/foto. Post lunghi restano nel sistema archivio con autenticazione preesistente; non vengono convertiti in segnalazioni sky.
- dist/sky-community.js: Adesso, ultime due ore; sei pulsanti invariati prima del feed; link al modulo lungo; funzioni ulteriori nascoste tramite flag. D6 con 5/15/50/150 km e distanza dichiarata invariato. Foto con la stessa preparazione e budget prudenziale 1.050.000 byte, compatibile con server sky (1.100.000 byte e richiesta 1.600.000 caratteri).
- dist/community-features.js: flag riattivabili per tipo post, feed legacy, stories e funzioni aggiuntive. Nessun codice legacy cancellato.
- dist/photo-tools.js: bitmap e canvas JPEG, lato max1600, qualità .82 poi .7; ulteriore riduzione se necessario; nessun rifiuto basato sui MB del file originale; rilascio bitmap. Nuovo JPEG senza metadati EXIF/GPS. Budget lungo1.500.000 byte. Formati non decodificabili dal browser restano esclusi.
- build.mjs e dist/sw.js: inclusione nuovi moduli e cache v30; dist/server/index.js rigenerato.
- Test photo-tools e quick-sky aggiornati, note di stato e visione aggiornate.

Verifica: test-photo-tools (canvas simulato), test-quick-sky, test-nearby-feed e58 controlli server sky superati. Build e sintassi controllate. Nessun upload reale da telefono verificato in questo blocco. Nessuna modifica di dati o post di produzione, credenziali, server, schema, geometria o rendering del globo.

Limiti preservati: il modulo lungo usa account/archivio, le segnalazioni brevi usano sky/Adesso. La riunificazione dei due sistemi non fa parte di questo adattamento. Funzioni archivio ancora raggiungibili con percorsi esistenti. E1 non ha cron autonomo configurato.
