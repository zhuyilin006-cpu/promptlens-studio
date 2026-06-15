# Storyboard 交互功能增强任务清单

- [x] Task 1: 扩展主页面交互状态
    - 1.1: 在 `app/page.tsx` 中新增当前选中分镜状态
    - 1.2: 在 `app/page.tsx` 中新增当前选中节点状态
    - 1.3: 在 `app/page.tsx` 中新增 processing 分镜状态
    - 1.4: 在 `app/page.tsx` 中新增 rebuilt 分镜集合状态
    - 1.5: 保持现有 `credits` 与 `currentTab` 逻辑不变

- [x] Task 2: 实现分镜选择与重绘事件流
    - 2.1: 在 `app/page.tsx` 中实现 `handleSelectShot`
    - 2.2: 在 `app/page.tsx` 中实现 `handleExecuteShot`
    - 2.3: 点击重绘时扣减算力且不低于 0
    - 2.4: 点击重绘时设置短暂 processing 状态
    - 2.5: processing 结束后将分镜加入 rebuilt 状态

- [x] Task 3: 调整 FilmGridStoryboard 组件接口
    - 3.1: 在 `FilmGridStoryboard.tsx` 中扩展 props 类型
    - 3.2: 将 selected、processing、rebuilt 状态传给每个 `ShotCard`
    - 3.3: 将 `onSelectShot` 与 `onExecuteAction` 转发给每个 `ShotCard`
    - 3.4: 在 Storyboard 画布中新增当前分镜详情面板
    - 3.5: 详情面板显示标题、时码、镜头运动、转场、音效与 prompt 摘要

- [x] Task 4: 升级 ShotCard 交互反馈
    - 4.1: 在 `ShotCard.tsx` 中扩展 selected、processing、rebuilt props
    - 4.2: 点击卡片时触发选中分镜
    - 4.3: 根据 selected 状态强化卡片边框与状态标签
    - 4.4: 根据 processing 状态显示 processing 文案或动效
    - 4.5: 根据 rebuilt 状态显示 rebuilt 标识
    - 4.6: 将复制 prompt 的 alert 改为按钮内短暂反馈
    - 4.7: 保持 clipboard API 不可用时不抛错

- [x] Task 5: 增加 Workflow 节点选择交互
    - 5.1: 在 `app/page.tsx` 中让 workflow 节点可点击
    - 5.2: 根据 active node 状态强化选中节点样式
    - 5.3: 在 workflow 面板中显示当前节点详情
    - 5.4: 保持移动端节点面板可读

- [x] Task 6: 构建验证与本地访问检查
    - 6.1: 执行 `npm run build` 验证生产构建
    - 6.2: 修复构建中出现的类型或语法问题
    - 6.3: 启动 `npm run dev` 验证本地访问
    - 6.4: 使用本地请求确认页面返回 200
    - 6.5: 停止 dev server，避免 `.next/trace` 占用

- [ ] Task 7: 提交同步与总结
    - 7.1: 执行 `git status` 检查变更
    - 7.2: 提交交互增强代码
    - 7.3: 推送到 GitHub main 分支
    - 7.4: 生成本轮 `summary.md`
