# 移动端情感聊天搭子(Vidu S1 实时数字人)设计文档

## 1. 需求概述与场景

在现有 Next.js 14 项目 `promptlens-studio` 中新增一个**面向手机的情感聊天搭子**页面:用户打开后选择/创建一个数字人"搭子",发起实时视频通话,能看到数字人形象、听到其声音,可用语音或文字与其自然对话,数字人具备"陪伴/倾听/共情"的人设。底层通过 Vidu S1 实时交互数字人能力(`https://www.vidu.cn/vidu-stream/avatar`,MaaS 平台 `api.vidu.cn`)实现。

核心处理逻辑:
- 选择预设情感角色(如"暖心倾听者""元气伙伴""深夜树洞")或上传照片+自定义人设创建专属搭子。
- 点击开始 → 服务端创建 Live 会话 → 建立 WS 信令 → 加入 AliRTC → 订阅数字人音视频、推送本地麦克风。
- 通话中支持:语音对话、打断数字人、发送文字消息、静音/挂断。

## 2. 已确认的关键决策(来自用户)

| 项 | 决策 |
| --- | --- |
| 交互形态 | **video 模式**(`call_mode=video`):可见数字人视频 + 语音双向 |
| 密钥安全 | **服务端代理**:`VIDU_API_KEY(vda_xxx)` 只存在于服务端,前端永不接触 |
| 人设来源 | **预设角色 + 自定义**:内置若干情感搭子角色,同时支持上传照片+自定义 persona |

## 3. 总体架构

```
[手机浏览器 / 移动 Web]
  │  ① POST /api/vidu/session (创建会话，无密钥)
  ▼
[Next.js 服务端 Route Handler] ──(注入 Authorization: Token vda_xxx)──► POST https://api.vidu.cn/live/v1/lives
  │  返回 live_id / rtc(token,user_id,channel) / ws 初始化信息
  ▼
[手机端]
  │  ② WS 连接 wss://<自身域>/api/vidu/ws?live_id=xxx
  ▼
[Next.js 自定义 Node 服务端 WS 代理] ──(注入 Authorization 头)──► wss://api.vidu.cn/live/ws/live/connect?live_id=xxx
  │  双向透传 conn_init / 文字 / 打断 / 挂断 / 服务端事件
  ▼
[手机端] ③ AliRTC Web SDK.joinChannel(rtc.token, rtc.user_id)
        发布本地麦克风 + 订阅数字人音视频(MediaStream 渲染到 <video>)
```

关键约束与判断:
- **浏览器 `WebSocket` 不能设置自定义请求头**,而 Vidu WS 要求 `Authorization: Token vda_xxx`。因此必须由**服务端 WS 代理**注入鉴权头并转发,前端只连本域代理,天然保护密钥。
- HTTP 创建会话同样经服务端 Route Handler 代理,密钥仅在 `.env.local`。
- AliRTC 为纯客户端 SDK,承载媒体流;WS 只承载控制信令。
- 由于 WS 代理需要长连接,**不适用于 Vercel Serverless**;本项目按"自定义 Node server 自托管/本地运行"设计,并在 README 注明该限制。

## 4. 密钥与安全策略

- `.env.local` 保存 `VIDU_API_KEY=vda_xxx`、`VIDU_HTTP_HOST=api.vidu.cn`、`VIDU_WS_HOST=api.vidu.cn`(国内环境;海外为 `api.vidu.com`)。提供 `.env.local.example` 模板,`.env*.local` 已在 `.gitignore` 中。
- 前端任何请求都不携带 `vda_xxx`;仅服务端 Route Handler 与 WS 代理读取 `process.env.VIDU_API_KEY` 并注入 `Authorization: Token vda_xxx`。
- 服务端向前端返回的仅为 `live_id`、`rtc.token`(AliRTC 短时 token)、`rtc.user_id`、`rtc.channel`、`token_expire_at` 等一次性会话凭据。
- 自定义头像照片以 base64 `data:image/...;base64,` 直接作为 `avatar.image_uri` 传入创建会话接口(≤50MB,decode 后 <20MB),不落盘、不额外走上传接口,降低复杂度。

## 5. Vidu S1 接入协议要点(实现依据)

通用:`{host}` 不含协议;HTTP 用 `https://{host}`,WS 用 `wss://{host}`;所有 App 侧接口需 `Authorization: Token vda_xxx`;字段 snake_case;`live_id` 等 int64 前端按**字符串**处理避免精度丢失。

第 1 步 创建会话:`POST https://api.vidu.cn/live/v1/lives`
```json
{
  "call_mode": "video",
  "avatar": {
    "persona": "你是一个温暖的情感陪伴者……",
    "image_uri": "https://... 或 data:image/png;base64,...",
    "voice": "Tina",
    "greeting_instruction": "≤200字符开场白提示词(可选)",
    "farewell_enabled": false
  }
}
```
返回含 `live.id`、`rtc`(`token`/`user_id`/`channel`/`app_id` 等)、`token_expire_at`(token 约 1 小时过期)。

第 2 步 建 WS 并发开始信号:`wss://api.vidu.cn/live/ws/live/connect?live_id={live_id}`,头 `Authorization: Token vda_xxx`;发送:
```json
{ "type": 1, "live_id": "123456789", "seq_id": 1, "payload": { "conn_init": { "version": 1 } } }
```
等待 `conn_init_ack.success=true` 方可交互。其余信令:文字输入、打断、挂断(各自 payload 类型)。服务端会下发状态/`hangup_reason`(13 种)等事件。

第 3 步 接入 RTC(AliRTC Web SDK):
```js
await aliRtc.joinChannel(rtc.token, rtc.user_id);
await aliRtc.publishLocalAudioStream(true);
if (callMode === 'video') await aliRtc.publishLocalVideoStream(true);
// 订阅远端:数字人音视频流 → 绑定到 <video>
```
video 模式:加入 `live-user-{liveID}`,推麦克风(可选摄像头),订阅数字人 `live-video-push-...`。

## 6. 目录结构与受影响文件

新增(绝对路径,均在 `c:\Users\zhuyilin\Desktop\WorkBy\promptlens-studio`):
- `app\companion\page.tsx` — 情感搭子入口页(移动端,`'use client'`),编排"选角 → 通话"两态。
- `app\companion\companion.css`(或复用 globals)— 页面级暖色主题样式(可选,优先用 Tailwind)。
- `components\companion\RoleSelect.tsx` — 预设角色网格 + 自定义创建表单(上传照片、persona、音色、开场白)。
- `components\companion\CallScreen.tsx` — 全屏数字人视频 + 状态层 + 字幕/提示。
- `components\companion\ControlBar.tsx` — 底部控制:麦克风静音、打断、文字输入、挂断。
- `components\companion\TextComposer.tsx` — 文字消息输入抽屉。
- `components\companion\StatusPill.tsx` — 连接/会话状态指示(就绪/连接中/在线/重连/结束)。
- `data\companionPersonas.ts` — 预设情感搭子角色数据(名称、简介、persona、默认音色、形象图 URL)。
- `lib\vidu\types.ts` — 请求/响应/信令 TS 类型。
- `lib\vidu\messages.ts` — WS 信令构造/解析(conn_init、文字、打断、挂断、事件)。
- `lib\vidu\rtc.ts` — AliRTC Web SDK 封装(动态加载、join、publish、subscribe、离场)。
- `lib\vidu\client.ts` — 会话编排器 `ViduCompanionSession`:串联 create-session → WS → RTC,对外发事件。
- `lib\vidu\config.ts` — 读取 host/mock 开关等(仅服务端读 KEY)。
- `app\api\vidu\session\route.ts` — `POST` 创建会话代理(注入密钥)。
- `app\api\vidu\session\[id]\route.ts` — `GET` 查询会话状态(可选)。
- `server.mjs` — 自定义 Node 服务:承载 Next + `/api/vidu/ws` WebSocket 代理(注入 Authorization 转发上游)。
- `.env.local.example` — 环境变量模板。

修改:
- `package.json` — 新增依赖 `ws`;新增/调整脚本 `dev`/`start` 指向 `server.mjs`(保留 `build`)。
- `README.md` — 补充情感搭子功能、环境变量、运行方式、Vercel 限制说明。
- `app\page.tsx` 或 `app\layout.tsx` — 增加进入 `/companion` 的入口链接(轻量,不破坏现有分镜台)。

## 7. 关键实现细节

会话创建代理 `app\api\vidu\session\route.ts`(要点):校验 body(call_mode/persona/image_uri),`fetch(https://${HOST}/live/v1/lives)` 带 `Authorization: Token ${process.env.VIDU_API_KEY}`,透传返回或规范化错误;缺少 KEY 时返回 501 并提示走 Mock。

WS 代理 `server.mjs`(要点):`next({dev})` + `http.createServer`;监听 `upgrade` 事件,path=`/api/vidu/ws` 时用 `ws` 建立上游 `wss://${WS_HOST}/live/ws/live/connect?live_id=...`(带 Authorization 头),客户端↔上游双向 `pipe`,任一端关闭同步关闭;其余 upgrade 交给 Next。

RTC 封装 `lib\vidu\rtc.ts`(要点):动态加载 AliRTC SDK(优先 CDN `<script>` 注入 `window.AliRtcEngine`),`joinChannel` → `publishLocalAudioStream(true)` →(video)`publishLocalVideoStream` → 监听远端 `onRemoteTrackAvailable/subscribe`,产出 `MediaStream` 回调给 UI 绑定 `<video autoplay playsinline>`。

编排器 `lib\vidu\client.ts`(要点):`start(role)` → 调 `/api/vidu/session` → 连本域 WS → 发 `conn_init` → 收 `conn_init_ack.success` 后 join RTC;暴露事件 `status/remoteStream/subtitle/error/hangup`;方法 `sendText/interrupt/toggleMic/hangup`。

## 8. 数据流路径

1. 选角/自定义 → 组装 `CreateLiveRequest` → `POST /api/vidu/session` →(服务端注入密钥)→ Vidu → 返回 `live_id/rtc`。
2. 前端连 `wss://本域/api/vidu/ws?live_id` →(server.mjs 注入头)→ Vidu WS;发 `conn_init` 等 `ack`。
3. `ack.success` 后用 `rtc.token/user_id` `joinChannel`,推麦克风、订阅数字人音视频 → 渲染 `<video>`。
4. 语音:麦克风经 RTC 上行;文字:经 WS 下发文字信令。打断/挂断经 WS。服务端事件(状态/字幕/hangup)经 WS 回传更新 UI。

## 9. 边界条件与异常处理

- 缺 `VIDU_API_KEY`:接口 501,前端自动切换 **Mock 模式**(见 §10),不阻断 UI。
- `conn_init` 未 `ack.success` / `NOT_READY`:短延时重试(指数退避,上限 N 次),期间显示"连接中"。
- token ~1 小时过期:长会话监听 `token_expire_at`,过期或收到鉴权失效事件时提示并支持"重新连接"(重建会话)。
- video 模式"创建成功≠能说话":以远端媒体轨到达 + `ack.success` 作为"可对话"判定,再解锁交互。
- 13 种 `hangup_reason`:集中映射为用户可读文案(如超时/额度不足/服务端结束),分类展示并给出下一步(重连/返回选角)。
- 权限:首次进入请求麦克风(video 可选摄像头)权限;拒绝时降级为"文字聊天 + 数字人视频/语音只出"。
- 网络中断:WS/RTC 断开触发重连;超过阈值提示结束。
- 移动端自动播放限制:远端音视频在用户手势(点击"开始")后再 `play()`,`<video muted?>` 策略处理 iOS 自动播放。

## 10. Mock / 降级模式

`NEXT_PUBLIC_VIDU_MOCK=1` 或缺密钥时启用:`/api/vidu/session` 返回假 `live_id`;编排器跳过真实 WS/RTC,用占位视频/头像 + 文字回声模拟对话与状态流转,保证移动端 UI 全流程可演示、可联调,真实接入零改动切回。

## 11. 移动端适配

- viewport 已含 `width=device-width`;补充 `viewport-fit=cover` 与 `env(safe-area-inset-*)` 适配刘海/底部横条。
- 全屏竖屏优先布局:视频铺满,控制栏吸底,大点击热区(≥44px)。
- 暖色/柔和情感主题(与现有冷色分镜台区分):渐变背景、圆角卡片、柔光。
- 触控友好、`playsinline`、禁止误触缩放;首屏轻量、SDK 懒加载。

## 12. 预期结果与验收

- `/companion` 在手机可访问:选择预设或自定义搭子 → 允许麦克风 → 看到数字人视频、听到开场白 → 语音/文字对话、可打断、可挂断。
- 密钥仅存于服务端,前端网络请求不含 `vda_xxx`。
- 无密钥时 Mock 模式全流程可跑通。
- `npm run build` 通过;新增/修改的 TS 通过类型检查。
