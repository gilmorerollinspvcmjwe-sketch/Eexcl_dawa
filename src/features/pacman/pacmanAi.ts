/* 吃豆人四鬼AI系统。负责四鬼目标逻辑、状态机、鬼屋放行机制。 */

import type {
  PacmanBoardState,
  GhostInstance,
  GhostId,
  GhostState,
  PacmanDirection,
} from './pacmanTypes.ts';

import {
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTION,
  GHOST_EAT_SCORES,
} from './pacmanTypes.ts';

import {
  getMazeDefinition,
  canMoveInDirection,
  isTunnel,
} from './pacmanBoardState.ts';

const GHOST_MOVEMENT_SCALE = 2.45;

/* Pinky 原版偏移异常开关（原版中向上时偏移4格而非2格） */
export const PINKY_OFFSET_BUG_ENABLED = true;

/* 鬼魂散开目标位置（Scatter模式下各自回到角落） */
export const SCATTER_TARGETS: Record<GhostId, { row: number; col: number }> = {
  blinky: { row: 0, col: 27 },
  pinky: { row: 0, col: 2 },
  inky: { row: 30, col: 27 },
  clyde: { row: 30, col: 0 },
};

/* 鬼屋出口位置 */
export const GHOST_HOUSE_EXIT = { row: 11, col: 14 };

/* 鬼屋中心位置 */
export const GHOST_HOUSE_CENTER = { row: 14, col: 14 };

/* 计算两点距离 */
export function calculateDistance(row1: number, col1: number, row2: number, col2: number): number {
  return Math.sqrt((row2 - row1) ** 2 + (col2 - col1) ** 2);
}

/* 计算Blinky目标（直接追踪Pac-Man当前格） */
export function calculateBlinkyTarget(state: PacmanBoardState): { row: number; col: number } {
  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);
  return { row: pacmanRow, col: pacmanCol };
}

/* 计算Pinky目标（瞄准Pac-Man前方若干格） */
export function calculatePinkyTarget(state: PacmanBoardState): { row: number; col: number } {
  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);
  const pacmanDir = state.pacman.direction;

  const offset = PINKY_OFFSET_BUG_ENABLED && pacmanDir === 'up' ? 4 : 2;
  const vector = DIRECTION_VECTORS[pacmanDir];

  const targetRow = pacmanRow + vector.rowDelta * offset;
  let targetCol = pacmanCol + vector.colDelta * offset;

  if (PINKY_OFFSET_BUG_ENABLED && pacmanDir === 'up') {
    targetCol = pacmanCol - offset;
  }

  return { row: targetRow, col: targetCol };
}

/* 计算Inky目标（以Blinky与Pac-Man前方点构造向量） */
export function calculateInkyTarget(state: PacmanBoardState, blinky: GhostInstance): { row: number; col: number } {
  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);
  const pacmanDir = state.pacman.direction;

  const vector = DIRECTION_VECTORS[pacmanDir];
  const pivotRow = pacmanRow + vector.rowDelta * 2;
  const pivotCol = pacmanCol + vector.colDelta * 2;

  const blinkyRow = Math.round(blinky.pixelY);
  const blinkyCol = Math.round(blinky.pixelX);

  const deltaRow = pivotRow - blinkyRow;
  const deltaCol = pivotCol - blinkyCol;

  const targetRow = pivotRow + deltaRow;
  const targetCol = pivotCol + deltaCol;

  return { row: targetRow, col: targetCol };
}

/* 计算Clyde目标（远距离追击，近距离回角落） */
export function calculateClydeTarget(state: PacmanBoardState): { row: number; col: number } {
  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);

  const clydeRow = Math.round(state.ghosts.find(g => g.ghostId === 'clyde')?.pixelY || 0);
  const clydeCol = Math.round(state.ghosts.find(g => g.ghostId === 'clyde')?.pixelX || 0);

  const distance = calculateDistance(clydeRow, clydeCol, pacmanRow, pacmanCol);

  if (distance > 8) {
    return { row: pacmanRow, col: pacmanCol };
  }

  return SCATTER_TARGETS.clyde;
}

/* 计算鬼魂目标位置 */
export function calculateGhostTarget(state: PacmanBoardState, ghost: GhostInstance): { row: number; col: number } {
  if (ghost.state === 'house') {
    return GHOST_HOUSE_EXIT;
  }

  if (ghost.state === 'leavingHouse') {
    return GHOST_HOUSE_EXIT;
  }

  if (ghost.state === 'respawn') {
    return GHOST_HOUSE_CENTER;
  }

  if (ghost.state === 'eaten') {
    return GHOST_HOUSE_CENTER;
  }

  if (ghost.state === 'frightened') {
    return getRandomFrightenedTarget(ghost);
  }

  if (state.globalMode.currentMode === 'scatter') {
    return SCATTER_TARGETS[ghost.ghostId];
  }

  switch (ghost.ghostId) {
    case 'blinky':
      return calculateBlinkyTarget(state);
    case 'pinky':
      return calculatePinkyTarget(state);
    case 'inky': {
      const blinky = state.ghosts.find(g => g.ghostId === 'blinky')!;
      return calculateInkyTarget(state, blinky);
    }
    case 'clyde':
      return calculateClydeTarget(state);
    default:
      return SCATTER_TARGETS[ghost.ghostId];
  }
}

/* 获取Frightened状态随机目标 */
function getRandomFrightenedTarget(ghost: GhostInstance): { row: number; col: number } {
  const currentRow = Math.round(ghost.pixelY);
  const currentCol = Math.round(ghost.pixelX);

  const directions: PacmanDirection[] = ['up', 'down', 'left', 'right'];

  if (directions.length === 0) {
    return { row: currentRow, col: currentCol };
  }

  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const vector = DIRECTION_VECTORS[randomDir];

  return {
    row: currentRow + vector.rowDelta,
    col: currentCol + vector.colDelta,
  };
}

/* 选择最佳移动方向 */
export function chooseBestDirection(
  state: PacmanBoardState,
  ghost: GhostInstance,
  target: { row: number; col: number }
): PacmanDirection {
  const maze = getMazeDefinition(state.mazeId);
  const currentRow = Math.round(ghost.pixelY);
  const currentCol = Math.round(ghost.pixelX);

  const directions: PacmanDirection[] = ['up', 'left', 'down', 'right'];

  const oppositeDir = OPPOSITE_DIRECTION[ghost.direction];
  const validDirections = directions.filter(dir => {
    if (dir === oppositeDir && ghost.state !== 'frightened' && ghost.state !== 'eaten') {
      return false;
    }
    return canMoveInDirection(maze, currentRow, currentCol, dir, true);
  });

  if (validDirections.length === 0) {
    return ghost.direction;
  }

  if (ghost.state === 'frightened') {
    return validDirections[Math.floor(Math.random() * validDirections.length)];
  }

  let bestDirection = validDirections[0];
  let bestDistance = Infinity;

  for (const dir of validDirections) {
    const vector = DIRECTION_VECTORS[dir];
    const newRow = currentRow + vector.rowDelta;
    const newCol = currentCol + vector.colDelta;
    const distance = calculateDistance(newRow, newCol, target.row, target.col);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
}

/* 更新鬼魂状态 */
export function updateGhostState(state: PacmanBoardState, ghost: GhostInstance, deltaMs: number): GhostInstance {
  const newGhost = { ...ghost };

  if (ghost.state === 'house') {
    const pelletsCollected = state.pelletsCollectedTotal;
    const elapsedMs = state.elapsedMs;

    if (pelletsCollected >= ghost.pelletsRequiredToLeave || elapsedMs >= ghost.timeRequiredToLeaveMs) {
      newGhost.state = 'leavingHouse';
      newGhost.targetRow = GHOST_HOUSE_EXIT.row;
      newGhost.targetCol = GHOST_HOUSE_EXIT.col;
    }
    return newGhost;
  }

  if (ghost.state === 'leavingHouse') {
    const currentRow = Math.round(ghost.pixelY);
    const currentCol = Math.round(ghost.pixelX);

    if (currentRow === GHOST_HOUSE_EXIT.row && currentCol === GHOST_HOUSE_EXIT.col) {
      newGhost.state = state.globalMode.currentMode === 'frightened' ? 'frightened' : state.globalMode.currentMode;
      newGhost.direction = 'left';
    }
    return newGhost;
  }

  if (ghost.state === 'respawn') {
    const currentRow = Math.round(ghost.pixelY);
    const currentCol = Math.round(ghost.pixelX);

    if (currentRow === GHOST_HOUSE_CENTER.row && currentCol === GHOST_HOUSE_CENTER.col) {
      newGhost.state = 'leavingHouse';
      newGhost.targetRow = GHOST_HOUSE_EXIT.row;
      newGhost.targetCol = GHOST_HOUSE_EXIT.col;
    }
    return newGhost;
  }

  if (ghost.state === 'frightened') {
    newGhost.frightenedTimerMs = ghost.frightenedTimerMs - deltaMs;

    if (newGhost.frightenedTimerMs <= 0) {
      newGhost.state = state.globalMode.currentMode === 'scatter' ? 'scatter' : 'chase';
      newGhost.frightenedTimerMs = 0;
    }
    return newGhost;
  }

  if (ghost.state === 'eaten') {
    const currentRow = Math.round(ghost.pixelY);
    const currentCol = Math.round(ghost.pixelX);

    if (currentRow === GHOST_HOUSE_CENTER.row && currentCol === GHOST_HOUSE_CENTER.col) {
      newGhost.state = 'respawn';
    }
    return newGhost;
  }

  return newGhost;
}

/* 更新鬼魂位置 */
export function updateGhostPosition(state: PacmanBoardState, ghost: GhostInstance, deltaMs: number): GhostInstance {
  if (state.status !== 'playing' || state.isPaused) return ghost;

  const maze = getMazeDefinition(state.mazeId);
  const newGhost = updateGhostState(state, ghost, deltaMs);

  const target = calculateGhostTarget(state, newGhost);
  newGhost.targetRow = target.row;
  newGhost.targetCol = target.col;

  const speedMultiplier = newGhost.state === 'frightened'
    ? state.levelTuning.frightenedGhostSpeed
    : newGhost.state === 'eaten'
      ? 2
      : isTunnel(maze, Math.round(newGhost.pixelY), Math.round(newGhost.pixelX))
        ? state.levelTuning.ghostTunnelSpeedMultiplier
        : 1;

  const baseSpeed = state.levelTuning.ghostSpeed + getElroySpeedBonus(state, newGhost);
  const actualSpeed = baseSpeed * speedMultiplier;
  const speedPerTick = actualSpeed * GHOST_MOVEMENT_SCALE * (deltaMs / 1000);

  const currentRow = Math.round(newGhost.pixelY);
  const currentCol = Math.round(newGhost.pixelX);

  const isAtCenter = Math.abs(newGhost.pixelY - currentRow) < 0.1 &&
    Math.abs(newGhost.pixelX - currentCol) < 0.1;

  if (isAtCenter) {
    const bestDirection = chooseBestDirection(state, newGhost, target);
    newGhost.direction = bestDirection;
  }

  if (newGhost.direction === 'none') return newGhost;

  const vector = DIRECTION_VECTORS[newGhost.direction];
  let newPixelX = newGhost.pixelX + vector.colDelta * speedPerTick;
  let newPixelY = newGhost.pixelY + vector.rowDelta * speedPerTick;

  if (!canMoveInDirection(maze, currentRow, currentCol, newGhost.direction, true)) {
    if (isTunnel(maze, currentRow, currentCol)) {
      const exitRow = currentRow === maze.tunnelLeft.row ? maze.tunnelRight.row : maze.tunnelLeft.row;
      const exitCol = currentCol === maze.tunnelLeft.col ? maze.tunnelRight.col : maze.tunnelLeft.col;
      newPixelX = exitCol;
      newPixelY = exitRow;
    } else {
      newPixelX = currentCol;
      newPixelY = currentRow;
    }
  }

  newGhost.pixelX = newPixelX;
  newGhost.pixelY = newPixelY;
  newGhost.row = Math.round(newPixelY);
  newGhost.col = Math.round(newPixelX);
  newGhost.isInTunnel = isTunnel(maze, newGhost.row, newGhost.col);

  return newGhost;
}

/* 更新所有鬼魂 */
export function updateAllGhosts(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  const newGhosts = state.ghosts.map(ghost => updateGhostPosition(state, ghost, deltaMs));

  return {
    ...state,
    ghosts: newGhosts,
  };
}

/* 检查鬼魂是否可以离开鬼屋 */
export function canGhostLeaveHouse(state: PacmanBoardState, ghost: GhostInstance): boolean {
  if (ghost.state !== 'house') return false;

  const pelletsCollected = state.pelletsCollectedTotal;
  const elapsedMs = state.elapsedMs;

  return pelletsCollected >= ghost.pelletsRequiredToLeave || elapsedMs >= ghost.timeRequiredToLeaveMs;
}

/* 检查 Pac-Man 与鬼魂碰撞 */
export function checkGhostCollision(state: PacmanBoardState): { collided: boolean; ghost: GhostInstance | null } {
  const pacmanY = state.pacman.pixelY;
  const pacmanX = state.pacman.pixelX;

  for (const ghost of state.ghosts) {
    if (ghost.state === 'house' || ghost.state === 'leavingHouse' || ghost.state === 'respawn' || ghost.state === 'eaten') {
      continue;
    }

    const distance = calculateDistance(pacmanY, pacmanX, ghost.pixelY, ghost.pixelX);

    if (distance < 0.6) {
      return { collided: true, ghost };
    }
  }

  return { collided: false, ghost: null };
}

/* 处理吃鬼 */
export function eatGhost(state: PacmanBoardState, ghost: GhostInstance): PacmanBoardState {
  const eatIndex = state.ghostsEatenInFrightened;
  const score = GHOST_EAT_SCORES[Math.min(eatIndex, GHOST_EAT_SCORES.length - 1)];

  const newGhosts = state.ghosts.map(g => {
    if (g.ghostId === ghost.ghostId) {
      return {
        ...g,
        state: 'eaten' as GhostState,
        direction: 'none' as PacmanDirection,
        speed: 2,
      };
    }
    return g;
  });

  return {
    ...state,
    ghosts: newGhosts,
    score: state.score + score,
    ghostsEatenInFrightened: state.ghostsEatenInFrightened + 1,
    totalGhostsEaten: state.totalGhostsEaten + 1,
  };
}

/* 处理鬼魂吃 Pac-Man */
export function handlePacmanDeath(state: PacmanBoardState): PacmanBoardState {
  return {
    ...state,
    lives: state.lives - 1,
    status: state.lives <= 1 ? 'lost' : 'dead',
    deathAnimationMs: 1000,
    gameOver: state.lives <= 1,
  };
}

/* 重置鬼魂位置 */
export function resetGhostsPosition(state: PacmanBoardState): PacmanBoardState {
  const maze = getMazeDefinition(state.mazeId);

  const newGhosts = state.ghosts.map(ghost => {
    const spawn = maze.ghostSpawns[ghost.ghostId];
    return {
      ...ghost,
      row: spawn.row,
      col: spawn.col,
      pixelX: spawn.col,
      pixelY: spawn.row,
      direction: 'up' as PacmanDirection,
      state: ghost.ghostId === 'blinky' ? 'scatter' as GhostState : 'house' as GhostState,
      isInTunnel: false,
      frightenedTimerMs: 0,
    };
  });

  return {
    ...state,
    ghosts: newGhosts,
  };
}

/* 获取鬼魂状态描述 */
export function getGhostStateText(ghost: GhostInstance): string {
  const stateNames: Record<GhostState, string> = {
    house: '鬼屋',
    leavingHouse: '离开鬼屋',
    scatter: '散开',
    chase: '追击',
    frightened: '惊吓',
    eaten: '被吃',
    respawn: '重生',
  };
  return stateNames[ghost.state];
}

/* 获取 Elroy 速度加成 */
export function getElroySpeedBonus(state: PacmanBoardState, ghost: GhostInstance): number {
  if (ghost.ghostId !== 'blinky' || (ghost.state !== 'scatter' && ghost.state !== 'chase')) return 0;

  const pelletsRemaining = state.pelletsRemaining;

  if (pelletsRemaining <= state.levelTuning.elroy2Threshold) {
    return state.levelTuning.elroy2SpeedBonus;
  }

  if (pelletsRemaining <= state.levelTuning.elroy1Threshold) {
    return state.levelTuning.elroy1SpeedBonus;
  }

  return 0;
}

/* 获取当前 Elroy 阶段。 */
export function getElroyPhase(state: PacmanBoardState): 'inactive' | 'elroy1' | 'elroy2' {
  if (state.pelletsRemaining <= state.levelTuning.elroy2Threshold) {
    return 'elroy2';
  }

  if (state.pelletsRemaining <= state.levelTuning.elroy1Threshold) {
    return 'elroy1';
  }

  return 'inactive';
}
