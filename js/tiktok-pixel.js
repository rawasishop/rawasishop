/* =========================================================
   RawasiShop — TikTok Pixel helpers
   ========================================================= */
(function () {
  'use strict';

  var PIXEL_ID = 'D8JK65JC77UAEKHUODQ0';
  var CURRENCY = 'SAR';

  function storeConfig() {
    return window.RAWASI_TAAGER || {};
  }

  function productName() {
    var T = storeConfig();
    return T.productName || 'جهاز إزالة الشعر';
  }

  function defaultValue() {
    var T = storeConfig();
    if (T.bundles && T.bundles[1] && T.bundles[1].price) return T.bundles[1].price;
    return 299;
  }

  if (!(window.ttq && window.ttq.load)) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
      ttq.setAndDefer = function (obj, m) {
        obj[m] = function () { obj.push([m].concat(Array.prototype.slice.call(arguments, 0))); };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (id, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = n || {};
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = r + '?sdkid=' + id + '&lib=' + t;
        var e = d.getElementsByTagName('script')[0];
        e.parentNode.insertBefore(s, e);
      };
      ttq.load(PIXEL_ID);
      ttq.page();
    }(window, document, 'ttq');
  }

  function getContentId() {
    var TAAGER = window.RAWASI_TAAGER || {};
    return TAAGER.productSku || 'SA04050100IPLMWD00';
  }

  function buildPayload(value, quantity, eventId) {
    var qty = quantity || 1;
    var val = value != null ? value : defaultValue();
    var unitPrice = qty > 0 ? Math.round((val / qty) * 100) / 100 : val;
    var contentId = getContentId();
    var name = productName();
    var payload = {
      content_id: contentId,
      content_name: name,
      content_type: 'product',
      quantity: qty,
      value: val,
      currency: CURRENCY,
      contents: [{
        content_id: contentId,
        content_type: 'product',
        content_name: name,
        quantity: qty,
        price: unitPrice
      }]
    };
    if (eventId) payload.event_id = eventId;
    return payload;
  }

  function ttqTrack(event, props) {
    try {
      if (!window.ttq) return;
      var payload = props || {};
      if (typeof window.ttq.track === 'function') {
        window.ttq.track(event, payload);
      } else if (Array.isArray(window.ttq)) {
        window.ttq.push(['track', event, payload]);
      }
    } catch (e) { /* ignore */ }
  }

  window.RAWASI_TIKTOK = {
    trackViewContent: function (value) {
      ttqTrack('ViewContent', buildPayload(value, 1));
    },

    trackInitiateCheckout: function (value, quantity) {
      ttqTrack('InitiateCheckout', buildPayload(value, quantity));
    },

    trackAddToCart: function (value, quantity) {
      ttqTrack('AddToCart', buildPayload(value, quantity));
    },

    trackSubmitForm: function (value, quantity, eventId) {
      ttqTrack('SubmitForm', buildPayload(value, quantity, eventId));
    },

    trackCompletePayment: function (value, quantity, eventId) {
      var payload = buildPayload(value, quantity, eventId);
      ttqTrack('PlaceAnOrder', payload);
      ttqTrack('CompletePayment', payload);
    },

    fromBundle: function (sel) {
      if (!sel) return { value: defaultValue(), quantity: 1 };
      return {
        value: parseInt(sel.getAttribute('data-price'), 10) || defaultValue(),
        quantity: parseInt(sel.value, 10) || 1
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.RAWASI_TIKTOK.trackViewContent(defaultValue());
    }, { once: true });
  } else {
    window.RAWASI_TIKTOK.trackViewContent(defaultValue());
  }
})();
