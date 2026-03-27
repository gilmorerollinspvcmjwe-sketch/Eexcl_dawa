import React from 'react';

interface SheetTabsProps {
  currentSheet: 'game' | 'stats' | 'settings';
  onSwitch: (sheet: 'game' | 'stats' | 'settings') => void;
  isHidden: boolean;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ currentSheet, onSwitch, isHidden }) => {
  if (isHidden) return null;

  const sheets: { id: 'game' | 'stats' | 'settings'; label: string; icon: string }[] = [
    { id: 'game', label: 'Sheet1', icon: '🎮' },
    { id: 'stats', label: 'Sheet2', icon: '📊' },
    { id: 'settings', label: 'Sheet3', icon: '⚙️' },
  ];

  return (
    <div className="excel-sheet-bar">
      <div className="excel-sheet-tabs">
        {sheets.map(sheet => (
          <button
            key={sheet.id}
            className={`excel-sheet-tab ${currentSheet === sheet.id ? 'active' : ''}`}
            onClick={() => onSwitch(sheet.id)}
            title={sheet.id === 'game' ? '游戏区' : sheet.id === 'stats' ? '统计表' : '设置表'}
          >
            {sheet.label}
          </button>
        ))}
      </div>
      <div className="excel-sheet-add" title="插入新工作表">+</div>
      <div className="excel-sheet-nav">
        <button className="excel-sheet-nav-btn" title="滚动到第一张">◂</button>
        <button className="excel-sheet-nav-btn" title="滚动到最后一张">▸</button>
      </div>
    </div>
  );
};