import { PVZ_PLANT_MAP } from './pvzPlantRegistry.ts';
import { PVZ_ZOMBIE_MAP } from './pvzZombieRegistry.ts';
import { DEFAULT_PVZ_CHAPTER_ID, getPvZChapterById } from './pvzChapters.ts';
import { getDefaultPvZScenarioIdForChapter, getPvZScenarioById } from './pvzScenarioCatalog.ts';
import type {
  PvZBoardState,
  PvZChapterId,
  PvZFogMask,
  PvZLevelDefinition,
  PvZMode,
  PvZPlantId,
  PvZPlantDefinition,
  PvZPlantInstance,
  PvZProjectile,
  PvZProjectileKind,
  PvZScenarioId,
  PvZSpawnEvent,
  PvZSunDrop,
  PvZWaveConfig,
  PvZZombieId,
  PvZZombieInstance,
} from './pvzTypes.ts';

const ROWS = 5;
const COLS = 9;
const CARD_LIMIT = 6;
const ZOMBIE_ATTACK_RANGE = 0.45;
const ZOMBIE_ATTACK_LEFT_TOLERANCE = 0.1;
const LAWN_MOWER_TRIGGER_X = 0.5;
const LAWN_MOWER_START_X = -0.5;
const WAVE_START_DELAY_MS = 2000;
const WAVE_INTERVAL_DURATION_MS = 3000;

function isWaterTile(environment: PvZLevelDefinition['environment'], row: number): boolean {
  if (environment !== 'pool' && environment !== 'fog') return false;
  return row === 1 || row === 3;
}

function canPlantOnWater(definition: PvZPlantDefinition, plantsOnTile: PvZPlantInstance[]): boolean {
  if (definition.requiresTile === 'water') return true;
  if (definition.id === 'lilyPad') return true;
  const hasLilyPad = plantsOnTile.some((plant) => plant.plantId === 'lilyPad');
  return hasLilyPad;
}

function isRoofTile(environment: PvZLevelDefinition['environment']): boolean {
  return environment === 'roof';
}

function canPlantOnRoof(definition: PvZPlantDefinition, plantsOnTile: PvZPlantInstance[]): boolean {
  if (definition.id === 'flowerPot') return true;
  const hasFlowerPot = plantsOnTile.some((plant) => plant.plantId === 'flowerPot');
  return hasFlowerPot;
}

function isLobberPlant(plantId: PvZPlantId): boolean {
  const definition = PVZ_PLANT_MAP[plantId];
  if (!definition) return false;
  if (plantId === 'flowerPot') return true;
  return definition.archetype === 'lobber';
}

const FOG_VISIBILITY_RADIUS = 1;

function createFogMask(rows: number, cols: number, isFogEnvironment: boolean): PvZFogMask {
  if (!isFogEnvironment) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
  }
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => true));
}

export function updateFogVisibility(state: PvZBoardState): PvZBoardState {
  if (state.environment !== 'fog') {
    return {
      ...state,
      fogMask: createFogMask(state.rows, state.cols, false),
    };
  }

  const newFogMask: PvZFogMask = Array.from({ length: state.rows }, () =>
    Array.from({ length: state.cols }, () => true),
  );

  const planterns = state.plants.filter((plant) => plant.plantId === 'plantern');

  for (const plantern of planterns) {
    for (let rowOffset = -FOG_VISIBILITY_RADIUS; rowOffset <= FOG_VISIBILITY_RADIUS; rowOffset += 1) {
      for (let colOffset = -FOG_VISIBILITY_RADIUS; colOffset <= FOG_VISIBILITY_RADIUS; colOffset += 1) {
        const targetRow = plantern.row + rowOffset;
        const targetCol = plantern.col + colOffset;
        if (targetRow >= 0 && targetRow < state.rows && targetCol >= 0 && targetCol < state.cols) {
          newFogMask[targetRow][targetCol] = false;
        }
      }
    }
  }

  return { ...state, fogMask: newFogMask };
}

export function checkPlantInFog(state: PvZBoardState, row: number, col: number): boolean {
  if (state.environment !== 'fog') return false;
  if (row < 0 || row >= state.rows || col < 0 || col >= state.cols) return false;
  return state.fogMask[row]?.[col] ?? false;
}

export function checkZombieInFog(state: PvZBoardState, row: number, x: number): boolean {
  if (state.environment !== 'fog') return false;
  const col = Math.floor(x);
  if (row < 0 || row >= state.rows || col < 0 || col >= state.cols) return false;
  return state.fogMask[row]?.[col] ?? false;
}

type CreatePvZBoardOptions = {
  chapterId?: PvZChapterId;
  scenarioId?: PvZScenarioId;
  levelId?: string;
  mode?: PvZMode;
};

function cloneSpawnQueue(queue: PvZSpawnEvent[]): PvZSpawnEvent[] {
  return queue.map((event) => ({ ...event }));
}

function createPlantInstance(plantId: PvZPlantId, row: number, col: number): PvZPlantInstance {
  const definition = PVZ_PLANT_MAP[plantId];
  return {
    instanceId: `${plantId}-${row}-${col}-${Date.now()}-${Math.random()}`,
    plantId,
    row,
    col,
    hp: definition.maxHp,
    attackTimerMs: 0,
    sunTimerMs: 0,
    armed: plantId !== 'potatoMine',
  };
}

function createProjectile(
  kind: PvZProjectileKind,
  row: number,
  x: number,
  damage: number,
  options?: {
    splashRadius?: number;
    slowEffect?: boolean;
    targetRow?: number;
    isTracking?: boolean;
    markEffect?: boolean;
  },
): PvZProjectile {
  const speeds: Record<PvZProjectileKind, number> = {
    pea: 0.0015,
    'double-pea': 0.0018,
    'snow-pea': 0.0013,
    lobbed: 0.001,
    'fire-pea': 0.0017,
    shock: 0.0016,
    spike: 0.001,
  };

  return {
    projectileId: `${kind}-${row}-${x}-${Date.now()}-${Math.random()}`,
    kind,
    row,
    x,
    speed: speeds[kind],
    damage,
    splashRadius: options?.splashRadius,
    slowEffect: options?.slowEffect,
    targetRow: options?.targetRow,
    isTracking: options?.isTracking,
    markEffect: options?.markEffect,
  };
}

const SKY_SUN_FALL_SPEED = 0.0003;
const SKY_SUN_LIFETIME_MS = 10000;

function spawnSkySun(state: PvZBoardState): PvZBoardState {
  const row = Math.floor(Math.random() * ROWS);
  const x = 0.5 + Math.random() * (COLS - 1);
  const amount = Math.random() < 0.8 ? 25 : 50;
  const targetY = row;
  const drop: PvZSunDrop = {
    dropId: `sun-${Date.now()}-${Math.random()}`,
    row,
    x,
    y: -0.5,
    targetY,
    amount,
    spawnTime: state.elapsedMs,
    lifetimeMs: SKY_SUN_LIFETIME_MS,
  };
  return {
    ...state,
    skyDrops: [...state.skyDrops, drop],
  };
}

export function collectSunDrop(state: PvZBoardState, dropId: string): PvZBoardState {
  const drop = state.skyDrops.find((d) => d.dropId === dropId);
  if (!drop) return state;
  return {
    ...state,
    sun: state.sun + drop.amount,
    skyDrops: state.skyDrops.filter((d) => d.dropId !== dropId),
  };
}

function updateSkyDrops(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  if (state.skyDrops.length === 0) return state;
  const now = state.elapsedMs;
  const updatedDrops: PvZSunDrop[] = [];
  for (const drop of state.skyDrops) {
    if (now - drop.spawnTime > drop.lifetimeMs) continue;
    let newY = drop.y;
    if (drop.y < drop.targetY) {
      newY = drop.y + SKY_SUN_FALL_SPEED * elapsedMs;
      if (newY >= drop.targetY) {
        newY = drop.targetY;
      }
    }
    updatedDrops.push({ ...drop, y: newY });
  }
  return { ...state, skyDrops: updatedDrops };
}

function resolveScenarioId(options?: CreatePvZBoardOptions): PvZScenarioId {
  if (options?.scenarioId) return options.scenarioId;
  if (options?.levelId) return options.levelId;
  if (options?.chapterId) return getDefaultPvZScenarioIdForChapter(options.chapterId);
  return getDefaultPvZScenarioIdForChapter(DEFAULT_PVZ_CHAPTER_ID);
}

function readScenarioLevelMeta(
  scenario: ReturnType<typeof getPvZScenarioById>,
): Partial<
  Pick<
    PvZLevelDefinition,
    | 'id'
    | 'levelNumber'
    | 'title'
    | 'intensity'
    | 'availablePlants'
    | 'recommendedCards'
    | 'unlockPlants'
    | 'unlockZombies'
  >
> {
  return scenario as Partial<
    Pick<
      PvZLevelDefinition,
      | 'id'
      | 'levelNumber'
      | 'title'
      | 'intensity'
      | 'availablePlants'
      | 'recommendedCards'
      | 'unlockPlants'
      | 'unlockZombies'
    >
  >;
}

function startNextSurvivalSegment(state: PvZBoardState): PvZBoardState {
  if (state.scenarioSegmentIndex >= state.scenarioSegmentsTotal) return state;
  return {
    ...state,
    spawnQueue: cloneSpawnQueue(state.scenarioSpawnQueueBase),
    elapsedMs: 0,
    waveProgress: 0,
    scenarioSegmentIndex: state.scenarioSegmentIndex + 1,
    status: 'playing',
    phase: 'playing',
  };
}

export function createPvZBoardState(input: PvZChapterId | CreatePvZBoardOptions = DEFAULT_PVZ_CHAPTER_ID): PvZBoardState {
  const options: CreatePvZBoardOptions = typeof input === 'string' ? { chapterId: input } : input;
  const scenario = getPvZScenarioById(resolveScenarioId(options));
  const chapter = getPvZChapterById(scenario.chapterId);
  const levelMeta = readScenarioLevelMeta(scenario);
  const mode = options.mode ?? scenario.mode;
  const baseQueue = cloneSpawnQueue(scenario.spawnQueue ?? chapter.spawnQueue);
  const segmentsTotal = scenario.segments ?? 1;
  const segmentDurationMs = scenario.segmentDurationMs ?? scenario.waveDurationMs ?? chapter.waveDurationMs;
  const totalDurationMs = scenario.mode === 'survival' ? segmentDurationMs * segmentsTotal : segmentDurationMs;
  const defaultCards = [...(scenario.defaultCards ?? chapter.defaultCards)];
  const environment: PvZLevelDefinition['environment'] = chapter.id as PvZLevelDefinition['environment'];
  const baseAvailablePlants = levelMeta.availablePlants && levelMeta.availablePlants.length > 0
    ? [...levelMeta.availablePlants]
    : [...defaultCards];
  const availablePlants = environment === 'roof'
    ? baseAvailablePlants.filter((plantId) => isLobberPlant(plantId))
    : baseAvailablePlants;
  const initialSelectedCards = defaultCards.filter((plantId) => availablePlants.includes(plantId));
  const recommendedCards = levelMeta.recommendedCards && levelMeta.recommendedCards.length > 0
    ? [...levelMeta.recommendedCards]
    : [...defaultCards];
  return {
    rows: ROWS,
    cols: COLS,
    mode,
    scenarioId: scenario.id,
    scenarioFamily: scenario.mode === 'adventure' ? 'mainline' : scenario.mode === 'lab' ? 'challenge' : 'survival',
    levelId: levelMeta.id ?? null,
    levelNumber: levelMeta.levelNumber ?? null,
    levelTitle: levelMeta.title ?? scenario.title,
    chapterId: chapter.id,
    environment,
    chapterTitle: scenario.title,
    chapterSummary: scenario.summary,
    scenarioRules: [...scenario.rules],
    scenarioObjective: scenario.objective,
    scenarioIntensity: levelMeta.intensity ?? 'special',
    defaultCards,
    availablePlants,
    recommendedCards,
    unlockedPlants: [...(levelMeta.unlockPlants ?? [])],
    unlockedZombies: [...(levelMeta.unlockZombies ?? [])],
    latestUnlockPlants: [...(levelMeta.unlockPlants ?? [])],
    latestUnlockZombies: [...(levelMeta.unlockZombies ?? [])],
    waveDurationMs: totalDurationMs,
    sun: scenario.baseSun ?? chapter.baseSun,
    phase: 'setup',
    status: 'playing',
    elapsedMs: 0,
    waveProgress: 0,
    selectedPlantId: null,
    selectedCards: initialSelectedCards,
    plants: [],
    zombies: [],
    projectiles: [],
    spawnQueue: cloneSpawnQueue(baseQueue),
    scenarioSpawnQueueBase: baseQueue,
    scenarioSegmentsTotal: segmentsTotal,
    scenarioSegmentIndex: 1,
    scenarioSunDrainPerSecond: scenario.sunDrainPerSecond ?? 0,
    scenarioSegmentDurationMs: segmentDurationMs,
    lawnMowers: Array.from({ length: ROWS }, () => true),
    lawnMowerStates: Array.from({ length: ROWS }, () => ({ active: true, triggered: false, x: LAWN_MOWER_START_X })),
    cardCooldownsMs: {},
    currentWaveIndex: 0,
    waveState: 'idle',
    waves: [...(scenario.waves ?? [])],
    waveTimerMs: 0,
    skyDrops: [],
    lastSkySunTime: 0,
    shovelMode: false,
    gameSpeed: 1,
    isPaused: false,
    fogMask: createFogMask(ROWS, COLS, environment === 'fog'),
  };
}

export function setPvZChapter(state: PvZBoardState, chapterId: PvZChapterId): PvZBoardState {
  if (state.phase !== 'setup') return state;
  if (state.chapterId === chapterId) return state;
  return createPvZBoardState({ chapterId, mode: 'adventure' });
}

export function setPvZScenario(state: PvZBoardState, scenarioId: PvZScenarioId): PvZBoardState {
  if (state.phase !== 'setup') return state;
  if (state.scenarioId === scenarioId) return state;
  return createPvZBoardState({ scenarioId });
}

export function selectPvZCard(state: PvZBoardState, plantId: PvZPlantId): PvZBoardState {
  if (state.phase !== 'setup') return state;
  if (!state.availablePlants.includes(plantId)) return state;
  if (state.selectedCards.includes(plantId)) {
    return {
      ...state,
      selectedCards: state.selectedCards.filter((currentPlantId) => currentPlantId !== plantId),
    };
  }
  if (state.selectedCards.length >= CARD_LIMIT) return state;
  return { ...state, selectedCards: [...state.selectedCards, plantId] };
}

export function startPvZBattle(state: PvZBoardState): PvZBoardState {
  const fallbackCards = state.defaultCards.filter((plantId) => state.availablePlants.includes(plantId));
  const selectedCards = state.selectedCards.filter((plantId) => state.availablePlants.includes(plantId));
  return {
    ...state,
    phase: 'playing',
    selectedCards: selectedCards.length > 0 ? selectedCards : [...fallbackCards],
  };
}

export function resetPvZToSetup(state: PvZBoardState): PvZBoardState {
  const fresh = createPvZBoardState({ scenarioId: state.scenarioId });
  const cards = state.selectedCards.filter((plantId) => fresh.availablePlants.includes(plantId));
  return {
    ...fresh,
    selectedCards: cards.length > 0 ? cards : [...fresh.defaultCards],
  };
}

export function restartPvZBattle(state: PvZBoardState): PvZBoardState {
  return startPvZBattle(resetPvZToSetup(state));
}

export function placePlant(state: PvZBoardState, plantId: PvZPlantId, row: number, col: number): PvZBoardState {
  if (state.phase !== 'playing') return state;
  if (!state.selectedCards.includes(plantId)) return state;
  const definition = PVZ_PLANT_MAP[plantId];
  if (!definition) return state;
  if (state.sun < definition.cost) return state;
  const plantsOnTile = state.plants.filter((plant) => plant.row === row && plant.col === col);
  const hasPlatform = plantsOnTile.some((plant) => plant.plantId === 'lilyPad' || plant.plantId === 'flowerPot');
  if (plantsOnTile.length > 0 && !hasPlatform) return state;
  if ((state.cardCooldownsMs[plantId] || 0) > 0) return state;

  if (isWaterTile(state.environment, row) && !canPlantOnWater(definition, plantsOnTile)) return state;
  if (isRoofTile(state.environment) && !canPlantOnRoof(definition, plantsOnTile)) return state;

  const newState = {
    ...state,
    sun: state.sun - definition.cost,
    plants: [...state.plants, createPlantInstance(plantId, row, col)],
    cardCooldownsMs: {
      ...state.cardCooldownsMs,
      [plantId]: definition.cooldownMs,
    },
  };

  return updateFogVisibility(newState);
}

export function spawnZombieNow(state: PvZBoardState, zombieId: PvZZombieId, row: number, x = COLS - 0.2): PvZBoardState {
  const definition = PVZ_ZOMBIE_MAP[zombieId];
  if (!definition) return state;

  return {
    ...state,
    zombies: [
      ...state.zombies,
      {
        instanceId: `${zombieId}-${row}-${Date.now()}-${Math.random()}`,
        zombieId,
        row,
        x,
        hp: definition.maxHp,
      },
    ],
  };
}

function getSpawnQueueOffsetX(state: PvZBoardState, row: number, queuedInLane: number): number {
  const existingNearEntry = state.zombies.filter((zombie) => zombie.row === row && zombie.x >= COLS - 1.6).length;
  return COLS - 0.2 + (existingNearEntry + queuedInLane) * 0.72;
}

function tickCooldowns(state: PvZBoardState, elapsedMs: number) {
  const nextCooldowns: PvZBoardState['cardCooldownsMs'] = {};
  for (const [plantId, cooldown] of Object.entries(state.cardCooldownsMs)) {
    const next = Math.max(0, (cooldown || 0) - elapsedMs);
    if (next > 0) nextCooldowns[plantId as PvZPlantId] = next;
  }
  return nextCooldowns;
}

function applyPlantEconomy(state: PvZBoardState, elapsedMs: number) {
  let gainedSun = 0;
  const nextPlants = state.plants.map((plant) => {
    const definition = PVZ_PLANT_MAP[plant.plantId];
    if (!definition.producesSun || !definition.sunIntervalMs || !definition.sunAmount) return plant;
    const nextTimer = plant.sunTimerMs + elapsedMs;
    if (nextTimer >= definition.sunIntervalMs) {
      gainedSun += definition.sunAmount;
      return { ...plant, sunTimerMs: 0 };
    }
    return { ...plant, sunTimerMs: nextTimer };
  });

  return { nextPlants, gainedSun };
}

function applyPlantAttacks(state: PvZBoardState, elapsedMs: number) {
  const createdProjectiles: PvZProjectile[] = [];
  const zombieDamage = new Map<string, number>();
  const nextPlants = state.plants.map((plant) => {
    const definition = PVZ_PLANT_MAP[plant.plantId];
    if (!definition.damage && !definition.producesSun) return plant;

    // 地刺/地刺王：对经过的僵尸持续造成伤害
    if (plant.plantId === 'spikeweed' || plant.plantId === 'spikerock') {
      const zombiesOnTile = state.zombies.filter((zombie) => zombie.row === plant.row && Math.abs(zombie.x - plant.col) < 0.5);
      if (zombiesOnTile.length > 0 && definition.damage) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= (definition.attackIntervalMs || 1000)) {
          for (const zombie of zombiesOnTile) {
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
          }
          return { ...plant, attackTimerMs: 0 };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 忧郁蘑菇：3×3 范围伤害
    if (plant.plantId === 'gloomShroom' && definition.damage && definition.attackIntervalMs) {
      const zombiesInRange = state.zombies.filter((zombie) => {
        const rowDiff = Math.abs(zombie.row - plant.row);
        const colDiff = Math.abs(zombie.x - plant.col);
        return rowDiff <= 1 && colDiff <= 1.5;
      });
      if (zombiesInRange.length > 0) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= definition.attackIntervalMs) {
          for (const zombie of zombiesInRange) {
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
          }
          return { ...plant, attackTimerMs: 0 };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 窝瓜：跳跃砸击最近的僵尸
    if (plant.plantId === 'squash' && definition.damage && definition.attackIntervalMs) {
      const targetZombie = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x > plant.col && zombie.x < plant.col + 3);
      if (targetZombie) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= definition.attackIntervalMs) {
          zombieDamage.set(targetZombie.instanceId, (zombieDamage.get(targetZombie.instanceId) || 0) + definition.damage);
          // 窝瓜使用后消失
          return { ...plant, hp: 0, attackTimerMs: 0 };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    if (!definition.damage || !definition.attackIntervalMs) return plant;

    // 裂荚射手：前后双向射击
    if (plant.plantId === 'splitPea') {
      const zombieAhead = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
      const zombieBehind = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x < plant.col && zombie.x > plant.col - 5);
      if (!zombieAhead && !zombieBehind) return plant;

      const nextTimer = plant.attackTimerMs + elapsedMs;
      if (nextTimer < definition.attackIntervalMs) {
        return { ...plant, attackTimerMs: nextTimer };
      }

      if (zombieAhead && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6, definition.damage));
      }
      if (zombieBehind && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col - 0.3, definition.damage));
      }

      return { ...plant, attackTimerMs: 0 };
    }

    // 星星果：5 方向射击
    if (plant.plantId === 'starfruit') {
      const hasZombieAhead = state.zombies.some((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
      const hasZombieBehind = state.zombies.some((zombie) => zombie.row === plant.row && zombie.x < plant.col && zombie.x > plant.col - 5);
      const hasZombieAbove = state.zombies.some((zombie) => zombie.row < plant.row && Math.abs(zombie.x - plant.col) < 2);
      const hasZombieBelow = state.zombies.some((zombie) => zombie.row > plant.row && Math.abs(zombie.x - plant.col) < 2);

      if (!hasZombieAhead && !hasZombieBehind && !hasZombieAbove && !hasZombieBelow) return plant;

      const nextTimer = plant.attackTimerMs + elapsedMs;
      if (nextTimer < definition.attackIntervalMs) {
        return { ...plant, attackTimerMs: nextTimer };
      }

      if (hasZombieAhead && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6, definition.damage));
      }
      if (hasZombieBehind && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col - 0.3, definition.damage));
      }
      if (hasZombieAbove && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row - 1, plant.col + 0.3, definition.damage));
      }
      if (hasZombieBelow && definition.projectileKind) {
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row + 1, plant.col + 0.3, definition.damage));
      }

      return { ...plant, attackTimerMs: 0 };
    }

    // 三线射手：相邻三路射击
    if (definition.multiLane === 'adjacent' && definition.projectileKind) {
      const lanes = [plant.row];
      if (plant.row > 0) lanes.push(plant.row - 1);
      if (plant.row < ROWS - 1) lanes.push(plant.row + 1);

      const hasZombie = lanes.some((lane) => state.zombies.some((zombie) => zombie.row === lane && zombie.x >= plant.col));
      if (!hasZombie) return plant;

      const nextTimer = plant.attackTimerMs + elapsedMs;
      if (nextTimer < definition.attackIntervalMs) {
        return { ...plant, attackTimerMs: nextTimer };
      }

      for (const lane of lanes) {
        const zombieAhead = state.zombies.find((zombie) => zombie.row === lane && zombie.x >= plant.col);
        if (zombieAhead) {
          createdProjectiles.push(createProjectile(definition.projectileKind, lane, plant.col + 0.6, definition.damage));
        }
      }

      return { ...plant, attackTimerMs: 0 };
    }

    // 猫尾草：全路追踪射击（水面专属）
    if (plant.plantId === 'cattail' && definition.projectileKind && definition.multiLane === 'all') {
      const hasZombie = state.zombies.some((zombie) => zombie.x >= plant.col - 2);
      if (!hasZombie) return plant;

      const nextTimer = plant.attackTimerMs + elapsedMs;
      if (nextTimer < definition.attackIntervalMs) {
        return { ...plant, attackTimerMs: nextTimer };
      }

      // 追踪最近的僵尸
      const nearestZombie = state.zombies
        .filter((zombie) => zombie.x >= plant.col - 2)
        .sort((a, b) => a.x - b.x)[0];
      if (nearestZombie) {
        createdProjectiles.push(createProjectile(definition.projectileKind, nearestZombie.row, plant.col + 0.6, definition.damage));
      }

      return { ...plant, attackTimerMs: 0 };
    }

    // 香蒲投手：全路追踪抛投（水面专属）
    if (plant.plantId === 'reedPult' && definition.projectileKind && definition.multiLane === 'all') {
      const hasZombie = state.zombies.some((zombie) => zombie.x >= plant.col - 2);
      if (!hasZombie) return plant;

      const nextTimer = plant.attackTimerMs + elapsedMs;
      if (nextTimer < definition.attackIntervalMs) {
        return { ...plant, attackTimerMs: nextTimer };
      }

      // 追踪最近的僵尸
      const nearestZombie = state.zombies
        .filter((zombie) => zombie.x >= plant.col - 2)
        .sort((a, b) => a.x - b.x)[0];
      if (nearestZombie) {
        createdProjectiles.push(createProjectile(definition.projectileKind, nearestZombie.row, plant.col + 0.6, definition.damage));
      }

      return { ...plant, attackTimerMs: 0 };
    }

    // 毁灭菇：超大范围爆炸
    if (plant.plantId === 'doomShroom' && definition.damage && definition.explodeRadius) {
      const explodeRadius = definition.explodeRadius;
      const zombiesInRange = state.zombies.filter((zombie) => {
        const rowDiff = Math.abs(zombie.row - plant.row);
        const colDiff = Math.abs(zombie.x - plant.col);
        return rowDiff <= 2 && colDiff <= explodeRadius;
      });
      if (zombiesInRange.length > 0) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= (definition.attackIntervalMs || 1000)) {
          for (const zombie of zombiesInRange) {
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
          }
          // 毁灭菇使用后消失
          return { ...plant, hp: 0, attackTimerMs: 0 };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 催眠蘑菇：反转最近的僵尸
    if (plant.plantId === 'hypnoShroom' && definition.damage && definition.attackIntervalMs) {
      const targetZombie = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x > plant.col && zombie.x < plant.col + 2);
      if (targetZombie) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= definition.attackIntervalMs) {
          // 催眠效果：直接消灭该僵尸
          zombieDamage.set(targetZombie.instanceId, targetZombie.hp);
          // 催眠蘑菇使用后消失
          return { ...plant, hp: 0, attackTimerMs: 0 };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 激光豆：整线穿透攻击
    if (plant.plantId === 'laserBean' && definition.projectileKind === 'shock') {
      const zombiesInLane = state.zombies.filter((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
      if (zombiesInLane.length > 0) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= definition.attackIntervalMs) {
          // 对整行所有僵尸造成伤害
          for (const zombie of zombiesInLane) {
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
          }
          return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 菜问：高速近战连打
    if (plant.plantId === 'bonkChoy' && definition.damage && definition.attackIntervalMs) {
      const adjacentZombies = state.zombies.filter((zombie) => {
        const rowDiff = Math.abs(zombie.row - plant.row);
        const colDiff = Math.abs(zombie.x - plant.col);
        return rowDiff <= 1 && colDiff <= 1.5;
      });
      if (adjacentZombies.length > 0) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= definition.attackIntervalMs) {
          // 对相邻僵尸造成伤害
          for (const zombie of adjacentZombies) {
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
          }
          return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 磁暴菇：群体脱甲
    if (plant.plantId === 'magnetBurstShroom' && definition.supportEffect === 'armor-strip') {
      const armoredZombies = state.zombies.filter((zombie) => {
        const rowDiff = Math.abs(zombie.row - plant.row);
        const colDiff = Math.abs(zombie.x - plant.col);
        const zombieDef = PVZ_ZOMBIE_MAP[zombie.zombieId];
        return rowDiff <= 2 && colDiff <= 3 && (zombieDef.armorHp ?? 0) > 0;
      });
      if (armoredZombies.length > 0) {
        const nextTimer = plant.attackTimerMs + elapsedMs;
        if (nextTimer >= (definition.attackIntervalMs || 10000)) {
          // 移除护甲（简化实现：直接扣除护甲血量）
          for (const zombie of armoredZombies) {
            const zombieDef = PVZ_ZOMBIE_MAP[zombie.zombieId];
            zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + (zombieDef.armorHp ?? 0));
          }
          return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
        }
        return { ...plant, attackTimerMs: nextTimer };
      }
      return plant;
    }

    // 普通射击逻辑
    const zombieAhead = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
    if (!zombieAhead) return plant;

    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer < definition.attackIntervalMs) {
      return { ...plant, attackTimerMs: nextTimer };
    }

    if (definition.projectileKind) {
      const projectileCount = definition.projectileCount || 1;
      for (let index = 0; index < projectileCount; index += 1) {
        // 寒冰射手：减速效果
        if (plant.plantId === 'snowPea') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { slowEffect: true }));
        }
        // 西瓜投手：溅射效果
        else if (plant.plantId === 'melonPult') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { splashRadius: 3 }));
        }
        // 冰瓜投手：溅射 + 减速效果
        else if (plant.plantId === 'winterMelon') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { splashRadius: 3, slowEffect: true }));
        }
        // 冰西瓜藤：强控抛投（溅射 + 减速）
        else if (plant.plantId === 'frostMelonVine') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { splashRadius: 3, slowEffect: true }));
        }
        // 审计豆：高威胁标记
        else if (plant.plantId === 'auditBean') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { markEffect: true }));
        }
        // 猫尾草：追踪效果
        else if (plant.plantId === 'cattail') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { isTracking: true, targetRow: plant.row }));
        }
        // 香蒲投手：追踪抛投效果
        else if (plant.plantId === 'reedPult') {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage, { isTracking: true, targetRow: plant.row }));
        }
        // 普通弹道
        else {
          createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage));
        }
      }
    } else {
      zombieDamage.set(zombieAhead.instanceId, (zombieDamage.get(zombieAhead.instanceId) || 0) + definition.damage);
    }

    return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
  });

  const nextZombies = state.zombies
    .map((zombie) => ({ ...zombie, hp: zombie.hp - (zombieDamage.get(zombie.instanceId) || 0) }))
    .filter((zombie) => zombie.hp > 0);

  return { nextPlants, nextZombies, createdProjectiles };
}

function moveProjectiles(state: PvZBoardState, elapsedMs: number) {
  const zombieDamage = new Map<string, number>();
  const zombieSlow = new Map<string, boolean>();
  const remainingProjectiles: PvZProjectile[] = [];

  for (const projectile of state.projectiles) {
    const nextX = projectile.x + projectile.speed * elapsedMs;
    const target = state.zombies.find((zombie) => zombie.row === projectile.row && zombie.x <= nextX + 0.3 && zombie.x >= nextX - 0.2);
    if (target) {
      // 标记效果：增加 50% 伤害
      const damageMultiplier = projectile.markEffect ? 1.5 : 1;
      zombieDamage.set(target.instanceId, (zombieDamage.get(target.instanceId) || 0) + projectile.damage * damageMultiplier);
      if (projectile.slowEffect) {
        zombieSlow.set(target.instanceId, true);
      }
      // 电击连锁效果：对相邻僵尸造成 50% 伤害
      if (projectile.kind === 'shock') {
        const chainTargets = state.zombies.filter((zombie) => {
          const rowDiff = Math.abs(zombie.row - projectile.row);
          const colDiff = Math.abs(zombie.x - projectile.x);
          return rowDiff <= 1 && colDiff <= 1 && zombie.instanceId !== target.instanceId;
        });
        for (const chainTarget of chainTargets) {
          zombieDamage.set(chainTarget.instanceId, (zombieDamage.get(chainTarget.instanceId) || 0) + Math.floor(projectile.damage * 0.5));
        }
      }
      // 溅射效果：对周围僵尸也造成伤害
      if (projectile.splashRadius) {
        const splashRadius = projectile.splashRadius;
        const splashTargets = state.zombies.filter((zombie) => {
          const rowDiff = Math.abs(zombie.row - projectile.row);
          const colDiff = Math.abs(zombie.x - projectile.x);
          return rowDiff <= 1 && colDiff <= splashRadius && zombie.instanceId !== target.instanceId;
        });
        for (const splashTarget of splashTargets) {
          zombieDamage.set(splashTarget.instanceId, (zombieDamage.get(splashTarget.instanceId) || 0) + Math.floor(projectile.damage * 0.5));
          if (projectile.slowEffect) {
            zombieSlow.set(splashTarget.instanceId, true);
          }
        }
      }
      continue;
    }
    if (nextX < COLS + 0.5) {
      remainingProjectiles.push({ ...projectile, x: nextX });
    }
  }

  const nextZombies = state.zombies
    .map((zombie) => ({ ...zombie, hp: zombie.hp - (zombieDamage.get(zombie.instanceId) || 0) }))
    .filter((zombie) => zombie.hp > 0);

  return { remainingProjectiles, nextZombies };
}

function spawnQueuedZombies(state: PvZBoardState) {
  const ready = state.spawnQueue.filter((item) => item.spawnAtMs <= state.elapsedMs);
  const later = state.spawnQueue.filter((item) => item.spawnAtMs > state.elapsedMs);

  let nextState = { ...state, spawnQueue: later };
  const laneQueuedCounts = new Map<number, number>();
  for (const event of ready) {
    const queuedInLane = laneQueuedCounts.get(event.row) ?? 0;
    const spawnX = getSpawnQueueOffsetX(nextState, event.row, queuedInLane);
    laneQueuedCounts.set(event.row, queuedInLane + 1);
    nextState = spawnZombieNow(nextState, event.zombieId, event.row, spawnX);
  }
  return nextState;
}

function isSupportPlant(plant: PvZPlantInstance): boolean {
  return plant.plantId === 'lilyPad' || plant.plantId === 'flowerPot';
}

function findFrontPlantInLane(plants: PvZPlantInstance[], row: number, zombieX: number): PvZPlantInstance | undefined {
  let frontPlant: PvZPlantInstance | undefined;
  for (const plant of plants) {
    if (plant.row !== row) continue;
    if (plant.col > zombieX + ZOMBIE_ATTACK_RANGE) continue;
    if (
      !frontPlant
      || plant.col > frontPlant.col
      || (plant.col === frontPlant.col && isSupportPlant(frontPlant) && !isSupportPlant(plant))
    ) {
      frontPlant = plant;
    }
  }
  return frontPlant;
}

function findZombieAttackTarget(state: PvZBoardState, zombie: PvZZombieInstance): PvZPlantInstance | undefined {
  const frontPlant = findFrontPlantInLane(state.plants, zombie.row, zombie.x);
  if (!frontPlant) return undefined;
  const distance = zombie.x - frontPlant.col;
  if (distance >= -ZOMBIE_ATTACK_LEFT_TOLERANCE && distance <= ZOMBIE_ATTACK_RANGE) {
    return frontPlant;
  }
  return undefined;
}

function clampZombieNextXForPlantCollision(state: PvZBoardState, zombie: PvZZombieInstance, nextX: number): number {
  const frontPlant = findFrontPlantInLane(state.plants, zombie.row, zombie.x);
  if (!frontPlant) return nextX;
  const stopX = frontPlant.col + ZOMBIE_ATTACK_RANGE;
  if (zombie.x <= stopX) return zombie.x;
  if (nextX < stopX) return stopX;
  return nextX;
}

function resolveLawnMowerTriggersAndBreaches(state: PvZBoardState): PvZBoardState {
  const rowsToTrigger = new Set<number>();
  for (const zombie of state.zombies) {
    if (zombie.x > LAWN_MOWER_TRIGGER_X) continue;
    const mower = state.lawnMowerStates[zombie.row];
    if (mower?.active && !mower.triggered) {
      rowsToTrigger.add(zombie.row);
    }
  }

  const nextMowerStates = state.lawnMowerStates.map((mower, row) => {
    if (!rowsToTrigger.has(row)) return mower;
    return {
      ...mower,
      triggered: true,
      x: Math.min(mower.x, LAWN_MOWER_START_X),
    };
  });
  const nextLawnMowers = nextMowerStates.map((mower) => mower.active);

  const breachedWithoutMower = state.zombies.some((zombie) => {
    if (zombie.x >= 0) return false;
    const mower = nextMowerStates[zombie.row];
    return !mower || !mower.active;
  });

  if (!breachedWithoutMower && rowsToTrigger.size === 0) {
    return state;
  }

  return {
    ...state,
    lawnMowerStates: nextMowerStates,
    lawnMowers: nextLawnMowers,
    status: breachedWithoutMower ? 'lost' : state.status,
    phase: breachedWithoutMower ? 'lost' : state.phase,
  };
}

function moveLawnMower(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  const mowerSpeed = 0.003;
  const killedZombieIds = new Set<string>();

  const nextMowerStates = state.lawnMowerStates.map((mower, row) => {
    if (!mower.active || !mower.triggered) return mower;

    const nextX = mower.x + mowerSpeed * elapsedMs;

    state.zombies.forEach((zombie) => {
      if (zombie.row === row && zombie.x >= mower.x && zombie.x <= nextX + 0.5) {
        killedZombieIds.add(zombie.instanceId);
      }
    });

    if (nextX >= COLS + 1) {
      return { ...mower, active: false, triggered: false, x: nextX };
    }
    return { ...mower, x: nextX };
  });

  const nextZombies = state.zombies.filter((zombie) => !killedZombieIds.has(zombie.instanceId));
  const nextLawnMowers = nextMowerStates.map((mower) => mower.active);

  return {
    ...state,
    lawnMowerStates: nextMowerStates,
    lawnMowers: nextLawnMowers,
    zombies: nextZombies,
  };
}

function getZombieAttackDamagePerSecond(zombieId: PvZZombieId): number {
  const definition = PVZ_ZOMBIE_MAP[zombieId];
  if (!definition) return 20;
  if (definition.archetype === 'boss') return 40;
  if (definition.archetype === 'fast') return 30;
  if (definition.archetype === 'armored') return 25;
  return 20;
}

function zombieAttackPlant(
  zombie: PvZZombieInstance,
  plant: PvZPlantInstance,
  elapsedMs: number,
): { plantHp: number; plantFlashTimer: number } {
  const damagePerSecond = getZombieAttackDamagePerSecond(zombie.zombieId);
  const damage = (damagePerSecond / 1000) * elapsedMs;
  const newHp = plant.hp - damage;
  const flashTimer = (plant.attackFlashTimerMs || 0) + elapsedMs;
  return { plantHp: newHp, plantFlashTimer: flashTimer > 200 ? 0 : flashTimer };
}

function applyZombieAttacks(state: PvZBoardState, elapsedMs: number): {
  nextPlants: PvZPlantInstance[];
  nextZombies: PvZZombieInstance[];
} {
  const plantDamage = new Map<string, number>();
  const plantFlashTimers = new Map<string, number>();
  const attackingZombieIds = new Set<string>();
  const zombieTargetMap = new Map<string, string>();

  for (const zombie of state.zombies) {
    const targetPlant = findZombieAttackTarget(state, zombie);
    if (targetPlant) {
      attackingZombieIds.add(zombie.instanceId);
      zombieTargetMap.set(zombie.instanceId, targetPlant.instanceId);
      const attackResult = zombieAttackPlant(zombie, targetPlant, elapsedMs);
      plantDamage.set(
        targetPlant.instanceId,
        (plantDamage.get(targetPlant.instanceId) || 0) + (targetPlant.hp - attackResult.plantHp),
      );
      plantFlashTimers.set(targetPlant.instanceId, attackResult.plantFlashTimer);
    }
  }

  const nextPlants = state.plants
    .map((plant) => {
      const damage = plantDamage.get(plant.instanceId);
      if (damage) {
        return {
          ...plant,
          hp: plant.hp - damage,
          isBeingAttacked: true,
          attackFlashTimerMs: plantFlashTimers.get(plant.instanceId) || 0,
        };
      }
      return { ...plant, isBeingAttacked: false, attackFlashTimerMs: 0 };
    })
    .filter((plant) => plant.hp > 0);

  const deadPlantIds = state.plants
    .filter((plant) => plantDamage.has(plant.instanceId) && plant.hp - (plantDamage.get(plant.instanceId) || 0) <= 0)
    .map((plant) => plant.instanceId);

  const nextZombies = state.zombies.map((zombie) => {
    if (attackingZombieIds.has(zombie.instanceId)) {
      const targetId = zombieTargetMap.get(zombie.instanceId);
      const targetDead = deadPlantIds.includes(targetId || '');
      return {
        ...zombie,
        isAttacking: !targetDead,
        attackTargetId: targetDead ? undefined : targetId,
      };
    }
    return { ...zombie, isAttacking: false, attackTargetId: undefined };
  });

  return { nextPlants, nextZombies };
}

function moveZombies(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  const newZombies: PvZZombieInstance[] = [];
  const auditChiefZombies = state.zombies.filter((z) => z.zombieId === 'auditChief');

  const nextZombies = state.zombies.map((zombie) => {
    if (zombie.isAttacking) {
      return zombie;
    }
    const definition = PVZ_ZOMBIE_MAP[zombie.zombieId];
    if (!definition) {
      return zombie;
    }

    if (zombie.zombieId !== 'balloon' && findZombieAttackTarget(state, zombie)) {
      return zombie;
    }

    // 检查是否有审计官僵尸在附近提供增益
    const nearbyAuditChief = auditChiefZombies.find((z) => {
      const rowDiff = Math.abs(z.row - zombie.row);
      const colDiff = Math.abs(z.x - zombie.x);
      return rowDiff <= 1 && colDiff <= 2 && z.instanceId !== zombie.instanceId;
    });
    const boostedSpeed = nearbyAuditChief ? definition.speed * 1.2 : definition.speed;

    // 潜水僵尸：水路潜行，接近前线才显形
    if (zombie.zombieId === 'snorkel') {
      const isStealth = zombie.x > 3;
      const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
      return { ...zombie, x: nextX, isStealth };
    }

    // 气球僵尸：空中路线，不受地面植物阻挡
    if (zombie.zombieId === 'balloon') {
      return { ...zombie, x: zombie.x - boostedSpeed * elapsedMs, isAirborne: true };
    }

    // 矿工僵尸：从后排切入
    if (zombie.zombieId === 'miner') {
      const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
      return { ...zombie, x: nextX };
    }

    // 舞王僵尸：定期召唤伴舞
    if (zombie.zombieId === 'dancing' && definition.summonIds) {
      const summonTimer = (zombie as any).summonTimerMs || 0;
      const nextSummonTimer = summonTimer + elapsedMs;
      if (nextSummonTimer >= 8000) {
        for (const summonId of definition.summonIds) {
          newZombies.push({
            instanceId: `${summonId}-${zombie.row}-${Date.now()}-${Math.random()}`,
            zombieId: summonId as PvZZombieId,
            row: zombie.row,
            x: zombie.x + 0.5,
            hp: PVZ_ZOMBIE_MAP[summonId as PvZZombieId]?.maxHp || 200,
          });
        }
        const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
        return { ...zombie, x: nextX, summonTimerMs: 0 };
      }
      const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
      return { ...zombie, x: nextX, summonTimerMs: nextSummonTimer };
    }

    // 巨人僵尸：半血时投掷小鬼
    if (zombie.zombieId === 'gargantuar' && definition.summonIds) {
      const hasThrown = (zombie as any).hasThrownImp;
      if (!hasThrown && zombie.hp < definition.maxHp * 0.5) {
        for (const summonId of definition.summonIds) {
          newZombies.push({
            instanceId: `${summonId}-${zombie.row}-${Date.now()}-${Math.random()}`,
            zombieId: summonId as PvZZombieId,
            row: zombie.row,
            x: zombie.x - 1.5,
            hp: PVZ_ZOMBIE_MAP[summonId as PvZZombieId]?.maxHp || 140,
          });
        }
        const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
        return { ...zombie, x: nextX, hasThrownImp: true };
      }
    }

    // 审计官僵尸：标记召唤状态（光环效果）
    if (zombie.zombieId === 'auditChief') {
      const nearbyZombies = state.zombies.filter((z) => {
        const rowDiff = Math.abs(z.row - zombie.row);
        const colDiff = Math.abs(z.x - zombie.x);
        return rowDiff <= 1 && colDiff <= 2 && z.instanceId !== zombie.instanceId;
      });
      const isSummoning = nearbyZombies.length > 0;
      const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - definition.speed * elapsedMs);
      return { ...zombie, x: nextX, isSummoning };
    }

    const nextX = clampZombieNextXForPlantCollision(state, zombie, zombie.x - boostedSpeed * elapsedMs);
    return { ...zombie, x: nextX };
  });

  return {
    ...state,
    zombies: [...nextZombies, ...newZombies],
  };
}

export function setGameSpeed(state: PvZBoardState, speed: 1 | 2): PvZBoardState {
  return { ...state, gameSpeed: speed };
}

export function togglePause(state: PvZBoardState): PvZBoardState {
  return { ...state, isPaused: !state.isPaused };
}
function generateWaveZombies(state: PvZBoardState, wave: PvZWaveConfig): PvZSpawnEvent[] {
  const events: PvZSpawnEvent[] = [];
  const baseSpawnTime = state.elapsedMs + wave.preWaveDelayMs;
  const zombiePool: PvZZombieId[] = wave.zombieTypes.length > 0 ? wave.zombieTypes : ['normal'];
  
  for (let i = 0; i < wave.zombieCount; i++) {
    const zombieId = zombiePool[Math.floor(Math.random() * zombiePool.length)] as PvZZombieId;
    const row = Math.floor(Math.random() * ROWS);
    const spawnTime = baseSpawnTime + i * wave.spawnIntervalMs;
    events.push({
      id: `wave-${wave.waveIndex}-${i}-${Date.now()}`,
      zombieId,
      row,
      spawnAtMs: spawnTime,
    });
  }
  
  return events;
}

function startNextWave(state: PvZBoardState): PvZBoardState {
  const nextWaveIndex = state.waveState === 'idle'
    ? Math.max(0, state.currentWaveIndex)
    : state.currentWaveIndex + 1;
  const nextWave = state.waves[nextWaveIndex];
  
  if (!nextWave) {
    return {
      ...state,
      waveState: 'complete',
      currentWaveIndex: state.waves.length,
    };
  }
  
  const newSpawnEvents = generateWaveZombies(state, nextWave);
  
  return {
    ...state,
    currentWaveIndex: nextWaveIndex,
    waveState: 'active',
    waveTimerMs: 0,
    spawnQueue: [...state.spawnQueue, ...newSpawnEvents],
  };
}

function processWaves(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  if (state.waves.length === 0) {
    return state;
  }
  
  const nextWaveTimerMs = state.waveTimerMs + elapsedMs;
  
  if (state.waveState === 'idle') {
    if (nextWaveTimerMs >= WAVE_START_DELAY_MS) {
      return startNextWave(state);
    }
    return { ...state, waveTimerMs: nextWaveTimerMs };
  }
  
  if (state.waveState === 'interval') {
    if (nextWaveTimerMs >= WAVE_INTERVAL_DURATION_MS) {
      return startNextWave(state);
    }
    return { ...state, waveTimerMs: nextWaveTimerMs };
  }
  
  if (state.waveState === 'active') {
    const currentWave = state.waves[state.currentWaveIndex];
    if (!currentWave) {
      return {
        ...state,
        waveState: 'complete',
        currentWaveIndex: state.waves.length,
        waveTimerMs: nextWaveTimerMs,
      };
    }
    
    const waveSpawnQueue = state.spawnQueue.filter(event => 
      event.id.startsWith(`wave-${currentWave.waveIndex}-`)
    );
    const waveZombiesAlive = state.zombies.length > 0;
    
    if (waveSpawnQueue.length === 0 && !waveZombiesAlive) {
      if (currentWave.waveType === 'final') {
        return {
          ...state,
          waveState: 'complete',
          waveTimerMs: nextWaveTimerMs,
        };
      }
      return {
        ...state,
        waveState: 'interval',
        waveTimerMs: 0,
      };
    }
    
    return { ...state, waveTimerMs: nextWaveTimerMs };
  }
  
  return state;
}

export function tickPvZBoard(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  if (state.phase !== 'playing' || state.status !== 'playing') return state;
  if (state.isPaused) return state;
  const adjustedElapsedMs = elapsedMs * state.gameSpeed;
  const nextElapsedMs = state.elapsedMs + adjustedElapsedMs;
  const segmentDurationMs = Math.max(1_000, state.scenarioSegmentDurationMs);
  const sunDrainMs = (state.scenarioSunDrainPerSecond / 1000) * adjustedElapsedMs;
  const drainedSun = Math.max(0, state.sun - sunDrainMs);

  const elapsedState = {
    ...state,
    elapsedMs: nextElapsedMs,
    waveProgress: Math.min(1, nextElapsedMs / segmentDurationMs),
    cardCooldownsMs: tickCooldowns(state, adjustedElapsedMs),
    sun: drainedSun,
  };

  const spawnedState = spawnQueuedZombies(elapsedState);
  const { nextPlants, gainedSun } = applyPlantEconomy(spawnedState, adjustedElapsedMs);
  const attackState = applyPlantAttacks({ ...spawnedState, plants: nextPlants }, adjustedElapsedMs);
  const projectileState = moveProjectiles({
    ...spawnedState,
    plants: attackState.nextPlants,
    zombies: attackState.nextZombies,
    projectiles: [...spawnedState.projectiles, ...attackState.createdProjectiles],
  }, adjustedElapsedMs);

  const preMoveState = {
    ...spawnedState,
    plants: attackState.nextPlants,
    zombies: projectileState.nextZombies,
    projectiles: projectileState.remainingProjectiles,
    sun: spawnedState.sun + gainedSun,
  };
  const movedState = moveZombies(preMoveState, adjustedElapsedMs);
  const mowerTriggerState = resolveLawnMowerTriggersAndBreaches(movedState);

  if (mowerTriggerState.status === 'lost') return mowerTriggerState;

  const zombieAttackState = applyZombieAttacks({
    ...mowerTriggerState,
    plants: preMoveState.plants,
    zombies: mowerTriggerState.zombies,
  }, adjustedElapsedMs);
  const plantsState = {
    ...mowerTriggerState,
    plants: zombieAttackState.nextPlants,
    zombies: zombieAttackState.nextZombies,
  };

  const mowerState = moveLawnMower(plantsState, adjustedElapsedMs);
  const skyDropState = updateSkyDrops(mowerState, adjustedElapsedMs);

  let finalState = { ...skyDropState, plants: plantsState.plants };

  if (finalState.elapsedMs % 8000 < adjustedElapsedMs) {
    finalState = spawnSkySun(finalState);
  }

  if (
    finalState.mode === 'survival'
    && finalState.elapsedMs >= finalState.scenarioSegmentDurationMs
    && finalState.scenarioSegmentIndex < finalState.scenarioSegmentsTotal
  ) {
    finalState = startNextSurvivalSegment(finalState);
  }

  finalState = processWaves(finalState, adjustedElapsedMs);

  const allWavesComplete = finalState.waves.length > 0 && finalState.waveState === 'complete';
  const allZombiesDead = finalState.zombies.length === 0 && finalState.spawnQueue.length === 0;
  if (allWavesComplete && allZombiesDead) {
    return { ...finalState, status: 'won', phase: 'won' };
  }

  return finalState;
}

// 切换铲子模式
export function toggleShovelMode(state: PvZBoardState): PvZBoardState {
  if (state.phase !== 'playing') return state;
  return {
    ...state,
    shovelMode: !state.shovelMode,
    selectedPlantId: state.shovelMode ? state.selectedPlantId : null,
  };
}

// 使用铲子移除植物，返还 50% 阳光成本
export function removePlantWithShovel(state: PvZBoardState, row: number, col: number): PvZBoardState {
  if (state.phase !== 'playing') return state;
  if (!state.shovelMode) return state;

  const plantIndex = state.plants.findIndex((plant) => plant.row === row && plant.col === col);
  if (plantIndex === -1) return state;

  const plant = state.plants[plantIndex];
  const definition = PVZ_PLANT_MAP[plant.plantId];
  const refundSun = Math.floor(definition.cost * 0.5);

  const newState = {
    ...state,
    plants: state.plants.filter((_, index) => index !== plantIndex),
    sun: state.sun + refundSun,
    shovelMode: false,
  };

  return updateFogVisibility(newState);
}
