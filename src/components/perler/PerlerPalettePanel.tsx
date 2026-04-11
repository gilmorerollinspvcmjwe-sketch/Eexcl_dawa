import React from 'react';
import type { PerlerPaletteEntry } from '../../features/perler/perlerTypes';

interface PerlerPalettePanelProps {
  palette: PerlerPaletteEntry[];
  selectedColor: string;
  completion: number;
  mismatchCount: number;
  templateTitle: string;
  onSelectColor: (color: string) => void;
  onImportClick: () => void;
  onBackToLibrary: () => void;
}

export const PerlerPalettePanel: React.FC<PerlerPalettePanelProps> = ({
  palette,
  selectedColor,
  completion,
  mismatchCount,
  templateTitle,
  onSelectColor,
  onImportClick,
  onBackToLibrary,
}) => {
  return (
    <aside className="perler-side-panel">
      <div className="perler-panel-title">当前模板</div>
      <div className="perler-meta-block">
        <div><strong>{templateTitle}</strong></div>
        <div>完成度：{completion}%</div>
        <div>错误格：{mismatchCount}</div>
      </div>

      <div className="perler-panel-title">图纸色板</div>
      <div className="perler-palette-list">
        {palette.map((entry) => (
          <button
            key={entry.code}
            className={`perler-palette-row ${selectedColor === entry.color ? 'selected' : ''}`}
            onClick={() => onSelectColor(entry.color)}
            title={`${entry.code} ${entry.color}`}
          >
            <span className="perler-color-chip" style={{ background: entry.color }} />
            <span className="perler-palette-code">{entry.code}</span>
            <span className="perler-palette-count">×{entry.count}</span>
          </button>
        ))}
      </div>

      <div className="perler-side-actions">
        <button className="perler-inline-btn" onClick={onImportClick}>导入图片</button>
        <button className="perler-inline-btn" onClick={onBackToLibrary}>返回模板库</button>
      </div>
    </aside>
  );
};
