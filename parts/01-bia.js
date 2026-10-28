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
var chain = [node.L[2], node.L[1], node.L[0], node.R];          /* cây: Leaf3 → Leaf2 → Leaf1 → Root */
var CLEAF = [2, 1, 0];                                            /* chain[i] là Leaf nào (để lấy đúng màu của Leaf đó) */
var HOP = .9, DWELL = .12, EVERY = 3.6;                           /* mỗi chặng .9 s, lưu rồi chuyển tiếp .12 s, mỗi Leaf phát một chunk mỗi 3,6 s */
/* LED trên bo: màu của Leaf, để thấy rõ chunk nào xuất phát từ Leaf nào */
CLEAF.forEach(function (li, i) { var c = chain[i]; sc.box(objG, c[0] - 28, c[1] + 14, 8, 7, 7, 3, I.LEAF[li]); });
function frame(t) {
  sc.clear(dyn); sc.clear(linkG);
  var items = [];
  for (var i = 0; i < 3; i++) {                                   /* các cạnh của cây: L3→L2→L1→Root */
    var a = chain[i], b = chain[i + 1], pp = [];
    for (var u = 0; u <= 10; u++) { var f = u / 10; pp.push([I.lerp(a[0], b[0], f), I.lerp(a[1], b[1], f), 30 + 12 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  }
  /* mỗi Leaf gửi chunk của mình: chunk xuất phát ĐÚNG tại Leaf đó, mang màu Leaf đó, chuyển tiếp từng chặng tới Root */
  for (var c0 = 0; c0 < 3; c0++) {
    var hops = 3 - c0, tot = hops * HOP + (hops - 1) * DWELL, leaf = CLEAF[c0];
    for (var k = 0; k < 2; k++) {                                 /* hai chunk liền nhau của cùng Leaf */
      var s = ((t - c0 * 1.2 - k * .3) % EVERY + EVERY) % EVERY;
      if (s > tot) continue;
      var h = 0, tt = s, pos = null;
      for (; h < hops; h++) {
        var a2 = chain[c0 + h], b2 = chain[c0 + h + 1];
        if (tt <= HOP) { var f2 = tt / HOP; f2 = f2 * f2 * (3 - 2 * f2); pos = [I.lerp(a2[0], b2[0], f2), I.lerp(a2[1], b2[1], f2), I.lerp(34, h === hops - 1 ? 22 : 34, f2)]; break; }
        tt -= HOP;
        if (tt <= DWELL && h < hops - 1) { pos = [b2[0], b2[1], 34]; break; }
        tt -= DWELL;
      }
      if (pos) items.push({ x: pos[0] - 4.5, y: pos[1] - 4.5, z: pos[2], w: 9, d: 9, h: 9, t: I.LEAF[leaf] });
    }
  }
  sc.items(dyn, items);
  for (var w = 0; w < 3; w++) {                                    /* sóng vô tuyến lan từ Root, như vòng trên mặt trống */
    var ph = ((t / 3.2) + w / 3) % 1, e = sc.circle(dyn, node.R[0], node.R[1], 0.6, 20 + ph * 130, 48, 'none', '#f2b632', 1.8);
    e.setAttribute('stroke-opacity', ((1 - ph) * .85).toFixed(2));
  }
}
Deck.frames.s1 = frame;
