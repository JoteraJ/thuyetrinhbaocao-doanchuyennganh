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
