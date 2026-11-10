// Muosa service worker: النسخة المحفوظة في الجهاز أولاً دائماً. لا يتحدّث التطبيق إلا بموافقة المستخدم من الإعدادات.
const C = 'muosa-app';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(caches.open(C).then(async c => {
    const nav = r.mode === 'navigate';
    const m = await c.match(nav ? './index.html' : r);
    if (m) return m;
    try { return await fetch(r); }
    catch (err) { if (nav) { const f = await c.match('./index.html'); if (f) return f; } throw err; }
  }));
});
