import React, { useEffect, useRef } from 'react';

interface PerlerFinalizeFlowProps {
  isOpen: boolean;
  title: string;
  pixels: string[];
  width: number;
  onBackToLibrary: () => void;
  onClose: () => void;
}

function getPreviewCellSize(width: number): number {
  if (width <= 32) return 10;
  if (width <= 64) return 6;
  if (width <= 120) return 4;
  if (width <= 180) return 3;
  return 2;
}

export const PerlerFinalizeFlow: React.FC<PerlerFinalizeFlowProps> = ({
  isOpen,
  title,
  pixels,
  width,
  onBackToLibrary,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || pixels.length === 0) return;
    const cellSize = getPreviewCellSize(width);
    const height = Math.max(1, Math.ceil(pixels.length / width));
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixels.forEach((color, index) => {
      const row = Math.floor(index / width);
      const col = index % width;
      ctx.fillStyle = color;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    });
  }, [isOpen, pixels, width]);

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
          <canvas ref={canvasRef} className="perler-final-canvas" />
        </div>
        <div className="perler-side-actions">
          <button className="perler-inline-btn" onClick={onClose}>继续查看</button>
          <button className="perler-inline-btn primary" onClick={onBackToLibrary}>返回模板库</button>
        </div>
      </div>
    </div>
  );
};
