/* Slide 14: hai bộ đệm UART TX (8 KB của test19, 16 KB của test21) như hai bể chứa.
   Root ghép xong từng KHUNG ẢNH (tấm phẳng có hình nhỏ, như khung ghép xong ở slide 7) và đẩy ra từ khối ghép;
   cùng một dòng khung (3 Leaf, theo cụm) đi vào hai bể, rút ra theo tốc độ UART tới PC.
   Bể 8 KB không đủ chỗ cho cả khung -> khung bị bỏ, rơi NGUYÊN TẤM ra ngoài (uartDrop); bể 16 KB còn chỗ -> không rơi.
   Chỉ có các số của bảng gốc được hiển thị; kích thước khung/mức nước trong mô hình chỉ để minh họa (không in ra).
   Hai bể giữ đúng tỉ lệ 1 : 2 (cùng chiều cao, diện tích đáy gấp đôi). */
var svg = document.getElementById('s14fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 10, el: 38, rect: [112, 14, 468, 326],
  pts: [[-14, -132, -10], [322, -132, -10], [-14, 156, -10], [322, 156, -10], [130, 86, 80], [130, -82, 80], [130, -142, 0]] });
var P = sc.pt;
var PER = 6.4, NF = 3, A0 = .3, DA = .25, TBT = 1.1, RATE = 4.5, EXIT = 1.0, FS = 5;   /* FS: kích thước khung (đơn vị mô hình); bể 8 -> cap 8, bể 16 -> cap 16 */
var FW = 20, FD = 14, FH = 3;                                       /* khung ảnh: dài (x) × rộng (y) × dày */
var RIGS = [
  { yc: -82, cap: 8, Ht: 46, d: 20, pd: 50, name: 'test19', kb: '8 KB', drop: '137 → 480', lat: '280 ms', ms: 280, col: '#d9432b', dir: -1, off: 40 },
  { yc: 86, cap: 16, Ht: 46, d: 40, pd: 70, name: 'test21', kb: '16 KB', drop: '0', lat: '199 ms', ms: 199, col: '#1b7f5c', dir: 1, off: 54 }
];
var LQ = { top: '#b9d0f0', y: '#4a82cf', x: '#2d5a99' };
var DEAD = { top: '#f3b9ad', y: '#d9432b', x: '#a8301c' };
var LATK = .4;                                                    /* 1 ms = 0,4 đơn vị dài: độ dài thanh tỉ lệ đúng 280 : 199 */
var X0 = 100, X1 = 160, TX = 130, BX = 66;                        /* thành bể theo x; TX = tâm bể; BX = tâm khối ghép */
var BELT = 4.5;

/* ---- mô hình: cùng một dòng khung, bể có dung lượng khác nhau; khung chỉ vào bể khi còn đủ chỗ cho CẢ khung ---- */
function simulate(cap) {
  var dt = .002, L = 0, dr = 0, ji = 0, t, j, k, cs = [], acc = [], emits = [], N = Math.round(PER / dt), grid = new Float32Array(N + 1);
  for (j = 0; j < NF; j++) cs.push(A0 + j * DA + TBT);
  for (k = 0; k <= N; k++) {
    t = k * dt;
    while (ji < NF && cs[ji] <= t) { if (L + FS > cap + 1e-9) acc[ji] = false; else { acc[ji] = true; L += FS; } ji++; }
    if (L > 0) { var d = Math.min(L, RATE * dt); L -= d; dr += d; while (dr >= FS - 1e-9) { dr -= FS; emits.push(t); } }
    grid[k] = L;
  }
  var order = []; for (j = 0; j < NF; j++) if (acc[j]) order.push(j);
  return { cs: cs, acc: acc, emits: emits, order: order, grid: grid, dt: dt };
}
RIGS.forEach(function (R) { R.sim = simulate(R.cap); });
function levelAt(R, tau) { var s = R.sim, x = tau / s.dt, i = Math.floor(x), f = x - i; return s.grid[i] * (1 - f) + s.grid[Math.min(i + 1, s.grid.length - 1)] * f; }
function ease(x) { x = I.clamp(x); return x * x * (3 - 2 * x); }

/* ---- vật thể tĩnh ---- */
function face(g, pts, fill, stroke, sw) { sc.poly(g, pts.map(function (q) { return P(q[0], q[1], q[2]); }), fill, stroke || 'rgba(45,38,28,.55)', sw == null ? .9 : sw); }
RIGS.forEach(function (R) {
  var y = R.yc, g = R.g = { plate: sc.g(), obj: sc.g(), back: sc.g(), liq: sc.g(), inn: sc.g(), front: sc.g(), out: sc.g() };
  sc.box(g.plate, -14, y - R.pd, -10, 336, 2 * R.pd, 10, T.plate);
  [[-6, y - R.pd + 8], [314, y - R.pd + 8], [-6, y + R.pd - 8], [314, y + R.pd - 8]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.4, fill: '#8c8470' }, g.plate); });
  /* Root: bo mạch + chip + ăng-ten */
  sc.box(g.obj, 0, y - 22, 0, 44, 44, 7, T.pcb); sc.box(g.obj, 5, y - 15, 7, 16, 14, 3, T.chip);
  sc.cyl(g.obj, 31, y, 7, 9, 9, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(g.obj, 31, y, 16, 2, 6.5, '#222', '#444', '#101010');
  /* khối ghép của Root: khay đá có 4 slot; khung ghép xong từ đây đi ra */
  sc.box(g.obj, 46, y - 19, 0, 40, 38, 10, T.stone);
  for (var k = 0; k < 4; k++) sc.box(g.obj, BX - 15, y - 16 + k * 8.6, 10, 30, 7, .6, T.dark);
  /* đường ra từ khối ghép: ray dốc lên rồi chạy phẳng tới miệng bể */
  sc.path(g.obj, [[BX + 18, y, 10.5], [96, y, R.Ht + 9], [TX + 14, y, R.Ht + 9]], 0, '#1f1e1b', 3.4);
  sc.box(g.obj, X0 - 2, y - R.d - 2, 0, 64, 2 * R.d + 4, 4, T.stone);             /* đế bể */
  sc.box(g.obj, X1 + 2, y - 9, 0, 20, 18, BELT, T.dark);            /* ống ra */
  sc.box(g.obj, 182, y - 9, 0, 80, 18, BELT, T.blue);               /* băng tải UART */
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
  face(g.front, [[X1, y - 8, 4], [X1, y + 8, 4], [X1, y + 8, 10], [X1, y - 8, 10]], '#1f1e1b');
  for (var m = 1; m <= 3; m++) { var zz = 4 + (H - 6) * m / 4; sc.line(g.front, [X0 + 2, y1, zz], [X0 + 12, y1, zz], 'rgba(28,27,25,.55)', 1.1); }
  sc.path(g.front, [[X0, y0, H], [X1, y0, H], [X1, y1, H], [X0, y1, H], [X0, y0, H]], H, '#1c1b19', 1.8);
  [[X1, y1], [X1, y0], [X0, y1]].forEach(function (c) { sc.line(g.front, [c[0], c[1], 4], [c[0], c[1], H], 'rgba(28,27,25,.7)', 1.4); });
});
/* đầu đề từng làn (số lấy từ bảng) */
var lab = sc.g();
RIGS.forEach(function (R) {
  var q = P(-14, R.yc, 0);
  sc.text(lab, 4, q[1] - 2, R.name, 24, 700, 'start', '#26231c', 'sf');
  sc.text(lab, 4, q[1] + 19, R.kb, 17, 700, 'start', '#1f4e9c', 'mo');
});
/* kết quả (hiện từ bước 1): uartDrop + thanh độ trễ tỉ lệ đúng */
RIGS.forEach(function (R) {
  var g = R.res = sc.g(), y = R.yc;
  var a = R.dir < 0 ? P(X0 - 26, y - R.pd, 0) : P(TX, y + R.pd, 0);
  R.dropT = R.dir < 0 ? sc.text(g, a[0], a[1] - 8, 'uartDrop ' + R.drop, 17, 700, 'end', R.col, 'mo') : sc.text(g, a[0], a[1] + 22, 'uartDrop ' + R.drop, 17, 700, 'middle', R.col, 'mo');
  var h = P(-14, y, 0);
  R.latL = sc.text(g, 4, h[1] + 42, 'độ trễ TB', 14, 500, 'start', '#645f52', 'mo');
  R.latV = sc.text(g, 4, h[1] + 66, R.lat, 25, 700, 'start', R.col, 'sf');
  R.strip = sc.g(g);
});
function drawStrip(R, p) {
  var y = R.yc, len = R.ms * LATK * ease(p), g = R.strip;
  sc.clear(g);
  if (len < .5) return;
  var x0 = 182, z = .2, pts = [P(x0, y + 28, z), P(x0 + len, y + 28, z), P(x0 + len, y + 40, z), P(x0, y + 40, z)];
  sc.poly(g, pts, R.col, 'rgba(45,38,28,.6)', 1);
}

/* ---- khung ảnh: tấm phẳng (đế màu theo Leaf) có hình nhỏ ở mặt trên; xén theo x để trượt ra/vào khe ---- */
function topRect(items, x0, x1, y0, y1, z, fill, lo, hi) {            /* hình chữ nhật phẳng trên mặt khung, xén theo [lo,hi] */
  x0 = Math.max(x0, lo); x1 = Math.min(x1, hi);
  if (x1 - x0 < .3) return;
  items.push(function (g) { sc.poly(g, [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], fill, 'rgba(10,32,48,.45)', .5); });
}
/* trả về mục vẽ: {x,y,z,w,d,h,t, deco:[hàm vẽ]} cho khung có tâm (cx,cy), đáy ở z, dày hh; chỉ hiện đoạn x∈[lo,hi] */
function frameItem(cx, cy, z, hh, t, lo, hi) {
  var x0 = cx - FW / 2, x1 = cx + FW / 2, vx0 = Math.max(x0, lo == null ? -1e9 : lo), vx1 = Math.min(x1, hi == null ? 1e9 : hi);
  if (vx1 - vx0 < .4 || hh < .15) return null;
  var it = { x: vx0, y: cy - FD / 2, z: z, w: vx1 - vx0, d: FD, h: hh, t: t, deco: [] };
  var zt = z + hh + .04, y0 = cy - FD / 2;
  if (hh > FH * .6) {
    topRect(it.deco, x0 + 2, x1 - 2, y0 + 2, y0 + FD - 2, zt, '#f1f8f4', vx0, vx1);           /* hình */
    topRect(it.deco, x0 + 4.5, x0 + 9, y0 + 4.5, y0 + 9, zt + .02, '#232a30', vx0, vx1);       /* chi tiết nhỏ trong hình */
  }
  return it;
}
function drawItems(g, items) {
  items.sort(function (a, b) { return (a.x + a.w / 2) * sc.S + (a.y + a.d / 2) * sc.C + a.z * .0001 - ((b.x + b.w / 2) * sc.S + (b.y + b.d / 2) * sc.C + b.z * .0001); });
  items.forEach(function (it) { sc.box(g, it.x, it.y, it.z, it.w, it.d, it.h, it.t); if (it.deco) it.deco.forEach(function (f) { f(g); }); });
}

/* ---- động ---- */
var cur = 0, resAt = -1;
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.s14 = function (s) { cur = s; if (s >= 1 && resAt < 0) resAt = performance.now(); if (s < 1) resAt = -1; };
Deck.shows.s14 = function () { resAt = -1; };
function drawRig(R, tau) {
  var g = R.g, y = R.yc, H = R.Ht, s = R.sim, j, m, items = [], inner = [], ZT = H + 11;
  sc.clear(g.liq); sc.clear(g.inn); sc.clear(g.out);
  var Ld = levelAt(R, tau);
  for (j = 0; j < NF; j++) if (s.acc[j]) { var u0 = tau - s.cs[j]; if (u0 >= 0 && u0 < .35) Ld -= FS * (1 - ease(u0 / .35)); }
  Ld = Math.max(0, Math.min(R.cap, Ld));
  var hl = Ld / R.cap * (H - 6);
  if (hl > .1) sc.box(g.liq, X0 + 2, y - R.d + 2, 4, 56, 2 * R.d - 4, hl, LQ);
  var surf = 4 + hl;
  for (m = 0; m < 8; m++) { var ux = 182 + ((m * 10 + tau * 40) % 80); sc.line(g.out, [ux, y - 8, BELT + .1], [ux, y + 8, BELT + .1], 'rgba(255,255,255,.3)', 1.4); }
  /* khung ghép xong: từ khối ghép -> ray -> miệng bể */
  for (j = 0; j < NF; j++) {
    var age = tau - (A0 + j * DA), leaf = I.LEAF[j % 3], x, z, yy = y, hh = FH, tt = leaf, tgt = items, op = 1;
    if (age < 0) continue;
    if (age < .3) { x = BX; z = 10.6; hh = FH * ease(age / .3); }
    else if (age < .8) { var f = ease((age - .3) / .5); x = I.lerp(BX, 96, f); z = I.lerp(10.6, ZT, f); }
    else if (age < TBT) { x = I.lerp(96, TX, ease((age - .8) / (TBT - .8))); z = ZT; }
    else {
      var u = age - TBT; x = TX;
      if (s.acc[j]) { if (u >= .2) continue; z = I.lerp(ZT, surf, (u / .2) * (u / .2)); if (z < H + 2) tgt = inner; }
      else {
        tt = DEAD;
        if (u < .25) { var q = ease(u / .25); yy = y + R.dir * R.off * q; z = ZT + 8 * Math.sin(Math.PI * q); }
        else if (u < .6) { var f2 = (u - .25) / .35; yy = y + R.dir * R.off; z = I.lerp(ZT, 0, f2 * f2); }
        else if (u < 1.2) { yy = y + R.dir * R.off; z = 0; op = 1 - (u - .6) / .6; }
        else continue;
      }
    }
    var it = frameItem(x, yy, z, hh, tt);
    if (!it) continue;
    if (op < 1) { var gg = sc.g(g.out); gg.setAttribute('opacity', op.toFixed(2)); drawItems(gg, [it]); } else tgt.push(it);
  }
  /* khung rút ra theo UART tới PC (khớp thứ tự FIFO), trượt ra khỏi miệng bể và vào khe của PC */
  s.emits.forEach(function (te) {
    var a = tau - te; if (a < 0) a += PER; if (a >= EXIT) return;
    var xf = I.lerp(X1 + 2, 264 + FW, a / EXIT);
    var it = frameItem(xf - FW / 2, y, BELT, FH, I.LEAF[s.order[s.emits.indexOf(te)] % 3], X1, 264);
    if (it) items.push(it);
  });
  drawItems(g.inn, inner); drawItems(g.out, items);
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
