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



  var cityList = document.getElementById('cityList');

  var cities = window.RAWASI_SA_CITIES || [];

  if (cityList && cities.length) {

    cities.forEach(function (name) {

      var opt = document.createElement('option');

      opt.value = name;

      cityList.appendChild(opt);

    });

  }



  var cityInput = document.getElementById('city');

  if (cityInput) {

    cityInput.addEventListener('input', function () {

      this.value = this.value.replace(/[A-Za-z]/g, '');

    });

  }



  /* ── سلايدر صور الجهاز (عرض شريحة واحدة) ── */

  var track = document.getElementById('productSliderTrack');

  var slides = track ? track.querySelectorAll('.product-slide') : [];

  var dots = document.querySelectorAll('#productDots button');

  var prev = document.getElementById('productPrev');

  var next = document.getElementById('productNext');

  var slideIdx = 0;

  var totalSlides = slides.length;

  var autoTimer = null;



  function goToSlide(i) {

    if (!totalSlides) return;

    slideIdx = ((i % totalSlides) + totalSlides) % totalSlides;

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

    autoTimer = setInterval(function () { goToSlide(slideIdx + 1); }, 4500);

  }



  function stopAuto() {

    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }

  }



  if (totalSlides > 0) {

    slides.forEach(function (slide) {

      var img = slide.querySelector('img');

      if (!img) return;

      img.addEventListener('error', function () {

        this.style.outline = '2px solid #ff6b6b';

        this.alt = 'تعذّر تحميل الصورة: ' + this.getAttribute('src');

      });

    });

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

      startAuto();

    }

  }

})();


