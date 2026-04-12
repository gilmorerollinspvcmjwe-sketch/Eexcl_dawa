import React from 'react';
import type { WorkbookStatusSummary } from '../types';

interface StatusBarProps {
  selectedCell: { row: number; col: number } | null;
  isHidden: boolean;
  COLS: number;
  summary?: WorkbookStatusSummary;
  gameState?: {
    isPlaying: boolean;
    score: number;
    combo: number;
    mode: string;
  };
}

function mapLegacyGameStateToSummary(gameState?: StatusBarProps['gameState']): WorkbookStatusSummary | undefined {
  if (!gameState) return undefined;

  return {
    isPlaying: gameState.isPlaying,
    primaryText: gameState.isPlaying ? '游戏中' : '就绪',
    score: gameState.score,
    secondaryMetric: gameState.combo > 1 ? `${gameState.combo}x` : undefined,
    mode: gameState.mode,
    alertTone: gameState.combo > 1 ? 'success' : 'neutral',
  };
}

export const StatusBar: React.FC<StatusBarProps> = ({ selectedCell, isHidden, COLS, summary, gameState }) => {
  if (isHidden) return null;

  const effectiveSummary = summary ?? mapLegacyGameStateToSummary(gameState);
  const summaryColor =
    effectiveSummary?.alertTone === 'success'
      ? '#16a34a'
      : effectiveSummary?.alertTone === 'warning'
        ? '#d97706'
        : effectiveSummary?.alertTone === 'danger'
          ? '#dc2626'
          : undefined;

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
        <span className="excel-statusbar-item" style={summaryColor ? { color: summaryColor, fontWeight: 600 } : undefined}>
          {effectiveSummary?.primaryText || '就绪'}
        </span>
        {selectedCell && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item">
              选中: {cellAddress}
            </span>
          </>
        )}
        {effectiveSummary?.score !== undefined && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item" style={{ fontWeight: 'bold' }}>
              得分: {effectiveSummary.score.toLocaleString()}
            </span>
          </>
        )}
        {effectiveSummary?.secondaryMetric && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item">{effectiveSummary.secondaryMetric}</span>
          </>
        )}
        {effectiveSummary?.tertiaryMetric && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item">{effectiveSummary.tertiaryMetric}</span>
          </>
        )}
        {effectiveSummary?.mode && (
          <>
            <div className="excel-statusbar-divider" />
            <span className="excel-statusbar-item" style={{ textTransform: 'capitalize' }}>
              {effectiveSummary.mode}
            </span>
          </>
        )}
      </div>
      <div className="excel-statusbar-right">
        <button className="excel-statusbar-btn">100%</button>
        <div className="excel-statusbar-divider" />
        <button className="excel-statusbar-btn" title="普通视图">◀</button>
        <button className="excel-statusbar-btn" title="分页预览">▯</button>
        <button className="excel-statusbar-btn" title="页面布局">▣</button>
        <div className="excel-statusbar-divider" />
        <span style={{ fontSize: 10 }}>Excel 工位娱乐版 v3.0</span>
      </div>
    </div>
  );
};
