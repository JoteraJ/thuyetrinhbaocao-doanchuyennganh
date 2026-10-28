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
var Bm = mk('s5b', 0, 30, 240, 26, 56, [4, 36, 544, 78]);   /* svg 5b cao 138 (cao hơn 20 so với các hình khác) để tên giao thức nằm trên khối kể cả lúc nhảy */
var PB_X = [-208, -112, -16], PB_NAME = ['AODV', 'OLSR/DSDV', 'B.A.T.M.A.N'], PB = 10.5, GATE = 64;
label(Bm, -112, 25, 0, 'Linux/tầng IP', '#645f52', 18, 'middle', 13);
label(Bm, 165, 25, 0, 'ESP32', '#645f52', 18, 'middle', 13);
label(Bm, 182, 0, 32, 'painlessMesh', '#d9432b', -6, 'middle', 14);
function frameB(t) {
  var sc = Bm.sc, tm = t % PB, bl = [], names = [], k = Math.floor(tm / 3.5), s = (tm % 3.5) / 3.5, hit = false;
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
      if (s > .15 && s < .5) { var f = sm((s - .15) / .35); px = I.lerp(x, GATE - 36, f); pz = 5 + 26 * Math.sin(Math.PI * f) * (1 - .25 * f); }
      else if (s >= .5 && s < .68) { px = GATE - 36 - (s - .5) * 4; hit = true; }
      else if (s >= .68 && s < .95) { var g = sm((s - .68) / .27); px = I.lerp(GATE - 37, x, g); pz = 5 + 20 * Math.sin(Math.PI * g); }
    }
    bl.push({ k: dk(sc, px, 0) + (j === k && s > .15 && s < .95 ? 60 : 0), f: function () { sc.box(Bm.obj, px - 28, -16, pz, 56, 32, 26, T.chip); sc.box(Bm.obj, px - 22, 16, pz + 6, 44, 0.4, 14, T.dark); } });
    names.push([px, pz, j]);
  });
  flush(bl);
  /* tên giao thức nằm ngay trên khối của nó (đi theo khi khối nhảy), không đè lên khối */
  names.forEach(function (n) { var hw = PB_NAME[n[2]].length * 7.8 / 2 / sc.K, q = sc.pt(Math.min(n[0], GATE - 9 - hw), -16, n[1] + 26);   /* không cho nhãn dài chạm cột rào */
    sc.text(Bm.top, q[0], q[1] - 5, PB_NAME[n[2]], 13, 500, 'middle', null, 'mo').style.fill = '#26231c'; });
  if (hit) cross(Bm, GATE + 2, 0, 16);
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
  sc.box(D.top, hx - 1.2, -22, 0, 2.4, 44, 22, { top: '#1c1b19', y: '#1c1b19', x: '#1c1b19' });
}
Deck.frames.s5 = function (t) { frameA(t); frameB(t); frameC(t); frameD(t); };
