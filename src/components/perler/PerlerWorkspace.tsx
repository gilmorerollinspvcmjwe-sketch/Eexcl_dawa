import React from 'react';
import type { PerlerWorkspace as PerlerWorkspaceState } from '../../features/perler/perlerTypes';

interface PerlerWorkspaceProps {
  workspace: PerlerWorkspaceState;
  selectedColor: string;
  activeCell: { row: number; col: number } | null;
  onPaint: (row: number, col: number) => void;
  onErase: (row: number, col: number) => void;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
}

export const PerlerWorkspace: React.FC<PerlerWorkspaceProps> = ({
  workspace,
  selectedColor,
  activeCell,
  onPaint,
  onErase,
  onSelectCell,
}) => {
  return (
    <div className="perler-workspace-shell">
      <div
        className="perler-grid"
        style={{ gridTemplateColumns: `repeat(${workspace.width}, minmax(18px, 1fr))` }}
      >
        {workspace.pixels.map((targetColor, index) => {
          const row = Math.floor(index / workspace.width);
          const col = index % workspace.width;
          const userColor = workspace.userPixels[index];
          const selected = activeCell?.row === row && activeCell?.col === col;

          return (
            <button
              key={`${row}-${col}`}
              className={`perler-cell ${selected ? 'selected' : ''}`}
              style={{
                background: userColor || '#ffffff',
                boxShadow: userColor ? `inset 0 0 0 2px ${targetColor}` : 'none',
              }}
              onClick={() => onPaint(row, col)}
              onContextMenu={(event) => {
                event.preventDefault();
                onErase(row, col);
              }}
              onMouseEnter={() => onSelectCell({ row, col })}
              onFocus={() => onSelectCell({ row, col })}
              title={`目标 ${targetColor} / 当前 ${userColor || '空'}`}
            >
              <span className="perler-cell-dot" style={{ background: selectedColor }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

