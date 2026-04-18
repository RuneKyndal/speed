const CACHE_NAME = 'phil-cockpit-v6';
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

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll but catch individual failures to avoid breaking the whole install
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or attempt network fetch
      return response || fetch(event.request).catch(() => {
          // If both fail and it's a navigation request, return landscape.html as fallback
          if (event.request.mode === 'navigate') {
              return caches.match('./landscape.html');
          }
      });
    })
  );
});
