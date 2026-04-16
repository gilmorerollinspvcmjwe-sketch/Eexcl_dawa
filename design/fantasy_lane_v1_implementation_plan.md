# 奇幻战线 v1 实施计划

- 日期：2026-04-16
- 规则源：`design/fantasy_lane_v1_rules_master.md`
- 范围：`src/features/fantasy_lane/*`、`src/components/fantasy_lane/*`、`src/styles/fantasy-lane.css`
- 目标：把当前 fantasy_lane 从“已有骨架”收口成一套严格遵守 v1 规则总表、可稳定扩关扩兵的正式运行时

---

## 1. 当前现状

当前仓库已经有：

- 运行时骨架：
  - `fantasyLaneTypes.ts`
  - `fantasyLaneUnitRegistry.ts`
  - `fantasyLaneLevelCatalog.ts`
  - `fantasyLaneRuntime.ts`
  - `fantasyLaneProgressStorage.ts`
  - `fantasyLaneSelectionBridge.ts`
- UI 骨架：
  - `FantasyLaneSheet.tsx`
  - `FantasyLaneBoard.tsx`
  - `FantasyLaneHud.tsx`
  - `FantasyLaneLoadoutPanel.tsx`
  - `FantasyLaneResultPanel.tsx`
  - `FantasyLaneChapterSheet.tsx`
  - `FantasyLaneRosterSheet.tsx`
  - `FantasyLaneUnitSprite.tsx`
- 资产层：
  - `assets/drawTanks.ts`
  - `drawMelee.ts`
  - `drawRanged.ts`
  - `drawMagic.ts`
  - `drawAir.ts`
  - `drawBoss.ts`
  - `unitConfigs.ts`

也就是说，这次不是从 0 开始，而是要把现有骨架**严格对齐到 v1 规则总表**。

---

## 2. 实施总原则

### 2.1 不做的事

v1 阶段明确不做：

1. 多路兵线
2. 复杂技能拖选
3. 边走边打
4. 硬物理引擎
5. 大量临时特判破坏表驱动

### 2.2 必须保证的事

1. 地面 / 空中双层明确分离
2. 近战 / 远程 / 空军三套行为协议独立
3. 单位字段完整、注册表可校验
4. HUD 高信息密度但不遮挡主战场
5. 运行时统计、调试、测试可落地

### 2.3 落地顺序

必须按这个顺序，不倒置：

1. 类型与数据表
2. 行为与碰撞
3. 攻击与伤害
4. HUD 与战场可读性
5. 关卡与节奏
6. 统计、调试、测试

---

## 3. 工作拆分

为避免并行冲突，按三条不重叠写入范围执行：

### Lane A：运行时规则线
负责：
- `fantasyLaneTypes.ts`
- `fantasyLaneUnitRegistry.ts`
- `fantasyLaneRuntime.ts`

目标：
- 把规则总表 2~11 节落成真实运行时约束

### Lane B：关卡/进度/测试线
负责：
- `fantasyLaneLevelCatalog.ts`
- `fantasyLaneProgressStorage.ts`
- `tests/fantasyLaneRuntime.test.ts`
- `tests/fantasyLaneProgressStorage.test.ts`
- 如需要新增 fantasy_lane 测试文件

目标：
- 把章节、关卡、Boss、存档、统计、回放接口定义清楚并可测

### Lane C：UI/展示线
负责：
- `src/components/fantasy_lane/*`
- `src/styles/fantasy-lane.css`
- `src/features/fantasy_lane/assets/*`

目标：
- 把 Excel 风格壳层、HUD、主战场、兵种显示和调试视图做对

---

## 4. 详细落地项

---

## 4.1 类型层对齐规则总表

### 目标

让每个兵种都具备规则总表第 3 节要求的完整字段。

### 必须字段

- `id`
- `name`
- `shortName`
- `cost`
- `pop`
- `maxHp`
- `armorHp`
- `layer`
- `rangeBand`
- `footprint`
- `role`
- `damageType`
- `damageProfile`
- `targetRule`
- `moveSpeed`
- `acquireRange`
- `preferredRange`
- `minimumRange`
- `attackIntervalMs`
- `attackWindupMs`
- `attackAnimMs`
- `projectileSpeed`
- `collisionRadius`
- `splashRadius`

### 实现方式

1. 在 `fantasyLaneTypes.ts` 中补齐类型
2. 在 `fantasyLaneUnitRegistry.ts` 中逐单位补全
3. 添加注册表校验函数：
   - 缺字段报错
   - 枚举值非法报错
   - 数值越界报错

### 验收

- 单位注册表中所有单位都能通过校验
- 不再依赖运行时默认兜底补字段

---

## 4.2 战场空间模型统一

### 目标

把规则总表第 2 节里的战场坐标真正做成统一常量和公共函数。

### 固定规则

- 主战场单路
- `x = 0 ~ 100`
- 我方主堡：`x = 3`
- 敌方主堡：`x = 97`
- 我方出兵点：`x = 8`
- 敌方出兵点：`x = 92`
- 双层：`ground / air`

### 实现方式

在运行时收成统一函数：

- `getBattleCenter()`
- `getGroundFrontline()`
- `getAirControlDelta()`
- `getPlayerSpawnX()`
- `getEnemySpawnX()`

### 验收

- 运行时、UI、关卡都读同一套坐标来源
- 不再出现散落常量和手写偏移

---

## 4.3 行为协议拆分

### 目标

把近战 / 远程 / 空军三类逻辑真正拆开。

### 近战规则

- 有目标就推进
- 进入攻击距离就停下
- 目标死亡立即重选
- 无目标就继续推主堡
- 不主动后撤

### 远程规则

- 以 `preferredRange` 为主
- 未进射程时前进
- 进射程后停下输出
- 敌人贴进 `minimumRange` 内时轻微后撤或让位
- 不做边走边打

### 空军规则

- 不受地面碰撞阻挡
- 只受空军软碰撞
- 高威胁空军优先级更高

### 实现方式

在 `fantasyLaneRuntime.ts` 中拆：

- `updateMeleeUnitIntent()`
- `updateRangedUnitIntent()`
- `updateAirUnitIntent()`
- `resolveTargeting()`
- `resolveMovement()`
- `resolveRetreat()`

### 验收

- 三类单位的移动/接敌行为明显可区分
- 不再共用一套模糊逻辑

---

## 4.4 软碰撞、站位与接敌

### 目标

保证规则总表第 5 节成立：

- 友军软碰撞
- 不整排冻结
- 巨型阻挡更强
- 小体型更容易穿插
- 空军与地面阻挡分离

### 实现方式

不要上物理引擎，v1 只做：

- 位置重叠检测
- 横向减速
- 纵向轻微漂移
- footprint 加权
- 层级隔离

### 验收

- 后军不会永远站桩
- 空军不会被地面单位卡住

---

## 4.5 目标评分与换目标延迟

### 目标

把规则总表第 4.5 / 4.6 节做实。

### 评分因子

- 距离
- 威胁
- 人口
- 克制权重
- 主堡压迫
- 空优目标

### 特殊高威胁

- `caster`
- `siege`
- `finisher`
- 高人口空军

### 实现方式

- `scoreTargetForUnit()`
- `shouldRetainCurrentTarget()`
- `retargetCooldownMs`

### 验收

- 单位不会每 tick 抖目标
- 集火优先级能看出倾向

---

## 4.6 攻击与投射物流程统一

### 目标

统一攻击链路：

1. 索敌
2. 射程判定
3. 前摇
4. 出手
5. 即时命中 / 发射投射物
6. 进入攻击间隔

### 实现要求

- 近战与远程都有锁脚
- 远程全部走投射物
- AOE 投射物命中后再做范围伤害
- 技能释放与普通攻击走兼容时序

### 验收

- 攻击节奏清晰
- 近战不像瞬发贴脸秒伤
- 远程不是直接魔法扣血

---

## 4.7 伤害、护甲、克制表

### 目标

把规则总表第 7 节的克制矩阵落成代码，不允许再散在 if/else。

### 需要落地

- 护甲类型：
  - `light`
  - `heavy`
  - `swarm`
  - `structure`
  - `air`
- 伤害类型：
  - `physical`
  - `pierce`
  - `blast`
  - `magic`
  - `siege`
  - `antiAir`
- 克制矩阵
- AOE 外圈衰减

### 验收

- 所有伤害都走统一查表
- 主伤害 / AOE / 对建筑伤害逻辑一致

---

## 4.8 经济与出兵规则

### 目标

把第 8 节规则做成统一经济系统。

### 必须落地

- 金币上限 `320`
- 玩家人口上限 `18`
- 指令队列 `5`
- 玩家全局出兵 CD `320ms`
- 敌军全局出兵 CD `420ms`
- 囤钱衰减
- 巨型单位上限

### 验收

- 不会无限囤钱爆铺
- 不会无上限压巨型单位

---

## 4.9 HUD 与 UI 收口

### 目标

让 HUD 完全符合规则总表第 12 节。

### 必须常驻显示

- 金币
- 人口
- 双方主堡 HP
- 当前阶段
- 前线位置
- 空优差值
- 拥堵度
- 指令队列
- 英雄技能 CD
- 战术技能 CD

### UI 原则

- Excel 风格外壳
- 主战场最大焦点
- 中央不挂大卡片
- 主堡区 / 出生区 / 交战中心可视标记稳定

### 验收

- 信息全
- 不挡主战场
- 一眼能看懂空地分层和主堡压力

---

## 4.10 关卡与章节落地

### 章节原则

每章只教 1~2 个命题：

1. 前排 / 群伤 / 基础铺线
2. 持续召唤 / 拖线
3. 对空 / 控场
4. 破甲 / 攻城 / 高费转折
5. 空地混编 / 最终收口

### 关卡结构

普通关：

1. 开场读题段
2. 中段对推段
3. 尾段加压段

Boss 关：

1. HP 阈值阶段
2. 阶段预警
3. 阶段召唤
4. 阶段强化

### 验收

- 每章主题清晰
- 不是只换敌人名字和数值

---

## 4.11 统计、调试、回放接口

### 目标

把规则总表第 16 节里的统计全部留口。

### 必须记录

- 每局召唤数
- 每局击败数
- 投射物发射数
- AOE 命中数
- 前排人口投放量
- 对空人口投放量
- 金币高位停留时间
- 拥堵时间
- 技能释放次数与时间点
- 单位平均接敌时间

### 建议额外留口

- 关键事件流
- 波次节点
- 前线波动
- 基地受伤时间点

---

## 5. 多 agent 执行建议

## Agent A：运行时规则线

### 写入范围
- `fantasyLaneTypes.ts`
- `fantasyLaneUnitRegistry.ts`
- `fantasyLaneRuntime.ts`

### 任务
- 单位字段补齐
- 行为协议拆分
- 软碰撞
- 攻击流程
- 克制矩阵
- 经济与出兵规则

---

## Agent B：关卡/进度/测试线

### 写入范围
- `fantasyLaneLevelCatalog.ts`
- `fantasyLaneProgressStorage.ts`
- `tests/fantasyLaneRuntime.test.ts`
- `tests/fantasyLaneProgressStorage.test.ts`
- 如需新增 fantasy_lane 测试文件

### 任务
- 章节结构
- Boss 关
- 存档统计
- 回放接口
- 调试统计

---

## Agent C：UI/展示线

### 写入范围
- `src/components/fantasy_lane/*`
- `src/styles/fantasy-lane.css`
- `src/features/fantasy_lane/assets/*`

### 任务
- HUD
- 主战场层级
- 单位显示
- 投射物视觉
- 技能预警
- 兵种预览与 roster 展示

---

## 6. 验收口径

v1 做完后，最低要满足：

### 玩法
- 近战 / 远程 / 空军逻辑明确分离
- 不整排卡死
- 克制关系稳定
- 战斗节奏清楚

### UI
- 主堡 / 前线 / 空优 / 拥堵一眼可读
- Excel 风格成立
- 主战场仍是焦点

### 数据
- 单位、关卡、技能可表驱动扩展
- 新兵种进入可自动发现缺字段

### 工程
- 有统计
- 有调试
- 有回放接口
- 有测试

---

## 7. 推荐第一批开发顺序

1. 类型和注册表校验
2. 运行时三类行为协议
3. 软碰撞与接敌
4. 攻击 / 投射物 / 伤害矩阵
5. HUD 对齐
6. 章节关卡与 Boss
7. 统计 / 调试 / 测试

---

## 8. 分阶段执行拆分（Phase 1 ~ 5）

> 目标不是“一次性做完所有内容”，而是把整份计划拆成可以独立验收、可以并行执行、每一阶段都能过 `lint / build / test` 的五个批次。

### Phase 1：规则基线锁定

#### 目标
- 先让 v1 规则总表变成真正的运行时代码基线

#### 范围
- `fantasyLaneTypes.ts`
- `fantasyLaneUnitRegistry.ts`
- `fantasyLaneRuntime.ts`
- `fantasyLaneRuntimeRules.ts`

#### 重点
1. 单位标准字段补齐
2. 近战 / 远程 / 空军协议分离
3. 软碰撞 / 站位 / 接敌稳定
4. 伤害矩阵、护甲、AOE 规则统一
5. 经济、人口、队列、全局 CD 收口

#### 验收
- 不整排冻结
- 空军不被地面阻挡
- 三类单位行为明显不同
- 运行时基础测试通过

---

### Phase 2：关卡与章节系统

#### 目标
- 让 `fantasy_lane` 从“能打一局”进入“有章节推进的主线”

#### 范围
- `fantasyLaneLevelCatalog.ts`
- `fantasyLaneProgressStorage.ts`
- `tests/fantasyLaneRuntime.test.ts`
- `tests/fantasyLaneProgressStorage.test.ts`

#### 重点
1. 5 章 30 关结构严格对齐总表
2. 普通关三段节奏固定化
3. Boss 关多阶段化
4. 章节推进、星级、最近战斗、回放接口稳定

#### 验收
- 每章只有 1~2 个核心命题
- Boss 关不是单纯血厚
- 进度和章节推进正确记录

---

### Phase 3：HUD 与主战场表现

#### 目标
- 在不遮挡战场的前提下，把总表要求的信息全部展示出来

#### 范围
- `FantasyLaneHud.tsx`
- `FantasyLaneBoard.tsx`
- `FantasyLaneSheet.tsx`
- `fantasy-lane.css`

#### 重点
1. 常驻 HUD 字段补齐
2. 主堡 / 出生区 / 交战中心可视化
3. 空地分层和前线/空优/拥堵直观化
4. 中心区域不再出现大卡片遮挡

#### 验收
- HUD 信息全但不挡主战场
- 一眼能看懂主堡压力、前线、空优

---

### Phase 4：兵种视觉与战斗反馈

#### 目标
- 让战斗“看起来在打仗”，不是抽象数值对撞

#### 范围
- `src/features/fantasy_lane/assets/*`
- `FantasyLaneUnitSprite.tsx`
- `FantasyLaneBoard.tsx`
- `fantasy-lane.css`

#### 重点
1. 投射物按兵种区分
2. 近战命中火花
3. AOE 爆点
4. 技能预警圈
5. 巨型单位压迫感

#### 验收
- 不看数值也能看懂谁在输出、谁在对空、谁在攻城

---

### Phase 5：统计、调试、复盘

#### 目标
- 把 fantasy_lane 做成可以长期调优和扩展的模块

#### 范围
- `fantasyLaneRuntime.ts`
- `fantasyLaneProgressStorage.ts`
- `FantasyLaneResultPanel.tsx`
- 如需要可新增 debug/replay 面板

#### 重点
1. 统计口全部落地
2. recent runs / runtime totals 可读
3. replay/debug 数据可追
4. 局后复盘能解释“为什么输”

#### 验收
- 一局结束后能输出结构化战报
- 后续加兵种/关卡时有数据支撑

---

## 9. 多 agent 执行建议

每个 Phase 默认仍按三条线并行：

### A 线：运行时规则线
- `types`
- `runtime`
- `unit registry`

### B 线：关卡 / 进度 / 测试线
- `level catalog`
- `progress storage`
- `tests`

### C 线：UI / 展示线
- `HUD`
- `board`
- `sheet`
- `css`
- `assets`

这样能保证：
- 写入范围尽量不重叠
- 并行冲突少
- 每一批都可独立验收

