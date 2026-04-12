# 俄罗斯方块（Tetris）Excel 游戏详细设计

- 日期：2026-04-12
- 项目：`excel-aim-trainer`
- 设计目标：为现有 Excel 合辑补齐“整理混乱、稳定心流、刷分控场”的第二个核心 arcade 模块
- 设计阶段：实施前详细设计

---

## 1. 设计摘要

俄罗斯方块将作为 **Sheet11** 独立接入当前工作簿体系，承担与贪吃蛇不同的节奏角色：不是短促冒险，而是持续整理、维持秩序、追求稳定高分的中局体验。

它必须遵守当前项目的几个硬约束：

- 仍然是工作簿中的一个 sheet，不是脱离壳层的全屏游戏
- 仍使用 `ExcelHeader`、`SheetTabs`、`StatusBar`、Hub 作为统一框架
- 状态层与渲染层必须分离，便于测试和后续玩法扩展
- 首版优先做“清楚、可玩、能扩”，不强求一次性做到竞技级 guideline 全量细节

---

## 2. 模块定位

### 2.1 在合辑中的角色

| 模块 | 情绪定位 | 局时 | 节奏 | 核心快感 |
| --- | --- | --- | --- | --- |
| 贪吃蛇 | 上头 / 风险 | 2~5 分钟 | 累积压力 | 长度增长 |
| 俄罗斯方块 | 整理 / 控场 | 3~8 分钟 | 稳定心流 | 消行与清场 |

### 2.2 俄罗斯方块的价值

- 提供比 Snake 更强的“结构优化”感
- 为 Hub 带来另一个长期高分模块
- 非常适合 Excel 包装，因为“整理表格”和“消除堆积”语义贴合
- 可自然接入后续成就，如四连消、连消、净表专家

---

## 3. 主题包装

### 3.1 Excel 语义映射

| 俄罗斯方块概念 | Excel 语义包装 | 表现方式 |
| --- | --- | --- |
| 方块 | 待整理数据块 | 不同格式的单元格块 |
| 落下 | 数据导入 / 下压堆积 | 表格顶部进入工作区 |
| 消行 | 整行清理完成 | 一整行被格式化并清空 |
| 堆高 | 待办积压 | 压力增加 |
| 顶死 | 表格溢出 | `#SPILL!` / `超出打印区域` |
| Hold | 暂存区 | 缓存块 |
| Next Queue | 待处理队列 | 右侧任务列表 |
| Hard Drop | 一键归档 | 快速落底 |

### 3.2 公式栏文案建议

- 待开始：`=待整理数据块已装载`
- 游戏中：`=堆积处理中 | 消行 {lines} | 等级 {level}`
- 连消：`=连续整理 +{combo}`
- 四连消：`=整表清空效率极高`
- 顶死：`=#SPILL! 待整理区域已溢出`
- 暂停：`=处理流程暂停中`

### 3.3 状态栏文案建议

应显示：

- 当前状态
- 分数
- 已消除行数
- 当前等级
- 模式

这同样要求状态栏从练枪专用字段升级为通用 summary 模型。

---

## 4. 玩家目标与核心循环

### 4.1 主要玩家动作

玩家持续做的是：**通过旋转、平移、预判和保留，将不断掉落的数据块整理成完整行并清除，避免堆积触顶。**

### 4.2 核心循环

1. 新方块从上方生成
2. 玩家移动、旋转、下压
3. 方块锁定到底部或既有堆叠上
4. 若形成完整行，则清除并加分
5. 清行越多、等级越高，速度越快
6. 玩家在越来越高的压力下继续控场
7. 触顶则失败，进入结算

### 4.3 情绪曲线

- 开局：建立秩序
- 中局：开始规划地形
- 后段：速度和堆高带来连续决策压力
- 高水平时：进入“清理一切都在手里”的稳定心流

---

## 5. 页面与布局设计

### 5.1 Sheet 接入

- Sheet id：`tetris`
- Label：`Sheet11`
- Icon：`🧱`
- 标题：`俄罗斯方块`

### 5.2 页面结构

```text
TetrisSheet
├─ TetrisToolbarRow
│  ├─ ModeSelector
│  ├─ RestartButton
│  ├─ PauseButton
│  └─ ExitButton
├─ TetrisMainArea
│  ├─ TetrisInfoPanelLeft
│  │  ├─ HoldPanel
│  │  └─ ControlLegend
│  ├─ TetrisBoard
│  └─ TetrisInfoPanelRight
│     ├─ NextQueuePanel
│     ├─ TetrisHud
│     └─ GoalPanel
└─ TetrisOverlay
```

### 5.3 布局原则

- 主棋盘必须绝对视觉中心
- `Hold` 和 `Next Queue` 不可挤压主棋盘
- HUD 信息应分列，不堆在棋盘顶部
- 开始 / 暂停 / 失败使用覆盖层，避免模态框打断节奏

---

## 6. 棋盘规格

### 6.1 主棋盘

- 宽：10 列
- 高：20 可见行
- 顶部隐藏生成区：2 行

### 6.2 辅助区域

- Hold：显示 1 个暂存块
- Next Queue：显示未来 5 个块

### 6.3 渲染策略

首版继续使用 **DOM/CSS Grid**：

- 主棋盘 10x20，仅 200 个可见格
- Hold 和 Next 都是小矩阵
- CSS class 足以表达 ghost、locked、active、clear 等状态

不建议首版就上 Canvas，因为：

- 当前项目整体就是 Excel DOM 壳
- DOM 更容易和现有工作簿气质一致
- 测试成本更低

---

## 7. 模式设计

### 7.1 首版模式

#### Marathon

- 经典持续模式
- 随等级提升速度
- 以生存与高分为主
- 首版默认模式

#### Sprint 40L

- 目标是尽快消除 40 行
- 以时间为核心指标

#### Ultra

- 固定 120 秒
- 追求极限得分

建议实施顺序：

1. Marathon
2. Sprint
3. Ultra

### 7.2 首版不做的竞技特性

首版不强求完整竞技级手感参数，但要预留扩展：

- 复杂 DAS / ARR 自定义
- 完整 T-Spin 判定与展示
- Garbage / 对战
- 可配置输入重映射 UI

---

## 8. 输入与交互模型

### 8.1 键盘映射

| 键位 | 动作 |
| --- | --- |
| `ArrowLeft` / `A` | 左移 |
| `ArrowRight` / `D` | 右移 |
| `ArrowDown` / `S` | 软降 |
| `Space` | 硬降 |
| `ArrowUp` / `X` | 顺时针旋转 |
| `Z` | 逆时针旋转 |
| `C` / `Shift` | Hold |
| `P` | 暂停 |
| `R` | 重开 |
| `Esc` | 返回 Hub 或触发外层隐藏逻辑 |

### 8.2 输入原则

- 输入动作映射在一个文件里集中定义
- 旋转逻辑只调状态层 API，不在组件里写规则
- 每帧读输入，每 tick 更新状态

### 8.3 首版手感要求

- 左右移动要及时
- 旋转优先级高于自动下落
- 硬降必须瞬时完成
- Hold 每个落块周期只能使用一次

---

## 9. 状态机设计

### 9.1 游戏状态

```ts
export type TetrisStatus = 'idle' | 'playing' | 'paused' | 'line_clear' | 'dead' | 'finished';
```

### 9.2 状态转移

```text
idle --(开始)--> playing
playing --(P)--> paused
paused --(P)--> playing
playing --(完成消行动画)--> playing
playing --(触顶)--> dead
playing --(Sprint/Ultra 达成条件)--> finished
dead --(R/Space)--> idle
finished --(R/Space)--> idle
```

### 9.3 失败条件

- 新块生成时与既有矩阵重叠
- 或锁定后堆高进入生成区并无法合法继续

失败原因统一可显示为：

- `overflow`
- `spawn_blocked`

---

## 10. 方块系统设计

### 10.1 方块类型

```ts
export type TetrominoKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
```

### 10.2 生成机制

首版使用 **7-bag**，避免随机过度失衡。

理由：

- 更符合玩家预期
- 好调试
- 更适合长期玩

### 10.3 旋转系统

首版建议使用 **简化 SRS**：

- 支持基本墙踢
- 先不要为了 T-Spin 做过重规则展示
- 数据结构上保留旋转结果和 clear type 字段，便于后续升级

### 10.4 落地与锁定

需要明确：

- 自动下落间隔
- 落地后短锁定延迟
- 玩家移动 / 旋转可在锁定前微调
- 硬降直接锁定

首版可采用保守方案：

- 有限 lock delay
- 不做过度复杂 reset 逻辑

---

## 11. 数据结构设计

### 11.1 核心类型

```ts
export type RotationState = 0 | 1 | 2 | 3;

export type MatrixCell = {
  kind: TetrominoKind;
  locked: boolean;
};

export type ActivePiece = {
  kind: TetrominoKind;
  row: number;
  col: number;
  rotation: RotationState;
};

export type TetrisMode = 'marathon' | 'sprint' | 'ultra';
```

### 11.2 主状态

```ts
export type TetrisBoardState = {
  rows: number;
  cols: number;
  hiddenRows: number;
  status: TetrisStatus;
  mode: TetrisMode;
  score: number;
  level: number;
  linesCleared: number;
  elapsedMs: number;
  remainingMs?: number;
  matrix: (MatrixCell | null)[][];
  activePiece: ActivePiece | null;
  ghostRow: number | null;
  holdPiece: TetrominoKind | null;
  canHold: boolean;
  nextQueue: TetrominoKind[];
  bag: TetrominoKind[];
  combo: number;
  backToBack: boolean;
  lastClearType?: 'single' | 'double' | 'triple' | 'tetris' | 'none';
};
```

### 11.3 衍生状态

通过 selector 计算：

- 当前可见矩阵
- ghost 位置
- 当前 tick 间隔
- HUD 数据
- 公式栏文案
- Sprint / Ultra 进度

---

## 12. 核心系统设计

### 12.1 tick 循环

1. 更新时间
2. 处理自动下落
3. 若碰撞则进入锁定或锁定流程
4. 锁定后写入矩阵
5. 检查完整行
6. 执行清行与计分
7. 生成下一块
8. 检查游戏是否结束

### 12.2 清行逻辑

首版必做：

- 单消
- 双消
- 三消
- 四连消

显示上建议将其作为 `lastClearType` 和 overlay / 公式栏短提示。

### 12.3 分数规则

可采用简化版：

- Single：100 x level
- Double：300 x level
- Triple：500 x level
- Tetris：800 x level
- Soft Drop：按格微量加分
- Hard Drop：按格微量加分

首版 combo 可保留但弱化展示。

### 12.4 等级与速度

Marathon：

- 每 10 行升级
- 等级越高，下落越快

Sprint：

- 不强调等级
- 强调完成时间

Ultra：

- 固定时长
- 强调单位时间效率

### 12.5 Hold 规则

- 每个方块生命周期只允许 Hold 一次
- 若 Hold 为空，则缓存当前块并生成下一个
- 若 Hold 已有块，则交换

### 12.6 Ghost Piece

建议首版就做：

- 这是 Tetris 体验的关键辅助
- 实现代价不高
- 可明显降低学习成本

---

## 13. 渲染设计

### 13.1 Excel 风格表现

每种方块不是纯霓虹游戏块，而是“不同格式的数据块”：

| 方块 | 视觉方向 |
| --- | --- |
| I | 蓝色长条，像一列高亮数据 |
| O | 黄色块，像填充完成的区域 |
| T | 紫灰块，像透视表中心块 |
| S/Z | 绿色 / 红色错位块，像异常分布 |
| J/L | 深蓝 / 橙色块，像转角区域 |

### 13.2 状态样式

| 状态 | 视觉 |
| --- | --- |
| Active Piece | 颜色最强，边框清晰 |
| Ghost Piece | 半透明轮廓 |
| Locked Cells | 稍暗但保留辨识度 |
| Clearing Line | 短暂高亮或淡出 |
| Overflow | 顶部告警色 |

### 13.3 Overlay

需要：

- `StartOverlay`
- `PauseOverlay`
- `GameOverOverlay`
- `FinishOverlay`

避免打断式 modal。

---

## 14. 组件与文件结构

### 14.1 组件结构

```text
src/components/tetris/
├─ TetrisSheet.tsx
├─ TetrisBoard.tsx
├─ TetrisHud.tsx
├─ TetrisHoldPanel.tsx
├─ TetrisNextQueue.tsx
├─ TetrisOverlay.tsx
└─ TetrisSummaryCard.tsx
```

### 14.2 状态与工具结构

```text
src/features/tetris/
├─ tetrisTypes.ts
├─ tetrisPieceRegistry.ts
├─ tetrisRotation.ts
├─ tetrisBoardState.ts
├─ tetrisSelectors.ts
└─ tetrisUtils.ts
```

### 14.3 职责划分

| 文件/组件 | 职责 |
| --- | --- |
| `tetrisBoardState.ts` | 纯状态推进，含生成、碰撞、旋转、锁定、清行 |
| `tetrisRotation.ts` | 旋转和墙踢规则 |
| `tetrisSelectors.ts` | 公式栏/HUD/结算选择器 |
| `TetrisSheet` | 输入绑定、tick 管理、与 App 交互 |
| `TetrisBoard` | 渲染矩阵、ghost、active、locked |
| `TetrisHud` | 分数、等级、行数、模式 |

---

## 15. 与现有系统的接入设计

### 15.1 Sheet 注册

需要扩展：

```ts
type AppSheetId = ... | 'snake' | 'tetris';
```

并加入：

```ts
{ id: 'tetris', label: 'Sheet11', icon: '🧱', title: '俄罗斯方块' }
```

### 15.2 App 层接入

`App.tsx` 需要：

- `ActiveArcadeGame` 扩展到 `'tetris'`
- 增加 `tetrisFormulaText`
- `titleText` 支持 `Sheet11`
- `formulaText` 支持 Tetris
- `currentSheet === 'tetris'` 时渲染 `TetrisSheet`

### 15.3 Hub 接入

需要：

- `HubGameTable` 可启动 `tetris`
- `buildHubSnapshot` 给出真实记录与状态
- `GameHub` 支持 `onStartTetris`

推荐 Hub 行数据：

```ts
{
  id: 'tetris',
  title: '俄罗斯方块',
  status: '整理中',
  bestRecord: '40L 02:18',
  todayCount: 2,
  actionLabel: '启动',
  accent: '#475569',
}
```

### 15.4 通用状态栏摘要

Tetris 建议传入：

- `primaryText`: `堆积处理中`
- `score`: 当前得分
- `secondaryMetric`: `消行 24`
- `mode`: `marathon`

---

## 16. 存档、继续与成长设计

### 16.1 首版记录

保留：

- 最高分
- 最多消行
- 最佳 40L 时间
- 今日局数

不做：

- 实时断点恢复
- 输入回放
- 完整战绩历史页

### 16.2 预留统计类型

```ts
type TetrisStats = {
  totalRuns: number;
  bestScore: number;
  bestLines: number;
  bestSprintMs?: number;
  totalTetrises: number;
  totalLinesCleared: number;
  lastPlayedAt?: string;
};
```

---

## 17. 测试设计

### 17.1 纯状态测试

必测：

- 初始状态会生成可用块和队列
- 左右移动碰撞正确
- 旋转与墙踢基本正确
- 硬降锁定正确
- 完整行能被移除
- 分数正确增加
- Hold 每块只允许一次
- 顶部阻塞导致失败
- Marathon 升级速度正确
- Sprint/Ultra 结束条件正确

### 17.2 接入测试

- `sheetRegistry` 包含 `tetris`
- Hub 可启动 `tetris`
- `App.tsx` 能路由到 `TetrisSheet`

### 17.3 选择器测试

- HUD 数值显示正确
- 公式栏文案与清行事件同步
- 结算摘要正确输出

---

## 18. 分阶段实施计划

### Phase 1：最小可玩版

1. `tetrisTypes.ts`
2. `tetrisPieceRegistry.ts`
3. `tetrisBoardState.ts`
4. 基础移动和旋转
5. 锁定与清行
6. 分数与等级
7. `TetrisBoard.tsx`
8. Sheet11 接入

### Phase 2：体验完善版

1. Hold
2. Next Queue
3. Ghost Piece
4. Pause / Restart / 结算
5. Hub 启动与记录

### Phase 3：深度版本

1. Sprint / Ultra
2. Combo / Back-to-Back
3. 更完整的旋转判定
4. 主题皮肤和跨游戏成就

---

## 19. 验收标准

- 玩家能一眼理解这是 Excel 壳下的俄罗斯方块
- 主棋盘、Hold、Next Queue 层级清晰
- 整局流程完整：生成、移动、旋转、清行、失败、重开
- 公式栏和状态栏能表达整理感与压力变化
- 与 Hub、SheetTabs、标题栏无割裂感
- 状态规则主要位于纯函数层，便于后续扩展

---

## 20. 当前结论

俄罗斯方块是继贪吃蛇之后最合适接入的 arcade 模块，但它的规则复杂度和输入精度要求都高于 Snake。因此更合理的顺序是：

1. 先做 Snake，验证新的多游戏接入流程
2. 再做 Tetris，把通用 sheet / hub / 状态栏抽象复用起来

如果按本设计推进，Tetris 首版应严格控制范围，只先完成 Marathon 的高质量版本，不要一开始就把所有竞技细节和模式同时端上来。

---

## 21. 成品化要求

Tetris 不能按“能掉方块、能消行”就算完成。作为正式模块，它必须满足以下发布标准。

### 21.1 体验底线

- 玩家必须能稳定完成一整局 Marathon
- 移动、旋转、软降、硬降、Hold 都要有可靠手感
- 清行反馈必须清楚，但不能拖慢节奏
- 失败必须明确说明是触顶/溢出，而不是突然结束
- 从 Hub 进入到返回 Hub 的整个流程要完整闭环

### 21.2 交互底线

- 局内必须同时提供键盘快捷键与可见按钮入口
- 初次进入必须能看懂 Hold、Next、Ghost 的作用
- 暂停与重开不能造成当前状态损坏
- 输入状态不能在切 sheet 后残留

### 21.3 可维护性底线

- 旋转规则与墙踢表必须独立封装
- 分数、等级、速度曲线必须集中配置
- 存档 schema 必须带版本号
- 渲染组件不得直接修改 matrix

---

## 22. 存档与统计产品规格

### 22.1 本地存档结构

```ts
type TetrisModuleStorage = {
  version: 1;
  stats: TetrisStats;
  progression: {
    unlockedModes: TetrisMode[];
    discoveredClearTypes: Array<'single' | 'double' | 'triple' | 'tetris'>;
  };
  preferences: {
    preferredMode: TetrisMode;
    showGhostPiece: boolean;
    showGrid: boolean;
    showKeyHints: boolean;
  };
  activeRun?: {
    startedAt: string;
    mode: TetrisMode;
    score: number;
    level: number;
    linesCleared: number;
    elapsedMs: number;
  };
};
```

### 22.2 正式版统计字段

```ts
type TetrisStats = {
  totalRuns: number;
  totalPlayTimeMs: number;
  bestScore: number;
  bestLines: number;
  bestSprintMs?: number;
  bestUltraScore?: number;
  totalTetrises: number;
  totalLinesCleared: number;
  maxLevelReached: number;
  lastPlayedAt?: string;
};
```

### 22.3 继续游玩策略

Tetris 的断局恢复要更保守：

- 只允许恢复 Marathon
- 仅保留最近一局
- 如果版本或旋转规则变化，自动放弃旧档
- 恢复后仍然按正式对局继续，不额外给保护

---

## 23. 成长与解锁设计

### 23.1 Tetris 内成长

正式版建议的轻成长：

- `marathon`：默认开放
- `sprint`：累计消除 30 行后解锁
- `ultra`：累计完成 5 局后解锁
- 四连消图鉴：首次达成点亮
- 主题皮肤：按成绩解锁

### 23.2 与 Hub 的共享成长

Hub 侧至少显示：

- 今日局数
- 最高分或最佳 40L
- 当前状态
- 是否存在可恢复 Marathon

建议 Hub 状态：

| 状态 | 含义 |
| --- | --- |
| `就绪` | 首次进入前 |
| `整理中` | 常规游玩期 |
| `高压` | 最近成绩进入高等级阶段 |
| `待继续` | 存在可恢复 Marathon |

### 23.3 跨游戏成就预留

- `四列清空专家`：达成第一次 Tetris
- `高压整理员`：Aim/Snake/Tetris 都达标
- `无暂停 Marathon`：整局无暂停完成高分

---

## 24. 设置系统设计

### 24.1 配置边界

Tetris 不能继续向现有通用设置里硬塞字段。它需要和 Snake 一样，放在分域设置结构里。

### 24.2 TetrisSettings

```ts
type TetrisSettings = {
  defaultMode: TetrisMode;
  showGhostPiece: boolean;
  showNextQueue: boolean;
  showHoldPanel: boolean;
  enableScreenShake: boolean;
  highContrastBoard: boolean;
  reducedMotion: boolean;
};
```

### 24.3 设置入口

- 局内快捷设置：Ghost、Next、Restart、Pause
- 配置中心完整设置：视觉、提示、无障碍

---

## 25. 新手引导与回流设计

### 25.1 首次引导

Tetris 首次进入必须说明三件事：

1. 左右移动与旋转
2. 凑满一行会清除
3. `C` 可 Hold，`Space` 可硬降

引导要求：

- 不超过 3 步
- 不使用重模态
- 首局后可关闭长期显示

### 25.2 失败后回流

Game Over 覆盖层必须包含：

- `再来一局`
- `返回 Hub`
- `查看记录`

若刷新记录，需要明确显示：

- 新最高分
- 新最高消行
- 首次四连消

---

## 26. 平衡参数表

### 26.1 Marathon 速度曲线

| 等级 | 下落间隔建议 |
| --- | --- |
| 1 | 900ms |
| 2 | 750ms |
| 3 | 620ms |
| 4 | 500ms |
| 5 | 400ms |
| 6+ | 按指数递减微调 |

### 26.2 分数参数

| 行数 | 分数 |
| --- | --- |
| Single | 100 x level |
| Double | 300 x level |
| Triple | 500 x level |
| Tetris | 800 x level |

额外：

- Soft Drop：每格少量分
- Hard Drop：每格更多分

### 26.3 首发模式数量控制

正式版首发最多 2 个模式对外开放更稳妥：

- `marathon`
- `sprint`

`ultra` 可以作为首发后第一轮内容更新，而不是硬塞进 v1。

---

## 27. 性能、适配与可访问性

### 27.1 性能要求

- 主棋盘更新不能带动整页重排
- Ghost、Next、Hold 的刷新代价必须可控
- 清行动画不能造成输入阻塞

### 27.2 响应式要求

Tetris 主要面向桌面，但要保证：

- 1366x768 桌面完整显示
- 1024 宽时左右面板可压缩
- 小屏不强撑完整体验，明确提示建议桌面

### 27.3 可访问性要求

- 高对比模式可切换
- 方块差异不能只靠颜色表达
- `Hold`、`Next`、等级提升、失败都要有文字提示
- reduced motion 时关闭抖动和强动画

---

## 28. QA 与发布门槛

### 28.1 功能测试矩阵

至少覆盖：

- Marathon 全流程
- Sprint 完成逻辑
- 7-bag 生成
- 旋转与墙踢边界
- Hold 限制
- Hard Drop
- 顶部溢出
- 存档恢复

### 28.2 回归重点

Tetris 接入后要验证没有破坏：

- Sheet 导航顺序
- Hub 启动其它游戏的能力
- Header 与 StatusBar 通用展示
- 全局隐藏逻辑和 `Esc` 行为

### 28.3 发布阻断项

以下任一存在，不能算成品：

- 旋转或碰撞判定偶发错误
- 清行后 matrix 错乱
- Hold 状态损坏
- 切出再回来后输入卡死
- 本地存档导致模块无法进入

---

## 29. 后续内容池

Tetris 稳定后再进扩展：

- 更完整的 SRS 与 T-Spin 展示
- Combo / Back-to-Back
- 主题皮肤：报表蓝、审计灰、夜班荧光
- 成就系统：四连消、低堆高通关、极速 Sprint

扩展优先级必须低于基础手感和稳定性。
