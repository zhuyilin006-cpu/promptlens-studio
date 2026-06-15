# 全站功能文案中文化总结

## 完成内容
- 中文化页面主入口、导航、首屏标题、首屏说明和状态条。
- 中文化 Workflow 节点区，包括节点名称、节点状态、当前节点、节点已连接等文案。
- 中文化 Storyboard 画布区，包括分镜工作台、分镜检查器、处理状态、复制提示词反馈和底部摘要标题。
- 中文化 ShotCard 操作卡片，包括画面、镜头、状态、重绘、复制提示词等功能文案。
- 中文化 CreditBadge 算力组件。
- 中文化页面 metadata 的 title 与 description。

## 保留内容
- 保留品牌名 `PromptLens Studio`。
- 保留技术名 `ComfyFlow`、`Lovart` 与单位 `CRS`。
- 保留现有视觉风格、交互逻辑、数据结构与依赖。

## 验证结果
- `npm run build` 通过。
- `npm run dev` 启动后请求 `http://localhost:3000` 返回 `200`。
- 已停止 dev server，避免 `.next/trace` 文件占用。

## 变更文件
- `app/page.tsx`
- `components/tvc/FilmGridStoryboard.tsx`
- `components/tvc/ShotCard.tsx`
- `components/tvc/CreditBadge.tsx`
- `app/layout.tsx`

## 后续建议
- 如果需要完全中文化，可以继续把 mock 数据中的英文故事名、英文镜头标题、英文 Midjourney prompt 也翻译或提供中英双语版本。