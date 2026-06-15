# PromptLens Studio 高级视觉再优化说明

## 背景与问题
用户反馈当前界面“不好看”，需要继续按之前提到的 RunningHub / Lovart / 高级影像生产控制台方向优化。当前页面虽然具备较完整的功能和交互，但视觉上存在以下问题：

1. 信息密度过高
   - 首屏、生产监视器、节点图、分镜详情、分镜卡片同时出现，视觉焦点不够明确。
   - 大量小字号 uppercase 文案和边框让界面显得拥挤。

2. 高级感不足
   - 目前更像“工程样机”，还没有形成 Lovart 式的高级视觉层次。
   - 缺少一个强主视觉区域，例如高级渲染画面、视觉封面、艺术化预览窗口。

3. 组件层级不统一
   - Hero、Storyboard、ShotCard、Detail Panel 各自成立，但整体节奏不够统一。
   - 线框、背景、卡片样式重复较多，显得堆叠。

4. 分镜卡片偏硬
   - 当前 ShotCard 的黑色监视器较抽象，缺少“高级图像预览”感。
   - 卡片高度较大，文字区域偏密。

## 本轮目标
本轮不增加新功能，专注视觉优化：

- 减少视觉噪音和过多边框。
- 强化首屏主视觉，做出更明确的“AI 高级影像控制台”感。
- 优化 Storyboard 区域，让分镜卡片更像高级影像工作台，而不是表格堆叠。
- 保留现有交互：分镜选择、重绘、复制、节点选择、算力扣减。
- 不引入新依赖，不改数据结构。

## 设计方向

### 1. 首屏视觉重组
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`

计划修改：
- 将首屏改为更大留白、更明确左右主次关系。
- 左侧保留品牌宣言，但减少冗余标签。
- 右侧 Production Monitor 改为更高级的“Hero Render Preview”：
  - 中央大面积暗色渲染窗口
  - 细腻光斑、裁切线、状态数字
  - 少量关键数据浮层
- 底部状态条从多个框改为一条横向精密仪表条。

### 2. Storyboard 区域降噪
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`

计划修改：
- 减少顶部大块参数表，改为更轻的 section header。
- 当前分镜详情面板变为更窄、更像 floating inspector。
- Storyboard board 背景更柔和，减少厚重边框。
- 保持 selected shot 信息可见。

### 3. ShotCard 高级化
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`

计划修改：
- 将卡片的黑色预览区从纯抽象监视器改成更具“影像预览”质感的渐变/光影画面。
- 降低卡片文字密度，保留必要技术信息。
- selected / processing / rebuilt 状态更克制，用细线、角标、状态点体现。
- hover 操作层更像小型 command palette。

### 4. 全局质感增强
受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/globals.css`

计划修改：
- 增加柔和 vignette、render surface、glass panel 等 utility。
- 保持 CSS 简洁，只使用渐变和伪元素。

## 数据流与逻辑保持
以下逻辑不改变：

1. `app/page.tsx` 持有：
   - `credits`
   - `currentTab`
   - `selectedShotNumber`
   - `activeNodeLabel`
   - `processingShotNumber`
   - `rebuiltShots`

2. `FilmGridStoryboard` 继续接收：
   - `selectedShotNumber`
   - `processingShotNumber`
   - `rebuiltShots`
   - `onSelectShot`
   - `onExecuteAction`

3. `ShotCard` 继续支持：
   - 选中状态
   - processing 状态
   - rebuilt 状态
   - prompt 复制
   - rebuild 操作

## 边界条件
- 不破坏 `npm run build`。
- 不新增外部图片，避免网络资源不稳定。
- 不新增 package 依赖。
- 移动端保持可读，首屏在小屏幕自动堆叠。
- 本地 dev server 当前可能正在运行，执行构建前需要停止，避免 `.next/trace` 被占用。

## 预期结果
完成后应达到：

- 首屏更有高级影像工具的视觉冲击力。
- 页面从“功能堆叠”变成“高端创作工作台”。
- 分镜区域更清爽，卡片更像可操作的影像资产。
- 保留全部现有交互功能。
- 构建通过，本地可访问，推送 GitHub。