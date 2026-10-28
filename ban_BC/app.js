/* Bộ điều khiển bài trình bày. Hai chế độ cùng một nội dung:
   · mode-scroll (index.html): cuộn dọc; mỗi lần cuộn hiện một ý, rồi slide chuyển sang slide kế kiểu "Morph"
   · mode-deck  (trinh-chieu.html): slide 16:9, phím ← → hoặc click
   Chuyển slide kiểu Morph: tiêu đề trượt từ vị trí/cỡ này sang vị trí/cỡ kia (từ trùng nhau bay thẳng sang chỗ mới, từ khác mờ dần/hiện dần),
   nền, đường kẻ đầu slide và dải tiến độ đổi màu liền mạch, nội dung cũ mờ đi trong khi nội dung mới hiện lên. */
(function () {
  'use strict';
  var root = document.documentElement, stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var notes = document.getElementById('notes');
  var main = slides.filter(function (s) { return !s.hasAttribute('data-backup'); }).length;
  var firstBackup = slides.findIndex(function (s) { return s.hasAttribute('data-backup'); });
  var cur = -1, step = 0, raf = 0;
  var shownAt = {}, stepOf = {}, active = [];
  var still = /[?&]static\b/.test(location.search);
  var fs = location.search.match(/[?&]step=(\d+)/), forced = fs ? +fs[1] : null, firstShow = true;
  if (still && forced == null) root.classList.add('static');
  if (/[?&]detail\b/.test(location.search)) root.classList.add('detail');
  var SCROLL = root.classList.contains('mode-scroll') && !still;
  root.classList.toggle('is-scroll', SCROLL);
  var Deck = window.Deck = window.Deck || { frames: {}, steps: {}, shows: {} };
  Deck.still = still;
  var tm = location.search.match(/[?&]t=([\d.]+)/); if (tm) Deck.stillT = +tm[1];
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  /* số trang điền sẵn cho mọi slide (để in PDF cũng có số trang) */
  slides.forEach(function (s, i) {
    var pg = s.querySelector('.pg');
    if (pg) pg.textContent = s.hasAttribute('data-backup') ? 'DỰ PHÒNG' : String(i + 1).padStart(2, '0') + ' / ' + String(main).padStart(2, '0');
  });

  /* ---- chia tiêu đề thành từng từ để chuyển slide kiểu Morph ---- */
  function splitWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(' '));
          else { var w = document.createElement('span'); w.className = 'w'; w.textContent = p; frag.appendChild(w); }
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) splitWords(n);
    });
  }
  var titleOf = slides.map(function (s) {
    var h = null; Array.prototype.forEach.call(s.children, function (c) { if (c.matches && c.matches('h2.t')) h = c; });
    if (h) splitWords(h);
    return h;
  });

  /* ---- tỉ lệ khung ---- */
  var kScale = 1;
  function fit() {
    kScale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'translate(-50%,-50%) scale(' + kScale + ')';
  }

  /* ---- đường kẻ đầu slide dùng chung (không nhân đôi khi hai slide chồng lên nhau) ---- */
  var rule = document.createElement('div'); rule.id = 'rule'; stage.appendChild(rule);

  /* ---- dải tàu điện: 5 phần của bài ---- */
  var SECTIONS = ['Vấn đề và mục tiêu', 'Lý thuyết', 'Thiết kế hệ thống', 'Kết quả thực nghiệm', 'Kết luận'];
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
      mk('rect', { x: PX[i] - 110, y: 0, width: 220, height: 44, fill: 'transparent' }, g);
      mk('circle', { class: 'stn', cx: PX[i], cy: 14, r: 9 }, g);
      var t = mk('text', { x: PX[i], y: 40, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle' }, g);
      if (i === 0) t.setAttribute('x', PX[i] - 14); if (i === 4) t.setAttribute('x', PX[i] + 14);
      t.textContent = (i + 1) + ' · ' + n;
    });
    var tr = mk('g', { class: 'tr', id: 'metro-tr' });
    mk('rect', { x: -10, y: 4, width: 20, height: 20, fill: '#d9432b', stroke: '#1c1b19', 'stroke-width': 2.5 }, tr);
    metro.appendChild(svg);
  })();
  var metroSec = -2;
  function setMetro(sec) {
    if (sec === metroSec) return; metroSec = sec;
    var ss = metro.querySelectorAll('.stn'), tt = metro.querySelectorAll('text');
    Array.prototype.forEach.call(ss, function (c, i) { c.classList.toggle('on', i === sec); });
    Array.prototype.forEach.call(tt, function (c, i) { c.classList.toggle('on', i === sec); });
    document.getElementById('metro-done').setAttribute('x2', PX[sec]);
    document.getElementById('metro-tr').style.transform = 'translate(' + PX[sec] + 'px,0)';
  }

  /* ---- đo vị trí từng từ của tiêu đề, màu nền, vị trí đường kẻ của mọi slide (một lần, sau khi font đã tải) ---- */
  var meta = [], measured = false;
  function parseRgb(c) { var m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; }
  function measure() {
    if (measured) return; measured = true;
    var paper = parseRgb(getComputedStyle(stage).backgroundColor), sr = stage.getBoundingClientRect(), k = sr.width / 1280 || 1;
    slides.forEach(function (s, i) {
      var was = s.style.cssText; s.style.display = 'flex'; s.style.visibility = 'hidden';
      var cs = getComputedStyle(s), bg = cs.backgroundColor, night = s.classList.contains('night');
      var hd = s.querySelector('.hd'), hb = hd ? (hd.getBoundingClientRect().bottom - sr.top) / k : 100;
      var ink = parseRgb(cs.getPropertyValue('--ink') ? cs.color : '#000');
      var words = [];
      if (titleOf[i]) Array.prototype.forEach.call(titleOf[i].querySelectorAll('.w'), function (w) {
        var r = w.getBoundingClientRect();
        words.push({ el: w, key: w.textContent.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''), x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k });
      });
      meta[i] = { bg: night ? parseRgb(bg) : paper, rule: { y: hb - 2, c: ink, a: night ? .5 : 1 }, words: words, night: night };
      s.style.cssText = was;
    });
  }
  var pairCache = {};
  function pairs(a, b) {                      /* ghép các từ trùng nhau theo thứ tự, mỗi từ dùng một lần */
    var key = a + '>' + b; if (pairCache[key]) return pairCache[key];
    var A = meta[a].words, B = meta[b].words, used = {}, out = [], last = -1;
    B.forEach(function (wb, jb) {
      if (wb.key.length < 2) return;
      for (var ia = last + 1; ia < A.length; ia++) if (!used[ia] && A[ia].key === wb.key) { used[ia] = 1; last = ia; out.push([ia, jb]); break; }
    });
    return (pairCache[key] = out);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measured = false; measure(); });

  /* ---- hiển thị ---- */
  function maxStep(s) {
    var m = 0; Array.prototype.forEach.call(s.querySelectorAll('[data-s]'), function (e) { m = Math.max(m, +e.getAttribute('data-s')); });
    return m;
  }
  function applyStepOf(i, st) {
    var s = slides[i]; stepOf[i] = st;
    Array.prototype.forEach.call(s.querySelectorAll('[data-s]'), function (e) { e.classList.toggle('vis', (still && forced == null) || +e.getAttribute('data-s') <= st); });
    var f = Deck.steps[s.id]; if (f) f(st);
  }
  function applyStep() { applyStepOf(cur, step); }
  function clearMorph() {                     /* gỡ mọi biến đổi tạm của chuyển slide */
    slides.forEach(function (s, i) {
      s.style.removeProperty('--fade'); s.style.removeProperty('--ty'); s.style.zIndex = '';
      var kk = s.querySelector('.hd .k'); if (kk) kk.style.opacity = '';
      if (meta[i]) meta[i].words.forEach(function (w) { w.el.style.opacity = ''; w.el.style.transform = ''; });
    });
    stage.style.background = ''; root.classList.remove('xf');
  }
  function setRule(y, c, a) { rule.style.top = y + 'px'; rule.style.background = 'rgba(' + c.map(Math.round).join(',') + ',' + a + ')'; }
  function activate(i) { if (shownAt[i] == null || active.indexOf(i) < 0) { shownAt[i] = performance.now(); if (Deck.shows[slides[i].id]) Deck.shows[slides[i].id](); } }
  function setCurrent(i) {                    /* slide đang "được nói tới": ghi chú, địa chỉ, dải tàu điện */
    if (i === cur) return;
    cur = i;
    var s = slides[i], isB = s.hasAttribute('data-backup'), sec = s.getAttribute('data-sec');
    root.classList.toggle('nometro', isB || sec == null);
    if (sec != null) setMetro(+sec);
    var n = s.querySelector('aside');
    notes.innerHTML = n ? n.innerHTML : '<i>Không có ghi chú.</i>';
    try { history.replaceState(null, '', '#' + (isB ? s.id : i + 1)); } catch (e) {}
  }
  function show(i, atEnd, st) {               /* hiện đúng một slide, không chuyển động */
    i = Math.max(0, Math.min(slides.length - 1, i));
    measure(); clearMorph();
    var changed = i !== cur || active.length !== 1;
    slides.forEach(function (s, j) { s.classList.toggle('on', j === i); });
    cur = -1; setCurrent(i);
    var s = slides[i];
    step = st != null ? st : atEnd ? maxStep(s) : 0;
    if (firstShow && forced != null) step = forced;
    firstShow = false;
    active = [i]; if (changed || shownAt[i] == null) { shownAt[i] = performance.now(); if (Deck.shows[s.id]) Deck.shows[s.id](); }
    applyStep();
    if (meta[i]) setRule(meta[i].rule.y, meta[i].rule.c, meta[i].rule.a);
    if (!raf && !still) raf = requestAnimationFrame(loop);
    if (still && forced == null) renderAll(); else if (still) { var f = Deck.frames[s.id]; if (f) f(Deck.stillT || 6); }
  }
  /* chuyển slide a → b với tiến độ e (0..1); stepB = bước đang hiện của slide đích */
  function morph(a, b, e, stepB) {
    measure();
    var A = meta[a], B = meta[b], d = b > a ? 1 : -1;
    root.classList.add('xf');
    slides.forEach(function (s, j) { s.classList.toggle('on', j === a || j === b); });
    slides[a].style.zIndex = 1; slides[b].style.zIndex = 2;
    slides[a].style.setProperty('--fade', (1 - clamp(e / .55)).toFixed(3)); slides[a].style.setProperty('--ty', (-d * 46 * e).toFixed(1) + 'px');
    slides[b].style.setProperty('--fade', clamp((e - .45) / .55).toFixed(3)); slides[b].style.setProperty('--ty', (d * 46 * (1 - e)).toFixed(1) + 'px');
    /* nền, đường kẻ */
    var bg = A.bg.map(function (v, k) { return lerp(v, B.bg[k], e); });
    stage.style.background = 'rgb(' + bg.map(Math.round).join(',') + ')';
    setRule(lerp(A.rule.y, B.rule.y, e), A.rule.c.map(function (v, k) { return lerp(v, B.rule.c[k], e); }), lerp(A.rule.a, B.rule.a, e));
    /* nhãn đầu slide (kick) trùng chữ thì đứng yên, không mờ rồi hiện lại */
    var ka = slides[a].querySelector('.hd .k'), kb = slides[b].querySelector('.hd .k');
    if (ka && kb && ka.textContent === kb.textContent) { ka.style.opacity = 0; kb.style.opacity = 1; } else { if (ka) ka.style.opacity = ''; if (kb) kb.style.opacity = ''; }
    /* tiêu đề: từ trùng nhau bay sang vị trí mới, từ khác mờ đi / hiện lên */
    var pr = pairs(a, b), ma = {}, mb = {};
    pr.forEach(function (p) { ma[p[0]] = p[1]; mb[p[1]] = p[0]; });
    A.words.forEach(function (w, ia) {
      if (ia in ma) w.el.style.opacity = e > .001 ? 0 : 1;
      else { w.el.style.opacity = (1 - clamp(e / .45)).toFixed(3); w.el.style.transform = 'translateY(' + (-d * 16 * e).toFixed(1) + 'px)'; }
    });
    B.words.forEach(function (w, ib) {
      if (ib in mb) {
        var wa = A.words[mb[ib]], s = lerp(wa.h / w.h, 1, e);
        w.el.style.opacity = 1;
        w.el.style.transform = 'translate(' + ((wa.x - w.x) * (1 - e)).toFixed(1) + 'px,' + ((wa.y - w.y) * (1 - e)).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      } else { w.el.style.opacity = clamp((e - .55) / .45).toFixed(3); w.el.style.transform = 'translateY(' + (d * 16 * (1 - e)).toFixed(1) + 'px)'; }
    });
    /* trạng thái các bước: slide cũ hiện đủ, slide mới theo stepB */
    if (stepOf[a] !== maxStep(slides[a]) || active.indexOf(a) < 0) applyStepOf(a, maxStep(slides[a]));
    if (active.indexOf(b) < 0) { shownAt[b] = performance.now(); if (Deck.shows[slides[b].id]) Deck.shows[slides[b].id](); }
    if (stepOf[b] !== stepB) applyStepOf(b, stepB);
    active = [a, b];
    setCurrent(e >= .5 ? b : a);
    step = stepOf[cur];
    if (!raf && !still) raf = requestAnimationFrame(loop);
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
      active.forEach(function (i) { var f = Deck.frames[slides[i].id]; if (f) f((now - (shownAt[i] || now)) / 1000, stepOf[i] || 0); });
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---- chế độ cuộn: mỗi slide chiếm một đoạn cuộn; mỗi bước hiện dần 0,6 màn hình; cuối đoạn là vùng chuyển slide ---- */
  var segs = [], beats = [], track = null, BEAT = .6, XF = .6, TAIL = .5;
  function buildTrack() {
    var vh = window.innerHeight, y = 0;
    segs = []; beats = [];
    slides.slice(0, main).forEach(function (s, i) {
      var n = maxStep(s), hold = y + (n + 1) * BEAT * vh, last = i === main - 1;
      segs.push({ start: y, n: n, hold: hold, xf: last ? 0 : XF * vh });
      for (var k = 0; k <= n; k++) beats.push({ y: y + k * BEAT * vh, i: i, k: k });
      y = hold + (last ? TAIL * vh : XF * vh);
    });
    track.style.height = (y + TAIL * vh) + 'px';
  }
  function posFromScroll() {
    var vh = window.innerHeight, y = window.scrollY + 1, i = 0;
    for (var j = 0; j < segs.length; j++) if (y >= segs[j].start) i = j;
    var sg = segs[i], x = sg.xf && y > sg.hold ? clamp((y - sg.hold) / sg.xf) : 0;
    var k = Math.min(sg.n, Math.max(0, Math.floor((y - sg.start) / (BEAT * vh))));
    return { i: i, k: k, x: x };
  }
  Deck.getSegs = function () { return segs; };
  var tick = 0;
  function renderScroll() {
    var p = posFromScroll();
    if (p.x > 0 && p.i < main - 1) morph(p.i, p.i + 1, ease(p.x), 0);
    else if (p.i !== cur || p.k !== step || active.length !== 1) show(p.i, false, p.k);
  }
  function onScroll() {
    if (!SCROLL || tick) return;
    if (backup) { closeBackup(); return; }
    tick = requestAnimationFrame(function () { tick = 0; renderScroll(); });
  }
  function beatIndex() { var p = posFromScroll(), n = 0; for (var j = 0; j < beats.length; j++) if (beats[j].i === p.i && beats[j].k === p.k) n = j; return n; }
  /* cuộn mượt có đường cong riêng (không phụ thuộc trình duyệt) để chuyển slide đều và liền mạch */
  var anim = 0;
  function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = 0; } }
  function animateScroll(to, instant) {
    stopAnim();
    var from = window.scrollY, dist = Math.abs(to - from), vh = window.innerHeight;
    if (instant || dist > 3.2 * vh || dist < 2) { window.scrollTo(0, to); renderScroll(); return; }
    var dur = Math.max(560, Math.min(1150, 480 + dist / vh * 520)), t0 = performance.now();
    (function f(now) {
      var u = clamp((now - t0) / dur);
      window.scrollTo(0, from + (to - from) * ease(u));
      anim = u < 1 ? requestAnimationFrame(f) : 0;
    })(t0);
  }
  var goal = -1, goalT = 0;
  function goBeat(d) {                                  /* tính từ bước ĐÍCH đang cuộn tới, nên bấm nhanh liên tiếp vẫn đi đủ từng bước */
    var base = (goal >= 0 && performance.now() - goalT < 1200) ? goal : beatIndex();
    var n = Math.max(0, Math.min(beats.length - 1, base + d));
    goal = n; goalT = performance.now();
    animateScroll(beats[n].y + 2);
  }
  function goBeatOf(i, k, instant) {
    for (var j = 0; j < beats.length; j++) if (beats[j].i === i && beats[j].k === Math.min(k, segs[i].n)) { animateScroll(beats[j].y + 2, instant); return; }
  }
  function goSlide(i, instant) { i = Math.max(0, Math.min(main - 1, i)); animateScroll(segs[i].start + 2, instant); }
  function goSection(sec) { if (backup) closeBackup(); for (var i = 0; i < main; i++) if (slides[i].getAttribute('data-sec') === String(sec)) return goSlide(i); }

  /* ---- chuyển slide trong chế độ trình chiếu (phím): cùng hiệu ứng Morph, chạy theo thời gian ---- */
  var dtr = null;
  function finishDeck() { if (!dtr) return; var t = dtr; dtr = null; show(t.b, false, t.atEnd ? maxStep(slides[t.b]) : 0); }
  function deckGo(b, atEnd) {
    finishDeck();
    if (b === cur || b < 0 || b >= main) return;
    var a = cur, t0 = performance.now(), dur = 780, stB = atEnd ? maxStep(slides[b]) : 0;
    dtr = { a: a, b: b, atEnd: atEnd };
    (function f(now) {
      if (!dtr) return;
      var u = clamp((now - t0) / dur);
      if (u >= 1) { finishDeck(); return; }
      morph(a, b, ease(u), stB); requestAnimationFrame(f);
    })(t0);
  }

  /* ---- slide dự phòng A–D: không nằm trong dòng chảy của bài; chỉ hiện khi bấm B (hoặc A, C, D) ---- */
  var backup = false, back = { i: 0, k: 0 };
  function openBackup(j) {
    if (firstBackup < 0) return;
    finishDeck(); stopAnim();
    j = Math.max(0, Math.min(slides.length - firstBackup - 1, j));
    if (!backup) { back = { i: cur, k: step }; backup = true; }
    show(firstBackup + j, false, 0);
  }
  function closeBackup() { if (!backup) return; backup = false; if (SCROLL) goBeatOf(back.i, back.k, true); show(back.i, false, back.k); }

  function setMode(sc) {
    finishDeck(); stopAnim();
    if (backup) closeBackup();
    SCROLL = sc;
    var keepStep = step, keepCur = cur;
    root.classList.toggle('mode-scroll', sc); root.classList.toggle('mode-deck', !sc); root.classList.toggle('is-scroll', sc);
    if (sc) { track.style.display = ''; buildTrack(); goBeatOf(keepCur, keepStep, true); show(keepCur, false, keepStep); }
    else { track.style.display = 'none'; window.scrollTo(0, 0); show(keepCur, false, keepStep); }
  }

  /* ---- phím ---- */
  function next() {
    if (backup) { if (step < maxStep(slides[cur])) { step++; applyStep(); } else if (cur < slides.length - 1) show(cur + 1); return; }
    if (SCROLL) return goBeat(1);
    finishDeck();
    if (step < maxStep(slides[cur])) { step++; applyStep(); } else if (cur < main - 1) deckGo(cur + 1, false);
  }
  function prev() {
    if (backup) { if (step > 0) { step--; applyStep(); } else if (cur > firstBackup) show(cur - 1, true); else closeBackup(); return; }
    if (SCROLL) return goBeat(-1);
    finishDeck();
    if (step > 0) { step--; applyStep(); } else if (cur > 0) deckGo(cur - 1, true);
  }
  function jump(i) { if (backup) closeBackup(); if (SCROLL) goSlide(i); else { finishDeck(); show(i); } }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); jump(0); }
    else if (k === 'End') { e.preventDefault(); jump(main - 1); }
    else if (k === 'b' || k === 'B') { if (backup) closeBackup(); else openBackup(0); }
    else if (k === 'Escape') closeBackup();
    else if (k === 'n' || k === 'N') notes.classList.toggle('on');
    else if (k === 'k' || k === 'K') root.classList.toggle('detail');                     /* K: bật/tắt câu gốc đầy đủ (chế độ chi tiết) */
    else if (k === 'm' || k === 'M') setMode(!SCROLL);
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen(); }
    else if (/^[acdACD]$/.test(k)) openBackup(k.toLowerCase().charCodeAt(0) - 97);
  });
  document.addEventListener('click', function (e) {
    var st = e.target.closest && e.target.closest('.sta'); if (st) { goSection(+st.getAttribute('data-sec')); return; }
    if (SCROLL || e.target.closest('#help,#notes,a,button')) return;
    if (e.clientX < window.innerWidth * 0.25) prev(); else next();
  });
  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; stopAnim(); }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx == null || SCROLL) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  }, { passive: true });
  document.addEventListener('mousedown', stopAnim);
  /* chế độ cuộn: mỗi lần lăn chuột/vuốt bàn di chuột = đúng một bước; quán tính của bàn di chuột không nhảy thêm bước */
  var lastWheel = 0, armed = true, acc = 0;
  window.addEventListener('wheel', function (e) {
    if (!SCROLL || e.ctrlKey || (e.target.closest && e.target.closest('#notes'))) return;
    e.preventDefault();
    if (backup) { closeBackup(); return; }
    var now = performance.now();
    if (now - lastWheel > 160) { armed = true; acc = 0; }
    lastWheel = now;
    if (!armed) return;
    acc += e.deltaY * (e.deltaMode === 1 ? 33 : 1);
    if (Math.abs(acc) >= 40) { armed = false; goBeat(acc > 0 ? 1 : -1); acc = 0; }
  }, { passive: false });
  var nb = document.getElementById('nbtn'); if (nb) nb.addEventListener('click', function () { notes.classList.toggle('on'); });
  var idleT = setTimeout(function () { root.classList.add('idle'); }, 3000);
  document.addEventListener('mousemove', function () { root.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { root.classList.add('idle'); }, 3000); });
  window.addEventListener('resize', function () { fit(); if (SCROLL && track) { var p = posFromScroll(); buildTrack(); goBeatOf(p.i, p.k, true); } });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) active.forEach(function (i) { shownAt[i] = performance.now() - 1000; }); });

  fit();
  var hv = location.hash.slice(1), hi = slides.findIndex(function (s) { return s.id === hv; }), h = parseInt(hv, 10);
  var start = hi >= 0 ? hi : isNaN(h) ? 0 : h - 1;
  track = document.createElement('div'); track.id = 'track'; document.body.appendChild(track);
  window.addEventListener('scroll', onScroll, { passive: true });
  if (start >= main) {                                   /* mở thẳng một slide dự phòng (đường dẫn #b1…) */
    back = { i: main - 1, k: 0 }; backup = true;
    if (SCROLL) buildTrack(); else track.style.display = 'none';
    show(start);
  } else if (SCROLL) {
    buildTrack();
    show(start, false, 0);
    goSlide(start, true);
  } else { track.style.display = 'none'; show(start); }
  window.__ready = 1;
})();
