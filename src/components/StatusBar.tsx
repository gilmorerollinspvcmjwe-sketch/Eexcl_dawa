import React from 'react';

interface StatusBarProps {
  selectedCell: { row: number; col: number } | null;
  isHidden: boolean;
  COLS: number;
  gameState?: {
    isPlaying: boolean;
    score: number;
    combo: number;
    mode: string;
  };
}

export const StatusBar: React.FC<StatusBarProps> = ({ selectedCell, isHidden, COLS, gameState }) => {
  if (isHidden) return null;

  const colLetters = Array.from({ length: COLS }, (_, i) => {
    let result = '';
    let n = i + 2;
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  });

  const cellAddress = selectedCell
    ? `${colLetters[selectedCell.col - 2]}${selectedCell.row}`
    : '';

  return (
    <div className="excel-statusbar">
      <div className="excel-statusbar-left">
        <span className="excel-statusbar-item">
          {gameState?.isPlaying ? '🎯 游戏中' : '就绪'}
        </span>
        {selectedCell && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item">
              选中: {cellAddress}
            </span>
          </>
        )}
        {gameState?.isPlaying && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item" style={{ fontWeight: 'bold' }}>
              得分: {gameState.score.toLocaleString()}
            </span>
            {gameState.combo > 1 && (
              <span className="excel-statusbar-item" style={{ color: '#fcd34d' }}>
                {gameState.combo}x
              </span>
            )}
          </>
        )}
      </div>
      <div className="excel-statusbar-right">
        <button className="excel-statusbar-btn">100%</button>
        <div className="excel-statusbar-divider" />
        <button className="excel-statusbar-btn" title="普通视图">─</button>
        <button className="excel-statusbar-btn" title="分页预览">▫</button>
        <button className="excel-statusbar-btn" title="页面布局">▣</button>
        <div className="excel-statusbar-divider" />
        <span style={{ fontSize: 10 }}>Aim Trainer v2.0</span>
      </div>
    </div>
  );
};