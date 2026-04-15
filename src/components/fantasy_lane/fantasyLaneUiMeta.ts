import type {
  FantasyLaneArmorClass,
  FantasyLaneCombatRole,
  FantasyLaneDamageProfile,
  FantasyLaneFootprint,
  FantasyLaneLayer,
  FantasyLaneRangeBand,
  FantasyLaneTargetRule,
} from '../../features/fantasy_lane/fantasyLaneTypes.ts';

export const LAYER_LABELS: Record<FantasyLaneLayer, string> = {
  ground: '地面',
  air: '空中',
};

export const RANGE_LABELS: Record<FantasyLaneRangeBand, string> = {
  melee: '近战',
  ranged: '远程',
};

export const FOOTPRINT_LABELS: Record<FantasyLaneFootprint, string> = {
  small: '小体型',
  medium: '中体型',
  large: '大体型',
  giant: '巨型',
};

export const PROFILE_LABELS: Record<FantasyLaneDamageProfile, string> = {
  single: '单体',
  aoe: '范围',
};

export const TARGET_RULE_LABELS: Record<FantasyLaneTargetRule, string> = {
  ground_only: '仅打地面',
  air_only: '仅打空中',
  both: '空地双打',
};

export const ARMOR_CLASS_LABELS: Record<FantasyLaneArmorClass, string> = {
  light: '轻甲',
  heavy: '重甲',
  swarm: '集群',
  structure: '攻城体',
};

export const ROLE_LABELS: Record<FantasyLaneCombatRole, string> = {
  tank: '前排',
  fighter: '突击',
  sniper: '狙击',
  caster: '法术',
  siege: '攻城',
  air_sup: '空优',
  finisher: '终结',
};

export function formatCooldownMs(cooldownMs: number) {
  return `${Math.max(1, Math.round(cooldownMs / 100) / 10)}s`;
}

export function getUnitSpriteScale(footprint: FantasyLaneFootprint) {
  switch (footprint) {
    case 'small':
      return 0.76;
    case 'medium':
      return 0.88;
    case 'large':
      return 1;
    default:
      return 1.12;
  }
}
