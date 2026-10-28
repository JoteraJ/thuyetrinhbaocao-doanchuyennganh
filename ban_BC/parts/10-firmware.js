/* Slide 10: firmware.
   A (Leaf): gửi lệch pha — 3 khe × 200 ms trong chu kỳ 600 ms, mỗi Leaf một khe; con trỏ thời gian quét qua 3 khe.
   B (Leaf): watchdog — mất beacon #ROOT: mức dâng, mốc 8 s học lại Root, mốc 30 s khởi động lại (vẽ đúng tỉ lệ 8:30).
   C (Root): 4 slot ghép — bitmap chunk, cầu chì timeout 2 s, supersede, LRU.
   Thời gian trong A và C được kéo dài 3 lần so với thực tế để nhìn được (cùng một đồng hồ): chú thích "hình động làm chậm";
   B chạy nhanh hơn thực tế (30 s mất beacon diễn ra trong ~12 s): chú thích "hình động tua nhanh".
   C chạy thường: 3 Leaf + supersede nên 4 slot không bao giờ đầy, không có LRU.
   Ở bước "Hết slot → loại khung cũ nhất (LRU)", C chuyển sang một trạng thái MINH HỌA riêng: 4 slot đều đầy khung dở dang,
   một khung mới tới, khung cũ nhất bị đẩy ra và nhãn LRU hiện đúng lúc đó. */
var I = window.Iso, T = I.T, LEAF = I.LEAF;
function txt(g, x, y, s, size, w, anchor, fill, cls) {
  var e = I.el('text', { x: x.toFixed(1), y: y.toFixed(1), 'font-size': size, 'font-weight': w || 400, 'text-anchor': anchor || 'middle', class: cls || '' }, g);
  e.style.fill = fill; e.textContent = s; return e;
}
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
var lruRef = null;
function lruOn() { var q = ST(); return q === 1 || q === 9; }            /* bước 1 (hoặc hiện đủ) = trạng thái minh họa LRU */
Deck.steps.s10 = function (n) {
  cur = n; lruRef = null;
  var b = document.querySelector('#s10 .slow.lru'); if (b) b.hidden = !lruOn();
};
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
  FR.forEach(function (f) {                                                      /* lượt 1: thời điểm chunk đầu/cuối */
    var got = f.arr.filter(function (a) { return a != null; });
    f.first = got[0]; f.last = Math.max.apply(null, got);
  });
  FR.forEach(function (f) {                                                      /* lượt 2: số phận khung (cần f.first của khung kế) */
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
function lab(g, x, y, str, w, fill) { var e = txt(g, x, y, str, 14, w, 'end', fill, 'mo'); e.style.stroke = '#bfcecd'; e.style.strokeWidth = '3px'; e.style.paintOrder = 'stroke'; return e; }
function frameC(t) {
  sC.clear(C_dy); sC.clear(C_tx);
  var items = [], P = sC.pt, tags = [], i, k;
  FR.forEach(function (f) {
    var b = f.bin, y0 = Y0[b] + 1, last = -1, c, k2;
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
  /* "bitmap": nhãn tĩnh cạnh hàng ô (nhường chỗ cho nhãn sự kiện) */
  var used = {}; tags.forEach(function (g) { if (g.kind !== 'x') used[g.b] = 1; });
  if (!used[3]) { var bq = P(22, Y0[3] + 1 + BH / 2, 14); lab(C_tx, bq[0] - 24, bq[1] + 5, 'bitmap', 500, '#645f52'); }
}

/* ===== C ở bước LRU: trạng thái minh họa — hết slot thì loại khung cũ nhất ===== */
var LRUP = 9.6, OLD = [[0, 1, 2], [0, 1], [0, 1, 3, 4], [0, 3]], AGEF = [.3, .5, .72, .92];   /* slot 0 = khung cũ nhất (cầu chì ngắn nhất) */
var T_HOV = 2.0, T_EV = 3.0, T_EJ = 1.1, NEWT = [4.5, 5.2, 5.9, 6.6], BGC = '#bfcecd';
function sm(u) { u = I.clamp(u); return u * u * (3 - 2 * u); }
function fadeT(tt, u) { return { top: I.mix(tt.top, BGC, u), y: I.mix(tt.y, BGC, u), x: I.mix(tt.x, BGC, u) }; }
function frameCL(tau) {
  sC.clear(C_dy); sC.clear(C_tx);
  var items = [], P = sC.pt, s2, j, k, gfade = I.clamp((LRUP - tau) / .7), ev = tau >= T_EV;
  C_dy.setAttribute('opacity', gfade.toFixed(2)); C_tx.setAttribute('opacity', gfade.toFixed(2));
  for (s2 = 0; s2 < 4; s2++) {
    var y0 = Y0[s2] + 1;
    OLD[s2].forEach(function (kc, idx) {
      if (tau < .12 * (s2 * 2 + idx)) return;
      var x = CXS[kc], z = 13.8, tt = T.chip;
      if (s2 === 0 && ev) {                               /* khung cũ nhất bị đẩy ra: đỏ rồi nhấc lên, trượt sang trái, mờ dần */
        var u = I.clamp((tau - T_EV) / T_EJ);
        if (u >= 1) return;
        z = 13.8 + 24 * sm(u * 1.6); x = CXS[kc] - 80 * sm(u); tt = fadeT(RED, I.clamp((u - .35) / .65));
      }
      items.push({ x: x, y: y0 + 3, z: z, w: 20, d: BH - 6, h: 4, t: tt });
    });
    if (!(s2 === 0 && ev)) {                              /* cầu chì: độ dài = tuổi khung, slot 0 ngắn nhất */
      var fr = AGEF[s2], fc = fr > .5 ? T.green : fr > .25 ? AMB : RED;
      items.push({ x: 28, y: y0 + BH + 2.5, z: 8.5, w: 130 * fr, d: 1.8, h: 3.4, t: fc });
    }
  }
  /* khung mới: chunk đầu bay tới, chờ trước cửa vì hết slot, rồi vào slot vừa trống; các chunk sau theo sau */
  var cy = slotY(0), pos, newc = [];
  if (tau >= 1.0 && tau < NEWT[0]) {
    if (tau < T_HOV) pos = I.along([[-150, 0, 44], [4, cy, 44]], sm((tau - 1.0) / (T_HOV - 1.0)));
    else if (tau < NEWT[0] - .5) pos = [4, cy, 44 + 2 * Math.sin(tau * 9)];
    else pos = I.along([[4, cy, 44], [CXS[0] + 9, cy, 44], [CXS[0] + 9, cy, 18]], (tau - (NEWT[0] - .5)) / .5);
    newc.push(pos);
  }
  for (k = 1; k < 4; k++) {
    var lt = tau - (NEWT[k] - .5);
    if (lt >= 0 && lt < .5) newc.push(I.along([[-150, 0, 44], [CXS[k] + 9, cy, 44], [CXS[k] + 9, cy, 18]], lt / .5));
  }
  newc.forEach(function (q) { items.push({ x: q[0] - 4.5, y: q[1] - 4.5, z: q[2], w: 9, d: 9, h: 9, t: AMB }); });
  for (k = 0; k < 4; k++) if (tau >= NEWT[k]) items.push({ x: CXS[k], y: Y0[0] + 4, z: 13.8, w: 20, d: BH - 6, h: 4, t: AMB });
  if (tau >= NEWT[0]) items.push({ x: 28, y: Y0[0] + 1 + BH + 2.5, z: 8.5, w: 130 * I.clamp(1 - (tau - NEWT[3]) / 6), d: 1.8, h: 3.4, t: T.green });
  sC.items(C_dy, items);
  /* hết slot: viền cả 4 slot nhấp nháy hổ phách trước khi loại */
  if (tau >= T_HOV && tau < T_EV + .6) for (s2 = 0; s2 < 4; s2++) {
    var yy = Y0[s2] + 1, e = sC.path(C_tx, [[24, yy - 3], [162, yy - 3], [162, yy + BH + 4], [24, yy + BH + 4], [24, yy - 3]], 13.9, s2 === 0 && ev ? '#d9432b' : '#b86a00', s2 === 0 && ev ? 2.6 : 1.6);
    e.setAttribute('opacity', (s2 === 0 && ev ? 1 : .55 + .45 * Math.sin(tau * 7)).toFixed(2));
  }
  /* nhãn LRU hiện đúng lúc khung cũ nhất bị đẩy ra */
  var q2 = P(22, slotY(0), 14);
  if (ev && tau < LRUP - 1.2) lab(C_tx, q2[0] - 16, q2[1] + 5, 'LRU', 700, '#d9432b');
  var bq = P(22, Y0[3] + 1 + BH / 2, 14); lab(C_tx, bq[0] - 24, bq[1] + 5, 'bitmap', 500, '#645f52');
}

Deck.frames.s10 = function (t) {
  var tr = t; t = ((t % LOOP) + LOOP) % LOOP;
  frameA(t); frameB(t);
  C_dy.removeAttribute('opacity'); C_tx.removeAttribute('opacity');
  if (lruOn()) {
    var tau; if (Deck.still) tau = tr % LRUP; else { if (lruRef === null) lruRef = tr; tau = (tr - lruRef) % LRUP; }
    frameCL(tau);
  } else frameC(t);
};
