/* 奇幻战线运行时主循环。这里把行为协议、软碰撞、投射物、经济和统计统一收口到规则驱动流程。 */

import type { WorkbookStatusSummary } from '../../types/workbook.ts';
import {
  FANTASY_LANE_CHAPTERS,
  getFantasyLaneChapters,
  getFantasyLaneLevelById,
  getFantasyLaneLevels,
} from './fantasyLaneLevelCatalog.ts';
import {
  FANTASY_LANE_HEROES,
  FANTASY_LANE_HERO_MAP,
  FANTASY_LANE_TACTICAL_MAP,
  FANTASY_LANE_TACTICAL_SKILLS,
  FANTASY_LANE_UNIT_MAP,
  FANTASY_LANE_UNITS,
} from './fantasyLaneUnitRegistry.ts';
import {
  FANTASY_LANE_RUNTIME_CONSTANTS,
  clamp,
  getAirControlDelta as getAirControlDeltaFromUnits,
  getAoeFalloff,
  getBattleCenter as getBattleCenterFromFrontlines,
  getBossPhaseRuntimeLabel,
  getBossSkillRule,
  getCombatProtocol,
  getDamageMultiplier as getDamageMultiplierFromMatrix,
  getEnemySpawnX as getEnemySpawnXFromRules,
  getGroundFrontline as getGroundFrontlineFromUnits,
  getIncomePerSecondByRules,
  getLaneYBounds,
  getPlayerSpawnX as getPlayerSpawnXFromRules,
  getRetargetCooldownMs,
  getSoftCollisionProfile,
  normalizeSpawnLane,
} from './fantasyLaneRuntimeRules.ts';
import type {
  FantasyLaneBattleResult,
  FantasyLaneBattleRewards,
  FantasyLaneBattleStats,
  FantasyLaneCombatRole,
  FantasyLaneDebugEvent,
  FantasyLaneEffectState,
  FantasyLaneHeroDefinition,
  FantasyLaneHeroId,
  FantasyLaneImpactEffect,
  FantasyLaneIntentMode,
  FantasyLaneLayer,
  FantasyLaneLevelDefinition,
  FantasyLanePressure,
  FantasyLanePhaseDef,
  FantasyLanePhaseTimelineEntry,
  FantasyLaneProjectile,
  FantasyLaneRuntimeEvent,
  FantasyLaneRuntimeAdapter,
  FantasyLaneRuntimeState,
  FantasyLaneScheduledEvent,
  FantasyLaneSide,
  FantasyLaneTacticalSkillDefinition,
  FantasyLaneTacticalSkillId,
  FantasyLaneUnitCombatState,
  FantasyLaneUnitDefinition,
  FantasyLaneUnitInstance,
} from './fantasyLaneTypes.ts';
import { FANTASY_LANE_IDS } from './fantasyLaneTypes.ts';
import type { FantasyLaneProgressData } from './fantasyLaneProgressStorage.ts';
import {
  createDefaultFantasyLaneLoadoutPresets,
  getFantasyLaneUnitBattleBonus,
  isUnitUnlocked,
  loadFantasyLaneProgress,
} from './fantasyLaneProgressStorage.ts';
import { createFantasyLaneBattleLoop } from './runtime/fantasyLaneBattleLoop.ts';
import { cloneRuntimeStateForMutation } from './runtime/fantasyLaneStateMutation.ts';
import { buildFantasyLaneDeterministicSeed } from './runtime/fantasyLaneTelemetry.ts';
import { getFantasyLaneUnitBuckets } from './runtime/fantasyLaneUnitBuckets.ts';

type TargetSelection = {
  target: FantasyLaneUnitInstance | null;
  targetDefinition: FantasyLaneUnitDefinition | null;
  distance: number;
  score: number;
};

type UnitIntent = {
  mode: FantasyLaneIntentMode;
  target: FantasyLaneUnitInstance | null;
  targetDefinition: FantasyLaneUnitDefinition | null;
  targetBase: boolean;
  distance: number;
  desiredX: number;
  desiredY: number;
};

const DEBUG_EVENT_LIMIT = 48;
const RUNTIME_EVENT_LIMIT = 120;

// 复制运行时状态，保证 tick 仍然是纯函数出口。

// 统一初始化技能冷却状态。
function createSkillState(definition: FantasyLaneHeroDefinition | FantasyLaneTacticalSkillDefinition) {
  return {
    id: definition.id,
    name: definition.name,
    summary: definition.summary,
    cooldownMs: definition.cooldownMs,
    remainingMs: 0,
  };
}

// 给每个单位创建默认战斗状态，避免运行中判断一堆 undefined。
function createCombatState(): FantasyLaneUnitCombatState {
  return {
    currentTargetId: null,
    pendingTargetId: null,
    pendingTargetBase: false,
    windupRemainingMs: 0,
    retargetLockMs: 0,
    firstContactAtMs: null,
  };
}

// 确保手工构造的测试单位也能拿到完整战斗状态。
function ensureCombatState(unit: FantasyLaneUnitInstance) {
  if (!unit.combatState) {
    unit.combatState = createCombatState();
  }
  return unit.combatState;
}

// 统一创建统计对象，确保新增统计字段有稳定初值。
function createBattleStats(): FantasyLaneBattleStats {
  return {
    summoned: 0,
    enemySummoned: 0,
    defeated: 0,
    heroSkillCast: 0,
    tacticalSkillCast: 0,
    queueBlocked: 0,
    projectilesFired: 0,
    aoeHits: 0,
    frontlineSummons: 0,
    antiAirSummons: 0,
    aoeSummons: 0,
    goldSpent: 0,
    goldCappedMs: 0,
    congestionMs: 0,
    levelPhasesEntered: 0,
    bossPhasesEntered: 0,
    bossSkillActivations: 0,
    bossPhaseSummons: 0,
    scriptedModifiersApplied: 0,
    engagedUnits: 0,
    totalEngageDelayMs: 0,
    lastSkillCastAtMs: null,
  };
}

// 给阶段时间线创建统一条目，供后续复盘或调试直接复用。
function createPhaseTimelineEntry(
  source: FantasyLanePhaseTimelineEntry['source'],
  phaseId: string,
  label: string,
  pressure: FantasyLanePressure,
  startedAtMs: number,
  options?: {
    bossPhaseId?: string;
    thresholdPercent?: number;
  },
): FantasyLanePhaseTimelineEntry {
  return {
    id: `${source}-${phaseId}-${startedAtMs}`,
    source,
    phaseId,
    label,
    pressure,
    startedAtMs,
    endedAtMs: null,
    bossPhaseId: options?.bossPhaseId,
    thresholdPercent: options?.thresholdPercent,
  };
}

// 关闭同来源的上一段时间线，避免阶段区间无限延长。
function closePhaseTimelineEntry(
  state: FantasyLaneRuntimeState,
  source: FantasyLanePhaseTimelineEntry['source'],
  endedAtMs: number,
) {
  for (let index = state.phaseTimeline.length - 1; index >= 0; index -= 1) {
    const entry = state.phaseTimeline[index];
    if (entry.source === source && entry.endedAtMs === null) {
      entry.endedAtMs = endedAtMs;
      return;
    }
  }
}

// 统一写入结构化运行时事件，为后续复盘保留机器可读轨迹。
function pushRuntimeEvent(
  state: FantasyLaneRuntimeState,
  event: Omit<FantasyLaneRuntimeEvent, 'id' | 'atMs'> & { atMs?: number },
) {
  const atMs = event.atMs ?? state.elapsedMs;
  state.runtimeEvents.push({
    id: `runtime-${atMs}-${state.runtimeEvents.length + 1}-${event.type}`,
    atMs,
    ...event,
  });
  if (state.runtimeEvents.length > RUNTIME_EVENT_LIMIT) {
    state.runtimeEvents.splice(0, state.runtimeEvents.length - RUNTIME_EVENT_LIMIT);
  }
}

// 统一给 Boss 阶段技能生成可读标签，规则缺省时也保留降级文本。
function getBossSkillLabel(skillId: string) {
  return getBossSkillRule(skillId)?.label ?? skillId;
}

// 把关卡脚本展开成运行时事件队列。
function buildScheduledEvents(level: FantasyLaneLevelDefinition): FantasyLaneScheduledEvent[] {
  const events: FantasyLaneScheduledEvent[] = [];

  level.phases.forEach((phase) => {
    phase.spawnGroups.forEach((group) => {
      for (let index = 0; index < group.count; index += 1) {
        events.push({
          id: `${group.id}-${index + 1}`,
          triggerAtMs: phase.startAtSec * 1000 + group.firstDelaySec * 1000 + index * group.intervalSec * 1000,
          type: 'spawn',
          source: 'phaseSpawn',
          phaseId: phase.id,
          phaseLabel: phase.label,
          pressure: phase.pressure,
          spawnGroup: group,
        });
      }
    });

    phase.scriptedEvents?.forEach((trigger) => {
      trigger.actions.forEach((action, index) => {
        events.push({
          id: `${trigger.id}-${index}`,
          triggerAtMs: trigger.value * 1000,
          type:
            action.type === 'showWarning'
              ? 'warning'
              : action.type === 'grantGold'
                ? 'grantGold'
                : action.type === 'applyModifier'
                  ? 'modifier'
                  : 'spawn',
          source: 'script',
          phaseId: phase.id,
          phaseLabel: phase.label,
          pressure: phase.pressure,
          spawnGroup: action.spawnGroup,
          text: action.text,
          amount: action.amount,
          target: action.target,
          modifierId: action.modifierId,
          durationMs: action.durationSec ? action.durationSec * 1000 : undefined,
          potency: action.potency,
        });
      });
    });
  });

  return events.sort((left, right) => left.triggerAtMs - right.triggerAtMs);
}

// 过滤掉非法或重复编组，保持旧 UI 仍然只选 8 个兵种。
function ensureLoadout(loadoutUnitIds: string[]) {
  const next = Array.from(new Set(loadoutUnitIds.filter((unitId) => Boolean(FANTASY_LANE_UNIT_MAP[unitId]))));
  if (next.length === 0) return [...FANTASY_LANE_IDS.defaultLoadout];
  return next.slice(0, 8);
}

// 从状态里读取当前关卡。
function getLevel(state: FantasyLaneRuntimeState) {
  return getFantasyLaneLevelById(state.selectedLevelId);
}

// 根据阵营拿到对面主堡坐标。
function getEnemyBaseX(side: FantasyLaneSide) {
  return side === 'player'
    ? FANTASY_LANE_RUNTIME_CONSTANTS.enemyBaseX
    : FANTASY_LANE_RUNTIME_CONSTANTS.playerBaseX;
}

// 用统一规则返回单位基础层级 Y 带。
function getLayerBaseY(layer: FantasyLaneLayer, rangeBand: FantasyLaneUnitDefinition['rangeBand']) {
  if (layer === 'air') return rangeBand === 'melee' ? 0.28 : 0.2;
  return rangeBand === 'melee' ? 0.78 : 0.64;
}

// 生成轻微纵向抖动，避免同层单位完全重叠。
function createUnitY(seed: number, layer: FantasyLaneLayer, rangeBand: FantasyLaneUnitDefinition['rangeBand']) {
  const band = getLayerBaseY(layer, rangeBand);
  const jitter = ((seed % 7) - 3) * 0.014;
  const bounds = getLaneYBounds(layer);
  return clamp(band + jitter, bounds.min, bounds.max);
}

// 计算编组总人口权重，供 setup 风险提示使用。
function getLoadoutPop(loadout: string[]) {
  return loadout.reduce((sum, unitId) => sum + (FANTASY_LANE_UNIT_MAP[unitId]?.pop ?? 0), 0);
}

// 计算场上某阵营的实时人口。
function getActivePop(units: FantasyLaneUnitInstance[], side: FantasyLaneSide) {
  return getFantasyLaneUnitBuckets(units).bySide[side]
    .reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
}

// 计算单位与目标的边缘距离，统一近战接敌和远程射程判定。
function edgeDistance(
  source: FantasyLaneUnitInstance,
  sourceDefinition: FantasyLaneUnitDefinition,
  target: FantasyLaneUnitInstance,
  targetDefinition: FantasyLaneUnitDefinition,
) {
  return Math.abs(target.x - source.x) - (sourceDefinition.collisionRadius + targetDefinition.collisionRadius);
}

// 计算单位与敌方主堡的距离。
function baseDistance(unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition) {
  return Math.abs(getEnemyBaseX(unit.side) - unit.x) - definition.collisionRadius;
}

// 统一追加有限长调试事件流，给后续回放和调试线留口。
function pushDebugEvent(state: FantasyLaneRuntimeState, type: FantasyLaneDebugEvent['type'], text: string) {
  state.debugEvents.push({
    id: `debug-${state.rngSeed++}`,
    atMs: state.elapsedMs,
    type,
    text,
  });
  if (state.debugEvents.length > DEBUG_EVENT_LIMIT) {
    state.debugEvents.splice(0, state.debugEvents.length - DEBUG_EVENT_LIMIT);
  }
}

// 统一追加命中特效，避免命中、AOE、技能分别手写。
function pushImpact(state: FantasyLaneRuntimeState, input: Omit<FantasyLaneImpactEffect, 'id'>) {
  state.impacts.push({
    id: `impact-${state.rngSeed++}`,
    ...input,
  });
}

function pushSkillEffect(state: FantasyLaneRuntimeState, skillName: string, color: string) {
  state.skillEffects.push({
    id: `skill-fx-${state.rngSeed++}`,
    skillName,
    color,
    remainingMs: 800,
    totalMs: 800,
  });
}

function pushDamageNumber(state: FantasyLaneRuntimeState, x: number, y: number, value: number, color: string) {
  state.damageNumbers.push({
    id: `dmg-${state.rngSeed++}`,
    x,
    y,
    value: Math.round(value),
    color,
    remainingMs: 600,
    totalMs: 600,
  });
}

// 统一处理伤害倍率，主堡视为 structure。
function getDamageMultiplier(source: FantasyLaneUnitDefinition, target: FantasyLaneUnitDefinition | 'base') {
  return getDamageMultiplierFromMatrix(source.damageType, target === 'base' ? 'structure' : target.armorType);
}

function getScaledUnitDamage(unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition) {
  return definition.damage * (typeof unit.damageMultiplier === 'number' ? unit.damageMultiplier : 1);
}

// 统一给单位扣血，并把护甲先吃掉。
function applyDamageToUnit(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance, amount: number) {
  let remaining = amount;
  if (unit.armorHp > 0) {
    const absorbed = Math.min(unit.armorHp, remaining);
    unit.armorHp -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) {
    unit.hp -= remaining;
  }
  unit.hitFlashMs = 180;
  pushDamageNumber(state, unit.x, unit.y, amount, unit.side === 'player' ? '#ef4444' : '#3b82f6');
}

// 把首次接敌时间记到统计里，用于后续平均接敌时间分析。
function recordFirstContact(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance) {
  const combatState = ensureCombatState(unit);
  if (combatState.firstContactAtMs !== null) return;
  combatState.firstContactAtMs = state.elapsedMs;
  state.stats.engagedUnits += 1;
  state.stats.totalEngageDelayMs += Math.max(0, state.elapsedMs - unit.spawnedAtMs);
}

// 给双方增减战场效果，统一处理叠层和续时。
function addEffect(
  effects: FantasyLaneEffectState[],
  target: FantasyLaneSide | 'both',
  kind: FantasyLaneEffectState['kind'],
  potency: number,
  durationMs: number,
) {
  const existing = effects.find((effect) => effect.target === target && effect.kind === kind);
  if (existing) {
    existing.potency = Math.max(existing.potency, potency);
    existing.remainingMs = Math.max(existing.remainingMs, durationMs);
    return;
  }
  effects.push({
    id: `${target}-${kind}-${effects.length + 1}`,
    target,
    kind,
    potency,
    remainingMs: durationMs,
  });
}

// 统一计算阵营速度倍率，让加速、冻结和终局加压走同一套乘区。
function getSideSpeedMultiplier(state: FantasyLaneRuntimeState, side: FantasyLaneSide) {
  const haste = state.effects
    .filter((effect) => effect.kind === 'haste' && (effect.target === side || effect.target === 'both'))
    .reduce((sum, effect) => sum + effect.potency, 0);
  const frozen = state.effects.some((effect) => effect.kind === 'freeze' && (effect.target === side || effect.target === 'both'));
  const overtime = state.overtimeTriggered ? 0.08 : 0;
  return frozen ? 0 : 1 + haste + overtime;
}

// 聚合阵营当前承受的战场强化值，避免多个入口重复扫效果表。
function getSideEffectPotency(state: FantasyLaneRuntimeState, side: FantasyLaneSide, kind: FantasyLaneEffectState['kind']) {
  return state.effects
    .filter((effect) => effect.kind === kind && (effect.target === side || effect.target === 'both'))
    .reduce((sum, effect) => sum + effect.potency, 0);
}

// 统一计算伤害强化倍率，Boss 狂暴和后续阶段增伤都从这里进。
function getSideDamageMultiplier(state: FantasyLaneRuntimeState, side: FantasyLaneSide) {
  return 1 + getSideEffectPotency(state, side, 'rage');
}

// 统一计算减伤倍率，阶段强化和护线效果都走同一套口径。
function getSideDamageTakenMultiplier(state: FantasyLaneRuntimeState, side: FantasyLaneSide) {
  return clamp(1 - getSideEffectPotency(state, side, 'fortify'), 0.55, 1);
}

// 给所有战斗伤害走统一乘区，避免阶段强化只对一部分攻击生效。
function scaleDamage(
  state: FantasyLaneRuntimeState,
  amount: number,
  sourceSide: FantasyLaneSide | null,
  targetSide: FantasyLaneSide,
) {
  const outgoing = sourceSide ? getSideDamageMultiplier(state, sourceSide) : 1;
  const incoming = getSideDamageTakenMultiplier(state, targetSide);
  return amount * outgoing * incoming;
}

// 统一生成当前关卡阶段条目，供切段和恢复旧快照时复用。
function createLevelPhaseEntry(phase: FantasyLanePhaseDef, startedAtMs: number) {
  return createPhaseTimelineEntry('level', phase.id, phase.label, phase.pressure, startedAtMs);
}

// 统一生成当前 Boss 阶段条目，保留阈值和序号信息。
function createBossPhaseEntry(
  phaseId: string,
  label: string,
  startedAtMs: number,
  thresholdPercent: number,
) {
  return createPhaseTimelineEntry('boss', phaseId, label, 'boss', startedAtMs, {
    bossPhaseId: phaseId,
    thresholdPercent,
  });
}

// 统一判断单位能否对目标类型开火。
function canTargetUnit(source: FantasyLaneUnitDefinition, target: FantasyLaneUnitDefinition) {
  if (source.targetRule === 'both') return true;
  if (source.targetRule === 'ground_only') return target.layer === 'ground';
  return target.layer === 'air';
}

// 给目标角色打威胁权重，高威胁单位会更容易被集火。
function getThreatWeight(role: FantasyLaneCombatRole, pop: number, layer: FantasyLaneLayer) {
  switch (role) {
    case 'caster':
      return 18;
    case 'siege':
      return 20;
    case 'finisher':
      return 22;
    case 'air_sup':
      return layer === 'air' && pop >= 4 ? 19 : 11;
    case 'sniper':
      return 10;
    case 'fighter':
      return 8;
    default:
      return 6;
  }
}

// 统一计算目标评分，距离、威胁、人口、克制和主堡压力都在这里合并。
export function scoreTargetForUnit(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  target: FantasyLaneUnitInstance,
  targetDefinition: FantasyLaneUnitDefinition,
) {
  const distance = edgeDistance(unit, definition, target, targetDefinition);
  const counterWeight = getDamageMultiplier(definition, targetDefinition);
  const verticalPenalty = Math.abs(target.y - unit.y) * 18;
  const threatWeight = getThreatWeight(targetDefinition.role, targetDefinition.pop, targetDefinition.layer);
  const pressureWeight =
    unit.side === 'player'
      ? clamp(18 - (target.x - FANTASY_LANE_RUNTIME_CONSTANTS.playerBaseX), 0, 18)
      : clamp(18 - (FANTASY_LANE_RUNTIME_CONSTANTS.enemyBaseX - target.x), 0, 18);
  const airPriority =
    target.layer === 'air' && definition.targetRule !== 'ground_only'
      ? targetDefinition.role === 'air_sup' || targetDefinition.pop >= 4
        ? 12
        : 6
      : 0;
  const aoeWeight =
    definition.damageProfile === 'aoe' && (targetDefinition.armorType === 'swarm' || targetDefinition.footprint === 'small')
      ? 8
      : 0;

  return (
    100
    - distance * 4
    - verticalPenalty
    + threatWeight
    + targetDefinition.pop * 2.6
    + (counterWeight - 1) * 28
    + pressureWeight
    + airPriority
    + aoeWeight
  );
}

// 控制当前目标保留逻辑，避免单位每个 tick 都抖目标。
export function shouldRetainCurrentTarget(
  currentScore: number,
  nextScore: number,
  retargetLockMs: number,
  currentDistance: number,
  definition: FantasyLaneUnitDefinition,
) {
  if (retargetLockMs > 0) return true;
  const attackZoneBuffer = getCombatProtocol(definition).holdRangeBuffer + (definition.rangeBand === 'ranged' ? 1.8 : 1.1);
  if (currentDistance <= definition.preferredRange + attackZoneBuffer) return true;
  return currentScore + 6 >= nextScore;
}

// 把单位筛到可索敌的前方目标集合里。
function getCandidateTargets(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition) {
  const enemySide: FantasyLaneSide = unit.side === 'player' ? 'enemy' : 'player';
  return getFantasyLaneUnitBuckets(state.units).bySide[enemySide].filter((target) => {
    if (target.side === unit.side) return false;
    const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
    if (!targetDefinition) return false;
    if (!canTargetUnit(definition, targetDefinition)) return false;
    if (definition.layer === 'ground' && definition.rangeBand === 'melee' && target.layer === 'air') return false;
    if (unit.side === 'player' && target.x < unit.x - 1.5) return false;
    if (unit.side === 'enemy' && target.x > unit.x + 1.5) return false;
    const distance = edgeDistance(unit, definition, target, targetDefinition);
    return distance <= definition.acquireRange;
  });
}

// 统一处理目标选择、保留与换目标延迟。
function resolveTargeting(
  state: FantasyLaneRuntimeState,
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
) {
  const combatState = ensureCombatState(unit);
  const candidates = getCandidateTargets(state, unit, definition).map((target) => {
    const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
    return {
      target,
      targetDefinition,
      distance: edgeDistance(unit, definition, target, targetDefinition),
      score: scoreTargetForUnit(unit, definition, target, targetDefinition),
    };
  });

  const nextCandidate = candidates.sort((left, right) => right.score - left.score)[0] ?? null;
  const currentCandidate =
    combatState.currentTargetId === null
      ? null
      : candidates.find((candidate) => candidate.target.instanceId === combatState.currentTargetId) ?? null;

  if (currentCandidate && nextCandidate) {
    const keepCurrent = shouldRetainCurrentTarget(
      currentCandidate.score,
      nextCandidate.score,
      combatState.retargetLockMs,
      currentCandidate.distance,
      definition,
    );
    if (keepCurrent) {
      unit.lastTargetId = currentCandidate.target.instanceId;
      return currentCandidate;
    }
  }

  const chosen = nextCandidate ?? currentCandidate ?? null;
  if (chosen) {
    if (combatState.currentTargetId !== chosen.target.instanceId) {
      combatState.retargetLockMs = getRetargetCooldownMs(definition);
    }
    combatState.currentTargetId = chosen.target.instanceId;
    unit.lastTargetId = chosen.target.instanceId;
    return chosen;
  }

  combatState.currentTargetId = null;
  unit.lastTargetId = null;
  return {
    target: null,
    targetDefinition: null,
    distance: Number.POSITIVE_INFINITY,
    score: Number.NEGATIVE_INFINITY,
  } satisfies TargetSelection;
}

// 近战单位只会推进或贴身接敌，不主动后撤。
function updateMeleeUnitIntent(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  selection: TargetSelection,
  travelStep: number,
) {
  const protocol = getCombatProtocol(definition);
  const direction = unit.side === 'player' ? 1 : -1;
  if (selection.target && selection.targetDefinition) {
    if (selection.distance <= definition.preferredRange + protocol.holdRangeBuffer) {
      return {
        mode: 'attackTarget',
        target: selection.target,
        targetDefinition: selection.targetDefinition,
        targetBase: false,
        distance: selection.distance,
        desiredX: unit.x,
        desiredY: unit.y,
      } satisfies UnitIntent;
    }
    return {
      mode: 'advance',
      target: selection.target,
      targetDefinition: selection.targetDefinition,
      targetBase: false,
      distance: selection.distance,
      desiredX: unit.x + direction * travelStep * protocol.advanceFactor,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  if (baseDistance(unit, definition) <= definition.preferredRange + protocol.holdRangeBuffer) {
    return {
      mode: 'attackBase',
      target: null,
      targetDefinition: null,
      targetBase: true,
      distance: baseDistance(unit, definition),
      desiredX: unit.x,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  return {
    mode: 'advance',
    target: null,
    targetDefinition: null,
    targetBase: false,
    distance: Number.POSITIVE_INFINITY,
    desiredX: unit.x + direction * travelStep * protocol.idleAdvanceFactor,
    desiredY: unit.y,
  } satisfies UnitIntent;
}

// 远程单位围绕 preferredRange / minimumRange 切换推进、驻停和轻微后撤。
function updateRangedUnitIntent(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  selection: TargetSelection,
  travelStep: number,
) {
  const protocol = getCombatProtocol(definition);
  const direction = unit.side === 'player' ? 1 : -1;
  if (selection.target && selection.targetDefinition) {
    if (selection.distance <= definition.preferredRange + protocol.holdRangeBuffer) {
      return {
        mode: 'attackTarget',
        target: selection.target,
        targetDefinition: selection.targetDefinition,
        targetBase: false,
        distance: selection.distance,
        desiredX: unit.x,
        desiredY: unit.y,
      } satisfies UnitIntent;
    }
    return {
      mode: 'advance',
      target: selection.target,
      targetDefinition: selection.targetDefinition,
      targetBase: false,
      distance: selection.distance,
      desiredX: unit.x + direction * travelStep * protocol.advanceFactor,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  if (baseDistance(unit, definition) <= definition.preferredRange + protocol.holdRangeBuffer) {
    return {
      mode: 'attackBase',
      target: null,
      targetDefinition: null,
      targetBase: true,
      distance: baseDistance(unit, definition),
      desiredX: unit.x,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  return {
    mode: 'advance',
    target: null,
    targetDefinition: null,
    targetBase: false,
    distance: Number.POSITIVE_INFINITY,
    desiredX: unit.x + direction * travelStep * protocol.idleAdvanceFactor,
    desiredY: unit.y,
  } satisfies UnitIntent;
}

// 空军协议独立于地面阻挡，且对高威胁空军更积极。
function updateAirUnitIntent(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  selection: TargetSelection,
  travelStep: number,
) {
  const protocol = getCombatProtocol(definition);
  const direction = unit.side === 'player' ? 1 : -1;
  if (selection.target && selection.targetDefinition) {
    const preferredRange = selection.target.layer === 'air'
      ? definition.preferredRange + protocol.holdRangeBuffer
      : definition.preferredRange;
    if (selection.distance <= preferredRange) {
      return {
        mode: 'attackTarget',
        target: selection.target,
        targetDefinition: selection.targetDefinition,
        targetBase: false,
        distance: selection.distance,
        desiredX: unit.x,
        desiredY: unit.y,
      } satisfies UnitIntent;
    }
    return {
      mode: 'advance',
      target: selection.target,
      targetDefinition: selection.targetDefinition,
      targetBase: false,
      distance: selection.distance,
      desiredX: unit.x + direction * travelStep * protocol.advanceFactor,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  if (baseDistance(unit, definition) <= definition.preferredRange + protocol.holdRangeBuffer * 0.5) {
    return {
      mode: 'attackBase',
      target: null,
      targetDefinition: null,
      targetBase: true,
      distance: baseDistance(unit, definition),
      desiredX: unit.x,
      desiredY: unit.y,
    } satisfies UnitIntent;
  }

  return {
    mode: 'advance',
    target: null,
    targetDefinition: null,
    targetBase: false,
    distance: Number.POSITIVE_INFINITY,
    desiredX: unit.x + direction * travelStep * protocol.idleAdvanceFactor,
    desiredY: unit.y,
  } satisfies UnitIntent;
}

// 远程过近时轻微后撤并做纵向让位，避免原地互顶。
// 判断单位是否处于攻击锁脚状态。
function isMovementLocked(unit: FantasyLaneUnitInstance) {
  return unit.attackAnimMs > 0 || (unit.combatState?.windupRemainingMs ?? 0) > 0;
}

// 统一启动一次攻击前摇。
function beginAttackWindup(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  targetId: string | null,
  targetBase: boolean,
  deltaMs: number,
) {
  const combatState = ensureCombatState(unit);
  combatState.pendingTargetId = targetId;
  combatState.pendingTargetBase = targetBase;
  combatState.windupRemainingMs = Math.max(0, definition.attackWindupMs - deltaMs);
  unit.attackAnimMs = Math.max(definition.attackAnimMs, definition.attackWindupMs);
}

// 给投射物发射逻辑统一建模，所有远程都走这里。
function launchProjectile(
  state: FantasyLaneRuntimeState,
  source: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  target: FantasyLaneUnitInstance | null,
  targetBase: boolean,
) {
  const targetX = targetBase ? getEnemyBaseX(source.side) : target?.x ?? source.x;
  const targetY = targetBase ? getLayerBaseY(source.layer, definition.rangeBand) : target?.y ?? source.y;
  const distance = Math.max(2, Math.abs(targetX - source.x));
  const totalMs = clamp((distance / Math.max(definition.projectileSpeed, 12)) * 1000, 90, 520);

  state.projectiles.push({
    id: `projectile-${state.rngSeed++}`,
    sourceInstanceId: source.instanceId,
    sourceUnitId: source.templateId,
    side: source.side,
    layer: target?.layer ?? source.layer,
    fromX: source.x,
    fromY: source.y,
    toX: targetX,
    toY: targetY,
    x: source.x,
    y: source.y,
    targetInstanceId: target?.instanceId ?? null,
    targetBase,
    damage: getScaledUnitDamage(source, definition),
    splashRadius: definition.splashRadius,
    damageType: definition.damageType,
    color: definition.attackColor,
    remainingMs: totalMs,
    totalMs,
  });
  state.stats.projectilesFired += 1;
}

// 给主堡结算伤害并保留命中反馈。
function attackBase(
  state: FantasyLaneRuntimeState,
  source: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  damageOverride?: number,
) {
  const targetSide = source.side === 'player' ? 'enemy' : 'player';
  const damage = scaleDamage(
    state,
    (damageOverride ?? getScaledUnitDamage(source, definition)) * getDamageMultiplier(definition, 'base'),
    source.side,
    targetSide,
  );
  if (source.side === 'player') {
    state.enemyBaseHp = Math.max(0, state.enemyBaseHp - damage);
  } else {
    state.playerBaseHp = Math.max(0, state.playerBaseHp - damage);
  }
  pushImpact(state, {
    x: getEnemyBaseX(source.side),
    y: source.layer === 'air' ? 0.26 : 0.7,
    layer: source.layer,
    kind: 'skill',
    color: definition.attackColor,
    remainingMs: 260,
  });
}

// 统一处理范围伤害，中心目标吃满伤，外圈走 48% * 衰减。
function applyAreaDamage(
  state: FantasyLaneRuntimeState,
  definition: FantasyLaneUnitDefinition,
  side: FantasyLaneSide,
  layer: FantasyLaneLayer,
  x: number,
  y: number,
  amount: number,
  radius: number,
  primaryTargetId?: string,
) {
  if (radius <= 0) return;
  let hits = 0;

  state.units.forEach((target) => {
    if (target.side === side || target.layer !== layer) return;
    const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
    const dx = Math.abs(target.x - x);
    const dy = Math.abs(target.y - y) * 18;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > radius) return;

    const multiplier = getDamageMultiplier(definition, targetDefinition);
    if (primaryTargetId && target.instanceId === primaryTargetId) {
      applyDamageToUnit(state, target, scaleDamage(state, amount * multiplier, side, target.side));
      hits += 1;
      return;
    }

    const falloff = getAoeFalloff(distance, radius);
    applyDamageToUnit(
      state,
      target,
      scaleDamage(
        state,
        amount * FANTASY_LANE_RUNTIME_CONSTANTS.aoeSecondaryRatio * falloff * multiplier,
        side,
        target.side,
      ),
    );
    hits += 1;
  });

  if (hits > 0) {
    state.stats.aoeHits += hits;
    pushImpact(state, {
      x,
      y,
      layer,
      kind: 'aoe',
      color: definition.attackColor,
      remainingMs: 260,
    });
  }
}

// 在前摇结束时真正执行伤害或发射投射物。
function resolvePendingAttack(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition) {
  const combatState = ensureCombatState(unit);
  const target = combatState.pendingTargetId
    ? state.units.find((candidate) => candidate.instanceId === combatState.pendingTargetId)
    : null;

  if (combatState.pendingTargetBase) {
    if (definition.rangeBand === 'ranged') {
      launchProjectile(state, unit, definition, null, true);
    } else {
      attackBase(state, unit, definition);
    }
  } else if (target) {
    const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
    if (definition.rangeBand === 'ranged') {
      launchProjectile(state, unit, definition, target, false);
    } else if (definition.splashRadius > 0) {
      applyAreaDamage(
        state,
        definition,
        unit.side,
        target.layer,
        target.x,
        target.y,
        getScaledUnitDamage(unit, definition),
        definition.splashRadius,
        target.instanceId,
      );
    } else {
      applyDamageToUnit(
        state,
        target,
        scaleDamage(state, getScaledUnitDamage(unit, definition) * getDamageMultiplier(definition, targetDefinition), unit.side, target.side),
      );
      pushImpact(state, {
        x: target.x,
        y: target.y,
        layer: target.layer,
        kind: 'hit',
        color: definition.attackColor,
        remainingMs: 160,
      });
    }
  }

  combatState.pendingTargetId = null;
  combatState.pendingTargetBase = false;
  unit.attackCooldownMs = definition.attackIntervalMs;
}

// 统一推进单位自身计时器，并在前摇结束时触发出手。
function updateUnitTimers(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition, deltaMs: number) {
  const combatState = ensureCombatState(unit);
  const previousWindup = combatState.windupRemainingMs;

  combatState.windupRemainingMs = Math.max(0, combatState.windupRemainingMs - deltaMs);
  combatState.retargetLockMs = Math.max(0, combatState.retargetLockMs - deltaMs);
  unit.attackCooldownMs = Math.max(0, unit.attackCooldownMs - deltaMs);
  unit.attackAnimMs = Math.max(0, unit.attackAnimMs - deltaMs);
  unit.hitFlashMs = Math.max(0, unit.hitFlashMs - deltaMs);

  if (previousWindup > 0 && combatState.windupRemainingMs === 0) {
    resolvePendingAttack(state, unit, definition);
  }
}

// 统一算一层单位的移动步长。
function getTravelStep(definition: FantasyLaneUnitDefinition, speedMultiplier: number, deltaMs: number) {
  return definition.moveSpeed * speedMultiplier * (deltaMs / 1000);
}

// 把三类行为协议统一封装成意图输出。
function resolveIntent(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  selection: TargetSelection,
  travelStep: number,
) {
  if (definition.layer === 'air') {
    return updateAirUnitIntent(unit, definition, selection, travelStep);
  }
  if (definition.rangeBand === 'ranged') {
    return updateRangedUnitIntent(unit, definition, selection, travelStep);
  }
  return updateMeleeUnitIntent(unit, definition, selection, travelStep);
}

// 给单位和当前目标留出安全接敌距离，避免直接重叠穿模。
function applyTargetSpacing(intent: UnitIntent, definition: FantasyLaneUnitDefinition) {
  if (!intent.target || !intent.targetDefinition) return intent.desiredX;
  const protocol = getCombatProtocol(definition);
  const direction = intent.target.side === 'player' ? -1 : 1;
  const desiredGap = definition.preferredRange + protocol.holdRangeBuffer + definition.collisionRadius + intent.targetDefinition.collisionRadius;

  if (direction === 1) {
    return Math.min(intent.desiredX, intent.target.x - desiredGap);
  }
  return Math.max(intent.desiredX, intent.target.x + desiredGap);
}

// 处理友军软碰撞，允许小体型穿插，巨型单位阻挡更强。
function resolveFriendlySoftCollision(
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  desiredX: number,
  previousPlaced: { x: number; y: number; radius: number; threshold: number; blockWeight: number } | null,
) {
  if (!previousPlaced) return desiredX;
  const collisionProfile = getSoftCollisionProfile(definition);
  const direction = unit.side === 'player' ? 1 : -1;
  const sharesTrack = Math.abs(previousPlaced.y - unit.y) <= Math.max(previousPlaced.threshold, collisionProfile.trackThreshold);
  if (!sharesTrack) return desiredX;

  const minGap =
    previousPlaced.radius
    + definition.collisionRadius
    + 0.12 * Math.max(previousPlaced.blockWeight, collisionProfile.blockWeight)
    - collisionProfile.slipBonus;

  if (direction === 1) {
    return Math.min(desiredX, previousPlaced.x - minGap);
  }
  return Math.max(desiredX, previousPlaced.x + minGap);
}

function clampForwardProgress(unit: FantasyLaneUnitInstance, desiredX: number) {
  return unit.side === 'player'
    ? Math.max(unit.x, desiredX)
    : Math.min(unit.x, desiredX);
}

// 统一处理移动和拥堵漂移。
function resolveMovement(
  state: FantasyLaneRuntimeState,
  unit: FantasyLaneUnitInstance,
  definition: FantasyLaneUnitDefinition,
  intent: UnitIntent,
  travelStep: number,
  previousPlaced: { x: number; y: number; radius: number; threshold: number; blockWeight: number } | null,
) {
  const collisionProfile = getSoftCollisionProfile(definition);
  let desiredX = isMovementLocked(unit) ? unit.x : intent.desiredX;
  let desiredY = intent.desiredY;

  if (intent.mode === 'advance') {
    desiredX = applyTargetSpacing(intent, definition);
  }

  desiredX = resolveFriendlySoftCollision(unit, definition, desiredX, previousPlaced);
  desiredX = clampForwardProgress(unit, desiredX);
  desiredX = clamp(
    desiredX,
    FANTASY_LANE_RUNTIME_CONSTANTS.lanePaddingMinX,
    FANTASY_LANE_RUNTIME_CONSTANTS.lanePaddingMaxX,
  );

  const blocked =
    intent.mode === 'advance'
    && Math.abs(desiredX - unit.x) < Math.max(0.04, travelStep * 0.18)
    && Number.isFinite(intent.distance)
    && intent.distance > definition.preferredRange;

  unit.blockedMs = blocked ? Math.min(1600, unit.blockedMs + travelStep * 1000) : Math.max(0, unit.blockedMs - travelStep * 1400);
  if (unit.blockedMs > 420) {
    const drift = (((state.elapsedMs + unit.spawnedAtMs + state.rngSeed) % 3) - 1) * 0.004;
    desiredY = clamp(
      desiredY + drift + collisionProfile.blockedDrift,
      collisionProfile.laneMinY,
      collisionProfile.laneMaxY,
    );
  }

  unit.x = desiredX;
  unit.y = desiredY;

  return {
    x: unit.x,
    y: unit.y,
    radius: definition.collisionRadius,
    threshold: collisionProfile.trackThreshold,
    blockWeight: collisionProfile.blockWeight,
  };
}

// 处理单侧单层主循环，把三类单位协议真正拆开后统一调度。
function processSideLayer(state: FantasyLaneRuntimeState, side: FantasyLaneSide, layer: FantasyLaneLayer, deltaMs: number) {
  const units = getFantasyLaneUnitBuckets(state.units).bySideLayer[side][layer]
    .slice()
    .sort((left, right) => (side === 'player' ? right.x - left.x : left.x - right.x));

  let previousPlaced: { x: number; y: number; radius: number; threshold: number; blockWeight: number } | null = null;
  units.forEach((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    if (!definition) return;

    updateUnitTimers(state, unit, definition, deltaMs);

    const speedMultiplier = getSideSpeedMultiplier(state, side);
    const travelStep = getTravelStep(definition, speedMultiplier, deltaMs);
    const selection = resolveTargeting(state, unit, definition);
    const intent = resolveIntent(unit, definition, selection, travelStep);

    if (selection.target && selection.targetDefinition && selection.distance <= definition.preferredRange) {
      recordFirstContact(state, unit);
    }

    if (!isMovementLocked(unit) && unit.attackCooldownMs <= 0) {
      if (intent.mode === 'attackTarget' && intent.target) {
        beginAttackWindup(unit, definition, intent.target.instanceId, false, deltaMs);
        if (ensureCombatState(unit).windupRemainingMs === 0) {
          resolvePendingAttack(state, unit, definition);
        }
      } else if (intent.mode === 'attackBase') {
        beginAttackWindup(unit, definition, null, true, deltaMs);
        if (ensureCombatState(unit).windupRemainingMs === 0) {
          resolvePendingAttack(state, unit, definition);
        }
      }
    }

    previousPlaced = resolveMovement(state, unit, definition, intent, travelStep, previousPlaced);
  });
}

// 计算当前局收入，囤钱衰减和终局加压都在这里统一收口。
// 统一检查出兵是否合法，人口和巨型单位上限都在这里。
function canSpawnUnit(state: FantasyLaneRuntimeState, unitId: string, side: FantasyLaneSide) {
  const definition = FANTASY_LANE_UNIT_MAP[unitId];
  if (!definition) return false;

  const sideUnits = getFantasyLaneUnitBuckets(state.units).bySide[side];
  const activePop = sideUnits.reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
  const activeGiants = sideUnits.filter((unit) => FANTASY_LANE_UNIT_MAP[unit.templateId]?.footprint === 'giant').length;

  if (activePop + definition.pop > state.popLimit) return false;
  if (definition.footprint === 'giant' && activeGiants >= FANTASY_LANE_RUNTIME_CONSTANTS.giantUnitLimit) return false;
  return true;
}

// 统一创建单位实例，保证出生坐标、层级和统计同步更新。
function spawnUnit(state: FantasyLaneRuntimeState, unitId: string, side: FantasyLaneSide, laneOverride?: string) {
  const definition = FANTASY_LANE_UNIT_MAP[unitId];
  if (!definition || !canSpawnUnit(state, unitId, side)) return false;

  const seed = state.rngSeed++;
  const starLevel = Math.max(0, Math.min(3, state.unitStarLevels[unitId] ?? 0));
  const battleBonus = getFantasyLaneUnitBattleBonus(starLevel);
  const spawnSlot = normalizeSpawnLane(
    definition,
    laneOverride === 'front' || laneOverride === 'mid' || laneOverride === 'rear' || laneOverride === 'air'
      ? laneOverride
      : undefined,
  );
  const instanceId = `${side}-${unitId}-${seed}`;

  state.units.push({
    instanceId,
    templateId: unitId,
    side,
    layer: spawnSlot.layer,
    lane: spawnSlot.lane,
    x: side === 'player' ? getPlayerSpawnXFromRules() : getEnemySpawnXFromRules(),
    y: createUnitY(seed, spawnSlot.layer, definition.rangeBand),
    hp: Math.max(1, Math.round(definition.maxHp * battleBonus.healthMultiplier)),
    armorHp: Math.max(0, Math.round(definition.armorHp * battleBonus.healthMultiplier)),
    attackCooldownMs: Math.round(definition.attackIntervalMs * 0.4),
    attackAnimMs: 0,
    hitFlashMs: 0,
    blockedMs: 0,
    lastTargetId: null,
    spawnedAtMs: state.elapsedMs,
    starLevel,
    damageMultiplier: battleBonus.damageMultiplier,
    healthMultiplier: battleBonus.healthMultiplier,
    combatState: createCombatState(),
  });

  if (side === 'player') {
    state.stats.summoned += 1;
    if (definition.tags.includes('frontline')) state.stats.frontlineSummons += definition.pop;
    if (definition.tags.includes('antiAir')) state.stats.antiAirSummons += definition.pop;
    if (definition.tags.includes('aoe')) state.stats.aoeSummons += definition.pop;
  } else {
    state.stats.enemySummoned += 1;
    if (state.bossUnitInstanceId === null && getLevel(state).boss?.unitId === unitId) {
      state.bossUnitInstanceId = instanceId;
    }
  }

  pushDebugEvent(state, 'spawn', `${side === 'player' ? '我方' : '敌方'}部署 ${definition.name}`);
  return true;
}

// 处理玩家指令队列，遇到不可出的大单位时继续尝试后面的可部署单位。
function processPlayerQueue(state: FantasyLaneRuntimeState) {
  if (state.globalSpawnCooldownMs > 0 || state.queue.length === 0) return;
  const nextIndex = state.queue.findIndex((unitId) => canSpawnUnit(state, unitId, 'player'));
  if (nextIndex < 0) {
    state.lastHint = '当前人口或出生区拥堵，队列继续等待。';
    return;
  }
  const [nextUnitId] = state.queue.splice(nextIndex, 1);
  if (!spawnUnit(state, nextUnitId, 'player')) return;
  state.globalSpawnCooldownMs = FANTASY_LANE_RUNTIME_CONSTANTS.playerGlobalSpawnCooldownMs;
  state.lastHint = `已下达：${FANTASY_LANE_UNIT_MAP[nextUnitId]?.name ?? nextUnitId}`;
}

// 处理脚本事件，敌方出兵和经济事件统一从这里走。
function processScheduledEvents(state: FantasyLaneRuntimeState) {
  const pending: FantasyLaneScheduledEvent[] = [];

  state.scheduledEvents.forEach((event) => {
    if (event.triggerAtMs > state.elapsedMs) {
      pending.push(event);
      return;
    }

    if (event.type === 'spawn') {
      if (state.enemySpawnCooldownMs > 0 || !event.spawnGroup || !canSpawnUnit(state, event.spawnGroup.unitId, 'enemy')) {
        pending.push(event);
        return;
      }
      spawnUnit(state, event.spawnGroup.unitId, 'enemy', event.spawnGroup.laneOverride);
      state.enemySpawnCooldownMs = FANTASY_LANE_RUNTIME_CONSTANTS.enemyGlobalSpawnCooldownMs;
      if (event.source === 'bossPhaseSpawn' || event.source === 'bossSkill') {
        state.stats.bossPhaseSummons += 1;
      }
      pushRuntimeEvent(state, {
        type: 'scheduledSpawn',
        phaseId: event.phaseId,
        phaseLabel: event.phaseLabel,
        pressure: event.pressure,
        bossPhaseId: event.bossPhaseId,
        bossPhaseLabel: event.bossPhaseLabel,
        skillId: event.skillId,
        skillLabel: event.skillLabel,
        scheduledEventId: event.id,
        scheduledEventSource: event.source,
        side: 'enemy',
        unitId: event.spawnGroup.unitId,
        text: event.spawnGroup.note,
      });
      return;
    }

    if (event.type === 'warning' && event.text) {
      state.activeWarning = { id: event.id, text: event.text, remainingMs: 4200 };
      pushRuntimeEvent(state, {
        type: 'warning',
        phaseId: event.phaseId,
        phaseLabel: event.phaseLabel,
        pressure: event.pressure,
        bossPhaseId: event.bossPhaseId,
        bossPhaseLabel: event.bossPhaseLabel,
        scheduledEventId: event.id,
        scheduledEventSource: event.source,
        text: event.text,
      });
      return;
    }

    if (event.type === 'grantGold' && typeof event.amount === 'number') {
      state.gold = Math.min(FANTASY_LANE_RUNTIME_CONSTANTS.maxGold, state.gold + event.amount);
      return;
    }

    if (event.type === 'modifier' && event.target && event.modifierId) {
      addEffect(state.effects, event.target, event.modifierId, event.potency ?? 0.18, event.durationMs ?? 3000);
      state.stats.scriptedModifiersApplied += 1;
      pushRuntimeEvent(state, {
        type: 'modifierApply',
        phaseId: event.phaseId,
        phaseLabel: event.phaseLabel,
        pressure: event.pressure,
        bossPhaseId: event.bossPhaseId,
        bossPhaseLabel: event.bossPhaseLabel,
        skillId: event.skillId,
        skillLabel: event.skillLabel,
        scheduledEventId: event.id,
        scheduledEventSource: event.source,
        side: event.target === 'both' ? undefined : event.target,
        modifierId: event.modifierId,
        durationMs: event.durationMs,
        amount: event.potency,
        text: event.text,
      });
    }
  });

  state.scheduledEvents = pending;
}

// 统一处理投射物飞行和命中。
function processProjectiles(state: FantasyLaneRuntimeState, deltaMs: number) {
  let writeIndex = 0;

  state.projectiles.forEach((projectile) => {
    const remainingMs = projectile.remainingMs - deltaMs;
    const target = projectile.targetInstanceId
      ? state.units.find((unit) => unit.instanceId === projectile.targetInstanceId)
      : null;
    const toX = projectile.targetBase ? projectile.toX : target?.x ?? projectile.toX;
    const toY = projectile.targetBase ? projectile.toY : target?.y ?? projectile.toY;
    const progress = clamp(1 - Math.max(remainingMs, 0) / projectile.totalMs, 0, 1);
    projectile.toX = toX;
    projectile.toY = toY;
    projectile.x = projectile.fromX + (toX - projectile.fromX) * progress;
    projectile.y = projectile.fromY + (toY - projectile.fromY) * progress;
    projectile.remainingMs = remainingMs;

    if (remainingMs <= 0) {
      processProjectileHit(state, projectile);
      return;
    }
    state.projectiles[writeIndex] = projectile;
    writeIndex += 1;
  });

  state.projectiles.length = writeIndex;
}

function processImpacts(state: FantasyLaneRuntimeState, deltaMs: number) {
  let writeIndex = 0;

  state.impacts.forEach((impact) => {
    impact.remainingMs -= deltaMs;
    if (impact.remainingMs <= 0) {
      return;
    }
    state.impacts[writeIndex] = impact;
    writeIndex += 1;
  });

  state.impacts.length = writeIndex;

  // 更新技能特效
  let skillFxIndex = 0;
  for (const effect of state.skillEffects) {
    effect.remainingMs -= deltaMs;
    if (effect.remainingMs <= 0) continue;
    state.skillEffects[skillFxIndex] = effect;
    skillFxIndex += 1;
  }
  state.skillEffects.length = skillFxIndex;

  // 更新伤害数字
  let dmgIndex = 0;
  for (const dmg of state.damageNumbers) {
    dmg.remainingMs -= deltaMs;
    if (dmg.remainingMs <= 0) continue;
    state.damageNumbers[dmgIndex] = dmg;
    dmgIndex += 1;
  }
  state.damageNumbers.length = dmgIndex;
}

// 统一处理投射物落点伤害。
function processProjectileHit(state: FantasyLaneRuntimeState, projectile: FantasyLaneProjectile) {
  const definition = FANTASY_LANE_UNIT_MAP[projectile.sourceUnitId];
  if (!definition) return;

  if (projectile.targetBase) {
    attackBase(
      state,
      {
        instanceId: projectile.sourceInstanceId,
        templateId: projectile.sourceUnitId,
        side: projectile.side,
        layer: projectile.layer,
        lane: definition.lane,
        x: projectile.x,
        y: projectile.y,
        hp: 1,
        armorHp: 0,
        attackCooldownMs: 0,
        attackAnimMs: 0,
        hitFlashMs: 0,
        blockedMs: 0,
        lastTargetId: null,
        spawnedAtMs: 0,
        starLevel: 0,
        damageMultiplier: 1,
        healthMultiplier: 1,
        combatState: createCombatState(),
      },
      definition,
      projectile.damage,
    );
    return;
  }

  const target = state.units.find((unit) => unit.instanceId === projectile.targetInstanceId);
  if (!target) {
    if (projectile.splashRadius > 0) {
      applyAreaDamage(
        state,
        definition,
        projectile.side,
        projectile.layer,
        projectile.toX,
        projectile.toY,
        projectile.damage,
        projectile.splashRadius,
      );
    } else {
      pushImpact(state, {
        x: projectile.x,
        y: projectile.y,
        layer: projectile.layer,
        kind: 'hit',
        color: projectile.color,
        remainingMs: 180,
      });
    }
    return;
  }

  const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
  if (projectile.splashRadius > 0) {
    applyAreaDamage(
      state,
      definition,
      projectile.side,
      projectile.layer,
      target.x,
      target.y,
      projectile.damage,
      projectile.splashRadius,
      target.instanceId,
    );
  } else {
    applyDamageToUnit(
      state,
      target,
      scaleDamage(
        state,
        projectile.damage * getDamageMultiplier(definition, targetDefinition),
        projectile.side,
        target.side,
      ),
    );
    pushImpact(state, {
      x: target.x,
      y: target.y,
      layer: target.layer,
      kind: 'hit',
      color: projectile.color,
      remainingMs: 180,
    });
  }
}

// 处理持续灼线效果，保持技能和 Boss 阶段效果兼容。
function processBurnline(state: FantasyLaneRuntimeState, deltaMs: number) {
  state.effects
    .filter((effect) => effect.kind === 'burnline')
    .forEach((effect) => {
      state.units.forEach((unit) => {
        if (effect.target !== 'both' && unit.side !== effect.target) return;
        applyDamageToUnit(state, unit, scaleDamage(state, effect.potency * (deltaMs / 1000), null, unit.side));
      });
      if (effect.target === 'enemy' || effect.target === 'both') {
        state.enemyBaseHp = Math.max(
          0,
          state.enemyBaseHp - scaleDamage(state, effect.potency * 0.28 * (deltaMs / 1000), null, 'enemy'),
        );
      }
      if (effect.target === 'player' || effect.target === 'both') {
        state.playerBaseHp = Math.max(
          0,
          state.playerBaseHp - scaleDamage(state, effect.potency * 0.28 * (deltaMs / 1000), null, 'player'),
        );
      }
    });
}

// 根据当前时间解析关卡主阶段，统一给运行时和统计复用。
function getActiveLevelPhase(state: FantasyLaneRuntimeState) {
  const level = getLevel(state);
  return (
    level.phases.find((item) => {
      const startMs = item.startAtSec * 1000;
      const endMs = item.endAtSec ? item.endAtSec * 1000 : Number.POSITIVE_INFINITY;
      return state.elapsedMs >= startMs && state.elapsedMs < endMs;
    }) ?? level.phases[level.phases.length - 1]
  );
}

// 统一记录主阶段进入，保证三段节奏在 runtime 内有明确轨迹。
function enterLevelPhase(state: FantasyLaneRuntimeState, phase: FantasyLanePhaseDef) {
  if (state.currentPhaseId === phase.id) return;
  closePhaseTimelineEntry(state, 'level', state.elapsedMs);
  state.currentPhaseId = phase.id;
  state.currentPhaseStartedAtMs = state.elapsedMs;
  state.phaseTimeline.push(createLevelPhaseEntry(phase, state.elapsedMs));
  state.stats.levelPhasesEntered += 1;
  pushRuntimeEvent(state, {
    type: 'levelPhaseEnter',
    phaseId: phase.id,
    phaseLabel: phase.label,
    pressure: phase.pressure,
    text: `进入阶段：${phase.label}`,
  });
  pushDebugEvent(state, 'phase', `关卡阶段切换：${phase.label}`);
}

// 执行 Boss 阶段技能规则，让 catalog 中的技能 ID 进入真实 runtime 效果链。
function activateBossSkill(
  state: FantasyLaneRuntimeState,
  bossPhaseId: string,
  bossPhaseLabel: string,
  skillId: string,
) {
  const skillRule = getBossSkillRule(skillId);
  const skillLabel = getBossSkillLabel(skillId);

  state.stats.bossSkillActivations += 1;
  pushRuntimeEvent(state, {
    type: 'bossSkillCast',
    phaseId: state.currentPhaseId,
    phaseLabel: state.phaseLabel,
    pressure: 'boss',
    bossPhaseId,
    bossPhaseLabel,
    skillId,
    skillLabel,
    text: skillRule?.summary ?? `Boss 技能 ${skillLabel} 已触发`,
  });

  if (!skillRule) return;

  skillRule.actions.forEach((action, index) => {
    const eventId = `${bossPhaseId}-${skillId}-${index}`;
    if (action.type === 'showWarning' && action.text) {
      state.activeWarning = { id: eventId, text: action.text, remainingMs: 3600 };
      pushRuntimeEvent(state, {
        type: 'warning',
        phaseId: state.currentPhaseId,
        phaseLabel: state.phaseLabel,
        pressure: 'boss',
        bossPhaseId,
        bossPhaseLabel,
        skillId,
        skillLabel,
        scheduledEventId: eventId,
        scheduledEventSource: 'bossSkill',
        text: action.text,
      });
      return;
    }

    if (action.type === 'applyModifier' && action.target && action.modifierId) {
      addEffect(state.effects, action.target, action.modifierId, action.potency ?? 0.12, action.durationMs ?? 4000);
      state.stats.scriptedModifiersApplied += 1;
      pushRuntimeEvent(state, {
        type: 'modifierApply',
        phaseId: state.currentPhaseId,
        phaseLabel: state.phaseLabel,
        pressure: 'boss',
        bossPhaseId,
        bossPhaseLabel,
        skillId,
        skillLabel,
        scheduledEventId: eventId,
        scheduledEventSource: 'bossSkill',
        side: action.target === 'both' ? undefined : action.target,
        modifierId: action.modifierId,
        amount: action.potency,
        durationMs: action.durationMs,
        text: action.text ?? skillRule.summary,
      });
    }
  });
}

// 统一进入 Boss 阶段，写入标签、时间线、预警和技能效果。
function enterBossPhase(
  state: FantasyLaneRuntimeState,
  phase: NonNullable<FantasyLaneLevelDefinition['boss']>['phases'][number],
  index: number,
  total: number,
) {
  const bossPhaseLabel = getBossPhaseRuntimeLabel(index, total);
  const skillLabels = phase.skills.map((skillId) => getBossSkillLabel(skillId));
  const enterText = skillLabels.length > 0
    ? `${phase.enterWarning}（技能：${skillLabels.join(' / ')}）`
    : phase.enterWarning;

  closePhaseTimelineEntry(state, 'boss', state.elapsedMs);
  state.currentBossPhaseId = phase.id;
  state.currentBossPhaseLabel = bossPhaseLabel;
  state.currentBossPhaseStartedAtMs = state.elapsedMs;
  state.phaseTimeline.push(createBossPhaseEntry(phase.id, bossPhaseLabel, state.elapsedMs, phase.hpThreshold));
  state.stats.bossPhasesEntered += 1;
  state.activeWarning = { id: phase.id, text: enterText, remainingMs: 4200 };
  pushRuntimeEvent(state, {
    type: 'bossPhaseEnter',
    phaseId: state.currentPhaseId,
    phaseLabel: state.phaseLabel,
    pressure: 'boss',
    bossPhaseId: phase.id,
    bossPhaseLabel,
    text: phase.enterWarning,
    amount: phase.hpThreshold,
  });
  pushDebugEvent(state, 'bossPhase', enterText);

  phase.phaseSpawnGroups?.forEach((group) => {
    for (let groupIndex = 0; groupIndex < group.count; groupIndex += 1) {
      state.scheduledEvents.push({
        id: `${phase.id}-${group.id}-${groupIndex}`,
        triggerAtMs: state.elapsedMs + group.firstDelaySec * 1000 + groupIndex * group.intervalSec * 1000,
        type: 'spawn',
        source: 'bossPhaseSpawn',
        phaseId: state.currentPhaseId,
        phaseLabel: state.phaseLabel,
        pressure: 'boss',
        bossPhaseId: phase.id,
        bossPhaseLabel,
        spawnGroup: group,
      });
    }
  });

  phase.skills.forEach((skillId) => {
    activateBossSkill(state, phase.id, bossPhaseLabel, skillId);
  });
}

// 处理 Boss 血量阈值阶段。
function processBossPhases(state: FantasyLaneRuntimeState) {
  const level = getLevel(state);
  if (!level.boss || !state.bossUnitInstanceId) return;
  const bossConfig = level.boss;

  const boss = state.units.find((unit) => unit.instanceId === state.bossUnitInstanceId);
  const bossDefinition = boss ? FANTASY_LANE_UNIT_MAP[boss.templateId] : null;
  if (!boss || !bossDefinition) return;

  const hpPercent = (boss.hp / bossDefinition.maxHp) * 100;
  bossConfig.phases.forEach((phase, index) => {
    if (state.triggeredBossPhases.includes(phase.id) || hpPercent > phase.hpThreshold) return;
    state.triggeredBossPhases.push(phase.id);
    enterBossPhase(state, phase, index, bossConfig.phases.length);
  });
}

// 清理死亡单位并结算击杀奖励。
function pruneUnits(state: FantasyLaneRuntimeState) {
  const defeated = state.units.filter((unit) => unit.hp <= 0);
  defeated.forEach((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    if (unit.side === 'enemy') {
      state.gold = Math.min(FANTASY_LANE_RUNTIME_CONSTANTS.maxGold, state.gold + 10 + definition.pop * 4);
    }
    if (unit.instanceId === state.bossUnitInstanceId) {
      state.gold = Math.min(FANTASY_LANE_RUNTIME_CONSTANTS.maxGold, state.gold + 40);
      state.bossUnitInstanceId = null;
      closePhaseTimelineEntry(state, 'boss', state.elapsedMs);
      state.currentBossPhaseId = null;
      state.currentBossPhaseLabel = null;
      state.currentBossPhaseStartedAtMs = null;
      pushRuntimeEvent(state, {
        type: 'bossDefeated',
        phaseId: state.currentPhaseId,
        phaseLabel: state.phaseLabel,
        pressure: 'boss',
        text: `${definition.name} 被击破`,
        unitId: unit.templateId,
        side: unit.side,
      });
    }
    pushDebugEvent(state, 'defeat', `${definition.name} 被击破`);
  });

  state.stats.defeated += defeated.length;
  state.units = state.units.filter((unit) => unit.hp > 0);
}

// 同步阶段标签，让 HUD、公式栏和逻辑都读同一份阶段信息。
function setPhaseMetadata(state: FantasyLaneRuntimeState) {
  const phase = getActiveLevelPhase(state);
  enterLevelPhase(state, phase);
  state.phaseLabel = state.currentBossPhaseLabel
    ? `${phase.label} · ${state.currentBossPhaseLabel}`
    : phase.label;
  state.pressureLabel = state.currentBossPhaseLabel
    ? `Boss 压力 · ${state.currentBossPhaseLabel}`
    : phase.pressure === 'boss'
      ? 'Boss 压力'
      : phase.label;
}

// 统一计算前线、空优和拥堵统计。
function updateBattleMetrics(state: FantasyLaneRuntimeState, deltaMs: number) {
  const buckets = getFantasyLaneUnitBuckets(state.units);
  const playerFront = getGroundFrontlineFromUnits(state.units, 'player');
  const enemyFront = getGroundFrontlineFromUnits(state.units, 'enemy');
  state.frontline = Math.round(playerFront - (100 - enemyFront));
  state.clashX = getBattleCenterFromFrontlines(playerFront, enemyFront);
  state.activePop = getActivePop(state.units, 'player');
  state.airControl = getAirControlDeltaFromUnits(state.units);

  const crowdedUnits = buckets.bySide.player.concat(buckets.bySide.enemy).filter((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    return unit.layer === 'ground' && unit.blockedMs > 320 && definition.footprint !== 'small';
  }).length;
  state.congestion = clamp(Math.round((crowdedUnits / Math.max(1, state.units.length)) * 100), 0, 100);
  if (state.congestion > 0) {
    state.stats.congestionMs += deltaMs;
  }
}

// 统一处理英雄技能和战术技能，保证都走同一条运行时效果链。
function applySkill(state: FantasyLaneRuntimeState, skillId: string) {
  if (skillId === state.heroSkill.id && state.heroSkill.remainingMs <= 0) {
    if (state.selectedHeroId === 'warlord') {
      addEffect(state.effects, 'player', 'haste', 0.22, 8500);
      state.units
        .filter((unit) => unit.side === 'player' && unit.layer === 'ground')
        .slice(0, 5)
        .forEach((unit) => {
          unit.armorHp += 110;
        });
      state.playerBaseHp = Math.min(state.playerBaseHpMax, state.playerBaseHp + 120);
    } else if (state.selectedHeroId === 'archmage') {
      addEffect(state.effects, 'enemy', 'freeze', 1, 2400);
      applyAreaDamage(
        state,
        FANTASY_LANE_UNIT_MAP['flame_warlock'],
        'player',
        'ground',
        state.clashX,
        0.62,
        90,
        8.5,
      );
      pushImpact(state, {
        x: state.clashX,
        y: 0.42,
        layer: 'ground',
        kind: 'skill',
        color: '#a855f7',
        remainingMs: 360,
      });
    } else {
      addEffect(state.effects, 'player', 'haste', 0.18, 8000);
      addEffect(state.effects, 'enemy', 'burnline', 56, 4800);
      state.enemyBaseHp = Math.max(0, state.enemyBaseHp - 170);
      pushImpact(state, {
        x: Math.max(state.clashX, 72),
        y: 0.24,
        layer: 'air',
        kind: 'skill',
        color: '#ef4444',
        remainingMs: 380,
      });
    }

    state.heroSkill.remainingMs = state.heroSkill.cooldownMs;
    state.stats.heroSkillCast += 1;
    state.stats.lastSkillCastAtMs = state.elapsedMs;
    pushSkillEffect(state, FANTASY_LANE_HERO_MAP[state.selectedHeroId].name, '#f59e0b');
    state.activeWarning = {
      id: `hero-${state.elapsedMs}`,
      text: `${FANTASY_LANE_HERO_MAP[state.selectedHeroId].name} 发动战场技能`,
      remainingMs: 3200,
    };
    pushDebugEvent(state, 'skill', `英雄技能：${FANTASY_LANE_HERO_MAP[state.selectedHeroId].name}`);
    return;
  }

  if (skillId !== state.tacticalSkill.id || state.tacticalSkill.remainingMs > 0) return;
  if (state.selectedTacticalId === 'fireball') {
    applyAreaDamage(
      state,
      FANTASY_LANE_UNIT_MAP['flame_warlock'],
      'player',
      'ground',
      Math.max(state.clashX, 62),
      0.64,
      160,
      7.8,
    );
  } else if (state.selectedTacticalId === 'heal') {
    state.playerBaseHp = Math.min(state.playerBaseHpMax, state.playerBaseHp + 210);
    state.units
      .filter((unit) => unit.side === 'player')
      .forEach((unit) => {
        const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
        unit.hp = Math.min(definition.maxHp, unit.hp + 92);
      });
  } else if (state.selectedTacticalId === 'haste') {
    addEffect(state.effects, 'player', 'haste', 0.2, 7000);
  } else if (state.selectedTacticalId === 'freeze') {
    addEffect(state.effects, 'enemy', 'freeze', 1, 2600);
  } else {
    state.playerBaseHp = Math.min(state.playerBaseHpMax, state.playerBaseHp + 100);
    state.units
      .filter((unit) => unit.side === 'player' && unit.layer === 'ground')
      .slice(0, 6)
      .forEach((unit) => {
        unit.armorHp += 120;
      });
  }

  state.tacticalSkill.remainingMs = state.tacticalSkill.cooldownMs;
  state.stats.tacticalSkillCast += 1;
  state.stats.lastSkillCastAtMs = state.elapsedMs;
  pushSkillEffect(state, state.tacticalSkill.name, '#3b82f6');
  state.activeWarning = {
    id: `tactical-${state.elapsedMs}`,
    text: `战术技能 ${state.tacticalSkill.name} 已执行`,
    remainingMs: 2800,
  };
  pushDebugEvent(state, 'skill', `战术技能：${state.tacticalSkill.name}`);
}

// 计算战斗奖励
function calculateBattleRewards(
  level: FantasyLaneLevelDefinition,
  stars: number,
  didWin: boolean,
  progress: FantasyLaneProgressData,
): FantasyLaneBattleRewards {
  const rewards: FantasyLaneBattleRewards = {
    unlockedUnits: [],
    fragments: {},
  };

  if (!didWin) return rewards;

  // 通关解锁单位
  const unlockRewards = level.unlockRewards || [];
  for (const unitId of unlockRewards) {
    if (!isUnitUnlocked(progress, unitId)) {
      rewards.unlockedUnits.push(unitId);
    }
  }

  // 碎片奖励
  const fragmentRewards = level.fragmentRewards || {};
  for (const [unitId, count] of Object.entries(fragmentRewards)) {
    rewards.fragments[unitId] = (rewards.fragments[unitId] || 0) + count;
  }

  // 星级奖励（Boss 关卡 3 星）
  if (stars === 3 && level.starRewards && level.starRewards[3]) {
    for (const unitId of level.starRewards[3]) {
      if (!isUnitUnlocked(progress, unitId)) {
        rewards.unlockedUnits.push(unitId);
      }
    }
  }

  return rewards;
}

// 统一生成战斗结算。
function finalizeBattle(state: FantasyLaneRuntimeState, level: FantasyLaneLevelDefinition, progress: FantasyLaneProgressData) {
  const didWin = state.enemyBaseHp <= 0;
  const basePercent = (state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100;
  const stars: 1 | 2 | 3 = didWin ? (basePercent >= 75 && !state.overtimeTriggered ? 3 : basePercent >= 50 ? 2 : 1) : 1;
  const averageEngageMs = state.stats.engagedUnits > 0 ? Math.round(state.stats.totalEngageDelayMs / state.stats.engagedUnits) : 0;
  const tips: string[] = [];

  closePhaseTimelineEntry(state, 'level', state.elapsedMs);
  closePhaseTimelineEntry(state, 'boss', state.elapsedMs);

  if (didWin) {
    tips.push(state.congestion > 45 ? '这局前线偏拥挤，但兵线还是压过去了。' : '前排和后排的接敌节奏比较顺。');
    tips.push(`人口 ${state.activePop}/${state.popLimit}，对空差值 ${state.airControl >= 0 ? '+' : ''}${state.airControl}。`);
    if (averageEngageMs > 0) tips.push(`平均接敌 ${averageEngageMs}ms，推进效率稳定。`);
  } else {
    if (state.stats.frontlineSummons < 4) tips.push(level.failureHints.lowFrontline ?? '前排人口明显不够，团战站不住。');
    if (level.recommendedTags.includes('antiAir') && state.stats.antiAirSummons < 3) tips.push(level.failureHints.lowAntiAir ?? '对空人口不足。');
    if (level.recommendedTags.includes('aoe') && state.stats.aoeSummons < 2) tips.push(level.failureHints.lowAoE ?? '群伤占比不够，清不掉密集团。');
    if (state.stats.goldCappedMs >= 12_000) tips.push(level.failureHints.overSavingGold ?? '金币囤太久，出兵节奏慢了。');
    if ((state.stats.heroSkillCast + state.stats.tacticalSkillCast) <= 1) tips.push(level.failureHints.lateSkillUse ?? '技能释放偏晚。');
  }

  // 计算奖励
  const rewards = calculateBattleRewards(level, stars, didWin, progress);

  const result: FantasyLaneBattleResult = {
    title: didWin ? '战线推进成功' : '战线失守',
    stars,
    score: Math.round(
      (didWin ? 1800 : 620)
      + state.playerBaseHp * 0.42
      + state.stats.defeated * 14
      + state.stats.aoeHits * 3
      + state.stats.projectilesFired * 2,
    ),
    summary: didWin ? `${level.id} ${level.name} 已突破。` : `${level.id} ${level.name} 未守住。`,
    tips: tips.slice(0, 3),
    rewards,
  };

  return {
    ...state,
    phase: didWin ? 'won' : 'lost',
    result,
    activeWarning: { id: didWin ? 'win' : 'lose', text: didWin ? '敌方主堡已被摧毁' : '我方主堡失守', remainingMs: 4800 },
  } satisfies FantasyLaneRuntimeState;
}

// 在每个 tick 末尾检查是否已经进入终局。
function maybeFinalizeBattle(state: FantasyLaneRuntimeState, level: FantasyLaneLevelDefinition, progress: FantasyLaneProgressData) {
  if (state.enemyBaseHp <= 0) return finalizeBattle(state, level, progress);
  if (state.playerBaseHp <= 0) return finalizeBattle(state, level, progress);
  if (state.overtimeTriggered && state.overtimeRemainingMs <= 0) return finalizeBattle(state, level, progress);
  return state;
}

// 创建新的基础战斗状态。
function createBaseState(
  levelId: string,
  heroId: FantasyLaneHeroId,
  tacticalId: FantasyLaneTacticalSkillId,
  loadout: string[],
): FantasyLaneRuntimeState {
  const level = getFantasyLaneLevelById(levelId);
  const hero = FANTASY_LANE_HERO_MAP[heroId] ?? FANTASY_LANE_HEROES[0];
  const tactical = FANTASY_LANE_TACTICAL_MAP[tacticalId] ?? FANTASY_LANE_TACTICAL_SKILLS[0];
  const safeLoadout = ensureLoadout(loadout);
  const progress = loadFantasyLaneProgress();
  const initialSeed = buildFantasyLaneDeterministicSeed(level.id, hero.id, tactical.id, safeLoadout);

  return {
    phase: 'setup',
    selectedLevelId: level.id,
    selectedChapterId: level.chapterId,
    selectedHeroId: hero.id,
    selectedTacticalId: tactical.id,
    loadoutUnitIds: safeLoadout,
    queue: [],
    queueLimit: FANTASY_LANE_RUNTIME_CONSTANTS.queueLimit,
    popLimit: FANTASY_LANE_RUNTIME_CONSTANTS.popLimit,
    activePop: 0,
    elapsedMs: 0,
    battleTimeLimitMs: level.battleTimeLimitMs,
    overtimeRemainingMs: FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs,
    overtimeTriggered: false,
    gold: level.startingGold,
    playerBaseHp: level.playerBaseHp,
    playerBaseHpMax: level.playerBaseHp,
    enemyBaseHp: level.enemyBaseHp,
    enemyBaseHpMax: level.enemyBaseHp,
    frontline: 0,
    airControl: 0,
    clashX: 50,
    congestion: 0,
    unitCooldowns: Object.fromEntries(FANTASY_LANE_UNITS.map((unit) => [unit.id, 0])),
    unitStarLevels: { ...(progress.unitStars ?? {}) },
    heroSkill: createSkillState(hero),
    tacticalSkill: createSkillState(tactical),
    globalSpawnCooldownMs: 0,
    enemySpawnCooldownMs: 0,
    units: [],
    projectiles: [],
    impacts: [],
    skillEffects: [],
    damageNumbers: [],
    effects: [],
    pressureLabel: level.phases[0]?.label ?? '备战阶段',
    phaseLabel: level.phases[0]?.label ?? '备战阶段',
    currentPhaseId: level.phases[0]?.id ?? `${level.id}-setup`,
    currentPhaseStartedAtMs: 0,
    currentBossPhaseId: null,
    currentBossPhaseLabel: null,
    currentBossPhaseStartedAtMs: null,
    lastHint: `已载入 ${level.id} ${level.name}。调整编组后开始战斗。`,
    activeWarning: null,
    result: null,
    rngSeed: initialSeed,
    scheduledEvents: buildScheduledEvents(level),
    triggeredBossPhases: [],
    bossUnitInstanceId: null,
    debugEvents: [],
    runtimeEvents: [],
    phaseTimeline: [],
    stats: createBattleStats(),
  };
}

// 给新局或旧快照补上首段阶段轨迹，避免第一帧之前缺少节奏信息。
function initializePhaseTracking(state: FantasyLaneRuntimeState) {
  const phase = getActiveLevelPhase(state);
  state.currentPhaseId = phase.id;
  state.currentPhaseStartedAtMs = state.elapsedMs;
  state.phaseLabel = phase.label;
  state.pressureLabel = phase.pressure === 'boss' ? 'Boss 压力' : phase.label;

  if (state.phaseTimeline.length === 0) {
    state.phaseTimeline.push(createLevelPhaseEntry(phase, state.elapsedMs));
  }
  if (state.stats.levelPhasesEntered === 0) {
    state.stats.levelPhasesEntered = 1;
  }
  if (!state.runtimeEvents.some((event) => event.type === 'levelPhaseEnter')) {
    pushRuntimeEvent(state, {
      atMs: state.elapsedMs,
      type: 'levelPhaseEnter',
      phaseId: phase.id,
      phaseLabel: phase.label,
      pressure: phase.pressure,
      text: `进入阶段：${phase.label}`,
    });
  }
}

// 恢复旧快照时补齐新增字段，避免结构升级后直接踩空。
function normalizePersistedState(persisted: FantasyLaneRuntimeState): FantasyLaneRuntimeState {
  const base = createBaseState(
    persisted.selectedLevelId ?? FANTASY_LANE_IDS.defaultLevelId,
    persisted.selectedHeroId ?? FANTASY_LANE_IDS.defaultHeroId,
    persisted.selectedTacticalId ?? FANTASY_LANE_IDS.defaultTacticalId,
    persisted.loadoutUnitIds ?? FANTASY_LANE_IDS.defaultLoadout,
  );
  const unitStarLevels = { ...base.unitStarLevels, ...(persisted.unitStarLevels ?? {}) };

  const next: FantasyLaneRuntimeState = {
    ...base,
    ...persisted,
    queue: [...(persisted.queue ?? [])],
    unitCooldowns: { ...base.unitCooldowns, ...(persisted.unitCooldowns ?? {}) },
    unitStarLevels,
    units: (persisted.units ?? []).map((unit) => {
      const starLevel = typeof unit.starLevel === 'number' ? unit.starLevel : unitStarLevels[unit.templateId] ?? 0;
      const battleBonus = getFantasyLaneUnitBattleBonus(starLevel);
      return {
        ...unit,
        starLevel,
        damageMultiplier: typeof unit.damageMultiplier === 'number' ? unit.damageMultiplier : battleBonus.damageMultiplier,
        healthMultiplier: typeof unit.healthMultiplier === 'number' ? unit.healthMultiplier : battleBonus.healthMultiplier,
        combatState: unit.combatState ? { ...unit.combatState } : undefined,
      };
    }),
    projectiles: (persisted.projectiles ?? []).map((projectile) => ({ ...projectile })),
    impacts: (persisted.impacts ?? []).map((impact) => ({ ...impact })),
    effects: (persisted.effects ?? []).map((effect) => ({ ...effect })),
    scheduledEvents: (persisted.scheduledEvents ?? base.scheduledEvents).map((event) => ({
      ...event,
      spawnGroup: event.spawnGroup ? { ...event.spawnGroup } : undefined,
    })),
    triggeredBossPhases: [...(persisted.triggeredBossPhases ?? [])],
    debugEvents: (persisted.debugEvents ?? []).map((event) => ({ ...event })),
    runtimeEvents: (persisted.runtimeEvents ?? []).map((event) => ({ ...event })),
    phaseTimeline: (persisted.phaseTimeline ?? []).map((entry) => ({ ...entry })),
    stats: { ...createBattleStats(), ...(persisted.stats ?? {}) },
    currentPhaseStartedAtMs: persisted.currentPhaseStartedAtMs ?? 0,
    currentBossPhaseId: persisted.currentBossPhaseId ?? null,
    currentBossPhaseLabel: persisted.currentBossPhaseLabel ?? null,
    currentBossPhaseStartedAtMs: persisted.currentBossPhaseStartedAtMs ?? null,
  };

  if (next.phase === 'playing' || next.phase === 'paused') {
    initializePhaseTracking(next);
    setPhaseMetadata(next);
  }
  return next;
}

// 从快照恢复战斗状态，否则创建新状态。
function createInitialState(snapshot?: Record<string, unknown> | null): FantasyLaneRuntimeState {
  const persisted = snapshot && typeof snapshot === 'object' && 'state' in snapshot
    ? (snapshot.state as FantasyLaneRuntimeState | undefined)
    : undefined;
  if (persisted) return normalizePersistedState(persisted);
  return createBaseState(
    FANTASY_LANE_IDS.defaultLevelId,
    FANTASY_LANE_IDS.defaultHeroId,
    FANTASY_LANE_IDS.defaultTacticalId,
    FANTASY_LANE_IDS.defaultLoadout,
  );
}

// 开始战斗时重建一份干净的运行时状态。
function startBattle(state: FantasyLaneRuntimeState) {
  const next = createBaseState(state.selectedLevelId, state.selectedHeroId, state.selectedTacticalId, state.loadoutUnitIds);
  next.phase = 'playing';
  next.lastHint = '主战场已展开，开始压上兵线。';
  initializePhaseTracking(next);
  return next;
}

// 暂停战斗。
function pauseBattle(state: FantasyLaneRuntimeState) {
  return state.phase === 'playing' ? { ...state, phase: 'paused' as const } : state;
}

// 恢复战斗。
function resumeBattle(state: FantasyLaneRuntimeState) {
  return state.phase === 'paused' ? { ...state, phase: 'playing' as const } : state;
}

// 重新开始当前关卡。
function restartBattle(state: FantasyLaneRuntimeState) {
  return startBattle(state);
}

// 在 setup 阶段切换关卡。
function selectLevel(state: FantasyLaneRuntimeState, levelId: string) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法直接切换关卡。' };
  }
  return createBaseState(levelId, state.selectedHeroId, state.selectedTacticalId, state.loadoutUnitIds);
}

// 在 setup 阶段切换英雄。
function selectHero(state: FantasyLaneRuntimeState, heroId: FantasyLaneHeroId) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法修改英雄。' };
  }
  return createBaseState(state.selectedLevelId, heroId, state.selectedTacticalId, state.loadoutUnitIds);
}

// 在 setup 阶段切换战术技能。
function selectTacticalSkill(state: FantasyLaneRuntimeState, skillId: FantasyLaneTacticalSkillId) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法修改战术。' };
  }
  return createBaseState(state.selectedLevelId, state.selectedHeroId, skillId, state.loadoutUnitIds);
}

// 在 setup 阶段切换编组。
function toggleLoadoutUnit(state: FantasyLaneRuntimeState, unitId: string) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法修改编组。' };
  }
  if (!FANTASY_LANE_UNIT_MAP[unitId]) return state;

  const loadout = [...state.loadoutUnitIds];
  const index = loadout.indexOf(unitId);
  if (index >= 0) {
    loadout.splice(index, 1);
  } else if (loadout.length < 8) {
    loadout.push(unitId);
  } else {
    return { ...state, lastHint: '编组槽位已满，最多 8 种兵。' };
  }

  if (getLoadoutPop(loadout) > state.popLimit + 4) {
    return { ...state, lastHint: '这套编组过重，建议降低总人口权重。' };
  }
  return createBaseState(state.selectedLevelId, state.selectedHeroId, state.selectedTacticalId, loadout);
}

// 下达出兵指令时立即扣费，但真正部署仍受统一出兵流程限制。
function queueUnit(state: FantasyLaneRuntimeState, unitId: string) {
  if (state.phase !== 'playing') return state;
  if (!state.loadoutUnitIds.includes(unitId)) return { ...state, lastHint: '该兵种不在本局编组内。' };
  if (state.queue.length >= state.queueLimit) {
    return {
      ...state,
      lastHint: '指令队列已满。',
      stats: { ...state.stats, queueBlocked: state.stats.queueBlocked + 1 },
    };
  }

  const definition = FANTASY_LANE_UNIT_MAP[unitId];
  if (!definition) return state;
  if (state.gold < definition.cost) return { ...state, lastHint: `${definition.name} 需要 ${definition.cost} 金币。` };
  if (state.unitCooldowns[unitId] > 0) return { ...state, lastHint: `${definition.name} 仍在冷却。` };

  return {
    ...state,
    gold: Math.max(0, state.gold - definition.cost),
    queue: [...state.queue, unitId],
    unitCooldowns: { ...state.unitCooldowns, [unitId]: definition.cooldownMs },
    lastHint: `${definition.name} 已加入出兵队列。`,
    stats: { ...state.stats, goldSpent: state.stats.goldSpent + definition.cost },
  };
}

// 对外暴露统一技能施放入口。
function castSkill(state: FantasyLaneRuntimeState, skillId: string) {
  if (state.phase !== 'playing') return state;
  const next = cloneRuntimeStateForMutation(state);
  applySkill(next, skillId);
  return next;
}

// 战斗主循环。
function tick(state: FantasyLaneRuntimeState, deltaMs: number): FantasyLaneRuntimeState {
  return fantasyLaneBattleLoop.step(state, deltaMs);
}

// 鎴樻枟涓诲惊鐜€?
const EMPTY_PROGRESS_FOR_RUNTIME_TICK: FantasyLaneProgressData = {
  completedLevels: [],
  levelRecords: {},
  totalCompleted: 0,
  totalStars: 0,
  bestScore: 0,
  highestUnlockedLevelId: '1-1',
  highestChapterId: 'chapter-1',
  lastPlayedLevelId: '1-1',
  updatedAt: 0,
  runtimeTotals: {
    summoned: 0,
    defeated: 0,
    queueBlocked: 0,
    projectilesFired: 0,
    aoeHits: 0,
    frontlineSummons: 0,
    antiAirSummons: 0,
    aoeSummons: 0,
    goldSpent: 0,
    goldCappedMs: 0,
    congestionMs: 0,
    engagedUnits: 0,
    totalEngageDelayMs: 0,
    heroSkillCast: 0,
    tacticalSkillCast: 0,
    lastSkillCastAtMs: null,
    averageEngageTimeMs: 0,
  },
  telemetryRunCount: 0,
  chapterRecords: {},
  battleTotals: {
    totalRuns: 0,
    wins: 0,
    losses: 0,
    bossRuns: 0,
    bossClears: 0,
    phaseEntries: {},
    bossPhaseTriggers: {},
  },
  unlockedUnits: [],
  unitFragments: {},
  unitStars: {},
  loadoutPresets: createDefaultFantasyLaneLoadoutPresets(),
};

/* function handleOvertimeTriggered(state: FantasyLaneRuntimeState) {
  addEffect(state.effects, 'both', 'haste', 0.08, FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs);
  state.heroSkill.remainingMs = Math.max(0, state.heroSkill.remainingMs - 7000);
  state.tacticalSkill.remainingMs = Math.max(0, state.tacticalSkill.remainingMs - 6000);
  state.activeWarning = { id: 'overtime', text: '杩涘叆缁堝眬鍔犲帇锛?5 绉掑唴蹇呴』鏀跺彛銆?, remainingMs: 4200 };
  pushDebugEvent(state, 'overtime', '杩涘叆缁堝眬鍔犲帇');
  pushRuntimeEvent(state, {
    type: 'overtime',
    phaseId: state.currentPhaseId,
    phaseLabel: state.phaseLabel,
    pressure: 'overtime',
    text: '杩涘叆缁堝眬鍔犲帇',
  });
}

*/

function handleOvertimeTriggered(state: FantasyLaneRuntimeState) {
  addEffect(state.effects, 'both', 'haste', 0.08, FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs);
  state.heroSkill.remainingMs = Math.max(0, state.heroSkill.remainingMs - 7000);
  state.tacticalSkill.remainingMs = Math.max(0, state.tacticalSkill.remainingMs - 6000);
  state.activeWarning = { id: 'overtime', text: 'Overtime pressure started', remainingMs: 4200 };
  pushDebugEvent(state, 'overtime', 'Overtime pressure started');
  pushRuntimeEvent(state, {
    type: 'overtime',
    phaseId: state.currentPhaseId,
    phaseLabel: state.phaseLabel,
    pressure: 'overtime',
    text: 'Overtime pressure started',
  });
}

const fantasyLaneBattleLoop = createFantasyLaneBattleLoop({
  cloneStateForMutation: cloneRuntimeStateForMutation,
  prelude: {
    maxGold: FANTASY_LANE_RUNTIME_CONSTANTS.maxGold,
    overtimeDurationMs: FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs,
    goldCappedThreshold: 220,
    getIncomePerSecond: getIncomePerSecondByRules,
    setPhaseMetadata,
    onOvertimeTriggered: handleOvertimeTriggered,
  },
  systems: {
    setPhaseMetadata,
    processScheduledEvents,
    processPlayerQueue,
    processImpacts,
    processProjectiles,
    processBurnline,
    processSideLayer,
    pruneUnits,
    processBossPhases,
    updateBattleMetrics,
  },
  finalize: {
    getLevel,
    maybeFinalizeBattle,
    emptyProgress: EMPTY_PROGRESS_FOR_RUNTIME_TICK,
  },
});


/*
  if (!next.overtimeTriggered && next.elapsedMs >= next.battleTimeLimitMs) {
    next.overtimeTriggered = true;
    next.overtimeRemainingMs = FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs;
    addEffect(next.effects, 'both', 'haste', 0.08, FANTASY_LANE_RUNTIME_CONSTANTS.overtimeDurationMs);
    next.heroSkill.remainingMs = Math.max(0, next.heroSkill.remainingMs - 7000);
    next.tacticalSkill.remainingMs = Math.max(0, next.tacticalSkill.remainingMs - 6000);
    next.activeWarning = { id: 'overtime', text: '进入终局加压：45 秒内必须收口。', remainingMs: 4200 };
    pushDebugEvent(next, 'overtime', '进入终局加压');
    pushRuntimeEvent(next, {
      type: 'overtime',
      phaseId: next.currentPhaseId,
      phaseLabel: next.phaseLabel,
      pressure: 'overtime',
      text: '进入终局加压',
    });
  }

  processScheduledEvents(next);
  processPlayerQueue(next);
  processProjectiles(next, deltaMs);
  processBurnline(next, deltaMs);
  processSideLayer(next, 'player', 'ground', deltaMs);
  processSideLayer(next, 'enemy', 'ground', deltaMs);
  processSideLayer(next, 'player', 'air', deltaMs);
  processSideLayer(next, 'enemy', 'air', deltaMs);
  pruneUnits(next);
  processBossPhases(next);
  updateBattleMetrics(next, deltaMs);
  setPhaseMetadata(next);

  const level = getLevel(next);
  const emptyProgress: FantasyLaneProgressData = {
    completedLevels: [],
    levelRecords: {},
    totalCompleted: 0,
    totalStars: 0,
    bestScore: 0,
    highestUnlockedLevelId: '1-1',
    highestChapterId: 'chapter-1',
    lastPlayedLevelId: '1-1',
    updatedAt: Date.now(),
    runtimeTotals: {
      summoned: 0, defeated: 0, queueBlocked: 0, projectilesFired: 0,
      aoeHits: 0, frontlineSummons: 0, antiAirSummons: 0, aoeSummons: 0,
      goldSpent: 0, goldCappedMs: 0, congestionMs: 0, engagedUnits: 0,
      totalEngageDelayMs: 0, heroSkillCast: 0, tacticalSkillCast: 0,
      lastSkillCastAtMs: null, averageEngageTimeMs: 0,
    },
    telemetryRunCount: 0,
    chapterRecords: {},
    battleTotals: {
      totalRuns: 0, wins: 0, losses: 0, bossRuns: 0, bossClears: 0,
      phaseEntries: {}, bossPhaseTriggers: {},
    },
    unlockedUnits: [],
    unitFragments: {},
    unitStars: {},
  };

  return maybeFinalizeBattle(next, level, emptyProgress);
}
*/

// 给公式栏生成一行当前局摘要。
function getFormulaText(state: FantasyLaneRuntimeState) {
  const level = getLevel(state);
  if (state.phase === 'setup') {
    return `=${level.id} ${level.name} | 编组 ${state.loadoutUnitIds.length}/8 | 人口权重 ${getLoadoutPop(state.loadoutUnitIds)}`;
  }
  if (state.phase === 'playing') {
    return `=${level.id} | ${state.phaseLabel} | 金币 ${Math.round(state.gold)} | 人口 ${state.activePop}/${state.popLimit} | 对空差值 ${state.airControl >= 0 ? '+' : ''}${state.airControl}`;
  }
  if (state.phase === 'paused') {
    return `=${level.id} | 已暂停 | 指令 ${state.queue.length}/${state.queueLimit}`;
  }
  return `=${level.id} | ${state.result?.title ?? '战斗结束'} | 评分 ${state.result?.score ?? 0}`;
}

// 给工作簿状态栏生成简洁摘要。
function getStatusSummary(state: FantasyLaneRuntimeState): WorkbookStatusSummary {
  const level = getLevel(state);
  return {
    isPlaying: state.phase === 'playing',
    primaryText:
      state.phase === 'setup'
        ? `${level.id} ${level.name}`
        : state.phase === 'playing'
          ? `敌堡 ${Math.round(state.enemyBaseHp)} / 我方 ${Math.round(state.playerBaseHp)}`
          : state.result?.title ?? `${level.id} 结算`,
    score: state.result?.score,
    secondaryMetric: state.phase === 'playing' ? `人口 ${state.activePop}/${state.popLimit}` : `编组 ${state.loadoutUnitIds.length}/8`,
    tertiaryMetric: state.phase === 'playing' ? `前线 ${state.frontline > 0 ? '+' : ''}${state.frontline}` : `推荐 ${level.recommendedTags.join('/')}`,
    mode: '单主战场',
    alertTone:
      state.phase === 'won'
        ? 'success'
        : state.phase === 'lost'
          ? 'danger'
          : state.phase === 'playing' && (state.playerBaseHp < state.playerBaseHpMax * 0.35 || state.airControl < -2)
            ? 'warning'
            : 'neutral',
  };
}

export const fantasyLaneRuntimeAdapter: FantasyLaneRuntimeAdapter = {
  getChapters: getFantasyLaneChapters,
  getLevels: getFantasyLaneLevels,
  getHeroes: () => FANTASY_LANE_HEROES,
  getTacticalSkills: () => FANTASY_LANE_TACTICAL_SKILLS,
  getUnits: () => FANTASY_LANE_UNITS,
  createInitialState,
  startBattle,
  pauseBattle,
  resumeBattle,
  restartBattle,
  tick,
  selectLevel,
  selectHero,
  selectTacticalSkill,
  toggleLoadoutUnit,
  queueUnit,
  castSkill,
  getFormulaText,
  getStatusSummary,
};

// 对外暴露统一章节名查询，避免 UI 层自己再扫一遍章节表。
export function getFantasyLaneChapterName(chapterId: string) {
  return FANTASY_LANE_CHAPTERS.find((chapter) => chapter.id === chapterId)?.name ?? chapterId;
}

// 给编组页输出最低限度的风险提示。
export function getFantasyLaneRecommendedLoadoutWarnings(loadoutUnitIds: string[], levelId: string) {
  const units = loadoutUnitIds.map((unitId) => FANTASY_LANE_UNIT_MAP[unitId]).filter(Boolean);
  const level = getFantasyLaneLevelById(levelId);
  const frontlinePop = units.filter((unit) => unit.tags.includes('frontline')).reduce((sum, unit) => sum + unit.pop, 0);
  const antiAirPop = units.filter((unit) => unit.tags.includes('antiAir')).reduce((sum, unit) => sum + unit.pop, 0);
  const aoePop = units.filter((unit) => unit.tags.includes('aoe')).reduce((sum, unit) => sum + unit.pop, 0);
  const siegePop = units.filter((unit) => unit.tags.includes('siege')).reduce((sum, unit) => sum + unit.pop, 0);
  const heavyLoad = units.filter((unit) => unit.pop >= 4).reduce((sum, unit) => sum + unit.pop, 0);

  const warnings: string[] = [];
  if (frontlinePop < 4) warnings.push('前排人口偏低');
  if (level.recommendedTags.includes('antiAir') && antiAirPop < 3) warnings.push('对空不足');
  if (level.recommendedTags.includes('aoe') && aoePop < 2) warnings.push('AOE 偏少');
  if (level.recommendedTags.includes('finisher') && siegePop < 4) warnings.push('缺少攻城收尾');
  if (heavyLoad > 10) warnings.push('高费过多');
  return warnings;
}

// 对外暴露统一战场中心计算，后续 UI 可以直接复用。
export function getBattleCenter(state: FantasyLaneRuntimeState) {
  const playerFront = getGroundFrontlineFromUnits(state.units, 'player');
  const enemyFront = getGroundFrontlineFromUnits(state.units, 'enemy');
  return getBattleCenterFromFrontlines(playerFront, enemyFront);
}

// 对外暴露统一地面前线坐标。
export function getGroundFrontline(state: FantasyLaneRuntimeState, side: FantasyLaneSide) {
  return getGroundFrontlineFromUnits(state.units, side);
}

// 对外暴露统一空优差值。
export function getAirControlDelta(state: FantasyLaneRuntimeState) {
  return getAirControlDeltaFromUnits(state.units);
}

// 对外暴露统一我方出生点。
export function getPlayerSpawnX() {
  return getPlayerSpawnXFromRules();
}

// 对外暴露统一敌方出生点。
export function getEnemySpawnX() {
  return getEnemySpawnXFromRules();
}
