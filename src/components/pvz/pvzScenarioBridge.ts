import type { PvZScenarioId } from '../../features/pvz/pvzTypes';

type ScenarioSelectionHandler = (scenarioId: PvZScenarioId) => void;

const listeners = new Set<ScenarioSelectionHandler>();

export function emitPvZScenarioSelection(scenarioId: PvZScenarioId) {
  listeners.forEach((handler) => handler(scenarioId));
}

export function subscribePvZScenarioSelection(handler: ScenarioSelectionHandler) {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}
