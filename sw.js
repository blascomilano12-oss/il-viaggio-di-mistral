/* Mistral flipbook PWA — cache-first versionata */
const VERSION = 'mistral-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/stpageflip.min.js',
  './assets/flip.mp3',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './pages/pg-001.webp',
  './pages/pg-002.webp',
  './pages/pg-003.webp',
  './pages/pg-004.webp',
  './pages/pg-005.webp',
  './pages/pg-006.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res.ok && (url.pathname.includes('/pages/') || url.pathname.includes('/assets/') || url.pathname.includes('/icons/'))) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
