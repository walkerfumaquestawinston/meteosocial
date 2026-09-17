// Canvas export creates a new JPEG without the source EXIF/GPS metadata.
export async function preparaFoto(file,latoMax=1600,qualita=.82,maxBytes=1500000){
 if(!file||!file.type.startsWith('image/'))throw Error('Scegli una foto leggibile.');
 const bitmap=await createImageBitmap(file);
 try{
  if(!bitmap.width||!bitmap.height)throw Error('Foto non leggibile.');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Foto non disponibile su questo dispositivo.');
  let lato=latoMax;
  for(let attempt=0;attempt<5;attempt++){
   const scala=Math.min(1,lato/Math.max(bitmap.width,bitmap.height));
   canvas.width=Math.max(1,Math.round(bitmap.width*scala));canvas.height=Math.max(1,Math.round(bitmap.height*scala));
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of [qualita,.7]){
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
    if(!blob||blob.type!=='image/jpeg')throw Error('Foto non leggibile.');
    if(blob.size<=maxBytes)return blob;
   }
   lato=Math.round(lato*.8);
  }
  throw Error('Non riesco a preparare questa foto. Prova un’altra immagine.');
 }finally{bitmap.close?.()}
}
export async function fotoDataURL(file,maxBytes=1500000){
 const blob=await preparaFoto(file,1600,.82,maxBytes);
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Foto non leggibile.'));reader.readAsDataURL(blob)});
}
