import React from 'react';
import { TETROMINO_DEFINITIONS } from '../../features/tetris/tetrisPieceRegistry';
import { getStateLabel } from '../../features/tetris/tetrisBoardState';
import {
  getTetrisDangerText,
  getTetrisDangerTier,
  getTetrisGoalHint,
  getTetrisModeGoalText,
  getTetrisModeLabel,
  getTetrisModeProgressText,
} from '../../features/tetris/tetrisSelectors';
import type { TetrisModuleStats } from '../../features/tetris/tetrisStorage';
import type { TetrisBoardState } from '../../features/tetris/tetrisTypes';

interface TetrisHudProps {
  state: TetrisBoardState;
  records: TetrisModuleStats;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const TetrisHud: React.FC<TetrisHudProps> = ({ state, records }) => {
  const visibleQueue = state.nextQueue.slice(0, 5);
  const sprintBestText = records.sprintBestMs === null ? '—' : formatDuration(records.sprintBestMs);
  const dangerTier = getTetrisDangerTier(state);
  const dangerColor =
    dangerTier === 'critical'
      ? '#dc2626'
      : dangerTier === 'danger'
        ? '#f97316'
        : dangerTier === 'caution'
          ? '#ca8a04'
          : '#16a34a';

  const goalHint = getTetrisGoalHint(state);

  return (
    <aside className="tetris-hud">
      <div className="tetris-hud-panel">
        <h4>本局目标</h4>
        <p>{getTetrisModeGoalText(state)}</p>
        {goalHint ? <p className="tetris-hud-goal-hint">{goalHint}</p> : null}
        <p>{getTetrisModeProgressText(state)}</p>
        {state.goalType === 'dig' ? (
          <div className="tetris-hud-kv">
            <span>底部清理</span>
            <strong>
              {state.digProgress}/{state.digRowsRequired}
            </strong>
          </div>
        ) : null}
        {state.goalType === 'puzzle' ? (
          <div className="tetris-hud-kv">
            <span>序列进度</span>
            <strong>
              {state.puzzleProgress}/{state.puzzleSequence.length}
            </strong>
          </div>
        ) : null}
      </div>

      <div className="tetris-hud-panel">
        <h4>局面概览</h4>
        <div className="tetris-hud-kv">
          <span>状态</span>
          <strong>{getStateLabel(state.status)}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>模式</span>
          <strong>{getTetrisModeLabel(state.mode)}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>时间</span>
          <strong>{formatDuration(state.elapsedMs)}</strong>
        </div>
        {state.remainingMs !== undefined ? (
          <div className="tetris-hud-kv">
            <span>剩余</span>
            <strong>{formatDuration(state.remainingMs)}</strong>
          </div>
        ) : null}
      </div>

      <div className="tetris-hud-panel">
        <h4>得分与风险</h4>
        <div className="tetris-hud-kv">
          <span>得分</span>
          <strong>{state.score.toLocaleString()}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>等级</span>
          <strong>{state.level}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>消行</span>
          <strong>{state.linesCleared}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>堆高风险</span>
          <strong style={{ color: dangerColor }}>{getTetrisDangerText(state)}</strong>
        </div>
      </div>

      <div className="tetris-hud-panel">
        <h4>暂存与队列</h4>
        <div className="tetris-hud-kv">
          <span>暂存</span>
          <strong>{state.holdPiece ? TETROMINO_DEFINITIONS[state.holdPiece].label : '空'}</strong>
        </div>
        <div className="tetris-hud-queue">
          <span>下一个</span>
          <ul className="tetris-next-list">
            {visibleQueue.map((kind, index) => (
              <li key={`${kind}-${index}`}>{TETROMINO_DEFINITIONS[kind].label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tetris-hud-panel">
        <h4>历史记录</h4>
        <div className="tetris-hud-kv">
          <span>最佳得分</span>
          <strong>{records.bestScore.toLocaleString()}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>最佳消行</span>
          <strong>{records.bestLines}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>最高等级</span>
          <strong>{records.maxLevelReached}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>Sprint 最快</span>
          <strong>{sprintBestText}</strong>
        </div>
        <div className="tetris-hud-kv">
          <span>Ultra 最高</span>
          <strong>{records.ultraBestScore.toLocaleString()}</strong>
        </div>
      </div>
    </aside>
  );
};
