'use strict';
const $=id=>document.getElementById(id),st=$('stage');
const motionBase=new URL('.',document.currentScript.src);
const conceptUrl=c=>new URL(c.url,motionBase).href;
let library,D=[],groupIndex=0,i=0,exampleIndex=0,T=[],generation=0;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cancel(){T.forEach(clearTimeout);T=[];generation++;}
function at(f,ms){const run=generation;T.push(setTimeout(()=>{if(run===generation)f();},reduced.matches?0:ms));}
function hl(s,h){return h&&s.includes(h)?esc(s.slice(0,s.indexOf(h)))+'<b class="h">'+esc(h)+'</b>'+esc(s.slice(s.indexOf(h)+h.length)):esc(s);}
function contrast(before,after){
 // Compare graphemes so a vowel stays with its Arabic letter when highlighting changes.
 const segmenter=new Intl.Segmenter('ar',{granularity:'grapheme'});
 const a=Array.from(segmenter.segment(before),s=>s.segment),b=Array.from(segmenter.segment(after),s=>s.segment);
 const grid=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
 for(let x=a.length-1;x>=0;x--)for(let y=b.length-1;y>=0;y--)grid[x][y]=a[x]===b[y]?1+grid[x+1][y+1]:Math.max(grid[x+1][y],grid[x][y+1]);
 const unchanged=new Set();let x=0,y=0;
 while(x<a.length&&y<b.length){if(a[x]===b[y]){unchanged.add(y);x++;y++;}else if(grid[x+1][y]>=grid[x][y+1])x++;else y++;}
 let result='',marked=false;
 b.forEach((part,n)=>{const changed=!unchanged.has(n)&&part.trim()!=='';if(changed!==marked){result+=changed?'<b class="h">':'</b>';marked=changed;}result+=esc(part);});
 return result+(marked?'</b>':'');
}
function mk(h,c,parent=st){const e=document.createElement('div');e.className=c;e.innerHTML=h;parent.appendChild(e);return e;}
function frames(c){
 return c.examples.flatMap((e,sourceIndex)=>{
  const lines=e.arabic.split('\n'),translations=e.translation.split('\n');
  // Split only when source lines have corresponding translations. Otherwise retain the whole example.
  return lines.length>1&&lines.length===translations.length?lines.map((arabic,n)=>({...e,arabic,translation:translations[n],sourceIndex})): [{...e,sourceIndex}];
 });
}
function panelCount(c){return c.t==='e'?frames(c).length:c.t==='p'&&c.rows.length>3?Math.ceil(c.rows.length/2):1;}
function animateExample(c){
 const frame=frames(c)[exampleIndex];
 const text=mk('','example-text ar'),words=frame.arabic.split(/(\s+)/u);
 text.lang='ar';text.dir='rtl';
 const marks=new Set(c.marks||[]);let count=0;
 for(const word of words){
  if(/^\s+$/u.test(word)){text.appendChild(document.createTextNode(word));continue;}
  const token=document.createElement('span');token.className='token hid';token.textContent=word;text.appendChild(token);
  at(()=>token.classList.add('on'),200+count*240);
  if([...marks].some(mark=>word.includes(mark)))at(()=>token.classList.add('focus-word'),1000+count*240);
  count++;
 }
 const translation=mk(esc(frame.translation),'note translation hid');translation.dir='auto';
 at(()=>translation.classList.add('on'),600+count*240);$('explanation').textContent=frame.explanation;
 return Math.max(4200,1600+count*240+frame.translation.length*24);
}
function play(){
 cancel();st.replaceChildren();if(!D.length)return;
 const c=D[i];let end=1500;
 if(c.t==='c'){
  const g=mk('','cols');c.cols.forEach((k,n)=>{
   const col=mk('<h3 class="ar" lang="ar">'+esc(k[0])+'</h3><p>'+esc(k[1])+'</p>','col hid',g);
   at(()=>col.classList.add('on'),300+n*500);
   k[2].forEach((w,j)=>{const ch=document.createElement('span');ch.className='chip ar hid';ch.lang='ar';ch.textContent=w;col.appendChild(ch);at(()=>ch.classList.add('on'),1200+n*400+j*260);});
  });end=4200;
 }
 if(c.t==='p'){
  const rows=c.rows.length>3?c.rows.slice(exampleIndex*2,exampleIndex*2+2):c.rows;
  rows.forEach((r,n)=>{
   const target=groupIndex===0?hl(r[1],r[3]):contrast(r[0],r[1]);
   const row=mk('<div class="l ar hid" lang="ar">'+esc(r[0])+'</div><div class="arr" aria-hidden="true"></div><div class="r ar hid" lang="ar">'+target+'</div><div class="tag hid">'+esc(r[2])+'</div>','row');
   const q=s=>row.querySelector(s),t0=300+n*2200;
   at(()=>q('.l').classList.add('on'),t0);at(()=>q('.arr').classList.add('on'),t0+700);at(()=>q('.r').classList.add('on'),t0+1200);at(()=>q('.tag').classList.add('on'),t0+1700);
  });
  end=800+rows.length*2200;const nt=mk(esc(c.note||''),'note hid');at(()=>nt.classList.add('on'),end-600);
 }
 if(c.t==='s'){
  const e=mk(hl(c.w,c.mark),'word ar hid');e.lang='ar';at(()=>e.classList.add('on'),200);
  const sp=mk('','spoken');
  Array.from(c.sp).forEach((_,n)=>at(()=>{sp.textContent=Array.from(c.sp).slice(0,n+1).join('');},1800+n*70));
  const nt=mk(esc(c.note),'note hid');at(()=>nt.classList.add('on'),3400);end=Math.max(4600,2000+c.sp.length*70);
 }
 if(c.t==='e')end=animateExample(c);
 const run=generation;T.push(setTimeout(()=>{
  if(run!==generation||!$('auto').checked||document.hidden)return;
  if(exampleIndex<panelCount(c)-1){exampleIndex++;syncExample();play();}
  else if(i<D.length-1){i++;show();}
 },end+2500));
}
function dots(){
 const groups=new Map();D.forEach((c,n)=>{if(!groups.has(c.sub))groups.set(c.sub,[]);groups.get(c.sub).push(n);});$('dots').replaceChildren();
 for(const [s,indices] of groups){
  const w=document.createElement('div');w.className='grp';const label=document.createElement('small');label.textContent=s;w.appendChild(label);
  for(const n of indices){const b=document.createElement('button');b.className='dot'+(n===i?' cur':n<i?' done':'');b.title=D[n].title;b.setAttribute('aria-label',D[n].title);b.setAttribute('aria-current',n===i?'step':'false');b.onclick=()=>{i=n;show();};w.appendChild(b);}
  $('dots').appendChild(w);
 }
 const active=$('dots').querySelector('[aria-current="step"]'),bounds=$('dots').getBoundingClientRect(),current=active.getBoundingClientRect();
 if(current.bottom>bounds.bottom)$('dots').scrollTop+=current.bottom-bounds.bottom+5;
 else if(current.top<bounds.top)$('dots').scrollTop-=bounds.top-current.top+5;
}
function syncExample(){
 const c=D[i],count=panelCount(c);$('example-picker').hidden=count<2;
 if(count>1){
  $('example').innerHTML=Array.from({length:count},(_,n)=>`<option value="${n}">${n+1} of ${count}</option>`).join('');$('example').value=String(exampleIndex);
 }
}
function show(){
 const c=D[i];exampleIndex=0;$('ttl').textContent=c.title;$('rule').textContent=c.rule;
 $('meta').innerHTML=`${i+1} / ${D.length} · level ${c.lvl} · <a href="${esc(conceptUrl(c))}">${esc(c.src)}</a>`;
 $('prev').disabled=i===0;$('next').disabled=i===D.length-1;$('rep').disabled=false;
 $('context').hidden=!c.examples.length;$('context').open=false;$('explanation').textContent=c.examples[0].explanation;$('concept-link').href=conceptUrl(c);
 syncExample();dots();play();
 const url=new URL(location.href);url.searchParams.set('group',library.groups[groupIndex].id);url.hash=c.id;history.replaceState(null,'',url);
}
function chooseGroup(n,conceptId){
 cancel();groupIndex=n;const group=library.groups[n];D=group.concepts;i=Math.max(0,D.findIndex(c=>c.id===conceptId));
 $('group').value=group.id;$('group-title').textContent=group.title;document.title=group.title+' · Madinah Arabic';
 $('group-summary').textContent=`Group ${n+1} of ${library.groups.length} · ${D.length} concepts in learning order`;
 $('prev-group').disabled=n===0;$('next-group').disabled=n===library.groups.length-1;show();
}
function readLocation(){
 const url=new URL(location.href);let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{id='';}
 let n=library.groups.findIndex(g=>g.concepts.some(c=>c.id===id));
 if(n<0)n=Math.max(0,library.groups.findIndex(g=>g.id===url.searchParams.get('group')));
 chooseGroup(n,id);
}
$('prev').onclick=()=>{if(i>0){i--;show();}};$('next').onclick=()=>{if(i<D.length-1){i++;show();}};$('rep').onclick=play;
$('example').onchange=()=>{exampleIndex=Number($('example').value);play();};
$('group').onchange=()=>chooseGroup(library.groups.findIndex(g=>g.id===$('group').value));
$('prev-group').onclick=()=>{if(groupIndex>0)chooseGroup(groupIndex-1);};$('next-group').onclick=()=>{if(groupIndex<library.groups.length-1)chooseGroup(groupIndex+1);};
$('auto').onchange=play;
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();else if(D.length)play();});
addEventListener('hashchange',()=>{if(library)readLocation();});
addEventListener('keydown',e=>{if(!D.length||e.target.matches('input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'&&i<D.length-1){e.preventDefault();i++;show();}if(e.key==='ArrowLeft'&&i>0){e.preventDefault();i--;show();}});
fetch(new URL('lessons.json',motionBase)).then(r=>{if(!r.ok)throw Error('Could not load the visual lessons.');return r.json();}).then(data=>{
 library=data;$('group').innerHTML=data.groups.map(g=>`<option value="${esc(g.id)}">${g.number}. ${esc(g.title)} (${g.concepts.length})</option>`).join('');$('group').disabled=false;readLocation();
}).catch(e=>{$('group-summary').textContent=e.message+' Please reload through the local web server.';});
