// Chụp một slide ở chế độ tĩnh.  NODE_PATH=$(npm root -g) node chup_slide.js <số slide> [t giây] [file ra .png] [bước]
// Thêm tham số thứ 6 là `detail` để chụp chế độ chi tiết (câu gốc đầy đủ thay cho từ khóa).
// Không có [bước] = hiện đủ mọi bước.  [bước]=0,1,2,... = chỉ hiện các phần có data-s <= bước.
const { chromium } = require('playwright');
(async () => {
  const n = process.argv[2] || 1, t = process.argv[3] || 6, out = process.argv[4] || `/tmp/s${n}.png`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto(`file://${require("path").resolve(__dirname,"index.html")}?static&t=${t}${process.argv[5]?"&step="+process.argv[5]:""}${process.argv[6]==="detail"?"&detail":""}#${n}`);
  await p.waitForTimeout(900);
  await p.screenshot({ path: out });
  console.log('errors:', JSON.stringify(errs));
  await b.close();
})();
