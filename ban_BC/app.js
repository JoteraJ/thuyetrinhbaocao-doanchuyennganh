/* Bộ điều khiển bài trình bày. Hai chế độ cùng một nội dung:
   · mode-scroll (index.html): cuộn dọc, mỗi lần cuộn hiện từng ý rồi sang slide kế tiếp
   · mode-deck  (trinh-chieu.html): slide 16:9, phím ← → hoặc click */
(function () {
  'use strict';
  var root = document.documentElement, stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var notes = document.getElementById('notes');
  var main = slides.filter(function (s) { return !s.hasAttribute('data-backup'); }).length;
  var firstBackup = slides.findIndex(function (s) { return s.hasAttribute('data-backup'); });
  var cur = -1, step = 0, shownAt = 0, raf = 0;
  var still = /[?&]static\b/.test(location.search);
  var fs = location.search.match(/[?&]step=(\d+)/), forced = fs ? +fs[1] : null, firstShow = true;
  if (still && forced == null) root.classList.add('static');
  var SCROLL = root.classList.contains('mode-scroll') && !still;
  if (SCROLL) root.classList.add('is-scroll');
  var Deck = window.Deck = window.Deck || { frames: {}, steps: {}, shows: {} };
  Deck.still = still;
  var tm = location.search.match(/[?&]t=([\d.]+)/); if (tm) Deck.stillT = +tm[1];

  /* ---- họa tiết trống đồng nền mờ ---- */
  slides.forEach(function (s) {
    if (s.querySelector('.drum')) return;
    var d = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); d.setAttribute('class', 'drum'); d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<use href="#drum"/>'; s.insertBefore(d, s.firstChild);
  });

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
    mk('line', { class: 'done', id: 'metro-done', x1: PX[0], y1: 14, x2: PX[0], y2: 14 });
    SECTIONS.forEach(function (n, i) {
      var g = mk('g', { class: 'sta', 'data-sec': i });
      mk('rect', { x: PX[i] - 40, y: 0, width: 80, height: 44, fill: 'transparent' }, g);
      mk('circle', { class: 'stn', cx: PX[i], cy: 14, r: 9 }, g);
      var t = mk('text', { x: PX[i], y: 40, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle' }, g);
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
    document.getElementById('metro-done').setAttribute('x2', PX[sec]);
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
  function show(i, atEnd, st) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var changed = i !== cur;
    cur = i;
    slides.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
    var s = slides[cur], isB = s.hasAttribute('data-backup');
    step = st != null ? st : atEnd ? maxStep(s) : 0;
    if (firstShow && forced != null) step = forced;
    firstShow = false;
    if (changed) shownAt = performance.now();
    var sec = s.getAttribute('data-sec');
    root.classList.toggle('nometro', isB || sec == null);
    if (sec != null) setMetro(+sec);
    var pg = s.querySelector('.pg');
    if (pg) pg.textContent = isB ? 'DỰ PHÒNG' : String(cur + 1).padStart(2, '0') + ' / ' + String(main).padStart(2, '0');
    var n = s.querySelector('aside');
    notes.innerHTML = n ? n.innerHTML : '<i>Không có ghi chú.</i>';
    applyStep();
    if (changed && Deck.shows[s.id]) Deck.shows[s.id]();
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
    if (!raf && !still) raf = requestAnimationFrame(loop);
    if (still && forced == null) renderAll(); else if (still) { var f = Deck.frames[s.id]; if (f) f(Deck.stillT || 6); }
  }
  /* vẽ sẵn mọi slide (dùng khi in PDF hoặc ?static) */
  function renderAll() {
    slides.forEach(function (s) {
      var n = maxStep(s), f = Deck.steps[s.id], g = Deck.frames[s.id];
      if (f) f(n); if (g) g(Deck.stillT || 6, n);
    });
  }
  window.addEventListener('beforeprint', function () { root.classList.add('static'); renderAll(); });
  window.addEventListener('afterprint', function () { if (!(still && forced == null)) root.classList.remove('static'); applyStep(); });
  var lastDraw = 0;
  function loop(now) {
    raf = 0;
    if (now - lastDraw >= 30) {                       /* tối đa ~33 khung/giây: đủ mượt, nhẹ máy */
      lastDraw = now;
      var f = Deck.frames[slides[cur].id];
      if (f) { f((now - shownAt) / 1000, step); }
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---- chế độ cuộn: mỗi slide chiếm một đoạn cuộn, mỗi bước hiện dần chiếm 0,6 màn hình ---- */
  var segs = [], beats = [], track = null, BEAT = .6, TAIL = .5;
  function buildTrack() {
    var vh = window.innerHeight, y = 0;
    segs = []; beats = [];
    slides.forEach(function (s, i) {
      var n = maxStep(s); segs.push({ start: y, n: n });
      for (var k = 0; k <= n; k++) beats.push({ y: y + k * BEAT * vh, i: i, k: k });
      y += (n + 1) * BEAT * vh + TAIL * vh;
    });
    track.style.height = (y + TAIL * vh) + 'px';
  }
  function posFromScroll() {
    var vh = window.innerHeight, y = window.scrollY + 1, i = 0;
    for (var j = 0; j < segs.length; j++) if (y >= segs[j].start) i = j;
    var k = Math.min(segs[i].n, Math.max(0, Math.floor((y - segs[i].start) / (BEAT * vh))));
    return { i: i, k: k };
  }
  var tick = 0;
  function onScroll() {
    if (tick) return;
    tick = requestAnimationFrame(function () {
      tick = 0; var p = posFromScroll();
      if (p.i !== cur) show(p.i, false, p.k);
      else if (p.k !== step) { step = p.k; applyStep(); }
    });
  }
  function beatIndex() { var p = posFromScroll(), n = 0; for (var j = 0; j < beats.length; j++) if (beats[j].i === p.i && beats[j].k === p.k) n = j; return n; }
  function goBeat(d) { var n = Math.max(0, Math.min(beats.length - 1, beatIndex() + d)); window.scrollTo({ top: beats[n].y + 2, behavior: 'smooth' }); }
  function goSlide(i, instant) { i = Math.max(0, Math.min(slides.length - 1, i)); window.scrollTo({ top: segs[i].start + 2, behavior: instant ? 'auto' : 'smooth' }); }
  function goSection(sec) { for (var i = 0; i < slides.length; i++) if (slides[i].getAttribute('data-sec') === String(sec)) return goSlide(i); }

  /* ---- trình chiếu bằng phím ---- */
  function next() { if (SCROLL) return goBeat(1); if (step < maxStep(slides[cur])) { step++; applyStep(); } else show(cur + 1); }
  function prev() { if (SCROLL) return goBeat(-1); if (step > 0) { step--; applyStep(); } else if (cur > 0) show(cur - 1, true); }
  function jump(i) { if (SCROLL) goSlide(i); else show(i); }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') jump(0);
    else if (k === 'End') jump(main - 1);
    else if (k === 'b' || k === 'B') jump(firstBackup >= 0 ? firstBackup : cur);
    else if (k === 'n' || k === 'N') notes.classList.toggle('on');
    else if (k === 'm' || k === 'M') { location.href = (SCROLL ? 'trinh-chieu.html' : 'index.html') + '#' + (cur + 1); }
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen(); }
    else if (/^[a-dA-D]$/.test(k) && firstBackup >= 0) jump(firstBackup + k.toLowerCase().charCodeAt(0) - 97);
  });
  document.addEventListener('click', function (e) {
    var st = e.target.closest && e.target.closest('.sta'); if (st) { goSection(+st.getAttribute('data-sec')); return; }
    if (SCROLL || e.target.closest('#help,#notes,a,button')) return;
    if (e.clientX < window.innerWidth * 0.25) prev(); else next();
  });
  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx == null || SCROLL) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  }, { passive: true });
  var nb = document.getElementById('nbtn'); if (nb) nb.addEventListener('click', function () { notes.classList.toggle('on'); });
  var mb = document.getElementById('mbtn'); if (mb) mb.addEventListener('click', function () { location.href = (SCROLL ? 'trinh-chieu.html' : 'index.html') + '#' + (cur + 1); });
  var idleT = setTimeout(function () { root.classList.add('idle'); }, 4000);
  document.addEventListener('mousemove', function () { root.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { root.classList.add('idle'); }, 3000); });
  window.addEventListener('resize', function () { fit(); if (SCROLL) { var p = posFromScroll(); buildTrack(); window.scrollTo(0, beats.filter(function (b) { return b.i === p.i && b.k === p.k; })[0].y + 2); } });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) shownAt = performance.now() - 1000; });

  fit();
  var hv = location.hash.slice(1), hi = slides.findIndex(function (s) { return s.id === hv; }), h = parseInt(hv, 10);
  var start = hi >= 0 ? hi : isNaN(h) ? 0 : h - 1;
  if (SCROLL) {
    track = document.createElement('div'); track.id = 'track'; document.body.appendChild(track);
    buildTrack();
    window.addEventListener('scroll', onScroll, { passive: true });
    show(start, false, 0);
    goSlide(start, true);
  } else show(start);
  window.__ready = 1;
})();
