/* PvZ 主线 100 关数据。用章节包 + 生成器压缩维护成本，供 Sheet7/Sheet9 直接消费。 */
import type { PvZChapterId, PvZLevelDefinition, PvZPlantId, PvZSpawnEvent, PvZWaveConfig, PvZZombieId } from './pvzTypes.ts';
import { PVZ_CHAPTERS } from './pvzChapters.ts';

type LevelIntensity = PvZLevelDefinition['intensity'];
type LevelTuple = [
  title: string,
  intensity: LevelIntensity,
  unlockPlants: PvZPlantId[],
  unlockZombies: PvZZombieId[],
  enemyRoster: PvZZombieId[],
  recommendedCards: PvZPlantId[],
  exam?: boolean,
];

interface ChapterPack {
  chapterIndex: number;
  chapterId: PvZChapterId;
  baseSun: number;
  waveSeconds: number;
  levels: LevelTuple[];
}

const STARTER_POOL: PvZPlantId[] = ['sunflower', 'peashooter'];

const INTENSITY_EVENT_COUNT: Record<LevelIntensity, number> = {
  S1: 6,
  S2: 8,
  S3: 10,
  S4: 12,
  S5: 14,
  'S5+': 16,
  S6: 18,
};

const INTENSITY_WAVE_COUNT: Record<LevelIntensity, number> = {
  S1: 2,
  S2: 3,
  S3: 4,
  S4: 5,
  S5: 6,
  'S5+': 6,
  S6: 8,
};

const CHAPTER_PACKS: ChapterPack[] = [
  {
    chapterIndex: 1,
    chapterId: 'day',
    baseSun: 150,
    waveSeconds: 38,
    levels: [
      ['向阳基础', 'S1', ['sunflower'], ['normal'], ['normal'], ['sunflower', 'peashooter']],
      ['火力扩张', 'S1', ['peashooter'], [], ['normal'], ['sunflower', 'peashooter']],
      ['前排成型', 'S1', ['wallnut'], ['flag'], ['normal', 'flag'], ['sunflower', 'peashooter', 'wallnut']],
      ['埋伏急救', 'S2', ['potatoMine'], ['conehead'], ['normal', 'conehead'], ['sunflower', 'peashooter', 'wallnut', 'potatoMine']],
      ['旗帜练习', 'S2', [], [], ['normal', 'flag', 'conehead'], ['sunflower', 'peashooter', 'wallnut', 'potatoMine'], true],
      ['中局火力', 'S2', ['repeater'], [], ['normal', 'conehead', 'flag'], ['sunflower', 'repeater', 'wallnut', 'potatoMine']],
      ['减速控线', 'S2', ['snowPea'], [], ['normal', 'conehead', 'flag'], ['sunflower', 'snowPea', 'repeater', 'wallnut']],
      ['跳跃挑战', 'S3', [], ['pole'], ['normal', 'conehead', 'pole', 'flag'], ['sunflower', 'snowPea', 'repeater', 'wallnut', 'potatoMine']],
      ['中局综合', 'S3', [], [], ['normal', 'conehead', 'pole', 'flag'], ['sunflower', 'snowPea', 'repeater', 'wallnut', 'potatoMine']],
      ['白天结业', 'S3', [], [], ['normal', 'flag', 'conehead', 'pole'], ['sunflower', 'snowPea', 'repeater', 'wallnut', 'potatoMine'], true],
    ],
  },
  {
    chapterIndex: 2,
    chapterId: 'night',
    baseSun: 125,
    waveSeconds: 40,
    levels: [
      ['夜幕救场', 'S2', ['cherryBomb'], [], ['normal', 'flag', 'conehead'], ['sunflower', 'peashooter', 'wallnut', 'cherryBomb']],
      ['夜幕变速', 'S2', ['puffShroom'], ['newspaper'], ['normal', 'newspaper', 'flag'], ['sunflower', 'puffShroom', 'snowPea', 'wallnut']],
      ['近战位逼迫', 'S2', ['chomper'], [], ['normal', 'conehead', 'newspaper'], ['sunflower', 'chomper', 'peashooter', 'wallnut']],
      ['护盾压线', 'S3', ['scaredyShroom'], ['screenDoor'], ['normal', 'newspaper', 'screenDoor'], ['sunflower', 'scaredyShroom', 'cherryBomb', 'wallnut']],
      ['火线强化', 'S3', ['torchwood'], [], ['normal', 'newspaper', 'screenDoor', 'flag'], ['sunflower', 'peashooter', 'torchwood', 'wallnut', 'cherryBomb']],
      ['夜间终章', 'S3', [], [], ['normal', 'newspaper', 'screenDoor', 'flag'], ['sunflower', 'snowPea', 'torchwood', 'wallnut', 'cherryBomb'], true],
      ['阳光菇试训', 'S3', ['sunShroom'], [], ['normal', 'newspaper', 'screenDoor'], ['sunShroom', 'puffShroom', 'snowPea', 'wallnut']],
      ['低费夜守', 'S3', [], [], ['normal', 'conehead', 'newspaper', 'screenDoor'], ['sunShroom', 'puffShroom', 'scaredyShroom', 'wallnut', 'cherryBomb']],
      ['抛投救场', 'S3', [], [], ['normal', 'screenDoor', 'flag', 'conehead'], ['sunShroom', 'snowPea', 'repeater', 'wallnut', 'cherryBomb']],
      ['夜幕毕业考', 'S4', [], [], ['normal', 'newspaper', 'screenDoor', 'flag', 'conehead'], ['sunShroom', 'snowPea', 'repeater', 'wallnut', 'cherryBomb'], true],
    ],
  },
  {
    chapterIndex: 3,
    chapterId: 'pool',
    baseSun: 160,
    waveSeconds: 42,
    levels: [
      ['泳池开线', 'S3', ['lilyPad'], [], ['normal', 'conehead', 'flag'], ['sunflower', 'peashooter', 'wallnut', 'lilyPad']],
      ['睡莲部署', 'S3', ['seaShroom'], [], ['normal', 'conehead', 'flag'], ['sunflower', 'lilyPad', 'seaShroom', 'wallnut']],
      ['卷心菜抛投', 'S3', ['cabbagePult'], [], ['normal', 'conehead', 'buckethead'], ['sunflower', 'cabbagePult', 'wallnut', 'lilyPad']],
      ['双线水战', 'S4', [], ['buckethead'], ['normal', 'conehead', 'buckethead', 'flag'], ['sunflower', 'cabbagePult', 'repeater', 'wallnut', 'lilyPad']],
      ['泳池考试一', 'S4', [], ['snorkel'], ['normal', 'conehead', 'buckethead', 'snorkel'], ['sunflower', 'snowPea', 'cabbagePult', 'wallnut', 'lilyPad'], true],
      ['三线成型', 'S4', ['threepeater'], [], ['normal', 'buckethead', 'snorkel', 'flag'], ['sunflower', 'threepeater', 'wallnut', 'lilyPad', 'snowPea']],
      ['海蘑菇夜线', 'S4', [], [], ['normal', 'snorkel', 'buckethead', 'flag'], ['sunShroom', 'seaShroom', 'threepeater', 'wallnut', 'lilyPad']],
      ['海豚突线', 'S4', [], ['dolphinRider'], ['normal', 'snorkel', 'dolphinRider', 'buckethead'], ['sunflower', 'threepeater', 'snowPea', 'wallnut', 'potatoMine', 'lilyPad']],
      ['泳池铁流', 'S4', [], [], ['normal', 'buckethead', 'snorkel', 'dolphinRider', 'flag'], ['sunflower', 'threepeater', 'repeater', 'wallnut', 'lilyPad', 'cherryBomb']],
      ['泳池毕业考', 'S5', [], [], ['normal', 'buckethead', 'snorkel', 'dolphinRider', 'flag'], ['sunflower', 'threepeater', 'snowPea', 'repeater', 'wallnut', 'lilyPad'], true],
    ],
  },
  {
    chapterIndex: 4,
    chapterId: 'fog',
    baseSun: 140,
    waveSeconds: 44,
    levels: [
      ['迷雾初见', 'S4', ['splitPea'], [], ['normal', 'conehead', 'screenDoor'], ['sunflower', 'splitPea', 'snowPea', 'wallnut']],
      ['灯线回廊', 'S4', ['plantern'], [], ['normal', 'screenDoor', 'buckethead'], ['sunflower', 'plantern', 'repeater', 'wallnut', 'snowPea']],
      ['大蒜改道', 'S4', ['garlic'], [], ['normal', 'newspaper', 'screenDoor'], ['sunflower', 'garlic', 'repeater', 'wallnut', 'plantern']],
      ['火炬烧线', 'S4', [], [], ['normal', 'newspaper', 'screenDoor', 'flag'], ['sunflower', 'torchwood', 'peashooter', 'wallnut', 'plantern']],
      ['迷雾考试一', 'S5', [], [], ['normal', 'newspaper', 'screenDoor', 'buckethead', 'flag'], ['sunflower', 'plantern', 'snowPea', 'repeater', 'wallnut'], true],
      ['南瓜护心', 'S5', ['pumpkin'], ['football'], ['normal', 'screenDoor', 'buckethead', 'football'], ['sunflower', 'plantern', 'pumpkin', 'repeater', 'wallnut', 'snowPea']],
      ['矿洞后切', 'S5', [], ['miner'], ['normal', 'miner', 'buckethead', 'football'], ['sunflower', 'plantern', 'pumpkin', 'chomper', 'repeater', 'wallnut']],
      ['墓碑清除', 'S5', ['graveBuster'], [], ['normal', 'miner', 'screenDoor', 'buckethead', 'flag'], ['sunflower', 'graveBuster', 'plantern', 'pumpkin', 'repeater', 'wallnut']],
      ['磁力脱甲', 'S5', ['magnetShroom'], [], ['buckethead', 'football', 'screenDoor', 'miner'], ['sunflower', 'magnetShroom', 'plantern', 'pumpkin', 'repeater', 'wallnut']],
      ['迷雾毕业考', 'S5', [], [], ['normal', 'screenDoor', 'buckethead', 'football', 'miner', 'flag'], ['sunflower', 'magnetShroom', 'plantern', 'pumpkin', 'repeater', 'wallnut'], true],
    ],
  },
  {
    chapterIndex: 5,
    chapterId: 'roof',
    baseSun: 175,
    waveSeconds: 46,
    levels: [
      ['屋顶落点', 'S4', ['flowerPot'], [], ['conehead', 'buckethead'], ['sunflower', 'flowerPot', 'cabbagePult', 'wallnut']],
      ['玉米抛投', 'S4', ['kernelPult', 'icebergLettuce'], [], ['conehead', 'buckethead', 'flag'], ['sunflower', 'flowerPot', 'kernelPult', 'wallnut', 'icebergLettuce']],
      ['高坡重甲', 'S4', [], [], ['conehead', 'buckethead', 'screenDoor'], ['sunflower', 'flowerPot', 'cabbagePult', 'kernelPult', 'wallnut']],
      ['屋顶铁流', 'S4', [], [], ['buckethead', 'screenDoor', 'football'], ['sunflower', 'flowerPot', 'kernelPult', 'magnetShroom', 'wallnut', 'cherryBomb']],
      ['屋顶考试一', 'S4', [], [], ['buckethead', 'screenDoor', 'football', 'flag'], ['sunflower', 'flowerPot', 'cabbagePult', 'kernelPult', 'wallnut', 'cherryBomb'], true],
      ['西瓜首秀', 'S5', ['melonPult'], [], ['buckethead', 'screenDoor', 'football'], ['sunflower', 'flowerPot', 'melonPult', 'kernelPult', 'wallnut', 'magnetShroom']],
      ['高坚果课题', 'S5', ['tallnut'], [], ['buckethead', 'football', 'screenDoor', 'flag'], ['sunflower', 'flowerPot', 'melonPult', 'tallnut', 'kernelPult', 'magnetShroom']],
      ['寒冰菇救火', 'S5', ['iceShroom'], [], ['buckethead', 'football', 'screenDoor', 'flag'], ['sunflower', 'flowerPot', 'melonPult', 'tallnut', 'iceShroom', 'cherryBomb']],
      ['投篮车登场', 'S5', [], ['basketball'], ['buckethead', 'football', 'basketball', 'screenDoor'], ['sunflower', 'flowerPot', 'melonPult', 'tallnut', 'cherryBomb', 'magnetShroom']],
      ['屋顶毕业考', 'S5', [], [], ['buckethead', 'football', 'basketball', 'screenDoor', 'flag'], ['sunflower', 'flowerPot', 'melonPult', 'tallnut', 'iceShroom', 'magnetShroom'], true],
    ],
  },
  {
    chapterIndex: 6,
    chapterId: 'roof',
    baseSun: 180,
    waveSeconds: 48,
    levels: [
      ['屋顶重构', 'S4', [], [], ['conehead', 'buckethead'], ['sunflower', 'flowerPot', 'melonPult', 'tallnut', 'kernelPult', 'wallnut']],
      ['地面反伤', 'S4', ['spikeweed'], [], ['normal', 'pole', 'newspaper'], ['sunflower', 'spikeweed', 'melonPult', 'tallnut', 'snowPea', 'flowerPot']],
      ['冰道预警', 'S4', [], ['zomboni'], ['newspaper', 'football', 'zomboni'], ['sunflower', 'spikeweed', 'melonPult', 'tallnut', 'iceShroom', 'flowerPot']],
      ['屋顶铁流', 'S4', [], [], ['buckethead', 'screenDoor', 'football', 'zomboni'], ['sunflower', 'magnetShroom', 'melonPult', 'tallnut', 'flowerPot', 'iceShroom']],
      ['章节考试一', 'S5', [], ['imp'], ['pole', 'buckethead', 'football', 'zomboni', 'imp'], ['sunflower', 'spikeweed', 'melonPult', 'tallnut', 'iceShroom', 'flowerPot'], true],
      ['冰瓜成型', 'S5', ['winterMelon'], [], ['buckethead', 'football', 'screenDoor', 'zomboni'], ['sunflower', 'winterMelon', 'tallnut', 'magnetShroom', 'flowerPot', 'iceShroom']],
      ['巨人前哨', 'S5', [], ['gargantuar'], ['buckethead', 'football', 'gargantuar', 'imp'], ['sunflower', 'winterMelon', 'tallnut', 'magnetShroom', 'cherryBomb', 'flowerPot']],
      ['地刺王通路', 'S5', ['spikerock'], ['ladder'], ['football', 'gargantuar', 'ladder', 'imp'], ['sunflower', 'spikerock', 'winterMelon', 'tallnut', 'magnetShroom', 'flowerPot']],
      ['屋顶总压 II', 'S5', [], [], ['football', 'basketball', 'gargantuar', 'ladder', 'imp'], ['sunflower', 'spikerock', 'winterMelon', 'tallnut', 'iceShroom', 'magnetShroom']],
      ['屋顶结业关', 'S5', [], [], ['buckethead', 'football', 'basketball', 'gargantuar', 'flag'], ['sunflower', 'spikerock', 'winterMelon', 'tallnut', 'magnetShroom', 'iceShroom'], true],
    ],
  },
  {
    chapterIndex: 7,
    chapterId: 'fog',
    baseSun: 170,
    waveSeconds: 48,
    levels: [
      ['深雾回归', 'S4', [], [], ['newspaper', 'pole', 'screenDoor'], ['sunflower', 'plantern', 'pumpkin', 'repeater', 'wallnut', 'snowPea']],
      ['罩壳布防', 'S4', [], [], ['screenDoor', 'buckethead', 'football'], ['sunflower', 'pumpkin', 'plantern', 'repeater', 'wallnut', 'magnetShroom']],
      ['侦察灯线', 'S4', [], [], ['screenDoor', 'buckethead', 'miner'], ['sunflower', 'plantern', 'pumpkin', 'chomper', 'repeater', 'wallnut']],
      ['后排失守', 'S5', [], [], ['buckethead', 'football', 'miner'], ['sunflower', 'plantern', 'pumpkin', 'chomper', 'winterMelon', 'wallnut']],
      ['章节考试一', 'S5', [], [], ['buckethead', 'football', 'miner', 'screenDoor', 'flag'], ['sunflower', 'plantern', 'pumpkin', 'winterMelon', 'chomper', 'wallnut'], true],
      ['忧郁气场', 'S5', ['gloomShroom'], ['backupDancer'], ['backupDancer', 'imp', 'buckethead', 'football'], ['sunflower', 'gloomShroom', 'pumpkin', 'winterMelon', 'plantern', 'wallnut']],
      ['蹦极惊袭', 'S5', [], ['bungee'], ['miner', 'bungee', 'buckethead', 'football'], ['sunflower', 'pumpkin', 'plantern', 'gloomShroom', 'winterMelon', 'wallnut']],
      ['夜墓清理', 'S5', [], [], ['screenDoor', 'buckethead', 'bungee', 'miner'], ['sunflower', 'graveBuster', 'pumpkin', 'plantern', 'winterMelon', 'wallnut']],
      ['深雾总压', 'S5', [], [], ['miner', 'bungee', 'football', 'gargantuar', 'buckethead'], ['sunflower', 'pumpkin', 'plantern', 'gloomShroom', 'winterMelon', 'magnetShroom']],
      ['迷雾结业关', 'S5', [], [], ['miner', 'bungee', 'football', 'gargantuar', 'flag'], ['sunflower', 'pumpkin', 'plantern', 'gloomShroom', 'winterMelon', 'magnetShroom'], true],
    ],
  },
  {
    chapterIndex: 8,
    chapterId: 'day',
    baseSun: 200,
    waveSeconds: 50,
    levels: [
      ['长波开端', 'S4', ['twinSunflower'], [], ['conehead', 'buckethead', 'flag'], ['twinSunflower', 'repeater', 'wallnut', 'snowPea', 'cherryBomb']],
      ['经济升级', 'S4', [], [], ['buckethead', 'screenDoor', 'flag'], ['twinSunflower', 'repeater', 'wallnut', 'snowPea', 'cherryBomb']],
      ['连射升级', 'S5', ['gatlingPea'], [], ['buckethead', 'football', 'screenDoor'], ['twinSunflower', 'gatlingPea', 'wallnut', 'pumpkin', 'snowPea', 'cherryBomb']],
      ['多角覆盖', 'S5', ['starfruit'], [], ['football', 'miner', 'screenDoor'], ['twinSunflower', 'starfruit', 'gatlingPea', 'pumpkin', 'wallnut', 'snowPea']],
      ['章节考试一', 'S5', [], ['dancing'], ['buckethead', 'football', 'dancing', 'backupDancer', 'miner'], ['twinSunflower', 'starfruit', 'gatlingPea', 'pumpkin', 'wallnut', 'snowPea'], true],
      ['水面追踪', 'S5', ['cattail'], [], ['balloon', 'snorkel', 'football', 'buckethead'], ['twinSunflower', 'cattail', 'gatlingPea', 'pumpkin', 'wallnut', 'snowPea']],
      ['空中压迫', 'S5', [], ['balloon'], ['balloon', 'snorkel', 'football', 'buckethead', 'flag'], ['twinSunflower', 'cattail', 'gatlingPea', 'pumpkin', 'wallnut', 'snowPea']],
      ['巨人前夜', 'S5', ['doubleCabbage'], [], ['gargantuar', 'imp', 'football', 'screenDoor'], ['twinSunflower', 'doubleCabbage', 'winterMelon', 'pumpkin', 'tallnut', 'magnetShroom']],
      ['生存预终盘', 'S5', [], [], ['gargantuar', 'imp', 'balloon', 'football', 'buckethead'], ['twinSunflower', 'cattail', 'gatlingPea', 'winterMelon', 'pumpkin', 'tallnut']],
      ['生存结业关', 'S5', [], [], ['gargantuar', 'imp', 'balloon', 'football', 'buckethead', 'flag'], ['twinSunflower', 'cattail', 'gatlingPea', 'winterMelon', 'pumpkin', 'tallnut'], true],
    ],
  },
  {
    chapterIndex: 9,
    chapterId: 'night',
    baseSun: 200,
    waveSeconds: 50,
    levels: [
      ['实验禁卡', 'S4', ['imitater'], [], ['buckethead', 'screenDoor', 'football'], ['imitater', 'twinSunflower', 'gatlingPea', 'pumpkin', 'tallnut', 'winterMelon']],
      ['爆发走廊', 'S5', ['jalapeno'], [], ['football', 'screenDoor', 'zomboni', 'flag'], ['twinSunflower', 'jalapeno', 'gatlingPea', 'pumpkin', 'tallnut', 'winterMelon']],
      ['公式护盾', 'S5', [], ['formulaZombie'], ['formulaZombie', 'screenDoor', 'buckethead', 'football'], ['twinSunflower', 'magnetShroom', 'jalapeno', 'gatlingPea', 'pumpkin', 'tallnut']],
      ['审计速记', 'S5', ['steelSpikeweed'], ['shorthandZombie'], ['shorthandZombie', 'formulaZombie', 'football', 'buckethead'], ['twinSunflower', 'steelSpikeweed', 'gatlingPea', 'pumpkin', 'tallnut', 'winterMelon']],
      ['章节考试一', 'S5', [], [], ['formulaZombie', 'shorthandZombie', 'football', 'buckethead', 'flag'], ['twinSunflower', 'steelSpikeweed', 'magnetShroom', 'gatlingPea', 'pumpkin', 'tallnut'], true],
      ['香橼重炮', 'S5', ['citron'], [], ['formulaZombie', 'buckethead', 'gargantuar'], ['twinSunflower', 'citron', 'pumpkin', 'tallnut', 'magnetShroom', 'winterMelon']],
      ['回旋穿透', 'S5', ['bloomerang'], [], ['screenDoor', 'buckethead', 'backupDancer', 'formulaZombie'], ['twinSunflower', 'bloomerang', 'citron', 'pumpkin', 'tallnut', 'winterMelon']],
      ['审计官上场', 'S5', [], ['auditChief'], ['auditZombie', 'auditChief', 'formulaZombie', 'buckethead'], ['twinSunflower', 'bloomerang', 'citron', 'pumpkin', 'tallnut', 'magnetShroom']],
      ['实验室暴走', 'S5', [], [], ['auditZombie', 'auditChief', 'shorthandZombie', 'formulaZombie', 'gargantuar'], ['twinSunflower', 'citron', 'bloomerang', 'pumpkin', 'tallnut', 'winterMelon']],
      ['实验室结业关', 'S5', [], ['hostZombie'], ['hostZombie', 'auditChief', 'formulaZombie', 'shorthandZombie', 'flag'], ['twinSunflower', 'citron', 'bloomerang', 'pumpkin', 'tallnut', 'winterMelon'], true],
    ],
  },
  {
    chapterIndex: 10,
    chapterId: 'roof',
    baseSun: 225,
    waveSeconds: 55,
    levels: [
      ['终局开场', 'S5', ['laserBean'], [], ['football', 'buckethead', 'auditZombie', 'balloon'], ['twinSunflower', 'laserBean', 'pumpkin', 'tallnut', 'winterMelon', 'magnetShroom']],
      ['近战破阵', 'S5', ['bonkChoy'], [], ['miner', 'shorthandZombie', 'imp', 'football'], ['twinSunflower', 'bonkChoy', 'laserBean', 'pumpkin', 'tallnut', 'winterMelon']],
      ['护盾共振', 'S5', ['shieldBlossom'], [], ['auditZombie', 'hostZombie', 'screenDoor', 'buckethead'], ['twinSunflower', 'shieldBlossom', 'laserBean', 'pumpkin', 'tallnut', 'winterMelon']],
      ['群体脱甲', 'S5', ['magnetBurstShroom'], [], ['buckethead', 'screenDoor', 'football', 'auditChief'], ['twinSunflower', 'magnetBurstShroom', 'laserBean', 'pumpkin', 'tallnut', 'winterMelon']],
      ['章节考试一', 'S5', [], [], ['buckethead', 'football', 'auditZombie', 'auditChief', 'hostZombie'], ['twinSunflower', 'magnetBurstShroom', 'laserBean', 'pumpkin', 'tallnut', 'winterMelon'], true],
      ['终局炮击', 'S5+', ['cobCannon'], [], ['gargantuar', 'auditChief', 'football', 'basketball'], ['twinSunflower', 'cobCannon', 'pumpkin', 'tallnut', 'winterMelon', 'magnetBurstShroom']],
      ['审计豆实验', 'S5+', ['auditBean'], [], ['auditChief', 'hostZombie', 'formulaZombie', 'gargantuar'], ['twinSunflower', 'auditBean', 'cobCannon', 'pumpkin', 'tallnut', 'winterMelon']],
      ['终局双巨人', 'S5+', [], [], ['gargantuar', 'basketball', 'balloon', 'football', 'imp'], ['twinSunflower', 'cobCannon', 'auditBean', 'pumpkin', 'tallnut', 'winterMelon']],
      ['终审前夜', 'S5+', [], [], ['gargantuar', 'hostZombie', 'auditChief', 'basketball', 'balloon'], ['twinSunflower', 'cobCannon', 'auditBean', 'pumpkin', 'tallnut', 'winterMelon']],
      ['终审巨人', 'S6', [], ['finalGargantuar'], ['finalGargantuar', 'hostZombie', 'auditChief', 'gargantuar', 'flag'], ['twinSunflower', 'cobCannon', 'auditBean', 'pumpkin', 'tallnut', 'winterMelon'], true],
    ],
  },
];

function buildSpawnQueue(levelId: string, enemyRoster: PvZZombieId[], intensity: LevelIntensity, chapterIndex: number, waveDurationMs: number): PvZSpawnEvent[] {
  const eventCount = INTENSITY_EVENT_COUNT[intensity];
  const startMs = 1800;
  const endMs = Math.max(startMs + 2000, waveDurationMs - 3200);
  const step = Math.max(1200, Math.floor((endMs - startMs) / Math.max(1, eventCount - 1)));
  return Array.from({ length: eventCount }, (_, index) => ({
    id: `${levelId}-${index + 1}`,
    zombieId: enemyRoster[index % enemyRoster.length],
    row: (index * 2 + chapterIndex) % 5,
    spawnAtMs: Math.min(endMs, startMs + step * index),
  }));
}

function buildWaves(enemyRoster: PvZZombieId[], intensity: LevelIntensity, waveDurationMs: number): PvZWaveConfig[] {
  const waveCount = INTENSITY_WAVE_COUNT[intensity];
  const baseZombieCount = Math.ceil(INTENSITY_EVENT_COUNT[intensity] / waveCount);
  const waveIntervalMs = Math.max(800, Math.floor(waveDurationMs / waveCount));
  const preWaveDelayBase = 3000;

  return Array.from({ length: waveCount }, (_, index) => {
    const isFinal = index === waveCount - 1;
    const zombieCount = isFinal ? Math.ceil(baseZombieCount * 1.5) : baseZombieCount;
    const zombieTypes = enemyRoster.length > 2
      ? enemyRoster.slice(0, Math.min(2 + index, enemyRoster.length))
      : enemyRoster;

    return {
      waveIndex: index,
      waveType: isFinal ? 'final' : (index % 2 === 0 ? 'small' : 'large') as 'small' | 'large' | 'final',
      zombieCount,
      zombieTypes,
      spawnIntervalMs: Math.max(600, waveIntervalMs - index * 100),
      preWaveDelayMs: index === 0 ? 0 : preWaveDelayBase + index * 500,
    };
  });
}

function buildAvailablePlants(flattenedLevels: LevelTuple[], currentIndex: number): PvZPlantId[] {
  const unlockedBefore = flattenedLevels.slice(0, currentIndex + 1).flatMap((level) => level[2]);
  const recommended = flattenedLevels[currentIndex][5];
  return Array.from(new Set([...STARTER_POOL, ...unlockedBefore, ...recommended]));
}

function flattenLevelPacks(): PvZAdventureSeed[] {
  const seeds: PvZAdventureSeed[] = [];
  CHAPTER_PACKS.forEach((pack) => {
    pack.levels.forEach((level, levelIndex) => {
      seeds.push({
        id: `${pack.chapterIndex}-${String(levelIndex + 1).padStart(2, '0')}`,
        title: level[0],
        chapterId: pack.chapterId,
        chapterIndex: pack.chapterIndex,
        intensity: level[1],
        unlockPlants: level[2],
        unlockZombies: level[3],
        enemyRoster: level[4],
        recommendedCards: level[5],
        isExam: level[6],
        baseSun: pack.baseSun,
        waveSeconds: pack.waveSeconds,
      });
    });
  });
  return seeds;
}

interface PvZAdventureSeed {
  id: string;
  title: string;
  chapterId: PvZChapterId;
  chapterIndex: number;
  intensity: LevelIntensity;
  unlockPlants: PvZPlantId[];
  unlockZombies: PvZZombieId[];
  enemyRoster: PvZZombieId[];
  recommendedCards: PvZPlantId[];
  isExam?: boolean;
  baseSun: number;
  waveSeconds: number;
}

const ADVENTURE_SEEDS = flattenLevelPacks();

export const PVZ_ADVENTURE_LEVELS: PvZLevelDefinition[] = ADVENTURE_SEEDS.map((seed, index) => {
  const availablePlants = buildAvailablePlants(CHAPTER_PACKS.flatMap((pack) => pack.levels), index);
  const waveDurationMs = seed.waveSeconds * 1000;
  const chapter = PVZ_CHAPTERS.find((c) => c.id === seed.chapterId);
  const prevLevelId = index > 0 ? ADVENTURE_SEEDS[index - 1]?.id : undefined;
  const nextLevelId = index < ADVENTURE_SEEDS.length - 1 ? ADVENTURE_SEEDS[index + 1]?.id : undefined;
  const isBossLevel = seed.isExam || index === ADVENTURE_SEEDS.length - 1;
  const environment: PvZLevelDefinition['environment'] = seed.chapterId as PvZLevelDefinition['environment'];
  return {
    id: seed.id,
    levelNumber: index + 1,
    chapterId: seed.chapterId,
    chapterIndex: seed.chapterIndex,
    mode: 'adventure',
    family: 'mainline',
    title: seed.title,
    summary: `主线 ${seed.id}：${seed.title}`,
    objective: `完成 ${seed.title} 的章节教学并守住 5 路防线。`,
    rules: seed.isExam ? ['章节考试关', '要求阵容完整成型'] : ['按本章核心机制布防', '优先处理本关新威胁'],
    intensity: seed.intensity,
    baseSun: seed.baseSun,
    waveDurationMs,
    defaultCards: seed.recommendedCards.slice(0, 6),
    availablePlants,
    recommendedCards: seed.recommendedCards.slice(0, 6),
    unlockPlants: seed.unlockPlants,
    unlockZombies: seed.unlockZombies,
    enemyRoster: seed.enemyRoster,
    spawnQueue: buildSpawnQueue(seed.id, seed.enemyRoster, seed.intensity, seed.chapterIndex, waveDurationMs),
    waves: buildWaves(seed.enemyRoster, seed.intensity, waveDurationMs),
    isExam: seed.isExam,
    previousLevelId: prevLevelId,
    nextLevelId: nextLevelId,
    chapterTitle: chapter?.title,
    isBossLevel,
    hasLawnMowers: true,
    skyDropSun: true,
    environment,
  };
});

export const PVZ_ADVENTURE_LEVEL_MAP = Object.fromEntries(PVZ_ADVENTURE_LEVELS.map((level) => [level.id, level])) as Record<string, PvZLevelDefinition>;

export function getPvZAdventureLevelById(levelId: string): PvZLevelDefinition | undefined {
  return PVZ_ADVENTURE_LEVEL_MAP[levelId];
}

export function getPvZAdventureLevelsByChapterIndex(chapterIndex: number): PvZLevelDefinition[] {
  return PVZ_ADVENTURE_LEVELS.filter((level) => level.chapterIndex === chapterIndex);
}

export function getPvZAdventureLevelsByChapterId(chapterId: PvZChapterId): PvZLevelDefinition[] {
  return PVZ_ADVENTURE_LEVELS.filter((level) => level.chapterId === chapterId);
}
