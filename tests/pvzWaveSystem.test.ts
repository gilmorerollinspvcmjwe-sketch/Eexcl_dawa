import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  tickPvZBoard,
  spawnZombieNow,
  type PvZBoardState,
  type PvZWaveConfig,
} from '../src/features/pvz/pvzBoardState.ts';

test('波次系统初始状态为 idle', () => {
  const state = createPvZBoardState();
  assert.equal(state.waveState, 'idle');
  assert.equal(state.currentWaveIndex, 0);
  assert.equal(state.waveTimerMs, 0);
});

test('波次在开局 2 秒后开始第一波', () => {
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
  assert.equal(after2s.currentWaveIndex, 1);
});

test('大波次完成后进入 interval 状态', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    elapsedMs: 3000,
    waves: [
      { waveIndex: 0, waveType: 'large', zombieCount: 5, zombieTypes: ['normal'], spawnIntervalMs: 300, preWaveDelayMs: 0 },
      { waveIndex: 1, waveType: 'small', zombieCount: 2, zombieTypes: ['normal'], spawnIntervalMs: 500, preWaveDelayMs: 0 },
    ],
    waveState: 'active',
    currentWaveIndex: 1,
    spawnQueue: [],
    zombies: [],
  };
  
  const next = tickPvZBoard(state, 100);
  assert.equal(next.waveState, 'interval');
  assert.equal(next.waveTimerMs, 0);
});

test('波次间隔约 3-5 秒后进入下一波', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    elapsedMs: 5000,
    waves: [
      { waveIndex: 0, waveType: 'small', zombieCount: 1, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
      { waveIndex: 1, waveType: 'small', zombieCount: 2, zombieTypes: ['normal'], spawnIntervalMs: 100, preWaveDelayMs: 0 },
    ],
    waveState: 'interval',
    currentWaveIndex: 1,
    waveTimerMs: 0,
    spawnQueue: [],
    zombies: [],
  };
  
  const after3s = tickPvZBoard(state, 3000);
  assert.equal(after3s.waveState, 'active');
  assert.equal(after3s.currentWaveIndex, 2);
});

test('最终波次完成后进入 complete 状态', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    elapsedMs: 10000,
    waves: [
      { waveIndex: 0, waveType: 'final', zombieCount: 10, zombieTypes: ['normal'], spawnIntervalMs: 200, preWaveDelayMs: 0 },
    ],
    waveState: 'active',
    currentWaveIndex: 1,
    spawnQueue: [],
    zombies: [],
  };
  
  const next = tickPvZBoard(state, 100);
  assert.equal(next.waveState, 'complete');
});

test('所有波次完成且僵尸清空后判定胜利', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    elapsedMs: 15000,
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

test('波次僵尸按配置生成到刷怪队列', () => {
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
    elapsedMs: 2500,
    waves: [wave],
    waveState: 'idle',
    currentWaveIndex: 0,
  };
  
  const afterWaveStart = tickPvZBoard(state, 500);
  assert.ok(afterWaveStart.spawnQueue.length >= 5);
  assert.ok(afterWaveStart.spawnQueue.some(e => e.zombieId === 'normal' || e.zombieId === 'conehead'));
});

test('波次进度随时间推进', () => {
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