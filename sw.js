const CACHE_NAME = 'phil-cockpit-v4';
const ASSETS = [
  './',
  './index.html',
  './horizontal.html',
  './horizontal.json',
  './landscape.html',
  './landscape.json',
  './tank.html',
  './tank.json',
  './manifest.json',
  './icon.png',
  './sw.js'
];

// Force immediate update and cache everything
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Clean up old caches (v1, v2, v3)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Serve from cache first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
