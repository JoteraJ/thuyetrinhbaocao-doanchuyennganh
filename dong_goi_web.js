/* Gói cả bài thành MỘT file HTML tự chứa (có doctype: mở trực tiếp được; bản đăng web thì bỏ dòng doctype ở đầu) (font, ảnh, CSS, JS nhúng sẵn) để đăng lên web / gửi qua email.
   Chạy:  node dong_goi_web.js [file ra]     mặc định: bai_trinh_bay_mot_file.html
   Mở ra ở chế độ cuộn; bấm M hoặc nút "Chế độ trình chiếu" để đổi chế độ. */
const fs = require('fs'), path = require('path');
const d = __dirname, rd = f => fs.readFileSync(path.join(d, f), 'utf8');
const b64 = (f, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(d, f)).toString('base64');
const out = process.argv[2] || path.join(d, '..', 'bai_trinh_bay_mot_file.html');
const fonts = rd('fonts/fonts.css').replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(' + b64('fonts/' + f, 'font/woff2') + ')');
const css = fonts + '\n' + rd('style.css').replace(/@import url\([^)]*\);?/, '') + '\n' + rd('parts.css');
let body = rd('index.html').split('<body>')[1].split('</body>')[0];
body = body.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
body = body.replace(/src="assets\/([^"]+)"/g, (m, f) => 'src="' + b64('assets/' + f, /\.png$/.test(f) ? 'image/png' : 'image/jpeg') + '"');
const js = ['iso.js', 'scenes.js', 'app.js'].map(f => '<script>\n' + rd(f) + '\n</script>').join('\n');
const html = '<!doctype html><html lang="vi" class="mode-scroll"><meta charset="utf-8">\n<title>Phản biện WiFi Mesh</title>\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n' + css + '\n</style>\n' + body + '\n' + js + '\n';
fs.writeFileSync(out, html);
console.log('đã ghi', out, (html.length / 1048576).toFixed(2) + ' MB');
