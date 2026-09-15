(function(){
function groupBlock(title,note,items,kind){
  if(!items.length)return'';
  return `<div class="category-group category-group-${kind}"><div class="category-group-head"><b>${title}</b><span>${note}</span></div>${items.map(c=>`<button class="list-item ${currentCategory?.key===c.key?'active':''}" data-category="${esc(c.key)}"><b>${esc(c.icon||'')} ${esc(c.title)}</b><span>${c.member_ids.length} 位配對成員｜${c.is_active?'前台顯示':'前台隱藏'}</span></button>`).join('')}</div>`;
}
renderCategoryList=function(){
  const el=document.getElementById('categoryList');if(!el)return;
  const visible=categories.filter(c=>c.is_active!==false).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  const hidden=categories.filter(c=>c.is_active===false).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  el.innerHTML=groupBlock('顯示的內容','目前會顯示在前台的需求類別',visible,'visible')+groupBlock('隱藏的內容','目前不會顯示在前台，資料仍保留',hidden,'hidden');
  el.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>selectCategory(b.dataset.category));
};
const style=document.createElement('style');style.textContent=`
#categoryList{gap:0}.category-group{display:grid;gap:7px;margin-bottom:18px}.category-group:last-child{margin-bottom:0}.category-group-head{display:grid;gap:2px;padding:9px 10px 7px;border-bottom:1px solid #dfe8eb}.category-group-head b{font-size:12px;color:#123d4d}.category-group-head span{font-size:10px;color:var(--muted)}.category-group-visible .category-group-head{border-left:3px solid #0b5870}.category-group-hidden .category-group-head{border-left:3px solid #9aa8ad}.category-group-hidden .list-item:not(.active){background:#fafbfb}.category-group-hidden .list-item:not(.active) b{color:#65757b}`;document.head.appendChild(style);
})();