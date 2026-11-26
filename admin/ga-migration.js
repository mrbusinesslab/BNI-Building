/* Keep the legacy dashboard until GA receipt is verified. */
(function(){
  const root=document.getElementById('page-dashboard');
  if(!root||document.getElementById('gaMigrationPanel'))return;
  const panel=document.createElement('section');panel.id='gaMigrationPanel';panel.className='panel';
  panel.innerHTML=`
  <h3>GA 成效分析</h3>
  <p>建築組入口已安裝 GA，正在驗收資料接收。確認正常後，GA 將作為主要成效分析；原有紀錄全部保留。</p>
  <p><a class="btn" href="https://analytics.google.com/" target="_blank" rel="noopener">開啟 Google Analytics</a></p>
  <p>進入後選擇「砌好厝3.0」資源，再查看「即時總覽」。評估 ID：<code>G-28H183GFNE</code></p>
  <p>GA 查看訪客來源、需求與人物互動、聯繫流程；本站保留問題原文、當次推薦名單與回報處理。</p>
  <details><summary>GA 詳細分析需要的自訂定義</summary>
  <p>在 GA「管理 → 資料顯示 → 自訂定義」建立下列事件範圍的維度：</p>
  <table><thead><tr><th>維度名稱</th><th>事件參數</th></tr></thead><tbody>
  <tr><td>需求分類</td><td>need_key</td></tr>
  <tr><td>成員編號</td><td>member_id</td></tr>
  <tr><td>互動入口</td><td>entry_point</td></tr>
  <tr><td>聯繫類型</td><td>contact_type</td></tr>
  <tr><td>小幫手功能</td><td>intent</td></tr>
  </tbody></table>
  <p>推薦人數 result_count 可建立事件範圍的自訂指標，單位選「標準」。</p>
  </details>
  <p><small>下方為既有後台紀錄，數字是操作次數，包含測試；聯繫／人物查看比例不是訪客轉換率或成交率。</small></p>`;
  root.querySelector('.page-head')?.insertAdjacentElement('afterend',panel);
  const heading=root.querySelector('.page-head h2');if(heading)heading.textContent='成效分析與待辦';
  const description=root.querySelector('.page-head p');if(description)description.textContent='GA 驗收中；歷史紀錄與問題處理持續保留。';
})();
