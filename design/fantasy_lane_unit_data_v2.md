# 奇幻战线对推 v2 兵种数据规格

- 日期：2026-04-15
- 作用：定义首发兵种运行时字段、首发 22 个兵种数据表、3 名英雄方向和敌军变体规则。

---

## 1. 数据原则

兵种表必须先服务运行时，再服务展示。

因此 v2 的兵种数据以“能驱动战斗”为优先，外观字段和美术配置另行挂接，不再把渲染配置当成主数据。

---

## 2. 运行时字段

### 2.1 单位基础字段

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一 ID |
| `name` | 中文名 |
| `roleGroup` | `tank / melee / ranged / magic / air / finisher` |
| `laneType` | `front / mid / rear / air` |
| `cost` | 费用 |
| `cooldownSec` | 独立冷却 |
| `size` | `S / M / L / XL` |
| `maxHp` | 本体生命 |
| `armorHp` | 护甲生命 |
| `defenseType` | `light / heavy / swarm / air` |
| `moveSpeed` | 每秒推进速度 |
| `attackRange` | 攻击距离 |
| `attackIntervalSec` | 攻击间隔 |
| `damage` | 单次伤害 |
| `damageType` | 伤害类型 |
| `targetRule` | `ground / air / both / structureFirst` |
| `splashRadius` | 溅射半径，0 为无 |
| `blockValue` | 阻挡强度 |
| `tags` | 标签集合 |
| `traitText` | 一句话特性 |

### 2.2 标签集合

首发只允许以下标签：

- `antiAir`
- `pierce`
- `blast`
- `summon`
- `heal`
- `charge`
- `burn`
- `slow`
- `siegeFocus`
- `cluster`
- `giant`

---

## 3. 首发 22 个兵种

## 3.1 前排肉盾

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `goblin_shield` | 哥布林盾兵 | 40 | 4.5s | 520 / 180 | 52 physical | 最便宜的稳线前排，`blockValue=2` |
| `orc_heavy` | 兽人重甲兵 | 75 | 6.5s | 760 / 320 | 68 physical | 高护甲前排，抗轻型压线 |
| `stone_guard` | 石像卫士 | 115 | 10.0s | 1100 / 420 | 82 pierce | 重型站桩前排，慢但很稳 |
| `dwarf_ironwall` | 铁壁矮人 | 60 | 5.5s | 620 / 220 | 58 physical | 中低费前排，首次接敌获得 4 秒护盾 |

## 3.2 近战冲锋

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `wolf_rider` | 狼骑兵 | 70 | 6.0s | 430 / 0 | 78 physical | 高速切入，带 `charge` |
| `berserker` | 狂战士 | 85 | 7.5s | 560 / 60 | 96 physical | 生命低于 50% 时攻速提升 20% |
| `crypt_crawler` | 地穴爬兽 | 95 | 8.5s | 500 / 120 | 88 pierce | 对重甲更稳定 |
| `shadow_assassin` | 暗影刺客 | 105 | 10.0s | 380 / 0 | 132 physical | 首次命中后排时附加 `mark` |

## 3.3 远程持续输出

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `archer` | 弓箭手 | 55 | 5.0s | 280 / 0 | 44 physical | 低费稳定远程 |
| `elf_shooter` | 精灵射手 | 72 | 6.0s | 320 / 0 | 52 pierce | 射程长，对重甲更好 |
| `musketeer` | 火枪佣兵 | 92 | 8.5s | 340 / 40 | 94 pierce | 低攻速高单发 |
| `ballista` | 弩炮车 | 130 | 12.0s | 620 / 0 | 126 siege | 自带 `siegeFocus`，拆堡能力强 |

## 3.4 法术 / 范围兵

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `flame_warlock` | 火焰术士 | 88 | 8.0s | 300 / 0 | 72 magic | 命中附加 `burn` |
| `ice_witch` | 冰霜女巫 | 90 | 8.5s | 310 / 0 | 58 magic | 命中附加 `slow` |
| `plague_thrower` | 瘟疫投手 | 100 | 9.5s | 340 / 0 | 68 blast | 对群体有 1.6 半径溅射 |
| `thunder_mage` | 雷电法师 | 125 | 11.0s | 330 / 0 | 84 magic | 对主目标及最近 1 个目标连锁 50% |

## 3.5 空中 / 特殊兵

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `griffin_knight` | 狮鹫骑士 | 120 | 11.0s | 640 / 120 | 88 antiAir | 空层主力，可打空也可俯冲地面后排 |
| `bat_swarm` | 蝙蝠群 | 68 | 7.0s | 260 / 0 | 30 antiAir | `defenseType=swarm`，数量压制型 |
| `young_dragon` | 幼龙 | 150 | 14.0s | 760 / 0 | 96 blast | 空层范围压制，自带 `burn` |

## 3.6 高费终结兵

| ID | 名称 | 费用 | 冷却 | 生命 / 护甲 | 伤害 | 特性 |
| --- | --- | --- | --- | --- | --- | --- |
| `tree_ancient` | 树人古卫 | 205 | 20.0s | 1600 / 280 | 118 physical | 巨型肉盾，`blockValue=4` |
| `ogre_lord` | 食人魔领主 | 225 | 22.0s | 1420 / 340 | 156 pierce | 对重甲和建筑都有压力 |
| `fire_dragon` | 火龙 | 250 | 28.0s | 1280 / 0 | 132 blast | 空层终结兵，直线吐息打群体 |

---

## 4. 首发编组建议

为了保证可玩性，系统默认推荐玩家编组满足：

- 前排至少 2 个
- 远程或法术至少 2 个
- 对空至少 1 个
- 终结兵最多 2 个

默认推荐模板：

1. 稳线流：2 前排 + 2 远程 + 2 法术 + 1 对空 + 1 终结
2. 冲锋流：2 前排 + 2 近战 + 2 输出 + 1 对空 + 1 终结
3. 空军流：2 前排 + 1 远程 + 2 法术 + 2 空军 + 1 终结

---

## 5. 英雄数据方向

| 英雄 | 被动方向 | 主动技能 | 推荐搭配 |
| --- | --- | --- | --- |
| 战帅 | 近战和前排生命 +8%，首次接敌 4 秒加速 | 战吼：友军前线 8 秒伤害和移速提升 | 肉盾、狼骑、食人魔 |
| 法导师 | 法术单位伤害 +10%，战术技能冷却 -10% | 陨火 / 冰暴：前方区域爆发或冻结 | 术士、女巫、雷法 |
| 驭龙者 | 空军和终结兵出场后 6 秒增伤 | 龙焰扫射：对一段区域持续灼烧 | 狮鹫、幼龙、火龙 |

---

## 6. 敌军变体规则

敌军优先复用同一套单位原型，再通过变体倍率调整。

### 6.1 允许的变体字段

- `hpMultiplier`
- `damageMultiplier`
- `speedMultiplier`
- `costVirtualWeight`
- `spawnCountBonus`
- `eliteTag`

### 6.2 变体示例

| 变体 ID | 基底单位 | 调整 |
| --- | --- | --- |
| `goblin_swarm` | `goblin_shield` | `hp x0.7`，`damage x0.8`，`spawnCount +2` |
| `orc_elite` | `orc_heavy` | `hp x1.25`，`damage x1.15`，加 `eliteTag` |
| `dragon_frost` | `young_dragon` | `damageType=magic`，命中改为 `slow` |

Boss 不走普通变体规则，使用脚本实体单独定义。

---

## 7. Boss 实体最小字段

Boss 不是普通兵种，但运行时仍要遵守同一套基础字段。

额外字段：

- `phaseCount`
- `phaseHpThresholds`
- `bossSkillSet`
- `warningLeadSec`
- `breakRewardGold`

首发 Boss 建议：

- `bone_king`
- `grave_summoner`
- `frost_dragon_boss`
- `lava_tyrant`
- `scarlet_dragon_king`

---

## 8. 平衡红线

- 任何低费单位都必须在至少 1 种关卡场景中有稳定价值
- 任何终结兵都不能在不配前排的情况下单卡通吃
- 对空单位不能同时成为最强地面输出
- 群伤单位不能兼具最强单体拆堡

---

## 9. 必测清单

- 22 个兵种是否都能被统一字段驱动
- 同一兵种在玩家侧与敌军变体侧是否都能正确结算
- 英雄被动是否真能改变推荐编组
- 低费、中费、高费和终结兵是否都存在明确定位
