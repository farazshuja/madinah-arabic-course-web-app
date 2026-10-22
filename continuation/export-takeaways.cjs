const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'reader.html'), 'utf8');
const modules = [...html.matchAll(/<script src="([^"]+)"/g)]
  .map(match => match[1]).filter(name => name !== 'app.js' && name !== 'site-nav.js');
const context = vm.createContext({});
vm.runInContext(modules.map(name => fs.readFileSync(path.join(root, name), 'utf8'))
  .join('\n') + '\nthis.cards = concepts;', context);

const labels = { 1: 'Book 1', 2: 'Book 2', 3: 'Book 3A', 4: 'Book 3B' };
const entries = Array.from(context.cards, card => {
  assert.ok(card.takeaway?.trim(), `${card.id}: missing takeaway`);
  return {
    id: card.id,
    book: labels[card.book || 1],
    chapter: card.chapter,
    title: card.title,
    takeaway: card.takeaway,
    cardUrl: `https://farazshuja.github.io/madinah-arabic-course-web-app/?card=${encodeURIComponent(card.id)}`
  };
});
assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
fs.writeFileSync(path.join(root, 'key-takeaways.json'), JSON.stringify(entries, null, 2) + '\n');
console.log(`Exported ${entries.length} card takeaways to key-takeaways.json`);
