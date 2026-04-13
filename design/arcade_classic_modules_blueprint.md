# 经典街机模块扩展蓝图

- 日期：2026-04-14
- 目标模块：Pac-Man、Zuma、Match-3
- 目标：在当前 Excel 风格游戏中心内，为三套新经典模块给出统一接入顺序、Sheet 分配、实现优先级与共性约束，避免三个独立设计稿在落地阶段互相冲突

---

## 1. 结论先行

这三个模块都值得做，但不建议三套同时直接开写运行时。推荐顺序：

1. **Pac-Man**
2. **Zuma**
3. **Match-3**

原因：

- `Pac-Man` 最适合先验证“迷宫格 + 角色 AI + 训练页 + 成绩记录”这条线，规则纯、素材依赖低、反馈清晰。
- `Zuma` 第二做，可以复用很多短局 arcade HUD、计分、训练入口和模式页逻辑，但运行时碰撞与轨道模型会明显更难。
- `Match-3` 内容扩展性最强，但关卡数据、障碍体系、特殊块组合与动画结算链更重，适合在前两者把模块接入基建跑顺之后再做。

---

## 2. 统一 Sheet 分配

当前项目已使用 `Sheet1` 到 `Sheet11`。这三套模块建议固定新增如下：

- `Sheet12 / Sheet13`：Pac-Man
- `Sheet14 / Sheet15`：Zuma
- `Sheet16 / Sheet17`：Match-3

职责建议统一为双页模式：

- 奇数页或主页：选关、模式、正式战斗、HUD、结算
- 偶数页或辅页：图鉴、训练、规则实验、复盘说明

这样后续 `Hub`、`SheetTabs`、公式栏和状态栏都能按统一规律接入，不会因为每个模块都临时占 `Sheet12/13` 而冲突。

---

## 3. 三套模块的定位差异

### Pac-Man

- 核心卖点：固定迷宫、四鬼 AI、路线学习、能量豆反打
- 最适合承载：技巧训练、速通、一命挑战
- 实现关键：输入缓存转向、鬼目标逻辑、Scatter/Chase/Frightened 时序

### Zuma

- 核心卖点：插入精度、回缩连锁、终点线压迫
- 最适合承载：高频短局、命中率训练、连锁挑战
- 实现关键：轨道采样、插入点判定、链段回缩、多链危险管理

### Match-3

- 核心卖点：交换解题、掉落连锁、特殊块组合、目标驱动关卡
- 最适合承载：长期主线、每日挑战、障碍与关卡包扩展
- 实现关键：合法交换、批量判定、掉落补牌、特殊块组合、关卡脚本

---

## 4. 共性接入要求

三套模块都必须满足现有 `arcade_modules_product_spec.md` 的正式接入标准：

1. `Hub` 可发现、可启动、可显示摘要
2. `SheetTabs` 有固定编号与稳定排序
3. 公式栏与标题栏有模块化文案
4. `StatusBar` 能展示本局摘要
5. 本地存档、设置、统计有版本化结构
6. 至少有状态层单测与模块接入回归

---

## 5. 建议的统一模块注册扩展

建议在后续接入时把这三套模块一起纳入统一注册：

```ts
type ArcadeModuleId =
  | 'aim'
  | 'pvz'
  | 'snake'
  | 'tetris'
  | 'pacman'
  | 'zuma'
  | 'match3';
```

并为三个新模块预留：

- `buildHubRow`
- `buildFormulaText`
- `buildStatusSummary`
- `supportsResume`
- `sheetIds`

这样三个模块接入时不用再分别改一轮 `App.tsx`、`Hub` 和 `SheetTabs`。

---

## 6. 推荐实施顺序

### Phase A：先做 Pac-Man

- 先跑通迷宫类 arcade 的状态层与双页结构
- 补齐 `Sheet12 / Sheet13`
- 完成 Hub 接入、状态栏摘要、基础记录

### Phase B：再做 Zuma

- 在已有 arcade 双页接入方式上新增轨道类运行时
- 补齐 `Sheet14 / Sheet15`
- 重点验证“训练页 + 主玩法页”的复用能力

### Phase C：最后做 Match-3

- 以内容包和关卡脚本为中心推进
- 补齐 `Sheet16 / Sheet17`
- 同步建立更强的关卡目录、目标模板和障碍 registry

---

## 7. 对应设计稿

- [pacman_game_design.md](C:\Users\Administrator\.trae-cn\Eexcl_dawa\design\pacman_game_design.md)
- [zuma_game_design.md](C:\Users\Administrator\.trae-cn\Eexcl_dawa\design\zuma_game_design.md)
- [match3_game_design.md](C:\Users\Administrator\.trae-cn\Eexcl_dawa\design\match3_game_design.md)

这三份文档负责模块内的完整玩法设计；本文负责把三者放回同一个游戏中心后如何不冲突、如何按顺序落地。
