import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FANTASY_LANE_CHAPTERS,
  FANTASY_LANE_LEVELS,
  getFantasyLaneLevelById,
  getFantasyLaneLevelsByChapter,
} from '../src/features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import type { FantasyLaneLaneId, FantasyLaneLayer, FantasyLaneRuntimeState, FantasyLaneSide, FantasyLaneUnitInstance } from '../src/features/fantasy_lane/fantasyLaneTypes.ts';

async function getRuntimeAdapter() {
  const runtimeModule = await import('../src/features/fantasy_lane/fantasyLaneRuntime.ts');
  return runtimeModule.fantasyLaneRuntimeAdapter;
}

function createUnit(
  instanceId: string,
  templateId: string,
  side: FantasyLaneSide,
  layer: FantasyLaneLayer,
  lane: FantasyLaneLaneId,
  x: number,
  y: number,
): FantasyLaneUnitInstance {
  return {
    instanceId,
    templateId,
    side,
    layer,
    lane,
    x,
    y,
    hp: 999,
    armorHp: 0,
    attackCooldownMs: 0,
    attackAnimMs: 0,
    hitFlashMs: 0,
    blockedMs: 0,
    lastTargetId: null,
    spawnedAtMs: 0,
  };
}

async function startState(): Promise<FantasyLaneRuntimeState> {
  const runtimeAdapter = await getRuntimeAdapter();
  return runtimeAdapter.startBattle(runtimeAdapter.createInitialState());
}

test('fantasy lane catalog ships 5 chapters and 30 levels', () => {
  assert.equal(FANTASY_LANE_CHAPTERS.length, 5);
  assert.equal(FANTASY_LANE_LEVELS.length, 30);
  assert.equal(getFantasyLaneLevelsByChapter('chapter-3').length, 6);
  assert.equal(getFantasyLaneLevelById('5-6').chapterName, '龙火王庭');
  FANTASY_LANE_CHAPTERS.forEach((chapter) => {
    const propositionCount = chapter.focus
      .split(/[、/]/)
      .map((item) => item.trim())
      .filter(Boolean).length;
    assert.ok(propositionCount >= 1 && propositionCount <= 2, `${chapter.id} 应只保留 1~2 个核心命题`);
  });
});

test('normal levels keep three teaching segments and boss levels expand into multi-stage battles', () => {
  const normalLevel = getFantasyLaneLevelById('3-2');
  const bossLevel = getFantasyLaneLevelById('3-6');

  assert.deepEqual(
    normalLevel.phases.map((phase) => phase.label),
    ['开场读题', '中段对推', '尾段加压'],
  );
  normalLevel.phases.forEach((phase) => {
    assert.ok(phase.spawnGroups.length > 0, `${normalLevel.id} 的 ${phase.id} 缺少刷怪结构`);
  });

  assert.ok(bossLevel.phases.length >= 4, 'Boss 关应拆成多阶段战斗，而不是单段 Boss 登场');
  assert.ok(bossLevel.boss, 'Boss 关必须声明 Boss 数据');
  assert.ok((bossLevel.boss?.phases.length ?? 0) >= 4, 'Boss 至少要有 4 个阈值阶段');
  bossLevel.boss?.phases.forEach((phase) => {
    assert.ok(phase.enterWarning.length > 0, `${phase.id} 缺少阶段预警`);
    assert.ok(phase.skills.length > 0, `${phase.id} 缺少阶段技能描述`);
  });
});

test('each chapter uses distinct level scripts and boss stages instead of re-skinning one template', () => {
  FANTASY_LANE_CHAPTERS.forEach((chapter) => {
    const levels = getFantasyLaneLevelsByChapter(chapter.id);
    const normalLevels = levels.slice(0, 5);
    const bossLevel = levels[5];
    const cadenceSignatures = new Set(
      normalLevels.map((level) =>
        level.phases
          .map(
            (phase) =>
              `${phase.label}:${phase.pressure}:${phase.spawnGroups
                .map((group) => `${group.unitId}@${group.laneOverride ?? 'auto'}#${group.firstDelaySec}/${group.intervalSec}`)
                .join('|')}`,
          )
          .join(' -> '),
      ),
    );
    const bossSpawnGroups = bossLevel.boss?.phases.flatMap((phase) => phase.phaseSpawnGroups ?? []) ?? [];
    const bossUnits = new Set(bossSpawnGroups.map((group) => group.unitId));
    const bossLaneOverrides = bossSpawnGroups.filter((group) => group.laneOverride);
    const thresholds = bossLevel.boss?.phases.map((phase) => phase.hpThreshold) ?? [];

    assert.ok(cadenceSignatures.size >= 4, `${chapter.id} 的前五关脚本仍然太像模板换皮`);
    assert.ok(bossUnits.size >= 4, `${bossLevel.id} 的 Boss 战阶段威胁不够丰富`);
    assert.ok(bossLaneOverrides.length >= 2, `${bossLevel.id} 的 Boss 战缺少明确的分线/分层压力变化`);
    assert.deepEqual(thresholds, [...thresholds].sort((left, right) => right - left), `${bossLevel.id} 的 Boss 阈值应按血量递减`);
  });
});

test('queued player unit spends gold immediately and spawns on the battlefield after ticks', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const queued = runtimeAdapter.queueUnit(started, 'goblin_shield');

  assert.equal(queued.queue.length, 1);
  assert.ok(queued.gold < started.gold);

  const advanced = runtimeAdapter.tick(queued, 600);
  const playerUnits = advanced.units.filter((unit) => unit.side === 'player');

  assert.equal(advanced.queue.length, 0);
  assert.equal(playerUnits.length, 1);
  assert.equal(playerUnits[0]?.templateId, 'goblin_shield');
});

test('hero and tactical skills enter cooldown once cast during battle', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const heroCast = runtimeAdapter.castSkill(started, started.heroSkill.id);
  const tacticalCast = runtimeAdapter.castSkill(heroCast, heroCast.tacticalSkill.id);

  assert.ok(heroCast.heroSkill.remainingMs > 0);
  assert.ok(heroCast.effects.some((effect) => effect.kind === 'haste' || effect.kind === 'freeze' || effect.kind === 'burnline'));
  assert.ok(tacticalCast.tacticalSkill.remainingMs > 0);
});

test('ground-only melee ignores air while ranged anti-air creates a projectile and lands damage', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const next = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      units: [
        createUnit('player-shield', 'goblin_shield', 'player', 'ground', 'front', 48, 0.78),
        createUnit('player-thunder', 'thunder_mage', 'player', 'ground', 'rear', 46, 0.64),
        createUnit('enemy-bat', 'bat_swarm', 'enemy', 'air', 'air', 56, 0.22),
      ],
    },
    200,
  );

  assert.equal(next.stats.projectilesFired, 1);
  assert.equal(next.units.find((unit) => unit.instanceId === 'enemy-bat')?.hp, 999);

  const resolved = runtimeAdapter.tick(next, 400);
  assert.ok((resolved.units.find((unit) => unit.instanceId === 'enemy-bat')?.hp ?? 999) < 999);
});

test('melee, ranged, and air units follow distinct phase one combat protocols', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const next = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      units: [
        createUnit('melee', 'goblin_shield', 'player', 'ground', 'front', 40, 0.78),
        createUnit('ranged', 'archer', 'player', 'ground', 'rear', 40, 0.64),
        createUnit('air', 'griffin_knight', 'player', 'air', 'air', 40, 0.22),
        createUnit('enemy-ground', 'orc_heavy', 'enemy', 'ground', 'front', 52, 0.78),
        createUnit('enemy-air', 'bat_swarm', 'enemy', 'air', 'air', 52, 0.22),
      ],
    },
    200,
  );

  const melee = next.units.find((unit) => unit.instanceId === 'melee');
  const ranged = next.units.find((unit) => unit.instanceId === 'ranged');
  const air = next.units.find((unit) => unit.instanceId === 'air');

  assert.ok((melee?.x ?? 0) > 40, '近战应继续前压，而不是主动后撤');
  assert.ok((ranged?.x ?? 999) < 40, '远程应围绕 preferredRange 拉开距离');
  assert.ok((air?.x ?? 0) > 40, '空军应沿空层推进，不走地面退让逻辑');
  assert.equal(next.stats.projectilesFired, 1, '远程单位应在进入射程后发射投射物');
});

test('soft collision resolves overlap without freezing the whole ground line and records first contact', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const next = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      units: [
        createUnit('front', 'goblin_shield', 'player', 'ground', 'front', 48, 0.78),
        createUnit('rear', 'goblin_shield', 'player', 'ground', 'front', 48, 0.78),
        createUnit('enemy', 'orc_heavy', 'enemy', 'ground', 'front', 50.4, 0.78),
      ],
    },
    200,
  );

  const front = next.units.find((unit) => unit.instanceId === 'front');
  const rear = next.units.find((unit) => unit.instanceId === 'rear');

  assert.notEqual(front?.x, rear?.x, '软碰撞应把重叠友军分开');
  assert.ok((rear?.x ?? 0) < (front?.x ?? 0), '后排单位应保持次序，不要直接挤穿前排');
  assert.ok(next.stats.engagedUnits >= 2, '进入接敌距离后应记录接敌单位数');
  assert.ok(next.stats.totalEngageDelayMs > 0, '接敌后应累计接敌耗时');
});

test('damage matrix keeps anti-air burst and aoe splash distinct from ground single-target damage', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  let next = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      units: [
        createUnit('archer', 'archer', 'player', 'ground', 'rear', 40, 0.64),
        createUnit('mage', 'thunder_mage', 'player', 'ground', 'rear', 40, 0.64),
        createUnit('heavy', 'orc_heavy', 'enemy', 'ground', 'front', 58, 0.78),
        createUnit('bat-a', 'bat_swarm', 'enemy', 'air', 'air', 58, 0.22),
        createUnit('bat-b', 'bat_swarm', 'enemy', 'air', 'air', 59.5, 0.22),
      ],
    },
    200,
  );

  for (let index = 0; index < 5; index += 1) {
    next = runtimeAdapter.tick(next, 200);
  }

  const heavy = next.units.find((unit) => unit.instanceId === 'heavy');
  const primaryBat = next.units.find((unit) => unit.instanceId === 'bat-a');
  const secondaryBat = next.units.find((unit) => unit.instanceId === 'bat-b');

  assert.equal(heavy?.hp, 969.48, '物理伤害打重甲应按护甲矩阵减伤');
  assert.equal(primaryBat?.hp, 862.6, '对空主目标应吃满 antiAir 倍率');
  assert.ok((secondaryBat?.hp ?? 999) < 999, 'AOE 次级目标也应受伤');
  assert.ok((secondaryBat?.hp ?? 999) > (primaryBat?.hp ?? 0), 'AOE 次级命中应低于主目标伤害');
  assert.equal(next.stats.aoeHits, 2, 'AOE 命中数应覆盖主次目标');
});

test('runtime exposes the key telemetry ports needed by fantasy lane progress tracking', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const withQueuePressure = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      gold: 300,
      globalSpawnCooldownMs: 0,
      queue: ['tree_ancient', 'archer', 'griffin_knight', 'thunder_mage', 'goblin_shield'],
      unitCooldowns: {
        ...started.unitCooldowns,
        tree_ancient: 0,
        archer: 0,
        griffin_knight: 0,
        thunder_mage: 0,
        goblin_shield: 0,
      },
      units: Array.from({ length: 14 }, (_, index) =>
        createUnit(`player-ground-${index}`, 'goblin_shield', 'player', 'ground', 'front', 10 + index, 0.78),
      ),
    },
    240,
  );
  const afterSkill = runtimeAdapter.castSkill(withQueuePressure, withQueuePressure.heroSkill.id);
  const afterTactical = runtimeAdapter.castSkill(afterSkill, afterSkill.tacticalSkill.id);
  const stats = afterTactical.stats;

  assert.equal(typeof stats.summoned, 'number');
  assert.equal(typeof stats.defeated, 'number');
  assert.equal(typeof stats.projectilesFired, 'number');
  assert.equal(typeof stats.aoeHits, 'number');
  assert.equal(typeof stats.frontlineSummons, 'number');
  assert.equal(typeof stats.antiAirSummons, 'number');
  assert.equal(typeof stats.aoeSummons, 'number');
  assert.equal(typeof stats.goldSpent, 'number');
  assert.equal(typeof stats.goldCappedMs, 'number');
  assert.equal(typeof stats.queueBlocked, 'number');
  assert.equal(typeof stats.engagedUnits, 'number');
  assert.equal(typeof stats.totalEngageDelayMs, 'number');
  assert.equal(typeof stats.heroSkillCast, 'number');
  assert.equal(typeof stats.tacticalSkillCast, 'number');
  assert.ok('lastSkillCastAtMs' in stats);
});

test('queue processing deploys the first spawnable unit instead of hard-blocking the line', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const next = runtimeAdapter.tick(
    {
      ...started,
      scheduledEvents: [],
      gold: 300,
      globalSpawnCooldownMs: 0,
      queue: ['tree_ancient', 'archer'],
      unitCooldowns: {
        ...started.unitCooldowns,
        tree_ancient: 0,
        archer: 0,
      },
      units: Array.from({ length: 14 }, (_, index) =>
        createUnit(`player-ground-${index}`, 'goblin_shield', 'player', 'ground', 'front', 10 + index, 0.78),
      ),
    },
    200,
  );

  assert.equal(next.queue.includes('tree_ancient'), true);
  assert.equal(next.queue.includes('archer'), false);
  assert.equal(next.units.some((unit) => unit.templateId === 'archer' && unit.side === 'player'), true);
});

test('setup changes are ignored while battle is active', async () => {
  const runtimeAdapter = await getRuntimeAdapter();
  const started = await startState();
  const switchedLevel = runtimeAdapter.selectLevel(started, '3-2');
  const switchedHero = runtimeAdapter.selectHero(started, 'archmage');

  assert.equal(switchedLevel.selectedLevelId, started.selectedLevelId);
  assert.equal(switchedHero.selectedHeroId, started.selectedHeroId);
});
