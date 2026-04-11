export type ArcadeGameId = 'aim' | 'snake' | 'tetris' | 'perler' | 'pvz';

export interface HubStatsSummary {
  totalGames: number;
  totalScore: number;
}

export interface PerlerProgressSummary {
  templateId: string;
  title: string;
  completion: number;
}

export interface HubBuildInput {
  perlerProgress: PerlerProgressSummary | null;
  stats: HubStatsSummary;
}

export interface HubQuickResume {
  kind: 'perler' | 'aim';
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
    title: '拼豆',
    status: progress ? `${progress.completion}%` : '就绪',
    bestRecord: progress ? progress.title : '模板库',
    todayCount: progress ? 1 : 0,
    actionLabel: progress ? '继续' : '启动',
    accent: '#c084fc',
  };
}

export function buildHubSnapshot(input: HubBuildInput): HubSnapshot {
  const { perlerProgress, stats } = input;

  const quickResume: HubQuickResume = perlerProgress
    ? {
        kind: 'perler',
        label: `继续 ${perlerProgress.title} ${perlerProgress.completion}%`,
        description: '',
      }
    : {
        kind: 'aim',
        label: '继续 60秒练枪',
        description: '',
      };

  return {
    quickResume,
    recommendation: '配置',
    games: [
      {
        id: 'aim',
        title: '练枪',
        status: '热手',
        bestRecord: `${stats.totalScore || 0}`,
        todayCount: stats.totalGames || 0,
        actionLabel: '启动',
        accent: '#16a34a',
      },
      {
        id: 'snake',
        title: '贪吃蛇',
        status: '筹备',
        bestRecord: '—',
        todayCount: 0,
        actionLabel: '查看',
        accent: '#0ea5e9',
      },
      {
        id: 'tetris',
        title: '俄罗斯方块',
        status: '筹备',
        bestRecord: '—',
        todayCount: 0,
        actionLabel: '查看',
        accent: '#475569',
      },
      buildPerlerRow(perlerProgress),
      {
        id: 'pvz',
        title: '植物大战僵尸',
        status: '筹备',
        bestRecord: '—',
        todayCount: 0,
        actionLabel: '查看',
        accent: '#f59e0b',
      },
    ],
    tasks: [
      { id: 'play-two', label: '任意 2 局', progress: '1/2', reward: 'EXP', state: 'active' },
      { id: 'combo-ten', label: '10 连击', progress: '6/10', reward: '币', state: 'active' },
      { id: 'perler-one', label: '拼豆 1 次', progress: '0/1', reward: '图鉴', state: 'pending' },
    ],
    activity: [
      { id: 'theme', text: '夜班蓝', tone: 'success' },
      { id: 'alert', text: '效率偏高', tone: 'warning' },
      { id: 'sheetx', text: 'SheetX 闪烁', tone: 'neutral' },
    ],
  };
}

