const KEY='stockflow-orders-v1';let orders=JSON.parse(localStorage.getItem(KEY)||'[]');
const $=s=>document.querySelector(s);const money=n=>new Intl.NumberFormat('fr-FR').format(Math.round(n||0))+' DA';
function save(){localStorage.setItem(KEY,JSON.stringify(orders));render()}
function statusText(s){return {pending:'En attente',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'}[s]||s}
function render(){
 const active=orders.filter(o=>o.status!=='cancelled');const revenue=active.reduce((a,o)=>a+o.price*o.quantity,0);const retained=active.reduce((a,o)=>a+(o.price-o.cost)*o.quantity,0);const avg=active.length?revenue/active.length:0;
 $('#statRevenue').textContent=money(revenue);$('#statOrders').textContent=orders.length;$('#statRetained').textContent=money(retained);$('#statAverage').textContent=money(avg);
 const recent=[...orders].sort((a,b)=>b.created-a).slice(0,6);$('#recentOrders').innerHTML=tableHTML(recent,false);
 $('#ordersCount').textContent=`${orders.length} commande${orders.length!==1?'s':''}`;filterOrders();renderChart();renderProducts();
}
function tableHTML(list,actions){if(!list.length)return '<div class="empty">Aucune commande pour le moment.</div>';return `<table class="table"><thead><tr><th>Client</th><th>Produit</th><th>Total</th><th>Statut</th>${actions?'<th></th>':''}</tr></thead><tbody>${list.map(o=>`<tr><td><strong>${esc(o.client)}</strong><br><small>${esc(o.phone||'')}</small></td><td>${esc(o.product)} × ${o.quantity}</td><td>${money(o.price*o.quantity)}</td><td><span class="badge ${o.status}">${statusText(o.status)}</span></td>${actions?`<td><button class="link-btn" onclick="deleteOrder('${o.id}')">Supprimer</button></td>`:''}</tr>`).join('')}</tbody></table>`}
function filterOrders(){const q=($('#searchInput')?.value||'').toLowerCase();const st=$('#statusFilter')?.value||'all';const list=orders.filter(o=>(st==='all'||o.status===st)&&(`${o.client} ${o.product} ${o.phone||''}`.toLowerCase().includes(q)));$('#ordersTable').innerHTML=tableHTML(list,true)}
function renderChart(){const counts=['pending','shipped','delivered','cancelled'].map(s=>[s,orders.filter(o=>o.status===s).length]);const max=Math.max(1,...counts.map(x=>x[1]));$('#statusChart').innerHTML=counts.map(([s,n])=>`<div class="status-row"><div class="status-label"><span>${statusText(s)}</span><strong>${n}</strong></div><div class="bar"><i style="width:${n/max*100}%"></i></div></div>`).join('')}
function renderProducts(){const map={};orders.forEach(o=>map[o.product]=(map[o.product]||0)+o.quantity);const arr=Object.entries(map).sort((a,b)=>b[1]-a[1]);$('#productsList').innerHTML=arr.length?arr.map(([p,n])=>`<div class="product-item"><strong>${esc(p)}</strong><span>${n} unité${n>1?'s':''}</span></div>`).join(''):'<div class="empty">Ajoutez des commandes pour voir vos produits.</div>'}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function openModal(){$('#modal').classList.remove('hidden');$('#orderForm').date.value=new Date().toISOString().slice(0,10)}function closeModal(){$('#modal').classList.add('hidden');$('#orderForm').reset()}
$('#addOrderTop').onclick=openModal;$('#closeModal').onclick=closeModal;$('#cancelModal').onclick=closeModal;$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};$('#searchInput').oninput=filterOrders;$('#statusFilter').onchange=filterOrders;
$('#orderForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);orders.unshift({id:crypto.randomUUID(),created:Date.now(),client:f.get('client'),phone:f.get('phone'),product:f.get('product'),quantity:+f.get('quantity'),price:+f.get('price'),cost:+f.get('cost'),status:f.get('status'),date:f.get('date'),note:f.get('note')});save();closeModal();showView('dashboard')};
function deleteOrder(id){if(confirm('Supprimer cette commande ?')){orders=orders.filter(o=>o.id!==id);save()}}
function showView(v){document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));$(`#${v}View`).classList.remove('hidden');document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#pageTitle').textContent={dashboard:'Tableau de bord',orders:'Commandes',products:'Produits'}[v]}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(orders,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stockflow-commandes.json';a.click();URL.revokeObjectURL(a.href)};
render();
