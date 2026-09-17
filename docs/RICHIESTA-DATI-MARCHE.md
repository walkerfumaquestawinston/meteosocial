# Richiesta accesso dati per MeteoSocial — bozza non inviata

Destinatario: Centro Funzionale Multirischi, Regione Marche

Email istituzionale indicata sul sito regionale: spc.centrofunzionale@regione.marche.it

Oggetto: Disponibilità e riutilizzo di osservazioni orarie per San Benedetto del Tronto

Buongiorno,

sto sviluppando MeteoSocial, un’app meteo che intende confrontare in modo trasparente le previsioni salvate in anticipo con osservazioni strumentali, mostrando fonte, orario e limiti dei dati. Il primo territorio di interesse è San Benedetto del Tronto.

Ho consultato la documentazione della Rete Meteo-Idro-Pluviometrica e i riferimenti ai servizi SOL/SIRMIP e Rete MIR Tempo Reale. Vorrei sapere se è disponibile un accesso autorizzato per un’applicazione web ai seguenti dati:

- temperatura dell’aria e precipitazione oraria delle stazioni rappresentative di San Benedetto del Tronto, con identificativo, coordinate, quota e stato di operatività;
- definizione della misura (temperatura istantanea o media, intervallo dell’accumulo pioggia, unità, risoluzione del pluviometro e fuso orario);
- timestamp della misura e della sua disponibilità, segnalazioni di qualità, valori mancanti e successive revisioni;
- almeno le ultime 48 ore, con indicazione del ritardo tipico e della frequenza di aggiornamento.

Potete indicarmi l’eventuale API o esportazione automatizzabile documentata, la procedura di abilitazione, i limiti di consultazione e le condizioni di riutilizzo e attribuzione? Vorrei inoltre conoscere eventuali costi e sapere se la registrazione al portale consenta solo la consultazione oppure anche l’accesso automatico e la pubblicazione di confronti derivati.

L’app non presenterà dati mancanti come assenza di pioggia, né userà misure di una stazione lontana come osservazioni della città. Le segnalazioni degli utenti resteranno distinte dalle misure strumentali e dalle allerte ufficiali.

Grazie per le indicazioni.

Il referente del progetto MeteoSocial

---

## Fonti e stato della verifica

- Pagina rete: https://www.regione.marche.it/Regione-Utile/Protezione-Civile/Progetti-e-Pubblicazioni/Meteo — indica registrazione per SOL e Rete MIR Tempo Reale.
- Accesso collegato dalla pagina ufficiale: https://retemir.regione.marche.it/login
- Contatto istituzionale: https://www.regione.marche.it/Regione-Utile/Protezione-Civile/Strutture-Operative/Centro-Funzionale-Multirischi
- Verifica del 17 settembre 2026: pagine informative leggibili; accesso ai portali MIR, SOL, AMAP e Allerta non riuscito da questo ambiente (502/timeout). Questo non prova che siano indisponibili per tutti.
- Nessuna registrazione effettuata, nessuna email inviata, nessuna condizione o costo accettato. Disponibilità di una API, copertura locale e permessi di riutilizzo NON ancora confermati.
