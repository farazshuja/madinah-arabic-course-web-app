'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const library=JSON.parse(fs.readFileSync(path.join(root,'concept-paths/concepts.json'),'utf8'));
const foundations=JSON.parse(fs.readFileSync(path.join(root,'concept-paths/motion/foundations.json'),'utf8'));
const curated=new Map(foundations.map(c=>[c.id,c]));
const byId=new Map(library.concepts.map(c=>[c.id,c]));
const branches=new Map(library.subtopics.map(s=>[s.id,s.title]));
function highlights(c){
 // Highlight only Arabic that actually occurs in the rule or title. Never infer a grammatical role.
 return [...new Set((c.rule+' '+c.title).match(/[\u0621-\u064A\u064B-\u065F\u0670\u0671]+/gu)||[])]
  .filter(s=>s.length>1).sort((a,b)=>b.length-a.length);
}
const groups=library.topics.map((topic,index)=>({
 ...topic,number:index+1,concepts:library.learningPath.map(id=>byId.get(id)).filter(c=>c.primaryTopic===topic.id).map(c=>{
  const base={id:c.id,sub:branches.get(c.subtopic),lvl:c.difficulty,title:c.title,rule:c.rule,
   url:`../#${encodeURIComponent(c.id)}`,src:c.sourceCards.length===1?`${c.sourceCards[0].book} · ch. ${c.sourceCards[0].chapter}`:`${c.sourceCards.length} source cards`,
   examples:c.examples.map(e=>({arabic:e.arabic,translation:e.translation,explanation:e.explanation})),marks:highlights(c)};
  if(curated.has(c.id))return {...base,...curated.get(c.id),url:base.url};
  // Only explicit source arrows become transformations. Other examples remain examples.
  const e=c.examples[0],lines=e.arabic.split('\n').filter(s=>s.trim());
  const paired=lines.map(line=>line.split(/\s*[←→]\s*/u));
  const translations=e.translation.split('\n');
  if(c.examples.length===1&&paired.every(p=>p.length===2&&p.every(s=>s.trim()))){
   return {...base,t:'p',rows:paired.map((p,n)=>[p[0],p[1],translations.length===paired.length?translations[n]:'','']),note:translations.length===paired.length?'':e.translation};
  }
  return {...base,t:'e'};
 })
}));
const result={schemaVersion:1,totalConcepts:library.concepts.length,groups};
fs.writeFileSync(path.join(root,'concept-paths/motion/lessons.json'),JSON.stringify(result,null,2)+'\n');
console.log(`Motion library: ${groups.length} groups, ${groups.reduce((n,g)=>n+g.concepts.length,0)} concepts.`);
