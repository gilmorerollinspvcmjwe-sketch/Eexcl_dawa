import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FANTASY_LANE_CHAPTERS,
  FANTASY_LANE_LEVELS,
  getFantasyLaneLevelById,
  getFantasyLaneLevelsByChapter,
} from '../src/features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import { fantasyLaneRuntimeAdapter } from '../src/features/fantasy_lane/fantasyLaneRuntime.ts';
import type { FantasyLaneLaneId, FantasyLaneLayer, FantasyLaneRuntimeState, FantasyLaneSide, FantasyLaneUnitInstance } from '../src/features/fantasy_lane/fantasyLaneTypes.ts';

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

function startState(): FantasyLaneRuntimeState {
  return fantasyLaneRuntimeAdapter.startBattle(fantasyLaneRuntimeAdapter.createInitialState());
}

test('fantasy lane catalog ships 5 chapters and 30 levels', () => {
  assert.equal(FANTASY_LANE_CHAPTERS.length, 5);
  assert.equal(FANTASY_LANE_LEVELS.length, 30);
  assert.equal(getFantasyLaneLevelsByChapter('chapter-3').length, 6);
  assert.equal(getFantasyLaneLevelById('5-6').chapterName, '龙火王庭');
});

test('queued player unit spends gold immediately and spawns on the battlefield after ticks', () => {
  const started = startState();
  const queued = fantasyLaneRuntimeAdapter.queueUnit(started, 'goblin_shield');

  assert.equal(queued.queue.length, 1);
  assert.ok(queued.gold < started.gold);

  const advanced = fantasyLaneRuntimeAdapter.tick(queued, 600);
  const playerUnits = advanced.units.filter((unit) => unit.side === 'player');

  assert.equal(advanced.queue.length, 0);
  assert.equal(playerUnits.length, 1);
  assert.equal(playerUnits[0]?.templateId, 'goblin_shield');
});

test('hero and tactical skills enter cooldown once cast during battle', () => {
  const started = startState();
  const heroCast = fantasyLaneRuntimeAdapter.castSkill(started, started.heroSkill.id);
  const tacticalCast = fantasyLaneRuntimeAdapter.castSkill(heroCast, heroCast.tacticalSkill.id);

  assert.ok(heroCast.heroSkill.remainingMs > 0);
  assert.ok(heroCast.effects.some((effect) => effect.kind === 'haste' || effect.kind === 'freeze' || effect.kind === 'burnline'));
  assert.ok(tacticalCast.tacticalSkill.remainingMs > 0);
});

test('ground-only melee ignores air while ranged anti-air creates a projectile and lands damage', () => {
  const started = startState();
  const next = fantasyLaneRuntimeAdapter.tick(
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

  const resolved = fantasyLaneRuntimeAdapter.tick(next, 400);
  assert.ok((resolved.units.find((unit) => unit.instanceId === 'enemy-bat')?.hp ?? 999) < 999);
});

test('queue processing deploys the first spawnable unit instead of hard-blocking the line', () => {
  const started = startState();
  const next = fantasyLaneRuntimeAdapter.tick(
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

test('setup changes are ignored while battle is active', () => {
  const started = startState();
  const switchedLevel = fantasyLaneRuntimeAdapter.selectLevel(started, '3-2');
  const switchedHero = fantasyLaneRuntimeAdapter.selectHero(started, 'archmage');

  assert.equal(switchedLevel.selectedLevelId, started.selectedLevelId);
  assert.equal(switchedHero.selectedHeroId, started.selectedHeroId);
});
