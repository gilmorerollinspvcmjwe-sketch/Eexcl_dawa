import type { PvZChapterId, PvZBoardState } from './pvzTypes.ts';

export interface PvZChapterGuidance {
  objective: string;
  majorThreats: string[];
  setupHint: string;
}

const CHAPTER_GUIDANCE: Record<PvZChapterId, PvZChapterGuidance> = {
  day: {
    objective: '稳住前两波并建立双线持续火力',
    majorThreats: ['路障僵尸', '中路高压波'],
    setupHint: '优先带向日葵和坚果墙，先稳经济再补输出。',
  },
  night: {
    objective: '在低阳光开局下快速补出前排防线',
    majorThreats: ['报纸僵尸', '铁栅门僵尸'],
    setupHint: '前期阳光紧，建议先放低费防守位，避免前排被穿。',
  },
  pool: {
    objective: '优先稳住中路，再扩展到两侧火力',
    majorThreats: ['撑杆僵尸', '铁桶僵尸'],
    setupHint: '中路先放墙体和持续输出，避免被快速突破。',
  },
  fog: {
    objective: '保持火力覆盖，防止高压波次切路',
    majorThreats: ['铁栅门僵尸', '橄榄球僵尸'],
    setupHint: '建议准备减速和高爆发位，处理中后段突进压力。',
  },
  roof: {
    objective: '在重甲波次前完成三路稳定输出',
    majorThreats: ['铁桶僵尸', '橄榄球僵尸'],
    setupHint: '先搭中路核心火力，再补边路，避免后期缺位。',
  },
};

export function getPvZChapterGuidance(chapterId: PvZChapterId): PvZChapterGuidance {
  return CHAPTER_GUIDANCE[chapterId] ?? CHAPTER_GUIDANCE.day;
}

function buildBattleSnapshot(state: PvZBoardState): string {
  const aliveLanes = new Set(state.zombies.map((zombie) => zombie.row)).size;
  return `阳光 ${state.sun} | 剩余僵尸 ${state.zombies.length} | 受压路数 ${aliveLanes}`;
}

export function getPvZOutcomeRecommendation(state: PvZBoardState): string {
  const guidance = getPvZChapterGuidance(state.chapterId);
  if (state.status === 'won') {
    return `本章目标达成。建议复盘卡组并挑战下一章；也可去 Sheet8 图鉴查看克制关系。`;
  }
  if (state.status === 'lost') {
    return `失守复盘：${buildBattleSnapshot(state)}。建议：${guidance.setupHint} 可去 Sheet9 实验室看章节规则。`;
  }
  return `章节目标：${guidance.objective}。主要威胁：${guidance.majorThreats.join('、')}。`;
}

