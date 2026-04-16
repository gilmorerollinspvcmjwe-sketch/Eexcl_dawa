/* 奇幻战线核心类型。统一约束单位标准字段、运行时状态和运行时调试留口。 */

import type { WorkbookStatusSummary } from '../../types/workbook.ts';

export type FantasyLaneBattlePhase = 'setup' | 'playing' | 'paused' | 'won' | 'lost';
export type FantasyLaneSide = 'player' | 'enemy';
export type FantasyLaneLaneId = 'front' | 'mid' | 'rear' | 'air';
export type FantasyLaneLayer = 'ground' | 'air';
export type FantasyLaneRangeBand = 'melee' | 'ranged';
export type FantasyLaneFootprint = 'small' | 'medium' | 'large' | 'giant';
export type FantasyLaneDamageProfile = 'single' | 'aoe';
export type FantasyLaneTargetRule = 'ground_only' | 'air_only' | 'both';
export type FantasyLaneArmorType = 'light' | 'heavy' | 'swarm' | 'structure' | 'air';
export type FantasyLaneArmorClass = Exclude<FantasyLaneArmorType, 'air'>;
export type FantasyLaneCombatRole = 'tank' | 'fighter' | 'sniper' | 'caster' | 'siege' | 'air_sup' | 'finisher';
export type FantasyLaneRoleGroup = 'tank' | 'melee' | 'ranged' | 'magic' | 'air' | 'finisher';
export type FantasyLaneDamageType = 'physical' | 'pierce' | 'blast' | 'magic' | 'siege' | 'antiAir';
export type FantasyLaneTargetClass = FantasyLaneArmorType;
export type FantasyLaneUnitSize = 'S' | 'M' | 'L' | 'XL';
export type FantasyLanePressure = 'read' | 'contest' | 'pressure' | 'boss' | 'overtime';
export type FantasyLaneEffectKind = 'haste' | 'freeze' | 'burnline' | 'shield' | 'rage' | 'fortify';
export type FantasyLaneBehaviorProtocolId = 'melee' | 'ranged' | 'air';
export type FantasyLaneHeroId = 'warlord' | 'archmage' | 'dragon_rider';
export type FantasyLaneTacticalSkillId = 'fireball' | 'heal' | 'haste' | 'freeze' | 'shield';
export type FantasyLaneIntentMode = 'advance' | 'hold' | 'retreat' | 'attackTarget' | 'attackBase';
export type FantasyLaneDebugEventType = 'spawn' | 'defeat' | 'skill' | 'bossPhase' | 'phase' | 'overtime';
export type FantasyLaneScheduledEventSource = 'phaseSpawn' | 'script' | 'bossPhaseSpawn' | 'bossSkill';
export type FantasyLaneRuntimeEventType =
  | 'levelPhaseEnter'
  | 'bossPhaseEnter'
  | 'bossSkillCast'
  | 'scheduledSpawn'
  | 'modifierApply'
  | 'warning'
  | 'bossDefeated'
  | 'overtime';

export interface FantasyLaneIncomeTier {
  untilMs: number | null;
  incomePerSecond: number;
}

export interface FantasyLaneCombatProtocol {
  id: FantasyLaneBehaviorProtocolId;
  advanceFactor: number;
  idleAdvanceFactor: number;
  holdRangeBuffer: number;
  retreatFactor: number;
  driftStrength: number;
  blockedDrift: number;
  allowRetreat: boolean;
}

export interface FantasyLaneSoftCollisionProfile {
  laneMinY: number;
  laneMaxY: number;
  trackThreshold: number;
  blockWeight: number;
  slipBonus: number;
  blockedDrift: number;
}

// 单位解锁条件类型
export interface FantasyLaneUnitUnlockCondition {
  type: 'level_clear' | 'boss_clear' | 'star_reward' | 'fragment_synthesis';
  levelId?: string;
  stars?: number;
  fragmentCount?: number;
}

// 战斗奖励类型
export interface FantasyLaneBattleRewards {
  unlockedUnits: string[];
  fragments: Record<string, number>;
}

export interface FantasyLaneUnitDefinition {
  id: string;
  name: string;
  shortName: string;
  cost: number;
  pop: number;
  maxHp: number;
  armorHp: number;
  layer: FantasyLaneLayer;
  rangeBand: FantasyLaneRangeBand;
  footprint: FantasyLaneFootprint;
  role: FantasyLaneCombatRole;
  damageType: FantasyLaneDamageType;
  damageProfile: FantasyLaneDamageProfile;
  targetRule: FantasyLaneTargetRule;
  moveSpeed: number;
  acquireRange: number;
  preferredRange: number;
  minimumRange: number;
  attackIntervalMs: number;
  attackWindupMs: number;
  attackAnimMs: number;
  projectileSpeed: number;
  collisionRadius: number;
  splashRadius: number;
  damage: number;
  armorType: FantasyLaneArmorType;
  icon: string;
  attackColor: string;
  cooldownMs: number;
  armorClass: FantasyLaneArmorClass;
  roleGroup: FantasyLaneRoleGroup;
  lane: FantasyLaneLaneId;
  targetClass: FantasyLaneTargetClass;
  size: FantasyLaneUnitSize;
  attackRange: number;
  canAttackGround: boolean;
  canAttackAir: boolean;
  tags: string[];
  summary: string;
  signature: string;
  // 解锁条件（可选）
  unlockCondition?: FantasyLaneUnitUnlockCondition;
  // 基础单位ID（用于碎片合成后的升级单位）
  baseUnit?: string;
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
  // 通关解锁的单位ID列表
  unlockRewards?: string[];
  // 碎片奖励（单位ID -> 数量）
  fragmentRewards?: Record<string, number>;
  // 星级奖励（星数 -> 单位ID列表）
  starRewards?: Record<number, string[]>;
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

export interface FantasyLaneUnitCombatState {
  currentTargetId: string | null;
  pendingTargetId: string | null;
  pendingTargetBase: boolean;
  windupRemainingMs: number;
  retargetLockMs: number;
  firstContactAtMs: number | null;
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
  starLevel: number;
  damageMultiplier: number;
  healthMultiplier: number;
  combatState?: FantasyLaneUnitCombatState;
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
  // 战斗奖励
  rewards?: FantasyLaneBattleRewards;
}

export interface FantasyLaneScheduledEvent {
  id: string;
  triggerAtMs: number;
  type: 'spawn' | 'warning' | 'grantGold' | 'modifier';
  source?: FantasyLaneScheduledEventSource;
  phaseId?: string;
  phaseLabel?: string;
  pressure?: FantasyLanePressure;
  bossPhaseId?: string;
  bossPhaseLabel?: string;
  skillId?: string;
  skillLabel?: string;
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

export interface FantasyLaneDebugEvent {
  id: string;
  atMs: number;
  type: FantasyLaneDebugEventType;
  text: string;
}

export interface FantasyLaneRuntimeEvent {
  id: string;
  atMs: number;
  type: FantasyLaneRuntimeEventType;
  phaseId?: string;
  phaseLabel?: string;
  pressure?: FantasyLanePressure;
  bossPhaseId?: string;
  bossPhaseLabel?: string;
  skillId?: string;
  skillLabel?: string;
  scheduledEventId?: string;
  scheduledEventSource?: FantasyLaneScheduledEventSource;
  side?: FantasyLaneSide;
  unitId?: string;
  modifierId?: FantasyLaneEffectKind;
  amount?: number;
  durationMs?: number;
  text?: string;
}

export interface FantasyLanePhaseTimelineEntry {
  id: string;
  source: 'level' | 'boss';
  phaseId: string;
  label: string;
  pressure: FantasyLanePressure;
  startedAtMs: number;
  endedAtMs: number | null;
  bossPhaseId?: string;
  thresholdPercent?: number;
}

export interface FantasyLaneBattleStats {
  summoned: number;
  enemySummoned: number;
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
  congestionMs: number;
  levelPhasesEntered: number;
  bossPhasesEntered: number;
  bossSkillActivations: number;
  bossPhaseSummons: number;
  scriptedModifiersApplied: number;
  engagedUnits: number;
  totalEngageDelayMs: number;
  lastSkillCastAtMs: number | null;
}

export interface FantasyLaneUnitBucketSummary {
  side: FantasyLaneSide;
  layer: FantasyLaneLayer;
  lane: FantasyLaneLaneId;
  count: number;
  totalPop: number;
}

export interface FantasyLaneBattleSnapshot {
  version: 'v1';
  levelId: string;
  chapterId: string;
  phase: FantasyLaneBattlePhase;
  phaseLabel: string;
  pressureLabel: string;
  elapsedMs: number;
  rngSeed: number;
  gold: number;
  activePop: number;
  popLimit: number;
  queueLength: number;
  queueLimit: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  frontline: number;
  airControl: number;
  clashX: number;
  congestion: number;
  heroSkillRemainingMs: number;
  tacticalSkillRemainingMs: number;
  bucketSummary: FantasyLaneUnitBucketSummary[];
}

export interface FantasyLaneRuntimeDebugSnapshot {
  version: 'v1';
  levelId: string;
  phase: FantasyLaneBattlePhase;
  rngSeed: number;
  currentPhaseId: string;
  currentBossPhaseId: string | null;
  warningText: string | null;
  queue: string[];
  unitBuckets: FantasyLaneUnitBucketSummary[];
  recentDebugEvents: FantasyLaneDebugEvent[];
  recentRuntimeEvents: FantasyLaneRuntimeEvent[];
  phaseTimeline: FantasyLanePhaseTimelineEntry[];
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
  unitStarLevels: Record<string, number>;
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
  currentPhaseStartedAtMs: number;
  currentBossPhaseId: string | null;
  currentBossPhaseLabel: string | null;
  currentBossPhaseStartedAtMs: number | null;
  lastHint: string;
  activeWarning: FantasyLaneActiveWarning | null;
  result: FantasyLaneBattleResult | null;
  rngSeed: number;
  scheduledEvents: FantasyLaneScheduledEvent[];
  triggeredBossPhases: string[];
  bossUnitInstanceId: string | null;
  debugEvents: FantasyLaneDebugEvent[];
  runtimeEvents: FantasyLaneRuntimeEvent[];
  phaseTimeline: FantasyLanePhaseTimelineEntry[];
  stats: FantasyLaneBattleStats;
}

export interface FantasyLaneSheetSnapshot {
  state?: FantasyLaneRuntimeState;
  battleSnapshot?: FantasyLaneBattleSnapshot;
  debugSnapshot?: FantasyLaneRuntimeDebugSnapshot;
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
