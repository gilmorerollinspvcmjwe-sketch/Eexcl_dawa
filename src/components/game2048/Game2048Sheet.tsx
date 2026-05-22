/* 2048 单 Sheet 组件：负责经典 4x4 棋盘、键盘操作、结算层和 Excel 风格外壳。 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  continueGame2048,
  createGame2048BoardState,
  moveGame2048Board,
  type Game2048BoardState,
} from '../../features/game2048/game2048BoardState.ts';
import {
  readGame2048Record,
  writeGame2048Record,
} from '../../features/game2048/game2048Storage.ts';
import type { WorkbookStatusSummary } from '../../types/workbook.ts';
import '../../styles/game2048.css';

interface Game2048SheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

function getTileClass(value: number): string {
  return `game2048-tile game2048-tile--${Math.min(value, 2048)}`;
}

function cloneState(state: Game2048BoardState): Game2048BoardState {
  return {
    ...state,
    grid: state.grid.map((row) => row.map((cell) => (cell ? { ...cell } : null))),
  };
}

// 生成公式栏文案。
function getFormulaText(state: Game2048BoardState): string {
  const status = state.status === 'won' ? '已达成 2048' : state.status === 'lost' ? '已无可用合并' : '聚合进行中';
  return `=2048 | ${status} | 分数 ${state.score} | 最大块 ${state.maxTile}`;
}

export const Game2048Sheet: React.FC<Game2048SheetProps> = ({
  onFormulaChange,
  onStatusChange,
  onExit,
  initialSnapshot,
  onSnapshotChange,
}) => {
  const snapshot = initialSnapshot as { state?: Game2048BoardState } | null;
  const [record, setRecord] = useState(() => readGame2048Record(globalThis.localStorage));
  const [state, setState] = useState<Game2048BoardState>(() => snapshot?.state ? cloneState(snapshot.state) : { ...createGame2048BoardState(), status: 'playing' });

  const bestScore = Math.max(record.stats.bestScore, state.bestScore);
  const maxTile = Math.max(record.stats.bestTile, state.maxTile);
  const overlayTitle = state.status === 'won' ? '达成 2048' : state.status === 'lost' ? '本局结束' : '';

  useEffect(() => {
    onFormulaChange?.(getFormulaText(state));
    onStatusChange?.({
      isPlaying: state.status === 'playing' || state.status === 'idle',
      primaryText: state.status === 'won' ? '已达成 2048' : state.status === 'lost' ? '无可用合并' : '数据聚合中',
      score: state.score,
      secondaryMetric: `最大块 ${state.maxTile}`,
      tertiaryMetric: `步数 ${state.moves}`,
      mode: '2048 / 经典',
      alertTone: state.status === 'lost' ? 'danger' : state.status === 'won' ? 'success' : 'neutral',
    });
  }, [onFormulaChange, onStatusChange, state]);

  useEffect(() => {
    onSnapshotChange?.({ state });
  }, [onSnapshotChange, state]);

  useEffect(() => {
    setRecord((current) => {
      const nextBestScore = Math.max(current.stats.bestScore, state.score);
      const nextBestTile = Math.max(current.stats.bestTile, state.maxTile);
      const nextActiveRun = state.status === 'lost' ? null : { state };
      const currentActiveRunState =
        current.activeRun && typeof current.activeRun === 'object'
          ? (current.activeRun as { state?: Game2048BoardState }).state
          : undefined;
      const hasChanges =
        current.stats.bestScore !== nextBestScore ||
        current.stats.bestTile !== nextBestTile ||
        (state.status === 'lost' ? current.activeRun !== null : currentActiveRunState !== state);

      if (!hasChanges) {
        return current;
      }

      const nextRecord = {
        ...current,
        stats: {
          bestScore: nextBestScore,
          bestTile: nextBestTile,
          totalRuns: current.stats.totalRuns,
          totalWins: current.stats.totalWins,
        },
        activeRun: nextActiveRun,
      };
      writeGame2048Record(globalThis.localStorage, nextRecord);
      return nextRecord;
    });
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };

      if (event.key in keyMap) {
        event.preventDefault();
        setState((current) => moveGame2048Board(current, keyMap[event.key]!, Math.random));
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && state.status === 'won') {
        event.preventDefault();
        setState((current) => continueGame2048(current));
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setState(createGame2048BoardState());
        return;
      }

      if (event.key === 'Escape') {
        onExit?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, state.status]);

  const boardRows = useMemo(() => state.grid.map((row, rowIndex) => (
    <div key={`row-${rowIndex}`} className="game2048-grid-row">
      {row.map((cell, colIndex) => (
        <div key={`cell-${rowIndex}-${colIndex}`} className="game2048-cell">
          {cell ? <div className={getTileClass(cell.value)}>{cell.value}</div> : null}
        </div>
      ))}
    </div>
  )), [state.grid]);

  return (
    <div className="game2048-sheet">
      <section className="game2048-hud">
        <div className="game2048-stat-card">
          <span className="game2048-stat-label">当前分数</span>
          <strong>{state.score}</strong>
        </div>
        <div className="game2048-stat-card">
          <span className="game2048-stat-label">历史最高</span>
          <strong>{bestScore}</strong>
        </div>
        <div className="game2048-stat-card">
          <span className="game2048-stat-label">最大块</span>
          <strong>{maxTile}</strong>
        </div>
        <div className="game2048-stat-card">
          <span className="game2048-stat-label">目标</span>
          <strong>2048</strong>
        </div>
      </section>

      <section className="game2048-main">
        <div className="game2048-title-block">
          <h2>2048</h2>
          <p>经典 4×4</p>
        </div>
        <div className="game2048-board-shell">
          <div className="game2048-grid">{boardRows}</div>
          {state.status === 'won' || state.status === 'lost' ? (
            <div className="game2048-overlay">
              <div className="game2048-overlay-card">
                <h3>{overlayTitle}</h3>
                <p>{state.status === 'won' ? '可继续挑战更高数字。' : '棋盘已无可用合并。'}</p>
                <div className="game2048-overlay-actions">
                  {state.status === 'won' ? (
                    <button type="button" onClick={() => setState((current) => continueGame2048(current))}>继续</button>
                  ) : null}
                  <button type="button" onClick={() => setState(createGame2048BoardState())}>新游戏</button>
                  {onExit ? <button type="button" onClick={onExit}>返回</button> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="game2048-toolbar">
        <button type="button" onClick={() => setState(createGame2048BoardState())}>新游戏</button>
        {state.status === 'won' ? <button type="button" onClick={() => setState((current) => continueGame2048(current))}>继续</button> : null}
        {onExit ? <button type="button" onClick={onExit}>返回</button> : null}
        <span className="game2048-help">方向键 / WASD 操作</span>
      </div>
    </div>
  );
};
