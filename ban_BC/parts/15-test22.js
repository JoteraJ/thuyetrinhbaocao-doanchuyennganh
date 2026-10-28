/* Slide 15: chuỗi 3 chặng (1 Root + 3 Leaf; Leaf cũng là node chuyển tiếp, không thêm node).
   Chunk từ mỗi Leaf đi lần lượt qua từng chặng về Root; cột sau mỗi Leaf cao tỉ lệ ĐÚNG với độ trễ trung vị 148 / 350 / 576 ms.
   Thời gian cảnh tỉ lệ với trung vị (1 ms = 0,008 s: hình động làm chậm). Cột mọc một lần rồi GIỮ NGUYÊN (cột và số không tắt/lặp);
   chỉ chunk còn chạy lặp để minh họa. Không vẽ thanh RSSI: RSSI chỉ ghi bằng chữ ở nhãn từng chặng. */
var svg = document.getElementById('s15fig'), I = window.Iso, T = I.T;
var HZ = 176, MSMAX = 576;                         /* cột 576 ms cao 176 đơn vị -> 1 ms = 176/576 đơn vị */
var NODES = [{ x: 0 }, { x: 165, ms: 148 }, { x: 330, ms: 350 }, { x: 495, ms: 576 }];
var sc = I.scene(svg, { az: 14, el: 34, rect: [0, 12, 612, 388],
  pts: [[-60, -72, -10], [560, -72, -10], [-60, 92, -10], [560, 92, -10], [-60, -72, 190], [560, -72, 190], [-60, 92, -52], [495, 92, -52]] });
var P = sc.pt, S = sc.S, C = sc.C;
var TS = .008, T0 = .3, PER = 7.2, YB = 28;         /* TS: giây cảnh cho mỗi ms đo; YB: đường chuỗi */
var wallG = sc.g(), plateG = sc.g(), gridG = sc.g(), pillG = [sc.g(), sc.g(), sc.g()], objG = sc.g(), linkG = sc.g(), dyn = sc.g();
sc.box(plateG, -60, -72, -10, 620, 164, 10, T.plate);
[[-50, -62], [550, -62], [-50, 82], [550, 82]].forEach(function (c) { var q = P(c[0], c[1], 0); I.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.4, fill: '#8c8470' }, plateG); });
/* tường sau: lưới mỗi 200 ms, ghi mốc 0 / 200 / 400 / 600 ms ở mép trái để thấy tỉ lệ */
sc.poly(wallG, [P(-60, -70, 0), P(560, -70, 0), P(560, -70, 188), P(-60, -70, 188)], 'rgba(255,255,255,.42)', 'rgba(45,38,28,.35)', .9);
[0, 200, 400, 600].forEach(function (m) { var z = HZ * m / MSMAX, l = sc.line(gridG, [-60, -69.5, z], [560, -69.5, z], m ? 'rgba(28,27,25,.32)' : 'rgba(28,27,25,.6)', m ? 1 : 1.6); if (m) l.setAttribute('stroke-dasharray', '5 4');
  var q = P(-60, -69.5, z); sc.text(gridG, q[0] + 6, q[1] - 6, m + ' ms', 14, 500, 'start', '#645f52', 'mo'); });
/* bo mạch */
function leafBoard(cx, i) {
  var y = YB;
  sc.box(objG, cx - 32, y - 25, 0, 64, 50, 8, T.pcb); sc.box(objG, cx - 26, y - 17, 8, 20, 16, 3, T.chip);
  sc.cyl(objG, cx + 20, y, 8, 10, 13, '#3b3a35', '#6d6b62', '#8b887c'); sc.cyl(objG, cx + 20, y, 18, 2, 9, '#222', '#444', '#101010');
  sc.box(objG, cx - 26, y + 12, 8, 12, 8, 4, I.LEAF[i - 1]);
}
function rootBoard(cx) {
  var y = YB;
  sc.box(objG, cx - 42, y - 32, 0, 84, 64, 10, T.pcb); sc.box(objG, cx - 8, y - 14, 10, 30, 30, 7, T.chip);
  sc.box(objG, cx - 36, y - 26, 10, 14, 16, 8, T.dark);
  sc.cyl(objG, cx + 26, y + 18, 10, 16, 5, '#3b3a35', '#6d6b62', '#8b887c');
}
/* bo mạch, vẽ từ xa tới gần */
rootBoard(0); [1, 2, 3].forEach(function (i) { leafBoard(NODES[i].x, i); });
/* nhãn */
function place(id, x, y, z, dx, dy, anchor, fill) { var t = document.getElementById(id), q = P(x, y, z); t.setAttribute('x', (q[0] + dx).toFixed(1)); t.setAttribute('y', (q[1] + dy).toFixed(1)); t.setAttribute('text-anchor', anchor || 'start'); if (fill) t.setAttribute('fill', fill); svg.appendChild(t); return t; }
place('s15n0', 0, 92, 0, 0, 28, 'middle');
[1, 2, 3].forEach(function (i) {
  var n = NODES[i];
  place('s15n' + i, n.x, 92, 0, 0, 28, 'middle');
  place('s15h' + i, n.x, 92, 0, 0, 48, 'middle');
});
var vEl = [1, 2, 3].map(function (i) { var t = document.getElementById('s15v' + i); svg.appendChild(t); t.setAttribute('text-anchor', 'middle'); return t; });

/* ---- động ---- */
var TD = [0, NODES[1].ms * TS, NODES[2].ms * TS, NODES[3].ms * TS];   /* thời gian đi hết chuỗi của chunk Leaf i */
function ease(x) { x = I.clamp(x); return x * x * (3 - 2 * x); }
function pathOf(i) { var p = []; for (var k = i; k >= 0; k--) p.push([NODES[k].x, YB, 0]); return p; }   /* Leaf i -> ... -> Root */
function posOn(i, s) {                      /* s = giây kể từ lúc rời Leaf; mỗi chặng mất TD/i giây */
  var per = TD[i] / i, e = Math.min(i - 1, Math.floor(s / per)), f = I.clamp((s - e * per) / per);
  var a = NODES[i - e].x, b = NODES[i - e - 1].x;
  return [I.lerp(a, b, ease(f)), YB, 24 + 12 * Math.sin(Math.PI * f)];
}
function frame(t) {
  var tau = t % PER;
  sc.clear(dyn); sc.clear(linkG);
  for (var i = 1; i <= 3; i++) {                                    /* liên kết mesh giữa hai bo kề nhau */
    var a = NODES[i - 1].x, b = NODES[i].x, pp = [];
    for (var u = 0; u <= 14; u++) { var f = u / 14; pp.push([I.lerp(a, b, f), YB, 14 + 12 * Math.sin(Math.PI * f)]); }
    var e = sc.path(linkG, pp, 0, '#d9432b', 1.6); e.setAttribute('stroke-dasharray', '4 4'); e.setAttribute('stroke-dashoffset', (-t * 14) % 16);
  }
  var items = [], k, still = Deck.still || document.documentElement.classList.contains('static');
  for (k = 1; k <= 3; k++) {
    var s = tau - T0, full = HZ * NODES[k].ms / MSMAX, sp = (still ? 99 : t) - T0;              /* sp: thời gian từ lần chạy đầu (không lặp) */
    var p = I.clamp(sp / TD[k]), h = full * p, al = ease((sp - TD[k]) / .3);
    sc.clear(pillG[k - 1]);
    if (h > .3) sc.box(pillG[k - 1], NODES[k].x - 19, -62, 0, 38, 38, h, I.LEAF[k - 1]);
    vEl[k - 1].setAttribute('opacity', still ? 1 : al.toFixed(2));
    var q = P(NODES[k].x, -43, full + 24); vEl[k - 1].setAttribute('x', q[0].toFixed(1)); vEl[k - 1].setAttribute('y', q[1].toFixed(1));
    if (s >= 0 && s < TD[k] && (still || t >= T0)) { var c = posOn(k, s); items.push({ x: c[0] - 7, y: c[1] - 7, z: c[2], w: 14, d: 14, h: 14, t: I.LEAF[k - 1] }); }
  }
  sc.items(dyn, items);
}
Deck.frames.s15 = frame;
