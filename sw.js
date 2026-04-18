const CACHE_NAME = 'phil-cockpit-v3';
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
  './icon.png'
];

// Install: Fetch and cache all files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
