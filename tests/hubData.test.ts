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

test('buildHubSnapshot returns seven game rows with gold miner included', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.games.length, 7);
  assert.ok(snapshot.games.some((item) => item.id === 'perler'));
  assert.ok(snapshot.games.some((item) => item.id === 'fantasy_lane'));
  assert.ok(snapshot.games.some((item) => item.id === 'gold_miner'));
  assert.ok(snapshot.games.some((item) => item.id === 'snake'));
  assert.ok(snapshot.games.some((item) => item.id === 'tetris'));
});

test('buildHubSnapshot keeps hub labels compact for the first screen', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: { templateId: 'tpl-1', completion: 62, title: '咖波表情' },
    stats: { totalGames: 3, totalScore: 12840 },
  });

  assert.equal(snapshot.quickResume.description, '');
  assert.equal(snapshot.recommendation, '配置');
  assert.equal(snapshot.games.find((item) => item.id === 'aim')?.status, '热手');
  assert.equal(snapshot.games.find((item) => item.id === 'perler')?.status, '62%');
});

test('buildHubSnapshot falls back to fantasy lane quick resume once the campaign has started', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    fantasyLaneProgress: {
      hasStarted: true,
      currentChapterLabel: '哥布林边境',
      completedLevels: 0,
      totalLevels: 30,
      totalStars: 0,
      bestScore: 1820,
      lastPlayedLevelName: '1-1 稳线入门',
    },
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.quickResume.kind, 'fantasy_lane');
  assert.equal(snapshot.quickResume.label, '继续 1-1 稳线入门');
  assert.equal(snapshot.games.find((item) => item.id === 'fantasy_lane')?.actionLabel, '继续');
});

test('buildHubSnapshot falls back to gold miner quick resume after gold has been mined', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    fantasyLaneProgress: null,
    goldMinerProgress: {
      hasStarted: true,
      highestLevel: 4,
      bestScore: 6800,
      totalGoldCollected: 12400,
      lastPlayedLabel: 'L4',
    },
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.quickResume.kind, 'gold_miner');
  assert.equal(snapshot.quickResume.label, '继续黄金矿工 L4');
  assert.equal(snapshot.games.find((item) => item.id === 'gold_miner')?.actionLabel, '继续');
});

test('buildHubSnapshot keeps fantasy lane in launch state before any battle has started', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    fantasyLaneProgress: {
      hasStarted: false,
      currentChapterLabel: '哥布林边境',
      completedLevels: 0,
      totalLevels: 30,
      totalStars: 0,
      bestScore: 0,
      lastPlayedLevelName: '1-1 稳线入门',
    },
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.quickResume.kind, 'aim');
  assert.equal(snapshot.games.find((item) => item.id === 'fantasy_lane')?.status, '战线');
  assert.equal(snapshot.games.find((item) => item.id === 'fantasy_lane')?.actionLabel, '启动');
});
