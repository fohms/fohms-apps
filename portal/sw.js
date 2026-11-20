// v1.38: keeps the start-up files for FOHMS Volunteer Portal, so the app opens (and says it's offline) without a connection.
// It only ever handles this site's own files; the app itself always comes live from Google, never from here.
var CACHE = 'fohms-events-1.58.0';
var FILES = ['./', './manifest.webmanifest', '../icons/events-180.png', '../icons/events-192.png', '../icons/events-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('fohms-events-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin || e.request.method !== 'GET') return;   // Google's app and anything else: straight through
  // the newest files when online; the kept ones when not
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./'); }); }));
});
