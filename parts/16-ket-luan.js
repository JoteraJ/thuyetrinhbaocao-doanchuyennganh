/* Slide 16: chỉ làm sáng từng "ga" theo bước (Đạt được, Hạn chế, Hướng phát triển); nội dung là chữ tĩnh. */
var sl = document.getElementById('s16'), dots = sl.querySelectorAll('.cl');
Deck.steps.s16 = function (s) {
  var all = document.documentElement.classList.contains('static');
  Array.prototype.forEach.call(dots, function (c, i) { c.style.setProperty('--on', (all || s >= i) ? 1 : .35); c.querySelector('.dot').style.opacity = (all || s >= i) ? 1 : .35; });
};

/* Hình nhỏ cạnh cột "Đạt được": chuỗi chụp → phân mảnh → mesh → ghép → UART CRC → middleware → dashboard.
   Một gói nhỏ chạy dọc chuỗi, khối nào gói đi qua thì sáng lên (đỏ = mesh, lam = UART, lục = PC). Chỉ dùng chữ đã có trong gạch đầu dòng. */
var chain = document.getElementById('s16chain'), pk = document.getElementById('s16pk'), I = window.Iso;
var bks = Array.prototype.slice.call(chain.querySelectorAll('.bk')).map(function (g) {
  var r = g.querySelector('rect'), x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height');
  return { g: g, c: [x + w / 2, y + h / 2, 0], w: w };
});
var wp = [bks[0].c, bks[1].c, bks[2].c, bks[3].c, [bks[3].c[0], 43, 0], [bks[4].c[0], 43, 0], bks[4].c, bks[5].c, bks[6].c], cum = [0], tot = 0;
for (var q = 1; q < wp.length; q++) { tot += Math.hypot(wp[q][0] - wp[q - 1][0], wp[q][1] - wp[q - 1][1]); cum.push(tot); }
var sIdx = [0, cum[1], cum[2], cum[3], cum[6], cum[7], cum[8]];       /* vị trí (độ dài cung) của từng khối trên đường đi */
var PERIOD = 7.5, RUN = 5.8;
Deck.frames.s16 = function (t) {
  var all = Deck.still || document.documentElement.classList.contains('static');
  var ph = (t % PERIOD) / RUN, u = I.clamp(ph), s = u * tot, p = I.along(wp, u);
  pk.setAttribute('x', (p[0] - 4.5).toFixed(1)); pk.setAttribute('y', (p[1] - 4.5).toFixed(1));
  pk.setAttribute('opacity', all ? 0 : (ph > 1.0 && ph < 1.01 ? 0 : 1));
  bks.forEach(function (b, i) {
    var on = all || (ph <= 1.12 && s >= sIdx[i] - b.w * .35 && ph > 0 && (ph < 1 || s >= sIdx[i]));
    b.g.classList.toggle('on', on);
  });
};
