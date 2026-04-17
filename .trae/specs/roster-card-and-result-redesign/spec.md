# 兵种卡片与战报优化 Spec

## Why
当前 Sheet19 兵种卡片信息过载，一个卡片有 3 层信息（基础标签 → 9 项数值 → 8 项详细属性），玩家难以快速浏览。英雄和战术技能展示过于简单，缺乏视觉辨识度。战后战报数据表格抽象，玩家难以理解关键信息。

## What Changes
- 兵种卡片改为可展开/收起设计，默认显示核心信息，点击展开详情
- 英雄表格增加图标展示（使用 hero.id 映射 emoji）
- 战术技能表格增加图标展示（使用 skill.id 映射 emoji）
- 战后战报重新设计：优化数据表格结构，增加编组表现区域，改进奖励展示

## Impact
- Affected specs: 无
- Affected code: 
  - `src/components/fantasy_lane/FantasyLaneRosterSheet.tsx` - 兵种卡片、英雄表格、战术表格
  - `src/components/fantasy_lane/FantasyLaneResultPanel.tsx` - 战后战报
  - `src/styles/fantasy-lane.css` - 相关样式

## ADDED Requirements
### Requirement: 兵种卡片可展开设计
兵种卡片 SHALL 支持展开/收起交互，默认显示核心信息，点击后展开详细属性。

#### Scenario: 收起状态
- **WHEN** 玩家查看兵种卡片
- **THEN** 显示：头像、名称、角色标签、描述、核心数值（费用/人口/冷却/伤害/血量）

#### Scenario: 展开状态
- **WHEN** 玩家点击卡片或展开按钮
- **THEN** 额外显示：伤害类型、护甲类型、射程、攻速、速度、弹道、碰撞半径、AOE 半径等详细属性

### Requirement: 英雄视觉增强
英雄表格 SHALL 为每个英雄显示图标，增强辨识度。

#### Scenario: 英雄列表展示
- **WHEN** 玩家查看英雄表格
- **THEN** 每行显示英雄图标 + 名称 + 技能描述 + 被动 + 冷却

### Requirement: 战术技能视觉增强
战术技能表格 SHALL 为每个技能显示图标，增强辨识度。

#### Scenario: 战术技能列表展示
- **WHEN** 玩家查看战术技能表格
- **THEN** 每行显示技能图标 + 名称 + 效果描述 + 冷却

### Requirement: 战报重新设计
战后战报 SHALL 采用更清晰的数据展示结构，让玩家快速理解战斗表现。

#### Scenario: 胜利战报
- **WHEN** 玩家通关关卡
- **THEN** 显示：胜利徽章、星级、核心数据（时间、得分、剩余 HP）、编组表现（每个兵种的出兵次数/击倒数）、奖励展示

#### Scenario: 失败战报
- **WHEN** 玩家战斗失败
- **THEN** 显示：失败徽章、核心数据、失败原因提示、改进建议

## MODIFIED Requirements
### Requirement: 兵种卡片布局
**原设计**：3 层信息全部展开显示（FantasyLaneRosterSheet.tsx 第 277-299 行）
**新设计**：
- 默认显示：头像（233-245 行）、名称（248-250 行）、标签（253-261 行）、描述（275 行）、核心数值（278-283 行：费用/人口/冷却/伤害/血量/护甲）
- 展开显示：详细属性（289-298 行：伤害类型、护甲类型、护甲级别、索敌、最小射程、弹道、碰撞、AOE、签名）
- 实现方式：添加 `expandedUnitIds` Set 状态，点击卡片切换展开/收起

### Requirement: 英雄表格
**原设计**：纯文本表格（FantasyLaneRosterSheet.tsx 第 456-473 行）
**新设计**：
- 添加英雄图标映射：`warlord` → ⚔️, `archmage` → 🧙, `dragon_rider` → 🐉
- 在名称列前显示图标（466 行修改）
- CSS 增加图标样式

### Requirement: 战术技能表格
**原设计**：纯文本表格（FantasyLaneRosterSheet.tsx 第 478-491 行）
**新设计**：
- 添加战术技能图标映射：`fireball` → 🔥, `heal` → 💚, `haste` → ⚡, `freeze` → ❄️, `shield` → 🛡️
- 在名称列前显示图标（486 行修改）
- CSS 增加图标样式

### Requirement: 战报数据表格
**原设计**：5 行数据表格，每行 3 个指标带进度条（FantasyLaneResultPanel.tsx 第 87-223 行）
**新设计**：
- 核心数据区：时间、得分、星级、剩余 HP（替换原 overall 行）
- 编组表现区：列出每个兵种的出兵次数、击倒数（新增，需要从 state.stats 获取）
- 经济分析区：金币花费、剩余、人口利用率（替换原 bases 行）
- 技能使用区：英雄技/战术技次数（保留原 skills 行，简化指标）
- 删除"压制"行（196-222 行），概念模糊

## REMOVED Requirements
### Requirement: 战报"压制"行
**Reason**: 概念模糊，指标逻辑不连贯（弹道总数/范围命中/空优/章节进度混在一起），玩家难以理解
**Migration**: 拆分为"战斗效率"（弹道/AOE 命中）和"前线控制"（前线位置/空优）两个独立指标，或直接删除
