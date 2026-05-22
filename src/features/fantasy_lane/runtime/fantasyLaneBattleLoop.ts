import type { FantasyLaneProgressData } from '../fantasyLaneProgressStorage.ts';
import type { FantasyLaneLevelDefinition, FantasyLaneRuntimeState } from '../fantasyLaneTypes.ts';
import type { FantasyLaneTickPreludeDependencies } from './fantasyLaneTickPreludeSystem.ts';
import { runFantasyLaneTickPrelude } from './fantasyLaneTickPreludeSystem.ts';

export interface FantasyLaneBattleSystems {
  setPhaseMetadata: (state: FantasyLaneRuntimeState) => void;
  processScheduledEvents: (state: FantasyLaneRuntimeState) => void;
  processPlayerQueue: (state: FantasyLaneRuntimeState) => void;
  processImpacts: (state: FantasyLaneRuntimeState, deltaMs: number) => void;
  processProjectiles: (state: FantasyLaneRuntimeState, deltaMs: number) => void;
  processBurnline: (state: FantasyLaneRuntimeState, deltaMs: number) => void;
  processSideLayer: (state: FantasyLaneRuntimeState, side: 'player' | 'enemy', layer: 'ground' | 'air', deltaMs: number) => void;
  pruneUnits: (state: FantasyLaneRuntimeState) => void;
  processBossPhases: (state: FantasyLaneRuntimeState) => void;
  updateBattleMetrics: (state: FantasyLaneRuntimeState, deltaMs: number) => void;
}

export interface FantasyLaneBattleFinalize {
  getLevel: (state: FantasyLaneRuntimeState) => FantasyLaneLevelDefinition;
  maybeFinalizeBattle: (
    state: FantasyLaneRuntimeState,
    level: FantasyLaneLevelDefinition,
    progress: FantasyLaneProgressData,
  ) => FantasyLaneRuntimeState;
  emptyProgress: FantasyLaneProgressData;
}

export interface FantasyLaneBattleLoopDependencies {
  cloneStateForMutation: (state: FantasyLaneRuntimeState) => FantasyLaneRuntimeState;
  prelude: FantasyLaneTickPreludeDependencies;
  systems: FantasyLaneBattleSystems;
  finalize: FantasyLaneBattleFinalize;
}

export interface FantasyLaneBattleLoop {
  step: (state: FantasyLaneRuntimeState, deltaMs: number) => FantasyLaneRuntimeState;
}

export function createFantasyLaneBattleLoop(dependencies: FantasyLaneBattleLoopDependencies): FantasyLaneBattleLoop {
  const step = (state: FantasyLaneRuntimeState, deltaMs: number): FantasyLaneRuntimeState => {
    if (state.phase !== 'playing') return state;

    const next = dependencies.cloneStateForMutation(state);
    runFantasyLaneTickPrelude(next, deltaMs, dependencies.prelude);

    dependencies.systems.processScheduledEvents(next);
    dependencies.systems.processPlayerQueue(next);
    dependencies.systems.processImpacts(next, deltaMs);
    dependencies.systems.processProjectiles(next, deltaMs);
    dependencies.systems.processBurnline(next, deltaMs);
    dependencies.systems.processSideLayer(next, 'player', 'ground', deltaMs);
    dependencies.systems.processSideLayer(next, 'enemy', 'ground', deltaMs);
    dependencies.systems.processSideLayer(next, 'player', 'air', deltaMs);
    dependencies.systems.processSideLayer(next, 'enemy', 'air', deltaMs);
    dependencies.systems.pruneUnits(next);
    dependencies.systems.processBossPhases(next);
    dependencies.systems.updateBattleMetrics(next, deltaMs);
    dependencies.systems.setPhaseMetadata(next);

    const level = dependencies.finalize.getLevel(next);
    return dependencies.finalize.maybeFinalizeBattle(next, level, dependencies.finalize.emptyProgress);
  };

  return { step };
}
