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
    status: progress ? '创作中' : '模板已就绪',
    bestRecord: progress ? `模板 ${progress.title} ${progress.completion}%` : '模板库已解锁',
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
        label: `继续：${perlerProgress.title}（${perlerProgress.completion}%）`,
        description: '回到上次未完成的拼豆作品',
      }
    : {
        kind: 'aim',
        label: '推荐：60 秒练枪',
        description: '快速热手并保持手感',
      };

  return {
    quickResume,
    recommendation: perlerProgress ? '推荐：来一局 60 秒练枪' : '推荐：从模板库开始今天的拼豆',
    games: [
      {
        id: 'aim',
        title: '练枪',
        status: '建议热手',
        bestRecord: `${stats.totalScore || 0}`,
        todayCount: stats.totalGames || 0,
        actionLabel: '启动',
        accent: '#16a34a',
      },
      {
        id: 'snake',
        title: '贪吃蛇',
        status: '数据流通畅',
        bestRecord: '最长长度 42',
        todayCount: 0,
        actionLabel: '启动',
        accent: '#0ea5e9',
      },
      {
        id: 'tetris',
        title: '俄罗斯方块',
        status: '堆积待整理',
        bestRecord: '最高消行 18',
        todayCount: 0,
        actionLabel: '启动',
        accent: '#475569',
      },
      buildPerlerRow(perlerProgress),
      {
        id: 'pvz',
        title: '植物大战僵尸',
        status: '防线待检查',
        bestRecord: '最高关卡 4',
        todayCount: 0,
        actionLabel: '启动',
        accent: '#f59e0b',
      },
    ],
    tasks: [
      { id: 'play-two', label: '完成任意 2 局', progress: '1/2', reward: 'EXP + 币', state: 'active' },
      { id: 'combo-ten', label: '练枪 10 连击', progress: '6/10', reward: '币 + 特效', state: 'active' },
      { id: 'perler-one', label: '完成 1 个拼豆模板', progress: perlerProgress ? '0/1' : '0/1', reward: 'EXP + 图鉴', state: 'pending' },
    ],
    activity: [
      { id: 'theme', text: '已解锁：夜班蓝主题', tone: 'success' },
      { id: 'alert', text: '检测到娱乐效率略高于工作效率', tone: 'warning' },
      { id: 'sheetx', text: 'SheetX 出现轻微闪烁', tone: 'neutral' },
    ],
  };
}

