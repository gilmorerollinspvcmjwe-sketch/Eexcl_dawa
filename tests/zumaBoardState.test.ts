import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createZumaBoardState,
  createZumaBoardStateFromLevel,
  fireCannon,
  getZumaObjectiveProgress,
  resetZumaGame,
  rotateCannonToTarget,
  sampleTrackAtDistance,
  createZumaSetupBoardState,
  startZumaGame,
  tickZumaBoard,
} from '../src/features/zuma/zumaBoardState.ts';
import {
  getAllTrackIds,
  getLevelDefinition,
  getTrackDefinition,
} from '../src/features/zuma/zumaLevelCatalog.ts';
import {
  createZumaPracticeBoardState,
  getZumaPracticeConfig,
  resolveZumaPracticeId,
} from '../src/features/zuma/zumaPracticeConfigs.ts';
import type { ZumaBoardState, ZumaFlyingBall, ZumaObjectiveDefinition } from '../src/features/zuma/zumaTypes.ts';
import { ZUMA_BALL_SPACING, ZUMA_POWERUP_EFFECTS } from '../src/features/zuma/zumaTypes.ts';

function withMockedMathRandom<T>(values: number[], run: () => T): T {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)] ?? 0;
  try {
    return run();
  } finally {
    Math.random = originalRandom;
  }
}

function withChainHeadDistance(state: ZumaBoardState, headDistance: number): ZumaBoardState {
  const chain = state.chains[0];
  const balls = chain.balls.map((ball, index) => ({
    ...ball,
    distanceAlongTrack: headDistance - index * ZUMA_BALL_SPACING,
  }));
  return {
    ...state,
    chains: [
      {
        ...chain,
        balls,
        headDistance: balls[0]?.distanceAlongTrack ?? 0,
        tailDistance: balls[balls.length - 1]?.distanceAlongTrack ?? 0,
      },
    ],
  };
}

function withStationaryPowerupBall(state: ZumaBoardState, distanceAlongTrack: number, powerupType: 'slow'): ZumaBoardState {
  const position = sampleTrackAtDistance(state.trackDefinition, distanceAlongTrack);
  const flyingBall: ZumaFlyingBall = {
    ballId: 'test-powerup-ball',
    color: powerupType,
    startX: position.x,
    startY: position.y,
    currentX: position.x,
    currentY: position.y,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    isPowerup: true,
    powerupType,
  };

  return {
    ...state,
    flyingBalls: [flyingBall],
  };
}

test('球链会朝终点推进并在越过失败线后判负', () => {
  let state = createZumaBoardState({
    trackId: 'track-long-straight-01',
    initialBallCount: 3,
    spawnScript: [],
  });
  state = startZumaGame(state);

  const advanced = tickZumaBoard(state, 1000);
  assert.ok(advanced.chains[0].headDistance > state.chains[0].headDistance);

  const nearFinish = withChainHeadDistance(advanced, advanced.trackDefinition.finishLineDistance - 1);
  const lost = tickZumaBoard(nearFinish, 100);
  assert.equal(lost.phase, 'lost');
  assert.equal(lost.status, 'lost');
});

test('reset 会恢复原始脚本而不是复用剩余 spawnQueue', () => {
  const originalSpawnScript = [
    { eventId: 'spawn-a', color: 'red' as const, count: 2, spawnAtMs: 0 },
    { eventId: 'spawn-b', color: 'blue' as const, count: 2, spawnAtMs: 2000 },
  ];

  let state = createZumaBoardState({
    trackId: 'track-simple-01',
    initialBallCount: 3,
    spawnScript: originalSpawnScript,
  });
  state = startZumaGame(state);
  const progressed = tickZumaBoard(state, 100);

  assert.equal(progressed.spawnQueue.length, 1);

  const reset = resetZumaGame(progressed);
  assert.deepEqual(
    reset.spawnQueue.map((event) => event.eventId),
    originalSpawnScript.map((event) => event.eventId),
  );
});

test('发射后补球会继续使用关卡配置里的道具池', () => {
  const state = withMockedMathRandom([0, 0, 0, 0, 0, 0], () => {
    const created = createZumaBoardState({
      trackId: 'track-simple-01',
      initialBallCount: 3,
      spawnScript: [],
      powerupPool: ['slow'],
      powerupSpawnChance: 1,
    });
    return startZumaGame(created);
  });

  const fired = withMockedMathRandom([0, 0, 0, 0], () => fireCannon(state));
  assert.equal(fired.cannon.nextBall, 'slow');
});

test('计时模式时间结束时按关卡定义判定为胜利', () => {
  const level = getLevelDefinition('zuma-timed-3min-track-simple-01');
  assert.ok(level);

  let state = createZumaBoardState({
    levelId: level!.levelId,
    mode: level!.mode,
    trackId: level!.trackId,
    colorPool: level!.colorPool,
    powerupPool: level!.powerupPool,
    powerupSpawnChance: level!.powerupSpawnChance,
    baseSpeed: level!.baseSpeed,
    timeLimitMs: 100,
    spawnScript: [],
    initialBallCount: 3,
    winCondition: level!.winCondition,
    lossCondition: level!.lossCondition,
  });
  state = startZumaGame(state);

  const finished = tickZumaBoard(state, 150);
  assert.equal(finished.phase, 'won');
  assert.equal(finished.status, 'won');
});

test('练习配置会真正落到状态层', () => {
  const config = getZumaPracticeConfig('danger-rescue');
  assert.ok(config);

  const state = createZumaPracticeBoardState('danger-rescue');
  assert.equal(state.trackId, config!.trackId);
  assert.deepEqual(state.colorPool, config!.colorPool);
  assert.equal(state.chains[0].balls.length, config!.initialBalls);
  assert.ok(state.chains[0].headDistance > state.trackDefinition.finishLineDistance - 120);
});

test('所有祖玛轨道都保持在棋盘可玩边界内', () => {
  for (const trackId of getAllTrackIds()) {
    const track = getTrackDefinition(trackId);
    assert.ok(track, `missing track ${trackId}`);
    for (const point of track!.points) {
      assert.ok(point.x >= 0 && point.x <= 900, `${trackId} x out of bounds: ${point.x}`);
      assert.ok(point.y >= 0 && point.y <= 400, `${trackId} y out of bounds: ${point.y}`);
    }
  }
});

test('慢速道具会临时减速并在结束后恢复基础速度，同时统计一次道具使用', () => {
  let base = createZumaBoardState({
    trackId: 'track-long-straight-01',
    initialBallCount: 3,
    spawnScript: [],
    baseSpeed: 2,
  });
  base = startZumaGame(base);
  base = withChainHeadDistance(base, 80);

  const normalAdvanced = tickZumaBoard(base, 1000);
  const normalDelta = normalAdvanced.chains[0].headDistance - base.chains[0].headDistance;

  const slowTriggered = tickZumaBoard(withStationaryPowerupBall(base, 80, 'slow'), 16);
  assert.equal(slowTriggered.score.powerupsUsed, 1);

  const slowed = tickZumaBoard(slowTriggered, 1000);
  const slowedDelta = slowed.chains[0].headDistance - slowTriggered.chains[0].headDistance;
  assert.ok(slowedDelta < normalDelta);

  const recoveredBase = tickZumaBoard(slowed, ZUMA_POWERUP_EFFECTS.slow.durationMs);
  const recovered = tickZumaBoard(recoveredBase, 1000);
  const recoveredDelta = recovered.chains[0].headDistance - recoveredBase.chains[0].headDistance;
  assert.ok(recoveredDelta >= normalDelta - 0.001);
});

test('多目标关卡只有全部目标达成才会胜利', () => {
  const objectives: ZumaObjectiveDefinition[] = [
    { type: 'clearAll', targetValue: 0 },
    { type: 'minChainCount', targetValue: 2 },
  ];

  const base = startZumaGame(createZumaBoardState({
    trackId: 'track-simple-01',
    initialBallCount: 3,
    spawnScript: [],
    winCondition: {
      type: 'multiObjective',
      targetValue: 0,
      objectives,
    },
  }));

  const incomplete = tickZumaBoard({
    ...base,
    chains: [],
    spawnQueue: [],
    score: {
      ...base.score,
      chainComboCount: 1,
    },
  }, 16);
  assert.equal(incomplete.phase, 'playing');

  const completed = tickZumaBoard({
    ...base,
    chains: [],
    spawnQueue: [],
    score: {
      ...base.score,
      chainComboCount: 2,
    },
  }, 16);
  assert.equal(completed.phase, 'won');
});

test('限弹目标会在最后一发失效后判负', () => {
  let state = createZumaBoardState({
    trackId: 'track-long-straight-01',
    initialBallCount: 3,
    spawnScript: [],
    shotLimit: 1,
    winCondition: {
      type: 'multiObjective',
      targetValue: 0,
      objectives: [
        { type: 'clearAll', targetValue: 0 },
        { type: 'maxShots', targetValue: 1 },
      ],
    },
  });
  state = startZumaGame(state);
  state = rotateCannonToTarget(state, -100, state.cannon.y);

  const fired = fireCannon(state);
  assert.equal(fired.shotsRemaining, 0);

  const lost = tickZumaBoard(fired, 5000);
  assert.equal(lost.phase, 'lost');
});

test('按关卡定义建盘会带上目标与时长配置', () => {
  const chainLevel = getLevelDefinition('zuma-adventure-015');
  assert.ok(chainLevel);

  const chainState = createZumaBoardStateFromLevel(chainLevel!);
  const chainObjectives = getZumaObjectiveProgress(chainState);
  assert.equal(chainState.levelId, chainLevel!.levelId);
  assert.equal(chainObjectives.some((objective) => objective.type === 'minChainCount'), true);

  const timedLevel = getLevelDefinition('zuma-timed-3min-track-simple-01');
  assert.ok(timedLevel);

  const timedState = createZumaBoardStateFromLevel(timedLevel!);
  assert.equal(timedState.mode, 'timed');
  assert.equal(timedState.timeLimitMs, timedLevel!.timeLimitMs);
});

test('切模式占位状态与推荐练习映射会落到真实模块', () => {
  const setupState = createZumaSetupBoardState('timed');
  assert.equal(setupState.phase, 'setup');
  assert.equal(setupState.mode, 'timed');

  assert.equal(resolveZumaPracticeId('danger-awareness'), 'danger-rescue');
  assert.equal(resolveZumaPracticeId('powerup-advanced'), 'powerup-basic');
});

test('无尽模式在清空当前波后会推进到下一波并重新装填脚本', () => {
  const endlessLevel = getLevelDefinition('zuma-endless-001');
  assert.ok(endlessLevel);

  const started = startZumaGame(createZumaBoardStateFromLevel(endlessLevel!));
  const clearedWaveState = {
    ...started,
    chains: [],
    spawnQueue: [],
  } as ZumaBoardState & { currentWave?: number };

  const nextWave = tickZumaBoard(clearedWaveState, 16) as ZumaBoardState & { currentWave?: number };
  assert.equal(nextWave.currentWave, 2);
  assert.ok(nextWave.spawnQueue.length > 0);
});
