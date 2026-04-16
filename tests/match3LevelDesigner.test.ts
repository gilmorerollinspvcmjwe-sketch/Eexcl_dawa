import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMatch3LevelVariant,
} from '../src/features/match3/match3LevelDesigner.ts';
import {
  getLevelById,
} from '../src/features/match3/match3LevelCatalog.ts';

test('createMatch3LevelVariant clones a base level without mutating it', () => {
  const base = getLevelById('beginner-01');
  assert.ok(base);

  const variant = createMatch3LevelVariant(base!, {
    suffix: 'tuned',
    name: '初次接触·调参',
    maxMoves: 16,
    colorWeights: { red: 4, yellow: 2 },
  });

  assert.equal(variant.id, 'beginner-01-tuned');
  assert.equal(variant.name, '初次接触·调参');
  assert.equal(variant.maxMoves, 16);
  assert.deepEqual(variant.colorWeights, { red: 4, yellow: 2 });
  assert.equal(base?.id, 'beginner-01');
  assert.equal(base?.maxMoves, 20);
  assert.equal(base?.colorWeights, undefined);
});

test('createMatch3LevelVariant keeps safe script fields and rewrites deterministic labels', () => {
  const base = getLevelById('combo-01');
  assert.ok(base);

  const variant = createMatch3LevelVariant(base!, {
    suffix: 'daily',
    packId: 'daily-challenge',
    packName: '每日挑战',
    chapterId: 'daily-challenge',
    chapterName: '每日挑战',
    tutorialHint: '测试新的组合目标节奏。',
    goals: [{ type: 'triggerCombo', target: 2, current: 0, comboTarget: 'striped-striped' }],
  });

  assert.equal(variant.id, 'combo-01-daily');
  assert.equal(variant.packId, 'daily-challenge');
  assert.equal(variant.packName, '每日挑战');
  assert.equal(variant.chapterId, 'daily-challenge');
  assert.equal(variant.chapterName, '每日挑战');
  assert.equal(variant.orderInPack, base!.orderInPack);
  assert.equal(variant.boardTemplateId, base!.boardTemplateId);
  assert.equal(variant.goals[0]?.target, 2);
});
