// Independent asynchronous resources prevent one screen from blocking another.
export class ResourceController {
 constructor(loader,{ttl=30000}={}){this.loader=loader;this.ttl=ttl;this.state={status:'idle',data:null,error:null,updated:0};this.sequence=0;this.listeners=new Set();this.pending=null}
 subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener)}
 emit(){for(const listener of this.listeners)listener(this.state)}
 async load({force=false}={}){if(this.pending&&!force)return this.pending;if(!force&&this.state.status==='ready'&&Date.now()-this.state.updated<this.ttl)return this.state.data;this.abort?.abort();const sequence=++this.sequence;this.abort=new AbortController();this.state={...this.state,status:'loading',error:null};this.emit();
  const task=(async()=>{try{const data=await this.loader(this.abort.signal);if(sequence!==this.sequence)return null;this.state={status:'ready',data,error:null,updated:Date.now()};this.emit();return data}catch(error){if(sequence!==this.sequence||error.name==='AbortError')return null;this.state={...this.state,status:'error',error:error.message};this.emit();return null}finally{if(sequence===this.sequence)this.pending=null}})();this.pending=task;return task;
 }
 dispose(){this.sequence++;this.abort?.abort();this.pending=null;this.listeners.clear()}
}
