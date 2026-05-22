import React from 'react';
import { getTetrisModeLabel } from '../../features/tetris/tetrisSelectors';
import type { TetrisRunRecordUpdate } from '../../features/tetris/tetrisStorage';
import type { TetrominoKind, TetrisGoalType, TetrisMode, TetrisStatus } from '../../features/tetris/tetrisTypes';

interface TetrisOverlayProps {
  status: TetrisStatus;
  mode: TetrisMode;
  goalType: TetrisGoalType;
  sprintTargetLines: number;
  ultraDurationMs: number;
  targetLevel: number | null;
  digRowsRequired: number;
  digRegionHeight: number;
  puzzleSequence: TetrominoKind[];
  presetTitle: string;
  score: number;
  linesCleared: number;
  elapsedMs: number;
  runUpdate: TetrisRunRecordUpdate | null;
  onResume: () => void;
  onRestart: () => void;
  onExit?: () => void;
}

function getCopy(
  status: TetrisStatus,
  goalType: TetrisGoalType,
  sprintTargetLines: number,
  ultraDurationMs: number,
  targetLevel: number | null,
  digRowsRequired: number,
  digRegionHeight: number,
  puzzleSequence: TetrominoKind[],
): { title: string; subtitle: string } | null {
  if (status === 'idle') {
    if (goalType === 'sprint_lines') {
      return {
        title: `准备开始 ${sprintTargetLines} 行竞速`,
        subtitle: `目标是尽快完成 ${sprintTargetLines} 行，按 Enter 或点击开始进入计时`,
      };
    }
    if (goalType === 'score_attack') {
      return {
        title: `准备开始 ${Math.floor(ultraDurationMs / 1000)} 秒冲分`,
        subtitle: `目标是在 ${Math.floor(ultraDurationMs / 1000)} 秒内尽量提高得分，清行效率越高越好`,
      };
    }
    if (goalType === 'level_target' && targetLevel !== null) {
      return {
        title: `准备开始等级挑战 ${targetLevel}`,
        subtitle: `目标是稳定整理到 ${targetLevel} 级，不靠花哨机制，只看基本功`,
      };
    }
    if (goalType === 'dig') {
      const regionLabel = digRegionHeight > 0 ? `底部 ${digRegionHeight} 行区域` : '底部区域';
      return {
        title: '准备开始深掘清理',
        subtitle: `在 ${regionLabel} 中完成 ${digRowsRequired} 次清理，保持地形低位提高效率`,
      };
    }
    if (goalType === 'puzzle') {
      const sequenceLabel = puzzleSequence.length > 0 ? puzzleSequence.join(' → ') : '待设定序列';
      return {
        title: '准备开始序列解谜',
        subtitle: `依次放置 ${sequenceLabel}，每个块必须锁定以维持顺序`,
      };
    }
    return {
      title: '准备整理数据块',
      subtitle: '方向键移动，空格硬降，Z/X 旋转，C 暂存',
    };
  }
  if (status === 'paused') {
    return {
      title: '流程已暂停',
      subtitle: '按 P 或点击继续恢复处理',
    };
  }
  if (status === 'dead') {
    return {
      title: '表格溢出',
      subtitle: '待处理块堆到顶部，建议立即重开',
    };
  }
  if (status === 'finished') {
    if (goalType === 'sprint_lines') {
      return {
        title: `${sprintTargetLines} 行竞速完成`,
        subtitle: '本轮已达成目标行数，可继续刷新最快用时',
      };
    }
    if (goalType === 'score_attack') {
      return {
        title: `${Math.floor(ultraDurationMs / 1000)} 秒冲分结束`,
        subtitle: '计时已结束，可继续刷新 Ultra 最高得分',
      };
    }
    if (goalType === 'level_target' && targetLevel !== null) {
      return {
        title: `等级挑战 ${targetLevel} 完成`,
        subtitle: '本轮已达到目标等级，可以继续提高稳定性与速度',
      };
    }
    if (goalType === 'dig') {
      return {
        title: '深掘清理完成',
        subtitle: `完成 ${digRowsRequired} 次目标清理，可以继续挑战更深区域`,
      };
    }
    if (goalType === 'puzzle') {
      const sequenceLabel = puzzleSequence.length > 0 ? puzzleSequence.join(' → ') : '待设定序列';
      return {
        title: '序列解谜完成',
        subtitle: `已完成 ${sequenceLabel} 序列，可以再尝试更高难度的排列`,
      };
    }
    return {
      title: '目标已完成',
      subtitle: '本轮已结束，继续下一轮挑战',
    };
  }
  return null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildRecordText(runUpdate: TetrisRunRecordUpdate | null): string | null {
  if (!runUpdate) return null;
  const tags: string[] = [];
  if (runUpdate.isBestScore) tags.push('最佳得分');
  if (runUpdate.isBestLines) tags.push('最佳消行');
  if (runUpdate.isBestLevel) tags.push('最高等级');
  if (runUpdate.isBestSprint) tags.push('Sprint 最快');
  if (runUpdate.isBestUltra) tags.push('Ultra 最高');
  if (tags.length === 0) return null;
  return `新纪录：${tags.join('、')}`;
}

function buildHistoryText(runUpdate: TetrisRunRecordUpdate | null): string | null {
  if (!runUpdate) return null;
  const stats = runUpdate.nextRecord.stats;
  const sprintText = stats.sprintBestMs === null ? '—' : formatDuration(stats.sprintBestMs);
  return `历史最佳：得分 ${stats.bestScore.toLocaleString()} | 消行 ${stats.bestLines} | 等级 ${stats.maxLevelReached} | Sprint ${sprintText} | Ultra ${stats.ultraBestScore.toLocaleString()}`;
}

export const TetrisOverlay: React.FC<TetrisOverlayProps> = ({
  status,
  mode,
  goalType,
  sprintTargetLines,
  ultraDurationMs,
  targetLevel,
  digRowsRequired,
  digRegionHeight,
  puzzleSequence,
  presetTitle,
  score,
  linesCleared,
  elapsedMs,
  runUpdate,
  onResume,
  onRestart,
  onExit,
}) => {
  if (status === 'idle') return null;

  const copy = getCopy(
    status,
    goalType,
    sprintTargetLines,
    ultraDurationMs,
    targetLevel,
    digRowsRequired,
    digRegionHeight,
    puzzleSequence,
  );
  if (!copy) return null;
  const recordText = buildRecordText(runUpdate);
  const historyText = buildHistoryText(runUpdate);

  return (
    <div className="tetris-overlay">
      <div className="tetris-overlay-card">
        <h3>{copy.title}</h3>
        <p>当前配置：{presetTitle}</p>
        <p>{copy.subtitle}</p>
        {(status === 'dead' || status === 'finished') && (
          <p>
            模式 {getTetrisModeLabel(mode)} | 得分 {score.toLocaleString()} | 消行 {linesCleared} | 用时 {formatDuration(elapsedMs)}
          </p>
        )}
        {(status === 'dead' || status === 'finished') && recordText && <p>{recordText}</p>}
        {(status === 'dead' || status === 'finished') && historyText && <p>{historyText}</p>}
        <div className="tetris-overlay-actions">
          {status === 'paused' ? (
            <button onClick={onResume}>继续</button>
          ) : (
            <button onClick={onRestart}>再来一局</button>
          )}
          <button onClick={onRestart}>重开</button>
          {onExit ? <button onClick={onExit}>返回</button> : null}
        </div>
      </div>
    </div>
  );
};
