import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  tickPvZBoard,
  type PvZWaveConfig,
} from '../src/features/pvz/pvzBoardState.ts';

test('wave system starts as idle', () => {
  const state = createPvZBoardState();
  assert.equal(state.waveState, 'idle');
  assert.equal(state.currentWaveIndex, 0);
  assert.equal(state.waveTimerMs, 0);
});

test('first wave starts after 2 seconds', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'small', zombieCount: 3, zombieTypes: ['normal'], spawnIntervalMs: 500, preWaveDelayMs: 0 },
    ],
  };

  const after1s = tickPvZBoard(state, 1000);
  assert.equal(after1s.waveState, 'idle');

  const after2s = tickPvZBoard(state, 2000);
  assert.equal(after2s.waveState, 'active');
  assert.equal(after2s.currentWaveIndex, 0);
});

test('large wave completion enters interval state', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'large', zombieCount: 5, zombieTypes: ['normal'], spawnIntervalMs: 300, preWaveDelayMs: 0 },
      { waveIndex: 1, waveType: 'small', zombieCount: 2, zombieTypes: ['normal'], spawnIntervalMs: 500, preWaveDelayMs: 0 },
    ],
    waveState: 'active',
    currentWaveIndex: 0,
    spawnQueue: [],
    zombies: [],
  };

  const next = tickPvZBoard(state, 100);
  assert.equal(next.waveState, 'interval');
  assert.equal(next.waveTimerMs, 0);
});

test('interval transitions to next wave after 3 seconds', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'small', zombieCount: 1, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
      { waveIndex: 1, waveType: 'small', zombieCount: 2, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
    ],
    waveState: 'interval',
    currentWaveIndex: 0,
    waveTimerMs: 0,
    spawnQueue: [],
    zombies: [],
  };

  const after3s = tickPvZBoard(state, 3000);
  assert.equal(after3s.waveState, 'active');
  assert.equal(after3s.currentWaveIndex, 1);
});

test('final wave completion enters complete state', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'final', zombieCount: 10, zombieTypes: ['normal'], spawnIntervalMs: 200, preWaveDelayMs: 0 },
    ],
    waveState: 'active',
    currentWaveIndex: 0,
    spawnQueue: [],
    zombies: [],
  };

  const next = tickPvZBoard(state, 100);
  assert.equal(next.waveState, 'complete');
});

test('wins when all waves complete and board is clear', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'final', zombieCount: 1, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
    ],
    waveState: 'complete',
    currentWaveIndex: 1,
    spawnQueue: [],
    zombies: [],
  };

  const next = tickPvZBoard(state, 100);
  assert.equal(next.status, 'won');
  assert.equal(next.phase, 'won');
});

test('wave config generates queued zombies', () => {
  let state = startPvZBattle(createPvZBoardState());
  const wave: PvZWaveConfig = {
    waveIndex: 0,
    waveType: 'small',
    zombieCount: 5,
    zombieTypes: ['normal', 'conehead'],
    spawnIntervalMs: 400,
    preWaveDelayMs: 500,
  };

  state = {
    ...state,
    waves: [wave],
    waveState: 'idle',
    currentWaveIndex: 0,
    waveTimerMs: 1900,
  };

  const afterWaveStart = tickPvZBoard(state, 200);
  assert.ok(afterWaveStart.spawnQueue.length >= 5);
  assert.ok(afterWaveStart.spawnQueue.some((event) => event.id.startsWith('wave-0-')));
  assert.ok(afterWaveStart.spawnQueue.some((event) => event.zombieId === 'normal' || event.zombieId === 'conehead'));
});

test('wave progress advances over time', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    waves: [
      { waveIndex: 0, waveType: 'small', zombieCount: 1, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
    ],
  };

  const after5s = tickPvZBoard(state, 5000);
  assert.ok(after5s.elapsedMs >= 5000);
  assert.ok(after5s.waveProgress > 0);
});
