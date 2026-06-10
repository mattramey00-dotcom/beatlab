/* ================= BEAT LAB SERVICE WORKER =================
   Offline support + clean auto-update.
   Bump CACHE_VERSION on every deploy so a new worker installs, precaches the
   fresh shell, and the page can prompt to reload into it. */
const CACHE_VERSION = 'beatlab-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './favicon-32.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', e => {
  // Precache the app shell. Don't auto-skip-waiting: the page decides when to
  // activate the new worker (via the update toast) so we never reload mid-beat.
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', e => {
  // Drop old version caches, then take control of open clients immediately.
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// The page posts this when the user accepts an update.
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // HTML navigations: network-first (fresh when online), cache fallback offline.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE_VERSION);
        c.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Google Fonts (cross-origin): cache-first, populate on first online load.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        const c = await caches.open(CACHE_VERSION);
        c.put(req, res.clone());   // opaque responses cache fine
        return res;
      } catch (err) { return cached || Response.error(); }
    })());
    return;
  }

  // Same-origin assets: stale-while-revalidate (instant from cache, refresh in bg).
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      const fetching = fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE_VERSION).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => null);
      return cached || (await fetching) || Response.error();
    })());
  }
});
