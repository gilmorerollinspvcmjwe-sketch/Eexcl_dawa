import React from 'react';
import type { GoldMinerOverlayViewModel, GoldMinerResultSummary } from '../../features/gold_miner/goldMinerSelectors.ts';
import type { GoldMinerShopItemDefinition } from '../../features/gold_miner/goldMinerShopRegistry.ts';

export interface GoldMinerOverlayProps {
  overlay: GoldMinerOverlayViewModel;
  result?: GoldMinerResultSummary;
  shopItems?: GoldMinerShopItemDefinition[];
  currentBank?: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onBuyShopItem?: (itemId: string) => void;
}

export const GoldMinerOverlay: React.FC<GoldMinerOverlayProps> = ({
  overlay,
  result,
  shopItems = [],
  currentBank = 0,
  onPrimaryAction,
  onSecondaryAction,
  onBuyShopItem,
}) => {
  if (!overlay.kind) return null;

  return (
    <div className="gold-miner-overlay">
      <div className="gold-miner-overlay__panel">
        <h2>{overlay.title}</h2>
        <p>{overlay.description}</p>
        {result && (
          <div className="gold-miner-overlay__result">
            <span>分数 {result.score.toLocaleString()} / {result.targetScore.toLocaleString()}</span>
            <span>带回 {result.caughtCount} 件</span>
            {result.bestCatchLabel ? <span>最佳收获 {result.bestCatchLabel}</span> : null}
          </div>
        )}
        {overlay.kind === 'shop' && (
          <div className="gold-miner-shop">
            <strong>当前资金 ${currentBank.toLocaleString()}</strong>
            <div className="gold-miner-shop__grid">
              {shopItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="gold-miner-shop__item"
                  disabled={currentBank < item.price}
                  onClick={() => onBuyShopItem?.(item.id)}
                >
                  <span>{item.label}</span>
                  <strong>${item.price.toLocaleString()}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="gold-miner-overlay__actions">
          {overlay.primaryActionLabel ? (
            <button type="button" className="gold-miner-btn gold-miner-btn--accent" onClick={onPrimaryAction}>
              {overlay.primaryActionLabel}
            </button>
          ) : null}
          {overlay.secondaryActionLabel ? (
            <button type="button" className="gold-miner-btn" onClick={onSecondaryAction}>
              {overlay.secondaryActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

