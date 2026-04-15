export const GOLD_MINER_BOARD_WIDTH = 920;
export const GOLD_MINER_BOARD_HEIGHT = 560;
export const GOLD_MINER_HOOK_ORIGIN_X = GOLD_MINER_BOARD_WIDTH / 2;
export const GOLD_MINER_HOOK_ORIGIN_Y = 74;
export const GOLD_MINER_MIN_ANGLE = -78;
export const GOLD_MINER_MAX_ANGLE = 78;
export const GOLD_MINER_MAX_DISTANCE = 470;

export type GoldMinerMode = 'adventure' | 'endless';

export type GoldMinerStatus =
  | 'swinging'
  | 'extending'
  | 'retracting'
  | 'paused'
  | 'shop'
  | 'level_complete'
  | 'game_over';

export type GoldMinerItemKind =
  | 'gold_small'
  | 'gold_medium'
  | 'gold_large'
  | 'rock_small'
  | 'rock_large'
  | 'diamond'
  | 'money_bag'
  | 'mystery_bag'
  | 'mole'
  | 'bat';

export type GoldMinerEffectId =
  | 'strength_potion'
  | 'lucky_clover'
  | 'time_bonus'
  | 'rock_detector'
  | 'diamond_detector'
  | 'hook_boost'
  | 'insurance';

export interface GoldMinerVector {
  x: number;
  y: number;
}

export interface GoldMinerHookState {
  angleDeg: number;
  angularVelocityDeg: number;
  extendDistance: number;
  extendSpeed: number;
  retractSpeed: number;
  grabbedItemId: string | null;
}

export interface GoldMinerItem {
  id: string;
  kind: GoldMinerItemKind;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number;
  isCollected: boolean;
  velocityX?: number;
  baseY?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  phaseOffset?: number;
}

export interface GoldMinerLevelRuleSet {
  enableMovingItems?: boolean;
  sinkItems?: boolean;
  fasterSwing?: boolean;
  hiddenItems?: boolean;
}

export interface GoldMinerLevelDefinition {
  id: number;
  mode: GoldMinerMode;
  title: string;
  targetScore: number;
  timeLimitSec: number;
  itemBudget: Partial<Record<GoldMinerItemKind, number>>;
  rules?: GoldMinerLevelRuleSet;
}

export interface GoldMinerBoardState {
  mode: GoldMinerMode;
  status: GoldMinerStatus;
  levelId: number;
  levelTitle: string;
  elapsedMs: number;
  timeRemainingMs: number;
  score: number;
  totalBank: number;
  targetScore: number;
  dynamiteCount: number;
  activeEffects: GoldMinerEffectId[];
  insuranceUsed: boolean;
  hookOrigin: GoldMinerVector;
  hook: GoldMinerHookState;
  items: GoldMinerItem[];
  bankedItemIds: string[];
  destroyedItemIds: string[];
  lastCaughtItemId: string | null;
  pendingRoundEnd: boolean;
  resultTitle: string;
  resultMessage: string;
  modeLabel: string;
  rngSeed: number;
}

export interface GoldMinerSnapshot {
  levelId: number;
  mode: GoldMinerMode;
  state: GoldMinerBoardState;
}

export interface GoldMinerLevelRecord {
  levelId: number;
  attempts: number;
  completed: boolean;
  bestScore: number;
  lastPlayedAt?: number;
  firstCompletedAt?: number;
}

export interface GoldMinerRunStats {
  totalRuns: number;
  totalPlayTimeMs: number;
  bestScore: number;
  highestLevel: number;
  totalGoldCollected: number;
  totalDynamiteUsed: number;
}

export interface GoldMinerProgression {
  completedLevels: number[];
  highestUnlockedLevel: number;
  levelRecords: Record<number, GoldMinerLevelRecord>;
  unlockedModes: GoldMinerMode[];
  lastPlayedLevelId: number;
}

export interface GoldMinerPreferences {
  showHints: boolean;
  soundEnabled: boolean;
}

export interface GoldMinerActiveRun {
  snapshot: GoldMinerSnapshot;
  startedAt: string;
  updatedAt: string;
}

export interface GoldMinerModuleStorage {
  version: 1;
  stats: GoldMinerRunStats;
  progression: GoldMinerProgression;
  preferences: GoldMinerPreferences;
  activeRun: GoldMinerActiveRun | null;
}
