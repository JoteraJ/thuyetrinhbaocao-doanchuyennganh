/* Ghép parts/*.html, parts/*.css, parts/*.js thành index.html, parts.css, scenes.js.
   Chạy:  node build.js   (không cần cài thêm gì) */
const fs = require('fs'), path = require('path');
const { recolor } = require('./theme');
const dir = path.join(__dirname, 'parts');
const files = fs.readdirSync(dir).sort();
const pick = ext => files.filter(f => f.endsWith(ext) && !f.startsWith('_'));
const read = f => recolor(fs.readFileSync(path.join(dir, f), 'utf8'));
const html = read('_head.html') + pick('.html').map(read).join('\n') + read('_tail.html');
const hd = (cls) => html.replace('<html lang="vi">', '<html lang="vi" class="' + cls + '">');
fs.writeFileSync(path.join(__dirname, 'index.html'), hd('mode-scroll'));
fs.writeFileSync(path.join(__dirname, 'trinh-chieu.html'), hd('mode-deck'));
fs.writeFileSync(path.join(__dirname, 'parts.css'), pick('.css').map(read).join('\n'));
fs.writeFileSync(path.join(__dirname, 'scenes.js'), '/* sinh tự động bởi build.js */\n(function(){"use strict";\n' + pick('.js').map(f => '/* ' + f + ' */\n;(function(){\n' + read(f) + '\n})();').join('\n') + '\n})();\n');
console.log('built', pick('.html').length, 'slides');
