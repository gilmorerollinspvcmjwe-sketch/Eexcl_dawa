import React from 'react';
import { FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';

interface FantasyLaneHudProps {
  state: FantasyLaneRuntimeState;
  onCastHero: () => void;
  onCastTactical: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onStart?: () => void;
  onExitLevel?: () => void;
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

function formatCooldown(ms: number) {
  return ms > 0 ? `${Math.ceil(ms / 100) / 10}s` : '就绪';
}

function getBasePercent(value: number, max: number) {
  return Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
}

export const FantasyLaneHud: React.FC<FantasyLaneHudProps> = ({
  state,
  onCastHero,
  onCastTactical,
  onTogglePause,
  onRestart,
  onStart,
  onExitLevel,
}) => {
  const playerBasePercent = getBasePercent(state.playerBaseHp, state.playerBaseHpMax);
  const enemyBasePercent = getBasePercent(state.enemyBaseHp, state.enemyBaseHpMax);

  return (
    <div className="fantasy-lane-hud">
      <div className="fantasy-lane-hud-stats">
        <span className="fantasy-lane-hud-stat">
          <small>计时</small>
          <strong>{formatTimer(state.elapsedMs)}</strong>
        </span>
        <span className="fantasy-lane-hud-stat">
          <small>金币</small>
          <strong>{Math.round(state.gold)}</strong>
        </span>
        <span className="fantasy-lane-hud-stat">
          <small>人口</small>
          <strong>{state.activePop}/{state.popLimit}</strong>
        </span>
        <span className="fantasy-lane-hud-stat">
          <small>击倒</small>
          <strong>{state.stats.defeated}</strong>
        </span>
        <span className="fantasy-lane-hud-stat">
          <small>技能</small>
          <strong>{state.stats.heroSkillCast + state.stats.tacticalSkillCast}</strong>
        </span>
      </div>

      <div className="fantasy-lane-hud-bases">
        <div className="fantasy-lane-hud-base fantasy-lane-hud-base--player">
          <small>我方 {Math.round(state.playerBaseHp)}</small>
          <div className="fantasy-lane-hud-bar"><span style={{ width: `${playerBasePercent}%` }} /></div>
        </div>
        <div className="fantasy-lane-hud-frontline">
          <small>前线 {formatSigned(state.frontline)}</small>
          <span>空优{formatSigned(state.airControl)} · 拥堵{state.congestion}%</span>
        </div>
        <div className="fantasy-lane-hud-base fantasy-lane-hud-base--enemy">
          <small>敌方 {Math.round(state.enemyBaseHp)}</small>
          <div className="fantasy-lane-hud-bar fantasy-lane-hud-bar--enemy"><span style={{ width: `${enemyBasePercent}%` }} /></div>
        </div>
      </div>

      <div className="fantasy-lane-hud-queue">
        <small>队列 {state.queue.length}/{state.queueLimit}</small>
        <span>{state.queue.length > 0 ? state.queue.map((u, i) => `${i + 1}.${FANTASY_LANE_UNIT_MAP[u]?.shortName ?? u}`).join(' ') : '空'}</span>
      </div>

      <div className="fantasy-lane-hud-skills">
        <button type="button" className="fantasy-lane-hud-skill" onClick={onCastHero} disabled={state.phase !== 'playing' || state.heroSkill.remainingMs > 0}>
          <strong>Q</strong>
          <small>{state.heroSkill.remainingMs > 0 ? formatCooldown(state.heroSkill.remainingMs) : state.heroSkill.name}</small>
        </button>
        <button type="button" className="fantasy-lane-hud-skill" onClick={onCastTactical} disabled={state.phase !== 'playing' || state.tacticalSkill.remainingMs > 0}>
          <strong>W</strong>
          <small>{state.tacticalSkill.remainingMs > 0 ? formatCooldown(state.tacticalSkill.remainingMs) : state.tacticalSkill.name}</small>
        </button>
      </div>

      <div className="fantasy-lane-hud-actions">
        {onStart && state.phase === 'setup' && (
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--primary" onClick={onStart}>开始战斗</button>
        )}
        <button type="button" onClick={onTogglePause}>{state.phase === 'paused' ? '继续' : '暂停'}</button>
        <button type="button" onClick={onRestart}>重开</button>
        {onExitLevel && <button type="button" onClick={onExitLevel}>退出</button>}
      </div>
    </div>
  );
};
