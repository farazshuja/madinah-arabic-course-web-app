// Curated concept definitions. Original source cards are preserved verbatim below.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const modules = [...fs.readFileSync(path.join(root, 'reader.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(name => name !== 'app.js' && name !== 'site-nav.js');
const ctx = vm.createContext({});
vm.runInContext(modules.map(name => fs.readFileSync(path.join(root, name), 'utf8')).join('\n') + '\nthis.cards=concepts;', ctx);
const source = new Map(ctx.cards.map(c => [c.id, c]));
const concepts = [];
function add(id, primaryTopic, difficulty, title, rule, prerequisites, sourceIds, prompt, answer, note, treatment = 'retained') {
  concepts.push({id, primaryTopic, difficulty, title, rule, prerequisites: prerequisites.split(' ').filter(Boolean),
    relatedTopics: [], treatment, note,
    sourceCards: sourceIds.split(' ').map(id => {
      const c = source.get(id); assert.ok(c, `Unknown source: ${id}`);
      return {id, book: ({1:'Book 1',2:'Book 2',3:'Book 3A',4:'Book 3B'})[c.book || 1], chapter:c.chapter,
        title:c.title, source:c.source, takeaway:c.takeaway,
        cardUrl:`https://farazshuja.github.io/madinah-arabic-course-web-app/?card=${encodeURIComponent(id)}`};
    }),
    examples: sourceIds.split(' ').map(id => {const c=source.get(id); return {sourceCardId:id, arabic:c.arabic, translation:c.translation};}),
    reviewPrompts: [{prompt, answer}]});
}
add('indefinite-noun','definiteness',1,'Recognize an indefinite noun',
  'For ordinary nouns such as كِتَابٌ, tanwin accompanies an indefinite meaning: “a book.”',
  '', 'b1-c1-n3', 'What does كِتَابٌ mean in this example?', 'A book.',
  'An introductory pattern, not a definition of every word with tanwin.');
add('definite-with-al','definiteness',1,'Make a noun definite with الـ',
  'Add الـ and remove tanwin: بَيْتٌ becomes الْبَيْتُ.',
  'indefinite-noun','b1-c3-a','Change بَيْتٌ (“a house”) to “the house.”','الْبَيْتُ. Add الـ and replace tanwin with the appropriate single case vowel.',
  'The example is nominative; الـ does not determine the noun’s case.');
add('noun-adjective-order','description',1,'Put the adjective after its noun',
  'In a describing phrase, place the noun before its adjective: بَيْتٌ جَدِيدٌ, “a new house.”',
  'indefinite-noun','b1-c9-a1','Say “a new house” using بَيْتٌ and جَدِيدٌ.','بَيْتٌ جَدِيدٌ.',
  'This is a phrase; a predicate makes a statement.');
add('adjective-gender','description',2,'Match the noun’s grammatical gender',
  'A describing adjective agrees with its noun in grammatical gender, even when the noun has no ة.',
  'noun-adjective-order','b1-c9-a1a','Choose: بِنْتٌ صَغِيرٌ or بِنْتٌ صَغِيرَةٌ?','بِنْتٌ صَغِيرَةٌ. بِنْتٌ is feminine although it has no ة.',
  'Assumes basic recognition of masculine and feminine nouns.');
add('adjective-definiteness','description',2,'Match definiteness in a describing phrase',
  'For an ordinary noun made definite with الـ, its describing adjective takes الـ too.',
  'definite-with-al noun-adjective-order','b1-c9-a1b','Say “the new teacher.”','الْمُدَرِّسُ الْجَدِيدُ.',
  'Nouns can also be definite without الـ; possessed nouns appear later in the path.');
add('phrase-versus-statement','description',2,'Distinguish a description from a statement',
  'الْمُدَرِّسُ الْجَدِيدُ means “the new teacher”; الْمُدَرِّسُ جَدِيدٌ means “the teacher is new.”',
  'adjective-definiteness','b1-c9-a1b b1-c3-e','Which is a statement: الْمُدَرِّسُ الْجَدِيدُ or الْمُدَرِّسُ جَدِيدٌ?','الْمُدَرِّسُ جَدِيدٌ: “The teacher is new.” The indefinite word is the predicate here.',
  'A comparison assembled from two cards, not a claim that the cards are duplicates. These examples do not make every predicate indefinite.','comparison');
add('tanwin-not-english-a','definiteness',2,'Do not translate every tanwin as “a”',
  'Tanwin is an ending, not an English word: مَفْتُوحٌ in this predicate means “open,” not “a open.”',
  'indefinite-noun phrase-versus-statement','b1-c3-e','Translate الْبَابُ مَفْتُوحٌ.','The door is open.',
  'Retained as a qualification of the introductory tanwin pattern.','qualification');
add('proper-name-definite','definiteness',2,'A name can be definite and have tanwin',
  'A proper name such as حَامِدٌ identifies a person and is definite even though it has tanwin.',
  'tanwin-not-english-a','b1-c4-n1','Does حَامِدٌ mean “a Hamid” because it has tanwin?','No. It is the name Hamid; a proper name is definite.',
  'Separate from predicate translation: this addresses definiteness itself.','qualification');
add('idafah-order','possession',1,'Put the thing before its owner',
  'In an ordinary possessive idafah, put the thing first and the owner second: كِتَابُ بِلَالٍ.',
  'indefinite-noun','b1-c5-1','Say “Bilal’s book” using كِتَاب and بِلَال.','كِتَابُ بِلَالٍ: thing first, owner second.',
  'Mudaf = first noun; mudaf ilayhi = complement. Idafah can express relationships beyond ownership.');
add('mudaf-no-al-tanwin','possession',2,'Leave الـ and tanwin off the first noun',
  'In the ordinary possessive idafah taught here, the first noun has neither الـ nor tanwin.',
  'definite-with-al idafah-order','b1-c5-1a','Correct كِتَابٌ بِلَالٍ to mean “Bilal’s book.”','كِتَابُ بِلَالٍ. Remove tanwin from the first noun.',
  'Missing tanwin alone does not prove that the phrase is definite.');
add('owner-majrur','possession',2,'Give the complement its majrur role',
  'The second part of an idafah is majrur. Ordinary declinable nouns show kasrah, with or without tanwin.',
  'idafah-order','b1-c5-1b','Why is بِلَالٍ majrur in كِتَابُ بِلَالٍ?','It is the mudaf ilayhi, the second part of the idafah.',
  'Case is a grammatical role; not every word shows it with kasrah.');
add('adjective-case','description',3,'Match the adjective’s case to its noun',
  'A describing adjective takes the case of the noun it describes. In longer phrases, use this to identify which noun is described.',
  'adjective-definiteness owner-majrur','b1-c9-a1c b1-c14-6b','In بَيْتُ الْإِمَامِ الْجَدِيدِ, is the house or the imam new?','The imam. الْجَدِيدِ agrees with majrur الْإِمَامِ. With الْجَدِيدُ, the house is new.',
  'One shared case-agreement rule. The later card is retained as an advanced application, with its own example. Basic preposition knowledge helps with the first example.','merged-rule');
add('attached-owners','possession',2,'Attach “your,” “his,” and “her”',
  'Attached pronouns can fill the owner’s place: كِتَابُكَ, كِتَابُهُ, كِتَابُهَا. The first noun has no الـ or tanwin.',
  'mudaf-no-al-tanwin owner-majrur','b1-c10-1a','How do you say “her book”?','كِتَابُهَا.',
  'ـكَ addresses one male person; ـهُ is “his” and ـهَا is “her.”');
add('my-book','possession',2,'Use the long ī ending for “my”',
  'كِتَابِي means “my book.” Read a long final ī rather than the u heard before some other owner endings.',
  'attached-owners','b1-c10-1b','How do you say “my book”?','كِتَابِي, with a long final ī.',
  'Kept separately because this form adds a pronunciation distinction.');
add('idafah-definiteness','definiteness',3,'Check what the idafah is linked to',
  'In these ordinary idafahs, a definite complement makes the phrase definite; an indefinite complement leaves it indefinite.',
  'proper-name-definite mudaf-no-al-tanwin attached-owners','b3a-c8-1b','Compare كِتَابُ الْمُدَرِّسِ and كِتَابُ طَالِبٍ. Which is definite?','كِتَابُ الْمُدَرِّسِ is definite (“the teacher’s book”). كِتَابُ طَالِبٍ is indefinite (“a student’s book”). Both first nouns lack tanwin.',
  'A later refinement, not a duplicate of the introductory possession cards.','qualification');
add('describe-possessed-noun','possession',3,'Finish the idafah before describing the first noun',
  'An adjective describing the first noun follows the complete idafah. In the definite examples here, that adjective is definite.',
  'idafah-definiteness adjective-case','b1-c14-6a','Say “his new house.”','بَيْتُهُ الْجَدِيدُ.',
  'Use adjective-case to distinguish description of the thing from description of its owner.');
add('definite-categories','definiteness',3,'Recognize several ways of being definite',
  'Personal pronouns, proper names, demonstratives, relative pronouns, and nouns with الـ are definite categories in this source.',
  'proper-name-definite idafah-definiteness','b3a-c8-1a','Must every definite word begin with الـ? Give a counterexample.','No. For example, حَامِدٌ is a definite proper name; أَنَا is a definite personal pronoun.',
  'An overview of the categories listed on this card, not an exhaustive account of every construction. Relative pronouns can be explored through the source card.');
add('idafah-after-preposition','possession',3,'Track each noun’s reason for its ending',
  'In عَلَى مَكْتَبِ الْمُدَرِّسِ, the first noun is majrur after عَلَى; the second is majrur as the idafah complement.',
  'mudaf-no-al-tanwin owner-majrur','b1-c5-1d','Why do both nouns have kasrah in عَلَى مَكْتَبِ الْمُدَرِّسِ?','مَكْتَبِ follows عَلَى; الْمُدَرِّسِ is the mudaf ilayhi. The first noun’s own case can change.',
  'Assumes recognition of عَلَى as a preposition.');
add('nonhuman-plural-agreement','description',3,'Extend agreement to non-human plurals',
  'In the basic rule taught here, non-human plurals take feminine singular agreement: كُتُبٌ جَدِيدَةٌ.',
  'adjective-gender adjective-definiteness','b1-c16-1a b1-c16-1b','Choose: كُتُبٌ جَدِيدٌ, كُتُبٌ جَدِيدَةٌ, or كُتُبٌ جُدُدٌ for the basic rule here.','كُتُبٌ جَدِيدَةٌ. كُتُبٌ is a non-human plural; its adjective is feminine singular.',
  'Two complementary steps—recognize the class, then apply its agreement. Assumes basic singular/plural recognition; exceptions remain outside this pilot.','combined-sequence');

const byId = new Map(concepts.map(c => [c.id, c]));
byId.get('adjective-case').relatedTopics = ['possession'];
byId.get('idafah-definiteness').relatedTopics = ['possession'];
byId.get('describe-possessed-noun').relatedTopics = ['description','definiteness'];
const learningPath = ['indefinite-noun','definite-with-al','noun-adjective-order','idafah-order',
  'adjective-gender','adjective-definiteness','phrase-versus-statement','tanwin-not-english-a','proper-name-definite',
  'mudaf-no-al-tanwin','owner-majrur','attached-owners','my-book','adjective-case','idafah-definiteness',
  'describe-possessed-noun','idafah-after-preposition','nonhuman-plural-agreement','definite-categories'];
const seen = new Set();
for (const id of learningPath) {
  assert.ok(byId.has(id), id);
  for (const dep of byId.get(id).prerequisites) assert.ok(seen.has(dep), `${id} precedes prerequisite ${dep}`);
  seen.add(id);
}
assert.equal(seen.size, concepts.length);
assert.equal(new Set(concepts.map(c=>c.id)).size, concepts.length);
const data = {schemaVersion:1, title:'Definiteness, description & possession',
  status:'pilot', scope:'Selected existing cards from Books 1 and 3A; not exhaustive topic coverage.',
  externalPrerequisites:['Recognize basic masculine/feminine and singular/plural distinctions.','Recognize simple nominal sentences and common prepositions; source cards provide supporting context.'],
  difficultyScale:{1:'Recognize a simple pattern',2:'Build and distinguish phrases',3:'Apply interacting rules and qualifications'},
  topics:[{id:'definiteness',title:'Which thing do we mean?',subtitle:'Definiteness · مَعْرِفَة / نَكِرَة'},
    {id:'description',title:'How do we describe it?',subtitle:'Description & agreement · نَعْت'},
    {id:'possession',title:'How are the nouns connected?',subtitle:'Possession & idafah · إِضَافَة'}],
  learningPath, concepts};
fs.mkdirSync(path.join(root,'pilot'),{recursive:true});
fs.writeFileSync(path.join(root,'pilot','concepts.json'),JSON.stringify(data,null,2)+'\n');
const sourceCount = new Set(concepts.flatMap(c=>c.sourceCards.map(s=>s.id))).size;
console.log(`Validated ${concepts.length} concepts from ${sourceCount} unique source cards; prerequisite order passes.`);
