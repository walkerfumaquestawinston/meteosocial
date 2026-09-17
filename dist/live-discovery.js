import {esc,weatherName,valueText} from './weather-tools.js';
const distance=(a,b)=>{const d=Math.PI/180,p=(b.latitude-a.latitude)*d,l=(b.longitude-a.longitude)*d;return 12742*Math.asin(Math.min(1,Math.sqrt(Math.sin(p/2)**2+Math.cos(a.latitude*d)*Math.cos(b.latitude*d)*Math.sin(l/2)**2)))};
export function createDiscovery(ctx){let cached=null,at=0,pending=null;
 async function data(){if(cached&&Date.now()-at<60000)return cached;if(pending)return pending;pending=ctx.api('sky/reports').then(r=>{cached={reports:r.reports||[]};at=Date.now();return cached}).finally(()=>pending=null);return pending}
 async function paint(host){host.dataset.discoveryReady='true';const place=ctx.get().place,weather=ctx.get().weather?.current;host.innerHTML='<p role="status">Guardo cosa succede nel mondo…</p>';const d=await data();if(!host.isConnected)return;const now=Date.now(),reports=(d.reports||[]).filter(r=>r.expires>now&&r.created>now-7200000&&r.created<=now).sort((a,b)=>b.created-a.created).slice(0,3);
 host.innerHTML=`${reports.length?`<h2>Ultime voci dal mondo</h2>${reports.map((r,i)=>`<button class="discovery-row" data-discovery-report="${i}"><strong>${esc(r.phenomenon||r.kind)} · ${esc(r.city)}</strong><span>${Math.floor((now-r.created)/60000)} min fa · circa ${Math.round(distance(place,r))} km da te</span></button>`).join('')}`:''}${!reports.length?`<h2>Il cielo di ${esc(place.name)}</h2><p>${weather?`${valueText(weather.temperature_2m,'°')} · ${esc(weatherName(weather.weather_code))}`:'Scopri il meteo delle prossime ore.'}</p><a href="#tendenze">Guarda la tua giornata</a>`:''}`;
 host.querySelectorAll('[data-discovery-report]').forEach(b=>b.onclick=()=>ctx.showZone(reports[+b.dataset.discoveryReport]));
 }
 function scan(){for(const host of document.querySelectorAll('[data-live-discovery]:not([data-discovery-ready])'))paint(host).catch(()=>{if(host.isConnected)host.innerHTML='<a href="#tendenze">Scopri il meteo della tua giornata</a>'})}
 const observer=new MutationObserver(scan);observer.observe(document.querySelector('#main'),{childList:true,subtree:true});return {scan};
}
