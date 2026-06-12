/* تحميل بيكسلات الإعلانات بعد عرض الصفحة — أسرع للزوار على الجوال */
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

  function loadTikTok() {
    if (window.ttq && window.ttq.load) return;
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
      ttq.load('D8JK65JC77UAEKHUODQ0');
      ttq.page();
    }(window, document, 'ttq');
  }

  function run() {
    loadSnapchat();
    loadTikTok();
    try {
      document.dispatchEvent(new CustomEvent('rawasi:pixels-ready'));
    } catch (e) {}
  }

  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 3500 });
    } else {
      setTimeout(run, 1200);
    }
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
