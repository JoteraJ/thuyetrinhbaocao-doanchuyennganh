/* Dự phòng D: Root có 4 slot ghép; mỗi slot có bitmap (các ô = chunk đã nhận) và đồng hồ 2 s.
   Bốn pha ứng với bốn gạch đầu dòng: (1) quá 2 s chưa đủ -> hủy khung; (2) khung mới cùng node -> hủy khung cũ (supersede);
   (3) hết slot -> LRU (slot dùng lâu nhất bị thay); (4) hướng cải tiến (nét đứt): NACK gộp, một bản tin/khung.
   Số ô trên hình chỉ minh họa, không phải số liệu. */
var svg = document.getElementById('b4fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 18, el: 34, rect: [0, 20, 630, 410], pts: [[-30, -135, -10], [320, -135, -10], [-30, 135, -10], [320, 135, -10], [30, 0, 50], [200, -90, 40]] });
var P = sc.pt, S = sc.S, C = sc.C;
var SY = [-90, -30, 30, 90], CX = function (i) { return 118 + i * 30; }, NC = 6, SRC = [26, 0, 24];
var COL = [T.red, T.blue, T.green, T.chip], DEAD = { top: '#f3b9ad', y: '#d9432b', x: '#a8301c' }, GLOW = T.green;
var plateG = sc.g(), objG = sc.g(), dyn = sc.g();
sc.box(plateG, -30, -135, -10, 350, 270, 10, T.plate);
/* Root (nơi chunk tới từ mesh) */
sc.box(objG, -8, -26, 0, 60, 52, 9, T.pcb); sc.box(objG, -2, -16, 9, 22, 18, 3, T.chip);
sc.cyl(objG, 36, 0, 9, 12, 11, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, 36, 0, 21, 2, 8, '#222', '#444', '#101010');
/* 4 slot: khay đá, mỗi ô là một chỗ lõm */
SY.forEach(function (y) {
  sc.box(objG, 108, y - 20, 0, 192, 40, 5, T.stone);
  for (var i = 0; i < NC; i++) sc.box(objG, CX(i) - 1, y - 14, 5, 28, 28, .6, T.dark);
});
/* ---- kịch bản bốn pha: ô (slot,i) có các đoạn {on, off, col, fl} ; chunk bay tới ô ; đồng hồ ---- */
var PD = [4.2, 5.0, 4.0, 5.8], seg = function (on, off, col, fl) { return { on: on, off: off, col: col, fl: fl }; };
function phase1() {
  var cells = {}, fl = [], arr = [[0, .5], [1, .9], [2, 1.3], [4, 1.7], [5, 2.1]];                      /* thiếu ô số 3 */
  arr.forEach(function (a) { cells['0,' + a[0]] = [seg(a[1], 3.3, 0, 2.5)]; fl.push({ s: 0, i: a[0], t: a[1], col: 0 }); });
  return { cells: cells, fl: fl, timers: [{ s: 0, from: .5, to: 2.5 }], nack: null };
}
function phase2() {
  var cells = {}, fl = [], k;
  [[0, .3], [1, .6], [2, .9]].forEach(function (a) { cells['0,' + a[0]] = [seg(a[1], 2.7, 0, 2.1)]; fl.push({ s: 0, i: a[0], t: a[1], col: 0 }); });
  [[0, 2.1], [1, 2.5], [2, 2.9], [3, 3.3]].forEach(function (a) { cells['0,' + a[0]] = (cells['0,' + a[0]] || []).concat([seg(a[1], 99, 0, 999)]); fl.push({ s: 0, i: a[0], t: a[1], col: 0 }); });
  return { cells: cells, fl: fl, timers: [{ s: 0, from: .3, to: 2.1, stop: true }, { s: 0, from: 2.1, to: 4.1 }], nack: null };
}
function phase3() {
  var cells = {}, fl = [], init = [[0, [0, 1], 0], [1, [0, 1, 2], 1], [2, [0, 1, 2, 3], 2], [3, [0, 1], 0]];
  init.forEach(function (r) { r[1].forEach(function (i) { cells[r[0] + ',' + i] = [seg(-9, r[0] === 0 ? 2.0 : 99, r[2], r[0] === 0 ? 1.3 : 999)]; }); });
  [[0, 2.0], [1, 2.45]].forEach(function (a) { cells['0,' + a[0]] = (cells['0,' + a[0]] || []).concat([seg(a[1], 99, 3, 999)]); fl.push({ s: 0, i: a[0], t: a[1], col: 3 }); });
  return { cells: cells, fl: fl, timers: [{ s: 0, fix: .86, to: 1.3 }, { s: 1, fix: .62 }, { s: 2, fix: .42 }, { s: 3, fix: .22 }, { s: 0, from: 2.0, to: 4.0 }], nack: null };
}
function phase4() {
  var cells = {}, fl = [];
  [0, 1, 2, 4, 5].forEach(function (i) { cells['0,' + i] = [seg(-9, 4.7, 0, 4.4)]; });
  cells['0,3'] = [seg(2.9, 4.7, 0, 4.4)]; fl.push({ s: 0, i: 3, t: 2.9, col: 0 });
  return { cells: cells, fl: fl, timers: [{ s: 0, fix: .5, to: 2.9 }], nack: { from: 1.0, to: 2.1 }, glow: [3.0, 4.4] };
}
var PHASES = [phase1(), phase2(), phase3(), phase4()];
function ease(x) { x = I.clamp(x); return x * x * (3 - 2 * x); }
function tileColor(sg, tau, glow) {
  if (tau >= sg.fl) return DEAD;
  if (glow && tau >= glow[0] && tau < glow[1]) return GLOW;
  return COL[sg.col];
}
function drawPhase(ph, tau) {
  var items = [], k, key, s, i;
  /* ô đã nhận (bitmap) */
  for (key in ph.cells) {
    ph.cells[key].forEach(function (sg) {
      if (tau < sg.on || tau >= sg.off) return;
      var p = key.split(','), s0 = +p[0], i0 = +p[1], h = 5;
      if (tau >= sg.off - .3) h = 5 * (sg.off - tau) / .3;
      if (tau < sg.on + .12) h = 5 * ease((tau - sg.on) / .12) + 0;
      items.push({ x: CX(i0), y: SY[s0] - 13, z: 5.6, w: 26, d: 26, h: Math.max(.4, h), t: tileColor(sg, tau, ph.glow) });
    });
  }
  /* chunk đang bay từ Root tới ô */
  ph.fl.forEach(function (f) {
    var u = (tau - (f.t - .55)) / .55; if (u < 0 || u >= 1) return;
    var tx = CX(f.i) + 13, ty = SY[f.s], x = I.lerp(SRC[0], tx, ease(u)), y = I.lerp(SRC[1], ty, ease(u)), z = I.lerp(SRC[2], 12, u) + 30 * Math.sin(Math.PI * u);
    items.push({ x: x - 7, y: y - 7, z: z, w: 14, d: 14, h: 14, t: COL[f.col] });
  });
  /* NACK gộp: một gói nét đứt chạy ngược về Root */
  if (ph.nack && tau >= ph.nack.from && tau < ph.nack.to + .0) {
    var u2 = (tau - ph.nack.from) / (ph.nack.to - ph.nack.from), x2 = I.lerp(CX(3) + 13, SRC[0], u2), y2 = I.lerp(SY[0], SRC[1], u2), z2 = 16 + 26 * Math.sin(Math.PI * u2);
    items.push({ x: x2 - 5, y: y2 - 5, z: z2, w: 10, d: 10, h: 10, t: T.white });
  }
  sc.items(dyn, items);
  /* đồng hồ 2 s (thanh vàng ở mép trước khay) */
  ph.timers.forEach(function (tm) {
    var f;
    if (tm.fix != null) { f = tm.fix; if (tm.to != null && tau >= tm.to) return; if (tm.from != null) return; }
    else { if (tau < tm.from) return; if (tm.stop && tau >= tm.to) return; f = I.clamp((tau - tm.from) / (tm.to - tm.from)); if (!tm.stop && tau > tm.to + .8) return; }
    var y = SY[tm.s] + 24, x0 = 108, w = 192;
    sc.poly(dyn, [P(x0, y, .3), P(x0 + w, y, .3), P(x0 + w, y + 7, .3), P(x0, y + 7, .3)], '#ece5d4', 'rgba(28,27,25,.7)', 1);
    if (f > .01) sc.poly(dyn, [P(x0, y, .5), P(x0 + w * f, y, .5), P(x0 + w * f, y + 7, .5), P(x0, y + 7, .5)], f > .98 ? '#d9432b' : '#b86a00', 'none', 0);
  });
  /* đường NACK nét đứt */
  if (ph.nack) { var l = sc.line(dyn, [CX(3) + 13, SY[0], 16], [SRC[0], SRC[1], 16], '#645f52', 1.4); l.setAttribute('stroke-dasharray', '4 4'); l.setAttribute('opacity', tau >= ph.nack.from - .3 ? 1 : 0); }
}
var cur = 0, bul = document.querySelectorAll('#b4 ul.bk li'), ul = document.querySelector('#b4 ul.bk');
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.b4 = function (s) {
  cur = s; ul.classList.toggle('has', s > 0 && !allOn());
  Array.prototype.forEach.call(bul, function (li) { li.classList.toggle('act', +li.getAttribute('data-s') === s && !allOn()); });
};
Deck.frames.b4 = function (t) {
  var ph, tau, tot = PD[0] + PD[1] + PD[2] + PD[3];
  if (cur > 0 && !allOn()) { ph = cur - 1; tau = t % PD[ph]; }
  else { var u = t % tot; ph = 0; while (u >= PD[ph]) { u -= PD[ph]; ph++; } tau = u; }
  sc.clear(dyn);
  drawPhase(PHASES[ph], tau);
};
