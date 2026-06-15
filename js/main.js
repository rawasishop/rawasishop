/* =========================================================
   RawasiShop — تفاعلية صفحة الهبوط
   ========================================================= */
(function () {
  'use strict';

  var TAAGER = window.RAWASI_TAAGER || {};
  var STORE_WHATSAPP = TAAGER.sellerWhatsapp || '212633405061';
  var SHEET_WEBHOOK_URL = TAAGER.sheetWebhook || '';

  function sendToSheet(order) {
    return deliverOrder(order);
  }

  var TRACKING = { fbPixelId: TAAGER.fbPixelId || '', gaId: '' };

  function initTracking() {
    if (TRACKING.fbPixelId) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', TRACKING.fbPixelId); fbq('track', 'PageView');
    }
    if (TRACKING.gaId) {
      var g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + TRACKING.gaId;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', TRACKING.gaId);
    }
  }
  function trackEvent(fbName, gaName, value) {
    try { if (window.fbq) fbq('track', fbName, { value: value, currency: 'SAR' }); } catch (e) {}
    try { if (window.gtag) gtag('event', gaName, { value: value, currency: 'SAR' }); } catch (e) {}
  }

  function deferHeavy(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 4000 });
    else window.addEventListener('load', function () { setTimeout(fn, 1500); }, { once: true });
  }

  deferHeavy(function () {
    initTracking();
    if (window.RAWASI_SNAP) {
      RAWASI_SNAP.trackViewContent((TAAGER.bundles && TAAGER.bundles[1] && TAAGER.bundles[1].price) || 299);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js?v=3').then(function (reg) {
        reg.update();
      }).catch(function () {});
    }
  });

  /* ---- سنة الفوتر ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- ظل الهيدر + عناصر التمرير (مجمّعة عبر rAF) ---- */
  var header = document.getElementById('siteHeader');
  var stickyCta = document.getElementById('stickyCta');
  var orderPanel = document.getElementById('orderFormPanel') || document.getElementById('order');
  var orderFloat = document.querySelector('.order-float');
  var orderSec = document.getElementById('order');
  var waFloat = document.querySelector('.whatsapp-float');
  var scrollPending = false;

  function onScrollFrame() {
    scrollPending = false;
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    if (stickyCta) {
      var pastSticky = window.scrollY > 480;
      var atForm = false;
      if (orderPanel) {
        var rp = orderPanel.getBoundingClientRect();
        atForm = rp.top < window.innerHeight * 0.75 && rp.bottom > 0;
      }
      stickyCta.classList.toggle('show', pastSticky && !atForm);
    }
    if (orderFloat) {
      var pastFloat = window.scrollY > 480;
      var atOrder = false;
      if (orderSec) {
        var ro = orderSec.getBoundingClientRect();
        atOrder = ro.top < window.innerHeight * 0.8 && ro.bottom > 0;
      }
      orderFloat.classList.toggle('show', pastFloat && !atOrder);
    }
    if (waFloat) {
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      waFloat.classList.toggle('show', window.scrollY >= maxScroll * 0.5);
    }
  }

  window.addEventListener('scroll', function () {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  window.addEventListener('resize', onScrollFrame, { passive: true });
  onScrollFrame();

  /* ---- قائمة الجوال ---- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  /* ---- تأثير الظهور عند التمرير ---- */
  var reveals = document.querySelectorAll('.reveal');

  function markVisible(el) {
    el.classList.add('visible');
  }

  function inViewport(el) {
    var rect = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < h * 0.92 && rect.bottom > h * 0.08;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 8% 0px' });
    reveals.forEach(function (el) {
      if (el.closest('.hero, .hero-luxury')) {
        markVisible(el);
        return;
      }
      if (inViewport(el)) markVisible(el);
      io.observe(el);
    });
  } else {
    reveals.forEach(markVisible);
  }

  window.addEventListener('load', function () {
    reveals.forEach(function (el) {
      if (inViewport(el)) markVisible(el);
    });
  }, { once: true });

  /* ---- العداد التنازلي (يتجدد كل يوم لإبقاء العرض "حياً") ---- */
  var cdD = document.getElementById('cdD');
  var cdH = document.getElementById('cdH');
  var cdM = document.getElementById('cdM');
  var cdS = document.getElementById('cdS');

  function getDeadline() {
    var saved = localStorage.getItem('rawasi_deadline');
    var now = Date.now();
    if (saved && parseInt(saved, 10) > now) return parseInt(saved, 10);
    var next = now + 31 * 60 * 60 * 1000;
    localStorage.setItem('rawasi_deadline', String(next));
    return next;
  }

  var deadline = getDeadline();
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var diff = deadline - Date.now();
    if (diff <= 0) { deadline = getDeadline(); diff = deadline - Date.now(); }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (cdD) cdD.textContent = pad(d);
    if (cdH) cdH.textContent = pad(h);
    if (cdM) cdM.textContent = pad(m);
    if (cdS) cdS.textContent = pad(s);
  }
  if (cdH || cdD) { tick(); setInterval(tick, 1000); }

  /* ---- تحديث السعر حسب الباقة المختارة ---- */
  var totalPrice = document.getElementById('totalPrice');
  var heroPriceNew = document.getElementById('heroPriceNew');
  var heroPriceOld = document.getElementById('heroPriceOld');
  var heroPriceTag = document.getElementById('heroPriceTag');
  var stickyPriceNew = document.getElementById('stickyPriceNew');
  var stickyPriceOld = document.getElementById('stickyPriceOld');

  function arNum(n) {
    return n.toLocaleString('en-US');
  }

  function getSelectedBundle() {
    return document.querySelector('input[name="qty"]:checked');
  }

  function getBundlePrices(sel) {
    var price = parseInt(sel.getAttribute('data-price'), 10) || 299;
    var compare = parseInt(sel.getAttribute('data-compare'), 10);
    if (!compare) {
      var units = parseInt(sel.value, 10) || 1;
      compare = (TAAGER.compareAt || 499) * units;
    }
    return { price: price, compare: compare };
  }

  function syncQtyRadios(value) {
    var val = String(value);
    document.querySelectorAll('input[name="qty"]').forEach(function (r) {
      r.checked = r.value === val;
    });
  }

  function updateTotal() {
    var sel = getSelectedBundle();
    if (!sel) return;
    var p = getBundlePrices(sel);
    var priceText = arNum(p.price) + ' ريال';
    var compareText = arNum(p.compare) + ' ريال';
    var discount = Math.max(0, Math.round((1 - p.price / p.compare) * 100));

    if (totalPrice) totalPrice.textContent = priceText;
    if (heroPriceNew) heroPriceNew.innerHTML = arNum(p.price) + ' <small>ريال</small>';
    if (heroPriceOld) heroPriceOld.textContent = compareText;
    if (heroPriceTag) heroPriceTag.textContent = '-' + discount + '%';
    if (stickyPriceNew) stickyPriceNew.textContent = priceText;
    if (stickyPriceOld) stickyPriceOld.textContent = compareText;
  }

  function onQtyChange(source) {
    if (source && source.name === 'qty') syncQtyRadios(source.value);
    updateTotal();
    trackTikTokAddToCart();
  }

  var tiktokCheckoutStarted = false;

  function trackTikTokAddToCart() {
    try {
      if (!window.RAWASI_TIKTOK) return;
      var sel = getSelectedBundle();
      var b = RAWASI_TIKTOK.fromBundle(sel);
      RAWASI_TIKTOK.trackAddToCart(b.value, b.quantity);
    } catch (e) { /* ignore */ }
  }

  function trackTikTokInitiateCheckout() {
    if (tiktokCheckoutStarted) return;
    tiktokCheckoutStarted = true;
    try {
      if (!window.RAWASI_TIKTOK) return;
      var sel = getSelectedBundle();
      var b = RAWASI_TIKTOK.fromBundle(sel);
      RAWASI_TIKTOK.trackInitiateCheckout(b.value, b.quantity);
    } catch (e) { /* ignore */ }
  }

  function trackTikTokPurchase(value, quantity, eventId) {
    try {
      if (!window.RAWASI_TIKTOK) return;
      RAWASI_TIKTOK.trackSubmitForm(value, quantity, eventId);
      RAWASI_TIKTOK.trackCompletePayment(value, quantity, eventId);
    } catch (e) { /* ignore */ }
  }

  function deliverOrder(order) {
    if (TAAGER.notifyAfterOrder) {
      TAAGER.notifyAfterOrder(order);
      return true;
    }
    if (TAAGER.sendOrder) return !!TAAGER.sendOrder(order);
    if (!SHEET_WEBHOOK_URL) return false;
    var payload = JSON.stringify(order);
    try {
      if (navigator.sendBeacon) {
        return navigator.sendBeacon(SHEET_WEBHOOK_URL, new Blob([payload], { type: 'application/json' }));
      }
    } catch (e) {}
    try {
      fetch(SHEET_WEBHOOK_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'qty') onQtyChange(e.target);
  });

  document.addEventListener('click', function (e) {
    var lbl = e.target.closest('label.pkg-card, label.bundle-compact');
    if (!lbl) return;
    var input = lbl.querySelector('input[name="qty"]');
    if (input) setTimeout(function () { onQtyChange(input); }, 0);
  });

  var orderFormEl = document.getElementById('orderForm');
  if (orderFormEl) {
    orderFormEl.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'qty') onQtyChange(e.target);
    });
  }

  syncQtyRadios('1');
  updateTotal();

  /* ---- التحقق من نموذج الطلب ---- */
  var form = orderFormEl;
  var modal = document.getElementById('successModal');
  var modalClose = document.getElementById('modalClose');
  var successName = document.getElementById('successName');

  function setError(name, msg) {
    var input = form.querySelector('[name="' + name + '"]');
    var err = form.querySelector('.err[data-for="' + name + '"]');
    if (input) input.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg || '';
  }

  function validate() {
    var ok = true;
    var name = form.fullname.value.trim();
    var phone = form.phone.value.trim();
    var city = form.city.value.trim();
    var address = form.address ? form.address.value.trim() : '';

    if (name.length < 3) { setError('fullname', 'يرجى إدخال الاسم الكامل'); ok = false; }
    else setError('fullname', '');

    if (!TAAGER.isValidSaPhone || !TAAGER.isValidSaPhone(phone)) {
      setError('phone', 'رقم سعودي صحيح: 05XXXXXXXX');
      ok = false;
    } else setError('phone', '');

    if (!city) { setError('city', 'يرجى اختيار المحافظة'); ok = false; }
    else setError('city', '');

    if (address.length < 5) { setError('address', 'يرجى إدخال العنوان بالتفصيل'); ok = false; }
    else setError('address', '');

    return ok;
  }

  if (form) {
    // قبول الأرقام فقط في حقل الهاتف
    form.phone.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d+ ]/g, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var selBundle = getSelectedBundle();
      var qtyVal = selBundle ? selBundle.value : '1';
      var label = selBundle ? selBundle.closest('label') : null;
      var bundleTitleEl = label ? (label.querySelector('.pkg-qty') || label.querySelector('.offer-qty') || label.querySelector('span')) : null;
      var qtyLabel = bundleTitleEl ? bundleTitleEl.textContent.trim() : (qtyVal + ' قطعة');
      var priceNum = selBundle ? parseInt(selBundle.getAttribute('data-price'), 10) : 299;
      var qtyUnits = parseInt(qtyVal, 10) || 1;
      var unitPrice = Math.round(priceNum / qtyUnits);
      var phoneNorm = TAAGER.normalizeSaPhone ? TAAGER.normalizeSaPhone(form.phone.value.trim()) : form.phone.value.trim();

      var order = {
        name: form.fullname.value.trim(),
        phone: phoneNorm,
        city: form.city.value.trim(),
        address: form.address.value.trim(),
        qty: qtyLabel,
        qtyUnits: qtyUnits,
        total: totalPrice ? totalPrice.textContent : '',
        totalNum: priceNum,
        unitPrice: unitPrice,
        sellPrice: priceNum,
        coupon: '',
        product: TAAGER.productName || 'جهاز IPL',
        productSku: TAAGER.productSku || '',
        taagerId: TAAGER.productId || '',
        country: 'SA',
        platform: 'taager',
        source: 'rawasishop-landing',
        transaction_id: 'RS-' + Date.now(),
        date: new Date().toISOString()
      };
      var orderSent = sendToSheet(order);
      // حفظ الطلب محلياً (يمكن ربطه لاحقاً بخادم أو Google Sheets)
      try {
        var orders = JSON.parse(localStorage.getItem('rawasi_orders') || '[]');
        orders.push(order);
        localStorage.setItem('rawasi_orders', JSON.stringify(orders));
      } catch (err) { /* تجاهل */ }

      console.log('طلب جديد:', order);

      trackTikTokPurchase(priceNum, qtyUnits, order.transaction_id);

      if (orderSent) {
        var leadValue = priceNum;
        trackEvent('Lead', 'generate_lead', leadValue);
        trackEvent('Purchase', 'purchase', leadValue);
        try { if (window.RAWASI_SNAP) RAWASI_SNAP.trackPurchase(order); } catch (e) {}
      }

      if (successName) successName.textContent = order.name.split(' ')[0];
      if (modal) { modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); }
      form.reset();
      syncQtyRadios('1');
      updateTotal();
    });

    form.addEventListener('focusin', trackTikTokInitiateCheckout, { once: true });

    document.querySelectorAll('a[href="#fullname"]').forEach(function (link) {
      link.addEventListener('click', function () {
        trackTikTokAddToCart();
        trackTikTokInitiateCheckout();
      });
    });

    var formPanel = document.getElementById('orderFormPanel');
    if (formPanel && 'IntersectionObserver' in window) {
      var checkoutObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            trackTikTokInitiateCheckout();
            checkoutObs.disconnect();
          }
        });
      }, { threshold: 0.2 });
      checkoutObs.observe(formPanel);
    } else if (formPanel) {
      trackTikTokInitiateCheckout();
    }
  }

  /* ---- إغلاق النافذة ---- */
  function closeModal() {
    if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---- عداد المشاهدين الحي (يتذبذب لإيحاء الحركة) ---- */
  var viewersEl = document.getElementById('viewers');
  if (viewersEl) {
    var v = 23;
    setInterval(function () {
      v += Math.floor(Math.random() * 7) - 3; // ±3
      if (v < 12) v = 12;
      if (v > 47) v = 47;
      viewersEl.textContent = v;
    }, 4000);
  }

  /* ---- تناقص المخزون ببطء (إلحاح) ---- */
  var stockEl = document.getElementById('stockLeft');
  if (stockEl) {
    var stock = parseInt(localStorage.getItem('rawasi_stock') || '7', 10);
    if (isNaN(stock) || stock < 2) stock = 7;
    stockEl.textContent = stock;
    setInterval(function () {
      if (stock > 2 && Math.random() < 0.5) {
        stock--;
        stockEl.textContent = stock;
        localStorage.setItem('rawasi_stock', String(stock));
      }
    }, 35000);
  }

  /* ---- شريط الطلب الثابت + زر الطلب + واتساب: يُدار أعلاه ---- */

  /* ---- إشعارات الإثبات الاجتماعي (طلبات حديثة) ---- */
  var toast = document.getElementById('socialToast');
  if (toast) {
    var names = ['نورة', 'سارة', 'ريم', 'الجوهرة', 'لمى', 'هند', 'العنود', 'أسماء', 'دانة', 'شهد', 'منيرة', 'جواهر'];
    var cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الخبر', 'الطائف', 'أبها', 'تبوك', 'بريدة', 'الأحساء', 'ينبع'];
    var times = ['قبل دقيقة', 'قبل دقيقتين', 'قبل 4 دقائق', 'قبل 7 دقائق', 'قبل 12 دقيقة', 'الآن'];
    var stName = document.getElementById('stName');
    var stCity = document.getElementById('stCity');
    var stTime = document.getElementById('stTime');
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function showToast() {
      if (stName) stName.textContent = pick(names);
      if (stCity) stCity.textContent = pick(cities);
      if (stTime) stTime.textContent = pick(times);
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 5000);
    }
    setTimeout(function () {
      showToast();
      setInterval(showToast, 28000);
    }, 22000);
  }

})();
