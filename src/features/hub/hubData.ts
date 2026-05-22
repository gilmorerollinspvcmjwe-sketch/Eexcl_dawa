import { ARCADE_MODULE_MAP, type ArcadeGameId } from '../workbook/workbookRegistry.ts';

export type { ArcadeGameId } from '../workbook/workbookRegistry.ts';

export interface HubStatsSummary {
  totalGames: number;
  totalScore: number;
}

export interface PerlerProgressSummary {
  templateId: string;
  title: string;
  completion: number;
}

export interface FantasyLaneHubSummary {
  hasStarted: boolean;
  currentChapterLabel: string;
  completedLevels: number;
  totalLevels: number;
  totalStars: number;
  bestScore: number;
  lastPlayedLevelName: string;
}

export interface GoldMinerHubSummary {
  hasStarted: boolean;
  highestLevel: number;
  bestScore: number;
  totalGoldCollected: number;
  lastPlayedLabel: string;
}

export interface HubBuildInput {
  perlerProgress: PerlerProgressSummary | null;
  fantasyLaneProgress?: FantasyLaneHubSummary | null;
  goldMinerProgress?: GoldMinerHubSummary | null;
  stats: HubStatsSummary;
}

export interface HubQuickResume {
  kind: ArcadeGameId;
  label: string;
  description: string;
}

export interface HubGameRow {
  id: ArcadeGameId;
  title: string;
  status: string;
  bestRecord: string;
  todayCount: number;
  actionLabel: string;
  accent: string;
}

export interface HubTaskRow {
  id: string;
  label: string;
  progress: string;
  reward: string;
  state: 'pending' | 'active' | 'done';
}

export interface HubActivityItem {
  id: string;
  text: string;
  tone: 'neutral' | 'success' | 'warning';
}

export interface HubSnapshot {
  quickResume: HubQuickResume;
  recommendation: string;
  games: HubGameRow[];
  tasks: HubTaskRow[];
  activity: HubActivityItem[];
}

function buildPerlerRow(progress: PerlerProgressSummary | null): HubGameRow {
  return {
    id: 'perler',
    title: ARCADE_MODULE_MAP.perler.title,
    status: progress ? `${progress.completion}%` : '就绪',
    bestRecord: progress ? progress.title : '模板库',
    todayCount: progress ? 1 : 0,
    actionLabel: progress ? '继续' : '启动',
    accent: ARCADE_MODULE_MAP.perler.accent,
  };
}

function buildFantasyLaneRow(progress: FantasyLaneHubSummary | null | undefined): HubGameRow {
  const hasStarted = progress?.hasStarted ?? false;
  return {
    id: 'fantasy_lane',
    title: ARCADE_MODULE_MAP.fantasy_lane.title,
    status: hasStarted && progress ? progress.currentChapterLabel : '战线',
    bestRecord: hasStarted && progress ? `${progress.completedLevels}/${progress.totalLevels}` : '第 1 章',
    todayCount: progress?.completedLevels ?? 0,
    actionLabel: hasStarted ? '继续' : '启动',
    accent: ARCADE_MODULE_MAP.fantasy_lane.accent,
  };
}

function buildGoldMinerRow(progress: GoldMinerHubSummary | null | undefined): HubGameRow {
  const hasStarted = progress?.hasStarted ?? false;
  return {
    id: 'gold_miner',
    title: ARCADE_MODULE_MAP.gold_miner.title,
    status: hasStarted && progress ? `L${progress.highestLevel}` : '矿井',
    bestRecord: hasStarted && progress ? `${progress.bestScore}` : '$0',
    todayCount: hasStarted && progress ? Math.max(1, Math.floor(progress.totalGoldCollected / 5000)) : 0,
    actionLabel: hasStarted ? '继续' : '启动',
    accent: ARCADE_MODULE_MAP.gold_miner.accent,
  };
}

function buildGame2048Row(): HubGameRow {
  return {
    id: 'game2048',
    title: ARCADE_MODULE_MAP.game2048.title,
    status: '聚合',
    bestRecord: '2048',
    todayCount: 0,
    actionLabel: '启动',
    accent: ARCADE_MODULE_MAP.game2048.accent,
  };
}

export function buildHubSnapshot(input: HubBuildInput): HubSnapshot {
  const { perlerProgress, fantasyLaneProgress, goldMinerProgress, stats } = input;

  const quickResume: HubQuickResume = perlerProgress
    ? { kind: 'perler', label: `继续 ${perlerProgress.title} ${perlerProgress.completion}%`, description: '' }
    : fantasyLaneProgress?.hasStarted
      ? { kind: 'fantasy_lane', label: `继续 ${fantasyLaneProgress.lastPlayedLevelName}`, description: '' }
      : goldMinerProgress?.hasStarted
        ? { kind: 'gold_miner', label: `继续黄金矿工 ${goldMinerProgress.lastPlayedLabel}`, description: '' }
        : { kind: 'aim', label: '继续 60 秒练枪', description: '' };

  return {
    quickResume,
    recommendation: '配置',
    games: [
      {
        id: 'aim',
        title: ARCADE_MODULE_MAP.aim.title,
        status: '热手',
        bestRecord: `${stats.totalScore || 0}`,
        todayCount: stats.totalGames || 0,
        actionLabel: '启动',
        accent: ARCADE_MODULE_MAP.aim.accent,
      },
      {
        id: 'snake',
        title: ARCADE_MODULE_MAP.snake.title,
        status: '就绪',
        bestRecord: '--',
        todayCount: 0,
        actionLabel: '启动',
        accent: ARCADE_MODULE_MAP.snake.accent,
      },
      {
        id: 'tetris',
        title: ARCADE_MODULE_MAP.tetris.title,
        status: '就绪',
        bestRecord: '--',
        todayCount: 0,
        actionLabel: '启动',
        accent: ARCADE_MODULE_MAP.tetris.accent,
      },
      buildFantasyLaneRow(fantasyLaneProgress),
      buildGoldMinerRow(goldMinerProgress),
      buildGame2048Row(),
      buildPerlerRow(perlerProgress),
      {
        id: 'pvz',
        title: ARCADE_MODULE_MAP.pvz.title,
        status: '防线',
        bestRecord: '首章',
        todayCount: 0,
        actionLabel: '启动',
        accent: ARCADE_MODULE_MAP.pvz.accent,
      },
    ],
    tasks: [
      { id: 'play-two', label: '任意 2 局', progress: '1/2', reward: 'EXP', state: 'active' },
      { id: 'combo-ten', label: '10 连击', progress: '6/10', reward: '币', state: 'active' },
      { id: 'perler-one', label: '拼豆 1 次', progress: '0/1', reward: '图鉴', state: 'pending' },
    ],
    activity: [
      { id: 'theme', text: '夜班蓝图同步', tone: 'success' },
      { id: 'alert', text: '效率偏高', tone: 'warning' },
      { id: 'sheetx', text: 'SheetX 闪烁', tone: 'neutral' },
    ],
  };
}
