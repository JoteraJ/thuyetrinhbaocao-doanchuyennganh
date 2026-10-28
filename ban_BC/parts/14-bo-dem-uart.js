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
