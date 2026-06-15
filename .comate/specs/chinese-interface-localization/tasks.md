# 全站功能文案中文化任务清单

- [✓] Task 1: 中文化页面主入口与导航
    - 1.1: 修改 `app/page.tsx` 顶部品牌副标题为中文
    - 1.2: 将导航 Tab 文案改为 `01 应用画布` 与 `02 工作流图谱`
    - 1.3: 将 `VERCEL LIVE` 改为中文云端状态文案
    - 1.4: 将首屏主标题、说明和模式文案改为中文
    - 1.5: 将首屏状态条中的 Mode、Node、Shot、Credit 改为中文

- [✓] Task 2: 中文化 Workflow 节点区
    - 2.1: 修改 `app/page.tsx` 中 `workflowNodes` 的显示文案为中文
    - 2.2: 将 Hero Render Preview、Active Node、Selected Frame 等监视器文案改为中文
    - 2.3: 将 Node Workflow、Knot connected、Selected Node 改为中文
    - 2.4: 将节点状态 READY、SYNC、ARMED、LIVE 改为中文显示

- [✓] Task 3: 中文化 Storyboard 画布区
    - 3.1: 修改 `FilmGridStoryboard.tsx` 中 Storyboard Surface 为中文
    - 3.2: 将 duration、cuts、rebuilt、Preview locked、Processing 改为中文
    - 3.3: 将 Inspector、Shot、Time、Camera、Transition 改为中文
    - 3.4: 将 Copy Full Prompt、Copied、Copy Failed 改为中文
    - 3.5: 将 VIDEO MAINLINE、CORE TRANSITIONS、VISUAL HOOK 改为中文

- [✓] Task 4: 中文化 ShotCard 操作卡片
    - 4.1: 修改 `ShotCard.tsx` 中 Frame、Shot 等镜头文案为中文
    - 4.2: 将 READY、SELECTED、PROCESSING、REBUILT 状态改为中文
    - 4.3: 将 Command、Rebuild Frame、Copy Prompt 改为中文
    - 4.4: 将 Copied、Copy Failed、Processing 改为中文
    - 4.5: 保留现有 onSelect、onAction、copyPrompt 逻辑不变

- [✓] Task 5: 中文化算力组件与页面 metadata
    - 5.1: 修改 `CreditBadge.tsx` 中 Compute 为 `算力`
    - 5.2: 修改 `app/layout.tsx` 页面 title 为中文优先
    - 5.3: 修改 `app/layout.tsx` 页面 description 为中文
    - 5.4: 保留品牌名 PromptLens Studio 与单位 CRS

- [✓] Task 6: 构建验证与本地访问检查
    - 6.1: 如 dev server 正在运行，先停止以避免 `.next/trace` 占用
    - 6.2: 执行 `npm run build` 验证生产构建
    - 6.3: 启动 `npm run dev` 验证本地访问
    - 6.4: 请求 `http://localhost:3000` 确认返回 200
    - 6.5: 停止 dev server

- [✓] Task 7: 提交推送与总结
    - 7.1: 执行 `git status` 检查变更
    - 7.2: 提交中文化代码
    - 7.3: 推送到 GitHub main 分支
    - 7.4: 生成本轮 `summary.md`
