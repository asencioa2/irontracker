const CACHE_NAME = 'irontracker-v24';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/data.js',
  '/db.js',
  '/utils.js',
  '/manifest.json',
];

// ── INSTALL ───────────────────────────────────────────────────
// Cache static assets, then immediately skip waiting so this SW
// activates without waiting for all tabs to close.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // ← don't wait for old SW to die
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
// Delete all old caches, then take control of all open tabs
// immediately — no page reload required for the SW itself.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // ← take control of all tabs now
      .then(() => {
        // Tell every open tab to reload so they get the new version
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
          });
        });
      })
  );
});

// ── FETCH ─────────────────────────────────────────────────────
// Network-first for HTML (always get latest), cache-first for
// assets. Never intercept Supabase API calls.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('unpkg.com')) return;
  if (event.request.url.includes('jsdelivr.net')) return;
  if (event.request.url.includes('cdnjs.cloudflare.com')) return;

  const url = new URL(event.request.url);
  const isHTML = url.pathname === '/' || url.pathname.endsWith('.html');

  if (isHTML) {
    // Network-first for HTML — ensures users always get latest index.html
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)) // fallback to cache if offline
    );
  } else {
    // Cache-first for JS/CSS/assets — faster loads
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
  }
});
