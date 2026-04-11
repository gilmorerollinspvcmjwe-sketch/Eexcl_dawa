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

function PerlerReferenceGrid({ workspace }: { workspace: PerlerWorkspaceState }) {
  return (
    <div className="perler-board-block">
      <div className="perler-board-title">模板样式</div>
      <div className="perler-grid reference" style={{ gridTemplateColumns: `repeat(${workspace.width}, minmax(18px, 1fr))` }}>
        {workspace.pixels.map((targetColor, index) => (
          <div
            key={`ref-${index}`}
            className="perler-cell reference-cell"
            style={{ background: targetColor }}
            title={`模板 ${targetColor}`}
          >
            <span className="perler-cell-bead" />
          </div>
        ))}
      </div>
    </div>
  );
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
    <div className="perler-workspace-shell guided-workspace">
      <PerlerReferenceGrid workspace={workspace} />

      <div className="perler-board-block">
        <div className="perler-board-title">玩家拼图区</div>
        <div className="perler-grid play-grid" style={{ gridTemplateColumns: `repeat(${workspace.width}, minmax(18px, 1fr))` }}>
          {workspace.pixels.map((targetColor, index) => {
            const row = Math.floor(index / workspace.width);
            const col = index % workspace.width;
            const userColor = workspace.userPixels[index];
            const selected = activeCell?.row === row && activeCell?.col === col;
            const isMismatch = !!userColor && userColor !== targetColor;
            const isCorrect = !!userColor && userColor === targetColor;

            return (
              <button
                key={`${row}-${col}`}
                className={`perler-cell ${selected ? 'selected' : ''} ${isMismatch ? 'mismatch' : ''} ${isCorrect ? 'correct' : ''}`}
                style={{ background: userColor || '#ffffff' }}
                onClick={() => onPaint(row, col)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onErase(row, col);
                }}
                onMouseEnter={() => onSelectCell({ row, col })}
                onFocus={() => onSelectCell({ row, col })}
                title={`模板 ${targetColor} / 当前 ${userColor || '空'}`}
              >
                <span className="perler-cell-bead" style={{ background: userColor || selectedColor }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
