import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('dist/sky-community.js','utf8');
const fn=source.slice(source.indexOf('async function saveCard('),source.indexOf('\n async function showZone'));
for(const mode of ['ok','capture-fails','no-blob','loading']){
 const button={disabled:false,textContent:'Salva l’immagine'},messages=[];let attached=false,clicked=false,revoked=false,close;
 const context={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},drawImage(){},fillText(){}};
 const doc={body:{append(){attached=true}},createElement(type){return type==='canvas'?{getContext:()=>context,toBlob:cb=>cb(mode==='no-blob'?null:new Blob(['png']))}:{click(){assert.equal(attached,true);clicked=true},remove(){removed=true}}}};
 const ctx={modal(title,html){assert.match(html,/Scarica PNG/);assert.match(html,/<img /);attached=true},toast:m=>messages.push(m),world:{scene:()=>mode==='loading'?null:{capture(){if(mode==='capture-fails')throw Error('SecurityError');return {width:500,height:500}}}}};
 const action=Function('ctx','$','document','URL','location','SKY_LEVELS','time','setTimeout','esc',fn+';return saveCard')(ctx,selector=>selector==='#dialog'?{addEventListener(event,handler){assert.equal(event,'close');close=handler}}:selector==='#sky-download-card'?{click(){assert.equal(attached,true);clicked=true}}:button,doc,{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>{revoked=true}},{host:'test.invalid'},[['Asciutto']],()=> '10:00',cb=>cb(),s=>s);
 await action({city:'Roma',level:0,created:0});assert.equal(button.disabled,false);assert.equal(button.textContent,'Salva l’immagine');assert.equal(messages.length,mode==='ok'?0:1);
 if(mode==='ok'){assert.ok(clicked&&!revoked);close();assert.ok(revoked)}else{assert.equal(clicked,false);assert.match(messages[0],/Riprova/)}
}
console.log('4 export scenarios passed: visible preview and download, capture failure, null blob, globe loading');
