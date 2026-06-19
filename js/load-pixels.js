/* تحميل Snapchat Pixel — فوري أو مؤجّل حسب deferPixelLoad في RAWASI_TAAGER */
(function () {
  'use strict';

  var loaded = false;

  function storeConfig() {
    return window.RAWASI_TAAGER || {};
  }

  function snapPixelId() {
    var T = storeConfig();
    return T.snapPixelId || '0ae4a60f-bad3-4443-9ce3-7a9aa9be9f73';
  }

  function loadSnapchat() {
    if (loaded) return;
    loaded = true;

    if (!window.snaptr) {
      (function (e, t, n) {
        var a = e.snaptr = function () {
          a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
        };
        a.queue = [];
        var s = 'script';
        var r = t.createElement(s);
        r.async = true;
        r.src = n;
        var u = t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r, u);
      })(window, document, 'https://sc-static.net/scevent.min.js');
    }

    snaptr('init', snapPixelId());
    snaptr('track', 'PAGE_VIEW');

    if (window.RAWASI_SNAP) {
      var T = storeConfig();
      var price = T.bundles && T.bundles[1] && T.bundles[1].price;
      RAWASI_SNAP.trackViewContent(price);
    }
  }

  function run() {
    loadSnapchat();
    try {
      document.dispatchEvent(new CustomEvent('rawasi:pixels-ready'));
    } catch (e) {}
  }

  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 6000 });
    } else {
      setTimeout(run, 2500);
    }
  }

  if (storeConfig().deferPixelLoad) {
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  } else {
    run();
  }
})();
