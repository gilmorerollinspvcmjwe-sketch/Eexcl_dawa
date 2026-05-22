# Pacman P0/P1/P2 详细扩展设计方案

- 日期：2026-04-15
- 适用模块：`Sheet12 / Sheet13 / src/features/pacman/* / src/components/pacman/*`
- 文档定位：在当前仓库已有 Pacman 运行时、包注册、Sheet12/13 壳层和存档基础上，把后续扩展补成可直接拆开发任务的执行设计
- 本文范围：只定义 Pacman 模块后续 P0/P1/P2 内容与实现，不改工作簿总框架，不改其他模块

---

## 1. 当前落点与设计原则

### 1.1 当前仓库已具备的能力

当前 Pacman 不是空白模块，而是已经具备以下基础：

- `Sheet12` 已有正式对局页，含选包、选关、开局、HUD、结算、暂停、退出、快照恢复
- `Sheet13` 已有图鉴/说明页，含四鬼、水果、迷宫、输入、练习 tab，但练习入口仍是占位
- 状态层已具备经典迷宫、豆子/能量豆、水果、四鬼 AI、Scatter/Chase/Frightened、死亡/重生、下一关、计分与音效
- 内容层目前只有两套包：`arcade`（21 关 + 循环）与 `tutorial`（10 关）
- 存档层已记录单关最佳、包进度、Hub 摘要，但还没有模式完成度、练习记录、水果分型记录

这意味着扩展设计应遵循“在现有骨架上加层”，而不是推翻重做。

### 1.2 本轮设计的核心判断

Pacman 下一阶段的真正缺口不是“还能不能打一局”，而是以下四件事还没有闭环：

1. 原版机制精度还差最后一层产品化收口，尤其是奖励命、Elroy 可视化与教学解释、Pinky/四鬼认知的可学习化。
2. `tutorial` 当前仍是“低压参数版经典关”，不是有脚本目标、失败提示和通过条件的真教学包。
3. `Sheet13` 已经有图鉴壳，但没有把“图鉴 -> 练习 -> 回到对局”的入口打成真实流转。
4. 内容包仍然过薄，`arcade/tutorial` 之外没有把冲分、速通、一命、多迷宫、长局体验沉淀成长期内容。

### 1.3 扩展原则

1. **不脱离现有抽象。**
   继续沿用 `PacmanBoardState / PacmanPackDefinition / PacmanLevelMeta / pacmanStorage / PacmanSheet / PacmanGuideSheet` 这条边界，不新起一套系统。
2. **先补真玩法，再补内容宽度。**
   P0 先把精度、教学、练习、退出路径做真；P1 再扩模式包；P2 再做多迷宫和长线体验。
3. **内容以“包 + 章节 + 关卡脚本”组织。**
   包负责主题，章节负责节奏，关卡负责目标。现有 `packId + levelNumber` 继续保留，但要补 `chapterId / modeId / practiceId` 维度。
4. **Sheet12/13 职责不改号，只补能力。**
   `Sheet12` 继续是“配置 + 正式对局 + 结算”，`Sheet13` 继续是“认知 + 教学 + 练习 + 复盘入口”。

---

## 2. P0 / P1 / P2 关卡与模式补充设计

## 2.1 P0：把现有 Pacman 从“可玩”补到“完整”

### P0 目标

- 让经典玩法精度更接近原版
- 让 `tutorial` 变成脚本化教学包
- 让 `Sheet13` 的练习入口真正可达
- 让结算页、图鉴页、主对局页之间形成闭环

### P0 交付范围

#### 1. 原版机制精度补齐

- 补 `score-based extra life`，默认在 10000 分发奖励命，并在设置层留“原版奖励命开关”
- 把 Elroy 做成真正的运行时可读反馈，不只是速度表存在：
  - HUD 显示 `红鬼加压 Lv1/Lv2`
  - 图鉴显示当前关卡 Elroy 触发阈值
  - 结算建议可指出“后半图红鬼加压导致失误”
- 保持 `PINKY_OFFSET_BUG_ENABLED` 为默认开启，但在教学页明确说明“当前按原版 bug 行为实现”

#### 2. 教学包脚本化

- 现有 `tutorial` 10 关继续保留关卡编号与入口，不推翻目录
- 每关新增：
  - `objective`
  - `failReasonHints`
  - `completionRule`
  - `startHint`
  - `focusMechanic`
- 教学判定不再只看“清图/得分”，而是支持：
  - 指定路段不死亡
  - 在一次能量豆窗口内吃到至少 1/2/4 只鬼
  - 在指定时间内完成某段豆路
  - 指定区段使用传送门脱困

#### 3. 练习模式做真

- 首发真练习条目固定为 4 个：
  - `turning_basics`：路口转向
  - `energizer_chain`：能量豆吃鬼链
  - `ghost_escape`：四鬼包夹逃生
  - `timing_read`：Scatter/Chase 读节奏
- `PacmanGuideSheet` 的“进入练习”按钮从禁用改为真实跳转
- `PacmanOverlay` 胜负结算新增“进入对应练习”出口

#### 4. UI 与返回路径收口

- `Sheet13 -> Sheet12` 的练习入口应能带上预设参数进入
- `Sheet12 -> Sheet13` 的失败复盘入口应能带上推荐练习项返回
- `ESC / 返回选关 / 返回图鉴` 语义区分：
  - 局内：暂停/恢复
  - 局外：返回 `Sheet12` 的 setup 面板
  - 图鉴练习页：回到 `Sheet13` 当前 tab

---

## 2.2 P1：把内容层做厚，形成模式包

### P1 目标

- 在 `arcade/tutorial` 之外补成真正可长期游玩的模式包
- 把“同一经典迷宫反复跑”扩展成“同规则不同目标”
- 让 Pacman 有和 Snake/Tetris/PvZ 同等级的内容深度

### P1 新增模式包

1. `ghost_lab`
   - 聚焦四鬼个体与组合认知
2. `fruit_rush`
   - 聚焦水果路径压缩与高分路线
3. `time_attack`
   - 聚焦清图效率和 split 节奏
4. `one_life`
   - 聚焦稳定性与章节连战

### P1 新增系统

- 模式包注册从“`packType = arcade | tutorial`”扩成：
  - `arcade`
  - `tutorial`
  - `challenge`
  - `practice`
  - `endless`
- 关卡元数据补齐：
  - `chapterId`
  - `modeId`
  - `goalType`
  - `goalValue`
  - `recommendedPracticeId`
  - `mazeVariantId`
- 存档补齐：
  - `fruitsCollectedByType`
  - `modeCompletion`
  - `practiceRecords`
  - `oneLifeRuns`
  - `timeAttackRecords`

---

## 2.3 P2：把多迷宫与长局体验做出来

### P2 目标

- 不再只有 `classic` 一张图
- 让 Pacman 具备回流价值，而不只是一次性内容
- 用长局和多迷宫撑住 Hub 长期记录

### P2 扩展内容

1. `maze_variants`
   - 镜像图、重 tunnel 图、长直道压迫图、双门变体图
2. `endless_survival`
   - 按阶段递增强度的循环生存
3. `long-run polish`
   - 过场、阶段提示、长局统计、失败前事件回放

### P2 长局体验重点

- 连续关不再只是一张图重复加速，而是“迷宫轮换 + 模式目标轮换”
- 结算不只给最终分数，还给：
  - 最高连续清图数
  - 最深压力阶段
  - 最危险死亡区
  - 最常见失败原因

---

## 3. 详细关卡结构：内容包 / 章节目标 / 节奏 / 核心机制

> 本节按“包 -> 章节”写清开发所需信息。章节级别足够直接映射成目录数据；关卡级别继续沿用现有 `levelNumber` 明细表拆。

## 3.1 P0 包：经典街机包 `arcade`

### 包定位

- 入口默认包
- 承担“最接近原版”的主线体验
- 继续沿用当前 21 关 + 循环结构

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| A1 开局识图 | 1-4 | 让玩家读懂迷宫、传送门、四角能量豆与基础追击 | 宽松，能量豆窗口长 | 基础吃豆、传送门绕路、第一次吃鬼 |
| A2 速度抬升 | 5-8 | 让玩家开始形成固定路线而不是临时反应 | 中压，Frightened 变短 | 鬼速接近、Pinky/Inky 包夹、窗口型反打 |
| A3 反打衰退 | 9-13 | 让玩家接受“能量豆不再主要用来吃鬼，而是控场” | 高压，吃鬼收益下降 | 短惊吓、Elroy 提前出现、后半图红鬼加压 |
| A4 稳定通关 | 14-21 | 让玩家靠路线稳定性而非爆发得分过图 | 高压稳定，偏耐力 | 纯走位、传送门脱困、清尾豆风险管理 |

### 开发约束

- 关卡编号与现有 `ARCADE_LEVELS` 保持一致
- 当前 `name / description / targetScore / targetTimeMs / fruitId` 继续保留
- 只新增章节维度与目标说明，不改旧关卡入口

---

## 3.2 P0 包：路线教学包 `tutorial`

### 包定位

- 不是“低难度街机”，而是“把技能拆开的教学脚本包”
- 继续使用现有 10 关目录，但强化脚本目标

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| T1 移动与转向 | 1-2 | 学会预输入、T 字口转向、传送门脱困 | 低压单点教学 | 转向缓存、传送门位置记忆 |
| T2 能量豆与收益 | 3-4 | 让玩家知道能量豆是“控场窗口”，吃鬼是时机题 | 低压但强调窗口 | Frightened 时长、吃鬼连分、撤退时机 |
| T3 四鬼个体读法 | 5-8 | 把四鬼从“颜色”变成“行为” | 中压分项教学 | Blinky 直追、Pinky 预判、Inky 夹击、Clyde 变节奏 |
| T4 节奏综合 | 9-10 | 读懂 Scatter/Chase 周期，把前面技巧串起来 | 中高压综合考试 | 模式切换、路线选择、错路惩罚 |

### 每章的脚本重点

- `T1` 失败提示只指向输入问题，例如“转向输入太晚”
- `T2` 失败提示只指向时机问题，例如“能量豆开得太早”
- `T3` 每关只讲一个鬼，不允许四鬼信息同时轰炸
- `T4` 通过条件必须包含“完整跑出一次节奏选择”，不是只看最终得分

---

## 3.3 P1 包：四鬼认知包 `ghost_lab`

### 包定位

- 把 `Sheet13` 的图鉴认知变成实战练习
- 作为 `tutorial` 之后的专项训练包

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| G1 单鬼识别 | 1-4 | 单独认识四鬼，各知道它想去哪里 | 低压 | 目标点可视、单鬼压迫 |
| G2 双鬼夹线 | 5-8 | 识别常见夹击组合，不在错误走廊送命 | 中压 | Blinky+Pinky、Blinky+Inky、Pinky+Clyde 等组合 |
| G3 四鬼综合 | 9-12 | 在完整四鬼环境里读路线，而不是只看最近一只鬼 | 高压 | 多鬼协作、节奏切换、传送门破包围 |

### 章节产出要求

- G1 和 G2 允许在训练模式显示目标点或危险走廊
- G3 禁止显示调试目标点，只保留“失败后解释”

---

## 3.4 P1 包：水果冲分包 `fruit_rush`

### 包定位

- 面向喜欢拉高分和绕路博收益的玩家
- 把当前水果系统从“有就吃”升级成路线选择题

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| F1 基础取果 | 1-4 | 学会两次水果触发点与最佳进入线 | 中压 | 豆数阈值、果实刷新倒计时 |
| F2 压力取果 | 5-8 | 在追击压力下评估“要不要绕去拿果” | 高压 | 高价值水果、短窗口、尾豆风险 |

### 包规则补充

- 结算页必须显示水果得分占比
- 允许做“连取奖励”但放到 P2，不放进首发规则

---

## 3.5 P1 包：速通竞赛包 `time_attack`

### 包定位

- 强化当前 `elapsedMs` 已经存在的计时价值
- 把 Pacman 从“高分跑法”扩到“清图效率跑法”

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| S1 清图效率 | 1-5 | 学会不浪费路线、少回头 | 中压快节奏 | 最短路径、尾豆控制 |
| S2 模式压缩 | 6-10 | 利用 Scatter/Chase 切换压缩危险路段 | 高压 | split 节奏、关键区提前清理 |
| S3 极限速通 | 11-15 | 在高压图里保持路线完整度 | 极限 | 短惊吓、Elroy、错误代价放大 |

### 包规则补充

- 结算页显示 `PB / 本次 / 差值`
- HUD 支持显示当前 split 是否领先

---

## 3.6 P1 包：限命挑战包 `one_life`

### 包定位

- 面向熟练玩家的稳定性内容
- 承接存档里的 `oneLifeBestLevel`

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| O1 三关连战 | 1-3 | 建立一命状态下的保守路线意识 | 稳压 | 低容错，强调安全优先 |
| O2 五关连战 | 4-8 | 在连续压力下保持路线稳定 | 中高压 | 连续记录、阶段奖励 |
| O3 终局冲线 | 9-12 | 挑战一命打穿高压段 | 高压长局 | 红鬼加压、尾图稳态、心态管理 |

### 包规则补充

- 失败时保留本次最远关与最远章节
- 支持章节断点，但断点不会改变“一命统计”的定义

---

## 3.7 P2 包：多迷宫变体包 `maze_variants`

### 包定位

- 复用现有 Pacman 规则，但通过地图改变策略
- 不在 P1 做，避免内容过早分散

### 章节结构

| 章节 | 关卡 | 章节目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| M1 镜像经典 | 1-5 | 破坏玩家肌肉记忆，验证真理解 | 中压 | 经典图镜像、反向路线 |
| M2 传送门主导 | 6-10 | 强化 tunnel 依赖与横向循环逃生 | 高速 | 多次过门、拉扯路线 |
| M3 长直道压迫 | 11-15 | 强化直线追击与截线压力 | 高压 | Blinky/Pinky 压线、避开长走廊 |
| M4 双门风险 | 16-20 | 增加出入口与死角的混合判断 | 高压复杂 | 多门联通、危险区切换 |

### 迷宫产出要求

- 迷宫不改变四鬼核心规则
- 先新增 `mazeVariantId`，再扩 `MAZE_REGISTRY`
- 变体图都必须提供 `recommendedRouteStyle`

---

## 3.8 P2 包：无尽生存包 `endless_survival`

### 包定位

- 对接 Hub 长期记录
- 支撑长局、反复回流和失败复盘

### 阶段结构

| 阶段 | 关卡段 | 阶段目标 | 节奏 | 核心机制 |
| --- | --- | --- | --- | --- |
| E1 建立分数 | 1-5 | 用稳定清图建立开局资源与分数 | 中速 | 标准街机节奏 |
| E2 压力叠加 | 6-12 | 让玩家开始承受高压红鬼和短窗口 | 中高压 | Elroy、短惊吓 |
| E3 路线统治 | 13-20 | 进入长期靠路线稳定活命的阶段 | 高压 | 少失误、少回头 |
| E4 极限循环 | 21+ | 用迷宫轮换和阶段标签维持长局体验 | 极限 | 循环关、迷宫轮换、长局统计 |

### 长局补件

- 阶段开始提示
- 失败前 30 秒事件摘要
- 长局最佳章节、最佳阶段、最佳连续吃鬼链

---

## 4. 玩法机制补充设计

## 4.1 原版机制精度

### 必做项

1. **Pinky 精度**
   - 默认保持原版 bug 偏移
   - 在 `Sheet13` 和训练页明确解释
2. **Elroy 真正产品化**
   - 当前速度加成已在表中，后续补 UI 可读反馈、失败归因和图鉴解释
3. **奖励命**
   - 10000 分奖励命首发开启
   - 只在 `classic / arcade / endless` 生效
   - `one_life` 禁用奖励命
4. **吃鬼链说明**
   - 200/400/800/1600 已存在，后续要把“本窗口吃到第几只鬼”进 HUD 或飘字
5. **重生后的节奏重置说明**
   - 保持当前状态层的重生重置策略，但要在设计上写清是“本项目采用的折中还原”，避免后续开发反复争论

### 可延期项

- 原版更细的门控、转向优先级极限细节
- 鬼屋更深层的单鬼释放规则拟合

---

## 4.2 教学 / 练习补充

### 教学目标组织方式

- 教学包负责“完整小课”
- 练习条目负责“单点专项”
- 失败复盘只推荐到专项，不直接把玩家丢回整章

### 练习条目定义

| 练习 ID | 入口来源 | 训练目标 | 通过条件 |
| --- | --- | --- | --- |
| `turning_basics` | Sheet13 / 失败后推荐 | 学会预输入和 T 口转向 | 连续通过 6 个路口不撞鬼 |
| `energizer_chain` | 教学第 3-4 关 / 结算页 | 学会能量豆窗口连吃 | 单次能量豆至少吃到 2 鬼 |
| `ghost_escape` | 教学第 5-8 关 / 失败后推荐 | 学会用门和角豆脱困 | 指定包夹场景存活 20 秒 |
| `timing_read` | 教学第 9-10 关 | 学会读 Scatter/Chase 切换 | 在一次切换后完成指定区块清理 |

### 练习进入规则

- 从 `Sheet13` 进入时，直接带入 `practiceId`
- 从 `Sheet12` 失败结算进入时，同时带入：
  - `sourcePackId`
  - `sourceLevel`
  - `recommendedPracticeId`
- 练习完成后给两个出口：
  - 再练一次
  - 回到来源关卡

---

## 4.3 模式包补充

### 首发模式组

- `classic`
- `tutorial`
- `practice`

### P1 模式组

- `score_attack`
- `time_attack`
- `one_life`
- `ghost_lab`

### 模式差异的实现原则

- 模式优先改变：
  - 目标规则
  - 存档写法
  - 结算字段
  - HUD 侧重点
- 模式不要一开始就改变核心移动与 AI 规则，避免维护两套 Pacman

---

## 4.4 多迷宫设计

### 设计原则

- 不改变 Pacman 核心循环
- 只通过地图形态改变路线价值
- 所有迷宫都继续复用 `PacmanMazeDefinition`

### 迷宫扩展优先级

1. `classic`
2. `classic_mirror`
3. `tunnel_heavy`
4. `long_corridor`
5. `double_gate`

### 每种迷宫都必须附带的元数据

- `routeStyle`
- `riskTags`
- `recommendedFor`
- `teaches`

---

## 4.5 长局体验设计

### 当前问题

- 现有 Pacman 的长局只有“继续下一关”，没有阶段感
- 结算只看单局，不看长段表现

### P2 收口方向

1. 每 3-5 关给一个阶段标签
2. 长局中途提供轻量阶段摘要，不打断游戏
3. 失败结算显示：
   - 本次最长存活阶段
   - 最常死区域
   - 最易失误模式切换点
4. Hub 显示：
   - 无尽最深阶段
   - 一命最远章节
   - 最佳速通 PB

---

## 5. 实现拆解：状态层 / UI 层 / 存档层 / 测试层

## 5.1 状态层怎么做

### 原则

- 继续以纯函数状态推进为主
- 不把教学/练习逻辑塞进 `PacmanSheet.tsx`
- 内容层和模式层都以表驱动挂在状态层外

### 现有文件继续承担的职责

| 文件 | 当前职责 | 扩展后职责 |
| --- | --- | --- |
| `src/features/pacman/pacmanTypes.ts` | 核心类型 | 增加 `chapterId / modeId / practiceId / goalType / mazeVariantId / storage v2` 相关类型 |
| `src/features/pacman/pacmanBoardState.ts` | 开局、换关、豆子与能量豆 | 继续负责状态创建，但不直接知道具体教学脚本 |
| `src/features/pacman/pacmanAi.ts` | 四鬼 AI | 保持不拆，补训练可视化所需 selector |
| `src/features/pacman/pacmanContent.ts` | 参数表 | 拆成“参数表 + 模式说明摘要”入口 |
| `src/features/pacman/pacmanMapRegistry.ts` | 包与关卡目录 | 增加章节、模式、迷宫变体与练习目录映射 |
| `src/features/pacman/pacmanSession.ts` | 主循环和 ESC 语义 | 继续做运行时驱动，挂入练习目标推进 |
| `src/features/pacman/pacmanGameLogic.ts` | 胜负与结算分析 | 增加“奖励命”“模式差异结算”“推荐练习项” |

### 建议新增的状态层文件

- `src/features/pacman/pacmanGoalRules.ts`
  - 负责教学/练习/挑战目标判定
- `src/features/pacman/pacmanPracticeCatalog.ts`
  - 负责专项练习条目与预设场景
- `src/features/pacman/pacmanMazeCatalog.ts`
  - 负责多迷宫与变体图目录
- `src/features/pacman/pacmanSelectors.ts`
  - 负责 HUD/Guide/Overlay 的摘要格式化，兑现旧 spec 里未落地的 selector 层

### 状态层实施顺序

1. 先加 `goal rules`
2. 再接 `practice catalog`
3. 再补 `mode/pack` 元数据
4. 最后扩 `maze catalog`

---

## 5.2 UI 层怎么做

### 原则

- 不新增新 sheet
- 只在 `Sheet12 / Sheet13` 内细分区域与状态
- 尽量把“设置态 / 对局态 / 结算态 / 练习态”区分清楚

### 现有 UI 文件继续承担的职责

| 文件 | 当前职责 | 扩展后职责 |
| --- | --- | --- |
| `src/components/pacman/PacmanSheet.tsx` | 选包、选关、开局、运行态 | 增加模式卡、章节卡、练习跳转接收与 setup/playing/result 分层 |
| `src/components/pacman/PacmanHud.tsx` | 顶部信息与按钮 | 重组为“局面 / 压力 / 收益”三组 HUD |
| `src/components/pacman/PacmanOverlay.tsx` | 暂停/胜负结算 | 增加“进入推荐练习”“回到教程”“PB 对比”“模式专属结算” |
| `src/components/pacman/PacmanGuideSheet.tsx` | 图鉴与说明 | 升级成“图鉴 + 教学章节 + 练习入口 + 复盘入口” |

### 建议新增的 UI 组件

- `src/components/pacman/PacmanPackPanel.tsx`
- `src/components/pacman/PacmanPracticePanel.tsx`
- `src/components/pacman/PacmanResultCards.tsx`
- `src/components/pacman/PacmanGuideTabs.tsx`

> 这些组件不是必须一次性新建，但文档上要先定边界，避免 `PacmanSheet.tsx` 再次膨胀。

---

## 5.3 存档层怎么做

### 当前问题

- 现有 `PacmanModuleStorage` 只覆盖 `arcade/tutorial`
- 没有模式完成度、专项练习、按水果分型统计
- `bestClearTimeByMap` 目前本质仍是“关卡 best time”，还不够支撑多迷宫与模式包

### 存档升级方向

建议把 `pacmanStorage.ts` 从当前结构升级到 `version: 2`，新增：

- `globalStats.fruitsCollectedByType`
- `globalStats.extraLivesEarned`
- `modeProgress`
- `practiceProgress`
- `mazeRecords`
- `timeAttackRecords`
- `oneLifeRecords`

### 存档结构建议

```ts
type PacmanModuleStorageV2 = {
  version: 2;
  globalStats: {
    bestScore: number;
    highestLevel: number;
    totalRuns: number;
    totalWins: number;
    totalLosses: number;
    totalGhostsEaten: number;
    totalFruitsCollected: number;
    fruitsCollectedByType: Record<FruitId, number>;
    extraLivesEarned: number;
    oneLifeBestLevel: number;
    longestSurvivalTimeMs: number;
  };
  packProgress: Record<string, PacmanPackProgress>;
  modeProgress: Record<string, { completed: boolean; bestScore: number; bestTimeMs: number | null }>;
  practiceProgress: Record<string, { attempts: number; clears: number; bestGrade: string | null }>;
  mazeRecords: Record<string, { bestScore: number; bestTimeMs: number | null }>;
  lastEntry: {
    sheetId: 'pacman' | 'pacman_guide';
    packId: string;
    levelNumber: number;
    practiceId?: string;
  };
};
```

### 迁移原则

- 保持 v1 向 v2 自动兼容
- 旧 `arcade/tutorial` 记录必须原样保留
- 任何迁移失败都回退到安全默认值，不阻塞进入模块

---

## 5.4 测试层怎么做

### 当前已有基础

- `tests/pacmanRuntime.test.ts`
- `tests/pacmanStorage.test.ts`

### P0 必补测试

1. `pacmanRuntime.test.ts`
   - 奖励命触发
   - 教学目标判定
   - 练习入口预设状态
   - Elroy HUD 摘要条件
2. `pacmanStorage.test.ts`
   - v1 -> v2 迁移
   - 模式完成度落盘
   - 水果分型统计
   - 练习记录写入

### P1 建议新增测试

- `tests/pacmanContent.test.ts`
  - 包、章节、模式目录合法
- `tests/pacmanPracticeCatalog.test.ts`
  - 练习预设场景完整
- `tests/pacmanSelectors.test.ts`
  - HUD / Guide / Overlay 文案摘要稳定

### P2 建议新增测试

- `tests/pacmanMazeCatalog.test.ts`
  - 多迷宫数据合法、可清图、能量豆/传送门位置有效

---

## 6. UI 展示方案

## 6.1 Sheet12：主玩法页

### 设计目标

- setup 态看得清内容包、章节、模式、目标
- play 态把空间让给迷宫和 HUD
- result 态给出明确去向：重开、下一关、练习、返回

### 页面分区

#### A. Setup 顶栏

- 左：包/模式切换
- 中：章节摘要、关卡目标、推荐练习
- 右：Hub 轻摘要（最好分、最快清图、当前包进度）

#### B. 中央主区

- 中央固定为 `PacmanBoard`
- 左侧为 setup 卡片区，仅在 `idle` 或 `paused setup` 时展开
- 对局开始后左侧收起为窄栏

#### C. HUD 顶栏

保持 `PacmanHud`，但改成三组：

1. **局面组**
   - 得分
   - 关卡
   - 生命
   - 用时
2. **压力组**
   - 当前模式
   - Elroy 状态
   - 惊吓剩余
3. **收益组**
   - 豆子进度
   - 水果状态
   - 吃鬼链

### Setup 中的模式卡

P0 只展示：

- 经典街机包
- 路线教学包
- 专项练习

P1 后再追加：

- 四鬼认知
- 水果冲分
- 速通竞赛
- 限命挑战

---

## 6.2 Sheet13：图鉴 / 教学 / 练习页

### 设计目标

- 不是静态百科，而是“认知到行动”的过渡页

### 页面结构

保留现有 tab，但重组为以下信息层：

1. `四鬼图鉴`
   - 当前实现说明
   - 目标规则
   - 反制建议
   - 对应练习入口
2. `水果与收益`
   - 水果价值
   - 触发阈值
   - 对应冲分练习
3. `迷宫与路线`
   - 迷宫标签
   - 危险走廊
   - 推荐路线风格
4. `输入与节奏`
   - 转向缓存
   - 模式切换
   - 传送门说明
5. `教学与练习`
   - 章节卡
   - 专项练习卡
   - 最近失败推荐

### 教学页重点

- 每章卡片必须展示：
  - 学什么
  - 失败会卡在哪里
  - 通过后解锁什么
- 每张卡片都可直达 `Sheet12` 的对应章节/练习

---

## 6.3 HUD 方案

### P0 HUD 必须新增的字段

- `红鬼加压` 状态
- 当前目标类型（仅教学/练习模式显示）
- 当前练习评价（仅练习模式显示）

### HUD 信息优先级

1. 生存相关：生命、模式、加压
2. 路线相关：豆子、时间
3. 收益相关：水果、吃鬼链、分数

### HUD 文案原则

- 不堆长句
- 关键切换用 2-4 字短标签
- 教学模式允许额外一行提示；正式模式不重复说教

---

## 6.4 教学页方案

### 教学章节卡字段

- 章节名
- 训练目标
- 核心机制
- 推荐操作
- 通过条件
- 常见失败原因

### 教学流程

1. 在 `Sheet13` 选章节
2. 看到“本关学什么”
3. 点击进入 `Sheet12`
4. 完成后返回章节页，显示掌握状态

---

## 6.5 练习入口方案

### 入口来源

1. `Sheet13` 教学与练习 tab
2. `PacmanOverlay` 失败结算页
3. `PacmanOverlay` 胜利结算页（用于冲分/速通再练）

### 入口参数

- `practiceId`
- `sourcePackId`
- `sourceLevel`
- `returnTo`

### 练习完成后的出口

- 再练一次
- 返回来源关卡
- 去图鉴看讲解

---

## 6.6 结算方案

### 胜利结算

在现有基础上新增：

- PB 对比
- 是否触发奖励命
- 当前章节进度
- 推荐下一步：下一关 / 对应模式 / 对应练习

### 失败结算

在现有基础上新增：

- 失败类型标签
  - 被红鬼压线
  - 转向失误
  - 贪水果
  - 惊吓撤退过慢
- 推荐练习入口
- 回图鉴看讲解按钮

### 练习结算

单独于正式结算：

- 给评级
  - 通过
  - 优秀
  - 稳定
- 给是否建议回原关重试

---

## 7. 开发拆解顺序建议

## 7.1 P0 拆解顺序

1. `goal rules` 与 `practice catalog`
2. `tutorial` 10 关脚本化
3. `Sheet13` 练习按钮打通
4. `Sheet12` 接收练习预设与推荐回流
5. 奖励命 + Elroy HUD + 结算推荐
6. 存档 v2 迁移
7. P0 测试补齐

## 7.2 P1 拆解顺序

1. `ghost_lab`
2. `fruit_rush`
3. `time_attack`
4. `one_life`
5. 模式与章节摘要接入 Hub/Guide

## 7.3 P2 拆解顺序

1. `maze catalog`
2. `maze_variants`
3. `endless_survival`
4. 长局结算与回放摘要

---

## 8. 本文对应的执行结论

1. Pacman 当前应被定义为“已完成核心运行时、未完成内容层和教学层”的模块，而不是继续修基础架构。
2. P0 的关键不是再加更多关，而是把 `tutorial` 和 `practice` 做成真实脚本化内容。
3. `Sheet13` 必须从图鉴页升级为“图鉴 + 教学 + 练习 + 复盘入口”，否则现有说明内容无法转化成可玩的训练。
4. `Sheet12` 不需要改 sheet 结构，只需要把 setup / play / result 三态做清楚，并接受练习预设跳转。
5. 模式包扩展应沿用现有 `packId + levelNumber` 目录，再补 `chapterId / modeId / practiceId / mazeVariantId`，避免重建一套数据层。
6. 存档必须升级到 v2，补齐 `modeCompletion / practiceRecords / fruitsCollectedByType / oneLifeRecords`，否则 P1/P2 无法沉淀长期记录。
7. 多迷宫和长局体验放到 P2，不提前抢 P0/P1 资源；P1 的重点是把“同一迷宫上的不同目标玩法”做厚。
8. 测试应继续围绕 `pacmanRuntime` 与 `pacmanStorage` 扩展，而不是把大量判定塞回组件里做手测。

