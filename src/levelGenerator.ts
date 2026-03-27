// P1: 关卡生成器
import type { LevelConfig, LevelDifficulty, PartWeights, LevelObjectiveType } from './types';
import { DIFFICULTY_PART_WEIGHTS } from './types';

/**
 * 生成关卡配置
 * @param difficulty 难度等级 1-12
 */
export function generateLevel(difficulty: LevelDifficulty): LevelConfig {
  // 根据难度确定关卡阶段
  const stage = getStageFromDifficulty(difficulty);
  
  // 生成过关条件
  const objectives = generateObjectives(difficulty, stage);
  
  // 生成敌人配置
  const enemyConfig = generateEnemyConfig(difficulty);
  
  return {
    level: difficulty,
    difficulty,
    objectives,
    rewards: {
      score: calculateScoreReward(difficulty),
      accuracy: calculateAccuracyReward(difficulty),
    },
    timeLimit: getTimeLimit(difficulty),
    enemyConfig,
  };
}

/**
 * 根据难度获取阶段
 */
function getStageFromDifficulty(difficulty: LevelDifficulty): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (difficulty <= 3) return 'beginner';
  if (difficulty <= 6) return 'intermediate';
  if (difficulty <= 9) return 'advanced';
  return 'expert';
}

/**
 * 生成过关条件
 */
function generateObjectives(
  difficulty: LevelDifficulty,
  stage: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): { type: LevelObjectiveType; target: number; description: string }[] {
  const objectives: { type: LevelObjectiveType; target: number; description: string }[] = [];

  // 基础分数目标
  const scoreTarget = calculateScoreTarget(difficulty);
  objectives.push({
    type: 'minScore',
    target: scoreTarget,
    description: `获得 ${scoreTarget.toLocaleString()} 分`,
  });

  // 难度 4+ 添加命中率要求
  if (difficulty >= 4) {
    const accuracyTarget = calculateAccuracyTarget(difficulty);
    objectives.push({
      type: 'accuracy',
      target: accuracyTarget,
      description: `命中率 ≥ ${accuracyTarget}%`,
    });
  }

  // 难度 7+ 添加连击要求
  if (difficulty >= 7) {
    const comboTarget = calculateComboTarget(difficulty);
    objectives.push({
      type: 'combo',
      target: comboTarget,
      description: `最大连击 ≥ ${comboTarget}x`,
    });
  }

  // 难度 10+ 添加爆头数要求
  if (difficulty >= 10) {
    const headshotTarget = calculateHeadshotTarget(difficulty);
    objectives.push({
      type: 'headshotCount',
      target: headshotTarget,
      description: `爆头 ≥ ${headshotTarget} 次`,
    });
  }

  // 专家阶段添加时间限制
  if (stage === 'expert') {
    objectives.push({
      type: 'timeLimit',
      target: getTimeLimit(difficulty)!,
      description: `在 ${getTimeLimit(difficulty)} 秒内完成`,
    });
  }

  return objectives;
}

/**
 * 生成敌人配置
 */
function generateEnemyConfig(difficulty: LevelDifficulty): {
  maxEnemies: number;
  spawnInterval: [number, number];
  partWeights: PartWeights;
} {
  // 最大敌人数量
  const maxEnemies = Math.min(2 + Math.floor(difficulty / 3), 6);
  
  // 生成间隔 (秒)
  const spawnInterval: [number, number] = [
    Math.max(0.3, 2.0 - difficulty * 0.15),
    Math.max(0.5, 3.0 - difficulty * 0.15),
  ];

  // 部位权重
  const partWeights = DIFFICULTY_PART_WEIGHTS[getDifficultyCategory(difficulty)];

  return {
    maxEnemies,
    spawnInterval,
    partWeights,
  };
}

/**
 * 获取难度分类
 */
function getDifficultyCategory(difficulty: LevelDifficulty): 'easy' | 'normal' | 'hard' | 'expert' {
  if (difficulty <= 3) return 'easy';
  if (difficulty <= 6) return 'normal';
  if (difficulty <= 9) return 'hard';
  return 'expert';
}

/**
 * 计算分数目标
 */
function calculateScoreTarget(difficulty: LevelDifficulty): number {
  const baseScores = [500, 1000, 1500, 2500, 3500, 5000, 7000, 9000, 12000, 15000, 20000, 25000];
  return baseScores[difficulty - 1] || 500;
}

/**
 * 计算命中率目标
 */
function calculateAccuracyTarget(difficulty: LevelDifficulty): number {
  if (difficulty <= 3) return 60;
  if (difficulty <= 6) return 70 + (difficulty - 3) * 3;
  if (difficulty <= 9) return 80 + (difficulty - 6) * 2;
  return 88 + (difficulty - 9) * 2;
}

/**
 * 计算连击目标
 */
function calculateComboTarget(difficulty: LevelDifficulty): number {
  if (difficulty <= 6) return 5 + (difficulty - 1) * 2;
  if (difficulty <= 9) return 20 + (difficulty - 6) * 5;
  return 40 + (difficulty - 9) * 10;
}

/**
 * 计算爆头目标
 */
function calculateHeadshotTarget(difficulty: LevelDifficulty): number {
  if (difficulty <= 9) return 0;
  return (difficulty - 9) * 5;
}

/**
 * 计算时间限制
 */
function getTimeLimit(difficulty: LevelDifficulty): number | undefined {
  if (difficulty <= 9) return undefined;
  // 难度 10-12: 60s, 45s, 30s
  return 90 - (difficulty - 10) * 15;
}

/**
 * 计算分数奖励
 */
function calculateScoreReward(difficulty: LevelDifficulty): number {
  return difficulty * 100;
}

/**
 * 计算命中率奖励
 */
function calculateAccuracyReward(difficulty: LevelDifficulty): number {
  return Math.min(5 + difficulty, 20);
}

/**
 * 检查关卡是否完成
 */
export function checkLevelCompletion(
  level: LevelConfig,
  gameState: {
    score: number;
    hits: number;
    totalClicks: number;
    maxCombo: number;
    headHits: number;
    timeRemaining: number;
  }
): { completed: boolean; failed: boolean; message: string } {
  const { objectives, timeLimit } = level;
  
  // 检查时间限制失败
  if (timeLimit && gameState.timeRemaining <= 0) {
    return { completed: false, failed: true, message: '时间到！关卡失败' };
  }

  let allCompleted = true;
  const failedObjectives: string[] = [];

  for (const obj of objectives) {
    let completed = false;
    let current = 0;

    switch (obj.type) {
      case 'minScore':
        current = gameState.score;
        completed = gameState.score >= obj.target;
        break;
      case 'accuracy':
        current = gameState.totalClicks > 0 
          ? Math.round((gameState.hits / gameState.totalClicks) * 100) 
          : 0;
        completed = current >= obj.target;
        break;
      case 'combo':
        current = gameState.maxCombo;
        completed = gameState.maxCombo >= obj.target;
        break;
      case 'headshotCount':
        current = gameState.headHits;
        completed = gameState.headHits >= obj.target;
        break;
      case 'timeLimit':
        current = gameState.timeRemaining;
        completed = gameState.timeRemaining > 0;
        break;
    }

    if (!completed) {
      allCompleted = false;
      if (timeLimit && obj.type === 'timeLimit' && gameState.timeRemaining <= 0) {
        failedObjectives.push(obj.description ?? '时间限制未达成');
      }
    }
  }

  if (allCompleted) {
    return { completed: true, failed: false, message: '关卡完成！🎉' };
  }

  if (failedObjectives.length > 0) {
    return { 
      completed: false, 
      failed: true, 
      message: `未完成：${failedObjectives.join(', ')}` 
    };
  }

  return { completed: false, failed: false, message: '继续加油！' };
}

/**
 * 获取所有可用关卡列表
 */
export function getAvailableLevels(): { level: number; name: string; difficulty: string }[] {
  const levels = [];
  for (let i = 1; i <= 12; i++) {
    levels.push({
      level: i,
      name: `关卡 ${i}`,
      difficulty: getDifficultyDescription(i as LevelDifficulty),
    });
  }
  return levels;
}

/**
 * 获取难度描述
 */
function getDifficultyDescription(difficulty: LevelDifficulty): string {
  if (difficulty <= 3) return '新手';
  if (difficulty <= 6) return '进阶';
  if (difficulty <= 9) return '熟练';
  return '专家';
}
