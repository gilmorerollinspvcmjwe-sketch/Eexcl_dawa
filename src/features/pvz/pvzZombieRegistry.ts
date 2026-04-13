/* PvZ 僵尸注册表。统一维护 30 种僵尸的威胁树、基础数值和阶段性实现状态。 */
import type { PvZZombieDefinition, PvZZombieId } from './pvzTypes.ts';

type PvZZombieInput = Omit<PvZZombieDefinition, 'chapterAffinity' | 'implementation' | 'tags'> & {
  chapterAffinity?: PvZZombieDefinition['chapterAffinity'];
  implementation?: PvZZombieDefinition['implementation'];
  tags?: string[];
};

function defineZombie(entry: PvZZombieInput): PvZZombieDefinition {
  return {
    chapterAffinity: ['all'],
    implementation: 'variant',
    tags: [],
    ...entry,
  };
}

export const PVZ_ZOMBIES: PvZZombieDefinition[] = [
  defineZombie({ id: 'normal', name: '普通僵尸', shortName: '僵', summary: '基础步压单位。', archetype: 'walker', implementation: 'full', unlockLevel: '1-01', chapterAffinity: ['day', 'all'], tags: ['基础', '步压'], threatLabel: '步压', maxHp: 200, speed: 0.00002, rewardSun: 25 }),
  defineZombie({ id: 'flag', name: '旗帜僵尸', shortName: '旗', summary: '大波提示与加速推进的领头单位。', archetype: 'fast', implementation: 'full', unlockLevel: '1-03', chapterAffinity: ['day', 'all'], tags: ['波次', '旗帜'], threatLabel: '旗帜', maxHp: 200, speed: 0.000024, rewardSun: 25 }),
  defineZombie({ id: 'conehead', name: '路障僵尸', shortName: '障', summary: '轻甲拖线单位。', archetype: 'armored', implementation: 'full', unlockLevel: '1-04', chapterAffinity: ['day', 'all'], tags: ['轻甲'], threatLabel: '护具', maxHp: 370, armorHp: 170, speed: 0.00002, rewardSun: 25 }),
  defineZombie({ id: 'pole', name: '撑杆僵尸', shortName: '杆', summary: '能越过首层防线的跳跃快攻。', archetype: 'jumper', implementation: 'full', unlockLevel: '1-08', chapterAffinity: ['day', 'all'], tags: ['跳跃', '快攻'], threatLabel: '跳跃', maxHp: 340, speed: 0.000026, rewardSun: 25 }),
  defineZombie({ id: 'newspaper', name: '报纸僵尸', shortName: '报', summary: '受压后会提速的变速单位。', archetype: 'fast', implementation: 'full', unlockLevel: '2-02', chapterAffinity: ['night'], tags: ['变速'], threatLabel: '变速', maxHp: 340, armorHp: 140, speed: 0.000022, speedMultiplierOnTrigger: 1.4, rewardSun: 25 }),
  defineZombie({ id: 'screenDoor', name: '铁栅门僵尸', shortName: '门', summary: '前置护盾带来的长线拖压。', archetype: 'armored', implementation: 'full', unlockLevel: '2-04', chapterAffinity: ['night', 'all'], tags: ['护盾', '重压'], threatLabel: '护盾', maxHp: 850, armorHp: 650, speed: 0.000018, rewardSun: 50 }),
  defineZombie({ id: 'buckethead', name: '铁桶僵尸', shortName: '桶', summary: '标准重甲单位。', archetype: 'armored', implementation: 'full', unlockLevel: '3-04', chapterAffinity: ['pool', 'all'], tags: ['重甲'], threatLabel: '重甲', maxHp: 1100, armorHp: 900, speed: 0.000018, rewardSun: 50 }),
  defineZombie({ id: 'football', name: '橄榄球僵尸', shortName: '橄', summary: '高速重甲，是后期快攻核心。', archetype: 'fast', implementation: 'full', unlockLevel: '4-06', chapterAffinity: ['fog', 'all'], tags: ['快攻', '重甲'], threatLabel: '快攻', maxHp: 1400, armorHp: 1100, speed: 0.00003, rewardSun: 50 }),

  defineZombie({ id: 'snorkel', name: '潜水僵尸', shortName: '潜', summary: '水路潜行压线，接近前线才显形。', archetype: 'water', implementation: 'full', unlockLevel: '3-05', chapterAffinity: ['pool'], tags: ['水路', '潜行'], threatLabel: '潜行', maxHp: 300, speed: 0.000027, rewardSun: 25 }),
  defineZombie({ id: 'dolphinRider', name: '海豚骑士僵尸', shortName: '豚', summary: '水面跳跃快攻。', archetype: 'water', implementation: 'full', unlockLevel: '3-08', chapterAffinity: ['pool'], tags: ['水路', '跳跃'], threatLabel: '水跃', maxHp: 360, speed: 0.000031, rewardSun: 25 }),
  defineZombie({ id: 'balloon', name: '气球僵尸', shortName: '球', summary: '空中路线单位，需反空单位。', archetype: 'air', implementation: 'full', unlockLevel: '8-07', chapterAffinity: ['pool', 'fog', 'all'], tags: ['空中', '快攻'], threatLabel: '空中', maxHp: 260, speed: 0.000036, rewardSun: 50 }),
  defineZombie({ id: 'miner', name: '矿工僵尸', shortName: '矿', summary: '从后排切入的偷家单位。', archetype: 'rear', implementation: 'full', unlockLevel: '7-03', chapterAffinity: ['fog', 'all'], tags: ['后切', '偷后排'], threatLabel: '后切', maxHp: 340, speed: 0.000024, rewardSun: 25 }),
  defineZombie({ id: 'dancing', name: '舞王僵尸', shortName: '舞', summary: '召唤型核心单位，定期召唤伴舞。', archetype: 'summoner', implementation: 'full', unlockLevel: '8-05', chapterAffinity: ['night', 'all'], tags: ['召唤', '核心'], threatLabel: '召唤', maxHp: 500, speed: 0.000023, rewardSun: 50, summonIds: ['backupDancer'] }),
  defineZombie({ id: 'backupDancer', name: '伴舞僵尸', shortName: '伴', summary: '舞王伴生的小体量补量怪。', archetype: 'walker', implementation: 'full', unlockLevel: '8-05', chapterAffinity: ['night', 'all'], tags: ['召唤', '杂兵'], threatLabel: '伴舞', maxHp: 220, speed: 0.000026, rewardSun: 25 }),
  defineZombie({ id: 'zomboni', name: '冰车僵尸', shortName: '冰车', summary: '高速冲线压制，制造冰道。', archetype: 'fast', implementation: 'full', unlockLevel: '6-03', chapterAffinity: ['roof', 'all'], tags: ['冲线', '载具'], threatLabel: '冲线', maxHp: 1550, armorHp: 650, speed: 0.000024, rewardSun: 75 }),
  defineZombie({ id: 'bobsled', name: '雪橇车僵尸', shortName: '雪橇', summary: '成组冲刺的载具单位。', archetype: 'fast', implementation: 'full', unlockLevel: '6-03', chapterAffinity: ['roof', 'all'], tags: ['冲线', '载具'], threatLabel: '载具', maxHp: 800, armorHp: 200, speed: 0.000032, rewardSun: 50 }),
  defineZombie({ id: 'basketball', name: '投篮车僵尸', shortName: '篮', summary: '远程攻城位，投掷篮球攻击植物。', archetype: 'ranged', implementation: 'full', unlockLevel: '6-10', chapterAffinity: ['roof', 'all'], tags: ['远程', '攻城'], threatLabel: '远程', maxHp: 650, armorHp: 250, speed: 0.000019, rewardSun: 50 }),
  defineZombie({ id: 'ladder', name: '扶梯僵尸', shortName: '梯', summary: '破阵单位，破坏前排体系。', archetype: 'jumper', implementation: 'full', unlockLevel: '6-08', chapterAffinity: ['roof', 'all'], tags: ['破阵', '跳跃'], threatLabel: '破阵', maxHp: 500, speed: 0.000023, rewardSun: 25 }),
  defineZombie({ id: 'gargantuar', name: '巨人僵尸', shortName: '巨', summary: 'Boss 级高压单位，投掷小鬼。', archetype: 'boss', implementation: 'full', unlockLevel: '6-07', chapterAffinity: ['roof', 'all'], tags: ['Boss', '巨型'], threatLabel: '巨人', maxHp: 3000, armorHp: 1500, speed: 0.000015, rewardSun: 125, summonIds: ['imp'] }),
  defineZombie({ id: 'imp', name: '小鬼僵尸', shortName: '鬼', summary: '极快的小体量骚扰单位。', archetype: 'fast', unlockLevel: '6-07', chapterAffinity: ['roof', 'all'], tags: ['快攻', '骚扰'], threatLabel: '骚扰', maxHp: 140, speed: 0.00004, rewardSun: 25 }),

  defineZombie({ id: 'bungee', name: '蹦极僵尸', shortName: '蹦', summary: '偷取植物的上方突袭单位。', archetype: 'rear', implementation: 'full', unlockLevel: '7-07', chapterAffinity: ['fog', 'all'], tags: ['偷取', '突袭'], threatLabel: '偷植物', maxHp: 280, speed: 0.000025, rewardSun: 25 }),
  defineZombie({ id: 'pogo', name: '跳跳僵尸', shortName: '跳', summary: '高差环境快攻位，跳过前排。', archetype: 'jumper', implementation: 'full', unlockLevel: '7-09', chapterAffinity: ['roof', 'fog'], tags: ['高差', '跳跃'], threatLabel: '跳压', maxHp: 360, speed: 0.00003, rewardSun: 25 }),
  defineZombie({ id: 'engineer', name: '工程僵尸', shortName: '工', summary: '专打防线的拆障单位。', archetype: 'support', implementation: 'full', unlockLevel: '9-03', chapterAffinity: ['lab'], tags: ['拆障', '精英'], threatLabel: '拆障', maxHp: 520, armorHp: 180, speed: 0.000022, rewardSun: 50 }),
  defineZombie({ id: 'pipe', name: '管道僵尸', shortName: '管', summary: '特殊入口切线单位。', archetype: 'rear', implementation: 'full', unlockLevel: '9-04', chapterAffinity: ['lab'], tags: ['侧切', '多入口'], threatLabel: '侧切', maxHp: 320, speed: 0.000028, rewardSun: 25 }),
  defineZombie({ id: 'auditZombie', name: '读表僵尸', shortName: '读', summary: '为周围单位施压的精英怪。', archetype: 'support', implementation: 'full', unlockLevel: '9-08', chapterAffinity: ['lab'], tags: ['精英', '光环'], threatLabel: '增压', maxHp: 620, armorHp: 220, speed: 0.000021, rewardSun: 50 }),
  defineZombie({ id: 'formulaZombie', name: '公式僵尸', shortName: '式', summary: '词条护盾精英怪。', archetype: 'armored', implementation: 'full', unlockLevel: '9-03', chapterAffinity: ['lab'], tags: ['护盾', '词条'], threatLabel: '公式盾', maxHp: 900, armorHp: 450, speed: 0.00002, rewardSun: 50 }),
  defineZombie({ id: 'shorthandZombie', name: '速记僵尸', shortName: '记', summary: '超快低血单位，专门考验低费拦截。', archetype: 'fast', implementation: 'full', unlockLevel: '9-04', chapterAffinity: ['lab'], tags: ['超快', '脆皮'], threatLabel: '极速', maxHp: 180, speed: 0.000042, rewardSun: 25 }),
  defineZombie({ id: 'auditChief', name: '审计官僵尸', shortName: '官', summary: '为全队提供增益的高阶精英。', archetype: 'support', implementation: 'full', unlockLevel: '9-08', chapterAffinity: ['lab'], tags: ['精英', '指挥'], threatLabel: '指挥', maxHp: 1100, armorHp: 500, speed: 0.00002, rewardSun: 75 }),
  defineZombie({ id: 'hostZombie', name: '会议主持僵尸', shortName: '主', summary: '召唤拖时的主持型 Boss。', archetype: 'summoner', implementation: 'full', unlockLevel: '9-10', chapterAffinity: ['lab'], tags: ['Boss', '召唤'], threatLabel: '主持', maxHp: 1600, armorHp: 700, speed: 0.000018, rewardSun: 100, summonIds: ['backupDancer', 'imp'] }),
  defineZombie({ id: 'finalGargantuar', name: '终审巨人', shortName: '终巨', summary: '终局多阶段 Boss。', archetype: 'boss', implementation: 'planned', unlockLevel: '10-10', chapterAffinity: ['lab', 'all'], tags: ['终局', 'Boss'], threatLabel: '终局 Boss', maxHp: 4200, armorHp: 2200, speed: 0.000014, rewardSun: 200, runtimeAliasOf: 'gargantuar' }),
];

export const PVZ_ZOMBIE_MAP = Object.fromEntries(PVZ_ZOMBIES.map((zombie) => [zombie.id, zombie])) as Record<PvZZombieId, PvZZombieDefinition>;

export function getPvZZombieById(zombieId: PvZZombieId): PvZZombieDefinition {
  return PVZ_ZOMBIE_MAP[zombieId];
}

export function getPvZZombieRuntimeDefinition(zombieId: PvZZombieId): PvZZombieDefinition {
  const definition = getPvZZombieById(zombieId);
  if (!definition.runtimeAliasOf) return definition;
  const runtimeDefinition = getPvZZombieRuntimeDefinition(definition.runtimeAliasOf);
  return {
    ...runtimeDefinition,
    ...definition,
    armorHp: definition.armorHp ?? runtimeDefinition.armorHp,
    speedMultiplierOnTrigger: definition.speedMultiplierOnTrigger ?? runtimeDefinition.speedMultiplierOnTrigger,
    summonIds: definition.summonIds ?? runtimeDefinition.summonIds,
  };
}
