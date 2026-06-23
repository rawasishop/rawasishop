/* RawasiShop — تخزين مؤقت للصور فقط (JS/CSS دائماً من الشبكة) */
var CACHE = 'rawasi-v4';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  if (/\.(jpg|jpeg|webp|png|svg|gif)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (res) {
          if (!res || res.status !== 200) return res;
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(e.request, copy); });
          return res;
        });
      })
    );
  }
});
