(function () {
  'use strict';
  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var notes = document.getElementById('notes');
  var bar = document.getElementById('bar');
  var main = slides.filter(function (s) { return !s.hasAttribute('data-backup'); }).length;
  var firstBackup = slides.findIndex(function (s) { return s.hasAttribute('data-backup'); });
  var cur = 0;
  if (/[?&]static\b/.test(location.search)) root.classList.add('noanim');

  function fit() {
    var k = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
  }
  function show(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
    var s = slides[cur], isB = s.hasAttribute('data-backup');
    bar.style.width = (isB ? 100 : (cur + 1) / main * 100) + '%';
    var pn = s.querySelector('.pn');
    if (pn) pn.textContent = isB ? 'DỰ PHÒNG' : (cur + 1) + ' / ' + main;
    var n = s.querySelector('aside');
    notes.innerHTML = n ? n.innerHTML : '<i>Không có ghi chú.</i>';
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }
  function toggleTheme() { root.setAttribute('data-theme', root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); show(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); show(cur - 1); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(main - 1);
    else if (k === 'b' || k === 'B') show(firstBackup >= 0 ? firstBackup : cur);
    else if (k === 'n' || k === 'N') notes.classList.toggle('on');
    else if (k === 't' || k === 'T') toggleTheme();
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen(); }
    else if (/^[a-dA-D]$/.test(k) && firstBackup >= 0) show(firstBackup + k.toLowerCase().charCodeAt(0) - 97);
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('#help,#notes,a,button')) return;
    show(cur + (e.clientX < window.innerWidth * 0.25 ? -1 : 1));
  });
  document.getElementById('theme').addEventListener('click', toggleTheme);
  document.getElementById('nbtn').addEventListener('click', function () { notes.classList.toggle('on'); });
  window.addEventListener('resize', fit);

  // mạng mesh trang trí ở trang bìa
  (function () {
    var NS = 'http://www.w3.org/2000/svg', svg = document.getElementById('meshbg');
    var P = [[90, 120], [250, 300], [180, 520], [420, 160], [520, 400], [380, 600], [700, 250], [820, 470], [640, 620], [950, 160], [1050, 340], [1120, 560]];
    function mk(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); svg.appendChild(e); }
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++)
      if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 290)
        mk('line', { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: 'var(--accent2)', 'stroke-opacity': '.3', 'stroke-width': '1.4' });
    P.forEach(function (p) { mk('circle', { cx: p[0], cy: p[1], r: 6, fill: 'var(--accent)', 'fill-opacity': '.85' }); });
  })();

  fit();
  var h = parseInt(location.hash.slice(1), 10);
  show(isNaN(h) ? 0 : h - 1);
  window.__ready = 1;
})();
