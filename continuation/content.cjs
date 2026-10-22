const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const modules = [...fs.readFileSync(path.join(root, 'reader.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(name => name !== 'app.js' && name !== 'site-nav.js');
const context = vm.createContext({});
vm.runInContext(modules.map(name => fs.readFileSync(path.join(root, name), 'utf8')).join('\n') + '\nthis.cards=concepts;', context);
module.exports = {root, cards: Array.from(context.cards)};
