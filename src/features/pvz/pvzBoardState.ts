import { PVZ_PLANT_MAP } from './pvzPlantRegistry.ts';
import { PVZ_ZOMBIE_MAP } from './pvzZombieRegistry.ts';
import type { PvZBoardState, PvZPlantId, PvZPlantInstance, PvZSpawnEvent, PvZZombieId } from './pvzTypes.ts';

const ROWS = 5;
const COLS = 9;

function createSpawnQueue(): PvZSpawnEvent[] {
  return [
    { id: 'wave-1', zombieId: 'normal', row: 0, spawnAtMs: 2000 },
    { id: 'wave-2', zombieId: 'normal', row: 2, spawnAtMs: 5000 },
    { id: 'wave-3', zombieId: 'conehead', row: 4, spawnAtMs: 9000 },
    { id: 'wave-4', zombieId: 'flag', row: 1, spawnAtMs: 14000 },
    { id: 'wave-5', zombieId: 'normal', row: 3, spawnAtMs: 17000 },
    { id: 'wave-6', zombieId: 'buckethead', row: 2, spawnAtMs: 22000 },
    { id: 'wave-7', zombieId: 'conehead', row: 0, spawnAtMs: 26000 },
    { id: 'wave-8', zombieId: 'flag', row: 4, spawnAtMs: 30000 },
  ];
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

export function createPvZBoardState(): PvZBoardState {
  return {
    rows: ROWS,
    cols: COLS,
    sun: 150,
    status: 'playing',
    elapsedMs: 0,
    waveProgress: 0,
    selectedPlantId: null,
    plants: [],
    zombies: [],
    spawnQueue: createSpawnQueue(),
    lawnMowers: Array.from({ length: ROWS }, () => true),
    cardCooldownsMs: {},
  };
}

export function placePlant(state: PvZBoardState, plantId: PvZPlantId, row: number, col: number): PvZBoardState {
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
  const zombieDamage = new Map<string, number>();
  const nextPlants = state.plants.map((plant) => {
    const definition = PVZ_PLANT_MAP[plant.plantId];
    if (!definition.damage || !definition.attackIntervalMs) return plant;

    const zombieAhead = state.zombies.find((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
    if (!zombieAhead) return plant;

    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer < definition.attackIntervalMs) {
      return { ...plant, attackTimerMs: nextTimer };
    }

    zombieDamage.set(zombieAhead.instanceId, (zombieDamage.get(zombieAhead.instanceId) || 0) + definition.damage);
    return { ...plant, attackTimerMs: 0 };
  });

  const nextZombies = state.zombies
    .map((zombie) => ({ ...zombie, hp: zombie.hp - (zombieDamage.get(zombie.instanceId) || 0) }))
    .filter((zombie) => zombie.hp > 0);

  return { nextPlants, nextZombies };
}

function spawnQueuedZombies(state: PvZBoardState) {
  const ready = state.spawnQueue.filter((item) => item.spawnAtMs <= state.elapsedMs);
  const later = state.spawnQueue.filter((item) => item.spawnAtMs > state.elapsedMs);

  let nextState = { ...state, spawnQueue: later };
  for (const event of ready) {
    nextState = spawnZombieNow(nextState, event.zombieId, event.row);
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
  };
}

export function tickPvZBoard(state: PvZBoardState, elapsedMs: number): PvZBoardState {
  if (state.status !== 'playing') return state;

  const elapsedState = {
    ...state,
    elapsedMs: state.elapsedMs + elapsedMs,
    waveProgress: Math.min(1, (state.elapsedMs + elapsedMs) / 30000),
    cardCooldownsMs: tickCooldowns(state, elapsedMs),
  };

  const spawnedState = spawnQueuedZombies(elapsedState);
  const { nextPlants, gainedSun } = applyPlantEconomy(spawnedState, elapsedMs);
  const attackState = applyPlantAttacks({ ...spawnedState, plants: nextPlants }, elapsedMs);
  const movedState = moveZombies({ ...spawnedState, plants: attackState.nextPlants, zombies: attackState.nextZombies, sun: spawnedState.sun + gainedSun }, elapsedMs);

  if (movedState.status === 'lost') return movedState;
  if (movedState.spawnQueue.length === 0 && movedState.zombies.length === 0 && movedState.elapsedMs > 30000) {
    return { ...movedState, status: 'won' };
  }

  return movedState;
}
