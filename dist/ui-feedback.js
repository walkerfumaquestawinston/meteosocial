// Small, shared feedback layer. No 3D imports and no animation on automatic errors.
const CACHE_KEY='ms-weather-session-v1';
const placeKey=p=>`${p.latitude},${p.longitude}`;
export function recallWeather(place,now=Date.now()){
  try{const c=JSON.parse(sessionStorage.getItem(CACHE_KEY)||'null');return c&&c.key===placeKey(place)&&c.data?._loadedAt<=now&&now-c.data._loadedAt<300000&&Number.isFinite(c.data.current?.temperature_2m)&&Number.isFinite(c.data.current?.weather_code)?c.data:null}catch{return null}
}
export function rememberWeather(place,data){try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({key:placeKey(place),data}))}catch{}}
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')||document.documentElement.classList.contains('eco-mode');
// Stable report IDs connect pending rows, confirmed observations and expiry.
export function createFeedFeedback(){
 const running=new Set(),ghosts=new Set(),lastHTML=new WeakMap();
 function stop(){for(const a of running)a.cancel();running.clear();for(const node of ghosts)node.remove();ghosts.clear()}
 const preference=()=>{if(reduced()||document.hidden)stop()};
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',preference);
 document.addEventListener('visibilitychange',preference);
 new MutationObserver(preference).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 function move(node,frames,duration,done=()=>{}){
  const animation=node.animate(frames,{duration,easing:'ease-out'});running.add(animation);
  animation.finished.catch(()=>{}).finally(()=>{running.delete(animation);done()});
 }
 function render(host,html){
  if(lastHTML.get(host)===html)return;lastHTML.set(host,html);
  const before=new Map([...host.querySelectorAll('[data-report-key]')].map(n=>[n.dataset.reportKey,{node:n,rect:n.getBoundingClientRect()}]));
  const oldHeight=host.getBoundingClientRect().height;
  stop();host.innerHTML=html;
  if(reduced()||document.hidden||!host.animate)return;
  const after=[...host.querySelectorAll('[data-report-key]')],keys=new Set(after.map(n=>n.dataset.reportKey));
  for(const node of after){const old=before.get(node.dataset.reportKey),rect=node.getBoundingClientRect();
   if(old){const dy=old.rect.top-rect.top;if(Math.abs(dy)>.5)move(node,[{transform:`translateY(${dy}px)`},{transform:'translateY(0)'}],200)}
   else move(node,[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],200);
  }
  const newHeight=host.getBoundingClientRect().height,box=host.getBoundingClientRect();
  for(const [key,{node,rect}] of before){if(keys.has(key)||!(Number(node.dataset.expires)<=Date.now()))continue;
   const ghost=node.cloneNode(true);ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('data-report-key');
   Object.assign(ghost.style,{position:'absolute',pointerEvents:'none',top:`${rect.top-box.top}px`,left:`${rect.left-box.left}px`,width:`${rect.width}px`,margin:'0'});
   host.append(ghost);ghosts.add(ghost);move(ghost,[{opacity:1},{opacity:0}],400,()=>{ghost.remove();ghosts.delete(ghost)});
  }
  if(oldHeight>0&&Math.abs(oldHeight-newHeight)>.5)move(host,[{height:`${oldHeight}px`},{height:`${newHeight}px`}],200);
 }
 return {render,stop};
}
export function reportHaptic(result,userGesture){
  try{if(userGesture&&!document.hidden&&!reduced()&&localStorage.getItem('ms-haptics')!=='false')navigator.vibrate?.(result==='success'?18:[30,40,30])}catch{}
}
export function installUIFeedback(){
  const root=document.querySelector('#main'),dialog=document.querySelector('#dialog-body');if(!root)return;
  const numbers=new Map(),pending=new Map(),animations=new Set();let route=root.dataset.page,queued=false;
  const animate=(node,frames,duration)=>{if(reduced()||document.hidden||!node.animate)return;const a=node.animate(frames,{duration,easing:'ease-out'});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));};
  const stop=()=>{if(reduced())for(const a of animations)a.cancel()};
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',stop);
  new MutationObserver(stop).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  function key(node){const parts=[];while(node&&node!==root&&node!==dialog){if(node.id){parts.unshift('#'+node.id);break}const parent=node.parentElement;if(!parent)break;parts.unshift(node.tagName+':'+Array.prototype.indexOf.call(parent.children,node));node=parent}return parts.join('/')}
  function scan(){
    queued=false;const next=root.dataset.page;
    if(next!==route){numbers.clear();for(const [node,timer] of pending){clearTimeout(timer);node.classList.remove('ui-skeleton')}pending.clear();if(route)animate(root,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],180);route=next}
    for(const scope of [root,dialog].filter(Boolean)){
      for(const node of scope.querySelectorAll('[data-ui-number],#living-count,.atmo-temperature,.temperature,b,strong,span,h2,p,small')){
        if(node.closest('[data-ui-loading="true"],.ui-skeleton,[hidden]')||node.children.length||node.closest('button,select,svg'))continue;
        const value=node.textContent.trim();if(!/\d/.test(value)||!(/°|%/.test(value)||node.id==='living-count'||node.hasAttribute('data-ui-number')))continue;
        node.classList.add('ui-number');const id=key(node),previous=numbers.get(id);numbers.set(id,value);
        if(previous!==undefined&&previous!==value)animate(node,[{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],400);
      }
      const waiting=new Set([...scope.querySelectorAll('[data-ui-loading="true"],[role="status"],p')].filter(n=>n.dataset.uiLoading==='true'||/^(Caricamento|Carico |Cerco |Controllo chi|Ascolto le persone|Consulto |Accendo il tuo punto)/.test(n.textContent.trim())));
      for(const [node,timer] of pending){if(!node.isConnected||scope.contains(node)&&!waiting.has(node)){clearTimeout(timer);node.classList.remove('ui-skeleton');pending.delete(node)}}
      for(const node of waiting){if(pending.has(node))continue;pending.set(node,setTimeout(()=>{if(node.isConnected)node.classList.add('ui-skeleton')},300))}
    }
  }
  // Attribute-only feedback is deliberately not observed: no recursive re-rendering.
  const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(scan)}});
  for(const scope of [root,dialog].filter(Boolean))observer.observe(scope,{childList:true,subtree:true,characterData:true});
  scan();
}
