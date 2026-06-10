# RunningHub / Lovart 风格 UI 重构设计说明

## 背景与问题
当前 `promptlens-studio` 页面已经具备基础框架：顶部导航、算力徽章、应用/工作流双 Tab、故事板矩阵与分镜卡片。但实际视觉效果仍偏向普通白底卡片网格，未充分体现用户此前提到的参考风格：

- RunningHub 式极简生产工具感
- Lovart / 高级创意工具式黑白灰视觉
- 节点工作流、算力、分镜、提示词生产线的工业感
- 高定画册与高级时尚影像的留白、层次和克制

因此需要做一次以视觉系统为核心的页面重构，而不是继续堆叠组件。

## 目标风格
页面应从普通 gallery UI 调整为“高级 AI 影像生产控制台”：

1. 整体基调
   - 背景使用暖白 `#F7F4EF` 或纸张质感米白，而不是纯白。
   - 使用炭黑 `#111111`、浅灰 `#E5E2DC`、暖棕/琥珀作为少量强调。
   - 保持大面积留白、细线、低饱和度、无圆角或极小圆角。

2. 页面结构
   - 顶部导航更像专业创意工具栏，而不是普通网站 header。
   - 首屏应有明确的品牌/项目主视觉区，表达 PromptLens Studio 的定位。
   - 主体应形成左右分区：左侧为工作流/参数/节点信息，右侧为分镜画布。
   - Application 与 Workflow 两个 Tab 不只是切换文字，而是影响视觉信息密度。

3. 分镜卡片
   - 现有卡片偏普通，需要加强“监视器 + 分镜板 + 控制浮层”的感觉。
   - 卡片顶部 16:9 黑色监视器区域应更像渲染窗口，可加入网格、扫描线、编号、状态标记。
   - 悬浮层应是工具面板，不是普通按钮弹层。
   - 信息区应更像技术表格/分镜脚本，而非电商卡片。

4. 算力徽章
   - 当前 CreditBadge 可保留，但要与顶部工具栏融合。
   - 扣减算力后应有明显但克制的动画反馈。

5. 工作流面板
   - 当前 workflow 面板过于简单，应升级为节点链路视图：Checkpoint、Prompt Matrix、Sampler、Output 四个节点。
   - 节点之间使用细线/小圆点连接，体现 RunningHub/ComfyUI 风格。

## 受影响文件

### `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`
修改类型：重构主页面布局。

受影响函数：
- `RunningHubInspiredPage`

计划修改：
- 增加首屏品牌信息区。
- 重构顶部导航，使其更像产品工具栏。
- 将 workflow 区从简单参数列表升级为节点链路面板。
- 保留 `credits` 与 `currentTab` 状态逻辑。
- 保留 `onExecuteAction={() => setCredits(prev => prev - 12)}` 算力扣减逻辑。

### `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`
修改类型：重构故事板画布。

受影响函数：
- `FilmGridStoryboard`

计划修改：
- 强化画布标题区，增加视觉状态、输出规格、pipeline 标识。
- 将 2×4 分镜矩阵包装为更完整的 storyboard board。
- 增加底部摘要的工业设计感。

### `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`
修改类型：重构卡片视觉。

受影响函数：
- `ShotCard`
- `handleRebuild`

计划修改：
- 保留现有 hover overlay 与复制提示词逻辑。
- 强化 16:9 render frame，加入扫描线、边角定位线、状态标签。
- 将按钮文案和信息排版改为更克制的工具产品风。
- 避免使用过多 emoji，使整体更高级。

### `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/CreditBadge.tsx`
修改类型：微调样式。

受影响函数：
- `CreditBadge`

计划修改：
- 与顶部工具栏统一高度、边框、字体。
- 保留 `framer-motion` 数字刷新动画。

### `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/globals.css`
修改类型：全局视觉调优。

计划修改：
- 调整背景色、字体 smoothing、selection、scrollbar。
- 可增加少量全局 utility，例如细网格背景、扫描线效果，但避免复杂 CSS。

## 数据流
1. `app/page.tsx` 持有 `credits` 与 `currentTab`。
2. `CreditBadge` 接收 `balance={credits}` 并展示算力。
3. `FilmGridStoryboard` 接收 `mockStoryboardData` 与 `onExecuteAction`。
4. `ShotCard` 调用 `onAction`，触发 `credits - 12`。
5. `ShotCard` 同时支持复制 `midjourney_shot_prompt`。

## 边界条件与异常处理
- 如果剪贴板 API 不可用，应避免页面崩溃，可使用 `navigator.clipboard?.writeText`。
- 算力扣减不应出现负数，可调整为 `Math.max(0, prev - 12)`。
- 移动端应保持可阅读：顶部工具栏可换行或压缩，分镜矩阵降为单列。
- 不引入额外重型 UI 组件库，保持轻量。

## 预期结果
完成后页面应具备：

- 更接近 RunningHub / Lovart 参考方向的高级工具型 UI。
- 更强的创意生产控制台氛围。
- 更统一的黑白灰/暖白视觉系统。
- 更清晰的工作流节点逻辑。
- 更高级的分镜矩阵展示效果。
- 构建通过，可继续推送到 GitHub 并触发 Vercel。