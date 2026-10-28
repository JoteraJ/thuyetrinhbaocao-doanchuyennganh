(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = /[?&]static\b/.test(location.search);   // mặc định luôn chạy animation; thêm ?static vào URL để tắt
  var live = !reduce && typeof window.anime === 'function';
  window.__ready = 1;
  if (!live) root.classList.add('noanim'); else root.classList.remove('noanim');
  var vi = function (n, d) { return n.toFixed(d).replace('.', ','); };
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function wc(els, on) { els.forEach(function (e) { e.style.willChange = on ? 'transform, opacity' : ''; }); }

  /* ---------- hero: vòng lặp tạm dừng khi ra khỏi khung nhìn / tab ẩn ---------- */
  var screens = [];
  function watch(el) {
    var s = { vis: false, loops: [] };
    screens.push(s);
    if (!live || !('IntersectionObserver' in window)) return s;
    new IntersectionObserver(function (es) { s.vis = es[es.length - 1].isIntersecting; sync(s); }).observe(el);
    return s;
  }
  function sync(s) {
    var run = s.vis && !document.hidden;
    s.loops.forEach(function (a) { if (run) a.play(); else a.pause(); });
  }
  document.addEventListener('visibilitychange', function () { screens.forEach(sync); });

  document.addEventListener('keydown', function (e) { if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) document.body.classList.toggle('notes'); });
  /* ---------- theme ---------- */
  $('#theme').addEventListener('click', function () {
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  /* ---------- nav dots (click: cuộn mượt tới đầu màn) ---------- */
  var secs = $$('[data-nav]:not([hidden])'), nav = $('#nav');
  secs.forEach(function (s) {
    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.setAttribute('aria-label', s.dataset.nav);
    a.innerHTML = '<span>' + s.dataset.nav + '</span>';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    nav.appendChild(a);
  });
  var dots = $$('a', nav);
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) dots.forEach(function (d, i) { d.classList.toggle('on', secs[i] === e.target); });
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    secs.forEach(function (s) { nio.observe(s); });
  }

  /* ---------- bộ scrub: 1 listener scroll, 1 vòng rAF lerp, chỉ cập nhật màn đang trong khung nhìn ---------- */
  var SMOOTH = 0.12;            // hệ số đuổi theo mỗi khung 60 Hz; chuẩn hóa theo dt cho màn 120 Hz
  var scrubs = [], raf = 0, lastT = 0;
  var bar = $('#bar i'), maxScroll = 1, queued = false;
  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  function targetOf(s) {
    var raw = clamp01((window.scrollY - s.start) / s.range);
    return s.tall ? clamp01(raw / 0.9) : raw;      // màn ghim: vẽ xong ở 90%, 90–100% giữ nguyên để đọc
  }
  function frame(t) {
    raf = 0;
    var dt = Math.min(64, lastT ? t - lastT : 16.7); lastT = t;
    var k = 1 - Math.pow(1 - SMOOTH, dt / 16.67), busy = false;
    scrubs.forEach(function (s) {
      if (!s.active) return;
      var tg = targetOf(s), d = tg - s.cur;
      if (Math.abs(d) < 0.001) { if (s.cur !== tg) { s.cur = tg; s.apply(tg); } return; }
      s.cur += d * k; s.apply(s.cur); busy = true;
    });
    if (busy) raf = requestAnimationFrame(frame); else lastT = 0;
  }
  function kick() { if (scrubs.length && !raf) raf = requestAnimationFrame(frame); }
  function paintBar() { queued = false; bar.style.transform = 'scaleX(' + Math.min(1, window.scrollY / maxScroll) + ')'; }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(paintBar); } kick(); }
  // đọc bố cục đúng 1 lần lúc tải và khi đổi kích thước, không đọc trong khung hình cuộn
  function measure() {
    var y = window.scrollY, vh = window.innerHeight;
    maxScroll = Math.max(1, root.scrollHeight - vh);
    scrubs.forEach(function (s) {
      var r = s.el.getBoundingClientRect(), top = r.top + y;
      if (s.tall) { s.start = top; s.range = Math.max(1, r.height - vh); }
      else { s.start = top - 0.7 * vh; s.range = Math.max(1, r.height + 0.4 * vh); }
      if (s.onResize) s.onResize();
      s.cur = targetOf(s); s.apply(s.cur);
    });
    onScroll();
  }
  function scrub(el, tall, apply) {
    var s = { el: el, tall: tall, apply: apply, cur: 0, active: false, start: 0, range: 1, will: [], onActive: null, onResize: null };
    scrubs.push(s);
    new IntersectionObserver(function (es) {
      var on = es[es.length - 1].isIntersecting;
      if (on === s.active) return;
      s.active = on; wc(s.will, on);
      s.cur = targetOf(s); s.apply(s.cur);         // vào/ra khung nhìn: đặt đúng trạng thái đầu hoặc cuối
      if (s.onActive) s.onActive(on);
      kick();
    }).observe(el);
    return s;
  }
  var rto = 0;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { clearTimeout(rto); rto = setTimeout(measure, 120); }, { passive: true });

  /* ---------- hero: tiêu đề + mạng mesh ---------- */
  var title = $('#title');
  if (live) {
    title.innerHTML = title.textContent.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    anime({ targets: '#title .w', opacity: [0, 1], translateY: [28, 0], duration: 800, easing: 'easeOutCubic', delay: anime.stagger(80, { start: 250 }) });
  }
  (function hero() {
    var svg = $('#meshbg');
    var P = [[90, 120], [250, 300], [180, 520], [420, 160], [520, 400], [380, 600], [700, 250], [820, 470], [640, 620], [950, 160], [1050, 340], [1120, 560]];
    var gl = mk('g', {}, svg);
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 290) {
        mk('line', { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: 'var(--accent2)', 'stroke-opacity': '.28', 'stroke-width': '1.4', pathLength: '1' }, gl);
      }
    }
    var gn = mk('g', {}, svg);
    P.forEach(function (p) { mk('circle', { cx: p[0], cy: p[1], r: 6, fill: 'var(--accent)', 'fill-opacity': '.85' }, gn); });
    var pkt = mk('circle', { r: 7, cx: 0, cy: 0, class: 'pkt' }, svg);
    if (!live) { pkt.setAttribute('opacity', '0'); return; }
    var chain = [0, 3, 6, 9, 10, 11];
    var s = watch($('#s0'));
    anime({ targets: gl.children, strokeDasharray: ['0 1', '1 0'], duration: 1400, delay: anime.stagger(40), easing: 'easeOutQuad' });
    anime({ targets: gn.children, scale: [0, 1], duration: 700, delay: anime.stagger(70), easing: 'easeOutBack' });
    anime.set(pkt, { translateX: P[chain[0]][0], translateY: P[chain[0]][1] });
    var tl = anime.timeline({ loop: true, direction: 'alternate', easing: 'easeInOutSine', autoplay: false });
    chain.slice(1).forEach(function (n) { tl.add({ targets: pkt, translateX: P[n][0], translateY: P[n][1], duration: 800, endDelay: 120 }); });
    var pulse = anime({ targets: gn.children, scale: [1, 1.5, 1], duration: 2200, delay: anime.stagger(240), loop: true, easing: 'easeInOutSine', autoplay: false });
    s.loops.push(tl, pulse);
  })();

  /* ---------- reveal (opacity + translateY, không filter) ---------- */
  function tickCount(c) {
    var to = parseFloat(c.dataset.to), from = c.dataset.from !== undefined ? parseFloat(c.dataset.from) : 0, dec = +c.dataset.dec || 0;
    var o = { v: from };
    anime({ targets: o, v: to, duration: 1500, easing: 'easeOutExpo', update: function () { c.textContent = vi(o.v, dec); } });
  }
  function show(t) {
    var kids = t.hasAttribute('data-stagger') ? $$(':scope > *', t) : [t];
    wc(kids, true);
    anime({ targets: kids, opacity: [0, 1], translateY: [24, 0], duration: 800, easing: 'easeOutCubic', delay: anime.stagger(90),
      complete: function () { wc(kids, false); } });
    $$('.count', t).forEach(tickCount);
    $$('.task', t).forEach(function (k, i) {
      anime({ targets: $('.pbar i', k), width: k.dataset.p + '%', duration: 1100, delay: 350 + i * 100, easing: 'easeOutCubic' });
    });
  }
  var revealEls = $$('[data-reveal]');
  if (!live) {
    $$('.count').forEach(function (c) { c.textContent = vi(parseFloat(c.dataset.to), +c.dataset.dec || 0); });
    $$('.task').forEach(function (k) { $('.pbar i', k).style.width = k.dataset.p + '%'; });
  } else {
    revealEls.forEach(function (t) {
      if (t.hasAttribute('data-stagger')) { t.style.opacity = 1; $$(':scope > *', t).forEach(function (k) { k.style.opacity = 0; }); }
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } });
    }, { threshold: 0.18 });
    revealEls.forEach(function (t) { io.observe(t); });
  }

  /* ---------- màn 02: kiến trúc (scrub theo cuộn, ghim màn) ---------- */
  (function arch() {
    if (!live) return;
    var pk = $$('#arch-pk circle'), txt = $$('#arch-lbl text'), nodes = $$('#arch .nd');
    var N = function (i) { return $$('#arch .nd[data-n="' + i + '"]'); };
    var tl = anime.timeline({ easing: 'easeOutCubic', autoplay: false });
    var node = function (els, at) { tl.add({ targets: els, opacity: [0, 1], translateY: [14, 0], duration: 320, delay: anime.stagger(110) }, at); };
    var edge = function (ids, at, d) { tl.add({ targets: ids, strokeDashoffset: [1, 0], duration: d || 280, easing: 'easeInOutSine' }, at); };
    var lbl = function (a, at) { tl.add({ targets: txt.slice(a, a + 2), opacity: [0, 1], duration: 220 }, at); };
    node(N(0), 0);
    edge(['#e1a', '#e1b', '#e1c'], 300, 400); lbl(0, 520);
    node(N(1), 560);
    edge(['#e2'], 850); lbl(2, 950);
    node(N(2), 1000);
    edge(['#e3'], 1150); lbl(4, 1250);
    node(N(3), 1300);
    edge(['#e4'], 1450); lbl(6, 1550);
    node(N(4), 1600);

    var loops = [], pkOn = false;
    function syncPk() {
      var run = pkOn && s.active && !document.hidden;
      loops.forEach(function (a) { if (run) a.play(); else a.pause(); });
    }
    function setPk(on) {
      if (on === pkOn) return;
      pkOn = on;
      pk.forEach(function (c) { c.style.opacity = on ? 1 : 0; });
      if (on && !loops.length) {
        ['#e1b', '#e2', '#e3', '#e4'].forEach(function (id, i) {
          var path = anime.path(id);
          loops.push(anime({ targets: pk[i], translateX: path('x'), translateY: path('y'), duration: 1400, delay: i * 350, loop: true, easing: 'linear', autoplay: false }));
        });
      }
      syncPk();
    }
    var s = scrub($('#s5'), true, function (p) { tl.seek(tl.duration * p); setPk(p >= 0.97); });
    s.will = nodes.concat(txt);
    s.onActive = syncPk;
    document.addEventListener('visibilitychange', syncPk);
  })();

  /* ---------- màn 04: truyền ảnh (scrub theo cuộn, ghim màn) ---------- */
  (function chunks() {
    if (!live) return;
    var layer = $('#chunks'), tiles = $$('.t', layer), cin = $$('#s7 .cin'), fields = $$('#uframe span');
    var tl;
    function build() {
      var step = layer.clientWidth / 3;
      tl = anime.timeline({ easing: 'easeOutCubic', autoplay: false });
      tl.add({ targets: cin, opacity: [0, 1], translateY: [14, 0], duration: 400, delay: anime.stagger(90) }, 0);
      tl.add({ targets: tiles, opacity: [0, 1], duration: 300, delay: anime.stagger(50) }, 250);
      tiles.forEach(function (t, i) {
        var mid = step + (i - 2) * 16;
        tl.add({ targets: t, translateX: [0, mid], duration: 650, easing: 'easeInOutQuad' }, 800 + i * 90);
        tl.add({ targets: t, translateX: [mid, 2 * step], duration: 600, easing: 'easeInOutQuad' }, 1700 + i * 80);
      });
      tl.add({ targets: fields, opacity: [0, 1], translateY: [10, 0], duration: 350, delay: anime.stagger(100) }, 2500);
    }
    build();
    var s = scrub($('#s7'), true, function (p) { tl.seek(tl.duration * p); });
    s.will = tiles.concat(cin, fields);
    s.onResize = function () { build(); };
  })();

  /* ---------- màn 05: đường timeline (scrub theo cuộn) ---------- */
  (function timeline() {
    var fill = $('#tl .fill');
    if (!live) { fill.style.transform = 'none'; return; }
    var a = anime({ targets: fill, scaleY: [0, 1], duration: 1000, easing: 'linear', autoplay: false });
    var s = scrub($('#tl'), false, function (p) { a.seek(1000 * p); });
    s.will = [fill];
  })();

  /* ---------- biểu đồ ---------- */
  (function latency() {
    var g = $('#lat-bars'), cls = ['', 'b2', 'b3'];
    var D = [[148.3, 202.1, 485], [350.4, 473.2, 481], [575.5, 685.5, 384]];
    var bars = [], labs = [];
    D.forEach(function (d, i) {
      var h = d[0] * 0.4, x = 120 + i * 210;
      var r = mk('rect', { class: 'bar ' + cls[i], x: x, y: 320 - h, width: 140, height: h, rx: 6 }, g);
      var v = mk('text', { x: x + 70, y: 320 - h - 12, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700 }, g); v.textContent = Math.round(d[0]) + ' ms';
      var m = mk('text', { x: x + 70, y: 308, 'text-anchor': 'middle', 'font-size': 12, class: 'm', fill: 'var(--bg)' }, g); m.textContent = 'TB ' + Math.round(d[1]) + ' ms';
      var a = mk('text', { x: x + 70, y: 348, 'text-anchor': 'middle', 'font-size': 14, class: 'dim m' }, g); a.textContent = 'Hop ' + (i + 1) + ' · n = ' + d[2];
      v.style.opacity = 0; m.style.opacity = 0;
      bars.push(r); labs.push(v, m);
    });
    if (!live) { bars.forEach(function (b) { b.style.transform = 'none'; }); labs.forEach(function (l) { l.style.opacity = 1; }); return; }
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      anime({ targets: bars, scaleY: [0, 1], duration: 1100, delay: anime.stagger(220), easing: 'easeOutCubic' });
      anime({ targets: labs, opacity: [0, 1], duration: 500, delay: anime.stagger(110, { start: 900 }), easing: 'linear' });
    }, { threshold: 0.35 }).observe($('#lat'));
  })();

  (function heal() {
    var svg = $('#heal'), X = function (ms) { return 130 + ms * 0.0205; };
    var rows = [['16/09', [885, 10461, 32528]], ['29/09', [1243, 3944, 7691, 8823, 19919]], ['test19', [11220]], ['test22', [11721, 23225, 9420, 9489, 1530]]];
    for (var s = 0; s <= 35; s += 5) {
      mk('line', { x1: X(s * 1000), x2: X(s * 1000), y1: 44, y2: 296, stroke: 'var(--line)' }, svg);
      var t = mk('text', { x: X(s * 1000), y: 318, 'text-anchor': 'middle', 'font-size': 12, class: 'dim m' }, svg); t.textContent = s + ' s';
    }
    [[5000, '5 s', 'node con'], [10000, '10 s', 'root']].forEach(function (r) {
      mk('line', { class: 'refl', x1: X(r[0]), x2: X(r[0]), y1: 44, y2: 296, 'stroke-width': 2 }, svg);
      var a = mk('text', { x: X(r[0]), y: 18, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: 'var(--warn)' }, svg); a.textContent = r[1];
      var b = mk('text', { x: X(r[0]), y: 34, 'text-anchor': 'middle', 'font-size': 11, class: 'dim m' }, svg); b.textContent = r[2];
    });
    var pts = [], labs = [];
    rows.forEach(function (row, ri) {
      var y = 80 + ri * 62;
      mk('line', { x1: 130, x2: 850, y1: y, y2: y, stroke: 'var(--line)', 'stroke-width': 1.5 }, svg);
      var lb = mk('text', { x: 10, y: y + 5, 'font-size': 15, 'font-weight': 700 }, svg); lb.textContent = row[0];
      row[1].forEach(function (ms, i) {
        var c = mk('circle', { class: 'hd', cx: X(ms), cy: y, r: 9 }, svg);
        c.style.fill = ms > 10000 ? 'var(--bad)' : 'var(--accent)';
        var tt = mk('title', {}, c); tt.textContent = ms + ' ms';
        var v = mk('text', { x: X(ms), y: y + (i % 2 ? 28 : -15), 'text-anchor': 'middle', 'font-size': 12, class: 'dim m' }, svg); v.textContent = vi(ms / 1000, 1);
        v.style.opacity = 0; pts.push(c); labs.push(v);
      });
    });
    if (!live) { pts.forEach(function (c) { c.style.opacity = 1; }); labs.forEach(function (l) { l.style.opacity = 1; }); return; }
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      anime({ targets: pts, opacity: [0, 1], scale: [0, 1], duration: 600, delay: anime.stagger(90), easing: 'easeOutBack' });
      anime({ targets: labs, opacity: [0, 1], duration: 500, delay: anime.stagger(90, { start: 400 }), easing: 'linear' });
    }, { threshold: 0.35 }).observe(svg);
  })();


  /* ---------- FPS theo số Leaf (nút thắt 2) ---------- */
  (function fps() {
    var svg = $('#fps'); if (!svg) return;
    var S = [[3.5, 7, 10], [1.67, 3.3, 4.85]], base = 300, k = 24, bars = [], labs = [];
    for (var g = 0; g <= 10; g += 5) {
      mk('line', { x1: 70, x2: 740, y1: base - g * k, y2: base - g * k, stroke: 'var(--line)' }, svg);
      var t = mk('text', { x: 60, y: base - g * k + 4, 'text-anchor': 'end', 'font-size': 12, class: 'dim m' }, svg); t.textContent = g;
    }
    [0, 1, 2].forEach(function (i) {
      var x0 = 130 + i * 210;
      [0, 1].forEach(function (s) {
        var v = S[s][i], h = v * k, x = x0 + s * 80, bad = (s === 0 && i === 2);
        var r = mk('rect', { class: 'bar ' + (s ? 'b2' : ''), x: x, y: base - h, width: 70, height: h, rx: 6 }, svg);
        if (bad) r.style.fill = 'var(--bad)';
        var l = mk('text', { class: 'v', x: x + 35, y: base - h - 8, 'text-anchor': 'middle' }, svg);
        l.textContent = vi(v, v % 1 ? (v < 2 || v === 4.85 ? 2 : 1) : 0) + (bad ? ' (ngừng)' : '');
        if (bad) l.style.fill = 'var(--bad)';
        l.style.opacity = 0; bars.push(r); labs.push(l);
      });
      var a = mk('text', { x: x0 + 75, y: base + 24, 'text-anchor': 'middle', 'font-size': 15, class: 'dim m' }, svg); a.textContent = (i + 1) + ' Leaf';
    });
    mk('rect', { x: 200, y: 338, width: 12, height: 12, rx: 3, fill: 'var(--accent2)' }, svg);
    var l1 = mk('text', { x: 220, y: 349, 'font-size': 13, class: 'dim' }, svg); l1.textContent = 'Chu kỳ 300 ms';
    mk('rect', { x: 400, y: 338, width: 12, height: 12, rx: 3, fill: 'var(--accent)' }, svg);
    var l2 = mk('text', { x: 420, y: 349, 'font-size': 13, class: 'dim' }, svg); l2.textContent = 'Chu kỳ 600 ms (ổn định)';
    if (!live) { bars.forEach(function (b) { b.style.transform = 'none'; }); labs.forEach(function (l) { l.style.opacity = 1; }); return; }
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      anime({ targets: bars, scaleY: [0, 1], duration: 1000, delay: anime.stagger(120), easing: 'easeOutCubic' });
      anime({ targets: labs, opacity: [0, 1], duration: 400, delay: anime.stagger(120, { start: 800 }), easing: 'linear' });
    }, { threshold: 0.35 }).observe(svg);
  })();

  /* ---------- hình động trang Đặt vấn đề ---------- */
  (function demo() {
    if (!live) { var p = $('#mpk'); if (p) p.setAttribute('opacity', '0'); return; }
    var s = watch($('#s1'));
    var pts = [[30, 75], [100, 40], [170, 85], [240, 45]];
    anime.set('#mpk', { translateX: 0, translateY: 0 });
    var tl = anime.timeline({ loop: true, easing: 'easeInOutSine', autoplay: false });
    pts.slice(1).forEach(function (p, i) {
      tl.add({ targets: '#mpk', translateX: p[0] - pts[0][0], translateY: p[1] - pts[0][1], duration: 700, endDelay: 100 });
    });
    tl.add({ targets: '#mpk', opacity: [1, 0], duration: 200 }).add({ targets: '#mpk', translateX: 0, translateY: 0, duration: 1 }).add({ targets: '#mpk', opacity: [0, 1], duration: 200 });
    var cut = anime({ targets: '#star .sl', opacity: [1, 0.15, 1], duration: 2600, loop: true, easing: 'easeInOutQuad', autoplay: false });
    var rp = anime({ targets: '#starc', fill: ['#3dd6c6', '#ff6b7a', '#3dd6c6'], duration: 2600, loop: true, easing: 'linear', autoplay: false });
    s.loops.push(tl, cut, rp);
  })();

  /* ---------- khởi động: đo bố cục 1 lần, đặt trạng thái theo vị trí cuộn hiện tại ---------- */
  measure();
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
