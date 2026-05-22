import test from 'node:test';
import assert from 'node:assert/strict';
import { applyColorToCell, createPerlerWorkspace, getWorkspaceMismatchCount } from '../src/features/perler/perlerWorkspaceState.ts';
import { buildPixelPatternFromPixels } from '../src/features/perler/pixelPatternParser.ts';

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
    pattern: buildPixelPatternFromPixels({
      title: '演示模板',
      width: 2,
      height: 2,
      pixels: ['#111111', '#222222', '#333333', '#444444'],
    }),
  });

  const next = applyColorToCell(workspace, 0, 0, '#111111');

  assert.equal(next.filledCount, 1);
  assert.equal(next.completion, 25);
});

test('workspace can report mismatched cells against the template', () => {
  const workspace = createPerlerWorkspace({
    id: 'tpl-demo',
    title: '演示模板',
    width: 2,
    height: 2,
    category: 'basics',
    difficulty: 'easy',
    tags: ['演示'],
    pixels: ['#111111', '#222222', '#333333', '#444444'],
    pattern: buildPixelPatternFromPixels({
      title: '演示模板',
      width: 2,
      height: 2,
      pixels: ['#111111', '#222222', '#333333', '#444444'],
    }),
  });

  const wrong = applyColorToCell(workspace, 0, 0, '#FFFFFF');

  assert.equal(wrong.completion, 0);
  assert.equal(getWorkspaceMismatchCount(wrong), 1);
});
