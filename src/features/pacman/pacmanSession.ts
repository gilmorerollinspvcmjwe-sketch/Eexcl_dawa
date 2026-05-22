/* 吃豆人会话逻辑。负责主循环推进和 Escape 键语义，避免组件里出现不可测的闭包状态。 */

import type { PacmanBoardState } from './pacmanTypes.ts';

import {
  updatePacmanPosition,
  pauseGame,
  resumeGame,
} from './pacmanMovement.ts';
import { updateGlobalModeState } from './pacmanLevelTuning.ts';
import { updateAllGhosts } from './pacmanAi.ts';
import {
  updateFruitState,
  triggerFruitSpawn,
  collectFruit,
} from './pacmanFruit.ts';
import {
  completeLevel,
  handleCollision,
  handleWin,
  handleLose,
  handleDeathAnimation,
  handleRespawnAnimation,
  applyScoreBonuses,
} from './pacmanGameLogic.ts';
import { getLevelMeta } from './pacmanMapRegistry.ts';
import { hasCompletedPacmanLevelGoal } from './pacmanGoalRules.ts';

export interface EscapeKeyResult {
  nextState: PacmanBoardState;
  shouldExit: boolean;
  shouldReturnToSetup: boolean;
}

/* 推进一步 Pacman 状态，只在真正进行中的时刻累计计时。 */
export function tickPacmanState(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.deathAnimationMs > 0 || state.status === 'dead') {
    return handleDeathAnimation(state, deltaMs);
  }

  if (state.respawnAnimationMs > 0) {
    return handleRespawnAnimation(state, deltaMs);
  }

  if (state.status !== 'playing' || state.isPaused) {
    return state;
  }

  let nextState: PacmanBoardState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
  };

  nextState = updatePacmanPosition(nextState, deltaMs);
  nextState = updateGlobalModeState(nextState, deltaMs);
  nextState = updateAllGhosts(nextState, deltaMs);
  nextState = triggerFruitSpawn(nextState);
  nextState = updateFruitState(nextState, deltaMs);
  nextState = collectFruit(nextState);
  nextState = applyScoreBonuses(nextState);

  const collisionResult = handleCollision(nextState);
  if (collisionResult.status !== nextState.status) {
    return collisionResult;
  }
  nextState = collisionResult;
  nextState = applyScoreBonuses(nextState);

  const levelMeta = getLevelMeta(nextState.packId, nextState.level);
  if (hasCompletedPacmanLevelGoal(nextState, levelMeta)) {
    return completeLevel(nextState);
  }

  if (nextState.pelletsRemaining <= 0) {
    return handleWin(nextState);
  }

  if (nextState.lives <= 0) {
    return handleLose(nextState);
  }

  return nextState;
}

/* 统一定义 Escape 的行为：局内暂停/恢复，局外退出。 */
export function applyPacmanEscapeKey(state: PacmanBoardState): EscapeKeyResult {
  if (state.status === 'playing') {
    return {
      nextState: pauseGame(state),
      shouldExit: false,
      shouldReturnToSetup: false,
    };
  }

  if (state.status === 'paused') {
    return {
      nextState: resumeGame(state),
      shouldExit: false,
      shouldReturnToSetup: false,
    };
  }

  return {
    nextState: state,
    shouldExit: false,
    shouldReturnToSetup: true,
  };
}
