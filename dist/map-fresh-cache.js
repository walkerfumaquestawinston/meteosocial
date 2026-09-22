// Shared in-flight requests and bounded TTL, without resurrecting cleared entries.
export function createFreshCache(now=Date.now){
 const cache=new Map();
 return {clear:()=>cache.clear(),async read(key,load,ttl=120000){
  const old=cache.get(key);if(old?.promise)return old.promise;
  if(old&&now()-old.at<ttl)return old.value;
  const record={};record.promise=Promise.resolve().then(load).then(value=>{
   if(cache.get(key)===record){cache.set(key,{value,at:now()});if(cache.size>60){const first=[...cache].find(([k,v])=>k!==key&&!v.promise);if(first)cache.delete(first[0]);}}
   return value;
  }).catch(error=>{if(cache.get(key)===record)cache.delete(key);throw error});
  cache.set(key,record);return record.promise;
 }};
}
