import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  placePlant,
  resetPvZToSetup,
  restartPvZBattle,
  selectPvZCard,
  setPvZChapter,
  setPvZScenario,
  spawnZombieNow,
  startPvZBattle,
  tickPvZBoard,
  type PvZBoardState,
} from '../src/features/pvz/pvzBoardState.ts';
import { PVZ_PLANTS } from '../src/features/pvz/pvzPlantRegistry.ts';
import { PVZ_ZOMBIES } from '../src/features/pvz/pvzZombieRegistry.ts';

test('placing a plant deducts sun', () => {
  let state = createPvZBoardState();
  state = startPvZBattle(state);
  const next = placePlant(state, 'sunflower', 0, 0);

  assert.equal(next.sun, state.sun - 50);
  assert.equal(next.plants.length, 1);
});

test('cannot place a plant with insufficient sun', () => {
  const state = { ...startPvZBattle(createPvZBoardState()), sun: 0 };
  const next = placePlant(state, 'peashooter', 0, 0);

  assert.equal(next.sun, 0);
  assert.equal(next.plants.length, 0);
});

test('lane breach marks defeat when mower is unavailable', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = {
    ...state,
    lawnMowers: state.lawnMowers.map((active, row) => (row === 0 ? false : active)),
    lawnMowerStates: state.lawnMowerStates.map((mower, row) =>
      row === 0 ? { ...mower, active: false, triggered: false } : mower,
    ),
  };
  state = spawnZombieNow(state, 'normal', 0, -0.2);

  const next = tickPvZBoard(state, 16);
  assert.equal(next.status, 'lost');
});

test('wave progress advances over time', () => {
  const next = tickPvZBoard(startPvZBattle(createPvZBoardState()), 5000);
  assert.ok(next.elapsedMs >= 5000);
  assert.ok(next.waveProgress > 0);
});

test('peashooter creates a straight projectile when a zombie is ahead', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'peashooter', 0, 0);
  state = spawnZombieNow(state, 'normal', 0, 7);

  const next = tickPvZBoard(state, 1600);
  assert.ok(next.projectiles.some((projectile) => projectile.kind === 'pea'));
});

test('repeater creates a double projectile burst', () => {
  let state = startPvZBattle(createPvZBoardState({ scenarioId: '2-01' }));
  state = {
    ...state,
    sun: 300,
    selectedCards: Array.from(new Set([...state.selectedCards, 'repeater'])),
  };
  state = placePlant(state, 'repeater', 1, 1);
  state = spawnZombieNow(state, 'normal', 1, 7);

  const next = tickPvZBoard(state, 1600);
  assert.ok(next.projectiles.filter((projectile) => projectile.kind === 'double-pea').length >= 2);
});

test('card pick phase starts before battle and can toggle a loadout', () => {
  let state = createPvZBoardState();

  assert.equal(state.phase, 'setup');
  assert.ok(state.selectedCards.includes('sunflower'));
  state = selectPvZCard(state, 'sunflower');
  assert.ok(!state.selectedCards.includes('sunflower'));
  state = selectPvZCard(state, 'sunflower');
  assert.ok(state.selectedCards.includes('sunflower'));
});

test('placing plants is blocked before battle starts', () => {
  const next = placePlant(createPvZBoardState(), 'sunflower', 0, 0);
  assert.equal(next.plants.length, 0);
});

test('pvz roster is expanded beyond the initial basic set', () => {
  assert.ok(PVZ_PLANTS.length >= 12);
  assert.ok(PVZ_ZOMBIES.length >= 8);
});

test('starting battle keeps selected cards and unlocks gameplay', () => {
  let state = createPvZBoardState('night');
  state = selectPvZCard(state, 'sunflower');
  const expectedLoadout = [...state.selectedCards];
  assert.ok(expectedLoadout.length > 0);

  state = startPvZBattle(state);

  assert.equal(state.phase, 'playing');
  assert.deepEqual(state.selectedCards, expectedLoadout);
});

test('chapter selection changes setup defaults and wave queue', () => {
  const night = createPvZBoardState('night');

  assert.equal(night.chapterId, 'night');
  assert.equal(night.scenarioId, '2-01');
  assert.equal(night.chapterTitle, '夜幕救场');
  assert.equal(night.sun, 125);
  assert.equal(night.waveDurationMs, 40_000);
  assert.ok(night.spawnQueue.some((event) => event.id.startsWith('2-01-')));
  assert.ok(night.selectedCards.includes('cherryBomb'));
  assert.equal(night.mode, 'adventure');
});

test('roof setup only preselects cards that are actually placeable on roof', () => {
  const roof = createPvZBoardState('roof');

  assert.deepEqual(roof.selectedCards, ['flowerPot', 'cabbagePult']);
  assert.ok(roof.selectedCards.every((plantId) => roof.availablePlants.includes(plantId)));
});

test('setPvZChapter only works in setup phase', () => {
  const setup = createPvZBoardState();
  const switched = setPvZChapter(setup, 'roof');
  assert.equal(switched.chapterId, 'roof');
  assert.equal(switched.scenarioId, '5-01');
  assert.ok(switched.spawnQueue.some((event) => event.id.startsWith('5-01-')));

  const playing = startPvZBattle(setup);
  const ignored = setPvZChapter(playing, 'roof');
  assert.equal(ignored.chapterId, playing.chapterId);
});

test('battle start falls back to chapter default cards when setup cards are empty', () => {
  const state = { ...createPvZBoardState('pool'), selectedCards: [] };
  const started = startPvZBattle(state);

  assert.equal(started.phase, 'playing');
  assert.deepEqual(started.selectedCards, started.defaultCards);
});

test('resetPvZToSetup keeps chapter and carries selected cards', () => {
  let state = createPvZBoardState('fog');
  state = startPvZBattle(state);
  const withCustomCards = { ...state, selectedCards: ['sunflower', 'wallnut', 'snowPea'] };
  const setup = resetPvZToSetup(withCustomCards);

  assert.equal(setup.phase, 'setup');
  assert.equal(setup.chapterId, 'fog');
  assert.deepEqual(setup.selectedCards, ['sunflower', 'wallnut', 'snowPea']);
});

test('restartPvZBattle re-enters playing phase with chapter and selected cards', () => {
  const ended = {
    ...startPvZBattle(createPvZBoardState('roof')),
    phase: 'lost' as const,
    status: 'lost' as const,
    selectedCards: ['flowerPot', 'cabbagePult'],
  };
  const restarted = restartPvZBattle(ended);

  assert.equal(restarted.phase, 'playing');
  assert.equal(restarted.status, 'playing');
  assert.equal(restarted.chapterId, 'roof');
  assert.deepEqual(restarted.selectedCards, ['flowerPot', 'cabbagePult']);
});

test('setPvZScenario switches to lab or survival setup with scenario metadata', () => {
  const setup = createPvZBoardState();
  const lab = setPvZScenario(setup, 'lab-night-blackout');
  const survival = setPvZScenario(setup, 'survival-day-endurance');

  assert.equal(lab.mode, 'lab');
  assert.equal(lab.chapterId, 'night');
  assert.equal(lab.sun, 75);
  assert.ok(lab.scenarioObjective.includes('38'));
  assert.ok(lab.defaultCards.includes('sunShroom'));
  assert.equal(survival.mode, 'survival');
  assert.equal(survival.scenarioSegmentsTotal, 3);
  assert.equal(survival.waveDurationMs, 120_000);
  assert.equal(survival.scenarioSegmentDurationMs, 40_000);
});

test('lab scenario drains sun faster than adventure', () => {
  const lab = startPvZBattle(createPvZBoardState({ scenarioId: 'lab-night-blackout' }));
  const afterTick = tickPvZBoard(lab, 4_000);
  assert.ok(afterTick.sun < lab.sun - 0.8);
});

test('survival scenario keeps playing across segments before winning', () => {
  const survival = startPvZBattle(createPvZBoardState({ scenarioId: 'survival-day-endurance' }));
  const nearEnd: PvZBoardState = {
    ...survival,
    spawnQueue: [],
    zombies: [],
    elapsedMs: survival.scenarioSegmentDurationMs - 500,
    waveProgress: 0.99,
  };
  const next = tickPvZBoard(nearEnd, 1_000);
  assert.equal(next.status, 'playing');
  assert.equal(next.scenarioSegmentIndex, 2);
  assert.equal(next.waveProgress, 0);
  assert.ok(next.spawnQueue.length > 0);
});
