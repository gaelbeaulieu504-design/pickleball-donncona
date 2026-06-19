const CACHE = 'pb-cache-v1'
const STATIC_ASSETS = ['/', '/logo-nav.png', '/icon-192.png', '/icon-512.png', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // API calls — réseau seulement, pas de cache
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Assets avec hash (JS/CSS de Vite) — cache-first
  if (url.pathname.match(/\/assets\/.+\.(js|css|png|svg|jpg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(cache => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // Pages et autres requêtes — network-first avec fallback cache
  event.respondWith(
    fetch(request).then(res => {
      const clone = res.clone()
      caches.open(CACHE).then(cache => cache.put(request, clone))
      return res
    }).catch(() => caches.match(request))
  )
})