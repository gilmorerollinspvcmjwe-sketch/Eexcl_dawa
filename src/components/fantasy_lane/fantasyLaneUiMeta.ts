import type {
  FantasyLaneArmorClass,
  FantasyLaneBossPhaseDef,
  FantasyLaneCombatRole,
  FantasyLaneDamageProfile,
  FantasyLaneFootprint,
  FantasyLaneLayer,
  FantasyLaneLevelDefinition,
  FantasyLaneRangeBand,
  FantasyLaneRuntimeState,
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
      return 0.70;
    case 'medium':
      return 0.85;
    case 'large':
      return 1;
    default:
      return 1.2;
  }
}

export function getPhaseNarrativeTone(pressureLabel: string) {
  if (pressureLabel.includes('终局') || pressureLabel.includes('Boss')) return 'critical';
  if (pressureLabel.includes('加压') || pressureLabel.includes('高压')) return 'warning';
  if (pressureLabel.includes('对推') || pressureLabel.includes('压制')) return 'contest';
  return 'steady';
}

export function getClashZoneLabel(frontline: number, airControl: number) {
  if (frontline >= 12) return '我方压到敌堡前';
  if (frontline <= -12) return '敌军已压到我方半场';
  if (airControl >= 3) return '空优领先，适合逼近';
  if (airControl <= -3) return '空层失衡，优先补对空';
  return '交战胶着，稳线等窗口';
}

export function getUnitCombatAccent(unit: { hitFlashMs: number; attackAnimMs: number; blockedMs: number; side: 'player' | 'enemy' }) {
  if (unit.hitFlashMs > 0) return unit.side === 'player' ? '#60a5fa' : '#f87171';
  if (unit.attackAnimMs > 0) return '#f59e0b';
  if (unit.blockedMs > 340) return '#fbbf24';
  return unit.side === 'player' ? '#2563eb' : '#dc2626';
}

export function getCurrentBossPhase(level: FantasyLaneLevelDefinition, state: FantasyLaneRuntimeState): FantasyLaneBossPhaseDef | null {
  if (!level.boss) return null;
  for (let index = level.boss.phases.length - 1; index >= 0; index -= 1) {
    const phase = level.boss.phases[index];
    if (phase && state.triggeredBossPhases.includes(phase.id)) {
      return phase;
    }
  }
  if (state.bossUnitInstanceId) {
    return level.boss.phases[0] ?? null;
  }
  return null;
}

export function getReachedBossPhaseCount(level: FantasyLaneLevelDefinition, state: FantasyLaneRuntimeState) {
  if (!level.boss) return 0;
  return level.boss.phases.filter((phase) => state.triggeredBossPhases.includes(phase.id)).length;
}

export function getBossPhaseVisualState(
  level: FantasyLaneLevelDefinition,
  state: FantasyLaneRuntimeState,
  phaseId: string,
): 'active' | 'cleared' | 'queued' | 'idle' {
  if (!level.boss) return 'idle';
  const currentPhase = getCurrentBossPhase(level, state);
  if (currentPhase?.id === phaseId) return 'active';
  if (state.triggeredBossPhases.includes(phaseId)) return 'cleared';
  const nextPhase = level.boss.phases.find((phase) => !state.triggeredBossPhases.includes(phase.id));
  if (nextPhase?.id === phaseId) return 'queued';
  return 'idle';
}
