import React from 'react';
import { formatSnakeChainText, getSnakeTargetProgressLabel } from '../../features/snake/snakeTextChain';
import { getSnakeModeLabel } from '../../features/snake/snakeSelectors';
import type { SnakeBoardState } from '../../features/snake/snakeTypes';

interface SnakeHudProps {
  state: SnakeBoardState;
  onStart: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onExit?: () => void;
}

export const SnakeHud: React.FC<SnakeHudProps> = ({
  state,
  onStart,
  onPauseToggle,
  onRestart,
  onExit,
}) => {
  const timerText =
    state.remainingMs === null
      ? `${Math.floor(state.elapsedMs / 1000)}秒`
      : `${Math.ceil(state.remainingMs / 1000)}秒`;

  return (
    <div className="snake-hud">
      <div className="snake-hud-stats">
        <div className="snake-hud-item">
          <span>得分</span>
          <strong>{state.score}</strong>
        </div>
        <div className="snake-hud-item">
          <span>长度</span>
          <strong>{state.length}</strong>
        </div>
        <div className="snake-hud-item">
          <span>模式</span>
          <strong>{getSnakeModeLabel(state.mode)}</strong>
        </div>
        <div className="snake-hud-item">
          <span>时间</span>
          <strong>{timerText}</strong>
        </div>
      <div className="snake-hud-item">
        <span>地图</span>
        <strong>{state.rows}×{state.cols}</strong>
      </div>
      <div className="snake-hud-item">
        <span>段落</span>
        <strong>
          {state.segmentCount > 0 ? `${Math.min(state.segmentIndex, state.segmentCount)}/${state.segmentCount}` : '—'}
        </strong>
      </div>
      <div className="snake-hud-item">
        <span>当前段</span>
        <strong>{state.activeSegments[state.segmentIndex] ?? '自由拼链'}</strong>
      </div>
      <div className="snake-hud-item">
        <span>审计波</span>
        <strong>
          {state.mode === 'challenge' ? `${Math.ceil(state.dynamicPressureTimerMs / 1000)}s` : '—'}
        </strong>
      </div>
      <div className="snake-hud-item wide">
        <span>当前链条</span>
        <strong>{formatSnakeChainText(state.chainTokens)}</strong>
      </div>
        <div className="snake-hud-item wide">
          <span>任务进度</span>
          <strong>{getSnakeTargetProgressLabel(state)}</strong>
        </div>
        <div className="snake-hud-item">
          <span>已完成</span>
          <strong>{state.completedTargets.length}</strong>
        </div>
        <div className="snake-hud-item">
          <span>压力</span>
          <strong>{state.pressureLevel}</strong>
        </div>
      </div>
      <div className="snake-hud-note">
        <p>先盯住“任务进度”和“当前段”，再看链条长度；挑战模式里审计波每 9 秒会继续加压。</p>
      </div>

      {state.lastEventText ? <div className={`snake-hud-event ${state.lastEventTone ?? 'info'}`}>{state.lastEventText}</div> : null}

      <div className="snake-hud-actions">
        <button className="snake-btn" onClick={onStart} disabled={state.status === 'playing'}>
          {state.status === 'paused' ? '继续' : '开始'}
        </button>
        <button className="snake-btn" onClick={onPauseToggle} disabled={state.status !== 'playing' && state.status !== 'paused'}>
          {state.status === 'paused' ? '恢复' : '暂停'}
        </button>
        <button className="snake-btn" onClick={onRestart}>
          重开
        </button>
        {onExit ? (
          <button className="snake-btn ghost" onClick={onExit}>
            返回
          </button>
        ) : null}
      </div>
    </div>
  );
};
