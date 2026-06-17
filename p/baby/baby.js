(function () {
  'use strict';

  var imgs = [
    'assets/product-image-0.jpg',
    'assets/product-image-1.jpg',
    'assets/product-image-6.jpg',
    'assets/product-image-7.jpg'
  ];
  var mainImg = document.getElementById('nlMainImg');
  var thumbs = document.querySelectorAll('.nl-thumb');

  thumbs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.getAttribute('data-i'), 10) || 0;
      if (mainImg && imgs[i]) mainImg.src = imgs[i];
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.nl-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var was = item.classList.contains('open');
      document.querySelectorAll('.nl-faq-item').forEach(function (el) { el.classList.remove('open'); });
      if (!was) item.classList.add('open');
    });
  });

  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 16);
    }, { passive: true });
  }

  var reveals = document.querySelectorAll('.nl-reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }
})();
