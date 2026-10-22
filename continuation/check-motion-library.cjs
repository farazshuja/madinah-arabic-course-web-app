'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'concept-paths/concepts.json'),'utf8'));
const motion=JSON.parse(fs.readFileSync(path.join(root,'concept-paths/motion/lessons.json'),'utf8'));
const originals=new Map(source.concepts.map(c=>[c.id,c]));
const seen=new Set();let examples=0,pairs=0;
assert.equal(motion.groups.length,source.topics.length);
assert.equal(motion.totalConcepts,source.concepts.length);
motion.groups.forEach((g,n)=>{
 assert.equal(g.id,source.topics[n].id);assert.equal(g.title,source.topics[n].title);
 assert.deepEqual(g.concepts.map(c=>c.id),source.learningPath.filter(id=>originals.get(id).primaryTopic===g.id));
 for(const c of g.concepts){
  assert(!seen.has(c.id),`Duplicate ${c.id}`);seen.add(c.id);
  const original=originals.get(c.id);
  assert.equal(c.title,original.title);assert.equal(c.rule,original.rule);assert.equal(c.lvl,original.difficulty);
  assert.equal(c.examples.length,original.examples.length);
  c.examples.forEach((e,j)=>{for(const key of ['arabic','translation','explanation'])assert.equal(e[key],original.examples[j][key],`${c.id}: ${key}`);examples++;});
  assert.equal(c.url,`../#${encodeURIComponent(c.id)}`);
  assert(['c','s','p','e'].includes(c.t));
  if(c.t==='p'){
   assert(c.rows.length>0);c.rows.forEach(r=>{assert(r[0]&&r[1]);pairs++;});
   if(g.id!=='foundations'){
    const lines=original.examples[0].arabic.split('\n').filter(s=>s.trim());
    assert.equal(lines.length,c.rows.length);
    lines.forEach((line,j)=>assert.deepEqual(line.split(/\s*[←→]\s*/u),c.rows[j].slice(0,2)));
   }
  }
  if(c.t==='s')assert(c.w&&c.sp&&c.note);
  if(c.t==='c')assert(c.cols.every(col=>col[0]&&col[2].length));
 }
});
assert.equal(seen.size,originals.size);
console.log(`PASS: ${seen.size} concepts in ${motion.groups.length} groups; ${examples} exact source examples; ${pairs} transformation rows; unique IDs, order, rules and source links.`);
