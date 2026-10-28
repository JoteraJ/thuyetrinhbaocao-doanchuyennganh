/* Bìa: 1 Root + 3 Leaf nối thành cây; chunk chuyền từ Leaf về Root */
var svg = document.getElementById('s1fig'), I = window.Iso, T = I.T;
var sc = I.scene(svg, { az: 30, el: 32, rect: [0, 30, 520, 380], pts: [[-20, -150, -10], [420, -150, -10], [-20, 150, -10], [420, 150, -10], [0, 0, 70]] });
var P = sc.pt, plateG = sc.g(), linkG = sc.g(), objG = sc.g(), dyn = sc.g();
sc.box(plateG, -20, -150, -10, 440, 300, 10, T.plate);
var node = { L: [[260, 70], [150, -60], [30, 60]], R: [370, -10] };
function board(cx, cy) {
  sc.box(objG, cx - 30, cy - 24, 0, 60, 48, 8, T.pcb); sc.box(objG, cx - 24, cy - 16, 8, 18, 14, 3, T.chip);
  sc.cyl(objG, cx + 18, cy, 8, 10, 12, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, cx + 18, cy, 18, 2, 8, '#222', '#444', '#101010');
}
[0, 1, 2].sort(function (a, b) { return (node.L[a][0] * sc.S + node.L[a][1] * sc.C) - (node.L[b][0] * sc.S + node.L[b][1] * sc.C); }).forEach(function (i) { board(node.L[i][0], node.L[i][1]); });
sc.box(objG, node.R[0] - 38, node.R[1] - 42, 0, 76, 84, 12, T.pcb); sc.box(objG, node.R[0] - 10, node.R[1] - 16, 12, 30, 30, 7, T.chip);
var chain = [node.L[2], node.L[1], node.L[0], node.R], PERIOD = 4;
function frame(t) {
  sc.clear(dyn); sc.clear(linkG);
  var items = [];
  for (var i = 0; i < 3; i++) {                                   /* các cạnh của cây: L3→L2→L1→Root */
    var a = chain[i], b = chain[i + 1], pp = [];
    for (var u = 0; u <= 10; u++) { var f = u / 10; pp.push([I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 30 + 12 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  }
  for (var k = 0; k < 5; k++) {
    var s = ((t - k * .3) % PERIOD + PERIOD) % PERIOD / PERIOD;
    var path = [[chain[0][0], chain[0][1], 34], [chain[1][0], chain[1][1], 34], [chain[2][0], chain[2][1], 34], [chain[3][0], chain[3][1], 34]];
    var q = I.along(path, s);
    items.push({ x: q[0] - 4.5, y: q[1] - 4.5, z: q[2], w: 9, d: 9, h: 9, t: I.LEAF[k % 3] });
  }
  sc.items(dyn, items);
  for (var w = 0; w < 3; w++) {                                    /* sóng vô tuyến lan từ Root, như vòng trên mặt trống */
    var ph = ((t / 3.2) + w / 3) % 1, e = sc.circle(dyn, node.R[0], node.R[1], 0.6, 20 + ph * 130, 48, 'none', '#f2b632', 1.8);
    e.setAttribute('stroke-opacity', ((1 - ph) * .85).toFixed(2));
  }
}
Deck.frames.s1 = frame;
