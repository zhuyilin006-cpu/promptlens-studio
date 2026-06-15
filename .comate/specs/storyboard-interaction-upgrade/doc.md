# Storyboard 交互功能增强说明

## 背景与目标
当前 PromptLens Studio 已具备 RunningHub / Lovart 风格的视觉框架、首屏控制台、分镜矩阵、算力扣减和提示词复制。但交互仍较轻：分镜卡片只能 hover、复制 prompt、触发 rebuild alert，缺少更明确的“AI 影像生产工具”操作闭环。

本轮目标是在不引入额外 UI 库、不破坏现有高级视觉风格的前提下，增加更实用的交互功能：

- 图片/分镜预览面板
- 节点编辑或节点状态选择
- 提示词详情面板
- 复制成功反馈替代 alert
- 当前选中分镜联动

## 需求拆分

### 需求 1：选中分镜与详情面板
处理逻辑：
- 用户点击某张 `ShotCard` 后，将该分镜设为当前选中分镜。
- 页面右侧或画布顶部显示当前分镜详情：编号、标题、时码、镜头运动、转场、音效、提示词。
- 详情面板应保持黑白灰/暖白工具台风格。

受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`

预期结果：
- 用户可直观看到当前正在操作的分镜。
- Storyboard 不再只是静态列表。

### 需求 2：提示词详情与复制反馈
处理逻辑：
- 将 `ShotCard` 中的 `alert` 改为组件内状态反馈，例如按钮文字短暂变为 `COPIED`。
- 提示词复制失败时不抛异常，显示 `COPY FAILED` 或静默失败。
- 详情面板中也提供复制完整 prompt 的按钮。

受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`

预期结果：
- 去除浏览器 alert，交互更像专业工具。
- 复制反馈更高级、更克制。

### 需求 3：节点状态交互
处理逻辑：
- 当前 `workflowNodes` 是静态数组。
- 将节点状态变为可点击选择，用户可在 `workflow` Tab 中点击节点。
- 选中节点后在节点面板内显示节点详情，如 label、title、meta、status。
- 不做真实后端请求，只做前端状态联动。

受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`

预期结果：
- Workflow Tab 具备基础交互，而不是静态展示。
- 更接近 RunningHub / ComfyUI 节点工具体验。

### 需求 4：模拟重绘状态
处理逻辑：
- 点击 `Rebuild Frame` 时，扣减算力并让分镜进入短暂 `PROCESSING` 状态。
- 约 900ms 后恢复 `READY` 或 `REBUILT`。
- 不调用真实 API。
- 如果算力为 0，不再扣减，可显示 `NO CREDIT` 状态。

受影响文件：
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/app/page.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/FilmGridStoryboard.tsx`
- `/c:/Users/zhuyilin/Desktop/WorkBy/promptlens-studio/components/tvc/ShotCard.tsx`

预期结果：
- 重绘按钮有明确反馈。
- 算力系统与分镜操作形成更完整闭环。

## 技术方案

### 类型与状态
建议在 `app/page.tsx` 中新增状态：

```ts
const [selectedShotNumber, setSelectedShotNumber] = useState(mockStoryboardData.shots[0].shot_number);
const [activeNodeLabel, setActiveNodeLabel] = useState(workflowNodes[0].label);
const [processingShotNumber, setProcessingShotNumber] = useState<string | null>(null);
const [rebuiltShots, setRebuiltShots] = useState<string[]>([]);
```

### 事件流
1. `ShotCard` 点击触发 `onSelect(shot.shot_number)`。
2. `Rebuild Frame` 触发 `onAction(shot.shot_number)`。
3. `app/page.tsx` 扣减算力，设置 processing 状态。
4. `setTimeout` 后将分镜加入 rebuilt 状态。
5. `FilmGridStoryboard` 根据状态展示 selected / processing / rebuilt。

### 组件接口调整
`FilmGridStoryboardProps` 增加：

```ts
selectedShotNumber: string;
processingShotNumber: string | null;
rebuiltShots: string[];
onSelectShot: (shotNumber: string) => void;
onExecuteAction: (shotNumber: string) => void;
```

`ShotCardProps` 增加：

```ts
selected: boolean;
processing: boolean;
rebuilt: boolean;
onSelect: () => void;
onAction: () => void;
```

## 边界条件
- `navigator.clipboard` 不存在时不抛错。
- `setTimeout` 操作不依赖组件卸载后的复杂清理，因为当前页面生命周期简单。
- 算力扣减不能低于 0。
- 分镜数据为空时，详情面板应避免访问 undefined；当前 mock 数据非空，但实现中应尽量安全。

## 预期结果
完成后页面应具备：
- 可选中分镜
- 分镜详情面板
- 专业化复制反馈
- 节点点击与节点详情展示
- 模拟重绘 processing / rebuilt 状态
- 构建通过并推送 GitHub