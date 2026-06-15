# 全站功能文案中文化说明

## 背景与目标
用户明确指出：这是中文网站，所有功能需要用中文显示。当前页面视觉和交互已完成，但大量功能文案仍是英文，例如：

- `Application Canvas`
- `ComfyFlow Graph`
- `Hero Render Preview`
- `Selected Frame`
- `Processing`
- `Rebuild Frame`
- `Copy Prompt`
- `Inspector`
- `Storyboard Surface`
- `Compute`
- `Advanced AI Application Hub`

本轮目标是将面向用户的功能文案统一中文化，同时保留少量品牌名、技术名和产品名，例如 `PromptLens Studio`、`ComfyFlow`、`Lovart`、`CRS` 等。

## 中文化范围

### 1. 页面主入口与导航
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`

计划修改：
- 顶部副标题改为中文。
- Tab 文案改为中文：
  - `01 Application Canvas` → `01 应用画布`
  - `02 ComfyFlow Graph` → `02 工作流图谱`
- `VERCEL LIVE` 改为 `云端已连接`。
- 首屏主标题和说明改为中文。
- `Canvas Mode` / `Graph Mode` 改为 `画布模式` / `图谱模式`。
- 状态条中的 `Mode`、`Node`、`Shot`、`Credit` 改为中文。

### 2. Workflow 节点区
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`

计划修改：
- `workflowNodes` 中显示用的 label、title、meta、status 改为中文。
- `Node Workflow` 改为 `节点工作流`。
- `Knot connected` 改为 `节点已连接`。
- `Selected Node` 改为 `当前节点`。
- `Active Node` 改为 `当前节点`。

### 3. Storyboard 画布区
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`

计划修改：
- `Storyboard Surface` 改为 `分镜工作台`。
- `duration`、`cuts`、`rebuilt` 改为 `总时长`、`分镜`、`已重绘`。
- `Preview locked` 改为 `预览已锁定`。
- `Processing` 改为 `处理中`。
- `Inspector` 改为 `分镜检查器`。
- `Ready` / `Rebuilt` 改为 `就绪` / `已重绘`。
- `Shot`、`Time`、`Camera`、`Transition` 改为中文。
- `Copy Full Prompt` / `Copied` / `Copy Failed` 改为中文。
- 底部 `VIDEO MAINLINE`、`CORE TRANSITIONS`、`VISUAL HOOK` 改为中文。

### 4. ShotCard 卡片区
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`

计划修改：
- `Frame` 改为 `画面`。
- `READY`、`SELECTED`、`PROCESSING`、`REBUILT` 改为中文状态。
- `Command` 改为 `操作`。
- `Rebuild Frame` 改为 `重绘此镜头`。
- `Copy Prompt` 改为 `复制提示词`。
- `Copied` 改为 `已复制`。
- `Copy Failed` 改为 `复制失败`。
- `Shot` 改为 `镜头`。

### 5. CreditBadge 与页面 metadata
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/CreditBadge.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/layout.tsx`

计划修改：
- `Compute` 改为 `算力`。
- 页面标题改为中文优先：`PromptLens Studio ® - AI 影像分镜工作台`。
- 页面描述改为中文。

## 不改动范围
- 不修改数据结构。
- 不修改样式体系。
- 不新增依赖。
- 不翻译品牌名 `PromptLens Studio`。
- 不翻译技术/单位名 `CRS`、`ComfyFlow`、`Lovart`，但其周边功能说明中文化。

## 验证方式
- 执行 `npm run build` 确认构建通过。
- 若本地开发服务正在运行，先停止再构建，避免 `.next/trace` 占用。
- 构建通过后启动 `npm run dev`，请求 `http://localhost:3000` 确认返回 `200`。
- 提交并推送到 GitHub main 分支。

## 预期结果
- 网站主要功能文案全部中文显示。
- 用户不再看到英文功能按钮、状态、标题。
- 保留高级视觉风格与现有交互逻辑。
- 构建通过，本地可访问，代码已推送。