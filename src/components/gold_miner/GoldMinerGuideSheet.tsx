import React from 'react';
import { GOLD_MINER_ITEM_REGISTRY } from '../../features/gold_miner/goldMinerItemRegistry.ts';
import { GOLD_MINER_SHOP_REGISTRY } from '../../features/gold_miner/goldMinerShopRegistry.ts';
import '../../styles/gold-miner.css';

export interface GoldMinerGuideSheetProps {
  onFormulaChange?: (text: string) => void;
  onOpenBattle?: () => void;
}

export const GoldMinerGuideSheet: React.FC<GoldMinerGuideSheetProps> = ({ onFormulaChange, onOpenBattle }) => {
  React.useEffect(() => {
    onFormulaChange?.('=黄金矿工图鉴 | 物品价值、商店道具与操作说明');
  }, [onFormulaChange]);

  return (
    <div className="gold-miner-guide">
      <section className="gold-miner-guide__panel">
        <h2>操作说明</h2>
        <p>`Space` 或点击矿区发射钩爪，`↑` 或 `D` 在回收时使用炸药，`P` 暂停，`R` 重开。</p>
        <button type="button" className="gold-miner-btn gold-miner-btn--accent" onClick={onOpenBattle}>返回矿区</button>
      </section>

      <section className="gold-miner-guide__panel">
        <h2>物品图鉴</h2>
        <div className="gold-miner-guide__grid">
          {Object.values(GOLD_MINER_ITEM_REGISTRY).map((item) => (
            <article key={item.kind} className="gold-miner-guide__card">
              <strong>{item.label}</strong>
              <span>价值 ${item.minValue} - ${item.maxValue}</span>
              <span>重量 {item.weight}</span>
              <span>回收倍率 {item.retractSpeedMultiplier.toFixed(2)}x</span>
            </article>
          ))}
        </div>
      </section>

      <section className="gold-miner-guide__panel">
        <h2>商店道具</h2>
        <div className="gold-miner-guide__grid">
          {GOLD_MINER_SHOP_REGISTRY.map((item) => (
            <article key={item.id} className="gold-miner-guide__card">
              <strong>{item.label}</strong>
              <span>价格 ${item.price}</span>
              <small>{item.description}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

