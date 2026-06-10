# 首屏视觉增强与网页访问修复说明

## 背景与问题
用户反馈当前页面“有框架，但首屏 UI 与设计不符合之前提到的风格和参考”，并且现在网页打不开。当前项目已经完成一次 RunningHub / Lovart 风格重构并通过过生产构建，但本地开发服务器此前被停止过，因此“打不开网页”可能来自以下两类原因：

1. 本地访问问题
   - `npm run dev` 未运行。
   - 端口 `3000` 未启动或被占用。
   - 浏览器访问了错误地址。

2. 代码或依赖问题
   - 新增样式或组件导致运行时错误。
   - Next.js 构建或启动失败。
   - `.next` 缓存或开发服务器进程冲突。

本轮目标分为两部分：先恢复本地网页可访问，再继续增强首屏视觉。

## 需求目标

### 需求 1：恢复网页可访问
处理逻辑：
- 先执行 `npm run build` 判断当前代码是否仍可生产构建。
- 若构建通过，再启动 `npm run dev`，让用户通过 `http://localhost:3000` 访问。
- 若构建失败，优先修复阻塞错误，再重新构建。
- 若启动失败，检查端口占用或 Next.js 缓存问题。

预期结果：
- 本地开发服务器可正常启动。
- 用户可打开 `http://localhost:3000`。
- 构建错误或运行错误被修复。

### 需求 2：继续增强首屏视觉
处理逻辑：
- 保留现有 RunningHub / Lovart 极简生产控制台方向。
- 将首屏从“普通文字 + 状态卡片”增强为更强的视觉主舞台。
- 增加分层视觉：左侧品牌宣言、右侧黑色渲染监视器/生产状态面板、底部参数条。
- 强化高端感：更明确的网格系统、微弱渐变光、极细边框、工业数据标签、视觉定位线。
- 避免加入无关复杂功能，不引入额外 UI 库。

## 技术方案

### 主页面增强
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`

受影响函数：
- `RunningHubInspiredPage`

计划修改：
- 将首屏 `<section>` 改为更完整的 hero composition。
- 左侧保留品牌标题，但提升为多行视觉主标题。
- 右侧新增黑色 render console 视觉模块，展示 `RUNNINGHUB NODE GRAPH`、算力状态、输出格式、当前故事板名。
- 增加底部横向 metadata strip：MODE、MODEL、FRAMES、STATUS。
- 保留现有导航、Tab、CreditBadge、Storyboard 数据流。

### 全局视觉补强
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/globals.css`

计划修改：
- 增加首屏使用的轻量 utility，例如 `hero-noise`、`corner-frame` 或增强 `paper-panel`。
- 保持 CSS 简单，不引入图片资源。

### 运行验证
受影响文件：
- 不直接修改，使用命令验证。

计划操作：
- 执行 `npm run build`。
- 启动 `npm run dev`。
- 如果端口可用，提示用户访问 `http://localhost:3000`。

## 数据流
1. `app/page.tsx` 继续从 `mockStoryboardData` 获取 story 名称、cuts、duration。
2. `credits` 继续传入 `CreditBadge`。
3. 首屏新增状态模块复用已有数据，不新增独立数据源。
4. `FilmGridStoryboard` 和 `ShotCard` 不作为本轮首要修改对象，除非构建错误涉及它们。

## 边界条件与异常处理
- 如果 `npm run build` 报错，优先修复构建错误，不进行视觉增强。
- 如果 `npm run dev` 端口被占用，应改用 Next.js 自动分配端口或提示实际端口。
- 首屏增强必须保持移动端可读，使用单列降级。
- 不使用外部图片，避免 Vercel 远程资源加载问题。
- 不引入新依赖，避免增加构建风险。

## 预期结果
- 网页恢复可访问。
- 首屏更接近高级 AI 生产工具/RunningHub/Lovart 风格。
- 页面第一屏具备更强视觉识别度，而不只是普通信息卡片。
- `npm run build` 通过。
- 改动提交并推送到 GitHub main 分支。