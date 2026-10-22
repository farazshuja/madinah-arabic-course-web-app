'use strict';
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const PAGE_SIZE=30;
const normalizeSearch=value=>String(value).normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g,'').toLocaleLowerCase();
let data,byId,topics,branches,selected,view='tree',query='',topic='',level='',page=0,reviewOrder=null;
const openGroups=new Map();
const treatments={retained:'Source rule',qualification:'Qualification',comparison:'Compare the patterns','merged-rule':'Shared rule · combined sources','combined-sequence':'Related ideas · grouped'};
const help={tree:'Open a topic and a smaller branch. Ideas within each branch progress from simpler patterns to later refinements.',path:'Follow the suggested order. Supporting concepts appear before the ideas that build on them. Filter a topic to follow its own path.',review:'Recall the rule from the prompt or Arabic example before revealing it. Then compare your answer with the explanation and revisit it after a gap.'};
function matches(c){
  return (!topic||c.primaryTopic===topic)&&(!level||c.difficulty===Number(level))&&(!query||c.search.includes(query));
}
function filtered(){return data.learningPath.filter(id=>matches(byId.get(id)));}
function sequence(){const ids=filtered();return view==='review'&&reviewOrder?reviewOrder.filter(id=>ids.includes(id)):ids;}
function saveUrl(){const url=new URL(location.href);url.searchParams.set('view',view);url.hash=selected?encodeURIComponent(selected):'';history.replaceState(null,'',url);}
function choose(id,{clearFilters=false}={}){
  id=byId.has(id)?id:data.aliases[id];if(!byId.has(id))return;
  if(clearFilters){query='';topic='';level='';$('#search').value='';$('#topic').value='';$('#level').value='';reviewOrder=null;}
  selected=id;
  openGroups.set(`topic:${byId.get(id).primaryTopic}`,true);openGroups.set(`branch:${byId.get(id).subtopic}`,true);
  page=Math.max(0,Math.floor(sequence().indexOf(id)/PAGE_SIZE));saveUrl();render();
}
function button(id){
  const c=byId.get(id),index=data.learningPath.indexOf(id);
  const title=view==='review'?`Review ${index+1}`:c.title;
  return `<button class="concept-link" data-concept="${esc(id)}" aria-current="${id===selected}">${esc(title)}<small>Level ${c.difficulty} · ${esc(branches.get(c.subtopic).title)}</small></button>`;
}
function navigation(ids){
  if(!ids.length)return '<p class="empty muted">No matching ideas. Try a shorter search or clear the filters.</p>';
  if(view==='tree')return data.topics.map(t=>{
    const members=ids.filter(id=>byId.get(id).primaryTopic===t.id);if(!members.length)return '';
    const opened=query||openGroups.get(`topic:${t.id}`);
    return `<details data-group="topic:${esc(t.id)}" ${opened?'open':''}><summary>${esc(t.title)} <span class="count">${members.length}</span></summary>${data.subtopics.filter(s=>s.topic===t.id).map(s=>{
      const subset=members.filter(id=>byId.get(id).subtopic===s.id);if(!subset.length)return '';
      return `<details class="branch" data-group="branch:${esc(s.id)}" ${query||openGroups.get(`branch:${s.id}`)?'open':''}><summary>${esc(s.title)} <span class="count">${subset.length}</span></summary>${subset.map(button).join('')}</details>`;
    }).join('')}</details>`;
  }).join('');
  const pages=Math.ceil(ids.length/PAGE_SIZE);page=Math.min(page,pages-1);
  return `<div class="page-controls"><button id="earlier-page" ${page===0?'disabled':''}>← Earlier</button><span>${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE,ids.length)} of ${ids.length}</span><button id="later-page" ${page===pages-1?'disabled':''}>Later →</button></div>${ids.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(button).join('')}`;
}
function examples(c){return c.examples.map((e,i)=>`<div class="example"><div class="arabic" lang="ar" dir="rtl">${esc(e.arabic)}</div><div class="translation">${esc(e.translation)}</div><small>${esc(c.sourceCards.find(s=>s.id===e.sourceCardId).book)} · Chapter ${esc(c.sourceCards.find(s=>s.id===e.sourceCardId).chapter)}</small><details><summary>Why this works</summary><p class="explanation">${esc(e.explanation)}</p></details></div>`).join('');}
function render(){
  const ids=sequence();
  if(!ids.includes(selected))selected=ids[0];
  const scroll=$('#navigation').scrollTop;
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));
  $('#view-help').textContent=help[view];$('#mix').hidden=view!=='review';$('#mix').disabled=ids.length<2;
  $('#result-count').textContent=`${ids.length} of ${data.concepts.length} concepts${topic?' · '+topics.get(topic).title:''}${level?' · Level '+level:''}`;
  $('#navigation').innerHTML=navigation(ids);$('#navigation').scrollTop=scroll;
  document.querySelectorAll('[data-group]').forEach(el=>el.ontoggle=()=>openGroups.set(el.dataset.group,el.open));
  if(!selected){$('#detail').innerHTML='<h2>No matching concepts</h2><p>Clear a filter or try another search.</p>';bindNavigation();return;}
  const c=byId.get(selected),index=ids.indexOf(selected),globalIndex=data.learningPath.indexOf(selected);
  const prompt=c.reviewPrompts[0];
  const review=`<section class="review-box"><span class="eyebrow">TRY FROM MEMORY</span>${prompt.arabic?`<div class="arabic" lang="ar" dir="rtl">${esc(prompt.arabic)}</div>`:''}<p>${esc(prompt.prompt)}</p><button class="action" id="reveal" aria-expanded="false" aria-controls="review-answer">Reveal answer</button><div class="answer" id="review-answer" hidden><p>${esc(prompt.answer)}</p>${prompt.translation?`<p class="translation">${esc(prompt.translation)}</p>`:''}</div></section>`;
  const lesson=`<div id="lesson" ${view==='review'?'hidden':''}><p class="rule">${esc(c.rule)}</p>${examples(c)}${c.treatment!=='retained'?`<p class="note">${esc(c.note)}</p>`:''}</div>`;
  const related=c.relatedTopics.map(id=>`<button data-topic="${esc(id)}">${esc(topics.get(id).title)} ↗</button>`).join('');
  $('#detail').innerHTML=`<p class="breadcrumb">${esc(topics.get(c.primaryTopic).title)} / ${esc(branches.get(c.subtopic).title)}</p><span class="eyebrow">IDEA ${globalIndex+1} · LEVEL ${c.difficulty} / 4</span><h2>${view==='review'?'Recall the idea':esc(c.title)}</h2><span class="chip">${esc(treatments[c.treatment])}</span>${view==='review'?review+lesson:lesson+review}<section id="connections" ${view==='review'?'hidden':''}><h3>Builds on</h3><div class="connections">${c.prerequisites.length?c.prerequisites.map(id=>`<button data-prerequisite="${esc(id)}">${esc(byId.get(id).title)} ↗</button>`).join(''):'<span class="muted">A starting idea in this path.</span>'}</div>${related?`<h3>Related topics</h3><div class="connections">${related}</div>`:''}</section><details id="sources" ${view==='review'?'hidden':''}><summary>${c.sourceCards.length} original card${c.sourceCards.length===1?'':'s'} · exact takeaways & links</summary>${c.sourceCards.map(s=>`<div class="source-item"><a href="../index.html?card=${encodeURIComponent(s.id)}">${esc(s.title)} ↗</a><p class="muted">${esc(s.book)} · Chapter ${esc(s.chapter)} · ${esc(s.source)}</p><blockquote>${esc(s.takeaway)}</blockquote><a href="${esc(s.cardUrl)}" target="_blank" rel="noopener">Published card link ↗</a></div>`).join('')}</details><div class="controls"><button id="previous" ${index===0?'disabled':''}>← Previous</button><button id="next" ${index===ids.length-1?'disabled':''}>Next idea →</button></div>`;
  $('#reveal').onclick=()=>{
    const revealed=$('#review-answer').hidden;$('#review-answer').hidden=!revealed;
    $('#reveal').setAttribute('aria-expanded',revealed);$('#reveal').textContent=revealed?'Hide answer':'Reveal answer';
    if(view==='review')for(const id of ['#lesson','#sources','#connections'])$(id).hidden=!revealed;
  };
  document.querySelectorAll('[data-prerequisite]').forEach(b=>b.onclick=()=>choose(b.dataset.prerequisite,{clearFilters:true}));
  document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{
    topic=b.dataset.topic;level='';query='';$('#topic').value=topic;$('#level').value='';$('#search').value='';reviewOrder=null;view='tree';page=0;selected=undefined;openGroups.set(`topic:${topic}`,true);render();saveUrl();
  });
  $('#previous').onclick=()=>{if(index>0)choose(ids[index-1]);};
  $('#next').onclick=()=>{if(index<ids.length-1)choose(ids[index+1]);};
  bindNavigation();
}
function bindNavigation(){
  document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>choose(b.dataset.concept));
  if($('#earlier-page'))$('#earlier-page').onclick=()=>{page--;render();$('#navigation').scrollTop=0;};
  if($('#later-page'))$('#later-page').onclick=()=>{page++;render();$('#navigation').scrollTop=0;};
}
function applyFilters(){
  if(!data)return;query=normalizeSearch($('#search').value.trim());topic=$('#topic').value;level=$('#level').value;reviewOrder=null;page=0;
  const ids=filtered();if(!ids.includes(selected))selected=ids[0];
  if(selected){const c=byId.get(selected);openGroups.set(`topic:${c.primaryTopic}`,true);openGroups.set(`branch:${c.subtopic}`,true);}
  render();saveUrl();
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
  if(!data)return;view=b.dataset.view;page=Math.max(0,Math.floor(sequence().indexOf(selected)/PAGE_SIZE));render();saveUrl();
});
$('#search').oninput=applyFilters;$('#topic').onchange=applyFilters;$('#level').onchange=applyFilters;
$('#clear').onclick=()=>{$('#search').value='';$('#topic').value='';$('#level').value='';applyFilters();};
$('#mix').onclick=()=>{
  if(!data)return;reviewOrder=filtered();
  for(let i=reviewOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[reviewOrder[i],reviewOrder[j]]=[reviewOrder[j],reviewOrder[i]];}
  if(reviewOrder.length>1&&reviewOrder[0]===selected)[reviewOrder[0],reviewOrder[1]]=[reviewOrder[1],reviewOrder[0]];
  choose(reviewOrder[0]);
};
fetch('concepts.json').then(r=>{if(!r.ok)throw new Error('Could not load concepts.');return r.json();}).then(result=>{
  data=result;byId=new Map(data.concepts.map(c=>[c.id,c]));topics=new Map(data.topics.map(t=>[t.id,t]));branches=new Map(data.subtopics.map(s=>[s.id,s]));
  for(const c of data.concepts)c.search=normalizeSearch([c.title,c.rule,...c.tags,...c.examples.map(e=>e.arabic),...c.sourceCards.map(s=>s.title),topics.get(c.primaryTopic).title,branches.get(c.subtopic).title].join(' '));
  $('#topic').innerHTML+=[...topics.values()].map(t=>`<option value="${esc(t.id)}">${esc(t.title)}</option>`).join('');
  $('#level').innerHTML+=Object.entries(data.difficultyScale).map(([n,title])=>`<option value="${n}">${n} · ${esc(title)}</option>`).join('');
  const requestedView=new URLSearchParams(location.search).get('view');if(['tree','path','review'].includes(requestedView))view=requestedView;
  let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
  selected=byId.has(hash)?hash:data.aliases[hash]||data.learningPath[0];
  const c=byId.get(selected);openGroups.set(`topic:${c.primaryTopic}`,true);openGroups.set(`branch:${c.subtopic}`,true);
  page=Math.floor(sequence().indexOf(selected)/PAGE_SIZE);
  $('#summary').textContent=`${data.statistics.sourceCards} original cards · ${data.concepts.length} concepts · ${data.topics.length} topics`;
  render();
}).catch(error=>{$('#summary').textContent=`${error.message} Please reload or open this page through a web server.`;});
