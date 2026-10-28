/* sinh tự động bởi build.js */
(function(){"use strict";
/* 01-bia.js */
;(function(){
/* Bìa: 1 Root + 3 Leaf nối thành cây; chunk chuyền từ Leaf về Root */
var svg = document.getElementById('s1fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 30, el: 32, rect: [0, 30, 520, 380], pts: [[-20, -150, -10], [420, -150, -10], [-20, 150, -10], [420, 150, -10], [0, 0, 70]] });
var P = sc.pt, plateG = sc.g(), linkG = sc.g(), objG = sc.g(), dyn = sc.g();
sc.box(plateG, -20, -150, -10, 440, 300, 10, T.plate);
var node = { L: [[260, 70], [150, -60], [30, 60]], R: [370, -10] };
function board(cx, cy) {
  sc.box(objG, cx - 30, cy - 24, 0, 60, 48, 8, T.pcb); sc.box(objG, cx - 24, cy - 16, 8, 18, 14, 3, T.chip);
  sc.cyl(objG, cx + 18, cy, 8, 10, 12, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, cx + 18, cy, 18, 2, 8, '#222', '#444', '#101010');
}
[0, 1, 2].sort(function (a, b) { return (node.L[a][0] * sc.S + node.L[a][1] * sc.C) - (node.L[b][0] * sc.S + node.L[b][1] * sc.C); }).forEach(function (i) { board(node.L[i][0], node.L[i][1]); });
sc.box(objG, node.R[0] - 38, node.R[1] - 42, 0, 76, 84, 12, T.pcb); sc.box(objG, node.R[0] - 10, node.R[1] - 16, 12, 30, 30, 7, T.chip);
var chain = [node.L[2], node.L[1], node.L[0], node.R], PERIOD = 4;
function frame(t) {
  sc.clear(dyn); sc.clear(linkG);
  var items = [];
  for (var i = 0; i < 3; i++) {                                   /* các cạnh của cây: L3→L2→L1→Root */
    var a = chain[i], b = chain[i + 1], pp = [];
    for (var u = 0; u <= 10; u++) { var f = u / 10; pp.push([I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 30 + 12 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  }
  for (var k = 0; k < 5; k++) {
    var s = ((t - k * .3) % PERIOD + PERIOD) % PERIOD / PERIOD;
    var path = [[chain[0][0], chain[0][1], 34], [chain[1][0], chain[1][1], 34], [chain[2][0], chain[2][1], 34], [chain[3][0], chain[3][1], 34]];
    var q = I.along(path, s);
    items.push({ x: q[0] - 4.5, y: q[1] - 4.5, z: q[2], w: 9, d: 9, h: 9, t: I.LEAF[k % 3] });
  }
  sc.items(dyn, items);
}
Deck.frames.s1 = frame;

})();
/* 03-van-de.js */
;(function(){
/* Slide 3: hình sao (trái) và mesh đa chặng (phải), chu kỳ 14 s.
   Sao:  0-4 bình thường · 4-7 một thiết bị đi ra ngoài vùng phủ -> đứt · 8-12 router hỏng -> tất cả mất liên lạc.
   Mesh: 1 Root + 3 Leaf, cây động. 0-4 Leaf3 -> Leaf1 -> Root · 4-7 Leaf3 đi chỗ khác, tự đổi cha sang Leaf2 ·
         8-13,6 Leaf2 mất nguồn, Leaf3 mất cha rồi nối lại qua Leaf1. */
var I = window.Iso, T = I.T, PER = 14, R = 100;
var DEAD = { top: '#8e8b80', y: '#77746a', x: '#64615a' };
function sm(a) { a = I.clamp(a); return a * a * (3 - 2 * a); }
function mix2(a, b, f) { return [I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f)]; }
function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

function mk(id, hx, hy, ringAt) {
  var svg = document.getElementById(id);
  var sc = I.scene(svg, { az: 25, el: 32, rect: [4, 2, 540, 218], pts: [[-hx, -hy, -10], [hx, -hy, -10], [-hx, hy, -10], [hx, hy, -10], [0, 0, 52]] });
  var W = { sc: sc, plate: sc.g(), link: sc.g(), obj: sc.g(), lab: sc.g() };
  sc.box(W.plate, -hx, -hy, -10, 2 * hx, 2 * hy, 10, T.plate);
  var x0 = -hx + 8, x1 = hx - 8, y0 = -hy + 8, y1 = hy - 8;
  [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]].forEach(function (l) { sc.line(W.plate, [l[0], l[1], 0], [l[2], l[3], 0], 'rgba(60,52,38,.22)', .9); });
  [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (c) { var q = sc.pt(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.2, fill: '#8c8470' }, W.plate); });
  var ring = sc.circle(W.plate, ringAt[0], ringAt[1], 0, R, 72, 'rgba(31,78,156,.07)', 'rgba(31,78,156,.55)', 1.2);
  ring.setAttribute('stroke-dasharray', '5 5');
  return W;
}
function dk(sc, x, y) { return x * sc.S + y * sc.C; }
function flush(list) { list.sort(function (a, b) { return a.k - b.k; }); list.forEach(function (o) { o.f(); }); }

/* ---- vật thể (US = hệ số thu nhỏ so với bo mạch thật để chừa chỗ cho cây) ---- */
var US = .86;
function bx(sc, g, cx, cy, dx, dy, z, w, d, h, t) { sc.box(g, cx + dx * US, cy + dy * US, z * US, w * US, d * US, h * US, t); }
function cy2(sc, g, cx, cy, dx, dy, z, h, r, a, b, c) { sc.cyl(g, cx + dx * US, cy + dy * US, z * US, h * US, r * US, a, b, c); }
function board(sc, g, cx, cy, dead, led) {
  bx(sc, g, cx, cy, -32, -26, 0, 64, 52, 8, dead ? DEAD : T.pcb);
  bx(sc, g, cx, cy, -26, -18, 8, 20, 16, 3, T.chip);
  cy2(sc, g, cx, cy, 20, 0, 8, 10, 13, '#3b3a35', '#6d6b62', '#8b887c');
  cy2(sc, g, cx, cy, 20, 0, 18, 2, 9, '#222', '#444', '#101010');
  bx(sc, g, cx, cy, -28, 16, 8, 7, 7, 3, dead ? T.dark : led);
}
function router(sc, g, cx, cy, dead) {
  bx(sc, g, cx, cy, -30, -24, 0, 60, 48, 13, dead ? DEAD : T.stone);
  [-18, 18].forEach(function (dx) { cy2(sc, g, cx, cy, dx, -14, 13, 30, 2.8, '#1f1e1b', '#4a4840', '#26231c'); });
  [-16, -4, 8].forEach(function (dx) { bx(sc, g, cx, cy, dx, 14, 13, 7, 6, 2, dead ? T.dark : T.green); });
}
function rootBoard(sc, g, cx, cy) {
  bx(sc, g, cx, cy, -38, -31, 0, 76, 62, 9, T.pcb);
  bx(sc, g, cx, cy, -16, -16, 9, 40, 30, 4, T.dark);
  bx(sc, g, cx, cy, 38, -9, 1, 11, 18, 7, T.chip);
  bx(sc, g, cx, cy, -32, 20, 9, 7, 7, 3, T.red);
}
function arc(a, b, f) { return [I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 15 + 15 * Math.sin(Math.PI * f)]; }
function link(W, a, b, color, t, upto) {
  var pp = [], n = 14, m = upto == null ? 1 : upto;
  for (var u = 0; u <= n; u++) pp.push(arc(a, b, m * u / n));
  var e = W.sc.path(W.link, pp, 0, color, 1.8);
  e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
}
function cross(W, a, b, z) {
  var q = W.sc.pt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z || 22);
  [[-1, -1, 1, 1], [-1, 1, 1, -1]].forEach(function (d) {
    I.el('line', { x1: q[0] + d[0] * 7, y1: q[1] + d[1] * 7, x2: q[0] + d[2] * 7, y2: q[1] + d[3] * 7, stroke: '#d9432b', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, W.lab);
  });
}
function cube(W, list, p, color) {
  var sc = W.sc;
  list.push({ k: dk(sc, p[0], p[1]) + .5, f: function () { sc.box(W.obj, p[0] - 4.5, p[1] - 4.5, p[2] - 4.5, 9, 9, 9, color); } });
}

/* ====================== HÌNH SAO ====================== */
var S = mk('s3a', 196, 110, [0, 0]);
var HUB = [0, 0];
var starBase = [[-76, -50], [76, -50], [-76, 50], [76, 50]];
var STAR_FAR = [146, -84];
function starB(t) {
  if (t < 4) return starBase[1];
  if (t < 7) return mix2(starBase[1], STAR_FAR, sm((t - 4) / 3));
  if (t < 12) return STAR_FAR;
  if (t < 13.5) return mix2(STAR_FAR, starBase[1], sm((t - 12) / 1.5));
  return starBase[1];
}
function hubOn(t) { return !(t >= 8 && t < 12); }
function starPos(i, t) { return i === 1 ? starB(t % PER) : starBase[i]; }
function starUp(i, t) { var tm = t % PER; return hubOn(tm) && dist(starPos(i, t), HUB) <= R; }
var SLED = [T.red, T.blue, T.green, T.white];
function starFrame(t) {
  var sc = S.sc, tm = t % PER, on = hubOn(tm), list = [];
  sc.clear(S.link); sc.clear(S.obj); sc.clear(S.lab);
  for (var i = 0; i < 4; i++) {
    var p = starPos(i, t), up = starUp(i, t), far = dist(p, HUB) > R;
    if (up) link(S, p, HUB, '#1f4e9c', t);
    else {
      /* liên kết đã đứt: chỉ còn nửa đoạn mờ + dấu gạch chéo */
      var e = S.sc.path(S.link, [arc(p, HUB, 0), arc(p, HUB, .35)], 0, '#9a9486', 1.6); e.setAttribute('stroke-dasharray', '3 5');
      if (!on || far) cross(S, p, mix2(p, HUB, .6), 20);
    }
    (function (i, p, dead) { list.push({ k: dk(sc, p[0], p[1]), f: function () { board(sc, S.obj, p[0], p[1], dead, SLED[i]); } }); })(i, p, !up);
    /* gói tin: mỗi thiết bị gửi mỗi 1,5 s; chỉ gửi khi liên kết còn */
    var off = i * .4;
    for (var k = Math.floor((t - off) / 1.5); k >= Math.floor((t - off) / 1.5) - 1; k--) {
      var te = k * 1.5 + off, f = (t - te) / .9;
      if (te < 0 || f < 0 || f > 1 || !starUp(i, te)) continue;
      if (!hubOn((te + .9) % PER)) { if (f > .9) continue; }
      cube(S, list, arc(starPos(i, te), HUB, f), I.T.blue);
    }
  }
  list.push({ k: dk(sc, 0, 0), f: function () { router(sc, S.obj, 0, 0, !on); } });
  flush(list);
  var q = sc.pt(0, 88, 0); sc.text(S.lab, q[0], q[1] + 4, 'Router/AP', 17, 700, 'middle', null, 'sf').style.fill = on ? '#26231c' : '#8a8576';
}

/* ====================== MESH ====================== */
var M = mk('s3b', 196, 110, [80, 0]);
var ROOT = [80, 0], LF = [[0, -52], [0, 52]], LCOL = [T.red, T.blue, T.green];
function l3(t) {
  var tm = t % PER, y;
  if (tm < 4) y = -25; else if (tm < 7) y = -25 + 75 * sm((tm - 4) / 3); else if (tm < 12) y = 50; else if (tm < 13.5) y = 50 - 75 * sm((tm - 12) / 1.5); else y = -25;
  return [-114, y];
}
function l2on(t) { var tm = t % PER; return !(tm >= 8 && tm < 13.6); }
function parOf(t) {                 /* cha của Leaf 3: -1 = đang mất cha */
  var tm = t % PER; if (tm >= 8 && tm < 9.2) return -1;
  if (!l2on(t)) return 0;
  var p = l3(t); return dist(p, LF[0]) <= dist(p, LF[1]) ? 0 : 1;
}
var SEG = [];                       /* các mốc đổi cha trong một chu kỳ */
(function () { var last = null; for (var u = 0; u < PER * 100; u++) { var q = parOf(u / 100); if (q !== last) { SEG.push({ t0: u / 100, p: q }); last = q; } } })();
function segAt(tm) { var i = 0; for (var k = 0; k < SEG.length; k++) if (SEG[k].t0 <= tm) i = k; return i; }
function nodeP(id, t) { return id === 'R' ? ROOT : id === 2 ? l3(t) : LF[id]; }
function alive(id, t) { return id !== 1 || l2on(t); }
function route(src, te) { var r = [src]; if (src === 2) { var p = parOf(te); if (p < 0) return null; r.push(p); } r.push('R'); return r; }
function meshFrame(t) {
  var sc = M.sc, tm = t % PER, list = [], P3 = l3(t), HOP = .62;
  sc.clear(M.link); sc.clear(M.obj); sc.clear(M.lab);
  /* cạnh của cây */
  [0, 1].forEach(function (i) { if (alive(i, t)) link(M, LF[i], ROOT, '#d9432b', t); });
  var si = segAt(tm), cur = SEG[si], prev = SEG[(si + SEG.length - 1) % SEG.length], gt = tm - cur.t0;
  if (cur.p >= 0) {
    var f = I.clamp(gt / .45);
    link(M, P3, nodeP(cur.p, t), '#d9432b', t, f);
    if (f < 1 && prev.p >= 0 && alive(prev.p, t)) link(M, P3, nodeP(prev.p, t), '#d9432b', t, 1 - f);
  } else cross(M, P3, LF[1], 22);
  /* vật thể */
  list.push({ k: dk(sc, ROOT[0], ROOT[1]), f: function () { rootBoard(sc, M.obj, ROOT[0], ROOT[1]); } });
  [0, 1].forEach(function (i) { list.push({ k: dk(sc, LF[i][0], LF[i][1]), f: function () { board(sc, M.obj, LF[i][0], LF[i][1], !alive(i, t), LCOL[i]); } }); });
  list.push({ k: dk(sc, P3[0], P3[1]), f: function () { board(sc, M.obj, P3[0], P3[1], false, LCOL[2]); } });
  /* gói tin: Leaf i gửi mỗi 1,5 s, đi theo cây, qua node trung gian */
  [0, 1, 2].forEach(function (src) {
    var off = src * .5;
    for (var k = Math.floor((t - off) / 1.5); k >= Math.floor((t - off) / 1.5) - 2; k--) {
      var te = k * 1.5 + off; if (te < 0 || !alive(src, te)) continue;
      var r = route(src, te); if (!r) continue;
      var s = t - te, n = r.length - 1, tot = n * HOP + (n - 1) * .1; if (s < 0 || s > tot) continue;
      var a, b, f2, tcur = 0, pos = null;
      for (var h = 0; h < n; h++) {
        var t0 = h * (HOP + .1), tarr = te + t0 + HOP;
        if (s >= t0 && s <= t0 + HOP) { a = nodeP(r[h], te + t0); b = nodeP(r[h + 1], te + t0 + HOP); f2 = (s - t0) / HOP; pos = arc(a, b, sm(f2)); }
        else if (s > t0 + HOP && s < t0 + HOP + .1) { b = nodeP(r[h + 1], tarr); pos = [b[0], b[1], 15]; }
        if (s > t0 + HOP && r[h + 1] !== 'R' && !alive(r[h + 1], tarr)) { pos = null; break; }
      }
      if (pos) cube(M, list, pos, LCOL[src]);
    }
  });
  flush(list);
  var q = sc.pt(ROOT[0], ROOT[1] - 31, 24); sc.text(M.lab, q[0], q[1] - 8, 'Root', 17, 700, 'middle', '#26231c', 'sf');
}
Deck.frames.s3 = function (t) { starFrame(t); meshFrame(t); };

})();
/* 04-muc-tieu.js */
;(function(){
/* Slide 4: ba biểu tượng cơ cấu nhỏ (thông lượng, độ trễ, tự phục hồi) + cây 1 Root / 3 Leaf cho phạm vi.
   Chỉ vẽ cơ chế; không có số liệu. */
var I = window.Iso, T = I.T, DEAD = { top: '#8e8b80', y: '#77746a', x: '#64615a' }, RED2 = { top: '#ee6a50', y: '#d9432b', x: '#a8321f' };
function sm(a) { a = I.clamp(a); return a * a * (3 - 2 * a); }
function dk(sc, x, y) { return x * sc.S + y * sc.C; }
function mini(id, hx, hy, rect, U) {
  var svg = document.getElementById(id);
  var sc = I.scene(svg, { az: 25, el: 32, rect: rect, pts: [[-hx, -hy, -6], [hx, -hy, -6], [-hx, hy, -6], [hx, hy, -6], [0, 0, 34]] });
  var W = { sc: sc, U: U, plate: sc.g(), rail: sc.g(), link: sc.g(), obj: sc.g(), top: sc.g() };
  sc.box(W.plate, -hx, -hy, -6, 2 * hx, 2 * hy, 6, T.plate);
  return W;
}
function bx(W, cx, cy, dx, dy, z, w, d, h, t) { var U = W.U; W.sc.box(W.obj, cx + dx * U, cy + dy * U, z * U, w * U, d * U, h * U, t); }
function board(W, cx, cy, dead, led) {
  bx(W, cx, cy, -32, -26, 0, 64, 52, 8, dead ? DEAD : T.pcb);
  bx(W, cx, cy, -26, -18, 8, 20, 16, 3, T.chip);
  W.sc.cyl(W.obj, cx + 20 * W.U, cy, 8 * W.U, 10 * W.U, 13 * W.U, '#3b3a35', '#6d6b62', '#8b887c');
  W.sc.cyl(W.obj, cx + 20 * W.U, cy, 18 * W.U, 2 * W.U, 9 * W.U, '#222', '#444', '#101010');
  bx(W, cx, cy, -28, 16, 8, 8, 8, 3, dead ? T.dark : led);
}
function rootb(W, cx, cy) {
  bx(W, cx, cy, -38, -31, 0, 76, 62, 9, T.pcb);
  bx(W, cx, cy, -16, -16, 9, 40, 30, 4, T.dark);
  bx(W, cx, cy, 38, -9, 1, 11, 18, 7, T.chip);
}
function arc(a, b, f) { return [I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 12 + 12 * Math.sin(Math.PI * f)]; }
function link(W, a, b, color, t, upto) {
  var pp = [], n = 12, m = upto == null ? 1 : upto;
  for (var u = 0; u <= n; u++) pp.push(arc(a, b, m * u / n));
  var e = W.sc.path(W.link, pp, 0, color, 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
}
function cross(W, a, b) {
  var q = W.sc.pt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 14);
  [[-1, -1, 1, 1], [-1, 1, 1, -1]].forEach(function (d) { I.el('line', { x1: q[0] + d[0] * 6, y1: q[1] + d[1] * 6, x2: q[0] + d[2] * 6, y2: q[1] + d[3] * 6, stroke: '#d9432b', 'stroke-width': 3, 'stroke-linecap': 'round' }, W.top); });
}
function begin(W) { var sc = W.sc; sc.clear(W.rail); sc.clear(W.link); sc.clear(W.obj); sc.clear(W.top); }
function flushBoards(W, boards) { boards.sort(function (a, b) { return a.k - b.k; }); boards.forEach(function (o) { o.f(); }); }
function cubes(W, list) { list.sort(function (a, b) { return a.k - b.k; }); list.forEach(function (o) { W.sc.box(W.top, o.p[0] - o.s / 2, o.p[1] - o.s / 2, o.p[2] - o.s / 2, o.s, o.s, o.s, o.t); }); }
function pk(W, list, p, col, s) { list.push({ p: p, t: col, s: s || 7, k: dk(W.sc, p[0], p[1]) }); }
function B(W, list, x, y, f) { list.push({ k: dk(W.sc, x, y), f: f }); }
function railBar(W, x0, x1, y, frac, color) {          /* thanh thời gian ở mép trước tấm nền */
  var sc = W.sc;
  sc.box(W.rail, x0, y, 0, x1 - x0, 3.5, 1.2, T.dark);
  if (frac > 0) sc.box(W.rail, x0, y, 1.2, (x1 - x0) * I.clamp(frac), 3.5, 1.6, color);
}

/* ---------- 1. thông lượng: cube đi Leaf -> relay -> Root, khay của Root đầy dần theo thời gian ---------- */
var A = mini('s4a', 96, 40, [2, 2, 216, 108], .62);
var A_L = [-66, -6], A_R = [-4, -6], A_ROOT = [66, -6], PA = 7.2;
function frameA(t) {
  var tm = t % PA, sc = A.sc, bl = [], cb = [];
  begin(A);
  var arrived = 0, HOP = .55;
  for (var k = 0; k < 8; k++) {
    var te = .2 + .58 * k, s = tm - te; if (s < 0) continue;
    if (s < HOP) pk(A, cb, arc(A_L, A_R, sm(s / HOP)), T.red, 7);
    else if (s < HOP + .08) pk(A, cb, [A_R[0], A_R[1], 12], T.red, 7);
    else if (s < 2 * HOP + .08) pk(A, cb, arc(A_R, A_ROOT, sm((s - HOP - .08) / HOP)), T.red, 7);
    else arrived++;
  }
  link(A, A_L, A_R, '#d9432b', t); link(A, A_R, A_ROOT, '#d9432b', t);
  B(A, bl, A_L[0], A_L[1], function () { board(A, A_L[0], A_L[1], false, T.red); });
  B(A, bl, A_R[0], A_R[1], function () { board(A, A_R[0], A_R[1], false, T.blue); });
  B(A, bl, A_ROOT[0], A_ROOT[1], function () {
    rootb(A, A_ROOT[0], A_ROOT[1]);
    sc.box(A.obj, A_ROOT[0] - 15, A_ROOT[1] - 12, 5, 30, 26, 3, T.stone);
    for (var n = 0; n < arrived; n++) { var ly = Math.floor(n / 4), c = n % 4; sc.box(A.obj, A_ROOT[0] - 12 + (c % 2) * 12, A_ROOT[1] - 9 + Math.floor(c / 2) * 12, 8 + ly * 6.4, 10, 10, 6, T.red); }
  });
  flushBoards(A, bl); cubes(A, cb);
  railBar(A, -84, 84, 28, tm / 5.3 > 1 ? 1 : tm / 5.3, T.green);
}

/* ---------- 2. độ trễ: đồng hồ chạy từ lúc Leaf chụp tới lúc Root ghép xong ---------- */
var Bm = mini('s4b', 96, 40, [2, 2, 216, 108], .62);
var B_L = [-66, 2], B_R = [66, 2], B_C = [0, -4], PB = 7;
function frameB(t) {
  var tm = t % PB, sc = Bm.sc, bl = [], cb = [], T0 = .4, T1 = 3.6;
  begin(Bm);
  var run = I.clamp((tm - T0) / (T1 - T0)), ang = run * 2 * Math.PI * .82;
  link(Bm, B_L, B_R, '#d9432b', t);
  if (tm > T0 && tm < T1) pk(Bm, cb, arc(B_L, B_R, sm(run)), T.red, 8);
  B(Bm, bl, B_L[0], B_L[1], function () {
    board(Bm, B_L[0], B_L[1], false, T.red);
    if (tm > T0 - .25 && tm < T0 + .35) sc.cyl(Bm.obj, B_L[0] + 20 * .62, B_L[1], 20 * .62, .6, 6, '#fff6c8', '#ffffff', '#ffffff');   /* đèn chụp nháy */
  });
  B(Bm, bl, B_R[0], B_R[1], function () {
    rootb(Bm, B_R[0], B_R[1]);
    if (tm >= T1) sc.box(Bm.obj, B_R[0] - 15, B_R[1] - 12, 9 * .62 + 2, 30, 26, 2, T.red);    /* ảnh đã ghép xong */
  });
  B(Bm, bl, B_C[0], B_C[1], function () {
    sc.cyl(Bm.obj, B_C[0], B_C[1], 0, 6, 20, '#8f8878', '#d9d2c0', '#fbf8f0');
    var P = sc.pt;
    if (ang > .01) {                                                  /* quạt thời gian đã trôi */
      var pp = [P(B_C[0], B_C[1], 6.2)]; for (var i = 0; i <= 18; i++) { var a = -Math.PI / 2 + ang * i / 18; pp.push(P(B_C[0] + 17 * Math.cos(a), B_C[1] + 17 * Math.sin(a), 6.2)); }
      sc.poly(Bm.obj, pp, 'rgba(217,67,43,.55)', 'none', 0);
    }
    var ha = -Math.PI / 2 + ang;
    sc.line(Bm.obj, [B_C[0], B_C[1], 6.4], [B_C[0] + 18 * Math.cos(ha), B_C[1] + 18 * Math.sin(ha), 6.4], '#1c1b19', 2);
    sc.box(Bm.obj, B_C[0] - 1.6, B_C[1] - 1.6, 6, 3.2, 3.2, 2, T.dark);
  });
  flushBoards(Bm, bl); cubes(Bm, cb);
}

/* ---------- 3. tự phục hồi: node trung gian mất nguồn -> đứt -> nối lại qua node khác ---------- */
var C = mini('s4c', 96, 40, [2, 2, 216, 108], .62);
var C_L = [-68, 0], C_A = [-4, -22], C_B = [-4, 24], C_R = [66, 0], PC = 9;
function frameC(t) {
  var tm = t % PC, sc = C.sc, bl = [], cb = [], DOWN = 2.6, UP = 5.4, HOP = .55;
  begin(C);
  var aOn = !(tm >= DOWN && tm < PC - .1), via = tm < DOWN ? C_A : C_B;
  if (tm < DOWN) { link(C, C_L, C_A, '#d9432b', t); link(C, C_A, C_R, '#d9432b', t); }
  else if (tm < UP) { cross(C, C_L, C_A); }
  else { var g = I.clamp((tm - UP) / .5); link(C, C_L, C_B, '#d9432b', t, g); link(C, C_B, C_R, '#d9432b', t, g); }
  if (tm >= PC - .1) { link(C, C_L, C_A, '#d9432b', t); link(C, C_A, C_R, '#d9432b', t); }
  for (var k = 0; k < 14; k++) {
    var te = .2 + .6 * k; if (te > DOWN - 1.3 && te < UP + .3) continue;
    var rel = te < DOWN ? C_A : C_B, s = tm - te; if (s < 0 || s > 2 * HOP + .08) continue;
    if (te < DOWN && te + HOP > DOWN && s > DOWN - te) continue;
    if (s < HOP) pk(C, cb, arc(C_L, rel, sm(s / HOP)), T.red, 7);
    else if (s < HOP + .08) pk(C, cb, [rel[0], rel[1], 12], T.red, 7);
    else pk(C, cb, arc(rel, C_R, sm((s - HOP - .08) / HOP)), T.red, 7);
  }
  B(C, bl, C_L[0], C_L[1], function () { board(C, C_L[0], C_L[1], false, T.red); });
  B(C, bl, C_A[0], C_A[1], function () { board(C, C_A[0], C_A[1], !aOn, T.blue); });
  B(C, bl, C_B[0], C_B[1], function () { board(C, C_B[0], C_B[1], false, T.green); });
  B(C, bl, C_R[0], C_R[1], function () { rootb(C, C_R[0], C_R[1]); });
  flushBoards(C, bl); cubes(C, cb);
  railBar(C, -84, 84, 30, 0, RED2);
  var f = tm < DOWN ? 0 : I.clamp((tm - DOWN) / (UP - DOWN + .5));
  if (tm >= DOWN && tm < PC - .1) railBar(C, -84, 84, 30, f * .6, RED2);
}

/* ---------- phạm vi: cây 1 Root + 3 Leaf trên mặt đất ---------- */
var D = mini('s4d', 116, 46, [2, 2, 326, 92], .6);
var D_R = [66, 0], D_1 = [-8, -34], D_2 = [-8, 34], D_3 = [-84, 0];
function frameD(t) {
  var bl = [], cb = [], P = 3.6;
  begin(D);
  link(D, D_3, D_1, '#d9432b', t); link(D, D_1, D_R, '#d9432b', t); link(D, D_2, D_R, '#d9432b', t);
  [[D_3, D_1, D_R, 0, T.green], [D_1, D_R, null, 1.2, T.red], [D_2, D_R, null, 2.2, T.blue]].forEach(function (r) {
    var s = ((t - r[3]) % P + P) % P / P * 1.0, a = r[0], b = r[1], c = r[2];
    if (c) { if (s < .5) pk(D, cb, arc(a, b, sm(s / .5)), r[4], 7); else pk(D, cb, arc(b, c, sm((s - .5) / .5)), r[4], 7); }
    else pk(D, cb, arc(a, b, sm(s)), r[4], 7);
  });
  B(D, bl, D_3[0], D_3[1], function () { board(D, D_3[0], D_3[1], false, T.green); });
  B(D, bl, D_1[0], D_1[1], function () { board(D, D_1[0], D_1[1], false, T.red); });
  B(D, bl, D_2[0], D_2[1], function () { board(D, D_2[0], D_2[1], false, T.blue); });
  B(D, bl, D_R[0], D_R[1], function () { rootb(D, D_R[0], D_R[1]); });
  flushBoards(D, bl); cubes(D, cb);
}
Deck.frames.s4 = function (t) { frameA(t); frameB(t); frameC(t); frameD(t); };

})();
/* 05-ly-thuyet.js */
;(function(){
/* Slide 5: bốn sơ đồ cơ cấu nhỏ.
   a) FANET: UAV nối ad-hoc, gói đi từng chặng về trạm · b) giao thức Linux/IP không sang được ESP32 -> dùng painlessMesh
   c) painlessMesh: cây động, Leaf di chuyển thì đổi cha · d) FreeRTOS: loop() bị chặn -> mesh.update() gọi thưa */
var I = window.Iso, T = I.T, DEAD = { top: '#8e8b80', y: '#77746a', x: '#64615a' };
function sm(a) { a = I.clamp(a); return a * a * (3 - 2 * a); }
function dk(sc, x, y) { return x * sc.S + y * sc.C; }
function mk(id, az, el, hx, hy, zTop, rect) {
  var svg = document.getElementById(id);
  var sc = I.scene(svg, { az: az, el: el, rect: rect || [4, 2, 544, 114], pts: [[-hx, -hy, -8], [hx, -hy, -8], [-hx, hy, -8], [hx, hy, -8], [0, 0, zTop || 40]] });
  var W = { sc: sc, plate: sc.g(), link: sc.g(), obj: sc.g(), top: sc.g(), lab: sc.g() };
  sc.box(W.plate, -hx, -hy, -8, 2 * hx, 2 * hy, 8, T.plate);
  return W;
}
function begin(W) { W.sc.clear(W.link); W.sc.clear(W.obj); W.sc.clear(W.top); }
function flush(list) { list.sort(function (a, b) { return a.k - b.k; }); list.forEach(function (o) { o.f(); }); }
function cube(W, p, col, s) { var sc = W.sc; s = s || 8; sc.box(W.top, p[0] - s / 2, p[1] - s / 2, p[2] - s / 2, s, s, s, col); }
function dashed(W, pts, color, t, w) { var e = W.sc.path(W.link, pts, 0, color, w || 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16); return e; }
function arc(a, b, f, h0, h1) { return [I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 10 + h0 * Math.sin(Math.PI * f)]; }
function label(W, x, y, z, s, col, dy, anchor, size) { var q = W.sc.pt(x, y, z), t = W.sc.text(W.lab, q[0], q[1] + (dy || 0), s, size || 13, 500, anchor || 'middle', null, 'mo'); t.style.fill = col || '#26231c'; return t; }
function cross(W, x, y, z) {
  var q = W.sc.pt(x, y, z);
  [[-1, -1, 1, 1], [-1, 1, 1, -1]].forEach(function (d) { I.el('line', { x1: q[0] + d[0] * 6, y1: q[1] + d[1] * 6, x2: q[0] + d[2] * 6, y2: q[1] + d[3] * 6, stroke: '#d9432b', 'stroke-width': 3, 'stroke-linecap': 'round' }, W.top); });
}
/* bo mạch thu nhỏ: U = tỉ lệ */
function bx(W, cx, cy, U, dx, dy, z, w, d, h, t) { W.sc.box(W.obj, cx + dx * U, cy + dy * U, z * U, w * U, d * U, h * U, t); }
function board(W, cx, cy, U, dead, led) {
  bx(W, cx, cy, U, -32, -26, 0, 64, 52, 8, dead ? DEAD : T.pcb);
  bx(W, cx, cy, U, -26, -18, 8, 20, 16, 3, T.chip);
  W.sc.cyl(W.obj, cx + 20 * U, cy, 8 * U, 10 * U, 13 * U, '#3b3a35', '#6d6b62', '#8b887c');
  W.sc.cyl(W.obj, cx + 20 * U, cy, 18 * U, 2 * U, 9 * U, '#222', '#444', '#101010');
  bx(W, cx, cy, U, -28, 16, 8, 8, 8, 3, dead ? T.dark : led);
}
function rootb(W, cx, cy, U) {
  bx(W, cx, cy, U, -38, -31, 0, 76, 62, 9, T.pcb);
  bx(W, cx, cy, U, -16, -16, 9, 40, 30, 4, T.dark);
  bx(W, cx, cy, U, 38, -9, 1, 11, 18, 7, T.chip);
}

/* ============ a) FANET ============ */
var A = mk('s5a', 0, 34, 240, 30, 56, [4, 2, 544, 114]);
var A_G = [-192, 0], A_D = [[-100, -8], [8, 10], [122, -6]], PA = 4.6;
function drone(W, cx, cy, z, t, ph) {
  var sc = W.sc, g = W.obj;
  sc.circle(W.plate, cx, cy, 0, 19, 14, 'rgba(28,27,25,.12)', 'none', 0);                        /* bóng trên mặt đất */
  sc.box(g, cx - 22, cy - 1.8, z + 3, 44, 3.6, 2.4, T.dark); sc.box(g, cx - 1.8, cy - 22, z + 3, 3.6, 44, 2.4, T.dark);
  sc.box(g, cx - 9, cy - 9, z, 18, 18, 7, T.pcb); sc.box(g, cx - 4, cy + 9, z + 2, 8, 2, 2.5, T.red);
  [[-22, 0], [22, 0], [0, -22], [0, 22]].forEach(function (o, i) {
    var x = cx + o[0], y = cy + o[1], a = t * 22 + ph + i, r = 12;
    sc.circle(g, x, y, z + 8, r, 14, 'rgba(28,27,25,.13)', 'rgba(28,27,25,.35)', .6);
    sc.line(g, [x + r * Math.cos(a), y + r * Math.sin(a), z + 8.3], [x - r * Math.cos(a), y - r * Math.sin(a), z + 8.3], '#1c1b19', 1.4);
  });
}
function frameA(t) {
  var sc = A.sc, bl = [];
  begin(A); sc.clear(A.plate); sc.box(A.plate, -240, -30, -8, 480, 60, 8, T.plate);
  var pos = A_D.map(function (d, i) { return [d[0] + 6 * Math.sin(t * .8 + i * 2), d[1] + 4 * Math.cos(t * .7 + i), 34 + 3 * Math.sin(t * 1.3 + i * 1.7)]; });
  var chain = [[A_G[0], A_G[1], 12]].concat(pos);
  dashed(A, chain, '#d9432b', t, 1.6);
  /* gói tin đi từng chặng: UAV xa nhất -> ... -> trạm mặt đất */
  [0, 2.3].forEach(function (off) {
    var s = ((t - off) % PA + PA) % PA / PA * 1.0, path = [chain[3], chain[2], chain[1], chain[0]];
    cube(A, I.along(path, sm(s)), I.LEAF[off ? 1 : 2], 8);
  });
  bl.push({ k: dk(sc, A_G[0], A_G[1]), f: function () { rootb(A, A_G[0], A_G[1], .8); } });
  pos.forEach(function (p, i) { bl.push({ k: dk(sc, p[0], p[1]) + 40, f: function () { drone(A, p[0], p[1], p[2], t, i * 1.3); } }); });
  flush(bl);
}

/* ============ b) giao thức định tuyến ============ */
var Bm = mk('s5b', 0, 30, 240, 26, 56, [4, 22, 544, 78]);
var PB_X = [-206, -116, -26], PB_NAME = ['AODV', 'OLSR/DSDV', 'B.A.T.M.A.N'], PB = 10.5, GATE = 64;
PB_X.forEach(function (x, j) { label(Bm, x, 0, 36, PB_NAME[j], '#26231c', -4, 'middle', 13); });
label(Bm, -116, 25, 0, 'Linux/tầng IP', '#645f52', 18, 'middle', 13);
label(Bm, 165, 25, 0, 'ESP32', '#645f52', 18, 'middle', 13);
label(Bm, 182, 0, 32, 'painlessMesh', '#d9432b', -6, 'middle', 14);
function frameB(t) {
  var sc = Bm.sc, tm = t % PB, bl = [], k = Math.floor(tm / 3.5), s = (tm % 3.5) / 3.5, hit = false;
  begin(Bm);
  /* tấm Linux/tầng IP, rào chắn, bo ESP32 */
  sc.box(Bm.obj, -240, -25, 0, 296, 50, 5, T.stone);
  sc.cyl(Bm.obj, GATE, -23, 0, 36, 2.4, '#8a2a18', '#d9432b', '#ee6a50'); sc.cyl(Bm.obj, GATE, 23, 0, 36, 2.4, '#8a2a18', '#d9432b', '#ee6a50');
  sc.box(Bm.obj, GATE - 1.5, -23, 26, 3, 46, 4, T.red);
  sc.box(Bm.obj, 90, -25, 0, 150, 50, 8, T.pcb); sc.box(Bm.obj, 98, -16, 8, 30, 24, 4, T.chip);
  var z = []; for (var i = 0; i < 8; i++) z.push(sc.pt(166 + i * 8, -16 + (i % 2) * 10, 8.2));
  I.el('polyline', { points: z.map(function (a) { return a[0].toFixed(1) + ',' + a[1].toFixed(1); }).join(' '), fill: 'none', stroke: '#c7c2b2', 'stroke-width': 1.4 }, Bm.obj);
  sc.box(Bm.obj, 140, -8, 8, 84, 32, 22, T.red);                                         /* khối painlessMesh trên ESP32 */
  sc.box(Bm.obj, 150, 24, 16, 20, .6, 3, T.white);
  /* các khối giao thức; một khối nhảy tới rào, bị chặn, quay về */
  PB_X.forEach(function (x, j) {
    var px = x, pz = 5, face = false;
    if (j === k) {
      if (s > .15 && s < .5) { var f = sm((s - .15) / .35); px = I.lerp(x, GATE - 34, f); pz = 5 + 26 * Math.sin(Math.PI * f) * (1 - .25 * f); }
      else if (s >= .5 && s < .68) { px = GATE - 34 - (s - .5) * 4; hit = true; }
      else if (s >= .68 && s < .95) { var g = sm((s - .68) / .27); px = I.lerp(GATE - 35, x, g); pz = 5 + 20 * Math.sin(Math.PI * g); }
    }
    bl.push({ k: dk(sc, px, 0) + (j === k && s > .15 && s < .95 ? 60 : 0), f: function () { sc.box(Bm.obj, px - 28, -16, pz, 56, 32, 26, T.chip); sc.box(Bm.obj, px - 22, 16, pz + 6, 44, 0.4, 14, T.dark); } });
  });
  flush(bl);
  if (hit) cross(Bm, GATE - 8, 0, 56);
}

/* ============ c) painlessMesh: cây động, Leaf di chuyển thì đổi cha ============ */
var C = mk('s5c', 0, 40, 240, 40, 22, [4, 2, 544, 114]);
var C_R = [180, 0], C_1 = [60, -34], C_2 = [60, 34], PC = 9, UC = .78;
function l3(t) { return [-130, 36 * Math.sin(2 * Math.PI * t / PC)]; }
function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function parC(t) { var p = l3(t); return dist(p, C_1) <= dist(p, C_2) ? 0 : 1; }
function frameC(t) {
  var sc = C.sc, bl = [], P3 = l3(t), pr = parC(t), nodes = [C_1, C_2], tc = t, HOP = .6;
  begin(C);
  while (t - tc < .6 && parC(tc) === pr) tc -= .02;                          /* lúc gần nhất đổi cha */
  var age = t - tc, f = age >= .6 ? 1 : I.clamp(age / .45);
  dashed(C, [0, 6, 12].map(function (u) { return arc(C_1, C_R, u / 12, 10); }).concat([arc(C_1, C_R, 1, 10)]), '#d9432b', t);
  var l1 = [], l2 = [], u;
  for (u = 0; u <= 12; u++) { l1.push(arc(C_1, C_R, u / 12, 10)); l2.push(arc(C_2, C_R, u / 12, 10)); }
  sc.clear(C.link); dashed(C, l1, '#d9432b', t); dashed(C, l2, '#d9432b', t);
  function edge(a, b, m) { var pp = []; for (var u = 0; u <= 12; u++) pp.push(arc(a, b, m * u / 12, 10)); dashed(C, pp, '#d9432b', t); }
  edge(P3, nodes[pr], f);
  if (f < 1) edge(P3, nodes[1 - pr], 1 - f);
  /* gói của ba Leaf về Root theo cây hiện tại */
  [[0, 0], [1, .6], [2, 1.2]].forEach(function (a) {
    var src = a[0], per = 1.8, s = (((t - a[1]) % per) + per) % per, te = t - s;
    var p = parC(te), route = src === 2 ? [P3, nodes[p], C_R] : [nodes[src], C_R];
    if (src === 2) route = [l3(te), nodes[p], C_R];
    var n = route.length - 1, tot = n * HOP + (n - 1) * .1; if (s > tot) return;
    for (var h = 0; h < n; h++) { var t0 = h * (HOP + .1); if (s >= t0 && s <= t0 + HOP) { var q = arc(route[h], route[h + 1], sm((s - t0) / HOP), 10); cube(C, q, I.LEAF[src], 8); return; } else if (s > t0 + HOP && s < t0 + HOP + .1) { cube(C, [route[h + 1][0], route[h + 1][1], 10], I.LEAF[src], 8); return; } }
  });
  bl.push({ k: dk(sc, C_R[0], C_R[1]), f: function () { rootb(C, C_R[0], C_R[1], UC); } });
  bl.push({ k: dk(sc, C_1[0], C_1[1]), f: function () { board(C, C_1[0], C_1[1], UC, false, T.red); } });
  bl.push({ k: dk(sc, C_2[0], C_2[1]), f: function () { board(C, C_2[0], C_2[1], UC, false, T.blue); } });
  bl.push({ k: dk(sc, P3[0], P3[1]), f: function () { board(C, P3[0], P3[1], UC, false, T.green); } });
  flush(bl);
}

/* ============ d) FreeRTOS: dòng thời gian của loopTask ============ */
var D = mk('s5d', 0, 28, 246, 28, 44, [4, 28, 544, 66]);
var D_SEQ = [], D_X0 = -236, D_SC = 47;                    /* 1 đơn vị thời gian = 47 đơn vị chiều dài */
(function () {
  var u = 0, i;
  for (i = 0; i < 4; i++) { D_SEQ.push({ u: u, w: .8, t: 'loop' }); u += .8; D_SEQ.push({ u: u, w: .3, t: 'upd' }); u += .3; }
  D_SEQ.push({ u: u, w: 3.4, t: 'blk' }); u += 3.4; D_SEQ.push({ u: u, w: .3, t: 'upd' }); u += .3;
  D_SEQ.push({ u: u, w: 1.6, t: 'blk' }); u += 1.6; D_SEQ.push({ u: u, w: .3, t: 'upd' }); u += .3;
  D_SEQ.total = u;
})();
(function () {
  function lb(x, s, col, dy, anchor) { var q = D.sc.pt(x, -16, 0); D.sc.text(D.lab, q[0], q[1] + dy, s, 13, 500, anchor || 'start', null, 'mo').style.fill = col; }
  lb(D_X0, 'loopTask', '#1b7f5c', -26);
  lb(D_X0 + 2.2 * D_SC, 'loop()', '#26231c', -26);
  lb(D_X0 + 4.6 * D_SC, 'loop() bị chặn', '#d9432b', -26);
  lb(D_X0 + .8 * D_SC, 'mesh.update()', '#26231c', 40);
  lb(D_X0 + 10 * D_SC, 'mesh.update() bị gọi thưa', '#26231c', 40, 'end');
})();
var PD = 10;
function frameD(t) {
  var sc = D.sc, tm = t % PD, head = I.clamp(tm / 8.4) * D_SEQ.total;
  begin(D);
  /* lane loopTask: các đoạn nối liền, đoạn đã chạy được tô đậm */
  D_SEQ.forEach(function (s) {
    var x = D_X0 + s.u * D_SC, w = s.w * D_SC, done = head >= s.u + s.w ? 1 : head > s.u ? (head - s.u) / s.w : 0;
    var col = s.t === 'upd' ? T.red : s.t === 'blk' ? T.dark : T.stone, h = s.t === 'upd' ? 22 : s.t === 'blk' ? 14 : 12;
    sc.box(D.obj, x, -16, 0, w - .8, 32, h * (.55 + .45 * (done > 0 ? 1 : 0)), done > 0 ? col : { top: '#e3dccb', y: '#cdc5b2', x: '#b4ac98' });
    if (s.t === 'blk' && done > 0) for (var q = 0; q < Math.floor(w / 9); q++) sc.line(D.obj, [x + 4 + q * 9, 16.2, 1], [x + 12 + q * 9, 16.2, 10], 'rgba(246,241,231,.5)', 1.2);
  });
  /* các lần gọi mesh.update() đã xảy ra -> gói gửi ra mạng (hàng khối phía sau) */
  D_SEQ.forEach(function (s) {
    if (s.t !== 'upd' || head < s.u + s.w) return;
    var age = (tm / 8.4) * D_SEQ.total - (s.u + s.w), x = D_X0 + (s.u + s.w / 2) * D_SC, rise = I.clamp(age / .6);
    sc.box(D.top, x - 5, -26, 0, 10, 8, 10 * sm(rise), T.green);
  });
  /* con trỏ thời gian */
  var hx = D_X0 + head * D_SC;
  sc.box(D.top, hx - 1.2, -22, 0, 2.4, 44, 40, { top: '#1c1b19', y: '#1c1b19', x: '#1c1b19' });
}
Deck.frames.s5 = function (t) { frameA(t); frameB(t); frameC(t); frameD(t); };

})();
/* 06-chi-so.js */
;(function(){
/* Slide 6: trục thời gian cho các chỉ số. Ba làn cùng một trục thời gian (đi từ trái sang phải):
   B (xanh lá)  cửa sổ Δt: các khung nhận được (N_ok) và khung bị hủy (N_h)   <- T, FPS, R_h
   A (đỏ)       một khung ảnh: t_chụp -> t_ghép, khoảng cách là độ trễ d
   C (xanh dương) luồng gói phân mảnh: gói cuối nhận được (t_mất) -> gói đầu nhận lại (t_nối), khoảng cách là T_ph.
   Mỗi làn hiện cùng bước với công thức của nó; mỗi làn có con trỏ thời gian riêng quét từ trái sang phải. */
var I = window.Iso, T = I.T, el = I.el, svg = document.getElementById('s6fig');
var INK = '#1c1b19', RED = '#d9432b', BLUE = '#1f4e9c', GREEN = '#1b7f5c', MUTED = '#645f52', EDGE = 'rgba(45,38,28,.55)';
function sm(a) { a = I.clamp(a); return a * a * (3 - 2 * a); }
function g(p, cls) { return el('g', cls ? { 'class': cls } : {}, p || svg); }
function pts(a) { return a.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
/* khối phẳng có chiều sâu (mặt trước + mặt trên + mặt phải) */
function blk(p, x, y, w, h, d, t, dash) {
  var dx = d, dy = d * .6;
  el('polygon', { points: pts([[x, y], [x + dx, y - dy], [x + w + dx, y - dy], [x + w, y]]), fill: t.top, stroke: EDGE, 'stroke-width': .8, 'stroke-linejoin': 'round' }, p);
  el('polygon', { points: pts([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y + h - dy], [x + w, y + h]]), fill: t.x, stroke: EDGE, 'stroke-width': .8, 'stroke-linejoin': 'round' }, p);
  el('rect', { x: x, y: y, width: w, height: h, fill: t.y, stroke: EDGE, 'stroke-width': .8 }, p);
}
function txt(p, x, y, s, size, col, anchor, cls, wt) {
  var t = el('text', { x: x, y: y, 'font-size': size, 'font-weight': wt || 500, 'text-anchor': anchor || 'middle', 'class': cls || 'mo' }, p); t.style.fill = col || INK; t.textContent = s; return t;
}
/* ký hiệu có chỉ số dưới: chữ nghiêng + chỉ số 14 px */
function sym(p, x, y, b, sub, col, size, anchor) {
  var t = el('text', { x: x, y: y, 'text-anchor': anchor || 'middle', 'class': 'sf' }, p); t.style.fill = col || INK;
  var a = el('tspan', { 'font-size': size || 22, 'font-style': 'italic', 'font-weight': 500 }, t); a.textContent = b;
  if (sub) { var s = el('tspan', { 'font-size': 14, dy: 5, 'font-weight': 500 }, t); s.style.fontStyle = 'normal'; s.style.fontFamily = 'var(--sans)'; s.textContent = sub; }
  return t;
}
function line(p, x1, y1, x2, y2, col, w, dash) { var e = el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': w || 1.5, 'stroke-linecap': 'round' }, p); if (dash) e.setAttribute('stroke-dasharray', dash); return e; }
function bracket(p, x0, x1, y, col, up) {            /* dấu ngoặc ngang: hai đầu có vạch */
  line(p, x0, y, x1, y, col, 2.2); line(p, x0, y - 7, x0, y + 7, col, 2.2); line(p, x1, y - 7, x1, y + 7, col, 2.2);
}

/* ---- trục thời gian dùng chung ---- */
var gAxis = g();
line(gAxis, 24, 354, 478, 354, INK, 2.4);
el('polygon', { points: '490,354 476,347 476,361', fill: INK }, gAxis);
var X0 = 30, X1 = 482, CYC = 9, SWEEP = 4.6;
function headX(lt) { return X0 + (X1 - X0) * sm(I.clamp((lt % CYC) / SWEEP)); }
function playhead(p, x, y0, y1, lt) { if ((lt % CYC) < SWEEP + .3) line(p, x, y0, x, y1, INK, 1.6, '3 4'); }

/* ---- làn B: cửa sổ Δt ---- */
var LB = { g: g(), st: null, dy: null, t0: 0 }; LB.st = g(LB.g); LB.dy = g(LB.g);
line(LB.st, 14, 124, 14, 232, GREEN, 5);
var TILE = [], TX = 44, TS = 72, TW = 54, TY = 134, TH = 32;
for (var i = 0; i < 6; i++) TILE.push({ x: TX + i * TS, drop: i === 3 });
function fade(t, a) { t.style.opacity = I.clamp(a); return t; }
function frameB(lt) {
  var s = LB.dy, h = headX(lt); I.el && (function () { while (s.firstChild) s.removeChild(s.firstChild); })();
  TILE.forEach(function (tl) {
    var k = I.clamp((h - (tl.x + TW * .6)) / 26); if (k <= 0) return;
    var e = sm(k), w = TW * e, hh = TH * e, cx = tl.x + TW / 2, cy = TY + TH / 2;
    if (!tl.drop) blk(s, cx - w / 2, cy - hh / 2, w, hh, 8 * e, T.green);
    else {
      el('rect', { x: cx - w / 2, y: cy - hh / 2, width: w, height: hh, fill: 'rgba(217,67,43,.10)', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s);
      if (k > .6) { line(s, cx - 10, cy - 8, cx + 10, cy + 8, RED, 3); line(s, cx - 10, cy + 8, cx + 10, cy - 8, RED, 3); }
    }
  });
  var e1 = Math.min(h, TILE[5].x + TW);
  if (e1 > TX) { bracket(s, TX, e1, 212, GREEN); }
  fade(sym(s, TILE[1].x + TW / 2, 192, 'N', 'ok', GREEN, 22), (h - TILE[1].x - TW) / 20);
  fade(sym(s, TILE[3].x + TW / 2, 192, 'N', 'h', RED, 22), (h - TILE[3].x - TW) / 20);
  fade(sym(s, (TX + TILE[5].x + TW) / 2, 232, 'Δt', '', INK, 22), (h - TILE[5].x - TW) / 10);
  playhead(s, h, 122, 238, lt);
}

/* ---- làn A: một khung ảnh, t_chụp -> t_ghép = độ trễ d ---- */
var LA = { g: g(), st: null, dy: null, t0: 0 }; LA.st = g(LA.g); LA.dy = g(LA.g);
var AX0 = 48, AX1 = 280, AY = 66;
line(LA.st, 14, 8, 14, 112, RED, 5);
sym(LA.st, AX0, 28, 't', 'chụp', INK, 22);
line(LA.st, AX0, 36, AX0, 100, MUTED, 1.2, '3 4');
/* ống kính Leaf ở t_chụp */
el('circle', { cx: AX0, cy: AY, r: 16, fill: '#2c2b27', stroke: EDGE, 'stroke-width': 1 }, LA.st);
el('circle', { cx: AX0, cy: AY, r: 9, fill: '#6d6b62' }, LA.st); el('circle', { cx: AX0 - 3, cy: AY - 3, r: 2.6, fill: '#e6e0d0' }, LA.st);
function frameA(lt) {
  var s = LA.dy, h = headX(lt), cyc = lt % CYC; while (s.firstChild) s.removeChild(s.firstChild);
  if (cyc < .5 && cyc > 0) el('circle', { cx: AX0, cy: AY, r: 16 + 14 * cyc / .5, fill: 'none', stroke: '#e0a200', 'stroke-width': 2.4, opacity: 1 - cyc / .5 }, s);
  var e1 = Math.min(h, AX1);
  if (e1 > AX0 + 20) {                                                   /* các gói phân mảnh của khung đi dần về Root */
    line(s, AX0 + 18, AY, e1, AY, '#d9432b', 2, '5 5');
    for (var q = 0; q < 5; q++) { var cx = AX0 + 38 + q * 38; if (cx < e1 - 6 && cx < AX1 - 30) blk(s, cx - 6, AY - 18, 12, 12, 5, I.LEAF[q % 3] || T.red); }
  }
  var k = I.clamp((h - AX1) / 26);
  if (k > 0) { var e = sm(k), w = 48 * e, hh = 34 * e; blk(s, AX1 - w / 2, AY - hh / 2, w, hh, 8 * e, T.red); if (k > .8) { for (var r = 0; r < 4; r++) el('rect', { x: AX1 - 18 + r * 10, y: AY - 8, width: 7, height: 16, fill: 'rgba(255,255,255,.55)' }, s); } }
  if (e1 > AX0) bracket(s, AX0, e1, 108, RED);
  fade(sym(s, AX1, 28, 't', 'ghép', INK, 22), (h - AX1 + 10) / 20);
  if (h > AX1 - 10) line(s, AX1, 36, AX1, 100, MUTED, 1.2, '3 4');
  fade(sym(s, (AX0 + AX1) / 2, 92, 'd', '', RED, 26), (h - AX1) / 24);
  playhead(s, h, 6, 118, lt);
}

/* ---- làn C: luồng gói, t_mất -> t_nối = T_ph ---- */
var LC = { g: g(), st: null, dy: null, t0: 0 }; LC.st = g(LC.g); LC.dy = g(LC.g);
var CT = [44, 76, 108, 140, 172, 344, 376, 408, 440], CY = 278;
var CL = 172, CR = 344;
line(LC.st, 14, 246, 14, 340, BLUE, 5);
function frameC(lt) {
  var s = LC.dy, h = headX(lt); while (s.firstChild) s.removeChild(s.firstChild);
  CT.forEach(function (x) { if (h >= x) blk(s, x - 6, CY - 6, 12, 12, 5, T.blue); });
  if (h > CL + 14) {                                                     /* đường truyền đứt: không còn gói nào tới */
    line(s, CL + 18, CY, Math.min(h, CR - 18), CY, '#9a9486', 1.6, '3 6');
    if (h > (CL + CR) / 2 + 6) { var mx = (CL + CR) / 2; line(s, mx - 9, CY - 9, mx + 9, CY + 9, RED, 3.2); line(s, mx - 9, CY + 9, mx + 9, CY - 9, RED, 3.2); }
  }
  var e1 = Math.min(h, CR);
  if (e1 > CL) bracket(s, CL, e1, 312, BLUE);
  fade(sym(s, CL, 258, 't', 'mất', INK, 22), (h - CL + 10) / 20); fade(sym(s, CR, 258, 't', 'nối', INK, 22), (h - CR + 6) / 20);
  if (h > CL - 10) line(s, CL, 266, CL, 312, MUTED, 1.2, '3 4'); if (h > CR - 6) line(s, CR, 266, CR, 312, MUTED, 1.2, '3 4');
  fade(sym(s, (CL + CR) / 2, 336, 'T', 'ph', BLUE, 26), (h - CR) / 24);
  playhead(s, h, 244, 330, lt);
}

/* ---- bước: mỗi làn hiện cùng công thức của nó ---- */
function allOn() { return Deck.still && !/[?&]step=/.test(location.search); }
var vis = { B: 0, A: 0, C: 0 }, T0 = { B: 0, A: 0, C: 0 }, tNow = 0;
function setVis(L, name, on) {
  if (on && !vis[name]) T0[name] = tNow;
  vis[name] = on ? 1 : 0; L.g.style.transition = 'opacity .45s'; L.g.style.opacity = on ? 1 : 0;
}
Deck.steps.s6 = function (step) { var a = allOn(); setVis(LB, 'B', a || step >= 1); setVis(LA, 'A', a || step >= 2); setVis(LC, 'C', a || step >= 3); };
Deck.steps.s6(0);
Deck.frames.s6 = function (t) {
  tNow = t;
  if (vis.B) frameB(t - T0.B); if (vis.A) frameA(t - T0.A); if (vis.C) frameC(t - T0.C);
};

})();
/* 07-kien-truc.js */
;(function(){
/* Slide 7: kiến trúc. Chỉ có 1 Root + 3 Leaf; Leaf cũng là node chuyển tiếp; mạng là cây (1 chặng ↔ 3 chặng). */
var svg = document.getElementById('s7fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 22, el: 30, rect: [0, 30, 1136, 400],
  pts: [[-50, -120, -10], [990, -120, -10], [-50, 120, -10], [990, 120, -10], [910, -4, 130], [850, -4, 130], [970, -4, 130]] });
var P = sc.pt, tx = sc.text;
var plateG = sc.g(), linkG = sc.g(), objG = sc.g(), lb = sc.g(), dyn = sc.g();
/* tấm nền ba lớp */
[[-50, 600], [612, 700], [712, 990]].forEach(function (p) {
  sc.box(plateG, p[0], -120, -10, p[1] - p[0], 240, 10, T.plate);
  var x0 = p[0] + 8, x1 = p[1] - 8, y0 = -112, y1 = 112;
  [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]].forEach(function (l) { sc.line(plateG, [l[0], l[1], 0], [l[2], l[3], 0], 'rgba(60,52,38,.22)', .9); });
  [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.2, fill: '#8c8470' }, plateG); });
});
sc.path(plateG, [[630, 0], [714, 0]], 3, '#1f1e1b', 6);
sc.path(plateG, [[796, 0], [858, 0]], 3, '#1f1e1b', 4);
/* vị trí node (tâm bo mạch) */
var N = { root: [545, 0], L: [[350, 6], [215, -55], [100, 52]] };
function leafBoard(cx, cy, i) {
  sc.box(objG, cx - 32, cy - 26, 0, 64, 52, 8, T.pcb);
  sc.box(objG, cx - 26, cy - 18, 8, 20, 16, 3, T.chip);
  var z = []; for (var k = 0; k < 7; k++) z.push(P(cx - 24 + k * 4, cy + 18 - (k % 2) * 6, 8.2));
  I.el('polyline', { points: z.map(function (a) { return a[0].toFixed(1) + ',' + a[1].toFixed(1); }).join(' '), fill: 'none', stroke: '#c7c2b2', 'stroke-width': 1.2 }, objG);
  sc.cyl(objG, cx + 20, cy, 8, 10, 13, '#3b3a35', '#6d6b62', '#8b887c');
  sc.cyl(objG, cx + 20, cy, 18, 2, 9, '#222', '#444', '#101010');
}
/* vẽ từ xa tới gần */
[0, 1, 2].sort(function (a, b) { return (N.L[a][0] * sc.S + N.L[a][1] * sc.C) - (N.L[b][0] * sc.S + N.L[b][1] * sc.C); }).forEach(function (i) { leafBoard(N.L[i][0], N.L[i][1], i); });
/* Root: 4 slot ghép */
sc.box(objG, 470, -52, 0, 150, 104, 14, T.pcb);
sc.box(objG, 580, -20, 14, 36, 40, 8, T.chip); sc.box(objG, 584, -16, 22, 28, 32, 2, T.dark);
var binY = [-36, -12, 12, 36];
binY.forEach(function (y) { sc.box(objG, 494, y - 10, 14, 24, 20, 5, T.stone); sc.box(objG, 496, y - 8, 19, 20, 16, .6, T.dark); });
sc.box(objG, 618, -10, 3, 14, 20, 9, T.dark);
sc.box(objG, 712, -9, 0, 12, 18, 10, T.dark);
/* middleware + dashboard */
sc.box(objG, 722, -48, 0, 76, 96, 48, T.stone);
for (var g2 = 0; g2 < 5; g2++) sc.line(objG, [726, 48.2, 8 + g2 * 5], [798, 48.2, 8 + g2 * 5], 'rgba(60,52,38,.45)', 1);
sc.box(objG, 730, -40, 48, 60, 80, 3, T.white);
sc.box(objG, 870, -20, 0, 60, 40, 5, T.stone); sc.box(objG, 892, -6, 5, 16, 12, 34, T.stone); sc.box(objG, 850, -5, 34, 120, 10, 84, T.dark);
/* nhãn tĩnh */
function name(x, y, z, a, b, up) { var q = P(x, y, z); tx(lb, q[0], q[1] - up, a, 20, 700, 'middle', '#26231c', 'sf'); tx(lb, q[0], q[1] - up + 17, b, 13, 500, 'middle', '#6b6455', 'mo'); }
[0, 1, 2].forEach(function (i) { var q = P(N.L[i][0] - 32, N.L[i][1] + 26, 4); tx(lb, q[0] - 10, q[1] + 4, 'Leaf ' + (i + 1), 18, 700, 'end', '#26231c', 'sf'); tx(lb, q[0] - 10, q[1] + 21, 'ESP32-CAM', 13, 500, 'end', '#6b6455', 'mo'); });
name(545, -52, 14, 'Root', 'ESP32 DevKitC', 60);
name(760, -48, 48, 'Middleware', 'Node.js', 36);
name(930, -5, 118, 'Dashboard', 'React', 36);
[['LỚP 1 · MESH', 275, 120], ['LỚP 2', 656, 120], ['LỚP 3 · PC', 851, 120]].forEach(function (l, i) { var q = P(l[1], l[2], -10); tx(lb, q[0] + 6, q[1] + 24, l[0], 14, 500, 'middle', ['#d9432b', '#1f4e9c', '#1b7f5c'][i], 'mo').setAttribute('letter-spacing', '1.5'); });
var uart = P(660, 0, 3), ws = P(826, 0, 3);
tx(lb, uart[0], uart[1] + 38, 'UART', 13, 500, 'middle', '#1f4e9c', 'mo'); tx(lb, uart[0], uart[1] + 53, '921600', 13, 500, 'middle', '#1f4e9c', 'mo');
tx(lb, ws[0], ws[1] + 38, 'Socket.IO', 13, 500, 'middle', '#1b7f5c', 'mo'); tx(lb, ws[0], ws[1] + 53, 'WebSocket', 13, 500, 'middle', '#1b7f5c', 'mo');
tx(lb, 0, 22, 'chuyển tiếp đa chặng (đã thử 1 và 3 chặng)', 14, 500, 'start', '#d9432b', 'mo');
var modeTxt = tx(lb, 0, 42, '', 14, 700, 'start', '#26231c', 'mo');

/* ---- động ---- */
var cellMat = sc.faceMatrix(850, 5, 34);
var screen = I.el('g', { transform: cellMat }, dyn);
var PERIOD = 4.4, STAG = 1.45, MODEP = 20;
function topOf(n) { return [n[0], n[1], 40]; }
function chainOf(i, mode) {                     /* các node trên đường từ Leaf i tới Root (cây: 1 chặng hoặc 3 chặng) */
  var r = [N.L[i]]; if (mode === 3) for (var k = i - 1; k >= 0; k--) r.push(N.L[k]);
  r.push(N.root); return r;
}
function linksOf(mode) { return mode === 1 ? [[0, 'R'], [1, 'R'], [2, 'R']] : [[0, 'R'], [1, 0], [2, 1]]; }
function node(ref) { return ref === 'R' ? N.root : N.L[ref]; }
function modeAt(t) { return Math.floor(t / MODEP) % 2 === 0 ? 1 : 3; }
function wps(i, mode, k) {                      /* các điểm dừng của chunk k */
  var ch = chainOf(i, mode), w = [];
  ch.forEach(function (n, j) { if (j < ch.length - 1) w.push({ p: [n[0], n[1], 44], dwell: j === 0 ? 0 : .12 }); });
  w.push({ p: [494 + 12, binY[0], 44], dwell: 0, root: true });
  return w;
}
var DSEG = .5;
function travel(w, s, binIdx, zEnd) {            /* s giây kể từ lúc chunk rời Leaf; trả về [x,y,z] hoặc null nếu đã tới */
  var pts = [[w[0].p[0], w[0].p[1], 8]].concat(w.map(function (a) { return a.p; }));
  var segs = [], t = 0, i;
  for (i = 0; i < pts.length - 1; i++) { segs.push({ a: pts[i], b: pts[i + 1], t0: t, d: DSEG }); t += DSEG; if (w[i] && w[i].dwell && i > 0) t += w[i].dwell; }
  var last = pts[pts.length - 1];
  var dropA = [494 + 12, binY[binIdx], 44], dropB = [494 + 12, binY[binIdx], zEnd];
  segs.push({ a: last, b: dropA, t0: t, d: .35 }); t += .35;
  segs.push({ a: dropA, b: dropB, t0: t, d: .25 }); t += .25;
  for (i = 0; i < segs.length; i++) { var sg = segs[i]; if (s < sg.t0 + sg.d) { var f = I.clamp((s - sg.t0) / sg.d); f = f * f * (3 - 2 * f); return { p: [I.lerp(sg.a[0], sg.b[0], f), I.lerp(sg.a[1], sg.b[1], f), I.lerp(sg.a[2], sg.b[2], f)], total: t }; } }
  return { p: null, total: t };
}
function frame(t) {
  sc.clear(dyn); sc.clear(linkG);
  var mode = modeAt(t), items = [], tilePath = [[506, 0, 22], [600, 0, 22], [626, 0, 22], [640, 0, 9], [722, 0, 9], [798, 0, 9], [866, 0, 9]];
  /* liên kết vô tuyến của cây hiện tại */
  linksOf(mode).forEach(function (l) {
    var a = N.L[l[0]], b = node(l[1]), pp = [], u;
    for (u = 0; u <= 12; u++) { var f = u / 12; pp.push([I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 44 + 14 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  });
  modeTxt.textContent = mode === 1 ? 'đang hiện: 1 chặng' : 'đang hiện: 3 chặng';
  var scr = -1, scrA = 0, mwOn = false, newest = -1e9;
  for (var i = 0; i < 3; i++) {
    var n0 = Math.floor((t - i * STAG) / PERIOD);
    for (var nn = n0 - 3; nn <= n0; nn++) {
      var ts = i * STAG + nn * PERIOD; if (ts < 0) continue;
      var lt = t - ts, fm = modeAt(ts), g = nn * 3 + i, bi = g % 4, hops = fm === 1 ? 1 : i + 1;
      var T1 = .5 * (hops + 1) + .12 * (hops - 1) + .6, arr = 4 * .25 + T1;      /* chunk cuối tới nơi */
      var done = false, got = 0;
      for (var k = 0; k < 5; k++) {
        var s = lt - k * .25; if (s < 0) continue;
        var r = travel(wps(i, fm, k), s, bi, 20 + 4.2 * k);
        if (r.p) items.push({ x: r.p[0] - 4.5, y: r.p[1] - 4.5, z: r.p[2], w: 9, d: 9, h: 9, t: I.LEAF[i] });
        else { got++; items.push({ x: 494 + 12 - 7, y: binY[bi] - 6, z: 19.6 + k * 4.4, w: 14, d: 12, h: 4, t: I.LEAF[i] }); }
      }
      var td = arr + .1;
      if (lt >= td && lt < td + 3.4) {
        var p = (lt - td) / 3.4, q = I.along(tilePath, p);
        if (q[0] >= 722 && q[0] <= 798) mwOn = true;
        else items.push({ x: q[0] - 9, y: -9, z: q[2], w: 18, d: 18, h: 4, t: I.LEAF[i] });
      }
      if (lt >= td + 3.4 && ts > newest) { newest = ts; scr = i; scrA = I.clamp((lt - td - 3.4) / .25); }
    }
  }
  for (var j = 0; j < 3; j++) {
    items.push({ x: 630 + ((t * 60 + j * 28) % 82) - 3, y: -1.5, z: 3, w: 6, d: 3, h: 3, t: T.red });
    items.push({ x: 798 + ((t * 50 + j * 20) % 60) - 2, y: -1.5, z: 3, w: 4, d: 3, h: 3, t: T.red });
  }
  if (mwOn) items.push({ x: 758, y: -6, z: 51, w: 14, d: 12, h: 2.5, t: T.red });
  sc.items(dyn, items);
  var g = I.el('g', { transform: cellMat }, dyn);
  I.el('rect', { x: 7, y: 7, width: 106, height: 70, fill: '#1d2a25' }, g);
  I.el('rect', { x: 11, y: 12, width: 52, height: 60, fill: scr >= 0 ? ['#ffb27a', '#9dbfee', '#c3dc7a'][scr] : '#3b4a43', opacity: scr >= 0 ? .4 + .6 * scrA : .5 }, g);
  for (var k2 = 0; k2 < 6; k2++) I.el('rect', { x: 11, y: 15 + k2 * 9.4, width: 52, height: 1.6, fill: '#1d2a25', opacity: .35 }, g);
  [[70, 32], [80, 48], [90, 26], [100, 40]].forEach(function (b, n) { I.el('rect', { x: b[0], y: 12, width: 7, height: b[1] * (.6 + .4 * Math.sin(t * 2 + n)), fill: '#7fd4a8' }, g); });
}
Deck.frames.s7 = frame;

})();
/* 08-phan-cung.js */
;(function(){
/* Slide 8: chuỗi nguồn Leaf — pin 18650 -> đế pin -> (tụ 470 µF song song tại chân IN) -> mạch tăng áp -> cáp Micro-USB -> ESP32-CAM.
   Xung dòng điện chạy dọc chuỗi; khi phát WiFi (dòng đỉnh) điện áp trên màn hình đo bị sụt nếu không có tụ, có tụ thì giữ ổn định. */
var svg = document.getElementById('s8fig'), I = window.Iso, T = I.T;
var AZ = 8, EL = 30, RAD = Math.PI / 180, CE = Math.cos(EL * RAD), SE = Math.sin(EL * RAD);
var GOLD = { top: '#ffd75e', y: '#e8a920', x: '#b9830f' };
var BRIGHT = { top: '#fff3c4', y: '#ffd75e', x: '#e0a92a' };
var METAL = { top: '#d6d2c4', y: '#aaa696', x: '#8c8878' };
var sc = I.scene(svg, { az: AZ, el: EL, rect: [4, 40, 1128, 190],
  pts: [[-20, -56, -8], [810, -56, -8], [-20, 56, -8], [810, 56, -8], [715, 0, 112], [10, 0, 40]] });
var P = sc.pt;
function tx(g, x, y, str, size, w, anchor, fill, cls) { var e = sc.text(g, x, y, str, size, w, anchor, fill, cls); e.style.fill = fill; return e; }
var plateG = sc.g(), objG = sc.g(), cableG = sc.g(), objG2 = sc.g(), dyn = sc.g();

/* ---- trạng thái bước (static = hiện đủ) ---- */
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
Deck.steps.s8 = function (n) {
  cur = n;
  Array.prototype.forEach.call(document.querySelectorAll('#s8 .cd'), function (c, i) { c.classList.toggle('on', n === i + 1 && ST() < 9); });
};

/* ---- xi lanh nằm ngang (trục dọc theo x): cell 18650 ---- */
function hcyl(g, x0, yc, zc, len, r, lo, hi, endc) {
  var N = 30, i, a0, a1, am, ny, nz, lum, col, y0, z0, y1, z1, e = [];
  for (i = 0; i < N; i++) {
    a0 = i / N * 2 * Math.PI; a1 = (i + 1) / N * 2 * Math.PI; am = (a0 + a1) / 2; ny = Math.cos(am); nz = Math.sin(am);
    if (ny * sc.C * CE + nz * SE <= 0) continue;
    lum = I.clamp(.5 + .5 * (ny * .4 + nz * .85)); col = I.mix(lo, hi, lum);
    y0 = yc + r * Math.cos(a0); z0 = zc + r * Math.sin(a0); y1 = yc + r * Math.cos(a1); z1 = zc + r * Math.sin(a1);
    sc.poly(g, [P(x0, y0, z0), P(x0 + len, y0, z0), P(x0 + len, y1, z1), P(x0, y1, z1)], col, col, .6);
  }
  for (i = 0; i < N; i++) { a0 = i / N * 2 * Math.PI; e.push(P(x0 + len, yc + r * Math.cos(a0), zc + r * Math.sin(a0))); }
  sc.poly(g, e, endc);
}
function ring(g, x0, y0, x1, y1, z, col, w, op) {
  var e = sc.path(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], z, col, w); e.setAttribute('opacity', op); return e;
}

/* ---- bàn thí nghiệm ---- */
sc.box(plateG, -20, -56, -8, 830, 112, 8, T.plate);
[[-12, -48], [802, -48], [-12, 48], [802, 48]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2, fill: '#8c8470' }, plateG); });

/* ---- 1. đế pin + cell 18650 (nằm trong đế) ---- */
sc.box(objG, 0, -20, 0, 124, 40, 5, T.dark);
sc.box(objG, 6, -20, 5, 112, 3, 4, T.dark); sc.box(objG, 6, 17, 5, 112, 3, 4, T.dark);
sc.box(objG, 0, -20, 5, 6, 40, 18, T.dark);
hcyl(objG, 6, 0, 17, 112, 12, '#9c9684', '#fbf8f0', '#bdb8a8');           /* thân cell */
hcyl(objG, 36, 0, 17, 36, 12.4, '#1c1b19', '#4e4c44', '#2c2b27');          /* dải nhãn */
hcyl(objG, 100, 0, 17, 18, 12.3, '#8c8878', '#d6d2c4', '#cfcbbd');         /* nắp kim loại cực + */
sc.box(objG, 118, -20, 5, 6, 40, 18, T.dark);                              /* thành phải đế (che đầu cell) */
sc.box(objG, 119, -4, 9, 5, 8, 4, METAL);

/* ---- 2. dây + (đỏ) và − (đen) tới chân IN ---- */
var RAIL = [-12, 12];
sc.path(cableG, [[124, RAIL[0], 11], [134, RAIL[0], 3], [210, RAIL[0], 3]], 3, '#c43a2a', 3.2);
sc.path(cableG, [[124, RAIL[1], 11], [134, RAIL[1], 3], [210, RAIL[1], 3]], 3, '#1f1e1b', 3.2);

/* ---- 3. tụ 470 µF: trụ nhỏ đứng giữa hai dây, chân nối song song tại chân IN ---- */
var CAP = [162, 0];
sc.cyl(objG, CAP[0], CAP[1], 0, 34, 10, '#16213c', '#5878b4', '#8b887c');
sc.cyl(objG, CAP[0], CAP[1], 27, 3.4, 10.4, '#b68a1e', '#f0c859', '#d9b44a');
sc.line(objG, [CAP[0] - 6, CAP[1], 34.2], [CAP[0] + 6, CAP[1], 34.2], '#4a4840', 1.2);
sc.line(objG, [CAP[0], CAP[1] - 6, 34.2], [CAP[0], CAP[1] + 6, 34.2], '#4a4840', 1.2);
sc.line(objG, [CAP[0], CAP[1] - 9, 1.5], [CAP[0], RAIL[0], 3], '#8c8878', 1.6);
sc.line(objG, [CAP[0], CAP[1] + 9, 1.5], [CAP[0], RAIL[1], 3], '#8c8878', 1.6);
[RAIL[0], RAIL[1]].forEach(function (y) { var q = P(CAP[0], y, 3.2); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.6, fill: '#cfcbbd', stroke: '#4a4840', 'stroke-width': .6 }, objG); });

/* ---- 4. module tăng áp 0,9–5 V -> 5 V USB ---- */
sc.box(objG, 206, -28, 0, 100, 56, 4, T.pcb);
sc.box(objG, 206, RAIL[0] - 4, 4, 9, 8, 1.6, GOLD); sc.box(objG, 206, RAIL[1] - 4, 4, 9, 8, 1.6, GOLD);   /* chân IN+ / IN− */
sc.path(objG, [[215, RAIL[0]], [228, RAIL[0]], [228, 0], [294, 0]], 4.1, '#c9a24a', 1.8);
sc.path(objG, [[215, RAIL[1]], [228, RAIL[1]], [228, 22], [276, 22]], 4.1, '#c9a24a', 1.4);
sc.box(objG, 240, 6, 4, 26, 22, 14, T.dark);                                 /* cuộn cảm */
sc.box(objG, 244, 10, 18, 18, 14, 0.6, T.chip);
sc.box(objG, 252, -20, 4, 18, 14, 3, T.chip);                                /* IC tăng áp */
sc.cyl(objG, 282, -16, 4, 14, 6.5, '#3b3a35', '#6d6b62', '#8b887c');         /* tụ lọc ra */
sc.box(objG, 292, -9, 4, 22, 18, 11, METAL);                                 /* cổng USB-A cái */
sc.box(objG, 313.2, -6, 6, 1.2, 12, 5, T.dark);

/* ---- 5. cáp Micro-USB: phích A -> dây -> phích micro ---- */
sc.box(objG2, 314, -7, 5, 14, 14, 9, METAL); sc.box(objG2, 328, -8, 4, 20, 16, 11, T.dark);
var CABLE = [[348, 0, 9], [366, 0, 4.5], [388, 15, 3.5], [414, 12, 3.5], [436, 0, 5], [452, 0, 9]];
sc.path(cableG, CABLE, 0, '#15140f', 5.4);
sc.path(cableG, CABLE, 0, '#4a4840', 1.2);
sc.box(objG2, 450, -6, 5, 20, 12, 7, T.dark); sc.box(objG2, 466, -4, 6, 6, 8, 4, METAL);

/* ---- 6. board ESP32-CAM-MB (OV3660) ---- */
sc.box(objG2, 470, -30, 0, 120, 60, 5, T.pcb);
sc.box(objG2, 476, 22, 5, 5, 4, 2, { top: '#7ee0a8', y: '#2f9f64', x: '#23794c' });                 /* LED nguồn */
sc.box(objG2, 484, -24, 5, 100, 48, 3, { top: '#3d3c37', y: '#2a2926', x: '#1d1c19' });
sc.box(objG2, 494, -12, 8, 26, 24, 4, T.chip);
sc.box(objG2, 500, -6, 12, 14, 12, 1, T.dark);
var zz = []; for (var k = 0; k < 8; k++) zz.push(P(490 + k * 3.4, 17 - (k % 2) * 6, 8.2));
I.el('polyline', { points: zz.map(function (a) { return a[0].toFixed(1) + ',' + a[1].toFixed(1); }).join(' '), fill: 'none', stroke: '#c7c2b2', 'stroke-width': 1.2 }, objG2);
sc.box(objG2, 546, -11, 8, 26, 22, 11, T.dark);                               /* thân camera */
sc.cyl(objG2, 561, 0, 19, 3, 9, '#222', '#555', '#101010');
sc.cyl(objG2, 561, 0, 22, 2, 5.5, '#0c1230', '#243c88', '#16265a');
sc.box(objG2, 572, 12, 8, 7, 7, 3, T.white);                                  /* đèn flash */

/* ---- 7. màn hình đo điện áp (thấy ở bước 2) ---- */
var SCR = { x: 640, w: 150, z: 28, h: 80 };
sc.box(objG2, 690, -24, 0, 52, 44, 5, T.stone);
sc.box(objG2, 710, -6, 5, 12, 12, 24, T.stone);
sc.box(objG2, SCR.x, -5, SCR.z, SCR.w, 10, SCR.h, T.dark);

/* ---- nhãn: lead-in, chú thích dưới vật, thẻ + đường dẫn ---- */
(function () {
  var strip = svg.parentNode;
  function put(sel, wx, wy, wz, dy, w) {
    var el = strip.querySelector(sel), p = P(wx, wy, wz);
    el.style.left = p[0].toFixed(1) + 'px'; el.style.top = (p[1] + dy).toFixed(1) + 'px'; if (w) { el.style.width = w + 'px'; el.style.whiteSpace = 'normal'; }
  }
  put('.lg1', 80, 0, 30, -28, 180);
  put('.lg2', 56, 56, -8, 6);
  put('.lg3', 256, 56, -8, 6, 142);
  put('.lg4', 400, 56, -8, 6);
  put('.lg5', 530, 56, -8, 6);
  put('.lg6', 140, 56, -8, 6, 150);
})();

/* ---- mô hình thời gian: các đợt phát WiFi (dòng đỉnh) ---- */
var PER = 3.6, B0 = 2.2, BLEN = .8;
function burstRel(t) { return (((t - B0) % PER) + PER) % PER; }          /* giây kể từ lúc bắt đầu đợt phát gần nhất */
function dip(rel) {                                                        /* mức sụt áp 0..1 khi không có tụ */
  if (rel < BLEN) return (1 - Math.exp(-rel / .04)) * (1 + .07 * Math.sin(rel * 47));
  return Math.exp(-(rel - BLEN) / .16);
}
var PATH = [[126, RAIL[0], 11], [136, RAIL[0], 3], [208, RAIL[0], 3], [214, RAIL[0], 6.4], [228, RAIL[0], 6.4], [228, 0, 6.4], [294, 0, 6.4],
  [302, 0, 14], [314, 0, 11], [348, 0, 12], [366, 0, 8], [388, 15, 7], [414, 12, 7], [436, 0, 8.5], [456, 0, 11], [476, 0, 12], [496, 0, 13.5]];
var PLEN = 0; (function () { for (var i = 0; i < PATH.length - 1; i++) PLEN += Math.hypot(PATH[i + 1][0] - PATH[i][0], PATH[i + 1][1] - PATH[i][1], PATH[i + 1][2] - PATH[i][2]); })();
var OUT = PATH.slice(8), OLEN = 0; (function () { for (var i = 0; i < OUT.length - 1; i++) OLEN += Math.hypot(OUT[i + 1][0] - OUT[i][0], OUT[i + 1][1] - OUT[i][1], OUT[i + 1][2] - OUT[i][2]); })();                                                    /* từ cổng USB tới board */
var CAPP = [[CAP[0], RAIL[0], 3.4], [208, RAIL[0], 3.4]];                   /* tụ xả vào chân IN */
function cube(items, q, s, tt) { items.push({ x: q[0] - s / 2, y: q[1] - s / 2, z: q[2], w: s, d: s, h: s, t: tt }); }

function frame(t) {
  var step = ST();
  sc.clear(dyn);
  var items = [], i, k;
  /* xung dòng điện đều dọc chuỗi */
  var n = 15, spd = 80 / PLEN;
  for (i = 0; i < n; i++) {
    var s = ((t * spd + i / n) % 1), e = Math.min(1, s / .03, (1 - s) / .03);
    cube(items, I.along(PATH, s), 4.6 * e, GOLD);
  }
  /* các đợt dòng đỉnh: pin + tụ cùng cấp (tụ xả vào chân IN), cụm xung nhanh ra board */
  var rel = burstRel(t), b0 = t - rel;
  for (var bb = 0; bb < 2; bb++) {
    var bs = b0 - bb * PER;
    for (k = 0; k < 9; k++) {
      var lt = t - (bs + k * .085);
      if (lt >= 0) {
        var f = lt * 330 / OLEN; if (f < 1) cube(items, I.along(OUT, f), 6, BRIGHT);
        var f2 = lt * 190 / 46; if (step >= 2 && f2 < 1) cube(items, I.along(CAPP, f2), 5, BRIGHT);
      }
    }
  }
  sc.items(dyn, items);

  /* sóng WiFi phát từ board */
  for (var bb2 = 0; bb2 < 2; bb2++) {
    var bs2 = b0 - bb2 * PER;
    for (k = 0; k < 4; k++) {
      var tr = t - (bs2 + k * .2);
      if (tr >= 0 && tr < 1) { var c = sc.circle(dyn, 561, 0, 30, 10 + 62 * tr, 40, 'none', '#d9432b', 2); c.setAttribute('stroke-opacity', (.9 * (1 - tr)).toFixed(2)); }
    }
  }
  /* đèn nguồn board nháy khi phát */
  if (rel < BLEN) sc.box(dyn, 476, 22, 7, 5, 4, 2, { top: '#e9ffe9', y: '#7ee0a8', x: '#4fb77f' });

  /* vòng nhấn: mạch tăng áp (thẻ 1), tụ (thẻ 2) */
  var pulse = .65 + .35 * Math.sin(t * 4);
  if (step >= 1) ring(dyn, 198, -36, 318, 36, .4, '#d9432b', 2.6, pulse.toFixed(2));
  if (step >= 2) sc.circle(dyn, CAP[0], CAP[1], .4, 19 + 2 * Math.sin(t * 4), 28, 'none', '#b86a00', 2.6);
  /* màn hình đo: điện áp 5 V khi phát WiFi (đường xanh: giữ ổn định nhờ tụ; đường đỏ nét đứt: sụt áp, hiện ở bước 2) */
  var M = sc.faceMatrix(SCR.x, 5, SCR.z), g = I.el('g', { transform: M + ' translate(0,' + SCR.h + ') scale(1,-1)' }, dyn);
  I.el('rect', { x: 5, y: 5, width: SCR.w - 10, height: SCR.h - 10, fill: '#1d2a25' }, g);
  I.el('line', { x1: 8, y1: 28, x2: SCR.w - 8, y2: 28, stroke: '#6f8379', 'stroke-width': .7, 'stroke-dasharray': '3 3' }, g);
  var FS = Math.ceil(14 / (0.96 * sc.K) * 10) / 10;
  tx(g, 9, 21, '5 V', FS, 500, 'start', '#cfc8b6', 'mo');
  var W0 = 7.2, u0 = 10, u1 = SCR.w - 10, pa = [], pb = [], tt;
  for (i = 0; i <= 90; i++) {
    tt = t - W0 + W0 * i / 90; var u = u0 + (u1 - u0) * i / 90, d = dip(burstRel(tt));
    pa.push(u.toFixed(1) + ',' + (28 + 30 * d).toFixed(1)); pb.push(u.toFixed(1) + ',' + (28 + 2.4 * d + .5 * Math.sin(tt * 9)).toFixed(1));
  }
  if (step >= 2) {
    I.el('polyline', { points: pa.join(' '), fill: 'none', stroke: '#ff8a70', 'stroke-width': 1.5, 'stroke-dasharray': '4 2.5', 'stroke-linejoin': 'round' }, g);
    tx(g, 9, SCR.h - 6, 'sụt áp', FS, 500, 'start', '#ff8a70', 'mo');
  }
  I.el('polyline', { points: pb.join(' '), fill: 'none', stroke: '#7fd4a8', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
  tx(g, 70, SCR.h - 6, 'Tụ 470 µF', FS, 500, 'start', '#7fd4a8', 'mo');
  /* tụ nhấp nháy khi xả */
  if (step >= 2 && rel < BLEN + .3) { var gl = sc.circle(dyn, CAP[0], CAP[1], 34.4, 7.5, 24, '#ffd75e', 'none', 0); gl.setAttribute('opacity', (.9 * dip(rel)).toFixed(2)); }
}
Deck.frames.s8 = frame;

})();
/* 09-goi-tin.js */
;(function(){
/* Slide 9: một khung JPEG (tấm phẳng có hình) bị cắt thành chunk; mỗi chunk gắn header 16 B (6 trường, tỉ lệ 4:2:2:2:2:4)
   + payload; chunk đi qua mesh tới Root, Root dựa vào chunk_index ghép lại đúng chỗ. Số chunk trên hình chỉ để minh họa.
   Lưu ý: các lát cắt vẽ theo thứ tự đọc của ảnh (chunk 0 = phần đầu của khung). */
var svg = document.getElementById('s9fig'), I = window.Iso, T = I.T;
var H = 287;
var sc = I.scene(svg, { az: 6, el: 40, rect: [4, 4, 1128, H - 36],
  pts: [[-20, -60, -8], [682, -60, -8], [-20, 60, -8], [682, 60, -8], [640, 0, 66], [40, 0, 66]] });
var P = sc.pt, S = sc.S, C = sc.C;
function tx(g, x, y, str, size, w, anchor, fill, cls) { var e = sc.text(g, x, y, str, size, w, anchor, fill, cls); e.style.fill = fill; return e; }
var plateG = sc.g(), objG = sc.g(), linkG = sc.g(), dyn = sc.g(), lbG = sc.g();

/* ---- trạng thái bước ---- */
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
Deck.steps.s9 = function (n) {
  cur = n;
  var w = document.querySelector('#s9 .hdr .f.w'); if (w) w.classList.toggle('pulse', ST() === 3);
};

/* ---- cảnh tĩnh ---- */
var AMBER = { top: '#f2b24a', y: '#c98a1c', x: '#a06b10' };
sc.box(plateG, -20, -60, -8, 702, 120, 8, T.plate);
/* Leaf (nguồn khung) */
sc.box(objG, 0, -30, 0, 76, 60, 6, T.pcb);
sc.box(objG, 6, -22, 6, 22, 18, 3, T.chip);
var zz = []; for (var k = 0; k < 8; k++) zz.push(P(8 + k * 3.4, 22 - (k % 2) * 6, 6.2));
I.el('polyline', { points: zz.map(function (a) { return a[0].toFixed(1) + ',' + a[1].toFixed(1); }).join(' '), fill: 'none', stroke: '#c7c2b2', 'stroke-width': 1.2 }, objG);
sc.cyl(objG, 54, 0, 6, 12, 14, '#3b3a35', '#6d6b62', '#8b887c');
sc.cyl(objG, 54, 0, 18, 2.4, 9.5, '#222', '#444', '#101010');
sc.box(objG, 70, -3, 6, 3, 3, 14, T.dark);                             /* cột ăng-ten */
/* ray của lưỡi cắt + khay chụp (nơi khung hiện ra) */
sc.box(objG, 90, -62, 0, 176, 4, 3, T.dark); sc.box(objG, 90, 58, 0, 176, 4, 3, T.dark);
sc.box(objG, 96, -52, 0, 160, 104, .8, T.stone);
/* Root: bo mạch + khay ghép 5 ô */
sc.box(objG, 440, -60, 0, 222, 120, 10, T.pcb);
sc.box(objG, 446, -26, 10, 14, 30, 4, T.chip);
sc.box(objG, 466, -54, 10, 178, 108, 3, T.stone);
sc.box(objG, 480, -48, 13, 150, 96, 1.2, T.dark);
for (var s0 = 1; s0 < 5; s0++) sc.line(objG, [480 + 30 * s0, -48, 14.4], [480 + 30 * s0, 48, 14.4], 'rgba(240,230,205,.35)', 1);
sc.box(objG, 652, -12, 10, 14, 24, 9, T.chip);                           /* cổng USB */
sc.box(objG, 450, 50, 10, 5, 5, 3, { top: '#4a4a44', y: '#34342f', x: '#26261f' });   /* đèn báo đủ khung (tắt) */
sc.box(objG, 456, -4, 10, 3, 3, 14, T.dark);                           /* cột ăng-ten Root */
/* nhãn tên node */
(function () {
  var a = P(38, 60, -8), b = P(550, 60, -8);
  tx(lbG, a[0], a[1] + 22, 'Leaf', 22, 700, 'middle', '#1c1b19', 'sf');
  tx(lbG, b[0], b[1] + 22, 'Root', 22, 700, 'middle', '#1c1b19', 'sf');
})();

/* ---- ảnh minh họa: lưới ô như khối JPEG; p = ngang, q = từ đầu (trên) xuống dưới ---- */
function pic(p, q) {
  var c;
  if (q < .58) c = I.mix('#86aee6', '#dbe7f2', q / .58); else c = '#9bb54a';
  var dx = p - .7, dy = (q - .2) * 1.25;
  if (dx * dx + dy * dy < .016) c = '#ff9a52';
  if (q > .48 + .07 * Math.sin(p * 6.5 + .5)) c = '#7c9a28';
  if (q > .70 + .05 * Math.sin(p * 9 + 1)) c = '#5e7a1c';
  if (p > .22 && p < .38 && q > .74 && q < .9) c = '#2c2b27';
  if (p > .27 && p < .33 && q > .66 && q <= .74) c = '#2c2b27';
  return c;
}
var NS = 5, W = 30, D = 96, Y0 = -48, XP = 250, HL = 12, HT = 5, PT = 5;
var CELL = [24, 12, 12, 12, 12, 24], HC = [null, '#fbf8f0', '#e6dfcd', '#fbf8f0', '#e6dfcd', '#f2b24a'];
function strip(g, k, x, z, glow) {                       /* lát cắt k (chunk k): hộp mỏng + ô ảnh */
  sc.box(g, x, Y0, z, W, D, PT, T.white);
  for (var j = 0; j < 2; j++) for (var i = 0; i < 8; i++) {
    var q = k / NS + (1 - j) * .1 + .05, p = (i + .5) / 8, xs = x + j * 15, ys = Y0 + i * 12;
    sc.poly(g, [P(xs, ys, z + PT), P(xs + 15, ys, z + PT), P(xs + 15, ys + 12, z + PT), P(xs, ys + 12, z + PT)], pic(p, q), 'rgba(28,27,25,.13)', .5);
  }
}
function header(g, x, z, glow) {                          /* header 16 B: 6 ô theo tỉ lệ 4:2:2:2:2:4 */
  sc.box(g, x, Y0, z, HL, D, HT, T.white);
  var y = Y0;
  for (var i = 0; i < 6; i++) {
    var col = i === 0 ? I.LEAF[0].top : HC[i];
    if (i === 5 && glow) col = I.mix('#f2b24a', '#fff1c4', glow);
    sc.poly(g, [P(x, y, z + HT), P(x + HL, y, z + HT), P(x + HL, y + CELL[i] * D / 96, z + HT), P(x, y + CELL[i] * D / 96, z + HT)], col, '#1c1b19', .8);
    y += CELL[i] * D / 96;
  }
}

/* ---- mô hình thời gian (chu kỳ 12 s) ---- */
var PER = 12, CUT = [1.0, 1.6, 2.2, 2.8, 3.2], DUR = [3.0, 3.0, 3.9, 3.0, 3.0], ZF = [36, 36, 36, 52, 36];
var X0 = [], SLOT = [];
for (var kk = 0; kk < NS; kk++) { X0.push(XP - W * (kk + 1)); SLOT.push(630 - W * (kk + 1)); }
function launch(k) { return CUT[k] + .8; }
function arrive(k) { return launch(k) + DUR[k]; }
function ease(u) { u = I.clamp(u); return u * u * (3 - 2 * u); }
var DONE = Math.max.apply(null, [0, 1, 2, 3, 4].map(arrive));
function bladeX(t) {                                   /* lưỡi cắt quét từ đầu khung (x lớn) về cuối */
  var kx = [[.5, 262], [CUT[0], 220], [CUT[1], 190], [CUT[2], 160], [CUT[3], 130], [CUT[4], 100], [4.4, 100], [5.2, 262]];
  for (var i = 0; i < kx.length - 1; i++) if (t < kx[i + 1][0]) return I.lerp(kx[i][1], kx[i + 1][1], I.clamp((t - kx[i][0]) / (kx[i + 1][0] - kx[i][0])));
  return 262;
}

function frame(t) {
  var step = ST();
  t = ((t % PER) + PER) % PER;
  sc.clear(dyn); sc.clear(linkG);
  var dr = [];                                          /* các vật động, sắp theo độ sâu */
  function add(x, y, z, w, d, fn, op) { dr.push({ key: (x + w / 2) * S + (y + d / 2) * C + z * .0001, fn: fn, op: op }); }
  var glow = step === 3 ? .5 + .5 * Math.sin(t * 6) : 0;
  var fin = ease(t / .5), fout = t > 11.3 ? 1 - ease((t - 11.3) / .6) : 1;   /* khung mới hiện; Root xóa khung cũ */
  var landed = 0, cruise = [];

  /* liên kết mesh (đường đứt) */
  var lp = [[68, 0, 20], [96, 0, 27], [250, 0, 28], [400, 0, 28], [450, 0, 22], [458, 0, 17]];
  var lk = sc.path(linkG, lp, 0, step === 2 ? '#d9432b' : 'rgba(217,67,43,.75)', step === 2 ? 3 : 1.8); lk.setAttribute('stroke-dasharray', '5 5'); lk.setAttribute('stroke-dashoffset', (-t * 22) % 10);

  for (var k = 0; k < NS; k++) {
    var ct = CUT[k], la = launch(k), ar = arrive(k), x, z, hz, hop = 0, showH = false, onRoot = false, pk = null;
    if (t < ct) { x = X0[k]; z = 0; }                     /* còn nằm trên khay chụp */
    else if (t < la) { x = X0[k] + 8 * ease((t - ct) / .3); z = 0; showH = t > ct + .25; hz = 24 * (1 - ease((t - ct - .25) / .3)); }
    else if (t < ar) {
      var u1 = (t - la) / .35, cr0 = la + .35, cr1 = ar - .7;
      showH = true; hz = 0;
      if (t < cr0) { x = X0[k] + 8; z = ZF[k] * ease(u1); }
      else if (t < cr1) { x = I.lerp(X0[k] + 8, SLOT[k], ease((t - cr0) / (cr1 - cr0))); z = ZF[k]; cruise.push({ x: x, z: z }); pk = { x: x, z: z }; }
      else { x = SLOT[k]; z = I.lerp(ZF[k], 14.4, ease((t - (ar - .35)) / .35)) ; if (t < ar - .35) z = ZF[k]; }
      if (t >= cr1 - .05) {                                /* header bị Root đọc rồi bỏ đi */
        var pu = (t - (cr1 - .05)) / .3; if (pu >= 1) showH = false; else hop = pu;
      }
    } else { x = SLOT[k]; z = 14.4; onRoot = true; landed++; }
    var xs = x, zs = z;
    if (onRoot) { add(xs, Y0, zs, W, D, (function (xx, zz2, kq) { return function (g) { strip(g, kq, xx, zz2); }; })(xs, zs, k), fout); }
    else add(xs, Y0, zs, W, D, (function (xx, zz2, kq) { return function (g) { strip(g, kq, xx, zz2); }; })(xs, zs, k), t < ct ? fin : 1);
    if (showH && !onRoot) {
      var hxx = xs + W, hzz = zs + (hz || 0) + 16 * hop, hop2 = hop;
      add(hxx, Y0, hzz, HL, D, (function (xx, zz2, gl) { return function (g) { header(g, xx, zz2, gl); }; })(hxx, hzz, glow), 1 - hop2);
    }
  }
  dr.sort(function (a, b) { return a.key - b.key; });
  dr.forEach(function (o) { var g = I.el('g', {}, dyn); if (o.op < 1) g.setAttribute('opacity', o.op.toFixed(2)); o.fn(g); });

  /* lưỡi cắt: cổng trượt trên hai ray (xanh lá ở bước 4: phân mảnh tự viết ở tầng ứng dụng) */
  if (t < 5.2) {
    var bx = bladeX(t), g4 = step === 4, bt = g4 ? { top: '#6fcf9f', y: '#1b7f5c', x: '#12583f' } : T.dark;
    var gb = I.el('g', { opacity: (t < .5 ? fin : I.clamp(1 - (t - 4.6) / .6)).toFixed(2) }, dyn);
    sc.box(gb, bx - 3, -60, 3, 6, 6, 40, bt);
    sc.poly(gb, [P(bx, -54, 3), P(bx, 54, 3), P(bx, 54, 36), P(bx, -54, 36)], g4 ? 'rgba(27,127,92,.22)' : 'rgba(28,27,25,.14)', g4 ? '#1b7f5c' : '#1c1b19', 1.2);
    sc.box(gb, bx - 3, 54, 3, 6, 6, 40, bt);
    sc.box(gb, bx - 3, -60, 41, 6, 120, 4, bt);
  }

  /* đèn báo Root: sáng khi đủ khung */
  if (landed === NS && t < 11.3) sc.box(dyn, 450, 50, 10, 5, 5, 3, { top: '#e9ffe9', y: '#7ee0a8', x: '#4fb77f' });

  /* nhãn header/payload đi theo chunk đang bay gần giữa đường */
  if (cruise.length) {
    cruise.sort(function (a, b) { return Math.abs(a.x - 330) - Math.abs(b.x - 330); });
    var c = cruise[0], pp = P(c.x + W / 2, 0, c.z + PT), hp = P(c.x + W + HL / 2, 0, c.z + PT);
    function lab(px, py, dx, dy, s) {
      I.el('line', { x1: px.toFixed(1), y1: (py - 3).toFixed(1), x2: (px + dx).toFixed(1), y2: (py + dy + 6).toFixed(1), stroke: '#1c1b19', 'stroke-width': 1 }, dyn);
      I.el('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 2.4, fill: '#1c1b19' }, dyn);
      tx(dyn, px + dx, py + dy, s, 14, 500, 'middle', '#1c1b19', 'mo');
    }
    lab(pp[0], pp[1], -28, -30, 'payload');
    lab(hp[0], hp[1], 26, -48, 'header');
  }
}
Deck.frames.s9 = frame;

})();
/* 10-firmware.js */
;(function(){
/* Slide 10: firmware.
   A (Leaf): gửi lệch pha — 3 khe × 200 ms trong chu kỳ 600 ms, mỗi Leaf một khe; con trỏ thời gian quét qua 3 khe.
   B (Leaf): watchdog — mất beacon #ROOT: mức dâng, mốc 8 s học lại Root, mốc 30 s khởi động lại (vẽ đúng tỉ lệ 8:30).
   C (Root): 4 slot ghép — bitmap chunk, cầu chì timeout 2 s, supersede, LRU.
   Thời gian trong A và C được kéo dài 3 lần so với thực tế để nhìn được (cùng một đồng hồ); B chạy nhanh hơn thực tế. */
var I = window.Iso, T = I.T, LEAF = I.LEAF;
function txt(g, x, y, s, size, w, anchor, fill, cls) {
  var e = I.el('text', { x: x.toFixed(1), y: y.toFixed(1), 'font-size': size, 'font-weight': w || 400, 'text-anchor': anchor || 'middle', class: cls || '' }, g);
  e.style.fill = fill; e.textContent = s; return e;
}
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
Deck.steps.s10 = function (n) { cur = n; };
var AMB = { top: '#f2b24a', y: '#c98a1c', x: '#a06b10' };
var RED = { top: '#ff9a82', y: '#d9432b', x: '#a8321f' };
var GRY = { top: '#a5a190', y: '#85816f', x: '#6c6859' };
var CZ = [LEAF[0], LEAF[1], LEAF[2]], CZC = ['#ee5f12', '#3f78c4', '#7c9a28'];

/* ======================== mô hình dùng chung (A và C) ======================== */
var CYC = 1.8, ZONE = .6, CK = .12, TFA = .6, TFC = .5, LOOP = 28, FUSE = 6, SHIPW = .2, SHIPD = .8;
var FR = [];
(function () {
  var n, i, f, k, byLeaf = [[], [], []];
  for (n = 0; n < 14; n++) for (i = 0; i < 3; i++) {
    if (i === 2 && n >= 7 && n <= 10) continue;                                   /* Leaf 3 im lặng vài chu kỳ */
    var lost = (i === 1 && n === 3) ? 3 : (i === 2 && n === 6) ? 2 : -1;          /* chunk bị mất */
    f = { leaf: i, n: n, T0: CYC * n + ZONE * i, lost: lost, arr: [] };
    for (k = 0; k < 5; k++) f.arr.push(k === lost ? null : f.T0 + CK * k + TFA + TFC);
    byLeaf[i].push(f); FR.push(f);
  }
  FR.forEach(function (f) {
    var got = f.arr.filter(function (a) { return a != null; });
    f.first = got[0]; f.last = Math.max.apply(null, got);
    if (f.lost < 0) { f.type = 'ok'; f.shipT = f.last + SHIPW; f.endT = f.shipT + SHIPD; }
    else {
      var nx = byLeaf[f.leaf].filter(function (g) { return g.n === f.n + 1; })[0];
      if (nx && nx.first < f.last + FUSE) { f.type = 'sup'; f.endT = nx.first; nx.pred = f; }
      else { f.type = 'to'; f.endT = f.last + FUSE; }
    }
  });
  var busy = [-1, -1, -1, -1], ptr = 0;
  FR.sort(function (a, b) { return a.first - b.first; });
  FR.forEach(function (f) {
    if (f.pred) { f.bin = f.pred.bin; busy[f.bin] = f.endT; return; }
    for (var q = 0; q < 4; q++) { var b = (ptr + q) % 4; if (busy[b] <= f.first - .05) { f.bin = b; ptr = (b + 1) % 4; busy[b] = f.endT; return; } }
    f.bin = ptr;
  });
})();
function sending(i, t) { var n = Math.floor(t / CYC); return FR.some(function (f) { return f.leaf === i && f.n === n; }); }

/* ============================ A: gửi lệch pha ============================ */
var svgA = document.getElementById('s10a');
var sA = I.scene(svgA, { az: 10, el: 38, rect: [2, 4, 312, 138], pts: [[-16, -66, -8], [304, -66, -8], [-16, 66, -8], [304, 66, -8], [150, -38, 44]] });
var A_pl = sA.g(), A_ob = sA.g(), A_dy = sA.g(), A_tx = sA.g();
var ZW = 96, XB = [48, 144, 240], YB = -36;
sA.box(A_pl, -16, -66, -8, 320, 132, 8, T.plate);
function boardA(i) {
  var cx = XB[i], cy = YB;
  sA.box(A_ob, cx - 32, cy - 24, 0, 64, 48, 6, T.pcb);
  sA.box(A_ob, cx - 26, cy - 16, 6, 20, 16, 3, T.chip);
  sA.cyl(A_ob, cx + 16, cy, 6, 10, 12, '#3b3a35', '#6d6b62', '#8b887c');
  sA.cyl(A_ob, cx + 16, cy, 16, 2, 8, '#222', '#444', '#101010');
  sA.box(A_ob, cx - 30, cy + 14, 6, 8, 8, 2.5, CZ[i]);                           /* màu của Leaf */
}
[0, 1, 2].forEach(boardA);
[0, 1, 2].forEach(function (i) { sA.box(A_ob, i * ZW, 26, 0, ZW, 24, 3, CZ[i]); });  /* thước thời gian: 3 khe, mỗi Leaf một khe */
for (var zq = 1; zq < 3; zq++) sA.line(A_ob, [zq * ZW, 26, 3.2], [zq * ZW, 50, 3.2], '#1c1b19', 1.6);
(function () {
  var q, a = sA.pt(2, 66, -8), b = sA.pt(ZW * 3 - 2, 66, -8);
  [0, 1, 2].forEach(function (i) { q = sA.pt(ZW * (i + .5), 66, -8); txt(A_tx, q[0], q[1] + 17, '200 ms', 14, 500, 'middle', '#1c1b19', 'mo'); });
  var d = 'M' + a[0].toFixed(1) + ',' + (a[1] + 26) + 'V' + (a[1] + 32) + 'L' + b[0].toFixed(1) + ',' + (b[1] + 32) + 'V' + (b[1] + 26);
  I.el('path', { d: d, fill: 'none', stroke: '#d9432b', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, A_tx);
  var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 32];
  txt(A_tx, m[0], m[1] + 18, 'chu kỳ 600 ms', 14, 700, 'middle', '#d9432b', 'mo');
})();

function frameA(t) {
  sA.clear(A_dy);
  var items = [], i, k, cyc = ((t % CYC) + CYC) % CYC, cx = ZW * 3 * cyc / CYC, act = Math.floor(cyc / ZONE);
  /* khe đang tới lượt sáng lên */
  var z0 = act * ZW, P = sA.pt;
  sA.poly(A_dy, [P(z0, 26, 3.15), P(z0 + ZW, 26, 3.15), P(z0 + ZW, 50, 3.15), P(z0, 50, 3.15)], 'rgba(255,255,255,.38)', 'none', 0);
  /* con trỏ thời gian */
  items.push({ x: cx - 1.5, y: 22, z: 3, w: 3, d: 32, h: 16, t: T.dark });
  items.push({ x: cx - 4, y: 22, z: 19, w: 8, d: 32, h: 3, t: T.dark });
  /* Leaf đang tới lượt phát: vòng sóng + chunk bay đi */
  for (i = 0; i < 3; i++) {
    if (act === i && sending(i, t)) {
      for (k = 0; k < 3; k++) {
        var u = (((cyc - ZONE * i) / ZONE) * 1.6 - k * .45); u = u - Math.floor(u);
        var c = sA.circle(A_dy, XB[i] + 16, YB, 26, 6 + 24 * u, 28, 'none', CZC[i], 1.8); c.setAttribute('stroke-opacity', (.9 * (1 - u)).toFixed(2));
      }
    }
  }
  FR.forEach(function (f) {
    for (k = 0; k < 5; k++) {
      var lt = t - (f.T0 + CK * k);
      if (lt >= 0 && lt < TFA) {
        var pos = I.along([[XB[f.leaf] + 16, YB, 20], [XB[f.leaf] + 16, YB, 44], [330, YB, 44]], lt / TFA);
        items.push({ x: pos[0] - 4.5, y: pos[1] - 4.5, z: pos[2], w: 9, d: 9, h: 9, t: CZ[f.leaf] });
      }
    }
  });
  sA.items(A_dy, items);
}

/* ============================== B: watchdog ============================== */
var svgB = document.getElementById('s10b');
var sB = I.scene(svgB, { az: 22, el: 32, rect: [4, 14, 100, 150], pts: [[-28, -28, 0], [28, 28, 0], [0, 0, 162], [-36, 20, 0]] });
var B_ob = sB.g(), B_dy = sB.g(), B_tx = sB.g();
var ZS = 5, Z0 = 6;                                         /* 5 đơn vị z cho mỗi giây: mốc 8 s và 30 s đúng tỉ lệ */
function zB(s) { return Z0 + s * ZS; }
sB.box(B_ob, -28, -28, 0, 56, 56, Z0, T.stone);
[[-9, -9], [6, -9], [-9, 6], [6, 6]].forEach(function (p) { sB.box(B_ob, p[0], p[1], Z0, 3, 3, 150, T.dark); });
sB.box(B_ob, -11, -11, Z0 + 150, 22, 22, 3, T.dark);
sB.box(B_ob, 30, -4, 0, 5, 5, 16, T.dark);                  /* cột đèn beacon */
[[0, '0'], [8, '8 s'], [30, '30 s']].forEach(function (m) {   /* thước: vạch và số */
  var a = sB.pt(-12, 12, zB(m[0])), b = sB.pt(-20, 12, zB(m[0]));
  I.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), stroke: '#1c1b19', 'stroke-width': 1.6 }, B_tx);
  txt(B_tx, b[0] - 4, b[1] + 5, m[1], 14, 700, 'end', '#1c1b19', 'mo');
});
(function () {
  var q = sB.pt(0, 28, 0); txt(B_tx, q[0] + 24, q[1] + 22, '#ROOT', 14, 700, 'middle', '#1c1b19', 'mo');
})();
var LG = 20;
function frameB(t) {
  sB.clear(B_dy);
  var g = ((t % LG) + LG) % LG, s = 0, alive = true, boot = 0, k;
  if (g < 4) { s = 0; }
  else if (g < 16) { s = (g - 4) * 2.5; alive = false; }
  else if (g < 18) { s = 30; alive = false; boot = (g - 16) / 2; }
  else { s = 0; }
  if (g >= 16 && g < 18) s = 30;
  var lvC = s >= 30 ? RED : s >= 8 ? AMB : T.green;
  if (s > 0) sB.box(B_dy, -6, -6, Z0, 12, 12, s * ZS, lvC);
  /* cờ ở hai mốc (sáng khi mức chạm mốc) */
  var f1 = s >= 8, f2 = s >= 30;
  sB.box(B_dy, 8, -8, zB(8) - 1.5, 22, 16, 3, f1 ? AMB : { top: '#e4dcc7', y: '#cfc7b0', x: '#bdb59d' });
  sB.box(B_dy, 8, -8, zB(30) - 1.5, 22, 16, 3, f2 ? RED : { top: '#e4dcc7', y: '#cfc7b0', x: '#bdb59d' });
  var a = sB.pt(32, 0, zB(8) + 4), b = sB.pt(32, 0, zB(30) + 4);
  txt(B_dy, a[0] + 4, a[1] + 5, 'học lại Root', 14, f1 ? 700 : 500, 'start', f1 ? '#b86a00' : '#645f52', 'mo');
  txt(B_dy, b[0] + 4, b[1] + 5, 'khởi động lại', 14, f2 ? 700 : 500, 'start', f2 ? '#d9432b' : '#645f52', 'mo');
  /* đèn beacon #ROOT: nháy khi còn beacon; tắt khi mất */
  var lamp = sB.pt(32.5, -1.5, 18);
  var on = alive && (g % 1) < .35;
  sB.box(B_dy, 29.5, -5, 16, 6, 6, 4, on ? { top: '#e9ffe9', y: '#7ee0a8', x: '#4fb77f' } : { top: '#4a4a44', y: '#34342f', x: '#26261f' });
  if (alive && (g % 1) < .6) { var u = (g % 1) / .6, c = sB.circle(B_dy, 32.5, -1.5, 18, 6 + 22 * u, 24, 'none', '#d9432b', 1.8); c.setAttribute('stroke-opacity', (.9 * (1 - u)).toFixed(2)); }
  if (!alive) {                                          /* mất beacon: dấu gạch chéo */
    var x1 = sB.pt(32.5, -1.5, 30), r = 8;
    I.el('path', { d: 'M' + (x1[0] - r) + ',' + (x1[1] - r) + 'L' + (x1[0] + r) + ',' + (x1[1] + r) + 'M' + (x1[0] + r) + ',' + (x1[1] - r) + 'L' + (x1[0] - r) + ',' + (x1[1] + r), stroke: '#d9432b', 'stroke-width': 3, 'stroke-linecap': 'round' }, B_dy);
  }
  if (boot > 0 && boot < .5) { var cc = sB.circle(B_dy, 0, 0, Z0 + 150, 20 + 40 * boot * 2, 28, 'none', '#d9432b', 2.5); cc.setAttribute('stroke-opacity', (1 - boot * 2).toFixed(2)); }
}

/* ============================ C: 4 slot ghép ============================ */
var svgC = document.getElementById('s10c');
var sC = I.scene(svgC, { az: 8, el: 38, rect: [4, 6, 544, 190], pts: [[-84, -86, -8], [262, -86, -8], [-84, 86, -8], [262, 86, -8], [10, 0, 52], [40, -80, 36]] });
var C_pl = sC.g(), C_ob = sC.g(), C_dy = sC.g(), C_tx = sC.g();
var Y0 = [-68, -32, 4, 40], BH = 28, CXS = [34, 58, 82, 106, 130];
sC.box(C_pl, -84, -86, -8, 346, 172, 8, T.plate);
sC.box(C_ob, 0, -78, 0, 192, 156, 8, T.pcb);
for (var bi = 0; bi < 4; bi++) {
  sC.box(C_ob, 24, Y0[bi] - 2, 8, 138, BH + 6, 5, T.stone);
  sC.box(C_ob, 28, Y0[bi] + 1, 13, 130, BH, 0.8, T.dark);
}
sC.box(C_ob, 8, -6, 8, 6, 6, 30, T.dark);                              /* cột ăng-ten Root */
sC.box(C_ob, 192, -14, 8, 16, 28, 9, T.chip);                         /* cổng UART: khung đủ sẽ đi lên PC */
sC.box(C_ob, 208, -2, 0, 50, 4, 1, T.dark);
function slotY(b) { return Y0[b] + 1 + BH / 2; }
var TGX = null;
function frameC(t) {
  sC.clear(C_dy); sC.clear(C_tx);
  var items = [], occ = [], P = sC.pt, tags = [], i, k;
  FR.forEach(function (f) {
    var b = f.bin, y0 = Y0[b] + 1, last = -1, c, k2;
    var inProg = t >= f.first && t < f.endT;
    if (inProg) occ.push(f);
    /* chunk đang bay vào */
    for (k = 0; k < 5; k++) {
      var lt = t - (f.T0 + CK * k) - TFA;
      if (lt >= 0 && lt < TFC && !(k === f.lost && lt > .3)) {
        var pos = I.along([[-150, 0, 44], [CXS[k] + 9, y0 + BH / 2, 44], [CXS[k] + 9, y0 + BH / 2, 18]], lt / TFC);
        items.push({ x: pos[0] - 4.5, y: pos[1] - 4.5, z: pos[2], w: 9, d: 9, h: 9, t: CZ[f.leaf] });
      }
      if (k === f.lost && lt > .3 && lt < .8) tags.push({ kind: 'x', p: P(-150 + (CXS[k] + 159) * .6, y0 + BH / 2, 44), a: 1 - (lt - .3) / .5 });
    }
    if (!(t >= f.first - .01 && t < f.endT + 1.6)) return;
    /* ô bitmap */
    var done = f.type === 'ok' && t >= f.last, sh = f.type === 'ok' && t >= f.shipT;
    for (k = 0; k < 5; k++) {
      var a = f.arr[k]; if (a == null || t < a || t >= f.endT) continue;
      var col = CZ[f.leaf], x = CXS[k], z = 13.8, w = 20;
      if (done && !sh) col = (t - f.last) < .15 ? T.white : col;
      if (sh) { var u = I.clamp((t - f.shipT) / SHIPD), e = u * u * (3 - 2 * u); z = 13.8 + 22 * Math.min(1, u * 2.5); x = CXS[k] + 150 * e; }
      items.push({ x: x, y: y0 + 3, z: z, w: w, d: BH - 6, h: 4, t: col });
    }
    /* cầu chì timeout: đầy khi vừa nhận chunk, cháy dần khi im lặng */
    if (f.type !== 'ok' && t >= f.first && t < f.endT || (f.type === 'ok' && t >= f.first && t < f.last + .02)) {
      for (k = 0; k < 5; k++) if (f.arr[k] != null && f.arr[k] <= t) last = Math.max(last, f.arr[k]);
      var fr = I.clamp(1 - (t - last) / FUSE), fc = fr > .5 ? T.green : fr > .25 ? AMB : RED;
      if (fr > .01) items.push({ x: 28, y: y0 + BH + 2.5, z: 8.5, w: 130 * fr, d: 1.8, h: 3.4, t: fc });
    }
    /* hủy khung: supersede / timeout */
    if (f.type !== 'ok' && t >= f.endT && t < f.endT + 1.6) tags.push({ kind: f.type, b: b, a: 1 - (t - f.endT) / 1.6, tt: t - f.endT });
  });
  sC.items(C_dy, items);
  /* nhãn */
  tags.forEach(function (g) {
    if (g.kind === 'x') {
      var r = 7; I.el('path', { d: 'M' + (g.p[0] - r) + ',' + (g.p[1] - r) + 'L' + (g.p[0] + r) + ',' + (g.p[1] + r) + 'M' + (g.p[0] + r) + ',' + (g.p[1] - r) + 'L' + (g.p[0] - r) + ',' + (g.p[1] + r), stroke: '#d9432b', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: g.a.toFixed(2) }, C_dy);
      return;
    }
    var y0 = Y0[g.b] + 1, e = I.el('g', { opacity: Math.min(1, g.a * 1.6).toFixed(2) }, C_tx);
    var rc = sC.path(e, [[24, y0 - 3], [162, y0 - 3], [162, y0 + BH + 4], [24, y0 + BH + 4], [24, y0 - 3]], 13.9, '#d9432b', 2.6);
    var q = P(22, y0 + BH / 2, 14);
    txt(e, q[0] - 16, q[1] + 5, g.kind === 'sup' ? 'Supersede' : 'timeout 2 s', 14, 700, 'end', '#d9432b', 'mo');
  });
  /* LRU: khung cũ nhất bị loại đầu tiên khi hết slot — đánh dấu khi có ≥ 3 khung đang ghép */
  var used = {};
  tags.forEach(function (g) { if (g.kind !== 'x') used[g.b] = 1; });
  if (occ.length >= 3) {
    occ.sort(function (a, b) { return a.first - b.first; });
    var o = occ[0], q2 = P(22, Y0[o.bin] + 1 + BH / 2, 14);
    if (!used[o.bin]) { txt(C_tx, q2[0] - 16, q2[1] + 5, 'LRU', 14, 700, 'end', '#645f52', 'mo'); used[o.bin] = 1; }
  }
  /* "bitmap": nhãn tĩnh cạnh hàng ô (nhường chỗ cho nhãn sự kiện) */
  if (!used[3]) { var bq = P(22, Y0[3] + 1 + BH / 2, 14); txt(C_tx, bq[0] - 16, bq[1] + 5, 'bitmap', 14, 500, 'end', '#645f52', 'mo'); }
}

Deck.frames.s10 = function (t) {
  t = ((t % LOOP) + LOOP) % LOOP;
  frameA(t); frameB(t); frameC(t);
};

})();
/* 11-uart-dashboard.js */
;(function(){
/* Slide 11: bộ đệm UART ở Root (bỏ khung ảnh nếu còn < ½, telemetry/log không bao giờ bị bỏ)
   -> cáp UART -> middleware: MAGIC -> LEN (≤ 131072) -> CRC -> Socket.IO -> dashboard.
   Lỗi chỉ bỏ phần hỏng: rác trước MAGIC bị quét đi, khung quá dài bị chặn ở cổng LEN, khung sai CRC bị loại ở cổng CRC. */
var svg = document.getElementById('s11fig'), I = window.Iso, T = I.T, LEAF = I.LEAF;
var sc = I.scene(svg, { az: 5, el: 36, rect: [2, 2, 730, 118],
  pts: [[-34, -38, -6], [596, -38, -6], [-34, 38, -6], [596, 38, -6], [30, 0, 72], [-34, -14, 74], [550, 0, 80]] });
var P = sc.pt, S = sc.S, C = sc.C;
function tx(g, x, y, str, size, w, anchor, fill, cls) { var e = sc.text(g, x, y, str, size, w, anchor, fill, cls); e.style.fill = fill; return e; }
var plateG = sc.g(), objG = sc.g(), dyn = sc.g(), lbG = sc.g();
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
Deck.steps.s11 = function (n) { cur = n; };
var BLUE = T.blue, GRN = T.green, TEL = { top: '#9dbfee', y: '#3f78c4', x: '#2d5a99' }, LOG = { top: '#bdb8a8', y: '#8c8878', x: '#6c6859' };
var RED = { top: '#ff9a82', y: '#d9432b', x: '#a8321f' }, AMB = { top: '#f2b24a', y: '#c98a1c', x: '#a06b10' };

/* ---------- cảnh tĩnh ---------- */
var X_START = 74, BELT0 = 114, BELT1 = 420, GX = [165, 265, 365], MX = 470;
sc.box(plateG, -34, -38, -6, 630, 76, 6, T.plate);
/* Root: bo mạch ESP32 + bộ đệm */
sc.box(objG, 0, -30, 0, 72, 60, 5, T.pcb);
sc.box(objG, 46, -22, 5, 20, 18, 3, T.chip);
sc.box(objG, 50, -16, 8, 12, 10, 1, T.dark);
sc.box(objG, 4, 22, 5, 5, 5, 2, { top: '#7ee0a8', y: '#2f9f64', x: '#23794c' });
/* cáp UART (xanh dương = lớp 2) */
sc.box(objG, 72, -5, 0, 44, 10, 3, BLUE);
sc.box(objG, 70, -8, 0, 8, 16, 7, T.dark); sc.box(objG, 110, -8, 0, 8, 16, 7, T.dark);
/* middleware: băng chuyền + 3 cổng */
sc.box(objG, BELT0, -20, 0, BELT1 - BELT0, 40, 4, T.stone);
sc.box(objG, BELT0, -22, 4, BELT1 - BELT0, 2, 3, T.dark); sc.box(objG, BELT0, 20, 4, BELT1 - BELT0, 2, 3, T.dark);
GX.forEach(function (gx, i) {
  sc.box(objG, gx - 3, -28, 0, 6, 6, 36, T.dark); sc.box(objG, gx - 3, 22, 0, 6, 6, 36, T.dark);
  sc.box(objG, gx - 3, -28, i === 1 ? 14 : 36, 6, 56, 4, T.dark);                   /* xà ngang: cổng LEN thấp hơn = giới hạn kích thước */
});
/* Socket.IO (xanh lá = lớp 3) -> dashboard */
sc.box(objG, BELT1 + 2, -7, 0, 6, 14, 12, T.dark);
var TUBE = [[BELT1 + 8, 0, 8], [BELT1 + 26, 0, 16], [MX - 4, 0, 16]];
sc.path(objG, TUBE, 0, '#1b7f5c', 7);
sc.path(objG, TUBE, 0, '#6fcf9f', 2);
sc.box(objG, MX + 24, -26, 0, 60, 52, 5, T.stone);
sc.box(objG, MX + 47, -6, 5, 14, 12, 20, T.stone);
sc.box(objG, MX, -5, 24, 100, 10, 52, T.dark);
var SCRM = sc.faceMatrix(MX, 5, 24);
/* nhãn: ½ ở vạch giữa bộ đệm; vị trí chú thích cổng */
(function () {
  var q = P(30 - 17, 15, 6 + 22); var hf = tx(lbG, q[0] - 6, q[1] + 5, '½', 16, 700, 'end', '#d9432b', 'mo'); hf.style.stroke = '#f6f1e7'; hf.style.strokeWidth = '3px'; hf.style.paintOrder = 'stroke';
  var strip = svg.parentNode;
  [['.g1', GX[0]], ['.g2', GX[1]], ['.g3', GX[2]], ['.g4', BELT1 + 34]].forEach(function (a) {
    var el = strip.querySelector(a[0]), p = P(a[1], 38, -6);
    el.style.left = p[0].toFixed(1) + 'px'; el.style.top = (p[1] + 4).toFixed(1) + 'px';
  });
})();

/* ---------- mô hình: bộ đệm UART ở Root ---------- */
var LOOP = 22, RATE = .08, V = 105, TV = .9;
var SZ = { img: .3, tel: .05, log: .05 };
var ARR = [];
(function () {
  var imgs = [.8, 2.2, 3.6, 5.0, 6.4, 7.8, 11.4, 13.8, 16.2], tel = [1.5, 4.3, 7.1, 9.0, 11.0, 13.0, 15.2, 17.5], lg = [2.9, 5.7, 8.4, 12.2, 14.4, 18.6];
  imgs.forEach(function (t, i) { ARR.push({ t: t, kind: 'img', leaf: i % 3 }); });
  tel.forEach(function (t) { ARR.push({ t: t, kind: 'tel' }); });
  lg.forEach(function (t) { ARR.push({ t: t, kind: 'log' }); });
  ARR.sort(function (a, b) { return a.t - b.t; });
  var acc = [], nImg = 0, nTel = 0;
  function level(t) { return acc.reduce(function (s, f) { var u = I.clamp((t - f.xs) / (f.xe - f.xs)); return t < f.t ? s : s + SZ[f.kind] * (1 - u); }, 0); }
  var tail = 0;
  ARR.forEach(function (a) {
    var lv = level(a.t);
    a.level = lv;
    if (a.kind === 'img' && lv > .5) { a.drop = true; return; }                 /* còn < ½ chỗ trống: bỏ khung ảnh */
    a.xs = Math.max(a.t + .3, tail); a.xe = a.xs + SZ[a.kind] / RATE; tail = a.xe; /* xả FIFO với tốc độ cố định */
    a.exit = a.xe;
    a.fate = 'ok';
    if (a.kind === 'img') { nImg++; if (nImg === 3) a.fate = 'len'; else if (nImg === 5) a.fate = 'crc'; }
    if (a.kind === 'tel') { nTel++; if (nTel === 3) a.fate = 'crc'; }
    acc.push(a);
  });
  /* rác trước một khung: cho khung đầu tiên đi qua băng chuyền sau t = 9 */
  var tgt = acc.filter(function (f) { return f.exit > 9; })[0];
  if (tgt) tgt.noise = true;
})();
function levelAt(t) {
  var s = 0;
  ARR.forEach(function (f) {
    if (f.drop || t < f.t) return;
    var u = I.clamp((t - f.xs) / (f.xe - f.xs)), a = I.clamp((t - f.t) / .3);
    s += SZ[f.kind] * (1 - u) * (a * a * (3 - 2 * a));
  });
  return s;
}
function body(kind, leaf, big) {                                       /* kích thước và màu khối theo loại khung */
  if (kind === 'img') return { w: 38, d: 22, h: big ? 24 : 8, t: LEAF[leaf] };
  return { w: 14, d: 14, h: 8, t: kind === 'tel' ? TEL : LOG };
}
var ZTOP = 6, TH = 44, FZ = 62;                                          /* cột bộ đệm: 44 đơn vị cao */
var GATEPOS = [GX[0], GX[1], GX[2]];
var lastShown = { leaf: -1, tel: -9, log: -9 }, MON = { img: -9, leaf: 0, tel: -9, log: -9 };

function frame(t) {
  t = ((t % LOOP) + LOOP) % LOOP;
  sc.clear(dyn); MON = { img: -9, leaf: 0, tel: -9, log: -9 };
  var items = [], lv = levelAt(t), over = lv > .5, tags = [];
  /* cột bộ đệm: 4 trụ + mức dâng + mốc ½ */
  [[-15, -15], [12, -15], [-15, 12], [12, 12]].forEach(function (p) { items.push({ x: 30 + p[0] - 1.5, y: p[1] - 1.5, z: ZTOP, w: 3, d: 3, h: TH, t: T.dark }); });
  items.push({ x: 30 - 18, y: -18, z: 0, w: 36, d: 36, h: ZTOP, t: T.stone });
  if (lv > .005) items.push({ x: 30 - 10, y: -10, z: ZTOP, w: 20, d: 20, h: Math.min(1, lv) * TH, t: over ? AMB : BLUE });
  items.push({ x: 30 - 17, y: 13, z: ZTOP + TH / 2 - 1, w: 34, d: 3, h: 2, t: RED });                 /* vạch ½ */
  items.push({ x: 30 - 3, y: 14, z: ZTOP + TH + 1, w: 6, d: 5, h: 4, t: over ? RED : { top: '#e9ffe9', y: '#7ee0a8', x: '#4fb77f' } });   /* đèn: nhận/chặn khung ảnh */
  /* khung tới bộ đệm */
  ARR.forEach(function (f) {
    var b = body(f.kind, f.leaf || 0, false), x, y = 0, z, u, pos;
    var tin = f.t - TV;
    if (t >= tin && t < f.t + .4 + (f.drop ? .7 : 0)) {
      if (f.drop) {
        if (t < f.t) { pos = I.along([[-34, 0, FZ], [-6, 0, FZ]], (t - tin) / TV); }
        else { var rr = (t - f.t) / .7; pos = I.along([[-6, 0, FZ], [-34, 0, FZ]], I.clamp(rr)); if (rr < .45) tags.push({ p: P(-6, 0, FZ), a: 1 - rr / .45 }); }
        items.push({ x: pos[0] - b.w / 2, y: pos[1] - b.d / 2, z: pos[2], w: b.w, d: b.d, h: b.h, t: b.t });
      } else if (t < f.t) {
        pos = I.along([[-34, 0, FZ], [30, 0, FZ]], (t - tin) / TV);
        items.push({ x: pos[0] - b.w / 2, y: -b.d / 2, z: pos[2], w: b.w, d: b.d, h: b.h, t: b.t });
      } else {
        u = I.clamp((t - f.t) / .4); var s2 = 1 - u * .8;
        items.push({ x: 30 - b.w * s2 / 2, y: -b.d * s2 / 2, z: FZ - u * 12, w: b.w * s2, d: b.d * s2, h: b.h * s2, t: b.t });
      }
    }
  });
  /* khung ra khỏi bộ đệm, chạy theo cáp UART rồi qua 3 cổng của middleware */
  var curImg = MON.img, curLeaf = MON.leaf, tel = -9, lg = -9, passed = [];
  ARR.forEach(function (f) {
    if (f.drop || t < f.exit) return;
    var big = f.fate === 'len', b = body(f.kind, f.leaf || 0, big), x = X_START + V * (t - f.exit), z = 4, y = 0, a = 1, ejected = false;
    var tg = [ [GX[0] - 8, 'noise'], [GX[1] - 22, 'len'], [GX[2] - 10, 'crc'] ];
        if (f.fate === 'len' && x > tg[1][0]) {
      var u = (x - tg[1][0]) / 46; if (u < .6) { x = tg[1][0] + u * 4; } else { var w = I.clamp((u - .6) / .8); x = tg[1][0] + 2.4; y = 34 * w; z = 4 - 4 * w; a = 1 - w; }
      if (u > 1.5) return;
      if (u >= .55 && u < 1.1) tags.push({ p: P(GX[1], 0, 22), a: 1 - (u - .55) / .55 });
    } else if (f.fate === 'crc' && x > tg[2][0]) {
      var u2 = (x - tg[2][0]) / 40; var w2 = I.clamp(u2 / .8); y = -34 * w2; z = 4 - 4 * w2; a = 1 - w2; x = tg[2][0] + u2 * 6;
      if (u2 > 1.2) return;
      if (u2 < .7) tags.push({ p: P(GX[2], 0, 22), a: 1 - u2 / .7 });
    } else if (x > BELT1 - 10) {                                                 /* qua Socket.IO tới dashboard */
      var path = [[BELT1 - 10, 0, 6], [BELT1 + 8, 0, 10], [BELT1 + 30, 0, 18], [MX - 4, 0, 18], [MX + 40, 0, 18]];
      var s = (x - (BELT1 - 10)) / 100; if (s >= 1) { if (f.kind === 'img') { MON.img = f.t; MON.leaf = f.leaf; } else MON[f.kind] = f.exit; return; }
      var q = I.along(path, s); x = q[0]; z = q[2]; var shr = 1 - .5 * s; b = { w: b.w * shr, d: b.d * shr, h: b.h * shr, t: b.t };
    }
    if (x > MX + 60) return;
    if (a > .02) items.push({ x: x - b.w / 2, y: y - b.d / 2, z: z, w: b.w, d: b.d, h: b.h * (a < 1 ? Math.max(.3, a) : 1), t: b.t });
    /* đầu khung "AA 55" (tối) ở phía trước */
    if (a > .5 && x < BELT1 - 10 && f.kind === 'img') items.push({ x: x + b.w / 2 - 2, y: y - b.d / 2, z: z, w: 4, d: b.d, h: b.h + .5, t: T.dark });
  });
  /* rác trước MAGIC: bị quét khỏi băng chuyền ở cổng 1 */
  ARR.forEach(function (f) {
    if (!f.noise) return;
    for (var k = 0; k < 4; k++) {
      var x = BELT0 + V * (t - f.exit + .55 + k * .09), y = 0, z = 4, a = 1;
      if (t < f.exit - .55 || x < BELT0) continue;
      if (x > GX[0] - 6) { var w = I.clamp((x - (GX[0] - 6)) / 26); y = (k % 2 ? 1 : -1) * 40 * w; z = 4 - 3 * w; a = 1 - w; x = GX[0] - 6 + 10 * w; }
      if (a > .05 && x < BELT1 - 10) items.push({ x: x - 3, y: y - 3 + (k % 2 ? 4 : -4) * (x < GX[0] - 6 ? 1 : 0), z: z, w: 6, d: 6, h: 6 * Math.max(.4, a), t: T.dark });
    }
  });
  sc.items(dyn, items);
  /* dấu "x" đỏ ở chỗ khung bị chặn */
  tags.forEach(function (g) {
    var r = 7; I.el('path', { d: 'M' + (g.p[0] - r) + ',' + (g.p[1] - r) + 'L' + (g.p[0] + r) + ',' + (g.p[1] + r) + 'M' + (g.p[0] + r) + ',' + (g.p[1] - r) + 'L' + (g.p[0] - r) + ',' + (g.p[1] + r), stroke: '#d9432b', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: Math.max(0, g.a).toFixed(2) }, dyn);
  });
  /* đèn trên 3 cổng: nhấp nháy khi có khung đi qua */
  GX.forEach(function (gx, i) { sc.box(dyn, gx - 3, -3, i === 1 ? 18 : 40, 6, 6, 3, T.chip); });
  /* màn hình dashboard: ảnh của Leaf mới nhất + cột telemetry */
  var g = I.el('g', { transform: SCRM + ' translate(0,52) scale(1,-1)' }, dyn);
  I.el('rect', { x: 4, y: 4, width: 92, height: 44, fill: '#1d2a25' }, g);
  var since = t - MON.img, ia = I.clamp(1 - since / 6);
  I.el('rect', { x: 8, y: 8, width: 44, height: 36, fill: ['#ffb27a', '#9dbfee', '#c3dc7a'][MON.leaf], opacity: MON.img < -5 ? .25 : .45 + .55 * ia }, g);
  for (var k2 = 0; k2 < 4; k2++) I.el('rect', { x: 8, y: 12 + k2 * 8, width: 44, height: 1.5, fill: '#1d2a25', opacity: .35 }, g);
  [[58, 24], [68, 18], [78, 30], [88, 14]].forEach(function (b, n) { I.el('rect', { x: b[0], y: 8, width: 6, height: b[1] * (.6 + .4 * Math.sin(t * 2 + n)), fill: '#7fd4a8' }, g); });
}
Deck.frames.s11 = frame;

})();
/* 12-bring-up.js */
;(function(){
/* Slide 12: tuyến tàu điện sáu ga. Mỗi bước mở một ga (sự cố -> nguyên nhân -> xử lý); bước 7: tàu về ga cuối, ba số lớn đếm lên. */
var sl = document.getElementById('s12'), I = window.Iso;
var stns = Array.prototype.slice.call(sl.querySelectorAll('.stn')), train = sl.querySelector('.train'), done = sl.querySelector('.rail.done'), line = sl.querySelector('.mline');
var cnts = Array.prototype.slice.call(sl.querySelectorAll('.cnt')), finals = cnts.map(function (c) { return c.textContent; });
var cur = 0, reach = 0, lastN = 0;
function allOn() { return document.documentElement.classList.contains('static'); }
function cx(i) { return stns[i].querySelector('.dot').offsetLeft + 16; }
function apply(s) {
  var n = allOn() ? 7 : s;
  cur = s;
  stns.forEach(function (el, i) { el.classList.toggle('open', i < n); });
  var x, w;
  if (n === 0) { x = -140; w = 0; }
  else if (n <= 6) { x = cx(n - 1) - 32; w = cx(n - 1) - 16; }
  else { x = line.clientWidth - 72; w = line.clientWidth - 16; }
  train.style.transform = 'translateX(' + x + 'px)';
  done.style.width = w + 'px';
  if (n >= 7 && lastN < 7) reach = performance.now();
  lastN = n;
  if (n < 7) cnts.forEach(function (c, i) { c.textContent = finals[i]; });
}
Deck.steps.s12 = apply;
Deck.shows.s12 = function () { lastN = 0; };
Deck.frames.s12 = function () {
  var n = allOn() ? 7 : cur;
  if (n < 7) return;
  var p = (Deck.still || allOn()) ? 1 : I.clamp((performance.now() - reach - 500) / 1500);
  var e = 1 - Math.pow(1 - p, 3);
  cnts.forEach(function (c, i) {
    if (p >= 1) { c.textContent = finals[i]; return; }
    var to = +c.getAttribute('data-to'), d = +c.getAttribute('data-d');
    c.textContent = d ? (to * e).toFixed(d).replace('.', ',') : String(Math.round(to * e));
  });
};

})();
/* 13-nut-that.js */
;(function(){
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

})();
/* 14-bo-dem-uart.js */
;(function(){
/* Slide 14: hai bộ đệm UART TX (8 KB của test19, 16 KB của test21) như hai bể chứa.
   Cùng một dòng chunk (3 Leaf, theo cụm) đổ vào hai bể, rút ra theo tốc độ UART.
   Bể 8 KB đầy -> chunk rơi ra ngoài (uartDrop); bể 16 KB còn chỗ -> không rơi.
   Chỉ có các số của bảng gốc được hiển thị; mức nước/số chunk trong mô hình chỉ để minh họa (không in ra). */
var svg = document.getElementById('s14fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 10, el: 38, rect: [112, 14, 468, 326],
  pts: [[-14, -130, -10], [322, -130, -10], [-14, 140, -10], [322, 140, -10], [130, 84, 80], [130, -80, 80], [130, -140, 0]] });
var P = sc.pt;
var PER = 5.6, NB = 15, A0 = .3, DA = .07, TBT = 1.0, RATE = 4.2, EXIT = .75;
var RIGS = [
  { yc: -80, cap: 8, Ht: 46, d: 20, pd: 50, name: 'test19', kb: '8 KB', drop: '137 → 480', lat: '280 ms', ms: 280, col: '#d9432b', dir: -1 },
  { yc: 84, cap: 16, Ht: 46, d: 40, pd: 56, name: 'test21', kb: '16 KB', drop: '0', lat: '199 ms', ms: 199, col: '#1b7f5c', dir: 1 }
];
var LQ = { top: '#b9d0f0', y: '#4a82cf', x: '#2d5a99' };
var DEAD = { top: '#f3b9ad', y: '#d9432b', x: '#a8301c' };
var LATK = .4;                                                    /* 1 ms = 0,4 đơn vị dài: độ dài thanh tỉ lệ đúng 280 : 199 */
var CS = 12;                                                      /* cạnh khối chunk */

/* ---- mô hình: cùng một dòng chunk, bể có dung lượng khác nhau ---- */
function simulate(cap) {
  var dt = .002, L = 0, dr = 0, ji = 0, t, j, k, cs = [], acc = [], emits = [], N = Math.round(PER / dt), grid = new Float32Array(N + 1);
  for (j = 0; j < NB; j++) cs.push(A0 + j * DA + TBT);
  for (k = 0; k <= N; k++) {
    t = k * dt;
    while (ji < NB && cs[ji] <= t) { if (L + 1 > cap + 1e-9) acc[ji] = false; else { acc[ji] = true; L += 1; } ji++; }
    if (L > 0) { var d = Math.min(L, RATE * dt); L -= d; dr += d; while (dr >= 1) { dr -= 1; emits.push(t); } }
    grid[k] = L;
  }
  var order = []; for (j = 0; j < NB; j++) if (acc[j]) order.push(j);
  return { cs: cs, acc: acc, emits: emits, order: order, grid: grid, dt: dt };
}
RIGS.forEach(function (R) { R.sim = simulate(R.cap); });
function levelAt(R, tau) { var s = R.sim, x = tau / s.dt, i = Math.floor(x), f = x - i; return s.grid[i] * (1 - f) + s.grid[Math.min(i + 1, s.grid.length - 1)] * f; }
function ease(x) { x = I.clamp(x); return x * x * (3 - 2 * x); }

/* ---- vật thể tĩnh ---- */
function face(g, pts, fill, stroke, sw) { sc.poly(g, pts.map(function (q) { return P(q[0], q[1], q[2]); }), fill, stroke || 'rgba(45,38,28,.55)', sw == null ? .9 : sw); }
var X0 = 100, X1 = 160, TX = 130;                                  /* thành bể theo x; TX = tâm bể */
RIGS.forEach(function (R) {
  var y = R.yc, g = R.g = { plate: sc.g(), obj: sc.g(), back: sc.g(), liq: sc.g(), inn: sc.g(), front: sc.g(), out: sc.g() };
  sc.box(g.plate, -14, y - R.pd, -10, 336, 2 * R.pd, 10, T.plate);
  [[-6, y - R.pd + 8], [314, y - R.pd + 8], [-6, y + R.pd - 8], [314, y + R.pd - 8]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.4, fill: '#8c8470' }, g.plate); });
  /* Root: bo mạch + chip + ăng-ten (nguồn chunk) */
  sc.box(g.obj, 0, y - 22, 0, 44, 44, 7, T.pcb); sc.box(g.obj, 5, y - 15, 7, 16, 14, 3, T.chip);
  sc.cyl(g.obj, 31, y, 7, 9, 9, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(g.obj, 31, y, 16, 2, 6.5, '#222', '#444', '#101010');
  sc.box(g.obj, 44, y - 8, 0, 48, 16, 3, T.dark);                   /* băng tải mesh */
  sc.box(g.obj, X0 - 2, y - R.d - 2, 0, 64, 2 * R.d + 4, 4, T.stone);             /* đế bể */
  sc.box(g.obj, X1 + 2, y - 7, 0, 20, 14, 11, T.dark);              /* ống ra */
  sc.box(g.obj, 182, y - 7, 0, 80, 14, 3, T.blue);                  /* băng tải UART */
  sc.box(g.obj, 264, y - 22, 0, 44, 44, 14, T.stone);               /* PC */
  sc.box(g.obj, 280, y - 18, 14, 6, 36, 30, T.dark);
  [[18, 7], [10, 12], [2, 9]].forEach(function (b) { face(g.obj, [[286, y - 16 + b[0], 20], [286, y - 12 + b[0], 20], [286, y - 12 + b[0], 20 + b[1]], [286, y - 16 + b[0], 20 + b[1]]], '#7fd4a8', 'none', 0); });
  /* bể: thành sau (kính) */
  var y0 = y - R.d, y1 = y + R.d, H = R.Ht;
  face(g.back, [[X0, y0, 4], [X0, y1, 4], [X0, y1, H], [X0, y0, H]], 'rgba(120,150,190,.16)');
  face(g.back, [[X0, y0, 4], [X1, y0, 4], [X1, y0, H], [X0, y0, H]], 'rgba(120,150,190,.22)');
  /* bể: thành trước (kính), vạch mức, miệng ra, viền miệng */
  face(g.front, [[X1, y0, 4], [X1, y1, 4], [X1, y1, H], [X1, y0, H]], 'rgba(255,255,255,.2)');
  face(g.front, [[X0, y1, 4], [X1, y1, 4], [X1, y1, H], [X0, y1, H]], 'rgba(255,255,255,.16)');
  face(g.front, [[X1, y - 6, 4], [X1, y + 6, 4], [X1, y + 6, 11], [X1, y - 6, 11]], '#1f1e1b');
  for (var m = 1; m <= 3; m++) { var zz = 4 + (H - 6) * m / 4; sc.line(g.front, [X0 + 2, y1, zz], [X0 + 12, y1, zz], 'rgba(28,27,25,.55)', 1.1); }
  sc.path(g.front, [[X0, y0, H], [X1, y0, H], [X1, y1, H], [X0, y1, H], [X0, y0, H]], H, '#1c1b19', 1.8);
  [[X1, y1], [X1, y0], [X0, y1]].forEach(function (c) { sc.line(g.front, [c[0], c[1], 4], [c[0], c[1], H], 'rgba(28,27,25,.7)', 1.4); });
});
/* đầu đề từng làn (số lấy từ bảng) */
var lab = sc.g();
RIGS.forEach(function (R) {
  var q = P(-14, R.yc, 0);
  sc.text(lab, 4, q[1] - 2, R.name, 22, 700, 'start', '#26231c', 'sf');
  sc.text(lab, 4, q[1] + 18, R.kb, 15, 700, 'start', '#1f4e9c', 'mo');
});
/* kết quả (hiện từ bước 1): uartDrop + thanh độ trễ tỉ lệ đúng */
RIGS.forEach(function (R) {
  var g = R.res = sc.g(), y = R.yc;
  var a = R.dir < 0 ? P(X0 - 26, y - R.pd, 0) : P(TX, y + R.pd, 0);
  R.dropT = R.dir < 0 ? sc.text(g, a[0], a[1] - 8, 'uartDrop ' + R.drop, 16, 700, 'end', R.col, 'mo') : sc.text(g, a[0], a[1] + 22, 'uartDrop ' + R.drop, 16, 700, 'middle', R.col, 'mo');
  var h = P(-14, y, 0);
  R.latL = sc.text(g, 4, h[1] + 42, 'độ trễ TB', 13, 500, 'start', '#645f52', 'mo');
  R.latV = sc.text(g, 4, h[1] + 64, R.lat, 23, 700, 'start', R.col, 'sf');
  R.strip = sc.g(g);
});
function drawStrip(R, p) {
  var y = R.yc, len = R.ms * LATK * ease(p), g = R.strip;
  sc.clear(g);
  if (len < .5) return;
  var x0 = 182, z = .2, pts = [P(x0, y + 28, z), P(x0 + len, y + 28, z), P(x0 + len, y + 40, z), P(x0, y + 40, z)];
  sc.poly(g, pts, R.col, 'rgba(45,38,28,.6)', 1);
}

/* ---- động ---- */
var cur = 0, resAt = -1;
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.s14 = function (s) { cur = s; if (s >= 1 && resAt < 0) resAt = performance.now(); if (s < 1) resAt = -1; };
Deck.shows.s14 = function () { resAt = -1; };
function cubeItem(x, y, z, sz, t) { return { x: x - sz / 2, y: y - sz / 2, z: z, w: sz, d: sz, h: sz, t: t }; }
function drawRig(R, tau) {
  var g = R.g, y = R.yc, H = R.Ht, s = R.sim, j, m, items = [], inner = [];
  sc.clear(g.liq); sc.clear(g.inn); sc.clear(g.out);
  var Ld = levelAt(R, tau);
  for (j = 0; j < NB; j++) if (s.acc[j]) { var u0 = tau - s.cs[j]; if (u0 >= 0 && u0 < .35) Ld -= 1 - ease(u0 / .35); }
  Ld = Math.max(0, Math.min(R.cap, Ld));
  var hl = Ld / R.cap * (H - 6);
  if (hl > .1) sc.box(g.liq, X0 + 2, y - R.d + 2, 4, 56, 2 * R.d - 4, hl, LQ);
  var surf = 4 + hl;
  for (m = 0; m < 5; m++) { var bx = 44 + ((m * 10 + tau * 40) % 48); sc.line(g.out, [bx, y - 7, 3.1], [bx, y + 7, 3.1], 'rgba(255,255,255,.28)', 1.4); }
  for (m = 0; m < 8; m++) { var ux = 182 + ((m * 10 + tau * 125) % 80); sc.line(g.out, [ux, y - 6, 3.1], [ux, y + 6, 3.1], 'rgba(28,27,25,.35)', 1.4); }
  /* chunk từ Root tới miệng bể */
  for (j = 0; j < NB; j++) {
    var age = tau - (A0 + j * DA), leaf = I.LEAF[Math.floor(j / 5)], x, z, yy = y, sz = CS, tt = leaf, tgt = items;
    if (age < 0) continue;
    if (age < .55) { x = I.lerp(30, 88, age / .55); z = 4; sz = CS * Math.min(1, age / .12); }
    else if (age < .8) { var f = (age - .55) / .25; x = I.lerp(88, 90, f); z = I.lerp(4, H + 16, ease(f)); }
    else if (age < TBT) { x = I.lerp(90, TX, ease((age - .8) / .2)); z = H + 16; }
    else {
      var u = age - TBT; x = TX;
      if (s.acc[j]) { if (u >= .2) continue; z = I.lerp(H + 16, surf, (u / .2) * (u / .2)); if (z < H + 2) tgt = inner; }
      else {
        tt = DEAD;
        if (u < .25) { var q = ease(u / .25); yy = y + R.dir * 46 * q; z = H + 16 + 8 * Math.sin(Math.PI * q); }
        else if (u < .6) { var f2 = (u - .25) / .35; yy = y + R.dir * 46; z = I.lerp(H + 16, 0, f2 * f2); }
        else if (u < 1.2) { yy = y + R.dir * 46; var gg = sc.g(g.out); gg.setAttribute('opacity', (1 - (u - .6) / .6).toFixed(2)); sc.box(gg, x - CS / 2, yy - CS / 2, 0, CS, CS, CS, DEAD); continue; }
        else continue;
      }
    }
    tgt.push(cubeItem(x, yy, z, sz, tt));
  }
  /* chunk rút ra theo UART tới PC (khớp thứ tự FIFO) */
  s.emits.forEach(function (te, mi) {
    var a = tau - te; if (a < 0) a += PER; if (a >= EXIT) return;
    var x = I.lerp(168, 258, a / EXIT), sz = CS * I.clamp((264 - x - CS / 2) / 14);
    if (sz < .5) return;
    items.push(cubeItem(x, y, 3, sz, I.LEAF[Math.floor(s.order[mi] / 5)]));
  });
  sc.items(g.inn, inner); sc.items(g.out, items);
}
Deck.frames.s14 = function (t) {
  var tau = t % PER;
  RIGS.forEach(function (R) { drawRig(R, tau); });
  var done = allOn() || Deck.still, p = (cur >= 1 || allOn()) ? (done ? 1 : I.clamp((performance.now() - resAt) / 900)) : 0;
  RIGS.forEach(function (R) {
    R.res.setAttribute('opacity', p > 0 ? 1 : 0);
    R.dropT.setAttribute('opacity', I.clamp(p * 3));
    drawStrip(R, p);
    var o = I.clamp(p * 2 - .6); R.latL.setAttribute('opacity', o); R.latV.setAttribute('opacity', o);
  });
};

})();
/* 15-test22.js */
;(function(){
/* Slide 15: chuỗi 3 chặng (1 Root + 3 Leaf; Leaf cũng là node chuyển tiếp, không thêm node).
   Chunk từ mỗi Leaf đi lần lượt qua từng chặng về Root; cột sau mỗi Leaf cao tỉ lệ ĐÚNG với độ trễ trung vị 148 / 350 / 576 ms,
   thanh trên sàn dài tỉ lệ với |RSSI| 45,8 / 54,5 / 67,3 dBm. Thời gian cảnh tỉ lệ với trung vị (1 ms = 0,008 s). */
var svg = document.getElementById('s15fig'), I = window.Iso, T = I.T;
var HZ = 176, MSMAX = 576;                         /* cột 576 ms cao 176 đơn vị -> 1 ms = 176/576 đơn vị */
var NODES = [{ x: 0 }, { x: 165, ms: 148, rssi: 45.8 }, { x: 330, ms: 350, rssi: 54.5 }, { x: 495, ms: 576, rssi: 67.3 }];
var sc = I.scene(svg, { az: 14, el: 34, rect: [0, 12, 612, 388],
  pts: [[-60, -72, -10], [560, -72, -10], [-60, 92, -10], [560, 92, -10], [-60, -72, 190], [560, -72, 190], [-60, 92, -52], [495, 92, -52]] });
var P = sc.pt, S = sc.S, C = sc.C;
var TS = .008, T0 = .3, PER = 7.2, YB = 28;         /* TS: giây cảnh cho mỗi ms đo; YB: đường chuỗi */
var wallG = sc.g(), plateG = sc.g(), gridG = sc.g(), pillG = [sc.g(), sc.g(), sc.g()], objG = sc.g(), linkG = sc.g(), dyn = sc.g();
sc.box(plateG, -60, -72, -10, 620, 164, 10, T.plate);
[[-50, -62], [550, -62], [-50, 82], [550, 82]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.4, fill: '#8c8470' }, plateG); });
/* tường sau: lưới mỗi 200 ms (không nhãn) để thấy tỉ lệ */
sc.poly(wallG, [P(-60, -70, 0), P(560, -70, 0), P(560, -70, 188), P(-60, -70, 188)], 'rgba(255,255,255,.42)', 'rgba(45,38,28,.35)', .9);
[0, 200, 400, 600].forEach(function (m) { var z = HZ * m / MSMAX, l = sc.line(gridG, [-60, -69.5, z], [560, -69.5, z], m ? 'rgba(28,27,25,.32)' : 'rgba(28,27,25,.6)', m ? 1 : 1.6); if (m) l.setAttribute('stroke-dasharray', '5 4'); });
/* bo mạch */
function leafBoard(cx, i) {
  var y = YB;
  sc.box(objG, cx - 32, y - 25, 0, 64, 50, 8, T.pcb); sc.box(objG, cx - 26, y - 17, 8, 20, 16, 3, T.chip);
  sc.cyl(objG, cx + 20, y, 8, 10, 13, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, cx + 20, y, 18, 2, 9, '#222', '#444', '#101010');
  sc.box(objG, cx - 26, y + 12, 8, 12, 8, 4, I.LEAF[i - 1]);
}
function rootBoard(cx) {
  var y = YB;
  sc.box(objG, cx - 42, y - 32, 0, 84, 64, 10, T.pcb); sc.box(objG, cx - 8, y - 14, 10, 30, 30, 7, T.chip);
  sc.box(objG, cx - 36, y - 26, 10, 14, 16, 8, T.dark);
  sc.cyl(objG, cx + 26, y + 18, 10, 16, 5, '#3b3a35', '#6d6b62', '#8b887c');
}
/* cột độ trễ + thanh RSSI (tĩnh), vẽ từ xa tới gần */
rootBoard(0); [1, 2, 3].forEach(function (i) { leafBoard(NODES[i].x, i); });
[1, 2, 3].forEach(function (i) {
  var n = NODES[i], len = n.rssi * 1.05, q = [P(n.x - 30, 74, .2), P(n.x - 30 + len, 74, .2), P(n.x - 30 + len, 85, .2), P(n.x - 30, 85, .2)];
  sc.poly(plateG, q, '#d9432b', 'rgba(45,38,28,.6)', 1);
});
/* nhãn */
function place(id, x, y, z, dx, dy, anchor, fill) { var t = document.getElementById(id), q = P(x, y, z); t.setAttribute('x', (q[0] + dx).toFixed(1)); t.setAttribute('y', (q[1] + dy).toFixed(1)); t.setAttribute('text-anchor', anchor || 'start'); if (fill) t.setAttribute('fill', fill); svg.appendChild(t); return t; }
place('s15n0', 0, 92, 0, 0, 28, 'middle');
[1, 2, 3].forEach(function (i) {
  var n = NODES[i];
  place('s15n' + i, n.x, 92, 0, 0, 28, 'middle');
  place('s15h' + i, n.x, 92, 0, 0, 48, 'middle');
});
var vEl = [1, 2, 3].map(function (i) { var t = document.getElementById('s15v' + i); svg.appendChild(t); t.setAttribute('text-anchor', 'middle'); return t; });

/* ---- động ---- */
var TD = [0, NODES[1].ms * TS, NODES[2].ms * TS, NODES[3].ms * TS];   /* thời gian đi hết chuỗi của chunk Leaf i */
function ease(x) { x = I.clamp(x); return x * x * (3 - 2 * x); }
function pathOf(i) { var p = []; for (var k = i; k >= 0; k--) p.push([NODES[k].x, YB, 0]); return p; }   /* Leaf i -> ... -> Root */
function posOn(i, s) {                      /* s = giây kể từ lúc rời Leaf; mỗi chặng mất TD/i giây */
  var per = TD[i] / i, e = Math.min(i - 1, Math.floor(s / per)), f = I.clamp((s - e * per) / per);
  var a = NODES[i - e].x, b = NODES[i - e - 1].x;
  return [I.lerp(a, b, ease(f)), YB, 24 + 12 * Math.sin(Math.PI * f)];
}
function frame(t) {
  var tau = t % PER;
  sc.clear(dyn); sc.clear(linkG);
  for (var i = 1; i <= 3; i++) {                                    /* liên kết mesh giữa hai bo kề nhau */
    var a = NODES[i - 1].x, b = NODES[i].x, pp = [];
    for (var u = 0; u <= 14; u++) { var f = u / 14; pp.push([I.lerp(a, b, f), YB, 14 + 12 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  }
  var items = [], reset = I.clamp((tau - 6.3) / .5), k;
  for (k = 1; k <= 3; k++) {
    var s = tau - T0, full = HZ * NODES[k].ms / MSMAX, p = I.clamp(s / TD[k]), h = full * p * (1 - ease(reset));
    sc.clear(pillG[k - 1]);
    if (h > .3) sc.box(pillG[k - 1], NODES[k].x - 19, -62, 0, 38, 38, h, I.LEAF[k - 1]);
    var done = tau >= T0 + TD[k] && tau < 6.3, al = done ? ease((tau - T0 - TD[k]) / .3) : 0;
    vEl[k - 1].setAttribute('opacity', (Deck.still || document.documentElement.classList.contains('static')) ? 1 : al.toFixed(2));
    var q = P(NODES[k].x, -43, full + 12); vEl[k - 1].setAttribute('x', q[0].toFixed(1)); vEl[k - 1].setAttribute('y', q[1].toFixed(1));
    if (s >= 0 && s < TD[k]) { var c = posOn(k, s); items.push({ x: c[0] - 7, y: c[1] - 7, z: c[2], w: 14, d: 14, h: 14, t: I.LEAF[k - 1] }); }
  }
  sc.items(dyn, items);
}
Deck.frames.s15 = frame;

})();
/* 16-ket-luan.js */
;(function(){
/* Slide 16: chỉ làm sáng từng "ga" theo bước (Đạt được, Hạn chế, Hướng phát triển); nội dung là chữ tĩnh. */
var sl = document.getElementById('s16'), dots = sl.querySelectorAll('.cl');
Deck.steps.s16 = function (s) {
  var all = document.documentElement.classList.contains('static');
  Array.prototype.forEach.call(dots, function (c, i) { c.style.setProperty('--on', (all || s >= i) ? 1 : .35); c.querySelector('.dot').style.opacity = (all || s >= i) ? 1 : .35; });
};

})();
/* 17-du-phong-a.js */
;(function(){
/* Dự phòng A: hiện tại = painlessMesh (Arduino); hướng phát triển = ESP-WIFI-MESH (ESP-IDF), bản đã dựng một phần nằm trong thư mục lưu trữ. */
var svg = document.getElementById('b1fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 20, el: 32, rect: [0, 40, 492, 330], pts: [[-20, -110, -10], [330, -110, -10], [-20, 110, -10], [330, 110, -10], [60, 0, 70], [250, -40, 70], [250, 110, -50]] });
var P = sc.pt;
var plateG = sc.g(), objG = sc.g(), ghostG = sc.g(), dyn = sc.g();
sc.box(plateG, -20, -110, -10, 350, 220, 10, T.plate);
/* hiện tại: bo mạch thật (ESP32 + chip + anten) */
sc.box(objG, 20, -38, 0, 100, 76, 12, T.pcb); sc.box(objG, 30, -26, 12, 34, 28, 5, T.chip);
sc.cyl(objG, 96, 0, 12, 14, 16, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, 96, 0, 26, 2, 11, '#222', '#444', '#101010');
sc.box(objG, 30, 14, 12, 20, 10, 4, T.red);
/* hướng phát triển: bản "bóng" (chỉ có nét) + hộp lưu trữ đã dựng một phần */
function ghostBox(g, x, y, z, w, d, h) {
  var a = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]], k;
  [0, h].forEach(function (zz) { var l = sc.path(g, a.concat([a[0]]), zz + z, '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
  a.forEach(function (c) { var l = sc.line(g, [c[0], c[1], z], [c[0], c[1], z + h], '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
}
ghostBox(ghostG, 200, -90, 0, 100, 76, 12);
sc.cyl(ghostG, 276, -52, 12, 0.1, 16, '#ccc', '#ddd', 'rgba(0,0,0,0)');
sc.box(objG, 205, 30, 0, 90, 60, 36, T.stone);
for (var g2 = 0; g2 < 4; g2++) sc.line(objG, [209, 90.2, 7 + g2 * 8], [291, 90.2, 7 + g2 * 8], 'rgba(60,52,38,.45)', 1);
sc.box(objG, 205, 30, 36, 90, 60, 4, T.white);
/* nhãn (chữ có sẵn trong HTML, chỉ đặt vị trí) */
function place(id, x, y, z, dx, dy, anchor) { var t = document.getElementById(id), q = P(x, y, z); t.setAttribute('x', (q[0] + dx).toFixed(1)); t.setAttribute('y', (q[1] + dy).toFixed(1)); t.setAttribute('text-anchor', anchor || 'middle'); svg.appendChild(t); }
place('b1t1', 70, 0, 12, 0, -62); place('b1n1', 70, 110, -10, 0, 30);
place('b1t2', 250, -52, 12, 0, -52); place('b1n2', 250, 110, -10, 0, 30);
document.getElementById('b1n2').setAttribute('fill', '#645f52');
/* dòng chảy: hiện tại -> hướng phát triển */
Deck.frames.b1 = function (t) {
  sc.clear(dyn);
  var a = P(125, 0, 14), b = P(195, -40, 14);
  var l = sc.line(dyn, [125, 0, 14], [195, -40, 14], '#d9432b', 1.8); l.setAttribute('stroke-dasharray', '5 5'); l.setAttribute('stroke-dashoffset', (-t * 18) % 20);
  var items = [];
  for (var k = 0; k < 3; k++) { var s = ((t * .5 + k / 3) % 1), q = [I.lerp(125, 195, s), I.lerp(0, -40, s), 20 + 8 * Math.sin(Math.PI * s)]; items.push({ x: q[0] - 5, y: q[1] - 5, z: q[2], w: 10, d: 10, h: 10, t: I.LEAF[k] }); }
  sc.items(dyn, items);
};

})();
/* 18-du-phong-b.js */
;(function(){
/* Dự phòng B: hai thanh tốc độ UART vẽ đúng tỉ lệ (1 KB/s = 5,6 đơn vị dài): 11,5 : 92 = 1 : 8; hai mốc tải: 15,6 và 47 KB/s. */
var svg = document.getElementById('b2fig'), I = window.Iso, T = I.T;
var U = 5.6, V1 = 11.5, V2 = 92, M1 = 15.6, M2 = 47;
var sc = I.scene(svg, { az: 6, el: 28, rect: [0, 8, 1136, 304], pts: [[-135, -56, -10], [V2 * U + 50, -56, -10], [-135, 110, -10], [V2 * U + 50, 110, -10], [M2 * U, -46, 78], [0, 0, 52], [0, 80, 52]] });
var P = sc.pt;
var plateG = sc.g(), barsG = sc.g(), gateG = sc.g(), dyn = sc.g();
sc.box(plateG, -135, -56, -10, V2 * U + 185, 166, 10, T.plate);
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

})();
/* 19-du-phong-c.js */
;(function(){
/* Dự phòng C: trên = kiến trúc hiện tại (Root - middleware - dashboard nối thẳng bằng WebSocket, không cần broker);
   dưới = khi mở rộng nhiều Root / nhiều dashboard thì MQTT (qua broker) hợp lý. Làn dưới sáng lên ở bước 3. */
var svg = document.getElementById('b3fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 12, el: 30, rect: [0, 20, 656, 420], pts: [[-20, -160, -10], [350, -160, -10], [-20, 175, -10], [350, 175, -10], [200, -110, 90], [150, 175, -40]] });
var P = sc.pt, tx = sc.text;
var YA = -100, YB = 92;
var lanes = [
  { y: YA, plate: sc.g(), obj: sc.g(), dyn: sc.g() },
  { y: YB, plate: sc.g(), obj: sc.g(), dyn: sc.g() }
];
function stand(g, x, y) {                       /* màn hình dashboard: mặt màn quay về phía người xem */
  sc.box(g, x, y - 10, 0, 34, 20, 4, T.stone); sc.box(g, x + 14, y - 3, 4, 6, 6, 14, T.stone); sc.box(g, x, y - 3, 18, 34, 6, 26, T.dark);
  sc.poly(g, [P(x + 3, y + 3.2, 21), P(x + 31, y + 3.2, 21), P(x + 31, y + 3.2, 41), P(x + 3, y + 3.2, 41)], '#1d2a25', 'none', 0);
  [[6, 10], [13, 16], [20, 8], [26, 13]].forEach(function (b) { sc.poly(g, [P(x + b[0], y + 3.4, 23), P(x + b[0] + 4, y + 3.4, 23), P(x + b[0] + 4, y + 3.4, 23 + b[1]), P(x + b[0], y + 3.4, 23 + b[1])], '#7fd4a8', 'none', 0); });
}
function pcb(g, x, y) { sc.box(g, x, y - 22, 0, 46, 44, 8, T.pcb); sc.box(g, x + 4, y - 15, 8, 16, 14, 3, T.chip); sc.cyl(g, x + 34, y, 8, 9, 8, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(g, x + 34, y, 17, 2, 6, '#222', '#444', '#101010'); }
function ghostBox(g, x, y, z, w, d, h) {
  var a = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  [z, z + h].forEach(function (zz) { var l = sc.path(g, a.concat([a[0]]), zz, '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
  a.forEach(function (c) { var l = sc.line(g, [c[0], c[1], z], [c[0], c[1], z + h], '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
}
/* làn trên */
var L0 = lanes[0], y0 = YA;
sc.box(L0.plate, -20, y0 - 62, -10, 370, 124, 10, T.plate);
pcb(L0.obj, 0, y0);
sc.box(L0.obj, 46, y0 - 6, 0, 76, 12, 3, T.blue);
sc.box(L0.obj, 120, y0 - 26, 0, 56, 52, 38, T.stone); for (var g2 = 0; g2 < 4; g2++) sc.line(L0.obj, [124, y0 + 26.2, 7 + g2 * 7], [172, y0 + 26.2, 7 + g2 * 7], 'rgba(60,52,38,.45)', 1);
sc.box(L0.obj, 176, y0 - 6, 0, 122, 12, 3, T.blue);
stand(L0.obj, 298, y0);
ghostBox(L0.obj, 196, y0 - 56, 0, 70, 40, 26);                 /* broker: không cần */
sc.line(L0.obj, [196, y0 - 16, 0], [266, y0 - 16, 26], '#d9432b', 1.8); sc.line(L0.obj, [266, y0 - 16, 0], [196, y0 - 16, 26], '#d9432b', 1.8);
/* làn dưới */
var L1 = lanes[1], y1 = YB;
sc.box(L1.plate, -20, y1 - 78, -10, 370, 156, 10, T.plate);
pcb(L1.obj, 0, y1 - 40); pcb(L1.obj, 0, y1 + 40);
sc.box(L1.obj, 46, y1 - 46, 0, 60, 12, 3, T.blue); sc.box(L1.obj, 46, y1 + 34, 0, 60, 12, 3, T.blue);
sc.box(L1.obj, 108, y1 - 46, 0, 12, 92, 3, T.blue);
sc.box(L1.obj, 120, y1 - 30, 0, 70, 60, 26, T.stone); for (var g3 = 0; g3 < 3; g3++) sc.line(L1.obj, [124, y1 + 30.2, 6 + g3 * 7], [186, y1 + 30.2, 6 + g3 * 7], 'rgba(60,52,38,.45)', 1);
sc.box(L1.obj, 190, y1 - 6, 0, 40, 12, 3, T.blue);
sc.box(L1.obj, 228, y1 - 46, 0, 12, 92, 3, T.blue);
sc.box(L1.obj, 240, y1 - 46, 0, 52, 12, 3, T.blue); sc.box(L1.obj, 240, y1 + 34, 0, 52, 12, 3, T.blue);
stand(L1.obj, 292, y1 - 40); stand(L1.obj, 292, y1 + 40);
/* nhãn */
function lab(s, x, y, z, dx, dy, size, w, anchor, fill, cls) { var q = P(x, y, z); return tx(svg, q[0] + dx, q[1] + dy, s, size, w, anchor || 'middle', fill || '#26231c', cls || 'sf'); }
lab('Root', 22, y0, 24, 0, -14, 19, 700); lab('middleware', 148, y0, 42, 0, -12, 19, 700); lab('dashboard', 315, y0, 46, 0, -12, 19, 700);
lab('broker', 231, y0 - 56, 26, 0, -10, 15, 500, 'middle', '#645f52', 'mo');
var lb2 = [lab('Root', 22, y1 + 78, -10, 0, 22, 19, 700), lab('broker', 155, y1 + 78, -10, 0, 22, 19, 700), lab('dashboard', 315, y1 + 78, -10, 0, 22, 19, 700), lab('MQTT', 155, y1 - 30, 26, 0, -12, 15, 500, 'middle', '#1f4e9c', 'mo')];
/* động */
var cur = 0;
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.b3 = function (s) { cur = s; };
function run(g, pts, t, n, per, sp) {            /* các gói chạy dọc đường pts (3D) */
  var items = [], k;
  for (k = 0; k < n; k++) { var f = ((t * sp + k / n) % 1), q = I.along(pts, f); items.push({ x: q[0] - 5, y: q[1] - 5, z: q[2], w: 10, d: 10, h: 10, t: I.LEAF[(k + per) % 3] }); }
  return items;
}
Deck.frames.b3 = function (t) {
  var still = Deck.still || allOn(), on = still || cur >= 3;
  var a = [], b = [];
  sc.clear(L0.dyn); sc.clear(L1.dyn);
  a = a.concat(run(L0.dyn, [[24, y0, 14], [120, y0, 14]], t, 2, 0, .45), run(L0.dyn, [[176, y0, 5], [298, y0, 5]], t, 3, 1, .5));
  sc.items(L0.dyn, a);
  b = b.concat(run(L1.dyn, [[24, y1 - 40, 14], [114, y1 - 40, 14], [114, y1, 14], [150, y1, 14]], t, 2, 0, .4), run(L1.dyn, [[24, y1 + 40, 14], [114, y1 + 40, 14], [114, y1, 14], [150, y1, 14]], t + .6, 2, 1, .4),
    run(L1.dyn, [[190, y1, 5], [234, y1, 5], [234, y1 - 40, 5], [296, y1 - 40, 5]], t, 2, 2, .4), run(L1.dyn, [[190, y1, 5], [234, y1, 5], [234, y1 + 40, 5], [296, y1 + 40, 5]], t + .5, 2, 0, .4));
  sc.items(L1.dyn, b);
  var o = on ? 1 : .22;
  [L1.plate, L1.obj, L1.dyn].forEach(function (g) { g.setAttribute('opacity', o); });
  lb2.forEach(function (e) { e.setAttribute('opacity', o); });
};

})();
/* 20-du-phong-d.js */
;(function(){
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

})();
})();
