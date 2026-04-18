// sw.js — Speed GS v1.84
// Cache name bump forces fresh install when you update files
const CACHE_NAME = 'speed-gs-v1.84';

// Every file the app needs — paths must exactly match what the server serves.
// NOTE: start_url in manifest.json is './index.html' so cache that exact path.
const ASSETS = [
    './index.html',
    './manifest.json',
    './speed_icon.png',
    './sw.js'
];

// ── Install: pre-cache all assets ────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching assets');
                // addAll fails if ANY asset 404s — make sure all files exist on server
                return cache.addAll(ASSETS);
            })
            .then(() => {
                // Activate immediately without waiting for old tabs to close
                return self.skipWaiting();
            })
    );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            // Take control of all open clients immediately
            return self.clients.claim();
        })
    );
});

// ── Fetch: cache-first strategy (works 100% offline) ─────────────────────────
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version immediately
                return cachedResponse;
            }
            // Not in cache — try network (handles first load before install completes)
            return fetch(event.request).then((networkResponse) => {
                // Cache any new successful responses for future offline use
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Network failed and not in cache — nothing we can do
                console.warn('[SW] Fetch failed for:', event.request.url);
            });
        })
    );
});
