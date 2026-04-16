/* 奇幻战线运行时规则常量。统一收口战场坐标、经济阈值、伤害矩阵和软碰撞参数。 */

import type {
  FantasyLaneArmorType,
  FantasyLaneCombatProtocol,
  FantasyLaneDamageType,
  FantasyLaneEffectKind,
  FantasyLaneIncomeTier,
  FantasyLaneLaneId,
  FantasyLaneSide,
  FantasyLaneSoftCollisionProfile,
  FantasyLaneUnitDefinition,
  FantasyLaneUnitInstance,
} from './fantasyLaneTypes.ts';
import { FANTASY_LANE_UNIT_MAP } from './fantasyLaneUnitRegistry.ts';

export const FANTASY_LANE_RUNTIME_CONSTANTS = {
  battleMinX: 0,
  battleMaxX: 100,
  playerBaseX: 3,
  enemyBaseX: 97,
  playerSpawnX: 8,
  enemySpawnX: 92,
  maxGold: 320,
  popLimit: 18,
  queueLimit: 5,
  playerGlobalSpawnCooldownMs: 320,
  enemyGlobalSpawnCooldownMs: 420,
  overtimeDurationMs: 45_000,
  highGoldSoftCap: 230,
  highGoldHardCap: 290,
  giantUnitLimit: 2,
  aoeOuterFalloffFloor: 0.35,
  aoeSecondaryRatio: 0.48,
  lanePaddingMinX: 4,
  lanePaddingMaxX: 96,
} as const;

export const FANTASY_LANE_INCOME_TIERS: FantasyLaneIncomeTier[] = [
  { untilMs: 90_000, incomePerSecond: 9.5 },
  { untilMs: 210_000, incomePerSecond: 11 },
  { untilMs: 360_000, incomePerSecond: 12.5 },
  { untilMs: null, incomePerSecond: 14 },
];

export const FANTASY_LANE_COMBAT_PROTOCOLS: Record<'melee' | 'ranged' | 'air', FantasyLaneCombatProtocol> = {
  melee: {
    id: 'melee',
    advanceFactor: 1,
    idleAdvanceFactor: 0.72,
    holdRangeBuffer: 0.25,
    retreatFactor: 0,
    driftStrength: 0,
    blockedDrift: 0.004,
    allowRetreat: false,
  },
  ranged: {
    id: 'ranged',
    advanceFactor: 1,
    idleAdvanceFactor: 0.62,
    holdRangeBuffer: 0.6,
    retreatFactor: 0,
    driftStrength: 0.012,
    blockedDrift: 0.004,
    allowRetreat: false,
  },
  air: {
    id: 'air',
    advanceFactor: 1.08,
    idleAdvanceFactor: 0.82,
    holdRangeBuffer: 1.1,
    retreatFactor: 0.58,
    driftStrength: 0.008,
    blockedDrift: 0.003,
    allowRetreat: true,
  },
};

const FANTASY_LANE_SOFT_COLLISION_TABLE: Record<'ground' | 'air', Record<'small' | 'medium' | 'large' | 'giant', Omit<FantasyLaneSoftCollisionProfile, 'laneMinY' | 'laneMaxY'>>> = {
  ground: {
    small: { trackThreshold: 0.08, blockWeight: 0.82, slipBonus: 0.08, blockedDrift: 0.004 },
    medium: { trackThreshold: 0.1, blockWeight: 1.0, slipBonus: 0.03, blockedDrift: 0.004 },
    large: { trackThreshold: 0.115, blockWeight: 1.26, slipBonus: 0, blockedDrift: 0.0035 },
    giant: { trackThreshold: 0.13, blockWeight: 1.48, slipBonus: 0, blockedDrift: 0.003 },
  },
  air: {
    small: { trackThreshold: 0.07, blockWeight: 0.82, slipBonus: 0.12, blockedDrift: 0.003 },
    medium: { trackThreshold: 0.085, blockWeight: 1.0, slipBonus: 0.06, blockedDrift: 0.003 },
    large: { trackThreshold: 0.1, blockWeight: 1.26, slipBonus: 0.02, blockedDrift: 0.0025 },
    giant: { trackThreshold: 0.11, blockWeight: 1.48, slipBonus: 0, blockedDrift: 0.002 },
  },
};

export const FANTASY_LANE_DAMAGE_MATRIX: Record<FantasyLaneDamageType, Record<FantasyLaneArmorType, number>> = {
  physical: { light: 1.0, heavy: 0.82, swarm: 0.9, air: 0.2, structure: 0.58 },
  pierce: { light: 0.88, heavy: 1.25, swarm: 0.76, air: 0.72, structure: 0.7 },
  blast: { light: 0.8, heavy: 0.92, swarm: 1.42, air: 0.9, structure: 0.82 },
  magic: { light: 1.0, heavy: 1.08, swarm: 1.0, air: 0.95, structure: 0.72 },
  siege: { light: 0.68, heavy: 0.95, swarm: 0.84, air: 0.45, structure: 1.5 },
  antiAir: { light: 0.7, heavy: 0.76, swarm: 0.9, air: 1.55, structure: 0.4 },
};

export interface FantasyLaneBossSkillAction {
  type: 'showWarning' | 'applyModifier';
  text?: string;
  target?: FantasyLaneSide | 'both';
  modifierId?: FantasyLaneEffectKind;
  potency?: number;
  durationMs?: number;
}

export interface FantasyLaneBossSkillRule {
  id: string;
  label: string;
  summary: string;
  actions: FantasyLaneBossSkillAction[];
}

export const FANTASY_LANE_BOSS_SKILL_RULES: Record<string, FantasyLaneBossSkillRule> = {
  'opening-pressure': {
    id: 'opening-pressure',
    label: '开场压阵',
    summary: 'Boss 落地先抬正面承压，避免刚登场就被直接融化。',
    actions: [
      { type: 'showWarning', text: 'Boss 顶住正面火力，第一轮前排会更难处理。' },
      { type: 'applyModifier', target: 'enemy', modifierId: 'fortify', potency: 0.12, durationMs: 8000 },
    ],
  },
  'summon-wave': {
    id: 'summon-wave',
    label: '召唤波次',
    summary: 'Boss 进入召唤段时明确提示随从补线。',
    actions: [{ type: 'showWarning', text: 'Boss 开始补召唤波次，别把中线让空。' }],
  },
  'midline-push': {
    id: 'midline-push',
    label: '中线推进',
    summary: '中段转场时抬高敌方整体推进效率。',
    actions: [{ type: 'applyModifier', target: 'enemy', modifierId: 'haste', potency: 0.12, durationMs: 7000 }],
  },
  'layer-shift': {
    id: 'layer-shift',
    label: '双层换压',
    summary: '双层或双线压力出现时给玩家明确危险提示。',
    actions: [
      { type: 'showWarning', text: 'Boss 开始切换压制层级，空地两线都会变得更危险。' },
      { type: 'applyModifier', target: 'player', modifierId: 'burnline', potency: 36, durationMs: 4200 },
    ],
  },
  reinforce: {
    id: 'reinforce',
    label: '阶段强化',
    summary: 'Boss 转段后为敌方阵地补一层耐久强化。',
    actions: [{ type: 'applyModifier', target: 'enemy', modifierId: 'fortify', potency: 0.18, durationMs: 9000 }],
  },
  enrage: {
    id: 'enrage',
    label: '狂暴',
    summary: '终局阶段同时拉高输出和推进速度。',
    actions: [
      { type: 'showWarning', text: 'Boss 狂暴，终局窗口已经进入强压态。' },
      { type: 'applyModifier', target: 'enemy', modifierId: 'rage', potency: 0.22, durationMs: 12000 },
      { type: 'applyModifier', target: 'enemy', modifierId: 'haste', potency: 0.1, durationMs: 12000 },
    ],
  },
  'final-stand': {
    id: 'final-stand',
    label: '背水死战',
    summary: '最后守势进一步抬高敌方抗压能力，逼玩家收口。',
    actions: [{ type: 'applyModifier', target: 'enemy', modifierId: 'fortify', potency: 0.12, durationMs: 8000 }],
  },
};

// 统一处理数值夹取，避免战场坐标和衰减超界。
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// 给运行时和后续 UI 提供统一的我方出兵点坐标。
export function getPlayerSpawnX(): number {
  return FANTASY_LANE_RUNTIME_CONSTANTS.playerSpawnX;
}

// 给运行时和后续 UI 提供统一的敌方出兵点坐标。
export function getEnemySpawnX(): number {
  return FANTASY_LANE_RUNTIME_CONSTANTS.enemySpawnX;
}

// 统一给移动和站位提供层级 Y 边界，避免运行时再手写 air / ground 区间。
export function getLaneYBounds(layer: FantasyLaneUnitDefinition['layer']) {
  return layer === 'air'
    ? { min: 0.12, max: 0.42 }
    : { min: 0.54, max: 0.9 };
}

// 返回指定阵营在地面层的最前线坐标。
export function getGroundFrontline(units: FantasyLaneUnitInstance[], side: FantasyLaneSide) {
  const groundUnits = units.filter((unit) => unit.side === side && unit.layer === 'ground');
  if (groundUnits.length === 0) {
    return side === 'player' ? getPlayerSpawnX() : getEnemySpawnX();
  }
  return side === 'player'
    ? groundUnits.reduce<number>((front, unit) => Math.max(front, unit.x), getPlayerSpawnX())
    : groundUnits.reduce<number>((front, unit) => Math.min(front, unit.x), getEnemySpawnX());
}

// 统一计算空层人口差，作为空优指标来源。
export function getAirControlDelta(units: FantasyLaneUnitInstance[]) {
  const playerAirPop = units
    .filter((unit) => unit.side === 'player' && unit.layer === 'air')
    .reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
  const enemyAirPop = units
    .filter((unit) => unit.side === 'enemy' && unit.layer === 'air')
    .reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
  return playerAirPop - enemyAirPop;
}

// 用双方地面前线推导主战场交战中心。
export function getBattleCenter(playerFrontline: number, enemyFrontline: number) {
  return clamp(
    Math.round((playerFrontline + enemyFrontline) * 0.5),
    12,
    88,
  );
}

// 统一返回护甲克制倍率，未命中矩阵时回退为 1。
export function getDamageMultiplier(damageType: FantasyLaneDamageType, armorType: FantasyLaneArmorType) {
  return FANTASY_LANE_DAMAGE_MATRIX[damageType][armorType] ?? 1;
}

// 把协议选择收口成规则表，运行时不再散落 layer/rangeBand 判定常量。
export function getCombatProtocol(definition: FantasyLaneUnitDefinition) {
  if (definition.layer === 'air') return FANTASY_LANE_COMBAT_PROTOCOLS.air;
  return definition.rangeBand === 'ranged'
    ? FANTASY_LANE_COMBAT_PROTOCOLS.ranged
    : FANTASY_LANE_COMBAT_PROTOCOLS.melee;
}

// 用体型控制换目标延迟，满足 80ms~160ms 的设计区间。
export function getRetargetCooldownMs(definition: FantasyLaneUnitDefinition) {
  switch (definition.footprint) {
    case 'small':
      return 80;
    case 'medium':
      return 105;
    case 'large':
      return 135;
    default:
      return 160;
  }
}

// 用体型决定软碰撞阻挡强度，避免所有单位共享一套阻挡权重。
export function getFootprintBlockWeight(definition: FantasyLaneUnitDefinition) {
  return FANTASY_LANE_SOFT_COLLISION_TABLE[definition.layer][definition.footprint].blockWeight;
}

// 用体型控制同轨迹判定阈值，小体型更容易穿插。
export function getSoftCollisionTrackThreshold(definition: FantasyLaneUnitDefinition) {
  return FANTASY_LANE_SOFT_COLLISION_TABLE[definition.layer][definition.footprint].trackThreshold;
}

// 把软碰撞的完整参数从规则表取出，避免运行时再散写体型特判。
export function getSoftCollisionProfile(definition: FantasyLaneUnitDefinition): FantasyLaneSoftCollisionProfile {
  const bounds = getLaneYBounds(definition.layer);
  const profile = FANTASY_LANE_SOFT_COLLISION_TABLE[definition.layer][definition.footprint];
  return {
    laneMinY: bounds.min,
    laneMaxY: bounds.max,
    trackThreshold: profile.trackThreshold,
    blockWeight: profile.blockWeight,
    slipBonus: profile.slipBonus,
    blockedDrift: profile.blockedDrift,
  };
}

// 统一计算 AOE 外圈衰减，遵守中心满伤、外圈最低 35% 的规则。
export function getAoeFalloff(distance: number, radius: number) {
  if (radius <= 0) return 0;
  return clamp(
    1 - distance / Math.max(radius, 0.01),
    FANTASY_LANE_RUNTIME_CONSTANTS.aoeOuterFalloffFloor,
    1,
  );
}

// 统一根据经济规则表返回当前秒收益。
export function getIncomePerSecondByRules(elapsedMs: number, gold: number, overtimeTriggered: boolean) {
  const matchedTier = FANTASY_LANE_INCOME_TIERS.find((tier) => tier.untilMs === null || elapsedMs < tier.untilMs)
    ?? FANTASY_LANE_INCOME_TIERS[FANTASY_LANE_INCOME_TIERS.length - 1];
  let income = matchedTier.incomePerSecond;
  if (gold >= FANTASY_LANE_RUNTIME_CONSTANTS.highGoldHardCap) {
    income *= 0.2;
  } else if (gold >= FANTASY_LANE_RUNTIME_CONSTANTS.highGoldSoftCap) {
    income *= 0.55;
  }
  return overtimeTriggered ? income * 1.22 : income;
}

// 统一把出生层和 legacy lane 收口，避免脚本错误把地面兵刷到空层。
export function normalizeSpawnLane(
  definition: FantasyLaneUnitDefinition,
  laneOverride?: FantasyLaneLaneId,
) {
  if (definition.layer === 'air') {
    return { layer: 'air' as const, lane: 'air' as const };
  }

  if (laneOverride === 'front' || laneOverride === 'mid' || laneOverride === 'rear') {
    return { layer: 'ground' as const, lane: laneOverride };
  }

  return { layer: 'ground' as const, lane: definition.lane };
}

// 给 Boss 阶段提供稳定标签，避免 UI 或运行时自己拼接编号文本。
export function getBossPhaseRuntimeLabel(index: number, total: number) {
  return `Boss 阶段 ${index + 1}/${Math.max(total, 1)}`;
}

// 统一从规则表读取 Boss 技能定义，未配置时返回 null 走降级路径。
export function getBossSkillRule(skillId: string) {
  return FANTASY_LANE_BOSS_SKILL_RULES[skillId] ?? null;
}
