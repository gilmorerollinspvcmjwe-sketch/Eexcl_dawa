# 奇幻战线 UI 清理修复计划

## 问题概述

当前奇幻战线页面混入了大量策划调试信息和 Excel 风格的命名,不符合正式游戏 UI 标准。需要把这些调试信息从玩家界面中移除或隐藏,同时保留玩家真正需要的游戏信息。

## 修复原则

* **玩家UI**: 只展示玩家做决策需要的信息(血量、金币、人口、计时、阶段进度、技能状态)

* **策划调试信息**: 移到独立的开发者面板,或仅在开发模式下显示

* **Excel 风格命名**: 改为游戏化命名

***

## 修复步骤

### 1. FantasyLaneBoard.tsx - 战场区域清理

**文件**: `src/components/fantasy_lane/FantasyLaneBoard.tsx`

#### 1.1 移除顶部调试指标栏 (第 111-124 行)

删除 `fantasy-lane-board-metrics` 整个 div,包含:

* "地面 X : X"

* "空中 X : X"

* "投射物 X"

* "交战中心 x X"

* "Boss XXX · PX/Y"

这些信息在 HUD 中已有展示,战场区域不需要重复。

#### 1.2 移除战场开发标注层 (第 141-146 行)

删除:

* "空域交战层" 标签

* "地面推进层" 标签

这是开发者的视觉参考,玩家不需要看到。

#### 1.3 移除战场计数器浮层 (第 157-164 行)

删除:

* "空优 X : X" 计数器

* "地面 X : X" 计数器

与顶部 metrics 重复,且遮挡战场视野。

#### 1.4 移除关卡编辑器标记 (第 166-177 行)

删除:

* "主堡区" 标记线 (player-base, enemy-base)

* "出生区" 标记线 (player-spawn, enemy-spawn)

保留主堡血量显示(179-186行)和交战线(188行)即可。

#### 1.5 移除底部调试脚注 (第 273-280 行)

删除 `fantasy-lane-board-footnote` 整个 div,包含:

* "战场命题 melee / antiAir"

* "前线偏移 +12"

* "空优差值 -1"

* "拥堵 23%"

* "待命队列 2/4"

* "当前判断 僵持推进"

全部是策划调试数据。

#### 1.6 简化战场阶段横幅 (第 131-139 行)

保留 `state.phaseLabel`,但简化副标题:

* 有 Boss 且已触发: 显示 Boss 名称和当前阶段

* 有 Boss 未触发: 显示 "关底 Boss 待登场"

* 无 Boss: 显示关卡 hint

***

### 2. FantasyLaneHud.tsx - HUD 区域清理

**文件**: `src/components/fantasy_lane/FantasyLaneHud.tsx`

#### 2.1 移除 briefing-card 中的策划信息 (第 86-97 行)

删除第一个 briefing-card,包含:

* "章节命题" 标签

* 关卡 theme/focus 信息

保留关卡名称和描述即可,这些在 FantasyLaneSheet.tsx 的主标题区已有展示。

#### 2.2 简化阶段 briefing-card (第 99-144 行)

保留:

* 阶段名称 (`state.phaseLabel`)

* 阶段进度条 (phase pills)

* Boss 阶段进度条 (boss phase pills)

删除:

* "本关收口重点" (第 140 行)

* 重复的 clashZoneLabel 展示

#### 2.3 移除队列卡片中的基线指标 (第 237-248 行)

删除:

* `fantasy-lane-baseline-list` (规则基线摘要)

* `fantasy-lane-baseline-list--combat` (战斗基线)

这些统计数据更适合放在结算面板,战斗中显示会干扰操作。

#### 2.4 保留核心 HUD 元素

保留以下玩家需要的信息:

* 态势/计时/金币/人口/击倒/技能 统计卡片

* 我方/敌方主堡血量条

* 前线读数(前线、空优、拥堵、交战、队列)

* 指令队列

* 技能按钮

* 暂停/重开/返回按钮

***

### 3. FantasyLaneSheet.tsx - 主页面清理

**文件**: `src/components/fantasy_lane/FantasyLaneSheet.tsx`

#### 3.1 简化主标题区摘要 (第 224-231 行)

删除 `fantasy-lane-main-summary` 中的:

* "章节命题: XXX"

* "章节焦点: XXX"

* "推荐标签: XXX"

* "主线进度: X/Y" (可保留,但移到更不显眼的位置)

保留:

* 关卡名称和描述(已有 h2 和 p 标签)

* Boss 信息(如果有)

#### 3.2 简化底部脚注 (第 259-265 行)

删除:

* "当前阶段: XXX" (HUD 已有)

* "关卡提示: XXX" (可保留)

* "战场反馈: XXX" (策划调试信息)

保留:

* 快捷键提示

***

### 4. FantasyLaneLoadoutPanel.tsx - 侧边栏清理

**文件**: `src/components/fantasy_lane/FantasyLaneLoadoutPanel.tsx`

#### 4.1 修改 Excel 风格按钮命名 (第 98-99 行)

* "Sheet19 兵种与英雄" → "兵种图鉴"

* "Sheet20 章节与关卡" → "关卡目录"

#### 4.2 简化关卡摘要区 (第 102-115 行)

删除 `fantasy-lane-warning-chip--neutral` 中的 recommendedTags 展示,这些是策划配置信息。

保留:

* 关卡名称

* 章节名称

* 关卡描述

#### 4.3 优化出兵指令区标题 (第 267 行)

"出兵指令" → "出兵面板"

#### 4.4 优化队列空位提示 (第 278 行)

"队列为空" → "点击下方单位出兵,或按 1-8 快速出兵"

#### 4.5 简化开始按钮文字 (第 262 行)

"开始战线推进" → "开始战斗"

***

### 5. FantasyLaneRosterSheet.tsx - 兵种图鉴清理

**文件**: `src/components/fantasy_lane/FantasyLaneRosterSheet.tsx`

#### 5.1 移除 Excel 风格命名 (第 24, 31, 33, 37 行)

* 标题栏 "Sheet19" → 删除

* 描述文字 "回到 Sheet18 如何编组" → "回到战斗页面编组"

* 返回按钮 "返回 Sheet18" → "返回战斗"

* formulaChange 中的 "=Sheet19 兵种与英雄" → "= 兵种与英雄总览"

***

### 6. FantasyLaneChapterSheet.tsx - 关卡目录清理

**文件**: `src/components/fantasy_lane/FantasyLaneChapterSheet.tsx`

#### 6.1 移除 Excel 风格命名 (第 36, 48, 50, 54 行)

* 标题栏 "Sheet20" → 删除

* 描述文字 "战斗本体仍回到 Sheet18 处理" → "战斗页面进行对战"

* 前往按钮 "前往 Sheet18" → "前往战斗"

* formulaChange 中的 "=Sheet20 章节与关卡" → "= 章节与关卡目录"

***

### 7. FantasyLaneResultPanel.tsx - 结算面板调整

**文件**: `src/components/fantasy_lane/FantasyLaneResultPanel.tsx`

#### 7.1 简化结果摘要 (第 37-48 行)

删除:

* "结束阶段: XXX"

* "战场态势: XXX"

* "战线判断: XXX"

保留:

* 关卡名称

* 章节命题/焦点(可保留,结算时展示合理)

* 关卡提示

* Boss 转段信息

***

### 8. CSS 清理

**文件**: `src/styles/fantasy-lane.css`

#### 8.1 删除已移除元素的 CSS 类

删除以下不再使用的 CSS 类:

* `.fantasy-lane-board-metrics` (第 665-684 行相关样式)

* `.fantasy-lane-board-footnote` (第 665-684 行相关样式)

* `.fantasy-lane-battlefield-band` (第 775-816 行,开发标注层)

* `.fantasy-lane-battlefield-counter` (第 861-891 行,战场计数器)

* `.fantasy-lane-battlefield-marker` (第 893-931 行,编辑器标记)

* `.fantasy-lane-baseline-list` (第 313-334 行,基线指标)

#### 8.2 保留必要的 CSS 类

保留所有玩家 UI 相关的样式,不做修改。

***

## 执行顺序

1. 先修改 TSX 组件(步骤 1-7),删除/简化调试信息
2. 再清理 CSS(步骤 8),删除不再使用的样式
3. 最后检查是否有遗漏的引用或样式断裂

## 验证方式

* 启动开发服务器,检查页面是否正常渲染

* 确认所有玩家需要的信息仍然可见

* 确认调试信息已移除

* 确认 Excel 风格命名已全部替换

* 检查浏览器控制台无报错

