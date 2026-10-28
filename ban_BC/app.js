/* Bộ điều khiển bài trình bày: slide 16:9, bước hiện dần, dải tàu điện, ghi chú nói */
(function () {
  'use strict';
  var root = document.documentElement, stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var notes = document.getElementById('notes');
  var main = slides.filter(function (s) { return !s.hasAttribute('data-backup'); }).length;
  var firstBackup = slides.findIndex(function (s) { return s.hasAttribute('data-backup'); });
  var cur = 0, step = 0, shownAt = 0, raf = 0;
  var still = /[?&]static\b/.test(location.search);
  var fs = location.search.match(/[?&]step=(\d+)/), forced = fs ? +fs[1] : null, firstShow = true;
  if (still && forced == null) root.classList.add('static');
  var Deck = window.Deck = window.Deck || { frames: {}, steps: {}, shows: {} };
  Deck.still = still;
  var tm = location.search.match(/[?&]t=([\d.]+)/); if (tm) Deck.stillT = +tm[1];

  /* ---- tỉ lệ khung ---- */
  function fit() {
    var k = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
  }

  /* ---- dải tàu điện: 5 phần của bài ---- */
  var SECTIONS = ['Đặt vấn đề và mục tiêu', 'Cơ sở lý thuyết', 'Thiết kế hệ thống', 'Kết quả thực nghiệm', 'Kết luận'];
  var metro = document.createElement('div'); metro.id = 'metro'; stage.appendChild(metro);
  var NS = 'http://www.w3.org/2000/svg', W = 1136, PX = [];
  (function () {
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' 44');
    function mk(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
    for (var i = 0; i < 5; i++) PX.push(14 + i * (W - 28) / 4);
    mk('line', { class: 'ln', x1: PX[0], y1: 14, x2: PX[4], y2: 14 });
    var done = mk('line', { class: 'done', id: 'metro-done', x1: PX[0], y1: 14, x2: PX[0], y2: 14 });
    SECTIONS.forEach(function (n, i) {
      mk('circle', { class: 'stn', cx: PX[i], cy: 14, r: 9 });
      var t = mk('text', { x: PX[i], y: 40, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle' });
      if (i === 0) t.setAttribute('x', PX[i] - 14); if (i === 4) t.setAttribute('x', PX[i] + 14);
      t.textContent = (i + 1) + ' · ' + n;
    });
    var tr = mk('g', { class: 'tr', id: 'metro-tr' });
    mk('rect', { x: -10, y: 4, width: 20, height: 20, fill: '#d9432b', stroke: '#1c1b19', 'stroke-width': 2.5 }, tr);
    metro.appendChild(svg);
  })();
  function setMetro(sec) {
    var ss = metro.querySelectorAll('.stn'), tt = metro.querySelectorAll('text');
    Array.prototype.forEach.call(ss, function (c, i) { c.classList.toggle('on', i === sec); });
    Array.prototype.forEach.call(tt, function (c, i) { c.classList.toggle('on', i === sec); });
    var d = document.getElementById('metro-done'); d.setAttribute('x2', PX[sec]);
    document.getElementById('metro-tr').style.transform = 'translate(' + PX[sec] + 'px,0)';
  }

  /* ---- hiển thị ---- */
  function maxStep(s) {
    var m = 0; Array.prototype.forEach.call(s.querySelectorAll('[data-s]'), function (e) { m = Math.max(m, +e.getAttribute('data-s')); });
    return m;
  }
  function applyStep() {
    var s = slides[cur];
    Array.prototype.forEach.call(s.querySelectorAll('[data-s]'), function (e) { e.classList.toggle('vis', (still && forced == null) || +e.getAttribute('data-s') <= step); });
    var f = Deck.steps[s.id]; if (f) f(step);
  }
  function show(i, atEnd) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
    var s = slides[cur], isB = s.hasAttribute('data-backup');
    step = atEnd ? maxStep(s) : 0;
    if (firstShow && forced != null) step = forced;
    firstShow = false;
    shownAt = performance.now();
    var sec = s.getAttribute('data-sec');
    root.classList.toggle('nometro', isB || sec == null);
    if (sec != null) setMetro(+sec);
    var pg = s.querySelector('.pg');
    if (pg) pg.textContent = isB ? 'DỰ PHÒNG' : String(cur + 1).padStart(2, '0') + ' / ' + String(main).padStart(2, '0');
    var n = s.querySelector('aside');
    notes.innerHTML = n ? n.innerHTML : '<i>Không có ghi chú.</i>';
    applyStep();
    if (Deck.shows[s.id]) Deck.shows[s.id]();
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
    if (!raf && !still) raf = requestAnimationFrame(loop);
    if (still) { var f = Deck.frames[s.id]; if (f) f(Deck.stillT || 6); }
  }
  function next() { if (step < maxStep(slides[cur])) { step++; applyStep(); } else show(cur + 1); }
  function prev() { if (step > 0) { step--; applyStep(); } else if (cur > 0) show(cur - 1, true); }
  function loop(now) {
    raf = 0;
    var f = Deck.frames[slides[cur].id];
    if (f) { f((now - shownAt) / 1000, step); }
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(main - 1);
    else if (k === 'b' || k === 'B') show(firstBackup >= 0 ? firstBackup : cur);
    else if (k === 'n' || k === 'N') notes.classList.toggle('on');
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen(); }
    else if (/^[a-dA-D]$/.test(k) && firstBackup >= 0) show(firstBackup + k.toLowerCase().charCodeAt(0) - 97);
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('#help,#notes,a,button')) return;
    if (e.clientX < window.innerWidth * 0.25) prev(); else next();
  });
  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  }, { passive: true });
  var nb = document.getElementById('nbtn'); if (nb) nb.addEventListener('click', function () { notes.classList.toggle('on'); });
  var idleT = 0;
  document.addEventListener('mousemove', function () { root.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { root.classList.add('idle'); }, 3000); });
  window.addEventListener('resize', fit);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) shownAt = performance.now() - 1000; });

  fit();
  var hv = location.hash.slice(1), hi = slides.findIndex(function (s) { return s.id === hv; }), h = parseInt(hv, 10);
  show(hi >= 0 ? hi : isNaN(h) ? 0 : h - 1);
  window.__ready = 1;
})();
