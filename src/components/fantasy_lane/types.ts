/* 奇幻战线 UI 共享类型：定义界面、运行时适配器和快照所需的数据结构。 */

import type { WorkbookStatusSummary } from '../../types';

export type FantasyLaneBattlePhase = 'setup' | 'playing' | 'paused' | 'won' | 'lost';
export type FantasyLaneSide = 'player' | 'enemy';
export type FantasyLaneLaneId = 'front' | 'mid' | 'rear' | 'air';
export type FantasyLaneRoleGroup = 'tank' | 'melee' | 'ranged' | 'magic' | 'air' | 'finisher';

export interface FantasyLaneUnitDefinition {
  id: string;
  name: string;
  roleGroup: FantasyLaneRoleGroup;
  lane: FantasyLaneLaneId;
  cost: number;
  cooldownMs: number;
  maxHp: number;
  armorHp: number;
  damage: number;
  attackRange: number;
  moveSpeed: number;
  attackIntervalMs: number;
  canAttackGround: boolean;
  canAttackAir: boolean;
  tags: string[];
}

export interface FantasyLaneHeroDefinition {
  id: string;
  name: string;
  summary: string;
  passiveSummary: string;
  skillId: string;
}

export interface FantasyLaneTacticalSkillDefinition {
  id: string;
  name: string;
  summary: string;
  cooldownMs: number;
}

export interface FantasyLaneLevelDefinition {
  id: string;
  name: string;
  chapter: string;
  battleTimeLimitMs: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  startingGold: number;
  enemyPressure: number;
  enemyPool: string[];
  recommendedTags: string[];
  hint: string;
}

export interface FantasyLaneSkillState {
  id: string;
  name: string;
  summary: string;
  cooldownMs: number;
  remainingMs: number;
}

export interface FantasyLaneEffectState {
  id: string;
  target: 'player' | 'enemy' | 'both';
  kind: 'haste' | 'freeze' | 'burnline';
  potency: number;
  remainingMs: number;
}

export interface FantasyLaneUnitInstance {
  instanceId: string;
  templateId: string;
  side: FantasyLaneSide;
  lane: FantasyLaneLaneId;
  x: number;
  hp: number;
  armorHp: number;
  attackCooldownMs: number;
  isAttacking: boolean;
  spawnedAtMs: number;
}

export interface FantasyLaneBattleResult {
  title: string;
  stars: 1 | 2 | 3;
  score: number;
  summary: string;
  tips: string[];
}

export interface FantasyLaneRuntimeState {
  phase: FantasyLaneBattlePhase;
  selectedLevelId: string;
  selectedHeroId: string;
  selectedTacticalId: string;
  loadoutUnitIds: string[];
  queue: string[];
  queueLimit: number;
  elapsedMs: number;
  battleTimeLimitMs: number;
  gold: number;
  playerBaseHp: number;
  playerBaseHpMax: number;
  enemyBaseHp: number;
  enemyBaseHpMax: number;
  frontline: number;
  unitCooldowns: Record<string, number>;
  heroSkill: FantasyLaneSkillState;
  tacticalSkill: FantasyLaneSkillState;
  globalSpawnCooldownMs: number;
  enemySpawnCooldownMs: number;
  units: FantasyLaneUnitInstance[];
  effects: FantasyLaneEffectState[];
  pressureLabel: string;
  lastHint: string;
  result: FantasyLaneBattleResult | null;
  rngSeed: number;
  stats: {
    summoned: number;
    defeated: number;
    heroSkillCast: number;
    tacticalSkillCast: number;
    queueBlocked: number;
  };
}

export interface FantasyLaneRuntimeAdapter {
  getLevels: () => FantasyLaneLevelDefinition[];
  getHeroes: () => FantasyLaneHeroDefinition[];
  getTacticalSkills: () => FantasyLaneTacticalSkillDefinition[];
  getUnits: () => FantasyLaneUnitDefinition[];
  createInitialState: (snapshot?: Record<string, unknown> | null) => FantasyLaneRuntimeState;
  startBattle: (state: FantasyLaneRuntimeState) => FantasyLaneRuntimeState;
  pauseBattle: (state: FantasyLaneRuntimeState) => FantasyLaneRuntimeState;
  resumeBattle: (state: FantasyLaneRuntimeState) => FantasyLaneRuntimeState;
  restartBattle: (state: FantasyLaneRuntimeState) => FantasyLaneRuntimeState;
  tick: (state: FantasyLaneRuntimeState, deltaMs: number) => FantasyLaneRuntimeState;
  selectLevel: (state: FantasyLaneRuntimeState, levelId: string) => FantasyLaneRuntimeState;
  selectHero: (state: FantasyLaneRuntimeState, heroId: string) => FantasyLaneRuntimeState;
  selectTacticalSkill: (state: FantasyLaneRuntimeState, skillId: string) => FantasyLaneRuntimeState;
  toggleLoadoutUnit: (state: FantasyLaneRuntimeState, unitId: string) => FantasyLaneRuntimeState;
  queueUnit: (state: FantasyLaneRuntimeState, unitId: string) => FantasyLaneRuntimeState;
  castSkill: (state: FantasyLaneRuntimeState, skillId: string) => FantasyLaneRuntimeState;
  getFormulaText: (state: FantasyLaneRuntimeState) => string;
  getStatusSummary: (state: FantasyLaneRuntimeState) => WorkbookStatusSummary;
}

export interface FantasyLaneSheetSnapshot {
  state?: FantasyLaneRuntimeState;
  setupCollapsed?: boolean;
  selectedTab?: 'levels' | 'loadout';
}
