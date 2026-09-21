# 移动端情感聊天搭子(Vidu S1 实时数字人)完成总结

## 结果

在 `promptlens-studio` 中新增移动端优先的情感聊天搭子,入口路由 `/companion`,基于 Vidu S1 实时交互数字人(`video` 模式)。`npm run build` 通过,类型检查通过;生产服务实测:`/` 与 `/companion` 返回 200,`/api/vidu/session` 在未配置密钥时返回 501,前端据此进入 Mock 模式。

## 已完成任务

1. 环境与依赖:`.env.local.example`;`package.json` 增 `ws`/`@types/ws`,脚本 `dev`/`start` 指向 `server.mjs`。
2. Vidu 基础库:`lib/vidu/types.ts`(类型)、`config.ts`(host/mock/密钥读取)、`messages.ts`(信令构造解析 + hangup 文案)。
3. 服务端会话代理:`app/api/vidu/session/route.ts`(POST 注入密钥、规范化返回、无密钥 501)、`[id]/route.ts`(GET 状态)。
4. 自定义 Node 服务:`server.mjs` 承载 Next + `/api/vidu/ws` WebSocket 代理(注入 Authorization 转发上游)。
5. 客户端编排:`lib/vidu/rtc.ts`(AliRTC SDK 动态加载与封装)、`client.ts`(create→WS(conn_init)→RTC 编排 + Mock 降级)。
6. 预设角色:`data/companionPersonas.ts`(暖心倾听者/元气伙伴/深夜树洞/知心引路人)。
7. 移动端 UI:`components/companion/` 下 `StatusPill`、`RoleSelect`(预设+自定义上传转 base64)、`CallScreen`(全屏视频+字幕)、`TextComposer`、`ControlBar`;`globals.css` 增 `.input`。
8. 页面与入口:`app/companion/page.tsx`(选角↔通话两态、权限申请、事件接线)、`layout.tsx` 增 `viewport-fit=cover`、首页导航加"情感搭子"入口。
9. 文档与验证:更新 `README.md`,`npm run build` 通过,Mock 链路实测通过。

## 关键设计

- **密钥安全**:`VIDU_API_KEY` 仅存于服务端;HTTP 经 Route Handler 代理,WebSocket 经 `server.mjs` 注入鉴权头转发(浏览器 WS 无法设自定义头)。
- **Mock 降级**:无密钥/`NEXT_PUBLIC_VIDU_MOCK=1` 时全流程可演示,真实接入零改动切回。
- **移动端**:`100dvh` 全屏、安全区适配、大热区、`playsinline`、SDK 懒加载。

## 使用与后续

- 配置 `.env.local` 的 `VIDU_API_KEY` 后 `npm run dev` 即接入真实数字人;建议 HTTPS 环境以获得麦克风与自动播放权限。
- 待真机联调核对项(依赖真实密钥,无法在本环境验证):
  - WS 文字/打断/挂断信令的 `type` 码与 payload 键需对照最新官方文档核实(现按 conn_init 同构 envelope 实现,集中在 `lib/vidu/messages.ts`)。
  - AliRTC Web SDK 的远端轨道订阅方法名随版本而异,`lib/vidu/rtc.ts` 已做防御式适配,必要时按实际 SDK 对齐。
- WS 代理需长连接,不适用于 Vercel Serverless,需自托管或单独部署 WS 服务。
