import React from 'react';

interface PerlerFinalizeFlowProps {
  isOpen: boolean;
  title: string;
  onBackToLibrary: () => void;
  onClose: () => void;
}

export const PerlerFinalizeFlow: React.FC<PerlerFinalizeFlowProps> = ({
  isOpen,
  title,
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
          <p>作品已完成并收录到图鉴。本轮先提供图鉴收录与返回模板库，后续可扩展为首页贴纸和徽章用途。</p>
        </div>
        <div className="perler-side-actions">
          <button className="perler-inline-btn" onClick={onClose}>继续查看</button>
          <button className="perler-inline-btn primary" onClick={onBackToLibrary}>返回模板库</button>
        </div>
      </div>
    </div>
  );
};

