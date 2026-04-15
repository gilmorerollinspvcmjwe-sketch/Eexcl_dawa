# 三消模块任务列表

## Phase A: 核心运行时与基础玩法

- [x] Task 1: 创建三消类型定义系统
  - [x] SubTask 1.1: 创建 `src/features/match3/match3Types.ts`，定义棋盘、色块、特殊块、障碍等核心类型
  - [x] SubTask 1.2: 定义色块类型：普通色块（6色）、条纹块（横/纵）、包装块、彩球
  - [x] SubTask 1.3: 定义障碍类型：冻结层、锁链块、木箱/石块、传送口、蔓延块
  - [x] SubTask 1.4: 定义目标类型：分数达标、颜色收集、清理覆盖层、掉落收集、障碍清除
  - [x] SubTask 1.5: 定义状态机状态：setup、playing、resolving、won、lost

- [x] Task 2: 实现棋盘与交换系统
  - [x] SubTask 2.1: 创建 `src/features/match3/match3BoardState.ts`，实现棋盘初始化
  - [x] SubTask 2.2: 实现曼哈顿相邻交换判定
  - [x] SubTask 2.3: 实现合法交换判定（至少触发一个消除群组）
  - [x] SubTask 2.4: 实现非法交换回弹动画触发
  - [x] SubTask 2.5: 实现步数扣减逻辑（步数关）

- [x] Task 3: 实现判定、掉落与连锁系统
  - [x] SubTask 3.1: 实现同步扫描横纵连续段
  - [x] SubTask 3.2: 实现多群组统一清除
  - [x] SubTask 3.3: 实现从下到上逐列压缩掉落
  - [x] SubTask 3.4: 实现顶部补牌逻辑
  - [x] SubTask 3.5: 实现连锁判定（同一次操作触发的多次自动消除）
  - [x] SubTask 3.6: 实现连锁倍率（1.0 -> 1.25 -> 1.5 -> 1.75 -> 2.0上限）
  - [x] SubTask 3.7: 实现无合法交换时自动洗牌

- [x] Task 4: 实现特殊块生成与组合
  - [x] SubTask 4.1: 实现四连生成条纹块（横/纵）
  - [x] SubTask 4.2: 实现五连直线生成彩球
  - [x] SubTask 4.3: 实现T/L形五连生成包装块
  - [x] SubTask 4.4: 实现条纹+条纹组合（十字双清）
  - [x] SubTask 4.5: 实现条纹+包装组合（三行三列爆破）
  - [x] SubTask 4.6: 实现包装+包装组合（大范围双爆）
  - [x] SubTask 4.7: 实现彩球+普通色块组合（清屏该颜色）
  - [x] SubTask 4.8: 实现彩球+特殊块组合（全色转化）

- [x] Task 5: 实现障碍体系
  - [x] SubTask 5.1: 实现冻结层（需1~2次消除击破）
  - [x] SubTask 5.2: 实现锁链块（消除邻接后解锁）
  - [x] SubTask 5.3: 实现木箱/石块（需邻接爆破）
  - [x] SubTask 5.4: 实现传送口（入口/出口映射）
  - [x] SubTask 5.5: 实现蔓延块（每回合扩散）

- [x] Task 6: 实现胜利/失败判定
  - [x] SubTask 6.1: 实现目标达成胜利判定
  - [x] SubTask 6.2: 实现步数耗尽失败判定
  - [x] SubTask 6.3: 实现时间耗尽失败判定
  - [x] SubTask 6.4: 实现关键目标未完成失败判定
  - [x] SubTask 6.5: 实现失败原因分析和改进建议生成

## Phase B: 关卡数据与存档系统

- [x] Task 7: 创建关卡目录系统
  - [x] SubTask 7.1: 创建 `src/features/match3/match3LevelCatalog.ts`
  - [x] SubTask 7.2: 定义关卡脚本结构：boardTemplateId、palette、moveLimit等
  - [x] SubTask 7.3: 实现新手入门包（12关入门关卡数据）
  - [x] SubTask 7.4: 实现步数策略包（20关步数关卡数据）
  - [x] SubTask 7.5: 实现果冻清理包（18关覆盖层关卡数据）

- [x] Task 8: 创建存档系统
  - [x] SubTask 8.1: 创建 `src/features/match3/match3ProgressStorage.ts`
  - [x] SubTask 8.2: 实现存档字段：completedLevelIds、levelStars、bestScoreByLevel等
  - [x] SubTask 8.3: 实现存档读写与持久化
  - [x] SubTask 8.4: 实现进度展示接口

## Phase C: UI组件与HUD

- [x] Task 9: 创建Sheet16主玩法组件
  - [x] SubTask 9.1: 创建 `src/components/match3/Match3Sheet.tsx`（选关、模式切换入口）
  - [x] SubTask 9.2: 创建 `src/components/match3/Match3Board.tsx`（棋盘、色块、障碍渲染）
  - [x] SubTask 9.3: 创建 `src/components/match3/Match3Hud.tsx`（顶部信息栏）
  - [x] SubTask 9.4: 创建 `src/components/match3/Match3ResultPanel.tsx`（结算面板）

- [x] Task 10: 实现HUD信息显示
  - [x] SubTask 10.1: 实现模式、关卡名、目标摘要显示
  - [x] SubTask 10.2: 实现剩余步数/时间显示
  - [x] SubTask 10.3: 实现分数、连锁段数显示
  - [x] SubTask 10.4: 实现特殊块任务进度显示
  - [x] SubTask 10.5: 实现障碍威胁显示
  - [x] SubTask 10.6: 实现暂停、重开、加速动画按钮

- [x] Task 11: 实现结算面板
  - [x] SubTask 11.1: 实现胜利结算（星级、分数明细、连锁峰值、目标完成率）
  - [x] SubTask 11.2: 实现失败结算（未完成目标、失败主因、建议策略）
  - [x] SubTask 11.3: 实现三个出口：重开本局、返回选关、继续训练

## Phase D: 视觉音效系统

- [x] Task 12: 实现视觉动画系统
  - [x] SubTask 12.1: 创建 `src/styles/match3.css`
  - [x] SubTask 12.2: 实现交换动画（合法/非法回弹）
  - [x] SubTask 12.3: 实现消除动画（块消失+得分飘字）
  - [x] SubTask 12.4: 实现掉落动画（块下落）
  - [x] SubTask 12.5: 实现连锁特效（递增强度）
  - [x] SubTask 12.6: 实现特殊块触发特效（条纹清行、包装爆炸、彩球清屏）
  - [x] SubTask 12.7: 实现障碍击破动画

- [x] Task 13: 实现音效系统
  - [x] SubTask 13.1: 实现交换音效（区分合法/非法）
  - [x] SubTask 13.2: 实现消除音效
  - [x] SubTask 13.3: 实现连锁音效（递增音调）
  - [x] SubTask 13.4: 实现特殊块触发音效
  - [x] SubTask 13.5: 实现障碍击破音效
  - [x] SubTask 13.6: 实现胜利/失败结算音效

## Phase E: Sheet17图鉴与练习

- [x] Task 14: 创建Sheet17图鉴与练习组件
  - [x] SubTask 14.1: 创建 `src/components/match3/Match3LabSheet.tsx`
  - [x] SubTask 14.2: 创建块类型图鉴页（普通色块、条纹、包装、彩球）
  - [x] SubTask 14.3: 创建障碍图鉴页（效果、击破方式、优先级建议）
  - [x] SubTask 14.4: 创建目标图鉴页（判定时机与计数方式）
  - [x] SubTask 14.5: 创建组合手册页（特殊块组合结果与范围示意）

- [x] Task 15: 实现练习模式
  - [x] SubTask 15.1: 实现特殊块训练模块（固定盘面练4连/5连/TL形）
  - [x] SubTask 15.2: 实现组合训练模块（指定N步内触发某组合）
  - [x] SubTask 15.3: 实现障碍训练模块（单障碍与复合障碍拆解）
  - [x] SubTask 15.4: 实现练习结果指标统计

## Phase F: 测试与性能优化

- [x] Task 16: 创建单元测试
  - [x] SubTask 16.1: 创建合法/非法交换判定测试
  - [x] SubTask 16.2: 创建匹配扫描准确性测试（含交叉群组）
  - [x] SubTask 16.3: 创建掉落与补牌稳定性测试
  - [x] SubTask 16.4: 创建特殊块生成与组合结果测试
  - [x] SubTask 16.5: 创建洗牌后可行动作保证测试
  - [x] SubTask 16.6: 创建关卡胜负判定测试
  - [x] SubTask 16.7: 创建连锁倍率积分测试
  - [x] SubTask 16.8: 创建进度存储与读取测试

- [x] Task 17: 性能优化
  - [x] SubTask 17.1: 验证60fps帧率达标（常规棋盘8x8）
  - [x] SubTask 17.2: 验证高压棋盘性能（9x9保持流畅）
  - [x] SubTask 17.3: 实现事件队列动画播放（避免逻辑帧阻塞）
  - [x] SubTask 17.4: 实现加速动画功能（仅表现层）

## Phase G: Hub入口与集成

- [x] Task 18: Sheet1 Hub集成
  - [x] SubTask 18.1: 在Sheet1新增三消入口卡
  - [x] SubTask 18.2: 在Hub显示三消进度摘要（已通关、星级、今日挑战状态）
  - [x] SubTask 18.3: 实现Sheet16/Sheet17标签切换

---

# Task Dependencies

- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3
- Task 5 depends on Task 3
- Task 6 depends on Task 3, Task 5
- Task 7 depends on Task 1
- Task 8 depends on Task 6
- Task 9 depends on Task 2, Task 3, Task 4, Task 5, Task 6
- Task 10 depends on Task 9
- Task 11 depends on Task 6, Task 9
- Task 12 depends on Task 9
- Task 13 depends on Task 9
- Task 14 depends on Task 4, Task 5
- Task 15 depends on Task 14
- Task 16 depends on Task 3, Task 4, Task 5, Task 6
- Task 17 depends on Task 9, Task 12
- Task 18 depends on Task 9, Task 8