import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  placePlant,
  spawnZombieNow,
  tickPvZBoard,
} from '../src/features/pvz/pvzBoardState.ts';
import { PVZ_PLANT_MAP } from '../src/features/pvz/pvzPlantRegistry.ts';

function createCombatStateWithWallnut() {
  let state = startPvZBattle(createPvZBoardState({ scenarioId: '2-01' }));
  state = {
    ...state,
    sun: 2000,
    selectedCards: Array.from(new Set([...state.selectedCards, 'wallnut'])),
  };
  return state;
}

test('zombie starts attacking when close to a plant', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const afterTick = tickPvZBoard(state, 100);
  const zombie = afterTick.zombies.find((item) => item.row === 0);

  assert.ok(zombie?.isAttacking);
});

test('zombie attack continuously reduces plant hp', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const plantBefore = state.plants.find((plant) => plant.row === 0 && plant.col === 4);
  const hpBefore = plantBefore?.hp ?? 0;

  const after1s = tickPvZBoard(state, 1000);
  const plantAfter = after1s.plants.find((plant) => plant.row === 0 && plant.col === 4);

  assert.ok((plantAfter?.hp ?? 0) < hpBefore);
});

test('plant is flagged as attacked while being eaten', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const afterTick = tickPvZBoard(state, 100);
  const plant = afterTick.plants.find((item) => item.row === 0 && item.col === 4);

  assert.ok(plant?.isBeingAttacked);
});

test('plant disappears when hp reaches zero', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const wallnutDef = PVZ_PLANT_MAP.wallnut;
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;

  const afterKill = tickPvZBoard(state, timeToKill);
  const plant = afterKill.plants.find((item) => item.row === 0 && item.col === 4);

  assert.equal(plant, undefined);
});

test('zombie resumes moving after plant dies', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const wallnutDef = PVZ_PLANT_MAP.wallnut;
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;

  const afterKill = tickPvZBoard(state, timeToKill);
  const afterResume = tickPvZBoard(afterKill, 1000);
  const zombie = afterResume.zombies.find((item) => item.row === 0);

  assert.ok(!zombie?.isAttacking);
  assert.ok((zombie?.x ?? 10) < 4.3);
});

test('multiple zombies can attack the same plant', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  state = spawnZombieNow(state, 'conehead', 0, 4.4);

  const afterTick = tickPvZBoard(state, 100);
  const attackingZombies = afterTick.zombies.filter((zombie) => zombie.isAttacking);

  assert.equal(attackingZombies.length, 2);
});

test('plant death clears zombie attack target', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const wallnutDef = PVZ_PLANT_MAP.wallnut;
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;

  const afterKill = tickPvZBoard(state, timeToKill);
  const zombie = afterKill.zombies.find((item) => item.row === 0);

  assert.equal(zombie?.isAttacking, false);
  assert.equal(zombie?.attackTargetId, undefined);
});

test('zombie stops moving while attacking', () => {
  let state = createCombatStateWithWallnut();
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);

  const after1s = tickPvZBoard(state, 1000);
  const zombie = after1s.zombies.find((item) => item.row === 0);

  assert.ok(zombie?.isAttacking);
  assert.ok(Math.abs((zombie?.x ?? 0) - 4.3) < 0.1);
});
