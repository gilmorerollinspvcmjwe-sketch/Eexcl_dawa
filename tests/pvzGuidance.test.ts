import test from 'node:test';
import assert from 'node:assert/strict';
import { createPvZBoardState, startPvZBattle } from '../src/features/pvz/pvzBoardState.ts';
import { getPvZChapterGuidance, getPvZOutcomeRecommendation } from '../src/features/pvz/pvzChapterGuidance.ts';

test('chapter guidance exposes objective and threats for each chapter', () => {
  const roof = getPvZChapterGuidance('roof');
  const night = getPvZChapterGuidance('night');

  assert.match(roof.objective, /重甲|输出/);
  assert.ok(roof.majorThreats.length >= 1);
  assert.match(night.setupHint, /阳光|前期/);
});

test('outcome recommendation includes post-battle next steps', () => {
  const won = { ...startPvZBattle(createPvZBoardState('day')), phase: 'won' as const, status: 'won' as const };
  const lost = {
    ...startPvZBattle(createPvZBoardState('fog')),
    phase: 'lost' as const,
    status: 'lost' as const,
    zombies: [{ instanceId: 'z-1', zombieId: 'football', row: 2, x: 1.2, hp: 600 }],
  };

  assert.match(getPvZOutcomeRecommendation(won), /图鉴|下一章/);
  assert.match(getPvZOutcomeRecommendation(lost), /实验室|复盘|失守/);
});

