# Passaggio a Claude

Repository: https://github.com/walkerfumaquestawinston/meteosocial

## Come ripartire
Rendi disponibile questo repository nella sessione Claude che userai, tramite la relativa integrazione GitHub oppure caricando i file necessari. La connessione GitHub di questa sessione non prova che Claude abbia già accesso.

Messaggio pronto da copiare:

> Riprendi MeteoSocial dal repository walkerfumaquestawinston/meteosocial. Leggi CLAUDE.md, README.md e AI_BRIEF.md. Verifica il codice esistente e i suoi limiti prima di proporre modifiche. Mantieni aspetto, sei viste, IT/EN, compatibilità con Claude Artifacts e file HTML autonomo. Per iniziare esegui npm run check e dimmi quali funzionalità sono già reali, locali, dimostrative o dipendenti da Claude. Prima di sviluppare, concordiamo la prossima funzionalità. Per ogni modifica lavora in src/, ricostruisci index.html e verifica il risultato.

## Preparazione del 17 settembre 2026
- Aggiunte istruzioni CLAUDE.md e ricostruzione deterministica.
- Verificata corrispondenza esatta tra HTML ricostruito e index.html preesistente.
- Verificata sintassi di tutti i file JavaScript in src/, incluso data-extra.js.
- Aggiunti controlli automatici per sincronizzazione, JSON iniziale, chiusure script e sei viste.
- Aggiunto workflow GitHub Actions per push e pull request.
- Nessuna modifica al comportamento o all'aspetto dell'app.

## Verifiche
I controlli locali sono stati eseguiti direttamente con Node.js; npm non era disponibile nell'ambiente di preparazione. Su GitHub, il workflow Check MeteoSocial esegue npm run check con Node.js 22. Consulta la scheda Actions per l'esito della versione corrente.

## Limiti da conoscere
Non sono stati collaudati il browser, le capability dentro Claude, l'accesso del tuo account Claude, né la pubblicazione negli store. Il meteo incluso è uno snapshot; dati extra non caricati. Backend multiutente, autenticazione, storage condiviso e app nativa restano lavori separati.
