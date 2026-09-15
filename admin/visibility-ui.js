(function(){
if(!document.querySelector('link[href^="./visibility-ui.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./visibility-ui.css?v=20260915-1830';document.head.appendChild(l)}
const configs=[
  {id:'m_visible',host:'memberEditor'},
  {id:'cat_active',host:'categoryEditor'},
  {id:'case_visible',host:'caseEditor'},
  {id:'collab_visible',host:'collabEditor'},
  {id:'contact_visible',host:'contactEditor'}
];
function updateControl(input,control){const on=input.checked;control.classList.toggle('is-visible',on);control.classList.toggle('is-hidden',!on);const state=control.querySelector('.visibility-mini-state');if(state)state.textContent=on?'顯示中':'已隱藏'}
function mount(c){const input=document.getElementById(c.id),host=document.getElementById(c.host);if(!input||!host)return;host.classList.add('has-visibility-control');let control=document.querySelector(`[data-visibility-for="${c.id}"]`);if(!control){const oldParent=input.parentElement;if(oldParent)oldParent.classList.add('visibility-source-hidden');control=document.createElement('div');control.className='visibility-compact';control.dataset.visibilityFor=c.id;control.innerHTML=`<span class="visibility-mini-state"></span><div class="visibility-mini-switch"><span>隱藏</span><label class="visibility-switch"><span class="visibility-input-slot"></span><i></i></label><span>顯示</span></div>`;host.insertBefore(control,host.firstChild);control.querySelector('.visibility-input-slot').replaceWith(input);input.addEventListener('change',()=>updateControl(input,control))}else if(!control.contains(input)){const slot=control.querySelector('.visibility-input-slot');if(slot)slot.replaceWith(input)}updateControl(input,control)}
function mountAll(){configs.forEach(mount)}
function delayedMount(){setTimeout(mountAll,0)}
document.addEventListener('click',e=>{if(e.target.closest('[data-member]')||e.target.closest('#addMemberBtn')||e.target.closest('[data-category]')||e.target.closest('#addCategoryBtn')||e.target.closest('#addCaseBtn')||e.target.closest('[data-edit-case]')||e.target.closest('#addCollabBtn')||e.target.closest('[data-edit-collab]')||e.target.closest('#addContactBtn')||e.target.closest('[data-edit-contact]'))delayedMount()});
if(typeof renderMemberList==='function'){renderMemberList=function(){const el=document.getElementById('memberList');if(!el)return;el.innerHTML=members.map(m=>{const hidden=m.is_published===false;return `<button class="list-item member-status-item ${hidden?'status-hidden':'status-visible'} ${currentMember?.id===m.id?'active':''}" data-member="${m.id}"><span class="status-badge ${hidden?'badge-hidden':'badge-visible'}">${hidden?'已隱藏':'顯示中'}</span><b>${m.member_no||'-'}｜${esc(m.name)}</b><span>${esc(m.company||'')}</span></button>`}).join('');el.querySelectorAll('[data-member]').forEach(b=>b.onclick=()=>selectMember(b.dataset.member))}}
mountAll();
})();