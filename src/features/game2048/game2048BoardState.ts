/* 2048 核心状态层：负责建盘、滑动合并、胜负判定与继续挑战。 */

export type Game2048Direction = 'up' | 'down' | 'left' | 'right';
export type Game2048Status = 'idle' | 'playing' | 'won' | 'lost';

export interface Game2048Tile {
  id: string;
  value: number;
  isNew?: boolean;
}

export interface Game2048BoardState {
  rows: number;
  cols: number;
  mode: 'classic';
  status: Game2048Status;
  grid: Array<Array<Game2048Tile | null>>;
  score: number;
  bestScore: number;
  maxTile: number;
  moves: number;
  targetTile: number;
  hasWon: boolean;
}

type SeedTile = number | null;

function createTileId(): string {
  return `tile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTile(value: number, isNew = false): Game2048Tile {
  return { id: createTileId(), value, isNew };
}

function normalizeGrid(grid?: SeedTile[][]): Array<Array<Game2048Tile | null>> {
  if (!grid) {
    return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null));
  }
  return grid.map((row) => row.map((cell) => (cell ? createTile(cell) : null)));
}

function spawnRandomTile(
  grid: Array<Array<Game2048Tile | null>>,
  random = Math.random,
): Array<Array<Game2048Tile | null>> {
  const empties: Array<{ row: number; col: number }> = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === null) empties.push({ row: rowIndex, col: colIndex });
    });
  });
  if (empties.length === 0) return grid;
  const target = empties[Math.floor(random() * empties.length)]!;
  const value = random() < 0.9 ? 2 : 4;
  const next = grid.map((row) => [...row]);
  next[target.row]![target.col] = createTile(value, true);
  return next;
}

function getMaxTile(grid: Array<Array<Game2048Tile | null>>): number {
  return grid.flat().reduce((max, cell) => Math.max(max, cell?.value ?? 0), 0);
}

function convertLine(line: Array<Game2048Tile | null>): {
  line: Array<Game2048Tile | null>;
  score: number;
} {
  const filled = line.filter(Boolean) as Game2048Tile[];
  const result: Array<Game2048Tile | null> = [];
  let score = 0;

  for (let index = 0; index < filled.length; index += 1) {
    const current = filled[index]!;
    const next = filled[index + 1];
    if (next && next.value === current.value) {
      const mergedValue = current.value * 2;
      result.push(createTile(mergedValue));
      score += mergedValue;
      index += 1;
    } else {
      result.push({ ...current, isNew: false });
    }
  }

  while (result.length < line.length) {
    result.push(null);
  }

  return { line: result, score };
}

function extractLine(
  grid: Array<Array<Game2048Tile | null>>,
  direction: Game2048Direction,
  index: number,
): Array<Game2048Tile | null> {
  if (direction === 'left' || direction === 'right') {
    const row = [...grid[index]!];
    return direction === 'right' ? row.reverse() : row;
  }
  const column = grid.map((row) => row[index]!);
  return direction === 'down' ? column.reverse() : column;
}

function writeLine(
  grid: Array<Array<Game2048Tile | null>>,
  direction: Game2048Direction,
  index: number,
  line: Array<Game2048Tile | null>,
): void {
  const source = direction === 'right' || direction === 'down' ? [...line].reverse() : line;
  if (direction === 'left' || direction === 'right') {
    grid[index] = source;
    return;
  }
  source.forEach((cell, rowIndex) => {
    grid[rowIndex]![index] = cell;
  });
}

function isSameGrid(a: Array<Array<Game2048Tile | null>>, b: Array<Array<Game2048Tile | null>>): boolean {
  return a.every((row, rowIndex) => row.every((cell, colIndex) => (cell?.value ?? 0) === (b[rowIndex]?.[colIndex]?.value ?? 0)));
}

function canMerge(grid: Array<Array<Game2048Tile | null>>): boolean {
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const current = grid[row]![col]?.value ?? 0;
      if (!current) continue;
      if ((grid[row]?.[col + 1]?.value ?? 0) === current) return true;
      if ((grid[row + 1]?.[col]?.value ?? 0) === current) return true;
    }
  }
  return false;
}

function evaluateStatus(
  grid: Array<Array<Game2048Tile | null>>,
  currentStatus: Game2048Status,
  targetTile: number,
): Game2048Status {
  if (currentStatus !== 'won' && getMaxTile(grid) >= targetTile) return 'won';
  const hasSpace = grid.flat().some((cell) => cell === null);
  if (!hasSpace && !canMerge(grid)) return 'lost';
  return currentStatus === 'idle' ? 'playing' : currentStatus;
}

export function createGame2048BoardState(input?: {
  grid?: SeedTile[][];
  status?: Game2048Status;
  score?: number;
  bestScore?: number;
  targetTile?: number;
}): Game2048BoardState {
  let grid = normalizeGrid(input?.grid);
  if (!input?.grid) {
    grid = spawnRandomTile(spawnRandomTile(grid));
  }
  const maxTile = getMaxTile(grid);
  return {
    rows: 4,
    cols: 4,
    mode: 'classic',
    status: input?.status ?? 'idle',
    grid,
    score: input?.score ?? 0,
    bestScore: Math.max(input?.bestScore ?? 0, input?.score ?? 0),
    maxTile,
    moves: 0,
    targetTile: input?.targetTile ?? 2048,
    hasWon: maxTile >= (input?.targetTile ?? 2048),
  };
}

// 执行一次滑动与合并。
export function moveGame2048Board(
  state: Game2048BoardState,
  direction: Game2048Direction,
  random = Math.random,
): Game2048BoardState {
  if (state.status === 'lost') return state;

  const nextGrid = state.grid.map((row) => row.map((cell) => (cell ? { ...cell, isNew: false } : null)));
  let gainedScore = 0;

  for (let index = 0; index < 4; index += 1) {
    const line = extractLine(nextGrid, direction, index);
    const result = convertLine(line);
    gainedScore += result.score;
    writeLine(nextGrid, direction, index, result.line);
  }

  if (isSameGrid(state.grid, nextGrid)) {
    return state;
  }

  const spawned = spawnRandomTile(nextGrid, random);
  const score = state.score + gainedScore;
  const maxTile = getMaxTile(spawned);
  const hasWon = state.hasWon || maxTile >= state.targetTile;

  return {
    ...state,
    grid: spawned,
    score,
    bestScore: Math.max(state.bestScore, score),
    maxTile,
    moves: state.moves + 1,
    hasWon,
    status: evaluateStatus(spawned, state.status, state.targetTile),
  };
}

// 达成 2048 后继续挑战更高数字。
export function continueGame2048(state: Game2048BoardState): Game2048BoardState {
  if (state.status !== 'won') return state;
  return {
    ...state,
    status: 'playing',
    hasWon: true,
  };
}
