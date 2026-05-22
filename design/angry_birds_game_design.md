# 愤怒的小鸟（Angry Birds）Excel 游戏详细设计

- 日期：2026-04-14
- 项目：`excel-aim-trainer`
- 设计目标：在现有 Excel 风格游戏合辑中新增愤怒的小鸟模块，提供"弹弓发射 + 2D 物理 + 破坏判定"的经典益智玩法
- 设计阶段：实施前详细设计

---

## 1. 游戏概述

### 1.1 一句话介绍

愤怒的小鸟是一个"拉弹弓瞄准，发射小鸟，利用物理破坏建筑消灭猪"的益智游戏——在 Excel 表格里，它变成了"数据修正器"，弹弓是数据校验工具，小鸟是修正公式，猪是错误数据，建筑是错误数据结构。

### 1.2 核心卖点

- **3 秒可理解**：拖拽弹弓瞄准，松开发射，撞倒建筑消灭猪
- **物理 + 策略**：抛物线弹道、材质破坏、连锁反应，每关都有最优解
- **多鸟种能力**：不同鸟有特殊技能，合理搭配是关键
- **Excel 伪装天然适配**：弹弓 = 数据校验器，鸟 = 修正公式，猪 = 错误数据，建筑 = 错误结构
- **短局解谜循环**：每关 1~3 分钟，用最少鸟过关，追求三星评价

---

## 2. 原版游戏分析

### 2.1 原版核心机制

| 机制 | 说明 |
| --- | --- |
| 弹弓发射 | 拖拽弹弓调整角度和力度，松开发射 |
| 抛物线弹道 | 小鸟受重力影响，沿抛物线飞行 |
| 2D 物理 | 建筑受碰撞力影响，发生位移、旋转、倒塌 |
| 材质破坏 | 不同材质有不同强度和破坏阈值 |
| 特殊能力 | 每种鸟有独特技能，点击触发 |
| 连锁反应 | 建筑倒塌可引发连锁破坏 |
| 胜利条件 | 消灭所有猪即过关 |

### 2.2 原版玩法循环

```
关卡开始
  -> 观察建筑结构和猪的位置
  -> 选择鸟种
  -> 拖拽弹弓瞄准
  -> 松开发射
  -> 小鸟沿抛物线飞行
  -> 碰撞建筑/猪
  -> 触发特殊能力（可选）
  -> 建筑破坏，猪被消灭
  -> 所有猪消灭 -> 过关
  -> 鸟用完猪还在 -> 失败
```

### 2.3 原版鸟类角色

| 鸟种 | 颜色 | 特殊能力 | 适用场景 |
| --- | --- | --- | --- |
| 红鸟 | 红 | 无 | 基础攻击 |
| 蓝鸟 | 蓝 | 分裂成 3 只 | 玻璃建筑 |
| 黄鸟 | 黄 | 加速冲刺 | 木头建筑 |
| 黑鸟 | 黑 | 爆炸 | 石头建筑 |
| 白鸟 | 白 | 下蛋炸弹 | 高处目标 |
| 大鸟 | 大 | 击退 | 重型建筑 |

### 2.4 原版 UI 布局

```
┌─────────────────────────────────────────────┐
│  关卡: 15    剩余鸟: 🐦🐦🐦    分数: 12500   │  <- 顶部 HUD
├─────────────────────────────────────────────┤
│                                             │
│  🏗️    🐷    🏗️                            │
│    🏗️  🐷  🏗️                              │  <- 游戏主区域
│      🏗️                                    │     Canvas 渲染
│                    🎯 <- 弹弓                │     800×600px
│                   /                         │
│                  🐦 <- 待发射鸟              │
│                                             │
├─────────────────────────────────────────────┤
│  [下一只: 🐦蓝]  [暂停]  [重新开始]  [菜单]  │  <- 底部控制栏
└─────────────────────────────────────────────┘
```

---

## 3. 核心玩法设计

### 3.1 玩法规则

#### 基本规则
- 玩家拖拽弹弓调整角度和力度
- 松开发射小鸟，小鸟沿抛物线飞行
- 小鸟碰撞建筑或猪，造成破坏
- 消灭所有猪即过关
- 鸟用完猪还在则失败

#### 弹弓规则
- 最大拖拽半径：80px
- 角度范围：-70° ~ +70°（相对于水平线）
- 最大发射速度：600px/s
- 拖拽距离越远，发射速度越大

#### 物理规则
- 重力加速度：400px/s²
- 摩擦系数：0.5
- 弹性系数：0.3
- 碰撞力 = 质量 × 速度

#### 胜利条件
- 消灭所有猪即过关
- 剩余鸟越多，分数越高
- 建筑破坏越多，分数越高

### 3.2 核心类型定义

```ts
type AngryBirdsStatus = 'idle' | 'aiming' | 'flying' | 'settling' | 'won' | 'lost' | 'paused';
type BirdKind = 'red' | 'blue' | 'yellow' | 'black' | 'white' | 'big';
type PigKind = 'small' | 'medium' | 'large' | 'helmet' | 'king';
type MaterialKind = 'glass' | 'wood' | 'stone';
type Direction = 'up' | 'down' | 'left' | 'right';
```

### 3.3 数据结构

```ts
interface Bird {
  kind: BirdKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  abilityUsed: boolean;
  isActive: boolean;
}

interface Pig {
  kind: PigKind;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  isAlive: boolean;
}

interface Block {
  material: MaterialKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  vx: number;
  vy: number;
  angularVelocity: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
}

interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  restitution: number;
  friction: number;
}
```

---

## 4. 鸟类角色设计

### 4.1 鸟类属性

| 鸟种 | 颜色 | 半径 | 质量 | 生命值 | 特殊能力 | 数量/关 |
| --- | --- | --- | --- | --- | --- | --- |
| 红鸟 | #FF4444 | 15px | 1 | 1 | 无 | 3~5 |
| 蓝鸟 | #4488FF | 10px | 0.5 | 1 | 分裂成 3 只 | 2~3 |
| 黄鸟 | #FFCC00 | 12px | 0.8 | 1 | 加速冲刺 | 2~3 |
| 黑鸟 | #333333 | 18px | 2 | 1 | 爆炸（范围伤害） | 1~2 |
| 白鸟 | #FFFFFF | 16px | 1.2 | 1 | 下蛋炸弹 | 1~2 |
| 大鸟 | #884400 | 22px | 3 | 2 | 击退（推开物体） | 1 |

### 4.2 特殊能力详情

| 鸟种 | 能力 | 触发方式 | 效果 | 冷却 |
| --- | --- | --- | --- | --- |
| 红鸟 | 无 | - | 基础碰撞伤害 | - |
| 蓝鸟 | 分裂 | 点击 | 分裂成 3 只小鸟，分散飞行 | 无 |
| 黄鸟 | 加速 | 点击 | 速度×3，沿当前方向冲刺 | 无 |
| 黑鸟 | 爆炸 | 点击/碰撞 | 范围爆炸，半径 60px，伤害 5 | 无 |
| 白鸟 | 下蛋 | 点击 | 垂直下蛋，蛋落地爆炸 | 无 |
| 大鸟 | 击退 | 被动 | 碰撞时击退物体，力度×2 | 无 |

### 4.3 鸟类适用场景

| 鸟种 | 玻璃 | 木头 | 石头 | 猪 |
| --- | --- | --- | --- | --- |
| 红鸟 | ★★★ | ★★☆ | ★☆☆ | ★★☆ |
| 蓝鸟 | ★★★ | ★☆☆ | ☆☆☆ | ★★☆ |
| 黄鸟 | ★★☆ | ★★★ | ★☆☆ | ★★★ |
| 黑鸟 | ★★★ | ★★★ | ★★★ | ★★★ |
| 白鸟 | ★★☆ | ★★☆ | ★★☆ | ★★★ |
| 大鸟 | ★★★ | ★★★ | ★★☆ | ★★★ |

---

## 5. 猪类型设计

### 5.1 猪属性

| 猪种 | 半径 | 生命值 | 分数 | 出现关卡 |
| --- | --- | --- | --- | --- |
| 小猪 | 12px | 1 | 5000 | 1~10 |
| 中猪 | 16px | 2 | 10000 | 5~20 |
| 大猪 | 20px | 3 | 15000 | 10~30 |
| 头盔猪 | 18px | 4 | 20000 | 15~40 |
| 猪王 | 24px | 5 | 50000 | Boss 关 |

### 5.2 猪的行为

| 行为 | 说明 | 触发条件 |
| --- | --- | --- |
| 静止 | 待在原地不动 | 默认状态 |
| 滚动 | 被碰撞后滚动 | 受到碰撞力 |
| 弹飞 | 被大力碰撞弹飞 | 碰撞力 > 阈值 |
| 嘲笑 | 鸟飞过未命中时嘲笑 | 鸟飞出屏幕 |

---

## 6. 材质系统设计

### 6.1 材质属性

| 材质 | 颜色 | 生命值 | 密度 | 摩擦系数 | 弹性系数 |
| --- | --- | --- | --- | --- | --- |
| 玻璃 | #87CEEB | 1 | 0.5 | 0.3 | 0.1 |
| 木头 | #DEB887 | 2 | 1.0 | 0.5 | 0.2 |
| 石头 | #808080 | 4 | 2.0 | 0.7 | 0.1 |

### 6.2 材质破坏规则

| 碰撞力 | 玻璃 | 木头 | 石头 |
| --- | --- | --- | --- |
| 小（< 50） | 破坏 | 无损 | 无损 |
| 中（50~150） | 破坏 | 破坏 | 无损 |
| 大（> 150） | 破坏 | 破坏 | 破坏 |

### 6.3 建筑结构类型

| 结构 | 说明 | 弱点 |
| --- | --- | --- |
| 塔楼 | 垂直堆叠 | 底部支撑 |
| 桥梁 | 水平连接 | 中间支撑 |
| 堡垒 | 封闭结构 | 入口/窗户 |
| 金字塔 | 三角形堆叠 | 顶部 |
| 混合 | 多种材质组合 | 脆弱材质 |

---

## 7. 物理引擎设计

### 7.1 物理配置

```ts
const PHYSICS_CONFIG = {
  gravity: 400,           // 重力加速度（px/s²）
  friction: 0.5,          // 摩擦系数
  restitution: 0.3,       // 弹性系数
  velocityThreshold: 10,  // 速度阈值（低于此值视为静止）
  sleepTime: 1000,        // 静止判定时间（ms）
  iterations: 10,         // 物理迭代次数
  timestep: 1/60,         // 物理时间步长
};
```

### 7.2 碰撞检测

```ts
// 圆形与矩形碰撞检测
function circleRectCollision(
  circle: { x: number, y: number, radius: number },
  rect: { x: number, y: number, width: number, height: number, rotation: number }
): boolean {
  // 旋转矩形到轴对齐
  const cos = Math.cos(-rect.rotation);
  const sin = Math.sin(-rect.rotation);
  
  const dx = circle.x - (rect.x + rect.width / 2);
  const dy = circle.y - (rect.y + rect.height / 2);
  
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  
  const closestX = Math.max(0, Math.min(rect.width, localX + rect.width / 2));
  const closestY = Math.max(0, Math.min(rect.height, localY + rect.height / 2));
  
  const distanceX = localX + rect.width / 2 - closestX;
  const distanceY = localY + rect.height / 2 - closestY;
  
  return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
}
```

### 7.3 碰撞响应

```ts
// 碰撞响应计算
function resolveCollision(bodyA: PhysicsBody, bodyB: PhysicsBody) {
  const dx = bodyB.x - bodyA.x;
  const dy = bodyB.y - bodyA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return;
  
  // 法线方向
  const nx = dx / distance;
  const ny = dy / distance;
  
  // 相对速度
  const dvx = bodyA.vx - bodyB.vx;
  const dvy = bodyA.vy - bodyB.vy;
  
  // 相对速度在法线方向的分量
  const dvn = dvx * nx + dvy * ny;
  
  // 忽略分离的物体
  if (dvn < 0) return;
  
  // 冲量计算
  const restitution = Math.min(bodyA.restitution, bodyB.restitution);
  const impulse = (1 + restitution) * dvn / (1 / bodyA.mass + 1 / bodyB.mass);
  
  // 应用冲量
  bodyA.vx -= impulse * nx / bodyA.mass;
  bodyA.vy -= impulse * ny / bodyA.mass;
  bodyB.vx += impulse * nx / bodyB.mass;
  bodyB.vy += impulse * ny / bodyB.mass;
}
```

---

## 8. 关卡系统设计

### 8.1 关卡包结构

| 章节 | 关卡数 | 主题 | 难度 | 解锁条件 |
| --- | --- | --- | --- | --- |
| 第一章：初来乍到 | 15 关 | 基础教学 | 简单 | 初始解锁 |
| 第二章：木头森林 | 15 关 | 木头建筑 | 简单 | 通过第一章 |
| 第三章：玻璃城堡 | 15 关 | 玻璃建筑 | 中等 | 通过第二章 |
| 第四章：石头堡垒 | 15 关 | 石头建筑 | 困难 | 通过第三章 |
| 第五章：猪王宫殿 | 18 关 | 混合建筑 + Boss | 极难 | 通过第四章 |

### 8.2 关卡参数表

| 关卡 | 鸟数量 | 猪数量 | 建筑复杂度 | 目标分数 |
| --- | --- | --- | --- | --- |
| 1 | 3 | 1 | 低 | 20000 |
| 10 | 4 | 3 | 中 | 50000 |
| 20 | 5 | 4 | 中 | 80000 |
| 30 | 5 | 5 | 高 | 120000 |
| 50 | 6 | 6 | 高 | 180000 |
| 78 | 6 | 8 | 极高 | 300000 |

### 8.3 关卡评价

| 星级 | 条件 |
| --- | --- |
| ★★★ | 分数 >= 目标分数 × 1.5 |
| ★★ | 分数 >= 目标分数 |
| ★ | 消灭所有猪 |

---

## 9. 数值平衡

### 9.1 分数系统

| 事件 | 分数 |
| --- | --- |
| 消灭小猪 | 5000 |
| 消灭中猪 | 10000 |
| 消灭大猪 | 15000 |
| 消灭头盔猪 | 20000 |
| 消灭猪王 | 50000 |
| 破坏玻璃块 | 500 |
| 破坏木块 | 1000 |
| 破坏石块 | 2000 |
| 剩余鸟（每只） | 10000 |

### 9.2 弹弓参数

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 最大拖拽半径 | 80px | 拖拽距离上限 |
| 角度范围 | -70° ~ +70° | 相对于水平线 |
| 最大发射速度 | 600px/s | 最大拖拽时的速度 |
| 最小发射速度 | 100px/s | 最小拖拽时的速度 |
| 弹弓位置 | (150, 450) | 屏幕左下方 |

### 9.3 物理参数

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 重力 | 400px/s² | 向下加速度 |
| 空气阻力 | 0.01 | 速度衰减系数 |
| 地面摩擦 | 0.5 | 地面滑动摩擦 |
| 碰撞弹性 | 0.3 | 碰撞后速度保留比例 |

---

## 10. 操作流程

### 10.1 鼠标操作

| 操作 | 功能 | 说明 |
| --- | --- | --- |
| 拖拽 | 瞄准 | 拖拽弹弓上的鸟调整角度和力度 |
| 松开 | 发射 | 松开发射小鸟 |
| 点击 | 触发能力 | 飞行中点击触发鸟的特殊能力 |
| 滚轮 | 缩放 | 缩放视图（可选） |

### 10.2 键盘操作

| 按键 | 功能 | 说明 |
| --- | --- | --- |
| 空格 | 发射 | 同鼠标松开 |
| 回车 | 触发能力 | 同鼠标点击 |
| R | 重新开始 | 重新开始当前关卡 |
| P | 暂停 | 暂停/继续游戏 |
| Esc | 返回 | 返回主菜单 |
| ← → | 切换鸟 | 切换下一只鸟（练习模式） |

### 10.3 游戏流程

```
主菜单
  -> 选择章节
  -> 选择关卡
  -> 关卡加载
  -> 拖拽弹弓瞄准
  -> 松开发射
  -> 触发能力（可选）
  -> 等待物理结算
  -> 所有猪消灭 -> 过关 -> 结算
  -> 鸟用完猪还在 -> 失败 -> 重试
```

---

## 11. UI 布局设计

### 11.1 游戏主界面

```
┌─────────────────────────────────────────────┐
│  愤怒的小鸟 - 数据修正器                     │  <- 标题栏
├─────────────────────────────────────────────┤
│  关卡: 15    剩余鸟: 🐦🐦🐦    分数: 12500   │  <- 顶部 HUD
├─────────────────────────────────────────────┤
│                                             │
│  🏗️    🐷    🏗️                            │
│    🏗️  🐷  🏗️                              │  <- 游戏主区域
│      🏗️                                    │     Canvas 渲染
│                    🎯 <- 弹弓                │     800×600px
│                   /                         │
│                  🐦 <- 待发射鸟              │
│                                             │
├─────────────────────────────────────────────┤
│  [下一只: 🐦蓝]  [暂停]  [重新开始]  [菜单]  │  <- 底部控制栏
│  [操作提示] 拖拽瞄准  松开发射  点击触发能力  │
└─────────────────────────────────────────────┘
```

### 11.2 结算界面

```
┌─────────────────────────────────────────────┐
│           关卡完成！                          │
├─────────────────────────────────────────────┤
│                                             │
│              ★★★                            │
│                                             │
│  消灭猪: 5 只                                │
│  破坏建筑: 12 块                             │
│  剩余鸟: 2 只                                │
│  总分: 85000                                 │
│                                             │
│  [下一关]    [重新挑战]    [返回菜单]         │
└─────────────────────────────────────────────┘
```

---

## 12. 美术风格

### 12.1 Excel 伪装风格

| 元素 | Excel 伪装 | 实际含义 |
| --- | --- | --- |
| 背景 | 工作表背景 | 游戏场景 |
| 弹弓 | 单元格边框交叉点 | 发射装置 |
| 鸟 | 数据标记 | 攻击单位 |
| 猪 | 错误标记 | 目标 |
| 建筑 | 合并单元格区域 | 障碍物 |
| 抛物线 | 公式引用线 | 弹道轨迹 |
| 爆炸 | 条件格式高亮 | 范围伤害 |
| 分数 | 单元格数值 | 得分 |

### 12.2 颜色方案

| 元素 | 颜色 | 色值 | 说明 |
| --- | --- | --- | --- |
| 背景 | 浅蓝 | #E8F5E9 | 天空背景 |
| 地面 | 棕色 | #8D6E63 | 地面 |
| 弹弓 | 深棕 | #5D4037 | 弹弓 |
| 红鸟 | 红色 | #FF4444 | 基础鸟 |
| 蓝鸟 | 蓝色 | #4488FF | 分裂鸟 |
| 黄鸟 | 黄色 | #FFCC00 | 加速鸟 |
| 黑鸟 | 黑色 | #333333 | 爆炸鸟 |
| 白鸟 | 白色 | #FFFFFF | 下蛋鸟 |
| 大鸟 | 棕色 | #884400 | 击退鸟 |
| 小猪 | 浅绿 | #81C784 | 基础猪 |
| 玻璃 | 浅蓝 | #87CEEB | 玻璃材质 |
| 木头 | 米色 | #DEB887 | 木头材质 |
| 石头 | 灰色 | #808080 | 石头材质 |

### 12.3 动画效果

| 动画 | 触发条件 | 效果 | 时长 |
| --- | --- | --- | --- |
| 弹弓拉伸 | 拖拽 | 弹弓皮筋拉伸 | 实时 |
| 鸟发射 | 松开 | 鸟从弹弓射出 | 200ms |
| 能力触发 | 点击 | 特殊效果 | 300ms |
| 建筑破坏 | 碰撞 | 建筑碎裂倒塌 | 500ms |
| 猪消灭 | 死亡 | 猪飞走/爆炸 | 400ms |
| 分数飘出 | 得分 | 数字向上飘出 | 1000ms |
| 星星评价 | 过关 | 星星逐个出现 | 1500ms |

---

## 13. 音效设计

### 13.1 音效列表

| 音效 | 触发条件 | 风格 | 时长 |
| --- | --- | --- | --- |
| 弹弓拉伸 | 拖拽 | 皮筋拉伸声 | 实时 |
| 鸟发射 | 松开 | "嗖"声 | 200ms |
| 碰撞 | 撞击建筑/猪 | "砰"声 | 150ms |
| 能力触发 | 点击触发 | 特效音效 | 300ms |
| 建筑破坏 | 建筑倒塌 | 碎裂声 | 500ms |
| 猪消灭 | 猪死亡 | 猪叫声 | 400ms |
| 过关 | 消灭所有猪 | 欢快旋律 | 2000ms |
| 失败 | 鸟用完 | 低沉音效 | 1500ms |

### 13.2 BGM 设计

- 第一章：轻松愉快，BPM 100，教学氛围
- 第二章：轻快节奏，BPM 110，森林氛围
- 第三章：活泼欢快，BPM 120，城堡氛围
- 第四章：紧张严肃，BPM 130，战斗氛围
- 第五章：史诗宏大，BPM 140，Boss 战氛围

---

## 14. 技术难点分析

### 14.1 简易物理引擎

```ts
// 简易 2D 物理引擎
class SimplePhysics {
  private bodies: PhysicsBody[] = [];
  private gravity: number = 400;
  
  addBody(body: PhysicsBody): void {
    this.bodies.push(body);
  }
  
  update(dt: number): void {
    // 应用重力
    for (const body of this.bodies) {
      body.vy += this.gravity * dt;
    }
    
    // 更新位置
    for (const body of this.bodies) {
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      
      // 地面碰撞
      if (body.y > GROUND_Y) {
        body.y = GROUND_Y;
        body.vy *= -body.restitution;
        body.vx *= (1 - body.friction);
      }
    }
    
    // 碰撞检测与响应
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        if (this.checkCollision(this.bodies[i], this.bodies[j])) {
          this.resolveCollision(this.bodies[i], this.bodies[j]);
        }
      }
    }
  }
}
```

### 14.2 弹道预测线

```ts
// 绘制弹道预测线
function drawTrajectory(
  startX: number,
  startY: number,
  vx: number,
  vy: number,
  gravity: number,
  steps: number
): { x: number, y: number }[] {
  const points: { x: number, y: number }[] = [];
  const dt = 0.05;
  
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const x = startX + vx * t;
    const y = startY + vy * t + 0.5 * gravity * t * t;
    
    if (y > GROUND_Y) break;
    
    points.push({ x, y });
  }
  
  return points;
}
```

### 14.3 建筑生成

```ts
// 生成建筑结构
function generateBuilding(
  x: number,
  y: number,
  type: 'tower' | 'bridge' | 'fortress' | 'pyramid',
  material: MaterialKind,
  scale: number = 1
): Block[] {
  const blocks: Block[] = [];
  
  switch (type) {
    case 'tower':
      // 垂直塔楼
      for (let i = 0; i < 3; i++) {
        blocks.push({
          material,
          x: x,
          y: y - i * 40,
          width: 30 * scale,
          height: 10 * scale,
          rotation: 0,
          vx: 0,
          vy: 0,
          angularVelocity: 0,
          hp: getMaterialHp(material),
          maxHp: getMaterialHp(material),
          isDestroyed: false,
        });
      }
      break;
      
    case 'bridge':
      // 水平桥梁
      for (let i = -2; i <= 2; i++) {
        blocks.push({
          material,
          x: x + i * 40,
          y: y,
          width: 30 * scale,
          height: 10 * scale,
          rotation: 0,
          vx: 0,
          vy: 0,
          angularVelocity: 0,
          hp: getMaterialHp(material),
          maxHp: getMaterialHp(material),
          isDestroyed: false,
        });
      }
      break;
  }
  
  return blocks;
}
```

### 14.4 性能优化

- 使用 Canvas 渲染游戏主区域
- 物理引擎使用固定时间步长
- 碰撞检测使用空间分区
- 静止物体进入休眠状态
- 粒子效果使用对象池

---

## 15. 文件结构

```
src/
  modules/
    angrybirds/
      components/
        AngryBirdsGame.tsx       # 游戏主组件
        AngryBirdsHUD.tsx        # HUD 组件
        AngryBirdsMenu.tsx       # 菜单组件
        AngryBirdsSettlement.tsx # 结算组件
      core/
        angryBirdsEngine.ts      # 游戏引擎
        angryBirdsTypes.ts       # 类型定义
        angryBirdsConstants.ts   # 常量配置
        angryBirdsLevels.ts      # 关卡数据
      systems/
        slingshotSystem.ts       # 弹弓系统
        birdSystem.ts            # 鸟类系统
        pigSystem.ts             # 猪系统
        blockSystem.ts           # 建筑系统
        physicsSystem.ts         # 物理系统
        collisionSystem.ts       # 碰撞检测
        effectSystem.ts          # 特效系统
      utils/
        trajectoryCalculator.ts  # 弹道计算
        buildingGenerator.ts     # 建筑生成
        physicsEngine.ts         # 物理引擎
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
import { angryBirdsSheet } from '../modules/angrybirds';

export const sheetRegistry = [
  // ... 其他 sheet
  angryBirdsSheet,
];
```

### 16.2 Arcade Module Registry 注册

```ts
// src/modules/arcade/registry.ts
import { registerAngryBirds } from '../modules/angrybirds';

export function registerAllArcadeModules() {
  // ... 其他模块
  registerAngryBirds();
}
```

### 16.3 模块接口

```ts
// src/modules/angrybirds/index.ts
export const angryBirdsSheet = {
  id: 'angrybirds',
  name: '愤怒的小鸟 - 数据修正器',
  icon: '🐦',
  component: AngryBirdsGame,
  category: 'arcade',
  unlockCondition: null, // 初始解锁
};

export function registerAngryBirds() {
  arcadeModuleRegistry.register({
    id: 'angrybirds',
    sheet: angryBirdsSheet,
    routes: [
      { path: '/angrybirds', component: AngryBirdsGame },
      { path: '/angrybirds/menu', component: AngryBirdsMenu },
      { path: '/angrybirds/settlement', component: AngryBirdsSettlement },
    ],
  });
}
```

---

## 17. 数据存储

### 17.1 本地存储结构

```ts
interface AngryBirdsSaveData {
  unlockedLevels: number[];     // 已解锁关卡
  levelStars: Record<number, number>; // 关卡星级评价
  bestScores: Record<number, number>; // 关卡最高分
  totalGames: number;           // 总游戏次数
  totalWins: number;            // 总胜利次数
  totalPigsDefeated: number;    // 总消灭猪数
  totalBlocksDestroyed: number; // 总破坏建筑数
  lastPlayedAt: string;         // 最后游玩时间
}
```

### 17.2 存储键名

- `angrybirds_save_data`: 主存档数据
- `angrybirds_settings`: 游戏设置（音量等）

### 17.3 数据迁移

- 使用版本号管理存档格式
- 新增字段时提供默认值
- 旧版本存档自动迁移

---

## 18. 测试要点

### 18.1 功能测试

- [ ] 弹弓瞄准和发射正常
- [ ] 抛物线弹道正确
- [ ] 物理碰撞和响应正确
- [ ] 建筑破坏判定准确
- [ ] 猪消灭判定正确
- [ ] 鸟特殊能力生效
- [ ] 关卡结算正常
- [ ] 星级评价正确

### 18.2 边界测试

- [ ] 鸟飞出屏幕后正确销毁
- [ ] 建筑倒塌后正确清理
- [ ] 猪掉出屏幕后判定死亡
- [ ] 物理引擎不崩溃
- [ ] 多鸟同时飞行不冲突
- [ ] 连锁破坏正常触发

### 18.3 性能测试

- [ ] 60 FPS 稳定运行
- [ ] 大量建筑块不卡顿
- [ ] 物理计算不超时
- [ ] 内存无泄漏

---

## 19. 开发计划

### 19.1 阶段划分

| 阶段 | 内容 | 优先级 |
| --- | --- | --- |
| P0 | 核心弹弓发射 + 抛物线弹道 + 基础物理 | 高 |
| P1 | 碰撞检测 + 建筑破坏 + 猪消灭 | 高 |
| P2 | 鸟类特殊能力 + 关卡系统 + 结算 | 中 |
| P3 | UI 美化 + 音效 + 动画效果 | 中 |
| P4 | 多章节关卡 + 挑战模式 + 成就 | 低 |

### 19.2 关键技术点

1. 弹弓瞄准和发射
2. 抛物线弹道计算
3. 2D 物理引擎
4. 碰撞检测和响应
5. 建筑破坏判定

---

## 20. 视觉反馈

### 20.1 发射反馈

| 事件 | 视觉反馈 | 音效 |
| --- | --- | --- |
| 拖拽弹弓 | 力度指示线 | 皮筋拉伸声 |
| 发射 | 鸟射出 + 轨迹线 | "嗖"声 |
| 能力触发 | 特效动画 | 特效音效 |
| 碰撞 | 碰撞火花 | "砰"声 |

### 20.2 破坏反馈

| 事件 | 视觉反馈 |
| --- | --- |
| 玻璃破坏 | 碎裂动画 + 碎片飞溅 |
| 木头破坏 | 断裂动画 + 木屑飞溅 |
| 石头破坏 | 碎裂动画 + 石块飞溅 |
| 猪消灭 | 猪飞走/爆炸 + 分数飘出 |
| 过关 | 星星逐个出现 + 烟花 |

---

## 21. 扩展规划

### 21.1 未来功能

- 关卡编辑器
- 自定义关卡分享
- 每日挑战
- 排行榜系统
- 新鸟种解锁

### 21.2 物理引擎升级

- 考虑集成轻量级 2D 物理引擎（如 matter.js）
- 当前使用自研简易物理引擎，满足基本需求
- 后续可根据需要升级

---

*文档版本：v1.0*
*最后更新：2026-04-14*
*设计者：多智能体团队*
