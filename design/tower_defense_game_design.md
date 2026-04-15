# 塔防（Tower Defense）Excel 游戏详细设计

- 日期：2026-04-14
- 项目：`excel-aim-trainer`
- 设计目标：在现有 Excel 风格游戏合辑中新增塔防模块，提供"防御塔放置 + 波次抵御 + 策略升级"的经典塔防玩法
- 设计阶段：实施前详细设计

---

## 1. 游戏概述

### 1.1 一句话介绍

塔防是一个"在路径旁建塔，阻止敌人到达终点"的策略游戏——在 Excel 表格里，它变成了"数据防火墙"，防御塔是数据校验函数，敌人是异常数据流，路径是数据管道，终点是核心数据库。

### 1.2 核心卖点

- **3 秒可理解**：选塔建在路径旁，塔自动打敌人，不让敌人到终点
- **策略深度**：塔的搭配、升级顺序、位置选择，每关都有最优解
- **波次递进**：敌人越来越强，需要不断调整策略
- **Excel 伪装天然适配**：路径 = 数据流管道，塔 = 校验函数，敌人 = 异常数据，终点 = 核心表
- **短局策略循环**：每关 5~15 分钟，波次间可调整布局

---

## 2. 原版游戏分析

### 2.1 原版核心机制

| 机制 | 说明 |
| --- | --- |
| 固定路径 | 敌人沿预定路线前进，玩家无法改变路径 |
| 防御塔放置 | 玩家在路径旁空地上放置防御塔 |
| 自动攻击 | 防御塔自动攻击范围内敌人 |
| 塔升级 | 消耗金币升级塔，提升属性和改变外观 |
| 波次系统 | 敌人分波次出现，每波越来越强 |
| 经济系统 | 击杀敌人获得金币，用于建塔和升级 |
| 生命值 | 敌人到达终点扣除生命值，生命归零失败 |

### 2.2 原版玩法循环

```
关卡开始
  -> 显示地图和路径
  -> 准备阶段（可建塔）
  -> 第一波敌人出现
  -> 防御塔自动攻击
  -> 波次结束，获得金币
  -> 准备阶段（可建塔/升级）
  -> 下一波敌人
  -> ...
  -> 所有波次完成 -> 胜利
  -> 生命归零 -> 失败
```

### 2.3 原版防御塔类型

| 塔类型 | 攻击方式 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| 箭塔 | 单体快速 | 攻速快，伤害低 | 前期过渡 |
| 炮塔 | 范围伤害 | 伤害高，攻速慢 | 密集敌人 |
| 法师塔 | 单体高伤 | 穿透护甲 | 重装敌人 |
| 减速塔 | 减速效果 | 不造成伤害 | 辅助控制 |
| 兵营 | 生产士兵 | 阻挡敌人 |  choke point |
| 增益塔 | 增强周围塔 | 不攻击 | 辅助增益 |

### 2.4 原版 UI 布局

```
┌─────────────────────────────────────────────┐
│  关卡: 5    金币: 250    生命: 20    波次: 3/10 │  <- 顶部 HUD
├─────────────────────────────────────────────┤
│                                             │
│  起点 → ──┐    ┌── → ──┐    ┌── → 终点      │
│           │    │       │    │                │  <- 游戏主区域
│    [塔]   └── → [塔]   └── → [塔]            │     Canvas 渲染
│                                             │     800×600px
│    [塔]         [塔]         [塔]            │
│                                             │
├─────────────────────────────────────────────┤
│  [箭塔 50G] [炮塔 100G] [法师塔 150G]        │  <- 塔选择栏
│  [减速塔 75G] [兵营 125G] [增益塔 80G]       │
│  [升级] [出售] [暂停] [加速]                  │  <- 控制按钮
└─────────────────────────────────────────────┘
```

---

## 3. 核心玩法设计

### 3.1 玩法规则

#### 基本规则
- 敌人沿固定路径前进，目标是到达终点
- 玩家在路径旁空地上放置防御塔
- 防御塔自动攻击范围内敌人
- 敌人到达终点扣除生命值
- 生命归零则失败，所有波次完成则胜利

#### 防御塔规则
- 每种塔有固定攻击范围、伤害、攻速
- 塔可升级 3 级，每级提升属性
- 塔出售后返还 70% 金币
- 同一位置只能建一座塔

#### 敌人规则
- 敌人沿路径移动，速度固定
- 敌人有生命值、护甲、特殊能力
- 击杀敌人获得金币
- 敌人到达终点扣除生命值

#### 波次规则
- 每关有固定波次数（通常 10~20 波）
- 每波敌人数量和强度递增
- 每 10 波有 Boss 敌人
- 波次间有准备时间

### 3.2 核心类型定义

```ts
type TowerDefenseStatus = 'idle' | 'preparing' | 'fighting' | 'paused' | 'won' | 'lost';
type TowerType = 'arrow' | 'cannon' | 'mage' | 'slow' | 'barracks' | 'buff';
type EnemyType = 'normal' | 'armored' | 'fast' | 'flying' | 'stealth' | 'healer' | 'boss';
type TerrainType = 'empty' | 'path' | 'tower' | 'obstacle' | 'highland' | 'grass';

interface Tower {
  id: string;
  type: TowerType;
  level: 1 | 2 | 3;
  x: number;
  y: number;
  range: number;
  damage: number;
  attackSpeed: number;
  attackCooldown: number;
  target: Enemy | null;
  angle: number;
}

interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  armor: number;
  speed: number;
  pathIndex: number;
  pathProgress: number;
  isFlying: boolean;
  isStealth: boolean;
  reward: number;
  damage: number; // 到达终点时扣除的生命值
}

interface Wave {
  number: number;
  enemies: EnemySpawn[];
  reward: number;
  isBossWave: boolean;
}

interface EnemySpawn {
  type: EnemyType;
  count: number;
  interval: number; // 生成间隔（毫秒）
  delay: number;    // 延迟生成时间
}
```

### 3.3 数据结构

```ts
interface MapCell {
  x: number;
  y: number;
  terrain: TerrainType;
  tower: Tower | null;
  pathDirection: number | null; // 路径方向（0-360）
}

interface GameMap {
  width: number;
  height: number;
  cells: MapCell[][];
  path: { x: number; y: number }[];
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

interface GameState {
  status: TowerDefenseStatus;
  gold: number;
  lives: number;
  maxLives: number;
  currentWave: number;
  totalWaves: number;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  map: GameMap;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  target: Enemy;
  speed: number;
  damage: number;
  isSplash: boolean;
  splashRadius: number;
}
```

---

## 4. 防御塔系统设计

### 4.1 塔类型属性

| 塔类型 | 价格 | 范围 | 伤害 | 攻速 | 特点 |
| --- | --- | --- | --- | --- | --- |
| 箭塔 | 50 | 120px | 10 | 1.0/s | 单体快速，前期过渡 |
| 炮塔 | 100 | 100px | 30 | 0.5/s | 范围伤害，克制密集 |
| 法师塔 | 150 | 150px | 25 | 0.8/s | 穿透护甲，克制重装 |
| 减速塔 | 75 | 100px | 0 | 持续 | 减速 40%，辅助控制 |
| 兵营 | 125 | 80px | 5 | 持续 | 生产士兵阻挡敌人 |
| 增益塔 | 80 | 120px | 0 | 持续 | 周围塔伤害 +20% |

### 4.2 塔升级属性

| 塔类型 | 1 级 | 2 级（×1.5 价格） | 3 级（×2 价格） |
| --- | --- | --- | --- |
| 箭塔 | 伤害 10 | 伤害 18，攻速 +20% | 伤害 30，攻速 +40%，射程 +20% |
| 炮塔 | 伤害 30 | 伤害 55，范围 +30% | 伤害 90，范围 +50%，溅射 +50% |
| 法师塔 | 伤害 25 | 伤害 45，穿透 +50% | 伤害 75，穿透 100%，减速 20% |
| 减速塔 | 减速 40% | 减速 55%，范围 +20% | 减速 70%，范围 +40%，附加易伤 |
| 兵营 | 2 士兵 | 3 士兵，生命 +50% | 4 士兵，生命 +100%，攻击 +50% |
| 增益塔 | +20% 伤害 | +35% 伤害，范围 +20% | +50% 伤害，范围 +40%，附加攻速 |

### 4.3 塔升级价格

| 塔类型 | 1 级价格 | 2 级升级 | 3 级升级 | 总投入 |
| --- | --- | --- | --- | --- |
| 箭塔 | 50 | 75 | 100 | 225 |
| 炮塔 | 100 | 150 | 200 | 450 |
| 法师塔 | 150 | 225 | 300 | 675 |
| 减速塔 | 75 | 112 | 150 | 337 |
| 兵营 | 125 | 187 | 250 | 562 |
| 增益塔 | 80 | 120 | 160 | 360 |

### 4.4 塔攻击逻辑

```ts
// 防御塔攻击逻辑
class TowerAI {
  update(tower: Tower, enemies: Enemy[], dt: number): void {
    // 减少冷却时间
    tower.attackCooldown -= dt;
    
    if (tower.attackCooldown > 0) return;
    
    // 寻找目标
    const target = this.findTarget(tower, enemies);
    
    if (!target) return;
    
    // 执行攻击
    this.attack(tower, target);
    
    // 重置冷却
    tower.attackCooldown = 1 / tower.attackSpeed;
  }
  
  private findTarget(tower: Tower, enemies: Enemy[]): Enemy | null {
    let target: Enemy | null = null;
    let maxProgress = -1;
    
    for (const enemy of enemies) {
      // 检查是否在范围内
      const distance = this.calculateDistance(tower, enemy);
      if (distance > tower.range) continue;
      
      // 检查是否可攻击（飞行/隐身）
      if (enemy.isFlying && !this.canAttackFlying(tower)) continue;
      if (enemy.isStealth && !this.canDetectStealth(tower)) continue;
      
      // 选择最接近终点的敌人
      if (enemy.pathProgress > maxProgress) {
        maxProgress = enemy.pathProgress;
        target = enemy;
      }
    }
    
    return target;
  }
}
```

---

## 5. 敌人系统设计

### 5.1 敌人类型属性

| 敌人类型 | 生命值 | 速度 | 护甲 | 特殊能力 | 奖励金币 |
| --- | --- | --- | --- | --- | --- |
| 普通 | 50 | 50px/s | 0 | 无 | 5 |
| 重装 | 150 | 30px/s | 20 | 高护甲 | 15 |
| 快速 | 30 | 100px/s | 0 | 高速移动 | 8 |
| 飞行 | 40 | 60px/s | 0 | 无视地面塔 | 10 |
| 隐身 | 35 | 45px/s | 0 | 隐形（需探测） | 12 |
| 治疗 | 80 | 40px/s | 5 | 治疗周围敌人 | 20 |
| Boss | 1000 | 25px/s | 30 | 高生命高护甲 | 100 |

### 5.2 敌人波次配置

| 波次 | 敌人类型 | 数量 | 总强度 | 奖励 |
| --- | --- | --- | --- | --- |
| 1 | 普通 | 10 | 低 | 50 |
| 3 | 普通 + 快速 | 15 | 低 | 75 |
| 5 | 普通 + 重装 | 20 | 中低 | 100 |
| 7 | 普通 + 快速 + 重装 | 25 | 中 | 125 |
| 10 | 混合 + Boss | 30 + 1 | 高 | 200 |
| 15 | 混合 + 飞行 + 隐身 | 40 | 很高 | 300 |
| 20 | 全类型 + 2 Boss | 50 + 2 | 极高 | 500 |

### 5.3 敌人特殊能力

| 能力 | 说明 | 应对策略 |
| --- | --- | --- |
| 高护甲 | 减免固定伤害 | 使用法师塔穿透 |
| 高速移动 | 快速通过路径 | 使用减速塔控制 |
| 飞行 | 无视地面塔 | 使用对空塔 |
| 隐身 | 隐形不被发现 | 使用探测塔 |
| 治疗 | 治疗周围敌人 | 优先击杀 |
| Boss | 高生命高护甲 | 集中火力 |

---

## 6. 地图与路径设计

### 6.1 地图类型

| 地图类型 | 特点 | 难度 | 说明 |
| --- | --- | --- | --- |
| 直线 | 单一直线路径 | 简单 | 适合新手 |
| 弯曲 | 弯曲路径 | 中等 | 更多建塔点 |
| 分叉 | 多条路径 | 困难 | 需要多线防守 |
| 环形 | 环形路径 | 困难 | 敌人绕圈 |
| 迷宫 | 复杂路径 | 极难 | 最多建塔点 |

### 6.2 地形效果

| 地形 | 效果 | 说明 |
| --- | --- | --- |
| 空地 | 可建塔 | 默认地形 |
| 路径 | 敌人通行 | 不可建塔 |
| 障碍物 | 不可建塔 | 阻挡视线 |
| 高地 | 塔射程 +20% | 战略要点 |
| 草丛 | 塔隐蔽 | 敌人优先攻击其他目标 |

### 6.3 地图参数

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 地图尺寸 | 800×600px | 游戏区域 |
| 网格大小 | 40×40px | 建塔单位 |
| 路径宽度 | 40px | 敌人通行宽度 |
| 建塔点 | 约 150 个 | 可建塔位置 |
| 路径长度 | 约 2000px | 敌人总路程 |

---

## 7. 波次系统设计

### 7.1 波次配置

| 波次 | 敌人数量 | 强度系数 | 间隔 | 准备时间 |
| --- | --- | --- | --- | --- |
| 1~5 | 10~20 | 1.0 | 1000ms | 15s |
| 6~10 | 20~30 | 1.5 | 800ms | 12s |
| 11~15 | 30~40 | 2.0 | 600ms | 10s |
| 16~20 | 40~50 | 2.5 | 500ms | 8s |

### 7.2 Boss 波配置

| Boss 波 | Boss 数量 | Boss 强度 | 普通敌人 | 奖励 |
| --- | --- | --- | --- | --- |
| 10 | 1 | 1000 HP | 20 | 200 |
| 15 | 1 | 2000 HP | 30 | 300 |
| 20 | 2 | 3000 HP | 40 | 500 |
| 25 | 2 | 5000 HP | 50 | 800 |
| 30 | 3 | 8000 HP | 60 | 1200 |

### 7.3 波次奖励

| 奖励类型 | 条件 | 奖励 |
| --- | --- | --- |
| 波次完成 | 完成波次 | 基础金币 |
| 无伤完成 | 生命未减少 | +50% 金币 |
| 快速完成 | 提前完成 | +25% 金币 |
| 连杀奖励 | 连续击杀 | 额外金币 |

---

## 8. 经济系统

### 8.1 金币来源

| 来源 | 金币 | 说明 |
| --- | --- | --- |
| 初始金币 | 200 | 游戏开始 |
| 击杀普通 | 5~15 | 按敌人类型 |
| 击杀 Boss | 100~500 | 按 Boss 强度 |
| 波次奖励 | 50~200 | 按波次难度 |
| 利息 | 每 50 金币得 5 | 上限 25 |
| 无伤奖励 | +50% | 波次无伤 |

### 8.2 金币花费

| 花费 | 金币 | 说明 |
| --- | --- | --- |
| 建箭塔 | 50 | 基础塔 |
| 建炮塔 | 100 | 范围塔 |
| 建法师塔 | 150 | 穿透塔 |
| 建减速塔 | 75 | 辅助塔 |
| 建兵营 | 125 | 阻挡塔 |
| 建增益塔 | 80 | 增益塔 |
| 升级塔 | 75~300 | 按塔类型 |

### 8.3 经济曲线

| 波次 | 期望收入 | 期望支出 | 净收益 | 累计金币 |
| --- | --- | --- | --- | --- |
| 1 | 75 | 50 | +25 | 175 |
| 5 | 150 | 100 | +50 | 300 |
| 10 | 300 | 200 | +100 | 500 |
| 15 | 500 | 300 | +200 | 800 |
| 20 | 800 | 500 | +300 | 1200 |

---

## 9. 数值平衡

### 9.1 伤害计算公式

```ts
// 伤害计算
function calculateDamage(tower: Tower, enemy: Enemy): number {
  let damage = tower.damage;
  
  // 护甲减免（固定减免）
  damage = Math.max(1, damage - enemy.armor);
  
  // 地形修正
  if (isOnHighland(tower)) {
    damage *= 1.2; // 高地 +20%
  }
  
  // 增益修正
  const buffMultiplier = getBuffMultiplier(tower);
  damage *= buffMultiplier;
  
  // 随机波动
  damage *= 0.9 + Math.random() * 0.2;
  
  return Math.floor(damage);
}
```

### 9.2 塔属性成长

| 塔类型 | 1 级 DPS | 2 级 DPS | 3 级 DPS | 成长倍率 |
| --- | --- | --- | --- | --- |
| 箭塔 | 10 | 21.6 | 42 | ×4.2 |
| 炮塔 | 15 | 41.25 | 90 | ×6.0 |
| 法师塔 | 20 | 54 | 112.5 | ×5.6 |
| 减速塔 | 0 | 0 | 0 | 辅助 |
| 兵营 | 10 | 22.5 | 45 | ×4.5 |
| 增益塔 | 0 | 0 | 0 | 辅助 |

### 9.3 敌人强度曲线

| 波次 | 平均 HP | 平均速度 | 平均护甲 | 数量 |
| --- | --- | --- | --- | --- |
| 1 | 50 | 50px/s | 0 | 10 |
| 5 | 75 | 55px/s | 5 | 20 |
| 10 | 150 | 60px/s | 10 | 30 |
| 15 | 250 | 65px/s | 15 | 40 |
| 20 | 400 | 70px/s | 20 | 50 |

---

## 10. 操作流程

### 10.1 鼠标操作

| 操作 | 功能 | 说明 |
| --- | --- | --- |
| 点击塔图标 | 选择塔 | 从塔选择栏选择 |
| 点击空地 | 建塔 | 在空地建造选中的塔 |
| 点击塔 | 选中塔 | 显示塔信息和操作 |
| 点击升级 | 升级塔 | 消耗金币升级 |
| 点击出售 | 出售塔 | 返还 70% 金币 |
| 点击波次按钮 | 开始波次 | 提前开始下一波 |

### 10.2 键盘操作

| 按键 | 功能 | 说明 |
| --- | --- | --- |
| 1~6 | 选择塔 | 快速选择塔类型 |
| 空格 | 开始波次 | 提前开始下一波 |
| P | 暂停 | 暂停/继续 |
| Esc | 取消 | 取消选择 |
| + | 加速 | 2 倍速 |
| - | 减速 | 0.5 倍速 |

### 10.3 游戏流程

```
主菜单
  -> 选择关卡
  -> 关卡加载
  -> 准备阶段
  -> 建塔
  -> 开始波次
  -> 敌人出现
  -> 塔自动攻击
  -> 波次结束
  -> 获得金币
  -> 准备阶段（建塔/升级）
  -> 下一波
  -> ...
  -> 所有波次完成 -> 胜利
  -> 生命归零 -> 失败
```

---

## 11. UI 布局设计

### 11.1 游戏主界面

```
┌─────────────────────────────────────────────┐
│  塔防 - 数据防火墙                           │  <- 标题栏
├─────────────────────────────────────────────┤
│  关卡: 5    金币: 250    生命: 20    波次: 3/10 │  <- 顶部 HUD
├─────────────────────────────────────────────┤
│                                             │
│  起点 → ──┐    ┌── → ──┐    ┌── → 终点      │
│           │    │       │    │                │  <- 游戏主区域
│    [塔]   └── → [塔]   └── → [塔]            │     Canvas 渲染
│                                             │     800×600px
│    [塔]         [塔]         [塔]            │
│                                             │
├─────────────────────────────────────────────┤
│  [箭塔 50G] [炮塔 100G] [法师塔 150G]        │  <- 塔选择栏
│  [减速塔 75G] [兵营 125G] [增益塔 80G]       │
│  [升级] [出售] [暂停] [加速]                  │  <- 控制按钮
└─────────────────────────────────────────────┘
```

### 11.2 塔信息面板

```
┌─────────────────────────────────────────────┐
│              箭塔 (Lv.2)                      │
├─────────────────────────────────────────────┤
│  伤害: 18    攻速: 1.2/s    射程: 120px      │
│  总投入: 125    出售返还: 87                  │
│                                             │
│  [升级到 Lv.3 (100G)]  [出售 (87G)]          │
└─────────────────────────────────────────────┘
```

### 11.3 结算界面

```
┌─────────────────────────────────────────────┐
│           关卡完成！                          │
├─────────────────────────────────────────────┤
│                                             │
│  剩余生命: 15/20                             │
│  总击杀: 150                                 │
│  总建塔: 12                                  │
│  总升级: 8                                   │
│  获得金币: 1200                              │
│                                             │
│  [下一关]    [重新挑战]    [返回菜单]         │
└─────────────────────────────────────────────┘
```

---

## 12. 美术风格

### 12.1 Excel 伪装风格

| 元素 | Excel 伪装 | 实际含义 |
| --- | --- | --- |
| 地图 | 工作表背景 | 游戏场景 |
| 路径 | 单元格边框连线 | 敌人路线 |
| 防御塔 | 函数图标 | 防御单位 |
| 敌人 | 错误标记 | 攻击单位 |
| 投射物 | 公式引用线 | 攻击弹道 |
| 金币 | 单元格数值 | 游戏货币 |
| 生命 | 进度条 | 剩余生命 |
| 范围 | 单元格选中框 | 攻击范围 |

### 12.2 颜色方案

| 元素 | 颜色 | 色值 | 说明 |
| --- | --- | --- | --- |
| 背景 | 浅灰 | #F5F5F5 | Excel 默认背景 |
| 路径 | 浅蓝 | #E3F2FD | 数据流管道 |
| 空地 | 白色 | #FFFFFF | 可建塔区域 |
| 高地 | 浅绿 | #E8F5E9 | 战略要点 |
| 草丛 | 深绿 | #C8E6C9 | 隐蔽区域 |
| 箭塔 | 棕色 | #8D6E63 | 基础塔 |
| 炮塔 | 深灰 | #616161 | 范围塔 |
| 法师塔 | 紫色 | #9C27B0 | 穿透塔 |
| 减速塔 | 蓝色 | #2196F3 | 辅助塔 |
| 兵营 | 绿色 | #4CAF50 | 阻挡塔 |
| 增益塔 | 金色 | #FFC107 | 增益塔 |
| 普通敌人 | 红色 | #F44336 | 基础敌人 |
| Boss | 深红 | #B71C1C | Boss 敌人 |

### 12.3 动画效果

| 动画 | 触发条件 | 效果 | 时长 |
| --- | --- | --- | --- |
| 建塔 | 放置塔 | 从地面升起 | 300ms |
| 攻击 | 塔攻击 | 投射物飞行 | 300ms |
| 命中 | 击中敌人 | 爆炸特效 | 200ms |
| 升级 | 升级塔 | 发光 + 放大 | 500ms |
| 敌人死亡 | HP 归零 | 缩小消失 | 400ms |
| 金币增加 | 获得金币 | 数字跳动 | 200ms |
| 波次开始 | 开始波次 | 敌人从起点出现 | 500ms |

---

## 13. 音效设计

### 13.1 音效列表

| 音效 | 触发条件 | 风格 | 时长 |
| --- | --- | --- | --- |
| 建塔 | 放置塔 | 建造音效 | 200ms |
| 攻击 | 塔攻击 | 短促"嗖"声 | 100ms |
| 命中 | 击中敌人 | 碰撞声 | 150ms |
| 敌人死亡 | HP 归零 | 爆炸声 | 300ms |
| 升级 | 升级塔 | 升级音效 | 500ms |
| 波次开始 | 开始波次 | 警报声 | 1000ms |
| 胜利 | 关卡完成 | 欢快旋律 | 2000ms |
| 失败 | 生命归零 | 低沉音效 | 1500ms |

### 13.2 BGM 设计

- 准备阶段：轻松思考，BPM 100，策略氛围
- 战斗阶段：紧张节奏，BPM 130，战斗氛围
- Boss 波：高压节奏，BPM 150，Boss 战氛围

---

## 14. 技术难点分析

### 14.1 路径跟随

```ts
// 敌人沿路径移动
class PathFollower {
  update(enemy: Enemy, dt: number, path: { x: number; y: number }[]): void {
    if (enemy.pathIndex >= path.length - 1) {
      // 到达终点
      enemy.reachedEnd = true;
      return;
    }
    
    const current = path[enemy.pathIndex];
    const next = path[enemy.pathIndex + 1];
    
    // 计算方向
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 移动
    enemy.pathProgress += enemy.speed * dt;
    
    if (enemy.pathProgress >= distance) {
      // 到达下一个路径点
      enemy.pathProgress -= distance;
      enemy.pathIndex++;
    }
    
    // 更新位置
    const progress = enemy.pathProgress / distance;
    enemy.x = current.x + dx * progress;
    enemy.y = current.y + dy * progress;
  }
}
```

### 14.2 碰撞检测

```ts
// 投射物与敌人碰撞
function checkProjectileCollision(
  projectile: Projectile,
  enemies: Enemy[]
): Enemy | null {
  for (const enemy of enemies) {
    const distance = Math.sqrt(
      (projectile.x - enemy.x) ** 2 + (projectile.y - enemy.y) ** 2
    );
    
    if (distance < enemy.radius + projectile.radius) {
      return enemy;
    }
  }
  
  return null;
}
```

### 14.3 范围检测

```ts
// 检测范围内敌人
function getEnemiesInRange(
  tower: Tower,
  enemies: Enemy[]
): Enemy[] {
  const inRange: Enemy[] = [];
  
  for (const enemy of enemies) {
    const distance = Math.sqrt(
      (tower.x - enemy.x) ** 2 + (tower.y - enemy.y) ** 2
    );
    
    if (distance <= tower.range) {
      // 检查是否可攻击
      if (enemy.isFlying && !canAttackFlying(tower)) continue;
      if (enemy.isStealth && !canDetectStealth(tower)) continue;
      
      inRange.push(enemy);
    }
  }
  
  return inRange;
}
```

### 14.4 性能优化

- 使用 Canvas 渲染游戏主区域
- 敌人和塔使用对象池
- 碰撞检测使用空间哈希
- 投射物使用批量渲染
- 路径预计算缓存

---

## 15. 文件结构

```
src/
  modules/
    towerdefense/
      components/
        TowerDefenseGame.tsx     # 游戏主组件
        TowerDefenseMap.tsx      # 地图组件
        TowerDefenseHUD.tsx      # HUD 组件
        TowerDefenseMenu.tsx     # 菜单组件
        TowerDefenseSettlement.tsx # 结算组件
        TowerPanel.tsx           # 塔面板
      core/
        towerDefenseEngine.ts    # 游戏引擎
        towerDefenseTypes.ts     # 类型定义
        towerDefenseConstants.ts # 常量配置
        towerDefenseLevels.ts    # 关卡数据
      systems/
        towerSystem.ts           # 塔系统
        enemySystem.ts           # 敌人系统
        waveSystem.ts            # 波次系统
        projectileSystem.ts      # 投射物系统
        economySystem.ts         # 经济系统
        pathSystem.ts            # 路径系统
      utils/
        pathfinding.ts           # 路径计算
        collisionUtils.ts        # 碰撞检测
        rangeUtils.ts            # 范围检测
      assets/
        sounds/                  # 音效文件
        sprites/                 # 精灵图
      index.ts                   # 模块入口
```

---

## 16. 集成方案

### 16.1 Sheet Registry 注册

```ts
// src/sheets/registry.ts
import { towerDefenseSheet } from '../modules/towerdefense';

export const sheetRegistry = [
  // ... 其他 sheet
  towerDefenseSheet,
];
```

### 16.2 Arcade Module Registry 注册

```ts
// src/modules/arcade/registry.ts
import { registerTowerDefense } from '../modules/towerdefense';

export function registerAllArcadeModules() {
  // ... 其他模块
  registerTowerDefense();
}
```

### 16.3 模块接口

```ts
// src/modules/towerdefense/index.ts
export const towerDefenseSheet = {
  id: 'towerdefense',
  name: '塔防 - 数据防火墙',
  icon: '🏰',
  component: TowerDefenseGame,
  category: 'arcade',
  unlockCondition: null, // 初始解锁
};

export function registerTowerDefense() {
  arcadeModuleRegistry.register({
    id: 'towerdefense',
    sheet: towerDefenseSheet,
    routes: [
      { path: '/towerdefense', component: TowerDefenseGame },
      { path: '/towerdefense/menu', component: TowerDefenseMenu },
      { path: '/towerdefense/settlement', component: TowerDefenseSettlement },
    ],
  });
}
```

---

## 17. 数据存储

### 17.1 本地存储结构

```ts
interface TowerDefenseSaveData {
  unlockedLevels: number[];     // 已解锁关卡
  levelStars: Record<number, number>; // 关卡星级评价
  bestScores: Record<number, number>; // 关卡最高分
  totalGames: number;           // 总游戏次数
  totalWins: number;            // 总胜利次数
  totalEnemiesKilled: number;   // 总击杀敌人
  totalTowersBuilt: number;     // 总建塔数
  lastPlayedAt: string;         // 最后游玩时间
}
```

### 17.2 存储键名

- `towerdefense_save_data`: 主存档数据
- `towerdefense_settings`: 游戏设置（音量等）

### 17.3 数据迁移

- 使用版本号管理存档格式
- 新增字段时提供默认值
- 旧版本存档自动迁移

---

## 18. 测试要点

### 18.1 功能测试

- [ ] 建塔和出售正常
- [ ] 塔升级正常
- [ ] 敌人沿路径移动
- [ ] 塔自动攻击正确
- [ ] 伤害计算正确
- [ ] 波次系统正常
- [ ] 经济系统正确
- [ ] 胜利/失败判定正确
- [ ] 结算系统正常

### 18.2 边界测试

- [ ] 地图边界不可建塔
- [ ] 路径上不可建塔
- [ ] 金币不足时不可建塔
- [ ] 塔等级不超限
- [ ] 敌人到达终点扣生命
- [ ] 生命归零正确失败

### 18.3 性能测试

- [ ] 60 FPS 稳定运行
- [ ] 大量敌人不卡顿
- [ ] 多塔同时攻击不卡顿
- [ ] 内存无泄漏

---

## 19. 开发计划

### 19.1 阶段划分

| 阶段 | 内容 | 优先级 |
| --- | --- | --- |
| P0 | 核心地图 + 路径 + 建塔 | 高 |
| P1 | 敌人系统 + 波次系统 + 战斗 | 高 |
| P2 | 塔升级 + 经济系统 + 关卡 | 中 |
| P3 | UI 美化 + 音效 + 动画效果 | 中 |
| P4 | 多地图 + 特殊地形 + 挑战模式 | 低 |

### 19.2 关键技术点

1. 路径跟随算法
2. 塔攻击逻辑
3. 碰撞检测
4. 波次配置
5. 经济平衡

---

*文档版本：v1.0*
*最后更新：2026-04-14*
*设计者：多智能体团队*
