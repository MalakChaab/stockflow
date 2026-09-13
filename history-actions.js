/* StockFlow — historique des suppressions */
(function(){
  const KEY='stockflow-v5';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{customers:[],temu:[],history:[]}}catch(e){return {customers:[],temu:[],history:[]}}};
  const write=d=>{d.history=Array.isArray(d.history)?d.history:[];localStorage.setItem(KEY,JSON.stringify(d));if(typeof window.render==='function')window.render()};
  const money=n=>new Intl.NumberFormat('fr-FR').format(Math.round(Number(n)||0))+' DA';
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const clone=o=>JSON.parse(JSON.stringify(o));
  function archive(d,type,data){d.history=d.history||[];d.history.unshift({id:'hist-'+Date.now()+'-'+Math.random().toString(36).slice(2),type,deletedAt:new Date().toISOString(),data:clone(data)});}

  function renderHistory(){
    const box=document.querySelector('#historyList');if(!box)return;
    const d=read(), h=d.history||[];
    if(!h.length){box.innerHTML='<div class="empty big-empty">Aucune suppression dans l’historique.<br><small>Les commandes supprimées ici resteront consultables dans cette section.</small></div>';return}
    box.innerHTML=h.map(x=>{
      const date=new Date(x.deletedAt).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'});
      if(x.type==='item')return `<article class="history-card"><div><span class="badge">Article supprimé</span><h3>${esc(x.data.product||'Article')}</h3><p>${esc(x.data.client||'')} · quantité ×${esc(x.data.quantity||1)} · ${money((+x.data.price||0)*(+x.data.quantity||1))}</p><small>${esc(date)}</small></div><button class="add" onclick="restoreHistory('${x.id}')">↩ Restaurer</button></article>`;
      if(x.type==='temu')return `<article class="history-card"><div><span class="badge">Commande TEMU supprimée</span><h3>🛍️ ${esc(x.data.ref||'Commande TEMU')}</h3><p>${esc(x.data.date||'')} · ${esc((x.data.customerIds||[]).length)} clientes</p><small>${esc(date)}</small></div><button class="add" onclick="restoreHistory('${x.id}')">↩ Restaurer</button></article>`;
      return `<article class="history-card"><div><span class="badge">Commande supprimée</span><h3>#${esc(x.data.number||'')} · ${esc(x.data.client||'Client')}</h3><p>${esc(x.data.phone||'')} · ${(x.data.items||[]).length} article(s) · ${money((x.data.items||[]).reduce((s,i)=>s+(+i.price||0)*(+i.quantity||0),0))}</p><small>${esc(date)} · statut : ${esc(x.data.status||'')}</small></div><button class="add" onclick="restoreHistory('${x.id}')">↩ Restaurer</button></article>`;
    }).join('');
  }

  window.restoreHistory=function(hid){
    const d=read(), entry=(d.history||[]).find(x=>x.id===hid);if(!entry)return;
    if(!confirm('Restaurer cet élément dans StockFlow ?'))return;
    if(entry.type==='item'){
      const c=d.customers.find(x=>x.id===entry.data.customerId);
      if(!c){alert('La cliente n’existe plus. Impossible de restaurer uniquement cet article.');return}
      c.items=c.items||[];c.items.push(clone(entry.data.item));
      if(c.status==='received')c.status='waiting';
    }else if(entry.type==='customer'){
      if(!d.customers.some(c=>c.id===entry.data.id))d.customers.push(clone(entry.data));
    }else if(entry.type==='temu'){
      if(!d.temu.some(t=>t.id===entry.data.id))d.temu.push(clone(entry.data));
    }
    d.history=d.history.filter(x=>x.id!==hid);write(d);renderHistory();
  };

  function ensureUI(){
    const nav=document.querySelector('aside nav');
    if(nav&&!document.querySelector('[data-view="history"]')){
      const b=document.createElement('button');b.className='nav';b.dataset.view='history';b.innerHTML='↺<span>Historique</span>';nav.appendChild(b);
      b.addEventListener('click',()=>showHistory());
    }
    if(!document.querySelector('#history')){
      const main=document.querySelector('main');
      if(main){const s=document.createElement('section');s.id='history';s.className='view hidden';s.innerHTML='<div class="section-head"><div><p class="eyebrow">ARCHIVES</p><h2>Historique</h2><p>Retrouve les commandes et articles que tu as supprimés.</p></div><button class="cancel" onclick="clearHistory()">🗑️ Vider l’historique</button></div><div id="historyList" class="history-list"></div>';main.appendChild(s)}
    }
  }
  function showHistory(){
    document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
    document.querySelector('#history')?.classList.remove('hidden');
    document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view==='history'));
    const title=document.querySelector('#title');if(title)title.textContent='Historique';
    renderHistory();
  }
  window.clearHistory=function(){const d=read();if(!(d.history||[]).length)return;if(!confirm('Vider tout l’historique ? Cette action est définitive.'))return;d.history=[];write(d);renderHistory()};

  window.StockFlowHistory={read,write,archive,renderHistory};
  const timer=setInterval(()=>{if(typeof window.render==='function'){clearInterval(timer);ensureUI();renderHistory()}},100);
})();
