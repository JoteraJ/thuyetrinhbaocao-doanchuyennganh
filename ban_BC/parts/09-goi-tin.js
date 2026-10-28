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
var NS = 5, W = 30, D = 96, Y0 = -48, XP = 250, HL = 8, HT = 5, PT = 5;
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

/* ---- mô hình thời gian (chu kỳ 10,2 s; hình động làm chậm so với thực tế) ----
   Lưỡi cắt quét từ đầu khung về cuối, mỗi 0,9 s cắt một chunk. Chunk k+1 chỉ bị cắt sau khi chunk k đã nhấc lên xong,
   nên header vừa gắn không bao giờ chạm chunk đứng trước; lưỡi cắt không quay lại mà nâng lên rồi mờ đi.
   Khi đủ 5 chunk, Root sáng đèn rồi nhấc khung đã ghép đi tiếp. Luôn có ít nhất một vật chuyển động có nghĩa. */
var PER = 10.2, CUT = [0.9, 1.8, 2.7, 3.6, 4.5], DUR = [3, 3, 3, 3, 3], ZF = [36, 36, 36, 36, 36];
var X0 = [], SLOT = [];
for (var kk = 0; kk < NS; kk++) { X0.push(XP - W * (kk + 1)); SLOT.push(630 - W * (kk + 1)); }
function launch(k) { return CUT[k] + .6; }
function arrive(k) { return launch(k) + DUR[k]; }
function ease(u) { u = I.clamp(u); return u * u * (3 - 2 * u); }
var DONE = Math.max.apply(null, [0, 1, 2, 3, 4].map(arrive)), SHIP0 = DONE + .5, SHIP = 1.1;
function bladeX(t) {                                   /* lưỡi cắt quét từ đầu khung (x lớn) về cuối */
  var kx = [[.4, 262], [CUT[0], X0[0]], [CUT[1], X0[1]], [CUT[2], X0[2]], [CUT[3], X0[3]], [CUT[4], X0[4]]];
  for (var i = 0; i < kx.length - 1; i++) if (t < kx[i + 1][0]) return I.lerp(kx[i][1], kx[i + 1][1], I.clamp((t - kx[i][0]) / (kx[i + 1][0] - kx[i][0])));
  return X0[4];
}

function frame(t) {
  var step = ST();
  t = ((t % PER) + PER) % PER;
  sc.clear(dyn); sc.clear(linkG);
  var dr = [];                                          /* các vật động, sắp theo độ sâu */
  function add(x, y, z, w, d, fn, op) { dr.push({ key: (x + w / 2) * S + (y + d / 2) * C + z * .0001, fn: fn, op: op }); }
  var glow = step === 3 ? .5 + .5 * Math.sin(t * 6) : 0;
  var fin = ease(t / .5), shp = I.clamp((t - SHIP0) / SHIP), fout = 1 - ease(shp);   /* khung mới hiện; khung đã ghép được nhấc đi */
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
    if (onRoot) { xs = x + 30 * ease(shp); zs = z + 30 * ease(shp); add(xs, Y0, zs, W, D, (function (xx, zz2, kq) { return function (g) { strip(g, kq, xx, zz2); }; })(xs, zs, k), fout); }
    else add(xs, Y0, zs, W, D, (function (xx, zz2, kq) { return function (g) { strip(g, kq, xx, zz2); }; })(xs, zs, k), t < ct ? fin : 1);
    if (showH && !onRoot) {
      var hxx = xs + W, hzz = zs + (hz || 0) + 16 * hop, hop2 = hop;
      add(hxx, Y0, hzz, HL, D, (function (xx, zz2, gl) { return function (g) { header(g, xx, zz2, gl); }; })(hxx, hzz, glow), 1 - hop2);
    }
  }
  dr.sort(function (a, b) { return a.key - b.key; });
  dr.forEach(function (o) { var g = I.el('g', {}, dyn); if (o.op < 1) g.setAttribute('opacity', o.op.toFixed(2)); o.fn(g); });

  /* lưỡi cắt: cổng trượt trên hai ray (xanh lá ở bước 4: phân mảnh tự viết ở tầng ứng dụng); cắt xong thì nâng lên và mờ đi */
  if (t < 5.4) {
    var bx = bladeX(t), g4 = step === 4, bt = g4 ? { top: '#6fcf9f', y: '#1b7f5c', x: '#12583f' } : T.dark;
    var up = 50 * ease((t - (CUT[4] + .3)) / .6);
    var gb = I.el('g', { opacity: (t < .4 ? fin : I.clamp(1 - (t - (CUT[4] + .3)) / .6)).toFixed(2) }, dyn);
    sc.box(gb, bx - 3, -60, 3 + up, 6, 6, 40, bt);
    sc.poly(gb, [P(bx, -54, 3 + up), P(bx, 54, 3 + up), P(bx, 54, 36 + up), P(bx, -54, 36 + up)], g4 ? 'rgba(27,127,92,.22)' : 'rgba(28,27,25,.14)', g4 ? '#1b7f5c' : '#1c1b19', 1.2);
    sc.box(gb, bx - 3, 54, 3 + up, 6, 6, 40, bt);
    sc.box(gb, bx - 3, -60, 41 + up, 6, 120, 4, bt);
  }

  /* đèn báo Root: sáng khi đủ khung */
  if (landed === NS && shp < 1) sc.box(dyn, 450, 50, 10, 5, 5, 3, { top: '#e9ffe9', y: '#7ee0a8', x: '#4fb77f' });

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
