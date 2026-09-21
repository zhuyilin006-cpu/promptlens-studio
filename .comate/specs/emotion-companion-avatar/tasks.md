# 移动端情感聊天搭子(Vidu S1 实时数字人)任务计划

- [x] Task 1: 环境与依赖基建
    - 1.1: 新增 `.env.local.example`(VIDU_API_KEY / VIDU_HTTP_HOST / VIDU_WS_HOST / NEXT_PUBLIC_VIDU_MOCK)
    - 1.2: `package.json` 新增依赖 `ws`,并安装
    - 1.3: 调整脚本 `dev`/`start` 指向自定义服务 `server.mjs`,保留 `build`
    - 1.4: 确认 `.gitignore` 覆盖 `.env*.local`(已存在则跳过)

- [x] Task 2: Vidu 类型与信令基础(lib/vidu)
    - 2.1: `lib/vidu/types.ts` 定义创建会话请求/响应、rtc、信令、事件类型
    - 2.2: `lib/vidu/config.ts` host/mock 开关读取(服务端读 KEY)
    - 2.3: `lib/vidu/messages.ts` 构造/解析 conn_init、文字、打断、挂断与服务端事件

- [x] Task 3: 服务端会话创建代理(注入密钥)
    - 3.1: `app/api/vidu/session/route.ts` POST 代理创建 Live,注入 Authorization
    - 3.2: 入参校验与错误规范化(缺 KEY 返回 501 引导 Mock)
    - 3.3: `app/api/vidu/session/[id]/route.ts` GET 查询会话状态(可选)

- [x] Task 4: 自定义 Node 服务与 WS 代理
    - 4.1: `server.mjs` 集成 Next + http server
    - 4.2: 处理 `/api/vidu/ws` upgrade,建立上游 WS 并注入 Authorization
    - 4.3: 客户端↔上游双向透传与关闭同步、错误处理

- [x] Task 5: 客户端 RTC 与会话编排(lib/vidu)
    - 5.1: `lib/vidu/rtc.ts` 动态加载 AliRTC SDK,join/publish/subscribe/离场封装
    - 5.2: `lib/vidu/client.ts` 编排 create→WS(conn_init)→RTC,暴露事件与控制方法
    - 5.3: 集成 Mock 模式(无密钥/开关时的占位流转)

- [x] Task 6: 预设角色数据
    - 6.1: `data/companionPersonas.ts` 定义若干情感搭子(名称/简介/persona/音色/形象图/开场白)

- [x] Task 7: 移动端 UI 组件
    - 7.1: `components/companion/StatusPill.tsx` 状态指示
    - 7.2: `components/companion/RoleSelect.tsx` 预设网格 + 自定义创建表单(照片转 base64)
    - 7.3: `components/companion/CallScreen.tsx` 全屏数字人视频 + 状态/字幕层
    - 7.4: `components/companion/TextComposer.tsx` 文字输入抽屉
    - 7.5: `components/companion/ControlBar.tsx` 静音/打断/文字/挂断

- [x] Task 8: 页面编排与入口
    - 8.1: `app/companion/page.tsx` 组合选角↔通话两态,接入编排器与权限申请
    - 8.2: `app/layout.tsx` viewport 补充 viewport-fit=cover 及安全区适配
    - 8.3: 现有首页/布局增加进入 `/companion` 的入口链接

- [x] Task 9: 文档与验证
    - 9.1: 更新 `README.md`(功能、环境变量、运行方式、Vercel 限制)
    - 9.2: 运行 `npm run build` 与类型检查,修复问题
    - 9.3: Mock 模式移动端全流程自测
