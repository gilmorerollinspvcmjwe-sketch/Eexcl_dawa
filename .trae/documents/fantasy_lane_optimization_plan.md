# 奇幻战线游戏优化计划

## 优化目标
基于全面检查发现的问题，优化数值平衡、体型表现、攻击方式视觉反馈、关卡设计，提升游戏整体质量。

---

## 一、严重问题修复

### 1. 补充缺失的 Boss 单位
**问题**：第六章 `shadow_lord` 和第七章 `storm_dragon` 在注册表中不存在，运行会崩溃。

**方案**：
- 在 `fantasyLaneUnitRegistry.ts` 中新增 2 个 Boss 单位
- `shadow_lord`：高 HP、多阶段技能、召唤能力
- `storm_dragon`：空军 Boss、全屏 AOE、高伤害

### 2. 修复 `shadow_hunter` 碾压 `shadow_assassin`
**问题**：`shadow_hunter`（118 金）DPS 158.1、移速 5.8，全面优于 `shadow_assassin`（132 金）DPS 155.1、移速 5.2。

**方案**：
- `shadow_hunter`：伤害 136→120，移速 5.8→4.8，DPS 降至约 140
- `shadow_assassin`：攻击间隔 980→820ms，DPS 提升至约 185，增加特殊机制（闪避 15%）

### 3. 降低 `blade_master` DPS
**问题**：DPS 253.8 是同级单位的 2.5 倍。

**方案**：
- 攻击间隔 780→950ms，DPS 降至约 208
- 移速 4.8→4.0，降低切入后排能力

### 4. 第七章敌方池增加地面单位
**问题**：5 个敌方单位全是空军，关卡偏科。

**方案**：
- enemyPool 移除 `wind_spirit`（已在其他章节出现）
- 新增 `stone_guard`（重甲坦克）、`shadow_assassin`（高机动近战）
- 迫使玩家同时处理地面和空中压力

---

## 二、数值平衡调整

### 5. 法师 DPS 提升
**问题**：`druid`（88 金）DPS 26.8、`ice_witch`（92 金）DPS 30.9 过低。

**方案**：
- `druid`：伤害 38→50，DPS 提升至约 35
- `ice_witch`：伤害 42→58，DPS 提升至约 43
- 辅助功能作为额外价值，不应牺牲一半输出

### 6. `angel` 性价比提升
**问题**：175 金，HP 680、DPS 40.7，对比 `young_dragon`（168 金）HP 1180、DPS 92.8 差距过大。

**方案**：
- HP 680→950
- 伤害 48→68，DPS 提升至约 58
- 保留治疗/护盾标签作为额外价值

### 7. `siege_ram` 移速提升
**问题**：移速 1.0，走完全程需 84 秒，无法及时到达战场。

**方案**：
- 移速 1.0→1.5，全程时间降至约 56 秒

### 8. physical 对 air 伤害调整
**问题**：克制倍率为 0，过于极端。

**方案**：
- physical → air：0.0→0.2，让物理攻击对空军有微量伤害

### 9. siege 对 structure 克制调整
**问题**：1.85 倍过高，容易秒杀。

**方案**：
- siege → structure：1.85→1.5

---

## 三、体型表现优化

### 10. 统一 collisionRadius 梯度
**问题**：small 和 medium 有重叠，large 到 giant 跨度过大。

**方案**：
- small：0.8-1.0（当前 0.9-1.2）
- medium：1.2-1.5（当前 1.2-1.8）
- large：1.8-2.2（当前 2.1-2.3）
- giant：2.6-3.0（当前 2.7-3.0）

### 11. Sprite 缩放差异加大
**问题**：scale 从 0.76 到 1.12，差距只有 47%，不够明显。

**方案**：
- small → 0.70
- medium → 0.85
- large → 1.0
- giant → 1.2
- 差距从 47% 提升至 71%

---

## 四、攻击方式视觉反馈

### 12. 新兵种投射物样式映射
**问题**：15 个新兵种没有投射物样式，使用默认样式无法区分。

**方案**：
在 `FantasyLaneBoard.tsx` 的 `getProjectileClass` 函数中新增映射：
- `holy_knight` → `holy_bolt`（金色光弹）
- `druid` → `leaf`（绿色叶片）
- `elementalist` → `element_orb`（三色法球）
- `heavy_crossbow` → `heavy_bolt`（粗大弩箭）
- `field_medic` → `heal_beam`（治疗光束）
- `demolitionist` → `bomb`（炸药包）
- `blade_master` → `slash`（剑气）
- `wind_spirit` → `gust`（气流）
- `gargoyle` → `stone`（碎石）
- `phoenix` → `fire_plume`（火焰羽）
- `thunder_eagle` → `lightning`（闪电）
- `angel` → `divine_beam`（神圣光束）

### 13. AOE 溅射爆炸动画
**问题**：`splashRadius` 只影响伤害计算，没有视觉反馈。

**方案**：
- 在 `FantasyLaneBoard.tsx` 中，当投射物命中且有 `splashRadius > 0` 时，渲染一个短暂的爆炸圆环动画
- 使用 CSS `@keyframes` 实现扩散 + 淡出效果
- 不同伤害类型使用不同颜色（fire=橙色，blast=红色，magic=紫色）

### 14. 伤害类型粒子效果
**问题**：physical、magic、pierce 等伤害类型在动画上看起来一样。

**方案**：
- 在单位受击时，根据伤害类型显示不同颜色的粒子：
  - physical → 灰色火花
  - magic → 紫色光点
  - pierce → 蓝色穿透线
  - blast → 橙色爆炸圈
  - siege → 棕色碎裂
  - antiAir → 青色闪电

---

## 五、关卡设计优化

### 15. 起始金币曲线调整
**问题**：第 2、3 章比第 1 章更难但金币更少。

**方案**：
- 第 2 章：132→138
- 第 3 章：124→132
- 保持缓慢递减或持平

### 16. 第六章增加重甲敌方单位
**问题**：enemyPool 全是轻甲/swarm，缺少重甲单位。

**方案**：
- enemyPool 新增 `orc_heavy`（重甲坦克）
- 保持破甲命题的连续性

### 17. Boss 名称与单位匹配
**问题**：第 3 章叫"冰霜巨龙"但用的是火龙单位。

**方案**：
- 修改第 3 章 Boss 名称为"烈焰巨龙"，或
- 创建新的冰霜巨龙单位（蓝色调、冰冻技能）

---

## 六、新增内容

### 18. 增加 2 个 giant 单位
**问题**：giant 体型只有 3 个单位，样本太少。

**方案**：
- 新增 `titan`（泰坦）：地面坦克，超高 HP，群体嘲讽
- 新增 `leviathan`（海怪）：空军支援，范围减速

### 19. 增加穿透攻击模式
**问题**：目前只有单体和溅射，缺少穿透多个目标的攻击。

**方案**：
- 新增 `damageProfile: 'piercing'` 类型
- 投射物沿直线穿透最多 3 个目标，每个目标伤害递减（100%→70%→50%）
- 给 `heavy_crossbow` 或新单位使用

### 20. 增加地面专用 AOE 单位
**问题**：所有 AOE 单位都能打空军，没有地面专用范围攻击。

**方案**：
- 新增 1-2 个 `damageProfile: 'aoe'` + `targetRule: 'ground_only'` 的单位
- 例如：地震法师（地面范围伤害，不能打空军）

---

## 执行顺序

**第一阶段（修复崩溃和严重不平衡）**：
1. 补充 Boss 单位
2. 修复 `shadow_hunter` / `shadow_assassin` 平衡
3. 降低 `blade_master` DPS
4. 第七章敌方池调整

**第二阶段（数值平衡）**：
5. 法师 DPS 提升
6. `angel` 性价比提升
7. `siege_ram` 移速提升
8. 克制倍率调整

**第三阶段（视觉优化）**：
9. collisionRadius 梯度统一
10. Sprite 缩放差异加大
11. 新兵种投射物样式
12. AOE 爆炸动画
13. 伤害类型粒子效果

**第四阶段（关卡优化）**：
14. 起始金币调整
15. 第六章重甲单位
16. Boss 名称匹配

**第五阶段（新增内容）**：
17. 2 个 giant 单位
18. 穿透攻击模式
19. 地面专用 AOE 单位
