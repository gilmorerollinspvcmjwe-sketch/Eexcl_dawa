# 祖玛模块任务列表

## Phase A: 核心运行时与基础玩法

- [x] Task 1: 创建祖玛类型定义系统
  - [x] SubTask 1.1: 创建 `src/features/zuma/zumaTypes.ts`，定义轨道、彩球链、炮台、道具球等核心类型
  - [x] SubTask 1.2: 定义球链结构：chainId、balls数组、headDistance、speedFactor、isRewinding
  - [x] SubTask 1.3: 定义道具球类型：爆裂球、闪电球、减速球、倒退球、万能球
  - [x] SubTask 1.4: 定义危险等级枚举：safe、warning、critical

- [x] Task 2: 实现轨道与彩球链系统
  - [x] SubTask 2.1: 创建 `src/features/zuma/zumaBoardState.ts`，实现轨道离散采样样条
  - [x] SubTask 2.2: 实现彩球链推进逻辑（基础速度 + 难度倍率 + 事件修正）
  - [x] SubTask 2.3: 实现球链回缩逻辑（间隙检测 + 接合 + 连锁触发）
  - [x] SubTask 2.4: 实现多轨或分岔轨道支持

- [x] Task 3: 实现炮台与输入系统
  - [x] SubTask 3.1: 实现炮台旋转瞄准逻辑（鼠标/键盘控制）
  - [x] SubTask 3.2: 实现发射逻辑（左键/空格发射）
  - [x] SubTask 3.3: 实现换弹逻辑（右键/Tab切换当前球与下一球）
  - [x] SubTask 3.4: 实现命中/空枪/擦边反馈系统

- [x] Task 4: 实现碰撞、插入与消除判定
  - [x] SubTask 4.1: 实现发射球与链段碰撞检测
  - [x] SubTask 4.2: 实现最近合法插入点计算（前插/后插）
  - [x] SubTask 4.3: 实现局部匹配扫描（从插入点向两侧扩展）
  - [x] SubTask 4.4: 实现三消判定（同色连续 >= 3）
  - [x] SubTask 4.5: 实现消除与得分记录

- [x] Task 5: 实现胜利/失败判定
  - [x] SubTask 5.1: 实现清空球链胜利判定
  - [x] SubTask 5.2: 实现终点线失败判定
  - [x] SubTask 5.3: 实现危险分层预警系统（safe/warning/critical）
  - [x] SubTask 5.4: 实现危险等级升级时的HUD/音效/视觉同步

## Phase B: 关卡数据与存档系统

- [x] Task 6: 创建关卡目录系统
  - [x] SubTask 6.1: 创建 `src/features/zuma/zumaLevelCatalog.ts`
  - [x] SubTask 6.2: 定义关卡脚本结构：id、trackId、colorPool、baseSpeed、spawnScript等
  - [x] SubTask 6.3: 实现神庙征途包（12关入门关卡数据）
  - [x] SubTask 6.4: 实现连锁回缩包（8关连锁强化关卡数据）
  - [x] SubTask 6.5: 实现计时冲分包（3档时长+6张轮换地图数据）

- [x] Task 7: 创建存档系统
  - [x] SubTask 7.1: 创建 `src/features/zuma/zumaProgressStorage.ts`
  - [x] SubTask 7.2: 实现存档字段：clearedLevels、bestScoreByLevel、bestChainByLevel等
  - [x] SubTask 7.3: 实现存档读写与持久化
  - [x] SubTask 7.4: 实现进度展示接口

## Phase C: UI组件与HUD

- [x] Task 8: 创建Sheet14主玩法组件
  - [x] SubTask 8.1: 创建 `src/components/zuma/ZumaGameSheet.tsx`（选关、模式切换入口）
  - [x] SubTask 8.2: 创建 `src/components/zuma/ZumaBoard.tsx`（轨道、球链、炮台渲染）
  - [x] SubTask 8.3: 创建 `src/components/zuma/ZumaHud.tsx`（顶部信息栏）
  - [x] SubTask 8.4: 创建 `src/components/zuma/ZumaResultPanel.tsx`（结算面板）

- [x] Task 9: 实现HUD信息显示
  - [x] SubTask 9.1: 实现关卡编号/模式显示
  - [x] SubTask 9.2: 实现分数、连锁层数、最高连锁显示
  - [x] SubTask 9.3: 实现当前球+下一球预览
  - [x] SubTask 9.4: 实现轨道推进百分比与危险等级显示
  - [x] SubTask 9.5: 实现暂停、倍速、重开按钮

- [x] Task 10: 实现结算面板
  - [x] SubTask 10.1: 实现胜利结算（用时、命中率、最高连锁、道具效率、星级）
  - [x] SubTask 10.2: 实现失败结算（失守轨道、关键事件、推荐训练项）
  - [x] SubTask 10.3: 实现三个出口：重开本局、返回选关、进入练习

## Phase D: 道具球与视觉音效

- [x] Task 11: 实现道具球体系
  - [x] SubTask 11.1: 实现爆裂球（半径范围清除）
  - [x] SubTask 11.2: 实现闪电球（沿轨道方向清除）
  - [x] SubTask 11.3: 实现减速球（全链减速）
  - [x] SubTask 11.4: 实现倒退球（链头后退）
  - [x] SubTask 11.5: 实现万能球（任意颜色参与三消）

- [x] Task 12: 实现视觉动画系统
  - [x] SubTask 12.1: 创建 `src/styles/zuma.css`
  - [x] SubTask 12.2: 实现球链推进动画
  - [x] SubTask 12.3: 实现插入动画
  - [x] SubTask 12.4: 实现消除动画（得分飘字）
  - [x] SubTask 12.5: 实现连锁特效（递增强度）
  - [x] SubTask 12.6: 实现道具球触发特效
  - [x] SubTask 12.7: 实现危险预警动画（终点线闪烁）

- [x] Task 13: 实现音效系统
  - [x] SubTask 13.1: 实现发射音效
  - [x] SubTask 13.2: 实现命中/空枪音效
  - [x] SubTask 13.3: 实现消除/连锁音效（递增音调）
  - [x] SubTask 13.4: 实现换弹音效
  - [x] SubTask 13.5: 实现危险预警音效
  - [x] SubTask 13.6: 实现胜利/失败结算音效

## Phase E: Sheet15图鉴与练习

- [x] Task 14: 创建Sheet15图鉴与练习组件
  - [x] SubTask 14.1: 创建球种图鉴页（普通彩球规则）
  - [x] SubTask 14.2: 创建道具球说明页（5类道具球规则）
  - [x] SubTask 14.3: 创建轨道地形标签说明页
  - [x] SubTask 14.4: 创建Boss阶段机制摘要页

- [x] Task 15: 实现练习模式
  - [x] SubTask 15.1: 实现弯道命中练习模块
  - [x] SubTask 15.2: 实现回缩连锁练习模块
  - [x] SubTask 15.3: 实现危险线抢救练习模块
  - [x] SubTask 15.4: 实现道具球专项练习模块
  - [x] SubTask 15.5: 实现练习结果指标统计

## Phase F: 测试与性能优化

- [x] Task 16: 创建单元测试
  - [x] SubTask 16.1: 创建 `tests/zumaInsertion.test.ts`（插入点稳定性测试）
  - [x] SubTask 16.2: 创建 `tests/zumaMatchAndRewind.test.ts`（三消与连锁测试）
  - [x] SubTask 16.3: 创建 `tests/zumaLossCondition.test.ts`（失败线判定测试）
  - [x] SubTask 16.4: 创建 `tests/zumaPowerups.test.ts`（道具球触发测试）

- [x] Task 17: 性能优化
  - [x] SubTask 17.1: 验证60fps帧率达标（常规关卡球体<220）
  - [x] SubTask 17.2: 验证峰值性能（球体<320时保持流畅）
  - [x] SubTask 17.3: 实现事件队列动画播放（避免逻辑帧阻塞）
  - [x] SubTask 17.4: 实现调试开关（轨道采样点、球链索引、插入点候选、碰撞半径）

## Phase G: Hub入口与集成

- [x] Task 18: Sheet1 Hub集成
  - [x] SubTask 18.1: 在Sheet1新增祖玛入口卡
  - [x] SubTask 18.2: 在Hub显示祖玛进度摘要（已通关、最佳分数、最佳连锁）
  - [x] SubTask 18.3: 实现Sheet14/Sheet15标签切换

---

# Task Dependencies

- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2, Task 3
- Task 5 depends on Task 4
- Task 6 depends on Task 1
- Task 7 depends on Task 5
- Task 8 depends on Task 2, Task 3, Task 4, Task 5
- Task 9 depends on Task 8
- Task 10 depends on Task 5, Task 8
- Task 11 depends on Task 4
- Task 12 depends on Task 8
- Task 13 depends on Task 8
- Task 14 depends on Task 11
- Task 15 depends on Task 14
- Task 16 depends on Task 4, Task 5, Task 11
- Task 17 depends on Task 8, Task 12
- Task 18 depends on Task 8, Task 7