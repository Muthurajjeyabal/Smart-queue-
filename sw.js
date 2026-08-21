// Smart Hospital Queue — minimal service worker
// Only exists to satisfy "installable PWA" requirements (Add to
// Home Screen). Deliberately does NOT cache index.html or any app
// page — this app shows live queue data and must always fetch
// fresh from the network. Only truly static icon/manifest files
// are cached, and only as an offline fallback.
const CACHE_NAME = 'shq-shell-v2';
const STATIC_FILES = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Always fetch HTML pages fresh from the network — never serve a
// cached copy of index.html / reception.html / etc. Only static
// assets (icons, manifest) get an offline cache fallback.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')));

  if (!isStaticAsset) {
    // HTML/app requests: network only, no caching, no fallback.
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
