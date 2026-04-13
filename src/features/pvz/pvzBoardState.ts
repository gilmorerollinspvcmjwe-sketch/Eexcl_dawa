import { PVZ_PLANT_MAP } from './pvzPlantRegistry.ts';
import { PVZ_ZOMBIE_MAP } from './pvzZombieRegistry.ts';
import { DEFAULT_PVZ_CHAPTER_ID, getPvZChapterById } from './pvzChapters.ts';
import { getDefaultPvZScenarioIdForChapter, getPvZScenarioById } from './pvzScenarioCatalog.ts';
import type {
  PvZBoardState,
  PvZChapterId,
  PvZLevelDefinition,
  PvZMode,
  PvZPlantId,
  PvZPlantInstance,
  PvZProjectile,
  PvZProjectileKind,
  PvZScenarioId,
  PvZSpawnEvent,
  PvZZombieId,
} from './pvzTypes.ts';

const ROWS = 5;
const COLS = 9;
const CARD_LIMIT = 6;

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

function createProjectile(kind: PvZProjectileKind, row: number, x: number, damage: number): PvZProjectile {
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
  };
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
  const availablePlants = levelMeta.availablePlants && levelMeta.availablePlants.length > 0
    ? [...levelMeta.availablePlants]
    : [...defaultCards];
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
    selectedCards: [...defaultCards],
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
    cardCooldownsMs: {},
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
  if (state.plants.some((plant) => plant.row === row && plant.col === col)) return state;
  if ((state.cardCooldownsMs[plantId] || 0) > 0) return state;

  return {
    ...state,
    sun: state.sun - definition.cost,
    plants: [...state.plants, createPlantInstance(plantId, row, col)],
    cardCooldownsMs: {
      ...state.cardCooldownsMs,
      [plantId]: definition.cooldownMs,
    },
  };
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
        createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6 + index * 0.15, definition.damage));
      }
    } else {
      zombieDamage.set(zombieAhead.instanceId, (zombieDamage.get(zombieAhead.instanceId) || 0) + definition.damage);
    }

    return { ...plant, attackTimerMs: 0 };
  });

  const nextZombies = state.zombies
    .map((zombie) => ({ ...zombie, hp: zombie.hp - (zombieDamage.get(zombie.instanceId) || 0) }))
    .filter((zombie) => zombie.hp > 0);

  return { nextPlants, nextZombies, createdProjectiles };
}

function moveProjectiles(state: PvZBoardState, elapsedMs: number) {
  const zombieDamage = new Map<string, number>();
  const remainingProjectiles: PvZProjectile[] = [];

  for (const projectile of state.projectiles) {
    const nextX = projectile.x + projectile.speed * elapsedMs;
    const target = state.zombies.find((zombie) => zombie.row === projectile.row && zombie.x <= nextX + 0.3 && zombie.x >= nextX - 0.2);
    if (target) {
      zombieDamage.set(target.instanceId, (zombieDamage.get(target.instanceId) || 0) + projectile.damage);
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

function moveZombies(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  const nextZombies = state.zombies.map((zombie) => {
    const definition = PVZ_ZOMBIE_MAP[zombie.zombieId];
    const blocker = state.plants.find((plant) => plant.row === zombie.row && Math.abs(zombie.x - plant.col) < 0.45);
    if (blocker) {
      return zombie;
    }
    return { ...zombie, x: zombie.x - definition.speed * elapsedMs };
  });

  const breached = nextZombies.some((zombie) => zombie.x < 0);
  return {
    ...state,
    zombies: nextZombies,
    status: breached ? 'lost' : state.status,
    phase: breached ? 'lost' : state.phase,
  };
}

export function tickPvZBoard(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  if (state.phase !== 'playing' || state.status !== 'playing') return state;
  const nextElapsedMs = state.elapsedMs + elapsedMs;
  const segmentDurationMs = Math.max(1_000, state.scenarioSegmentDurationMs);
  const sunDrainMs = (state.scenarioSunDrainPerSecond / 1000) * elapsedMs;
  const drainedSun = Math.max(0, state.sun - sunDrainMs);

  const elapsedState = {
    ...state,
    elapsedMs: nextElapsedMs,
    waveProgress: Math.min(1, nextElapsedMs / segmentDurationMs),
    cardCooldownsMs: tickCooldowns(state, elapsedMs),
    sun: drainedSun,
  };

  const spawnedState = spawnQueuedZombies(elapsedState);
  const { nextPlants, gainedSun } = applyPlantEconomy(spawnedState, elapsedMs);
  const attackState = applyPlantAttacks({ ...spawnedState, plants: nextPlants }, elapsedMs);
  const projectileState = moveProjectiles({
    ...spawnedState,
    plants: attackState.nextPlants,
    zombies: attackState.nextZombies,
    projectiles: [...spawnedState.projectiles, ...attackState.createdProjectiles],
  }, elapsedMs);
  const movedState = moveZombies({
    ...spawnedState,
    plants: attackState.nextPlants,
    zombies: projectileState.nextZombies,
    projectiles: projectileState.remainingProjectiles,
    sun: spawnedState.sun + gainedSun,
  }, elapsedMs);

  if (movedState.status === 'lost') return movedState;
  const waveComplete = movedState.spawnQueue.length === 0 && movedState.zombies.length === 0 && movedState.elapsedMs >= segmentDurationMs;
  if (waveComplete && movedState.mode === 'survival' && movedState.scenarioSegmentIndex < movedState.scenarioSegmentsTotal) {
    return startNextSurvivalSegment(movedState);
  }
  if (waveComplete) {
    return { ...movedState, status: 'won', phase: 'won' };
  }

  return movedState;
}
