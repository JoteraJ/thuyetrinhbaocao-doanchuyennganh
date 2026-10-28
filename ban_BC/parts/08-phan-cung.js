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
