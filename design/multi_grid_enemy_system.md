# 多格敌人系统设计

> 版本：1.0  
> 最后更新：2026-03-28  
> 状态：设计完成，待实现

---

## 1. 敌人类型设计

### 1.1 人形敌人结构

人形敌人由 5 个部位组成，占据 3x4 网格区域：

```
┌─────────────────────────────────────────┐
│           人形敌人布局图                 │
│                                         │
│     ┌───┬───┬───┐                       │
│     │   │头 │   │  ← Row 0 (头部)        │
│     ├───┼───┼───┤                       │
│     │左 │身 │右 │  ← Row 1 (上身)        │
│     │手 │体 │手 │                       │
│     ├───┼───┼───┤                       │
│     │   │身 │   │  ← Row 2 (下身)        │
│     ├───┼───┼───┤                       │
│     │   │脚 │   │  ← Row 3 (脚部)        │
│     └───┴───┴───┘                       │
│                                         │
│  锚点 (0,0) 位于头部位置                  │
└─────────────────────────────────────────┘
```

### 1.2 部位详细配置

| 部位 | 类型 | HP | 弱点 | 基础分 | 判定优先级 | 大小 |
|------|------|-----|------|--------|-----------|------|
| 头 | `head` | 1 | ✓ 暴击 x2 | 150 | 1 (最高) | 1x1 |
| 身体 | `body` | 3 | ✗ | 100 | 2 | 1x2 |
| 左手 | `leftHand` | 2 | ✗ | 60 | 3 | 1x1 |
| 右手 | `rightHand` | 2 | ✗ | 60 | 3 | 1x1 |
| 脚 | `foot` | 2 | ✗ | 40 | 4 (最低) | 1x1 |

### 1.3 部位状态定义

```typescript
type PartState = 
  | 'normal'     // 正常状态，白色/灰色
  | 'damaged'    // 受损状态，黄色 (HP ≤ 50%)
  | 'critical'   // 危险状态，红色闪烁 (HP = 1)
  | 'destroyed'; // 摧毁状态，灰色半透明 (HP = 0)
```

#### 状态视觉效果

| 状态 | 颜色 | 效果 | 描述 |
|------|------|------|------|
| `normal` | 继承主题色 | 无 | 健康状态 |
| `damaged` | #fbbf24 (琥珀色) | 轻微裂纹 | HP ≤ 50% |
| `critical` | #ef4444 (红色) | 闪烁动画 | HP = 1 |
| `destroyed` | #9ca3af (灰色) | 半透明 50% | 无法再被击中 |

### 1.4 部位破坏效果

当部位被摧毁时，会影响敌人行为：

| 部位 | 破坏效果 |
|------|---------|
| 头 | 敌人立即死亡（爆头） |
| 身体 | 移动速度 -50%，无法探头 |
| 左手 | 无法向左侧移动/探头 |
| 右手 | 无法向右侧移动/探头 |
| 脚 | 移动速度 -30%，无法切换移动模式 |

```typescript
interface PartDestructionEffects {
  head: { instantDeath: true };
  body: { moveSpeedMultiplier: 0.5, canPeek: false };
  leftHand: { canMoveLeft: false, canPeekLeft: false };
  rightHand: { canMoveRight: false, canPeekRight: false };
  foot: { moveSpeedMultiplier: 0.7, canChangePattern: false };
}
```

### 1.5 部位判定优先级

当多个部位在同一位置时（理论上不应发生），按优先级判定：

```typescript
const PART_HIT_PRIORITY: Record<PartType, number> = {
  head: 1,        // 最高优先级
  body: 2,
  leftHand: 3,
  rightHand: 3,
  foot: 4,        // 最低优先级
};

// 判定逻辑
function resolveHit(parts: EnemyPart[], row: number, col: number): EnemyPart | null {
  const overlappingParts = parts.filter(p => 
    getPartPosition(p) === { row, col } && p.state !== 'destroyed'
  );
  
  if (overlappingParts.length === 0) return null;
  
  // 返回优先级最高的部位
  return overlappingParts.sort((a, b) => 
    PART_HIT_PRIORITY[a.type] - PART_HIT_PRIORITY[b.type]
  )[0];
}
```

---

## 2. 移动系统设计

### 2.1 六种移动模式

| 模式 | 描述 | 适用场景 | 难度 |
|------|------|----------|------|
| `static` | 静止不动 | 新手训练、精准射击 | ★☆☆ |
| `linear` | 直线水平移动 | 基础跟枪 | ★★☆ |
| `sine` | 正弦波曲线 | 不规则移动目标 | ★★★ |
| `bounce` | 弹跳移动 | 上下起伏目标 | ★★★ |
| `random` | 随机游走 | 高级训练 | ★★★★ |
| `zigzag` | 之字形移动 | 专业训练 | ★★★★★ |

### 2.2 移动模式算法伪代码

#### 2.2.1 Static（静止）

```typescript
function updateStatic(enemy: Enemy, deltaTime: number): Position {
  // 不移动，保持锚点位置
  return enemy.anchorPosition;
}
```

#### 2.2.2 Linear（直线）

```typescript
function updateLinear(enemy: Enemy, deltaTime: number): Position {
  const speed = enemy.moveSpeed; // 格/秒
  const direction = enemy.direction; // 'left' | 'right'
  
  // 计算新位置
  let newCol = enemy.anchorCol + (direction === 'right' ? 1 : -1) * speed * deltaTime;
  
  // 边界检测
  if (newCol < MIN_COL) {
    newCol = MIN_COL;
    enemy.direction = 'right';
  } else if (newCol > MAX_COL) {
    newCol = MAX_COL;
    enemy.direction = 'left';
  }
  
  return { row: enemy.anchorRow, col: newCol };
}
```

#### 2.2.3 Sine（正弦波）

```typescript
function updateSine(enemy: Enemy, deltaTime: number): Position {
  const speed = enemy.moveSpeed;
  const frequency = enemy.frequency ?? 1.0; // Hz
  const amplitude = enemy.amplitude ?? 2.0; // 格
  
  enemy.moveProgress += deltaTime * frequency;
  
  // 水平移动
  let newCol = enemy.startCol + speed * enemy.moveProgress;
  
  // 垂直波动（正弦）
  const rowOffset = Math.sin(enemy.moveProgress * Math.PI * 2) * amplitude;
  const newRow = enemy.startRow + rowOffset;
  
  // 边界检测（水平）
  if (newCol < MIN_COL || newCol > MAX_COL) {
    enemy.speed *= -1; // 反转方向
  }
  
  // 边界检测（垂直）
  const clampedRow = clamp(newRow, MIN_ROW, MAX_ROW);
  
  return { row: clampedRow, col: clamp(newCol, MIN_COL, MAX_COL) };
}
```

#### 2.2.4 Bounce（弹跳）

```typescript
function updateBounce(enemy: Enemy, deltaTime: number): Position {
  const speed = enemy.moveSpeed;
  const frequency = enemy.frequency ?? 1.5; // Hz
  const amplitude = enemy.amplitude ?? 1.5; // 格
  
  enemy.moveProgress += deltaTime * frequency;
  
  // 水平移动
  let newCol = enemy.startCol + speed * enemy.moveProgress;
  
  // 垂直弹跳（绝对值正弦，只在上半部分）
  const rowOffset = Math.abs(Math.sin(enemy.moveProgress * Math.PI * 2)) * amplitude;
  const newRow = enemy.baseRow - rowOffset; // 向上弹跳
  
  // 边界检测
  if (newCol < MIN_COL || newCol > MAX_COL) {
    enemy.speed *= -1;
  }
  
  return { 
    row: clamp(newRow, MIN_ROW, MAX_ROW), 
    col: clamp(newCol, MIN_COL, MAX_COL) 
  };
}
```

#### 2.2.5 Random（随机游走）

```typescript
function updateRandom(enemy: Enemy, deltaTime: number): Position {
  // 每 2 秒改变一次方向
  enemy.changeDirectionTimer += deltaTime;
  
  if (enemy.changeDirectionTimer >= 2.0) {
    enemy.changeDirectionTimer = 0;
    
    // 随机选择新方向
    const directions = ['up', 'down', 'left', 'right'];
    enemy.direction = directions[Math.floor(Math.random() * directions.length)];
  }
  
  // 根据当前方向移动
  const speed = enemy.moveSpeed * deltaTime;
  let { row, col } = enemy.anchorPosition;
  
  switch (enemy.direction) {
    case 'up': row -= speed; break;
    case 'down': row += speed; break;
    case 'left': col -= speed; break;
    case 'right': col += speed; break;
  }
  
  // 边界反弹
  if (row < MIN_ROW) { row = MIN_ROW; enemy.direction = 'down'; }
  if (row > MAX_ROW) { row = MAX_ROW; enemy.direction = 'up'; }
  if (col < MIN_COL) { col = MIN_COL; enemy.direction = 'right'; }
  if (col > MAX_COL) { col = MAX_COL; enemy.direction = 'left'; }
  
  return { row, col };
}
```

#### 2.2.6 Zigzag（之字形）

```typescript
function updateZigzag(enemy: Enemy, deltaTime: number): Position {
  const speed = enemy.moveSpeed;
  const zigzagWidth = enemy.zigzagWidth ?? 3; // 格
  const zigzagFrequency = enemy.zigzagFrequency ?? 0.5; // Hz
  
  enemy.moveProgress += deltaTime;
  
  // 主方向移动（假设向下）
  const newRow = enemy.startRow + speed * enemy.moveProgress;
  
  // 之字形水平偏移
  const zigzagPhase = enemy.moveProgress * zigzagFrequency * Math.PI * 2;
  const colOffset = Math.sin(zigzagPhase) * zigzagWidth;
  const newCol = enemy.startCol + colOffset;
  
  return { 
    row: clamp(newRow, MIN_ROW, MAX_ROW), 
    col: clamp(newCol, MIN_COL, MAX_COL) 
  };
}
```

### 2.3 速度等级配置

| 等级 | 速度 (格/秒) | 像素/秒 | 适用难度 |
|------|-------------|---------|----------|
| `slow` | 0.5 | 32 | Easy |
| `normal` | 1.0 | 64 | Normal |
| `fast` | 2.0 | 128 | Hard |
| `extreme` | 3.0 | 192 | Expert |

### 2.4 边界处理

```typescript
const BOUNDS = {
  MIN_ROW: 5,    // 第 6 行（避开 Excel 标题）
  MAX_ROW: 45,   // 第 46 行（避开底部状态栏）
  MIN_COL: 2,    // C 列（避开行号）
  MAX_COL: 28,   // AD 列（避开右侧滚动条）
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function handleBoundaryCollision(enemy: Enemy, bounds: Bounds): Enemy {
  const updated = { ...enemy };
  
  if (updated.anchorRow < bounds.MIN_ROW) {
    updated.anchorRow = bounds.MIN_ROW;
    if (updated.movePattern === 'linear' || updated.movePattern === 'random') {
      updated.direction = updated.direction === 'up' ? 'down' : updated.direction;
    }
  }
  
  if (updated.anchorRow > bounds.MAX_ROW) {
    updated.anchorRow = bounds.MAX_ROW;
    if (updated.movePattern === 'linear' || updated.movePattern === 'random') {
      updated.direction = updated.direction === 'down' ? 'up' : updated.direction;
    }
  }
  
  if (updated.anchorCol < bounds.MIN_COL) {
    updated.anchorCol = bounds.MIN_COL;
    if (updated.movePattern === 'linear' || updated.movePattern === 'random') {
      updated.direction = updated.direction === 'left' ? 'right' : updated.direction;
    }
  }
  
  if (updated.anchorCol > bounds.MAX_COL) {
    updated.anchorCol = bounds.MAX_COL;
    if (updated.movePattern === 'linear' || updated.movePattern === 'random') {
      updated.direction = updated.direction === 'right' ? 'left' : updated.direction;
    }
  }
  
  return updated;
}
```

---

## 3. 探头系统设计

### 3.1 探头状态机

```
┌─────────────────────────────────────────────────────────────┐
│                    探头状态机                               │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │              │
     │   hidden     │◀────────────────────────────┐
     │   (隐藏)     │                              │
     │              │                              │
     └──────┬───────┘                              │
            │ 等待 2 秒                              │
            ▼                                      │
     ┌──────────────┐                              │
     │              │                              │
     │   peeking    │  动画 200ms                  │
     │   (探头中)   │──────────────┐               │
     │              │              │               │
     └──────┬───────┘              │               │
            │ 动画完成              │               │
            ▼                      │               │
     ┌──────────────┐              │               │
     │              │              │               │
     │   visible    │◀─────────────┤  被击中       │
     │   (可见)     │              │  或超时       │
     │              │              │               │
     └──────┬───────┘              │               │
            │ 停留 0.3-2 秒          │               │
            ▼                      │               │
     ┌──────────────┐              │               │
     │              │              │               │
     │   returning  │  动画 200ms  │               │
     │   (缩回中)   │──────────────┘               │
     │              │                              │
     └──────┬───────┘                              │
            │ 动画完成                              │
            └──────────────────────────────────────┘
```

### 3.2 状态详细定义

```typescript
type PeekState = 
  | 'hidden'    // 完全隐藏，不可见，不可被击中
  | 'peeking'   // 正在探出，部分可见，不可被击中
  | 'visible'   // 完全可见，可被击中
  | 'returning'; // 正在缩回，部分可见，不可被击中

interface PeekConfig {
  state: PeekState;
  direction: 'left' | 'right' | 'up' | 'down';
  progress: number;      // 0-1，动画进度
  timer: number;         // 当前状态计时器 (ms)
  waitTime: number;      // 隐藏等待时间 (ms)
  animDuration: number;  // 动画时长 (ms)
  visibleTime: number;   // 完全可见停留时间 (ms)
}
```

### 3.3 探头动画曲线（缓入缓出）

使用 cubic bezier 缓入缓出曲线：

```typescript
// ease-in-out 曲线：f(t) = 3t² - 2t³
function easeInOut(t: number): number {
  return 3 * t * t - 2 * t * t * t;
}

// 或者使用更平滑的曲线：f(t) = sin(t * π/2)
function easeInOutSin(t: number): number {
  return Math.sin(t * Math.PI / 2);
}

// 计算探头位置
function calculatePeekPosition(
  coverPosition: Position,
  direction: PeekDirection,
  peekDistance: number,
  progress: number
): Position {
  const easedProgress = easeInOut(progress);
  
  switch (direction) {
    case 'left':
      return {
        row: coverPosition.row,
        col: coverPosition.col - peekDistance * (1 - easedProgress),
      };
    case 'right':
      return {
        row: coverPosition.row,
        col: coverPosition.col + peekDistance * (1 - easedProgress),
      };
    case 'up':
      return {
        row: coverPosition.row - peekDistance * (1 - easedProgress),
        col: coverPosition.col,
      };
    case 'down':
      return {
        row: coverPosition.row + peekDistance * (1 - easedProgress),
        col: coverPosition.col,
      };
  }
}
```

### 3.4 探头时间配置

| 难度 | 隐藏等待 | 动画时长 | 可见停留 | 总周期 |
|------|---------|---------|---------|--------|
| Easy | 2000ms | 200ms | 2000ms | ~4.4s |
| Normal | 1500ms | 150ms | 1200ms | ~3.0s |
| Hard | 1000ms | 100ms | 600ms | ~1.8s |
| Expert | 500ms | 80ms | 300ms | ~1.0s |

### 3.5 探头状态更新逻辑

```typescript
function updatePeekState(enemy: Enemy, deltaTime: number): Enemy {
  const updated = { ...enemy };
  const timer = (enemy.peekTimer ?? 0) + deltaTime * 1000;
  
  switch (enemy.peekState) {
    case 'hidden': {
      const waitTime = getWaitTimeByDifficulty(enemy.difficulty);
      if (timer >= waitTime) {
        return {
          ...updated,
          peekState: 'peeking',
          peekTimer: 0,
          peekProgress: 0,
        };
      }
      return { ...updated, peekTimer: timer };
    }
    
    case 'peeking': {
      const animDuration = getAnimDurationByDifficulty(enemy.difficulty);
      const progress = Math.min(1, timer / animDuration);
      
      if (progress >= 1) {
        return {
          ...updated,
          peekState: 'visible',
          peekTimer: 0,
          peekProgress: 1,
        };
      }
      return { ...updated, peekTimer: timer, peekProgress: progress };
    }
    
    case 'visible': {
      const visibleTime = getVisibleTimeByDifficulty(enemy.difficulty);
      
      // 检查是否被击中（由外部处理）
      if (enemy.wasHit) {
        return {
          ...updated,
          peekState: 'returning',
          peekTimer: 0,
          peekProgress: 1,
        };
      }
      
      if (timer >= visibleTime) {
        return {
          ...updated,
          peekState: 'returning',
          peekTimer: 0,
          peekProgress: 1,
        };
      }
      return { ...updated, peekTimer: timer };
    }
    
    case 'returning': {
      const animDuration = getAnimDurationByDifficulty(enemy.difficulty);
      const progress = Math.max(0, 1 - timer / animDuration);
      
      if (progress <= 0) {
        return {
          ...updated,
          peekState: 'hidden',
          peekTimer: 0,
          peekProgress: 0,
          peekDirection: getRandomDirection(), // 随机新方向
        };
      }
      return { ...updated, peekTimer: timer, peekProgress: progress };
    }
    
    default:
      return updated;
  }
}
```

---

## 4. 优先级系统

### 4.1 四级优先级定义

| 优先级 | 类型 | 颜色 | 图标 | 时间限制 | 基础分 | 出现权重 |
|--------|------|------|------|---------|--------|---------|
| `critical` | 紧急 | #dc2626 | 🔴 | 1500ms | 200 | 10% |
| `high` | 高 | #f97316 | 🟠 | 2500ms | 150 | 20% |
| `medium` | 中 | #eab308 | 🟡 | 4000ms | 100 | 35% |
| `low` | 低 | #22c55e | 🟢 | 6000ms | 50 | 35% |

### 4.2 优先级图标和颜色

```typescript
interface PriorityConfig {
  color: string;
  icon: string;
  timeLimit: number; // ms
  baseScore: number;
  weight: number; // 生成权重
  glowEffect: boolean;
}

const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  critical: {
    color: '#dc2626',
    icon: '🔴',
    timeLimit: 1500,
    baseScore: 200,
    weight: 10,
    glowEffect: true, // 红色脉冲光晕
  },
  high: {
    color: '#f97316',
    icon: '🟠',
    timeLimit: 2500,
    baseScore: 150,
    weight: 20,
    glowEffect: false,
  },
  medium: {
    color: '#eab308',
    icon: '🟡',
    timeLimit: 4000,
    baseScore: 100,
    weight: 35,
    glowEffect: false,
  },
  low: {
    color: '#22c55e',
    icon: '🟢',
    timeLimit: 6000,
    baseScore: 50,
    weight: 35,
    glowEffect: false,
  },
};
```

### 4.3 优先级视觉效果

```typescript
// 优先级指示器渲染
function renderPriorityIndicator(priority: Priority): JSX.Element {
  const config = PRIORITY_CONFIG[priority];
  
  return (
    <div className="priority-indicator" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 6px',
      background: config.color + '20', // 20% 透明度
      border: `1px solid ${config.color}`,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
      animation: config.glowEffect ? 'pulse 1s infinite' : 'none',
    }}>
      <span>{config.icon}</span>
      <span style={{ color: config.color }}>
        {priority.toUpperCase()}
      </span>
    </div>
  );
}

// CSS 脉冲动画
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 4px rgba(220, 38, 38, 0.5);
  }
  50% {
    box-shadow: 0 0 12px rgba(220, 38, 38, 0.8);
  }
}
```

### 4.4 时间限制机制

#### 倒计时显示

```typescript
interface TimeLimitDisplay {
  visible: boolean;
  remaining: number; // ms
  warning: boolean;  // 是否进入警告状态 (<30%)
  expired: boolean;  // 是否已超时
}

function updateTimeLimit(enemy: Enemy, deltaTime: number): TimeLimitDisplay {
  if (!enemy.timeLimit) {
    return { visible: false, remaining: 0, warning: false, expired: false };
  }
  
  const elapsed = Date.now() - (enemy.spawnTime ?? Date.now());
  const remaining = Math.max(0, enemy.timeLimit - elapsed);
  const percentage = remaining / enemy.timeLimit;
  
  return {
    visible: true,
    remaining,
    warning: percentage < 0.3,
    expired: remaining === 0,
  };
}
```

#### 超时惩罚

```typescript
function handleTimeLimitExpiration(enemy: Enemy): Penalty {
  switch (enemy.priority) {
    case 'critical':
      return {
        type: 'severe',
        scorePenalty: 100,
        comboReset: true,
        message: '❌ 紧急目标超时！',
      };
    case 'high':
      return {
        type: 'moderate',
        scorePenalty: 50,
        comboReset: false,
        message: '⚠️ 高优先级目标消失',
      };
    case 'medium':
      return {
        type: 'minor',
        scorePenalty: 20,
        comboReset: false,
        message: '目标消失',
      };
    case 'low':
      return {
        type: 'none',
        scorePenalty: 0,
        comboReset: false,
        message: '',
      };
  }
}
```

### 4.5 优先级生成权重

```typescript
function generatePriority(difficulty: string): Priority {
  const weights = getWeightsByDifficulty(difficulty);
  
  const total = weights.critical + weights.high + weights.medium + weights.low;
  const random = Math.random() * total;
  
  let cumulative = 0;
  cumulative += weights.critical;
  if (random < cumulative) return 'critical';
  
  cumulative += weights.high;
  if (random < cumulative) return 'high';
  
  cumulative += weights.medium;
  if (random < cumulative) return 'medium';
  
  return 'low';
}

function getWeightsByDifficulty(difficulty: string): Record<Priority, number> {
  switch (difficulty) {
    case 'easy':
      return { critical: 5, high: 15, medium: 40, low: 40 };
    case 'normal':
      return { critical: 10, high: 20, medium: 35, low: 35 };
    case 'hard':
      return { critical: 15, high: 25, medium: 30, low: 30 };
    case 'expert':
      return { critical: 20, high: 30, medium: 25, low: 25 };
    default:
      return { critical: 10, high: 20, medium: 35, low: 35 };
  }
}
```

---

## 5. 数据结构总览

### 5.1 完整敌人接口

```typescript
interface MultiGridEnemy {
  // 基础标识
  id: string;
  anchorRow: number;
  anchorCol: number;
  
  // 部位系统
  parts: EnemyPart[];
  isAlive: boolean;
  state: EnemyState;
  
  // 移动系统
  movePattern?: MovePattern;
  moveProgress?: number;
  moveDirection?: 'left' | 'right' | 'up' | 'down';
  moveSpeed?: number;
  
  // 探头系统
  peekState?: PeekState;
  peekDirection?: PeekDirection;
  peekProgress?: number;
  peekTimer?: number;
  peekDuration?: number;
  
  // 优先级系统
  priority?: Priority;
  spawnTime?: number;
  timeLimit?: number;
  
  // 统计
  createdAt: number;
  expiresAt?: number;
  totalDamageDealt: number;
  partsDestroyed: number;
}
```

### 5.2 部位接口

```typescript
interface EnemyPart {
  type: PartType;           // 'head' | 'body' | 'leftHand' | 'rightHand' | 'foot'
  maxHp: number;
  currentHp: number;
  state: PartState;         // 'normal' | 'damaged' | 'critical' | 'destroyed'
  relativeRow: number;      // 相对于锚点的行偏移
  relativeCol: number;      // 相对于锚点的列偏移
}
```

---

## 6. 附录：配置常量总表

### 6.1 部位常量

```typescript
const PART_MAX_HP: Record<PartType, number> = {
  head: 1,
  body: 3,
  leftHand: 2,
  rightHand: 2,
  foot: 2,
};

const PART_SCORES: Record<PartType, number> = {
  head: 150,
  body: 100,
  leftHand: 60,
  rightHand: 60,
  foot: 40,
};

const HUMANOID_PART_POSITIONS = [
  { part: 'head', relativeRow: 0, relativeCol: 0 },
  { part: 'leftHand', relativeRow: 1, relativeCol: -1 },
  { part: 'body', relativeRow: 1, relativeCol: 0 },
  { part: 'rightHand', relativeRow: 1, relativeCol: 1 },
  { part: 'body', relativeRow: 2, relativeCol: 0 },
  { part: 'foot', relativeRow: 3, relativeCol: 0 },
];
```

### 6.2 移动常量

```typescript
const MOVE_SPEED_LEVELS = {
  slow: 0.5,
  normal: 1.0,
  fast: 2.0,
  extreme: 3.0,
};

const MOVE_BOUNDS = {
  MIN_ROW: 5,
  MAX_ROW: 45,
  MIN_COL: 2,
  MAX_COL: 28,
};
```

### 6.3 探头常量

```typescript
const PEEK_DURATION_LEVELS = {
  long: 2000,
  normal: 1200,
  short: 600,
  blink: 300,
};

const PEEK_ANIM_DURATION = 200; // ms
const PEEK_HIDDEN_WAIT = 2000;  // ms
```

### 6.4 优先级常量

```typescript
const PRIORITY_CONFIG = {
  critical: { color: '#dc2626', icon: '🔴', timeLimit: 1500 },
  high: { color: '#f97316', icon: '🟠', timeLimit: 2500 },
  medium: { color: '#eab308', icon: '🟡', timeLimit: 4000 },
  low: { color: '#22c55e', icon: '🟢', timeLimit: 6000 },
};
```

---

*文档结束*
