// Service Worker：离线可用 + 始终自更新（避免安装到主屏后卡在旧版本）。
// 策略：页面导航与 _next 静态资源都走 network-first（在线永远拿最新），
// 仅在断网时回退缓存；接口 /api/* 从不缓存（数字人对话需实时联网）。
const CACHE = 'companion-shell-v2';
const SHELL = ['/companion', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 允许页面主动触发跳过等待，立即启用新版本
self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

function networkFirst(req, fallbackPath) {
  return fetch(req)
    .then((res) => {
      if (res && res.status === 200 && req.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })
    .catch(() =>
      caches.match(req).then((cached) => cached || (fallbackPath ? caches.match(fallbackPath) : undefined)),
    );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // 实时接口/WS 绝不缓存

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, '/companion'));
    return;
  }
  if (url.pathname.startsWith('/_next/') || SHELL.includes(url.pathname)) {
    event.respondWith(networkFirst(req));
  }
});
