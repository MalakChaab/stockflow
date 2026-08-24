/* StockFlow cloud sync. Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY after creating the project. */
window.STOCKFLOW_SUPABASE={url:'',key:''};
(function(){
 const cfg=window.STOCKFLOW_SUPABASE;
 if(!cfg.url||!cfg.key)return;
 const sb=window.supabase.createClient(cfg.url,cfg.key);
 const key='stockflow-v5';
 async function pull(){const {data,error}=await sb.from('stockflow_data').select('data,updated_at').eq('id','main').maybeSingle();if(error)throw error;if(data?.data){localStorage.setItem(key,JSON.stringify(data.data));location.reload();}}
 async function push(){const raw=localStorage.getItem(key);if(!raw)return;const data=JSON.parse(raw);const {error}=await sb.from('stockflow_data').upsert({id:'main',data,updated_at:new Date().toISOString()});if(error)throw error;}
 window.StockFlowCloud={pull,push,sync:async()=>{try{await push()}catch(e){console.warn('StockFlow cloud sync',e)}}};
 window.addEventListener('load',async()=>{try{const {data}=await sb.from('stockflow_data').select('id').eq('id','main').maybeSingle();if(data)await pull();else await push();}catch(e){console.warn('Cloud unavailable',e)}});
})();