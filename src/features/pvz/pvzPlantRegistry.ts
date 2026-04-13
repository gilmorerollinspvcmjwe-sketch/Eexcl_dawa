/* PvZ 植物注册表。统一维护 66 株植物的名称、解锁、定位、基础数值和阶段性实现映射。 */
import type { PvZPlantDefinition, PvZPlantId } from './pvzTypes.ts';

type PvZPlantInput = Omit<PvZPlantDefinition, 'chapterAffinity' | 'implementation' | 'tags'> & {
  chapterAffinity?: PvZPlantDefinition['chapterAffinity'];
  implementation?: PvZPlantDefinition['implementation'];
  tags?: string[];
};

function definePlant(entry: PvZPlantInput): PvZPlantDefinition {
  return {
    chapterAffinity: ['all'],
    implementation: 'variant',
    tags: [],
    ...entry,
  };
}

export const PVZ_PLANTS: PvZPlantDefinition[] = [
  definePlant({ id: 'sunflower', name: '向日葵', shortName: '阳', summary: '基础经济核心，稳定产出阳光。', archetype: 'economy', implementation: 'full', unlockLevel: '1-01', chapterAffinity: ['day', 'all'], tags: ['经济', '基础'], cost: 50, cooldownMs: 7500, maxHp: 300, producesSun: true, sunIntervalMs: 6000, sunAmount: 25 }),
  definePlant({ id: 'twinSunflower', name: '双子向日葵', shortName: '双阳', summary: '单格高产的进阶经济位，双倍产光。', archetype: 'economy', implementation: 'full', unlockLevel: '8-01', chapterAffinity: ['roof', 'all'], tags: ['经济', '进阶'], cost: 125, cooldownMs: 9000, maxHp: 300, producesSun: true, sunIntervalMs: 5500, sunAmount: 50 }),
  definePlant({ id: 'sunShroom', name: '阳光菇', shortName: '菇', summary: '夜间低费经济，前期更适合资源压缩关。', archetype: 'economy', unlockLevel: '2-01', chapterAffinity: ['night'], tags: ['经济', '夜间'], cost: 25, cooldownMs: 7500, maxHp: 240, producesSun: true, sunIntervalMs: 5000, sunAmount: 15, runtimeAliasOf: 'miniSunflower' }),
  definePlant({ id: 'coffeeBean', name: '咖啡豆', shortName: '咖', summary: '唤醒辅助位，当前阶段按功能支援位落地。', archetype: 'support', implementation: 'planned', unlockLevel: '9-01', chapterAffinity: ['night', 'lab'], tags: ['辅助', '唤醒'], cost: 75, cooldownMs: 12000, maxHp: 200, supportEffect: 'shield', runtimeAliasOf: 'plantern' }),
  definePlant({ id: 'imitater', name: '模仿者', shortName: '仿', summary: '高阶复制位，当前阶段按通用输出副卡处理。', archetype: 'special', implementation: 'planned', unlockLevel: '9-01', chapterAffinity: ['lab'], tags: ['特殊', '复制'], cost: 125, cooldownMs: 15000, maxHp: 260, damage: 20, attackIntervalMs: 1400, projectileKind: 'pea', projectileCount: 1, runtimeAliasOf: 'peashooter' }),
  definePlant({ id: 'flowerPot', name: '花盆', shortName: '盆', summary: '屋顶种植平台。', archetype: 'platform', implementation: 'full', unlockLevel: '5-01', chapterAffinity: ['roof'], tags: ['基建', '屋顶'], cost: 25, cooldownMs: 6000, maxHp: 260, laneBlocker: true, supportEffect: 'platform' }),
  definePlant({ id: 'lilyPad', name: '睡莲', shortName: '莲', summary: '水面种植平台。', archetype: 'platform', implementation: 'full', unlockLevel: '3-01', chapterAffinity: ['pool'], tags: ['基建', '水面'], cost: 25, cooldownMs: 6000, maxHp: 240, laneBlocker: true, supportEffect: 'platform', requiresTile: 'water' }),
  definePlant({ id: 'pumpkin', name: '南瓜头', shortName: '瓜', summary: '外层护甲容器，适合保护核心输出位。', archetype: 'container', implementation: 'full', unlockLevel: '6-01', chapterAffinity: ['fog', 'all'], tags: ['保护', '容器'], cost: 125, cooldownMs: 15000, maxHp: 1200, armorHp: 350, laneBlocker: true, supportEffect: 'container' }),
  definePlant({ id: 'goldLeaf', name: '金叶草', shortName: '金', summary: '资源外溢位，当前阶段按高价值产光落地。', archetype: 'economy', implementation: 'planned', unlockLevel: '9-06', chapterAffinity: ['roof', 'lab'], tags: ['经济', '奖励'], cost: 75, cooldownMs: 10000, maxHp: 240, producesSun: true, sunIntervalMs: 5000, sunAmount: 40, runtimeAliasOf: 'twinSunflower' }),
  definePlant({ id: 'garlic', name: '大蒜', shortName: '蒜', summary: '路线控制位，僵尸改道。', archetype: 'support', implementation: 'full', unlockLevel: '4-03', chapterAffinity: ['night', 'fog'], tags: ['改道', '控制'], cost: 50, cooldownMs: 7000, maxHp: 300, laneBlocker: true, supportEffect: 'redirect' }),

  definePlant({ id: 'peashooter', name: '豌豆射手', shortName: '豌', summary: '基础单线输出。', archetype: 'shooter', implementation: 'full', unlockLevel: '1-02', chapterAffinity: ['day', 'all'], tags: ['输出', '直线'], cost: 100, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'pea', projectileCount: 1 }),
  definePlant({ id: 'repeater', name: '双发射手', shortName: '双', summary: '稳定双发火力，是中盘直线输出骨架。', archetype: 'shooter', implementation: 'full', unlockLevel: '1-06', chapterAffinity: ['day', 'all'], tags: ['输出', '双发'], cost: 200, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'double-pea', projectileCount: 2 }),
  definePlant({ id: 'threepeater', name: '三线射手', shortName: '三', summary: '覆盖相邻三路的多线火力。', archetype: 'shooter', implementation: 'full', unlockLevel: '3-01', chapterAffinity: ['pool'], tags: ['输出', '多线'], cost: 325, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1500, projectileKind: 'pea', projectileCount: 1, multiLane: 'adjacent' }),
  definePlant({ id: 'gatlingPea', name: '机枪射手', shortName: '枪', summary: '高频直射炮台，是后期单线主炮。', archetype: 'shooter', implementation: 'full', unlockLevel: '8-03', chapterAffinity: ['all'], tags: ['输出', '高频'], cost: 275, cooldownMs: 9000, maxHp: 300, damage: 20, attackIntervalMs: 900, projectileKind: 'pea', projectileCount: 4 }),
  definePlant({ id: 'snowPea', name: '寒冰射手', shortName: '冰', summary: '带减速标签的稳定输出。', archetype: 'shooter', implementation: 'full', unlockLevel: '1-07', chapterAffinity: ['day', 'night'], tags: ['输出', '减速'], cost: 175, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'snow-pea', projectileCount: 1 }),
  definePlant({ id: 'torchwood', name: '火炬树桩', shortName: '炬', summary: '火力强化位，当前阶段作为火系支援位接入。', archetype: 'support', implementation: 'full', unlockLevel: '2-05', chapterAffinity: ['night', 'roof'], tags: ['强化', '火系'], cost: 175, cooldownMs: 7500, maxHp: 300, supportEffect: 'torch' }),
  definePlant({ id: 'splitPea', name: '裂荚射手', shortName: '裂', summary: '双向守线输出，前后同时射击。', archetype: 'shooter', implementation: 'full', unlockLevel: '4-01', chapterAffinity: ['fog', 'all'], tags: ['输出', '双向'], cost: 150, cooldownMs: 8000, maxHp: 300, damage: 18, attackIntervalMs: 1300, projectileKind: 'pea', projectileCount: 1 }),
  definePlant({ id: 'cactus', name: '仙人掌', shortName: '仙', summary: '反空特化输出，当前阶段按快射直线位处理。', archetype: 'shooter', implementation: 'planned', unlockLevel: '8-07', chapterAffinity: ['pool', 'all'], tags: ['输出', '反空'], cost: 125, cooldownMs: 7500, maxHp: 300, damage: 22, attackIntervalMs: 1200, projectileKind: 'pea', projectileCount: 1, runtimeAliasOf: 'peashooter' }),
  definePlant({ id: 'seaShroom', name: '海蘑菇', shortName: '海菇', summary: '低费水面夜间输出，短射程。', archetype: 'shooter', implementation: 'full', unlockLevel: '3-02', chapterAffinity: ['pool', 'night'], tags: ['输出', '低费'], cost: 25, cooldownMs: 5500, maxHp: 220, damage: 15, attackIntervalMs: 1300, projectileKind: 'pea', projectileCount: 1, requiresTile: 'water' }),
  definePlant({ id: 'twoHeadedPea', name: '双头豌豆', shortName: '双头', summary: '高阶双向压制，当前阶段按强化双发处理。', archetype: 'shooter', implementation: 'planned', unlockLevel: '8-05', chapterAffinity: ['night', 'all'], tags: ['输出', '双向'], cost: 225, cooldownMs: 9000, maxHp: 300, damage: 20, attackIntervalMs: 1200, projectileKind: 'double-pea', projectileCount: 2, runtimeAliasOf: 'repeater' }),
  definePlant({ id: 'starfruit', name: '星星果', shortName: '星', summary: '5 方向射击覆盖位。', archetype: 'shooter', implementation: 'full', unlockLevel: '8-04', chapterAffinity: ['all'], tags: ['输出', '多向'], cost: 125, cooldownMs: 8500, maxHp: 300, damage: 18, attackIntervalMs: 1300, projectileKind: 'pea', projectileCount: 1 }),
  definePlant({ id: 'cattail', name: '猫尾草', shortName: '尾', summary: '高价值追踪位，水面专属多线输出。', archetype: 'shooter', implementation: 'full', unlockLevel: '8-06', chapterAffinity: ['pool'], tags: ['输出', '追踪'], cost: 225, cooldownMs: 9000, maxHp: 300, damage: 24, attackIntervalMs: 1100, projectileKind: 'pea', projectileCount: 1, multiLane: 'all', requiresTile: 'water' }),

  definePlant({ id: 'cabbagePult', name: '卷心菜投手', shortName: '菜', summary: '基础抛投火力，屋顶章节的前置主炮。', archetype: 'lobber', implementation: 'full', unlockLevel: '3-03', chapterAffinity: ['roof', 'pool'], tags: ['输出', '抛投'], cost: 100, cooldownMs: 7500, maxHp: 300, damage: 35, attackIntervalMs: 1800, projectileKind: 'lobbed', projectileCount: 1 }),
  definePlant({ id: 'kernelPult', name: '玉米投手', shortName: '米', summary: '稳定抛投位，当前阶段按抛投压制落地。', archetype: 'lobber', implementation: 'full', unlockLevel: '5-03', chapterAffinity: ['roof'], tags: ['输出', '抛投'], cost: 100, cooldownMs: 7500, maxHp: 300, damage: 30, attackIntervalMs: 1800, projectileKind: 'lobbed', projectileCount: 1 }),
  definePlant({ id: 'melonPult', name: '西瓜投手', shortName: '瓜投', summary: '后期大范围抛投火力，3×3 溅射。', archetype: 'lobber', implementation: 'full', unlockLevel: '5-06', chapterAffinity: ['roof', 'all'], tags: ['输出', '溅射'], cost: 300, cooldownMs: 9000, maxHp: 300, damage: 70, splashRadius: 3, attackIntervalMs: 2100, projectileKind: 'lobbed', projectileCount: 1 }),
  definePlant({ id: 'winterMelon', name: '冰瓜投手', shortName: '冰瓜', summary: '高端控场抛投，溅射 + 减速。', archetype: 'lobber', implementation: 'full', unlockLevel: '6-06', chapterAffinity: ['roof', 'all'], tags: ['输出', '减速', '溅射'], cost: 400, cooldownMs: 9000, maxHp: 300, damage: 80, splashRadius: 3, attackIntervalMs: 2300, projectileKind: 'lobbed', projectileCount: 1 }),
  definePlant({ id: 'reedPult', name: '香蒲投手', shortName: '香投', summary: '水面追踪抛投位，多线抛投攻击。', archetype: 'lobber', implementation: 'full', unlockLevel: '8-06', chapterAffinity: ['pool'], tags: ['输出', '追踪', '抛投'], cost: 225, cooldownMs: 9000, maxHp: 300, damage: 40, attackIntervalMs: 1600, projectileKind: 'lobbed', projectileCount: 1, multiLane: 'all', requiresTile: 'water' }),
  definePlant({ id: 'cobCannon', name: '玉米加农炮', shortName: '炮', summary: '终局大炮位，当前阶段按高额爆发抛投处理。', archetype: 'special', implementation: 'planned', unlockLevel: '10-06', chapterAffinity: ['roof', 'all'], tags: ['爆发', '终局'], cost: 500, cooldownMs: 30000, maxHp: 350, damage: 700, explodeRadius: 5, attackIntervalMs: 8000, projectileKind: 'lobbed', projectileCount: 1, runtimeAliasOf: 'melonPult' }),
  definePlant({ id: 'gloomShroom', name: '忧郁蘑菇', shortName: '忧', summary: '近场 3×3 AOE 位，高频范围伤害。', archetype: 'melee', implementation: 'full', unlockLevel: '7-06', chapterAffinity: ['fog', 'night'], tags: ['输出', '近场'], cost: 150, cooldownMs: 8500, maxHp: 300, damage: 90, attackIntervalMs: 1800, explodeRadius: 3 }),
  definePlant({ id: 'magnetShroom', name: '磁力菇', shortName: '磁', summary: '脱甲控制位，移除僵尸护甲。', archetype: 'support', implementation: 'full', unlockLevel: '5-04', chapterAffinity: ['roof', 'night'], tags: ['控制', '脱甲'], cost: 100, cooldownMs: 10000, maxHp: 300, supportEffect: 'armor-strip' }),
  definePlant({ id: 'plantern', name: '灯笼草', shortName: '灯', summary: '迷雾侦察位，当前阶段按战场支援位接入。', archetype: 'support', unlockLevel: '4-03', chapterAffinity: ['fog'], tags: ['侦察', '支援'], cost: 25, cooldownMs: 7500, maxHp: 300, supportEffect: 'reveal', runtimeAliasOf: 'sunflower' }),
  definePlant({ id: 'umbrellaLeaf', name: '伞叶草', shortName: '伞', summary: '防投掷保护位，保护相邻植物免受抛投伤害。', archetype: 'support', implementation: 'full', unlockLevel: '7-07', chapterAffinity: ['fog', 'roof'], tags: ['保护', '支援'], cost: 100, cooldownMs: 8500, maxHp: 300, supportEffect: 'shield' }),

  definePlant({ id: 'wallnut', name: '坚果墙', shortName: '坚', summary: '最稳定的前排拖线单位。', archetype: 'blocker', implementation: 'full', unlockLevel: '1-03', chapterAffinity: ['day', 'all'], tags: ['防线', '高血'], cost: 50, cooldownMs: 30000, maxHp: 4000, laneBlocker: true }),
  definePlant({ id: 'tallnut', name: '高坚果', shortName: '高', summary: '更厚的前排，免疫撑杆跳跃。', archetype: 'blocker', implementation: 'full', unlockLevel: '6-01', chapterAffinity: ['roof', 'all'], tags: ['防线', '高血'], cost: 125, cooldownMs: 30000, maxHp: 6000, laneBlocker: true }),
  definePlant({ id: 'spikeweed', name: '地刺', shortName: '刺', summary: '地面持续伤害陷阱。', archetype: 'spike', implementation: 'full', unlockLevel: '6-02', chapterAffinity: ['roof', 'all'], tags: ['陷阱', '反伤'], cost: 100, cooldownMs: 8000, maxHp: 300, damage: 25, attackIntervalMs: 1100 }),
  definePlant({ id: 'spikerock', name: '地刺王', shortName: '刺王', summary: '强化地刺位，更强地面伤害。', archetype: 'spike', implementation: 'full', unlockLevel: '6-08', chapterAffinity: ['roof', 'all'], tags: ['陷阱', '反伤'], cost: 175, cooldownMs: 9000, maxHp: 400, damage: 40, attackIntervalMs: 1000 }),
  definePlant({ id: 'seaWallnut', name: '海坚果', shortName: '海坚', summary: '水面前排墙体。', archetype: 'blocker', implementation: 'full', unlockLevel: '3-06', chapterAffinity: ['pool'], tags: ['防线', '水面'], cost: 75, cooldownMs: 25000, maxHp: 3400, laneBlocker: true, requiresTile: 'water' }),
  definePlant({ id: 'graveBuster', name: '墓碑吞噬者', shortName: '吞碑', summary: '清除墓碑障碍。', archetype: 'special', implementation: 'full', unlockLevel: '7-08', chapterAffinity: ['night', 'fog'], tags: ['清障', '支援'], cost: 75, cooldownMs: 12000, maxHp: 220 }),
  definePlant({ id: 'steelSpikeweed', name: '钢地刺', shortName: '钢刺', summary: '对重甲更强的通路陷阱。', archetype: 'spike', implementation: 'planned', unlockLevel: '9-04', chapterAffinity: ['roof', 'lab'], tags: ['陷阱', '反甲'], cost: 200, cooldownMs: 9000, maxHp: 420, damage: 50, attackIntervalMs: 900, runtimeAliasOf: 'spikerock' }),

  definePlant({ id: 'potatoMine', name: '土豆雷', shortName: '雷', summary: '低费埋伏位，适合处理早期突袭。', archetype: 'trap', implementation: 'full', unlockLevel: '1-04', chapterAffinity: ['day', 'all'], tags: ['陷阱', '爆发'], cost: 25, cooldownMs: 30000, maxHp: 1, damage: 1800, attackIntervalMs: 14000 }),
  definePlant({ id: 'cherryBomb', name: '樱桃炸弹', shortName: '樱', summary: '中范围爆发救场。', archetype: 'bomb', implementation: 'full', unlockLevel: '2-01', chapterAffinity: ['day', 'night', 'all'], tags: ['爆发', '救场'], cost: 150, cooldownMs: 50000, maxHp: 1, explodeRadius: 3 }),
  definePlant({ id: 'jalapeno', name: '火爆辣椒', shortName: '椒', summary: '整行清场爆发位。', archetype: 'bomb', implementation: 'full', unlockLevel: '9-02', chapterAffinity: ['all'], tags: ['爆发', '整行'], cost: 125, cooldownMs: 45000, maxHp: 1, damage: 1200, explodeRadius: 5 }),
  definePlant({ id: 'squash', name: '窝瓜', shortName: '瓜压', summary: '单体高价值解场位，跳跃砸击。', archetype: 'bomb', implementation: 'full', unlockLevel: '4-04', chapterAffinity: ['all'], tags: ['爆发', '单解'], cost: 50, cooldownMs: 25000, maxHp: 1, damage: 900, attackIntervalMs: 2400 }),
  definePlant({ id: 'doomShroom', name: '毁灭菇', shortName: '灭', summary: '超大范围终局爆发，清场能力极强。', archetype: 'bomb', implementation: 'full', unlockLevel: '10-09', chapterAffinity: ['night', 'lab'], tags: ['爆发', '终局'], cost: 200, cooldownMs: 65000, maxHp: 1, damage: 1800, explodeRadius: 5 }),
  definePlant({ id: 'powderShroom', name: '火药蘑菇', shortName: '粉', summary: '夜间中范围爆发位。', archetype: 'bomb', implementation: 'planned', unlockLevel: '9-05', chapterAffinity: ['night', 'lab'], tags: ['爆发', '夜间'], cost: 100, cooldownMs: 30000, maxHp: 1, damage: 800, explodeRadius: 3, runtimeAliasOf: 'cherryBomb' }),
  definePlant({ id: 'icebergLettuce', name: '冰冻生菜', shortName: '菜冻', summary: '低费短控。', archetype: 'trap', implementation: 'full', unlockLevel: '5-02', chapterAffinity: ['all'], tags: ['控制', '低费'], cost: 25, cooldownMs: 14000, maxHp: 1, damage: 50, attackIntervalMs: 1000 }),
  definePlant({ id: 'iceShroom', name: '寒冰菇', shortName: '冰菇', summary: '全场控场位，冻结所有僵尸。', archetype: 'bomb', implementation: 'full', unlockLevel: '5-08', chapterAffinity: ['night', 'all'], tags: ['控制', '全场'], cost: 75, cooldownMs: 40000, maxHp: 1, damage: 300, explodeRadius: 5 }),
  definePlant({ id: 'hypnoShroom', name: '催眠蘑菇', shortName: '眠', summary: '反转控制位，使僵尸倒戈攻击同伴。', archetype: 'special', implementation: 'full', unlockLevel: '9-08', chapterAffinity: ['night', 'lab'], tags: ['控制', '特殊'], cost: 75, cooldownMs: 20000, maxHp: 200, damage: 900, attackIntervalMs: 2400 }),
  definePlant({ id: 'fireMine', name: '火焰豌豆雷', shortName: '火雷', summary: '带灼烧概念的爆发陷阱，当前阶段按强化土豆雷落地。', archetype: 'trap', implementation: 'planned', unlockLevel: '9-03', chapterAffinity: ['lab'], tags: ['陷阱', '火系'], cost: 50, cooldownMs: 28000, maxHp: 1, damage: 1100, attackIntervalMs: 9000, runtimeAliasOf: 'potatoMine' }),
  definePlant({ id: 'starMine', name: '杨桃雷', shortName: '星雷', summary: '多向碎裂概念的陷阱位，当前阶段按范围雷处理。', archetype: 'trap', implementation: 'planned', unlockLevel: '9-04', chapterAffinity: ['lab'], tags: ['陷阱', '多向'], cost: 75, cooldownMs: 26000, maxHp: 1, damage: 1000, explodeRadius: 3, attackIntervalMs: 9000, runtimeAliasOf: 'potatoMine' }),
  definePlant({ id: 'butterCannon', name: '玉米黄油炮', shortName: '黄炮', summary: '远程硬控爆发位，当前阶段按抛投控制炮处理。', archetype: 'special', implementation: 'planned', unlockLevel: '9-06', chapterAffinity: ['roof', 'lab'], tags: ['控制', '爆发'], cost: 225, cooldownMs: 24000, maxHp: 300, damage: 260, attackIntervalMs: 3000, projectileKind: 'lobbed', projectileCount: 1, runtimeAliasOf: 'kernelPult' }),

  definePlant({ id: 'chomper', name: '大嘴花', shortName: '嘴', summary: '高风险前排秒杀位。', archetype: 'melee', implementation: 'full', unlockLevel: '2-03', chapterAffinity: ['night', 'all'], tags: ['近战', '单解'], cost: 150, cooldownMs: 7500, maxHp: 300, damage: 1800, attackIntervalMs: 3000 }),
  definePlant({ id: 'puffShroom', name: '小喷菇', shortName: '喷', summary: '夜间低费近程输出。', archetype: 'shooter', unlockLevel: '2-02', chapterAffinity: ['night'], tags: ['输出', '低费'], cost: 25, cooldownMs: 5500, maxHp: 220, damage: 15, attackIntervalMs: 1200, projectileKind: 'pea', projectileCount: 1, runtimeAliasOf: 'peashooter' }),
  definePlant({ id: 'scaredyShroom', name: '胆小菇', shortName: '胆', summary: '脆弱的远程输出位，当前阶段按强化直线输出处理。', archetype: 'shooter', unlockLevel: '2-04', chapterAffinity: ['night'], tags: ['输出', '脆皮'], cost: 75, cooldownMs: 7000, maxHp: 220, damage: 25, attackIntervalMs: 1250, projectileKind: 'pea', projectileCount: 1, runtimeAliasOf: 'peashooter' }),
  definePlant({ id: 'jumpingBean', name: '跳跳豆', shortName: '跳豆', summary: '位移控制位，当前阶段按击退风格控制卡承载。', archetype: 'special', implementation: 'planned', unlockLevel: '9-07', chapterAffinity: ['lab'], tags: ['控制', '位移'], cost: 100, cooldownMs: 12000, maxHp: 260, damage: 90, attackIntervalMs: 1500, runtimeAliasOf: 'snowPea' }),
  definePlant({ id: 'citron', name: '香橼', shortName: '橼', summary: '重炮型输出位，单发更重但间隔更长。', archetype: 'shooter', implementation: 'planned', unlockLevel: '9-06', chapterAffinity: ['lab', 'all'], tags: ['输出', '重炮'], cost: 350, cooldownMs: 9500, maxHp: 300, damage: 90, attackIntervalMs: 2600, projectileKind: 'pea', projectileCount: 1, runtimeAliasOf: 'peashooter' }),
  definePlant({ id: 'bloomerang', name: '回旋镖射手', shortName: '镖', summary: '穿透概念输出位，当前阶段按多线射手落地。', archetype: 'shooter', implementation: 'planned', unlockLevel: '9-07', chapterAffinity: ['lab', 'all'], tags: ['输出', '穿透'], cost: 175, cooldownMs: 8500, maxHp: 300, damage: 26, attackIntervalMs: 1350, projectileKind: 'pea', projectileCount: 1, multiLane: 'adjacent', runtimeAliasOf: 'threepeater' }),
  definePlant({ id: 'laserBean', name: '激光豆', shortName: '激', summary: '整线穿透概念位，当前阶段按高强直线输出处理。', archetype: 'shooter', implementation: 'planned', unlockLevel: '10-01', chapterAffinity: ['lab', 'all'], tags: ['输出', '穿透'], cost: 200, cooldownMs: 8500, maxHp: 300, damage: 38, attackIntervalMs: 1450, projectileKind: 'shock', projectileCount: 1, runtimeAliasOf: 'repeater' }),
  definePlant({ id: 'bonkChoy', name: '菜问', shortName: '拳', summary: '高速近战连打位。', archetype: 'melee', implementation: 'planned', unlockLevel: '10-02', chapterAffinity: ['all'], tags: ['近战', '连打'], cost: 150, cooldownMs: 7500, maxHp: 320, damage: 70, attackIntervalMs: 850, runtimeAliasOf: 'chomper' }),
  definePlant({ id: 'electricPea', name: '电能射手', shortName: '电', summary: '连锁输出概念位，当前阶段按高阶直线射手承载。', archetype: 'shooter', implementation: 'planned', unlockLevel: '10-03', chapterAffinity: ['lab', 'all'], tags: ['输出', '连锁'], cost: 225, cooldownMs: 8500, maxHp: 300, damage: 32, attackIntervalMs: 1200, projectileKind: 'shock', projectileCount: 1, runtimeAliasOf: 'repeater' }),
  definePlant({ id: 'frostMelonVine', name: '冰西瓜藤', shortName: '冻藤', summary: '强控抛投位，当前阶段按冰瓜强化版承载。', archetype: 'lobber', implementation: 'planned', unlockLevel: '10-04', chapterAffinity: ['roof', 'all'], tags: ['输出', '减速', '溅射'], cost: 450, cooldownMs: 9000, maxHp: 320, damage: 95, splashRadius: 3, attackIntervalMs: 2100, projectileKind: 'lobbed', projectileCount: 1, runtimeAliasOf: 'winterMelon' }),
  definePlant({ id: 'miniSunflower', name: '迷你太阳花', shortName: '小阳', summary: '高频低值产光位，适合紧凑节奏关。', archetype: 'economy', implementation: 'planned', unlockLevel: '8-01', chapterAffinity: ['all'], tags: ['经济', '高频'], cost: 25, cooldownMs: 6000, maxHp: 220, producesSun: true, sunIntervalMs: 4000, sunAmount: 15, runtimeAliasOf: 'sunflower' }),
  definePlant({ id: 'doubleCabbage', name: '双生卷心菜', shortName: '双菜', summary: '双抛投过渡位。', archetype: 'lobber', implementation: 'planned', unlockLevel: '8-08', chapterAffinity: ['roof', 'all'], tags: ['输出', '抛投'], cost: 175, cooldownMs: 8000, maxHp: 300, damage: 35, attackIntervalMs: 1600, projectileKind: 'lobbed', projectileCount: 2, runtimeAliasOf: 'cabbagePult' }),
  definePlant({ id: 'magnetBurstShroom', name: '磁暴菇', shortName: '磁暴', summary: '群体脱甲支援位，当前阶段按磁力菇强化版接入。', archetype: 'support', implementation: 'planned', unlockLevel: '10-04', chapterAffinity: ['lab', 'night'], tags: ['控制', '脱甲'], cost: 175, cooldownMs: 14000, maxHp: 280, supportEffect: 'armor-strip', runtimeAliasOf: 'magnetShroom' }),
  definePlant({ id: 'shieldBlossom', name: '护盾花', shortName: '盾', summary: '队友保护位，当前阶段按容器式防护处理。', archetype: 'support', implementation: 'planned', unlockLevel: '10-03', chapterAffinity: ['all'], tags: ['保护', '支援'], cost: 125, cooldownMs: 10000, maxHp: 320, supportEffect: 'shield', runtimeAliasOf: 'pumpkin' }),
  definePlant({ id: 'auditBean', name: '审计豆', shortName: '审', summary: '项目专属高威胁标记位，当前阶段按高阶直线输出承载。', archetype: 'special', implementation: 'planned', unlockLevel: '10-07', chapterAffinity: ['lab'], tags: ['特殊', '标记'], cost: 250, cooldownMs: 9000, maxHp: 300, damage: 45, attackIntervalMs: 1400, projectileKind: 'shock', projectileCount: 1, runtimeAliasOf: 'electricPea' }),
];

export const PVZ_PLANT_MAP = Object.fromEntries(PVZ_PLANTS.map((plant) => [plant.id, plant])) as Record<PvZPlantId, PvZPlantDefinition>;

export function getPvZPlantById(plantId: PvZPlantId): PvZPlantDefinition {
  return PVZ_PLANT_MAP[plantId];
}

export function getPvZPlantRuntimeDefinition(plantId: PvZPlantId): PvZPlantDefinition {
  const definition = getPvZPlantById(plantId);
  if (!definition.runtimeAliasOf) return definition;
  const runtimeDefinition = getPvZPlantRuntimeDefinition(definition.runtimeAliasOf);
  return {
    ...runtimeDefinition,
    ...definition,
    damage: definition.damage ?? runtimeDefinition.damage,
    attackIntervalMs: definition.attackIntervalMs ?? runtimeDefinition.attackIntervalMs,
    producesSun: definition.producesSun ?? runtimeDefinition.producesSun,
    sunIntervalMs: definition.sunIntervalMs ?? runtimeDefinition.sunIntervalMs,
    sunAmount: definition.sunAmount ?? runtimeDefinition.sunAmount,
    projectileKind: definition.projectileKind ?? runtimeDefinition.projectileKind,
    projectileCount: definition.projectileCount ?? runtimeDefinition.projectileCount,
    explodeRadius: definition.explodeRadius ?? runtimeDefinition.explodeRadius,
    splashRadius: definition.splashRadius ?? runtimeDefinition.splashRadius,
    multiLane: definition.multiLane ?? runtimeDefinition.multiLane,
    supportEffect: definition.supportEffect ?? runtimeDefinition.supportEffect,
  };
}
