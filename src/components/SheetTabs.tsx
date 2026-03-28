import React from 'react';

interface SheetTabsProps {
  currentSheet: 'hub' | 'game' | 'stats' | 'settings';
  onSwitch: (sheet: 'hub' | 'game' | 'stats' | 'settings') => void;
  isHidden: boolean;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ currentSheet, onSwitch, isHidden }) => {
  const sheets: { id: 'hub' | 'game' | 'stats' | 'settings'; label: string; icon: string }[] = [
    { id: 'hub', label: 'Sheet1', icon: '🎮' },
    { id: 'game', label: 'Sheet2', icon: '🎯' },
    { id: 'stats', label: 'Sheet3', icon: '📊' },
    { id: 'settings', label: 'Sheet4', icon: '⚙️' },
  ];

  return (
    <div className="excel-sheet-bar">
      <div className="excel-sheet-tabs">
        {sheets.map(sheet => (
          <div
            key={sheet.id}
            className={`excel-sheet-tab ${currentSheet === sheet.id ? 'active' : ''}`}
            onClick={() => onSwitch(sheet.id)}
            title={sheet.id === 'hub' ? '游戏中心' : sheet.id === 'game' ? '训练场' : sheet.id === 'stats' ? '统计' : '设置'}
            style={{ opacity: isHidden ? 0.5 : 1 }}
          >
            <span style={{ marginRight: 4 }}>{sheet.icon}</span>
            {sheet.label}
          </div>
        ))}
      </div>
      <div className="excel-sheet-add" title="插入新工作表">+</div>
      <div className="excel-sheet-nav">
        <button className="excel-sheet-nav-btn">◂</button>
        <button className="excel-sheet-nav-btn">▸</button>
      </div>
    </div>
  );
};
