import React from 'react';
import type { PvZBoardState } from '../../features/pvz/pvzTypes';

export const PvZHud: React.FC<{ state: PvZBoardState }> = ({ state }) => {
  return (
    <div className="pvz-hud">
      <div className="pvz-hud-item">阳光 {state.sun}</div>
      <div className="pvz-hud-item">波次 {Math.round(state.waveProgress * 100)}%</div>
      <div className="pvz-hud-item">割草机 {state.lawnMowers.filter(Boolean).length}</div>
      <div className="pvz-hud-item">卡组 {state.selectedCards.length}/6</div>
      <div className={`pvz-hud-item status-${state.status}`}>{state.status === 'playing' ? '进行中' : state.status === 'won' ? '通关' : '失守'}</div>
    </div>
  );
};
