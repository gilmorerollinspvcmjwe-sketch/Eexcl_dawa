import React from 'react';

interface PerlerPalettePanelProps {
  palette: string[];
  selectedColor: string;
  completion: number;
  templateTitle: string;
  onSelectColor: (color: string) => void;
  onImportClick: () => void;
  onBackToLibrary: () => void;
}

export const PerlerPalettePanel: React.FC<PerlerPalettePanelProps> = ({
  palette,
  selectedColor,
  completion,
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
      </div>

      <div className="perler-panel-title">颜色表</div>
      <div className="perler-palette-grid">
        {palette.map((color) => (
          <button
            key={color}
            className={`perler-color-chip ${selectedColor === color ? 'selected' : ''}`}
            style={{ background: color }}
            onClick={() => onSelectColor(color)}
            title={color}
          />
        ))}
      </div>

      <div className="perler-side-actions">
        <button className="perler-inline-btn" onClick={onImportClick}>导入图片</button>
        <button className="perler-inline-btn" onClick={onBackToLibrary}>返回模板库</button>
      </div>
    </aside>
  );
};

