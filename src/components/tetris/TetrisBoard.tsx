import React from 'react';
import { buildTetrisRenderGrid, getTetrisDangerTier } from '../../features/tetris/tetrisSelectors';
import type { TetrisBoardState } from '../../features/tetris/tetrisTypes';

interface TetrisBoardProps {
  state: TetrisBoardState;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({ state }) => {
  const grid = buildTetrisRenderGrid(state);
  const dangerTier = getTetrisDangerTier(state);
  const shellStyle =
    dangerTier === 'critical'
      ? { boxShadow: '0 0 0 2px #dc2626, 0 0 16px rgba(220, 38, 38, 0.35)' }
      : dangerTier === 'danger'
        ? { boxShadow: '0 0 0 2px #f97316, 0 0 12px rgba(249, 115, 22, 0.28)' }
        : dangerTier === 'caution'
          ? { boxShadow: '0 0 0 1px #ca8a04, 0 0 8px rgba(202, 138, 4, 0.2)' }
          : undefined;

  return (
    <div className="tetris-board-shell" style={shellStyle}>
      <div
        className="tetris-board"
        style={{
          gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${state.rows}, minmax(0, 1fr))`,
        }}
      >
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const classNames = ['tetris-cell'];
            if (cell.kind) classNames.push(`kind-${cell.kind}`);
            if (cell.active) classNames.push('active');
            if (cell.ghost) classNames.push('ghost');
            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={classNames.join(' ')}
                aria-label={cell.kind ? `block-${cell.kind}` : 'empty-cell'}
              />
            );
          }),
        )}
      </div>
    </div>
  );
};
