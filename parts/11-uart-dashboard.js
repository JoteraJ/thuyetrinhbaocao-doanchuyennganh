/* Slide 11: bộ đệm UART ở Root (bỏ khung ảnh nếu còn < ½, telemetry/log không bao giờ bị bỏ)
   -> cáp UART -> middleware: MAGIC -> LEN (≤ 131072) -> CRC -> Socket.IO -> dashboard.
   Lúc đầu chỉ có khung hợp lệ đi qua; từ bước "Lỗi chỉ bỏ phần hỏng" (kịch bản test 7/7) mới minh họa lỗi: rác trước MAGIC bị quét đi, khung quá dài bị chặn ở cổng LEN, khung sai CRC bị loại ở cổng CRC. */
var FZ0 = 62;                                                           /* độ cao khối dữ liệu đi vào (FZ); điểm [-56,…] giữ khối tới (rộng 38) khỏi bị cắt ở mép trái */
var svg = document.getElementById('s11fig'), I = window.Iso, T = I.T, LEAF = I.LEAF;
var sc = I.scene(svg, { az: 8, el: 36, rect: [2, 8, 700, 172],
  pts: [[-34, -38, -6], [536, -38, -6], [-34, 38, -6], [536, 38, -6], [30, 0, 72], [-34, -14, 74], [490, 0, 80], [-56, -14, FZ0], [-56, 14, FZ0]] });
var P = sc.pt, S = sc.S, C = sc.C;
function tx(g, x, y, str, size, w, anchor, fill, cls) { var e = sc.text(g, x, y, str, size, w, anchor, fill, cls); e.style.fill = fill; return e; }
var plateG = sc.g(), objG = sc.g(), dyn = sc.g(), lbG = sc.g();
var cur = 0;
function ST() { return (Deck.still && !/[?&]step=/.test(location.search)) ? 9 : cur; }
Deck.steps.s11 = function (n) {
  cur = n;
  var sec = document.getElementById('s11'); if (sec) sec.classList.toggle('d', n >= 2);   /* bước cuối "Dashboard": cột sơ đồ mờ đi, hai ảnh hiện (xem css) */
};
var BLUE = T.blue, GRN = T.green, TEL = { top: '#9dbfee', y: '#3f78c4', x: '#2d5a99' }, LOG = { top: '#bdb8a8', y: '#8c8878', x: '#6c6859' };
var RED = { top: '#ff9a82', y: '#d9432b', x: '#a8321f' }, AMB = { top: '#f2b24a', y: '#c98a1c', x: '#a06b10' };

/* ---------- cảnh tĩnh ---------- */
var X_START = 74, BELT0 = 114, BELT1 = 360, GX = [155, 235, 315], MX = 410;
sc.box(plateG, -34, -38, -6, 570, 76, 6, T.plate);
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
  var q = P(30 - 17, 15, 6 + 22); var hf = tx(lbG, q[0] - 6, q[1] + 8, '½', 26, 700, 'end', '#d9432b', 'sf'); hf.style.stroke = '#f6f1e7'; hf.style.strokeWidth = '3px'; hf.style.paintOrder = 'stroke';
  var strip = svg.parentNode;
  [['.g1', GX[0]], ['.g2', GX[1]], ['.g3', GX[2]], ['.g4', BELT1 + 34]].forEach(function (a) {
    var el = strip.querySelector(a[0]), p = P(a[1], 38, -6);
    el.style.left = p[0].toFixed(1) + 'px'; el.style.top = (p[1] + 6).toFixed(1) + 'px';
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
    var fate = ST() >= 1 ? f.fate : 'ok';   /* lỗi chỉ được minh họa từ bước 1 ("Lỗi chỉ bỏ phần hỏng") */
    var big = fate === 'len', b = body(f.kind, f.leaf || 0, big), x = X_START + V * (t - f.exit), z = 4, y = 0, a = 1, ejected = false;
    var tg = [ [GX[0] - 8, 'noise'], [GX[1] - 22, 'len'], [GX[2] - 10, 'crc'] ];
        if (fate === 'len' && x > tg[1][0]) {
      var u = (x - tg[1][0]) / 46; if (u < .6) { x = tg[1][0] + u * 4; } else { var w = I.clamp((u - .6) / .8); x = tg[1][0] + 2.4; y = 34 * w; z = 4 - 4 * w; a = 1 - w; }
      if (u > 1.5) return;
      if (u >= .55 && u < 1.1) tags.push({ p: P(GX[1], 0, 22), a: 1 - (u - .55) / .55 });
    } else if (fate === 'crc' && x > tg[2][0]) {
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
    if (!f.noise || ST() < 1) return;
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
