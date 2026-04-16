import type { FantasyLaneImpactEffect, FantasyLaneProjectile, FantasyLaneRuntimeState } from '../fantasyLaneTypes.ts';

function cloneProjectile(projectile: FantasyLaneProjectile): FantasyLaneProjectile {
  return { ...projectile };
}

function cloneImpact(impact: FantasyLaneImpactEffect): FantasyLaneImpactEffect {
  return { ...impact };
}

// Prepare a mutable simulation copy without deep-cloning every immutable event payload each tick.
export function cloneRuntimeStateForMutation(state: FantasyLaneRuntimeState): FantasyLaneRuntimeState {
  return {
    ...state,
    queue: [...state.queue],
    unitCooldowns: { ...state.unitCooldowns },
    heroSkill: { ...state.heroSkill },
    tacticalSkill: { ...state.tacticalSkill },
    units: state.units.map((unit) => ({
      ...unit,
      combatState: unit.combatState ? { ...unit.combatState } : undefined,
    })),
    projectiles: state.projectiles.map(cloneProjectile),
    impacts: state.impacts.map(cloneImpact),
    effects: state.effects.map((effect) => ({ ...effect })),
    scheduledEvents: [...state.scheduledEvents],
    triggeredBossPhases: [...state.triggeredBossPhases],
    activeWarning: state.activeWarning ? { ...state.activeWarning } : null,
    debugEvents: [...state.debugEvents],
    runtimeEvents: [...state.runtimeEvents],
    phaseTimeline: state.phaseTimeline.map((entry) => ({ ...entry })),
    stats: { ...state.stats },
  };
}
