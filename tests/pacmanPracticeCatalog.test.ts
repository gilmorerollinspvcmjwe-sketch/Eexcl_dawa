import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPacmanPracticeModule,
  getPacmanPracticeModules,
} from '../src/features/pacman/pacmanPracticeCatalog.ts';

test('practice catalog exposes four launchable Pacman drills instead of placeholders', () => {
  const modules = getPacmanPracticeModules();

  assert.equal(modules.length, 4);
  assert.deepEqual(
    modules.map((module) => module.id),
    ['turning_basics', 'energizer_chain', 'ghost_escape', 'timing_read'],
  );
  assert.ok(modules.every((module) => module.levelNumber >= 1));
  assert.ok(modules.every((module) => module.startHint.length > 0));
});

test('practice modules point to real tutorial lessons and expose return targets', () => {
  const module = getPacmanPracticeModule('ghost_escape');

  assert.equal(module?.packId, 'tutorial');
  assert.equal(module?.levelNumber, 8);
  assert.equal(module?.returnTo, 'guide');
});
