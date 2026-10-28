/* Dự phòng A: hiện tại = painlessMesh (Arduino); hướng phát triển = ESP-WIFI-MESH (ESP-IDF), bản đã dựng một phần nằm trong thư mục lưu trữ. */
var svg = document.getElementById('b1fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 20, el: 32, rect: [0, 40, 492, 330], pts: [[-20, -110, -10], [330, -110, -10], [-20, 110, -10], [330, 110, -10], [60, 0, 70], [250, -40, 70], [250, 110, -50]] });
var P = sc.pt;
var plateG = sc.g(), objG = sc.g(), ghostG = sc.g(), dyn = sc.g();
sc.box(plateG, -20, -110, -10, 350, 220, 10, T.plate);
/* hiện tại: bo mạch thật (ESP32 + chip + anten) */
sc.box(objG, 20, -38, 0, 100, 76, 12, T.pcb); sc.box(objG, 30, -26, 12, 34, 28, 5, T.chip);
sc.cyl(objG, 96, 0, 12, 14, 16, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, 96, 0, 26, 2, 11, '#222', '#444', '#101010');
sc.box(objG, 30, 14, 12, 20, 10, 4, T.red);
/* hướng phát triển: bản "bóng" (chỉ có nét) + hộp lưu trữ đã dựng một phần */
function ghostBox(g, x, y, z, w, d, h) {
  var a = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]], k;
  [0, h].forEach(function (zz) { var l = sc.path(g, a.concat([a[0]]), zz + z, '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
  a.forEach(function (c) { var l = sc.line(g, [c[0], c[1], z], [c[0], c[1], z + h], '#645f52', 1.6); l.setAttribute('stroke-dasharray', '5 4'); });
}
ghostBox(ghostG, 200, -90, 0, 100, 76, 12);
sc.cyl(ghostG, 276, -52, 12, 0.1, 16, '#ccc', '#ddd', 'rgba(0,0,0,0)');
sc.box(objG, 205, 30, 0, 90, 60, 36, T.stone);
for (var g2 = 0; g2 < 4; g2++) sc.line(objG, [209, 90.2, 7 + g2 * 8], [291, 90.2, 7 + g2 * 8], 'rgba(60,52,38,.45)', 1);
sc.box(objG, 205, 30, 36, 90, 60, 4, T.white);
/* nhãn (chữ có sẵn trong HTML, chỉ đặt vị trí) */
function place(id, x, y, z, dx, dy, anchor) { var t = document.getElementById(id), q = P(x, y, z); t.setAttribute('x', (q[0] + dx).toFixed(1)); t.setAttribute('y', (q[1] + dy).toFixed(1)); t.setAttribute('text-anchor', anchor || 'middle'); svg.appendChild(t); }
place('b1t1', 70, 0, 12, 0, -72); place('b1n1', 70, 110, -10, 0, 30);
place('b1t2', 250, -52, 12, 0, -52); place('b1n2', 250, 110, -10, 0, 30);
document.getElementById('b1n2').setAttribute('fill', '#645f52');
/* dòng chảy: hiện tại -> hướng phát triển */
Deck.frames.b1 = function (t) {
  sc.clear(dyn);
  var a = P(125, 0, 14), b = P(195, -40, 14);
  var l = sc.line(dyn, [125, 0, 14], [195, -40, 14], '#d9432b', 1.8); l.setAttribute('stroke-dasharray', '5 5'); l.setAttribute('stroke-dashoffset', (-t * 18) % 20);
  var items = [];
  for (var k = 0; k < 3; k++) { var s = ((t * .5 + k / 3) % 1), q = [I.lerp(125, 195, s), I.lerp(0, -40, s), 20 + 8 * Math.sin(Math.PI * s)]; items.push({ x: q[0] - 5, y: q[1] - 5, z: q[2], w: 10, d: 10, h: 10, t: I.LEAF[k] }); }
  sc.items(dyn, items);
};
