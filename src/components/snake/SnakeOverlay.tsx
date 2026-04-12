import React from 'react';
import { formatSnakeChainText, getCurrentSnakeTarget, getSnakeTargetProgressLabel } from '../../features/snake/snakeTextChain';
import { getSnakeDeathReasonText } from '../../features/snake/snakeSelectors';
import type { SnakeBoardState, SnakeRunResult } from '../../features/snake/snakeTypes';

interface SnakeOverlayProps {
  state: SnakeBoardState;
  onPauseToggle: () => void;
  onRestart: () => void;
  onExit?: () => void;
  lastRunResult: SnakeRunResult | null;
}

export const SnakeOverlay: React.FC<SnakeOverlayProps> = ({
  state,
  onPauseToggle,
  onRestart,
  onExit,
  lastRunResult,
}) => {
  if (state.status === 'playing' || state.status === 'idle') return null;

  if (state.status === 'paused') {
    return (
      <div className="snake-overlay">
        <div className="snake-overlay-card">
          <h3>已暂停</h3>
          <p>当前回合已暂停。</p>
          <div className="snake-overlay-actions">
            <button className="snake-btn" onClick={onPauseToggle}>
              继续
            </button>
            <button className="snake-btn" onClick={onRestart}>
              重开
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="snake-overlay">
      <div className="snake-overlay-card">
        <h3>
          {state.status === 'finished'
            ? getCurrentSnakeTarget(state) === null && state.targetPlan.length > 0
              ? '目标完成'
              : '时间结束'
            : '本局结束'}
        </h3>
        <p>{state.status === 'finished' && state.deathReason !== 'timeout' ? '本轮目标已经清空。' : getSnakeDeathReasonText(state.deathReason)}</p>
        <p>
          得分 <strong>{state.score}</strong> | 长度 <strong>{state.length}</strong>
        </p>
        <p>
          链条 <strong>{formatSnakeChainText(state.chainTokens)}</strong> | 任务 <strong>{getSnakeTargetProgressLabel(state)}</strong>
        </p>
        {lastRunResult ? (
          <p>
            {lastRunResult.isNewBestScore ? '新最高得分！ ' : ''}
            {lastRunResult.isNewBestLength ? '新最长长度！ ' : ''}
            累计 <strong>{lastRunResult.totalRuns}</strong> 局 | 最佳得分 <strong>{lastRunResult.bestScore}</strong> | 最佳长度 <strong>{lastRunResult.bestLength}</strong>
          </p>
        ) : null}
        <div className="snake-overlay-actions">
          <button className="snake-btn" onClick={onRestart}>
            再来一局
          </button>
          {onExit ? (
            <button className="snake-btn ghost" onClick={onExit}>
              返回主页
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
