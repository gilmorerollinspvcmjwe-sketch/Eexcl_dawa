import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLevelDefinition,
  getLevelPackSummary,
} from '../src/features/zuma/zumaLevelCatalog.ts';

function collectSpawnIntervals(levelId: string): number[] {
  const level = getLevelDefinition(levelId);
  assert.ok(level, `missing level ${levelId}`);
  return level.spawnScript.slice(1).map((event, index) => event.spawnAtMs - level.spawnScript[index].spawnAtMs);
}

test('祖玛主线目录已扩到 45 关并补出高压段章节包', () => {
  assert.ok(getLevelDefinition('zuma-adventure-028'));
  assert.ok(getLevelDefinition('zuma-adventure-029'));
  assert.ok(getLevelDefinition('zuma-adventure-045'));

  const chainSummary = getLevelPackSummary('chain');
  assert.ok(chainSummary.levelCount >= 16);

  const pressureSummary = (getLevelPackSummary as unknown as (packType: string) => {
    name: string;
    levelCount: number;
    description: string;
  })('pressure');
  assert.ok(pressureSummary);
  assert.ok(pressureSummary.levelCount >= 17);
});

test('进阶段与高压段关卡都带有波段式压力和复合目标', () => {
  const advancedLevel = getLevelDefinition('zuma-adventure-024');
  const pressureLevel = getLevelDefinition('zuma-adventure-034');

  assert.ok(advancedLevel);
  assert.ok(pressureLevel);
  assert.equal(advancedLevel?.winCondition.type, 'multiObjective');
  assert.equal(pressureLevel?.winCondition.type, 'multiObjective');
  assert.ok(new Set(collectSpawnIntervals('zuma-adventure-024')).size > 1);
  assert.ok(new Set(collectSpawnIntervals('zuma-adventure-034')).size > 1);
  assert.ok(pressureLevel?.rules.some((rule) => rule.includes('波段') || rule.includes('前段') || rule.includes('后段')));
});

test('challenge 与 endless 模式都有真实可选关卡', () => {
  const challengeLevel = getLevelDefinition('zuma-challenge-001');
  const endlessLevel = getLevelDefinition('zuma-endless-001');

  assert.ok(challengeLevel);
  assert.equal(challengeLevel?.mode, 'challenge');
  assert.ok(challengeLevel?.winCondition.type === 'multiObjective');

  assert.ok(endlessLevel);
  assert.equal(endlessLevel?.mode, 'endless');
  assert.ok(endlessLevel?.rules.some((rule) => rule.includes('波段')));
});
