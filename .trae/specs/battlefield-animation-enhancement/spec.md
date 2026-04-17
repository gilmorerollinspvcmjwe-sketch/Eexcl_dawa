# 战场动画增强 Spec

## Why
当前战场缺少技能释放的视觉反馈、伤害数值展示和技能冷却指示，玩家难以直观感受战斗节奏和技能状态。

## What Changes
- 添加技能释放全屏特效（英雄技/战术技）
- 添加伤害数字飘字效果（支持开关）
- 添加 HUD 技能冷却进度指示

## Impact
- Affected specs: 无
- Affected code: 
  - `src/features/fantasy_lane/fantasyLaneTypes.ts` - 添加技能特效和伤害数字类型
  - `src/features/fantasy_lane/fantasyLaneRuntime.ts` - 技能释放时生成特效
  - `src/components/fantasy_lane/render/fantasyLaneBattlefieldRenderer.ts` - 渲染技能特效和伤害数字
  - `src/components/fantasy_lane/FantasyLaneHud.tsx` - 技能冷却进度指示
  - `src/components/fantasy_lane/FantasyLaneBoard.tsx` - 伤害数字开关设置
  - `src/styles/fantasy-lane.css` - 相关样式

## ADDED Requirements
### Requirement: 技能释放全屏特效
技能释放时 SHALL 显示全屏特效，持续 800ms。

#### Scenario: 英雄技释放
- **WHEN** 玩家释放英雄技能
- **THEN** 显示英雄主题色的全屏闪光 + 技能名称文字

#### Scenario: 战术技释放
- **WHEN** 玩家释放战术技能
- **THEN** 显示战术主题色的全屏闪光 + 技能名称文字

### Requirement: 伤害数字飘字
命中时 SHALL 显示伤害数字，从命中位置向上飘出并淡出。

#### Scenario: 普通伤害
- **WHEN** 单位命中敌人
- **THEN** 显示伤害数值，向上飘动 600ms 后淡出

#### Scenario: 关闭伤害数字
- **WHEN** 玩家在设置中关闭伤害数字
- **THEN** 不显示伤害飘字

### Requirement: 技能冷却指示
HUD 技能按钮 SHALL 显示冷却进度环。

#### Scenario: 技能冷却中
- **WHEN** 技能处于冷却状态
- **THEN** 按钮显示圆形进度条，从满到空

#### Scenario: 技能就绪
- **WHEN** 技能冷却完成
- **THEN** 按钮显示完整高亮状态
