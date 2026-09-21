// 自定义 Node 服务：承载 Next.js + Vidu WebSocket 信令代理。
// 浏览器 WebSocket 无法设置 Authorization 头，故由本代理注入 `Token vda_xxx`
// 后转发至上游 wss://{VIDU_WS_HOST}/live/ws/live/connect，密钥永不下发前端。
import { createServer } from 'node:http';
import { parse } from 'node:url';
import { readFileSync } from 'node:fs';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';

// 手动加载 .env.local（plain `node server.mjs` 不会像 Next 那样自动加载）
function loadEnvLocal() {
  try {
    const txt = readFileSync(new URL('./.env.local', import.meta.url), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  } catch {
    /* 无 .env.local 时忽略 */
  }
}
loadEnvLocal();

const dev = !process.argv.includes('--prod');
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOST || '0.0.0.0';

const WS_PROXY_PATH = '/api/vidu/ws';
// 惰性读取，避免任何加载时序问题
const getApiKey = () => (process.env.VIDU_API_KEY || '').trim();
const getWsHost = () => (process.env.VIDU_WS_HOST || 'api.vidu.cn').trim();

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url || '', true);
  handle(req, res, parsedUrl);
});

// 仅接管信令代理路径，其余 upgrade（如 Next HMR）交给 Next。
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const { pathname, query } = parse(req.url || '', true);
  if (pathname !== WS_PROXY_PATH) {
    return; // 交由 Next 的 HMR 等处理
  }

  const liveId = String(query.live_id || '');
  if (!liveId) {
    socket.destroy();
    return;
  }
  if (!getApiKey()) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (client) => {
    proxy(client, liveId);
  });
});

function proxy(client, liveId) {
  const upstreamUrl = `wss://${getWsHost()}/live/ws/live/connect?live_id=${encodeURIComponent(liveId)}`;
  const upstream = new WebSocket(upstreamUrl, {
    headers: { Authorization: `Token ${getApiKey()}` },
  });

  const pending = [];
  let upstreamOpen = false;

  upstream.on('open', () => {
    upstreamOpen = true;
    for (const m of pending) upstream.send(m);
    pending.length = 0;
  });

  // 客户端 → 上游
  client.on('message', (data) => {
    const payload = typeof data === 'string' ? data : data.toString();
    if (upstreamOpen && upstream.readyState === WebSocket.OPEN) {
      upstream.send(payload);
    } else {
      pending.push(payload);
    }
  });

  // 上游 → 客户端
  upstream.on('message', (data) => {
    const payload = typeof data === 'string' ? data : data.toString();
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });

  const closeBoth = (code, reason) => {
    try { if (client.readyState === WebSocket.OPEN) client.close(code, reason); } catch {}
    try { if (upstream.readyState === WebSocket.OPEN) upstream.close(code, reason); } catch {}
  };

  client.on('close', () => closeBoth(1000, 'client closed'));
  upstream.on('close', (code, reason) => {
    try {
      if (client.readyState === WebSocket.OPEN) client.close(1000, reason?.toString?.() || 'upstream closed');
    } catch {}
  });
  client.on('error', () => closeBoth(1011, 'client error'));
  upstream.on('error', (err) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ payload: { error: { code: 502, reason: 'WS_UPSTREAM_ERROR', message: err?.message || 'upstream error' } } }));
        client.close(1011, 'upstream error');
      }
    } catch {}
  });
}

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}  (dev=${dev}, ws-proxy=${WS_PROXY_PATH}, key=${getApiKey() ? 'set' : 'MISSING'})`);
});
