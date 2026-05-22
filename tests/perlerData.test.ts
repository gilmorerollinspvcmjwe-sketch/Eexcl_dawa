import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPerlerTemplates, perlerTemplates } from '../src/features/perler/perlerData.ts';

test('filterPerlerTemplates returns game-role templates for keyword search', () => {
  const result = filterPerlerTemplates(perlerTemplates, {
    query: '游戏',
    category: 'all',
    size: 'all',
    difficulty: 'all',
  });

  assert.ok(result.some((item) => item.title.includes('曜')));
});

test('template catalog exposes multiple top-level theme groups', () => {
  const categories = new Set(perlerTemplates.map((item) => item.category));
  assert.ok(categories.has('office'));
  assert.ok(categories.has('games'));
  assert.ok(categories.has('abstract'));
});

