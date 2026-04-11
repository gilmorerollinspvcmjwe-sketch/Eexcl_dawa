import test from 'node:test';
import assert from 'node:assert/strict';
import { createPvZBoardState, placePlant, selectPvZCard, spawnZombieNow, startPvZBattle, tickPvZBoard } from '../src/features/pvz/pvzBoardState.ts';
import { PVZ_PLANTS } from '../src/features/pvz/pvzPlantRegistry.ts';
import { PVZ_ZOMBIES } from '../src/features/pvz/pvzZombieRegistry.ts';

test('placing a plant deducts sun', () => {
  let state = createPvZBoardState();
  state = startPvZBattle(state);
  const next = placePlant(state, 'sunflower', 0, 0);

  assert.equal(next.sun, state.sun - 50);
  assert.equal(next.plants.length, 1);
});

test('cannot place a plant with insufficient sun', () => {
  const state = { ...startPvZBattle(createPvZBoardState()), sun: 0 };
  const next = placePlant(state, 'peashooter', 0, 0);

  assert.equal(next.sun, 0);
  assert.equal(next.plants.length, 0);
});

test('lane breach marks defeat', () => {
  const spawned = spawnZombieNow(startPvZBattle(createPvZBoardState()), 'normal', 0, -0.2);
  const next = tickPvZBoard(spawned, 16);

  assert.equal(next.status, 'lost');
});

test('wave progress advances over time', () => {
  const next = tickPvZBoard(startPvZBattle(createPvZBoardState()), 5000);
  assert.ok(next.elapsedMs >= 5000);
  assert.ok(next.waveProgress > 0);
});

test('peashooter creates a straight projectile when a zombie is ahead', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'peashooter', 0, 0);
  state = spawnZombieNow(state, 'normal', 0, 7);

  const next = tickPvZBoard(state, 1600);

  assert.ok(next.projectiles.some((projectile) => projectile.kind === 'pea'));
});

test('repeater creates a double projectile burst', () => {
  let state = startPvZBattle(createPvZBoardState());
  state.sun = 300;
  state = placePlant(state, 'repeater', 1, 1);
  state = spawnZombieNow(state, 'normal', 1, 7);

  const next = tickPvZBoard(state, 1600);

  assert.ok(next.projectiles.filter((projectile) => projectile.kind === 'double-pea').length >= 2);
});

test('card pick phase starts before battle and can choose a loadout', () => {
  let state = createPvZBoardState();

  assert.equal(state.phase, 'setup');
  state = selectPvZCard(state, 'sunflower');
  state = selectPvZCard(state, 'peashooter');

  assert.deepEqual(state.selectedCards.slice(0, 2), ['sunflower', 'peashooter']);
});

test('placing plants is blocked before battle starts', () => {
  const next = placePlant(createPvZBoardState(), 'sunflower', 0, 0);
  assert.equal(next.plants.length, 0);
});

test('pvz roster is expanded beyond the initial basic set', () => {
  assert.ok(PVZ_PLANTS.length >= 12);
  assert.ok(PVZ_ZOMBIES.length >= 8);
});

test('starting battle keeps selected cards and unlocks gameplay', () => {
  let state = createPvZBoardState();
  state = selectPvZCard(state, 'sunflower');
  state = selectPvZCard(state, 'peashooter');
  state = startPvZBattle(state);

  assert.equal(state.phase, 'playing');
  assert.deepEqual(state.selectedCards.slice(0, 2), ['sunflower', 'peashooter']);
});
