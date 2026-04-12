/* 负责贪吃蛇局内状态推进，包括文本链、目标词组、多食物补货和障碍压力。 */
import { createRandomFoodCell, createTokenFoodCell } from './snakeFoodRegistry.ts';
import {
  getCurrentSnakeTarget,
  getExpectedTargetToken,
  getSnakeSegmentBoundaries,
  getSnakeTargetPlan,
  getSnakeTargetSegments,
  getSnakeTargetTokens,
  resolveSnakeChainBonus,
} from './snakeTextChain.ts';
import type {
  CreateSnakeBoardOptions,
  Direction,
  FoodCell,
  ObstacleCell,
  ObstacleKind,
  SnakeBoardState,
  SnakeCell,
  SnakeDeathReason,
  SnakeDifficulty,
  SnakeMode,
  SnakeSegment,
} from './snakeTypes.ts';

const DEFAULT_ROWS = 15;
const DEFAULT_COLS = 20;
const DEFAULT_TIMED_DURATION_MS = 60_000;
const BOOST_SPEED_FACTOR = 0.72;
const EVENT_DURATION_MS = 1_800;
const SEGMENT_COMPLETION_BONUS = 40;
const DYNAMIC_PRESSURE_INTERVAL_MS = 9_000;

const EVENT_TAGS = {
  segmentMilestone: '段落完成',
  chainBonus: '短词链',
  penalty: '误收',
  auditLine: '审计线',
};

const TICK_BY_DIFFICULTY: Record<SnakeDifficulty, number> = {
  easy: 220,
  normal: 180,
  hard: 140,
};

const DIRECTION_VECTOR: Record<Direction, { row: number; col: number }> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

function toKey(cell: SnakeCell): string {
  return `${cell.row}:${cell.col}`;
}

function sameCell(a: SnakeCell, b: SnakeCell): boolean {
  return a.row === b.row && a.col === b.col;
}

function normalizeSegments(cells: SnakeCell[], chainTokens: string[]): SnakeSegment[] {
  return cells.map((cell, index, list) => {
    const segmentType = index === 0 ? 'head' : index === list.length - 1 ? 'tail' : 'body';
    const tokenIndex = index === 0 ? -1 : chainTokens.length - index;
    return {
      row: cell.row,
      col: cell.col,
      segmentType,
      token: tokenIndex >= 0 ? chainTokens[tokenIndex] : undefined,
    };
  });
}

function createInitialSnake(rows: number, cols: number): SnakeSegment[] {
  const startRow = Math.floor(rows / 2);
  const baseCol = Math.min(cols - 1, Math.max(2, Math.floor(cols / 4)));
  const c0 = Math.max(0, baseCol);
  const c1 = Math.max(0, baseCol - 1);
  const c2 = Math.max(0, baseCol - 2);
  return normalizeSegments(
    [
      { row: startRow, col: c0 },
      { row: startRow, col: c1 },
      { row: startRow, col: c2 },
    ],
    [],
  );
}

function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

function inBounds(cell: SnakeCell, rows: number, cols: number): boolean {
  return cell.row >= 0 && cell.row < rows && cell.col >= 0 && cell.col < cols;
}

function getDesiredFoodCount(mode: SnakeMode, difficulty: SnakeDifficulty): number {
  if (mode === 'challenge') return difficulty === 'hard' ? 4 : 3;
  if (mode === 'timed') return difficulty === 'hard' ? 3 : 2;
  return difficulty === 'hard' ? 3 : 2;
}

function buildChallengeObstacles(rows: number, cols: number, difficulty: SnakeDifficulty): ObstacleCell[] {
  const middleRow = Math.floor(rows / 2);
  const middleCol = Math.floor(cols / 2);
  const candidates: ObstacleCell[] = [
    { row: middleRow, col: middleCol, kind: 'merged' },
    { row: middleRow - 1, col: middleCol, kind: 'merged' },
    { row: middleRow + 1, col: middleCol, kind: 'merged' },
    { row: middleRow, col: middleCol - 1, kind: 'filtered' },
    { row: middleRow, col: middleCol + 1, kind: 'filtered' },
    { row: 1, col: 1, kind: 'frozen' },
    { row: 1, col: cols - 2, kind: 'frozen' },
    { row: rows - 2, col: 1, kind: 'filtered' },
    { row: rows - 2, col: cols - 2, kind: 'filtered' },
  ];

  if (difficulty !== 'easy') {
    candidates.push(
      { row: Math.max(2, middleRow - 3), col: middleCol - 2, kind: 'merged' },
      { row: Math.max(2, middleRow - 3), col: middleCol + 2, kind: 'merged' },
    );
  }

  if (difficulty === 'hard') {
    candidates.push(
      { row: 2, col: middleCol, kind: 'filtered' },
      { row: rows - 3, col: middleCol, kind: 'filtered' },
      { row: middleRow, col: 2, kind: 'frozen' },
      { row: middleRow, col: cols - 3, kind: 'frozen' },
    );
  }

  return candidates.filter((cell) => inBounds(cell, rows, cols));
}

function getObstacleLayout(mode: SnakeMode, difficulty: SnakeDifficulty, rows: number, cols: number): ObstacleCell[] {
  if (mode !== 'challenge') return [];
  return buildChallengeObstacles(rows, cols, difficulty);
}

function getSegmentMetadata(
  target: string | null,
  config?: Record<string, string[]>,
): { segments: string[]; boundaries: number[] } {
  if (!target) return { segments: [], boundaries: [] };
  const overrides = config?.[target];
  const segments = overrides && overrides.length > 0 ? overrides : getSnakeTargetSegments(target);
  const boundaries = getSnakeSegmentBoundaries(target, overrides);
  return {
    segments,
    boundaries,
  };
}

function applyDynamicPressure(
  state: SnakeBoardState,
  random: () => number,
  tickMs: number,
): SnakeBoardState {
  if (state.mode !== 'challenge' || state.status !== 'playing') return state;
  const nextTimer = Math.max(0, state.dynamicPressureTimerMs - tickMs);
  if (nextTimer > 0) {
    return { ...state, dynamicPressureTimerMs: nextTimer };
  }

  let obstacles = state.obstacles;
  let pressureLevel = Math.min(15, state.pressureLevel + 1);
  for (let i = 0; i < 2; i += 1) {
    obstacles = addPressureObstacle(state, random, obstacles, state.foods, state.snake.segments, pressureLevel);
  }

  return {
    ...state,
    obstacles,
    pressureLevel,
    dynamicPressureTimerMs: DYNAMIC_PRESSURE_INTERVAL_MS + Math.floor(random() * 5_000),
    lastEventText: `${EVENT_TAGS.auditLine}触发，障碍压力上升`,
    lastEventTone: 'warning',
    eventMs: EVENT_DURATION_MS,
  };
}

function findFreeCell(state: Pick<SnakeBoardState, 'rows' | 'cols' | 'snake' | 'foods' | 'obstacles'>, random: () => number): SnakeCell | null {
  const occupied = new Set<string>();
  state.snake.segments.forEach((segment) => occupied.add(toKey(segment)));
  state.obstacles.forEach((obstacle) => occupied.add(toKey(obstacle)));
  state.foods.forEach((food) => occupied.add(toKey(food)));

  const total = state.rows * state.cols;
  const startIndex = Math.floor(random() * total);
  for (let offset = 0; offset < total; offset += 1) {
    const currentIndex = (startIndex + offset) % total;
    const row = Math.floor(currentIndex / state.cols);
    const col = currentIndex % state.cols;
    const key = `${row}:${col}`;
    if (!occupied.has(key)) return { row, col };
  }
  return null;
}

function getPressureObstacleKind(level: number): ObstacleKind {
  if (level % 3 === 0) return 'filtered';
  if (level % 2 === 0) return 'merged';
  return 'frozen';
}

function addPressureObstacle(
  state: SnakeBoardState,
  random: () => number,
  obstacles: ObstacleCell[],
  foods: FoodCell[],
  segments: SnakeSegment[],
  pressureLevel: number,
): ObstacleCell[] {
  const boardArea = state.rows * state.cols;
  const baseLimit = state.mode === 'challenge' ? 18 : 8;
  const limit = Math.min(boardArea - segments.length - foods.length - 1, baseLimit + pressureLevel);
  if (obstacles.length >= limit) return obstacles;

  const freeCell = findFreeCell(
    {
      rows: state.rows,
      cols: state.cols,
      obstacles,
      foods,
      snake: {
        ...state.snake,
        segments,
      },
    },
    random,
  );

  if (!freeCell) return obstacles;

  return [...obstacles, { ...freeCell, kind: getPressureObstacleKind(pressureLevel) }];
}

function restockFoods(state: SnakeBoardState, random: () => number): FoodCell[] {
  const desiredCount = getDesiredFoodCount(state.mode, state.difficulty);
  const foods = [...state.foods];
  const expectedToken = getExpectedTargetToken(state);

  while (foods.length < desiredCount) {
    const freeCell = findFreeCell(
      {
        rows: state.rows,
        cols: state.cols,
        snake: state.snake,
        foods,
        obstacles: state.obstacles,
      },
      random,
    );
    if (!freeCell) break;

    const alreadyHasTarget = expectedToken
      ? foods.some((food) => food.isTarget || food.token === expectedToken || food.kind === 'wild')
      : true;

    const nextFood =
      expectedToken && !alreadyHasTarget
        ? createTokenFoodCell(expectedToken, freeCell.row, freeCell.col, true)
        : createRandomFoodCell(freeCell.row, freeCell.col, random, { distractorFor: expectedToken });

    foods.push(nextFood);
  }

  return foods;
}

function markDead(state: SnakeBoardState, reason: SnakeDeathReason): SnakeBoardState {
  return {
    ...state,
    status: 'dead',
    deathReason: reason,
    tickAccumulatorMs: 0,
    speedBoostMs: 0,
    streak: 0,
    lastFoodKind: undefined,
  };
}

function finishRun(state: SnakeBoardState, deathReason?: SnakeDeathReason): SnakeBoardState {
  return {
    ...state,
    status: 'finished',
    deathReason,
    tickAccumulatorMs: 0,
    speedBoostMs: 0,
    streak: 0,
  };
}

function stepSnake(state: SnakeBoardState, random: () => number, tickMs: number): SnakeBoardState {
  const currentHead = state.snake.segments[0];
  const direction = state.snake.nextDirection;
  const vector = DIRECTION_VECTOR[direction];
  const nextHead: SnakeCell = {
    row: currentHead.row + vector.row,
    col: currentHead.col + vector.col,
  };

  if (!inBounds(nextHead, state.rows, state.cols)) {
    return markDead(state, 'wall');
  }

  if (state.obstacles.some((obstacle) => sameCell(obstacle, nextHead))) {
    return markDead(state, 'obstacle');
  }

  const bodyForCollision = state.snake.growBy > 0 ? state.snake.segments : state.snake.segments.slice(0, -1);
  if (bodyForCollision.some((segment) => sameCell(segment, nextHead))) {
    return markDead(state, 'self');
  }

  const consumedIndex = state.foods.findIndex((food) => sameCell(food, nextHead));
  const consumedFood = consumedIndex >= 0 ? state.foods[consumedIndex] : undefined;

  let score = state.score;
  let growBy = state.snake.growBy;
  let streak = consumedFood ? state.streak + 1 : 0;
  let lastFoodKind = consumedFood?.kind;
  let speedBoostMs = Math.max(0, state.speedBoostMs - tickMs);
  let foodsAfterEat = consumedFood ? state.foods.filter((_, index) => index !== consumedIndex) : [...state.foods];
  let obstacles = [...state.obstacles];
  let chainTokens = [...state.chainTokens];
  let targetIndex = state.targetIndex;
  let targetProgress = state.targetProgress;
  let completedTargets = [...state.completedTargets];
  let pressureLevel = state.pressureLevel;
  let lastEventText = state.eventMs > tickMs ? state.lastEventText : undefined;
  let lastEventTone = state.eventMs > tickMs ? state.lastEventTone : undefined;
  let eventMs = Math.max(0, state.eventMs - tickMs);
  let shouldFinishAfterStep = false;
  let segmentIndex = state.segmentIndex;
  let segmentCount = state.segmentCount;
  let segmentBoundaries = state.segmentBoundaries;
  let activeSegments = state.activeSegments;

  if (consumedFood) {
    score += consumedFood.value;
    growBy += consumedFood.growth;
    if (consumedFood.boostMs > 0) {
      speedBoostMs = Math.max(speedBoostMs, consumedFood.boostMs);
    }

    if (consumedFood.token) {
      const targetSnapshot = { targetPlan: state.targetPlan, targetIndex, targetProgress };
      const expectedToken = getExpectedTargetToken(targetSnapshot);
      const resolvedToken = consumedFood.token === '@' && expectedToken ? expectedToken : consumedFood.token;
      chainTokens.push(resolvedToken);

      if (expectedToken) {
        if (resolvedToken === expectedToken) {
          const progressBonus = 8 + targetProgress * 6;
          targetProgress += 1;
          score += progressBonus;
          const boundaryMatchIndex = segmentBoundaries.indexOf(targetProgress);
          if (boundaryMatchIndex >= 0 && segmentCount > 0) {
            segmentIndex = boundaryMatchIndex + 1;
            score += SEGMENT_COMPLETION_BONUS;
            const label = activeSegments[boundaryMatchIndex];
            lastEventText = `段落 ${segmentIndex}/${segmentCount}${label ? ` · ${label}` : ''} ${EVENT_TAGS.segmentMilestone}`;
          } else {
            lastEventText = `命中 ${resolvedToken}，拼链推进`;
          }
          lastEventTone = 'success';
          eventMs = EVENT_DURATION_MS;

          const currentTarget = getCurrentSnakeTarget({ targetPlan: state.targetPlan, targetIndex });
          const currentTokens = currentTarget ? getSnakeTargetTokens(currentTarget) : [];
          if (currentTarget && targetProgress >= currentTokens.length) {
            const completionBonus = 60 + currentTokens.length * 20;
            score += completionBonus;
            growBy += 1;
            completedTargets = [...completedTargets, currentTarget];
            targetIndex += 1;
            targetProgress = 0;
            pressureLevel = Math.max(0, pressureLevel - 1);
            lastEventText = `短句完成：${currentTarget}`;
            lastEventTone = 'success';
            eventMs = EVENT_DURATION_MS;
            shouldFinishAfterStep = targetIndex >= state.targetPlan.length;
            const nextTarget = state.targetPlan[targetIndex] ?? null;
            if (nextTarget) {
              const metadata = getSegmentMetadata(nextTarget, state.targetSegmentConfig);
              segmentBoundaries = metadata.boundaries;
              segmentCount = metadata.boundaries.length;
              segmentIndex = 0;
              activeSegments = metadata.segments;
            }
          }
        } else {
          score = Math.max(0, score - 15);
          pressureLevel += 1;
          lastEventText = `${EVENT_TAGS.penalty} ${resolvedToken}，链条受扰`;
          lastEventTone = 'warning';
          eventMs = EVENT_DURATION_MS;
        }
      } else {
        const chainBonus = resolveSnakeChainBonus(chainTokens);
        if (chainBonus) {
          score += chainBonus.bonus;
          lastEventText = `${EVENT_TAGS.chainBonus} +${chainBonus.bonus}`;
          lastEventTone = 'success';
          eventMs = EVENT_DURATION_MS;
        }
      }
    }
  }

  const movedCells: SnakeCell[] = [
    nextHead,
    ...state.snake.segments.map((segment) => ({ row: segment.row, col: segment.col })),
  ];
  if (growBy > 0) {
    growBy -= 1;
  } else {
    movedCells.pop();
  }

  const nextSegments = normalizeSegments(movedCells, chainTokens);
  if (state.mode === 'challenge' && consumedFood?.token) {
    const targetSnapshot = { targetPlan: state.targetPlan, targetIndex: state.targetIndex, targetProgress: state.targetProgress };
    const expectedToken = getExpectedTargetToken(targetSnapshot);
    const resolvedToken = consumedFood.token === '@' && expectedToken ? expectedToken : consumedFood.token;
    if (expectedToken && resolvedToken !== expectedToken) {
      obstacles = addPressureObstacle(state, random, obstacles, foodsAfterEat, nextSegments, pressureLevel);
    }
  }

  const nextBaseState: SnakeBoardState = {
    ...state,
    score,
    length: nextSegments.length,
    foods: foodsAfterEat,
    obstacles,
    speedBoostMs,
    streak,
    lastFoodKind,
    deathReason: undefined,
    chainTokens,
    targetIndex,
    targetProgress,
    completedTargets,
    pressureLevel,
    lastEventText,
    lastEventTone,
    eventMs,
    segmentCount,
    segmentIndex,
    segmentBoundaries,
    activeSegments,
    targetSegmentConfig: state.targetSegmentConfig,
    dynamicPressureTimerMs: state.dynamicPressureTimerMs,
    snake: {
      segments: nextSegments,
      direction,
      nextDirection: direction,
      growBy,
    },
  };

  const nextFoods = restockFoods(nextBaseState, random);
  const nextState = {
    ...nextBaseState,
    foods: nextFoods,
  };

  if (shouldFinishAfterStep) {
    return finishRun(nextState);
  }

  return nextState;
}

export function getSnakeTickIntervalMs(difficulty: SnakeDifficulty, speedBoostMs = 0): number {
  const base = TICK_BY_DIFFICULTY[difficulty];
  return speedBoostMs > 0 ? Math.max(60, Math.floor(base * BOOST_SPEED_FACTOR)) : base;
}

export function createSnakeBoardState(options: CreateSnakeBoardOptions = {}): SnakeBoardState {
  const rows = options.rows ?? DEFAULT_ROWS;
  const cols = options.cols ?? DEFAULT_COLS;
  const mode = options.mode ?? 'classic';
  const difficulty = options.difficulty ?? 'normal';
  const random = options.random ?? Math.random;
  const segments = createInitialSnake(rows, cols);
  const occupiedBySnake = new Set(segments.map((segment) => toKey(segment)));
  const obstacles = getObstacleLayout(mode, difficulty, rows, cols).filter((cell) => !occupiedBySnake.has(toKey(cell)));
  const remainingMs = mode === 'timed' ? options.durationMs ?? DEFAULT_TIMED_DURATION_MS : null;
  const targetPlan = options.targetPlan ? [...options.targetPlan] : getSnakeTargetPlan(mode, difficulty);

  const segmentMeta = getSegmentMetadata(targetPlan[0] ?? null, options.targetSegmentConfig);
  const baseState: SnakeBoardState = {
    rows,
    cols,
    status: 'idle',
    mode,
    difficulty,
    score: 0,
    length: segments.length,
    elapsedMs: 0,
    remainingMs,
    snake: {
      segments,
      direction: 'right',
      nextDirection: 'right',
      growBy: 0,
    },
    foods: [],
    obstacles,
    speedBoostMs: 0,
    streak: 0,
    tickAccumulatorMs: 0,
    chainTokens: [],
    targetPlan,
    targetIndex: 0,
    targetProgress: 0,
    completedTargets: [],
    pressureLevel: 0,
    lastEventText: mode === 'classic' ? '自由拼链模式已就绪' : `当前任务：${targetPlan[0] ?? '自由拼链'}`,
    lastEventTone: 'info',
    eventMs: EVENT_DURATION_MS,
    segmentCount: segmentMeta.boundaries.length,
    segmentIndex: 0,
    segmentBoundaries: segmentMeta.boundaries,
    activeSegments: segmentMeta.segments,
    targetSegmentConfig: options.targetSegmentConfig ?? {},
    dynamicPressureTimerMs: DYNAMIC_PRESSURE_INTERVAL_MS,
  };

  return {
    ...baseState,
    foods: restockFoods(baseState, random),
  };
}

export function restartSnakeBoard(state: SnakeBoardState, random: () => number = Math.random): SnakeBoardState {
  return createSnakeBoardState({
    rows: state.rows,
    cols: state.cols,
    mode: state.mode,
    difficulty: state.difficulty,
    durationMs: state.remainingMs ?? undefined,
    random,
  });
}

export function startSnakeBoard(state: SnakeBoardState): SnakeBoardState {
  if (state.status === 'idle' || state.status === 'paused') {
    return {
      ...state,
      status: 'playing',
      deathReason: undefined,
    };
  }
  return state;
}

export function toggleSnakePause(state: SnakeBoardState): SnakeBoardState {
  if (state.status === 'playing') {
    return { ...state, status: 'paused' };
  }
  if (state.status === 'paused') {
    return { ...state, status: 'playing' };
  }
  return state;
}

export function setSnakeDirection(state: SnakeBoardState, direction: Direction): SnakeBoardState {
  if (state.status === 'dead' || state.status === 'finished' || state.status === 'paused') {
    return state;
  }

  if (isOppositeDirection(state.snake.direction, direction)) {
    return state;
  }

  return {
    ...state,
    status: state.status === 'idle' ? 'playing' : state.status,
    snake: {
      ...state.snake,
      nextDirection: direction,
    },
  };
}

export function tickSnakeBoard(state: SnakeBoardState, elapsedMs: number, random: () => number = Math.random): SnakeBoardState {
  if (state.status !== 'playing' || elapsedMs <= 0) return state;

  let nextState: SnakeBoardState = {
    ...state,
    elapsedMs: state.elapsedMs + elapsedMs,
    remainingMs: state.remainingMs === null ? null : Math.max(0, state.remainingMs - elapsedMs),
  };

  if (nextState.remainingMs === 0) {
    return finishRun(
      {
        ...nextState,
        lastEventText: '限时任务已结束',
        lastEventTone: 'info',
        eventMs: EVENT_DURATION_MS,
      },
      'timeout',
    );
  }

  let accumulator = nextState.tickAccumulatorMs + elapsedMs;
  while (nextState.status === 'playing') {
    const tickMs = getSnakeTickIntervalMs(nextState.difficulty, nextState.speedBoostMs);
    if (accumulator < tickMs) break;
    accumulator -= tickMs;
    nextState = stepSnake(nextState, random, tickMs);
    nextState = applyDynamicPressure(nextState, random, tickMs);
  }

  if (nextState.status === 'playing' && nextState.foods.length === 0) {
    nextState = {
      ...nextState,
      foods: restockFoods(nextState, random),
    };
  }

  return {
    ...nextState,
    tickAccumulatorMs: nextState.status === 'playing' ? accumulator : 0,
  };
}
