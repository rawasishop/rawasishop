(function () {
  'use strict';

  document.querySelectorAll('.baby-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var open = item.classList.contains('open');
      document.querySelectorAll('.baby-faq-item').forEach(function (el) { el.classList.remove('open'); });
      if (!open) item.classList.add('open');
    });
  });

  var slides = document.querySelectorAll('.baby-slide');
  var dots = document.querySelectorAll('.baby-dot');
  var idx = 0;
  var timer;

  function show(i) {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('active', n === idx); });
    dots.forEach(function (d, n) { d.classList.toggle('active', n === idx); });
  }

  dots.forEach(function (dot, n) {
    dot.addEventListener('click', function () {
      show(n);
      resetTimer();
    });
  });

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function () { show(idx + 1); }, 4500);
  }

  if (slides.length > 1) {
    show(0);
    resetTimer();
  }
})();
