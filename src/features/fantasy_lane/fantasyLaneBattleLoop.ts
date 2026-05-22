import type { FantasyLaneRuntimeState } from './fantasyLaneTypes.ts';

export const FANTASY_LANE_FIXED_STEP_MS = 33;
export const FANTASY_LANE_MAX_CATCH_UP_STEPS = 4;

export interface FantasyLaneStepResult {
  nextState: FantasyLaneRuntimeState;
  consumedSteps: number;
  remainderMs: number;
}

export function stepFantasyLaneSimulation(
  currentState: FantasyLaneRuntimeState,
  elapsedMs: number,
  tick: (state: FantasyLaneRuntimeState, deltaMs: number) => FantasyLaneRuntimeState,
  options?: {
    fixedStepMs?: number;
    maxCatchUpSteps?: number;
  },
): FantasyLaneStepResult {
  const fixedStepMs = options?.fixedStepMs ?? FANTASY_LANE_FIXED_STEP_MS;
  const maxCatchUpSteps = options?.maxCatchUpSteps ?? FANTASY_LANE_MAX_CATCH_UP_STEPS;

  if (elapsedMs <= 0) {
    return {
      nextState: currentState,
      consumedSteps: 0,
      remainderMs: 0,
    };
  }

  let nextState = currentState;
  let remainingMs = elapsedMs;
  let consumedSteps = 0;

  while (remainingMs >= fixedStepMs && consumedSteps < maxCatchUpSteps) {
    nextState = tick(nextState, fixedStepMs);
    remainingMs -= fixedStepMs;
    consumedSteps += 1;
  }

  return {
    nextState,
    consumedSteps,
    remainderMs: remainingMs,
  };
}
