/* 吃豆人专项练习目录。负责练习条目的真实落点、说明和回流语义。 */

import type { PacmanPracticeId } from './pacmanTypes.ts';
import type { PacmanPackId } from './pacmanMapRegistry.ts';

export interface PacmanPracticeModule {
  id: PacmanPracticeId;
  name: string;
  description: string;
  difficulty: '入门' | '基础' | '进阶' | '综合';
  packId: PacmanPackId;
  levelNumber: number;
  startHint: string;
  objective: string;
  returnTo: 'source_level' | 'guide';
}

const PRACTICE_CATALOG: PacmanPracticeModule[] = [
  {
    id: 'turning_basics',
    name: '路口转向练习',
    description: '练习预输入和 T 字路口转向，不再靠碰运气过口。',
    difficulty: '入门',
    packId: 'tutorial',
    levelNumber: 1,
    startHint: '提前半格按方向键，到路口自动切线。',
    objective: '先把 30 颗豆子稳稳吃完，再提速。',
    returnTo: 'guide',
  },
  {
    id: 'energizer_chain',
    name: '能量豆吃鬼链',
    description: '练习能量豆窗口内的追鬼顺序，把 200→400→800 连起来。',
    difficulty: '基础',
    packId: 'tutorial',
    levelNumber: 4,
    startHint: '先等鬼靠近再开大豆，别把窗口浪费在空场。',
    objective: '单局至少吃到 2 只鬼。',
    returnTo: 'guide',
  },
  {
    id: 'ghost_escape',
    name: '四鬼包夹逃生',
    description: '练习被压线时用门和角豆拆包围。',
    difficulty: '进阶',
    packId: 'tutorial',
    levelNumber: 8,
    startHint: '先活下来，再找回头清豆的机会。',
    objective: '在高压段坚持 35 秒并保住路线。',
    returnTo: 'guide',
  },
  {
    id: 'timing_read',
    name: '节奏切换读秒',
    description: '练习 Scatter / Chase 切换前后的换线时机。',
    difficulty: '综合',
    packId: 'tutorial',
    levelNumber: 9,
    startHint: '别盯单鬼，先看整轮节奏什么时候反压。',
    objective: '扛过一次节奏切换并吃到 100 颗豆子。',
    returnTo: 'guide',
  },
];

/* 获取全部专项练习目录。 */
export function getPacmanPracticeModules(): PacmanPracticeModule[] {
  return PRACTICE_CATALOG;
}

/* 按 ID 获取专项练习。 */
export function getPacmanPracticeModule(practiceId: PacmanPracticeId): PacmanPracticeModule | null {
  return PRACTICE_CATALOG.find((module) => module.id === practiceId) || null;
}
