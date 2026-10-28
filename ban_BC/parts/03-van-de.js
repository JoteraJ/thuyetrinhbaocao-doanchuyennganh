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
  var q = sc.pt(ROOT[0], ROOT[1] + 31 * US + 4, 0); sc.text(M.lab, q[0], q[1] + 17, 'Root', 17, 700, 'middle', '#26231c', 'sf');   /* nhãn nằm ngay phía trước khối Root */
}
Deck.frames.s3 = function (t) { starFrame(t); meshFrame(t); };
