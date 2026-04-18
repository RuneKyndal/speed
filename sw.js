const CACHE_NAME = 'speed-v1.84';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './speed_icon.png',
  './sw.js'
];

// Install: Cache everything
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets for offline use');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Delete old versions of the app
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Serve from cache first, then network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
