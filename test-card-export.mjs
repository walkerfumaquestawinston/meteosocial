import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('dist/sky-community.js','utf8');
const fn=source.slice(source.indexOf('async function saveCard('),source.indexOf('\n async function showZone'));
// reportLabel è definito a monte del pezzo estratto: va ricavato dal modulo, non
// riscritto a mano, altrimenti resta indefinito e saveCard finisce nel proprio
// catch facendo passare per errore d'esportazione un errore del banco di prova.
const reportLabel=Function('SKY_LEVELS','return '+source.slice(source.indexOf('const reportLabel=')+'const reportLabel='.length,source.indexOf('\n',source.indexOf('const reportLabel='))).replace(/;\s*$/,''))([['Asciutto']]);
for(const mode of ['ok','capture-fails','no-blob','loading']){
 const button={disabled:false,textContent:'Salva l’immagine'},messages=[];let attached=false,clicked=false,revoked=false,close;
 const drawn=[];
 const context={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},drawImage(){},fillText(text){drawn.push(String(text))}};
 const doc={body:{append(){attached=true}},createElement(type){return type==='canvas'?{getContext:()=>context,toBlob:cb=>cb(mode==='no-blob'?null:new Blob(['png']))}:{click(){assert.equal(attached,true);clicked=true},remove(){removed=true}}}};
 const ctx={modal(title,html){assert.match(html,/Scarica PNG/);assert.match(html,/<img /);attached=true},toast:m=>messages.push(m),world:{scene:()=>mode==='loading'?null:{capture(){if(mode==='capture-fails')throw Error('SecurityError');return {width:500,height:500}}}}};
 const action=Function('ctx','$','document','URL','location','SKY_LEVELS','time','setTimeout','esc','reportLabel',fn+';return saveCard')(ctx,selector=>selector==='#dialog'?{addEventListener(event,handler){assert.equal(event,'close');close=handler}}:selector==='#sky-download-card'?{click(){assert.equal(attached,true);clicked=true}}:button,doc,{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>{revoked=true}},{host:'test.invalid'},[['Asciutto']],()=> '10:00',cb=>cb(),s=>s,reportLabel);
 await action({city:'Roma',level:0,created:0});assert.equal(button.disabled,false);assert.equal(button.textContent,'Salva l’immagine');assert.equal(messages.length,mode==='ok'?0:1);
 if(mode==='ok'){assert.ok(clicked&&!revoked);close();assert.ok(revoked);
  // La card disegnata deve contenere località ed etichetta: se una dipendenza
  // torna indefinita il testo sparisce anche quando nessun avviso viene mostrato.
  assert.ok(drawn.includes('Roma'),'la card riporta la località');
  assert.ok(drawn.some(t=>t.startsWith('Asciutto · ')),'la card riporta etichetta e orario');
 }else{assert.equal(clicked,false);assert.match(messages[0],/Riprova/)}
}
console.log('4 export scenarios passed: visible preview and download, capture failure, null blob, map loading');
