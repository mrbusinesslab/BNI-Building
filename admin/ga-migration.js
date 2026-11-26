/* GA primary mode; history remains available under a collapsed archive. */
(function(){
  const root=document.getElementById('page-dashboard');
  if(!root||document.getElementById('gaMigrationPanel'))return;
  const panel=document.createElement('section');panel.id='gaMigrationPanel';panel.className='panel';
  panel.innerHTML=`
  <h3>GA 成效分析</h3>
  <p>GA 已確認收到瀏覽與小幫手事件，現為主要成效分析入口。歷史紀錄保留；新的問題、推薦名單與處理紀錄繼續存於本站。</p>
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
  <p><small>下方歷史統計已封存至切換前；數字是操作次數，包含測試，不代表訪客數或成交率。</small></p>`;
  root.querySelector('.page-head')?.insertAdjacentElement('afterend',panel);
  const heading=root.querySelector('.page-head h2');if(heading)heading.textContent='成效分析與待辦';
  const description=root.querySelector('.page-head p');if(description)description.textContent='GA 查看網站成效；後台管理配對、問題與歷史紀錄。';
  const archive=document.createElement('details');archive.id='legacyAnalyticsArchive';archive.className='panel';
  const summary=document.createElement('summary');summary.textContent='查看切換前的歷史互動統計（含測試）';archive.appendChild(summary);
  const note=document.createElement('p');note.textContent='統計截止：2026/11/26 13:05（台灣時間）。完整逐筆紀錄仍可在「配對與問題紀錄」查詢。';archive.appendChild(note);
  for(const child of [...root.children]){
    if(child.matches('.stats,#dashboardAnalytics,.legacy-dashboard-block'))archive.appendChild(child);
  }
  root.appendChild(archive);
  const operations=document.createElement('section');operations.id='backendOperations';operations.className='panel';
  operations.innerHTML='<h3>配對與問題處理</h3><div id="operationCounts" class="stats"></div><p><button class="btn secondary" id="openDetailRecords">查看配對與問題紀錄</button></p><p><small>下列為操作紀錄次數，包含測試。未記錄詢問與成交結果時，不代表有效名單或成交。</small></p>';
  panel.insertAdjacentElement('afterend',operations);
  document.getElementById('openDetailRecords').onclick=()=>switchPage('logs');
  const legacyLoad=window.loadDashboard;
  window.loadDashboard=async function(){
    await legacyLoad();
    const since=new Date(Date.now()-7*86400000).toISOString();
    const [pending,questions,results]=await Promise.all([
      sb.from('bni_assistant_reports').select('id',{count:'exact',head:true}).eq('status','pending'),
      sb.from('bni_behavior_events').select('id',{count:'exact',head:true}).eq('event_type','chat_message').gte('created_at',since),
      sb.from('bni_behavior_events').select('id',{count:'exact',head:true}).eq('event_type','chat_results').gte('created_at',since)
    ]);
    const items=[['待處理問題',pending],['近 7 日詢問紀錄',questions],['近 7 日推薦名單紀錄',results]];
    document.getElementById('operationCounts').innerHTML=items.map(([label,response])=>'<div class="stat"><span>'+label+'</span><strong>'+(response.error?'讀取失敗':response.count??0)+'</strong></div>').join('');
  };
})();
