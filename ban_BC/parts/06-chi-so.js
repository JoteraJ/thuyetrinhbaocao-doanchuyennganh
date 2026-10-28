/* Slide 6: trục thời gian cho các chỉ số. Ba làn cùng một trục thời gian (đi từ trái sang phải):
   B (xanh lá)  cửa sổ Δt: các khung nhận được (N_ok) và khung bị hủy (N_h)   <- T, FPS, R_h
   A (đỏ)       một khung ảnh: t_chụp -> t_ghép, khoảng cách là độ trễ d
   C (xanh dương) luồng gói phân mảnh: gói cuối nhận được (t_mất) -> gói đầu nhận lại (t_nối), khoảng cách là T_ph.
   Mỗi làn hiện cùng bước với công thức của nó; mỗi làn có con trỏ thời gian riêng quét từ trái sang phải. */
var I = window.Iso, T = I.T, el = I.el, svg = document.getElementById('s6fig');
var INK = '#1c1b19', RED = '#d9432b', BLUE = '#1f4e9c', GREEN = '#1b7f5c', MUTED = '#645f52', EDGE = 'rgba(45,38,28,.55)';
function sm(a) { a = I.clamp(a); return a * a * (3 - 2 * a); }
function g(p, cls) { return el('g', cls ? { 'class': cls } : {}, p || svg); }
function pts(a) { return a.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
/* khối phẳng có chiều sâu (mặt trước + mặt trên + mặt phải) */
function blk(p, x, y, w, h, d, t, dash) {
  var dx = d, dy = d * .6;
  el('polygon', { points: pts([[x, y], [x + dx, y - dy], [x + w + dx, y - dy], [x + w, y]]), fill: t.top, stroke: EDGE, 'stroke-width': .8, 'stroke-linejoin': 'round' }, p);
  el('polygon', { points: pts([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y + h - dy], [x + w, y + h]]), fill: t.x, stroke: EDGE, 'stroke-width': .8, 'stroke-linejoin': 'round' }, p);
  el('rect', { x: x, y: y, width: w, height: h, fill: t.y, stroke: EDGE, 'stroke-width': .8 }, p);
}
function txt(p, x, y, s, size, col, anchor, cls, wt) {
  var t = el('text', { x: x, y: y, 'font-size': size, 'font-weight': wt || 500, 'text-anchor': anchor || 'middle', 'class': cls || 'mo' }, p); t.style.fill = col || INK; t.textContent = s; return t;
}
/* ký hiệu có chỉ số dưới: chữ nghiêng + chỉ số 14 px */
function sym(p, x, y, b, sub, col, size, anchor) {
  var t = el('text', { x: x, y: y, 'text-anchor': anchor || 'middle', 'class': 'sf' }, p); t.style.fill = col || INK;
  var a = el('tspan', { 'font-size': size || 22, 'font-style': 'italic', 'font-weight': 500 }, t); a.textContent = b;
  if (sub) { var s = el('tspan', { 'font-size': 14, dy: 5, 'font-weight': 500 }, t); s.style.fontStyle = 'normal'; s.style.fontFamily = 'var(--sans)'; s.textContent = sub; }
  return t;
}
function line(p, x1, y1, x2, y2, col, w, dash) { var e = el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': w || 1.5, 'stroke-linecap': 'round' }, p); if (dash) e.setAttribute('stroke-dasharray', dash); return e; }
function bracket(p, x0, x1, y, col, up) {            /* dấu ngoặc ngang: hai đầu có vạch */
  line(p, x0, y, x1, y, col, 2.2); line(p, x0, y - 7, x0, y + 7, col, 2.2); line(p, x1, y - 7, x1, y + 7, col, 2.2);
}

/* ---- trục thời gian dùng chung ---- */
var gAxis = g();
line(gAxis, 24, 354, 478, 354, INK, 2.4);
el('polygon', { points: '490,354 476,347 476,361', fill: INK }, gAxis);
var X0 = 30, X1 = 482, CYC = 9, SWEEP = 4.6;
function headX(lt) { return X0 + (X1 - X0) * sm(I.clamp((lt % CYC) / SWEEP)); }
function playhead(p, x, y0, y1, lt) { if ((lt % CYC) < SWEEP + .3) line(p, x, y0, x, y1, INK, 1.6, '3 4'); }

/* ---- làn B: cửa sổ Δt ---- */
var LB = { g: g(), st: null, dy: null, t0: 0 }; LB.st = g(LB.g); LB.dy = g(LB.g);
line(LB.st, 14, 124, 14, 232, GREEN, 5);
var TILE = [], TX = 44, TS = 72, TW = 54, TY = 134, TH = 32;
for (var i = 0; i < 6; i++) TILE.push({ x: TX + i * TS, drop: i === 3 });
function fade(t, a) { t.style.opacity = I.clamp(a); return t; }
function frameB(lt) {
  var s = LB.dy, h = headX(lt); I.el && (function () { while (s.firstChild) s.removeChild(s.firstChild); })();
  TILE.forEach(function (tl) {
    var k = I.clamp((h - (tl.x + TW * .6)) / 26); if (k <= 0) return;
    var e = sm(k), w = TW * e, hh = TH * e, cx = tl.x + TW / 2, cy = TY + TH / 2;
    if (!tl.drop) blk(s, cx - w / 2, cy - hh / 2, w, hh, 8 * e, T.green);
    else {
      el('rect', { x: cx - w / 2, y: cy - hh / 2, width: w, height: hh, fill: 'rgba(217,67,43,.10)', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s);
      if (k > .6) { line(s, cx - 10, cy - 8, cx + 10, cy + 8, RED, 3); line(s, cx - 10, cy + 8, cx + 10, cy - 8, RED, 3); }
    }
  });
  var e1 = Math.min(h, TILE[5].x + TW);
  if (e1 > TX) { bracket(s, TX, e1, 212, GREEN); }
  fade(sym(s, TILE[1].x + TW / 2, 192, 'N', 'ok', GREEN, 22), (h - TILE[1].x - TW) / 20);
  fade(sym(s, TILE[3].x + TW / 2, 192, 'N', 'h', RED, 22), (h - TILE[3].x - TW) / 20);
  fade(sym(s, (TX + TILE[5].x + TW) / 2, 232, 'Δt', '', INK, 22), (h - TILE[5].x - TW) / 10);
  playhead(s, h, 122, 238, lt);
}

/* ---- làn A: một khung ảnh, t_chụp -> t_ghép = độ trễ d ---- */
var LA = { g: g(), st: null, dy: null, t0: 0 }; LA.st = g(LA.g); LA.dy = g(LA.g);
var AX0 = 48, AX1 = 280, AY = 66;
line(LA.st, 14, 8, 14, 112, RED, 5);
sym(LA.st, AX0, 28, 't', 'chụp', INK, 22);
line(LA.st, AX0, 36, AX0, 100, MUTED, 1.2, '3 4');
/* ống kính Leaf ở t_chụp */
el('circle', { cx: AX0, cy: AY, r: 16, fill: '#2c2b27', stroke: EDGE, 'stroke-width': 1 }, LA.st);
el('circle', { cx: AX0, cy: AY, r: 9, fill: '#6d6b62' }, LA.st); el('circle', { cx: AX0 - 3, cy: AY - 3, r: 2.6, fill: '#e6e0d0' }, LA.st);
function frameA(lt) {
  var s = LA.dy, h = headX(lt), cyc = lt % CYC; while (s.firstChild) s.removeChild(s.firstChild);
  if (cyc < .5 && cyc > 0) el('circle', { cx: AX0, cy: AY, r: 16 + 14 * cyc / .5, fill: 'none', stroke: '#e0a200', 'stroke-width': 2.4, opacity: 1 - cyc / .5 }, s);
  var e1 = Math.min(h, AX1);
  if (e1 > AX0 + 20) {                                                   /* các gói phân mảnh của khung đi dần về Root */
    line(s, AX0 + 18, AY, e1, AY, '#d9432b', 2, '5 5');
    for (var q = 0; q < 5; q++) { var cx = AX0 + 38 + q * 38; if (cx < e1 - 6 && cx < AX1 - 30) blk(s, cx - 6, AY - 18, 12, 12, 5, I.LEAF[q % 3] || T.red); }
  }
  var k = I.clamp((h - AX1) / 26);
  if (k > 0) { var e = sm(k), w = 48 * e, hh = 34 * e; blk(s, AX1 - w / 2, AY - hh / 2, w, hh, 8 * e, T.red); if (k > .8) { for (var r = 0; r < 4; r++) el('rect', { x: AX1 - 18 + r * 10, y: AY - 8, width: 7, height: 16, fill: 'rgba(255,255,255,.55)' }, s); } }
  if (e1 > AX0) bracket(s, AX0, e1, 108, RED);
  fade(sym(s, AX1, 28, 't', 'ghép', INK, 22), (h - AX1 + 10) / 20);
  if (h > AX1 - 10) line(s, AX1, 36, AX1, 100, MUTED, 1.2, '3 4');
  fade(sym(s, (AX0 + AX1) / 2, 92, 'd', '', RED, 26), (h - AX1) / 24);
  playhead(s, h, 6, 118, lt);
}

/* ---- làn C: luồng gói, t_mất -> t_nối = T_ph ---- */
var LC = { g: g(), st: null, dy: null, t0: 0 }; LC.st = g(LC.g); LC.dy = g(LC.g);
var CT = [44, 76, 108, 140, 172, 344, 376, 408, 440], CY = 278;
var CL = 172, CR = 344;
line(LC.st, 14, 246, 14, 340, BLUE, 5);
function frameC(lt) {
  var s = LC.dy, h = headX(lt); while (s.firstChild) s.removeChild(s.firstChild);
  CT.forEach(function (x) { if (h >= x) blk(s, x - 6, CY - 6, 12, 12, 5, T.blue); });
  if (h > CL + 14) {                                                     /* đường truyền đứt: không còn gói nào tới */
    line(s, CL + 18, CY, Math.min(h, CR - 18), CY, '#9a9486', 1.6, '3 6');
    if (h > (CL + CR) / 2 + 6) { var mx = (CL + CR) / 2; line(s, mx - 9, CY - 9, mx + 9, CY + 9, RED, 3.2); line(s, mx - 9, CY + 9, mx + 9, CY - 9, RED, 3.2); }
  }
  var e1 = Math.min(h, CR);
  if (e1 > CL) bracket(s, CL, e1, 312, BLUE);
  fade(sym(s, CL, 258, 't', 'mất', INK, 22), (h - CL + 10) / 20); fade(sym(s, CR, 258, 't', 'nối', INK, 22), (h - CR + 6) / 20);
  if (h > CL - 10) line(s, CL, 266, CL, 312, MUTED, 1.2, '3 4'); if (h > CR - 6) line(s, CR, 266, CR, 312, MUTED, 1.2, '3 4');
  fade(sym(s, (CL + CR) / 2, 336, 'T', 'ph', BLUE, 26), (h - CR) / 24);
  playhead(s, h, 244, 330, lt);
}

/* ---- bước: mỗi làn hiện cùng công thức của nó ---- */
function allOn() { return Deck.still && !/[?&]step=/.test(location.search); }
var vis = { B: 0, A: 0, C: 0 }, T0 = { B: 0, A: 0, C: 0 }, tNow = 0;
function setVis(L, name, on) {
  if (on && !vis[name]) T0[name] = tNow;
  vis[name] = on ? 1 : 0; L.g.style.transition = 'opacity .45s'; L.g.style.opacity = on ? 1 : 0;
}
Deck.steps.s6 = function (step) { var a = allOn(); setVis(LB, 'B', a || step >= 1); setVis(LA, 'A', a || step >= 2); setVis(LC, 'C', a || step >= 3); };
Deck.steps.s6(0);
Deck.frames.s6 = function (t) {
  tNow = t;
  if (vis.B) frameB(t - T0.B); if (vis.A) frameA(t - T0.A); if (vis.C) frameC(t - T0.C);
};
