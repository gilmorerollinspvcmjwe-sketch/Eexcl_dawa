import React from 'react';

interface PerlerFinalizeFlowProps {
  isOpen: boolean;
  title: string;
  pixels: string[];
  width: number;
  onBackToLibrary: () => void;
  onClose: () => void;
}

export const PerlerFinalizeFlow: React.FC<PerlerFinalizeFlowProps> = ({
  isOpen,
  title,
  pixels,
  width,
  onBackToLibrary,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="perler-modal-backdrop">
      <div className="perler-modal">
        <div className="perler-panel-title">热熔定型完成</div>
        <div className="perler-finalize-copy">
          <strong>{title}</strong>
          <p>作品已完成并收录到图鉴，下方就是最终成品样式。</p>
        </div>
        <div className="perler-final-preview">
          <div className="perler-grid reference mini" style={{ gridTemplateColumns: `repeat(${width}, minmax(12px, 1fr))` }}>
            {pixels.map((color, index) => (
              <div key={`final-${index}`} className="perler-cell reference-cell" style={{ background: color }}>
                <span className="perler-cell-bead" />
              </div>
            ))}
          </div>
        </div>
        <div className="perler-side-actions">
          <button className="perler-inline-btn" onClick={onClose}>继续查看</button>
          <button className="perler-inline-btn primary" onClick={onBackToLibrary}>返回模板库</button>
        </div>
      </div>
    </div>
  );
};
