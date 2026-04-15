/* 三消关卡目录系统。维护 Adventure 主线关卡脚本，并逐步扩到障碍包、掉落包和连锁包。 */

import type {
  Match3Color,
  Match3Goal,
  Match3ObstacleType,
  Match3Portal,
  Match3LevelConfig,
  Match3DropItemType,
  Match3DropExit,
  Match3BoardTemplateId,
  Match3ColorWeights,
  Match3ModeId,
  Match3PrebuiltSpecial,
  Match3ComboObjectiveId,
} from './match3Types';

export interface Match3LevelScript {
  id: string;
  name: string;
  modeId?: Match3ModeId;
  packId: string;
  packName: string;
  chapterId?: string;
  chapterName?: string;
  boardTemplateId?: Match3BoardTemplateId;
  orderInPack: number;
  rows: number;
  cols: number;
  palette: Match3Color[];
  colorWeights?: Match3ColorWeights;
  goals: Match3Goal[];
  maxMoves: number;
  maxTimeMs?: number;
  initialObstacles?: {
    type: Match3ObstacleType;
    positions: { row: number; col: number }[];
  }[];
  portals?: Match3Portal[];
  dropItems?: { type: Match3DropItemType; row: number; col: number }[];
  dropExits?: Match3DropExit[];
  prebuiltSpecials?: Match3PrebuiltSpecial[];
  spreaderConfig?: {
    initialPositions: { row: number; col: number }[];
    spreadInterval: number;
  };
  specialBlockChance?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tutorialHint?: string;
}

export interface Match3LevelPack {
  id: string;
  name: string;
  description: string;
  orderInPack: number;
  levels: Match3LevelScript[];
  unlockCondition?: {
    type: 'completePack' | 'completeLevels' | 'totalStars';
    packId?: string;
    levelCount?: number;
    starCount?: number;
  };
}

const BASIC_PALETTE: Match3Color[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const SIMPLE_PALETTE: Match3Color[] = ['red', 'yellow', 'green', 'blue'];
const MINIMAL_PALETTE: Match3Color[] = ['red', 'yellow', 'blue'];

function createScoreGoal(target: number): Match3Goal {
  return { type: 'score', target, current: 0 };
}

function createCollectColorGoal(color: Match3Color, target: number): Match3Goal {
  return { type: 'collectColor', target, current: 0, colorTarget: color };
}

function createClearOverlayGoal(target: number): Match3Goal {
  return { type: 'clearOverlay', target, current: 0 };
}

function createClearObstacleGoal(obstacle: Match3ObstacleType, target: number): Match3Goal {
  return { type: 'clearObstacle', target, current: 0, obstacleTarget: obstacle };
}

function createDropGoal(target: number, dropItemType: Match3DropItemType = 'folder'): Match3Goal {
  return { type: 'dropCollect', target, current: 0, dropItemType };
}

function createTriggerComboGoal(comboTarget: Match3ComboObjectiveId, target: number): Match3Goal {
  return { type: 'triggerCombo', target, current: 0, comboTarget };
}

const BEGINNER_PACK: Match3LevelPack = {
  id: 'beginner',
  name: '新手入门包',
  description: '学习三消基础玩法，掌握交换、消除和特殊块生成',
  orderInPack: 1,
  levels: [
    {
      id: 'beginner-01',
      name: '初次接触',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 1,
      rows: 6,
      cols: 6,
      palette: MINIMAL_PALETTE,
      goals: [createScoreGoal(500)],
      maxMoves: 20,
      difficulty: 'easy',
      tutorialHint: '点击两个相邻色块进行交换，让三个相同颜色的色块连成一线',
    },
    {
      id: 'beginner-02',
      name: '简单消除',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 2,
      rows: 6,
      cols: 6,
      palette: MINIMAL_PALETTE,
      goals: [createScoreGoal(800)],
      maxMoves: 18,
      difficulty: 'easy',
      tutorialHint: '尝试寻找更多消除机会，每次消除都会获得分数',
    },
    {
      id: 'beginner-03',
      name: '四连条纹',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 3,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createScoreGoal(1200)],
      maxMoves: 20,
      difficulty: 'easy',
      tutorialHint: '四个相同色块连成一线会生成条纹块，可以清除整行或整列',
    },
    {
      id: 'beginner-04',
      name: '条纹威力',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 4,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createScoreGoal(1500)],
      maxMoves: 18,
      difficulty: 'easy',
      tutorialHint: '激活条纹块可以清除整行或整列，获得大量分数',
    },
    {
      id: 'beginner-05',
      name: '五连彩球',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 5,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createScoreGoal(2000)],
      maxMoves: 22,
      difficulty: 'easy',
      tutorialHint: '五个相同色块连成一线会生成彩球，可以清除场上所有该颜色的色块',
    },
    {
      id: 'beginner-06',
      name: '彩球清屏',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 6,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(2500)],
      maxMoves: 20,
      difficulty: 'easy',
      tutorialHint: '彩球与任意色块交换，清除场上所有该颜色的色块',
    },
    {
      id: 'beginner-07',
      name: 'T形包装',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 7,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(1800)],
      maxMoves: 18,
      difficulty: 'medium',
      tutorialHint: 'T形或L形五连会生成包装块，爆炸两次清除周围色块',
    },
    {
      id: 'beginner-08',
      name: '包装爆破',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 8,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(2200)],
      maxMoves: 16,
      difficulty: 'medium',
      tutorialHint: '包装块会爆炸两次，第一次小范围，第二次更大范围',
    },
    {
      id: 'beginner-09',
      name: '连锁入门',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 9,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(3000)],
      maxMoves: 20,
      difficulty: 'medium',
      tutorialHint: '消除后新色块落下可能触发连锁，连锁越多分数越高',
    },
    {
      id: 'beginner-10',
      name: '连锁进阶',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 10,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(3500)],
      maxMoves: 18,
      difficulty: 'medium',
      tutorialHint: '连锁倍率最高可达2倍，尝试制造更多连锁',
    },
    {
      id: 'beginner-11',
      name: '组合入门',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 11,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(4000)],
      maxMoves: 20,
      difficulty: 'medium',
      tutorialHint: '两个特殊块交换会产生强大效果，条纹+条纹是十字清除',
    },
    {
      id: 'beginner-12',
      name: '新手毕业',
      packId: 'beginner',
      packName: '新手入门包',
      orderInPack: 12,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(5000)],
      maxMoves: 25,
      difficulty: 'medium',
      tutorialHint: '综合运用所有技巧，完成新手入门挑战',
    },
  ],
};

const MOVE_STRATEGY_PACK: Match3LevelPack = {
  id: 'move-strategy',
  name: '步数策略包',
  description: '在有限步数内完成目标，学习高效利用每一步',
  orderInPack: 2,
  levels: [
    {
      id: 'move-01',
      name: '精打细算',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 1,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(3000)],
      maxMoves: 15,
      difficulty: 'easy',
      tutorialHint: '步数有限，寻找能触发连锁的交换',
    },
    {
      id: 'move-02',
      name: '步步为营',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 2,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(4000)],
      maxMoves: 12,
      difficulty: 'easy',
      tutorialHint: '优先制造特殊块，它们能一次清除大量色块',
    },
    {
      id: 'move-03',
      name: '条纹策略',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 3,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(5000)],
      maxMoves: 14,
      difficulty: 'medium',
      tutorialHint: '条纹块可以一次清除整行，高效利用步数',
    },
    {
      id: 'move-04',
      name: '包装策略',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 4,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(6000)],
      maxMoves: 12,
      difficulty: 'medium',
      tutorialHint: '包装块爆炸两次，比普通消除更高效',
    },
    {
      id: 'move-05',
      name: '彩球策略',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 5,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(8000)],
      maxMoves: 10,
      difficulty: 'medium',
      tutorialHint: '彩球可以清除所有同色色块，一步获得大量分数',
    },
    {
      id: 'move-06',
      name: '颜色收集',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 6,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createCollectColorGoal('red', 30)],
      maxMoves: 15,
      difficulty: 'medium',
      tutorialHint: '收集指定颜色的色块，彩球可以快速完成目标',
    },
    {
      id: 'move-07',
      name: '双色收集',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 7,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createCollectColorGoal('blue', 25), createCollectColorGoal('yellow', 25)],
      maxMoves: 18,
      difficulty: 'medium',
      tutorialHint: '同时收集两种颜色，优先清除数量较多的颜色',
    },
    {
      id: 'move-08',
      name: '组合威力',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 8,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(10000)],
      maxMoves: 10,
      difficulty: 'hard',
      tutorialHint: '两个特殊块组合效果更强，一步获得大量分数',
    },
    {
      id: 'move-09',
      name: '十字清除',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 9,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(12000)],
      maxMoves: 8,
      difficulty: 'hard',
      tutorialHint: '条纹+条纹组合产生十字清除，一步清除两行',
    },
    {
      id: 'move-10',
      name: '三行三列',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 10,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(15000)],
      maxMoves: 8,
      difficulty: 'hard',
      tutorialHint: '条纹+包装组合清除三行三列，效果惊人',
    },
    {
      id: 'move-11',
      name: '大范围爆破',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 11,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(18000)],
      maxMoves: 6,
      difficulty: 'hard',
      tutorialHint: '包装+包装组合产生超大范围爆破',
    },
    {
      id: 'move-12',
      name: '全色转化',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 12,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(20000)],
      maxMoves: 6,
      difficulty: 'hard',
      tutorialHint: '彩球+特殊块组合，将所有同色色块转化为特殊块',
    },
    {
      id: 'move-13',
      name: '极限步数',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 13,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(25000)],
      maxMoves: 5,
      difficulty: 'expert',
      tutorialHint: '只有5步，必须制造最强组合',
    },
    {
      id: 'move-14',
      name: '连锁大师',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 14,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(30000)],
      maxMoves: 8,
      difficulty: 'expert',
      tutorialHint: '一次交换触发多次连锁，获得最高倍率',
    },
    {
      id: 'move-15',
      name: '精准打击',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 15,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createCollectColorGoal('purple', 40)],
      maxMoves: 10,
      difficulty: 'expert',
      tutorialHint: '精准收集紫色色块，彩球是最佳选择',
    },
    {
      id: 'move-16',
      name: '三色挑战',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 16,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [
        createCollectColorGoal('red', 30),
        createCollectColorGoal('green', 30),
        createCollectColorGoal('blue', 30),
      ],
      maxMoves: 15,
      difficulty: 'expert',
      tutorialHint: '同时收集三种颜色，需要精心规划每一步',
    },
    {
      id: 'move-17',
      name: '步数极限',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 17,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(40000)],
      maxMoves: 4,
      difficulty: 'expert',
      tutorialHint: '只有4步，必须制造彩球组合',
    },
    {
      id: 'move-18',
      name: '完美开局',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 18,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(50000)],
      maxMoves: 6,
      difficulty: 'expert',
      tutorialHint: '每一步都要触发连锁或特殊块',
    },
    {
      id: 'move-19',
      name: '策略大师',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 19,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(60000)],
      maxMoves: 5,
      difficulty: 'expert',
      tutorialHint: '综合运用所有技巧，成为策略大师',
    },
    {
      id: 'move-20',
      name: '步数王者',
      packId: 'move-strategy',
      packName: '步数策略包',
      orderInPack: 20,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createScoreGoal(80000)],
      maxMoves: 4,
      difficulty: 'expert',
      tutorialHint: '终极挑战，只有4步完成80000分目标',
    },
  ],
};

const JELLY_CLEAR_PACK: Match3LevelPack = {
  id: 'jelly-clear',
  name: '果冻清理包',
  description: '清除覆盖在色块上的果冻层，学习障碍处理技巧',
  orderInPack: 3,
  levels: [
    {
      id: 'jelly-01',
      name: '果冻初见',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 1,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createClearOverlayGoal(5)],
      maxMoves: 20,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 4 },
            { row: 3, col: 3 },
          ],
        },
      ],
      difficulty: 'easy',
      tutorialHint: '果冻覆盖在色块上，消除相邻色块可以清除果冻',
    },
    {
      id: 'jelly-02',
      name: '果冻蔓延',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 2,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createClearOverlayGoal(8)],
      maxMoves: 18,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 1, col: 5 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
            { row: 3, col: 5 },
            { row: 5, col: 1 },
            { row: 5, col: 5 },
          ],
        },
      ],
      difficulty: 'easy',
      tutorialHint: '更多果冻需要清除，寻找能一次清除多个果冻的消除',
    },
    {
      id: 'jelly-03',
      name: '双层果冻',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 3,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createClearOverlayGoal(4)],
      maxMoves: 20,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 4 },
          ],
        },
      ],
      difficulty: 'easy',
      tutorialHint: '双层果冻需要两次消除才能清除',
    },
    {
      id: 'jelly-04',
      name: '混合果冻',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 4,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(10)],
      maxMoves: 22,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 0, col: 0 },
            { row: 0, col: 7 },
            { row: 7, col: 0 },
            { row: 7, col: 7 },
            { row: 2, col: 2 },
            { row: 5, col: 5 },
          ],
        },
        {
          type: 'frost2',
          positions: [
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '单层和双层果冻混合，优先清除双层果冻',
    },
    {
      id: 'jelly-05',
      name: '条纹清冻',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 5,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(12)],
      maxMoves: 18,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 0, col: 4 },
            { row: 0, col: 5 },
            { row: 7, col: 2 },
            { row: 7, col: 3 },
            { row: 7, col: 4 },
            { row: 7, col: 5 },
            { row: 2, col: 0 },
            { row: 3, col: 0 },
            { row: 4, col: 0 },
            { row: 5, col: 0 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '条纹块可以一次清除整行果冻',
    },
    {
      id: 'jelly-06',
      name: '包装清冻',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 6,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(9)],
      maxMoves: 16,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 3, col: 2 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '包装块爆炸可以清除周围果冻',
    },
    {
      id: 'jelly-07',
      name: '锁链入门',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 7,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('chain', 4)],
      maxMoves: 20,
      initialObstacles: [
        {
          type: 'chain',
          positions: [
            { row: 1, col: 1 },
            { row: 1, col: 6 },
            { row: 6, col: 1 },
            { row: 6, col: 6 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '锁链块需要消除相邻色块才能解锁',
    },
    {
      id: 'jelly-08',
      name: '锁链挑战',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 8,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('chain', 8)],
      maxMoves: 18,
      initialObstacles: [
        {
          type: 'chain',
          positions: [
            { row: 0, col: 0 },
            { row: 0, col: 7 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 5, col: 3 },
            { row: 5, col: 4 },
            { row: 7, col: 0 },
            { row: 7, col: 7 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '更多锁链需要解锁，条纹块可以远程解锁',
    },
    {
      id: 'jelly-09',
      name: '木箱障碍',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 9,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('box', 6)],
      maxMoves: 20,
      initialObstacles: [
        {
          type: 'box',
          positions: [
            { row: 1, col: 2 },
            { row: 1, col: 5 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 6, col: 2 },
            { row: 6, col: 5 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '木箱需要相邻消除才能击破',
    },
    {
      id: 'jelly-10',
      name: '石块障碍',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 10,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('stone', 4)],
      maxMoves: 22,
      initialObstacles: [
        {
          type: 'stone',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 5 },
            { row: 5, col: 2 },
            { row: 5, col: 5 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '石块需要两次相邻消除才能击破',
    },
    {
      id: 'jelly-11',
      name: '混合障碍',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 11,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(8), createClearObstacleGoal('chain', 4)],
      maxMoves: 25,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 0, col: 1 },
            { row: 0, col: 6 },
            { row: 7, col: 1 },
            { row: 7, col: 6 },
            { row: 3, col: 0 },
            { row: 3, col: 7 },
            { row: 4, col: 0 },
            { row: 4, col: 7 },
          ],
        },
        {
          type: 'chain',
          positions: [
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 5, col: 3 },
            { row: 5, col: 4 },
          ],
        },
      ],
      difficulty: 'hard',
      tutorialHint: '同时清除果冻和锁链，优先处理更难的目标',
    },
    {
      id: 'jelly-12',
      name: '果冻矩阵',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 12,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(16)],
      maxMoves: 25,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 1, col: 1 },
            { row: 1, col: 4 },
            { row: 1, col: 7 },
            { row: 4, col: 1 },
            { row: 4, col: 4 },
            { row: 4, col: 7 },
            { row: 7, col: 1 },
            { row: 7, col: 4 },
            { row: 7, col: 7 },
          ],
        },
        {
          type: 'frost1',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 5 },
            { row: 5, col: 2 },
            { row: 5, col: 5 },
            { row: 2, col: 8 },
            { row: 5, col: 8 },
            { row: 8, col: 2 },
            { row: 8, col: 5 },
          ],
        },
      ],
      difficulty: 'hard',
      tutorialHint: '大量双层果冻，需要高效利用特殊块',
    },
    {
      id: 'jelly-13',
      name: '传送入门',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 13,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(6)],
      maxMoves: 20,
      initialObstacles: [
        {
          type: 'frost1',
          positions: [
            { row: 0, col: 0 },
            { row: 0, col: 7 },
            { row: 7, col: 0 },
            { row: 7, col: 7 },
            { row: 3, col: 3 },
            { row: 4, col: 4 },
          ],
        },
      ],
      portals: [
        { id: 'portal-1', inRow: 0, inCol: 3, outRow: 7, outCol: 3 },
        { id: 'portal-2', inRow: 3, inCol: 0, outRow: 3, outCol: 7 },
      ],
      difficulty: 'hard',
      tutorialHint: '传送口可以让色块从一端传送到另一端',
    },
    {
      id: 'jelly-14',
      name: '传送挑战',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 14,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearOverlayGoal(10)],
      maxMoves: 22,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 0, col: 2 },
            { row: 0, col: 5 },
            { row: 7, col: 2 },
            { row: 7, col: 5 },
            { row: 2, col: 0 },
            { row: 5, col: 0 },
            { row: 2, col: 7 },
            { row: 5, col: 7 },
          ],
        },
        {
          type: 'frost1',
          positions: [
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
          ],
        },
      ],
      portals: [
        { id: 'portal-1', inRow: 0, inCol: 0, outRow: 7, outCol: 7 },
        { id: 'portal-2', inRow: 0, inCol: 7, outRow: 7, outCol: 0 },
      ],
      difficulty: 'hard',
      tutorialHint: '利用传送口清除角落的果冻',
    },
    {
      id: 'jelly-15',
      name: '蔓延威胁',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 15,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('spreader', 3)],
      maxMoves: 20,
      spreaderConfig: {
        initialPositions: [{ row: 3, col: 3 }],
        spreadInterval: 3,
      },
      difficulty: 'hard',
      tutorialHint: '蔓延块每回合会扩散，尽快清除它们',
    },
    {
      id: 'jelly-16',
      name: '蔓延控制',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 16,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createClearObstacleGoal('spreader', 5)],
      maxMoves: 18,
      spreaderConfig: {
        initialPositions: [
          { row: 2, col: 2 },
          { row: 5, col: 5 },
        ],
        spreadInterval: 2,
      },
      difficulty: 'expert',
      tutorialHint: '多个蔓延块同时扩散，必须快速行动',
    },
    {
      id: 'jelly-17',
      name: '终极清理',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 17,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [
        createClearOverlayGoal(12),
        createClearObstacleGoal('chain', 6),
        createClearObstacleGoal('box', 4),
      ],
      maxMoves: 30,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 0, col: 0 },
            { row: 0, col: 8 },
            { row: 8, col: 0 },
            { row: 8, col: 8 },
            { row: 4, col: 4 },
          ],
        },
        {
          type: 'frost1',
          positions: [
            { row: 1, col: 1 },
            { row: 1, col: 7 },
            { row: 7, col: 1 },
            { row: 7, col: 7 },
            { row: 2, col: 4 },
            { row: 6, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 6 },
          ],
        },
        {
          type: 'chain',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 6 },
            { row: 6, col: 2 },
            { row: 6, col: 6 },
            { row: 3, col: 3 },
            { row: 3, col: 5 },
          ],
        },
        {
          type: 'box',
          positions: [
            { row: 3, col: 4 },
            { row: 5, col: 4 },
            { row: 4, col: 3 },
            { row: 4, col: 5 },
          ],
        },
      ],
      difficulty: 'expert',
      tutorialHint: '综合所有障碍类型，需要全面运用技巧',
    },
    {
      id: 'jelly-18',
      name: '果冻王者',
      packId: 'jelly-clear',
      packName: '果冻清理包',
      orderInPack: 18,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [
        createClearOverlayGoal(20),
        createClearObstacleGoal('stone', 4),
      ],
      maxMoves: 25,
      initialObstacles: [
        {
          type: 'frost2',
          positions: [
            { row: 0, col: 1 },
            { row: 0, col: 3 },
            { row: 0, col: 5 },
            { row: 0, col: 7 },
            { row: 8, col: 1 },
            { row: 8, col: 3 },
            { row: 8, col: 5 },
            { row: 8, col: 7 },
            { row: 1, col: 0 },
            { row: 1, col: 8 },
            { row: 7, col: 0 },
            { row: 7, col: 8 },
          ],
        },
        {
          type: 'frost1',
          positions: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 2, col: 6 },
            { row: 6, col: 2 },
            { row: 6, col: 4 },
            { row: 6, col: 6 },
            { row: 4, col: 2 },
            { row: 4, col: 6 },
          ],
        },
        {
          type: 'stone',
          positions: [
            { row: 3, col: 3 },
            { row: 3, col: 5 },
            { row: 5, col: 3 },
            { row: 5, col: 5 },
          ],
        },
      ],
      difficulty: 'expert',
      tutorialHint: '终极果冻挑战，清除所有障碍成为王者',
    },
  ],
};

const DROP_COLLECT_PACK: Match3LevelPack = {
  id: 'drop-collect',
  name: '掉落收集包',
  description: '护送文件掉到出口，学习列控制、底部打通和传送改道。',
  orderInPack: 4,
  levels: [
    {
      id: 'drop-01',
      name: '首份文件',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 1,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createDropGoal(1)],
      maxMoves: 16,
      dropItems: [{ type: 'folder', row: 0, col: 3 }],
      dropExits: [{ row: 6, col: 3 }],
      difficulty: 'easy',
      tutorialHint: '先打通文件正下方这一列，把第一份文件送到出口。',
    },
    {
      id: 'drop-02',
      name: '双件分流',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 2,
      rows: 7,
      cols: 7,
      palette: SIMPLE_PALETTE,
      goals: [createDropGoal(2)],
      maxMoves: 18,
      dropItems: [
        { type: 'folder', row: 0, col: 2 },
        { type: 'folder', row: 0, col: 4 },
      ],
      dropExits: [
        { row: 6, col: 2 },
        { row: 6, col: 4 },
      ],
      difficulty: 'easy',
      tutorialHint: '两份文件要分别送到底部出口，别让中段卡住。',
    },
    {
      id: 'drop-03',
      name: '木箱堵路',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 3,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createDropGoal(2)],
      maxMoves: 20,
      dropItems: [
        { type: 'folder', row: 0, col: 2 },
        { type: 'folder', row: 0, col: 5 },
      ],
      dropExits: [
        { row: 7, col: 2 },
        { row: 7, col: 5 },
      ],
      initialObstacles: [
        {
          type: 'box',
          positions: [
            { row: 4, col: 2 },
            { row: 4, col: 5 },
            { row: 5, col: 2 },
            { row: 5, col: 5 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '先拆掉出口上方的木箱，再让文件顺着空列下落。',
    },
    {
      id: 'drop-04',
      name: '印章转运',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 4,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createDropGoal(2, 'stamp')],
      maxMoves: 22,
      dropItems: [
        { type: 'stamp', row: 0, col: 1 },
        { type: 'stamp', row: 0, col: 6 },
      ],
      dropExits: [
        { row: 7, col: 1 },
        { row: 7, col: 6 },
      ],
      initialObstacles: [
        {
          type: 'stone',
          positions: [
            { row: 4, col: 1 },
            { row: 4, col: 6 },
          ],
        },
      ],
      difficulty: 'medium',
      tutorialHint: '石块要先敲两次，别等印章堆到石块上面才处理。',
    },
    {
      id: 'drop-05',
      name: '传送改道',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 5,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      goals: [createDropGoal(2, 'stamp')],
      maxMoves: 22,
      dropItems: [
        { type: 'stamp', row: 0, col: 0 },
        { type: 'stamp', row: 0, col: 7 },
      ],
      dropExits: [
        { row: 7, col: 0 },
        { row: 7, col: 7 },
      ],
      portals: [
        { id: 'drop-portal-left', inRow: 3, inCol: 0, outRow: 3, outCol: 7 },
        { id: 'drop-portal-right', inRow: 3, inCol: 7, outRow: 3, outCol: 0 },
      ],
      difficulty: 'hard',
      tutorialHint: '文件会跟着掉落一起穿过传送口，注意落点后的出口路线。',
    },
    {
      id: 'drop-06',
      name: '芯片终测',
      packId: 'drop-collect',
      packName: '掉落收集包',
      orderInPack: 6,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      goals: [createDropGoal(3, 'formulaChip')],
      maxMoves: 24,
      dropItems: [
        { type: 'formulaChip', row: 0, col: 2 },
        { type: 'formulaChip', row: 0, col: 4 },
        { type: 'formulaChip', row: 0, col: 6 },
      ],
      dropExits: [
        { row: 8, col: 2 },
        { row: 8, col: 4 },
        { row: 8, col: 6 },
      ],
      initialObstacles: [
        {
          type: 'box',
          positions: [
            { row: 5, col: 2 },
            { row: 5, col: 4 },
            { row: 5, col: 6 },
          ],
        },
        {
          type: 'chain',
          positions: [
            { row: 6, col: 1 },
            { row: 6, col: 7 },
          ],
        },
      ],
      difficulty: 'hard',
      tutorialHint: '三份芯片同时下压，先保出口列通畅，再用连锁做收尾。',
    },
  ],
};

function createAdventureLevel(script: Match3LevelScript): Match3LevelScript {
  return {
    ...script,
    modeId: script.modeId ?? 'adventure',
    chapterId: script.chapterId ?? script.packId,
    chapterName: script.chapterName ?? script.packName,
    boardTemplateId: script.boardTemplateId ?? 'standard-grid',
  };
}

const OBSTACLE_SIEGE_PACK: Match3LevelPack = {
  id: 'obstacle-siege',
  name: '障碍压制包',
  description: '集中练习拆障碍、开路径和压制蔓延，作为掉落收集之后的中压章节骨架。',
  orderInPack: 5,
  unlockCondition: {
    type: 'completePack',
    packId: 'drop-collect',
  },
  levels: [
    createAdventureLevel({
      id: 'obstacle-01',
      name: '锁链入口',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 1,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      colorWeights: { blue: 3, green: 2, red: 1 },
      goals: [createClearObstacleGoal('chain', 6), createScoreGoal(4200)],
      maxMoves: 18,
      initialObstacles: [{ type: 'chain', positions: [{ row: 2, col: 2 }, { row: 2, col: 5 }, { row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 5 }] }],
      difficulty: 'medium',
      tutorialHint: '先拆掉中段锁链，后续才有空间制造纵向条纹。 ',
    }),
    createAdventureLevel({
      id: 'obstacle-02',
      name: '木箱拦截',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 2,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      colorWeights: { orange: 3, yellow: 2 },
      goals: [createClearObstacleGoal('box', 7)],
      maxMoves: 17,
      initialObstacles: [{ type: 'box', positions: [{ row: 2, col: 1 }, { row: 2, col: 3 }, { row: 2, col: 5 }, { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 4, col: 3 }, { row: 5, col: 3 }] }],
      difficulty: 'medium',
      tutorialHint: '这里重点不是攒分，而是快速拆掉挡住主通道的木箱。 ',
    }),
    createAdventureLevel({
      id: 'obstacle-03',
      name: '石块折返',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 3,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      goals: [createClearObstacleGoal('stone', 4), createCollectColorGoal('purple', 10)],
      maxMoves: 18,
      initialObstacles: [{ type: 'stone', positions: [{ row: 2, col: 2 }, { row: 2, col: 5 }, { row: 5, col: 2 }, { row: 5, col: 5 }] }],
      difficulty: 'hard',
      tutorialHint: '石块要连续补刀，优先在它们周围构造重复命中的形状。 ',
    }),
    createAdventureLevel({
      id: 'obstacle-04',
      name: '传送拆壁',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 4,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      goals: [createClearObstacleGoal('box', 6), createClearObstacleGoal('chain', 2)],
      maxMoves: 19,
      portals: [{ id: 'obstacle-portal', inRow: 3, inCol: 1, outRow: 3, outCol: 6 }],
      initialObstacles: [
        { type: 'box', positions: [{ row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 2, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 6 }] },
        { type: 'chain', positions: [{ row: 3, col: 1 }, { row: 3, col: 2 }] },
      ],
      difficulty: 'hard',
      tutorialHint: '先打开左侧入口，再借传送口把火力送进右侧墙体。 ',
    }),
    createAdventureLevel({
      id: 'obstacle-05',
      name: '蔓延预警',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 5,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      goals: [createClearObstacleGoal('spreader', 3)],
      maxMoves: 16,
      spreaderConfig: {
        initialPositions: [{ row: 2, col: 2 }, { row: 4, col: 5 }, { row: 5, col: 2 }],
        spreadInterval: 2,
      },
      difficulty: 'expert',
      tutorialHint: '这关优先级只有一个：先压蔓延，再谈得分。 ',
    }),
    createAdventureLevel({
      id: 'obstacle-06',
      name: '障碍总测',
      packId: 'obstacle-siege',
      packName: '障碍压制包',
      orderInPack: 6,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      boardTemplateId: 'obstacle-fortress',
      colorWeights: { blue: 2, purple: 2, yellow: 1 },
      goals: [createClearObstacleGoal('stone', 4), createClearObstacleGoal('box', 6), createClearObstacleGoal('spreader', 2)],
      maxMoves: 22,
      initialObstacles: [
        { type: 'stone', positions: [{ row: 3, col: 3 }, { row: 3, col: 5 }, { row: 5, col: 3 }, { row: 5, col: 5 }] },
        { type: 'box', positions: [{ row: 1, col: 4 }, { row: 2, col: 4 }, { row: 4, col: 1 }, { row: 4, col: 7 }, { row: 6, col: 4 }, { row: 7, col: 4 }] },
      ],
      spreaderConfig: {
        initialPositions: [{ row: 2, col: 2 }, { row: 6, col: 6 }],
        spreadInterval: 3,
      },
      difficulty: 'expert',
      tutorialHint: '这是障碍包骨架里的第一张总测关，要求你先拆最挡路的中轴，再收剩余目标。 ',
    }),
  ],
};

const COMBO_CHAIN_PACK: Match3LevelPack = {
  id: 'combo-chain',
  name: '特效连锁包',
  description: '集中练习预置特殊块、组合目标和颜色权重，作为高阶爽点内容骨架。',
  orderInPack: 6,
  unlockCondition: {
    type: 'completePack',
    packId: 'obstacle-siege',
  },
  levels: [
    createAdventureLevel({
      id: 'combo-01',
      name: '十字开场',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 1,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      colorWeights: { red: 3, blue: 3, purple: 2 },
      goals: [createTriggerComboGoal('striped-striped', 1)],
      maxMoves: 6,
      prebuiltSpecials: [
        { row: 3, col: 3, color: 'red', special: 'striped-h' },
        { row: 3, col: 4, color: 'red', special: 'striped-v' },
      ],
      difficulty: 'medium',
      tutorialHint: '这关先体验十字清场，组合目标会直接挂在 HUD 上。 ',
    }),
    createAdventureLevel({
      id: 'combo-02',
      name: '条纹折叠',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 2,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      colorWeights: { purple: 4, yellow: 2 },
      goals: [createTriggerComboGoal('striped-wrapped', 1), createScoreGoal(5200)],
      maxMoves: 7,
      prebuiltSpecials: [
        { row: 3, col: 3, color: 'purple', special: 'striped-h' },
        { row: 3, col: 4, color: 'purple', special: 'wrapped' },
      ],
      difficulty: 'hard',
      tutorialHint: '预置特殊块是教学脚本的一部分，不再只能靠运气等出来。 ',
    }),
    createAdventureLevel({
      id: 'combo-03',
      name: '双包装点火',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 3,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      goals: [createTriggerComboGoal('wrapped-wrapped', 1)],
      maxMoves: 6,
      prebuiltSpecials: [
        { row: 4, col: 3, color: 'blue', special: 'wrapped' },
        { row: 4, col: 4, color: 'blue', special: 'wrapped' },
      ],
      difficulty: 'hard',
      tutorialHint: '双包装属于大片清场组合，用来开被封死的中央区域最稳定。 ',
    }),
    createAdventureLevel({
      id: 'combo-04',
      name: '彩球借火',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 4,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      colorWeights: { green: 4, blue: 3 },
      goals: [createTriggerComboGoal('colorBomb-special', 1)],
      maxMoves: 7,
      prebuiltSpecials: [
        { row: 3, col: 3, color: 'green', special: 'colorBomb' },
        { row: 3, col: 4, color: 'green', special: 'striped-v' },
      ],
      difficulty: 'hard',
      tutorialHint: '彩球加特殊块会把整色都点燃，是这包的核心爽点。 ',
    }),
    createAdventureLevel({
      id: 'combo-05',
      name: '双彩球演练',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 5,
      rows: 8,
      cols: 8,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      goals: [createTriggerComboGoal('colorBomb-colorBomb', 1), createScoreGoal(7000)],
      maxMoves: 8,
      prebuiltSpecials: [
        { row: 2, col: 3, color: 'yellow', special: 'colorBomb' },
        { row: 2, col: 4, color: 'yellow', special: 'colorBomb' },
      ],
      difficulty: 'expert',
      tutorialHint: '双彩球是终极组合，脚本里也必须能直接指定。 ',
    }),
    createAdventureLevel({
      id: 'combo-06',
      name: '连锁结业',
      packId: 'combo-chain',
      packName: '特效连锁包',
      orderInPack: 6,
      rows: 9,
      cols: 9,
      palette: BASIC_PALETTE,
      boardTemplateId: 'combo-latch',
      colorWeights: { red: 4, orange: 3, purple: 2 },
      goals: [createTriggerComboGoal('striped-wrapped', 1), createTriggerComboGoal('colorBomb-special', 1)],
      maxMoves: 10,
      prebuiltSpecials: [
        { row: 4, col: 3, color: 'red', special: 'striped-h' },
        { row: 4, col: 4, color: 'red', special: 'wrapped' },
        { row: 2, col: 6, color: 'orange', special: 'colorBomb' },
        { row: 2, col: 7, color: 'orange', special: 'striped-v' },
      ],
      difficulty: 'expert',
      tutorialHint: '最后一关同时验证脚本预置、权重和复合组合目标。 ',
    }),
  ],
};

export const MATCH3_LEVEL_PACKS: Match3LevelPack[] = [
  BEGINNER_PACK,
  MOVE_STRATEGY_PACK,
  JELLY_CLEAR_PACK,
  DROP_COLLECT_PACK,
  OBSTACLE_SIEGE_PACK,
  COMBO_CHAIN_PACK,
];

export function getAllLevels(): Match3LevelScript[] {
  return MATCH3_LEVEL_PACKS.flatMap((pack) => pack.levels);
}

export function getLevelById(id: string): Match3LevelScript | undefined {
  return getAllLevels().find((level) => level.id === id);
}

export function getPackById(id: string): Match3LevelPack | undefined {
  return MATCH3_LEVEL_PACKS.find((pack) => pack.id === id);
}

export function getLevelsByPack(packId: string): Match3LevelScript[] {
  const pack = getPackById(packId);
  return pack?.levels ?? [];
}

export function convertScriptToConfig(script: Match3LevelScript): Match3LevelConfig {
  return {
    id: script.id,
    name: script.name,
    modeId: script.modeId ?? 'adventure',
    chapterId: script.chapterId ?? script.packId,
    chapterName: script.chapterName ?? script.packName,
    boardTemplateId: script.boardTemplateId,
    rows: script.rows,
    cols: script.cols,
    palette: script.palette,
    colorWeights: script.colorWeights,
    goals: script.goals.map((g) => ({ ...g, current: 0 })),
    maxMoves: script.maxMoves,
    maxTimeMs: script.maxTimeMs,
    initialObstacles: script.initialObstacles,
    portals: script.portals,
    dropItems: script.dropItems,
    dropExits: script.dropExits,
    prebuiltSpecials: script.prebuiltSpecials,
    spreaderConfig: script.spreaderConfig,
    specialBlockChance: script.specialBlockChance,
  };
}

export function getLevelCount(): number {
  return getAllLevels().length;
}

export function getPackCount(): number {
  return MATCH3_LEVEL_PACKS.length;
}

export function getLevelOrder(levelId: string): number {
  const allLevels = getAllLevels();
  return allLevels.findIndex((level) => level.id === levelId) + 1;
}

export function getNextLevel(currentLevelId: string): Match3LevelScript | undefined {
  const allLevels = getAllLevels();
  const currentIndex = allLevels.findIndex((level) => level.id === currentLevelId);
  if (currentIndex >= 0 && currentIndex < allLevels.length - 1) {
    return allLevels[currentIndex + 1];
  }
  return undefined;
}

export function getPreviousLevel(currentLevelId: string): Match3LevelScript | undefined {
  const allLevels = getAllLevels();
  const currentIndex = allLevels.findIndex((level) => level.id === currentLevelId);
  if (currentIndex > 0) {
    return allLevels[currentIndex - 1];
  }
  return undefined;
}

export function isLastLevelInPack(levelId: string): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  const pack = getPackById(level.packId);
  if (!pack) return false;
  return level.orderInPack === pack.levels.length;
}

export function isFirstLevelInPack(levelId: string): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  return level.orderInPack === 1;
}

export function getPackProgress(packId: string, completedLevelIds: string[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const levels = getLevelsByPack(packId);
  const completed = levels.filter((level) => completedLevelIds.includes(level.id)).length;
  return {
    completed,
    total: levels.length,
    percent: Math.round((completed / levels.length) * 100),
  };
}
