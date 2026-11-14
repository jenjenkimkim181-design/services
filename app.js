(() => {
const STORAGE_KEY='descanso-site-content-v1', THEME_KEY='descanso-site-theme-v1', THEME_VERSION_KEY='descanso-site-theme-version-v1', PENDING_KEY='descanso-site-pending-v1';
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
 galleryCount:48,venueCapacity:100,menuImages:{},menuDescriptions:{}
};
let content=readLocal();content.menuImages=content.menuImages||{};content.menuDescriptions=content.menuDescriptions||{};let supa=null, session=null, recoveryMode=false, activeCategory=Object.keys(content.menu||{})[0]||'', galleryShown=12;
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
let carouselResizeObserver=null;
let carouselAnimationFrame=0;
function getMenuItems(category){return (content.menu?.[category]||[]).map(item=>typeof item==='string'?item:item.name).filter(Boolean)}
function getMenuImage(category,item){return content.menuImages?.[category]?.[item]||''}
function getMenuDescription(category,item){
 const raw=(content.menu?.[category]||[]).find(entry=>typeof entry==='string'?entry===item:entry?.name===item);
 return content.menuDescriptions?.[category]?.[item]??(raw&&typeof raw==='object'?raw.description:'')??'';
}
function renderMenu(){
 const cats=Object.keys(content.menu||{});
 // Always begin with the first category in the saved menu order. This avoids
 // reopening on a hard-coded category such as Chicken after a page refresh.
 if(!cats.includes(activeCategory))activeCategory=cats[0]||'';
 $('menuTabs').innerHTML=cats.map(c=>`<button class="menu-tab ${c===activeCategory?'active':''}" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('');
 const items=getMenuItems(activeCategory);
 $('menuPanel').innerHTML=`<div class="menu-group"><h3>${escapeHTML(activeCategory)}</h3><div class="food-list">${items.map(item=>{const image=getMenuImage(activeCategory,item);return `<article class="food-item dish-clickable" role="button" tabindex="0" data-dish-name="${escapeHTML(item)}" aria-label="View description for ${escapeHTML(item)}">${image?`<img src="${image}" alt="${escapeHTML(item)}" loading="lazy">`:`<div class="food-image-placeholder">Photo<br>coming soon</div>`}<span>${escapeHTML(item)}</span></article>`}).join('')||'<p class="muted">No menu items in this category yet.</p>'}</div><div class="menu-group menu-note"><h3>For your celebration</h3><p>Choose from our menu options when planning your buffet or consumable package. Please confirm your final selections and availability directly with the cafe.</p></div>`;
 renderMenuCarousel();
 $('menuTabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.category;renderMenu()}));
}
function renderMenuCarousel(){
 const host=$('menuCarousel');if(!host)return;
 if(carouselResizeObserver){carouselResizeObserver.disconnect();carouselResizeObserver=null;}
 if(carouselAnimationFrame)cancelAnimationFrame(carouselAnimationFrame);
 const items=getMenuItems(activeCategory).map(name=>({name,image:getMenuImage(activeCategory,name)})).filter(x=>x.image);
 if(!items.length){host.innerHTML=`<div class="carousel-empty"><span class="eyebrow">A CLOSER LOOK</span><h3>Our buffet selections</h3><p>Food photos uploaded by the cafe will appear here.</p></div>`;return}
 const makeSlide=(item,duplicate=false)=>`<figure class="carousel-slide ${duplicate?'':'dish-clickable'}" ${duplicate?'aria-hidden="true"':'role="button" tabindex="0"'} ${duplicate?'':'data-dish-name="'+escapeHTML(item.name)+'" aria-label="View description for '+escapeHTML(item.name)+'"'}><img src="${item.image}" alt="${escapeHTML(item.name)}" ${duplicate?'':'loading="eager"'} decoding="async"><figcaption>${escapeHTML(item.name)}</figcaption></figure>`;
 if(items.length===1){host.innerHTML=`<div class="carousel-viewport single"><div class="carousel-track">${makeSlide(items[0])}</div></div>`;return}
 // Keep one complete sequence followed by an identical copy. The animation
 // travels by the measured width of the first sequence, so the second copy
 // enters at precisely the same position with no blank frame between loops.
 const slides=[...items,...items];
 host.innerHTML=`<div class="carousel-viewport" aria-label="Automatically sliding buffet food photos"><div class="carousel-track">${slides.map((item,i)=>makeSlide(item,i>=items.length)).join('')}</div></div>`;
 const viewport=host.querySelector('.carousel-viewport'),track=host.querySelector('.carousel-track');
 const sizeTrack=()=>{
  // Size each dish from its real aspect ratio: no cropping, stretching, or
  // oversized blank side areas caused by equal-width cards.
  const mobile=window.matchMedia('(max-width: 600px)').matches;
  const gap=14;
  const imageHeight=mobile?Math.min(330,Math.max(230,viewport.clientWidth*.68)):
   Math.min(390,Math.max(250,window.innerWidth*.31));
  const maxSlideWidth=mobile?viewport.clientWidth:Math.min(520,Math.max(300,viewport.clientWidth*.46));
  track.querySelectorAll('.carousel-slide').forEach(slide=>{
   const img=slide.querySelector('img');
   const ratio=(img&&img.naturalWidth&&img.naturalHeight)?img.naturalWidth/img.naturalHeight:1;
   const safeRatio=ratio>0?ratio:1;
   const slideWidth=Math.max(mobile?150:190,Math.min(maxSlideWidth,imageHeight*safeRatio));
   slide.style.flexBasis=`${slideWidth}px`;
   slide.style.width=`${slideWidth}px`;
   // Give every dish the same image-frame height. The photo itself keeps
   // its natural proportions inside that frame, without cropping or stretching.
   img.style.height=`${imageHeight}px`;
   img.style.width='100%';
   img.style.objectFit='contain';
  });
  track.style.gap=`${gap}px`;
  track.style.width='max-content';
  const firstCopyEnd=track.children[items.length];
  const distance=firstCopyEnd.offsetLeft-track.children[0].offsetLeft;
  track.style.setProperty('--slide-distance',`${distance}px`);
  track.style.setProperty('--slide-duration',`${Math.max(12,items.length*5)}s`);
 };
 track.querySelectorAll('img').forEach(img=>{
  if(!img.complete)img.addEventListener('load',()=>requestAnimationFrame(sizeTrack),{once:true});
 });
 // Measure after the browser has laid out the new slides; ResizeObserver keeps
 // the two-up desktop / one-up mobile layout accurate without rebuilding them.
 carouselAnimationFrame=requestAnimationFrame(sizeTrack);
 if('ResizeObserver' in window){carouselResizeObserver=new ResizeObserver(sizeTrack);carouselResizeObserver.observe(viewport)}
}
// Small dish-details popup shared by the carousel and menu list.
function openDishDescription(name){
 const modal=$('dishDescriptionModal');if(!modal)return;
 $('dishDescriptionTitle').textContent=name;
 const description=getMenuDescription(activeCategory,name).trim();
 const descriptionText=$('dishDescriptionText');
 if(descriptionText){descriptionText.textContent=description||'A description for this dish has not been added yet.';descriptionText.classList.toggle('is-empty',!description)}
 modal.hidden=false;
 $('dishDescriptionClose').focus();
}
function closeDishDescription(){$('dishDescriptionModal').hidden=true}
function activateDishFromEvent(e){
 const dish=e.target.closest('.dish-clickable');
 if(!dish||dish.closest('[aria-hidden="true"]'))return;
 e.preventDefault();openDishDescription(dish.dataset.dishName||dish.querySelector('figcaption,span')?.textContent||'');
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
 if(logo)logo.alt=name+' logo';const venueLogo=$('venueLogo');if(venueLogo)venueLogo.alt=name+' logo';const footerLogo=$('footerLogo');if(footerLogo)footerLogo.alt=name+' logo';
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
const MONO_THEME={id:0,name:'Black & White',collection:'Default',colors:{Header:'#000000',Background:'#FFFFFF',Card:'#FFFFFF','Primary Text':'#111111','Muted Text':'#666666',Accent:'#000000','Accent Text':'#FFFFFF',Border:'#D8D8D8',Soft:'#F2F2F2'}};
function themeById(id){return Number(id)===0?MONO_THEME:(THEMES.find(t=>t.id===Number(id))||MONO_THEME)}
function readableText(hex){const value=String(hex||'#ffffff').replace('#','');if(!/^[0-9a-f]{6}$/i.test(value))return '#111111';const parts=[0,2,4].map(i=>parseInt(value.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));const luminance=.2126*parts[0]+.7152*parts[1]+.0722*parts[2];return luminance>.42?'#171717':'#FFFFFF'}
function applyTheme(id,persist=true){const t=themeById(id);const c=t.colors,r=document.documentElement;const isDark=readableText(c.Background)==='#FFFFFF';const onHeader=readableText(c.Header),onCard=readableText(c.Card),onSoft=readableText(c.Soft),onAccent=readableText(c.Accent);const vars={'--theme-header':c.Header,'--theme-bg':c.Background,'--theme-card':c.Card,'--theme-text':c['Primary Text'],'--theme-muted':c['Muted Text'],'--theme-accent':c.Accent,'--theme-accent-text':onAccent,'--theme-border':c.Border,'--theme-soft':c.Soft,'--theme-on-header':onHeader,'--theme-on-header-muted':onHeader==='#FFFFFF'?'#E8E8E8':'#555555','--theme-on-card':onCard,'--theme-on-soft':onSoft,'--theme-on-accent':onAccent};Object.entries(vars).forEach(([k,v])=>r.style.setProperty(k,v));r.style.colorScheme=readableText(c.Background)==='#FFFFFF'?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',c.Header);
 const logoPath=`logos/${t.id}.png`;['brandLogo','venueLogo','footerLogo'].forEach(id=>{const el=$(id);if(el){el.onerror=()=>{el.onerror=null;el.src='logos/1.png'};el.src=logoPath}});
 const select=$('themeSelect');if(select)select.value=String(t.id);$('themeName').textContent=t.name;$('themeCollection').textContent=t.collection;$('themeNumber').textContent=t.id===0?'DEFAULT / 51':' '+String(t.id).padStart(2,'0')+' / 50';$('themeSwatches').innerHTML=[c.Header,c.Background,c.Card,c.Accent,c.Soft].map(color=>`<span style="background:${color}"></span>`).join('');if(persist)localStorage.setItem(THEME_KEY,String(t.id));}
function currentAdminThemeVersion(){return content.adminThemeVersion||'initial'}
function syncThemeFromCloud(){const version=currentAdminThemeVersion();const seen=localStorage.getItem(THEME_VERSION_KEY);if(seen!==version){localStorage.setItem(THEME_KEY,String(Number(content.adminThemeId)||0));localStorage.setItem(THEME_VERSION_KEY,version);applyTheme(content.adminThemeId||0,false);return}const local=localStorage.getItem(THEME_KEY);applyTheme(local===null?(content.adminThemeId||0):Number(local),false)}
async function publishGlobalTheme(id){if(!session||!supa){toast('Only the administrator can publish the website theme.');return}content.adminThemeId=Number(id);content.adminThemeVersion=new Date().toISOString();localStorage.setItem(THEME_KEY,String(id));localStorage.setItem(THEME_VERSION_KEY,content.adminThemeVersion);applyTheme(id,false);const {error}=await supa.from('descanso_site').update({content,updated_at:new Date().toISOString()}).eq('id',1);if(error){status('Could not publish the global theme',false);toast('Theme was not published. Please try again.');console.error(error);return}localStorage.setItem(STORAGE_KEY,JSON.stringify(content));toast('Official theme updated for all visitors.');}
function setupThemes(){const select=$('themeSelect');if(!select)return;select.innerHTML=`<option value="0">00 · Black &amp; White — Default</option>`+THEMES.map(t=>`<option value="${t.id}">${String(t.id).padStart(2,'0')} · ${escapeHTML(t.name)} — ${escapeHTML(t.collection)}</option>`).join('');const stored=localStorage.getItem(THEME_KEY);const saved=stored===null?(content.adminThemeId||0):Number(stored);applyTheme(saved,false);select.addEventListener('change',()=>applyTheme(select.value,false));$('themeOpen').addEventListener('click',()=>$('themeModal').hidden=false);$('themeClose').addEventListener('click',()=>$('themeModal').hidden=true);$('themeModal').addEventListener('click',e=>{if(e.target===$('themeModal'))$('themeModal').hidden=true});$('applyTheme').addEventListener('click',()=>{applyTheme(select.value,true);localStorage.setItem(THEME_VERSION_KEY,currentAdminThemeVersion());$('themeModal').hidden=true;toast('Your personal theme is saved on this device.')});$('resetTheme').addEventListener('click',()=>{const official=content.adminThemeId||0;applyTheme(official,true);localStorage.setItem(THEME_VERSION_KEY,currentAdminThemeVersion());toast('Official website theme restored on this device.')});const publish=$('publishGlobalTheme');if(publish)publish.addEventListener('click',async()=>{await publishGlobalTheme(select.value);$('themeModal').hidden=true});} 
async function connectCloud(){
 if(!window.supabase||!window.DESCANSO_SUPABASE_URL||!window.DESCANSO_SUPABASE_PUBLISHABLE_KEY){status('Local mode · cloud library not loaded',false);return}
 supa=window.supabase.createClient(window.DESCANSO_SUPABASE_URL,window.DESCANSO_SUPABASE_PUBLISHABLE_KEY);
 const {data:{session:s}}=await supa.auth.getSession();session=s;
 supa.auth.onAuthStateChange((event,s)=>{session=s;if(event==='SIGNED_OUT'){recoveryMode=false;showAuthPanel('loginFormView');}updateAdminView()});
 const hashParams=new URLSearchParams(window.location.hash.replace(/^#/,'&'));
 if(hashParams.get('error')){$('adminModal').hidden=false;showAuthPanel('forgotPasswordView');$('recoveryMessage').textContent=hashParams.get('error_description')||'This recovery link is invalid or expired. Please request a new one.';}
 await pullCloud();
 supa.channel('descanso-site-theme-sync').on('postgres_changes',{event:'UPDATE',schema:'public',table:'descanso_site',filter:'id=eq.1'},()=>pullCloud()).subscribe();
}
async function pullCloud(){
 if(!supa||!navigator.onLine)return;
 status('Checking cloud…');
 const {data,error}=await supa.from('descanso_site').select('content').eq('id',1).maybeSingle();
 if(error){status('Local mode · cloud setup needed',false);return}
 if(data?.content&&Object.keys(data.content).length){
  if(localStorage.getItem(PENDING_KEY)==='1'){await pushCloud();return}
  content={...clone(defaults),...data.content};content.menuImages=content.menuImages||{};content.menuDescriptions=content.menuDescriptions||{};activeCategory=Object.keys(content.menu||{})[0]||'';localStorage.setItem(STORAGE_KEY,JSON.stringify(content));syncThemeFromCloud();render();status('Cloud content loaded');
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
 $('packageEditor').innerHTML=(content.packages||[]).map((p,i)=>`<article class="admin-item package-edit-item" data-package="${i}"><div class="admin-item-heading"><div><span class="admin-item-kicker">EVENT PACKAGE ${String(i+1).padStart(2,'0')}</span><strong>${escapeHTML(p.name||`Package ${i+1}`)}</strong></div><button type="button" class="text-link remove-package" data-index="${i}">Remove package</button></div><div class="admin-fields"><label>Package name<input data-field="name" value="${escapeHTML(p.name)}"></label><label>Small heading<input data-field="tag" value="${escapeHTML(p.tag)}"></label><label>Price<input data-field="price" value="${escapeHTML(p.price)}"></label><label>Price details<input data-field="unit" value="${escapeHTML(p.unit)}" placeholder="e.g. per person"></label><label>Short description<textarea data-field="description" rows="2">${escapeHTML(p.description)}</textarea></label><label>Minimum booking<input data-field="minimum" value="${escapeHTML(p.minimum)}"></label><label>Venue capacity note<input data-field="capacity" value="${escapeHTML(p.capacity)}"></label><label class="wide-field">What’s included? <span class="field-note">Write one inclusion per line.</span><textarea data-field="inclusions" rows="5">${escapeHTML((p.inclusions||[]).join('\n'))}</textarea></label></div></article>`).join('');
 $('menuEditor').innerHTML=Object.entries(content.menu||{}).map(([cat,items],i)=>`<article class="admin-item menu-edit-item" data-original-category="${escapeHTML(cat)}"><div class="admin-item-heading menu-category-heading"><div><span class="admin-item-kicker">MENU CATEGORY ${String(i+1).padStart(2,'0')}</span><strong>${escapeHTML(cat)}</strong></div><button type="button" class="text-link remove-category" data-category="${escapeHTML(cat)}">Remove category</button></div><label class="category-name-field">Category name<input class="menu-category-name" value="${escapeHTML(cat)}"></label><div class="menu-item-editor-list">${(items||[]).map((raw,j)=>{const item=typeof raw==='string'?raw:(raw?.name||'');const description=content.menuDescriptions?.[cat]?.[item]??(raw&&typeof raw==='object'?raw.description:'')??'';const image=content.menuImages?.[cat]?.[item]||'';return `<article class="menu-item-editor" data-original-item="${escapeHTML(item)}"><div class="menu-food-heading"><strong>Dish ${j+1}</strong><button type="button" class="text-link remove-menu-item">Remove food</button></div><div class="menu-food-fields"><label class="menu-food-name-field">Food name<input class="menu-item-name" value="${escapeHTML(item)}"></label><label class="menu-food-photo-field">Food photo<input class="menu-item-image" type="file" accept="image/*" data-category="${escapeHTML(cat)}" data-item="${escapeHTML(item)}"><span class="field-note">${image?'Photo uploaded · choose a new file to replace it':'No photo uploaded yet · choose an image for this dish'}</span>${image?`<img class="admin-food-preview" src="${image}" alt="${escapeHTML(item)} preview">`:''}</label><label class="menu-item-description">Food description <span class="field-note">Write the actual ingredients, flavor, or details visitors should know.</span><textarea class="menu-item-description-input" rows="3" placeholder="Example: Tender pork simmered in a rich tomato sauce with potatoes, carrots, and bell peppers.">${escapeHTML(description)}</textarea></label></div></article>`}).join('')||'<p class="menu-empty-state">No food items in this category yet. Select “Add food item” to get started.</p>'}</div><button type="button" class="button button-outline add-menu-item">+ Add food item</button></article>`).join('');
}
function showAuthPanel(id){['loginFormView','forgotPasswordView'].forEach(panel=>$(panel).hidden=panel!==id)}
function updateAdminView(){
 const canEdit=!!session&&!recoveryMode;$('loginView').hidden=canEdit;$('editorView').hidden=!canEdit;const globalThemeButton=$('publishGlobalTheme');if(globalThemeButton)globalThemeButton.hidden=!canEdit;
 if(canEdit){$('adminUser').textContent=session.user.email;renderAdminEditor()}
}
async function login(){
 $('loginMessage').textContent='Signing in…';
 if(!supa){$('loginMessage').textContent='Cloud client is unavailable. Check your connection and configuration.';return}
 const {data,error}=await supa.auth.signInWithPassword({email:$('adminEmail').value.trim(),password:$('adminPassword').value});
 if(error){$('loginMessage').textContent='We could not sign you in. Please check your email and password.';return}
 session=data.session;updateAdminView();$('loginMessage').textContent='';
 if(localStorage.getItem(PENDING_KEY)==='1')await pushCloud();
}
async function sendPasswordRecovery(){
 const email=$('recoveryEmail').value.trim();$('recoveryMessage').textContent='';
 if(!email){$('recoveryMessage').textContent='Please enter the administrator email address.';return}
 if(!supa){$('recoveryMessage').textContent='Cloud authentication is unavailable. Please check your connection.';return}
 $('sendRecoveryButton').disabled=true;$('sendRecoveryButton').textContent='Sending…';
 try{
  const redirectTo=new URL('password-reset.html',window.location.href).href;
  const {error}=await supa.auth.resetPasswordForEmail(email,{redirectTo});
  if(error)throw error;
  $('recoveryMessage').textContent='If this email belongs to an account, a password-reset link has been sent. Open the email on this device/browser, then follow its confirmation link.';
 }catch(error){$('recoveryMessage').textContent=error.message||'Could not send the recovery email. Please try again.';}
 finally{$('sendRecoveryButton').disabled=false;$('sendRecoveryButton').textContent='Send confirmation email'}
}
function collectAdminEditor(){
 const packages=[...$('packageEditor').querySelectorAll('[data-package]')].map(card=>{const val=field=>card.querySelector(`[data-field="${field}"]`)?.value.trim()||'';return {name:val('name'),tag:val('tag'),price:val('price'),unit:val('unit'),description:val('description'),minimum:val('minimum'),capacity:val('capacity'),inclusions:val('inclusions').split('\n').map(x=>x.trim()).filter(Boolean)}});
 const menu={},menuImages={...clone(content.menuImages||{})},menuDescriptions={};
 [...$('menuEditor').querySelectorAll('.menu-edit-item')].forEach(card=>{
  const name=card.querySelector('.menu-category-name').value.trim();
  const oldName=card.dataset.originalCategory;
  if(!name)return;
  const oldImages=content.menuImages?.[oldName]||{};
  const rows=[...card.querySelectorAll('.menu-item-editor')];
  const entries=rows.map(row=>({
   row,
   name:row.querySelector('.menu-item-name')?.value.trim()||'',
   description:row.querySelector('.menu-item-description-input')?.value.trim()||'',
   oldItem:row.dataset.originalItem||row.querySelector('.menu-item-image')?.dataset.item||row.querySelector('.menu-item-name')?.value.trim()||'',
   uploadedImage:row.querySelector('.menu-item-image')?.dataset.uploadedImage||''
  })).filter(entry=>entry.name);
  menu[name]=entries.map(entry=>entry.name);
  menuDescriptions[name]={};
  menuImages[name]={...(menuImages[name]||{})};
  entries.forEach(entry=>{
   if(entry.description)menuDescriptions[name][entry.name]=entry.description;
   const image=entry.uploadedImage||oldImages[entry.oldItem]||menuImages[name][entry.oldItem]||menuImages[name][entry.name]||oldImages[entry.name];
   if(image)menuImages[name][entry.name]=image;
  });
 });
 const venueCapacity=Math.max(1,Number($('editCapacity').value)||100);
 packages.forEach(p=>{if(/venue capacity/i.test(p.capacity||''))p.capacity=`Venue capacity: ${venueCapacity} guests`});
 return {...clone(content),cafeName:$('editCafeName').value.trim()||defaults.cafeName,intro:$('editIntro').value.trim(),venueCapacity,packages,menu,menuImages,menuDescriptions};
}
async function saveEditor(){
 const next=collectAdminEditor();
 if(!next.packages.length){$('saveMessage').textContent='Please keep at least one event package.';return}
 if(!Object.keys(next.menu).length){$('saveMessage').textContent='Please keep at least one menu category.';return}
 if(next.packages.some(p=>!p.name||!p.price)){$('saveMessage').textContent='Please add a name and price to every package.';return}
 content=next;saveLocal();render();$('saveMessage').textContent='Your changes are saved on this device.';
 if(navigator.onLine&&session)await pushCloud();else status('Saved locally · will sync when online',false);
}
function renumberMenuItems(card){[...card.querySelectorAll('.menu-item-editor')].forEach((row,index)=>{const heading=row.querySelector('.menu-food-heading strong');if(heading)heading.textContent=`Dish ${index+1}`})}
function addFoodItem(card){const list=card.querySelector('.menu-item-editor-list');const row=document.createElement('article');row.className='menu-item-editor';row.innerHTML=`<div class="menu-food-heading"><strong>Dish ${list.querySelectorAll('.menu-item-editor').length+1}</strong><button type="button" class="text-link remove-menu-item">Remove food</button></div><div class="menu-food-fields"><label class="menu-food-name-field">Food name<input class="menu-item-name" placeholder="Enter food name"></label><label class="menu-food-photo-field">Food photo<input class="menu-item-image" type="file" accept="image/*"><span class="field-note">No photo uploaded yet · choose an image for this dish</span></label><label class="menu-item-description">Food description <span class="field-note">Write the actual ingredients, flavor, or details visitors should know.</span><textarea class="menu-item-description-input" rows="3" placeholder="Example: Tender pork simmered in a rich tomato sauce with potatoes, carrots, and bell peppers."></textarea></label></div>`;list.appendChild(row);renumberMenuItems(card)}
function compressFoodImage(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(new Error('Please choose an image file.'));const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read this image.'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('Invalid image file.'));img.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.76))};img.src=reader.result};reader.readAsDataURL(file)})}
function addPackage(){content.packages.push({name:'New package',tag:'',price:'',unit:'',minimum:'',capacity:`Venue capacity: ${content.venueCapacity||100} guests`,description:'',inclusions:[]});renderAdminEditor()}
function addCategory(){let n=1,name='New category';while(content.menu[name])name=`New category ${++n}`;content.menu[name]=[];renderAdminEditor()}

$('menuCarousel').addEventListener('click',activateDishFromEvent);
$('menuPanel').addEventListener('click',activateDishFromEvent);
['menuCarousel','menuPanel'].forEach(id=>$(id).addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.dish-clickable'))activateDishFromEvent(e)}));
$('dishDescriptionClose').addEventListener('click',closeDishDescription);
$('dishDescriptionModal').addEventListener('click',e=>{if(e.target===$('dishDescriptionModal'))closeDishDescription()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('dishDescriptionModal').hidden)closeDishDescription()});
$('menuToggle').addEventListener('click',()=>$('nav').classList.toggle('open'));
$('nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>$('nav').classList.remove('open')));
$('adminOpen').addEventListener('click',()=>{$('adminModal').hidden=false;updateAdminView()});
$('editorView').querySelectorAll('[data-admin-target]').forEach(button=>button.addEventListener('click',()=>{const target=$(button.dataset.adminTarget);if(!target)return;$('editorView').querySelectorAll('.admin-nav-button').forEach(item=>item.classList.toggle('active',item===button));target.scrollIntoView({behavior:'smooth',block:'start'})}));
$('adminClose').addEventListener('click',()=>$('adminModal').hidden=true);
$('adminModal').addEventListener('click',e=>{if(e.target===$('adminModal'))$('adminModal').hidden=true});
$('loginButton').addEventListener('click',login);$('forgotPasswordButton').addEventListener('click',()=>{$('recoveryEmail').value=$('adminEmail').value.trim();$('recoveryMessage').textContent='';showAuthPanel('forgotPasswordView')});$('backToLoginButton').addEventListener('click',()=>{showAuthPanel('loginFormView');$('loginMessage').textContent=''});$('sendRecoveryButton').addEventListener('click',sendPasswordRecovery);$('saveContent').addEventListener('click',saveEditor);
$('reloadContent').addEventListener('click',()=>{content=readLocal();activeCategory=Object.keys(content.menu||{})[0]||'';render();renderAdminEditor();$('saveMessage').textContent='Your unsaved edits were discarded.'});
$('addPackage').addEventListener('click',addPackage);$('addCategory').addEventListener('click',addCategory);
$('packageEditor').addEventListener('click',e=>{const b=e.target.closest('.remove-package');if(!b)return;content.packages.splice(Number(b.dataset.index),1);renderAdminEditor()});
$('menuEditor').addEventListener('click',e=>{const add=e.target.closest('.add-menu-item');if(add){addFoodItem(add.closest('.menu-edit-item'));return}const removeFood=e.target.closest('.remove-menu-item');if(removeFood){const categoryCard=removeFood.closest('.menu-edit-item');removeFood.closest('.menu-item-editor').remove();renumberMenuItems(categoryCard);return}const b=e.target.closest('.remove-category');if(!b)return;delete content.menu[b.dataset.category];if(content.menuImages)delete content.menuImages[b.dataset.category];renderAdminEditor()});
$('menuEditor').addEventListener('change',async e=>{const input=e.target.closest('.menu-item-image');if(!input||!input.files?.[0])return;const row=input.closest('.menu-item-editor');const card=input.closest('.menu-edit-item');const oldCategory=input.dataset.category||card.dataset.originalCategory;const oldItem=input.dataset.item||row.querySelector('.menu-item-name').value.trim();try{input.disabled=true;const data=await compressFoodImage(input.files[0]);const category=card.querySelector('.menu-category-name').value.trim()||oldCategory;const item=row.querySelector('.menu-item-name').value.trim()||oldItem;content.menuImages=content.menuImages||{};content.menuImages[category]=content.menuImages[category]||{};if(item)content.menuImages[category][item]=data;input.dataset.category=category;input.dataset.item=item;input.dataset.uploadedImage=data;row.querySelector('.field-note').textContent='Photo uploaded · choose a new file to replace it';let preview=row.querySelector('.admin-food-preview');if(!preview){preview=document.createElement('img');preview.className='admin-food-preview';preview.alt=item+' preview';input.parentElement.appendChild(preview)}preview.src=data;$('saveMessage').textContent='Food photo added. Select Save website changes to publish it.'}catch(err){$('saveMessage').textContent=err.message||'Could not upload this image.'}finally{input.disabled=false}});
$('logoutButton').addEventListener('click',async()=>{if(supa)await supa.auth.signOut();session=null;updateAdminView()});
$('loadMore').addEventListener('click',()=>{galleryShown=Math.min(galleryShown+12,GALLERY_PHOTOS.length);renderGallery()});
window.addEventListener('online',async()=>{status('Back online');if(session&&localStorage.getItem(PENDING_KEY)==='1')await pushCloud();else await pullCloud()});
window.addEventListener('offline',()=>status('Offline · local content available',false));
setupThemes();render();status(navigator.onLine?'Starting…':'Offline · local content available',navigator.onLine);
connectCloud().catch(e=>{console.error(e);status('Local mode · cloud connection unavailable',false)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
})();