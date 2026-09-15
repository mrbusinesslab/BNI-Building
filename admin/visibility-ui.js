(function(){
const configs=[
  {id:'m_visible',host:'memberEditor',label:'成員',note:'關閉後，此成員不會顯示在前台。'},
  {id:'cat_active',host:'categoryEditor',label:'需求類別',note:'關閉後，此需求類別不會顯示在前台。'},
  {id:'case_visible',host:'caseEditor',label:'案例',note:'關閉後，此案例不會顯示在前台人物資料。'},
  {id:'collab_visible',host:'collabEditor',label:'BNI 合作',note:'關閉後，此合作內容不會顯示在前台人物資料。'},
  {id:'contact_visible',host:'contactEditor',label:'聯絡方式',note:'關閉後，此聯絡方式不會顯示在前台。'}
];
function updateBar(input,bar){
  const on=input.checked;
  bar.classList.toggle('is-visible',on);
  bar.classList.toggle('is-hidden',!on);
  const state=bar.querySelector('.visibility-state');
  const desc=bar.querySelector('.visibility-desc');
  if(state)state.textContent=on?'● 顯示中':'○ 已隱藏';
  if(desc)desc.textContent=on?'目前前台可以看到這項內容。':'目前前台不會看到這項內容。';
}
function mount(c){
  const input=document.getElementById(c.id),host=document.getElementById(c.host);if(!input||!host)return;
  let bar=document.querySelector(`[data-visibility-for="${c.id}"]`);
  if(!bar){
    const oldParent=input.parentElement;
    if(oldParent)oldParent.classList.add('visibility-source-hidden');
    bar=document.createElement('div');
    bar.className='visibility-status-bar';
    bar.dataset.visibilityFor=c.id;
    bar.innerHTML=`<div class="visibility-copy"><div class="visibility-title"><b>前台狀態</b><span class="visibility-state"></span></div><div class="visibility-desc"></div><small>${c.note}</small></div><div class="visibility-control"><span>隱藏</span><label class="visibility-switch"><span class="visibility-input-slot"></span><i></i></label><span>顯示</span></div>`;
    host.insertBefore(bar,host.firstChild);
    bar.querySelector('.visibility-input-slot').replaceWith(input);
    input.addEventListener('change',()=>updateBar(input,bar));
  }else if(!bar.contains(input)){
    const slot=bar.querySelector('.visibility-input-slot');if(slot)slot.replaceWith(input);
  }
  updateBar(input,bar);
}
function mountAll(){configs.forEach(mount)}
function delayedMount(){setTimeout(mountAll,0)}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-member]')||e.target.closest('#addMemberBtn')||e.target.closest('[data-category]')||e.target.closest('#addCategoryBtn')||e.target.closest('#addCaseBtn')||e.target.closest('[data-edit-case]')||e.target.closest('#addCollabBtn')||e.target.closest('[data-edit-collab]')||e.target.closest('#addContactBtn')||e.target.closest('[data-edit-contact]'))delayedMount();
});
mountAll();
})();