# 贪吃蛇（Snake）Excel 游戏详细设计

- 日期：2026-04-12
- 项目：`excel-aim-trainer`
- 设计目标：把贪吃蛇接入现有 Excel 风格游戏合辑，作为第一个“短局、上头、可反复开一把”的非练枪类 arcade 模块
- 设计阶段：实施前详细设计

---

## 1. 设计摘要

贪吃蛇将作为 **Sheet10** 独立接入当前工作簿体系，定位为“高频短局循环”的轻中度 arcade 游戏。它不是单独开页的新产品，而是现有 Excel 工作簿宇宙中的一个工作表模块，必须沿用标题栏、公式栏、状态栏、SheetTabs 和 Hub 的信息架构。

核心体验是：

- 3 秒可理解
- 1 分钟内可上手
- 2 到 5 分钟一局
- 死亡后有强烈“再来一把”冲动

项目上下文约束：

- 现有壳层已经固定：`ExcelHeader`、`SheetTabs`、`StatusBar`、`GameHub`
- Hub 已预留 `snake` 占位，但当前仍是“筹备中”
- 当前项目偏向“Excel 外壳 + 多游戏并存”，不是单纯复刻一个经典游戏
- 现阶段优先实现稳定、清晰、好接入，不优先追求花哨特效

---

## 2. 模块定位

### 2.1 在游戏合辑中的角色

| 模块 | 情绪定位 | 局时 | 节奏 | 主要刺激 |
| --- | --- | --- | --- | --- |
| 练枪 | 热手 / 反应 | 0.5~2 分钟 | 高频点击 | 命中反馈 |
| 贪吃蛇 | 上头 / 冒险 | 2~5 分钟 | 稳定推进 | 长度增长、风险累积 |
| 俄罗斯方块 | 整理 / 心流 | 3~8 分钟 | 持续整理 | 消行、控场 |
| 拼豆 | 治愈 / 收集 | 5~20 分钟 | 低压慢节奏 | 完成度 |
| PvZ | 防线 / 经营 | 5~10 分钟 | 波次推进 | 资源与布阵 |

### 2.2 贪吃蛇的价值

- 让合辑从“练枪 + 内容页”变成真正的多玩法工作簿
- 提供与练枪完全不同的输入方式和情绪曲线
- 为后续跨游戏成就、主题和 Hub 成长系统提供新的记录维度

---

## 3. 主题包装

### 3.1 Excel 语义映射

| 贪吃蛇概念 | Excel 语义包装 | 表现方式 |
| --- | --- | --- |
| 蛇头 | 当前活动单元格 | 强高亮格，带方向指示 |
| 蛇身 | 数据流 / 引用链 | 一串连续被访问过的格子 |
| 食物 | 数据单元格 / 异常值 / 工位奖励 | 数字、货币、符号、错误值 |
| 撞墙 | 引用越界 | `#REF!` |
| 撞自己 | 循环引用 | `循环引用警告` |
| 障碍物 | 合并单元格 / 冻结区域 / 筛选区 | 不可进入格 |
| 加速 | F5 刷新 | 短时间提速 |
| 暂停 | 编辑中 / 保护视图 | 覆盖层 |

### 3.2 公式栏文案风格

公式栏不是说明书，而是轻量、带戏谑感的系统口吻。

建议文案：

- 待开始：`=数据流待激活`
- 游戏中：`=数据流稳定 | 长度 {length} | 分数 {score}`
- 暂停：`=数据流暂停中`
- 死亡：`=#REF! 数据流中断 | 原因: {reason}`
- 连吃奖励：`=连续吸收 +{value}`
- 加速：`=F5 刷新提速中 ({remaining}s)`

### 3.3 状态栏文案

状态栏应显示：

- 当前状态：就绪 / 运行中 / 暂停 / 已中断
- 当前选中格
- 分数
- 长度
- 模式

这意味着现有 `StatusBar` 需要从“练枪专用结构”提升为“多游戏通用状态结构”。

---

## 4. 玩家目标与核心循环

### 4.1 主要玩家动作

玩家持续做一件事：**在 Excel 网格中规划路径，让数据流越来越长，同时避免越界、循环和障碍物。**

### 4.2 核心循环

1. 开局进入待开始状态
2. 玩家按方向键触发首个移动
3. 蛇在固定 tick 下推进
4. 吃到普通或特殊食物，长度、分数和局势发生变化
5. 场面逐渐变复杂，玩家承担更高路径规划压力
6. 撞墙 / 撞自己 / 撞障碍，进入结算
7. 玩家立刻重开或返回 Hub

### 4.3 情绪曲线

- 前 15 秒：轻松、清楚、可控
- 中段：开始拥挤，出现路线决策压力
- 后段：每一步都在赌
- 死亡后：明确显示原因，鼓励秒开下一把

---

## 5. 页面与布局设计

## 5.1 Sheet 接入

- Sheet id：`snake`
- Label：`Sheet10`
- Icon：`🐍`
- 标题：`贪吃蛇`

### 5.2 入口路径

| 场景 | 入口 |
| --- | --- |
| Hub 点击“启动” | 进入 `Sheet10` |
| Hub 随机游戏 | 可抽中 `snake` |
| 后续继续游玩 | 若支持断局快照，可从 Hub 继续 |

### 5.3 页面结构

贪吃蛇页保持与当前其它 sheet 一致，不做全屏接管。

```text
SnakeSheet
├─ SnakeToolbarRow
│  ├─ ModeSelector
│  ├─ DifficultySelector
│  ├─ RestartButton
│  └─ ExitButton
├─ SnakeMainArea
│  ├─ SnakeBoard
│  └─ SnakeSidePanel
│     ├─ SnakeHud
│     ├─ SnakeLegend
│     └─ SnakeTips
└─ SnakeOverlay
```

### 5.4 布局原则

- 棋盘是视觉中心
- 右侧信息面板较窄，避免抢戏
- HUD 不要覆盖主棋盘
- 开始 / 暂停 / 死亡状态通过覆盖层表达，而不是弹窗

---

## 6. 棋盘规格

### 6.1 首版推荐规格

- 行数：15
- 列数：20
- 总格数：300
- 单格显示：1 个字符或短标签

选择理由：

- 能复用现有 Excel 风格网格表达
- DOM 渲染成本可控
- 对路径规划已有足够压力
- 不会在窄屏上立刻崩掉

### 6.2 渲染策略

首版推荐继续使用 **DOM/CSS 网格**，不引入 Canvas。

原因：

- 300 格规模不大
- 当前项目本身就是“Excel 格子 UI”
- DOM 更容易和现有选中态、标题栏、公式栏、状态栏同步
- 调试和测试更容易

后续若要加入大量动态障碍、残影和复杂事件，再考虑局部 Canvas 特效层。

---

## 7. 模式设计

### 7.1 首发模式

#### 经典模式 `classic`

- 无限时
- 吃得越多越长
- 撞墙、撞自己、撞障碍即失败
- 最适合第一版

#### 限时模式 `timed`

- 60 秒 / 120 秒
- 以限时内分数为目标
- 时间结束自动结算

#### 挑战模式 `challenge`

- 带固定或随机障碍
- 特殊事件概率更高
- 更适合后续拉长玩法寿命

### 7.2 难度档位

| 难度 | 基础 tick | 特点 |
| --- | --- | --- |
| easy | 220ms | 入门，便于熟悉包装和规则 |
| normal | 180ms | 默认 |
| hard | 140ms | 明显更紧张 |

后续可加 `expert`，但首版不建议开放太多档位。

---

## 8. 食物与事件设计

### 8.1 食物类型

| 类型 | 显示 | 分数 | 效果 | 首版优先级 |
| --- | --- | --- | --- | --- |
| 普通数字 | `1` `2` `3` | 10 | 增长 1 | 必做 |
| 摸鱼币 | `¥` | 50 | 增加额外分数 | 必做 |
| 咖啡 | `☕` | 30 | 3 秒加速 | 推荐 |
| 黄金单元格 | `★` | 100 | 高价值奖励 | 推荐 |
| `#N/A` | `#N/A` | 80 | 视觉闪烁 | 后续 |
| `#DIV/0!` | `#DIV/0!` | 60 | 短暂扰动 | 后续 |
| 会议邀请 | `📩` | 0 | 3 秒遮挡区域 | 后续 |

### 8.2 首版生成策略

- 地图上同一时间只维持 1 个主要食物
- 普通食物为主，特殊食物为低概率替换
- 食物不能生成在蛇身、障碍物和蛇头上

建议概率：

- 普通数字：60%
- 摸鱼币：15%
- 咖啡：10%
- 黄金单元格：5%
- 错误值类：10%

### 8.3 事件系统范围

首版只做轻量事件，不做复杂脚本事件。

首版保留：

- 加速效果
- 死亡原因区分
- 简单视觉提示

后续再加入：

- 会议遮挡
- 审计巡查
- 冻结窗格障碍
- 筛选区移动障碍

---

## 9. 输入与交互模型

### 9.1 键盘映射

| 键位 | 动作 |
| --- | --- |
| `ArrowUp` / `W` | 向上 |
| `ArrowDown` / `S` | 向下 |
| `ArrowLeft` / `A` | 向左 |
| `ArrowRight` / `D` | 向右 |
| `P` | 暂停 / 继续 |
| `Space` | 死亡后重开 |
| `R` | 立即重开 |
| `F5` | 临时加速 |
| `Esc` | 返回 Hub 或触发工作簿层隐藏逻辑 |

### 9.2 输入规则

- 不允许 180 度立即反向
- `nextDirection` 与 `direction` 分离，避免多次连按导致穿模
- 每 tick 只消费一次方向变化

### 9.3 鼠标交互

首版不是必须项。

若后续做：

- 点击相邻格可设定方向
- 点击 HUD 按钮可暂停 / 重开 / 返回

---

## 10. 状态机设计

### 10.1 游戏状态

```ts
export type SnakeStatus = 'idle' | 'playing' | 'paused' | 'dead' | 'finished';
```

### 10.2 状态转移

```text
idle --(方向键/开始按钮)--> playing
playing --(P)--> paused
paused --(P)--> playing
playing --(撞墙/撞自己/撞障碍)--> dead
playing --(限时结束)--> finished
dead --(Space/R)--> idle
finished --(Space/R)--> idle
```

### 10.3 死亡原因

```ts
export type SnakeDeathReason =
  | 'wall'
  | 'self'
  | 'obstacle'
  | 'timeout'
  | 'meeting';
```

---

## 11. 数据结构设计

### 11.1 类型定义

```ts
export type Direction = 'up' | 'down' | 'left' | 'right';

export type SnakeCell = {
  row: number;
  col: number;
};

export type SnakeSegment = SnakeCell & {
  segmentType: 'head' | 'body' | 'tail';
};

export type FoodKind =
  | 'normal'
  | 'coin'
  | 'coffee'
  | 'gold'
  | 'error_na'
  | 'error_div'
  | 'meeting';

export type FoodCell = SnakeCell & {
  kind: FoodKind;
  value: number;
  label: string;
};

export type ObstacleKind =
  | 'wall'
  | 'frozen'
  | 'merged'
  | 'filtered';

export type ObstacleCell = SnakeCell & {
  kind: ObstacleKind;
};

export type SnakeMode = 'classic' | 'timed' | 'challenge';
export type SnakeDifficulty = 'easy' | 'normal' | 'hard';
```

### 11.2 棋盘状态

```ts
export type SnakeBoardState = {
  rows: number;
  cols: number;
  status: SnakeStatus;
  mode: SnakeMode;
  difficulty: SnakeDifficulty;
  score: number;
  length: number;
  elapsedMs: number;
  remainingMs?: number;
  snake: {
    segments: SnakeSegment[];
    direction: Direction;
    nextDirection: Direction;
    growBy: number;
  };
  foods: FoodCell[];
  obstacles: ObstacleCell[];
  speedBoostMs: number;
  deathReason?: SnakeDeathReason;
  streak: number;
  lastFoodKind?: FoodKind;
};
```

### 11.3 UI 衍生状态

不建议把这些写回核心状态，而是通过 selector 计算：

- 当前蛇头位置
- 下个 tick 间隔
- 是否处于加速期
- 当前公式栏文案
- 右侧 HUD 展示文案
- 结算摘要

---

## 12. 核心系统设计

### 12.1 tick 循环

基础循环：

1. 消费输入，更新 `nextDirection`
2. 计算蛇头下一格
3. 检查碰撞
4. 若命中食物，处理得分、增长、效果
5. 若未命中食物，移动蛇尾
6. 更新计时器、加速状态、限时状态
7. 生成新食物

### 12.2 移动规则

- 新蛇头插入到 segments 头部
- 若 `growBy > 0`，则保留尾巴并减少 `growBy`
- 若 `growBy === 0`，则删除尾部一个 segment

### 12.3 碰撞检测顺序

1. 边界
2. 障碍物
3. 自身
4. 食物

顺序固定，避免多个结果冲突。

### 12.4 分数规则

建议首版：

- 普通数字：10
- 摸鱼币：50
- 咖啡：30
- 黄金单元格：100

额外奖励：

- 连续吃到特殊食物可加 streak
- streak 暂不直接给乘数，只用于 HUD 与后续成就

### 12.5 加速系统

两种加速来源：

- 手动 `F5`
- 吃到咖啡

实现原则：

- 不改 base difficulty
- 只在 `speedBoostMs > 0` 时使用更短 tick
- 避免多个加速叠出不可控速度

### 12.6 障碍系统

首版 challenge 模式可使用固定障碍模板：

- 中央合并区域
- 四角冻结窗格
- 若干筛选块

这样比完全随机更利于测试和平衡。

---

## 13. 渲染设计

### 13.1 格子表现

| 元素 | 颜色 | 说明 |
| --- | --- | --- |
| 蛇头 | `#16a34a` | 最亮、带方向箭头 |
| 蛇身 | `#4ade80` | 一致流动感 |
| 蛇尾 | `#bbf7d0` | 更淡 |
| 普通食物 | `#2563eb` | 数字值 |
| 摸鱼币 | `#f59e0b` | 高价值奖励 |
| 咖啡 | `#92400e` | 功能性食物 |
| 黄金 | `#fbbf24` | 稀有奖励 |
| 错误值 | `#dc2626` | 风险感 |
| 障碍 | `#94a3b8` | 不与蛇或食物混淆 |

### 13.2 视觉反馈

首版建议保留低成本、高辨识反馈：

- 吃到食物：目标格闪烁 1 次
- 加速中：蛇头外缘发光或轻微脉冲
- 死亡：蛇头变红，并出现原因文案
- 暂停：覆盖层压暗主棋盘

### 13.3 Overlay 设计

需要三个覆盖态：

- `StartOverlay`
- `PauseOverlay`
- `DeathOverlay`

必须为非模态，不脱离 sheet 结构。

---

## 14. 组件与文件结构

### 14.1 组件结构

```text
src/components/snake/
├─ SnakeSheet.tsx
├─ SnakeBoard.tsx
├─ SnakeHud.tsx
├─ SnakeLegend.tsx
├─ SnakeOverlay.tsx
└─ SnakeSummaryCard.tsx
```

### 14.2 状态与工具结构

```text
src/features/snake/
├─ snakeTypes.ts
├─ snakeFoodRegistry.ts
├─ snakeObstacleRegistry.ts
├─ snakeBoardState.ts
├─ snakeSelectors.ts
└─ snakeUtils.ts
```

### 14.3 组件职责

| 组件 | 职责 |
| --- | --- |
| `SnakeSheet` | 管理整页状态、tick、输入绑定、与 App 通信 |
| `SnakeBoard` | 渲染棋盘格与元素 |
| `SnakeHud` | 显示分数、长度、时间、模式、按钮 |
| `SnakeLegend` | 显示食物说明和快捷键 |
| `SnakeOverlay` | 开始、暂停、死亡覆盖层 |

### 14.4 纯状态层职责

| 文件 | 职责 |
| --- | --- |
| `snakeBoardState.ts` | 纯函数，负责创建 state、tick、转向、碰撞、吃食物 |
| `snakeSelectors.ts` | 公式栏文案、HUD 文案、统计摘要 |
| `snakeFoodRegistry.ts` | 食物定义、分数、标签、概率 |
| `snakeObstacleRegistry.ts` | challenge 模式障碍模板 |

---

## 15. 与现有系统的接入设计

### 15.1 Sheet 注册

需要扩展：

```ts
type AppSheetId =
  | 'hub'
  | 'game'
  | 'stats'
  | 'settings'
  | 'config'
  | 'perler'
  | 'pvz'
  | 'pvz_collection'
  | 'pvz_lab'
  | 'snake';
```

并在 `SHEET_REGISTRY` 中加入：

```ts
{ id: 'snake', label: 'Sheet10', icon: '🐍', title: '贪吃蛇' }
```

### 15.2 App 层接入

`App.tsx` 需要：

- `ActiveArcadeGame` 扩展到 `'snake'`
- 增加 `snakeFormulaText`
- `titleText` 支持 `Sheet10`
- `formulaText` 支持 Snake 文案
- `currentSheet === 'snake'` 时渲染 `SnakeSheet`

### 15.3 Hub 接入

需要把当前“筹备中”改为真实可启动：

- `HubGameTable` 的可用游戏列表加入 `snake`
- `buildHubSnapshot` 为 `snake` 提供真实状态字段
- `GameHub` 支持 `onStartSnake`

推荐 Hub 行数据：

```ts
{
  id: 'snake',
  title: '贪吃蛇',
  status: '数据流',
  bestRecord: '最长 18',
  todayCount: 3,
  actionLabel: '启动',
  accent: '#0ea5e9',
}
```

### 15.4 状态栏适配

现有 `StatusBar` 只认练枪的 `score/combo/mode`。

建议抽象成：

```ts
type WorkbookStatusSummary = {
  isPlaying: boolean;
  primaryText: string;
  score?: number;
  secondaryMetric?: string;
  mode?: string;
};
```

Snake 可传：

- `primaryText`: `数据流运行中`
- `score`: 当前分数
- `secondaryMetric`: `长度 12`
- `mode`: `classic`

---

## 16. 存档、继续与成长设计

### 16.1 首版建议

首版不做复杂中断恢复，只做基础历史记录。

保留：

- 最高分
- 最长长度
- 今日局数

不做：

- 精确断点恢复
- 每局回放
- 复杂成就树

### 16.2 为后续预留的记录字段

```ts
type SnakeStats = {
  totalRuns: number;
  bestScore: number;
  bestLength: number;
  totalFoodsEaten: number;
  bestStreak: number;
  lastPlayedAt?: string;
};
```

---

## 17. 测试设计

### 17.1 纯状态测试

必测：

- 初始化状态正确
- 首次方向输入能启动游戏
- 不能立即反向
- 吃到食物后长度增加
- 撞墙死亡
- 撞自己死亡
- 障碍物碰撞死亡
- 限时结束结算
- 加速状态会恢复

### 17.2 选择器测试

- 公式栏文案随状态变化
- HUD 数值格式正确
- 结算摘要输出正确

### 17.3 接入测试

- `sheetRegistry` 包含 `snake`
- Hub 可启动 `snake`
- `App.tsx` 路由到 `SnakeSheet`

---

## 18. 分阶段实施计划

### Phase 1：最小可玩版本

1. `snakeTypes.ts`
2. `snakeBoardState.ts`
3. `SnakeBoard.tsx`
4. 键盘输入
5. 普通食物
6. 撞墙 / 撞自己
7. 分数、长度、重开
8. Sheet10 接入

### Phase 2：可留存版本

1. 特殊食物
2. 右侧 HUD
3. 死亡原因
4. challenge 模式障碍
5. Hub 行状态更新
6. 统计记录

### Phase 3：增强版本

1. 会议遮挡事件
2. 工位主题化反馈
3. 更丰富的公式栏吐槽
4. 断局继续
5. 跨游戏成就联动

---

## 19. 验收标准

- 玩家进入 Sheet10 后能看懂“这是 Excel 里的贪吃蛇”
- 棋盘、公式栏、状态栏和 SheetTabs 都与现有工作簿一致
- 玩家可仅靠键盘完成一整局
- 死亡原因清楚，不会让人疑惑
- Hub 可以真实启动游戏，而不是停留在占位态
- 代码结构遵守“状态层纯函数，渲染层只读状态”的边界

---

## 20. 当前结论

贪吃蛇适合作为下一步直接实施的模块，原因是：

- 与当前 Excel 格子 UI 天然相容
- 状态系统复杂度低于俄罗斯方块和 PvZ
- 能最快把 Hub 中的占位入口变成真实可玩内容
- 既能补足多游戏认知，也不会大幅打断现有架构

如果按本设计推进，建议优先完成 `Phase 1`，先让 `Sheet10` 跑通，再补 Hub、统计和特殊事件。

---

## 21. 成品化要求

这部分不是“可以以后再补”的优化项，而是 Snake 作为正式模块上线前必须满足的产品要求。

### 21.1 体验底线

- 默认进游戏后 3 秒内理解操作
- 键盘操作必须稳定，无丢输入感
- 死亡必须让玩家明确知道原因，而不是只看到失败
- 从 Hub 启动、游玩、结算、返回 Hub 的流程必须完整闭环
- 不允许出现“只能刷新页面恢复”的卡死状态

### 21.2 交互底线

- 启动、暂停、重开、退出都必须有明确按钮和快捷键双通路
- 首次进入必须有轻量引导，不依赖用户先读文档
- 任一覆盖层都不能挡死核心操作
- `Esc` 的行为必须统一定义：
  - 游戏运行中：优先触发工作簿级隐藏逻辑
  - 暂停/死亡态：允许返回 Hub

### 21.3 可维护性底线

- 游戏规则只能在纯状态层中实现
- UI 组件不能直接修改游戏数组或 tick
- 本地存档 schema 必须带版本号
- 所有概率、速度、分数系数必须集中在 registry/config，而不是散落在组件

---

## 22. 存档与统计产品规格

### 22.1 本地存档策略

Snake 不能只记一个最高分，正式版至少要有完整的模块存档对象：

```ts
type SnakeModuleStorage = {
  version: 1;
  stats: SnakeStats;
  progression: {
    unlockedModes: SnakeMode[];
    unlockedDifficulties: SnakeDifficulty[];
    discoveredFoodKinds: FoodKind[];
  };
  preferences: {
    preferredMode: SnakeMode;
    preferredDifficulty: SnakeDifficulty;
    showHints: boolean;
    showGridCoordinates: boolean;
  };
  activeRun?: {
    startedAt: string;
    mode: SnakeMode;
    difficulty: SnakeDifficulty;
    score: number;
    length: number;
    elapsedMs: number;
  };
};
```

### 22.2 正式版统计字段

```ts
type SnakeStats = {
  totalRuns: number;
  totalPlayTimeMs: number;
  bestScore: number;
  bestLength: number;
  totalFoodsEaten: number;
  totalSpecialFoodsEaten: number;
  bestStreak: number;
  deathsByReason: Record<SnakeDeathReason, number>;
  modeBestScores: Partial<Record<SnakeMode, number>>;
  lastPlayedAt?: string;
};
```

### 22.3 继续游玩策略

正式版建议支持轻量“断局继续”，但范围要收敛：

- 仅 classic/challenge 支持恢复
- 页面刷新后可恢复最近一局
- 升级版本或 schema 不兼容时自动丢弃旧局
- 不允许依赖恢复功能绕开失败结算

---

## 23. 成长与解锁设计

### 23.1 Snake 内成长

不做重 RPG，但要有清晰成长反馈。

建议解锁：

- `classic`：默认开放
- `timed`：玩满 3 局后解锁
- `challenge`：长度累计达到 50 后解锁
- 特殊食物图鉴：吃到后点亮
- 主题边框或公式栏文案包：通过成绩解锁

### 23.2 与 Hub 的共享成长

Hub 侧至少应能看到：

- 今日游玩次数
- 最佳长度
- 最佳分数
- 当前推荐入口

建议新增的 Hub 行状态：

| 状态 | 含义 |
| --- | --- |
| `就绪` | 首次进入前 |
| `数据流` | 已开始常规游玩 |
| `高压` | 最近 3 局平均长度较高 |
| `中断` | 有可恢复对局 |

### 23.3 跨游戏成就预留

- `长链处理员`：Snake 长度达到 30
- `工位全能`：Snake/Tetris/Aim 各完成 1 局
- `冷静操作`：无暂停完成一局高分 Snake

---

## 24. 设置系统设计

### 24.1 为什么不能直接塞进现有 Aim Settings

当前 [SettingsContext.tsx](C:/Users/Administrator/.trae-cn/Eexcl_dawa/src/contexts/SettingsContext.tsx) 主要围绕练枪参数设计。Snake 正式版不应该把自身配置硬塞进 aim 的字段空间里，否则会让设置结构继续失控。

建议改成分域设置：

```ts
type WorkbookSettings = {
  global: GlobalWorkbookSettings;
  aim: AimSettings;
  snake: SnakeSettings;
  tetris: TetrisSettings;
  perler: PerlerSettings;
  pvz: PvZSettings;
};
```

### 24.2 SnakeSettings

```ts
type SnakeSettings = {
  defaultMode: SnakeMode;
  defaultDifficulty: SnakeDifficulty;
  showHints: boolean;
  enableScreenShake: boolean;
  showDirectionIndicator: boolean;
  highContrastBoard: boolean;
  reducedMotion: boolean;
};
```

### 24.3 设置入口

Snake 正式版建议保留两层入口：

- 轻量局内设置：速度提示、动效、重开
- 完整设置：跳转到工作簿配置中心

---

## 25. 新手引导与回流设计

### 25.1 首次引导

首局必须有三步以内引导：

1. 用方向键启动数据流
2. 吃数字让链路变长
3. 避免 `#REF!` 和循环引用

引导要求：

- 不打断操作节奏
- 能在 5 秒内看懂
- 第一次完成后不再强弹

### 25.2 失败后回流

死亡界面必须提供三个动作：

- `再来一把`
- `返回 Hub`
- `查看记录`

如果本局刷新了记录，要明确显示：

- 新最高分
- 新最长长度
- 特殊食物首次发现

---

## 26. 平衡参数表

正式版必须把核心参数清晰固化，方便后续调优。

### 26.1 速度参数

| 难度 | 基础 tick | 加速 tick | 备注 |
| --- | --- | --- | --- |
| easy | 220ms | 170ms | 新手 |
| normal | 180ms | 140ms | 默认 |
| hard | 140ms | 110ms | 压力明显 |

### 26.2 分数参数

| 食物 | 分数 | 增长 | 特效 |
| --- | --- | --- | --- |
| normal | 10 | 1 | 无 |
| coin | 50 | 1 | 分数飘字 |
| coffee | 30 | 1 | 3 秒加速 |
| gold | 100 | 2 | 稀有提示 |

### 26.3 Challenge 障碍模板

正式版首发建议只有 3 套模板：

- `central-merge`
- `frozen-corners`
- `filter-columns`

不要第一版就上完全随机障碍，否则难以平衡与测试。

---

## 27. 性能、适配与可访问性

### 27.1 性能要求

- DOM 规模保持在可控范围
- 每 tick 渲染不能引发全页无关区域抖动
- 不允许因为 overlay 或 HUD 更新导致棋盘明显掉帧

### 27.2 响应式要求

Snake 不是移动优先模块，但必须满足：

- 1366x768 桌面可完整游玩
- 1024 宽度下侧栏可压缩
- 超窄视口时不强行提供完整体验，而是明确提示“建议桌面体验”

### 27.3 可访问性要求

- 高对比模式可切换
- 颜色不是唯一信息来源
- 死亡、暂停、破纪录要有文字提示
- reduced motion 时关闭闪烁和强烈脉冲动画

---

## 28. QA 与发布门槛

### 28.1 功能测试矩阵

至少覆盖：

- 三种模式
- 三档难度
- 普通食物与特殊食物
- 死亡原因
- 刷新后恢复/不恢复逻辑
- Hub 启动与退出路径

### 28.2 回归重点

Snake 接入后要验证没有破坏：

- Aim 的自定义准星与隐藏逻辑
- Perler 的继续游玩入口
- PvZ 的 Sheet7~9 导航
- 现有 Header/StatusBar 的通用性

### 28.3 发布阻断项

以下任一存在，都不能算成品：

- 方向输入偶发丢失
- 死亡原因不一致
- 本地存档损坏导致模块无法进入
- Hub 启动后 sheet 状态错乱
- 设置项修改后无法持久化

---

## 29. 后续内容池

当 Snake 首版稳定后，才能进入扩展内容：

- 事件系统：会议邀请、审计巡查、异常工作表闪烁
- 主题系统：蓝表风、夜班风、审计红线风
- 成就系统：无伤长链、极限长度、极速 classic
- 图鉴系统：特殊食物和异常值收集

扩展顺序必须以稳定性为前提，不能在基础局体验还不稳时先堆彩蛋。
