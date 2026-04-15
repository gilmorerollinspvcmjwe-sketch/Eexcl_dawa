import type { WorkbookStatusSummary } from '../../types/workbook.ts';
import type { GoldMinerBoardState, GoldMinerItem } from './goldMinerTypes.ts';
import { getGoldMinerItemDefinition } from './goldMinerItemRegistry.ts';

export interface GoldMinerHudViewModel {
  title: string;
  levelLabel: string;
  scoreLabel: string;
  targetLabel: string;
  timeLabel: string;
  bankLabel: string;
  dynamiteLabel: string;
  canUseDynamite: boolean;
}

export interface GoldMinerOverlayViewModel {
  kind: 'paused' | 'shop' | 'game_over' | null;
  title: string;
  description: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export interface GoldMinerResultSummary {
  passed: boolean;
  score: number;
  targetScore: number;
  caughtCount: number;
  bestCatchLabel?: string;
}

function formatTime(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export function getGoldMinerBestCaughtItem(items: GoldMinerItem[], bankedItemIds: string[]): GoldMinerItem | null {
  const banked = items.filter((item) => bankedItemIds.includes(item.id));
  if (banked.length === 0) return null;
  return banked.reduce((best, current) => (current.value > best.value ? current : best));
}

export function buildGoldMinerFormulaText(state: GoldMinerBoardState): string {
  if (state.status === 'shop') return `=关卡达标 | 当前资金 $${(state.totalBank + state.score).toLocaleString()} | 进入商店整备`;
  if (state.status === 'game_over') return `=#REF! 本关失败 | ${state.score.toLocaleString()} / ${state.targetScore.toLocaleString()} | R 重开`;
  if (state.status === 'paused') return '=黄金矿工已暂停 | P 继续 | ESC 返回';
  if (state.status === 'extending') return `=钩爪延伸中 | 深度 ${Math.round(state.hook.extendDistance)}px`;
  if (state.status === 'retracting') return state.hook.grabbedItemId ? `=已抓取目标 | 回收速度 ${Math.round(state.hook.retractSpeed)}` : '=空钩回收中';
  return `=摆臂扫描中 | 角度 ${Math.round(state.hook.angleDeg)}° | 目标 $${state.targetScore.toLocaleString()}`;
}

export function buildGoldMinerStatusSummary(state: GoldMinerBoardState): WorkbookStatusSummary {
  return {
    isPlaying: state.status === 'swinging' || state.status === 'extending' || state.status === 'retracting',
    primaryText: state.status === 'shop' ? '商店整备' : state.status === 'game_over' ? '本关失败' : state.status === 'paused' ? '已暂停' : '数据抓取中',
    score: state.score,
    secondaryMetric: `目标 $${state.targetScore.toLocaleString()}`,
    tertiaryMetric: `剩余 ${formatTime(state.timeRemainingMs)}`,
    mode: `${state.modeLabel} / L${state.levelId}`,
    alertTone: state.status === 'game_over' ? 'danger' : state.status === 'shop' ? 'success' : state.timeRemainingMs <= 12_000 ? 'warning' : 'neutral',
  };
}

export function buildGoldMinerHudViewModel(state: GoldMinerBoardState): GoldMinerHudViewModel {
  return {
    title: state.modeLabel,
    levelLabel: `L${state.levelId} ${state.levelTitle}`,
    scoreLabel: `$${state.score.toLocaleString()}`,
    targetLabel: `$${state.targetScore.toLocaleString()}`,
    timeLabel: formatTime(state.timeRemainingMs),
    bankLabel: `$${(state.totalBank + (state.status === 'shop' ? state.score : 0)).toLocaleString()}`,
    dynamiteLabel: `${state.dynamiteCount}`,
    canUseDynamite: state.status === 'retracting' && !!state.hook.grabbedItemId && state.dynamiteCount > 0,
  };
}

export function buildGoldMinerOverlayViewModel(state: GoldMinerBoardState): GoldMinerOverlayViewModel {
  if (state.status === 'paused') return { kind: 'paused', title: '暂停中', description: 'P 继续，R 重开，ESC 返回工作簿。', primaryActionLabel: '继续', secondaryActionLabel: '重开' };
  if (state.status === 'shop') return { kind: 'shop', title: '关间商店', description: `本关收入 $${state.score.toLocaleString()}，当前可支配资金 $${(state.totalBank + state.score).toLocaleString()}。`, primaryActionLabel: '下一关', secondaryActionLabel: '重开本关' };
  if (state.status === 'game_over') return { kind: 'game_over', title: '未达标', description: `目标 $${state.targetScore.toLocaleString()}，当前 $${state.score.toLocaleString()}。`, primaryActionLabel: '重开本关', secondaryActionLabel: '返回 Hub' };
  return { kind: null, title: '', description: '' };
}

export function buildGoldMinerResultSummary(state: GoldMinerBoardState): GoldMinerResultSummary {
  const bestItem = getGoldMinerBestCaughtItem(state.items, state.bankedItemIds);
  return {
    passed: state.score >= state.targetScore,
    score: state.score,
    targetScore: state.targetScore,
    caughtCount: state.bankedItemIds.length,
    bestCatchLabel: bestItem ? `${getGoldMinerItemDefinition(bestItem.kind).label} $${bestItem.value.toLocaleString()}` : undefined,
  };
}
