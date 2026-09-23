// Local suggestions only: opening or choosing a prompt never calls the AI.
export const LENTE_TASKS={
 explain:{label:'Capire i dati',prompts:[['Cosa cambia','Riassumi cosa cambia nelle prossime ore, con fonte, ora locale e dati mancanti.'],['Quanto è aggiornato?','Spiega a quale ora si riferiscono i dati, se sono previsioni o osservazioni e cosa non puoi verificare.'],['Numeri in parole semplici','Spiega temperatura percepita, probabilità e quantità di pioggia usando soltanto i valori disponibili.']]},
 plan:{label:'Organizzare la giornata',prompts:[['Quando uscire','Confronta fino a tre fasce delle prossime ore per una passeggiata: pioggia, vento e temperatura. Indica compromessi e dati mancanti, senza garantire sicurezza.'],['Come vestirmi','Suggerisci un abbigliamento adattabile alle prossime ore in base a temperatura, percepita, vento e pioggia disponibili.'],['Un piano alternativo','Proponi un piano semplice per la giornata e un’alternativa se piove, senza inventare luoghi, aperture o prenotazioni.']]},
 community:{label:'Capire i racconti',prompts:[['Il punto della zona','Riassumi i testi pubblici disponibili, citando i post e distinguendo racconti, previsioni e informazioni mancanti.'],['Cosa non coincide?','Confronta i testi della community e la previsione. Controlla prima luoghi e orari; uno scarto non dimostra che qualcuno abbia torto.'],['Una domanda utile','Prepara una domanda gentile alla community per chiarire il meteo locale, senza chiedere indirizzi o riprese pericolose.']]},
 create:{label:'Scrivere un contenuto',prompts:[['Bollettino breve','Prepara una bozza di bollettino di massimo 40 parole dai dati disponibili, con località, fonte e ora.'],['Una didascalia','Proponi due didascalie brevi ispirate alla previsione, senza fingere di avere visto foto o video.'],['Una segnalazione chiara','Aiutami a scrivere una segnalazione: chiedimi cosa osservo e a che ora, senza dedurre osservazioni dalla previsione. Non pubblicare nulla.']]}
};
export function lenteRoute(route='home'){
 if(route.startsWith('post:'))return {section:'community',task:'community',postId:route.slice(5)};
 if(['community','archivio','stories','stanza'].includes(route))return {section:'community',task:'community'};
 if(['mappa-eventi','mappa','mappa-classica','radar','grandine-mappa'].includes(route))return {section:'map',task:'explain',layer:route==='radar'?'radar':route==='grandine-mappa'?'grandine':'meteo'};
 if(['studio','redazione','pubblica','segnala','testimonianza'].includes(route))return {section:'weather',task:'create'};
 if(['fitcheck','ripari'].includes(route))return {section:'weather',task:'plan'};
 return {section:route==='mondo'?'globe':'weather',task:'explain'};
}
