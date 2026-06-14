/* =========================================================
   RawasiShop — TikTok Pixel helpers + تحميل فوري للـ stub
   ========================================================= */
(function () {
  'use strict';

  var PIXEL_ID = 'D8JK65JC77UAEKHUODQ0';
  var PRODUCT_NAME = 'جهاز إزالة الشعر';
  var CURRENCY = 'SAR';
  var DEFAULT_VALUE = 299;

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

  function ttqTrack(event, props) {
    try {
      if (window.ttq && typeof window.ttq.track === 'function') {
        if (props) window.ttq.track(event, props);
        else window.ttq.track(event);
      }
    } catch (e) { /* ignore */ }
  }

  window.RAWASI_TIKTOK = {
    trackInitiateCheckout: function () {
      ttqTrack('InitiateCheckout');
    },

    trackAddToCart: function (value, quantity) {
      ttqTrack('AddToCart', {
        content_name: PRODUCT_NAME,
        quantity: quantity || 1,
        value: value != null ? value : DEFAULT_VALUE,
        currency: CURRENCY
      });
    },

    trackCompletePayment: function (value, quantity) {
      ttqTrack('CompletePayment', {
        content_name: PRODUCT_NAME,
        content_type: 'product',
        quantity: quantity || 1,
        value: value != null ? value : DEFAULT_VALUE,
        currency: CURRENCY
      });
    },

    fromBundle: function (sel) {
      if (!sel) return { value: DEFAULT_VALUE, quantity: 1 };
      return {
        value: parseInt(sel.getAttribute('data-price'), 10) || DEFAULT_VALUE,
        quantity: parseInt(sel.value, 10) || 1
      };
    }
  };
})();
