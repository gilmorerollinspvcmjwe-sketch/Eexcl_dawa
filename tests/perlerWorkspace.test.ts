import test from 'node:test';
import assert from 'node:assert/strict';
import { applyColorToCell, createPerlerWorkspace } from '../src/features/perler/perlerWorkspaceState.ts';

test('applyColorToCell updates completion progress for matching template cells', () => {
  const workspace = createPerlerWorkspace({
    id: 'tpl-demo',
    title: '演示模板',
    width: 2,
    height: 2,
    category: 'basics',
    difficulty: 'easy',
    tags: ['演示'],
    pixels: ['#111111', '#222222', '#333333', '#444444'],
  });

  const next = applyColorToCell(workspace, 0, 0, '#111111');

  assert.equal(next.filledCount, 1);
  assert.equal(next.completion, 25);
});

