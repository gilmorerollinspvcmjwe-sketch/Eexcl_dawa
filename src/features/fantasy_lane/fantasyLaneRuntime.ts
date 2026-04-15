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
import type {
  FantasyLaneBattleResult,
  FantasyLaneDamageType,
  FantasyLaneEffectState,
  FantasyLaneHeroDefinition,
  FantasyLaneHeroId,
  FantasyLaneImpactEffect,
  FantasyLaneLayer,
  FantasyLaneLevelDefinition,
  FantasyLaneProjectile,
  FantasyLaneRuntimeAdapter,
  FantasyLaneRuntimeState,
  FantasyLaneScheduledEvent,
  FantasyLaneSide,
  FantasyLaneTacticalSkillDefinition,
  FantasyLaneTacticalSkillId,
  FantasyLaneUnitDefinition,
  FantasyLaneUnitInstance,
} from './fantasyLaneTypes.ts';
import { FANTASY_LANE_IDS } from './fantasyLaneTypes.ts';

const MAX_GOLD = 320;
const POP_LIMIT = 18;
const PLAYER_SPAWN_X = 8;
const ENEMY_SPAWN_X = 92;
const PLAYER_BASE_X = 3;
const ENEMY_BASE_X = 97;
const GLOBAL_SPAWN_COOLDOWN_MS = 320;
const ENEMY_SPAWN_COOLDOWN_MS = 420;
const OVERTIME_DURATION_MS = 45000;

const DAMAGE_MULTIPLIER: Record<FantasyLaneDamageType, Record<string, number>> = {
  physical: { light: 1, heavy: 0.82, swarm: 0.9, air: 0, structure: 0.58 },
  pierce: { light: 0.88, heavy: 1.25, swarm: 0.76, air: 0.72, structure: 0.7 },
  blast: { light: 0.8, heavy: 0.92, swarm: 1.42, air: 0.9, structure: 0.82 },
  magic: { light: 1, heavy: 1.08, swarm: 1, air: 0.95, structure: 0.72 },
  siege: { light: 0.68, heavy: 0.95, swarm: 0.84, air: 0.45, structure: 1.85 },
  antiAir: { light: 0.7, heavy: 0.76, swarm: 0.9, air: 1.55, structure: 0.4 },
};

function cloneState(state: FantasyLaneRuntimeState): FantasyLaneRuntimeState {
  return {
    ...state,
    queue: [...state.queue],
    unitCooldowns: { ...state.unitCooldowns },
    units: state.units.map((unit) => ({ ...unit })),
    projectiles: state.projectiles.map((projectile) => ({ ...projectile })),
    impacts: state.impacts.map((impact) => ({ ...impact })),
    effects: state.effects.map((effect) => ({ ...effect })),
    scheduledEvents: state.scheduledEvents.map((event) => ({ ...event, spawnGroup: event.spawnGroup ? { ...event.spawnGroup } : undefined })),
    triggeredBossPhases: [...state.triggeredBossPhases],
    activeWarning: state.activeWarning ? { ...state.activeWarning } : null,
    stats: { ...state.stats },
    result: state.result ? { ...state.result, tips: [...state.result.tips] } : null,
  };
}

function createSkillState(hero: FantasyLaneHeroDefinition | FantasyLaneTacticalSkillDefinition) {
  return { id: hero.id, name: hero.name, summary: hero.summary, cooldownMs: hero.cooldownMs, remainingMs: 0 };
}

function buildScheduledEvents(level: FantasyLaneLevelDefinition): FantasyLaneScheduledEvent[] {
  const events: FantasyLaneScheduledEvent[] = [];
  level.phases.forEach((phase) => {
    phase.spawnGroups.forEach((group) => {
      for (let index = 0; index < group.count; index += 1) {
        events.push({
          id: `${group.id}-${index + 1}`,
          triggerAtMs: phase.startAtSec * 1000 + group.firstDelaySec * 1000 + index * group.intervalSec * 1000,
          type: 'spawn',
          spawnGroup: group,
        });
      }
    });
    phase.scriptedEvents?.forEach((trigger) => {
      trigger.actions.forEach((action, index) => {
        events.push({
          id: `${trigger.id}-${index}`,
          triggerAtMs: trigger.value * 1000,
          type: action.type === 'showWarning' ? 'warning' : action.type === 'grantGold' ? 'grantGold' : action.type === 'applyModifier' ? 'modifier' : 'spawn',
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

function ensureLoadout(loadoutUnitIds: string[]) {
  const next = Array.from(new Set(loadoutUnitIds.filter((unitId) => Boolean(FANTASY_LANE_UNIT_MAP[unitId]))));
  if (next.length === 0) return [...FANTASY_LANE_IDS.defaultLoadout];
  return next.slice(0, 8);
}

function getLevel(state: FantasyLaneRuntimeState) {
  return getFantasyLaneLevelById(state.selectedLevelId);
}

function mapLaneToLayer(lane?: string): FantasyLaneLayer {
  return lane === 'air' ? 'air' : 'ground';
}

function resolveInstanceLane(unit: FantasyLaneUnitDefinition, laneOverride?: string) {
  if (laneOverride === 'front' || laneOverride === 'mid' || laneOverride === 'rear' || laneOverride === 'air') {
    return laneOverride;
  }
  return unit.lane;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function edgeDistance(source: FantasyLaneUnitInstance, sourceDefinition: FantasyLaneUnitDefinition, target: FantasyLaneUnitInstance, targetDefinition: FantasyLaneUnitDefinition) {
  return Math.abs(target.x - source.x) - (sourceDefinition.collisionRadius + targetDefinition.collisionRadius);
}

function getTargetKey(target: FantasyLaneUnitDefinition) {
  return target.layer === 'air' ? 'air' : target.armorClass;
}

function getDamageMultiplier(source: FantasyLaneUnitDefinition, target: FantasyLaneUnitDefinition | 'base') {
  if (target === 'base') return DAMAGE_MULTIPLIER[source.damageType].structure;
  return DAMAGE_MULTIPLIER[source.damageType][getTargetKey(target)] ?? 1;
}

function getLoadoutPop(loadout: string[]) {
  return loadout.reduce((sum, unitId) => sum + (FANTASY_LANE_UNIT_MAP[unitId]?.pop ?? 0), 0);
}

function getActivePop(units: FantasyLaneUnitInstance[], side: FantasyLaneSide) {
  return units
    .filter((unit) => unit.side === side)
    .reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
}

function getLayerBaseY(layer: FantasyLaneLayer, rangeBand: FantasyLaneUnitDefinition['rangeBand']) {
  if (layer === 'air') return rangeBand === 'melee' ? 0.28 : 0.2;
  return rangeBand === 'melee' ? 0.78 : 0.64;
}

function createUnitY(seed: number, layer: FantasyLaneLayer, rangeBand: FantasyLaneUnitDefinition['rangeBand']) {
  const band = getLayerBaseY(layer, rangeBand);
  const jitter = (((seed % 7) - 3) * 0.014);
  return clamp(band + jitter, 0.12, 0.88);
}

function getFriendlySpacingThreshold(definition: FantasyLaneUnitDefinition) {
  const footprintScale =
    definition.footprint === 'giant'
      ? 0.16
      : definition.footprint === 'large'
        ? 0.13
        : definition.footprint === 'medium'
          ? 0.11
          : 0.09;
  return definition.layer === 'air' ? footprintScale * 0.9 : footprintScale;
}

function pushImpact(state: FantasyLaneRuntimeState, input: Omit<FantasyLaneImpactEffect, 'id'>) {
  state.impacts.push({
    id: `impact-${state.rngSeed++}`,
    ...input,
  });
}

function createBaseState(levelId: string, heroId: FantasyLaneHeroId, tacticalId: FantasyLaneTacticalSkillId, loadout: string[]): FantasyLaneRuntimeState {
  const level = getFantasyLaneLevelById(levelId);
  const hero = FANTASY_LANE_HERO_MAP[heroId] ?? FANTASY_LANE_HEROES[0];
  const tactical = FANTASY_LANE_TACTICAL_MAP[tacticalId] ?? FANTASY_LANE_TACTICAL_SKILLS[0];
  const safeLoadout = ensureLoadout(loadout);

  return {
    phase: 'setup',
    selectedLevelId: level.id,
    selectedChapterId: level.chapterId,
    selectedHeroId: hero.id,
    selectedTacticalId: tactical.id,
    loadoutUnitIds: safeLoadout,
    queue: [],
    queueLimit: 5,
    popLimit: POP_LIMIT,
    activePop: 0,
    elapsedMs: 0,
    battleTimeLimitMs: level.battleTimeLimitMs,
    overtimeRemainingMs: OVERTIME_DURATION_MS,
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
    heroSkill: createSkillState(hero),
    tacticalSkill: createSkillState(tactical),
    globalSpawnCooldownMs: 0,
    enemySpawnCooldownMs: 0,
    units: [],
    projectiles: [],
    impacts: [],
    effects: [],
    pressureLabel: level.phases[0]?.label ?? '备战阶段',
    phaseLabel: level.phases[0]?.label ?? '备战阶段',
    currentPhaseId: level.phases[0]?.id ?? `${level.id}-setup`,
    lastHint: `已载入 ${level.id} ${level.name}。调整编组后开始战斗。`,
    activeWarning: null,
    result: null,
    rngSeed: 1,
    scheduledEvents: buildScheduledEvents(level),
    triggeredBossPhases: [],
    bossUnitInstanceId: null,
    stats: {
      summoned: 0,
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
      lastSkillCastAtMs: null,
    },
  };
}

function setPhaseMetadata(state: FantasyLaneRuntimeState) {
  const level = getLevel(state);
  const phase =
    level.phases.find((item) => {
      const startMs = item.startAtSec * 1000;
      const endMs = item.endAtSec ? item.endAtSec * 1000 : Number.POSITIVE_INFINITY;
      return state.elapsedMs >= startMs && state.elapsedMs < endMs;
    }) ?? level.phases[level.phases.length - 1];

  state.currentPhaseId = phase.id;
  state.phaseLabel = phase.label;
  state.pressureLabel = phase.pressure === 'boss' ? 'Boss 压力' : phase.label;
}

function getIncomePerSecond(elapsedMs: number, gold: number, overtimeTriggered: boolean) {
  let income = elapsedMs < 90000 ? 9.5 : elapsedMs < 210000 ? 11 : elapsedMs < 360000 ? 12.5 : 14;
  if (gold >= 290) income *= 0.2;
  else if (gold >= 230) income *= 0.55;
  return overtimeTriggered ? income * 1.22 : income;
}

function addEffect(effects: FantasyLaneEffectState[], target: FantasyLaneSide | 'both', kind: FantasyLaneEffectState['kind'], potency: number, durationMs: number) {
  const existing = effects.find((effect) => effect.target === target && effect.kind === kind);
  if (existing) {
    existing.potency = Math.max(existing.potency, potency);
    existing.remainingMs = Math.max(existing.remainingMs, durationMs);
    return;
  }
  effects.push({ id: `${target}-${kind}-${Math.random()}`, target, kind, potency, remainingMs: durationMs });
}

function getSideSpeedMultiplier(state: FantasyLaneRuntimeState, side: FantasyLaneSide) {
  const haste = state.effects
    .filter((effect) => effect.kind === 'haste' && (effect.target === side || effect.target === 'both'))
    .reduce((sum, effect) => sum + effect.potency, 0);
  const frozen = state.effects.some((effect) => effect.kind === 'freeze' && (effect.target === side || effect.target === 'both'));
  const overtime = state.overtimeTriggered ? 0.08 : 0;
  return frozen ? 0 : 1 + haste + overtime;
}

function canSpawnUnit(state: FantasyLaneRuntimeState, unitId: string, side: FantasyLaneSide) {
  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  if (!unit) return false;
  const activePop = getActivePop(state.units, side);
  const activeGiants = state.units.filter((item) => item.side === side && FANTASY_LANE_UNIT_MAP[item.templateId]?.footprint === 'giant').length;
  if (activePop + unit.pop > POP_LIMIT) return false;
  if (unit.footprint === 'giant' && activeGiants >= 2) return false;
  return true;
}

function spawnUnit(state: FantasyLaneRuntimeState, unitId: string, side: FantasyLaneSide, laneOverride?: string) {
  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  if (!unit || !canSpawnUnit(state, unitId, side)) return false;
  const layer = laneOverride ? mapLaneToLayer(laneOverride) : unit.layer;
  const lane = resolveInstanceLane(unit, laneOverride);
  const seed = state.rngSeed++;
  const instanceId = `${side}-${unitId}-${seed}`;
  state.units.push({
    instanceId,
    templateId: unitId,
    side,
    layer,
    lane,
    x: side === 'player' ? PLAYER_SPAWN_X : ENEMY_SPAWN_X,
    y: createUnitY(seed, layer, unit.rangeBand),
    hp: unit.maxHp,
    armorHp: unit.armorHp,
    attackCooldownMs: Math.round(unit.attackIntervalMs * 0.4),
    attackAnimMs: 0,
    hitFlashMs: 0,
    blockedMs: 0,
    lastTargetId: null,
    spawnedAtMs: state.elapsedMs,
  });
  if (side === 'player') {
    state.stats.summoned += 1;
    if (unit.tags.includes('frontline')) state.stats.frontlineSummons += unit.pop;
    if (unit.tags.includes('antiAir')) state.stats.antiAirSummons += unit.pop;
    if (unit.tags.includes('aoe')) state.stats.aoeSummons += unit.pop;
  } else if (state.bossUnitInstanceId === null && getLevel(state).boss?.unitId === unitId) {
    state.bossUnitInstanceId = instanceId;
  }
  return true;
}

function canTargetUnit(source: FantasyLaneUnitDefinition, target: FantasyLaneUnitDefinition) {
  if (source.targetRule === 'both') return true;
  if (source.targetRule === 'ground_only') return target.layer === 'ground';
  return target.layer === 'air';
}

function getTargetScore(source: FantasyLaneUnitDefinition, target: FantasyLaneUnitDefinition, distance: number) {
  let score = distance;
  score -= target.pop * 0.18;
  if (source.damageProfile === 'single' && (target.footprint === 'large' || target.footprint === 'giant')) score -= 2.2;
  if (source.damageProfile === 'aoe' && (target.armorClass === 'swarm' || target.footprint === 'small')) score -= 2.4;
  if (source.targetRule !== 'ground_only' && target.layer === 'air') score -= 1.5;
  if (target.role === 'siege' || target.role === 'caster' || target.role === 'finisher') score -= 1.1;
  return score;
}

function getPreferredTarget(state: FantasyLaneRuntimeState, unit: FantasyLaneUnitInstance, definition: FantasyLaneUnitDefinition) {
  return state.units
    .filter((target) => {
      if (target.side === unit.side) return false;
      const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
      if (!targetDefinition) return false;
      if (!canTargetUnit(definition, targetDefinition)) return false;
      if (definition.layer === 'ground' && definition.rangeBand === 'melee' && target.layer === 'air') return false;
      return unit.side === 'player' ? target.x >= unit.x - 1.5 : target.x <= unit.x + 1.5;
    })
    .sort((left, right) => {
      const leftDefinition = FANTASY_LANE_UNIT_MAP[left.templateId];
      const rightDefinition = FANTASY_LANE_UNIT_MAP[right.templateId];
      return getTargetScore(definition, leftDefinition, Math.abs(left.x - unit.x)) - getTargetScore(definition, rightDefinition, Math.abs(right.x - unit.x));
    })[0] ?? null;
}

function applyDamageToUnit(unit: FantasyLaneUnitInstance, amount: number) {
  let remaining = amount;
  if (unit.armorHp > 0) {
    const absorbed = Math.min(unit.armorHp, remaining);
    unit.armorHp -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) unit.hp -= remaining;
  unit.hitFlashMs = 180;
}

function applyAoEDamage(
  state: FantasyLaneRuntimeState,
  sourceDefinition: FantasyLaneUnitDefinition,
  side: FantasyLaneSide,
  layer: FantasyLaneLayer,
  x: number,
  y: number,
  amount: number,
  radius: number,
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
    const falloff = clamp(1 - distance / Math.max(radius, 0.01), 0.35, 1);
    applyDamageToUnit(target, amount * 0.48 * falloff * getDamageMultiplier(sourceDefinition, targetDefinition));
    hits += 1;
  });
  if (hits > 0) state.stats.aoeHits += hits;
  pushImpact(state, {
    x,
    y,
    layer,
    kind: 'aoe',
    color: sourceDefinition.attackColor,
    remainingMs: 260,
  });
}

function launchProjectile(
  state: FantasyLaneRuntimeState,
  source: FantasyLaneUnitInstance,
  sourceDefinition: FantasyLaneUnitDefinition,
  target: FantasyLaneUnitInstance | null,
  targetBase: boolean,
) {
  const targetX = targetBase ? (source.side === 'player' ? ENEMY_BASE_X : PLAYER_BASE_X) : target?.x ?? source.x;
  const targetY = targetBase ? getLayerBaseY(source.layer, sourceDefinition.rangeBand) : target?.y ?? source.y;
  const distance = Math.max(2, Math.abs(targetX - source.x));
  const totalMs = clamp((distance / Math.max(sourceDefinition.projectileSpeed, 12)) * 1000, 90, 520);
  state.projectiles.push({
    id: `projectile-${state.rngSeed++}`,
    sourceInstanceId: source.instanceId,
    sourceUnitId: source.templateId,
    side: source.side,
    layer: source.layer,
    fromX: source.x,
    fromY: source.y,
    toX: targetX,
    toY: targetY,
    x: source.x,
    y: source.y,
    targetInstanceId: target?.instanceId ?? null,
    targetBase,
    damage: sourceDefinition.damage,
    splashRadius: sourceDefinition.splashRadius,
    damageType: sourceDefinition.damageType,
    color: sourceDefinition.attackColor,
    remainingMs: totalMs,
    totalMs,
  });
  state.stats.projectilesFired += 1;
}

function attackBase(state: FantasyLaneRuntimeState, source: FantasyLaneUnitInstance, sourceDefinition: FantasyLaneUnitDefinition) {
  const damage = sourceDefinition.damage * getDamageMultiplier(sourceDefinition, 'base');
  if (source.side === 'player') state.enemyBaseHp = Math.max(0, state.enemyBaseHp - damage);
  else state.playerBaseHp = Math.max(0, state.playerBaseHp - damage);
  pushImpact(state, {
    x: source.side === 'player' ? ENEMY_BASE_X : PLAYER_BASE_X,
    y: source.layer === 'air' ? 0.26 : 0.7,
    layer: source.layer,
    kind: 'skill',
    color: sourceDefinition.attackColor,
    remainingMs: 280,
  });
}

function processProjectileHit(state: FantasyLaneRuntimeState, projectile: FantasyLaneProjectile) {
  const sourceDefinition = FANTASY_LANE_UNIT_MAP[projectile.sourceUnitId];
  if (!sourceDefinition) return;
  if (projectile.targetBase) {
    attackBase(
      state,
      {
        instanceId: projectile.sourceInstanceId,
        templateId: projectile.sourceUnitId,
        side: projectile.side,
        layer: projectile.layer,
        lane: sourceDefinition.lane,
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
      },
      sourceDefinition,
    );
    return;
  }

  const target = state.units.find((unit) => unit.instanceId === projectile.targetInstanceId);
  if (!target) {
    pushImpact(state, {
      x: projectile.x,
      y: projectile.y,
      layer: projectile.layer,
      kind: 'hit',
      color: projectile.color,
      remainingMs: 180,
    });
    return;
  }
  const targetDefinition = FANTASY_LANE_UNIT_MAP[target.templateId];
  applyDamageToUnit(target, projectile.damage * getDamageMultiplier(sourceDefinition, targetDefinition));
  if (projectile.splashRadius > 0) {
    applyAoEDamage(state, sourceDefinition, projectile.side, projectile.layer, target.x, target.y, projectile.damage, projectile.splashRadius);
  } else {
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

function processProjectiles(state: FantasyLaneRuntimeState, deltaMs: number) {
  const nextProjectiles: FantasyLaneProjectile[] = [];
  state.projectiles.forEach((projectile) => {
    const remainingMs = projectile.remainingMs - deltaMs;
    const target = projectile.targetInstanceId ? state.units.find((unit) => unit.instanceId === projectile.targetInstanceId) : null;
    const toX = projectile.targetBase ? projectile.toX : target?.x ?? projectile.toX;
    const toY = projectile.targetBase ? projectile.toY : target?.y ?? projectile.toY;
    const progress = clamp(1 - Math.max(remainingMs, 0) / projectile.totalMs, 0, 1);
    const nextProjectile = {
      ...projectile,
      toX,
      toY,
      x: projectile.fromX + (toX - projectile.fromX) * progress,
      y: projectile.fromY + (toY - projectile.fromY) * progress,
      remainingMs,
    };
    if (remainingMs <= 0) {
      processProjectileHit(state, nextProjectile);
      return;
    }
    nextProjectiles.push(nextProjectile);
  });
  state.projectiles = nextProjectiles;
}

function processBurnline(state: FantasyLaneRuntimeState, deltaMs: number) {
  state.effects
    .filter((effect) => effect.kind === 'burnline')
    .forEach((effect) => {
      state.units.forEach((unit) => {
        if (effect.target !== 'both' && unit.side !== effect.target) return;
        applyDamageToUnit(unit, effect.potency * (deltaMs / 1000));
      });
      if (effect.target === 'enemy' || effect.target === 'both') state.enemyBaseHp = Math.max(0, state.enemyBaseHp - effect.potency * 0.28 * (deltaMs / 1000));
      if (effect.target === 'player' || effect.target === 'both') state.playerBaseHp = Math.max(0, state.playerBaseHp - effect.potency * 0.28 * (deltaMs / 1000));
    });
}

function processSideLayer(state: FantasyLaneRuntimeState, side: FantasyLaneSide, layer: FantasyLaneLayer, deltaMs: number) {
  const direction = side === 'player' ? 1 : -1;
  const units = state.units
    .filter((unit) => unit.side === side && unit.layer === layer)
    .sort((left, right) => (side === 'player' ? right.x - left.x : left.x - right.x));

  let previousPlaced: { x: number; y: number; radius: number; spacingThreshold: number } | null = null;
  units.forEach((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    if (!definition) return;

    const target = getPreferredTarget(state, unit, definition);
    const speedMultiplier = getSideSpeedMultiplier(state, side);
    const travelStep = definition.moveSpeed * speedMultiplier * (deltaMs / 1000);
    const targetDefinition = target ? FANTASY_LANE_UNIT_MAP[target.templateId] : null;
    const targetDistance = target && targetDefinition ? edgeDistance(unit, definition, target, targetDefinition) : Number.POSITIVE_INFINITY;
    const maxRange = definition.preferredRange;
    const minRange = definition.rangeBand === 'ranged' ? definition.minimumRange : 0;
    const attackReady = unit.attackCooldownMs <= 0;
    const inAttackRange = targetDistance <= maxRange && targetDistance >= minRange;
    const targetBaseDistance = side === 'player' ? ENEMY_BASE_X - unit.x : unit.x - PLAYER_BASE_X;
    const inBaseRange = targetBaseDistance <= maxRange + definition.collisionRadius;

    unit.attackAnimMs = Math.max(0, unit.attackAnimMs - deltaMs);
    unit.hitFlashMs = Math.max(0, unit.hitFlashMs - deltaMs);
    unit.attackCooldownMs = Math.max(0, unit.attackCooldownMs - deltaMs);

    let desiredX = unit.x;

    if (target && targetDefinition) {
      unit.lastTargetId = target.instanceId;
      if (inAttackRange && attackReady) {
        unit.attackAnimMs = definition.attackAnimMs;
        unit.attackCooldownMs = definition.attackIntervalMs;
        if (definition.rangeBand === 'ranged') {
          launchProjectile(state, unit, definition, target, false);
        } else {
          applyDamageToUnit(target, definition.damage * getDamageMultiplier(definition, targetDefinition));
          if (definition.splashRadius > 0) {
            applyAoEDamage(state, definition, side, target.layer, target.x, target.y, definition.damage, definition.splashRadius);
          } else {
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
      } else if (definition.rangeBand === 'ranged' && targetDistance < minRange) {
        desiredX = unit.x - direction * travelStep * 0.7;
      } else if (targetDistance > maxRange * 0.92) {
        desiredX = unit.x + direction * travelStep;
      }

      const engageGap = definition.rangeBand === 'melee' ? definition.preferredRange : definition.minimumRange;
      const spacingAgainstTarget = definition.collisionRadius + targetDefinition.collisionRadius + engageGap;
      if (direction === 1 && target.x > unit.x) desiredX = Math.min(desiredX, target.x - spacingAgainstTarget);
      if (direction === -1 && target.x < unit.x) desiredX = Math.max(desiredX, target.x + spacingAgainstTarget);
    } else if (attackReady && inBaseRange) {
      unit.attackAnimMs = definition.attackAnimMs;
      unit.attackCooldownMs = definition.attackIntervalMs;
      if (definition.rangeBand === 'ranged') launchProjectile(state, unit, definition, null, true);
      else attackBase(state, unit, definition);
    } else {
      desiredX = unit.x + direction * travelStep * 0.68;
      unit.lastTargetId = null;
    }

    desiredX = clamp(desiredX, 4, 96);

    if (previousPlaced) {
      const yDistance = Math.abs(previousPlaced.y - unit.y);
      const spacingThreshold = Math.max(getFriendlySpacingThreshold(definition), previousPlaced.spacingThreshold);
      const sharesTrack = yDistance <= spacingThreshold;
      const minGap = previousPlaced.radius + definition.collisionRadius + (unit.blockedMs > 520 ? 0.04 : 0.18);
      if (sharesTrack) {
        if (direction === 1) {
          const maxBehind = previousPlaced.x - minGap;
          if (desiredX > maxBehind) desiredX = maxBehind;
        } else {
          const minBehind = previousPlaced.x + minGap;
          if (desiredX < minBehind) desiredX = minBehind;
        }
      }
    }

    const blocked = Math.abs(desiredX - unit.x) < Math.max(0.04, travelStep * 0.18) && targetDistance > maxRange;
    unit.blockedMs = blocked ? Math.min(1600, unit.blockedMs + deltaMs) : Math.max(0, unit.blockedMs - deltaMs * 1.4);
    if (unit.blockedMs > 420) {
      const drift = (((state.elapsedMs + unit.spawnedAtMs + state.rngSeed) % 3) - 1) * 0.004;
      unit.y = clamp(unit.y + drift, layer === 'air' ? 0.12 : 0.54, layer === 'air' ? 0.42 : 0.9);
    }
    unit.x = clamp(desiredX, 4, 96);
    previousPlaced = {
      x: unit.x,
      y: unit.y,
      radius: definition.collisionRadius,
      spacingThreshold: getFriendlySpacingThreshold(definition),
    };
  });
}

function processPlayerQueue(state: FantasyLaneRuntimeState) {
  if (state.globalSpawnCooldownMs > 0 || state.queue.length === 0) return;
  const nextIndex = state.queue.findIndex((unitId) => canSpawnUnit(state, unitId, 'player'));
  if (nextIndex < 0) {
    state.lastHint = '当前人口或出生区拥堵，队列继续等待。';
    return;
  }
  const [nextUnitId] = state.queue.splice(nextIndex, 1);
  if (!spawnUnit(state, nextUnitId, 'player')) return;
  state.globalSpawnCooldownMs = GLOBAL_SPAWN_COOLDOWN_MS;
  state.lastHint = `已下达：${FANTASY_LANE_UNIT_MAP[nextUnitId]?.name ?? nextUnitId}`;
}

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
      state.enemySpawnCooldownMs = ENEMY_SPAWN_COOLDOWN_MS;
      return;
    }

    if (event.type === 'warning' && event.text) {
      state.activeWarning = { id: event.id, text: event.text, remainingMs: 4200 };
      return;
    }

    if (event.type === 'grantGold' && typeof event.amount === 'number') {
      state.gold = Math.min(MAX_GOLD, state.gold + event.amount);
      return;
    }

    if (event.type === 'modifier' && event.target && event.modifierId) {
      addEffect(state.effects, event.target, event.modifierId, event.potency ?? 0.18, event.durationMs ?? 3000);
    }
  });
  state.scheduledEvents = pending;
}

function processBossPhases(state: FantasyLaneRuntimeState) {
  const level = getLevel(state);
  if (!level.boss || !state.bossUnitInstanceId) return;
  const boss = state.units.find((unit) => unit.instanceId === state.bossUnitInstanceId);
  const bossDefinition = boss ? FANTASY_LANE_UNIT_MAP[boss.templateId] : null;
  if (!boss || !bossDefinition) return;
  const hpPercent = (boss.hp / bossDefinition.maxHp) * 100;

  level.boss.phases.forEach((phase) => {
    if (state.triggeredBossPhases.includes(phase.id) || hpPercent > phase.hpThreshold) return;
    state.triggeredBossPhases.push(phase.id);
    state.activeWarning = { id: phase.id, text: phase.enterWarning, remainingMs: 4200 };
    phase.phaseSpawnGroups?.forEach((group) => {
      for (let index = 0; index < group.count; index += 1) {
        state.scheduledEvents.push({
          id: `${phase.id}-${group.id}-${index}`,
          triggerAtMs: state.elapsedMs + group.firstDelaySec * 1000 + index * group.intervalSec * 1000,
          type: 'spawn',
          spawnGroup: group,
        });
      }
    });
    if (phase.id.endsWith('phase-2')) addEffect(state.effects, 'enemy', 'haste', 0.14, 7000);
    if (phase.id.endsWith('phase-3')) addEffect(state.effects, 'enemy', 'burnline', 48, 5000);
  });
}

function updateBattleMetrics(state: FantasyLaneRuntimeState) {
  const playerGround = state.units.filter((unit) => unit.side === 'player' && unit.layer === 'ground');
  const enemyGround = state.units.filter((unit) => unit.side === 'enemy' && unit.layer === 'ground');
  const playerFront = playerGround.reduce((max, unit) => Math.max(max, unit.x), PLAYER_SPAWN_X);
  const enemyFront = enemyGround.reduce((min, unit) => Math.min(min, unit.x), ENEMY_SPAWN_X);
  state.frontline = Math.round(playerFront - (100 - enemyFront));
  state.clashX = clamp(Math.round((playerFront + enemyFront) * 0.5), 12, 88);
  state.activePop = getActivePop(state.units, 'player');
  const playerAirPop = state.units.filter((unit) => unit.side === 'player' && unit.layer === 'air').reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
  const enemyAirPop = state.units.filter((unit) => unit.side === 'enemy' && unit.layer === 'air').reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
  state.airControl = playerAirPop - enemyAirPop;

  const crowdedUnits = state.units.filter((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    return unit.layer === 'ground' && unit.blockedMs > 320 && definition.footprint !== 'small';
  }).length;
  state.congestion = clamp(Math.round((crowdedUnits / Math.max(1, state.units.length)) * 100), 0, 100);
}

function pruneUnits(state: FantasyLaneRuntimeState) {
  const defeated = state.units.filter((unit) => unit.hp <= 0);
  defeated.forEach((unit) => {
    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    if (unit.side === 'enemy') state.gold = Math.min(MAX_GOLD, state.gold + 10 + definition.pop * 4);
    if (unit.instanceId === state.bossUnitInstanceId) {
      state.gold = Math.min(MAX_GOLD, state.gold + 40);
      state.bossUnitInstanceId = null;
    }
  });
  state.stats.defeated += defeated.length;
  state.units = state.units.filter((unit) => unit.hp > 0);
}

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
      applyAoEDamage(state, FANTASY_LANE_UNIT_MAP.flame_warlock, 'player', 'ground', state.clashX, 0.62, 90, 8.5);
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
    state.activeWarning = { id: `hero-${state.elapsedMs}`, text: `${FANTASY_LANE_HERO_MAP[state.selectedHeroId].name} 发动战场技能`, remainingMs: 3200 };
    return;
  }

  if (skillId !== state.tacticalSkill.id || state.tacticalSkill.remainingMs > 0) return;
  if (state.selectedTacticalId === 'fireball') {
    applyAoEDamage(state, FANTASY_LANE_UNIT_MAP.flame_warlock, 'player', 'ground', Math.max(state.clashX, 62), 0.64, 160, 7.8);
  } else if (state.selectedTacticalId === 'heal') {
    state.playerBaseHp = Math.min(state.playerBaseHpMax, state.playerBaseHp + 210);
    state.units.filter((unit) => unit.side === 'player').forEach((unit) => {
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
  state.activeWarning = { id: `tactical-${state.elapsedMs}`, text: `战术技能 ${state.tacticalSkill.name} 已执行`, remainingMs: 2800 };
}

function finalizeBattle(state: FantasyLaneRuntimeState, didWin: boolean) {
  const level = getLevel(state);
  const basePercent = (state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100;
  const stars: 1 | 2 | 3 = didWin ? (basePercent >= 75 && !state.overtimeTriggered ? 3 : basePercent >= 50 ? 2 : 1) : 1;
  const tips: string[] = [];
  if (didWin) {
    tips.push(state.congestion > 45 ? '这局前线很拥挤，但你还是把团推了过去。' : '前排节奏控制不错，团战推进很顺。');
    tips.push(`人口 ${state.activePop}/${state.popLimit}，对空差值 ${state.airControl >= 0 ? '+' : ''}${state.airControl}。`);
  } else {
    if (state.stats.frontlineSummons < 4) tips.push(level.failureHints.lowFrontline ?? '前排人口明显不够，团战站不住。');
    if (level.recommendedTags.includes('antiAir') && state.stats.antiAirSummons < 3) tips.push(level.failureHints.lowAntiAir ?? '对空人口不足。');
    if (level.recommendedTags.includes('aoe') && state.stats.aoeSummons < 2) tips.push(level.failureHints.lowAoE ?? '群伤占比不够，清不掉密集团。');
    if (state.stats.goldCappedMs >= 12000) tips.push(level.failureHints.overSavingGold ?? '金币囤太久，出兵节奏慢了。');
    if ((state.stats.heroSkillCast + state.stats.tacticalSkillCast) <= 1) tips.push(level.failureHints.lateSkillUse ?? '技能释放偏晚。');
  }
  const result: FantasyLaneBattleResult = {
    title: didWin ? '战线推进成功' : '战线失守',
    stars,
    score: Math.round((didWin ? 1800 : 620) + state.playerBaseHp * 0.42 + state.stats.defeated * 14 + state.stats.aoeHits * 3 + state.stats.projectilesFired * 2),
    summary: didWin ? `${level.id} ${level.name} 已突破。` : `${level.id} ${level.name} 未守住。`,
    tips: tips.slice(0, 3),
  };
  return {
    ...state,
    phase: didWin ? 'won' : 'lost',
    result,
    activeWarning: { id: didWin ? 'win' : 'lose', text: didWin ? '敌方主堡已被摧毁' : '我方主堡失守', remainingMs: 4800 },
  } satisfies FantasyLaneRuntimeState;
}

function maybeFinalizeBattle(state: FantasyLaneRuntimeState) {
  if (state.enemyBaseHp <= 0) return finalizeBattle(state, true);
  if (state.playerBaseHp <= 0) return finalizeBattle(state, false);
  if (state.overtimeTriggered && state.overtimeRemainingMs <= 0) return finalizeBattle(state, false);
  return state;
}

function createInitialState(snapshot?: Record<string, unknown> | null): FantasyLaneRuntimeState {
  const persisted = snapshot && typeof snapshot === 'object' && 'state' in snapshot ? (snapshot.state as FantasyLaneRuntimeState | undefined) : undefined;
  if (persisted) return persisted;
  return createBaseState(FANTASY_LANE_IDS.defaultLevelId, FANTASY_LANE_IDS.defaultHeroId, FANTASY_LANE_IDS.defaultTacticalId, FANTASY_LANE_IDS.defaultLoadout);
}

function startBattle(state: FantasyLaneRuntimeState) {
  const next = createBaseState(state.selectedLevelId, state.selectedHeroId, state.selectedTacticalId, state.loadoutUnitIds);
  next.phase = 'playing';
  next.lastHint = '主战场已展开，开始压上兵线。';
  return next;
}

function pauseBattle(state: FantasyLaneRuntimeState) {
  return state.phase === 'playing' ? { ...state, phase: 'paused' as const } : state;
}

function resumeBattle(state: FantasyLaneRuntimeState) {
  return state.phase === 'paused' ? { ...state, phase: 'playing' as const } : state;
}

function restartBattle(state: FantasyLaneRuntimeState) {
  return startBattle(state);
}

function selectLevel(state: FantasyLaneRuntimeState, levelId: string) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法直接切换关卡。' };
  }
  return createBaseState(levelId, state.selectedHeroId, state.selectedTacticalId, state.loadoutUnitIds);
}

function selectHero(state: FantasyLaneRuntimeState, heroId: FantasyLaneHeroId) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法修改英雄。' };
  }
  return createBaseState(state.selectedLevelId, heroId, state.selectedTacticalId, state.loadoutUnitIds);
}

function selectTacticalSkill(state: FantasyLaneRuntimeState, skillId: FantasyLaneTacticalSkillId) {
  if (state.phase === 'playing' || state.phase === 'paused') {
    return { ...state, lastHint: '战斗进行中，无法修改战术。' };
  }
  return createBaseState(state.selectedLevelId, state.selectedHeroId, skillId, state.loadoutUnitIds);
}

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

  if (getLoadoutPop(loadout) > POP_LIMIT + 4) {
    return { ...state, lastHint: '这套编组过重，建议降低总人口权重。' };
  }
  return createBaseState(state.selectedLevelId, state.selectedHeroId, state.selectedTacticalId, loadout);
}

function queueUnit(state: FantasyLaneRuntimeState, unitId: string) {
  if (state.phase !== 'playing') return state;
  if (!state.loadoutUnitIds.includes(unitId)) return { ...state, lastHint: '该兵种不在本局编组内。' };
  if (state.queue.length >= state.queueLimit) {
    return { ...state, lastHint: '指令队列已满。', stats: { ...state.stats, queueBlocked: state.stats.queueBlocked + 1 } };
  }
  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  if (!unit) return state;
  if (state.gold < unit.cost) return { ...state, lastHint: `${unit.name} 需要 ${unit.cost} 金币。` };
  if (state.unitCooldowns[unitId] > 0) return { ...state, lastHint: `${unit.name} 仍在冷却。` };
  return {
    ...state,
    gold: Math.max(0, state.gold - unit.cost),
    queue: [...state.queue, unitId],
    unitCooldowns: { ...state.unitCooldowns, [unitId]: unit.cooldownMs },
    lastHint: `${unit.name} 已加入出兵队列。`,
    stats: { ...state.stats, goldSpent: state.stats.goldSpent + unit.cost },
  };
}

function castSkill(state: FantasyLaneRuntimeState, skillId: string) {
  if (state.phase !== 'playing') return state;
  const next = cloneState(state);
  applySkill(next, skillId);
  return next;
}

function tick(state: FantasyLaneRuntimeState, deltaMs: number): FantasyLaneRuntimeState {
  if (state.phase !== 'playing') return state;
  const next = cloneState(state);
  next.elapsedMs += deltaMs;
  if (next.overtimeTriggered) next.overtimeRemainingMs -= deltaMs;

  Object.keys(next.unitCooldowns).forEach((unitId) => {
    next.unitCooldowns[unitId] = Math.max(0, next.unitCooldowns[unitId] - deltaMs);
  });
  next.heroSkill.remainingMs = Math.max(0, next.heroSkill.remainingMs - deltaMs);
  next.tacticalSkill.remainingMs = Math.max(0, next.tacticalSkill.remainingMs - deltaMs);
  next.globalSpawnCooldownMs = Math.max(0, next.globalSpawnCooldownMs - deltaMs);
  next.enemySpawnCooldownMs = Math.max(0, next.enemySpawnCooldownMs - deltaMs);
  next.effects = next.effects.map((effect) => ({ ...effect, remainingMs: effect.remainingMs - deltaMs })).filter((effect) => effect.remainingMs > 0);
  next.impacts = next.impacts.map((impact) => ({ ...impact, remainingMs: impact.remainingMs - deltaMs })).filter((impact) => impact.remainingMs > 0);
  if (next.activeWarning) {
    next.activeWarning.remainingMs -= deltaMs;
    if (next.activeWarning.remainingMs <= 0) next.activeWarning = null;
  }

  next.gold = Math.min(MAX_GOLD, next.gold + getIncomePerSecond(next.elapsedMs, next.gold, next.overtimeTriggered) * (deltaMs / 1000));
  if (next.gold >= 220) next.stats.goldCappedMs += deltaMs;

  setPhaseMetadata(next);
  if (!next.overtimeTriggered && next.elapsedMs >= next.battleTimeLimitMs) {
    next.overtimeTriggered = true;
    next.overtimeRemainingMs = OVERTIME_DURATION_MS;
    addEffect(next.effects, 'both', 'haste', 0.08, OVERTIME_DURATION_MS);
    next.heroSkill.remainingMs = Math.max(0, next.heroSkill.remainingMs - 7000);
    next.tacticalSkill.remainingMs = Math.max(0, next.tacticalSkill.remainingMs - 6000);
    next.activeWarning = { id: 'overtime', text: '进入终局加压：45 秒内必须收口。', remainingMs: 4200 };
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
  updateBattleMetrics(next);
  setPhaseMetadata(next);

  return maybeFinalizeBattle(next);
}

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

export function getFantasyLaneChapterName(chapterId: string) {
  return FANTASY_LANE_CHAPTERS.find((chapter) => chapter.id === chapterId)?.name ?? chapterId;
}

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
