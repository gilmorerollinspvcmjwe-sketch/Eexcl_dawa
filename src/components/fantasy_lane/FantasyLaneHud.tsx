import React from 'react';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';

interface FantasyLaneHudProps {
  state: FantasyLaneRuntimeState;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit?: () => void;
}

function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatSigned(value: number) {
  return `${value > 0 ? '+' : ''}${value}`;
}

function getBasePercent(value: number, max: number) {
  return Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
}

export const FantasyLaneHud: React.FC<FantasyLaneHudProps> = ({ state, onTogglePause, onRestart, onExit }) => {
  const playerBasePercent = getBasePercent(state.playerBaseHp, state.playerBaseHpMax);
  const enemyBasePercent = getBasePercent(state.enemyBaseHp, state.enemyBaseHpMax);

  return (
    <div className="fantasy-lane-hud">
      <div className="fantasy-lane-hud-group">
        <div className="fantasy-lane-stat-card">
          <span className="fantasy-lane-stat-label">阶段</span>
          <strong>{state.phaseLabel}</strong>
        </div>
        <div className="fantasy-lane-stat-card">
          <span className="fantasy-lane-stat-label">计时</span>
          <strong>{formatTimer(state.elapsedMs)}</strong>
        </div>
        <div className="fantasy-lane-stat-card">
          <span className="fantasy-lane-stat-label">金币</span>
          <strong>{Math.round(state.gold)}</strong>
        </div>
        <div className="fantasy-lane-stat-card">
          <span className="fantasy-lane-stat-label">人口</span>
          <strong>{state.activePop}/{state.popLimit}</strong>
        </div>
      </div>

      <div className="fantasy-lane-hud-group fantasy-lane-hud-group--wide">
        <div className="fantasy-lane-base-card fantasy-lane-base-card--player">
          <div className="fantasy-lane-base-card-head">
            <span>我方主堡</span>
            <strong>{Math.round(state.playerBaseHp)} / {Math.round(state.playerBaseHpMax)}</strong>
          </div>
          <div className="fantasy-lane-base-bar">
            <span style={{ width: `${playerBasePercent}%` }} />
          </div>
        </div>

        <div className="fantasy-lane-frontline-meter">
          <span>交战读数</span>
          <strong>{formatSigned(state.frontline)}</strong>
          <div className="fantasy-lane-meter-grid">
            <small>空优 {formatSigned(state.airControl)}</small>
            <small>拥堵 {state.congestion}%</small>
          </div>
          {state.overtimeTriggered && <small className="fantasy-lane-overtime-tag">终局加压 {formatTimer(state.overtimeRemainingMs)}</small>}
        </div>

        <div className="fantasy-lane-base-card fantasy-lane-base-card--enemy">
          <div className="fantasy-lane-base-card-head">
            <span>敌方主堡</span>
            <strong>{Math.round(state.enemyBaseHp)} / {Math.round(state.enemyBaseHpMax)}</strong>
          </div>
          <div className="fantasy-lane-base-bar fantasy-lane-base-bar--enemy">
            <span style={{ width: `${enemyBasePercent}%` }} />
          </div>
        </div>
      </div>

      <div className="fantasy-lane-hud-actions">
        <button type="button" className="fantasy-lane-btn" onClick={onTogglePause}>
          {state.phase === 'paused' ? '继续' : '暂停'}
        </button>
        <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onRestart}>
          重开
        </button>
        {onExit && (
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onExit}>
            返回
          </button>
        )}
      </div>
    </div>
  );
};
