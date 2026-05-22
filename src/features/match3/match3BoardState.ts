/* 三消棋盘状态管理。包含初始化、交换判定、匹配扫描、掉落、连锁、特殊块、障碍和胜负判定。 */

import type {
  Match3BoardState,
  Match3Tile,
  Match3Color,
  Match3ColorWeights,
  Match3ComboObjectiveId,
  Match3MatchGroup,
  Match3SwapResult,
  Match3SpecialType,
  Match3ObstacleType,
  Match3Goal,
  Match3Portal,
  Match3LevelConfig,
  Match3Result,
  Match3ScoreBreakdown,
  Match3DropItemType,
  Match3PrebuiltSpecial,
} from './match3Types.ts';

import {
  MATCH3_COLORS,
  MATCH3_MAX_COMBO,
  MATCH3_SCORE_BASE,
  MATCH3_OBSTACLE_HP,
  getComboMultiplier,
  calculateMatchScore,
  isAdjacent,
  getSpecialComboResult,
  getAffectedTilesForCombo,
  createEmptyTile,
  createColorTile,
} from './match3Types.ts';

export type RandomGenerator = () => number;

export interface CreateBoardOptions {
  rows?: number;
  cols?: number;
  palette?: Match3Color[];
  colorWeights?: Match3ColorWeights;
  modeId?: Match3BoardState['modeId'];
  chapterId?: string;
  chapterName?: string;
  boardTemplateId?: Match3BoardState['boardTemplateId'];
  maxMoves?: number;
  maxTimeMs?: number;
  goals?: Match3Goal[];
  obstacles?: { type: Match3ObstacleType; positions: { row: number; col: number }[] }[];
  portals?: Match3Portal[];
  dropItems?: { type: Match3DropItemType; row: number; col: number }[];
  dropExits?: { row: number; col: number }[];
  prebuiltSpecials?: Match3PrebuiltSpecial[];
  spreaderPositions?: { row: number; col: number }[];
  spreaderInterval?: number;
  random?: RandomGenerator;
}

export function createSeededRandom(seed: number): RandomGenerator {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function createBoard(options: CreateBoardOptions = {}): Match3BoardState {
  const rows = options.rows ?? 8;
  const cols = options.cols ?? 8;
  const palette = options.palette ?? [...MATCH3_COLORS];
  const colorWeights = options.colorWeights;
  const random = options.random ?? Math.random;

  const tiles: Match3Tile[][] = [];
  for (let r = 0; r < rows; r++) {
    tiles[r] = [];
    for (let c = 0; c < cols; c++) {
      tiles[r][c] = generateTile(r, c, palette, random, colorWeights);
    }
  }

  removeInitialMatches(tiles, palette, random, colorWeights);

  if (options.obstacles) {
    for (const obstacleConfig of options.obstacles) {
      for (const pos of obstacleConfig.positions) {
        if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
          tiles[pos.row][pos.col].obstacle = obstacleConfig.type;
          tiles[pos.row][pos.col].obstacleHp = MATCH3_OBSTACLE_HP[obstacleConfig.type];
        }
      }
    }
  }

  if (options.dropItems) {
    for (const dropItem of options.dropItems) {
      if (dropItem.row >= 0 && dropItem.row < rows && dropItem.col >= 0 && dropItem.col < cols) {
        tiles[dropItem.row][dropItem.col].dropItem = dropItem.type;
      }
    }
  }

  if (options.spreaderPositions) {
    for (const pos of options.spreaderPositions) {
      if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
        tiles[pos.row][pos.col].obstacle = 'spreader';
        tiles[pos.row][pos.col].obstacleHp = MATCH3_OBSTACLE_HP.spreader;
      }
    }
  }

  const goals = options.goals ?? [{ type: 'score', target: 1000, current: 0 }];

  return {
    rows,
    cols,
    palette: [...palette],
    colorWeights,
    phase: 'setup',
    modeId: options.modeId ?? 'adventure',
    chapterId: options.chapterId,
    chapterName: options.chapterName,
    boardTemplateId: options.boardTemplateId,
    tiles,
    goals,
    moves: options.maxMoves ?? 30,
    maxMoves: options.maxMoves ?? 30,
    timeMs: options.maxTimeMs ?? null,
    maxTimeMs: options.maxTimeMs ?? null,
    score: 0,
    comboLevel: 0,
    comboMultiplier: 1.0,
    maxComboReached: 0,
    isAnimating: false,
    selectedTile: null,
    swapTarget: null,
    lastSwap: null,
    portals: options.portals ?? [],
    dropExits: options.dropExits ?? [],
    spreaderActive: (options.spreaderPositions?.length ?? 0) > 0,
    spreaderPositions: options.spreaderPositions ?? [],
    spreaderTurnCount: 0,
    spreaderInterval: options.spreaderInterval ?? 3,
    resolvingChain: false,
    chainCount: 0,
    pendingAnimations: [],
  };
}

export function createBoardFromConfig(config: Match3LevelConfig, random?: RandomGenerator): Match3BoardState {
  const options: CreateBoardOptions = {
    rows: config.rows,
    cols: config.cols,
    palette: config.palette,
    colorWeights: config.colorWeights,
    modeId: config.modeId,
    chapterId: config.chapterId,
    chapterName: config.chapterName,
    boardTemplateId: config.boardTemplateId,
    maxMoves: config.maxMoves,
    maxTimeMs: config.maxTimeMs,
    goals: config.goals.map((g) => ({ ...g, current: 0 })),
    obstacles: config.initialObstacles,
    portals: config.portals,
    dropItems: config.dropItems,
    dropExits: config.dropExits,
    prebuiltSpecials: config.prebuiltSpecials,
    spreaderPositions: config.spreaderConfig?.initialPositions,
    spreaderInterval: config.spreaderConfig?.spreadInterval,
    random: random ?? Math.random,
  };
  const board = createBoard(options);
  applyPrebuiltSpecials(board, config.prebuiltSpecials);
  return board;
}

function buildWeightedPalette(palette: Match3Color[], colorWeights?: Match3ColorWeights): Match3Color[] {
  if (!colorWeights || Object.keys(colorWeights).length === 0) {
    return palette;
  }

  const weightedPalette: Match3Color[] = [];
  for (const color of palette) {
    const weight = Math.max(0, Math.floor(colorWeights[color] ?? 1));
    for (let index = 0; index < Math.max(1, weight); index++) {
      weightedPalette.push(color);
    }
  }
  return weightedPalette.length > 0 ? weightedPalette : palette;
}

function generateTile(
  row: number,
  col: number,
  palette: Match3Color[],
  random: RandomGenerator,
  colorWeights?: Match3ColorWeights
): Match3Tile {
  const weightedPalette = buildWeightedPalette(palette, colorWeights);
  const colorIndex = Math.floor(random() * weightedPalette.length);
  return createColorTile(row, col, weightedPalette[colorIndex]);
}

function removeInitialMatches(
  tiles: Match3Tile[][],
  palette: Match3Color[],
  random: RandomGenerator,
  colorWeights?: Match3ColorWeights
): void {
  const rows = tiles.length;
  const cols = tiles[0]?.length ?? 0;
  const weightedPalette = buildWeightedPalette(palette, colorWeights);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let attempts = 0;
      while (hasMatchAt(tiles, r, c) && attempts < 100) {
        const colorIndex = Math.floor(random() * weightedPalette.length);
        tiles[r][c].color = weightedPalette[colorIndex];
        attempts++;
      }
    }
  }
}

function applyPrebuiltSpecials(state: Match3BoardState, specials?: Match3PrebuiltSpecial[]): void {
  if (!specials?.length) return;

  for (const preset of specials) {
    const tile = state.tiles[preset.row]?.[preset.col];
    if (!tile) continue;
    tile.color = preset.color;
    tile.special = preset.special;
    tile.isMatched = false;
    tile.matchGroup = undefined;
  }
}

function registerTriggeredCombo(state: Match3BoardState, comboId: Match3ComboObjectiveId): void {
  for (const goal of state.goals) {
    if (goal.type === 'triggerCombo' && goal.comboTarget === comboId) {
      goal.current += 1;
    }
  }
}

function resolveComboObjectiveId(
  special1: Match3SpecialType | undefined,
  special2: Match3SpecialType | undefined
): Match3ComboObjectiveId | null {
  if (!special1 && !special2) return null;

  if (special1 === 'colorBomb' && special2 === 'colorBomb') {
    return 'colorBomb-colorBomb';
  }
  if (special1 === 'colorBomb' || special2 === 'colorBomb') {
    return 'colorBomb-special';
  }
  if (
    (special1 === 'striped-h' || special1 === 'striped-v') &&
    (special2 === 'striped-h' || special2 === 'striped-v')
  ) {
    return 'striped-striped';
  }
  if (
    ((special1 === 'striped-h' || special1 === 'striped-v') && special2 === 'wrapped') ||
    (special1 === 'wrapped' && (special2 === 'striped-h' || special2 === 'striped-v'))
  ) {
    return 'striped-wrapped';
  }
  if (special1 === 'wrapped' && special2 === 'wrapped') {
    return 'wrapped-wrapped';
  }
  return null;
}

function hasMatchAt(tiles: Match3Tile[][], row: number, col: number): boolean {
  const color = tiles[row][col].color;
  if (!color) return false;
  const rows = tiles.length;
  const cols = tiles[0]?.length ?? 0;

  let horizontalCount = 1;
  for (let c = col - 1; c >= 0 && tiles[row][c].color === color; c--) {
    horizontalCount++;
  }
  for (let c = col + 1; c < cols && tiles[row][c].color === color; c++) {
    horizontalCount++;
  }
  if (horizontalCount >= 3) return true;

  let verticalCount = 1;
  for (let r = row - 1; r >= 0 && tiles[r][col].color === color; r--) {
    verticalCount++;
  }
  for (let r = row + 1; r < rows && tiles[r][col].color === color; r++) {
    verticalCount++;
  }
  if (verticalCount >= 3) return true;

  return false;
}

function swapTileContents(tile1: Match3Tile, tile2: Match3Tile): void {
  [tile1.color, tile2.color] = [tile2.color, tile1.color];
  [tile1.special, tile2.special] = [tile2.special, tile1.special];
}

function hasTileContent(tile: Match3Tile): boolean {
  return tile.color !== null || tile.dropItem !== undefined;
}

function canParticipateInMatch(tile: Match3Tile): boolean {
  return !tile.dropItem && (!tile.obstacle || tile.obstacle === 'frost1' || tile.obstacle === 'frost2' || tile.obstacle === 'chain');
}

function collectDropItem(state: Match3BoardState, dropItemType: Match3DropItemType): void {
  for (const goal of state.goals) {
    if (goal.type !== 'dropCollect') continue;
    if (!goal.dropItemType || goal.dropItemType === dropItemType) {
      goal.current += 1;
    }
  }
}

function collectDropItemsAtExits(state: Match3BoardState): void {
  for (const exit of state.dropExits) {
    const tile = state.tiles[exit.row]?.[exit.col];
    if (!tile?.dropItem) continue;
    collectDropItem(state, tile.dropItem);
    state.tiles[exit.row][exit.col] = createEmptyTile(exit.row, exit.col);
  }
}

function isOverlayObstacle(obstacle?: Match3ObstacleType): boolean {
  return obstacle === 'frost1' || obstacle === 'frost2' || obstacle === 'chain';
}

function recordClearedObstacleGoal(state: Match3BoardState, obstacle?: Match3ObstacleType): void {
  if (!obstacle) return;

  for (const goal of state.goals) {
    if (goal.type === 'clearOverlay' && isOverlayObstacle(obstacle)) {
      goal.current += 1;
    }
    if (goal.type === 'clearObstacle' && goal.obstacleTarget === obstacle) {
      goal.current += 1;
    }
  }
}

function clearObstacleAt(state: Match3BoardState, row: number, col: number): boolean {
  const tile = state.tiles[row]?.[col];
  if (!tile?.obstacle || !tile.obstacleHp) return false;

  tile.obstacleHp -= 1;
  if (tile.obstacleHp <= 0) {
    const obstacleType = tile.obstacle;
    tile.obstacle = undefined;
    tile.obstacleHp = undefined;
    recordClearedObstacleGoal(state, obstacleType);
  }

  return true;
}

export function canSwap(state: Match3BoardState, r1: number, c1: number, r2: number, c2: number): boolean {
  if (!isAdjacent(r1, c1, r2, c2)) {
    return false;
  }

  const tile1 = state.tiles[r1]?.[c1];
  const tile2 = state.tiles[r2]?.[c2];
  if (!tile1 || !tile2) return false;

  if (tile1.dropItem || tile2.dropItem) {
    return false;
  }

  if (tile1.obstacle === 'stone' || tile2.obstacle === 'stone') {
    return false;
  }
  if (tile1.obstacle === 'box' || tile2.obstacle === 'box') {
    return false;
  }

  if ((tile1.special && tile2.special) || tile1.special === 'colorBomb' || tile2.special === 'colorBomb') {
    return true;
  }

  if (!tile1.color || !tile2.color) {
    return false;
  }

  swapTileContents(tile1, tile2);
  const matches = findAllMatches(state.tiles);
  swapTileContents(tile1, tile2);

  return matches.length > 0;
}

export function findValidSwaps(state: Match3BoardState): { row: number; col: number }[] {
  const validSwaps: { row: number; col: number }[] = [];
  const rows = state.rows;
  const cols = state.cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1 && canSwap(state, r, c, r, c + 1)) {
        validSwaps.push({ row: r, col: c });
      }
      if (r < rows - 1 && canSwap(state, r, c, r + 1, c)) {
        validSwaps.push({ row: r, col: c });
      }
    }
  }

  return validSwaps;
}

export function hasValidSwaps(state: Match3BoardState): boolean {
  return findValidSwaps(state).length > 0;
}

export function executeSwap(
  state: Match3BoardState,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  random?: RandomGenerator
): Match3SwapResult {
  const tile1 = state.tiles[r1]?.[c1];
  const tile2 = state.tiles[r2]?.[c2];

  if (!tile1 || !tile2) {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  if (!isAdjacent(r1, c1, r2, c2)) {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  if (tile1.obstacle === 'stone' || tile2.obstacle === 'stone' || tile1.obstacle === 'box' || tile2.obstacle === 'box') {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  if (tile1.dropItem || tile2.dropItem) {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  const specialCombo = tile1.special || tile2.special
    ? getSpecialComboResult(tile1.special ?? tile2.special ?? 'colorBomb', tile1.special && tile2.special ? tile2.special : null)
    : null;

  if (specialCombo) {
    return handleSpecialComboSwap(state, r1, c1, r2, c2, tile1, tile2);
  }

  if (!tile1.color || !tile2.color) {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  swapTileContents(tile1, tile2);
  const matches = findAllMatches(state.tiles);

  if (matches.length === 0) {
    swapTileContents(tile1, tile2);

    state.lastSwap = {
      from: { row: r1, col: c1 },
      to: { row: r2, col: c2 },
      valid: false,
    };

    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  state.lastSwap = {
    from: { row: r1, col: c1 },
    to: { row: r2, col: c2 },
    valid: true,
  };

  state.comboLevel = 0;
  state.comboMultiplier = 1.0;

  const result = processMatches(state, matches, random);

  return {
    valid: true,
    matchGroups: matches,
    comboLevel: state.comboLevel,
    score: result.score,
    specialCreated: result.specialCreated,
  };
}

function handleSpecialComboSwap(
  state: Match3BoardState,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  tile1: Match3Tile,
  tile2: Match3Tile
): Match3SwapResult {
  const special1 = tile1.special;
  const special2 = tile2.special;
  const comboObjectiveId = resolveComboObjectiveId(special1, special2);

  let comboResult = getSpecialComboResult(special1 ?? 'colorBomb', special2 ?? null);

  if (!comboResult && special1 === 'colorBomb') {
    comboResult = 'clear-color';
  }
  if (!comboResult && special2 === 'colorBomb') {
    comboResult = 'clear-color';
  }

  if (!comboResult) {
    return {
      valid: false,
      matchGroups: [],
      comboLevel: 0,
      score: 0,
    };
  }

  state.lastSwap = {
    from: { row: r1, col: c1 },
    to: { row: r2, col: c2 },
    valid: true,
  };

  const comboColor = tile2.color ?? tile1.color ?? MATCH3_COLORS[0];
  const affectedTiles = getAffectedTilesForCombo(
    comboResult,
    r1,
    c1,
    state.rows,
    state.cols,
    comboColor
  );

  let score = MATCH3_SCORE_BASE.colorBomb * 2;
  const targetSpecial = special1 === 'colorBomb' ? special2 : special1;

  if (comboResult === 'clear-color' && special1 === 'colorBomb' && special2 === 'colorBomb') {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const candidate = state.tiles[r][c];
        if (candidate.color && !candidate.dropItem) {
          candidate.isMatched = true;
          score += MATCH3_SCORE_BASE.match3;
        }
      }
    }
    tile1.isMatched = true;
    tile2.isMatched = true;
  } else if (comboResult === 'clear-color' && special1 === 'colorBomb') {
    const targetColor = tile2.color;
    if (targetColor) {
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (state.tiles[r][c].color === targetColor && !state.tiles[r][c].dropItem) {
            state.tiles[r][c].isMatched = true;
            score += MATCH3_SCORE_BASE.match3;
          }
        }
      }
    }
    tile1.isMatched = true;
  } else if (comboResult === 'clear-color' && special2 === 'colorBomb') {
    const targetColor = tile1.color;
    if (targetColor) {
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (state.tiles[r][c].color === targetColor && !state.tiles[r][c].dropItem) {
            state.tiles[r][c].isMatched = true;
            score += MATCH3_SCORE_BASE.match3;
          }
        }
      }
    }
    tile2.isMatched = true;
  } else if (comboResult === 'convert-all' && targetSpecial) {
    const targetColor = special1 === 'colorBomb' ? tile2.color : tile1.color;
    if (targetColor) {
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          const candidate = state.tiles[r][c];
          if (candidate.color === targetColor && !candidate.dropItem) {
            candidate.special = targetSpecial;
            score += triggerSpecialEffect(state, r, c, targetSpecial, candidate.color ?? undefined);
            candidate.isMatched = true;
            score += MATCH3_SCORE_BASE.match3;
          }
        }
      }
    }
    tile1.isMatched = true;
    tile2.isMatched = true;
  } else {
    for (const pos of affectedTiles) {
      const tile = state.tiles[pos.row]?.[pos.col];
      if (tile && !tile.dropItem) {
        tile.isMatched = true;
        score += MATCH3_SCORE_BASE.match3;
      }
    }
    tile1.isMatched = true;
    tile2.isMatched = true;
  }

  state.score += score;
  updateGoals(state, state.tiles.flat().filter((candidate) => candidate.isMatched));
  if (comboObjectiveId) {
    registerTriggeredCombo(state, comboObjectiveId);
  }

  for (const goal of state.goals) {
    if (goal.type === 'score') {
      goal.current = state.score;
    }
  }

  return {
    valid: true,
    matchGroups: [],
    comboLevel: 1,
    score,
  };
}

export function findAllMatches(tiles: Match3Tile[][]): Match3MatchGroup[] {
  const rows = tiles.length;
  const cols = tiles[0]?.length ?? 0;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const groups: Match3MatchGroup[] = [];
  let groupId = 0;

  for (let r = 0; r < rows; r++) {
    let start = 0;
    for (let c = 1; c <= cols; c++) {
      const startTile = tiles[r][start];
      const currentTile = c < cols ? tiles[r][c] : null;
      const startColor = startTile.color;
      const sameColor = Boolean(startColor) && Boolean(currentTile?.color) && currentTile?.color === startColor && canParticipateInMatch(startTile) && Boolean(currentTile) && canParticipateInMatch(currentTile);
      if (!sameColor || c === cols) {
        const length = c - start;
        if (length >= 3 && startColor) {
          const group: Match3MatchGroup = {
            id: groupId++,
            tiles: [],
            color: startColor,
            isHorizontal: true,
            length,
            shape: 'line',
          };
          for (let i = start; i < c; i++) {
            group.tiles.push({ row: r, col: i });
            visited[r][i] = true;
          }
          groups.push(group);
        }
        start = c;
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let start = 0;
    for (let r = 1; r <= rows; r++) {
      const startTile = tiles[start][c];
      const currentTile = r < rows ? tiles[r][c] : null;
      const startColor = startTile.color;
      const sameColor = Boolean(startColor) && Boolean(currentTile?.color) && currentTile?.color === startColor && canParticipateInMatch(startTile) && Boolean(currentTile) && canParticipateInMatch(currentTile);
      if (!sameColor || r === rows) {
        const length = r - start;
        if (length >= 3 && startColor) {
          const group: Match3MatchGroup = {
            id: groupId++,
            tiles: [],
            color: startColor,
            isHorizontal: false,
            length,
            shape: 'line',
          };
          for (let i = start; i < r; i++) {
            group.tiles.push({ row: i, col: c });
          }
          groups.push(group);
        }
        start = r;
      }
    }
  }

  return mergeOverlappingGroups(groups);
}

function collapseTilesWithoutRefill(state: Match3BoardState): void {
  for (let c = 0; c < state.cols; c++) {
    let writeRow = state.rows - 1;

    for (let r = state.rows - 1; r >= 0; r--) {
      const tile = state.tiles[r][c];
      if (hasTileContent(tile) && !tile.isMatched) {
        if (r !== writeRow) {
          state.tiles[writeRow][c] = {
            ...tile,
            row: writeRow,
            isDropping: true,
            dropDistance: Math.max(tile.dropDistance ?? 0, writeRow - r),
          };
          state.tiles[r][c] = createEmptyTile(r, c);
        }
        writeRow--;
      }
    }

    while (writeRow >= 0) {
      state.tiles[writeRow][c] = createEmptyTile(writeRow, c);
      writeRow--;
    }
  }
}

function mergeOverlappingGroups(groups: Match3MatchGroup[]): Match3MatchGroup[] {
  if (groups.length <= 1) return groups;

  const merged: Match3MatchGroup[] = [];
  const used = new Set<number>();

  for (let i = 0; i < groups.length; i++) {
    if (used.has(i)) continue;

    const group = { ...groups[i], tiles: [...groups[i].tiles] };

    for (let j = i + 1; j < groups.length; j++) {
      if (used.has(j)) continue;

      const other = groups[j];
      const overlap = group.tiles.some((t1) =>
        other.tiles.some((t2) => t1.row === t2.row && t1.col === t2.col)
      );

      if (overlap) {
        for (const t of other.tiles) {
          if (!group.tiles.some((gt) => gt.row === t.row && gt.col === t.col)) {
            group.tiles.push(t);
          }
        }
        group.shape = group.isHorizontal !== other.isHorizontal ? 'L' : group.shape;
        if (group.shape === 'L' && group.tiles.length >= 5) {
          group.shape = 'T';
        }
        group.length = group.tiles.length;
        used.add(j);
      }
    }

    merged.push(group);
    used.add(i);
  }

  return merged;
}

interface ProcessResult {
  score: number;
  specialCreated?: {
    type: Match3SpecialType;
    at: { row: number; col: number };
    fromGroup: number;
  };
}

function processMatches(
  state: Match3BoardState,
  matches: Match3MatchGroup[],
  random?: RandomGenerator
): ProcessResult {
  void random;
  let totalScore = 0;
  let specialCreated: ProcessResult['specialCreated'] = undefined;
  const matchedTiles = new Set<Match3Tile>();

  for (const group of matches) {
    const multiplier = getComboMultiplier(state.comboLevel);
    const score = calculateMatchScore(group.length, group.shape, multiplier);
    totalScore += score;

    let specialType: Match3SpecialType | null = null;
    if (group.length >= 5 && group.shape === 'line') {
      specialType = 'colorBomb';
    } else if (group.length >= 5 && (group.shape === 'L' || group.shape === 'T')) {
      specialType = 'wrapped';
    } else if (group.length === 4) {
      specialType = group.isHorizontal ? 'striped-v' : 'striped-h';
    }

    const specialAnchorPos = specialType
      ? group.tiles.find((pos) => !state.tiles[pos.row]?.[pos.col]?.special) ?? group.tiles[Math.floor(group.tiles.length / 2)]
      : null;

    if (specialType && !specialCreated && specialAnchorPos) {
      specialCreated = {
        type: specialType,
        at: specialAnchorPos,
        fromGroup: group.id,
      };
    }

    for (const pos of group.tiles) {
      const tile = state.tiles[pos.row]?.[pos.col];
      if (tile) {
        if (tile.special) {
          const specialScore = triggerSpecialEffect(state, pos.row, pos.col, tile.special, tile.color ?? undefined);
          totalScore += specialScore;
        }
        if (!tile.dropItem) {
          tile.isMatched = true;
          tile.matchGroup = group.id;
          matchedTiles.add(tile);
        }
      }
    }

    if (specialType && specialAnchorPos) {
      const specialTile = state.tiles[specialAnchorPos.row]?.[specialAnchorPos.col];
      if (specialTile) {
        specialTile.isMatched = false;
        specialTile.matchGroup = undefined;
        specialTile.special = specialType;
        if (!specialTile.color) {
          specialTile.color = group.color;
        }
      }
    }
  }

  state.score += totalScore;

  updateGoals(state, Array.from(matchedTiles).filter((tile) => tile.isMatched));

  for (const goal of state.goals) {
    if (goal.type === 'score') {
      goal.current = state.score;
    }
  }

  return { score: totalScore, specialCreated };
}

export function clearMatchedTiles(state: Match3BoardState): void {
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.tiles[r][c];
      if (tile.isMatched) {
        if (tile.dropItem) {
          tile.isMatched = false;
          tile.matchGroup = undefined;
          continue;
        }
        if (clearObstacleAt(state, r, c)) {
          tile.isMatched = false;
          tile.matchGroup = undefined;
        } else {
          state.tiles[r][c] = createEmptyTile(r, c);
        }
      }
    }
  }
}

export function applyGravity(state: Match3BoardState, palette?: Match3Color[], random?: RandomGenerator): void {
  const usedPalette = palette ?? state.palette ?? [...MATCH3_COLORS];
  const weightedPalette = buildWeightedPalette(usedPalette, state.colorWeights);
  const usedRandom = random ?? Math.random;

  collapseTilesWithoutRefill(state);

  if (state.portals.length > 0) {
    handlePortalDrop(state);
    collapseTilesWithoutRefill(state);
  }

  collectDropItemsAtExits(state);
  collapseTilesWithoutRefill(state);

  for (let c = 0; c < state.cols; c++) {
    for (let r = state.rows - 1; r >= 0; r--) {
      if (!hasTileContent(state.tiles[r][c])) {
        const colorIndex = Math.floor(usedRandom() * weightedPalette.length);
        state.tiles[r][c] = createColorTile(r, c, weightedPalette[colorIndex]);
        state.tiles[r][c].isDropping = true;
        state.tiles[r][c].dropDistance = r + 1;
      }
    }
  }
}

export function processChain(state: Match3BoardState, palette?: Match3Color[], random?: RandomGenerator): boolean {
  const usedRandom = random ?? Math.random;

  clearMatchedTiles(state);

  applyGravity(state, palette, usedRandom);

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      state.tiles[r][c].isDropping = false;
      state.tiles[r][c].dropDistance = 0;
      state.tiles[r][c].isNew = false;
    }
  }

  const newMatches = findAllMatches(state.tiles);

  if (newMatches.length > 0) {
    state.comboLevel = Math.min(state.comboLevel + 1, MATCH3_MAX_COMBO);
    state.comboMultiplier = getComboMultiplier(state.comboLevel);
    state.maxComboReached = Math.max(state.maxComboReached, state.comboLevel);
    state.chainCount++;

    processMatches(state, newMatches, usedRandom);
    return true;
  }

  spreadSpreader(state, usedRandom);

  return false;
}

export function shuffleBoard(state: Match3BoardState, palette?: Match3Color[], random?: RandomGenerator): void {
  const usedPalette = palette ?? state.palette ?? [...MATCH3_COLORS];
  void palette;
  const usedRandom = random ?? Math.random;

  const colors: Match3Color[] = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.tiles[r][c];
      if (!tile.obstacle && tile.color && !tile.dropItem) {
        colors.push(tile.color);
      }
    }
  }

  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(usedRandom() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  let colorIndex = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.tiles[r][c];
      if (!tile.obstacle && tile.color && !tile.dropItem && colorIndex < colors.length) {
        tile.color = colors[colorIndex++];
        tile.special = undefined;
      }
    }
  }

  removeInitialMatches(state.tiles, usedPalette, usedRandom, state.colorWeights);
}

export function decrementMoves(state: Match3BoardState): boolean {
  if (state.maxMoves !== null && state.moves > 0) {
    state.moves--;
    return true;
  }
  return false;
}

export function decrementTime(state: Match3BoardState, deltaMs: number): boolean {
  if (state.maxTimeMs !== null && state.timeMs !== null) {
    state.timeMs = Math.max(0, state.timeMs - deltaMs);
    return state.timeMs > 0;
  }
  return true;
}

export function checkWinCondition(state: Match3BoardState): boolean {
  for (const goal of state.goals) {
    if (goal.current < goal.target) {
      return false;
    }
  }
  return true;
}

export function checkLoseCondition(state: Match3BoardState): { lost: boolean; reason?: string; suggestion?: string } {
  if (state.maxMoves !== null && state.moves <= 0) {
    const incompleteGoals = state.goals.filter((g) => g.current < g.target);
    if (incompleteGoals.length > 0) {
      const goal = incompleteGoals[0];
      let reason = '步数已用完';
      let suggestion = '尝试制造更多特殊块来提高效率';

      if (goal.type === 'score') {
        const remaining = goal.target - goal.current;
        reason = `分数不足，还差 ${remaining} 分`;
        suggestion = '优先制造条纹块和包装块，它们能产生更高分数';
      } else if (goal.type === 'collectColor') {
        const remaining = goal.target - goal.current;
        reason = `收集目标还差 ${remaining} 个色块`;
        suggestion = '尝试制造彩球来快速清除该颜色';
      } else if (goal.type === 'clearOverlay') {
        const remaining = goal.target - goal.current;
        reason = `覆盖层还差 ${remaining} 格没有清干净`;
        suggestion = '先处理边角和厚冰区域，避免最后几步来回补刀';
      } else if (goal.type === 'dropCollect') {
        const remaining = goal.target - goal.current;
        reason = `护送目标还差 ${remaining} 份没有送到出口`;
        suggestion = '优先打通出口列，再利用传送口或条纹块补路径';
      } else if (goal.type === 'clearObstacle') {
        const remaining = goal.target - goal.current;
        reason = `障碍还差 ${remaining} 个没有清掉`;
        suggestion = '在障碍附近制造消除，或使用条纹块远程清除';
      } else if (goal.type === 'triggerCombo') {
        const remaining = goal.target - goal.current;
        reason = `指定组合还差 ${remaining} 次没有触发`;
        suggestion = '先围绕预置特殊块或高权重颜色做形状，优先把组合对接到一起';
      }

      return { lost: true, reason, suggestion };
    }
    return { lost: true, reason: '步数已用完', suggestion: '尝试更高效地利用每一步' };
  }

  if (state.maxTimeMs !== null && state.timeMs !== null && state.timeMs <= 0) {
    return { lost: true, reason: '时间已用完', suggestion: '加快决策速度，优先寻找明显的消除机会' };
  }

  return { lost: false };
}

export function generateResult(state: Match3BoardState): Match3Result {
  const won = checkWinCondition(state);
  const loseCheck = checkLoseCondition(state);

  const goalsCompleted = state.goals.filter((g) => g.current >= g.target).length;
  const goalsTotal = state.goals.length;

  let stars = 0;
  if (won) {
    stars = 1;
    const avgCompletion = state.goals.reduce((sum, g) => sum + (g.current / g.target), 0) / goalsTotal;
    if (avgCompletion >= 1.5) stars = 3;
    else if (avgCompletion >= 1.2) stars = 2;
  }

  const breakdown: Match3ScoreBreakdown = {
    baseScore: state.score,
    comboBonus: Math.floor(state.score * (state.maxComboReached * 0.1)),
    specialBonus: 0,
    obstacleBonus: 0,
    total: state.score,
  };

  return {
    won,
    score: state.score,
    stars,
    goalsCompleted,
    goalsTotal,
    movesUsed: state.maxMoves !== null ? state.maxMoves - state.moves : 0,
    maxCombo: state.maxComboReached,
    timeMs: state.maxTimeMs !== null ? state.maxTimeMs - (state.timeMs ?? 0) : 0,
    breakdown,
    failureReason: !won ? loseCheck.reason : undefined,
    suggestion: !won ? loseCheck.suggestion : undefined,
  };
}

export function updateGoals(state: Match3BoardState, matchedTiles: Match3Tile[]): void {
  for (const goal of state.goals) {
    if (goal.type === 'collectColor') {
      const colorMatch = matchedTiles.filter((t) => t.color === goal.colorTarget);
      goal.current += colorMatch.length;
    }
  }
}

export function spreadSpreader(state: Match3BoardState, random?: RandomGenerator): void {
  if (!state.spreaderActive || state.spreaderPositions.length === 0) return;

  const interval = state.spreaderInterval || 3;
  state.spreaderTurnCount = (state.spreaderTurnCount || 0) + 1;

  if (state.spreaderTurnCount < interval) return;

  state.spreaderTurnCount = 0;

  const usedRandom = random ?? Math.random;
  const newPositions: { row: number; col: number }[] = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const pos of state.spreaderPositions) {
    const validDirs = directions.filter(([dr, dc]) => {
      const nr = pos.row + dr;
      const nc = pos.col + dc;
      return (
        nr >= 0 &&
        nr < state.rows &&
        nc >= 0 &&
        nc < state.cols &&
        !state.tiles[nr][nc].obstacle &&
        !state.spreaderPositions.some((p) => p.row === nr && p.col === nc)
      );
    });

    if (validDirs.length > 0) {
      const [dr, dc] = validDirs[Math.floor(usedRandom() * validDirs.length)];
      const newRow = pos.row + dr;
      const newCol = pos.col + dc;
      newPositions.push({ row: newRow, col: newCol });
      state.tiles[newRow][newCol].obstacle = 'spreader';
      state.tiles[newRow][newCol].obstacleHp = MATCH3_OBSTACLE_HP['spreader'];
    }
  }

  state.spreaderPositions.push(...newPositions);
}

export function handlePortalDrop(state: Match3BoardState): void {
  for (const portal of state.portals) {
    const inTile = state.tiles[portal.inRow]?.[portal.inCol];
    const outTile = state.tiles[portal.outRow]?.[portal.outCol];

    if (inTile && outTile && inTile.isDropping && hasTileContent(inTile) && !hasTileContent(outTile)) {
      outTile.color = inTile.color;
      outTile.special = inTile.special;
      outTile.dropItem = inTile.dropItem;
      outTile.isDropping = true;
      outTile.dropDistance = inTile.dropDistance;

      state.tiles[portal.inRow][portal.inCol] = createEmptyTile(portal.inRow, portal.inCol);
    }
  }
}

export function triggerSpecialEffect(
  state: Match3BoardState,
  row: number,
  col: number,
  special: Match3SpecialType,
  targetColor?: Match3Color
): number {
  let score = 0;
  const tile = state.tiles[row]?.[col];
  if (!tile) return 0;

  switch (special) {
    case 'striped-h':
      for (let c = 0; c < state.cols; c++) {
        if (clearObstacleAt(state, row, c)) {
          void 0;
        } else if (!state.tiles[row][c].dropItem) {
          state.tiles[row][c].isMatched = true;
          score += MATCH3_SCORE_BASE.match3;
        }
      }
      break;

    case 'striped-v':
      for (let r = 0; r < state.rows; r++) {
        if (clearObstacleAt(state, r, col)) {
          void 0;
        } else if (!state.tiles[r][col].dropItem) {
          state.tiles[r][col].isMatched = true;
          score += MATCH3_SCORE_BASE.match3;
        }
      }
      break;

    case 'wrapped':
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            if (clearObstacleAt(state, nr, nc)) {
              void 0;
            } else if (!state.tiles[nr][nc].dropItem) {
              state.tiles[nr][nc].isMatched = true;
              score += MATCH3_SCORE_BASE.match3;
            }
          }
        }
      }
      break;

    case 'colorBomb':
      if (targetColor) {
        for (let r = 0; r < state.rows; r++) {
          for (let c = 0; c < state.cols; c++) {
            if (state.tiles[r][c].color === targetColor && !state.tiles[r][c].dropItem) {
              state.tiles[r][c].isMatched = true;
              score += MATCH3_SCORE_BASE.match3;
            }
          }
        }
      }
      break;
  }

  state.score += score;
  return score;
}

export function selectTile(state: Match3BoardState, row: number, col: number): void {
  if (state.phase !== 'playing') return;

  if (state.selectedTile) {
    const { row: r1, col: c1 } = state.selectedTile;
    if (isAdjacent(r1, c1, row, col)) {
      state.swapTarget = { row, col };
    } else {
      state.selectedTile = { row, col };
      state.swapTarget = null;
    }
  } else {
    state.selectedTile = { row, col };
    state.swapTarget = null;
  }
}

export function clearSelection(state: Match3BoardState): void {
  state.selectedTile = null;
  state.swapTarget = null;
}

export function startGame(state: Match3BoardState): void {
  state.phase = 'playing';
  state.isAnimating = false;
  state.resolvingChain = false;
  state.chainCount = 0;
  state.comboLevel = 0;
  state.comboMultiplier = 1.0;
}

export function pauseGame(state: Match3BoardState): void {
  if (state.phase === 'playing') {
    state.phase = 'resolving';
  }
}

export function resumeGame(state: Match3BoardState): void {
  if (state.phase === 'resolving') {
    state.phase = 'playing';
  }
}
