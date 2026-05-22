/* 祖玛模块核心运行时状态管理。包含轨道系统、彩球链推进、回缩逻辑、炮台控制、碰撞判定、消除与连锁。 */

import type {
  ZumaBall,
  ZumaBallChain,
  ZumaBoardState,
  ZumaFlyingBall,
  ZumaFrogCannon,
  ZumaGameEvent,
  ZumaLevelMode,
  ZumaMatchResult,
  ZumaPowerupType,
  ZumaSpawnEvent,
  ZumaTrackDefinition,
  ZumaTrackPoint,
  ZumaBallColor,
  ZumaClearEvent,
  ZumaEndlessConfig,
  ZumaRewindEvent,
  ZumaVisualEffect,
  ZumaWinCondition,
  ZumaLossCondition,
  ZumaLevelDefinition,
  ZumaObjectiveDefinition,
  ZumaObjectiveProgress,
  ZumaEndReason,
} from './zumaTypes.ts';
import {
  ZUMA_BALL_RADIUS,
  ZUMA_BALL_SPACING,
  ZUMA_FLYING_BALL_SPEED,
  ZUMA_MATCH_MIN_LENGTH,
  ZUMA_POWERUP_EFFECTS,
  ZUMA_REWIND_SPEED_MULTIPLIER,
  ZUMA_SCORE_VALUES,
  createInitialZumaScoreRecord,
  createZumaBall,
  createZumaChain,
  createZumaCannon,
  createZumaFlyingBall,
  getZumaDangerLevel,
} from './zumaTypes.ts';
import { getTrackDefinition } from './zumaLevelCatalog.ts';

const CANNON_COOLDOWN_MS = 150;

const ZUMA_OBJECTIVE_LABELS: Record<ZumaObjectiveDefinition['type'], string> = {
  clearAll: '清空全链',
  surviveUntilTime: '撑到倒计时结束',
  maxShots: '限定发射数',
  minChainCount: '连锁次数',
  minPowerupUses: '道具使用',
  scoreThreshold: '目标分数',
};

function generateBallId(): string {
  return `ball-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateChainId(): string {
  return `chain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateEffectId(): string {
  return `effect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createVisualEffect(
  effectType: ZumaVisualEffect['effectType'],
  x: number,
  y: number,
  elapsedMs: number,
  intensity: number,
  options?: { color?: string; text?: string; powerupType?: ZumaPowerupType; durationMs?: number },
): ZumaVisualEffect {
  const durationMap: Record<string, number> = {
    insert: 200,
    clear: 300,
    chainCombo: 400,
    powerup: 500,
    danger: 100,
    scorePopup: 800,
  };

  return {
    effectId: generateEffectId(),
    effectType,
    x,
    y,
    startTimeMs: elapsedMs,
    durationMs: options?.durationMs ?? durationMap[effectType],
    intensity,
    color: options?.color,
    text: options?.text,
    powerupType: options?.powerupType,
    isFinished: false,
  };
}

export function calculateTrackLength(points: ZumaTrackPoint[]): number {
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  return totalLength;
}

export function sampleTrackAtDistance(track: ZumaTrackDefinition, distance: number): ZumaTrackPoint {
  if (distance <= 0) return track.points[0];
  if (distance >= track.totalLength) return track.points[track.points.length - 1];

  let accumulated = 0;
  for (let i = 1; i < track.points.length; i++) {
    const prev = track.points[i - 1];
    const curr = track.points[i];
    const segmentLength = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );

    if (accumulated + segmentLength >= distance) {
      const remaining = distance - accumulated;
      const ratio = remaining / segmentLength;
      return {
        x: prev.x + (curr.x - prev.x) * ratio,
        y: prev.y + (curr.y - prev.y) * ratio,
      };
    }
    accumulated += segmentLength;
  }
  return track.points[track.points.length - 1];
}

export function getTrackTangentAtDistance(track: ZumaTrackDefinition, distance: number): { dx: number; dy: number } {
  const epsilon = 1;
  const p1 = sampleTrackAtDistance(track, distance - epsilon);
  const p2 = sampleTrackAtDistance(track, distance + epsilon);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { dx: 0, dy: -1 };
  return { dx: dx / len, dy: dy / len };
}

export function createDefaultTrack(): ZumaTrackDefinition {
  const points: ZumaTrackPoint[] = [
    { x: 100, y: 50 },
    { x: 200, y: 100 },
    { x: 300, y: 50 },
    { x: 400, y: 150 },
    { x: 500, y: 100 },
    { x: 600, y: 200 },
    { x: 700, y: 150 },
    { x: 800, y: 250 },
  ];
  const totalLength = calculateTrackLength(points);
  return {
    trackId: 'default-track',
    name: '默认轨道',
    points,
    totalLength,
    finishLineDistance: totalLength * 0.85,
    hasBranches: false,
  };
}

function pickRandomColor(colorPool: ZumaBallColor[]): ZumaBallColor {
  return colorPool[Math.floor(Math.random() * colorPool.length)];
}

function pickRandomPowerup(powerupPool: ZumaPowerupType[], chance: number): ZumaPowerupType | undefined {
  if (Math.random() < chance && powerupPool.length > 0) {
    return powerupPool[Math.floor(Math.random() * powerupPool.length)];
  }
  return undefined;
}

function generateInitialChain(
  trackId: string,
  colorPool: ZumaBallColor[],
  ballCount: number,
  startDistance: number,
  powerupPool: ZumaPowerupType[],
  powerupChance: number,
  baseSpeed: number = 1.0,
): ZumaBallChain {
  const chainId = generateChainId();
  const balls: ZumaBall[] = [];

  for (let i = 0; i < ballCount; i++) {
    const distance = startDistance - i * ZUMA_BALL_SPACING;
    const color = pickRandomColor(colorPool);
    const powerupType = pickRandomPowerup(powerupPool, powerupChance);
    const ballId = generateBallId();

    balls.push(createZumaBall(ballId, color, distance, chainId, i, powerupType));
  }

  return createZumaChain(chainId, balls, trackId, baseSpeed);
}

function generateCannonBalls(
  colorPool: ZumaBallColor[],
  powerupPool: ZumaPowerupType[],
  powerupChance: number,
): { current: ZumaBallColor | ZumaPowerupType; next: ZumaBallColor | ZumaPowerupType } {
  const currentPowerup = pickRandomPowerup(powerupPool, powerupChance);
  const nextPowerup = pickRandomPowerup(powerupPool, powerupChance);

  return {
    current: currentPowerup || pickRandomColor(colorPool),
    next: nextPowerup || pickRandomColor(colorPool),
  };
}

function getWinObjectives(
  winCondition: ZumaWinCondition,
  timeLimitMs: number | null,
  shotLimit: number | null,
  chainTarget: number | null,
): ZumaObjectiveDefinition[] {
  if (winCondition.type === 'multiObjective' && winCondition.objectives && winCondition.objectives.length > 0) {
    return winCondition.objectives.map((objective) => ({ ...objective }));
  }

  switch (winCondition.type) {
    case 'timeLimit':
      return [{
        type: 'surviveUntilTime',
        targetValue: timeLimitMs ?? winCondition.targetValue,
      }];
    case 'chainCount':
      return [
        { type: 'clearAll', targetValue: 0 },
        { type: 'minChainCount', targetValue: chainTarget ?? winCondition.targetValue },
      ];
    case 'shotCount':
      return [
        { type: 'clearAll', targetValue: 0 },
        { type: 'maxShots', targetValue: shotLimit ?? winCondition.targetValue },
      ];
    case 'clearAll':
    default:
      return [{ type: 'clearAll', targetValue: winCondition.targetValue }];
  }
}

function getShotLimitFromObjectives(objectives: ZumaObjectiveDefinition[], fallback: number | null): number | null {
  const maxShotsObjective = objectives.find((objective) => objective.type === 'maxShots');
  return maxShotsObjective?.targetValue ?? fallback;
}

function getChainTargetFromObjectives(objectives: ZumaObjectiveDefinition[], fallback: number | null): number | null {
  const chainObjective = objectives.find((objective) => objective.type === 'minChainCount');
  return chainObjective?.targetValue ?? fallback;
}

type CreateZumaBoardOptions = {
  levelId?: string;
  mode?: ZumaLevelMode;
  trackId?: string;
  colorPool?: ZumaBallColor[];
  powerupPool?: ZumaPowerupType[];
  powerupSpawnChance?: number;
  baseSpeed?: number;
  timeLimitMs?: number;
  shotLimit?: number;
  levelNumber?: number;
  levelTitle?: string;
  spawnScript?: ZumaSpawnEvent[];
  initialBallCount?: number;
  winCondition?: ZumaWinCondition;
  lossCondition?: ZumaLossCondition;
  endlessConfig?: ZumaEndlessConfig;
};

export function createZumaBoardState(options: CreateZumaBoardOptions = {}): ZumaBoardState {
  const track = options.trackId ? getTrackDefinition(options.trackId) || createDefaultTrack() : createDefaultTrack();
  const colorPool: ZumaBallColor[] = options.colorPool || ['red', 'blue', 'green'];
  const powerupPool: ZumaPowerupType[] = options.powerupPool || ['burst', 'slow'];
  const powerupChance = options.powerupSpawnChance ?? 0.05;
  const baseSpeed = options.baseSpeed || 1.0;
  const initialBallCount = options.initialBallCount || 15;
  const startDistance = track.totalLength * 0.3;
  const spawnQueue = (options.spawnScript || []).map((event) => ({ ...event }));
  const requestedShotLimit = options.shotLimit ?? null;
  const requestedChainTarget = options.winCondition?.type === 'multiObjective'
    ? options.winCondition.objectives?.find((objective) => objective.type === 'minChainCount')?.targetValue ?? null
    : null;
  const winCondition: ZumaWinCondition = options.winCondition || {
    type: 'clearAll',
    targetValue: 0,
  };
  const lossCondition: ZumaLossCondition = options.lossCondition || {
    type: 'reachFinish',
    finishLineDistance: track.finishLineDistance,
  };
  const objectives = getWinObjectives(winCondition, options.timeLimitMs ?? null, requestedShotLimit, requestedChainTarget);
  const shotLimit = getShotLimitFromObjectives(objectives, requestedShotLimit);
  const chainTarget = getChainTargetFromObjectives(objectives, requestedChainTarget);

  const initialChain = generateInitialChain(
    track.trackId,
    colorPool,
    initialBallCount,
    startDistance,
    powerupPool,
    powerupChance,
    baseSpeed,
  );

  const cannonBalls = generateCannonBalls(colorPool, powerupPool, powerupChance);
  const cannon = createZumaCannon(track.points[0].x, track.points[0].y, cannonBalls.current, cannonBalls.next);
  const events: ZumaGameEvent[] = [];

  return {
    phase: 'setup',
    status: 'playing',
    levelId: options.levelId || 'level-001',
    levelNumber: options.levelNumber || 1,
    levelTitle: options.levelTitle || '神庙入门',
    mode: options.mode || 'adventure',
    trackId: track.trackId,
    trackDefinition: track,
    colorPool,
    powerupPool,
    powerupSpawnChance: powerupChance,
    baseSpeed,
    elapsedMs: 0,
    chains: [initialChain],
    cannon,
    flyingBalls: [],
    spawnQueue,
    spawnScriptTemplate: spawnQueue.map((event) => ({ ...event })),
    events,
    visualEffects: [],
    score: createInitialZumaScoreRecord(),
    dangerLevel: 'safe',
    previousDangerLevel: 'safe',
    dangerPulsePhase: 0,
    isPaused: false,
    gameSpeed: 1,
    timeLimitMs: options.timeLimitMs || null,
    winCondition,
    lossCondition,
    shotLimit,
    shotsRemaining: shotLimit,
    chainTarget,
    chainsCleared: 0,
    currentWave: options.mode === 'endless' ? options.endlessConfig?.startWave ?? 1 : 0,
    endlessConfig: options.endlessConfig ?? null,
    initialBallCount,
    debugMode: false,
    endReason: null,
  };
}

export function createZumaBoardStateFromLevel(level: ZumaLevelDefinition): ZumaBoardState {
  return createZumaBoardState({
    levelId: level.levelId,
    mode: level.mode,
    trackId: level.trackId,
    colorPool: level.colorPool,
    powerupPool: level.powerupPool,
    powerupSpawnChance: level.powerupSpawnChance,
    baseSpeed: level.baseSpeed,
    timeLimitMs: level.timeLimitMs,
    shotLimit: level.shotLimit,
    levelNumber: level.levelNumber,
    levelTitle: level.title,
    spawnScript: level.spawnScript,
    initialBallCount: level.initialBallCount,
    winCondition: level.winCondition,
    lossCondition: level.lossCondition,
    endlessConfig: level.endlessConfig,
  });
}

export function createZumaSetupBoardState(mode: ZumaLevelMode): ZumaBoardState {
  const levelTitle = mode === 'timed'
    ? '选择计时地图'
    : mode === 'challenge'
      ? '选择挑战试炼'
      : mode === 'endless'
        ? '选择无尽模式'
        : mode === 'practice'
          ? '选择练习项目'
          : '选择关卡';
  return createZumaBoardState({
    mode,
    levelTitle,
    spawnScript: [],
  });
}

export function startZumaGame(state: ZumaBoardState): ZumaBoardState {
  if (state.phase !== 'setup') return state;
  return {
    ...state,
    phase: 'playing',
    elapsedMs: 0,
  };
}

export function resetZumaGame(state: ZumaBoardState): ZumaBoardState {
  return createZumaBoardState({
    levelId: state.levelId,
    mode: state.mode,
    trackId: state.trackId,
    colorPool: state.colorPool,
    powerupPool: state.powerupPool,
    powerupSpawnChance: state.powerupSpawnChance,
    baseSpeed: state.baseSpeed,
    timeLimitMs: state.timeLimitMs ?? undefined,
    shotLimit: state.shotLimit ?? undefined,
    levelNumber: state.levelNumber,
    levelTitle: state.levelTitle,
    spawnScript: state.spawnScriptTemplate,
    initialBallCount: state.initialBallCount,
    winCondition: state.winCondition,
    lossCondition: state.lossCondition,
    endlessConfig: state.endlessConfig ?? undefined,
  });
}

export function toggleZumaPause(state: ZumaBoardState): ZumaBoardState {
  return { ...state, isPaused: !state.isPaused };
}

export function setZumaGameSpeed(state: ZumaBoardState, speed: 1 | 2 | 3): ZumaBoardState {
  return { ...state, gameSpeed: speed };
}

export function rotateCannon(state: ZumaBoardState, angle: number): ZumaBoardState {
  return {
    ...state,
    cannon: { ...state.cannon, angle },
  };
}

export function rotateCannonToTarget(state: ZumaBoardState, targetX: number, targetY: number): ZumaBoardState {
  const dx = targetX - state.cannon.x;
  const dy = targetY - state.cannon.y;
  const angle = Math.atan2(dy, dx);
  return rotateCannon(state, angle);
}

export function fireCannon(state: ZumaBoardState): ZumaBoardState {
  if (state.phase !== 'playing') return state;
  if (!state.cannon.isReady) return state;
  if (state.flyingBalls.length > 0) return state;
  if (state.shotsRemaining !== null && state.shotsRemaining <= 0) return state;

  const ballId = generateBallId();
  const flyingBall = createZumaFlyingBall(
    ballId,
    state.cannon.currentBall,
    state.cannon.x,
    state.cannon.y,
    state.cannon.angle,
    ZUMA_FLYING_BALL_SPEED,
  );

  const newCannonBalls = generateCannonBalls(state.colorPool, state.powerupPool, state.powerupSpawnChance);
  const newCannon: ZumaFrogCannon = {
    ...state.cannon,
    currentBall: state.cannon.nextBall,
    nextBall: newCannonBalls.next,
    isReady: false,
    cooldownMs: CANNON_COOLDOWN_MS,
  };

  const event: ZumaGameEvent = {
    eventType: 'SHOT_FIRED',
    timestampMs: state.elapsedMs,
    data: flyingBall,
  };

  return {
    ...state,
    cannon: newCannon,
    flyingBalls: [flyingBall],
    events: [...state.events, event],
    score: {
      ...state.score,
      shotsFired: state.score.shotsFired + 1,
    },
    shotsRemaining: state.shotsRemaining !== null ? state.shotsRemaining - 1 : null,
  };
}

export function swapCannonBalls(state: ZumaBoardState): ZumaBoardState {
  if (state.phase !== 'playing') return state;
  if (!state.cannon.isReady) return state;

  return {
    ...state,
    cannon: {
      ...state.cannon,
      currentBall: state.cannon.nextBall,
      nextBall: state.cannon.currentBall,
    },
  };
}

function updateCannonCooldown(state: ZumaBoardState, elapsedMs: number): ZumaBoardState {
  if (state.cannon.isReady) return state;

  const remainingCooldown = state.cannon.cooldownMs - elapsedMs;
  if (remainingCooldown <= 0) {
    return {
      ...state,
      cannon: { ...state.cannon, isReady: true, cooldownMs: 0 },
    };
  }
  return {
    ...state,
    cannon: { ...state.cannon, cooldownMs: remainingCooldown },
  };
}

function moveFlyingBalls(state: ZumaBoardState, elapsedMs: number): ZumaBoardState {
  if (state.flyingBalls.length === 0) return state;

  const deltaSeconds = elapsedMs / 1000;
  const updatedBalls = state.flyingBalls.map((ball) => ({
    ...ball,
    currentX: ball.currentX + ball.velocityX * deltaSeconds,
    currentY: ball.currentY + ball.velocityY * deltaSeconds,
  }));

  const outOfBoundsBalls = updatedBalls.filter((ball) => 
    ball.currentX < 0 || ball.currentX > 900 || ball.currentY < 0 || ball.currentY > 400
  );

  if (outOfBoundsBalls.length > 0) {
    const remainingBalls = updatedBalls.filter((ball) => 
      ball.currentX >= 0 && ball.currentX <= 900 && ball.currentY >= 0 && ball.currentY <= 400
    );
    
    const missedCount = outOfBoundsBalls.length;
    return {
      ...state,
      flyingBalls: remainingBalls,
      score: {
        ...state.score,
        shotsMissed: state.score.shotsMissed + missedCount,
      },
    };
  }

  return { ...state, flyingBalls: updatedBalls };
}

function getBallPositionOnTrack(track: ZumaTrackDefinition, distance: number): { x: number; y: number } {
  const point = sampleTrackAtDistance(track, distance);
  return { x: point.x, y: point.y };
}

function checkFlyingBallChainCollision(
  flyingBall: ZumaFlyingBall,
  chain: ZumaBallChain,
  track: ZumaTrackDefinition,
): { hit: boolean; insertIndex: number; insertDistance: number; hitBall: ZumaBall | null } {
  for (let i = 0; i < chain.balls.length; i++) {
    const ball = chain.balls[i];
    const ballPos = getBallPositionOnTrack(track, ball.distanceAlongTrack);
    
    const dx = flyingBall.currentX - ballPos.x;
    const dy = flyingBall.currentY - ballPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ZUMA_BALL_RADIUS * 2) {
      const tangent = getTrackTangentAtDistance(track, ball.distanceAlongTrack);
      const dotProduct = dx * tangent.dx + dy * tangent.dy;
      
      let insertIndex: number;
      let insertDistance: number;

      if (dotProduct > 0) {
        insertIndex = i;
        insertDistance = ball.distanceAlongTrack + ZUMA_BALL_SPACING * 0.5;
      } else {
        insertIndex = i + 1;
        insertDistance = ball.distanceAlongTrack - ZUMA_BALL_SPACING * 0.5;
      }

      return {
        hit: true,
        insertIndex,
        insertDistance,
        hitBall: ball,
      };
    }
  }

  return { hit: false, insertIndex: -1, insertDistance: -1, hitBall: null };
}

function insertBallIntoChain(
  chain: ZumaBallChain,
  ballColor: ZumaBallColor | ZumaPowerupType,
  insertIndex: number,
  insertDistance: number,
  isPowerup: boolean,
  powerupType?: ZumaPowerupType,
): ZumaBallChain {
  const ballId = generateBallId();
  const color = isPowerup ? 'wild' : (ballColor as ZumaBallColor);
  
  const newBall = createZumaBall(
    ballId,
    color,
    insertDistance,
    chain.chainId,
    insertIndex,
    isPowerup ? powerupType : undefined,
  );

  const newBalls = [...chain.balls];
  newBalls.splice(insertIndex, 0, newBall);

  for (let i = 0; i < newBalls.length; i++) {
    newBalls[i] = { ...newBalls[i], indexInChain: i };
  }

  const headDistance = newBalls.length > 0 ? newBalls[0].distanceAlongTrack : 0;
  const tailDistance = newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : 0;

  return {
    ...chain,
    balls: newBalls,
    headDistance,
    tailDistance,
  };
}

function scanForMatches(chain: ZumaBallChain, insertIndex: number): ZumaMatchResult | null {
  if (chain.balls.length === 0) return null;

  const insertBall = chain.balls[insertIndex];
  const matchColor = insertBall.color;

  let leftCount = 0;
  for (let i = insertIndex - 1; i >= 0; i--) {
    const ball = chain.balls[i];
    if (ball.color === matchColor || ball.color === 'wild') {
      leftCount++;
    } else {
      break;
    }
  }

  let rightCount = 0;
  for (let i = insertIndex + 1; i < chain.balls.length; i++) {
    const ball = chain.balls[i];
    if (ball.color === matchColor || ball.color === 'wild') {
      rightCount++;
    } else {
      break;
    }
  }

  const totalMatchLength = leftCount + 1 + rightCount;
  if (totalMatchLength < ZUMA_MATCH_MIN_LENGTH) return null;

  const matchedBallIds: string[] = [];
  for (let i = insertIndex - leftCount; i <= insertIndex + rightCount; i++) {
    matchedBallIds.push(chain.balls[i].ballId);
  }

  return {
    matchedBalls: matchedBallIds,
    matchColor,
    matchLength: totalMatchLength,
    insertPointIndex: insertIndex,
    chainId: chain.chainId,
  };
}

function removeBallsFromChain(chain: ZumaBallChain, ballIds: string[]): ZumaBallChain {
  const remainingBalls = chain.balls.filter((ball) => !ballIds.includes(ball.ballId));

  for (let i = 0; i < remainingBalls.length; i++) {
    remainingBalls[i] = { ...remainingBalls[i], indexInChain: i };
  }

  const headDistance = remainingBalls.length > 0 ? remainingBalls[0].distanceAlongTrack : 0;
  const tailDistance = remainingBalls.length > 0 ? remainingBalls[remainingBalls.length - 1].distanceAlongTrack : 0;

  return {
    ...chain,
    balls: remainingBalls,
    headDistance,
    tailDistance,
  };
}

function calculateClearScore(matchLength: number, chainComboLevel: number): number {
  const baseScore = matchLength * ZUMA_SCORE_VALUES.perBall;
  const comboMultiplier = Math.pow(ZUMA_SCORE_VALUES.chainComboMultiplier, chainComboLevel);
  return Math.floor(baseScore * comboMultiplier);
}

function checkForGaps(chain: ZumaBallChain): { hasGap: boolean; gapStartIndex: number; gapDistance: number } {
  for (let i = 0; i < chain.balls.length - 1; i++) {
    const currentBall = chain.balls[i];
    const nextBall = chain.balls[i + 1];
    const expectedDistance = currentBall.distanceAlongTrack - ZUMA_BALL_SPACING;
    const actualGap = nextBall.distanceAlongTrack - expectedDistance;

    if (actualGap > ZUMA_BALL_SPACING * 0.5) {
      return {
        hasGap: true,
        gapStartIndex: i,
        gapDistance: actualGap,
      };
    }
  }
  return { hasGap: false, gapStartIndex: -1, gapDistance: 0 };
}

function rewindChain(chain: ZumaBallChain, rewindDistance: number): ZumaBallChain {
  const newBalls = chain.balls.map((ball) => ({
    ...ball,
    distanceAlongTrack: ball.distanceAlongTrack + rewindDistance,
  }));

  const headDistance = newBalls.length > 0 ? newBalls[0].distanceAlongTrack : 0;
  const tailDistance = newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : 0;

  return {
    ...chain,
    balls: newBalls,
    headDistance,
    tailDistance,
    isRewinding: true,
    rewindDistanceRemaining: rewindDistance,
  };
}

function closeGapInChain(chain: ZumaBallChain, gapStartIndex: number, gapDistance: number): ZumaBallChain {
  const ballsAfterGap = chain.balls.slice(gapStartIndex + 1);
  const rewindAmount = gapDistance;

  const rewoundBalls = ballsAfterGap.map((ball) => ({
    ...ball,
    distanceAlongTrack: ball.distanceAlongTrack + rewindAmount,
  }));

  const newBalls = [...chain.balls.slice(0, gapStartIndex + 1), ...rewoundBalls];

  for (let i = 0; i < newBalls.length; i++) {
    newBalls[i] = { ...newBalls[i], indexInChain: i };
  }

  const headDistance = newBalls.length > 0 ? newBalls[0].distanceAlongTrack : 0;
  const tailDistance = newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : 0;

  return {
    ...chain,
    balls: newBalls,
    headDistance,
    tailDistance,
    isRewinding: true,
    rewindDistanceRemaining: rewindAmount,
  };
}

function processFlyingBallCollisions(state: ZumaBoardState): ZumaBoardState {
  if (state.flyingBalls.length === 0) return state;

  let newState = state;
  const processedBallIds: string[] = [];
  const clearEvents: ZumaClearEvent[] = [];
  const rewindEvents: ZumaRewindEvent[] = [];
  const newVisualEffects: ZumaVisualEffect[] = [];
  let chainComboLevel = 0;

  for (const flyingBall of state.flyingBalls) {
    for (const chain of state.chains) {
      const collision = checkFlyingBallChainCollision(flyingBall, chain, state.trackDefinition);

      if (collision.hit) {
        processedBallIds.push(flyingBall.ballId);

        const hitPos = sampleTrackAtDistance(state.trackDefinition, collision.insertDistance);
        const insertEffect = createVisualEffect('insert', hitPos.x, hitPos.y, state.elapsedMs, 1, {
          color: String(flyingBall.color),
        });
        newVisualEffects.push(insertEffect);

        const isPowerup = flyingBall.isPowerup;
        const powerupType = flyingBall.powerupType;

        if (isPowerup && powerupType) {
          const powerupEffect = createVisualEffect('powerup', hitPos.x, hitPos.y, state.elapsedMs, 1, { powerupType });
          newVisualEffects.push(powerupEffect);
          newState = processPowerupTrigger({
            ...newState,
            score: {
              ...newState.score,
              shotsHit: newState.score.shotsHit + 1,
            },
          }, chain, powerupType, collision.insertDistance);
        } else {
          const updatedChain = insertBallIntoChain(
            chain,
            flyingBall.color,
            collision.insertIndex,
            collision.insertDistance,
            isPowerup,
            powerupType,
          );

          newState = {
            ...newState,
            chains: newState.chains.map((c) => 
              c.chainId === chain.chainId ? updatedChain : c
            ),
          };

          const matchResult = scanForMatches(updatedChain, collision.insertIndex);
          if (matchResult) {
            chainComboLevel = 1;
            const score = calculateClearScore(matchResult.matchLength, chainComboLevel);

            const clearPos = sampleTrackAtDistance(state.trackDefinition, collision.insertDistance);
            const clearEffect = createVisualEffect('clear', clearPos.x, clearPos.y, state.elapsedMs, matchResult.matchLength, {
              color: String(matchResult.matchColor),
            });
            newVisualEffects.push(clearEffect);

            const scoreEffect = createVisualEffect('scorePopup', clearPos.x, clearPos.y - 20, state.elapsedMs, 1, { text: `+${score}` });
            newVisualEffects.push(scoreEffect);

            const clearedChain = removeBallsFromChain(updatedChain, matchResult.matchedBalls);
            newState = {
              ...newState,
              chains: newState.chains.map((c) => 
                c.chainId === chain.chainId ? clearedChain : c
              ),
              score: {
                ...newState.score,
                totalScore: newState.score.totalScore + score,
                shotsHit: newState.score.shotsHit + 1,
                chainComboCount: newState.score.chainComboCount + 1,
                maxChainComboLevel: Math.max(newState.score.maxChainComboLevel, chainComboLevel),
              },
            };

            clearEvents.push({
              clearedBallIds: matchResult.matchedBalls,
              chainId: chain.chainId,
              clearPosition: collision.insertDistance,
              score,
              chainComboLevel,
            });

            const gapCheck = checkForGaps(clearedChain);
            if (gapCheck.hasGap && !clearedChain.isRewinding) {
              const rewoundChain = closeGapInChain(clearedChain, gapCheck.gapStartIndex, gapCheck.gapDistance);
              newState = {
                ...newState,
                chains: newState.chains.map((c) => 
                  c.chainId === chain.chainId ? rewoundChain : c
                ),
              };

              rewindEvents.push({
                chainId: chain.chainId,
                rewindDistance: gapCheck.gapDistance,
                gapClosed: true,
                triggeredChainCombo: false,
              });

              const afterRewindMatch = scanForMatchesAfterRewind(rewoundChain, gapCheck.gapStartIndex);
              if (afterRewindMatch) {
                chainComboLevel++;
                const comboScore = calculateClearScore(afterRewindMatch.matchLength, chainComboLevel);

                const junctionPos = sampleTrackAtDistance(state.trackDefinition, rewoundChain.balls[gapCheck.gapStartIndex]?.distanceAlongTrack || 0);
                const comboEffect = createVisualEffect('chainCombo', junctionPos.x, junctionPos.y, state.elapsedMs, chainComboLevel, {
                  color: String(afterRewindMatch.matchColor),
                });
                newVisualEffects.push(comboEffect);

                const comboScoreEffect = createVisualEffect('scorePopup', junctionPos.x, junctionPos.y - 30, state.elapsedMs, chainComboLevel, { text: `+${comboScore} 连锁!` });
                newVisualEffects.push(comboScoreEffect);

                const finalChain = removeBallsFromChain(rewoundChain, afterRewindMatch.matchedBalls);
                newState = {
                  ...newState,
                  chains: newState.chains.map((c) => 
                    c.chainId === chain.chainId ? finalChain : c
                  ),
                  score: {
                    ...newState.score,
                    totalScore: newState.score.totalScore + comboScore,
                    chainComboCount: newState.score.chainComboCount + 1,
                    maxChainComboLevel: Math.max(newState.score.maxChainComboLevel, chainComboLevel),
                  },
                };

                clearEvents.push({
                  clearedBallIds: afterRewindMatch.matchedBalls,
                  chainId: chain.chainId,
                  clearPosition: gapCheck.gapStartIndex,
                  score: comboScore,
                  chainComboLevel,
                });
              }
            }
          } else {
            newState = {
              ...newState,
              score: {
                ...newState.score,
                shotsHit: newState.score.shotsHit + 1,
              },
            };
          }
        }
        break;
      }
    }
  }

  if (processedBallIds.length > 0) {
    const remainingFlyingBalls = newState.flyingBalls.filter(
      (ball) => !processedBallIds.includes(ball.ballId)
    );
    newState = { ...newState, flyingBalls: remainingFlyingBalls };

    if (newVisualEffects.length > 0) {
      newState = {
        ...newState,
        visualEffects: [...newState.visualEffects, ...newVisualEffects],
      };
    }

    for (const clearEvent of clearEvents) {
      const event: ZumaGameEvent = {
        eventType: 'MATCH_CLEARED',
        timestampMs: newState.elapsedMs,
        data: clearEvent,
      };
      newState = { ...newState, events: [...newState.events, event] };
    }

    for (const rewindEvent of rewindEvents) {
      const event: ZumaGameEvent = {
        eventType: 'CHAIN_REWIND',
        timestampMs: newState.elapsedMs,
        data: rewindEvent,
      };
      newState = { ...newState, events: [...newState.events, event] };
    }
  }

  return newState;
}

function scanForMatchesAfterRewind(chain: ZumaBallChain, junctionIndex: number): ZumaMatchResult | null {
  if (chain.balls.length === 0) return null;
  if (junctionIndex < 0 || junctionIndex >= chain.balls.length - 1) return null;

  const leftBall = chain.balls[junctionIndex];
  const rightBall = chain.balls[junctionIndex + 1];

  if (leftBall.color !== rightBall.color && leftBall.color !== 'wild' && rightBall.color !== 'wild') {
    return null;
  }

  const matchColor = leftBall.color === 'wild' ? rightBall.color : leftBall.color;

  let leftCount = 0;
  for (let i = junctionIndex; i >= 0; i--) {
    const ball = chain.balls[i];
    if (ball.color === matchColor || ball.color === 'wild') {
      leftCount++;
    } else {
      break;
    }
  }

  let rightCount = 0;
  for (let i = junctionIndex + 1; i < chain.balls.length; i++) {
    const ball = chain.balls[i];
    if (ball.color === matchColor || ball.color === 'wild') {
      rightCount++;
    } else {
      break;
    }
  }

  const totalMatchLength = leftCount + rightCount;
  if (totalMatchLength < ZUMA_MATCH_MIN_LENGTH) return null;

  const matchedBallIds: string[] = [];
  for (let i = junctionIndex - leftCount + 1; i <= junctionIndex + rightCount; i++) {
    matchedBallIds.push(chain.balls[i].ballId);
  }

  return {
    matchedBalls: matchedBallIds,
    matchColor,
    matchLength: totalMatchLength,
    insertPointIndex: junctionIndex,
    chainId: chain.chainId,
  };
}

function processPowerupTrigger(
  state: ZumaBoardState,
  chain: ZumaBallChain,
  powerupType: ZumaPowerupType,
  triggerDistance: number,
): ZumaBoardState {
  let newState = state;
  let clearedBallIds: string[] = [];
  let score = ZUMA_SCORE_VALUES.powerupBonus;

  switch (powerupType) {
    case 'burst': {
      const burstRadius = ZUMA_POWERUP_EFFECTS.burst.radius;
      clearedBallIds = chain.balls
        .filter((ball) => Math.abs(ball.distanceAlongTrack - triggerDistance) < burstRadius)
        .map((ball) => ball.ballId);
      break;
    }
    case 'lightning': {
      const clearLength = ZUMA_POWERUP_EFFECTS.lightning.clearLength;
      const triggerIndex = chain.balls.findIndex(
        (ball) => Math.abs(ball.distanceAlongTrack - triggerDistance) < ZUMA_BALL_SPACING
      );
      if (triggerIndex >= 0) {
        const startIndex = Math.max(0, triggerIndex - Math.floor(clearLength / 2));
        const endIndex = Math.min(chain.balls.length, triggerIndex + Math.floor(clearLength / 2));
        clearedBallIds = chain.balls.slice(startIndex, endIndex).map((ball) => ball.ballId);
      }
      break;
    }
    case 'slow': {
      newState = {
        ...newState,
        chains: newState.chains.map((c) =>
          c.chainId === chain.chainId
            ? {
              ...c,
              temporarySpeedMultiplier: ZUMA_POWERUP_EFFECTS.slow.speedMultiplier,
              slowEffectEndsAtMs: newState.elapsedMs + ZUMA_POWERUP_EFFECTS.slow.durationMs,
            }
            : c
        ),
      };
      break;
    }
    case 'rewind': {
      const rewindDistance = ZUMA_POWERUP_EFFECTS.rewind.distance;
      const rewoundChain = rewindChain(chain, rewindDistance);
      newState = {
        ...newState,
        chains: newState.chains.map((c) =>
          c.chainId === chain.chainId ? rewoundChain : c
        ),
      };
      break;
    }
    case 'wild': {
      const nearestBallIndex = chain.balls.findIndex(
        (ball) => Math.abs(ball.distanceAlongTrack - triggerDistance) < ZUMA_BALL_SPACING
      );
      if (nearestBallIndex >= 0) {
        const updatedChain = insertBallIntoChain(
          chain,
          'wild',
          nearestBallIndex,
          triggerDistance,
          true,
          'wild',
        );
        newState = {
          ...newState,
          chains: newState.chains.map((c) =>
            c.chainId === chain.chainId ? updatedChain : c
          ),
        };

        const matchResult = scanForMatches(updatedChain, nearestBallIndex);
        if (matchResult) {
          clearedBallIds = matchResult.matchedBalls;
          score += calculateClearScore(matchResult.matchLength, 1);
        }
      }
      break;
    }
  }

  if (clearedBallIds.length > 0) {
    const clearedChain = removeBallsFromChain(chain, clearedBallIds);
    newState = {
      ...newState,
      chains: newState.chains.map((c) =>
        c.chainId === chain.chainId ? clearedChain : c
      ),
      score: {
        ...newState.score,
        totalScore: newState.score.totalScore + score,
        powerupsUsed: newState.score.powerupsUsed + 1,
      },
    };

    const clearEvent: ZumaClearEvent = {
      clearedBallIds,
      chainId: chain.chainId,
      clearPosition: triggerDistance,
      score,
      chainComboLevel: 0,
    };

    const event: ZumaGameEvent = {
      eventType: 'POWERUP_TRIGGERED',
      timestampMs: newState.elapsedMs,
      data: clearEvent,
    };
    newState = { ...newState, events: [...newState.events, event] };
    return newState;
  }

  const event: ZumaGameEvent = {
    eventType: 'POWERUP_TRIGGERED',
    timestampMs: newState.elapsedMs,
    data: null,
  };

  return {
    ...newState,
    events: [...newState.events, event],
    score: {
      ...newState.score,
      totalScore: newState.score.totalScore + score,
      powerupsUsed: newState.score.powerupsUsed + 1,
    },
  };
}

function advanceChains(state: ZumaBoardState, elapsedMs: number): ZumaBoardState {
  const deltaSeconds = elapsedMs / 1000;
  const baseMovement = deltaSeconds;

  const updatedChains = state.chains.map((chain) => {
    if (chain.balls.length === 0) return chain;

    const slowExpired = chain.slowEffectEndsAtMs !== null && state.elapsedMs >= chain.slowEffectEndsAtMs;
    const temporarySpeedMultiplier = slowExpired ? 1 : chain.temporarySpeedMultiplier;
    const forwardSpeed = chain.speedFactor * temporarySpeedMultiplier * baseMovement;
    let movementDelta = forwardSpeed;

    if (chain.isRewinding) {
      const rewindStep = Math.min(chain.rewindDistanceRemaining, forwardSpeed * ZUMA_REWIND_SPEED_MULTIPLIER);
      movementDelta = -rewindStep;
      const remainingRewind = chain.rewindDistanceRemaining - rewindStep;

      if (remainingRewind <= 0) {
        const newBalls = chain.balls.map((ball) => ({
          ...ball,
          distanceAlongTrack: ball.distanceAlongTrack - chain.rewindDistanceRemaining,
        }));

        const headDistance = newBalls.length > 0 ? newBalls[0].distanceAlongTrack : 0;
        const tailDistance = newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : 0;

        return {
          ...chain,
          balls: newBalls,
          headDistance,
          tailDistance,
          temporarySpeedMultiplier,
          isRewinding: false,
          rewindDistanceRemaining: 0,
          slowEffectEndsAtMs: slowExpired ? null : chain.slowEffectEndsAtMs,
        };
      }
    }

    const newBalls = chain.balls.map((ball) => ({
      ...ball,
      distanceAlongTrack: ball.distanceAlongTrack + movementDelta,
    }));

    const headDistance = newBalls.length > 0 ? newBalls[0].distanceAlongTrack : 0;
    const tailDistance = newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : 0;

    return {
      ...chain,
      balls: newBalls,
      headDistance,
      tailDistance,
      temporarySpeedMultiplier,
      rewindDistanceRemaining: chain.isRewinding ? Math.max(0, chain.rewindDistanceRemaining - Math.abs(movementDelta)) : 0,
      slowEffectEndsAtMs: slowExpired ? null : chain.slowEffectEndsAtMs,
    };
  });

  return { ...state, chains: updatedChains };
}

function getTotalRemainingBalls(state: ZumaBoardState): number {
  return state.chains.reduce((sum, chain) => sum + chain.balls.length, 0);
}

function hasCompletedSpawnQueue(state: ZumaBoardState): boolean {
  return state.spawnQueue.length === 0;
}

function createEndlessWaveSpawnScript(
  state: ZumaBoardState,
  wave: number,
): ZumaSpawnEvent[] {
  const config = state.endlessConfig;
  if (!config) {
    return [];
  }

  const colorCount = Math.min(state.colorPool.length, Math.max(3, Math.min(config.maxColorCount, 3 + Math.floor((wave - 1) / 2))));
  const waveColors = state.colorPool.slice(0, colorCount);
  const stageBallCounts = [
    12 + wave * config.waveBallStep,
    14 + wave * config.waveBallStep,
    10 + wave * config.waveBallStep,
  ];
  const stageIntervals = [
    Math.max(config.baseBatchIntervalMs - wave * 180, 2400),
    Math.max(config.baseBatchIntervalMs - wave * 280, 1800),
    Math.max(config.baseBatchIntervalMs - wave * 360, 1300),
  ];
  const stageBatchSizes = [
    4 + Math.floor((wave - 1) / 3),
    5 + Math.floor((wave - 1) / 3),
    5 + Math.floor((wave - 1) / 2),
  ];

  const events: ZumaSpawnEvent[] = [];
  let offsetMs = state.elapsedMs + 400;

  stageBallCounts.forEach((totalBalls, stageIndex) => {
    const batchSize = stageBatchSizes[stageIndex];
    const batches = Math.ceil(totalBalls / batchSize);
    for (let i = 0; i < batches; i++) {
      events.push({
        eventId: `endless-wave-${wave}-stage-${stageIndex + 1}-batch-${i + 1}`,
        color: waveColors[(stageIndex + i) % waveColors.length],
        count: Math.min(batchSize, totalBalls - i * batchSize),
        spawnAtMs: offsetMs + i * stageIntervals[stageIndex],
        powerupChance: Math.min(0.08 + wave * 0.01, 0.28),
      });
    }
    offsetMs += batches * stageIntervals[stageIndex] + 600;
  });

  return events;
}

function tryStartNextEndlessWave(state: ZumaBoardState): ZumaBoardState {
  if (state.mode !== 'endless' || state.endlessConfig === null) {
    return state;
  }
  if (state.spawnQueue.length > 0 || state.flyingBalls.length > 0 || getTotalRemainingBalls(state) > 0) {
    return state;
  }

  const nextWave = Math.max(1, state.currentWave + 1);
  return {
    ...state,
    currentWave: nextWave,
    baseSpeed: state.baseSpeed * (1 + state.endlessConfig.waveSpeedStep),
    spawnQueue: createEndlessWaveSpawnScript(state, nextWave),
  };
}

function getConstraintFailure(progress: ZumaObjectiveProgress[]): ZumaObjectiveProgress | null {
  return progress.find((objective) => objective.failed) ?? null;
}

function getObjectiveLabel(objective: ZumaObjectiveDefinition): string {
  return objective.label ?? ZUMA_OBJECTIVE_LABELS[objective.type];
}

export function getZumaObjectiveProgress(state: ZumaBoardState): ZumaObjectiveProgress[] {
  const objectives = getWinObjectives(state.winCondition, state.timeLimitMs, state.shotLimit, state.chainTarget);
  const remainingBalls = getTotalRemainingBalls(state);
  const allBallsCleared = remainingBalls === 0 && hasCompletedSpawnQueue(state);

  return objectives.map((objective) => {
    let currentValue = 0;
    let completed = false;
    let failed = false;

    switch (objective.type) {
      case 'clearAll':
        currentValue = remainingBalls;
        completed = allBallsCleared;
        break;
      case 'surviveUntilTime':
        currentValue = Math.min(state.elapsedMs, objective.targetValue);
        completed = state.elapsedMs >= objective.targetValue;
        break;
      case 'maxShots':
        currentValue = state.score.shotsFired;
        completed = state.score.shotsFired <= objective.targetValue;
        failed = state.score.shotsFired > objective.targetValue;
        break;
      case 'minChainCount':
        currentValue = state.score.chainComboCount;
        completed = state.score.chainComboCount >= objective.targetValue;
        break;
      case 'minPowerupUses':
        currentValue = state.score.powerupsUsed;
        completed = state.score.powerupsUsed >= objective.targetValue;
        break;
      case 'scoreThreshold':
        currentValue = state.score.totalScore;
        completed = state.score.totalScore >= objective.targetValue;
        break;
    }

    const label = getObjectiveLabel(objective);
    const text = objective.type === 'clearAll'
      ? `${label} · 剩余 ${currentValue} 球`
      : objective.type === 'surviveUntilTime'
        ? `${label} · ${Math.floor(currentValue / 1000)} / ${Math.floor(objective.targetValue / 1000)} 秒`
        : `${label} · ${currentValue} / ${objective.targetValue}`;

    return {
      type: objective.type,
      label,
      targetValue: objective.targetValue,
      currentValue,
      completed,
      failed,
      text,
    };
  });
}

function areWinObjectivesMet(state: ZumaBoardState): boolean {
  const progress = getZumaObjectiveProgress(state);
  if (progress.length === 0) {
    return state.chains.every((chain) => chain.balls.length === 0) && hasCompletedSpawnQueue(state);
  }

  return progress.every((objective) => objective.completed && !objective.failed);
}

function getLossReason(state: ZumaBoardState): ZumaEndReason | null {
  if (state.lossCondition.type === 'reachFinish' && state.chains.some((chain) => chain.headDistance >= state.lossCondition.finishLineDistance)) {
    return 'reachedFinish';
  }

  const progress = getZumaObjectiveProgress(state);
  const failedConstraint = getConstraintFailure(progress);
  if (failedConstraint?.type === 'maxShots') {
    return 'shotsExhausted';
  }

  if (
    state.shotLimit !== null
    && state.shotsRemaining !== null
    && state.shotsRemaining <= 0
    && state.flyingBalls.length === 0
    && !areWinObjectivesMet(state)
  ) {
    return 'shotsExhausted';
  }

  return null;
}

function updateDangerLevel(state: ZumaBoardState): ZumaBoardState {
  if (state.chains.length === 0) {
    return { ...state, dangerLevel: 'safe', previousDangerLevel: state.dangerLevel };
  }

  const maxHeadDistance = Math.max(...state.chains.map((chain) => chain.headDistance));
  const track = state.trackDefinition;
  const newDangerLevel = getZumaDangerLevel(maxHeadDistance, track.finishLineDistance, track.totalLength);

  if (newDangerLevel !== state.dangerLevel) {
    const event: ZumaGameEvent = {
      eventType: 'DANGER_LEVEL_CHANGED',
      timestampMs: state.elapsedMs,
      data: newDangerLevel,
    };
    return {
      ...state,
      dangerLevel: newDangerLevel,
      previousDangerLevel: state.dangerLevel,
      events: [...state.events, event],
    };
  }

  return state;
}

function checkWinCondition(state: ZumaBoardState): ZumaBoardState {
  if (state.phase !== 'playing') return state;
  if (state.mode === 'endless') return state;

  if (areWinObjectivesMet(state)) {
    const endReason: ZumaEndReason = getZumaObjectiveProgress(state).some((objective) => objective.type === 'surviveUntilTime')
      ? 'survivedTimer'
      : 'clearedObjectives';
    const event: ZumaGameEvent = {
      eventType: 'LEVEL_WON',
      timestampMs: state.elapsedMs,
      data: null,
    };
    return {
      ...state,
      phase: 'won',
      status: 'won',
      events: [...state.events, event],
      endReason,
    };
  }

  return state;
}

function checkLossCondition(state: ZumaBoardState): ZumaBoardState {
  if (state.phase !== 'playing') return state;
  const lossReason = getLossReason(state);

  if (lossReason) {
    const event: ZumaGameEvent = {
      eventType: 'LEVEL_LOST',
      timestampMs: state.elapsedMs,
      data: null,
    };
    return {
      ...state,
      phase: 'lost',
      status: 'lost',
      events: [...state.events, event],
      endReason: lossReason,
    };
  }

  return state;
}

function processSpawnQueue(state: ZumaBoardState): ZumaBoardState {
  if (state.spawnQueue.length === 0) return tryStartNextEndlessWave(state);

  const readyEvents = state.spawnQueue.filter((event) => event.spawnAtMs <= state.elapsedMs);
  const remainingQueue = state.spawnQueue.filter((event) => event.spawnAtMs > state.elapsedMs);

  if (readyEvents.length === 0) return state;

  let newState = { ...state, spawnQueue: remainingQueue };

  for (const event of readyEvents) {
    const lastChain = newState.chains[newState.chains.length - 1];
    const activeChain = lastChain || createZumaChain(generateChainId(), [], newState.trackId, newState.baseSpeed);
    const spawnStartDistance = newState.trackDefinition.totalLength * 0.3;
    const tailDistance = activeChain.balls.length > 0 ? activeChain.tailDistance : spawnStartDistance;
    const newBalls: ZumaBall[] = [];

    for (let i = 0; i < event.count; i++) {
      const ballId = generateBallId();
      const distance = tailDistance - (i + 1) * ZUMA_BALL_SPACING;
      const powerupType = pickRandomPowerup(
        event.powerupType ? [event.powerupType] : [],
        event.powerupChance || 0,
      );
      newBalls.push(createZumaBall(ballId, event.color, distance, activeChain.chainId, activeChain.balls.length + i, powerupType));
    }

    const updatedChain = {
      ...activeChain,
      balls: [...activeChain.balls, ...newBalls],
      headDistance: activeChain.balls.length > 0 ? activeChain.headDistance : newBalls[0]?.distanceAlongTrack ?? 0,
      tailDistance: newBalls.length > 0 ? newBalls[newBalls.length - 1].distanceAlongTrack : activeChain.tailDistance,
    };
    newState = {
      ...newState,
      chains: lastChain
        ? newState.chains.map((c) =>
          c.chainId === lastChain.chainId ? updatedChain : c
        )
        : [updatedChain],
    };
  }

  return tryStartNextEndlessWave(newState);
}

function updateScoreAccuracy(state: ZumaBoardState): ZumaBoardState {
  const totalShots = state.score.shotsFired;
  if (totalShots === 0) return state;

  const accuracy = state.score.shotsHit / totalShots;
  return {
    ...state,
    score: {
      ...state.score,
      accuracy,
      powerupEfficiency: state.score.powerupsUsed > 0 
        ? state.score.totalScore / state.score.powerupsUsed 
        : 0,
    },
  };
}

function updateVisualEffects(state: ZumaBoardState): ZumaBoardState {
  const currentTime = state.elapsedMs;
  const updatedEffects = state.visualEffects
    .map((effect) => {
      const elapsed = currentTime - effect.startTimeMs;
      if (elapsed >= effect.durationMs) {
        return { ...effect, isFinished: true };
      }
      return effect;
    })
    .filter((effect) => !effect.isFinished);

  return { ...state, visualEffects: updatedEffects };
}

function updateDangerPulse(state: ZumaBoardState): ZumaBoardState {
  if (state.dangerLevel === 'safe') {
    return { ...state, dangerPulsePhase: 0 };
  }

  const pulseSpeed = state.dangerLevel === 'critical' ? 0.15 : 0.08;
  const newPhase = (state.dangerPulsePhase + pulseSpeed) % 1;

  return { ...state, dangerPulsePhase: newPhase };
}

export function tickZumaBoard(state: ZumaBoardState, elapsedMs: number): ZumaBoardState {
  if (state.phase !== 'playing') return state;
  if (state.isPaused) return state;

  const adjustedElapsedMs = elapsedMs * state.gameSpeed;
  const newElapsedMs = state.elapsedMs + adjustedElapsedMs;

  if (state.timeLimitMs !== null && newElapsedMs >= state.timeLimitMs) {
    const timedState: ZumaBoardState = {
      ...state,
      elapsedMs: state.timeLimitMs,
      score: {
        ...state.score,
        elapsedMs: state.timeLimitMs,
      },
    };
    if (areWinObjectivesMet(timedState)) {
      return {
        ...timedState,
        phase: 'won',
        status: 'won',
        endReason: 'survivedTimer',
        events: [
          ...state.events,
          {
            eventType: 'LEVEL_WON',
            timestampMs: state.timeLimitMs,
            data: null,
          },
        ],
      };
    }
    return {
      ...timedState,
      phase: 'lost',
      status: 'lost',
      endReason: 'timeExpired',
      events: [
        ...state.events,
        {
          eventType: 'LEVEL_LOST',
          timestampMs: state.timeLimitMs,
          data: null,
        },
      ],
    };
  }

  let newState = {
    ...state,
    elapsedMs: newElapsedMs,
    score: {
      ...state.score,
      elapsedMs: newElapsedMs,
    },
  };

  newState = updateCannonCooldown(newState, adjustedElapsedMs);
  newState = moveFlyingBalls(newState, adjustedElapsedMs);
  newState = processFlyingBallCollisions(newState);
  newState = advanceChains(newState, adjustedElapsedMs);
  newState = updateDangerLevel(newState);
  newState = processSpawnQueue(newState);
  newState = updateScoreAccuracy(newState);
  newState = updateVisualEffects(newState);
  newState = updateDangerPulse(newState);

  newState = checkLossCondition(newState);
  if (newState.phase === 'lost') return newState;

  newState = checkWinCondition(newState);
  return newState;
}

export function getZumaBoardSummary(state: ZumaBoardState): string {
  const chainCount = state.chains.length;
  const totalBalls = state.chains.reduce((sum, chain) => sum + chain.balls.length, 0);
  const dangerLabel = state.dangerLevel === 'safe' ? '安全' 
    : state.dangerLevel === 'warning' ? '警告' 
    : '危险';
  const waveText = state.mode === 'endless' ? ` | 波段 ${state.currentWave}` : '';
  
  return `关卡 ${state.levelNumber}: ${state.levelTitle}${waveText} | 球链 ${chainCount} 条 | 球数 ${totalBalls} | ${dangerLabel} | 分数 ${state.score.totalScore}`;
}

export function getZumaObjectiveSummaryText(state: ZumaBoardState): string {
  const progress = getZumaObjectiveProgress(state);
  if (progress.length === 0) {
    return '目标：清空全链';
  }

  return progress.map((objective) => objective.text).join(' / ');
}

function getLossReasonText(state: ZumaBoardState): string {
  switch (state.endReason) {
    case 'shotsExhausted':
      return '失败: 发射次数已耗尽';
    case 'timeExpired':
      return '失败: 倒计时结束前未完成目标';
    case 'reachedFinish':
    default:
      return '失败: 球链触及终点线';
  }
}

export function getZumaFormulaBarText(state: ZumaBoardState): string {
  if (state.phase === 'setup') {
    return `准备开始: ${state.levelTitle} | ${getZumaObjectiveSummaryText(state)}`;
  }
  if (state.phase === 'won') {
    return `胜利! 分数 ${state.score.totalScore} | 连锁 ${state.score.maxChainComboLevel} 层 | 命中率 ${Math.round(state.score.accuracy * 100)}%`;
  }
  if (state.phase === 'lost') {
    return state.mode === 'endless'
      ? `${getLossReasonText(state)} | 最高波段 ${state.currentWave}`
      : getLossReasonText(state);
  }

  const accuracyPercent = Math.round(state.score.accuracy * 100);
  const endlessText = state.mode === 'endless' ? ` | 第 ${state.currentWave} 波` : '';
  return `${state.levelTitle}${endlessText} | 分数 ${state.score.totalScore} | 连锁 ${state.score.chainComboCount} | 命中 ${accuracyPercent}% | ${getZumaObjectiveSummaryText(state)}${state.dangerLevel === 'critical' ? ' | ⚠ 危险' : ''}`;
}
