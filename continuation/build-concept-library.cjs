const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {root,cards} = require('./content.cjs');
const {topics,subtopics,bySubtopic,classify,overrides} = require('./concept-taxonomy.cjs');
const source = new Map(cards.map(c=>[c.id,c]));
const sourceOrder = new Map(cards.map((c,i)=>[c.id,i]));
const pilot = JSON.parse(fs.readFileSync(path.join(root,'pilot','concepts.json'),'utf8'));
const concepts = structuredClone(pilot.concepts);
const pilotHomes = {
  'indefinite-noun':'definiteness','definite-with-al':'definiteness','noun-adjective-order':'description',
  'adjective-gender':'description','adjective-definiteness':'description','phrase-versus-statement':'description',
  'tanwin-not-english-a':'definiteness','proper-name-definite':'definiteness','idafah-order':'possession',
  'mudaf-no-al-tanwin':'possession','owner-majrur':'possession','adjective-case':'description',
  'attached-owners':'attached-pronouns','my-book':'attached-pronouns','idafah-definiteness':'definiteness',
  'describe-possessed-noun':'possession','definite-categories':'definiteness','idafah-after-preposition':'possession',
  'nonhuman-plural-agreement':'description'
};
const labels={1:'Book 1',2:'Book 2',3:'Book 3A',4:'Book 3B'};
const sourceEntry=c=>({id:c.id,book:labels[c.book||1],chapter:c.chapter,title:c.title,source:c.source,
  takeaway:c.takeaway,cardUrl:`https://farazshuja.github.io/madinah-arabic-course-web-app/?card=${encodeURIComponent(c.id)}`});
const example=c=>({sourceCardId:c.id,arabic:c.arabic,translation:c.translation,explanation:c.body});
for(const c of concepts){
  c.subtopic=pilotHomes[c.id]; c.primaryTopic=bySubtopic.get(c.subtopic).topic;
  c.examples=c.sourceCards.map(s=>example(source.get(s.id)));
  c.note=c.note.replace(/outside this pilot/g,'in later source cards').replace(/earlier pilot concept/g,'earlier concept');
  c.reviewPrompts[0].type='application';
  c.difficultyReason='Curated during the approved topic pilot; prerequisites may raise the final level.';
}
function mergeInto(id, sourceIds, rule, note) {
  const c=concepts.find(c=>c.id===id); assert.ok(c,id);
  for(const sourceId of sourceIds){const card=source.get(sourceId);assert.ok(card,sourceId);c.sourceCards.push(sourceEntry(card));c.examples.push(example(card));}
  c.rule=rule||c.rule;c.note=note;c.treatment='merged-rule';
}
mergeInto('adjective-case',['b2-c31-b','b3a-c1-a-dependent-naat'],null,
  'The same adjective-case rule appears in four cards. Examples for ordinary phrases and for choosing between an idafah’s two nouns are preserved.');
mergeInto('adjective-definiteness',['b2-c31-a'],
  'A describing adjective follows its noun and matches its definiteness. For an ordinary noun made definite with الـ, its describing adjective takes الـ too.',
  'The later review restates word order and definiteness together. Keep the adjective/predicate contrast separate.');
let covered=new Set(concepts.flatMap(c=>c.sourceCards.map(s=>s.id)));
for(const card of cards){
  if(covered.has(card.id))continue;
  const subtopic=classify(card);assert.ok(subtopic,`Unclassified: ${card.id}`);
  const home=bySubtopic.get(subtopic),book=card.book||1;
  const courseLevel=book===1?(Number(card.chapter)<=9?1:2):book===2?(card.chapter<=9?2:3):4;
  const difficulty=Math.max(home.level,courseLevel);
  concepts.push({id:card.id,primaryTopic:home.topic,subtopic,difficulty,
    difficultyReason:`Topic complexity and original course position (${labels[book]}, chapter ${card.chapter}); editorial estimate.`,
    title:card.title,rule:card.takeaway,prerequisites:[],relatedTopics:[],treatment:'retained',
    note:'Read this rule with the conditions and examples in its original explanation.',
    sourceCards:[sourceEntry(card)],examples:[example(card)],
    reviewPrompts:[{type:'explain-example',prompt:'Explain what this example illustrates. Identify the relevant word, pattern or ending, and state the rule.',
      arabic:card.arabic,answer:card.takeaway,translation:card.translation}]});
}
// Read the full source bodies before combining these repeated lessons. Later
// qualifications (ibn spelling, diptote conditions, etc.) remain separate.
const merges=[
  {into:'b1-c9-a2',from:['b1-c22-4'],rule:'In these فَعْلَان adjectives, the written ن is part of the word. The illustrated forms have no tanwin.',note:'The later chapter repeats the same illustrated adjective pattern. Its source and examples remain attached.'},
  {into:'b1-c4-n2',from:['b1-c22-1'],rule:'The feminine names illustrated here take a single dammah, not tanwin, in the nominative. Their gender need not be shown by ة.',note:'Combined introduction and review of the same examples. Detailed exceptions remain in the later diptote concepts.'},
  {into:'b1-c10-6',from:['b1-c22-2'],rule:'These masculine names end in ة but remain masculine; their illustrated nominative forms have no tanwin.',note:'Combined the introduction and its review. A name’s gender and ending class must both be learned.'},
  {into:'b2-c10-4',from:['b3a-c2-2'],rule:'With لَعَلَّ, a welcome possibility expresses hope; an unwelcome possibility expresses concern. Context decides the meaning.',note:'Both cards explain the same contrast. The introductory particle-government lesson remains separate.'},
  {into:'b2-c29-2',from:['b3b-c20-2'],rule:'Temporal لَمَّا links past events as “when.” It differs from negative لَمَّا (“not yet”), which governs a majzum mudari.',note:'Combined repeated explanations of the same temporal/negative distinction; kept both sets of examples.'},
  {into:'b1-c15-4',from:['b1-c12-v'],rule:'قَبْلَ (“before”) and بَعْدَ (“after”) link to a following noun as mudaf; that complement is majrur.',note:'Grouped the short “after” vocabulary note with its fuller before/after explanation. Fixed endings after an omitted complement are a separate refinement.',treatment:'combined-sequence'}
];
for(const merge of merges){
  mergeInto(merge.into,merge.from,merge.rule,merge.note);
  const target=concepts.find(c=>c.id===merge.into);if(merge.treatment)target.treatment=merge.treatment;
  for(const id of merge.from){const index=concepts.findIndex(c=>c.id===id);assert.ok(index>=0,id);concepts.splice(index,1);}
  target.reviewPrompts=[{type:'explain-example',prompt:'Explain what this example illustrates. Identify the relevant word, pattern or ending, and state the rule.',arabic:target.examples[0].arabic,answer:target.rule,translation:target.examples[0].translation}];
}
// Aliases preserve old source IDs and approved pilot links after consolidation.
const aliases={};for(const c of concepts)for(const s of c.sourceCards)if(!aliases[s.id])aliases[s.id]=c.id;
const resolve=id=>concepts.some(c=>c.id===id)?id:aliases[id];
const byId=new Map(concepts.map(c=>[c.id,c]));
const prompts={
  'sounds':'Read this aloud. What sound changes in connected speech, and why?',
  'writing':'Which spelling feature matters here? Explain when it is used.',
  'definiteness':'What identifies the noun as definite or indefinite here? Explain the relevant ending or construction.',
  'gender':'Explain the gender pattern shown here. What can and cannot be inferred from the ending?',
  'dual-nouns':'Explain how the dual or “both” is formed here. Identify any case or suffix changes.',
  'plurals':'Explain the plural pattern or ending shown here. What distinguishes it from the singular or other plural forms?',
  'diptotes':'Explain the ending restriction in these examples. State the scope of the rule.',
  'latent-endings':'Explain the noun’s grammatical role and what is visible or fixed in its ending.',
  'five-nouns':'Explain the form of the special noun here and the conditions that affect its ending.',
  'personal-pronouns':'Identify what each pronoun refers to and explain the distinction illustrated.',
  'attached-pronouns':'Identify the pronoun and what it refers to. Explain its grammatical job or form here.',
  'subject-pronouns':'Identify who performs the action. How is the subject expressed?',
  'demonstratives':'Explain what is being pointed out and how the demonstrative form or placement works.',
  'relatives':'Explain how the relative expression connects to the rest of the sentence.',
  'description':'Identify the describing word and its noun. Explain the agreement or word-order pattern.',
  'possession':'Identify the connected nouns or owner ending. Explain their order, relationship and relevant endings.',
  'comparison':'Explain the comparison expressed here and the construction used to form it.',
  'nominal':'Identify the topic and what is said about it. Explain the sentence pattern.',
  'verbal':'Identify the verb and subject. Explain the sentence structure or agreement illustrated.',
  'case':'Explain the grammatical roles here and how their case is shown.',
  'objects':'Identify what receives the action or judgement. Explain the object construction.',
  'adverbials':'Explain the time or place relationship, including the relevant construction or ending.',
  'past':'Identify who performs the past action. Explain the verb ending or distinction illustrated.',
  'present':'Identify the person and time reference. Explain the present-future form illustrated.',
  'commands':'Explain who is addressed and how the instruction is formed.',
  'moods':'Explain the verb mood and the particle or construction affecting its ending.',
  'passive':'Explain the passive construction and how the verb or sentence roles change.',
  'roots':'Identify the root or basic vowel pattern illustrated. Explain what the pattern tells you.',
  'weak':'Identify the weak or doubled root feature. Explain the change in these forms.',
  'masdar':'Identify the verbal noun and explain its pattern or function.',
  'participles':'Explain how the derived noun expresses a doer, receiver or intensified meaning.',
  'prepositions':'Identify the preposition and explain its meaning or effect on its complement.',
  'questions':'Explain how the question or reply is formed and what it asks or confirms.',
  'negation':'Explain what is being negated and how the negative construction affects meaning or form.',
  'inna':'Explain the particle’s meaning and its effect on the sentence.',
  'kana':'Explain how this verb changes or completes the sentence pattern.',
  'emphasis':'Explain what is emphasized or restricted and how that emphasis is formed.',
  'vocative':'Explain how the listener is addressed and the form used after the calling expression.',
  'conjunctions':'Explain how the connector joins, contrasts or changes the ideas.',
  'purpose':'Explain the reason, purpose or result relationship and how it is expressed.',
  'conditions':'Identify the condition and its answer. Explain their forms and any linking particle.',
  'noun-clauses':'Identify the clause acting as a noun and explain its role.',
  'exceptions':'Identify the exception construction and explain the case or interpretation illustrated.',
  'counting':'Explain the number and counted-noun pattern, including relevant gender and case rules.',
  'ordinals':'Explain the order or fraction pattern illustrated.',
  'quantity':'Identify what is being specified or measured and explain the construction.'
};
for(const c of concepts){
  const p=c.reviewPrompts[0];if(p.type==='explain-example')p.prompt=prompts[c.subtopic]||p.prompt;
  if(c.subtopic.startsWith('form-')||c.subtopic==='quadriliteral')p.prompt='Identify the verb-family pattern illustrated here. Explain the added letters, derived form or meaning being taught.';
}
byId.get('b2-c21-3').reviewPrompts=[{type:'recall',prompt:'Name the three Arabic parts of speech and give one example of each.',answer:'اِسْمٌ (ism), فِعْلٌ (fil), حَرْفٌ (harf). Examples: كِتَابٌ, كَتَبَ, and لَمْ respectively.'}];
const topicOfTags=card=>subtopics.filter(s=>s.tags.some(t=>card.tags.includes(t))).map(s=>s.topic);
for(const c of concepts){
  const existing=c.relatedTopics.filter(id=>topics.some(t=>t.id===id));
  const fromSource=c.sourceCards.flatMap(s=>topicOfTags(source.get(s.id)));
  c.relatedTopics=[...new Set([...existing,...fromSource])].filter(id=>id!==c.primaryTopic).slice(0,4);
  c.tags=[...new Set(c.sourceCards.flatMap(s=>Array.from(source.get(s.id).tags)))].sort();
  c.prerequisites=c.prerequisites.map(resolve); // curated pilot dependencies
}
// Explicit foundations rather than a fabricated dependency chain between all
// cards. These anchors are supporting knowledge, not an exhaustive syllabus.
const anchors={
  'word-classes':'b2-c21-3','sounds':'b1-c3-b','writing':'b1-c8-foot',
  'definiteness':'indefinite-noun','gender':'b1-c6-2a','dual-nouns':'b1-c18-1a','plurals':'b1-c13-a1',
  'diptotes':'b1-c4-n2','latent-endings':'b1-c8-2','five-nouns':'b1-c10-2a',
  'personal-pronouns':'b1-c4-2a','attached-pronouns':'attached-owners','subject-pronouns':'b2-c4-1b','demonstratives':'b1-c1-n1','relatives':'b1-c9-b2a',
  'description':'noun-adjective-order','possession':'idafah-order','comparison':'b2-c3-1a',
  'nominal':'b1-c1-n2','verbal':'b2-c5-1a','case':'b1-c4-1a','objects':'b1-c11-3b','adverbials':'b1-c5-2',
  'hal':'b3b-c31-1a','absolute-object':'b3b-c28-1a','reason-object':'b3b-c29-1','badal':'b2-c16-7','specification':'b3b-c20-3',
  'past':'b1-c4a-d','present':'b1-c11-3a','commands':'b2-c14-1a','moods':'b2-c17-1','passive':'b3a-c3-1a','transitivity':'b3b-c18-1a',
  'roots':'b2-c26-1a','weak':'b2-c26-1b','masdar':'b2-c11-4a','participles':'b3a-c4-1','derived-nouns':'b3a-c6-a','noun-patterns':'b2-c26-2',
  'prepositions':'b1-c4-1b','questions':'b1-c1-n4','negation':'b1-c10-9','inna':'b2-c1-1b','kana':'b2-c7-5a','emphasis':'b1-c12-4','vocative':'b1-c5-3',
  'conjunctions':'b1-c2-n2','purpose':'b2-c4-4','conditions':'b3a-c12-2','noun-clauses':'b3a-c10-1b','exceptions':'b3b-c32-1a',
  'counting':'b1-c19-one','ordinals':'b2-c3-5','quantity':'b3b-c30-1a','everyday':'b1-c6-4','exclamation':'b2-c9-3a','verb-nouns':'b2-c18-5','text-usage':'b2-c6-5'
};
for(const id of ['ii','iii','iv','v','vi','vii','viii','ix','x'])anchors[`form-${id}`]=({ii:'b3b-c16-2a',iii:'b3b-c19-1a',iv:'b3b-c17-1a',v:'b3b-c20-1a',vi:'b3b-c21-1a',vii:'b3b-c22-1a',viii:'b3b-c23-1a',ix:'b3b-c24-1a',x:'b3b-c25-1a'})[id];
anchors.quadriliteral='b3b-c26-1a';
// Extra prerequisites for the first concept of a branch. Specific refinements
// also link directly to the rule they qualify.
const foundations={
  'b2-c21-3':[], 'b1-c3-b':['definite-with-al'], 'b1-c8-foot':[],
  'b1-c18-1a':['indefinite-noun'],'b1-c13-a1':['noun-adjective-order'],
  'b1-c4-n2':['proper-name-definite'],'b1-c8-2':['b1-c4-1a'],'b1-c10-2a':['attached-owners'],
  'b2-c4-1b':['b1-c4a-d'],'b1-c9-b2a':['b1-c1-n2'],
  'b2-c3-1a':['noun-adjective-order'],'b2-c5-1a':['b1-c4a-d','b1-c4-1a'],
  'b1-c11-3b':['b1-c11-3a','b1-c4-1a'],'b1-c5-2':['owner-majrur'],
  'b3b-c31-1a':['b2-c5-1a','b1-c11-3b'],'b3b-c28-1a':['b2-c11-4a','b1-c11-3b'],
  'b3b-c29-1':['b2-c11-4a','b1-c11-3b'],'b2-c16-7':['b1-c4-1a'],
  'b3b-c20-3':['b1-c14-2a','b1-c4-1a'],'b1-c11-3a':['b1-c1-n2'],
  'b2-c14-1a':['b2-c10-1a'],'b2-c17-1':['b2-c10-1a'],
  'b3a-c3-1a':['b2-c5-1a','b1-c11-3b'],'b3b-c18-1a':['b2-c5-1a','b1-c11-3b'],
  'b2-c26-1a':['b1-c4a-d'],'b2-c26-1b':['b2-c26-1a','b2-c10-1a'],
  'b2-c11-4a':['b1-c4a-d'],'b3a-c4-1':['b2-c26-1a'],'b3a-c6-a':['b2-c26-1a'],
  'b2-c26-2':['indefinite-noun'],'b1-c4-1b':['b1-c4-1a'],
  'b1-c10-9':['b1-c1-n2'],'b2-c1-1b':['b1-c1-n2','b1-c4-1a'],
  'b2-c7-5a':['b1-c1-n2'],'b1-c12-4':['attached-owners'],
  'b1-c5-3':['proper-name-definite'],'b2-c4-4':['b2-c1-1b'],
  'b3a-c12-2':['b1-c4a-d'],'b3a-c10-1b':['b2-c11-4a','b2-c17-1'],
  'b3b-c32-1a':['b1-c4-1a'],'b1-c19-one':['noun-adjective-order'],
  'b2-c3-5':['b1-c19-one'],'b3b-c30-1a':['b1-c19-one','b1-c4-1a'],
  'b2-c9-3a':['b1-c1-n2'],'b2-c18-5':['b2-c14-1a'],'b2-c6-5':['b2-c1-1b'],
  'b3b-c17-8':['b2-c2-3'], 'b3b-c34-1k':['b1-c23-diptote','idafah-order','definite-with-al'],
  'b3a-c12-3':['b2-c25-4'],'b3b-c18-6':['b2-c15-5'],
  'b3b-c16-2a':['b2-c26-1a','b2-c10-1a'],'b3b-c19-1a':['b2-c26-1a','b2-c10-1a'],
  'b3b-c17-1a':['b2-c26-1a','b2-c10-1a'],'b3b-c20-1a':['b3b-c16-2a'],
  'b3b-c21-1a':['b3b-c19-1a'],'b3b-c22-1a':['b2-c26-1a','b2-c10-1a'],
  'b3b-c23-1a':['b2-c26-1a','b2-c10-1a'],'b3b-c24-1a':['b2-c26-1a'],
  'b3b-c25-1a':['b2-c26-1a','b2-c10-1a'],'b3b-c26-1a':['b2-c26-1a']
};
// Useful foundations appear early even though the reference names them later.
byId.get('b2-c21-3').difficulty=1;
byId.get('b2-c26-1a').difficulty=2;
for(const c of concepts){
  const anchor=resolve(anchors[c.subtopic]);assert.ok(anchor,`Missing anchor: ${c.subtopic}`);
  if(c.id!==anchor&&!pilotHomes[c.id])c.prerequisites.push(anchor);
  c.prerequisites.push(...(foundations[c.id]||[]).map(resolve));
  c.prerequisites=[...new Set(c.prerequisites)].filter(id=>id!==c.id);
  for(const id of c.prerequisites)assert.ok(byId.has(id),`${c.id}: unknown prerequisite ${id}`);
}
// Topological order, then level, branch and original course position.
const learningPath=[], pending=new Set(concepts.map(c=>c.id)),seen=new Set();
function lift(c,trail=new Set()){
  assert.ok(!trail.has(c.id),`Prerequisite cycle at ${c.id}`);
  const next=new Set([...trail,c.id]);
  for(const id of c.prerequisites)c.difficulty=Math.max(c.difficulty,lift(byId.get(id),next));
  return c.difficulty;
}
for(const c of concepts)lift(c);
const order=c=>Math.min(...c.sourceCards.map(s=>sourceOrder.get(s.id)));
while(pending.size){
  const ready=[...pending].map(id=>byId.get(id)).filter(c=>c.prerequisites.every(id=>seen.has(id)));
  assert.ok(ready.length,'Cyclic prerequisite graph');
  ready.sort((a,b)=>a.difficulty-b.difficulty || (a.id==='b2-c21-3'?-1:b.id==='b2-c21-3'?1:0) || order(a)-order(b) || bySubtopic.get(a.subtopic).rank-bySubtopic.get(b.subtopic).rank || a.id.localeCompare(b.id));
  const c=ready[0];learningPath.push(c.id);seen.add(c.id);pending.delete(c.id);
}
const merged=concepts.filter(c=>c.treatment==='merged-rule'||c.treatment==='combined-sequence');
const sourceIds=new Set(concepts.flatMap(c=>c.sourceCards.map(s=>s.id)));
assert.equal(sourceIds.size,cards.length,'Every original card must be represented');
assert.equal(byId.size,concepts.length,'Duplicate concept IDs');
for(const id of Object.keys(overrides))assert.ok(source.has(id),`Invalid taxonomy override ${id}`);
const position=new Map(learningPath.map((id,i)=>[id,i]));
for(const c of concepts){
  assert.equal(c.primaryTopic,bySubtopic.get(c.subtopic).topic);
  assert.ok(c.rule&&c.reviewPrompts.length&&c.sourceCards.length&&c.examples.length,c.id);
  assert.ok(c.difficulty>=1&&c.difficulty<=4,c.id);
  for(const dep of c.prerequisites)assert.ok(position.get(dep)<position.get(c.id));
  for(const s of c.sourceCards){assert.equal(s.takeaway,source.get(s.id).takeaway);assert.equal(new URL(s.cardUrl).searchParams.get('card'),s.id);}
  for(const e of c.examples){assert.equal(e.arabic,source.get(e.sourceCardId).arabic);assert.equal(e.translation,source.get(e.sourceCardId).translation);}
}
const data={schemaVersion:2,title:'Arabic concept paths',status:'complete-coverage',
  scope:'Every existing course card is represented. Grouped rules retain source examples, qualifications and direct links.',
  difficultyScale:{1:'First patterns',2:'Build & distinguish',3:'Apply & connect',4:'Advanced patterns & refinements'},
  orderingNote:'Editorial levels and explicit supporting prerequisites; original course order breaks ties within a branch. These are learning suggestions, not measured difficulty or a claim of exhaustive dependencies.',
  statistics:{sourceCards:cards.length,concepts:concepts.length,topics:topics.length,subtopics:subtopics.length,combinedConcepts:merged.length},
  topics,subtopics:subtopics.map(({tags,rank,...rest})=>rest),aliases,learningPath,
  concepts:learningPath.map(id=>byId.get(id))};
fs.mkdirSync(path.join(root,'concept-paths'),{recursive:true});
fs.writeFileSync(path.join(root,'concept-paths','concepts.json'),JSON.stringify(data,null,2)+'\n');
const audit={statistics:data.statistics,coverageByBook:Object.entries(labels).map(([book,label])=>({book:label,cards:cards.filter(c=>(c.book||1)===Number(book)).length})),
  topics:topics.map(t=>({id:t.id,title:t.title,concepts:concepts.filter(c=>c.primaryTopic===t.id).length,
    branches:subtopics.filter(s=>s.topic===t.id).map(s=>({id:s.id,title:s.title,concepts:concepts.filter(c=>c.subtopic===s.id).length}))})),
  combinations:merged.map(c=>({id:c.id,treatment:c.treatment,sourceIds:c.sourceCards.map(s=>s.id),reason:c.note})),
  qualificationsKeptSeparate:[['b2-c2-3','b3b-c17-8'],['b2-c25-4','b3a-c12-3'],['b2-c15-5','b3b-c18-6'],['b1-c23-diptote','b3b-c34-1k']]};
fs.writeFileSync(path.join(root,'concept-paths','coverage.json'),JSON.stringify(audit,null,2)+'\n');
console.log(`PASS: ${cards.length} sources → ${concepts.length} concepts; ${topics.length} topics / ${subtopics.length} branches; ${merged.length} combined concepts. Exact sources/examples, links, unique IDs and prerequisite order validated.`);
