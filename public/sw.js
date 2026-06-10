const CACHE_NAME = 'finsimup-v4';

const EXTERNAL_DOMAINS = [
  'cloudflareinsights.com',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'static2.finnhub.io',
];

function isExternal(url) {
  return EXTERNAL_DOMAINS.some(d => url.indexOf(d) !== -1);
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html'));
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (isExternal(event.request.url)) return;
  if (event.request.url.includes('/api/')) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.open(CACHE_NAME).then((cache) =>
          cache.match(event.request).then((cached) =>
            cached || new Response('Offline', { status: 503 })
          )
        )
      )
    );
    return;
  }

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
