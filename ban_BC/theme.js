/* Đổi bảng màu "giấy kem – mực đen" (màu viết trong parts/*) sang nhận diện "men ngọc – chàm – son".
   build.js gọi recolor() cho mọi file trong parts/ khi ghép, nên file nguồn giữ màu cũ, kết quả ra màu mới. */
const EXPLICIT = {
  '#1c1b19': '#0c2a44', '#26231c': '#0c2a44', '#645f52': '#34505c', '#6b6455': '#34505c',
  '#d9432b': '#b5301c', '#1f4e9c': '#1a4f9c', '#1b7f5c': '#0b6a47',
  '#f6f1e7': '#d8eae0', '#ece5d4': '#c5dccf', '#fbf8f0': '#f1f8f4',
  '#b86a00': '#8a5200', '#a06b10': '#8a5200', '#ffffff': '#ffffff', '#fff': '#ffffff'
};
const RGBA = [['28,27,25', '12,42,68'], ['45,38,28', '10,32,48'], ['60,52,38', '10,32,48'], ['217,67,43', '181,48,28'], ['31,78,156', '26,79,156']];
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s, l];
}
function rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}
function mapHex(hex) {
  let h = hex.toLowerCase();
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (EXPLICIT[h]) return EXPLICIT[h];
  const R = parseInt(h.substr(1, 2), 16), G = parseInt(h.substr(3, 2), 16), B = parseInt(h.substr(5, 2), 16);
  const [hh, s, l] = hsl(R, G, B);
  const warmNeutral = s < .12 || (hh >= 15 && hh <= 65 && s < .45);
  if (!warmNeutral) return hex;
  if (l >= .8) return rgb(152, .2, l);          /* nền, giấy: tông men ngọc */
  if (l >= .5) return rgb(175, .13, l);         /* xám trung: ngọc xám */
  return rgb(208, .16, l);                      /* xám đậm: chàm xám */
}
function recolor(text) {
  text = text.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, m => mapHex(m));
  RGBA.forEach(([a, b]) => { text = text.split('rgba(' + a + ',').join('rgba(' + b + ','); });
  return text;
}
module.exports = { recolor, mapHex };
if (require.main === module) { process.argv.slice(2).forEach(f => { const fs = require('fs'); fs.writeFileSync(f, recolor(fs.readFileSync(f, 'utf8'))); console.log('recolored', f); }); }
