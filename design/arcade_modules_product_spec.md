# Arcade 模块产品规格总纲

- 日期：2026-04-12
- 适用模块：Snake、Tetris，以及后续所有新 arcade sheet
- 目标：明确“不是 demo，而是成品”的统一标准，避免每个模块都单独发散

---

## 1. 产品立场

这个项目已经不是“Excel 壳套几个小游戏”的实验品，而是一个有统一外壳、统一成长、统一入口和统一语气的工作簿式 arcade 系统。

因此所有新模块都必须满足两层要求：

- 模块自身可独立成立
- 模块放回工作簿体系后不显得像外来插件

---

## 2. 新模块统一发布标准

任意新 arcade 模块若想算“正式接入”，必须同时满足以下六项：

1. `Hub` 可发现、可启动、可记录状态
2. `SheetTabs` 中有稳定位置与明确编号
3. `ExcelHeader` 公式栏和标题栏有模块化文案
4. `StatusBar` 能展示通用状态摘要
5. 本地存档、统计、设置有版本化结构
6. 回归测试覆盖现有模块不被破坏

只满足“能打开、能玩”，不算上线。

---

## 3. 统一架构边界

### 3.1 必须遵守的分层

```text
App / Sheet Routing
  -> Module Sheet Container
    -> Pure Game State Layer
    -> Selectors / Formatters
    -> Presentational Components
```

规则：

- 规则推进在状态层
- 文案/摘要在 selector 层
- 组件只读状态，只发 action
- 本地存储只能通过模块存储边界读写

### 3.2 不能接受的反模式

- 在 React 组件里直接写碰撞或结算规则
- 在多个组件里复制分数和速度常量
- 用 `localStorage` 零散塞字段而不做 schema
- 让 Hub 自己猜模块状态而不是消费模块汇总数据

---

## 4. 统一模块注册设计

正式版建议把当前分散的 Hub 占位和 App 路由收束为统一注册表。

```ts
type ArcadeModuleDefinition = {
  id: 'aim' | 'snake' | 'tetris' | 'perler' | 'pvz';
  sheetId: string;
  sheetLabel: string;
  icon: string;
  title: string;
  supportsResume: boolean;
  buildHubRow: () => HubGameRow;
  buildFormulaText: (state: unknown) => string;
};
```

价值：

- 避免 `App.tsx` 继续膨胀为 if/else 表
- Hub、SheetTabs、标题栏、统计可以共享同一份定义
- 后续再接新游戏时不会再全项目找入口手补

---

## 5. 统一状态栏摘要接口

当前 [StatusBar.tsx](C:/Users/Administrator/.trae-cn/Eexcl_dawa/src/components/StatusBar.tsx) 明显偏练枪。正式版应抽象为：

```ts
type WorkbookStatusSummary = {
  isPlaying: boolean;
  primaryText: string;
  score?: number;
  secondaryMetric?: string;
  tertiaryMetric?: string;
  mode?: string;
  alertTone?: 'neutral' | 'success' | 'warning' | 'danger';
};
```

映射示例：

| 模块 | primaryText | secondaryMetric |
| --- | --- | --- |
| Aim | 命中训练中 | 连击 x8 |
| Snake | 数据流运行中 | 长度 16 |
| Tetris | 堆积处理中 | 消行 24 |
| Perler | 拼制中 | 完成 62% |
| PvZ | 防线推进中 | 阳光 175 |

---

## 6. 统一本地存储规范

### 6.1 存储原则

- 每个模块独立 key
- 每个 key 都带 `version`
- 允许安全迁移
- 迁移失败时安全回退，不阻塞进入模块

### 6.2 推荐 key 结构

```text
excel-aim-settings-v3
excel-arcade-hub-v1
excel-snake-module-v1
excel-tetris-module-v1
excel-perler-module-v1
excel-pvz-module-v1
```

### 6.3 统一字段习惯

每个模块 storage 至少有：

- `version`
- `stats`
- `progression`
- `preferences`
- `activeRun?`

---

## 7. 统一 Hub 规则

### 7.1 Hub 不只是入口

Hub 必须承担：

- 快速继续
- 今日状态反馈
- 游戏记录摘要
- 解锁/任务回流

### 7.2 Hub 行状态最低要求

每个模块至少要提供：

- `title`
- `status`
- `bestRecord`
- `todayCount`
- `actionLabel`
- `accent`

### 7.3 Quick Resume 优先级

建议：

1. 未完成 Perler
2. 可恢复 Snake/Tetris Marathon
3. 默认 60 秒 Aim

这比当前只在 Perler/Aim 二选一更像成品。

---

## 8. 统一设置体系

当前 [SettingsContext.tsx](C:/Users/Administrator/.trae-cn/Eexcl_dawa/src/contexts/SettingsContext.tsx) 已经开始变重。正式版不能继续按模块横向堆字段。

建议升级为：

```ts
type WorkbookSettings = {
  global: {
    reducedMotion: boolean;
    soundEnabled: boolean;
    highContrast: boolean;
    showFirstTimeHints: boolean;
  };
  aim: AimSettings;
  snake: SnakeSettings;
  tetris: TetrisSettings;
  perler: PerlerSettings;
  pvz: PvZSettings;
};
```

这样新模块才不会把设置系统拖垮。

---

## 9. 统一可访问性与适配标准

所有 arcade 模块必须满足：

- 1366x768 桌面可完整使用
- 不把颜色当成唯一信息通道
- reduced motion 可关闭关键动效
- 高对比模式可开启
- 首局可理解，不依赖长篇文字

移动端不要求“完整可玩”，但必须有清晰降级策略，而不是布局直接炸裂。

---

## 10. 统一 QA 标准

### 10.1 模块级测试

每个模块都必须有：

- 纯状态单测
- selector/formatter 单测
- registry 接入单测

### 10.2 工作簿级回归

每接入一个新模块，至少回归：

- Hub 启动其它模块
- SheetTabs 顺序
- ExcelHeader 公式栏与标题
- 全局隐藏逻辑
- 设置持久化

### 10.3 发布阻断

以下任一出现，不允许标记为正式版：

- 模块接入后破坏现有 sheet 导航
- 本地存档异常导致白屏或无法进入
- 状态栏/标题栏出现错误模块信息
- 设置 schema 与旧版本冲突且无回退

---

## 11. Snake 与 Tetris 的实施优先级

正式版推进顺序建议仍然是：

1. 先做 Snake
2. 再做 Tetris

原因不是 Snake 更重要，而是它更适合先把以下共性设施跑通：

- 新 sheet 接入流程
- Hub 占位转正式入口
- 通用状态栏摘要
- 模块级本地存档
- 分域设置

把这套共性打稳后，再做 Tetris 才不会返工。

---

## 12. 当前结论

如果按“成品”标准推进，接下来不该直接埋头写游戏组件，而应该按下面顺序做：

1. 先抽象共享注册、状态栏 summary、存储 schema、设置分域
2. 用 Snake 验证这套接入框架
3. 再实现 Tetris，并复用同一套产品基础设施

这才是做产品，不是做一堆孤立 demo。
