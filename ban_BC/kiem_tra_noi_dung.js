/* So bản mới (ban_BC/index.html) với bản gốc 16:9 (ban_slide_16x9/index.html) theo từng slide (cùng id).
   Báo: (1) đoạn chữ của bản gốc không còn trong bản mới, (2) con số bị mất, (3) ghi chú nói (aside) khác bản gốc.
   Chạy:  NODE_PATH=$(npm root -g) node kiem_tra_noi_dung.js [s7 s12 ...]   (bỏ trống = tất cả) */
const { chromium } = require('playwright');
const path = require('path');
const OLD = 'file://' + path.resolve(__dirname, '../ban_slide_16x9/index.html');
const NEW = 'file://' + path.resolve(__dirname, 'index.html');
const norm = s => s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N},.]+/gu, ' ').replace(/(?<![\p{N}])[,.]|[,.](?![\p{N}])/gu, ' ').replace(/\s+/g, ' ').trim();
const extract = () => {
  const out = {};
  document.querySelectorAll('section.slide').forEach(sec => {
    const pieces = [];
    const walk = el => {
      if (el.tagName === 'ASIDE' || el.classList.contains('src') || el.classList.contains('pn') || el.classList.contains('pg')) return;
      el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) pieces.push(n.textContent.replace(/\s+/g, ' ').trim()); });
      Array.from(el.children).forEach(walk);
    };
    walk(sec);
    const clone = sec.cloneNode(true);
    clone.querySelectorAll('aside,.src,.pn,.pg').forEach(e => e.remove());
    const tw = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT); let joined = '', nd;
    while ((nd = tw.nextNode())) joined += ' ' + nd.textContent;
    const aside = sec.querySelector('aside');
    out[sec.id] = { kws: Array.from(sec.querySelectorAll('.kw')).map(e => e.textContent), pieces, text: joined.replace(/\s+/g, ' '), aside: aside ? aside.textContent.replace(/\s+/g, ' ').trim() : '' };
  });
  return out;
};
(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto(OLD); const o = await p.evaluate(extract);
  await p.goto(NEW + '?static'); const n = await p.evaluate(extract);
  await b.close();
  let bad = 0;
  Object.keys(o).filter(id => !want.length || want.includes(id)).forEach(id => {
    if (!n[id]) { console.log(`✗ ${id}: bản mới chưa có slide này`); bad++; return; }
    const nt = ' ' + norm(n[id].text) + ' ';
    const miss = o[id].pieces.filter(pc => { const q = norm(pc); return q && q.split(' ').length >= 2 && !nt.includes(' ' + q + ' '); });
    const nums = (norm(o[id].pieces.join(' ')).match(/\p{N}[\p{N},.]*/gu) || []).filter(x => !nt.includes(' ' + x.replace(/[,.]+$/, '') + ' ') && !nt.includes(x.replace(/[,.]+$/, '')));
    const asideOk = norm(o[id].aside) === norm(n[id].aside);
    /* từ khóa (.kw) chỉ được rút từ chữ của slide gốc, không thêm chữ mới */
    const oldWords = new Set(norm(o[id].pieces.join(' ') + ' ' + o[id].aside).split(' '));
    const newKw = [...new Set((n[id].kws || []).flatMap(t => norm(t).split(' ')).filter(w => w && !oldWords.has(w)))];
    const ok = !miss.length && !nums.length && asideOk && !newKw.length;
    console.log(`${ok ? '✓' : '✗'} ${id}${asideOk ? '' : '  [ghi chú nói khác bản gốc]'}`);
    if (!ok) { bad++; if (newKw.length) console.log('    từ khóa có chữ KHÔNG có ở slide gốc: ' + newKw.join(' | ')); miss.forEach(m => console.log('    thiếu chữ: ' + m)); if (nums.length) console.log('    thiếu số: ' + [...new Set(nums)].join(' | ')); }
  });
  console.log(bad ? `\n${bad} slide cần sửa` : '\nTất cả đạt');
  process.exit(bad ? 1 : 0);
})();
