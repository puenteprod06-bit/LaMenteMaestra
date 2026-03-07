
// ============================================================
//  CONFIG
// ============================================================
const ADMIN_EMAIL='admin@turestaurante.com';
const CAJA_TABLE_ID=1; // Mesa 1 = CAJA

function toggleSidebar(){

 const sidebar = document.getElementById("sidebar")
 const main = document.getElementById("main-app")

 sidebar.classList.toggle("collapsed")
 main.classList.toggle("collapsed")

}

// ============================================================
//  REGISTRATION + SESSION
// ============================================================
function switchLoginTab(tab){
  const ownerBtn = document.getElementById('tab-owner');
  const clientBtn = document.getElementById('tab-client');

  if(tab === 'owner'){
    // Estilo Activo para Propietario
    ownerBtn.style.background = 'var(--accent)';
    ownerBtn.style.color = '#000';
    ownerBtn.style.fontWeight = '700';
    
    // Estilo Inactivo para Cliente
    clientBtn.style.background = 'transparent';
    clientBtn.style.color = 'var(--text2)';
    clientBtn.style.fontWeight = '600';
    
    document.getElementById('owner-form').style.display = '';
    document.getElementById('client-form').style.display = 'none';
  } else {
    // Estilo Activo para Cliente
    clientBtn.style.background = 'var(--accent)';
    clientBtn.style.color = '#000';
    clientBtn.style.fontWeight = '700';
    
    // Estilo Inactivo para Propietario
    ownerBtn.style.background = 'transparent';
    ownerBtn.style.color = 'var(--text2)';
    ownerBtn.style.fontWeight = '600';
    
    document.getElementById('owner-form').style.display = 'none';
    document.getElementById('client-form').style.display = '';
  }
}
function showOwnerLogin(){document.getElementById('owner-register-form').style.display='none';document.getElementById('owner-login-form').style.display='';}
function showOwnerRegister(){document.getElementById('owner-register-form').style.display='';document.getElementById('owner-login-form').style.display='none';}

function checkRegistration() {
  const reg = localStorage.getItem('mente_maestra_registration');
  const regWall = document.getElementById('register-wall');
  const sidebar = document.getElementById('sidebar');
  const mainApp = document.getElementById('main-app');
  const userInfo = document.getElementById('user-info');

  if (!reg) {
    // Si no hay sesión, mostramos la pared de registro/login
    regWall.style.display = 'flex';
    sidebar.style.display = 'none';
    mainApp.style.display = 'none';

    const hasAcc = localStorage.getItem('mente_maestra_accounts');
    if (hasAcc && JSON.parse(hasAcc).length > 0) {
      showOwnerLogin();
    }
    return false;
  }

  // Si hay sesión, procesamos los datos del usuario
  const d = JSON.parse(reg);

  // Reemplazamos el emoji 👤 por un avatar circular con icono dorado
  userInfo.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; padding:10px;">
      <div style="
        width:36px; height:36px; 
        background: rgba(200, 169, 106, 0.15); 
        border: 1px solid rgba(200, 169, 106, 0.4); 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      ">
        <span class="material-symbols-rounded" style="color:#ffd98a; font-size:20px;">person</span>
      </div>
      <div style="display:flex; flex-direction:column; overflow:hidden;">
        <strong style="
          color:#fff; 
          font-size:0.85rem; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis;
        ">
          ${d.name}
        </strong>
        <small style="
          color:var(--text3); 
          font-size:0.72rem; 
          text-transform: capitalize;
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis;
        ">
          ${d.email || d.role || 'Usuario'}
        </small>
      </div>
    </div>
  `;

  return true;
}

function doRegister(){
  const r=document.getElementById('reg-restaurant').value.trim();
  const n=document.getElementById('reg-name').value.trim();
  const e=document.getElementById('reg-email').value.trim();
  const pw=document.getElementById('reg-pass').value;
  const p=document.getElementById('reg-phone').value.trim();
  const err=document.getElementById('reg-error');
  if(!r||!n||!e||!pw){err.textContent='Completá todos los campos con *';err.style.display='block';return;}
  if(!e.includes('@')||!e.includes('.')){err.textContent='Email inválido';err.style.display='block';return;}
  if(pw.length<6){err.textContent='La contraseña debe tener al menos 6 caracteres';err.style.display='block';return;}
  // Save account
  const accounts=JSON.parse(localStorage.getItem('mente_maestra_accounts')||'[]');
  if(accounts.find(a=>a.email===e)){err.textContent='Ya existe una cuenta con ese email';err.style.display='block';return;}
  const data={restaurant:r,name:n,email:e,password:btoa(pw),phone:p,registeredAt:new Date().toISOString(),role:'owner'};
  accounts.push(data);
  localStorage.setItem('mente_maestra_accounts',JSON.stringify(accounts));
  localStorage.setItem('mente_maestra_registration',JSON.stringify(data));
  S.config.name=r;S.config.phone=p||S.config.phone;saveState();
  const subj=encodeURIComponent('Nuevo Registro La Mente Maestra - '+r);
  const body=encodeURIComponent(`Restaurante: ${r}\nNombre: ${n}\nEmail: ${e}\nTeléfono: ${p||'N/A'}\nFecha: ${data.registeredAt}`);
  try{window.open(`mailto:${ADMIN_EMAIL}?subject=${subj}&body=${body}`,'_blank');}catch(x){}
  bootApp(data);
}

function doOwnerLogin(){
  const e=document.getElementById('login-email').value.trim();
  const pw=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');
  const accounts=JSON.parse(localStorage.getItem('mente_maestra_accounts')||'[]');
  const acc=accounts.find(a=>a.email===e&&a.password===btoa(pw));
  if(!acc){err.textContent='Email o contraseña incorrectos';err.style.display='block';return;}
  localStorage.setItem('mente_maestra_registration',JSON.stringify(acc));
  bootApp(acc);
}

function doClientLogin(){
  const restaurant=document.getElementById('client-restaurant').value.trim();
  const name=document.getElementById('client-name').value.trim();
  const pin=document.getElementById('client-pin').value.trim();
  const err=document.getElementById('client-error');
  if(!name||!pin){err.textContent='Ingresá tu nombre y PIN';err.style.display='block';return;}
  // Check PIN against employees
  const emp=S.employees.find(e=>e.pin===pin&&e.active);
  if(!emp){err.textContent='PIN incorrecto o empleado inactivo';err.style.display='block';return;}
  const data={restaurant:restaurant||S.config.name,name:name||emp.name,email:'',role:emp.role,employeeId:emp.id,registeredAt:new Date().toISOString(),isClient:true};
  localStorage.setItem('mente_maestra_registration',JSON.stringify(data));
  bootApp(data);
}

function bootApp(data){
  document.getElementById('register-wall').style.display='none';
  document.getElementById('sidebar').style.display='';
  document.getElementById('main-app').style.display='';
  document.getElementById('user-info').innerHTML=`<strong>👤 ${data.name}</strong><small>${data.email||data.role||''}</small>`;
  toast(`¡Bienvenido, ${data.name}!`,'success');
  render();
}

function doLogout(){
  if(!confirm('¿Cerrar sesión? Los datos se mantienen.'))return;
  localStorage.removeItem('mente_maestra_registration');
  location.reload();
}

function showResetPassword(){
document.getElementById("owner-login-form").style.display="none";
document.getElementById("owner-register-form").style.display="none";
document.getElementById("reset-password-form").style.display="block";
}

function showOwnerLogin(){
document.getElementById("reset-password-form").style.display="none";
document.getElementById("owner-register-form").style.display="none";
document.getElementById("owner-login-form").style.display="block";
}

function sendResetEmail(){
const email = document.getElementById("reset-email").value;
if(!email){
alert("Ingresá tu email");
return;
}
alert("Se enviará un enlace de recuperación a " + email);
}





// ============================================================
//  STATE
// ============================================================
const DEFAULT_STATE={
  config:{name:'Mi Restaurante',currency:'$',taxRate:21,address:'Av. Principal #123',phone:'',ticketFooter:'¡Gracias por su visita!'},
  categories:[{id:1,name:'Entradas',emoji:'🥗'},{id:2,name:'Platos Fuertes',emoji:'🥩'},{id:3,name:'Pastas',emoji:'🍝'},{id:4,name:'Pizzas',emoji:'🍕'},{id:5,name:'Postres',emoji:'🍰'},{id:6,name:'Bebidas',emoji:'🥤'},{id:7,name:'Cócteles',emoji:'🍹'},{id:8,name:'Ensaladas',emoji:'🥬'},{id:9,name:'Sopas',emoji:'🍲'},{id:10,name:'Infantil',emoji:'🧒'}],
  menuItems:[
    {id:1,catId:1,name:'Nachos Supreme',price:120,cost:40,emoji:'🌮',available:true},{id:2,catId:1,name:'Alitas BBQ',price:150,cost:55,emoji:'🍗',available:true},{id:3,catId:1,name:'Bruschetta',price:95,cost:30,emoji:'🥖',available:true},
    {id:4,catId:2,name:'Ribeye 350g',price:420,cost:180,emoji:'🥩',available:true},{id:5,catId:2,name:'Salmón Grillé',price:350,cost:150,emoji:'🐟',available:true},{id:6,catId:2,name:'Pollo Cordon Bleu',price:280,cost:95,emoji:'🍗',available:true},
    {id:7,catId:3,name:'Carbonara',price:195,cost:60,emoji:'🍝',available:true},{id:8,catId:3,name:'Bolognesa',price:175,cost:55,emoji:'🍝',available:true},
    {id:9,catId:4,name:'Margarita',price:180,cost:50,emoji:'🍕',available:true},{id:10,catId:4,name:'Pepperoni',price:200,cost:65,emoji:'🍕',available:true},{id:11,catId:4,name:'4 Quesos',price:210,cost:70,emoji:'🍕',available:true},
    {id:12,catId:5,name:'Tiramisú',price:110,cost:35,emoji:'🍰',available:true},{id:13,catId:5,name:'Brownie',price:95,cost:25,emoji:'🍫',available:true},
    {id:14,catId:6,name:'Agua Mineral',price:35,cost:8,emoji:'💧',available:true},{id:15,catId:6,name:'Refresco',price:40,cost:10,emoji:'🥤',available:true},{id:16,catId:6,name:'Jugo Natural',price:55,cost:18,emoji:'🧃',available:true},
    {id:17,catId:7,name:'Margarita Cocktail',price:140,cost:45,emoji:'🍹',available:true},{id:18,catId:7,name:'Mojito',price:130,cost:40,emoji:'🍸',available:true},
    {id:19,catId:8,name:'César',price:135,cost:40,emoji:'🥗',available:true},{id:20,catId:8,name:'Griega',price:125,cost:38,emoji:'🥗',available:true},
    {id:21,catId:9,name:'Crema de Elote',price:85,cost:25,emoji:'🍲',available:true},{id:22,catId:10,name:'Mini Hamburguesa',price:95,cost:30,emoji:'🍔',available:true},{id:23,catId:2,name:'Tacos al Pastor',price:160,cost:50,emoji:'🌮',available:true},
    {id:24,catId:2,name:'Hamburguesa Clásica 120g',price:1900,cost:580,emoji:'🍔',available:true,ingredients:[{invId:2,qty:1}]},
    {id:25,catId:2,name:'Hamburguesa Gourmet 180g',price:2800,cost:850,emoji:'🍔',available:true,ingredients:[{invId:1,qty:1}]},
    {id:26,catId:2,name:'Hamburguesa Premium 220g',price:3800,cost:1200,emoji:'🍔',available:true,ingredients:[{invId:3,qty:1}]},
    {id:27,catId:2,name:'Doble Hamburguesa 360g',price:4200,cost:1700,emoji:'🍔',available:true,ingredients:[{invId:1,qty:2}]}
  ],
  tables:[
    {id:1,capacity:0,status:'free',orderId:null,openedAt:null,isCaja:true},
    ...Array.from({length:12},(_,i)=>({id:i+2,capacity:[4,4,6,2,4,8,2,4,6,4,2,4][i],status:'free',orderId:null,openedAt:null,isCaja:false}))
  ],
  orders:[],orderCounter:1000,
  currentOrder:{items:[],tableId:null,customer:'',type:'dine-in',discount:0},
  inventory:[
    {id:1,name:'Medallones de Hamburguesa 180g',stock:80,minStock:20,unit:'unidad',cost:850,salePrice:2800,category:'Carnes',expirationDate:'2026-04-10',notes:'180g c/u',showInPOS:true,emoji:'🍔'},
    {id:2,name:'Medallones de Hamburguesa 120g',stock:60,minStock:15,unit:'unidad',cost:580,salePrice:1900,category:'Carnes',expirationDate:'2026-04-10',notes:'120g c/u',showInPOS:true,emoji:'🍔'},
    {id:3,name:'Medallones Premium 220g',stock:40,minStock:10,unit:'unidad',cost:1200,salePrice:3800,category:'Carnes',expirationDate:'2026-04-08',notes:'220g premium',showInPOS:true,emoji:'🍔'},
    {id:4,name:'Queso Mozzarella (kg)',stock:10,minStock:3,unit:'kg',cost:3200,salePrice:6000,category:'Lácteos',expirationDate:'2026-03-12',showInPOS:false,emoji:'🧀'},
    {id:5,name:'Pasta Seca (kg)',stock:20,minStock:5,unit:'kg',cost:450,salePrice:1200,category:'Secos',expirationDate:'2026-12-30',showInPOS:false,emoji:'🍝'},
    {id:6,name:'Tomate (kg)',stock:18,minStock:5,unit:'kg',cost:380,salePrice:900,category:'Verduras',expirationDate:'2026-03-09',showInPOS:false,emoji:'🍅'},
    {id:7,name:'Lechuga (unidad)',stock:30,minStock:8,unit:'unidad',cost:280,salePrice:600,category:'Verduras',expirationDate:'2026-03-07',showInPOS:false,emoji:'🥬'},
    {id:8,name:'Harina (kg)',stock:15,minStock:4,unit:'kg',cost:320,salePrice:0,category:'Secos',expirationDate:'2026-10-15',notes:'Uso interno',showInPOS:false,emoji:'🌾'},
    {id:9,name:'Cerveza (botella)',stock:120,minStock:24,unit:'botella',cost:350,salePrice:950,category:'Bebidas',expirationDate:'2026-12-01',showInPOS:true,emoji:'🍺'},
    {id:10,name:'Crema para batir (L)',stock:6,minStock:2,unit:'L',cost:980,salePrice:0,category:'Lácteos',expirationDate:'2026-03-11',notes:'Uso interno',showInPOS:false,emoji:'🥛'}
  ],
  dismissedSuggestions:[],
  customers:[
    {id:1,name:'Carlos Mendoza',phone:'555-1234',email:'carlos@mail.com',visits:12,totalSpent:4850,points:485,notes:'Alérgico a mariscos'},
    {id:2,name:'María García',phone:'555-5678',email:'maria@mail.com',visits:8,totalSpent:3200,points:320,notes:''},
    {id:3,name:'Roberto Sánchez',phone:'555-9012',email:'roberto@mail.com',visits:25,totalSpent:12500,points:1250,notes:'VIP'}
  ],
  employees:[
    {id:1,name:'Juan Pérez',role:'admin',phone:'555-0001',pin:'1234',active:true},
    {id:2,name:'Laura Martínez',role:'cashier',phone:'555-0002',pin:'2345',active:true},
    {id:3,name:'Pedro Ruiz',role:'waiter',phone:'555-0003',pin:'3456',active:true},
    {id:4,name:'Chef Antonio',role:'kitchen',phone:'555-0004',pin:'4567',active:true}
  ],
  notifications:[],
  dismissedAlerts:[],
  dismissedSuggestions:[],
  currentPage:'dashboard',
  _v:2
};

let S=JSON.parse(JSON.stringify(DEFAULT_STATE));

function saveState(){S._v=2;try{localStorage.setItem('mente_maestra_state',JSON.stringify(S));}catch(e){}}
function loadState(){
  try{
    const r=localStorage.getItem('mente_maestra_state');
    if(r){
      const p=JSON.parse(r);
      if(p._v>=2){
        Object.assign(S,p);
        // Merge new DEFAULT_STATE inventory fields (showInPOS, emoji) into loaded state
        S.inventory.forEach(inv=>{
          const def=DEFAULT_STATE.inventory.find(d=>d.id===inv.id);
          if(def){
            if(inv.showInPOS===undefined) inv.showInPOS=def.showInPOS||false;
            if(!inv.emoji) inv.emoji=def.emoji||'📦';
          }
          if(inv.showInPOS===undefined) inv.showInPOS=(inv.salePrice>0);
          if(!inv.emoji) inv.emoji='📦';
        });
        // Merge new DEFAULT_STATE menuItems (ingredients) into loaded state  
        S.menuItems.forEach(mi=>{
          const def=DEFAULT_STATE.menuItems.find(d=>d.id===mi.id);
          if(def&&!mi.ingredients&&def.ingredients) mi.ingredients=def.ingredients;
        });
        // Add new menuItems from DEFAULT_STATE that don't exist yet
        DEFAULT_STATE.menuItems.forEach(def=>{
          if(!S.menuItems.find(m=>m.id===def.id)) S.menuItems.push({...def});
        });
        // Add new inventory items from DEFAULT_STATE that don't exist yet
        DEFAULT_STATE.inventory.forEach(def=>{
          if(!S.inventory.find(i=>i.id===def.id)) S.inventory.push({...def});
        });
        return true;
      }
    }
  }catch(e){}
  return false;
}

const hadState=loadState();
if(!hadState){(function(){const n=Date.now();for(let d=0;d<14;d++){const c=8+Math.floor(Math.random()*12);for(let o=0;o<c;o++){const ic=1+Math.floor(Math.random()*4);const items=[];let sub=0;for(let i=0;i<ic;i++){const mi=S.menuItems[Math.floor(Math.random()*S.menuItems.length)];const q=1+Math.floor(Math.random()*3);items.push({...mi,qty:q,lineTotal:mi.price*q});sub+=mi.price*q;}const tx=Math.round(sub*S.config.taxRate/100);S.orders.push({id:++S.orderCounter,items,subtotal:sub,tax:tx,total:sub+tx,discount:0,type:['dine-in','takeaway','delivery'][Math.floor(Math.random()*3)],tableId:Math.random()>.4?Math.ceil(Math.random()*12)+1:CAJA_TABLE_ID,customer:'',status:'delivered',paymentMethod:['cash','card','transfer'][Math.floor(Math.random()*3)],createdAt:n-d*864e5-Math.floor(Math.random()*864e5),employeeId:2});}}saveState();})();}

// ============================================================
//  BROADCAST + UTILS
// ============================================================
let kCh=null;try{kCh=new BroadcastChannel('gastro_kitchen');}catch(e){}
function broadcast(t,d){if(kCh)try{kCh.postMessage({type:t,data:d});}catch(e){}}
if(kCh)kCh.onmessage=e=>{if(e.data.type==='status_update'){const o=S.orders.find(x=>x.id===e.data.data.orderId);if(o){o.status=e.data.data.status;saveState();render();playSound();}}};
function playSound(){try{const c=new(window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(.3,c.currentTime);g.gain.exponentialRampToValueAtTime(.01,c.currentTime+.5);o.start();o.stop(c.currentTime+.5);}catch(e){}}

const $=id=>document.getElementById(id);
const fmt=n=>`${S.config.currency} ${Number(n).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const now=()=>Date.now();
const today=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();};
const dayMs=864e5;
function uid(){return Date.now()+Math.random()*1000|0;}
function formatDateShort(ds){if(!ds)return'—';return new Date(ds+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'});}

function toast(msg,type='success'){const c=$('toast-container');if(!c)return;const t=document.createElement('div');t.className=`toast ${type}`;t.innerHTML=`${{success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'}[type]||''} ${msg}`;c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(100%)';t.style.transition='.3s';setTimeout(()=>t.remove(),300);},3500);}

function openModal(t,b,f=''){$('modal-title').textContent=t;$('modal-body').innerHTML=b;$('modal-footer').innerHTML=f;$('modal-overlay').classList.add('open');}
function closeModal(){$('modal-overlay').classList.remove('open');$('modal').style.maxWidth='';}
$('modal-overlay').addEventListener('click',e=>{if(e.target===$('modal-overlay'))closeModal();});
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen();}
function updateClock(){const d=new Date();const el=$('clock');if(el)el.textContent=d.toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})+' '+d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});}
setInterval(updateClock,1000);updateClock();

function getExpiringItems(){const td=new Date();td.setHours(0,0,0,0);return S.inventory.map(i=>{if(!i.expirationDate)return null;const exp=new Date(i.expirationDate);exp.setHours(0,0,0,0);const diff=Math.ceil((exp-td)/864e5);let st='good';if(diff<0)st='expired';else if(diff<=3)st='critical';else if(diff<=7)st='soon';if(st==='good')return null;return{...i,daysLeft:diff,expiryStatus:st};}).filter(Boolean).sort((a,b)=>a.daysLeft-b.daysLeft);}

function openKitchenDisplay(){window.open(location.href.split('?')[0]+'?mode=kitchen','GastroKitchen','width=1200,height=800');toast('📺 Cocina abierta','success');}

// ============================================================
//  NOTIFICATIONS SYSTEM
// ============================================================
function addNotif(icon,text,type='info'){
  S.notifications.unshift({id:uid(),icon,text,type,time:Date.now(),read:false});
  if(S.notifications.length>50)S.notifications.length=50;
  updateNotifDot();saveState();
}

function updateNotifDot(){
  const unread=S.notifications.filter(n=>!n.read).length;
  const dot=$('notif-dot');
  if(dot)dot.classList.toggle('hidden',unread===0);
}

function toggleNotifPanel(){
  const p=$('notif-panel');
  const isOpen=p.classList.toggle('open');
  if(isOpen)renderNotifList();
  // Close when clicking outside
  if(isOpen)setTimeout(()=>document.addEventListener('click',closeNotifOnOutside),10);
}

function closeNotifOnOutside(e){
  const p=$('notif-panel');const b=$('notif-btn');
  if(p&&!p.contains(e.target)&&!b.contains(e.target)){p.classList.remove('open');document.removeEventListener('click',closeNotifOnOutside);}
}

function renderNotifList(){
  const list=$('notif-list');if(!list)return;
  if(!S.notifications.length){list.innerHTML='<div class="notif-empty">🔔 Sin notificaciones</div>';return;}
  // Mark all as read
  S.notifications.forEach(n=>n.read=true);updateNotifDot();saveState();
  list.innerHTML=S.notifications.slice(0,20).map(n=>{
    const ago=Math.floor((Date.now()-n.time)/60000);
    const timeStr=ago<1?'Ahora':ago<60?ago+'min':ago<1440?Math.floor(ago/60)+'h':Math.floor(ago/1440)+'d';
    return `<div class="notif-item"><span class="ni-icon">${n.icon}</span><div class="ni-content"><div class="ni-text">${n.text}</div><div class="ni-time">${timeStr}</div></div><div class="ni-close" onclick="removeNotif(${n.id});event.stopPropagation();">✕</div></div>`;
  }).join('');
}

function removeNotif(id){S.notifications=S.notifications.filter(n=>n.id!==id);saveState();renderNotifList();}
function clearAllNotifs(){S.notifications=[];saveState();renderNotifList();updateNotifDot();toast('Notificaciones limpiadas','info');}

// ============================================================
//  NAVIGATION
// ============================================================
document.querySelectorAll('.nav-item').forEach(item=>{item.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));item.classList.add('active');S.currentPage=item.dataset.page;$('page-title').textContent=item.textContent.trim();render();document.getElementById('sidebar').classList.remove('open');});});

function updateBadges(){const pk=S.orders.filter(o=>o.status==='pending'||o.status==='preparing').length;$('badge-kitchen').textContent=pk;$('badge-kitchen').style.display=pk?'inline':'none';const ao=S.orders.filter(o=>o.status!=='delivered'&&o.status!=='cancelled').length;$('badge-orders').textContent=ao;$('badge-orders').style.display=ao?'inline':'none';}

function render(){({dashboard:renderDashboard,pos:renderPOS,menu:renderMenu,tables:renderTables,kitchen:renderKitchen,inventory:renderInventory,customers:renderCustomers,employees:renderEmployees,reports:renderReports,settings:renderSettings}[S.currentPage]||renderDashboard)();updateBadges();saveState();}






// ============================================================
//  DASHBOARD
// ============================================================
function renderDashboard(){
  const ts=today();
  const todayOrders=S.orders.filter(o=>o.createdAt>=ts&&o.status==='delivered'&&o.paymentMethod);
  const weekOrders=S.orders.filter(o=>o.createdAt>=ts-6*dayMs&&o.status==='delivered'&&o.paymentMethod);
  const todayRev=todayOrders.reduce((s,o)=>s+o.total,0);
  const weekRev=weekOrders.reduce((s,o)=>s+o.total,0);
  const ot=S.tables.filter(t=>t.status==='occupied').length;
  const ei=getExpiringItems();

  $('content').innerHTML=`
  <div class="stats-grid">
    <!-- VENTAS HOY -->
    <div class="stat-card" style="cursor:pointer;" onclick="showSalesDetail('today')">
      <div class="top">
        <span class="label">Ventas Hoy</span>
        <div class="icon-box" style="background:rgba(34,197,94,0.1); color:var(--green)">
          <span class="material-symbols-rounded">payments</span>
        </div>
      </div>
      <div class="value">${fmt(todayRev)}</div>
      <div class="change up">
        <span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">receipt</span> 
        ${todayOrders.length} pedidos · <span style="color:var(--accent); font-weight:700;">Ver más</span>
      </div>
    </div>

    <!-- ESTA SEMANA -->
    <div class="stat-card" style="cursor:pointer" onclick="showSalesDetail('week')">
      <div class="top">
        <span class="label">Esta Semana</span>
        <div class="icon-box" style="background:rgba(59,130,246,0.1); color:var(--blue)">
          <span class="material-symbols-rounded">calendar_month</span>
        </div>
      </div>
      <div class="value">${fmt(weekRev)}</div>
      <div class="change up">${weekOrders.length} pedidos registrados</div>
    </div>

    <!-- MESAS -->
    <div class="stat-card">
      <div class="top">
        <span class="label">Ocupación</span>
        <div class="icon-box" style="background:rgba(168,85,247,0.1); color:var(--purple)">
          <span class="material-symbols-rounded">table_restaurant</span>
        </div>
      </div>
      <div class="value">${ot}<small style="font-size:1rem; color:var(--text3);"> / ${S.tables.filter(t=>!t.isCaja).length}</small></div>
      <div class="change" style="color:${ot > 0 ? 'var(--accent)' : 'var(--text3)'}">
        ${ot > 0 ? 'Mesas activas ahora' : 'Salón disponible'}
      </div>
    </div>

    <!-- ALERTAS -->
    <div class="stat-card" style="cursor:pointer" onclick="document.querySelector('[data-page=inventory]').click()">
      <div class="top">
        <span class="label">Alertas</span>
        <div class="icon-box" style="background:${ei.length ? 'rgba(229,62,62,0.1)' : 'rgba(34,197,94,0.1)'}; color:${ei.length ? 'var(--red)' : 'var(--green)'}">
          <span class="material-symbols-rounded">${ei.length ? 'warning' : 'check_circle'}</span>
        </div>
      </div>
      <div class="value" style="color:${ei.length ? 'var(--red)' : 'var(--green)'}">${ei.length}</div>
      <div class="change">${ei.length ? 'Insumos por vencer' : 'Stock al día'}</div>
    </div>
  </div>

  <div class="grid-2">
    <!-- GRÁFICO -->
    <div class="panel">
      <div class="panel-header">
        <h3><span class="material-symbols-rounded" style="font-size:18px; color:var(--accent);">show_chart</span> Rendimiento (7 Días)</h3>
      </div>
      <div class="panel-body"><canvas id="chart-sales"></canvas></div>
    </div>

    <!-- PEDIDOS RECIENTES -->
    <div class="panel">
      <div class="panel-header">
        <h3><span class="material-symbols-rounded" style="font-size:18px; color:var(--accent);">history</span> Pedidos Recientes</h3>
        <button class="btn btn-sm btn-secondary" onclick="showSalesDetail('today')">Ver todos</button>
      </div>
      <div class="panel-body" style="max-height:280px; overflow-y:auto">
        ${S.orders.filter(o=>o.status!=='cancelled').slice(-10).reverse().map(o=>`
          <div class="recent-order-row" onclick="openChargeFromKitchen(${o.id})">
            <div class="order-info">
              <span class="order-id">#${o.id}</span>
              <span class="order-meta">${o.type==='dine-in'?'Mesa '+(o.tableId||''):'Llevar/Deliv.'} · ${o.items.length} ítems</span>
            </div>
            <div class="order-price">${fmt(o.total)}</div>
            <span class="badge badge-${o.status==='delivered'&&o.paymentMethod?'green':o.status==='delivered'?'yellow':'blue'}">
              ${o.status==='delivered'&&o.paymentMethod?'Cobrado':o.status==='delivered'?'Por cobrar':o.status}
            </span>
          </div>
        `).join('')}
        ${S.orders.length === 0 ? '<p style="text-align:center; padding:20px; color:var(--text3);">No hay pedidos hoy</p>' : ''}
      </div>
    </div>
  </div>`;

  // Lógica del Gráfico mejorada en colores
  setTimeout(()=>{
    const c=$('chart-sales'); if(!c) return;
    const w=c.parentElement.clientWidth; c.width=w; c.height=200;
    const ctx=c.getContext('2d');
    const data=[], labels=[];
    for(let d=6; d>=0; d--){
      const s=today()-d*dayMs;
      data.push(S.orders.filter(o=>o.createdAt>=s&&o.createdAt<s+dayMs&&o.status==='delivered').reduce((a,o)=>a+o.total,0));
      labels.push(new Date(s).toLocaleDateString('es-AR',{weekday:'short'}));
    }
    const pad={t:20, r:20, b:40, l:60}, cw=w-pad.l-pad.r, ch=140, mx=Math.max(...data, 1000);
    
    ctx.clearRect(0,0,w,200);
    // Líneas de fondo
    ctx.strokeStyle='rgba(255,255,255,0.05)';
    ctx.lineWidth=1;
    for(let i=0; i<=4; i++){
      const y=pad.t+ch-ch*(i/4);
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
      ctx.fillStyle='#64748b'; ctx.font='10px sans-serif'; ctx.textAlign='right';
      ctx.fillText(Math.round(mx*i/4), pad.l-10, y+4);
    }
    // Etiquetas días
    data.forEach((_,i)=>{
      const x=pad.l+cw*i/(data.length-1);
      ctx.textAlign='center'; ctx.fillText(labels[i], x, 195);
    });
    // Línea de datos (Color Dorado/Amarillo)
    ctx.beginPath(); ctx.strokeStyle='#ffd98a'; ctx.lineWidth=3; ctx.lineJoin='round';
    data.forEach((v,i)=>{
      const x=pad.l+cw*i/(data.length-1), y=pad.t+ch-ch*(v/mx);
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();
    // Relleno degradado
    const g=ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
    g.addColorStop(0,'rgba(255,217,138,0.2)'); g.addColorStop(1,'rgba(255,217,138,0)');
    ctx.lineTo(pad.l+cw, pad.t+ch); ctx.lineTo(pad.l, pad.t+ch);
    ctx.fillStyle=g; ctx.fill();
  },100);
}






// ============================================================
//  POS — Mesa 1 = CAJA for delivery/takeaway
// ============================================================
function getPOSItems(){
  // Merge menuItems + inventory items with showInPOS:true
  const menuPOS=S.menuItems.filter(i=>i.available).map(i=>({
    id:'m'+i.id, origId:i.id, type:'menu',
    name:i.name, price:i.price, cost:i.cost,
    emoji:i.emoji||'🍽️', catId:i.catId, catType:'menu',
    available:i.available, stock:999, ingredients:i.ingredients||[]
  }));
  const invPOS=S.inventory.filter(i=>i.showInPOS&&i.salePrice>0&&i.stock>0).map(i=>({
    id:'inv'+i.id, origId:i.id, type:'inventory',
    name:i.name, price:i.salePrice, cost:i.cost,
    emoji:i.emoji||'📦', catId:'inv_'+i.category, catType:'inventory',
    available:i.stock>0, stock:i.stock, unit:i.unit
  }));
  return [...menuPOS,...invPOS];
}
function getPOSCategories(){
  const menuCats=S.categories;
  const invCats=[...new Set(S.inventory.filter(i=>i.showInPOS&&i.salePrice>0).map(i=>i.category))].map(c=>({id:'inv_'+c,name:c,emoji:'📦',type:'inventory'}));
  return [...menuCats,...invCats];
}
function renderPOS(){
  const allItems=getPOSItems();
  const allCats=getPOSCategories();
  const ac=window._posCat||allCats[0]?.id||1;
  const its=allItems.filter(i=>i.catId===ac||i.catId===(typeof ac==='number'?ac:ac));
  const o=S.currentOrder;
  const sub=o.items.reduce((s,i)=>s+i.price*i.qty,0);
  const da=Math.round(sub*o.discount/100);
  const tx=Math.round((sub-da)*S.config.taxRate/100);
  const tot=sub-da+tx;

  $('content').innerHTML=`<div class="pos-layout"><div class="pos-menu">
    <div style="display:flex;gap:8px;padding:12px 20px;background:var(--bg2);border-bottom:1px solid var(--bg4)">
      <input type="text" placeholder="🔍 Buscar en menú e inventario..." oninput="posSearch(this.value)" style="flex:1">
    </div>
    <div class="pos-categories">
      ${allCats.map(c=>`<button class="pos-cat ${String(c.id)===String(ac)?'active':''}" onclick="window._posCat=${JSON.stringify(c.id)};render()">${c.emoji} ${c.name}${c.type==='inventory'?'<span style="font-size:.6rem;margin-left:3px;opacity:.7">INV</span>':''}</button>`).join('')}
    </div>
    <div class="pos-items" id="pos-items">
      ${its.length===0?'<p style="text-align:center;color:var(--text3);padding:40px;grid-column:1/-1">Sin productos en esta categoría</p>':''}
      ${its.map(i=>{
        const stockPct=i.type==='inventory'?Math.round(i.stock/Math.max(1,(S.inventory.find(x=>x.id===i.origId)||{}).minStock||1)*100):100;
        const stockColor=stockPct<=20?'var(--red)':stockPct<=50?'var(--orange)':'var(--green)';
        return `<div class="pos-item ${i.available?'':'unavailable'}" onclick="addToOrderUnified('${i.id}')">
          <span class="emoji">${i.emoji}</span>
          <div class="name">${i.name}</div>
          <div class="price">${fmt(i.price)}</div>
          ${i.type==='inventory'?`<div style="font-size:.65rem;color:${stockColor};margin-top:2px">Stock: ${i.stock} ${i.unit||''}</div>`:''}
        </div>`;
      }).join('')}
    </div>
  </div><div class="pos-order">
    <div class="pos-order-header"><h3>🧾 #${S.orderCounter+1}</h3><button class="btn btn-sm btn-danger" onclick="clearOrder()">Limpiar</button></div>
    <div class="pos-order-meta">
      <select onchange="S.currentOrder.type=this.value;render()">
        <option value="dine-in" ${o.type==='dine-in'?'selected':''}>🍽️ Mesa</option>
        <option value="takeaway" ${o.type==='takeaway'?'selected':''}>🥡 Llevar</option>
        <option value="delivery" ${o.type==='delivery'?'selected':''}>🛵 Delivery</option>
      </select>
      ${o.type==='dine-in'?`<select onchange="S.currentOrder.tableId=+this.value||null"><option value="">Mesa...</option>${S.tables.filter(t=>!t.isCaja).map(t=>`<option value="${t.id}" ${o.tableId===t.id?'selected':''}>${t.status==='occupied'?'🔴':'🟢'} Mesa ${t.id}</option>`).join('')}</select>`:`<div style="padding:8px 12px;background:var(--bg3);border-radius:8px;font-size:.8rem;color:var(--accent);font-weight:600;">📍 CAJA</div>`}
    </div>
    <div class="pos-order-items">${o.items.length===0?'<p style="text-align:center;color:var(--text3);padding:40px 20px;font-size:.85rem">Seleccioná productos del menú</p>':''}
      ${o.items.map((it,idx)=>`<div class="pos-order-item">
        <div class="info">
          <div class="item-name">${it.emoji||'🍽️'} ${it.name}</div>
          <div class="item-price">${fmt(it.price)} × ${it.qty} = ${fmt(it.price*it.qty)}</div>
          ${it.note?`<div class="item-note">📝 ${it.note}</div>`:''}
        </div>
        <div class="qty-control">
          <button onclick="changeQty(${idx},-1)">−</button>
          <span>${it.qty}</span>
          <button onclick="changeQty(${idx},1)">+</button>
        </div>
        <button style="background:transparent;color:var(--red);border:none;font-size:.9rem;cursor:pointer;padding:4px 8px" onclick="S.currentOrder.items.splice(${idx},1);render()">🗑️</button>
      </div>`).join('')}
    </div>
    <div class="pos-order-totals">
      <div class="total-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
      ${o.discount?`<div class="total-row" style="color:var(--green)"><span>Desc ${o.discount}%</span><span>-${fmt(da)}</span></div>`:''}
      <div class="total-row"><span>IVA ${S.config.taxRate}%</span><span>${fmt(tx)}</span></div>
      <div class="total-row grand"><span>TOTAL</span><span>${fmt(tot)}</span></div>
    </div>
    <div class="pos-order-actions">
      <div style="display:flex;gap:8px">
        <input type="text" placeholder="Cliente (opcional)" value="${o.customer}" onchange="S.currentOrder.customer=this.value" style="flex:1;padding:8px 12px">
        <button class="btn btn-sm btn-secondary" onclick="applyDiscount()">%</button>
      </div>
      <button class="btn btn-primary" onclick="sendToKitchen()" ${o.items.length===0?'disabled style="opacity:.5"':''}>👨‍🍳 Enviar a Cocina</button>
      <button class="btn btn-success" onclick="chargeOrder()" ${o.items.length===0?'disabled style="opacity:.5"':''}>💳 Cobrar ${fmt(tot)}</button>
    </div>
  </div></div>`;
}

function posSearch(q){
  q=q.toLowerCase().trim();
  const allItems=getPOSItems();
  const its=q?allItems.filter(i=>i.name.toLowerCase().includes(q)):allItems.filter(i=>String(i.catId)===String(window._posCat||allItems[0]?.catId));
  $('pos-items').innerHTML=its.map(i=>{
    const inv=i.type==='inventory'?S.inventory.find(x=>x.id===i.origId):null;
    const stockPct=inv?Math.round(inv.stock/Math.max(1,inv.minStock||1)*100):100;
    const sc=stockPct<=20?'var(--red)':stockPct<=50?'var(--orange)':'var(--green)';
    return `<div class="pos-item" onclick="addToOrderUnified('${i.id}')"><span class="emoji">${i.emoji}</span><div class="name">${i.name}</div><div class="price">${fmt(i.price)}</div>${i.type==='inventory'?`<div style="font-size:.65rem;color:${sc}">Stock: ${i.stock} ${i.unit||''}</div>`:''}</div>`;
  }).join('')||'<p style="padding:40px;color:var(--text3);grid-column:1/-1;text-align:center">Sin resultados</p>';
}
function addToOrder(id){const it=S.menuItems.find(i=>i.id===id);if(!it||!it.available)return;const ex=S.currentOrder.items.find(i=>i.id===id&&i.itemType==='menu'&&!i.note);if(ex)ex.qty++;else S.currentOrder.items.push({...it,qty:1,note:'',itemType:'menu'});render();}
function addToOrderUnified(uid){
  // uid is 'm123' for menuItems or 'inv123' for inventory
  if(String(uid).startsWith('inv')){
    const invId=+String(uid).replace('inv','');
    const inv=S.inventory.find(i=>i.id===invId);
    if(!inv||!inv.showInPOS||inv.stock<=0)return toast('Sin stock disponible','error');
    const ex=S.currentOrder.items.find(i=>i.invId===invId&&i.itemType==='inventory');
    if(ex){
      if(ex.qty>=inv.stock)return toast('No hay más stock','warning');
      ex.qty++;
    } else {
      S.currentOrder.items.push({
        id:'inv'+invId, invId:invId, name:inv.name,
        price:inv.salePrice, cost:inv.cost,
        emoji:inv.emoji||'📦', qty:1, note:'',
        itemType:'inventory', unit:inv.unit
      });
    }
  } else {
    const menuId=+String(uid).replace('m','');
    addToOrder(menuId);
    return;
  }
  render();
}
function changeQty(i,d){S.currentOrder.items[i].qty+=d;if(S.currentOrder.items[i].qty<=0)S.currentOrder.items.splice(i,1);render();}
function clearOrder(){S.currentOrder={items:[],tableId:null,customer:'',type:'dine-in',discount:0};render();}
function applyDiscount(){openModal('💸 Descuento',`<div class="form-group"><label>%</label><input type="number" id="disc-in" min="0" max="100" value="${S.currentOrder.discount}"></div>`,`<button class="btn btn-primary" onclick="S.currentOrder.discount=Math.min(100,Math.max(0,+$('disc-in').value));closeModal();render();">OK</button>`);}

// ============================================================
//  INVENTORY DEDUCTION — basado en ingredientes vinculados al plato
// ============================================================
function deductInventory(orderItems){
  orderItems.forEach(oi=>{
    if(oi.itemType==='inventory'&&oi.invId){
      // Item de inventario vendido directamente → descontar stock
      const inv=S.inventory.find(i=>i.id===oi.invId);
      if(inv) inv.stock=Math.max(0, inv.stock - oi.qty);
    } else {
      // Item de menú → descontar por ingredientes configurados
      const menuItem=S.menuItems.find(m=>m.id===oi.id||m.id===oi.origId);
      if(menuItem && menuItem.ingredients && menuItem.ingredients.length){
        menuItem.ingredients.forEach(ing=>{
          const inv=S.inventory.find(i=>i.id===ing.invId);
          if(inv) inv.stock=Math.max(0, inv.stock - (ing.qty * oi.qty));
        });
      }
      // No fallback aleatorio - si no tiene ingredientes configurados, no descuenta
    }
  });
  saveState();
  checkStockAlerts();
}
function checkStockAlerts(){
  S.inventory.forEach(inv=>{
    if(!inv.minStock||inv.minStock<=0)return;
    const pct=Math.round(inv.stock/inv.minStock*100);
    const key='stock_alert_'+inv.id;
    const lastPct=inv._lastAlertPct||100;
    // Alert thresholds: 50%, 40%, 30%, 20%, 10%, 0%
    const thresholds=[50,40,30,20,10,0];
    thresholds.forEach(t=>{
      if(pct<=t && lastPct>t){
        if(t===0){
          toast('🚨 SIN STOCK: '+inv.name,'error');
          addNotif('🚨','SIN STOCK: '+inv.name+' (0 '+inv.unit+')','error');
        } else {
          toast('⚠️ Stock '+t+'%: '+inv.name,'warning');
          addNotif('⚠️','Stock al '+t+'%: '+inv.name+' (quedan '+inv.stock+' '+inv.unit+')','warning');
        }
      }
    });
    inv._lastAlertPct=pct;
  });
  // Also alert if stock == 0
  const out=S.inventory.filter(i=>i.stock===0);
  if(out.length) out.forEach(i=>{if(!i._zeroAlerted){i._zeroAlerted=true;addNotif('🚨','SIN STOCK: '+i.name,'error');}});
  else S.inventory.forEach(i=>{if(i.stock>0)i._zeroAlerted=false;});
}

function sendToKitchen(){
  if(!S.currentOrder.items.length)return toast('Agrega productos','warning');
  deductInventory(S.currentOrder.items);
  const o=finalizeOrder('pending');broadcast('new_order',o);playSound();
  addNotif('🍳',`Pedido #${o.id} enviado a cocina (${o.type})`,'info');
  toast(`Pedido #${o.id} → Cocina`,'success');clearOrder();render();
}

function chargeOrder(){
  if(!S.currentOrder.items.length)return toast('Agrega productos','warning');
  const sub=S.currentOrder.items.reduce((s,i)=>s+i.price*i.qty,0);const da=Math.round(sub*S.currentOrder.discount/100);const tx=Math.round((sub-da)*S.config.taxRate/100);const tot=sub-da+tx;
  openModal('💳 Cobrar',`<div style="text-align:center;margin-bottom:20px"><div class="report-number" style="color:var(--accent)">${fmt(tot)}</div></div>
    <div class="form-group"><label>Método</label><select id="pay-method"><option value="cash">💵 Efectivo</option><option value="card">💳 Tarjeta</option><option value="transfer">📱 Transferencia</option></select></div>
    <div class="form-group"><label>Recibido</label><input type="number" id="pay-recv" value="${tot}" min="0" oninput="const c=this.value-${tot};document.getElementById('pay-change').textContent=c>=0?'Cambio: '+S.config.currency+' '+parseFloat(c).toFixed(2):'Insuficiente';document.getElementById('pay-change').style.color=c>=0?'var(--green)':'var(--red)'"></div>
    <div id="pay-change" style="text-align:center;font-size:1.1rem;font-weight:700;color:var(--green)"></div>
  `,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-success" onclick="processPayment(${tot})">✅ Cobrar</button>`);
}

function processPayment(tot){const m=$('pay-method').value;const r=+$('pay-recv').value;if(m==='cash'&&r<tot)return toast('Insuficiente','error');
  deductInventory(S.currentOrder.items);
  const o=finalizeOrder('delivered');o.paymentMethod=m;const change=m==='cash'?r-tot:0;closeModal();clearOrder();render();addNotif('💰',`Cobro #${o.id}: ${fmt(tot)}`,'success');toast(`✅ Cobro #${o.id}`,'success');printReceipt(o,change);}

function finalizeOrder(status){
  const items=S.currentOrder.items.map(i=>({...i,lineTotal:i.price*i.qty}));const sub=items.reduce((s,i)=>s+i.lineTotal,0);const da=Math.round(sub*S.currentOrder.discount/100);const tx=Math.round((sub-da)*S.config.taxRate/100);const tot=sub-da+tx;
  // Determine table
  const tableId=(S.currentOrder.type==='dine-in')?S.currentOrder.tableId:CAJA_TABLE_ID;
  const order={id:++S.orderCounter,items,subtotal:sub,tax:tx,total:tot,discount:S.currentOrder.discount,discountAmt:da,type:S.currentOrder.type,tableId,customer:S.currentOrder.customer,status,paymentMethod:null,createdAt:now(),employeeId:1};
  S.orders.push(order);
  if(tableId&&status!=='delivered'){const t=S.tables.find(t=>t.id===tableId);if(t){t.status='occupied';t.orderId=order.id;if(!t.openedAt)t.openedAt=now();}}
  if(tableId&&status==='delivered'){const t=S.tables.find(t=>t.id===tableId);if(t&&!t.isCaja){t.status='free';t.orderId=null;t.openedAt=null;}}
  saveState();return order;
}

// ============================================================
//  PRINT & SHARE RECEIPT
// ============================================================
function buildTicketText(order,change=0){
  const disc=order.discountAmt||0;
  const lines=[
    `🍽️ ${S.config.name}`,
    S.config.address||'',
    `📅 ${new Date(order.createdAt).toLocaleString('es-AR')}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Pedido #${order.id} | ${order.type==='dine-in'?'Mesa '+(order.tableId||'-'):order.type==='takeaway'?'Para llevar':'Delivery'}`,
    order.customer?`Cliente: ${order.customer}`:'',
    `━━━━━━━━━━━━━━━━━━━━`,
    ...order.items.map(i=>`${i.qty}x ${i.name}  ${fmt(i.lineTotal)}`),
    `━━━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ${fmt(order.subtotal)}`,
    disc?`Descuento (${order.discount}%): -${fmt(disc)}`:'',
    `IVA ${S.config.taxRate}%: ${fmt(order.tax)}`,
    `TOTAL: ${fmt(order.total)}`,
    order.paymentMethod?`Pago: ${{cash:'Efectivo',card:'Tarjeta',transfer:'Transferencia'}[order.paymentMethod]}`:'',
    change>0?`Cambio: ${fmt(change)}`:'',
    `━━━━━━━━━━━━━━━━━━━━`,
    S.config.ticketFooter||'¡Gracias!'
  ].filter(Boolean).join('\n');
  return lines;
}

function printReceipt(order,change=0){
  if(!order)return;
  const disc=order.discountAmt||0;
  const ticketText=buildTicketText(order,change);
  const waText=encodeURIComponent(ticketText);
  const emailSubj=encodeURIComponent(`Ticket #${order.id} - ${S.config.name}`);
  const emailBody=encodeURIComponent(ticketText);

  const receiptHtml=`<div class="receipt-print">
    <div class="rc-center"><strong style="font-size:15px">${S.config.name}</strong><br>${S.config.address}<br>${S.config.phone}<br><small>${new Date(order.createdAt).toLocaleString('es-AR')}</small></div>
    <div class="rc-line"></div>
    <div>Pedido: <strong>#${order.id}</strong> | ${order.type==='dine-in'?'Mesa '+(order.tableId||'-'):order.type==='takeaway'?'Para llevar':'Delivery'}</div>
    ${order.customer?`<div>Cliente: ${order.customer}</div>`:''}
    <div class="rc-line"></div>
    ${order.items.map(i=>`<div class="rc-row"><span>${i.qty}x ${i.name}</span><span>${fmt(i.lineTotal)}</span></div>`).join('')}
    <div class="rc-line"></div>
    <div class="rc-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
    ${disc?`<div class="rc-row" style="color:green"><span>Desc (${order.discount}%)</span><span>-${fmt(disc)}</span></div>`:''}
    <div class="rc-row"><span>IVA ${S.config.taxRate}%</span><span>${fmt(order.tax)}</span></div>
    <div class="rc-row rc-total"><span>TOTAL</span><span>${fmt(order.total)}</span></div>
    ${order.paymentMethod?`<div>Pago: ${{cash:'Efectivo',card:'Tarjeta',transfer:'Transferencia'}[order.paymentMethod]}</div>`:''}
    ${change>0?`<div>Cambio: ${fmt(change)}</div>`:''}
    <div class="rc-line"></div>
    <div class="rc-center">${S.config.ticketFooter}</div>
  </div>
  <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
    <p style="font-size:.8rem;color:var(--text2);text-align:center;margin-bottom:4px">📤 Compartir ticket</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <a href="https://wa.me/?text=${waText}" target="_blank" class="btn btn-success btn-sm" style="text-decoration:none">📱 WhatsApp</a>
      <a href="mailto:?subject=${emailSubj}&body=${emailBody}" class="btn btn-secondary btn-sm" style="text-decoration:none">📧 Email</a>
      <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard&&navigator.clipboard.writeText(decodeURIComponent('${waText}')).then(()=>toast('Copiado','success'))">📋 Copiar</button>
    </div>
  </div>`;

  openModal('🧾 Recibo #'+order.id,receiptHtml,`<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" onclick="doPrint()">🖨️ Imprimir</button>`);
}

function doPrint(){
  const content=$('modal-body').innerHTML;
  const pa=$('print-area');pa.innerHTML=content;pa.style.display='block';
  window.print();
  setTimeout(()=>{pa.style.display='none';},500);
}

// ============================================================
//  MENU
// ============================================================
function renderMenu(){
  $('content').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px"><div class="search-bar"><i>🔍</i><input placeholder="Buscar..." oninput="filterMenu(this.value)"></div><div style="display:flex;gap:8px"><button class="btn btn-secondary" onclick="openCatModal()">📁 Categorías</button><button class="btn btn-primary" onclick="openMIModal()">+ Plato</button></div></div>
    <div class="tabs" id="menu-tabs"><div class="tab active" onclick="fmCat(0,this)">Todos</div>${S.categories.map(c=>`<div class="tab" onclick="fmCat(${c.id},this)">${c.emoji} ${c.name}</div>`).join('')}</div>
    <div class="panel"><table class="data-table"><thead><tr><th>Plato</th><th>Precio</th><th>Costo</th><th>Margen</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="menu-tbody">
      ${S.menuItems.map(i=>{const m=i.price>0?Math.round((i.price-i.cost)/i.price*100):0;const hasIngs=i.ingredients&&i.ingredients.length>0;return `<tr data-catid="${i.catId}"><td><strong>${i.emoji} ${i.name}</strong>${hasIngs?`<br><span style="font-size:.65rem;color:var(--green)">🧂 ${i.ingredients.length} ingrediente(s) vinculados</span>`:`<br><span style="font-size:.65rem;color:var(--text3)">⚠️ Sin ingredientes — editar para vincular</span>`}</td><td>${fmt(i.price)}</td><td style="color:var(--text3)">${fmt(i.cost)}</td><td style="color:${m>=50?'var(--green)':'var(--red)'}">${m}%</td><td><span class="badge ${i.available?'badge-green':'badge-red'}" style="cursor:pointer" onclick="S.menuItems.find(x=>x.id===${i.id}).available=!S.menuItems.find(x=>x.id===${i.id}).available;render()">${i.available?'OK':'Agotado'}</span></td><td><button class="btn btn-sm btn-secondary" onclick="openMIModal(${i.id})">✏️</button> <button class="btn btn-sm btn-danger" onclick="if(confirm('¿Eliminar?')){S.menuItems=S.menuItems.filter(x=>x.id!==${i.id});render();}">🗑️</button></td></tr>`;}).join('')}
    </tbody></table></div>`;
}
function fmCat(c,el){document.querySelectorAll('#menu-tabs .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.querySelectorAll('#menu-tbody tr').forEach(tr=>tr.style.display=(!c||+tr.dataset.catid===c)?'':'none');}
function filterMenu(q){q=q.toLowerCase();document.querySelectorAll('#menu-tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none');}
function openMIModal(id=null){
  const i=id?S.menuItems.find(x=>x.id===id):null;
  const ings=i&&i.ingredients?i.ingredients:[];
  const ingRows=ings.map((ing,idx)=>{
    const inv=S.inventory.find(v=>v.id===ing.invId);
    return `<div class="ing-row" style="display:flex;gap:6px;align-items:center;margin-bottom:6px" id="ing-row-${idx}">
      <select style="flex:2" id="ing-inv-${idx}">
        <option value="">-- Insumo --</option>
        ${S.inventory.map(v=>`<option value="${v.id}" ${v.id===ing.invId?'selected':''}>${v.name} (${v.stock} ${v.unit})</option>`).join('')}
      </select>
      <input type="number" id="ing-qty-${idx}" value="${ing.qty}" min="0.01" step="0.01" style="width:70px" placeholder="Cant.">
      <button type="button" onclick="this.parentElement.remove()" style="background:var(--red);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer">✕</button>
    </div>`;
  }).join('');

  const body=`
    <div class="form-group"><label>Nombre</label><input id="mi-n" value="${i?i.name:''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Precio Venta ($)</label><input type="number" id="mi-p" value="${i?i.price:''}" min="0"></div>
      <div class="form-group"><label>Costo ($)</label><input type="number" id="mi-c" value="${i?i.cost:''}" min="0"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Categoría</label><select id="mi-cat">${S.categories.map(c=>`<option value="${c.id}" ${i&&i.catId===c.id?'selected':''}>${c.emoji} ${c.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Emoji</label><input id="mi-e" value="${i?i.emoji:'🍽️'}" maxlength="4"></div>
    </div>
    <div class="form-group">
      <label style="display:flex;justify-content:space-between;align-items:center">
        🧂 Ingredientes (descuento de inventario)
        <button type="button" class="btn btn-sm btn-secondary" onclick="addIngRow()" style="font-size:.75rem">+ Agregar</button>
      </label>
      <div id="ing-list" style="margin-top:8px">${ingRows}</div>
      ${S.inventory.length===0?`<p style="font-size:.75rem;color:var(--text3);margin-top:4px">⚠️ Primero agregá insumos en Inventario</p>`:''}
      <p style="font-size:.72rem;color:var(--text3);margin-top:4px">Cada vez que se cocine este plato se descontará la cantidad indicada del insumo.</p>
    </div>`;

  openModal(i?'✏️ Editar Plato':'➕ Nuevo Plato', body,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="saveMI(${id||'null'})">${i?'Guardar':'Crear'}</button>`);
}

function addIngRow(){
  const list=$('ing-list');
  if(!list)return;
  const idx=list.children.length;
  const div=document.createElement('div');
  div.className='ing-row';
  div.style.cssText='display:flex;gap:6px;align-items:center;margin-bottom:6px';
  div.id='ing-row-'+idx;
  div.innerHTML=`
    <select style="flex:2" id="ing-inv-${idx}">
      <option value="">-- Insumo --</option>
      ${S.inventory.map(v=>`<option value="${v.id}">${v.name} (${v.stock} ${v.unit})</option>`).join('')}
    </select>
    <input type="number" id="ing-qty-${idx}" value="1" min="0.01" step="0.01" style="width:70px" placeholder="Cant.">
    <button type="button" onclick="this.parentElement.remove()" style="background:var(--red);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer">✕</button>`;
  list.appendChild(div);
}

function saveMI(id){
  const n=$('mi-n').value.trim();
  const p=+$('mi-p').value;
  const c=+$('mi-c').value;
  const cat=+$('mi-cat').value;
  const e=$('mi-e').value||'🍽️';
  if(!n||p<=0)return toast('Nombre y precio requeridos','error');

  // Collect ingredients
  const ingRows=document.querySelectorAll('#ing-list .ing-row');
  const ingredients=[];
  ingRows.forEach((row,idx)=>{
    const invId=+document.getElementById('ing-inv-'+idx)?.value;
    const qty=+document.getElementById('ing-qty-'+idx)?.value;
    if(invId&&qty>0) ingredients.push({invId,qty});
  });

  if(id){
    Object.assign(S.menuItems.find(x=>x.id===id),{name:n,price:p,cost:c,catId:cat,emoji:e,ingredients});
  } else {
    S.menuItems.push({id:uid(),catId:cat,name:n,price:p,cost:c,emoji:e,available:true,ingredients});
  }
  closeModal();render();
  toast(ingredients.length?`Guardado con ${ingredients.length} ingrediente(s) vinculados`:'Guardado (sin ingredientes vinculados)','success');
}
function openCatModal(){openModal('📁 Categorías',`${S.categories.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bg4)"><span style="font-size:1.3rem">${c.emoji}</span><span style="flex:1">${c.name}</span><button class="btn btn-sm btn-danger" onclick="if(!S.menuItems.some(i=>i.catId===${c.id})){S.categories=S.categories.filter(x=>x.id!==${c.id});closeModal();render();openCatModal();}else{toast('Tiene platos','warning');}">🗑️</button></div>`).join('')}<div style="margin-top:16px;display:flex;gap:8px"><input id="nc-e" value="🍽️" style="width:60px"><input id="nc-n" placeholder="Nombre" style="flex:1"><button class="btn btn-sm btn-primary" onclick="if($('nc-n').value.trim()){S.categories.push({id:uid(),name:$('nc-n').value.trim(),emoji:$('nc-e').value||'🍽️'});closeModal();render();openCatModal();}">+</button></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>`);}

// ============================================================
//  TABLES — Mesa 1 = CAJA + Cierre con impresión
// ============================================================
function renderTables(){
  const regularTables=S.tables.filter(t=>!t.isCaja);
  const caja=S.tables.find(t=>t.isCaja);
  const cajaOrders=S.orders.filter(o=>(o.type==='takeaway'||o.type==='delivery')&&(o.status==='pending'||o.status==='preparing'||o.status==='ready'));
  $('content').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="table-legend">
        <div class="leg"><div class="dot" style="background:var(--green)"></div> Libre</div>
        <div class="leg"><div class="dot" style="background:var(--red)"></div> Ocupada</div>
        <div class="leg"><div class="dot" style="background:var(--blue)"></div> Reservada</div>
        <div class="leg"><div class="dot" style="background:var(--accent)"></div> Por Cobrar</div>
      </div>
      <button class="btn btn-primary" onclick="addTable()">+ Mesa</button>
    </div>
    <!-- CAJA -->
    <div style="margin-bottom:20px">
      <h3 style="margin-bottom:12px;font-size:.9rem;color:var(--accent)">💰 CAJA (Mesa 1) — Delivery & Para Llevar</h3>
      <div class="table-card is-caja ${caja.status!=='free'?'occupied':'free'}" onclick="openCajaActions()" style="max-width:200px">
        <div class="tnum">💰</div>
        <div class="caja-label">CAJA</div>
        <div class="tstatus">${cajaOrders.length} pedidos activos</div>
        <div class="tcap" style="margin-top:4px">Delivery + Takeaway</div>
      </div>
    </div>
    <!-- REGULAR TABLES -->
    <h3 style="margin-bottom:12px;font-size:.9rem;color:var(--text2)">🍽️ Mesas del Salón</h3>
    <div class="tables-grid">
      ${regularTables.map(t=>{const el=t.openedAt?Math.floor((now()-t.openedAt)/60000):0;
      return `<div class="table-card ${t.status}" onclick="openTableActions(${t.id})">
        <div class="del-corner" onclick="event.stopPropagation();deleteTable(${t.id})" title="Eliminar">✕</div>
        <div class="tnum">${t.id}</div><div class="tstatus">${{free:'LIBRE',occupied:'OCUPADA',reserved:'RESERVADA',billing:'POR COBRAR'}[t.status]}</div>
        <div class="tcap">👥 ${t.capacity}</div>
        ${t.openedAt?`<div class="ttime">⏱️ ${el}min</div>`:''}
      </div>`;}).join('')}
    </div>`;
}

function openCajaActions(){
  const orders=S.orders.filter(o=>(o.type==='takeaway'||o.type==='delivery')&&o.status!=='delivered'&&o.status!=='cancelled').sort((a,b)=>b.createdAt-a.createdAt);
  const deliveredToday=S.orders.filter(o=>o.tableId===CAJA_TABLE_ID&&o.status==='delivered'&&o.createdAt>=today());
  const totalToday=deliveredToday.reduce((s,o)=>s+o.total,0);
  let body=`<div style="text-align:center;margin-bottom:16px"><div class="report-number">💰 CAJA</div><div class="report-label">Delivery + Para Llevar</div><div style="margin-top:8px;font-size:.9rem;color:var(--green)">Hoy: ${fmt(totalToday)} (${deliveredToday.length} pedidos)</div></div>`;
  if(orders.length){
    body+=`<h4 style="margin-bottom:8px;font-size:.85rem;">Pedidos Activos</h4>`;
    orders.forEach(o=>{
      body+=`<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:8px;margin-bottom:8px">
        <span style="font-weight:700">#${o.id}</span>
        <span class="badge badge-${o.type==='delivery'?'blue':'yellow'}">${o.type==='delivery'?'🛵 Delivery':'🥡 Llevar'}</span>
        <span style="flex:1;font-size:.85rem">${o.items.length} items${o.customer?' · '+o.customer:''}</span>
        <span style="font-weight:700">${fmt(o.total)}</span>
        <span class="badge badge-${o.status==='ready'?'green':o.status==='preparing'?'blue':'yellow'}">${o.status}</span>
      </div>`;
    });
  }else{body+=`<p style="color:var(--text3);text-align:center;padding:20px">Sin pedidos activos</p>`;}
  body+=`<div style="margin-top:12px"><button class="btn btn-primary w-full" onclick="closeModal();S.currentOrder.type='takeaway';document.querySelector('[data-page=pos]').click()">🛒 Nuevo Pedido Para Llevar</button></div>`;
  body+=`<div style="margin-top:8px"><button class="btn btn-outline w-full" onclick="closeModal();S.currentOrder.type='delivery';document.querySelector('[data-page=pos]').click()">🛵 Nuevo Pedido Delivery</button></div>`;
  openModal('💰 Caja',body,'');
}

function openTableActions(id){
  const t=S.tables.find(x=>x.id===id);
  // Find all orders for this table
  const tableOrders=S.orders.filter(o=>o.tableId===id&&o.status!=='cancelled'&&o.status!=='delivered');
  const allTableOrders=S.orders.filter(o=>o.tableId===id&&o.status==='delivered'&&o.createdAt>=today());
  let body=`<div style="text-align:center;margin-bottom:16px"><div class="report-number">Mesa ${t.id}</div><div class="report-label">${t.capacity} personas · ${t.status.toUpperCase()}</div></div>`;

  if(t.status==='free'){
    body+=`<button class="btn btn-success w-full" onclick="setTableStatus(${id},'occupied');closeModal()">🍽️ Ocupar</button>
           <button class="btn btn-secondary w-full" style="margin-top:8px" onclick="setTableStatus(${id},'reserved');closeModal()">📅 Reservar</button>`;
  }else if(t.status==='occupied'){
    if(tableOrders.length)body+=`<div style="margin-bottom:12px">${tableOrders.map(o=>`<div style="padding:8px;background:var(--bg3);border-radius:8px;margin-bottom:4px;font-size:.85rem">#${o.id} · ${o.items.length} items · ${fmt(o.total)} · <span class="badge badge-yellow">${o.status}</span></div>`).join('')}</div>`;
    body+=`<button class="btn btn-primary w-full" onclick="goToPOSTable(${id})">🛒 Nuevo Pedido</button>
           <button class="btn btn-success w-full" style="margin-top:8px" onclick="closeTableWithBill(${id})">🧾 Cerrar Mesa + Cuenta</button>
           <button class="btn btn-outline w-full" style="margin-top:8px" onclick="setTableStatus(${id},'free');closeModal()">✅ Liberar</button>`;
  }else if(t.status==='reserved'){
    body+=`<button class="btn btn-success w-full" onclick="setTableStatus(${id},'occupied');closeModal()">🍽️ Sentar</button>
           <button class="btn btn-outline w-full" style="margin-top:8px" onclick="setTableStatus(${id},'free');closeModal()">❌ Cancelar</button>`;
  }else if(t.status==='billing'){
    body+=`<button class="btn btn-success w-full" onclick="closeTableWithBill(${id})">🧾 Imprimir Cuenta + Liberar</button>`;
  }
  body+=`<button class="btn btn-danger btn-sm w-full" style="margin-top:16px" onclick="deleteTable(${id});closeModal()">🗑️ Eliminar Mesa</button>`;
  openModal('Mesa '+id,body,'');
}

function closeTableWithBill(tableId){
  // Gather all orders for this table session
  const t=S.tables.find(x=>x.id===tableId);
  const sessionOrders=S.orders.filter(o=>o.tableId===tableId&&o.status!=='cancelled'&&o.createdAt>=(t.openedAt||today()));
  if(!sessionOrders.length){setTableStatus(tableId,'free');closeModal();return toast('Mesa sin pedidos','info');}

  // Merge all items
  const allItems=[];let grandTotal=0,grandSub=0,grandTax=0;
  sessionOrders.forEach(o=>{o.items.forEach(i=>allItems.push(i));grandSub+=o.subtotal;grandTax+=o.tax;grandTotal+=o.total;});

  // Mark all as delivered
  sessionOrders.forEach(o=>{if(o.status!=='delivered')o.status='delivered';});
  setTableStatus(tableId,'free');
  closeModal();

  // Build combined receipt
  const combinedOrder={id:sessionOrders[sessionOrders.length-1].id,items:allItems,subtotal:grandSub,tax:grandTax,total:grandTotal,discount:0,discountAmt:0,type:'dine-in',tableId,customer:sessionOrders.find(o=>o.customer)?.customer||'',paymentMethod:'cash',createdAt:now()};
  printReceipt(combinedOrder,0);
  addNotif('🧾',`Mesa ${tableId} cerrada — ${fmt(grandTotal)}`,'success');
  render();
}

function deleteTable(id){const t=S.tables.find(x=>x.id===id);if(!t)return;if(t.isCaja)return toast('La CAJA no se puede eliminar','warning');if(t.status!=='free')return toast('Solo mesas libres','warning');if(!confirm(`¿Eliminar Mesa ${id}?`))return;S.tables=S.tables.filter(x=>x.id!==id);render();toast('Eliminada','info');}
function setTableStatus(id,s){const t=S.tables.find(x=>x.id===id);if(!t)return;t.status=s;if(s==='occupied'&&!t.openedAt)t.openedAt=now();if(s==='free'){t.openedAt=null;t.orderId=null;}render();}
function goToPOSTable(id){closeModal();S.currentOrder.tableId=id;S.currentOrder.type='dine-in';document.querySelector('[data-page="pos"]').click();}
function addTable(){const maxId=S.tables.length?Math.max(...S.tables.map(t=>t.id)):1;S.tables.push({id:maxId+1,capacity:4,status:'free',orderId:null,openedAt:null,isCaja:false});render();toast('Mesa agregada','success');}

// ============================================================
//  KITCHEN
// ============================================================
function renderKitchen(){
  // Mostrar: pendientes, preparando, listos, Y entregados sin cobrar
  const ko=S.orders.filter(o=>
    o.status==='pending'||o.status==='preparing'||o.status==='ready'||
    (o.status==='delivered'&&!o.paymentMethod)
  ).sort((a,b)=>a.createdAt-b.createdAt);

  $('content').innerHTML=`
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <span class="badge badge-yellow" style="padding:8px 14px;font-size:.85rem">⏳ Pendientes: ${S.orders.filter(o=>o.status==='pending').length}</span>
      <span class="badge badge-blue" style="padding:8px 14px;font-size:.85rem">👨‍🍳 Preparando: ${S.orders.filter(o=>o.status==='preparing').length}</span>
      <span class="badge badge-green" style="padding:8px 14px;font-size:.85rem">✅ Listos: ${S.orders.filter(o=>o.status==='ready').length}</span>
    </div>
    <button class="btn btn-primary" onclick="openKitchenDisplay()">📺 Pantalla Cocina</button>
  </div>
  ${ko.length===0?'<div style="text-align:center;padding:80px;color:var(--text3)"><div style="font-size:3rem;margin-bottom:12px">👨‍🍳</div><h3>Sin pedidos activos</h3></div>':''}
  <div class="kitchen-grid">
  ${ko.map(o=>{
    const mins=Math.floor((now()-o.createdAt)/60000);
    const label=o.type==='dine-in'?'Mesa '+(o.tableId||'-'):o.type==='takeaway'?'🥡 LLEVAR':'🛵 DELIVERY';
    const headerClass=o.status==='delivered'?'ready':o.status;
    const isPaid=!!o.paymentMethod;
    return `<div class="kitchen-card ${mins>15&&!isPaid?'kds-blink':''}">
      <div class="kitchen-card-header ${headerClass}">
        <span>#${o.id} · ${label}${o.customer?' · '+o.customer:''}</span>
        <span class="timer" style="${mins>20?'color:var(--red)':''}">${mins}min</span>
      </div>
      <div class="kitchen-card-body">
        ${o.items.map(i=>`<div class="kitchen-item">
          <span><span class="ki-qty">${i.qty}</span> ${i.emoji} ${i.name}</span>
          ${i.note?`<span style="font-size:.75rem;color:var(--accent)">📝 ${i.note}</span>`:''}
        </div>`).join('')}
      </div>
      <div class="kitchen-card-footer" style="flex-wrap:wrap;gap:6px">
        ${o.status==='pending'?`<button class="btn btn-sm btn-primary" onclick="updOrderSt(${o.id},'preparing')">👨‍🍳 Preparar</button>`:''}
        ${o.status==='preparing'?`<button class="btn btn-sm btn-success" onclick="updOrderSt(${o.id},'ready')">✅ Listo</button>`:''}
        ${o.status==='ready'?`<button class="btn btn-sm btn-secondary" onclick="updOrderSt(${o.id},'delivered')">🍽️ Entregado</button>`:''}
        <button class="btn btn-sm" style="background:var(--accent);color:#000;font-weight:700" onclick="openChargeFromKitchen(${o.id})">💳 COBRAR</button>
        ${o.status==='pending'?`<button class="btn btn-sm btn-danger" onclick="updOrderSt(${o.id},'cancelled')">❌ Cancelar</button>`:''}
      </div>
    </div>`;
  }).join('')}
  </div>`;
}

function updOrderSt(id,status){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  o.status=status;
  // delivered solo marca como entregado físicamente — NO lo quita de cocina hasta cobrar
  if(status==='delivered'&&o.tableId){
    const t=S.tables.find(x=>x.id===o.tableId);
    if(t&&!t.isCaja)t.status='billing';
  }
  if(status==='cancelled'&&o.tableId){
    const t=S.tables.find(x=>x.id===o.tableId);
    if(t&&t.orderId===id&&!t.isCaja){t.status='free';t.orderId=null;t.openedAt=null;}
  }
  saveState();
  broadcast('status_update',{orderId:id,status});
  playSound();
  addNotif(status==='ready'?'✅':status==='cancelled'?'❌':'👨‍🍳',`Pedido #${id}: ${status}`);
  // Re-render kitchen sin cerrar el pedido (cobrar lo cierra)
  renderKitchen();
  updateBadges();
  toast({preparing:'👨‍🍳 Preparando #'+id,ready:'✅ #'+id+' LISTO!',delivered:'🍽️ Entregado — pendiente cobro',cancelled:'❌ Cancelado'}[status],'success');
}

function openChargeFromKitchen(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  const tot=o.total;
  openModal('💳 Cobrar Pedido #'+id,`
    <div style="margin-bottom:12px"><strong>Pedido #${o.id}</strong> — ${o.type==='dine-in'?'Mesa '+(o.tableId||'-'):o.type==='takeaway'?'Para Llevar':'Delivery'}</div>
    ${o.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.87rem"><span>${i.qty}x ${i.emoji} ${i.name}</span><span>${fmt(i.lineTotal)}</span></div>`).join('')}
    <hr style="border-color:var(--bg4);margin:10px 0">
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:2rem;font-weight:800;color:var(--accent)">${fmt(tot)}</div></div>
    <div class="form-group"><label>Método de Pago</label><select id="kpay-method"><option value="cash">💵 Efectivo</option><option value="card">💳 Tarjeta</option><option value="transfer">📱 Transferencia</option></select></div>
    <div class="form-group"><label>Monto Recibido</label><input type="number" id="kpay-recv" value="${tot}" min="0" oninput="const c=this.value-${tot};document.getElementById('kpay-chg').textContent=c>=0?'Cambio: $ '+c.toFixed(2):'Insuficiente';document.getElementById('kpay-chg').style.color=c>=0?'var(--green)':'var(--red)'"></div>
    <div id="kpay-chg" style="text-align:center;font-size:1rem;font-weight:700;color:var(--green)"></div>
  `,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-success" onclick="processKitchenPayment(${id},${tot})">✅ Cobrar</button>`);
}

function processKitchenPayment(id,tot){
  const m=document.getElementById('kpay-method').value;
  const r=+document.getElementById('kpay-recv').value;
  if(m==='cash'&&r<tot)return toast('Monto insuficiente','error');
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  o.status='delivered';
  o.paymentMethod=m;
  o.paidAt=now();
  if(o.tableId){const t=S.tables.find(x=>x.id===o.tableId);if(t&&!t.isCaja){t.status='free';t.orderId=null;t.openedAt=null;}}
  const change=m==='cash'?r-tot:0;
  closeModal();saveState();render();
  addNotif('💰',`Cobro #${o.id}: ${fmt(tot)}`,'success');
  toast(`✅ Cobro #${o.id} — ${fmt(tot)}`,'success');
  printReceipt(o,change);
}

// ============================================================
//  INVENTORY
// ============================================================
function renderInventory(){
  const td=new Date();td.setHours(0,0,0,0);
  const ea=S.inventory.map(i=>{
    if(!i.expirationDate)return{...i,daysLeft:9999,expiryStatus:'none'};
    const exp=new Date(i.expirationDate);exp.setHours(0,0,0,0);
    const diff=Math.ceil((exp-td)/864e5);
    let st='good';if(diff<0)st='expired';else if(diff<=3)st='critical';else if(diff<=7)st='soon';
    return{...i,daysLeft:diff,expiryStatus:st};
  });
  const exp=ea.filter(i=>i.expiryStatus==='expired'&&!S.dismissedAlerts.includes('exp_'+i.id));
  const crit=ea.filter(i=>i.expiryStatus==='critical'&&!S.dismissedAlerts.includes('crit_'+i.id));
  const soon=ea.filter(i=>i.expiryStatus==='soon'&&!S.dismissedAlerts.includes('soon_'+i.id));
  const allU=[...ea.filter(i=>i.expiryStatus==='expired'),...ea.filter(i=>i.expiryStatus==='critical'),...ea.filter(i=>i.expiryStatus==='soon')];

  // Summary stats
  const totalCostValue=S.inventory.reduce((s,i)=>s+(i.cost||0)*i.stock,0);
  const totalSaleValue=S.inventory.reduce((s,i)=>s+(i.salePrice||0)*i.stock,0);
  const totalMargin=totalCostValue>0?Math.round((totalSaleValue-totalCostValue)/totalCostValue*100):0;

  let ah='';
  if(exp.length)ah+=`<div class="expiry-alert critical"><span class="alert-close" onclick="dismissAlert('exp',${JSON.stringify(exp.map(i=>i.id)).replace(/"/g,"'")})">✕</span><span class="expiry-icon">🚨</span><div class="expiry-content"><h4 style="color:var(--red)">${exp.length} VENCIDO(S)</h4><p>${exp.map(i=>i.name).join(', ')}</p></div></div>`;
  if(crit.length)ah+=`<div class="expiry-alert warning"><span class="alert-close" onclick="dismissAlert('crit',${JSON.stringify(crit.map(i=>i.id)).replace(/"/g,"'")})">✕</span><span class="expiry-icon">⚠️</span><div class="expiry-content"><h4 style="color:var(--accent)">${crit.length} vencen en ≤3 días</h4><p>${crit.map(i=>i.name+' ('+i.daysLeft+'d)').join(', ')}</p></div></div>`;
  if(soon.length)ah+=`<div class="expiry-alert ok"><span class="alert-close" onclick="dismissAlert('soon',${JSON.stringify(soon.map(i=>i.id)).replace(/"/g,"'")})">✕</span><span class="expiry-icon">📅</span><div class="expiry-content"><h4 style="color:var(--cyan)">${soon.length} vencen esta semana</h4></div></div>`;

  $('content').innerHTML=`${ah}
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card"><div class="top"><span class="label">Productos</span><div class="icon-box" style="background:rgba(59,130,246,.15);color:var(--blue)">📦</div></div><div class="value">${S.inventory.length}</div><div class="change">en inventario</div></div>
    <div class="stat-card" style="border-color:rgba(244,63,94,.2)"><div class="top"><span class="label">💸 Capital Invertido</span><div class="icon-box" style="background:rgba(244,63,94,.12);color:var(--red)">📤</div></div><div class="value" style="font-size:1.3rem;color:var(--red)">${fmt(S.inventory.reduce((a,i)=>(a+(i.cost||0)*i.stock),0))}</div><div class="change">costo total del stock actual</div></div>
    <div class="stat-card" style="border-color:rgba(16,185,129,.2)"><div class="top"><span class="label">💰 Potencial de Venta</span><div class="icon-box" style="background:rgba(16,185,129,.12);color:var(--green)">📥</div></div><div class="value" style="font-size:1.3rem;color:var(--green)">${fmt(S.inventory.reduce((a,i)=>(a+(i.salePrice||0)*i.stock),0))}</div><div class="change">si se vende todo el stock</div></div>
    <div class="stat-card" style="border-color:rgba(229,62,62,.2)"><div class="top"><span class="label">📊 Ganancia Potencial</span><div class="icon-box" style="background:rgba(229,62,62,.12);color:var(--accent)">💹</div></div>
    <div class="value" style="font-size:1.3rem;color:var(--accent)">${(()=>{const inv=S.inventory.reduce((a,i)=>(a+(i.cost||0)*i.stock),0);const sale=S.inventory.reduce((a,i)=>(a+(i.salePrice||0)*i.stock),0);return fmt(sale-inv);})()}</div>
    <div class="change">margen estimado sobre stock</div></div>
      <div class="stat-card"><div class="top"><span class="label">Valor de Costo</span><div class="icon-box" style="background:rgba(239,68,68,.15);color:var(--red)">💸</div></div><div class="value" style="font-size:1.3rem">${fmt(totalCostValue)}</div><div class="change">lo que invertiste</div></div>
      <div class="stat-card"><div class="top"><span class="label">Valor de Venta</span><div class="icon-box" style="background:rgba(34,197,94,.15);color:var(--green)">💰</div></div><div class="value" style="font-size:1.3rem">${fmt(totalSaleValue)}</div><div class="change up">precio de venta total</div></div>
      <div class="stat-card" style="cursor:pointer" onclick="showSuggestions()"><div class="top"><span class="label">Ganancia Potencial</span><div class="icon-box" style="background:rgba(245,158,11,.15);color:var(--accent)">📈</div></div><div class="value" style="font-size:1.3rem;color:var(--green)">${fmt(totalSaleValue-totalCostValue)}</div><div class="change up">${totalMargin}% margen · ${allU.length?'⚠️ '+allU.length+' por vencer':'✅ stock OK'}</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <div class="search-bar"><i>🔍</i><input placeholder="Buscar..." oninput="filterInv(this.value)"></div>
        <select onchange="filterInvCat(this.value)" id="inv-cat-filter" style="padding:10px 14px;min-width:130px">
          <option value="all">Todas las categorías</option>
          ${[...new Set(S.inventory.map(i=>i.category))].filter(Boolean).map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
        <select onchange="filterInvExp(this.value)" style="padding:10px 14px;min-width:120px"><option value="all">Todo</option><option value="expired">🚨 Vencidos</option><option value="critical">⚠️ ≤3d</option><option value="soon">📅 ≤7d</option></select>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" onclick="S.dismissedAlerts=[];saveState();render();toast('Alertas restauradas','info')">🔄 Alertas</button>
        <button class="btn btn-primary" onclick="openInvModal()">+ Agregar</button>
      </div>
    </div>
    <div class="panel" style="overflow-x:auto">
      <table class="data-table" id="inv-table">
        <thead><tr>
          <th>Producto</th>
          <th>Stock</th>
          <th>Stock Mín.</th>
          <th>💸 Costo Local</th>
          <th>💰 Venta Público</th>
          <th>Ganancia / Margen</th>
          <th>Valor Stock</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr></thead>
        <tbody>
        ${ea.map(i=>{
          const pct=i.minStock>0?Math.min(100,Math.round(i.stock/i.minStock*50)):100;
          const col=i.stock<=i.minStock?'var(--red)':i.stock<=i.minStock*2?'var(--accent)':'var(--green)';
          const sp=i.salePrice||0;
          const margin=sp>0&&i.cost>0?Math.round((sp-i.cost)/sp*100):null;
          const marginColor=margin===null?'var(--text3)':margin>=50?'var(--green)':margin>=30?'var(--accent)':'var(--red)';
          return `<tr data-expiry-status="${i.expiryStatus}" data-category="${i.category||''}">
            <td>
              <strong>${i.name}</strong>
              ${i.notes?`<br><span style="font-size:.7rem;color:var(--text3)">${i.notes}</span>`:''}
              <br><span class="badge badge-blue" style="font-size:.6rem">${i.category||'—'}</span>
            </td>
            <td>
              <span style="color:${col};font-weight:700">${i.stock} ${i.unit}</span>
              <div class="stock-bar" style="margin-top:4px;width:70px"><div class="stock-bar-fill" style="width:${pct}%;background:${col}"></div></div>
              ${pct<=50?`<div style="font-size:.6rem;color:${col};font-weight:700;margin-top:2px">${pct}% del mín</div>`:''}
            </td>
            <td style="color:var(--text3)">${i.minStock} ${i.unit}</td>
            <td><span style="color:var(--red);font-size:.7rem">↙ costo</span><br><strong style="color:var(--text)">${fmt(i.cost||0)}</strong></td>
            <td>${sp>0?`<span style='color:var(--text3);font-size:.7rem'>↗ venta</span><br><strong style='color:var(--green)'>${fmt(sp)}</strong>`:'<span style=\'color:var(--text3)\'>—</span>'}</td>
            <td style="color:${marginColor};font-weight:700">${margin!==null?`<span style='font-size:.7rem;color:var(--text3)'>Gan:</span> ${fmt(sp-i.cost)} <span style='font-size:.75rem'>${margin}%</span>`:'—'}</td>
            <td style="color:var(--accent);font-weight:700">${fmt((i.cost||0)*i.stock)}</td>
            <td style="cursor:pointer" onclick="editExpDate(${i.id})">${i.expirationDate?formatDateShort(i.expirationDate):'—'}</td>
            <td>${{expired:`<span class="expiry-tag expired">🚨 ${Math.abs(i.daysLeft)}d</span>`,critical:`<span class="expiry-tag critical">⚠️ ${i.daysLeft}d</span>`,soon:`<span class="expiry-tag soon">📅 ${i.daysLeft}d</span>`,good:`<span class="expiry-tag good">✅</span>`,none:'—'}[i.expiryStatus]}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-sm btn-success" onclick="adjStock(${i.id},1)" title="Agregar stock">+</button>
              <button class="btn btn-sm btn-danger" onclick="adjStock(${i.id},-1)" title="Retirar stock">−</button>
              <button class="btn btn-sm btn-secondary" onclick="openInvModal(${i.id})">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="if(confirm('¿Eliminar ${i.name}?')){S.inventory=S.inventory.filter(x=>x.id!==${i.id});saveState();render();}">🗑️</button>
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;
}

function dismissAlert(prefix,ids){ids.forEach(id=>S.dismissedAlerts.push(prefix+'_'+id));saveState();render();toast('Alerta descartada','info');}
function filterInv(q){q=q.toLowerCase();document.querySelectorAll('#inv-table tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none');}
function filterInvExp(s){document.querySelectorAll('#inv-table tbody tr').forEach(tr=>tr.style.display=(s==='all'||tr.dataset.expiryStatus===s)?'':'none');}
function filterInvCat(s){document.querySelectorAll('#inv-table tbody tr').forEach(tr=>tr.style.display=(s==='all'||tr.dataset.category===s)?'':'none');}
function adjStock(id,d){
  const i=S.inventory.find(x=>x.id===id);if(!i)return;
  const a=+prompt(`Cantidad a ${d>0?'agregar':'retirar'} (${i.unit}):`,1);
  if(!a||a<=0)return;
  i.stock=Math.max(0,i.stock+d*a);
  saveState();render();
  toast(`${i.name}: ${d>0?'+':'−'}${a} ${i.unit} → stock: ${i.stock}`,'success');
}
function editExpDate(id){
  const i=S.inventory.find(x=>x.id===id);
  openModal('📅 '+i.name,
    `<div class="form-group"><label>Fecha de vencimiento</label><input type="date" id="ed-exp" value="${i.expirationDate||''}"></div>
     <div class="form-group"><label><input type="checkbox" id="ed-rm"> Sin fecha de vencimiento</label></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="S.inventory.find(x=>x.id===${id}).expirationDate=$('ed-rm').checked?null:($('ed-exp').value||null);saveState();closeModal();render();">Guardar</button>`);
}

function openInvModal(id=null){
  const i=id?S.inventory.find(x=>x.id===id):null;
  const cats=[...new Set([...S.inventory.map(x=>x.category),'Carnes','Verduras','Lácteos','Bebidas','Secos','Pescados','Congelados','Otros'].filter(Boolean))];
  openModal(i?'✏️ Editar producto':'➕ Agregar al inventario',`
    <div class="form-group"><label>Nombre del producto *</label><input id="inv-n" value="${i?i.name:''}" placeholder="Ej: Medallón de hamburguesa"></div>
    <div class="form-row">
      <div class="form-group"><label>Categoría</label>
        <select id="inv-cat-sel" onchange="if(this.value==='__new'){const v=prompt('Nueva categoría:');if(v){const opt=document.createElement('option');opt.value=v;opt.text=v;opt.selected=true;this.add(opt);}}">
          ${cats.map(c=>`<option value="${c}" ${i&&i.category===c?'selected':''}>${c}</option>`).join('')}
          <option value="__new">+ Nueva categoría...</option>
        </select>
      </div>
      <div class="form-group"><label>Unidad</label><input id="inv-u" value="${i?i.unit:'unidad'}" placeholder="unidad / kg / L / caja"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Stock actual *</label><input type="number" id="inv-s" value="${i?i.stock:0}" min="0" step="0.01"></div>
      <div class="form-group"><label>Stock mínimo</label><input type="number" id="inv-m" value="${i?i.minStock:5}" min="0" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>💸 Costo del local (por ${i?i.unit:'unidad'})</label><input type="number" id="inv-c" value="${i?i.cost:0}" min="0" step="0.01" oninput="calcInvMargin()"></div>
      <div class="form-group"><label>💰 Precio de venta al público (por ${i?i.unit:'unidad'})</label><input type="number" id="inv-sp" value="${i&&i.salePrice?i.salePrice:0}" min="0" step="0.01" oninput="calcInvMargin()"></div>
    </div>
    <div id="inv-margin-preview" style="background:var(--bg3);padding:10px 14px;border-radius:8px;font-size:.83rem;margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap">
      <span>Ganancia por unidad: <strong id="imp-unit" style="color:var(--green)">—</strong></span>
      <span>Margen: <strong id="imp-pct" style="color:var(--green)">—</strong></span>
    </div>
    <div class="form-row">
      <div class="form-group"><label>📅 Vencimiento</label><input type="date" id="inv-exp" value="${i&&i.expirationDate?i.expirationDate:''}"></div>
      <div class="form-group"><label>🎨 Emoji</label><input id="inv-emoji" value="${i&&i.emoji?i.emoji:'📦'}" maxlength="4" placeholder="📦"></div>
    </div>
    <div class="form-group"><label>📝 Notas</label><input id="inv-notes" value="${i&&i.notes?i.notes:''}" placeholder="Ej: 180g c/u"></div>
    <div class="form-group" style="background:var(--bg3);padding:12px;border-radius:8px;border:1px solid rgba(229,62,62,.15)">
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.87rem">
        <input type="checkbox" id="inv-pos" ${i&&i.showInPOS?'checked':''} style="width:16px;height:16px;accent-color:var(--accent)">
        <span>🛒 <strong>Mostrar en Punto de Venta</strong></span>
      </label>
      <p style="font-size:.72rem;color:var(--text3);margin-top:4px;margin-left:26px">Al activar esto, el producto aparecerá directamente en el POS para venderse. Al venderse, se descuenta del stock automáticamente.</p>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="saveInv(${id||'null'})">${i?'Guardar cambios':'Agregar al inventario'}</button>`);
  setTimeout(calcInvMargin,50);
}

function calcInvMargin(){
  const c=+($('inv-c')?.value||0);
  const sp=+($('inv-sp')?.value||0);
  const unitEl=$('imp-unit');const pctEl=$('imp-pct');
  if(!unitEl||!pctEl)return;
  if(sp>0&&c>0){
    const gain=sp-c;const pct=Math.round(gain/sp*100);
    unitEl.textContent=fmt(gain);unitEl.style.color=gain>0?'var(--green)':'var(--red)';
    pctEl.textContent=pct+'%';pctEl.style.color=pct>=50?'var(--green)':pct>=30?'var(--accent)':'var(--red)';
  } else {
    unitEl.textContent='—';pctEl.textContent='—';
  }
}

function saveInv(id){
  const catSel=$('inv-cat-sel');
  const cat=catSel&&catSel.value!=='__new'?catSel.value:'General';
  const showInPOS=!!$('inv-pos')?.checked;
  const sp=+$('inv-sp').value||0;
  const d={
    name:$('inv-n').value.trim(),
    stock:+$('inv-s').value,
    minStock:+$('inv-m').value,
    unit:$('inv-u').value.trim()||'unidad',
    cost:+$('inv-c').value,
    salePrice:sp,
    category:cat,
    expirationDate:$('inv-exp').value||null,
    notes:$('inv-notes').value.trim()||null,
    emoji:$('inv-emoji')?.value||'📦',
    showInPOS:showInPOS&&sp>0
  };
  if(!d.name)return toast('El nombre es obligatorio','error');
  if(id){Object.assign(S.inventory.find(x=>x.id===id),d);}
  else{S.inventory.push({id:uid(),...d});}
  closeModal();saveState();render();
  const msg=id?'Producto actualizado':'Producto agregado al inventario';
  toast(msg+(d.showInPOS?' — visible en POS':''),'success');
  if(d.showInPOS) addNotif('🛒','Nuevo producto en POS: '+d.name,'info');
}

// Suggestions
const RECIPES=[
  {id:'pasta_bol',name:'Pasta Boloñesa',emoji:'🍝',ingredients:['Carne de Res','Pasta Seca','Tomate','Queso Mozzarella'],price:3200,cost:950},
  {id:'ensalada_cesar',name:'Ensalada César',emoji:'🥗',ingredients:['Lechuga','Pechuga de Pollo','Queso Mozzarella'],price:2400,cost:780},
  {id:'salmon_crema',name:'Salmón en Crema',emoji:'🐟',ingredients:['Salmón','Crema para batir'],price:5800,cost:1900},
  {id:'pizza_art',name:'Pizza Artesanal',emoji:'🍕',ingredients:['Harina','Tomate','Queso Mozzarella'],price:3000,cost:820},
  {id:'burger_gourmet',name:'Hamburguesa Gourmet',emoji:'🍔',ingredients:['Medallón de Hamburguesa 180g','Queso Mozzarella','Lechuga','Tomate'],price:3200,cost:1100},
  {id:'pollo_grille',name:'Pollo a la Parrilla',emoji:'🍗',ingredients:['Pechuga de Pollo','Tomate'],price:2800,cost:750}
];

function showSuggestions(){
  if(!S.dismissedSuggestions)S.dismissedSuggestions=[];
  const exp=getExpiringItems();
  if(!exp.length){
    return openModal('🧠 Sugerencias',`<div style="text-align:center;padding:40px"><div style="font-size:3rem">✅</div><h3 style="margin-top:12px">Todo el stock está bien</h3><p style="color:var(--text2);margin-top:8px">No hay productos próximos a vencer</p></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>`);
  }

  // Filter out permanently dismissed suggestions
  const activeSugs=[];
  RECIPES.forEach(r=>{
    if(S.dismissedSuggestions.includes(r.id))return; // skip dismissed
    const m=r.ingredients.filter(ing=>exp.some(e=>e.name.toLowerCase().includes(ing.toLowerCase())||ing.toLowerCase().includes(e.name.split(' ')[0].toLowerCase())));
    if(m.length)activeSugs.push({...r,matchCount:m.length,matchingIngredients:m});
  });
  activeSugs.sort((a,b)=>b.matchCount-a.matchCount);

  const dismissedCount=S.dismissedSuggestions.length;

  let h=`<div style="margin-bottom:16px">
    <h4 style="color:var(--red);margin-bottom:10px">📦 INSUMOS POR VENCER (${exp.length})</h4>
    <div class="expiry-timeline" style="margin-bottom:4px">
      ${exp.map(i=>`<div class="et-item ${i.expiryStatus}">
        <strong>${i.name}</strong> — ${i.stock} ${i.unit}
        <span class="expiry-tag ${i.expiryStatus}" style="margin-left:8px">${i.expiryStatus==='expired'?'VENCIDO':i.daysLeft+'d'}</span>
      </div>`).join('')}
    </div>
  </div>`;

  if(activeSugs.length){
    h+=`<h4 style="color:var(--purple);margin:16px 0 12px">🍳 RECETAS SUGERIDAS (${activeSugs.length})</h4>`;
    activeSugs.forEach((r,ri)=>{
      const margin=Math.round((r.price-r.cost)/r.price*100);
      h+=`<div class="suggestion-card" id="sug-card-${ri}">
        <div class="sug-header">
          <span class="sug-title">${r.emoji} ${r.name}</span>
          <span class="sug-type recipe">Receta · ${margin}% margen</span>
        </div>
        <div class="sug-ingredients" style="margin:8px 0">
          ${r.ingredients.map(ing=>`<span class="sug-chip ${exp.some(e=>e.name.toLowerCase().includes(ing.toLowerCase())||ing.toLowerCase().includes(e.name.split(' ')[0].toLowerCase()))?'expiring':''}">${ing}</span>`).join('')}
        </div>
        <div style="font-size:.82rem;color:var(--text2);margin-bottom:10px">
          Precio sugerido: <strong style="color:var(--green)">${fmt(r.price)}</strong> · Costo estimado: ${fmt(r.cost)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input type="number" id="sug-price-${ri}" value="${r.price}" min="1" step="1" style="width:140px;padding:7px 10px;font-size:.83rem;background:var(--bg4);border:1px solid var(--bg4);color:var(--text);border-radius:8px" placeholder="Precio de venta">
          <button class="btn btn-sm btn-primary" onclick="addSugToMenu(${ri},'${r.name}',${r.cost},'${r.emoji}')">➕ Agregar al menú</button>
          <button class="btn btn-sm btn-success" onclick="markSugDone('${r.id}')" title="Marcar como hecho — no mostrar de nuevo">✅ Ya lo hice</button>
          <button class="btn btn-sm btn-danger" onclick="hideSugTemp(${ri})" title="Ocultar por ahora">✕ Ocultar</button>
        </div>
      </div>`;
    });
  } else {
    h+=`<div style="text-align:center;padding:24px;color:var(--text3)">
      <div style="font-size:2rem">🍳</div>
      <p style="margin-top:8px">No hay recetas sugeridas activas</p>
      ${dismissedCount?`<button class="btn btn-sm btn-secondary" style="margin-top:12px" onclick="S.dismissedSuggestions=[];saveState();showSuggestions()">🔄 Restaurar ${dismissedCount} sugerencias</button>`:''}
    </div>`;
  }

  if(dismissedCount){
    h+=`<div style="text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--bg4)">
      <span style="font-size:.78rem;color:var(--text3)">${dismissedCount} sugerencia(s) marcada(s) como "ya hecha" · </span>
      <span style="font-size:.78rem;color:var(--accent);cursor:pointer" onclick="S.dismissedSuggestions=[];saveState();showSuggestions()">Restaurar todas</span>
    </div>`;
  }

  window._lastSugs=activeSugs;
  openModal('🧠 Sugerencias inteligentes',`<div style="max-height:72vh;overflow-y:auto;padding-right:4px">${h}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>`);
  setTimeout(()=>{$('modal').style.maxWidth='680px';},10);
}

function markSugDone(recipeId){
  // Permanently dismiss this suggestion (stored in state)
  if(!S.dismissedSuggestions)S.dismissedSuggestions=[];
  if(!S.dismissedSuggestions.includes(recipeId)){
    S.dismissedSuggestions.push(recipeId);
    saveState();
  }
  toast('✅ Marcado como hecho — no se mostrará de nuevo','success');
  showSuggestions();
}

function hideSugTemp(ri){
  // Just remove from current session view
  if(window._lastSugs)window._lastSugs.splice(ri,1);
  const card=document.getElementById('sug-card-'+ri);
  if(card)card.remove();
  const remaining=document.querySelectorAll('.suggestion-card').length;
  if(!remaining)closeModal();
}

function addSugToMenu(ri,name,cost,emoji){
  const priceInp=document.getElementById('sug-price-'+ri);
  const price=priceInp?+priceInp.value:0;
  if(!price||price<=0)return toast('Ingresá un precio válido','error');
  if(S.menuItems.some(x=>x.name===name))return toast('Ya existe en el menú','warning');
  S.menuItems.push({id:uid(),catId:2,name,price,cost,emoji,available:true,ingredients:[]});
  saveState();render();
  toast(`${name} agregado al menú`,'success');
  if(window._lastSugs){
    window._lastSugs.splice(ri,1);
    if(window._lastSugs.length===0){closeModal();return;}
    showSuggestions();
  }
}
function renderCustomers(){$('content').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px"><div class="search-bar"><i>🔍</i><input placeholder="Buscar..." oninput="document.querySelectorAll('#ct tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none')"></div><button class="btn btn-primary" onclick="openCustModal()">+ Cliente</button></div><div class="panel"><table class="data-table" id="ct"><thead><tr><th>Cliente</th><th>Tel</th><th>Visitas</th><th>Gastado</th><th>Puntos</th><th></th></tr></thead><tbody>${S.customers.map(c=>`<tr><td><strong>${c.name}</strong><br><small style="color:var(--text3)">${c.email}</small></td><td>${c.phone}</td><td><span class="badge badge-blue">${c.visits}</span></td><td style="color:var(--green)">${fmt(c.totalSpent)}</td><td><span class="badge badge-yellow">⭐${c.points}</span></td><td><button class="btn btn-sm btn-secondary" onclick="openCustModal(${c.id})">✏️</button> <button class="btn btn-sm btn-danger" onclick="if(confirm('¿?')){S.customers=S.customers.filter(x=>x.id!==${c.id});render();}">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;}
function openCustModal(id=null){const c=id?S.customers.find(x=>x.id===id):null;openModal(c?'✏️':'➕ Cliente',`<div class="form-group"><label>Nombre</label><input id="cn" value="${c?c.name:''}"></div><div class="form-row"><div class="form-group"><label>Tel</label><input id="cp" value="${c?c.phone:''}"></div><div class="form-group"><label>Email</label><input id="ce" value="${c?c.email:''}"></div></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="if(!$('cn').value.trim())return toast('Nombre','error');if(${id||0}){Object.assign(S.customers.find(x=>x.id===${id||0}),{name:$('cn').value.trim(),phone:$('cp').value.trim(),email:$('ce').value.trim()});}else{S.customers.push({id:uid(),name:$('cn').value.trim(),phone:$('cp').value.trim(),email:$('ce').value.trim(),visits:0,totalSpent:0,points:0,notes:''});}closeModal();render();">OK</button>`);}

function renderEmployees(){const ro={admin:'👑',cashier:'💰',waiter:'🍽️',kitchen:'👨‍🍳'};$('content').innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:20px"><button class="btn btn-primary" onclick="openEmpModal()">+ Empleado</button></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">${S.employees.map(e=>`<div class="panel"><div class="panel-body" style="text-align:center;padding:20px"><div style="width:50px;height:50px;border-radius:50%;background:var(--bg4);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:1.3rem">${e.name.charAt(0)}</div><h3 style="font-size:1rem">${e.name}</h3><span class="badge badge-${e.role==='admin'?'yellow':e.role==='cashier'?'green':e.role==='waiter'?'blue':'purple'}">${ro[e.role]||''} ${e.role}</span><div style="margin-top:8px;font-size:.82rem;color:var(--text2)">📱 ${e.phone} · PIN: ${e.pin}</div><span class="badge ${e.active?'badge-green':'badge-red'}" style="margin-top:8px;display:inline-block">${e.active?'Activo':'Inactivo'}</span><div style="margin-top:12px;display:flex;gap:8px;justify-content:center"><button class="btn btn-sm btn-secondary" onclick="openEmpModal(${e.id})">✏️</button><button class="btn btn-sm ${e.active?'btn-danger':'btn-success'}" onclick="S.employees.find(x=>x.id===${e.id}).active=!S.employees.find(x=>x.id===${e.id}).active;render()">${e.active?'Off':'On'}</button><button class="btn btn-sm btn-danger" onclick="if(confirm('¿?')){S.employees=S.employees.filter(x=>x.id!==${e.id});render();}">🗑️</button></div></div></div>`).join('')}</div>`;}
function openEmpModal(id=null){const e=id?S.employees.find(x=>x.id===id):null;openModal(e?'✏️':'➕ Empleado',`<div class="form-group"><label>Nombre</label><input id="en" value="${e?e.name:''}"></div><div class="form-row"><div class="form-group"><label>Rol</label><select id="er"><option value="admin" ${e&&e.role==='admin'?'selected':''}>Admin</option><option value="cashier" ${e&&e.role==='cashier'?'selected':''}>Cajero</option><option value="waiter" ${e&&e.role==='waiter'?'selected':''}>Mesero</option><option value="kitchen" ${e&&e.role==='kitchen'?'selected':''}>Cocina</option></select></div><div class="form-group"><label>PIN</label><input id="ep" value="${e?e.pin:''}" maxlength="4"></div></div><div class="form-group"><label>Tel</label><input id="et" value="${e?e.phone:''}"></div>`,`<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="if(!$('en').value.trim())return toast('Nombre','error');if(${id||0}){Object.assign(S.employees.find(x=>x.id===${id||0}),{name:$('en').value.trim(),role:$('er').value,pin:$('ep').value.trim(),phone:$('et').value.trim()});}else{S.employees.push({id:uid(),name:$('en').value.trim(),role:$('er').value,pin:$('ep').value.trim(),phone:$('et').value.trim(),active:true});}closeModal();render();">OK</button>`);}

function renderReports(){
  const ts=today();
  const ad=S.orders.filter(o=>o.status==='delivered'&&o.paymentMethod);
  const todayO=ad.filter(o=>o.createdAt>=ts);
  const weekO=ad.filter(o=>o.createdAt>=ts-6*dayMs);
  const monthO=ad.filter(o=>o.createdAt>=ts-29*dayMs);
  const todayR=todayO.reduce((s,o)=>s+o.total,0);
  const weekR=weekO.reduce((s,o)=>s+o.total,0);
  const monthR=monthO.reduce((s,o)=>s+o.total,0);

  function calcCost(orders){
    return orders.reduce((s,o)=>s+o.items.reduce((a,i)=>{
      const mi=S.menuItems.find(m=>m.id===i.id);
      return a+(mi?mi.cost:(i.cost||0))*i.qty;
    },0),0);
  }
  const todayCost=calcCost(todayO),weekCost=calcCost(weekO),monthCost=calcCost(monthO);
  const todayProfit=todayR-todayCost,weekProfit=weekR-weekCost,monthProfit=monthR-monthCost;
  const monthMargin=monthR>0?Math.round(monthProfit/monthR*100):0;

  const productStats={};
  monthO.forEach(o=>o.items.forEach(i=>{
    if(!productStats[i.name])productStats[i.name]={qty:0,revenue:0,cost:0};
    const mi=S.menuItems.find(m=>m.id===i.id);
    productStats[i.name].qty+=i.qty;
    productStats[i.name].revenue+=(i.lineTotal||i.price*i.qty);
    productStats[i.name].cost+=(mi?mi.cost:(i.cost||0))*i.qty;
  }));
  const topProducts=Object.entries(productStats).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,6);

  $('content').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <h3 style="font-size:.95rem;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:1px">📊 Reportes Financieros</h3>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="showSalesDetail('month')">📋 Detalle mes</button>
        <button class="btn btn-primary btn-sm" onclick="printReport()">🖨️ Imprimir Reporte</button>
      </div>
    </div>
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card" style="cursor:pointer" onclick="showSalesDetail('today')">
        <div class="top"><span class="label">Ventas Hoy</span><div class="icon-box" style="background:rgba(34,197,94,.15);color:var(--green)">📅</div></div>
        <div class="value">${fmt(todayR)}</div>
        <div class="change ${todayProfit>=0?'up':'down'}">${todayO.length} pedidos · Gan: ${fmt(todayProfit)} · Ver →</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="showSalesDetail('week')">
        <div class="top"><span class="label">Esta Semana</span><div class="icon-box" style="background:rgba(59,130,246,.15);color:var(--blue)">📊</div></div>
        <div class="value">${fmt(weekR)}</div>
        <div class="change ${weekProfit>=0?'up':'down'}">${weekO.length} pedidos · Gan: ${fmt(weekProfit)} · Ver →</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="showSalesDetail('month')">
        <div class="top"><span class="label">Este Mes</span><div class="icon-box" style="background:rgba(168,85,247,.15);color:var(--purple)">📈</div></div>
        <div class="value">${fmt(monthR)}</div>
        <div class="change up">${monthO.length} pedidos · ${monthMargin}% margen · Ver →</div>
      </div>
      <div class="stat-card">
        <div class="top"><span class="label">Ganancia del Mes</span><div class="icon-box" style="background:rgba(245,158,11,.15);color:var(--accent)">💰</div></div>
        <div class="value" style="color:${monthProfit>=0?'var(--green)':'var(--red)'}">${fmt(monthProfit)}</div>
        <div class="change">Costos: ${fmt(monthCost)} · Margen: ${monthMargin}%</div>
      </div>
    </div>
    <div class="grid-2" style="margin-bottom:20px">
      <div class="panel">
        <div class="panel-header"><h3>📊 Ventas vs Ganancia (14 días)</h3></div>
        <div class="panel-body"><canvas id="rpt"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3>🏆 Productos más rentables</h3></div>
        <div class="panel-body">
          ${topProducts.length===0?'<p style="color:var(--text3)">Sin datos este mes</p>':
          topProducts.map(([name,s])=>{
            const margin=s.revenue>0?Math.round((s.revenue-s.cost)/s.revenue*100):0;
            const maxRev=topProducts[0][1].revenue||1;
            return `<div style="margin-bottom:11px">
              <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:3px">
                <span><strong>${name}</strong> <span style="color:var(--text3)">${s.qty} uds</span></span>
                <span style="color:${margin>=50?'var(--green)':margin>=30?'var(--accent)':'var(--red)'}">${margin}% · ${fmt(s.revenue-s.cost)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;background:var(--bg4);border-radius:4px;height:7px;overflow:hidden">
                  <div style="width:${Math.round(s.revenue/maxRev*100)}%;height:100%;background:var(--accent);border-radius:4px"></div>
                </div>
                <span style="font-size:.75rem;color:var(--text2);min-width:72px;text-align:right">${fmt(s.revenue)}</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>💹 Resumen financiero del mes</h3></div>
      <div class="panel-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800">${fmt(monthR)}</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">💵 Ingresos brutos</div></div>
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800;color:var(--red)">${fmt(monthCost)}</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">💸 Costos de productos</div></div>
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800;color:${monthProfit>=0?'var(--green)':'var(--red)'}">${fmt(monthProfit)}</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">📈 Ganancia bruta</div></div>
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800;color:${monthMargin>=40?'var(--green)':monthMargin>=20?'var(--accent)':'var(--red)'}">${monthMargin}%</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">📊 Margen bruto</div></div>
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800">${monthO.length}</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">🧾 Pedidos cobrados</div></div>
          <div style="background:var(--bg3);padding:14px;border-radius:10px;text-align:center"><div style="font-size:1.2rem;font-weight:800;color:var(--accent)">${monthO.length?fmt(Math.round(monthR/monthO.length)):'—'}</div><div style="font-size:.72rem;color:var(--text3);margin-top:3px">🎯 Ticket promedio</div></div>
        </div>
      </div>
    </div>`;

  setTimeout(()=>{
    const c=$('rpt');if(!c)return;
    const w=c.parentElement.clientWidth||400;c.width=w;c.height=220;
    const ctx=c.getContext('2d');
    const revenues=[],costs=[],labels=[];
    for(let d=13;d>=0;d--){
      const s=today()-d*dayMs;
      const dayOrders=S.orders.filter(o=>o.createdAt>=s&&o.createdAt<s+dayMs&&o.status==='delivered'&&o.paymentMethod);
      revenues.push(dayOrders.reduce((a,o)=>a+o.total,0));
      costs.push(calcCost(dayOrders));
      const dt=new Date(s);labels.push(`${dt.getDate()}/${dt.getMonth()+1}`);
    }
    const pad={t:20,r:140,b:44,l:72},cw=w-pad.l-pad.r,ch=155;
    const mx=Math.max(...revenues,...costs,1);
    ctx.clearRect(0,0,w,220);
    for(let i=0;i<=4;i++){
      const y=pad.t+ch-ch*(i/4);
      ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r+100,y);ctx.stroke();
      ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='right';
      ctx.fillText('$'+Math.round(mx*i/4).toLocaleString('es-AR'),pad.l-5,y+4);
    }
    const bw=(cw/14)*0.55,gap=(cw/14)*0.45;
    revenues.forEach((v,i)=>{
      const x=pad.l+(cw/14)*i+(gap/2),bh=Math.max(2,ch*(v/mx)),y=pad.t+ch-bh;
      ctx.fillStyle='rgba(229,62,62,0.65)';ctx.fillRect(x,y,bw,bh);
    });
    ctx.beginPath();ctx.strokeStyle='#22c55e';ctx.lineWidth=2.5;ctx.lineJoin='round';
    revenues.forEach((v,i)=>{
      const profit=v-costs[i];
      const x=pad.l+(cw/14)*i+(gap/2)+bw/2;
      const y=pad.t+ch-Math.max(0,ch*(profit/mx));
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.stroke();
    revenues.forEach((_,i)=>{
      const x=pad.l+(cw/14)*i+(gap/2)+bw/2;
      ctx.save();ctx.translate(x,220-6);ctx.rotate(-0.5);
      ctx.fillStyle='#64748b';ctx.font='9px sans-serif';ctx.textAlign='right';
      ctx.fillText(labels[i],0,0);ctx.restore();
    });
    // Legend
    ctx.fillStyle='rgba(229,62,62,0.65)';ctx.fillRect(w-125,8,14,10);
    ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('Ventas',w-108,18);
    ctx.strokeStyle='#22c55e';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(w-125,28);ctx.lineTo(w-111,28);ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.fillText('Ganancia',w-108,32);
  },50);
}
function printReport(){
  var ts=today();
  var ad=S.orders.filter(function(o){return o.status==='delivered'&&o.paymentMethod;});
  var todayO=ad.filter(function(o){return o.createdAt>=ts;});
  var weekO=ad.filter(function(o){return o.createdAt>=ts-6*dayMs;});
  var monthO=ad.filter(function(o){return o.createdAt>=ts-29*dayMs;});
  var todayR=todayO.reduce(function(s,o){return s+o.total;},0);
  var weekR=weekO.reduce(function(s,o){return s+o.total;},0);
  var monthR=monthO.reduce(function(s,o){return s+o.total;},0);
  function cc(orders){return orders.reduce(function(s,o){return s+o.items.reduce(function(a,i){var mi=S.menuItems.find(function(m){return m.id===i.id;});return a+(mi?mi.cost:(i.cost||0))*i.qty;},0);},0);}
  var monthCost=cc(monthO);
  var monthProfit=monthR-monthCost;
  var monthMargin=monthR>0?Math.round(monthProfit/monthR*100):0;
  var bym={cash:0,card:0,transfer:0};
  monthO.forEach(function(o){bym[o.paymentMethod]=(bym[o.paymentMethod]||0)+o.total;});
  var ps={};
  monthO.forEach(function(o){o.items.forEach(function(i){
    if(!ps[i.name])ps[i.name]={qty:0,revenue:0,cost:0};
    var mi=S.menuItems.find(function(m){return m.id===i.id;});
    ps[i.name].qty+=i.qty;
    ps[i.name].revenue+=(i.lineTotal||i.price*i.qty);
    ps[i.name].cost+=(mi?mi.cost:(i.cost||0))*i.qty;
  });});
  var top=Object.entries(ps).sort(function(a,b){return b[1].revenue-a[1].revenue;}).slice(0,10);
  var rows='';
  top.forEach(function(entry,i){
    var name=entry[0]; var s=entry[1];
    var g=s.revenue-s.cost; var m=s.revenue>0?Math.round(g/s.revenue*100):0;
    rows+='<tr><td><b>'+(i+1)+'</b></td><td>'+name+'</td><td>'+s.qty+'</td><td><b>'+fmt(s.revenue)+'</b></td><td style="color:#c53030">'+fmt(s.cost)+'</td><td style="color:#276749;font-weight:700">'+fmt(g)+'</td><td>'+(m>=50?'<span style="color:#276749">':'<span style="color:#c53030">')+m+'%</span></td></tr>';
  });
  var now2=new Date();
  var body='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte '+S.config.name+'</title>'
    +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;color:#111;padding:28px;font-size:13px;}'
    +'.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #e53e3e;}'
    +'.hdr h1{font-size:22px;font-weight:800;color:#e53e3e;}'
    +'.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e53e3e;margin:20px 0 10px;padding-bottom:5px;border-bottom:1px solid #eee;}'
    +'.srow{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;}'
    +'.sbox{background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:12px;text-align:center;}'
    +'.sbox .v{font-size:16px;font-weight:800;} .sbox .l{font-size:10px;color:#888;margin-top:3px;}'
    +'.fg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}'
    +'.fc{background:#f9f9f9;border-left:3px solid #e53e3e;padding:10px 12px;border-radius:0 6px 6px 0;}'
    +'.fc .t{font-size:10px;color:#888;} .fc .a{font-size:15px;font-weight:800;}'
    +'.pr{display:flex;gap:10px;margin-bottom:16px;}'
    +'.pb{flex:1;background:#f9f9f9;border-radius:6px;padding:10px;text-align:center;border:1px solid #eee;}'
    +'.pb .a{font-size:14px;font-weight:700;} .pb .l{font-size:10px;color:#888;margin-top:3px;}'
    +'table{width:100%;border-collapse:collapse;} th{text-align:left;padding:7px 8px;font-size:10px;text-transform:uppercase;background:#f0f0f0;border-bottom:2px solid #e53e3e;}'
    +'td{padding:7px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;} tr:nth-child(even) td{background:#fafafa;}'
    +'.ftr{margin-top:24px;padding-top:12px;border-top:1px solid #eee;text-align:center;color:#999;font-size:10px;}'
    +'@media print{body{padding:12px;}@page{margin:1.5cm;}}</style></head><body>'
    +'<div class="hdr"><div><h1>'+S.config.name+'</h1>'
    +'<div style="font-size:11px;color:#666;margin-top:4px">'+(S.config.address||'')+(S.config.phone?' &middot; '+S.config.phone:'')+'</div>'
    +'<div style="font-size:12px;font-weight:700;margin-top:6px;color:#e53e3e">REPORTE FINANCIERO &mdash; LTIMOS 30 DIAS</div></div>'
    +'<div style="text-align:right;font-size:11px;color:#666">Generado: '+now2.toLocaleString('es-AR')+'<br>Pedidos cobrados: <b>'+monthO.length+'</b></div></div>'
    +'<div class="sec">Resumen General</div>'
    +'<div class="srow">'
    +'<div class="sbox"><div class="v">'+fmt(todayR)+'</div><div class="l">Ventas Hoy</div></div>'
    +'<div class="sbox"><div class="v">'+fmt(weekR)+'</div><div class="l">Esta Semana</div></div>'
    +'<div class="sbox"><div class="v">'+fmt(monthR)+'</div><div class="l">Este Mes</div></div>'
    +'<div class="sbox"><div class="v" style="color:'+(monthProfit>=0?'#276749':'#c53030')+'">'+fmt(monthProfit)+'</div><div class="l">Ganancia del Mes</div></div>'
    +'</div>'
    +'<div class="sec">Desglose Financiero del Mes</div>'
    +'<div class="fg">'
    +'<div class="fc"><div class="t">Ingresos Brutos</div><div class="a">'+fmt(monthR)+'</div></div>'
    +'<div class="fc" style="border-left-color:#c53030"><div class="t">Costos de Productos</div><div class="a" style="color:#c53030">'+fmt(monthCost)+'</div></div>'
    +'<div class="fc" style="border-left-color:#276749"><div class="t">Ganancia Bruta</div><div class="a" style="color:#276749">'+fmt(monthProfit)+'</div></div>'
    +'<div class="fc"><div class="t">Margen Bruto</div><div class="a">'+monthMargin+'%</div></div>'
    +'<div class="fc"><div class="t">Ticket Promedio</div><div class="a">'+(monthO.length?fmt(Math.round(monthR/monthO.length)):'—')+'</div></div>'
    +'<div class="fc"><div class="t">Total Pedidos</div><div class="a">'+monthO.length+'</div></div>'
    +'</div>'
    +'<div class="sec">Metodos de Pago</div>'
    +'<div class="pr">'
    +'<div class="pb"><div class="a">'+fmt(bym.cash||0)+'</div><div class="l">Efectivo</div></div>'
    +'<div class="pb"><div class="a">'+fmt(bym.card||0)+'</div><div class="l">Tarjeta</div></div>'
    +'<div class="pb"><div class="a">'+fmt(bym.transfer||0)+'</div><div class="l">Transferencia</div></div>'
    +'</div>'
    +'<div class="sec">Top Productos del Mes</div>'
    +'<table><thead><tr><th>#</th><th>Producto</th><th>Cant</th><th>Ingresos</th><th>Costo</th><th>Ganancia</th><th>Margen</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="ftr">'+S.config.name+' &mdash; Reporte generado por La Mente Maestra &mdash; '+now2.toLocaleDateString('es-AR')+'</div>'
    +'</body></html>';
  var pw=window.open('','_blank','width=900,height=700');
  if(!pw){toast('Permitir popups para imprimir','warning');return;}
  pw.document.write(body);
  pw.document.close();
  setTimeout(function(){pw.print();},500);
}

function showSalesDetail(period){
  window._salesPeriod=period||'today';
  _renderSalesModal();
}

function _renderSalesModal(){
  const period=window._salesPeriod||'today';
  const ts=today();
  const ranges={
    today:{start:ts,label:'Hoy',days:1},
    week:{start:ts-6*dayMs,label:'Esta Semana',days:7},
    month:{start:ts-29*dayMs,label:'Este Mes',days:30}
  };
  const {start,label}=ranges[period];
  const allPaid=S.orders.filter(o=>o.status==='delivered'&&o.paymentMethod);
  const orders=allPaid.filter(o=>o.createdAt>=start).sort((a,b)=>b.createdAt-a.createdAt);
  const total=orders.reduce((s,o)=>s+o.total,0);
  const cost=orders.reduce((s,o)=>s+o.items.reduce((a,i)=>a+(i.cost||0)*i.qty,0),0);
  const byMethod={cash:0,card:0,transfer:0};
  orders.forEach(o=>{byMethod[o.paymentMethod]=(byMethod[o.paymentMethod]||0)+o.total;});

  const tabs=['today','week','month'].map(p=>`
    <button onclick="window._salesPeriod='${p}';_renderSalesModal()" style="flex:1;padding:9px;border-radius:8px;border:none;cursor:pointer;font-weight:700;font-size:.82rem;transition:.2s;
      background:${p===period?'var(--accent)':'var(--bg4)'};color:${p===period?'#000':'var(--text2)'}">
      ${{today:'📅 Hoy',week:'📊 Semana',month:'📈 Mes'}[p]}
    </button>`).join('');

  const body=`
    <div style="display:flex;gap:6px;margin-bottom:16px;background:var(--bg3);padding:6px;border-radius:10px">${tabs}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:var(--bg3);padding:12px;border-radius:8px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--accent)">${fmt(total)}</div>
        <div style="font-size:.75rem;color:var(--text2);margin-top:2px">${orders.length} pedidos cobrados</div>
      </div>
      <div style="background:var(--bg3);padding:12px;border-radius:8px;text-align:center">
        <div style="font-size:1.5rem;font-weight:800;color:var(--green)">${fmt(total-cost)}</div>
        <div style="font-size:.75rem;color:var(--text2);margin-top:2px">Ganancia estimada</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:80px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);padding:10px;border-radius:8px;text-align:center">
        <div style="font-weight:700;color:var(--green)">${fmt(byMethod.cash||0)}</div>
        <div style="font-size:.7rem;color:var(--text3)">💵 Efectivo</div>
      </div>
      <div style="flex:1;min-width:80px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);padding:10px;border-radius:8px;text-align:center">
        <div style="font-weight:700;color:var(--blue)">${fmt(byMethod.card||0)}</div>
        <div style="font-size:.7rem;color:var(--text3)">💳 Tarjeta</div>
      </div>
      <div style="flex:1;min-width:80px;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.2);padding:10px;border-radius:8px;text-align:center">
        <div style="font-weight:700;color:var(--purple)">${fmt(byMethod.transfer||0)}</div>
        <div style="font-size:.7rem;color:var(--text3)">📱 Transfer.</div>
      </div>
    </div>
    <div style="max-height:40vh;overflow-y:auto">
      <table class="data-table"><thead><tr><th>#</th><th>Hora</th><th>Tipo</th><th>Pago</th><th>Total</th><th></th></tr></thead><tbody>
      ${orders.length===0
        ?'<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:24px">Sin ventas en este período</td></tr>'
        :orders.map(o=>`<tr>
          <td><strong style="color:var(--accent)">#${o.id}</strong></td>
          <td style="font-size:.78rem;color:var(--text2)">${new Date(o.createdAt).toLocaleString('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
          <td style="font-size:.8rem">${o.type==='dine-in'?'Mesa '+(o.tableId||'-'):o.type==='takeaway'?'🥡':' 🛵'}</td>
          <td><span class="badge badge-${o.paymentMethod==='cash'?'green':o.paymentMethod==='card'?'blue':'purple'}">${{cash:'💵',card:'💳',transfer:'📱'}[o.paymentMethod]||''}</span></td>
          <td style="font-weight:700">${fmt(o.total)}</td>
          <td><button class="btn btn-sm btn-secondary" onclick="closeModal();printReceipt(S.orders.find(x=>x.id===${o.id}),0)" title="Ver ticket">🧾</button></td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;

  openModal(`📊 Ventas — ${label}`,body,`<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" onclick="doPrint()">🖨️ Imprimir</button>`);
  setTimeout(()=>{$('modal').style.maxWidth='720px';},10);
}


function renderSettings(){
  const reg = JSON.parse(localStorage.getItem('mente_maestra_registration') || '{}');
  $('content').innerHTML = `
<div class="settings-container">
  <!-- RESTAURANTE -->
  <div class="settings-section">
    <h3 class="settings-h3-icon"><span class="material-symbols-rounded">store</span> Restaurante</h3>
    <div class="form-group">
      <label>Nombre</label>
      <input value="${S.config.name}" onchange="S.config.name=this.value;saveState()">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Dirección</label>
        <input value="${S.config.address}" onchange="S.config.address=this.value;saveState()">
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input value="${S.config.phone}" onchange="S.config.phone=this.value;saveState()">
      </div>
    </div>
  </div>

  <!-- FINANZAS -->
  <div class="settings-section">
    <h3 class="settings-h3-icon"><span class="material-symbols-rounded">payments</span> Finanzas</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Moneda</label>
        <select onchange="S.config.currency=this.value;saveState()">
          <option value="$" ${S.config.currency==='$'?'selected':''}>$ Peso AR</option>
          <option value="USD" ${S.config.currency==='USD'?'selected':''}>USD Dólar</option>
          <option value="€" ${S.config.currency==='€'?'selected':''}>€ Euro</option>
          <option value="S/" ${S.config.currency==='S/'?'selected':''}>S/ Sol</option>
        </select>
      </div>
      <div class="form-group">
        <label>IVA %</label>
        <input type="number" min="0" max="50" value="${S.config.taxRate}" onchange="S.config.taxRate=+this.value;saveState()">
      </div>
    </div>
  </div>

  <!-- TICKET -->
  <div class="settings-section">
    <h3 class="settings-h3-icon"><span class="material-symbols-rounded">receipt_long</span> Ticket</h3>
    <div class="form-group">
      <label>Pie de Ticket</label>
      <textarea rows="2" onchange="S.config.ticketFooter=this.value;saveState()">${S.config.ticketFooter}</textarea>
    </div>
  </div>

  <!-- SESIÓN -->
  <div class="settings-section">
    <h3 class="settings-h3-icon"><span class="material-symbols-rounded">account_circle</span> Sesión</h3>
    <div class="settings-user">
      <strong>${reg.name || '—'}</strong><br>
      <div style="display:flex; align-items:center; gap:5px; margin-top:5px; font-size:0.8rem; color:var(--text2);">
        <span class="material-symbols-rounded" style="font-size:16px;">mail</span> ${reg.email || '—'}
      </div>
      <div style="display:flex; align-items:center; gap:5px; margin-top:3px; font-size:0.8rem; color:var(--text2);">
        <span class="material-symbols-rounded" style="font-size:16px;">calendar_today</span> ${reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('es-AR') : '—'}
      </div>
    </div>
    <button class="btn btn-danger btn-sm" style="margin-top:15px;" onclick="doLogout()">
      <span class="material-symbols-rounded" style="font-size:18px;">logout</span> Cerrar Sesión
    </button>
  </div>

  <!-- DATOS -->
  <div class="settings-section">
    <h3 class="settings-h3-icon"><span class="material-symbols-rounded">database</span> Datos</h3>
    <div class="settings-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-secondary" onclick="exportData()">
        <span class="material-symbols-rounded">download</span> Exportar
      </button>
      <button class="btn btn-secondary" onclick="$('imp').click()">
        <span class="material-symbols-rounded">upload</span> Importar
      </button>
      <input type="file" id="imp" accept=".json" style="display:none" onchange="importData(this)">
      <button class="btn btn-danger" onclick="resetSystem()">
        <span class="material-symbols-rounded">delete_forever</span> Reset
      </button>
    </div>
  </div>
</div>
`;
}

// Nota: He creado pequeñas funciones de ayuda para que el HTML del botón de Datos sea más limpio
function exportData() {
  const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(b);
  a.download='mente_maestra_backup.json';
  a.click();
  toast('Backup descargado','success');
}

function importData(input) {
  const r=new FileReader();
  r.onload=function(){
    try{
      Object.assign(S,JSON.parse(r.result));
      saveState(); render();
      toast('Datos importados','success');
    }catch(e){ toast('Archivo inválido','error'); }
  };
  r.readAsText(input.files[0]);
}

function resetSystem() {
  if(confirm('¿BORRAR TODO?') && confirm('¿ESTÁS SEGURO?')){
    localStorage.removeItem('mente_maestra_state');
    location.reload();
  }
}





// ============================================================
//  KITCHEN DISPLAY MODE
// ============================================================
function isKitchenMode(){return location.search.includes('mode=kitchen');}
function renderKDS(){
  document.body.innerHTML=`<div style="background:var(--bg);min-height:100vh;padding:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:var(--bg2);border-radius:var(--radius);margin-bottom:20px">
      <h1 style="font-size:1.3rem;background:linear-gradient(135deg,#e8edf5,var(--accent3));-webkit-background-clip:text;-webkit-text-fill-color:transparent">🧠 COCINA — ${S.config.name}</h1>
      <div style="display:flex;gap:16px;align-items:center">
        <div style="background:var(--bg3);padding:8px 16px;border-radius:8px;text-align:center"><div style="font-size:1.5rem;font-weight:800" id="kp">0</div><div style="font-size:.7rem;color:var(--text2)">PENDIENTES</div></div>
        <div style="background:var(--bg3);padding:8px 16px;border-radius:8px;text-align:center"><div style="font-size:1.5rem;font-weight:800" id="kpr">0</div><div style="font-size:.7rem;color:var(--text2)">PREPARANDO</div></div>
        <div style="background:var(--bg3);padding:8px 16px;border-radius:8px;text-align:center"><div style="font-size:1.5rem;font-weight:800" id="kr">0</div><div style="font-size:.7rem;color:var(--text2)">LISTOS</div></div>
        <span id="clock" style="font-size:1.1rem;font-weight:700;color:var(--text2)"></span>
      </div>
    </div>
    <div class="kitchen-grid" id="kds-grid"></div>
  </div><div class="toast-container" id="toast-container"></div>`;
  updKDS();setInterval(updKDS,3000);
  if(kCh)kCh.onmessage=e=>{if(e.data.type==='new_order'){loadState();updKDS();playSound();toast('🔔 Nuevo pedido!','warning');}};
}
function updKDS(){loadState();const ko=S.orders.filter(o=>o.status==='pending'||o.status==='preparing'||o.status==='ready').sort((a,b)=>a.createdAt-b.createdAt);const el=document.getElementById;
  if($('kp'))$('kp').textContent=ko.filter(o=>o.status==='pending').length;
  if($('kpr'))$('kpr').textContent=ko.filter(o=>o.status==='preparing').length;
  if($('kr'))$('kr').textContent=ko.filter(o=>o.status==='ready').length;
  const g=$('kds-grid');if(!g)return;
  g.innerHTML=ko.length===0?'<div style="text-align:center;padding:80px;color:var(--text3);grid-column:1/-1"><div style="font-size:4rem;margin-bottom:12px">👨‍🍳</div><h2>Esperando...</h2></div>':
  ko.map(o=>{const el=Math.floor((now()-o.createdAt)/60000);const label=o.type==='dine-in'?'MESA '+(o.tableId||'-'):o.type==='takeaway'?'🥡 LLEVAR':'🛵 DELIVERY';
    return `<div class="kitchen-card ${el>15?'kds-blink':''}"><div class="kitchen-card-header ${o.status}" style="font-size:1.1rem"><span>#${o.id} · ${label}</span><span class="timer" style="font-size:1rem;${el>20?'color:var(--red)':''}">${el}min</span></div>
      <div class="kitchen-card-body" style="font-size:1rem">${o.items.map(i=>`<div class="kitchen-item" style="padding:10px 0"><span><span class="ki-qty" style="font-size:1rem;padding:4px 12px">${i.qty}</span> ${i.emoji} <strong>${i.name}</strong></span>${i.note?`<span style="color:var(--accent)">📝 ${i.note}</span>`:''}</div>`).join('')}</div>
      <div class="kitchen-card-footer" style="padding:12px 16px">
        ${o.status==='pending'?`<button class="btn btn-primary" style="font-size:1rem;padding:12px" onclick="kdsUpd(${o.id},'preparing')">👨‍🍳 PREPARAR</button><button class="btn btn-success" style="padding:12px" onclick="kdsChargeModal(${o.id})">💳 COBRAR</button><button class="btn btn-danger" style="padding:12px" onclick="kdsUpd(${o.id},'cancelled')">❌</button>`:''}
        ${o.status==='preparing'?`<button class="btn btn-success" style="font-size:1rem;padding:12px" onclick="kdsUpd(${o.id},'ready')">✅ LISTO</button><button class="btn btn-primary" style="padding:12px" onclick="kdsChargeModal(${o.id})">💳 COBRAR</button>`:''}
        ${o.status==='ready'?`<button class="btn btn-primary" style="font-size:1rem;padding:12px" onclick="kdsUpd(${o.id},'delivered')">🍽️ ENTREGADO</button><button class="btn btn-success" style="padding:12px" onclick="kdsChargeModal(${o.id})">💳 COBRAR</button>`:''}
      </div></div>`;}).join('');
}
function kdsUpd(id,st){const o=S.orders.find(x=>x.id===id);if(!o)return;o.status=st;saveState();broadcast('status_update',{orderId:id,status:st});playSound();updKDS();toast({preparing:'Preparando #'+id,ready:'#'+id+' LISTO!',delivered:'Entregado',cancelled:'Cancelado'}[st],'success');}

function kdsChargeModal(id){
  loadState();const o=S.orders.find(x=>x.id===id);if(!o)return;
  const tot=o.total;
  const div=document.createElement('div');
  div.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center';
  div.innerHTML=`<div style="background:var(--bg2);padding:28px;border-radius:16px;width:360px;max-width:95vw">
    <h3 style="margin-bottom:16px">💳 Cobrar Pedido #${o.id}</h3>
    <div style="font-size:2rem;font-weight:800;color:var(--accent);text-align:center;margin-bottom:16px">$ ${tot.toLocaleString('es-AR',{minimumFractionDigits:2})}</div>
    <div style="margin-bottom:12px"><label style="font-size:.85rem;color:var(--text2)">Método</label><select id="kds-pay-m" style="width:100%;padding:10px;background:var(--bg3);border:1px solid var(--bg4);color:var(--text);border-radius:8px;margin-top:4px"><option value="cash">💵 Efectivo</option><option value="card">💳 Tarjeta</option><option value="transfer">📱 Transferencia</option></select></div>
    <div style="margin-bottom:12px"><label style="font-size:.85rem;color:var(--text2)">Recibido</label><input type="number" id="kds-recv" value="${tot}" min="0" style="width:100%;padding:10px;background:var(--bg3);border:1px solid var(--bg4);color:var(--text);border-radius:8px;margin-top:4px" oninput="const c=this.value-${tot};document.getElementById('kds-chg').textContent=c>=0?'Cambio: $'+c.toFixed(2):'Insuficiente';document.getElementById('kds-chg').style.color=c>=0?'var(--green)':'var(--red)'"></div>
    <div id="kds-chg" style="text-align:center;font-weight:700;color:var(--green);margin-bottom:16px"></div>
    <div style="display:flex;gap:8px"><button onclick="this.closest('[style*=fixed]').remove()" style="flex:1;padding:12px;background:var(--bg4);color:var(--text);border:none;border-radius:8px;cursor:pointer;font-size:1rem">Cancelar</button>
    <button onclick="const m=document.getElementById('kds-pay-m').value;const r=+document.getElementById('kds-recv').value;if(m==='cash'&&r<${tot}){alert('Monto insuficiente');return;}loadState();const o=S.orders.find(x=>x.id===${id});if(o){o.status='delivered';o.paymentMethod=m;if(o.tableId){const t=S.tables.find(x=>x.id===o.tableId);if(t&&!t.isCaja){t.status='free';t.orderId=null;t.openedAt=null;}}saveState();}this.closest('[style*=fixed]').remove();updKDS();" style="flex:1;padding:12px;background:var(--green);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem;font-weight:700">✅ COBRAR</button></div>
  </div>`;
  document.body.appendChild(div);
}

// ============================================================
//  EXPIRY CHECK + AUTO NOTIFS
// ============================================================
function checkExpiry(){
  const e=getExpiringItems();
  const exp=e.filter(i=>i.expiryStatus==='expired');
  const crit=e.filter(i=>i.expiryStatus==='critical');
  if(exp.length){toast(`🚨 ${exp.length} producto(s) VENCIDO(S)`,'error');addNotif('🚨',`${exp.length} producto(s) vencido(s): ${exp.map(i=>i.name).join(', ')}`);}
  if(crit.length){toast(`⚠️ ${crit.length} vencen pronto`,'warning');addNotif('⚠️',`${crit.length} producto(s) vencen en ≤3 días`);}
}

// ============================================================
//  INIT
// ============================================================
if(isKitchenMode()){renderKDS();}
else{if(checkRegistration()){render();setTimeout(checkExpiry,2000);setTimeout(checkStockAlerts,3000);setInterval(checkExpiry,18e5);setInterval(checkStockAlerts,300000);updateNotifDot();}}
