/* Sparkle Stitches functional enhancements — loaded after the core storefront. */
(function(){
  const SB=window.supabase?.createClient?.('https://rugakupxctxbfhbgbksy.supabase.co','sb_publishable_9QriLUCED36Lf2MbHKsRdQ_NUYNJhGxG');
  if(!SB)return;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
  let currentUser=null;
  function toast(t){let e=document.createElement('div');e.className='toast glass';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.classList.add('show'),20);setTimeout(()=>{e.classList.remove('show');setTimeout(()=>e.remove(),300)},2500)}
  function modal(html){let m=$('#modal');if(!m){m=document.createElement('div');m.id='modal';m.className='modal';document.body.appendChild(m)}m.innerHTML='<div class="modal-box glass">'+html+'</div>';m.classList.add('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')}}
  function close(){let m=$('#modal');if(m)m.classList.remove('open')}
  async function orders(){
    if(!currentUser)return window.openAuth?.();
    let {data,error}=await SB.from('orders').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
    if(error)return toast(error.message);
    modal('<div class="modal-head"><div><div class="eyebrow">Your account</div><h3>My orders</h3></div><button class="btn" onclick="window.__ssClose()">×</button></div>'+
      (data?.length?data.map(o=>`<div class="order-card glass"><div class="row"><b>#${esc(o.id.slice(0,8).toUpperCase())}</b><span class="status">${esc(o.order_status)}</span></div><div class="order-meta"><span>Total <b>${money(o.total_amount)}</b></span><span>Payment <b>${esc(o.payment_status)}</b></span></div><p class="muted small">${new Date(o.created_at).toLocaleString('en-IN')}</p><button class="btn" onclick="window.__ssOrderDetails('${o.id}')">View details</button></div>`).join(''):'<div class="empty">No orders yet.</div>'));
  }
  async function orderDetails(id){
    let {data:o,error}=await SB.from('orders').select('*').eq('id',id).single();
    if(error)return toast(error.message);
    let {data:items}=await SB.from('order_items').select('*').eq('order_id',id);
    modal('<div class="modal-head"><div><div class="eyebrow">Order details</div><h3>#'+esc(o.id.slice(0,8).toUpperCase())+'</h3></div><button class="btn" onclick="window.__ssOrders()">×</button></div>'+
      '<div class="notice"><b>'+esc(o.order_status)+'</b><br>Payment: '+esc(o.payment_status)+' · '+esc(o.payment_method)+(o.payment_reference?'<br>Reference: '+esc(o.payment_reference):'')+
      '</div><div class="order-list">'+(items||[]).map(i=>'<div class="row"><span>'+esc(i.product_name)+' × '+i.quantity+'</span><b>'+money(i.unit_price*i.quantity)+'</b></div>').join('')+
      '</div><p class="muted">Deliver to: '+esc(o.customer_name)+', '+esc(o.address)+', '+esc(o.city)+' - '+esc(o.pincode)+'<br>Phone: '+esc(o.customer_phone)+'</p><button class="btn gold" onclick="window.__ssChat()">Need help? Chat with us</button>');
  }
  function addNav(){
    if(document.querySelector('#ssOrders'))return;
    let nav=document.querySelector('.nav-actions');if(!nav)return;
    let b=document.createElement('button');b.id='ssOrders';b.className='btn ghost';b.textContent='Orders';b.onclick=orders;nav.insertBefore(b,nav.firstChild);
  }
  function removeNav(){document.querySelector('#ssOrders')?.remove()}
  function init(){
    SB.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;if(currentUser)addNav()});
    SB.auth.onAuthStateChange((_,s)=>{currentUser=s?.user||null;if(currentUser)addNav();else removeNav()});
  }
  window.__ssOrders=orders;window.__ssOrderDetails=orderDetails;window.__ssClose=close;window.__ssChat=()=>window.openChat?.();
  init();
})();
