/* 吃豆人迷宫与豆子系统。负责迷宫初始化、豆子分布、能量豆分布、传送门逻辑、拾取与得分。 */

import type {
  PacmanBoardState,
  PacmanMazeDefinition,
  PacmanCellType,
  PacmanInstance,
  GhostInstance,
  GlobalModeState,
  LevelTuningParams,
  GhostId,
  PacmanDirection,
  CreatePacmanBoardOptions,
  ScatterChasePhase,
  FruitInstance,
} from './pacmanTypes.ts';

import {
  GHOST_IDS,
  DIRECTION_VECTORS,
  DEFAULT_LIVES,
  PELLET_SCORE,
  ENERGIZER_SCORE,
  GHOST_RELEASE_CONFIG,
  FRUIT_IDS,
} from './pacmanTypes.ts';
import { getLevelMeta, isSingleLifePack } from './pacmanMapRegistry.ts';
import { getLevelTuningByPack } from './pacmanContent.ts';

/* 复制迷宫网格，避免变体直接修改原图。 */
function cloneMazeGrid(grid: PacmanCellType[][]): PacmanCellType[][] {
  return grid.map((row) => [...row]);
}

/* 统计迷宫里的普通豆子数量。 */
function countPelletsInGrid(grid: PacmanCellType[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === 'pellet') {
        count += 1;
      }
    }
  }
  return count;
}

/* 在经典迷宫基础上开出更快的中央果路。 */
function createFruitRushMazeGrid(): PacmanCellType[][] {
  const grid = cloneMazeGrid(CLASSIC_MAZE_GRID);
  const carvePositions = [
    { row: 11, col: 10 },
    { row: 11, col: 17 },
    { row: 12, col: 10 },
    { row: 12, col: 17 },
    { row: 13, col: 10 },
    { row: 13, col: 17 },
    { row: 17, col: 10 },
    { row: 17, col: 17 },
    { row: 18, col: 10 },
    { row: 18, col: 17 },
    { row: 19, col: 10 },
    { row: 19, col: 17 },
    { row: 24, col: 4 },
    { row: 24, col: 23 },
  ];

  for (const { row, col } of carvePositions) {
    grid[row][col] = 'pellet';
  }

  return grid;
}

/* 经典街机迷宫定义（28x31） */
const CLASSIC_MAZE_GRID: PacmanCellType[][] = [
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
  ['wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall'],
  ['wall', 'energizer', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'energizer', 'wall', 'wall'],
  ['wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall'],
  ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'ghostHouse', 'ghostHouse', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'ghostHouse', 'ghostHouse', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'ghostHouse', 'ghostHouse', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
  ['wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall'],
  ['wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall'],
  ['wall', 'energizer', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'energizer', 'pellet', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
];

/* 经典迷宫定义 */
export const CLASSIC_MAZE: PacmanMazeDefinition = {
  id: 'classic',
  name: '经典迷宫',
  rows: 31,
  cols: 28,
  grid: CLASSIC_MAZE_GRID,
  pacmanSpawn: { row: 23, col: 14 },
  ghostHouseCenter: { row: 14, col: 14 },
  ghostSpawns: {
    blinky: { row: 11, col: 14 },
    pinky: { row: 14, col: 14 },
    inky: { row: 14, col: 12 },
    clyde: { row: 14, col: 16 },
  },
  tunnelLeft: { row: 14, col: 0 },
  tunnelRight: { row: 14, col: 27 },
  energizerPositions: [
    { row: 5, col: 1 },
    { row: 5, col: 26 },
    { row: 23, col: 1 },
    { row: 23, col: 26 },
  ],
  fruitSpawnPosition: { row: 17, col: 14 },
  totalPellets: countPelletsInGrid(CLASSIC_MAZE_GRID),
};

const FRUIT_RUSH_MAZE_GRID = createFruitRushMazeGrid();

/* 水果冲分迷宫定义：中央与底部增加果路线捷径。 */
export const FRUIT_RUSH_MAZE: PacmanMazeDefinition = {
  id: 'fruit_rush',
  name: '果路迷宫',
  rows: 31,
  cols: 28,
  grid: FRUIT_RUSH_MAZE_GRID,
  pacmanSpawn: { row: 23, col: 14 },
  ghostHouseCenter: { row: 14, col: 14 },
  ghostSpawns: {
    blinky: { row: 11, col: 14 },
    pinky: { row: 14, col: 14 },
    inky: { row: 14, col: 12 },
    clyde: { row: 14, col: 16 },
  },
  tunnelLeft: { row: 14, col: 0 },
  tunnelRight: { row: 14, col: 27 },
  energizerPositions: [
    { row: 5, col: 1 },
    { row: 5, col: 26 },
    { row: 23, col: 1 },
    { row: 23, col: 26 },
  ],
  fruitSpawnPosition: { row: 17, col: 14 },
  totalPellets: countPelletsInGrid(FRUIT_RUSH_MAZE_GRID),
};

/* 迷宫注册表 */
export const MAZE_REGISTRY: Record<string, PacmanMazeDefinition> = {
  classic: CLASSIC_MAZE,
  fruit_rush: FRUIT_RUSH_MAZE,
};

/* 获取迷宫定义 */
export function getMazeDefinition(mazeId: string): PacmanMazeDefinition {
  return MAZE_REGISTRY[mazeId] || CLASSIC_MAZE;
}

/* 计算豆子数量 */
export function countPellets(maze: PacmanMazeDefinition): number {
  let count = 0;
  for (let row = 0; row < maze.rows; row++) {
    for (let col = 0; col < maze.cols; col++) {
      if (maze.grid[row][col] === 'pellet') {
        count++;
      }
    }
  }
  return count;
}

/* 计算能量豆数量 */
export function countEnergizers(maze: PacmanMazeDefinition): number {
  return maze.energizerPositions.length;
}

/* 检查单元格是否可通行 */
export function isWalkable(cellType: PacmanCellType): boolean {
  return cellType === 'path' ||
    cellType === 'pellet' ||
    cellType === 'energizer' ||
    cellType === 'tunnel' ||
    cellType === 'fruitSpawn' ||
    cellType === 'pacmanSpawn' ||
    cellType === 'ghostDoor';
}

/* 检查单元格是否是传送门 */
export function isTunnel(maze: PacmanMazeDefinition, row: number, col: number): boolean {
  return (row === maze.tunnelLeft.row && col === maze.tunnelLeft.col) ||
    (row === maze.tunnelRight.row && col === maze.tunnelRight.col);
}

/* 检查是否在鬼屋内 */
export function isGhostHouse(maze: PacmanMazeDefinition, row: number, col: number): boolean {
  const cell = maze.grid[row]?.[col];
  return cell === 'ghostHouse' || cell === 'ghostDoor';
}

/* 获取传送门另一端 */
export function getTunnelExit(maze: PacmanMazeDefinition, row: number, col: number): { row: number; col: number } | null {
  if (row === maze.tunnelLeft.row && col === maze.tunnelLeft.col) {
    return { row: maze.tunnelRight.row, col: maze.tunnelRight.col };
  }
  if (row === maze.tunnelRight.row && col === maze.tunnelRight.col) {
    return { row: maze.tunnelLeft.row, col: maze.tunnelLeft.col };
  }
  return null;
}

/* 检查方向是否可行 */
export function canMoveInDirection(
  maze: PacmanMazeDefinition,
  row: number,
  col: number,
  direction: PacmanDirection,
  isGhost: boolean = false
): boolean {
  if (direction === 'none') return false;
  const vector = DIRECTION_VECTORS[direction];
  const newRow = row + vector.rowDelta;
  const newCol = col + vector.colDelta;

  if (newRow < 0 || newRow >= maze.rows || newCol < 0 || newCol >= maze.cols) {
    return false;
  }

  const cellType = maze.grid[newRow][newCol];

  if (isTunnel(maze, row, col)) {
    return true;
  }

  if (isGhost) {
    return isWalkable(cellType) || cellType === 'ghostHouse' || cellType === 'ghostDoor';
  }

  return isWalkable(cellType) && cellType !== 'ghostHouse';
}

/* 获取关卡调优参数 */
export function getLevelTuningParams(level: number): LevelTuningParams {
  const baseSchedule: ScatterChasePhase[] = [
    { mode: 'scatter', durationMs: 7000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 7000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 5000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 5000 },
    { mode: 'chase', durationMs: Infinity },
  ];

  const frightenedDuration = level <= 2 ? 6000 :
    level <= 4 ? 5000 :
    level <= 6 ? 4000 :
    level <= 8 ? 3000 :
    level <= 10 ? 2000 :
    level <= 12 ? 1000 :
    0;

  const frightenedBlinkStart = frightenedDuration > 0 ? frightenedDuration - 2000 : 0;

  const pacmanSpeed = level <= 1 ? 0.8 :
    level <= 4 ? 0.9 :
    level <= 8 ? 0.95 :
    1.0;

  const ghostSpeed = level <= 1 ? 0.75 :
    level <= 4 ? 0.85 :
    level <= 8 ? 0.95 :
    1.0;

  const tunnelMultiplier = level <= 1 ? 0.4 :
    level <= 4 ? 0.45 :
    level <= 8 ? 0.5 :
    0.6;

  const fruitIndex = Math.min(level - 1, FRUIT_IDS.length - 1);

  return {
    level,
    pacmanSpeed,
    ghostSpeed,
    ghostTunnelSpeedMultiplier: tunnelMultiplier,
    frightenedGhostSpeed: 0.5,
    frightenedDurationMs: frightenedDuration,
    frightenedBlinkStartMs: frightenedBlinkStart,
    scatterChaseSchedule: baseSchedule,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.1,
  };
}

/* 创建初始全局模式状态 */
export function createInitialGlobalModeState(tuning: LevelTuningParams): GlobalModeState {
  return {
    currentMode: 'scatter',
    modeIndex: 0,
    modeTimerMs: 0,
    frightenedTimerMs: 0,
    frightenedBlinkPhase: false,
    scatterChaseSchedule: tuning.scatterChaseSchedule,
    frightenedDurationMs: tuning.frightenedDurationMs,
    frightenedBlinkStartMs: tuning.frightenedBlinkStartMs,
  };
}

/* 创建初始 Pac-Man 实例 */
export function createInitialPacman(maze: PacmanMazeDefinition, tuning: LevelTuningParams): PacmanInstance {
  return {
    row: maze.pacmanSpawn.row,
    col: maze.pacmanSpawn.col,
    direction: 'left',
    nextDirection: 'none',
    pixelX: maze.pacmanSpawn.col,
    pixelY: maze.pacmanSpawn.row,
    speed: tuning.pacmanSpeed,
    isMoving: false,
  };
}

/* 创建初始鬼魂实例 */
export function createInitialGhosts(maze: PacmanMazeDefinition, tuning: LevelTuningParams): GhostInstance[] {
  return GHOST_IDS.map((ghostId: GhostId) => {
    const spawn = maze.ghostSpawns[ghostId];
    const releaseConfig = GHOST_RELEASE_CONFIG[ghostId];
    return {
      ghostId,
      row: spawn.row,
      col: spawn.col,
      direction: 'up',
      pixelX: spawn.col,
      pixelY: spawn.row,
      state: ghostId === 'blinky' ? 'scatter' : 'house',
      speed: tuning.ghostSpeed,
      pelletsRequiredToLeave: releaseConfig.pelletsRequired,
      timeRequiredToLeaveMs: releaseConfig.timeMs,
      frightenedTimerMs: 0,
      eatenScoreMultiplier: 1,
      targetRow: 0,
      targetCol: 0,
      isInTunnel: false,
    };
  });
}

/* 创建初始水果实例 */
export function createInitialFruit(tuning: LevelTuningParams): FruitInstance {
  const fruitId = FRUIT_IDS[tuning.fruitIndex];
  return {
    fruitId,
    row: 0,
    col: 0,
    isActive: false,
    spawnTimeMs: 0,
    lifetimeMs: tuning.fruitLifetimeMs,
    remainingMs: 0,
  };
}

/* 创建初始游戏状态 */
export function createPacmanBoardState(options: CreatePacmanBoardOptions = {}): PacmanBoardState {
  const { packId, mazeId, tuning } = resolveLevelContext(options);
  const level = options.level || 1;
  const mode = options.mode || 'classic';

  const maze = getMazeDefinition(mazeId);
  const pelletsRemaining = countPellets(maze);
  const energizersRemaining = countEnergizers(maze);

  return {
    packId,
    mazeId,
    rows: maze.rows,
    cols: maze.cols,
    cellSize: 16,
    status: 'idle',
    mode,
    level,
    score: 0,
    lives: isSingleLifePack(packId) ? 1 : DEFAULT_LIVES,
    pelletsRemaining,
    energizersRemaining,
    ghostsEatenInFrightened: 0,
    totalGhostsEaten: 0,
    fruitsCollected: 0,
    fruitSpawnsTriggered: 0,
    elapsedMs: 0,
    pacman: createInitialPacman(maze, tuning),
    ghosts: createInitialGhosts(maze, tuning),
    fruit: createInitialFruit(tuning),
    globalMode: createInitialGlobalModeState(tuning),
    pelletsCollectedTotal: 0,
    levelTuning: tuning,
    isPaused: false,
    gameOver: false,
    levelComplete: false,
    deathAnimationMs: 0,
    respawnAnimationMs: 0,
    lastInputDirection: 'none',
    tickAccumulatorMs: 0,
    eatenPelletPositions: new Set<string>(),
    eatenEnergizerPositions: new Set<string>(),
    tunnelUses: 0,
    extraLifeAwarded: false,
  };
}

/* 拾取豆子 */
export function collectPellet(state: PacmanBoardState, row: number, col: number): PacmanBoardState {
  if (state.pelletsRemaining <= 0) return state;

  const key = `${row}:${col}`;
  const newEatenPositions = new Set(state.eatenPelletPositions);
  newEatenPositions.add(key);

  return {
    ...state,
    pelletsRemaining: state.pelletsRemaining - 1,
    pelletsCollectedTotal: state.pelletsCollectedTotal + 1,
    score: state.score + PELLET_SCORE,
    eatenPelletPositions: newEatenPositions,
  };
}

/* 拾取能量豆 */
export function collectEnergizer(state: PacmanBoardState, row: number, col: number): PacmanBoardState {
  if (state.energizersRemaining <= 0) return state;

  const key = `${row}:${col}`;
  const newEatenPositions = new Set(state.eatenEnergizerPositions);
  newEatenPositions.add(key);

  const newGlobalMode: GlobalModeState = {
    ...state.globalMode,
    currentMode: 'frightened',
    frightenedTimerMs: state.levelTuning.frightenedDurationMs,
    frightenedBlinkPhase: false,
  };

  const newGhosts = state.ghosts.map(ghost => {
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

  return {
    ...state,
    energizersRemaining: state.energizersRemaining - 1,
    score: state.score + ENERGIZER_SCORE,
    ghostsEatenInFrightened: 0,
    globalMode: newGlobalMode,
    ghosts: newGhosts,
    eatenEnergizerPositions: newEatenPositions,
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

/* 检查是否在能量豆位置 */
export function isEnergizerPosition(maze: PacmanMazeDefinition, row: number, col: number): boolean {
  return maze.energizerPositions.some(pos => pos.row === row && pos.col === col);
}

/* 检查是否在水果生成位置 */
export function isFruitSpawnPosition(maze: PacmanMazeDefinition, row: number, col: number): boolean {
  return maze.fruitSpawnPosition.row === row && maze.fruitSpawnPosition.col === col;
}

/* 重置关卡状态 */
export function resetLevelState(state: PacmanBoardState): PacmanBoardState {
  const maze = getMazeDefinition(state.mazeId);
  const tuning = getLevelTuningByPack(state.packId, state.level);

  return {
    ...state,
    status: 'idle',
    pelletsRemaining: countPellets(maze),
    energizersRemaining: countEnergizers(maze),
    ghostsEatenInFrightened: 0,
    fruitSpawnsTriggered: 0,
    elapsedMs: 0,
    pacman: createInitialPacman(maze, tuning),
    ghosts: createInitialGhosts(maze, tuning),
    fruit: createInitialFruit(tuning),
    globalMode: createInitialGlobalModeState(tuning),
    pelletsCollectedTotal: 0,
    levelTuning: tuning,
    gameOver: false,
    levelComplete: false,
    deathAnimationMs: 0,
    respawnAnimationMs: 0,
    lastInputDirection: 'none',
    tickAccumulatorMs: 0,
    isPaused: false,
    eatenPelletPositions: new Set<string>(),
    eatenEnergizerPositions: new Set<string>(),
    tunnelUses: 0,
    extraLifeAwarded: false,
  };
}

/* 进入下一关 */
export function advanceToNextLevel(state: PacmanBoardState): PacmanBoardState {
  const nextLevel = state.level + 1;
  const nextMeta = getLevelMeta(state.packId, nextLevel);
  const mazeId = nextMeta?.mazeId || state.mazeId;
  const maze = getMazeDefinition(mazeId);
  const tuning = getLevelTuningByPack(state.packId, nextLevel);

  return {
    ...state,
    level: nextLevel,
    mazeId,
    rows: maze.rows,
    cols: maze.cols,
    pelletsRemaining: countPellets(maze),
    energizersRemaining: countEnergizers(maze),
    ghostsEatenInFrightened: 0,
    fruitSpawnsTriggered: 0,
    elapsedMs: 0,
    pacman: createInitialPacman(maze, tuning),
    ghosts: createInitialGhosts(maze, tuning),
    fruit: createInitialFruit(tuning),
    globalMode: createInitialGlobalModeState(tuning),
    pelletsCollectedTotal: 0,
    levelTuning: tuning,
    levelComplete: false,
    deathAnimationMs: 0,
    respawnAnimationMs: 0,
    lastInputDirection: 'none',
    tickAccumulatorMs: 0,
    isPaused: false,
    status: 'idle',
    eatenPelletPositions: new Set<string>(),
    eatenEnergizerPositions: new Set<string>(),
    tunnelUses: 0,
  };
}

/* 解析关卡包上下文，确保 UI 选中的关卡包真正影响运行时参数。 */
function resolveLevelContext(options: CreatePacmanBoardOptions): {
  packId: string;
  mazeId: string;
  tuning: LevelTuningParams;
} {
  const packId = options.packId || 'arcade';
  const level = options.level || 1;
  const levelMeta = getLevelMeta(packId, level);

  return {
    packId,
    mazeId: options.mazeId || levelMeta?.mazeId || 'classic',
    tuning: getLevelTuningByPack(packId, level),
  };
}
