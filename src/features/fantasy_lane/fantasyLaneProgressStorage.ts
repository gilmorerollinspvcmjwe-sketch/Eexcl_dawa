/* 杩欎釜鏂囦欢璐熻矗濂囧够鎴樼嚎鐨勮繘搴﹀瓨妗ｏ紝缁熶竴绠＄悊瑙ｉ攣銆佸叧鍗¤褰曘€佽繍琛屾椂缁熻浠ュ強鍥炴斁/璋冭瘯瀛楁銆?*/
import { FANTASY_LANE_CHAPTERS, FANTASY_LANE_LEVELS, getFantasyLaneLevelById, getFantasyLaneLevelsByChapter } from './fantasyLaneLevelCatalog.ts';
import { FANTASY_LANE_UNIT_MAP, FANTASY_LANE_UNITS } from './fantasyLaneUnitRegistry.ts';
import type { FantasyLaneBattleResult } from './fantasyLaneTypes.ts';

const STORAGE_KEY = 'fantasy-lane-progress-v1';
const RECENT_RUN_LIMIT = 5;
export const FANTASY_LANE_PRESET_SLOT_COUNT = 4;
const FANTASY_LANE_STAR_FRAGMENT_COSTS = [3, 5, 8] as const;

export interface FantasyLaneLoadoutPreset {
  slotId: number;
  name: string;
  unitIds: string[];
  heroId?: string;
  tacticalSkillId?: string;
  updatedAt: number;
}

export interface FantasyLaneRuntimeStatsSnapshot {
  summoned: number;
  defeated: number;
  queueBlocked: number;
  projectilesFired: number;
  aoeHits: number;
  frontlineSummons: number;
  antiAirSummons: number;
  aoeSummons: number;
  goldSpent: number;
  goldCappedMs: number;
  congestionMs: number;
  engagedUnits: number;
  totalEngageDelayMs: number;
  heroSkillCast: number;
  tacticalSkillCast: number;
  lastSkillCastAtMs: number | null;
  averageEngageTimeMs: number;
}

export interface FantasyLaneReplayCheckpoint {
  atMs: number;
  label: string;
  frontline: number;
  airControl: number;
}

export interface FantasyLaneReplayEvent {
  atMs: number;
  type: string;
  detail: string;
}

export interface FantasyLaneReplaySnapshot {
  version: string;
  seed: number;
  checkpoints: FantasyLaneReplayCheckpoint[];
  events: FantasyLaneReplayEvent[];
}

export interface FantasyLaneDebugSnapshot {
  warnings: string[];
  congestionPeak: number;
  frontlineRange: {
    min: number;
    max: number;
  };
  bossPhaseIds: string[];
}

export interface FantasyLaneRunSetup {
  levelId: string;
  runId: string;
  heroId?: string;
  tacticalSkillId?: string;
  loadoutUnitIds: string[];
  runtimeSeed?: number;
  startedAt: number;
}

export interface FantasyLaneRunRecord extends FantasyLaneRunSetup {
  finishedAt: number;
  currentPhaseId: string;
  completed: boolean;
  resultTitle: string;
  stars: number;
  score: number;
  baseHpPercent: number;
  runtimeStats?: FantasyLaneRuntimeStatsSnapshot;
  replay?: FantasyLaneReplaySnapshot;
  debug?: FantasyLaneDebugSnapshot;
}

export interface FantasyLaneLevelResultPayload {
  finishedAt?: number;
  currentPhaseId?: string;
  runtimeStats?: Partial<FantasyLaneRuntimeStatsSnapshot>;
  replay?: FantasyLaneReplaySnapshot;
  debug?: FantasyLaneDebugSnapshot;
}

export interface FantasyLanePhaseSnapshot {
  phaseId: string;
  label: string;
  pressure: string;
  reached: boolean;
  completed: boolean;
  checkpointCount: number;
  eventCount: number;
}

export interface FantasyLaneBossBattleSummary {
  bossId: string;
  bossName: string;
  totalPhaseCount: number;
  triggeredPhaseIds: string[];
  triggeredPhaseCount: number;
  cleared: boolean;
  lastTriggeredPhaseId?: string;
}

export interface FantasyLaneLevelRecord {
  levelId: string;
  chapterId: string;
  chapterOrder: number;
  chapterLevelIndex: number;
  attempts: number;
  completed: boolean;
  bestStars: number;
  bestScore: number;
  bestBaseHpPercent: number;
  completedAt?: number;
  lastPlayedAt?: number;
  lastStart?: FantasyLaneRunSetup;
  latestRun?: FantasyLaneRunRecord;
  recentRuns: FantasyLaneRunRecord[];
  latestReplay?: FantasyLaneReplaySnapshot;
  latestDebug?: FantasyLaneDebugSnapshot;
  lastRuntimeStats?: FantasyLaneRuntimeStatsSnapshot;
  phaseSnapshots: FantasyLanePhaseSnapshot[];
  latestBossBattle?: FantasyLaneBossBattleSummary;
}

export interface FantasyLaneChapterRecord {
  chapterId: string;
  chapterName: string;
  totalLevels: number;
  completedLevels: number;
  stars: number;
  maxStars: number;
  bestScore: number;
  bossLevelId: string;
  bossCleared: boolean;
  bestBossScore: number;
  lastPlayedLevelId?: string;
  lastBossLevelId?: string;
}

export interface FantasyLaneBattleTotals {
  totalRuns: number;
  wins: number;
  losses: number;
  bossRuns: number;
  bossClears: number;
  phaseEntries: Record<string, number>;
  bossPhaseTriggers: Record<string, number>;
}

export interface FantasyLaneProgressData {
  completedLevels: string[];
  levelRecords: Record<string, FantasyLaneLevelRecord>;
  totalCompleted: number;
  totalStars: number;
  bestScore: number;
  highestUnlockedLevelId: string;
  highestChapterId: string;
  lastPlayedLevelId: string;
  updatedAt: number;
  activeRun?: FantasyLaneRunSetup;
  runtimeTotals: FantasyLaneRuntimeStatsSnapshot;
  telemetryRunCount: number;
  chapterRecords: Record<string, FantasyLaneChapterRecord>;
  battleTotals: FantasyLaneBattleTotals;
  // 已解锁的单位 ID 列表
  unlockedUnits: string[];
  // 单位碎片（单位 ID -> 数量）
  unitFragments: Record<string, number>;
  // 单位星级（单位 ID -> 星级）
  unitStars: Record<string, number>;
  loadoutPresets: Record<string, FantasyLaneLoadoutPreset>;
}

export interface FantasyLaneProgressSummary {
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  maxStars: number;
  bestScore: number;
  hasStarted: boolean;
  highestUnlockedLevelId: string;
  highestChapterId: string;
  currentChapterLabel: string;
  completionPercent: number;
  starPercent: number;
  lastPlayedLevelId: string;
  lastPlayedLevelName: string;
}

export interface FantasyLaneCollectionSummary {
  unlocked: number;
  total: number;
  percent: number;
  groundUnlocked: number;
  groundTotal: number;
  airUnlocked: number;
  airTotal: number;
  chapterCleared: number;
  chapterTotal: number;
}

function createEmptyRuntimeStats(): FantasyLaneRuntimeStatsSnapshot {
  return {
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
  };
}

function createEmptyBattleTotals(): FantasyLaneBattleTotals {
  return {
    totalRuns: 0,
    wins: 0,
    losses: 0,
    bossRuns: 0,
    bossClears: 0,
    phaseEntries: {},
    bossPhaseTriggers: {},
  };
}

function getPresetSlotIds() {
  return Array.from({ length: FANTASY_LANE_PRESET_SLOT_COUNT }, (_, index) => index + 1);
}

function createDefaultLoadoutPresets(): Record<string, FantasyLaneLoadoutPreset> {
  return Object.fromEntries(
    getPresetSlotIds().map((slotId) => [
      String(slotId),
      {
        slotId,
        name: `缂栫粍${slotId}`,
        unitIds: [],
        updatedAt: 0,
      } satisfies FantasyLaneLoadoutPreset,
    ]),
  ) as Record<string, FantasyLaneLoadoutPreset>;
}

export function createDefaultFantasyLaneLoadoutPresets() {
  return createDefaultLoadoutPresets();
}

export function getFantasyLaneUnitUpgradeCost(starLevel: number) {
  return FANTASY_LANE_STAR_FRAGMENT_COSTS[Math.max(0, Math.min(FANTASY_LANE_STAR_FRAGMENT_COSTS.length - 1, starLevel))] ?? 0;
}

function normalizePreset(input: unknown, slotId: number): FantasyLaneLoadoutPreset {
  const fallback = {
    slotId,
    name: `缂栫粍${slotId}`,
    unitIds: [],
    updatedAt: 0,
  } satisfies FantasyLaneLoadoutPreset;

  if (!input || typeof input !== 'object') return fallback;

  const data = input as Partial<FantasyLaneLoadoutPreset>;
  const validUnitIds = normalizeStringList(data.unitIds)
    .filter((unitId) => Boolean(FANTASY_LANE_UNIT_MAP[unitId]))
    .slice(0, 8);

  return {
    slotId,
    name: typeof data.name === 'string' && data.name.trim().length > 0 ? data.name.trim().slice(0, 16) : fallback.name,
    unitIds: validUnitIds,
    heroId: typeof data.heroId === 'string' && data.heroId.length > 0 ? data.heroId : undefined,
    tacticalSkillId: typeof data.tacticalSkillId === 'string' && data.tacticalSkillId.length > 0 ? data.tacticalSkillId : undefined,
    updatedAt: typeof data.updatedAt === 'number' ? Math.max(0, data.updatedAt) : 0,
  };
}

function getAverageEngageTimeMs(engagedUnits: number, totalEngageDelayMs: number, fallback = 0) {
  if (engagedUnits > 0) {
    return Math.round(totalEngageDelayMs / engagedUnits);
  }
  return Math.max(0, fallback);
}

function createLevelRecord(levelId: string): FantasyLaneLevelRecord {
  const level = getFantasyLaneLevelById(levelId);
  return {
    levelId,
    chapterId: level.chapterId,
    chapterOrder: Number.parseInt(level.chapterId.replace('chapter-', ''), 10),
    chapterLevelIndex: level.indexInChapter,
    attempts: 0,
    completed: false,
    bestStars: 0,
    bestScore: 0,
    bestBaseHpPercent: 0,
    recentRuns: [],
    phaseSnapshots: [],
  };
}

function incrementCounter(counter: Record<string, number>, key: string) {
  counter[key] = (counter[key] ?? 0) + 1;
}

function buildPhaseSnapshots(
  levelId: string,
  currentPhaseId: string | undefined,
  replay: FantasyLaneReplaySnapshot | undefined,
  completed: boolean,
): FantasyLanePhaseSnapshot[] {
  const level = getFantasyLaneLevelById(levelId);
  const currentPhaseIndex = currentPhaseId ? level.phases.findIndex((phase) => phase.id === currentPhaseId) : -1;
  let highestReachedIndex = completed ? level.phases.length - 1 : currentPhaseIndex;

  const phaseSnapshots = level.phases.map((phase, index) => {
    const startAtMs = phase.startAtSec * 1000;
    const endAtMs = typeof phase.endAtSec === 'number' ? phase.endAtSec * 1000 : Number.POSITIVE_INFINITY;
    const checkpointCount =
      replay?.checkpoints.filter((checkpoint) => checkpoint.atMs >= startAtMs && checkpoint.atMs < endAtMs).length ?? 0;
    const eventCount = replay?.events.filter((event) => event.atMs >= startAtMs && event.atMs < endAtMs).length ?? 0;

    if (checkpointCount > 0 || eventCount > 0) {
      highestReachedIndex = Math.max(highestReachedIndex, index);
    }

    return {
      phaseId: phase.id,
      label: phase.label,
      pressure: phase.pressure,
      reached: false,
      completed: false,
      checkpointCount,
      eventCount,
    };
  });

  if (highestReachedIndex < 0) {
    return completed ? phaseSnapshots.map((phase) => ({ ...phase, reached: true, completed: true })) : [];
  }

  return phaseSnapshots.map((phase, index) => ({
    ...phase,
    reached: index <= highestReachedIndex,
    completed: completed ? true : index < highestReachedIndex,
  }));
}

function buildBossBattleSummary(
  levelId: string,
  debug: FantasyLaneDebugSnapshot | undefined,
  currentPhaseId: string | undefined,
  completed: boolean,
): FantasyLaneBossBattleSummary | undefined {
  const level = getFantasyLaneLevelById(levelId);
  if (!level.boss) return undefined;

  const bossEntryIndex = level.phases.findIndex((phase) => phase.id.endsWith('boss-enter'));
  const currentPhaseIndex = currentPhaseId ? level.phases.findIndex((phase) => phase.id === currentPhaseId) : -1;
  const enteredBossBattle = completed || currentPhaseIndex >= bossEntryIndex || normalizeStringList(debug?.bossPhaseIds).length > 0;
  if (!enteredBossBattle) return undefined;

  const orderedPhaseIds = level.boss.phases.map((phase) => phase.id);
  const triggeredPhaseIds = orderedPhaseIds.filter((phaseId) => normalizeStringList(debug?.bossPhaseIds).includes(phaseId));

  return {
    bossId: level.boss.id,
    bossName: level.boss.name,
    totalPhaseCount: level.boss.phases.length,
    triggeredPhaseIds,
    triggeredPhaseCount: triggeredPhaseIds.length,
    cleared: completed,
    lastTriggeredPhaseId: triggeredPhaseIds[triggeredPhaseIds.length - 1],
  };
}

function buildChapterRecords(
  levelRecords: Record<string, FantasyLaneLevelRecord>,
  lastPlayedLevelId: string,
): Record<string, FantasyLaneChapterRecord> {
  return Object.fromEntries(
    FANTASY_LANE_CHAPTERS.map((chapter) => {
      const levels = getFantasyLaneLevelsByChapter(chapter.id);
      const records = levels.map((level) => levelRecords[level.id] ?? createLevelRecord(level.id));
      const bossLevelId = levels[levels.length - 1]?.id ?? `${chapter.order}-6`;
      const bossRecord = levelRecords[bossLevelId];
      const lastPlayedInChapter = levels
        .filter((level) => (levelRecords[level.id]?.lastPlayedAt ?? 0) > 0)
        .sort((left, right) => (levelRecords[right.id]?.lastPlayedAt ?? 0) - (levelRecords[left.id]?.lastPlayedAt ?? 0))[0];

      return [
        chapter.id,
        {
          chapterId: chapter.id,
          chapterName: chapter.name,
          totalLevels: levels.length,
          completedLevels: records.filter((record) => record.completed).length,
          stars: records.reduce((sum, record) => sum + record.bestStars, 0),
          maxStars: levels.length * 3,
          bestScore: records.reduce((max, record) => Math.max(max, record.bestScore), 0),
          bossLevelId,
          bossCleared: Boolean(bossRecord?.completed),
          bestBossScore: bossRecord?.bestScore ?? 0,
          lastPlayedLevelId:
            lastPlayedInChapter?.id ??
            (getFantasyLaneLevelById(lastPlayedLevelId).chapterId === chapter.id ? lastPlayedLevelId : undefined),
          lastBossLevelId: bossRecord?.lastPlayedAt ? bossLevelId : undefined,
        } satisfies FantasyLaneChapterRecord,
      ];
    }),
  ) as Record<string, FantasyLaneChapterRecord>;
}

function buildBattleTotalsFromRecords(levelRecords: Record<string, FantasyLaneLevelRecord>): FantasyLaneBattleTotals {
  const totals = createEmptyBattleTotals();

  Object.values(levelRecords).forEach((record) => {
    const level = getFantasyLaneLevelById(record.levelId);
    totals.totalRuns += record.attempts;
    if (level.boss) {
      totals.bossRuns += record.attempts;
      if (record.completed) {
        totals.bossClears += 1;
      }
    }
    if (record.completed) {
      totals.wins += 1;
    } else if (record.attempts > 0) {
      totals.losses += 1;
    }
    record.phaseSnapshots.forEach((phase) => {
      if (phase.reached) incrementCounter(totals.phaseEntries, phase.phaseId);
    });
    record.latestBossBattle?.triggeredPhaseIds.forEach((phaseId) => incrementCounter(totals.bossPhaseTriggers, phaseId));
  });

  return totals;
}

function createInitialProgress(): FantasyLaneProgressData {
  const lastPlayedLevelId = '1-1';
  return {
    completedLevels: [],
    levelRecords: {},
    totalCompleted: 0,
    totalStars: 0,
    bestScore: 0,
    highestUnlockedLevelId: lastPlayedLevelId,
    highestChapterId: 'chapter-1',
    lastPlayedLevelId,
    updatedAt: Date.now(),
    runtimeTotals: createEmptyRuntimeStats(),
    telemetryRunCount: 0,
    chapterRecords: buildChapterRecords({}, lastPlayedLevelId),
    battleTotals: createEmptyBattleTotals(),
    unlockedUnits: [],
    unitFragments: {},
    unitStars: {},
    loadoutPresets: createDefaultLoadoutPresets(),
  };
}

function canUseStorage() {
  return typeof localStorage !== 'undefined';
}

function getNextLevelId(levelId: string): string | null {
  const current = FANTASY_LANE_LEVELS.findIndex((level) => level.id === levelId);
  if (current < 0 || current >= FANTASY_LANE_LEVELS.length - 1) return null;
  return FANTASY_LANE_LEVELS[current + 1]?.id ?? null;
}

function clampStars(stars: number) {
  return Math.max(0, Math.min(3, stars || 0));
}

function normalizeStringList(input: unknown): string[] {
  return Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

function normalizeCounterMap(input: unknown, fallback: Record<string, number> = {}): Record<string, number> {
  if (!input || typeof input !== 'object') return { ...fallback };
  return Object.fromEntries(
    Object.entries(input).flatMap(([key, value]) =>
      typeof value === 'number' && Number.isFinite(value) && value >= 0 ? [[key, Math.round(value)]] : [],
    ),
  ) as Record<string, number>;
}

function normalizeRuntimeStats(input: Partial<FantasyLaneRuntimeStatsSnapshot> | null | undefined): FantasyLaneRuntimeStatsSnapshot {
  const base = createEmptyRuntimeStats();
  if (!input || typeof input !== 'object') return base;
  const engagedUnits = typeof input.engagedUnits === 'number' ? Math.max(0, input.engagedUnits) : base.engagedUnits;
  const totalEngageDelayMs =
    typeof input.totalEngageDelayMs === 'number' ? Math.max(0, input.totalEngageDelayMs) : base.totalEngageDelayMs;
  return {
    summoned: typeof input.summoned === 'number' ? Math.max(0, input.summoned) : base.summoned,
    defeated: typeof input.defeated === 'number' ? Math.max(0, input.defeated) : base.defeated,
    queueBlocked: typeof input.queueBlocked === 'number' ? Math.max(0, input.queueBlocked) : base.queueBlocked,
    projectilesFired: typeof input.projectilesFired === 'number' ? Math.max(0, input.projectilesFired) : base.projectilesFired,
    aoeHits: typeof input.aoeHits === 'number' ? Math.max(0, input.aoeHits) : base.aoeHits,
    frontlineSummons: typeof input.frontlineSummons === 'number' ? Math.max(0, input.frontlineSummons) : base.frontlineSummons,
    antiAirSummons: typeof input.antiAirSummons === 'number' ? Math.max(0, input.antiAirSummons) : base.antiAirSummons,
    aoeSummons: typeof input.aoeSummons === 'number' ? Math.max(0, input.aoeSummons) : base.aoeSummons,
    goldSpent: typeof input.goldSpent === 'number' ? Math.max(0, input.goldSpent) : base.goldSpent,
    goldCappedMs: typeof input.goldCappedMs === 'number' ? Math.max(0, input.goldCappedMs) : base.goldCappedMs,
    congestionMs: typeof input.congestionMs === 'number' ? Math.max(0, input.congestionMs) : base.congestionMs,
    engagedUnits,
    totalEngageDelayMs,
    heroSkillCast: typeof input.heroSkillCast === 'number' ? Math.max(0, input.heroSkillCast) : base.heroSkillCast,
    tacticalSkillCast: typeof input.tacticalSkillCast === 'number' ? Math.max(0, input.tacticalSkillCast) : base.tacticalSkillCast,
    lastSkillCastAtMs: typeof input.lastSkillCastAtMs === 'number' ? input.lastSkillCastAtMs : base.lastSkillCastAtMs,
    averageEngageTimeMs: getAverageEngageTimeMs(
      engagedUnits,
      totalEngageDelayMs,
      typeof input.averageEngageTimeMs === 'number' ? input.averageEngageTimeMs : base.averageEngageTimeMs,
    ),
  };
}

function normalizeReplayCheckpoint(input: unknown): FantasyLaneReplayCheckpoint | null {
  if (!input || typeof input !== 'object') return null;
  const data = input as Partial<FantasyLaneReplayCheckpoint>;
  if (typeof data.atMs !== 'number' || typeof data.label !== 'string' || typeof data.frontline !== 'number' || typeof data.airControl !== 'number') {
    return null;
  }
  return {
    atMs: data.atMs,
    label: data.label,
    frontline: data.frontline,
    airControl: data.airControl,
  };
}

function normalizeReplayEvent(input: unknown): FantasyLaneReplayEvent | null {
  if (!input || typeof input !== 'object') return null;
  const data = input as Partial<FantasyLaneReplayEvent>;
  if (typeof data.atMs !== 'number' || typeof data.type !== 'string' || typeof data.detail !== 'string') return null;
  return {
    atMs: data.atMs,
    type: data.type,
    detail: data.detail,
  };
}

function normalizeReplaySnapshot(input: FantasyLaneReplaySnapshot | null | undefined): FantasyLaneReplaySnapshot | undefined {
  if (!input || typeof input !== 'object' || typeof input.version !== 'string' || typeof input.seed !== 'number') return undefined;
  const checkpoints = Array.isArray(input.checkpoints)
    ? input.checkpoints
        .map(normalizeReplayCheckpoint)
        .filter((checkpoint): checkpoint is FantasyLaneReplayCheckpoint => Boolean(checkpoint))
    : [];
  const events = Array.isArray(input.events)
    ? input.events
        .map(normalizeReplayEvent)
        .filter((event): event is FantasyLaneReplayEvent => Boolean(event))
    : [];
  return {
    version: input.version,
    seed: input.seed,
    checkpoints,
    events,
  };
}

function normalizeDebugSnapshot(input: FantasyLaneDebugSnapshot | null | undefined): FantasyLaneDebugSnapshot | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const frontlineRange =
    input.frontlineRange && typeof input.frontlineRange.min === 'number' && typeof input.frontlineRange.max === 'number'
      ? { min: input.frontlineRange.min, max: input.frontlineRange.max }
      : { min: 0, max: 0 };
  return {
    warnings: normalizeStringList(input.warnings),
    congestionPeak: typeof input.congestionPeak === 'number' ? Math.max(0, input.congestionPeak) : 0,
    frontlineRange,
    bossPhaseIds: normalizeStringList(input.bossPhaseIds),
  };
}

function isValidLevelId(levelId: string, validIds: Set<string>) {
  return validIds.has(levelId);
}

function normalizeRunSetup(input: FantasyLaneRunSetup | null | undefined, validIds: Set<string>): FantasyLaneRunSetup | undefined {
  if (!input || typeof input !== 'object' || !isValidLevelId(input.levelId, validIds)) return undefined;
  return {
    levelId: input.levelId,
    runId: typeof input.runId === 'string' && input.runId.length > 0 ? input.runId : `${input.levelId}-run`,
    heroId: typeof input.heroId === 'string' ? input.heroId : undefined,
    tacticalSkillId: typeof input.tacticalSkillId === 'string' ? input.tacticalSkillId : undefined,
    loadoutUnitIds: normalizeStringList(input.loadoutUnitIds),
    runtimeSeed: typeof input.runtimeSeed === 'number' ? input.runtimeSeed : undefined,
    startedAt: typeof input.startedAt === 'number' ? input.startedAt : Date.now(),
  };
}

function normalizeRunRecord(input: FantasyLaneRunRecord | null | undefined, validIds: Set<string>): FantasyLaneRunRecord | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const setup = normalizeRunSetup(input, validIds);
  if (!setup || typeof input.finishedAt !== 'number' || typeof input.currentPhaseId !== 'string' || typeof input.resultTitle !== 'string') return undefined;
  return {
    ...setup,
    finishedAt: input.finishedAt,
    currentPhaseId: input.currentPhaseId,
    completed: Boolean(input.completed),
    resultTitle: input.resultTitle,
    stars: clampStars(input.stars),
    score: typeof input.score === 'number' ? Math.max(0, input.score) : 0,
    baseHpPercent: typeof input.baseHpPercent === 'number' ? Math.max(0, input.baseHpPercent) : 0,
    runtimeStats: normalizeRuntimeStats(input.runtimeStats),
    replay: normalizeReplaySnapshot(input.replay),
    debug: normalizeDebugSnapshot(input.debug),
  };
}

function normalizeLevelRecord(input: Partial<FantasyLaneLevelRecord> | undefined, levelId: string, validIds: Set<string>): FantasyLaneLevelRecord {
  const base = createLevelRecord(levelId);
  if (!input || typeof input !== 'object') return base;
  const recentRuns = Array.isArray(input.recentRuns)
    ? input.recentRuns.map((run) => normalizeRunRecord(run, validIds)).filter((run): run is FantasyLaneRunRecord => Boolean(run)).slice(0, RECENT_RUN_LIMIT)
    : [];
  const latestRun = normalizeRunRecord(input.latestRun, validIds);
  const latestReplay = normalizeReplaySnapshot(input.latestReplay) ?? latestRun?.replay;
  const latestDebug = normalizeDebugSnapshot(input.latestDebug) ?? latestRun?.debug;
  const phaseSnapshots = buildPhaseSnapshots(levelId, latestRun?.currentPhaseId, latestRun?.replay ?? latestReplay, latestRun?.completed ?? Boolean(input.completed));
  const latestBossBattle = buildBossBattleSummary(
    levelId,
    latestRun?.debug ?? latestDebug,
    latestRun?.currentPhaseId,
    latestRun?.completed ?? Boolean(input.completed),
  );

  return {
    ...base,
    attempts: typeof input.attempts === 'number' ? Math.max(0, input.attempts) : base.attempts,
    completed: Boolean(input.completed),
    bestStars: clampStars(input.bestStars ?? 0),
    bestScore: typeof input.bestScore === 'number' ? Math.max(0, input.bestScore) : 0,
    bestBaseHpPercent: typeof input.bestBaseHpPercent === 'number' ? Math.max(0, input.bestBaseHpPercent) : 0,
    completedAt: typeof input.completedAt === 'number' ? input.completedAt : undefined,
    lastPlayedAt: typeof input.lastPlayedAt === 'number' ? input.lastPlayedAt : undefined,
    lastStart: normalizeRunSetup(input.lastStart, validIds),
    latestRun,
    recentRuns,
    latestReplay,
    latestDebug,
    lastRuntimeStats: normalizeRuntimeStats(input.lastRuntimeStats),
    phaseSnapshots,
    latestBossBattle,
  };
}

function normalizeBattleTotals(
  input: Partial<FantasyLaneBattleTotals> | undefined,
  levelRecords: Record<string, FantasyLaneLevelRecord>,
): FantasyLaneBattleTotals {
  const fallback = buildBattleTotalsFromRecords(levelRecords);
  if (!input || typeof input !== 'object') return fallback;
  return {
    totalRuns: typeof input.totalRuns === 'number' ? Math.max(0, Math.round(input.totalRuns)) : fallback.totalRuns,
    wins: typeof input.wins === 'number' ? Math.max(0, Math.round(input.wins)) : fallback.wins,
    losses: typeof input.losses === 'number' ? Math.max(0, Math.round(input.losses)) : fallback.losses,
    bossRuns: typeof input.bossRuns === 'number' ? Math.max(0, Math.round(input.bossRuns)) : fallback.bossRuns,
    bossClears: typeof input.bossClears === 'number' ? Math.max(0, Math.round(input.bossClears)) : fallback.bossClears,
    phaseEntries: normalizeCounterMap(input.phaseEntries, fallback.phaseEntries),
    bossPhaseTriggers: normalizeCounterMap(input.bossPhaseTriggers, fallback.bossPhaseTriggers),
  };
}

function mergeRuntimeTotals(
  totals: FantasyLaneRuntimeStatsSnapshot,
  nextStats: FantasyLaneRuntimeStatsSnapshot,
  telemetryRunCount: number,
) {
  const nextRunCount = telemetryRunCount + 1;
  const engagedUnits = totals.engagedUnits + nextStats.engagedUnits;
  const totalEngageDelayMs = totals.totalEngageDelayMs + nextStats.totalEngageDelayMs;
  return {
    totals: {
      summoned: totals.summoned + nextStats.summoned,
      defeated: totals.defeated + nextStats.defeated,
      queueBlocked: totals.queueBlocked + nextStats.queueBlocked,
      projectilesFired: totals.projectilesFired + nextStats.projectilesFired,
      aoeHits: totals.aoeHits + nextStats.aoeHits,
      frontlineSummons: totals.frontlineSummons + nextStats.frontlineSummons,
      antiAirSummons: totals.antiAirSummons + nextStats.antiAirSummons,
      aoeSummons: totals.aoeSummons + nextStats.aoeSummons,
      goldSpent: totals.goldSpent + nextStats.goldSpent,
      goldCappedMs: totals.goldCappedMs + nextStats.goldCappedMs,
      congestionMs: totals.congestionMs + nextStats.congestionMs,
      engagedUnits,
      totalEngageDelayMs,
      heroSkillCast: totals.heroSkillCast + nextStats.heroSkillCast,
      tacticalSkillCast: totals.tacticalSkillCast + nextStats.tacticalSkillCast,
      lastSkillCastAtMs:
        typeof nextStats.lastSkillCastAtMs === 'number'
          ? Math.max(totals.lastSkillCastAtMs ?? 0, nextStats.lastSkillCastAtMs)
          : totals.lastSkillCastAtMs,
      averageEngageTimeMs: getAverageEngageTimeMs(
        engagedUnits,
        totalEngageDelayMs,
        nextRunCount <= 0
          ? 0
          : Math.round(((totals.averageEngageTimeMs * telemetryRunCount) + nextStats.averageEngageTimeMs) / nextRunCount),
      ),
    },
    telemetryRunCount: nextRunCount,
  };
}

function normalize(data: Partial<FantasyLaneProgressData> | null | undefined): FantasyLaneProgressData {
  const base = createInitialProgress();
  const validIds = new Set(FANTASY_LANE_LEVELS.map((level) => level.id));
  const completedLevels = Array.isArray(data?.completedLevels) ? data.completedLevels.filter((levelId) => validIds.has(levelId)) : [];
  const cleanedRecords = Object.fromEntries(
    Object.entries(data?.levelRecords ?? {})
      .filter(([levelId]) => validIds.has(levelId))
      .map(([levelId, record]) => [levelId, normalizeLevelRecord(record, levelId, validIds)]),
  ) as Record<string, FantasyLaneLevelRecord>;

  const totalStars = Object.values(cleanedRecords).reduce((sum, record) => sum + clampStars(record.bestStars), 0);
  const bestScore = Object.values(cleanedRecords).reduce((max, record) => Math.max(max, record.bestScore || 0), 0);
  const highestUnlockedLevelId =
    data?.highestUnlockedLevelId && validIds.has(data.highestUnlockedLevelId)
      ? data.highestUnlockedLevelId
      : completedLevels.length > 0
        ? getNextLevelId(completedLevels[completedLevels.length - 1]) ?? completedLevels[completedLevels.length - 1]
        : base.highestUnlockedLevelId;
  const highestChapterId = getFantasyLaneLevelById(highestUnlockedLevelId).chapterId;
  const lastPlayedLevelId = data?.lastPlayedLevelId && validIds.has(data.lastPlayedLevelId) ? data.lastPlayedLevelId : highestUnlockedLevelId;
  const telemetryRunCount = typeof data?.telemetryRunCount === 'number' ? Math.max(0, data.telemetryRunCount) : 0;
  const chapterRecords = buildChapterRecords(cleanedRecords, lastPlayedLevelId);
  const battleTotals = normalizeBattleTotals(data?.battleTotals, cleanedRecords);
  const defaultPresets = createDefaultLoadoutPresets();
  const loadoutPresets = Object.fromEntries(
    getPresetSlotIds().map((slotId) => [String(slotId), normalizePreset(data?.loadoutPresets?.[String(slotId)], slotId)]),
  ) as Record<string, FantasyLaneLoadoutPreset>;

  return {
    ...base,
    ...data,
    completedLevels,
    levelRecords: cleanedRecords,
    totalCompleted: completedLevels.length,
    totalStars,
    bestScore,
    highestUnlockedLevelId,
    highestChapterId,
    lastPlayedLevelId,
    updatedAt: typeof data?.updatedAt === 'number' ? data.updatedAt : Date.now(),
    activeRun: normalizeRunSetup(data?.activeRun, validIds),
    runtimeTotals: normalizeRuntimeStats(data?.runtimeTotals),
    telemetryRunCount,
    chapterRecords,
    battleTotals,
    unlockedUnits: Array.isArray(data?.unlockedUnits) ? data.unlockedUnits : [],
    unitFragments: data?.unitFragments && typeof data.unitFragments === 'object' ? { ...data.unitFragments } : {},
    unitStars: data?.unitStars && typeof data.unitStars === 'object' ? { ...data.unitStars } : {},
    loadoutPresets: { ...defaultPresets, ...loadoutPresets },
  };
}

export function loadFantasyLaneProgress(): FantasyLaneProgressData {
  if (!canUseStorage()) return createInitialProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return normalize(JSON.parse(raw) as FantasyLaneProgressData);
  } catch {
    return createInitialProgress();
  }
}

export function saveFantasyLaneProgress(progress: FantasyLaneProgressData) {
  if (!canUseStorage()) return;
  const normalized = normalize(progress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...normalized, updatedAt: Date.now() }));
}

export function resetFantasyLaneProgress() {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function recordFantasyLaneLevelStart(levelId: string, setup?: Omit<FantasyLaneRunSetup, 'levelId'>) {
  const progress = loadFantasyLaneProgress();
  const currentRecord = progress.levelRecords[levelId] ?? createLevelRecord(levelId);
  const startedAt = typeof setup?.startedAt === 'number' ? setup.startedAt : Date.now();
  const activeRun: FantasyLaneRunSetup = {
    levelId,
    runId: typeof setup?.runId === 'string' && setup.runId.length > 0 ? setup.runId : `${levelId}-${startedAt}`,
    heroId: setup?.heroId,
    tacticalSkillId: setup?.tacticalSkillId,
    loadoutUnitIds: normalizeStringList(setup?.loadoutUnitIds),
    runtimeSeed: typeof setup?.runtimeSeed === 'number' ? setup.runtimeSeed : undefined,
    startedAt,
  };

  progress.levelRecords[levelId] = {
    ...currentRecord,
    attempts: currentRecord.attempts + 1,
    lastPlayedAt: startedAt,
    lastStart: activeRun,
    recentRuns: currentRecord.recentRuns ?? [],
  };
  progress.activeRun = activeRun;
  progress.lastPlayedLevelId = levelId;
  progress.chapterRecords = buildChapterRecords(progress.levelRecords, progress.lastPlayedLevelId);
  saveFantasyLaneProgress(progress);
  return progress;
}

export function recordFantasyLaneLevelResult(
  levelId: string,
  result: FantasyLaneBattleResult,
  playerBaseHpPercent: number,
  payload?: FantasyLaneLevelResultPayload,
) {
  const progress = loadFantasyLaneProgress();
  const currentRecord = progress.levelRecords[levelId] ?? createLevelRecord(levelId);
  const completed = result.title.includes('鎴愬姛');
  const finishedAt = typeof payload?.finishedAt === 'number' ? payload.finishedAt : Date.now();
  const runtimeStats = payload?.runtimeStats ? normalizeRuntimeStats(payload.runtimeStats) : undefined;
  const replay = normalizeReplaySnapshot(payload?.replay);
  const debug = normalizeDebugSnapshot(payload?.debug);
  const activeRun =
    progress.activeRun && progress.activeRun.levelId === levelId
      ? progress.activeRun
      : ({
          levelId,
          runId: `${levelId}-${finishedAt}`,
          loadoutUnitIds: [],
          startedAt: currentRecord.lastPlayedAt ?? finishedAt,
        } satisfies FantasyLaneRunSetup);
  const latestRun: FantasyLaneRunRecord = {
    ...activeRun,
    finishedAt,
    currentPhaseId: payload?.currentPhaseId ?? `${levelId}-result`,
    completed,
    resultTitle: result.title,
    stars: result.stars,
    score: result.score,
    baseHpPercent: Math.round(playerBaseHpPercent),
    runtimeStats,
    replay,
    debug,
  };
  const phaseSnapshots = buildPhaseSnapshots(levelId, latestRun.currentPhaseId, replay, completed);
  const latestBossBattle = buildBossBattleSummary(levelId, debug, latestRun.currentPhaseId, completed);

  const record: FantasyLaneLevelRecord = {
    ...currentRecord,
    completed: currentRecord.completed || completed,
    bestStars: Math.max(currentRecord.bestStars, result.stars),
    bestScore: Math.max(currentRecord.bestScore, result.score),
    bestBaseHpPercent: Math.max(currentRecord.bestBaseHpPercent, Math.round(playerBaseHpPercent)),
    completedAt: completed ? currentRecord.completedAt ?? finishedAt : currentRecord.completedAt,
    lastPlayedAt: finishedAt,
    latestRun,
    recentRuns: [latestRun, ...(currentRecord.recentRuns ?? [])].slice(0, RECENT_RUN_LIMIT),
    latestReplay: replay ?? currentRecord.latestReplay,
    latestDebug: debug ?? currentRecord.latestDebug,
    lastRuntimeStats: runtimeStats ?? currentRecord.lastRuntimeStats,
    phaseSnapshots,
    latestBossBattle,
  };

  progress.levelRecords[levelId] = record;
  progress.lastPlayedLevelId = levelId;
  progress.activeRun = undefined;

  if (completed && !progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
    progress.completedLevels.sort((left, right) => {
      const leftParts = left.split('-').map(Number);
      const rightParts = right.split('-').map(Number);
      return leftParts[0] === rightParts[0] ? leftParts[1] - rightParts[1] : leftParts[0] - rightParts[0];
    });
  }

  progress.totalCompleted = progress.completedLevels.length;
  progress.totalStars = Object.values(progress.levelRecords).reduce((sum, item) => sum + item.bestStars, 0);
  progress.bestScore = Object.values(progress.levelRecords).reduce((max, item) => Math.max(max, item.bestScore), 0);

  if (runtimeStats) {
    const merged = mergeRuntimeTotals(progress.runtimeTotals, runtimeStats, progress.telemetryRunCount);
    progress.runtimeTotals = merged.totals;
    progress.telemetryRunCount = merged.telemetryRunCount;
  }

  progress.battleTotals = {
    totalRuns: progress.battleTotals.totalRuns + 1,
    wins: progress.battleTotals.wins + (completed ? 1 : 0),
    losses: progress.battleTotals.losses + (completed ? 0 : 1),
    bossRuns: progress.battleTotals.bossRuns + (latestBossBattle ? 1 : 0),
    bossClears: progress.battleTotals.bossClears + (latestBossBattle && completed ? 1 : 0),
    phaseEntries: { ...progress.battleTotals.phaseEntries },
    bossPhaseTriggers: { ...progress.battleTotals.bossPhaseTriggers },
  };
  phaseSnapshots.forEach((phase) => {
    if (phase.reached) incrementCounter(progress.battleTotals.phaseEntries, phase.phaseId);
  });
  latestBossBattle?.triggeredPhaseIds.forEach((phaseId) => incrementCounter(progress.battleTotals.bossPhaseTriggers, phaseId));

  const nextLevelId = completed ? getNextLevelId(levelId) : null;
  progress.highestUnlockedLevelId = nextLevelId ?? progress.highestUnlockedLevelId;
  progress.highestChapterId = getFantasyLaneLevelById(progress.highestUnlockedLevelId).chapterId;
  progress.chapterRecords = buildChapterRecords(progress.levelRecords, progress.lastPlayedLevelId);

  saveFantasyLaneProgress(progress);
  return progress;
}

export function isFantasyLaneLevelUnlocked(progress: FantasyLaneProgressData, levelId: string) {
  if (levelId === '1-1') return true;
  const level = getFantasyLaneLevelById(levelId);
  if (level.indexInChapter === 1) {
    const previousChapterOrder = Number.parseInt(level.chapterId.replace('chapter-', ''), 10) - 1;
    if (previousChapterOrder <= 0) return true;
    const previousChapterBossId = `${previousChapterOrder}-6`;
    return progress.completedLevels.includes(previousChapterBossId);
  }
  const previousLevelId = `${level.id.split('-')[0]}-${level.indexInChapter - 1}`;
  return progress.completedLevels.includes(previousLevelId);
}

export function getFantasyLaneLevelStatus(progress: FantasyLaneProgressData, levelId: string): 'completed' | 'unlocked' | 'locked' {
  if (progress.completedLevels.includes(levelId)) return 'completed';
  if (isFantasyLaneLevelUnlocked(progress, levelId)) return 'unlocked';
  return 'locked';
}

export function getFantasyLaneChapterProgress(progress: FantasyLaneProgressData, chapterId: string) {
  const levels = getFantasyLaneLevelsByChapter(chapterId);
  const completed = levels.filter((level) => progress.completedLevels.includes(level.id)).length;
  const stars = levels.reduce((sum, level) => sum + (progress.levelRecords[level.id]?.bestStars ?? 0), 0);
  return {
    total: levels.length,
    completed,
    stars,
    maxStars: levels.length * 3,
  };
}

export function getFantasyLaneProgressSummary(progress: FantasyLaneProgressData = loadFantasyLaneProgress()): FantasyLaneProgressSummary {
  const totalLevels = FANTASY_LANE_LEVELS.length;
  const maxStars = totalLevels * 3;
  const highestChapter = FANTASY_LANE_CHAPTERS.find((chapter) => chapter.id === progress.highestChapterId) ?? FANTASY_LANE_CHAPTERS[0];
  const lastPlayedLevel = getFantasyLaneLevelById(progress.lastPlayedLevelId);

  return {
    totalLevels,
    completedLevels: progress.totalCompleted,
    totalStars: progress.totalStars,
    maxStars,
    bestScore: progress.bestScore,
    hasStarted: Object.keys(progress.levelRecords).length > 0,
    highestUnlockedLevelId: progress.highestUnlockedLevelId,
    highestChapterId: progress.highestChapterId,
    currentChapterLabel: highestChapter.name,
    completionPercent: Math.round((progress.totalCompleted / totalLevels) * 100),
    starPercent: Math.round((progress.totalStars / maxStars) * 100),
    lastPlayedLevelId: progress.lastPlayedLevelId,
    lastPlayedLevelName: `${lastPlayedLevel.id} ${lastPlayedLevel.name}`,
  };
}

export function listFantasyLaneLoadoutPresets(progress: FantasyLaneProgressData = loadFantasyLaneProgress()) {
  return getPresetSlotIds().map((slotId) => normalizePreset(progress.loadoutPresets[String(slotId)], slotId));
}

export function saveFantasyLaneLoadoutPreset(
  slotId: number,
  payload: Pick<FantasyLaneLoadoutPreset, 'unitIds'> & Partial<Pick<FantasyLaneLoadoutPreset, 'name' | 'heroId' | 'tacticalSkillId'>>,
) {
  const clampedSlotId = Math.max(1, Math.min(FANTASY_LANE_PRESET_SLOT_COUNT, Math.floor(slotId)));
  const progress = loadFantasyLaneProgress();
  const currentPreset = normalizePreset(progress.loadoutPresets[String(clampedSlotId)], clampedSlotId);
  const nextPreset = normalizePreset(
    {
      ...currentPreset,
      ...payload,
      slotId: clampedSlotId,
      updatedAt: Date.now(),
    },
    clampedSlotId,
  );

  progress.loadoutPresets = {
    ...progress.loadoutPresets,
    [String(clampedSlotId)]: nextPreset,
  };
  saveFantasyLaneProgress(progress);
  return progress;
}

export function getFantasyLaneCollectionSummary(progress: FantasyLaneProgressData = loadFantasyLaneProgress()): FantasyLaneCollectionSummary {
  const unlocked = FANTASY_LANE_UNITS.filter((unit) => isUnitUnlocked(progress, unit.id)).length;
  const total = FANTASY_LANE_UNITS.length;
  const groundUnits = FANTASY_LANE_UNITS.filter((unit) => unit.layer === 'ground');
  const airUnits = FANTASY_LANE_UNITS.filter((unit) => unit.layer === 'air');
  const groundUnlocked = groundUnits.filter((unit) => isUnitUnlocked(progress, unit.id)).length;
  const airUnlocked = airUnits.filter((unit) => isUnitUnlocked(progress, unit.id)).length;
  const chapterRecords = Object.values(progress.chapterRecords);
  const chapterCleared = chapterRecords.filter((record) => record.completedLevels >= record.totalLevels).length;

  return {
    unlocked,
    total,
    percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    groundUnlocked,
    groundTotal: groundUnits.length,
    airUnlocked,
    airTotal: airUnits.length,
    chapterCleared,
    chapterTotal: chapterRecords.length,
  };
}

export function getFantasyLaneUnitBattleBonus(starLevel: number) {
  const safeStarLevel = Math.max(0, Math.min(3, Math.floor(starLevel)));
  return {
    damageMultiplier: 1 + safeStarLevel * 0.05,
    healthMultiplier: 1 + safeStarLevel * 0.08,
  };
}

// 瑙ｉ攣鍗曚綅
export function unlockUnit(progress: FantasyLaneProgressData, unitId: string): FantasyLaneProgressData {
  if (progress.unlockedUnits.includes(unitId)) return progress;
  return {
    ...progress,
    unlockedUnits: [...progress.unlockedUnits, unitId],
  };
}

// 娣诲姞鍗曚綅纰庣墖
export function addUnitFragment(progress: FantasyLaneProgressData, unitId: string, count: number): FantasyLaneProgressData {
  const currentCount = progress.unitFragments[unitId] || 0;
  return {
    ...progress,
    unitFragments: {
      ...progress.unitFragments,
      [unitId]: currentCount + count,
    },
  };
}

// 鍗囩骇鍗曚綅鏄熺骇
export function upgradeUnitStar(progress: FantasyLaneProgressData, unitId: string): FantasyLaneProgressData {
  const currentStar = progress.unitStars[unitId] || 0;
  if (currentStar >= 3) return progress;
  return {
    ...progress,
    unitStars: {
      ...progress.unitStars,
      [unitId]: currentStar + 1,
    },
  };
}

export function canUpgradeFantasyLaneUnit(progress: FantasyLaneProgressData, unitId: string) {
  if (!isUnitUnlocked(progress, unitId)) return false;
  const currentStar = progress.unitStars[unitId] || 0;
  if (currentStar >= 3) return false;
  return getUnitFragmentCount(progress, unitId) >= getFantasyLaneUnitUpgradeCost(currentStar);
}

export function upgradeFantasyLaneUnitWithFragments(unitId: string, progress: FantasyLaneProgressData = loadFantasyLaneProgress()) {
  if (!canUpgradeFantasyLaneUnit(progress, unitId)) return progress;

  const currentStar = progress.unitStars[unitId] || 0;
  const cost = getFantasyLaneUnitUpgradeCost(currentStar);
  const nextProgress: FantasyLaneProgressData = {
    ...progress,
    unitFragments: {
      ...progress.unitFragments,
      [unitId]: Math.max(0, getUnitFragmentCount(progress, unitId) - cost),
    },
    unitStars: {
      ...progress.unitStars,
      [unitId]: currentStar + 1,
    },
  };

  saveFantasyLaneProgress(nextProgress);
  return nextProgress;
}

// 妫€鏌ュ崟浣嶆槸鍚﹀凡瑙ｉ攣
function isUnitUnlockedByCondition(
  progress: FantasyLaneProgressData,
  unit: typeof FANTASY_LANE_UNIT_MAP[string],
): boolean {
  const unlockCondition = unit.unlockCondition;
  if (!unlockCondition) return true;

  switch (unlockCondition.type) {
    case 'level_clear':
    case 'boss_clear':
      return unlockCondition.levelId ? progress.completedLevels.includes(unlockCondition.levelId) : false;
    case 'star_reward':
      if (!unlockCondition.levelId || typeof unlockCondition.stars !== 'number') return false;
      return (progress.levelRecords[unlockCondition.levelId]?.bestStars ?? 0) >= unlockCondition.stars;
    case 'fragment_synthesis':
      return getUnitFragmentCount(progress, unit.id) >= (unlockCondition.fragmentCount ?? Number.POSITIVE_INFINITY);
    default:
      return false;
  }
}

function buildDerivedUnitUnlockCondition(unitId: string) {
  for (const level of FANTASY_LANE_LEVELS) {
    if (level.unlockRewards?.includes(unitId)) {
      return {
        type: 'level_clear' as const,
        levelId: level.id,
      };
    }

    if (level.starRewards) {
      for (const [starsText, rewardedUnits] of Object.entries(level.starRewards)) {
        if (!rewardedUnits.includes(unitId)) continue;
        return {
          type: 'star_reward' as const,
          levelId: level.id,
          stars: Number(starsText),
        };
      }
    }
  }

  return null;
}

export function isUnitUnlocked(progress: FantasyLaneProgressData, unitId: string): boolean {
  if (progress.unlockedUnits.includes(unitId)) return true;

  const unit = FANTASY_LANE_UNIT_MAP[unitId];
  if (!unit) return false;

  if (unit.unlockCondition) {
    return isUnitUnlockedByCondition(progress, unit);
  }

  const derivedUnlockCondition = buildDerivedUnitUnlockCondition(unitId);
  if (derivedUnlockCondition) {
    return isUnitUnlockedByCondition(progress, {
      ...unit,
      unlockCondition: derivedUnlockCondition,
    });
  }

  return true;
}

export function getUnitFragmentCount(progress: FantasyLaneProgressData, unitId: string): number {
  return progress.unitFragments[unitId] || 0;
}
