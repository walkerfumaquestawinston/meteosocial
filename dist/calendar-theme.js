import {calendarDecoration} from './calendar-art.js';
import {SEASON_DATES} from './season-dates.js';

const names=['Primavera','Estate','Autunno','Inverno'];
const ids=['primavera','estate','autunno','inverno'];
const fixed={
 '01-01':['capodanno','Buon anno','oro'], '01-06':['epifania','Epifania','oro'],
 '02-14':['san-valentino','San Valentino','rosa'], '04-25':['liberazione','Festa della Liberazione','verde'],
 '05-01':['lavoro','Festa del Lavoro','verde'], '06-02':['repubblica','Festa della Repubblica','verde'],
 '08-15':['ferragosto','Ferragosto','sole'], '10-31':['halloween','Halloween','ambra'],
 '11-01':['ognissanti','Ognissanti','ambra'], '12-08':['immacolata','Immacolata','oro'],
 '12-24':['vigilia','Vigilia di Natale','natale'], '12-25':['natale','Buon Natale','natale'],
 '12-26':['santo-stefano','Santo Stefano','natale'], '12-31':['san-silvestro','San Silvestro','oro']
};
export function easterDate(year){
 // Gregorian computus; returns a civil date, never converted through the browser timezone.
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return `${year}-${String(Math.floor(n/31)).padStart(2,'0')}-${String(n%31+1).padStart(2,'0')}`;
}
export function calendarTheme({at=Date.now(),timezone='Europe/Rome',latitude=42,country='IT'}={}){
 const date=new Date(at);if(!Number.isFinite(date.getTime()))throw new RangeError('Invalid calendar date');
 let parts;
 try{parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date)}
 catch{timezone='Europe/Rome';parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date)}
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value])),civil=`${p.year}-${p.month}-${p.day}`,year=Number(p.year);
 const boundaries=[...(SEASON_DATES[year-1]||[]),...(SEASON_DATES[year]||[]),...(SEASON_DATES[year+1]||[])].map(iso=>({at:Date.parse(iso),index:({3:0,6:1,9:2,12:3})[Number(iso.slice(5,7))]})).sort((a,b)=>a.at-b.at);
 const current=boundaries.filter(x=>x.at<=date.getTime()).at(-1),next=boundaries.find(x=>x.at>date.getTime()),shift=latitude<0?2:0;
 // Outside the published ephemeris, keep a neutral appearance rather than invent exact dates.
 const supported=Boolean(current&&SEASON_DATES[year]);
 const season=supported?ids[(current.index+shift)%4]:'neutro',seasonName=supported?names[(current.index+shift)%4]:'Il tuo cielo';
 let holiday=null;
 if(String(country).toUpperCase()==='IT'){
  const easter=easterDate(year),monday=new Date(Date.parse(easter+'T12:00:00Z')+86400000).toISOString().slice(0,10);
  const event=civil===easter?['pasqua','Buona Pasqua','rosa']:civil===monday?['pasquetta','Pasquetta','verde']:fixed[civil.slice(5)];
  if(event)holiday={id:event[0],label:event[1],tone:event[2]};
 }
 const dateLabel=new Intl.DateTimeFormat('it-IT',{timeZone:timezone,day:'numeric',month:'long'}).format(date);
 return {season,seasonName,holiday,civil,timezone,dateLabel,nextChange:next?.at||null};
}
export function applyCalendarTheme(weather,place={},at=Date.now()){
 const timezone=weather?.timezone||'Europe/Rome';
 const state=calendarTheme({at,timezone,latitude:place.latitude??weather?.latitude??42,country:place.country_code||(timezone==='Europe/Rome'?'IT':'')}),root=document.documentElement;
 root.dataset.season=state.season;root.dataset.holiday=state.holiday?.id||'';root.dataset.festiveTone=state.holiday?.tone||'';
 const label=state.holiday?.label||state.seasonName;
 for(const el of document.querySelectorAll('[data-calendar-label]'))el.textContent=label;
 for(const el of document.querySelectorAll('[data-calendar-date]'))el.textContent=state.dateLabel;
 const decoration=calendarDecoration(state);
 for(const el of document.querySelectorAll('[data-calendar-caption]'))el.textContent=decoration.caption;
 for(const el of document.querySelectorAll('[data-calendar-art]')){if(el.getAttribute?.('data-calendar-key')!==decoration.key){el.innerHTML=decoration.art;el.setAttribute?.('data-calendar-key',decoration.key);}}
 return state;
}
