/* StockFlow cloud sync */
window.STOCKFLOW_SUPABASE={url:'https://fndjwyosskwbioskocvm.supabase.co',key:'sb_publishable_Kf5hGbKD_qYs37K42TTg3w_2qstA1Ci'};
(function(){
 const cfg=window.STOCKFLOW_SUPABASE,key='stockflow-v5';
 if(!cfg.url||!cfg.key||!window.supabase)return;
 const sb=window.supabase.createClient(cfg.url,cfg.key);
 let hydrating=false,timer=null;
 async function push(){if(hydrating)return;const raw=localStorage.getItem(key);if(!raw)return;const data=JSON.parse(raw);const {error}=await sb.from('stockflow_data').upsert({id:'main',data,updated_at:new Date().toISOString()});if(error)throw error;}
 function queuePush(){if(hydrating)return;clearTimeout(timer);timer=setTimeout(()=>push().catch(e=>console.warn('StockFlow cloud sync',e)),700)}
 async function pull(){const {data,error}=await sb.from('stockflow_data').select('data').eq('id','main').maybeSingle();if(error)throw error;if(data?.data){hydrating=true;localStorage.setItem(key,JSON.stringify(data.data));hydrating=false;if(typeof render==='function')render();return true}return false}
 const originalSetItem=Storage.prototype.setItem;
 Storage.prototype.setItem=function(k,v){const out=originalSetItem.apply(this,arguments);if(this===localStorage&&k===key)queuePush();return out};
 window.StockFlowCloud={pull,push,sync:async()=>{try{await push();return true}catch(e){console.warn('Cloud unavailable',e);return false}}};
 window.addEventListener('load',async()=>{try{const exists=await pull();if(!exists)await push();}catch(e){console.warn('Cloud unavailable',e)}});
 window.addEventListener('beforeunload',()=>{if(timer){clearTimeout(timer);push().catch(()=>{})}});
})();