/* تحميل Snapchat Pixel بعد عرض الصفحة — TikTok يُحمّل عبر tiktok-pixel.js */
(function () {
  'use strict';

  function loadSnapchat() {
    if (window.snaptr) return;
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
    snaptr('init', '0ae4a60f-bad3-4443-9ce3-7a9aa9be9f73');
    snaptr('track', 'PAGE_VIEW');
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

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
