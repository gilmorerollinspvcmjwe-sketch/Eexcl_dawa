/* 吃豆人水果系统。负责水果触发逻辑、出现时间限制、拾取与得分、水果序列进阶。 */

import type {
  PacmanBoardState,
  FruitInstance,
  FruitId,
} from './pacmanTypes.ts';

import {
  FRUIT_IDS,
  FRUIT_SCORES,
  FRUIT_NAMES,
} from './pacmanTypes.ts';

import { getMazeDefinition } from './pacmanBoardState.ts';

/* 水果触发状态 */
export type FruitTriggerState = 'not_triggered' | 'first_triggered' | 'second_triggered' | 'collected' | 'expired';

/* 检查是否应该触发水果 */
export function shouldTriggerFruit(state: PacmanBoardState): boolean {
  const { pelletsCollectedTotal, fruit, levelTuning, fruitSpawnsTriggered } = state;

  if (fruit?.isActive) return false;

  const threshold1 = levelTuning.fruitSpawnThreshold1;
  const threshold2 = levelTuning.fruitSpawnThreshold2;

  if (pelletsCollectedTotal >= threshold1 && pelletsCollectedTotal < threshold2) {
    return fruitSpawnsTriggered < 1;
  }

  if (pelletsCollectedTotal >= threshold2) {
    return fruitSpawnsTriggered < 2;
  }

  return false;
}

/* 触发水果出现 */
export function triggerFruitSpawn(state: PacmanBoardState): PacmanBoardState {
  if (!shouldTriggerFruit(state)) return state;

  const maze = getMazeDefinition(state.mazeId);
  const fruitId = FRUIT_IDS[state.levelTuning.fruitIndex];

  const newFruit: FruitInstance = {
    fruitId,
    row: maze.fruitSpawnPosition.row,
    col: maze.fruitSpawnPosition.col,
    isActive: true,
    spawnTimeMs: state.elapsedMs,
    lifetimeMs: state.levelTuning.fruitLifetimeMs,
    remainingMs: state.levelTuning.fruitLifetimeMs,
  };

  return {
    ...state,
    fruitSpawnsTriggered: state.fruitSpawnsTriggered + 1,
    fruit: newFruit,
  };
}

/* 更新水果状态（时间流逝） */
export function updateFruitState(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (!state.fruit || !state.fruit.isActive) return state;

  const newRemainingMs = state.fruit.remainingMs - deltaMs;

  if (newRemainingMs <= 0) {
    return {
      ...state,
      fruit: {
        ...state.fruit,
        isActive: false,
        remainingMs: 0,
      },
    };
  }

  return {
    ...state,
    fruit: {
      ...state.fruit,
      remainingMs: newRemainingMs,
    },
  };
}

/* 检查 Pac-Man 是否可以拾取水果 */
export function canCollectFruit(state: PacmanBoardState): boolean {
  if (!state.fruit || !state.fruit.isActive) return false;

  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);

  const fruitRow = state.fruit.row;
  const fruitCol = state.fruit.col;

  const distance = Math.abs(pacmanRow - fruitRow) + Math.abs(pacmanCol - fruitCol);

  return distance < 1.5;
}

/* 拾取水果 */
export function collectFruit(state: PacmanBoardState): PacmanBoardState {
  if (!canCollectFruit(state)) return state;

  const fruit = state.fruit!;
  const score = FRUIT_SCORES[fruit.fruitId];

  return {
    ...state,
    score: state.score + score,
    fruitsCollected: state.fruitsCollected + 1,
    fruit: {
      ...fruit,
      isActive: false,
      remainingMs: 0,
    },
  };
}

/* 获取当前关卡水果类型 */
export function getCurrentLevelFruit(level: number): FruitId {
  const index = Math.min(level - 1, FRUIT_IDS.length - 1);
  return FRUIT_IDS[index];
}

/* 获取水果分数 */
export function getFruitScore(fruitId: FruitId): number {
  return FRUIT_SCORES[fruitId];
}

/* 获取水果名称 */
export function getFruitName(fruitId: FruitId): string {
  return FRUIT_NAMES[fruitId];
}

/* 获取水果触发阈值 */
export function getFruitTriggerThresholds(state: PacmanBoardState): { threshold1: number; threshold2: number } {
  const initialPellets = state.pelletsRemaining + state.pelletsCollectedTotal;
  return {
    threshold1: initialPellets - state.levelTuning.fruitSpawnThreshold1,
    threshold2: initialPellets - state.levelTuning.fruitSpawnThreshold2,
  };
}

/* 获取水果状态描述 */
export function getFruitStatusText(state: PacmanBoardState): string {
  if (!state.fruit) return '未出';

  if (state.fruit.isActive) {
    const remainingSeconds = Math.ceil(state.fruit.remainingMs / 1000);
    return `${getFruitName(state.fruit.fruitId)} (${remainingSeconds}秒)`;
  }

  if (state.fruitsCollected > 0) {
    return `已拾取 ${state.fruitsCollected} 个`;
  }

  return '未出';
}

/* 重置水果状态 */
export function resetFruitState(state: PacmanBoardState): PacmanBoardState {
  const fruitId = getCurrentLevelFruit(state.level);

  return {
    ...state,
    fruit: {
      fruitId,
      row: 0,
      col: 0,
      isActive: false,
      spawnTimeMs: 0,
      lifetimeMs: state.levelTuning.fruitLifetimeMs,
      remainingMs: 0,
    },
  };
}

/* 检查水果是否即将消失（闪烁预警） */
export function isFruitAboutToExpire(state: PacmanBoardState): boolean {
  if (!state.fruit || !state.fruit.isActive) return false;

  const blinkThreshold = 2000;
  return state.fruit.remainingMs < blinkThreshold;
}

/* 获取水果闪烁频率 */
export function getFruitBlinkInterval(state: PacmanBoardState): number {
  if (!isFruitAboutToExpire(state)) return 0;

  const remainingMs = state.fruit!.remainingMs;
  if (remainingMs < 500) return 100;
  if (remainingMs < 1000) return 150;
  return 250;
}
