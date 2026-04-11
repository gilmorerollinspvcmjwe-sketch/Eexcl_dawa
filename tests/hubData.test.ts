import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHubSnapshot } from '../src/features/hub/hubData.ts';

test('buildHubSnapshot prefers unfinished perler work for quick resume', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: { templateId: 'tpl-1', completion: 62, title: '咖波表情' },
    stats: { totalGames: 3, totalScore: 12840 },
  });

  assert.equal(snapshot.quickResume.kind, 'perler');
  assert.match(snapshot.quickResume.label, /62%/);
});

test('buildHubSnapshot returns five game rows with perler included', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.games.length, 5);
  assert.ok(snapshot.games.some((item) => item.id === 'perler'));
});

