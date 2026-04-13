# Checklist

## Runtime
- [x] Wave state machine starts from wave 0 and advances correctly.
- [x] Interval timing behavior is deterministic and tested.
- [x] Final wave completion requires board clear before victory.
- [x] Zombie attack targeting near plant boundaries is stable.
- [x] Zombie movement clamps correctly around blocking plants.
- [x] Lawn mower trigger and one-time lane lifecycle are stable.
- [x] Lane breach without mower correctly results in loss.

## UI Integration
- [x] Pause / speed / shovel controls are connected from HUD to runtime.
- [x] Sky sun-drop collection is connected on board interaction.
- [x] Shovel remove action is connected on board cell interaction.
- [x] PvZ context cache preserves latest board/scenario state across sheet switches.

## Accessibility and Localization
- [x] Board cells expose localized `aria-label`.
- [x] Mode/chapter/scenario selections expose meaningful ARIA state.
- [x] Tab semantics use `aria-selected` without invalid pressed state.
- [x] `.pvz-cell` has keyboard `:focus-visible` outline support.
- [x] Newly-added English UI labels were localized for PvZ screens.

## Tests and Build
- [x] `tests/pvzBoardState.test.ts` passes.
- [x] `tests/pvzWaveSystem.test.ts` passes.
- [x] `tests/pvzLawnMower.test.ts` passes.
- [x] `tests/pvzZombieAttack.test.ts` passes.
- [x] `npm test` passes.
- [x] `npm run build` passes.
