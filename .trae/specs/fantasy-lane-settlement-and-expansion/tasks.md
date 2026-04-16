# Tasks

> **Agent 分组说明**：每个 agent 负责不同文件，最多同时并行 2 个 agent。

## Agent 1：类型定义 + 进度存储 + 结算逻辑
**负责文件**：`fantasyLaneTypes.ts`、`fantasyLaneProgressStorage.ts`、`fantasyLaneRuntime.ts`

- [x] Task 1.1: 扩展 `fantasyLaneTypes.ts`
  - [x] 新增 `FantasyLaneUnitUnlockCondition` 类型
  - [x] 新增 `FantasyLaneBattleRewards` 类型
  - [x] 在 `FantasyLaneUnitDefinition` 中新增 `unlockCondition`、`baseUnit` 字段
  - [x] 在 `FantasyLaneLevelDefinition` 中新增 `unlockRewards`、`fragmentRewards`、`starRewards` 字段
  - [x] 在 `FantasyLaneBattleResult` 中新增 `rewards` 字段

- [x] Task 1.2: 扩展 `fantasyLaneProgressStorage.ts`
  - [x] 在 `FantasyLaneProgressData` 中新增 `unlockedUnits`、`unitFragments`、`unitStars` 字段
  - [x] 更新 `normalize` 函数处理新字段默认值
  - [x] 新增 `unlockUnit`、`addUnitFragment`、`upgradeUnitStar`、`isUnitUnlocked`、`getUnitFragmentCount` 辅助函数

- [x] Task 1.3: 扩展结算逻辑（`fantasyLaneRuntime.ts`）
  - [x] 新增 `calculateBattleRewards` 函数
  - [x] 修改 `finalizeBattle` 函数附加 `rewards` 字段
  - [x] 实现首次通关兵种解锁逻辑
  - [x] 实现碎片奖励发放逻辑
  - [x] 实现 Boss 关三星解锁稀有兵种逻辑

## Agent 2：兵种注册
**负责文件**：`fantasyLaneUnitRegistry.ts`

- [x] Task 2.1: 新增 15 个兵种到注册表
  - [x] 地面兵种 10 个：圣骑士、德鲁伊、攻城锤、暗影猎手、元素使、重装弩手、战地医师、猛犸象、爆破专家、剑圣
  - [x] 空中兵种 5 个：风灵、石像鬼、凤凰、雷鹰、天使
  - [x] 为每个兵种配置完整的属性、标签、解锁条件
  - [x] 更新 `FANTASY_LANE_UNITS` 数组和 `FANTASY_LANE_UNIT_MAP` 映射

## Agent 3：关卡目录
**负责文件**：`fantasyLaneLevelCatalog.ts`

- [x] Task 3.1: 新增第六章"幽暗密林"
  - [x] 定义章节信息（ID、名称、敌人池、推荐英雄、时间限制、基地血量、起始金币）
  - [x] 定义 6 个关卡（6-1 到 6-6），每关包含阶段、敌人池、解锁奖励、碎片奖励
  - [x] 定义 Boss"暗影领主"及其多阶段行为
  - [x] 更新 `FANTASY_LANE_CHAPTERS`、`FANTASY_LANE_LEVELS`、`FANTASY_LANE_LEVEL_MAP`

- [x] Task 3.2: 新增第七章"天空之城"
  - [x] 定义章节信息
  - [x] 定义 6 个关卡（7-1 到 7-6）
  - [x] 定义 Boss"风暴巨龙"及其多阶段行为
  - [x] 更新导出数组和映射

## Agent 4：结算 UI
**负责文件**：`FantasyLaneResultPanel.tsx`、`FantasyLaneSheet.tsx`

- [x] Task 4.1: 扩展 `FantasyLaneResultPanel.tsx`
  - [x] 读取 `state.result.rewards` 显示奖励信息
  - [x] 显示新兵种卡片（带"新！"标签和飞入动画）
  - [x] 显示碎片获得数量（带 +1 动画）

- [x] Task 4.2: 修改 `FantasyLaneSheet.tsx` 结算记录逻辑
  - [x] 在 `recordFantasyLaneLevelResult` 后调用奖励发放函数
  - [x] 更新进度存储中的 `unlockedUnits`、`unitFragments`、`unitStars`

## Agent 5：兵种图鉴 UI
**负责文件**：`FantasyLaneRosterSheet.tsx`

- [x] Task 5.1: 扩展兵种图鉴显示
  - [x] 显示兵种解锁状态（已解锁/未解锁）
  - [x] 未解锁兵种显示灰色剪影 + 解锁条件提示
  - [x] 显示兵种星级和碎片进度
  - [x] 新增筛选选项（已解锁/未解锁）

## Agent 6：样式
**负责文件**：`fantasy-lane.css`

- [x] Task 6.1: 新增结算奖励样式
  - [x] `.fantasy-lane-rewards` 容器样式
  - [x] `.fantasy-lane-reward-unit` 新兵种卡片样式
  - [x] `.fantasy-lane-reward-fragment` 碎片卡片样式
  - [x] `rewardFlyIn`、`glowPulse` 动画关键帧

- [x] Task 6.2: 新增未解锁兵种样式
  - [x] `.fantasy-lane-unit--locked` 灰色样式
  - [x] 透明度、灰度滤镜、禁用光标

# Task Dependencies
- Agent 2、3 依赖 Agent 1（类型定义）
- Agent 4 依赖 Agent 1（结算逻辑）
- Agent 5 依赖 Agent 2（兵种注册）
- Agent 6 依赖 Agent 4、5（UI 组件）

# 执行顺序（最多 2 个 agent 并行）

**第一轮**：
- Agent 1（类型定义 + 进度存储 + 结算逻辑）

**第二轮**（2 个 agent 并行）：
- Agent 2（兵种注册）
- Agent 3（关卡目录）

**第三轮**（2 个 agent 并行）：
- Agent 4（结算 UI）
- Agent 5（图鉴 UI）

**第四轮**：
- Agent 6（样式）
