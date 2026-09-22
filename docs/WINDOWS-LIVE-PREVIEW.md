# Anteprima live su Windows

## 22 settembre 2026 — Compilazione Windows e anteprima live risolte

Il compilatore nativo restituisce EPERM avviando il processo con pipe in questa sessione. `build.mjs` usa ora esbuild-wasm 0.28.2 nello stesso processo soltanto in caso di EPERM (oppure METEOSOCIAL_COMPILER=wasm). Non vengono modificati permessi Windows o protezioni. La verifica sintattica dei moduli usa output ereditato. Dipendenza bloccata nel lockfile.

Build completa riuscita e 16 suite CI eseguite localmente con uscita 0. I mock di test-lente stampano messaggi di errore del recupero DPC pur completando tutti i 76 controlli. Anteprima dell'app completa avviata con backend locale, dati e profilo separati; Home con previsioni recuperate, navigazione disponibile. Non è una verifica completa dei flussi su dispositivo fisico; IA locale non configurata.

Avvio: `node tools/live-preview.mjs`, poi http://127.0.0.1:4595/#home. Le modifiche ai moduli frontend, CSS/HTML e server ricompilano l'app e ricaricano il browser dopo una build riuscita. Verificata una ricompilazione da modifica CSS. L'anteprima funziona finché il processo resta aperto. I cambi a dipendenze, strumenti di avvio o risorse grafiche richiedono riavvio.

Sites NON aggiornato: il workflow ufficiale di preparazione sorgenti resta da sbloccare/verificare; l'ultima versione verificata online è 73. Il precedente blocco della compilazione dell'app è risolto, non confonderlo con pubblicazione riuscita.
