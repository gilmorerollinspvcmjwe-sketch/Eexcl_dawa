import { useEffect, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  FANTASY_LANE_FIXED_STEP_MS,
  FANTASY_LANE_MAX_CATCH_UP_STEPS,
  stepFantasyLaneSimulation,
} from '../../features/fantasy_lane/fantasyLaneBattleLoop.ts';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';

interface UseFantasyLaneBattleLoopOptions {
  stateRef: MutableRefObject<FantasyLaneRuntimeState>;
  setState: Dispatch<SetStateAction<FantasyLaneRuntimeState>>;
  tick: (state: FantasyLaneRuntimeState, deltaMs: number) => FantasyLaneRuntimeState;
}

export function useFantasyLaneBattleLoop({ stateRef, setState, tick }: UseFantasyLaneBattleLoopOptions) {
  const frameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const carryOverMsRef = useRef(0);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const previousTimestamp = previousTimestampRef.current ?? timestamp;
      const elapsedMs = Math.min(250, timestamp - previousTimestamp);
      previousTimestampRef.current = timestamp;

      const result = stepFantasyLaneSimulation(
        stateRef.current,
        carryOverMsRef.current + elapsedMs,
        tick,
        {
          fixedStepMs: FANTASY_LANE_FIXED_STEP_MS,
          maxCatchUpSteps: FANTASY_LANE_MAX_CATCH_UP_STEPS,
        },
      );

      carryOverMsRef.current = result.remainderMs;

      if (result.consumedSteps > 0 && result.nextState !== stateRef.current) {
        setState(result.nextState);
      }

      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      previousTimestampRef.current = null;
      carryOverMsRef.current = 0;
    };
  }, [setState, stateRef, tick]);
}
