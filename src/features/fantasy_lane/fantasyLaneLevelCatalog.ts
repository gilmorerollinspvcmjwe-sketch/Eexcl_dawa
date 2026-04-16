/* 这个文件负责奇幻战线的章节与关卡目录，供运行时、进度和测试共同读取。 */
import type {
  FantasyLaneBossDef,
  FantasyLaneChapterDefinition,
  FantasyLaneHeroId,
  FantasyLaneLaneId,
  FantasyLaneLevelDefinition,
  FantasyLanePhaseDef,
  FantasyLanePressure,
  FantasyLaneSpawnGroup,
} from './fantasyLaneTypes.ts';

interface SpawnBlueprint {
  unitId: string;
  firstDelaySec: number;
  count: number;
  intervalSec: number;
  laneOverride?: FantasyLaneLaneId;
  note: string;
}

interface PhaseBlueprint {
  label: string;
  startAtSec: number;
  endAtSec?: number;
  pressure: FantasyLanePressure;
  warning: string;
  spawnGroups: SpawnBlueprint[];
}

interface BossPhaseBlueprint {
  hpThreshold: number;
  enterWarning: string;
  skills: string[];
  spawnGroups: SpawnBlueprint[];
}

interface LevelBlueprint {
  name: string;
  hint: string;
  recommendedTags: string[];
  description: string;
  phases: PhaseBlueprint[];
  bossPhases?: BossPhaseBlueprint[];
  unlockRewards?: string[];
  fragmentRewards?: Record<string, number>;
  starRewards?: Record<number, string[]>;
}

interface ChapterBlueprint {
  chapter: FantasyLaneChapterDefinition;
  enemyPool: string[];
  suggestedHeroes: FantasyLaneHeroId[];
  timeLimitMs: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  startingGold: number;
  bossUnitId: string;
  bossWarning: string;
  levels: LevelBlueprint[];
}

function createSpawnGroup(
  levelId: string,
  phaseIndex: number,
  spawnIndex: number,
  spawn: SpawnBlueprint,
): FantasyLaneSpawnGroup {
  return {
    id: `${levelId}-p${phaseIndex + 1}-s${spawnIndex + 1}`,
    side: 'enemy',
    unitId: spawn.unitId,
    firstDelaySec: spawn.firstDelaySec,
    count: spawn.count,
    intervalSec: spawn.intervalSec,
    laneOverride: spawn.laneOverride,
    note: spawn.note,
  };
}

function createPhaseDefinitions(levelId: string, phases: PhaseBlueprint[]): FantasyLanePhaseDef[] {
  return phases.map((phase, phaseIndex) => ({
    id:
      phases.length === 3
        ? `${levelId}-${phaseIndex === 0 ? 'open' : phaseIndex === 1 ? 'mid' : 'final'}`
        : `${levelId}-${phaseIndex === 0 ? 'open' : phaseIndex === 1 ? 'mid' : phaseIndex === 2 ? 'boss-enter' : 'last-stand'}`,
    label: phase.label,
    startAtSec: phase.startAtSec,
    endAtSec: phase.endAtSec,
    pressure: phase.pressure,
    spawnGroups: phase.spawnGroups.map((spawn, spawnIndex) => createSpawnGroup(levelId, phaseIndex, spawnIndex, spawn)),
    scriptedEvents: [
      {
        id: `${levelId}-phase-${phaseIndex + 1}-warning`,
        when: 'time',
        compare: '==',
        value: Math.max(phase.startAtSec + 4, 4),
        once: true,
        actions: [{ type: 'showWarning', text: phase.warning }],
      },
    ],
  }));
}

function createBoss(levelId: string, chapter: ChapterBlueprint, bossPhases: BossPhaseBlueprint[]): FantasyLaneBossDef {
  return {
    id: `${levelId}-boss`,
    name: chapter.chapter.bossName,
    unitId: chapter.bossUnitId,
    phases: bossPhases.map((phase, phaseIndex) => ({
      id: `${levelId}-boss-phase-${phaseIndex + 1}`,
      hpThreshold: phase.hpThreshold,
      enterWarning: phase.enterWarning,
      skills: phase.skills,
      phaseSpawnGroups: phase.spawnGroups.map((spawn, spawnIndex) => ({
        ...createSpawnGroup(levelId, phaseIndex + 4, spawnIndex, spawn),
        id: `${levelId}-boss-phase-${phaseIndex + 1}-spawn-${spawnIndex + 1}`,
      })),
    })),
  };
}

function createFailureHints(chapterOrder: number) {
  return {
    lowFrontline:
      chapterOrder <= 2
        ? '前线扛不住时，不要继续空存金币，先补肉盾与稳线位。'
        : '这一章的前线塌一次就会被连压，先补肉盾再谈终结。 ',
    lowAntiAir:
      chapterOrder >= 3 ? '这关空层压力很明显，至少留两张对空位。' : '虽然空层不是主命题，但漏防会让后排先掉。 ',
    lowAoE:
      chapterOrder === 1 || chapterOrder === 2
        ? '敌人会靠小怪或召唤拖线，不补群伤会被越拖越长。'
        : '高压波次不是靠单点慢慢点掉，记得留群伤窗口。',
    overSavingGold: '资源顶到高位时回费会衰减，别把金币一直攒在手里。',
    lateSkillUse: '技能应该打在章节命题的节点上，不要等基地见底才按。',
  };
}

const CHAPTER_BLUEPRINTS: ChapterBlueprint[] = [
  {
    chapter: {
      id: 'chapter-1',
      order: 1,
      name: '哥布林边境',
      theme: '边境杂兵海与基础稳线',
      focus: '前排稳线 / 群伤清潮',
      bossName: '骸骨巨王',
      summary: '第一章是正式主线的入门考，先让玩家读懂“站住线”和“清掉潮”。',
    },
    enemyPool: ['goblin_shield', 'archer', 'crypt_crawler', 'flame_warlock', 'orc_heavy'],
    suggestedHeroes: ['warlord'],
    timeLimitMs: 360000,
    playerBaseHp: 3000,
    enemyBaseHp: 2600,
    startingGold: 140,
    bossUnitId: 'ogre_lord',
    bossWarning: '骸骨巨王压场时会把前排和后排一起拧紧，先稳线再总攻。',
    levels: [
      {
        name: '立住边境线',
        hint: '第一关先学会补肉盾，不要被最基础的前排推进打穿。',
        recommendedTags: ['frontline', 'aoe'],
        description: '用边境杂兵教玩家“先稳住前线，再让后排开始工作”。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 52,
            pressure: 'read',
            warning: '本关命题：先站住线，别让哥布林白嫖前排距离。',
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 6, count: 4, intervalSec: 5.5, laneOverride: 'front', note: '盾兵先压前线。' },
              { unitId: 'crypt_crawler', firstDelaySec: 18, count: 2, intervalSec: 8, laneOverride: 'mid', note: '爬虫补中线扰动。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 52,
            endAtSec: 142,
            pressure: 'contest',
            warning: '边境弓手开始站住身位，记得让后排开始做事。',
            spawnGroups: [
              { unitId: 'archer', firstDelaySec: 4, count: 4, intervalSec: 7, laneOverride: 'rear', note: '后排弓手开始稳定输出。' },
              { unitId: 'goblin_shield', firstDelaySec: 14, count: 3, intervalSec: 6, laneOverride: 'front', note: '前排继续顶住对推。' },
            ],
          },
          {
            label: '尾段加压',
            startAtSec: 142,
            pressure: 'pressure',
            warning: '尾段会混进重压点，记得提前留群伤或终结位。',
            spawnGroups: [
              { unitId: 'flame_warlock', firstDelaySec: 5, count: 2, intervalSec: 11, laneOverride: 'rear', note: '后排火法逼你补处理。' },
              { unitId: 'orc_heavy', firstDelaySec: 16, count: 2, intervalSec: 13, laneOverride: 'front', note: '重甲单位测试前线厚度。' },
            ],
          },
        ],
      },
      {
        name: '哥布林潮头',
        hint: '这关不是单点解题，得先把潮水速度压下来。',
        recommendedTags: ['aoe', 'frontline'],
        description: '把第一章第二个命题抬出来，要求玩家开始理解群伤价值。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 48,
            pressure: 'read',
            warning: '本关命题：敌人会靠小怪海抢节奏，不补群伤会越拖越满。',
            spawnGroups: [
              { unitId: 'crypt_crawler', firstDelaySec: 5, count: 5, intervalSec: 4, laneOverride: 'mid', note: '中线小怪海率先到。' },
              { unitId: 'goblin_shield', firstDelaySec: 14, count: 3, intervalSec: 6, laneOverride: 'front', note: '前线盾兵给杂兵保驾。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 48,
            endAtSec: 138,
            pressure: 'contest',
            warning: '中段会形成“盾前小怪后”的双层推进，别只盯一个点。',
            spawnGroups: [
              { unitId: 'crypt_crawler', firstDelaySec: 4, count: 6, intervalSec: 3.8, laneOverride: 'mid', note: '杂兵潮持续滚上来。' },
              { unitId: 'archer', firstDelaySec: 12, count: 3, intervalSec: 7.5, laneOverride: 'rear', note: '弓手把节奏拖成长线。' },
            ],
          },
          {
            label: '尾段加压',
            startAtSec: 138,
            pressure: 'pressure',
            warning: '尾段火法会把小怪海抬成真压力，别再只靠前排硬顶。',
            spawnGroups: [
              { unitId: 'flame_warlock', firstDelaySec: 6, count: 3, intervalSec: 9, laneOverride: 'rear', note: '火法强化清线压力。' },
              { unitId: 'crypt_crawler', firstDelaySec: 9, count: 4, intervalSec: 4.2, laneOverride: 'mid', note: '杂兵继续补满。' },
            ],
          },
        ],
      },
      {
        name: '盾弓交错',
        hint: '正面不只会堆数量，还会把肉盾和后排串起来。',
        recommendedTags: ['frontline', 'pierce'],
        description: '让玩家面对“前排掩护后排”的正式主线编制。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 54,
            pressure: 'read',
            warning: '本关命题：先拆护卫，再拆输出，别把火力浪费在错误目标上。',
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 6, count: 3, intervalSec: 5.2, laneOverride: 'front', note: '前线盾兵先立阵。' },
              { unitId: 'archer', firstDelaySec: 15, count: 2, intervalSec: 8, laneOverride: 'rear', note: '弓手藏在后排稳定磨血。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 54,
            endAtSec: 148,
            pressure: 'contest',
            warning: '中段会出现盾弓穿插，不要让己方前排无支援裸扛。',
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 4, count: 4, intervalSec: 4.8, laneOverride: 'front', note: '盾兵持续刷新。' },
              { unitId: 'archer', firstDelaySec: 8, count: 4, intervalSec: 6.8, laneOverride: 'rear', note: '后排火力形成固定点。' },
            ],
          },
          {
            label: '尾段加压',
            startAtSec: 148,
            pressure: 'pressure',
            warning: '尾段重甲会把你前线钉死，记得留破甲位和爆发位。',
            spawnGroups: [
              { unitId: 'orc_heavy', firstDelaySec: 7, count: 3, intervalSec: 10, laneOverride: 'front', note: '重甲用来验证破甲。' },
              { unitId: 'archer', firstDelaySec: 12, count: 2, intervalSec: 7.2, laneOverride: 'rear', note: '后排继续磨线。' },
            ],
          },
        ],
      },
      {
        name: '火雨急救',
        hint: '对面会在你最忙的时候补后排火力，技能别太早交空。',
        recommendedTags: ['frontline', 'heal'],
        description: '通过后排法术压迫，逼玩家开始学会留技能与稳态处理。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 50,
            pressure: 'read',
            warning: '本关命题：后排灼烧会逼你掉血，先保住前线，不要一口气交完技能。',
            spawnGroups: [
              { unitId: 'flame_warlock', firstDelaySec: 9, count: 2, intervalSec: 10, laneOverride: 'rear', note: '火法先亮牌。' },
              { unitId: 'goblin_shield', firstDelaySec: 16, count: 2, intervalSec: 6, laneOverride: 'front', note: '前排帮火法争输出时间。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 50,
            endAtSec: 144,
            pressure: 'contest',
            warning: '中段会变成“前线掉血 + 后排点燃”的双重消耗局。',
            spawnGroups: [
              { unitId: 'flame_warlock', firstDelaySec: 5, count: 3, intervalSec: 8.5, laneOverride: 'rear', note: '火法连段抬压。' },
              { unitId: 'crypt_crawler', firstDelaySec: 11, count: 4, intervalSec: 4.5, laneOverride: 'mid', note: '小怪把压力铺满。' },
            ],
          },
          {
            label: '尾段加压',
            startAtSec: 144,
            pressure: 'pressure',
            warning: '尾段重甲会接火法，一旦前线倒了就没有急救时间了。',
            spawnGroups: [
              { unitId: 'orc_heavy', firstDelaySec: 6, count: 2, intervalSec: 11, laneOverride: 'front', note: '重甲顶上来。' },
              { unitId: 'flame_warlock', firstDelaySec: 10, count: 2, intervalSec: 9, laneOverride: 'rear', note: '火法继续补压。' },
            ],
          },
        ],
      },
      {
        name: '边境总测',
        hint: '这一关会把第一章两道题一起压过来，阵容和技能都得成型。',
        recommendedTags: ['frontline', 'aoe', 'burst'],
        description: '第一章考试关，把“站住线”和“清掉潮”合并成一条完整节奏。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 52,
            pressure: 'read',
            warning: '本关命题：先站住边境，再想办法把整波潮头切断。',
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 5, count: 4, intervalSec: 5, laneOverride: 'front', note: '前排起手就给强度。' },
              { unitId: 'crypt_crawler', firstDelaySec: 12, count: 4, intervalSec: 4, laneOverride: 'mid', note: '小怪跟上。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 52,
            endAtSec: 150,
            pressure: 'contest',
            warning: '中段会补盾弓交错，不补中后排就会被拖成烂战线。',
            spawnGroups: [
              { unitId: 'archer', firstDelaySec: 6, count: 4, intervalSec: 6.6, laneOverride: 'rear', note: '后排固定火力。' },
              { unitId: 'goblin_shield', firstDelaySec: 10, count: 4, intervalSec: 5.4, laneOverride: 'front', note: '前排持久施压。' },
            ],
          },
          {
            label: '尾段加压',
            startAtSec: 150,
            pressure: 'pressure',
            warning: '尾段会把火法和重甲一起端上来，收口窗口只会给一次。',
            spawnGroups: [
              { unitId: 'flame_warlock', firstDelaySec: 5, count: 3, intervalSec: 8.8, laneOverride: 'rear', note: '火法补后排压制。' },
              { unitId: 'orc_heavy', firstDelaySec: 14, count: 2, intervalSec: 10.5, laneOverride: 'front', note: '重甲做最后考题。' },
            ],
          },
        ],
      },
      {
        name: '骸骨巨王',
        hint: 'Boss 会把前排稳线和群伤清潮两道题一起拉满，不要把爆发交在错误节点。',
        recommendedTags: ['frontline', 'aoe', 'burst'],
        description: '第一章 Boss 关，先打前哨战，再顶住骸骨巨王的四段推进。',
        phases: [
          {
            label: '开场读题',
            startAtSec: 0,
            endAtSec: 44,
            pressure: 'read',
            warning: 'Boss 关开场：先把盾兵和杂兵海拆干净，别急着找 Boss。',
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 7, count: 3, intervalSec: 5, laneOverride: 'front', note: 'Boss 前的前排考试。' },
              { unitId: 'crypt_crawler', firstDelaySec: 14, count: 4, intervalSec: 4.2, laneOverride: 'mid', note: '杂兵海先探路。' },
            ],
          },
          {
            label: '中段对推',
            startAtSec: 44,
            endAtSec: 96,
            pressure: 'contest',
            warning: '前哨战会加入后排弓手和火法，别让前线自己挨打。',
            spawnGroups: [
              { unitId: 'archer', firstDelaySec: 4, count: 3, intervalSec: 6.5, laneOverride: 'rear', note: '后排弓手补压。' },
              { unitId: 'flame_warlock', firstDelaySec: 16, count: 2, intervalSec: 9.5, laneOverride: 'rear', note: '火法拉高治疗压力。' },
            ],
          },
          {
            label: 'Boss 登场',
            startAtSec: 96,
            endAtSec: 150,
            pressure: 'boss',
            warning: '骸骨巨王入场，先稳住第一轮压线，不要为了摸 Boss 把前排放空。',
            spawnGroups: [{ unitId: 'ogre_lord', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'front', note: 'Boss 本体入场。' }],
          },
          {
            label: '终局收口',
            startAtSec: 150,
            pressure: 'pressure',
            warning: '最后窗口只会在 Boss 狂暴后打开，留一手收口技能。',
            spawnGroups: [
              { unitId: 'orc_heavy', firstDelaySec: 6, count: 2, intervalSec: 10, laneOverride: 'front', note: '终局重压。' },
              { unitId: 'archer', firstDelaySec: 10, count: 3, intervalSec: 7, laneOverride: 'rear', note: '后排继续磨线。' },
            ],
          },
        ],
        bossPhases: [
          {
            hpThreshold: 100,
            enterWarning: '骸骨巨王第一段会先稳前排，再把小怪海重新铺回来。',
            skills: ['opening-pressure', 'frontline-wall'],
            spawnGroups: [
              { unitId: 'goblin_shield', firstDelaySec: 3, count: 3, intervalSec: 4.8, laneOverride: 'front', note: '第一段重建前排。' },
              { unitId: 'crypt_crawler', firstDelaySec: 8, count: 4, intervalSec: 4.2, laneOverride: 'mid', note: '小怪海跟进。' },
            ],
          },
          {
            hpThreshold: 74,
            enterWarning: 'Boss 第一阈值转段，后排火力开始站定，你得同时处理前后排。',
            skills: ['backline-fire', 'summon-wave'],
            spawnGroups: [
              { unitId: 'archer', firstDelaySec: 3, count: 3, intervalSec: 6.6, laneOverride: 'rear', note: '弓手固定磨线。' },
              { unitId: 'flame_warlock', firstDelaySec: 9, count: 2, intervalSec: 10, laneOverride: 'rear', note: '火法抬持续伤。' },
            ],
          },
          {
            hpThreshold: 46,
            enterWarning: 'Boss 第二阈值转段，重甲会压到前线门口，破甲和群伤要一起成立。',
            skills: ['heavy-push', 'line-break'],
            spawnGroups: [
              { unitId: 'orc_heavy', firstDelaySec: 2, count: 3, intervalSec: 8.8, laneOverride: 'front', note: '重甲顶脸。' },
              { unitId: 'crypt_crawler', firstDelaySec: 7, count: 5, intervalSec: 3.6, laneOverride: 'mid', note: '小怪遮挡破甲窗口。' },
            ],
          },
          {
            hpThreshold: 24,
            enterWarning: '骸骨巨王狂暴，最后一段会把前后排同时补满，必须抓住总攻窗口。',
            skills: ['enrage', 'final-stand'],
            spawnGroups: [
              { unitId: 'archer', firstDelaySec: 2, count: 3, intervalSec: 5.8, laneOverride: 'rear', note: '后排持续压制。' },
              { unitId: 'orc_heavy', firstDelaySec: 6, count: 2, intervalSec: 9.6, laneOverride: 'front', note: '前排最后冲门。' },
            ],
          },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-2',
      order: 2,
      name: '亡骨荒原',
      theme: '复起召唤与长线消耗',
      focus: '召唤拆解 / 持续消耗',
      bossName: '亡骨祭司',
      summary: '第二章不再靠单波压线，而是逼玩家学会处理“反复补线”的长线局。',
    },
    enemyPool: ['crypt_crawler', 'plague_thrower', 'goblin_shield', 'orc_heavy', 'musketeer'],
    suggestedHeroes: ['warlord', 'archmage'],
    timeLimitMs: 390000,
    playerBaseHp: 3000,
    enemyBaseHp: 3000,
    startingGold: 138,
    bossUnitId: 'tree_ancient',
    bossWarning: '亡骨祭司会把战线拖得很长，想赢必须学会拆召唤和稳住回合差。',
    levels: [
      {
        name: '墓地返潮',
        hint: '这章开始会反复补线，不能只看第一波。',
        recommendedTags: ['aoe', 'frontline'],
        description: '正式教会玩家把“召唤海”当成独立命题处理。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：清掉返潮的小怪，不要只盯着第一排。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 5, count: 5, intervalSec: 4, laneOverride: 'mid', note: '墓地返潮开局。' },
            { unitId: 'plague_thrower', firstDelaySec: 14, count: 2, intervalSec: 9, laneOverride: 'rear', note: '投掷者开始拖血。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 150, pressure: 'contest', warning: '中段会一边返潮一边远程消耗，别把阵容压成纯前排。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 4, count: 6, intervalSec: 3.8, laneOverride: 'mid', note: '返潮继续滚。' },
            { unitId: 'goblin_shield', firstDelaySec: 10, count: 3, intervalSec: 6, laneOverride: 'front', note: '前排护送投掷者。' },
          ] },
          { label: '尾段加压', startAtSec: 150, pressure: 'pressure', warning: '尾段会接长枪火力，拖线局会突然变成真掉血局。', spawnGroups: [
            { unitId: 'musketeer', firstDelaySec: 8, count: 3, intervalSec: 8.5, laneOverride: 'rear', note: '长枪远程接手。' },
            { unitId: 'crypt_crawler', firstDelaySec: 14, count: 4, intervalSec: 4.4, laneOverride: 'mid', note: '返潮继续补满。' },
          ] },
        ],
      },
      {
        name: '瘟疫投掷',
        hint: '后排点压会让长线局更难打，不能只清杂兵不管后面。',
        recommendedTags: ['aoe', 'frontline'],
        description: '把召唤和后排消耗拼在一起，要求玩家开始同时看两层压力。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 52, pressure: 'read', warning: '本关命题：处理投掷消耗，不然召唤海会越打越赚。', spawnGroups: [
            { unitId: 'plague_thrower', firstDelaySec: 8, count: 2, intervalSec: 9.5, laneOverride: 'rear', note: '投掷者先亮相。' },
            { unitId: 'crypt_crawler', firstDelaySec: 15, count: 4, intervalSec: 4.1, laneOverride: 'mid', note: '返潮铺路。' },
          ] },
          { label: '中段对推', startAtSec: 52, endAtSec: 146, pressure: 'contest', warning: '中段会用盾兵挡在前面，后排投掷必须被尽快处理。', spawnGroups: [
            { unitId: 'goblin_shield', firstDelaySec: 5, count: 4, intervalSec: 5.4, laneOverride: 'front', note: '盾兵护住后排。' },
            { unitId: 'plague_thrower', firstDelaySec: 12, count: 3, intervalSec: 8.8, laneOverride: 'rear', note: '投掷者连续耗血。' },
          ] },
          { label: '尾段加压', startAtSec: 146, pressure: 'pressure', warning: '尾段会让返潮和投掷叠满，别把技能留到完全崩线才按。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 4, count: 5, intervalSec: 3.6, laneOverride: 'mid', note: '返潮提速。' },
            { unitId: 'musketeer', firstDelaySec: 10, count: 2, intervalSec: 8.4, laneOverride: 'rear', note: '长枪压后手。' },
          ] },
        ],
      },
      {
        name: '长线消耗',
        hint: '这关考的是战线运营，不是打一波爆发就结束。',
        recommendedTags: ['frontline', 'aoe'],
        description: '用更长的波次节奏，让玩家开始重视资源和回费循环。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 60, pressure: 'read', warning: '本关命题：节奏会被拉长，别空攒资源等完美手。', spawnGroups: [
            { unitId: 'goblin_shield', firstDelaySec: 6, count: 3, intervalSec: 6, laneOverride: 'front', note: '前排起线。' },
            { unitId: 'crypt_crawler', firstDelaySec: 18, count: 3, intervalSec: 4.5, laneOverride: 'mid', note: '返潮试探。' },
          ] },
          { label: '中段对推', startAtSec: 60, endAtSec: 160, pressure: 'contest', warning: '中段的重点是不断补位，不要把线交给敌人慢慢磨。', spawnGroups: [
            { unitId: 'plague_thrower', firstDelaySec: 5, count: 3, intervalSec: 8.2, laneOverride: 'rear', note: '中段持续耗血。' },
            { unitId: 'goblin_shield', firstDelaySec: 12, count: 4, intervalSec: 5.8, laneOverride: 'front', note: '前排继续拖线。' },
          ] },
          { label: '尾段加压', startAtSec: 160, pressure: 'pressure', warning: '尾段重甲入场，长线局会突然变成“必须收掉”的局面。', spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 8, count: 3, intervalSec: 10.5, laneOverride: 'front', note: '重甲收线。' },
            { unitId: 'musketeer', firstDelaySec: 14, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '远程补刀。' },
          ] },
        ],
      },
      {
        name: '骨墙突破',
        hint: '召唤海后面会开始塞硬目标，必须从“清潮”切到“拆墙”。',
        recommendedTags: ['pierce', 'frontline'],
        description: '把章节的第二层考试补上，让玩家在召唤海里寻找破口。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：先拆骨墙，不然再多清潮也只是原地踏步。', spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 9, count: 2, intervalSec: 12, laneOverride: 'front', note: '骨墙等价目标。' },
            { unitId: 'crypt_crawler', firstDelaySec: 14, count: 4, intervalSec: 4.2, laneOverride: 'mid', note: '小怪继续掩护。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 150, pressure: 'contest', warning: '中段的重点不是杀得快，而是把“墙 + 返潮”一起拆掉。', spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 5, count: 3, intervalSec: 10.4, laneOverride: 'front', note: '重甲持续挡路。' },
            { unitId: 'plague_thrower', firstDelaySec: 13, count: 2, intervalSec: 9.4, laneOverride: 'rear', note: '投掷继续拖血。' },
          ] },
          { label: '尾段加压', startAtSec: 150, pressure: 'pressure', warning: '尾段返潮会把破墙窗口遮掉，记得留一次真正的破口。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 4, count: 6, intervalSec: 3.8, laneOverride: 'mid', note: '返潮遮挡破口。' },
            { unitId: 'musketeer', firstDelaySec: 10, count: 2, intervalSec: 8.4, laneOverride: 'rear', note: '后排压手。' },
          ] },
        ],
      },
      {
        name: '墓场风暴',
        hint: '这一关会把召唤、消耗、拆墙三件事全混在一起。',
        recommendedTags: ['aoe', 'frontline', 'pierce'],
        description: '第二章考试关，要求玩家在长线里保持结构完整。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：别被返潮和投掷拆散阵型，先把战线稳住。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 5, count: 5, intervalSec: 3.9, laneOverride: 'mid', note: '返潮先手。' },
            { unitId: 'plague_thrower', firstDelaySec: 13, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '后排消耗同步到。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 156, pressure: 'contest', warning: '中段会给你一堵硬墙，没破口就会一直被拖。', spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 7, count: 3, intervalSec: 10.2, laneOverride: 'front', note: '硬墙测试。' },
            { unitId: 'goblin_shield', firstDelaySec: 11, count: 3, intervalSec: 5.8, laneOverride: 'front', note: '前排补位。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段长枪会接住返潮，留好最后一次总攻窗口。', spawnGroups: [
            { unitId: 'musketeer', firstDelaySec: 6, count: 3, intervalSec: 8.4, laneOverride: 'rear', note: '长枪接管尾段。' },
            { unitId: 'crypt_crawler', firstDelaySec: 12, count: 4, intervalSec: 4.1, laneOverride: 'mid', note: '返潮继续滚。' },
          ] },
        ],
      },
      {
        name: '亡骨祭司',
        hint: 'Boss 关会不断补召唤和后排消耗，你必须抓住真正的停顿点收口。',
        recommendedTags: ['aoe', 'frontline', 'burst'],
        description: '第二章 Boss 关，把“返潮 + 消耗 + 破墙”三条线合并成正式主线 Boss 战。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 46, pressure: 'read', warning: 'Boss 关开场：先确认返潮密度，不要为了抢节奏丢前排。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 6, count: 5, intervalSec: 4, laneOverride: 'mid', note: '返潮先行。' },
            { unitId: 'goblin_shield', firstDelaySec: 15, count: 2, intervalSec: 6, laneOverride: 'front', note: '前排补位。' },
          ] },
          { label: '中段对推', startAtSec: 46, endAtSec: 98, pressure: 'contest', warning: '前哨战会补投掷和长枪，先把后排位置清出来。', spawnGroups: [
            { unitId: 'plague_thrower', firstDelaySec: 5, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '投掷消耗。' },
            { unitId: 'musketeer', firstDelaySec: 14, count: 2, intervalSec: 8.6, laneOverride: 'rear', note: '长枪补压。' },
          ] },
          { label: 'Boss 登场', startAtSec: 98, endAtSec: 154, pressure: 'boss', warning: '亡骨祭司入场，第一目标是把返潮和投掷一起控住。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'mid', note: 'Boss 本体入场。' },
          ] },
          { label: '终局收口', startAtSec: 154, pressure: 'pressure', warning: '终局收口会把前排硬墙和返潮一起端上来，别把爆发交空。', spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 7, count: 2, intervalSec: 9.8, laneOverride: 'front', note: '硬墙进入终局。' },
            { unitId: 'crypt_crawler', firstDelaySec: 10, count: 4, intervalSec: 4, laneOverride: 'mid', note: '返潮继续覆盖。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '亡骨祭司第一段会靠返潮海抢节奏，先把回费循环稳住。', skills: ['summon-wave', 'grave-return'], spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 3, count: 6, intervalSec: 3.8, laneOverride: 'mid', note: '返潮海第一波。' },
            { unitId: 'goblin_shield', firstDelaySec: 8, count: 3, intervalSec: 5.8, laneOverride: 'front', note: '前排托住返潮。' },
          ] },
          { hpThreshold: 72, enterWarning: 'Boss 第一阈值转段，投掷消耗会开始锁你后排。', skills: ['plague-rain', 'backline-bleed'], spawnGroups: [
            { unitId: 'plague_thrower', firstDelaySec: 3, count: 3, intervalSec: 8.6, laneOverride: 'rear', note: '投掷持续锁血。' },
            { unitId: 'crypt_crawler', firstDelaySec: 10, count: 4, intervalSec: 4, laneOverride: 'mid', note: '返潮照常给压。' },
          ] },
          { hpThreshold: 44, enterWarning: 'Boss 第二阈值转段，硬墙会把整条线拖住，必须强拆出破口。', skills: ['bone-wall', 'drag-out'], spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 2, count: 3, intervalSec: 10.2, laneOverride: 'front', note: '硬墙顶满。' },
            { unitId: 'musketeer', firstDelaySec: 9, count: 2, intervalSec: 8.4, laneOverride: 'rear', note: '长枪补后手。' },
          ] },
          { hpThreshold: 22, enterWarning: '亡骨祭司狂暴，终局会把召唤、消耗、硬墙一起压满。', skills: ['enrage', 'final-attrition'], spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 2, count: 5, intervalSec: 3.6, laneOverride: 'mid', note: '返潮狂暴。' },
            { unitId: 'orc_heavy', firstDelaySec: 6, count: 2, intervalSec: 9.4, laneOverride: 'front', note: '硬墙收线。' },
          ] },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-3',
      order: 3,
      name: '冰霜峡谷',
      theme: '空袭冻结与双层控场',
      focus: '对空成型 / 控场节奏',
      bossName: '烈焰巨龙',
      summary: '第三章正式把空层变成主战场，玩家必须开始同时读地面和空中。',
    },
    enemyPool: ['bat_swarm', 'young_dragon', 'orc_heavy', 'ice_witch', 'elf_shooter'],
    suggestedHeroes: ['archmage', 'dragon_rider'],
    timeLimitMs: 420000,
    playerBaseHp: 3000,
    enemyBaseHp: 3200,
    startingGold: 132,
    bossUnitId: 'fire_dragon',
    bossWarning: '冰霜巨龙会反复升空和控线，缺对空的阵容会被直接打穿。',
    levels: [
      {
        name: '第一波空袭',
        hint: '空层现在是正式战场，别再拿地面阵容硬凑。',
        recommendedTags: ['antiAir', 'frontline'],
        description: '第三章开门就让玩家确认：对空位不是可选项。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：先补对空，别让第一波蝙蝠免费撞基地。', spawnGroups: [
            { unitId: 'bat_swarm', firstDelaySec: 7, count: 4, intervalSec: 4.2, laneOverride: 'air', note: '空袭起手。' },
            { unitId: 'orc_heavy', firstDelaySec: 18, count: 2, intervalSec: 10, laneOverride: 'front', note: '地面只是辅压。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 148, pressure: 'contest', warning: '中段会变成“空层骚扰 + 地面顶线”的双层局。', spawnGroups: [
            { unitId: 'bat_swarm', firstDelaySec: 4, count: 5, intervalSec: 4, laneOverride: 'air', note: '蝙蝠持续占空。' },
            { unitId: 'elf_shooter', firstDelaySec: 12, count: 3, intervalSec: 7.4, laneOverride: 'rear', note: '地面远程撑住战线。' },
          ] },
          { label: '尾段加压', startAtSec: 148, pressure: 'pressure', warning: '尾段幼龙会进场，空层从骚扰变成真命题。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 8, count: 3, intervalSec: 9.4, laneOverride: 'air', note: '幼龙抬高空压。' },
            { unitId: 'bat_swarm', firstDelaySec: 12, count: 3, intervalSec: 4.6, laneOverride: 'air', note: '蝙蝠继续补位。' },
          ] },
        ],
      },
      {
        name: '冻前排',
        hint: '这关不是纯空战，冰控会让你的地面节奏一起变慢。',
        recommendedTags: ['slow', 'frontline'],
        description: '要求玩家开始处理“冻结控场 + 空袭切后排”的复合压力。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：冰控会先手把你前线钉住，别只看天上。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 8, count: 2, intervalSec: 10, laneOverride: 'rear', note: '冰巫先上控场。' },
            { unitId: 'orc_heavy', firstDelaySec: 15, count: 2, intervalSec: 10.4, laneOverride: 'front', note: '地面配合控场。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 152, pressure: 'contest', warning: '中段会边冻前排边补空袭，记得保持两层都能工作。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 5, count: 3, intervalSec: 9.2, laneOverride: 'rear', note: '冰控连段。' },
            { unitId: 'bat_swarm', firstDelaySec: 10, count: 4, intervalSec: 4.4, laneOverride: 'air', note: '蝙蝠切空层。' },
          ] },
          { label: '尾段加压', startAtSec: 152, pressure: 'pressure', warning: '尾段幼龙会趁控场窗口补刀，缺对空就会直接被穿。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 2, intervalSec: 10.2, laneOverride: 'air', note: '幼龙趁冻线压进。' },
            { unitId: 'ice_witch', firstDelaySec: 13, count: 2, intervalSec: 9.4, laneOverride: 'rear', note: '冰控继续拖慢战线。' },
          ] },
        ],
      },
      {
        name: '双层压力',
        hint: '空地同时给压时，单一阵容会明显偏科。',
        recommendedTags: ['antiAir', 'slow'],
        description: '把地面重甲和空层中怪一起堆出来，逼玩家补齐阵容短板。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：先认清哪一层是真压力，不要顾此失彼。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 9, count: 2, intervalSec: 10.4, laneOverride: 'air', note: '空层中压。' },
            { unitId: 'orc_heavy', firstDelaySec: 16, count: 2, intervalSec: 10.2, laneOverride: 'front', note: '地面同步顶脸。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 150, pressure: 'contest', warning: '中段会补地面远程，逼你两层都要有输出点。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 5, count: 3, intervalSec: 7.2, laneOverride: 'rear', note: '地面远程接手。' },
            { unitId: 'bat_swarm', firstDelaySec: 12, count: 4, intervalSec: 4.2, laneOverride: 'air', note: '蝙蝠继续切空。' },
          ] },
          { label: '尾段加压', startAtSec: 150, pressure: 'pressure', warning: '尾段会把冰控、空袭和地面火力一起给满，别再拖。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 6, count: 2, intervalSec: 9.6, laneOverride: 'rear', note: '冰控补定身。' },
            { unitId: 'young_dragon', firstDelaySec: 10, count: 2, intervalSec: 9.8, laneOverride: 'air', note: '空层终压。' },
          ] },
        ],
      },
      {
        name: '对空考试',
        hint: '这关会持续追问你：空层到底有没有成型。',
        recommendedTags: ['antiAir', 'pierce'],
        description: '第三章考试关前的专项测试，要求对空位真正稳定运作。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 50, pressure: 'read', warning: '本关命题：纯地面阵容会在这里直接暴露。', spawnGroups: [
            { unitId: 'bat_swarm', firstDelaySec: 6, count: 5, intervalSec: 4, laneOverride: 'air', note: '高频空袭。' },
            { unitId: 'elf_shooter', firstDelaySec: 16, count: 2, intervalSec: 7.4, laneOverride: 'rear', note: '地面只是补位。' },
          ] },
          { label: '中段对推', startAtSec: 50, endAtSec: 146, pressure: 'contest', warning: '中段幼龙会接力蝙蝠，空层火力断一下都不行。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 5, count: 3, intervalSec: 8.8, laneOverride: 'air', note: '幼龙接力。' },
            { unitId: 'bat_swarm', firstDelaySec: 9, count: 4, intervalSec: 4.4, laneOverride: 'air', note: '蝙蝠不断线。' },
          ] },
          { label: '尾段加压', startAtSec: 146, pressure: 'pressure', warning: '尾段冰控会卡你的对空节奏，留好修正窗口。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 7, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '冰控卡节奏。' },
            { unitId: 'young_dragon', firstDelaySec: 12, count: 2, intervalSec: 8.8, laneOverride: 'air', note: '空层最后逼压。' },
          ] },
        ],
      },
      {
        name: '冰龙前夜',
        hint: '决战前会把这一章的两道题同时拉满。',
        recommendedTags: ['antiAir', 'slow', 'finisher'],
        description: '第三章考试关，要求阵容能同时处理控场与空袭。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：别被冰控骗走视线，真正决定胜负的还是空层处理。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 8, count: 2, intervalSec: 9.6, laneOverride: 'rear', note: '冰控开题。' },
            { unitId: 'bat_swarm', firstDelaySec: 12, count: 4, intervalSec: 4.2, laneOverride: 'air', note: '空袭同步到。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 154, pressure: 'contest', warning: '中段会变成冰控 + 幼龙 + 地面远程的复合局，阵容不能偏科。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 6, count: 3, intervalSec: 9.2, laneOverride: 'air', note: '幼龙上场。' },
            { unitId: 'elf_shooter', firstDelaySec: 11, count: 3, intervalSec: 7.4, laneOverride: 'rear', note: '地面远程补刀。' },
          ] },
          { label: '尾段加压', startAtSec: 154, pressure: 'pressure', warning: '尾段冰控会把收口窗口拉得很窄，记得提前准备终结位。', spawnGroups: [
            { unitId: 'ice_witch', firstDelaySec: 5, count: 3, intervalSec: 8.8, laneOverride: 'rear', note: '冰控拉满。' },
            { unitId: 'young_dragon', firstDelaySec: 12, count: 2, intervalSec: 9.6, laneOverride: 'air', note: '空层终压。' },
          ] },
        ],
      },
      {
        name: '冰霜巨龙',
        hint: 'Boss 关会反复升空、冻结和补空袭，不补对空就没有资格打终局。',
        recommendedTags: ['antiAir', 'slow', 'finisher'],
        description: '第三章 Boss 关，正式把空层与控场做成多阶段 Boss 战。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 46, pressure: 'read', warning: 'Boss 关开场：先把空层补齐，再考虑地面细节。', spawnGroups: [
            { unitId: 'bat_swarm', firstDelaySec: 6, count: 4, intervalSec: 4.2, laneOverride: 'air', note: 'Boss 前空袭。' },
            { unitId: 'ice_witch', firstDelaySec: 16, count: 2, intervalSec: 9.4, laneOverride: 'rear', note: '冰控先手。' },
          ] },
          { label: '中段对推', startAtSec: 46, endAtSec: 98, pressure: 'contest', warning: '前哨战会用幼龙和地面远程把双层压力立起来。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 5, count: 2, intervalSec: 9.4, laneOverride: 'air', note: '幼龙热身。' },
            { unitId: 'elf_shooter', firstDelaySec: 12, count: 3, intervalSec: 7.2, laneOverride: 'rear', note: '地面稳定火力。' },
          ] },
          { label: 'Boss 登场', startAtSec: 98, endAtSec: 154, pressure: 'boss', warning: '冰霜巨龙入场，先顶住升空前的第一轮压制。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'air', note: 'Boss 本体登场。' },
          ] },
          { label: '终局收口', startAtSec: 154, pressure: 'pressure', warning: '终局收口会同时给空层和地面补压，最后的对空窗口别漏。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 2, intervalSec: 8.8, laneOverride: 'air', note: '空层终局。' },
            { unitId: 'orc_heavy', firstDelaySec: 12, count: 2, intervalSec: 10.4, laneOverride: 'front', note: '地面补压。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '冰霜巨龙第一段先用蝙蝠海拉开空层差。', skills: ['air-sweep', 'frost-breath'], spawnGroups: [
            { unitId: 'bat_swarm', firstDelaySec: 3, count: 5, intervalSec: 4, laneOverride: 'air', note: '高频空袭。' },
            { unitId: 'ice_witch', firstDelaySec: 9, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '冰控接上。' },
          ] },
          { hpThreshold: 70, enterWarning: 'Boss 第一阈值转段，幼龙会开始接力，空层压力正式成型。', skills: ['dragon-wing', 'layer-shift'], spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 3, count: 3, intervalSec: 8.8, laneOverride: 'air', note: '幼龙进场。' },
            { unitId: 'bat_swarm', firstDelaySec: 10, count: 3, intervalSec: 4.4, laneOverride: 'air', note: '蝙蝠不断线。' },
          ] },
          { hpThreshold: 42, enterWarning: 'Boss 第二阈值转段，地面会补硬墙，逼你两层都不能断。', skills: ['ground-lock', 'freeze-field'], spawnGroups: [
            { unitId: 'orc_heavy', firstDelaySec: 2, count: 3, intervalSec: 10, laneOverride: 'front', note: '地面硬墙。' },
            { unitId: 'ice_witch', firstDelaySec: 8, count: 2, intervalSec: 9.4, laneOverride: 'rear', note: '冰控拖线。' },
          ] },
          { hpThreshold: 20, enterWarning: '冰霜巨龙狂暴，终局会把空袭和冻结同步拉满。', skills: ['enrage', 'blizzard'], spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 2, count: 2, intervalSec: 8.2, laneOverride: 'air', note: '幼龙终压。' },
            { unitId: 'bat_swarm', firstDelaySec: 6, count: 4, intervalSec: 4, laneOverride: 'air', note: '蝙蝠补密度。' },
          ] },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-4',
      order: 4,
      name: '熔火山口',
      theme: '重甲推进与高费转折',
      focus: '破甲拆墙 / 高费转折',
      bossName: '熔岩暴君',
      summary: '第四章把地面重压做成主命题，要求玩家不只守住，还得学会真正收线。',
    },
    enemyPool: ['stone_guard', 'thunder_mage', 'tree_ancient', 'ogre_lord', 'flame_warlock'],
    suggestedHeroes: ['warlord', 'archmage'],
    timeLimitMs: 450000,
    playerBaseHp: 3100,
    enemyBaseHp: 3500,
    startingGold: 126,
    bossUnitId: 'ogre_lord',
    bossWarning: '熔岩暴君的重甲推进会把回合压成一次次窗口，没破甲就没有后半局。',
    levels: [
      {
        name: '熔岩重装',
        hint: '从这里开始，没有破甲就会明显打不动。',
        recommendedTags: ['pierce', 'frontline'],
        description: '第四章开门就把破甲命题立住，告诉玩家重甲不是靠磨掉的。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：先认清真正的硬目标，别把输出打散。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 8, count: 2, intervalSec: 11, laneOverride: 'front', note: '石卫开门见山。' },
            { unitId: 'flame_warlock', firstDelaySec: 18, count: 2, intervalSec: 9.6, laneOverride: 'rear', note: '后排补火。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 156, pressure: 'contest', warning: '中段会给你更多硬墙，纯群伤已经不够用了。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 5, count: 3, intervalSec: 10.2, laneOverride: 'front', note: '硬墙续上。' },
            { unitId: 'thunder_mage', firstDelaySec: 12, count: 2, intervalSec: 9, laneOverride: 'rear', note: '雷法补范围压制。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段会抬出古树重目标，记得把高费留给真正的破口。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 9, count: 2, intervalSec: 12.5, laneOverride: 'front', note: '古树抬线。' },
            { unitId: 'stone_guard', firstDelaySec: 14, count: 2, intervalSec: 10.4, laneOverride: 'front', note: '硬墙继续压。' },
          ] },
        ],
      },
      {
        name: '爆裂雷阵',
        hint: '重甲后面会开始塞范围法术，站住线只是第一步。',
        recommendedTags: ['frontline', 'shield'],
        description: '让玩家理解“能扛住”不等于“能赢”，还得处理后排爆压。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：雷法会把阵线压扁，记得保住中后排。', spawnGroups: [
            { unitId: 'thunder_mage', firstDelaySec: 8, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '雷法起手。' },
            { unitId: 'stone_guard', firstDelaySec: 16, count: 2, intervalSec: 10.6, laneOverride: 'front', note: '硬墙配雷法。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 152, pressure: 'contest', warning: '中段会变成“前排吃墙、后排吃雷”的双压局。', spawnGroups: [
            { unitId: 'thunder_mage', firstDelaySec: 5, count: 3, intervalSec: 8.8, laneOverride: 'rear', note: '雷法持续输出。' },
            { unitId: 'flame_warlock', firstDelaySec: 11, count: 2, intervalSec: 9.6, laneOverride: 'rear', note: '后排法术叠压。' },
          ] },
          { label: '尾段加压', startAtSec: 152, pressure: 'pressure', warning: '尾段古树会卡住你的推进节奏，准备好一次真正的转折。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 7, count: 2, intervalSec: 12.2, laneOverride: 'front', note: '古树拖住前线。' },
            { unitId: 'thunder_mage', firstDelaySec: 13, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '雷法继续卡位。' },
          ] },
        ],
      },
      {
        name: '裂地推进',
        hint: '这一关开始会让你真正体会到“高费转折”的价值。',
        recommendedTags: ['siege', 'frontline'],
        description: '用更厚的地面波次，要求玩家主动准备收线方案。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：别把高费都用在补洞，得给真正的转折留资源。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 10, count: 2, intervalSec: 12.4, laneOverride: 'front', note: '古树先探路。' },
            { unitId: 'stone_guard', firstDelaySec: 18, count: 2, intervalSec: 10.6, laneOverride: 'front', note: '硬墙补满。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 158, pressure: 'contest', warning: '中段会不断刷新重目标，省下来的资源要用在真正的破口。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 6, count: 3, intervalSec: 11.4, laneOverride: 'front', note: '古树续压。' },
            { unitId: 'flame_warlock', firstDelaySec: 13, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '后排补火。' },
          ] },
          { label: '尾段加压', startAtSec: 158, pressure: 'pressure', warning: '尾段巨型重装会逼你立刻转节奏，不能再慢慢磨。', spawnGroups: [
            { unitId: 'ogre_lord', firstDelaySec: 8, count: 2, intervalSec: 13, laneOverride: 'front', note: '巨型重装入场。' },
            { unitId: 'stone_guard', firstDelaySec: 14, count: 2, intervalSec: 10.2, laneOverride: 'front', note: '硬墙继续给压。' },
          ] },
        ],
      },
      {
        name: '熔火总攻',
        hint: '高费转折能不能成立，这关会一眼看出来。',
        recommendedTags: ['finisher', 'pierce'],
        description: '把整章压力拉成一条线，要求玩家在对推里找到总攻时间。 ',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：不是扛多久，而是能不能在窗口里完成总攻。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 8, count: 2, intervalSec: 10.4, laneOverride: 'front', note: '硬墙开场。' },
            { unitId: 'thunder_mage', firstDelaySec: 16, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '后排雷压。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 156, pressure: 'contest', warning: '中段古树和雷法会一起拖线，别把总攻资源拆成碎片。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 7, count: 2, intervalSec: 11.8, laneOverride: 'front', note: '古树拖线。' },
            { unitId: 'thunder_mage', firstDelaySec: 11, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '雷法卡位。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段熔火重装会把窗口压得很短，留好一次终结。', spawnGroups: [
            { unitId: 'ogre_lord', firstDelaySec: 8, count: 2, intervalSec: 12.6, laneOverride: 'front', note: '巨型重装压死线。' },
            { unitId: 'flame_warlock', firstDelaySec: 15, count: 2, intervalSec: 9.4, laneOverride: 'rear', note: '火法补后手。' },
          ] },
        ],
      },
      {
        name: '破甲考试',
        hint: '最后一关前的考试，只测一件事：你的破甲和总攻是不是一套完整逻辑。',
        recommendedTags: ['pierce', 'aoe', 'finisher'],
        description: '第四章考试关，把“破甲拆墙”和“高费转折”合并验证。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：先拆墙，再总攻，顺序错了就会整波浪费。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 7, count: 3, intervalSec: 10.2, laneOverride: 'front', note: '硬墙先起。' },
            { unitId: 'flame_warlock', firstDelaySec: 16, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '火法补后排压。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 160, pressure: 'contest', warning: '中段会不断换重目标，破口一旦错过就很难追回。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 7, count: 2, intervalSec: 11.6, laneOverride: 'front', note: '古树挡线。' },
            { unitId: 'thunder_mage', firstDelaySec: 12, count: 2, intervalSec: 8.6, laneOverride: 'rear', note: '雷法拖节奏。' },
          ] },
          { label: '尾段加压', startAtSec: 160, pressure: 'pressure', warning: '尾段双巨装会同时压门，真正的收口窗口只剩一次。', spawnGroups: [
            { unitId: 'ogre_lord', firstDelaySec: 8, count: 2, intervalSec: 12.2, laneOverride: 'front', note: '双巨装压门。' },
            { unitId: 'stone_guard', firstDelaySec: 12, count: 2, intervalSec: 9.8, laneOverride: 'front', note: '硬墙补厚度。' },
          ] },
        ],
      },
      {
        name: '熔岩暴君',
        hint: 'Boss 关没有破甲和总攻逻辑就打不完；只会守线也会被一点点耗死。',
        recommendedTags: ['pierce', 'finisher', 'frontline'],
        description: '第四章 Boss 关，正式把重甲推进做成四段 Boss 战。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 46, pressure: 'read', warning: 'Boss 关开场：先读清哪一段是墙，哪一段是机会。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 7, count: 3, intervalSec: 10.2, laneOverride: 'front', note: 'Boss 前硬墙。' },
            { unitId: 'thunder_mage', firstDelaySec: 16, count: 2, intervalSec: 9, laneOverride: 'rear', note: '雷法补压。' },
          ] },
          { label: '中段对推', startAtSec: 46, endAtSec: 100, pressure: 'contest', warning: '前哨战会给你古树和火法，破甲和稳线都要工作。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 6, count: 2, intervalSec: 11.8, laneOverride: 'front', note: '古树上场。' },
            { unitId: 'flame_warlock', firstDelaySec: 13, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '火法跟上。' },
          ] },
          { label: 'Boss 登场', startAtSec: 100, endAtSec: 156, pressure: 'boss', warning: '熔岩暴君入场，先把第一轮巨装推进顶住。', spawnGroups: [
            { unitId: 'ogre_lord', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'front', note: 'Boss 本体入场。' },
          ] },
          { label: '终局收口', startAtSec: 156, pressure: 'pressure', warning: '终局会连续补硬墙，真正的总攻窗口要自己打出来。', spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 7, count: 2, intervalSec: 11.4, laneOverride: 'front', note: '终局古树。' },
            { unitId: 'thunder_mage', firstDelaySec: 12, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '雷法继续拖线。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '熔岩暴君第一段会用石卫和雷法把你锁在门口。', skills: ['stone-wall', 'thunder-rain'], spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 3, count: 3, intervalSec: 9.8, laneOverride: 'front', note: '石卫起墙。' },
            { unitId: 'thunder_mage', firstDelaySec: 9, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '雷法卡位。' },
          ] },
          { hpThreshold: 72, enterWarning: 'Boss 第一阈值转段，古树会把正面拖成真正的长线。', skills: ['ancient-march', 'siege-lock'], spawnGroups: [
            { unitId: 'tree_ancient', firstDelaySec: 3, count: 3, intervalSec: 11.4, laneOverride: 'front', note: '古树接力。' },
            { unitId: 'stone_guard', firstDelaySec: 10, count: 2, intervalSec: 9.8, laneOverride: 'front', note: '石卫补厚度。' },
          ] },
          { hpThreshold: 44, enterWarning: 'Boss 第二阈值转段，后排火法会把总攻窗口压得更窄。', skills: ['molten-flare', 'backline-burn'], spawnGroups: [
            { unitId: 'flame_warlock', firstDelaySec: 3, count: 3, intervalSec: 8.8, laneOverride: 'rear', note: '火法终局前热身。' },
            { unitId: 'tree_ancient', firstDelaySec: 9, count: 2, intervalSec: 11.2, laneOverride: 'front', note: '古树继续拖。' },
          ] },
          { hpThreshold: 20, enterWarning: '熔岩暴君狂暴，最后一段会把巨装与法术一起拉满。', skills: ['enrage', 'final-siege'], spawnGroups: [
            { unitId: 'ogre_lord', firstDelaySec: 2, count: 2, intervalSec: 12, laneOverride: 'front', note: '巨装狂暴。' },
            { unitId: 'thunder_mage', firstDelaySec: 8, count: 2, intervalSec: 8.6, laneOverride: 'rear', note: '雷法终局补压。' },
          ] },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-5',
      order: 5,
      name: '龙火王庭',
      theme: '空地混编与终局收口',
      focus: '混编识别 / 终局收口',
      bossName: '赤焰龙皇',
      summary: '第五章是主线总考试，要求玩家把前四章学到的东西同时成立。',
    },
    enemyPool: ['fire_dragon', 'young_dragon', 'stone_guard', 'ballista', 'shadow_assassin'],
    suggestedHeroes: ['dragon_rider', 'warlord'],
    timeLimitMs: 480000,
    playerBaseHp: 3200,
    enemyBaseHp: 4200,
    startingGold: 150,
    bossUnitId: 'fire_dragon',
    bossWarning: '赤焰龙皇会把空层、地面和刺杀位一起点亮，收口能力才是最后考试。',
    levels: [
      {
        name: '王庭压制',
        hint: '最后一章先考你能不能快速识别“这一波到底哪层最致命”。',
        recommendedTags: ['frontline', 'antiAir'],
        description: '第五章开门就把混编识别拉满，让玩家先学会读整张战场。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：别一股脑补同一种兵，先认清真正的主压层。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 8, count: 2, intervalSec: 10.4, laneOverride: 'front', note: '地面硬墙开局。' },
            { unitId: 'young_dragon', firstDelaySec: 16, count: 2, intervalSec: 9.2, laneOverride: 'air', note: '空层同步施压。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 160, pressure: 'contest', warning: '中段会让地面和空层都保持压力，补位必须同步。', spawnGroups: [
            { unitId: 'ballista', firstDelaySec: 6, count: 2, intervalSec: 9, laneOverride: 'rear', note: '远程压住中后排。' },
            { unitId: 'young_dragon', firstDelaySec: 10, count: 3, intervalSec: 8.8, laneOverride: 'air', note: '空层持续给压。' },
          ] },
          { label: '尾段加压', startAtSec: 160, pressure: 'pressure', warning: '尾段会补刺杀位，读题慢一拍就会直接掉后排。', spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 7, count: 3, intervalSec: 7.8, laneOverride: 'mid', note: '刺杀位切后排。' },
            { unitId: 'stone_guard', firstDelaySec: 13, count: 2, intervalSec: 10.2, laneOverride: 'front', note: '硬墙继续拖线。' },
          ] },
        ],
      },
      {
        name: '焚天空袭',
        hint: '空层高压会逼着你一直补位，但地面也不会停。',
        recommendedTags: ['antiAir', 'finisher'],
        description: '强化最终章的空层难度，并开始加入终局节奏判断。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：空层是主轴，但别忘了地面还会给你站位难题。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 3, intervalSec: 8.6, laneOverride: 'air', note: '空袭起手。' },
            { unitId: 'ballista', firstDelaySec: 15, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '地面远程同步到。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 156, pressure: 'contest', warning: '中段火龙会正式入场，空层已经不是骚扰而是主战场。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 6, count: 2, intervalSec: 12.4, laneOverride: 'air', note: '火龙接手空层。' },
            { unitId: 'young_dragon', firstDelaySec: 11, count: 3, intervalSec: 8.2, laneOverride: 'air', note: '幼龙补密度。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段会接刺杀位，空地混编正式拉满。', spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 6, count: 3, intervalSec: 7.4, laneOverride: 'mid', note: '刺杀位逼处理。' },
            { unitId: 'fire_dragon', firstDelaySec: 12, count: 2, intervalSec: 12.2, laneOverride: 'air', note: '火龙继续轰顶。' },
          ] },
        ],
      },
      {
        name: '大怪集群',
        hint: '这关会把大体型单位堆到一起，逼你做终结选择。',
        recommendedTags: ['finisher', 'pierce'],
        description: '用大目标混编考验玩家的收口能力。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 58, pressure: 'read', warning: '本关命题：终结位要打在真正的大目标上。', spawnGroups: [
            { unitId: 'stone_guard', firstDelaySec: 8, count: 2, intervalSec: 10.2, laneOverride: 'front', note: '地面大怪先手。' },
            { unitId: 'young_dragon', firstDelaySec: 17, count: 2, intervalSec: 8.8, laneOverride: 'air', note: '空层中怪接力。' },
          ] },
          { label: '中段对推', startAtSec: 58, endAtSec: 164, pressure: 'contest', warning: '中段火龙和硬墙会一起上来，你得决定先拆哪边。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 6, count: 2, intervalSec: 12.2, laneOverride: 'air', note: '火龙抬空压。' },
            { unitId: 'stone_guard', firstDelaySec: 12, count: 3, intervalSec: 10, laneOverride: 'front', note: '硬墙稳地面。' },
          ] },
          { label: '尾段加压', startAtSec: 164, pressure: 'pressure', warning: '尾段会补刺杀和炮台，收口顺序错了就会两头都没处理掉。', spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 6, count: 3, intervalSec: 7.2, laneOverride: 'mid', note: '刺杀位逼切换目标。' },
            { unitId: 'ballista', firstDelaySec: 13, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '炮台继续压后排。' },
          ] },
        ],
      },
      {
        name: '双技能协同',
        hint: '这一关不是拼一个技能爆发，而是拼两个技能能不能交在真节点上。',
        recommendedTags: ['antiAir', 'haste'],
        description: '正式把英雄技和战术技的协同纳入主线考试。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：技能要按节点交，不是见压力就全按。', spawnGroups: [
            { unitId: 'ballista', firstDelaySec: 8, count: 2, intervalSec: 8.8, laneOverride: 'rear', note: '后排先手。' },
            { unitId: 'young_dragon', firstDelaySec: 16, count: 2, intervalSec: 8.6, laneOverride: 'air', note: '空层同步给压。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 158, pressure: 'contest', warning: '中段会把刺杀位和空袭一起叠上来，技能顺序很关键。', spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 6, count: 3, intervalSec: 7.6, laneOverride: 'mid', note: '刺杀位切中后排。' },
            { unitId: 'young_dragon', firstDelaySec: 10, count: 3, intervalSec: 8.2, laneOverride: 'air', note: '空层继续拉满。' },
          ] },
          { label: '尾段加压', startAtSec: 158, pressure: 'pressure', warning: '尾段火龙和硬墙一起上，技能交错了就没有第二次机会。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 6, count: 2, intervalSec: 11.8, laneOverride: 'air', note: '火龙压收尾。' },
            { unitId: 'stone_guard', firstDelaySec: 12, count: 2, intervalSec: 9.8, laneOverride: 'front', note: '地面硬墙拖窗口。' },
          ] },
        ],
      },
      {
        name: '王庭决战前',
        hint: '这是总 Boss 前的最终考试，混编识别和收口能力都要成立。',
        recommendedTags: ['finisher', 'pierce', 'antiAir'],
        description: '总决战前的综合考，把第五章两道题合并拉满。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 58, pressure: 'read', warning: '本关命题：先识别主压层，再判断最后该怎么收。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 3, intervalSec: 8.4, laneOverride: 'air', note: '空层开卷。' },
            { unitId: 'stone_guard', firstDelaySec: 15, count: 2, intervalSec: 10, laneOverride: 'front', note: '地面硬墙同步到。' },
          ] },
          { label: '中段对推', startAtSec: 58, endAtSec: 166, pressure: 'contest', warning: '中段会让炮台、刺杀和空袭同时工作，必须保持整套阵容都在线。', spawnGroups: [
            { unitId: 'ballista', firstDelaySec: 6, count: 2, intervalSec: 8.6, laneOverride: 'rear', note: '炮台给压。' },
            { unitId: 'shadow_assassin', firstDelaySec: 11, count: 3, intervalSec: 7.2, laneOverride: 'mid', note: '刺杀位切后排。' },
          ] },
          { label: '尾段加压', startAtSec: 166, pressure: 'pressure', warning: '尾段火龙会把窗口压到最窄，准备好真正的终结手。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 7, count: 2, intervalSec: 11.6, laneOverride: 'air', note: '火龙终压。' },
            { unitId: 'stone_guard', firstDelaySec: 13, count: 2, intervalSec: 9.6, laneOverride: 'front', note: '地面继续拖。' },
          ] },
        ],
      },
      {
        name: '赤焰龙皇',
        hint: '最后一战考的是全局节奏：读题、补位、技能、收口，任何一环断掉都会被龙皇拉死。',
        recommendedTags: ['antiAir', 'finisher', 'pierce'],
        description: '第五章总 Boss，把五章主线的所有命题都压进一场正式终局战。',
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 48, pressure: 'read', warning: '最终 Boss 开场：先确认主压层，别为了摸龙皇把阵型送掉。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 6, count: 3, intervalSec: 8.2, laneOverride: 'air', note: '空层起手。' },
            { unitId: 'stone_guard', firstDelaySec: 15, count: 2, intervalSec: 10, laneOverride: 'front', note: '地面硬墙同步到。' },
          ] },
          { label: '中段对推', startAtSec: 48, endAtSec: 104, pressure: 'contest', warning: '前哨战会把炮台和刺杀一起补上，必须整套阵容都能工作。', spawnGroups: [
            { unitId: 'ballista', firstDelaySec: 5, count: 2, intervalSec: 8.4, laneOverride: 'rear', note: '炮台压后排。' },
            { unitId: 'shadow_assassin', firstDelaySec: 12, count: 3, intervalSec: 7, laneOverride: 'mid', note: '刺杀位切线。' },
          ] },
          { label: 'Boss 登场', startAtSec: 104, endAtSec: 162, pressure: 'boss', warning: '赤焰龙皇入场，先顶住第一轮空地混压。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'air', note: 'Boss 本体登场。' },
          ] },
          { label: '终局收口', startAtSec: 162, pressure: 'pressure', warning: '最后窗口会被龙火、刺杀和硬墙一起压缩，终局必须果断收口。', spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 7, count: 3, intervalSec: 6.8, laneOverride: 'mid', note: '刺杀继续扰乱。' },
            { unitId: 'stone_guard', firstDelaySec: 12, count: 2, intervalSec: 9.8, laneOverride: 'front', note: '硬墙继续拖线。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '赤焰龙皇第一段会先用空袭和地面硬墙抢回合。', skills: ['air-supremacy', 'royal-wall'], spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 3, count: 3, intervalSec: 8, laneOverride: 'air', note: '幼龙先抢空。' },
            { unitId: 'stone_guard', firstDelaySec: 9, count: 3, intervalSec: 9.8, laneOverride: 'front', note: '硬墙稳地面。' },
          ] },
          { hpThreshold: 74, enterWarning: 'Boss 第一阈值转段，炮台和刺杀会开始切你后排。', skills: ['backline-break', 'royal-hunt'], spawnGroups: [
            { unitId: 'ballista', firstDelaySec: 3, count: 2, intervalSec: 8.2, laneOverride: 'rear', note: '炮台锁后排。' },
            { unitId: 'shadow_assassin', firstDelaySec: 8, count: 3, intervalSec: 6.8, laneOverride: 'mid', note: '刺杀位补切。' },
          ] },
          { hpThreshold: 42, enterWarning: 'Boss 第二阈值转段，火龙群会把空层彻底变成主战场。', skills: ['dragon-wing', 'skyfire'], spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 2, count: 2, intervalSec: 11.6, laneOverride: 'air', note: '火龙群成型。' },
            { unitId: 'young_dragon', firstDelaySec: 8, count: 3, intervalSec: 8.4, laneOverride: 'air', note: '幼龙补密度。' },
          ] },
          { hpThreshold: 18, enterWarning: '赤焰龙皇狂暴，终局会把空层、地面和刺杀位一起拉满。', skills: ['enrage', 'final-crown'], spawnGroups: [
            { unitId: 'shadow_assassin', firstDelaySec: 2, count: 3, intervalSec: 6.6, laneOverride: 'mid', note: '刺杀狂暴。' },
            { unitId: 'stone_guard', firstDelaySec: 7, count: 2, intervalSec: 9.4, laneOverride: 'front', note: '硬墙终局。' },
          ] },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-6',
      order: 6,
      name: '幽暗密林',
      theme: '暗影穿梭与精灵弓阵',
      focus: '多线处理 / 暗影应对',
      bossName: '暗影领主',
      summary: '第六章把暗影与精灵弓阵结合，要求玩家同时处理多线压力。',
    },
    enemyPool: ['shadow_hunter', 'wind_spirit', 'druid', 'elf_shooter', 'crypt_crawler', 'orc_heavy'],
    suggestedHeroes: ['archmage', 'dragon_rider'],
    timeLimitMs: 480000,
    playerBaseHp: 3200,
    enemyBaseHp: 4500,
    startingGold: 148,
    bossUnitId: 'shadow_lord',
    bossWarning: '暗影领主会在多阶段召唤暗影猎手与风灵，必须保持多线处理能力。',
    levels: [
      {
        name: '林间伏击',
        hint: '暗影猎手与风灵的组合会同时压迫中线与空层。',
        recommendedTags: ['antiAir', 'frontline'],
        description: '第六章开门就让玩家面对暗影与风灵的双重压力。',
        unlockRewards: ['wind_spirit'],
        fragmentRewards: { elf_shooter: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 52, pressure: 'read', warning: '本关命题：先稳住中线，同时补对空处理风灵。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 6, count: 3, intervalSec: 6.2, laneOverride: 'mid', note: '暗影猎手压中线。' },
            { unitId: 'wind_spirit', firstDelaySec: 14, count: 2, intervalSec: 7.5, laneOverride: 'air', note: '风灵骚扰空层。' },
          ] },
          { label: '中段对推', startAtSec: 52, endAtSec: 148, pressure: 'contest', warning: '中段精灵弓手会加入后排，记得保护己方后排。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 5, count: 4, intervalSec: 5.8, laneOverride: 'mid', note: '暗影猎手持续施压。' },
            { unitId: 'elf_shooter', firstDelaySec: 12, count: 3, intervalSec: 7.2, laneOverride: 'rear', note: '精灵弓手后排输出。' },
          ] },
          { label: '尾段加压', startAtSec: 148, pressure: 'pressure', warning: '尾段德鲁伊会加入战局，暗影猎手继续压迫中线。', spawnGroups: [
            { unitId: 'druid', firstDelaySec: 8, count: 2, intervalSec: 9.5, laneOverride: 'rear', note: '德鲁伊后排支援。' },
            { unitId: 'shadow_hunter', firstDelaySec: 14, count: 3, intervalSec: 5.4, laneOverride: 'mid', note: '暗影猎手终压。' },
          ] },
        ],
      },
      {
        name: '古树防线',
        hint: '爬虫海与德鲁伊的组合考验清潮与后排处理。',
        recommendedTags: ['aoe', 'frontline'],
        description: '用爬虫海和德鲁伊测试玩家的清潮能力。',
        unlockRewards: ['druid'],
        fragmentRewards: { shadow_hunter: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：爬虫海会持续滚上来，先补群伤。', spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 5, count: 5, intervalSec: 3.8, laneOverride: 'mid', note: '爬虫海开局。' },
            { unitId: 'druid', firstDelaySec: 16, count: 2, intervalSec: 10, laneOverride: 'rear', note: '德鲁伊后排支援。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 150, pressure: 'contest', warning: '中段精灵弓手会加入，爬虫继续推进。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 5, count: 4, intervalSec: 6.8, laneOverride: 'rear', note: '精灵弓手后排压制。' },
            { unitId: 'crypt_crawler', firstDelaySec: 11, count: 4, intervalSec: 4.2, laneOverride: 'mid', note: '爬虫持续滚线。' },
          ] },
          { label: '尾段加压', startAtSec: 150, pressure: 'pressure', warning: '尾段暗影猎手与德鲁伊同时施压。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 7, count: 3, intervalSec: 5.6, laneOverride: 'mid', note: '暗影猎手终压。' },
            { unitId: 'druid', firstDelaySec: 13, count: 2, intervalSec: 9.2, laneOverride: 'rear', note: '德鲁伊继续支援。' },
          ] },
        ],
      },
      {
        name: '暗影穿梭',
        hint: '风灵与暗影猎手的高频组合考验反应速度。',
        recommendedTags: ['antiAir', 'burst'],
        description: '高频风灵与暗影猎手的穿梭战。',
        fragmentRewards: { shadow_hunter: 2, wind_spirit: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 50, pressure: 'read', warning: '本关命题：风灵高频骚扰，暗影猎手同步压迫。', spawnGroups: [
            { unitId: 'wind_spirit', firstDelaySec: 6, count: 4, intervalSec: 4.5, laneOverride: 'air', note: '风灵高频空袭。' },
            { unitId: 'shadow_hunter', firstDelaySec: 15, count: 2, intervalSec: 7, laneOverride: 'mid', note: '暗影猎手中线施压。' },
          ] },
          { label: '中段对推', startAtSec: 50, endAtSec: 146, pressure: 'contest', warning: '中段暗影猎手密度提升，精灵弓手后排支援。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 5, count: 5, intervalSec: 5.2, laneOverride: 'mid', note: '暗影猎手密集推进。' },
            { unitId: 'elf_shooter', firstDelaySec: 12, count: 3, intervalSec: 7, laneOverride: 'rear', note: '精灵弓手后排输出。' },
          ] },
          { label: '尾段加压', startAtSec: 146, pressure: 'pressure', warning: '尾段风灵与暗影猎手同时拉满。', spawnGroups: [
            { unitId: 'wind_spirit', firstDelaySec: 6, count: 3, intervalSec: 4.2, laneOverride: 'air', note: '风灵终压。' },
            { unitId: 'shadow_hunter', firstDelaySec: 11, count: 3, intervalSec: 5, laneOverride: 'mid', note: '暗影猎手终压。' },
          ] },
        ],
      },
      {
        name: '精灵弓阵',
        hint: '精灵弓手阵列考验后排突破能力。',
        recommendedTags: ['pierce', 'frontline'],
        description: '面对精灵弓阵，需要有效的后排突破手段。',
        unlockRewards: ['heavy_crossbow'],
        fragmentRewards: { druid: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：精灵弓手与爬虫的组合需要前后兼顾。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 8, count: 3, intervalSec: 7.5, laneOverride: 'rear', note: '精灵弓手起手。' },
            { unitId: 'crypt_crawler', firstDelaySec: 16, count: 3, intervalSec: 5, laneOverride: 'mid', note: '爬虫中线配合。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 154, pressure: 'contest', warning: '中段精灵弓手密度提升，德鲁伊加入支援。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 5, count: 5, intervalSec: 6.2, laneOverride: 'rear', note: '精灵弓手阵列成型。' },
            { unitId: 'druid', firstDelaySec: 13, count: 2, intervalSec: 9.8, laneOverride: 'rear', note: '德鲁伊后排支援。' },
          ] },
          { label: '尾段加压', startAtSec: 154, pressure: 'pressure', warning: '尾段暗影猎手与精灵弓手同时施压。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 7, count: 4, intervalSec: 5, laneOverride: 'mid', note: '暗影猎手终压。' },
            { unitId: 'elf_shooter', firstDelaySec: 12, count: 3, intervalSec: 6.5, laneOverride: 'rear', note: '精灵弓手继续输出。' },
          ] },
        ],
      },
      {
        name: '密林总测',
        hint: '第六章综合测试，暗影、风灵、精灵弓手同时出现。',
        recommendedTags: ['antiAir', 'frontline', 'burst'],
        description: '第六章考试关，综合验证多线处理能力。',
        fragmentRewards: { shadow_hunter: 1, wind_spirit: 1, druid: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：暗影与风灵的组合开场，先稳住阵型。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 6, count: 3, intervalSec: 6, laneOverride: 'mid', note: '暗影猎手起手。' },
            { unitId: 'wind_spirit', firstDelaySec: 14, count: 3, intervalSec: 4.8, laneOverride: 'air', note: '风灵同步骚扰。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 156, pressure: 'contest', warning: '中段三线压力同时到来，阵容不能偏科。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 6, count: 4, intervalSec: 6.5, laneOverride: 'rear', note: '精灵弓手后排压制。' },
            { unitId: 'druid', firstDelaySec: 12, count: 2, intervalSec: 9.5, laneOverride: 'rear', note: '德鲁伊支援。' },
            { unitId: 'shadow_hunter', firstDelaySec: 18, count: 3, intervalSec: 5.5, laneOverride: 'mid', note: '暗影猎手中线施压。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段风灵与暗影猎手同时拉满，准备好收口。', spawnGroups: [
            { unitId: 'wind_spirit', firstDelaySec: 6, count: 3, intervalSec: 4.2, laneOverride: 'air', note: '风灵终压。' },
            { unitId: 'shadow_hunter', firstDelaySec: 11, count: 3, intervalSec: 5, laneOverride: 'mid', note: '暗影猎手终压。' },
          ] },
        ],
      },
      {
        name: '暗影领主',
        hint: 'Boss 关会分阶段召唤大量暗影单位，必须抓住每个停顿点收口。',
        recommendedTags: ['antiAir', 'burst', 'frontline'],
        description: '第六章 Boss 关，暗影领主的多阶段召唤战。',
        unlockRewards: ['shadow_hunter'],
        fragmentRewards: { shadow_hunter: 2, wind_spirit: 1, druid: 1 },
        starRewards: { 3: ['blade_master'] },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 46, pressure: 'read', warning: 'Boss 关开场：先处理暗影猎手与风灵的组合。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 6, count: 3, intervalSec: 6, laneOverride: 'mid', note: '暗影猎手起手。' },
            { unitId: 'wind_spirit', firstDelaySec: 14, count: 2, intervalSec: 5, laneOverride: 'air', note: '风灵同步骚扰。' },
          ] },
          { label: '中段对推', startAtSec: 46, endAtSec: 98, pressure: 'contest', warning: '前哨战精灵弓手与德鲁伊加入，保持多线处理。', spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 5, count: 3, intervalSec: 7, laneOverride: 'rear', note: '精灵弓手后排输出。' },
            { unitId: 'druid', firstDelaySec: 13, count: 2, intervalSec: 9.5, laneOverride: 'rear', note: '德鲁伊支援。' },
          ] },
          { label: 'Boss 登场', startAtSec: 98, endAtSec: 154, pressure: 'boss', warning: '暗影领主入场，先顶住第一轮召唤。', spawnGroups: [
            { unitId: 'shadow_lord', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'mid', note: 'Boss 本体入场。' },
          ] },
          { label: '终局收口', startAtSec: 154, pressure: 'pressure', warning: '终局暗影猎手与风灵同时补压，抓住最后窗口。', spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 7, count: 3, intervalSec: 5.2, laneOverride: 'mid', note: '暗影猎手终压。' },
            { unitId: 'wind_spirit', firstDelaySec: 12, count: 2, intervalSec: 4.5, laneOverride: 'air', note: '风灵终压。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '暗影领主第一段会召唤暗影猎手群。', skills: ['shadow-summon', 'dark-veil'], spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 3, count: 4, intervalSec: 2, laneOverride: 'mid', note: '暗影猎手群召唤。' },
          ] },
          { hpThreshold: 72, enterWarning: 'Boss 第一阈值转段，精灵弓手与风灵加入战场。', skills: ['elf-barrage', 'wind-rush'], spawnGroups: [
            { unitId: 'elf_shooter', firstDelaySec: 3, count: 3, intervalSec: 3, laneOverride: 'rear', note: '精灵弓手齐射。' },
            { unitId: 'wind_spirit', firstDelaySec: 8, count: 3, intervalSec: 2.5, laneOverride: 'air', note: '风灵群袭。' },
          ] },
          { hpThreshold: 44, enterWarning: 'Boss 第二阈值转段，爬虫海与德鲁伊同时出现。', skills: ['crawler-swarm', 'druid-heal'], spawnGroups: [
            { unitId: 'crypt_crawler', firstDelaySec: 3, count: 5, intervalSec: 2, laneOverride: 'mid', note: '爬虫海涌来。' },
            { unitId: 'druid', firstDelaySec: 9, count: 2, intervalSec: 4, laneOverride: 'rear', note: '德鲁伊治疗支援。' },
          ] },
          { hpThreshold: 20, enterWarning: '暗影领主狂暴，暗影猎手与风灵高频召唤。', skills: ['enrage', 'shadow-storm'], spawnGroups: [
            { unitId: 'shadow_hunter', firstDelaySec: 3, count: 6, intervalSec: 1.5, laneOverride: 'mid', note: '暗影猎手狂暴。' },
            { unitId: 'wind_spirit', firstDelaySec: 7, count: 4, intervalSec: 1.8, laneOverride: 'air', note: '风灵狂暴。' },
          ] },
        ],
      },
    ],
  },
  {
    chapter: {
      id: 'chapter-7',
      order: 7,
      name: '天空之城',
      theme: '龙族空战与天使降临',
      focus: '对空决战 / 龙族应对',
      bossName: '风暴巨龙',
      summary: '第七章把天空战场拉满，龙族与天使的组合考验终极对空能力。',
    },
    enemyPool: ['fire_dragon', 'young_dragon', 'phoenix', 'stone_guard', 'shadow_assassin'],
    suggestedHeroes: ['dragon_rider', 'archmage'],
    timeLimitMs: 510000,
    playerBaseHp: 3300,
    enemyBaseHp: 4800,
    startingGold: 155,
    bossUnitId: 'storm_dragon',
    bossWarning: '风暴巨龙会召唤龙族群与天使，天空战场将全面爆发。',
    levels: [
      {
        name: '云端前哨',
        hint: '风灵与幼龙的组合开场，确认对空阵容是否成型。',
        recommendedTags: ['antiAir', 'burst'],
        description: '第七章开门就用空层单位测试对空能力。',
        unlockRewards: ['thunder_eagle'],
        fragmentRewards: { young_dragon: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 52, pressure: 'read', warning: '本关命题：风灵与幼龙同时出现，对空位必须到位。', spawnGroups: [
            { unitId: 'wind_spirit', firstDelaySec: 6, count: 4, intervalSec: 4.2, laneOverride: 'air', note: '风灵高频骚扰。' },
            { unitId: 'young_dragon', firstDelaySec: 15, count: 2, intervalSec: 9, laneOverride: 'air', note: '幼龙空层施压。' },
          ] },
          { label: '中段对推', startAtSec: 52, endAtSec: 148, pressure: 'contest', warning: '中段雷鹰加入，风灵持续骚扰。', spawnGroups: [
            { unitId: 'thunder_eagle', firstDelaySec: 5, count: 3, intervalSec: 8.5, laneOverride: 'air', note: '雷鹰空层压制。' },
            { unitId: 'wind_spirit', firstDelaySec: 11, count: 3, intervalSec: 4.5, laneOverride: 'air', note: '风灵持续骚扰。' },
          ] },
          { label: '尾段加压', startAtSec: 148, pressure: 'pressure', warning: '尾段幼龙与雷鹰同时施压。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 2, intervalSec: 8.8, laneOverride: 'air', note: '幼龙终压。' },
            { unitId: 'thunder_eagle', firstDelaySec: 13, count: 2, intervalSec: 8.2, laneOverride: 'air', note: '雷鹰终压。' },
          ] },
        ],
      },
      {
        name: '凤凰涅槃',
        hint: '凤凰的高血量与重生机制考验持续输出能力。',
        recommendedTags: ['antiAir', 'finisher'],
        description: '凤凰登场，测试玩家的持续对空输出。',
        unlockRewards: ['phoenix'],
        fragmentRewards: { thunder_eagle: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：凤凰与风灵的组合，先处理高威胁目标。', spawnGroups: [
            { unitId: 'phoenix', firstDelaySec: 8, count: 2, intervalSec: 11, laneOverride: 'air', note: '凤凰起手。' },
            { unitId: 'wind_spirit', firstDelaySec: 15, count: 3, intervalSec: 4.5, laneOverride: 'air', note: '风灵骚扰。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 152, pressure: 'contest', warning: '中段凤凰与雷鹰同时出现，对空压力升级。', spawnGroups: [
            { unitId: 'phoenix', firstDelaySec: 5, count: 2, intervalSec: 10.5, laneOverride: 'air', note: '凤凰持续施压。' },
            { unitId: 'thunder_eagle', firstDelaySec: 12, count: 3, intervalSec: 8.2, laneOverride: 'air', note: '雷鹰加入战场。' },
          ] },
          { label: '尾段加压', startAtSec: 152, pressure: 'pressure', warning: '尾段幼龙与凤凰组合，准备好收口。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 2, intervalSec: 8.5, laneOverride: 'air', note: '幼龙终压。' },
            { unitId: 'phoenix', firstDelaySec: 13, count: 1, intervalSec: 10, laneOverride: 'air', note: '凤凰最后施压。' },
          ] },
        ],
      },
      {
        name: '天使降临',
        hint: '天使的高治疗与高血量考验爆发输出。',
        recommendedTags: ['antiAir', 'burst'],
        description: '天使登场，测试玩家的爆发对空能力。',
        unlockRewards: ['angel'],
        fragmentRewards: { phoenix: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：天使与风灵的组合，优先处理天使。', spawnGroups: [
            { unitId: 'angel', firstDelaySec: 9, count: 2, intervalSec: 12, laneOverride: 'air', note: '天使起手。' },
            { unitId: 'wind_spirit', firstDelaySec: 15, count: 3, intervalSec: 4.2, laneOverride: 'air', note: '风灵骚扰。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 156, pressure: 'contest', warning: '中段天使、雷鹰、幼龙三线空压。', spawnGroups: [
            { unitId: 'angel', firstDelaySec: 5, count: 2, intervalSec: 11.5, laneOverride: 'air', note: '天使持续施压。' },
            { unitId: 'thunder_eagle', firstDelaySec: 10, count: 3, intervalSec: 8, laneOverride: 'air', note: '雷鹰加入。' },
            { unitId: 'young_dragon', firstDelaySec: 16, count: 2, intervalSec: 8.8, laneOverride: 'air', note: '幼龙同步施压。' },
          ] },
          { label: '尾段加压', startAtSec: 156, pressure: 'pressure', warning: '尾段天使与凤凰组合，抓住最后窗口。', spawnGroups: [
            { unitId: 'angel', firstDelaySec: 7, count: 2, intervalSec: 11, laneOverride: 'air', note: '天使终压。' },
            { unitId: 'phoenix', firstDelaySec: 13, count: 1, intervalSec: 10, laneOverride: 'air', note: '凤凰最后施压。' },
          ] },
        ],
      },
      {
        name: '龙群风暴',
        hint: '龙族群集考验对空群伤与单体爆发。',
        recommendedTags: ['antiAir', 'aoe'],
        description: '龙族群集风暴，综合对空能力测试。',
        fragmentRewards: { young_dragon: 2, phoenix: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 54, pressure: 'read', warning: '本关命题：幼龙与雷鹰的组合开场。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 3, intervalSec: 8.5, laneOverride: 'air', note: '幼龙群起手。' },
            { unitId: 'thunder_eagle', firstDelaySec: 15, count: 2, intervalSec: 8.2, laneOverride: 'air', note: '雷鹰同步。' },
          ] },
          { label: '中段对推', startAtSec: 54, endAtSec: 154, pressure: 'contest', warning: '中段火龙、幼龙、天使三线空压。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 6, count: 2, intervalSec: 11.5, laneOverride: 'air', note: '火龙加入战场。' },
            { unitId: 'young_dragon', firstDelaySec: 11, count: 3, intervalSec: 8, laneOverride: 'air', note: '幼龙持续施压。' },
            { unitId: 'angel', firstDelaySec: 17, count: 1, intervalSec: 12, laneOverride: 'air', note: '天使支援。' },
          ] },
          { label: '尾段加压', startAtSec: 154, pressure: 'pressure', warning: '尾段火龙与凤凰组合，准备好收口。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 7, count: 2, intervalSec: 11, laneOverride: 'air', note: '火龙终压。' },
            { unitId: 'phoenix', firstDelaySec: 13, count: 1, intervalSec: 10, laneOverride: 'air', note: '凤凰最后施压。' },
          ] },
        ],
      },
      {
        name: '天空决战前',
        hint: '最终 Boss 前的综合测试，所有天空单位都会出现。',
        recommendedTags: ['antiAir', 'burst', 'finisher'],
        description: '第七章考试关，综合验证对空决战能力。',
        fragmentRewards: { thunder_eagle: 1, phoenix: 1, angel: 1 },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 56, pressure: 'read', warning: '本关命题：幼龙与雷鹰组合开场，确认对空阵型。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 3, intervalSec: 8.2, laneOverride: 'air', note: '幼龙群起手。' },
            { unitId: 'thunder_eagle', firstDelaySec: 15, count: 2, intervalSec: 8, laneOverride: 'air', note: '雷鹰同步。' },
          ] },
          { label: '中段对推', startAtSec: 56, endAtSec: 158, pressure: 'contest', warning: '中段火龙、天使、凤凰三线空压。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 6, count: 2, intervalSec: 11.2, laneOverride: 'air', note: '火龙加入。' },
            { unitId: 'angel', firstDelaySec: 11, count: 2, intervalSec: 11.5, laneOverride: 'air', note: '天使双位。' },
            { unitId: 'phoenix', firstDelaySec: 17, count: 1, intervalSec: 10, laneOverride: 'air', note: '凤凰施压。' },
          ] },
          { label: '尾段加压', startAtSec: 158, pressure: 'pressure', warning: '尾段火龙与幼龙组合，抓住最后窗口。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 7, count: 2, intervalSec: 10.8, laneOverride: 'air', note: '火龙终压。' },
            { unitId: 'young_dragon', firstDelaySec: 12, count: 3, intervalSec: 7.8, laneOverride: 'air', note: '幼龙终压。' },
          ] },
        ],
      },
      {
        name: '风暴巨龙',
        hint: 'Boss 关会分阶段召唤龙族群与天使，天空战场全面爆发。',
        recommendedTags: ['antiAir', 'burst', 'finisher'],
        description: '第七章 Boss 关，风暴巨龙的多阶段空战。',
        unlockRewards: ['gargoyle'],
        fragmentRewards: { young_dragon: 2, phoenix: 1, angel: 1 },
        starRewards: { 3: ['elementalist'] },
        phases: [
          { label: '开场读题', startAtSec: 0, endAtSec: 48, pressure: 'read', warning: 'Boss 关开场：幼龙与雷鹰组合，先稳住空层。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 6, count: 3, intervalSec: 8, laneOverride: 'air', note: '幼龙群起手。' },
            { unitId: 'thunder_eagle', firstDelaySec: 14, count: 2, intervalSec: 8, laneOverride: 'air', note: '雷鹰同步。' },
          ] },
          { label: '中段对推', startAtSec: 48, endAtSec: 102, pressure: 'contest', warning: '前哨战火龙与天使加入，保持对空输出。', spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 5, count: 2, intervalSec: 11, laneOverride: 'air', note: '火龙加入。' },
            { unitId: 'angel', firstDelaySec: 12, count: 2, intervalSec: 11.5, laneOverride: 'air', note: '天使双位。' },
          ] },
          { label: 'Boss 登场', startAtSec: 102, endAtSec: 158, pressure: 'boss', warning: '风暴巨龙入场，先顶住第一轮空袭。', spawnGroups: [
            { unitId: 'storm_dragon', firstDelaySec: 2, count: 1, intervalSec: 999, laneOverride: 'air', note: 'Boss 本体入场。' },
          ] },
          { label: '终局收口', startAtSec: 158, pressure: 'pressure', warning: '终局幼龙与凤凰同时补压，抓住最后窗口。', spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 7, count: 3, intervalSec: 7.8, laneOverride: 'air', note: '幼龙终压。' },
            { unitId: 'phoenix', firstDelaySec: 12, count: 1, intervalSec: 10, laneOverride: 'air', note: '凤凰最后施压。' },
          ] },
        ],
        bossPhases: [
          { hpThreshold: 100, enterWarning: '风暴巨龙第一段会召唤幼龙群与风灵。', skills: ['dragon-summon', 'wind-gust'], spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 3, count: 4, intervalSec: 2, laneOverride: 'air', note: '幼龙群召唤。' },
            { unitId: 'wind_spirit', firstDelaySec: 8, count: 3, intervalSec: 2.5, laneOverride: 'air', note: '风灵群袭。' },
          ] },
          { hpThreshold: 70, enterWarning: 'Boss 第一阈值转段，火龙加入战场。', skills: ['fire-breath', 'sky-storm'], spawnGroups: [
            { unitId: 'fire_dragon', firstDelaySec: 3, count: 2, intervalSec: 4, laneOverride: 'air', note: '火龙加入。' },
          ] },
          { hpThreshold: 40, enterWarning: 'Boss 第二阈值转段，天使与凤凰同时出现。', skills: ['angel-descend', 'phoenix-rebirth'], spawnGroups: [
            { unitId: 'angel', firstDelaySec: 3, count: 2, intervalSec: 5, laneOverride: 'air', note: '天使降临。' },
            { unitId: 'phoenix', firstDelaySec: 9, count: 1, intervalSec: 6, laneOverride: 'air', note: '凤凰重生。' },
          ] },
          { hpThreshold: 18, enterWarning: '风暴巨龙狂暴，幼龙群与火龙高频召唤。', skills: ['enrage', 'tempest'], spawnGroups: [
            { unitId: 'young_dragon', firstDelaySec: 3, count: 6, intervalSec: 1.5, laneOverride: 'air', note: '幼龙狂暴。' },
            { unitId: 'fire_dragon', firstDelaySec: 7, count: 3, intervalSec: 2, laneOverride: 'air', note: '火龙狂暴。' },
          ] },
        ],
      },
    ],
  },
];

const CHAPTERS: FantasyLaneChapterDefinition[] = CHAPTER_BLUEPRINTS.map((entry) => entry.chapter);

function createLevel(chapter: ChapterBlueprint, levelIndex: number): FantasyLaneLevelDefinition {
  const blueprint = chapter.levels[levelIndex - 1];
  const chapterOrder = chapter.chapter.order;
  const levelId = `${chapterOrder}-${levelIndex}`;
  const isBoss = levelIndex === 6;

  return {
    id: levelId,
    chapterId: chapter.chapter.id,
    chapterName: chapter.chapter.name,
    indexInChapter: levelIndex,
    name: blueprint.name,
    description: blueprint.description,
    battleTimeLimitMs: chapter.timeLimitMs,
    playerBaseHp: chapter.playerBaseHp + (levelIndex > 3 && !isBoss ? 80 : 0),
    enemyBaseHp: chapter.enemyBaseHp + (levelIndex - 1) * (chapterOrder * 90),
    startingGold: chapter.startingGold + (levelIndex > 4 ? 10 : 0),
    enemyPressure: Math.min(5, chapterOrder + Math.floor(levelIndex / 2)),
    enemyPool: chapter.enemyPool,
    recommendedTags: blueprint.recommendedTags,
    suggestedHeroes: chapter.suggestedHeroes,
    hint: blueprint.hint,
    phases: createPhaseDefinitions(levelId, blueprint.phases),
    boss: isBoss && blueprint.bossPhases ? createBoss(levelId, chapter, blueprint.bossPhases) : undefined,
    ratingRules: { threeStarBaseHpPercent: 75, twoStarBaseHpPercent: 50 },
    failureHints: createFailureHints(chapterOrder),
    unlockReward: isBoss ? `章节突破：${chapter.chapter.bossName}` : undefined,
    unlockRewards: blueprint.unlockRewards,
    fragmentRewards: blueprint.fragmentRewards,
    starRewards: blueprint.starRewards,
  };
}

export const FANTASY_LANE_CHAPTERS = CHAPTERS;
export const FANTASY_LANE_LEVELS: FantasyLaneLevelDefinition[] = CHAPTER_BLUEPRINTS.flatMap((chapter) =>
  Array.from({ length: 6 }, (_, index) => createLevel(chapter, index + 1)),
);
export const FANTASY_LANE_LEVEL_MAP = Object.fromEntries(FANTASY_LANE_LEVELS.map((level) => [level.id, level])) as Record<
  string,
  FantasyLaneLevelDefinition
>;

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
