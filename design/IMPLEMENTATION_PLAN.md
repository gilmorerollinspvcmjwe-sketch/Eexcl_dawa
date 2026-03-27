# Excel Aim Trainer 详细实现计划

> 版本：v1.0  
> 创建日期：2026-03-27  
> 基于文档：`level_generator_and_modes.md`, `optimization_proposals.md`

---

## 目录

1. [当前项目状态](#1-当前项目状态)
2. [功能模块拆分](#2-功能模块拆分)
3. [技术实现方案](#3-技术实现方案)
4. [开发优先级与排期](#4-开发优先级与排期)
5. [代码实现规范](#5-代码实现规范)
6. [与现有代码对接点](#6-与现有代码对接点)

---

## 1. 当前项目状态

### 1.1 已完成功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 基础框架 | ✅ 完成 | Sheet1 游戏区、Sheet2 设置、Sheet3 统计 |
| 准星系统 | ✅ 完成 | 隐藏鼠标 + SVG 跟随，支持多种准星样式 |
| 目标系统 | ⚠️ 部分 | 仅支持 head/body/feet 三种类型 |
| 游戏模式 | ⚠️ 部分 | timed/endless/zen/headshot 四种模式 |
| 难度系统 | ⚠️ 部分 | 仅 easy/normal/hard/expert 四档 |
| 统计系统 | ✅ 完成 | 本地存储、历史记录、模式统计 |

### 1.2 待开发功能

| 模块 | 优先级 | 预计工时 |
|------|--------|----------|
| 单格敌人系统（五部位） | P0 | 2天 |
| 关卡系统（1-12级） | P1 | 3天 |
| 目标移动系统 | P2 | 4天 |
| 特殊模式 | P1-P2 | 5天 |
| 技能系统 | P3 | 3天 |
| 经济系统 | P3 | 2天 |

---

## 2. 功能模块拆分

### 2.1 模块总览

```
┌─────────────────────────────────────────────────────────────────┐
│                     Excel Aim Trainer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  单格敌人系统  │  │   关卡系统    │  │ 目标移动系统  │         │
│  │   (Enemy)    │  │   (Level)    │  │ (Movement)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   特殊模式    │  │   技能系统    │  │   经济系统    │         │
│  │   (Modes)    │  │   (Skills)   │  │ (Economy)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    核心游戏循环 (GameLoop)                 │  │
│  │              requestAnimationFrame 统一渲染               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 模块依赖关系

```
                    ┌─────────────┐
                    │  经济系统   │
                    │  (P3)      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  技能系统   │
                    │  (P3)      │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
  │  特殊模式   │   │   关卡系统   │   │ 目标移动系统 │
  │  (P1-P2)   │   │   (P1)      │   │   (P2)      │
  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │ 单格敌人系统 │
                    │   (P0)      │
                    └─────────────┘
```

---

## 3. 技术实现方案

### 3.1 单格敌人系统 (P0)

#### 3.1.1 数据结构定义

```typescript
// types/enemy.ts

// 五种部位类型（扩展自原有的 head/body/feet）
export type BodyPartType = 
  | 'head'       // 头部 - 最高分值
  | 'body'       // 身体 - 中等分值
  | 'leftHand'   // 左手 - 较低分值
  | 'rightHand'  // 右手 - 较低分值
  | 'foot';      // 脚部 - 最低分值

// 部位权重配置
export interface PartWeights {
  head: number;
  body: number;
  leftHand: number;
  rightHand: number;
  foot: number;
}

// 单格敌人（替代原有 Target）
export interface SingleCellEnemy {
  id: string;
  position: {
    row: number;
    col: number;
  };
  bodyPart: BodyPartType;      // 显示的部位类型
  spawnTime: number;           // 出现时间戳
  duration: number;            // 存活时长(ms)
  expiresAt: number;           // 过期时间戳
  isHit: boolean;              // 是否被命中
  
  // 移动相关（P2 阶段）
  movement?: MovementConfig;
  currentPosition?: { row: number; col: number }; // 实际位置（可含小数）
}

// 命中结果
export interface HitResult {
  hit: boolean;
  score: number;
  bodyPart: BodyPartType | null;
  isHeadshot: boolean;
  isBodyshot: boolean;
  isLimbShot: boolean;
  reason?: 'miss' | 'expired' | 'wrong_order';
}
```

#### 3.1.2 部位分值映射

```typescript
// constants/scoring.ts

export const BODY_PART_SCORES: Record<BodyPartType, number> = {
  head: 150,
  body: 100,
  leftHand: 60,
  rightHand: 60,
  foot: 40,
};

export const BODY_PART_WEIGHTS: Record<BodyPartType, number> = {
  head: 3.0,
  body: 2.0,
  leftHand: 1.2,
  rightHand: 1.2,
  foot: 0.8,
};
```

#### 3.1.3 核心算法

```typescript
// utils/enemyGenerator.ts

export class EnemyGenerator {
  // 默认部位权重
  private static BASE_WEIGHTS: PartWeights = {
    head: 15,
    body: 35,
    leftHand: 18,
    rightHand: 18,
    foot: 14,
  };

  // 根据难度调整权重
  static getWeightsForDifficulty(difficulty: number): PartWeights {
    const weights = { ...this.BASE_WEIGHTS };
    
    // 难度越高，头部比例越高
    if (difficulty >= 7) {
      weights.head = Math.min(30, weights.head + (difficulty - 6) * 3);
      weights.foot = Math.max(5, weights.foot - (difficulty - 6) * 2);
    }
    
    return this.normalizeWeights(weights);
  }

  // 权重标准化
  private static normalizeWeights(weights: PartWeights): PartWeights {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    return {
      head: Math.round((weights.head / total) * 100),
      body: Math.round((weights.body / total) * 100),
      leftHand: Math.round((weights.leftHand / total) * 100),
      rightHand: Math.round((weights.rightHand / total) * 100),
      foot: Math.round((weights.foot / total) * 100),
    };
  }

  // 加权随机选择部位
  static weightedRandomSelect(weights: PartWeights): BodyPartType {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    const entries: [BodyPartType, number][] = [
      ['head', weights.head],
      ['body', weights.body],
      ['leftHand', weights.leftHand],
      ['rightHand', weights.rightHand],
      ['foot', weights.foot],
    ];
    
    for (const [part, weight] of entries) {
      cumulative += weight;
      if (rand < cumulative) return part;
    }
    
    return 'body'; // fallback
  }

  // 生成单个敌人
  static generateEnemy(
    gridRows: number,
    gridCols: number,
    difficulty: number,
    occupiedCells: Set<string>,
    levelConfig?: LevelConfig
  ): SingleCellEnemy | null {
    const availableCells = this.findAvailableCells(gridRows, gridCols, occupiedCells);
    if (availableCells.length === 0) return null;
    
    const { row, col } = availableCells[Math.floor(Math.random() * availableCells.length)];
    const weights = levelConfig?.partWeights ?? this.getWeightsForDifficulty(difficulty);
    const bodyPart = this.weightedRandomSelect(weights);
    const duration = this.getDuration(difficulty, levelConfig);
    
    return {
      id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      position: { row, col },
      bodyPart,
      spawnTime: Date.now(),
      duration,
      expiresAt: Date.now() + duration,
      isHit: false,
    };
  }

  // 计算存活时长
  private static getDuration(difficulty: number, levelConfig?: LevelConfig): number {
    if (levelConfig?.targetConfig?.duration) {
      const [min, max] = levelConfig.targetConfig.duration;
      return (min + Math.random() * (max - min)) * 1000;
    }
    
    const baseDuration = 2500;
    const difficultyReduction = Math.max(500, difficulty * 150);
    return baseDuration - difficultyReduction + Math.random() * 500;
  }
}
```

#### 3.1.4 命中判定逻辑

```typescript
// utils/hitDetection.ts

export function processHit(
  clickRow: number,
  clickCol: number,
  enemies: SingleCellEnemy[]
): HitResult {
  const hitEnemy = enemies.find(
    e => e.position.row === clickRow &&
         e.position.col === clickCol &&
         !e.isHit
  );
  
  if (!hitEnemy) {
    return {
      hit: false,
      score: 0,
      bodyPart: null,
      isHeadshot: false,
      isBodyshot: false,
      isLimbShot: false,
      reason: 'miss',
    };
  }
  
  hitEnemy.isHit = true;
  
  const baseScore = BODY_PART_SCORES[hitEnemy.bodyPart];
  
  return {
    hit: true,
    score: baseScore,
    bodyPart: hitEnemy.bodyPart,
    isHeadshot: hitEnemy.bodyPart === 'head',
    isBodyshot: hitEnemy.bodyPart === 'body',
    isLimbShot: ['leftHand', 'rightHand', 'foot'].includes(hitEnemy.bodyPart),
  };
}
```

#### 3.1.5 与现有代码集成点

| 现有代码 | 修改内容 |
|----------|----------|
| `types.ts` | 扩展 `TargetType` 为 `BodyPartType`，新增五种部位 |
| `useGameLogic.ts` | 替换 `spawnTarget` 为 `EnemyGenerator.generateEnemy` |
| `ExcelGrid.tsx` | 新增 `leftHand`、`rightHand` 渲染样式 |
| `SettingsPanel.tsx` | 新增部位权重配置 UI（高级设置） |

---

### 3.2 关卡系统 (P1)

#### 3.2.1 数据结构定义

```typescript
// types/level.ts

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type LevelMechanic = 
  | 'static'       // 静态目标
  | 'moving'       // 移动目标
  | 'peek'         // 拐角射击
  | 'obstacle'     // 障碍物
  | 'multi-target' // 多目标切换
  | 'reaction'     // 反应训练
  | 'precision';   // 精准训练

export interface LevelConditions {
  minScore: number;
  minAccuracy: number;   // 百分比
  minCombo: number;
  maxTime: number;       // 秒
}

export interface TargetConfig {
  types: BodyPartType[];
  maxCount: number;
  spawnInterval: [number, number]; // 秒
  duration: [number, number];       // 秒
}

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  
  conditions: LevelConditions;
  targetConfig: TargetConfig;
  partWeights: PartWeights;
  mechanics: LevelMechanic[];
  
  excelConfig: {
    sheetName: string;
    headerRow: number;
    dataRange: string;
  };
  
  // 解锁条件
  unlockCondition?: {
    prerequisite?: string; // 前置关卡 ID
    credits?: number;      // 需要 Credits
  };
}

// 关卡进度
export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestScore: number;
  bestAccuracy: number;
  stars: 0 | 1 | 2 | 3;  // 评价星级
}
```

#### 3.2.2 关卡生成器

```typescript
// utils/levelGenerator.ts

export class LevelGenerator {
  static generate(difficulty: DifficultyLevel): Level {
    const config = DIFFICULTY_PRESETS[difficulty];
    
    return {
      id: `LVL-${String(difficulty).padStart(3, '0')}`,
      name: config.name,
      description: config.description,
      difficulty,
      conditions: {
        minScore: config.baseScore * DIFFICULTY_MULTIPLIER[difficulty],
        minAccuracy: config.baseAccuracy,
        minCombo: config.baseCombo,
        maxTime: config.timeLimit,
      },
      targetConfig: {
        types: this.selectTargetTypes(difficulty),
        maxCount: config.maxTargets,
        spawnInterval: config.spawnInterval,
        duration: config.duration,
      },
      partWeights: EnemyGenerator.getWeightsForDifficulty(difficulty),
      mechanics: this.selectMechanics(difficulty),
      excelConfig: this.generateExcelConfig(difficulty),
    };
  }

  private static selectMechanics(difficulty: number): LevelMechanic[] {
    if (difficulty <= 4) return ['static'];
    if (difficulty <= 6) return ['static', 'moving'];
    if (difficulty <= 8) return ['moving', 'peek'];
    if (difficulty <= 10) return ['moving', 'peek', 'obstacle'];
    return ['moving', 'peek', 'obstacle', 'multi-target'];
  }
}

// 难度预设配置
export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyPreset> = {
  1:  { name: '新手入门', maxTargets: 1, spawnInterval: [2.5, 3.5], duration: [2.5, 3], baseScore: 500, ... },
  2:  { name: '基础命中', maxTargets: 1, spawnInterval: [2.0, 3.0], duration: [2.0, 2.5], baseScore: 600, ... },
  // ... 3-12
};
```

#### 3.2.3 预设关卡库

```typescript
// constants/levels.ts

export const PRESET_LEVELS: Level[] = [
  {
    id: 'LVL-001',
    name: '新手入门',
    description: '身体/四肢为主，熟悉操作',
    difficulty: 1,
    conditions: { minScore: 500, minAccuracy: 50, minCombo: 3, maxTime: 60 },
    targetConfig: {
      types: ['body', 'leftHand', 'rightHand', 'foot'],
      maxCount: 1,
      spawnInterval: [2.5, 3.5],
      duration: [2.5, 3],
    },
    partWeights: { head: 0, body: 40, leftHand: 20, rightHand: 20, foot: 20 },
    mechanics: ['static'],
    excelConfig: { sheetName: '新手训练', headerRow: 1, dataRange: 'A1:AD50' },
  },
  // ... LVL-002 到 LVL-012
];
```

#### 3.2.4 与现有代码集成点

| 现有代码 | 修改内容 |
|----------|----------|
| `types.ts` | 新增 `Level`、`DifficultyLevel` 类型 |
| `useGameLogic.ts` | 新增 `currentLevel` 状态，修改 `startGame` 支持关卡模式 |
| `SettingsPanel.tsx` | 新增关卡选择 UI |
| `StatsPanel.tsx` | 新增关卡进度展示 |

---

### 3.3 目标移动系统 (P2)

#### 3.3.1 数据结构定义

```typescript
// types/movement.ts

export type MovementType = 
  | 'horizontal'   // 水平平移
  | 'vertical'     // 垂直平移
  | 'diagonal'     // 45度斜向
  | 'zigzag'       // 折线运动
  | 'accelerate'   // 加速移动
  | 'decelerate'   // 减速移动
  | 'random';      // 随机变向

export interface MovementConfig {
  type: MovementType;
  speed: number;           // 格/秒
  direction: 1 | -1;
  acceleration?: number;
  changeInterval?: number; // 变向间隔(随机模式)
}

export interface MovingTarget extends SingleCellEnemy {
  movement: MovementConfig;
  currentPixelPosition: {
    x: number;  // 像素坐标
    y: number;
  };
  velocity: {
    x: number;  // 像素/秒
    y: number;
  };
}

// 移动模式配置
export const MOVEMENT_PRESETS: Record<string, MovementConfig> = {
  slowHorizontal: { type: 'horizontal', speed: 0.5, direction: 1 },
  mediumVertical: { type: 'vertical', speed: 1.0, direction: -1 },
  fastRandom: { type: 'random', speed: 1.5, direction: 1, changeInterval: 2000 },
};
```

#### 3.3.2 移动算法

```typescript
// utils/targetMovement.ts

export class TargetMovementEngine {
  // 更新目标位置
  static updatePosition(
    target: MovingTarget,
    deltaTime: number,  // 秒
    gridBounds: { minRow: number; maxRow: number; minCol: number; maxCol: number }
  ): MovingTarget {
    const { velocity, currentPixelPosition } = target;
    
    // 计算新位置
    const newX = currentPixelPosition.x + velocity.x * deltaTime * 1000;
    const newY = currentPixelPosition.y + velocity.y * deltaTime * 1000;
    
    // 边界碰撞检测
    let newVelocity = { ...velocity };
    let finalX = newX;
    let finalY = newY;
    
    // 转换为格子坐标
    const cellWidth = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--excel-cell-width'));
    const cellHeight = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--excel-cell-height'));
    
    const newCol = finalX / cellWidth;
    const newRow = finalY / cellHeight;
    
    // 边界反弹
    if (newCol < gridBounds.minCol || newCol > gridBounds.maxCol) {
      newVelocity.x = -newVelocity.x;
      finalX = Math.max(gridBounds.minCol * cellWidth, 
                        Math.min(gridBounds.maxCol * cellWidth, finalX));
    }
    
    if (newRow < gridBounds.minRow || newRow > gridBounds.maxRow) {
      newVelocity.y = -newVelocity.y;
      finalY = Math.max(gridBounds.minRow * cellHeight, 
                        Math.min(gridBounds.maxRow * cellHeight, finalY));
    }
    
    return {
      ...target,
      currentPixelPosition: { x: finalX, y: finalY },
      velocity: newVelocity,
      position: {
        row: Math.round(finalY / cellHeight),
        col: Math.round(finalX / cellWidth),
      },
    };
  }

  // 随机变向
  static applyRandomDirectionChange(
    target: MovingTarget,
    elapsedSinceLastChange: number
  ): MovingTarget {
    if (target.movement.type !== 'random') return target;
    
    const interval = target.movement.changeInterval ?? 2000;
    if (elapsedSinceLastChange < interval) return target;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = target.movement.speed * CELL_SIZE;
    
    return {
      ...target,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
    };
  }
}
```

#### 3.3.3 游戏循环重构 (requestAnimationFrame)

```typescript
// hooks/useGameLoop.ts

export function useGameLoop(
  isPlaying: boolean,
  isPaused: boolean,
  onUpdate: (deltaTime: number) => void
) {
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      return;
    }
    
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // 秒
      lastTimeRef.current = timestamp;
      
      onUpdate(deltaTime);
      
      rafIdRef.current = requestAnimationFrame(loop);
    };
    
    rafIdRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isPlaying, isPaused, onUpdate]);
}
```

#### 3.3.4 命中判定优化（预判位置）

```typescript
// utils/hitDetection.ts

export function checkTrackingHit(
  clickPosition: { x: number; y: number },
  target: MovingTarget,
  deltaTime: number
): HitResult {
  // 预测位置（考虑移动延迟）
  const predictedX = target.currentPixelPosition.x + target.velocity.x * deltaTime * 2;
  const predictedY = target.currentPixelPosition.y + target.velocity.y * deltaTime * 2;
  
  const distance = Math.sqrt(
    Math.pow(clickPosition.x - predictedX, 2) +
    Math.pow(clickPosition.y - predictedY, 2)
  );
  
  const hitRadius = CELL_SIZE * 0.6; // 命中判定半径
  
  if (distance < hitRadius) {
    const accuracyBonus = Math.max(1.0, 2.0 - distance / hitRadius);
    const baseScore = BODY_PART_SCORES[target.bodyPart];
    
    return {
      hit: true,
      score: Math.round(baseScore * accuracyBonus),
      bodyPart: target.bodyPart,
      isHeadshot: target.bodyPart === 'head',
      isBodyshot: target.bodyPart === 'body',
      isLimbShot: ['leftHand', 'rightHand', 'foot'].includes(target.bodyPart),
    };
  }
  
  return {
    hit: false,
    score: 0,
    bodyPart: null,
    isHeadshot: false,
    isBodyshot: false,
    isLimbShot: false,
    reason: 'miss',
  };
}
```

#### 3.3.5 与现有代码集成点

| 现有代码 | 修改内容 |
|----------|----------|
| `useGameLogic.ts` | 替换 `setInterval` 为 `useGameLoop`，新增 `MovingTarget` 状态更新 |
| `ExcelGrid.tsx` | 新增移动目标渲染，使用 `transform: translate()` 实现平滑动画 |
| `types.ts` | 新增 `MovementConfig`、`MovingTarget` 类型 |

---

### 3.4 特殊模式 (P1-P2)

#### 3.4.1 模式数据结构

```typescript
// types/modes.ts

export type SpecialMode = 
  | 'peek'          // 拐角射击
  | 'obstacle'      // 障碍物射击
  | 'multi-target'  // 多目标切换
  | 'reaction'      // 反应训练
  | 'precision'     // 精准度训练
  | 'endurance';    // 耐力训练

export interface PeekModeConfig {
  slideInSpeed: 'slow' | 'medium' | 'fast';
  stayDuration: number;  // 0.3-1.0秒
  spawnInterval: number; // 1-5秒
}

export interface ObstacleModeConfig {
  wallCount: number;     // 3-10
  wallLayout: 'random' | 'fixed';
  visibility: number;    // 30%-80%
  hideDuration: number;  // 1-3秒
}

export interface MultiTargetConfig {
  targetCount: number;   // 2-5
  showPriority: boolean;
  wrongOrderPenalty: 'reset-combo' | 'none';
  switchInterval: number; // 0-2秒
}

export interface ReactionModeConfig {
  appearDuration: number; // 0.2-1.0秒
  disappearStyle: 'instant' | 'fade';
  warningType: 'none' | 'sound' | 'visual';
}

export interface PrecisionModeConfig {
  targetScale: number;    // 20%-50%
  targetCount: number;    // 1-3
  spawnArea: 'full' | 'fixed-row';
}

export interface EnduranceModeConfig {
  duration: number;       // 5-30分钟
  spawnFrequency: number; // 极高
  fatigueFactor: boolean;
}
```

#### 3.4.2 拐角射击模式实现

```typescript
// modes/PeekMode.ts

export class PeekModeEngine {
  static spawnPeekTarget(
    config: PeekModeConfig,
    gridBounds: GridBounds
  ): PeekTarget {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const row = Math.floor(Math.random() * gridBounds.rows) + 1;
    
    return {
      id: generateId(),
      bodyPart: EnemyGenerator.weightedRandomSelect(DEFAULT_WEIGHTS),
      phase: 'slide-in',
      side,
      row,
      startCol: side === 'left' ? 1 : gridBounds.cols + 1,
      stayCol: Math.floor(gridBounds.cols / 2),
      currentCol: side === 'left' ? 1 : gridBounds.cols + 1,
      slideSpeed: this.getSpeed(config.slideInSpeed),
      stayDuration: config.stayDuration * 1000,
      spawnTime: Date.now(),
      phaseStartTime: Date.now(),
    };
  }
  
  static update(target: PeekTarget): PeekTarget {
    const elapsed = Date.now() - target.phaseStartTime;
    
    switch (target.phase) {
      case 'slide-in':
        const slideProgress = elapsed / 1000 * target.slideSpeed;
        const newCol = target.side === 'left' 
          ? target.startCol + slideProgress
          : target.startCol - slideProgress;
        
        if (Math.abs(newCol - target.stayCol) < 0.1) {
          return { ...target, phase: 'stay', phaseStartTime: Date.now(), currentCol: target.stayCol };
        }
        return { ...target, currentCol: newCol };
        
      case 'stay':
        if (elapsed >= target.stayDuration) {
          return { ...target, phase: 'slide-out', phaseStartTime: Date.now() };
        }
        return target;
        
      case 'slide-out':
        const outProgress = elapsed / 1000 * target.slideSpeed;
        const outCol = target.side === 'left'
          ? target.stayCol - outProgress
          : target.stayCol + outProgress;
        
        if (outCol < 1 || outCol > gridBounds.cols + 1) {
          return { ...target, phase: 'expired' };
        }
        return { ...target, currentCol: outCol };
    }
  }
  
  private static getSpeed(speed: string): number {
    return { slow: 3, medium: 5, fast: 8 }[speed] ?? 5;
  }
}
```

#### 3.4.3 障碍物模式实现

```typescript
// modes/ObstacleMode.ts

export class ObstacleModeEngine {
  static generateWalls(
    config: ObstacleModeConfig,
    gridBounds: GridBounds
  ): Wall[] {
    const walls: Wall[] = [];
    const occupied = new Set<string>();
    
    for (let i = 0; i < config.wallCount; i++) {
      let row: number, col: number;
      do {
        row = Math.floor(Math.random() * gridBounds.rows) + 1;
        col = Math.floor(Math.random() * gridBounds.cols) + 2;
      } while (occupied.has(`${row}-${col}`));
      
      occupied.add(`${row}-${col}`);
      walls.push({
        id: `wall-${i}`,
        row,
        col,
        type: 'wall',
      });
    }
    
    return walls;
  }
  
  static isTargetVisible(
    target: SingleCellEnemy,
    walls: Wall[],
    config: ObstacleModeConfig
  ): boolean {
    // 简化实现：随机决定是否被遮挡
    return Math.random() > (1 - config.visibility / 100);
  }
}
```

#### 3.4.4 多目标切换模式实现

```typescript
// modes/MultiTargetMode.ts

export class MultiTargetModeEngine {
  static generateTargets(
    config: MultiTargetConfig,
    gridBounds: GridBounds
  ): MultiTarget[] {
    const targets: MultiTarget[] = [];
    const occupied = new Set<string>();
    
    for (let i = 0; i < config.targetCount; i++) {
      const enemy = EnemyGenerator.generateEnemy(
        gridBounds.rows,
        gridBounds.cols,
        5, // 中等难度
        occupied
      );
      
      if (enemy) {
        occupied.add(`${enemy.position.row}-${enemy.position.col}`);
        targets.push({
          ...enemy,
          priority: i + 1,
          isEliminated: false,
        });
      }
    }
    
    return targets;
  }
  
  static processHit(
    target: MultiTarget,
    hitPriority: number,
    currentExpectedPriority: number,
    config: MultiTargetConfig
  ): { success: boolean; penalty: boolean } {
    // 正确顺序
    if (target.priority === currentExpectedPriority) {
      return { success: true, penalty: false };
    }
    
    // 错误顺序
    if (config.wrongOrderPenalty === 'reset-combo') {
      return { success: false, penalty: true };
    }
    
    return { success: false, penalty: false };
  }
}
```

---

### 3.5 技能系统 (P3)

#### 3.5.1 数据结构定义

```typescript
// types/skills.ts

export type SkillType = 'buff' | 'debuff' | 'environmental';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  cooldown: number;  // 秒
  duration: number;  // 持续时间(秒)，0表示瞬发
  effect: SkillEffect;
  icon: string;      // Excel 风格图标
  hotkey: 'Q' | 'W' | 'E' | 'R';
}

export interface SkillEffect {
  type: 'score-multiplier' | 'accuracy-boost' | 'headshot-boost' | 'duration-extend' | 'tracking-boost' | 'combo-boost';
  value: number;
}

export interface SkillState {
  skillId: string;
  isReady: boolean;
  currentCooldown: number; // 剩余冷却时间
  isActive: boolean;
  remainingDuration: number;
}

// 技能定义
export const SKILLS: Skill[] = [
  {
    id: 'SKILL-01',
    name: '精准打击',
    type: 'buff',
    description: '+20% 命中得分',
    cooldown: 30,
    duration: 10,
    effect: { type: 'score-multiplier', value: 1.2 },
    icon: '🎯',
    hotkey: 'Q',
  },
  {
    id: 'SKILL-02',
    name: '鹰眼',
    type: 'buff',
    description: '+30% 爆头率',
    cooldown: 45,
    duration: 15,
    effect: { type: 'headshot-boost', value: 0.3 },
    icon: '🦅',
    hotkey: 'W',
  },
  {
    id: 'SKILL-03',
    name: '极速反应',
    type: 'buff',
    description: '目标停留时间+50%',
    cooldown: 60,
    duration: 8,
    effect: { type: 'duration-extend', value: 1.5 },
    icon: '⚡',
    hotkey: 'E',
  },
  {
    id: 'SKILL-04',
    name: '稳定射击',
    type: 'buff',
    description: '移动目标得分+25%',
    cooldown: 40,
    duration: 12,
    effect: { type: 'tracking-boost', value: 1.25 },
    icon: '🎯',
    hotkey: 'R',
  },
];
```

#### 3.5.2 技能管理器

```typescript
// hooks/useSkillManager.ts

export function useSkillManager() {
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>(() => {
    const initial: Record<string, SkillState> = {};
    SKILLS.forEach(skill => {
      initial[skill.id] = {
        skillId: skill.id,
        isReady: true,
        currentCooldown: 0,
        isActive: false,
        remainingDuration: 0,
      };
    });
    return initial;
  });
  
  const activateSkill = useCallback((skillId: string) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return false;
    
    const state = skillStates[skillId];
    if (!state.isReady) return false;
    
    setSkillStates(prev => ({
      ...prev,
      [skillId]: {
        skillId,
        isReady: false,
        currentCooldown: skill.cooldown,
        isActive: skill.duration > 0,
        remainingDuration: skill.duration,
      },
    }));
    
    return true;
  }, [skillStates]);
  
  // 更新冷却和持续时间
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillStates(prev => {
        const next = { ...prev };
        
        for (const skillId in next) {
          const state = next[skillId];
          
          // 更新冷却
          if (state.currentCooldown > 0) {
            state.currentCooldown = Math.max(0, state.currentCooldown - 0.1);
            state.isReady = state.currentCooldown === 0;
          }
          
          // 更新持续时间
          if (state.isActive && state.remainingDuration > 0) {
            state.remainingDuration = Math.max(0, state.remainingDuration - 0.1);
            state.isActive = state.remainingDuration > 0;
          }
        }
        
        return next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    skillStates,
    activateSkill,
    getActiveEffects: () => SKILLS.filter(s => skillStates[s.id]?.isActive),
  };
}
```

#### 3.5.3 Excel 风格 UI

```tsx
// components/SkillPanel.tsx

export const SkillPanel: React.FC<SkillPanelProps> = ({ skillStates, onActivate }) => {
  return (
    <div className="skill-panel excel-toolbar">
      <div className="excel-formula-bar">
        <span className="formula-label">技能</span>
        <div className="skill-slots">
          {SKILLS.map(skill => {
            const state = skillStates[skill.id];
            return (
              <button
                key={skill.id}
                className={`skill-button ${state.isReady ? 'ready' : 'cooldown'} ${state.isActive ? 'active' : ''}`}
                onClick={() => onActivate(skill.id)}
                disabled={!state.isReady}
                title={`${skill.name}: ${skill.description}`}
              >
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-hotkey">[{skill.hotkey}]</span>
                {!state.isReady && (
                  <span className="cooldown-overlay">
                    {Math.ceil(state.currentCooldown)}s
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

---

### 3.6 经济系统 (P3)

#### 3.6.1 数据结构定义

```typescript
// types/economy.ts

export interface PlayerEconomy {
  credits: number;
  ownedItems: string[];
  unlockedLevels: string[];
  membership: boolean;
  purchaseHistory: PurchaseRecord[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'consumable' | 'permanent' | 'membership';
  effect: ItemEffect;
  icon: string;
}

export interface ItemEffect {
  type: 'accuracy' | 'reaction' | 'stability' | 'endurance';
  value: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'ITEM-001',
    name: '精准准星',
    description: '+10% 精准度',
    price: 300,
    type: 'permanent',
    effect: { type: 'accuracy', value: 0.1 },
    icon: '🎯',
  },
  {
    id: 'ITEM-002',
    name: '快速瞄准',
    description: '+15% 反应速度',
    price: 400,
    type: 'permanent',
    effect: { type: 'reaction', value: 0.15 },
    icon: '⚡',
  },
  // ... 更多物品
];
```

#### 3.6.2 Credits 计算

```typescript
// utils/economy.ts

export function calculateCreditsEarned(gameResult: {
  score: number;
  accuracy: number;
  isWin: boolean;
  level: number;
}): number {
  let credits = 50; // 基础奖励
  
  // 得分加成
  credits += Math.floor(gameResult.score / 100);
  
  // 准确度加成
  if (gameResult.accuracy >= 80) credits += 30;
  if (gameResult.accuracy >= 90) credits += 20;
  
  // 关卡加成
  credits += gameResult.level * 5;
  
  // 失败惩罚
  if (!gameResult.isWin) credits = Math.max(0, credits - 20);
  
  return credits;
}
```

---

## 4. 开发优先级与排期

### 4.1 Phase 1: 基础玩法增强 (P0)

**工期：2天**

| 任务 | 预计时间 | 依赖 |
|------|----------|------|
| 扩展 TargetType 为 BodyPartType | 2h | 无 |
| 实现五部位生成算法 | 4h | 上一步 |
| 更新 ExcelGrid 渲染五部位 | 3h | 上一步 |
| 实现部位分值计算 | 2h | 上一步 |
| 更新设置面板支持部位权重 | 2h | 无 |
| 测试与调试 | 3h | 全部 |

**交付物：**
- `types/enemy.ts` - 五部位类型定义
- `utils/enemyGenerator.ts` - 敌人生成器
- `utils/hitDetection.ts` - 命中判定
- 更新的 `ExcelGrid.tsx` 渲染

### 4.2 Phase 2: 关卡系统 (P1)

**工期：3天**

| 任务 | 预计时间 | 依赖 |
|------|----------|------|
| 定义关卡数据结构 | 2h | Phase 1 |
| 实现 LevelGenerator | 4h | 上一步 |
| 创建预设关卡库 | 3h | 上一步 |
| 实现关卡进度存储 | 2h | 上一步 |
| 更新 UI 支持关卡选择 | 4h | 全部 |
| 关卡评价与星级系统 | 3h | 全部 |

**交付物：**
- `types/level.ts` - 关卡类型定义
- `utils/levelGenerator.ts` - 关卡生成器
- `constants/levels.ts` - 预设关卡
- 关卡选择 UI

### 4.3 Phase 3: 特殊模式 (P1)

**工期：3天**

| 任务 | 预计时间 | 依赖 |
|------|----------|------|
| 拐角射击模式 | 4h | Phase 2 |
| 障碍物模式 | 3h | Phase 2 |
| 多目标切换模式 | 4h | Phase 2 |
| 反应训练模式 | 2h | Phase 2 |
| 精准度/耐力模式 | 2h | Phase 2 |
| 模式切换 UI | 3h | 全部 |

### 4.4 Phase 4: 目标移动系统 (P2)

**工期：4天**

| 任务 | 预计时间 | 依赖 |
|------|----------|------|
| 重构游戏循环为 RAF | 4h | Phase 1 |
| 定义移动数据结构 | 2h | 上一步 |
| 实现移动算法 | 4h | 上一步 |
| 实现边界碰撞与反弹 | 3h | 上一步 |
| 命中判定优化（预判） | 3h | 上一步 |
| 移动目标渲染优化 | 3h | 全部 |

### 4.5 Phase 5: 技能与经济系统 (P3)

**工期：5天**

| 任务 | 预计时间 | 依赖 |
|------|----------|------|
| 技能系统数据结构 | 2h | Phase 4 |
| 技能管理器实现 | 3h | 上一步 |
| 技能效果应用 | 4h | 上一步 |
| 经济系统数据结构 | 2h | 无 |
| Credits 计算与存储 | 3h | 上一步 |
| 商店 UI | 4h | 全部 |
| 物品购买与效果 | 3h | 全部 |

---

## 5. 代码实现规范

### 5.1 文件组织结构

```
src/
├── types/              # 类型定义
│   ├── enemy.ts        # 敌人类型
│   ├── level.ts        # 关卡类型
│   ├── movement.ts     # 移动类型
│   ├── skills.ts       # 技能类型
│   ├── economy.ts      # 经济类型
│   └── index.ts        # 统一导出
├── constants/          # 常量配置
│   ├── scoring.ts      # 分值配置
│   ├── levels.ts       # 预设关卡
│   └── skills.ts       # 技能定义
├── utils/              # 工具函数
│   ├── enemyGenerator.ts
│   ├── levelGenerator.ts
│   ├── targetMovement.ts
│   └── hitDetection.ts
├── modes/              # 特殊模式
│   ├── PeekMode.ts
│   ├── ObstacleMode.ts
│   └── MultiTargetMode.ts
├── hooks/              # 自定义 Hooks
│   ├── useGameLogic.ts # 主游戏逻辑（重构）
│   ├── useGameLoop.ts  # RAF 游戏循环
│   └── useSkillManager.ts
├── components/         # React 组件
│   ├── ExcelGrid.tsx   # 游戏网格（更新）
│   ├── LevelSelector.tsx
│   ├── SkillPanel.tsx
│   └── ShopPanel.tsx
└── contexts/           # React Context
    ├── GameContext.tsx # 新增：游戏状态上下文
    └── SettingsContext.tsx
```

### 5.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 接口/类型 | PascalCase | `BodyPartType`, `LevelConfig` |
| 常量 | SCREAMING_SNAKE_CASE | `BODY_PART_SCORES` |
| 函数 | camelCase | `generateEnemy`, `processHit` |
| 组件 | PascalCase | `ExcelGrid`, `LevelSelector` |
| Hooks | use 前缀 | `useGameLoop`, `useSkillManager` |

### 5.3 TypeScript 规范

```typescript
// ✅ 推荐：显式类型注解
export function generateEnemy(
  gridRows: number,
  gridCols: number,
  difficulty: number,
  occupiedCells: Set<string>
): SingleCellEnemy | null {
  // ...
}

// ✅ 推荐：使用 type 而非 interface（简单类型）
export type BodyPartType = 'head' | 'body' | 'leftHand' | 'rightHand' | 'foot';

// ✅ 推荐：使用 interface（复杂对象）
export interface Level {
  id: string;
  name: string;
  // ...
}

// ❌ 避免：any 类型
const data: any = fetchData(); // 不推荐

// ✅ 推荐：使用泛型或 unknown
const data: unknown = fetchData();
```

### 5.4 性能优化规范

```typescript
// ✅ 使用 memo 避免不必要的重渲染
export const TargetCell = React.memo<TargetCellProps>(({ target, onClick }) => {
  return <div onClick={onClick}>{target.bodyPart}</div>;
});

// ✅ 使用 useCallback 缓存回调
const handleCellClick = useCallback((row: number, col: number) => {
  // ...
}, [dependency1, dependency2]);

// ✅ 使用 useMemo 缓存计算结果
const availableCells = useMemo(() => {
  return findAvailableCells(gridRows, gridCols, occupiedCells);
}, [gridRows, gridCols, occupiedCells]);

// ✅ RAF 时间戳计算
const loop = (timestamp: number) => {
  const deltaTime = timestamp - lastTimeRef.current;
  lastTimeRef.current = timestamp;
  // 使用 deltaTime 而非固定间隔
};
```

### 5.5 样式规范

```css
/* 复用现有 Excel 风格变量 */
:root {
  --excel-cell-width: 40px;
  --excel-cell-height: 20px;
  --excel-border-color: #d4d4d4;
  --excel-header-bg: #f3f3f3;
  --excel-selected-bg: #e6f4ea;
  --excel-target-head: #dc2626;
  --excel-target-body: #2563eb;
  --excel-target-limb: #f59e0b;
  --excel-target-foot: #6b7280;
}

/* 目标样式 */
.target-head {
  background: var(--excel-target-head);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.target-body {
  background: var(--excel-target-body);
  border-radius: 4px;
}

/* 移动目标动画 */
.target-moving {
  will-change: transform;
  transition: none; /* RAF 控制，禁用 CSS transition */
}
```

---

## 6. 与现有代码对接点

### 6.1 主要修改清单

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `types.ts` | 扩展 | 新增五部位、关卡、移动、技能类型 |
| `useGameLogic.ts` | 重构 | 替换 setInterval 为 RAF，新增关卡/移动逻辑 |
| `ExcelGrid.tsx` | 扩展 | 新增五部位渲染、移动目标渲染、特殊模式 UI |
| `SettingsPanel.tsx` | 扩展 | 新增关卡选择、模式选择、技能配置 |
| `StatsPanel.tsx` | 扩展 | 新增关卡进度、Credits 显示 |
| `App.tsx` | 扩展 | 新增技能面板、商店入口 |

### 6.2 兼容性保证

```typescript
// 向后兼容：保留原有 Target 类型，新增别名
export type Target = SingleCellEnemy; // 兼容旧代码

// 向后兼容：保留原有 GameMode
export type GameMode = 'timed' | 'endless' | 'zen' | 'headshot' | SpecialMode;

// 迁移策略：渐进式替换
// Phase 1: 新增 BodyPartType，保留 TargetType
// Phase 2: 使用 Target = SingleCellEnemy 别名
// Phase 3: 全面替换为 SingleCellEnemy
```

### 6.3 测试重点

| 模块 | 测试项 | 优先级 |
|------|--------|--------|
| 单格敌人系统 | 五部位生成权重正确性 | 高 |
| 单格敌人系统 | 命中判定准确性 | 高 |
| 关卡系统 | 关卡生成与预设一致性 | 中 |
| 关卡系统 | 难度曲线合理性 | 中 |
| 目标移动 | 边界碰撞正确性 | 高 |
| 目标移动 | 帧率稳定性（60fps+） | 高 |
| 特殊模式 | 模式切换无状态泄漏 | 中 |
| 技能系统 | 冷却计时准确性 | 低 |
| 经济系统 | Credits 计算正确性 | 低 |

---

## 附录

### A. 参考资料

1. `design/level_generator_and_modes.md` - 关卡生成器与练枪模式设计
2. `design/optimization_proposals.md` - 跟枪手感优化方案
3. React 18 性能优化指南
4. requestAnimationFrame 最佳实践

### B. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-03-27 | 初始版本 |

---

*文档编制：Subagent (Coder)*
*审核状态：待主 Agent 审核*