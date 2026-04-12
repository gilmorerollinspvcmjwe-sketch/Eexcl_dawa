import React from 'react';
import { getPvZOutcomeRecommendation } from '../../features/pvz/pvzChapterGuidance';
import type { PvZBoardState } from '../../features/pvz/pvzTypes';

interface PvZResultPanelProps {
  state: PvZBoardState;
  onRetry: () => void;
  onBackToSetup: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const PvZResultPanel: React.FC<PvZResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const title = state.phase === 'won' ? '章节通关' : '防线失守';
  const subtitle =
    state.phase === 'won'
      ? '本章目标已完成，可继续优化卡组冲击更稳通关。'
      : '本局未守住防线，建议根据威胁调整前中期布防。';

  return (
    <div className="pvz-setup-panel" style={{ borderColor: state.phase === 'won' ? '#107c41' : '#b91c1c' }}>
      <div className="pvz-setup-copy">
        <strong>{title} · {state.chapterTitle}</strong>
        <span>{subtitle}</span>
        <span>模式：{state.mode === 'adventure' ? '章节征途' : state.mode === 'lab' ? '洞察试验' : '长线生存'} · {state.scenarioObjective}</span>
        <span>规则：{state.scenarioRules.join(' / ')}</span>
        <span>用时：{formatDuration(state.elapsedMs)} | 波次：{Math.round(state.waveProgress * 100)}% | 剩余阳光：{state.sun}</span>
        <span>场上单位：植物 {state.plants.length} / 僵尸 {state.zombies.length}</span>
        <span>{getPvZOutcomeRecommendation(state)}</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <button className="pvz-start-btn" onClick={onRetry}>同章再战</button>
        <button className="pvz-start-btn" onClick={onBackToSetup}>返回选卡</button>
      </div>
    </div>
  );
};
