/* Dự phòng C: trên = kiến trúc hiện tại (Root - middleware - dashboard nối thẳng bằng WebSocket, không cần broker);
   dưới = khi mở rộng nhiều Root / nhiều dashboard thì MQTT (qua broker) hợp lý. Làn dưới sáng lên ở bước 3. */
var svg = document.getElementById('b3fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 12, el: 30, rect: [0, 20, 656, 420], pts: [[-20, -160, -10], [350, -160, -10], [-20, 175, -10], [350, 175, -10], [200, -110, 90], [150, 175, -40]] });
var P = sc.pt, tx = sc.text;
var YA = -100, YB = 92;
var lanes = [
  { y: YA, plate: sc.g(), obj: sc.g(), dyn: sc.g() },
  { y: YB, plate: sc.g(), obj: sc.g(), dyn: sc.g() }
];
function stand(g, x, y) {                       /* màn hình dashboard: mặt màn quay về phía người xem */
  sc.box(g, x, y - 10, 0, 34, 20, 4, T.stone); sc.box(g, x + 14, y - 3, 4, 6, 6, 14, T.stone); sc.box(g, x, y - 3, 18, 34, 6, 26, T.dark);
  sc.poly(g, [P(x + 3, y + 3.2, 21), P(x + 31, y + 3.2, 21), P(x + 31, y + 3.2, 41), P(x + 3, y + 3.2, 41)], '#1d2a25', 'none', 0);
  [[6, 10], [13, 16], [20, 8], [26, 13]].forEach(function (b) { sc.poly(g, [P(x + b[0], y + 3.4, 23), P(x + b[0] + 4, y + 3.4, 23), P(x + b[0] + 4, y + 3.4, 23 + b[1]), P(x + b[0], y + 3.4, 23 + b[1])], '#7fd4a8', 'none', 0); });
}
function pcb(g, x, y) {                          /* Root = ESP32 DevKitC: module ESP32 + ăng-ten trên bo + cổng USB nối middleware; KHÔNG có ống kính (camera chỉ ở Leaf) */
  sc.box(g, x, y - 22, 0, 46, 44, 8, T.pcb); sc.box(g, x + 5, y - 15, 8, 22, 18, 3, T.chip); sc.box(g, x + 5, y + 5, 8, 22, 3, 1, T.dark);
  sc.box(g, x + 40, y - 6, 8, 8, 12, 4, T.dark);
  for (var i = 0; i < 4; i++) { sc.box(g, x + 11 + i * 5, y - 20, 8, 2, 2, 3, T.dark); sc.box(g, x + 11 + i * 5, y + 18, 8, 2, 2, 3, T.dark); }
}
function ghostBox(g, x, y, z, w, d, h) {
  var a = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  [z, z + h].forEach(function (zz) { var l = sc.path(g, a.concat([a[0]]), zz, '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
  a.forEach(function (c) { var l = sc.line(g, [c[0], c[1], z], [c[0], c[1], z + h], '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
}
/* làn trên */
var L0 = lanes[0], y0 = YA;
sc.box(L0.plate, -20, y0 - 62, -10, 370, 124, 10, T.plate);
pcb(L0.obj, 0, y0);
sc.box(L0.obj, 46, y0 - 6, 0, 76, 12, 3, T.blue);
sc.box(L0.obj, 120, y0 - 26, 0, 56, 52, 38, T.stone); for (var g2 = 0; g2 < 4; g2++) sc.line(L0.obj, [124, y0 + 26.2, 7 + g2 * 7], [172, y0 + 26.2, 7 + g2 * 7], 'rgba(60,52,38,.45)', 1);
sc.box(L0.obj, 176, y0 - 6, 0, 122, 12, 3, T.blue);
stand(L0.obj, 298, y0);
ghostBox(L0.obj, 196, y0 - 56, 0, 70, 40, 26);                 /* broker: không cần */
sc.line(L0.obj, [196, y0 - 16, 0], [266, y0 - 16, 26], '#d9432b', 1.8); sc.line(L0.obj, [266, y0 - 16, 0], [196, y0 - 16, 26], '#d9432b', 1.8);
/* làn dưới */
var L1 = lanes[1], y1 = YB;
sc.box(L1.plate, -20, y1 - 78, -10, 370, 156, 10, T.plate);
pcb(L1.obj, 0, y1 - 40); pcb(L1.obj, 0, y1 + 40);
sc.box(L1.obj, 46, y1 - 46, 0, 60, 12, 3, T.blue); sc.box(L1.obj, 46, y1 + 34, 0, 60, 12, 3, T.blue);
sc.box(L1.obj, 108, y1 - 46, 0, 12, 92, 3, T.blue);
sc.box(L1.obj, 120, y1 - 30, 0, 70, 60, 26, T.stone); for (var g3 = 0; g3 < 3; g3++) sc.line(L1.obj, [124, y1 + 30.2, 6 + g3 * 7], [186, y1 + 30.2, 6 + g3 * 7], 'rgba(60,52,38,.45)', 1);
sc.box(L1.obj, 190, y1 - 6, 0, 40, 12, 3, T.blue);
sc.box(L1.obj, 228, y1 - 46, 0, 12, 92, 3, T.blue);
sc.box(L1.obj, 240, y1 - 46, 0, 52, 12, 3, T.blue); sc.box(L1.obj, 240, y1 + 34, 0, 52, 12, 3, T.blue);
stand(L1.obj, 292, y1 - 40); stand(L1.obj, 292, y1 + 40);
/* nhãn */
function lab(s, x, y, z, dx, dy, size, w, anchor, fill, cls) { var q = P(x, y, z); return tx(svg, q[0] + dx, q[1] + dy, s, size, w, anchor || 'middle', fill || '#26231c', cls || 'sf'); }
lab('Root', 22, y0, 24, 0, -14, 19, 700); lab('middleware', 148, y0, 42, 0, -22, 19, 700); lab('dashboard', 315, y0, 46, 0, -12, 19, 700);
lab('broker', 231, y0 - 56, 26, 0, -10, 15, 500, 'middle', '#645f52', 'mo');
var lb2 = [lab('Root', 22, y1 + 78, -10, 0, 22, 19, 700), lab('broker', 155, y1 + 78, -10, 0, 22, 19, 700), lab('dashboard', 315, y1 + 78, -10, 0, 22, 19, 700), lab('MQTT', 155, y1 - 30, 26, 0, -12, 15, 500, 'middle', '#1f4e9c', 'mo')];
/* động */
var cur = 0;
function allOn() { return document.documentElement.classList.contains('static'); }
Deck.steps.b3 = function (s) { cur = s; };
function run(g, pts, t, n, per, sp) {            /* các gói chạy dọc đường pts (3D) */
  var items = [], k;
  for (k = 0; k < n; k++) { var f = ((t * sp + k / n) % 1), q = I.along(pts, f); items.push({ x: q[0] - 5, y: q[1] - 5, z: q[2], w: 10, d: 10, h: 10, t: I.LEAF[(k + per) % 3] }); }
  return items;
}
Deck.frames.b3 = function (t) {
  var still = Deck.still || allOn(), on = still || cur >= 3;
  var a = [], b = [];
  sc.clear(L0.dyn); sc.clear(L1.dyn);
  a = a.concat(run(L0.dyn, [[24, y0, 14], [120, y0, 14]], t, 2, 0, .45), run(L0.dyn, [[176, y0, 5], [298, y0, 5]], t, 3, 1, .5));
  sc.items(L0.dyn, a);
  b = b.concat(run(L1.dyn, [[24, y1 - 40, 14], [114, y1 - 40, 14], [114, y1, 14], [150, y1, 14]], t, 2, 0, .4), run(L1.dyn, [[24, y1 + 40, 14], [114, y1 + 40, 14], [114, y1, 14], [150, y1, 14]], t + .6, 2, 1, .4),
    run(L1.dyn, [[190, y1, 5], [234, y1, 5], [234, y1 - 40, 5], [296, y1 - 40, 5]], t, 2, 2, .4), run(L1.dyn, [[190, y1, 5], [234, y1, 5], [234, y1 + 40, 5], [296, y1 + 40, 5]], t + .5, 2, 0, .4));
  sc.items(L1.dyn, b);
  var o = on ? 1 : .22;
  [L1.plate, L1.obj, L1.dyn].forEach(function (g) { g.setAttribute('opacity', o); });
  lb2.forEach(function (e) { e.setAttribute('opacity', o); });
};
