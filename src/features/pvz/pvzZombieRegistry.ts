import type { PvZZombieDefinition } from './pvzTypes';

export const PVZ_ZOMBIES: PvZZombieDefinition[] = [
  { id: 'normal', name: '普通僵尸', shortName: '僵', maxHp: 200, speed: 0.00002, rewardSun: 25 },
  { id: 'flag', name: '旗帜僵尸', shortName: '旗', maxHp: 200, speed: 0.000024, rewardSun: 25 },
  { id: 'conehead', name: '路障僵尸', shortName: '障', maxHp: 370, speed: 0.00002, rewardSun: 25 },
  { id: 'buckethead', name: '铁桶僵尸', shortName: '桶', maxHp: 1100, speed: 0.000018, rewardSun: 50 },
  { id: 'newspaper', name: '报纸僵尸', shortName: '报', maxHp: 340, speed: 0.000022, rewardSun: 25 },
  { id: 'pole', name: '撑杆僵尸', shortName: '杆', maxHp: 340, speed: 0.000026, rewardSun: 25 },
  { id: 'football', name: '橄榄球僵尸', shortName: '橄', maxHp: 1400, speed: 0.00003, rewardSun: 50 },
  { id: 'screenDoor', name: '铁栅门僵尸', shortName: '门', maxHp: 850, speed: 0.000018, rewardSun: 50 },
];

export const PVZ_ZOMBIE_MAP = Object.fromEntries(PVZ_ZOMBIES.map((zombie) => [zombie.id, zombie])) as Record<
  PvZZombieDefinition['id'],
  PvZZombieDefinition
>;
