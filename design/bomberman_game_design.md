# 泡泡堂（Bomberman）Excel 游戏详细设计

- 日期：2026-04-14
- 项目：`excel-aim-trainer`
- 设计目标：在现有 Excel 风格游戏合辑中新增泡泡堂模块，提供"炸弹放置 + 爆炸传播 + 道具收集"的经典街机玩法
- 设计阶段：实施前详细设计

---

## 1. 游戏概述

### 1.1 一句话介绍

泡泡堂是一个"放炸弹炸开墙壁，收集道具变强，消灭所有敌人过关"的策略游戏——在 Excel 表格里，它变成了"数据清理器"，炸弹是批量删除公式，炸开的是隐藏的数据单元格。

### 1.2 核心卖点

- **3 秒可理解**：方向键移动，空格放炸弹，炸开墙壁找道具
- **策略 + 时机**：炸弹连锁爆炸、道具选择、走位躲避，每关都有决策空间
- **道具驱动成长**：每关收集道具增强能力，形成"炸 -> 收集 -> 变强 -> 炸更多"的正循环
- **Excel 伪装天然适配**：炸弹 = 批量删除宏，墙壁 = 隐藏单元格，道具 = 数据格式化工具
- **短局高压循环**：每关 2~5 分钟，限时通关，失败即重开

---

## 2. 原版游戏分析

### 2.1 原版核心机制

| 机制 | 说明 |
| --- | --- |
| 网格移动 | 玩家在固定网格（通常 13×15）上四方向移动，不能斜走 |
| 炸弹放置 | 按键在当前位置放置炸弹，炸弹倒计时后爆炸 |
| 十字爆炸 | 爆炸沿上下左右四个方向传播，遇到墙壁或障碍物停止 |
| 墙壁破坏 | 软墙壁可被炸毁，硬墙壁不可破坏 |
| 道具收集 | 炸毁软墙壁后随机掉落道具，拾取后增强能力 |
| 敌人 AI | 敌人在网格内移动，碰到玩家或炸弹爆炸即造成伤害 |
| 连锁爆炸 | 炸弹爆炸可引燃相邻炸弹，形成连锁反应 |

### 2.2 原版玩法循环

```
关卡开始
  -> 玩家在网格中移动
  -> 放置炸弹炸开软墙壁
  -> 收集掉落的道具增强能力
  -> 躲避敌人和爆炸
  -> 消灭所有敌人
  -> 找到出口过关
  -> 进入下一关
```

### 2.3 原版道具系统

| 道具 | 效果 | 稀有度 | 说明 |
| --- | --- | --- | --- |
| 炸弹 +1 | 同时放置炸弹数 +1 | 高 | 基础成长道具 |
| 火焰 +1 | 爆炸范围 +1 格 | 高 | 基础成长道具 |
| 速度 +1 | 移动速度提升 | 中 | 机动性增强 |
| 穿墙弹 | 炸弹可穿透软墙壁 | 低 | 高级战术道具 |
| 遥控炸弹 | 手动控制爆炸时机 | 低 | 高级战术道具 |
| 护盾 | 抵挡一次伤害 | 中 | 保命道具 |
| 炸弹踢 | 可踢走炸弹 | 低 | 进攻/防御两用 |
| 炸弹推 | 可推动炸弹 | 低 | 战术调整道具 |

### 2.4 原版 UI 布局

```
┌─────────────────────────────────────────────┐
│  Level: 5    Lives: ♥♥♥    Time: 180s       │  <- 顶部 HUD
│  Bombs: ███░░  Fire: ████░░  Speed: ██░░░   │
├─────────────────────────────────────────────┤
│  # # # # # # # # # # # # # # #              │
│  # . . . # . . . . . # . . . #              │  <- 游戏主区域
│  # . # . # . # # # . # . # . #              │     13×15 网格
│  # . . . . . . . . . . . . . #              │     # = 硬墙
│  # . # # . # . # . # # . # . #              │     . = 空地
│  # . . . . . . . . . . . . . #              │     ■ = 软墙
│  # . # . # . # # # . # . # . #              │     ● = 炸弹
│  # . . . . . . . . . . . . . #              │     * = 爆炸
│  # . # # . # . # . # # . # . #              │
│  # . . . # . . . . . # . . . #              │
│  # # # # # # # # # # # # # # #              │
├─────────────────────────────────────────────┤
│  [道具栏] 炸弹×3  火焰×4  速度×2            │  <- 底部状态栏
└─────────────────────────────────────────────┘
```

---

## 3. 核心玩法设计

### 3.1 玩法规则

#### 基本规则
- 玩家在 13×15 网格中移动，使用方向键控制
- 按空格键在当前位置放置炸弹
- 炸弹 3 秒后爆炸，产生十字形火焰
- 火焰碰到玩家或敌人造成伤害
- 消灭所有敌人后，出口出现，进入出口过关

#### 炸弹规则
- 初始可同时放置 1 个炸弹
- 炸弹放置后不可移动（除非有踢/推道具）
- 炸弹爆炸时产生十字形火焰，范围由火焰等级决定
- 火焰遇到硬墙或地图边界停止
- 火焰可引燃相邻炸弹，形成连锁爆炸

#### 墙壁规则
- 硬墙（#）：不可破坏，固定布局
- 软墙（■）：可被炸弹炸毁，炸毁后随机掉落道具
- 空地（.）：可自由通行

#### 敌人规则
- 敌人在网格内自动移动，碰到墙壁会转向
- 敌人碰到玩家或炸弹爆炸即造成伤害
- 消灭所有敌人后过关

### 3.2 核心类型定义

```ts
type BombermanStatus = 'idle' | 'playing' | 'paused' | 'level_complete' | 'game_over';
type Direction = 'up' | 'down' | 'left' | 'right';
type CellType = 'wall_hard' | 'wall_soft' | 'empty' | 'exit' | 'bomb' | 'fire';
type ItemKind = 'bomb_up' | 'fire_up' | 'speed_up' | 'pierce' | 'remote' | 'shield' | 'kick' | 'push';
type EnemyKind = 'balloon' | 'ghost' | 'tiger' | 'boss';
```

### 3.3 网格数据结构

```ts
interface Cell {
  type: CellType;
  item?: ItemKind;      // 软墙炸毁后掉落的道具
  enemy?: EnemyKind;    // 该格是否有敌人
}

interface Bomb {
  x: number;
  y: number;
  owner: 'player' | 'enemy';
  fireRange: number;    // 火焰传播格数
  timer: number;        // 倒计时（毫秒）
  isRemote: boolean;    // 是否遥控炸弹
}

interface Fire {
  x: number;
  y: number;
  direction: Direction;
  timer: number;        // 火焰持续时间
}
```

---

## 4. 道具系统设计

### 4.1 基础道具

| 道具 | 图标 | 效果 | 初始值 | 最大值 | 稀有度 |
| --- | --- | --- | --- | --- | --- |
| 炸弹 +1 | 💣 | 同时放置数 +1 | 1 | 8 | 30% |
| 火焰 +1 | 🔥 | 爆炸范围 +1 格 | 1 | 8 | 30% |
| 速度 +1 | ⚡ | 移动速度 +10% | 100% | 200% | 20% |

### 4.2 特殊道具

| 道具 | 图标 | 效果 | 持续时间 | 稀有度 |
| --- | --- | --- | --- | --- |
| 穿墙弹 | 🎯 | 炸弹穿透软墙 | 永久 | 5% |
| 遥控炸弹 | 📡 | 手动控制爆炸 | 永久 | 5% |
| 护盾 | 🛡️ | 抵挡一次伤害 | 一次 | 5% |
| 炸弹踢 | 👟 | 可踢走炸弹 | 永久 | 3% |
| 炸弹推 | 🤚 | 可推动炸弹 | 永久 | 2% |

### 4.3 道具掉落规则

- 软墙炸毁后有 40% 概率掉落道具
- 道具种类按稀有度权重随机抽取
- 同一关卡内基础道具最多掉落 5 次（防止过强）
- 特殊道具每关最多掉落 1 次

---

## 5. 敌人 AI 设计

### 5.1 敌人类型

| 类型 | 生命值 | 速度 | 行为模式 | 出现关卡 |
| --- | --- | --- | --- | --- |
| 气球怪 | 1 | 慢 | 随机移动，碰到墙壁转向 | 1~10 |
| 幽灵怪 | 1 | 中 | 追踪玩家，可穿软墙 | 5~15 |
| 老虎怪 | 2 | 快 | 快速追踪，优先靠近玩家 | 10~20 |
| Boss | 5 | 中 | 放置炸弹，智能走位 | 每章最终关 |

### 5.2 AI 行为树

```
敌人 AI
  -> 检测玩家位置
  -> 计算最短路径
  -> 选择行为模式
    -> 随机移动（气球怪）
    -> 追踪玩家（幽灵怪/老虎怪）
    -> 放置炸弹（Boss）
  -> 躲避爆炸（所有敌人）
    -> 检测附近炸弹
    -> 计算爆炸范围
    -> 移动到安全区域
```

### 5.3 敌人移动规则

- 敌人在网格内移动，每次移动 1 格
- 移动间隔由速度决定（0.5s ~ 1.5s）
- 碰到墙壁或炸弹时随机选择新方向
- 高级敌人可计算路径，避开死胡同

---

## 6. 关卡系统设计

### 6.1 关卡包结构

| 关卡包 | 关卡数 | 主题 | 难度 | 解锁条件 |
| --- | --- | --- | --- | --- |
| 基础篇 | 12 关 | 经典网格 | 简单 | 初始解锁 |
| 进阶篇 | 12 关 | 复杂地形 | 中等 | 通过基础篇 |
| 挑战篇 | 12 关 | 特殊规则 | 困难 | 通过进阶篇 |

### 6.2 关卡生成规则

#### 硬墙布局
- 采用固定模板，确保地图对称美观
- 每 2×2 区域至少有一个通道
- 保证从起点到所有区域可达

#### 软墙分布
- 随机放置，但保证起点周围 3×3 区域无软墙
- 软墙密度随关卡递增（30% ~ 60%）
- 保证出口位置可达

#### 敌人配置
- 敌人数量随关卡递增（2 ~ 8 个）
- 敌人类型随关卡解锁
- Boss 关只出现 1 个 Boss

### 6.3 关卡参数表

| 关卡 | 时间限制 | 敌人数量 | 软墙密度 | 道具掉落率 | 目标 |
| --- | --- | --- | --- | --- | --- |
| 1 | 180s | 2 | 30% | 40% | 消灭敌人 |
| 5 | 180s | 4 | 40% | 40% | 消灭敌人 |
| 10 | 150s | 6 | 50% | 35% | 消灭敌人 |
| 15 | 150s | 8 | 55% | 35% | 消灭敌人 |
| 20 | 120s | 8 + Boss | 60% | 30% | 消灭 Boss |
| 30 | 120s | 8 + Boss | 60% | 30% | 消灭 Boss |

---

## 7. 数值平衡

### 7.1 玩家属性

| 属性 | 初始值 | 每级提升 | 最大值 | 说明 |
| --- | --- | --- | --- | --- |
| 移动速度 | 100px/s | +10% | 200% | 基础速度 |
| 炸弹数量 | 1 | +1 | 8 | 同时放置数 |
| 火焰范围 | 1 格 | +1 格 | 8 格 | 爆炸传播距离 |
| 生命值 | 1 | - | 3 | 护盾道具可增加 |

### 7.2 炸弹参数

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 倒计时 | 3000ms | 放置后爆炸时间 |
| 火焰持续 | 500ms | 火焰存在时间 |
| 引燃范围 | 相邻 1 格 | 可引燃相邻炸弹 |
| 伤害 | 1 | 碰到即扣 1 生命 |

### 7.3 经济系统

- 无金币系统，道具通过炸墙获取
- 关卡评价基于通关时间和剩余生命
- 三星评价：时间 < 60s 且生命满
- 二星评价：时间 < 120s
- 一星评价：通关即可

---

## 8. 操作流程

### 8.1 键盘操作

| 按键 | 功能 | 说明 |
| --- | --- | --- |
| ↑ ↓ ← → | 移动 | 四方向移动 |
| 空格 | 放置炸弹 | 在当前位置放置炸弹 |
| P | 暂停 | 暂停/继续游戏 |
| R | 重新开始 | 重新开始当前关卡 |
| Enter | 确认 | 菜单确认/进入出口 |
| Esc | 返回 | 返回主菜单 |

### 8.2 游戏流程

```
主菜单
  -> 选择关卡包
  -> 选择关卡
  -> 关卡加载
  -> 游戏开始
  -> 移动/放置炸弹/收集道具
  -> 消灭所有敌人
  -> 出口出现
  -> 进入出口
  -> 关卡结算
  -> 下一关 / 返回菜单
```

### 8.3 暂停菜单

```
┌─────────────────────┐
│     游戏暂停         │
├─────────────────────┤
│  [继续游戏]          │
│  [重新开始]          │
│  [返回主菜单]        │
└─────────────────────┘
```

---

## 9. UI 布局设计

### 9.1 游戏主界面

```
┌─────────────────────────────────────────────┐
│  泡泡堂 - 数据清理器                         │  <- 标题栏
├─────────────────────────────────────────────┤
│  关卡: 5   生命: ♥♥♥   时间: 120s           │  <- 顶部 HUD
│  炸弹: ███░░░░░  火焰: ████░░░░            │
├─────────────────────────────────────────────┤
│                                             │
│  # # # # # # # # # # # # # # #              │
│  # . . . # . . . . . # . . . #              │  <- 游戏主区域
│  # . ■ . # . ■ ■ ■ . # . ■ . #              │     Canvas 渲染
│  # . . . . . . . . . . . . . #              │     800×600px
│  # . ■ ■ . # . ■ . ■ ■ . # . #              │
│  # . . . . . . . . . . . . . #              │
│  # . ■ . # . ■ ■ ■ . # . ■ . #              │
│  # . . . # . . . . . # . . . #              │
│  # # # # # # # # # # # # # # #              │
│                                             │
├─────────────────────────────────────────────┤
│  [道具] 💣×3  🔥×4  ⚡×2  🛡️×1             │  <- 底部状态栏
│  [操作提示] 方向键移动  空格放炸弹           │
└─────────────────────────────────────────────┘
```

### 9.2 关卡结算界面

```
┌─────────────────────────────────────────────┐
│           关卡完成！                          │
├─────────────────────────────────────────────┤
│                                             │
│              ★★★                            │
│                                             │
│  通关时间: 45s                              │
│  剩余生命: ♥♥♥                              │
│  收集道具: 8 个                              │
│  消灭敌人: 6 个                              │
│                                             │
│  [下一关]    [重新挑战]    [返回菜单]         │
└─────────────────────────────────────────────┘
```

---

## 10. 美术风格

### 10.1 Excel 伪装风格

| 元素 | Excel 伪装 | 实际含义 |
| --- | --- | --- |
| 网格线 | 单元格边框 | 游戏地图网格 |
| 硬墙 | 合并单元格 | 不可破坏障碍 |
| 软墙 | 隐藏单元格 | 可破坏障碍 |
| 炸弹 | 批注标记 | 爆炸物 |
| 火焰 | 条件格式高亮 | 爆炸范围 |
| 道具 | 数据验证图标 | 能力增强 |
| 敌人 | 错误标记 | 敌对单位 |
| 玩家 | 选中单元格 | 玩家角色 |
| 出口 | 超链接 | 过关入口 |

### 10.2 颜色方案

| 元素 | 颜色 | 色值 | 说明 |
| --- | --- | --- | --- |
| 背景 | 浅灰 | #F5F5F5 | Excel 默认背景 |
| 硬墙 | 深灰 | #D9D9D9 | 合并单元格色 |
| 软墙 | 浅蓝 | #DEEBF7 | 条件格式色 |
| 空地 | 白色 | #FFFFFF | 默认单元格 |
| 炸弹 | 黑色 | #000000 | 批注标记色 |
| 火焰 | 橙红 | #FF6B35 | 警告色 |
| 玩家 | 蓝色 | #4472C4 | 选中单元格色 |
| 敌人 | 红色 | #C00000 | 错误标记色 |
| 道具 | 绿色 | #70AD47 | 成功标记色 |
| 出口 | 紫色 | #7030A0 | 超链接色 |

### 10.3 动画效果

| 动画 | 触发条件 | 效果 | 时长 |
| --- | --- | --- | --- |
| 炸弹闪烁 | 倒计时最后 1 秒 | 快速闪烁 | 1000ms |
| 爆炸扩散 | 炸弹爆炸 | 十字形火焰扩散 | 500ms |
| 墙壁破碎 | 炸弹炸墙 | 软墙碎裂消失 | 300ms |
| 道具出现 | 墙壁炸毁 | 从墙壁位置弹出 | 200ms |
| 敌人消灭 | 碰到火焰 | 缩小消失 | 400ms |
| 出口出现 | 敌人全灭 | 从地面升起 | 500ms |

---

## 11. 音效设计

### 11.1 音效列表

| 音效 | 触发条件 | 风格 | 时长 |
| --- | --- | --- | --- |
| 放置炸弹 | 按空格键 | 短促"滴"声 | 100ms |
| 炸弹倒计时 | 最后 1 秒 | 急促"滴滴"声 | 1000ms |
| 爆炸 | 炸弹爆炸 | 低沉"轰"声 | 500ms |
| 墙壁破碎 | 炸毁软墙 | 碎裂声 | 300ms |
| 道具收集 | 拾取道具 | 清脆"叮"声 | 200ms |
| 敌人消灭 | 敌人死亡 | 短促"啪"声 | 300ms |
| 受到伤害 | 碰到敌人/火焰 | 低沉"咚"声 | 400ms |
| 关卡完成 | 进入出口 | 欢快旋律 | 2000ms |
| 游戏失败 | 生命耗尽 | 低沉音效 | 1500ms |

### 11.2 BGM 设计

- 基础篇：轻快节奏，BPM 120，营造轻松氛围
- 进阶篇：紧张节奏，BPM 140，增加紧迫感
- 挑战篇：高压节奏，BPM 160，配合高难度挑战

---

## 12. 技术难点分析

### 12.1 爆炸传播算法

```ts
// 十字形爆炸传播
function calculateFireRange(bomb: Bomb, grid: Cell[][]): Fire[] {
  const fires: Fire[] = [];
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  for (const dir of directions) {
    for (let i = 1; i <= bomb.fireRange; i++) {
      const x = bomb.x + getDeltaX(dir, i);
      const y = bomb.y + getDeltaY(dir, i);
      
      if (isOutOfBounds(x, y)) break;
      
      const cell = grid[y][x];
      if (cell.type === 'wall_hard') break;
      
      fires.push({ x, y, direction: dir, timer: 500 });
      
      if (cell.type === 'wall_soft') {
        cell.type = 'empty';
        break; // 火焰在软墙处停止
      }
    }
  }
  
  return fires;
}
```

### 12.2 地图可达性验证

```ts
// BFS 验证地图可达性
function isMapReachable(grid: Cell[][], start: {x: number, y: number}): boolean {
  const visited = new Set<string>();
  const queue = [start];
  visited.add(`${start.x},${start.y}`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
      const next = {
        x: current.x + getDeltaX(dir, 1),
        y: current.y + getDeltaY(dir, 1)
      };
      
      const key = `${next.x},${next.y}`;
      if (visited.has(key)) continue;
      if (isOutOfBounds(next.x, next.y)) continue;
      if (grid[next.y][next.x].type === 'wall_hard') continue;
      
      visited.add(key);
      queue.push(next);
    }
  }
  
  // 检查是否所有空地都可达
  return visited.size >= countEmptyCells(grid);
}
```

### 12.3 敌人 AI 路径规划

```ts
// 简单 A* 路径规划
function findPath(grid: Cell[][], start: {x: number, y: number}, 
                end: {x: number, y: number}): Direction[] {
  const openSet = [start];
  const cameFrom = new Map<string, {x: number, y: number}>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  gScore.set(`${start.x},${start.y}`, 0);
  fScore.set(`${start.x},${start.y}`, heuristic(start, end));
  
  while (openSet.length > 0) {
    const current = openSet.shift()!;
    
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }
    
    for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
      const neighbor = {
        x: current.x + getDeltaX(dir, 1),
        y: current.y + getDeltaY(dir, 1)
      };
      
      if (!isValidMove(grid, neighbor)) continue;
      
      const key = `${neighbor.x},${neighbor.y}`;
      const tentativeG = (gScore.get(`${current.x},${current.y}`) || 0) + 1;
      
      if (tentativeG < (gScore.get(key) || Infinity)) {
        cameFrom.set(key, current);
        gScore.set(key, tentativeG);
        fScore.set(key, tentativeG + heuristic(neighbor, end));
        
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return []; // 无路径
}
```

### 12.4 性能优化

- 使用 Canvas 渲染游戏主区域，避免 DOM 操作
- 爆炸计算使用空间哈希，减少遍历
- 敌人 AI 使用简化路径规划，避免每帧计算
- 道具掉落使用预生成池，避免运行时随机

---

## 13. 文件结构

```
src/
  modules/
    bomberman/
      components/
        BombermanGame.tsx        # 游戏主组件
        BombermanHUD.tsx         # HUD 组件
        BombermanMenu.tsx        # 菜单组件
        BombermanSettlement.tsx  # 结算组件
      core/
        bombermanEngine.ts       # 游戏引擎
        bombermanTypes.ts        # 类型定义
        bombermanConstants.ts    # 常量配置
        bombermanLevels.ts       # 关卡数据
      systems/
        bombSystem.ts            # 炸弹系统
        fireSystem.ts            # 火焰系统
        itemSystem.ts            # 道具系统
        enemySystem.ts           # 敌人系统
        collisionSystem.ts       # 碰撞检测
      utils/
        gridUtils.ts             # 网格工具
        pathfinding.ts           # 路径规划
        mapGenerator.ts          # 地图生成
      assets/
        sounds/                  # 音效文件
        sprites/                 # 精灵图
      index.ts                   # 模块入口
```

---

## 14. 集成方案

### 14.1 Sheet Registry 注册

```ts
// src/sheets/registry.ts
import { bombermanSheet } from '../modules/bomberman';

export const sheetRegistry = [
  // ... 其他 sheet
  bombermanSheet,
];
```

### 14.2 Arcade Module Registry 注册

```ts
// src/modules/arcade/registry.ts
import { registerBomberman } from '../modules/bomberman';

export function registerAllArcadeModules() {
  // ... 其他模块
  registerBomberman();
}
```

### 14.3 模块接口

```ts
// src/modules/bomberman/index.ts
export const bombermanSheet = {
  id: 'bomberman',
  name: '泡泡堂 - 数据清理器',
  icon: '💣',
  component: BombermanGame,
  category: 'arcade',
  unlockCondition: null, // 初始解锁
};

export function registerBomberman() {
  arcadeModuleRegistry.register({
    id: 'bomberman',
    sheet: bombermanSheet,
    routes: [
      { path: '/bomberman', component: BombermanGame },
      { path: '/bomberman/menu', component: BombermanMenu },
      { path: '/bomberman/settlement', component: BombermanSettlement },
    ],
  });
}
```

---

## 15. 数据存储

### 15.1 本地存储结构

```ts
interface BombermanSaveData {
  unlockedLevels: number[];     // 已解锁关卡
  levelStars: Record<number, number>; // 关卡星级评价
  bestTimes: Record<number, number>;  // 最佳通关时间
  totalGames: number;           // 总游戏次数
  totalWins: number;            // 总胜利次数
  totalItemsCollected: number;  // 总道具收集数
  totalEnemiesDefeated: number; // 总敌人消灭数
  lastPlayedAt: string;         // 最后游玩时间
}
```

### 15.2 存储键名

- `bomberman_save_data`: 主存档数据
- `bomberman_settings`: 游戏设置（音量等）

### 15.3 数据迁移

- 使用版本号管理存档格式
- 新增字段时提供默认值
- 旧版本存档自动迁移

---

## 16. 测试要点

### 16.1 功能测试

- [ ] 炸弹放置和爆炸正常
- [ ] 火焰传播范围正确
- [ ] 软墙可被炸毁
- [ ] 硬墙不可破坏
- [ ] 道具掉落和收集正常
- [ ] 敌人 AI 行为正确
- [ ] 出口出现条件正确
- [ ] 关卡结算正常

### 16.2 边界测试

- [ ] 地图边界不可穿越
- [ ] 炸弹数量限制生效
- [ ] 火焰范围限制生效
- [ ] 敌人不会卡在墙内
- [ ] 道具不会重叠
- [ ] 连锁爆炸正常触发

### 16.3 性能测试

- [ ] 60 FPS 稳定运行
- [ ] 多炸弹同时爆炸不卡顿
- [ ] 大量敌人同时移动不卡顿
- [ ] 内存无泄漏

---

## 17. 开发计划

### 17.1 阶段划分

| 阶段 | 内容 | 优先级 |
| --- | --- | --- |
| P0 | 核心网格移动 + 炸弹放置 + 爆炸传播 | 高 |
| P1 | 墙壁系统 + 道具系统 + 敌人 AI | 高 |
| P2 | 关卡系统 + 结算系统 + 数据存储 | 中 |
| P3 | UI 美化 + 音效 + 动画效果 | 中 |
| P4 | 多关卡包 + 特殊规则 + 挑战模式 | 低 |

### 17.2 关键技术点

1. 网格移动和碰撞检测
2. 爆炸传播算法
3. 敌人 AI 路径规划
4. 地图可达性验证
5. 道具掉落和收集

---

*文档版本：v1.0*
*最后更新：2026-04-14*
*设计者：多智能体团队*
