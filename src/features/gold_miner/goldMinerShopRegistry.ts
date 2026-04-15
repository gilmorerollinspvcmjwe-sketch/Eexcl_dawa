import type { GoldMinerEffectId } from './goldMinerTypes.ts';

export interface GoldMinerShopItemDefinition {
  id: GoldMinerEffectId | 'dynamite_bundle';
  label: string;
  price: number;
  description: string;
  limitPerLevel: number;
}

export const GOLD_MINER_SHOP_REGISTRY: GoldMinerShopItemDefinition[] = [
  { id: 'dynamite_bundle', label: '炸药 x3', price: 200, description: '收钩时炸掉当前抓到的低价值目标。', limitPerLevel: 2 },
  { id: 'strength_potion', label: '力量药水', price: 280, description: '本关回收速度提高 35%。', limitPerLevel: 1 },
  { id: 'lucky_clover', label: '幸运草', price: 360, description: '本关所有有效战利品价值提高 30%。', limitPerLevel: 1 },
  { id: 'time_bonus', label: '时间沙漏', price: 260, description: '本关额外获得 10 秒。', limitPerLevel: 1 },
  { id: 'rock_detector', label: '岩石探测器', price: 140, description: '高亮石头，避免低价值抓取。', limitPerLevel: 1 },
  { id: 'diamond_detector', label: '钻石探测器', price: 420, description: '高亮钻石与稀有物。', limitPerLevel: 1 },
  { id: 'hook_boost', label: '钩爪加速', price: 300, description: '本关发射和回收速度额外提高。', limitPerLevel: 1 },
  { id: 'insurance', label: '万能保险', price: 480, description: '本关第一次抓到石头会自动脱钩。', limitPerLevel: 1 },
];

export function getGoldMinerShopItem(id: GoldMinerShopItemDefinition['id']): GoldMinerShopItemDefinition {
  const item = GOLD_MINER_SHOP_REGISTRY.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown gold miner shop item: ${id}`);
  return item;
}
