import type { WorkbookStatusSummary } from '../../types/workbook.ts';

export type FantasyLaneBattlePhase = 'setup' | 'playing' | 'paused' | 'won' | 'lost';
export type FantasyLaneSide = 'player' | 'enemy';
export type FantasyLaneLaneId = 'front' | 'mid' | 'rear' | 'air';
export type FantasyLaneLayer = 'ground' | 'air';
export type FantasyLaneRangeBand = 'melee' | 'ranged';
export type FantasyLaneFootprint = 'small' | 'medium' | 'large' | 'giant';
export type FantasyLaneDamageProfile = 'single' | 'aoe';
export type FantasyLaneTargetRule = 'ground_only' | 'air_only' | 'both';
export type FantasyLaneArmorClass = 'light' | 'heavy' | 'swarm' | 'structure';
export type FantasyLaneCombatRole = 'tank' | 'fighter' | 'sniper' | 'caster' | 'siege' | 'air_sup' | 'finisher';
export type FantasyLaneRoleGroup = 'tank' | 'melee' | 'ranged' | 'magic' | 'air' | 'finisher';
export type FantasyLaneDamageType = 'physical' | 'pierce' | 'blast' | 'magic' | 'siege' | 'antiAir';
export type FantasyLaneTargetClass = 'light' | 'heavy' | 'swarm' | 'air' | 'structure';
export type FantasyLaneUnitSize = 'S' | 'M' | 'L' | 'XL';
export type FantasyLanePressure = 'read' | 'contest' | 'pressure' | 'boss' | 'overtime';
export type FantasyLaneEffectKind = 'haste' | 'freeze' | 'burnline' | 'shield';
export type FantasyLaneHeroId = 'warlord' | 'archmage' | 'dragon_rider';
export type FantasyLaneTacticalSkillId = 'fireball' | 'heal' | 'haste' | 'freeze' | 'shield';

export interface FantasyLaneUnitDefinition {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  layer: FantasyLaneLayer;
  rangeBand: FantasyLaneRangeBand;
  footprint: FantasyLaneFootprint;
  damageProfile: FantasyLaneDamageProfile;
  targetRule: FantasyLaneTargetRule;
  armorClass: FantasyLaneArmorClass;
  role: FantasyLaneCombatRole;
  pop: number;
  collisionRadius: number;
  preferredRange: number;
  minimumRange: number;
  projectileSpeed: number;
  attackWindupMs: number;
  attackAnimMs: number;
  attackColor: string;
  roleGroup: FantasyLaneRoleGroup;
  lane: FantasyLaneLaneId;
  cost: number;
  cooldownMs: number;
  maxHp: number;
  armorHp: number;
  damage: number;
  damageType: FantasyLaneDamageType;
  targetClass: FantasyLaneTargetClass;
  size: FantasyLaneUnitSize;
  attackRange: number;
  moveSpeed: number;
  attackIntervalMs: number;
  splashRadius: number;
  canAttackGround: boolean;
  canAttackAir: boolean;
  tags: string[];
  summary: string;
  signature: string;
}

export interface FantasyLaneHeroDefinition {
  id: FantasyLaneHeroId;
  name: string;
  summary: string;
  passiveSummary: string;
  skillId: string;
  cooldownMs: number;
}

export interface FantasyLaneTacticalSkillDefinition {
  id: FantasyLaneTacticalSkillId;
  name: string;
  summary: string;
  cooldownMs: number;
}

export interface FantasyLaneSpawnGroup {
  id: string;
  side: 'enemy';
  unitId: string;
  firstDelaySec: number;
  count: number;
  intervalSec: number;
  laneOverride?: FantasyLaneLaneId;
  note?: string;
}

export interface FantasyLaneActionDef {
  type: 'spawn' | 'showWarning' | 'grantGold' | 'applyModifier';
  spawnGroup?: FantasyLaneSpawnGroup;
  text?: string;
  amount?: number;
  target?: FantasyLaneSide | 'both';
  modifierId?: FantasyLaneEffectKind;
  durationSec?: number;
  potency?: number;
}

export interface FantasyLaneTriggerDef {
  id: string;
  when: 'time';
  compare: '==' | '>=' | '<=';
  value: number;
  once: boolean;
  actions: FantasyLaneActionDef[];
}

export interface FantasyLanePhaseDef {
  id: string;
  label: string;
  startAtSec: number;
  endAtSec?: number;
  pressure: FantasyLanePressure;
  spawnGroups: FantasyLaneSpawnGroup[];
  scriptedEvents?: FantasyLaneTriggerDef[];
}

export interface FantasyLaneBossPhaseDef {
  id: string;
  hpThreshold: number;
  enterWarning: string;
  skills: string[];
  phaseSpawnGroups?: FantasyLaneSpawnGroup[];
}

export interface FantasyLaneBossDef {
  id: string;
  name: string;
  unitId: string;
  phases: FantasyLaneBossPhaseDef[];
}

export interface FantasyLaneRatingRules {
  threeStarBaseHpPercent: number;
  twoStarBaseHpPercent: number;
}

export interface FantasyLaneFailureHintMap {
  lowAntiAir?: string;
  lowFrontline?: string;
  lowAoE?: string;
  overSavingGold?: string;
  lateSkillUse?: string;
}

export interface FantasyLaneChapterDefinition {
  id: string;
  order: number;
  name: string;
  theme: string;
  focus: string;
  bossName: string;
  summary: string;
}

export interface FantasyLaneLevelDefinition {
  id: string;
  chapterId: string;
  chapterName: string;
  indexInChapter: number;
  name: string;
  description: string;
  battleTimeLimitMs: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  startingGold: number;
  enemyPressure: number;
  enemyPool: string[];
  recommendedTags: string[];
  suggestedHeroes: FantasyLaneHeroId[];
  hint: string;
  phases: FantasyLanePhaseDef[];
  boss?: FantasyLaneBossDef;
  ratingRules: FantasyLaneRatingRules;
  failureHints: FantasyLaneFailureHintMap;
  unlockReward?: string;
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
  target: FantasyLaneSide | 'both';
  kind: FantasyLaneEffectKind;
  potency: number;
  remainingMs: number;
}

export interface FantasyLaneUnitInstance {
  instanceId: string;
  templateId: string;
  side: FantasyLaneSide;
  layer: FantasyLaneLayer;
  lane: FantasyLaneLaneId;
  x: number;
  y: number;
  hp: number;
  armorHp: number;
  attackCooldownMs: number;
  attackAnimMs: number;
  hitFlashMs: number;
  blockedMs: number;
  lastTargetId: string | null;
  spawnedAtMs: number;
}

export interface FantasyLaneProjectile {
  id: string;
  sourceInstanceId: string;
  sourceUnitId: string;
  side: FantasyLaneSide;
  layer: FantasyLaneLayer;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  x: number;
  y: number;
  targetInstanceId: string | null;
  targetBase: boolean;
  damage: number;
  splashRadius: number;
  damageType: FantasyLaneDamageType;
  color: string;
  remainingMs: number;
  totalMs: number;
}

export interface FantasyLaneImpactEffect {
  id: string;
  x: number;
  y: number;
  layer: FantasyLaneLayer;
  kind: 'hit' | 'aoe' | 'skill';
  color: string;
  remainingMs: number;
}

export interface FantasyLaneBattleResult {
  title: string;
  stars: 1 | 2 | 3;
  score: number;
  summary: string;
  tips: string[];
}

export interface FantasyLaneScheduledEvent {
  id: string;
  triggerAtMs: number;
  type: 'spawn' | 'warning' | 'grantGold' | 'modifier';
  spawnGroup?: FantasyLaneSpawnGroup;
  text?: string;
  amount?: number;
  target?: FantasyLaneSide | 'both';
  modifierId?: FantasyLaneEffectKind;
  durationMs?: number;
  potency?: number;
}

export interface FantasyLaneActiveWarning {
  id: string;
  text: string;
  remainingMs: number;
}

export interface FantasyLaneRuntimeState {
  phase: FantasyLaneBattlePhase;
  selectedLevelId: string;
  selectedChapterId: string;
  selectedHeroId: FantasyLaneHeroId;
  selectedTacticalId: FantasyLaneTacticalSkillId;
  loadoutUnitIds: string[];
  queue: string[];
  queueLimit: number;
  popLimit: number;
  activePop: number;
  elapsedMs: number;
  battleTimeLimitMs: number;
  overtimeRemainingMs: number;
  overtimeTriggered: boolean;
  gold: number;
  playerBaseHp: number;
  playerBaseHpMax: number;
  enemyBaseHp: number;
  enemyBaseHpMax: number;
  frontline: number;
  airControl: number;
  clashX: number;
  congestion: number;
  unitCooldowns: Record<string, number>;
  heroSkill: FantasyLaneSkillState;
  tacticalSkill: FantasyLaneSkillState;
  globalSpawnCooldownMs: number;
  enemySpawnCooldownMs: number;
  units: FantasyLaneUnitInstance[];
  projectiles: FantasyLaneProjectile[];
  impacts: FantasyLaneImpactEffect[];
  effects: FantasyLaneEffectState[];
  pressureLabel: string;
  phaseLabel: string;
  currentPhaseId: string;
  lastHint: string;
  activeWarning: FantasyLaneActiveWarning | null;
  result: FantasyLaneBattleResult | null;
  rngSeed: number;
  scheduledEvents: FantasyLaneScheduledEvent[];
  triggeredBossPhases: string[];
  bossUnitInstanceId: string | null;
  stats: {
    summoned: number;
    defeated: number;
    heroSkillCast: number;
    tacticalSkillCast: number;
    queueBlocked: number;
    projectilesFired: number;
    aoeHits: number;
    frontlineSummons: number;
    antiAirSummons: number;
    aoeSummons: number;
    goldSpent: number;
    goldCappedMs: number;
    lastSkillCastAtMs: number | null;
  };
}

export interface FantasyLaneSheetSnapshot {
  state?: FantasyLaneRuntimeState;
  setupCollapsed?: boolean;
  selectedTab?: 'levels' | 'loadout';
}

export interface FantasyLaneRuntimeAdapter {
  getChapters: () => FantasyLaneChapterDefinition[];
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
  selectHero: (state: FantasyLaneRuntimeState, heroId: FantasyLaneHeroId) => FantasyLaneRuntimeState;
  selectTacticalSkill: (state: FantasyLaneRuntimeState, skillId: FantasyLaneTacticalSkillId) => FantasyLaneRuntimeState;
  toggleLoadoutUnit: (state: FantasyLaneRuntimeState, unitId: string) => FantasyLaneRuntimeState;
  queueUnit: (state: FantasyLaneRuntimeState, unitId: string) => FantasyLaneRuntimeState;
  castSkill: (state: FantasyLaneRuntimeState, skillId: string) => FantasyLaneRuntimeState;
  getFormulaText: (state: FantasyLaneRuntimeState) => string;
  getStatusSummary: (state: FantasyLaneRuntimeState) => WorkbookStatusSummary;
}

export const FANTASY_LANE_IDS = {
  defaultLevelId: '1-1',
  defaultHeroId: 'warlord' as FantasyLaneHeroId,
  defaultTacticalId: 'fireball' as FantasyLaneTacticalSkillId,
  defaultLoadout: [
    'goblin_shield',
    'archer',
    'flame_warlock',
    'orc_heavy',
    'crypt_crawler',
    'elf_shooter',
    'ice_witch',
    'griffin_knight',
  ],
};

export const FANTASY_LANE_LANES: FantasyLaneLaneId[] = ['front', 'mid', 'rear', 'air'];
