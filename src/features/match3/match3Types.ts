/* 三消模块的核心类型定义。供棋盘状态、关卡数据、UI组件共用。 */

export const MATCH3_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;
export type Match3Color = (typeof MATCH3_COLORS)[number];
export const MATCH3_DROP_ITEMS = ['folder', 'stamp', 'formulaChip'] as const;
export type Match3DropItemType = (typeof MATCH3_DROP_ITEMS)[number];
export const MATCH3_MODE_IDS = ['adventure', 'blitz', 'puzzle', 'practice'] as const;
export type Match3ModeId = (typeof MATCH3_MODE_IDS)[number];
export type Match3BoardTemplateId =
  | 'standard-grid'
  | 'drop-funnel'
  | 'obstacle-fortress'
  | 'combo-latch'
  | 'blitz-open';
export type Match3ComboObjectiveId =
  | 'striped-striped'
  | 'striped-wrapped'
  | 'wrapped-wrapped'
  | 'colorBomb-special'
  | 'colorBomb-colorBomb';

export type Match3SpecialType = 'striped-h' | 'striped-v' | 'wrapped' | 'colorBomb';

export type Match3ObstacleType =
  | 'frost1'
  | 'frost2'
  | 'chain'
  | 'box'
  | 'stone'
  | 'portalIn'
  | 'portalOut'
  | 'spreader';

export type Match3GoalType =
  | 'score'
  | 'collectColor'
  | 'clearOverlay'
  | 'dropCollect'
  | 'clearObstacle'
  | 'triggerCombo';

export type Match3Phase = 'setup' | 'playing' | 'resolving' | 'won' | 'lost';

export interface Match3Tile {
  row: number;
  col: number;
  color: Match3Color | null;
  special?: Match3SpecialType;
  dropItem?: Match3DropItemType;
  obstacle?: Match3ObstacleType;
  obstacleHp?: number;
  isDropping?: boolean;
  dropDistance?: number;
  isNew?: boolean;
  isMatched?: boolean;
  matchGroup?: number;
}

export interface Match3MatchGroup {
  id: number;
  tiles: { row: number; col: number }[];
  color: Match3Color;
  isHorizontal: boolean;
  length: number;
  shape: 'line' | 'L' | 'T';
}

export interface Match3SwapResult {
  valid: boolean;
  matchGroups: Match3MatchGroup[];
  specialCreated?: {
    type: Match3SpecialType;
    at: { row: number; col: number };
    fromGroup: number;
  };
  comboLevel: number;
  score: number;
}

export interface Match3SpecialCombo {
  type1: Match3SpecialType;
  type2: Match3SpecialType | null;
  result: 'cross' | 'triple-row-col' | 'big-blast' | 'clear-color' | 'convert-all';
  affectedTiles: { row: number; col: number }[];
}

export interface Match3Goal {
  type: Match3GoalType;
  target: number;
  current: number;
  colorTarget?: Match3Color;
  obstacleTarget?: Match3ObstacleType;
  dropItemType?: Match3DropItemType;
  comboTarget?: Match3ComboObjectiveId;
}

export type Match3ColorWeights = Partial<Record<Match3Color, number>>;

export interface Match3PrebuiltSpecial {
  row: number;
  col: number;
  color: Match3Color;
  special: Match3SpecialType;
}

export interface Match3Portal {
  id: string;
  inRow: number;
  inCol: number;
  outRow: number;
  outCol: number;
}

export interface Match3DropExit {
  row: number;
  col: number;
}

export interface Match3BoardState {
  rows: number;
  cols: number;
  palette: Match3Color[];
  colorWeights?: Match3ColorWeights;
  phase: Match3Phase;
  modeId: Match3ModeId;
  chapterId?: string;
  chapterName?: string;
  boardTemplateId?: Match3BoardTemplateId;
  tiles: Match3Tile[][];
  goals: Match3Goal[];
  moves: number;
  maxMoves: number | null;
  timeMs: number | null;
  maxTimeMs: number | null;
  score: number;
  comboLevel: number;
  comboMultiplier: number;
  maxComboReached: number;
  isAnimating: boolean;
  selectedTile: { row: number; col: number } | null;
  swapTarget: { row: number; col: number } | null;
  lastSwap: {
    from: { row: number; col: number };
    to: { row: number; col: number };
    valid: boolean;
  } | null;
  portals: Match3Portal[];
  dropExits: Match3DropExit[];
  spreaderActive: boolean;
  spreaderPositions: { row: number; col: number }[];
  spreaderTurnCount: number;
  spreaderInterval: number;
  resolvingChain: boolean;
  chainCount: number;
  pendingAnimations: Match3Animation[];
  failureReason?: string;
  failureSuggestion?: string;
}

export interface Match3Animation {
  type: 'swap' | 'swap-invalid' | 'match' | 'drop' | 'special-trigger' | 'obstacle-break' | 'spreader-spread';
  tiles: { row: number; col: number }[];
  durationMs: number;
  data?: Record<string, unknown>;
}

export interface Match3LevelConfig {
  id: string;
  name: string;
  modeId?: Match3ModeId;
  chapterId?: string;
  chapterName?: string;
  boardTemplateId?: Match3BoardTemplateId;
  rows: number;
  cols: number;
  palette: Match3Color[];
  colorWeights?: Match3ColorWeights;
  goals: Match3Goal[];
  maxMoves?: number;
  maxTimeMs?: number;
  initialObstacles?: {
    type: Match3ObstacleType;
    positions: { row: number; col: number }[];
  }[];
  portals?: Match3Portal[];
  dropItems?: { type: Match3DropItemType; row: number; col: number }[];
  dropExits?: Match3DropExit[];
  prebuiltSpecials?: Match3PrebuiltSpecial[];
  spreaderConfig?: {
    initialPositions: { row: number; col: number }[];
    spreadInterval: number;
  };
  specialBlockChance?: number;
  minMatchLength?: number;
}

export interface Match3ScoreBreakdown {
  baseScore: number;
  comboBonus: number;
  specialBonus: number;
  obstacleBonus: number;
  total: number;
}

export interface Match3Result {
  won: boolean;
  score: number;
  stars: number;
  goalsCompleted: number;
  goalsTotal: number;
  movesUsed: number;
  maxCombo: number;
  timeMs: number;
  breakdown: Match3ScoreBreakdown;
  failureReason?: string;
  suggestion?: string;
}

export const MATCH3_COMBO_MULTIPLIERS = [1.0, 1.25, 1.5, 1.75, 2.0] as const;
export const MATCH3_MAX_COMBO = 4;

export const MATCH3_SCORE_BASE = {
  match3: 60,
  match4: 120,
  match5: 200,
  LShape: 200,
  TShape: 200,
  striped: 120,
  wrapped: 200,
  colorBomb: 200,
  obstacleBreak: 20,
};

export const MATCH3_OBSTACLE_HP: Record<Match3ObstacleType, number> = {
  frost1: 1,
  frost2: 2,
  chain: 1,
  box: 1,
  stone: 2,
  portalIn: 0,
  portalOut: 0,
  spreader: 1,
};

export function createEmptyTile(row: number, col: number): Match3Tile {
  return {
    row,
    col,
    color: null,
    isDropping: false,
    dropDistance: 0,
    isNew: false,
    isMatched: false,
  };
}

export function createColorTile(
  row: number,
  col: number,
  color: Match3Color,
  special?: Match3SpecialType
): Match3Tile {
  return {
    row,
    col,
    color,
    special,
    isDropping: false,
    dropDistance: 0,
    isNew: true,
    isMatched: false,
  };
}

export function createObstacleTile(
  row: number,
  col: number,
  obstacleType: Match3ObstacleType,
  color?: Match3Color
): Match3Tile {
  return {
    row,
    col,
    color: color ?? 'red',
    obstacle: obstacleType,
    obstacleHp: MATCH3_OBSTACLE_HP[obstacleType],
    isDropping: false,
    dropDistance: 0,
    isNew: false,
    isMatched: false,
  };
}

export function getComboMultiplier(comboLevel: number): number {
  const index = Math.min(comboLevel, MATCH3_MAX_COMBO);
  return MATCH3_COMBO_MULTIPLIERS[index];
}

export function calculateMatchScore(
  matchLength: number,
  shape: 'line' | 'L' | 'T',
  comboMultiplier: number
): number {
  let base = MATCH3_SCORE_BASE.match3;
  if (matchLength === 4) {
    base = MATCH3_SCORE_BASE.match4;
  } else if (matchLength >= 5) {
    base = MATCH3_SCORE_BASE.match5;
  }
  if (shape === 'L' || shape === 'T') {
    base = MATCH3_SCORE_BASE.LShape;
  }
  return Math.floor(base * comboMultiplier);
}

export function isAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function getManhattanDistance(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function determineSpecialType(
  matchLength: number,
  shape: 'line' | 'L' | 'T',
  isHorizontal: boolean
): Match3SpecialType | null {
  if (matchLength >= 5 && shape === 'line') {
    return 'colorBomb';
  }
  if (matchLength >= 5 && (shape === 'L' || shape === 'T')) {
    return 'wrapped';
  }
  if (matchLength === 4) {
    return isHorizontal ? 'striped-v' : 'striped-h';
  }
  return null;
}

export function getSpecialComboResult(
  special1: Match3SpecialType,
  special2: Match3SpecialType | null
): Match3SpecialCombo['result'] | null {
  const hasColorBomb = special1 === 'colorBomb' || special2 === 'colorBomb';
  if (hasColorBomb) {
    if (special1 === 'colorBomb' && special2 === null) {
      return 'clear-color';
    }
    if (special1 === 'colorBomb' && special2 === 'colorBomb') {
      return 'clear-color';
    }
    if (special2 === 'colorBomb' && special1 === 'colorBomb') {
      return 'clear-color';
    }
    return 'convert-all';
  }
  if (special1 === 'striped-h' && special2 === 'striped-h') {
    return 'cross';
  }
  if (special1 === 'striped-v' && special2 === 'striped-v') {
    return 'cross';
  }
  if (
    (special1 === 'striped-h' && special2 === 'striped-v') ||
    (special1 === 'striped-v' && special2 === 'striped-h')
  ) {
    return 'cross';
  }
  if (
    (special1 === 'striped-h' || special1 === 'striped-v') &&
    special2 === 'wrapped'
  ) {
    return 'triple-row-col';
  }
  if (
    special1 === 'wrapped' &&
    (special2 === 'striped-h' || special2 === 'striped-v')
  ) {
    return 'triple-row-col';
  }
  if (special1 === 'wrapped' && special2 === 'wrapped') {
    return 'big-blast';
  }
  return null;
}

export function getAffectedTilesForCombo(
  result: Match3SpecialCombo['result'],
  triggerRow: number,
  triggerCol: number,
  rows: number,
  cols: number,
  targetColor?: Match3Color
): { row: number; col: number }[] {
  void targetColor;
  const tiles: { row: number; col: number }[] = [];

  switch (result) {
    case 'cross':
      for (let c = 0; c < cols; c++) {
        tiles.push({ row: triggerRow, col: c });
      }
      for (let r = 0; r < rows; r++) {
        if (r !== triggerRow) {
          tiles.push({ row: r, col: triggerCol });
        }
      }
      break;
    case 'triple-row-col':
      for (let c = 0; c < cols; c++) {
        tiles.push({ row: triggerRow, col: c });
      }
      for (let r = 0; r < rows; r++) {
        tiles.push({ row: r, col: triggerCol });
      }
      if (triggerRow > 0) {
        for (let c = 0; c < cols; c++) {
          tiles.push({ row: triggerRow - 1, col: c });
        }
      }
      if (triggerRow < rows - 1) {
        for (let c = 0; c < cols; c++) {
          tiles.push({ row: triggerRow + 1, col: c });
        }
      }
      if (triggerCol > 0) {
        for (let r = 0; r < rows; r++) {
          tiles.push({ row: r, col: triggerCol - 1 });
        }
      }
      if (triggerCol < cols - 1) {
        for (let r = 0; r < rows; r++) {
          tiles.push({ row: r, col: triggerCol + 1 });
        }
      }
      break;
    case 'big-blast':
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = triggerRow + dr;
          const c = triggerCol + dc;
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            tiles.push({ row: r, col: c });
          }
        }
      }
      break;
    case 'clear-color':
      break;
    case 'convert-all':
      break;
  }

  return tiles;
}
