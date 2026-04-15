/* 吃豆人游戏逻辑。负责胜利/失败判定、碰撞处理、吃鬼计分、重生逻辑。 */

import type { PacmanBoardState, PacmanRunResult } from './pacmanTypes.ts';

import { DEFAULT_LIVES, GHOST_EAT_SCORES } from './pacmanTypes.ts';

import {
  getMazeDefinition,
  createPacmanBoardState,
  advanceToNextLevel,
} from './pacmanBoardState.ts';

import {
  checkGhostCollision,
  eatGhost,
  getElroyPhase,
  handlePacmanDeath,
  resetGhostsPosition,
} from './pacmanAi.ts';

import { resetPacmanPosition } from './pacmanMovement.ts';
import { resetFruitState } from './pacmanFruit.ts';
import { resetGlobalModeState } from './pacmanLevelTuning.ts';
import { isSingleLifePack } from './pacmanMapRegistry.ts';

/* 检查胜利条件（清空所有普通豆） */
export function checkWinCondition(state: PacmanBoardState): boolean {
  return state.pelletsRemaining <= 0 && state.status === 'playing';
}

/* 检查失败条件（生命值归零） */
export function checkLoseCondition(state: PacmanBoardState): boolean {
  return state.lives <= 0;
}

/* 处理胜利 */
export function handleWin(state: PacmanBoardState): PacmanBoardState {
  if (!checkWinCondition(state)) return state;

  return completeLevel(state);
}

/* 强制完成当前关卡，用于教学/练习脚本目标。 */
export function completeLevel(state: PacmanBoardState): PacmanBoardState {
  if (state.status !== 'playing') return state;

  return {
    ...state,
    status: 'won',
    levelComplete: true,
    pacman: {
      ...state.pacman,
      isMoving: false,
    },
  };
}

/* 处理失败 */
export function handleLose(state: PacmanBoardState): PacmanBoardState {
  if (!checkLoseCondition(state)) return state;

  return {
    ...state,
    status: 'lost',
    gameOver: true,
    pacman: {
      ...state.pacman,
      isMoving: false,
    },
  };
}

/* 处理碰撞事件 */
export function handleCollision(state: PacmanBoardState): PacmanBoardState {
  const collision = checkGhostCollision(state);

  if (!collision.collided) return state;

  const ghost = collision.ghost!;

  if (ghost.state === 'frightened') {
    return eatGhost(state, ghost);
  }

  if (ghost.state === 'eaten' || ghost.state === 'respawn' || ghost.state === 'house') {
    return state;
  }

  return handlePacmanDeath(state);
}

/* 处理死亡动画 */
export function handleDeathAnimation(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.status !== 'dead') return state;

  const newDeathAnimationMs = state.deathAnimationMs - deltaMs;

  if (newDeathAnimationMs <= 0) {
    if (state.lives <= 0) {
      return handleLose(state);
    }

    return startRespawn(state);
  }

  return {
    ...state,
    deathAnimationMs: newDeathAnimationMs,
  };
}

/* 开始重生 */
export function startRespawn(state: PacmanBoardState): PacmanBoardState {
  const newState = resetPacmanPosition(state);
  const withGhostsReset = resetGhostsPosition(newState);
  const withFruitReset = resetFruitState(withGhostsReset);
  const withModeReset = resetGlobalModeState(withFruitReset);

  return {
    ...withModeReset,
    status: 'idle',
    deathAnimationMs: 0,
    respawnAnimationMs: 2000,
    ghostsEatenInFrightened: 0,
  };
}

/* 处理重生动画 */
export function handleRespawnAnimation(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.respawnAnimationMs <= 0) return state;

  const newRespawnAnimationMs = state.respawnAnimationMs - deltaMs;

  if (newRespawnAnimationMs <= 0) {
    return {
      ...state,
      respawnAnimationMs: 0,
      status: 'playing',
      pacman: {
        ...state.pacman,
        isMoving: true,
      },
    };
  }

  return {
    ...state,
    respawnAnimationMs: newRespawnAnimationMs,
  };
}

/* 进入下一关 */
export function proceedToNextLevel(state: PacmanBoardState): PacmanBoardState {
  if (!state.levelComplete) return state;

  return advanceToNextLevel(state);
}

/* 重开本关 */
export function restartLevel(state: PacmanBoardState): PacmanBoardState {
  const newState = createPacmanBoardState({
    packId: state.packId,
    mazeId: state.mazeId,
    level: state.level,
    mode: state.mode,
  });

  return {
    ...newState,
    lives: newState.lives,
    score: 0,
    totalGhostsEaten: 0,
    fruitsCollected: 0,
  };
}

/* 完全重置游戏 */
export function resetGame(state: PacmanBoardState): PacmanBoardState {
  return createPacmanBoardState({
    packId: state.packId,
    mazeId: state.mazeId,
    level: 1,
    mode: state.mode,
  });
}

/* 计算结算结果 */
export function calculateRunResult(state: PacmanBoardState, previousBestScore: number, previousHighestLevel: number): PacmanRunResult {
  return {
    score: state.score,
    level: state.level,
    ghostsEaten: state.totalGhostsEaten,
    fruitsCollected: state.fruitsCollected,
    clearTimeMs: state.elapsedMs,
    pelletsCollected: state.pelletsCollectedTotal,
    isNewBestScore: state.score > previousBestScore,
    isNewHighestLevel: state.level > previousHighestLevel,
  };
}

/* 获取吃鬼得分 */
export function getGhostEatScore(ghostsEatenInFrightened: number): number {
  const index = Math.min(ghostsEatenInFrightened, GHOST_EAT_SCORES.length - 1);
  return GHOST_EAT_SCORES[index];
}

/* 检查是否可以继续吃鬼 */
export function canContinueEatingGhosts(state: PacmanBoardState): boolean {
  return state.globalMode.currentMode === 'frightened' &&
    state.globalMode.frightenedTimerMs > 0;
}

/* 获取剩余生命数描述 */
export function getLivesText(state: PacmanBoardState): string {
  return `${state.lives} 条命`;
}

/* 获取分数描述 */
export function getScoreText(state: PacmanBoardState): string {
  return `${state.score} 分`;
}

/* 获取关卡描述 */
export function getLevelText(state: PacmanBoardState): string {
  return `第 ${state.level} 关`;
}

/* 获取豆子进度描述 */
export function getPelletsProgressText(state: PacmanBoardState): string {
  const maze = getMazeDefinition(state.mazeId);
  const total = maze.totalPellets;
  const remaining = state.pelletsRemaining;
  const collected = total - remaining;
  const percentage = Math.round((collected / total) * 100);

  return `${collected}/${total} (${percentage}%)`;
}

/* 获取游戏状态描述 */
export function getStatusText(state: PacmanBoardState): string {
  const statusNames: Record<string, string> = {
    idle: '等待开始',
    playing: '游戏中',
    paused: '暂停',
    dead: '死亡',
    won: '胜利',
    lost: '失败',
  };

  return statusNames[state.status] || '未知';
}

/* 获取结算摘要 */
export function getGameSummary(state: PacmanBoardState): string {
  if (state.status === 'won') {
    return `恭喜通关第 ${state.level} 关！得分 ${state.score}，用时 ${Math.round(state.elapsedMs / 1000)} 秒`;
  }

  if (state.status === 'lost') {
    return `游戏结束。最终得分 ${state.score}，到达第 ${state.level} 关`;
  }

  return '';
}

/* 检查是否处于游戏进行中 */
export function isGameActive(state: PacmanBoardState): boolean {
  return state.status === 'playing' && !state.isPaused;
}

/* 检查是否可以开始游戏 */
export function canStartGame(state: PacmanBoardState): boolean {
  return state.status === 'idle' && state.respawnAnimationMs <= 0 && state.deathAnimationMs <= 0;
}

/* 处理奖励命等分数里程碑。 */
export function applyScoreBonuses(state: PacmanBoardState): PacmanBoardState {
  if (
    state.mode === 'practice' ||
    isSingleLifePack(state.packId) ||
    state.extraLifeAwarded ||
    state.score < 10000
  ) {
    return state;
  }

  return {
    ...state,
    lives: state.lives + 1,
    extraLifeAwarded: true,
  };
}

/* 检查是否可以暂停 */
export function canPauseGame(state: PacmanBoardState): boolean {
  return state.status === 'playing' && !state.isPaused;
}

/* 检查是否可以恢复 */
export function canResumeGame(state: PacmanBoardState): boolean {
  return state.status === 'paused' && state.isPaused;
}

/* 检查是否可以重开 */
export function canRestartGame(state: PacmanBoardState): boolean {
  return state.status === 'playing' || state.status === 'paused' || state.status === 'dead';
}

/* 检查是否可以进入下一关 */
export function canProceedToNextLevel(state: PacmanBoardState): boolean {
  return state.status === 'won' && state.levelComplete;
}

/* 检查是否显示结算面板 */
export function shouldShowResultPanel(state: PacmanBoardState): boolean {
  return state.status === 'won' || state.status === 'lost';
}

/* 获取死亡原因分析 */
export function getDeathAnalysis(state: PacmanBoardState): string[] {
  if (state.status !== 'lost') return [];

  const analysis: string[] = [];

  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);

  const maze = getMazeDefinition(state.mazeId);

  if (pacmanRow < maze.rows / 3) {
    analysis.push('死亡位置偏上方，注意上方区域风险');
  } else if (pacmanRow > maze.rows * 2 / 3) {
    analysis.push('死亡位置偏下方，注意下方区域风险');
  }

  if (pacmanCol < maze.cols / 3) {
    analysis.push('死亡位置偏左侧，左侧通道较窄');
  } else if (pacmanCol > maze.cols * 2 / 3) {
    analysis.push('死亡位置偏右侧，右侧通道较窄');
  }

  if (state.totalGhostsEaten < 4) {
    analysis.push('吃鬼次数较少，建议多利用能量豆反打');
  }

  if (state.fruitsCollected < 2) {
    analysis.push('水果收集较少，注意水果出现时机');
  }

  if (state.pelletsRemaining > 50) {
    analysis.push('豆子剩余较多，建议优化清图路线');
  }

  if (getElroyPhase(state) !== 'inactive') {
    analysis.push('后半图红鬼已进入加压阶段，尾豆别停在长直道。');
  }

  return analysis;
}

/* 获取胜利分析 */
export function getWinAnalysis(state: PacmanBoardState): string[] {
  if (state.status !== 'won') return [];

  const analysis: string[] = [];

  const clearTimeSeconds = Math.round(state.elapsedMs / 1000);

  if (clearTimeSeconds < 60) {
    analysis.push('清图速度很快，表现优秀');
  } else if (clearTimeSeconds < 90) {
    analysis.push('清图速度良好');
  } else {
    analysis.push('清图速度可以继续提升');
  }

  if (state.lives === DEFAULT_LIVES) {
    analysis.push('无伤通关，完美表现');
  } else if (state.lives >= 2) {
    analysis.push('剩余多条命，表现稳定');
  }

  if (state.totalGhostsEaten >= 8) {
    analysis.push('吃鬼次数很多，能量豆利用充分');
  }

  if (state.fruitsCollected >= 2) {
    analysis.push('水果全部收集，高分表现');
  }

  if (state.extraLifeAwarded) {
    analysis.push('本局已拿到奖励命，后段容错处理不错');
  }

  return analysis;
}
