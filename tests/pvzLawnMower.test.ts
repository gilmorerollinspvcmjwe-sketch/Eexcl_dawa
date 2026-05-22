import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  spawnZombieNow,
  tickPvZBoard,
} from '../src/features/pvz/pvzBoardState.ts';

test('lawn mowers start active and untriggered', () => {
  const state = createPvZBoardState();

  assert.equal(state.lawnMowers.length, 5);
  assert.ok(state.lawnMowers.every((active) => active === true));
  assert.ok(state.lawnMowerStates.every((mower) => mower.active === true && mower.triggered === false));
});

test('zombie near left side triggers mower', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);

  const afterTick = tickPvZBoard(state, 16);
  const mower = afterTick.lawnMowerStates[0];

  assert.ok(mower.triggered);
});

test('triggered mower moves to the right', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);

  const afterTrigger = tickPvZBoard(state, 16);
  const mowerBefore = afterTrigger.lawnMowerStates[0];

  const afterMove = tickPvZBoard(afterTrigger, 500);
  const mowerAfter = afterMove.lawnMowerStates[0];

  assert.ok(mowerAfter.x > mowerBefore.x);
});

test('mower clears zombies in its lane', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'conehead', 0, 2);
  state = spawnZombieNow(state, 'buckethead', 0, 5);

  const afterTrigger = tickPvZBoard(state, 16);
  assert.ok(afterTrigger.lawnMowerStates[0].triggered);

  const afterMove = tickPvZBoard(afterTrigger, 3000);
  const zombiesInRow0 = afterMove.zombies.filter((zombie) => zombie.row === 0);

  assert.equal(zombiesInRow0.length, 0);
});

test('mower disappears after crossing right side', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);

  const afterTrigger = tickPvZBoard(state, 16);
  const afterComplete = tickPvZBoard(afterTrigger, 4000);
  const mower = afterComplete.lawnMowerStates[0];

  assert.equal(mower.active, false);
});

test('each lane has only one mower lifecycle', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'normal', 0, 0.5);

  const afterTrigger = tickPvZBoard(state, 16);
  const mower = afterTrigger.lawnMowerStates[0];
  assert.ok(mower.triggered);

  const afterMove = tickPvZBoard(afterTrigger, 4000);
  const mowerAfter = afterMove.lawnMowerStates[0];
  assert.equal(mowerAfter.active, false);
});

test('lane without mower eventually loses on breach', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);

  const afterTrigger = tickPvZBoard(state, 16);
  const afterConsume = tickPvZBoard(afterTrigger, 4000);
  assert.equal(afterConsume.lawnMowerStates[0].active, false);

  const withNewZombie = spawnZombieNow(afterConsume, 'normal', 0, 0.3);
  const afterBreach = tickPvZBoard(withNewZombie, 20_000);
  assert.equal(afterBreach.status, 'lost');
});

test('different lanes trigger mowers independently', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'normal', 2, 0.3);

  const afterTrigger = tickPvZBoard(state, 16);

  assert.ok(afterTrigger.lawnMowerStates[0].triggered);
  assert.ok(afterTrigger.lawnMowerStates[2].triggered);
  assert.equal(afterTrigger.lawnMowerStates[1].triggered, false);
  assert.equal(afterTrigger.lawnMowerStates[3].triggered, false);
  assert.equal(afterTrigger.lawnMowerStates[4].triggered, false);
});

test('triggered mower does not clear zombies in other lanes', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'normal', 1, 5);

  const afterTrigger = tickPvZBoard(state, 16);
  const afterMove = tickPvZBoard(afterTrigger, 3000);

  const zombiesInRow0 = afterMove.zombies.filter((zombie) => zombie.row === 0);
  const zombiesInRow1 = afterMove.zombies.filter((zombie) => zombie.row === 1);

  assert.equal(zombiesInRow0.length, 0);
  assert.ok(zombiesInRow1.length > 0);
});
