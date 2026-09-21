// Service Worker：离线缓存应用外壳。
// 策略：静态资源(_next/static、图标)走 cache-first；页面导航走 network-first、失败回退缓存；
// 接口请求(/api/*)不缓存（数字人对话需实时联网）。
const CACHE = 'companion-shell-v1';
const SHELL = ['/companion', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // 实时接口与 WS 代理绝不缓存
  if (url.pathname.startsWith('/api/')) return;

  // 页面导航：network-first，断网回退缓存的 /companion
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/companion'))),
    );
    return;
  }

  // 静态资源：cache-first + 后台更新
  if (url.pathname.startsWith('/_next/') || SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
