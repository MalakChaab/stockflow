/* Coût d'achat TEMU en euros, ajoutable/modifiable après création de la commande */
(function(){
  const oldOpenTemuDetails=window.openTemuDetails;
  const euro=n=>Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  function injectCost(tid){
    const box=document.querySelector('#temuDetailModal .temu-detail-summary');
    if(!box)return;
    let card=box.querySelector('.eur-cost-card');
    if(card)card.remove();
    const t=db.temu.find(x=>x.id===tid);if(!t)return;
    card=document.createElement('div');
    card.className='eur-cost-card';
    card.innerHTML=`<span>Coût achat TEMU</span><b>${t.costEur?euro(t.costEur):'Non renseigné'}</b><button type="button" class="soft">${t.costEur?'Modifier':'Ajouter'}</button>`;
    card.querySelector('button').onclick=function(){
      const v=prompt('Coût réel de la commande TEMU en euros (€)',t.costEur??'');
      if(v===null)return;
      const n=parseFloat(String(v).replace(',','.'));
      if(!Number.isFinite(n)||n<0){alert('Montant invalide.');return;}
      t.costEur=Math.round(n*100)/100;
      save();render();openTemuDetails(tid);
    };
    box.appendChild(card);
  }
  window.openTemuDetails=function(tid){
    oldOpenTemuDetails(tid);
    setTimeout(()=>injectCost(tid),0);
  };
})();
