import test from 'node:test';
import assert from 'node:assert/strict';
import type { FantasyLaneBattleResult } from '../src/features/fantasy_lane/fantasyLaneTypes.ts';
import {
  canUpgradeFantasyLaneUnit,
  getFantasyLaneChapterProgress,
  getFantasyLaneLevelStatus,
  getFantasyLaneProgressSummary,
  getFantasyLaneUnitBattleBonus,
  getFantasyLaneUnitUpgradeCost,
  getUnitFragmentCount,
  isFantasyLaneLevelUnlocked,
  loadFantasyLaneProgress,
  recordFantasyLaneLevelResult,
  recordFantasyLaneLevelStart,
  resetFantasyLaneProgress,
  upgradeFantasyLaneUnitWithFragments,
} from '../src/features/fantasy_lane/fantasyLaneProgressStorage.ts';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const WIN_RESULT: FantasyLaneBattleResult = {
  title: '战线推进成功',
  stars: 3,
  score: 9800,
  summary: '推进成功',
  tips: [],
};

test.beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  resetFantasyLaneProgress();
});

test('initial fantasy lane progress starts at chapter one with no completed levels', () => {
  const progress = loadFantasyLaneProgress();
  const summary = getFantasyLaneProgressSummary(progress);
  const chapterRecords = Reflect.get(progress, 'chapterRecords') as Record<string, Record<string, unknown>> | undefined;
  const battleTotals = Reflect.get(progress, 'battleTotals') as Record<string, unknown> | undefined;

  assert.deepEqual(progress.completedLevels, []);
  assert.equal(progress.highestUnlockedLevelId, '1-1');
  assert.equal(progress.highestChapterId, 'chapter-1');
  assert.equal(progress.lastPlayedLevelId, '1-1');
  assert.equal(summary.hasStarted, false);
  assert.equal(summary.completedLevels, 0);
  assert.equal(summary.totalLevels, 42);
  assert.equal(Object.keys(chapterRecords ?? {}).length, 7);
  assert.equal(chapterRecords?.['chapter-1']?.bossCleared, false);
  assert.equal(battleTotals?.totalRuns, 0);
  assert.equal(battleTotals?.bossRuns, 0);
});

test('recordFantasyLaneLevelStart tracks attempts and last played level', () => {
  const progress = recordFantasyLaneLevelStart('1-1', {
    runId: 'run-open-1',
    heroId: 'archmage',
    tacticalSkillId: 'freeze',
    loadoutUnitIds: ['goblin_shield', 'thunder_mage', 'griffin_knight'],
    runtimeSeed: 42,
    startedAt: 1000,
  });
  const summary = getFantasyLaneProgressSummary(progress);
  const activeRun = Reflect.get(progress, 'activeRun') as Record<string, unknown> | undefined;

  assert.equal(progress.levelRecords['1-1']?.attempts, 1);
  assert.equal(progress.levelRecords['1-1']?.completed, false);
  assert.equal(progress.lastPlayedLevelId, '1-1');
  assert.equal(summary.hasStarted, true);
  assert.equal(activeRun?.runId, 'run-open-1');
  assert.deepEqual(activeRun?.loadoutUnitIds, ['goblin_shield', 'thunder_mage', 'griffin_knight']);
});

test('unit star upgrades consume fragments and expose battle bonuses', () => {
  const initial = loadFantasyLaneProgress();
  const seeded = {
    ...initial,
    unlockedUnits: [...new Set([...initial.unlockedUnits, 'archer'])],
    unitFragments: {
      ...initial.unitFragments,
      archer: 5,
    },
  };

  assert.equal(getFantasyLaneUnitUpgradeCost(0), 3);
  assert.equal(canUpgradeFantasyLaneUnit(seeded, 'archer'), true);

  const upgraded = upgradeFantasyLaneUnitWithFragments('archer', seeded);
  const stored = loadFantasyLaneProgress();
  const bonus = getFantasyLaneUnitBattleBonus(upgraded.unitStars.archer ?? 0);

  assert.equal(upgraded.unitStars.archer, 1);
  assert.equal(getUnitFragmentCount(upgraded, 'archer'), 2);
  assert.equal(stored.unitStars.archer, 1);
  assert.equal(bonus.damageMultiplier, 1.05);
  assert.equal(bonus.healthMultiplier, 1.08);
  assert.equal(canUpgradeFantasyLaneUnit(upgraded, 'archer'), false);
});

test('recordFantasyLaneLevelResult stores completion, stars, and next unlock', () => {
  recordFantasyLaneLevelStart('1-1', {
    runId: 'run-clear-1',
    heroId: 'warlord',
    tacticalSkillId: 'fireball',
    loadoutUnitIds: ['goblin_shield', 'archer', 'flame_warlock'],
    runtimeSeed: 9,
    startedAt: 2000,
  });
  const progress = recordFantasyLaneLevelResult('1-1', WIN_RESULT, 86, {
    finishedAt: 66000,
    currentPhaseId: '1-1-final',
    runtimeStats: {
      summoned: 6,
      defeated: 11,
      queueBlocked: 2,
      projectilesFired: 4,
      aoeHits: 3,
      frontlineSummons: 4,
      antiAirSummons: 1,
      aoeSummons: 3,
      goldSpent: 214,
      goldCappedMs: 1400,
      congestionMs: 900,
      engagedUnits: 2,
      totalEngageDelayMs: 3500,
      heroSkillCast: 1,
      tacticalSkillCast: 1,
      lastSkillCastAtMs: 54000,
    },
    replay: {
      version: 'v1',
      seed: 9,
      checkpoints: [
        { atMs: 0, label: '开场读题', frontline: 0, airControl: 0 },
        { atMs: 18000, label: '中段对推', frontline: 4, airControl: 1 },
      ],
      events: [
        { atMs: 6000, type: 'warning', detail: '准备接第一波' },
        { atMs: 54000, type: 'skill', detail: '战术技能火球命中中线' },
      ],
    },
    debug: {
      warnings: ['尾段加压开始'],
      congestionPeak: 57,
      frontlineRange: { min: -6, max: 8 },
      bossPhaseIds: [],
    },
  });
  const summary = getFantasyLaneProgressSummary(progress);
  const levelRecord = progress.levelRecords['1-1'];
  const runtimeTotals = Reflect.get(progress, 'runtimeTotals') as Record<string, unknown> | undefined;
  const latestReplay = Reflect.get(levelRecord ?? {}, 'latestReplay') as Record<string, unknown> | undefined;
  const latestDebug = Reflect.get(levelRecord ?? {}, 'latestDebug') as Record<string, unknown> | undefined;
  const latestRun = Reflect.get(levelRecord ?? {}, 'latestRun') as Record<string, unknown> | undefined;
  const chapterRecords = Reflect.get(progress, 'chapterRecords') as Record<string, Record<string, unknown>> | undefined;
  const battleTotals = Reflect.get(progress, 'battleTotals') as Record<string, unknown> | undefined;

  assert.ok(progress.completedLevels.includes('1-1'));
  assert.equal(progress.levelRecords['1-1']?.completed, true);
  assert.equal(progress.levelRecords['1-1']?.bestStars, 3);
  assert.equal(progress.levelRecords['1-1']?.bestScore, 9800);
  assert.equal(progress.levelRecords['1-1']?.bestBaseHpPercent, 86);
  assert.equal(progress.highestUnlockedLevelId, '1-2');
  assert.equal(getFantasyLaneLevelStatus(progress, '1-1'), 'completed');
  assert.equal(getFantasyLaneLevelStatus(progress, '1-2'), 'unlocked');
  assert.equal(summary.completedLevels, 1);
  assert.equal(summary.totalStars, 3);
  assert.equal(summary.bestScore, 9800);
  assert.match(summary.lastPlayedLevelName, /^1-1 /);
  assert.equal(latestRun?.currentPhaseId, '1-1-final');
  assert.equal(latestReplay?.seed, 9);
  assert.equal((latestReplay?.events as unknown[] | undefined)?.length, 2);
  assert.equal(latestDebug?.congestionPeak, 57);
  assert.equal(runtimeTotals?.queueBlocked, 2);
  assert.equal(runtimeTotals?.projectilesFired, 4);
  assert.equal(runtimeTotals?.aoeSummons, 3);
  assert.equal(runtimeTotals?.goldSpent, 214);
  assert.equal(runtimeTotals?.engagedUnits, 2);
  assert.equal(runtimeTotals?.totalEngageDelayMs, 3500);
  assert.equal(runtimeTotals?.averageEngageTimeMs, 1750);
  assert.equal(chapterRecords?.['chapter-1']?.completedLevels, 1);
  assert.equal(chapterRecords?.['chapter-1']?.bestScore, 9800);
  assert.equal(chapterRecords?.['chapter-1']?.lastPlayedLevelId, '1-1');
  assert.equal(battleTotals?.totalRuns, 1);
  assert.equal(battleTotals?.wins, 1);
  assert.equal(battleTotals?.bossRuns, 0);
});

test('repeat clears do not overwrite the best fantasy lane record', () => {
  recordFantasyLaneLevelStart('1-1');
  recordFantasyLaneLevelResult('1-1', WIN_RESULT, 86);
  recordFantasyLaneLevelStart('1-1');
  const updated = recordFantasyLaneLevelResult(
    '1-1',
    { title: '战线推进成功', stars: 1, score: 2400, summary: '险胜', tips: [] },
    42,
  );

  assert.equal(updated.levelRecords['1-1']?.attempts, 2);
  assert.equal(updated.levelRecords['1-1']?.bestStars, 3);
  assert.equal(updated.levelRecords['1-1']?.bestScore, 9800);
  assert.equal(updated.levelRecords['1-1']?.bestBaseHpPercent, 86);
});

test('clearing chapter one unlocks the next chapter opener', () => {
  let progress = loadFantasyLaneProgress();

  for (let index = 1; index <= 6; index += 1) {
    const levelId = `1-${index}`;
    recordFantasyLaneLevelStart(levelId);
    progress = recordFantasyLaneLevelResult(levelId, WIN_RESULT, 80);
  }

  const chapterProgress = getFantasyLaneChapterProgress(progress, 'chapter-1');
  const summary = getFantasyLaneProgressSummary(progress);

  assert.equal(chapterProgress.completed, 6);
  assert.equal(chapterProgress.total, 6);
  assert.ok(isFantasyLaneLevelUnlocked(progress, '2-1'));
  assert.equal(getFantasyLaneLevelStatus(progress, '2-1'), 'unlocked');
  assert.equal(summary.highestChapterId, 'chapter-2');
});

test('progress loading keeps replay and debug fields while filtering invalid level ids', () => {
  localStorage.setItem(
    'fantasy-lane-progress-v1',
    JSON.stringify({
      completedLevels: ['1-1', '9-9'],
      levelRecords: {
        '1-1': {
          levelId: '1-1',
          attempts: 2,
          completed: true,
          bestStars: 3,
          bestScore: 6800,
          bestBaseHpPercent: 81,
          latestReplay: {
            version: 'v1',
            seed: 17,
            checkpoints: [{ atMs: 12000, label: '中段对推', frontline: 3, airControl: 0 }],
            events: [{ atMs: 20000, type: 'warning', detail: '尾段加压开始' }],
          },
          latestDebug: {
            warnings: ['尾段加压开始'],
            congestionPeak: 45,
            frontlineRange: { min: -2, max: 6 },
            bossPhaseIds: [],
          },
        },
        '9-9': {
          levelId: '9-9',
          attempts: 1,
          completed: true,
          bestStars: 3,
          bestScore: 9999,
          bestBaseHpPercent: 100,
        },
      },
      runtimeTotals: {
        summoned: 8,
        defeated: 10,
        queueBlocked: 1,
        projectilesFired: 6,
        aoeHits: 2,
        frontlineSummons: 4,
        antiAirSummons: 1,
        aoeSummons: 2,
        goldSpent: 320,
        goldCappedMs: 1500,
        congestionMs: 300,
        engagedUnits: 3,
        totalEngageDelayMs: 4800,
        heroSkillCast: 1,
        tacticalSkillCast: 2,
        lastSkillCastAtMs: 32000,
        averageEngageTimeMs: 1600,
      },
      highestUnlockedLevelId: '9-9',
      highestChapterId: 'chapter-9',
      lastPlayedLevelId: '9-9',
      updatedAt: 3000,
    }),
  );

  const progress = loadFantasyLaneProgress();
  const runtimeTotals = Reflect.get(progress, 'runtimeTotals') as Record<string, unknown> | undefined;
  const latestReplay = Reflect.get(progress.levelRecords['1-1'] ?? {}, 'latestReplay') as Record<string, unknown> | undefined;
  const chapterRecords = Reflect.get(progress, 'chapterRecords') as Record<string, Record<string, unknown>> | undefined;
  const battleTotals = Reflect.get(progress, 'battleTotals') as Record<string, unknown> | undefined;

  assert.deepEqual(progress.completedLevels, ['1-1']);
  assert.equal(progress.highestUnlockedLevelId, '1-2');
  assert.equal(progress.highestChapterId, 'chapter-1');
  assert.equal(progress.lastPlayedLevelId, '1-2');
  assert.equal(runtimeTotals?.queueBlocked, 1);
  assert.equal(runtimeTotals?.projectilesFired, 6);
  assert.equal(runtimeTotals?.aoeSummons, 2);
  assert.equal(runtimeTotals?.goldSpent, 320);
  assert.equal(runtimeTotals?.engagedUnits, 3);
  assert.equal(runtimeTotals?.totalEngageDelayMs, 4800);
  assert.equal(runtimeTotals?.averageEngageTimeMs, 1600);
  assert.equal(latestReplay?.seed, 17);
  assert.equal(chapterRecords?.['chapter-1']?.completedLevels, 1);
  assert.equal(chapterRecords?.['chapter-1']?.bossCleared, false);
  assert.equal(battleTotals?.totalRuns, 2);
});

test('runtime stat snapshots keep phase one telemetry totals and derive average engage time from accumulated contact delay', () => {
  recordFantasyLaneLevelStart('1-1', {
    runId: 'run-a',
    loadoutUnitIds: ['goblin_shield', 'archer'],
    startedAt: 1000,
  });
  recordFantasyLaneLevelResult('1-1', WIN_RESULT, 80, {
    finishedAt: 12000,
    runtimeStats: {
      summoned: 4,
      defeated: 7,
      queueBlocked: 1,
      projectilesFired: 5,
      aoeHits: 2,
      frontlineSummons: 2,
      antiAirSummons: 1,
      aoeSummons: 1,
      goldSpent: 96,
      goldCappedMs: 400,
      congestionMs: 300,
      engagedUnits: 2,
      totalEngageDelayMs: 2800,
      heroSkillCast: 1,
      tacticalSkillCast: 0,
      lastSkillCastAtMs: 9000,
    },
  });

  recordFantasyLaneLevelStart('1-2', {
    runId: 'run-b',
    loadoutUnitIds: ['goblin_shield', 'thunder_mage'],
    startedAt: 20000,
  });
  const progress = recordFantasyLaneLevelResult('1-2', WIN_RESULT, 76, {
    finishedAt: 36000,
    runtimeStats: {
      summoned: 5,
      defeated: 8,
      queueBlocked: 2,
      projectilesFired: 7,
      aoeHits: 4,
      frontlineSummons: 3,
      antiAirSummons: 2,
      aoeSummons: 3,
      goldSpent: 148,
      goldCappedMs: 600,
      congestionMs: 450,
      engagedUnits: 3,
      totalEngageDelayMs: 4200,
      heroSkillCast: 0,
      tacticalSkillCast: 1,
      lastSkillCastAtMs: 31000,
    },
  });
  const runtimeTotals = Reflect.get(progress, 'runtimeTotals') as Record<string, unknown> | undefined;

  assert.equal(runtimeTotals?.summoned, 9);
  assert.equal(runtimeTotals?.queueBlocked, 3);
  assert.equal(runtimeTotals?.aoeSummons, 4);
  assert.equal(runtimeTotals?.goldSpent, 244);
  assert.equal(runtimeTotals?.engagedUnits, 5);
  assert.equal(runtimeTotals?.totalEngageDelayMs, 7000);
  assert.equal(runtimeTotals?.averageEngageTimeMs, 1400);
});

test('boss results persist chapter completion, phase snapshots, and boss phase aggregates for phase two progression', () => {
  recordFantasyLaneLevelStart('1-6', {
    runId: 'boss-run-1',
    heroId: 'warlord',
    tacticalSkillId: 'shield',
    loadoutUnitIds: ['goblin_shield', 'archer', 'flame_warlock', 'orc_heavy'],
    runtimeSeed: 16,
    startedAt: 5000,
  });

  const progress = recordFantasyLaneLevelResult('1-6', WIN_RESULT, 72, {
    finishedAt: 176000,
    currentPhaseId: '1-6-last-stand',
    runtimeStats: {
      summoned: 12,
      defeated: 25,
      queueBlocked: 3,
      projectilesFired: 14,
      aoeHits: 9,
      frontlineSummons: 6,
      antiAirSummons: 1,
      aoeSummons: 4,
      goldSpent: 318,
      goldCappedMs: 2200,
      congestionMs: 1600,
      engagedUnits: 4,
      totalEngageDelayMs: 5200,
      heroSkillCast: 2,
      tacticalSkillCast: 1,
      lastSkillCastAtMs: 151000,
    },
    replay: {
      version: 'v1',
      seed: 16,
      checkpoints: [
        { atMs: 12000, label: '开场读题', frontline: 1, airControl: 0 },
        { atMs: 60000, label: '中段对推', frontline: 3, airControl: 0 },
        { atMs: 102000, label: 'Boss 登场', frontline: 2, airControl: 0 },
        { atMs: 160000, label: '终局收口', frontline: 5, airControl: 1 },
      ],
      events: [
        { atMs: 98000, type: 'warning', detail: '骸骨巨王入场' },
        { atMs: 124000, type: 'bossPhase', detail: 'Boss 第一阈值转段' },
        { atMs: 149000, type: 'bossPhase', detail: 'Boss 第二阈值转段' },
      ],
    },
    debug: {
      warnings: ['Boss 狂暴，必须抓住最后一轮总攻窗口。'],
      congestionPeak: 88,
      frontlineRange: { min: -4, max: 9 },
      bossPhaseIds: ['1-6-boss-phase-1', '1-6-boss-phase-2', '1-6-boss-phase-3', '1-6-boss-phase-4'],
    },
  });

  const levelRecord = progress.levelRecords['1-6'];
  const phaseSnapshots = Reflect.get(levelRecord ?? {}, 'phaseSnapshots') as Array<Record<string, unknown>> | undefined;
  const latestBossBattle = Reflect.get(levelRecord ?? {}, 'latestBossBattle') as Record<string, unknown> | undefined;
  const chapterRecords = Reflect.get(progress, 'chapterRecords') as Record<string, Record<string, unknown>> | undefined;
  const battleTotals = Reflect.get(progress, 'battleTotals') as Record<string, unknown> | undefined;
  const phaseEntries = Reflect.get(battleTotals ?? {}, 'phaseEntries') as Record<string, unknown> | undefined;
  const bossPhaseTriggers = Reflect.get(battleTotals ?? {}, 'bossPhaseTriggers') as Record<string, unknown> | undefined;

  assert.equal(phaseSnapshots?.length, 4);
  assert.deepEqual(
    phaseSnapshots?.map((phase) => phase.phaseId),
    ['1-6-open', '1-6-mid', '1-6-boss-enter', '1-6-last-stand'],
  );
  assert.equal(phaseSnapshots?.every((phase) => phase.reached === true), true);
  assert.equal(phaseSnapshots?.every((phase) => phase.completed === true), true);
  assert.equal(latestBossBattle?.triggeredPhaseCount, 4);
  assert.equal(latestBossBattle?.cleared, true);
  assert.equal(latestBossBattle?.bossName, '骸骨巨王');
  assert.equal(chapterRecords?.['chapter-1']?.bossCleared, true);
  assert.equal(chapterRecords?.['chapter-1']?.bestBossScore, 9800);
  assert.equal(chapterRecords?.['chapter-1']?.lastBossLevelId, '1-6');
  assert.equal(battleTotals?.totalRuns, 1);
  assert.equal(battleTotals?.bossRuns, 1);
  assert.equal(battleTotals?.bossClears, 1);
  assert.equal(phaseEntries?.['1-6-boss-enter'], 1);
  assert.equal(bossPhaseTriggers?.['1-6-boss-phase-4'], 1);
});
