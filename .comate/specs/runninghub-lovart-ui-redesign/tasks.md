# RunningHub / Lovart 风格 UI 重构任务清单

- [x] Task 1: 重构全局视觉基底
    - 1.1: 调整 `app/globals.css` 中的页面背景、文字颜色、字体 smoothing 与 selection 样式
    - 1.2: 增加轻量级纸张质感、细网格、扫描线等视觉 utility
    - 1.3: 检查 Tailwind class 是否能覆盖新增视觉系统

- [x] Task 2: 重构主页面工具台布局
    - 2.1: 修改 `app/page.tsx` 顶部导航为专业创意工具栏风格
    - 2.2: 增加品牌主视觉与生产状态信息区
    - 2.3: 保留 `currentTab` 双轨切换逻辑
    - 2.4: 将算力扣减逻辑调整为不低于 0

- [x] Task 3: 升级 Workflow 节点面板
    - 3.1: 在 `app/page.tsx` 中将 workflow 面板改为节点链路布局
    - 3.2: 增加 Checkpoint、Prompt Matrix、Sampler、Output 节点
    - 3.3: 使用细线、小圆点与状态标签强化 RunningHub / ComfyUI 生产流感觉
    - 3.4: 确保移动端展示不破坏主画布阅读

- [x] Task 4: 重构 Storyboard 画布
    - 4.1: 修改 `FilmGridStoryboard.tsx` 头部信息区为高级画册 + 工业状态栏混合风格
    - 4.2: 将分镜矩阵包装为更完整的 storyboard board 容器
    - 4.3: 强化底部视频主线、核心转场、记忆点三栏摘要的层级
    - 4.4: 保留现有 `data.shots.map` 与 `onExecuteAction` 调用逻辑

- [x] Task 5: 重构 ShotCard 分镜卡片
    - 5.1: 修改 `ShotCard.tsx` 渲染监视器区域，增加扫描线、边角定位线、编号与状态标识
    - 5.2: 将 hover 浮层改为克制的工具操作面板
    - 5.3: 调整分镜文字、技术标签、音效注脚排版
    - 5.4: 将剪贴板复制逻辑改为安全调用，避免 API 不可用时报错
    - 5.5: 减少过多 emoji，提升整体高级感

- [x] Task 6: 微调 CreditBadge 工具栏融合度
    - 6.1: 修改 `CreditBadge.tsx` 外观，使其与顶部工具栏高度、边框、字体一致
    - 6.2: 保留 `framer-motion` 数字刷新动画
    - 6.3: 优化算力状态指示灯与文案

- [x] Task 7: 构建验证并同步远程
    - 7.1: 执行 `npm run build` 验证生产构建
    - 7.2: 修复构建中发现的类型或语法问题
    - 7.3: 执行 `git status` 检查变更
    - 7.4: 提交并推送到 GitHub main 分支
