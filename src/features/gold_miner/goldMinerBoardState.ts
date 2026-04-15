import {
  GOLD_MINER_BOARD_HEIGHT,
  GOLD_MINER_BOARD_WIDTH,
  GOLD_MINER_HOOK_ORIGIN_X,
  GOLD_MINER_HOOK_ORIGIN_Y,
  GOLD_MINER_MAX_ANGLE,
  GOLD_MINER_MAX_DISTANCE,
  GOLD_MINER_MIN_ANGLE,
  type GoldMinerBoardState,
  type GoldMinerEffectId,
  type GoldMinerItem,
  type GoldMinerItemKind,
  type GoldMinerLevelDefinition,
  type GoldMinerSnapshot,
  type GoldMinerVector,
} from './goldMinerTypes.ts';
import { getGoldMinerLevel } from './goldMinerLevelCatalog.ts';
import { getGoldMinerItemDefinition, rollGoldMinerItemValue } from './goldMinerItemRegistry.ts';
import { getGoldMinerShopItem } from './goldMinerShopRegistry.ts';

const BASE_SWING_SPEED = 68;
const BASE_EXTEND_SPEED = 520;
const BASE_RETRACT_SPEED = 470;
const DYNAMITE_RETRACT_SPEED = 840;
const TIME_BONUS_MS = 10_000;

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function createSeed(levelId: number, totalBank: number): number {
  return ((levelId * 2654435761) ^ Math.round(totalBank * 17) ^ Date.now()) >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toRadians(angleDeg: number): number {
  return angleDeg * Math.PI / 180;
}

function getHookDirection(angleDeg: number): GoldMinerVector {
  const radians = toRadians(angleDeg);
  return { x: Math.sin(radians), y: Math.cos(radians) };
}

export function getHookTipPosition(state: Pick<GoldMinerBoardState, 'hookOrigin' | 'hook'>): GoldMinerVector {
  const direction = getHookDirection(state.hook.angleDeg);
  return {
    x: state.hookOrigin.x + direction.x * state.hook.extendDistance,
    y: state.hookOrigin.y + direction.y * state.hook.extendDistance,
  };
}

function isRock(kind: GoldMinerItemKind): boolean {
  return kind === 'rock_small' || kind === 'rock_large';
}

function createItemId(kind: GoldMinerItemKind, index: number): string {
  return `${kind}-${index}`;
}

function createItem(kind: GoldMinerItemKind, index: number, random: () => number): GoldMinerItem {
  const definition = getGoldMinerItemDefinition(kind);
  const radius = definition.radius;
  const x = 90 + radius + random() * (GOLD_MINER_BOARD_WIDTH - 180 - radius * 2);
  const y = 170 + radius + random() * (GOLD_MINER_BOARD_HEIGHT - 220 - radius * 2);
  const item: GoldMinerItem = {
    id: createItemId(kind, index),
    kind,
    x,
    y,
    radius,
    value: rollGoldMinerItemValue(kind, random),
    weight: definition.weight,
    isCollected: false,
  };

  if (kind === 'mole') {
    item.velocityX = (random() > 0.5 ? 1 : -1) * (45 + random() * 45);
  }

  if (kind === 'bat') {
    item.velocityX = (random() > 0.5 ? 1 : -1) * (55 + random() * 35);
    item.baseY = y;
    item.waveAmplitude = 18 + random() * 16;
    item.waveFrequency = 0.003 + random() * 0.002;
    item.phaseOffset = random() * Math.PI * 2;
  }

  return item;
}

function overlaps(a: GoldMinerItem, b: GoldMinerItem): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const minDistance = a.radius + b.radius + 14;
  return dx * dx + dy * dy < minDistance * minDistance;
}

function generateItems(level: GoldMinerLevelDefinition, random: () => number): GoldMinerItem[] {
  const items: GoldMinerItem[] = [];
  let index = 0;
  for (const [kind, count] of Object.entries(level.itemBudget) as Array<[GoldMinerItemKind, number]>) {
    for (let i = 0; i < count; i += 1) {
      let candidate = createItem(kind, index, random);
      let guard = 0;
      while (items.some((existing) => overlaps(existing, candidate)) && guard < 100) {
        candidate = createItem(kind, index, random);
        guard += 1;
      }
      items.push(candidate);
      index += 1;
    }
  }
  return items;
}

function getModeLabel(mode: GoldMinerBoardState['mode']): string {
  return mode === 'endless' ? '无尽矿坑' : '黄金矿工';
}

function buildHookState(activeEffects: GoldMinerEffectId[]) {
  const hasStrength = activeEffects.includes('strength_potion');
  const hasBoost = activeEffects.includes('hook_boost');
  return {
    angleDeg: 0,
    angularVelocityDeg: BASE_SWING_SPEED * (hasBoost ? 1.18 : 1),
    extendDistance: 0,
    extendSpeed: BASE_EXTEND_SPEED * (hasBoost ? 1.18 : 1),
    retractSpeed: BASE_RETRACT_SPEED * (hasStrength ? 1.35 : 1) * (hasBoost ? 1.14 : 1),
    grabbedItemId: null,
  };
}

export interface CreateGoldMinerBoardStateInput {
  level: GoldMinerLevelDefinition;
  totalBank?: number;
  dynamiteCount?: number;
  activeEffects?: GoldMinerEffectId[];
  rngSeed?: number;
}

export function createGoldMinerBoardState(input: CreateGoldMinerBoardStateInput): GoldMinerBoardState {
  const seed = input.rngSeed ?? createSeed(input.level.id, input.totalBank ?? 0);
  const random = seededRandom(seed);
  const activeEffects = [...(input.activeEffects ?? [])];
  return {
    mode: input.level.mode,
    status: 'swinging',
    levelId: input.level.id,
    levelTitle: input.level.title,
    elapsedMs: 0,
    timeRemainingMs: input.level.timeLimitSec * 1000 + (activeEffects.includes('time_bonus') ? TIME_BONUS_MS : 0),
    score: 0,
    totalBank: input.totalBank ?? 0,
    targetScore: input.level.targetScore,
    dynamiteCount: input.dynamiteCount ?? 3,
    activeEffects,
    insuranceUsed: false,
    hookOrigin: { x: GOLD_MINER_HOOK_ORIGIN_X, y: GOLD_MINER_HOOK_ORIGIN_Y },
    hook: buildHookState(activeEffects),
    items: generateItems(input.level, random),
    bankedItemIds: [],
    destroyedItemIds: [],
    lastCaughtItemId: null,
    pendingRoundEnd: false,
    resultTitle: '',
    resultMessage: '',
    modeLabel: getModeLabel(input.level.mode),
    rngSeed: seed,
  };
}

function getRetractSpeedMultiplier(item: GoldMinerItem | null): number {
  if (!item) return 1.24;
  const definition = getGoldMinerItemDefinition(item.kind);
  return definition.retractSpeedMultiplier;
}

function markResult(state: GoldMinerBoardState): GoldMinerBoardState {
  const passed = state.score >= state.targetScore;
  if (passed) {
    return {
      ...state,
      status: 'shop',
      resultTitle: '关卡达标',
      resultMessage: `本关收入 $${state.score.toLocaleString()}，前往商店整备下一关。`,
    };
  }
  return {
    ...state,
    status: 'game_over',
    resultTitle: '未达标',
    resultMessage: `目标 $${state.targetScore.toLocaleString()}，当前仅完成 $${state.score.toLocaleString()}。`,
  };
}

function updateMovingItems(state: GoldMinerBoardState, deltaMs: number): GoldMinerItem[] {
  const elapsed = state.elapsedMs + deltaMs;
  return state.items.map((item) => {
    if (item.isCollected || item.id === state.hook.grabbedItemId) return item;

    if (item.kind === 'mole' && item.velocityX) {
      let nextX = item.x + item.velocityX * (deltaMs / 1000);
      let nextVelocityX = item.velocityX;
      const minX = 96;
      const maxX = GOLD_MINER_BOARD_WIDTH - 96;
      if (nextX < minX || nextX > maxX) {
        nextVelocityX *= -1;
        nextX = clamp(nextX, minX, maxX);
      }
      return { ...item, x: nextX, velocityX: nextVelocityX };
    }

    if (item.kind === 'bat' && item.velocityX) {
      let nextX = item.x + item.velocityX * (deltaMs / 1000);
      let nextVelocityX = item.velocityX;
      const minX = 96;
      const maxX = GOLD_MINER_BOARD_WIDTH - 96;
      if (nextX < minX || nextX > maxX) {
        nextVelocityX *= -1;
        nextX = clamp(nextX, minX, maxX);
      }
      const nextY = (item.baseY ?? item.y) + (item.waveAmplitude ?? 16) * Math.sin(elapsed * (item.waveFrequency ?? 0.004) + (item.phaseOffset ?? 0));
      return { ...item, x: nextX, y: nextY, velocityX: nextVelocityX };
    }

    if ((state.levelId >= 9 && state.mode === 'adventure') || (state.mode === 'endless' && state.levelId >= 6)) {
      return { ...item, y: clamp(item.y + deltaMs * 0.0035, 150, GOLD_MINER_BOARD_HEIGHT - 68) };
    }

    return item;
  });
}

function findClosestCollidingItem(state: GoldMinerBoardState): GoldMinerItem | null {
  const hookTip = getHookTipPosition(state);
  let candidate: GoldMinerItem | null = null;
  let bestDistanceSq = Number.POSITIVE_INFINITY;

  for (const item of state.items) {
    if (item.isCollected) continue;
    const dx = hookTip.x - item.x;
    const dy = hookTip.y - item.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq <= item.radius * item.radius && distanceSq < bestDistanceSq) {
      candidate = item;
      bestDistanceSq = distanceSq;
    }
  }

  return candidate;
}

function updateGrabbedItemPosition(state: GoldMinerBoardState, items: GoldMinerItem[]): GoldMinerItem[] {
  if (!state.hook.grabbedItemId) return items;
  const hookTip = getHookTipPosition(state);
  return items.map((item) => (
    item.id === state.hook.grabbedItemId ? { ...item, x: hookTip.x, y: hookTip.y } : item
  ));
}

function resolveMysteryBag(state: GoldMinerBoardState, random: () => number): GoldMinerBoardState {
  const roll = random();
  if (roll < 0.35) {
    return { ...state, dynamiteCount: state.dynamiteCount + 3, resultMessage: `${state.resultMessage} 神秘袋送来 3 个炸药。` };
  }
  if (roll < 0.6) {
    return { ...state, activeEffects: state.activeEffects.includes('strength_potion') ? state.activeEffects : [...state.activeEffects, 'strength_potion'], resultMessage: `${state.resultMessage} 神秘袋送来力量药水。` };
  }
  if (roll < 0.82) {
    return { ...state, activeEffects: state.activeEffects.includes('lucky_clover') ? state.activeEffects : [...state.activeEffects, 'lucky_clover'], resultMessage: `${state.resultMessage} 神秘袋送来幸运草。` };
  }
  return { ...state, timeRemainingMs: state.timeRemainingMs + TIME_BONUS_MS, resultMessage: `${state.resultMessage} 神秘袋补充了 10 秒。` };
}

function bankGrabbedItem(state: GoldMinerBoardState): GoldMinerBoardState {
  if (!state.hook.grabbedItemId) return state;
  const item = state.items.find((entry) => entry.id === state.hook.grabbedItemId) ?? null;
  if (!item) {
    return { ...state, hook: { ...state.hook, extendDistance: 0, grabbedItemId: null } };
  }

  const bonusMultiplier = state.activeEffects.includes('lucky_clover') && !isRock(item.kind) ? 1.3 : 1;
  const value = Math.round(item.value * bonusMultiplier);
  let nextState: GoldMinerBoardState = {
    ...state,
    score: state.score + value,
    bankedItemIds: [...state.bankedItemIds, item.id],
    lastCaughtItemId: item.id,
    resultTitle: `抓到 ${getGoldMinerItemDefinition(item.kind).label}`,
    resultMessage: `本次带回 $${value.toLocaleString()}。`,
    hook: { ...state.hook, extendDistance: 0, grabbedItemId: null },
    items: state.items.map((entry) => (entry.id === item.id ? { ...entry, isCollected: true } : entry)),
  };

  if (item.kind === 'mystery_bag') {
    nextState = resolveMysteryBag(nextState, seededRandom((state.rngSeed ^ value) >>> 0));
  }

  return nextState;
}

function handleTimeBoundary(state: GoldMinerBoardState): GoldMinerBoardState {
  if (state.timeRemainingMs > 0) return state;
  if (state.hook.extendDistance > 0 || state.hook.grabbedItemId) return { ...state, pendingRoundEnd: true };
  return markResult(state);
}

export function launchGoldMinerHook(state: GoldMinerBoardState): GoldMinerBoardState {
  if (state.status !== 'swinging') return state;
  return { ...state, status: 'extending', resultTitle: '发射钩爪', resultMessage: `角度 ${Math.round(state.hook.angleDeg)}°，开始抓取。` };
}

export function pauseGoldMiner(state: GoldMinerBoardState): GoldMinerBoardState {
  if (state.status === 'paused') return { ...state, status: 'swinging' };
  if (state.status === 'swinging' || state.status === 'extending' || state.status === 'retracting') return { ...state, status: 'paused' };
  return state;
}

export function resumeGoldMiner(state: GoldMinerBoardState): GoldMinerBoardState {
  if (state.status !== 'paused') return state;
  return { ...state, status: state.hook.extendDistance > 0 ? (state.hook.grabbedItemId ? 'retracting' : 'extending') : 'swinging' };
}

export function useGoldMinerDynamite(state: GoldMinerBoardState): GoldMinerBoardState {
  if (state.status !== 'retracting' || !state.hook.grabbedItemId || state.dynamiteCount <= 0) return state;
  return {
    ...state,
    dynamiteCount: state.dynamiteCount - 1,
    destroyedItemIds: [...state.destroyedItemIds, state.hook.grabbedItemId],
    items: state.items.map((item) => (item.id === state.hook.grabbedItemId ? { ...item, isCollected: true } : item)),
    hook: { ...state.hook, grabbedItemId: null, retractSpeed: DYNAMITE_RETRACT_SPEED },
    resultTitle: '炸药已投掷',
    resultMessage: '当前目标被炸毁，钩爪正在快速回收。',
  };
}

function applyInsuranceIfNeeded(state: GoldMinerBoardState, item: GoldMinerItem): GoldMinerBoardState | null {
  if (!isRock(item.kind) || state.insuranceUsed || !state.activeEffects.includes('insurance')) return null;
  return {
    ...state,
    insuranceUsed: true,
    destroyedItemIds: [...state.destroyedItemIds, item.id],
    items: state.items.map((entry) => (entry.id === item.id ? { ...entry, isCollected: true } : entry)),
    hook: { ...state.hook, grabbedItemId: null, retractSpeed: DYNAMITE_RETRACT_SPEED },
    status: 'retracting',
    resultTitle: '保险生效',
    resultMessage: '低价值石头已自动脱钩。',
  };
}

export function tickGoldMinerBoardState(state: GoldMinerBoardState, deltaMs: number): GoldMinerBoardState {
  if (deltaMs <= 0 || state.status === 'paused' || state.status === 'shop' || state.status === 'game_over') return state;

  let nextState: GoldMinerBoardState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    timeRemainingMs: Math.max(0, state.timeRemainingMs - deltaMs),
    items: updateMovingItems(state, deltaMs),
  };

  if (nextState.status === 'swinging') {
    const fasterSwing = nextState.levelId >= 10 || nextState.mode === 'endless';
    const swingSpeed = nextState.hook.angularVelocityDeg * (fasterSwing ? 1.12 : 1);
    let nextAngle = nextState.hook.angleDeg + swingSpeed * (deltaMs / 1000);
    let velocity = nextState.hook.angularVelocityDeg;
    if (nextAngle <= GOLD_MINER_MIN_ANGLE || nextAngle >= GOLD_MINER_MAX_ANGLE) {
      velocity *= -1;
      nextAngle = clamp(nextAngle, GOLD_MINER_MIN_ANGLE, GOLD_MINER_MAX_ANGLE);
    }
    nextState = { ...nextState, hook: { ...nextState.hook, angleDeg: nextAngle, angularVelocityDeg: velocity } };
    return handleTimeBoundary(nextState);
  }

  if (nextState.status === 'extending') {
    const nextDistance = nextState.hook.extendDistance + nextState.hook.extendSpeed * (deltaMs / 1000);
    nextState = { ...nextState, hook: { ...nextState.hook, extendDistance: Math.min(GOLD_MINER_MAX_DISTANCE, nextDistance) } };

    const collidingItem = findClosestCollidingItem(nextState);
    if (collidingItem) {
      const insuranceState = applyInsuranceIfNeeded(nextState, collidingItem);
      if (insuranceState) return handleTimeBoundary(insuranceState);
      nextState = {
        ...nextState,
        status: 'retracting',
        hook: {
          ...nextState.hook,
          grabbedItemId: collidingItem.id,
          retractSpeed: BASE_RETRACT_SPEED * getRetractSpeedMultiplier(collidingItem) * (nextState.activeEffects.includes('strength_potion') ? 1.35 : 1) * (nextState.activeEffects.includes('hook_boost') ? 1.14 : 1),
        },
        resultTitle: `抓到 ${getGoldMinerItemDefinition(collidingItem.kind).label}`,
        resultMessage: `价值 $${collidingItem.value.toLocaleString()}，准备回收。`,
      };
      nextState = { ...nextState, items: updateGrabbedItemPosition(nextState, nextState.items) };
      return handleTimeBoundary(nextState);
    }

    if (nextState.hook.extendDistance >= GOLD_MINER_MAX_DISTANCE) {
      nextState = { ...nextState, status: 'retracting', hook: { ...nextState.hook, retractSpeed: BASE_RETRACT_SPEED * 1.24 }, resultTitle: '空钩回收', resultMessage: '这一钩没有抓到东西。' };
    }
    return handleTimeBoundary(nextState);
  }

  if (nextState.status === 'retracting') {
    const nextDistance = Math.max(0, nextState.hook.extendDistance - nextState.hook.retractSpeed * (deltaMs / 1000));
    nextState = { ...nextState, hook: { ...nextState.hook, extendDistance: nextDistance } };
    nextState = { ...nextState, items: updateGrabbedItemPosition(nextState, nextState.items) };

    if (nextDistance <= 0) {
      if (nextState.hook.grabbedItemId) {
        nextState = bankGrabbedItem(nextState);
      } else {
        nextState = { ...nextState, hook: { ...nextState.hook, extendDistance: 0, grabbedItemId: null, retractSpeed: buildHookState(nextState.activeEffects).retractSpeed } };
      }

      if (nextState.pendingRoundEnd || nextState.timeRemainingMs <= 0) {
        return markResult({ ...nextState, pendingRoundEnd: false });
      }

      return { ...nextState, status: 'swinging', hook: { ...nextState.hook, retractSpeed: buildHookState(nextState.activeEffects).retractSpeed } };
    }
  }

  return handleTimeBoundary(nextState);
}

export function restartGoldMinerLevel(state: GoldMinerBoardState, level: GoldMinerLevelDefinition = getGoldMinerLevel(state.levelId)): GoldMinerBoardState {
  return createGoldMinerBoardState({ level, totalBank: state.totalBank, dynamiteCount: state.dynamiteCount, activeEffects: state.activeEffects });
}

export function advanceGoldMinerToLevel(state: GoldMinerBoardState, level: GoldMinerLevelDefinition): GoldMinerBoardState {
  return createGoldMinerBoardState({ level, totalBank: state.totalBank + state.score, dynamiteCount: state.dynamiteCount, activeEffects: state.activeEffects });
}

export function applyGoldMinerShopPurchase(state: GoldMinerBoardState, purchaseId: string): GoldMinerBoardState {
  if (state.status !== 'shop') return state;
  const item = getGoldMinerShopItem(purchaseId as Parameters<typeof getGoldMinerShopItem>[0]);
  if (state.totalBank + state.score < item.price) {
    return { ...state, resultTitle: '资金不足', resultMessage: `${item.label} 需要 $${item.price.toLocaleString()}。` };
  }

  let nextEffects = [...state.activeEffects];
  let dynamiteCount = state.dynamiteCount;
  if (item.id === 'dynamite_bundle') {
    dynamiteCount += 3;
  } else if (!nextEffects.includes(item.id)) {
    nextEffects = [...nextEffects, item.id];
  }

  return {
    ...state,
    totalBank: state.totalBank - item.price,
    dynamiteCount,
    activeEffects: nextEffects,
    resultTitle: `已购买 ${item.label}`,
    resultMessage: item.description,
  };
}

export function createGoldMinerSnapshot(state: GoldMinerBoardState): GoldMinerSnapshot {
  return { levelId: state.levelId, mode: state.mode, state };
}

export function restoreGoldMinerSnapshot(snapshot: GoldMinerSnapshot): GoldMinerBoardState {
  return snapshot.state;
}

export function getGoldMinerItemById(state: GoldMinerBoardState, itemId: string | null): GoldMinerItem | null {
  if (!itemId) return null;
  return state.items.find((item) => item.id === itemId) ?? null;
}

export function shouldHighlightGoldMinerItem(state: GoldMinerBoardState, item: GoldMinerItem): boolean {
  if (state.activeEffects.includes('diamond_detector') && (item.kind === 'diamond' || item.kind === 'money_bag' || item.kind === 'mystery_bag')) return true;
  if (state.activeEffects.includes('rock_detector') && isRock(item.kind)) return true;
  return false;
}
