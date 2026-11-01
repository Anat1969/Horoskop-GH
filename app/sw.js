// דף מהרשת, נכסים מהמטמון.
const C = 'horoskop-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/index.html'))); return; }
  if (new URL(r.url).origin === location.origin || r.url.includes('fonts.g')) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; })));
  }
});
