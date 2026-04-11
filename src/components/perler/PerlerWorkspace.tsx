import React, { useEffect, useMemo, useRef } from 'react';
import type { PerlerWorkspace as PerlerWorkspaceState } from '../../features/perler/perlerTypes';
import { getCanvasCellSize } from '../../features/perler/perlerCanvasUtils.ts';

interface PerlerWorkspaceProps {
  workspace: PerlerWorkspaceState;
  selectedColor: string;
  activeCell: { row: number; col: number } | null;
  zoom: number;
  onPaint: (row: number, col: number) => void;
  onErase: (row: number, col: number) => void;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
  onZoomChange: (zoom: number) => void;
}

function drawBeadCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  border: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  const inset = Math.max(1, Math.floor(size * 0.18));
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, Math.max(1, size / 2 - inset), 0, Math.PI * 2);
  ctx.fill();
}

function paintTemplateCanvas(canvas: HTMLCanvasElement, workspace: PerlerWorkspaceState, cellSize: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = workspace.width * cellSize;
  canvas.height = workspace.height * cellSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  workspace.pattern.previewPixels.forEach((color, index) => {
    const row = Math.floor(index / workspace.width);
    const col = index % workspace.width;
    drawBeadCell(ctx, col * cellSize, row * cellSize, cellSize, color, '#cbd5e1');
  });
}

function paintPlayerCanvas(
  canvas: HTMLCanvasElement,
  workspace: PerlerWorkspaceState,
  activeCell: { row: number; col: number } | null,
  cellSize: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = workspace.width * cellSize;
  canvas.height = workspace.height * cellSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  workspace.pattern.previewPixels.forEach((targetColor, index) => {
    const row = Math.floor(index / workspace.width);
    const col = index % workspace.width;
    const userColor = workspace.userPixels[index] || '#ffffff';
    const isMismatch = !!workspace.userPixels[index] && workspace.userPixels[index] !== targetColor;
    const isCorrect = !!workspace.userPixels[index] && workspace.userPixels[index] === targetColor;
    const border = isMismatch ? '#dc2626' : isCorrect ? '#16a34a' : '#d4d4d4';

    drawBeadCell(ctx, col * cellSize, row * cellSize, cellSize, userColor, border);

    if (isMismatch) {
      ctx.strokeStyle = 'rgba(220,38,38,0.75)';
      ctx.lineWidth = Math.max(1, cellSize / 6);
      ctx.beginPath();
      ctx.moveTo(col * cellSize + 2, row * cellSize + 2);
      ctx.lineTo((col + 1) * cellSize - 2, (row + 1) * cellSize - 2);
      ctx.moveTo((col + 1) * cellSize - 2, row * cellSize + 2);
      ctx.lineTo(col * cellSize + 2, (row + 1) * cellSize - 2);
      ctx.stroke();
    }
  });

  if (activeCell) {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = Math.max(1, cellSize / 5);
    ctx.strokeRect(activeCell.col * cellSize + 1, activeCell.row * cellSize + 1, cellSize - 2, cellSize - 2);
  }
}

export const PerlerWorkspace: React.FC<PerlerWorkspaceProps> = ({
  workspace,
  activeCell,
  zoom,
  onPaint,
  onErase,
  onSelectCell,
  onZoomChange,
}) => {
  const referenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellSize = useMemo(() => getCanvasCellSize(workspace.width), [workspace.width]);
  const scaledWidth = workspace.width * cellSize * zoom;
  const scaledHeight = workspace.height * cellSize * zoom;

  useEffect(() => {
    if (referenceCanvasRef.current) {
      paintTemplateCanvas(referenceCanvasRef.current, workspace, cellSize);
    }
  }, [workspace, cellSize]);

  useEffect(() => {
    if (playerCanvasRef.current) {
      paintPlayerCanvas(playerCanvasRef.current, workspace, activeCell, cellSize);
    }
  }, [workspace, activeCell, cellSize]);

  const handlePointer = (
    event: React.MouseEvent<HTMLCanvasElement>,
    action: 'paint' | 'erase' | 'hover',
  ) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const col = Math.max(0, Math.min(workspace.width - 1, Math.floor(((event.clientX - rect.left) / rect.width) * workspace.width)));
    const row = Math.max(0, Math.min(workspace.height - 1, Math.floor(((event.clientY - rect.top) / rect.height) * workspace.height)));

    onSelectCell({ row, col });
    if (action === 'paint') onPaint(row, col);
    if (action === 'erase') onErase(row, col);
  };

  return (
    <div className="perler-workspace-shell guided-workspace canvas-workspace">
      <div className="perler-workspace-toolbar">
        <span>尺寸：{workspace.width}×{workspace.height}</span>
        <label>
          缩放
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.25}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
          <strong>{Math.round(zoom * 100)}%</strong>
        </label>
      </div>

      <div className="perler-board-block">
        <div className="perler-board-title">模板样式</div>
        <div className="perler-canvas-shell">
          <canvas ref={referenceCanvasRef} className="perler-canvas-board" style={{ width: scaledWidth, height: scaledHeight }} />
        </div>
      </div>

      <div className="perler-board-block">
        <div className="perler-board-title">玩家拼图区</div>
        <div className="perler-canvas-shell">
          <canvas
            ref={playerCanvasRef}
            className="perler-canvas-board"
            style={{ width: scaledWidth, height: scaledHeight }}
            onClick={(event) => handlePointer(event, 'paint')}
            onMouseMove={(event) => handlePointer(event, 'hover')}
            onContextMenu={(event) => {
              event.preventDefault();
              handlePointer(event, 'erase');
            }}
            onMouseLeave={() => onSelectCell(null)}
          />
        </div>
      </div>
    </div>
  );
};
