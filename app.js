(() => {
const STORAGE_KEY='descanso-site-content-v1', THEME_KEY='descanso-site-theme-v1', PENDING_KEY='descanso-site-pending-v1';
const THEMES=Array.isArray(window.DESCANSO_THEMES)?window.DESCANSO_THEMES:[];
const defaults={
 cafeName:'Descanso Comida • Cafe',
 intro:'A welcoming venue, thoughtful details, and delicious food for the celebrations you’ll remember.',
 packages:[
  {name:'Buffet Style',tag:'A COMPLETE EVENT SETUP',price:'₱450',unit:'per head',minimum:'Minimum of 50 guests',capacity:'Venue capacity: 100 guests',description:'A buffet package with venue essentials, food, and service details included.',inclusions:['4 hours use of venue','Free use of celebrant’s couch','Free use of curtain backdrop with monogram','Free use of stage platform','Tables & chairs, plates, silverware, and glassware for guests','Simple table centerpiece and table number','Gift table','Registration table','Cake table','3 entrées: chicken, pork, and pasta/noodles','1 dessert','1 drink','Steamed rice']},
  {name:'Consumable',tag:'FLEXIBLE FOOD & VENUE OPTION',price:'₱15,000',unit:'minimum consumable amount',minimum:'Minimum consumable amount: ₱15,000',capacity:'Venue capacity: 100 guests',description:'Choose dishes from the cafe menu to meet the consumable amount.',inclusions:['4 hours use of venue','Free use of celebrant’s couch','Free use of curtain backdrop with monogram','Free use of stage platform','Tables & chairs, plates, silverware, and glassware for guests','Simple table centerpiece and table number','Gift table','Registration table','Cake table','Choose dishes from our menu to meet the consumable amount']}
 ],
 menu:{
  Chicken:['Flavored Chicken Wings','Chicken Katsudon','Chicken Teriyaki','Chicken BBQ'],
  Pork:['Pork Kaldereta','Pork Asado','Pork Sisig','Pork with Mushroom Cream Sauce'],
  Pasta:['Marinara','Margherita','Aglio Oglio'],
  Noodles:['Japchae','Chicken Pad Thai','Pancit Canton','Pancit Bihon'],
  Juice:['Blue Lemonade','Red Iced Tea','Lemon Iced Tea','Lychee'],
  Dessert:['Mango Panna Cotta','Coffee Jelly','Buko Pandan','Leche Flan']
 },
 galleryCount:48,venueCapacity:100
};
let content=readLocal(), supa=null, session=null, activeCategory='Chicken', galleryShown=12;
const $=id=>document.getElementById(id);
function clone(x){return JSON.parse(JSON.stringify(x))}
function readLocal(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||clone(defaults)}catch{return clone(defaults)}}
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(content));localStorage.setItem(PENDING_KEY,'1')}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function status(msg,good=true){$('syncStatus').innerHTML=`<span class="dot" style="background:${good?'#78916c':'#c28b55'}"></span><span>${msg}</span>`}
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderPackages(){
 const capacity=Math.max(1,Number(content.venueCapacity)||100);
 $('packageGrid').innerHTML=(content.packages||[]).map((p,i)=>{
  const capacityNote=/venue capacity/i.test(p.capacity||'')?`Venue capacity: ${capacity} guests`:p.capacity;
  return `<article class="package-card ${i===0?'featured':''}"><span class="eyebrow">${escapeHTML(p.tag)}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="price">${escapeHTML(p.price)} <small>${escapeHTML(p.unit)}</small></div><p>${escapeHTML(p.minimum)}<br>${escapeHTML(capacityNote)}</p><ul>${(p.inclusions||[]).map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></article>`;
 }).join('');
}
function renderMenu(){
 const cats=Object.keys(content.menu||{});if(!cats.includes(activeCategory))activeCategory=cats[0];
 $('menuTabs').innerHTML=cats.map(c=>`<button class="menu-tab ${c===activeCategory?'active':''}" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('');
 $('menuPanel').innerHTML=`<div class="menu-group"><h3>${escapeHTML(activeCategory)}</h3><ul>${(content.menu[activeCategory]||[]).map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></div><div class="menu-group"><h3>For your celebration</h3><p style="font-size:12px;color:var(--muted);line-height:1.9">Choose from our menu options when planning your buffet or consumable package. Please confirm your final selections and availability directly with the cafe.</p></div>`;
 $('menuTabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.category;renderMenu()}));
}
// Only the cafe's JPG event photos are shown in the public gallery (original files 6–53).
const GALLERY_PHOTOS=Array.from({length:48},(_,i)=>i+6);
function renderGallery(){
 const total=GALLERY_PHOTOS.length;
 const shown=GALLERY_PHOTOS.slice(0,galleryShown);
 $('galleryGrid').innerHTML=shown.map(n=>{
  const src=`event-gallery/${n}.jpg`;
  return `<div class="gallery-tile"><img src="${src}" alt="Descanso event gallery photo" loading="lazy" onerror="this.remove()"><span class="placeholder">Photo coming soon</span></div>`;
 }).join('');
 $('loadMore').hidden=galleryShown>=total;
}

function renderIntroSettings(){
 const name=(content.cafeName||defaults.cafeName).trim();
 const parts=name.split(/\s+/);
 const first=parts.shift()||name;
 const rest=parts.join(' ');
 document.querySelectorAll('.brand').forEach(brand=>{
  const main=brand.querySelector('b'), sub=brand.querySelector('small');
  if(main)main.textContent=first.toLowerCase();
  if(sub){sub.textContent=rest.toUpperCase();sub.hidden=!rest;}
  brand.setAttribute('aria-label',name);
 });
 const heroName=document.querySelector('.hero-copy > .eyebrow');
 if(heroName)heroName.textContent=name.toUpperCase();
 const artName=document.querySelector('.art-card small');
 if(artName)artName.textContent=name.toUpperCase().replace(/\s*•\s*/g,' · ');
 const galleryEyebrow=document.querySelector('.gallery-section .section-heading .eyebrow');
 if(galleryEyebrow)galleryEyebrow.textContent='MOMENTS AT '+name.toUpperCase();
 const heroIntro=document.querySelector('.hero-intro');
 if(heroIntro)heroIntro.textContent=content.intro??defaults.intro;
 const logo=$('brandLogo');
 if(logo)logo.alt=name+' logo';
 const capacity=Math.max(1,Number(content.venueCapacity)||100);
 const venueCopy=document.querySelector('.venue-section > div:nth-child(2) > p');
 if(venueCopy)venueCopy.textContent=`Our venue can accommodate up to ${capacity} guests. Get in touch with the cafe to discuss your date, preferred package, and event details.`;
 const capacityNumber=document.querySelector('.venue-facts > div:first-child > b');
 if(capacityNumber)capacityNumber.textContent=String(capacity);
 document.title=name+' | Events & Catering';
 const description=document.querySelector('meta[name="description"]');
 if(description)description.content=`Explore events, venue packages and catering from ${name}.`;
}
function render(){renderIntroSettings();renderPackages();renderMenu();renderGallery()}
function themeById(id){return THEMES.find(t=>t.id===Number(id))||THEMES[0]}
function applyTheme(id,persist=true){const t=themeById(id);if(!t)return;const c=t.colors,r=document.documentElement;const isDark=[33,34,35,36,39].includes(t.id);const vars={'--theme-header':c.Header,'--theme-bg':c.Background,'--theme-card':c.Card,'--theme-text':c['Primary Text'],'--theme-muted':c['Muted Text'],'--theme-accent':c.Accent,'--theme-accent-text':c['Accent Text'],'--theme-border':c.Border,'--theme-soft':c.Soft,'--theme-on-header':isDark?c['Primary Text']:c.Background};Object.entries(vars).forEach(([k,v])=>r.style.setProperty(k,v));r.style.colorScheme=isDark?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',c.Header);const logo=$('brandLogo');if(logo){logo.onerror=()=>{logo.onerror=null;logo.src='logos/1.png'};logo.src=`logos/${t.id}.png`}const select=$('themeSelect');if(select)select.value=String(t.id);$('themeName').textContent=t.name;$('themeCollection').textContent=t.collection;$('themeNumber').textContent=String(t.id).padStart(2,'0')+' / 50';$('themeSwatches').innerHTML=[c.Header,c.Background,c.Card,c.Accent,c.Soft].map(color=>`<span style="background:${color}"></span>`).join('');if(persist)localStorage.setItem(THEME_KEY,String(t.id));}
function setupThemes(){const select=$('themeSelect');if(!select)return;select.innerHTML=THEMES.map(t=>`<option value="${t.id}">${String(t.id).padStart(2,'0')} · ${escapeHTML(t.name)} — ${escapeHTML(t.collection)}</option>`).join('');const saved=Number(localStorage.getItem(THEME_KEY)||1);applyTheme(saved,false);select.addEventListener('change',()=>applyTheme(select.value,false));$('themeOpen').addEventListener('click',()=>$('themeModal').hidden=false);$('themeClose').addEventListener('click',()=>$('themeModal').hidden=true);$('themeModal').addEventListener('click',e=>{if(e.target===$('themeModal'))$('themeModal').hidden=true});$('applyTheme').addEventListener('click',()=>{applyTheme(select.value,true);$('themeModal').hidden=true;toast('Theme applied and saved on this device.')});$('resetTheme').addEventListener('click',()=>{applyTheme(1,true);toast('Original theme restored.')});}
async function connectCloud(){
 if(!window.supabase||!window.DESCANSO_SUPABASE_URL||!window.DESCANSO_SUPABASE_PUBLISHABLE_KEY){status('Local mode · cloud library not loaded',false);return}
 supa=window.supabase.createClient(window.DESCANSO_SUPABASE_URL,window.DESCANSO_SUPABASE_PUBLISHABLE_KEY);
 const {data:{session:s}}=await supa.auth.getSession();session=s;
 supa.auth.onAuthStateChange((_event,s)=>{session=s;updateAdminView()});
 await pullCloud();
}
async function pullCloud(){
 if(!supa||!navigator.onLine)return;
 status('Checking cloud…');
 const {data,error}=await supa.from('descanso_site').select('content').eq('id',1).maybeSingle();
 if(error){status('Local mode · cloud setup needed',false);return}
 if(data?.content&&Object.keys(data.content).length){
  if(localStorage.getItem(PENDING_KEY)==='1'){await pushCloud();return}
  content={...clone(defaults),...data.content};localStorage.setItem(STORAGE_KEY,JSON.stringify(content));render();status('Cloud content loaded');
 }else status('Cloud ready · publish initial content after setup');
}
async function pushCloud(){
 if(!supa||!session||!navigator.onLine){status('Saved on this device · waiting for connection',false);return}
 const {error}=await supa.from('descanso_site').update({content,updated_at:new Date().toISOString()}).eq('id',1);
 if(error){status('Saved locally · cloud sync needs attention',false);console.error(error);return}
 localStorage.removeItem(PENDING_KEY);status('All changes synced');toast('Changes saved and synced to cloud.');
}
function renderAdminEditor(){
 $('editCafeName').value=content.cafeName||'';$('editIntro').value=content.intro||'';$('editCapacity').value=content.venueCapacity||100;
 $('packageEditor').innerHTML=(content.packages||[]).map((p,i)=>`<article class="admin-item" data-package="${i}"><div class="admin-item-heading"><strong>Package ${i+1}</strong><button type="button" class="text-link remove-package" data-index="${i}">Remove</button></div><div class="admin-fields"><label>Package name<input data-field="name" value="${escapeHTML(p.name)}"></label><label>Small heading<input data-field="tag" value="${escapeHTML(p.tag)}"></label><label>Price<input data-field="price" value="${escapeHTML(p.price)}"></label><label>Price details<input data-field="unit" value="${escapeHTML(p.unit)}" placeholder="e.g. per person"></label><label>Short description<textarea data-field="description" rows="2">${escapeHTML(p.description)}</textarea></label><label>Minimum booking<input data-field="minimum" value="${escapeHTML(p.minimum)}"></label><label>Venue capacity note<input data-field="capacity" value="${escapeHTML(p.capacity)}"></label><label class="wide-field">What's included? <span class="field-note">Write one inclusion per line.</span><textarea data-field="inclusions" rows="6">${escapeHTML((p.inclusions||[]).join('\n'))}</textarea></label></div></article>`).join('');
 $('menuEditor').innerHTML=Object.entries(content.menu||{}).map(([cat,items],i)=>`<article class="admin-item menu-edit-item"><div class="admin-item-heading"><strong>Menu category ${i+1}</strong><button type="button" class="text-link remove-category" data-category="${escapeHTML(cat)}">Remove</button></div><label>Category name<input class="menu-category-name" value="${escapeHTML(cat)}"></label><label>Menu items <span class="field-note">One item per line.</span><textarea class="menu-category-items" rows="5">${escapeHTML((items||[]).join('\n'))}</textarea></label></article>`).join('');
}
function updateAdminView(){
 $('loginView').hidden=!!session;$('editorView').hidden=!session;
 if(session){$('adminUser').textContent=session.user.email;renderAdminEditor()}
}
async function login(){
 $('loginMessage').textContent='Signing in…';
 if(!supa){$('loginMessage').textContent='Cloud client is unavailable. Check your connection and configuration.';return}
 const {data,error}=await supa.auth.signInWithPassword({email:$('adminEmail').value.trim(),password:$('adminPassword').value});
 if(error){$('loginMessage').textContent='We could not sign you in. Please check your email and password.';return}
 session=data.session;updateAdminView();$('loginMessage').textContent='';
 if(localStorage.getItem(PENDING_KEY)==='1')await pushCloud();
}
function collectAdminEditor(){
 const packages=[...$('packageEditor').querySelectorAll('[data-package]')].map(card=>{const val=field=>card.querySelector(`[data-field="${field}"]`)?.value.trim()||'';return {name:val('name'),tag:val('tag'),price:val('price'),unit:val('unit'),description:val('description'),minimum:val('minimum'),capacity:val('capacity'),inclusions:val('inclusions').split('\n').map(x=>x.trim()).filter(Boolean)}});
 const menu={};[...$('menuEditor').querySelectorAll('.menu-edit-item')].forEach(card=>{const name=card.querySelector('.menu-category-name').value.trim();const items=card.querySelector('.menu-category-items').value.split('\n').map(x=>x.trim()).filter(Boolean);if(name)menu[name]=items});
 const venueCapacity=Math.max(1,Number($('editCapacity').value)||100);
 packages.forEach(p=>{if(/venue capacity/i.test(p.capacity||''))p.capacity=`Venue capacity: ${venueCapacity} guests`});
 return {...clone(content),cafeName:$('editCafeName').value.trim()||defaults.cafeName,intro:$('editIntro').value.trim(),venueCapacity,packages,menu};
}
async function saveEditor(){
 const next=collectAdminEditor();
 if(!next.packages.length){$('saveMessage').textContent='Please keep at least one event package.';return}
 if(!Object.keys(next.menu).length){$('saveMessage').textContent='Please keep at least one menu category.';return}
 if(next.packages.some(p=>!p.name||!p.price)){$('saveMessage').textContent='Please add a name and price to every package.';return}
 content=next;saveLocal();render();$('saveMessage').textContent='Your changes are saved on this device.';
 if(navigator.onLine&&session)await pushCloud();else status('Saved locally · will sync when online',false);
}
function addPackage(){content.packages.push({name:'New package',tag:'',price:'',unit:'',minimum:'',capacity:`Venue capacity: ${content.venueCapacity||100} guests`,description:'',inclusions:[]});renderAdminEditor()}
function addCategory(){let n=1,name='New category';while(content.menu[name])name=`New category ${++n}`;content.menu[name]=[];renderAdminEditor()}

$('menuToggle').addEventListener('click',()=>$('nav').classList.toggle('open'));
$('nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>$('nav').classList.remove('open')));
$('adminOpen').addEventListener('click',()=>{$('adminModal').hidden=false;updateAdminView()});
$('adminClose').addEventListener('click',()=>$('adminModal').hidden=true);
$('adminModal').addEventListener('click',e=>{if(e.target===$('adminModal'))$('adminModal').hidden=true});
$('loginButton').addEventListener('click',login);$('saveContent').addEventListener('click',saveEditor);
$('reloadContent').addEventListener('click',()=>{content=readLocal();renderAdminEditor();$('saveMessage').textContent='Your unsaved edits were discarded.'});
$('addPackage').addEventListener('click',addPackage);$('addCategory').addEventListener('click',addCategory);
$('packageEditor').addEventListener('click',e=>{const b=e.target.closest('.remove-package');if(!b)return;content.packages.splice(Number(b.dataset.index),1);renderAdminEditor()});
$('menuEditor').addEventListener('click',e=>{const b=e.target.closest('.remove-category');if(!b)return;delete content.menu[b.dataset.category];renderAdminEditor()});
$('logoutButton').addEventListener('click',async()=>{if(supa)await supa.auth.signOut();session=null;updateAdminView()});
$('loadMore').addEventListener('click',()=>{galleryShown=Math.min(galleryShown+12,GALLERY_PHOTOS.length);renderGallery()});
window.addEventListener('online',async()=>{status('Back online');if(session&&localStorage.getItem(PENDING_KEY)==='1')await pushCloud();else await pullCloud()});
window.addEventListener('offline',()=>status('Offline · local content available',false));
setupThemes();render();status(navigator.onLine?'Starting…':'Offline · local content available',navigator.onLine);
connectCloud().catch(e=>{console.error(e);status('Local mode · cloud connection unavailable',false)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
})();