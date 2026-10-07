// Тридевятое — кэш для офлайна и быстрых повторных запусков.
// assets/ и vendor/ (музыка, модели, Three.js) — сначала из кэша; код и страницы — сначала из сети (обновления приходят сразу).
// v1.5: озвучка (assets/voice) — в отдельном кэше VOICE, он не стирается при смене версии: имена файлов содержат ключ текста,
// поэтому изменённая реплика просто получает новый файл. По сообщению {type:'offline'} кэш докачивает всю игру и всю озвучку.
const CACHE = 'tridevyatoe-v1.5.3'; // поменяйте версию, если перерендерили музыку или заменили модели
const VOICE = 'tridevyatoe-voice-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'index.html', 'style.css', 'vendor/three.module.js']).catch(() => {}))); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('tridevyatoe-') && k !== CACHE && k !== VOICE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
const isVoice = (p) => /\/assets\/voice\/.+\.mp3$/.test(p);
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (r.headers.has('range')) return; // аудио с Range — пусть идёт мимо (полный файл уже в кэше отдаёт браузер сам)
  const put = (name) => (res) => { if (res && res.ok && res.status === 200) { const cp = res.clone(); caches.open(name).then((c) => c.put(r, cp)); } return res; };
  if (isVoice(u.pathname)) e.respondWith(caches.open(VOICE).then((c) => c.match(r, { ignoreSearch: true })).then((hit) => hit || fetch(r).then(put(VOICE))));
  else if (/\/(assets|vendor)\//.test(u.pathname) && !/\/assets\/voice\/index\.json$/.test(u.pathname)) e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r).then(put(CACHE))));
  else e.respondWith(fetch(r).then(put(CACHE)).catch(() => caches.match(r, { ignoreSearch: true }).then((hit) => hit || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
// ---- офлайн: докачать игру и озвучку целиком ----
let busy = null;
const tell = async (msg) => { for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(msg); };
async function offline() {
  const base = new URL('./', self.registration.scope).href;
  const list = []; // [url, cacheName]
  try { const pre = await (await fetch(base + 'precache.json', { cache: 'no-cache' })).json(); pre.forEach((f) => list.push([base + f, CACHE])); } catch {}
  try { const ix = await (await fetch(base + 'assets/voice/index.json', { cache: 'no-cache' })).json(); (await caches.open(CACHE)).put(base + 'assets/voice/index.json', new Response(JSON.stringify(ix), { headers: { 'Content-Type': 'application/json' } })); Object.values(ix.files || {}).forEach((f) => list.push([base + 'assets/voice/' + f, VOICE])); } catch {}
  const cc = await caches.open(CACHE), vc = await caches.open(VOICE);
  const todo = []; for (const [url, name] of list) { const hit = await (name === VOICE ? vc : cc).match(url, { ignoreSearch: true }); if (!hit) todo.push([url, name]); }
  const total = list.length; let done = total - todo.length, failed = 0;
  await tell({ type: 'offline', done, total });
  let i = 0; const worker = async () => { while (i < todo.length) { const [url, name] = todo[i++]; try { const res = await fetch(url, { cache: 'no-cache' }); if (res.ok) await (name === VOICE ? vc : cc).put(url, res); else failed++; } catch { failed++; } done++; if (done % 20 === 0 || done === total) await tell({ type: 'offline', done, total }); } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  await tell({ type: 'offline', done, total, failed, finished: true });
}
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'offline') { if (!busy) busy = offline().finally(() => { busy = null; }); e.waitUntil && e.waitUntil(busy); } });
