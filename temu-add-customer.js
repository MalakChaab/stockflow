/* Ajout d'une commande cliente à une commande TEMU existante */
(function(){
  const oldOpenTemuDetails=window.openTemuDetails;

  function addButton(tid){
    const box=document.querySelector('#temuDetailModal .actions');
    if(!box || box.querySelector('.add-customer-to-temu')) return;
    const b=document.createElement('button');
    b.type='button';
    b.className='add add-customer-to-temu';
    b.textContent='＋ Ajouter une commande cliente';
    b.onclick=function(){openAddCustomerToTemu(tid)};
    box.insertBefore(b,box.firstChild);
  }

  window.openTemuDetails=function(tid){
    oldOpenTemuDetails(tid);
    setTimeout(()=>addButton(tid),0);
  };

  window.openAddCustomerToTemu=function(tid){
    const t=db.temu.find(x=>x.id===tid);
    if(!t)return;
    let modal=document.querySelector('#addCustomerToTemuModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='addCustomerToTemuModal';
      modal.className='modal hidden';
      document.body.appendChild(modal);
    }
    const already=new Set(t.customerIds||[]);
    const available=db.customers.filter(c=>c.status==='waiting'&&!already.has(c.id));
    modal.innerHTML=`<div class="modal-box"><div class="modal-title"><div><p class="eyebrow">COMMANDE TEMU</p><h2>Ajouter une cliente</h2><p>Sélectionne une commande cliente à ajouter à ${esc(t.ref)}.</p></div><button onclick="this.closest('.modal').classList.add('hidden')">×</button></div><div id="addCustomerCandidates">${available.length?available.map(c=>`<label class="candidate"><input type="checkbox" name="extraCustomer" value="${esc(c.id)}"><span><b>${esc(c.client)}</b><small>#${esc(c.number)} · ${esc(c.date||'')} · ${(c.items||[]).map(i=>esc(i.product)).join(' · ')}</small></span><strong>${money(customerTotal(c))}</strong></label>`).join(''):'<div class="empty">Aucune commande cliente disponible à ajouter.</div>'}</div><div class="total"><span>Nouveau total clientes</span><b id="addCustomerTotal">${money(temuTotal(t))}</b></div><div class="actions"><button type="button" class="cancel" onclick="this.closest('.modal').classList.add('hidden')">Annuler</button><button type="button" class="add" id="confirmAddCustomerToTemu" ${available.length?'':'disabled'}>Ajouter à la commande TEMU</button></div></div>`;
    modal.classList.remove('hidden');
    modal.querySelectorAll('[name=extraCustomer]').forEach(x=>x.onchange=function(){
      let total=temuTotal(t);
      modal.querySelectorAll('[name=extraCustomer]:checked').forEach(ch=>{const c=db.customers.find(x=>x.id===ch.value);if(c)total+=customerTotal(c)});
      const out=modal.querySelector('#addCustomerTotal');if(out)out.textContent=money(total);
    });
    const confirm=modal.querySelector('#confirmAddCustomerToTemu');
    if(confirm)confirm.onclick=function(){
      const ids=[...modal.querySelectorAll('[name=extraCustomer]:checked')].map(x=>x.value);
      if(!ids.length){alert('Sélectionne au moins une commande cliente.');return;}
      t.customerIds=Array.from(new Set([...(t.customerIds||[]),...ids]));
      ids.forEach(cid=>{const c=db.customers.find(x=>x.id===cid);if(c)c.status='grouped';});
      if(save()){
        modal.classList.add('hidden');
        render();
        openTemuDetails(tid);
      }
    };
  };
})();
