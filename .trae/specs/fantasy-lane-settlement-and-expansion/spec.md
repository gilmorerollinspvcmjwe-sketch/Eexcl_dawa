# 奇幻战线：关卡结算兵种渠道与游戏扩展 Spec

## Why
当前游戏缺少"通过关卡结算获得新兵种"的完整循环。所有兵种默认解锁，玩家没有长期目标感。需要设计完整的兵种解锁渠道、扩充兵种和关卡，提升游戏可玩性。

## What Changes
- 新增关卡结算兵种解锁系统（首次通关、星级奖励、碎片收集）
- 新增 15 个兵种（10 地面 + 5 空中）
- 新增 2 个章节（12 关，含 2 个 Boss 关）
- 扩展进度存储、结算 UI、兵种图鉴

## Impact
- 受影响文件（按 agent 分组，无重叠）：
  - **Agent 1（类型+存储+结算逻辑）**：`fantasyLaneTypes.ts`、`fantasyLaneProgressStorage.ts`、`fantasyLaneRuntime.ts`
  - **Agent 2（兵种注册）**：`fantasyLaneUnitRegistry.ts`
  - **Agent 3（关卡目录）**：`fantasyLaneLevelCatalog.ts`
  - **Agent 4（结算 UI）**：`FantasyLaneResultPanel.tsx`、`FantasyLaneSheet.tsx`
  - **Agent 5（图鉴 UI）**：`FantasyLaneRosterSheet.tsx`
  - **Agent 6（样式）**：`fantasy-lane.css`

---

## ADDED Requirements

### Requirement 1: 关卡结算兵种解锁系统

#### 1.1 解锁渠道设计

**渠道 A：首次通关解锁**
- 每关首次通关（任意星级）解锁 1 个兵种
- 解锁逻辑：关卡定义中 `unlockRewards` 字段指定兵种 ID
- 普通关（1-5 关）：解锁低费兵种（35-80 金）
- Boss 关（第 6 关）：解锁中费兵种（80-130 金）

**渠道 B：三星奖励解锁**
- Boss 关三星评价额外解锁 1 个稀有兵种
- 稀有兵种特征：高费用（130+ 金）、高人口（3+）、强力标签
- 解锁逻辑：关卡定义中 `starRewards[3]` 字段指定兵种 ID

**渠道 C：碎片收集合成**
- 每次通关获得 1-2 个兵种碎片
- 碎片类型由关卡 `fragmentRewards` 字段指定
- 集齐 3 个同兵种碎片可解锁/升星该兵种
- 碎片获取规则：
  - 普通关：1 个碎片（对应关卡推荐兵种）
  - Boss 关：2 个碎片（对应章节核心兵种）
  - 三星额外 +1 碎片

#### 1.2 结算界面展示

**结算面板新增区域（在原有星级/分数下方）：**

```
┌─────────────────────────────────────┐
│  ⭐⭐⭐  战线推进成功                  │
│  评分：2840                          │
├─────────────────────────────────────┤
│  🎁 获得奖励                         │
│  ┌─────────┐  ┌─────────┐          │
│  │ 🛡 新！  │  │ 🧪×1    │          │
│  │ 圣骑士   │  │ 瘟疫投手 │          │
│  │ 首次通关 │  │ 碎片    │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

**动画效果：**
- 新兵种卡片：从上方飞入 + 金色光晕闪烁（1.5 秒）
- 碎片获得：从中间弹出 + 数字跳动（+1 动画）

#### 1.3 与当前实现结合

**修改 `fantasyLaneRuntime.ts` 的 `finalizeBattle` 函数：**
- 在生成 `FantasyLaneBattleResult` 时，附加 `rewards` 字段
- 读取关卡定义的 `unlockRewards`、`fragmentRewards`、`starRewards`
- 根据通关情况计算实际奖励

**修改 `FantasyLaneSheet.tsx` 的结算记录逻辑：**
- 在 `recordFantasyLaneLevelResult` 后，调用新的奖励发放函数
- 更新进度存储中的 `unlockedUnits`、`unitFragments`、`unitStars`

---

### Requirement 3: 新兵种设计（15 个）

#### 3.1 地面兵种（10 个）

**1. 圣骑士 (holy_knight)**
```
费用：105 | 人口：3 | CD：8200ms
角色：tank | 体型：medium | 射程：melee
HP：1050 | 护甲：280 | 伤害：52
移速：2.2 | 攻击间隔：1280ms | 伤害类型：magic
标签：frontline, heavy, heal
素材：金色盾牌 + 十字光效，攻击时释放治疗光环（半径 3.5）
特殊：每 3 次攻击为周围友军恢复 60 HP
解锁：第二章第 2 关首次通关
```

**2. 德鲁伊 (druid)**
```
费用：88 | 人口：2 | CD：6200ms
角色：caster | 体型：small | 射程：ranged
HP：320 | 护甲：0 | 伤害：38
移速：1.5 | 攻击间隔：1420ms | 伤害类型：magic
射程：18 | 最小射程：3 | 弹速：20
标签：aoe, heal, support
素材：绿色法杖 + 树叶环绕，攻击时投射绿色光球
特殊：攻击有 25% 概率为最近友军恢复 45 HP
解锁：第三章第 1 关首次通关
```

**3. 攻城锤 (siege_ram)**
```
费用：135 | 人口：3 | CD：10200ms
角色：siege | 体型：large | 射程：melee
HP：920 | 护甲：180 | 伤害：148
移速：1.0 | 攻击间隔：1960ms | 伤害类型：siege
标签：siege, heavy, antiStructure
素材：木质撞锤 + 铁甲包裹，攻击时产生木屑飞溅
特殊：对建筑伤害 ×2.0，对单位伤害 ×0.7
解锁：第四章第 1 关首次通关
```

**4. 暗影猎手 (shadow_hunter)**
```
费用：118 | 人口：2 | CD：8800ms
角色：fighter | 体型：small | 射程：melee
HP：480 | 护甲：0 | 伤害：136
移速：5.8 | 攻击间隔：860ms | 伤害类型：pierce
标签：burst, finisher, stealth
素材：黑色斗篷 + 双匕首，移动时有残影效果
特殊：首次攻击目标时伤害 +40%（背刺）
解锁：第五章第 1 关首次通关
```

**5. 元素使 (elementalist)**
```
费用：142 | 人口：3 | CD：10800ms
角色：caster | 体型：medium | 射程：ranged
HP：340 | 护甲：0 | 伤害：78
移速：1.4 | 攻击间隔：1520ms | 伤害类型：magic
射程：19 | 最小射程：3.5 | 弹速：22 | 溅射半径：4.2
标签：aoe, burn, elemental
素材：三色法球（红蓝绿）环绕，攻击时随机切换元素
特殊：每次攻击随机造成 燃烧/冻结/感电 效果（持续 3 秒）
解锁：第四章第 3 关三星奖励
```

**6. 重装弩手 (heavy_crossbow)**
```
费用：96 | 人口：2 | CD：7200ms
角色：sniper | 体型：medium | 射程：ranged
HP：360 | 护甲：60 | 伤害：88
移速：1.6 | 攻击间隔：1380ms | 伤害类型：pierce
射程：26 | 最小射程：4 | 弹速：48
标签：pierce, antiAir, heavy
素材：重型弩车 + 铁甲，发射粗大弩箭
特殊：对重甲单位伤害 +30%
解锁：第三章第 3 关首次通关
```

**7. 战地医师 (field_medic)**
```
费用：68 | 人口：2 | CD：5200ms
角色：caster | 体型：small | 射程：ranged
HP：280 | 护甲：0 | 伤害：28
移速：1.8 | 攻击间隔：1180ms | 伤害类型：magic
射程：20 | 最小射程：2 | 弹速：24
标签：heal, support, frontline
素材：医疗包 + 红十字，攻击时投射治疗光球
特殊：优先治疗血量最低的友军，每次恢复 75 HP
解锁：第一章第 3 关首次通关
```

**8. 猛犸象 (mammoth)**
```
费用：185 | 人口：4 | CD：14200ms
角色：tank | 体型：giant | 射程：melee
HP：1680 | 护甲：320 | 伤害：78
移速：1.1 | 攻击间隔：1680ms | 伤害类型：physical
标签：frontline, heavy, aoe
素材：巨型猛犸 + 象牙装甲，攻击时地面震动
特殊：攻击溅射半径 2.8，阻挡 +40%
解锁：第四章第 4 关首次通关
```

**9. 爆破专家 (demolitionist)**
```
费用：158 | 人口：3 | CD：11800ms
角色：siege | 体型：medium | 射程：ranged
HP：300 | 护甲：0 | 伤害：124
移速：1.3 | 攻击间隔：1720ms | 伤害类型：blast
射程：22 | 最小射程：4 | 弹速：18 | 溅射半径：5.2
标签：siege, aoe, antiStructure
素材：炸药包 + 引信，投射爆炸物
特殊：对建筑伤害 ×1.8，溅射伤害 70%
解锁：第五章第 2 关首次通关
```

**10. 剑圣 (blade_master)**
```
费用：215 | 人口：5 | CD：16800ms
角色：finisher | 体型：medium | 射程：melee
HP：720 | 护甲：0 | 伤害：198
移速：4.8 | 攻击间隔：780ms | 伤害类型：pierce
标签：burst, finisher, pierce
素材：双刀 + 剑气特效，攻击时有刀光轨迹
特殊：对生命值低于 30% 的单位伤害 +60%（斩杀）
解锁：第五章 Boss 关三星奖励
```

#### 3.2 空中兵种（5 个）

**11. 风灵 (wind_spirit)**
```
费用：78 | 人口：2 | CD：5800ms
角色：air_sup | 体型：small | 射程：melee
HP：340 | 护甲：0 | 伤害：52
移速：6.2 | 攻击间隔：780ms | 伤害类型：antiAir
标签：antiAir, swarm, fast
素材：半透明风元素 + 气流轨迹，移动快速
特殊：移速 +30%，但 HP -15%
解锁：第二章第 4 关首次通关
```

**12. 石像鬼 (gargoyle)**
```
费用：108 | 人口：2 | CD：8200ms
角色：fighter | 体型：medium | 射程：melee
HP：680 | 护甲：120 | 伤害：72
移速：4.2 | 攻击间隔：980ms | 伤害类型：physical
标签：antiAir, heavy, frontline
素材：石质翅膀 + 岩石皮肤，攻击时碎石飞溅
特殊：受到致命伤害时保留 1 HP（每场战斗 1 次）
解锁：第三章第 4 关首次通关
```

**13. 凤凰 (phoenix)**
```
费用：155 | 人口：3 | CD：12200ms
角色：caster | 体型：large | 射程：ranged
HP：820 | 护甲：80 | 伤害：96
移速：3.6 | 攻击间隔：1280ms | 伤害类型：blast
射程：14 | 最小射程：2 | 弹速：20 | 溅射半径：4.8
标签：aoe, burn, revive
素材：火焰鸟 + 尾焰，死亡时爆炸（半径 5，伤害 120）
特殊：死亡后 8 秒复活（HP 50%，每场战斗 1 次）
解锁：第四章 Boss 关三星奖励
```

**14. 雷鹰 (thunder_eagle)**
```
费用：132 | 人口：3 | CD：9800ms
角色：sniper | 体型：medium | 射程：ranged
HP：420 | 护甲：40 | 伤害：108
移速：4.8 | 攻击间隔：1420ms | 伤害类型：antiAir
射程：28 | 最小射程：5 | 弹速：52
标签：antiAir, pierce, focus
素材：雷电环绕的巨鹰，投射闪电箭
特殊：优先攻击高威胁空军目标，对其伤害 +25%
解锁：第五章第 3 关首次通关
```

**15. 天使 (angel)**
```
费用：175 | 人口：4 | CD：13800ms
角色：air_sup | 体型：large | 射程：ranged
HP：680 | 护甲：60 | 伤害：48
移速：3.2 | 攻击间隔：1180ms | 伤害类型：magic
射程：22 | 最小射程：3 | 弹速：26
标签：heal, shield, support
素材：白色羽翼 + 光环，投射治疗光束
特殊：每 4 次攻击为全体友军恢复 55 HP + 添加护盾（80 HP，持续 5 秒）
解锁：第五章第 4 关首次通关
```

---

### Requirement 4: 新关卡设计（2 章 12 关）

#### 4.1 第六章：幽暗密林

**章节信息：**
```
ID: chapter-6
名称：幽暗密林
主题：森林精灵与暗影生物的战斗
焦点：高机动单位、隐身机制、地形优势
Boss：暗影领主 (shadow_lord)
时间限制：480 秒
基地血量：3200
起始金币：148
敌人池：shadow_hunter, wind_spirit, druid, elf_shooter, crypt_crawler
推荐英雄：archmage, dragon_rider
```

**关卡 6-1：林间伏击**
```
名称：林间伏击
提示：高机动单位会从侧翼切入，注意中后排保护
推荐标签：frontline, antiAir
描述：第六章开门就展示高机动单位的威胁

阶段 1（0-52 秒）- 开场读题：
  - 暗影猎手 ×3，间隔 6.2 秒，中线（测试侧翼切入）
  - 风灵 ×2，间隔 7.5 秒，空层（测试对空反应）

阶段 2（52-148 秒）- 中段对推：
  - 暗影猎手 ×4，间隔 5.8 秒，中线（持续侧翼压力）
  - 精灵射手 ×3，间隔 7.2 秒，后排（远程消耗）

阶段 3（148 秒+）- 尾段加压：
  - 德鲁伊 ×2，间隔 9.5 秒，后排（敌方治疗压力）
  - 暗影猎手 ×3，间隔 5.4 秒，中线（最终切入）

解锁奖励：wind_spirit（风灵）
碎片奖励：elf_shooter ×1
```

**关卡 6-2：古树防线**
```
名称：古树防线
提示：敌方会利用地形掩护推进，群伤是关键
推荐标签：aoe, frontline
描述：引入"丛林掩护"机制（特定区域单位获得 15% 闪避）

阶段 1（0-54 秒）：
  - 墓穴爬兽 ×5，间隔 3.8 秒，中线（小怪海）
  - 德鲁伊 ×2，间隔 10 秒，后排（治疗掩护）

阶段 2（54-150 秒）：
  - 精灵射手 ×4，间隔 6.8 秒，后排（远程压制）
  - 墓穴爬兽 ×4，间隔 4.2 秒，中线（持续滚线）

阶段 3（150 秒+）：
  - 暗影猎手 ×3，间隔 5.6 秒，中线（切入后排）
  - 德鲁伊 ×2，间隔 9.2 秒，后排（维持战线）

解锁奖励：druid（德鲁伊）
碎片奖励：shadow_hunter ×1
```

**关卡 6-3：暗影穿梭**
```
名称：暗影穿梭
提示：高机动单位会反复穿插，保持阵型完整
推荐标签：frontline, burst
描述：专项测试应对高机动单位的能力

阶段 1（0-50 秒）：
  - 风灵 ×4，间隔 4.5 秒，空层（高频空袭）
  - 暗影猎手 ×2，间隔 7 秒，中线（地面切入）

阶段 2（50-146 秒）：
  - 暗影猎手 ×5，间隔 5.2 秒，中线（密集切入）
  - 精灵射手 ×3，间隔 7 秒，后排（远程配合）

阶段 3（146 秒+）：
  - 风灵 ×3，间隔 4.2 秒，空层（空层施压）
  - 暗影猎手 ×3，间隔 5 秒，中线（最终穿插）

解锁奖励：无（碎片关）
碎片奖励：shadow_hunter ×2, wind_spirit ×1
```

**关卡 6-4：精灵弓阵**
```
名称：精灵弓阵
提示：敌方后排火力密集，需要快速突破前线
推荐标签：pierce, frontline
描述：测试破甲和快速突破能力

阶段 1（0-56 秒）：
  - 精灵射手 ×3，间隔 7.5 秒，后排（弓阵起手）
  - 墓穴爬兽 ×3，间隔 5 秒，中线（掩护推进）

阶段 2（56-154 秒）：
  - 精灵射手 ×5，间隔 6.2 秒，后排（密集火力）
  - 德鲁伊 ×2，间隔 9.8 秒，后排（治疗维持）

阶段 3（154 秒+）：
  - 暗影猎手 ×4，间隔 5 秒，中线（切入配合）
  - 精灵射手 ×3，间隔 6.5 秒，后排（持续压制）

解锁奖励：heavy_crossbow（重装弩手）
碎片奖励：druid ×1
```

**关卡 6-5：密林总测**
```
名称：密林总测
提示：高机动、治疗、远程三线合一，考验综合应对
推荐标签：frontline, antiAir, burst
描述：第六章考试关，合并所有命题

阶段 1（0-54 秒）：
  - 暗影猎手 ×3，间隔 6 秒，中线（切入起手）
  - 风灵 ×3，间隔 4.8 秒，空层（空层同步）

阶段 2（54-156 秒）：
  - 精灵射手 ×4，间隔 6.5 秒，后排（远程压制）
  - 德鲁伊 ×2，间隔 9.5 秒，后排（治疗维持）
  - 暗影猎手 ×3，间隔 5.5 秒，中线（持续切入）

阶段 3（156 秒+）：
  - 风灵 ×3，间隔 4.2 秒，空层（空层终压）
  - 暗影猎手 ×3，间隔 5 秒，中线（最终穿插）

解锁奖励：无（考试关）
碎片奖励：shadow_hunter ×1, wind_spirit ×1, druid ×1
```

**关卡 6-6：暗影领主（Boss 关）**
```
名称：暗影领主
提示：Boss 会反复隐身和召唤，保持视野和输出节奏
推荐标签：frontline, antiAir, finisher
描述：第六章 Boss，多阶段隐身 + 召唤

阶段 1（0-46 秒）- 开场读题：
  - 暗影猎手 ×3，间隔 6 秒，中线（Boss 前热身）
  - 风灵 ×2，间隔 5 秒，空层（空层试探）

阶段 2（46-98 秒）- 中段对推：
  - 精灵射手 ×3，间隔 7 秒，后排（远程压制）
  - 德鲁伊 ×2，间隔 9.5 秒，后排（治疗压力）

阶段 3（98-154 秒）- Boss 登场：
  - 暗影领主 ×1，间隔 999 秒，中线（Boss 入场）

阶段 4（154 秒+）- 终局收口：
  - 暗影猎手 ×3，间隔 5.2 秒，中线（最终切入）
  - 风灵 ×2，间隔 4.5 秒，空层（空层配合）

Boss 阶段：
  P1（100% HP）：隐身 + 召唤暗影猎手 ×4
  P2（72% HP）：显形 + 精灵弓阵 ×3 + 风灵 ×3
  P3（44% HP）：隐身 + 召唤墓穴爬兽 ×5 + 德鲁伊 ×2
  P4（20% HP）：狂暴 + 全单位密集召唤

解锁奖励：shadow_hunter（暗影猎手）
碎片奖励：shadow_hunter ×2, wind_spirit ×1, druid ×1
三星奖励：blade_master（剑圣）
```

#### 4.2 第七章：天空之城

**章节信息：**
```
ID: chapter-7
名称：天空之城
主题：空战主导的终极挑战
焦点：空军对抗、制空权争夺
Boss：风暴巨龙 (storm_dragon)
时间限制：510 秒
基地血量：3300
起始金币：155
敌人池：fire_dragon, young_dragon, phoenix, thunder_eagle, angel
推荐英雄：dragon_rider, archmage
```

**关卡 7-1：云端前哨**
```
名称：云端前哨
提示：空层是主战场，地面只是辅助
推荐标签：antiAir, finisher
描述：第七章开门确立空战主题

阶段 1（0-52 秒）：
  - 风灵 ×4，间隔 4.2 秒，空层（空袭起手）
  - 幼龙 ×2，间隔 9 秒，空层（中压试探）

阶段 2（52-148 秒）：
  - 雷鹰 ×3，间隔 8.5 秒，空层（远程空战）
  - 风灵 ×3，间隔 4.5 秒，空层（持续骚扰）

阶段 3（148 秒+）：
  - 幼龙 ×2，间隔 8.8 秒，空层（空层加压）
  - 雷鹰 ×2，间隔 8.2 秒，空层（远程压制）

解锁奖励：thunder_eagle（雷鹰）
碎片奖励：young_dragon ×1
```

**关卡 7-2：凤凰涅槃**
```
名称：凤凰涅槃
提示：凤凰死亡会爆炸并复活，需要持续压制
推荐标签：antiAir, aoe
描述：引入凤凰的复活机制

阶段 1（0-54 秒）：
  - 凤凰 ×2，间隔 11 秒，空层（凤凰亮相）
  - 风灵 ×3，间隔 4.5 秒，空层（掩护推进）

阶段 2（54-152 秒）：
  - 凤凰 ×2，间隔 10.5 秒，空层（持续施压）
  - 雷鹰 ×3，间隔 8.2 秒，空层（远程配合）

阶段 3（152 秒+）：
  - 幼龙 ×2，间隔 8.5 秒，空层（空层终压）
  - 凤凰 ×1，间隔 10 秒，空层（复活压力）

解锁奖励：phoenix（凤凰）
碎片奖励：thunder_eagle ×1
```

**关卡 7-3：天使降临**
```
名称：天使降临
提示：敌方治疗 + 护盾会让战线拖长，需要爆发输出
推荐标签：antiAir, burst
描述：测试应对治疗和护盾的能力

阶段 1（0-56 秒）：
  - 天使 ×2，间隔 12 秒，空层（治疗起手）
  - 风灵 ×3，间隔 4.2 秒，空层（骚扰掩护）

阶段 2（56-156 秒）：
  - 天使 ×2，间隔 11.5 秒，空层（持续治疗）
  - 雷鹰 ×3，间隔 8 秒，空层（远程输出）
  - 幼龙 ×2，间隔 8.8 秒，空层（空层加压）

阶段 3（156 秒+）：
  - 天使 ×2，间隔 11 秒，空层（治疗维持）
  - 凤凰 ×1，间隔 10 秒，空层（复活压力）

解锁奖励：angel（天使）
碎片奖励：phoenix ×1
```

**关卡 7-4：龙群风暴**
```
名称：龙群风暴
提示：多条龙同时在场，制空权争夺白热化
推荐标签：antiAir, finisher
描述：高强度空战测试

阶段 1（0-54 秒）：
  - 幼龙 ×3，间隔 8.5 秒，空层（龙群起手）
  - 雷鹰 ×2，间隔 8.2 秒，空层（远程配合）

阶段 2（54-154 秒）：
  - 火龙 ×2，间隔 11.5 秒，空层（火龙入场）
  - 幼龙 ×3，间隔 8 秒，空层（龙群密度）
  - 天使 ×1，间隔 12 秒，空层（治疗支援）

阶段 3（154 秒+）：
  - 火龙 ×2，间隔 11 秒，空层（空层终压）
  - 凤凰 ×1，间隔 10 秒，空层（复活压力）

解锁奖励：无（碎片关）
碎片奖励：young_dragon ×2, phoenix ×1
```

**关卡 7-5：天空决战前**
```
名称：天空决战前
提示：总 Boss 前的最终考试，空战能力全面检验
推荐标签：antiAir, finisher, aoe
描述：第七章考试关

阶段 1（0-56 秒）：
  - 幼龙 ×3，间隔 8.2 秒，空层（龙群起手）
  - 雷鹰 ×2，间隔 8 秒，空层（远程压制）

阶段 2（56-158 秒）：
  - 火龙 ×2，间隔 11.2 秒，空层（火龙施压）
  - 天使 ×2，间隔 11.5 秒，空层（治疗维持）
  - 凤凰 ×1，间隔 10 秒，空层（复活压力）

阶段 3（158 秒+）：
  - 火龙 ×2，间隔 10.8 秒，空层（空层终压）
  - 幼龙 ×3，间隔 7.8 秒，空层（龙群密度）

解锁奖励：无（考试关）
碎片奖励：thunder_eagle ×1, phoenix ×1, angel ×1
```

**关卡 7-6：风暴巨龙（Boss 关）**
```
名称：风暴巨龙
提示：Boss 会召唤空军并释放全屏 AOE，保持分散和持续输出
推荐标签：antiAir, finisher, aoe
描述：第七章总 Boss，空战终极考验

阶段 1（0-48 秒）- 开场读题：
  - 幼龙 ×3，间隔 8 秒，空层（Boss 前热身）
  - 雷鹰 ×2，间隔 8 秒，空层（远程试探）

阶段 2（48-102 秒）- 中段对推：
  - 火龙 ×2，间隔 11 秒，空层（火龙施压）
  - 天使 ×2，间隔 11.5 秒，空层（治疗压力）

阶段 3（102-158 秒）- Boss 登场：
  - 风暴巨龙 ×1，间隔 999 秒，空层（Boss 入场）

阶段 4（158 秒+）- 终局收口：
  - 幼龙 ×3，间隔 7.8 秒，空层（龙群配合）
  - 凤凰 ×1，间隔 10 秒，空层（复活压力）

Boss 阶段：
  P1（100% HP）：召唤幼龙 ×4 + 风灵 ×3
  P2（70% HP）：全屏 AOE（伤害 80）+ 召唤火龙 ×2
  P3（40% HP）：召唤天使 ×2 + 凤凰 ×1（治疗链）
  P4（18% HP）：狂暴 + 全屏 AOE（伤害 120）+ 全单位密集召唤

解锁奖励：gargoyle（石像鬼）
碎片奖励：young_dragon ×2, phoenix ×1, angel ×1
三星奖励：elementalist（元素使）
```

---

### Requirement 5: 兵种图鉴扩展

#### 5.1 未解锁兵种展示

**视觉设计：**
- 灰色剪影（透明度 40%）
- 兵种图标位置显示"？"
- 名称显示为"???"
- 悬停显示解锁条件提示

**示例：**
```
┌─────────────────┐
│      ???        │
│  ┌───────────┐  │
│  │     ?     │  │
│  │  (灰色)   │  │
│  └───────────┘  │
│  通关 6-2 解锁  │
└─────────────────┘
```

#### 5.2 已解锁兵种详情

**点击兵种卡片弹出详情面板：**
```
┌─────────────────────────────────┐
│ 🛡 圣骑士                        │
├─────────────────────────────────┤
│ 费用：105 | 人口：3 | CD：8.2s  │
│ HP：1050 | 护甲：280 | 伤害：52 │
│ 移速：2.2 | 攻击间隔：1.28s     │
│ 角色：tank | 体型：M | 射程：近战│
├─────────────────────────────────┤
│ 标签：frontline, heavy, heal    │
├─────────────────────────────────┤
│ 特殊：每 3 次攻击为周围友军      │
│ 恢复 60 HP                       │
├─────────────────────────────────┤
│ 星级：⭐⭐ (2/3)                 │
│ 碎片：2/3                        │
└─────────────────────────────────┘
```

#### 5.3 筛选功能扩展

**新增筛选选项：**
- 全部 / 地面 / 空中（已有）
- 已解锁 / 未解锁
- 按费用排序 / 按角色排序

---

### Requirement 6: 进度存储扩展

#### 6.1 新增字段

```typescript
export interface FantasyLaneProgressData {
  // ... 现有字段
  
  // 兵种解锁
  unlockedUnits: string[];           // 已解锁兵种 ID 列表
  unitFragments: Record<string, number>; // 兵种碎片数量 { unitId: count }
  unitStars: Record<string, number>;     // 兵种星级 { unitId: 1-3 }
  
  // 天赋
  unlockedTalents: string[];         // 已解锁天赋 ID 列表
  activeTalents: string[];           // 当前激活的天赋 ID 列表
}
```

#### 6.2 新增辅助函数

```typescript
// 解锁兵种
export function unlockUnit(progress: FantasyLaneProgressData, unitId: string): FantasyLaneProgressData

// 添加兵种碎片
export function addUnitFragment(progress: FantasyLaneProgressData, unitId: string, count: number): FantasyLaneProgressData

// 升级兵种星级
export function upgradeUnitStar(progress: FantasyLaneProgressData, unitId: string): FantasyLaneProgressData

// 解锁天赋
export function unlockTalent(progress: FantasyLaneProgressData, talentId: string): FantasyLaneProgressData

// 检查兵种是否解锁
export function isUnitUnlocked(progress: FantasyLaneProgressData, unitId: string): boolean

// 获取兵种碎片数量
export function getUnitFragmentCount(progress: FantasyLaneProgressData, unitId: string): number
```

#### 6.3 与当前实现结合

**修改 `recordFantasyLaneLevelResult` 函数：**
- 在记录关卡结果后，调用奖励发放逻辑
- 根据关卡定义发放兵种解锁、碎片、天赋解锁

**修改 `normalize` 函数：**
- 处理新字段的默认值和兼容性
- 确保旧存档不会崩溃

---

### Requirement 7: 样式扩展

#### 7.1 结算奖励样式

```css
/* 结算奖励容器 */
.fantasy-lane-rewards {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 12px;
}

/* 新兵种卡片 */
.fantasy-lane-reward-unit {
  position: relative;
  width: 100px;
  padding: 8px;
  background: white;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  animation: rewardFlyIn 1.5s ease-out;
}

.fantasy-lane-reward-unit::after {
  content: '新！';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fbbf24;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  animation: glowPulse 1.5s infinite;
}

/* 碎片卡片 */
.fantasy-lane-reward-fragment {
  width: 80px;
  padding: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
}
```

#### 7.2 未解锁兵种样式

```css
/* 未解锁兵种卡片 */
.fantasy-lane-unit--locked {
  opacity: 0.4;
  filter: grayscale(100%);
  cursor: not-allowed;
}

.fantasy-lane-unit--locked .fantasy-lane-unit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #94a3b8;
}

.fantasy-lane-unit--locked .fantasy-lane-unit-name {
  color: #64748b;
}

.fantasy-lane-unit--locked .fantasy-lane-unit-hint {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
}
```

---

## MODIFIED Requirements

### Requirement: 类型定义扩展

**在 `fantasyLaneTypes.ts` 中新增：**

```typescript
// 兵种解锁条件
export interface FantasyLaneUnitUnlockCondition {
  type: 'level_clear' | 'boss_clear' | 'star_reward' | 'fragment_synthesis';
  levelId?: string;        // 关卡 ID
  stars?: number;          // 所需星级
  fragmentCount?: number;  // 所需碎片数量
}

// 扩展 FantasyLaneUnitDefinition
export interface FantasyLaneUnitDefinition {
  // ... 现有字段
  unlockCondition?: FantasyLaneUnitUnlockCondition;
  baseUnit?: string;  // 基础兵种 ID（用于升星）
}

// 扩展 FantasyLaneLevelDefinition
export interface FantasyLaneLevelDefinition {
  // ... 现有字段
  unlockRewards?: string[];                    // 通关解锁兵种
  fragmentRewards?: Record<string, number>;    // 碎片奖励 { unitId: count }
  starRewards?: Record<number, string[]>;      // 星级奖励 { stars: [unitIds] }
}

// 扩展 FantasyLaneBattleResult
export interface FantasyLaneBattleResult {
  // ... 现有字段
  rewards?: FantasyLaneBattleRewards;
}

export interface FantasyLaneBattleRewards {
  unlockedUnits: string[];           // 新解锁兵种
  fragments: Record<string, number>; // 获得碎片
}
```

### Requirement: 结算逻辑扩展

**在 `fantasyLaneRuntime.ts` 的 `finalizeBattle` 函数中：**

```typescript
// 计算奖励
const rewards = calculateBattleRewards(level, stars, didWin, progress);

const result: FantasyLaneBattleResult = {
  title: didWin ? '战线推进成功' : '战线失守',
  stars,
  score: Math.round(...),
  summary: ...,
  tips: ...,
  rewards,  // 新增字段
};
```

**新增 `calculateBattleRewards` 函数：**
- 读取关卡的 `unlockRewards`、`fragmentRewards`、`starRewards`
- 根据通关情况计算实际奖励
- 返回奖励列表

---

## REMOVED Requirements
无
