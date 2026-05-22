/* 奇幻战线兵种配置。包含22个首发兵种的基础属性配置。 */

export type UnitRole = 'tank' | 'melee' | 'ranged' | 'magic' | 'air' | 'boss';
export type UnitFaction = 'player' | 'enemy';

export interface UnitRenderConfig {
  id: string;
  name: string;
  role: UnitRole;
  faction: UnitFaction;
  bodyColor: string;
  detailColor: string;
  weaponColor: string;
  size: number;
  hasWings: boolean;
  hasShield: boolean;
  hasWeapon: 'sword' | 'bow' | 'staff' | 'axe' | 'claw' | 'none';
  hasHelmet: boolean;
  hasCape: boolean;
  attackFrame: number;
  walkFrame: number;
}

// 颜色方案
const COLORS = {
  player: { body: '#4A90D9', detail: '#2C5F8A', weapon: '#8B7355' },
  enemy: { body: '#D94A4A', detail: '#8A2C2C', weapon: '#735555' },
  goblin: { body: '#6B8E23', detail: '#556B2F' },
  orc: { body: '#556B2F', detail: '#3B4A1F' },
  undead: { body: '#8B8682', detail: '#6B6561' },
  ice: { body: '#87CEEB', detail: '#5F9EA0' },
  fire: { body: '#FF6347', detail: '#CC4F35' },
  dragon: { body: '#DC143C', detail: '#8B0000' },
  tree: { body: '#8B4513', detail: '#654321' },
  stone: { body: '#808080', detail: '#606060' },
};

// 22个兵种配置
export const UNIT_CONFIGS: Record<string, UnitRenderConfig> = {
  // === 前排肉盾（4个）===
  goblin_shield: { id: 'goblin_shield', name: '哥布林盾兵', role: 'tank', faction: 'player', bodyColor: COLORS.goblin.body, detailColor: COLORS.goblin.detail, weaponColor: '#8B7355', size: 28, hasWings: false, hasShield: true, hasWeapon: 'sword', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  orc_heavy: { id: 'orc_heavy', name: '兽人重甲兵', role: 'tank', faction: 'player', bodyColor: COLORS.orc.body, detailColor: COLORS.orc.detail, weaponColor: '#666666', size: 35, hasWings: false, hasShield: true, hasWeapon: 'axe', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  stone_guard: { id: 'stone_guard', name: '石像卫士', role: 'tank', faction: 'player', bodyColor: COLORS.stone.body, detailColor: COLORS.stone.detail, weaponColor: '#999999', size: 38, hasWings: false, hasShield: true, hasWeapon: 'sword', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  dwarf_ironwall: { id: 'dwarf_ironwall', name: '铁壁矮人', role: 'tank', faction: 'player', bodyColor: '#B8860B', detailColor: '#8B6914', weaponColor: '#666666', size: 25, hasWings: false, hasShield: true, hasWeapon: 'axe', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },

  // === 近战冲锋（4个）===
  wolf_rider: { id: 'wolf_rider', name: '狼骑兵', role: 'melee', faction: 'player', bodyColor: '#696969', detailColor: '#4A4A4A', weaponColor: '#8B7355', size: 30, hasWings: false, hasShield: false, hasWeapon: 'sword', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  berserker: { id: 'berserker', name: '狂战士', role: 'melee', faction: 'player', bodyColor: '#CD853F', detailColor: '#A0522D', weaponColor: '#8B7355', size: 32, hasWings: false, hasShield: false, hasWeapon: 'axe', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  crypt_crawler: { id: 'crypt_crawler', name: '地穴爬兽', role: 'melee', faction: 'player', bodyColor: '#4B0082', detailColor: '#3B0062', weaponColor: '#666666', size: 26, hasWings: false, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  shadow_assassin: { id: 'shadow_assassin', name: '暗影刺客', role: 'melee', faction: 'player', bodyColor: '#2F4F4F', detailColor: '#1F3F3F', weaponColor: '#C0C0C0', size: 24, hasWings: false, hasShield: false, hasWeapon: 'sword', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },

  // === 远程持续输出（4个）===
  archer: { id: 'archer', name: '弓箭手', role: 'ranged', faction: 'player', bodyColor: '#228B22', detailColor: '#006400', weaponColor: '#8B7355', size: 22, hasWings: false, hasShield: false, hasWeapon: 'bow', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  elf_shooter: { id: 'elf_shooter', name: '精灵射手', role: 'ranged', faction: 'player', bodyColor: '#98FB98', detailColor: '#3CB371', weaponColor: '#DAA520', size: 24, hasWings: false, hasShield: false, hasWeapon: 'bow', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  musketeer: { id: 'musketeer', name: '火枪佣兵', role: 'ranged', faction: 'player', bodyColor: '#8B4513', detailColor: '#654321', weaponColor: '#444444', size: 23, hasWings: false, hasShield: false, hasWeapon: 'bow', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  ballista: { id: 'ballista', name: '弩炮车', role: 'ranged', faction: 'player', bodyColor: '#8B7355', detailColor: '#6B5335', weaponColor: '#444444', size: 35, hasWings: false, hasShield: false, hasWeapon: 'bow', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },

  // === 法术/范围兵（4个）===
  flame_warlock: { id: 'flame_warlock', name: '火焰术士', role: 'magic', faction: 'player', bodyColor: COLORS.fire.body, detailColor: COLORS.fire.detail, weaponColor: '#FFD700', size: 26, hasWings: false, hasShield: false, hasWeapon: 'staff', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  ice_witch: { id: 'ice_witch', name: '冰霜女巫', role: 'magic', faction: 'player', bodyColor: COLORS.ice.body, detailColor: COLORS.ice.detail, weaponColor: '#E0FFFF', size: 25, hasWings: false, hasShield: false, hasWeapon: 'staff', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  plague_thrower: { id: 'plague_thrower', name: '瘟疫投手', role: 'magic', faction: 'player', bodyColor: '#556B2F', detailColor: '#3B4A1F', weaponColor: '#8B008B', size: 24, hasWings: false, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  thunder_mage: { id: 'thunder_mage', name: '雷电法师', role: 'magic', faction: 'player', bodyColor: '#4169E1', detailColor: '#2F4F8F', weaponColor: '#FFD700', size: 26, hasWings: false, hasShield: false, hasWeapon: 'staff', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },

  // === 空中/特殊兵（3个）===
  griffin_knight: { id: 'griffin_knight', name: '狮鹫骑士', role: 'air', faction: 'player', bodyColor: '#DAA520', detailColor: '#B8860B', weaponColor: '#C0C0C0', size: 38, hasWings: true, hasShield: true, hasWeapon: 'sword', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  bat_swarm: { id: 'bat_swarm', name: '蝙蝠群', role: 'air', faction: 'player', bodyColor: '#4B0082', detailColor: '#3B0062', weaponColor: '#666666', size: 28, hasWings: true, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  young_dragon: { id: 'young_dragon', name: '幼龙', role: 'air', faction: 'player', bodyColor: COLORS.dragon.body, detailColor: COLORS.dragon.detail, weaponColor: '#FFD700', size: 36, hasWings: true, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },

  // === 高费终结兵（3个）===
  tree_ancient: { id: 'tree_ancient', name: '树人古卫', role: 'boss', faction: 'player', bodyColor: COLORS.tree.body, detailColor: COLORS.tree.detail, weaponColor: '#228B22', size: 52, hasWings: false, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  ogre_lord: { id: 'ogre_lord', name: '食人魔领主', role: 'boss', faction: 'player', bodyColor: '#8B4513', detailColor: '#654321', weaponColor: '#666666', size: 55, hasWings: false, hasShield: true, hasWeapon: 'axe', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  fire_dragon: { id: 'fire_dragon', name: '火龙', role: 'boss', faction: 'player', bodyColor: '#FF4500', detailColor: '#CC3700', weaponColor: '#FFD700', size: 62, hasWings: true, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },

  // === 新兵种（15个）===
  // 地面兵种
  holy_knight: { id: 'holy_knight', name: '圣骑士', role: 'tank', faction: 'player', bodyColor: '#DAA520', detailColor: '#B8860B', weaponColor: '#FFD700', size: 32, hasWings: false, hasShield: true, hasWeapon: 'sword', hasHelmet: true, hasCape: true, attackFrame: 0, walkFrame: 0 },
  druid: { id: 'druid', name: '德鲁伊', role: 'magic', faction: 'player', bodyColor: '#228B22', detailColor: '#006400', weaponColor: '#8B4513', size: 24, hasWings: false, hasShield: false, hasWeapon: 'staff', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  siege_ram: { id: 'siege_ram', name: '攻城锤', role: 'boss', faction: 'player', bodyColor: '#8B7355', detailColor: '#6B5335', weaponColor: '#666666', size: 48, hasWings: false, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  shadow_hunter: { id: 'shadow_hunter', name: '暗影猎手', role: 'melee', faction: 'player', bodyColor: '#2F4F4F', detailColor: '#1F3F3F', weaponColor: '#C0C0C0', size: 22, hasWings: false, hasShield: false, hasWeapon: 'sword', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  elementalist: { id: 'elementalist', name: '元素使', role: 'magic', faction: 'player', bodyColor: '#9370DB', detailColor: '#6A5ACD', weaponColor: '#FF6347', size: 28, hasWings: false, hasShield: false, hasWeapon: 'staff', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },
  heavy_crossbow: { id: 'heavy_crossbow', name: '重装弩手', role: 'ranged', faction: 'player', bodyColor: '#696969', detailColor: '#4A4A4A', weaponColor: '#8B7355', size: 30, hasWings: false, hasShield: false, hasWeapon: 'bow', hasHelmet: true, hasCape: false, attackFrame: 0, walkFrame: 0 },
  field_medic: { id: 'field_medic', name: '战地医师', role: 'magic', faction: 'player', bodyColor: '#F0F8FF', detailColor: '#DC143C', weaponColor: '#FFFFFF', size: 22, hasWings: false, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  mammoth: { id: 'mammoth', name: '猛犸象', role: 'boss', faction: 'player', bodyColor: '#8B7355', detailColor: '#6B5335', weaponColor: '#F5F5DC', size: 58, hasWings: false, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  demolitionist: { id: 'demolitionist', name: '爆破专家', role: 'magic', faction: 'player', bodyColor: '#8B4513', detailColor: '#654321', weaponColor: '#FF4500', size: 26, hasWings: false, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  blade_master: { id: 'blade_master', name: '剑圣', role: 'melee', faction: 'player', bodyColor: '#C0C0C0', detailColor: '#A0A0A0', weaponColor: '#E0E0E0', size: 30, hasWings: false, hasShield: false, hasWeapon: 'sword', hasHelmet: false, hasCape: true, attackFrame: 0, walkFrame: 0 },

  // 空中兵种
  wind_spirit: { id: 'wind_spirit', name: '风灵', role: 'air', faction: 'player', bodyColor: '#87CEEB', detailColor: '#5F9EA0', weaponColor: '#E0FFFF', size: 24, hasWings: true, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  gargoyle: { id: 'gargoyle', name: '石像鬼', role: 'air', faction: 'player', bodyColor: '#808080', detailColor: '#606060', weaponColor: '#999999', size: 32, hasWings: true, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  phoenix: { id: 'phoenix', name: '凤凰', role: 'air', faction: 'player', bodyColor: '#FF6347', detailColor: '#FFD700', weaponColor: '#FF4500', size: 40, hasWings: true, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  thunder_eagle: { id: 'thunder_eagle', name: '雷鹰', role: 'air', faction: 'player', bodyColor: '#4169E1', detailColor: '#2F4F8F', weaponColor: '#FFD700', size: 36, hasWings: true, hasShield: false, hasWeapon: 'claw', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
  angel: { id: 'angel', name: '天使', role: 'air', faction: 'player', bodyColor: '#F0F8FF', detailColor: '#FFD700', weaponColor: '#FFFFFF', size: 38, hasWings: true, hasShield: false, hasWeapon: 'none', hasHelmet: false, hasCape: false, attackFrame: 0, walkFrame: 0 },
};
