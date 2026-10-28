/* Dự phòng B: hai thanh tốc độ UART vẽ đúng tỉ lệ (1 KB/s = 5,6 đơn vị dài): 11,5 : 92 = 1 : 8; hai mốc tải: 15,6 và 47 KB/s. */
var svg = document.getElementById('b2fig'), I = window.Iso, T = I.T;
var U = 5.6, V1 = 11.5, V2 = 92, M1 = 15.6, M2 = 47;
var sc = I.scene(svg, { az: 6, el: 34, rect: [0, 8, 1136, 364], pts: [[-190, -56, -10], [V2 * U + 50, -56, -10], [-190, 110, -10], [V2 * U + 50, 110, -10], [M2 * U, -46, 78], [0, 0, 52], [0, 80, 52]] });
var P = sc.pt;
var plateG = sc.g(), barsG = sc.g(), gateG = sc.g(), dyn = sc.g();
sc.box(plateG, -190, -56, -10, V2 * U + 240, 166, 10, T.plate);
/* thang chia 0..92 KB/s (vạch không nhãn, mỗi ~11,5 KB/s) để thấy tỉ lệ */
for (var i = 0; i <= 8; i++) sc.line(plateG, [i * V2 / 8 * U, -50, 0.2], [i * V2 / 8 * U, 104, 0.2], 'rgba(28,27,25,.16)', 1);
var BY = [0, 80], BD = 26, BH = 22;
function place(id, x, y, z, dx, dy, anchor, fill) { var t = document.getElementById(id), q = P(x, y, z); t.setAttribute('x', (q[0] + dx).toFixed(1)); t.setAttribute('y', (q[1] + dy).toFixed(1)); t.setAttribute('text-anchor', anchor || 'start'); if (fill) t.setAttribute('fill', fill); svg.appendChild(t); }
place('b2l1', -10, BY[0], 0, 0, 2, 'end', '#1f4e9c');
place('b2l2', -10, BY[1], 0, 0, 2, 'end', '#1f4e9c');
place('b2m1', M1 * U, -46, 52, 0, -4, 'middle', '#d9432b');
place('b2m2', M2 * U, -46, 52, 0, -4, 'middle', '#d9432b');
var cur = 0, at = [-1, -1, -1];
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.b2 = function (s) { cur = s; for (var k = 1; k <= 2; k++) { if (s >= k && at[k] < 0) at[k] = performance.now(); if (s < k) at[k] = -1; } };
Deck.shows.b2 = function () { at = [-1, -1, -1]; };
function ease(x) { x = I.clamp(x); return 1 - Math.pow(1 - x, 3); }
function gate(m, a) {                    /* mốc tải: vạch đứt nối tới cột cờ ở mép sau */
  var l = sc.line(gateG, [m * U, 104, 0.3], [m * U, -46, 0.3], 'rgba(217,67,43,' + a.toFixed(2) + ')', 2); l.setAttribute('stroke-dasharray', '6 4');
  sc.box(gateG, m * U - 2, -48, 0, 4, 4, 44 * a, T.red);
}
Deck.frames.b2 = function (t) {
  var still = Deck.still || allOn(), s = still ? 3 : cur, k, p = [0, 0, 0];
  for (k = 1; k <= 2; k++) p[k] = (s >= k) ? (still ? 1 : ease((performance.now() - at[k]) / 900)) : 0;
  sc.clear(barsG); sc.clear(gateG); sc.clear(dyn);
  var l1 = V1 * U * p[1], l2 = V2 * U * p[2];
  if (l1 > .5) sc.box(barsG, 0, BY[0] - BD / 2, 0, l1, BD, BH, T.blue);
  if (l2 > .5) sc.box(barsG, 0, BY[1] - BD / 2, 0, l2, BD, BH, T.blue);
  /* gói chạy trên thanh khi đã mọc */
  var items = [], j;
  if (p[1] >= 1) for (j = 0; j < 3; j++) { var x = ((t * 26 + j * 21) % (V1 * U)); items.push({ x: x - 7, y: BY[0] - 7, z: BH, w: 14, d: 14, h: 14, t: I.LEAF[j] }); }
  if (p[2] >= 1) for (j = 0; j < 8; j++) { var x2 = ((t * 120 + j * 66) % (V2 * U)); items.push({ x: x2 - 7, y: BY[1] - 7, z: BH, w: 14, d: 14, h: 14, t: I.LEAF[j % 3] }); }
  sc.items(dyn, items);
  if (p[1] > 0) gate(M1, p[1]);
  if (p[2] > 0) gate(M2, p[2]);
  ['b2m1', 'b2m2'].forEach(function (id, n) { document.getElementById(id).setAttribute('opacity', p[n + 1]); });
  ['b2l1', 'b2l2'].forEach(function (id, n) { document.getElementById(id).setAttribute('opacity', p[n + 1]); });
};
