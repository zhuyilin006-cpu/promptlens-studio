# Storyboard 交互功能增强总结

## 完成内容
- 在 `app/page.tsx` 中新增当前选中分镜、当前选中节点、processing 分镜、rebuilt 分镜集合状态。
- 实现分镜选择与模拟重绘事件流：点击分镜可选中，点击重绘扣减 12 CRS，短暂进入 PROCESSING，结束后进入 REBUILT。
- 在 `FilmGridStoryboard.tsx` 中扩展组件接口，新增当前分镜详情面板，展示标题、时码、镜头运动、转场、画面描述、音效与 prompt 复制按钮。
- 在 `ShotCard.tsx` 中新增 selected、processing、rebuilt 视觉状态，并将复制 prompt 从 alert 改为按钮内状态反馈。
- 在 Workflow 区域增加节点选择交互，选中节点会强化样式并显示节点详情。

## 验证结果
- `npm run build` 通过。
- `npm run dev` 启动后，本地请求 `http://localhost:3000` 返回 `200`。
- 已停止本地 dev server，避免后续构建时 `.next/trace` 被占用。

## Git 同步
- 本轮变更准备提交并推送到 GitHub main 分支。

## 注意事项
- 当前重绘与节点交互均为前端模拟状态，不连接真实后端 API。
- Clipboard API 不可用时不会抛异常，会显示复制失败反馈。