/* Slide 16: chỉ làm sáng từng "ga" theo bước (Đạt được, Hạn chế, Hướng phát triển); nội dung là chữ tĩnh. */
var sl = document.getElementById('s16'), dots = sl.querySelectorAll('.cl');
Deck.steps.s16 = function (s) {
  var all = document.documentElement.classList.contains('static');
  Array.prototype.forEach.call(dots, function (c, i) { c.style.setProperty('--on', (all || s >= i) ? 1 : .35); c.querySelector('.dot').style.opacity = (all || s >= i) ? 1 : .35; });
};
