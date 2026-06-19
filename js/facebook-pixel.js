/* =========================================================
   RawasiShop — Meta (Facebook) Pixel
   ========================================================= */
(function () {
  'use strict';

  var inited = false;

  function storeConfig() {
    return window.RAWASI_TAAGER || {};
  }

  function pixelId() {
    return storeConfig().fbPixelId || '';
  }

  function defaultValue() {
    var T = storeConfig();
    if (T.bundles && T.bundles[1] && T.bundles[1].price) return T.bundles[1].price;
    return 99;
  }

  function productPayload(value) {
    var T = storeConfig();
    return {
      value: value != null ? value : defaultValue(),
      currency: T.currency || 'SAR',
      content_ids: [T.productSku || 'KSA-075'],
      content_type: 'product',
      content_name: T.productName || 'RawasiShop'
    };
  }

  function initFacebook() {
    var id = pixelId();
    if (!id || inited) return;
    inited = true;

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', id);
    fbq('track', 'PageView');
    fbq('track', 'ViewContent', productPayload());
  }

  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initFacebook, { timeout: 4000 });
    } else {
      window.addEventListener('load', function () { setTimeout(initFacebook, 1500); }, { once: true });
    }
  }

  window.RAWASI_FB = {
    trackViewContent: function (value) {
      try {
        if (window.fbq) fbq('track', 'ViewContent', productPayload(value));
      } catch (e) { /* ignore */ }
    },
    trackInitiateCheckout: function (value) {
      try {
        if (window.fbq) fbq('track', 'InitiateCheckout', productPayload(value));
      } catch (e) { /* ignore */ }
    },
    trackLead: function (value) {
      try {
        if (window.fbq) fbq('track', 'Lead', productPayload(value));
      } catch (e) { /* ignore */ }
    },
    trackPurchase: function (value) {
      try {
        if (window.fbq) fbq('track', 'Purchase', productPayload(value));
      } catch (e) { /* ignore */ }
    }
  };

  if (storeConfig().deferPixelLoad) schedule();
  else initFacebook();
})();
