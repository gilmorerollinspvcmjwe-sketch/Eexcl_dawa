import { FANTASY_LANE_UNIT_MAP, FANTASY_LANE_UNITS } from '../fantasyLaneUnitRegistry.ts';
import type { FantasyLaneUnitDefinition } from '../fantasyLaneTypes.ts';

export type FantasyLaneUnitArchetypeId =
  | 'shield_line'
  | 'swarm_rush'
  | 'midline_bruiser'
  | 'backline_archer'
  | 'anti_air_guard'
  | 'burst_sniper'
  | 'field_artillery'
  | 'battle_mage'
  | 'siege_ram'
  | 'assassin_dive'
  | 'support_healer'
  | 'summoner'
  | 'air_raider'
  | 'air_controller'
  | 'boss_breaker'
  | 'anchor_tank';

export interface FantasyLaneArchetypeDefinition {
  id: FantasyLaneUnitArchetypeId;
  label: string;
  battlefieldJob: string;
  defaultStrength: string;
  defaultWeakness: string;
  defaultPairing: string;
}

export interface FantasyLaneUnitContentProfile {
  archetypeId: FantasyLaneUnitArchetypeId;
  label: string;
  battlefieldJob: string;
  strength: string;
  weakness: string;
  pairing: string;
}

export const FANTASY_LANE_ARCHETYPES: Record<FantasyLaneUnitArchetypeId, FantasyLaneArchetypeDefinition> = {
  shield_line: {
    id: 'shield_line',
    label: '盾线',
    battlefieldJob: '先顶线',
    defaultStrength: '稳前排',
    defaultWeakness: '怕爆破',
    defaultPairing: '配后排',
  },
  swarm_rush: {
    id: 'swarm_rush',
    label: '兵潮',
    battlefieldJob: '铺兵压线',
    defaultStrength: '成型快',
    defaultWeakness: '怕AOE',
    defaultPairing: '配增益',
  },
  midline_bruiser: {
    id: 'midline_bruiser',
    label: '突击',
    battlefieldJob: '补中线伤害',
    defaultStrength: '换血强',
    defaultWeakness: '怕风筝',
    defaultPairing: '配盾线',
  },
  backline_archer: {
    id: 'backline_archer',
    label: '后排点射',
    battlefieldJob: '持续输出',
    defaultStrength: '压后排',
    defaultWeakness: '怕切入',
    defaultPairing: '配肉盾',
  },
  anti_air_guard: {
    id: 'anti_air_guard',
    label: '反空',
    battlefieldJob: '守空层',
    defaultStrength: '克飞行',
    defaultWeakness: '地面线薄',
    defaultPairing: '配前排',
  },
  burst_sniper: {
    id: 'burst_sniper',
    label: '爆发点杀',
    battlefieldJob: '拆核心',
    defaultStrength: '秒高值',
    defaultWeakness: '持续差',
    defaultPairing: '配控场',
  },
  field_artillery: {
    id: 'field_artillery',
    label: '远程AOE',
    battlefieldJob: '清兵潮',
    defaultStrength: '面伤高',
    defaultWeakness: '起手慢',
    defaultPairing: '配拖线',
  },
  battle_mage: {
    id: 'battle_mage',
    label: '法术压制',
    battlefieldJob: '压密集区',
    defaultStrength: '穿护甲',
    defaultWeakness: '怕冲脸',
    defaultPairing: '配控制',
  },
  siege_ram: {
    id: 'siege_ram',
    label: '攻城',
    battlefieldJob: '拆前堡',
    defaultStrength: '打重装',
    defaultWeakness: '怕快攻',
    defaultPairing: '配护送',
  },
  assassin_dive: {
    id: 'assassin_dive',
    label: '切后',
    battlefieldJob: '抓后排',
    defaultStrength: '切脆皮',
    defaultWeakness: '怕反制',
    defaultPairing: '配正面压',
  },
  support_healer: {
    id: 'support_healer',
    label: '支援',
    battlefieldJob: '续前线',
    defaultStrength: '保持续航',
    defaultWeakness: '自保弱',
    defaultPairing: '配重装',
  },
  summoner: {
    id: 'summoner',
    label: '召唤',
    battlefieldJob: '补单位数',
    defaultStrength: '拖节奏',
    defaultWeakness: '怕清场',
    defaultPairing: '配AOE',
  },
  air_raider: {
    id: 'air_raider',
    label: '空袭',
    battlefieldJob: '绕线输出',
    defaultStrength: '越线快',
    defaultWeakness: '怕反空',
    defaultPairing: '配地面线',
  },
  air_controller: {
    id: 'air_controller',
    label: '空域压制',
    battlefieldJob: '争空层',
    defaultStrength: '抢制空',
    defaultWeakness: '拆地慢',
    defaultPairing: '配攻城',
  },
  boss_breaker: {
    id: 'boss_breaker',
    label: '破Boss',
    battlefieldJob: '拆高值',
    defaultStrength: '打单体',
    defaultWeakness: '怕杂兵',
    defaultPairing: '配清杂',
  },
  anchor_tank: {
    id: 'anchor_tank',
    label: '锚点重装',
    battlefieldJob: '稳住战心',
    defaultStrength: '顶压强',
    defaultWeakness: '机动慢',
    defaultPairing: '配治疗',
  },
};

function hasTag(unit: FantasyLaneUnitDefinition, tag: string) {
  return unit.tags.includes(tag);
}

function resolveArchetypeId(unit: FantasyLaneUnitDefinition): FantasyLaneUnitArchetypeId {
  if (unit.layer === 'air' && unit.role === 'air_sup') {
    return hasTag(unit, 'antiAir') ? 'air_controller' : 'air_raider';
  }
  if (unit.role === 'tank') {
    return unit.footprint === 'large' || unit.footprint === 'giant' ? 'anchor_tank' : 'shield_line';
  }
  if (unit.role === 'siege') {
    return hasTag(unit, 'antiArmor') || unit.damageType === 'siege' ? 'siege_ram' : 'field_artillery';
  }
  if (unit.role === 'sniper') {
    return hasTag(unit, 'antiAir') ? 'anti_air_guard' : 'burst_sniper';
  }
  if (unit.role === 'caster') {
    if (hasTag(unit, 'heal') || hasTag(unit, 'shield')) return 'support_healer';
    if (hasTag(unit, 'summon')) return 'summoner';
    return 'battle_mage';
  }
  if (unit.role === 'finisher') {
    return unit.layer === 'air' ? 'air_raider' : 'boss_breaker';
  }
  if (unit.rangeBand === 'ranged' && unit.damageProfile === 'aoe') return 'field_artillery';
  if (unit.rangeBand === 'ranged') return 'backline_archer';
  if (unit.cost <= 40 || hasTag(unit, 'swarm')) return 'swarm_rush';
  if (hasTag(unit, 'stealth') || hasTag(unit, 'burst')) return 'assassin_dive';
  return 'midline_bruiser';
}

function resolveStrength(unit: FantasyLaneUnitDefinition, archetype: FantasyLaneArchetypeDefinition) {
  if (hasTag(unit, 'antiAir')) return '压飞行';
  if (hasTag(unit, 'antiArmor')) return '拆重装';
  if (hasTag(unit, 'heal')) return '保前线';
  if (hasTag(unit, 'shield')) return '稳阵线';
  if (unit.damageProfile === 'aoe') return '清兵潮';
  if (unit.damageType === 'pierce') return '破护甲';
  if (unit.rangeBand === 'ranged') return '稳输出';
  return archetype.defaultStrength;
}

function resolveWeakness(unit: FantasyLaneUnitDefinition, archetype: FantasyLaneArchetypeDefinition) {
  if (unit.minimumRange > 0) return '怕贴脸';
  if (unit.maxHp <= 320) return '身板薄';
  if (unit.moveSpeed <= 1.8) return '转场慢';
  if (unit.damageProfile === 'single' && unit.attackIntervalMs >= 1400) return '清杂慢';
  return archetype.defaultWeakness;
}

function resolvePairing(unit: FantasyLaneUnitDefinition, archetype: FantasyLaneArchetypeDefinition) {
  if (unit.layer === 'air') return '配地面盾';
  if (unit.rangeBand === 'ranged') return '配前排';
  if (hasTag(unit, 'heal')) return '配重装';
  if (unit.damageProfile === 'aoe') return '配拖线';
  return archetype.defaultPairing;
}

export function getFantasyLaneUnitContentProfile(unitId: string): FantasyLaneUnitContentProfile | null {
  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  if (!unit) return null;
  const archetypeId = resolveArchetypeId(unit);
  const archetype = FANTASY_LANE_ARCHETYPES[archetypeId];

  return {
    archetypeId,
    label: archetype.label,
    battlefieldJob: archetype.battlefieldJob,
    strength: resolveStrength(unit, archetype),
    weakness: resolveWeakness(unit, archetype),
    pairing: resolvePairing(unit, archetype),
  };
}

export const FANTASY_LANE_UNIT_CONTENT_PROFILES = Object.fromEntries(
  FANTASY_LANE_UNITS.map((unit) => [unit.id, getFantasyLaneUnitContentProfile(unit.id)]),
) as Record<string, FantasyLaneUnitContentProfile | null>;

export interface FantasyLaneUnitBriefing {
  unlock: string;
  pairing: string;
  counters: string;
  counteredBy: string;
}

function getUnlockConditionText(unit: FantasyLaneUnitDefinition) {
  const condition = unit.unlockCondition;
  if (!condition) return '默认解锁';
  if (condition.type === 'level_clear' && condition.levelId) return `通关 ${condition.levelId}`;
  if (condition.type === 'boss_clear' && condition.levelId) return `击败 ${condition.levelId} Boss`;
  if (condition.type === 'star_reward' && typeof condition.stars === 'number') return `${condition.stars} 星奖励`;
  if (condition.type === 'fragment_synthesis' && typeof condition.fragmentCount === 'number') return `${condition.fragmentCount} 碎片合成`;
  return '完成章节任务';
}

function getCounterTargetText(unit: FantasyLaneUnitDefinition) {
  if (unit.targetRule === 'air_only' || hasTag(unit, 'antiAir')) return '飞行单位';
  if (unit.damageProfile === 'aoe') return '群体杂兵';
  if (hasTag(unit, 'antiArmor') || unit.damageType === 'pierce' || unit.damageType === 'siege') return '重甲前排';
  if (unit.rangeBand === 'ranged') return '后排脆皮';
  return '地面前排';
}

function getCounteredByText(unit: FantasyLaneUnitDefinition) {
  if (unit.layer === 'air') return '防空火力';
  if (unit.rangeBand === 'ranged') return '突进近战';
  if (unit.maxHp <= 360) return '范围伤害';
  if (unit.moveSpeed <= 1.8) return '快攻换线';
  return '高爆发收割';
}

export function getFantasyLaneUnitBriefing(unitId: string): FantasyLaneUnitBriefing | null {
  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  const profile = getFantasyLaneUnitContentProfile(unitId);
  if (!unit || !profile) return null;

  return {
    unlock: getUnlockConditionText(unit),
    pairing: profile.pairing,
    counters: getCounterTargetText(unit),
    counteredBy: getCounteredByText(unit),
  };
}
