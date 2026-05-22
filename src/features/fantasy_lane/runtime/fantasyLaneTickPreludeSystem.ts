import type { FantasyLaneRuntimeState } from '../fantasyLaneTypes.ts';

export interface FantasyLaneTickPreludeDependencies {
  maxGold: number;
  overtimeDurationMs: number;
  goldCappedThreshold: number;
  getIncomePerSecond: (elapsedMs: number, gold: number, overtimeTriggered: boolean) => number;
  setPhaseMetadata: (state: FantasyLaneRuntimeState) => void;
  onOvertimeTriggered: (state: FantasyLaneRuntimeState) => void;
}

export function runFantasyLaneTickPrelude(
  state: FantasyLaneRuntimeState,
  deltaMs: number,
  dependencies: FantasyLaneTickPreludeDependencies,
) {
  state.elapsedMs += deltaMs;
  if (state.overtimeTriggered) {
    state.overtimeRemainingMs = Math.max(0, state.overtimeRemainingMs - deltaMs);
  }

  Object.keys(state.unitCooldowns).forEach((unitId) => {
    state.unitCooldowns[unitId] = Math.max(0, state.unitCooldowns[unitId] - deltaMs);
  });
  state.heroSkill.remainingMs = Math.max(0, state.heroSkill.remainingMs - deltaMs);
  state.tacticalSkill.remainingMs = Math.max(0, state.tacticalSkill.remainingMs - deltaMs);
  state.globalSpawnCooldownMs = Math.max(0, state.globalSpawnCooldownMs - deltaMs);
  state.enemySpawnCooldownMs = Math.max(0, state.enemySpawnCooldownMs - deltaMs);
  state.effects = state.effects
    .map((effect) => ({ ...effect, remainingMs: effect.remainingMs - deltaMs }))
    .filter((effect) => effect.remainingMs > 0);
  state.impacts = state.impacts
    .map((impact) => ({ ...impact, remainingMs: impact.remainingMs - deltaMs }))
    .filter((impact) => impact.remainingMs > 0);

  if (state.activeWarning) {
    state.activeWarning.remainingMs -= deltaMs;
    if (state.activeWarning.remainingMs <= 0) {
      state.activeWarning = null;
    }
  }

  state.gold = Math.min(
    dependencies.maxGold,
    state.gold + dependencies.getIncomePerSecond(state.elapsedMs, state.gold, state.overtimeTriggered) * (deltaMs / 1000),
  );
  if (state.gold >= dependencies.goldCappedThreshold) {
    state.stats.goldCappedMs += deltaMs;
  }

  dependencies.setPhaseMetadata(state);

  if (!state.overtimeTriggered && state.elapsedMs >= state.battleTimeLimitMs) {
    state.overtimeTriggered = true;
    state.overtimeRemainingMs = dependencies.overtimeDurationMs;
    dependencies.onOvertimeTriggered(state);
  }
}
