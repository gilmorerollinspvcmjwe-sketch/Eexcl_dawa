// 敌人相关类型定义

export type TargetType = 'head' | 'body' | 'feet';

// P0: 单格敌人系统 - 部位类型
export type PartType = 'head' | 'body' | 'leftHand' | 'rightHand' | 'foot';

// 部位状态
export type PartState = 'normal' | 'damaged' | 'critical' | 'destroyed';

// 敌人状态
export type EnemyState = 'idle' | 'dragging' | 'moving' | 'peeking' | 'hidden' | 'dead' | 'dying';

// 移动模式
export type MovePattern = 'static' | 'linear' | 'sine' | 'bounce' | 'random' | 'zigzag';

// 探头方向
export type PeekDirection = 'left' | 'right' | 'up' | 'down';

// 探头状态
export type PeekState = 'hidden' | 'peeking' | 'visible' | 'returning';

// 弹出状态
export type PopState = 'hidden' | 'rising' | 'visible' | 'falling';

// 优先级
export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface Target {
  id: string;
  type: TargetType;
  row: number;
  col: number;
  createdAt: number;
  expiresAt?: number;
}

// ============================================================
// 多格敌人系统
// ============================================================

// 单个部位状态
export interface EnemyPart {
  type: PartType;
  maxHp: number;
  currentHp: number;
  state: PartState;
  relativeRow: number; // 相对于锚点的行偏移
  relativeCol: number; // 相对于锚点的列偏移
}

// 多格敌人
export interface MultiGridEnemy {
  id: string;
  anchorRow: number; // 锚点行（头部位置）
  anchorCol: number; // 锚点列
  parts: EnemyPart[];
  isAlive: boolean;
  state: EnemyState;
  createdAt: number;
  expiresAt?: number;

  // 移动相关
  movePattern?: MovePattern;
  moveProgress?: number;
  moveDirection?: 'left' | 'right' | 'up' | 'down';
  moveSpeed?: number;

  // 探头相关
  peekState?: PeekState;
  peekDirection?: PeekDirection;
  peekProgress?: number;
  peekTimer?: number;
  peekDuration?: number;

  // 弹出相关
  popState?: PopState;
  popProgress?: number;

  // 优先级（Switch Track 模式）
  priority?: Priority;
  spawnTime?: number;
  timeLimit?: number;

  // FPS 模式相关
  // Reaction 模式
  isVisible?: boolean;
  reactionDelay?: number;
  reactionStartTime?: number;

  // Precision 模式
  targetScale?: number;

  // 统计
  totalDamageDealt: number;
  partsDestroyed: number;
  diedAt?: number;
}

// 移动配置
export interface MoveConfig {
  pattern: MovePattern;
  speed: number; // 格/秒
  direction: 'left' | 'right' | 'up' | 'down';
  startRow: number;
  startCol: number;
}

// 探头配置
export interface PeekConfig {
  coverPosition: { row: number; col: number };
  peekDirection: PeekDirection;
  peekDistance: number;
  peekDuration: number; // ms
  peekInterval: number; // ms
}

// 部位命中结果
export interface PartHitResult {
  partType: PartType;
  damage: number;
  isDestroyed: boolean;
  isEnemyDead: boolean;
  score: number;
  combo: number;
}

// P0: 部位生成权重 (按难度) - 修复：难度越高头部越多
export interface PartWeights {
  head: number;
  body: number;
  leftHand: number;
  rightHand: number;
  foot: number;
}

// 文字敌人形状类型
export type TextEnemyShape = 'humanoid' | 'target' | 'custom';

// 部位位置定义
export interface PartPosition {
  row: number;
  col: number;
}

// 完整敌人形状（多格组合）
export interface FullEnemyShape {
  head?: PartPosition;
  body: PartPosition[];
  leftHand?: PartPosition;
  rightHand?: PartPosition;
  foot?: PartPosition;
}

// 目标分数配置
export const TARGET_SCORES: Record<TargetType, number> = {
  head: 100,
  body: 50,
  feet: 25,
};

// 目标生成概率
export const TARGET_PROBS: Record<TargetType, number> = {
  head: 0.25,
  body: 0.45,
  feet: 0.30,
};

// P0: 部位分值常量
export const PART_SCORES: Record<PartType, number> = {
  head: 150,
  body: 100,
  leftHand: 60,
  rightHand: 60,
  foot: 40,
};

// 部位颜色
export const PART_COLORS: Record<PartType, string> = {
  head: '#dc2626',
  body: '#f97316',
  leftHand: '#eab308',
  rightHand: '#eab308',
  foot: '#6b7280',
};

// 部位显示文字
export const PART_TEXTS: Record<PartType, string> = {
  head: '头',
  body: '身',
  leftHand: '手',
  rightHand: '手',
  foot: '脚',
};

// 按难度设置的部位生成权重
export const DIFFICULTY_PART_WEIGHTS: Record<string, PartWeights> = {
  easy: { head: 0.10, body: 0.45, leftHand: 0.20, rightHand: 0.20, foot: 0.05 },
  normal: { head: 0.15, body: 0.40, leftHand: 0.20, rightHand: 0.20, foot: 0.05 },
  hard: { head: 0.22, body: 0.35, leftHand: 0.18, rightHand: 0.18, foot: 0.07 },
  expert: { head: 0.30, body: 0.30, leftHand: 0.15, rightHand: 0.15, foot: 0.10 },
};

// 完整敌人形状定义
export const FULL_ENEMY_SHAPE: FullEnemyShape = {
  head: { row: 0, col: 1 },
  body: [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  leftHand: { row: 2, col: 0 },
  rightHand: { row: 2, col: 2 },
  foot: { row: 3, col: 1 },
};

// ============================================================
// 多格敌人常量
// ============================================================

// 部位血量配置
export const PART_MAX_HP: Record<PartType, number> = {
  head: 1,
  body: 3,
  leftHand: 2,
  rightHand: 2,
  foot: 2,
};

// 部位状态颜色
export const PART_STATE_COLORS: Record<PartState, string> = {
  normal: 'inherit',
  damaged: '#fbbf24',
  critical: '#ef4444',
  destroyed: '#9ca3af',
};

// 人形部位布局（相对于锚点）
export const HUMANOID_PART_POSITIONS: { part: PartType; relativeRow: number; relativeCol: number }[] = [
  { part: 'head', relativeRow: 0, relativeCol: 0 },
  { part: 'leftHand', relativeRow: 1, relativeCol: -1 },
  { part: 'body', relativeRow: 1, relativeCol: 0 },
  { part: 'rightHand', relativeRow: 1, relativeCol: 1 },
  { part: 'body', relativeRow: 2, relativeCol: 0 },
  { part: 'foot', relativeRow: 3, relativeCol: 0 },
];

// 移动速度等级
export const MOVE_SPEED_LEVELS: Record<'slow' | 'normal' | 'fast' | 'extreme', number> = {
  slow: 0.5,
  normal: 1.0,
  fast: 2.0,
  extreme: 3.0,
};

// 探头持续时间等级
export const PEEK_DURATION_LEVELS: Record<'long' | 'normal' | 'short' | 'blink', number> = {
  long: 2000,
  normal: 1200,
  short: 600,
  blink: 300,
};

// 优先级颜色和图标
export const PRIORITY_CONFIG: Record<'critical' | 'high' | 'medium' | 'low', { color: string; icon: string; timeLimit: number }> = {
  critical: { color: '#dc2626', icon: '🔴', timeLimit: 1500 },
  high: { color: '#f97316', icon: '🟠', timeLimit: 2500 },
  medium: { color: '#eab308', icon: '🟡', timeLimit: 4000 },
  low: { color: '#22c55e', icon: '🟢', timeLimit: 6000 },
};

// 反应时间评级
export const REACTION_RATINGS: { max: number; rating: string; percentile: number }[] = [
  { max: 150, rating: '超神', percentile: 99 },
  { max: 180, rating: '优秀', percentile: 95 },
  { max: 200, rating: '良好', percentile: 85 },
  { max: 230, rating: '中等', percentile: 60 },
  { max: 270, rating: '一般', percentile: 30 },
  { max: 350, rating: '较慢', percentile: 10 },
  { max: Infinity, rating: '需要练习', percentile: 0 },
];

// FPS模式计分配置
// 反应测试模式：基于反应时间的分数
export const REACTION_SCORES: { max: number; score: number }[] = [
  { max: 200, score: 100 },
  { max: 300, score: 80 },
  { max: 400, score: 60 },
  { max: 500, score: 40 },
  { max: Infinity, score: 20 },
];

// 精准射击模式：基于目标大小的倍数
export const PRECISION_MULTIPLIERS: Record<number, number> = {
  0.25: 4.0,
  0.5: 2.0,
  0.75: 1.5,
};