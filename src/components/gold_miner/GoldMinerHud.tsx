import React from 'react';
import type { GoldMinerHudViewModel } from '../../features/gold_miner/goldMinerSelectors.ts';

export interface GoldMinerHudProps {
  viewModel: GoldMinerHudViewModel;
  onPause?: () => void;
  onUseDynamite?: () => void;
  onOpenGuide?: () => void;
}

export const GoldMinerHud: React.FC<GoldMinerHudProps> = ({ viewModel, onPause, onUseDynamite, onOpenGuide }) => {
  return (
    <header className="gold-miner-hud">
      <div className="gold-miner-hud__summary">
        <div>
          <span className="gold-miner-hud__label">模式</span>
          <strong>{viewModel.title}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">关卡</span>
          <strong>{viewModel.levelLabel}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">目标</span>
          <strong>{viewModel.targetLabel}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">本关分数</span>
          <strong>{viewModel.scoreLabel}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">剩余时间</span>
          <strong>{viewModel.timeLabel}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">资金</span>
          <strong>{viewModel.bankLabel}</strong>
        </div>
        <div>
          <span className="gold-miner-hud__label">炸药</span>
          <strong>{viewModel.dynamiteLabel}</strong>
        </div>
      </div>
      <div className="gold-miner-hud__actions">
        <button type="button" className="gold-miner-btn" onClick={onPause}>暂停</button>
        <button type="button" className="gold-miner-btn" onClick={onOpenGuide}>图鉴</button>
        <button type="button" className="gold-miner-btn gold-miner-btn--accent" onClick={onUseDynamite} disabled={!viewModel.canUseDynamite}>炸掉当前目标</button>
      </div>
    </header>
  );
};

