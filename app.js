const SUPABASE_URL='https://rugakupxctxbfhbgbksy.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Z2FrdXB4Y3R4YmZoYmdia3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzMwMDcsImV4cCI6MjEwMzIwOTAwN30.mVWan9bB3zu0J-US6XJ-pVJfAffG1wP-D1Ze_G7-YpU';
const {createClient}=supabase; const db=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s); const app=$('#app');
let products=[],cart=JSON.parse(localStorage.getItem('sparkle-cart')||'[]'),user=null,isAdmin=false,currentConv=null;
const fallbackImg='logo.jpg';
function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0})}
function toast(t){let e=document.createElement('div');e.className='toast glass';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.classList.add('show'),20);setTimeout(()=>{e.classList.remove('show');setTimeout(()=>e.remove(),300)},2600)}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function loadProducts(){const {data,error}=await db.from('products').select('*').order('created_at',{ascending:false});if(error){console.error(error);products=[]}else products=data||[];render()}
function render(){app.innerHTML=`<div class="shell"><nav class="nav"><a class="brand" href="#top" style="color:inherit;text-decoration:none"><img src="logo.jpg"><div><strong>Sparkle Stitches</strong><small>Embroidery & Design</small></div></a><div class="nav-actions"><button class="btn ghost" onclick="openAuth()">${user?'Account':'Login'}</button><button class="btn gold" onclick="openCart()">Bag <span id="cartCount">${cart.reduce((a,x)=>a+x.qty,0)}</span></button></div></nav><main id="top"><section class="hero"><div><div class="eyebrow">Handcrafted • Elegant • Made with love</div><h1>Wear your <span>sparkle.</span></h1><p>Premium blouse ari work and embroidery designs crafted to make every celebration feel extraordinary.</p><div class="tools"><button class="btn gold" onclick="document.querySelector('#collection').scrollIntoView({behavior:'smooth'})">Explore designs</button><button class="btn" onclick="openChat()">Chat with us</button><button class="btn" onclick="openCustomOrder()">Custom order</button></div><div class="stats"><div class="stat glass"><b>Handcrafted</b><span class="muted">Fine ari work</span></div><div class="stat glass"><b>Custom orders</b><span class="muted">Made for you</span></div><div class="stat glass"><b>Support</b><span class="muted">Direct chat</span></div></div></div><div class="hero-card glass"><img src="logo.jpg" alt="Sparkle Stitches"></div></section><section class="section" id="collection"><div class="section-head"><div><div class="eyebrow">The collection</div><h2>Signature designs</h2></div><input id="search" class="input search" placeholder="Search designs…" oninput="filterProducts()"></div><div id="products" class="grid"></div></section></main><footer class="footer">© ${new Date().getFullYear()} Sparkle Stitches · Embroidery & Design<br><button class="btn ghost" style="margin-top:12px" onclick="openAdmin()">Admin</button></footer></div><div id="modal" class="modal"></div><style>
.order-card{padding:16px;border-radius:18px;margin-bottom:14px}.order-badge{padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.order-badge.active{background:rgba(212,175,55,.14);color:var(--gold)}.order-badge.shipped{background:rgba(80,150,255,.14);color:#7eb5ff}.order-badge.delivered{background:rgba(70,200,120,.14);color:#72d89a}.order-badge.cancelled{background:rgba(255,80,80,.14);color:#ff8585}.order-items{margin:14px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:10px 0}.order-item,.order-summary{display:flex;justify-content:space-between;gap:12px;padding:6px 0}.order-progress{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:16px 0}.order-step{text-align:center;opacity:.42}.order-step.done{opacity:1}.order-step span{display:block;font-size:16px}.order-step small{display:block;font-size:9px;line-height:1.15}.order-cancelled{padding:12px;border-radius:12px;background:rgba(255,80,80,.1);color:#ff8585;font-weight:700;margin:14px 0}.my-orders{max-height:70vh;overflow:auto;padding-right:2px}
.product-detail{display:grid;gap:16px}.product-detail-img{width:100%;max-height:340px;object-fit:cover;border-radius:18px}.size-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.size-option{display:flex;align-items:center;justify-content:space-between;padding:11px;border:1px solid rgba(255,255,255,.1);border-radius:14px}.size-option.selected{border-color:var(--gold);background:rgba(212,175,55,.08)}.size-admin-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.size-admin-grid label{font-size:12px}.size-price{color:var(--gold);font-weight:700}</style>`;drawProducts()}
function drawProducts(){let q=($('#search')?.value||'').toLowerCase();let list=products.filter(p=>(p.name+' '+p.category+' '+p.description).toLowerCase().includes(q));let el=$('#products');if(!el)return;el.innerHTML=list.length?list.map(p=>`<article class="card glass"><img class="card-img" src="${esc(p.image_url||fallbackImg)}" onerror="this.src='logo.jpg'"><div class="card-body"><div class="tag">${esc(p.category)}</div><h3>${esc(p.name)}</h3><p class="muted">${esc(p.description)}</p><div class="row"><div class="price">${money(p.price)}</div><button class="btn gold" onclick="addToCart('${p.id}')">Add to bag</button></div></div></article>`).join(''):`<div class="empty" style="grid-column:1/-1">No designs yet. Add your first design from the admin panel.</div>`}
function filterProducts(){drawProducts()}
function modal(content){$('#modal').innerHTML=`<div class="modal-box glass">${content}</div>`;$('#modal').classList.add('open');$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()}}
function closeModal(){$('#modal')?.classList.remove('open')}

function productSizePrices(p){
  let x=p?.size_prices;
  if(!x)return {};
  if(typeof x==='object')return x;
  try{return JSON.parse(x)}catch(e){return {}}
}
function productSizes(p){
  const configured=Object.keys(productSizePrices(p)).filter(s=>s);
  return configured.length?configured:['XS','S','M','L','XL','XXL'];
}
function productPriceForSize(p,size){
  const prices=productSizePrices(p);
  return Number(prices[size] ?? p.price ?? 0);
}
function openProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const sizes=productSizes(p);
  const detailTime=p.production_time||p.time_required||p.time_to_make||'Not specified';
  modal(`<div class="modal-head"><div><div class="eyebrow">${esc(p.category||'Design')}</div><h3>${esc(p.name)}</h3></div><button class="btn" onclick="closeModal()">×</button></div><div class="product-detail"><img class="product-detail-img" src="${esc(p.image_url||fallbackImg)}" onerror="this.src='logo.jpg'><p>${esc(p.description||'')}</p><div class="notice"><b>Making time:</b> ${esc(String(detailTime))}</div><div><div class="eyebrow">Choose size</div><div class="size-grid">${sizes.map((s,i)=>`<label class="size-option ${i===0?'selected':''}" onclick="selectSizeOption(this)"><span><input type="radio" name="productSize" value="${esc(s)}" ${i===0?'checked':''}> ${esc(s)}</span><span class="size-price">${money(productPriceForSize(p,s))}</span></label>`).join('')}</div></div><div class="row"><strong id="selectedProductPrice">${money(productPriceForSize(p,sizes[0]))}</strong><button class="btn gold" onclick="addSelectedToCart('${p.id}')">Add to bag</button></div></div>`);
}
function selectSizeOption(el){document.querySelectorAll('.size-option').forEach(x=>x.classList.remove('selected'));el.classList.add('selected')}
function addSelectedToCart(id){const p=products.find(x=>x.id===id),size=document.querySelector('input[name="productSize"]:checked')?.value;if(!p||!size)return;addToCart(id,size);closeModal()}

function addToCart(id){let p=products.find(x=>x.id===id);if(!p)return;let x=cart.find(x=>x.id===id);if(x)x.qty++;else cart.push({id,qty:1});saveCart();toast('Added to your bag ✨')}
function saveCart(){localStorage.setItem('sparkle-cart',JSON.stringify(cart));let c=$('#cartCount');if(c)c.textContent=cart.reduce((a,x)=>a+x.qty,0)}
function openCart(){let rows=cart.map(x=>{let p=products.find(p=>p.id===x.id);return p?`<div class="cart-item"><img src="${esc(p.image_url||fallbackImg)}"><div><b>${esc(p.name)}</b><div class="muted">${money(p.price)}</div></div><div class="qty"><button onclick="changeQty('${p.id}',-1)">−</button><b>${x.qty}</b><button onclick="changeQty('${p.id}',1)">+</button></div></div>`:''}).join('');let total=cart.reduce((a,x)=>{let p=products.find(p=>p.id===x.id);return a+(p?p.price*x.qty:0)},0);modal(`<div class="modal-head"><div><div class="eyebrow">Your selection</div><h3>Shopping bag</h3></div><button class="btn" onclick="closeModal()">×</button></div>${rows||'<div class="empty">Your bag is waiting for something beautiful.</div>'}${rows?`<div class="row" style="padding-top:18px"><b>Total</b><strong style="font-size:25px;color:var(--gold)">${money(total)}</strong></div><button class="btn gold" style="width:100%;margin-top:15px" onclick="checkout()">Continue to checkout</button>`:''}`)}
function changeQty(id,d){let x=cart.find(x=>x.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);saveCart();openCart()}

function orderStatusLabel(status){
  const map={RECEIVED:'Order received',PROCESSING:'Processing',EMBROIDERY:'Embroidery',READY:'Ready for dispatch',SHIPPED:'Shipped',DELIVERED:'Delivered',CANCELLED:'Cancelled'};
  return map[status]||status||'Order received';
}
function orderStatusClass(status){
  return status==='CANCELLED'?'cancelled':status==='DELIVERED'?'delivered':status==='SHIPPED'?'shipped':'active';
}
function orderSteps(status){
  const steps=['RECEIVED','PROCESSING','EMBROIDERY','READY','SHIPPED','DELIVERED'];
  if(status==='CANCELLED')return `<div class="order-cancelled">✕ Order cancelled</div>`;
  const current=Math.max(0,steps.indexOf(status));
  return `<div class="order-progress">${steps.map((s,i)=>`<div class="order-step ${i<=current?'done':''}"><span>${i<current?'✓':i===current?'●':'○'}</span><small>${orderStatusLabel(s)}</small></div>`).join('')}</div>`;
}
async function openMyOrders(){
  if(!user){openAuth();return}
  const {data:orders,error}=await db.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
  if(error)return toast(error.message);
  const ids=(orders||[]).map(o=>o.id);
  let items=[];
  if(ids.length){
    const r=await db.from('order_items').select('*').in('order_id',ids);
    if(r.error)return toast(r.error.message);
    items=r.data||[];
  }
  const cards=(orders||[]).map(o=>{
    const its=items.filter(i=>i.order_id===o.id);
    return `<article class="order-card glass">
      <div class="row"><div><div class="eyebrow">Order</div><b>#${esc(o.id.slice(0,8).toUpperCase())}</b></div><span class="order-badge ${orderStatusClass(o.order_status)}">${esc(orderStatusLabel(o.order_status))}</span></div>
      <div class="muted" style="margin-top:6px">${new Date(o.created_at).toLocaleString('en-IN')}</div>
      <div class="order-items">${its.map(i=>`<div class="order-item"><span>${esc(i.product_name)} × ${i.quantity}</span><b>${money(Number(i.unit_price)*Number(i.quantity))}</b></div>`).join('')||'<div class="muted">Order details unavailable.</div>'}</div>
      ${orderSteps(o.order_status)}
      <div class="order-summary"><span>Payment: <b>${esc(o.payment_status||'PENDING')}</b></span><strong>${money(o.total_amount)}</strong></div>
      ${o.order_status==='CANCELLED'?'<div class="notice">This order was cancelled. Please contact support if you need help.</div>':''}
    </article>`;
  }).join('');
  modal(`<div class="modal-head"><div><div class="eyebrow">Your account</div><h3>My Orders</h3></div><button class="btn" onclick="closeModal()">×</button></div>
  <div class="my-orders">${cards||'<div class="empty">You have not placed any orders yet.</div>'}</div>`);
}

function openAuth(){if(user){modal(`<div class="modal-head"><div><div class="eyebrow">Welcome back</div><h3>${esc(user.email)}</h3></div><button class="btn" onclick="closeModal()">×</button></div><div class="form"><button class="btn gold" style="width:100%" onclick="openMyOrders()">📦 My Orders</button><button class="btn" style="width:100%" onclick="signOut()">Sign out</button></div>`);return}modal(`<div class="modal-head"><div><div class="eyebrow">Secure access</div><h3>Sign in</h3></div><button class="btn" onclick="closeModal()">×</button></div><p class="muted">Use a six-digit email OTP. No password needed.</p><div class="form"><input id="email" class="input" type="email" placeholder="you@example.com"><button class="btn gold" onclick="sendEmailOtp()">Send email OTP</button><div class="notice">Phone OTP is designed into the app, but SMS delivery needs an SMS provider. Since we're keeping your launch cost at ₹0, email OTP is enabled first.</div></div>`)}
async function sendEmailOtp(){let email=$('#email').value.trim();if(!email)return toast('Enter your email');let {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)return toast(error.message);modal(`<div class="eyebrow">Check your inbox</div><h3>Enter your OTP</h3><p class="muted">We sent a 6-digit code to ${esc(email)}.</p><div class="form"><input id="otpEmail" class="input otp" maxlength="6" inputmode="numeric" placeholder="••••••"><button class="btn gold" onclick="verifyEmailOtp('${esc(email)}')">Verify & continue</button></div>`)}
async function verifyEmailOtp(email){let token=$('#otpEmail').value.trim();let {data,error}=await db.auth.verifyOtp({email,token,type:'email'});if(error)return toast(error.message);user=data.user;await refreshAdmin();closeModal();toast('Welcome to Sparkle Stitches ✨');render()}
async function signOut(){await db.auth.signOut();user=null;isAdmin=false;closeModal();render()}
async function refreshAdmin(){if(!user){isAdmin=false;return}let {data}=await db.rpc('is_admin');isAdmin=!!data}
async function checkout(){if(!user){closeModal();openAuth();return}if(!cart.length)return;let total=cart.reduce((a,x)=>{let p=products.find(p=>p.id===x.id);return a+(p?p.price*x.qty:0)},0);modal(`<div class="modal-head"><div><div class="eyebrow">Almost yours</div><h3>Checkout</h3></div><button class="btn" onclick="closeModal()">×</button></div><form class="form" onsubmit="placeOrder(event,${total})"><div class="two"><input class="input" name="name" placeholder="Full name" required><input class="input" name="phone" placeholder="Mobile number" required></div><textarea class="textarea" name="address" placeholder="Full delivery address" rows="3" required></textarea><div class="two"><input class="input" name="city" placeholder="City" required><input class="input" name="pincode" placeholder="PIN code" required></div><select class="select" name="payment"><option value="COD">Cash on Delivery</option><option value="UPI_MANUAL">UPI — payment confirmation</option></select><div class="notice">Total: <b>${money(total)}</b><br><span class="muted">UPI gateway can be connected later without redesigning the store. Admin can mark payment as paid after checking the reference.</span></div><button class="btn gold" type="submit">Place order</button></form>`)}
async function placeOrder(e,total){e.preventDefault();let f=new FormData(e.target);let {data:order,error}=await db.from('orders').insert({user_id:user.id,customer_name:f.get('name'),customer_email:user.email,customer_phone:f.get('phone'),address:f.get('address'),city:f.get('city'),pincode:f.get('pincode'),total_amount:total,payment_method:f.get('payment')}).select().single();if(error)return toast(error.message);let items=cart.map(x=>{let p=products.find(p=>p.id===x.id);return {order_id:order.id,product_id:p.id,product_name:p.name,unit_price:p.price,quantity:x.qty}});let r=await db.from('order_items').insert(items);if(r.error)return toast(r.error.message);cart=[];saveCart();closeModal();toast('Order placed successfully ✨')}

async function openCustomOrder(){
  if(!user){openAuth();return}
  modal(`<div class="modal-head"><div><div class="eyebrow">Made for you</div><h3>Custom order</h3></div><button class="btn" onclick="closeModal()">×</button></div><form id="customOrderForm" class="form"><textarea class="textarea" name="message" rows="6" maxlength="1500" placeholder="Describe your design, colours, measurements, blouse work or anything you want us to know…" required></textarea><label class="muted">Upload up to 3 reference photos</label><input class="input" id="customPhotos" name="photos" type="file" accept="image/*" multiple><div class="muted">Maximum 3 photos, 8 MB each.</div><button class="btn gold" type="submit">Send custom request</button></form>`);
  $('#customPhotos').onchange=e=>{if(e.target.files.length>3){e.target.value='';toast('Maximum 3 photos allowed')}};
  $('#customOrderForm').onsubmit=async e=>{
    e.preventDefault();const files=[...(e.target.querySelector('[name="photos"]').files||[])];
    if(files.length>3)return toast('Maximum 3 photos');
    try{
      const urls=[];
      for(const f of files){
        if(!f.type.startsWith('image/')||f.size>8*1024*1024)throw new Error('Each photo must be an image under 8 MB');
        const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
        const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
        const up=await db.storage.from('custom-order-images').upload(path,f,{upsert:false,contentType:f.type});
        if(up.error)throw up.error;
        urls.push(db.storage.from('custom-order-images').getPublicUrl(path).data.publicUrl);
      }
      const r=await db.from('custom_orders').insert({user_id:user.id,message:String(new FormData(e.target).get('message')||'').trim(),photo_urls:urls});
      if(r.error)throw r.error;
      closeModal();toast('Custom request sent ✨');
    }catch(err){toast(err.message||'Could not send custom request')}
  };
}

async function openChat(){if(!user){openAuth();return}let {data,error}=await db.from('conversations').select('*').eq('user_id',user.id).order('updated_at',{ascending:false}).limit(1);if(error)return toast(error.message);if(data?.length)currentConv=data[0];else{let r=await db.from('conversations').insert({user_id:user.id}).select().single();if(r.error)return toast(r.error.message);currentConv=r.data}showCustomerChat()}
async function showCustomerChat(){let {data:msgs}=await db.from('messages').select('*').eq('conversation_id',currentConv.id).order('created_at');modal(`<div class="modal-head"><div><div class="eyebrow">Sparkle Stitches</div><h3>Support chat</h3></div><button class="btn" onclick="closeModal()">×</button></div><div id="customerMessages" class="messages glass" style="border-radius:18px">${(msgs||[]).map(m=>`<div class="bubble ${m.sender_id===user.id?'me':'them'}">${esc(m.message)}</div>`).join('')||'<div class="empty">Ask us anything about designs, orders or custom work.</div>'}</div><div class="chat-send"><input id="customerMsg" class="input" placeholder="Type your message…" onkeydown="if(event.key==='Enter')sendCustomerMessage()"><button class="btn gold" onclick="sendCustomerMessage()">Send</button></div>`)}
async function sendCustomerMessage(){let text=$('#customerMsg').value.trim();if(!text)return;await db.from('messages').insert({conversation_id:currentConv.id,sender_id:user.id,message:text});$('#customerMsg').value='';showCustomerChat()}
async function openAdmin(){if(!user){openAuth();return}await refreshAdmin();if(!isAdmin){toast('Admin access is restricted');return}adminHome()}
async function adminHome(){modal(`<div class="modal-head"><div><div class="eyebrow">Private workspace</div><h3>Sparkle Stitches Admin</h3></div><button class="btn" onclick="closeModal()">×</button></div><div class="admin-nav"><button class="btn gold admin-tab" onclick="adminProducts()">Products</button><button class="btn admin-tab" onclick="adminOrders()">Orders & payments</button><button class="btn admin-tab" onclick="adminChats()">Support chat</button></div><div id="adminContent"></div>`);adminProducts()}
async function adminProducts(){let {data}=await db.from('products').select('*').order('created_at',{ascending:false});let rows=(data||[]).map(p=>`<tr><td><img src="${esc(p.image_url||fallbackImg)}" style="width:52px;height:52px;object-fit:cover;border-radius:10px"></td><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.is_active?'Live':'Hidden'}</td><td><button class="btn" onclick="editProduct('${p.id}')">Edit</button></td></tr>`).join('');$('#adminContent').innerHTML=`<div class="row" style="margin-bottom:15px"><div class="muted">Manage names, prices, descriptions and visibility.</div><button class="btn gold" onclick="editProduct()">+ Add design</button></div><div class="table-wrap glass"><table class="table"><tr><th>Image</th><th>Name</th><th>Price</th><th>Status</th><th></th></tr>${rows||'<tr><td colspan="5" class="empty">No products.</td></tr>'}</table></div>`}
async function editProduct(id){
  if(!isAdmin)return toast('Admin access is restricted');
  const p=id?products.find(x=>x.id===id):null;
  let sp={};try{sp=typeof p?.size_prices==='object'?(p.size_prices||{}):JSON.parse(p?.size_prices||'{}')}catch(e){}
  const sizes=['XS','S','M','L','XL','XXL'];
  modal(`<div class="modal-head"><div><div class="eyebrow">Catalog</div><h3>${p?'Edit design':'New design'}</h3></div><button class="btn" onclick="adminHome()">×</button></div><form id="productForm" class="form"><input class="input" name="name" placeholder="Product name" value="${esc(p?.name||'')}" required><div class="two"><input class="input" name="price" type="number" min="0" step="1" placeholder="Default price" value="${p?.price||''}" required><input class="input" name="category" placeholder="Category" value="${esc(p?.category||'Blouse Ari Work')}" required></div><textarea class="textarea" name="description" rows="4" placeholder="Product description">${esc(p?.description||'')}</textarea><input class="input" name="production_time" placeholder="Making time e.g. 3–5 days" value="${esc(p?.production_time||'')}"><label class="muted">Separate price for each size</label><div class="size-admin-grid">${sizes.map(s=>`<label>${s}<input class="input" type="number" min="0" step="1" name="size_${s}" value="${sp[s]??''}" placeholder="₹ price"></label>`).join('')}</div><label class="muted">Product photo</label><input class="input" name="image_file" type="file" accept="image/*"><input class="input" name="image_url" placeholder="Or paste image URL" value="${esc(p?.image_url||'')}"><select class="select" name="active"><option value="true" ${p?.is_active!==false?'selected':''}>Live</option><option value="false" ${p?.is_active===false?'selected':''}>Hidden</option></select><button class="btn gold" type="submit">Save design</button></form>`);
  $('#productForm').onsubmit=e=>saveProduct(e,id);
}
async function saveProduct(e,id){
  e.preventDefault();if(!isAdmin)return toast('Admin access is restricted');
  const f=new FormData(e.target),file=f.get('image_file');
  let imageUrl=String(f.get('image_url')||'').trim()||products.find(x=>x.id===id)?.image_url||fallbackImg;
  try{
    if(file&&file.size){
      if(typeof uploadStorageImage==='function')imageUrl=await uploadStorageImage('product-images',file,'products');
      else if(typeof uploadProductImage==='function')imageUrl=await uploadProductImage(file);
    }
  }catch(err){return toast(err.message||'Photo upload failed')}
  const size_prices={};['XS','S','M','L','XL','XXL'].forEach(s=>{const v=String(f.get('size_'+s)||'').trim();if(v!=='')size_prices[s]=Number(v)});
  const row={name:f.get('name'),price:Number(f.get('price')),category:f.get('category'),description:f.get('description'),production_time:f.get('production_time'),size_prices,image_url:imageUrl,is_active:f.get('active')==='true',updated_at:new Date().toISOString()};
  const r=id?await db.from('products').update(row).eq('id',id):await db.from('products').insert(row);
  if(r.error)return toast(r.error.message);
  await loadProducts();adminHome();toast(id?'Design updated ✨':'Design added ✨');
}
async function adminOrders(){let {data,error}=await db.from('orders').select('*').order('created_at',{ascending:false});if(error)return toast(error.message);$('#adminContent').innerHTML=`<div class="table-wrap glass"><table class="table"><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr>${(data||[]).map(o=>`<tr><td>${o.id.slice(0,8)}<br><span class="muted">${new Date(o.created_at).toLocaleString()}</span></td><td>${esc(o.customer_name)}<br><span class="muted">${esc(o.customer_phone)}</span></td><td>${money(o.total_amount)}</td><td><b>${o.payment_status}</b><br><span class="muted">${o.payment_method}</span></td><td>${o.order_status}</td><td><select class="select" onchange="updateOrder('${o.id}',this.value)"><option>RECEIVED</option><option>PROCESSING</option><option>EMBROIDERY</option><option>READY</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select><button class="btn" style="margin-top:6px" onclick="markPaid('${o.id}')">Mark paid</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No orders yet.</td></tr>'}</table></div>`}
async function updateOrder(id,status){let r=await db.from('orders').update({order_status:status,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)toast(r.error.message);else toast('Order status updated')}
async function markPaid(id){let r=await db.from('orders').update({payment_status:'PAID',updated_at:new Date().toISOString()}).eq('id',id);if(r.error)toast(r.error.message);else adminOrders()}
async function adminChats(){let {data}=await db.from('conversations').select('*').order('updated_at',{ascending:false});$('#adminContent').innerHTML=`<div class="chat glass"><div class="chat-list">${(data||[]).map((c,i)=>`<button class="${i===0?'active':''}" onclick="adminOpenChat('${c.id}',this)">Customer ${c.user_id.slice(0,8)}<br><small class="muted">${new Date(c.updated_at).toLocaleString()}</small></button>`).join('')||'<div class="empty">No chats yet.</div>'}</div><div id="adminChatWindow" class="chat-window"><div class="empty">Select a conversation.</div></div></div>`;if(data?.[0])adminOpenChat(data[0].id)}
async function adminOpenChat(id,btn){currentConv={id};document.querySelectorAll('.chat-list button').forEach(x=>x.classList.remove('active'));btn?.classList.add('active');let {data:msgs}=await db.from('messages').select('*').eq('conversation_id',id).order('created_at');$('#adminChatWindow').innerHTML=`<div class="messages">${(msgs||[]).map(m=>`<div class="bubble ${m.sender_id===user.id?'me':'them'}">${esc(m.message)}</div>`).join('')||'<div class="empty">No messages yet.</div>'}</div><div class="chat-send"><input id="adminMsg" class="input" placeholder="Reply to customer…" onkeydown="if(event.key==='Enter')sendAdminMessage()"><button class="btn gold" onclick="sendAdminMessage()">Send</button></div>`}
async function sendAdminMessage(){let text=$('#adminMsg').value.trim();if(!text)return;await db.from('messages').insert({conversation_id:currentConv.id,sender_id:user.id,message:text});adminChats()}
db.auth.getSession().then(async({data})=>{user=data.session?.user||null;await refreshAdmin();await loadProducts()});db.auth.onAuthStateChange(async(_,session)=>{user=session?.user||null;await refreshAdmin()});
window.openAuth=openAuth;window.openCustomOrder=openCustomOrder;window.openProduct=openProduct;window.openMyOrders=openMyOrders;window.openCart=openCart;window.addToCart=addToCart;window.changeQty=changeQty;window.checkout=checkout;window.placeOrder=placeOrder;window.sendEmailOtp=sendEmailOtp;window.verifyEmailOtp=verifyEmailOtp;window.signOut=signOut;window.openChat=openChat;window.sendCustomerMessage=sendCustomerMessage;window.openAdmin=openAdmin;window.adminHome=adminHome;window.adminProducts=adminProducts;window.adminOrders=adminOrders;window.adminChats=adminChats;window.editProduct=editProduct;window.saveProduct=saveProduct;window.updateOrder=updateOrder;window.markPaid=markPaid;window.adminOpenChat=adminOpenChat;window.sendAdminMessage=sendAdminMessage;window.closeModal=closeModal;
