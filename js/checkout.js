/* =========================================================
   RawasiShop — Standalone Checkout Logic
   COD (+30 SAR) · Apple Pay · Stripe/Tabby/Tamara placeholders
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.RAWASI_PAYMENTS || {};
  var TAAGER = window.RAWASI_TAAGER || {};
  var COD_FEE = CFG.codFee || 0;
  var BUNDLES = {
    1: { title: 'قطعة واحدة', price: 395, units: 1 },
    2: { title: 'قطعتان', price: 690, units: 2 },
    3: { title: '3 قطع', price: 950, units: 3 }
  };

  var form = document.getElementById('checkoutForm');
  var bundleSelect = document.getElementById('bundleSelect');
  var bundleHint = document.getElementById('bundleHint');
  var BUNDLE_HINTS = {
    1: 'جهاز واحد + هدية مجانية 🎁',
    2: 'وفّري 100 ريال + هدية مجانية 🎁',
    3: 'وفّري 235 ريال + هديتان 🎁🎁'
  };
  var submitBtn = document.getElementById('submitBtn');
  var modal = document.getElementById('successModal');
  var modalClose = document.getElementById('modalClose');
  var successName = document.getElementById('successName');

  /* ---- Helpers ---- */
  function arNum(n) { return n.toLocaleString('en-US'); }
  function formatSar(n) { return arNum(n) + ' ريال'; }

  function getBundleValue() {
    return bundleSelect ? bundleSelect.value : '1';
  }

  function setBundleValue(val) {
    if (bundleSelect) bundleSelect.value = val;
    updateBundleHint();
  }

  function updateBundleHint() {
    if (bundleHint) bundleHint.textContent = BUNDLE_HINTS[getBundleValue()] || '';
  }

  function getBundle() {
    return BUNDLES[getBundleValue()] || BUNDLES[1];
  }

  function getPaymentMethod() {
    var sel = document.querySelector('input[name="payment"]:checked');
    return sel ? sel.value : 'cod';
  }

  function isCod() { return getPaymentMethod() === 'cod'; }

  function calcTotals() {
    var bundle = getBundle();
    var subtotal = bundle.price;
    var codFee = isCod() ? COD_FEE : 0;
    var total = subtotal + codFee;
    return { subtotal: subtotal, codFee: codFee, total: total, bundle: bundle };
  }

  function updateTotals() {
    var t = calcTotals();
    var ids = {
      coSubtotal: formatSar(t.subtotal),
      coTotal: formatSar(t.total),
      coSubtotalM: formatSar(t.subtotal),
      coTotalM2: formatSar(t.total),
      coTotalMobile: formatSar(t.total)
    };
    Object.keys(ids).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = ids[id];
    });

    var codLines = [document.getElementById('coCodLine'), document.getElementById('coCodLineM')];
    codLines.forEach(function (el) {
      if (el) el.classList.toggle('hidden', !isCod());
    });

    updateSubmitLabel(t);
    updatePaymentPlaceholders();
    updateApplePayAmount(t.total);
  }

  function updateSubmitLabel(t) {
    if (!submitBtn) return;
    var method = getPaymentMethod();
    var labels = {
      cod: 'أكّدي الطلب — ادفعي ' + formatSar(t.total) + ' عند الاستلام',
      stripe: 'ادفعي ' + formatSar(t.total) + ' بالبطاقة',
      tabby: 'تابي — قسّمي ' + formatSar(t.subtotal) + ' على 4 دفعات',
      tamara: 'تمارا — أكّدي الطلب بـ ' + formatSar(t.subtotal)
    };
    submitBtn.textContent = labels[method] || labels.cod;
  }

  function updatePaymentPlaceholders() {
    var method = getPaymentMethod();
    var stripeEl = document.getElementById('stripeCardElement');
    var placeholders = ['stripePlaceholder', 'tabbyPlaceholder', 'tamaraPlaceholder'];

    placeholders.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('show', el.dataset.provider === method);
    });

    if (stripeEl) stripeEl.classList.toggle('show', method === 'stripe' && isStripeReady());
  }

  function isStripeReady() {
    var key = CFG.stripe && CFG.stripe.publishableKey;
    return key && key.indexOf('YOUR_') === -1;
  }

  /* ---- URL params ---- */
  function initFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var bundle = params.get('bundle') || params.get('qty');
    if (bundle && BUNDLES[bundle]) {
      setBundleValue(bundle);
    }
    var status = params.get('status');
    if (status) handleReturnStatus(status);
  }

  function handleReturnStatus(status) {
    var messages = {
      tabby_success: 'تم الدفع عبر تابي بنجاح — جاري التأكيد.',
      tabby_cancel: 'ألغيتِ عملية تابي — يمكنكِ المحاولة مجدداً.',
      tabby_failure: 'لم تُقبل عملية تابي — جرّبي طريقة دفع أخرى.',
      tamara_success: 'تم الدفع عبر تمارا بنجاح.',
      tamara_cancel: 'ألغيتِ عملية تمارا.',
      tamara_failure: 'لم تُقبل عملية تمارا.'
    };
    if (messages[status]) alert(messages[status]);
  }

  /* ---- Validation ---- */
  function setError(name, msg) {
    var input = form.querySelector('[name="' + name + '"]');
    var err = form.querySelector('.co-err[data-for="' + name + '"]');
    if (input) input.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg || '';
  }

  function validate() {
    var ok = true;
    var name = form.fullname.value.trim();
    var phone = form.phone.value.trim();
    var city = form.city.value.trim();
    var address = form.address.value.trim();

    if (name.length < 3) { setError('fullname', 'يرجى إدخال الاسم الكامل'); ok = false; }
    else setError('fullname', '');

    if (!TAAGER.isValidSaPhone || !TAAGER.isValidSaPhone(phone)) { setError('phone', 'رقم سعودي: 05XXXXXXXX'); ok = false; }
    else setError('phone', '');

    if (city.length < 2) { setError('city', 'يرجى إدخال المدينة'); ok = false; }
    else setError('city', '');

    if (address.length < 5) { setError('address', 'يرجى إدخال عنوان واضح'); ok = false; }
    else setError('address', '');

    return ok;
  }

  function getOrderPayload() {
    var t = calcTotals();
    var units = t.bundle.units || 1;
    var unitPrice = Math.round(t.subtotal / units);
    return {
      name: form.fullname.value.trim(),
      phone: TAAGER.normalizeSaPhone ? TAAGER.normalizeSaPhone(form.phone.value.trim()) : form.phone.value.trim(),
      city: form.city.value.trim(),
      zip: form.zip.value.trim(),
      address: form.address.value.trim(),
      qty: t.bundle.title,
      qtyUnits: units,
      unitPrice: unitPrice,
      sellPrice: t.subtotal,
      subtotal: t.subtotal,
      codFee: t.codFee,
      total: t.total,
      totalNum: t.total,
      payment: 'cod',
      product: TAAGER.productName || 'جهاز IPL',
      productSku: TAAGER.productSku || '',
      taagerId: TAAGER.productId || '',
      country: 'SA',
      platform: 'taager',
      source: 'rawasishop-checkout',
      transaction_id: 'RS-' + Date.now(),
      date: new Date().toISOString()
    };
  }

  /* ---- Sheet + WhatsApp (COD & fallback) ---- */
  function sendToSheet(order) {
    var url = CFG.store && CFG.store.sheetWebhook;
    if (!url) return;
    var payload = JSON.stringify(order);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
        if (navigator.sendBeacon(url, blob)) return;
      }
    } catch (e) {}
    try {
      fetch(url, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
        keepalive: true
      });
    } catch (e) {}
  }

  function openWhatsApp(order) {
    if (TAAGER.openWhatsApp) {
      TAAGER.openWhatsApp(order);
      return;
    }
    var wa = CFG.store && CFG.store.whatsapp;
    if (!wa) return;
    window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent('طلب رواسي شوب: ' + order.name), '_blank');
  }

  function trackPurchase(order) {
    var value = typeof order === 'object'
      ? (order.subtotal != null ? order.subtotal : order.totalNum)
      : order;
    try {
      if (window.fbq) fbq('track', 'Purchase', { value: value, currency: 'SAR' });
    } catch (e) {}
    try {
      if (window.RAWASI_SNAP) RAWASI_SNAP.trackPurchase(order);
    } catch (e) {}
  }

  function initTracking() {
    var pixel = CFG.store && CFG.store.fbPixelId;
    if (!pixel) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', pixel);
    fbq('track', 'PageView');
    fbq('track', 'InitiateCheckout');
  }

  /* ---- Payment provider placeholders ---- */
  function processStripe(order) {
    if (!isStripeReady()) {
      alert('Stripe غير مفعّل بعد — أضيفي المفتاح في payments-config.js');
      processCod(order);
      return;
    }
    /* TODO: Backend creates PaymentIntent, frontend confirms with Stripe.js
       const stripe = Stripe(CFG.stripe.publishableKey);
       stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } });
    */
    console.warn('[Stripe] Placeholder — implement PaymentIntent on server', order);
    alert('تكامل Stripe جاهز للربط — راجع docs/checkout-integration/stripe.md');
  }

  function processTabby(order) {
    /* TODO: POST https://api.tabby.sa/api/v2/checkout
       Headers: Authorization: Bearer {secretKey}
       Body: { payment: { amount, currency: 'SAR', buyer, order, shipping_address }, lang: 'ar', merchant_code, merchant_urls }
       Redirect to response.configuration.available_products[0].web_url
    */
    console.warn('[Tabby] Placeholder session', {
      api: CFG.tabby && CFG.tabby.apiBase,
      amount: String(order.subtotal),
      currency: 'SAR',
      buyer: { name: order.name, email: '', phone: order.phone }
    });
    alert('تكامل Tabby جاهز للربط — يتطلب backend مع secret key.\nراجع docs/checkout-integration/tabby.md');
  }

  function processTamara(order) {
    /* TODO: POST {apiBase}/checkout
       Headers: Authorization: Bearer {apiToken}
       Body: { total_amount, country_code: 'SA', order_reference_id, consumer, shipping_address, merchant_url }
       Redirect to checkout_url
    */
    console.warn('[Tamara] Placeholder session', {
      api: CFG.tamara && CFG.tamara.apiBase,
      total: order.subtotal
    });
    alert('تكامل Tamara جاهز للربط — يتطلب API token.\nراجع docs/checkout-integration/tamara.md');
  }

  function processCod(order) {
    sendToSheet(order);
    try {
      var orders = JSON.parse(localStorage.getItem('rawasi_orders') || '[]');
      orders.push(order);
      localStorage.setItem('rawasi_orders', JSON.stringify(orders));
    } catch (e) {}
    openWhatsApp(order);
    trackPurchase(order);
    showSuccess(order.name);
  }

  function showSuccess(name) {
    if (successName) successName.textContent = name.split(' ')[0];
    if (modal) { modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      var inv = form.querySelector('.invalid');
      if (inv) inv.focus();
      return;
    }

    var order = getOrderPayload();
    var method = order.payment;

    submitBtn.disabled = true;

    switch (method) {
      case 'stripe':
        processStripe(order);
        submitBtn.disabled = false;
        break;
      case 'tabby':
        processTabby(order);
        submitBtn.disabled = false;
        break;
      case 'tamara':
        processTamara(order);
        submitBtn.disabled = false;
        break;
      default:
        processCod(order);
        submitBtn.disabled = false;
        form.reset();
        setBundleValue('1');
        document.querySelector('input[name="payment"][value="cod"]').checked = true;
        updateTotals();
    }
  }

  /* ---- Apple Pay (iOS / Safari) ---- */
  var applePayMount = document.getElementById('applePayMount');
  var expressSection = document.getElementById('expressCheckout');
  var expressDivider = document.getElementById('expressDivider');
  var paymentRequest = null;

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function updateApplePayAmount(total) {
    if (paymentRequest) {
      paymentRequest.update({
        total: { label: 'RawasiShop IPL', amount: Math.round(total * 100) }
      });
    }
  }

  function initApplePay() {
    if (!isIOS() || !expressSection) return;

    expressSection.classList.add('visible');
    if (expressDivider) expressDivider.hidden = false;

    if (isStripeReady() && window.Stripe) {
      initStripeApplePay();
      return;
    }

    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      renderNativeApplePayButton();
      return;
    }

    var placeholder = document.getElementById('applePayPlaceholder');
    if (placeholder) {
      placeholder.hidden = false;
      placeholder.textContent = ' Apple Pay — فعّلي Stripe للدفع السريع';
    }
  }

  function renderNativeApplePayButton() {
    if (!applePayMount) return;
    var btn = document.createElement('button');
    btn.id = 'applePayButton';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'الدفع عبر Apple Pay');
    btn.addEventListener('click', onApplePayClick);
    applePayMount.appendChild(btn);
  }

  function onApplePayClick() {
    if (!validate()) return;
    var t = calcTotals();
    var order = getOrderPayload();

    if (!window.ApplePaySession) {
      processCod(order);
      return;
    }

    var request = {
      countryCode: 'SA',
      currencyCode: 'SAR',
      supportedNetworks: ['visa', 'masterCard', 'mada'],
      merchantCapabilities: ['supports3DS'],
      total: { label: 'RawasiShop', amount: String(t.total) }
    };

    var session = new ApplePaySession(3, request);
    session.onvalidatemerchant = function () {
      /* Requires Apple Pay merchant validation via backend + Stripe */
      console.warn('[Apple Pay] Merchant validation needs backend endpoint');
      session.abort();
      alert('Apple Pay يتطلب تفعيل Stripe + merchant validation على الخادم.\nراجع docs/checkout-integration/apple-pay.md');
    };
    session.onpaymentauthorized = function (event) {
      console.log('[Apple Pay] Authorized', event.payment);
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
      order.payment = 'apple_pay';
      order.transaction_id = order.transaction_id || ('RS-' + Date.now());
      sendToSheet(order);
      trackPurchase(order);
      showSuccess(order.name);
    };
    session.begin();
  }

  function initStripeApplePay() {
    var key = CFG.stripe.publishableKey;
    if (!key || typeof Stripe === 'undefined') {
      loadStripeJs(initStripeApplePay);
      return;
    }

    var stripe = Stripe(key);
    var t = calcTotals();
    paymentRequest = stripe.paymentRequest({
      country: CFG.country || 'SA',
      currency: 'sar',
      total: { label: 'RawasiShop IPL', amount: Math.round(t.total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true
    });

    paymentRequest.canMakePayment().then(function (result) {
      if (!result || !applePayMount) return;
      var elements = stripe.elements();
      var prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
        style: { paymentRequestButton: { type: 'buy', theme: 'dark', height: '48px' } }
      });
      prButton.mount('#applePayMount');

      paymentRequest.on('paymentmethod', function (ev) {
        /* TODO: Send ev.paymentMethod.id to backend to confirm PaymentIntent */
        console.warn('[Stripe Apple Pay] Confirm on server with PaymentIntent', ev.paymentMethod.id);
        ev.complete('success');
        var order = getOrderPayload();
        order.payment = 'apple_pay_stripe';
        sendToSheet(order);
        trackPurchase(order);
        showSuccess(order.name);
      });
    });
  }

  function loadStripeJs(cb) {
    if (document.getElementById('stripe-js')) { cb(); return; }
    var s = document.createElement('script');
    s.id = 'stripe-js';
    s.src = 'https://js.stripe.com/v3/';
    s.onload = cb;
    document.head.appendChild(s);
  }

  /* ---- Init ---- */
  function init() {
    var year = document.getElementById('coYear');
    if (year) year.textContent = new Date().getFullYear();

    initTracking();
    initFromUrl();
    updateTotals();

    if (form && window.RAWASI_SNAP) {
      RAWASI_SNAP.trackAddCart(calcTotals().subtotal, getBundle().units || 1);
    }

    if (bundleSelect) {
      bundleSelect.addEventListener('change', function () {
        updateBundleHint();
        updateTotals();
      });
    }
    updateBundleHint();
    document.querySelectorAll('input[name="payment"]').forEach(function (r) {
      r.addEventListener('change', updateTotals);
    });

    if (form) {
      form.phone.addEventListener('input', function () {
        this.value = this.value.replace(/[^\d+ ]/g, '');
      });
      form.addEventListener('submit', handleSubmit);
    }

    if (modalClose) modalClose.addEventListener('click', function () {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });

    var viewers = document.getElementById('coViewers');
    if (viewers) {
      var v = 23;
      setInterval(function () {
        v += Math.floor(Math.random() * 5) - 2;
        if (v < 12) v = 12;
        if (v > 41) v = 41;
        viewers.textContent = v;
      }, 5000);
    }

    if (isStripeReady()) loadStripeJs(function () { initApplePay(); });
    else initApplePay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
