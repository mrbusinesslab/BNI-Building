/* 砌好厝3.0 GA4. Free text and contact details stay in the backend. */
(function(){
  'use strict';
  if(window.bniAnalytics)return;
  const id='G-28H183GFNE';
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  function pageLocation(){
    const u=new URL(location.href);
    const result=new URL(u.origin+u.pathname);
    for(const key of ['utm_source','utm_medium','utm_campaign']){
      const value=u.searchParams.get(key);
      if(value&&/^[a-zA-Z0-9_-]{1,80}$/.test(value))result.searchParams.set(key,value);
    }
    return result.href;
  }
  function memberId(name){
    try{
      const p=typeof backendProfiles!=='undefined'?backendProfiles.get(name):null;
      const number=p?.member?.member_no;
      return number ? String(number) : '';
    }catch(_){return ''}
  }
  function key(value){
    const s=String(value||'');
    return /^[a-zA-Z0-9_-]{1,60}$/.test(s)?s:'';
  }
  function contactType(data){
    const text=String(data.meta?.type||data.meta?.label||'').toLowerCase();
    if(/line/.test(text))return 'line';
    if(/phone|tel|電話|手機/.test(text))return 'phone';
    if(/mail|信箱|郵件/.test(text))return 'email';
    if(/instagram|(^|\W)ig($|\W)/.test(text))return 'instagram';
    if(/facebook|(^|\W)fb($|\W)/.test(text))return 'facebook';
    return 'other';
  }
  const names={
    need_select:'need_select',
    member_card_click:'member_select',
    member_view:'member_view',
    contact_click:'contact_click',
    assistant_contact_click:'contact_click',
    chat_member_open:'member_select',
    chat_open:'assistant_open',
    chat_message:'assistant_question',
    chat_intent:'assistant_intent',
    chat_problem_pick:'assistant_need_select',
    chat_rule_match:'assistant_rule_match',
    chat_results:'match_results',
    chat_fallback:'assistant_no_match',
    chat_out_of_scope:'assistant_out_of_scope',
    chat_unanswered_report:'assistant_report'
  };
  function track(type,data={}){
    try{
      const eventName=names[type];
      if(!eventName)return;
      const params={
        send_to:id,site_id:'bni_building',event_source:'website',
        page_location:pageLocation(),page_title:'砌好厝3.0｜工程資源中心',
        entry_point:type.startsWith('chat_')||type==='assistant_contact_click'?'assistant':'website'
      };
      const number=memberId(data.member_name);
      if(number)params.member_id=number;
      const need=key(data.meta?.need_key);
      if(need)params.need_key=need;
      const intent=key(data.intent);
      if(intent)params.intent=intent;
      const step=Number(data.meta?.step_index);
      if(data.meta?.step_index!=null&&Number.isInteger(step)&&step>=0)params.step_index=step;
      if(type==='chat_results')params.result_count=Math.max(0,Math.min(8,Number(data.meta?.result_count)||0));
      if(eventName==='contact_click'){
        params.contact_type=contactType(data);
        params.entry_point=type==='assistant_contact_click'?'assistant':'member_profile';
      }
      // Never spread data/meta: they can contain questions, names or addresses.
      window.gtag('event',eventName,params);
    }catch(_){ /* Analytics failure must not block the site or backend logging. */ }
  }
  window.bniAnalytics={track,measurementId:id};
  let referrer='';
  try{if(document.referrer)referrer=new URL(document.referrer).origin+'/'}catch(_){}
  window.gtag('js',new Date());
  window.gtag('config',id,{
    page_location:pageLocation(),page_title:'砌好厝3.0｜工程資源中心',
    page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false
  });
  const tag=document.createElement('script');
  tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+id;
  document.head.appendChild(tag);
})();
