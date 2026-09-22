# promptlens-studio

A gallery layout for prompt engineering studio.

## 情感聊天搭子（Vidu S1 实时数字人）

移动端优先的情感陪伴数字人，入口路由 `/companion`。基于 Vidu S1 实时交互数字人能力（MaaS 平台 `api.vidu.cn`）实现：选择预设搭子或上传照片自定义 → 发起 `video` 模式实时通话 → 语音/文字对话、可打断、可挂断。

### 架构

- 密钥安全：`VIDU_API_KEY(vda_xxx)` 只存在于服务端，前端永不接触。
- `app/api/vidu/session` —— 服务端代理创建 Live 会话（注入 `Authorization: Token vda_xxx`）。
- `server.mjs` —— 自定义 Node 服务，承载 Next.js 并把 `/api/vidu/ws` 作为 WebSocket 信令代理转发到 Vidu（浏览器无法为 WebSocket 设置鉴权头，故需服务端注入）。
- `lib/vidu/*` —— 类型、信令、AliRTC 封装与会话编排器。
- AliRTC Web SDK 承载音视频媒体流，WebSocket 仅承载控制信令。

### 环境变量

复制 `.env.local.example` 为 `.env.local` 并填写：

```
VIDU_API_KEY=vda_xxx        # 工作台获取，仅服务端使用
VIDU_HTTP_HOST=api.vidu.cn  # 海外用 api.vidu.com
VIDU_WS_HOST=api.vidu.cn
NEXT_PUBLIC_VIDU_MOCK=0     # 置 1 强制 Mock 模式
```

### 运行

```
npm install
npm run dev      # 自定义服务 server.mjs（含 WS 代理），默认 http://localhost:3000
npm run build
npm run start    # 生产模式
```

- 未配置 `VIDU_API_KEY` 或 `NEXT_PUBLIC_VIDU_MOCK=1` 时，`/companion` 自动进入 **Mock 模式**，无需真实密钥即可体验移动端完整交互流程。
- 移动端建议在 HTTPS 环境访问，否则麦克风/摄像头权限与自动播放会受限。

### 部署注意

WebSocket 信令代理需要长连接，**不适用于 Vercel Serverless**。请自托管（`node server.mjs --prod`）或将 WS 代理单独部署到支持长连接的运行环境。

## 部署到自有云服务器（VPS + Docker + Caddy 自动 HTTPS）

已提供 `Dockerfile`、`docker-compose.yml`、`Caddyfile`，一条命令即可在常开服务器上跑起来，且自带 Let's Encrypt HTTPS（移动端麦克风/自动播放必需）。

### 前置

1. 一台云服务器（阿里云/腾讯云 ECS 等），安装 Docker 与 Docker Compose 插件。
2. 一个域名，将其 A 记录解析到服务器公网 IP（HTTPS 证书按域名签发，裸 IP 无法签发受信证书）。
3. 服务器安全组放行 80、443 端口。

### 步骤

```bash
# 1) 在服务器上拉取代码（你已有 GitHub 仓库）
git clone <your-repo-url> && cd promptlens-studio

# 2) 创建 .env（供 docker compose 读取，不会打进镜像）
cat > .env <<'EOF'
VIDU_API_KEY=vda_你的真实key
DOMAIN=companion.example.com   # 换成你解析好的域名
EOF

# 3) 构建并启动（首次会自动申请 HTTPS 证书）
docker compose up -d --build

# 4) 查看日志（确认 Ready 且证书签发成功）
docker compose logs -f
```

访问 `https://<你的域名>/companion` 即可，长期在线、不依赖任何人的电脑。

### 更新与运维

```bash
git pull && docker compose up -d --build   # 拉新代码并滚动更新
docker compose restart                     # 仅重启
docker compose down                        # 停止
```

说明：
- `VIDU_API_KEY` 只存在于服务器容器环境变量，前端与镜像内均不含明文。
- `NEXT_PUBLIC_VIDU_MOCK` 在构建期注入，生产镜像默认关闭 Mock（走真实数字人）。
- 已内置 PWA：手机浏览器打开后可「添加到主屏幕」，界面外壳离线可加载（真正对话仍需联网调用 Vidu）。

## 免费托管：Render 一键蓝图

仓库已含 `render.yaml`（Docker 部署，支持 WebSocket，送免费 `*.onrender.com` HTTPS 域名）。

步骤：
1. 登录 [Render](https://render.com)，New → Blueprint，选择本 GitHub 仓库。
2. Render 读取 `render.yaml` 自动创建 Web 服务；在 `VIDU_API_KEY` 处填入你的 `vda_xxx`（标记为 secret，不入仓库）。
3. 部署完成后访问 `https://<服务名>.onrender.com/companion`。

注意：免费档实例在约 15 分钟无访问后会休眠，下次访问需冷启动数十秒；需要「不休眠常开」请用上面的 VPS 方案或 Oracle Always Free。


