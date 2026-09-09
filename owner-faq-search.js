(()=>{
  const section=document.querySelector('#owner-faq-library');if(!section)return;
  const input=section.querySelector('#ownerFaqSearch'),clear=section.querySelector('.faq-search-clear'),status=section.querySelector('.faq-search-status'),best=section.querySelector('.faq-best-answer'),bestQuestion=best.querySelector('h4'),bestAnswer=best.querySelector('p'),bestLink=best.querySelector('button'),empty=section.querySelector('.faq-empty'),expand=section.querySelector('.faq-expand-all'),categoryButtons=[...section.querySelectorAll('[data-faq-category]')],entries=[...section.querySelectorAll('.faq-list details')];
  const stop=new Set(['a','an','and','are','can','do','does','for','how','i','if','in','is','it','my','of','on','or','the','to','what','when','will','with','you','your']);
  const normalize=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9$%]+/g,' ').trim();
  const records=entries.map((element,index)=>{const question=element.querySelector('summary span').textContent.trim(),answer=element.querySelector('.faq-answer').textContent.trim();return{element,index,question,answer,q:normalize(question),a:normalize(answer),category:element.dataset.category}});
  let activeCategory='all',currentResults=records;
  function relevance(record,query){const phrase=normalize(query),terms=phrase.split(' ').filter(term=>term.length>1&&!stop.has(term)),combined=`${record.q} ${record.a}`;let score=0;if(record.q===phrase)score+=500;if(record.q.startsWith(phrase))score+=220;if(record.q.includes(phrase))score+=160;if(record.a.includes(phrase))score+=70;for(const term of terms){if(record.q.split(' ').some(word=>word===term))score+=28;else if(record.q.includes(term))score+=18;if(record.a.includes(term))score+=5}const matchesPhrase=combined.includes(phrase),matchedTerms=terms.filter(term=>combined.includes(term)).length,matchesTerms=terms.length&&matchedTerms>=Math.max(1,Math.ceil(terms.length*.6));return matchesPhrase||matchesTerms?score:-1}
  function render(){
    const query=input.value.trim(),hasQuery=normalize(query).length>1;
    currentResults=records.map(record=>({...record,score:hasQuery?relevance(record,query):0})).filter(record=>(activeCategory==='all'||record.category===activeCategory)&&(!hasQuery||record.score>=0)).sort((a,b)=>b.score-a.score||a.index-b.index);
    const visible=new Set(currentResults.map(record=>record.element));records.forEach(record=>{record.element.hidden=!visible.has(record.element);if(record.element.hidden)record.element.open=false});
    clear.hidden=!query;empty.hidden=currentResults.length>0;
    if(hasQuery&&currentResults.length){const answer=currentResults[0];best.hidden=false;best.dataset.target=answer.element.id;bestQuestion.textContent=answer.question;bestAnswer.textContent=answer.answer;status.textContent=`Showing ${currentResults.length} matching answer${currentResults.length===1?'':'s'}. Best match appears first.`}
    else{best.hidden=true;best.removeAttribute('data-target');status.textContent=hasQuery?'No matching owner answers found. Try fewer or different words.':`${currentResults.length} owner questions available.`}
    expand.textContent='Expand all';expand.dataset.expanded='false';
  }
  input.addEventListener('input',render);
  section.querySelector('.faq-search').addEventListener('submit',event=>{event.preventDefault();if(!best.hidden)best.focus({preventScroll:true})});
  clear.addEventListener('click',()=>{input.value='';render();input.focus()});
  section.querySelectorAll('[data-faq-suggestion]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.faqSuggestion;render();input.focus()}));
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{activeCategory=button.dataset.faqCategory;categoryButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render()}));
  bestLink.addEventListener('click',()=>{const target=document.getElementById(best.dataset.target);if(!target)return;target.hidden=false;target.open=true;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});history.replaceState(null,'',`#${target.id}`)});
  expand.addEventListener('click',()=>{const shouldOpen=expand.dataset.expanded!=='true';currentResults.forEach(record=>record.element.open=shouldOpen);expand.dataset.expanded=String(shouldOpen);expand.textContent=shouldOpen?'Collapse all':'Expand all'});
  input.addEventListener('keydown',event=>{if(event.key==='Escape'&&input.value){input.value='';render()}});
  render();
})();
