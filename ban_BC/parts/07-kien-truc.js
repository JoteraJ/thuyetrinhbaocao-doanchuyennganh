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
