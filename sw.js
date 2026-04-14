const CACHE_NAME = 'phil-app-v1';
const ASSETS = [
  './',
  './index.html', // Replace with your main file name
  './tank/tank.html',
  // Add paths to any CSS or JS files inside the tank folder here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
