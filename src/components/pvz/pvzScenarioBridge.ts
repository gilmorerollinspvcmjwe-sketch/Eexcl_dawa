import type { PvZBoardState, PvZScenarioId } from '../../features/pvz/pvzTypes';

type ScenarioSelectionHandler = (scenarioId: PvZScenarioId) => void;

const listeners = new Set<ScenarioSelectionHandler>();
let latestScenarioSelection: PvZScenarioId | null = null;
let cachedPvZContext: PvZBoardState | null = null;

export function emitPvZScenarioSelection(scenarioId: PvZScenarioId) {
  latestScenarioSelection = scenarioId;
  listeners.forEach((handler) => handler(scenarioId));
}

export function subscribePvZScenarioSelection(handler: ScenarioSelectionHandler) {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

export function getLatestPvZScenarioSelection(): PvZScenarioId | null {
  return latestScenarioSelection;
}

export function cachePvZContext(state: PvZBoardState) {
  cachedPvZContext = state;
}

export function getCachedPvZContext(): PvZBoardState | null {
  return cachedPvZContext;
}
