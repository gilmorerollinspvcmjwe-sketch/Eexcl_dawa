# Tasks

## Phase 1: 类型定义扩展（并行）
- [x] Task 1.1: 扩展 PvZLevelDefinition 类型
  - 添加 PvZWaveConfig 接口
  - 添加 waves 字段到 PvZLevelDefinition
  - 添加 hasLawnMowers、skyDropSun、environment 字段
  - 文件：`src/features/pvz/pvzTypes.ts`

- [x] Task 1.2: 扩展 PvZBoardState 类型
  - 添加 currentWaveIndex 字段
  - 添加 waveState 字段（'idle' | 'active' | 'complete'）
  - 添加 skyDrops 字段（天空掉落阳光列表）
  - 添加 shovelMode 字段
  - 添加 gameSpeed 字段（1 | 2）
  - 添加 isPaused 字段
  - 文件：`src/features/pvz/pvzTypes.ts`

- [x] Task 1.3: 扩展 PvZPlantInstance 类型
  - 添加 isBeingAttacked 字段
  - 添加 attackFlashTimerMs 字段
  - 文件：`src/features/pvz/pvzTypes.ts`

- [x] Task 1.4: 扩展 PvZZombieInstance 类型
  - 添加 isAttacking 字段
  - 添加 attackTargetId 字段
  - 文件：`src/features/pvz/pvzTypes.ts`

## Phase 2: 核心逻辑实现（并行）
- [x] Task 2.1: 实现波次系统
  - 创建 processWaves 函数处理波次状态
  - 创建 startNextWave 函数开始下一波
  - 创建 generateWaveZombies 函数生成波次僵尸
  - 修改 tickPvZBoard 函数集成波次逻辑
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 2.2: 实现僵尸攻击植物
  - 创建 applyZombieAttacks 函数处理僵尸啃食
  - 修改 moveZombies 函数，僵尸接触植物后停止移动
  - 创建 zombieAttackPlant 函数处理单个僵尸攻击
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 2.3: 实现小推车逻辑
  - 创建 triggerLawnMower 函数触发推车
  - 创建 moveLawnMower 函数推车移动动画
  - 修改 breach 检查逻辑，先检查推车
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 2.4: 实现天空阳光掉落
  - 创建 spawnSkySun 函数生成天空阳光
  - 创建 collectSunDrop 函数收集阳光
  - 创建 updateSkyDrops 函数更新阳光位置
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 2.5: 实现铲子工具
  - 创建 toggleShovelMode 函数切换铲子模式
  - 创建 removePlantWithShovel 函数移除植物
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 2.6: 实现游戏速度控制
  - 创建 setGameSpeed 函数设置速度
  - 创建 togglePause 函数暂停/恢复
  - 修改 tickPvZBoard 函数，根据速度调整 elapsedMs
  - 文件：`src/features/pvz/pvzBoardState.ts`

## Phase 3: 环境限制实现（并行）
- [x] Task 3.1: 实现迷雾视野限制
  - 创建 fogMask 数据结构
  - 创建 updateFogVisibility 函数更新视野
  - 创建 checkPlantInFog 函数检查植物是否在迷雾中
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 3.2: 实现水路种植限制
  - 修改 placePlant 函数，检查水路限制
  - 创建 isWaterTile 函数判断水路格子
  - 创建 canPlantOnWater 函数判断植物是否可种水路
  - 文件：`src/features/pvz/pvzBoardState.ts`

- [x] Task 3.3: 实现屋顶抛投限制
  - 修改 availablePlants 过滤逻辑
  - 创建 isRoofLevel 函数判断屋顶关卡
  - 创建 isLobberPlant 函数判断抛投植物
  - 文件：`src/features/pvz/pvzBoardState.ts`

## Phase 4: UI 渲染实现（并行）
- [ ] Task 4.1: 实现波次提示 UI
  - 添加波次提示组件
  - 显示"大波僵尸来袭"、"最终波"提示
  - 文件：`src/components/pvz/PvZHud.tsx`

- [ ] Task 4.2: 实现小推车 UI
  - 添加小推车渲染
  - 添加推车触发动画
  - 文件：`src/components/pvz/PvZBoard.tsx`

- [ ] Task 4.3: 实现天空阳光 UI
  - 添加天空掉落阳光渲染
  - 添加阳光点击收集交互
  - 文件：`src/components/pvz/PvZBoard.tsx`

- [ ] Task 4.4: 实现铲子工具 UI
  - 添加铲子按钮
  - 添加铲子模式视觉反馈
  - 文件：`src/components/pvz/PvZHud.tsx`

- [ ] Task 4.5: 实现速度控制 UI
  - 添加暂停/恢复按钮
  - 添加加速按钮
  - 文件：`src/components/pvz/PvZHud.tsx`

- [ ] Task 4.6: 实现迷雾视野 UI
  - 添加迷雾遮罩渲染
  - 添加照明区域高亮
  - 文件：`src/components/pvz/PvZBoard.tsx`

- [ ] Task 4.7: 实现植物被攻击动画
  - 添加植物闪烁 CSS 动画
  - 添加植物摇晃动画
  - 文件：`src/styles/pvz.css`

## Phase 5: 关卡数据迁移
- [ ] Task 5.1: 迁移关卡数据到波次配置
  - 为所有 100 关添加波次配置
  - 根据强度等级计算波次数量
  - 文件：`src/features/pvz/pvzAdventureLevels.ts`

- [ ] Task 5.2: 添加环境标记
  - 为每章添加 environment 字段
  - 标记迷雾、水路、屋顶关卡
  - 文件：`src/features/pvz/pvzAdventureLevels.ts`

## Phase 6: 测试验证
- [ ] Task 6.1: 编写波次系统测试
  - 测试波次切换
  - 测试大波提示
  - 文件：`tests/pvzWaveSystem.test.ts`

- [ ] Task 6.2: 编写僵尸攻击测试
  - 测试僵尸啃食植物
  - 测试植物死亡
  - 文件：`tests/pvzZombieAttack.test.ts`

- [ ] Task 6.3: 编写小推车测试
  - 测试推车触发
  - 测试推车清场
  - 文件：`tests/pvzLawnMower.test.ts`

---

# Task Dependencies
- Task 2.1 depends on Task 1.1, Task 1.2
- Task 2.2 depends on Task 1.3, Task 1.4
- Task 2.3 depends on Task 1.2
- Task 2.4 depends on Task 1.2
- Task 2.5 depends on Task 1.2
- Task 2.6 depends on Task 1.2
- Task 3.1 depends on Task 1.1
- Task 3.2 depends on Task 1.1
- Task 3.3 depends on Task 1.1
- Task 4.1 depends on Task 2.1
- Task 4.2 depends on Task 2.3
- Task 4.3 depends on Task 2.4
- Task 4.4 depends on Task 2.5
- Task 4.5 depends on Task 2.6
- Task 4.6 depends on Task 3.1
- Task 4.7 depends on Task 2.2
- Task 5.1 depends on Task 1.1
- Task 5.2 depends on Task 1.1
- Task 6.1 depends on Task 2.1
- Task 6.2 depends on Task 2.2
- Task 6.3 depends on Task 2.3

---

# Parallel Execution Plan

## Batch 1: 类型定义（4 个 agent 并行）
- Agent A: Task 1.1 (PvZLevelDefinition)
- Agent B: Task 1.2 (PvZBoardState)
- Agent C: Task 1.3 (PvZPlantInstance)
- Agent D: Task 1.4 (PvZZombieInstance)

## Batch 2: 核心逻辑（6 个 agent 并行）
- Agent A: Task 2.1 (波次系统)
- Agent B: Task 2.2 (僵尸攻击)
- Agent C: Task 2.3 (小推车)
- Agent D: Task 2.4 (天空阳光)
- Agent E: Task 2.5 (铲子)
- Agent F: Task 2.6 (速度控制)

## Batch 3: 环境限制（3 个 agent 并行）
- Agent A: Task 3.1 (迷雾)
- Agent B: Task 3.2 (水路)
- Agent C: Task 3.3 (屋顶)

## Batch 4: UI 渲染（7 个 agent 并行）
- Agent A: Task 4.1 (波次提示)
- Agent B: Task 4.2 (小推车 UI)
- Agent C: Task 4.3 (天空阳光 UI)
- Agent D: Task 4.4 (铲子 UI)
- Agent E: Task 4.5 (速度 UI)
- Agent F: Task 4.6 (迷雾 UI)
- Agent G: Task 4.7 (攻击动画)

## Batch 5: 数据迁移（2 个 agent 并行）
- Agent A: Task 5.1 (波次配置)
- Agent B: Task 5.2 (环境标记)

## Batch 6: 测试验证（3 个 agent 并行）
- Agent A: Task 6.1 (波次测试)
- Agent B: Task 6.2 (攻击测试)
- Agent C: Task 6.3 (推车测试)