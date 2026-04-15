import test from 'node:test';
import assert from 'node:assert/strict';

import { createPacmanBoardState } from '../src/features/pacman/pacmanBoardState.ts';
import {
  calculatePinkyTarget,
  checkGhostCollision,
  getElroyPhase,
  updateGhostPosition,
} from '../src/features/pacman/pacmanAi.ts';
import { shouldTriggerFruit } from '../src/features/pacman/pacmanFruit.ts';
import {
  startGame,
  pauseGame,
  resumeGame,
} from '../src/features/pacman/pacmanMovement.ts';
import {
  applyPacmanEscapeKey,
  tickPacmanState,
} from '../src/features/pacman/pacmanSession.ts';
import { applyScoreBonuses } from '../src/features/pacman/pacmanGameLogic.ts';
import {
  getAllPacks,
  getLevelMeta,
  getPackDefinition,
} from '../src/features/pacman/pacmanMapRegistry.ts';
import { hasCompletedPacmanLevelGoal } from '../src/features/pacman/pacmanGoalRules.ts';
import {
  consumePendingPacmanGuideTab,
  getPacmanLaunchGuideTab,
  getPacmanLaunchReturnTarget,
  setPendingPacmanGuideTab,
} from '../src/features/pacman/pacmanLaunchIntent.ts';

test('pauseGame marks paused status and resumeGame restores playing status', () => {
  const started = startGame(createPacmanBoardState());
  const paused = pauseGame(started);
  const resumed = resumeGame(paused);

  assert.equal(paused.status, 'paused');
  assert.equal(paused.isPaused, true);
  assert.equal(resumed.status, 'playing');
  assert.equal(resumed.isPaused, false);
});

test('selected tutorial pack changes runtime tuning instead of staying on arcade defaults', () => {
  const tutorialState = createPacmanBoardState({ packId: 'tutorial', level: 1 });

  assert.equal(tutorialState.levelTuning.frightenedDurationMs, 8000);
  assert.equal(tutorialState.levelTuning.ghostSpeed, 0.6);
});

test('fruit_rush and one_life packs are registered as real selectable content packs', () => {
  const packIds = getAllPacks().map((pack) => pack.packId);

  assert.ok(packIds.includes('fruit_rush'));
  assert.ok(packIds.includes('one_life'));
  assert.equal(getPackDefinition('fruit_rush')?.packType, 'challenge');
  assert.equal(getPackDefinition('one_life')?.packType, 'challenge');
});

test('fruit_rush opens on a non-classic maze and uses fruit collection as the scripted goal', () => {
  const meta = getLevelMeta('fruit_rush', 1);
  const state = {
    ...createPacmanBoardState({ packId: 'fruit_rush', level: 1 }),
    status: 'playing' as const,
    pelletsCollectedTotal: 90,
    fruitsCollected: 0,
  };

  assert.equal(meta?.mazeId, 'fruit_rush');
  assert.notEqual(meta?.mazeId, 'classic');
  assert.equal(Reflect.get(meta?.completionRule ?? {}, 'fruitsCollected'), 1);
  assert.equal(hasCompletedPacmanLevelGoal(state, meta), false);
  assert.equal(hasCompletedPacmanLevelGoal({ ...state, fruitsCollected: 1 }, meta), true);
});

test('one_life pack starts with a single life and ignores the 10000 score bonus life', () => {
  const oneLifeState = createPacmanBoardState({ packId: 'one_life', level: 1 });
  const scoredState = applyScoreBonuses({
    ...oneLifeState,
    score: 10200,
    extraLifeAwarded: false,
  });

  assert.equal(oneLifeState.lives, 1);
  assert.equal(scoredState.lives, 1);
  assert.equal(scoredState.extraLifeAwarded, false);
});

test('applyScoreBonuses grants the 10000 point bonus life only once', () => {
  const baseState = {
    ...createPacmanBoardState({ packId: 'arcade', level: 1 }),
    score: 9950,
    lives: 3,
    extraLifeAwarded: false,
  };

  const firstReward = applyScoreBonuses({
    ...baseState,
    score: 10050,
  });
  const secondReward = applyScoreBonuses({
    ...firstReward,
    score: 14200,
  });

  assert.equal(firstReward.lives, 4);
  assert.equal(firstReward.extraLifeAwarded, true);
  assert.equal(secondReward.lives, 4);
});

test('Elroy speed bonus is applied to Blinky movement at runtime', () => {
  const baseState = {
    ...createPacmanBoardState({ packId: 'arcade', level: 5 }),
    status: 'playing' as const,
    pelletsRemaining: 120,
    pacman: {
      ...createPacmanBoardState({ packId: 'arcade', level: 5 }).pacman,
      row: 10,
      col: 20,
      pixelY: 10,
      pixelX: 20,
      direction: 'right' as const,
    },
  };
  const blinky = {
    ...baseState.ghosts[0],
    state: 'chase' as const,
    direction: 'right' as const,
    row: 10,
    col: 10,
    pixelY: 10,
    pixelX: 10,
  };

  const normalMove = updateGhostPosition(baseState, blinky, 1000);
  const elroyState = {
    ...baseState,
    pelletsRemaining: 40,
  };
  const elroyMove = updateGhostPosition(elroyState, blinky, 1000);

  assert.equal(getElroyPhase(elroyState), 'elroy1');
  assert.ok(elroyMove.pixelX > normalMove.pixelX);
});

test('Pinky upward target and tutorial copy both describe the original upper-left bug', () => {
  const state = {
    ...createPacmanBoardState({ packId: 'tutorial', level: 6 }),
    pacman: {
      ...createPacmanBoardState({ packId: 'tutorial', level: 6 }).pacman,
      row: 14,
      col: 12,
      pixelY: 14,
      pixelX: 12,
      direction: 'up' as const,
    },
  };
  const meta = getLevelMeta('tutorial', 6);
  const target = calculatePinkyTarget(state);

  assert.deepEqual(target, { row: 10, col: 8 });
  assert.match(meta?.startHint || '', /左前方4格/);
});

test('tutorial scripted goals can complete a lesson before full clear', () => {
  const meta = getLevelMeta('tutorial', 2);
  const incompleteState = {
    ...createPacmanBoardState({ packId: 'tutorial', level: 2 }),
    status: 'playing' as const,
    pelletsCollectedTotal: 39,
    tunnelUses: 1,
  };
  const completeState = {
    ...incompleteState,
    pelletsCollectedTotal: 40,
  };

  assert.equal(hasCompletedPacmanLevelGoal(incompleteState, meta), false);
  assert.equal(hasCompletedPacmanLevelGoal(completeState, meta), true);
});

test('second fruit trigger does not respawn forever after the second fruit already expired', () => {
  const baseState = createPacmanBoardState({ level: 1 });
  const stateAfterSecondFruitExpired = {
    ...baseState,
    pelletsCollectedTotal: 200,
    fruitsCollected: 1,
    fruitSpawnsTriggered: 2,
    fruit: {
      ...baseState.fruit!,
      isActive: false,
      spawnTimeMs: 12000,
      remainingMs: 0,
    },
  };

  assert.equal(shouldTriggerFruit(stateAfterSecondFruitExpired as never), false);
});

test('ghost collision uses precise pixel distance instead of rounded grid cells only', () => {
  const state = createPacmanBoardState();
  const collisionState = {
    ...state,
    pacman: {
      ...state.pacman,
      row: 10,
      col: 10,
      pixelY: 10,
      pixelX: 10.49,
    },
    ghosts: [
      {
        ...state.ghosts[0],
        state: 'chase' as const,
        row: 10,
        col: 11,
        pixelY: 10,
        pixelX: 10.51,
      },
      ...state.ghosts.slice(1),
    ],
  };

  assert.equal(checkGhostCollision(collisionState).collided, true);
});

test('tickPacmanState advances death animation without growing elapsed time', () => {
  const deadState = {
    ...createPacmanBoardState(),
    status: 'dead' as const,
    elapsedMs: 5000,
    deathAnimationMs: 1000,
  };

  const next = tickPacmanState(deadState, 100);
  assert.equal(next.elapsedMs, 5000);
  assert.equal(next.deathAnimationMs, 900);
});

test('tickPacmanState keeps timer frozen while idle paused won or lost', () => {
  const idleState = createPacmanBoardState();
  const pausedState = pauseGame(startGame(createPacmanBoardState()));
  const wonState = { ...createPacmanBoardState(), status: 'won' as const, elapsedMs: 6000 };
  const lostState = { ...createPacmanBoardState(), status: 'lost' as const, elapsedMs: 7000 };

  assert.equal(tickPacmanState(idleState, 250).elapsedMs, 0);
  assert.equal(tickPacmanState(pausedState, 250).elapsedMs, pausedState.elapsedMs);
  assert.equal(tickPacmanState(wonState, 250).elapsedMs, 6000);
  assert.equal(tickPacmanState(lostState, 250).elapsedMs, 7000);
});

test('applyPacmanEscapeKey pauses active play, resumes paused play, and returns to setup outside runs', () => {
  const playing = startGame(createPacmanBoardState());
  const paused = pauseGame(playing);
  const won = { ...createPacmanBoardState(), status: 'won' as const };

  const pausedResult = applyPacmanEscapeKey(playing);
  const resumedResult = applyPacmanEscapeKey(paused);
  const exitedResult = applyPacmanEscapeKey(won);

  assert.equal(pausedResult.shouldExit, false);
  assert.equal(pausedResult.shouldReturnToSetup, false);
  assert.equal(pausedResult.nextState.status, 'paused');
  assert.equal(resumedResult.shouldExit, false);
  assert.equal(resumedResult.shouldReturnToSetup, false);
  assert.equal(resumedResult.nextState.status, 'playing');
  assert.equal(exitedResult.shouldExit, false);
  assert.equal(exitedResult.shouldReturnToSetup, true);
  assert.equal(exitedResult.nextState.status, 'won');
});

test('practice launch intent can distinguish returning to guide versus returning to source level', () => {
  const guideIntent = {
    packId: 'tutorial' as const,
    levelNumber: 4,
    mode: 'practice' as const,
    practiceId: 'energizer_chain' as const,
    returnTarget: 'guide' as const,
    guideTab: 'practice' as const,
  };
  const sourceIntent = {
    packId: 'tutorial' as const,
    levelNumber: 4,
    mode: 'practice' as const,
    practiceId: 'energizer_chain' as const,
    returnTarget: 'source_level' as const,
    sourcePackId: 'arcade' as const,
    sourceLevel: 5,
  };

  assert.equal(getPacmanLaunchReturnTarget(guideIntent), 'guide');
  assert.equal(getPacmanLaunchGuideTab(guideIntent), 'practice');
  assert.equal(getPacmanLaunchReturnTarget(sourceIntent), 'source_level');
  assert.equal(getPacmanLaunchGuideTab(sourceIntent), 'practice');
});

test('guide tab resume state is stored and consumed once', () => {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: localStorageMock },
    configurable: true,
  });

  setPendingPacmanGuideTab('practice');

  assert.equal(consumePendingPacmanGuideTab(), 'practice');
  assert.equal(consumePendingPacmanGuideTab(), null);
});
