# Tasks

## Status Summary
- [x] Runtime fixes for wave progression, zombie attack targeting, and lawn mower trigger/breach flow.
- [x] PvZ UI integration for pause/speed/shovel controls, sun-drop collection, and shovel removal interaction.
- [x] Cross-sheet PvZ context cache wired through `pvzScenarioBridge`.
- [x] PvZ accessibility pass for board focus style, cell labels, and selection state semantics.
- [x] PvZ tests aligned with current 100-level scenario contract and runtime behavior.
- [x] Full verification completed (`npm test`, `npm run build`).

## Completed Work Breakdown

### Track A: Runtime
- [x] `src/features/pvz/pvzBoardState.ts`
- [x] Wave start/index transition and interval timing stabilized.
- [x] Lawn mower trigger, movement, one-time use, and breach loss flow stabilized.
- [x] Zombie attack target/collision edge handling stabilized.

### Track B: UI / A11y
- [x] `src/components/pvz/PvZGameSheet.tsx`
- [x] `src/components/pvz/PvZHud.tsx`
- [x] `src/components/pvz/PvZBoard.tsx`
- [x] `src/components/pvz/PvZLabSheet.tsx`
- [x] `src/components/pvz/pvzScenarioBridge.ts`
- [x] `src/styles/pvz.css`
- [x] HUD actions are connected to runtime actions.
- [x] Board click actions are connected to `collectSunDrop` and `removePlantWithShovel`.
- [x] Added localized aria labels for interactive PvZ controls.
- [x] Corrected tab semantics (`role="tab"` + `aria-selected`, removed incorrect `aria-pressed` on tabs).

### Track C: Tests / Contract
- [x] `tests/pvzBoardState.test.ts`
- [x] `tests/pvzWaveSystem.test.ts`
- [x] `tests/pvzLawnMower.test.ts`
- [x] `tests/pvzZombieAttack.test.ts`
- [x] Removed stale assumptions from old scenario IDs and old default loadouts.
- [x] Updated wave index/state expectations to current runtime semantics.
- [x] Updated mower and zombie attack tests to realistic breach/attack timing.

## Verification
- [x] `npm test` passed (all tests green).
- [x] `npm run build` passed.
