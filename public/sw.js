const CACHE_NAME = 'synapse-study-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/logo.jpg'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Synapse SW] Pre-caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up previous version caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Synapse SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for app assets, Network-First for API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NEVER cache Supabase API calls or Email service (always live network)
  if (
    url.pathname.startsWith('/api/supabase') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('emailjs.com')
  ) {
    return;
  }

  // 2. Stale-While-Revalidate for static assets, scripts, styles, and fonts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately, fetch updated version in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            // Network failure / offline / blocked - gracefully ignored since cachedResponse is returned
          });
        return cachedResponse;
      }

      // If not cached, fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache local assets, JS, CSS, and Google fonts
          const isLocalAsset = url.origin === location.origin;
          const isFontOrCdn =
            url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com') ||
            url.hostname.includes('jsdelivr.net');

          if (isLocalAsset || isFontOrCdn) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // If navigation request fails, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });
    })
  );
});
