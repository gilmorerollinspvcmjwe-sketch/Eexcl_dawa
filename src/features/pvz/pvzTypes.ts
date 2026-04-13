/* PvZ 的核心类型定义。供内容 registry、关卡数据、战斗状态与 Sheet7/8/9 共用。 */

export const PVZ_PLANT_IDS = [
  'sunflower',
  'twinSunflower',
  'sunShroom',
  'coffeeBean',
  'imitater',
  'flowerPot',
  'lilyPad',
  'pumpkin',
  'goldLeaf',
  'garlic',
  'peashooter',
  'repeater',
  'threepeater',
  'gatlingPea',
  'snowPea',
  'torchwood',
  'splitPea',
  'cactus',
  'seaShroom',
  'twoHeadedPea',
  'starfruit',
  'cattail',
  'cabbagePult',
  'kernelPult',
  'melonPult',
  'winterMelon',
  'reedPult',
  'cobCannon',
  'gloomShroom',
  'magnetShroom',
  'plantern',
  'umbrellaLeaf',
  'wallnut',
  'tallnut',
  'spikeweed',
  'spikerock',
  'seaWallnut',
  'graveBuster',
  'steelSpikeweed',
  'potatoMine',
  'cherryBomb',
  'jalapeno',
  'squash',
  'doomShroom',
  'powderShroom',
  'icebergLettuce',
  'iceShroom',
  'hypnoShroom',
  'fireMine',
  'starMine',
  'butterCannon',
  'chomper',
  'puffShroom',
  'scaredyShroom',
  'jumpingBean',
  'citron',
  'bloomerang',
  'laserBean',
  'bonkChoy',
  'electricPea',
  'frostMelonVine',
  'miniSunflower',
  'doubleCabbage',
  'magnetBurstShroom',
  'shieldBlossom',
  'auditBean',
] as const;

export const PVZ_ZOMBIE_IDS = [
  'normal',
  'flag',
  'conehead',
  'pole',
  'newspaper',
  'screenDoor',
  'buckethead',
  'football',
  'snorkel',
  'dolphinRider',
  'balloon',
  'miner',
  'dancing',
  'backupDancer',
  'zomboni',
  'bobsled',
  'basketball',
  'ladder',
  'gargantuar',
  'imp',
  'bungee',
  'pogo',
  'engineer',
  'pipe',
  'auditZombie',
  'formulaZombie',
  'shorthandZombie',
  'auditChief',
  'hostZombie',
  'finalGargantuar',
] as const;

export type PvZPlantId = (typeof PVZ_PLANT_IDS)[number];
export type PvZZombieId = (typeof PVZ_ZOMBIE_IDS)[number];
export type PvZChapterId = 'day' | 'night' | 'pool' | 'fog' | 'roof';
export type PvZMode = 'adventure' | 'lab' | 'survival';
export type PvZScenarioId = string;
export type PvZLevelId = string;
export type PvZImplementationStage = 'full' | 'variant' | 'planned';
export type PvZChapterAffinity = PvZChapterId | 'all' | 'lab';
export type PvZScenarioFamily = 'mainline' | 'challenge' | 'survival';
export type PvZPlantArchetype =
  | 'economy'
  | 'shooter'
  | 'lobber'
  | 'blocker'
  | 'trap'
  | 'bomb'
  | 'melee'
  | 'support'
  | 'platform'
  | 'container'
  | 'spike'
  | 'special';
export type PvZZombieArchetype =
  | 'walker'
  | 'armored'
  | 'jumper'
  | 'fast'
  | 'summoner'
  | 'ranged'
  | 'boss'
  | 'air'
  | 'water'
  | 'rear'
  | 'support';

export type PvZProjectileKind = 'pea' | 'double-pea' | 'snow-pea' | 'lobbed' | 'fire-pea' | 'shock' | 'spike';
export type PvZSupportEffect = 'torch' | 'reveal' | 'armor-strip' | 'shield' | 'redirect' | 'platform' | 'container';
export type PvZTileRequirement = 'ground' | 'water' | 'roof';

export interface PvZPlantDefinition {
  id: PvZPlantId;
  name: string;
  shortName: string;
  summary: string;
  archetype: PvZPlantArchetype;
  implementation: PvZImplementationStage;
  unlockLevel: PvZLevelId;
  chapterAffinity: PvZChapterAffinity[];
  tags: string[];
  cost: number;
  cooldownMs: number;
  maxHp: number;
  damage?: number;
  armorHp?: number;
  attackIntervalMs?: number;
  producesSun?: boolean;
  sunIntervalMs?: number;
  sunAmount?: number;
  laneBlocker?: boolean;
  explodeRadius?: 1 | 3 | 5;
  splashRadius?: 1 | 3;
  projectileKind?: PvZProjectileKind;
  projectileCount?: number;
  multiLane?: 'adjacent' | 'all';
  supportEffect?: PvZSupportEffect;
  requiresTile?: PvZTileRequirement;
  runtimeAliasOf?: PvZPlantId;
}

export interface PvZZombieDefinition {
  id: PvZZombieId;
  name: string;
  shortName: string;
  summary: string;
  archetype: PvZZombieArchetype;
  implementation: PvZImplementationStage;
  unlockLevel: PvZLevelId;
  chapterAffinity: PvZChapterAffinity[];
  tags: string[];
  threatLabel: string;
  maxHp: number;
  armorHp?: number;
  speed: number;
  rewardSun?: number;
  summonIds?: PvZZombieId[];
  speedMultiplierOnTrigger?: number;
  runtimeAliasOf?: PvZZombieId;
}

export interface PvZPlantInstance {
  instanceId: string;
  plantId: PvZPlantId;
  row: number;
  col: number;
  hp: number;
  attackTimerMs: number;
  sunTimerMs: number;
  armed: boolean;
  isAttacking?: boolean;
  attackTargetRow?: number;
  lastAttackTime?: number;
  isBeingAttacked?: boolean;
  attackFlashTimerMs?: number;
}

export interface PvZZombieInstance {
  instanceId: string;
  zombieId: PvZZombieId;
  row: number;
  x: number;
  hp: number;
  isStealth?: boolean;
  isAirborne?: boolean;
  isSummoning?: boolean;
  summonTimerMs?: number;
  hasThrownImp?: boolean;
  isAttacking?: boolean;
  attackTargetId?: string;
}

export interface PvZProjectile {
  projectileId: string;
  kind: PvZProjectileKind;
  row: number;
  x: number;
  speed: number;
  damage: number;
  targetZombieId?: string;
  splashRadius?: number;
  slowEffect?: boolean;
  targetRow?: number;
  isTracking?: boolean;
  markEffect?: boolean;
}

export interface PvZSpawnEvent {
  id: string;
  zombieId: PvZZombieId;
  row: number;
  spawnAtMs: number;
}

export interface PvZWaveConfig {
  waveIndex: number;
  waveType: 'small' | 'large' | 'final';
  zombieCount: number;
  zombieTypes: PvZZombieId[];
  spawnIntervalMs: number;
  preWaveDelayMs: number;
}

export interface PvZLevelDefinition {
  id: PvZLevelId;
  levelNumber: number;
  chapterId: PvZChapterId;
  chapterIndex: number;
  mode: PvZMode;
  family: PvZScenarioFamily;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S5+' | 'S6';
  baseSun: number;
  waveDurationMs: number;
  defaultCards: PvZPlantId[];
  availablePlants: PvZPlantId[];
  recommendedCards: PvZPlantId[];
  unlockPlants: PvZPlantId[];
  unlockZombies: PvZZombieId[];
  enemyRoster: PvZZombieId[];
  spawnQueue: PvZSpawnEvent[];
  waves: PvZWaveConfig[];
  hasLawnMowers: boolean;
  skyDropSun: boolean;
  environment: 'day' | 'night' | 'pool' | 'fog' | 'roof';
  isExam?: boolean;
  previousLevelId?: string;
  nextLevelId?: string;
  chapterTitle?: string;
  isBossLevel?: boolean;
}

export interface PvZSunDrop {
  dropId: string;
  row: number;
  x: number;
  y: number;
  targetY: number;
  amount: number;
  spawnTime: number;
  lifetimeMs: number;
}

export interface PvZLawnMowerState {
  active: boolean;
  triggered: boolean;
  x: number;
}

export type PvZFogMask = boolean[][];

export interface PvZBoardState {
  rows: number;
  cols: number;
  mode: PvZMode;
  scenarioId: PvZScenarioId;
  scenarioFamily: PvZScenarioFamily;
  levelId: PvZLevelId | null;
  levelNumber: number | null;
  levelTitle: string;
  chapterId: PvZChapterId;
  chapterTitle: string;
  chapterSummary: string;
  scenarioRules: string[];
  scenarioObjective: string;
  scenarioIntensity: PvZLevelDefinition['intensity'] | 'special';
  defaultCards: PvZPlantId[];
  availablePlants: PvZPlantId[];
  recommendedCards: PvZPlantId[];
  unlockedPlants: PvZPlantId[];
  unlockedZombies: PvZZombieId[];
  latestUnlockPlants: PvZPlantId[];
  latestUnlockZombies: PvZZombieId[];
  waveDurationMs: number;
  sun: number;
  phase: 'setup' | 'playing' | 'won' | 'lost';
  status: 'playing' | 'won' | 'lost';
  elapsedMs: number;
  waveProgress: number;
  selectedPlantId: PvZPlantId | null;
  selectedCards: PvZPlantId[];
  plants: PvZPlantInstance[];
  zombies: PvZZombieInstance[];
  projectiles: PvZProjectile[];
  spawnQueue: PvZSpawnEvent[];
  scenarioSpawnQueueBase: PvZSpawnEvent[];
  lawnMowers: boolean[];
  lawnMowerStates: PvZLawnMowerState[];
  cardCooldownsMs: Partial<Record<PvZPlantId, number>>;
  scenarioSegmentsTotal: number;
  scenarioSegmentIndex: number;
  scenarioSunDrainPerSecond: number;
  scenarioSegmentDurationMs: number;
  currentWaveIndex: number;
  waveState: 'idle' | 'active' | 'complete' | 'interval';
  waves: PvZWaveConfig[];
  waveTimerMs: number;
  skyDrops: PvZSunDrop[];
  lastSkySunTime: number;
  shovelMode: boolean;
  gameSpeed: 1 | 2;
  isPaused: boolean;
  environment: PvZLevelDefinition['environment'];
  fogMask: PvZFogMask;
}
