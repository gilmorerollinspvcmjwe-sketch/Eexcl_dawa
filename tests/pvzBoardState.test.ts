import test from 'node:test';
import assert from 'node:assert/strict';
import { createPvZBoardState, placePlant, spawnZombieNow, tickPvZBoard } from '../src/features/pvz/pvzBoardState.ts';

test('placing a plant deducts sun', () => {
  const state = createPvZBoardState();
  const next = placePlant(state, 'sunflower', 0, 0);

  assert.equal(next.sun, state.sun - 50);
  assert.equal(next.plants.length, 1);
});

test('cannot place a plant with insufficient sun', () => {
  const state = { ...createPvZBoardState(), sun: 0 };
  const next = placePlant(state, 'peashooter', 0, 0);

  assert.equal(next.sun, 0);
  assert.equal(next.plants.length, 0);
});

test('lane breach marks defeat', () => {
  const spawned = spawnZombieNow(createPvZBoardState(), 'normal', 0, -0.2);
  const next = tickPvZBoard(spawned, 16);

  assert.equal(next.status, 'lost');
});

test('wave progress advances over time', () => {
  const next = tickPvZBoard(createPvZBoardState(), 5000);
  assert.ok(next.elapsedMs >= 5000);
  assert.ok(next.waveProgress > 0);
});

