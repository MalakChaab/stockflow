/* StockFlow — suppressions sécurisées */
(function(){
  const KEY='stockflow-v5';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{customers:[],temu:[]}}catch(e){return {customers:[],temu:[]}}};
  const write=d=>{localStorage.setItem(KEY,JSON.stringify(d)); if(typeof window.render==='function')window.render()};
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('fr-FR').format(Math.round(Number(n)||0))+' DA';

  function addButton(parent,text,cls,handler){
    const b=document.createElement('button');
    b.type='button'; b.className=cls||'cancel'; b.textContent=text;
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();handler()});
    parent.appendChild(b); return b;
  }

  function decorateCustomer(cid){
    const d=read(), c=d.customers.find(x=>x.id===cid), m=document.querySelector('#customerDetailModal');
    if(!c||!m)return;
    const itemsBox=m.querySelector('.detail-items');
    if(itemsBox){
      [...itemsBox.children].forEach((row,index)=>{
        if(row.querySelector('.delete-item-btn'))return;
        const item=c.items?.[index]; if(!item)return;
        const b=document.createElement('button');
        b.type='button'; b.className='delete-item-btn'; b.title='Supprimer cet article'; b.textContent='🗑️';
        b.addEventListener('click',e=>{
          e.preventDefault();e.stopPropagation();
          if(!confirm(`Supprimer l’article « ${item.product||'Article'} » ?`))return;
          const fresh=read(), cc=fresh.customers.find(x=>x.id===cid); if(!cc)return;
          cc.items=(cc.items||[]).filter(i=>i.id!==item.id);
          if(!cc.items.length){
            fresh.customers=fresh.customers.filter(x=>x.id!==cid);
            fresh.temu=(fresh.temu||[]).map(t=>({...t,customerIds:(t.customerIds||[]).filter(x=>x!==cid)})).filter(t=>(t.customerIds||[]).length);
          }
          write(fresh); m.classList.add('hidden');
        });
        row.appendChild(b);
      });
    }

    let actions=m.querySelector('.delete-actions');
    if(actions)return;
    actions=document.createElement('div'); actions.className='actions delete-actions';
    const footer=m.querySelector('.actions');
    if(footer){footer.parentNode.insertBefore(actions,footer);}
    else m.querySelector('.modal-box')?.appendChild(actions);

    addButton(actions,'🗑️ Supprimer la commande','cancel',()=>{
      if(!confirm(`Supprimer la commande #${c.number||''} de ${c.client||'cette cliente'} ?`))return;
      const fresh=read(); fresh.customers=fresh.customers.filter(x=>x.id!==cid); fresh.temu=(fresh.temu||[]).map(t=>({...t,customerIds:(t.customerIds||[]).filter(x=>x!==cid)})).filter(t=>(t.customerIds||[]).length);
      write(fresh); m.classList.add('hidden');
    });

    addButton(actions,'🗑️ Supprimer le client','cancel',()=>{
      if(!confirm(`Supprimer définitivement le client « ${c.client||''} » et sa commande ?`))return;
      const fresh=read(); fresh.customers=fresh.customers.filter(x=>x.id!==cid); fresh.temu=(fresh.temu||[]).map(t=>({...t,customerIds:(t.customerIds||[]).filter(x=>x!==cid)})).filter(t=>(t.customerIds||[]).length);
      write(fresh); m.classList.add('hidden');
    });
  }

  function decorateTemu(tid){
    const m=document.querySelector('#temuDetailModal'); if(!m)return;
    if(m.querySelector('.delete-temu-actions'))return;
    const actions=document.createElement('div'); actions.className='actions delete-temu-actions';
    const footer=m.querySelector('.actions');
    if(footer)footer.parentNode.insertBefore(actions,footer); else m.querySelector('.modal-box')?.appendChild(actions);
    addButton(actions,'🗑️ Supprimer la commande TEMU','cancel',()=>{
      const fresh=read(), t=fresh.temu.find(x=>x.id===tid); if(!t)return;
      if(!confirm(`Supprimer la commande TEMU « ${t.ref||''} » ? Les commandes clientes seront conservées.`))return;
      const ids=t.customerIds||[];
      fresh.temu=fresh.temu.filter(x=>x.id!==tid);
      fresh.customers=fresh.customers.map(c=>ids.includes(c.id)&&c.status==='grouped'?{...c,status:'waiting'}:c);
      write(fresh); m.classList.add('hidden');
    });
  }

  function hook(name,decorate){
    const wait=setInterval(()=>{
      if(typeof window[name]!=='function')return;
      clearInterval(wait);
      const original=window[name];
      window[name]=function(id){const result=original.apply(this,arguments);setTimeout(()=>decorate(id),0);return result};
    },100);
  }

  hook('openCustomerDetails',decorateCustomer);
  hook('openTemuDetails',decorateTemu);
})();
