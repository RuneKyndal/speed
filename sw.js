// sw.js — Speed GS v1.84
const CACHE_NAME = 'speed-gs-v1.84';

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
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// ── Activate: delete old caches ──────────────────────────────────────────────
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
            return self.clients.claim();
        })
    );
});

// ── Fetch: network-first, cache fallback ─────────────────────────────────────
// Online  → fetches fresh from GitHub, updates cache automatically
// Offline → network fails, serves from cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Fresh from network — update cache for next offline use
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Network failed — fall back to cache
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    console.warn('[SW] Offline and not cached:', event.request.url);
                });
            })
    );
});
