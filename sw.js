// Тридевятое — кэш для офлайна и быстрых повторных запусков.
// assets/ и vendor/ (музыка, модели, Three.js) — сначала из кэша; код и страницы — сначала из сети (обновления приходят сразу).
const CACHE = 'tridevyatoe-v1.2.2'; // поменяйте версию, если перерендерили музыку или заменили модели
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'index.html', 'style.css', 'vendor/three.module.js']).catch(() => {}))); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('tridevyatoe-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== location.origin) return;
  const put = (res) => { if (res && res.ok && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); } return res; };
  if (/\/(assets|vendor)\//.test(u.pathname)) e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then(put)));
  else e.respondWith(fetch(r).then(put).catch(() => caches.match(r).then((hit) => hit || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
