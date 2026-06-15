# PromptLens Studio 高级视觉再优化任务清单

- [x] Task 1: 强化全局视觉质感
    - 1.1: 在 `app/globals.css` 中新增 render surface、soft vignette、glass panel 等轻量 utility
    - 1.2: 调整现有背景与噪点效果，减少视觉脏感
    - 1.3: 保持现有 Tailwind 与组件 class 兼容

- [x] Task 2: 重构首页 Hero 主视觉层级
    - 2.1: 修改 `app/page.tsx` 首屏布局，减少冗余标签和密集边框
    - 2.2: 强化左侧品牌宣言与高级排版留白
    - 2.3: 将右侧 Production Monitor 改为 Hero Render Preview
    - 2.4: 增加更克制的状态数据浮层
    - 2.5: 将底部状态块改为横向精密仪表条
    - 2.6: 保留现有 `credits`、`currentTab`、`activeNode`、`selectedShotNumber` 状态逻辑

- [x] Task 3: 降噪 Storyboard 画布
    - 3.1: 修改 `FilmGridStoryboard.tsx` 顶部区域为更轻的 section header
    - 3.2: 将当前分镜详情面板调整为 floating inspector 风格
    - 3.3: 降低参数表和边框的视觉重量
    - 3.4: 保留 selected、processing、rebuilt 状态展示
    - 3.5: 保留 prompt 复制按钮与状态反馈

- [x] Task 4: 高级化 ShotCard 卡片视觉
    - 4.1: 修改 `ShotCard.tsx` 预览区为更具影像感的 render surface
    - 4.2: 减少卡片文字密度，保留镜头标题、时码、camera、transition、音效摘要
    - 4.3: 优化 selected、processing、rebuilt 状态的视觉表达
    - 4.4: 将 hover 操作层调整为更像 command palette 的克制浮层
    - 4.5: 保留现有 onSelect、onAction、copyPrompt 逻辑

- [x] Task 5: 构建与本地访问验证
    - 5.1: 如 dev server 正在运行，先停止以避免 `.next/trace` 占用
    - 5.2: 执行 `npm run build` 验证生产构建
    - 5.3: 启动 `npm run dev` 验证本地访问
    - 5.4: 请求 `http://localhost:3000` 确认返回 200
    - 5.5: 停止 dev server

- [x] Task 6: 提交推送与总结
    - 6.1: 执行 `git status` 检查变更
    - 6.2: 提交视觉再优化代码
    - 6.3: 推送到 GitHub main 分支
    - 6.4: 生成本轮 `summary.md`
