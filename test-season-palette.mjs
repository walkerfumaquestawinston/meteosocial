import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('./dist/season-design.css',import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].map(([,selector,body])=>({selector:selector.trim(),vars:Object.fromEntries([...body.matchAll(/(--[\w-]+):([^;]+)(?:;|$)/g)].map(([,key,value])=>[key,value.trim()]))}));
const base=rules.find(x=>x.selector.trim()==='html:root').vars;
const seasons=[base,...rules.filter(x=>x.selector.includes('[data-season=')||x.selector.includes('[data-festive-tone=')).map(x=>({...base,...x.vars}))];
const day=rules.find(x=>x.selector==='html:root[data-phase]').vars;
const phases=[day,...rules.filter(x=>/^html:root\[data-phase=/.test(x.selector)).map(x=>({...day,...x.vars}))];
function luminance(hex){let s=hex.slice(1);if(s.length===3)s=[...s].map(x=>x+x).join('');assert.match(s,/^[a-f\d]{6}$/i);const c=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
let count=0,min=99;
for(const season of seasons)for(const phase of phases){
 const vars={...season,...phase};
 const resolve=v=>v.startsWith('var(')?vars[v.slice(4,-1)]:v;
 for(const fg of ['--signal-ink','--signal-muted','--signal-accent'])for(const bg of ['--signal-paper','--signal-surface']){
  const ratio=contrast(resolve(vars[fg]),vars[bg]);assert.ok(ratio>=4.5,`${fg} / ${bg}: ${ratio}`);min=Math.min(min,ratio);count++;
 }
 assert.ok(contrast(season['--season-dark'],'#263b54')>=4.5);
}
console.log(`${count} calendar/solar text colour pairs pass 4.5:1; minimum ${min.toFixed(2)}:1. Gradients require visual review.`);
