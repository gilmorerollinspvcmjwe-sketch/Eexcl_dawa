import type {
  FantasyLaneBattleSnapshot,
  FantasyLaneRuntimeDebugSnapshot,
  FantasyLaneRuntimeState,
  FantasyLaneTacticalSkillId,
  FantasyLaneHeroId,
} from '../fantasyLaneTypes.ts';
import type {
  FantasyLaneDebugSnapshot,
  FantasyLaneRuntimeStatsSnapshot,
} from '../fantasyLaneProgressStorage.ts';
import { getFantasyLaneUnitBuckets } from './fantasyLaneUnitBuckets.ts';

const MAX_DEBUG_EVENTS = 10;
const MAX_RUNTIME_EVENTS = 16;

function asArray<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : [];
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildFantasyLaneDeterministicSeed(
  levelId: string,
  heroId: FantasyLaneHeroId,
  tacticalId: FantasyLaneTacticalSkillId,
  loadout: string[],
) {
  const key = [levelId, heroId, tacticalId, ...loadout].join('|');
  const hash = hashString(key);
  return (hash % 900_000) + 100_000;
}

export function buildFantasyLaneBattleSnapshot(state: FantasyLaneRuntimeState): FantasyLaneBattleSnapshot {
  const units = asArray(state.units);
  const queue = asArray(state.queue);
  const buckets = getFantasyLaneUnitBuckets(units);
  return {
    version: 'v1',
    levelId: state.selectedLevelId,
    chapterId: state.selectedChapterId,
    phase: state.phase,
    phaseLabel: state.phaseLabel,
    pressureLabel: state.pressureLabel,
    elapsedMs: state.elapsedMs,
    rngSeed: state.rngSeed,
    gold: state.gold,
    activePop: state.activePop,
    popLimit: state.popLimit,
    queueLength: queue.length,
    queueLimit: state.queueLimit,
    playerBaseHp: state.playerBaseHp,
    enemyBaseHp: state.enemyBaseHp,
    frontline: state.frontline,
    airControl: state.airControl,
    clashX: state.clashX,
    congestion: state.congestion,
    heroSkillRemainingMs: state.heroSkill.remainingMs,
    tacticalSkillRemainingMs: state.tacticalSkill.remainingMs,
    bucketSummary: buckets.summary,
  };
}

export function buildFantasyLaneRuntimeDebugSnapshot(state: FantasyLaneRuntimeState): FantasyLaneRuntimeDebugSnapshot {
  const units = asArray(state.units);
  const queue = asArray(state.queue);
  const debugEvents = asArray(state.debugEvents);
  const runtimeEvents = asArray(state.runtimeEvents);
  const phaseTimeline = asArray(state.phaseTimeline);
  const buckets = getFantasyLaneUnitBuckets(units);
  return {
    version: 'v1',
    levelId: state.selectedLevelId,
    phase: state.phase,
    rngSeed: state.rngSeed,
    currentPhaseId: state.currentPhaseId,
    currentBossPhaseId: state.currentBossPhaseId,
    warningText: state.activeWarning?.text ?? null,
    queue: [...queue],
    unitBuckets: buckets.summary,
    recentDebugEvents: debugEvents.slice(-MAX_DEBUG_EVENTS),
    recentRuntimeEvents: runtimeEvents.slice(-MAX_RUNTIME_EVENTS),
    phaseTimeline: phaseTimeline.map((entry) => ({ ...entry })),
  };
}

export function buildFantasyLaneRuntimeStatsSnapshot(state: FantasyLaneRuntimeState): FantasyLaneRuntimeStatsSnapshot {
  const averageEngageTimeMs =
    state.stats.engagedUnits > 0 ? Math.round(state.stats.totalEngageDelayMs / state.stats.engagedUnits) : 0;

  return {
    summoned: state.stats.summoned,
    defeated: state.stats.defeated,
    queueBlocked: state.stats.queueBlocked,
    projectilesFired: state.stats.projectilesFired,
    aoeHits: state.stats.aoeHits,
    frontlineSummons: state.stats.frontlineSummons,
    antiAirSummons: state.stats.antiAirSummons,
    aoeSummons: state.stats.aoeSummons,
    goldSpent: state.stats.goldSpent,
    goldCappedMs: state.stats.goldCappedMs,
    congestionMs: state.stats.congestionMs,
    engagedUnits: state.stats.engagedUnits,
    totalEngageDelayMs: state.stats.totalEngageDelayMs,
    heroSkillCast: state.stats.heroSkillCast,
    tacticalSkillCast: state.stats.tacticalSkillCast,
    lastSkillCastAtMs: state.stats.lastSkillCastAtMs,
    averageEngageTimeMs,
  };
}

export function buildFantasyLaneProgressDebugSnapshot(state: FantasyLaneRuntimeState): FantasyLaneDebugSnapshot {
  const debugEvents = asArray(state.debugEvents);
  const triggeredBossPhases = asArray(state.triggeredBossPhases);
  return {
    warnings: [
      ...debugEvents.slice(-4).map((event) => event.text),
      ...(state.activeWarning ? [state.activeWarning.text] : []),
    ].slice(-5),
    congestionPeak: state.congestion,
    frontlineRange: {
      min: state.frontline,
      max: state.frontline,
    },
    bossPhaseIds: [...triggeredBossPhases],
  };
}
