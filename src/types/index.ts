// 统一导出所有类型

// 游戏核心类型
export type { GameMode, TimedDuration, Difficulty } from './game';
export type { GameState, CellPosition, HitEffect } from './game';
export { DIFFICULTY_SETTINGS, COMBO_MULTIPLIERS } from './game';

// 敌人类型
export type { 
  TargetType, 
  PartType, 
  PartState,
  EnemyState,
  MovePattern,
  PeekDirection,
  PeekState,
  PopState,
  Priority,
  Target, 
  EnemyPart,
  MultiGridEnemy,
  MoveConfig,
  PeekConfig,
  PartHitResult,
  PartWeights, 
  TextEnemyShape, 
  PartPosition, 
  FullEnemyShape 
} from './enemy';
export { 
  TARGET_SCORES, 
  TARGET_PROBS, 
  PART_SCORES, 
  PART_COLORS, 
  PART_TEXTS, 
  PART_MAX_HP,
  PART_STATE_COLORS,
  HUMANOID_PART_POSITIONS,
  MOVE_SPEED_LEVELS,
  PEEK_DURATION_LEVELS,
  PRIORITY_CONFIG,
  REACTION_RATINGS,
  DIFFICULTY_PART_WEIGHTS, 
  FULL_ENEMY_SHAPE 
} from './enemy';

// 设置类型
export type { CrosshairStyle, GamePreset, GameSettings } from './settings';
export { GAME_PRESETS } from './settings';

// 统计类型
export type { ModeStat, GameStats, GameHistoryEntry, LevelDifficulty, LevelObjectiveType, LevelConfig, ReactionTimeStats } from './stats';