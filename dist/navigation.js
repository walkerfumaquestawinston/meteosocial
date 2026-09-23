import {esc} from './weather-tools.js';

export function placeLabel(name){return `<span class="place-caption">Località</span><span class="place-name">${esc(name)}</span><span class="place-chevron" aria-hidden="true">⌄</span>`;}
export function createNavigation(){
 const nav=document.querySelector('.signal-nav');
 const indicator=document.createElement('span');indicator.className='nav-selection';indicator.setAttribute('aria-hidden','true');nav.append(indicator);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.matches('.reduced-motion,.eco-mode,.light-rendering');
 let frame=0;
 function position(){
  frame=0;const active=nav.querySelector('a.active');indicator.hidden=!active;
  if(!active)return;
  indicator.style.width=active.offsetWidth+'px';indicator.style.height=active.offsetHeight+'px';
  indicator.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px)`;
 }
 function sync(){
  for(const link of document.querySelectorAll('body>header>a:not(.brand)')){
   if(link.hash===location.hash)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
  if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(position);
 }
 new ResizeObserver(sync).observe(nav);
 document.addEventListener('click',event=>{
  const target=event.target.closest('.signal-nav>a,body>header>a,body>header>button');
  if(!target||reduced())return;
  const icon=target.querySelector('svg')||target;
  icon.getAnimations().forEach(a=>a.cancel());
  icon.animate([{transform:'scale(1)'},{transform:'scale(.88)',offset:.3},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
 });
 return {sync};
}
