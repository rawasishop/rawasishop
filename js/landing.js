/* شريط المخزون + سلايدر المنتج */
(function () {
  'use strict';

  var stockEl = document.getElementById('stockLeft');
  var stockBar = document.getElementById('stockBar');
  var maxStock = 20;

  function updateStockBar() {
    if (!stockEl || !stockBar) return;
    var left = parseInt(stockEl.textContent, 10) || 7;
    var pct = Math.max(8, Math.min(100, (left / maxStock) * 100));
    stockBar.style.width = pct + '%';
  }

  updateStockBar();
  if (stockEl) {
    var obs = new MutationObserver(updateStockBar);
    obs.observe(stockEl, { childList: true, characterData: true, subtree: true });
  }

  /* ── سلايدر — تحميل الصور عند الحاجة ── */
  var track = document.getElementById('productSliderTrack');
  var slides = track ? track.querySelectorAll('.product-slide') : [];
  var dots = document.querySelectorAll('#productDots button');
  var prev = document.getElementById('productPrev');
  var next = document.getElementById('productNext');
  var slideIdx = 0;
  var totalSlides = slides.length;
  var autoTimer = null;

  function loadSlideMedia(slide) {
    if (!slide || slide.dataset.loaded) return;
    var img = slide.querySelector('img');
    if (img && img.dataset.src && !img.getAttribute('src')) {
      img.src = img.dataset.src;
    }
    var source = slide.querySelector('source');
    if (source && source.dataset.srcset && !source.srcset) {
      source.srcset = source.dataset.srcset;
    }
    slide.dataset.loaded = '1';
  }

  function preloadAdjacent(i) {
    loadSlideMedia(slides[i]);
    if (slides[i + 1]) loadSlideMedia(slides[i + 1]);
    if (slides[i - 1]) loadSlideMedia(slides[i - 1]);
  }

  function goToSlide(i) {
    if (!totalSlides) return;
    slideIdx = ((i % totalSlides) + totalSlides) % totalSlides;
    preloadAdjacent(slideIdx);
    slides.forEach(function (s, n) {
      s.classList.toggle('active', n === slideIdx);
    });
    dots.forEach(function (d, n) {
      d.classList.toggle('active', n === slideIdx);
    });
  }

  function startAuto() {
    stopAuto();
    if (totalSlides < 2) return;
    autoTimer = setInterval(function () { goToSlide(slideIdx + 1); }, 5000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (totalSlides > 0) {
    loadSlideMedia(slides[0]);
    goToSlide(0);
    if (totalSlides > 1) {
      dots.forEach(function (dot, n) {
        dot.addEventListener('click', function () { goToSlide(n); startAuto(); });
      });
      if (prev) prev.addEventListener('click', function () { goToSlide(slideIdx - 1); startAuto(); });
      if (next) next.addEventListener('click', function () { goToSlide(slideIdx + 1); startAuto(); });
      if (track) {
        track.addEventListener('mouseenter', stopAuto);
        track.addEventListener('mouseleave', startAuto);
      }
      if ('IntersectionObserver' in window) {
        var slideObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) startAuto();
            else stopAuto();
          });
        }, { threshold: 0.2 });
        slideObs.observe(track);
      } else {
        startAuto();
      }
    }
  }
})();
