/* =========================================================
   RawasiShop — TikTok Pixel helpers
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

  function getContentId() {
    var TAAGER = window.RAWASI_TAAGER || {};
    return TAAGER.productSku || 'SA04050100IPLMWD00';
  }

  function buildPayload(value, quantity) {
    var qty = quantity || 1;
    var val = value != null ? value : DEFAULT_VALUE;
    var contentId = getContentId();
    return {
      content_id: contentId,
      content_name: PRODUCT_NAME,
      content_type: 'product',
      quantity: qty,
      value: val,
      currency: CURRENCY,
      contents: [{
        content_id: contentId,
        content_type: 'product',
        content_name: PRODUCT_NAME,
        quantity: qty,
        price: val
      }]
    };
  }

  function ttqTrack(event, props) {
    try {
      if (!window.ttq || typeof window.ttq.track !== 'function') return;
      var payload = props || {};
      var fire = function () {
        window.ttq.track(event, payload);
      };
      if (typeof window.ttq.ready === 'function') window.ttq.ready(fire);
      else fire();
    } catch (e) { /* ignore */ }
  }

  window.RAWASI_TIKTOK = {
    trackInitiateCheckout: function () {
      ttqTrack('InitiateCheckout', {
        value: DEFAULT_VALUE,
        currency: CURRENCY,
        content_name: PRODUCT_NAME,
        content_type: 'product'
      });
    },

    trackAddToCart: function (value, quantity) {
      ttqTrack('AddToCart', buildPayload(value, quantity));
    },

    trackCompletePayment: function (value, quantity) {
      var payload = buildPayload(value, quantity);
      ttqTrack('CompletePayment', payload);
      ttqTrack('PlaceAnOrder', payload);
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
