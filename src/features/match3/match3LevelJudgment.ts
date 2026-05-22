/* 三消关卡胜负判定模块。检查目标完成状态、计算星级评分。 */
import {
  type Match3Tile,
  type Match3GoalType,
  type Match3Color,
  type Match3ObstacleType,
} from './match3Types';

export interface Match3SecondaryGoal {
  type: Match3GoalType;
  targetColor?: Match3Color;
  targetCount?: number;
  overlayType?: string;
  obstacleType?: Match3ObstacleType;
  dropItemType?: string;
}

export interface Match3LevelConfig {
  id: string;
  goalType: Match3GoalType;
  targetScore?: number;
  targetColor?: Match3Color;
  targetCount?: number;
  overlayType?: string;
  obstacleType?: Match3ObstacleType;
  dropItemType?: string;
  maxMoves: number;
  maxTimeMs?: number;
  starThresholds?: {
    one: number;
    two: number;
    three: number;
  };
  secondaryGoals?: Match3SecondaryGoal[];
}

export interface Match3ProgressState {
  collected?: Record<Match3Color, number>;
  overlaysCleared?: number;
  obstaclesCleared?: number;
  dropped?: number;
}

export function checkLevelVictory(
  board: Match3Tile[][],
  config: Match3LevelConfig,
  score: number,
  movesUsed: number,
  progress?: Match3ProgressState,
  remainingTimeMs?: number
): boolean {
  void movesUsed;
  void remainingTimeMs;
  const primaryGoalMet = checkPrimaryGoal(board, config, score, progress);
  if (!primaryGoalMet) return false;

  if (config.secondaryGoals && config.secondaryGoals.length > 0) {
    const secondaryGoalsMet = config.secondaryGoals.every((goal) =>
      checkSecondaryGoal(goal, progress)
    );
    if (!secondaryGoalsMet) return false;
  }

  return true;
}

export function checkLevelFailure(
  _board: Match3Tile[][],
  config: Match3LevelConfig,
  _score: number,
  movesUsed: number,
  remainingTimeMs?: number
): boolean {
  if (movesUsed >= config.maxMoves) return true;

  if (config.maxTimeMs !== undefined && remainingTimeMs !== undefined) {
    if (remainingTimeMs <= 0) return true;
  }

  return false;
}

export function calculateStars(
  config: Match3LevelConfig,
  score: number,
  movesUsed: number
): number {
  if (config.starThresholds) {
    if (score >= config.starThresholds.three) return 3;
    if (score >= config.starThresholds.two) return 2;
    if (score >= config.starThresholds.one) return 1;
    return 0;
  }

  const movesEfficiency = config.maxMoves / movesUsed;
  if (movesEfficiency >= 2) return 3;
  if (movesEfficiency >= 1.5) return 2;
  if (movesEfficiency >= 1) return 1;
  return 0;
}

function checkPrimaryGoal(
  _board: Match3Tile[][],
  config: Match3LevelConfig,
  score: number,
  progress?: Match3ProgressState
): boolean {
  switch (config.goalType) {
    case 'score':
      return config.targetScore !== undefined && score >= config.targetScore;

    case 'collectColor': {
      if (!config.targetColor || !config.targetCount) return false;
      const collected = progress?.collected?.[config.targetColor] ?? 0;
      return collected >= config.targetCount;
    }

    case 'clearOverlay': {
      if (!config.targetCount) return false;
      const overlaysCleared = progress?.overlaysCleared ?? 0;
      return overlaysCleared >= config.targetCount;
    }

    case 'clearObstacle': {
      if (!config.targetCount) return false;
      const obstaclesCleared = progress?.obstaclesCleared ?? 0;
      return obstaclesCleared >= config.targetCount;
    }

    case 'dropCollect': {
      if (!config.targetCount) return false;
      const dropped = progress?.dropped ?? 0;
      return dropped >= config.targetCount;
    }

    default:
      return false;
  }
}

function checkSecondaryGoal(
  goal: Match3SecondaryGoal,
  progress?: Match3ProgressState
): boolean {
  switch (goal.type) {
    case 'collectColor': {
      if (!goal.targetColor || !goal.targetCount) return false;
      const collected = progress?.collected?.[goal.targetColor] ?? 0;
      return collected >= goal.targetCount;
    }

    case 'clearOverlay': {
      if (!goal.targetCount) return false;
      const overlaysCleared = progress?.overlaysCleared ?? 0;
      return overlaysCleared >= goal.targetCount;
    }

    case 'clearObstacle': {
      if (!goal.targetCount) return false;
      const obstaclesCleared = progress?.obstaclesCleared ?? 0;
      return obstaclesCleared >= goal.targetCount;
    }

    case 'dropCollect': {
      if (!goal.targetCount) return false;
      const dropped = progress?.dropped ?? 0;
      return dropped >= goal.targetCount;
    }

    default:
      return false;
  }
}
