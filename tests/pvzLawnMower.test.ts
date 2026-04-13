import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  spawnZombieNow,
  tickPvZBoard,
  type PvZBoardState,
} from '../src/features/pvz/pvzBoardState.ts';

test('小推车初始状态为激活未触发', () => {
  const state = createPvZBoardState();
  
  assert.equal(state.lawnMowers.length, 5);
  assert.ok(state.lawnMowers.every(active => active === true));
  assert.ok(state.lawnMowerStates.every(m => m.active === true && m.triggered === false));
});

test('僵尸到达左侧触发小推车', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  
  const afterTick = tickPvZBoard(state, 16);
  const mower = afterTick.lawnMowerStates[0];
  
  assert.ok(mower.triggered);
});

test('小推车触发后向右移动', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  
  const afterTrigger = tickPvZBoard(state, 16);
  const mowerBefore = afterTrigger.lawnMowerStates[0];
  
  const afterMove = tickPvZBoard(afterTrigger, 500);
  const mowerAfter = afterMove.lawnMowerStates[0];
  
  assert.ok(mowerAfter.x > mowerBefore.x);
});

test('小推车清除沿途僵尸', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'conehead', 0, 2);
  state = spawnZombieNow(state, 'buckethead', 0, 5);
  
  const afterTrigger = tickPvZBoard(state, 16);
  assert.ok(afterTrigger.lawnMowerStates[0].triggered);
  
  const afterMove = tickPvZBoard(afterTrigger, 3000);
  const zombiesInRow0 = afterMove.zombies.filter(z => z.row === 0);
  
  assert.equal(zombiesInRow0.length, 0);
});

test('小推车到达右侧后消失', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  
  const afterTrigger = tickPvZBoard(state, 16);
  
  const afterComplete = tickPvZBoard(afterTrigger, 4000);
  const mower = afterComplete.lawnMowerStates[0];
  
  assert.equal(mower.active, false);
});

test('每行只有一辆小推车', () => {
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

test('小推车触发后该行后续僵尸直接判定失败', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  
  const afterTrigger = tickPvZBoard(state, 16);
  const afterMove = tickPvZBoard(afterTrigger, 4000);
  
  assert.equal(afterMove.lawnMowerStates[0].active, false);
  
  const withNewZombie = spawnZombieNow(afterMove, 'normal', 0, 0.3);
  const afterBreach = tickPvZBoard(withNewZombie, 16);
  
  assert.equal(afterBreach.status, 'lost');
});

test('不同行的小推车独立触发', () => {
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

test('小推车触发不影响其他行僵尸', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = spawnZombieNow(state, 'normal', 0, 0.3);
  state = spawnZombieNow(state, 'normal', 1, 5);
  
  const afterTrigger = tickPvZBoard(state, 16);
  const afterMove = tickPvZBoard(afterTrigger, 3000);
  
  const zombiesInRow0 = afterMove.zombies.filter(z => z.row === 0);
  const zombiesInRow1 = afterMove.zombies.filter(z => z.row === 1);
  
  assert.equal(zombiesInRow0.length, 0);
  assert.ok(zombiesInRow1.length > 0);
});