(function(){
if(!document.querySelector('link[href^="./visibility-ui.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./visibility-ui.css?v=20261021-1120';document.head.appendChild(l)}
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
function memberGroup(title,note,items,kind){if(!items.length)return'';return `<div class="member-status-group member-status-group-${kind}"><div class="member-status-group-head"><b>${title}</b><span>${note}</span></div>${items.map(m=>{const hidden=m.is_published===false,c=typeof memberCompleteness==='function'?memberCompleteness(m):{done:0,total:6,missing:[]},complete=c.done===c.total,missing=complete?'資料已完整':'缺：'+(c.missing||[]).join('／');return `<button class="list-item member-status-item ${hidden?'status-hidden':'status-visible'} ${currentMember?.id===m.id?'active':''}" data-member="${m.id}"><span class="status-badge ${hidden?'badge-hidden':'badge-visible'}">${hidden?'已隱藏':'顯示中'}</span><div class="member-status-main"><b>${m.member_no||'-'}｜${esc(m.name)}</b><span>${esc(m.company||'')}</span></div><div class="member-completeness ${complete?'is-complete':'is-incomplete'}"><span>資料完整度</span><strong>${c.done}/${c.total}</strong></div><div class="member-missing ${complete?'is-complete':''}">${missing}</div></button>`}).join('')}</div>`}
if(typeof renderMemberList==='function'){renderMemberList=function(){
 const el=document.getElementById('memberList');if(!el)return;
 const visibleTotal=members.filter(m=>m.is_published!==false).length,hiddenTotal=members.filter(m=>m.is_published===false).length;
 let filters=document.getElementById('memberVisibilityFilters');
 if(!filters){filters=document.createElement('div');filters.id='memberVisibilityFilters';filters.className='member-visibility-filters';filters.dataset.filter='all';el.parentElement.insertBefore(filters,el)}
 const visibilityFilter=filters.dataset.filter||'all';
 filters.innerHTML=`<button type="button" data-member-visibility="all">全部 <b>${members.length}</b></button><button type="button" data-member-visibility="visible">顯示中 <b>${visibleTotal}</b></button><button type="button" data-member-visibility="hidden">已隱藏 <b>${hiddenTotal}</b></button>`;
 filters.querySelectorAll('[data-member-visibility]').forEach(button=>{button.classList.toggle('active',button.dataset.memberVisibility===visibilityFilter);button.onclick=()=>{filters.dataset.filter=button.dataset.memberVisibility;renderMemberList()}});
 const normalize=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/輝/g,'暉');
 const q=normalize(document.getElementById('memberSearch')?.value||'');
 const searchText=m=>normalize([m.member_no,m.name,m.company,m.title,m.expertise_category,m.services,m.name==='廖嘉暉'?'Max嘉暉 Max嘉輝 廖嘉輝':''].filter(Boolean).join(' '));
 const searched=q?members.filter(m=>searchText(m).includes(q)):members;
 const filtered=searched.filter(m=>visibilityFilter==='hidden'?m.is_published===false:visibilityFilter==='visible'?m.is_published!==false:true);
 const allScored=members.map(m=>({m,c:memberCompleteness(m)})),completeCount=allScored.filter(x=>x.c.done===x.c.total).length,summary=document.getElementById('memberCompletenessSummary');
 if(summary)summary.innerHTML=`<div><b>資料完整度統整</b><span>共 ${members.length} 位成員</span></div><div class="completeness-summary-counts"><span class="complete">完整 ${completeCount} 位</span><span class="incomplete">待補 ${members.length-completeCount} 位</span></div>`;
 const visible=filtered.filter(m=>m.is_published!==false).sort((a,b)=>(Number(a.member_no)||0)-(Number(b.member_no)||0));
 const hidden=filtered.filter(m=>m.is_published===false).sort((a,b)=>(Number(a.member_no)||0)-(Number(b.member_no)||0));
 el.innerHTML=filtered.length?memberGroup('顯示的內容','目前會顯示在前台的成員',visible,'visible')+memberGroup('隱藏的內容','目前不會顯示在前台，資料仍保留',hidden,'hidden'):'<div class="no-search">找不到符合的成員。</div>';
 el.querySelectorAll('[data-member]').forEach(b=>b.onclick=()=>selectMember(b.dataset.member));
 const count=document.getElementById('memberSearchCount');if(count)count.textContent=(q||visibilityFilter!=='all')?`顯示 ${filtered.length} / ${members.length} 位`:`共 ${members.length} 位成員`;
}}
mountAll();
})();