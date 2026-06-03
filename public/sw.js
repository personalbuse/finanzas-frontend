const CACHE_NAME = 'finsimup-v3';
const STRATEGY = 'stale-while-revalidate';

const EXTERNAL_DOMAINS = [
  'cloudflareinsights.com',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
];

function isExternal(url) {
  return EXTERNAL_DOMAINS.some(d => url.indexOf(d) !== -1);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (isExternal(event.request.url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetched;
      });
    })
  );
});
