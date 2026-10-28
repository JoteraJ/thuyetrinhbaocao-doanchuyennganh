/* Slide 13: biểu đồ cột đúng tỉ lệ (HTML tĩnh) + sơ đồ cơ chế nút thắt 2: ghi UART chặn -> mesh.update() gọi thưa. */
var chart = document.getElementById('s13fig'), ms = document.getElementById('s13mech'), I = window.Iso;
var cur = 0, at2 = -1;
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.s13 = function (s) {
  cur = s;
  chart.classList.toggle('up', s >= 2 || allOn());
  if (s >= 2 && at2 < 0) at2 = performance.now();
  if (s < 2) at2 = -1;
};
Deck.shows.s13 = function () { at2 = -1; };
/* ---- cơ chế ---- */
var W = 590, FULL = 47 / 92 * W, P = W / 6, BL = P * 0.51;          /* 47 KB/s trên giới hạn 92 KB/s; ghi chặn ≈ nửa thời gian */
var NS = 'http://www.w3.org/2000/svg';
function mk(n, a) { return I.el(n, a, ms); }
mk('rect', { x: 0.75, y: 20.75, width: W - 1.5, height: 20.5, fill: '#ece5d4', stroke: '#1c1b19', 'stroke-width': 1.5 });
var gfill = mk('rect', { x: 1.5, y: 21.5, width: FULL, height: 19, fill: '#1f4e9c' });
mk('line', { x1: FULL, y1: 16, x2: FULL, y2: 46, stroke: '#1c1b19', 'stroke-width': 2 });
mk('rect', { x: 0.75, y: 62.75, width: W - 1.5, height: 22.5, fill: '#ece5d4', stroke: '#1c1b19', 'stroke-width': 1.5 });
mk('rect', { x: 0.75, y: 104.75, width: W - 1.5, height: 22.5, fill: '#ece5d4', stroke: '#1c1b19', 'stroke-width': 1.5 });
var blocks = [], ticks = [], k, j;
for (k = 0; k < 6; k++) {
  var bx = k * P + 1;
  blocks.push({ x: bx, bg: mk('rect', { x: bx, y: 64, width: BL, height: 19, fill: 'rgba(31,78,156,.22)' }), fg: mk('rect', { x: bx, y: 64, width: 0, height: 19, fill: '#1f4e9c' }) });
  for (j = 0; j < 7; j++) { var tx = k * P + BL + 4 + j * (P - BL - 6) / 6; ticks.push({ x: tx, el: mk('rect', { x: tx - 1, y: 107, width: 2.4, height: 17, fill: '#d9432b', opacity: .2 }) }); }
}
var hx0 = 2 * P + 1, hx1 = 2 * P + 1 + BL;                         /* một "lỗ hổng" của mesh.update() trùng một khối ghi chặn */
mk('rect', { x: hx0, y: 106, width: BL, height: 19, fill: 'none', stroke: '#d9432b', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' });
var thua = document.getElementById('s13thua'); thua.setAttribute('x', (hx0 + hx1) / 2); thua.setAttribute('text-anchor', 'middle'); thua.setAttribute('y', 99); ms.appendChild(thua);
var head = mk('line', { x1: 0, y1: 44, x2: 0, y2: 128, stroke: '#1c1b19', 'stroke-width': 2 });
Array.prototype.slice.call(ms.querySelectorAll('text')).forEach(function (t) { ms.appendChild(t); });
Deck.frames.s13 = function (t) {
  var ph = ((t * 70) % (W + 40)) - 20, still = Deck.still || allOn();
  if (still) ph = W * .62;
  head.setAttribute('x1', ph); head.setAttribute('x2', ph);
  blocks.forEach(function (b) { b.fg.setAttribute('width', I.clamp((ph - b.x) / BL) * BL); });
  ticks.forEach(function (tk) { var d = ph - tk.x; tk.el.setAttribute('opacity', d >= 0 ? (d < 14 ? 1 : .8) : .2); });
  var g = still ? 1 : (at2 < 0 ? 0 : I.clamp((performance.now() - at2) / 900));
  gfill.setAttribute('width', Math.max(0, (FULL - 1.5) * (1 - Math.pow(1 - g, 3))));
};
