/* 吃豆人移动与输入系统。负责方向输入处理、转向缓存、位移与碰撞判定、传送门穿越。 */

import type {
  PacmanBoardState,
  PacmanDirection,
  PacmanInstance,
  PacmanCellType,
} from './pacmanTypes.ts';

import { DIRECTION_VECTORS } from './pacmanTypes.ts';

import {
  getMazeDefinition,
  canMoveInDirection,
  isTunnel,
  getTunnelExit,
  isEnergizerPosition,
} from './pacmanBoardState.ts';

import { restartLevel } from './pacmanGameLogic.ts';

const PACMAN_MOVEMENT_SCALE = 2.8;

/* 处理方向输入 */
export function handleDirectionInput(state: PacmanBoardState, direction: PacmanDirection): PacmanBoardState {
  if (state.status !== 'playing' || state.isPaused) return state;
  if (direction === 'none') return state;

  return {
    ...state,
    lastInputDirection: direction,
    pacman: {
      ...state.pacman,
      nextDirection: direction,
    },
  };
}

/* 尝试转向（在路口处） */
export function tryTurn(state: PacmanBoardState): PacmanBoardState {
  const { pacman } = state;
  const maze = getMazeDefinition(state.mazeId);

  if (pacman.nextDirection === 'none') return state;

  const currentRow = Math.round(pacman.pixelY);
  const currentCol = Math.round(pacman.pixelX);

  const isAtCenter = Math.abs(pacman.pixelY - currentRow) < 0.1 &&
    Math.abs(pacman.pixelX - currentCol) < 0.1;

  if (!isAtCenter) return state;

  if (canMoveInDirection(maze, currentRow, currentCol, pacman.nextDirection, false)) {
    return {
      ...state,
      pacman: {
        ...pacman,
        direction: pacman.nextDirection,
        nextDirection: 'none',
      },
    };
  }

  return state;
}

/* 更新 Pac-Man 位置 */
export function updatePacmanPosition(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.status !== 'playing' || state.isPaused) return state;
  if (state.deathAnimationMs > 0) return state;

  const maze = getMazeDefinition(state.mazeId);
  const speedPerTick = state.pacman.speed * PACMAN_MOVEMENT_SCALE * (deltaMs / 1000);

  const newState = tryTurn(state);
  const pacman = newState.pacman;

  if (pacman.direction === 'none') return newState;

  const vector = DIRECTION_VECTORS[pacman.direction];
  let newPixelX = pacman.pixelX + vector.colDelta * speedPerTick;
  let newPixelY = pacman.pixelY + vector.rowDelta * speedPerTick;

  const currentRow = Math.round(pacman.pixelY);
  const currentCol = Math.round(pacman.pixelX);

  if (!canMoveInDirection(maze, currentRow, currentCol, pacman.direction, false)) {
    if (isTunnel(maze, currentRow, currentCol)) {
      const exit = getTunnelExit(maze, currentRow, currentCol);
      if (exit) {
        newPixelX = exit.col;
        newPixelY = exit.row;
      }
    } else {
      newPixelX = currentCol;
      newPixelY = currentRow;
    }
  }

  const targetRow = Math.round(newPixelY);
  const targetCol = Math.round(newPixelX);

  let scoreUpdate = newState.score;
  let pelletsRemaining = newState.pelletsRemaining;
  let energizersRemaining = newState.energizersRemaining;
  let globalMode = newState.globalMode;
  let ghosts = newState.ghosts;
  let ghostsEatenInFrightened = newState.ghostsEatenInFrightened;
  let eatenPelletPositions = newState.eatenPelletPositions;
  let eatenEnergizerPositions = newState.eatenEnergizerPositions;

  const cellType = maze.grid[targetRow]?.[targetCol];
  let pelletsCollectedTotal = newState.pelletsCollectedTotal;
  if (cellType === 'pellet' && Math.abs(newPixelX - targetCol) < 0.8 && Math.abs(newPixelY - targetRow) < 0.8) {
    const key = `${targetRow}:${targetCol}`;
    if (!eatenPelletPositions.has(key)) {
      scoreUpdate += 10;
      pelletsRemaining--;
      pelletsCollectedTotal++;
      eatenPelletPositions = new Set(eatenPelletPositions);
      eatenPelletPositions.add(key);
    }
  }

  if (isEnergizerPosition(maze, targetRow, targetCol) && Math.abs(newPixelX - targetCol) < 0.8 && Math.abs(newPixelY - targetRow) < 0.8) {
    const key = `${targetRow}:${targetCol}`;
    if (!eatenEnergizerPositions.has(key)) {
      scoreUpdate += 50;
      energizersRemaining--;
      eatenEnergizerPositions = new Set(eatenEnergizerPositions);
      eatenEnergizerPositions.add(key);

      if (state.levelTuning.frightenedDurationMs > 0) {
        globalMode = {
          ...globalMode,
          currentMode: 'frightened',
          frightenedTimerMs: state.levelTuning.frightenedDurationMs,
          frightenedBlinkPhase: false,
        };

        ghosts = ghosts.map(ghost => {
          if (ghost.state === 'scatter' || ghost.state === 'chase') {
            return {
              ...ghost,
              state: 'frightened' as const,
              frightenedTimerMs: state.levelTuning.frightenedDurationMs,
              direction: getOppositeDirection(ghost.direction),
            };
          }
          return ghost;
        });

        ghostsEatenInFrightened = 0;
      }
    }
  }

  return {
    ...newState,
    pacman: {
      ...pacman,
      pixelX: newPixelX,
      pixelY: newPixelY,
      row: Math.round(newPixelY),
      col: Math.round(newPixelX),
      isMoving: true,
    },
    score: scoreUpdate,
    pelletsRemaining,
    energizersRemaining,
    globalMode,
    ghosts,
    ghostsEatenInFrightened,
    pelletsCollectedTotal,
    eatenPelletPositions,
    eatenEnergizerPositions,
  };
}

/* 获取反方向 */
function getOppositeDirection(direction: PacmanDirection): PacmanDirection {
  const opposites: Record<PacmanDirection, PacmanDirection> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
    none: 'none',
  };
  return opposites[direction];
}

/* 检查 Pac-Man 是否到达格子中心 */
export function isAtCellCenter(pacman: PacmanInstance): boolean {
  const row = Math.round(pacman.pixelY);
  const col = Math.round(pacman.pixelX);
  return Math.abs(pacman.pixelY - row) < 0.05 && Math.abs(pacman.pixelX - col) < 0.05;
}

/* 获取 Pac-Man 当前所在单元格类型 */
export function getCurrentCellType(state: PacmanBoardState): PacmanCellType {
  const maze = getMazeDefinition(state.mazeId);
  const row = Math.round(state.pacman.pixelY);
  const col = Math.round(state.pacman.pixelX);
  return maze.grid[row]?.[col] || 'wall';
}

/* 处理传送门穿越 */
export function handleTunnelCrossing(state: PacmanBoardState): PacmanBoardState {
  const maze = getMazeDefinition(state.mazeId);
  const { pacman } = state;

  const currentRow = Math.round(pacman.pixelY);
  const currentCol = Math.round(pacman.pixelX);

  if (isTunnel(maze, currentRow, currentCol)) {
    if (pacman.direction === 'left' && currentCol <= 0) {
      const exit = getTunnelExit(maze, currentRow, currentCol);
      if (exit) {
        return {
          ...state,
          tunnelUses: state.tunnelUses + 1,
          pacman: {
            ...pacman,
            pixelX: exit.col,
            pixelY: exit.row,
            row: exit.row,
            col: exit.col,
          },
        };
      }
    }

    if (pacman.direction === 'right' && currentCol >= maze.cols - 1) {
      const exit = getTunnelExit(maze, currentRow, currentCol);
      if (exit) {
        return {
          ...state,
          tunnelUses: state.tunnelUses + 1,
          pacman: {
            ...pacman,
            pixelX: exit.col,
            pixelY: exit.row,
            row: exit.row,
            col: exit.col,
          },
        };
      }
    }
  }

  return state;
}

/* 开始游戏 */
export function startGame(state: PacmanBoardState): PacmanBoardState {
  if (state.status !== 'idle' || state.respawnAnimationMs > 0 || state.deathAnimationMs > 0) return state;

  return {
    ...state,
    status: 'playing',
    isPaused: false,
    pacman: {
      ...state.pacman,
      isMoving: true,
    },
  };
}

/* 暂停游戏 */
export function pauseGame(state: PacmanBoardState): PacmanBoardState {
  if (state.status !== 'playing') return state;

  return {
    ...state,
    status: 'paused',
    isPaused: true,
    pacman: {
      ...state.pacman,
      isMoving: false,
    },
  };
}

/* 恢复游戏 */
export function resumeGame(state: PacmanBoardState): PacmanBoardState {
  if ((state.status !== 'paused' && state.status !== 'playing') || !state.isPaused) return state;

  return {
    ...state,
    status: 'playing',
    isPaused: false,
    pacman: {
      ...state.pacman,
      isMoving: true,
    },
  };
}

/* 重置 Pac-Man 位置（重生） */
export function resetPacmanPosition(state: PacmanBoardState): PacmanBoardState {
  const maze = getMazeDefinition(state.mazeId);

  return {
    ...state,
    pacman: {
      ...state.pacman,
      row: maze.pacmanSpawn.row,
      col: maze.pacmanSpawn.col,
      pixelX: maze.pacmanSpawn.col,
      pixelY: maze.pacmanSpawn.row,
      direction: 'left',
      nextDirection: 'none',
      isMoving: false,
    },
    respawnAnimationMs: 0,
  };
}

/* 键盘输入映射 */
export const KEY_DIRECTION_MAP: Record<string, PacmanDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

/* 处理键盘事件 */
export function handleKeyboardEvent(state: PacmanBoardState, key: string): PacmanBoardState {
  const direction = KEY_DIRECTION_MAP[key];
  if (direction) {
    return handleDirectionInput(state, direction);
  }

  if (key === 'p' || key === 'P' || key === 'Escape') {
    if (state.isPaused) {
      return resumeGame(state);
    } else {
      return pauseGame(state);
    }
  }

  if (key === 'r' || key === 'R') {
    if (state.status === 'playing' || state.status === 'paused' || state.status === 'won' || state.status === 'lost' || state.status === 'dead') {
      return restartLevel(state);
    }
  }

  if (key === 'Enter' || key === ' ') {
    if (state.status === 'idle') {
      return startGame(state);
    }
    if (state.status === 'paused') {
      return resumeGame(state);
    }
  }

  return state;
}
