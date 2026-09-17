# Fit Check — settembre 2026

## Funzioni consegnate

- Pagina `#fitcheck`: mappa OpenStreetMap e lista di foto/video, ricerca intorno al centro esplorato entro 5 o 20 km, filtri Leggero / A strati / Impermeabile / Ombrello / Scarpe chiuse.
- Collegamenti da Community, post propri con media, Globo/Mappa, Meteo, Profilo e Guida. I commenti e le reazioni appartengono al post originale, senza una seconda conversazione separata.
- L'autore sceglie un proprio contenuto delle ultime 24 ore e una zona; il browser arrotonda prima dell'invio. Il server impone la stessa griglia di 0,02 gradi, conservando celle intere. GPS solo su azione esplicita; nessun tracciamento.
- Per le 35 città riconosciute del catalogo, il server rifiuta aree a più di 35 km dalla città del post. Per altre località la posizione resta dichiarata, non verificata. Non è una certificazione di luogo o autenticità.
- Scadenza della zona al massimo 24 ore dopo la pubblicazione originale; non prorogabile riposizionando il post. Rimozione della zona separata dalla rimozione del contenuto. Blocchi autore, proprietà, CSRF e limiti di frequenza lato server.
- Pin raggruppati per cella; nessun autoplay. Se le tessere cartografiche mancano, l'elenco resta utilizzabile. Link alle previsioni del centro effettivamente esplorato; domanda contestuale all'assistente predisposta, IA ancora non configurata.
- Migrazione aggiuntiva `0007_fuzzy_inertia.sql`; nessuna modifica alle migrazioni precedenti. Interrogazioni limitate, prefiltri spaziali indicizzati e limite esplicito di risultati. Non è un indice spaziale globale senza limiti.

## Verifiche

241 verifiche automatiche superate: 41 Fit Check, 37 editoriali, 41 feed, 49 atlante, 38 social, 21 Worker, 14 sensoriali/offline. Fit Check verifica anche precisione, antimeridiano, scadenze, blocchi, proprietà e risposte asincrone obsolete.

Browser locale: resa desktop e 390×844 senza overflow orizzontale, accesso richiesto, selezione di un proprio media, scelta esplicita dell'area, conferma e comparsa del pin/post. Un caso di città incoerente trovato durante la prova è stato corretto e coperto dal test server. Nessun post di prova sul sito pubblico. GPS reale e telefoni fisici non testati.

## Restano integrazioni distinte

Dirette/Co-Op, push Sky-Drop a app chiusa, montaggio automatico pianificato, eventi da allerte ufficiali e servizi IA reali restano da collegare. L'editor e le Storm Rooms sono descritti in `EDITORIAL-RELEASE.md`. La presenza di un media sulla mappa non prova meteo, abbigliamento adeguato o sicurezza del luogo.
