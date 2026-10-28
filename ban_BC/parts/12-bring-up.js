/* Slide 12: tuyến tàu điện sáu ga. Mỗi bước mở một ga (sự cố -> nguyên nhân -> xử lý); bước 7: tàu về ga cuối, ba số lớn đếm lên. */
var sl = document.getElementById('s12'), I = window.Iso;
var stns = Array.prototype.slice.call(sl.querySelectorAll('.stn')), train = sl.querySelector('.train'), done = sl.querySelector('.rail.done'), line = sl.querySelector('.mline');
var cnts = Array.prototype.slice.call(sl.querySelectorAll('.cnt')), finals = cnts.map(function (c) { return c.textContent; });
var cur = 0, reach = 0, lastN = 0;
function allOn() { return document.documentElement.classList.contains('static'); }
function cx(i) { return stns[i].querySelector('.dot').offsetLeft + 16; }
function apply(s) {
  var n = allOn() ? 7 : s;
  cur = s;
  stns.forEach(function (el, i) { el.classList.toggle('open', i < n); });
  var x, w;
  if (n === 0) { x = -140; w = 0; }
  else if (n <= 6) { x = cx(n - 1) - 32; w = cx(n - 1) - 16; }
  else { x = line.clientWidth - 72; w = line.clientWidth - 16; }
  train.style.transform = 'translateX(' + x + 'px)';
  done.style.width = w + 'px';
  if (n >= 7 && lastN < 7) reach = performance.now();
  lastN = n;
  if (n < 7) cnts.forEach(function (c, i) { c.textContent = finals[i]; });
}
Deck.steps.s12 = apply;
Deck.shows.s12 = function () { lastN = 0; };
Deck.frames.s12 = function () {
  var n = allOn() ? 7 : cur;
  if (n < 7) return;
  var p = (Deck.still || allOn()) ? 1 : I.clamp((performance.now() - reach - 500) / 1500);
  var e = 1 - Math.pow(1 - p, 3);
  cnts.forEach(function (c, i) {
    if (p >= 1) { c.textContent = finals[i]; return; }
    var to = +c.getAttribute('data-to'), d = +c.getAttribute('data-d');
    c.textContent = d ? (to * e).toFixed(d).replace('.', ',') : String(Math.round(to * e));
  });
};
