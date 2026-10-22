'use strict';
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let data, byId, selected, view = 'path';
const treatmentLabels = {retained:'Source rule retained',qualification:'Qualification kept separate',comparison:'Comparison across cards','merged-rule':'Shared rule combined','combined-sequence':'Related steps grouped'};
function select(id) {
  if (!byId.has(id)) return;
  selected = id;
  history.replaceState(null, '', `#${encodeURIComponent(id)}`);
  render();
}
function conceptButton(id, index) {
  const c = byId.get(id);
  return `<button class="concept-link" data-concept="${escapeHtml(id)}" aria-current="${id===selected}">${index===undefined?'':`${index+1}. `}${escapeHtml(c.title)}<small>Level ${c.difficulty} · ${escapeHtml(data.topics.find(t=>t.id===c.primaryTopic).title)}</small></button>`;
}
function render() {
  const c = byId.get(selected), index = data.learningPath.indexOf(selected);
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', button.dataset.view===view));
  $('#view-help').textContent = ({path:'Start with simple patterns, then build on them. Prerequisites come before the concepts that use them.',tree:'Browse by topic. Each concept has one main home; related topics and prerequisites connect the branches.',review:'Answer before revealing. Compare your response with the explanation, then revisit it after a gap. This pilot does not track mastery or schedule reviews.'})[view];
  if (view==='tree') {
    $('#navigation').innerHTML = data.topics.map(t=>`<details open><summary>${escapeHtml(t.title)}</summary><p class="muted">${escapeHtml(t.subtitle)}</p>${data.learningPath.filter(id=>byId.get(id).primaryTopic===t.id).map(id=>conceptButton(id)).join('')}</details>`).join('');
  } else {
    let lastLevel;
    $('#navigation').innerHTML = data.learningPath.map((id,i)=>{
      const level=byId.get(id).difficulty;
      const heading=level!==lastLevel?`<p class="level-label">Level ${level} · ${escapeHtml(data.difficultyScale[level])}</p>`:'';
      lastLevel=level; return heading+conceptButton(id,i);
    }).join('');
  }
  const review = `<section class="review-box"><span class="eyebrow">TRY FROM MEMORY</span><p>${escapeHtml(c.reviewPrompts[0].prompt)}</p><button class="action" id="reveal" aria-expanded="false" aria-controls="review-answer">Reveal answer</button><div class="answer" id="review-answer" hidden>${escapeHtml(c.reviewPrompts[0].answer)}</div></section>`;
  const lesson = `<div id="lesson" ${view==='review'?'hidden':''}><p class="rule">${escapeHtml(c.rule)}</p>${c.examples.map(e=>`<div class="example"><div class="arabic" lang="ar" dir="rtl">${escapeHtml(e.arabic)}</div><div class="translation">${escapeHtml(e.translation)}</div><small>Example from ${escapeHtml(e.sourceCardId)}</small></div>`).join('')}<p class="note">${escapeHtml(c.note)}</p></div>`;
  $('#detail').innerHTML = `<span class="eyebrow">CONCEPT ${index+1} / ${data.concepts.length} · LEVEL ${c.difficulty}</span><h2>${escapeHtml(c.title)}</h2><span class="chip">${escapeHtml(treatmentLabels[c.treatment])}</span>${view==='review'?review+lesson:lesson+review}<h3>Builds on</h3><div class="prereq">${c.prerequisites.length?c.prerequisites.map(id=>`<button data-concept="${escapeHtml(id)}">${escapeHtml(byId.get(id).title)} ↗</button>`).join(''):'<span class="muted">Start here: no earlier pilot concept required.</span>'}</div>${c.relatedTopics.length?`<p class="muted">Also connects to: ${c.relatedTopics.map(id=>escapeHtml(data.topics.find(t=>t.id===id).title)).join(' · ')}</p>`:''}<details id="sources" ${view==='review'?'hidden':''}><summary>${c.sourceCards.length} original card${c.sourceCards.length===1?'':'s'} · exact takeaways & links</summary>${c.sourceCards.map(s=>`<div class="source-item"><a href="../index.html?card=${encodeURIComponent(s.id)}">${escapeHtml(s.title)} ↗</a><p class="muted">${escapeHtml(s.book)} · Chapter ${escapeHtml(s.chapter)} · ${escapeHtml(s.source)}</p><blockquote>${escapeHtml(s.takeaway)}</blockquote><a href="${escapeHtml(s.cardUrl)}" target="_blank" rel="noopener">Published card link ↗</a></div>`).join('')}</details><div class="controls"><button id="previous" ${index===0?'disabled':''}>← Previous</button><button id="next" ${index===data.learningPath.length-1?'disabled':''}>Next concept →</button></div>`;
  document.querySelectorAll('[data-concept]').forEach(button=>button.onclick=()=>select(button.dataset.concept));
  $('#reveal').onclick=()=>{
    const answer=$('#review-answer'), revealed=answer.hidden;
    answer.hidden=!revealed;
    $('#reveal').setAttribute('aria-expanded',revealed);
    $('#reveal').textContent=revealed?'Hide answer':'Reveal answer';
    if(view==='review') {$('#lesson').hidden=!revealed;$('#sources').hidden=!revealed;}
  };
  $('#previous').onclick=()=>{if(index>0)select(data.learningPath[index-1]);};
  $('#next').onclick=()=>{if(index<data.learningPath.length-1)select(data.learningPath[index+1]);};
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;render();});
fetch('concepts.json').then(response=>{if(!response.ok)throw new Error('Could not load pilot data.');return response.json();}).then(result=>{
  data=result;byId=new Map(data.concepts.map(c=>[c.id,c]));
  let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
  selected=byId.has(hash)?hash:data.learningPath[0];
  const sources=new Set(data.concepts.flatMap(c=>c.sourceCards.map(s=>s.id)));
  $('#summary').textContent=`${data.concepts.length} concepts · ${sources.size} original cards · 3 connected topics`;
  render();
}).catch(error=>{$('#summary').textContent=`${error.message} Open this preview through a local web server.`;});
