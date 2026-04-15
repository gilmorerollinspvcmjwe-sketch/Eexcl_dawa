/* 祖玛模块的核心类型定义。供轨道系统、彩球链、炮台、碰撞判定、关卡数据与 Sheet14/15 共用。 */

export const ZUMA_BALL_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
export type ZumaBallColor = (typeof ZUMA_BALL_COLORS)[number];

export const ZUMA_POWERUP_TYPES = ['burst', 'lightning', 'slow', 'rewind', 'wild'] as const;
export type ZumaPowerupType = (typeof ZUMA_POWERUP_TYPES)[number];

export type ZumaDangerLevel = 'safe' | 'warning' | 'critical';

export type ZumaBallState = 'normal' | 'powerup' | 'pendingClear';

export type ZumaGamePhase = 'setup' | 'playing' | 'won' | 'lost';

export type ZumaGameStatus = 'playing' | 'won' | 'lost';

export type ZumaLevelMode = 'adventure' | 'timed' | 'challenge' | 'endless' | 'practice';

export type ZumaObjectiveType =
  | 'clearAll'
  | 'surviveUntilTime'
  | 'maxShots'
  | 'minChainCount'
  | 'minPowerupUses'
  | 'scoreThreshold';

export type ZumaEndReason = 'clearedObjectives' | 'survivedTimer' | 'reachedFinish' | 'timeExpired' | 'shotsExhausted';

export interface ZumaTrackPoint {
  x: number;
  y: number;
}

export interface ZumaTrackDefinition {
  trackId: string;
  name: string;
  points: ZumaTrackPoint[];
  totalLength: number;
  finishLineDistance: number;
  hasBranches: boolean;
  branchPoints?: ZumaBranchPoint[];
}

export interface ZumaBranchPoint {
  distanceAlongTrack: number;
  branchTrackId: string;
  mergeDistanceAlongBranch: number;
}

export interface ZumaBall {
  ballId: string;
  color: ZumaBallColor | 'wild';
  state: ZumaBallState;
  powerupType?: ZumaPowerupType;
  distanceAlongTrack: number;
  chainId: string;
  indexInChain: number;
  isMarkedForClear: boolean;
}

export interface ZumaBallChain {
  chainId: string;
  balls: ZumaBall[];
  headDistance: number;
  tailDistance: number;
  speedFactor: number;
  temporarySpeedMultiplier: number;
  isRewinding: boolean;
  rewindDistanceRemaining: number;
  slowEffectEndsAtMs: number | null;
  trackId: string;
  isOnBranch: boolean;
  branchTrackId?: string;
}

export interface ZumaFrogCannon {
  x: number;
  y: number;
  angle: number;
  currentBall: ZumaBallColor | ZumaPowerupType;
  nextBall: ZumaBallColor | ZumaPowerupType;
  isReady: boolean;
  cooldownMs: number;
}

export interface ZumaFlyingBall {
  ballId: string;
  color: ZumaBallColor | ZumaPowerupType;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  isPowerup: boolean;
  powerupType?: ZumaPowerupType;
}

export interface ZumaSpawnEvent {
  eventId: string;
  color: ZumaBallColor;
  count: number;
  spawnAtMs: number;
  powerupType?: ZumaPowerupType;
  powerupChance?: number;
}

export interface ZumaEndlessConfig {
  startWave: number;
  baseBatchIntervalMs: number;
  waveSpeedStep: number;
  waveBallStep: number;
  maxColorCount: number;
}

export interface ZumaLevelDefinition {
  levelId: string;
  levelNumber: number;
  mode: ZumaLevelMode;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  trackId: string;
  colorPool: ZumaBallColor[];
  baseSpeed: number;
  difficultyMultiplier: number;
  spawnScript: ZumaSpawnEvent[];
  powerupPool: ZumaPowerupType[];
  powerupSpawnChance: number;
  winCondition: ZumaWinCondition;
  lossCondition: ZumaLossCondition;
  timeLimitMs?: number;
  shotLimit?: number;
  chainLimit?: number;
  endlessConfig?: ZumaEndlessConfig;
  recommendedPracticeTags: string[];
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}

export interface ZumaWinCondition {
  type: 'clearAll' | 'chainCount' | 'shotCount' | 'timeLimit' | 'multiObjective';
  targetValue: number;
  objectives?: ZumaObjectiveDefinition[];
}

export interface ZumaLossCondition {
  type: 'reachFinish' | 'timeLimit';
  finishLineDistance: number;
}

export interface ZumaObjectiveDefinition {
  type: ZumaObjectiveType;
  targetValue: number;
  label?: string;
}

export interface ZumaObjectiveProgress {
  type: ZumaObjectiveType;
  label: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  failed: boolean;
  text: string;
}

export interface ZumaMatchResult {
  matchedBalls: string[];
  matchColor: ZumaBallColor | 'wild';
  matchLength: number;
  insertPointIndex: number;
  chainId: string;
}

export interface ZumaClearEvent {
  clearedBallIds: string[];
  chainId: string;
  clearPosition: number;
  score: number;
  chainComboLevel: number;
}

export interface ZumaRewindEvent {
  chainId: string;
  rewindDistance: number;
  gapClosed: boolean;
  triggeredChainCombo: boolean;
}

export interface ZumaVisualEffect {
  effectId: string;
  effectType: 'insert' | 'clear' | 'chainCombo' | 'powerup' | 'danger' | 'scorePopup';
  x: number;
  y: number;
  startTimeMs: number;
  durationMs: number;
  intensity: number;
  color?: string;
  text?: string;
  powerupType?: ZumaPowerupType;
  isFinished: boolean;
}

export interface ZumaGameEvent {
  eventType: 'SHOT_FIRED' | 'BALL_INSERTED' | 'MATCH_CLEARED' | 'CHAIN_REWIND' | 'POWERUP_TRIGGERED' | 'LEVEL_WON' | 'LEVEL_LOST' | 'DANGER_LEVEL_CHANGED';
  timestampMs: number;
  data: ZumaClearEvent | ZumaRewindEvent | ZumaMatchResult | ZumaFlyingBall | ZumaDangerLevel | null;
}

export interface ZumaScoreRecord {
  totalScore: number;
  chainComboCount: number;
  maxChainComboLevel: number;
  shotsFired: number;
  shotsHit: number;
  shotsMissed: number;
  powerupsUsed: number;
  powerupEfficiency: number;
  accuracy: number;
  elapsedMs: number;
}

export interface ZumaBoardState {
  phase: ZumaGamePhase;
  status: ZumaGameStatus;
  levelId: string;
  levelNumber: number;
  levelTitle: string;
  mode: ZumaLevelMode;
  trackId: string;
  trackDefinition: ZumaTrackDefinition;
  colorPool: ZumaBallColor[];
  powerupPool: ZumaPowerupType[];
  powerupSpawnChance: number;
  baseSpeed: number;
  elapsedMs: number;
  chains: ZumaBallChain[];
  cannon: ZumaFrogCannon;
  flyingBalls: ZumaFlyingBall[];
  spawnQueue: ZumaSpawnEvent[];
  spawnScriptTemplate: ZumaSpawnEvent[];
  events: ZumaGameEvent[];
  visualEffects: ZumaVisualEffect[];
  score: ZumaScoreRecord;
  dangerLevel: ZumaDangerLevel;
  previousDangerLevel: ZumaDangerLevel;
  dangerPulsePhase: number;
  isPaused: boolean;
  gameSpeed: 1 | 2 | 3;
  timeLimitMs: number | null;
  winCondition: ZumaWinCondition;
  lossCondition: ZumaLossCondition;
  shotLimit: number | null;
  shotsRemaining: number | null;
  chainTarget: number | null;
  chainsCleared: number;
  currentWave: number;
  endlessConfig: ZumaEndlessConfig | null;
  initialBallCount: number;
  debugMode: boolean;
  endReason: ZumaEndReason | null;
}

export const ZUMA_BALL_RADIUS = 12;

export const ZUMA_BALL_SPACING = 24;

export const ZUMA_FLYING_BALL_SPEED = 400;

export const ZUMA_BASE_CHAIN_SPEED = 30;

export const ZUMA_REWIND_SPEED_MULTIPLIER = 2.5;

export const ZUMA_MATCH_MIN_LENGTH = 3;

export const ZUMA_DANGER_THRESHOLDS = {
  safe: 0.35,
  warning: 0.15,
  critical: 0,
};

export const ZUMA_POWERUP_EFFECTS = {
  burst: {
    radius: 60,
    description: '命中后半径范围清除',
  },
  lightning: {
    clearLength: 8,
    description: '沿轨道方向清除一段连续球',
  },
  slow: {
    durationMs: 5000,
    speedMultiplier: 0.3,
    description: '全链减速N秒',
  },
  rewind: {
    distance: 120,
    description: '链头后退固定距离',
  },
  wild: {
    description: '可当任意颜色参与三消',
  },
};

export const ZUMA_SCORE_VALUES = {
  baseClear: 10,
  perBall: 10,
  chainComboMultiplier: 1.5,
  powerupBonus: 50,
  accuracyBonus: 100,
  timeBonusPerSecond: 5,
};

export function getZumaDangerLevel(headDistance: number, finishLineDistance: number, totalLength: number): ZumaDangerLevel {
  const remainingDistance = finishLineDistance - headDistance;
  const remainingRatio = remainingDistance / totalLength;
  
  if (remainingRatio > ZUMA_DANGER_THRESHOLDS.safe) {
    return 'safe';
  }
  if (remainingRatio > ZUMA_DANGER_THRESHOLDS.warning) {
    return 'warning';
  }
  return 'critical';
}

export function createZumaBall(
  ballId: string,
  color: ZumaBallColor | 'wild',
  distanceAlongTrack: number,
  chainId: string,
  indexInChain: number,
  powerupType?: ZumaPowerupType,
): ZumaBall {
  return {
    ballId,
    color,
    state: powerupType ? 'powerup' : 'normal',
    powerupType,
    distanceAlongTrack,
    chainId,
    indexInChain,
    isMarkedForClear: false,
  };
}

export function createZumaChain(
  chainId: string,
  balls: ZumaBall[],
  trackId: string,
  speedFactor: number = 1,
): ZumaBallChain {
  const headDistance = balls.length > 0 ? balls[0].distanceAlongTrack : 0;
  const tailDistance = balls.length > 0 ? balls[balls.length - 1].distanceAlongTrack : 0;
  
  return {
    chainId,
    balls,
    headDistance,
    tailDistance,
    speedFactor,
    temporarySpeedMultiplier: 1,
    isRewinding: false,
    rewindDistanceRemaining: 0,
    slowEffectEndsAtMs: null,
    trackId,
    isOnBranch: false,
  };
}

export function createZumaCannon(
  x: number,
  y: number,
  currentBall: ZumaBallColor | ZumaPowerupType,
  nextBall: ZumaBallColor | ZumaPowerupType,
): ZumaFrogCannon {
  return {
    x,
    y,
    angle: 0,
    currentBall,
    nextBall,
    isReady: true,
    cooldownMs: 0,
  };
}

export function createZumaFlyingBall(
  ballId: string,
  color: ZumaBallColor | ZumaPowerupType,
  startX: number,
  startY: number,
  angle: number,
  speed: number = ZUMA_FLYING_BALL_SPEED,
): ZumaFlyingBall {
  const isPowerup = typeof color === 'string' && ZUMA_POWERUP_TYPES.includes(color as ZumaPowerupType);
  
  return {
    ballId,
    color,
    startX,
    startY,
    currentX: startX,
    currentY: startY,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    speed,
    isPowerup,
    powerupType: isPowerup ? (color as ZumaPowerupType) : undefined,
  };
}

export function createInitialZumaScoreRecord(): ZumaScoreRecord {
  return {
    totalScore: 0,
    chainComboCount: 0,
    maxChainComboLevel: 0,
    shotsFired: 0,
    shotsHit: 0,
    shotsMissed: 0,
    powerupsUsed: 0,
    powerupEfficiency: 0,
    accuracy: 0,
    elapsedMs: 0,
  };
}
