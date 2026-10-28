/* Thư viện isometric dùng chung cho các sơ đồ "cơ cấu" (hướng B).
   Mỗi vật thể là khối đặc có 3 mặt đổ bóng, vẽ từ xa tới gần.
   Dùng:  var sc = Iso.scene(svg, { az:25, el:30, pts:[[x,y,z],...], rect:[x0,y0,w,h] });
          sc.box(g,x,y,z,w,d,h,Iso.T.pcb)  sc.cyl(g,cx,cy,z,h,r,lo,hi,top)  sc.pt(x,y,z)  sc.text(...) */
window.Iso = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  var T = {
    plate: { top: '#c6d9b4', y: '#a8bf95', x: '#93ab80' },
    stone: { top: '#e3efd6', y: '#c3d4b2', x: '#a7ba95' },
    pcb:   { top: '#3c4853', y: '#2a333a', x: '#1f252a' },
    chip:  { top: '#739390', y: '#576978', x: '#475561' },
    dark:  { top: '#232a30', y: '#181d22', x: '#121619' },
    white: { top: '#f1f8f4', y: '#d4e2db', x: '#bbcbc9' },
    red:   { top: '#ff9a52', y: '#ee5f12', x: '#c24a0b' },
    blue:  { top: '#9dbfee', y: '#3f78c4', x: '#2d5a99' },
    green: { top: '#c3dc7a', y: '#7c9a28', x: '#5e7a1c' }
  };
  var LEAF = [T.red, T.blue, T.green];          /* màu 3 Leaf */
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function f1(v) { return v.toFixed(1); }
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  /* điểm trên đường gấp khúc 3D theo tỉ lệ độ dài t∈[0,1] */
  function along(path, t) {
    var L = [], tot = 0, i;
    for (i = 0; i < path.length - 1; i++) { var d = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1], (path[i + 1][2] || 0) - (path[i][2] || 0)); L.push(d); tot += d; }
    var s = clamp(t) * tot;
    for (i = 0; i < L.length; i++) {
      if (s <= L[i] || i === L.length - 1) { var f = L[i] ? Math.min(1, s / L[i]) : 0; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f), lerp(path[i][2] || 0, path[i + 1][2] || 0, f)]; }
      s -= L[i];
    }
  }
  function scene(svg, o) {
    var TH = (o.az == null ? 25 : o.az) * Math.PI / 180, EL = (o.el == null ? 30 : o.el) * Math.PI / 180;
    var C = Math.cos(TH), S = Math.sin(TH), SE = Math.sin(EL), CE = Math.cos(EL);
    function raw(x, y, z) { var X = x * C - y * S, Y = x * S + y * C; return [X, Y * SE - z * CE]; }
    var mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    o.pts.forEach(function (p) { var q = raw(p[0], p[1], p[2] || 0); mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mxy = Math.max(mxy, q[1]); });
    var r = o.rect, K = Math.min(r[2] / (mxx - mnx), r[3] / (mxy - mny));
    var OX = r[0] + (r[2] - (mxx - mnx) * K) / 2 - mnx * K, OY = r[1] + (r[3] - (mxy - mny) * K) / 2 - mny * K;
    var sc = { K: K, S: S, C: C };
    sc.pt = function (x, y, z) { var q = raw(x, y, z || 0); return [q[0] * K + OX, q[1] * K + OY]; };
    sc.g = function (p) { return el('g', {}, p || svg); };
    sc.clear = function (g) { while (g.firstChild) g.removeChild(g.firstChild); };
    sc.poly = function (g, p, fill, stroke, sw) {
      return el('polygon', { points: p.map(function (a) { return f1(a[0]) + ',' + f1(a[1]); }).join(' '), fill: fill, stroke: stroke || 'rgba(10,32,48,.55)', 'stroke-width': sw == null ? .8 : sw, 'stroke-linejoin': 'round' }, g);
    };
    sc.box = function (g, x, y, z, w, d, h, t) {
      var P = sc.pt;
      sc.poly(g, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], t.x);
      sc.poly(g, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], t.y);
      sc.poly(g, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], t.top);
    };
    sc.cyl = function (g, cx, cy, z, h, rad, lo, hi, topc) {
      var N = 30, i, a0, a1, am, nx, ny, lum, P = sc.pt;
      for (i = 0; i < N; i++) {
        a0 = i / N * 2 * Math.PI; a1 = (i + 1) / N * 2 * Math.PI; am = (a0 + a1) / 2; nx = Math.cos(am); ny = Math.sin(am);
        if (nx * S + ny * C <= 0) continue;
        lum = .5 - .5 * (nx * C - ny * S);
        var c0 = [cx + rad * Math.cos(a0), cy + rad * Math.sin(a0)], c1 = [cx + rad * Math.cos(a1), cy + rad * Math.sin(a1)], col = mix(lo, hi, lum);
        sc.poly(g, [P(c0[0], c0[1], z), P(c1[0], c1[1], z), P(c1[0], c1[1], z + h), P(c0[0], c0[1], z + h)], col, col, .6);
      }
      var tp = []; for (i = 0; i < N; i++) { a0 = i / N * 2 * Math.PI; tp.push(P(cx + rad * Math.cos(a0), cy + rad * Math.sin(a0), z + h)); }
      sc.poly(g, tp, topc);
    };
    sc.line = function (g, a, b, stroke, w, extra) {
      var p = sc.pt(a[0], a[1], a[2]), q = sc.pt(b[0], b[1], b[2]);
      var at = { x1: f1(p[0]), y1: f1(p[1]), x2: f1(q[0]), y2: f1(q[1]), stroke: stroke, 'stroke-width': w, 'stroke-linecap': 'round' };
      for (var k in extra) at[k] = extra[k];
      return el('line', at, g);
    };
    sc.path = function (g, pts, z, stroke, w) {   /* đường gấp khúc trên sàn */
      var d = pts.map(function (p, i) { var q = sc.pt(p[0], p[1], p[2] != null ? p[2] : z); return (i ? 'L' : 'M') + f1(q[0]) + ',' + f1(q[1]); }).join('');
      return el('path', { d: d, fill: 'none', stroke: stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    };
    sc.circle = function (g, cx, cy, z, rad, N, fill, stroke, sw) {   /* vòng tròn trên sàn */
      var p = []; for (var a = 0; a < N; a++) { var an = a / N * 2 * Math.PI; p.push(sc.pt(cx + rad * Math.cos(an), cy + rad * Math.sin(an), z)); }
      return sc.poly(g, p, fill, stroke, sw);
    };
    sc.text = function (g, x, y, s, size, weight, anchor, fill, cls) {
      var t = el('text', { x: f1(x), y: f1(y), 'font-size': size, 'font-weight': weight || 400, 'text-anchor': anchor || 'middle', fill: fill || '#0c2a44', class: cls || '' }, g);
      t.textContent = s; return t;
    };
    /* sắp xếp khối động theo độ sâu rồi vẽ */
    sc.items = function (g, items) {
      items.sort(function (a, b) { return (a.x + a.w / 2) * S + (a.y + a.d / 2) * C + a.z * .0001 - ((b.x + b.w / 2) * S + (b.y + b.d / 2) * C + b.z * .0001); });
      items.forEach(function (it) { sc.box(g, it.x, it.y, it.z, it.w, it.d, it.h, it.t); });
    };
    /* ma trận phẳng cho nội dung vẽ trên mặt đứng +y (màn hình): toạ độ (u,v), v hướng lên */
    sc.faceMatrix = function (x, y, z) {
      var o2 = sc.pt(x, y, z), u = sc.pt(x + 1, y, z), v = sc.pt(x, y, z + 1);
      return 'matrix(' + [u[0] - o2[0], u[1] - o2[1], v[0] - o2[0], v[1] - o2[1], o2[0], o2[1]].map(function (a) { return a.toFixed(4); }).join(' ') + ')';
    };
    return sc;
  }
  return { scene: scene, T: T, LEAF: LEAF, el: el, mix: mix, along: along, lerp: lerp, clamp: clamp };
})();
