/* Slide 7: kiến trúc. Chỉ có 1 Root + 3 Leaf; Leaf cũng là node chuyển tiếp; mạng là cây (1 chặng ↔ 3 chặng). */
var svg = document.getElementById('s7fig'), I = window.Iso, T = I.T;
/* viewBox 1136×448 = đúng cỡ khung hình (1136×448 px) nên 1 đơn vị = 1 px, nhãn 13 là 13 px thật */
var sc = I.scene(svg, { az: 22, el: 30, rect: [26, 29, 1084, 382],
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
function name(x, y, z, a, b, up) { var q = P(x, y, z); tx(lb, q[0], q[1] - up, a, 20, 700, 'middle', '#26231c', 'sf'); tx(lb, q[0], q[1] - up + 18, b, 14, 500, 'middle', '#6b6455', 'mo'); }
/* tên Leaf nằm phía trước bo mạch (dưới góc thấp nhất của bo), không đè lên bo hay dây nối */
[0, 1, 2].forEach(function (i) {
  var cx = N.L[i][0], cy = N.L[i][1], low = P(cx + 32, cy + 26, 0), mid = P(cx, cy, 0);
  tx(lb, mid[0] + 6, low[1] + 22, 'Leaf ' + (i + 1), 18, 700, 'middle', '#26231c', 'sf'); tx(lb, mid[0] + 6, low[1] + 40, 'ESP32-CAM', 14, 500, 'middle', '#6b6455', 'mo');
});
name(545, -52, 14, 'Root', 'ESP32 DevKitC', 60);
name(760, -48, 48, 'Middleware', 'Node.js', 36);
name(930, -5, 118, 'Dashboard', 'React', 36);
[['LỚP 1 · MESH', 275, 120], ['LỚP 2', 656, 120], ['LỚP 3 · PC', 851, 120]].forEach(function (l, i) { var q = P(l[1], l[2], -10); tx(lb, q[0] + 6, q[1] + 24, l[0], 14, 500, 'middle', ['#d9432b', '#1f4e9c', '#1b7f5c'][i], 'mo').setAttribute('letter-spacing', '1.5'); });
var uart = P(660, 0, 3), ws = P(826, 0, 3);
tx(lb, uart[0], uart[1] + 38, 'UART', 14, 500, 'middle', '#1f4e9c', 'mo'); tx(lb, uart[0], uart[1] + 54, '921600', 14, 500, 'middle', '#1f4e9c', 'mo');
tx(lb, ws[0], ws[1] + 38, 'Socket.IO', 14, 500, 'middle', '#1b7f5c', 'mo'); tx(lb, ws[0], ws[1] + 54, 'WebSocket', 14, 500, 'middle', '#1b7f5c', 'mo');
tx(lb, 0, 22, 'chuyển tiếp đa chặng (đã thử 1 và 3 chặng)', 14, 500, 'start', '#d9432b', 'mo');
var modeTxt = tx(lb, 0, 42, '', 14, 700, 'start', '#26231c', 'mo');

/* ---- động ---- */
var cellMat = sc.faceMatrix(850, 5, 34);
var screen = I.el('g', { transform: cellMat }, dyn);
var PERIOD = 4.4, STAG = 1.45, MODEP = 20, DSEG = .5, DWELL = .12;
function chainOf(i, mode) {                     /* các node trên đường từ Leaf i tới Root (cây: 1 chặng hoặc 3 chặng) */
  var r = [N.L[i]]; if (mode === 3) for (var k = i - 1; k >= 0; k--) r.push(N.L[k]);
  r.push(N.root); return r;
}
function linksOf(mode) { return mode === 1 ? [[0, 'R'], [1, 'R'], [2, 'R']] : [[0, 'R'], [1, 0], [2, 1]]; }
function node(ref) { return ref === 'R' ? N.root : N.L[ref]; }
function modeAt(t) { return Math.floor(t / MODEP) % 2 === 0 ? 1 : 3; }
/* điểm neo vô tuyến: Leaf = anten PCB trên bo (z 8,5); Root = mép trước bo (z 14,5): mọi đường nối đều kết thúc trên một vật */
function anchor(n) { return n === N.root ? [482, 0, 14.5] : [n[0] - 12, n[1] + 14, 8.5]; }
function arcPts(a, b) {                       /* cung càng dài càng cao: bay vòng qua bo ở giữa, không chui sau bo */
  var pp = [], u, f, h = Math.max(22, Math.min(62, .13 * Math.hypot(b[0] - a[0], b[1] - a[1]) + 8));
  for (u = 0; u <= 8; u++) { f = u / 8; pp.push([I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), I.lerp(a[2], b[2], f) + h * Math.sin(Math.PI * f)]); }
  return pp;
}
function route(i, mode, bi, zEnd) {              /* các đoạn đường của chunk: theo cung vô tuyến từng chặng rồi thả vào slot */
  var an = chainOf(i, mode).map(anchor), segs = [], h, u, pp, t = 0;
  function add(a, b, d) { segs.push({ a: a, b: b, t0: t, d: d }); t += d; }
  for (h = 0; h < an.length - 1; h++) {
    pp = arcPts(an[h], an[h + 1]);
    for (u = 0; u < 8; u++) add(pp[u], pp[u + 1], DSEG / 8);
    if (h < an.length - 2) add(pp[8], pp[8], DWELL);          /* node trung gian nhận rồi chuyển tiếp */
  }
  var above = [506, binY[bi], 26];
  add(an[an.length - 1], above, .35); add(above, [506, binY[bi], zEnd], .25);
  return { segs: segs, total: t };
}
function pos(r, s) {                              /* vị trí tại s giây; null nếu đã tới nơi */
  for (var i = 0; i < r.segs.length; i++) { var sg = r.segs[i]; if (s < sg.t0 + sg.d) { var f = I.clamp((s - sg.t0) / sg.d); f = f * f * (3 - 2 * f); return [I.lerp(sg.a[0], sg.b[0], f), I.lerp(sg.a[1], sg.b[1], f), I.lerp(sg.a[2], sg.b[2], f)]; } }
  return null;
}
var tilePath = [[506, 0, 22], [600, 0, 22], [626, 0, 22], [640, 0, 9], [722, 0, 9], [798, 0, 9], [866, 0, 9]];
function frame(t) {
  sc.clear(dyn); sc.clear(linkG);
  var mode = modeAt(t), items = [];
  /* liên kết vô tuyến của cây hiện tại: nét đứt nối anten bo này với anten bo kia */
  linksOf(mode).forEach(function (l) {
    var e = sc.path(linkG, arcPts(anchor(N.L[l[0]]), anchor(node(l[1]))), 0, '#d9432b', 1.6);
    e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  });
  modeTxt.textContent = mode === 1 ? 'đang hiện: 1 chặng' : 'đang hiện: 3 chặng';
  var scr = -1, scrA = 0, mwOn = false, mwCol = T.red, newest = -1e9;
  for (var i = 0; i < 3; i++) {
    var n0 = Math.floor((t - i * STAG) / PERIOD);
    for (var nn = n0 - 3; nn <= n0; nn++) {
      var ts = i * STAG + nn * PERIOD; if (ts < 0) continue;
      var lt = t - ts, fm = modeAt(ts), g = nn * 3 + i, bi = g % 4;
      var td = 4 * .25 + route(i, fm, bi, 20).total + .1;         /* lúc chunk cuối vào slot, khung ghép xong rồi rời Root */
      if (lt < td) {                                              /* khung còn trong slot của Root: các chunk đang bay hoặc đã nằm trong slot */
        for (var k = 0; k < 5; k++) {
          var s = lt - k * .25; if (s < 0) continue;
          var r = route(i, fm, bi, 19.6 + k * 4.4), q = pos(r, s);
          if (q) items.push({ x: q[0] - 4.5, y: q[1] - 4.5, z: q[2], w: 9, d: 9, h: 9, t: I.LEAF[i] });
          else items.push({ x: 506 - 7, y: binY[bi] - 6, z: 19.6 + k * 4.4, w: 14, d: 12, h: 4, t: I.LEAF[i] });
        }
      } else if (lt < td + 3.4) {                                 /* ảnh đã ghép: một tấm đi qua UART, middleware rồi tới dashboard */
        var p = (lt - td) / 3.4, q2 = I.along(tilePath, p);
        if (q2[0] >= 722 && q2[0] <= 798) { mwOn = true; mwCol = I.LEAF[i]; }
        else items.push({ x: q2[0] - 9, y: -9, z: q2[2], w: 18, d: 18, h: 4, t: I.LEAF[i] });
      } else if (ts > newest) { newest = ts; scr = i; scrA = I.clamp((lt - td - 3.4) / .25); }
    }
  }
  for (var j = 0; j < 3; j++) {
    items.push({ x: 630 + ((t * 60 + j * 28) % 82) - 4, y: -2.5, z: 3, w: 8, d: 5, h: 4, t: T.white });   /* xung trên cáp UART: màu trung tính, không phải chunk của Leaf */
    items.push({ x: 798 + ((t * 50 + j * 20) % 60) - 3, y: -2.5, z: 3, w: 7, d: 5, h: 4, t: T.white });   /* xung trên dây Socket.IO */
  }
  if (mwOn) items.push({ x: 758, y: -6, z: 51, w: 14, d: 12, h: 2.5, t: mwCol });
  sc.items(dyn, items);
  var g = I.el('g', { transform: cellMat }, dyn);
  I.el('rect', { x: 7, y: 7, width: 106, height: 70, fill: '#1d2a25' }, g);
  I.el('rect', { x: 11, y: 12, width: 52, height: 60, fill: scr >= 0 ? ['#ffb27a', '#9dbfee', '#c3dc7a'][scr] : '#3b4a43', opacity: scr >= 0 ? .4 + .6 * scrA : .5 }, g);
  for (var k2 = 0; k2 < 6; k2++) I.el('rect', { x: 11, y: 15 + k2 * 9.4, width: 52, height: 1.6, fill: '#1d2a25', opacity: .35 }, g);
  [[70, 32], [80, 48], [90, 26], [100, 40]].forEach(function (b, n) { I.el('rect', { x: b[0], y: 12, width: 7, height: b[1] * (.6 + .4 * Math.sin(t * 2 + n)), fill: '#7fd4a8' }, g); });
}
Deck.frames.s7 = frame;
