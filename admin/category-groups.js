(function(){
const OLD_KEYS=new Set(['water','mep','low_voltage','design','demolition_masonry','wood_furniture','lighting_curtains','paint']);
const NEW_KEYS=new Set(['commercial_space','home_planning','office_planning','home_repair','soft_furnishing','old_house_renovation']);
function groupBlock(title,note,items,kind){
  if(!items.length)return'';
  return `<div class="category-group category-group-${kind}"><div class="category-group-head"><b>${title}</b><span>${note}</span></div>${items.map(c=>`<button class="list-item ${currentCategory?.key===c.key?'active':''}" data-category="${esc(c.key)}"><b>${esc(c.icon||'')} ${esc(c.title)}</b><span>${c.member_ids.length} 位配對成員｜${c.is_active?'前台顯示':'前台隱藏'}</span></button>`).join('')}</div>`;
}
renderCategoryList=function(){
  const el=document.getElementById('categoryList');if(!el)return;
  const newer=categories.filter(c=>NEW_KEYS.has(c.key)).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  const older=categories.filter(c=>OLD_KEYS.has(c.key)).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  const other=categories.filter(c=>!NEW_KEYS.has(c.key)&&!OLD_KEYS.has(c.key)).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  el.innerHTML=groupBlock('目前新版需求','這次新增的 6 個需求類別',newer,'new')+groupBlock('原本需求','一開始的 8 個類別，目前前台隱藏',older,'old')+groupBlock('其他','其他保留類別',other,'other');
  el.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>selectCategory(b.dataset.category));
};
const style=document.createElement('style');style.textContent=`
#categoryList{gap:0}.category-group{display:grid;gap:7px;margin-bottom:18px}.category-group:last-child{margin-bottom:0}.category-group-head{display:grid;gap:2px;padding:9px 10px 7px;border-bottom:1px solid #dfe8eb}.category-group-head b{font-size:12px;color:#123d4d}.category-group-head span{font-size:10px;color:var(--muted)}.category-group-new .category-group-head{border-left:3px solid #0b5870}.category-group-old .category-group-head{border-left:3px solid #9aa8ad}.category-group-old .list-item:not(.active){background:#fafbfb}.category-group-old .list-item:not(.active) b{color:#65757b}.category-group-other .category-group-head{border-left:3px solid #b28a52}`;document.head.appendChild(style);
})();