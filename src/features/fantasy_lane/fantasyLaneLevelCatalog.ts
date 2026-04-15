import type {
  FantasyLaneBossDef,
  FantasyLaneChapterDefinition,
  FantasyLaneHeroId,
  FantasyLaneLaneId,
  FantasyLaneLevelDefinition,
  FantasyLanePhaseDef,
  FantasyLaneSpawnGroup,
} from './fantasyLaneTypes.ts';

const CHAPTERS: FantasyLaneChapterDefinition[] = [
  { id: 'chapter-1', order: 1, name: '哥布林边境', theme: '杂兵海与基础稳线', focus: '补前排、补群伤、理解三格指令队列', bossName: '骸骨巨王', summary: '第一章负责教会玩家先站住线，再谈输出。' },
  { id: 'chapter-2', order: 2, name: '亡骨荒原', theme: '召唤、复起与持续消耗', focus: '群伤处理召唤海，并在长线压力下持续补线', bossName: '亡骨祭司', summary: '第二章让玩家学会处理持续召唤与拖线。' },
  { id: 'chapter-3', order: 3, name: '冰霜峡谷', theme: '空袭与冻结', focus: '补对空、留技能、理解空层独立结算', bossName: '冰霜巨龙', summary: '第三章正式把空层和控场压进主线。' },
  { id: 'chapter-4', order: 4, name: '熔火山口', theme: '重甲推进与地面爆压', focus: '破甲、攻城和高费转折', bossName: '熔岩暴君', summary: '第四章强调重装与高费转折。' },
  { id: 'chapter-5', order: 5, name: '龙火王庭', theme: '空地混编与最终收口', focus: '综合阵容、技能时机和终结兵窗口', bossName: '赤焰龙皇', summary: '第五章是完整阵容与节奏判断的总考试。' },
];

interface ChapterTemplate {
  chapterId: string;
  chapterName: string;
  enemyPool: string[];
  suggestedHeroes: FantasyLaneHeroId[];
  timeLimitMs: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  startingGold: number;
  bossUnitId: string;
  bossWarning: string;
}

const CHAPTER_TEMPLATES: ChapterTemplate[] = [
  { chapterId: 'chapter-1', chapterName: '哥布林边境', enemyPool: ['goblin_shield', 'archer', 'crypt_crawler', 'flame_warlock', 'orc_heavy'], suggestedHeroes: ['warlord'], timeLimitMs: 360000, playerBaseHp: 3000, enemyBaseHp: 2600, startingGold: 140, bossUnitId: 'ogre_lord', bossWarning: '骸骨巨王入场，先稳线再交爆发。' },
  { chapterId: 'chapter-2', chapterName: '亡骨荒原', enemyPool: ['crypt_crawler', 'plague_thrower', 'goblin_shield', 'orc_heavy', 'musketeer'], suggestedHeroes: ['warlord', 'archmage'], timeLimitMs: 390000, playerBaseHp: 3000, enemyBaseHp: 3000, startingGold: 132, bossUnitId: 'tree_ancient', bossWarning: '亡骨祭司开始召唤海，别把技能交空。' },
  { chapterId: 'chapter-3', chapterName: '冰霜峡谷', enemyPool: ['bat_swarm', 'young_dragon', 'orc_heavy', 'ice_witch', 'elf_shooter'], suggestedHeroes: ['archmage', 'dragon_rider'], timeLimitMs: 420000, playerBaseHp: 3000, enemyBaseHp: 3200, startingGold: 124, bossUnitId: 'fire_dragon', bossWarning: '冰霜巨龙升空，优先守住空层。' },
  { chapterId: 'chapter-4', chapterName: '熔火山口', enemyPool: ['stone_guard', 'thunder_mage', 'tree_ancient', 'ogre_lord', 'flame_warlock'], suggestedHeroes: ['warlord', 'archmage'], timeLimitMs: 450000, playerBaseHp: 3100, enemyBaseHp: 3500, startingGold: 126, bossUnitId: 'ogre_lord', bossWarning: '熔岩暴君开始地面强压，记得留破甲和护线。' },
  { chapterId: 'chapter-5', chapterName: '龙火王庭', enemyPool: ['fire_dragon', 'young_dragon', 'stone_guard', 'ballista', 'shadow_assassin'], suggestedHeroes: ['dragon_rider', 'warlord'], timeLimitMs: 480000, playerBaseHp: 3200, enemyBaseHp: 4200, startingGold: 150, bossUnitId: 'fire_dragon', bossWarning: '赤焰龙皇降临，空地混压会一起到。' },
];

const LEVEL_NAME_ROWS = [
  ['稳线入门', '杂兵海', '重甲来袭', '技能急救', '前线考试', 'Boss 战'],
  ['亡骨复起', '召唤狂潮', '压线推进', '骨墙突破', '墓地风暴', '祭司战'],
  ['第一波空袭', '冻前排', '双层压力', '空军考试', '冰龙前夜', '巨龙战'],
  ['熔岩重装', '爆裂雷阵', '裂地推进', '熔火总攻', '破甲考试', '暴君战'],
  ['王庭压制', '焚天空袭', '大怪集群', '双技能协同', '王庭决战前', '终局战'],
] as const;

const LEVEL_HINT_ROWS = [
  ['优先补前排，再用后排慢慢把线推回去。', '一味堆单体输出会被小怪海淹住。', '看到重甲就要准备破甲位。', '技能不是装饰，留给真正顶不住的时候。', '把节奏打顺，前中后排都要齐。', 'Boss 前的战线比伤害数字更重要。'],
  ['这章开始会持续消耗，不是爆一波就结束。', '群伤和稳线要同时存在，缺一个都会掉线。', '敌人会拖着你打长线，别空存金币。', '看到骨墙就补破甲，不要硬熬。', '技能要留给中段真正危险的召唤叠压。', '先守住第一轮召唤，后面才有输出窗口。'],
  ['空层已经是正式战场，至少带两张对空。', '被冻住时不要硬拼，先保基地。', '地面与空层会一起给压力，阵容别偏科。', '这关就是对空考试，缺位会被直接压穿。', '留控制给空层大怪，不然前线会被拖死。', '巨龙阶段会反复升空，别指望纯地面赢。'],
  ['从这里开始没有破甲就很难打。', '大面积爆压要靠盾和稳线技能化解。', '巨型单位出现后，要提前留终结位窗口。', '总攻窗口比硬顶更重要，别乱按技能。', '这关测的是破甲与群伤能不能一起成立。', '暴君本体很厚，先别让前线塌。'],
  ['整套阵容都要能工作，缺口会被放大。', '空层高压会迫使你持续补对空。', '终结兵 timing 不对，再厚的阵容也收不了口。', '两个技能都要打在真节点上，别一起空交。', '决战前夜要准备一套真正能收尾的阵容。', '终局考的是全局节奏，不是单点爆发。'],
] as const;

const LEVEL_TAG_ROWS = [
  [['frontline'], ['frontline', 'aoe'], ['pierce'], ['frontline', 'heal'], ['frontline', 'aoe'], ['frontline', 'burst']],
  [['aoe'], ['aoe', 'frontline'], ['frontline'], ['pierce', 'frontline'], ['aoe', 'frontline'], ['aoe', 'burst']],
  [['antiAir'], ['slow', 'frontline'], ['antiAir', 'frontline'], ['antiAir', 'slow'], ['antiAir', 'pierce'], ['antiAir', 'finisher']],
  [['pierce', 'frontline'], ['frontline', 'shield'], ['siege', 'frontline'], ['finisher'], ['pierce', 'aoe'], ['pierce', 'frontline']],
  [['frontline', 'antiAir'], ['antiAir'], ['finisher'], ['antiAir', 'haste'], ['finisher', 'pierce'], ['antiAir', 'finisher', 'pierce']],
] as const;

function createSpawnGroup(id: string, unitId: string, firstDelaySec: number, count: number, intervalSec: number, laneOverride?: FantasyLaneLaneId): FantasyLaneSpawnGroup {
  return { id, side: 'enemy', unitId, firstDelaySec, count, intervalSec, laneOverride };
}

function createNormalPhases(levelId: string, template: ChapterTemplate, levelIndex: number): FantasyLanePhaseDef[] {
  const [a, b, c] = template.enemyPool;

  return [
    {
      id: `${levelId}-open`,
      label: '读题试探',
      startAtSec: 0,
      endAtSec: 55,
      pressure: 'read',
      spawnGroups: [createSpawnGroup(`${levelId}-open-a`, a, 6, 3 + levelIndex, 6 - Math.min(levelIndex, 2))],
      scriptedEvents: [{ id: `${levelId}-warn-open`, when: 'time', compare: '==', value: 6, once: true, actions: [{ type: 'showWarning', text: `本关重心：${LEVEL_TAG_ROWS[Number.parseInt(template.chapterId.replace('chapter-', ''), 10) - 1][levelIndex - 1].join(' / ')}` }] }],
    },
    {
      id: `${levelId}-mid`,
      label: '中段对推',
      startAtSec: 55,
      endAtSec: 180,
      pressure: 'contest',
      spawnGroups: [createSpawnGroup(`${levelId}-mid-a`, a, 4, 4 + levelIndex, 4.4), createSpawnGroup(`${levelId}-mid-b`, b, 16, 3 + levelIndex, 10)],
    },
    {
      id: `${levelId}-final`,
      label: '尾段加压',
      startAtSec: 180,
      pressure: 'pressure',
      spawnGroups: [createSpawnGroup(`${levelId}-final-b`, b, 6, 4 + levelIndex, 5.5), createSpawnGroup(`${levelId}-final-c`, c, 18, 2 + levelIndex, 14)],
      scriptedEvents: [{ id: `${levelId}-warn-final`, when: 'time', compare: '==', value: 184, once: true, actions: [{ type: 'showWarning', text: '尾段加压开始，准备留技能或高费收口。' }] }],
    },
  ];
}

function createBoss(levelId: string, template: ChapterTemplate): FantasyLaneBossDef {
  return {
    id: `${levelId}-boss`,
    name: CHAPTERS.find((chapter) => chapter.id === template.chapterId)?.bossName ?? 'Boss',
    unitId: template.bossUnitId,
    phases: [
      { id: `${levelId}-boss-phase-1`, hpThreshold: 100, enterWarning: 'Boss 入场，先稳住第一波。', skills: ['opening-pressure'] },
      { id: `${levelId}-boss-phase-2`, hpThreshold: 70, enterWarning: 'Boss 转阶段，随从和技能会一起进场。', skills: ['summon-wave'], phaseSpawnGroups: [createSpawnGroup(`${levelId}-boss-wave-2a`, template.enemyPool[1], 2, 2, 4), createSpawnGroup(`${levelId}-boss-wave-2b`, template.enemyPool[2], 4, 2, 6)] },
      { id: `${levelId}-boss-phase-3`, hpThreshold: 35, enterWarning: 'Boss 狂暴，必须抓住最后一轮总攻窗口。', skills: ['enrage'], phaseSpawnGroups: [createSpawnGroup(`${levelId}-boss-wave-3`, template.enemyPool[0], 2, 4, 3)] },
    ],
  };
}

function createBossPhases(levelId: string, template: ChapterTemplate): FantasyLanePhaseDef[] {
  return [
    {
      id: `${levelId}-opening`,
      label: '王庭前压',
      startAtSec: 0,
      endAtSec: 95,
      pressure: 'contest',
      spawnGroups: [createSpawnGroup(`${levelId}-opening-a`, template.enemyPool[0], 8, 4, 5.5), createSpawnGroup(`${levelId}-opening-b`, template.enemyPool[1], 18, 3, 9)],
    },
    {
      id: `${levelId}-boss-enter`,
      label: 'Boss 登场',
      startAtSec: 95,
      pressure: 'boss',
      spawnGroups: [createSpawnGroup(`${levelId}-boss-core`, template.bossUnitId, 2, 1, 999)],
      scriptedEvents: [{ id: `${levelId}-boss-warning`, when: 'time', compare: '==', value: 95, once: true, actions: [{ type: 'showWarning', text: template.bossWarning }] }],
    },
  ];
}

function createLevel(template: ChapterTemplate, levelIndex: number): FantasyLaneLevelDefinition {
  const chapterOrder = Number.parseInt(template.chapterId.replace('chapter-', ''), 10);
  const levelId = `${chapterOrder}-${levelIndex}`;
  const isBoss = levelIndex === 6;

  return {
    id: levelId,
    chapterId: template.chapterId,
    chapterName: template.chapterName,
    indexInChapter: levelIndex,
    name: LEVEL_NAME_ROWS[chapterOrder - 1][levelIndex - 1],
    description: `${CHAPTERS[chapterOrder - 1].theme}。第 ${levelIndex} 关聚焦 ${LEVEL_TAG_ROWS[chapterOrder - 1][levelIndex - 1].join(' / ')}。`,
    battleTimeLimitMs: template.timeLimitMs,
    playerBaseHp: template.playerBaseHp + (levelIndex > 3 && !isBoss ? 80 : 0),
    enemyBaseHp: template.enemyBaseHp + (levelIndex - 1) * (chapterOrder * 80),
    startingGold: template.startingGold + (levelIndex > 4 ? 10 : 0),
    enemyPressure: Math.min(5, chapterOrder + Math.floor(levelIndex / 2)),
    enemyPool: template.enemyPool,
    recommendedTags: [...LEVEL_TAG_ROWS[chapterOrder - 1][levelIndex - 1]],
    suggestedHeroes: template.suggestedHeroes,
    hint: LEVEL_HINT_ROWS[chapterOrder - 1][levelIndex - 1],
    phases: isBoss ? createBossPhases(levelId, template) : createNormalPhases(levelId, template, levelIndex),
    boss: isBoss ? createBoss(levelId, template) : undefined,
    ratingRules: { threeStarBaseHpPercent: 75, twoStarBaseHpPercent: 50 },
    failureHints: {
      lowFrontline: '前线扛不住时，不要继续空存金币，先补肉盾与稳线位。',
      lowAntiAir: '这关空层压力很明显，至少留两张对空位。',
      lowAoE: '敌人是成团给压，不补群伤会被海量小怪拖死。',
      overSavingGold: '资源顶到高位时回费会衰减，别把金币一直攒在手里。',
      lateSkillUse: '技能应该打在压力节点，不要等基地见底才按。',
    },
    unlockReward: isBoss ? `章节突破：${CHAPTERS[chapterOrder - 1].bossName}` : undefined,
  };
}

export const FANTASY_LANE_CHAPTERS = CHAPTERS;
export const FANTASY_LANE_LEVELS: FantasyLaneLevelDefinition[] = CHAPTER_TEMPLATES.flatMap((template) => Array.from({ length: 6 }, (_, index) => createLevel(template, index + 1)));
export const FANTASY_LANE_LEVEL_MAP = Object.fromEntries(FANTASY_LANE_LEVELS.map((level) => [level.id, level])) as Record<string, FantasyLaneLevelDefinition>;

export function getFantasyLaneChapters(): FantasyLaneChapterDefinition[] {
  return FANTASY_LANE_CHAPTERS;
}

export function getFantasyLaneLevels(): FantasyLaneLevelDefinition[] {
  return FANTASY_LANE_LEVELS;
}

export function getFantasyLaneLevelById(levelId: string): FantasyLaneLevelDefinition {
  return FANTASY_LANE_LEVEL_MAP[levelId] ?? FANTASY_LANE_LEVELS[0];
}

export function getFantasyLaneLevelsByChapter(chapterId: string): FantasyLaneLevelDefinition[] {
  return FANTASY_LANE_LEVELS.filter((level) => level.chapterId === chapterId);
}
