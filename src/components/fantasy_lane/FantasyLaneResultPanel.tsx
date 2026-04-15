import React from 'react';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';

interface FantasyLaneResultPanelProps {
  state: FantasyLaneRuntimeState;
  onRetry: () => void;
  onBackToSetup: () => void;
}

export const FantasyLaneResultPanel: React.FC<FantasyLaneResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  return (
    <div className="fantasy-lane-result-overlay">
      <div className="fantasy-lane-result-card">
        <span className={`fantasy-lane-result-badge fantasy-lane-result-badge--${state.phase}`}>{state.result?.title}</span>
        <h3>{state.result?.summary}</h3>
        <div className="fantasy-lane-result-stars">
          {'★'.repeat(state.result?.stars ?? 1)}
          {'☆'.repeat(3 - (state.result?.stars ?? 1))}
        </div>
        <div className="fantasy-lane-result-grid">
          <div>
            <span>评分</span>
            <strong>{state.result?.score ?? 0}</strong>
          </div>
          <div>
            <span>击倒</span>
            <strong>{state.stats.defeated}</strong>
          </div>
          <div>
            <span>英雄技</span>
            <strong>{state.stats.heroSkillCast}</strong>
          </div>
          <div>
            <span>战术技</span>
            <strong>{state.stats.tacticalSkillCast}</strong>
          </div>
        </div>
        <div className="fantasy-lane-result-tips">
          {state.result?.tips.map((tip) => (
            <p key={tip}>{tip}</p>
          ))}
        </div>
        <div className="fantasy-lane-result-actions">
          <button type="button" className="fantasy-lane-btn" onClick={onRetry}>重开本局</button>
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onBackToSetup}>返回备战</button>
        </div>
      </div>
    </div>
  );
};
