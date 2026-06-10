/* =========================================================
   RawasiShop — Snapchat Pixel helpers
   Requires base snaptr init + PAGE_VIEW in <head>
   ========================================================= */
(function () {
  'use strict';

  var TAAGER = window.RAWASI_TAAGER || {};
  var SKU = TAAGER.productSku || 'SA04050100IPLMWD00';
  var CURRENCY = TAAGER.currency || 'SAR';
  var DEFAULT_PRICE = (TAAGER.bundles && TAAGER.bundles[1] && TAAGER.bundles[1].price) || 395;

  function snapTrack(event, props) {
    try {
      if (typeof window.snaptr === 'function') {
        window.snaptr('track', event, props || {});
      }
    } catch (e) { /* ignore */ }
  }

  function parseValue(value) {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      var n = parseFloat(value.replace(/[^\d.]/g, ''));
      if (!isNaN(n)) return n;
    }
    return DEFAULT_PRICE;
  }

  function normalizeOrder(input) {
    if (typeof input === 'number') {
      return { totalNum: input, qtyUnits: 1 };
    }
    return input || {};
  }

  window.RAWASI_SNAP = {
    trackViewContent: function (price) {
      snapTrack('VIEW_CONTENT', {
        price: parseValue(price != null ? price : DEFAULT_PRICE),
        currency: CURRENCY,
        item_ids: [SKU],
        item_category: 'beauty',
        description: TAAGER.productName || 'IPL Device'
      });
    },

    trackAddCart: function (price, qty) {
      snapTrack('ADD_CART', {
        price: parseValue(price != null ? price : DEFAULT_PRICE),
        currency: CURRENCY,
        item_ids: [SKU],
        number_items: qty || 1
      });
    },

    trackPurchase: function (order) {
      var o = normalizeOrder(order);
      var value = parseValue(o.totalNum != null ? o.totalNum : (o.subtotal != null ? o.subtotal : o.total));
      snapTrack('PURCHASE', {
        price: value,
        currency: CURRENCY,
        transaction_id: o.transaction_id || ('RS-' + Date.now()),
        item_ids: [SKU],
        number_items: o.qtyUnits || o.units || 1
      });
    }
  };
})();
