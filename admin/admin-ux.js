(function(){
  let dirty=false;
  let baselineSteps='';
  let confirmedSteps='';
  let resetTimer=null;

  const style=document.createElement('style');
  style.textContent=`
    .page > .page-head > div > h2{display:none}
    #adminDirtyState{position:fixed;right:22px;bottom:22px;z-index:99990;display:none;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;background:#fff7df;border:1px solid #e8d49a;color:#785b12;box-shadow:0 8px 24px rgba(23,50,61,.12);font:800 12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC','Microsoft JhengHei',sans-serif}
    #adminDirtyState.show{display:flex}#adminDirtyState i{width:7px;height:7px;border-radius:50%;background:#c48a00;display:block}
    #stepConfirmGuard{display:none;margin:10px 0 4px;padding:12px 13px;border:1px solid #e3c875;background:#fff9e8;border-radius:12px;color:#6f5714;font-size:13px;line-height:1.5}
    #stepConfirmGuard.show{display:flex;align-items:center;justify-content:space-between;gap:12px}#stepConfirmGuard b{display:block;color:#5e470c;margin-bottom:2px}#stepConfirmGuard button{flex:0 0 auto;border:0;border-radius:9px;background:#00465f;color:#fff;padding:9px 11px;font-weight:800;cursor:pointer}
    .admin-front-link{display:inline-flex;align-items:center;gap:6px;border:1px solid #cbdde3;border-radius:10px;padding:8px 11px;color:#00465f;background:#fff;text-decoration:none;font-size:13px;font-weight:800}.admin-front-link:hover{background:#f4f8f9}
    @media(max-width:820px){#adminDirtyState{right:12px;bottom:12px}#stepConfirmGuard.show{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const dirtyBox=document.createElement('div');dirtyBox.id='adminDirtyState';dirtyBox.innerHTML='<i></i><span>尚未儲存</span>';document.body.appendChild(dirtyBox);

  function setDirty(on){dirty=!!on;dirtyBox.classList.toggle('show',dirty)}
  function stepSignature(){return (document.getElementById('cat_steps')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean).join('\n')}
  function saveCategoryBtn(){return document.getElementById('saveCategoryBtn')}
  function guardBox(){
    let box=document.getElementById('stepConfirmGuard');
    if(box)return box;
    const steps=document.getElementById('cat_steps');const field=steps?.closest('.field');if(!field)return null;
    box=document.createElement('div');box.id='stepConfirmGuard';box.innerHTML='<div><b>處理步驟已變更</b><span>請確認下方每個步驟的人物配對是否正確，再儲存。</span></div><button type="button" id="confirmStepMappingBtn">我已確認配對</button>';
    field.appendChild(box);
    box.querySelector('button').onclick=()=>{confirmedSteps=stepSignature();updateStepGuard()};
    return box;
  }
  function updateStepGuard(){
    const box=guardBox(),btn=saveCategoryBtn();if(!box||!btn)return;
    const sig=stepSignature();
    const changed=sig!==baselineSteps;
    const needsConfirm=changed&&confirmedSteps!==sig;
    box.classList.toggle('show',needsConfirm);
    btn.disabled=needsConfirm;
    btn.title=needsConfirm?'請先確認變更後的步驟配對':'';
  }
  function snapshotCategory(){
    clearTimeout(resetTimer);
    resetTimer=setTimeout(()=>{baselineSteps=stepSignature();confirmedSteps=baselineSteps;updateStepGuard();setDirty(false)},260);
  }
  function resetAfterSelection(){clearTimeout(resetTimer);resetTimer=setTimeout(()=>setDirty(false),220)}
  function canLeave(){return !dirty||window.confirm('目前有尚未儲存的變更，確定要離開嗎？')}

  function addFrontLink(){
    const top=document.querySelector('#appView .topbar');if(!top||document.getElementById('adminFrontLink'))return;
    const right=top.querySelector('.muted');
    const a=document.createElement('a');a.id='adminFrontLink';a.className='admin-front-link';a.href='https://mrbusinesslab.github.io/BNI-Building/?v=3';a.target='_blank';a.rel='noopener';a.textContent='↗ 查看前台';
    if(right)right.replaceWith(a);else top.appendChild(a);
  }

  document.addEventListener('input',e=>{
    if(e.target.id==='stepMemberSearch')return;
    if(e.target.closest('#memberEditor')||e.target.closest('#categoryEditor')){
      setDirty(true);
      if(e.target.id==='cat_steps')updateStepGuard();
    }
  },true);
  document.addEventListener('change',e=>{
    if(e.target.closest('#memberEditor')||e.target.closest('#categoryEditor'))setDirty(true);
  },true);
  document.addEventListener('drop',e=>{if(e.target.closest('[data-drop-step]'))setDirty(true)},true);

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-remove-step]')||e.target.closest('#analyzeMemberBtn'))setDirty(true);
    const nav=e.target.closest('.nav-btn,[data-member],[data-category],#addMemberBtn,#addCategoryBtn,#logoutBtn');
    if(!nav)return;
    if(!canLeave()){e.preventDefault();e.stopImmediatePropagation();return}
    setDirty(false);
    if(nav.matches('[data-category],#addCategoryBtn'))snapshotCategory();else resetAfterSelection();
  },true);

  window.addEventListener('beforeunload',e=>{if(!dirty)return;e.preventDefault();e.returnValue=''});

  const notice=document.getElementById('globalNotice');
  if(notice)new MutationObserver(()=>{
    const text=(notice.textContent||'').trim();
    if(!text)return;
    if(/已儲存|儲存成功|已更新|已新增|已同步到前台|已同步|完成/.test(text)&&!/失敗|錯誤/.test(text)){
      setDirty(false);
      if(/類別|步驟|配對|同步到前台/.test(text)){baselineSteps=stepSignature();confirmedSteps=baselineSteps;updateStepGuard()}
    }
  }).observe(notice,{childList:true,subtree:true,characterData:true});

  document.addEventListener('DOMContentLoaded',()=>{addFrontLink();guardBox();snapshotCategory()});
  setTimeout(()=>{addFrontLink();guardBox()},300);
})();
