/* 三消HUD信息栏组件。显示模式、关卡名、目标摘要、剩余步数/时间、分数、连锁段数、特殊块任务进度、障碍威胁和控制按钮。 */

import React from 'react';
import type { Match3BoardState, Match3Goal, Match3Color, Match3ObstacleType, Match3ModeId } from '../../features/match3/match3Types';

interface Match3HudProps {
  state: Match3BoardState;
  levelName?: string;
  modeId?: Match3ModeId;
  modeName?: string;
  packName?: string;
  onTogglePause?: () => void;
  onToggleSpeed?: () => void;
  onRestart?: () => void;
  onToggleSound?: () => void;
  isPaused?: boolean;
  gameSpeed?: number;
  soundEnabled?: boolean;
}

const COLOR_LABELS: Record<Match3Color, string> = {
  red: '红',
  orange: '橙',
  yellow: '黄',
  green: '绿',
  blue: '蓝',
  purple: '紫',
};

const OBSTACLE_LABELS: Record<Match3ObstacleType, string> = {
  frost1: '单层冰冻',
  frost2: '双层冰冻',
  chain: '锁链',
  box: '木箱',
  stone: '石块',
  portalIn: '传送入口',
  portalOut: '传送出口',
  spreader: '蔓延块',
};

const COMBO_LABELS = {
  'striped-striped': '条纹+条纹',
  'striped-wrapped': '条纹+包装',
  'wrapped-wrapped': '包装+包装',
  'colorBomb-special': '彩球+特殊块',
  'colorBomb-colorBomb': '双彩球',
} as const;

function getGoalLabel(goal: Match3Goal): string {
  switch (goal.type) {
    case 'score':
      return `分数 ${goal.current}/${goal.target}`;
    case 'collectColor':
      return `${COLOR_LABELS[goal.colorTarget ?? 'red']}色 ${goal.current}/${goal.target}`;
    case 'clearOverlay':
      return `清覆盖 ${goal.current}/${goal.target}`;
    case 'dropCollect':
      return `${goal.dropItemType === 'stamp' ? '送印章' : goal.dropItemType === 'formulaChip' ? '送芯片' : '送文件'} ${goal.current}/${goal.target}`;
    case 'clearObstacle':
      return `${OBSTACLE_LABELS[goal.obstacleTarget ?? 'frost1']} ${goal.current}/${goal.target}`;
    case 'triggerCombo':
      return `${goal.comboTarget ? COMBO_LABELS[goal.comboTarget] : '组合'} ${goal.current}/${goal.target}`;
    default:
      return `目标 ${goal.current}/${goal.target}`;
  }
}

function getGoalIcon(goal: Match3Goal): string {
  switch (goal.type) {
    case 'score':
      return '⭐';
    case 'collectColor':
      return '🎨';
    case 'clearOverlay':
      return '🧊';
    case 'dropCollect':
      return '⬇️';
    case 'clearObstacle':
      return '💥';
    case 'triggerCombo':
      return '🧩';
    default:
      return '🎯';
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const Match3Hud: React.FC<Match3HudProps> = ({
  state,
  levelName,
  modeId = 'adventure',
  modeName,
  packName,
  onTogglePause,
  onToggleSpeed,
  onRestart,
  onToggleSound,
  isPaused = false,
  gameSpeed = 1,
  soundEnabled = true,
}) => {
  const phaseLabel = state.phase === 'setup' ? '准备' : state.phase === 'playing' ? '进行中' : state.phase === 'resolving' ? '结算中' : state.phase === 'won' ? '胜利' : '失败';
  const movesLabel = state.maxMoves !== null ? `还剩 ${state.moves} 步` : '不限步数';
  const timeLabel = state.maxTimeMs !== null && state.timeMs !== null ? `还剩 ${formatTime(state.timeMs)}` : null;
  const comboLabel = state.comboLevel > 0 ? `连锁 ${state.comboLevel + 1}段 (${state.comboMultiplier.toFixed(2)}x)` : null;
  const spreaderWarning = state.spreaderActive && state.spreaderPositions.length > 0 ? `蔓延威胁 ${state.spreaderPositions.length}处` : null;

  const completedGoals = state.goals.filter((g) => g.current >= g.target).length;
  const totalGoals = state.goals.length;
  const primaryLimitLabel = state.maxMoves !== null ? '剩余步数' : '剩余时间';
  const primaryLimitValue = state.maxMoves !== null ? `${state.moves}` : formatTime(state.timeMs ?? 0);
  const primaryLimitHint = state.maxMoves !== null ? (state.moves <= 5 ? '已经进入收尾步数，优先完成主目标' : '还可以继续组织关键交换') : ((state.timeMs ?? 0) <= 30000 ? '时间进入冲刺段，先打高收益消除' : '节奏还算充裕，先做目标线');
  const isPrimaryLimitCritical = state.maxMoves !== null ? state.moves <= 5 : (state.timeMs ?? 0) <= 30000;
  const heroScoreLabel = state.maxMoves !== null ? '当前分数' : '冲分表现';
  const visibleGoals = [...state.goals].sort((a, b) => Number(a.current >= a.target) - Number(b.current >= b.target)).slice(0, 3);

  return (
    <div className="match3-hud">
      <section className="match3-hud-bar match3-hud-bar--overview">
        <div className="match3-hud-overview-main">
          <div className="match3-hud-identity">
            <span className="match3-hud-label">关卡概览</span>
            <strong className="match3-hud-title">{levelName ?? '三消关卡'}</strong>
          </div>
          <div className="match3-hud-chips">
            <span className="match3-hud-chip">{packName ?? '关卡包'}</span>
            <span className="match3-hud-chip">{modeName ?? (modeId === 'blitz' ? 'Blitz' : modeId === 'puzzle' ? 'Puzzle' : 'Adventure')}</span>
            <span className={`match3-hud-chip match3-hud-chip--status status-${state.phase}`}>
              {phaseLabel}
            </span>
          </div>
        </div>
        <div className="match3-hud-primary">
          <article className="match3-hud-hero-card match3-hud-hero-card--goal">
            <span className="match3-hud-hero-label">目标推进</span>
            <strong className="match3-hud-hero-value">{completedGoals}/{totalGoals}</strong>
            <span className="match3-hud-hero-caption">优先把未完成目标逐条清掉</span>
          </article>
          <article className={`match3-hud-hero-card match3-hud-hero-card--resource${isPrimaryLimitCritical ? ' is-critical' : ''}`}>
            <span className="match3-hud-hero-label">{primaryLimitLabel}</span>
            <strong className="match3-hud-hero-value">{primaryLimitValue}</strong>
            <span className="match3-hud-hero-caption">{primaryLimitHint}</span>
          </article>
          <article className="match3-hud-hero-card match3-hud-hero-card--score">
            <span className="match3-hud-hero-label">{heroScoreLabel}</span>
            <strong className="match3-hud-hero-value">{state.score}</strong>
            <span className="match3-hud-hero-caption">{comboLabel ?? '稳定消除也会持续抬高分数'}</span>
          </article>
        </div>
        <div className="match3-hud-summary">
          {visibleGoals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));
            return (
              <div key={index} className={`match3-goal-item ${goal.current >= goal.target ? 'match3-goal-item--completed' : ''}`}>
                <div className="match3-goal-item-copy">
                  <span className="match3-goal-icon">{getGoalIcon(goal)}</span>
                  <div className="match3-goal-item-text">
                    <strong>{getGoalLabel(goal)}</strong>
                    <span>{goal.current >= goal.target ? '已达成，可以转下一个目标' : `${progress}% 完成`}</span>
                  </div>
                </div>
                <div className="match3-goal-progress-bar" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="match3-hud-bar match3-hud-bar--controls">
        <div className="match3-hud-controls-head">
          <span className="match3-hud-label">操作区</span>
          <strong className="match3-hud-title">游戏控制</strong>
        </div>
        <div className="match3-hud-controls">
          {onTogglePause && (
            <button
              type="button"
              className="match3-hud-btn"
              onClick={onTogglePause}
              aria-label={isPaused ? '恢复游戏' : '暂停游戏'}
              aria-pressed={isPaused}
              title={isPaused ? '恢复游戏' : '暂停游戏'}
            >
              {isPaused ? '▶️ 恢复' : '⏸️ 暂停'}
            </button>
          )}

          {onToggleSpeed && (
            <button
              type="button"
              className={`match3-hud-btn ${gameSpeed === 2 ? 'match3-hud-btn--fast' : ''}`}
              onClick={onToggleSpeed}
              aria-label={gameSpeed === 1 ? '切换到 2 倍速' : '切换到 1 倍速'}
              aria-pressed={gameSpeed === 2}
              title={gameSpeed === 1 ? '加速动画' : '正常速度'}
            >
              {gameSpeed === 1 ? '⏩ 加速' : '⏩ 2x'}
            </button>
          )}

          {onRestart && (
            <button
              type="button"
              className="match3-hud-btn"
              onClick={onRestart}
              aria-label="重新开始"
              title="重新开始本局"
            >
              🔄 重开
            </button>
          )}

          {onToggleSound && (
            <button
              type="button"
              className="match3-hud-btn"
              onClick={onToggleSound}
              aria-label={soundEnabled ? '关闭音效' : '开启音效'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? '关闭音效' : '开启音效'}
            >
              {soundEnabled ? '🔊 音效' : '🔇 静音'}
            </button>
          )}
        </div>
      </section>

      <section className="match3-hud-bar match3-hud-bar--metrics">
        <div className="match3-hud-metrics">
          <span className="match3-hud-metric"><strong>局面</strong>{movesLabel}</span>
          {timeLabel && <span className="match3-hud-metric"><strong>时间</strong>{timeLabel}</span>}
          {comboLabel && (
            <span className={`match3-combo-indicator ${state.comboLevel > 0 ? 'match3-combo-indicator--active' : ''}`}>
              🔥 {comboLabel}
            </span>
          )}
          <span className="match3-hud-metric"><strong>最高连锁</strong>{state.maxComboReached + 1}段</span>
          <span className="match3-hud-metric"><strong>目标线</strong>{completedGoals}/{totalGoals}</span>
          {spreaderWarning && (
            <span className="match3-threat-warning">
              ⚠️ {spreaderWarning}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
