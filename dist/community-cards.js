const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const COMMUNITY_TOPICS=[['Pioggia','☂'],['Neve','❄'],['Vento','≋'],['Grandine','◇'],['Cielo sereno','☀'],['Domanda','?']];
export function postFacts(post){
 const date=Number.isFinite(post.created)?new Date(post.created):null;
 return `<div class="community-post-facts"><span class="community-kind">${escape(post.kind||'Racconto')}</span><span>Racconto non verificato</span></div><p class="community-post-time">${date&&!Number.isNaN(date.valueOf())?`Pubblicato <time datetime="${date.toISOString()}">${escape(date.toLocaleString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</time> · ora del dispositivo`:'Orario di pubblicazione non disponibile'}</p>`;
}
export function publicationPreview(draft){
 const photo=typeof draft.photo==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(draft.photo)?draft.photo:null;
 return `<article class="community-publication-preview"><span class="community-kicker">ANTEPRIMA · NON ANCORA PUBBLICATO</span><h2>${escape(draft.city)}</h2><span class="community-kind">${escape(draft.kind)}</span>${photo?`<img src="${photo}" alt="Foto che stai per pubblicare">`:''}<p class="community-preview-text">${escape(draft.text)}</p></article><p class="community-preview-note">Controlla comune, testo e foto. Se racconti un fenomeno, indica nel testo quando l’hai osservato: l’ora di pubblicazione non è l’ora dell’osservazione.</p><p class="community-preview-note">Il contenuto sarà pubblico. Puoi chiudere questa anteprima per modificarlo.</p>`;
}
