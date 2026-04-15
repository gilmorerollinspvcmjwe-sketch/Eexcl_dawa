/* 祖玛HUD顶部信息栏组件。显示关卡信息、分数、连锁、球预览、危险等级和控制按钮。 */

import React from 'react';
import type { ZumaBoardState, ZumaBallColor, ZumaPowerupType } from '../../features/zuma/zumaTypes';
import { ZUMA_POWERUP_TYPES } from '../../features/zuma/zumaTypes';
import { getZumaObjectiveProgress } from '../../features/zuma/zumaBoardState.ts';

interface ZumaHudProps {
  state: ZumaBoardState;
  onTogglePause?: () => void;
  onToggleSpeed?: () => void;
  onRestart?: () => void;
  onBackToSetup?: () => void;
}

const BALL_COLOR_STYLES: Record<ZumaBallColor, string> = {
  red: 'zuma-ball--red',
  blue: 'zuma-ball--blue',
  green: 'zuma-ball--green',
  yellow: 'zuma-ball--yellow',
  purple: 'zuma-ball--purple',
  orange: 'zuma-ball--orange',
};

const POWERUP_LABELS: Record<ZumaPowerupType, string> = {
  burst: '爆裂',
  lightning: '闪电',
  slow: '减速',
  rewind: '倒退',
  wild: '万能',
};

const DANGER_LABELS = {
  safe: '安全',
  warning: '警告',
  critical: '危险',
};

function getBallStyle(color: ZumaBallColor | ZumaPowerupType): string {
  if (ZUMA_POWERUP_TYPES.includes(color as ZumaPowerupType)) {
    return 'zuma-ball--powerup';
  }
  return BALL_COLOR_STYLES[color as ZumaBallColor] || 'zuma-ball--unknown';
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getProgressPercent(state: ZumaBoardState): number {
  if (state.chains.length === 0) return 100;
  const track = state.trackDefinition;
  const maxHeadDistance = Math.max(...state.chains.map((chain) => chain.headDistance));
  const totalBallsSpawned = state.chains.reduce((sum, chain) => sum + chain.balls.length, 0);
  const estimatedTotalBalls = 100;
  const ballProgress = Math.max(0, Math.min(100, (totalBallsSpawned / estimatedTotalBalls) * 100));
  const distanceProgress = Math.max(0, Math.min(100, ((track.totalLength - maxHeadDistance) / track.totalLength) * 100));
  return Math.round(Math.min(ballProgress, distanceProgress));
}

export const ZumaHud: React.FC<ZumaHudProps> = ({ state, onTogglePause, onToggleSpeed, onRestart, onBackToSetup }) => {
  const modeLabel = state.mode === 'adventure'
    ? '神庙征途'
    : state.mode === 'timed'
      ? '计时冲分'
      : state.mode === 'challenge'
        ? '挑战试炼'
        : state.mode === 'endless'
          ? '无尽模式'
          : '练习模式';
  const levelLabel = `关卡 ${state.levelNumber}: ${state.levelTitle}`;
  const dangerLabel = DANGER_LABELS[state.dangerLevel];
  const progressPercent = getProgressPercent(state);
  const accuracyPercent = Math.round(state.score.accuracy * 100);
  const objectiveProgress = getZumaObjectiveProgress(state).slice(0, 3);

  const currentBallStyle = getBallStyle(state.cannon.currentBall);
  const nextBallStyle = getBallStyle(state.cannon.nextBall);
  const currentBallLabel = ZUMA_POWERUP_TYPES.includes(state.cannon.currentBall as ZumaPowerupType)
    ? POWERUP_LABELS[state.cannon.currentBall as ZumaPowerupType]
    : '';
  const nextBallLabel = ZUMA_POWERUP_TYPES.includes(state.cannon.nextBall as ZumaPowerupType)
    ? POWERUP_LABELS[state.cannon.nextBall as ZumaPowerupType]
    : '';

  return (
    <div className="zuma-hud">
      <section className="zuma-hud-bar zuma-hud-bar--overview">
        <div className="zuma-hud-identity">
          <span className="zuma-hud-label">关卡概览</span>
          <strong className="zuma-hud-title">{levelLabel}</strong>
        </div>
        <div className="zuma-hud-chips">
          <span className="zuma-hud-chip">{modeLabel}</span>
          <span className={`zuma-hud-chip zuma-hud-chip--danger danger-${state.dangerLevel}`}>
            {dangerLabel}
          </span>
          <span className={`zuma-hud-chip zuma-hud-chip--status status-${state.status}`}>
            {state.status === 'playing' ? '进行中' : state.status === 'won' ? '胜利' : '失败'}
          </span>
        </div>
      </section>

      <section className="zuma-hud-bar zuma-hud-bar--metrics">
        <div className="zuma-hud-metrics">
          <span className="zuma-hud-metric">
            <strong>分数</strong>
            {state.score.totalScore}
          </span>
          <span className="zuma-hud-metric">
            <strong>连锁</strong>
            {state.score.chainComboCount} 层
          </span>
          <span className="zuma-hud-metric">
            <strong>最高连锁</strong>
            {state.score.maxChainComboLevel} 层
          </span>
          <span className="zuma-hud-metric">
            <strong>命中率</strong>
            {accuracyPercent}%
          </span>
          <span className="zuma-hud-metric">
            <strong>用时</strong>
            {formatTime(state.elapsedMs)}
          </span>
          <span className="zuma-hud-metric">
            <strong>进度</strong>
            {progressPercent}%
          </span>
          {state.mode === 'endless' && (
            <span className="zuma-hud-metric">
              <strong>波段</strong>
              第 {state.currentWave} 波
            </span>
          )}
        </div>
      </section>

      <section className="zuma-hud-bar zuma-hud-bar--objectives">
        <div className="zuma-hud-objectives">
          {objectiveProgress.map((objective) => (
            <span
              key={`${objective.type}-${objective.targetValue}`}
              className={`zuma-hud-objective${objective.completed ? ' is-complete' : ''}${objective.failed ? ' is-failed' : ''}`}
            >
              {objective.text}
            </span>
          ))}
        </div>
      </section>

      <section className="zuma-hud-bar zuma-hud-bar--balls">
        <div className="zuma-hud-balls-preview">
          <span className="zuma-hud-label">当前球</span>
          <div className={`zuma-ball-preview ${currentBallStyle}`}>
            {currentBallLabel && <span className="zuma-ball-powerup-label">{currentBallLabel}</span>}
          </div>
        </div>
        <div className="zuma-hud-balls-preview">
          <span className="zuma-hud-label">下一球</span>
          <div className={`zuma-ball-preview ${nextBallStyle}`}>
            {nextBallLabel && <span className="zuma-ball-powerup-label">{nextBallLabel}</span>}
          </div>
        </div>
      </section>

      <section className="zuma-hud-bar zuma-hud-bar--controls">
        <div className="zuma-hud-controls">
          {onTogglePause && (
            <button
              type="button"
              className="zuma-hud-btn zuma-pause-btn"
              onClick={onTogglePause}
              aria-label={state.isPaused ? '恢复游戏' : '暂停游戏'}
              aria-pressed={state.isPaused}
              title={state.isPaused ? '恢复游戏' : '暂停游戏'}
            >
              {state.isPaused ? '▶️ 恢复' : '⏸️ 暂停'}
            </button>
          )}

          {onToggleSpeed && (
            <button
              type="button"
              className={`zuma-hud-btn zuma-speed-btn ${state.gameSpeed > 1 ? 'zuma-speed-btn--fast' : ''}`}
              onClick={onToggleSpeed}
              aria-label={`切换到 ${state.gameSpeed === 1 ? 2 : state.gameSpeed === 2 ? 3 : 1} 倍速`}
              aria-pressed={state.gameSpeed > 1}
              title={`当前 ${state.gameSpeed}x 速度`}
            >
              ⏩ {state.gameSpeed}x
            </button>
          )}

          {onRestart && (
            <button
              type="button"
              className="zuma-hud-btn zuma-restart-btn"
              onClick={onRestart}
              aria-label="重新开始本局"
              title="重新开始本局"
            >
              🔄 重开
            </button>
          )}

          {onBackToSetup && (
            <button
              type="button"
              className="zuma-hud-btn zuma-back-btn"
              onClick={onBackToSetup}
              aria-label="返回选关"
              title="返回选关"
            >
              ↩ 返回选关
            </button>
          )}
        </div>
      </section>

      {state.dangerLevel === 'critical' && (
        <div className="zuma-danger-alert">
          ⚠️ 球链接近终点线！
        </div>
      )}
    </div>
  );
};
