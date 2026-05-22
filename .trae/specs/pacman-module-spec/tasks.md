# 吃豆人模块任务列表

## Phase A: 核心运行时与基础玩法

- [x] Task 1: 创建吃豆人类型定义系统
  - [x] SubTask 1.1: 创建 `src/features/pacman/pacmanTypes.ts`，定义迷宫、豆子、能量豆、水果、鬼魂等核心类型
  - [x] SubTask 1.2: 定义地图单元类型：wall / path / pellet / energizer / ghostHouse / tunnel / fruitSpawn
  - [x] SubTask 1.3: 定义鬼魂状态：House / Scatter / Chase / Frightened / Eaten / Respawn
  - [x] SubTask 1.4: 定义四鬼类型：Blinky（红）、Pinky（粉）、Inky（青）、Clyde（橙）
  - [x] SubTask 1.5: 定义水果序列：樱桃、草莓、橙子、苹果、甜瓜、银河舰、铃铛、钥匙

- [x] Task 2: 实现迷宫与豆子系统
  - [x] SubTask 2.1: 创建 `src/features/pacman/pacmanBoardState.ts`，实现迷宫初始化
  - [x] SubTask 2.2: 实现豆子分布逻辑（按地图定义）
  - [x] SubTask 2.3: 实现能量豆分布逻辑（4个角位）
  - [x] SubTask 2.4: 实现传送门逻辑（左右通道联通）
  - [x] SubTask 2.5: 实现豆子拾取与得分
  - [x] SubTask 2.6: 实现能量豆触发Frightened全局状态

- [x] Task 3: 实现Pac-Man移动与输入系统
  - [x] SubTask 3.1: 实现方向输入处理（Arrow / WASD）
  - [x] SubTask 3.2: 实现转向缓存机制（下一方向缓存）
  - [x] SubTask 3.3: 实现Pac-Man位移与碰撞判定
  - [x] SubTask 3.4: 实现传送门穿越逻辑

- [x] Task 4: 实现水果系统
  - [x] SubTask 4.1: 实现水果触发逻辑（按豆子剩余阈值）
  - [x] SubTask 4.2: 实现水果出现时间限制
  - [x] SubTask 4.3: 实现水果拾取与得分
  - [x] SubTask 4.4: 实现水果序列进阶（樱桃->草莓->橙子等）

- [x] Task 5: 实现四鬼AI系统
  - [x] SubTask 5.1: 创建 `src/features/pacman/pacmanAi.ts`
  - [x] SubTask 5.2: 实现Blinky目标逻辑（直接追踪Pac-Man当前格）
  - [x] SubTask 5.3: 实现Pinky目标逻辑（瞄准Pac-Man前方若干格，含偏移异常开关）
  - [x] SubTask 5.4: 实现Inky目标逻辑（以Blinky与Pac-Man前方点构造向量）
  - [x] SubTask 5.5: 实现Clyde目标逻辑（远距离追击，近距离回角落）
  - [x] SubTask 5.6: 实现鬼魂状态机（House / Scatter / Chase / Frightened / Eaten / Respawn）
  - [x] SubTask 5.7: 实现鬼屋放行机制（豆子计数+时间兜底）

- [x] Task 6: 实现全局模式时序系统
  - [x] SubTask 6.1: 创建 `src/features/pacman/pacmanLevelTuning.ts`
  - [x] SubTask 6.2: 实现Scatter/Chase周期表驱动
  - [x] SubTask 6.3: 实现模式切换时鬼反向行为
  - [x] SubTask 6.4: 实现Frightened结束后恢复原模式节奏
  - [x] SubTask 6.5: 实现速度参数表（pacmanSpeed、ghostSpeed、tunnelGhostSpeedMultiplier）

- [x] Task 7: 实现胜利/失败判定
  - [x] SubTask 7.1: 实现清空普通豆胜利判定
  - [x] SubTask 7.2: 实现生命值归零失败判定
  - [x] SubTask 7.3: 实现Pac-Man与鬼碰撞判定（非Frightened状态扣命）
  - [x] SubTask 7.4: 实现吃鬼计分递增（Frightened状态）
  - [x] SubTask 7.5: 实现重生逻辑

## Phase B: 关卡数据与存档系统

- [x] Task 8: 创建关卡目录系统
  - [x] SubTask 8.1: 创建 `src/features/pacman/pacmanMapRegistry.ts`
  - [x] SubTask 8.2: 创建 `src/features/pacman/pacmanContent.ts`
  - [x] SubTask 8.3: 实现经典街机包（21+循环关数据）
  - [x] SubTask 8.4: 实现路线教学包（10关数据）
  - [x] SubTask 8.5: 实现levelTuningTable参数表

- [x] Task 9: 创建存档系统
  - [x] SubTask 9.1: 创建 `src/features/pacman/pacmanStorage.ts`
  - [x] SubTask 9.2: 实现存档字段：bestScore、highestLevel、bestClearTimeByMap等
  - [x] SubTask 9.3: 实现存档读写与持久化
  - [x] SubTask 9.4: 实现进度展示接口

## Phase C: UI组件与HUD

- [x] Task 10: 创建Sheet12主玩法组件
  - [x] SubTask 10.1: 创建 `src/components/pacman/PacmanSheet.tsx`（选关、模式设置入口）
  - [x] SubTask 10.2: 创建 `src/components/pacman/PacmanBoard.tsx`（迷宫、豆子、角色渲染）
  - [x] SubTask 10.3: 创建 `src/components/pacman/PacmanHud.tsx`（顶部信息栏）
  - [x] SubTask 10.4: 创建 `src/components/pacman/PacmanOverlay.tsx`（结算面板）

- [x] Task 11: 实现HUD信息显示
  - [x] SubTask 11.1: 实现当前分数显示
  - [x] SubTask 11.2: 实现当前关卡显示
  - [x] SubTask 11.3: 实现剩余生命显示
  - [x] SubTask 11.4: 实现当前模式显示（Scatter/Chase/Frightened）
  - [x] SubTask 11.5: 实现剩余豆子数显示
  - [x] SubTask 11.6: 实现水果状态显示（未出/出现中/已拾取）
  - [x] SubTask 11.7: 实现Frightened剩余时间显示（可选）

- [x] Task 12: 实现结算面板
  - [x] SubTask 12.1: 实现胜利结算（用时、剩余命、豆子清空率、水果收益、吃鬼次数）
  - [x] SubTask 12.2: 实现失败结算（死亡位置热区、最后10秒输入轨迹、建议改进点）
  - [x] SubTask 12.3: 实现三个出口：重开本局、返回选关、进入练习

## Phase D: 视觉音效系统

- [x] Task 13: 实现视觉动画系统
  - [x] SubTask 13.1: 创建 `src/styles/pacman.css`
  - [x] SubTask 13.2: 实现Pac-Man张嘴动画（带方向）
  - [x] SubTask 13.3: 实现鬼魂移动动画
  - [x] SubTask 13.4: 实现Frightened状态鬼魂闪烁预警动画
  - [x] SubTask 13.5: 实现吃豆动画（豆子消失）
  - [x] SubTask 13.6: 实现吃鬼动画（鬼被吃+得分飘字）
  - [x] SubTask 13.7: 实现水果出现/消失动画
  - [x] SubTask 13.8: 实现传送门穿越动画
  - [x] SubTask 13.9: 实现死亡动画（Pac-Man被吃）
  - [x] SubTask 13.10: 实现重生动画

- [x] Task 14: 实现音效系统
  - [x] SubTask 14.1: 实现吃豆音效（连续吃豆时音调递增）
  - [x] SubTask 14.2: 实现吃能量豆音效
  - [x] SubTask 14.3: 实现吃鬼音效（递增得分）
  - [x] SubTask 14.4: 实现吃水果音效
  - [x] SubTask 14.5: 实现死亡音效
  - [x] SubTask 14.6: 实现Frightened结束预警音效
  - [x] SubTask 14.7: 实现胜利/失败结算音效

## Phase E: Sheet13图鉴与练习

- [x] Task 15: 创建Sheet13图鉴与练习组件
  - [x] SubTask 15.1: 创建 `src/components/pacman/PacmanGuideSheet.tsx`
  - [x] SubTask 15.2: 创建四鬼行为说明页（目标规则+反制建议）
  - [x] SubTask 15.3: 创建水果价值与触发表页
  - [x] SubTask 15.4: 创建迷宫标签说明页（tunnel比例、死角密度、推荐路线类型）
  - [x] SubTask 15.5: 创建输入与判定说明页（缓存转向、碰撞优先级）

- [x] Task 16: 实现练习模式
  - [x] SubTask 16.1: 实现路口转向练习模块
  - [x] SubTask 16.2: 实现能量豆反打练习模块
  - [x] SubTask 16.3: 实现四鬼包夹逃生练习模块
  - [x] SubTask 16.4: 实现指定段落复盘练习模块

## Phase F: 测试与性能优化

- [x] Task 17: 创建单元测试
  - [x] SubTask 17.1: 创建路径阻挡与转向缓存判定测试
  - [x] SubTask 17.2: 创建四鬼目标计算正确性测试（含Pinky特例开关）
  - [x] SubTask 17.3: 创建模式时序切换与反向行为测试
  - [x] SubTask 17.4: 创建Frightened触发/结束与吃鬼计分递增测试
  - [x] SubTask 17.5: 创建清图进关与失败结算测试
  - [x] SubTask 17.6: 创建水果触发阈值与超时消失测试

- [x] Task 18: 性能优化
  - [x] SubTask 18.1: 验证60fps帧率达标
  - [x] SubTask 18.2: 验证固定步进逻辑帧（60Hz）
  - [x] SubTask 18.3: 验证渲染跟随浏览器帧率
  - [x] SubTask 18.4: 验证四鬼同时追击时保持流畅

## Phase G: Hub入口与集成

- [x] Task 19: Sheet1 Hub集成
  - [x] SubTask 19.1: 在Sheet1新增吃豆人入口卡
  - [x] SubTask 19.2: 在Hub显示吃豆人进度摘要（最佳分数、最高关卡、最快清图、无伤记录）
  - [x] SubTask 19.3: 实现Sheet12/Sheet13标签切换

---

# Task Dependencies

- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 2
- Task 5 depends on Task 1, Task 3
- Task 6 depends on Task 5
- Task 7 depends on Task 3, Task 5, Task 6
- Task 8 depends on Task 1
- Task 9 depends on Task 7
- Task 10 depends on Task 2, Task 3, Task 5, Task 7
- Task 11 depends on Task 10
- Task 12 depends on Task 7, Task 10
- Task 13 depends on Task 10
- Task 14 depends on Task 10
- Task 15 depends on Task 5
- Task 16 depends on Task 15
- Task 17 depends on Task 3, Task 5, Task 6, Task 7
- Task 18 depends on Task 10, Task 13
- Task 19 depends on Task 10, Task 9