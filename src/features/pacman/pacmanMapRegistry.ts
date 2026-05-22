/* 吃豆人关卡目录系统。负责关卡包注册、关卡元数据、关卡选择与解锁逻辑。 */

import type { FruitId, PacmanCompletionRule, PacmanPracticeId } from './pacmanTypes.ts';

/* 关卡包 ID */
export type PacmanPackId = 'arcade' | 'tutorial' | 'fruit_rush' | 'one_life';

/* 关卡包类别 */
export type PacmanPackType = 'arcade' | 'tutorial' | 'challenge' | 'practice' | 'endless';

/* 关卡元数据 */
export interface PacmanLevelMeta {
  levelId: string;
  packId: PacmanPackId;
  levelNumber: number;
  name: string;
  description: string;
  mazeId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  targetScore: number;
  targetTimeMs: number;
  fruitId: FruitId;
  bonusItems: string[];
  tips: string[];
  focusMechanic?: string;
  objective?: string;
  startHint?: string;
  failReasonHints?: string[];
  completionRule?: PacmanCompletionRule;
  recommendedPracticeId?: PacmanPracticeId;
  chapterId?: string;
  modeId?: string;
  goalType?: 'clear' | 'fruit_hunt' | 'one_life_clear';
  goalValue?: number;
  mazeVariantId?: string;
}

/* 关卡包定义 */
export interface PacmanPackDefinition {
  packId: PacmanPackId;
  packType: PacmanPackType;
  name: string;
  description: string;
  levels: PacmanLevelMeta[];
  totalLevels: number;
  isLooping: boolean;
  loopStartLevel: number;
}

/* 经典街机包关卡数据（21关 + 循环） */
const ARCADE_LEVELS: PacmanLevelMeta[] = [
  {
    levelId: 'arcade_01',
    packId: 'arcade',
    levelNumber: 1,
    name: '樱桃关',
    description: '入门关卡，熟悉基本操作',
    mazeId: 'classic',
    difficulty: 'easy',
    targetScore: 10000,
    targetTimeMs: 120000,
    fruitId: 'cherry',
    bonusItems: [],
    tips: ['先吃能量豆再追鬼', '利用传送门快速移动'],
  },
  {
    levelId: 'arcade_02',
    packId: 'arcade',
    levelNumber: 2,
    name: '草莓关',
    description: '鬼魂速度略微提升',
    mazeId: 'classic',
    difficulty: 'easy',
    targetScore: 15000,
    targetTimeMs: 110000,
    fruitId: 'strawberry',
    bonusItems: [],
    tips: ['注意红鬼的追踪路线'],
  },
  {
    levelId: 'arcade_03',
    packId: 'arcade',
    levelNumber: 3,
    name: '橙子关',
    description: 'Frightened时间缩短',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 20000,
    targetTimeMs: 100000,
    fruitId: 'orange',
    bonusItems: [],
    tips: ['能量豆效果时间变短，抓紧吃鬼'],
  },
  {
    levelId: 'arcade_04',
    packId: 'arcade',
    levelNumber: 4,
    name: '苹果关',
    description: '鬼魂速度继续提升',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 25000,
    targetTimeMs: 95000,
    fruitId: 'apple',
    bonusItems: [],
    tips: ['粉鬼会瞄准你前方位置'],
  },
  {
    levelId: 'arcade_05',
    packId: 'arcade',
    levelNumber: 5,
    name: '甜瓜关',
    description: '进入高速阶段',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 30000,
    targetTimeMs: 90000,
    fruitId: 'melon',
    bonusItems: [],
    tips: ['Scatter时间缩短，鬼魂更快进入追击'],
  },
  {
    levelId: 'arcade_06',
    packId: 'arcade',
    levelNumber: 6,
    name: '甜瓜关2',
    description: 'Frightened时间继续缩短',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 35000,
    targetTimeMs: 85000,
    fruitId: 'melon',
    bonusItems: [],
    tips: ['青鬼的目标取决于红鬼位置'],
  },
  {
    levelId: 'arcade_07',
    packId: 'arcade',
    levelNumber: 7,
    name: '银河舰关',
    description: '鬼魂速度接近Pac-Man',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 40000,
    targetTimeMs: 80000,
    fruitId: 'galaxian',
    bonusItems: [],
    tips: ['橙鬼距离近时会逃跑'],
  },
  {
    levelId: 'arcade_08',
    packId: 'arcade',
    levelNumber: 8,
    name: '银河舰关2',
    description: 'Frightened时间仅剩3秒',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 45000,
    targetTimeMs: 75000,
    fruitId: 'galaxian',
    bonusItems: [],
    tips: ['能量豆效果很短，优先吃高分鬼'],
  },
  {
    levelId: 'arcade_09',
    packId: 'arcade',
    levelNumber: 9,
    name: '铃铛关',
    description: 'Pac-Man速度达到最大',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 50000,
    targetTimeMs: 70000,
    fruitId: 'bell',
    bonusItems: [],
    tips: ['速度优势，可以更灵活走位'],
  },
  {
    levelId: 'arcade_10',
    packId: 'arcade',
    levelNumber: 10,
    name: '铃铛关2',
    description: 'Frightened时间仅剩2秒',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 55000,
    targetTimeMs: 65000,
    fruitId: 'bell',
    bonusItems: [],
    tips: ['闪烁预警很短，注意撤退'],
  },
  {
    levelId: 'arcade_11',
    packId: 'arcade',
    levelNumber: 11,
    name: '钥匙关',
    description: '进入钥匙阶段',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 60000,
    targetTimeMs: 60000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['水果价值最高，优先收集'],
  },
  {
    levelId: 'arcade_12',
    packId: 'arcade',
    levelNumber: 12,
    name: '钥匙关2',
    description: 'Frightened时间仅剩1秒',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 65000,
    targetTimeMs: 55000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['能量豆几乎无效果，主要靠走位'],
  },
  {
    levelId: 'arcade_13',
    packId: 'arcade',
    levelNumber: 13,
    name: '钥匙关3',
    description: 'Frightened效果消失',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 70000,
    targetTimeMs: 50000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['能量豆不再让鬼变蓝，只能用来得分'],
  },
  {
    levelId: 'arcade_14',
    packId: 'arcade',
    levelNumber: 14,
    name: '钥匙关4',
    description: '纯走位挑战',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 75000,
    targetTimeMs: 45000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['完全依靠躲避技巧'],
  },
  {
    levelId: 'arcade_15',
    packId: 'arcade',
    levelNumber: 15,
    name: '钥匙关5',
    description: 'Elroy阈值降低',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 80000,
    targetTimeMs: 40000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['红鬼会更早进入加速追击'],
  },
  {
    levelId: 'arcade_16',
    packId: 'arcade',
    levelNumber: 16,
    name: '钥匙关6',
    description: '鬼魂速度持续提升',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 85000,
    targetTimeMs: 35000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['传送门速度也提升'],
  },
  {
    levelId: 'arcade_17',
    packId: 'arcade',
    levelNumber: 17,
    name: '钥匙关7',
    description: '极限挑战',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 90000,
    targetTimeMs: 30000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['每一步都要精确计算'],
  },
  {
    levelId: 'arcade_18',
    packId: 'arcade',
    levelNumber: 18,
    name: '钥匙关8',
    description: '极限挑战',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 95000,
    targetTimeMs: 25000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['鬼魂几乎全程追击'],
  },
  {
    levelId: 'arcade_19',
    packId: 'arcade',
    levelNumber: 19,
    name: '钥匙关9',
    description: '极限挑战',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 100000,
    targetTimeMs: 20000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['Scatter阶段几乎消失'],
  },
  {
    levelId: 'arcade_20',
    packId: 'arcade',
    levelNumber: 20,
    name: '钥匙关10',
    description: '极限挑战',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 105000,
    targetTimeMs: 15000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['纯追击模式'],
  },
  {
    levelId: 'arcade_21',
    packId: 'arcade',
    levelNumber: 21,
    name: '循环关',
    description: '21关后进入循环，参数保持不变',
    mazeId: 'classic',
    difficulty: 'extreme',
    targetScore: 110000,
    targetTimeMs: 10000,
    fruitId: 'key',
    bonusItems: [],
    tips: ['循环关卡参数固定'],
  },
];

/* 路线教学包关卡数据（10关） */
const TUTORIAL_LEVELS: PacmanLevelMeta[] = [
  {
    levelId: 'tutorial_01',
    packId: 'tutorial',
    levelNumber: 1,
    name: '基础移动',
    description: '学习Pac-Man基本移动和转向',
    mazeId: 'classic',
    difficulty: 'easy',
    targetScore: 5000,
    targetTimeMs: 180000,
    fruitId: 'cherry',
    bonusItems: ['转向缓存教学'],
    tips: ['提前按方向键，到达路口自动转向'],
    focusMechanic: '转向缓存',
    objective: '吃到 30 颗豆子，熟悉预输入转向。',
    startHint: '先别贪快，提前半格按方向键过 T 字口。',
    failReasonHints: ['你多半是在路口按晚了，转向提前一点。', '先走安全路线，把 30 颗豆子稳稳拿下。'],
    completionRule: { pelletsCollected: 30 },
    recommendedPracticeId: 'turning_basics',
  },
  {
    levelId: 'tutorial_02',
    packId: 'tutorial',
    levelNumber: 2,
    name: '传送门使用',
    description: '学习传送门穿越技巧',
    mazeId: 'classic',
    difficulty: 'easy',
    targetScore: 8000,
    targetTimeMs: 150000,
    fruitId: 'cherry',
    bonusItems: ['传送门教学'],
    tips: ['传送门可以快速穿越迷宫两侧'],
    focusMechanic: '传送门脱困',
    objective: '至少穿过 1 次传送门，并吃到 40 颗豆子。',
    startHint: '被追时别硬跑直道，主动穿门换侧。',
    failReasonHints: ['如果总被直追，说明传送门用得太晚。', '先完成穿门，再补足剩余豆子。'],
    completionRule: { pelletsCollected: 40, tunnelUses: 1 },
    recommendedPracticeId: 'ghost_escape',
  },
  {
    levelId: 'tutorial_03',
    packId: 'tutorial',
    levelNumber: 3,
    name: '能量豆基础',
    description: '学习能量豆的使用时机',
    mazeId: 'classic',
    difficulty: 'easy',
    targetScore: 12000,
    targetTimeMs: 120000,
    fruitId: 'strawberry',
    bonusItems: ['能量豆教学'],
    tips: ['能量豆让鬼变蓝，可以反过来吃鬼'],
    focusMechanic: '能量豆开窗',
    objective: '借一次能量豆窗口反吃 1 只鬼。',
    startHint: '等鬼靠近再吃大豆，不要在空场白开窗口。',
    failReasonHints: ['能量豆开得太早，鬼还没进攻线。', '先保命，再补追击路径。'],
    completionRule: { ghostsEaten: 1 },
    recommendedPracticeId: 'energizer_chain',
  },
  {
    levelId: 'tutorial_04',
    packId: 'tutorial',
    levelNumber: 4,
    name: '吃鬼技巧',
    description: '学习Frightened状态下的吃鬼策略',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 15000,
    targetTimeMs: 100000,
    fruitId: 'strawberry',
    bonusItems: ['吃鬼计分教学'],
    tips: ['连续吃鬼分数递增：200→400→800→1600'],
    focusMechanic: '吃鬼连分',
    objective: '单局至少吃到 2 只鬼，感受连分收益。',
    startHint: '第一只别追太远，留足窗口给第二只。',
    failReasonHints: ['如果只吃到 1 只鬼，说明追击路径绕远了。', '先在能量豆附近等鬼进线，再一起反打。'],
    completionRule: { ghostsEaten: 2 },
    recommendedPracticeId: 'energizer_chain',
  },
  {
    levelId: 'tutorial_05',
    packId: 'tutorial',
    levelNumber: 5,
    name: '红鬼追踪',
    description: '学习躲避红鬼Blinky',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 18000,
    targetTimeMs: 90000,
    fruitId: 'orange',
    bonusItems: ['红鬼AI教学'],
    tips: ['红鬼直接追踪你的当前位置'],
    focusMechanic: '红鬼直追',
    objective: '在红鬼高压下坚持 25 秒并吃到 60 颗豆子。',
    startHint: '别钻长直道，优先用外圈拉开红鬼。',
    failReasonHints: ['红鬼压线时不要硬跑直道。', '被逼到下方死角就先掉头绕外圈。'],
    completionRule: { surviveMs: 25000, pelletsCollected: 60 },
    recommendedPracticeId: 'ghost_escape',
  },
  {
    levelId: 'tutorial_06',
    packId: 'tutorial',
    levelNumber: 6,
    name: '粉鬼预判',
    description: '学习躲避粉鬼Pinky',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 22000,
    targetTimeMs: 80000,
    fruitId: 'orange',
    bonusItems: ['粉鬼AI教学'],
    tips: ['粉鬼默认瞄准你前方4格；朝上时按原版 bug 会偏到左前方4格'],
    focusMechanic: '粉鬼预判',
    objective: '在粉鬼截线路线上坚持 30 秒并吃到 70 颗豆子。',
    startHint: '你朝上走时，它会往左前方4格抢位，别把上路当直线。',
    failReasonHints: ['粉鬼不是直追，它会提前卡你前方。', '如果一直往上冲，记得预判左前方的拦截线。'],
    completionRule: { surviveMs: 30000, pelletsCollected: 70 },
    recommendedPracticeId: 'turning_basics',
  },
  {
    levelId: 'tutorial_07',
    packId: 'tutorial',
    levelNumber: 7,
    name: '青鬼配合',
    description: '学习躲避青鬼Inky',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 26000,
    targetTimeMs: 70000,
    fruitId: 'apple',
    bonusItems: ['青鬼AI教学'],
    tips: ['青鬼目标取决于红鬼和你前方位置的向量'],
    focusMechanic: '青鬼夹击',
    objective: '扛住 32 秒夹击并吃到 80 颗豆子。',
    startHint: '看见红鬼靠近时，默认青鬼会补你逃生线。',
    failReasonHints: ['青鬼会跟着红鬼一起封路线，别只盯最近那只。', '感觉路线被斜插时，先换边再清豆。'],
    completionRule: { surviveMs: 32000, pelletsCollected: 80 },
    recommendedPracticeId: 'ghost_escape',
  },
  {
    levelId: 'tutorial_08',
    packId: 'tutorial',
    levelNumber: 8,
    name: '橙鬼逃跑',
    description: '学习躲避橙鬼Clyde',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 30000,
    targetTimeMs: 60000,
    fruitId: 'apple',
    bonusItems: ['橙鬼AI教学'],
    tips: ['橙鬼距离近时会逃跑，距离远时追击'],
    focusMechanic: '橙鬼变节奏',
    objective: '在橙鬼来回切换里坚持 35 秒并吃到 90 颗豆子。',
    startHint: '故意靠近它能把它赶回角落，别被假压力骗走位。',
    failReasonHints: ['橙鬼贴脸时会逃，不用像红鬼那样急着撤。', '它一远离就会回来追，别在回头路上停太久。'],
    completionRule: { surviveMs: 35000, pelletsCollected: 90 },
    recommendedPracticeId: 'ghost_escape',
  },
  {
    levelId: 'tutorial_09',
    packId: 'tutorial',
    levelNumber: 9,
    name: '模式时序',
    description: '学习Scatter/Chase周期规律',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 35000,
    targetTimeMs: 50000,
    fruitId: 'melon',
    bonusItems: ['模式时序教学'],
    tips: ['鬼魂会周期性散开和追击，利用散开期清豆'],
    focusMechanic: 'Scatter / Chase 节奏',
    objective: '扛过一次完整节奏切换，并吃到 100 颗豆子。',
    startHint: '散开期清危险区，追击期只做保命路线。',
    failReasonHints: ['如果一切换就出事，说明清豆节奏还没分区。', '别把追击期当成冲分窗口，先守住路线。'],
    completionRule: { surviveMs: 45000, pelletsCollected: 100 },
    recommendedPracticeId: 'timing_read',
  },
  {
    levelId: 'tutorial_10',
    packId: 'tutorial',
    levelNumber: 10,
    name: '综合挑战',
    description: '综合运用所有技巧',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 40000,
    targetTimeMs: 40000,
    fruitId: 'melon',
    bonusItems: ['综合教学'],
    tips: ['结合所有技巧完成挑战'],
    focusMechanic: '综合执行',
    objective: '至少吃到 140 颗豆子，并完成 1 次传送门脱困。',
    startHint: '先稳路线，再看能量豆和传送门怎么串联。',
    failReasonHints: ['综合关别贪单点收益，优先守住主路线。', '一旦被压到死角，就立刻用门换边。'],
    completionRule: { pelletsCollected: 140, tunnelUses: 1 },
    recommendedPracticeId: 'timing_read',
  },
];

/* 水果冲分包关卡数据（4关） */
const FRUIT_RUSH_LEVELS: PacmanLevelMeta[] = [
  {
    levelId: 'fruit_rush_01',
    packId: 'fruit_rush',
    levelNumber: 1,
    name: '首果开路',
    description: '先把中央果路打通，拿到第一颗水果再脱出。',
    mazeId: 'fruit_rush',
    difficulty: 'easy',
    targetScore: 9000,
    targetTimeMs: 85000,
    fruitId: 'cherry',
    bonusItems: ['果路迷宫', '首果窗口'],
    tips: ['先清中央短路，再等首果刷出', '不要为首果硬穿长直道'],
    focusMechanic: '首果进出线',
    objective: '收下 1 颗水果，并至少吃到 90 颗豆子。',
    startHint: '先把中央的近路打通，再接第一颗果。 ',
    failReasonHints: ['错过首果多半是中央路线没提前清开。', '拿果时先保证出口，不要在中路停顿。'],
    completionRule: { pelletsCollected: 90, fruitsCollected: 1 },
    recommendedPracticeId: 'energizer_chain',
    chapterId: 'F1',
    modeId: 'fruit_rush',
    goalType: 'fruit_hunt',
    goalValue: 1,
    mazeVariantId: 'fruit_rush',
  },
  {
    levelId: 'fruit_rush_02',
    packId: 'fruit_rush',
    levelNumber: 2,
    name: '双果压缩',
    description: '两次水果窗口都要拿，开始压缩绕路成本。',
    mazeId: 'fruit_rush',
    difficulty: 'medium',
    targetScore: 13000,
    targetTimeMs: 78000,
    fruitId: 'strawberry',
    bonusItems: ['双果路线'],
    tips: ['第一颗果别绕太深，第二颗才是收益核心', '尾豆别留在红鬼加压的长廊里'],
    focusMechanic: '双果收益',
    objective: '收下 2 颗水果，并至少吃到 120 颗豆子。',
    startHint: '第一颗果只拿近线，保住第二次窗口。 ',
    failReasonHints: ['如果第二颗总拿不到，说明第一段绕路太贪。', '先压缩尾豆区，再等第二颗果刷新。'],
    completionRule: { pelletsCollected: 120, fruitsCollected: 2 },
    recommendedPracticeId: 'ghost_escape',
    chapterId: 'F1',
    modeId: 'fruit_rush',
    goalType: 'fruit_hunt',
    goalValue: 2,
    mazeVariantId: 'fruit_rush',
  },
  {
    levelId: 'fruit_rush_03',
    packId: 'fruit_rush',
    levelNumber: 3,
    name: '贴线取果',
    description: '在鬼压线阶段决定拿果还是保线。',
    mazeId: 'fruit_rush',
    difficulty: 'hard',
    targetScore: 18000,
    targetTimeMs: 70000,
    fruitId: 'orange',
    bonusItems: ['压线决策'],
    tips: ['不是每次都该硬拿果', '先保证能从中央切出去'],
    focusMechanic: '压力取果',
    objective: '收下 1 颗水果，并坚持存活 45 秒。',
    startHint: '看红鬼位置，确认中央出口再进果线。 ',
    failReasonHints: ['如果总在果线里被夹，说明进场时机太晚。', '先借 Scatter 进果线，不要硬顶 Chase。'],
    completionRule: { surviveMs: 45000, fruitsCollected: 1 },
    recommendedPracticeId: 'timing_read',
    chapterId: 'F2',
    modeId: 'fruit_rush',
    goalType: 'fruit_hunt',
    goalValue: 1,
    mazeVariantId: 'fruit_rush',
  },
  {
    levelId: 'fruit_rush_04',
    packId: 'fruit_rush',
    levelNumber: 4,
    name: '尾豆抢果',
    description: '尾豆风险已经抬高，果线收益必须一次打满。',
    mazeId: 'fruit_rush',
    difficulty: 'hard',
    targetScore: 24000,
    targetTimeMs: 62000,
    fruitId: 'apple',
    bonusItems: ['尾豆管理'],
    tips: ['先决定哪块尾豆最后清', '中央进出要比单次得分更重要'],
    focusMechanic: '尾豆与果线取舍',
    objective: '收下 2 颗水果，并至少吃到 150 颗豆子。',
    startHint: '留一片安全尾豆，别把自己锁死在果路里。 ',
    failReasonHints: ['尾豆和果线不能同时贪，先定主目标。', '如果第二次总翻车，说明第一段清图太散。'],
    completionRule: { pelletsCollected: 150, fruitsCollected: 2 },
    recommendedPracticeId: 'timing_read',
    chapterId: 'F2',
    modeId: 'fruit_rush',
    goalType: 'fruit_hunt',
    goalValue: 2,
    mazeVariantId: 'fruit_rush',
  },
];

/* 一命挑战包关卡数据（4关） */
const ONE_LIFE_LEVELS: PacmanLevelMeta[] = [
  {
    levelId: 'one_life_01',
    packId: 'one_life',
    levelNumber: 1,
    name: '三线保守',
    description: '单命起手，只求稳稳清图，不给第一条命送掉。',
    mazeId: 'classic',
    difficulty: 'medium',
    targetScore: 12000,
    targetTimeMs: 95000,
    fruitId: 'cherry',
    bonusItems: ['一命规则'],
    tips: ['别为了第一颗果离开安全线', '角豆保一个做兜底'],
    focusMechanic: '一命起手',
    objective: '只靠 1 条命清完本关。',
    startHint: '先走稳路线，别把开局做成追分局。 ',
    failReasonHints: ['一命局里，保线永远高于追分。', '先留一个能量豆做兜底。'],
    recommendedPracticeId: 'ghost_escape',
    chapterId: 'O1',
    modeId: 'one_life',
    goalType: 'one_life_clear',
    goalValue: 1,
    mazeVariantId: 'classic',
  },
  {
    levelId: 'one_life_02',
    packId: 'one_life',
    levelNumber: 2,
    name: '果路稳态',
    description: '换到果路迷宫后，仍然只能用一条命把路线守住。',
    mazeId: 'fruit_rush',
    difficulty: 'hard',
    targetScore: 17000,
    targetTimeMs: 82000,
    fruitId: 'strawberry',
    bonusItems: ['果路迷宫'],
    tips: ['果路迷宫更适合贴边走，不要久留中央', '宁可放果，也别丢命'],
    focusMechanic: '变体迷宫稳态',
    objective: '在果路迷宫里单命清图。',
    startHint: '先把中央通路摸熟，再决定哪次果值得进。 ',
    failReasonHints: ['一命模式里，进中央前先确认出口。', '感觉路线断掉就先撤，不要硬补分。'],
    recommendedPracticeId: 'timing_read',
    chapterId: 'O1',
    modeId: 'one_life',
    goalType: 'one_life_clear',
    goalValue: 2,
    mazeVariantId: 'fruit_rush',
  },
  {
    levelId: 'one_life_03',
    packId: 'one_life',
    levelNumber: 3,
    name: '中压连战',
    description: '连续高压下保持稳定，不能靠奖励命续关。',
    mazeId: 'classic',
    difficulty: 'hard',
    targetScore: 22000,
    targetTimeMs: 76000,
    fruitId: 'orange',
    bonusItems: ['奖励命禁用'],
    tips: ['中盘别被第二颗果引到坏走廊', '红鬼加压后优先保尾豆节奏'],
    focusMechanic: '压力续航',
    objective: '继续单命推进到第 3 关。',
    startHint: '把这关当成长线续航，不要为了单次收益打散节奏。 ',
    failReasonHints: ['压力起来后，先守尾豆再谈果。', '没有奖励命时，失误代价会放大。'],
    recommendedPracticeId: 'ghost_escape',
    chapterId: 'O2',
    modeId: 'one_life',
    goalType: 'one_life_clear',
    goalValue: 3,
    mazeVariantId: 'classic',
  },
  {
    levelId: 'one_life_04',
    packId: 'one_life',
    levelNumber: 4,
    name: '终局冲线',
    description: '最后一关把果路和尾豆风险一起压进一条命里。',
    mazeId: 'fruit_rush',
    difficulty: 'extreme',
    targetScore: 28000,
    targetTimeMs: 68000,
    fruitId: 'apple',
    bonusItems: ['尾豆高压'],
    tips: ['果线只是加分，不是强制任务', '先保出口，再考虑第二颗果'],
    focusMechanic: '一命终局',
    objective: '单命打穿第 4 关，别在尾豆区送掉最后机会。',
    startHint: '最后一关别抢开局节奏，先确认两条可退路线。 ',
    failReasonHints: ['终局更考验稳态，不要被果线诱导失位。', '尾豆剩多时，优先清最难回头的那片。'],
    recommendedPracticeId: 'timing_read',
    chapterId: 'O2',
    modeId: 'one_life',
    goalType: 'one_life_clear',
    goalValue: 4,
    mazeVariantId: 'fruit_rush',
  },
];

/* 关卡包注册表 */
export const PACK_REGISTRY: Record<string, PacmanPackDefinition> = {
  arcade: {
    packId: 'arcade',
    packType: 'arcade',
    name: '经典街机包',
    description: '原版街机21关 + 循环关卡，难度递增',
    levels: ARCADE_LEVELS,
    totalLevels: 21,
    isLooping: true,
    loopStartLevel: 21,
  },
  tutorial: {
    packId: 'tutorial',
    packType: 'tutorial',
    name: '路线教学包',
    description: '10关教学关卡，逐步学习各项技巧',
    levels: TUTORIAL_LEVELS,
    totalLevels: 10,
    isLooping: false,
    loopStartLevel: 0,
  },
  fruit_rush: {
    packId: 'fruit_rush',
    packType: 'challenge',
    name: '水果冲分包',
    description: '围绕水果进出线和收益取舍的专项挑战。',
    levels: FRUIT_RUSH_LEVELS,
    totalLevels: 4,
    isLooping: false,
    loopStartLevel: 0,
  },
  one_life: {
    packId: 'one_life',
    packType: 'challenge',
    name: '一命挑战包',
    description: '只给一条命，不给奖励命，考验整段稳定性。',
    levels: ONE_LIFE_LEVELS,
    totalLevels: 4,
    isLooping: false,
    loopStartLevel: 0,
  },
};

/* 获取关卡包定义 */
export function getPackDefinition(packId: string): PacmanPackDefinition | null {
  return PACK_REGISTRY[packId] || null;
}

/* 获取关卡元数据 */
export function getLevelMeta(packId: string, levelNumber: number): PacmanLevelMeta | null {
  const pack = getPackDefinition(packId);
  if (!pack) return null;

  if (pack.isLooping && levelNumber > pack.totalLevels) {
    const loopLevel = pack.levels[pack.levels.length - 1];
    return {
      ...loopLevel,
      levelNumber,
      name: `循环关 ${levelNumber}`,
    };
  }

  const levelIndex = levelNumber - 1;
  if (levelIndex < 0 || levelIndex >= pack.levels.length) return null;

  return pack.levels[levelIndex];
}

/* 获取所有关卡包列表 */
export function getAllPacks(): PacmanPackDefinition[] {
  return Object.values(PACK_REGISTRY);
}

/* 判断关卡包是否采用一命规则。 */
export function isSingleLifePack(packId: string): boolean {
  return packId === 'one_life';
}

/* 获取关卡包内的关卡列表 */
export function getPackLevels(packId: string): PacmanLevelMeta[] {
  const pack = getPackDefinition(packId);
  return pack ? pack.levels : [];
}

/* 检查关卡是否存在 */
export function isLevelValid(packId: string, levelNumber: number): boolean {
  const pack = getPackDefinition(packId);
  if (!pack) return false;

  if (pack.isLooping) return levelNumber >= 1;
  return levelNumber >= 1 && levelNumber <= pack.totalLevels;
}

/* 获取关卡显示名称 */
export function getLevelDisplayName(packId: string, levelNumber: number): string {
  const meta = getLevelMeta(packId, levelNumber);
  if (!meta) return `关卡 ${levelNumber}`;
  return `${meta.levelNumber}. ${meta.name}`;
}

/* 获取关卡难度标签 */
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    extreme: '极限',
  };
  return labels[difficulty] || difficulty;
}

/* 获取关卡水果 */
export function getLevelFruit(levelNumber: number): FruitId {
  if (levelNumber <= 21) {
    const arcadeMeta = getLevelMeta('arcade', levelNumber);
    if (arcadeMeta) return arcadeMeta.fruitId;
  }
  return 'key';
}

/* 获取关卡调优参数索引（用于循环关） */
export function getLevelTuningIndex(levelNumber: number): number {
  if (levelNumber <= 21) return levelNumber - 1;
  return 20;
}
