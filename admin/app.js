const U='https://packaiwgsswrjvxdsejw.supabase.co';
const K='sb_publishable_Jrp7cxW-ppSJtrk-lScZjA_blNEnBRG';
const EMAIL='mr.business.labb@gmail.com';
const base=supabase.createClient(U,K,{auth:{persistSession:false}});
let token=localStorage.getItem('bni_admin_token')||'';
let sb=null,members=[],currentMember=null,categories=[],currentCategory=null,events=[];
const $=id=>document.getElementById(id);
const esc=(v='')=>String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
const val=id=>($(id)?.value||'').trim();
function notice(msg,type='ok'){const el=$('globalNotice');if(!el)return;el.innerHTML=msg?`<div class="notice ${type}">${esc(msg)}</div>`:'';if(msg)setTimeout(()=>{if(el.textContent===msg)el.innerHTML=''},4500)}
function makeClient(){sb=supabase.createClient(U,K,{auth:{persistSession:false},global:{headers:{'x-bni-admin-token':token}}})}
async function sessionApi(action,payload={}){const res=await fetch(U+'/functions/v1/bni-admin-sessions',{method:'POST',headers:{'Content-Type':'application/json','apikey':K,'x-bni-admin-token':token},body:JSON.stringify({action,...payload})});const out=await res.json().catch(()=>({ok:false}));if(res.status===401){localStorage.removeItem('bni_admin_token');location.reload();throw new Error('unauthorized')}if(!res.ok||!out.ok)throw new Error('session_api_error');return out.data}
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function fmtTime(x){if(!x)return'';try{return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(x))}catch{return x}}
function showApp(){makeClient();$('loginView').classList.add('hidden');$('appView').classList.remove('hidden')}
function switchPage(name){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===`page-${name}`));document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===name));const titles={dashboard:'儀表板',members:'成員管理',matching:'類別配對',logs:'媒合紀錄',audit:'後台操作紀錄',sessions:'登入裝置'};$('topTitle').textContent=titles[name]||'後台管理';if(name==='dashboard')loadDashboard();if(name==='members')loadMembers();if(name==='matching')loadCategories();if(name==='logs')loadLogs();if(name==='audit')loadAuditLogs();if(name==='sessions')loadSessions()}

$('loginBtn').onclick=async()=>{const pw=val('password');if(!pw){$('loginNotice').innerHTML='<div class="notice error">請輸入密碼。</div>';return}const btn=$('loginBtn');btn.disabled=true;const hash=await sha256(pw);try{const res=await fetch(U+'/functions/v1/bni-admin-login',{method:'POST',headers:{'Content-Type':'application/json','apikey':K},body:JSON.stringify({email:EMAIL,password_sha256:hash})});const data=await res.json().catch(()=>({status:'error'}));if(data.status==='blocked'){const mins=Math.max(1,Math.ceil(Number(data.retry_after||900)/60));$('loginNotice').innerHTML='<div class="notice error">登入嘗試過多，請約 '+mins+' 分鐘後再試。</div>';return}if(data.status!=='ok'||!data.token){$('loginNotice').innerHTML='<div class="notice error">帳號或密碼錯誤。</div>';return}token=data.token;localStorage.setItem('bni_admin_token',token);showApp();await bootstrap()}catch(e){$('loginNotice').innerHTML='<div class="notice error">登入服務暫時無法使用，請稍後再試。</div>'}finally{btn.disabled=false}};
$('password').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click()});
$('logoutBtn').onclick=async()=>{try{await sessionApi('logout')}catch{}localStorage.removeItem('bni_admin_token');location.reload()};
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchPage(b.dataset.page));

async function bootstrap(){await Promise.all([loadMembers(false),loadCategories(false)]);switchPage('dashboard')}

async function loadDashboard(){
  const [mr,er]=await Promise.all([
    sb.from('bni_members').select('id,name,is_published'),
    sb.from('bni_behavior_events').select('*').order('created_at',{ascending:false}).limit(3000)
  ]);
  if(mr.error||er.error){notice('儀表板讀取失敗。','error');return}
  const ms=mr.data||[],ev=er.data||[];events=ev;
  const clicks=ev.filter(x=>x.event_type==='member_card_click'||x.event_type==='chat_member_open');
  const contacts=ev.filter(x=>x.event_type==='contact_click');
  const chat=ev.filter(x=>x.event_type==='chat_open');
  const seven=Date.now()-7*86400000;const recent=ev.filter(x=>new Date(x.created_at).getTime()>=seven);
  $('statMembers').textContent=ms.filter(x=>x.is_published!==false).length;
  $('statMemberClicks').textContent=clicks.length;
  $('statContactClicks').textContent=contacts.length;
  $('statRecent').textContent=recent.length;
  const by={};ms.forEach(m=>by[m.name]={name:m.name,profile:0,contact:0});
  clicks.forEach(x=>{if(x.member_name){by[x.member_name]??={name:x.member_name,profile:0,contact:0};by[x.member_name].profile++}});
  contacts.forEach(x=>{if(x.member_name){by[x.member_name]??={name:x.member_name,profile:0,contact:0};by[x.member_name].contact++}});
  const top=Object.values(by).sort((a,b)=>(b.profile+b.contact)-(a.profile+a.contact)).slice(0,10);
  $('topMembers').innerHTML=top.length?top.map(x=>`<div class="top-row"><b>${esc(x.name)}</b><span>人物 ${x.profile}</span><span>聯絡 ${x.contact}</span></div>`).join(''):'<div class="empty">目前還沒有點擊資料。</div>';
  const eventLabels={member_card_click:'人物點擊',contact_click:'聯絡方式',chat_member_open:'小幫手推薦',chat_open:'開啟小幫手',chat_message:'詢問小幫手',chat_problem_pick:'需求選擇',need_select:'類別點擊'};
  $('recentEvents').innerHTML=ev.slice(0,12).map(x=>`<div class="log-row"><div class="time">${fmtTime(x.created_at)}</div><div><span class="badge">${eventLabels[x.event_type]||esc(x.event_type)}</span></div><div>${esc(x.member_name||x.intent||'')}</div><div>${esc(x.query_text||x.meta?.label||x.meta?.title||'')}</div></div>`).join('')||'<div class="empty">尚無紀錄。</div>';
  $('statChat').textContent=chat.length;
}

const PROBLEMS=[['water','漏水／防水'],['renovation','老屋翻修'],['paint','油漆翻新'],['electric','水電工程'],['commercial','商空／辦公室']];
const ROLES=[['planning_gc','統包／整體工程'],['planning_design','室內／空間設計'],['planning_architect','建築規劃'],['demolition','拆除清運'],['masonry','泥作'],['leak_detection','漏水檢測'],['inspection','工程檢測'],['waterproof_masonry','防水修繕'],['plumbing','水電施工'],['electrical','電氣工程'],['low_voltage','弱電工程'],['mep','機電／消防／儀控'],['green_energy','綠電／能源設備'],['smart_lighting','智慧照明'],['woodwork','木作'],['flooring','木地板'],['kitchen','廚房／廚具'],['painting','油漆工程'],['office_furniture','辦公家具'],['curtains','窗簾／百葉']];
function hasAny(s,arr){return arr.some(w=>s.includes(w))}
function analyzeText(text){const s=String(text||'').toLowerCase(),p=new Set(),r=new Set(),add=(ps,rs)=>{ps.forEach(x=>p.add(x));rs.forEach(x=>r.add(x))};
 if(hasAny(s,['抓漏','漏水','滲水','壁癌','防水']))add(['water','renovation','commercial'],['leak_detection','waterproof_masonry']);
 if(hasAny(s,['檢測','熱顯像','紅外線']))add(['water','commercial'],['inspection']);
 if(hasAny(s,['水電','水管','給排水','配管']))add(['electric','renovation','commercial','water'],['plumbing','electrical']);
 if(hasAny(s,['弱電','監視器','網路','nas','資訊']))add(['electric','renovation','commercial'],['low_voltage']);
 if(hasAny(s,['機電','消防','儀控','環控']))add(['electric','renovation','commercial'],['mep','electrical']);
 if(hasAny(s,['綠電','太陽能','儲能','能源']))add(['electric','commercial'],['green_energy','electrical']);
 if(hasAny(s,['照明','燈光','燈具','智慧照明']))add(['electric','renovation','commercial'],['smart_lighting']);
 if(hasAny(s,['拆除','清運']))add(['renovation','commercial'],['demolition']);
 if(hasAny(s,['泥作','砌磚','磁磚','打底']))add(['renovation','water','commercial'],['masonry']);
 if(hasAny(s,['油漆','粉刷','藝術漆','牆面翻新']))add(['paint','renovation','commercial'],['painting']);
 if(hasAny(s,['木作','家具製作','系統櫃']))add(['renovation','commercial'],['woodwork']);
 if(hasAny(s,['地板','木地板']))add(['renovation','commercial'],['flooring']);
 if(hasAny(s,['廚房','廚具','櫥櫃']))add(['renovation','commercial'],['kitchen']);
 if(hasAny(s,['室內設計','空間設計']))add(['renovation','commercial'],['planning_design']);
 if(hasAny(s,['建築師','建築規劃','監造']))add(['renovation','commercial'],['planning_architect']);
 if(hasAny(s,['統包','整體工程','工程管理']))add(['renovation','commercial'],['planning_gc']);
 if(hasAny(s,['辦公家具','辦公桌','辦公椅','oa']))add(['commercial'],['office_furniture']);
 if(hasAny(s,['窗簾','百葉']))add(['renovation','commercial'],['curtains']);
 return{problems:[...p],roles:[...r]}}
function renderRouteChecks(member){const ps=member?.problem_keys||[],rs=member?.role_keys||[];$('routeProblems').innerHTML=PROBLEMS.map(([v,l])=>`<label class="check"><input type="checkbox" data-route-p value="${v}" ${ps.includes(v)?'checked':''}>${l}</label>`).join('');$('routeRoles').innerHTML=ROLES.map(([v,l])=>`<label class="check"><input type="checkbox" data-route-r value="${v}" ${rs.includes(v)?'checked':''}>${l}</label>`).join('')}
function checked(sel){return[...document.querySelectorAll(sel)].filter(x=>x.checked).map(x=>x.value)}

async function loadMembers(render=true){const {data,error}=await sb.from('bni_members').select('*').order('member_no').order('sort_order');if(error){notice('成員讀取失敗：'+error.message,'error');return}members=data||[];if(render)renderMemberList()}
function renderMemberList(){const el=$('memberList');el.innerHTML=members.map(m=>`<button class="list-item ${currentMember?.id===m.id?'active':''}" data-member="${m.id}"><b>${m.member_no||'-'}｜${esc(m.name)}</b><span>${esc(m.company||'')}｜${m.is_published===false?'前台隱藏':'前台顯示'}</span></button>`).join('');el.querySelectorAll('[data-member]').forEach(b=>b.onclick=()=>selectMember(b.dataset.member))}
function clearMemberForm(){['m_name','m_company','m_title','m_tagline','m_expertise','m_services','m_common_problems','m_work_scope','m_intro','m_card_json_url'].forEach(id=>$(id).value='');$('m_visible').checked=true;renderRouteChecks(null);$('memberNoText').textContent='建立後自動編號'}
$('addMemberBtn').onclick=()=>{currentMember={id:null};clearMemberForm();renderMemberList();showMemberEditor();switchMemberTab('basic')};
function showMemberEditor(){$('memberEmpty').classList.add('hidden');$('memberEditor').classList.remove('hidden')}
async function selectMember(id){currentMember=members.find(x=>x.id===id);if(!currentMember)return;renderMemberList();showMemberEditor();$('memberEditorTitle').textContent=currentMember.name;$('memberEditorSub').textContent=currentMember.company||'';$('memberNoText').textContent=`固定編號 ${currentMember.member_no||'-'}`;$('m_name').value=currentMember.name||'';$('m_company').value=currentMember.company||'';$('m_title').value=currentMember.title||'';$('m_tagline').value=currentMember.tagline||'';$('m_expertise').value=currentMember.expertise_category||'';$('m_services').value=currentMember.services||'';$('m_common_problems').value=currentMember.common_problems||'';$('m_work_scope').value=currentMember.work_scope||'';$('m_intro').value=currentMember.intro||'';$('m_card_json_url').value=currentMember.card_json_url||'';$('m_visible').checked=currentMember.is_published!==false;renderRouteChecks(currentMember);switchMemberTab('basic');await Promise.all([loadCases(),loadCollabs(),loadContacts()])}
function switchMemberTab(name){document.querySelectorAll('.member-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));document.querySelectorAll('.member-pane').forEach(x=>x.classList.toggle('active',x.id===`member-${name}`))}
document.querySelectorAll('.member-tab').forEach(x=>x.onclick=()=>switchMemberTab(x.dataset.tab));
$('analyzeMemberBtn').onclick=()=>{const a=analyzeText([val('m_expertise'),val('m_services'),val('m_common_problems'),val('m_work_scope'),val('m_tagline')].join(' '));document.querySelectorAll('[data-route-p]').forEach(x=>x.checked=a.problems.includes(x.value));document.querySelectorAll('[data-route-r]').forEach(x=>x.checked=a.roles.includes(x.value));notice('已依專業內容重新判斷，可再手動調整。')};
$('saveMemberBtn').onclick=async()=>{const name=val('m_name');if(!name)return notice('請輸入姓名。','error');const payload={name,company:val('m_company')||null,title:val('m_title')||null,tagline:val('m_tagline')||null,expertise_category:val('m_expertise')||null,services:val('m_services')||null,common_problems:val('m_common_problems')||null,work_scope:val('m_work_scope')||null,intro:val('m_intro')||null,card_json_url:val('m_card_json_url')||null,is_published:$('m_visible').checked,problem_keys:checked('[data-route-p]'),role_keys:checked('[data-route-r]')};let q;if(currentMember?.id){q=sb.from('bni_members').update(payload).eq('id',currentMember.id).select().single()}else{const maxNo=members.reduce((n,m)=>Math.max(n,Number(m.member_no)||0),0)+1;Object.assign(payload,{member_no:maxNo,sort_order:maxNo,slug:String(maxNo)});q=sb.from('bni_members').insert(payload).select().single()}const {data,error}=await q;if(error)return notice('儲存失敗：'+error.message,'error');currentMember=data;notice('成員資料已儲存。');await loadMembers();await selectMember(data.id)};

async function upload(file,kind){if(!file)return null;if(!currentMember?.member_no)throw new Error('找不到成員固定編號');const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`${currentMember.member_no}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;const {error}=await sb.storage.from('bni-building-media').upload(path,file,{contentType:file.type||undefined});if(error)throw error;return sb.storage.from('bni-building-media').getPublicUrl(path).data.publicUrl}
function armDelete(btn,fn){if(btn.dataset.armed==='1'){fn();return}btn.dataset.armed='1';btn.textContent='再按一次刪除';setTimeout(()=>{btn.dataset.armed='0';btn.textContent='刪除'},3500)}
async function loadCases(){if(!currentMember?.id)return;$('caseEditor').classList.add('hidden');const {data}=await sb.from('bni_member_cases').select('*').eq('member_id',currentMember.id).order('sort_order').order('created_at',{ascending:false});$('caseList').innerHTML=data?.length?data.map(x=>`<div class="inline-card"><div class="inline-head"><div><h4>${esc(x.title||'')}</h4><span class="muted">${x.is_published===false?'隱藏':'前台顯示'}</span></div><div><button class="btn secondary" data-case-edit="${x.id}">編輯</button> <button class="btn danger" data-case-del="${x.id}">刪除</button></div></div>${x.image_url?`<img class="thumb" src="${esc(x.image_url)}">`:''}<p>${esc(x.description||'')}</p>${x.link_url?`<a href="${esc(x.link_url)}" target="_blank">開啟連結 ↗</a>`:''}</div>`).join(''):'<div class="empty">目前沒有案例。</div>';document.querySelectorAll('[data-case-edit]').forEach(b=>b.onclick=()=>editCase(b.dataset.caseEdit));document.querySelectorAll('[data-case-del]').forEach(b=>b.onclick=()=>armDelete(b,()=>deleteRow('bni_member_cases',b.dataset.caseDel,loadCases)))}
$('addCaseBtn').onclick=()=>showCase();
function showCase(x={}){$('caseEditor').classList.remove('hidden');$('case_id').value=x.id||'';$('case_title').value=x.title||'';$('case_description').value=x.description||'';$('case_link').value=x.link_url||'';$('case_current_image').value=x.image_url||'';$('case_visible').checked=x.is_published!==false;$('casePreview').innerHTML=x.image_url?`<img class="preview" src="${esc(x.image_url)}">`:''}
async function editCase(id){const {data}=await sb.from('bni_member_cases').select('*').eq('id',id).single();if(data)showCase(data)}
$('cancelCaseBtn').onclick=()=>{$('caseEditor').classList.add('hidden')};
$('saveCaseBtn').onclick=async()=>{if(!currentMember?.id)return;const title=val('case_title');if(!title)return notice('案例需要標題。','error');try{let image=val('case_current_image')||null;const file=$('case_image').files?.[0];if(file)image=await upload(file,'cases');const p={member_id:currentMember.id,title,description:val('case_description')||null,link_url:val('case_link')||null,image_url:image,is_published:$('case_visible').checked};const id=val('case_id');const {error}=id?await sb.from('bni_member_cases').update(p).eq('id',id):await sb.from('bni_member_cases').insert(p);if(error)throw error;$('caseEditor').classList.add('hidden');$('case_image').value='';notice('案例已儲存。');await loadCases()}catch(e){notice('案例儲存失敗：'+e.message,'error')}};

async function loadCollabs(){if(!currentMember?.id)return;$('collabEditor').classList.add('hidden');const {data}=await sb.from('bni_member_collaborations').select('*').eq('member_id',currentMember.id).order('created_at',{ascending:false});$('collabList').innerHTML=data?.length?data.map(x=>`<div class="inline-card"><div class="inline-head"><div><h4>${esc(x.title||'')}</h4><span class="muted">${esc(x.partner_name||'')} ${x.collaboration_date?`｜${esc(x.collaboration_date)}`:''}</span></div><div><button class="btn secondary" data-collab-edit="${x.id}">編輯</button> <button class="btn danger" data-collab-del="${x.id}">刪除</button></div></div>${x.image_url?`<img class="thumb" src="${esc(x.image_url)}">`:''}<p>${esc(x.description||'')}</p></div>`).join(''):'<div class="empty">目前沒有 BNI 合作紀錄。</div>';document.querySelectorAll('[data-collab-edit]').forEach(b=>b.onclick=()=>editCollab(b.dataset.collabEdit));document.querySelectorAll('[data-collab-del]').forEach(b=>b.onclick=()=>armDelete(b,()=>deleteRow('bni_member_collaborations',b.dataset.collabDel,loadCollabs)))}
$('addCollabBtn').onclick=()=>showCollab();
function showCollab(x={}){$('collabEditor').classList.remove('hidden');$('collab_id').value=x.id||'';$('collab_title').value=x.title||'';$('collab_partner').value=x.partner_name||'';$('collab_date').value=x.collaboration_date||'';$('collab_description').value=x.description||'';$('collab_link').value=x.link_url||'';$('collab_current_image').value=x.image_url||'';$('collab_visible').checked=x.is_published!==false;$('collabPreview').innerHTML=x.image_url?`<img class="preview" src="${esc(x.image_url)}">`:''}
async function editCollab(id){const {data}=await sb.from('bni_member_collaborations').select('*').eq('id',id).single();if(data)showCollab(data)}
$('cancelCollabBtn').onclick=()=>{$('collabEditor').classList.add('hidden')};
$('saveCollabBtn').onclick=async()=>{const title=val('collab_title');if(!title)return notice('請輸入合作標題。','error');try{let image=val('collab_current_image')||null;const file=$('collab_image').files?.[0];if(file)image=await upload(file,'collabs');const p={member_id:currentMember.id,title,partner_name:val('collab_partner')||null,collaboration_date:val('collab_date')||null,description:val('collab_description')||null,link_url:val('collab_link')||null,image_url:image,is_published:$('collab_visible').checked};const id=val('collab_id');const {error}=id?await sb.from('bni_member_collaborations').update(p).eq('id',id):await sb.from('bni_member_collaborations').insert(p);if(error)throw error;$('collabEditor').classList.add('hidden');$('collab_image').value='';notice('合作紀錄已儲存。');await loadCollabs()}catch(e){notice('合作紀錄儲存失敗：'+e.message,'error')}};

async function loadContacts(){if(!currentMember?.id)return;$('contactEditor').classList.add('hidden');const {data}=await sb.from('bni_member_contacts').select('*').eq('member_id',currentMember.id).order('sort_order').order('created_at');$('contactList').innerHTML=data?.length?data.map(x=>`<div class="inline-card"><div class="inline-head"><div><h4>${esc(x.label||'')}</h4><span class="muted">${esc(x.display_value||'')}｜${esc(x.type||'')}</span></div><div><button class="btn secondary" data-contact-edit="${x.id}">編輯</button> <button class="btn danger" data-contact-del="${x.id}">刪除</button></div></div><p>${esc(x.url||'')}</p></div>`).join(''):'<div class="empty">目前沒有聯絡方式。</div>';document.querySelectorAll('[data-contact-edit]').forEach(b=>b.onclick=()=>editContact(b.dataset.contactEdit));document.querySelectorAll('[data-contact-del]').forEach(b=>b.onclick=()=>armDelete(b,()=>deleteRow('bni_member_contacts',b.dataset.contactDel,loadContacts)))}
$('addContactBtn').onclick=()=>showContact();
function showContact(x={}){$('contactEditor').classList.remove('hidden');$('contact_id').value=x.id||'';$('contact_label').value=x.label||'';$('contact_display').value=x.display_value||'';$('contact_type').value=x.type||'link';$('contact_url').value=x.url||'';$('contact_visible').checked=x.is_published!==false}
async function editContact(id){const {data}=await sb.from('bni_member_contacts').select('*').eq('id',id).single();if(data)showContact(data)}
$('cancelContactBtn').onclick=()=>{$('contactEditor').classList.add('hidden')};
$('saveContactBtn').onclick=async()=>{const label=val('contact_label'),url=val('contact_url');if(!label||!url)return notice('聯絡方式需要標題與 URL。','error');const p={member_id:currentMember.id,label,display_value:val('contact_display')||null,type:$('contact_type').value,url,is_published:$('contact_visible').checked};const id=val('contact_id');const {error}=id?await sb.from('bni_member_contacts').update(p).eq('id',id):await sb.from('bni_member_contacts').insert(p);if(error)return notice('聯絡方式儲存失敗：'+error.message,'error');$('contactEditor').classList.add('hidden');notice('聯絡方式已儲存。');await loadContacts()};
async function deleteRow(table,id,reload){const {error}=await sb.from(table).delete().eq('id',id);if(error)return notice('刪除失敗：'+error.message,'error');await reload()}

async function loadCategories(render=true){const [cr,mr]=await Promise.all([sb.from('bni_need_categories').select('*').order('sort_order'),sb.from('bni_need_members').select('*').order('sort_order')]);if(cr.error||mr.error){notice('類別配對讀取失敗。','error');return}categories=(cr.data||[]).map(c=>({...c,member_ids:(mr.data||[]).filter(x=>x.need_key===c.key).map(x=>x.member_id)}));if(render)renderCategoryList()}
function renderCategoryList(){const el=$('categoryList');el.innerHTML=categories.map(c=>`<button class="list-item ${currentCategory?.key===c.key?'active':''}" data-category="${esc(c.key)}"><b>${esc(c.icon||'')} ${esc(c.title)}</b><span>${c.member_ids.length} 位配對成員｜${c.is_active?'前台顯示':'已停用'}</span></button>`).join('');el.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>selectCategory(b.dataset.category))}
$('addCategoryBtn').onclick=()=>{currentCategory={key:'',icon:'',title:'',small:'',description:'',steps:[],sort_order:categories.reduce((n,c)=>Math.max(n,Number(c.sort_order)||0),0)+1,is_active:true,member_ids:[]};renderCategoryList();showCategoryEditor()};
function showCategoryEditor(){$('categoryEmpty').classList.add('hidden');$('categoryEditor').classList.remove('hidden');$('cat_key').value=currentCategory.key||'';$('cat_key').readOnly=!!currentCategory.key;$('cat_icon').value=currentCategory.icon||'';$('cat_title').value=currentCategory.title||'';$('cat_small').value=currentCategory.small||'';$('cat_description').value=currentCategory.description||'';$('cat_steps').value=(currentCategory.steps||[]).join('\n');$('cat_sort').value=currentCategory.sort_order||0;$('cat_active').checked=currentCategory.is_active!==false;renderCategoryMemberPicks()}
function selectCategory(key){currentCategory=categories.find(x=>x.key===key);renderCategoryList();showCategoryEditor()}
function renderCategoryMemberPicks(){const selected=currentCategory?.member_ids||[];$('categoryMemberPicks').innerHTML=members.map(m=>`<label class="member-pick"><input type="checkbox" data-cat-member value="${m.id}" ${selected.includes(m.id)?'checked':''}><span><b>${m.member_no||'-'}｜${esc(m.name)}</b><span>${esc(m.company||'')}</span></span></label>`).join('')}
$('saveCategoryBtn').onclick=async()=>{let key=val('cat_key').toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-]/g,'');if(!key)return notice('類別代碼請使用英文或數字。','error');const title=val('cat_title');if(!title)return notice('請輸入類別名稱。','error');const p={key,icon:val('cat_icon')||'•',title,small:val('cat_small')||null,description:val('cat_description')||null,steps:val('cat_steps').split('\n').map(x=>x.trim()).filter(Boolean),sort_order:Number(val('cat_sort'))||0,is_active:$('cat_active').checked,updated_at:new Date().toISOString()};let result;if(currentCategory?.key){const {key:_,...u}=p;result=await sb.from('bni_need_categories').update(u).eq('key',currentCategory.key)}else result=await sb.from('bni_need_categories').insert(p);if(result.error)return notice('類別儲存失敗：'+result.error.message,'error');const targetKey=currentCategory?.key||key;const del=await sb.from('bni_need_members').delete().eq('need_key',targetKey);if(del.error)return notice('配對更新失敗：'+del.error.message,'error');const ids=checked('[data-cat-member]');if(ids.length){const rows=ids.map((id,i)=>({need_key:targetKey,member_id:id,sort_order:i+1}));const ins=await sb.from('bni_need_members').insert(rows);if(ins.error)return notice('配對成員儲存失敗：'+ins.error.message,'error')}notice('類別與配對人物已同步到前台。');await loadCategories();selectCategory(targetKey)};
$('deleteCategoryBtn').onclick=e=>{if(!currentCategory?.key)return;armDelete(e.currentTarget,async()=>{const {error}=await sb.from('bni_need_categories').delete().eq('key',currentCategory.key);if(error)return notice('刪除失敗：'+error.message,'error');currentCategory=null;$('categoryEditor').classList.add('hidden');$('categoryEmpty').classList.remove('hidden');await loadCategories();notice('類別已刪除。')})};

async function loadLogs(){const {data,error}=await sb.from('bni_behavior_events').select('*').order('created_at',{ascending:false}).limit(500);if(error)return notice('媒合紀錄讀取失敗：'+error.message,'error');events=data||[];renderLogs()}
function renderLogs(){const filter=$('logFilter').value;const rows=filter==='all'?events:events.filter(x=>x.event_type===filter);const labels={member_card_click:'人物點擊',contact_click:'聯絡方式點擊',chat_member_open:'小幫手推薦人物',chat_open:'開啟小幫手',chat_message:'使用者詢問',chat_intent:'選擇功能',chat_problem_pick:'選擇需求',need_select:'前台類別點擊',chat_fallback:'無法判斷'};$('logList').innerHTML=rows.length?rows.map(x=>`<div class="log-row"><div class="time">${fmtTime(x.created_at)}</div><div><span class="badge">${labels[x.event_type]||esc(x.event_type)}</span></div><div>${esc(x.member_name||x.intent||'—')}</div><div>${esc(x.query_text||x.meta?.label||x.meta?.title||x.meta?.need_key||'')}</div></div>`).join(''):'<div class="empty">沒有符合的紀錄。</div>'}

$('logFilter').onchange=renderLogs;

let auditEvents=[];
const AUDIT_EVENT_LABELS={login_success:'登入成功',login_failure:'登入失敗',login_blocked:'登入已暫時限制',logout:'登出',sessions_revoked:'登出其他裝置',session_revoked:'登出指定裝置',session_named:'裝置命名',data_insert:'新增資料',data_update:'修改資料',data_delete:'刪除資料'};
const AUDIT_ENTITY_LABELS={bni_members:'成員',bni_member_cases:'案例',bni_member_collaborations:'BNI 合作',bni_member_contacts:'聯絡方式',bni_need_categories:'問題類別',bni_need_members:'類別配對',bni_need_step_members:'步驟配對'};
const AUDIT_FIELD_LABELS={name:'姓名',company:'公司',title:'標題／職稱',tagline:'專業定位',intro:'自我介紹',expertise_category:'專業類別',services:'主要服務',common_problems:'擅長處理',work_scope:'服務內容',card_json_url:'電子名片',is_published:'前台顯示',problem_keys:'問題分類',role_keys:'流程角色',description:'內容',link_url:'連結',image_url:'圖片',partner_name:'合作對象',collaboration_date:'合作日期',contact_type:'聯絡類型',label:'顯示標題',display_text:'顯示文字',url:'URL',key:'類別代碼',icon:'圖示',small:'摘要',steps:'處理步驟',sort_order:'排序',is_active:'前台顯示類別',need_key:'需求類別',member_id:'成員',step_index:'步驟'};
async function loadAuditLogs(){
  const {data,error}=await sb.from('bni_admin_audit_logs').select('*').order('created_at',{ascending:false}).limit(1000);
  if(error)return notice('後台操作紀錄讀取失敗：'+error.message,'error');
  auditEvents=data||[];renderAuditLogs();
}
function renderAuditLogs(){
  const filter=$('auditFilter')?.value||'all';
  const q=($('auditSearch')?.value||'').trim().toLowerCase();
  const from=$('auditDateFrom')?.value?new Date($('auditDateFrom').value+'T00:00:00+08:00'):null;
  const to=$('auditDateTo')?.value?new Date($('auditDateTo').value+'T23:59:59+08:00'):null;
  const sessionTypes=['login_success','login_failure','login_blocked','logout','session_named','session_revoked','sessions_revoked'];
  const rows=auditEvents.filter(x=>{
    const typeOk=filter==='all'||(filter==='login'&&sessionTypes.includes(x.event_type))||(filter==='failure'&&['login_failure','login_blocked'].includes(x.event_type))||(filter==='data'&&x.event_type.startsWith('data_'))||(filter==='delete'&&x.event_type==='data_delete');
    if(!typeOk)return false;
    const d=new Date(x.created_at);if(from&&d<from)return false;if(to&&d>to)return false;
    if(q){const hay=[x.admin_email,x.target_label,x.entity_id,x.entity_type,...(x.changed_fields||[])].filter(Boolean).join(' ').toLowerCase();if(!hay.includes(q))return false}
    return true;
  });
  $('auditList').innerHTML=rows.length?rows.map(x=>{
    const eventLabel=AUDIT_EVENT_LABELS[x.event_type]||x.event_type;
    const entity=AUDIT_ENTITY_LABELS[x.entity_type]||x.entity_type||'管理員';
    const fields=(x.changed_fields||[]).map(k=>AUDIT_FIELD_LABELS[k]||k).join('、');
    const detail=x.event_type.startsWith('data_')?[entity,x.target_label||x.entity_id||'',fields?('欄位：'+fields):''].filter(Boolean).join('｜'):(x.target_label||x.admin_email||'管理員');
    const badgeClass=['login_failure','login_blocked'].includes(x.event_type)?' red':(x.event_type==='login_success'?' green':'');
    return `<div class="log-row"><div class="time">${fmtTime(x.created_at)}</div><div><span class="badge${badgeClass}">${esc(eventLabel)}</span></div><div>${esc(x.admin_email||'管理員')}</div><div>${esc(detail)}</div></div>`;
  }).join(''):'<div class="empty">目前沒有符合的後台操作紀錄。</div>';
}
['auditFilter','auditSearch','auditDateFrom','auditDateTo'].forEach(id=>{if($(id))$(id).oninput=renderAuditLogs});
if($('auditClearBtn'))$('auditClearBtn').onclick=()=>{if($('auditFilter'))$('auditFilter').value='all';if($('auditSearch'))$('auditSearch').value='';if($('auditDateFrom'))$('auditDateFrom').value='';if($('auditDateTo'))$('auditDateTo').value='';renderAuditLogs()};

function sessionDeviceLabel(ua){
  const s=String(ua||'');
  let browser=/Edg\//.test(s)?'Edge':/Chrome\//.test(s)?'Chrome':/Firefox\//.test(s)?'Firefox':/Safari\//.test(s)?'Safari':'瀏覽器';
  let os=/Windows/i.test(s)?'Windows':/iPhone/i.test(s)?'iPhone':/iPad/i.test(s)?'iPad':/Android/i.test(s)?'Android':/Macintosh|Mac OS/i.test(s)?'Mac':'裝置';
  return os+' · '+browser;
}
async function loadSessions(){
  let rows=[];try{rows=await sessionApi('list')||[]}catch(e){return notice('登入裝置讀取失敗。','error')}
  const current=rows.filter(x=>x.is_current);
  const others=rows.filter(x=>!x.is_current);

  const card=x=>{
    const autoName=sessionDeviceLabel(x.user_agent);
    const displayName=x.device_name||autoName;
    return `<div class="session-card ${x.is_current?'current':''}">
      <div class="session-main">
        <div class="session-name-row"><b>${esc(displayName)}</b><span class="badge${x.is_current?' green':''}">${x.is_current?'目前裝置':'其他裝置'}</span></div>
        <div class="session-device">${esc(autoName)}${x.device_name?'':' · 尚未命名'}</div>
        <div class="session-meta">登入時間：${esc(fmtTime(x.created_at))}　最後活動：${esc(fmtTime(x.last_seen_at||x.created_at))}　登入期限：${esc(fmtTime(x.expires_at))}</div>
      </div>
      <div class="session-actions">
        <button class="btn ghost" data-name-session="${esc(x.session_id)}" data-current-name="${esc(x.device_name||'')}">命名</button>
        ${x.is_current?'':`<button class="btn danger" data-revoke-session="${esc(x.session_id)}">登出此裝置</button>`}
      </div>
    </div>`;
  };

  $('sessionList').innerHTML=`
    <div class="session-section">
      <div class="session-section-head"><h3>目前裝置</h3><span>${current.length} 個 Session</span></div>
      <div class="session-stack">${current.length?current.map(card).join(''):'<div class="empty">找不到目前裝置。</div>'}</div>
    </div>
    <div class="session-section other">
      <div class="session-section-head"><h3>其他裝置</h3><span>${others.length} 個 Session</span></div>
      <div class="session-stack">${others.length?others.map(card).join(''):'<div class="empty">目前沒有其他登入裝置。</div>'}</div>
    </div>`;

  $('sessionList').querySelectorAll('[data-name-session]').forEach(btn=>btn.onclick=async()=>{
    const currentName=btn.dataset.currentName||'';
    const name=prompt('輸入這台裝置的名稱，例如：公司電腦、小如 iPhone 11',currentName);
    if(name===null)return;
    const clean=name.trim();
    if(!clean)return notice('裝置名稱不能空白。','error');
    btn.disabled=true;
    let data=false;try{data=await sessionApi('name',{session_id:btn.dataset.nameSession,device_name:clean})}catch{}if(data!==true){btn.disabled=false;return notice('裝置命名失敗。','error')}
    notice('裝置名稱已儲存。');
    await loadSessions();
  });

  $('sessionList').querySelectorAll('[data-revoke-session]').forEach(btn=>btn.onclick=async()=>{
    if(!confirm('確定要登出這個裝置？'))return;
    btn.disabled=true;
    let data=false;try{data=await sessionApi('revoke',{session_id:btn.dataset.revokeSession})}catch{}if(data!==true){btn.disabled=false;return notice('登出此裝置失敗。','error')}
    notice('已登出指定裝置。');
    await loadSessions();
  });
}

(async()=>{if(token){showApp();await bootstrap()}})();