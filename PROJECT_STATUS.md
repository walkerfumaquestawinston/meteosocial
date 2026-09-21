# MeteoSocial — stato pubblico del progetto

## 21 settembre 2026 — Atlante meteo

La nuova mappa comprende Temperatura, Pioggia, Grandine e Fulmini, ricerca con scelta della località, confronto caldo/freddo delle città nella vista, guida, elenco accessibile e Lente IA nella mappa.

I temporali del livello Fulmini sono dati di modello: le singole scariche non sono rilevate. La grandine mostra osservazioni della community delle ultime due ore. Le previsioni e la pioggia provengono da Open-Meteo. Le immagini radar restano nella vista di dettaglio.

Verifiche: build completata; 48 suite superate. Il runner segnala separatamente 6 test di moduli già ritirati. Ricerca e interazioni provate nel browser; layout verificato a 390×844.

Pubblicata su Sites il 21 settembre 2026: https://scudo-meteo-community.walkerthehate.chatgpt.site/#mappa-eventi. PR GitHub #6 integrata nel ramo principale; controllo Check MeteoSocial superato.

Lo storico precedente rimane nella cronologia Git. Per riprendere, leggere docs/CLAUDE_HANDOFF.md e le istruzioni del progetto.

Gli artefatti generati dist/app e dist/server non sono versionati. Dopo il clone: pnpm install --frozen-lockfile, poi pnpm build e pnpm test. I sorgenti dentro dist restano versionati: non eliminare quella cartella. Netlify compila già prima della pubblicazione.

CI GitHub: installa le dipendenze bloccate, genera il bundle e verifica le tre suite esistenti più mappa, dati meteo e Lente.
