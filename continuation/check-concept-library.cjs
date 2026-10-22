// Independent regression checks against original modules, not generated counts.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {root,cards}=require('./content.cjs');
const data=JSON.parse(fs.readFileSync(path.join(root,'concept-paths/concepts.json'),'utf8'));
const flat=JSON.parse(fs.readFileSync(path.join(root,'key-takeaways.json'),'utf8'));
const byId=new Map(data.concepts.map(c=>[c.id,c]));
const originals=new Map(cards.map(c=>[c.id,c]));
const topicIds=new Set(data.topics.map(t=>t.id));
const branches=new Map(data.subtopics.map(s=>[s.id,s]));
assert.equal(new Set(data.learningPath).size,byId.size);
assert.equal(data.learningPath.length,data.concepts.length);
assert.deepEqual(new Set(flat.map(c=>c.id)),new Set(originals.keys()));
const covered=new Set();let previousLevel=0;
const seen=new Set();
for(const id of data.learningPath){
  const c=byId.get(id);assert.ok(c,id);
  assert.ok(topicIds.has(c.primaryTopic));assert.equal(branches.get(c.subtopic).topic,c.primaryTopic);
  assert.ok(c.difficulty>=previousLevel,'Levels must not go backwards');previousLevel=c.difficulty;
  for(const dep of c.prerequisites)assert.ok(seen.has(dep),`${id} before ${dep}`);
  seen.add(id);
  assert.ok(c.rule.trim()&&c.title.trim());
  assert.ok(c.reviewPrompts.length&&c.reviewPrompts.every(p=>p.prompt.trim()&&p.answer.trim()));
  for(const related of c.relatedTopics)assert.ok(topicIds.has(related));
  for(const s of c.sourceCards){
    const original=originals.get(s.id);assert.ok(original,s.id);covered.add(s.id);
    assert.equal(s.takeaway,original.takeaway);assert.equal(s.title,original.title);
    assert.equal(new URL(s.cardUrl).searchParams.get('card'),s.id);
    assert.equal(flat.find(f=>f.id===s.id).takeaway,s.takeaway);
    const e=c.examples.find(e=>e.sourceCardId===s.id);assert.ok(e,`${id}: no example for ${s.id}`);
    assert.equal(e.arabic,original.arabic);assert.equal(e.translation,original.translation);assert.equal(e.explanation,original.body);
  }
}
assert.deepEqual(covered,new Set(originals.keys()));
for(const card of cards){
  const target=byId.get(data.aliases[card.id]);assert.ok(target,`No source alias for ${card.id}`);
  assert.ok(target.sourceCards.some(s=>s.id===card.id));
}
for(const s of data.subtopics)assert.ok(data.concepts.some(c=>c.subtopic===s.id),`Empty branch ${s.id}`);
// Important distinctions must survive consolidation.
for(const [a,b] of [['b2-c2-3','b3b-c17-8'],['b2-c25-4','b3a-c12-3'],['b2-c15-5','b3b-c18-6'],['b1-c23-diptote','b3b-c34-1k']]){
  assert.notEqual(data.aliases[a],data.aliases[b]);
}
assert.equal(data.aliases['b1-c9-a1c'],'adjective-case');
assert.equal(data.aliases['b2-c31-b'],'adjective-case');
assert.equal(data.aliases['b1-c12-v'],data.aliases['b1-c15-4']);
assert.equal(data.statistics.sourceCards,cards.length);assert.equal(data.statistics.concepts,byId.size);
console.log(`PASS: ${cards.length}/${cards.length} original cards covered; ${byId.size} concepts; all exact text, aliases, source links, nonempty branches, progressive levels and prerequisites; distinct qualifications preserved.`);
